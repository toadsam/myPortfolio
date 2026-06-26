"use client";

import {Canvas} from "@react-three/fiber";
import {ContactShadows, Environment, Float} from "@react-three/drei";
import {Suspense} from "react";
import {npcs} from "@/data/npcs";
import {rockPositions, treePositions, villageBuildings} from "@/lib/constants";
import type {NPCData, SectionId} from "@/types/portfolio";
import {Building} from "./Building";
import {CameraController} from "./CameraController";
import {Fence, PathSegment, Rock, SignPost} from "./Decorations";
import {NPC} from "./NPC";
import {Tree} from "./Tree";

interface VillageSceneProps {
  activeSection: SectionId;
  activeNpcId?: string;
  onSelectSection: (sectionId: SectionId) => void;
  onSelectNpc: (npc: NPCData) => void;
}

function Ground() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 13]} />
        <meshStandardMaterial color="#bddb8d" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, -0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.6, 56]} />
        <meshStandardMaterial color="#cbe49b" roughness={0.86} />
      </mesh>
      <PathSegment length={11.4} position={[0, 0, 0]} />
      <PathSegment length={10.3} position={[0, 0, 0]} rotationZ={Math.PI / 2} />
      <PathSegment length={4.8} position={[-2.18, 0, -1.02]} rotationZ={-2.7} width={0.34} />
      <PathSegment length={4.8} position={[2.18, 0, -1.02]} rotationZ={-0.44} width={0.34} />
      <PathSegment length={4.9} position={[-2.02, 0, 1.62]} rotationZ={2.47} width={0.34} />
      <PathSegment length={4.9} position={[2.02, 0, 1.62]} rotationZ={0.67} width={0.34} />
    </group>
  );
}

function VillageDecorations() {
  return (
    <group>
      {rockPositions.map((position, index) => (
        <Rock key={position.join("-")} position={position} scale={index % 2 === 0 ? 1 : 0.72} />
      ))}
      <Fence position={[-5.7, 0, -0.6]} rotation={Math.PI / 2} />
      <Fence position={[5.7, 0, -0.6]} rotation={Math.PI / 2} />
      <Fence position={[-2.7, 0, 5.2]} />
      <Fence position={[2.7, 0, 5.2]} />
      <SignPost label="LAB" position={[-2.65, 0, -2.05]} />
      <SignPost label="SKILLS" position={[2.65, 0, -2.05]} />
      <SignPost label="ARCHIVE" position={[-2.55, 0, 2.75]} />
      <SignPost label="POST" position={[2.55, 0, 2.75]} />
    </group>
  );
}

function ActiveRoute({activeSection}: {activeSection: SectionId}) {
  const building = villageBuildings.find((item) => item.sectionId === activeSection);

  if (!building || activeSection === "intro") {
    return (
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.48, 1.58, 48]} />
        <meshBasicMaterial color="#7ed957" transparent opacity={0.42} />
      </mesh>
    );
  }

  const [x, , z] = building.position;
  const distance = Math.sqrt(x * x + z * z);
  const angle = Math.atan2(z, x);

  return (
    <group>
      <mesh position={[x / 2, 0.05, z / 2]} rotation={[-Math.PI / 2, 0, angle]}>
        <planeGeometry args={[distance, 0.18]} />
        <meshBasicMaterial color={building.accentColor} transparent opacity={0.42} />
      </mesh>
      <mesh position={[x, 0.12, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.12, 1.24, 40]} />
        <meshBasicMaterial color={building.accentColor} transparent opacity={0.52} />
      </mesh>
    </group>
  );
}

export function VillageScene({activeSection, activeNpcId, onSelectNpc, onSelectSection}: VillageSceneProps) {
  return (
    <div className="relative h-[48vh] min-h-[390px] overflow-hidden border-y border-[#d8c48c]/70 bg-[#d7f0d7] shadow-[inset_0_-30px_70px_rgba(93,121,70,0.18)] md:h-screen md:min-h-[720px] md:border-y-0 md:border-r">
      <Canvas camera={{fov: 42, position: [6.4, 6, 7.2]}} dpr={[1, 1.75]} gl={{antialias: true}} shadows="percentage">
        <color args={["#d8efd7"]} attach="background" />
        <fog args={["#d8efd7", 10, 20]} attach="fog" />
        <ambientLight intensity={0.9} />
        <hemisphereLight args={["#f9ffd8", "#7aa36b", 0.72]} />
        <directionalLight castShadow intensity={1.35} position={[4, 8, 5]} shadow-mapSize={[1024, 1024]} />
        <pointLight color="#fff1ba" intensity={1.2} position={[0, 3.2, 0]} />
        <Suspense fallback={null}>
          <Environment preset="park" />
          <Ground />
          <VillageDecorations />
          <ActiveRoute activeSection={activeSection} />
          {villageBuildings.map((building) => (
            <Float floatIntensity={building.sectionId === "intro" ? 0.04 : 0.018} key={building.id} rotationIntensity={0.01} speed={1.1}>
              <Building building={building} isActive={activeSection === building.sectionId} onSelect={onSelectSection} />
            </Float>
          ))}
          {npcs.map((npc) => (
            <NPC isActive={activeNpcId === npc.id} key={npc.id} npc={npc} onSelect={onSelectNpc} />
          ))}
          {treePositions.map((position, index) => (
            <Tree key={position.join("-")} position={position} scale={index % 3 === 0 ? 1.15 : 0.92 + (index % 2) * 0.18} />
          ))}
          <ContactShadows blur={2.4} far={8} opacity={0.28} position={[0, 0.02, 0]} scale={12} />
        </Suspense>
        <CameraController activeSection={activeSection} />
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/75 bg-white/72 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#4a6841] shadow-sm backdrop-blur-md">
        Click buildings or NPCs
      </div>
    </div>
  );
}
