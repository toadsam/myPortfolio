"use client";

import dynamic from "next/dynamic";
import {useRef, useState} from "react";
import {useGLTF} from "@react-three/drei";
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
  () => import("@/components/village/VillageScene").then((m) => m.VillageScene),
  {
    loading: () => (
      <div className="grid h-[54vh] min-h-[420px] place-items-center bg-[#050d1a] font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#00d4ff]/60 md:h-screen">
        {">"} Loading Developer's City...
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

// Draco 디코더 경로 설정 (압축된 GLB 로드용)
useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

export function AIPortfolioVillage() {
  const [activeSection, setActiveSection] = useState<SectionId>("intro");
  /** 패널에서 바로 열어줄 콘텐츠 id (projectId / 스킬그룹명 / 경험제목) */
  const [activeContentId, setActiveContentId] = useState<string | undefined>(undefined);
  const [selectedNpc, setSelectedNpc] = useState<NPCData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>("click");

  const [pendingBuildingId, setPendingBuildingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"village" | "interior">("village");
  const [interiorSectionId, setInteriorSectionId] = useState<SectionId | null>(null);
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openSection(sectionId: SectionId, contentId?: string) {
    setShowIntro(false);
    setActiveSection(sectionId);
    setActiveContentId(contentId);
    setSelectedNpc(null);
    setIsPanelOpen(true);
  }

  function openNpc(npc: NPCData) {
    setShowIntro(false);
    setSelectedNpc(npc);
    setActiveSection(npc.sectionId);
    setIsPanelOpen(false);
  }

  function startExploring(mode: ExplorationMode) {
    setShowIntro(false);
    setExplorationMode(mode);
    setActiveSection("intro");
    setIsPanelOpen(mode === "click");
  }

  function handleRequestEnter(buildingId: string) {
    const building = villageBuildings.find((b) => b.id === buildingId);
    if (!building) return;

    // 광장 클릭 → 인트로 패널만 열기 (입장 확인 없이)
    if (building.district === "plaza") {
      openSection("intro");
      return;
    }

    // 나머지 건물은 확인 다이얼로그 표시
    setPendingBuildingId(buildingId);
  }

  function handleCancelEnter() {
    setPendingBuildingId(null);
  }

  function handleConfirmEnter() {
    const building = villageBuildings.find((b) => b.id === pendingBuildingId);
    if (!building) return;

    setPendingBuildingId(null);

    const {district, sectionId, contentId} = building;

    // 프로젝트 / 스킬 / 경험 / 연락처 → 인포패널에서 해당 콘텐츠 직접 오픈
    if (district === "projects") {
      openSection("projects", contentId);
      return;
    }
    if (district === "skills") {
      openSection("github", contentId);
      return;
    }
    if (district === "experience") {
      openSection("experience", contentId);
      return;
    }
    if (district === "contact") {
      openSection("contact");
      return;
    }

    // 혹시 인테리어가 있는 건물은 씬 전환 (추후 확장용)
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
    <main className="min-h-screen bg-[#050d1a] pb-24 text-white md:pb-0">
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
          <InfoPanel
            activeSection={activeSection}
            activeContentId={activeContentId}
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
          />
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
