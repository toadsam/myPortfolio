"use client";

import {motion} from "framer-motion";
import {useMemo, useState} from "react";
import {experienceItems} from "@/data/experience";
import {portfolioLinks} from "@/data/links";
import {projects} from "@/data/projects";
import {skills} from "@/data/skills";
import type {ProjectData, SkillData} from "@/types/portfolio";
import {ProjectViewer} from "./ProjectViewer";

// ─── 카테고리 매핑 (프로젝트 → 색/라벨) ────────────────────────────────────────

const PROJECT_ACCENT: Record<string, string> = {
  mywave: "#00d4ff",
  mystock: "#38bdf8",
  festflow: "#fbbf24",
  "sign-language": "#7eb8ff",
  aclub: "#c084fc",
  "ajou-adventure": "#a3e635",
  ajouchong: "#fb7185",
  muscleup: "#f472b6",
  darklab: "#ef4444",
  tserof: "#34d399",
};

const SKILL_GROUP_ORDER: SkillData["group"][] = [
  "Frontend",
  "Backend",
  "3D / Motion",
  "Game / XR",
  "Workflow",
];

const SKILL_GROUP_META: Record<SkillData["group"], {icon: string; color: string}> = {
  Frontend: {icon: "◈", color: "#00d4ff"},
  Backend: {icon: "⬢", color: "#34d399"},
  "3D / Motion": {icon: "◎", color: "#a78bfa"},
  "Game / XR": {icon: "✦", color: "#fbbf24"},
  Workflow: {icon: "⬡", color: "#fb7185"},
};

// ─── 섹션 헤더 ────────────────────────────────────────────────────────────────

