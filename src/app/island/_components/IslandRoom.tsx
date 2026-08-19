"use client";

/**
 * 작업실 — 섬의 3D 배경.
 *
 * ## 이 방은 조작 화면이 아니라 **배경**이다
 *
 * 퀘스트 4칸을 3D 판자에 박아 넣고 싶은 유혹이 있었지만 안 했다. 작은 판을
 * 마우스로 조준해서 누르는 건 HTML 버튼보다 무조건 나쁘고, 이 앱은 매일 여는
 * 물건이라 그 손해가 매일 쌓인다. 그래서 **3D는 분위기만 맡고 조작은 위에
 * 얹힌 HTML 패널이 한다** — 마을이 3D + HUD 로 나뉜 것과 같은 구조다.
 *
 * 대신 방이 죽어 있지는 않게, **오늘 채운 칸 수만큼 등불이 밝아진다.**
 * 마을이 내 기록으로 불이 켜지는 것과 같은 장치를 방 하나 안에서 한다.
 *
 * ## 무게 규칙
 *
 * - **`pointLight` 는 2개까지.** 실광원 하나가 늘 때마다 모든 재질의 셰이더가
 *   다시 컴파일된다(마을에서 상한을 4로 잡은 이유와 같다).
 * - 카메라는 **고정 1대**. 돌아다니는 게 목적이 아니라 게시판을 보는 게 목적이라
 *   OrbitControls 를 안 쓴다 — 마우스에 아주 약하게만 따라간다.
 * - GLB 는 기존 마을 프롭 재사용, 합계 약 1.6 MB (마을 30 MB 의 1/19).
 *
 * 이 파일은 **`page.tsx` 에서 `dynamic(..., {ssr:false})` 로만 불린다.**
 * 그래야 모바일이 three.js 를 아예 안 받는다.
 */

import {Suspense, useEffect, useMemo, useRef, useState} from "react";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {useGLTF} from "@react-three/drei";
import * as THREE from "three";
import {SkeletonUtils} from "three-stdlib";
import {
  COACH,
  ROOM_GLBS,
  ROOM_PROPS,
  ROOM_SIZE,
  placementOf,
  type RoomProp
} from "@/app/island/_lib/roomLayout";

ROOM_GLBS.forEach(url => useGLTF.preload(url));

export function IslandRoom({doneCount}: {doneCount: number}) {
  return (
    <Canvas
      camera={{position: [0, 2.6, 6.2], fov: 48}}
      // 배경 뒤에 깔리는 판이라 클릭을 통과시킨다 — 위의 HTML 패널이 주인공이다.
      className="pointer-events-none"
      dpr={[1, 1.6]}
      gl={{antialias: true}}
      shadows={false}
    >
      {/* 불투명 배경. 투명하게 두면 페이지 그라디언트가 비쳐서 방인지 배경인지
          구분이 안 되고, 캔버스가 실제로 그리고 있는지도 알 수 없다. */}
      <color args={["#0b1626"]} attach="background" />
      <SceneTone />
      <Suspense fallback={null}>
        <Room doneCount={doneCount} />
      </Suspense>
    </Canvas>
  );
}

/** 밤하늘 안개 + 카메라가 볼 곳. 페이지 배경색과 같은 값이라 경계가 안 보인다. */
function SceneTone() {
  const {camera, scene} = useThree();
  useEffect(() => {
    camera.lookAt(0, 1.4, -3.0);
    // 안개는 뒷벽 너머만 먹도록 — 너무 앞에서 시작하면 방 전체가 뿌예진다.
    scene.fog = new THREE.Fog("#0b1626", 11, 22);
    return () => {
      scene.fog = null;
    };
  }, [camera, scene]);
  return null;
}

