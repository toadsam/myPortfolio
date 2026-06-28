"use client";

import {motion} from "framer-motion";
import {useMemo} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {ambientFor, type AmbientVariant} from "./atmosphere";

// 프로젝트 컨셉에 맞춰 5단계 내내 깔리는 살아있는 배경 + HUD 프레임.
// 콘텐츠(z-10) 뒤(z-0)에 깔리고, 가독성을 위해 모두 낮은 투명도.
export function AmbientBackground({projectId, theme}: {projectId: string; theme: ProjectTheme}) {
  const variant = ambientFor(projectId, theme);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{zIndex: 0}}>
      <Layer variant={variant} theme={theme} />
      <Vignette />
      <HudFrame theme={theme} />
    </div>
  );
}

function Vignette() {
  return <div className="absolute inset-0" style={{boxShadow: "inset 0 0 220px 40px rgba(0,0,0,0.55)"}} />;
}

// 네 모서리 HUD 코너 프레임 — "디자인된 화면" 느낌. 헤더/푸터(z-10) 뒤에 깔린다.
function HudFrame({theme}: {theme: ProjectTheme}) {
  const c = `${theme.primary}55`;
  const corner = (pos: string, b: string) => (
    <div className="absolute h-6 w-6" style={{...positionStyle(pos), borderColor: c, ...borderStyle(b)}} />
  );
  return (
    <>
      {corner("tl", "tl")}
      {corner("tr", "tr")}
      {corner("bl", "bl")}
      {corner("br", "br")}
    </>
  );
}

function positionStyle(pos: string): React.CSSProperties {
  const o = 22;
  if (pos === "tl") return {left: o, top: o};
  if (pos === "tr") return {right: o, top: o};
  if (pos === "bl") return {left: o, bottom: o};
  return {right: o, bottom: o};
}
function borderStyle(b: string): React.CSSProperties {
  if (b === "tl") return {borderLeft: "1px solid", borderTop: "1px solid"};
  if (b === "tr") return {borderRight: "1px solid", borderTop: "1px solid"};
  if (b === "bl") return {borderLeft: "1px solid", borderBottom: "1px solid"};
  return {borderRight: "1px solid", borderBottom: "1px solid"};
}

function Layer({variant, theme}: {variant: AmbientVariant; theme: ProjectTheme}) {
  if (variant === "horror") return <Horror theme={theme} />;
  if (variant === "energy") return <Energy theme={theme} />;
  if (variant === "data") return <Data theme={theme} />;
  if (variant === "arcade") return <Arcade theme={theme} />;
  return <Calm theme={theme} />;
}

function useDots(n: number, seed = 1) {
  return useMemo(
    () =>
      Array.from({length: n}, (_, i) => {
        const r = (Math.sin(i * 999 * seed) + 1) / 2;
        const r2 = (Math.cos(i * 531 * seed) + 1) / 2;
        const r3 = (Math.sin(i * 137 * seed + 3) + 1) / 2;
        return {x: r * 100, y: r2 * 100, s: 1.5 + r3 * 3, d: 4 + r * 6, delay: r2 * 4};
      }),
    [n, seed],
  );
}

// ── 공포 (게임 전용, 비게임 미사용) ──
function Horror({theme}: {theme: ProjectTheme}) {
  const dust = useDots(16);
  return (
    <>
      <div className="absolute inset-0" style={{background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.85) 100%)"}} />
      <motion.div
        className="absolute inset-0"
        style={{background: `radial-gradient(circle at 50% 45%, ${theme.primary}10, transparent 60%)`}}
        animate={{opacity: [0.15, 0.05, 0.25, 0.08, 0.18]}}
        transition={{duration: 0.5, repeat: Infinity, repeatType: "mirror", times: [0, 0.2, 0.4, 0.7, 1]}}
      />
      {dust.map((d, i) => (
        <motion.span key={i} className="absolute rounded-full" style={{left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, background: "rgba(255,255,255,0.35)"}} animate={{y: [0, -30, 0], x: [0, 12, 0], opacity: [0, 0.25, 0]}} transition={{duration: d.d + 6, delay: d.delay, repeat: Infinity, ease: "easeInOut"}} />
      ))}
    </>
  );
}

