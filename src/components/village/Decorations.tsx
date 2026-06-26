import {Html} from "@react-three/drei";
import type {Vector3Tuple} from "@/types/portfolio";

interface PathSegmentProps {
  position: Vector3Tuple;
  length: number;
  width?: number;
  rotationZ?: number;
}

export function PathSegment({length, position, rotationZ = 0, width = 0.48}: PathSegmentProps) {
  return (
    <mesh receiveShadow position={[position[0], 0.012, position[2]]} rotation={[-Math.PI / 2, 0, rotationZ]}>
      <planeGeometry args={[length, width]} />
      <meshStandardMaterial color="#e4cf98" roughness={0.84} />
    </mesh>
  );
}

export function Rock({position, scale = 1}: {position: Vector3Tuple; scale?: number}) {
  return (
    <mesh castShadow position={[position[0], 0.08 * scale, position[2]]} scale={[0.28 * scale, 0.16 * scale, 0.22 * scale]} rotation={[0.1, 0.45, 0.02]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#b5b09a" roughness={0.86} />
    </mesh>
  );
}

export function Fence({position, rotation = 0}: {position: Vector3Tuple; rotation?: number}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.75, 0, 0.75].map((x) => (
        <mesh castShadow key={x} position={[x, 0.28, 0]}>
          <cylinderGeometry args={[0.035, 0.045, 0.56, 8]} />
          <meshStandardMaterial color="#9a7048" roughness={0.72} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.34, 0]}>
        <boxGeometry args={[1.68, 0.08, 0.06]} />
        <meshStandardMaterial color="#b98755" roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[1.68, 0.07, 0.055]} />
        <meshStandardMaterial color="#b98755" roughness={0.72} />
      </mesh>
    </group>
  );
}

export function SignPost({label, position}: {label: string; position: Vector3Tuple}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.33, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.66, 8]} />
        <meshStandardMaterial color="#8b5a35" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[0.86, 0.32, 0.08]} />
        <meshStandardMaterial color="#f4e4ad" roughness={0.68} />
      </mesh>
      <Html center distanceFactor={10} position={[0, 0.75, 0.055]} zIndexRange={[5, 0]}>
        <span className="sign-label">{label}</span>
      </Html>
    </group>
  );
}
