"use client";

import {AnimatePresence, motion, useMotionValue, useSpring} from "framer-motion";
import {useEffect, useRef, useState} from "react";
import type {ProjectData} from "@/types/portfolio";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const STEPS = [
  {id: "overview",     label: "개요",      icon: "◈"},
  {id: "problem",      label: "문제 정의", icon: "⬡"},
  {id: "approach",     label: "접근 방식", icon: "◎"},
  {id: "contribution", label: "기여",      icon: "⬢"},
  {id: "result",       label: "결과",      icon: "◆"},
];

const STEP_ACCENT = ["#7ed9ff", "#ff9a6c", "#a78bfa", "#34d399", "#fbbf24"];

// ─── 타이핑 텍스트 ────────────────────────────────────────────────────────────

function TypedText({text, delay = 0, className = "", style = {}}: {
  text: string; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, 38);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return <span className={className} style={style}>{displayed}<span className="animate-pulse">_</span></span>;
}

// ─── SVG 체크 애니메이션 ───────────────────────────────────────────────────

function AnimatedCheck({color, delay}: {color: string; delay: number}) {
  return (
    <motion.svg
      width="18" height="18" viewBox="0 0 18 18" fill="none"
      style={{flexShrink: 0, marginTop: 2}}
    >
      <circle cx="9" cy="9" r="8.5" stroke={color} strokeOpacity="0.3" />
      <motion.path
        d="M5 9.5l3 3 5-5.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{pathLength: 0, opacity: 0}}
        animate={{pathLength: 1, opacity: 1}}
        transition={{delay, duration: 0.45, ease: "easeOut"}}
      />
    </motion.svg>
  );
}

// ─── 파티클 배경 ──────────────────────────────────────────────────────────────

