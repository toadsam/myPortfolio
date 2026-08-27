"use client";

/**
 * 의뢰 공방 — 마을 지하에 숨겨진 제작소.
 *
 * 기존 실내(Lab/Workshop/Archive/Post)와 같은 규칙으로 만든다: **공간은 GLB 없이**
 * 상자·원기둥·평면으로 짜고, 라벨은 <Html>, 시점은 OrbitControls.
 *
 * NPC 다섯 식구(2026-08-27, 합 1.7MB)와 가구 6종(같은 날, 합 3.6MB)은 예외다.
 * 원래 "GLB 0개" 원칙으로 절차 인형·상자 가구를 세웠는데 — /atelier 가 마을
 * 20.7MB 없이 단독으로 서는 게 전제였다 — 최적화 후 방 전체가 5MB 대라
 * 그 전제를 깨지 않고도 진짜 몸·진짜 가구를 세울 수 있게 됐다. 로딩되는 동안과
 * 실패 시엔 여전히 절차 지오메트리가 폴백으로 선다(DollBody·*Doll 컴포넌트).
 * **마을 GLB(건물·프롭)는 여전히 하나도 안 끌어온다** — 가구는 전용 폴더
 * (props/atelier/, 텍스처 1024 예산)의 실내용이다.
 *
 * 식구들은 방을 걸어 다닌다(2026-08-27, "방 안 보행" 절 참고): 평소엔 자기
 * 작업대 근처를 배회하고, 클릭하면 손님 앞까지 걸어온 뒤 대화창이 열리며,
 * 릴레이 설문에서는 카메라가 접수대에 고정된 채 불린 식구가 접수대로 걸어온다.
 * 마주침(E-4)도 한쪽이 실제로 상대 자리까지 걸어가서 시작한다.
 * 길에 가구가 끼면 모서리를 경유해 돌아가고(detourPoint), 손님이 처음
 * 누군가에게 말을 걸면 전원 자기 작업대에 붙어 일하는 "근무 모드"가 된다.
 *
 * 팔레트는 마을 UI 간판 언어를 따른다 — 랜턴 #ff9d38, 간판금 #e2c078, 밤하늘 #0b1626.
 */

import {ContactShadows, Html, OrbitControls, useGLTF} from "@react-three/drei";
import {Canvas, useFrame} from "@react-three/fiber";
import {motion} from "framer-motion";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef
} from "react";
import {
  AdditiveBlending,
  Group,
  MathUtils,
  Mesh,
  PointLight,
  Vector3
} from "three";
import {atelierNpcs} from "@/data/atelierRoster";
import {
  NpcCharacter,
  type NpcMoveState
} from "@/components/village/NpcCharacter";
import {extendGltfLoader} from "@/lib/gltfLoaders";
import {requestNpcEncounter} from "@/lib/liveApi";
import {lockSceneMaterials} from "@/lib/villageMaterial";
import type {NPCData} from "@/types/portfolio";

const LANTERN = "#ff9d38";
const GOLD = "#e2c078";
const NIGHT = "#0b1626";
const WOOD = "#4a3220";
const WOOD_DARK = "#2e1e12";

/* ────────────────────────────── NPC 인형 ────────────────────────────── */

// 절차 인형 — GLB 가 오기 전 폴백, model 이 없는 NPC 의 본체.
// (2026-08-27 까지는 이게 다섯 식구의 본체였다)
function DollBody({npc, glow}: {npc: NPCData; glow: number}) {
  return (
    <>
      {/* 몸통 */}
      <mesh castShadow position={[0, 0.62, 0]}>
        <capsuleGeometry args={[0.26, 0.62, 6, 14]} />
        <meshStandardMaterial
          color={npc.color}
          emissive={npc.color}
          emissiveIntensity={glow * 0.4}
          roughness={0.55}
        />
      </mesh>
      {/* 앞치마 — 공방 식구라는 표식 */}
      <mesh position={[0, 0.5, 0.24]}>
        <boxGeometry args={[0.34, 0.42, 0.04]} />
        <meshStandardMaterial color={npc.accessoryColor} roughness={0.75} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.23, 20, 16]} />
        <meshStandardMaterial
          color="#f3e6c8"
          emissive={npc.color}
          emissiveIntensity={glow * 0.25}
          roughness={0.6}
        />
      </mesh>
      {/* 눈 */}
      {[-0.085, 0.085].map(x => (
        <mesh key={x} position={[x, 1.25, 0.2]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshBasicMaterial color={NIGHT} />
        </mesh>
      ))}
      {/* 팔 */}
      {[-0.32, 0.32].map(x => (
        <mesh key={x} castShadow position={[x, 0.66, 0]}>
          <capsuleGeometry args={[0.075, 0.34, 4, 8]} />
          <meshStandardMaterial color={npc.color} roughness={0.6} />
        </mesh>
      ))}
    </>
  );
}

/* ────────────────────── 가구 GLB (2026-08-27) ────────────────────── */
//
// Meshy 가구 6종(props/raw/atelier/, optimize 후 합 3.6MB). 캐릭터와 같은 규칙:
// 로딩되는 동안과 실패 시엔 기존 절차 지오메트리가 폴백으로 선다.
// 발광부(모니터 화면·서버 LED·랜턴 불빛)는 에셋에 없다 — 바닥 빛무리·pointLight
// 등을 코드가 그대로 얹는다. 텍스처 예산은 optimize 의 atelier 카테고리(1024).

const noopRaycast = () => {};

// 실측 배율표. 모델은 전부 **중심 원점**이라 y 를 |minY|×scale 만큼 들어
// 바닥에 세운다 (실측 예: reception-desk X 1.902 · minY −0.330).
const FURNITURE = {
  "reception-desk": {scale: 1.79, lift: 0.33},
  "workbench-planner": {scale: 1.05, lift: 0.871},
  "workbench-designer": {scale: 1.15, lift: 0.714},
  "workbench-frontend": {scale: 1.15, lift: 0.678},
  "server-rack": {scale: 1.0, lift: 0.952},
  "wall-lantern": {scale: 0.55, lift: 0} // 매달아 쓰므로 자리에서 y 를 직접 준다
} as const;

function AtelierProp({
  file,
  yOffset = 0
}: {
  file: keyof typeof FURNITURE;
  yOffset?: number;
}) {
  const spec = FURNITURE[file];
  const {scene} = useGLTF(
    `/models/props/atelier/${file}.glb`,
    true,
    true,
    extendGltfLoader
  );
  const cloned = useMemo(() => {
    const copy = scene.clone(true);
    lockSceneMaterials(copy);
    copy.traverse(o => {
      if (o instanceof Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.raycast = noopRaycast; // 포인터는 투명 히트박스 몫 (마을 규칙)
      }
    });
    return copy;
  }, [scene]);
  return (
    <primitive
      object={cloned}
      position={[0, spec.lift * spec.scale + yOffset, 0]}
      scale={spec.scale}
    />
  );
}

/* ────────────────────── 방 안 보행 (2026-08-27) ────────────────────── */
//
// 공방 식구가 방을 걸어 다닌다. 마을 villageWalk 를 끌어오지 않는 이유:
// 이 방은 평지 하나에 가구 다섯 점이 전부라, 경계 사각형 + 가구 발자국 AABB 의
// 축-슬라이드면 충분하다. 가구 상자는 **반지름 팽창 없이** 발자국만 막고,
// 작업대의 방 안쪽 모서리는 0.3 물러서 둔다 — 팀원 자리(±3.6)가 상판 끝
// (±3.45) 을 0.15 겹치고 서는 그림이라, 실측 발자국을 그대로 막으면 자기
// 자리가 '가구 안'이 되어 첫걸음부터 막힌다(실제로 갇혔다).

