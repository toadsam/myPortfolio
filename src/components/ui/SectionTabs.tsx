"use client";

import {sectionMeta} from "@/lib/constants";
import type {SectionId} from "@/types/portfolio";

interface SectionTabsProps {
  activeSection: SectionId;
  onSelectSection: (sectionId: SectionId) => void;
}

export function SectionTabs({activeSection, onSelectSection}: SectionTabsProps) {
  return (
    <div className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-24px)] max-w-3xl -translate-x-1/2 gap-2 overflow-x-auto rounded-xl border border-[#dac88c]/80 bg-[#fff8e5]/92 p-2 shadow-panel backdrop-blur-xl md:hidden">
      {sectionMeta.map((section) => (
        <button
          className={
            activeSection === section.id
              ? "shrink-0 rounded-lg bg-[#dff4c4] px-3 py-2 text-xs font-black text-[#2f6d3e]"
              : "shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-[#68715e]"
          }
          key={section.id}
          onClick={() => onSelectSection(section.id)}
          type="button"
        >
          {section.navLabel}
        </button>
      ))}
    </div>
  );
}
