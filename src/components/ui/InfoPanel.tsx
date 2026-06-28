"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useState} from "react";
import type {ReactNode} from "react";
import {experienceItems} from "@/data/experience";
import {portfolioLinks} from "@/data/links";
import {projects} from "@/data/projects";
import {skills} from "@/data/skills";
import {sectionMeta} from "@/lib/constants";
import {fetchCodingTests, fetchCsNotes} from "@/lib/liveApi";
import type {CodingTestLog, CsNote} from "@/types/live";
import type {ProjectData, SectionId} from "@/types/portfolio";
import {ProjectCard} from "./ProjectCard";
import {ProjectDetail} from "./ProjectDetail";

interface InfoPanelProps {
  activeSection: SectionId;
  activeContentId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_COLORS: Record<string, string> = {
  intro: "#00d4ff",
  projects: "#00d4ff",
  github: "#00ff88",
  study: "#38bdf8",
  experience: "#aa44ff",
  contact: "#ff6600"
};

const stagger = {
  hidden: {},
  visible: {transition: {staggerChildren: 0.07}}
};

const fadeUp = {
  hidden: {opacity: 0, y: 14},
  visible: {opacity: 1, y: 0, transition: {duration: 0.4, ease: [0.22, 1, 0.36, 1] as const}}
};

export function InfoPanel({activeSection, activeContentId, isOpen, onClose}: InfoPanelProps) {
  const section = sectionMeta.find((item) => item.id === activeSection) ?? sectionMeta[0]!;
  const color = SECTION_COLORS[activeSection] ?? "#00d4ff";

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          animate={{opacity: 1, x: 0}}
          className="relative z-20 w-full border-t border-[#00d4ff]/15 bg-[#06101e] p-5 shadow-2xl md:fixed md:bottom-0 md:right-0 md:top-[65px] md:max-h-none md:w-[460px] md:overflow-y-auto md:border-l md:border-t-0 md:p-6"
          exit={{opacity: 0, x: 44}}
          initial={{opacity: 0, x: 44}}
          transition={{duration: 0.32, ease: [0.22, 1, 0.36, 1]}}
        >
          <motion.div
            animate={{scaleX: 1}}
            className="absolute left-0 top-0 h-[2px] w-full origin-left"
            initial={{scaleX: 0}}
            style={{background: `linear-gradient(to right, ${color}, transparent)`}}
            transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1}}
          />

          <motion.div
            animate={{opacity: 1, y: 0}}
            className="mb-5 rounded-lg border bg-[#0a1525] p-5"
            initial={{opacity: 0, y: -10}}
            style={{borderColor: `${color}30`}}
            transition={{duration: 0.4, ease: [0.22, 1, 0.36, 1]}}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.22em]" style={{color}}>
                  {">"} {section.label}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">{section.title}</h2>
              </div>
              <motion.button
                className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs font-bold text-white/45 transition hover:border-white/25 hover:text-white/75"
                onClick={onClose}
                type="button"
                whileHover={{scale: 1.04}}
                whileTap={{scale: 0.96}}
              >
                닫기
              </motion.button>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">{section.description}</p>
          </motion.div>

          <motion.div animate="visible" initial="hidden" variants={stagger}>
            {activeSection === "intro" && <IntroPanel color={color} />}
            {activeSection === "projects" && <ProjectsPanel color={color} initialProjectId={activeContentId} />}
            {activeSection === "github" && <SkillsPanel color={color} initialGroup={activeContentId} />}
            {activeSection === "study" && <StudyPanel color={color} initialTab={activeContentId} />}
            {activeSection === "experience" && <ExperiencePanel color={color} highlightTitle={activeContentId} />}
            {activeSection === "contact" && <ContactPanel color={color} />}
          </motion.div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function Card({children, color, className = ""}: {children: ReactNode; color: string; className?: string}) {
  return (
    <motion.div
      className={`rounded-lg border bg-[#0a1525] p-5 ${className}`}
      style={{borderColor: `${color}22`}}
      variants={fadeUp}
      whileHover={{borderColor: `${color}55`, boxShadow: `0 0 18px ${color}12`}}
      transition={{duration: 0.2}}
    >
      {children}
    </motion.div>
  );
}

