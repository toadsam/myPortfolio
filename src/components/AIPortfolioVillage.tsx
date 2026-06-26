"use client";

import dynamic from "next/dynamic";
import {useEffect, useRef, useState} from "react";
import {useGLTF} from "@react-three/drei";
import {DialogueBox} from "@/components/ui/DialogueBox";
import {EnterConfirmDialog} from "@/components/ui/EnterConfirmDialog";
import {Header} from "@/components/ui/Header";
import {InfoPanel} from "@/components/ui/InfoPanel";
import {IntroOverlay} from "@/components/ui/IntroOverlay";
import {SceneTransition} from "@/components/ui/SceneTransition";
import {SectionTabs} from "@/components/ui/SectionTabs";
import {villageBuildings} from "@/lib/constants";
import {fetchVillageState} from "@/lib/liveApi";
import {getNpcState} from "@/lib/liveState";
import type {VillageState} from "@/types/live";
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

const ProjectInterior = dynamic(
  () => import("@/components/interior/ProjectInterior").then((m) => m.ProjectInterior),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#020d1a]">
        <span className="font-mono text-xs font-black uppercase tracking-[0.25em] text-[#00d4ff]/50">
          {">"} Loading Project...
        </span>
      </div>
    )
  }
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
  const [viewMode, setViewMode] = useState<"village" | "interior" | "project-interior">("village");
  const [interiorSectionId, setInteriorSectionId] = useState<SectionId | null>(null);
  const [interiorProjectId, setInteriorProjectId] = useState<string | null>(null);
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);
  const [villageState, setVillageState] = useState<VillageState | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadVillageState() {
      try {
        const nextState = await fetchVillageState();
        if (!ignore) {
          setVillageState(nextState);
          setLiveError(null);
        }
      } catch {
        if (!ignore) {
          setLiveError("FastAPI backend offline");
        }
      }
    }

    loadVillageState();
    const intervalId = setInterval(loadVillageState, 60000);

    return () => {
      ignore = true;
      clearInterval(intervalId);
    };
  }, []);

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

    // 프로젝트 건물 → 전용 3D 인테리어 씬으로 입장
    if (district === "projects" && contentId) {
      setShowTransitionOverlay(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setInteriorProjectId(contentId);
        setViewMode("project-interior");
        setShowTransitionOverlay(false);
      }, FADE_DURATION);
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
      setInteriorProjectId(null);
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
              villageState={villageState}
            />
            {showIntro ? <IntroOverlay onStart={startExploring} /> : null}
          </section>
          <LiveStatusPanel error={liveError} villageState={villageState} />
          <InfoPanel
            activeSection={activeSection}
            activeContentId={activeContentId}
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
          />
          <DialogueBox
            npc={selectedNpc}
            npcState={selectedNpc ? getNpcState(villageState, selectedNpc.id) : undefined}
            onClose={() => setSelectedNpc(null)}
            onOpenSection={openSection}
          />
          <SectionTabs activeSection={activeSection} onSelectSection={openSection} />
        </>
      ) : null}

      {viewMode === "interior" && interiorSectionId ? (
        <InteriorScene sectionId={interiorSectionId} onBack={handleExitInterior} />
      ) : null}

      {viewMode === "project-interior" && interiorProjectId ? (
        <ProjectInterior projectId={interiorProjectId} onBack={handleExitInterior} />
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

function LiveStatusPanel({error, villageState}: {error: string | null; villageState: VillageState | null}) {
  if (!villageState && !error) return null;

  return (
    <aside className="fixed left-4 top-[78px] z-30 hidden max-w-[310px] rounded-xl border border-[#00d4ff]/20 bg-[#050d1a]/86 p-4 font-mono text-xs text-white/60 shadow-2xl backdrop-blur-md md:block">
      <p className="font-black uppercase tracking-[0.2em] text-[#00d4ff]">{">"} Live Village</p>
      {error ? (
        <p className="mt-2 leading-5 text-[#ff9a6c]">{error}. 기본 마을 화면으로 표시 중입니다.</p>
      ) : villageState ? (
        <>
          <p className="mt-2 leading-5 text-white/70">{villageState.summary}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <span className="rounded-lg border border-white/8 bg-white/[0.04] px-2 py-2">
              <strong className="block text-[#00d4ff]">{villageState.activity.github_commits}</strong>
              commits
            </span>
            <span className="rounded-lg border border-white/8 bg-white/[0.04] px-2 py-2">
              <strong className="block text-[#00ff88]">{villageState.activity.study_minutes}</strong>
              study
            </span>
            <span className="rounded-lg border border-white/8 bg-white/[0.04] px-2 py-2">
              <strong className="block text-[#ff9a6c]">{villageState.activity.workout_done ? "yes" : "no"}</strong>
              workout
            </span>
          </div>
        </>
      ) : null}
    </aside>
  );
}