const WALK_SPEED = 1.55;
const RUN_SPEED = 2.6; // 부르면 뛰어온다 — 남은 거리가 멀 때만

/** 설문 릴레이에 불려온 식구가 서는 곳 — 접수대 옆, 도안 옆자리 */
const RELAY_SPOT: [number, number] = [1.5, 1.15];
/** 릴레이 카메라가 겨누는 점 — 도안(0, 0.6)과 RELAY_SPOT 의 사이 */
const RELAY_FOCUS: [number, number, number] = [0.75, 0, 0.95];

// 벽 안쪽 + 계단(z 6.1~) 앞을 남긴 보행 가능 사각형
const WALK_BOUNDS = {minX: -8.2, maxX: 8.2, minZ: -6.3, maxZ: 4.6};
// 접수대 + 작업대 4개의 발자국 [x1, x2, z1, z2]
const SOLIDS: [number, number, number, number][] = [
  [-1.7, 1.7, -0.88, 0.18],
  [-6.05, -3.75, -3.25, -2.15],
  [-6.05, -3.75, 1.35, 2.45],
  [3.75, 6.05, -3.25, -2.15],
  [3.75, 6.05, 1.35, 2.45]
];

function walkable(x: number, z: number) {
  if (
    x < WALK_BOUNDS.minX ||
    x > WALK_BOUNDS.maxX ||
    z < WALK_BOUNDS.minZ ||
    z > WALK_BOUNDS.maxZ
  )
    return false;
  return !SOLIDS.some(
    ([x1, x2, z1, z2]) => x > x1 && x < x2 && z > z1 && z < z2
  );
}

/** a→b 선분이 상자를 지나가나 — 슬랩 판정. 상자를 줄이거나 늘리지 않는다:
 * 0.03 만 줄여도 "선분은 통과인데 발밑 판정은 막히는" 30mm 유령 통로가 생겨,
 * NPC 가 그 껍질에 몸을 박고 떨었다(퍼즈 시뮬레이션에서 실제 재현). */
function segHitsBox(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  box: [number, number, number, number]
): boolean {
  const [x1, x2, z1, z2] = box;
  const dx = bx - ax;
  const dz = bz - az;
  let t0 = 0;
  let t1 = 1;
  if (Math.abs(dx) < 1e-9) {
    if (ax <= x1 || ax >= x2) return false;
  } else {
    let u0 = (x1 - ax) / dx;
    let u1 = (x2 - ax) / dx;
    if (u0 > u1) [u0, u1] = [u1, u0];
    t0 = Math.max(t0, u0);
    t1 = Math.min(t1, u1);
    if (t0 > t1) return false;
  }
  if (Math.abs(dz) < 1e-9) {
    if (az <= z1 || az >= z2) return false;
  } else {
    let u0 = (z1 - az) / dz;
    let u1 = (z2 - az) / dz;
    if (u0 > u1) [u0, u1] = [u1, u0];
    t0 = Math.max(t0, u0);
    t1 = Math.min(t1, u1);
    if (t0 > t1) return false;
  }
  return true;
}

const segClear = (ax: number, az: number, bx: number, bz: number) =>
  !SOLIDS.some(b => segHitsBox(ax, az, bx, bz, b));

/**
 * 우회 경로 — 가구 모서리(0.4 물러난 점)를 노드로 한 가시성 그래프.
 * 모서리끼리의 가시성·거리는 정적이라 모듈 로드 때 한 번만 계산한다.
 *
 * 탐욕(막는 상자 하나의 모서리만 보기)으로는 안 됐다: ① 목표가 가구
 * 정반대편이면 축-슬라이드가 dx=0 지점에서 제자리걸음이 되고(릴레이에 불린
 * 체리가 접수대 뒤에서 영원히 걸었다 — 2026-08-27 실제 증상), ② 한 수만
 * 내다보면 "모서리→목표"가 마저 막히는 모서리 둘 사이에서 진동한다(무작위
 * 퍼즈 300회 중 5회). 목표까지의 최단거리를 그래프로 다 풀어야 진동이 없다 —
 * 상자 5개·모서리 20개라 막혔을 때만 도는 완화 루프는 공짜나 다름없다.
 */
const NAV_MARGIN = 0.4;
const NAV_CORNERS: [number, number][] = SOLIDS.flatMap(
  ([x1, x2, z1, z2]) =>
    [
      [x1 - NAV_MARGIN, z1 - NAV_MARGIN],
      [x2 + NAV_MARGIN, z1 - NAV_MARGIN],
      [x1 - NAV_MARGIN, z2 + NAV_MARGIN],
      [x2 + NAV_MARGIN, z2 + NAV_MARGIN]
    ] as [number, number][]
).filter(([x, z]) => walkable(x, z));

const NAV_EDGES: number[][] = NAV_CORNERS.map((a, i) =>
  NAV_CORNERS.map((b, j) =>
    i !== j && segClear(a[0], a[1], b[0], b[1])
      ? Math.hypot(a[0] - b[0], a[1] - b[1])
      : Infinity
  )
);

/** 목표까지의 직선이 가구에 막히면, 최단 경로의 다음 모서리를 돌려준다. */
function detourPoint(
  px: number,
  pz: number,
  tx: number,
  tz: number
): [number, number] | null {
  if (segClear(px, pz, tx, tz)) return null; // 직행
  const n = NAV_CORNERS.length;
  // 각 모서리에서 목표까지의 최단거리 (목표 쪽에서 역방향 완화)
  const toTarget = NAV_CORNERS.map(([cx, cz]) =>
    segClear(cx, cz, tx, tz) ? Math.hypot(tx - cx, tz - cz) : Infinity
  );
  for (let pass = 0; pass < n; pass += 1) {
    let changed = false;
    for (let i = 0; i < n; i += 1)
      for (let j = 0; j < n; j += 1) {
        const via = NAV_EDGES[i]![j]! + toTarget[j]!;
        if (via < toTarget[i]!) {
          toTarget[i] = via;
          changed = true;
        }
      }
    if (!changed) break;
  }
  // 지금 자리에서 보이는 모서리 중 (여기→모서리 + 모서리→목표) 최소
  let best: [number, number] | null = null;
  let bestCost = Infinity;
  for (let i = 0; i < n; i += 1) {
    if (toTarget[i] === Infinity) continue;
    const [cx, cz] = NAV_CORNERS[i]!;
    const dp = Math.hypot(cx - px, cz - pz);
    if (dp < 0.12) continue; // 이미 이 모서리 — 다음 모서리를 고르게
    if (!segClear(px, pz, cx, cz)) continue;
    const cost = dp + toTarget[i]!;
    if (cost < bestCost) {
      bestCost = cost;
      best = [cx, cz];
    }
  }
  return best;
}

/** 공방 캐릭터 확대 배율 — 마을 키(1.2)로는 실내 가구에 비해 작아 보인다 */
const ATELIER_NPC_SCALE = 1.3;

/** 식구 한 명에게 내리는 이동 지시 */
export type FigureOrder =
  | {kind: "free"} // 자기 자리 근처를 배회
  | {kind: "home"; face?: number} // 자리로 돌아가 대기 — face 는 도착 후 볼 방향(기본: 손님 쪽 0)
  | {kind: "spot"; x: number; z: number; key: string}; // 지정한 곳으로 — 도착하면 onArrive(key)

