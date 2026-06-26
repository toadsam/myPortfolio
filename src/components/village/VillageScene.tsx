"use client";

import {Canvas, useFrame} from "@react-three/fiber";
import {ContactShadows, Environment, Float, Html} from "@react-three/drei";
import {Suspense, useRef} from "react";
import type {Group} from "three";
import {npcs} from "@/data/npcs";
import {rockPositions, treePositions, villageBuildings} from "@/lib/constants";
import type {ExplorationMode, NPCData, SectionId} from "@/types/portfolio";
import {Building} from "./Building";
import {CameraController} from "./CameraController";
import {CharacterController} from "./CharacterController";
import {Rock, SignPost} from "./Decorations";
import {NPC} from "./NPC";
import {Tree} from "./Tree";

interface VillageSceneProps {
  activeSection: SectionId;
  activeNpcId?: string;
  explorationMode: ExplorationMode;
  isIntro?: boolean;
  onSelectSection: (sectionId: SectionId) => void;
  onSelectNpc: (npc: NPCData) => void;
  onRequestEnter: (buildingId: string) => void;
}

// ─── 시그니처 광장 (</ 정재훈 >) ────────────────────────────────────────────────

function SignaturePlaza() {
  const ringRef = useRef<Group>(null);

  useFrame(({clock}) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.getElapsedTime() * 0.18;
    }
  });

  // LED 도트 개수
  const LED_COUNT = 48;
  const LED_RADIUS = 2.52;
  const leds = Array.from({length: LED_COUNT}, (_, i) => {
    const angle = (i / LED_COUNT) * Math.PI * 2;
    return {x: Math.cos(angle) * LED_RADIUS, z: Math.sin(angle) * LED_RADIUS};
  });

  // 회로 방사선 (이미지처럼 중심에서 바깥으로)
  const SPOKE_COUNT = 16;
  const spokes = Array.from({length: SPOKE_COUNT}, (_, i) => ({
    angle: (i / SPOKE_COUNT) * Math.PI * 2,
    length: 0.9 + (i % 3) * 0.18,
  }));

  return (
    <group position={[0, 0.005, 0]}>
      {/* 메인 원형 디스크 — 가장 바깥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.7, 80]} />
        <meshStandardMaterial color="#050d1a" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* 바깥 테두리 링 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[2.58, 2.7, 80]} />
        <meshStandardMaterial color="#0a2040" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* 바깥 네온 링 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[2.62, 2.68, 80]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} />
      </mesh>

      {/* LED 도트들 */}
      {leds.map((led, i) => (
        <mesh key={i} position={[led.x, 0.012, led.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.038, 8]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={i % 3 === 0 ? 1.0 : 0.55} />
        </mesh>
      ))}
      {/* LED 포인트라이트 2개만 */}
      <pointLight color="#00d4ff" intensity={0.5} distance={3} decay={2} position={[LED_RADIUS, 0.1, 0]} />
      <pointLight color="#00d4ff" intensity={0.5} distance={3} decay={2} position={[-LED_RADIUS, 0.1, 0]} />

      {/* 안쪽 링 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[2.3, 2.38, 72]} />
        <meshBasicMaterial color="#003a6a" transparent opacity={0.55} />
      </mesh>

      {/* 회로 방사선 (spokes) */}
      {spokes.map((s, i) => {
        const cx = Math.cos(s.angle) * (0.68 + s.length / 2);
        const cz = Math.sin(s.angle) * (0.68 + s.length / 2);
        return (
          <mesh key={i} position={[cx, 0.009, cz]} rotation={[-Math.PI / 2, 0, s.angle]}>
            <planeGeometry args={[s.length, 0.018]} />
            <meshBasicMaterial color="#0a4a8a" transparent opacity={0.7} />
          </mesh>
        );
      })}

      {/* 회로 분기 점들 */}
      {spokes.map((s, i) => {
        const r = 1.1 + (i % 4) * 0.22;
        return (
          <mesh key={i} position={[Math.cos(s.angle) * r, 0.011, Math.sin(s.angle) * r]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.028, 6]} />
            <meshBasicMaterial color="#0a6aaa" transparent opacity={0.65} />
          </mesh>
        );
      })}

      {/* 중앙 원형 배경 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.72, 48]} />
        <meshStandardMaterial color="#030810" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 중앙 링 테두리 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, 0]}>
        <ringGeometry args={[0.68, 0.74, 48]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.65} />
      </mesh>

      {/* 회전 링 (천천히 회전) */}
      <group ref={ringRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
          <ringGeometry args={[1.55, 1.6, 64]} />
          <meshBasicMaterial color="#005588" transparent opacity={0.5} />
        </mesh>
        {/* 회전 링 노치 */}
        {Array.from({length: 8}, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.575, 0.018, Math.sin(a) * 1.575]} rotation={[-Math.PI / 2, 0, a]}>
              <planeGeometry args={[0.12, 0.04]} />
              <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
            </mesh>
          );
        })}
      </group>

      {/* </정재훈> HTML 라벨 */}
      <Html center position={[0, 0.06, 0]} zIndexRange={[2, 0]}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: 900,
            color: "#00d4ff",
            textShadow: "0 0 12px #00d4ff, 0 0 28px #00aaff88",
            letterSpacing: "0.06em",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {"</정재훈>"}
        </div>
      </Html>

      {/* 중앙 포인트라이트 */}
      <pointLight color="#00d4ff" intensity={1.8} distance={5} decay={2} position={[0, 0.3, 0]} />
    </group>
  );
}

