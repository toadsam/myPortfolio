"use client";

import {Canvas} from "@react-three/fiber";
import {AdaptiveDpr, AdaptiveEvents, ContactShadows, Html, useGLTF} from "@react-three/drei";
import {Suspense} from "react";
import {npcBehaviorProfiles} from "@/data/npcBehaviors";
import {autonomousNpcs} from "@/data/npcRoster";
import {rockPositions, treePositions, villageBuildings} from "@/lib/constants";
import {getBuildingState, getNpcState} from "@/lib/liveState";
import type {NpcRuntimeState, NpcState, VillageState} from "@/types/live";
import type {ExplorationMode, NPCData, SectionId, Vector3Tuple} from "@/types/portfolio";
import {Building} from "./Building";
import {CameraController} from "./CameraController";
import {CharacterController} from "./CharacterController";
import {Rock} from "./Decorations";
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
  npcRuntimeStates: Record<string, NpcRuntimeState>;
  onNpcPositionChange: (npcId: string, position: Vector3Tuple) => void;
  villageState: VillageState | null;
}

function Statue() {
  const {scene} = useGLTF("/models/environment/statue.glb");
  return (
    <primitive
      object={scene}
      position={[0, 2.5, 2]}
      scale={[3.5, 3.5, 3.5]}
      castShadow
    />
  );
}

useGLTF.preload("/models/environment/statue.glb");

function Ground() {
  const {scene} = useGLTF("/models/environment/ground.glb");
  return (
    <group>
      <primitive
        object={scene}
        position={[0, -0.6, 2]}
        scale={[12, 12, 12]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      />
      <pointLight color="#00d4ff" intensity={2.5} distance={12} decay={2} position={[0, 1.5, 0]} />
    </group>
  );
}

useGLTF.preload("/models/environment/ground.glb");

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
          whiteSpace: "nowrap"
        }}>
          {"</>"} {label}
        </span>
      </Html>
    </group>
  );
}

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

function LiveDecorations({villageState}: {villageState: VillageState | null}) {
  if (!villageState) return null;

  const unlocked = new Set(villageState.unlocked_items);

  return (
    <group>
      {unlocked.has("training-statue") ? (
        <group position={[1.7, 0, 1.8]}>
          <mesh castShadow position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.35, 0.42, 0.36, 18]} />
            <meshStandardMaterial color="#26364a" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0, 0.72, 0]}>
            <boxGeometry args={[0.28, 0.72, 0.18]} />
            <meshStandardMaterial color="#7ed957" emissive="#7ed957" emissiveIntensity={0.18} />
          </mesh>
          <pointLight color="#7ed957" intensity={0.8} distance={3} decay={2} position={[0, 1.1, 0]} />
        </group>
      ) : null}

      {unlocked.has("lab-beacon") ? (
        <group position={[-4.2, 0, -3.4]}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1, 12]} />
            <meshStandardMaterial color="#0a1a2e" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.16, 18, 18]} />
            <meshBasicMaterial color="#00d4ff" />
          </mesh>
          <pointLight color="#00d4ff" intensity={1.5} distance={5} decay={2} position={[0, 1.2, 0]} />
        </group>
      ) : null}

      {unlocked.has("study-fountain") ? (
        <group position={[2.2, 0, -2.1]}>
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.48, 32]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.65} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

