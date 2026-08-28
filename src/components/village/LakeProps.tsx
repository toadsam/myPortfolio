"use client";

// 호수(석호) 소품 — 2026-08-27 입고 5종 (public/models/props/lake).
//
//   · 나룻배   : 가장 깊은 물길 구간을 노 저어 **왕복**한다
//   · 백조     : 나룻배 구간을 뺀 자기 구간을 왕복한다
//   · 물등불×2 : 각자 깊은 물의 소용돌이를 천천히 맴돈다
//   · 수상기   : 가장 넓은 물에 정박해 제자리에서 흔들린다
//   · 부두 등불: 물가 뭍에 서서 물 쪽을 본다
//
// 배치 좌표를 데이터에 굽지 않는다 — isWater / shoreDistAt 로 모듈 로드 때
// 계산하므로 섬·물가가 옮겨 가도 저절로 따라온다.
//
// ─── 서로 통과 방지는 충돌검사가 아니라 **영역 분리**다 (2026-08-28) ─────────
// 처음엔 셋 다 같은 고리를 다른 속도로 돌렸다 — 추월할 때마다 배·백조·등불이
// 서로를 관통했다("서로 물체끼리도 통과하고"). 프레임마다 피하기를 넣는 대신
// 소품마다 겹치지 않는 물을 배정한다: 배 구간·백조 구간은 서로 6칸 이상
// 떨어진 호(arc)고, 등불 소용돌이·수상기 정박지는 그 호들에서 2 이상 떨어진
// 지점만 고른다. 구조적으로 만날 수 없다.

import {useGLTF} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {memo, Suspense, useMemo, useRef} from "react";
import {
  CatmullRomCurve3,
  Vector3,
  type Group,
  type Mesh,
  type Object3D
} from "three";
import {extendGltfLoader} from "@/lib/gltfLoaders";
import {lockSceneMaterials} from "@/lib/villageMaterial";
import {
  BRIDGE_CELLS,
  isWater,
  shoreDistAt,
  terrainHeightAt
} from "@/lib/villageTerrain";

/** VillageScene WATER_SURFACE_Y 와 같은 값 — 석호 수면 높이 */
const SURFACE_Y = 0.03;

const noRaycast = () => undefined;

/** 각도마다 광장 바깥 첫 물 띠의 가장 깊은 지점을 이은 닫힌 고리 */
function buildDriftLoop(): {pts: Vector3[]; depths: number[]} {
  const pts: Vector3[] = [];
  const N = 120;
  for (let i = 0; i < N; i += 1) {
    const a = (i / N) * Math.PI * 2;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    let r0 = 0;
    for (let r = 5; r < 26; r += 0.2) {
      if (isWater(dx * r, dz * r)) {
        r0 = r;
        break;
      }
    }
    if (!r0) continue;
    let r1 = r0;
    while (r1 < 30 && isWater(dx * (r1 + 0.2), dz * (r1 + 0.2))) r1 += 0.2;
    let best = (r0 + r1) / 2;
    let bestDepth = -1;
    for (let r = r0; r <= r1 + 1e-6; r += 0.2) {
      const d = shoreDistAt(dx * r, dz * r);
      if (d > bestDepth) {
        bestDepth = d;
        best = r;
      }
    }
    pts.push(new Vector3(dx * best, 0, dz * best));
  }
  // 이웃 평균 두 번으로 물가 요철을 편다 — 다듬은 점이 얕아지면 원점을 지킨다
  for (let pass = 0; pass < 2; pass += 1) {
    const smoothed = pts.map((p, i) => {
      const a = pts[(i + pts.length - 1) % pts.length];
      const b = pts[(i + 1) % pts.length];
      const q = new Vector3()
        .addVectors(a, b)
        .multiplyScalar(0.25)
        .addScaledVector(p, 0.5);
      return isWater(q.x, q.z) && shoreDistAt(q.x, q.z) > 0.45 ? q : p.clone();
    });
    pts.length = 0;
    pts.push(...smoothed);
  }
  return {pts, depths: pts.map(p => shoreDistAt(p.x, p.z))};
}

