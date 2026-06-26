"use client";

import {ContactShadows, Html} from "@react-three/drei";
import {Canvas} from "@react-three/fiber";
import {AnimatePresence, motion} from "framer-motion";
import {Suspense, useState} from "react";
import {experienceItems} from "@/data/experience";
import type {ExperienceItem} from "@/types/portfolio";
import {InteriorCharacterController} from "./InteriorCharacterController";

function ExperiencePedestal({
  item,
  position,
  accentColor,
  onSelect
}: {
  item: ExperienceItem;
  position: [number, number, number];
  accentColor: string;
  onSelect: (item: ExperienceItem) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={() => onSelect(item)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Pedestal base */}
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[1.8, 0.35, 1.2]} />
        <meshStandardMaterial
          color={hovered ? "#f5edd8" : "#d4b880"}
          emissive={accentColor}
          emissiveIntensity={hovered ? 0.12 : 0.03}
          roughness={0.55}
        />
      </mesh>
      {/* Pedestal column */}
      <mesh castShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[0.35, 0.72, 0.35]} />
        <meshStandardMaterial color="#c8a86a" roughness={0.6} />
      </mesh>
      {/* Display frame */}
      <mesh castShadow position={[0, 1.55, 0]}>
        <boxGeometry args={[1.9, 1.85, 0.1]} />
        <meshStandardMaterial
          color={hovered ? "#fff8ec" : "#f0e8d0"}
          emissive={accentColor}
          emissiveIntensity={hovered ? 0.1 : 0.03}
          roughness={0.5}
        />
      </mesh>
      {/* Frame border */}
      <mesh position={[0, 1.55, -0.06]}>
        <boxGeometry args={[2.1, 2.05, 0.04]} />
        <meshBasicMaterial color={hovered ? accentColor : "#a07840"} transparent opacity={hovered ? 0.9 : 0.5} />
      </mesh>
      {/* Floor glow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.12, 36]} />
        <meshBasicMaterial color={accentColor} transparent opacity={hovered ? 0.45 : 0.15} />
      </mesh>
      {/* Html label */}
      <Html center distanceFactor={9} position={[0, 1.55, 0.1]} zIndexRange={[5, 0]}>
        <div
          style={{
            width: 140,
            textAlign: "center",
            pointerEvents: "none",
            userSelect: "none",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.2em",
              color: accentColor,
              marginBottom: 6,
              textTransform: "uppercase"
            }}
          >
            {item.year}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: "#1f2a24",
              lineHeight: 1.3,
              marginBottom: 8
            }}
          >
            {item.title}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#5e6757",
              lineHeight: 1.5
            }}
          >
            {item.description.slice(0, 60)}…
          </div>
          {hovered ? (
            <div
              style={{
                marginTop: 8,
                fontSize: 9,
                fontWeight: 900,
                color: accentColor,
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              }}
            >
              클릭 →
            </div>
          ) : null}
        </div>
      </Html>
    </group>
  );
}

