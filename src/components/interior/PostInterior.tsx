"use client";

import {ContactShadows, Html} from "@react-three/drei";
import {Canvas} from "@react-three/fiber";
import {AnimatePresence, motion} from "framer-motion";
import {Suspense, useState} from "react";
import {portfolioLinks} from "@/data/links";
import type {PortfolioLink} from "@/types/portfolio";
import {InteriorCharacterController} from "./InteriorCharacterController";

const LINK_COLORS = ["#3a6eb5", "#5f9f4f", "#b55a3a"];
const LINK_ICONS = ["✉", "⌥", "📄"];

function MailboxObject({hovered, onClick}: {hovered: boolean; onClick: () => void}) {
  const [isHovered, setIsHovered] = useState(false);
  const h = isHovered || hovered;

  return (
    <group
      position={[0, 0, -1.5]}
      onClick={onClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {/* Post */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 1.1, 10]} />
        <meshStandardMaterial color="#5a3820" roughness={0.65} />
      </mesh>
      {/* Box body */}
      <mesh castShadow position={[0, 1.32, 0]}>
        <boxGeometry args={[0.9, 0.65, 0.55]} />
        <meshStandardMaterial
          color={h ? "#ff5a3a" : "#e06040"}
          emissive="#e06040"
          emissiveIntensity={h ? 0.25 : 0.08}
          roughness={0.45}
        />
      </mesh>
      {/* Box lid */}
      <mesh castShadow position={[0, 1.66, 0]}>
        <boxGeometry args={[0.92, 0.06, 0.57]} />
        <meshStandardMaterial color={h ? "#cc4020" : "#b83a28"} roughness={0.5} />
      </mesh>
      {/* Mail slot */}
      <mesh position={[0, 1.38, 0.285]}>
        <boxGeometry args={[0.5, 0.06, 0.02]} />
        <meshStandardMaterial color="#2a1408" roughness={0.8} />
      </mesh>
      {/* Flag */}
      <mesh castShadow position={[0.5, 1.45, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.55, 6]} />
        <meshStandardMaterial color="#4a3820" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.62, 1.66, 0]}>
        <boxGeometry args={[0.22, 0.14, 0.03]} />
        <meshStandardMaterial color={h ? "#ff5a3a" : "#e06040"} roughness={0.5} />
      </mesh>
      {/* Glow ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.74, 36]} />
        <meshBasicMaterial color="#e06040" transparent opacity={h ? 0.5 : 0.15} />
      </mesh>
      {/* Label */}
      <Html center distanceFactor={9} position={[0, 2.15, 0]} zIndexRange={[5, 0]}>
        <div
          style={{
            pointerEvents: "none",
            userSelect: "none",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: h ? "#ff5a3a" : "#e06040",
              background: "rgba(255,248,240,0.95)",
              border: `1.5px solid ${h ? "#ff5a3a" : "#e0604070"}`,
              borderRadius: 8,
              padding: "4px 12px",
              whiteSpace: "nowrap",
              boxShadow: h ? "0 0 12px #e0604055" : "none"
            }}
          >
            {h ? "메일 보내기 →" : "우편함"}
          </div>
        </div>
      </Html>
    </group>
  );
}

function LinkSign({
  link,
  position,
  color,
  icon,
  rotation
}: {
  link: PortfolioLink;
  position: [number, number, number];
  color: string;
  icon: string;
  rotation?: [number, number, number];
}) {
  const [hovered, setHovered] = useState(false);

  function handleClick() {
    window.open(link.href, link.href.startsWith("mailto:") ? undefined : "_blank");
  }

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Sign board */}
      <mesh castShadow>
        <boxGeometry args={[2.2, 1.4, 0.1]} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : "#f8f4ee"}
          emissive={color}
          emissiveIntensity={hovered ? 0.12 : 0.03}
          roughness={0.45}
        />
      </mesh>
      {/* Sign border */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[2.4, 1.6, 0.04]} />
        <meshBasicMaterial color={hovered ? color : "#d0b880"} transparent opacity={hovered ? 0.9 : 0.5} />
      </mesh>
      {/* Sign post */}
      <mesh castShadow position={[0, -1.0, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 1.0, 8]} />
        <meshStandardMaterial color="#7a5530" roughness={0.7} />
      </mesh>
      {/* Floor glow */}
      <mesh position={[0, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 32]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.4 : 0.1} />
      </mesh>
      {/* Html content */}
      <Html center distanceFactor={9} position={[0, 0, 0.1]} zIndexRange={[5, 0]}>
        <div
          style={{
            width: 140,
            textAlign: "center",
            pointerEvents: "none",
            userSelect: "none",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          <div style={{fontSize: 16, marginBottom: 4}}>{icon}</div>
          <div style={{fontSize: 11, fontWeight: 900, color, letterSpacing: "0.12em", textTransform: "uppercase"}}>
            {link.label}
          </div>
          <div style={{fontSize: 9, color: "#5e6757", marginTop: 3}}>{link.value}</div>
          {hovered ? (
            <div
              style={{
                marginTop: 5,
                fontSize: 9,
                fontWeight: 900,
                color,
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              }}
            >
              열기 ↗
            </div>
          ) : null}
        </div>
      </Html>
    </group>
  );
}

