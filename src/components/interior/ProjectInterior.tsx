"use client";

import {Float, Html, OrbitControls} from "@react-three/drei";
import {Canvas, useFrame} from "@react-three/fiber";
import {motion} from "framer-motion";
import {useEffect, useRef, useState} from "react";
import type {ReactNode} from "react";
import type {Group, Mesh} from "three";
import {ProjectViewer} from "@/components/ui/ProjectViewer";
import {getProjectTheme} from "@/data/projectThemes";
import {projects} from "@/data/projects";
import type {ProjectData} from "@/types/portfolio";

interface ProjectInteriorProps {
  projectId: string;
  onBack: () => void;
}

function Floor({color, accentColor}: {color: string; accentColor: string}) {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.24} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[0.04, 12]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[12, 0.04]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[4.8, 5.0, 64]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function CenterOrb({color, label}: {color: string; label: string}) {
  const groupRef = useRef<Group | null>(null);
  const ringRef = useRef<Mesh | null>(null);

  useFrame(({clock}) => {
    const elapsed = clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.y = elapsed * 0.4;
    if (ringRef.current) ringRef.current.rotation.z = elapsed * 0.6;
  });

  return (
    <Float floatIntensity={0.4} speed={1.5} rotationIntensity={0.1}>
      <group position={[0, 1.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.15} metalness={0.8} transparent opacity={0.85} />
        </mesh>
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
        <pointLight color={color} intensity={2.5} distance={8} decay={2} />
        <Html center position={[0, 1.0, 0]} zIndexRange={[10, 0]}>
          <div
            style={{
              color,
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.2em",
              pointerEvents: "none",
              textShadow: `0 0 14px ${color}`,
              textTransform: "uppercase",
              userSelect: "none",
              whiteSpace: "nowrap"
            }}
          >
            {"</>"} {label}
          </div>
        </Html>
      </group>
    </Float>
  );
}

function HoloPanel({
  position,
  rotation = [0, 0, 0],
  width = 2.8,
  height = 1.8,
  color,
  children,
  delay = 0,
  onClick
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  color: string;
  children: ReactNode;
  delay?: number;
  onClick?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[width, height, 0.04]} />
        <meshStandardMaterial color="#020d1a" emissive={color} emissiveIntensity={0.06} roughness={0.2} metalness={0.6} transparent opacity={0.88} />
      </mesh>
      {[
        {pos: [0, height / 2, 0.022] as [number, number, number], size: [width, 0.025, 0.01] as [number, number, number]},
        {pos: [0, -height / 2, 0.022] as [number, number, number], size: [width, 0.025, 0.01] as [number, number, number]},
        {pos: [-width / 2, 0, 0.022] as [number, number, number], size: [0.025, height, 0.01] as [number, number, number]},
        {pos: [width / 2, 0, 0.022] as [number, number, number], size: [0.025, height, 0.01] as [number, number, number]}
      ].map((line, index) => (
        <mesh key={index} position={line.pos}>
          <boxGeometry args={line.size} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
      ))}
      <Html center position={[0, 0, 0.06]} style={{width: `${width * 95}px`, pointerEvents: visible ? "auto" : "none"}} transform zIndexRange={[10, 0]}>
        {visible ? (
          <motion.div animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 12}} onClick={onClick} style={{cursor: onClick ? "pointer" : "default"}} transition={{duration: 0.5}}>
            {children}
          </motion.div>
        ) : null}
      </Html>
    </group>
  );
}

