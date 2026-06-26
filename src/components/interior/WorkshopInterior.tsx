"use client";

import {ContactShadows} from "@react-three/drei";
import {Html} from "@react-three/drei";
import {Canvas} from "@react-three/fiber";
import {AnimatePresence, motion} from "framer-motion";
import {Suspense, useState} from "react";
import {skills} from "@/data/skills";
import type {SkillData} from "@/types/portfolio";
import {InteriorCharacterController} from "./InteriorCharacterController";

type SkillGroup = "Frontend" | "3D / Motion" | "Backend" | "Game / XR" | "Workflow";

const SKILL_GROUPS: SkillGroup[] = ["Frontend", "3D / Motion", "Backend", "Game / XR", "Workflow"];

const GROUP_COLORS: Record<SkillGroup, string> = {
  Frontend: "#5f9f4f",
  "3D / Motion": "#3a6eb5",
  Backend: "#b55a3a",
  "Game / XR": "#8b3ab5",
  Workflow: "#3ab59e"
};

const BENCH_POSITIONS: Record<SkillGroup, [number, number, number]> = {
  Frontend: [-3.8, 0, -1.5],
  "3D / Motion": [3.8, 0, -1.5],
  Backend: [-3.8, 0, 2.0],
  "Game / XR": [3.8, 0, 2.0],
  Workflow: [0, 0, -4.0]
};

