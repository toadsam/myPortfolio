"use client";

import {useFrame, useThree} from "@react-three/fiber";
import {useEffect, useRef} from "react";
import {Group, Vector3} from "three";

const SPEED = 4.5;
const TURN_SPEED = 2.4;
const X_BOUND = 6.2;
const Z_BOUND_MIN = -5.2;
const Z_BOUND_MAX = 5.8;

export function CharacterController() {
  const {camera} = useThree();
  const groupRef = useRef<Group>(null);
  const posRef = useRef(new Vector3(0, 0, 3.5));
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

    posRef.current.x = Math.max(-X_BOUND, Math.min(X_BOUND, posRef.current.x));
    posRef.current.z = Math.max(Z_BOUND_MIN, Math.min(Z_BOUND_MAX, posRef.current.z));

    if (groupRef.current) {
      groupRef.current.position.set(posRef.current.x, 0, posRef.current.z);
      groupRef.current.rotation.y = rotRef.current;
    }

    // 캐릭터 뒤 + 위에서 따라오는 3인칭 카메라
    camPosRef.current.set(
      posRef.current.x + Math.sin(rotRef.current) * 5.5,
      3.8,
      posRef.current.z + Math.cos(rotRef.current) * 5.5
    );
    camera.position.lerp(camPosRef.current, 0.1);
    camera.lookAt(posRef.current.x, 0.8, posRef.current.z);
  });

  return (
    <group ref={groupRef} position={[0, 0, 3.5]}>
      {/* 몸 */}
      <mesh castShadow position={[0, 0.52, 0]}>
        <capsuleGeometry args={[0.2, 0.42, 6, 12]} />
        <meshStandardMaterial color="#5f9f4f" roughness={0.58} />
      </mesh>
      {/* 머리 */}
      <mesh castShadow position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.23, 18, 18]} />
        <meshStandardMaterial color="#fff3d2" roughness={0.5} />
      </mesh>
      {/* 방향 링 */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.38, 24]} />
        <meshBasicMaterial color="#7ed957" transparent opacity={0.9} />
      </mesh>
      {/* 전방 방향 표시 */}
      <mesh position={[0, 0.04, -0.48]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 12]} />
        <meshBasicMaterial color="#7ed957" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
