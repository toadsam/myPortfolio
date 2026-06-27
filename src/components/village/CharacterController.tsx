"use client";

import {useFrame, useThree} from "@react-three/fiber";
import {Suspense, useEffect, useRef} from "react";
import {Group, Vector3} from "three";
import {villageBuildings} from "@/lib/constants";
import {isWalkablePosition} from "@/lib/worldCollision";
import {WarriorCharacter, type MoveState} from "./WarriorCharacter";

const SPEED = 4.5;
const TURN_SPEED = 2.4;
const X_BOUND = 11.5;
const Z_BOUND_MIN = -8.8;
const Z_BOUND_MAX = 12.5;

export function CharacterController() {
  const {camera} = useThree();
  const groupRef = useRef<Group>(null);
  const posRef = useRef(new Vector3(0, 0, 3.5));
  const rotRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const camPosRef = useRef(new Vector3());
  const moveStateRef = useRef<MoveState>("idle");

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

    let nextX = posRef.current.x;
    let nextZ = posRef.current.z;

    if (keys.has("KeyW") || keys.has("ArrowUp")) {
      nextX += dx * speed;
      nextZ += dz * speed;
    }
    if (keys.has("KeyS") || keys.has("ArrowDown")) {
      nextX -= dx * speed * 0.6;
      nextZ -= dz * speed * 0.6;
    }

    nextX = Math.max(-X_BOUND, Math.min(X_BOUND, nextX));
    nextZ = Math.max(Z_BOUND_MIN, Math.min(Z_BOUND_MAX, nextZ));

    const movingForward = keys.has("KeyW") || keys.has("ArrowUp");
    const movingBack = keys.has("KeyS") || keys.has("ArrowDown");
    const running = keys.has("ShiftLeft") || keys.has("ShiftRight");

    let moved = false;
    if (isWalkablePosition({x: nextX, z: nextZ}, villageBuildings, {padding: 0.42})) {
      moved = nextX !== posRef.current.x || nextZ !== posRef.current.z;
      posRef.current.x = nextX;
      posRef.current.z = nextZ;
    }

    // 애니메이션 상태: 이동 중이면 걷기/달리기, 아니면 정지
    moveStateRef.current = (movingForward || movingBack) && moved
      ? (running && movingForward ? "run" : "walk")
      : "idle";

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
      {/* 애니메이션 캐릭터 */}
      <Suspense fallback={null}>
        <WarriorCharacter stateRef={moveStateRef} />
      </Suspense>
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