function AtelierFigure({
  npc,
  onSelect,
  isIntake,
  order,
  onArrive,
  positions,
  speaking = false,
  bubbleText,
  emote
}: {
  npc: NPCData;
  onSelect: (npc: NPCData) => void;
  isIntake: boolean;
  /** 지금 이 식구가 따라야 할 이동 지시 */
  order: FigureOrder;
  /** spot 지시에 도착했을 때 한 번 불린다 */
  onArrive?: (key: string) => void;
  /** 식구들의 현재 발 위치 공유 맵 — 마주침 루프가 걸음 시간을 잴 때 쓴다 */
  positions?: {current: Map<string, {x: number; z: number}>};
  /** 릴레이 설문에서 지금 말하는 식구 — 호버와 같은 들림·발광을 유지한다 */
  speaking?: boolean;
  /** 식구끼리 투닥거릴 때의 말풍선 (E-4 공방 사건) */
  bubbleText?: string;
  /** 마주침 결과 이모지 — 💢/💕 */
  emote?: string;
}) {
  const [hoveredRaw, setHovered] = useState(false);
  const hovered = hoveredRaw || speaking;
  const rootRef = useRef<Group>(null);
  const groupRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const moveRef = useRef<NpcMoveState>("idle");
  const posRef = useRef({x: npc.position[0], z: npc.position[2]});
  const yawRef = useRef(0);
  const yawTargetRef = useRef(0);
  const wanderRef = useRef<{x: number; z: number} | null>(null);
  const wanderWaitRef = useRef(3 + Math.random() * 9);
  const arrivedKeyRef = useRef<string | null>(null);
  const bobRef = useRef(Math.random() * Math.PI * 2);
  const liftRef = useRef(0);
  // 도안은 접수대를 크게 못 벗어난다 — 손님이 오면 바로 맞아야 하니까
  const wanderRadius = isIntake ? 0.9 : 2.1;

  useFrame((_, delta) => {
    bobRef.current += delta * 1.4;

    // ── 이동 ──
    const p = posRef.current;
    const home = npc.position;
    let tx: number | null = null;
    let tz = 0;
    let face: number | null = null;
    let hustle = false;

    if (order.kind === "spot") {
      tx = order.x;
      tz = order.z;
      face = 0; // 도착하면 손님(카메라) 쪽을 본다
      hustle = true;
    } else if (order.kind === "home") {
      tx = home[0];
      tz = home[2];
      face = order.face ?? 0;
    } else if (wanderRef.current) {
      tx = wanderRef.current.x;
      tz = wanderRef.current.z;
    } else {
      wanderWaitRef.current -= delta;
      if (wanderWaitRef.current <= 0) {
        for (let i = 0; i < 8; i += 1) {
          const ang = Math.random() * Math.PI * 2;
          const r = 0.7 + Math.random() * Math.max(0.1, wanderRadius - 0.7);
          const cx = home[0] + Math.cos(ang) * r;
          const cz = home[2] + Math.sin(ang) * r;
          if (walkable(cx, cz)) {
            wanderRef.current = {x: cx, z: cz};
            break;
          }
        }
        wanderWaitRef.current = 8 + Math.random() * 14;
      }
    }

    if (tx !== null) {
      const distFinal = Math.hypot(tx - p.x, tz - p.z);
      if (distFinal > 0.07) {
        // 직선이 가구에 막히면 모서리를 경유해 돌아간다
        const via = detourPoint(p.x, p.z, tx, tz);
        const wx = via ? via[0] : tx;
        const wz = via ? via[1] : tz;
        const dx = wx - p.x;
        const dz = wz - p.z;
        const dist = Math.hypot(dx, dz) || 1;
        const speed = hustle && distFinal > 2.5 ? RUN_SPEED : WALK_SPEED;
        const step = Math.min(dist, speed * delta);
        const nx = p.x + (dx / dist) * step;
        const nz = p.z + (dz / dist) * step;
        let moved = true;
        if (walkable(nx, nz)) {
          p.x = nx;
          p.z = nz;
        } else if (walkable(nx, p.z) && Math.abs(nx - p.x) > 1e-4) {
          p.x = nx; // 가구 모서리 — 한 축만 미끄러진다
        } else if (walkable(p.x, nz) && Math.abs(nz - p.z) > 1e-4) {
          p.z = nz;
        } else {
          // 마지막 수: 경계에 몸이 딱 붙은 교착 — 좌우 45°씩 틀어 비켜 걷는다
          moved = false;
          for (const s of [1, -1, 2, -2, 3, -3]) {
            const a = Math.atan2(dx, dz) + (s * Math.PI) / 4;
            const ex = p.x + Math.sin(a) * step;
            const ez = p.z + Math.cos(a) * step;
            if (walkable(ex, ez)) {
              p.x = ex;
              p.z = ez;
              moved = true;
              break;
            }
          }
          if (!moved && order.kind === "free") wanderRef.current = null; // 낀 목표는 버림
        }
        if (moved) {
          moveRef.current = speed === RUN_SPEED ? "run" : "walk";
          yawTargetRef.current = Math.atan2(dx, dz);
        } else {
          moveRef.current = "idle";
        }
      } else {
        moveRef.current = "idle";
        if (order.kind === "free") {
          wanderRef.current = null;
        } else if (face !== null) {
          yawTargetRef.current = face;
        }
        if (order.kind === "spot" && arrivedKeyRef.current !== order.key) {
          arrivedKeyRef.current = order.key;
          onArrive?.(order.key);
        }
      }
    }

    // yaw 스무딩 — ±π 래핑을 넘어가며 짧은 쪽으로 돈다
    const diff =
      ((yawTargetRef.current - yawRef.current + Math.PI * 3) % (Math.PI * 2)) -
      Math.PI;
    yawRef.current += diff * Math.min(1, delta * 9);
    if (modelRef.current) modelRef.current.rotation.y = yawRef.current;
    if (rootRef.current) {
      rootRef.current.position.x = p.x;
      rootRef.current.position.z = p.z;
    }
    positions?.current.set(npc.id, p);
    // 보간 계수는 반드시 1 이하로 묶는다. 접수 패널이 캔버스를 덮는 동안
    // 프레임루프가 쉬었다 재개되면 delta 가 몇 초 단위로 커지는데, 그때
    // delta*7 이 1 을 넘으면 lerp 가 목표를 지나쳐 인형이 바닥 아래로 꺼진다
    // (실제로 도안이 통째로 사라졌다 — 라벨과 발밑 고리만 남았다).
    liftRef.current = MathUtils.lerp(
      liftRef.current,
      hovered ? 1 : 0,
      Math.min(1, delta * 7)
    );
    if (groupRef.current) {
      // 살짝 숨 쉬는 정도의 상하 움직임 — 정지한 인형처럼 보이지 않게
      groupRef.current.position.y =
        Math.sin(bobRef.current) * 0.025 + liftRef.current * 0.08;
    }
  });

  // 광원을 걷어낸 만큼 자체발광을 올려 호버 반응이 여전히 읽히게 한다
  const glow = hovered ? 1.05 : 0.3;

  return (
    <group
      ref={rootRef}
      position={npc.position}
      onClick={event => {
        event.stopPropagation();
        onSelect(npc);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <group ref={groupRef}>
        {/* 몸통만 걷는 방향으로 돈다 — 라벨·말풍선(Html)은 어차피 빌보드.
            스케일 1.3: 마을 키(1.2) 그대로 두면 접수대(1.2)와 키가 같아
            가구에 파묻힌다. 실내는 카메라가 가까워 한 치수 키운다. */}
        <group ref={modelRef} scale={ATELIER_NPC_SCALE}>
          {npc.model ? (
            // 마을과 같은 GLB 캐릭터. 로딩되는 동안은 절차 인형이 폴백으로 선다.
            <Suspense fallback={<DollBody glow={glow} npc={npc} />}>
              <NpcCharacter modelId={npc.model} stateRef={moveRef} />
            </Suspense>
          ) : (
            <DollBody glow={glow} npc={npc} />
          )}
          {/* GLB 메시는 raycast 가 꺼져 있다(NpcCharacter 의 규칙) —
              보이지 않는 캡슐이 클릭·호버를 대신 받는다. */}
          <mesh position={[0, 0.65, 0]} visible={false}>
            <capsuleGeometry args={[0.34, 0.7, 4, 8]} />
          </mesh>
        </group>
      </group>

      {/* 발밑 고리 — 클릭할 수 있다는 신호 (1.3배 몸에 맞춤) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.7, 32]} />
        <meshBasicMaterial
          color={npc.color}
          transparent
          opacity={hovered ? 0.75 : 0.18}
        />
      </mesh>

      {/* NPC마다 실광원을 달았더니 이 방에만 pointLight 가 12개가 됐다.
          표준 재질은 광원 수만큼 프래그먼트 비용이 붙는다 — 존재감은
          emissive 와 발밑 고리로 충분하므로 광원은 걷어냈다. */}

      {bubbleText ? (
        <Html
          center
          distanceFactor={10}
          position={[0, 3.0, 0]}
          zIndexRange={[8, 0]}
        >
          <div
            style={{
              pointerEvents: "none",
              userSelect: "none",
              width: 170,
              borderRadius: 11,
              border: "1.5px solid rgba(226,192,120,0.5)",
              background: "rgba(11,22,38,0.94)",
              padding: "6px 10px",
              fontFamily: "system-ui, sans-serif",
              fontSize: 11,
              lineHeight: 1.45,
              color: "#e8eef7",
              textAlign: "center"
            }}
          >
            {bubbleText}
          </div>
        </Html>
      ) : emote ? (
        <Html
          center
          distanceFactor={10}
          position={[0, 3.0, 0]}
          zIndexRange={[8, 0]}
        >
          <div
            style={{pointerEvents: "none", userSelect: "none", fontSize: 26}}
          >
            {emote}
          </div>
        </Html>
      ) : null}
      <Html
        center
        distanceFactor={11}
        position={[0, 2.5, 0]}
        zIndexRange={[6, 0]}
      >
        <div
          style={{
            pointerEvents: "none",
            userSelect: "none",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            whiteSpace: "nowrap"
          }}
        >
          <div
            style={{
              display: "inline-block",
              borderRadius: 9,
              border: `1.5px solid ${
                hovered ? npc.color : "rgba(226,192,120,0.35)"
              }`,
              background: "rgba(11,22,38,0.9)",
              padding: "4px 11px",
              boxShadow: hovered ? `0 0 16px ${npc.color}66` : "none"
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: hovered ? npc.color : GOLD,
                letterSpacing: "0.06em"
              }}
            >
              {npc.name}
            </span>
            <span style={{fontSize: 9, color: "#a9bdd6", marginLeft: 6}}>
              {npc.role}
            </span>
          </div>
          {hoveredRaw ? (
            <div
              style={{
                marginTop: 4,
                fontSize: 9,
                fontWeight: 900,
                color: npc.color,
                letterSpacing: "0.1em"
              }}
            >
              {isIntake ? "의뢰 접수하기 →" : "불러서 상담 →"}
            </div>
          ) : null}
        </div>
      </Html>
    </group>
  );
}

/* ────────────────────────────── 작업대 ────────────────────────────── */

/** 직군별 작업대 — GLB 가구(2026-08-27) + 절차 폴백. 백엔드는 서버 캐비닛. */
function Workbench({
  position,
  color,
  kind,
  rot = 0
}: {
  position: [number, number, number];
  color: string;
  kind: "planner" | "designer" | "frontend" | "backend";
  rot?: number;
}) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <Suspense fallback={<WorkbenchDoll color={color} kind={kind} />}>
        <AtelierProp
          file={
            kind === "planner"
              ? "workbench-planner"
              : kind === "designer"
              ? "workbench-designer"
              : kind === "frontend"
              ? "workbench-frontend"
              : "server-rack"
          }
        />
      </Suspense>
      {kind === "backend" ? (
        // 랙 앞에 고이는 파란 빛 — 실광원 대신 가산 원반(마을 LampPools 수법)
        <mesh position={[0, 0.014, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.1, 20]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={color}
            depthWrite={false}
            opacity={0.16}
            transparent
          />
        </mesh>
      ) : null}
    </group>
  );
}

/** GLB 가 오기 전의 절차 작업대 (2026-08-27 까지의 본체) */
function WorkbenchDoll({
  color,
  kind
}: {
  color: string;
  kind: "planner" | "designer" | "frontend" | "backend";
}) {
  return (
    <>
      {/* 상판 + 다리 */}
      <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[2.6, 0.1, 1.1]} />
        <meshStandardMaterial color={WOOD} roughness={0.65} />
      </mesh>
      {[-1.15, 1.15].map(x =>
        [-0.42, 0.42].map(z => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.35, z]}>
            <boxGeometry args={[0.11, 0.72, 0.11]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
          </mesh>
        ))
      )}

      {kind === "planner" ? (
        <group position={[0, 1.15, -0.2]}>
          {/* 화이트보드 + 포스트잇 */}
          <mesh castShadow>
            <boxGeometry args={[1.7, 0.95, 0.05]} />
            <meshStandardMaterial color="#f3e6c8" roughness={0.7} />
          </mesh>
          {[
            [-0.5, 0.22],
            [-0.1, 0.26],
            [0.32, 0.18],
            [-0.34, -0.12],
            [0.14, -0.16]
          ].map(([x, y], i) => (
            <mesh key={i} position={[x!, y!, 0.032]}>
              <planeGeometry args={[0.28, 0.24]} />
              <meshBasicMaterial color={i % 2 ? "#f5d26b" : color} />
            </mesh>
          ))}
        </group>
      ) : null}

      {kind === "designer" ? (
        <group position={[0, 0.8, 0]}>
          {/* 색 견본 스와치 */}
          {["#c69af0", "#ff9d38", "#7ecf68", "#f3e6c8", "#5f7be8"].map(
            (c, i) => (
              <mesh
                key={c}
                castShadow
                position={[-0.9 + i * 0.45, 0.03, 0]}
                rotation={[-Math.PI / 2, 0, (i - 2) * 0.08]}
              >
                <planeGeometry args={[0.36, 0.62]} />
                <meshBasicMaterial color={c} />
              </mesh>
            )
          )}
          {/* 세워둔 시안 보드 */}
          <mesh castShadow position={[0, 0.62, -0.42]} rotation={[-0.22, 0, 0]}>
            <boxGeometry args={[1.3, 0.9, 0.04]} />
            <meshStandardMaterial color="#f8f0dc" roughness={0.6} />
          </mesh>
        </group>
      ) : null}

      {kind === "frontend" ? (
        <group position={[0, 0.8, -0.15]}>
          {/* 모니터 두 대 */}
          {[-0.62, 0.62].map((x, i) => (
            <group key={x} position={[x, 0.42, 0]} rotation={[0, -x * 0.25, 0]}>
              <mesh castShadow>
                <boxGeometry args={[1.05, 0.66, 0.05]} />
                <meshStandardMaterial color="#1b2a3d" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0, 0.031]}>
                <planeGeometry args={[0.95, 0.56]} />
                <meshBasicMaterial color={i ? "#1e3a4f" : color} />
              </mesh>
              {/* 화면 속 코드 줄 흉내 */}
              {[0.16, 0.06, -0.04, -0.14].map((y, j) => (
                <mesh key={y} position={[-0.2 + j * 0.05, y, 0.033]}>
                  <planeGeometry args={[0.4 - j * 0.06, 0.03]} />
                  <meshBasicMaterial
                    color="#f3e6c8"
                    transparent
                    opacity={0.5}
                  />
                </mesh>
              ))}
              <mesh castShadow position={[0, -0.42, 0]}>
                <cylinderGeometry args={[0.14, 0.18, 0.04, 10]} />
                <meshStandardMaterial color="#2e3f52" roughness={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      ) : null}

      {kind === "backend" ? (
        <group position={[0, 0, -0.25]}>
          {/* 서버랙 */}
          <mesh castShadow receiveShadow position={[0, 0.95, 0]}>
            <boxGeometry args={[1.05, 1.9, 0.7]} />
            <meshStandardMaterial color="#1b2536" roughness={0.55} />
          </mesh>
          {[0.35, 0.72, 1.09, 1.46].map((y, i) => (
            <group key={y}>
              <mesh position={[0, y, 0.36]}>
                <planeGeometry args={[0.9, 0.24]} />
                <meshStandardMaterial color="#121a28" roughness={0.6} />
              </mesh>
              {/* 상태 LED — 층마다 색이 다르게 */}
              <mesh position={[0.32, y, 0.375]}>
                <circleGeometry args={[0.028, 10]} />
                <meshBasicMaterial color={i % 3 === 0 ? "#7ecf68" : color} />
              </mesh>
              <mesh position={[0.22, y, 0.375]}>
                <circleGeometry args={[0.028, 10]} />
                <meshBasicMaterial color="#2e4258" />
              </mesh>
            </group>
          ))}
        </group>
      ) : null}
    </>
  );
}