// ── 에너지: 네온 링 + 상승 입자 + 펄스 글로우 ──
function Energy({theme}: {theme: ProjectTheme}) {
  const rise = useDots(16, 2);
  return (
    <>
      <motion.div
        className="absolute inset-0"
        style={{background: `radial-gradient(circle at 50% 60%, ${theme.primary}12, transparent 55%)`}}
        animate={{opacity: [0.4, 0.8, 0.4]}}
        transition={{duration: 2.4, repeat: Infinity, ease: "easeInOut"}}
      />
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full border"
          style={{borderColor: `${theme.primary}33`, width: 200, height: 200, x: "-50%", y: "-50%"}}
          animate={{scale: [0.4, 3.2], opacity: [0.5, 0]}}
          transition={{duration: 4, delay: i * 1.3, repeat: Infinity, ease: "easeOut"}}
        />
      ))}
      {rise.map((d, i) => (
        <motion.span key={i} className="absolute rounded-full" style={{left: `${d.x}%`, bottom: -10, width: d.s, height: d.s, background: i % 2 ? theme.accent : theme.primary, opacity: 0.4}} animate={{y: [0, -440], opacity: [0, 0.5, 0]}} transition={{duration: d.d + 4, delay: d.delay, repeat: Infinity, ease: "linear"}} />
      ))}
    </>
  );
}

// ── 데이터: 흐르는 그리드 + 스캔 스윕 + 스캔라인 + 떠다니는 비트 ──
function Data({theme}: {theme: ProjectTheme}) {
  const bits = useDots(10, 5);
  return (
    <>
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${theme.primary}22 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}22 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
          opacity: 0.25,
        }}
        animate={{backgroundPositionY: ["0px", "44px"]}}
        transition={{duration: 6, repeat: Infinity, ease: "linear"}}
      />
      <motion.div
        className="absolute inset-y-0 w-1/3"
        style={{background: `linear-gradient(90deg, transparent, ${theme.primary}12, transparent)`}}
        animate={{x: ["-40%", "320%"]}}
        transition={{duration: 7, repeat: Infinity, ease: "easeInOut"}}
      />
      {/* CRT 스캔라인 */}
      <div className="absolute inset-0" style={{backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)", opacity: 0.5}} />
      {/* 떠다니는 0/1 */}
      {bits.map((b, i) => (
        <motion.span key={i} className="absolute font-mono text-[10px] font-black" style={{left: `${b.x}%`, color: `${theme.primary}55`}} animate={{y: ["110%", "-10%"], opacity: [0, 0.6, 0]}} transition={{duration: b.d + 8, delay: b.delay, repeat: Infinity, ease: "linear"}}>
          {i % 2 ? "1" : "0"}
        </motion.span>
      ))}
    </>
  );
}

// ── 아케이드 (게임 전용, 비게임 미사용) ──
function Arcade({theme}: {theme: ProjectTheme}) {
  const stars = useDots(22, 3);
  return (
    <>
      {stars.map((d, i) => (
        <motion.span key={i} className="absolute rounded-full" style={{left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, background: i % 3 ? "#fff" : theme.accent, opacity: 0.4}} animate={{opacity: [0.1, 0.6, 0.1]}} transition={{duration: d.d, delay: d.delay, repeat: Infinity, ease: "easeInOut"}} />
      ))}
      <div className="absolute inset-0" style={{backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)", opacity: 0.5}} />
    </>
  );
}

// ── 차분: 부유 블러 오브 + 미세 노이즈 ──
function Calm({theme}: {theme: ProjectTheme}) {
  return (
    <>
      <motion.div className="absolute h-80 w-80 rounded-full blur-3xl" style={{background: `${theme.primary}18`, left: "10%", top: "15%"}} animate={{x: [0, 60, 0], y: [0, 40, 0]}} transition={{duration: 18, repeat: Infinity, ease: "easeInOut"}} />
      <motion.div className="absolute h-72 w-72 rounded-full blur-3xl" style={{background: `${theme.accent}14`, right: "8%", bottom: "12%"}} animate={{x: [0, -50, 0], y: [0, -30, 0]}} transition={{duration: 22, repeat: Infinity, ease: "easeInOut"}} />
      <motion.div className="absolute h-60 w-60 rounded-full blur-3xl" style={{background: `${theme.primary}10`, left: "55%", top: "55%"}} animate={{x: [0, -40, 0], y: [0, 30, 0]}} transition={{duration: 26, repeat: Infinity, ease: "easeInOut"}} />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"}}
      />
    </>
  );
}
