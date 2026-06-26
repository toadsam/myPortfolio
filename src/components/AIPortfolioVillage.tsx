"use client";

import dynamic from "next/dynamic";
import {useState} from "react";
import {DialogueBox} from "@/components/ui/DialogueBox";
import {Header} from "@/components/ui/Header";
import {InfoPanel} from "@/components/ui/InfoPanel";
import {IntroOverlay} from "@/components/ui/IntroOverlay";
import {SectionTabs} from "@/components/ui/SectionTabs";
import type {NPCData, SectionId} from "@/types/portfolio";

const VillageScene = dynamic(
  () => import("@/components/village/VillageScene").then((module) => module.VillageScene),
  {
    loading: () => (
      <div className="grid h-[54vh] min-h-[420px] place-items-center bg-[#d7f0d7] text-sm font-bold uppercase tracking-[0.18em] text-[#507c48] md:h-screen">
        Loading village
      </div>
    ),
    ssr: false
  }
);

export function AIPortfolioVillage() {
  const [activeSection, setActiveSection] = useState<SectionId>("intro");
  const [selectedNpc, setSelectedNpc] = useState<NPCData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  function openSection(sectionId: SectionId) {
    setShowIntro(false);
    setActiveSection(sectionId);
    setSelectedNpc(null);
    setIsPanelOpen(true);
  }

  function openNpc(npc: NPCData) {
    setShowIntro(false);
    setSelectedNpc(npc);
    setActiveSection(npc.sectionId);
  }

  function startExploring() {
    setShowIntro(false);
    setActiveSection("intro");
    setIsPanelOpen(true);
  }

  return (
    <main className="min-h-screen bg-[#f7edcf] pb-24 text-[#1f2a24] md:pb-0">
      <Header activeSection={activeSection} onSelectSection={openSection} />
      <section
        className={
          isPanelOpen
            ? "relative pt-[65px] transition-[padding] duration-300 md:pr-[460px]"
            : "relative pt-[65px] transition-[padding] duration-300"
        }
      >
        <VillageScene activeNpcId={selectedNpc?.id} activeSection={activeSection} onSelectNpc={openNpc} onSelectSection={openSection} />
        {showIntro ? <IntroOverlay onStart={startExploring} /> : null}
      </section>
      <InfoPanel activeSection={activeSection} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      <DialogueBox npc={selectedNpc} onClose={() => setSelectedNpc(null)} onOpenSection={openSection} />
      <SectionTabs activeSection={activeSection} onSelectSection={openSection} />
    </main>
  );
}
