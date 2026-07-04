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
import {NPC_EMOTES, NPC_SMALL_TALK, OVERSEER_GREETINGS, pickRandom} from "@/data/npcChatter";
import type {NpcCommand} from "@/components/village/NPC";
import {sound as projectSound} from "@/components/ui/project-viewers/sound";
import {cameraTargets, villageBuildings} from "@/lib/constants";
import {resetHudLayout, useDraggable} from "@/lib/useDraggable";
import {fetchVillageState, requestGroupChat, requestNpcEncounter, requestNpcTick, trackVisitorEvent} from "@/lib/liveApi";
import {getNpcState} from "@/lib/liveState";
import {sfx} from "@/lib/sfx";
import type {
  DailyActivity,
  NpcActionDefinition,
  NpcActionState,
  NpcMood,
  NpcRuntimeState,
  NpcState,
  NpcSuggestedAction,
  VillageState
} from "@/types/live";

const OVERSEER_ID = "overseer-npc";
const OVERSEER_PATROL = [
  "guide-npc",
  "project-npc",
  "developer-npc",
  "archivist-npc",
  "contact-npc",
  "npc-study-codingtest",
  "npc-study-cs"
];

function announceDelta(
  prev: DailyActivity,
  cur: DailyActivity,
  unlocked: string[],
  prevUnlocked: string[]
): string | null {
  if (cur.workout_done && !prev.workout_done) return "얘들아, 재훈이 오늘 운동 완료했대! 💪";
  const dc = cur.github_commits - prev.github_commits;
  if (dc > 0) return `얘들아, 재훈이 방금 커밋 ${dc}개 올렸대! 🎉`;
  const ds = cur.study_minutes - prev.study_minutes;
  if (ds >= 20) return `재훈이 공부 ${ds}분 더 했대, 대단하지? 📚`;
  const dco = cur.coding_minutes - prev.coding_minutes;
  if (dco >= 20) return `재훈이 코딩 ${dco}분 더 했더라! ⌨️`;
  const newUnlocked = unlocked.filter((u) => !prevUnlocked.includes(u) && !u.startsWith("active-"));
  if (newUnlocked.length > 0) return "마을에 새 장식이 생겼어! 다들 봤어? ✨";
  return null;
}
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
const CORE_NPC_IDS = new Set(["overseer-npc", "guide-npc", "project-npc", "developer-npc", "archivist-npc", "contact-npc"]);
const GUIDE_ID = "guide-npc";

// 빠른 이동 / 미니맵에서 쓰는 구역 정의 (key = cameraTargets 키)
interface TravelPoint {
  key: string;
  sectionId: SectionId | null;
  label: string;
  color: string;
}
const TRAVEL_POINTS: TravelPoint[] = [
  {key: "intro", sectionId: "intro", label: "중앙 광장", color: "#00d4ff"},
  {key: "projects", sectionId: "projects", label: "프로젝트", color: "#00d4ff"},
  {key: "github", sectionId: "github", label: "기술 스택", color: "#00ff88"},
  {key: "study", sectionId: "study", label: "학습", color: "#38bdf8"},
  {key: "experience", sectionId: "experience", label: "경험", color: "#aa44ff"},
  {key: "life", sectionId: null, label: "인생·일상", color: "#fbbf24"},
  {key: "contact", sectionId: "contact", label: "연락", color: "#ff6600"}
];
// 건물 district → 빠른 이동 key
const DISTRICT_TO_TRAVEL_KEY: Record<string, string> = {
  plaza: "intro",
  projects: "projects",
  skills: "github",
  experience: "experience",
  life: "life",
  study: "study",
  contact: "contact"
};

// NPC 단체 명령 — 집결 지점(중앙 광장 앞)과 NPC별 목표 배치 (한 번만 계산)
const RALLY_POINT: Vector3Tuple = [0, 0, 2];

// 모으기/파티: 해바라기(피보나치) 배치로 원반처럼 골고루 채움
const COMMAND_DISK_TARGETS: Record<string, Vector3Tuple> = (() => {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const total = Math.max(1, autonomousNpcs.length - 1);
  const out: Record<string, Vector3Tuple> = {};
  autonomousNpcs.forEach((npc, i) => {
    const r = 0.6 + 2.2 * Math.sqrt(i / total);
    const a = i * golden;
    out[npc.id] = [RALLY_POINT[0] + Math.cos(a) * r, 0, RALLY_POINT[2] + Math.sin(a) * r];
  });
  return out;
})();

// 단체사진: 카메라 쪽(+z)을 보고 여러 줄로 정렬
const COMMAND_PHOTO_TARGETS: Record<string, Vector3Tuple> = (() => {
  const cols = 8;
  const total = autonomousNpcs.length;
  const out: Record<string, Vector3Tuple> = {};
  autonomousNpcs.forEach((npc, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const inThisRow = Math.min(cols, total - row * cols);
    const x = (col - (inThisRow - 1) / 2) * 1.05;
    const z = RALLY_POINT[2] + 1.3 - row * 1.15;
    out[npc.id] = [x, 0, z];
  });
  return out;
})();
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

const CONVO_STEP = 2600; // NPC 간 대화 한 턴 길이(ms)

