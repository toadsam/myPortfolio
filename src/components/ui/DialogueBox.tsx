"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
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
  NpcSuggestedAction
} from "@/types/live";
import type {NPCData, SectionId} from "@/types/portfolio";

interface DialogueBoxProps {
  npc: NPCData | null;
  npcState?: NpcState;
  npcRuntimeState?: NpcRuntimeState;
  onClose: () => void;
  onOpenSection: (sectionId: SectionId) => void;
  onRunAction: (npc: NPCData, action: NpcActionDefinition) => void;
  onSuggestedAction: (action: NpcSuggestedAction | null | undefined) => void;
  /** 백엔드/AI 연결 불가 (기본 대사 모드) */
  aiOffline?: boolean;
}

interface ChatLine {
  role: "visitor" | "npc";
  text: string;
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

export function DialogueBox({
  npc,
  npcState,
  npcRuntimeState,
  onClose,
  onOpenSection,
  onSuggestedAction,
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
    return uniqueItems([
      ...remotePresetQuestions,
      ...agentQuestions,
      ...npcDefaultPresetQuestions
    ]).slice(0, 3);
  }, [agent, remotePresetQuestions]);

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
      setLines(current => current.concat({role: "npc", text: response.reply}));
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
          className="fixed bottom-24 left-4 z-30 flex max-h-[70vh] w-[min(calc(100vw-32px),400px)] flex-col overflow-hidden rounded-2xl border border-[#00d4ff]/25 bg-[#06111f]/95 text-white shadow-[0_22px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl md:bottom-6 md:left-6"
          exit={{opacity: 0, y: 18}}
          initial={{opacity: 0, y: 18}}
          role="dialog"
        >
          {/* 헤더 — 아이콘 + 이름 + 역할 + 기분 + 닫기 */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#071827] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#00d4ff]/40 bg-[#00d4ff]/10 text-lg">
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
                  <p className="truncate text-base font-black text-white">
                    {npc.name}
                  </p>
                  {offline ? (
                    <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.1em] text-amber-300">
                      ⚠ AI 오프라인
                    </span>
                  ) : null}
                </div>
                <p className="truncate font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#00d4ff]/80">
                  {npc.role} · {moodText}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                className="rounded-md px-2 py-1 font-mono text-xs text-white/40 transition hover:text-white/80"
                onClick={clearHistory}
                title="대화 초기화"
                type="button"
              >
                ↺
              </button>
              <button
                className="rounded-md border border-white/15 px-2.5 py-1 text-sm font-bold text-white/70 transition hover:border-[#00d4ff]/60 hover:text-white"
                onClick={onClose}
                title="닫기"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 채팅 */}
          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {lines.map((line, index) => (
              <div
                className={
                  line.role === "visitor"
                    ? "ml-8 rounded-2xl rounded-br-sm bg-[#00d4ff]/18 px-3 py-2 text-sm leading-6 text-[#dff8ff]"
                    : "mr-8 rounded-2xl rounded-bl-sm bg-white/[0.07] px-3 py-2 text-sm leading-6 text-white/85"
                }
                key={`${line.role}-${index}`}
              >
                {line.text}
              </div>
            ))}
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
                  className="rounded-full border border-[#00d4ff]/25 bg-[#00d4ff]/8 px-3 py-1 text-xs font-semibold text-[#c8efff] transition hover:bg-[#00d4ff]/18 active:scale-95 disabled:opacity-50"
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
                className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#00d4ff]/70"
                onChange={event => setMessage(event.target.value)}
                placeholder={`${npc.name}에게 물어보기…`}
                type="text"
                value={message}
              />
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#00ff88]/45 bg-[#00ff88]/18 text-[#baffd2] transition hover:bg-[#00ff88]/28 active:scale-90 disabled:opacity-40"
                disabled={isSending || !message.trim()}
                type="submit"
                title="보내기"
              >
                ↑
              </button>
            </form>
            <button
              className="w-full rounded-lg border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-3 py-2 text-xs font-black text-[#c8efff] transition hover:bg-[#00d4ff]/18 active:scale-[0.98]"
              onClick={() => onOpenSection(npc.sectionId)}
              type="button"
            >
              ▸ {section?.navLabel || "이 구역"} 보기
            </button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
