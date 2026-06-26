"use client";

import {Html, useCursor} from "@react-three/drei";
import {useState} from "react";
import type {ThreeEvent} from "@react-three/fiber";
import type {BuildingData, SectionId} from "@/types/portfolio";

interface BuildingProps {
  building: BuildingData;
  isActive: boolean;
  onSelect: (sectionId: SectionId) => void;
}

export function Building({building, isActive, onSelect}: BuildingProps) {
  const [hovered, setHovered] = useState(false);
  const [width, height, depth] = building.size;
  const isHighlighted = hovered || isActive;
  const scale = isHighlighted ? 1.045 : 1;

  useCursor(hovered);

  function handlePointer(event: ThreeEvent<PointerEvent>, nextHovered: boolean) {
    event.stopPropagation();
    setHovered(nextHovered);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onSelect(building.sectionId);
  }

  return (
    <group position={building.position}>
      <group
        onClick={handleClick}
        onPointerEnter={(event) => handlePointer(event, true)}
        onPointerLeave={(event) => handlePointer(event, false)}
        scale={[scale, scale, scale]}
      >
        {building.kind === "plaza" ? (
          <PlazaBuilding active={isHighlighted} building={building} />
        ) : (
          <>
            <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial
                color={building.color}
                emissive={isHighlighted ? building.accentColor : "#000000"}
                emissiveIntensity={isHighlighted ? 0.16 : 0}
                roughness={0.72}
              />
            </mesh>
            <mesh castShadow position={[0, height + 0.44, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[Math.max(width, depth) * 0.72, 0.92, 4]} />
              <meshStandardMaterial color={building.roofColor} roughness={0.64} />
            </mesh>
            <Door building={building} depth={depth} highlighted={isHighlighted} height={height} width={width} />
            <BuildingDetails building={building} height={height} width={width} depth={depth} />
          </>
        )}

        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(width, depth) * 0.66, Math.max(width, depth) * 0.72, 48]} />
          <meshBasicMaterial color={isHighlighted ? "#7ed957" : "#d3c28b"} transparent opacity={isHighlighted ? 0.72 : 0.28} />
        </mesh>
      </group>

      <Html center distanceFactor={9.5} position={[0, height + 1.28, 0]} zIndexRange={[10, 0]}>
        <button
          className={isHighlighted ? "scene-label scene-label-active" : "scene-label"}
          onClick={() => onSelect(building.sectionId)}
          type="button"
        >
          <span>{building.label}</span>
          <strong>{building.name}</strong>
        </button>
      </Html>
    </group>
  );
}

function Door({building, depth, highlighted, height, width}: {building: BuildingData; depth: number; highlighted: boolean; height: number; width: number}) {
  return (
    <mesh position={[0, height * 0.28, depth / 2 + 0.012]}>
      <boxGeometry args={[width * 0.34, height * 0.46, 0.045]} />
      <meshStandardMaterial color={highlighted ? "#eef7c6" : building.accentColor} roughness={0.58} />
    </mesh>
  );
}

function PlazaBuilding({active, building}: {active: boolean; building: BuildingData}) {
  return (
    <group>
      <mesh receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.38, 1.52, 0.16, 36]} />
        <meshStandardMaterial color={building.color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.54, 0.64, 0.22, 28]} />
        <meshStandardMaterial color="#d6c98e" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, 0.54, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.34, 24]} />
        <meshStandardMaterial color="#f5f2d4" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.22, 18, 18]} />
        <meshStandardMaterial color={active ? "#bdf6ff" : "#d8f8ff"} emissive="#8fdceb" emissiveIntensity={active ? 0.32 : 0.12} roughness={0.2} />
      </mesh>
    </group>
  );
}

function BuildingDetails({building, depth, height, width}: {building: BuildingData; depth: number; height: number; width: number}) {
  if (building.kind === "lab") {
    return (
      <group>
        <mesh castShadow position={[width * 0.28, height + 0.56, -depth * 0.18]}>
          <cylinderGeometry args={[0.12, 0.14, 0.68, 10]} />
          <meshStandardMaterial color="#b8704c" roughness={0.68} />
        </mesh>
        <mesh position={[width * 0.28, height + 0.95, -depth * 0.18]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#b9e8ff" emissive="#9be1ff" emissiveIntensity={0.25} />
        </mesh>
        <WindowRow color={building.accentColor} depth={depth} height={height} width={width} />
      </group>
    );
  }

  if (building.kind === "workshop") {
    return (
      <group>
        <mesh position={[0, height * 0.62, depth / 2 + 0.018]}>
          <boxGeometry args={[width * 0.58, height * 0.3, 0.05]} />
          <meshStandardMaterial color="#263241" emissive="#3ee18a" emissiveIntensity={0.18} roughness={0.35} />
        </mesh>
        <mesh position={[0, height * 0.62, depth / 2 + 0.05]}>
          <boxGeometry args={[width * 0.42, height * 0.035, 0.025]} />
          <meshBasicMaterial color="#8bf58d" />
        </mesh>
      </group>
    );
  }

  if (building.kind === "archive") {
    return (
      <group>
        {[-0.42, 0, 0.42].map((x) => (
          <mesh castShadow key={x} position={[x * width, height * 0.38, depth / 2 + 0.055]}>
            <cylinderGeometry args={[0.055, 0.065, height * 0.62, 10]} />
            <meshStandardMaterial color="#f6eddb" roughness={0.7} />
          </mesh>
        ))}
        {[-0.32, 0, 0.32].map((x) => (
          <mesh key={x} position={[x * width, height + 0.2, depth * 0.18]} rotation={[0, 0, x * 0.2]}>
            <boxGeometry args={[0.22, 0.5, 0.12]} />
            <meshStandardMaterial color={x === 0 ? "#b68fd8" : "#8f6b45"} roughness={0.62} />
          </mesh>
        ))}
      </group>
    );
  }

  if (building.kind === "post") {
    return (
      <group>
        <mesh castShadow position={[width * 0.44, height + 0.45, depth * 0.2]}>
          <cylinderGeometry args={[0.035, 0.045, 0.82, 8]} />
          <meshStandardMaterial color="#8b5a35" roughness={0.66} />
        </mesh>
        <mesh position={[width * 0.58, height + 0.66, depth * 0.2]}>
          <boxGeometry args={[0.44, 0.24, 0.035]} />
          <meshStandardMaterial color="#f4f0df" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[-width * 0.38, 0.3, depth / 2 + 0.28]}>
          <boxGeometry args={[0.42, 0.34, 0.28]} />
          <meshStandardMaterial color="#e07055" roughness={0.56} />
        </mesh>
      </group>
    );
  }

  return null;
}

function WindowRow({color, depth, height, width}: {color: string; depth: number; height: number; width: number}) {
  return (
    <group>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x * width, height * 0.62, depth / 2 + 0.02]}>
          <boxGeometry args={[width * 0.22, height * 0.24, 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.08} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
