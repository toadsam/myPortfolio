"use client";

import dynamic from "next/dynamic";
import {useEffect, useRef, useState} from "react";
import {useGLTF} from "@react-three/drei";
import {DialogueBox} from "@/components/ui/DialogueBox";
import {Header} from "@/components/ui/Header";
import {InfoPanel} from "@/components/ui/InfoPanel";
import {IntroOverlay} from "@/components/ui/IntroOverlay";
import {SceneTransition} from "@/components/ui/SceneTransition";
import {SectionTabs} from "@/components/ui/SectionTabs";
import {npcBehaviorProfiles} from "@/data/npcBehaviors";
import {autonomousNpcs} from "@/data/npcRoster";
import {villageBuildings} from "@/lib/constants";
import {fetchVillageState, requestNpcEncounter, requestNpcTick} from "@/lib/liveApi";
import {getNpcState} from "@/lib/liveState";
import type {NpcMood, NpcRuntimeState, NpcState, VillageState} from "@/types/live";
import type {ExplorationMode, NPCData, SectionId, Vector3Tuple} from "@/types/portfolio";

const VillageScene = dynamic(
  () => import("@/components/village/VillageScene").then((m) => m.VillageScene),
  {
    loading: () => (
      <div className="grid h-[54vh] min-h-[420px] place-items-center bg-[#050d1a] font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#00d4ff]/60 md:h-screen">
        {">"} Developer's City를 불러오는 중...
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
          {">"} 프로젝트 전시실을 불러오는 중...
        </span>
      </div>
    )
  }
);

const ResumeMode = dynamic(
  () => import("@/components/ui/ResumeMode").then((m) => m.ResumeMode),
  {ssr: false}
);

const FADE_DURATION = 480;

useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

