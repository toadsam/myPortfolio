"use client";

import dynamic from "next/dynamic";
import {useEffect, useRef, useState} from "react";
import {useGLTF} from "@react-three/drei";
import {ConciergePanel, type ConciergeIntent} from "@/components/ui/ConciergePanel";
import {DialogueBox} from "@/components/ui/DialogueBox";
import {Header} from "@/components/ui/Header";
import {InfoPanel} from "@/components/ui/InfoPanel";
import {IntroOverlay} from "@/components/ui/IntroOverlay";
import {SceneTransition} from "@/components/ui/SceneTransition";
import {SectionTabs} from "@/components/ui/SectionTabs";
import {npcBehaviorProfiles} from "@/data/npcBehaviors";
import {autonomousNpcs} from "@/data/npcRoster";
import {sound as projectSound} from "@/components/ui/project-viewers/sound";
import {villageBuildings} from "@/lib/constants";
import {fetchVillageState, requestNpcEncounter, requestNpcTick, trackVisitorEvent} from "@/lib/liveApi";
import {getNpcState} from "@/lib/liveState";
import {sfx} from "@/lib/sfx";
import type {
  NpcActionDefinition,
  NpcActionState,
  NpcMood,
  NpcRuntimeState,
  NpcState,
  NpcSuggestedAction,
  VillageState
} from "@/types/live";
import type {ExplorationMode, NPCData, SectionId, Vector3Tuple} from "@/types/portfolio";

const VillageScene = dynamic(
  () => import("@/components/village/VillageScene").then((m) => m.VillageScene),
  {
    loading: () => (
      <div className="relative grid h-[54vh] min-h-[420px] place-items-center overflow-hidden bg-[#050d1a] md:h-screen">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,212,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.08) 1px, transparent 1px)",
            backgroundSize: "44px 44px"
          }}
        />
        <div className="relative flex flex-col items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#00d4ff]/50 font-mono text-sm font-black text-[#00d4ff] shadow-[0_0_18px_rgba(0,212,255,0.3)]">
              AI
            </span>
            <span className="font-mono text-base font-black uppercase tracking-[0.3em] text-white/90">Developer&apos;s City</span>
          </div>
          <div className="relative h-1 w-56 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent"
              style={{animation: "cityLoaderShimmer 1.2s ease-in-out infinite"}}
            />
          </div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#00d4ff]/55">
            {">"} 마을을 불러오는 중...
          </span>
        </div>
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
const CORE_NPC_IDS = new Set(["guide-npc", "project-npc", "developer-npc", "archivist-npc", "contact-npc"]);
const GUIDE_ID = "guide-npc";
const WELCOME_SPOT: Vector3Tuple = [-4, 0, 10]; // 건물 없는 앞쪽-왼쪽 빈 곳 (중앙 타워 회피)
// 컨시어지 시네마틱 — 앞쪽 빈 레인을 정면 저시점에서 바라봄 (멀리서 달려옴)
const CONCIERGE_CAM: {position: Vector3Tuple; lookAt: Vector3Tuple} = {
  position: [-3.5, 2.4, 16.5],
  lookAt: [-4, 1.1, 10]
};

// NPC 위치 기준 상반신 클로즈업 카메라
function closeUp(pos: Vector3Tuple): {position: Vector3Tuple; lookAt: Vector3Tuple} {
  return {position: [pos[0], 1.4, pos[2] + 3], lookAt: [pos[0], 1.35, pos[2]]};
}

useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

