"use client";

// 호수(석호) 소품 — 2026-08-27 입고 5종 (public/models/props/lake).
//
//   · 나룻배·백조·물등불×2 : 광장을 두르는 물길을 따라 **떠다닌다**
//   · 수상기               : 가장 넓은 물에 정박해 제자리에서 흔들린다
//   · 부두 등불            : 물가 뭍에 서서 물 쪽을 본다
//
// 배치 좌표를 데이터에 굽지 않는다 — isWater / shoreDistAt 로 모듈 로드 때
// 계산하므로 섬·물가가 옮겨 가도 저절로 따라온다. 떠다니는 경로는 각도마다
// "광장에서 걸어 나가 처음 만나는 물 띠"의 가장 깊은 지점을 이어 만든
// 닫힌 Catmull-Rom 고리다 — 다리 밑은 물이 이어지므로(아치 상판은 1.1 위)
// 경로가 그대로 지나간다.

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
import {isWater, shoreDistAt, terrainHeightAt} from "@/lib/villageTerrain";

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
const CURVE =
  LOOP.length >= 8 ? new CatmullRomCurve3(LOOP, true, "centripetal", 0.5) : null;

/**
 * 나룻배 전용 **왕복 구간** — 고리 전체를 돌리면 좁은 물목에서 벽에 닿는다.
 *
 * 배는 2배 확대 후 길이 2.66·폭 1.4 라, 물가거리 1.05 미만인 지점에선 선체가
 * 축대를 파고든다 (2026-08-28 사용자 스크린샷). 백조·물등불은 작아서 고리
 * 전체를 그대로 쓰고, 배만 깊이 1.05 이상이 이어지는 **가장 긴 구간**을 골라
 * 그 안에서 노 저어 갔다 돌아오기를 반복한다.
 */
const BOAT_CURVE: CatmullRomCurve3 | null = (() => {
  const n = LOOP.length;
  if (n < 16) return null;
  const ok = LOOP_DEPTHS.map(d => d >= 1.05);
  // 원형 배열에서 가장 긴 연속 참 구간
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
  // bestLen 0 = 전 구간이 깊어 시작점이 없다 → null 로 두면 고리 전체를 쓴다
  if (bestLen < 12) return null; // 배 띄울 만한 구간이 없어도 고리로 폴백
  // 양끝을 두 칸씩 물려 끝점에서도 벽과 여유를 둔다
  const arc: Vector3[] = [];
  for (let k = 2; k < bestLen - 2; k += 1)
    arc.push(LOOP[(bestStart + k) % n]!);
  return arc.length >= 8
    ? new CatmullRomCurve3(arc, false, "centripetal", 0.5)
    : null;
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

interface DrifterSpec {
  url: string;
  /** 원본(1.9 정규화) → 마을 유닛 배율 */
  scale: number;
  /** 원점(중앙)에서 바닥까지 내려가는 값 (bbox min.y, 음수) */
  minY: number;
  /** 수면 아래 잠기는 깊이 */
  draft: number;
  /** 고리 한 바퀴에 걸리는 초 */
  lapSec: number;
  /** 출발 위치 (0~1) */
  u0: number;
  /** 긴 축이 X 면 true — 진행 방향으로 뱃머리를 돌릴 때 축 보정 */
  longAxisX: boolean;
  /** 방향을 아예 안 트는 소품 (물등불) */
  noYaw?: boolean;
  /** 고리 대신 깊은 구간(BOAT_CURVE)을 왕복 — 몸집 큰 나룻배용 */
  pingPong?: boolean;
}

// 크기는 실물 환산이 아니라 **화면 기준**이다 — 첫 배치(실물 환산 0.72/0.36/0.26)는
// 부감 카메라에서 점으로 보여 "2배는 되어야 할 것 같다"는 피드백을 받았다.
// 흘수(draft)는 **음수(들림)까지 허용** — 석호 수면은 정점 너울로 최대 +0.074 까지
// 솟는데(waterFlow, 골만 0.2배) 선체 바닥이 수면(0.03) 언저리면 마루가 지날 때마다
// "가끔씩 잠기는 배"가 된다 (2026-08-28 사용자 보고 2차). 바닥을 마루보다 살짝
// 위(−0.05 = 수면+0.05)에 두면 물결이 뱃전을 스치는 정도로만 겹친다.
const DRIFTERS: DrifterSpec[] = [
  {
    url: "/models/props/lake/lake-rowboat.glb",
    scale: 1.4,
    minY: -0.234,
    draft: -0.05,
    lapSec: 130, // 왕복이라 편도 시간 — 고리 한 바퀴보다 짧다
    u0: 0.05,
    longAxisX: true,
    pingPong: true
  },
  {
    url: "/models/props/lake/lake-swan.glb",
    scale: 0.7,
    minY: -0.422,
    draft: 0.0,
    lapSec: 210,
    u0: 0.48,
    longAxisX: true
  },
  {
    url: "/models/props/lake/lake-lantern-float.glb",
    scale: 0.5,
    minY: -0.952,
    draft: 0.0,
    lapSec: 380,
    u0: 0.24,
    longAxisX: false,
    noYaw: true
  },
  {
    url: "/models/props/lake/lake-lantern-float.glb",
    scale: 0.5,
    minY: -0.952,
    draft: 0.0,
    lapSec: 380,
    u0: 0.74,
    longAxisX: false,
    noYaw: true
  }
];

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
    const curve = spec.pingPong && BOAT_CURVE ? BOAT_CURVE : CURVE;
    if (!g || !curve) return;
    const t = clock.getElapsedTime();
    let u: number;
    let dirSign = 1;
    if (spec.pingPong && BOAT_CURVE) {
      // 왕복: 0→1→0 삼각파. 돌아올 땐 진행 방향(접선 부호)도 뒤집힌다
      const ph = ((spec.u0 + t / spec.lapSec) % 2) + (t < 0 ? 2 : 0);
      const m = ph % 2;
      u = m < 1 ? m : 2 - m;
      dirSign = m < 1 ? 1 : -1;
      u = Math.min(0.999, Math.max(0.001, u));
    } else {
      u = (((spec.u0 + t / spec.lapSec) % 1) + 1) % 1;
    }
    const p = curve.getPointAt(u);
    const tan = curve.getTangentAt(u).multiplyScalar(dirSign);
    // 출렁임은 **위로만** — 아래로 흔들리면 기껏 올린 흘수선이 도로 물에 잠긴다
    g.position.set(
      p.x,
      baseY + (Math.sin(t * 0.9 + spec.u0 * 17) + 1) * 0.5 * 0.03,
      p.z
    );
    if (!spec.noYaw) {
      const target = spec.longAxisX
        ? Math.atan2(-tan.z, tan.x)
        : Math.atan2(tan.x, tan.z);
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

  if (!CURVE) return null;
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
  // 플로트 바닥을 너울 마루(+0.074)보다 살짝 위에 — 아래 DRIFTERS 흘수 주석 참고
  const baseY = SURFACE_Y + 0.05 + 0.332 * PLANE_SCALE;

  useFrame(({clock}) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.position.y = baseY + (Math.sin(t * 0.8) + 1) * 0.5 * 0.02;
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
