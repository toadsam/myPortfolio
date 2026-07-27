"use client";

import {AnimatePresence, motion, useReducedMotion} from "framer-motion";
import {useEffect, useRef} from "react";
import {getProjectTheme, type ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {RICH_DATA} from "./project-viewers/richContent/data";
import {MYWAVE_BRIEF} from "./project-viewers/richContent/mywaveBrief";
import type {RichProject} from "./project-viewers/richContent/shared";
import {
  CodeBlock,
  CountUp,
  ImageSlot,
  MockScreen
} from "./project-viewers/richContent/shared";

// ════════════════════════════════════════════════════════════════════════════
//  면접관 원페이지 (단일 스크롤 · 저자극 · 빠른 스캔)
//  - 마을 뷰(ProjectViewer)와 달리 탭·복잡한 인터랙션 없이 위에서 아래로 읽는다.
//  - 이미지/수치/링크는 슬롯으로 비워 두고 나중에 채운다.
// ════════════════════════════════════════════════════════════════════════════

function getBrief(id: string): RichProject | null {
  if (RICH_DATA[id]) return RICH_DATA[id]!;
  if (id === "mywave") return MYWAVE_BRIEF;
  return null;
}

const CATEGORY_LABEL: Record<string, string> = {
  dashboard: "DASHBOARD",
  realtime: "REALTIME",
  platform: "PLATFORM",
  game: "GAME"
};

// ─── 등장 애니메이션 (저자극: 은은한 fade-up, 모션 최소화 설정 존중) ───────────

function Reveal({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{opacity: 0, y: 14}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, margin: "-60px"}}
      transition={{duration: 0.4, delay}}
    >
      {children}
    </motion.div>
  );
}

// ─── 섹션 헤더 ────────────────────────────────────────────────────────────────

function SectionHead({
  index,
  ko,
  en,
  theme
}: {
  index: string;
  ko: string;
  en: string;
  theme: ProjectTheme;
}) {
  return (
    <div
      className="mb-6 flex items-baseline gap-3 border-b pb-3"
      style={{borderColor: `${theme.primary}20`}}
    >
      <span
        className="font-mono text-sm font-black"
        style={{color: `${theme.primary}90`}}
      >
        {index}
      </span>
      <h2 className="text-xl font-black text-white md:text-2xl">{ko}</h2>
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
        {en}
      </span>
    </div>
  );
}

// ─── 아키텍처 흐름 (정적) ─────────────────────────────────────────────────────

