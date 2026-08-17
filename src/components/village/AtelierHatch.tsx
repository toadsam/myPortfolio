"use client";

/**
 * 지하 의뢰 공방으로 내려가는 해치 — 마을에 숨겨진 두 번째 입구.
 *
 * 널빤지 틈에서 아래쪽 랜턴빛이 새어 나온다.
 * (실사용 경로는 헤더 옆 상시 '제작 의뢰' 버튼이다 — 여긴 발견의 재미 담당.)
 *
 * ── 왜 옆에 표지판을 세웠나 ─────────────────────────────────────────────────
 * 처음엔 표지 없이 바닥 빛(opacity 0.16)만 뒀다. 결과는 **만든 사람도 못 찾는
 * 입구**였다 — 회색 포장 위의 짙은 갈색 널빤지가 부감 카메라에서는 바닥 얼룩과
 * 구분이 안 된다. 숨김이 재미가 되려면 "저기 뭔가 있다"까지는 보여야 한다.
 *
 * 표지판은 마을 간판 언어를 그대로 쓴다(Building.tsx 의 BuildingLabel 참고):
 * 크림색 나무판 + 갈색 테두리, 3D 가 아니라 DOM. draw call 이 0 이고,
 * 아무리 가까이 가도 글자가 안 뭉개진다. 대신 판을 매단 **기둥만 3D** 로 둬서
 * 허공에 뜬 칩이 아니라 땅에 박힌 팻말로 읽히게 했다.
 *
 * 높이는 절대 좌표에 굽지 않고 terrainHeightAt 으로 렌더 때 얹는다.
 * 마을 규칙: 바닥 타일·건물·NPC·프롭이 전부 같은 함수를 본다.
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

// 중앙 광장 남동쪽, 우물(5.74, 3.32) 바로 옆. 광장 포장 위라 지면이 평평하다.
const HATCH_X = 4.2;
const HATCH_Z = 3.4;

// 팻말은 해치 서쪽 가장자리에. 동쪽은 우물, 북쪽은 화단, 북동쪽은 개러랜드가
// 이미 차지하고 있어 이쪽만 비어 있다(가장 가까운 프롭이 1.3 유닛 밖).
const SIGN_X = -1.4;
const SIGN_Z = 0;

export function AtelierHatch({onEnter}: {onEnter: () => void}) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<Mesh>(null);
  const tRef = useRef(0);
  const litRef = useRef(0);
  const calculatePosition = useMemo(
    () => createThrottledCalculatePosition(LABEL_SYNC_STRIDE),
    []
  );
  useCursor(hovered);

  useFrame((_, delta) => {
    tRef.current += delta;
    // alpha 를 1 로 묶는다 — 탭이 쉬었다 돌아오면 delta 가 커져 lerp 가 튄다
    litRef.current = MathUtils.lerp(
      litRef.current,
      hovered ? 1 : 0,
      Math.min(1, delta * 6)
    );
    const material = glowRef.current?.material;
    if (material && !Array.isArray(material) && "opacity" in material) {
      // 아래 공방 랜턴이 흔들리는 것처럼 틈새 빛도 같이 일렁인다
      const flicker = 0.82 + Math.sin(tRef.current * 2.4) * 0.12;
      material.opacity = (0.26 + litRef.current * 0.6) * flicker;
    }
  });

  const y = terrainHeightAt(HATCH_X, HATCH_Z);

  return (
    <group
      position={[HATCH_X, y, HATCH_Z]}
      onClick={event => {
        event.stopPropagation();
        onEnter();
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* 돌 테두리 */}
      <mesh
        receiveShadow
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial color="#5c5a52" roughness={0.95} />
      </mesh>

      {/* 널빤지 문짝 — 사이를 살짝 띄워 빛이 새게 한다 */}
      {[-0.6, -0.2, 0.2, 0.6].map(x => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.06, 0]}>
          <boxGeometry args={[0.36, 0.09, 1.7]} />
          <meshStandardMaterial
            color={hovered ? "#5b3d24" : "#432b18"}
            roughness={0.85}
          />
        </mesh>
      ))}

      {/* 틈새로 새어 나오는 지하 랜턴빛 */}
      <mesh
        ref={glowRef}
        position={[0, 0.025, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.72, 1.72]} />
        <meshBasicMaterial color="#ff9d38" transparent opacity={0.26} />
      </mesh>

      {/* 쇠테와 손잡이 고리 */}
      {[-0.72, 0.72].map(z => (
        <mesh key={z} castShadow position={[0, 0.11, z]}>
          <boxGeometry args={[1.72, 0.05, 0.13]} />
          <meshStandardMaterial
            color="#2f2a26"
            metalness={0.5}
            roughness={0.6}
          />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.035, 8, 20]} />
        <meshStandardMaterial color="#3a332c" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* 실광원(pointLight)은 쓰지 않는다. 마을 규약이 "진짜 pointLight 는 4개"라
          가로등 수십 개도 전부 가산 원반으로 흉내 낸다(VillageScene 의 LampPools).
          여기에 하나 더 얹으면 마을 전 재질의 라이트 순열이 바뀌어 셰이더가
          다시 컴파일되고, 매 픽셀 조명 비용도 늘어난다. 같은 수법으로 바닥에
          호박빛을 깔아 "아래에서 빛이 샌다"를 만든다. */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[hovered ? 2.6 : 1.5, 24]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#ffbe74"
          depthWrite={false}
          opacity={hovered ? 0.5 : 0.16}
          transparent
        />
      </mesh>

      {/* ── 팻말 ── 기둥만 3D, 판은 DOM(마을 간판 규칙) */}
      <group position={[SIGN_X, 0, SIGN_Z]}>
        {/* 땅에 박힌 기둥 */}
        <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.055, 0.07, 0.84, 7]} />
          <meshStandardMaterial color="#6b4a2c" roughness={0.9} />
        </mesh>
        {/* 판을 매다는 가로대 */}
        <mesh castShadow position={[0, 0.8, 0]}>
          <boxGeometry args={[0.44, 0.055, 0.07]} />
          <meshStandardMaterial color="#54381f" roughness={0.9} />
        </mesh>
        {/* 발치 받침돌 — 기둥이 포장에 그냥 꽂힌 것처럼 보이지 않게 */}
        <mesh receiveShadow position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.2, 0.24, 0.06, 10]} />
          <meshStandardMaterial color="#5c5a52" roughness={0.95} />
        </mesh>

        <Html
          center
          calculatePosition={calculatePosition}
          distanceFactor={11}
          position={[0, 1.16, 0]}
          zIndexRange={[10, 0]}
        >
          <button
            onClick={event => {
              event.stopPropagation();
              onEnter();
            }}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            type="button"
            style={{
              // 마을 건물 간판과 같은 크림색 나무판 + 갈색 테두리.
              // 여기만 다른 톤을 쓰면 "UI 칩"으로 도로 읽힌다.
              background:
                "linear-gradient(#fdf3df 0%, #f6e7c8 55%, #e8d3ac 100%)",
              border: `3px solid ${hovered ? "#ff9d38" : "#8a5a33"}`,
              borderRadius: 10,
              padding: "6px 12px",
              cursor: "pointer",
              boxShadow: hovered
                ? "0 0 0 2px rgba(255,157,56,0.4), 0 6px 14px rgba(40,24,10,0.45)"
                : "0 4px 10px rgba(40,24,10,0.35)",
              transition:
                "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
              transform: hovered ? "scale(1.08)" : "scale(1)",
              textAlign: "center",
              whiteSpace: "nowrap",
              userSelect: "none",
              fontFamily: "system-ui, sans-serif"
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 800,
                color: "#4a2f18",
                letterSpacing: "0.02em"
              }}
            >
              의뢰 공방
            </span>
            <span
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 700,
                color: "#8a5a33",
                marginTop: 1
              }}
            >
              지하 ↓
            </span>
          </button>
        </Html>
      </group>
    </group>
  );
}
