"use client";

import {AnimatePresence, motion} from "framer-motion";
import type {ReactNode} from "react";
import {useEffect, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {RICH_RENDERERS} from "./richContent";

const STEPS = [
  {id: "overview", label: "소개", en: "ABOUT"},
  {id: "problem", label: "배경", en: "CONTEXT"},
  {id: "approach", label: "진행", en: "PROCESS"},
  {id: "contribution", label: "기여", en: "WORK"},
  {id: "result", label: "성과", en: "RESULT"},
] as const;

function Stamp({color, delay}: {color: string; delay: number}) {
  return (
    <motion.span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 font-mono text-xs font-black"
      style={{borderColor: color, color}}
      initial={{scale: 2.4, opacity: 0, rotate: -18}}
      animate={{scale: 1, opacity: 1, rotate: -8}}
      transition={{type: "spring", stiffness: 320, damping: 14, delay}}
    >
      OK
    </motion.span>
  );
}

function DocCard({
  label,
  theme,
  children,
  delay = 0,
}: {
  label?: string;
  theme: ProjectTheme;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="rounded-xl border bg-white/[0.03] p-5"
      style={{borderColor: `${theme.primary}22`}}
      initial={{opacity: 0, y: 14}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, delay}}
      whileHover={{borderColor: `${theme.primary}50`, background: "rgba(255,255,255,0.045)"}}
    >
      {label ? (
        <div className="mb-3 flex items-center gap-2">
          <span className="h-3 w-1 rounded-full" style={{background: theme.primary}} />
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{label}</span>
        </div>
      ) : null}
      {children}
    </motion.div>
  );
}

function Section({step, project, theme}: {step: number; project: ProjectData; theme: ProjectTheme}) {
  if (step === 0) {
    return (
      <div className="flex h-full flex-col justify-center gap-6 py-2">
        <div className="border-l-4 pl-5" style={{borderColor: theme.primary}}>
          <p className="font-mono text-xs font-black uppercase tracking-[0.3em]" style={{color: theme.primary}}>
            OFFICIAL - PLATFORM
          </p>
          <h1 className="mt-2 text-5xl font-black leading-tight text-white md:text-6xl">{project.title}</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/60">{project.description}</p>
        </div>

        <DocCard label="담당 역할" theme={theme} delay={0.15}>
          <p className="text-sm leading-7 text-white/75">{project.role}</p>
        </DocCard>

        <DocCard label="주요 기능" theme={theme} delay={0.25}>
          <div className="grid gap-2 sm:grid-cols-2">
            {project.features.map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                style={{background: `${theme.primary}0a`}}
                initial={{opacity: 0, x: -10}}
                animate={{opacity: 1, x: 0}}
                transition={{delay: 0.3 + index * 0.06}}
              >
                <span className="font-mono text-xs font-black" style={{color: theme.primary}}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-white/80">{feature}</span>
              </motion.div>
            ))}
          </div>
        </DocCard>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex h-full flex-col justify-center gap-5 py-2">
        <DocCard label="배경 - 무엇이 문제였나" theme={theme}>
          <p className="text-base leading-8 text-white/85">{project.problem}</p>
        </DocCard>
        <DocCard label="배운 점" theme={theme} delay={0.15}>
          <p className="text-sm leading-7 text-white/70">{project.learning}</p>
        </DocCard>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex h-full flex-col justify-center gap-3 py-2">
        {project.approach.map((item, index) => (
          <DocCard key={item} theme={theme} delay={index * 0.1}>
            <div className="flex items-start gap-4">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black"
                style={{background: `${theme.primary}18`, color: theme.primary}}
              >
                {index + 1}
              </span>
              <p className="text-sm leading-7 text-white/80">{item}</p>
            </div>
          </DocCard>
        ))}
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="flex h-full flex-col justify-center gap-5 py-2">
        <DocCard label="기여 내역" theme={theme}>
          <div className="flex flex-col gap-3">
            {project.contribution.map((item, index) => (
              <motion.div
                key={item}
                className="flex items-center gap-3"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.1 + index * 0.1}}
              >
                <Stamp color={theme.primary} delay={0.2 + index * 0.12} />
                <span className="text-sm leading-6 text-white/80">{item}</span>
              </motion.div>
            ))}
          </div>
        </DocCard>

        <DocCard label="기술 스택" theme={theme} delay={0.3}>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((item) => (
              <span
                key={item}
                className="rounded-lg border px-3 py-1.5 font-mono text-sm font-bold"
                style={{borderColor: `${theme.primary}35`, color: theme.accent, background: `${theme.primary}0d`}}
              >
                {item}
              </span>
            ))}
          </div>
        </DocCard>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-5 py-2">
      <DocCard label="성과 - 결과" theme={theme}>
        <p className="text-base leading-8 text-white/85">{project.result}</p>
      </DocCard>
      <DocCard label="다음 단계" theme={theme} delay={0.15}>
        <p className="text-sm leading-7 text-white/70">{project.nextStep}</p>
      </DocCard>
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

