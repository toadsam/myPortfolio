"use client";

import {useFrame, useThree} from "@react-three/fiber";
import {useEffect, useRef} from "react";
import {Group, Vector3} from "three";

const SPEED = 4.2;
const TURN_SPEED = 2.2;

interface Bounds {
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
}

interface Props {
  bounds?: Bounds;
  startPosition?: [number, number, number];
}

export function InteriorCharacterController({
  bounds = {xMin: -5.5, xMax: 5.5, zMin: -4.5, zMax: 4.5},
  startPosition = [0, 0, 3.5]
}: Props) {
  const {camera} = useThree();
  const groupRef = useRef<Group>(null);
  const posRef = useRef(new Vector3(...startPosition));
  const rotRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const camPosRef = useRef(new Vector3());

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      keysRef.current.add(e.code);
    }
    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.code);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    const speed = SPEED * delta;
    const turn = TURN_SPEED * delta;

    if (keys.has("KeyA") || keys.has("ArrowLeft")) rotRef.current += turn;
    if (keys.has("KeyD") || keys.has("ArrowRight")) rotRef.current -= turn;

    const dx = -Math.sin(rotRef.current);
    const dz = -Math.cos(rotRef.current);

    if (keys.has("KeyW") || keys.has("ArrowUp")) {
      posRef.current.x += dx * speed;
      posRef.current.z += dz * speed;
    }
    if (keys.has("KeyS") || keys.has("ArrowDown")) {
      posRef.current.x -= dx * speed * 0.6;
      posRef.current.z -= dz * speed * 0.6;
    }

    posRef.current.x = Math.max(
      bounds.xMin,
      Math.min(bounds.xMax, posRef.current.x)
    );
    posRef.current.z = Math.max(
      bounds.zMin,
      Math.min(bounds.zMax, posRef.current.z)
    );

    if (groupRef.current) {
      groupRef.current.position.set(posRef.current.x, 0, posRef.current.z);
      groupRef.current.rotation.y = rotRef.current;
    }

    camPosRef.current.set(
      posRef.current.x + Math.sin(rotRef.current) * 5.2,
      3.5,
      posRef.current.z + Math.cos(rotRef.current) * 5.2
    );
    camera.position.lerp(camPosRef.current, 0.1);
    camera.lookAt(posRef.current.x, 0.8, posRef.current.z);
  });

  return (
    <group ref={groupRef} position={startPosition}>
      <mesh castShadow position={[0, 0.52, 0]}>
        <capsuleGeometry args={[0.2, 0.42, 6, 12]} />
        <meshStandardMaterial color="#5f9f4f" roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.23, 18, 18]} />
        <meshStandardMaterial color="#fff3d2" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.38, 24]} />
        <meshBasicMaterial color="#7ed957" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.04, -0.48]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 12]} />
        <meshBasicMaterial color="#7ed957" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