export function AIPortfolioVillage() {
  const [activeSection, setActiveSection] = useState<SectionId>("intro");
  const [activeContentId, setActiveContentId] = useState<string | undefined>(undefined);
  const [selectedNpc, setSelectedNpc] = useState<NPCData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>("click");

  const [viewMode, setViewMode] = useState<"village" | "interior" | "project-interior" | "resume">("village");
  const [interiorSectionId, setInteriorSectionId] = useState<SectionId | null>(null);
  const [interiorProjectId, setInteriorProjectId] = useState<string | null>(null);
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);
  const [villageState, setVillageState] = useState<VillageState | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [npcRuntimeStates, setNpcRuntimeStates] = useState<Record<string, NpcRuntimeState>>({});
  const [encounterNotice, setEncounterNotice] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const npcRuntimeStatesRef = useRef<Record<string, NpcRuntimeState>>({});
  const npcPositionsRef = useRef<Record<string, Vector3Tuple>>({});
  const npcMemoryRef = useRef<string[]>([]);
  const npcTickCursorRef = useRef(0);
  const npcTickBusyRef = useRef(false);
  const encounterBusyRef = useRef(false);
  const encounterCooldownRef = useRef<Record<string, number>>({});

  useEffect(() => {
    npcRuntimeStatesRef.current = npcRuntimeStates;
  }, [npcRuntimeStates]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNpcRuntimeStates((states) => {
        let changed = false;
        const next = {...states};

        for (const [npcId, state] of Object.entries(states)) {
          if (state.bubbleExpiresAt && state.bubbleExpiresAt <= now) {
            next[npcId] = {...state, bubbleText: undefined, bubbleExpiresAt: undefined};
            changed = true;
          }
        }

        return changed ? next : states;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
          setLiveError("FastAPI 백엔드가 꺼져 있습니다");
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

  useEffect(() => {
    function nearbyNpcIds(npcId: string) {
      const position = npcPositionsRef.current[npcId];
      if (!position) return [];

      return Object.entries(npcPositionsRef.current)
        .filter(([otherId, otherPosition]) => otherId !== npcId && distance(position, otherPosition) < 3.2)
        .map(([otherId]) => otherId);
    }

    async function runTickBatch() {
      if (npcTickBusyRef.current) return;
      npcTickBusyRef.current = true;

      const batch = Array.from({length: Math.min(2, autonomousNpcs.length)}, (_, index) => {
        const npc = autonomousNpcs[(npcTickCursorRef.current + index) % autonomousNpcs.length]!;
        return npc;
      });
      npcTickCursorRef.current = (npcTickCursorRef.current + batch.length) % autonomousNpcs.length;

      await Promise.all(batch.map(async (npc) => {
        const current = npcRuntimeStatesRef.current[npc.id];
        const profile = npcBehaviorProfiles[npc.id];
        const baseMood = getNpcState(villageState, npc.id)?.mood ?? "calm";

        try {
          const response = await requestNpcTick({
            npc_id: npc.id,
            mood: current?.mood ?? baseMood,
            energy: current?.energy ?? 50,
            assigned_building_id: profile?.assignedBuildingId,
            nearby_npc_ids: nearbyNpcIds(npc.id),
            recent_memory: npcMemoryRef.current.slice(-6)
          });

          remember(response.memory);
          setNpcRuntimeStates((states) => ({
            ...states,
            [npc.id]: {
              mood: response.mood,
              energy: response.energy,
              bubbleText: response.bubble_text,
              bubbleExpiresAt: Date.now() + 8500,
              memory: response.memory,
              nextGoal: response.next_goal
            }
          }));
        } catch {
          setNpcRuntimeStates((states) => ({
            ...states,
            [npc.id]: {
              mood: current?.mood ?? baseMood,
              energy: current?.energy ?? 45,
              bubbleText: "잠깐 생각을 정리하는 중이에요.",
              bubbleExpiresAt: Date.now() + 4500,
              memory: "NPC tick request failed."
            }
          }));
        }
      }));

      npcTickBusyRef.current = false;
    }

    const firstTick = setTimeout(runTickBatch, 10000);
    const tickInterval = setInterval(runTickBatch, 60000);

    return () => {
      clearTimeout(firstTick);
      clearInterval(tickInterval);
    };
  }, [villageState]);

  useEffect(() => {
    async function checkEncounter() {
      if (encounterBusyRef.current) return;

      const entries = Object.entries(npcPositionsRef.current);
      const now = Date.now();

      for (let i = 0; i < entries.length; i += 1) {
        for (let j = i + 1; j < entries.length; j += 1) {
          const [npcAId, npcAPosition] = entries[i]!;
          const [npcBId, npcBPosition] = entries[j]!;
          const pairKey = [npcAId, npcBId].sort().join(":");

          if (now < (encounterCooldownRef.current[pairKey] ?? 0)) continue;
          if (distance(npcAPosition, npcBPosition) > 1.45) continue;

          encounterBusyRef.current = true;
          encounterCooldownRef.current[pairKey] = now + 180000;

          const stateA = npcRuntimeStatesRef.current[npcAId];
          const stateB = npcRuntimeStatesRef.current[npcBId];
          const profileA = npcBehaviorProfiles[npcAId];
          const profileB = npcBehaviorProfiles[npcBId];

          try {
            const response = await requestNpcEncounter(
              {
                npc_id: npcAId,
                mood: stateA?.mood ?? (getNpcState(villageState, npcAId)?.mood ?? "calm"),
                energy: stateA?.energy ?? 50,
                assigned_building_id: profileA?.assignedBuildingId,
                recent_memory: stateA?.memory ? [stateA.memory] : []
              },
              {
                npc_id: npcBId,
                mood: stateB?.mood ?? (getNpcState(villageState, npcBId)?.mood ?? "calm"),
                energy: stateB?.energy ?? 50,
                assigned_building_id: profileB?.assignedBuildingId,
                recent_memory: stateB?.memory ? [stateB.memory] : []
              },
              npcMemoryRef.current.slice(-6)
            );

            remember(response.memory);
            setEncounterNotice("NPC들이 서로 이야기를 나눴습니다.");
            window.setTimeout(() => setEncounterNotice(null), 4500);
            encounterCooldownRef.current[pairKey] = now + response.cooldown_seconds * 1000;
            setNpcRuntimeStates((states) => {
              const next = {...states};

              for (const change of response.state_changes) {
                next[change.npc_id] = {
                  ...(next[change.npc_id] ?? {}),
                  mood: change.mood,
                  energy: change.energy,
                  memory: response.memory
                };
              }

              for (const line of response.dialogue) {
                next[line.npc_id] = {
                  ...(next[line.npc_id] ?? {mood: "curious" as NpcMood, energy: 55}),
                  bubbleText: line.text,
                  bubbleExpiresAt: Date.now() + 9000,
                  memory: response.memory
                };
              }

              return next;
            });
          } catch {
            encounterCooldownRef.current[pairKey] = now + 240000;
          } finally {
            encounterBusyRef.current = false;
          }

          return;
        }
      }
    }

    const interval = setInterval(checkEncounter, 8000);
    return () => clearInterval(interval);
  }, [villageState]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (selectedNpc) {
        setSelectedNpc(null);
        return;
      }
      if (isPanelOpen) {
        setIsPanelOpen(false);
        return;
      }
      if (viewMode !== "village") {
        handleExitInterior();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPanelOpen, selectedNpc, viewMode]);

  function remember(memory: string) {
    if (!memory) return;
    npcMemoryRef.current = npcMemoryRef.current.concat(memory).slice(-20);
  }

  function handleNpcPositionChange(npcId: string, position: Vector3Tuple) {
    npcPositionsRef.current[npcId] = position;
  }

  function getDisplayedNpcState(npcId: string): NpcState | undefined {
    const runtime = npcRuntimeStates[npcId];
    const base = getNpcState(villageState, npcId);

    if (!runtime && !base) return undefined;

    return {
      npc_id: npcId,
      mood: runtime?.mood ?? base?.mood ?? "calm",
      status_text: runtime?.memory ?? base?.status_text ?? ""
    };
  }

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

  function openResume() {
    setShowIntro(false);
    setViewMode("resume");
  }

  function enterVillageFromResume() {
    setViewMode("village");
    setShowIntro(false);
    setExplorationMode("click");
    setActiveSection("intro");
    setIsPanelOpen(true);
  }

  // 클릭하면 확인창 없이 바로 입장
  function handleRequestEnter(buildingId: string) {
    const building = villageBuildings.find((b) => b.id === buildingId);
    if (!building) return;

    if (building.district === "plaza") {
      openSection("intro");
      return;
    }

    const {district, sectionId, contentId} = building;

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
              npcRuntimeStates={npcRuntimeStates}
              onNpcPositionChange={handleNpcPositionChange}
              villageState={villageState}
            />
            {showIntro ? <IntroOverlay onStart={startExploring} onResume={openResume} /> : null}
          </section>
          {!showIntro ? (
            <button
              type="button"
              onClick={() => {
                setExplorationMode((m) => (m === "walk" ? "click" : "walk"));
                setIsPanelOpen(false);
                setSelectedNpc(null);
              }}
              className="fixed bottom-28 left-4 z-30 flex items-center gap-2 rounded-xl border border-[#00ff88]/35 bg-[#050d1a]/85 px-4 py-2.5 font-mono text-xs font-black text-white shadow-2xl backdrop-blur-md transition hover:border-[#00ff88] hover:bg-[#00ff88]/12 md:bottom-6"
            >
              {explorationMode === "walk" ? (
                <><span>🖱️</span> 클릭 모드로</>
              ) : (
                <><span>🚶</span> 직접 이동 (WASD)</>
              )}
            </button>
          ) : null}
          <LiveStatusPanel error={liveError} villageState={villageState} />
          {encounterNotice ? <EncounterNotice text={encounterNotice} /> : null}
          <InfoPanel
            activeSection={activeSection}
            activeContentId={activeContentId}
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
          />
          <DialogueBox
            npc={selectedNpc}
            npcState={selectedNpc ? getDisplayedNpcState(selectedNpc.id) : undefined}
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

      {viewMode === "resume" ? (
        <ResumeMode onEnterVillage={enterVillageFromResume} />
      ) : null}

      <SceneTransition active={showTransitionOverlay} />
    </main>
  );
}

function distance(a: Vector3Tuple, b: Vector3Tuple) {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dz * dz);
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

function EncounterNotice({text}: {text: string}) {
  return (
    <div className="fixed left-1/2 top-[78px] z-30 -translate-x-1/2 rounded-lg border border-[#00ff88]/25 bg-[#04140e]/86 px-4 py-2 font-mono text-xs font-black text-[#00ff88] shadow-2xl backdrop-blur-md">
      {text}
    </div>
  );
}
