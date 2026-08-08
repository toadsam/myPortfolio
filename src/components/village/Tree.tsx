import type {Vector3Tuple} from "@/types/portfolio";

interface TreeProps {
  position: Vector3Tuple;
  scale?: number;
}

const CYBER_COLORS = [
  {trunk: "#0a1a2e", leaf1: "#003322", leaf2: "#004433", glow: "#00ff88"},
  {trunk: "#0a1a2e", leaf1: "#1a0033", leaf2: "#220044", glow: "#aa44ff"},
  {trunk: "#0a1a2e", leaf1: "#001a33", leaf2: "#002244", glow: "#00aaff"},
];

/** scale 1일 때의 나무 높이 — 꼭대기 네온 구체 윗면(1.78 + 반지름 0.09) */
const NATURAL_HEIGHT = 1.87;

// 나무 키는 건물 크기 사다리(constants.ts)의 표준 M = 1.9 에 맞춘다.
// 가로수가 1층 건물보다 크면 마을이 아니라 숲으로 읽혀서, 조금 낮은 0.85배를
// 기준으로 잡고 그루마다 흩뜨린다. 결과 높이는 1.49 ~ 1.78.
//
// 예전엔 VillageScene 쪽에서 scale 0.88~1.1 을 직접 줘서 최대 2.06까지 자랐다 —
// 표준 건물보다 큰 가로수였다.
const TARGET_HEIGHT = 1.9 * 0.85;

/** 그루마다 조금씩 다른 크기. 같은 자리엔 늘 같은 값이 나와야 배치가 안 흔들린다. */
export function treeScaleFor(index: number): number {
  const variance = index % 3 === 0 ? 1.1 : index % 2 === 0 ? 0.92 : 1.0;
  return Math.round(((TARGET_HEIGHT * variance) / NATURAL_HEIGHT) * 1000) / 1000;
}

export function Tree({position, scale = 1}: TreeProps) {
  const colorIdx = Math.floor((position[0] + position[2] + 10) * 3) % CYBER_COLORS.length;
  const c = CYBER_COLORS[colorIdx] ?? CYBER_COLORS[0]!;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 금속 기둥 */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.7, 8]} />
        <meshStandardMaterial color={c.trunk} roughness={0.3} metalness={0.85} emissive={c.glow} emissiveIntensity={0.08} />
      </mesh>
      {/* 하단 크라운 */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <coneGeometry args={[0.44, 0.88, 7]} />
        <meshStandardMaterial color={c.leaf1} roughness={0.5} metalness={0.4} emissive={c.glow} emissiveIntensity={0.12} />
      </mesh>
      {/* 상단 크라운 */}
      <mesh castShadow position={[0, 1.38, 0]}>
        <coneGeometry args={[0.32, 0.7, 7]} />
        <meshStandardMaterial color={c.leaf2} roughness={0.5} metalness={0.4} emissive={c.glow} emissiveIntensity={0.18} />
      </mesh>
      {/* 꼭대기 네온 (조명 대신 emissive 구체로 표현 — 실시간 조명 비용 제거) */}
      <mesh position={[0, 1.78, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color={c.glow} />
      </mesh>
    </group>
  );
}
