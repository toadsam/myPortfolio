"use client";

import {ContactShadows, Html, OrbitControls} from "@react-three/drei";
import {Canvas, useFrame} from "@react-three/fiber";
import {AnimatePresence, motion} from "framer-motion";
import {Suspense, useEffect, useRef, useState} from "react";
import {Group, MathUtils} from "three";
import {portfolioLinks} from "@/data/links";
import type {PortfolioLink} from "@/types/portfolio";

const LINK_COLORS = ["#3a6eb5", "#5f9f4f", "#b55a3a"];
const LINK_ICONS = ["✉", "⌥", "📄"];

function ClickRipple({position, color, onDone}: {position: [number, number, number]; color: string; onDone: () => void}) {
  const groupRef = useRef<Group>(null);
  const t = useRef(0);
  useFrame((_, delta) => {
    t.current += delta * 1.8;
    if (groupRef.current) groupRef.current.scale.setScalar(1 + t.current * 2.2);
    if (t.current >= 1) onDone();
  });
  return (
    <group ref={groupRef} position={[position[0], 0.03, position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.78, 40]} />
        <meshBasicMaterial color={color} transparent opacity={Math.max(0, 1 - t.current)} />
      </mesh>
    </group>
  );
}

function MailboxObject({delay, onClick}: {delay: number; onClick: () => void}) {
  const [hovered, setHovered] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const groupRef = useRef<Group>(null);
  const scaleRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setShouldShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useFrame((_, delta) => {
    const target = shouldShow ? (hovered ? 1.07 : 1) : 0;
    scaleRef.current = MathUtils.lerp(scaleRef.current, target, delta * 5.5);
    if (groupRef.current) groupRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.5]} onClick={onClick} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <mesh castShadow position={[0, 0.55, 0]}><cylinderGeometry args={[0.08, 0.1, 1.1, 10]} /><meshStandardMaterial color="#5a3820" roughness={0.65} /></mesh>
      <mesh castShadow position={[0, 1.32, 0]}><boxGeometry args={[0.9, 0.65, 0.55]} /><meshStandardMaterial color={hovered ? "#ff5a3a" : "#e06040"} emissive="#e06040" emissiveIntensity={hovered ? 0.28 : 0.08} roughness={0.45} /></mesh>
      <mesh castShadow position={[0, 1.66, 0]}><boxGeometry args={[0.92, 0.06, 0.57]} /><meshStandardMaterial color={hovered ? "#cc4020" : "#b83a28"} roughness={0.5} /></mesh>
      <mesh position={[0, 1.38, 0.285]}><boxGeometry args={[0.5, 0.06, 0.02]} /><meshStandardMaterial color="#2a1408" roughness={0.8} /></mesh>
      <mesh castShadow position={[0.5, 1.45, 0]}><cylinderGeometry args={[0.018, 0.018, 0.55, 6]} /><meshStandardMaterial color="#4a3820" roughness={0.7} /></mesh>
      <mesh castShadow position={[0.62, 1.66, 0]}><boxGeometry args={[0.22, 0.14, 0.03]} /><meshStandardMaterial color={hovered ? "#ff5a3a" : "#e06040"} roughness={0.5} /></mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.74, 36]} />
        <meshBasicMaterial color="#e06040" transparent opacity={hovered ? 0.55 : 0.15} />
      </mesh>
      <Html center distanceFactor={9} position={[0, 2.2, 0]} zIndexRange={[5, 0]}>
        <div style={{pointerEvents: "none", userSelect: "none", textAlign: "center", fontFamily: "system-ui, sans-serif"}}>
          <div style={{display: "inline-block", fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: hovered ? "#ff5a3a" : "#e06040", background: "rgba(255,248,240,0.96)", border: `1.5px solid ${hovered ? "#ff5a3a" : "#e0604070"}`, borderRadius: 8, padding: "4px 12px", whiteSpace: "nowrap", boxShadow: hovered ? "0 0 14px #e0604055" : "none"}}>
            {hovered ? "메일 보내기 →" : "우편함"}
          </div>
        </div>
      </Html>
    </group>
  );
}

