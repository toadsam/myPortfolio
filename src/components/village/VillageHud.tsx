"use client";

import {useEffect, useState} from "react";
import {autonomousNpcs} from "@/data/npcRoster";
import type {NpcCommand} from "@/components/village/NPC";
import {Crest} from "@/components/ui/Crest";
import {VillageFrame} from "@/components/ui/VillageFrame";
import type {CrestName} from "@/data/villageCrests";
import {districtTone, villageBuildings} from "@/lib/constants";
import {resetHudLayout, useDraggable} from "@/lib/useDraggable";
import {fetchNpcMemory, fetchRelationships} from "@/lib/liveApi";
import type {
  NpcFavor,
  NpcMemoryItem,
  NpcRelationshipRow,
  VillageEvent,
  VillageState
} from "@/types/live";
import type {NPCData, NPCType, SectionId} from "@/types/portfolio";

/**
 * 3D 씬 위에 떠 있는 순수 UI 위젯(HUD) 모음.
 * AIPortfolioVillage.tsx의 상태머신/effect 로직과 분리해 이 파일은 렌더링 전용으로 유지한다 —
 * 여기 있는 컴포넌트들은 전부 props로만 동작하고 자체 비즈니스 로직(NPC 시뮬레이션, API 폴링)을 갖지 않는다.
 */

// 핵심 NPC(총괄 제외 5명 + 총괄) — 빠른 대화 독/그룹토크 대상
export const CORE_NPC_IDS = new Set([
  "overseer-npc",
  "guide-npc",
  "project-npc",
  "developer-npc",
  "archivist-npc",
  "contact-npc"
]);

// 빠른 이동 / 미니맵에서 쓰는 구역 정의 (key = cameraTargets 키)
export interface TravelPoint {
  key: string;
  sectionId: SectionId | null;
  label: string;
  color: string;
}

// 색은 constants.ts 의 DISTRICT_TONE 이 정한다 — 예전엔 여기, Header, InfoPanel
// 세 곳에 같은 표가 복사돼 있어서 같은 구역이 화면마다 다른 색이었다.
export const TRAVEL_POINTS: TravelPoint[] = (
  [
    {key: "intro", sectionId: "intro", label: "중앙 광장"},
    {key: "projects", sectionId: "projects", label: "프로젝트"},
    {key: "github", sectionId: "github", label: "기술 스택"},
    {key: "study", sectionId: "study", label: "학습"},
    {key: "experience", sectionId: "experience", label: "경험"},
    {key: "life", sectionId: null, label: "인생·일상"},
    {key: "contact", sectionId: "contact", label: "연락"}
  ] satisfies Omit<TravelPoint, "color">[]
).map(point => ({...point, color: districtTone(point.key).accent}));

/** NPC 직군 → 문장. 이모지는 OS마다 그림이 달라 금색 한 톤으로 못 묶는다. */
const NPC_CREST: Record<NPCType, CrestName> = {
  guide: "compass",
  project: "tower",
  developer: "gear",
  archivist: "scroll",
  contact: "envelope"
};

/**
 * HUD 패널은 **접힌 채로 시작한다.**
 *
 * 다섯 개가 한꺼번에 펼쳐져 있으면 입장하자마자 마을이 패널에 덮여서, 정작
 * 보여 주려던 3D 마을이 화면 구석에만 남는다. 첫 화면의 주인공은 마을이고,
 * HUD 는 필요할 때 펴는 것이다.
 *
 * 접힌 상태도 이름표(문장 + 글자)가 남으므로 "여기 뭔가 있다"는 계속 보인다 —
 * 아예 숨기는 것과는 다르다.
 *
 * 여는 순간 그 상태를 기억하지는 않는다. 새로고침하면 다시 접힌 채로 시작한다.
 */
const HUD_STARTS_COLLAPSED = true;

// 건물 district → 빠른 이동 key
export const DISTRICT_TO_TRAVEL_KEY: Record<string, string> = {
  plaza: "intro",
  projects: "projects",
  skills: "github",
  experience: "experience",
  life: "life",
  study: "study",
  contact: "contact"
};

/** 미니맵 구역 라벨 — 색점만으론 어느 점이 어느 구역인지 알 수 없다.
 *  호버 title 은 지연이 있고 터치에선 아예 안 뜬다 — 항상 그린다. */