function SectionTitle({index, label, en}: {index: string; label: string; en: string}) {
  return (
    <div className="mb-8 flex items-baseline gap-4">
      <span className="font-mono text-sm font-black text-[#00d4ff]/50">{index}</span>
      <div>
        <h2 className="text-2xl font-black text-white md:text-3xl">{label}</h2>
        <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-[0.3em] text-white/30">
          {en}
        </p>
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

interface Props {
  onEnterVillage: () => void;
}

export function ResumeMode({onEnterVillage}: Props) {
  const [selected, setSelected] = useState<ProjectData | null>(null);

  const grouped = useMemo(() => {
    return SKILL_GROUP_ORDER.map((group) => ({
      group,
      items: skills.filter((s) => s.group === group),
    })).filter((g) => g.items.length > 0);
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040608] text-white">
      {/* 배경 그리드 */}
      <div
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,180,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* 상단 바 */}
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#040608]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <span className="font-mono text-xs font-black uppercase tracking-[0.25em] text-[#00d4ff]">
            {">"} Resume
          </span>
          <button
            className="rounded-lg border border-[#00d4ff]/35 bg-[#00d4ff]/10 px-4 py-2 font-mono text-xs font-black text-[#00d4ff] transition hover:bg-[#00d4ff]/20"
            onClick={onEnterVillage}
            type="button"
          >
            🏘️ 3D 마을 탐험 →
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-6 pb-28">
        {/* ── 히어로 ── */}
        <motion.section
          className="py-16 md:py-20"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-[#00d4ff]">
            {">"} Fullstack · 3D · Game / XR Developer
          </p>
          <h1 className="mt-4 text-6xl font-black leading-none text-white md:text-8xl">정재훈</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60 md:text-xl">
            웹앱부터 실시간 서비스, 게임까지 직접 기획하고 풀스택으로 구현합니다.
            <br className="hidden md:block" />
            아이디어를 빠르게 작동하는 프로토타입으로 만드는 것을 좋아합니다.
          </p>

          {/* 연락처 */}
          <div className="mt-8 flex flex-wrap gap-3">
            {portfolioLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 transition hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/8"
              >
                <span className="font-mono text-xs font-black uppercase tracking-[0.15em] text-white/35 group-hover:text-[#00d4ff]">
                  {link.label}
                </span>
                <span className="font-mono text-sm font-bold text-white/75">{link.value}</span>
              </a>
            ))}
          </div>

          {/* 통계 */}
          <div className="mt-10 flex flex-wrap gap-8">
            {[
              {n: projects.length, l: "Projects"},
              {n: skills.length, l: "Skills"},
              {n: "10+", l: "Tech Stacks"},
            ].map((s) => (
              <div key={s.l}>
                <p className="font-mono text-4xl font-black text-[#00d4ff]">{s.n}</p>
                <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── 스킬 ── */}
        <section className="border-t border-white/8 py-16">
          <SectionTitle index="01" label="기술 스택" en="Skills" />
          <div className="grid gap-5 md:grid-cols-2">
            {grouped.map(({group, items}) => {
              const meta = SKILL_GROUP_META[group];
              return (
                <motion.div
                  key={group}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
                  initial={{opacity: 0, y: 16}}
                  whileInView={{opacity: 1, y: 0}}
                  viewport={{once: true, margin: "-60px"}}
                  transition={{duration: 0.4}}
                >
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="text-lg" style={{color: meta.color}}>
                      {meta.icon}
                    </span>
                    <h3 className="font-mono text-sm font-black uppercase tracking-[0.15em] text-white">
                      {group}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((s) => (
                      <span
                        key={s.name}
                        className="rounded-lg border px-3 py-1.5 font-mono text-sm font-bold"
                        style={{
                          borderColor: `${meta.color}30`,
                          color: meta.color,
                          background: `${meta.color}0d`,
                        }}
                        title={s.description}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── 프로젝트 ── */}
        <section className="border-t border-white/8 py-16">
          <SectionTitle index="02" label="프로젝트" en="Projects" />
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p, i) => {
              const accent = PROJECT_ACCENT[p.id] ?? "#00d4ff";
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p)}
                  className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-left transition-all hover:border-white/20"
                  initial={{opacity: 0, y: 18}}
                  whileInView={{opacity: 1, y: 0}}
                  viewport={{once: true, margin: "-40px"}}
                  transition={{duration: 0.35, delay: (i % 2) * 0.05}}
                  whileHover={{y: -3}}
                >
                  {/* 좌측 컬러바 */}
                  <span
                    className="absolute left-0 top-0 h-full w-1 transition-all group-hover:w-1.5"
                    style={{background: accent}}
                  />
                  {/* hover 글로우 */}
                  <span
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                    style={{background: `${accent}25`}}
                  />
                  <div className="relative pl-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white">{p.title}</h3>
                      <span
                        className="font-mono text-xs font-black opacity-0 transition group-hover:opacity-100"
                        style={{color: accent}}
                      >
                        자세히 →
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-white/55">{p.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tech.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold"
                          style={{borderColor: `${accent}30`, color: `${accent}cc`}}
                        >
                          {t}
                        </span>
                      ))}
                      {p.tech.length > 4 ? (
                        <span className="rounded-md px-2 py-0.5 font-mono text-[11px] font-bold text-white/30">
                          +{p.tech.length - 4}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── 경험 ── */}
        <section className="border-t border-white/8 py-16">
          <SectionTitle index="03" label="경험" en="Experience" />
          <div className="relative ml-2 flex flex-col">
            <div className="absolute left-[5px] top-2 h-[calc(100%-16px)] w-px bg-gradient-to-b from-[#00d4ff]/50 to-[#00d4ff]/5" />
            {experienceItems
              .slice()
              .reverse()
              .map((exp, i) => (
                <motion.div
                  key={`${exp.year}-${exp.title}`}
                  className="relative flex items-start gap-5 pb-8 last:pb-0"
                  initial={{opacity: 0, x: -16}}
                  whileInView={{opacity: 1, x: 0}}
                  viewport={{once: true, margin: "-40px"}}
                  transition={{duration: 0.4, delay: i * 0.08}}
                >
                  <span className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]" />
                  <div>
                    <span className="font-mono text-xs font-black text-[#00d4ff]/70">{exp.year}</span>
                    <h3 className="mt-0.5 text-lg font-black text-white">{exp.title}</h3>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-white/55">
                      {exp.description}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        </section>

        {/* ── 하단 CTA ── */}
        <section className="border-t border-white/8 py-16 text-center">
          <p className="text-lg text-white/50">더 깊이 둘러보고 싶다면</p>
          <button
            className="mt-5 rounded-2xl border border-[#00d4ff]/40 bg-[#00d4ff]/10 px-8 py-4 font-mono text-base font-black text-[#00d4ff] transition hover:bg-[#00d4ff]/20 hover:shadow-[0_0_28px_rgba(0,212,255,0.3)]"
            onClick={onEnterVillage}
            type="button"
          >
            🏘️ 3D 개발자 마을 탐험하기 →
          </button>
        </section>
      </main>

      {/* 프로젝트 상세 */}
      <ProjectViewer project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
