"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {RICH_RENDERERS} from "./richContent";

const STEPS = [
  {id: "overview", label: "CONTROL", ko: "개요"},
  {id: "problem", label: "ALERT", ko: "문제"},
  {id: "approach", label: "PIPELINE", ko: "접근"},
  {id: "contribution", label: "MODULES", ko: "기여"},
  {id: "result", label: "STATUS", ko: "결과"},
];

// ─── 라이브 배지 ──────────────────────────────────────────────────────────────

function LiveDot({color}: {color: string}) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full"
        style={{background: color}}
        animate={{scale: [1, 2.4], opacity: [0.6, 0]}}
        transition={{duration: 1.6, repeat: Infinity, ease: "easeOut"}}
      />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{background: color}} />
    </span>
  );
}

// ─── 게이지 (원형 채워짐) ─────────────────────────────────────────────────────

function Gauge({value, label, color, delay = 0}: {value: number; label: string; color: string; delay?: number}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-[68px] w-[68px]">
        <svg viewBox="0 0 68 68" className="h-full w-full -rotate-90">
          <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <motion.circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{strokeDashoffset: c}}
            animate={{strokeDashoffset: c - (value / 100) * c}}
            transition={{duration: 1.1, delay, ease: "easeOut"}}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-black" style={{color}}>
          {value}
        </div>
      </div>
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">{label}</span>
    </div>
  );
}

// ─── 실시간 피드 ──────────────────────────────────────────────────────────────