/** GLB 가 오기 전의 절차 접수대 (2026-08-27 까지의 본체) */
function ReceptionDeskDoll() {
  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[3.4, 1, 1.05]} />
        <meshStandardMaterial color={WOOD} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.03, 0]}>
        <boxGeometry args={[3.6, 0.08, 1.2]} />
        <meshStandardMaterial color={GOLD} metalness={0.25} roughness={0.45} />
      </mesh>
      {/* 접수대 위 도면과 잉크병 */}
      <mesh position={[-0.75, 1.09, 0.05]} rotation={[-Math.PI / 2, 0, 0.14]}>
        <planeGeometry args={[0.9, 0.62]} />
        <meshBasicMaterial color="#f3e6c8" />
      </mesh>
      <mesh castShadow position={[0.95, 1.16, 0.1]}>
        <cylinderGeometry args={[0.09, 0.11, 0.18, 10]} />
        <meshStandardMaterial color="#1b2536" roughness={0.4} />
      </mesh>
    </>
  );
}

/* ────────────────────────────── 방 ────────────────────────────── */

/** 벽에 매달린 랜턴 — 마을 LampPools와 같은 리듬으로 흔들린다. */
function Lantern({position}: {position: [number, number, number]}) {
  const lightRef = useRef<PointLight>(null);
  const tRef = useRef(Math.random() * 10);

  useFrame((_, delta) => {
    tRef.current += delta;
    if (lightRef.current) {
      lightRef.current.intensity =
        3.6 +
        Math.sin(tRef.current * 2.6) * 0.3 +
        Math.sin(tRef.current * 7.1) * 0.14;
    }
  });

  return (
    <group position={position}>
      <Suspense fallback={<LanternDoll />}>
        {/* GLB 는 등롱+걸이 막대가 한 몸(높이 1.05) — 천장(3.5)에 윗단이 닿게 */}
        <AtelierProp file="wall-lantern" yOffset={0.03} />
      </Suspense>
      {/* 랜턴 주변에 퍼지는 빛무리 — 광원만으로는 랜턴이 '켜져 있다'는 게 안 읽힌다.
          GLB 등롱은 막대 아래쪽에 매달려 있어 빛무리도 그만큼 내린다. */}
      <mesh position={[0, -0.32, 0]}>
        <sphereGeometry args={[0.62, 12, 10]} />
        <meshBasicMaterial
          color="#ffbe74"
          depthWrite={false}
          opacity={0.13}
          transparent
        />
      </mesh>
      <pointLight
        ref={lightRef}
        castShadow={false}
        color="#ffbe74"
        decay={1.5}
        distance={22}
        intensity={3.6}
        position={[0, -0.32, 0]}
      />
    </group>
  );
}

