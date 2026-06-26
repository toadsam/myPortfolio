"use client";

import {Billboard, Html, useCursor} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useRef, useState} from "react";
import type {ThreeEvent} from "@react-three/fiber";
import type {Group, Vector3} from "three";
import type {NpcBehaviorProfile} from "@/data/npcBehaviors";
import {moodLabel} from "@/lib/liveState";
import {isWalkablePosition} from "@/lib/worldCollision";
import type {NpcState} from "@/types/live";
import type {BuildingData, NPCData, Vector3Tuple} from "@/types/portfolio";

interface NPCProps {
  npc: NPCData;
  npcState?: NpcState;
  behavior?: NpcBehaviorProfile;
  bubbleText?: string;
  buildings: Array<Pick<BuildingData, "id" | "position" | "size">>;
  isActive: boolean;
  onPositionChange?: (npcId: string, position: Vector3Tuple) => void;
  onSelect: (npc: NPCData) => void;
}

export function NPC({npc, npcState, behavior, bubbleText, buildings, isActive, onPositionChange, onSelect}: NPCProps) {
  const groupRef = useRef<Group | null>(null);
  const elapsedRef = useRef(0);
  const targetRef = useRef<Vector3Tuple>(behavior?.home ?? npc.position);
  const retargetAtRef = useRef(0);
  const reportAtRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const highlighted = hovered || isActive;
  const rawMood = npcState?.mood ?? "calm";
  const mood = moodLabel(rawMood);
  const home = behavior?.home ?? npc.position;
  const roamRadius = behavior?.roamRadius ?? 1.5;

  useCursor(hovered);

  useFrame(({clock}, delta) => {
    elapsedRef.current += delta;

    if (!groupRef.current) {
      return;
    }

    const speed = rawMood === "busy" ? 4.2 : rawMood === "sleepy" ? 1.2 : 2.4;
    const height = rawMood === "busy" ? 0.08 : rawMood === "sleepy" ? 0.025 : 0.05;
    const moveSpeed = rawMood === "busy" || rawMood === "excited" ? 0.95 : rawMood === "sleepy" ? 0.22 : 0.48;
    const now = clock.getElapsedTime();

    if (now > retargetAtRef.current || distanceToTarget(groupRef.current.position, targetRef.current) < 0.25) {
      targetRef.current = pickTarget(home, roamRadius, buildings);
      retargetAtRef.current = now + 4 + Math.random() * 7;
    }

    const target = targetRef.current;
    const dx = target[0] - groupRef.current.position.x;
    const dz = target[2] - groupRef.current.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.05) {
      const step = Math.min(moveSpeed * delta, dist);
      const nextX = groupRef.current.position.x + (dx / dist) * step;
      const nextZ = groupRef.current.position.z + (dz / dist) * step;

      if (isWalkablePosition({x: nextX, z: nextZ}, buildings, {padding: 0.38})) {
        groupRef.current.position.x = nextX;
        groupRef.current.position.z = nextZ;
        groupRef.current.rotation.y = Math.atan2(dx, dz);
      } else {
        retargetAtRef.current = 0;
      }
    }

    groupRef.current.position.y = Math.sin(elapsedRef.current * speed + home[0]) * height;

    if (onPositionChange && now > reportAtRef.current) {
      onPositionChange(npc.id, [groupRef.current.position.x, 0, groupRef.current.position.z]);
      reportAtRef.current = now + 0.4;
    }
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
    <group ref={groupRef} position={home}>
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
            <span className="block">{npc.name}</span>
            {npcState ? <span className="block text-[9px] uppercase tracking-[0.12em] opacity-65">{mood}</span> : null}
          </button>
        </Html>
      </Billboard>
      {bubbleText ? (
        <Billboard position={[0, 2.28, 0]}>
          <Html center distanceFactor={7.4} zIndexRange={[11, 0]}>
            <div className="max-w-[190px] rounded-xl border border-[#00d4ff]/35 bg-[#050d1a]/90 px-3 py-2 text-center font-mono text-[11px] font-bold leading-5 text-white shadow-2xl backdrop-blur-md">
              {bubbleText}
            </div>
          </Html>
        </Billboard>
      ) : null}
    </group>
  );
}

function distanceToTarget(position: Vector3, target: Vector3Tuple) {
  const dx = position.x - target[0];
  const dz = position.z - target[2];
  return Math.sqrt(dx * dx + dz * dz);
}

function pickTarget(
  home: Vector3Tuple,
  radius: number,
  buildings: Array<Pick<BuildingData, "id" | "position" | "size">>,
): Vector3Tuple {
  for (let i = 0; i < 12; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = radius * (0.25 + Math.random() * 0.75);
    const candidate: Vector3Tuple = [
      home[0] + Math.cos(angle) * distance,
      0,
      home[2] + Math.sin(angle) * distance,
    ];

    if (isWalkablePosition({x: candidate[0], z: candidate[2]}, buildings, {padding: 0.38})) {
      return candidate;
    }
  }

  return home;
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
