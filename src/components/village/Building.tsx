"use client";

import {Html, useCursor, useGLTF} from "@react-three/drei";
import {memo, useMemo, useRef, useState} from "react";
import {useFrame, type ThreeEvent} from "@react-three/fiber";
import {AdditiveBlending, Box3, BoxGeometry, EdgesGeometry, type Mesh} from "three";
import {lightIntensity} from "@/lib/liveState";
import {createThrottledCalculatePosition, LABEL_SYNC_STRIDE} from "@/lib/htmlLabelThrottle";
import type {BuildingState} from "@/types/live";
import type {BuildingData} from "@/types/portfolio";
import buildingModelsJson from "@/data/buildingModels.json";
import {techIcons} from "@/data/techIcons";

// 생성된 JSON이라 키가 그때그때 달라진다 — 지금 있는 4채로 타입이 굳으면
// 다음 건물을 넣을 때마다 컴파일이 깨진다.
const buildingModels: Record<string, string> = buildingModelsJson;

// ─── 호버 연출: 빛기둥 + 회전 베이스 링 2겹 (Developer City 이식) ──────────────

function HighlightFX({color, height, radius, active}: {color: string; height: number; radius: number; active: boolean}) {
  const beamRef = useRef<Mesh>(null);
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const intensity = useRef(0);

  useFrame((_, delta) => {
    // 부드러운 등장/퇴장 보간
    const target = active ? 1 : 0;
    intensity.current += (target - intensity.current) * Math.min(1, delta * 8);
    const k = intensity.current;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.6;
      ring1Ref.current.scale.setScalar(0.9 + k * 0.2);
      (ring1Ref.current.material as {opacity: number}).opacity = k * 0.7;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.42;
      ring2Ref.current.scale.setScalar(1.05 + k * 0.25);
      (ring2Ref.current.material as {opacity: number}).opacity = k * 0.45;
    }
    if (beamRef.current) {
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.003);
      (beamRef.current.material as {opacity: number}).opacity = k * (0.12 + pulse * 0.1);
      beamRef.current.visible = k > 0.01;
    }
  });

  return (
    <group>
      {/* 빛기둥 — 지붕 위로 솟는 additive 컬럼 */}
      <mesh ref={beamRef} position={[0, height + 1.4, 0]}>
        <cylinderGeometry args={[radius * 0.18, radius * 0.42, 3, 12, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={2} />
      </mesh>
      {/* 회전 베이스 링 2겹 */}
      <mesh ref={ring1Ref} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.85, radius * 0.95, 48, 1, 0, Math.PI * 1.6]} />
        <meshBasicMaterial color={color} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={2} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.05, radius * 1.12, 48, 1, 0, Math.PI * 1.2]} />
        <meshBasicMaterial color={color} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={2} />
      </mesh>
    </group>
  );
}

// ─── GLB 에셋 렌더러 ──────────────────────────────────────────────────────────

