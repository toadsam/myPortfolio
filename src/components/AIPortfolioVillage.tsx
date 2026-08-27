"use client";

import dynamic from "next/dynamic";
import {AnimatePresence} from "framer-motion";
import {useCallback, useEffect, useRef, useState} from "react";
import {useGLTF} from "@react-three/drei";
import {
  ConciergePanel,
  type ConciergeIntent
} from "@/components/ui/ConciergePanel";
import {CommissionDesk, type DeskPrefill} from "@/components/ui/CommissionDesk";
import {IntakeHud} from "@/components/ui/commission/IntakeHud";
import {DialogueBox} from "@/components/ui/DialogueBox";
import {Header} from "@/components/ui/Header";
import {Crest} from "@/components/ui/Crest";
import {VoyageOverlay} from "@/components/ui/VoyageOverlay";
import {InfoPanel} from "@/components/ui/InfoPanel";
import {SceneTransition} from "@/components/ui/SceneTransition";
import {SectionTabs} from "@/components/ui/SectionTabs";
import {npcBehaviorProfiles} from "@/data/npcBehaviors";
import {autonomousNpcs} from "@/data/npcRoster";
import {
  NPC_EMOTES,
  NPC_SMALL_TALK,
  OVERSEER_GREETINGS,
  pairGag,
  pickRandom
} from "@/data/npcChatter";
import type {NpcCommand} from "@/components/village/NPC";
import {
  CommandDock,
  CORE_NPC_IDS,
  ControlsHint,
  EavesdropButton,
  EavesdropPanel,
  EncounterNotice,
  GroupChatPanel,
  KonamiBurst,
  LiveStatusPanel,
  MilestoneBanner,
  MobileHud,
  Minimap,
  NpcQuickDock,
  QuickTravelDock,
  RelationshipViewer,
  type TravelPoint
} from "@/components/village/VillageHud";
import {sound as projectSound} from "@/components/ui/project-viewers/sound";
import {cameraTargets, villageBuildings} from "@/lib/constants";
import {
  useVillageEntered,
  VillageLoadingVeil
} from "@/components/village/VillageLoadingVeil";
import {
  fetchRelationships,
  fetchNpcFavors,
  fetchVillageNews,
  fetchVillageState,
  hasAdminToken,
  requestGroupChat,
  requestNpcEncounter,
  requestNpcTick,
  trackVisitorEvent
} from "@/lib/liveApi";
import {getNpcState} from "@/lib/liveState";
import {sfx} from "@/lib/sfx";
import {isWalkableDry} from "@/lib/villageWalk";
import {onPlazaDais} from "@/lib/villageTerrain";
import propsLayout from "@/data/propsLayout.json";
import type {
  DailyActivity,
  NpcRelationshipRow,
  NpcActionDefinition,
  NpcActionState,
  NpcMood,
  NpcRuntimeState,
  NpcState,
  NpcSuggestedAction,
  NpcFavor,
  NpcRelationshipChange,
  NpcRelay,
  VillageEvent,
  VillageState
} from "@/types/live";

const OVERSEER_ID = "overseer-npc";

// 소셜 디렉터가 움직이는 캐스트 — 분신(별도 순찰)만 뺀 전원.
// 관계가 NPC 개인 단위(2026-08-22)가 되면서 종류 대표(KIND_REP) 매핑이 필요 없어졌다.
const SOCIAL_CAST = autonomousNpcs
  .map(npc => npc.id)
  .filter(id => id !== OVERSEER_ID);
// 이 아래면 "서먹/앙숙" — 디렉터가 피하게 하거나 화해하러 보낸다. 백엔드 SOUR_AFFINITY 와 같은 값.
const SOUR_AFFINITY = -8;
// 이 위면 "꽤 가까운 사이" — 찾아가서 같이 논다.
const CLOSE_AFFINITY = 16;

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
  if (cur.workout_done && !prev.workout_done)
    return "얘들아, 재훈이 오늘 운동 완료했대! 💪";
  const dc = cur.github_commits - prev.github_commits;
  if (dc > 0) return `얘들아, 재훈이 방금 커밋 ${dc}개 올렸대! 🎉`;
  const ds = cur.study_minutes - prev.study_minutes;
  if (ds >= 20) return `재훈이 공부 ${ds}분 더 했대, 대단하지? 📚`;
  const dco = cur.coding_minutes - prev.coding_minutes;
  if (dco >= 20) return `재훈이 코딩 ${dco}분 더 했더라! ⌨️`;
  const newUnlocked = unlocked.filter(
    u => !prevUnlocked.includes(u) && !u.startsWith("active-")
  );
  if (newUnlocked.length > 0) return "마을에 새 장식이 생겼어! 다들 봤어? ✨";
  return null;
}
import type {
  ExplorationMode,
  NPCData,
  SectionId,
  Vector3Tuple
} from "@/types/portfolio";

// 마을 장면은 three 를 끌고 오므로 dynamic — 그 청크가 오는 동안 보여 줄 화면이
// 필요하다. 예전엔 여기가 **사이안 사이버펑크 화면**이었고, 청크가 도착하면
// VillageScene 안의 로딩 베일로 바뀐다 — 생김새가 전혀 다른 화면 둘이 1초 간격으로
// 갈리니 "깜빡거리며 안 된다"로 보였다(실측: 495ms 사이안 → 1497ms 도면 → 2513ms 사라짐).
//
// 이제 둘 다 VillageLoadingVeil 을 쓴다. 경계를 넘어도 화면이 그대로 이어지고,
// 진행률만 0 에서 실제 값으로 바뀐다. VillageLoadingVeil 은 three 를 import 하지
// 않으므로 이 자리에 써도 dynamic 분리가 깨지지 않는다.
//
// 바깥 div 는 높이를 위해 남긴다 — 이 섹션은 자기 높이가 없어서 비우면 페이지가
// 접힌다(CLAUDE.md 에 같은 사고가 기록돼 있다).
const VillageScene = dynamic(
  () => import("@/components/village/VillageScene").then(m => m.VillageScene),
  {
    loading: () => (
      <div className="relative h-[54vh] min-h-[420px] overflow-hidden bg-[#050d1a] md:h-screen">
        <VillageLoadingVeil progress={0} />
      </div>
    ),
    ssr: false
  }
);

const InteriorScene = dynamic(
  () =>
    import("@/components/interior/InteriorScene").then(m => m.InteriorScene),
  {ssr: false}
);

// 공방은 마을 '구역'이 아니라 지하 공간이라 InteriorScene(sectionId 라우터)을 거치지 않는다.
const AtelierInterior = dynamic(
  () =>
    import("@/components/interior/AtelierInterior").then(
      m => m.AtelierInterior
    ),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0b1626]">
        <span className="v-serif text-[13px] tracking-[0.2em] text-[#e2c078]/60">
          지하로 내려가는 중...
        </span>
      </div>
    )
  }
);

const ProjectInterior = dynamic(
  () =>
    import("@/components/interior/ProjectInterior").then(
      m => m.ProjectInterior
    ),
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
  () => import("@/components/ui/ResumeMode").then(m => m.ResumeMode),
  {ssr: false}
);

const FADE_DURATION = 480;
const GUIDE_ID = "guide-npc";

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
    out[npc.id] = [
      RALLY_POINT[0] + Math.cos(a) * r,
      0,
      RALLY_POINT[2] + Math.sin(a) * r
    ];
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
/**
 * 루미가 달려와 서는 환영 지점.
 *
 * 옛 고정값 [-4, 0, 10] 은 마을이 고리 배치로 바뀐 뒤 **회랑 울타리 줄 위**가
 * 됐다 — 도착하면 난간이 몸을 관통하고 클로즈업 카메라도 난간에 가렸다
 * (2026-08-28 사용자 보고 "벽에 끼이고 화면 안 보이고"). 좌표를 다시 굽는 대신
 * 그 자리에서 광장 안쪽으로 당기면서 ① 본인 주변 0.6, ② 클로즈업 카메라가 설
 * 자리(z+3) 주변 0.4 가 전부 뚫린 첫 지점에 선다 — 배치가 바뀌어도 따라온다.
 */