function MapDistrictLabels({
  centroids,
  activeKey,
  width,
  height,
  fontSize
}: {
  centroids: {point: TravelPoint; x: number; y: number}[];
  activeKey: string;
  width: number;
  height: number;
  fontSize: number;
}) {
  return (
    <>
      {centroids.map(({point, x, y}) => {
        // 라벨이 지도 밖으로 잘리지 않게 가장자리에서 안쪽으로 민다
        const half = (point.label.length * fontSize) / 2 + 2;
        const lx = Math.max(half, Math.min(width - half, x));
        const ly = Math.min(height - 3, y + fontSize + 7);
        return (
          <text
            key={`label-${point.key}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight={800}
            fill={activeKey === point.key ? "#ffd9ae" : "#e5d8ba"}
            stroke="#0b1626"
            strokeWidth={2.6}
            paintOrder="stroke"
            style={{pointerEvents: "none", userSelect: "none"}}
          >
            {point.label}
          </text>
        );
      })}
    </>
  );
}

/** "3분 전" 식 상대 시각. 소식 줄 옆에 붙는다. */
function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export function LiveStatusPanel({
  error,
  villageState,
  news,
  favors,
  onGoToNpc
}: {
  error: string | null;
  villageState: VillageState | null;
  /** NPC 사이의 사건 피드 (GET /npc/news). 없으면 섹션을 숨긴다. */
  news?: VillageEvent[];
  /** NPC 의 미완료 부탁 (GET /npc/favors) */
  favors?: NpcFavor[];
  onGoToNpc?: (npcId: string) => void;
}) {
  // 📰 하루 요약은 정렬과 무관하게 맨 위에 고정
  const digest = news?.find(ev => ev.emoji === "📰") ?? null;
  const feed = (news ?? []).filter(ev => ev !== digest);
  const [collapsed, setCollapsed] = useState(HUD_STARTS_COLLAPSED);
  const drag = useDraggable("live-status");
  if (!villageState && !error) return null;

  return (
    <VillageFrame
      bodyClassName="p-3.5 text-xs"
      className="fixed left-4 top-[132px] z-20 hidden w-[260px] transform-gpu will-change-[backdrop-filter,transform] md:block"
      ref={drag.ref}
      style={drag.style}
      variant="plaque"
    >
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="flex w-full items-center justify-between gap-2 transition active:scale-[0.98]"
        title={collapsed ? "펼치기" : "접기"}
        {...drag.handleProps}
      >
        <span className="v-panel-title flex items-center gap-2 text-[13px]">
          <Crest name="horn" size={15} />
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff9d38] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#ff9d38]" />
          </span>
          마을 소식
        </span>
        <span
          className="text-sm text-[#a9bdd6]/50"
          style={{
            transform: collapsed ? "rotate(-90deg)" : "none",
            transition: "transform 0.2s"
          }}
        >
          ▾
        </span>
      </button>
      {!collapsed ? (
        error ? (
          <p className="mt-2 leading-5 text-[#ff9a6c]">
            {error}. 기본 마을 화면으로 표시 중입니다.
          </p>
        ) : villageState ? (
          <>
            {favors && favors.length > 0 ? (
              <button
                type="button"
                className="mt-2 flex w-full items-start gap-1.5 rounded-lg border border-[#9ad0ff]/30 bg-[#9ad0ff]/10 px-2.5 py-1.5 text-left text-[11px] leading-4 text-[#d9ecff] transition hover:bg-[#9ad0ff]/20"
                onClick={() => onGoToNpc?.(favors[0]!.about_npc_id)}
                title="눌러서 그 NPC 에게 가기"
              >
                <span className="shrink-0">📨</span>
                <span className="min-w-0 flex-1">
                  <b>{favors[0]!.npc_name}</b>의 부탁 · {favors[0]!.text}
                </span>
              </button>
            ) : null}
            {digest ? (
              <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-[#e2c078]/25 bg-[#e2c078]/10 px-2.5 py-1.5 text-[11px] leading-4 text-[#f3e6c8]">
                <span className="shrink-0">📰</span>
                <span className="min-w-0 flex-1">{digest.text}</span>
              </p>
            ) : null}
            {feed.length > 0 ? (
              <div className="mt-2 grid gap-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#e2c078]/70">
                  NPC 들 사이에서
                </p>
                {feed.slice(0, 5).map(ev => (
                  <p
                    key={ev.id}
                    className="flex items-start gap-1.5 leading-4 text-[11px] text-[#dfe7f2]"
                  >
                    <span className="shrink-0">{ev.emoji}</span>
                    <span className="min-w-0 flex-1">
                      {ev.text}
                      <span className="ml-1 text-[#a9bdd6]/45">
                        {timeAgo(ev.created_at)}
                      </span>
                    </span>
                  </p>
                ))}
              </div>
            ) : null}
            <p className="mt-2 leading-5 text-[#c9d6e8]">
              {villageState.summary}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <span className="rounded-lg border border-[#e2c078]/12 bg-white/[0.04] px-2 py-2">
                <strong className="block text-[#e2c078]">
                  {villageState.activity.github_commits}
                </strong>
                <span className="text-[9px] text-[#a9bdd6]/60">커밋</span>
              </span>
              <span className="rounded-lg border border-[#e2c078]/12 bg-white/[0.04] px-2 py-2">
                <strong className="block text-[#a8d8a0]">
                  {villageState.activity.study_minutes}
                </strong>
                <span className="text-[9px] text-[#a9bdd6]/60">학습·분</span>
              </span>
              <span className="rounded-lg border border-[#e2c078]/12 bg-white/[0.04] px-2 py-2">
                <strong className="block text-[#ff9a6c]">
                  {villageState.activity.workout_done ? "✅" : "💤"}
                </strong>
                <span className="text-[9px] text-[#a9bdd6]/60">운동</span>
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-[#a9bdd6]/50">
              오늘의 실시간 활동 · 1분마다 갱신
            </p>
            <button
              type="button"
              onClick={resetHudLayout}
              className="mt-2 w-full rounded-md border border-[#e2c078]/15 py-1 text-[10px] font-bold text-[#a9bdd6]/55 transition hover:border-[#e2c078]/45 hover:text-[#f3e6c8]"
            >
              ⤢ 패널 배치 초기화
            </button>
          </>
        ) : null
      ) : null}
    </VillageFrame>
  );
}

export function NpcQuickDock({
  activeNpcId,
  onSelect
}: {
  activeNpcId?: string;
  onSelect: (npc: NPCData) => void;
}) {
  const coreNpcs = autonomousNpcs.filter(npc => CORE_NPC_IDS.has(npc.id));
  const [collapsed, setCollapsed] = useState(HUD_STARTS_COLLAPSED);
  const drag = useDraggable("npc-dock");

  if (collapsed) {
    return (
      <VillageFrame
        bare
        bodyClassName="flex items-center gap-2 px-3.5 py-2.5 text-[13px] v-panel-title"
        className="fixed bottom-40 left-4 z-30 transform-gpu cursor-pointer will-change-[backdrop-filter,transform] transition active:scale-95 md:bottom-20"
        onClick={() => setCollapsed(false)}
        onPointerDown={drag.handleProps.onPointerDown}
        ref={drag.ref}
        style={{...drag.style, ...drag.handleProps.style}}
        variant="plaque"
      >
        <Crest name="npc" size={15} /> AI NPC{" "}
        <span className="text-[#a9bdd6]/50">▸</span>
      </VillageFrame>
    );
  }

  return (
    <VillageFrame
      bodyClassName="flex items-center gap-2 overflow-x-auto p-2"
      className="fixed bottom-40 left-4 right-4 z-30 transform-gpu will-change-[backdrop-filter,transform] md:bottom-20 md:right-auto md:w-auto md:max-w-[560px]"
      ref={drag.ref}
      style={drag.style}
      variant="plaque"
    >
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        title="접기 · 드래그로 이동"
        className="v-panel-title flex shrink-0 items-center gap-1 px-2 text-[13px] transition hover:brightness-125 active:scale-95"
        {...drag.handleProps}
      >
        <Crest name="npc" size={14} /> AI NPC{" "}
        <span className="text-[#a9bdd6]/50">▾</span>
      </button>
      {coreNpcs.map(npc => (
        <button
          className={
            activeNpcId === npc.id
              ? "shrink-0 rounded-lg border border-[#ff9d38]/50 bg-[#ff9d38]/15 px-3 py-1.5 text-center text-xs font-black text-[#ffe9d2] transition active:scale-95"
              : "shrink-0 rounded-lg border border-[#e2c078]/15 bg-white/[0.04] px-3 py-1.5 text-center text-xs font-black text-[#c9d6e8] transition hover:border-[#e2c078]/45 hover:text-[#f3e6c8] active:scale-95"
          }
          key={npc.id}
          onClick={() => onSelect(npc)}
          title={npc.agent?.specialty ?? npc.role}
          type="button"
        >
          {/* 컨셉대로 문장 / 이름 / 역할 3단. 문장은 활성일 때만 금박이고
              평소엔 달빛색이라, 여섯 칸이 한꺼번에 반짝이지 않는다. */}
          <Crest
            className="mx-auto"
            name={NPC_CREST[npc.type] ?? "npc"}
            size={16}
            tone={activeNpcId === npc.id ? undefined : "rgba(169,189,214,0.55)"}
          />
          <span className="mt-0.5 block">{npc.name}</span>
          <span className="block text-[9px] font-bold uppercase tracking-[0.1em] text-[#a9bdd6]/60">
            {npc.type}
          </span>
        </button>
      ))}
    </VillageFrame>
  );
}

export function CommandDock({
  command,
  onCommand,
  onGreet,
  onGroupTalk,
  groupTalkBusy,
  onBackToWork,
  onOpenRelations
}: {
  command: NpcCommand | null;
  onCommand: (mode: NpcCommand) => void;
  onGreet: () => void;
  onGroupTalk: () => void;
  groupTalkBusy: boolean;
  onBackToWork: () => void;
  onOpenRelations: () => void;
}) {
  const [collapsed, setCollapsed] = useState(HUD_STARTS_COLLAPSED);
  const drag = useDraggable("command-dock");
  const modes: {mode: NpcCommand; crest: CrestName; label: string}[] = [
    {mode: "gather", crest: "magnet", label: "모으기"},
    {mode: "photo", crest: "camera", label: "단체사진"},
    {mode: "party", crest: "bunting", label: "파티"},
    {mode: "follow", crest: "steps", label: "따라와"}
  ];
  const busy = command !== null;

  if (collapsed) {
    return (
      <VillageFrame
        bare
        bodyClassName="v-panel-title flex items-center gap-2 px-3.5 py-2.5 text-[13px]"
        className="fixed left-4 top-[300px] z-30 hidden transform-gpu cursor-pointer will-change-[backdrop-filter,transform] transition active:scale-95 md:block"
        onClick={() => setCollapsed(false)}
        onPointerDown={drag.handleProps.onPointerDown}
        ref={drag.ref}
        style={{...drag.style, ...drag.handleProps.style}}
        variant="plaque"
      >
        <Crest name="baton" size={15} /> 지휘{" "}
        <span className="text-[#a9bdd6]/50">▸</span>
      </VillageFrame>
    );
  }

  return (
    <VillageFrame
      bodyClassName="flex flex-col gap-1 p-2"
      className="fixed left-4 top-[300px] z-30 hidden w-[150px] transform-gpu will-change-[backdrop-filter,transform] md:block"
      ref={drag.ref}
      style={drag.style}
      variant="plaque"
    >
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="v-panel-title mb-0.5 flex items-center justify-between px-2 py-1 text-[13px] transition hover:brightness-125"
        {...drag.handleProps}
      >
        <span className="flex items-center gap-1.5">
          <Crest name="baton" size={14} /> NPC 지휘
        </span>
        <span className="text-[#a9bdd6]/50">◂</span>
      </button>
      {modes.map(item => {
        const active = command === item.mode;
        return (
          <button
            key={item.mode}
            type="button"
            onClick={() => onCommand(item.mode)}
            className={
              active
                ? "flex items-center gap-2.5 rounded-lg border border-[#ff9d38]/50 bg-[#ff9d38]/13 px-3 py-2 text-left text-xs font-black text-[#ffe9d2]"
                : "flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-[#a9bdd6] transition hover:bg-[#e2c078]/10 hover:text-[#f3e6c8] active:scale-[0.98]"
            }
          >
            <Crest
              name={item.crest}
              size={15}
              tone={active ? undefined : "rgba(169,189,214,0.62)"}
            />
            {item.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onGreet}
        className="flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-[#a9bdd6] transition hover:bg-[#e2c078]/10 hover:text-[#f3e6c8] active:scale-[0.98]"
      >
        <Crest name="wave" size={15} tone="rgba(169,189,214,0.62)" /> 인사
      </button>
      <button
        type="button"
        onClick={onGroupTalk}
        disabled={groupTalkBusy}
        className={
          groupTalkBusy
            ? "flex items-center gap-2.5 rounded-lg border border-[#ff9d38]/40 bg-[#ff9d38]/10 px-3 py-2 text-left text-xs font-black text-[#ffd9ae]"
            : "flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-[#a9bdd6] transition hover:bg-[#e2c078]/10 hover:text-[#f3e6c8] active:scale-[0.98]"
        }
      >
        <Crest
          name="chat"
          size={15}
          tone={groupTalkBusy ? undefined : "rgba(169,189,214,0.62)"}
        />{" "}
        {groupTalkBusy ? "수다 중…" : "다 같이 수다"}
      </button>
      <button
        type="button"
        onClick={onOpenRelations}
        className="flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-[#a9bdd6] transition hover:bg-[#e2c078]/10 hover:text-[#f3e6c8] active:scale-[0.98]"
      >
        <Crest name="bond" size={15} tone="rgba(169,189,214,0.62)" /> 관계도
      </button>
      <button
        type="button"
        onClick={onBackToWork}
        disabled={!busy}
        className={
          busy
            ? "mt-0.5 flex items-center gap-2.5 rounded-lg border border-[#e2c078]/45 bg-[#e2c078]/12 px-3 py-2 text-left text-xs font-black text-[#f3e6c8] transition hover:bg-[#e2c078]/20 active:scale-[0.98]"
            : "mt-0.5 flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-[#a9bdd6]/35"
        }
      >
        <Crest
          name="hammer"
          size={15}
          tone={busy ? undefined : "rgba(169,189,214,0.35)"}
        />{" "}
        다시 일하기
      </button>
    </VillageFrame>
  );
}

export function GroupChatPanel({
  lines,
  onClose
}: {
  lines: {name: string; text: string}[];
  onClose: () => void;
}) {
  return (
    <div className="v-panel fixed bottom-6 left-1/2 z-40 w-[min(92vw,460px)] -translate-x-1/2 p-4 transform-gpu will-change-[backdrop-filter,transform]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="v-panel-title text-[13px]">💬 마을 단체 수다</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="단체 수다 닫기"
          className="rounded-md border border-[#e2c078]/20 px-2 py-0.5 text-sm font-bold text-[#a9bdd6] transition hover:text-[#f3e6c8] active:scale-90"
        >
          ✕
        </button>
      </div>
      <div className="max-h-[40vh] space-y-2 overflow-y-auto">
        {lines.map((line, index) => (
          <div key={index} className="rounded-xl bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] font-black text-[#e2c078]/80">
              {line.name}
            </p>
            <p className="mt-0.5 text-sm leading-6 text-[#e8eef7]/90">
              {line.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 모바일 전용 — 하단 시트로 빠른이동·지휘·미니맵을 통합
export function MobileHud({
  activeKey,
  onTravel,
  command,
  onCommand,
  onGreet,
  onGroupTalk,
  groupTalkBusy,
  onBackToWork,
  onOpenRelations
}: {
  activeKey: string;
  onTravel: (point: TravelPoint) => void;
  command: NpcCommand | null;
  onCommand: (mode: NpcCommand) => void;
  onGreet: () => void;
  onGroupTalk: () => void;
  groupTalkBusy: boolean;
  onBackToWork: () => void;
  onOpenRelations: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"travel" | "command" | "map">("travel");
  const modes: {mode: NpcCommand; icon: string; label: string}[] = [
    {mode: "gather", icon: "🧲", label: "모으기"},
    {mode: "photo", icon: "📸", label: "단체사진"},
    {mode: "party", icon: "🎉", label: "파티"},
    {mode: "follow", icon: "🏃", label: "따라와"}
  ];
  const busy = command !== null;

  const W = 260;
  const H = 168;
  const pad = 16;
  const xs = villageBuildings.map(b => b.position[0]);
  const zs = villageBuildings.map(b => b.position[2]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const sx = (x: number) =>
    pad + ((x - minX) / (maxX - minX || 1)) * (W - 2 * pad);
  const sy = (z: number) =>
    pad + ((z - minZ) / (maxZ - minZ || 1)) * (H - 2 * pad);
  const colorOf = (key: string) =>
    TRAVEL_POINTS.find(p => p.key === key)?.color ?? "#9aa";
  const centroids = TRAVEL_POINTS.map(point => {
    const members = villageBuildings.filter(
      b => (DISTRICT_TO_TRAVEL_KEY[b.district] ?? "intro") === point.key
    );
    if (members.length === 0) return null;
    const cx =
      members.reduce((sum, b) => sum + b.position[0], 0) / members.length;
    const cz =
      members.reduce((sum, b) => sum + b.position[2], 0) / members.length;
    return {point, x: sx(cx), y: sy(cz)};
  }).filter(Boolean) as {point: TravelPoint; x: number; y: number}[];

  const chip = (active: boolean) =>
    active
      ? "flex items-center gap-2 rounded-lg border border-[#ff9d38]/50 bg-[#ff9d38]/15 px-3 py-2.5 text-left text-sm font-black text-[#ffe9d2]"
      : "flex items-center gap-2 rounded-lg border border-[#e2c078]/15 bg-white/[0.04] px-3 py-2.5 text-left text-sm font-bold text-[#c9d6e8] active:scale-95";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="이동·지휘·지도 메뉴"
        className="fixed bottom-[15rem] right-3 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#7a5a38]/60 bg-[#0b1626]/90 text-xl shadow-2xl backdrop-blur-md transform-gpu will-change-[backdrop-filter,transform] active:scale-90"
      >
        🎛️
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/45"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-[#7a5a38]/55 bg-[#0b1626]/97 p-3 pb-8 shadow-2xl backdrop-blur-md transform-gpu will-change-[backdrop-filter,transform]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#e2c078]/25" />
            <div className="mb-3 flex items-center gap-1">
              {(
                [
                  {id: "travel", label: "🧭 이동"},
                  {id: "command", label: "🎮 지휘"},
                  {id: "map", label: "🗺️ 지도"}
                ] as const
              ).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={
                    tab === t.id
                      ? "rounded-lg bg-[#ff9d38]/15 px-3 py-2 text-xs font-black text-[#ffd9ae]"
                      : "rounded-lg px-3 py-2 text-xs font-bold text-[#a9bdd6]/70"
                  }
                >
                  {t.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
                className="ml-auto rounded-lg border border-[#e2c078]/20 px-3 py-2 text-sm text-[#a9bdd6]"
              >
                ✕
              </button>
            </div>

            {tab === "travel" ? (
              <div className="grid grid-cols-2 gap-2">
                {TRAVEL_POINTS.map(point => (
                  <button
                    key={point.key}
                    type="button"
                    onClick={() => {
                      onTravel(point);
                      setOpen(false);
                    }}
                    className={chip(activeKey === point.key)}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{background: point.color}}
                    />
                    {point.label}
                  </button>
                ))}
              </div>
            ) : tab === "command" ? (
              <div className="grid grid-cols-2 gap-2">
                {modes.map(item => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => onCommand(item.mode)}
                    className={chip(command === item.mode)}
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
                <button type="button" onClick={onGreet} className={chip(false)}>
                  <span>👋</span> 인사
                </button>
                <button
                  type="button"
                  onClick={onGroupTalk}
                  disabled={groupTalkBusy}
                  className={chip(groupTalkBusy)}
                >
                  <span>💬</span> {groupTalkBusy ? "수다 중…" : "다 같이 수다"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenRelations();
                    setOpen(false);
                  }}
                  className={`col-span-2 ${chip(false)}`}
                >
                  <span>💞</span> 관계도 보기
                </button>
                <button
                  type="button"
                  onClick={onBackToWork}
                  disabled={!busy}
                  className={
                    busy
                      ? "col-span-2 rounded-lg border border-[#e2c078]/45 bg-[#e2c078]/12 px-3 py-2.5 text-sm font-black text-[#f3e6c8]"
                      : "col-span-2 rounded-lg border border-[#e2c078]/12 px-3 py-2.5 text-sm font-bold text-[#a9bdd6]/40"
                  }
                >
                  🛠️ 다시 일하기
                </button>
              </div>
            ) : (
              <div className="grid place-items-center">
                <svg
                  width={W}
                  height={H}
                  viewBox={`0 0 ${W} ${H}`}
                  className="rounded-lg bg-white/[0.03]"
                >
                  {villageBuildings.map(b => {
                    const key = DISTRICT_TO_TRAVEL_KEY[b.district] ?? "intro";
                    const active = activeKey === key;
                    return (
                      <circle
                        key={b.id}
                        cx={sx(b.position[0])}
                        cy={sy(b.position[2])}
                        r={active ? 4 : 3}
                        fill={colorOf(key)}
                        fillOpacity={active ? 1 : 0.65}
                      />
                    );
                  })}
                  {centroids.map(({point, x, y}) => (
                    <g
                      key={point.key}
                      onClick={() => {
                        onTravel(point);
                        setOpen(false);
                      }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={16}
                        fill={point.color}
                        fillOpacity={0.001}
                        style={{pointerEvents: "all"}}
                      >
                        <title>{point.label}</title>
                      </circle>
                      {activeKey === point.key ? (
                        <circle
                          cx={x}
                          cy={y}
                          r={14}
                          fill="none"
                          stroke={point.color}
                          strokeWidth={1.6}
                          strokeOpacity={0.9}
                        />
                      ) : null}
                    </g>
                  ))}
                  <MapDistrictLabels
                    centroids={centroids}
                    activeKey={activeKey}
                    width={W}
                    height={H}
                    fontSize={9}
                  />
                </svg>
                <p className="mt-2 text-[10px] text-[#a9bdd6]/60">
                  구역을 누르면 그쪽으로 이동
                </p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function QuickTravelDock({
  activeKey,
  onTravel
}: {
  activeKey: string;
  onTravel: (point: TravelPoint) => void;
}) {
  const [collapsed, setCollapsed] = useState(HUD_STARTS_COLLAPSED);
  const drag = useDraggable("travel-dock");

  if (collapsed) {
    return (
      <VillageFrame
        bare
        bodyClassName="v-panel-title flex items-center gap-2 px-3.5 py-2.5 text-[13px]"
        className="fixed right-4 top-[80px] z-30 hidden transform-gpu cursor-pointer will-change-[backdrop-filter,transform] transition active:scale-95 md:block"
        onClick={() => setCollapsed(false)}
        onPointerDown={drag.handleProps.onPointerDown}
        ref={drag.ref}
        style={{...drag.style, ...drag.handleProps.style}}
        variant="plaque"
      >
        <Crest name="compass" size={15} /> 이동{" "}
        <span className="text-[#a9bdd6]/50">◂</span>
      </VillageFrame>
    );
  }

  return (
    <VillageFrame
      bodyClassName="flex flex-col gap-1 p-2"
      className="fixed right-4 top-[80px] z-30 hidden w-[152px] transform-gpu will-change-[backdrop-filter,transform] md:block"
      ref={drag.ref}
      style={drag.style}
      variant="plaque"
    >
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="v-panel-title mb-0.5 flex items-center justify-between px-2 py-1 text-[13px] transition hover:brightness-125"
        {...drag.handleProps}
      >
        <span className="flex items-center gap-1.5">
          <Crest name="compass" size={14} /> 빠른 이동
        </span>
        <span className="text-[#a9bdd6]/50">▴</span>
      </button>
      {TRAVEL_POINTS.map(point => {
        const active = activeKey === point.key;
        return (
          <button
            key={point.key}
            type="button"
            onClick={() => onTravel(point)}
            className={
              active
                ? "flex items-center gap-2.5 rounded-lg border border-[#ff9d38]/45 bg-[#ff9d38]/12 px-3 py-2 text-left text-xs font-black text-[#ffe9d2]"
                : "flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-bold text-[#a9bdd6] transition hover:bg-[#e2c078]/10 hover:text-[#f3e6c8] active:scale-[0.98]"
            }
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                background: point.color,
                boxShadow: active ? `0 0 8px ${point.color}` : "none"
              }}
            />
            {point.label}
          </button>
        );
      })}
    </VillageFrame>
  );
}

export function Minimap({
  activeKey,
  onTravel
}: {
  activeKey: string;
  onTravel: (point: TravelPoint) => void;
}) {
  const [collapsed, setCollapsed] = useState(HUD_STARTS_COLLAPSED);
  const drag = useDraggable("minimap");

  const W = 172;
  const H = 156;
  const pad = 16;
  const xs = villageBuildings.map(b => b.position[0]);
  const zs = villageBuildings.map(b => b.position[2]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const sx = (x: number) =>
    pad + ((x - minX) / (maxX - minX || 1)) * (W - 2 * pad);
  const sy = (z: number) =>
    pad + ((z - minZ) / (maxZ - minZ || 1)) * (H - 2 * pad);
  const colorOf = (key: string) =>
    TRAVEL_POINTS.find(p => p.key === key)?.color ?? "#9aa";

  // 구역별 중심점 (클릭 히트 영역 + 강조용)
  const centroids = TRAVEL_POINTS.map(point => {
    const members = villageBuildings.filter(
      b => (DISTRICT_TO_TRAVEL_KEY[b.district] ?? "intro") === point.key
    );
    if (members.length === 0) return null;
    const cx =
      members.reduce((sum, b) => sum + b.position[0], 0) / members.length;
    const cz =
      members.reduce((sum, b) => sum + b.position[2], 0) / members.length;
    return {point, x: sx(cx), y: sy(cz)};
  }).filter(Boolean) as {point: TravelPoint; x: number; y: number}[];

  if (collapsed) {
    return (
      <VillageFrame
        bare
        bodyClassName="v-panel-title flex items-center gap-2 px-3.5 py-2.5 text-[13px]"
        // bottom-6 이 아니라 bottom-20 이다 — 그 자리엔 「제작 의뢰」 버튼이
        // 있고(z-52 라 이쪽이 진다), 접힌 미니맵은 작아서 그 밑에 통째로
        // 숨어 버렸다. 펼친 쪽도 같은 값을 써서 둘이 위아래로 쌓이게 한다.
        className="fixed bottom-20 right-4 z-30 hidden transform-gpu cursor-pointer will-change-[backdrop-filter,transform] transition active:scale-95 md:block"
        onClick={() => setCollapsed(false)}
        onPointerDown={drag.handleProps.onPointerDown}
        ref={drag.ref}
        style={{...drag.style, ...drag.handleProps.style}}
        variant="plaque"
      >
        <Crest name="map" size={15} /> 지도
      </VillageFrame>
    );
  }

  return (
    <VillageFrame
      bodyClassName="p-2.5"
      className="fixed bottom-20 right-4 z-30 hidden transform-gpu will-change-[backdrop-filter,transform] md:block"
      ref={drag.ref}
      style={drag.style}
      variant="plaque"
    >
      <div
        className="mb-1.5 flex cursor-grab items-center justify-between px-1"
        {...drag.handleProps}
      >
        <span className="v-panel-title flex items-center gap-1.5 text-[13px]">
          <Crest name="map" size={14} /> 미니맵
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="미니맵 접기"
          className="text-[11px] font-black text-[#a9bdd6]/50 transition hover:text-[#f3e6c8]"
        >
          ▾
        </button>
      </div>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="rounded-lg bg-white/[0.03]"
      >
        {villageBuildings.map(b => {
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
            <g
              key={point.key}
              style={{cursor: "pointer"}}
              onClick={() => onTravel(point)}
            >
              {active ? (
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="none"
                  stroke={point.color}
                  strokeWidth={1.4}
                  strokeOpacity={0.9}
                />
              ) : null}
              <circle
                cx={x}
                cy={y}
                r={13}
                fill={point.color}
                fillOpacity={0.001}
                style={{pointerEvents: "all"}}
              >
                <title>{point.label}</title>
              </circle>
            </g>
          );
        })}
        <MapDistrictLabels
          centroids={centroids}
          activeKey={activeKey}
          width={W}
          height={H}
          fontSize={8}
        />
      </svg>
      <p className="mt-1.5 px-1 text-[9px] leading-tight text-[#a9bdd6]/55">
        구역을 누르면 그쪽으로 이동
      </p>
    </VillageFrame>
  );
}

/**
 * 구역에 도착하면 화면 아래에 뜨는 **"이 구역의 건물" 띠**.
 *
 * 3D 간판(`Building.tsx` v-sign)은 거리에 비례해 줄어들어, 섬을 내려다보는
 * 카메라 거리(광장 쪽 13 뒤·높이 9)에서는 글자가 2~3px 다 — 사실상 없는 것과
 * 같다. 그래서 간판을 키우는 대신 2D 로 한 번 더 적는다: 이름 + 꼬리표, 누르면
 * 바로 입장, 올리면 **그 건물만** 강조(`focusBuildingId`). 마우스가 없는 화면
 * 에서도 똑같이 읽히고 눌린다.
 *
 * 광장에선 안 뜬다(광장은 "구역"이 아니다). 패널·대화창·환영 카드가 떠 있을
 * 때도 숨긴다 — 같은 자리에 두 장이 겹친다.
 */
export function DistrictStrip({
  sectionId,
  onEnter,
  onFocus
}: {
  sectionId: SectionId;
  onEnter: (buildingId: string) => void;
  onFocus: (buildingId: string | null) => void;
}) {
  const buildings = villageBuildings.filter(
    b => b.sectionId === sectionId && b.district !== "plaza"
  );
  // 띠가 사라질 때 강조도 같이 풀어야 한다 — 안 풀면 마지막에 올렸던 건물
  // 한 채만 켜진 채로 남는다.
  useEffect(() => () => onFocus(null), [onFocus]);

  const first = buildings[0];
  if (!first) return null;
  const key = DISTRICT_TO_TRAVEL_KEY[first.district] ?? sectionId;
  const point = TRAVEL_POINTS.find(p => p.key === key);
  const tone = districtTone(key);
  const label = point?.label ?? first.district;

  return (
    <VillageFrame
      bodyClassName="flex flex-col gap-2 px-3 py-2.5"
      className="fixed bottom-3 left-1/2 z-30 w-[min(94vw,700px)] -translate-x-1/2 transform-gpu animate-[fadeIn_0.3s_ease] will-change-[backdrop-filter,transform] md:bottom-6"
      variant="plaque"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="v-panel-title flex items-center gap-1.5 text-[12px]">
          <Crest name={tone.crest as CrestName} size={14} /> {label} 구역 ·{" "}
          {buildings.length}채
        </p>
        <p className="text-[11px] font-bold text-[#a9bdd6]/70">
          건물을 고르면 바로 들어갑니다
        </p>
      </div>
      <div className="flex max-h-[64px] flex-wrap gap-1.5 overflow-y-auto md:max-h-[96px]">
        {buildings.map(b => (
          <button
            key={b.id}
            type="button"
            onClick={() => onEnter(b.id)}
            onMouseEnter={() => onFocus(b.id)}
            onMouseLeave={() => onFocus(null)}
            onFocus={() => onFocus(b.id)}
            onBlur={() => onFocus(null)}
            className="flex items-center gap-2 rounded-lg border border-[#e2c078]/25 bg-white/[0.04] px-2.5 py-1.5 text-left transition hover:border-[#e2c078]/70 hover:bg-[#e2c078]/10 active:scale-95"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background: b.accentColor,
                boxShadow: `0 0 6px ${b.accentColor}`
              }}
            />
            <span className="flex flex-col leading-tight">
              <span className="text-[12px] font-black text-[#eef2f8]">
                {b.name}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#a9bdd6]/70">
                {b.label}
              </span>
            </span>
          </button>
        ))}
      </div>
    </VillageFrame>
  );
}

export function KonamiBurst() {
  const emojis = ["🎉", "✨", "🏘️", "🤖", "🌟", "💾", "🚀", "🎮", "🛸", "⭐"];
  const pieces = Array.from({length: 40}, (_, i) => ({
    left: (i * 53) % 100,
    delay: (i % 12) * 0.18,
    dur: 3 + (i % 5) * 0.6,
    emoji: emojis[i % emojis.length],
    size: 18 + (i % 4) * 9
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 select-none"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animation: `konamiFall ${p.dur}s linear ${p.delay}s both`
          }}
        >
          {p.emoji}
        </span>
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#00ff88]/40 bg-[#050d1a]/90 px-7 py-5 text-center shadow-2xl backdrop-blur-md transform-gpu will-change-[backdrop-filter,transform]">
        <p className="font-mono text-xl font-black text-[#00ff88]">
          🎉 히든 모드 발견!
        </p>
        <p className="mt-1.5 font-mono text-xs text-white/60">
          개발자만 아는 그 코드를 입력했군요 😎
        </p>
      </div>
    </div>
  );
}

export function ControlsHint() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 7000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-[80px] z-30 flex -translate-x-1/2 animate-[fadeIn_0.4s_ease] items-center gap-3 rounded-full border border-[#7a5a38]/60 bg-[#0b1626]/90 px-4 py-2 text-[11px] font-bold text-[#c9d6e8] shadow-2xl backdrop-blur-md transform-gpu will-change-[backdrop-filter,transform]">
      <span className="flex items-center gap-1.5">
        <span className="text-sm">🖱️</span> 건물 클릭해 입장
      </span>
      <span className="text-[#a9bdd6]/30">·</span>
      <span className="flex items-center gap-1.5">
        <span className="text-sm">📍</span> 바닥 클릭해 이동
      </span>
      <span className="text-[#a9bdd6]/30">·</span>
      <span className="flex items-center gap-1.5">
        <span className="text-sm">🔄</span> 드래그·휠로 둘러보기
      </span>
    </div>
  );
}

export function EavesdropButton({
  aName,
  bName,
  onOpen
}: {
  aName: string;
  bName: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed left-1/2 top-[112px] z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#e2c078]/45 bg-[#0b1626]/90 px-4 py-2 text-[11px] font-black text-[#ffd9ae] shadow-2xl backdrop-blur-md transform-gpu will-change-[backdrop-filter,transform] transition hover:bg-[#ff9d38]/12 active:scale-95"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff9d38] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff9d38]" />
      </span>
      💬 {aName} ↔ {bName} 대화 · 엿듣기
    </button>
  );
}

export function EavesdropPanel({
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
    <div className="v-panel fixed bottom-6 left-1/2 z-40 w-[min(92vw,460px)] -translate-x-1/2 p-4 transform-gpu will-change-[backdrop-filter,transform]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="v-panel-title text-[13px]">
          🕵 엿듣는 중 · {aName} ↔ {bName}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="엿듣기 닫기"
          className="rounded-md border border-[#e2c078]/20 px-2 py-0.5 text-sm font-bold text-[#a9bdd6] transition hover:text-[#f3e6c8] active:scale-90"
        >
          ✕
        </button>
      </div>
      <div className="space-y-2">
        {lines.map((line, index) => {
          const isA = line.name === aName;
          return (
            <div key={index} className={isA ? "mr-8" : "ml-8"}>
              <p
                className={`text-[10px] font-black ${
                  isA ? "text-[#8fb8e8]/80" : "text-[#ff9a6c]/80"
                } ${isA ? "" : "text-right"}`}
              >
                {line.name}
              </p>
              <div
                className={
                  isA
                    ? "mt-0.5 rounded-2xl rounded-bl-sm bg-[#6ea8dc]/12 px-3 py-2 text-sm leading-6 text-[#e3eefa]"
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

export function EncounterNotice({text}: {text: string}) {
  return (
    <div className="fixed left-1/2 top-[78px] z-30 -translate-x-1/2 rounded-lg border border-[#e2c078]/35 bg-[#0b1626]/88 px-4 py-2 text-xs font-black text-[#e2c078] shadow-2xl backdrop-blur-md transform-gpu will-change-[backdrop-filter,transform]">
      {text}
    </div>
  );
}

export function MilestoneBanner({text}: {text: string}) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-1/3 z-[60] -translate-x-1/2 animate-[fadeIn_0.4s_ease] rounded-2xl border border-[#ff9ad9]/40 bg-[#0b1626]/92 px-6 py-4 text-center shadow-2xl backdrop-blur-md transform-gpu will-change-[backdrop-filter,transform]">
      <p className="v-serif text-[12px] text-[#ff9ad9]">관계 사건</p>
      <p className="mt-1.5 text-lg font-black text-[#f3e6c8]">{text}</p>
    </div>
  );
}

/** npc_id → 이름. 관계 행은 2026-08-22 부터 실제 npc_id 라 로스터에서 찾는다. */
function npcName(id: string): string {
  return autonomousNpcs.find(n => n.id === id)?.name ?? id;
}

function RelRow({r}: {r: NpcRelationshipRow}) {
  const color =
    r.affinity >= 6 ? "#7ee787" : r.affinity <= -6 ? "#ff8a8a" : "#94a3b8";
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#e2c078]/12 bg-white/[0.04] px-3 py-2">
      <span className="text-xs font-bold text-[#dfe7f2]">
        {npcName(r.npc_a)} ↔ {npcName(r.npc_b)}
      </span>
      <span className="font-mono text-[11px]" style={{color}}>
        {r.vibe} ({r.affinity >= 0 ? "+" : ""}
        {r.affinity})
        {r.fights || r.reconciliations ? (
          <span className="ml-2 text-[#a9bdd6]/60">
            싸움 {r.fights} · 화해 {r.reconciliations}
          </span>
        ) : null}
      </span>
    </div>
  );
}

const MEMORY_ICON: Record<string, string> = {
  encounter: "💬",
  incident: "⚡",
  gossip: "🗣️",
  relay: "💌"
};

const MILESTONE_ICON = (m: string) =>
  m.includes("절친")
    ? "💞"
    : m.includes("화해")
    ? "🤝"
    : m.includes("앙숙")
    ? "💔"
    : "💢";

/** "사이가 틀어졌어요" → "틀어짐" — 연표 한 줄에 들어가게 */
function shortMilestone(m: string): string {
  if (m.includes("절친")) return "절친";
  if (m.includes("화해")) return "화해";
  if (m.includes("앙숙")) return "앙숙";
  if (m.includes("틀어")) return "틀어짐";
  return m;
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 관계도에서 노드를 눌렀을 때 — 그 NPC 가 낀 관계의 연표(마일스톤 있는 쌍만, 최대 3쌍) */
function NpcTimeline({
  npcId,
  rels
}: {
  npcId: string;
  rels: NpcRelationshipRow[];
}) {
  const rows = rels
    .filter(r => (r.npc_a === npcId || r.npc_b === npcId) && r.timeline?.length)
    .sort((x, y) => y.timeline.length - x.timeline.length)
    .slice(0, 3);
  if (!rows.length) return null;
  return (
    <div className="mt-3 rounded-lg border border-[#e2c078]/15 bg-white/[0.03] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#e2c078]/70">
        연표
      </p>
      <ul className="mt-1 grid gap-1">
        {rows.map(r => {
          const other = r.npc_a === npcId ? r.npc_b : r.npc_a;
          return (
            <li
              key={`${r.npc_a}:${r.npc_b}`}
              className="text-[11px] leading-4 text-[#dfe7f2]"
            >
              <span className="font-bold text-[#f3e6c8]">{npcName(other)}</span>
              <span className="ml-1.5 text-[#a9bdd6]/80">
                {r.timeline
                  .map(
                    t =>
                      `${shortDate(t.created_at)} ${MILESTONE_ICON(
                        t.milestone
                      )} ${shortMilestone(t.milestone)}`
                  )
                  .join(" → ")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** 관계도에서 노드를 눌렀을 때 — 그 NPC 의 최근 기억 */
function NpcMemoryList({npcId}: {npcId: string}) {
  const [items, setItems] = useState<NpcMemoryItem[] | null>(null);
  useEffect(() => {
    let ignore = false;
    setItems(null);
    fetchNpcMemory(npcId)
      .then(rows => {
        if (!ignore) setItems(rows);
      })
      .catch(() => {
        if (!ignore) setItems([]);
      });
    return () => {
      ignore = true;
    };
  }, [npcId]);
  return (
    <div className="mt-3 rounded-lg border border-[#e2c078]/15 bg-white/[0.03] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#e2c078]/70">
        {npcName(npcId)}의 기억
      </p>
      {items === null ? (
        <p className="mt-1 text-xs text-[#a9bdd6]/60">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="mt-1 text-xs text-[#a9bdd6]/60">
          아직 기억나는 일이 없어요.
        </p>
      ) : (
        <ul className="mt-1 grid gap-1">
          {items.slice(0, 6).map((m, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-[11px] leading-4 text-[#dfe7f2]"
            >
              <span className="shrink-0">{MEMORY_ICON[m.kind] ?? "•"}</span>
              <span className="min-w-0 flex-1">
                {m.text}
                <span className="ml-1 text-[#a9bdd6]/45">
                  {timeAgo(m.created_at)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RelationshipViewer({onClose}: {onClose: () => void}) {
  const [rels, setRels] = useState<NpcRelationshipRow[] | null>(null);
  const [err, setErr] = useState(false);
  // 노드를 누르면 그 NPC 의 기억을 아래에 보여 준다. 다시 누르면 닫힘.
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchRelationships()
      .then(r => {
        if (!ignore) setRels(r);
      })
      .catch(() => {
        if (!ignore) setErr(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const W = 340;
  const H = 330;
  const cx = 170;
  const cy = 158;
  const R = 118;
  // 노드 = 관계에 등장하는 NPC 중 |친밀도| 합이 큰 순서로 최대 10명.
  // 분신(정재훈)은 가운데, 나머지는 고리에. 관계가 NPC 개인 단위라 전부 그리면
  // 30명이 넘어 읽을 수 없다.
  const weight = new Map<string, number>();
  for (const r of rels ?? []) {
    weight.set(r.npc_a, (weight.get(r.npc_a) ?? 0) + Math.abs(r.affinity) + 1);
    weight.set(r.npc_b, (weight.get(r.npc_b) ?? 0) + Math.abs(r.affinity) + 1);
  }
  const hub = "overseer-npc";
  const ring = [...weight.entries()]
    .filter(([id]) => id !== hub)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);
  const shown = new Set([hub, ...ring]);
  const posOf = (id: string) => {
    if (id === hub) return {x: cx, y: cy};
    const i = ring.indexOf(id);
    if (i < 0) return null;
    const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
    return {x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R};
  };
  const edgeColor = (aff: number) =>
    aff >= 6 ? "#16a34a" : aff <= -6 ? "#ef4444" : "#64748b";
  const allKinds = weight.has(hub) ? [hub, ...ring] : ring;
  const sorted = (rels ?? []).slice().sort((a, b) => b.affinity - a.affinity);
  const top = sorted.filter(r => r.affinity >= 6).slice(0, 2);
  const bottom = sorted
    .filter(r => r.affinity <= -6)
    .slice(-2)
    .reverse();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4"
      onClick={onClose}
    >
      <div
        className="v-panel w-[min(94vw,420px)] p-5 transform-gpu will-change-[backdrop-filter,transform]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-[#a9bdd6]/70">
              NPC들이 지내며 쌓은 사이
            </p>
            <h2 className="v-panel-title mt-1 text-xl">마을 관계도 💞</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="관계도 닫기"
            className="text-[#a9bdd6]/60 transition hover:text-[#f3e6c8]"
          >
            ✕
          </button>
        </div>

        {err ? (
          <p className="mt-4 text-sm leading-6 text-[#a9bdd6]">
            백엔드에 연결하지 못했어요. 서버를 켜면 관계가 보여요.
          </p>
        ) : !rels ? (
          <p className="mt-4 text-sm text-[#a9bdd6]/70">불러오는 중…</p>
        ) : (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
              {rels.map((r, i) => {
                if (!shown.has(r.npc_a) || !shown.has(r.npc_b)) return null;
                const a = posOf(r.npc_a);
                const b = posOf(r.npc_b);
                if (!a || !b) return null;
                const history = r.fights + r.reconciliations;
                return (
                  <g key={i}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={edgeColor(r.affinity)}
                      strokeWidth={1 + Math.min(4, Math.abs(r.affinity) / 6)}
                      strokeOpacity={0.7}
                      strokeLinecap="round"
                    />
                    {history > 0 ? (
                      // 사연 있는 사이 — 간선 중점에 역사 뱃지 (싸움이 많으면 💥, 화해가 많거나 같으면 🤝)
                      <text
                        x={(a.x + b.x) / 2}
                        y={(a.y + b.y) / 2 + 3}
                        fontSize={9}
                        textAnchor="middle"
                      >
                        {r.fights > r.reconciliations ? "💥" : "🤝"}
                        <tspan dy={1} fontSize={7} fill="#a9bdd6">
                          {history}
                        </tspan>
                      </text>
                    ) : null}
                  </g>
                );
              })}
              {allKinds.map(kind => {
                const p = posOf(kind);
                if (!p) return null;
                const isHub = kind === hub;
                const isSel = selected === kind;
                return (
                  <g
                    key={kind}
                    style={{cursor: "pointer"}}
                    onClick={() => setSelected(s => (s === kind ? null : kind))}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHub ? 15 : 12}
                      fill={isHub ? "#f5c542" : isSel ? "#2b4a6f" : "#13223a"}
                      stroke={isSel ? "#ffd27a" : "#e2c078"}
                      strokeWidth={isSel ? 2.4 : 1.2}
                    />
                    <text
                      x={p.x}
                      y={p.y + (isHub ? 27 : 25)}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="800"
                      fill="#e5d8ba"
                    >
                      {npcName(kind)}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="flex items-center justify-center gap-3 text-[10px] text-[#a9bdd6]/70">
              <span>
                <span style={{color: "#16a34a"}}>━</span> 친함
              </span>
              <span>
                <span style={{color: "#64748b"}}>━</span> 보통
              </span>
              <span>
                <span style={{color: "#ef4444"}}>━</span> 나쁨
              </span>
            </div>
            {selected ? (
              <NpcTimeline npcId={selected} rels={rels ?? []} />
            ) : null}
            {selected ? <NpcMemoryList npcId={selected} /> : null}
            {top.length || bottom.length ? (
              <div className="mt-3 grid gap-1.5">
                {top.map((r, i) => (
                  <RelRow key={`t${i}`} r={r} />
                ))}
                {bottom.map((r, i) => (
                  <RelRow key={`b${i}`} r={r} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-center text-xs leading-5 text-[#a9bdd6]/70">
                아직 관계가 쌓이지 않았어요. 마을을 조금 지켜보면 사이가 생겨요.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