function Bookshelf({position, rotation}: {position: [number, number, number]; rotation?: [number, number, number]}) {
  const bookColors = ["#c8542a", "#3a6eb5", "#5f9f4f", "#8b3ab5", "#b55a3a", "#3ab59e", "#b5933a", "#3a6eb5"];

  return (
    <group position={position} rotation={rotation}>
      {/* Shelf frame */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[3.2, 2.4, 0.36]} />
        <meshStandardMaterial color="#7a5530" roughness={0.7} />
      </mesh>
      {/* Shelf boards */}
      {[0, 0.72, 1.44].map((y, si) => (
        <mesh key={si} position={[0, y + 0.12, 0.01]}>
          <boxGeometry args={[3.0, 0.06, 0.3]} />
          <meshStandardMaterial color="#8b6340" roughness={0.65} />
        </mesh>
      ))}
      {/* Books */}
      {bookColors.map((color, i) => {
        const shelf = Math.floor(i / 3);
        const pos = i % 3;
        return (
          <mesh key={i} castShadow position={[-1.0 + pos * 0.72, shelf * 0.72 + 0.36, 0.05]}>
            <boxGeometry args={[0.52 + (i % 3) * 0.08, 0.58, 0.2]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function ArchiveRoom() {
  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#3d2814" roughness={0.7} />
      </mesh>
      {/* Floor boards */}
      {Array.from({length: 10}, (_, i) => i - 5).map((i) => (
        <mesh key={`floorboard-${i}`} position={[i * 1.7, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 14]} />
          <meshBasicMaterial color="#2a1c0a" transparent opacity={0.4} />
        </mesh>
      ))}
      {/* Walls */}
      <mesh position={[0, 2.2, -6.5]}>
        <planeGeometry args={[18, 4.4]} />
        <meshStandardMaterial color="#1e1408" roughness={0.9} />
      </mesh>
      <mesh position={[-9, 2.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial color="#1c1206" roughness={0.9} />
      </mesh>
      <mesh position={[9, 2.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial color="#1c1206" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.2, 6.5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[18, 4.4]} />
        <meshStandardMaterial color="#1e1408" roughness={0.9} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 4.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#140e04" roughness={1} />
      </mesh>
      {/* Pendant lights */}
      {[-4, 0, 4].map((x) => (
        <group key={`pendant-${x}`}>
          <mesh position={[x, 4.2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
            <meshStandardMaterial color="#4a3820" roughness={0.7} />
          </mesh>
          <mesh position={[x, 3.85, 0]}>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial
              color="#f5d880"
              emissive="#f5c840"
              emissiveIntensity={0.6}
              roughness={0.3}
              transparent
              opacity={0.85}
            />
          </mesh>
          <pointLight color="#f5c840" decay={2} distance={7} intensity={1.4} position={[x, 3.7, 0]} />
        </group>
      ))}
      {/* Bookshelves */}
      <Bookshelf position={[-8.0, 0, -1.5]} rotation={[0, Math.PI / 2, 0]} />
      <Bookshelf position={[8.0, 0, -1.5]} rotation={[0, -Math.PI / 2, 0]} />
      {/* Archive title sign */}
      <Html center distanceFactor={14} position={[0, 3.6, -6.4]} zIndexRange={[5, 0]}>
        <div
          style={{
            pointerEvents: "none",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            userSelect: "none"
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#c8a86a"
            }}
          >
            Archive · 기록관
          </div>
        </div>
      </Html>
    </group>
  );
}

const ACCENT_COLORS = ["#b55a3a", "#3a6eb5", "#5f9f4f"];

interface Props {
  onBack: () => void;
}

export function ArchiveInterior({onBack}: Props) {
  const [selectedItem, setSelectedItem] = useState<ExperienceItem | null>(null);
  const count = experienceItems.length;
  const spacing = 4.2;
  const startX = -((count - 1) / 2) * spacing;

  return (
    <div className="fixed inset-0 z-40 bg-[#1e1408]">
      <Canvas camera={{fov: 58, position: [0, 3.5, 9]}} dpr={[1, 1.75]} gl={{antialias: true}} shadows>
        <color args={["#140e04"]} attach="background" />
        <fog args={["#140e04", 12, 22]} attach="fog" />
        <ambientLight color="#f5c840" intensity={0.25} />
        <hemisphereLight args={["#f5e0a0", "#3d2814", 0.45]} />
        <directionalLight color="#f5d080" intensity={0.4} position={[3, 6, 4]} />
        <Suspense fallback={null}>
          <ArchiveRoom />
          {experienceItems.map((item, i) => (
            <ExperiencePedestal
              accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length] ?? "#c8a86a"}
              item={item}
              key={item.title}
              position={[startX + i * spacing, 0, -1.5]}
              onSelect={setSelectedItem}
            />
          ))}
          <ContactShadows blur={3} far={6} opacity={0.5} position={[0, 0.01, 0]} scale={20} />
          <InteriorCharacterController
            bounds={{xMin: -7.5, xMax: 7.5, zMin: -5, zMax: 6}}
            startPosition={[0, 0, 4.5]}
          />
        </Suspense>
      </Canvas>

      <button
        className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-[#c8a86a]/60 bg-[#1e1408]/90 px-4 py-2.5 text-sm font-bold text-[#c8a86a] shadow-lg backdrop-blur-md transition hover:bg-[#2a1c0a]"
        onClick={onBack}
        type="button"
      >
        ← 마을로 돌아가기
      </button>

      <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl border border-[#c8a86a]/40 bg-[#1e1408]/80 px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#c8a86a] backdrop-blur-md">
        기록관
      </div>

      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#c8a86a]/40 bg-[#1e1408]/80 px-4 py-2.5 backdrop-blur-md">
        {[
          ["W", "앞"],
          ["A", "좌"],
          ["S", "뒤"],
          ["D", "우"]
        ].map(([key, label]) => (
          <span className="flex flex-col items-center gap-0.5" key={key}>
            <kbd className="rounded border border-[#c8a86a]/50 bg-[#2a1c0a] px-2 py-0.5 text-xs font-black text-[#c8a86a]">
              {key}
            </kbd>
            <span className="text-[9px] text-[#8a6a3e]">{label}</span>
          </span>
        ))}
        <span className="ml-2 h-4 w-px bg-[#c8a86a]/30" />
        <span className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-bold text-[#c8a86a]">기록판 클릭</span>
          <span className="text-[9px] text-[#8a6a3e]">상세보기</span>
        </span>
      </div>

      <AnimatePresence>
        {selectedItem ? (
          <motion.div
            animate={{opacity: 1}}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            exit={{opacity: 0}}
            initial={{opacity: 0}}
            transition={{duration: 0.18}}
          >
            <div
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              animate={{opacity: 1, scale: 1, y: 0}}
              className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-[#c8a86a] bg-[#1e1408] p-7 shadow-2xl"
              exit={{opacity: 0, scale: 0.95, y: 8}}
              initial={{opacity: 0, scale: 0.95, y: 8}}
              onClick={(e) => e.stopPropagation()}
              transition={{duration: 0.22, ease: [0.22, 1, 0.36, 1]}}
            >
              <button
                className="absolute right-4 top-4 h-8 w-8 rounded-lg text-[#8a6a3e] transition hover:bg-[#2a1c0a] hover:text-[#c8a86a]"
                onClick={() => setSelectedItem(null)}
                type="button"
              >
                ✕
              </button>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c8a86a]">{selectedItem.year}</p>
              <h2 className="mt-2 text-2xl font-black text-[#f0e0c0]">{selectedItem.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[#c8a86a]">{selectedItem.description}</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