export function AIPortfolioVillage() {
  const [activeSection, setActiveSection] = useState<SectionId>("intro");
  const [activeContentId, setActiveContentId] = useState<string | undefined>(undefined);
  const [selectedNpc, setSelectedNpc] = useState<NPCData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>("click");
  const [soundOn, setSoundOn] = useState(true);
  const [konami, setKonami] = useState(false);
  const [conciergeStage, setConciergeStage] = useState<"idle" | "running" | "panel" | "closed">("idle");
  const [talkCam, setTalkCam] = useState<{position: Vector3Tuple; lookAt: Vector3Tuple} | null>(null);
  const [conciergeCam, setConciergeCam] = useState<{position: Vector3Tuple; lookAt: Vector3Tuple} | null>(null);

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
    trackVisitorEvent({event_type: "page_view", target_id: "home", label: "Portfolio Village"});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNpcRuntimeStates((states) => {
        let changed = false;
        const next = {...states};

        for (const [npcId, state] of Object.entries(states)) {
          if (state.bubbleExpiresAt && state.bubbleExpiresAt <= now) {
            next[npcId] = {...(next[npcId] ?? state), bubbleText: undefined, bubbleExpiresAt: undefined};
            changed = true;
          }

          const actionExpiresAt = state.currentAction ? state.currentAction.startedAt + state.currentAction.durationMs : 0;
          if (actionExpiresAt && actionExpiresAt <= now) {
            next[npcId] = {...(next[npcId] ?? state), currentAction: undefined};
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
            [npc.id]: applySuggestedActionToRuntime(
              {
                ...(states[npc.id] ?? {}),
                mood: response.mood,
                energy: response.energy,
                bubbleText: response.bubble_text,
                bubbleExpiresAt: Date.now() + 8500,
                memory: response.memory,
                nextGoal: response.next_goal
              },
              response.suggested_action
            )
          }));
        } catch {
          setNpcRuntimeStates((states) => ({
            ...states,
            [npc.id]: {
              ...(states[npc.id] ?? current ?? {}),
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

              for (const action of response.suggested_actions) {
                next[action.npc_id] = applySuggestedActionToRuntime(
                  next[action.npc_id] ?? {
                    mood: getNpcState(villageState, action.npc_id)?.mood ?? "curious",
                    energy: 55
                  },
                  action
                );
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

  // 코나미 코드 이스터에그 (↑↑↓↓←→←→ B A)
  useEffect(() => {
    const seq = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
    let idx = 0;
    function onKey(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (key === seq[idx]) {
        idx += 1;
        if (idx === seq.length) {
          idx = 0;
          setKonami(true);
          sfx.enter();
          window.setTimeout(() => setKonami(false), 6000);
        }
      } else {
        idx = key === seq[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 오디오 지휘 — 마을이면 마을 BGM, 프로젝트면 프로젝트 음악, 그 외엔 무음.
  // 사운드가 켜져 있을 때만(soundOn) 재생. 화면 전환 시 자동으로 교체된다.
  useEffect(() => {
    if (showIntro) return;
    if (viewMode === "village") {
      projectSound?.setEnabled(false);
      if (soundOn) sfx.startAmbient();
      else sfx.stopAmbient();
    } else if (viewMode === "project-interior") {
      sfx.stopAmbient();
      projectSound?.setEnabled(soundOn);
    } else {
      sfx.stopAmbient();
      projectSound?.setEnabled(false);
    }
  }, [viewMode, soundOn, showIntro]);

  // 컨시어지: 마을 진입 시 루미가 달려오게 트리거 (접속할 때마다 1회)
  useEffect(() => {
    if (showIntro || conciergeStage !== "idle") return;
    setConciergeStage("running");
  }, [showIntro, conciergeStage]);

  // 루미가 안 도착해도 패널이 뜨도록 안전망
  useEffect(() => {
    if (conciergeStage !== "running") return;
    const t = setTimeout(() => setConciergeStage((s) => (s === "running" ? "panel" : s)), 6500);
    return () => clearTimeout(t);
  }, [conciergeStage]);

  // 대화 닫히면 클로즈업 카메라 해제
  useEffect(() => {
    if (!selectedNpc) setTalkCam(null);
  }, [selectedNpc]);

  function markConciergeSeen() {
    try {
      window.localStorage.setItem("concierge-seen-v1", "1");
    } catch {
      /* noop */
    }
  }

  function focusDistrict(sectionId: SectionId) {
    setShowIntro(false);
    setSelectedNpc(null);
    setIsPanelOpen(false);
    setActiveSection(sectionId);
  }

  function handleConciergePick(intent: ConciergeIntent) {
    markConciergeSeen();
    setConciergeStage("closed");
    if (intent === "recruit") {
      openResume();
    } else if (intent === "projects") {
      focusDistrict("projects");
    } else if (intent === "skills") {
      focusDistrict("github");
    } else if (intent === "experience") {
      focusDistrict("experience");
    }
    // browse → 그냥 닫고 자유 탐험
  }

  function handleConciergeAsk() {
    markConciergeSeen();
    setConciergeStage("closed");
    const guide = autonomousNpcs.find((n) => n.id === GUIDE_ID);
    if (guide) openNpcDialogue(guide);
  }

  function remember(memory: string) {
    if (!memory) return;
    npcMemoryRef.current = npcMemoryRef.current.concat(memory).slice(-20);
  }

  function handleNpcPositionChange(npcId: string, position: Vector3Tuple) {
    npcPositionsRef.current[npcId] = position;
  }

  function handleNpcSuggestedAction(action: NpcSuggestedAction | null | undefined) {
    if (!action) return;

    const actionState = suggestedActionToState(action);
    setNpcRuntimeStates((states) => ({
      ...states,
      [actionState.npcId]: applyActionStateToRuntime(states[actionState.npcId], actionState)
    }));
    remember(actionState.statusText);
  }

  function runManualNpcAction(npc: NPCData, action: NpcActionDefinition) {
    const actionState = actionDefinitionToState(npc, action);
    setNpcRuntimeStates((states) => ({
      ...states,
      [npc.id]: applyActionStateToRuntime(states[npc.id], actionState)
    }));
    remember(actionState.statusText);
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
    trackVisitorEvent({
      event_type: "section_open",
      target_id: contentId ?? sectionId,
      label: sectionId,
      metadata: {sectionId, contentId: contentId ?? ""}
    });
    setShowIntro(false);
    setActiveSection(sectionId);
    setActiveContentId(contentId);
    setSelectedNpc(null);
    setIsPanelOpen(true);
  }

  function openNpcDialogue(npc: NPCData) {
    trackVisitorEvent({
      event_type: "npc_open",
      target_id: npc.id,
      label: npc.name,
      metadata: {sectionId: npc.sectionId, type: npc.type}
    });
    // 대화 시작 시점의 NPC 위치를 스냅샷 → 상반신 클로즈업 카메라
    const pos = npcPositionsRef.current[npc.id] ?? npc.position;
    setTalkCam(closeUp(pos));
    setShowIntro(false);
    setSelectedNpc(npc);
    setActiveSection(npc.sectionId);
    setIsPanelOpen(false);
  }

  // 루미가 도착하면 멈춘 자리로 카메라 클로즈업 + 패널
  function handleGuideArrive() {
    const pos = npcPositionsRef.current[GUIDE_ID] ?? WELCOME_SPOT;
    setConciergeCam(closeUp(pos));
    setConciergeStage((s) => (s === "running" ? "panel" : s));
  }

  // 루미(가이드)는 컨시어지 패널로, 나머지는 일반 대화로
  function openNpc(npc: NPCData) {
    if (npc.id === GUIDE_ID) {
      setShowIntro(false);
      setSelectedNpc(null);
      const pos = npcPositionsRef.current[GUIDE_ID] ?? WELCOME_SPOT;
      setConciergeCam(closeUp(pos));
      setConciergeStage("panel");
      return;
    }
    openNpcDialogue(npc);
  }

  function startExploring(mode: ExplorationMode) {
    trackVisitorEvent({event_type: "exploration_start", target_id: mode, label: mode});
    setShowIntro(false);
    setExplorationMode(mode);
    setActiveSection("intro");
    setIsPanelOpen(mode === "click");
  }

  function openResume() {
    trackVisitorEvent({event_type: "resume_open", target_id: "resume", label: "Resume Mode"});
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

    trackVisitorEvent({
      event_type: building.district === "projects" ? "project_open" : "building_enter",
      target_id: building.id,
      label: building.name,
      metadata: {district: building.district, contentId: building.contentId ?? ""}
    });

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
    if (district === "life") {
      // 인생 구역 — 추후 전시실/콘텐츠 연결 예정. 지금은 안내만.
      setEncounterNotice(`${building.name} · 곧 공개됩니다 🚧`);
      window.setTimeout(() => setEncounterNotice(null), 2800);
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
          {/* 인트로 중엔 헤더 숨김 — 첫 화면 집중 */}
          {!showIntro ? <Header activeSection={activeSection} onSelectSection={openSection} /> : null}
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
              guideScriptedTarget={conciergeStage === "running" ? WELCOME_SPOT : null}
              onGuideArrive={handleGuideArrive}
              guideForceHold={conciergeStage === "panel"}
              cinematic={
                conciergeStage === "running" ? CONCIERGE_CAM : conciergeStage === "panel" ? conciergeCam : talkCam
              }
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
              className="fixed bottom-28 left-4 z-30 flex items-center gap-2 rounded-xl border border-[#00ff88]/35 bg-[#050d1a]/85 px-4 py-2.5 font-mono text-xs font-black text-white shadow-2xl backdrop-blur-md transition hover:border-[#00ff88] hover:bg-[#00ff88]/12 active:scale-95 md:bottom-6"
            >
              {explorationMode === "walk" ? (
                <><span>🖱️</span> 클릭 모드로</>
              ) : (
                <><span>🚶</span> 직접 이동 (WASD)</>
              )}
            </button>
          ) : null}
          {!showIntro ? (
            <button
              type="button"
              aria-label={soundOn ? "사운드 끄기" : "사운드 켜기"}
              onClick={() => {
                setSoundOn((on) => {
                  const next = !on;
                  sfx.setMuted(!next);
                  if (next) sfx.startAmbient();
                  return next;
                });
              }}
              className="fixed bottom-[14.5rem] left-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-[#5b8fd6]/40 bg-[#050d1a]/85 text-base shadow-2xl backdrop-blur-md transition hover:border-[#86b0e6] hover:bg-[#5b8fd6]/12 active:scale-90 md:bottom-[8.75rem]"
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
          ) : null}
          {!showIntro ? <LiveStatusPanel error={liveError} villageState={villageState} /> : null}
          {!showIntro ? <ControlsHint /> : null}
          {!showIntro ? (
            <NpcQuickDock
              activeNpcId={selectedNpc?.id}
              onSelect={openNpc}
            />
          ) : null}
          {encounterNotice ? <EncounterNotice text={encounterNotice} /> : null}
          {conciergeStage === "panel" ? (
            <ConciergePanel
              onPick={handleConciergePick}
              onAskAI={handleConciergeAsk}
              onClose={() => {
                markConciergeSeen();
                setConciergeStage("closed");
              }}
            />
          ) : null}
          <InfoPanel
            activeSection={activeSection}
            activeContentId={activeContentId}
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
          />
          <DialogueBox
            npc={selectedNpc}
            npcState={selectedNpc ? getDisplayedNpcState(selectedNpc.id) : undefined}
            npcRuntimeState={selectedNpc ? npcRuntimeStates[selectedNpc.id] : undefined}
            onClose={() => setSelectedNpc(null)}
            onOpenSection={openSection}
            onRunAction={runManualNpcAction}
            onSuggestedAction={handleNpcSuggestedAction}
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

      {konami ? <KonamiBurst /> : null}

      <SceneTransition active={showTransitionOverlay} />
    </main>
  );
}

function distance(a: Vector3Tuple, b: Vector3Tuple) {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dz * dz);
}

function suggestedActionToState(action: NpcSuggestedAction): NpcActionState {
  return {
    npcId: action.npc_id,
    actionId: action.action_id,
    label: action.label,
    description: action.description,
    statusText: action.status_text,
    animationKey: action.animation_key,
    startedAt: Date.now(),
    durationMs: action.duration_ms,
    targetId: action.target_id ?? undefined,
    source: action.source
  };
}

function actionDefinitionToState(npc: NPCData, action: NpcActionDefinition): NpcActionState {
  return {
    npcId: npc.id,
    actionId: action.id,
    label: action.label,
    description: action.description,
    statusText: `${npc.name}가 ${action.label} 행동을 실행합니다.`,
    animationKey: action.animationKey,
    startedAt: Date.now(),
    durationMs: action.durationMs,
    targetId: action.targetId,
    source: "manual"
  };
}

function applySuggestedActionToRuntime(
  state: NpcRuntimeState,
  action?: NpcSuggestedAction | null
): NpcRuntimeState {
  if (!action) return state;
  return applyActionStateToRuntime(state, suggestedActionToState(action));
}

function applyActionStateToRuntime(state: NpcRuntimeState | undefined, action: NpcActionState): NpcRuntimeState {
  const base = state ?? {mood: "curious" as NpcMood, energy: 55};
  return {
    ...base,
    currentAction: action,
    recentActions: [action, ...(base.recentActions ?? [])].slice(0, 5)
  };
}

function LiveStatusPanel({error, villageState}: {error: string | null; villageState: VillageState | null}) {
  const [collapsed, setCollapsed] = useState(false);
  if (!villageState && !error) return null;

  return (
    <aside className="fixed left-4 top-[132px] z-20 hidden w-[260px] rounded-xl border border-[#00d4ff]/20 bg-[#050d1a]/86 p-3.5 font-mono text-xs text-white/60 shadow-2xl backdrop-blur-md md:block">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between gap-2 transition active:scale-[0.98]"
        title={collapsed ? "펼치기" : "접기"}
      >
        <span className="flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[#00d4ff]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00d4ff] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00d4ff]" />
          </span>
          Live Village
        </span>
        <span className="text-sm text-white/40" style={{transform: collapsed ? "rotate(-90deg)" : "none", transition: "transform 0.2s"}}>▾</span>
      </button>
      {!collapsed ? (error ? (
        <p className="mt-2 leading-5 text-[#ff9a6c]">{error}. 기본 마을 화면으로 표시 중입니다.</p>
      ) : villageState ? (
        <>
          <p className="mt-2 leading-5 text-white/70">{villageState.summary}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <span className="rounded-lg border border-white/8 bg-white/[0.04] px-2 py-2">
              <strong className="block text-[#00d4ff]">{villageState.activity.github_commits}</strong>
              <span className="text-[9px] text-white/40">커밋</span>
            </span>
            <span className="rounded-lg border border-white/8 bg-white/[0.04] px-2 py-2">
              <strong className="block text-[#00ff88]">{villageState.activity.study_minutes}</strong>
              <span className="text-[9px] text-white/40">학습·분</span>
            </span>
            <span className="rounded-lg border border-white/8 bg-white/[0.04] px-2 py-2">
              <strong className="block text-[#ff9a6c]">{villageState.activity.workout_done ? "✅" : "💤"}</strong>
              <span className="text-[9px] text-white/40">운동</span>
            </span>
          </div>
          <p className="mt-2 text-[10px] leading-4 text-white/35">오늘의 실시간 활동 · 1분마다 갱신</p>
        </>
      ) : null) : null}
    </aside>
  );
}

function NpcQuickDock({activeNpcId, onSelect}: {activeNpcId?: string; onSelect: (npc: NPCData) => void}) {
  const coreNpcs = autonomousNpcs.filter((npc) => CORE_NPC_IDS.has(npc.id));
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-40 left-4 z-30 flex items-center gap-2 rounded-xl border border-[#00d4ff]/25 bg-[#050d1a]/86 px-3.5 py-2.5 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/80 shadow-2xl backdrop-blur-md transition hover:border-[#00d4ff]/55 active:scale-95 md:bottom-20"
      >
        <span className="text-sm">🤖</span> AI NPC <span className="text-white/40">▸</span>
      </button>
    );
  }

  return (
    <aside className="fixed bottom-40 left-4 right-4 z-30 flex items-center gap-2 overflow-x-auto rounded-xl border border-[#00d4ff]/20 bg-[#050d1a]/86 p-2 shadow-2xl backdrop-blur-md md:bottom-20 md:right-auto md:w-auto md:max-w-[560px]">
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        title="접기"
        className="flex shrink-0 items-center gap-1 px-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/75 transition hover:text-[#00d4ff] active:scale-95"
      >
        AI NPC <span className="text-white/40">▾</span>
      </button>
      {coreNpcs.map((npc) => (
        <button
          className={
            activeNpcId === npc.id
              ? "shrink-0 rounded-lg border border-[#00ff88]/50 bg-[#00ff88]/18 px-3 py-2 text-left text-xs font-black text-white transition active:scale-95"
              : "shrink-0 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-left text-xs font-black text-white/68 transition hover:border-[#00d4ff]/45 hover:text-white active:scale-95"
          }
          key={npc.id}
          onClick={() => onSelect(npc)}
          title={npc.agent?.specialty ?? npc.role}
          type="button"
        >
          <span className="block">{npc.name}</span>
          <span className="mt-0.5 block font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-white/42">
            {npc.type}
          </span>
        </button>
      ))}
    </aside>
  );
}

function KonamiBurst() {
  const emojis = ["🎉", "✨", "🏘️", "🤖", "🌟", "💾", "🚀", "🎮", "🛸", "⭐"];
  const pieces = Array.from({length: 40}, (_, i) => ({
    left: (i * 53) % 100,
    delay: (i % 12) * 0.18,
    dur: 3 + (i % 5) * 0.6,
    emoji: emojis[i % emojis.length],
    size: 18 + (i % 4) * 9,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 select-none"
          style={{left: `${p.left}%`, fontSize: p.size, animation: `konamiFall ${p.dur}s linear ${p.delay}s both`}}
        >
          {p.emoji}
        </span>
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#00ff88]/40 bg-[#050d1a]/90 px-7 py-5 text-center shadow-2xl backdrop-blur-md">
        <p className="font-mono text-xl font-black text-[#00ff88]">🎉 히든 모드 발견!</p>
        <p className="mt-1.5 font-mono text-xs text-white/60">개발자만 아는 그 코드를 입력했군요 😎</p>
      </div>
    </div>
  );
}

function ControlsHint() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 7000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-[80px] z-30 flex -translate-x-1/2 animate-[fadeIn_0.4s_ease] items-center gap-3 rounded-full border border-[#00d4ff]/30 bg-[#050d1a]/90 px-4 py-2 font-mono text-[11px] font-bold text-white/75 shadow-2xl backdrop-blur-md">
      <span className="flex items-center gap-1.5"><span className="text-sm">🖱️</span> 건물 클릭해 입장</span>
      <span className="text-white/20">·</span>
      <span className="flex items-center gap-1.5"><span className="text-sm">🔄</span> 드래그·스크롤로 둘러보기</span>
      <span className="text-white/20">·</span>
      <span className="flex items-center gap-1.5"><span className="text-sm">🚶</span> 직접 이동은 좌하단 버튼</span>
    </div>
  );
}

function EncounterNotice({text}: {text: string}) {
  return (
    <div className="fixed left-1/2 top-[78px] z-30 -translate-x-1/2 rounded-lg border border-[#00ff88]/25 bg-[#04140e]/86 px-4 py-2 font-mono text-xs font-black text-[#00ff88] shadow-2xl backdrop-blur-md">
      {text}
    </div>
  );
}
