"use client";

/**
 * 갓생 섬으로 떠나는 선착장 — 마을에 걸린 세 번째 입구.
 *
 * ## 왜 여기(11.2, 15.6)인가 — 눈대중이 아니라 실측이다
 *
 * 마을 좌표를 0.4 간격으로 훑어서 **① 섬(단) 위이면서 ② 바로 옆이 물이고
 * ③ 기존 프롭에서 1.6 유닛 이상 떨어진** 자리를 전부 뽑았다(21곳). 그중
 * `life`(일상) 구역 물가를 골랐다 — 갓생 섬이 운동·공부 기록이라 주제가 맞고,
 * 물가까지 0.56 유닛, 가장 가까운 프롭까지 1.84 유닛으로 넉넉하다.
 *
 * ## 왜 손님에게는 안 보이는가
 *
 * 섬은 내 운동 기록과 연속 기록이 있는 **비공개** 공간이다. 채용 담당자가
 * 부두를 눌러 로그인 벽을 만나면 그건 재미가 아니라 막다른 길이다.
 * (공방 해치는 반대다 — 손님이 실제로 쓸 수 있는 곳이라 누구에게나 보인다.)
 * 그래서 관리자 토큰이 있을 때만 렌더한다.
 *
 * ## 새 GLB 를 안 쓴다
 *
 * 부두는 판자 몇 장이면 되는 모양이라 박스로 짠다. `AtelierHatch` 가 널빤지를
 * 그렇게 만든 것과 같은 이유 — GLB 하나가 곧 다운로드 수백 KB 다.
 * 높이는 절대 좌표로 굽지 않고 `terrainHeightAt` 으로 렌더 때 얹는다(마을 규칙).
 */

import {Html, useCursor} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useMemo, useRef, useState} from "react";
import {AdditiveBlending, MathUtils, type Mesh} from "three";
import {
  createThrottledCalculatePosition,
  LABEL_SYNC_STRIDE
} from "@/lib/htmlLabelThrottle";
import {terrainHeightAt} from "@/lib/villageTerrain";

// life 구역 서쪽 물가. 위 주석의 스캔으로 고른 자리다.
const DOCK_X = 11.2;
const DOCK_Z = 15.6;

/** 판자가 뻗는 방향 — 섬 중심(20.7, 12.0) 반대쪽, 즉 물 쪽으로 */
const OUT_ANGLE = Math.atan2(DOCK_X - 20.7, DOCK_Z - 12.0);

const PLANK_COUNT = 5;
const PLANK_LEN = 0.42;

export function IslandDock({onDepart}: {onDepart: () => void}) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<Mesh>(null);
  const tRef = useRef(0);
  const litRef = useRef(0);
  const calculatePosition = useMemo(
    () => createThrottledCalculatePosition(LABEL_SYNC_STRIDE),
    []
  );
  useCursor(hovered);

  const groundY = useMemo(() => terrainHeightAt(DOCK_X, DOCK_Z), []);

  useFrame((_, delta) => {
    tRef.current += delta;
    // alpha 를 1 로 묶는다 — 탭이 쉬었다 돌아오면 delta 가 커져 lerp 가 튄다
    // (AtelierHatch 에서 이미 겪은 문제라 같은 방식으로 막는다)
    litRef.current = MathUtils.lerp(
      litRef.current,
      hovered ? 1 : 0,
      Math.min(1, delta * 6)
    );
    if (glowRef.current) {
      const material = glowRef.current.material as {opacity: number};
      // 물결처럼 아주 느리게 숨 쉰다. 호버하면 확 밝아진다.
      material.opacity =
        0.14 + Math.sin(tRef.current * 1.4) * 0.04 + litRef.current * 0.3;
    }
  });

  return (
    <group position={[DOCK_X, groundY, DOCK_Z]} rotation={[0, OUT_ANGLE, 0]}>
      {/* 클릭 판 — 판자보다 넉넉하게 잡아야 부감에서 누르기 쉽다 */}
      <mesh
        onClick={event => {
          event.stopPropagation();
          onDepart();
        }}
        onPointerOut={() => setHovered(false)}
        onPointerOver={event => {
          event.stopPropagation();
          setHovered(true);
        }}
        position={[0, 0.02, PLANK_LEN * PLANK_COUNT * 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.5, PLANK_LEN * PLANK_COUNT + 0.6]} />
        <meshBasicMaterial opacity={0} transparent />
      </mesh>

      {/* 판자 — 물 쪽으로 갈수록 살짝 낮아져 잠기는 느낌 */}
      {Array.from({length: PLANK_COUNT}, (_, i) => (
        <mesh key={i} position={[0, 0.03 - i * 0.012, 0.3 + i * PLANK_LEN]}>
          <boxGeometry args={[1.05, 0.05, PLANK_LEN * 0.82]} />
          <meshStandardMaterial
            color={i % 2 ? "#6b4a2c" : "#7a5636"}
            metalness={0}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* 부두 끝 물빛 — 실광원을 안 쓰고 가산 블렌딩 판으로 흉내 낸다
          (마을이 가로등 개수를 늘리는 대신 쓰는 것과 같은 수법) */}
      <mesh
        position={[0, 0.012, 0.3 + PLANK_COUNT * PLANK_LEN]}
        ref={glowRef}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.15, 24]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#ffb055"
          depthWrite={false}
          opacity={0.14}
          transparent
        />
      </mesh>

      {/* 팻말 기둥만 3D. 판은 DOM 이라 가까이 가도 글자가 안 뭉개진다.
          (Building.tsx 의 BuildingLabel · AtelierHatch 와 같은 규칙) */}
      <mesh position={[-0.85, 0.45, 0.1]}>
        <cylinderGeometry args={[0.045, 0.05, 0.9, 6]} />
        <meshStandardMaterial color="#5d4326" metalness={0} roughness={1} />
      </mesh>

      <Html
        calculatePosition={calculatePosition}
        center
        distanceFactor={9}
        position={[-0.85, 1.05, 0.1]}
        zIndexRange={[20, 0]}
      >
        <button
          className="v-panel whitespace-nowrap px-2.5 py-1.5 text-[11px] font-black text-[#f3e6c8] transition"
          onClick={event => {
            event.stopPropagation();
            onDepart();
          }}
          onPointerOut={() => setHovered(false)}
          onPointerOver={() => setHovered(true)}
          style={{
            transform: hovered ? "translateY(-2px)" : "none",
            filter: hovered ? "brightness(1.25)" : "none"
          }}
          type="button"
        >
          갓생 섬 선착장
        </button>
      </Html>
    </group>
  );
}