function GlbModel({glbPath, size}: {glbPath: string; size: [number, number, number]}) {
  const {scene} = useGLTF(glbPath);
  // Meshy GLB는 원점 중심으로 나와서 그대로 놓으면 아래 절반이 지면에 묻힌다.
  // 바닥(min.y)을 y=0으로 끌어올린다. primitive가 scene에 직접 transform을 쓰므로
  // 측정할 때는 항등 변환으로 되돌렸다가 복원한다.
  const natural = useMemo(() => {
    const scale0 = scene.scale.clone();
    const pos0 = scene.position.clone();
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.updateWorldMatrix(false, true);
    const {min, max} = new Box3().setFromObject(scene);
    scene.scale.copy(scale0);
    scene.position.copy(pos0);
    scene.updateWorldMatrix(false, true);
    return {
      minY: min.y,
      width: Math.max(1e-4, max.x - min.x),
      height: Math.max(1e-4, max.y - min.y),
      depth: Math.max(1e-4, max.z - min.z)
    };
  }, [scene]);

  // 배율 잡기 — 두 번 틀리고 세 번째다. 기록을 남긴다.
  //
  // ① size[1] × 0.62 를 그냥 배율로: GLB마다 원본 높이가 1.13~1.91로 제각각이라
  //    같은 size[1]이 전혀 다른 크기를 만들었다.
  // ② 높이로만 나누기(size[1] / 모델높이): Meshy는 **가장 긴 변**을 1.9로 정규화하므로
  //    납작한 건물일수록 높이가 작고, 그러면 배율이 커져 가로가 터진다.
  //    실측으로 헬스장이 앞마당의 187%, ACLUB이 204%가 되어 길과 소품을 깔고 앉았다.
  // ③ 선언 상자(size)에 세 축 다 맞추기: 안 넘치긴 하는데 너무 작아졌다.
  //    나무(4.5~6.6m)보다 낮은 건물이 속출했다.
  //
  // 진짜 제약은 선언 상자가 아니라 **앞마당 원반**이다. 반지름이
  // max(w,d)/2 + 0.55 이므로(generate-ground-layout.mjs), 지름은 선언 폭 + 1.1 까지
  // 쓸 수 있다. 거기에 바닥을 맞추고, 높이만 선언값의 1.25배로 묶는다 —
  // 안 묶으면 홀쭉한 탑(backend)이 5.8유닛짜리 마천루가 된다.
  // 원반은 원이고 건물은 사각이라, 폭·깊이를 지름에 맞추면 **모서리**가 삐져나온다
  // (실측: exp-portfolio 가 반지름의 132%). 대각선을 지름에 맞춰야 네 귀가 다 들어간다.
  const radius = Math.max(size[0], size[2]) / 2 + 0.55;
  const footprint = Math.hypot(natural.width, natural.depth);
  const scale = Math.min((radius * 2) / footprint, (size[1] * 1.25) / natural.height);
  return <primitive object={scene} scale={scale} position={[0, -natural.minY * scale, 0]} />;
}

// ─── 공통 라벨 = 건물 간판 ────────────────────────────────────────────────────
//
// 예전엔 남색 배경에 시안 네온 테두리, 9~13px 모노스페이스, opacity 0.58 짜리
// "HUD 칩"이었다. 마을이 따뜻한 톤으로 바뀐 뒤에도 라벨만 사이버펑크로 남아
// 겉돌았고, 무엇보다 흐리고 작아서 "저기가 무슨 건물인지"가 안 읽혔다.
//
// 이제 나무 간판처럼 그린다. 3D로 안 만들고 DOM으로 두는 이유:
//   · draw call 0 — 계기판이 이미 예산(200)을 넘겨 있어 27개를 더 못 얹는다
//   · 자리 잡을 필요가 없다 — 건물 높이 위에 자동으로 뜬다. GLB 간판에 판을
//     맞추려면 건물 23채를 손으로 정렬해야 한다
//   · 텍스처가 아니라 벡터라 아무리 가까이 가도 안 뭉개진다
//
// 로고는 techStack 첫 항목에서 자동으로 찾는다 — 건물마다 아이콘을 따로
// 지정하지 않아도 된다. 브랜드 마크는 어두운 배지 위에 올린다: GitHub·Notion처럼
// 흰색이 본색인 로고가 나무판 위에서 사라지기 때문이다.

/** techStack 에서 아이콘이 있는 첫 기술을 찾는다 */
function leadIcon(techStack?: string[]) {
  if (!techStack) return null;
  for (const tech of techStack) {
    const icon = techIcons[tech];
    if (icon) return {tech, icon};
  }
  return null;
}

