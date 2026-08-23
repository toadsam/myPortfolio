"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import {isAtelierNpc} from "@/data/atelierRoster";
import {npcDefaultPresetQuestions} from "@/data/npcRoster";
import {sectionMeta} from "@/lib/constants";
import {
  fetchNpcPresets,
  sendNpcMessage,
  trackVisitorEvent
} from "@/lib/liveApi";
import {moodLabel} from "@/lib/liveState";
import type {
  NpcActionDefinition,
  NpcRuntimeState,
  NpcState,
  NpcSuggestedAction,
  NpcFavor,
  NpcRelay
} from "@/types/live";
import type {NPCData, SectionId} from "@/types/portfolio";

interface DialogueBoxProps {
  npc: NPCData | null;
  npcState?: NpcState;
  npcRuntimeState?: NpcRuntimeState;
  onClose: () => void;
  onOpenSection: (sectionId: SectionId) => void;
  onRunAction: (npc: NPCData, action: NpcActionDefinition) => void;
  /** 연락 담당 NPC 대화에서만 노출되는 의뢰 공방 진입 */
  onOpenCommission?: () => void;
  onSuggestedAction: (action: NpcSuggestedAction | null | undefined) => void;
  /** 방문자 말이 다른 NPC 와의 관계를 움직였을 때 (마일스톤 배너용) */
  onRelay?: (relay: NpcRelay) => void;
  /** NPC 가 부탁을 건넸을 때 (HUD 부탁 줄 갱신용) */
  onFavor?: (favor: NpcFavor) => void;
  /** 부탁 칩을 눌러 그 NPC 에게 가기 */
  onGoToNpc?: (npcId: string) => void;
  /** 백엔드/AI 연결 불가 (기본 대사 모드) */
  aiOffline?: boolean;
}

interface ChatLine {
  role: "visitor" | "npc" | "relay" | "favor";
  text: string;
  /** favor 칩: 눌러서 갈 NPC */
  goTo?: string;
}

const MOOD_LABELS: Record<string, string> = {
  sleepy: "졸림",
  calm: "차분함",
  busy: "바쁨",
  proud: "뿌듯함",
  training: "훈련중",
  curious: "호기심",
  focused: "집중",
  worried: "걱정",
  excited: "신남"
};

const MOOD_EMOJI: Record<string, string> = {
  sleepy: "😴",
  calm: "🙂",
  busy: "😅",
  proud: "😎",
  training: "💪",
  curious: "🤔",
  focused: "🧐",
  worried: "😟",
  excited: "🤩"
};

function storageKey(npcId: string) {
  return `portfolio-village-chat:${npcId}`;
}

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function introLine(npc: NPCData) {
  return `안녕하세요! ${npc.name}입니다. ${npc.role} 담당이에요. 무엇이든 편하게 물어보세요 :)`;
}

/** 백엔드 relations.canon 의 contact 판정과 같은 규칙 — 두 곳이 어긋나면 안 된다. */
function isContactNpc(npcId: string) {
  return (
    npcId === "contact-npc" ||
    npcId.includes("post") ||
    npcId.includes("contact")
  );
}