function LinkSign({link, position, color, icon, delay, rotation, onRipple}: {
  link: PortfolioLink; position: [number, number, number]; color: string; icon: string; delay: number;
  rotation?: [number, number, number]; onRipple: (pos: [number, number, number], color: string) => void;
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
    scaleRef.current = MathUtils.lerp(scaleRef.current, target, delta * 5.5);
    if (groupRef.current) groupRef.current.scale.setScalar(scaleRef.current);
  });

  function handleClick() {
    onRipple([position[0], 0, position[2]], color);
    window.open(link.href, link.href.startsWith("mailto:") ? undefined : "_blank");
  }

  return (
    <group ref={groupRef} position={position} rotation={rotation} onClick={handleClick} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <mesh castShadow><boxGeometry args={[2.2, 1.4, 0.1]} /><meshStandardMaterial color={hovered ? "#ffffff" : "#f8f4ee"} emissive={color} emissiveIntensity={hovered ? 0.14 : 0.03} roughness={0.45} /></mesh>
      <mesh position={[0, 0, -0.06]}><boxGeometry args={[2.4, 1.6, 0.04]} /><meshBasicMaterial color={hovered ? color : "#d0b880"} transparent opacity={hovered ? 0.9 : 0.5} /></mesh>
      <mesh castShadow position={[0, -1.0, 0]}><cylinderGeometry args={[0.04, 0.05, 1.0, 8]} /><meshStandardMaterial color="#7a5530" roughness={0.7} /></mesh>
      <mesh position={[0, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 32]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.45 : 0.1} />
      </mesh>
      <Html center distanceFactor={9} position={[0, 0, 0.1]} zIndexRange={[5, 0]}>
        <div style={{width: 140, textAlign: "center", pointerEvents: "none", userSelect: "none", fontFamily: "system-ui, sans-serif"}}>
          <div style={{fontSize: 16, marginBottom: 4}}>{icon}</div>
          <div style={{fontSize: 11, fontWeight: 900, color, letterSpacing: "0.12em", textTransform: "uppercase"}}>{link.label}</div>
          <div style={{fontSize: 9, color: "#5e6757", marginTop: 3}}>{link.value}</div>
          {hovered ? <div style={{marginTop: 5, fontSize: 9, fontWeight: 900, color, letterSpacing: "0.1em", textTransform: "uppercase"}}>열기 ↗</div> : null}
        </div>
      </Html>
    </group>
  );
}

function PostRoom() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[16, 14]} /><meshStandardMaterial color="#f0ede5" roughness={0.7} /></mesh>
      {[-3,-1,1,3].map((x) => [-3,-1,1,3].map((z) => (
        <mesh key={`${x}-${z}`} position={[x*1.4, 0.005, z*1.4]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[1.3, 1.3]} />
          <meshBasicMaterial color={((x+z)%2===0?"#e8e0d8":"#f4f0ea") as string} transparent opacity={0.8} />
        </mesh>
      )))}
      <mesh position={[0, 1.8, -6.5]}><planeGeometry args={[16, 3.6]} /><meshStandardMaterial color="#fff5f0" roughness={0.9} /></mesh>
      <mesh position={[0, 3.2, -6.48]}><planeGeometry args={[16, 0.3]} /><meshBasicMaterial color="#e06040" transparent opacity={0.7} /></mesh>
      <mesh position={[0, 0.18, -6.48]}><planeGeometry args={[16, 0.36]} /><meshBasicMaterial color="#e06040" transparent opacity={0.7} /></mesh>
      <mesh position={[-8, 1.8, 0]} rotation={[0, Math.PI/2, 0]}><planeGeometry args={[14, 3.6]} /><meshStandardMaterial color="#fff8f5" roughness={0.9} /></mesh>
      <mesh position={[8, 1.8, 0]} rotation={[0, -Math.PI/2, 0]}><planeGeometry args={[14, 3.6]} /><meshStandardMaterial color="#fff8f5" roughness={0.9} /></mesh>
      <mesh position={[0, 1.8, 6.5]} rotation={[0, Math.PI, 0]}><planeGeometry args={[16, 3.6]} /><meshStandardMaterial color="#fff5f0" roughness={0.9} /></mesh>
      <mesh position={[0, 3.6, 0]} rotation={[Math.PI/2, 0, 0]}><planeGeometry args={[16, 14]} /><meshStandardMaterial color="#f8f5f0" roughness={1} /></mesh>
      {[-3,0,3].map((x) => (
        <group key={x}>
          <mesh position={[x, 3.55, 0]}><boxGeometry args={[0.8, 0.04, 0.8]} /><meshBasicMaterial color="#fffde8" /></mesh>
          <pointLight color="#fff8e0" decay={2} distance={9} intensity={1.8} position={[x, 3.4, 0]} />
        </group>
      ))}
      <mesh castShadow receiveShadow position={[-5, 0.48, -3]}><boxGeometry args={[3.5, 0.96, 1.2]} /><meshStandardMaterial color="#c8a870" roughness={0.55} /></mesh>
      <mesh position={[-5, 0.98, -3]}><boxGeometry args={[3.6, 0.06, 1.3]} /><meshStandardMaterial color="#d4b880" roughness={0.45} /></mesh>
    </group>
  );
}

interface Props { onBack: () => void; }