const WELCOME_SPOT: Vector3Tuple = ((): Vector3Tuple => {
  const clearDisc = (x: number, z: number, r: number) => {
    if (!isWalkableDry(x, z)) return false;
    for (let k = 0; k < 8; k += 1) {
      const a = (k / 8) * Math.PI * 2;
      if (!isWalkableDry(x + Math.cos(a) * r, z + Math.sin(a) * r)) return false;
    }
    return true;
  };
  // 걷기 판정은 가로등·벤치·깃대 같은 "통과 프롭"을 일부러 안 막는다 — 그래서
  // isWalkableDry 만으로 고르면 루미가 가로등 기둥 뒤에 서거나(1차 스냅), 카메라가
  // 광장 성문 문짝 속에 들어간다(2차 스냅). "처음 통과하는 자리"가 아니라 광장
  // 단상 남쪽을 전부 훑어서, **본인 주변과 카메라 시선(+z, 5.6 유닛)이 어떤
  // 프롭에서도 가장 멀리 떨어진 자리**를 고른다. 바닥 무늬(포장·타일)와 머리 위
  // 현수막만 빼고 전부 장애물로 세고, 성문은 문짝까지 넓게 잡는다.
  const obstacles: Array<readonly [number, number, number]> = [];
  for (const p of (propsLayout as {
    props: {glb: string; position: number[]}[];
  }).props) {
    const px = p.position[0];
    const pz = p.position[2];
    if (Math.hypot(px, pz) > 16) continue;
    const n = p.glb.split("/").pop()?.replace(".glb", "") ?? "";
    // grass-patch 는 "바닥 무늬"가 아니었다 — 무릎 높이 풀더미라 그 위에 서면
    // 루미가 화단에 들어가 선 그림이 된다(3차 스냅에서 실제로 일어난 일).
    if (
      /^(paving|path-|plaza-tile|verge|bunting|stepping-stones|lily-pads|reed-clump|waterfall|arch-)/.test(
        n
      )
    )
      continue;
    if (n === "gate-arch") {
      obstacles.push([px, pz, 1.3]); // 기둥+문짝 전체
      continue;
    }
    // 화단·풀더미는 모델 원반이 넓다 — 0.6 으로 쟀더니 루미가 화단 테두리에
    // 발을 딛고 섰다(4차 스냅). 간판도 팻말 판이 옆으로 뻗는다.
    if (/^(flowerbed|grass-patch|sign-)/.test(n)) {
      obstacles.push([px, pz, 1.0]);
      continue;
    }
    obstacles.push([px, pz, 0.6]);
  }
  let bx = -1.5;
  let bz = 4.2;
  let bestScore = -Infinity;
  for (let x = -7; x <= 7; x += 0.25) {
    for (let z = 0.8; z <= 7.5; z += 0.25) {
      if (!onPlazaDais(x, z) || !onPlazaDais(x, z + 3.2)) continue;
      if (!clearDisc(x, z, 0.6)) continue;
      let score = Infinity;
      for (const [ox, oz, orad] of obstacles) {
        // 장애물 → (스팟에서 클로즈업 카메라 쪽 +z 3.2 선분)까지의 거리.
        // 5.6(시네마틱 카메라까지)으로 재면 남쪽 어디에도 자리가 없다 —
        // 시네마틱 카메라는 대신 y 를 높여 프롭 위로 넘겨 본다.
        const t = Math.max(0, Math.min(1, (oz - z) / 3.2));
        score = Math.min(
          score,
          Math.hypot(ox - x, oz - (z + 3.2 * t)) - orad
        );
      }
      if (score > bestScore) {
        bestScore = score;
        bx = x;
        bz = z;
      }
    }
  }
  return [bx, 0, bz];
})();
// 컨시어지 시네마틱 — 환영 지점을 정면 저시점에서 바라봄 (멀리서 달려옴).
// 환영 지점이 런타임에 정해지므로 카메라도 상대 오프셋으로 따라간다.
// y 3.4: 광장 남쪽은 프롭이 빽빽해서 저시점으로는 어디서 봐도 뭔가에 가린다 —
// 살짝 부감으로 프롭 머리 위를 넘겨 본다.
const CONCIERGE_CAM: {position: Vector3Tuple; lookAt: Vector3Tuple} = {
  position: [WELCOME_SPOT[0] + 0.5, 3.4, WELCOME_SPOT[2] + 5.6],
  lookAt: [WELCOME_SPOT[0], 1.5, WELCOME_SPOT[2]]
};

// NPC 위치 기준 상반신 클로즈업 카메라
function closeUp(pos: Vector3Tuple): {
  position: Vector3Tuple;
  lookAt: Vector3Tuple;
} {
  return {position: [pos[0], 1.4, pos[2] + 3], lookAt: [pos[0], 1.35, pos[2]]};
}

const CONVO_STEP = 2600; // NPC 간 대화 한 턴 길이(ms)

// 두 NPC를 옆에서 함께 담는 투샷 카메라 (엿듣기 장면)
function twoShot(
  a: Vector3Tuple,
  b: Vector3Tuple
): {position: Vector3Tuple; lookAt: Vector3Tuple} {
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

useGLTF.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
);

// 매 렌더 재생성되는 핸들러를 항상 최신 클로저는 유지하면서 참조는 고정해서 넘겨준다 —
// React.memo(VillageScene/NPC/Building)가 무관한 부모 리렌더를 실제로 스킵하려면
// 콜백 props의 참조가 안정적이어야 하는데, 이 컴포넌트의 핸들러들은 서로 얽혀 있어
// useCallback 의존성 배열을 손으로 맞추면 오래된 클로저 버그가 생기기 쉽다.
function useStableCallback<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: Args) => ref.current(...args), []);
}

