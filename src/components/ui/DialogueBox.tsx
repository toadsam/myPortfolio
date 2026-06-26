"use client";

import {AnimatePresence, motion} from "framer-motion";
import {sectionMeta} from "@/lib/constants";
import type {NPCData, SectionId} from "@/types/portfolio";

interface DialogueBoxProps {
  npc: NPCData | null;
  onClose: () => void;
  onOpenSection: (sectionId: SectionId) => void;
}

export function DialogueBox({npc, onClose, onOpenSection}: DialogueBoxProps) {
  const section = npc ? sectionMeta.find((item) => item.id === npc.sectionId) : null;

  return (
    <AnimatePresence>
      {npc ? (
        <motion.aside
          animate={{opacity: 1, y: 0}}
          className="fixed bottom-24 left-4 z-30 max-w-[calc(100vw-32px)] rounded-xl border border-[#d7c184] bg-[#fffdf6] p-4 text-[#1f2a24] shadow-panel md:bottom-6 md:left-6 md:w-[430px] md:p-5"
          exit={{opacity: 0, y: 18}}
          initial={{opacity: 0, y: 18}}
          role="dialog"
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#57965a]">{npc.location}</p>
              <h2 className="mt-1 text-lg font-black">{npc.name}</h2>
              <p className="text-sm font-semibold text-[#6d725e]">{npc.role}</p>
            </div>
            <button className="rounded-lg border border-[#d7c184] px-2 py-1 text-xs font-bold text-[#68715e] hover:bg-[#f4e9c7]" onClick={onClose} type="button">
              Close
            </button>
          </div>
          <p className="leading-7 text-[#38443a]">{npc.dialogue}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-lg border border-[#5f9f4f] bg-[#5f9f4f] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#4f8d42]"
              onClick={() => onOpenSection(npc.sectionId)}
              type="button"
            >
              Open {section?.navLabel || "Section"}
            </button>
            <button
              className="rounded-lg border border-[#d7c184] bg-[#fff7df] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#5d644f] transition hover:bg-[#f4e9c7]"
              onClick={onClose}
              type="button"
            >
              Keep Exploring
            </button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
