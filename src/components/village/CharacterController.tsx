"use client";

import {useFrame, useThree} from "@react-three/fiber";
import {Suspense, useEffect, useRef} from "react";
import {Group, Vector3} from "three";
import {slideTo, SPAWN, walkHeightAt} from "@/lib/villageWalk";
import {WADE_MAX} from "@/lib/villageTerrain";
import {WarriorCharacter, type MoveState} from "./WarriorCharacter";

const SPEED = 4.5;
const TURN_SPEED = 2.4;

export function CharacterController() {
  const {camera} = useThree();
  const regress = useThree(s => s.performance.regress);
  const groupRef = useRef<Group>(null);
  const posRef = useRef(new Vector3(SPAWN[0], 0, SPAWN[1]));
  const rotRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const camPosRef = useRef(new Vector3());
  const moveStateRef = useRef<MoveState>("idle");
  /** 구역 단차에서 지금 밟고 있는 단 높이 (감쇠 중인 값) */
  const groundYRef = useRef(0);

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
    // 물속에서는 느려진다 — 허리 깊이에서 절반. 감쇠 중인 groundY(음수 = 잠긴
    // 깊이)를 그대로 쓰므로 들어갈수록 서서히 무거워지고, 나오면 서서히 풀린다.
    const wade = Math.max(0, -groundYRef.current) / WADE_MAX;
    const speed = SPEED * (1 - 0.5 * Math.min(1, wade)) * delta;
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

    const movingForward = keys.has("KeyW") || keys.has("ArrowUp");
    const movingBack = keys.has("KeyS") || keys.has("ArrowDown");
    const running = keys.has("ShiftLeft") || keys.has("ShiftRight");

    // 범위 제한도 막힘 판정도 villageWalk 이 한다 — 광장 중심의 원반이라
    // 사각형으로 자르면 모서리에서 갈 수 있는 데와 없는 데가 어긋난다.
    const at = slideTo(posRef.current.x, posRef.current.z, nextX, nextZ);
    const moved = at.x !== posRef.current.x || at.z !== posRef.current.z;
    posRef.current.x = at.x;
    posRef.current.z = at.z;

    // 애니메이션 상태: 이동 중이면 걷기/달리기, 아니면 정지
    moveStateRef.current =
      (movingForward || movingBack) && moved
        ? running && movingForward
          ? "run"
          : "walk"
        : "idle";

    if (
      moved ||
      keys.has("KeyA") ||
      keys.has("KeyD") ||
      keys.has("ArrowLeft") ||
      keys.has("ArrowRight")
    ) {
      // regress() 를 뺐다 — 걸어다니는 내내 해상도가 깎여 화면이 흐려졌다.
      // 자세한 경위는 CameraController 의 전환 regress 주석 참고(해상도 조절이
      // 두 겹이라 곱해지고, 복구도 안 됐다).
    }

    // 구역 단차와 **물 깊이** — walkHeightAt 은 단 위에서 +1.1, 물속에서 음수다.
    // 그냥 대입하면 경계에서 툭 튀므로 목표 높이로 감쇠시킨다. 물에 들어갈 때도
    // 같은 감쇠가 발목 → 무릎 → 허리로 잠기는 템포를 만든다.
    const groundTarget = walkHeightAt(posRef.current.x, posRef.current.z);
    groundYRef.current +=
      (groundTarget - groundYRef.current) * Math.min(1, delta * 7);
    const groundY = groundYRef.current;

    if (groupRef.current) {
      groupRef.current.position.set(
        posRef.current.x,
        groundY,
        posRef.current.z
      );
      groupRef.current.rotation.y = rotRef.current;
    }

    // 캐릭터 뒤 + 위에서 따라오는 3인칭 카메라
    camPosRef.current.set(
      posRef.current.x + Math.sin(rotRef.current) * 5.5,
      3.8 + groundY,
      posRef.current.z + Math.cos(rotRef.current) * 5.5
    );
    camera.position.lerp(camPosRef.current, 0.1);
    camera.lookAt(posRef.current.x, groundY + 0.8, posRef.current.z);
  });

  return (
    <group ref={groupRef} position={[SPAWN[0], 0, SPAWN[1]]}>
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