function PanelTitle({project, color}: {project: ProjectData; color: string}) {
  return (
    <div style={{fontFamily: "monospace", padding: "10px 14px"}}>
      <div style={{color, fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", marginBottom: 6, textTransform: "uppercase"}}>
        {">"} Project
      </div>
      <div style={{color: "#fff", fontSize: 18, fontWeight: 900, lineHeight: 1.2, marginBottom: 8}}>
        {project.title}
      </div>
      <div style={{color: "rgba(255,255,255,0.58)", fontSize: 10, lineHeight: 1.6}}>
        {project.description}
      </div>
      <div style={{color: `${color}cc`, fontSize: 9, marginTop: 10}}>
        역할: {project.role}
      </div>
    </div>
  );
}

function ProjectScene({project, onOpenViewer}: {project: ProjectData; onOpenViewer: () => void}) {
  const theme = getProjectTheme(project.id);
  const primary = theme.primary;
  const floorColor = theme.category === "game" ? "#111827" : theme.category === "platform" ? "#14101f" : "#081423";

  return (
    <>
      <color args={[theme.bg]} attach="background" />
      <fog args={[theme.bg, 22, 50]} attach="fog" />
      <ambientLight intensity={3.8} color="#fff8f0" />
      <directionalLight color="#fffbe8" intensity={3.2} position={[8, 14, 6]} castShadow />
      <directionalLight color="#e8f4ff" intensity={1.4} position={[-6, 10, -4]} />
      <pointLight color={primary} intensity={2.0} distance={16} decay={2} position={[0, 5, 0]} />
      <hemisphereLight args={["#87ceeb", "#27354d", 1.8]} />

      <Floor color={floorColor} accentColor={primary} />
      <CenterOrb color={primary} label={project.title} />

      <HoloPanel position={[-3.2, 1.1, -2.7]} rotation={[0, 0.42, 0]} width={2.7} height={1.55} color={primary} delay={220}>
        <PanelTitle project={project} color={primary} />
      </HoloPanel>

      <HoloPanel position={[3.2, 1.1, -2.7]} rotation={[0, -0.42, 0]} width={2.7} height={1.55} color={primary} delay={360}>
        <div style={{fontFamily: "monospace", padding: "10px 14px"}}>
          <div style={{color: primary, fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", marginBottom: 8, textTransform: "uppercase"}}>
            {">"} Key Features
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: 5}}>
            {project.features.slice(0, 4).map((feature, index) => (
              <div key={feature} style={{color: "rgba(255,255,255,0.64)", fontSize: 9, lineHeight: 1.45}}>
                {index + 1}. {feature}
              </div>
            ))}
          </div>
        </div>
      </HoloPanel>

      <HoloPanel position={[0, 0.75, -3.5]} width={2.75} height={0.82} color={primary} delay={520} onClick={onOpenViewer}>
        <div style={{color: primary, cursor: "pointer", fontFamily: "monospace", fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", padding: "10px 0", textAlign: "center", textTransform: "uppercase"}}>
          프로젝트 상세 보기
        </div>
      </HoloPanel>

      <OrbitControls
        dampingFactor={0.08}
        enableDamping
        enablePan={false}
        maxDistance={10}
        maxPolarAngle={Math.PI / 1.9}
        minDistance={2.5}
        minPolarAngle={Math.PI / 6}
        rotateSpeed={0.6}
        target={[0, 1.5, 0]}
      />
    </>
  );
}

export function ProjectInterior({projectId, onBack}: ProjectInteriorProps) {
  const project = projects.find((item) => item.id === projectId);
  const theme = getProjectTheme(projectId);
  const [viewerOpen, setViewerOpen] = useState(false);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-40" style={{background: theme.bg}}>
      <motion.button
        animate={{opacity: 1, x: 0}}
        className="absolute left-5 top-5 z-50 flex items-center gap-2 rounded-lg border px-4 py-2.5 font-mono text-xs font-black uppercase tracking-[0.15em] backdrop-blur-md"
        initial={{opacity: 0, x: -16}}
        onClick={onBack}
        style={{
          borderColor: `${theme.primary}40`,
          background: "rgba(0,0,0,0.55)",
          color: theme.primary
        }}
        transition={{delay: 0.3, duration: 0.4}}
        type="button"
        whileHover={{borderColor: theme.primary, boxShadow: `0 0 16px ${theme.primary}30`}}
        whileTap={{scale: 0.97}}
      >
        마을로 돌아가기
      </motion.button>

      <motion.div
        animate={{opacity: 1, y: 0}}
        className="absolute right-5 top-5 z-50 font-mono text-xs font-black uppercase tracking-[0.2em]"
        initial={{opacity: 0, y: -10}}
        style={{color: `${theme.primary}90`}}
        transition={{delay: 0.5}}
      >
        {">"} {project.title} Interior
      </motion.div>

      <motion.div
        animate={{opacity: 1}}
        className="absolute bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg border px-3 py-2 font-mono text-[10px] font-bold backdrop-blur-md"
        initial={{opacity: 0}}
        style={{borderColor: `${theme.primary}25`, color: `${theme.primary}66`, background: "rgba(0,0,0,0.4)"}}
        transition={{delay: 1.2}}
      >
        drag to rotate / scroll to zoom / ESC closes detail
      </motion.div>

      <Canvas camera={{fov: 50, position: [0, 3.5, 8]}} dpr={[1, 1.5]} gl={{antialias: true, powerPreference: "high-performance"}}>
        <ProjectScene project={project} onOpenViewer={() => setViewerOpen(true)} />
      </Canvas>

      <ProjectViewer project={viewerOpen ? project : null} onClose={() => setViewerOpen(false)} />
    </div>
  );
}
