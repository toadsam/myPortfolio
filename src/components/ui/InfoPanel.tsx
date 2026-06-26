"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";
import {experienceItems} from "@/data/experience";
import {portfolioLinks} from "@/data/links";
import {projects} from "@/data/projects";
import {skills} from "@/data/skills";
import {sectionMeta} from "@/lib/constants";
import type {ProjectData, SectionId} from "@/types/portfolio";
import {ProjectCard} from "./ProjectCard";
import {ProjectDetail} from "./ProjectDetail";

interface InfoPanelProps {
  activeSection: SectionId;
  /** 건물 클릭 시 바로 열어줄 콘텐츠 id (projectId / 스킬그룹 / 경험제목) */
  activeContentId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_COLORS: Record<string, string> = {
  intro: "#00d4ff",
  projects: "#00d4ff",
  github: "#00ff88",
  experience: "#aa44ff",
  contact: "#ff6600",
};

const stagger = {
  hidden: {},
  visible: {transition: {staggerChildren: 0.07}},
};

const fadeUp = {
  hidden: {opacity: 0, y: 14},
  visible: {opacity: 1, y: 0, transition: {duration: 0.4, ease: [0.22, 1, 0.36, 1] as const}},
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
          {/* 상단 액센트 라인 */}
          <motion.div
            animate={{scaleX: 1}}
            className="absolute left-0 top-0 h-[2px] w-full origin-left"
            initial={{scaleX: 0}}
            style={{background: `linear-gradient(to right, ${color}, transparent)`}}
            transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1}}
          />

          {/* 헤더 카드 */}
          <motion.div
            animate={{opacity: 1, y: 0}}
            className="mb-5 rounded-xl border bg-[#0a1525] p-5"
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
                className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs font-bold text-white/40 transition hover:border-white/25 hover:text-white/70"
                onClick={onClose}
                type="button"
                whileHover={{scale: 1.04}}
                whileTap={{scale: 0.96}}
              >
                ✕ Close
              </motion.button>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/50">{section.description}</p>
          </motion.div>

          <motion.div animate="visible" initial="hidden" variants={stagger}>
            {activeSection === "intro" && <IntroPanel color={color} />}
            {activeSection === "projects" && <ProjectsPanel color={color} initialProjectId={activeContentId} />}
            {activeSection === "github" && <SkillsPanel color={color} initialGroup={activeContentId} />}
            {activeSection === "experience" && <ExperiencePanel color={color} highlightTitle={activeContentId} />}
            {activeSection === "contact" && <ContactPanel color={color} />}
          </motion.div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function Card({children, color, className = ""}: {children: React.ReactNode; color: string; className?: string}) {
  return (
    <motion.div
      className={`rounded-xl border bg-[#0a1525] p-5 ${className}`}
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
          코드로 이루어진 도시에서 프로젝트와 경험을 탐험하세요. 각 건물은 포트폴리오 섹션을 의미하고,
          NPC는 각 공간의 내용을 안내합니다.
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {[
          {label: "3D Interactive", icon: "◈"},
          {label: "AI NPC", icon: "◎"},
          {label: "Real-time Data", icon: "⬡"},
          {label: "Fullstack", icon: "◆"},
        ].map((item) => (
          <motion.span
            className="flex items-center gap-2 rounded-lg border border-white/8 bg-[#0a1525] px-3 py-3 font-mono text-sm font-black text-white/70"
            key={item.label}
            variants={fadeUp}
            whileHover={{borderColor: `${color}50`, color: color, x: 2}}
            transition={{duration: 0.15}}
          >
            <span style={{color}}>{item.icon}</span>
            {item.label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function ProjectsPanel({color, initialProjectId}: {color: string; initialProjectId?: string}) {
  const initial = initialProjectId ? projects.find((p) => p.id === initialProjectId) ?? null : null;
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(initial);

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="grid gap-4">
      <Card color={color}>
        <h3 className="font-black text-white">대표 프로젝트</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          각 프로젝트 건물을 클릭하면 바로 상세 내용을 볼 수 있습니다.
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
        <h3 className="font-black text-white">기술 스택과 코드 기록</h3>
        <p className="mt-2 text-sm leading-6 text-white/55">
          프론트엔드, 3D, 백엔드, 게임/XR 경험을 정리했습니다.
        </p>
        <motion.a
          className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.12em] text-white transition"
          href="https://github.com/toadsam"
          rel="noreferrer"
          style={{borderColor: `${color}50`, background: `${color}18`, color}}
          target="_blank"
          whileHover={{background: `${color}30`, boxShadow: `0 0 14px ${color}30`}}
          whileTap={{scale: 0.97}}
        >
          ↗ GitHub
        </motion.a>
      </Card>

      {Object.entries(groups).map(([group, groupSkills]) => {
        const isOpen = openGroup === group;
        return (
          <motion.section
            className="overflow-hidden rounded-xl border bg-[#0a1525]"
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
                <motion.span
                  animate={{rotate: isOpen ? 180 : 0}}
                  className="text-xs"
                  style={{color}}
                  transition={{duration: 0.25}}
                >▼</motion.span>
              </span>
            </motion.button>
            <AnimatePresence>
              {isOpen && (
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
                        <span className="text-white/30"> · </span>
                        {skill.description}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
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
      {experienceItems.map((item, i) => {
        const isHighlighted = highlightTitle === item.title;
        return (
        <motion.article
          className="rounded-xl border bg-[#0a1525] p-5 transition"
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
              {i + 1}
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

function ContactPanel({color}: {color: string}) {
  return (
    <div className="grid gap-4">
      <Card color={color}>
        <p className="text-sm leading-7 text-white/60">
          다음 프로젝트, 인턴십, 협업 제안은 아래 링크로 연락할 수 있습니다.
        </p>
      </Card>
      <div className="grid gap-2">
        {portfolioLinks.map((link, i) => {
          const linkColors = ["#00d4ff", "#00ff88", "#ff6600"];
          const lc = linkColors[i % linkColors.length] ?? color;
          return (
            <motion.a
              className="flex items-center justify-between gap-4 rounded-xl border bg-[#0a1525] px-4 py-4 text-sm font-bold text-white transition"
              href={link.href}
              key={link.label}
              rel="noreferrer"
              style={{borderColor: "rgba(255,255,255,0.06)", borderLeft: `3px solid ${lc}`}}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              variants={fadeUp}
              whileHover={{borderColor: `${lc}50`, boxShadow: `0 0 16px ${lc}14`, x: 3}}
              whileTap={{scale: 0.98}}
            >
              <span className="font-black text-white">{link.label}</span>
              <span className="truncate font-mono text-xs" style={{color: lc}}>{link.value} ↗</span>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