function Room({doneCount}: {doneCount: number}) {
  // 0칸이면 어둑하고, 4칸이면 방이 환해진다.
  // 0칸이어도 방은 보여야 한다 — 첫 배치에서 바닥이 새까매서 뭐가 있는지
  // 알 수가 없었다. 바닥값을 올리고, 다 채웠을 때의 차이는 그대로 크게 둔다.
  const warmth = 0.62 + (doneCount / 4) * 0.85;

  return (
    <group>
      <Parallax />

      {/* 은은한 바탕광 — 실광원 예산을 안 먹는다 */}
      <ambientLight color="#5d7ba0" intensity={2.1} />
      <hemisphereLight
        args={["#4a6f96", "#2a1d10", 1.2]}
        position={[0, 4, 0]}
      />

      {/* ── 실광원 2개, 이게 상한이다 ── */}
      <pointLight
        color="#ffb055"
        distance={20}
        intensity={26 * warmth}
        position={[3.6, 2.9, -3.4]}
      />
      <Hearth intensity={16 * warmth} />

      <Floor />
      <Walls />

      {ROOM_PROPS.map((prop, index) => (
        <Prop key={`${prop.glb}-${index}`} prop={prop} />
      ))}
      <Prop prop={COACH} />

      {/* 게시판 앞 바닥 빛무리 — 실광원을 더 쓰지 않고 밝기를 흉내 낸다.
          (마을에서 가로등 개수를 늘리는 대신 쓰는 것과 같은 수법) */}
      <mesh position={[0, 0.012, -4.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.1, 28]} />
        <meshBasicMaterial
          color="#ff9d38"
          opacity={0.05 + (doneCount / 4) * 0.16}
          transparent
        />
      </mesh>
    </group>
  );
}

/** 화덕 불빛 — 세기가 미세하게 흔들린다. 고정 밝기면 방이 사진처럼 죽는다. */
function Hearth({intensity}: {intensity: number}) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({clock}) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.intensity =
      intensity * (0.86 + 0.14 * Math.sin(t * 7.3) * Math.sin(t * 3.1));
  });
  return (
    <pointLight
      color="#ff7a2f"
      distance={15}
      position={[-3.4, 0.85, -3.2]}
      ref={ref}
    />
  );
}

/**
 * 마우스를 아주 약하게 따라가는 카메라.
 *
 * OrbitControls 를 안 쓰는 이유: 이 화면 위에는 입력칸이 있는 HTML 패널이 떠
 * 있어서, 드래그로 화면이 돌아가면 글자 선택이 안 된다. 시선만 살짝 움직인다.
 */
function Parallax() {
  const {camera} = useThree();
  const target = useRef({x: 0, y: 0});

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      target.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    camera.position.x += (target.current.x * 0.28 - camera.position.x) * 0.04;
    camera.position.y +=
      (2.6 - target.current.y * 0.16 - camera.position.y) * 0.04;
    camera.lookAt(0, 1.4, -3.0);
  });
  return null;
}

function Floor() {
  return (
    <mesh position={[0, 0, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ROOM_SIZE + 6, ROOM_SIZE + 6]} />
      <meshStandardMaterial color="#3d2f20" metalness={0} roughness={0.95} />
    </mesh>
  );
}

/** 뒷벽과 옆벽. GLB 없이 판 세 장 — 안 그러면 방이 허공에 뜬다. */
function Walls() {
  const half = ROOM_SIZE / 2;
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#243149",
        roughness: 1,
        metalness: 0
      }),
    []
  );
  return (
    <group>
      <mesh material={material} position={[0, 2.2, -half - 0.4]}>
        <planeGeometry args={[ROOM_SIZE + 6, 5]} />
      </mesh>
      <mesh
        material={material}
        position={[-half - 0.4, 2.2, -2.5]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[ROOM_SIZE + 6, 5]} />
      </mesh>
      <mesh
        material={material}
        position={[half + 0.4, 2.2, -2.5]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[ROOM_SIZE + 6, 5]} />
      </mesh>
    </group>
  );
}

function Prop({prop}: {prop: RoomProp}) {
  const {scene} = useGLTF(prop.glb);
  const {scale, y} = placementOf(prop);
  // **`scene.clone()` 은 캐릭터를 조용히 망가뜨린다.** 스킨드 메시를 그렇게
  // 복제하면 복제본이 원본의 스켈레톤을 계속 참조해서, 화면에 아무것도 안
  // 그려진다 — 에러도 경고도 없다. 코치 로봇이 실제로 이렇게 사라졌고,
  // 좌표를 세 번이나 옮겨보고 나서야 원인을 찾았다.
  // 마을도 같은 이유로 `NpcCharacter.tsx` 에서 SkeletonUtils.clone 을 쓴다.
  //
  // useGLTF 는 같은 URL 에 같은 scene 을 돌려주므로, 한 URL 을 두 번 놓으려면
  // 복제가 필요하다. 복제 자체는 유지하되 방법만 안전한 쪽으로 바꾼다.
  const object = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  return (
    <primitive
      object={object}
      position={[prop.at[0], y, prop.at[1]]}
      rotation={[0, prop.rotationY ?? 0, 0]}
      scale={scale}
    />
  );
}
