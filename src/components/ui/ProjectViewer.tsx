"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useState} from "react";
import type {ProjectData} from "@/types/portfolio";

interface Step {
  id: string;
  label: string;
  icon: string;
}

const STEPS: Step[] = [
  {id: "overview", label: "개요", icon: "◈"},
  {id: "problem", label: "문제 정의", icon: "⬡"},
  {id: "approach", label: "접근 방식", icon: "◎"},
  {id: "tech", label: "기술 스택", icon: "⬢"},
  {id: "result", label: "결과", icon: "◆"},
];

const STEP_ACCENT = ["#7ed9ff", "#ff9a6c", "#a78bfa", "#34d399", "#fbbf24"];

interface Props {
  project: ProjectData | null;
  onClose: () => void;
}

function ProgressBar({current, total, color}: {current: number; total: number; color: string}) {
  return (
    <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        animate={{width: `${((current + 1) / total) * 100}%`}}
        className="absolute left-0 top-0 h-full rounded-full"
        style={{backgroundColor: color}}
        transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
      />
    </div>
  );
}

function StepContent({project, stepId, color}: {project: ProjectData; stepId: string; color: string}) {
  if (stepId === "overview") {
    return (
      <div className="flex h-full flex-col justify-center gap-8">
        <div>
          <motion.p
            animate={{opacity: 1, y: 0}} className="text-sm font-black uppercase tracking-[0.25em]"
            initial={{opacity: 0, y: 14}} style={{color}} transition={{duration: 0.45, delay: 0.05}}
          >Project Overview</motion.p>
          <motion.h2
            animate={{opacity: 1, y: 0}} className="mt-3 text-4xl font-black leading-tight text-white"
            initial={{opacity: 0, y: 18}} transition={{duration: 0.45, delay: 0.12}}
          >{project.title}</motion.h2>
          <motion.p
            animate={{opacity: 1, y: 0}} className="mt-4 text-lg leading-7 text-white/60"
            initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.2}}
          >{project.description}</motion.p>
        </div>
        <motion.div animate={{opacity: 1, y: 0}} className="rounded-2xl border border-white/10 bg-white/5 p-6" initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.28}}>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/40">담당 역할</p>
          <p className="text-base leading-7 text-white/80">{project.role}</p>
        </motion.div>
        <motion.div animate={{opacity: 1, y: 0}} className="rounded-2xl border border-white/10 bg-white/5 p-6" initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.34}}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/40">핵심 기능</p>
          <div className="flex flex-wrap gap-2">
            {project.features.map((f, i) => (
              <motion.span
                animate={{opacity: 1, scale: 1}} className="rounded-full border px-3 py-1 text-sm font-bold"
                initial={{opacity: 0, scale: 0.8}} key={f}
                style={{borderColor: `${color}50`, color, background: `${color}18`}}
                transition={{duration: 0.3, delay: 0.38 + i * 0.06}}
              >{f}</motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (stepId === "problem") {
    return (
      <div className="flex h-full flex-col justify-center gap-8">
        <motion.div animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.05}}>
          <p className="text-sm font-black uppercase tracking-[0.25em]" style={{color}}>Problem Statement</p>
          <h3 className="mt-3 text-3xl font-black text-white">어떤 문제를 해결했나요?</h3>
        </motion.div>
        <motion.div animate={{opacity: 1, y: 0}} className="relative rounded-2xl border border-white/10 bg-white/5 p-8" initial={{opacity: 0, y: 18}} transition={{duration: 0.5, delay: 0.15}}>
          <span className="absolute -left-1 -top-1 text-5xl opacity-20" style={{color}}>"</span>
          <p className="relative z-10 text-lg leading-8 text-white/85">{project.problem}</p>
          <span className="absolute -bottom-4 -right-1 rotate-180 text-5xl opacity-20" style={{color}}>"</span>
        </motion.div>
        <motion.div animate={{opacity: 1, y: 0}} className="rounded-2xl border border-white/10 bg-white/5 p-6" initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.25}}>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/40">배운 점</p>
          <p className="text-base leading-7 text-white/75">{project.learning}</p>
        </motion.div>
      </div>
    );
  }

  if (stepId === "approach") {
    return (
      <div className="flex h-full flex-col justify-center gap-8">
        <motion.div animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.05}}>
          <p className="text-sm font-black uppercase tracking-[0.25em]" style={{color}}>Approach</p>
          <h3 className="mt-3 text-3xl font-black text-white">어떻게 접근했나요?</h3>
        </motion.div>
        <div className="flex flex-col gap-4">
          {project.approach.map((a, i) => (
            <motion.div
              animate={{opacity: 1, x: 0}} className="flex items-start gap-5 rounded-2xl border border-white/10 bg-white/5 p-5"
              initial={{opacity: 0, x: -20}} key={i} transition={{duration: 0.45, delay: 0.12 + i * 0.1}}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black" style={{backgroundColor: `${color}25`, color}}>
                {i + 1}
              </span>
              <p className="text-base leading-7 text-white/80">{a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (stepId === "tech") {
    const techColors = [color, "#a78bfa", "#34d399", "#fb923c", "#f472b6", "#60a5fa"];
    return (
      <div className="flex h-full flex-col justify-center gap-8">
        <motion.div animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.05}}>
          <p className="text-sm font-black uppercase tracking-[0.25em]" style={{color}}>Tech Stack</p>
          <h3 className="mt-3 text-3xl font-black text-white">어떤 기술을 썼나요?</h3>
        </motion.div>
        <div className="grid grid-cols-2 gap-3">
          {project.tech.map((t, i) => (
            <motion.div
              animate={{opacity: 1, scale: 1, y: 0}}
              className="flex items-center gap-4 rounded-2xl border bg-white/5 p-5"
              initial={{opacity: 0, scale: 0.9, y: 14}} key={t}
              style={{borderColor: `${techColors[i % techColors.length]}40`}}
              transition={{duration: 0.4, delay: 0.1 + i * 0.07}}
            >
              <div className="h-3 w-3 shrink-0 rounded-full" style={{backgroundColor: techColors[i % techColors.length]}} />
              <span className="text-base font-black text-white">{t}</span>
            </motion.div>
          ))}
        </div>
        <motion.div animate={{opacity: 1, y: 0}} className="rounded-2xl border border-white/10 bg-white/5 p-5" initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.3}}>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/40">기여 내용</p>
          <ul className="space-y-2">
            {project.contribution.map((c, i) => (
              <li className="flex items-start gap-3 text-sm leading-6 text-white/70" key={i}>
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{backgroundColor: color}} />
                {c}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    );
  }

  if (stepId === "result") {
    return (
      <div className="flex h-full flex-col justify-center gap-8">
        <motion.div animate={{opacity: 1, y: 0}} initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.05}}>
          <p className="text-sm font-black uppercase tracking-[0.25em]" style={{color}}>Result</p>
          <h3 className="mt-3 text-3xl font-black text-white">어떤 결과를 얻었나요?</h3>
        </motion.div>
        <motion.div
          animate={{opacity: 1, scale: 1}} className="relative overflow-hidden rounded-2xl p-8"
          initial={{opacity: 0, scale: 0.96}} style={{background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)`, border: `1px solid ${color}40`}}
          transition={{duration: 0.5, delay: 0.12}}
        >
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl" style={{backgroundColor: `${color}30`}} />
          <p className="relative z-10 text-lg leading-8 text-white/90">{project.result}</p>
        </motion.div>
        <motion.div animate={{opacity: 1, y: 0}} className="rounded-2xl border border-white/10 bg-white/5 p-6" initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.22}}>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/40">다음 단계</p>
          <p className="text-base leading-7 text-white/70">{project.nextStep}</p>
        </motion.div>
        <motion.div animate={{opacity: 1, y: 0}} className="flex gap-3" initial={{opacity: 0, y: 14}} transition={{duration: 0.45, delay: 0.3}}>
          {project.links.map((link) => (
            <motion.a
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition"
              href={link.href} key={link.label} rel="noreferrer"
              style={{backgroundColor: color, color: "#060e1e"}}
              target="_blank"
              whileHover={{scale: 1.03, filter: "brightness(1.12)"}}
              whileTap={{scale: 0.97}}
            >
              {link.label} ↗
            </motion.a>
          ))}
        </motion.div>
      </div>
    );
  }

  return null;
}

export function ProjectViewer({project, onClose}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const color = STEP_ACCENT[currentStep] ?? "#7ed9ff";

  useEffect(() => {
    setCurrentStep(0);
  }, [project]);

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

  function goNext() {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }

  function goPrev() {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }

  const variants = {
    enter: (dir: number) => ({opacity: 0, x: dir > 0 ? 60 : -60}),
    center: {opacity: 1, x: 0},
    exit: (dir: number) => ({opacity: 0, x: dir > 0 ? -60 : 60}),
  };

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          animate={{opacity: 1}}
          className="fixed inset-0 z-[60] flex"
          exit={{opacity: 0}}
          initial={{opacity: 0}}
          transition={{duration: 0.3}}
        >
          {/* 배경 */}
          <motion.div
            animate={{opacity: 1}} className="absolute inset-0"
            exit={{opacity: 0}} initial={{opacity: 0}}
            style={{background: "radial-gradient(ellipse at 30% 40%, #0d1e3a 0%, #040608 65%)"}}
            transition={{duration: 0.3}}
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />

          <div className="relative z-10 flex h-full w-full">
            {/* ===== 왼쪽 사이드바 ===== */}
            <motion.aside
              animate={{opacity: 1, x: 0}}
              className="flex h-full w-72 shrink-0 flex-col border-r border-white/10 bg-white/[0.03] p-8"
              exit={{opacity: 0, x: -20}}
              initial={{opacity: 0, x: -20}}
              onClick={(e) => e.stopPropagation()}
              transition={{duration: 0.4, ease: [0.22, 1, 0.36, 1]}}
            >
              {/* 닫기 */}
              <motion.button
                className="mb-8 flex items-center gap-2 self-start text-xs font-black uppercase tracking-[0.18em] text-white/40 transition hover:text-white/80"
                onClick={onClose} type="button"
                whileHover={{x: -3}}
              >
                ← 닫기
              </motion.button>

              {/* 프로젝트 타이틀 */}
              <div className="mb-8">
                <p className="mb-1.5 text-xs font-black uppercase tracking-[0.2em]" style={{color}}>Project</p>
                <h1 className="text-2xl font-black leading-tight text-white">{project.title}</h1>
                <p className="mt-2 text-sm leading-6 text-white/50">{project.description}</p>
              </div>

              {/* 기술스택 */}
              <div className="mb-8">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/30">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t, i) => (
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-black"
                      key={t}
                      style={{
                        backgroundColor: `${STEP_ACCENT[i % STEP_ACCENT.length]}22`,
                        color: STEP_ACCENT[i % STEP_ACCENT.length],
                        border: `1px solid ${STEP_ACCENT[i % STEP_ACCENT.length]}44`
                      }}
                    >{t}</span>
                  ))}
                </div>
              </div>

              {/* 스텝 네비게이터 */}
              <div className="mb-8 flex-1">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/30">Navigation</p>
                <nav className="flex flex-col gap-1">
                  {STEPS.map((step, i) => {
                    const isActive = i === currentStep;
                    const isDone = i < currentStep;
                    return (
                      <motion.button
                        animate={{opacity: 1}}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-all"
                        initial={{opacity: 0}}
                        key={step.id}
                        onClick={() => { setDirection(i > currentStep ? 1 : -1); setCurrentStep(i); }}
                        style={{
                          background: isActive ? `${STEP_ACCENT[i]}18` : "transparent",
                          color: isActive ? STEP_ACCENT[i] : isDone ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.25)",
                          borderLeft: isActive ? `2px solid ${STEP_ACCENT[i]}` : "2px solid transparent",
                        }}
                        transition={{duration: 0.3, delay: 0.08 + i * 0.05}}
                        type="button"
                        whileHover={{x: 3}}
                      >
                        <span className="w-4 shrink-0 text-center text-xs">{isDone ? "✓" : step.icon}</span>
                        {step.label}
                      </motion.button>
                    );
                  })}
                </nav>
              </div>

              {/* 링크 버튼들 */}
              <div className="flex flex-col gap-2">
                {project.links.map((link, i) => (
                  <motion.a
                    className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-black transition"
                    href={link.href}
                    key={link.label}
                    rel="noreferrer"
                    style={i === 0 ? {backgroundColor: color, color: "#040608", borderColor: color} : {borderColor: `${color}50`, color}}
                    target="_blank"
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.97}}
                  >
                    {link.label} ↗
                  </motion.a>
                ))}
              </div>
            </motion.aside>

            {/* ===== 메인 콘텐츠 ===== */}
            <motion.main
              animate={{opacity: 1}}
              className="relative flex flex-1 flex-col overflow-hidden"
              exit={{opacity: 0}}
              initial={{opacity: 0}}
              onClick={(e) => e.stopPropagation()}
              transition={{duration: 0.4, delay: 0.08}}
            >
              {/* 상단 진행 바 */}
              <div className="flex shrink-0 items-center gap-4 border-b border-white/10 px-10 py-5">
                <div className="flex-1">
                  <ProgressBar color={color} current={currentStep} total={STEPS.length} />
                </div>
                <span className="shrink-0 text-xs font-black tabular-nums text-white/30">
                  {currentStep + 1} / {STEPS.length}
                </span>
              </div>

              {/* 스텝 탭 바 */}
              <div className="flex shrink-0 gap-0 border-b border-white/10">
                {STEPS.map((step, i) => (
                  <button
                    className="flex flex-1 items-center justify-center gap-2 py-3.5 text-xs font-black uppercase tracking-[0.14em] transition-all"
                    key={step.id}
                    onClick={() => { setDirection(i > currentStep ? 1 : -1); setCurrentStep(i); }}
                    style={{
                      color: i === currentStep ? STEP_ACCENT[i] : "rgba(255,255,255,0.22)",
                      borderBottom: i === currentStep ? `2px solid ${STEP_ACCENT[i]}` : "2px solid transparent",
                      background: i === currentStep ? `${STEP_ACCENT[i]}0c` : "transparent",
                    }}
                    type="button"
                  >
                    <span>{step.icon}</span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                ))}
              </div>

              {/* 콘텐츠 영역 */}
              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    animate="center"
                    className="absolute inset-0 overflow-y-auto px-10 py-8"
                    custom={direction}
                    exit="exit"
                    initial="enter"
                    key={`${project.id}-${currentStep}`}
                    transition={{duration: 0.38, ease: [0.22, 1, 0.36, 1]}}
                    variants={variants}
                  >
                    <StepContent color={color} project={project} stepId={STEPS[currentStep]?.id ?? "overview"} />
                  </motion.div>
                </AnimatePresence>

                {/* 그라데이션 빛 번짐 효과 */}
                <div
                  className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full blur-3xl transition-all duration-700"
                  style={{backgroundColor: `${color}12`}}
                />
              </div>

              {/* 하단 네비게이션 */}
              <div className="flex shrink-0 items-center justify-between border-t border-white/10 px-10 py-5">
                <motion.button
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-black text-white/50 transition disabled:opacity-20"
                  disabled={currentStep === 0}
                  onClick={goPrev}
                  type="button"
                  whileHover={currentStep > 0 ? {x: -3, color: "#ffffff"} : {}}
                  whileTap={currentStep > 0 ? {scale: 0.96} : {}}
                >
                  ← 이전
                </motion.button>

                {/* 스텝 도트 */}
                <div className="flex items-center gap-2">
                  {STEPS.map((_, i) => (
                    <button
                      className="rounded-full transition-all duration-300"
                      key={i}
                      onClick={() => { setDirection(i > currentStep ? 1 : -1); setCurrentStep(i); }}
                      style={{
                        width: i === currentStep ? 20 : 6,
                        height: 6,
                        backgroundColor: i === currentStep ? color : i < currentStep ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
                      }}
                      type="button"
                    />
                  ))}
                </div>

                <motion.button
                  className="flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-black transition disabled:opacity-20"
                  disabled={currentStep === STEPS.length - 1}
                  onClick={goNext}
                  style={currentStep < STEPS.length - 1 ? {backgroundColor: color, color: "#040608"} : {border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.25)"}}
                  type="button"
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