/** GLB 가 오기 전의 절차 랜턴 (2026-08-27 까지의 본체) */
function LanternDoll() {
  return (
    <group position={[0, -0.32, 0]}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.84, 5]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.36, 0.3]} />
        <meshStandardMaterial
          color={LANTERN}
          emissive={LANTERN}
          emissiveIntensity={1.1}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <coneGeometry args={[0.26, 0.16, 4]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
      </mesh>
    </group>
  );
}

function AtelierRoom() {
  // 바닥 널판 — 원래 남색 체크 석판이었는데 월넛 가구 6종이 들어오자 바닥만
  // 차갑게 따로 놀았다(2026-08-27 사용자 피드백). 가구와 같은 계열의 어두운
  // 나무 널판으로 바꾸고, 줄마다 이음매를 어긋나게 잘라 마루처럼 깐다.
  const planks = useMemo(() => {
    const tones = ["#3a2a1c", "#33251a", "#3e2d1f", "#362818", "#2f2216"];
    const out: {key: string; x: number; z: number; w: number; tone: string}[] =
      [];
    let seed = 7;
    const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let iz = 0; iz < 16; iz += 1) {
      const z = -6.6 + iz * 0.88;
      let x = -9 - (iz % 2 ? 1.4 : 0);
      let i = 0;
      while (x < 9) {
        const w = 3.0 + rand() * 1.8;
        const x1 = Math.max(-9, x);
        const x2 = Math.min(9, x + w);
        if (x2 - x1 > 0.3) {
          out.push({
            key: `${iz}-${i}`,
            x: (x1 + x2) / 2,
            z,
            w: x2 - x1 - 0.06,
            tone: tones[Math.floor(rand() * tones.length)]!
          });
        }
        x += w + 0.06;
        i += 1;
      }
    }
    return out;
  }, []);

  return (
    <group>
      {/* 바닥 밑판 — 널판 틈으로 비치는 어둠 */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#20160f" roughness={0.95} />
      </mesh>
      {planks.map(p => (
        <mesh
          key={p.key}
          receiveShadow
          position={[p.x, 0.006, p.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[p.w, 0.8]} />
          <meshStandardMaterial color={p.tone} roughness={0.85} />
        </mesh>
      ))}

      {/* 접수대 앞 원형 러그 — 손님을 맞는 자리라는 표시. 가구의 금테와
          같은 계열로 눌러, 방 가운데에 무게중심을 만든다. */}
      <group position={[0, 0, 0.7]}>
        <mesh
          receiveShadow
          position={[0, 0.012, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[2.3, 44]} />
          <meshStandardMaterial color="#5e2f28" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.9, 2.1, 44]} />
          <meshStandardMaterial color="#8f6a3a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.25, 36]} />
          <meshStandardMaterial color="#6d3a30" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.017, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.05, 1.15, 36]} />
          <meshStandardMaterial color="#8f6a3a" roughness={0.9} />
        </mesh>
      </group>

      {/* 벽 — 지하라 천장이 낮다 */}
      {(
        [
          {pos: [0, 1.75, -7], rot: [0, 0, 0], size: [18, 3.5]},
          {pos: [0, 1.75, 7], rot: [0, Math.PI, 0], size: [18, 3.5]},
          {pos: [-9, 1.75, 0], rot: [0, Math.PI / 2, 0], size: [14, 3.5]},
          {pos: [9, 1.75, 0], rot: [0, -Math.PI / 2, 0], size: [14, 3.5]}
        ] as const
      ).map((wall, i) => (
        <mesh
          key={i}
          receiveShadow
          position={wall.pos as unknown as [number, number, number]}
          rotation={wall.rot as unknown as [number, number, number]}
        >
          <planeGeometry args={wall.size as unknown as [number, number]} />
          <meshStandardMaterial color="#2f3d55" roughness={0.95} />
        </mesh>
      ))}

      {/* 천장 + 들보 */}
      <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#1b2536" roughness={1} />
      </mesh>
      {[-4.5, -1.5, 1.5, 4.5].map(z => (
        <mesh key={z} castShadow position={[0, 3.36, z]}>
          <boxGeometry args={[18, 0.24, 0.3]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
        </mesh>
      ))}

      {/* 벽 아래 굽도리 — 지하 석벽 느낌 */}
      {[-6.9, 6.9].map(z => (
        <mesh key={z} position={[0, 0.28, z]}>
          <boxGeometry args={[18, 0.56, 0.2]} />
          <meshStandardMaterial color="#38465e" roughness={0.9} />
        </mesh>
      ))}

      {/* 들어온 계단 — 뒤쪽 벽에서 위로 뚫린 통로 */}
      <group position={[0, 0, 6.1]}>
        {[0, 1, 2, 3].map(i => (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[0, 0.16 + i * 0.32, i * 0.42]}
          >
            <boxGeometry args={[2.6, 0.32, 0.42]} />
            <meshStandardMaterial color="#26334a" roughness={0.9} />
          </mesh>
        ))}
        {/* 계단 위에서 새어 들어오는 바깥 빛 */}
        <pointLight
          color="#7fa8d8"
          decay={2}
          distance={7}
          intensity={0.9}
          position={[0, 2.4, 1.4]}
        />
      </group>

      {/* 랜턴 — 방을 밝히는 **유일한** 실광원이라 개수를 셋으로 묶는다.
          다섯 개까지 늘렸더니 NPC·서버랙 광원까지 합쳐 pointLight 가 12개가 됐고
          그만큼 프래그먼트 비용이 곱해졌다. 광량은 개수 대신 세기로 채운다. */}
      {(
        [
          // 셋째는 x=0 에 두면 안 된다 — 카메라와 뒷벽 현판이 같은 축이라
          // 랜턴 상자가 "의 뢰 공 방" 글자를 정면으로 가린다.
          [-5.6, 2.9, -3.6],
          [5.6, 2.9, -3.6],
          [-3.2, 2.9, 2.6]
        ] as [number, number, number][]
      ).map((pos, i) => (
        <Lantern key={i} position={pos} />
      ))}

      {/* 접수대 — 방 한가운데. GLB(도면·잉크병까지 구워져 있다) + 절차 폴백 */}
      <group position={[0, 0, -0.35]}>
        <Suspense fallback={<ReceptionDeskDoll />}>
          <AtelierProp file="reception-desk" />
        </Suspense>
      </group>

      {/* 공방 현판 */}
      <group position={[0, 2.5, -6.85]}>
        <mesh castShadow>
          <boxGeometry args={[4.4, 1, 0.14]} />
          <meshStandardMaterial color={WOOD} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[4, 0.68, 0.02]} />
          <meshStandardMaterial
            color={GOLD}
            emissive={GOLD}
            emissiveIntensity={0.22}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
        <Html
          center
          distanceFactor={13}
          position={[0, 0, 0.11]}
          zIndexRange={[4, 0]}
        >
          <div
            style={{
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
              fontFamily: "'Gowun Batang', serif",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: "#3a2812"
            }}
          >
            의 뢰 공 방
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ────────────────────────────── 씬 ────────────────────────────── */

