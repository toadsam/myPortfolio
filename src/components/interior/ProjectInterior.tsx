"use client";

import {Html, OrbitControls, Float, Environment} from "@react-three/drei";
import {Canvas, useFrame} from "@react-three/fiber";
import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useRef, useState} from "react";
import {projects} from "@/data/projects";
import {ProjectViewer} from "@/components/ui/ProjectViewer";
import type {ProjectData} from "@/types/portfolio";
import type {Group, Mesh} from "three";

interface ProjectInteriorProps {
  projectId: string;
  onBack: () => void;
}

// ─── 프로젝트별 테마 ──────────────────────────────────────────────────────────

const PROJECT_THEME: Record<string, {primary: string; secondary: string; bg: string; floorColor: string}> = {
  demotion: {
    primary: "#0099cc",
    secondary: "#0066bb",
    bg: "#c8e8f8",
    floorColor: "#ddf0fa",
  },
  mywave: {
    primary: "#009955",
    secondary: "#00bb66",
    bg: "#c8f0e0",
    floorColor: "#daf5ec",
  },
  "farm-owner": {
    primary: "#7722cc",
    secondary: "#aa44ff",
    bg: "#e8d8f8",
    floorColor: "#f0e8fc",
  },
};

const DEFAULT_THEME = {primary: "#0099cc", secondary: "#0066bb", bg: "#c8e8f8", floorColor: "#ddf0fa"};

// ─── 3D: 바닥 ────────────────────────────────────────────────────────────────

function Floor({color, accentColor}: {color: string; accentColor: string}) {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.3} />
      </mesh>
      {/* 중앙 네온 십자 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[0.04, 12]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[12, 0.04]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.35} />
      </mesh>
      {/* 바깥 링 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[4.8, 5.0, 64]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// ─── 3D: 중앙 회전 아이콘 ────────────────────────────────────────────────────

function CenterOrb({color, label}: {color: string; label: string}) {
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);

  useFrame(({clock}) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.y = t * 0.4;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.6;
  });

  return (
    <Float floatIntensity={0.4} speed={1.5} rotationIntensity={0.1}>
      <group position={[0, 1.2, 0]}>
        {/* 메인 구체 */}
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            roughness={0.15}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* 회전 링 */}
        <group ref={groupRef}>
          <mesh>
            <torusGeometry args={[0.82, 0.025, 8, 48]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        </group>
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.68, 0.018, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} />
        </mesh>
        {/* 글로우 포인트라이트 */}
        <pointLight color={color} intensity={2.5} distance={8} decay={2} />
        {/* 라벨 */}
        <Html center position={[0, 1.0, 0]} zIndexRange={[10, 0]}>
          <div style={{
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 900,
            color,
            textShadow: `0 0 14px ${color}`,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            userSelect: "none",
            pointerEvents: "none",
          }}>
            {"</>"} {label}
          </div>
        </Html>
      </group>
    </Float>
  );
}

// ─── 3D: 홀로그램 패널 ───────────────────────────────────────────────────────

function HoloPanel({
  position, rotation = [0, 0, 0], width = 2.8, height = 1.8,
  color, children, delay = 0, onClick
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  color: string;
  children: React.ReactNode;
  delay?: number;
  onClick?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <group position={position} rotation={rotation}>
      {/* 패널 배경 */}
      <mesh>
        <boxGeometry args={[width, height, 0.04]} />
        <meshStandardMaterial
          color="#020d1a"
          emissive={color}
          emissiveIntensity={0.06}
          roughness={0.2}
          metalness={0.6}
          transparent
          opacity={0.88}
        />
      </mesh>
      {/* 테두리 라인 */}
      {[
        {pos: [0, height / 2, 0.022] as [number,number,number], size: [width, 0.025, 0.01] as [number,number,number]},
        {pos: [0, -height / 2, 0.022] as [number,number,number], size: [width, 0.025, 0.01] as [number,number,number]},
        {pos: [-width / 2, 0, 0.022] as [number,number,number], size: [0.025, height, 0.01] as [number,number,number]},
        {pos: [width / 2, 0, 0.022] as [number,number,number], size: [0.025, height, 0.01] as [number,number,number]},
      ].map((line, i) => (
        <mesh key={i} position={line.pos}>
          <boxGeometry args={line.size} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* 코너 장식 */}
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy], i) => (
        <group key={i} position={[sx * width / 2, sy * height / 2, 0.025]}>
          <mesh position={[sx * 0.06, 0, 0]}>
            <boxGeometry args={[0.12, 0.025, 0.01]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh position={[0, sy * 0.06, 0]}>
            <boxGeometry args={[0.025, 0.12, 0.01]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      ))}
      {/* HTML 콘텐츠 */}
      <Html
        center
        position={[0, 0, 0.06]}
        style={{width: `${width * 95}px`, pointerEvents: visible ? "auto" : "none"}}
        zIndexRange={[10, 0]}
        transform
        occlude={false}
      >
        <AnimatePresence>
          {visible && (
            <motion.div
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0}}
              initial={{opacity: 0, y: 12}}
              transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
              onClick={onClick}
              style={{cursor: onClick ? "pointer" : "default"}}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </group>
  );
}

