"use client";

import {ContactShadows} from "@react-three/drei";
import {Html} from "@react-three/drei";
import {Canvas} from "@react-three/fiber";
import {AnimatePresence, motion} from "framer-motion";
import {Suspense, useState} from "react";
import {projects} from "@/data/projects";
import type {ProjectData} from "@/types/portfolio";
import {InteriorCharacterController} from "./InteriorCharacterController";

const COLS = 3;
const COL_GAP = 3.4;
const ROW_GAP = 4.0;
const PANEL_Y = 1.8;

function getPanelPosition(index: number): [number, number, number] {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const rowCount = Math.min(COLS, projects.length - row * COLS);
  const startX = -((rowCount - 1) / 2) * COL_GAP;
  const x = startX + col * COL_GAP;
  const z = -(row * ROW_GAP) + 1.0;
  return [x, PANEL_Y, z];
}

function ProjectPanel({
  project,
  position,
  onSelect
}: {
  project: ProjectData;
  position: [number, number, number];
  onSelect: (p: ProjectData) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      scale={hovered ? [1.06, 1.06, 1.06] : [1, 1, 1]}
      onClick={() => onSelect(project)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Glow border */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[2.7, 3.5, 0.02]} />
        <meshBasicMaterial color={hovered ? "#7ed9ff" : "#3a6eb5"} transparent opacity={hovered ? 0.85 : 0.35} />
      </mesh>
      {/* Panel body */}
      <mesh>
        <boxGeometry args={[2.5, 3.3, 0.1]} />
        <meshStandardMaterial
          color="#060e1e"
          emissive="#0d2244"
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      {/* Top accent strip */}
      <mesh position={[0, 1.65, 0.06]}>
        <boxGeometry args={[2.5, 0.12, 0.05]} />
        <meshBasicMaterial color={hovered ? "#7ed9ff" : "#3a6eb5"} transparent opacity={hovered ? 1 : 0.6} />
      </mesh>
      {/* Floor glow ring */}
      <mesh position={[0, -PANEL_Y + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.2, 40]} />
        <meshBasicMaterial color={hovered ? "#7ed9ff" : "#3a6eb5"} transparent opacity={hovered ? 0.55 : 0.18} />
      </mesh>
      {/* Html content on panel */}
      <Html center distanceFactor={9} position={[0, 0.1, 0.12]} zIndexRange={[5, 0]}>
        <div
          style={{
            pointerEvents: "none",
            userSelect: "none",
            width: 160,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: hovered ? "#7ed9ff" : "#5a9abf",
              marginBottom: 8
            }}
          >
            {project.tech[0] ?? "Project"}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.3,
              marginBottom: 8
            }}
          >
            {project.title}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#7a9db5",
              lineHeight: 1.5
            }}
          >
            {project.description.slice(0, 55)}…
          </div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: "center"
            }}
          >
            {project.tech.slice(0, 3).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#3a6eb5",
                  border: "1px solid #3a6eb5",
                  borderRadius: 4,
                  padding: "1px 5px"
                }}
              >
                {t}
              </span>
            ))}
          </div>
          {hovered ? (
            <div
              style={{
                marginTop: 12,
                fontSize: 9,
                fontWeight: 900,
                color: "#7ed9ff",
                letterSpacing: "0.12em",
                textTransform: "uppercase"
              }}
            >
              클릭해서 상세보기 →
            </div>
          ) : null}
        </div>
      </Html>
    </group>
  );
}

function LabRoom() {
  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 18]} />
        <meshStandardMaterial color="#0c1320" metalness={0.4} roughness={0.25} />
      </mesh>
      {/* Floor grid lines */}
      {Array.from({length: 11}, (_, i) => i - 5).map((i) => (
        <group key={`grid-${i}`}>
          <mesh position={[i * 1.8, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.025, 18]} />
            <meshBasicMaterial color="#1a3a6e" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, 0.005, i * 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[20, 0.025]} />
            <meshBasicMaterial color="#1a3a6e" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
      {/* Back wall */}
      <mesh position={[0, 2.5, -8]}>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#06090f" roughness={0.95} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5]} />
        <meshStandardMaterial color="#06090f" roughness={0.95} />
      </mesh>
      {/* Right wall */}
      <mesh position={[10, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5]} />
        <meshStandardMaterial color="#06090f" roughness={0.95} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, 2.5, 8]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#06090f" roughness={0.95} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 18]} />
        <meshStandardMaterial color="#040608" roughness={1} />
      </mesh>
      {/* Ceiling strip lights */}
      {[-3.5, 0, 3.5].map((x) => (
        <group key={`light-strip-${x}`}>
          <mesh position={[x, 4.92, 0]}>
            <boxGeometry args={[0.18, 0.04, 14]} />
            <meshBasicMaterial color="#4a9eff" />
          </mesh>
          <pointLight color="#4a9eff" decay={2} distance={8} intensity={1.2} position={[x, 4.7, 0]} />
        </group>
      ))}
      {/* Section sign on back wall */}
      <Html center distanceFactor={14} position={[0, 3.8, -7.9]} zIndexRange={[5, 0]}>
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
              color: "#3a6eb5"
            }}
          >
            PROJECT LAB
          </div>
        </div>
      </Html>
    </group>
  );
}

interface Props {
  onBack: () => void;
}