// rot: 벽과 나란히 세웠더니 전시장처럼 보여서, 방 가운데(접수대)를 살짝
// 바라보게 튼다. 보행 SOLIDS 는 회전 전 발자국 그대로다 — ±0.2~0.34rad 는
// AABB 를 조금 비어져 나올 뿐이라 스치는 정도고, 판정이 어긋나진 않는다.
const BENCHES: {
  position: [number, number, number];
  color: string;
  kind: "planner" | "designer" | "frontend" | "backend";
  rot: number;
}[] = [
  {position: [-4.75, 0, -2.7], color: "#7ecf68", kind: "planner", rot: 0.24},
  {position: [-4.75, 0, 1.9], color: "#c69af0", kind: "designer", rot: 0.2},
  {position: [4.75, 0, -2.7], color: "#68c7cf", kind: "frontend", rot: -0.24},
  {position: [4.75, 0, 1.9], color: "#5f7be8", kind: "backend", rot: -0.34}
];

/**
 * 릴레이 설문의 카메라 — 접수대 앞으로 한 번 내려앉는다.
 *
 * 원래는 말하는 식구의 작업대 앞으로 날아다녔는데, 이제는 **식구 쪽이 접수대로
 * 걸어온다**(RELAY_SPOT). 그래서 카메라는 설문이 시작될 때 RELAY_FOCUS 로 한 번만
 * 이동하고, 화자가 바뀌어도 그대로 있다 — 불려온 식구가 화면 안으로 걸어 들어온다.
 * 목표에 닿으면 손을 떼서 손님이 다시 돌려볼 수 있다(닿기 전까지만 lerp).
 */
function CameraRig({
  focus,
  controls
}: {
  focus: [number, number, number] | null;
  controls: React.RefObject<ComponentRef<typeof OrbitControls> | null>;
}) {
  const goalTarget = useRef(new Vector3());
  const goalCamera = useRef(new Vector3());
  const settled = useRef(true);

  useEffect(() => {
    if (!focus) {
      settled.current = true;
      return;
    }
    const [x, , z] = focus;
    // 설문 HUD 가 화면 아래 절반을 덮는다. 식구가 **위쪽 1/3** 에 오도록 발밑보다
    // 낮은 점을 겨누고, 카메라는 조금 높고 멀리 둔다.
    goalTarget.current.set(x, -0.05, z);
    const dx = 0 - x;
    const dz = 6 - z;
    const len = Math.hypot(dx, dz) || 1;
    goalCamera.current.set(x + (dx / len) * 3.6, 2.3, z + (dz / len) * 3.6);
    settled.current = false;
  }, [focus]);

  useFrame(({camera}, delta) => {
    const orbit = controls.current;
    if (!orbit || settled.current) return;
    const k = Math.min(1, delta * 3.2);
    orbit.target.lerp(goalTarget.current, k);
    camera.position.lerp(goalCamera.current, k);
    orbit.update();
    if (
      camera.position.distanceTo(goalCamera.current) < 0.04 &&
      orbit.target.distanceTo(goalTarget.current) < 0.04
    ) {
      settled.current = true;
    }
  });

  return null;
}