export function DialogueBox({
  npc,
  npcState,
  npcRuntimeState,
  onClose,
  onOpenSection,
  onOpenCommission,
  onSuggestedAction,
  onRelay,
  onFavor,
  onGoToNpc,
  aiOffline
}: DialogueBoxProps) {
  const section = npc
    ? sectionMeta.find(item => item.id === npc.sectionId)
    : null;
  const [message, setMessage] = useState("");
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [remotePresetQuestions, setRemotePresetQuestions] = useState<string[]>(
    []
  );
  const offline = Boolean(aiOffline) || fallbackMode;
  const agent = npc?.agent;
  const mood = moodLabel(npcRuntimeState?.mood ?? npcState?.mood);
  const moodText = MOOD_LABELS[mood] ?? mood;
  const moodEmoji = MOOD_EMOJI[mood] ?? "🙂";

  const presetQuestions = useMemo(() => {
    const agentQuestions = agent?.presetQuestions ?? [];
    // 공방 NPC는 백엔드 프리셋을 쓰지 않는다. 백엔드는 catalog 의 모든 NPC에
    // 마을 기준 기본 질문("대표 프로젝트 추천해줘"…)을 시드하는데, 그게 remote 로
    // 먼저 들어와 slice(0,3) 을 다 차지하는 바람에 공방 식구가 마을 안내원처럼
    // 말을 걸었다. 공방 질문의 단일 출처는 atelierRoster 다.
    if (npc && isAtelierNpc(npc.id)) return agentQuestions.slice(0, 3);
    return uniqueItems([
      ...remotePresetQuestions,
      ...agentQuestions,
      ...npcDefaultPresetQuestions
    ]).slice(0, 3);
  }, [agent, npc, remotePresetQuestions]);

  const recentMessages = useMemo(
    () =>
      lines
        .slice(-8)
        .map(
          line =>
            `${line.role === "visitor" ? "방문자" : npc?.name ?? "NPC"}: ${
              line.text
            }`
        ),
    [lines, npc?.name]
  );

  // 첫 대면: 저장된 기록 있으면 복원, 없으면 자기소개로 시작
  useEffect(() => {
    if (!npc) {
      setLines([]);
      setMessage("");
      setRemotePresetQuestions([]);
      return;
    }
    try {
      const saved = window.localStorage.getItem(storageKey(npc.id));
      if (saved) {
        const parsed = JSON.parse(saved) as ChatLine[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLines(parsed);
          setMessage("");
          return;
        }
      }
    } catch {
      window.localStorage.removeItem(storageKey(npc.id));
    }
    setLines([{role: "npc", text: introLine(npc)}]);
    setMessage("");
  }, [npc]);

  useEffect(() => {
    if (!npc) return;
    let ignore = false;
    fetchNpcPresets()
      .then(presets => {
        if (ignore) return;
        const preset = presets.find(item => item.npc_id === npc.id);
        setRemotePresetQuestions(preset?.enabled ? preset.questions : []);
      })
      .catch(() => {
        if (!ignore) setRemotePresetQuestions([]);
      });
    return () => {
      ignore = true;
    };
  }, [npc]);

  useEffect(() => {
    if (!npc || lines.length === 0) return;
    window.localStorage.setItem(
      storageKey(npc.id),
      JSON.stringify(lines.slice(-30))
    );
  }, [lines, npc]);

  useEffect(() => {
    setFallbackMode(false);
  }, [npc]);

  async function ask(text: string) {
    if (!npc || !text.trim() || isSending) return;
    const nextMessage = text.trim();
    trackVisitorEvent({
      event_type: "npc_message",
      target_id: npc.id,
      label: npc.name,
      metadata: {sectionId: npc.sectionId, length: nextMessage.length}
    });
    setLines(current => current.concat({role: "visitor", text: nextMessage}));
    setMessage("");
    setIsSending(true);

    // AI에 현재 기분 + 최근 사건(주변 NPC와의 일)을 컨텍스트로 함께 전달
    const context: string[] = [`[상태] 지금 기분: ${moodText}`];
    if (npcRuntimeState?.memory)
      context.push(`[최근 사건] ${npcRuntimeState.memory}`);
    context.push(...recentMessages);

    try {
      const response = await sendNpcMessage(npc.id, nextMessage, context);
      onSuggestedAction(response.suggested_action);
      setFallbackMode(!response.used_ai);
      const relay = response.relay ?? null;
      const favor = response.favor ?? null;
      setLines(current =>
        current.concat(
          {role: "npc", text: response.reply},
          // 방문자의 말이 다른 NPC 와의 사이를 움직였으면 대화 줄에 칩으로 남긴다
          ...(relay
            ? [
                {
                  role: "relay" as const,
                  text: relay.favor_done
                    ? `🎁 부탁 완료 — ${relay.about_name}에게 전해졌어요 (+${
                        relay.delta
                      })${relay.milestone ? ` · ${relay.milestone}!` : ""}`
                    : `💌 ${relay.about_name}에게 전해졌어요 (${
                        relay.delta > 0 ? "+" : ""
                      }${relay.delta})${
                        relay.milestone ? ` · ${relay.milestone}!` : ""
                      }`
                }
              ]
            : []),
          // NPC 가 부탁을 건넸다 — 눌러서 그 NPC 에게 갈 수 있는 칩
          ...(favor
            ? [
                {
                  role: "favor" as const,
                  text: `📨 부탁: ${favor.text} → ${favor.about_name}에게 가기`,
                  goTo: favor.about_npc_id
                }
              ]
            : [])
        )
      );
      if (relay) onRelay?.(relay);
      if (favor) onFavor?.(favor);
    } catch {
      setFallbackMode(true);
      setLines(current =>
        current.concat({
          role: "npc",
          text: "지금은 잠깐 생각이 끊겼어요. 잠시 후 다시 물어봐 주세요."
        })
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(message);
  }

  function clearHistory() {
    if (!npc) return;
    window.localStorage.removeItem(storageKey(npc.id));
    setLines([{role: "npc", text: introLine(npc)}]);
  }

  return (
    <AnimatePresence>
      {npc ? (
        <motion.aside
          animate={{opacity: 1, y: 0}}
          className="v-panel fixed bottom-24 left-4 z-30 flex max-h-[70vh] w-[min(calc(100vw-32px),400px)] flex-col overflow-hidden md:bottom-6 md:left-6"
          exit={{opacity: 0, y: 18}}
          initial={{opacity: 0, y: 18}}
          role="dialog"
        >
          {/* 헤더 — 아이콘 + 이름 + 역할 + 기분 + 닫기 */}
          <div className="flex items-center justify-between gap-3 border-b border-[#e2c078]/15 bg-[#0e1a2e] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ff9d38]/45 bg-[#ff9d38]/10 text-lg">
                🤖
                <span
                  className="absolute -bottom-1 -right-1 text-base"
                  title={moodText}
                >
                  {moodEmoji}
                </span>
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="v-panel-title truncate text-base">{npc.name}</p>
                  {offline ? (
                    <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black text-amber-300">
                      ⚠ AI 오프라인
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-[11px] font-bold text-[#a9bdd6]/80">
                  {npc.role} · {moodText}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                className="rounded-md px-2 py-1 text-xs text-[#a9bdd6]/60 transition hover:text-[#f3e6c8]"
                onClick={clearHistory}
                title="대화 초기화"
                aria-label="대화 초기화"
                type="button"
              >
                ↺
              </button>
              <button
                className="rounded-md border border-[#e2c078]/20 px-2.5 py-1 text-sm font-bold text-[#a9bdd6] transition hover:border-[#e2c078]/55 hover:text-[#f3e6c8]"
                onClick={onClose}
                title="닫기"
                aria-label="대화창 닫기"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 채팅 */}
          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {lines.map((line, index) =>
              line.role === "favor" ? (
                <button
                  type="button"
                  className="mx-auto w-fit max-w-full rounded-full border border-[#9ad0ff]/35 bg-[#9ad0ff]/10 px-3 py-1 text-left text-[11px] font-bold text-[#d9ecff] transition hover:bg-[#9ad0ff]/20"
                  key={`${line.role}-${index}`}
                  onClick={() => line.goTo && onGoToNpc?.(line.goTo)}
                >
                  {line.text}
                </button>
              ) : line.role === "relay" ? (
                <div
                  className="mx-auto w-fit rounded-full border border-[#e2c078]/35 bg-[#e2c078]/10 px-3 py-1 text-[11px] font-bold text-[#f3e6c8]"
                  key={`${line.role}-${index}`}
                >
                  {line.text}
                </div>
              ) : (
                <div
                  className={
                    line.role === "visitor"
                      ? "ml-8 rounded-2xl rounded-br-sm bg-[#ff9d38]/16 px-3 py-2 text-sm leading-6 text-[#ffe9d2]"
                      : "mr-8 rounded-2xl rounded-bl-sm bg-white/[0.07] px-3 py-2 text-sm leading-6 text-[#e8eef7]/90"
                  }
                  key={`${line.role}-${index}`}
                >
                  {line.text}
                </div>
              )
            )}
            {isSending ? (
              <div className="mr-8 flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/[0.07] px-3 py-2.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-white/50"
                    animate={{opacity: [0.3, 1, 0.3], y: [0, -2, 0]}}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: i * 0.15
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* 추천 질문 */}
          {presetQuestions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 px-4 pb-1">
              {presetQuestions.map(preset => (
                <button
                  className="rounded-full border border-[#e2c078]/25 bg-[#e2c078]/8 px-3 py-1 text-xs font-semibold text-[#f0e4c8] transition hover:bg-[#e2c078]/18 active:scale-95 disabled:opacity-50"
                  disabled={isSending}
                  key={preset}
                  onClick={() => void ask(preset)}
                  type="button"
                >
                  {preset}
                </button>
              ))}
            </div>
          ) : null}

          {/* 입력 + 구역 이동 */}
          <div className="space-y-2 px-4 pb-3 pt-2">
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                className="min-w-0 flex-1 rounded-full border border-[#e2c078]/18 bg-white/[0.06] px-4 py-2 text-sm text-[#f3e6c8] outline-none placeholder:text-[#a9bdd6]/40 focus:border-[#ff9d38]/60"
                onChange={event => setMessage(event.target.value)}
                placeholder={`${npc.name}에게 물어보기…`}
                aria-label={`${npc.name}에게 질문 입력`}
                name="npc-message"
                autoComplete="off"
                type="text"
                value={message}
              />
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ff9d38]/50 bg-[#ff9d38]/18 text-[#ffd9ae] transition hover:bg-[#ff9d38]/28 active:scale-90 disabled:opacity-40"
                disabled={isSending || !message.trim()}
                type="submit"
                title="보내기"
                aria-label="메시지 보내기"
              >
                ↑
              </button>
            </form>
            {/* 공방 식구는 마을 구역에 속하지 않는다 — 구역 이동 버튼을 숨긴다.
                (NPCData.sectionId 는 타입을 채우려고 넣어둔 값이라 여기서 쓰면 엉뚱한 데로 간다.) */}
            {!isAtelierNpc(npc.id) ? (
              <button
                className="w-full rounded-lg border border-[#e2c078]/30 bg-[#e2c078]/10 px-3 py-2 text-xs font-black text-[#f0e4c8] transition hover:bg-[#e2c078]/18 active:scale-[0.98]"
                onClick={() => onOpenSection(npc.sectionId)}
                type="button"
              >
                ▸ {section?.navLabel || "이 구역"} 보기
              </button>
            ) : null}
            {/* 의뢰 공방으로 가는 '숨겨진' 입구 — 연락 담당 NPC만 알려준다.
                헤더의 상시 버튼과 달리, 대화를 나눠야 발견되는 두 번째 경로다. */}
            {onOpenCommission && isContactNpc(npc.id) ? (
              <button
                className="w-full rounded-lg border border-[#ff9d38]/40 bg-[#ff9d38]/12 px-3 py-2 text-xs font-black text-[#ffd9ae] transition hover:bg-[#ff9d38]/22 active:scale-[0.98]"
                onClick={onOpenCommission}
                type="button"
              >
                🛠️ 홈페이지 제작을 의뢰하고 싶어요
              </button>
            ) : null}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