function BuildingLabel({building, buildingState, height, highlighted, onEnter}: {
  building: BuildingData;
  height: number;
  highlighted: boolean;
  onEnter: () => void;
  buildingState?: BuildingState;
}) {
  const color = building.accentColor;
  const calculatePosition = useMemo(() => createThrottledCalculatePosition(LABEL_SYNC_STRIDE), []);
  const lead = useMemo(() => leadIcon(building.techStack), [building.techStack]);
  const live = buildingState && buildingState.light_level !== "dark";

  return (
    <Html center calculatePosition={calculatePosition} distanceFactor={11} position={[0, height + 1.15, 0]} zIndexRange={[10, 0]}>
      <button
        onClick={onEnter}
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          // 나무 테두리 + 크림색 판. 위아래로 살짝 어둡게 해 판이 두꺼워 보이게 한다.
          background: "linear-gradient(#fdf3df 0%, #f6e7c8 55%, #e8d3ac 100%)",
          border: `3px solid ${highlighted ? color : "#8a5a33"}`,
          borderRadius: 10,
          padding: "7px 13px 7px 8px",
          cursor: "pointer",
          boxShadow: highlighted
            ? `0 0 0 2px ${color}66, 0 6px 14px rgba(40,24,10,0.45)`
            : "0 4px 10px rgba(40,24,10,0.35)",
          transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
          textAlign: "left",
          opacity: 1,
          transform: highlighted ? "scale(1.08)" : "scale(1)",
        }}
      >
        {lead ? (
          // 로고 배지 — 어두운 원판이라 흰 로고도 컬러 로고도 같이 산다
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#2b2118",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
              flexShrink: 0,
            }}
            title={lead.tech}
          >
            <svg viewBox="0 0 24 24" width={19} height={19} aria-hidden="true">
              <path
                d={lead.icon.d}
                {...(lead.icon.stroke
                  ? {fill: "none", stroke: lead.icon.color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const}
                  : {fill: lead.icon.color})}
              />
            </svg>
          </span>
        ) : null}

        <span style={{display: "flex", flexDirection: "column", gap: 1, minWidth: 0}}>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#9a6a3c",
              whiteSpace: "nowrap",
            }}
          >
            {building.label}
          </span>
          <strong
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 17,
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#3d2a17",
              whiteSpace: "nowrap",
              // 크림색 판 위 갈색 글씨 — 얇은 밝은 그림자로 각인된 느낌을 준다
              textShadow: "0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            {building.name}
          </strong>
        </span>

        {live ? (
          // 오늘 활동이 있으면 켜지는 등불. 예전엔 "live bright" 글자였는데
          // 간판에 영어 상태값이 붙으면 다시 HUD로 보인다 — 점 하나로 줄였다.
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 7px ${color}`,
              flexShrink: 0,
              marginLeft: 1,
            }}
            title={`오늘 활동 ${buildingState?.light_level}`}
          />
        ) : null}
      </button>
    </Html>
  );
}

// ─── 바닥 링 ──────────────────────────────────────────────────────────────────

function GroundRing({color, highlighted, radius}: {color: string; highlighted: boolean; radius: number}) {
  return (
    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.7, radius * 0.76, 48]} />
      <meshBasicMaterial color={highlighted ? color : "#224466"} transparent opacity={highlighted ? 0.75 : 0.22} />
    </mesh>
  );
}

// ─── 건물 형태들 ──────────────────────────────────────────────────────────────

/** 타워 — Demotion (Spring Boot 느낌, 유리 고층빌딩) */
function TowerBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      {/* 본체 */}
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={b.color} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.12 : 0} roughness={0.25} metalness={0.7} />
      </mesh>
      {/* 수평 줄 (유리 패널 느낌) */}
      {[0.25, 0.5, 0.75].map((t) => (
        <mesh key={t} position={[0, h * t, 0]}>
          <boxGeometry args={[w + 0.06, 0.05, d + 0.06]} />
          <meshBasicMaterial color={hl ? b.accentColor : "#0a3a6e"} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* 안테나 */}
      <mesh castShadow position={[0, h + 0.5, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 1.0, 6]} />
        <meshStandardMaterial color="#0a1a2e" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, h + 1.05, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color={b.accentColor} />
      </mesh>
      {hl && <pointLight color={b.accentColor} intensity={1.2} distance={4} decay={2} position={[0, h * 0.5, 0]} />}
    </group>
  );
}

/** 라운드 오피스 — MyWave (금융, 부드러운 곡선) */
function OfficeRoundedBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      {/* 메인 원통형 */}
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <cylinderGeometry args={[w * 0.5, w * 0.52, h, 20]} />
        <meshStandardMaterial color={b.color} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.1 : 0} roughness={0.3} metalness={0.55} />
      </mesh>
      {/* 글래스 링 */}
      {[0.3, 0.65].map((t) => (
        <mesh key={t} position={[0, h * t, 0]}>
          <torusGeometry args={[w * 0.51, 0.04, 8, 32]} />
          <meshBasicMaterial color={hl ? b.accentColor : "#004433"} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* 위쪽 돔 */}
      <mesh castShadow position={[0, h + 0.22, 0]}>
        <sphereGeometry args={[w * 0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={b.roofColor} roughness={0.4} metalness={0.4} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.08 : 0} />
      </mesh>
      {hl && <pointLight color={b.accentColor} intensity={1.0} distance={3.5} decay={2} position={[0, h * 0.5, 0]} />}
    </group>
  );
}

/** 컴팩트 스튜디오 — 일해라 농장주 (게임 스튜디오, 개성 있는 지붕) */
function CompactStudioBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={b.color} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.13 : 0} roughness={0.6} metalness={0.35} />
      </mesh>
      {/* 피라미드 지붕 */}
      <mesh castShadow position={[0, h + 0.52, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[Math.max(w, d) * 0.78, 1.06, 4]} />
        <meshStandardMaterial color={b.roofColor} roughness={0.55} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.08 : 0} />
      </mesh>
      {/* 간판 */}
      <mesh position={[0, h * 0.7, d / 2 + 0.06]}>
        <boxGeometry args={[w * 0.7, h * 0.22, 0.06]} />
        <meshStandardMaterial color="#050d1a" emissive={b.accentColor} emissiveIntensity={hl ? 0.35 : 0.12} roughness={0.2} />
      </mesh>
      {hl && <pointLight color={b.accentColor} intensity={0.9} distance={3} decay={2} position={[0, h * 0.6, d * 0.6]} />}
    </group>
  );
}

/** 플랫 허브 — Frontend (가로로 넓은 테크 빌딩) */
function FlatHubBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={b.color} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.1 : 0} roughness={0.2} metalness={0.75} />
      </mesh>
      {/* 유리 파사드 */}
      <mesh position={[0, h * 0.55, d / 2 + 0.03]}>
        <boxGeometry args={[w * 0.85, h * 0.6, 0.04]} />
        <meshStandardMaterial color={b.accentColor} emissive={b.accentColor} emissiveIntensity={hl ? 0.22 : 0.07} roughness={0.1} transparent opacity={0.45} />
      </mesh>
      {/* 평지붕 테두리 */}
      <mesh position={[0, h + 0.04, 0]}>
        <boxGeometry args={[w + 0.12, 0.08, d + 0.12]} />
        <meshBasicMaterial color={hl ? b.accentColor : "#0a3a6e"} transparent opacity={0.6} />
      </mesh>
      {hl && <pointLight color={b.accentColor} intensity={1.1} distance={4} decay={2} position={[0, h, d * 0.5]} />}
    </group>
  );
}

/** 돔 — 3D/Motion (구형 돔 랩) */
function DomeBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h] = b.size;
  const r = w * 0.52;
  return (
    <group>
      {/* 원형 기단 */}
      <mesh castShadow receiveShadow position={[0, h * 0.3, 0]}>
        <cylinderGeometry args={[r, r * 1.08, h * 0.6, 20]} />
        <meshStandardMaterial color={b.color} roughness={0.45} metalness={0.6} />
      </mesh>
      {/* 돔 */}
      <mesh castShadow position={[0, h * 0.6 + r * 0.5, 0]}>
        <sphereGeometry args={[r, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial color={b.roofColor} roughness={0.2} metalness={0.5} emissive={b.accentColor} emissiveIntensity={hl ? 0.18 : 0.05} transparent opacity={0.85} />
      </mesh>
      {/* 돔 내부 글로우 구체 */}
      <mesh position={[0, h * 0.6 + 0.1, 0]}>
        <sphereGeometry args={[r * 0.3, 12, 12]} />
        <meshBasicMaterial color={b.accentColor} transparent opacity={hl ? 0.7 : 0.25} />
      </mesh>
      {hl && <pointLight color={b.accentColor} intensity={1.5} distance={4.5} decay={2} position={[0, h * 0.8, 0]} />}
    </group>
  );
}

/** 서버 타워 — Backend (좁고 높은 서버 빌딩) */
function ServerTowerBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={b.color} roughness={0.3} metalness={0.8} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.08 : 0} />
      </mesh>
      {/* 서버 랙 줄 */}
      {[0.18, 0.36, 0.54, 0.72, 0.88].map((t) => (
        <mesh key={t} position={[0, h * t, d / 2 + 0.03]}>
          <boxGeometry args={[w * 0.76, h * 0.06, 0.04]} />
          <meshBasicMaterial color={hl && t > 0.5 ? b.accentColor : "#003322"} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* 냉각 파이프 */}
      {[-w * 0.38, w * 0.38].map((x) => (
        <mesh key={x} castShadow position={[x, h + 0.35, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.7, 8]} />
          <meshStandardMaterial color="#0a1a2e" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
      {hl && <pointLight color={b.accentColor} intensity={1.0} distance={3.5} decay={2} position={[0, h * 0.7, d * 0.6]} />}
    </group>
  );
}

/** 아케이드 — Game/XR (레트로 게임 센터) */
function ArcadeBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={b.color} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.1 : 0} roughness={0.55} metalness={0.4} />
      </mesh>
      {/* 아치형 입구 */}
      <mesh position={[0, h * 0.35, d / 2 + 0.04]}>
        <cylinderGeometry args={[w * 0.28, w * 0.28, h * 0.55, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={b.roofColor} roughness={0.4} emissive={b.accentColor} emissiveIntensity={hl ? 0.3 : 0.1} />
      </mesh>
      {/* 간판 박스 */}
      <mesh castShadow position={[0, h + 0.3, 0]}>
        <boxGeometry args={[w + 0.3, 0.55, d * 0.4]} />
        <meshStandardMaterial color="#1a0800" emissive={b.accentColor} emissiveIntensity={hl ? 0.45 : 0.15} roughness={0.2} />
      </mesh>
      {hl && <pointLight color={b.accentColor} intensity={1.3} distance={4} decay={2} position={[0, h * 0.7, d * 0.6]} />}
    </group>
  );
}

/** 미니멀 오피스 — Workflow (깔끔한 소형 건물) */
function MinimalOfficeBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={b.color} roughness={0.35} metalness={0.65} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.1 : 0} />
      </mesh>
      {/* 평지붕 + 파라펫 */}
      <mesh position={[0, h + 0.07, 0]}>
        <boxGeometry args={[w + 0.15, 0.14, d + 0.15]} />
        <meshStandardMaterial color="#111111" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* 옥상 안테나 그룹 */}
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} castShadow position={[x * w, h + 0.45, 0]}>
          <cylinderGeometry args={[0.02, 0.025, 0.6, 6]} />
          <meshStandardMaterial color="#0a1a0a" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {hl && <pointLight color={b.accentColor} intensity={0.8} distance={3} decay={2} position={[0, h, 0]} />}
    </group>
  );
}

/** 타운하우스 — 경험 건물 (연도별로 크기 다름) */
function TownhouseBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={b.color} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.12 : 0} roughness={0.65} metalness={0.3} />
      </mesh>
      {/* 삼각 지붕 */}
      <mesh castShadow position={[0, h + 0.42, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[Math.max(w, d) * 0.72, 0.85, 4]} />
        <meshStandardMaterial color={b.roofColor} roughness={0.6} />
      </mesh>
      {/* 문 */}
      <mesh position={[0, h * 0.28, d / 2 + 0.012]}>
        <boxGeometry args={[w * 0.3, h * 0.44, 0.04]} />
        <meshStandardMaterial color={hl ? "#eef7c6" : b.accentColor} roughness={0.55} />
      </mesh>
      {/* 창문 */}
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x * w, h * 0.62, d / 2 + 0.02]}>
          <boxGeometry args={[w * 0.2, h * 0.2, 0.04]} />
          <meshStandardMaterial color={b.accentColor} emissive={b.accentColor} emissiveIntensity={hl ? 0.3 : 0.08} roughness={0.3} />
        </mesh>
      ))}
      {hl && <pointLight color={b.accentColor} intensity={0.8} distance={3} decay={2} position={[0, h * 0.5, 0]} />}
    </group>
  );
}

/** 중앙 광장 */
function PlazaBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  return (
    <group>
      <mesh receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.45, 1.6, 0.16, 36]} />
        <meshStandardMaterial color={b.color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.56, 0.66, 0.22, 28]} />
        <meshStandardMaterial color="#0a2040" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.35, 24]} />
        <meshStandardMaterial color="#0d1a30" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.24, 18, 18]} />
        <meshStandardMaterial color={hl ? "#bdf6ff" : "#aaddee"} emissive="#00d4ff" emissiveIntensity={hl ? 0.5 : 0.18} roughness={0.2} />
      </mesh>
      <pointLight color="#00d4ff" intensity={hl ? 2.0 : 1.0} distance={6} decay={2} position={[0, 1.2, 0]} />
    </group>
  );
}

/** 우체국 */
function PostBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={b.color} emissive={hl ? b.accentColor : "#000"} emissiveIntensity={hl ? 0.12 : 0} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, h + 0.44, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[Math.max(w, d) * 0.72, 0.9, 4]} />
        <meshStandardMaterial color={b.roofColor} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[w * 0.44, h + 0.46, d * 0.2]}>
        <cylinderGeometry args={[0.035, 0.045, 0.82, 8]} />
        <meshStandardMaterial color="#8b5a35" roughness={0.66} />
      </mesh>
      <mesh position={[w * 0.58, h + 0.66, d * 0.2]}>
        <boxGeometry args={[0.44, 0.24, 0.035]} />
        <meshStandardMaterial color="#f4f0df" roughness={0.5} />
      </mesh>
      {hl && <pointLight color={b.accentColor} intensity={0.9} distance={3.5} decay={2} position={[0, h * 0.6, 0]} />}
    </group>
  );
}

// ─── 메인 Building 컴포넌트 ──────────────────────────────────────────────────

interface BuildingProps {
  building: BuildingData;
  buildingState?: BuildingState;
  isActive: boolean;
  onRequestEnter: (buildingId: string) => void;
  edit?: {
    editing: boolean;
    selected: boolean;
    rotationY: number;
    scale: number;
    onSelectDown: () => void;
  };
}

function BuildingGeometry({b, hl}: {b: BuildingData; hl: boolean}) {
  // 모델이 있으면 상자 대신 그걸 그린다. 경로는 scripts/generate-building-manifest.mjs 가
  // public/models/buildings/<건물id>.glb 를 훑어 만든다 — 건물을 하나 뽑아 넣을 때마다
  // constants.ts 를 손대지 않아도 되도록. glbPath 를 직접 적으면 그쪽이 이긴다.
  const glbPath = b.glbPath ?? buildingModels[b.id];
  if (glbPath) return <GlbModel glbPath={glbPath} size={b.size} />;

  switch (b.kind) {
    case "tower":          return <TowerBuilding b={b} hl={hl} />;
    case "office-rounded": return <OfficeRoundedBuilding b={b} hl={hl} />;
    case "compact-studio": return <CompactStudioBuilding b={b} hl={hl} />;
    case "flat-hub":       return <FlatHubBuilding b={b} hl={hl} />;
    case "dome":           return <DomeBuilding b={b} hl={hl} />;
    case "server-tower":   return <ServerTowerBuilding b={b} hl={hl} />;
    case "arcade":         return <ArcadeBuilding b={b} hl={hl} />;
    case "minimal-office": return <MinimalOfficeBuilding b={b} hl={hl} />;
    case "townhouse":      return <TownhouseBuilding b={b} hl={hl} />;
    case "post":           return <PostBuilding b={b} hl={hl} />;
    case "plaza":          return <PlazaBuilding b={b} hl={hl} />;
    default:               return <TownhouseBuilding b={b} hl={hl} />;
  }
}

function BuildingImpl({building, buildingState, isActive, onRequestEnter, edit}: BuildingProps) {
  const [hovered, setHovered] = useState(false);
  const liveGlow = lightIntensity(buildingState?.light_level);
  const editing = edit?.editing ?? false;
  const isHighlighted = !editing && (hovered || isActive || liveGlow >= 0.65);
  const [, h] = building.size;

  useCursor(hovered || (editing && (edit?.selected ?? false)));

  function handlePointer(event: ThreeEvent<PointerEvent>, next: boolean) {
    event.stopPropagation();
    setHovered(next);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onRequestEnter(building.id);
  }

  const rotY = edit?.rotationY ?? 0;
  const extraScale = edit?.scale ?? 1;
  const scale = (isHighlighted ? 1.04 : 1) * extraScale;

  return (
    <group position={building.position} rotation={[0, rotY, 0]}>
      <group
        onClick={editing ? undefined : handleClick}
        onPointerDown={editing ? (e) => {e.stopPropagation(); edit?.onSelectDown();} : undefined}
        onPointerEnter={editing ? undefined : (e) => handlePointer(e, true)}
        onPointerLeave={editing ? undefined : (e) => handlePointer(e, false)}
        scale={[scale, scale, scale]}
      >
        {editing && edit?.selected ? (
          <>
            <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[Math.max(building.size[0], building.size[2]) * 0.9, Math.max(building.size[0], building.size[2]) * 1.02, 44]} />
              <meshBasicMaterial color="#86b0e6" transparent opacity={0.95} />
            </mesh>
            <SelectionBox size={building.size} />
          </>
        ) : null}
        <BuildingGeometry b={building} hl={isHighlighted} />
        <GroundRing color={building.accentColor} highlighted={isHighlighted} radius={Math.max(building.size[0], building.size[2])} />
        <HighlightFX
          active={isHighlighted}
          color={building.accentColor}
          height={building.kind === "plaza" ? 1.0 : h}
          radius={Math.max(building.size[0], building.size[2])}
        />
        {liveGlow > 0 ? (
          <pointLight
            color={building.accentColor}
            decay={2}
            distance={4 + liveGlow * 4}
            intensity={liveGlow * 1.8}
            position={[0, h + 0.6, 0]}
          />
        ) : null}
      </group>

      <BuildingLabel
        building={building}
        buildingState={buildingState}
        height={building.kind === "plaza" ? 1.0 : h}
        highlighted={isHighlighted}
        onEnter={() => onRequestEnter(building.id)}
      />
    </group>
  );
}

// 무관한 부모(VillageScene) 리렌더에서 안 바뀐 건물의 함수 바디 재실행을 스킵.
export const Building = memo(BuildingImpl);

// 편집 모드 선택 표시 — 후처리 없이 와이어프레임 박스 아웃라인
function SelectionBox({size}: {size: [number, number, number]}) {
  const geo = useMemo(
    () => new EdgesGeometry(new BoxGeometry(size[0] * 1.05, size[1] * 1.05, size[2] * 1.05)),
    [size]
  );
  return (
    <lineSegments geometry={geo} position={[0, size[1] / 2, 0]}>
      <lineBasicMaterial color="#86b0e6" transparent opacity={0.9} />
    </lineSegments>
  );
}