function PostRoom() {
  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color="#f0ede5" roughness={0.7} />
      </mesh>
      {/* Floor tiles */}
      {[-3, -1, 1, 3].map((x) =>
        [-3, -1, 1, 3].map((z) => (
          <mesh key={`tile-${x}-${z}`} position={[x * 1.4, 0.005, z * 1.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.3, 1.3]} />
            <meshBasicMaterial color={((x + z) % 2 === 0 ? "#e8e0d8" : "#f4f0ea") as string} transparent opacity={0.8} />
          </mesh>
        ))
      )}
      {/* Walls */}
      <mesh position={[0, 1.8, -6.5]}>
        <planeGeometry args={[16, 3.6]} />
        <meshStandardMaterial color="#fff5f0" roughness={0.9} />
      </mesh>
      {/* Red accent stripe on back wall */}
      <mesh position={[0, 3.2, -6.48]}>
        <planeGeometry args={[16, 0.3]} />
        <meshBasicMaterial color="#e06040" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.18, -6.48]}>
        <planeGeometry args={[16, 0.36]} />
        <meshBasicMaterial color="#e06040" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-8, 1.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 3.6]} />
        <meshStandardMaterial color="#fff8f5" roughness={0.9} />
      </mesh>
      <mesh position={[8, 1.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 3.6]} />
        <meshStandardMaterial color="#fff8f5" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.8, 6.5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[16, 3.6]} />
        <meshStandardMaterial color="#fff5f0" roughness={0.9} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 3.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color="#f8f5f0" roughness={1} />
      </mesh>
      {/* Ceiling lights */}
      {[-3, 0, 3].map((x) => (
        <group key={`clight-${x}`}>
          <mesh position={[x, 3.55, 0]}>
            <boxGeometry args={[0.8, 0.04, 0.8]} />
            <meshBasicMaterial color="#fffde8" />
          </mesh>
          <pointLight color="#fff8e0" decay={2} distance={9} intensity={1.8} position={[x, 3.4, 0]} />
        </group>
      ))}
      {/* Counter / desk */}
      <mesh castShadow receiveShadow position={[-5, 0.48, -3]}>
        <boxGeometry args={[3.5, 0.96, 1.2]} />
        <meshStandardMaterial color="#c8a870" roughness={0.55} />
      </mesh>
      <mesh position={[-5, 0.98, -3]}>
        <boxGeometry args={[3.6, 0.06, 1.3]} />
        <meshStandardMaterial color="#d4b880" roughness={0.45} />
      </mesh>
      {/* POST sign */}
      <Html center distanceFactor={14} position={[0, 3.1, -6.4]} zIndexRange={[5, 0]}>
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
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#e06040"
            }}
          >
            POST OFFICE · 우체국
          </div>
        </div>
      </Html>
    </group>
  );
}

interface Props {
  onBack: () => void;
}

