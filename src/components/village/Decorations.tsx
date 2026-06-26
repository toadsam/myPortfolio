import {Html} from "@react-three/drei";
import type {Vector3Tuple} from "@/types/portfolio";

interface PathSegmentProps {
  position: Vector3Tuple;
  length: number;
  width?: number;
  rotationZ?: number;
}

const NEON_COLORS: Record<string, string> = {
  LAB: "#00d4ff",
  SKILLS: "#00ff88",
  ARCHIVE: "#aa44ff",
  POST: "#ff6600",
};

export function PathSegment({length, position, rotationZ = 0, width = 0.48}: PathSegmentProps) {
  return (
    <group>
      {/* 도로 베이스 */}
      <mesh receiveShadow position={[position[0], 0.006, position[2]]} rotation={[-Math.PI / 2, 0, rotationZ]}>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#071525" roughness={0.9} metalness={0.3} />
      </mesh>
      {/* 네온 센터라인 */}
      <mesh position={[position[0], 0.012, position[2]]} rotation={[-Math.PI / 2, 0, rotationZ]}>
        <planeGeometry args={[length, 0.025]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export function Rock({position, scale = 1}: {position: Vector3Tuple; scale?: number}) {
  const colors = ["#0a2040", "#0a1830", "#071525"];
  const color = colors[Math.floor(scale * 10) % colors.length] ?? "#0a2040";
  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh castShadow position={[0, 0.08 * scale, 0]} scale={[0.28 * scale, 0.16 * scale, 0.22 * scale]} rotation={[0.1, 0.45, 0.02]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.6} emissive="#002244" emissiveIntensity={0.2} />
      </mesh>
      {/* 크랙 네온 글로우 */}
      <pointLight color="#00aaff" intensity={0.3} distance={1.2} decay={2} position={[0, 0.2 * scale, 0]} />
    </group>
  );
}

export function Fence({position, rotation = 0}: {position: Vector3Tuple; rotation?: number}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.75, 0, 0.75].map((x) => (
        <mesh castShadow key={x} position={[x, 0.28, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.56, 8]} />
          <meshStandardMaterial color="#0a1a30" roughness={0.4} metalness={0.8} emissive="#0044aa" emissiveIntensity={0.15} />
        </mesh>
      ))}
      {/* 에너지 배리어 */}
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[1.68, 0.04, 0.03]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[1.68, 0.025, 0.02]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.4} />
      </mesh>
      <pointLight color="#00d4ff" intensity={0.4} distance={2} decay={2} position={[0, 0.34, 0]} />
    </group>
  );
}

export function SignPost({label, position}: {label: string; position: Vector3Tuple}) {
  const color = NEON_COLORS[label] ?? "#00d4ff";
  return (
    <group position={position}>
      {/* 금속 기둥 */}
      <mesh castShadow position={[0, 0.33, 0]}>
        <cylinderGeometry args={[0.028, 0.035, 0.66, 8]} />
        <meshStandardMaterial color="#0a1a2e" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* 홀로그램 패널 */}
      <mesh castShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[0.9, 0.3, 0.04]} />
        <meshStandardMaterial color="#050d1a" roughness={0.2} metalness={0.7} emissive={color} emissiveIntensity={0.15} transparent opacity={0.85} />
      </mesh>
      {/* 테두리 글로우 */}
      <mesh position={[0, 0.72, 0.025]}>
        <boxGeometry args={[0.92, 0.32, 0.01]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={1.5} decay={2} position={[0, 0.72, 0.1]} />
      <Html center distanceFactor={10} position={[0, 0.75, 0.06]} zIndexRange={[5, 0]}>
        <span style={{
          fontFamily: "monospace",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.18em",
          color,
          textShadow: `0 0 8px ${color}`,
          userSelect: "none",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}>
          {">"} {label}
        </span>
      </Html>
    </group>
  );
}
