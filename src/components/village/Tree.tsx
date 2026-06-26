import type {Vector3Tuple} from "@/types/portfolio";

interface TreeProps {
  position: Vector3Tuple;
  scale?: number;
}

export function Tree({position, scale = 1}: TreeProps) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 0.7, 8]} />
        <meshStandardMaterial color="#8c5d38" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <coneGeometry args={[0.46, 0.9, 7]} />
        <meshStandardMaterial color="#5b9c54" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 1.35, 0]}>
        <coneGeometry args={[0.35, 0.72, 7]} />
        <meshStandardMaterial color="#7fc76a" roughness={0.68} />
      </mesh>
    </group>
  );
}
