"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";

const STEPS = [
  {id: "overview", label: "OVERVIEW", ko: "개요"},
  {id: "problem", label: "MARKET BRIEF", ko: "문제"},
  {id: "approach", label: "STRATEGY", ko: "접근"},
  {id: "contribution", label: "POSITIONS", ko: "기여"},
  {id: "result", label: "PERFORMANCE", ko: "결과"},
];

// ─── 숫자 카운트업 ────────────────────────────────────────────────────────────

function CountUp({to, suffix = "", duration = 900}: {to: number; suffix?: string; duration?: number}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{val}{suffix}</>;
}

// ─── 스파크라인 (랜덤 상승 곡선) ──────────────────────────────────────────────

function Sparkline({color, seed = 1, up = true}: {color: string; seed?: number; up?: boolean}) {
  const points = Array.from({length: 24}, (_, i) => {
    const base = (i / 23) * (up ? 1 : -1);
    const noise = Math.sin(i * 1.7 + seed) * 0.18 + Math.sin(i * 0.6 + seed) * 0.12;
    return base * 0.7 + noise;
  });
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = points.map((p) => (p - min) / (max - min || 1));
  const d = norm
    .map((p, i) => `${(i / 23) * 100},${34 - p * 30}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 36" preserveAspectRatio="none" className="h-full w-full">
      <motion.polyline
        points={d}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{pathLength: 0}}
        animate={{pathLength: 1}}
        transition={{duration: 1.1, ease: "easeOut"}}
      />
    </svg>
  );
}

// ─── 라이브 티커 ──────────────────────────────────────────────────────────────

function Ticker({tech, theme}: {tech: string[]; theme: ProjectTheme}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 1600);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="flex gap-6 overflow-hidden whitespace-nowrap">
      {[...tech, ...tech].map((t, i) => {
        const up = (i + tick) % 2 === 0;
        const pct = (((i * 37 + tick * 13) % 90) / 10 + 0.4).toFixed(1);
        return (
          <span key={`${t}-${i}`} className="flex items-center gap-1.5 font-mono text-xs font-bold">
            <span className="text-white/70">{t}</span>
            <span style={{color: up ? theme.primary : "#f87171"}}>
              {up ? "▲" : "▼"} {pct}%
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ─── 패널 ─────────────────────────────────────────────────────────────────────

function Panel({
  title,
  theme,
  children,
  className = "",
  delay = 0,
}: {
  title?: string;
  theme: ProjectTheme;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`rounded-xl border bg-white/[0.02] ${className}`}
      style={{borderColor: `${theme.primary}22`}}
      initial={{opacity: 0, y: 14}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, delay}}
      whileHover={{borderColor: `${theme.primary}55`, boxShadow: `0 0 24px ${theme.primary}12`}}
    >
      {title ? (
        <div
          className="flex items-center justify-between border-b px-4 py-2.5"
          style={{borderColor: `${theme.primary}15`}}
        >
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            {title}
          </span>
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{background: theme.primary}}
            animate={{opacity: [1, 0.3, 1]}}
            transition={{duration: 1.6, repeat: Infinity}}
          />
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

// ─── 섹션 ─────────────────────────────────────────────────────────────────────

function Section({step, project, theme}: {step: number; project: ProjectData; theme: ProjectTheme}) {
  if (step === 0) {
    return (
      <div className="flex h-full flex-col gap-4 py-2">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.3em]" style={{color: theme.primary}}>
            {">"} LIVE DASHBOARD
          </p>
          <h1 className="mt-2 text-5xl font-black leading-tight text-white md:text-6xl">{project.title}</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/55">{project.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {n: project.features.length, l: "Features"},
            {n: project.tech.length, l: "Tech Stack"},
            {n: project.contribution.length, l: "Contributions"},
          ].map((kpi, i) => (
            <Panel key={kpi.l} theme={theme} delay={0.1 + i * 0.08}>
              <p className="font-mono text-4xl font-black" style={{color: theme.primary}}>
                <CountUp to={kpi.n} />
              </p>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                {kpi.l}
              </p>
              <div className="mt-2 h-7 w-full opacity-70">
                <Sparkline color={theme.accent} seed={i + 1} />
              </div>
            </Panel>
          ))}
        </div>
        <Panel title="ROLE" theme={theme} delay={0.36}>
          <p className="text-sm leading-7 text-white/75">{project.role}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.features.map((f) => (
              <span
                key={f}
                className="rounded-md border px-2.5 py-1 font-mono text-xs font-bold"
                style={{borderColor: `${theme.primary}35`, color: theme.accent}}
              >
                {f}
              </span>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex h-full flex-col justify-center gap-4 py-2">
        <Panel title="MARKET BRIEF · 무엇을 해결했나" theme={theme}>
          <p className="text-base leading-8 text-white/80">{project.problem}</p>
        </Panel>
        <Panel title="INSIGHT · 배운 점" theme={theme} delay={0.15}>
          <p className="text-sm leading-7 text-white/70">{project.learning}</p>
        </Panel>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex h-full flex-col justify-center gap-3 py-2">
        {project.approach.map((s, i) => (
          <Panel key={i} theme={theme} delay={i * 0.1}>
            <div className="flex items-center gap-4">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black"
                style={{background: `${theme.primary}1a`, color: theme.primary}}
              >
                {i + 1}
              </span>
              <p className="text-sm leading-7 text-white/80">{s}</p>
            </div>
          </Panel>
        ))}
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="flex h-full flex-col justify-center gap-4 py-2">
        <Panel title="POSITIONS · 무엇을 만들었나" theme={theme}>
          <div className="flex flex-col gap-3">
            {project.contribution.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">{item}</span>
                  <span className="font-mono text-xs font-black" style={{color: theme.primary}}>100%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className="h-full rounded-full"
                    style={{background: theme.primary}}
                    initial={{width: 0}}
                    animate={{width: "100%"}}
                    transition={{duration: 0.8, delay: 0.2 + i * 0.12, ease: "easeOut"}}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="ALLOCATION · 기술 스택" theme={theme} delay={0.2}>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-lg border px-3 py-1.5 font-mono text-sm font-bold"
                style={{borderColor: `${theme.primary}35`, color: theme.accent, background: `${theme.primary}0d`}}
              >
                {t}
              </span>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  // step 4
  return (
    <div className="flex h-full flex-col justify-center gap-4 py-2">
      <Panel title="PERFORMANCE · 결과" theme={theme}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-base leading-8 text-white/85">{project.result}</p>
          </div>
        </div>
        <div className="mt-4 h-16 w-full opacity-80">
          <Sparkline color={theme.primary} seed={5} />
        </div>
      </Panel>
      <Panel title="NEXT · 다음 단계" theme={theme} delay={0.15}>
        <p className="text-sm leading-7 text-white/70">{project.nextStep}</p>
      </Panel>
      <div className="flex flex-wrap gap-3">
        {project.links.map((link) => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-6 py-3 font-mono text-sm font-black"
            style={{background: theme.primary, color: theme.bg}}
            whileHover={{scale: 1.04, boxShadow: `0 0 24px ${theme.primary}55`}}
            whileTap={{scale: 0.97}}
          >
            {link.label} ↗
          </motion.a>
        ))}
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

interface Props {
  project: ProjectData;
  theme: ProjectTheme;
  onClose: () => void;
}

export function DashboardProjectViewer({project, theme, onClose}: Props) {
  const [step, setStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setStep(0), [project.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, STEPS.length - 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: `radial-gradient(ellipse at 20% 0%, ${theme.primary}10, ${theme.bg} 60%)`,
      }}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.3}}
    >
      {/* 그리드 배경 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: `linear-gradient(${theme.primary}0a 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}0a 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* 상단 바 + 티커 */}
      <div className="relative z-10 shrink-0 border-b" style={{borderColor: `${theme.primary}20`}}>
        <div className="flex items-center justify-between px-8 py-3.5">
          <div className="flex items-center gap-3">
            <motion.span
              className="h-2 w-2 rounded-full"
              style={{background: theme.primary}}
              animate={{opacity: [1, 0.3, 1]}}
              transition={{duration: 1.4, repeat: Infinity}}
            />
            <span className="font-mono text-sm font-black text-white">{project.title}</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{color: theme.primary}}>
              · LIVE
            </span>
          </div>
          <button
            className="rounded border px-3 py-1.5 font-mono text-xs font-black uppercase tracking-[0.15em] transition hover:bg-white/10"
            style={{borderColor: `${theme.primary}40`, color: theme.accent}}
            onClick={onClose}
            type="button"
          >
            ESC ✕
          </button>
        </div>
        <div className="border-t px-8 py-2" style={{borderColor: `${theme.primary}12`}}>
          <Ticker tech={project.tech} theme={theme} />
        </div>
      </div>

      {/* 본문 */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden px-8">
        <div ref={scrollRef} className="relative flex-1 overflow-hidden py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${project.id}-${step}`}
              className="absolute inset-x-8 inset-y-6 overflow-y-auto"
              initial={{opacity: 0, x: 30}}
              animate={{opacity: 1, x: 0}}
              exit={{opacity: 0, x: -30}}
              transition={{duration: 0.32, ease: [0.22, 1, 0.36, 1]}}
            >
              <Section step={step} project={project} theme={theme} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 하단 네비 (탭) */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t py-4" style={{borderColor: `${theme.primary}20`}}>
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                className="rounded-lg px-3 py-2 font-mono text-[11px] font-black uppercase tracking-[0.1em] transition"
                onClick={() => setStep(i)}
                style={{
                  color: i === step ? theme.bg : "rgba(255,255,255,0.3)",
                  background: i === step ? theme.primary : "transparent",
                }}
                type="button"
              >
                {s.ko}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg border px-4 py-2 font-mono text-xs font-black disabled:opacity-20"
              style={{borderColor: `${theme.primary}40`, color: theme.accent}}
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              type="button"
            >
              ◀
            </button>
            <button
              className="rounded-lg px-5 py-2 font-mono text-xs font-black disabled:opacity-20"
              style={
                step < STEPS.length - 1
                  ? {background: theme.primary, color: theme.bg}
                  : {border: `1px solid ${theme.primary}30`, color: "rgba(255,255,255,0.3)"}
              }
              disabled={step === STEPS.length - 1}
              onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
              type="button"
            >
              NEXT ▶
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