function ArchFlow({
  theme,
  layers
}: {
  theme: ProjectTheme;
  layers: {name: string; desc: string; tag: string}[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {layers.map((l, i) => (
        <div key={l.name}>
          <div
            className="flex items-center gap-3 rounded-lg border px-4 py-3"
            style={{
              borderColor: `${theme.primary}28`,
              background: `${theme.primary}08`
            }}
          >
            <span
              className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-black"
              style={{background: `${theme.primary}20`, color: theme.primary}}
            >
              {l.tag}
            </span>
            <div>
              <p className="font-mono text-sm font-black text-white">
                {l.name}
              </p>
              <p className="font-mono text-[11px] leading-5 text-white/50">
                {l.desc}
              </p>
            </div>
          </div>
          {i < layers.length - 1 ? (
            <div
              className="my-0.5 text-center font-mono text-xs"
              style={{color: `${theme.primary}88`}}
            >
              ↓
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ─── 기술 의사결정 표 ─────────────────────────────────────────────────────────

function DecisionTable({
  theme,
  rows
}: {
  theme: ProjectTheme;
  rows: {area: string; pick: string; why: string; alt: string}[];
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{borderColor: `${theme.primary}22`}}
    >
      <div
        className="grid grid-cols-[64px_100px_1fr] gap-2 border-b px-3 py-2 font-mono text-[10px] font-black uppercase tracking-wide text-white/35"
        style={{
          borderColor: `${theme.primary}18`,
          background: `${theme.primary}08`
        }}
      >
        <span>영역</span>
        <span>선택</span>
        <span>이유 / 고려한 대안</span>
      </div>
      {rows.map(r => (
        <div
          key={r.area}
          className="grid grid-cols-[64px_100px_1fr] gap-2 border-b px-3 py-2.5 last:border-0"
          style={{borderColor: `${theme.primary}10`}}
        >
          <span className="font-mono text-[11px] font-bold text-white/55">
            {r.area}
          </span>
          <span
            className="font-mono text-[11px] font-black"
            style={{color: theme.primary}}
          >
            {r.pick}
          </span>
          <span className="text-[12px] leading-5 text-white/70">
            {r.why}
            <span className="mt-0.5 block text-white/35">↔ {r.alt}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── 트러블슈팅 카드 ──────────────────────────────────────────────────────────

function ChallengeCard({
  theme,
  index,
  c
}: {
  theme: ProjectTheme;
  index: number;
  c: RichProject["challenges"][number];
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{borderColor: `${theme.primary}22`}}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className="flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-black"
          style={{background: `${theme.primary}1a`, color: theme.primary}}
        >
          {String(index).padStart(2, "0")}
        </span>
        <p className="font-mono text-sm font-black text-white">{c.title}</p>
      </div>
      <div className="mb-1.5 flex gap-2">
        <span className="shrink-0 font-mono text-[11px] font-black text-[#f87171]">
          문제
        </span>
        <p className="text-[13px] leading-6 text-white/70">{c.problem}</p>
      </div>
      <div className="mb-3 flex gap-2">
        <span
          className="shrink-0 font-mono text-[11px] font-black"
          style={{color: theme.primary}}
        >
          해결
        </span>
        <p className="text-[13px] leading-6 text-white/85">{c.solution}</p>
      </div>
      {c.code ? <CodeBlock theme={theme} spec={c.code} /> : null}
    </div>
  );
}

// ─── 태그 칩 ──────────────────────────────────────────────────────────────────

function TechChip({label, theme}: {label: string; theme: ProjectTheme}) {
  return (
    <span
      className="rounded-lg border px-3 py-1.5 font-mono text-sm font-bold"
      style={{
        borderColor: `${theme.primary}35`,
        color: theme.accent,
        background: `${theme.primary}0c`
      }}
    >
      {label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  메인
// ════════════════════════════════════════════════════════════════════════════

interface Props {
  project: ProjectData | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  index?: number;
  total?: number;
}

export function ProjectOnePager({
  project,
  onClose,
  onPrev,
  onNext,
  index,
  total
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = project ? getProjectTheme(project.id) : null;
  const data = project ? getBrief(project.id) : null;

  // 프로젝트가 바뀌면 스크롤을 맨 위로.
  useEffect(() => {
    scrollRef.current?.scrollTo({top: 0, behavior: "auto"});
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === "ArrowLeft") onPrev?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      {project && theme && data ? (
        <motion.div
          key={project.id}
          ref={scrollRef}
          className="fixed inset-0 z-[70] overflow-y-auto"
          style={{background: theme.bg}}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.25}}
        >
          {/* 은은한 배경 */}
          <div
            className="pointer-events-none fixed inset-0 opacity-70"
            style={{
              background: `radial-gradient(ellipse at 30% -5%, ${theme.primary}14, transparent 55%)`
            }}
          />
          <div
            className="pointer-events-none fixed inset-0 opacity-40"
            style={{
              backgroundImage: `linear-gradient(${theme.primary}08 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}08 1px, transparent 1px)`,
              backgroundSize: "48px 48px"
            }}
          />

          {/* 상단 고정 바 */}
          <header
            className="sticky top-0 z-20 border-b backdrop-blur-md"
            style={{
              borderColor: `${theme.primary}22`,
              background: `${theme.bg}d9`
            }}
          >
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-black text-white/60 transition hover:text-white"
                  style={{borderColor: `${theme.primary}30`}}
                  onClick={onClose}
                  type="button"
                >
                  ← 목록
                </button>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{background: theme.primary}}
                />
                <span className="truncate font-mono text-sm font-black text-white">
                  {project.title}
                </span>
                <span
                  className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.2em] sm:inline"
                  style={{color: theme.primary}}
                >
                  {CATEGORY_LABEL[theme.category] ?? ""}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {typeof index === "number" && typeof total === "number" ? (
                  <span className="hidden font-mono text-[11px] font-bold text-white/35 sm:inline">
                    {index + 1} / {total}
                  </span>
                ) : null}
                {onPrev ? (
                  <button
                    className="rounded-lg border px-2.5 py-1.5 font-mono text-xs font-black text-white/60 transition hover:text-white"
                    style={{borderColor: `${theme.primary}30`}}
                    onClick={onPrev}
                    type="button"
                    aria-label="이전 프로젝트"
                  >
                    ‹
                  </button>
                ) : null}
                {onNext ? (
                  <button
                    className="rounded-lg border px-2.5 py-1.5 font-mono text-xs font-black text-white/60 transition hover:text-white"
                    style={{borderColor: `${theme.primary}30`}}
                    onClick={onNext}
                    type="button"
                    aria-label="다음 프로젝트"
                  >
                    ›
                  </button>
                ) : null}
              </div>
            </div>
          </header>

          <main className="relative z-10 mx-auto max-w-5xl px-6 pb-32">
            {/* ═══════════ HERO ═══════════ */}
            <section className="pt-10 md:pt-14">
              <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                {/* 좌: 타이틀 + 메타 + CTA */}
                <div>
                  <p
                    className="font-mono text-[11px] font-black uppercase tracking-[0.3em]"
                    style={{color: theme.primary}}
                  >
                    {">"} {data.tagline}
                  </p>
                  <h1 className="mt-3 text-5xl font-black leading-tight text-white md:text-6xl">
                    {project.title}
                  </h1>
                  <p className="mt-4 max-w-xl text-base leading-7 text-white/60">
                    {project.description}
                  </p>

                  {/* 메타 (역할/기간/팀/스택) */}
                  <div
                    className="mt-6 rounded-xl border p-4"
                    style={{borderColor: `${theme.primary}20`}}
                  >
                    {data.meta.map(m => (
                      <div
                        key={m.label}
                        className="flex gap-3 border-b py-2 last:border-0"
                        style={{borderColor: `${theme.primary}10`}}
                      >
                        <span className="w-12 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wide text-white/35">
                          {m.label}
                        </span>
                        <span className="text-[13px] leading-6 text-white/80">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA: GitHub(실제) + 데모(슬롯) */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    {project.links.map(link => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg px-5 py-2.5 font-mono text-sm font-black transition hover:brightness-110"
                        style={{background: theme.primary, color: theme.bg}}
                      >
                        {link.label} ↗
                      </a>
                    ))}
                    <span
                      className="rounded-lg border border-dashed px-5 py-2.5 font-mono text-sm font-bold text-white/35"
                      style={{borderColor: `${theme.primary}40`}}
                      title="배포/데모 링크를 나중에 넣는 자리"
                    >
                      ▶ 라이브 데모 · 링크 추가 예정
                    </span>
                  </div>
                </div>

                {/* 우: TL;DR (30초 요약) — 스캔 핵심 */}
                <div
                  className="overflow-hidden rounded-2xl border"
                  style={{
                    borderColor: `${theme.primary}40`,
                    background: `${theme.primary}0a`
                  }}
                >
                  <div
                    className="flex items-center gap-2 border-b px-4 py-2.5"
                    style={{borderColor: `${theme.primary}20`}}
                  >
                    <span
                      className="font-mono text-[10px] font-black uppercase tracking-[0.25em]"
                      style={{color: theme.primary}}
                    >
                      ★ TL;DR · 30초 요약
                    </span>
                  </div>
                  <div className="p-4">
                    {data.tldr.map(r => (
                      <div key={r.k} className="flex gap-3 py-2">
                        <span
                          className="w-14 shrink-0 font-mono text-[12px] font-black"
                          style={{color: theme.accent}}
                        >
                          {r.k}
                        </span>
                        <span className="text-[13px] leading-6 text-white/85">
                          {r.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 임팩트 타일 */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {data.impact.map(s => (
                  <div
                    key={s.l}
                    className="rounded-xl border p-4 text-center"
                    style={{borderColor: `${theme.primary}22`}}
                  >
                    <CountUp
                      value={s.n}
                      className="font-mono text-2xl font-black md:text-3xl"
                      style={{color: theme.primary}}
                    />
                    <p className="mt-1 text-[11px] leading-4 text-white/50">
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>

              {/* 대표 이미지 슬롯 */}
              {data.heroImage ? (
                <div className="mt-6">
                  <ImageSlot theme={theme} spec={data.heroImage} />
                </div>
              ) : null}
            </section>

            {/* ═══════════ 01 문제 ═══════════ */}
            <section className="pt-16">
              <Reveal>
                <SectionHead
                  index="01"
                  ko="문제 정의"
                  en="Problem"
                  theme={theme}
                />
              </Reveal>
              <div className="grid items-start gap-6 lg:grid-cols-2">
                <Reveal>
                  <p className="text-base leading-8 text-white/85">
                    {data.problem}
                  </p>
                  <div
                    className="mt-5 rounded-xl border-l-2 p-4"
                    style={{
                      borderColor: theme.primary,
                      background: `${theme.primary}08`
                    }}
                  >
                    <p
                      className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.2em]"
                      style={{color: theme.primary}}
                    >
                      가설
                    </p>
                    <p className="text-sm leading-7 text-white/80">
                      {data.hypothesis}
                    </p>
                  </div>
                </Reveal>
                {data.research.quotes.length > 0 ? (
                  <Reveal delay={0.05}>
                    <div className="flex flex-col gap-2.5">
                      {data.research.quotes.map(q => (
                        <div
                          key={q.who}
                          className="rounded-lg border-l-2 px-4 py-3"
                          style={{
                            borderColor: theme.primary,
                            background: `${theme.primary}08`
                          }}
                        >
                          <p className="text-sm leading-7 text-white/80">
                            “{q.q}”
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-white/40">
                            — {q.who}
                          </p>
                        </div>
                      ))}
                      {data.research.stat ? (
                        <div
                          className="flex items-center gap-3 rounded-lg border px-4 py-3"
                          style={{borderColor: `${theme.primary}22`}}
                        >
                          <CountUp
                            value={data.research.stat.n}
                            className="font-mono text-2xl font-black"
                            style={{color: theme.primary}}
                          />
                          <span className="text-sm text-white/65">
                            {data.research.stat.l}
                          </span>
                        </div>
                      ) : null}
                      {data.problemShot ? (
                        <ImageSlot theme={theme} spec={data.problemShot} />
                      ) : null}
                    </div>
                  </Reveal>
                ) : null}
              </div>
            </section>

            {/* ═══════════ 02 접근 & 설계 ═══════════ */}
            <section className="pt-16">
              <Reveal>
                <SectionHead
                  index="02"
                  ko="접근 & 설계"
                  en="Approach"
                  theme={theme}
                />
              </Reveal>
              {data.process.length > 0 ? (
                <Reveal>
                  <div className="mb-6 flex items-center gap-1 overflow-x-auto pb-1">
                    {data.process.map((s, i) => (
                      <div key={s.t} className="flex items-center">
                        <div
                          className="flex flex-col items-center rounded-lg border px-3 py-2"
                          style={{
                            borderColor: `${theme.primary}25`,
                            background: `${theme.primary}08`
                          }}
                        >
                          <span className="whitespace-nowrap font-mono text-[12px] font-black text-white">
                            {s.t}
                          </span>
                          <span className="font-mono text-[9px] text-white/40">
                            {s.d}
                          </span>
                        </div>
                        {i < data.process.length - 1 ? (
                          <span
                            className="mx-1 font-mono text-xs"
                            style={{color: `${theme.primary}88`}}
                          >
                            →
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Reveal>
              ) : null}
              <div className="grid items-start gap-6 lg:grid-cols-2">
                <Reveal>
                  <p
                    className="mb-3 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{color: theme.primary}}
                  >
                    {">"} 아키텍처
                  </p>
                  <ArchFlow theme={theme} layers={data.architecture} />
                </Reveal>
                <Reveal delay={0.05}>
                  <p
                    className="mb-3 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{color: theme.primary}}
                  >
                    {">"} 기술 의사결정 · 왜 이걸 골랐나
                  </p>
                  <DecisionTable theme={theme} rows={data.decisions} />
                </Reveal>
              </div>
            </section>

            {/* ═══════════ 03 핵심 구현 ═══════════ */}
            <section className="pt-16">
              <Reveal>
                <SectionHead
                  index="03"
                  ko="핵심 구현"
                  en="Implementation"
                  theme={theme}
                />
              </Reveal>
              {data.coreCode.length > 0 ? (
                <Reveal>
                  <div className="grid gap-3 xl:grid-cols-2">
                    {data.coreCode.map(c => (
                      <CodeBlock key={c.filename} theme={theme} spec={c} />
                    ))}
                  </div>
                </Reveal>
              ) : null}
              {data.challenges.length > 0 ? (
                <Reveal delay={0.05}>
                  <p
                    className="mb-3 mt-8 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{color: theme.primary}}
                  >
                    {">"} 가장 어려웠던 문제 · Troubleshooting
                  </p>
                  <div className="grid gap-3 xl:grid-cols-2">
                    {data.challenges.map((c, i) => (
                      <ChallengeCard
                        key={c.title}
                        theme={theme}
                        index={i + 1}
                        c={c}
                      />
                    ))}
                  </div>
                </Reveal>
              ) : null}
            </section>

            {/* ═══════════ 04 결과 & 회고 ═══════════ */}
            <section className="pt-16">
              <Reveal>
                <SectionHead
                  index="04"
                  ko="결과 & 회고"
                  en="Result"
                  theme={theme}
                />
              </Reveal>

              {data.resultScreens.length > 0 ? (
                <Reveal>
                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    {data.resultScreens.map(s => (
                      <MockScreen key={s.title} theme={theme} spec={s} />
                    ))}
                  </div>
                </Reveal>
              ) : null}

              {data.gallery && data.gallery.length > 0 ? (
                <Reveal>
                  <p
                    className="mb-3 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{color: theme.primary}}
                  >
                    {">"} 스크린샷 (이미지 넣는 자리)
                  </p>
                  <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {data.gallery.map(g => (
                      <ImageSlot key={g.label} theme={theme} spec={g} />
                    ))}
                  </div>
                </Reveal>
              ) : null}

              {/* 성과 지표 */}
              <Reveal>
                <p
                  className="mb-3 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
                  style={{color: theme.primary}}
                >
                  {">"} 성과 지표
                </p>
                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {data.metrics.map(m => (
                    <div
                      key={m.l}
                      className="rounded-xl border p-4"
                      style={{borderColor: `${theme.primary}22`}}
                    >
                      <CountUp
                        value={m.n}
                        className="font-mono text-xl font-black"
                        style={{color: theme.primary}}
                      />
                      <p className="mt-1 text-[11px] leading-4 text-white/50">
                        {m.l}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <div className="grid items-start gap-6 lg:grid-cols-2">
                {/* KPT */}
                <Reveal>
                  <p
                    className="mb-3 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{color: theme.primary}}
                  >
                    {">"} 회고 · KPT
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        ["Keep", theme.primary, data.kpt.keep],
                        ["Problem", "#f87171", data.kpt.problem],
                        ["Try", "#fbbf24", data.kpt.try]
                      ] as const
                    ).map(([k, c, items]) => (
                      <div
                        key={k}
                        className="rounded-xl border p-3"
                        style={{borderColor: `${theme.primary}1a`}}
                      >
                        <p
                          className="mb-2 font-mono text-[11px] font-black uppercase tracking-wide"
                          style={{color: c}}
                        >
                          {k}
                        </p>
                        {items.map(it => (
                          <div
                            key={it}
                            className="mb-1.5 flex items-start gap-2"
                          >
                            <span
                              className="mt-1 h-1 w-1 shrink-0 rounded-full"
                              style={{background: c}}
                            />
                            <span className="text-[12px] leading-5 text-white/65">
                              {it}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </Reveal>

                {/* 배운 점 + 기술 */}
                <Reveal delay={0.05}>
                  <p
                    className="mb-3 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{color: theme.primary}}
                  >
                    {">"} 배운 점
                  </p>
                  <div
                    className="rounded-xl border-l-2 p-4"
                    style={{
                      borderColor: `${theme.primary}88`,
                      background: `${theme.primary}08`
                    }}
                  >
                    <p className="text-sm leading-7 text-white/75">
                      {data.learning}
                    </p>
                  </div>
                  <p
                    className="mb-3 mt-6 font-mono text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{color: theme.primary}}
                  >
                    {">"} 사용 기술
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.tech.map(t => (
                      <TechChip key={t} label={t} theme={theme} />
                    ))}
                  </div>
                </Reveal>
              </div>
            </section>

            {/* ═══════════ 푸터 ═══════════ */}
            <footer
              className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t pt-8"
              style={{borderColor: `${theme.primary}20`}}
            >
              <div className="flex flex-wrap gap-3">
                {project.links.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg px-6 py-3 font-mono text-sm font-black transition hover:brightness-110"
                    style={{background: theme.primary, color: theme.bg}}
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
              {onNext ? (
                <button
                  className="rounded-lg border px-6 py-3 font-mono text-sm font-black text-white/70 transition hover:text-white"
                  style={{borderColor: `${theme.primary}40`}}
                  onClick={onNext}
                  type="button"
                >
                  다음 프로젝트 →
                </button>
              ) : null}
            </footer>
          </main>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