// ─── 패널 콘텐츠 컴포넌트들 ──────────────────────────────────────────────────

function PanelTitle({project, color}: {project: ProjectData; color: string}) {
  return (
    <div style={{fontFamily: "monospace", padding: "10px 14px"}}>
      <div style={{fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color, textTransform: "uppercase", marginBottom: 6}}>
        {">"} Project
      </div>
      <div style={{fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 8}}>
        {project.title}
      </div>
      <div style={{fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 1.6}}>
        {project.description}
      </div>
      <div style={{marginTop: 10, fontSize: 9, color: `${color}aa`}}>
        역할: {project.role}
      </div>
    </div>
  );
}

function PanelProblem({project, color}: {project: ProjectData; color: string}) {
  return (
    <div style={{fontFamily: "monospace", padding: "10px 14px"}}>
      <div style={{fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color, textTransform: "uppercase", marginBottom: 8}}>
        {">"} Problem
      </div>
      <div style={{fontSize: 9.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.7}}>
        {project.problem}
      </div>
    </div>
  );
}

function PanelApproach({project, color}: {project: ProjectData; color: string}) {
  return (
    <div style={{fontFamily: "monospace", padding: "10px 14px"}}>
      <div style={{fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color, textTransform: "uppercase", marginBottom: 8}}>
        {">"} Approach
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: 6}}>
        {project.approach.map((step, i) => (
          <motion.div
            key={i}
            animate={{opacity: 1, x: 0}}
            initial={{opacity: 0, x: -8}}
            transition={{delay: i * 0.15, duration: 0.4}}
            style={{display: "flex", gap: 6, alignItems: "flex-start"}}
          >
            <span style={{color, fontWeight: 900, flexShrink: 0}}>{i + 1}.</span>
            <span style={{fontSize: 9, color: "rgba(255,255,255,0.6)", lineHeight: 1.6}}>{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PanelTechStack({project, color}: {project: ProjectData; color: string}) {
  return (
    <div style={{fontFamily: "monospace", padding: "10px 14px"}}>
      <div style={{fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color, textTransform: "uppercase", marginBottom: 10}}>
        {">"} Tech Stack
      </div>
      <div style={{display: "flex", flexWrap: "wrap", gap: 6}}>
        {project.tech.map((tech, i) => (
          <motion.span
            key={tech}
            animate={{opacity: 1, scale: 1, y: 0}}
            initial={{opacity: 0, scale: 0.7, y: 8}}
            transition={{delay: i * 0.1, type: "spring", stiffness: 400, damping: 20}}
            style={{
              padding: "3px 9px",
              border: `1px solid ${color}55`,
              borderRadius: 20,
              fontSize: 9,
              fontWeight: 900,
              color,
              background: `${color}15`,
              letterSpacing: "0.1em",
            }}
          >
            {tech}
          </motion.span>
        ))}
      </div>
      <div style={{marginTop: 12, fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, borderTop: `1px solid ${color}22`, paddingTop: 8}}>
        {project.learning}
      </div>
    </div>
  );
}

function PanelResult({project, color, onBack}: {project: ProjectData; color: string; onBack: () => void}) {
  return (
    <div style={{fontFamily: "monospace", padding: "10px 14px"}}>
      <div style={{fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color, textTransform: "uppercase", marginBottom: 8}}>
        {">"} Result
      </div>
      <div style={{fontSize: 9.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 10}}>
        {project.result}
      </div>
      <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
        {project.links.map((link) => (
          <motion.a
            key={link.label}
            href={link.href}
            rel="noreferrer"
            target="_blank"
            whileHover={{scale: 1.06}}
            whileTap={{scale: 0.97}}
            style={{
              padding: "5px 12px",
              border: `1px solid ${color}70`,
              borderRadius: 6,
              fontSize: 9,
              fontWeight: 900,
              color: "#fff",
              background: `${color}cc`,
              textDecoration: "none",
              letterSpacing: "0.12em",
              cursor: "pointer",
            }}
          >
            ↗ {link.label}
          </motion.a>
        ))}
      </div>
    </div>
  );
}

// ─── 패널 클릭 힌트 오버레이 ─────────────────────────────────────────────────

function PanelClickHint({color}: {color: string}) {
  return (
    <div style={{
      fontFamily: "monospace",
      fontSize: 9,
      fontWeight: 900,
      letterSpacing: "0.18em",
      color: `${color}88`,
      textTransform: "uppercase",
      pointerEvents: "none",
      marginTop: 6,
      textAlign: "center",
    }}>
      ▶ 클릭하여 전체 보기
    </div>
  );
}

// ─── 3D 씬 ───────────────────────────────────────────────────────────────────

function ProjectScene({project, onOpenViewer}: {project: ProjectData; onOpenViewer: () => void}) {
  const theme = PROJECT_THEME[project.id] ?? DEFAULT_THEME;
  const {primary, floorColor} = theme;

  return (
    <>
      <color args={[theme.bg]} attach="background" />
      <fog args={[theme.bg, 22, 50]} attach="fog" />
      <ambientLight intensity={4.0} color="#fff8f0" />
      <directionalLight color="#fffbe8" intensity={3.5} position={[8, 14, 6]} castShadow />
      <directionalLight color="#e8f4ff" intensity={1.5} position={[-6, 10, -4]} />
      <pointLight color={primary} intensity={2.0} distance={16} decay={2} position={[0, 5, 0]} />
      <hemisphereLight args={["#87ceeb", "#b0e0c8", 2.0]} />

      <Environment preset="dawn" />
      <Floor color={floorColor} accentColor={primary} />
      <CenterOrb color={primary} label={project.title} />

      {/* 중앙 클릭 유도 패널 */}
      <HoloPanel position={[0, 0.6, -3.2]} width={2.6} height={0.7} color={primary} delay={400} onClick={onOpenViewer}>
        <div style={{
          fontFamily: "monospace", textAlign: "center", padding: "6px 0",
          fontSize: 11, fontWeight: 900, letterSpacing: "0.22em",
          textTransform: "uppercase", color: primary,
          cursor: "pointer",
        }}>
          ▶ 프로젝트 상세 보기
        </div>
      </HoloPanel>

      <OrbitControls
        enablePan={false}
        maxDistance={10}
        minDistance={2.5}
        maxPolarAngle={Math.PI / 1.9}
        minPolarAngle={Math.PI / 6}
        target={[0, 1.5, 0]}
        dampingFactor={0.08}
        enableDamping
        rotateSpeed={0.6}
      />
    </>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export function ProjectInterior({projectId, onBack}: ProjectInteriorProps) {
  const project = projects.find((p) => p.id === projectId);
  const theme = (projectId && PROJECT_THEME[projectId]) ? PROJECT_THEME[projectId]! : DEFAULT_THEME;
  const [viewerOpen, setViewerOpen] = useState(false);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-40" style={{background: theme.bg}}>
      {/* 뒤로가기 버튼 */}
      <motion.button
        animate={{opacity: 1, x: 0}}
        className="absolute left-5 top-5 z-50 flex items-center gap-2 rounded-xl border px-4 py-2.5 font-mono text-xs font-black uppercase tracking-[0.15em] backdrop-blur-md"
        initial={{opacity: 0, x: -16}}
        onClick={onBack}
        style={{
          borderColor: `${theme.primary}40`,
          background: "rgba(0,0,0,0.55)",
          color: theme.primary,
        }}
        transition={{delay: 0.3, duration: 0.4}}
        type="button"
        whileHover={{borderColor: theme.primary, boxShadow: `0 0 16px ${theme.primary}30`}}
        whileTap={{scale: 0.97}}
      >
        ← 도시로 돌아가기
      </motion.button>

      {/* 프로젝트 이름 우상단 */}
      <motion.div
        animate={{opacity: 1, y: 0}}
        className="absolute right-5 top-5 z-50 font-mono text-xs font-black uppercase tracking-[0.2em]"
        initial={{opacity: 0, y: -10}}
        style={{color: `${theme.primary}80`}}
        transition={{delay: 0.5}}
      >
        {">"} {project.title} _ Interior
      </motion.div>

      {/* 조작 힌트 */}
      <motion.div
        animate={{opacity: 1}}
        className="absolute bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg border px-3 py-2 font-mono text-[10px] font-bold backdrop-blur-md"
        initial={{opacity: 0}}
        style={{borderColor: `${theme.primary}25`, color: `${theme.primary}55`, background: "rgba(0,0,0,0.4)"}}
        transition={{delay: 1.2}}
      >
        drag to rotate · scroll to zoom
      </motion.div>

      <Canvas
        camera={{fov: 50, position: [0, 3.5, 8]}}
        dpr={[1, 1.5]}
        gl={{antialias: true, powerPreference: "high-performance"}}
      >
        <ProjectScene project={project} onOpenViewer={() => setViewerOpen(true)} />
      </Canvas>

      {/* 전체화면 프로젝트 뷰어 */}
      <ProjectViewer project={viewerOpen ? project : null} onClose={() => setViewerOpen(false)} />
    </div>
  );
}