function LiveFeed({items, theme}: {items: string[]; theme: ProjectTheme}) {
  const [visible, setVisible] = useState(1);
  useEffect(() => {
    setVisible(1);
    const iv = setInterval(() => {
      setVisible((v) => (v < items.length ? v + 1 : v));
    }, 600);
    return () => clearInterval(iv);
  }, [items]);
  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence>
        {items.slice(0, visible).map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 rounded-lg border px-4 py-2.5"
            style={{borderColor: `${theme.primary}22`, background: "rgba(255,255,255,0.02)"}}
            initial={{opacity: 0, x: -20, height: 0}}
            animate={{opacity: 1, x: 0, height: "auto"}}
            transition={{duration: 0.35}}
          >
            <LiveDot color={theme.primary} />
            <span className="font-mono text-[10px] font-bold text-white/30">
              {String(10 + i).padStart(2, "0")}:{String((i * 17) % 60).padStart(2, "0")}
            </span>
            <span className="text-sm text-white/80">{item}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── 섹션 ─────────────────────────────────────────────────────────────────────

function Section({step, project, theme}: {step: number; project: ProjectData; theme: ProjectTheme}) {
  if (step === 0) {
    return (
      <div className="flex h-full flex-col gap-5 py-2">
        <div>
          <div className="flex items-center gap-2">
            <LiveDot color={theme.primary} />
            <p className="font-mono text-xs font-black uppercase tracking-[0.3em]" style={{color: theme.primary}}>
              LIVE CONTROL ROOM
            </p>
          </div>
          <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">{project.title}</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/55">{project.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-6 rounded-xl border p-5" style={{borderColor: `${theme.primary}22`}}>
          <Gauge value={98} label="Uptime" color={theme.primary} delay={0.2} />
          <Gauge value={project.features.length * 18 > 100 ? 100 : project.features.length * 18} label="Coverage" color={theme.accent} delay={0.35} />
          <Gauge value={88} label="Realtime" color={theme.primary} delay={0.5} />
          <div className="flex-1">
            <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/35">ROLE</p>
            <p className="text-sm leading-7 text-white/75">{project.role}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.features.map((f) => (
            <span
              key={f}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs font-bold"
              style={{borderColor: `${theme.primary}35`, color: theme.accent}}
            >
              <LiveDot color={theme.primary} />
              {f}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex h-full flex-col justify-center gap-5 py-2">
        <div className="rounded-xl border-l-4 p-5" style={{borderColor: theme.primary, background: `${theme.primary}0a`}}>
          <p className="mb-2 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.2em]" style={{color: theme.primary}}>
            ⚠ ALERT · 무엇을 해결했나
          </p>
          <p className="text-base leading-8 text-white/85">{project.problem}</p>
        </div>
        <div className="rounded-xl border p-5" style={{borderColor: `${theme.primary}22`}}>
          <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/35">INSIGHT · 배운 점</p>
          <p className="text-sm leading-7 text-white/70">{project.learning}</p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex h-full flex-col justify-center gap-0 py-2">
        {project.approach.map((s, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-4 pb-5 last:pb-0"
            initial={{opacity: 0, x: -16}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: i * 0.12}}
          >
            <div className="flex flex-col items-center">
              <LiveDot color={theme.primary} />
              {i < project.approach.length - 1 ? (
                <div className="mt-1 h-full w-px flex-1" style={{background: `${theme.primary}40`}} />
              ) : null}
            </div>
            <div className="flex-1 rounded-lg border px-4 py-3" style={{borderColor: `${theme.primary}22`}}>
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em]" style={{color: theme.primary}}>
                STAGE {i + 1}
              </span>
              <p className="mt-1 text-sm leading-7 text-white/80">{s}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="flex h-full flex-col justify-center gap-5 py-2">
        <div>
          <p className="mb-3 font-mono text-xs font-black uppercase tracking-[0.25em]" style={{color: theme.primary}}>
            {">"} ACTIVE MODULES · 무엇을 만들었나
          </p>
          <LiveFeed items={project.contribution} theme={theme} />
        </div>
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
      </div>
    );
  }

  // step 4
  return (
    <div className="flex h-full flex-col justify-center gap-5 py-2">
      <div className="relative overflow-hidden rounded-xl border p-6" style={{borderColor: `${theme.primary}33`, background: `${theme.primary}0a`}}>
        <motion.div
          className="absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
          style={{background: `${theme.primary}40`}}
          animate={{scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3]}}
          transition={{duration: 3.5, repeat: Infinity}}
        />
        <p className="relative mb-2 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.2em]" style={{color: theme.primary}}>
          <LiveDot color={theme.primary} /> STATUS · 결과
        </p>
        <p className="relative text-base leading-8 text-white/90">{project.result}</p>
      </div>
      <div className="rounded-xl border p-5" style={{borderColor: `${theme.primary}22`}}>
        <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/35">NEXT · 다음 단계</p>
        <p className="text-sm leading-7 text-white/70">{project.nextStep}</p>
      </div>
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

export function RealtimeProjectViewer({project, theme, onClose}: Props) {
  const [step, setStep] = useState(0);

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
      style={{background: `radial-gradient(ellipse at 80% 0%, ${theme.primary}12, ${theme.bg} 60%)`}}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.3}}
    >
      {/* 상단 바 */}
      <div className="relative z-10 flex shrink-0 items-center justify-between border-b px-8 py-4" style={{borderColor: `${theme.primary}20`}}>
        <div className="flex items-center gap-3">
          <LiveDot color={theme.primary} />
          <span className="font-mono text-sm font-black text-white">{project.title}</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{color: theme.primary}}>
            REALTIME OPS
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

      {/* 본문 */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden px-8">
        <div className="relative flex-1 overflow-hidden py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${project.id}-${step}`}
              className="absolute inset-x-8 inset-y-6 overflow-y-auto"
              initial={{opacity: 0, y: 24}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -16}}
              transition={{duration: 0.32}}
            >
              {RICH_RENDERERS[project.id]
                ? RICH_RENDERERS[project.id]!({step, project, theme})
                : <Section step={step} project={project} theme={theme} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 네비 */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t py-4" style={{borderColor: `${theme.primary}20`}}>
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[11px] font-black uppercase tracking-[0.1em] transition"
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