export function LabInterior({onBack}: Props) {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  return (
    <div className="fixed inset-0 z-40 bg-[#050810]">
      <Canvas camera={{fov: 58, position: [0, 3.5, 9.5]}} dpr={[1, 1.75]} gl={{antialias: true}} shadows>
        <color args={["#040608"]} attach="background" />
        <fog args={["#040608", 14, 26]} attach="fog" />
        <ambientLight color="#1a3a6e" intensity={0.4} />
        <pointLight color="#3a6eb5" decay={2} distance={15} intensity={2.5} position={[0, 4, -2]} />
        <pointLight color="#7ed9ff" decay={2} distance={10} intensity={1.2} position={[0, 4, 4]} />
        <directionalLight color="#5a9abf" intensity={0.4} position={[5, 7, 5]} />
        <Suspense fallback={null}>
          <LabRoom />
          {projects.map((project, index) => (
            <ProjectPanel
              key={project.id}
              onSelect={setSelectedProject}
              position={getPanelPosition(index)}
              project={project}
            />
          ))}
          <ContactShadows blur={3.5} far={7} opacity={0.7} position={[0, 0.01, 0]} scale={22} />
          <InteriorCharacterController
            bounds={{xMin: -8.5, xMax: 8.5, zMin: -6.5, zMax: 7}}
            startPosition={[0, 0, 5]}
          />
        </Suspense>
      </Canvas>

      {/* Back button */}
      <button
        className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-[#3a6eb5]/60 bg-[#060e1e]/90 px-4 py-2.5 text-sm font-bold text-[#7ed9ff] shadow-lg backdrop-blur-md transition hover:bg-[#0d1e3a]"
        onClick={onBack}
        type="button"
      >
        ← 마을로 돌아가기
      </button>

      {/* Title */}
      <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl border border-[#3a6eb5]/40 bg-[#060e1e]/80 px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#7ed9ff] backdrop-blur-md">
        프로젝트 연구소
      </div>

      {/* Controls */}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#3a6eb5]/40 bg-[#060e1e]/80 px-4 py-2.5 backdrop-blur-md">
        {[
          ["W", "앞"],
          ["A", "좌"],
          ["S", "뒤"],
          ["D", "우"]
        ].map(([key, label]) => (
          <span className="flex flex-col items-center gap-0.5" key={key}>
            <kbd className="rounded border border-[#3a6eb5]/60 bg-[#0c1320] px-2 py-0.5 text-xs font-black text-[#7ed9ff]">
              {key}
            </kbd>
            <span className="text-[9px] text-[#4a7a9a]">{label}</span>
          </span>
        ))}
        <span className="ml-2 h-4 w-px bg-[#3a6eb5]/30" />
        <span className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-bold text-[#7ed9ff]">패널 클릭</span>
          <span className="text-[9px] text-[#4a7a9a]">상세보기</span>
        </span>
      </div>

      {/* Project detail modal */}
      <AnimatePresence>
        {selectedProject ? (
          <motion.div
            animate={{opacity: 1}}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            exit={{opacity: 0}}
            initial={{opacity: 0}}
            transition={{duration: 0.2}}
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
            <motion.div
              animate={{opacity: 1, scale: 1, y: 0}}
              className="relative z-10 mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#3a6eb5] bg-[#060e1e] p-7 shadow-2xl"
              exit={{opacity: 0, scale: 0.95, y: 8}}
              initial={{opacity: 0, scale: 0.95, y: 8}}
              onClick={(e) => e.stopPropagation()}
              transition={{duration: 0.22, ease: [0.22, 1, 0.36, 1]}}
            >
              <button
                className="absolute right-4 top-4 h-8 w-8 rounded-lg text-[#5a8aaa] transition hover:bg-[#0d1e3a] hover:text-[#7ed9ff]"
                onClick={() => setSelectedProject(null)}
                type="button"
              >
                ✕
              </button>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7ed9ff]">Project</p>
              <h2 className="mt-2 text-2xl font-black text-white">{selectedProject.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#8abed8]">{selectedProject.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {selectedProject.tech.map((t) => (
                  <span
                    className="rounded-full border border-[#3a6eb5] bg-[#0c1320] px-3 py-1 text-xs font-bold text-[#7ed9ff]"
                    key={t}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-[#1a3a5c] bg-[#0c1320] p-4">
                  <h4 className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#7ed9ff]">역할</h4>
                  <p className="text-sm leading-6 text-[#8abed8]">{selectedProject.role}</p>
                </div>
                <div className="rounded-xl border border-[#1a3a5c] bg-[#0c1320] p-4">
                  <h4 className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#7ed9ff]">문제 정의</h4>
                  <p className="text-sm leading-6 text-[#8abed8]">{selectedProject.problem}</p>
                </div>
                <div className="rounded-xl border border-[#1a3a5c] bg-[#0c1320] p-4">
                  <h4 className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#7ed9ff]">접근 방식</h4>
                  <ul className="space-y-1.5">
                    {selectedProject.approach.map((a, i) => (
                      <li className="text-sm leading-6 text-[#8abed8]" key={i}>
                        <span className="mr-2 font-black text-[#3a6eb5]">·</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-[#1a3a5c] bg-[#0c1320] p-4">
                  <h4 className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#7ed9ff]">결과</h4>
                  <p className="text-sm leading-6 text-[#8abed8]">{selectedProject.result}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                {selectedProject.links.map((link) => (
                  <a
                    className="flex-1 rounded-xl border border-[#3a6eb5] py-2.5 text-center text-sm font-bold text-[#7ed9ff] transition hover:bg-[#0d1e3a]"
                    href={link.href}
                    key={link.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