const {pts: LOOP, depths: LOOP_DEPTHS} = buildDriftLoop();
const N_LOOP = LOOP.length;

/** 원형 배열에서 가장 긴 연속 참 구간 (전부 참이면 전체) */
function longestRun(ok: boolean[]): {start: number; len: number} {
  const n = ok.length;
  let bestStart = -1;
  let bestLen = 0;
  for (let s = 0; s < n; s += 1) {
    if (!ok[s] || ok[(s + n - 1) % n]) continue; // 구간의 시작점에서만 잰다
    let len = 0;
    while (len < n && ok[(s + len) % n]) len += 1;
    if (len > bestLen) {
      bestLen = len;
      bestStart = s;
    }
  }
  if (bestStart < 0 && n > 0 && ok.every(Boolean)) return {start: 0, len: n};
  return {start: bestStart, len: bestLen};
}

interface ArcInfo {
  curve: CatmullRomCurve3;
  startIdx: number;
  count: number;
  pts: Vector3[];
}

/**
 * 고리에서 깊이 minDepth 이상이 이어지는 가장 긴 호를 잘라 열린 곡선으로.
 * 왕복 반환점에서는 소품이 제자리 선회하며 몸 길이만큼 쓸고 돌므로, 양끝을
 * endDepth(선회 반경)가 나올 때까지 안으로 물린다 — 이 물림이 없어서 배가
 * 좁은 물목 끝에서 축대에 뱃머리를 박았다 (2026-08-28 사용자 스크린샷 2차).
 */
function buildArc(
  minDepth: number,
  endDepth: number,
  excluded?: Set<number>,
  minLen = 14
): ArcInfo | null {
  if (N_LOOP < 16) return null;
  const ok = LOOP_DEPTHS.map((d, i) => d >= minDepth && !excluded?.has(i));
  const {start, len} = longestRun(ok);
  if (len < minLen) return null;
  let a = 2;
  let b = len - 3;
  const cap = Math.floor(len / 4);
  while (a - 2 < cap && (LOOP_DEPTHS[(start + a) % N_LOOP] ?? 0) < endDepth)
    a += 1;
  while (len - 3 - b < cap && (LOOP_DEPTHS[(start + b) % N_LOOP] ?? 0) < endDepth)
    b -= 1;
  if (b - a + 1 < 6) return null;
  const pts: Vector3[] = [];
  for (let k = a; k <= b; k += 1) pts.push(LOOP[(start + k) % N_LOOP]!);
  return {
    curve: new CatmullRomCurve3(pts, false, "centripetal", 0.5),
    startIdx: (start + a) % N_LOOP,
    count: pts.length,
    pts
  };
}

/** (x,z) 가 다리 칸에서 r 안쪽인가 — 교대(橋臺) 석재는 물가거리에 안 잡힌다 */
function nearBridge(x: number, z: number, r: number): boolean {
  for (const c of BRIDGE_CELLS) {
    const dx = x - c.x;
    const dz = z - c.z;
    if (dx * dx + dz * dz < r * r) return true;
  }
  return false;
}

/** 다리에서 r 안쪽인 고리 인덱스 집합 */
function bridgeZone(r: number): Set<number> {
  const zone = new Set<number>();
  LOOP.forEach((p, i) => {
    if (nearBridge(p.x, p.z, r)) zone.add(i);
  });
  return zone;
}