export function PostInterior({onBack}: Props) {
  const [showMailModal, setShowMailModal] = useState(false);

  const linkPositions: [number, number, number][] = [
    [-4, 1.4, -6.4],
    [0, 1.4, -6.4],
    [4, 1.4, -6.4]
  ];

  return (
    <div className="fixed inset-0 z-40 bg-[#f8f5f0]">
      <Canvas camera={{fov: 58, position: [0, 3.5, 9]}} dpr={[1, 1.75]} gl={{antialias: true}} shadows>
        <color args={["#f8f5f0"]} attach="background" />
        <fog args={["#f8f5f0", 12, 22]} attach="fog" />
        <ambientLight intensity={1.3} />
        <hemisphereLight args={["#ffffff", "#f0e8d8", 0.9]} />
        <directionalLight castShadow intensity={0.9} position={[4, 8, 4]} shadow-mapSize={[1024, 1024]} />
        <Suspense fallback={null}>
          <PostRoom />
          <MailboxObject hovered={showMailModal} onClick={() => setShowMailModal(true)} />
          {portfolioLinks.map((link, i) => (
            <LinkSign
              color={LINK_COLORS[i % LINK_COLORS.length] ?? "#3a6eb5"}
              icon={LINK_ICONS[i % LINK_ICONS.length] ?? "✉"}
              key={link.label}
              link={link}
              position={linkPositions[i] ?? [0, 1.4, -6.4]}
            />
          ))}
          <ContactShadows blur={2.5} far={6} opacity={0.22} position={[0, 0.01, 0]} scale={18} />
          <InteriorCharacterController
            bounds={{xMin: -6.5, xMax: 6.5, zMin: -5, zMax: 6}}
            startPosition={[0, 0, 4.5]}
          />
        </Suspense>
      </Canvas>

      <button
        className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-[#e06040]/50 bg-white/90 px-4 py-2.5 text-sm font-bold text-[#e06040] shadow-lg backdrop-blur-md transition hover:bg-[#fff5f0]"
        onClick={onBack}
        type="button"
      >
        ← 마을로 돌아가기
      </button>

      <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl border border-[#e06040]/40 bg-white/80 px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#e06040] backdrop-blur-md">
        우체국
      </div>

      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#e06040]/30 bg-white/80 px-4 py-2.5 backdrop-blur-md">
        {[
          ["W", "앞"],
          ["A", "좌"],
          ["S", "뒤"],
          ["D", "우"]
        ].map(([key, label]) => (
          <span className="flex flex-col items-center gap-0.5" key={key}>
            <kbd className="rounded border border-[#e06040]/50 bg-[#fff5f0] px-2 py-0.5 text-xs font-black text-[#e06040]">
              {key}
            </kbd>
            <span className="text-[9px] text-[#a07060]">{label}</span>
          </span>
        ))}
        <span className="ml-2 h-4 w-px bg-[#e06040]/30" />
        <span className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-bold text-[#e06040]">간판 클릭</span>
          <span className="text-[9px] text-[#a07060]">링크 열기</span>
        </span>
      </div>

      {/* Mail modal */}
      <AnimatePresence>
        {showMailModal ? (
          <motion.div
            animate={{opacity: 1}}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            exit={{opacity: 0}}
            initial={{opacity: 0}}
            transition={{duration: 0.18}}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowMailModal(false)}
            />
            <motion.div
              animate={{opacity: 1, scale: 1, y: 0}}
              className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-[#e06040]/50 bg-white p-7 shadow-2xl"
              exit={{opacity: 0, scale: 0.95, y: 8}}
              initial={{opacity: 0, scale: 0.95, y: 8}}
              onClick={(e) => e.stopPropagation()}
              transition={{duration: 0.22, ease: [0.22, 1, 0.36, 1]}}
            >
              <button
                className="absolute right-4 top-4 h-8 w-8 rounded-lg text-[#a07060] transition hover:bg-[#fff5f0] hover:text-[#e06040]"
                onClick={() => setShowMailModal(false)}
                type="button"
              >
                ✕
              </button>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e06040]">Contact</p>
              <h2 className="mt-2 text-2xl font-black text-[#1f2a24]">연락하기</h2>
              <p className="mt-3 text-sm leading-6 text-[#5e6757]">
                다음 프로젝트, 인턴십, 협업 제안은 아래 링크로 연락할 수 있습니다.
              </p>
              <div className="mt-5 space-y-2.5">
                {portfolioLinks.map((link, i) => (
                  <a
                    className="flex items-center justify-between gap-4 rounded-xl border border-[#d9c58a] bg-[#fffdf6] px-4 py-3.5 text-sm font-bold text-[#1f2a24] transition hover:border-[#e06040] hover:bg-[#fff5f0]"
                    href={link.href}
                    key={link.label}
                    rel="noreferrer"
                    style={{borderLeftColor: LINK_COLORS[i % LINK_COLORS.length], borderLeftWidth: 3}}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  >
                    <span className="flex items-center gap-2.5">
                      <span>{LINK_ICONS[i % LINK_ICONS.length]}</span>
                      <span>{link.label}</span>
                    </span>
                    <span className="truncate text-sm text-[#5a9857]">{link.value}</span>
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
