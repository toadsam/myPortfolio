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
function buildDriftLoop(): Vector3[] {
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
  return pts;
}

const LOOP = buildDriftLoop();
const CURVE =
  LOOP.length >= 8 ? new CatmullRomCurve3(LOOP, true, "centripetal", 0.5) : null;

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
}

// 크기는 실물 환산이 아니라 **화면 기준**이다 — 첫 배치(실물 환산 0.72/0.36/0.26)는
// 부감 카메라에서 점으로 보여 "2배는 되어야 할 것 같다"는 피드백을 받았다
// (2026-08-28). 흘수(draft)도 그때 같이 줄였다 — 0.07 은 석호 너울 마루(+0.07)와
// 겹쳐 뱃전 절반이 잠겨 보였다. 선체 바닥이 수면 바로 아래(0.02~0.06)면 충분하다.
const DRIFTERS: DrifterSpec[] = [
  {
    url: "/models/props/lake/lake-rowboat.glb",
    scale: 1.4,
    minY: -0.234,
    draft: 0.02,
    lapSec: 300,
    u0: 0.05,
    longAxisX: true
  },
  {
    url: "/models/props/lake/lake-swan.glb",
    scale: 0.7,
    minY: -0.422,
    draft: 0.04,
    lapSec: 210,
    u0: 0.48,
    longAxisX: true
  },
  {
    url: "/models/props/lake/lake-lantern-float.glb",
    scale: 0.5,
    minY: -0.952,
    draft: 0.06,
    lapSec: 380,
    u0: 0.24,
    longAxisX: false,
    noYaw: true
  },
  {
    url: "/models/props/lake/lake-lantern-float.glb",
    scale: 0.5,
    minY: -0.952,
    draft: 0.06,
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
  const baseY = SURFACE_Y - spec.draft - spec.minY * spec.scale;

  useFrame(({clock}) => {
    const g = groupRef.current;
    if (!g || !CURVE) return;
    const t = clock.getElapsedTime();
    const u = (((spec.u0 + t / spec.lapSec) % 1) + 1) % 1;
    const p = CURVE.getPointAt(u);
    const tan = CURVE.getTangentAt(u);
    g.position.set(p.x, baseY + Math.sin(t * 0.9 + spec.u0 * 17) * 0.018, p.z);
    if (!spec.noYaw) {
      g.rotation.y = spec.longAxisX
        ? Math.atan2(-tan.z, tan.x)
        : Math.atan2(tan.x, tan.z);
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
  const baseY = SURFACE_Y - 0.03 + 0.332 * PLANE_SCALE;

  useFrame(({clock}) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.position.y = baseY + Math.sin(t * 0.8) * 0.014;
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
