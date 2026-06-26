"use client";

import {Html, useCursor, useGLTF} from "@react-three/drei";
import {useState} from "react";
import type {ThreeEvent} from "@react-three/fiber";
import type {BuildingData} from "@/types/portfolio";

// ─── GLB 에셋 렌더러 ──────────────────────────────────────────────────────────

function GlbModel({glbPath, size}: {glbPath: string; size: [number, number, number]}) {
  const {scene} = useGLTF(glbPath);
  // size[1]을 목표 높이로 삼아 자동 스케일
  const targetHeight = size[1];
  return (
    <primitive
      object={scene}
      scale={targetHeight * 0.62}
      position={[0, 0, 0]}
    />
  );
}

// ─── 공통 라벨 ────────────────────────────────────────────────────────────────

function BuildingLabel({building, height, highlighted, onEnter}: {
  building: BuildingData;
  height: number;
  highlighted: boolean;
  onEnter: () => void;
}) {
  const color = building.accentColor;
  return (
    <Html center distanceFactor={11} position={[0, height + 1.1, 0]} zIndexRange={[10, 0]}>
      <button
        onClick={onEnter}
        type="button"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          background: highlighted ? "rgba(0,15,35,0.95)" : "rgba(4,10,22,0.85)",
          border: `1px solid ${highlighted ? color : "rgba(0,150,200,0.25)"}`,
          borderRadius: 8,
          padding: "5px 11px",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          boxShadow: highlighted ? `0 0 20px ${color}55` : "0 0 6px rgba(0,150,200,0.1)",
          transition: "all 0.2s",
          minWidth: 78,
          textAlign: "center",
        }}
      >
        <span style={{
          fontFamily: "monospace",
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: highlighted ? color : "#006688",
          textShadow: highlighted ? `0 0 10px ${color}` : "none",
        }}>
          {">"} {building.label}
        </span>
        <strong style={{
          fontFamily: "monospace",
          fontSize: 10,
          fontWeight: 900,
          color: highlighted ? "#ffffff" : "#99bbcc",
          whiteSpace: "nowrap",
        }}>
          {building.name}
        </strong>
        {building.techStack && highlighted && (
          <span style={{
            fontFamily: "monospace",
            fontSize: 7,
            color: `${color}aa`,
            whiteSpace: "nowrap",
            marginTop: 1,
          }}>
            {building.techStack.slice(0, 2).join(" · ")}
          </span>
        )}
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
  isActive: boolean;
  onRequestEnter: (buildingId: string) => void;
}

function BuildingGeometry({b, hl}: {b: BuildingData; hl: boolean}) {
  if (b.glbPath) return <GlbModel glbPath={b.glbPath} size={b.size} />;

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

export function Building({building, isActive, onRequestEnter}: BuildingProps) {
  const [hovered, setHovered] = useState(false);
  const isHighlighted = hovered || isActive;
  const [, h] = building.size;

  useCursor(hovered);

  function handlePointer(event: ThreeEvent<PointerEvent>, next: boolean) {
    event.stopPropagation();
    setHovered(next);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onRequestEnter(building.id);
  }

  const scale = isHighlighted ? 1.04 : 1;

  return (
    <group position={building.position}>
      <group
        onClick={handleClick}
        onPointerEnter={(e) => handlePointer(e, true)}
        onPointerLeave={(e) => handlePointer(e, false)}
        scale={[scale, scale, scale]}
      >
        <BuildingGeometry b={building} hl={isHighlighted} />
        <GroundRing color={building.accentColor} highlighted={isHighlighted} radius={Math.max(building.size[0], building.size[2])} />
      </group>

      <BuildingLabel
        building={building}
        height={building.kind === "plaza" ? 1.0 : h}
        highlighted={isHighlighted}
        onEnter={() => onRequestEnter(building.id)}
      />
    </group>
  );
}
