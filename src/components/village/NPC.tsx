"use client";

import {Billboard, Html, useCursor} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useRef, useState} from "react";
import type {ThreeEvent} from "@react-three/fiber";
import type {Group} from "three";
import type {NPCData} from "@/types/portfolio";

interface NPCProps {
  npc: NPCData;
  isActive: boolean;
  onSelect: (npc: NPCData) => void;
}

export function NPC({npc, isActive, onSelect}: NPCProps) {
  const groupRef = useRef<Group | null>(null);
  const elapsedRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const highlighted = hovered || isActive;

  useCursor(hovered);

  useFrame((_, delta) => {
    elapsedRef.current += delta;

    if (!groupRef.current) {
      return;
    }

    groupRef.current.position.y = Math.sin(elapsedRef.current * 2.4 + npc.position[0]) * 0.05;
  });

  function handlePointer(event: ThreeEvent<PointerEvent>, nextHovered: boolean) {
    event.stopPropagation();
    setHovered(nextHovered);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onSelect(npc);
  }

  return (
    <group ref={groupRef} position={npc.position}>
      <group
        onClick={handleClick}
        onPointerEnter={(event) => handlePointer(event, true)}
        onPointerLeave={(event) => handlePointer(event, false)}
        scale={highlighted ? 1.08 : 1}
      >
        <mesh castShadow position={[0, 0.55, 0]}>
          <capsuleGeometry args={[0.23, 0.48, 6, 12]} />
          <meshStandardMaterial color={npc.color} emissive={highlighted ? npc.color : "#000000"} emissiveIntensity={highlighted ? 0.22 : 0} roughness={0.58} />
        </mesh>
        <mesh castShadow position={[0, 1.08, 0]}>
          <sphereGeometry args={[0.27, 18, 18]} />
          <meshStandardMaterial color="#fff3d2" roughness={0.5} />
        </mesh>
        <NPCAccessory npc={npc} />
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.42, 24]} />
          <meshBasicMaterial color={highlighted ? "#7ed957" : "#a9cf8b"} transparent opacity={highlighted ? 0.95 : 0.5} />
        </mesh>
      </group>
      <Billboard position={[0, 1.72, 0]}>
        <Html center distanceFactor={8.2} zIndexRange={[10, 0]}>
          <button
            aria-label={"Talk to " + npc.name}
            className={highlighted ? "npc-label npc-label-active" : "npc-label"}
            onClick={() => onSelect(npc)}
            type="button"
          >
            {npc.name}
          </button>
        </Html>
      </Billboard>
    </group>
  );
}

function NPCAccessory({npc}: {npc: NPCData}) {
  if (npc.type === "guide") {
    return (
      <mesh position={[0, 1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.025, 8, 24]} />
        <meshStandardMaterial color={npc.accessoryColor} emissive={npc.accessoryColor} emissiveIntensity={0.2} />
      </mesh>
    );
  }

  if (npc.type === "project") {
    return (
      <mesh castShadow position={[0.26, 0.66, 0.08]} rotation={[0.25, 0, -0.25]}>
        <boxGeometry args={[0.24, 0.36, 0.04]} />
        <meshStandardMaterial color={npc.accessoryColor} roughness={0.52} />
      </mesh>
    );
  }

  if (npc.type === "developer") {
    return (
      <group position={[0, 0.72, 0.28]}>
        <mesh castShadow rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.46, 0.04, 0.28]} />
          <meshStandardMaterial color={npc.accessoryColor} roughness={0.36} />
        </mesh>
        <mesh position={[0, 0.1, -0.1]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.4, 0.24, 0.035]} />
          <meshStandardMaterial color="#293545" emissive="#7ef093" emissiveIntensity={0.16} />
        </mesh>
      </group>
    );
  }

  if (npc.type === "archivist") {
    return (
      <mesh castShadow position={[-0.28, 0.74, 0.12]} rotation={[0.2, 0.15, 0.35]}>
        <boxGeometry args={[0.25, 0.32, 0.08]} />
        <meshStandardMaterial color={npc.accessoryColor} roughness={0.62} />
      </mesh>
    );
  }

  return (
    <group position={[0.28, 0.72, 0.08]} rotation={[0.15, 0, -0.28]}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.2, 0.045]} />
        <meshStandardMaterial color={npc.accessoryColor} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.01, 0.03]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.18, 0.018, 0.02]} />
        <meshStandardMaterial color="#d96c55" roughness={0.48} />
      </mesh>
    </group>
  );
}
