"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type {CSSProperties, ReactNode} from "react";
import {useEffect, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {RICH_RENDERERS} from "./richContent";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#01XYZ";

const STEPS = [
  {id: "overview", label: "TITLE", ko: "개요"},
  {id: "problem", label: "DISTRESS LOG", ko: "문제"},
  {id: "approach", label: "PROTOCOL", ko: "접근"},
  {id: "contribution", label: "EVIDENCE", ko: "기여"},
  {id: "result", label: "OUTCOME", ko: "결과"},
] as const;

const MOOD_LABEL: Record<string, {tag: string; enter: string; system: string}> = {
  horror: {tag: "CASE FILE", enter: "ENTER THE LAB", system: "DARKLAB://"},
  arcade: {tag: "GAME CART", enter: "PRESS START", system: "ARCADE://"},
  platformer: {tag: "STAGE DATA", enter: "START GAME", system: "STAGE://"},
};

function ScrambleText({
  text,
  className,
  style,
  speed = 32,
  delay = 0,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  speed?: number;
  delay?: number;
}) {
  const [out, setOut] = useState("");

  useEffect(() => {
    let raf = 0;
    const total = text.length * speed + 350;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(elapsed / total, 1);
      const revealed = progress * text.length;
      let result = "";

      for (let index = 0; index < text.length; index += 1) {
        if (text[index] === " ") result += " ";
        else if (index < revealed) result += text[index];
        else result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }

      setOut(result);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setOut(text);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, speed, delay]);

  return (
    <span className={className} style={style}>
      {out || "\u00a0"}
    </span>
  );
}

function Overlays({accent, mood}: {accent: string; mood: string}) {
  const cfg =
    mood === "arcade"
      ? {grain: 0.08, scan: 0.5, scanGap: 2, vignette: "inset 0 0 180px 30px rgba(0,0,0,0.6)", flicker: [0, 0.04, 0, 0.02, 0]}
      : mood === "platformer"
        ? {grain: 0.05, scan: 0.12, scanGap: 4, vignette: "inset 0 0 160px 20px rgba(0,0,0,0.45)", flicker: [0, 0.01, 0, 0.015, 0]}
        : {grain: 0.12, scan: 0.3, scanGap: 3, vignette: "inset 0 0 220px 60px rgba(0,0,0,0.92)", flicker: [0, 0.015, 0, 0.04, 0, 0.01, 0]};

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[2] mix-blend-overlay"
        style={{
          opacity: cfg.grain,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          opacity: cfg.scan,
          backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent ${cfg.scanGap}px)`,
        }}
      />
      {mood === "arcade" ? (
        <motion.div
          className="pointer-events-none absolute inset-x-0 z-[3] h-24"
          style={{background: `linear-gradient(180deg, transparent, ${accent}10, transparent)`}}
          animate={{top: ["-10%", "110%"]}}
          transition={{duration: 4, repeat: Infinity, ease: "linear"}}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 z-[3]" style={{boxShadow: cfg.vignette}} />
      <motion.div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{background: accent}}
        animate={{opacity: cfg.flicker}}
        transition={{duration: 6, repeat: Infinity, ease: "linear"}}
      />
    </>
  );
}

function TitleScreen({project, theme}: {project: ProjectData; theme: ProjectTheme}) {
  const mood = theme.mood ?? "horror";
  const labels = MOOD_LABEL[mood] ?? MOOD_LABEL.horror!;

  return (
    <div className="flex h-full flex-col justify-center gap-8 py-4">
      <div>
        <motion.p
          className="font-mono text-xs font-black uppercase tracking-[0.4em]"
          style={{color: theme.primary}}
          initial={{opacity: 0}}
          animate={{opacity: [0, 1, 0.3, 1]}}
          transition={{duration: 0.9, times: [0, 0.3, 0.5, 1]}}
        >
          {labels.system}
        </motion.p>

        <div className="relative mt-3">
          <motion.h1
            className="font-mono text-6xl font-black leading-none text-white md:text-8xl"
            style={{textShadow: `0 0 30px ${theme.primary}66`}}
            initial={{opacity: 0, y: 14}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
          >
            <ScrambleText text={project.title} speed={55} delay={200} />
          </motion.h1>
          <motion.h1
            className="pointer-events-none absolute left-0 top-0 font-mono text-6xl font-black leading-none md:text-8xl"
            style={{color: theme.primary, mixBlendMode: "screen"}}
            animate={{x: [0, -3, 2, 0, 3, 0], opacity: [0, 0.5, 0, 0.4, 0]}}
            transition={{duration: 3.5, repeat: Infinity, ease: "linear"}}
            aria-hidden
          >
            {project.title}
          </motion.h1>
        </div>

        <motion.p
          className="mt-5 max-w-xl text-lg leading-8 text-white/55"
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.4}}
        >
          {project.description}
        </motion.p>
      </div>

      <motion.div
        className="rounded-lg border p-5"
        style={{borderColor: `${theme.primary}30`, background: "rgba(0,0,0,0.4)"}}
        initial={{opacity: 0, x: -16}}
        animate={{opacity: 1, x: 0}}
        transition={{duration: 0.5, delay: 0.6}}
      >
        <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
          {labels.tag} - ROLE
        </p>
        <p className="text-sm leading-7 text-white/75">{project.role}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.features.map((feature, index) => (
            <motion.span
              key={feature}
              className="rounded border px-2.5 py-1 font-mono text-xs font-bold"
              style={{borderColor: `${theme.primary}40`, color: theme.accent}}
              initial={{opacity: 0, y: 6}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.7 + index * 0.06}}
            >
              {feature}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.p
        className="font-mono text-base font-black tracking-[0.2em]"
        style={{color: theme.primary}}
        animate={{opacity: [1, 0.25, 1]}}
        transition={{duration: 1.4, repeat: Infinity, ease: "easeInOut"}}
      >
        {labels.enter}
      </motion.p>
    </div>
  );
}

function LogWindow({title, theme, children}: {title: string; theme: ProjectTheme; children: ReactNode}) {
  return (
    <motion.div
      className="overflow-hidden rounded-lg border"
      style={{borderColor: `${theme.primary}35`, background: "rgba(0,0,0,0.55)"}}
      initial={{opacity: 0, scale: 0.98}}
      animate={{opacity: 1, scale: 1}}
      transition={{duration: 0.4}}
    >
      <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{borderColor: `${theme.primary}25`, background: `${theme.primary}10`}}>
        <span className="h-2.5 w-2.5 rounded-full" style={{background: theme.primary}} />
        <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em]" style={{color: theme.accent}}>
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function StepHeader({step, theme}: {step: (typeof STEPS)[number]; theme: ProjectTheme}) {
  return (
    <div className="mb-5">
      <span className="font-mono text-xs font-black uppercase tracking-[0.35em]" style={{color: theme.primary}}>
        {">"} <ScrambleText text={step.label} speed={24} />
      </span>
    </div>
  );
}

function GameSection({step, project, theme}: {step: number; project: ProjectData; theme: ProjectTheme}) {
  const meta = STEPS[step]!;

  if (step === 0) return <TitleScreen project={project} theme={theme} />;

  if (step === 1) {
    return (
      <div className="flex h-full flex-col justify-center gap-6 py-4">
        <StepHeader step={meta} theme={theme} />
        <LogWindow title="DISTRESS LOG - 무엇이 문제였나" theme={theme}>
          <p className="font-mono text-sm leading-7 text-white/80">{project.problem}</p>
        </LogWindow>
        <motion.div
          className="rounded-lg border-l-2 p-4"
          style={{borderColor: theme.primary, background: "rgba(0,0,0,0.4)"}}
          initial={{opacity: 0, x: -12}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.3}}
        >
          <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/30">INSIGHT - 배운 점</p>
          <p className="text-sm leading-7 text-white/70">{project.learning}</p>
        </motion.div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex h-full flex-col justify-center gap-5 py-4">
        <StepHeader step={meta} theme={theme} />
        <div className="flex flex-col gap-3">
          {project.approach.map((item, index) => (
            <motion.div
              key={item}
              className="flex items-start gap-4 rounded-lg border p-4"
              style={{borderColor: `${theme.primary}25`, background: "rgba(0,0,0,0.45)"}}
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: 0.15 + index * 0.1}}
              whileHover={{x: 4, borderColor: `${theme.primary}60`}}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded border font-mono text-xs font-black"
                style={{borderColor: theme.primary, color: theme.primary}}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="font-mono text-sm leading-7 text-white/75">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="flex h-full flex-col justify-center gap-5 py-4">
        <StepHeader step={meta} theme={theme} />
        <div className="flex flex-col gap-2.5">
          {project.contribution.map((item, index) => (
            <motion.div
              key={item}
              className="flex items-center gap-3 rounded-lg border px-4 py-3"
              style={{borderColor: `${theme.primary}25`, background: "rgba(0,0,0,0.45)"}}
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.1 + index * 0.08}}
            >
              <motion.span
                className="font-mono text-sm font-black"
                style={{color: theme.primary}}
                animate={{opacity: [0.4, 1, 0.4]}}
                transition={{duration: 2, repeat: Infinity, delay: index * 0.2}}
              >
                &gt;
              </motion.span>
              <p className="font-mono text-sm leading-6 text-white/80">{item}</p>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {project.tech.map((item, index) => (
            <motion.span
              key={item}
              className="rounded border px-3 py-1 font-mono text-xs font-bold"
              style={{borderColor: `${theme.primary}40`, color: theme.accent}}
              initial={{opacity: 0, scale: 0.85}}
              animate={{opacity: 1, scale: 1}}
              transition={{delay: 0.4 + index * 0.05}}
            >
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-6 py-4">
      <StepHeader step={meta} theme={theme} />
      <LogWindow title="OUTCOME - 결과" theme={theme}>
        <p className="text-base leading-8 text-white/85">{project.result}</p>
      </LogWindow>
      <motion.div
        className="rounded-lg border-l-2 p-4"
        style={{borderColor: `${theme.primary}88`, background: "rgba(0,0,0,0.4)"}}
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.3}}
      >
        <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/30">NEXT - 다음 단계</p>
        <p className="text-sm leading-7 text-white/70">{project.nextStep}</p>
      </motion.div>
      <div className="flex flex-wrap gap-3">
        {project.links.map((link) => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border px-6 py-3 font-mono text-sm font-black tracking-[0.1em] transition"
            style={{borderColor: theme.primary, color: theme.primary, background: `${theme.primary}12`}}
            whileHover={{scale: 1.04, background: `${theme.primary}25`, boxShadow: `0 0 20px ${theme.primary}50`}}
            whileTap={{scale: 0.97}}
          >
            {link.label} -&gt;
          </motion.a>
        ))}
      </div>
    </div>
  );
}

interface Props {
  project: ProjectData;
  theme: ProjectTheme;
  onClose: () => void;
}

export function GameProjectViewer({project, theme, onClose}: Props) {
  const [step, setStep] = useState(0);
  const [booting, setBooting] = useState(true);
  const [glitch, setGlitch] = useState(false);
  const [bursts, setBursts] = useState<{id: number; x: number; y: number}[]>([]);
  const mood = theme.mood ?? "horror";
  const containerRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(38);
  const sx = useSpring(mx, {stiffness: 140, damping: 22});
  const sy = useSpring(my, {stiffness: 140, damping: 22});
  const tiltX = useSpring(useTransform(my, [0, 100], [4, -4]), {stiffness: 120, damping: 18});
  const tiltY = useSpring(useTransform(mx, [0, 100], [-5, 5]), {stiffness: 120, damping: 18});
  const spotlight = useMotionTemplate`radial-gradient(circle 460px at ${sx}% ${sy}%, ${theme.primary}1f, transparent 70%)`;
  const labels = MOOD_LABEL[mood] ?? MOOD_LABEL.horror!;
  const richRender = RICH_RENDERERS[project.id];

  function handleMove(event: React.MouseEvent) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mx.set(((event.clientX - rect.left) / rect.width) * 100);
    my.set(((event.clientY - rect.top) / rect.height) * 100);
  }

  function handleClick(event: React.MouseEvent) {
    const id = Date.now();
    setBursts((items) => [...items, {id, x: event.clientX, y: event.clientY}]);
    setTimeout(() => setBursts((items) => items.filter((item) => item.id !== id)), 450);
  }

  function changeStep(next: number) {
    setGlitch(true);
    setStep(next);
    setTimeout(() => setGlitch(false), 240);
  }

  useEffect(() => {
    setBooting(true);
    const timeout = setTimeout(() => setBooting(false), 1300);
    return () => clearTimeout(timeout);
  }, [project.id]);

  useEffect(() => setStep(0), [project.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") setStep((value) => Math.min(value + 1, STEPS.length - 1));
      if (event.key === "ArrowLeft") setStep((value) => Math.max(value - 1, 0));
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[60] overflow-hidden font-mono"
      style={{background: theme.bg}}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.3}}
      onMouseMove={handleMove}
      onClick={handleClick}
    >
      <motion.div className="pointer-events-none absolute inset-0 z-[1]" style={{background: spotlight}} />
      <Overlays accent={theme.accent} mood={mood} />

      <AnimatePresence>
        {glitch ? (
          <>
            <motion.div
              className="pointer-events-none absolute inset-0 z-[8]"
              style={{background: theme.primary, mixBlendMode: "screen"}}
              initial={{opacity: 0, x: -6}}
              animate={{opacity: [0, 0.25, 0], x: [6, -8, 4]}}
              exit={{opacity: 0}}
              transition={{duration: 0.24}}
            />
            <motion.div
              className="pointer-events-none absolute inset-x-0 z-[8] h-1/3"
              style={{background: "rgba(255,255,255,0.06)", top: "33%"}}
              initial={{opacity: 0.5, scaleY: 0.4}}
              animate={{opacity: 0, scaleY: 1.4, y: [0, -20, 10]}}
              transition={{duration: 0.24}}
            />
          </>
        ) : null}
      </AnimatePresence>

      {bursts.map((burst) => (
        <motion.div
          key={burst.id}
          className="pointer-events-none fixed z-[9] rounded-full"
          style={{
            left: burst.x,
            top: burst.y,
            background: `radial-gradient(circle, ${theme.accent}55, transparent 70%)`,
          }}
          initial={{width: 0, height: 0, x: 0, y: 0, opacity: 0.9}}
          animate={{width: 180, height: 180, x: -90, y: -90, opacity: 0}}
          transition={{duration: 0.45, ease: "easeOut"}}
        />
      ))}

      <AnimatePresence>
        {booting ? (
          <motion.div
            className="absolute inset-0 z-[20] flex flex-col items-center justify-center"
            style={{background: theme.bg}}
            initial={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.4}}
          >
            <motion.p
              className="font-mono text-sm font-black uppercase tracking-[0.3em]"
              style={{color: theme.primary}}
              animate={{opacity: [0.3, 1, 0.3]}}
              transition={{duration: 0.8, repeat: Infinity}}
            >
              <ScrambleText text={`${labels.system} ACCESSING ${labels.tag}`} speed={20} />
            </motion.p>
            <motion.div className="mt-5 h-0.5 w-56 overflow-hidden rounded-full" style={{background: `${theme.primary}22`}}>
              <motion.div
                className="h-full"
                style={{background: theme.primary}}
                initial={{width: "0%"}}
                animate={{width: "100%"}}
                transition={{duration: 1.2, ease: "easeInOut"}}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-8 py-5">
        <span className="font-mono text-xs font-black uppercase tracking-[0.3em]" style={{color: theme.primary}}>
          {labels.tag}
        </span>
        <button
          className="rounded border px-3 py-1.5 font-mono text-xs font-black uppercase tracking-[0.15em] transition hover:bg-white/10"
          style={{borderColor: `${theme.primary}40`, color: theme.accent}}
          onClick={onClose}
          type="button"
        >
          ESC 닫기
        </button>
      </div>

      <div className="relative z-[5] mx-auto flex h-full max-w-3xl flex-col px-8 pt-16">
        <motion.div className="relative flex-1 overflow-hidden" style={richRender ? undefined : {rotateX: tiltX, rotateY: tiltY, transformPerspective: 1400}}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${project.id}-${step}`}
              className="absolute inset-0 overflow-y-auto pr-1"
              initial={{opacity: 0, y: 18, filter: "blur(6px)"}}
              animate={{opacity: 1, y: 0, filter: "blur(0px)"}}
              exit={{opacity: 0, y: -12, filter: "blur(6px)"}}
              transition={{duration: 0.4}}
            >
              {richRender ? richRender({step, project, theme}) : <GameSection step={step} project={project} theme={theme} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t py-4" style={{borderColor: `${theme.primary}22`}}>
          <div className="flex gap-1">
            {STEPS.map((item, index) => (
              <button
                key={item.id}
                className="flex items-center gap-2 rounded px-3 py-2 font-mono text-[11px] font-black uppercase tracking-[0.1em] transition"
                onClick={() => changeStep(index)}
                style={{
                  color: index === step ? theme.bg : index < step ? `${theme.accent}99` : "rgba(255,255,255,0.25)",
                  background: index === step ? theme.primary : "transparent",
                }}
                type="button"
              >
                {index === step ? ">" : index < step ? "ok" : "-"}
                <span className="hidden sm:inline">{item.ko}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              className="rounded border px-4 py-2 font-mono text-xs font-black disabled:opacity-20"
              style={{borderColor: `${theme.primary}40`, color: theme.accent}}
              disabled={step === 0}
              onClick={() => changeStep(Math.max(step - 1, 0))}
              type="button"
            >
              이전
            </button>
            <button
              className="rounded px-5 py-2 font-mono text-xs font-black disabled:opacity-20"
              style={
                step < STEPS.length - 1
                  ? {background: theme.primary, color: theme.bg}
                  : {border: `1px solid ${theme.primary}30`, color: "rgba(255,255,255,0.3)"}
              }
              disabled={step === STEPS.length - 1}
              onClick={() => changeStep(Math.min(step + 1, STEPS.length - 1))}
              type="button"
            >
              NEXT -&gt;
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
