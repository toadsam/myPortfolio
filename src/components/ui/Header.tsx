"use client";

import {sectionMeta} from "@/lib/constants";
import type {SectionId} from "@/types/portfolio";

interface HeaderProps {
  activeSection: SectionId;
  onSelectSection: (sectionId: SectionId) => void;
}

const visibleNav: SectionId[] = ["projects", "github", "experience", "contact"];

export function Header({activeSection, onSelectSection}: HeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#dac88c]/70 bg-[#fff8e5]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <button className="flex min-w-0 items-center gap-3 text-left" onClick={() => onSelectSection("intro")} type="button">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#9bbb70] bg-[#e6f6d5] text-sm font-black text-[#3d7748] shadow-sm">
            AI
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-sm font-black uppercase tracking-[0.2em] text-[#1f2a24]">AI Portfolio Village</strong>
            <small className="hidden text-xs font-semibold text-[#6c735c] sm:block">정재훈의 프로젝트와 경험이 살아 움직이는 3D 포트폴리오</small>
          </span>
        </button>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Portfolio village sections">
          {visibleNav.map((sectionId) => {
            const section = sectionMeta.find((item) => item.id === sectionId);

            if (!section) {
              return null;
            }

            return (
              <button
                className={
                  activeSection === section.id
                    ? "rounded-lg border border-[#78b95d] bg-[#dff4c4] px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#2e6438] shadow-sm"
                    : "rounded-lg border border-transparent px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#68715e] transition hover:border-[#cdbb81] hover:bg-white/70 hover:text-[#1f2a24]"
                }
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                type="button"
              >
                {section.navLabel}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