export function VillageScene({
  activeSection, activeNpcId, explorationMode, isIntro = false,
  onSelectNpc, onRequestEnter, npcRuntimeStates, onNpcPositionChange, villageState
}: VillageSceneProps) {
  const isWalkMode = explorationMode === "walk";

  return (
    <div className="relative h-[48vh] min-h-[390px] overflow-hidden border-y border-[#00d4ff]/15 bg-[#050d1a] shadow-[inset_0_-30px_70px_rgba(0,100,255,0.1)] md:h-screen md:min-h-[720px] md:border-y-0 md:border-r">
      <Canvas
        camera={{fov: 40, position: [4, 14, 16]}}
        dpr={[1, 1.25]}
        performance={{min: 0.5}}
        gl={{antialias: true, powerPreference: "high-performance"}}
      >
        {/* 움직일 땐 해상도/이벤트 자동 저하 → 멈추면 선명하게 */}
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />
        <color args={["#a8c8e8"]} attach="background" />
        <fog args={["#b8d4ee", 35, 70]} attach="fog" />
        <ambientLight color="#ffffff" intensity={4.5} />
        <directionalLight color="#fff8e8" intensity={5.0} position={[8, 20, 8]} />
        <directionalLight color="#d0e8ff" intensity={2.5} position={[-6, 12, -4]} />
        <hemisphereLight args={["#87ceeb", "#4a7a3a", 3.0]} />

        <pointLight color="#00d4ff" intensity={1.8} distance={22} decay={2} position={[-5, 5, 0]} />
        <pointLight color="#aa44ff" intensity={1.5} distance={20} decay={2} position={[3, 5, -5]} />
        <pointLight color="#00ff88" intensity={1.5} distance={20} decay={2} position={[6, 5, 5]} />
        <pointLight color="#ff6600" intensity={1.2} distance={16} decay={2} position={[0, 4, 9]} />

        <Suspense fallback={null}>
          <Ground />
          <Statue />

          <DistrictSign label="Project District" position={[-8.5, 0, -5.5]} color="#00d4ff" />
          <DistrictSign label="Skills District" position={[0, 0, -9.0]} color="#aa44ff" />
          <DistrictSign label="Experience District" position={[9.2, 0, 5]} color="#00ff88" />

          {!isWalkMode && <ActiveRoute activeSection={activeSection} />}
          <LiveDecorations villageState={villageState} />

          {villageBuildings.map((building) => (
            <Building
              key={building.id}
              building={building}
              buildingState={getBuildingState(villageState, building.id)}
              isActive={activeSection === building.sectionId}
              onRequestEnter={isWalkMode ? () => {} : onRequestEnter}
            />
          ))}

          {autonomousNpcs.map((npc) => (
            <NPC
              behavior={npcBehaviorProfiles[npc.id]}
              bubbleText={visibleBubble(npcRuntimeStates[npc.id])}
              buildings={villageBuildings}
              isActive={activeNpcId === npc.id}
              key={npc.id}
              npc={npc}
              npcState={displayNpcState(npc.id, npcRuntimeStates[npc.id], getNpcState(villageState, npc.id))}
              currentAction={npcRuntimeStates[npc.id]?.currentAction}
              onPositionChange={onNpcPositionChange}
              onSelect={onSelectNpc}
            />
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

      {isWalkMode ? (
        <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-xl border border-[#00d4ff]/30 bg-[#050d1a]/85 px-4 py-2.5 backdrop-blur-md">
          {[["W", "앞"], ["A", "왼쪽"], ["S", "뒤"], ["D", "오른쪽"]].map(([key, label]) => (
            <span className="flex flex-col items-center gap-0.5" key={key}>
              <kbd className="rounded border border-[#00d4ff]/50 bg-[#0a1a30] px-2 py-0.5 font-mono text-xs font-black text-[#00d4ff]">{key}</kbd>
              <span className="font-mono text-[10px] text-[#0066aa]">{label}</span>
            </span>
          ))}
        </div>
      ) : (
        <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-[#00d4ff]/25 bg-[#050d1a]/85 px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#00d4ff]/70 backdrop-blur-md">
          {">"} click / drag / scroll
        </div>
      )}
    </div>
  );
}

function visibleBubble(runtime?: NpcRuntimeState) {
  if (!runtime?.bubbleText || !runtime.bubbleExpiresAt) return undefined;
  return runtime.bubbleExpiresAt > Date.now() ? runtime.bubbleText : undefined;
}

function displayNpcState(npcId: string, runtime?: NpcRuntimeState, base?: NpcState): NpcState | undefined {
  if (!runtime && !base) return undefined;

  return {
    npc_id: npcId,
    mood: runtime?.mood ?? base?.mood ?? "calm",
    status_text: runtime?.memory ?? base?.status_text ?? ""
  };
}