function SkillBench({
  group,
  groupSkills,
  position,
  onSelect
}: {
  group: SkillGroup;
  groupSkills: SkillData[];
  position: [number, number, number];
  onSelect: (group: SkillGroup, skills: SkillData[]) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = GROUP_COLORS[group];

  return (
    <group
      position={position}
      onClick={() => onSelect(group, groupSkills)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Bench top */}
      <mesh castShadow receiveShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[2.6, 0.12, 1.8]} />
        <meshStandardMaterial
          color={hovered ? "#f0e8d8" : "#d4b880"}
          emissive={color}
          emissiveIntensity={hovered ? 0.14 : 0.04}
          roughness={0.45}
        />
      </mesh>
      {/* Bench body */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[2.4, 0.58, 1.6]} />
        <meshStandardMaterial color="#a07840" roughness={0.7} />
      </mesh>
      {/* Glow surface on hover */}
      <mesh position={[0, 0.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.18 : 0.06} />
      </mesh>
      {/* Label */}
      <Html center distanceFactor={9} position={[0, 1.6, 0]} zIndexRange={[5, 0]}>
        <div
          style={{
            textAlign: "center",
            pointerEvents: "none",
            userSelect: "none",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          <div
            style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color,
              background: "rgba(255,248,229,0.95)",
              border: `1.5px solid ${color}`,
              borderRadius: 8,
              padding: "4px 10px",
              marginBottom: 6,
              whiteSpace: "nowrap",
              boxShadow: hovered ? `0 0 12px ${color}55` : "none"
            }}
          >
            {group}
          </div>
          <br />
          <div
            style={{
              display: "inline-block",
              fontSize: 9,
              color: "#68715e",
              background: "rgba(255,253,246,0.92)",
              borderRadius: 6,
              padding: "3px 8px",
              whiteSpace: "nowrap",
              maxWidth: 180
            }}
          >
            {groupSkills.map((s) => s.name).join(" · ")}
          </div>
          {hovered ? (
            <div
              style={{
                marginTop: 6,
                fontSize: 9,
                fontWeight: 900,
                color,
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

function WorkshopRoom() {
  return (
    <group>
      {/* Floor with wood plank lines */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color="#b8864a" roughness={0.65} />
      </mesh>
      {Array.from({length: 11}, (_, i) => i - 5).map((i) => (
        <mesh key={`plank-${i}`} position={[i * 1.8, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 16]} />
          <meshBasicMaterial color="#8b6030" transparent opacity={0.35} />
        </mesh>
      ))}
      {/* Walls */}
      <mesh position={[0, 2, -7]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#f0e8d4" roughness={0.9} />
      </mesh>
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 4]} />
        <meshStandardMaterial color="#ece4d0" roughness={0.9} />
      </mesh>
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[16, 4]} />
        <meshStandardMaterial color="#ece4d0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2, 7]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#f0e8d4" roughness={0.9} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color="#e8dfc8" roughness={1} />
      </mesh>
      {/* Ceiling beams */}
      {[-4, 0, 4].map((x) => (
        <mesh key={`beam-${x}`} castShadow position={[x, 3.85, 0]}>
          <boxGeometry args={[0.28, 0.22, 16]} />
          <meshStandardMaterial color="#7a5530" roughness={0.72} />
        </mesh>
      ))}
      {/* Monitor on back wall */}
      <mesh position={[0, 2.0, -6.9]}>
        <boxGeometry args={[3.8, 2.5, 0.12]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#253342" emissiveIntensity={0.25} roughness={0.3} />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.55, -6.85]}>
        <boxGeometry args={[0.25, 1.0, 0.15]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.08, -6.75]}>
        <boxGeometry args={[1.0, 0.08, 0.5]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.5} />
      </mesh>
      {/* Monitor screen content */}
      <Html center distanceFactor={13} position={[0, 2.0, -6.75]} zIndexRange={[5, 0]}>
        <div
          style={{
            pointerEvents: "none",
            fontFamily: "monospace",
            textAlign: "center",
            userSelect: "none",
            width: 220
          }}
        >
          <div style={{fontSize: 11, fontWeight: 900, color: "#3ee18a", letterSpacing: "0.06em"}}>
            {">"} github.com/toadsam
          </div>
          <div style={{fontSize: 9, color: "#8fcf68", marginTop: 4}}>Code · Projects · History</div>
          <div
            style={{
              marginTop: 8,
              fontSize: 9,
              color: "#3ee18a",
              opacity: 0.6,
              letterSpacing: "0.12em"
            }}
          >
            ████████░░░░ 68%
          </div>
        </div>
      </Html>
      {/* Tool rack on left wall */}
      {[0.5, 1.2, 1.9].map((y, i) => (
        <mesh key={`tool-${i}`} castShadow position={[-9.5, y + 0.5, 1]}>
          <boxGeometry args={[0.06, 0.06, 1.0 - i * 0.2]} />
          <meshStandardMaterial color={["#5f9f4f", "#3a6eb5", "#b55a3a"][i] ?? "#5f9f4f"} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

interface Props {
  onBack: () => void;
}

export function WorkshopInterior({onBack}: Props) {
  const [selectedGroup, setSelectedGroup] = useState<{group: SkillGroup; skills: SkillData[]} | null>(null);

  const groupedSkills = SKILL_GROUPS.reduce<Record<SkillGroup, SkillData[]>>((acc, group) => {
    acc[group] = skills.filter((s) => s.group === group);
    return acc;
  }, {} as Record<SkillGroup, SkillData[]>);

  return (
    <div className="fixed inset-0 z-40 bg-[#f5f0e8]">
      <Canvas camera={{fov: 58, position: [0, 3.5, 9]}} dpr={[1, 1.75]} gl={{antialias: true}} shadows>
        <color args={["#f5f0e8"]} attach="background" />
        <fog args={["#f5f0e8", 12, 22]} attach="fog" />
        <ambientLight intensity={1.2} />
        <hemisphereLight args={["#fff8e0", "#c49b6a", 0.85]} />
        <directionalLight castShadow intensity={1.1} position={[4, 8, 4]} shadow-mapSize={[1024, 1024]} />
        <pointLight color="#fff3ba" decay={2} distance={12} intensity={1.5} position={[0, 3.5, 0]} />
        <pointLight color="#ffe8a0" decay={2} distance={8} intensity={0.8} position={[-4, 3, 2]} />
        <Suspense fallback={null}>
          <WorkshopRoom />
          {SKILL_GROUPS.map((group) => {
            const groupSkills = groupedSkills[group];
            if (!groupSkills?.length) return null;
            return (
              <SkillBench
                group={group}
                groupSkills={groupSkills}
                key={group}
                position={BENCH_POSITIONS[group]}
                onSelect={(g, s) => setSelectedGroup({group: g, skills: s})}
              />
            );
          })}
          <ContactShadows blur={2.5} far={6} opacity={0.28} position={[0, 0.01, 0]} scale={22} />
          <InteriorCharacterController
            bounds={{xMin: -8.5, xMax: 8.5, zMin: -5.5, zMax: 6}}
            startPosition={[0, 0, 5]}
          />
        </Suspense>
      </Canvas>

      <button
        className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-[#c4a060]/60 bg-[#fff8e5]/90 px-4 py-2.5 text-sm font-bold text-[#68715e] shadow-lg backdrop-blur-md transition hover:bg-[#f4e9c7]"
        onClick={onBack}
        type="button"
      >
        ← 마을로 돌아가기
      </button>

      <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl border border-[#c4a060]/50 bg-[#fff8e5]/80 px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#68715e] backdrop-blur-md">
        GitHub 작업실
      </div>

      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#c4a060]/40 bg-[#fff8e5]/80 px-4 py-2.5 backdrop-blur-md">
        {[
          ["W", "앞"],
          ["A", "좌"],
          ["S", "뒤"],
          ["D", "우"]
        ].map(([key, label]) => (
          <span className="flex flex-col items-center gap-0.5" key={key}>
            <kbd className="rounded border border-[#c4a060]/60 bg-white px-2 py-0.5 text-xs font-black text-[#68715e]">
              {key}
            </kbd>
            <span className="text-[9px] text-[#8a7a5e]">{label}</span>
          </span>
        ))}
        <span className="ml-2 h-4 w-px bg-[#c4a060]/30" />
        <span className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-bold text-[#68715e]">작업대 클릭</span>
          <span className="text-[9px] text-[#8a7a5e]">스킬 상세</span>
        </span>
      </div>

      {/* Skill detail modal */}
      <AnimatePresence>
        {selectedGroup ? (
          <motion.div
            animate={{opacity: 1}}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            exit={{opacity: 0}}
            initial={{opacity: 0}}
            transition={{duration: 0.18}}
          >
            <div
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
              onClick={() => setSelectedGroup(null)}
            />
            <motion.div
              animate={{opacity: 1, scale: 1, y: 0}}
              className="relative z-10 mx-4 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#d6c286] bg-[#fff8e5] p-7 shadow-2xl"
              exit={{opacity: 0, scale: 0.95, y: 8}}
              initial={{opacity: 0, scale: 0.95, y: 8}}
              onClick={(e) => e.stopPropagation()}
              transition={{duration: 0.22, ease: [0.22, 1, 0.36, 1]}}
            >
              <button
                className="absolute right-4 top-4 h-8 w-8 rounded-lg text-[#8a7a5e] transition hover:bg-[#f4e9c7] hover:text-[#1f2a24]"
                onClick={() => setSelectedGroup(null)}
                type="button"
              >
                ✕
              </button>

              <p
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{color: GROUP_COLORS[selectedGroup.group]}}
              >
                Skill Group
              </p>
              <h2 className="mt-1.5 text-xl font-black text-[#1f2a24]">{selectedGroup.group}</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedGroup.skills.map((s) => (
                  <span
                    className="rounded-full border px-3 py-1.5 text-xs font-black"
                    key={s.name}
                    style={{
                      borderColor: GROUP_COLORS[selectedGroup.group],
                      color: GROUP_COLORS[selectedGroup.group],
                      background: `${GROUP_COLORS[selectedGroup.group]}18`
                    }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>

              <div className="mt-4 space-y-2.5">
                {selectedGroup.skills.map((s) => (
                  <div className="rounded-xl border border-[#d9c58a] bg-white/70 p-4" key={s.name}>
                    <strong className="text-sm font-black" style={{color: GROUP_COLORS[selectedGroup.group]}}>
                      {s.name}
                    </strong>
                    <p className="mt-1.5 text-sm leading-6 text-[#5e6757]">{s.description}</p>
                  </div>
                ))}
              </div>

              <a
                className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#5f9f4f] bg-[#5f9f4f] py-2.5 text-sm font-black text-white transition hover:bg-[#4f8d42]"
                href="https://github.com/toadsam"
                rel="noreferrer"
                target="_blank"
              >
                GitHub에서 확인 ↗
              </a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