export function AIPortfolioVillage() {
  // 관람객이 「들어가기」를 누르기 전엔 마을을 재워 둔다(VillageLoadingVeil 주석 참고).
  const villageEntered = useVillageEntered();
  const [activeSection, setActiveSection] = useState<SectionId>("intro");
  const [activeContentId, setActiveContentId] = useState<string | undefined>(
    undefined
  );
  const [selectedNpc, setSelectedNpc] = useState<NPCData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // 갓생 섬 선착장을 보일지. 섬은 내 기록만 있는 비공개 공간이라 손님에겐
  // 부두 자체를 안 보여준다 — 눌러봤자 로그인 벽이면 재미가 아니라 막다른 길이다.
  //
  // **렌더 중에 hasAdminToken() 을 바로 부르면 안 된다** — 서버 렌더에서는
  // localStorage 가 없어 false, 브라우저에서는 true 가 되어 하이드레이션
  // 불일치가 난다. 마운트 뒤에 한 번만 읽는다.
  const [isOwner, setIsOwner] = useState(false);
  // 항해 중이면 화면을 덮고, 그 사이 VoyageOverlay 가 /island 로 넘긴다.
  const [voyaging, setVoyaging] = useState(false);

  useEffect(() => {
    setIsOwner(hasAdminToken());
  }, []);
  const [explorationMode, setExplorationMode] =
    useState<ExplorationMode>("click");
  // 기본 무음. 랜딩에서 이미 켰다면(클라이언트 내비게이션) 그 상태를 이어받는다.
  const [soundOn, setSoundOn] = useState(() => !sfx.isMuted());
  const [konami, setKonami] = useState(false);
  const [conciergeStage, setConciergeStage] = useState<
    "idle" | "running" | "panel" | "closed"
  >("idle");
  const [talkCam, setTalkCam] = useState<{
    position: Vector3Tuple;
    lookAt: Vector3Tuple;
  } | null>(null);
  const [travelCam, setTravelCam] = useState<{
    position: Vector3Tuple;
    lookAt: Vector3Tuple;
  } | null>(null);
  // 바닥 클릭 이동 목적지. nonce 로 같은 자리 재클릭도 구분한다.
  const [groundTarget, setGroundTarget] = useState<{
    point: Vector3Tuple;
    nonce: number;
  } | null>(null);
  const [npcCommand, setNpcCommand] = useState<NpcCommand | null>(null);
  const [overseerTarget, setOverseerTarget] = useState<Vector3Tuple | null>(
    null
  );
  const [npcSocialTargets, setNpcSocialTargets] = useState<
    Record<string, Vector3Tuple>
  >({});
  const [groupChatBusy, setGroupChatBusy] = useState(false);
  const [groupChat, setGroupChat] = useState<{
    lines: {name: string; text: string}[];
  } | null>(null);
  const [groupChatOpen, setGroupChatOpen] = useState(false);
  const [conciergeCam, setConciergeCam] = useState<{
    position: Vector3Tuple;
    lookAt: Vector3Tuple;
  } | null>(null);
  const [eavesdrop, setEavesdrop] = useState<{
    aName: string;
    bName: string;
    lines: {name: string; text: string}[];
  } | null>(null);
  const [eavesOpen, setEavesOpen] = useState(false);
  const [convoCam, setConvoCam] = useState<{
    position: Vector3Tuple;
    lookAt: Vector3Tuple;
  } | null>(null);

  const [viewMode, setViewMode] = useState<
    "village" | "interior" | "project-interior" | "resume" | "atelier"
  >("village");

  // 접수 데스크(2D)는 어느 화면 위에도 뜬다 — 공방 안에서 도안에게 말을 걸어도,
  // 마을에서 상시 버튼을 눌러도 결국 같은 이 패널이 열린다.
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  // 3D 공방 안에서는 접수가 두 단계다(설문 HUD → 결과를 든 데스크). /atelier 와 같은 규칙.
  const [atelierHudOpen, setAtelierHudOpen] = useState(false);
  const [commissionPrefill, setCommissionPrefill] =
    useState<DeskPrefill | null>(null);
  const [atelierFocusNpcId, setAtelierFocusNpcId] = useState<string | null>(
    null
  );

  const openCommission = useCallback((from: string) => {
    setIsCommissionOpen(true);
    trackVisitorEvent({
      event_type: "commission_open",
      target_id: "atelier-desk",
      label: `의뢰 접수대 (${from})`
    });
  }, []);

  const [interiorSectionId, setInteriorSectionId] = useState<SectionId | null>(
    null
  );
  const [interiorProjectId, setInteriorProjectId] = useState<string | null>(
    null
  );
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);
  const [villageState, setVillageState] = useState<VillageState | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [npcRuntimeStates, setNpcRuntimeStates] = useState<
    Record<string, NpcRuntimeState>
  >({});
  const [encounterNotice, setEncounterNotice] = useState<string | null>(null);
  const [milestoneEvent, setMilestoneEvent] = useState<string | null>(null);
  const [relOpen, setRelOpen] = useState(false);
  const [villageNews, setVillageNews] = useState<VillageEvent[]>([]);
  // NPC 의 미완료 부탁 — HUD 한 줄. 새로고침 뒤에도 남게 백엔드에서 읽는다.
  const [npcFavors, setNpcFavors] = useState<NpcFavor[]>([]);

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
  const patrolTimersRef = useRef<number[]>([]);
  const patrolBusyRef = useRef(false);
  const patrolIdxRef = useRef(0);
  const patrolTargetIdRef = useRef("");
  const emoteCooldownRef = useRef<Record<string, number>>({});
  const prevActivityRef = useRef<DailyActivity | null>(null);
  const prevUnlockedRef = useRef<string[]>([]);
  const editingRef = useRef(false);
  const relationshipsRef = useRef<NpcRelationshipRow[]>([]);
  const villageStateRef = useRef<VillageState | null>(null);

  useEffect(() => {
    npcRuntimeStatesRef.current = npcRuntimeStates;
  }, [npcRuntimeStates]);

  useEffect(() => {
    villageStateRef.current = villageState;
  }, [villageState]);

  useEffect(() => {
    npcCommandRef.current = npcCommand;
  }, [npcCommand]);

  useEffect(
    () => () => {
      if (greetTimerRef.current) clearTimeout(greetTimerRef.current);
    },
    []
  );

  useEffect(() => {
    trackVisitorEvent({
      event_type: "page_view",
      target_id: "home",
      label: "Portfolio Village"
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (editingRef.current) return;
      const now = Date.now();
      setNpcRuntimeStates(states => {
        let changed = false;
        const next = {...states};

        for (const [npcId, state] of Object.entries(states)) {
          if (state.bubbleExpiresAt && state.bubbleExpiresAt <= now) {
            next[npcId] = {
              ...(next[npcId] ?? state),
              bubbleText: undefined,
              bubbleExpiresAt: undefined
            };
            changed = true;
          }

          if (state.emoteExpiresAt && state.emoteExpiresAt <= now) {
            next[npcId] = {
              ...(next[npcId] ?? state),
              emote: undefined,
              emoteExpiresAt: undefined
            };
            changed = true;
          }

          const actionExpiresAt = state.currentAction
            ? state.currentAction.startedAt + state.currentAction.durationMs
            : 0;
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
      if (editingRef.current) return;
      try {
        const nextState = await fetchVillageState();
        if (ignore) return;
        setVillageState(nextState);
        setLiveError(null);

        // 내 기록 변화 감지 → 분신(총괄 NPC)이 마을에 소문내기 (무료)
        const prev = prevActivityRef.current;
        if (prev) {
          const msg = announceDelta(
            prev,
            nextState.activity,
            nextState.unlocked_items,
            prevUnlockedRef.current
          );
          if (msg && !npcCommandRef.current) {
            const now = Date.now();
            setNpcRuntimeStates(states => ({
              ...states,
              [OVERSEER_ID]: {
                ...(states[OVERSEER_ID] ?? {
                  mood: "excited" as NpcMood,
                  energy: 78
                }),
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
    if (!villageEntered) return; // 입장 전엔 재워 둔다
    function nearbyNpcIds(npcId: string) {
      const position = npcPositionsRef.current[npcId];
      if (!position) return [];

      return Object.entries(npcPositionsRef.current)
        .filter(
          ([otherId, otherPosition]) =>
            otherId !== npcId && distance(position, otherPosition) < 3.2
        )
        .map(([otherId]) => otherId);
    }

    async function runTickBatch() {
      if (typeof document !== "undefined" && document.hidden) return; // 탭 숨김 → AI 호출 중단(비용 절감)
      if (editingRef.current) return; // 배치 편집 중엔 씬 갱신 중단
      if (npcTickBusyRef.current) return;
      npcTickBusyRef.current = true;

      const batch = Array.from(
        {length: Math.min(2, autonomousNpcs.length)},
        (_, index) => {
          const npc =
            autonomousNpcs[
              (npcTickCursorRef.current + index) % autonomousNpcs.length
            ]!;
          return npc;
        }
      );
      npcTickCursorRef.current =
        (npcTickCursorRef.current + batch.length) % autonomousNpcs.length;

      await Promise.all(
        batch.map(async npc => {
          const current = npcRuntimeStatesRef.current[npc.id];
          const profile = npcBehaviorProfiles[npc.id];
          const baseMood =
            getNpcState(villageStateRef.current, npc.id)?.mood ?? "calm";

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
            setNpcRuntimeStates(states => ({
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
            setNpcRuntimeStates(states => ({
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
        })
      );

      npcTickBusyRef.current = false;
    }

    const firstTick = setTimeout(runTickBatch, 10000);
    const tickInterval = setInterval(runTickBatch, 60000);

    return () => {
      clearTimeout(firstTick);
      clearInterval(tickInterval);
    };
  }, [villageEntered]);

  useEffect(() => {
    if (!villageEntered) return; // 입장 전엔 재워 둔다
    async function checkEncounter() {
      if (typeof document !== "undefined" && document.hidden) return; // 탭 숨김 → AI 호출 중단(비용 절감)
      if (editingRef.current) return; // 배치 편집 중엔 씬 갱신 중단
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
                mood:
                  stateA?.mood ??
                  getNpcState(villageStateRef.current, npcAId)?.mood ??
                  "calm",
                energy: stateA?.energy ?? 50,
                assigned_building_id: profileA?.assignedBuildingId,
                recent_memory: stateA?.memory ? [stateA.memory] : []
              },
              {
                npc_id: npcBId,
                mood:
                  stateB?.mood ??
                  getNpcState(villageStateRef.current, npcBId)?.mood ??
                  "calm",
                energy: stateB?.energy ?? 50,
                assigned_building_id: profileB?.assignedBuildingId,
                recent_memory: stateB?.memory ? [stateB.memory] : []
              },
              npcMemoryRef.current.slice(-6)
            );

            remember(response.memory);
            notifyRelationship(npcAId, npcBId, response.relationship);
            if (response.news) pushNews(response.news);
            // 앙숙은 다음 마주침까지 두 배 — 피하는 것처럼 보이게
            const sour =
              (response.relationship?.affinity ?? 0) <= SOUR_AFFINITY;
            encounterCooldownRef.current[pairKey] =
              now + response.cooldown_seconds * 1000 * (sour ? 2 : 1);
            const convoMs = response.dialogue.length * CONVO_STEP + 1500;
            setNpcRuntimeStates(states => {
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
                    mood:
                      getNpcState(villageStateRef.current, action.npc_id)
                        ?.mood ?? "curious",
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
            // 대화가 끝난 뒤 결과가 몸짓으로 드러난다 — 💢 하고 등 돌려 걷거나, 💕 하고 잠시 더 머문다
            stageEncounterAftermath(
              npcAId,
              npcBId,
              npcAPosition,
              npcBPosition,
              response.relationship,
              now + convoMs
            );
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
  }, [villageEntered]);

  // 분신(총괄 NPC) 순찰 — 친구들 집을 순회하며 도착하면 안부 대화
  useEffect(() => {
    if (!villageEntered) return; // 입장 전엔 재워 둔다
    async function patrolTick() {
      if (typeof document !== "undefined" && document.hidden) return;
      if (editingRef.current) return; // 배치 편집 중엔 순찰 중단
      if (npcCommandRef.current) {
        setOverseerTarget(null);
        patrolTargetIdRef.current = "";
        return;
      }
      if (patrolBusyRef.current) return;

      const targetId =
        OVERSEER_PATROL[patrolIdxRef.current % OVERSEER_PATROL.length]!;
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
        // 대화 말풍선 타이머(convoTimersRef)와 분리 — playConversation/playGroupChat이
        // 그 배열을 통째로 clear할 때 이 busy-flag 리셋 타이머까지 같이 증발해
        // 순찰이 영구 정지되는 걸 방지한다.
        patrolTimersRef.current.push(t);
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
            assigned_building_id:
              npcBehaviorProfiles[targetId]?.assignedBuildingId,
            recent_memory: stateT?.memory ? [stateT.memory] : []
          },
          npcMemoryRef.current.slice(-6)
        );
        remember(res.memory);
        notifyRelationship(OVERSEER_ID, targetId, res.relationship);
        if (res.news) pushNews(res.news);
        const now = Date.now();
        const convoMs = res.dialogue.length * CONVO_STEP + 1500;
        setNpcRuntimeStates(states => {
          const next = {...states};
          for (const change of res.state_changes) {
            next[change.npc_id] = {
              ...(next[change.npc_id] ?? {}),
              mood: change.mood,
              energy: change.energy,
              memory: res.memory
            };
          }
          const holdUntil = now + convoMs;
          next[OVERSEER_ID] = {
            ...(next[OVERSEER_ID] ?? {mood: "excited" as NpcMood, energy: 72}),
            facePoint: [tpos[0], 0, tpos[2]],
            holdUntil
          };
          next[targetId] = {
            ...(next[targetId] ?? {mood: "calm" as NpcMood, energy: 55}),
            facePoint: [opos[0], 0, opos[2]],
            holdUntil
          };
          return next;
        });
        setConvoCam(twoShot(opos, tpos));
        playConversation(OVERSEER_ID, targetId, res.dialogue);
        // 순찰 안부도 마주침 — 이모트는 뜨되, 분신은 순찰 경로가 있으니 등 돌려 걷기는 상대만
        stageEncounterAftermath(
          OVERSEER_ID,
          targetId,
          opos,
          tpos,
          res.relationship,
          now + convoMs
        );
        advance(convoMs + 800);
      } catch {
        // AI 실패 → 무료 안부 한 줄
        setNpcRuntimeStates(states => ({
          ...states,
          [OVERSEER_ID]: {
            ...(states[OVERSEER_ID] ?? {
              mood: "excited" as NpcMood,
              energy: 72
            }),
            bubbleText: pickRandom(OVERSEER_GREETINGS),
            bubbleExpiresAt: Date.now() + 4000
          }
        }));
        advance(4200);
      }
    }

    const id = setInterval(patrolTick, 2500);
    return () => clearInterval(id);
  }, [villageEntered]);

  // 무료 상호작용 — 근접 시 이모트/짧은 잡담 (AI 없음, 상시 활기)
  useEffect(() => {
    if (!villageEntered) return; // 입장 전엔 재워 둔다
    function socialTick() {
      if (typeof document !== "undefined" && document.hidden) return;
      if (editingRef.current) return; // 배치 편집 중엔 잡담 중단
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
          if ((ra?.holdUntil ?? 0) > now || (rb?.holdUntil ?? 0) > now)
            continue;
          emoteCooldownRef.current[pair] = now + 16000;
          const talk = Math.random() < 0.4;
          setNpcRuntimeStates(states => {
            const next = {...states};
            const baseA = next[aId] ?? {mood: "calm" as NpcMood, energy: 50};
            const baseB = next[bId] ?? {mood: "calm" as NpcMood, energy: 50};
            if (talk) {
              next[aId] = {
                ...baseA,
                bubbleText: pairGag(aId, bId) ?? pickRandom(NPC_SMALL_TALK),
                bubbleExpiresAt: now + 3200
              };
              next[bId] = {
                ...baseB,
                emote: pickRandom(NPC_EMOTES),
                emoteExpiresAt: now + 2600
              };
            } else {
              next[aId] = {
                ...baseA,
                emote: pickRandom(NPC_EMOTES),
                emoteExpiresAt: now + 2600
              };
              next[bId] = {
                ...baseB,
                emote: pickRandom(NPC_EMOTES),
                emoteExpiresAt: now + 2600
              };
            }
            return next;
          });
          return;
        }
      }
    }
    const id = setInterval(socialTick, 2600);
    return () => clearInterval(id);
  }, [villageEntered]);

  // 마을 소식(NPC 사이의 사건) + 미완료 부탁 — 60초마다. 백엔드 없으면 조용히 빈 채로.
  useEffect(() => {
    let ignore = false;
    async function loadNews() {
      try {
        const [items, favors] = await Promise.all([
          fetchVillageNews(8),
          fetchNpcFavors()
        ]);
        if (!ignore) {
          setVillageNews(items);
          setNpcFavors(favors);
        }
      } catch {
        /* 백엔드 오프라인 */
      }
    }
    loadNews();
    const id = setInterval(loadNews, 60000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, []);

  // 관계 그래프 주기적 로드 (창발 사회의 현재 지형)
  useEffect(() => {
    let ignore = false;
    async function loadRelationships() {
      try {
        const rels = await fetchRelationships();
        if (!ignore) relationshipsRef.current = rels;
      } catch {
        /* 백엔드 오프라인 — 관계 기반 행동만 쉼 */
      }
    }
    loadRelationships();
    const id = setInterval(loadRelationships, 60000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, []);

  // 소셜 디렉터 — 관계에 따라 NPC가 친한 친구를 찾아가거나 화해하러 가게 만든다(창발 루프의 엔진)
  useEffect(() => {
    if (!villageEntered) return; // 입장 전엔 재워 둔다
    function directorTick() {
      if (typeof document !== "undefined" && document.hidden) return;
      if (editingRef.current || npcCommandRef.current) return;
      const rels = relationshipsRef.current;
      if (!rels.length) return;

      const actor =
        SOCIAL_CAST[Math.floor(Math.random() * SOCIAL_CAST.length)]!;
      if ((npcRuntimeStatesRef.current[actor]?.holdUntil ?? 0) > Date.now())
        return; // 대화 중이면 스킵

      // 관계 행은 실제 npc_id 쌍 — 내가 낀 것만 고른다
      const mine = rels
        .filter(r => r.npc_a === actor || r.npc_b === actor)
        .map(r => ({
          other: r.npc_a === actor ? r.npc_b : r.npc_a,
          affinity: r.affinity
        }));
      if (!mine.length) return;

      mine.sort((x, y) => y.affinity - x.affinity);
      const best = mine[0]!;
      const worst = mine[mine.length - 1]!;
      const myPos = npcPositionsRef.current[actor];

      let target: Vector3Tuple | null = null;
      if (worst.affinity <= SOUR_AFFINITY && Math.random() < 0.5) {
        // 앙금 있는 상대: 반은 화해하러 가고, 반은 **피한다** — 상대 반대쪽으로 6유닛
        const pos = npcPositionsRef.current[worst.other];
        if (pos && myPos) {
          if (Math.random() < 0.5) {
            target = [pos[0], 0, pos[2]];
          } else {
            const dx = myPos[0] - pos[0];
            const dz = myPos[2] - pos[2];
            const len = Math.hypot(dx, dz) || 1;
            target = [myPos[0] + (dx / len) * 6, 0, myPos[2] + (dz / len) * 6];
          }
        }
      } else if (best.affinity >= CLOSE_AFFINITY) {
        // 꽤 가까운 친구: 찾아가서 같이 논다
        const pos = npcPositionsRef.current[best.other];
        if (pos) target = [pos[0], 0, pos[2]];
      } else if (best.affinity >= 3 && Math.random() < 0.5) {
        const pos = npcPositionsRef.current[best.other];
        if (pos) target = [pos[0], 0, pos[2]];
      }
      if (!target) return; // 딱히 친하지도 서먹하지도 않으면 각자 배회

      setNpcSocialTargets(state => ({
        ...state,
        [actor]: target as Vector3Tuple
      }));
      window.setTimeout(() => {
        setNpcSocialTargets(state => {
          const next = {...state};
          delete next[actor];
          return next;
        });
      }, 14000);
    }

    const id = setInterval(directorTick, 9000);
    return () => clearInterval(id);
  }, [villageEntered]);

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
    const seq = [
      "arrowup",
      "arrowup",
      "arrowdown",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "arrowleft",
      "arrowright",
      "b",
      "a"
    ];
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
  }, [viewMode, soundOn]);

  // 컨시어지: 마을 진입 시 루미가 달려오게 트리거 (접속할 때마다 1회)
  //
  // **막이 걷힌 뒤에 시작해야 한다.** 예전엔 마운트 즉시 달렸는데, 로딩 막이
  // 10~20초 떠 있으니 관람객이 들어오면 루미는 이미 도착해 있었다 —
  // 달려오는 장면을 아무도 못 봤다.
  useEffect(() => {
    if (!villageEntered) return;
    if (conciergeStage !== "idle") return;
    setConciergeStage("running");
  }, [villageEntered, conciergeStage]);

  // 루미가 안 도착해도 패널이 뜨도록 안전망
  useEffect(() => {
    if (conciergeStage !== "running") return;
    const t = setTimeout(
      () => setConciergeStage(s => (s === "running" ? "panel" : s)),
      6500
    );
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
    const guide = autonomousNpcs.find(n => n.id === GUIDE_ID);
    if (guide) openNpcDialogue(guide);
  }

  function remember(memory: string) {
    if (!memory) return;
    npcMemoryRef.current = npcMemoryRef.current.concat(memory).slice(-20);
  }

  // 방금 생긴 소식을 폴링(60초) 전에 피드 맨 앞에 꽂는다. 같은 id 는 한 번만.
  function pushNews(item: VillageEvent) {
    setVillageNews(prev =>
      prev.some(n => n.id === item.id) ? prev : [item, ...prev].slice(0, 8)
    );
  }

  /** other 에서 멀어지는 쪽으로 dist 만큼 떨어진 점 — 물·섬 밖이면 마른
   * 땅이 나올 때까지 당겨 잡는다(물가에 목표가 찍히면 거기서 서성인다). */
  function awayFrom(
    me: Vector3Tuple,
    other: Vector3Tuple,
    dist: number
  ): Vector3Tuple {
    const dx = me[0] - other[0];
    const dz = me[2] - other[2];
    const len = Math.hypot(dx, dz) || 1;
    for (let d = dist; d >= 1; d -= 1) {
      const x = me[0] + (dx / len) * d;
      const z = me[2] + (dz / len) * d;
      if (isWalkableDry(x, z)) return [x, 0, z];
    }
    return me;
  }

  // 마주침의 결과를 몸짓으로: 대화 재생이 끝나는 시각(endAt)에 이모트를 띄우고,
  // 싸웠으면 서로 반대 방향으로 5유닛 걸어가고, 가까워졌으면 1초 더 마주 본다.
  // 말풍선이 떠 있는 동안엔 이모트가 가려지므로(NPC.tsx) 반드시 대화 뒤에 건다.
  function stageEncounterAftermath(
    aId: string,
    bId: string,
    aPos: Vector3Tuple,
    bPos: Vector3Tuple,
    rel: NpcRelationshipChange | null | undefined,
    endAt: number
  ) {
    if (!rel) return;
    const milestone = rel.milestone ?? "";
    const fought =
      rel.delta <= -2 ||
      milestone.includes("틀어졌") ||
      milestone.includes("앙숙");
    const warmed =
      rel.delta >= 2 ||
      milestone.includes("화해") ||
      milestone.includes("절친");
    if (!fought && !warmed) return;
    // 정점 마일스톤(절친/앙숙)은 한 단계 큰 연출 (5단계 E-7)
    const isBff = milestone.includes("절친");
    const isFeud = milestone.includes("앙숙");
    const isMakeup = milestone.includes("화해");
    const emote = isBff
      ? "💞"
      : isMakeup
      ? "🤝"
      : isFeud
      ? "💔"
      : fought
      ? "💢"
      : "💕";
    const emoteMs = isBff || isFeud || isMakeup ? 2500 : 1400;
    const delay = Math.max(0, endAt - Date.now());
    const t = window.setTimeout(() => {
      const shown = Date.now();
      setNpcRuntimeStates(states => {
        const next = {...states};
        for (const id of [aId, bId]) {
          next[id] = {
            ...(next[id] ?? {mood: "curious" as NpcMood, energy: 55}),
            emote,
            emoteExpiresAt: shown + emoteMs,
            // 가까워졌으면 잠시 더 마주 본다 (절친은 더 길게)
            ...(warmed ? {holdUntil: shown + (isBff ? 3000 : 1200)} : {}),
            ...(isFeud ? {mood: "worried" as NpcMood} : {})
          };
        }
        if (isBff) {
          // 가장 가까운 다른 NPC 둘이 🎉 하며 구경 온다 — 마을이 같이 기뻐하는 그림
          const mid: Vector3Tuple = [
            (aPos[0] + bPos[0]) / 2,
            0,
            (aPos[2] + bPos[2]) / 2
          ];
          const near = Object.entries(npcPositionsRef.current)
            .filter(([id]) => id !== aId && id !== bId && id !== OVERSEER_ID)
            .sort((x, y) => distance(x[1], mid) - distance(y[1], mid))
            .slice(0, 2);
          for (const [id] of near) {
            next[id] = {
              ...(next[id] ?? {mood: "excited" as NpcMood, energy: 60}),
              emote: "🎉",
              emoteExpiresAt: shown + 2500
            };
          }
          setNpcSocialTargets(state => ({
            ...state,
            ...Object.fromEntries(
              near.map(([id]) => [id, [mid[0] + 1.5, 0, mid[2] + 1.5]])
            )
          }));
          window.setTimeout(() => {
            setNpcSocialTargets(state => {
              const nextT = {...state};
              for (const [id] of near) delete nextT[id];
              return nextT;
            });
          }, 10000);
        }
        return next;
      });
      if (fought) {
        // 등 돌리고 각자 반대쪽으로 — 디렉터의 "피하기"와 같은 이동 경로. 앙숙은 더 멀리.
        // 분신(총괄)은 순찰 경로가 따로 있으니 상대만 걸어 나간다
        const dist = isFeud ? 8 : 5;
        setNpcSocialTargets(state => ({
          ...state,
          ...(aId !== OVERSEER_ID ? {[aId]: awayFrom(aPos, bPos, dist)} : {}),
          ...(bId !== OVERSEER_ID ? {[bId]: awayFrom(bPos, aPos, dist)} : {})
        }));
        window.setTimeout(() => {
          setNpcSocialTargets(state => {
            const next = {...state};
            delete next[aId];
            delete next[bId];
            return next;
          });
        }, 8000);
      }
    }, delay);
    convoTimersRef.current.push(t);
  }

  // 대화로 사이가 바뀌면 알림. 큰 사건(절친/앙숙/화해)은 크게, 작은 변화는 슬쩍.
  function notifyRelationship(
    aId: string,
    bId: string,
    rel?: {
      vibe: string;
      delta: number;
      affinity: number;
      milestone?: string;
    } | null
  ) {
    if (!rel) return;
    const nameOf = (id: string) =>
      autonomousNpcs.find(n => n.id === id)?.name ?? id;
    if (rel.milestone) {
      const emoji = rel.milestone.includes("절친")
        ? "💞"
        : rel.milestone.includes("화해")
        ? "🤝"
        : rel.milestone.includes("앙숙")
        ? "💔"
        : "😤";
      setMilestoneEvent(
        `${emoji} ${nameOf(aId)} ↔ ${nameOf(bId)} · ${rel.milestone}!`
      );
      window.setTimeout(() => setMilestoneEvent(null), 5200);
      return;
    }
    if (Math.abs(rel.delta) < 2) return;
    const emoji = rel.delta > 0 ? "💚" : "💢";
    setEncounterNotice(
      `${nameOf(aId)} ↔ ${nameOf(bId)} · ${rel.vibe} ${emoji}`
    );
    window.setTimeout(() => setEncounterNotice(null), 3400);
  }

  // NPC 간 대화를 한 줄씩 순차로 말풍선 재생(주고받기) + 엿듣기 기록
  function playConversation(
    aId: string,
    bId: string,
    dialogue: {npc_id: string; text: string}[]
  ) {
    convoTimersRef.current.forEach(t => window.clearTimeout(t));
    convoTimersRef.current = [];
    const nameOf = (id: string) =>
      autonomousNpcs.find(n => n.id === id)?.name ?? id;

    setEavesdrop({
      aName: nameOf(aId),
      bName: nameOf(bId),
      lines: dialogue.map(l => ({name: nameOf(l.npc_id), text: l.text}))
    });
    setEavesOpen(false);

    dialogue.forEach((line, i) => {
      const t = window.setTimeout(() => {
        const other = line.npc_id === aId ? bId : aId;
        setNpcRuntimeStates(states => {
          const next = {...states};
          next[line.npc_id] = {
            ...(next[line.npc_id] ?? {mood: "curious" as NpcMood, energy: 55}),
            bubbleText: line.text,
            bubbleExpiresAt: Date.now() + CONVO_STEP + 800
          };
          if (next[other])
            next[other] = {
              ...next[other],
              bubbleText: undefined,
              bubbleExpiresAt: undefined
            };
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

  useEffect(
    () => () => convoTimersRef.current.forEach(t => window.clearTimeout(t)),
    []
  );
  useEffect(
    () => () => patrolTimersRef.current.forEach(t => window.clearTimeout(t)),
    []
  );

  function handleNpcPositionChange(npcId: string, position: Vector3Tuple) {
    npcPositionsRef.current[npcId] = position;
  }

  // 방문자 말이 관계를 움직여 마일스톤까지 넘겼으면 마주침 때와 같은 배너
  function handleFavor(favor: NpcFavor) {
    setNpcFavors(prev =>
      prev.some(f => f.id === favor.id) ? prev : [favor, ...prev].slice(0, 5)
    );
  }

  // 부탁 칩/HUD 줄에서 그 NPC 에게 가기 — 대화창을 바꿔 연다
  function goToNpc(npcId: string) {
    const npc = autonomousNpcs.find(n => n.id === npcId);
    if (!npc) return;
    setSelectedNpc(null);
    window.setTimeout(() => openNpc(npc), 60);
  }

  function handleRelay(relay: NpcRelay) {
    if (relay.news) pushNews(relay.news);
    if (relay.favor_done)
      setNpcFavors(prev =>
        prev.filter(
          f =>
            !(
              f.npc_id === relay.about_npc_id &&
              f.about_npc_id === selectedNpc?.id
            )
        )
      );
    if (!relay.milestone || !selectedNpc) return;
    notifyRelationship(selectedNpc.id, relay.about_npc_id, {
      vibe: "",
      delta: relay.delta,
      affinity: 0,
      milestone: relay.milestone
    });
  }

  function handleNpcSuggestedAction(
    action: NpcSuggestedAction | null | undefined
  ) {
    if (!action) return;

    const actionState = suggestedActionToState(action);
    setNpcRuntimeStates(states => ({
      ...states,
      [actionState.npcId]: applyActionStateToRuntime(
        states[actionState.npcId],
        actionState
      )
    }));
    remember(actionState.statusText);
  }

  function runManualNpcAction(npc: NPCData, action: NpcActionDefinition) {
    const actionState = actionDefinitionToState(npc, action);
    setNpcRuntimeStates(states => ({
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
    setActiveSection(sectionId);
    setActiveContentId(contentId);
    setSelectedNpc(null);
    setIsPanelOpen(true);
  }

  // 바닥 클릭 — 카메라만 그 자리로. 열려 있던 대화·패널은 닫는다(빈 땅을 누른 건
  // "이제 다른 데 볼래"라는 뜻이니까). 컨시어지 연출 중엔 무시.
  const handleGroundClick = useCallback(
    (point: Vector3Tuple) => {
      if (conciergeStage === "running") return;
      if (conciergeStage === "panel") setConciergeStage("closed");
      setSelectedNpc(null);
      setIsPanelOpen(false);
      setTravelCam(null);
      setGroundTarget({point, nonce: Date.now()});
    },
    [conciergeStage]
  );

  // 빠른 이동 / 미니맵 — 카메라만 그 구역으로 이동 (패널·대화는 열지 않음)
  function travelTo(point: TravelPoint) {
    const target = cameraTargets[point.key];
    if (!target) return;
    trackVisitorEvent({
      event_type: "quick_travel",
      target_id: point.key,
      label: point.label
    });
    setSelectedNpc(null);
    setIsPanelOpen(false);
    setConciergeStage("closed");
    if (point.sectionId) setActiveSection(point.sectionId);
    // 매번 새 객체로 만들어 카메라 전환을 다시 트리거
    setTravelCam({
      position: [...target.position] as Vector3Tuple,
      lookAt: [...target.lookAt] as Vector3Tuple
    });
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
    setSelectedNpc(null);
    const willActivate = npcCommand !== mode;
    trackVisitorEvent({
      event_type: "npc_command",
      target_id: mode,
      label: willActivate ? "on" : "off"
    });

    if (willActivate && mode === "follow") setExplorationMode("walk");

    // 모으기·단체사진·파티는 광장이 보이게 카메라도 같이 이동
    if (
      willActivate &&
      (mode === "gather" || mode === "photo" || mode === "party")
    ) {
      const t = cameraTargets.intro;
      setActiveSection("intro");
      setIsPanelOpen(false);
      setTravelCam({
        position: [...t.position] as Vector3Tuple,
        lookAt: [...t.lookAt] as Vector3Tuple
      });
    }

    setNpcCommand(willActivate ? mode : null);
  }

  // 인사 — 잠깐 모두 인사하고 이전 상태로 복귀(일회성)
  function commandGreet() {
    trackVisitorEvent({
      event_type: "npc_command",
      target_id: "greet",
      label: "on"
    });
    setOverseerTarget(null);
    patrolTargetIdRef.current = "";
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
    trackVisitorEvent({
      event_type: "npc_command",
      target_id: "disperse",
      label: "off"
    });
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
    setSelectedNpc(null);
    const t = cameraTargets.intro;
    setActiveSection("intro");
    setIsPanelOpen(false);
    setTravelCam({
      position: [...t.position] as Vector3Tuple,
      lookAt: [...t.lookAt] as Vector3Tuple
    });
    setNpcCommand("gather");
    setGroupChatBusy(true);
    trackVisitorEvent({
      event_type: "npc_command",
      target_id: "group-talk",
      label: "on"
    });

    const ids = autonomousNpcs
      .filter(npc => CORE_NPC_IDS.has(npc.id))
      .map(npc => npc.id);
    requestGroupChat(ids, npcMemoryRef.current.slice(-6))
      .then(res => playGroupChat(res.dialogue))
      .catch(() => {
        setGroupChatBusy(false);
        setEncounterNotice("수다 생성에 실패했어요 (백엔드 확인) 🚧");
        window.setTimeout(() => setEncounterNotice(null), 2600);
      });
  }

  function playGroupChat(dialogue: {npc_id: string; text: string}[]) {
    convoTimersRef.current.forEach(timer => window.clearTimeout(timer));
    convoTimersRef.current = [];
    const nameOf = (id: string) =>
      autonomousNpcs.find(npc => npc.id === id)?.name ?? id;

    if (!dialogue.length) {
      setGroupChatBusy(false);
      return;
    }

    remember("마을 NPC들이 다 같이 수다를 떨었다.");
    setGroupChat({
      lines: dialogue.map(line => ({
        name: nameOf(line.npc_id),
        text: line.text
      }))
    });
    setGroupChatOpen(true);

    dialogue.forEach((line, index) => {
      const timer = window.setTimeout(() => {
        setNpcRuntimeStates(states => {
          const next = {...states};
          for (const key of Object.keys(next)) {
            if (next[key]?.bubbleText)
              next[key] = {
                ...next[key],
                bubbleText: undefined,
                bubbleExpiresAt: undefined
              };
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

    const endTimer = window.setTimeout(
      () => setGroupChatBusy(false),
      dialogue.length * CONVO_STEP + 600
    );
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
    setSelectedNpc(npc);
    setActiveSection(npc.sectionId);
    setIsPanelOpen(false);
  }

  // 루미가 도착하면 멈춘 자리로 카메라 클로즈업 + 패널
  function handleGuideArrive() {
    const pos = npcPositionsRef.current[GUIDE_ID] ?? WELCOME_SPOT;
    setConciergeCam(closeUp(pos));
    setConciergeStage(s => (s === "running" ? "panel" : s));
  }

  // 루미(가이드)는 컨시어지 패널로, 나머지는 일반 대화로
  function openNpc(npc: NPCData) {
    if (npc.id === GUIDE_ID) {
      setSelectedNpc(null);
      const pos = npcPositionsRef.current[GUIDE_ID] ?? WELCOME_SPOT;
      setConciergeCam(closeUp(pos));
      setConciergeStage("panel");
      return;
    }
    openNpcDialogue(npc);
  }

  // ─── 지하 의뢰 공방 ────────────────────────────────────────────────────
  //
  // 실사용 경로(우하단 상시 버튼)는 2D 접수 데스크로 바로 간다. 이쪽은
  // '발견 경로' 전용 — 마을 해치나 포스트의 귀띔으로만 내려온다.

  function openAtelier(from: string) {
    trackVisitorEvent({
      event_type: "atelier_enter",
      target_id: "atelier",
      label: `지하 공방 입장 (${from})`
    });
    setIsPanelOpen(false);
    setSelectedNpc(null);
    setShowTransitionOverlay(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setViewMode("atelier");
      setShowTransitionOverlay(false);
    }, FADE_DURATION);
  }

  function exitAtelier() {
    setSelectedNpc(null);
    setShowTransitionOverlay(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setViewMode("village");
      setShowTransitionOverlay(false);
    }, FADE_DURATION);
  }

  /** 공방 안에서 인형을 클릭했을 때. 도안은 접수대를 열고, 팀원은 대화창을 연다. */
  function selectAtelierNpc(npc: NPCData) {
    if (npc.id === "atelier-intake-npc") {
      trackVisitorEvent({
        event_type: "commission_open",
        target_id: "commission",
        label: "공방 접수대 (설문)",
        metadata: {via: "atelier-hud"}
      });
      setSelectedNpc(null);
      setAtelierHudOpen(true);
      return;
    }
    trackVisitorEvent({
      event_type: "npc_open",
      target_id: npc.id,
      label: npc.name,
      metadata: {place: "atelier", type: npc.type}
    });
    setSelectedNpc(npc);
  }

  function openResume() {
    trackVisitorEvent({
      event_type: "resume_open",
      target_id: "resume",
      label: "Resume Mode"
    });
    setViewMode("resume");
  }

  function enterVillageFromResume() {
    setViewMode("village");
    setExplorationMode("click");
    setActiveSection("intro");
    // 패널을 닫은 채 들어간다 — 마을로 들어오는 길이 둘(착륙장·이력서)인데
    // 한쪽만 패널을 열면 같은 화면이 경로에 따라 달라 보인다.
    setIsPanelOpen(false);
  }

  // 클릭하면 확인창 없이 바로 입장
  function handleRequestEnter(buildingId: string) {
    const building = villageBuildings.find(b => b.id === buildingId);
    if (!building) return;

    trackVisitorEvent({
      event_type:
        building.district === "projects" ? "project_open" : "building_enter",
      target_id: building.id,
      label: building.name,
      metadata: {
        district: building.district,
        contentId: building.contentId ?? ""
      }
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
      openSection("life", contentId);
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

  // VillageScene/Building/NPC를 React.memo로 감쌌을 때 무관한 상태 변화(대화창, 사운드 토글 등)로 인한
  // 리렌더에서도 함수 prop 참조가 매번 바뀌어 memo가 무력화되지 않도록 안정된 참조로 넘긴다.
  const stableHandleRequestEnter = useStableCallback(handleRequestEnter);
  const stableOpenNpc = useStableCallback(openNpc);
  const stableOpenSection = useStableCallback(openSection);
  const stableHandleNpcPositionChange = useStableCallback(
    handleNpcPositionChange
  );
  const stableHandleGuideArrive = useStableCallback(handleGuideArrive);
  const stableDepartIsland = useCallback(() => setVoyaging(true), []);

  const stableEnterAtelier = useStableCallback(() => openAtelier("마을 해치"));
  const stableSetEditing = useStableCallback((e: boolean) => {
    editingRef.current = e;
  });

  return (
    <main className="min-h-screen bg-[#050d1a] pb-24 text-white md:pb-0">
      {viewMode === "village" ? (
        <>
          <Header
            activeSection={activeSection}
            onSelectSection={stableOpenSection}
          />
          <section
            className={
              isPanelOpen
                ? "relative pt-[65px] transition-[padding] duration-300 md:pr-[460px]"
                : "relative pt-[65px] transition-[padding] duration-300"
            }
          >
            {/* 이 섹션은 자기 높이가 없다 — VillageScene 루트(h-[48vh] …
                md:h-screen)가 높이를 만든다. 그래서 여기서 씬을 조건부로 떼면
                섹션이 pt-[65px]만 남아 접힌다(실제로 한 번 그렇게 깨졌다).
                무게는 이제 라우트로 가른다(`/` 착륙장 / `/village` 마을) —
                이 자리에서 다시 조건을 걸 이유가 없다. */}
            <VillageScene
              activeNpcId={selectedNpc?.id}
              activeSection={activeSection}
              explorationMode={explorationMode}
              onRequestEnter={stableHandleRequestEnter}
              onSelectNpc={stableOpenNpc}
              onSelectSection={stableOpenSection}
              npcRuntimeStates={npcRuntimeStates}
              onNpcPositionChange={stableHandleNpcPositionChange}
              villageState={villageState}
              guideScriptedTarget={
                conciergeStage === "running" ? WELCOME_SPOT : null
              }
              onGuideArrive={stableHandleGuideArrive}
              guideForceHold={conciergeStage === "panel"}
              npcCommand={npcCommand}
              npcCommandTargets={npcCommandTargets}
              overseerTarget={overseerTarget}
              npcSocialTargets={npcSocialTargets}
              onEnterAtelier={stableEnterAtelier}
              onDepartIsland={isOwner ? stableDepartIsland : undefined}
              onEditingChange={stableSetEditing}
              groundTarget={groundTarget}
              onGroundClick={handleGroundClick}
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
          </section>
          <button
            type="button"
            onClick={() => {
              setExplorationMode(m => (m === "walk" ? "click" : "walk"));
              setIsPanelOpen(false);
              setSelectedNpc(null);
            }}
            className="fixed bottom-28 left-4 z-30 flex items-center gap-2 rounded-xl border border-[#00ff88]/35 bg-[#050d1a]/85 px-4 py-2.5 font-mono text-xs font-black text-white shadow-2xl backdrop-blur-md transition hover:border-[#00ff88] hover:bg-[#00ff88]/12 active:scale-95 md:bottom-6"
          >
            {explorationMode === "walk" ? (
              <>
                <span>🖱️</span> 클릭 모드로
              </>
            ) : (
              <>
                <span>🚶</span> 직접 이동 (WASD)
              </>
            )}
          </button>
          <button
            type="button"
            aria-label={soundOn ? "사운드 끄기" : "사운드 켜기"}
            onClick={() => {
              setSoundOn(on => {
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
          <LiveStatusPanel
            error={liveError}
            villageState={villageState}
            news={villageNews}
            favors={npcFavors}
            onGoToNpc={goToNpc}
          />
          <ControlsHint />
          <NpcQuickDock activeNpcId={selectedNpc?.id} onSelect={openNpc} />
          {!isPanelOpen ? (
            <QuickTravelDock activeKey={activeSection} onTravel={travelTo} />
          ) : null}
          {!isPanelOpen ? (
            <Minimap activeKey={activeSection} onTravel={travelTo} />
          ) : null}
          <CommandDock
            command={npcCommand}
            onCommand={issueCommand}
            onGreet={commandGreet}
            onGroupTalk={commandGroupTalk}
            groupTalkBusy={groupChatBusy}
            onBackToWork={backToWork}
            onOpenRelations={() => setRelOpen(true)}
          />
          {!isPanelOpen ? (
            <MobileHud
              activeKey={activeSection}
              onTravel={travelTo}
              command={npcCommand}
              onCommand={issueCommand}
              onGreet={commandGreet}
              onGroupTalk={commandGroupTalk}
              groupTalkBusy={groupChatBusy}
              onBackToWork={backToWork}
              onOpenRelations={() => setRelOpen(true)}
            />
          ) : null}
          {relOpen ? (
            <RelationshipViewer onClose={() => setRelOpen(false)} />
          ) : null}
          {groupChat && groupChatOpen ? (
            <GroupChatPanel
              lines={groupChat.lines}
              onClose={() => setGroupChatOpen(false)}
            />
          ) : null}
          {encounterNotice ? <EncounterNotice text={encounterNotice} /> : null}
          {milestoneEvent ? <MilestoneBanner text={milestoneEvent} /> : null}
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
            <EavesdropButton
              aName={eavesdrop.aName}
              bName={eavesdrop.bName}
              onOpen={() => setEavesOpen(true)}
            />
          ) : null}
          {eavesdrop && eavesOpen ? (
            <EavesdropPanel
              aName={eavesdrop.aName}
              bName={eavesdrop.bName}
              lines={eavesdrop.lines}
              onClose={() => setEavesOpen(false)}
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
            npcState={
              selectedNpc ? getDisplayedNpcState(selectedNpc.id) : undefined
            }
            npcRuntimeState={
              selectedNpc ? npcRuntimeStates[selectedNpc.id] : undefined
            }
            onClose={() => setSelectedNpc(null)}
            onOpenSection={openSection}
            onOpenCommission={() => openAtelier("포스트 귀띔")}
            onRunAction={runManualNpcAction}
            onSuggestedAction={handleNpcSuggestedAction}
            onRelay={handleRelay}
            onFavor={handleFavor}
            onGoToNpc={goToNpc}
            aiOffline={!!liveError}
          />
          <SectionTabs
            activeSection={activeSection}
            onSelectSection={openSection}
          />
          {/* 의뢰 공방 상시 진입 — 실사용 창구라 '숨겨진 입구'만 두면 아무도 못 찾는다.
              발견의 재미는 포스트 대화 쪽 두 번째 입구가 맡는다. */}
          {!isPanelOpen && !selectedNpc ? (
            <button
              type="button"
              onClick={() => openCommission("상시 버튼")}
              className="v-panel fixed bottom-24 right-4 z-[52] flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-black text-[#f3e6c8] transition hover:brightness-125 active:scale-95 md:bottom-6"
              title="홈페이지 제작 의뢰"
            >
              <span className="v-lantern-glow flex">
                <Crest name="hammer" size={16} />
              </span>
              제작 의뢰
            </button>
          ) : null}
        </>
      ) : null}

      {viewMode === "interior" && interiorSectionId ? (
        <InteriorScene
          sectionId={interiorSectionId}
          onBack={handleExitInterior}
        />
      ) : null}

      {viewMode === "project-interior" && interiorProjectId ? (
        <ProjectInterior
          projectId={interiorProjectId}
          onBack={handleExitInterior}
        />
      ) : null}

      {viewMode === "resume" ? (
        <ResumeMode onEnterVillage={enterVillageFromResume} />
      ) : null}

      {viewMode === "atelier" ? (
        <>
          <AtelierInterior
            onBack={exitAtelier}
            onSelectNpc={selectAtelierNpc}
            focusNpcId={atelierHudOpen ? atelierFocusNpcId : null}
            hideHints={atelierHudOpen}
            activeNpcId={selectedNpc?.id ?? null}
          />
          {atelierHudOpen ? (
            <IntakeHud
              onSpeakerNpc={setAtelierFocusNpcId}
              onClose={() => setAtelierHudOpen(false)}
              onFinish={result => {
                setAtelierHudOpen(false);
                setCommissionPrefill(result);
                setIsCommissionOpen(true);
              }}
            />
          ) : null}
          {/* 공방 팀원과의 대화. 마을과 같은 대화창을 그대로 쓴다.
              DialogueBox 자체는 z-30 이고 공방 화면은 z-40 이라 그냥 두면
              캔버스 밑에 깔려 안 보인다 — 스태킹 컨텍스트를 위로 올려준다. */}
          <div className="relative z-50">
            <DialogueBox
              npc={selectedNpc}
              onClose={() => setSelectedNpc(null)}
              onOpenSection={openSection}
              onRunAction={runManualNpcAction}
              onSuggestedAction={handleNpcSuggestedAction}
              onRelay={handleRelay}
              onFavor={handleFavor}
              onGoToNpc={goToNpc}
              aiOffline={!!liveError}
            />
          </div>
        </>
      ) : null}

      {konami ? <KonamiBurst /> : null}

      {/* 의뢰 공방은 어느 viewMode에서든 열릴 수 있다 (이력서 모드 포함) */}
      <AnimatePresence>
        {isCommissionOpen ? (
          <CommissionDesk
            onClose={() => {
              setIsCommissionOpen(false);
              setCommissionPrefill(null);
            }}
            prefill={commissionPrefill ?? undefined}
          />
        ) : null}
      </AnimatePresence>

      <SceneTransition active={showTransitionOverlay} />

      {/* 항해 — 이 오버레이가 스스로 /island 로 넘어간다(진짜 페이지 이동).
          그래야 마을이 쥔 Three.js 와 30 MB GLB 가 통째로 해제된다. */}
      {voyaging ? <VoyageOverlay href="/island" /> : null}
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

function actionDefinitionToState(
  npc: NPCData,
  action: NpcActionDefinition
): NpcActionState {
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

function applyActionStateToRuntime(
  state: NpcRuntimeState | undefined,
  action: NpcActionState
): NpcRuntimeState {
  const base = state ?? {mood: "curious" as NpcMood, energy: 55};
  return {
    ...base,
    currentAction: action,
    recentActions: [action, ...(base.recentActions ?? [])].slice(0, 5)
  };
}