/**
 * 나룻배 호 — 2배 배(길이 2.66·반길이 1.33)는 **다리 밑을 못 지난다** —
 * 교대 석재가 물속까지 내려와 있는데 물가거리(shoreDistAt)는 지형만 봐서
 * 다리를 모른다. 스크린샷의 "배가 벽을 파고듦"의 벽이 바로 다리 교대였다
 * (2026-08-28 3차). 실측: 물길 깊이는 전 구간 1.05 이상이고 다리가 6개
 * 등간격이라, 다리 반경 2.0 을 제외하면 13칸(≈13유닛) 구간이 6개 나온다 —
 * 배는 그중 하나(다리와 다리 사이)를 왕복한다. 예전엔 구간이 안 나오면
 * 조용히 고리 전체로 폴백해 벽 파고듦이 재현됐다 — 정 안 나오면 가장 깊은
 * 지점에 정박(소용돌이)한다.
 */
const BOAT_ARC: ArcInfo | null = (() => {
  const zone = bridgeZone(2.0);
  for (const th of [1.05, 0.9]) {
    const arc = buildArc(th, th, zone, 12);
    if (arc) return arc;
  }
  return null;
})();

/** 백조 호 — 나룻배 호(양옆 6칸 여유)와 다리 1.6 을 뺀 나머지에서 고른다 */
const SWAN_ARC: ArcInfo | null = (() => {
  const zone = bridgeZone(1.6);
  if (BOAT_ARC)
    for (let k = -6; k < BOAT_ARC.count + 6; k += 1)
      zone.add((((BOAT_ARC.startIdx + k) % N_LOOP) + N_LOOP) % N_LOOP);
  for (const th of [0.75, 0.6]) {
    const arc = buildArc(th, th + 0.25, zone);
    if (arc) return arc;
  }
  return null;
})();

/** 격자 훑기로 가장 깊은 물 지점 (avoid 점들에서 avoidR 안쪽은 제외) */
function deepestSpot(
  avoid: Vector3[],
  avoidR: number
): {x: number; z: number; depth: number} {
  let best = {x: 0, z: 0, depth: -1};
  for (let x = -38; x <= 38; x += 0.7) {
    for (let z = -38; z <= 38; z += 0.7) {
      if (!isWater(x, z)) continue;
      if (nearBridge(x, z, 1.8)) continue; // 교대 석재 옆에서 맴돌면 파고든다
      const d = shoreDistAt(x, z);
      if (d <= best.depth) continue;
      let blocked = false;
      for (const p of avoid) {
        const ddx = p.x - x;
        const ddz = p.z - z;
        if (ddx * ddx + ddz * ddz < avoidR * avoidR) {
          blocked = true;
          break;
        }
      }
      if (!blocked) best = {x, z, depth: d};
    }
  }
  return best;
}

/** 수상기 정박지 — 떠다니는 고리에서 2.2 이상 떨어진 가장 깊은 물 */
const PLANE_SPOT = deepestSpot(LOOP, 2.2);
/** 정박지 여유에 맞춰 크기를 정한다 (원본 길이 1.9 유닛, 화면 기준 2배 상향) */
const PLANE_SCALE = Math.min(2.0, Math.max(0.7, (PLANE_SPOT.depth - 0.3) / 0.95));

/** 물등불 소용돌이 자리 — 배·백조 호와 수상기에서 2.4 이상 떨어진 깊은 물 2곳 */
const LANTERN_SPOTS: {x: number; z: number; depth: number}[] = (() => {
  const avoid: Vector3[] = [
    ...(BOAT_ARC ? BOAT_ARC.pts : []),
    ...(SWAN_ARC ? SWAN_ARC.pts : []),
    new Vector3(PLANE_SPOT.x, 0, PLANE_SPOT.z)
  ];
  const spots: {x: number; z: number; depth: number}[] = [];
  for (let i = 0; i < 2; i += 1) {
    const s = deepestSpot(
      [...avoid, ...spots.map(p => new Vector3(p.x, 0, p.z))],
      2.4
    );
    if (s.depth >= 0.6) spots.push(s);
  }
  return spots;
})();

