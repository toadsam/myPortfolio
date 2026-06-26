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
  isOpen: boolean;
  onClose: () => void;
}

export function InfoPanel({activeSection, isOpen, onClose}: InfoPanelProps) {
  const section = sectionMeta.find((item) => item.id === activeSection) || sectionMeta[0];

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          animate={{opacity: 1, x: 0}}
          className="relative z-20 w-full border-t border-[#d6c286] bg-[#fff8e5] p-5 shadow-panel md:fixed md:bottom-0 md:right-0 md:top-[65px] md:max-h-none md:w-[460px] md:overflow-y-auto md:border-l md:border-t-0 md:p-6"
          exit={{opacity: 0, x: 44}}
          initial={{opacity: 0, x: 44}}
          transition={{duration: 0.28, ease: [0.22, 1, 0.36, 1]}}
        >
          <div className="mb-6 rounded-xl border border-[#dfcd99] bg-[#fffdf6] p-5 shadow-[0_10px_34px_rgba(79,72,49,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#5e9b5b]">{section.label}</p>
                <h2 className="mt-2 text-2xl font-black text-[#1f2a24]">{section.title}</h2>
              </div>
              <button className="rounded-lg border border-[#d0bd81] px-2.5 py-1.5 text-xs font-bold text-[#68715e] transition hover:bg-[#f4e9c7]" onClick={onClose} type="button">
                Close
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6a725f]">{section.description}</p>
          </div>

          {activeSection === "intro" ? <IntroPanel /> : null}
          {activeSection === "projects" ? <ProjectsPanel /> : null}
          {activeSection === "github" ? <SkillsPanel /> : null}
          {activeSection === "experience" ? <ExperiencePanel /> : null}
          {activeSection === "contact" ? <ContactPanel /> : null}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function IntroPanel() {
  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-[#d9c58a] bg-[#fffdf6] p-5">
        <h3 className="text-lg font-black text-[#1f2a24]">정재훈의 AI Portfolio Village</h3>
        <p className="mt-3 leading-7 text-[#465044]">
          정재훈의 프로젝트와 경험이 살아 움직이는 AI NPC 포트폴리오 마을입니다. 건물은 포트폴리오 섹션을 의미하고,
          NPC는 각 공간의 내용을 안내합니다.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {["Low-poly 3D", "Company-ready UI", "Clickable NPC", "Data-driven"].map((item) => (
          <span className="rounded-lg border border-[#c7dd9a] bg-[#eef8db] px-3 py-3 font-black text-[#416b3f]" key={item}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProjectsPanel() {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-xl border border-[#d9c58a] bg-[#fffdf6] p-5">
        <h3 className="font-black text-[#1f2a24]">대표 프로젝트</h3>
        <p className="mt-2 text-sm leading-6 text-[#5e6757]">
          각 프로젝트 카드를 열면 문제 정의, 접근 방식, 내 기여, 결과를 상세히 볼 수 있습니다.
        </p>
      </section>
      {projects.map((project) => (
        <ProjectCard key={project.id} onOpen={setSelectedProject} project={project} />
      ))}
    </div>
  );
}

function SkillsPanel() {
  const groups = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    acc[skill.group] = acc[skill.group] ? acc[skill.group].concat(skill) : [skill];
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      <section className="rounded-xl border border-[#d9c58a] bg-[#fffdf6] p-5">
        <h3 className="font-black text-[#1f2a24]">기술 스택과 코드 기록</h3>
        <p className="mt-2 text-sm leading-6 text-[#5e6757]">
          프론트엔드, 3D 인터랙션, 백엔드, 게임/XR 경험을 포트폴리오 마을의 작업실로 묶었습니다.
        </p>
        <a
          className="mt-4 inline-flex rounded-lg border border-[#5f9f4f] bg-[#5f9f4f] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#4f8d42]"
          href="https://github.com/toadsam"
          rel="noreferrer"
          target="_blank"
        >
          Open GitHub
        </a>
      </section>

      {Object.entries(groups).map(([group, groupSkills]) => (
        <section className="rounded-xl border border-[#d9c58a] bg-[#fffdf6] p-5" key={group}>
          <h3 className="font-black text-[#1f2a24]">{group}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {groupSkills.map((skill) => (
              <span className="rounded-full border border-[#c7dd9a] bg-[#eef8db] px-3 py-1.5 text-xs font-black text-[#3f6e35]" key={skill.name}>
                {skill.name}
              </span>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {groupSkills.map((skill) => (
              <p className="rounded-lg border border-[#e7d9ae] bg-white/65 p-3 text-sm leading-6 text-[#5e6757]" key={skill.name + "-desc"}>
                <strong className="text-[#2f6d3e]">{skill.name}</strong> · {skill.description}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ExperiencePanel() {
  return (
    <div className="grid gap-3">
      {experienceItems.map((item) => (
        <article className="rounded-xl border border-[#d9c58a] bg-[#fffdf6] p-5" key={item.title}>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5a9857]">{item.year}</p>
          <h3 className="mt-2 font-black text-[#1f2a24]">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#5e6757]">{item.description}</p>
        </article>
      ))}
    </div>
  );
}

function ContactPanel() {
  return (
    <div className="grid gap-4">
      <p className="rounded-xl border border-[#d9c58a] bg-[#fffdf6] p-5 leading-7 text-[#465044]">
        다음 프로젝트, 인턴십, 협업 제안은 아래 링크로 연락할 수 있습니다.
      </p>
      <div className="grid gap-2">
        {portfolioLinks.map((link) => (
          <a
            className="flex items-center justify-between gap-4 rounded-xl border border-[#d9c58a] bg-[#fffdf6] px-4 py-3 text-sm font-bold text-[#1f2a24] transition hover:border-[#7bbf5f] hover:bg-[#eef8db]"
            href={link.href}
            key={link.label}
            rel="noreferrer"
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
          >
            <span>{link.label}</span>
            <span className="truncate text-[#5a9857]">{link.value}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