// ─── 바닥 ─────────────────────────────────────────────────────────────────────

function Ground() {
  // 그리드 간격 넓게, 개수 줄임 (550개 → 40개)
  const gridX = Array.from({length: 10}, (_, i) => (i - 5) * 3.6);
  const gridZ = Array.from({length: 10}, (_, i) => (i - 2) * 3.6);

  return (
    <group>
      {/* 바닥 메인 — 단일 큰 평면 */}
      <mesh receiveShadow position={[0, -0.04, 3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050d1a" roughness={0.95} metalness={0.08} />
      </mesh>

      {/* 그리드 X (sparse) */}
      {gridX.map((x) => (
        <mesh key={`gx-${x}`} position={[x, 0.001, 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.022, 40]} />
          <meshBasicMaterial color="#0a3a6e" transparent opacity={0.2} />
        </mesh>
      ))}
      {/* 그리드 Z (sparse) */}
      {gridZ.map((z) => (
        <mesh key={`gz-${z}`} position={[0, 0.001, z + 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 0.022]} />
          <meshBasicMaterial color="#0a3a6e" transparent opacity={0.2} />
        </mesh>
      ))}

      {/* 중앙 광장 플랫폼 */}
      <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.5, 32]} />
        <meshStandardMaterial color="#071220" roughness={0.88} metalness={0.2} />
      </mesh>

      {/* 중앙 네온 링 */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.34, 48]} />
        <meshBasicMaterial color="#0044aa" transparent opacity={0.28} />
      </mesh>

      {/* 구역 연결 경로 */}
      <DistrictPath fromX={-1.5} fromZ={0}  toX={-5.5} toZ={1}   color="#00d4ff" />
      <DistrictPath fromX={0}    fromZ={-1.5} toX={0}   toZ={-5}  color="#aa44ff" />
      <DistrictPath fromX={1.5}  fromZ={0}   toX={5.5}  toZ={4}   color="#00ff88" />
      <DistrictPath fromX={0}    fromZ={1.5}  toX={0}   toZ={7.5} color="#ff6600" />

      {/* 조명은 최소화 — 중앙 하나만 */}
      <pointLight color="#00d4ff" intensity={2.5} distance={12} decay={2} position={[0, 1.5, 0]} />
    </group>
  );
}

function DistrictPath({fromX, fromZ, toX, toZ, color}: {
  fromX: number; fromZ: number; toX: number; toZ: number; color: string;
}) {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  const mx = (fromX + toX) / 2;
  const mz = (fromZ + toZ) / 2;

  return (
    <group>
      <mesh position={[mx, 0.007, mz]} rotation={[-Math.PI / 2, 0, angle]}>
        <planeGeometry args={[length, 0.38]} />
        <meshStandardMaterial color="#071525" roughness={0.9} metalness={0.3} />
      </mesh>
      <mesh position={[mx, 0.012, mz]} rotation={[-Math.PI / 2, 0, angle]}>
        <planeGeometry args={[length, 0.028]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

// ─── 구역 표지판 ──────────────────────────────────────────────────────────────

function DistrictSign({label, position, color}: {label: string; position: [number, number, number]; color: string}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 1.1, 8]} />
        <meshStandardMaterial color="#0a1a2e" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[1.8, 0.36, 0.06]} />
        <meshStandardMaterial color="#050d1a" emissive={color} emissiveIntensity={0.18} roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.22, 0.04]}>
        <boxGeometry args={[1.82, 0.38, 0.01]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={2.5} decay={2} position={[0, 1.2, 0.2]} />
      <Html center distanceFactor={14} position={[0, 1.25, 0.08]} zIndexRange={[5, 0]}>
        <span style={{
          fontFamily: "monospace",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color,
          textShadow: `0 0 10px ${color}`,
          userSelect: "none",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}>
          {"</>"} {label}
        </span>
      </Html>
    </group>
  );
}

// ─── 활성 라우트 하이라이트 ───────────────────────────────────────────────────