/** 부두 등불 자리 — 높이 0 물가 뭍 중 앞 물이 가장 깊은 곳. 물 쪽 방향도 같이 */
function dockSpot(): {x: number; z: number; yaw: number; depth: number} {
  let best = {x: 0, z: 0, yaw: 0, depth: -1};
  for (let x = -36; x <= 36; x += 0.6) {
    for (let z = -36; z <= 36; z += 0.6) {
      if (isWater(x, z)) continue;
      if (Math.abs(terrainHeightAt(x, z)) > 0.15) continue;
      for (let k = 0; k < 8; k += 1) {
        const a = (k / 8) * Math.PI * 2;
        const wx = x + Math.sin(a) * 0.9;
        const wz = z + Math.cos(a) * 0.9;
        if (!isWater(wx, wz)) continue;
        const d = shoreDistAt(wx + Math.sin(a) * 0.8, wz + Math.cos(a) * 0.8);
        if (d > best.depth) best = {x, z, yaw: a, depth: d};
      }
    }
  }
  return best;
}
const DOCK_SPOT = dockSpot();

/** 호 왕복 또는 제자리 소용돌이 — 소품마다 전용 영역 하나씩 */
type Motion =
  | {kind: "arc"; curve: CatmullRomCurve3; lapSec: number}
  | {kind: "eddy"; x: number; z: number; r: number; periodSec: number};

function arcMotion(arc: ArcInfo, unitsPerSec: number): Motion {
  return {
    kind: "arc",
    curve: arc.curve,
    lapSec: Math.max(40, arc.curve.getLength() / unitsPerSec)
  };
}

function eddyMotion(
  x: number,
  z: number,
  depth: number,
  periodSec: number
): Motion {
  return {
    kind: "eddy",
    x,
    z,
    r: Math.min(0.55, Math.max(0.2, depth - 0.35)),
    periodSec
  };
}

interface DrifterSpec {
  url: string;
  /** 원본(1.9 정규화) → 마을 유닛 배율 */
  scale: number;
  /** 원점(중앙)에서 바닥까지 내려가는 값 (bbox min.y, 음수) */
  minY: number;
  /** 수면 아래 잠기는 깊이 */
  draft: number;
  /** 출발 위상 (0~1) */
  u0: number;
  /** 긴 축이 X 면 true — 진행 방향으로 뱃머리를 돌릴 때 축 보정 */
  longAxisX: boolean;
  /** 방향을 아예 안 트는 소품 (물등불) */
  noYaw?: boolean;
  /**
   * 왕복 복귀 때 머리를 안 돌리고 **뒤로 노 저어** 물러난다 (나룻배).
   * 제자리 180° 선회는 반길이 1.33 이 옆으로 쓸며 물가·교대를 파고든다.
   */
  rowBack?: boolean;
  motion: Motion;
}