export function PlatformProjectViewer({project, theme, onClose}: Props) {
  const [step, setStep] = useState(0);
  const richRender = RICH_RENDERERS[project.id];

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
      className="fixed inset-0 z-[60] flex flex-col"
      style={{background: `linear-gradient(160deg, ${theme.primary}0c, ${theme.bg} 55%)`}}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.3}}
    >
      <div className="relative z-10 shrink-0 border-b" style={{borderColor: `${theme.primary}20`}}>
        <div className="flex items-center justify-between px-8 py-4">
          <span className="font-mono text-sm font-black text-white">{project.title}</span>
          <button
            className="rounded border px-3 py-1.5 font-mono text-xs font-black uppercase tracking-[0.15em] transition hover:bg-white/10"
            style={{borderColor: `${theme.primary}40`, color: theme.accent}}
            onClick={onClose}
            type="button"
          >
            ESC 닫기
          </button>
        </div>
        <div className="flex gap-1 px-6">
          {STEPS.map((item, index) => (
            <button
              key={item.id}
              className="relative px-4 py-2.5 font-mono text-xs font-black transition"
              onClick={() => setStep(index)}
              style={{color: index === step ? theme.primary : "rgba(255,255,255,0.35)"}}
              type="button"
            >
              {item.label}
              {index === step ? (
                <motion.span
                  layoutId="platform-tab"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                  style={{background: theme.primary}}
                />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-8">
        <div className="relative flex-1 overflow-hidden py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${project.id}-${step}`}
              className="absolute inset-x-8 inset-y-6 overflow-y-auto"
              initial={{opacity: 0, y: 16}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -12}}
              transition={{duration: 0.3}}
            >
              {richRender ? richRender({step, project, theme}) : <Section step={step} project={project} theme={theme} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t py-4" style={{borderColor: `${theme.primary}20`}}>
          <div className="flex items-center gap-2 font-mono text-xs text-white/40">
            <span style={{color: theme.primary}}>{String(step + 1).padStart(2, "0")}</span>
            <span>/ {String(STEPS.length).padStart(2, "0")}</span>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg border px-4 py-2 font-mono text-xs font-black disabled:opacity-20"
              style={{borderColor: `${theme.primary}40`, color: theme.accent}}
              disabled={step === 0}
              onClick={() => setStep((value) => Math.max(value - 1, 0))}
              type="button"
            >
              이전
            </button>
            <button
              className="rounded-lg px-5 py-2 font-mono text-xs font-black disabled:opacity-20"
              style={
                step < STEPS.length - 1
                  ? {background: theme.primary, color: theme.bg}
                  : {border: `1px solid ${theme.primary}30`, color: "rgba(255,255,255,0.3)"}
              }
              disabled={step === STEPS.length - 1}
              onClick={() => setStep((value) => Math.min(value + 1, STEPS.length - 1))}
              type="button"
            >
              다음 -&gt;
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
