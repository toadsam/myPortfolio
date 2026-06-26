"use client";

import dynamic from "next/dynamic";
import {useRef, useState} from "react";
import {DialogueBox} from "@/components/ui/DialogueBox";
import {EnterConfirmDialog} from "@/components/ui/EnterConfirmDialog";
import {Header} from "@/components/ui/Header";
import {InfoPanel} from "@/components/ui/InfoPanel";
import {IntroOverlay} from "@/components/ui/IntroOverlay";
import {SceneTransition} from "@/components/ui/SceneTransition";
import {SectionTabs} from "@/components/ui/SectionTabs";
import {villageBuildings} from "@/lib/constants";
import type {ExplorationMode, NPCData, SectionId} from "@/types/portfolio";

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

const InteriorScene = dynamic(
  () => import("@/components/interior/InteriorScene").then((m) => m.InteriorScene),
  {ssr: false}
);

const FADE_DURATION = 480;

export function AIPortfolioVillage() {
  const [activeSection, setActiveSection] = useState<SectionId>("intro");
  const [selectedNpc, setSelectedNpc] = useState<NPCData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>("click");

  const [pendingBuildingId, setPendingBuildingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"village" | "interior">("village");
  const [interiorSectionId, setInteriorSectionId] = useState<SectionId | null>(null);
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function startExploring(mode: ExplorationMode) {
    setShowIntro(false);
    setExplorationMode(mode);
    setActiveSection("intro");
    setIsPanelOpen(mode === "click");
  }

  function handleRequestEnter(buildingId: string) {
    const building = villageBuildings.find((b) => b.id === buildingId);
    if (!building || building.sectionId === "intro") {
      openSection(building?.sectionId ?? "intro");
      return;
    }
    setPendingBuildingId(buildingId);
  }

  function handleCancelEnter() {
    setPendingBuildingId(null);
  }

  function handleConfirmEnter() {
    const building = villageBuildings.find((b) => b.id === pendingBuildingId);
    if (!building) return;
    const sectionId = building.sectionId;

    setPendingBuildingId(null);
    setIsPanelOpen(false);
    setSelectedNpc(null);

    setShowTransitionOverlay(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setInteriorSectionId(sectionId);
      setViewMode("interior");
      setShowTransitionOverlay(false);
    }, FADE_DURATION);
  }

  function handleExitInterior() {
    setShowTransitionOverlay(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setInteriorSectionId(null);
      setViewMode("village");
      setShowTransitionOverlay(false);
    }, FADE_DURATION);
  }

  return (
    <main className="min-h-screen bg-[#f7edcf] pb-24 text-[#1f2a24] md:pb-0">
      {viewMode === "village" ? (
        <>
          <Header activeSection={activeSection} onSelectSection={openSection} />
          <section
            className={
              isPanelOpen
                ? "relative pt-[65px] transition-[padding] duration-300 md:pr-[460px]"
                : "relative pt-[65px] transition-[padding] duration-300"
            }
          >
            <VillageScene
              activeNpcId={selectedNpc?.id}
              activeSection={activeSection}
              explorationMode={explorationMode}
              isIntro={showIntro}
              onRequestEnter={handleRequestEnter}
              onSelectNpc={openNpc}
              onSelectSection={openSection}
            />
            {showIntro ? <IntroOverlay onStart={startExploring} /> : null}
          </section>
          <InfoPanel activeSection={activeSection} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
          <DialogueBox npc={selectedNpc} onClose={() => setSelectedNpc(null)} onOpenSection={openSection} />
          <SectionTabs activeSection={activeSection} onSelectSection={openSection} />
        </>
      ) : null}

      {viewMode === "interior" && interiorSectionId ? (
        <InteriorScene sectionId={interiorSectionId} onBack={handleExitInterior} />
      ) : null}

      <EnterConfirmDialog
        buildingId={pendingBuildingId}
        onCancel={handleCancelEnter}
        onConfirm={handleConfirmEnter}
      />
      <SceneTransition active={showTransitionOverlay} />
    </main>
  );
}