// 크기는 실물 환산이 아니라 **화면 기준**이다 — 첫 배치(실물 환산 0.72/0.36/0.26)는
// 부감 카메라에서 점으로 보여 "2배는 되어야 할 것 같다"는 피드백을 받았다.
//
// ─── 흘수(draft)는 반드시 **양수** — 선체가 수면을 뚫어야 떠 보인다 ──────────
// 석호 수면은 너울로 +0.074(마루)~−0.015(골) 사이를 오간다. 잠김이 싫다고
// 바닥을 수면 위(−0.05)로 올렸더니 골 지날 때마다 배 밑으로 하늘이 보이는
// **공중 부양**이 됐다 (2026-08-28 사용자 스크린샷 3차). 정답은 골에서도 keel 이
// 물속에 남는 최소 잠김: 흘수 ≥ 골 깊이 0.015 + 출렁임 상한. 예전 "절반 잠김"은
// 흘수가 과해서가 아니라 크기를 2배 키울 때 흘수를 같이 안 키운 탓이다.
// 출렁임은 위로만((sin+1)/2), 진폭 0.015 — 크면 골에서 다시 뜬다.
const DRIFTERS: DrifterSpec[] = (() => {
  const list: DrifterSpec[] = [];
  if (N_LOOP >= 8) {
    let deepest = 0;
    for (let i = 1; i < N_LOOP; i += 1)
      if ((LOOP_DEPTHS[i] ?? -1) > (LOOP_DEPTHS[deepest] ?? -1)) deepest = i;
    const anchor = LOOP[deepest]!;
    const anchorDepth = LOOP_DEPTHS[deepest] ?? 0;
    list.push({
      url: "/models/props/lake/lake-rowboat.glb",
      scale: 1.4,
      minY: -0.234,
      draft: 0.04,
      u0: 0.05,
      longAxisX: true,
      rowBack: true,
      motion: BOAT_ARC
        ? arcMotion(BOAT_ARC, 0.11)
        : eddyMotion(anchor.x, anchor.z, anchorDepth, 70)
    });
    const swanFallback = BOAT_ARC
      ? deepestSpot(BOAT_ARC.pts, 2.0)
      : {x: anchor.x, z: anchor.z, depth: anchorDepth};
    list.push({
      url: "/models/props/lake/lake-swan.glb",
      scale: 0.7,
      minY: -0.422,
      draft: 0.05,
      u0: 0.48,
      longAxisX: true,
      motion: SWAN_ARC
        ? arcMotion(SWAN_ARC, 0.07)
        : eddyMotion(swanFallback.x, swanFallback.z, swanFallback.depth, 90)
    });
  }
  LANTERN_SPOTS.forEach((s, i) => {
    list.push({
      url: "/models/props/lake/lake-lantern-float.glb",
      scale: 0.5,
      minY: -0.952,
      draft: 0.03,
      u0: i === 0 ? 0.24 : 0.74,
      longAxisX: false,
      noYaw: true,
      motion: eddyMotion(s.x, s.z, s.depth, 90 + i * 25)
    });
  });
  return list;
})();

/** GLB 씬 준비 — 마을 공통 재질 잠금 + 레이캐스트 차단(히트박스 원칙) */
function prepare(scene: Object3D, clone: boolean): Object3D {
  const root = clone ? scene.clone(true) : scene;
  lockSceneMaterials(root);
  root.traverse(obj => {
    const mesh = obj as Mesh;
    if (mesh.isMesh) {
      mesh.raycast = noRaycast;
      mesh.castShadow = true;
    }
  });
  return root;
}

function Drifter({spec, cloneScene}: {spec: DrifterSpec; cloneScene: boolean}) {
  const {scene} = useGLTF(spec.url, true, true, extendGltfLoader);
  const root = useMemo(() => prepare(scene, cloneScene), [scene, cloneScene]);
  const groupRef = useRef<Group | null>(null);
  const yawRef = useRef<number | null>(null);
  const baseY = SURFACE_Y - spec.draft - spec.minY * spec.scale;

  useFrame(({clock}, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const m = spec.motion;
    const t = clock.getElapsedTime();
    let px: number;
    let pz: number;
    let hx: number;
    let hz: number;
    if (m.kind === "arc") {
      // 왕복: 0→1→0 삼각파. 돌아올 땐 진행 방향(접선 부호)도 뒤집힌다
      const ph = (spec.u0 + t / m.lapSec) % 2;
      const u = Math.min(0.999, Math.max(0.001, ph < 1 ? ph : 2 - ph));
      const dirSign = spec.rowBack ? 1 : ph < 1 ? 1 : -1;
      const p = m.curve.getPointAt(u);
      const tan = m.curve.getTangentAt(u).multiplyScalar(dirSign);
      px = p.x;
      pz = p.z;
      hx = tan.x;
      hz = tan.z;
    } else {
      const a = spec.u0 * Math.PI * 2 + (t / m.periodSec) * Math.PI * 2;
      px = m.x + Math.cos(a) * m.r;
      pz = m.z + Math.sin(a) * m.r;
      hx = -Math.sin(a);
      hz = Math.cos(a);
    }
    g.position.set(
      px,
      baseY + (Math.sin(t * 0.9 + spec.u0 * 17) + 1) * 0.5 * 0.015,
      pz
    );
    if (!spec.noYaw) {
      const target = spec.longAxisX
        ? Math.atan2(-hz, hx)
        : Math.atan2(hx, hz);
      // 왕복 반환점에서 순간 반전하지 않게 최단 회전으로 부드럽게 돈다
      if (yawRef.current === null) yawRef.current = target;
      let d = target - yawRef.current;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      yawRef.current += d * Math.min(1, delta * 1.8);
      g.rotation.y = yawRef.current;
    } else {
      g.rotation.y = Math.sin(t * 0.11 + spec.u0 * 9) * 0.6; // 물등불은 느리게 맴돈다
    }
    g.rotation.z = Math.sin(t * 0.7 + spec.u0 * 11) * 0.03; // 잔물결 좌우 흔들림
    g.rotation.x = Math.sin(t * 0.5 + spec.u0 * 5) * 0.02;
  });

  return (
    <group ref={groupRef} scale={spec.scale}>
      <primitive object={root} />
    </group>
  );
}

