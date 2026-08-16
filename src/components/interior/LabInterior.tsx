"use client";

import {ContactShadows, Html, OrbitControls} from "@react-three/drei";
import {Canvas, useFrame} from "@react-three/fiber";
import {motion} from "framer-motion";
import {Suspense, useEffect, useRef, useState} from "react";
import {Group, MathUtils} from "three";
import {projects} from "@/data/projects";
import type {ProjectData} from "@/types/portfolio";
import {ProjectViewer} from "@/components/ui/ProjectViewer";

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

// 클릭 시 바닥에서 퍼지는 리플 링
function ClickRipple({
  position,
  color,
  onDone
}: {
  position: [number, number, number];
  color: string;
  onDone: () => void;
}) {
  const meshRef = useRef<Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * 1.8;
    if (meshRef.current) {
      const s = 1 + t.current * 2.2;
      meshRef.current.scale.setScalar(s);
    }
    if (t.current >= 1) onDone();
  });

  return (
    <group ref={meshRef} position={[position[0], 0.03, position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.88, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={Math.max(0, 1 - (t.current ?? 0))}
        />
      </mesh>
    </group>
  );
}

function ProjectPanel({
  project,
  position,
  delay,
  onSelect
}: {
  project: ProjectData;
  position: [number, number, number];
  delay: number;
  onSelect: (p: ProjectData, pos: [number, number, number]) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const groupRef = useRef<Group>(null);
  const scaleRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setShouldShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useFrame((_, delta) => {
    const target = shouldShow ? (hovered ? 1.06 : 1) : 0;
    scaleRef.current = MathUtils.lerp(scaleRef.current, target, delta * 6);
    if (groupRef.current) groupRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={() => onSelect(project, [position[0], 0, position[2]])}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Glow border */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[2.7, 3.5, 0.02]} />
        <meshBasicMaterial
          color={hovered ? "#7ed9ff" : "#3a6eb5"}
          transparent
          opacity={hovered ? 0.85 : 0.35}
        />
      </mesh>
      {/* Panel body */}
      <mesh>
        <boxGeometry args={[2.5, 3.3, 0.1]} />
        <meshStandardMaterial
          color="#060e1e"
          emissive="#0d2244"
          emissiveIntensity={hovered ? 0.55 : 0.2}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      {/* Top strip */}
      <mesh position={[0, 1.65, 0.06]}>
        <boxGeometry args={[2.5, 0.12, 0.05]} />
        <meshBasicMaterial
          color={hovered ? "#7ed9ff" : "#3a6eb5"}
          transparent
          opacity={hovered ? 1 : 0.6}
        />
      </mesh>
      {/* Floor ring */}
      <mesh position={[0, -PANEL_Y + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.2, 40]} />
        <meshBasicMaterial
          color={hovered ? "#7ed9ff" : "#3a6eb5"}
          transparent
          opacity={hovered ? 0.55 : 0.18}
        />
      </mesh>
      {/* Content */}
      <Html
        center
        distanceFactor={9}
        position={[0, 0.1, 0.12]}
        zIndexRange={[5, 0]}
      >
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
          <div style={{fontSize: 9, color: "#7a9db5", lineHeight: 1.5}}>
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
            {project.tech.slice(0, 3).map(t => (
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
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 18]} />
        <meshStandardMaterial
          color="#0c1320"
          metalness={0.4}
          roughness={0.25}
        />
      </mesh>
      {Array.from({length: 11}, (_, i) => i - 5).map(i => (
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
      <mesh position={[0, 2.5, -8]}>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#06090f" roughness={0.95} />
      </mesh>
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5]} />
        <meshStandardMaterial color="#06090f" roughness={0.95} />
      </mesh>
      <mesh position={[10, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 5]} />
        <meshStandardMaterial color="#06090f" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.5, 8]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#06090f" roughness={0.95} />
      </mesh>
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 18]} />
        <meshStandardMaterial color="#040608" roughness={1} />
      </mesh>
      {[-3.5, 0, 3.5].map(x => (
        <group key={`strip-${x}`}>
          <mesh position={[x, 4.92, 0]}>
            <boxGeometry args={[0.18, 0.04, 14]} />
            <meshBasicMaterial color="#4a9eff" />
          </mesh>
          <pointLight
            color="#4a9eff"
            decay={2}
            distance={8}
            intensity={1.2}
            position={[x, 4.7, 0]}
          />
        </group>
      ))}
    </group>
  );
}

interface Props {
  onBack: () => void;
}

export function LabInterior({onBack}: Props) {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );
  const [ripples, setRipples] = useState<
    {id: number; pos: [number, number, number]}[]
  >([]);
  const rippleId = useRef(0);

  function handleSelect(project: ProjectData, pos: [number, number, number]) {
    setSelectedProject(project);
    const id = rippleId.current++;
    setRipples(r => [...r, {id, pos}]);
  }

  function removeRipple(id: number) {
    setRipples(r => r.filter(item => item.id !== id));
  }

  const uiDelay = (n: number) => ({
    initial: {opacity: 0, y: n < 0 ? -10 : 10},
    animate: {opacity: 1, y: 0},
    transition: {
      duration: 0.5,
      delay: 0.3 + n * 0.1,
      ease: [0.22, 1, 0.36, 1] as const
    }
  });

  return (
    <div className="fixed inset-0 z-40 bg-[#040608]">
      <Canvas
        camera={{fov: 58, position: [0, 3.5, 9.5]}}
        dpr={[1, 1.75]}
        gl={{antialias: true}}
        shadows
      >
        <color args={["#040608"]} attach="background" />
        <fog args={["#040608", 14, 26]} attach="fog" />
        <ambientLight color="#1a3a6e" intensity={0.4} />
        <pointLight
          color="#3a6eb5"
          decay={2}
          distance={15}
          intensity={2.5}
          position={[0, 4, -2]}
        />
        <pointLight
          color="#7ed9ff"
          decay={2}
          distance={10}
          intensity={1.2}
          position={[0, 4, 4]}
        />
        <directionalLight
          color="#5a9abf"
          intensity={0.4}
          position={[5, 7, 5]}
        />
        <Suspense fallback={null}>
          <LabRoom />
          {projects.map((project, index) => (
            <ProjectPanel
              key={project.id}
              delay={index * 140 + 350}
              onSelect={handleSelect}
              position={getPanelPosition(index)}
              project={project}
            />
          ))}
          {ripples.map(r => (
            <ClickRipple
              key={r.id}
              color="#7ed9ff"
              position={r.pos}
              onDone={() => removeRipple(r.id)}
            />
          ))}
          <ContactShadows
            blur={3.5}
            far={7}
            opacity={0.7}
            position={[0, 0.01, 0]}
            scale={22}
          />
          <OrbitControls
            enablePan={false}
            maxDistance={14}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={4}
            target={[0, 1.5, -1]}
          />
        </Suspense>
      </Canvas>

      {/* 뒤로가기 */}
      <motion.button
        {...uiDelay(-1)}
        className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-[#3a6eb5]/60 bg-[#060e1e]/90 px-4 py-2.5 text-sm font-bold text-[#7ed9ff] shadow-lg backdrop-blur-md transition hover:bg-[#0d1e3a]"
        onClick={onBack}
        type="button"
        whileHover={{x: -2}}
        whileTap={{scale: 0.96}}
      >
        ← 마을로 돌아가기
      </motion.button>

      {/* 타이틀 */}
      <motion.div
        {...uiDelay(-1)}
        className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl border border-[#3a6eb5]/40 bg-[#060e1e]/80 px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#7ed9ff] backdrop-blur-md"
        transition={{...uiDelay(-1).transition, delay: 0.4}}
      >
        프로젝트 연구소
      </motion.div>

      {/* 컨트롤 힌트 */}
      <motion.div
        {...uiDelay(1)}
        className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#3a6eb5]/40 bg-[#060e1e]/80 px-4 py-2.5 backdrop-blur-md"
        transition={{...uiDelay(1).transition, delay: 0.55}}
      >
        <span className="text-[9px] text-[#4a7a9a]">🖱 드래그</span>
        <span className="text-[9px] font-bold text-[#7ed9ff]">시점 회전</span>
        <span className="mx-2 h-4 w-px bg-[#3a6eb5]/30" />
        <span className="text-[9px] text-[#4a7a9a]">🖱 스크롤</span>
        <span className="text-[9px] font-bold text-[#7ed9ff]">줌</span>
        <span className="mx-2 h-4 w-px bg-[#3a6eb5]/30" />
        <span className="text-[9px] text-[#4a7a9a]">패널 클릭</span>
        <span className="text-[9px] font-bold text-[#7ed9ff]">상세보기</span>
      </motion.div>

      {/* 시네마틱 프로젝트 뷰어 */}
      <ProjectViewer
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