function IntroPanel({color}: {color: string}) {
  return (
    <div className="grid gap-4">
      <Card color={color}>
        <h3 className="text-lg font-black text-white">정재훈의 Developer's City</h3>
        <p className="mt-3 text-sm leading-7 text-white/60">
          프로젝트, 기술, 경험, 연락처를 하나의 3D 마을로 구성했습니다. 건물은 콘텐츠를 열고,
          NPC는 방문자의 질문에 맞춰 포트폴리오를 설명합니다.
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {["3D Interactive", "AI NPC", "Live Data", "Fullstack"].map((label) => (
          <motion.span
            className="rounded-lg border border-white/8 bg-[#0a1525] px-3 py-3 font-mono text-sm font-black text-white/70"
            key={label}
            variants={fadeUp}
            whileHover={{borderColor: `${color}50`, color, x: 2}}
            transition={{duration: 0.15}}
          >
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function ProjectsPanel({color, initialProjectId}: {color: string; initialProjectId?: string}) {
  const initial = initialProjectId ? projects.find((project) => project.id === initialProjectId) ?? null : null;
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(initial);

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="grid gap-4">
      <Card color={color}>
        <h3 className="font-black text-white">대표 프로젝트</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          목록에서 프로젝트를 열어 자세한 설명을 보거나, 마을에서 프로젝트 건물 안으로 들어가 3D 전시 화면을 볼 수 있습니다.
        </p>
      </Card>
      {projects.map((project) => (
        <motion.div key={project.id} variants={fadeUp}>
          <ProjectCard onOpen={setSelectedProject} project={project} />
        </motion.div>
      ))}
    </div>
  );
}

function SkillsPanel({color, initialGroup}: {color: string; initialGroup?: string}) {
  const [openGroup, setOpenGroup] = useState<string | null>(initialGroup ?? null);
  const groups = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    acc[skill.group] = acc[skill.group] ? acc[skill.group].concat(skill) : [skill];
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      <Card color={color}>
        <h3 className="font-black text-white">기술 스택과 구현 경험</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          프론트엔드, 백엔드, 3D, 게임/XR, 워크플로 경험을 기술 그룹별로 정리했습니다.
        </p>
        <motion.a
          className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.12em] transition"
          href="https://github.com/toadsam"
          rel="noreferrer"
          style={{borderColor: `${color}50`, background: `${color}18`, color}}
          target="_blank"
          whileHover={{background: `${color}30`, boxShadow: `0 0 14px ${color}30`}}
          whileTap={{scale: 0.97}}
        >
          GitHub 열기
        </motion.a>
      </Card>

      {Object.entries(groups).map(([group, groupSkills]) => {
        const isOpen = openGroup === group;
        return (
          <motion.section
            className="overflow-hidden rounded-lg border bg-[#0a1525]"
            key={group}
            style={{borderColor: isOpen ? `${color}40` : "rgba(255,255,255,0.06)"}}
            variants={fadeUp}
          >
            <motion.button
              className="flex w-full items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpenGroup(isOpen ? null : group)}
              type="button"
              whileHover={{background: `${color}08`}}
            >
              <span className="font-black text-white">{group}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-white/30">{groupSkills.length}개</span>
                <motion.span animate={{rotate: isOpen ? 180 : 0}} className="text-xs" style={{color}} transition={{duration: 0.25}}>
                  v
                </motion.span>
              </span>
            </motion.button>
            <AnimatePresence>
              {isOpen ? (
                <motion.div
                  animate={{height: "auto", opacity: 1}}
                  className="overflow-hidden px-5 pb-5"
                  exit={{height: 0, opacity: 0}}
                  initial={{height: 0, opacity: 0}}
                  transition={{duration: 0.3, ease: [0.22, 1, 0.36, 1]}}
                >
                  <div className="mb-3 flex flex-wrap gap-2">
                    {groupSkills.map((skill) => (
                      <span
                        className="rounded-full border px-3 py-1 font-mono text-xs font-black"
                        key={skill.name}
                        style={{borderColor: `${color}40`, color, background: `${color}12`}}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-2">
                    {groupSkills.map((skill) => (
                      <p className="rounded-lg border border-white/6 bg-[#060e1a] p-3 text-sm leading-6 text-white/55" key={skill.name + "-desc"}>
                        <strong style={{color}}>{skill.name}</strong>
                        <span className="text-white/30"> / </span>
                        {skill.description}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.section>
        );
      })}
    </div>
  );
}

function ExperiencePanel({color, highlightTitle}: {color: string; highlightTitle?: string}) {
  return (
    <div className="grid gap-3">
      {experienceItems.map((item, index) => {
        const isHighlighted = highlightTitle === item.title;
        return (
          <motion.article
            className="rounded-lg border bg-[#0a1525] p-5 transition"
            key={item.title}
            style={{borderColor: isHighlighted ? `${color}50` : "rgba(255,255,255,0.06)", boxShadow: isHighlighted ? `0 0 18px ${color}15` : "none"}}
            variants={fadeUp}
            whileHover={{borderColor: `${color}40`, boxShadow: `0 0 18px ${color}10`, x: 2}}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-black"
                style={{background: `${color}18`, color}}
              >
                {index + 1}
              </span>
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em]" style={{color}}>{item.year}</p>
            </div>
            <h3 className="mt-3 font-black text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p>
          </motion.article>
        );
      })}
    </div>
  );
}

function StudyPanel({color, initialTab}: {color: string; initialTab?: string}) {
  const [tab, setTab] = useState<"codingtest" | "cs">(initialTab === "cs" ? "cs" : "codingtest");
  const [codingTests, setCodingTests] = useState<CodingTestLog[] | null>(null);
  const [csNotes, setCsNotes] = useState<CsNote[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    setError(false);
    Promise.all([fetchCodingTests(), fetchCsNotes()])
      .then(([tests, notes]) => {
        if (ignore) return;
        setCodingTests(tests);
        setCsNotes(notes);
      })
      .catch(() => {
        if (!ignore) setError(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const loading = !error && codingTests === null && csNotes === null;

  return (
    <div className="grid gap-4">
      <Card color={color}>
        <h3 className="font-black text-white">학습 기록</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          매일 푼 코딩테스트 풀이와 공부한 CS 전공지식을 기록합니다. 알고리즘 도장의 알고, 지식 서고의 노바에게 물어보면 이 기록을 바탕으로 답해줍니다.
        </p>
        <div className="mt-4 flex gap-2">
          {([
            {id: "codingtest", label: `코딩테스트${codingTests ? ` ${codingTests.length}` : ""}`},
            {id: "cs", label: `CS 전공지식${csNotes ? ` ${csNotes.length}` : ""}`}
          ] as const).map((item) => {
            const active = tab === item.id;
            return (
              <button
                className="rounded-lg border px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.1em] transition"
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setOpenId(null);
                }}
                style={{
                  borderColor: active ? `${color}55` : "rgba(255,255,255,0.08)",
                  background: active ? `${color}18` : "transparent",
                  color: active ? color : "rgba(255,255,255,0.45)"
                }}
                type="button"
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </Card>

      {error ? (
        <Card color={color}>
          <p className="text-sm leading-6 text-white/55">
            학습 기록 서버(FastAPI)에 연결하지 못했습니다. 백엔드를 실행한 뒤 다시 시도해 주세요.
          </p>
        </Card>
      ) : loading ? (
        <Card color={color}>
          <p className="text-sm text-white/45">기록을 불러오는 중...</p>
        </Card>
      ) : tab === "codingtest" ? (
        (codingTests ?? []).length === 0 ? (
          <EmptyStudy color={color} text="아직 기록된 코딩테스트 풀이가 없습니다. /admin에서 푼 문제를 기록하면 여기에 표시됩니다." />
        ) : (
          (codingTests ?? []).map((test) => {
            const key = `ct-${test.id}`;
            const isOpen = openId === key;
            return (
              <motion.article
                className="overflow-hidden rounded-lg border bg-[#0a1525]"
                key={key}
                style={{borderColor: isOpen ? `${color}40` : "rgba(255,255,255,0.06)"}}
                variants={fadeUp}
              >
                <button
                  className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
                  onClick={() => setOpenId(isOpen ? null : key)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block font-black text-white">{test.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-white/45">
                      {[test.platform, test.difficulty, test.language, test.solved_date]
                        .filter(Boolean)
                        .map((meta) => (
                          <span className="rounded border border-white/10 px-1.5 py-0.5" key={meta}>
                            {meta}
                          </span>
                        ))}
                    </span>
                  </span>
                  <span className="text-xs" style={{color}}>{isOpen ? "−" : "+"}</span>
                </button>
                <AnimatePresence>
                  {isOpen ? (
                    <motion.div
                      animate={{height: "auto", opacity: 1}}
                      className="overflow-hidden px-5 pb-5"
                      exit={{height: 0, opacity: 0}}
                      initial={{height: 0, opacity: 0}}
                      transition={{duration: 0.25}}
                    >
                      {test.approach ? (
                        <div className="mb-3">
                          <p className="font-mono text-[10px] font-black uppercase tracking-[0.14em]" style={{color}}>풀이 방법</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/65">{test.approach}</p>
                        </div>
                      ) : null}
                      {test.code ? (
                        <pre className="max-h-72 overflow-auto rounded-lg border border-white/8 bg-[#060e1a] p-3 font-mono text-xs leading-5 text-white/70">
                          {test.code}
                        </pre>
                      ) : null}
                      {test.url ? (
                        <a
                          className="mt-3 inline-block font-mono text-xs font-bold"
                          href={test.url}
                          rel="noreferrer"
                          style={{color}}
                          target="_blank"
                        >
                          문제 링크 열기 →
                        </a>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })
        )
      ) : (csNotes ?? []).length === 0 ? (
        <EmptyStudy color={color} text="아직 기록된 CS 전공지식 노트가 없습니다. /admin에서 공부한 내용을 기록하면 여기에 표시됩니다." />
      ) : (
        (csNotes ?? []).map((note) => {
          const key = `cs-${note.id}`;
          const isOpen = openId === key;
          return (
            <motion.article
              className="overflow-hidden rounded-lg border bg-[#0a1525]"
              key={key}
              style={{borderColor: isOpen ? `${color}40` : "rgba(255,255,255,0.06)"}}
              variants={fadeUp}
            >
              <button
                className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
                onClick={() => setOpenId(isOpen ? null : key)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block font-black text-white">{note.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-white/45">
                    {[note.category, note.study_date].filter(Boolean).map((meta) => (
                      <span className="rounded border border-white/10 px-1.5 py-0.5" key={meta}>
                        {meta}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="text-xs" style={{color}}>{isOpen ? "−" : "+"}</span>
              </button>
              <AnimatePresence>
                {isOpen ? (
                  <motion.div
                    animate={{height: "auto", opacity: 1}}
                    className="overflow-hidden px-5 pb-5"
                    exit={{height: 0, opacity: 0}}
                    initial={{height: 0, opacity: 0}}
                    transition={{duration: 0.25}}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6 text-white/65">{note.content}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.article>
          );
        })
      )}
    </div>
  );
}

function EmptyStudy({color, text}: {color: string; text: string}) {
  return (
    <Card color={color}>
      <p className="text-sm leading-6 text-white/55">{text}</p>
    </Card>
  );
}

function ContactPanel({color}: {color: string}) {
  return (
    <div className="grid gap-4">
      <Card color={color}>
        <p className="text-sm leading-7 text-white/60">
          협업, 인터뷰, 프로젝트 제안은 아래 링크를 통해 연결할 수 있습니다.
        </p>
      </Card>
      <div className="grid gap-2">
        {portfolioLinks.map((link, index) => {
          const linkColors = ["#00d4ff", "#00ff88", "#ff6600"];
          const linkColor = linkColors[index % linkColors.length] ?? color;
          return (
            <motion.a
              className="flex items-center justify-between gap-4 rounded-lg border bg-[#0a1525] px-4 py-4 text-sm font-bold text-white transition"
              href={link.href}
              key={link.label}
              rel="noreferrer"
              style={{borderColor: "rgba(255,255,255,0.06)", borderLeft: `3px solid ${linkColor}`}}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              variants={fadeUp}
              whileHover={{borderColor: `${linkColor}50`, boxShadow: `0 0 16px ${linkColor}14`, x: 3}}
              whileTap={{scale: 0.98}}
            >
              <span className="font-black text-white">{link.label}</span>
              <span className="truncate font-mono text-xs" style={{color: linkColor}}>{link.value} -&gt;</span>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