interface Props {
  onBack: () => void;
  onSelectNpc: (npc: NPCData) => void;
  /** 릴레이 설문에서 지금 말하는 식구의 id. 그 식구가 접수대로 걸어오고 인형이 들린다. */
  focusNpcId?: string | null;
  /** 설문 HUD 가 바닥을 차지할 때 조작 안내를 숨긴다 */
  hideHints?: boolean;
  /** 대화창이 열려 있는 식구의 id — 상담이 끝날 때까지 손님 앞에 서 있는다 */
  activeNpcId?: string | null;
}

/** 마주침 루프가 보행 시스템에 손을 대는 통로 — AtelierInterior 가 채워 준다. */
interface SocialWalkApi {
  posOf: (id: string) => {x: number; z: number} | undefined;
  walkTo: (id: string, x: number, z: number) => void;
  /** 배회를 멈추고 자기 자리로 — 듣는 쪽이 빈자리를 비우지 않게 */
  station: (id: string) => void;
  release: (id: string) => void;
}

/** 공방 식구끼리의 마주침 루프 (5단계 E-4).
 *
 * 마을의 checkEncounter 는 거리 기반이지만 여기는 넷이 늘 한 방이라 타이머로 간다.
 * 대사는 백엔드 /npc/encounter — 직군별 사건 템플릿(체리의 "범위를 또 늘림" 류)이
 * 이 방에서 처음으로 실제로 일어난다. 관계·기억·마을 소식도 똑같이 쌓인다.
 *
 * 2026-08-27: 말풍선만 띄우던 것에서 **한쪽이 실제로 걸어가는** 것으로. 찾아가는
 * 쪽(a)이 상대(b) 자리 옆까지 걸은 뒤에 대화가 시작된다. 걸음이 끝나는 시각은
 * 도착 콜백 대신 거리/속도로 어림한다 — 몇백 ms 어긋나도 말풍선이라 티가 안 나고,
 * 타이머 사슬을 그대로 쓸 수 있어서다.
 */