function ActiveRoute({activeSection}: {activeSection: SectionId}) {
  const building = villageBuildings.find((b) => b.sectionId === activeSection && b.district !== "plaza");

  if (!building || activeSection === "intro") {
    return (
      <group>
        <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.55, 1.66, 64]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.65} />
        </mesh>
        <pointLight color="#00d4ff" intensity={1.2} distance={4} decay={2} position={[0, 0.4, 0]} />
      </group>
    );
  }

  const [x, , z] = building.position;
  const dist = Math.sqrt(x * x + z * z);
  const angle = Math.atan2(z, x);

  return (
    <group>
      <mesh position={[x / 2, 0.014, z / 2]} rotation={[-Math.PI / 2, 0, angle]}>
        <planeGeometry args={[dist, 0.07]} />
        <meshBasicMaterial color={building.accentColor} transparent opacity={0.8} />
      </mesh>
      <mesh position={[x, 0.015, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.18, 1.3, 48]} />
        <meshBasicMaterial color={building.accentColor} transparent opacity={0.7} />
      </mesh>
      <pointLight color={building.accentColor} intensity={1.5} distance={4} decay={2} position={[x, 0.6, z]} />
    </group>
  );
}

// ─── 메인 씬 ──────────────────────────────────────────────────────────────────

export function VillageScene({
  activeSection, activeNpcId, explorationMode, isIntro = false,
  onSelectNpc, onSelectSection, onRequestEnter
}: VillageSceneProps) {
  const isWalkMode = explorationMode === "walk";

  return (
    <div className="relative h-[48vh] min-h-[390px] overflow-hidden border-y border-[#00d4ff]/15 bg-[#050d1a] shadow-[inset_0_-30px_70px_rgba(0,100,255,0.1)] md:h-screen md:min-h-[720px] md:border-y-0 md:border-r">
      <Canvas
        camera={{fov: 40, position: [4, 14, 16]}}
        dpr={[1, 1.5]}
        gl={{antialias: true, powerPreference: "high-performance"}}
      >
        <color args={["#a8c8e8"]} attach="background" />
        <fog args={["#b8d4ee", 35, 70]} attach="fog" />
        <ambientLight color="#ffffff" intensity={4.5} />
        <directionalLight color="#fff8e8" intensity={5.0} position={[8, 20, 8]} />
        <directionalLight color="#d0e8ff" intensity={2.5} position={[-6, 12, -4]} />
        <hemisphereLight args={["#87ceeb", "#4a7a3a", 3.0]} />

        {/* 구역별 조명 — 포인트라이트 4개로 줄임 */}
        <pointLight color="#00d4ff" intensity={1.8} distance={22} decay={2} position={[-5, 5, 0]} />
        <pointLight color="#aa44ff" intensity={1.5} distance={20} decay={2} position={[3, 5, -5]} />
        <pointLight color="#00ff88" intensity={1.5} distance={20} decay={2} position={[6, 5, 5]} />
        <pointLight color="#ff6600" intensity={1.2} distance={16} decay={2} position={[0, 4, 9]} />

        <Suspense fallback={null}>
          <Environment preset="night" />
          <Ground />
          <SignaturePlaza />

          {/* 구역 표지판 */}
          <DistrictSign label="Project District" position={[-8.5, 0, -5.5]} color="#00d4ff" />
          <DistrictSign label="Skills District"  position={[0,   0, -9.0]} color="#aa44ff" />
          <DistrictSign label="Experience District" position={[9.2, 0, 5]}  color="#00ff88" />

          {!isWalkMode && <ActiveRoute activeSection={activeSection} />}

          {villageBuildings.map((building) => (
            <Building
              key={building.id}
              building={building}
              isActive={activeSection === building.sectionId}
              onRequestEnter={isWalkMode ? () => {} : onRequestEnter}
            />
          ))}

          {npcs.map((npc) => (
            <NPC isActive={activeNpcId === npc.id} key={npc.id} npc={npc} onSelect={isWalkMode ? () => {} : onSelectNpc} />
          ))}

          {treePositions.map((position, index) => (
            <Tree key={position.join("-")} position={position} scale={index % 3 === 0 ? 1.1 : 0.88 + (index % 2) * 0.16} />
          ))}

          {rockPositions.map((position, index) => (
            <Rock key={position.join("-")} position={position} scale={index % 2 === 0 ? 1 : 0.72} />
          ))}

          <ContactShadows blur={1.5} far={8} frames={1} opacity={0.15} position={[0, 0.02, 2]} scale={18} />

          {isWalkMode
            ? <CharacterController />
            : <CameraController activeSection={activeSection} isIntro={isIntro} />
          }
        </Suspense>
      </Canvas>

      {/* 조작 힌트 */}
      {isWalkMode ? (
        <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-xl border border-[#00d4ff]/30 bg-[#050d1a]/85 px-4 py-2.5 backdrop-blur-md">
          {[["W", "앞"], ["A", "좌"], ["S", "뒤"], ["D", "우"]].map(([key, label]) => (
            <span className="flex flex-col items-center gap-0.5" key={key}>
              <kbd className="rounded border border-[#00d4ff]/50 bg-[#0a1a30] px-2 py-0.5 font-mono text-xs font-black text-[#00d4ff]">{key}</kbd>
              <span className="font-mono text-[10px] text-[#0066aa]">{label}</span>
            </span>
          ))}
        </div>
      ) : (
        <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-[#00d4ff]/25 bg-[#050d1a]/85 px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#00d4ff]/70 backdrop-blur-md">
          {">"} click · drag · scroll
        </div>
      )}
    </div>
  );
}