function Particles({color}: {color: string}) {
  const dots = Array.from({length: 18}, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    dur: 4 + Math.random() * 5,
    delay: Math.random() * 3,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`, top: `${d.y}%`,
            width: d.size, height: d.size,
            background: color, opacity: 0.12,
          }}
          animate={{y: [-8, 8, -8], opacity: [0.06, 0.22, 0.06]}}
          transition={{duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut"}}
        />
      ))}
      {/* 우상단 글로우 */}
      <div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
        style={{background: `${color}18`}}
      />
      <div
        className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl"
        style={{background: `${color}10`}}
      />
    </div>
  );
}

// ─── 섹션: 개요 ───────────────────────────────────────────────────────────────

function SectionOverview({project, color}: {project: ProjectData; color: string}) {
  return (
    <div className="flex h-full flex-col justify-center gap-7 py-4">
      <div>
        <motion.p
          className="font-mono text-xs font-black uppercase tracking-[0.3em]"
          style={{color}}
          animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 12}}
          transition={{duration: 0.4, delay: 0.05}}
        >
          {">"} Project Overview
        </motion.p>
        <h2 className="mt-3 font-mono text-5xl font-black leading-tight text-white md:text-6xl">
          <TypedText text={project.title} delay={150} />
        </h2>
        <motion.p
          className="mt-4 text-lg leading-8 text-white/60"
          animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 10}}
          transition={{duration: 0.45, delay: 0.6}}
        >
          {project.description}
        </motion.p>
      </div>

      {/* 역할 카드 */}
      <motion.div
        className="rounded-2xl border bg-white/[0.04] p-5"
        style={{borderColor: `${color}30`}}
        animate={{opacity: 1, x: 0}} initial={{opacity: 0, x: -20}}
        transition={{duration: 0.45, delay: 0.8}}
        whileHover={{borderColor: `${color}60`, boxShadow: `0 0 24px ${color}14`}}
      >
        <p className="mb-2 font-mono text-xs font-black uppercase tracking-[0.2em] text-white/30">담당 역할</p>
        <p className="text-base leading-7 text-white/80">{project.role}</p>
      </motion.div>

      {/* 핵심 기능 뱃지 */}
      <div>
        <motion.p
          className="mb-3 font-mono text-xs font-black uppercase tracking-[0.2em] text-white/30"
          animate={{opacity: 1}} initial={{opacity: 0}} transition={{delay: 0.9}}
        >
          핵심 기능
        </motion.p>
        <div className="flex flex-wrap gap-2">
          {project.features.map((f, i) => (
            <motion.span
              key={f}
              className="rounded-full border px-3.5 py-1.5 font-mono text-sm font-black"
              style={{borderColor: `${color}45`, color, background: `${color}12`}}
              animate={{opacity: 1, scale: 1, y: 0}}
              initial={{opacity: 0, scale: 0.75, y: 10}}
              transition={{type: "spring", stiffness: 380, damping: 22, delay: 0.95 + i * 0.07}}
              whileHover={{scale: 1.07, boxShadow: `0 0 12px ${color}35`}}
            >
              {f}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 섹션: 문제 정의 ──────────────────────────────────────────────────────────

function SectionProblem({project, color}: {project: ProjectData; color: string}) {
  const lines = project.problem.match(/.{1,42}(\s|$)/g) ?? [project.problem];
  return (
    <div className="flex h-full flex-col justify-center gap-8 py-4">
      <div>
        <motion.p
          className="font-mono text-xs font-black uppercase tracking-[0.3em]"
          style={{color}}
          animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 12}}
          transition={{duration: 0.4, delay: 0.05}}
        >
          {">"} Problem Statement
        </motion.p>
        <motion.h3
          className="mt-3 text-3xl font-black text-white"
          animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 10}}
          transition={{duration: 0.4, delay: 0.12}}
        >
          어떤 문제를 해결했나요?
        </motion.h3>
      </div>

      {/* 인용 블록 */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border bg-white/[0.04] p-8"
        style={{borderColor: `${color}30`}}
        animate={{opacity: 1, scale: 1}} initial={{opacity: 0, scale: 0.96}}
        transition={{duration: 0.5, delay: 0.18}}
      >
        <motion.span
          className="absolute -left-1 -top-2 select-none text-7xl font-black opacity-15"
          style={{color}}
          animate={{opacity: 0.15, rotate: 0}} initial={{opacity: 0, rotate: -15}}
          transition={{duration: 0.5, delay: 0.3}}
        >"</motion.span>

        <div className="relative z-10 space-y-1">
          {lines.map((line, i) => (
            <motion.span
              key={i}
              className="block text-lg leading-8 text-white/85"
              animate={{opacity: 1, x: 0}} initial={{opacity: 0, x: -14}}
              transition={{duration: 0.4, delay: 0.28 + i * 0.09}}
            >
              {line}
            </motion.span>
          ))}
        </div>

        <motion.span
          className="absolute -bottom-5 -right-1 select-none rotate-180 text-7xl font-black opacity-15"
          style={{color}}
          animate={{opacity: 0.15}} initial={{opacity: 0}}
          transition={{duration: 0.5, delay: 0.55}}
        >"</motion.span>
      </motion.div>

      {/* 배운 점 */}
      <motion.div
        className="flex items-start gap-4 rounded-2xl border bg-white/[0.04] p-5"
        style={{borderColor: `${color}22`, borderLeft: `3px solid ${color}`}}
        animate={{opacity: 1, x: 0}} initial={{opacity: 0, x: -16}}
        transition={{duration: 0.45, delay: 0.65}}
        whileHover={{x: 4}}
      >
        <span className="mt-0.5 font-mono text-lg" style={{color}}>💡</span>
        <div>
          <p className="mb-1 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/30">배운 점</p>
          <p className="text-base leading-7 text-white/75">{project.learning}</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── 섹션: 접근 방식 (타임라인) ──────────────────────────────────────────────

function SectionApproach({project, color}: {project: ProjectData; color: string}) {
  return (
    <div className="flex h-full flex-col justify-center gap-6 py-4">
      <div>
        <motion.p
          className="font-mono text-xs font-black uppercase tracking-[0.3em]"
          style={{color}}
          animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 12}}
          transition={{duration: 0.4, delay: 0.05}}
        >
          {">"} Approach
        </motion.p>
        <motion.h3
          className="mt-3 text-3xl font-black text-white"
          animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 10}}
          transition={{duration: 0.4, delay: 0.12}}
        >
          어떻게 접근했나요?
        </motion.h3>
      </div>

      {/* 타임라인 */}
      <div className="relative ml-4 flex flex-col gap-0">
        {/* 세로 라인 */}
        <motion.div
          className="absolute left-3.5 top-4 w-0.5 rounded-full"
          style={{background: `linear-gradient(to bottom, ${color}, ${color}22)`, originY: 0}}
          animate={{scaleY: 1, height: `calc(100% - 32px)`}}
          initial={{scaleY: 0, height: 0}}
          transition={{duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1]}}
        />

        {project.approach.map((step, i) => (
          <motion.div
            key={i}
            className="relative flex items-start gap-6 pb-6"
            animate={{opacity: 1, x: 0}} initial={{opacity: 0, x: -24}}
            transition={{duration: 0.45, delay: 0.25 + i * 0.12}}
          >
            {/* 노드 */}
            <motion.div
              className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-black"
              style={{borderColor: color, background: "#060e1a", color}}
              animate={{scale: 1}} initial={{scale: 0}}
              transition={{type: "spring", stiffness: 400, damping: 18, delay: 0.3 + i * 0.12}}
            >
              {i + 1}
            </motion.div>

            {/* 카드 */}
            <motion.div
              className="flex-1 rounded-2xl border bg-white/[0.04] p-5"
              style={{borderColor: `${color}22`}}
              whileHover={{borderColor: `${color}55`, x: 4, boxShadow: `0 0 20px ${color}12`}}
              transition={{duration: 0.2}}
            >
              <p className="text-base leading-7 text-white/80">{step}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── 섹션: 기여 (체크리스트) ────────────────────────────────────────────────

function SectionContribution({project, color}: {project: ProjectData; color: string}) {
  const techColors = [color, "#a78bfa", "#34d399", "#fb923c", "#f472b6", "#60a5fa"];
  return (
    <div className="flex h-full flex-col justify-center gap-7 py-4">
      <div>
        <motion.p
          className="font-mono text-xs font-black uppercase tracking-[0.3em]"
          style={{color}}
          animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 12}}
          transition={{duration: 0.4, delay: 0.05}}
        >
          {">"} My Contribution
        </motion.p>
        <motion.h3
          className="mt-3 text-3xl font-black text-white"
          animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 10}}
          transition={{duration: 0.4, delay: 0.12}}
        >
          무엇을 만들었나요?
        </motion.h3>
      </div>

      {/* 체크리스트 */}
      <div className="flex flex-col gap-3">
        {project.contribution.map((item, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-4 rounded-2xl border bg-white/[0.04] p-4"
            style={{borderColor: `${color}22`}}
            animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 16}}
            transition={{duration: 0.4, delay: 0.18 + i * 0.1}}
            whileHover={{borderColor: `${color}50`, x: 5, boxShadow: `0 0 18px ${color}10`}}
          >
            <AnimatedCheck color={color} delay={0.35 + i * 0.1} />
            <p className="text-base leading-7 text-white/80">{item}</p>
          </motion.div>
        ))}
      </div>

      {/* 기술 스택 그리드 */}
      <div>
        <motion.p
          className="mb-3 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/30"
          animate={{opacity: 1}} initial={{opacity: 0}} transition={{delay: 0.7}}
        >
          Tech Used
        </motion.p>
        <div className="flex flex-wrap gap-2">
          {project.tech.map((t, i) => (
            <motion.div
              key={t}
              className="flex items-center gap-2 rounded-xl border bg-white/[0.04] px-4 py-2"
              style={{borderColor: `${techColors[i % techColors.length]}35`}}
              animate={{opacity: 1, scale: 1}} initial={{opacity: 0, scale: 0.8}}
              transition={{type: "spring", stiffness: 360, damping: 20, delay: 0.72 + i * 0.08}}
              whileHover={{scale: 1.06}}
            >
              <div className="h-2 w-2 rounded-full" style={{background: techColors[i % techColors.length]}} />
              <span className="font-mono text-sm font-black" style={{color: techColors[i % techColors.length]}}>{t}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 섹션: 결과 ───────────────────────────────────────────────────────────────

function RippleButton({href, label, color, primary}: {href: string; label: string; color: string; primary?: boolean}) {
  const [ripples, setRipples] = useState<{id: number; x: number; y: number}[]>([]);
  const ref = useRef<HTMLAnchorElement>(null);

  function handleClick(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, {id, x: e.clientX - rect.left, y: e.clientY - rect.top}]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      rel="noreferrer"
      target="_blank"
      className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl py-4 font-mono text-sm font-black transition"
      style={primary
        ? {background: color, color: "#040608", boxShadow: `0 0 24px ${color}55`}
        : {border: `1px solid ${color}50`, color, background: `${color}10`}
      }
      onClick={handleClick}
      whileHover={{scale: 1.03, filter: "brightness(1.1)"}}
      whileTap={{scale: 0.97}}
    >
      {ripples.map((rp) => (
        <motion.span
          key={rp.id}
          className="pointer-events-none absolute rounded-full"
          style={{left: rp.x, top: rp.y, background: "rgba(255,255,255,0.3)"}}
          animate={{width: 220, height: 220, x: -110, y: -110, opacity: 0}}
          initial={{width: 0, height: 0, x: 0, y: 0, opacity: 0.6}}
          transition={{duration: 0.65, ease: "easeOut"}}
        />
      ))}
      {label} ↗
    </motion.a>
  );
}

function SectionResult({project, color}: {project: ProjectData; color: string}) {
  return (
    <div className="flex h-full flex-col justify-center gap-7 py-4">
      <div>
        <motion.p
          className="font-mono text-xs font-black uppercase tracking-[0.3em]"
          style={{color}}
          animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 12}}
          transition={{duration: 0.4, delay: 0.05}}
        >
          {">"} Result
        </motion.p>
        <motion.h3
          className="mt-3 text-3xl font-black text-white"
          animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 10}}
          transition={{duration: 0.4, delay: 0.12}}
        >
          어떤 결과를 얻었나요?
        </motion.h3>
      </div>

      {/* 결과 글로우 카드 */}
      <motion.div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{background: `linear-gradient(135deg, ${color}1a 0%, ${color}06 100%)`, border: `1px solid ${color}40`}}
        animate={{opacity: 1, scale: 1}} initial={{opacity: 0, scale: 0.95}}
        transition={{duration: 0.5, delay: 0.2}}
      >
        <motion.div
          className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl"
          style={{background: `${color}30`}}
          animate={{scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3]}}
          transition={{duration: 4, repeat: Infinity, ease: "easeInOut"}}
        />
        <p className="relative z-10 text-lg leading-8 text-white/90">{project.result}</p>
      </motion.div>

      {/* 다음 단계 */}
      <motion.div
        className="flex items-start gap-4 rounded-2xl border bg-white/[0.04] p-5"
        style={{borderColor: `${color}22`, borderLeft: `3px solid ${color}66`}}
        animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 14}}
        transition={{duration: 0.45, delay: 0.35}}
        whileHover={{x: 4}}
      >
        <span className="mt-0.5 text-lg">🚀</span>
        <div>
          <p className="mb-1 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/30">다음 단계</p>
          <p className="text-base leading-7 text-white/70">{project.nextStep}</p>
        </div>
      </motion.div>

      {/* 링크 버튼 (ripple) */}
      <motion.div
        className="flex gap-3"
        animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 14}}
        transition={{duration: 0.45, delay: 0.5}}
      >
        {project.links.map((link, i) => (
          <RippleButton key={link.label} href={link.href} label={link.label} color={color} primary={i === 0} />
        ))}
      </motion.div>
    </div>
  );
}

// ─── 진행바 ──────────────────────────────────────────────────────────────────

function ProgressBar({current, total, color}: {current: number; total: number; color: string}) {
  return (
    <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{background: `linear-gradient(to right, ${color}88, ${color})`}}
        animate={{width: `${((current + 1) / total) * 100}%`}}
        transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
      />
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

interface Props {
  project: ProjectData | null;
  onClose: () => void;
}

export function ProjectViewer({project, onClose}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const color = STEP_ACCENT[currentStep] ?? "#7ed9ff";

  useEffect(() => { setCurrentStep(0); }, [project?.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!project) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, currentStep]);

  function goTo(i: number) {
    setDirection(i > currentStep ? 1 : -1);
    setCurrentStep(i);
  }
  function goNext() { if (currentStep < STEPS.length - 1) goTo(currentStep + 1); }
  function goPrev() { if (currentStep > 0) goTo(currentStep - 1); }

  const variants = {
    enter: (d: number) => ({opacity: 0, x: d > 0 ? 80 : -80, filter: "blur(4px)"}),
    center: {opacity: 1, x: 0, filter: "blur(0px)"},
    exit: (d: number) => ({opacity: 0, x: d > 0 ? -80 : 80, filter: "blur(4px)"}),
  };

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          animate={{opacity: 1}}
          className="fixed inset-0 z-[60] flex"
          exit={{opacity: 0}}
          initial={{opacity: 0}}
          transition={{duration: 0.25}}
        >
          {/* 배경 */}
          <div
            className="absolute inset-0"
            style={{background: "radial-gradient(ellipse at 25% 35%, #0d1e3a 0%, #040608 65%)"}}
          />
          <Particles color={color} />
          <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />

          <div className="relative z-10 flex h-full w-full">
            {/* ── 왼쪽 사이드바 ── */}
            <motion.aside
              animate={{opacity: 1, x: 0}}
              className="flex h-full w-64 shrink-0 flex-col border-r border-white/8 bg-black/30 p-7 backdrop-blur-md"
              exit={{opacity: 0, x: -20}}
              initial={{opacity: 0, x: -20}}
              onClick={(e) => e.stopPropagation()}
              transition={{duration: 0.4, ease: [0.22, 1, 0.36, 1]}}
            >
              <motion.button
                className="mb-7 flex items-center gap-2 self-start font-mono text-xs font-black uppercase tracking-[0.18em] text-white/35 transition hover:text-white/75"
                onClick={onClose} type="button" whileHover={{x: -3}}
              >
                ← 닫기
              </motion.button>

              <div className="mb-6">
                <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.22em]" style={{color}}>
                  {">"} Project
                </p>
                <h1 className="text-xl font-black leading-tight text-white">{project.title}</h1>
                <p className="mt-2 text-xs leading-5 text-white/45">{project.description}</p>
              </div>

              <div className="mb-6">
                <p className="mb-2.5 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/25">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t, i) => (
                    <span
                      key={t}
                      className="rounded-full border px-2 py-0.5 font-mono text-[10px] font-black"
                      style={{
                        borderColor: `${STEP_ACCENT[i % STEP_ACCENT.length]}40`,
                        color: STEP_ACCENT[i % STEP_ACCENT.length],
                        background: `${STEP_ACCENT[i % STEP_ACCENT.length]}12`
                      }}
                    >{t}</span>
                  ))}
                </div>
              </div>

              <nav className="mb-6 flex flex-1 flex-col gap-1">
                <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/25">Navigation</p>
                {STEPS.map((step, i) => {
                  const isActive = i === currentStep;
                  const isDone = i < currentStep;
                  return (
                    <motion.button
                      key={step.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left font-mono text-xs font-bold transition-all"
                      onClick={() => goTo(i)}
                      style={{
                        background: isActive ? `${STEP_ACCENT[i]}15` : "transparent",
                        color: isActive ? STEP_ACCENT[i] : isDone ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
                        borderLeft: isActive ? `2px solid ${STEP_ACCENT[i]}` : "2px solid transparent",
                      }}
                      type="button"
                      whileHover={{x: 3}}
                    >
                      <span className="w-4 shrink-0 text-center text-xs">{isDone ? "✓" : step.icon}</span>
                      {step.label}
                    </motion.button>
                  );
                })}
              </nav>

              <div className="flex flex-col gap-2">
                {project.links.map((link, i) => (
                  <RippleButton key={link.label} href={link.href} label={link.label} color={color} primary={i === 0} />
                ))}
              </div>
            </motion.aside>

            {/* ── 메인 콘텐츠 ── */}
            <motion.main
              animate={{opacity: 1}}
              className="relative flex flex-1 flex-col overflow-hidden"
              exit={{opacity: 0}}
              initial={{opacity: 0}}
              onClick={(e) => e.stopPropagation()}
              transition={{duration: 0.4, delay: 0.08}}
            >
              {/* 상단 진행바 + 스텝 탭 */}
              <div className="shrink-0 border-b border-white/8">
                <div className="px-10 pt-5">
                  <ProgressBar color={color} current={currentStep} total={STEPS.length} />
                </div>
                <div className="flex gap-0">
                  {STEPS.map((step, i) => (
                    <button
                      key={step.id}
                      className="flex flex-1 items-center justify-center gap-2 py-3.5 font-mono text-xs font-black uppercase tracking-[0.14em] transition-all"
                      onClick={() => goTo(i)}
                      style={{
                        color: i === currentStep ? STEP_ACCENT[i] : "rgba(255,255,255,0.18)",
                        borderBottom: i === currentStep ? `2px solid ${STEP_ACCENT[i]}` : "2px solid transparent",
                        background: i === currentStep ? `${STEP_ACCENT[i]}0a` : "transparent",
                      }}
                      type="button"
                    >
                      <span>{step.icon}</span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 콘텐츠 */}
              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={`${project.id}-${currentStep}`}
                    className="absolute inset-0 overflow-y-auto px-10 py-6"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{duration: 0.35, ease: [0.22, 1, 0.36, 1]}}
                  >
                    {currentStep === 0 && <SectionOverview project={project} color={color} />}
                    {currentStep === 1 && <SectionProblem project={project} color={color} />}
                    {currentStep === 2 && <SectionApproach project={project} color={color} />}
                    {currentStep === 3 && <SectionContribution project={project} color={color} />}
                    {currentStep === 4 && <SectionResult project={project} color={color} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 하단 네비 */}
              <div className="flex shrink-0 items-center justify-between border-t border-white/8 px-10 py-4">
                <motion.button
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 font-mono text-sm font-black text-white/40 disabled:opacity-20"
                  disabled={currentStep === 0}
                  onClick={goPrev} type="button"
                  whileHover={currentStep > 0 ? {x: -3, color: "#fff"} : {}}
                  whileTap={currentStep > 0 ? {scale: 0.96} : {}}
                >
                  ← 이전
                </motion.button>

                <div className="flex items-center gap-2">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      className="rounded-full transition-all duration-300"
                      onClick={() => goTo(i)}
                      style={{
                        width: i === currentStep ? 22 : 6,
                        height: 6,
                        background: i === currentStep ? color : i < currentStep ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                        boxShadow: i === currentStep ? `0 0 8px ${color}` : "none",
                      }}
                      type="button"
                    />
                  ))}
                </div>

                <motion.button
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-mono text-sm font-black disabled:opacity-20"
                  disabled={currentStep === STEPS.length - 1}
                  onClick={goNext} type="button"
                  style={currentStep < STEPS.length - 1
                    ? {background: color, color: "#040608", boxShadow: `0 0 16px ${color}40`}
                    : {border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.2)"}
                  }
                  whileHover={currentStep < STEPS.length - 1 ? {scale: 1.04, filter: "brightness(1.1)"} : {}}
                  whileTap={currentStep < STEPS.length - 1 ? {scale: 0.97} : {}}
                >
                  {currentStep === STEPS.length - 1 ? "완료" : "다음 →"}
                </motion.button>
              </div>
            </motion.main>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