function useAtelierSocialLoop(
  paused: boolean,
  walkApi: {current: SocialWalkApi}
) {
  const [bubbles, setBubbles] = useState<Record<string, string>>({});
  const [emotes, setEmotes] = useState<Record<string, string>>({});
  const busyRef = useRef(false);
  const nextAtRef = useRef(Date.now() + 90000); // 입장 90초 뒤 첫 마주침
  const timersRef = useRef<number[]>([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const team = atelierNpcs.filter(npc => npc.id !== "atelier-intake-npc");
    const tick = async () => {
      if (pausedRef.current || busyRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      if (Date.now() < nextAtRef.current) return;
      busyRef.current = true;
      try {
        const pick = [...team].sort(() => Math.random() - 0.5).slice(0, 2);
        const [a, b] = [pick[0]!, pick[1]!];
        const res = await requestNpcEncounter(
          {npc_id: a.id, mood: "calm", energy: 55, recent_memory: []},
          {npc_id: b.id, mood: "calm", energy: 55, recent_memory: []},
          []
        );
        // a 가 b 자리 옆(1.2 떨어진 점)까지 걸어간 뒤 이야기가 시작된다.
        const cur = walkApi.current.posOf(a.id) ?? {
          x: a.position[0],
          z: a.position[2]
        };
        const vx = cur.x - b.position[0];
        const vz = cur.z - b.position[2];
        const vl = Math.hypot(vx, vz) || 1;
        let mx = b.position[0] + (vx / vl) * 1.2;
        let mz = b.position[2] + (vz / vl) * 1.2;
        if (!walkable(mx, mz)) {
          mx = b.position[0];
          mz = b.position[2] + 1.2; // 사이에 가구가 있으면 방 안쪽으로
        }
        walkApi.current.station(b.id); // 듣는 쪽은 자리를 지킨다
        walkApi.current.walkTo(a.id, mx, mz);
        const walkMs =
          (Math.hypot(mx - cur.x, mz - cur.z) / WALK_SPEED) * 1000 + 400;
        const stepMs = 2600;
        res.dialogue.forEach((line, i) => {
          timersRef.current.push(
            window.setTimeout(() => {
              setBubbles({[line.npc_id]: line.text});
            }, walkMs + i * stepMs)
          );
        });
        const endMs = walkMs + res.dialogue.length * stepMs;
        timersRef.current.push(
          window.setTimeout(() => {
            setBubbles({});
            walkApi.current.release(a.id); // 이야기 끝 — 둘 다 다시 자유
            walkApi.current.release(b.id);
            const delta = res.relationship?.delta ?? 0;
            if (Math.abs(delta) >= 2) {
              const emote = delta < 0 ? "💢" : "💕";
              setEmotes({[a.id]: emote, [b.id]: emote});
              timersRef.current.push(
                window.setTimeout(() => setEmotes({}), 1600)
              );
            }
          }, endMs)
        );
        nextAtRef.current =
          Date.now() + Math.max(res.cooldown_seconds * 1000, 120000);
      } catch {
        nextAtRef.current = Date.now() + 180000; // 백엔드 오프라인 — 조용히 쉼
      } finally {
        busyRef.current = false;
      }
    };
    const id = window.setInterval(tick, 5000);
    return () => {
      window.clearInterval(id);
      timersRef.current.forEach(t => window.clearTimeout(t));
      timersRef.current = [];
    };
    // walkApi 는 ref 라 안정적이다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {bubbles, emotes};
}

export function AtelierInterior({
  onBack,
  onSelectNpc,
  focusNpcId = null,
  hideHints = false,
  activeNpcId = null
}: Props) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);

  // ── 보행 오케스트레이션 ──
  const positionsRef = useRef<Map<string, {x: number; z: number}>>(new Map());
  // 클릭된 식구 — 손님 앞까지 걸어온 **뒤에** 대화창이 열린다
  const [pendingTalk, setPendingTalk] = useState<{
    npc: NPCData;
    key: string;
  } | null>(null);
  const pendingTalkRef = useRef(pendingTalk);
  pendingTalkRef.current = pendingTalk;
  const talkSeqRef = useRef(0);
  // 마주침 루프가 내리는 이동 지시 (찾아가는 쪽 한 명)
  const [socialOrders, setSocialOrders] = useState<
    Record<string, FigureOrder | undefined>
  >({});
  const socialApiRef = useRef<SocialWalkApi>({
    posOf: id => positionsRef.current.get(id),
    walkTo: (id, x, z) =>
      setSocialOrders(prev => ({
        ...prev,
        [id]: {kind: "spot", x, z, key: `social-${id}-${x.toFixed(2)}`}
      })),
    station: id => setSocialOrders(prev => ({...prev, [id]: {kind: "home"}})),
    release: id => setSocialOrders(prev => ({...prev, [id]: undefined}))
  });

  // ── 근무 모드 (2026-08-27) ──
  // 평소엔 다들 자기 자리 근처에서 놀지만, 손님이 **처음 누군가에게 말을 걸면**
  // 전원 자기 작업대로 가서 작업대를 바라보고 선다 — "일하는 공방" 연출.
  // 차례가 온 식구만 손님 앞으로 걸어오고, 대화가 끝난 식구는 다시 자리로
  // 돌아가 일한다. 손님이 90초쯤 아무와도 안 얘기하면 슬그머니 다시 논다.
  const [workMode, setWorkMode] = useState(false);
  const interacting =
    !!focusNpcId || !!activeNpcId || !!pendingTalk || hideHints;
  useEffect(() => {
    if (interacting) setWorkMode(true);
  }, [interacting]);
  useEffect(() => {
    if (!workMode || interacting) return;
    const t = window.setTimeout(() => setWorkMode(false), 90000);
    return () => window.clearTimeout(t);
  }, [workMode, interacting]);

  /** '작업 중' 시선 — 팀원은 자기 작업대(바깥쪽)를 본다. 도안은 접수원이라
   * 언제나 손님 쪽(0)을 지킨다. */
  const workFace = (npc: NPCData): number =>
    npc.id === "atelier-intake-npc"
      ? 0
      : npc.position[0] < 0
      ? -Math.PI / 2
      : Math.PI / 2;

  // 설문(릴레이)·상담·근무 중에는 식구끼리 잡담을 쉰다
  const social = useAtelierSocialLoop(interacting || workMode, socialApiRef);

  /** 클릭: 도안은 접수대에 이미 있으니 즉시, 팀원은 걸어온 뒤에 연다. */
  const handleFigureClick = (npc: NPCData) => {
    setWorkMode(true); // 손님이 말을 걸었다 — 전원 작업 태세
    if (npc.id === "atelier-intake-npc") {
      onSelectNpc(npc);
      return;
    }
    talkSeqRef.current += 1;
    setPendingTalk({npc, key: `talk-${talkSeqRef.current}`});
  };

  const handleArrive = (key: string) => {
    const pt = pendingTalkRef.current;
    if (pt && pt.key === key) {
      setPendingTalk(null);
      onSelectNpc(pt.npc);
    }
  };

  /** 손님 앞 상담 자리 — 자기 작업대가 있는 쪽에 선다 */
  const greetSpot = (npc: NPCData): [number, number] => [
    npc.position[0] < 0 ? -1.1 : 1.1,
    1.9
  ];

  /** 우선순위: 릴레이 > 클릭 상담 > 대화 유지 > 마주침 > 근무 > 자유 배회 */
  const orderFor = (npc: NPCData): FigureOrder => {
    const isIntakeNpc = npc.id === "atelier-intake-npc";
    if (focusNpcId) {
      if (npc.id === focusNpcId && !isIntakeNpc)
        return {
          kind: "spot",
          x: RELAY_SPOT[0],
          z: RELAY_SPOT[1],
          key: `relay-${npc.id}`
        };
      // 도안은 접수대에서 손님을 보고, 나머지는 자리에서 일하는 척 대기
      return {kind: "home", face: workFace(npc)};
    }
    if (pendingTalk?.npc.id === npc.id) {
      const [gx, gz] = greetSpot(npc);
      return {kind: "spot", x: gx, z: gz, key: pendingTalk.key};
    }
    if (activeNpcId === npc.id && !isIntakeNpc) {
      const [gx, gz] = greetSpot(npc);
      return {kind: "spot", x: gx, z: gz, key: `stay-${npc.id}`};
    }
    if (socialOrders[npc.id]) return socialOrders[npc.id]!;
    return workMode ? {kind: "home", face: workFace(npc)} : {kind: "free"};
  };

  // 릴레이 중 카메라는 접수대 앞 한 곳만 본다 — 화자가 바뀌어도 안 움직인다
  const hasFocus = !!focusNpcId;
  const focus = useMemo<[number, number, number] | null>(
    () => (hasFocus ? RELAY_FOCUS : null),
    [hasFocus]
  );

  const uiIn = (delay: number) => ({
    initial: {opacity: 0, y: 10},
    animate: {opacity: 1, y: 0},
    transition: {duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const}
  });

  return (
    <div className="fixed inset-0 z-40 bg-[#0b1626]">
      <Canvas
        // 카메라는 반드시 방 **안**에 있어야 한다. z=10.5(벽은 z=7)에 뒀더니
        // 앞 벽의 뒷면이 컬링돼 그대로 통과해 보였고, 벽 위로 배경이 드러나
        // 방이 아니라 무대처럼 보였다. OrbitControls 의 maxDistance 도 같은 이유로 묶는다.
        // 화각이 좁으면 양끝 작업대(x=±4.6)가 잘린다. 카메라를 더 빼면 벽을
        // 뚫으므로, 거리 대신 fov 로 넓힌다.
        camera={{fov: 68, position: [0, 3.3, 6.5]}}
        dpr={[1, 1.75]}
        gl={{antialias: true}}
        shadows
      >
        <color args={[NIGHT]} attach="background" />
        {/* 안개는 방보다 멀리서 시작해야 한다. 14부터 걸었더니 뒷벽(≈17 거리)이
            통째로 배경색에 먹혀 '허공에 뜬 가구'처럼 보였다. */}
        <fog args={[NIGHT, 26, 52]} attach="fog" />
        <ambientLight intensity={0.72} />
        <hemisphereLight args={["#5b7ea8", "#241a10", 1.0]} />
        <directionalLight
          castShadow
          color="#ffcf9a"
          intensity={0.55}
          position={[3, 7, 5]}
          shadow-mapSize={[1024, 1024]}
        />
        {/* 계단 쪽에서 들어오는 찬 빛 — 지하라는 인상을 만드는 반대편 광원 */}
        <directionalLight
          color="#8fb4dd"
          intensity={0.3}
          position={[0, 5, 9]}
        />

        <Suspense fallback={null}>
          <AtelierRoom />

          {BENCHES.map(bench => (
            <Workbench
              key={bench.kind}
              color={bench.color}
              kind={bench.kind}
              position={bench.position}
              rot={bench.rot}
            />
          ))}

          {atelierNpcs.map(npc => (
            <AtelierFigure
              key={npc.id}
              bubbleText={social.bubbles[npc.id]}
              emote={social.emotes[npc.id]}
              isIntake={npc.id === "atelier-intake-npc"}
              npc={npc}
              onArrive={handleArrive}
              onSelect={handleFigureClick}
              order={orderFor(npc)}
              positions={positionsRef}
              speaking={npc.id === focusNpcId}
            />
          ))}

          <CameraRig controls={controlsRef} focus={focus} />

          <ContactShadows
            blur={2.6}
            far={5}
            opacity={0.4}
            position={[0, 0.012, 0]}
            scale={22}
          />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            maxDistance={7.3}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={2.6}
            minPolarAngle={Math.PI / 5}
            target={[0, 1.15, -0.4]}
          />
        </Suspense>
      </Canvas>

      <motion.button
        {...uiIn(0.3)}
        className="v-panel fixed left-4 top-4 z-50 flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#f3e6c8] transition hover:brightness-125"
        onClick={onBack}
        type="button"
        whileHover={{x: -2}}
        whileTap={{scale: 0.96}}
      >
        ← 마을로 돌아가기
      </motion.button>

      <motion.div
        {...uiIn(0.4)}
        className="v-panel pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 px-5 py-2"
      >
        <span className="v-serif text-[13px] text-[#e2c078]">
          지하 의뢰 공방
        </span>
      </motion.div>

      {hideHints ? null : (
        <motion.div
          {...uiIn(0.55)}
          className="v-panel pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2.5 text-[9px]"
        >
          <span className="text-[#a9bdd6]/70">🖱 드래그</span>
          <span className="font-bold text-[#f3e6c8]">시점 회전</span>
          <span className="mx-1.5 h-3 w-px bg-[#e2c078]/25" />
          <span className="text-[#a9bdd6]/70">🖱 스크롤</span>
          <span className="font-bold text-[#f3e6c8]">줌</span>
          <span className="mx-1.5 h-3 w-px bg-[#e2c078]/25" />
          <span className="text-[#a9bdd6]/70">도안에게 말 걸면</span>
          <span className="font-bold text-[#ff9d38]">의뢰 접수</span>
        </motion.div>
      )}
    </div>
  );
}