export function PostInterior({onBack}: Props) {
  const [showMailModal, setShowMailModal] = useState(false);
  const [ripples, setRipples] = useState<{id: number; pos: [number, number, number]; color: string}[]>([]);
  const rippleId = useRef(0);
  const linkPositions: [number, number, number][] = [[-4, 1.4, -6.4], [0, 1.4, -6.4], [4, 1.4, -6.4]];

  function addRipple(pos: [number, number, number], color: string) {
    const id = rippleId.current++;
    setRipples((r) => [...r, {id, pos, color}]);
  }

  const uiDelay = (n: number) => ({initial: {opacity: 0, y: n < 0 ? -10 : 10}, animate: {opacity: 1, y: 0}, transition: {duration: 0.5, delay: 0.3 + Math.abs(n) * 0.1, ease: [0.22, 1, 0.36, 1] as const}});

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
          <MailboxObject delay={300} onClick={() => setShowMailModal(true)} />
          {portfolioLinks.map((link, i) => (
            <LinkSign key={link.label} color={LINK_COLORS[i % LINK_COLORS.length] ?? "#3a6eb5"} delay={i * 150 + 450} icon={LINK_ICONS[i % LINK_ICONS.length] ?? "✉"} link={link} position={linkPositions[i] ?? [0, 1.4, -6.4]} onRipple={addRipple} />
          ))}
          {ripples.map((r) => (
            <ClickRipple key={r.id} color={r.color} position={r.pos} onDone={() => setRipples((prev) => prev.filter((x) => x.id !== r.id))} />
          ))}
          <ContactShadows blur={2.5} far={6} opacity={0.22} position={[0, 0.01, 0]} scale={18} />
          <OrbitControls enablePan={false} maxDistance={12} maxPolarAngle={Math.PI / 2.1} minDistance={3} target={[0, 1.2, -1]} />
        </Suspense>
      </Canvas>

      <motion.button {...uiDelay(-1)} className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-[#e06040]/50 bg-white/90 px-4 py-2.5 text-sm font-bold text-[#e06040] shadow-lg backdrop-blur-md transition hover:bg-[#fff5f0]" onClick={onBack} type="button" whileHover={{x: -2}} whileTap={{scale: 0.96}}>
        ← 마을로 돌아가기
      </motion.button>
      <motion.div {...uiDelay(-1)} className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl border border-[#e06040]/40 bg-white/80 px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#e06040] backdrop-blur-md" transition={{...uiDelay(-1).transition, delay: 0.4}}>우체국</motion.div>
      <motion.div {...uiDelay(1)} className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#e06040]/30 bg-white/80 px-4 py-2.5 backdrop-blur-md" transition={{...uiDelay(1).transition, delay: 0.55}}>
        <span className="text-[9px] text-[#a07060]">🖱 드래그</span>
        <span className="text-[9px] font-bold text-[#e06040]">시점 회전</span>
        <span className="mx-2 h-4 w-px bg-[#e06040]/30" />
        <span className="text-[9px] text-[#a07060]">🖱 스크롤</span>
        <span className="text-[9px] font-bold text-[#e06040]">줌</span>
        <span className="mx-2 h-4 w-px bg-[#e06040]/30" />
        <span className="text-[9px] text-[#a07060]">간판·우편함 클릭</span>
        <span className="text-[9px] font-bold text-[#e06040]">링크 열기</span>
      </motion.div>

      <AnimatePresence>
        {showMailModal ? (
          <motion.div animate={{opacity: 1}} className="fixed inset-0 z-[60] flex items-center justify-center" exit={{opacity: 0}} initial={{opacity: 0}} transition={{duration: 0.18}}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMailModal(false)} />
            <motion.div
              animate={{opacity: 1, scale: 1, y: 0}} className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-[#e06040]/50 bg-white p-7 shadow-2xl"
              exit={{opacity: 0, scale: 0.92, y: 12}} initial={{opacity: 0, scale: 0.88, y: 20}}
              onClick={(e) => e.stopPropagation()}
              transition={{type: "spring", stiffness: 400, damping: 28}}
            >
              <button className="absolute right-4 top-4 h-8 w-8 rounded-lg text-[#a07060] transition hover:bg-[#fff5f0] hover:text-[#e06040]" onClick={() => setShowMailModal(false)} type="button">✕</button>
              <motion.div animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 10}} transition={{delay: 0.06, duration: 0.35}}>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e06040]">Contact</p>
                <h2 className="mt-2 text-2xl font-black text-[#1f2a24]">연락하기</h2>
                <p className="mt-3 text-sm leading-6 text-[#5e6757]">다음 프로젝트, 인턴십, 협업 제안은 아래 링크로 연락할 수 있습니다.</p>
                <div className="mt-5 space-y-2.5">
                  {portfolioLinks.map((link, i) => (
                    <a className="flex items-center justify-between gap-4 rounded-xl border border-[#d9c58a] bg-[#fffdf6] px-4 py-3.5 text-sm font-bold text-[#1f2a24] transition hover:border-[#e06040] hover:bg-[#fff5f0]" href={link.href} key={link.label} rel="noreferrer" style={{borderLeftColor: LINK_COLORS[i % LINK_COLORS.length], borderLeftWidth: 3}} target={link.href.startsWith("mailto:") ? undefined : "_blank"}>
                      <span className="flex items-center gap-2.5"><span>{LINK_ICONS[i % LINK_ICONS.length]}</span><span>{link.label}</span></span>
                      <span className="truncate text-sm text-[#5a9857]">{link.value}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
