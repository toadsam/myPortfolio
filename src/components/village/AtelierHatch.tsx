"use client";

/**
 * 지하 의뢰 공방으로 내려가는 해치 — 마을에 숨겨진 두 번째 입구.
 *
 * "숨겨진 공간"이 컨셉이라 평소엔 눈에 잘 안 띈다. 대신 널빤지 틈에서 아래쪽
 * 랜턴빛이 은은하게 새어 나와, 유심히 보는 사람만 알아챈다.
 * (실사용 경로는 헤더 옆 상시 '제작 의뢰' 버튼이다 — 여긴 발견의 재미 담당.)
 *
 * 높이는 절대 좌표에 굽지 않고 terrainHeightAt 으로 렌더 때 얹는다.
 * 마을 규칙: 바닥 타일·건물·NPC·프롭이 전부 같은 함수를 본다.
 */

import {Html} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useRef, useState} from "react";
import {MathUtils, type Mesh} from "three";
import {terrainHeightAt} from "@/lib/villageTerrain";

// 중앙 광장 남동쪽 모서리 바로 옆. 광장 단 위라 지면이 확실히 평평하다.
const HATCH_X = 4.2;
const HATCH_Z = 3.4;

export function AtelierHatch({onEnter}: {onEnter: () => void}) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<Mesh>(null);
  const tRef = useRef(0);
  const litRef = useRef(0);

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

      <pointLight
        color="#ffbe74"
        decay={2}
        distance={hovered ? 6 : 2.6}
        intensity={hovered ? 2.4 : 0.55}
        position={[0, 0.35, 0]}
      />

      {hovered ? (
        <Html
          center
          distanceFactor={14}
          position={[0, 1.15, 0]}
          zIndexRange={[6, 0]}
        >
          <div
            style={{
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
              textAlign: "center",
              fontFamily: "system-ui, sans-serif"
            }}
          >
            <div
              style={{
                display: "inline-block",
                borderRadius: 9,
                border: "1.5px solid #ff9d38",
                background: "rgba(11,22,38,0.92)",
                padding: "5px 13px",
                boxShadow: "0 0 18px rgba(255,157,56,0.45)"
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: "#ff9d38",
                  letterSpacing: "0.1em"
                }}
              >
                지하로 내려가기 ↓
              </div>
              <div style={{fontSize: 9, color: "#a9bdd6", marginTop: 2}}>
                아래에서 불빛이 새어 나온다
              </div>
            </div>
          </div>
        </Html>
      ) : null}
    </group>
  );
}