/** 수상기 — 정박. 제자리에서 흔들리고 아주 천천히 머리를 돌린다 */
function Seaplane() {
  const {scene} = useGLTF(
    "/models/props/lake/lake-seaplane.glb",
    true,
    true,
    extendGltfLoader
  );
  const root = useMemo(() => prepare(scene, false), [scene]);
  const groupRef = useRef<Group | null>(null);
  // 플로트도 2cm 는 물에 잠근다 — DRIFTERS 흘수 주석 참고 (수면 위는 공중 부양)
  const baseY = SURFACE_Y - 0.02 + 0.332 * PLANE_SCALE;

  useFrame(({clock}) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.position.y = baseY + (Math.sin(t * 0.8) + 1) * 0.5 * 0.015;
    g.rotation.y = 0.8 + Math.sin(t * 0.07) * 0.1;
    g.rotation.z = Math.sin(t * 0.6) * 0.02;
  });

  if (PLANE_SPOT.depth < 1.2) return null; // 세울 만한 넓은 물이 없다
  return (
    <group
      ref={groupRef}
      position={[PLANE_SPOT.x, baseY, PLANE_SPOT.z]}
      scale={PLANE_SCALE}
    >
      <primitive object={root} />
    </group>
  );
}

/** 부두 등불 — 물가 뭍에 고정, 물 쪽을 본다 */
function DockLantern() {
  const {scene} = useGLTF(
    "/models/props/lake/lake-lantern-dock.glb",
    true,
    true,
    extendGltfLoader
  );
  const root = useMemo(() => prepare(scene, false), [scene]);
  if (DOCK_SPOT.depth < 0.4) return null;
  const scale = 1.2;
  const y = terrainHeightAt(DOCK_SPOT.x, DOCK_SPOT.z) + 0.455 * scale - 0.02;
  return (
    <group
      position={[DOCK_SPOT.x, y, DOCK_SPOT.z]}
      rotation={[0, DOCK_SPOT.yaw, 0]}
      scale={scale}
    >
      <primitive object={root} />
    </group>
  );
}

function LakePropsImpl() {
  return (
    <Suspense fallback={null}>
      {DRIFTERS.map((spec, i) => (
        <Drifter
          key={`${spec.url}-${spec.u0}`}
          spec={spec}
          cloneScene={
            i > 0 && DRIFTERS.slice(0, i).some(s => s.url === spec.url)
          }
        />
      ))}
      <Seaplane />
      <DockLantern />
    </Suspense>
  );
}

// 정적 소품 — 부모(VillageScene)가 NPC 틱마다 재렌더돼도 여기는 건너뛴다
export const LakeProps = memo(LakePropsImpl);