// 두 NPC를 옆에서 함께 담는 투샷 카메라 (엿듣기 장면)
function twoShot(a: Vector3Tuple, b: Vector3Tuple): {position: Vector3Tuple; lookAt: Vector3Tuple} {
  const mx = (a[0] + b[0]) / 2;
  const mz = (a[2] + b[2]) / 2;
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const len = Math.hypot(dx, dz) || 1;
  let px = -dz / len;
  let pz = dx / len;
  if (pz < 0) {
    px = -px;
    pz = -pz;
  }
  return {position: [mx + px * 4.5, 2.3, mz + pz * 4.5], lookAt: [mx, 1.2, mz]};
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
  const [travelCam, setTravelCam] = useState<{position: Vector3Tuple; lookAt: Vector3Tuple} | null>(null);
  const [npcCommand, setNpcCommand] = useState<NpcCommand | null>(null);
  const [overseerTarget, setOverseerTarget] = useState<Vector3Tuple | null>(null);
  const [groupChatBusy, setGroupChatBusy] = useState(false);
  const [groupChat, setGroupChat] = useState<{lines: {name: string; text: string}[]} | null>(null);
  const [groupChatOpen, setGroupChatOpen] = useState(false);
  const [conciergeCam, setConciergeCam] = useState<{position: Vector3Tuple; lookAt: Vector3Tuple} | null>(null);
  const [eavesdrop, setEavesdrop] = useState<{aName: string; bName: string; lines: {name: string; text: string}[]} | null>(null);
  const [eavesOpen, setEavesOpen] = useState(false);
  const [convoCam, setConvoCam] = useState<{position: Vector3Tuple; lookAt: Vector3Tuple} | null>(null);

  const [viewMode, setViewMode] = useState<"village" | "interior" | "project-interior" | "resume">("village");
  const [interiorSectionId, setInteriorSectionId] = useState<SectionId | null>(null);
  const [interiorProjectId, setInteriorProjectId] = useState<string | null>(null);
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);
  const [villageState, setVillageState] = useState<VillageState | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [npcRuntimeStates, setNpcRuntimeStates] = useState<Record<string, NpcRuntimeState>>({});
  const [encounterNotice, setEncounterNotice] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const npcCommandRef = useRef<NpcCommand | null>(null);
  const greetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beforeGreetRef = useRef<NpcCommand | null>(null);
  const npcRuntimeStatesRef = useRef<Record<string, NpcRuntimeState>>({});
  const npcPositionsRef = useRef<Record<string, Vector3Tuple>>({});
  const npcMemoryRef = useRef<string[]>([]);
  const npcTickCursorRef = useRef(0);
  const npcTickBusyRef = useRef(false);
  const encounterBusyRef = useRef(false);
  const encounterCooldownRef = useRef<Record<string, number>>({});
  const convoTimersRef = useRef<number[]>([]);
  const patrolBusyRef = useRef(false);
  const patrolIdxRef = useRef(0);
  const patrolTargetIdRef = useRef("");
  const emoteCooldownRef = useRef<Record<string, number>>({});
  const prevActivityRef = useRef<DailyActivity | null>(null);
  const prevUnlockedRef = useRef<string[]>([]);

  useEffect(() => {
    npcRuntimeStatesRef.current = npcRuntimeStates;
  }, [npcRuntimeStates]);

  useEffect(() => {
    npcCommandRef.current = npcCommand;
  }, [npcCommand]);

  useEffect(() => () => {
    if (greetTimerRef.current) clearTimeout(greetTimerRef.current);
  }, []);

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

          if (state.emoteExpiresAt && state.emoteExpiresAt <= now) {
            next[npcId] = {...(next[npcId] ?? state), emote: undefined, emoteExpiresAt: undefined};
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
        if (ignore) return;
        setVillageState(nextState);
        setLiveError(null);

        // 내 기록 변화 감지 → 분신(총괄 NPC)이 마을에 소문내기 (무료)
        const prev = prevActivityRef.current;
        if (prev) {
          const msg = announceDelta(prev, nextState.activity, nextState.unlocked_items, prevUnlockedRef.current);
          if (msg && !npcCommandRef.current) {
            const now = Date.now();
            setNpcRuntimeStates((states) => ({
              ...states,
              [OVERSEER_ID]: {
                ...(states[OVERSEER_ID] ?? {mood: "excited" as NpcMood, energy: 78}),
                mood: "excited",
                bubbleText: msg,
                bubbleExpiresAt: now + 8000
              }
            }));
          }
        }
        prevActivityRef.current = nextState.activity;
        prevUnlockedRef.current = nextState.unlocked_items;
      } catch {
        if (!ignore) {
          setLiveError("FastAPI 백엔드가 꺼져 있습니다");
        }
      }
    }

    loadVillageState();
    const intervalId = setInterval(loadVillageState, 30000);

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
      if (typeof document !== "undefined" && document.hidden) return; // 탭 숨김 → AI 호출 중단(비용 절감)
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
      if (typeof document !== "undefined" && document.hidden) return; // 탭 숨김 → AI 호출 중단(비용 절감)
      if (npcCommandRef.current) return; // 단체 명령 중에는 자동 NPC 대화 중단
      if (encounterBusyRef.current) return;

      const entries = Object.entries(npcPositionsRef.current);
      const now = Date.now();

      for (let i = 0; i < entries.length; i += 1) {
        for (let j = i + 1; j < entries.length; j += 1) {
          const [npcAId, npcAPosition] = entries[i]!;
          const [npcBId, npcBPosition] = entries[j]!;
          if (npcAId === OVERSEER_ID || npcBId === OVERSEER_ID) continue; // 분신은 순찰 시스템이 따로 담당
          const pairKey = [npcAId, npcBId].sort().join(":");

          if (now < (encounterCooldownRef.current[pairKey] ?? 0)) continue;
          if (distance(npcAPosition, npcBPosition) > 1.7) continue;

          encounterBusyRef.current = true;
          encounterCooldownRef.current[pairKey] = now + 120000;

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
            encounterCooldownRef.current[pairKey] = now + response.cooldown_seconds * 1000;
            const convoMs = response.dialogue.length * CONVO_STEP + 1500;
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

              for (const action of response.suggested_actions) {
                next[action.npc_id] = applySuggestedActionToRuntime(
                  next[action.npc_id] ?? {
                    mood: getNpcState(villageState, action.npc_id)?.mood ?? "curious",
                    energy: 55
                  },
                  action
                );
              }

              // 서로 멈춰서 마주보게 (NPC 간 대화 연출) — 대화 전체 길이만큼 유지
              const holdUntil = now + convoMs;
              next[npcAId] = {
                ...(next[npcAId] ?? {mood: "curious" as NpcMood, energy: 55}),
                facePoint: [npcBPosition[0], 0, npcBPosition[2]],
                holdUntil
              };
              next[npcBId] = {
                ...(next[npcBId] ?? {mood: "curious" as NpcMood, energy: 55}),
                facePoint: [npcAPosition[0], 0, npcAPosition[2]],
                holdUntil
              };

              return next;
            });

            // 말풍선을 한 줄씩 순차로 띄워 주고받는 대화처럼 + 엿듣기 기록
            setConvoCam(twoShot(npcAPosition, npcBPosition));
            playConversation(npcAId, npcBId, response.dialogue);
          } catch {
            encounterCooldownRef.current[pairKey] = now + 180000;
          } finally {
            encounterBusyRef.current = false;
          }

          return;
        }
      }
    }

    const interval = setInterval(checkEncounter, 6000);
    return () => clearInterval(interval);
  }, [villageState]);

  // 분신(총괄 NPC) 순찰 — 친구들 집을 순회하며 도착하면 안부 대화
  useEffect(() => {
    async function patrolTick() {
      if (typeof document !== "undefined" && document.hidden) return;
      if (npcCommandRef.current) {
        setOverseerTarget(null);
        patrolTargetIdRef.current = "";
        return;
      }
      if (patrolBusyRef.current) return;

      const targetId = OVERSEER_PATROL[patrolIdxRef.current % OVERSEER_PATROL.length]!;
      const home = npcBehaviorProfiles[targetId]?.home;
      if (!home) {
        patrolIdxRef.current += 1;
        return;
      }

      if (patrolTargetIdRef.current !== targetId) {
        patrolTargetIdRef.current = targetId;
        setOverseerTarget([home[0], 0, home[2]]);
      }

      const opos = npcPositionsRef.current[OVERSEER_ID];
      if (!opos) return;
      if (distance(opos, home) > 2.2) return; // 아직 이동 중

      if (encounterBusyRef.current) return;
      patrolBusyRef.current = true;
      encounterBusyRef.current = true;
      setOverseerTarget(null); // 멈춰서 마주보고 안부

      const tpos = npcPositionsRef.current[targetId] ?? [home[0], 0, home[2]];
      const stateO = npcRuntimeStatesRef.current[OVERSEER_ID];
      const stateT = npcRuntimeStatesRef.current[targetId];

      const advance = (delay: number) => {
        const t = window.setTimeout(() => {
          patrolBusyRef.current = false;
          encounterBusyRef.current = false;
          patrolIdxRef.current += 1;
        }, delay);
        convoTimersRef.current.push(t);
      };

      try {
        const res = await requestNpcEncounter(
          {
            npc_id: OVERSEER_ID,
            mood: stateO?.mood ?? "excited",
            energy: stateO?.energy ?? 72,
            assigned_building_id: "central-plaza",
            recent_memory: stateO?.memory ? [stateO.memory] : []
          },
          {
            npc_id: targetId,
            mood: stateT?.mood ?? "calm",
            energy: stateT?.energy ?? 52,
            assigned_building_id: npcBehaviorProfiles[targetId]?.assignedBuildingId,
            recent_memory: stateT?.memory ? [stateT.memory] : []
          },
          npcMemoryRef.current.slice(-6)
        );
        remember(res.memory);
        const now = Date.now();
        const convoMs = res.dialogue.length * CONVO_STEP + 1500;
        setNpcRuntimeStates((states) => {
          const next = {...states};
          for (const change of res.state_changes) {
            next[change.npc_id] = {...(next[change.npc_id] ?? {}), mood: change.mood, energy: change.energy, memory: res.memory};
          }
          const holdUntil = now + convoMs;
          next[OVERSEER_ID] = {...(next[OVERSEER_ID] ?? {mood: "excited" as NpcMood, energy: 72}), facePoint: [tpos[0], 0, tpos[2]], holdUntil};
          next[targetId] = {...(next[targetId] ?? {mood: "calm" as NpcMood, energy: 55}), facePoint: [opos[0], 0, opos[2]], holdUntil};
          return next;
        });
        setConvoCam(twoShot(opos, tpos));
        playConversation(OVERSEER_ID, targetId, res.dialogue);
        advance(convoMs + 800);
      } catch {
        // AI 실패 → 무료 안부 한 줄
        setNpcRuntimeStates((states) => ({
          ...states,
          [OVERSEER_ID]: {...(states[OVERSEER_ID] ?? {mood: "excited" as NpcMood, energy: 72}), bubbleText: pickRandom(OVERSEER_GREETINGS), bubbleExpiresAt: Date.now() + 4000}
        }));
        advance(4200);
      }
    }

    const id = setInterval(patrolTick, 2500);
    return () => clearInterval(id);
  }, []);

  // 무료 상호작용 — 근접 시 이모트/짧은 잡담 (AI 없음, 상시 활기)
  useEffect(() => {
    function socialTick() {
      if (typeof document !== "undefined" && document.hidden) return;
      if (npcCommandRef.current) return;
      const entries = Object.entries(npcPositionsRef.current);
      const now = Date.now();
      for (let i = 0; i < entries.length; i += 1) {
        for (let j = i + 1; j < entries.length; j += 1) {
          const [aId, aPos] = entries[i]!;
          const [bId, bPos] = entries[j]!;
          const pair = [aId, bId].sort().join("::");
          if (now < (emoteCooldownRef.current[pair] ?? 0)) continue;
          const d = distance(aPos, bPos);
          if (d > 2.6 || d < 0.3) continue;
          const ra = npcRuntimeStatesRef.current[aId];
          const rb = npcRuntimeStatesRef.current[bId];
          if ((ra?.holdUntil ?? 0) > now || (rb?.holdUntil ?? 0) > now) continue;
          emoteCooldownRef.current[pair] = now + 16000;
          const talk = Math.random() < 0.4;
          setNpcRuntimeStates((states) => {
            const next = {...states};
            const baseA = next[aId] ?? {mood: "calm" as NpcMood, energy: 50};
            const baseB = next[bId] ?? {mood: "calm" as NpcMood, energy: 50};
            if (talk) {
              next[aId] = {...baseA, bubbleText: pickRandom(NPC_SMALL_TALK), bubbleExpiresAt: now + 3200};
              next[bId] = {...baseB, emote: pickRandom(NPC_EMOTES), emoteExpiresAt: now + 2600};
            } else {
              next[aId] = {...baseA, emote: pickRandom(NPC_EMOTES), emoteExpiresAt: now + 2600};
              next[bId] = {...baseB, emote: pickRandom(NPC_EMOTES), emoteExpiresAt: now + 2600};
            }
            return next;
          });
          return;
        }
      }
    }
    const id = setInterval(socialTick, 2600);
    return () => clearInterval(id);
  }, []);

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

  // NPC 간 대화를 한 줄씩 순차로 말풍선 재생(주고받기) + 엿듣기 기록
  function playConversation(aId: string, bId: string, dialogue: {npc_id: string; text: string}[]) {
    convoTimersRef.current.forEach((t) => window.clearTimeout(t));
    convoTimersRef.current = [];
    const nameOf = (id: string) => autonomousNpcs.find((n) => n.id === id)?.name ?? id;

    setEavesdrop({
      aName: nameOf(aId),
      bName: nameOf(bId),
      lines: dialogue.map((l) => ({name: nameOf(l.npc_id), text: l.text}))
    });
    setEavesOpen(false);

    dialogue.forEach((line, i) => {
      const t = window.setTimeout(() => {
        const other = line.npc_id === aId ? bId : aId;
        setNpcRuntimeStates((states) => {
          const next = {...states};
          next[line.npc_id] = {
            ...(next[line.npc_id] ?? {mood: "curious" as NpcMood, energy: 55}),
            bubbleText: line.text,
            bubbleExpiresAt: Date.now() + CONVO_STEP + 800
          };
          if (next[other]) next[other] = {...next[other], bubbleText: undefined, bubbleExpiresAt: undefined};
          return next;
        });
      }, i * CONVO_STEP);
      convoTimersRef.current.push(t);
    });

    const clearT = window.setTimeout(() => {
      setEavesdrop(null);
      setEavesOpen(false);
      setConvoCam(null);
    }, dialogue.length * CONVO_STEP + 9000);
    convoTimersRef.current.push(clearT);
  }

  useEffect(() => () => convoTimersRef.current.forEach((t) => window.clearTimeout(t)), []);

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
    setTravelCam(null);
    setShowIntro(false);
    setActiveSection(sectionId);
    setActiveContentId(contentId);
    setSelectedNpc(null);
    setIsPanelOpen(true);
  }

  // 빠른 이동 / 미니맵 — 카메라만 그 구역으로 이동 (패널·대화는 열지 않음)
  function travelTo(point: TravelPoint) {
    const target = cameraTargets[point.key];
    if (!target) return;
    trackVisitorEvent({event_type: "quick_travel", target_id: point.key, label: point.label});
    setShowIntro(false);
    setSelectedNpc(null);
    setIsPanelOpen(false);
    setConciergeStage("closed");
    if (point.sectionId) setActiveSection(point.sectionId);
    // 매번 새 객체로 만들어 카메라 전환을 다시 트리거
    setTravelCam({position: [...target.position] as Vector3Tuple, lookAt: [...target.lookAt] as Vector3Tuple});
  }

  // ── NPC 단체 명령 ──
  function clearGreetTimer() {
    if (greetTimerRef.current) {
      clearTimeout(greetTimerRef.current);
      greetTimerRef.current = null;
    }
    beforeGreetRef.current = null;
  }

  // gather/photo/party/follow — 같은 버튼 다시 누르면 해제(토글)
  function issueCommand(mode: NpcCommand) {
    clearGreetTimer();
    setOverseerTarget(null);
    patrolTargetIdRef.current = "";
    setShowIntro(false);
    setSelectedNpc(null);
    const willActivate = npcCommand !== mode;
    trackVisitorEvent({event_type: "npc_command", target_id: mode, label: willActivate ? "on" : "off"});

    if (willActivate && mode === "follow") setExplorationMode("walk");

    // 모으기·단체사진·파티는 광장이 보이게 카메라도 같이 이동
    if (willActivate && (mode === "gather" || mode === "photo" || mode === "party")) {
      const t = cameraTargets.intro;
      setActiveSection("intro");
      setIsPanelOpen(false);
      setTravelCam({position: [...t.position] as Vector3Tuple, lookAt: [...t.lookAt] as Vector3Tuple});
    }

    setNpcCommand(willActivate ? mode : null);
  }

  // 인사 — 잠깐 모두 인사하고 이전 상태로 복귀(일회성)
  function commandGreet() {
    trackVisitorEvent({event_type: "npc_command", target_id: "greet", label: "on"});
    setOverseerTarget(null);
    patrolTargetIdRef.current = "";
    setShowIntro(false);
    if (npcCommand !== "greet") beforeGreetRef.current = npcCommand;
    setNpcCommand("greet");
    if (greetTimerRef.current) clearTimeout(greetTimerRef.current);
    greetTimerRef.current = setTimeout(() => {
      setNpcCommand(beforeGreetRef.current);
      beforeGreetRef.current = null;
      greetTimerRef.current = null;
    }, 3800);
  }

  // 다시 일하기 — 모든 명령 해제, 각자 배회로 복귀
  function backToWork() {
    clearGreetTimer();
    trackVisitorEvent({event_type: "npc_command", target_id: "disperse", label: "off"});
    setNpcCommand(null);
  }

  const npcCommandTargets =
    npcCommand === "photo"
      ? COMMAND_PHOTO_TARGETS
      : npcCommand === "gather" || npcCommand === "party"
        ? COMMAND_DISK_TARGETS
        : undefined;

  // 다 같이 수다 — 핵심 NPC들을 광장에 모으고 단체 대화를 말풍선으로 재생 (AI 1회 호출)
  function commandGroupTalk() {
    if (groupChatBusy) return;
    clearGreetTimer();
    setOverseerTarget(null);
    patrolTargetIdRef.current = "";
    setShowIntro(false);
    setSelectedNpc(null);
    const t = cameraTargets.intro;
    setActiveSection("intro");
    setIsPanelOpen(false);
    setTravelCam({position: [...t.position] as Vector3Tuple, lookAt: [...t.lookAt] as Vector3Tuple});
    setNpcCommand("gather");
    setGroupChatBusy(true);
    trackVisitorEvent({event_type: "npc_command", target_id: "group-talk", label: "on"});

    const ids = autonomousNpcs.filter((npc) => CORE_NPC_IDS.has(npc.id)).map((npc) => npc.id);
    requestGroupChat(ids, npcMemoryRef.current.slice(-6))
      .then((res) => playGroupChat(res.dialogue))
      .catch(() => {
        setGroupChatBusy(false);
        setEncounterNotice("수다 생성에 실패했어요 (백엔드 확인) 🚧");
        window.setTimeout(() => setEncounterNotice(null), 2600);
      });
  }

  function playGroupChat(dialogue: {npc_id: string; text: string}[]) {
    convoTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    convoTimersRef.current = [];
    const nameOf = (id: string) => autonomousNpcs.find((npc) => npc.id === id)?.name ?? id;

    if (!dialogue.length) {
      setGroupChatBusy(false);
      return;
    }

    remember("마을 NPC들이 다 같이 수다를 떨었다.");
    setGroupChat({lines: dialogue.map((line) => ({name: nameOf(line.npc_id), text: line.text}))});
    setGroupChatOpen(true);

    dialogue.forEach((line, index) => {
      const timer = window.setTimeout(() => {
        setNpcRuntimeStates((states) => {
          const next = {...states};
          for (const key of Object.keys(next)) {
            if (next[key]?.bubbleText) next[key] = {...next[key], bubbleText: undefined, bubbleExpiresAt: undefined};
          }
          next[line.npc_id] = {
            ...(next[line.npc_id] ?? {mood: "curious" as NpcMood, energy: 55}),
            bubbleText: line.text,
            bubbleExpiresAt: Date.now() + CONVO_STEP + 900
          };
          return next;
        });
      }, index * CONVO_STEP);
      convoTimersRef.current.push(timer);
    });

    const endTimer = window.setTimeout(() => setGroupChatBusy(false), dialogue.length * CONVO_STEP + 600);
    const closeTimer = window.setTimeout(() => {
      setGroupChatOpen(false);
      setGroupChat(null);
    }, dialogue.length * CONVO_STEP + 12000);
    convoTimersRef.current.push(endTimer, closeTimer);
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
    setTravelCam(null);
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
    if (district === "study") {
      openSection("study", contentId);
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
              npcCommand={npcCommand}
              npcCommandTargets={npcCommandTargets}
              overseerTarget={overseerTarget}
              cinematic={
                eavesOpen && convoCam
                  ? convoCam
                  : conciergeStage === "running"
                    ? CONCIERGE_CAM
                    : conciergeStage === "panel"
                      ? conciergeCam
                      : talkCam ?? travelCam
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
          {!showIntro && !isPanelOpen ? <QuickTravelDock activeKey={activeSection} onTravel={travelTo} /> : null}
          {!showIntro && !isPanelOpen ? <Minimap activeKey={activeSection} onTravel={travelTo} /> : null}
          {!showIntro ? (
            <CommandDock
              command={npcCommand}
              onCommand={issueCommand}
              onGreet={commandGreet}
              onGroupTalk={commandGroupTalk}
              groupTalkBusy={groupChatBusy}
              onBackToWork={backToWork}
            />
          ) : null}
          {groupChat && groupChatOpen ? (
            <GroupChatPanel lines={groupChat.lines} onClose={() => setGroupChatOpen(false)} />
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
          {eavesdrop && !eavesOpen ? (
            <EavesdropButton aName={eavesdrop.aName} bName={eavesdrop.bName} onOpen={() => setEavesOpen(true)} />
          ) : null}
          {eavesdrop && eavesOpen ? (
            <EavesdropPanel aName={eavesdrop.aName} bName={eavesdrop.bName} lines={eavesdrop.lines} onClose={() => setEavesOpen(false)} />
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
            aiOffline={!!liveError}
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
  const drag = useDraggable("live-status");
  if (!villageState && !error) return null;

  return (
    <aside ref={drag.ref} style={drag.style} className="fixed left-4 top-[132px] z-20 hidden w-[260px] rounded-xl border border-[#00d4ff]/20 bg-[#050d1a]/86 p-3.5 font-mono text-xs text-white/60 shadow-2xl backdrop-blur-md md:block">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between gap-2 transition active:scale-[0.98]"
        title={collapsed ? "펼치기" : "접기"}
        {...drag.handleProps}
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
          <button
            type="button"
            onClick={resetHudLayout}
            className="mt-2 w-full rounded-md border border-white/8 py-1 text-[10px] font-bold text-white/35 transition hover:border-[#00d4ff]/40 hover:text-[#9beaff]"
          >
            ⤢ 패널 배치 초기화
          </button>
        </>
      ) : null) : null}
    </aside>
  );
}

function NpcQuickDock({activeNpcId, onSelect}: {activeNpcId?: string; onSelect: (npc: NPCData) => void}) {
  const coreNpcs = autonomousNpcs.filter((npc) => CORE_NPC_IDS.has(npc.id));
  const [collapsed, setCollapsed] = useState(false);
  const drag = useDraggable("npc-dock");

  if (collapsed) {
    return (
      <button
        type="button"
        ref={drag.ref}
        onPointerDown={drag.handleProps.onPointerDown}
        style={{...drag.style, ...drag.handleProps.style}}
        onClick={() => setCollapsed(false)}
        className="fixed bottom-40 left-4 z-30 flex items-center gap-2 rounded-xl border border-[#00d4ff]/25 bg-[#050d1a]/86 px-3.5 py-2.5 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/80 shadow-2xl backdrop-blur-md transition hover:border-[#00d4ff]/55 active:scale-95 md:bottom-20"
      >
        <span className="text-sm">🤖</span> AI NPC <span className="text-white/40">▸</span>
      </button>
    );
  }

  return (
    <aside ref={drag.ref} style={drag.style} className="fixed bottom-40 left-4 right-4 z-30 flex items-center gap-2 overflow-x-auto rounded-xl border border-[#00d4ff]/20 bg-[#050d1a]/86 p-2 shadow-2xl backdrop-blur-md md:bottom-20 md:right-auto md:w-auto md:max-w-[560px]">
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        title="접기 · 드래그로 이동"
        className="flex shrink-0 items-center gap-1 px-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/75 transition hover:text-[#00d4ff] active:scale-95"
        {...drag.handleProps}
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

function CommandDock({
  command,
  onCommand,
  onGreet,
  onGroupTalk,
  groupTalkBusy,
  onBackToWork
}: {
  command: NpcCommand | null;
  onCommand: (mode: NpcCommand) => void;
  onGreet: () => void;
  onGroupTalk: () => void;
  groupTalkBusy: boolean;
  onBackToWork: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const drag = useDraggable("command-dock");
  const modes: {mode: NpcCommand; icon: string; label: string}[] = [
    {mode: "gather", icon: "🧲", label: "모으기"},
    {mode: "photo", icon: "📸", label: "단체사진"},
    {mode: "party", icon: "🎉", label: "파티"},
    {mode: "follow", icon: "🏃", label: "따라와"}
  ];
  const busy = command !== null;

  if (collapsed) {
    return (
      <button
        type="button"
        ref={drag.ref}
        onPointerDown={drag.handleProps.onPointerDown}
        style={{...drag.style, ...drag.handleProps.style}}
        onClick={() => setCollapsed(false)}
        className="fixed left-4 top-[300px] z-30 hidden items-center gap-2 rounded-xl border border-[#7ed957]/30 bg-[#050d1a]/86 px-3.5 py-2.5 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#9affc4] shadow-2xl backdrop-blur-md transition hover:border-[#7ed957]/55 active:scale-95 md:flex"
      >
        <span className="text-sm">🎮</span> 지휘 <span className="text-white/40">▸</span>
      </button>
    );
  }

  return (
    <aside ref={drag.ref} style={drag.style} className="fixed left-4 top-[300px] z-30 hidden w-[150px] flex-col gap-1 rounded-xl border border-[#7ed957]/20 bg-[#050d1a]/86 p-2 shadow-2xl backdrop-blur-md md:flex">
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="mb-0.5 flex items-center justify-between px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#9affc4]/80 transition hover:text-[#9affc4]"
        {...drag.handleProps}
      >
        🎮 NPC 지휘 <span className="text-white/40">◂</span>
      </button>
      {modes.map((item) => {
        const active = command === item.mode;
        return (
          <button
            key={item.mode}
            type="button"
            onClick={() => onCommand(item.mode)}
            className={
              active
                ? "flex items-center gap-2.5 rounded-lg border border-[#7ed957]/55 bg-[#7ed957]/16 px-3 py-2 text-left text-xs font-black text-white"
                : "flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-white/65 transition hover:bg-white/[0.05] hover:text-white active:scale-[0.98]"
            }
          >
            <span className="text-sm">{item.icon}</span>
            {item.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onGreet}
        className="flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-white/65 transition hover:bg-white/[0.05] hover:text-white active:scale-[0.98]"
      >
        <span className="text-sm">👋</span> 인사
      </button>
      <button
        type="button"
        onClick={onGroupTalk}
        disabled={groupTalkBusy}
        className={
          groupTalkBusy
            ? "flex items-center gap-2.5 rounded-lg border border-[#7ed957]/40 bg-[#7ed957]/10 px-3 py-2 text-left text-xs font-black text-[#9affc4]"
            : "flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-white/65 transition hover:bg-white/[0.05] hover:text-white active:scale-[0.98]"
        }
      >
        <span className="text-sm">💬</span> {groupTalkBusy ? "수다 중…" : "다 같이 수다"}
      </button>
      <button
        type="button"
        onClick={onBackToWork}
        disabled={!busy}
        className={
          busy
            ? "mt-0.5 flex items-center gap-2.5 rounded-lg border border-[#00d4ff]/40 bg-[#00d4ff]/12 px-3 py-2 text-left text-xs font-black text-[#9beaff] transition hover:bg-[#00d4ff]/20 active:scale-[0.98]"
            : "mt-0.5 flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-white/25"
        }
      >
        <span className="text-sm">🛠️</span> 다시 일하기
      </button>
    </aside>
  );
}

function GroupChatPanel({lines, onClose}: {lines: {name: string; text: string}[]; onClose: () => void}) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 w-[min(92vw,460px)] -translate-x-1/2 rounded-2xl border border-[#7ed957]/30 bg-[#050d1a]/95 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9affc4]">
          💬 마을 단체 수다
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-white/15 px-2 py-0.5 text-sm font-bold text-white/70 transition hover:text-white active:scale-90"
        >
          ✕
        </button>
      </div>
      <div className="max-h-[40vh] space-y-2 overflow-y-auto">
        {lines.map((line, index) => (
          <div key={index} className="rounded-xl bg-white/[0.04] px-3 py-2">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.1em] text-[#7ed957]/75">{line.name}</p>
            <p className="mt-0.5 text-sm leading-6 text-white/85">{line.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickTravelDock({activeKey, onTravel}: {activeKey: string; onTravel: (point: TravelPoint) => void}) {
  const [collapsed, setCollapsed] = useState(false);
  const drag = useDraggable("travel-dock");

  if (collapsed) {
    return (
      <button
        type="button"
        ref={drag.ref}
        onPointerDown={drag.handleProps.onPointerDown}
        style={{...drag.style, ...drag.handleProps.style}}
        onClick={() => setCollapsed(false)}
        className="fixed right-4 top-[80px] z-30 hidden items-center gap-2 rounded-xl border border-[#00d4ff]/25 bg-[#050d1a]/86 px-3.5 py-2.5 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/80 shadow-2xl backdrop-blur-md transition hover:border-[#00d4ff]/55 active:scale-95 md:flex"
      >
        <span className="text-sm">🧭</span> 이동 <span className="text-white/40">◂</span>
      </button>
    );
  }

  return (
    <aside ref={drag.ref} style={drag.style} className="fixed right-4 top-[80px] z-30 hidden w-[152px] flex-col gap-1 rounded-xl border border-[#00d4ff]/20 bg-[#050d1a]/86 p-2 shadow-2xl backdrop-blur-md md:flex">
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="mb-0.5 flex items-center justify-between px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/75 transition hover:text-[#00d4ff]"
        {...drag.handleProps}
      >
        🧭 빠른 이동 <span className="text-white/40">▴</span>
      </button>
      {TRAVEL_POINTS.map((point) => {
        const active = activeKey === point.key;
        return (
          <button
            key={point.key}
            type="button"
            onClick={() => onTravel(point)}
            className={
              active
                ? "flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/[0.08] px-3 py-2 text-left text-xs font-black text-white"
                : "flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-white/65 transition hover:bg-white/[0.05] hover:text-white active:scale-[0.98]"
            }
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{background: point.color, boxShadow: active ? `0 0 8px ${point.color}` : "none"}}
            />
            {point.label}
          </button>
        );
      })}
    </aside>
  );
}

function Minimap({activeKey, onTravel}: {activeKey: string; onTravel: (point: TravelPoint) => void}) {
  const [collapsed, setCollapsed] = useState(false);
  const drag = useDraggable("minimap");

  const W = 172;
  const H = 156;
  const pad = 16;
  const xs = villageBuildings.map((b) => b.position[0]);
  const zs = villageBuildings.map((b) => b.position[2]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const sx = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (W - 2 * pad);
  const sy = (z: number) => pad + ((z - minZ) / (maxZ - minZ || 1)) * (H - 2 * pad);
  const colorOf = (key: string) => TRAVEL_POINTS.find((p) => p.key === key)?.color ?? "#9aa";

  // 구역별 중심점 (클릭 히트 영역 + 강조용)
  const centroids = TRAVEL_POINTS.map((point) => {
    const members = villageBuildings.filter((b) => (DISTRICT_TO_TRAVEL_KEY[b.district] ?? "intro") === point.key);
    if (members.length === 0) return null;
    const cx = members.reduce((sum, b) => sum + b.position[0], 0) / members.length;
    const cz = members.reduce((sum, b) => sum + b.position[2], 0) / members.length;
    return {point, x: sx(cx), y: sy(cz)};
  }).filter(Boolean) as {point: TravelPoint; x: number; y: number}[];

  if (collapsed) {
    return (
      <button
        type="button"
        ref={drag.ref}
        onPointerDown={drag.handleProps.onPointerDown}
        style={{...drag.style, ...drag.handleProps.style}}
        onClick={() => setCollapsed(false)}
        className="fixed bottom-6 right-4 z-30 hidden items-center gap-2 rounded-xl border border-[#00d4ff]/25 bg-[#050d1a]/86 px-3.5 py-2.5 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/80 shadow-2xl backdrop-blur-md transition hover:border-[#00d4ff]/55 active:scale-95 md:flex"
      >
        🗺️ 지도
      </button>
    );
  }

  return (
    <aside ref={drag.ref} style={drag.style} className="fixed bottom-6 right-4 z-30 hidden rounded-xl border border-[#00d4ff]/20 bg-[#050d1a]/86 p-2.5 shadow-2xl backdrop-blur-md md:block">
      <div className="mb-1.5 flex cursor-grab items-center justify-between px-1" {...drag.handleProps}>
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/75">🗺️ 미니맵</span>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="font-mono text-[10px] font-black text-white/40 transition hover:text-white"
        >
          ▾
        </button>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="rounded-lg bg-white/[0.03]">
        {villageBuildings.map((b) => {
          const key = DISTRICT_TO_TRAVEL_KEY[b.district] ?? "intro";
          const active = activeKey === key;
          return (
            <circle
              key={b.id}
              cx={sx(b.position[0])}
              cy={sy(b.position[2])}
              r={active ? 3 : 2.2}
              fill={colorOf(key)}
              fillOpacity={active ? 1 : 0.65}
            />
          );
        })}
        {centroids.map(({point, x, y}) => {
          const active = activeKey === point.key;
          return (
            <g key={point.key} style={{cursor: "pointer"}} onClick={() => onTravel(point)}>
              {active ? <circle cx={x} cy={y} r={12} fill="none" stroke={point.color} strokeWidth={1.4} strokeOpacity={0.9} /> : null}
              <circle cx={x} cy={y} r={13} fill={point.color} fillOpacity={0.001} style={{pointerEvents: "all"}}>
                <title>{point.label}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      <p className="mt-1.5 px-1 font-mono text-[9px] leading-tight text-white/35">구역을 누르면 그쪽으로 이동</p>
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

function EavesdropButton({aName, bName, onOpen}: {aName: string; bName: string; onOpen: () => void}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed left-1/2 top-[112px] z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#00ff88]/40 bg-[#050d1a]/90 px-4 py-2 font-mono text-[11px] font-black text-[#9affc4] shadow-2xl backdrop-blur-md transition hover:bg-[#00ff88]/12 active:scale-95"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff88] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ff88]" />
      </span>
      💬 {aName} ↔ {bName} 대화 · 엿듣기
    </button>
  );
}

function EavesdropPanel({
  aName,
  bName,
  lines,
  onClose
}: {
  aName: string;
  bName: string;
  lines: {name: string; text: string}[];
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 w-[min(92vw,460px)] -translate-x-1/2 rounded-2xl border border-[#00ff88]/30 bg-[#050d1a]/95 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9affc4]">
          🕵 엿듣는 중 · {aName} ↔ {bName}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-white/15 px-2 py-0.5 text-sm font-bold text-white/70 transition hover:text-white active:scale-90"
        >
          ✕
        </button>
      </div>
      <div className="space-y-2">
        {lines.map((line, index) => {
          const isA = line.name === aName;
          return (
            <div key={index} className={isA ? "mr-8" : "ml-8"}>
              <p className={`font-mono text-[9px] font-black uppercase tracking-[0.1em] ${isA ? "text-[#00d4ff]/70" : "text-[#ff9a6c]/70"} ${isA ? "" : "text-right"}`}>
                {line.name}
              </p>
              <div
                className={
                  isA
                    ? "mt-0.5 rounded-2xl rounded-bl-sm bg-[#00d4ff]/12 px-3 py-2 text-sm leading-6 text-[#dff8ff]"
                    : "mt-0.5 rounded-2xl rounded-br-sm bg-[#ff9a6c]/12 px-3 py-2 text-sm leading-6 text-[#ffe6d8]"
                }
              >
                {line.text}
              </div>
            </div>
          );
        })}
      </div>
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
