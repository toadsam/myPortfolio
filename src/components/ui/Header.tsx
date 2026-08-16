"use client";

import {motion} from "framer-motion";
import {sectionMeta} from "@/lib/constants";
import type {SectionId} from "@/types/portfolio";

interface HeaderProps {
  activeSection: SectionId;
  onSelectSection: (sectionId: SectionId) => void;
}

const visibleNav: SectionId[] = [
  "projects",
  "github",
  "study",
  "experience",
  "life",
  "contact"
];

const NAV_COLORS: Record<string, string> = {
  projects: "#00d4ff",
  github: "#00ff88",
  study: "#38bdf8",
  experience: "#aa44ff",
  life: "#fbbf24",
  contact: "#ff6600"
};

export function Header({activeSection, onSelectSection}: HeaderProps) {
  return (
    <motion.header
      animate={{opacity: 1, y: 0}}
      className="fixed left-0 right-0 top-0 z-40 border-b border-[#7a5a38]/40 bg-[#0b1626]/92 backdrop-blur-xl transform-gpu will-change-[backdrop-filter,transform]"
      initial={{opacity: 0, y: -12}}
      transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
    >
      <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <motion.button
          className="flex min-w-0 items-center gap-3 text-left"
          onClick={() => onSelectSection("intro")}
          type="button"
          whileHover={{x: 2}}
          whileTap={{scale: 0.97}}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#ff9d38]/45 bg-[#131f33] text-sm font-black text-[#ff9d38] shadow-[0_0_12px_rgba(255,157,56,0.22)]">
            AI
          </span>
          <span className="min-w-0">
            <strong className="v-panel-title block truncate text-[15px] tracking-[0.06em]">
              Developer&apos;s City
            </strong>
            <small className="hidden text-xs font-semibold text-[#a9bdd6]/70 sm:block">
              정재훈의 3D 포트폴리오
            </small>
          </span>
        </motion.button>

        <nav
          className="hidden items-center gap-2 md:flex"
          aria-label="Portfolio sections"
        >
          {visibleNav.map(sectionId => {
            const section = sectionMeta.find(item => item.id === sectionId);
            if (!section) return null;
            const isActive = activeSection === section.id;
            const color = NAV_COLORS[sectionId] ?? "#00d4ff";

            return (
              <motion.button
                className="relative rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all duration-200"
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                style={{
                  color: isActive ? color : "rgba(169,189,214,0.6)",
                  background: isActive ? `${color}14` : "transparent",
                  border: isActive
                    ? `1px solid ${color}50`
                    : "1px solid transparent",
                  boxShadow: isActive ? `0 0 14px ${color}22` : "none"
                }}
                type="button"
                whileHover={{
                  color,
                  background: `${color}0e`,
                  border: `1px solid ${color}40`,
                  y: -1
                }}
                whileTap={{scale: 0.96}}
              >
                {section.navLabel}
                {isActive ? (
                  <motion.div
                    className="absolute -bottom-[13px] left-0 right-0 h-[2px] rounded-full"
                    layoutId="nav-underline"
                    style={{background: color, boxShadow: `0 0 8px ${color}`}}
                    transition={{type: "spring", stiffness: 380, damping: 30}}
                  />
                ) : null}
              </motion.button>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
