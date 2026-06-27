"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useMemo, useState} from "react";
import type {FormEvent} from "react";
import {getNpcActions} from "@/data/npcActions";
import {npcDefaultPresetQuestions} from "@/data/npcRoster";
import {sectionMeta} from "@/lib/constants";
import {fetchNpcPresets, sendNpcMessage, trackVisitorEvent} from "@/lib/liveApi";
import {moodLabel} from "@/lib/liveState";
import type {NpcActionDefinition, NpcRuntimeState, NpcState, NpcSuggestedAction} from "@/types/live";
import type {NPCData, SectionId} from "@/types/portfolio";

interface DialogueBoxProps {
  npc: NPCData | null;
  npcState?: NpcState;
  npcRuntimeState?: NpcRuntimeState;
  onClose: () => void;
  onOpenSection: (sectionId: SectionId) => void;
  onRunAction: (npc: NPCData, action: NpcActionDefinition) => void;
  onSuggestedAction: (action: NpcSuggestedAction | null | undefined) => void;
}

interface ChatLine {
  role: "visitor" | "npc";
  text: string;
  usedAi?: boolean;
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

function storageKey(npcId: string) {
  return `portfolio-village-chat:${npcId}`;
}

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export function DialogueBox({
  npc,
  npcState,
  npcRuntimeState,
  onClose,
  onOpenSection,
  onRunAction,
  onSuggestedAction
}: DialogueBoxProps) {
  const section = npc ? sectionMeta.find((item) => item.id === npc.sectionId) : null;
  const [message, setMessage] = useState("");
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [remotePresetQuestions, setRemotePresetQuestions] = useState<string[]>([]);
  const agent = npc?.agent;
  const currentAction = npcRuntimeState?.currentAction;
  const recentActions = npcRuntimeState?.recentActions ?? [];
  const mood = moodLabel(npcRuntimeState?.mood ?? npcState?.mood);
  const moodText = MOOD_LABELS[mood] ?? mood;
  const energy = npcRuntimeState?.energy ?? (mood === "sleepy" ? 32 : mood === "busy" || mood === "excited" ? 78 : 55);
  const lastVisitorLine = [...lines].reverse().find((line) => line.role === "visitor");

  const presetQuestions = useMemo(() => {
    const agentQuestions = agent?.presetQuestions ?? [];
    return uniqueItems([...remotePresetQuestions, ...agentQuestions, ...npcDefaultPresetQuestions]).slice(0, 6);
  }, [agent, remotePresetQuestions]);

  const actionCandidates = useMemo(() => (npc ? getNpcActions(npc.id).slice(0, 3) : []), [npc]);

  const recentMessages = useMemo(
    () =>
      lines
        .slice(-8)
        .map((line) => `${line.role === "visitor" ? "방문자" : npc?.name ?? "NPC"}: ${line.text}`),
    [lines, npc?.name]
  );

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

    setLines([{role: "npc", text: npc.dialogue}]);
    setMessage("");
  }, [npc]);

  useEffect(() => {
    if (!npc) return;

    let ignore = false;
    fetchNpcPresets()
      .then((presets) => {
        if (ignore) return;
        const preset = presets.find((item) => item.npc_id === npc.id);
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
    window.localStorage.setItem(storageKey(npc.id), JSON.stringify(lines.slice(-30)));
  }, [lines, npc]);

  async function ask(text: string) {
    if (!npc || !text.trim() || isSending) return;

    const nextMessage = text.trim();
    trackVisitorEvent({
      event_type: "npc_message",
      target_id: npc.id,
      label: npc.name,
      metadata: {sectionId: npc.sectionId, length: nextMessage.length}
    });
    setLines((current) => current.concat({role: "visitor", text: nextMessage}));
    setMessage("");
    setIsSending(true);

    try {
      const response = await sendNpcMessage(npc.id, nextMessage, recentMessages);
      onSuggestedAction(response.suggested_action);
      setLines((current) => {
        const next = current.concat({role: "npc" as const, text: response.reply, usedAi: response.used_ai});
        if (!response.suggested_action) return next;
        return next.concat({role: "npc" as const, text: response.suggested_action.status_text, usedAi: false});
      });
    } catch {
      setLines((current) =>
        current.concat({
          role: "npc",
          text:
            "지금은 백엔드와 연결되지 않아 실시간 기억을 가져오지 못했어요. 대신 기본 포트폴리오 기억으로 안내를 이어갈게요."
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
    setLines([{role: "npc", text: npc.dialogue}]);
  }

  function handleRunAction(action: NpcActionDefinition) {
    if (!npc) return;
    onRunAction(npc, action);
    setLines((current) =>
      current.concat({
        role: "npc",
        text: `${npc.name}가 ${action.label} 행동을 실행합니다.`,
        usedAi: false
      })
    );
  }

  return (
    <AnimatePresence>
      {npc ? (
        <motion.aside
          animate={{opacity: 1, y: 0}}
          className="fixed bottom-24 left-4 z-30 max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border border-[#00d4ff]/25 bg-[#06111f]/95 text-white shadow-[0_22px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl md:bottom-6 md:left-6 md:w-[520px]"
          exit={{opacity: 0, y: 18}}
          initial={{opacity: 0, y: 18}}
          role="dialog"
        >
          <div className="border-b border-white/10 bg-[#071827] p-4 md:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00d4ff]">
                  {npc.location} · {moodText}
                </p>
                <h2 className="mt-1 text-xl font-black text-white">{npc.name}</h2>
                <p className="mt-1 text-sm font-semibold text-white/65">{npc.role}</p>
              </div>
              <button
                className="rounded-md border border-white/15 px-2.5 py-1.5 text-xs font-bold text-white/70 transition hover:border-[#00d4ff]/60 hover:text-white"
                onClick={onClose}
                type="button"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
              <div>
                <div className="flex items-center justify-between font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  <span>emotional energy</span>
                  <span>{energy}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#00ff88] shadow-[0_0_18px_rgba(0,255,136,0.45)]"
                    style={{width: `${Math.max(8, Math.min(100, energy))}%`}}
                  />
                </div>
              </div>
              <span className="rounded-full border border-[#00ff88]/25 bg-[#00ff88]/10 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#98ffbe]">
                {npcRuntimeState?.memory ? "live memory" : "base memory"}
              </span>
            </div>

            {agent ? (
              <div className="mt-4 space-y-2 text-sm leading-6 text-white/72">
                <p>{agent.personality}</p>
                <p className="text-white/55">{agent.currentGoal}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 p-4 md:p-5">
            <div className="grid gap-2 md:grid-cols-2">
              <AgentFact label="전문 분야" value={agent?.specialty ?? npc.role} />
              <AgentFact label="감정 경향" value={agent?.emotionalBias ?? "방문자의 질문에 따라 상태가 바뀝니다."} />
            </div>

            <div className="flex flex-wrap gap-2">
              {(agent?.memoryHooks ?? ["최근 질문", "방문자가 본 구역", "오늘 활동 기록"]).slice(0, 4).map((hook) => (
                <span
                  className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-bold text-white/58"
                  key={hook}
                >
                  기억: {hook}
                </span>
              ))}
            </div>

            {npcState?.status_text || npcRuntimeState?.nextGoal || lastVisitorLine ? (
              <div className="rounded-lg border border-[#00d4ff]/15 bg-[#00d4ff]/[0.06] p-3 text-xs leading-5 text-[#b8e9ff]">
                {npcRuntimeState?.nextGoal ? <p>현재 목표: {npcRuntimeState.nextGoal}</p> : null}
                {npcState?.status_text ? <p>상태 기억: {npcState.status_text}</p> : null}
                {lastVisitorLine ? <p>최근 방문자 질문: {lastVisitorLine.text}</p> : null}
              </div>
            ) : null}

            {currentAction ? (
              <div className="rounded-lg border border-[#00ff88]/25 bg-[#00ff88]/[0.08] p-3 text-xs leading-5 text-[#c9ffd9]">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#8fffb3]">
                    current action
                  </p>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 font-mono text-[10px] text-white/50">
                    {currentAction.animationKey}
                  </span>
                </div>
                <p className="mt-1 font-bold text-white/86">{currentAction.statusText}</p>
                <p className="mt-1 text-white/55">{currentAction.description}</p>
              </div>
            ) : null}

            {actionCandidates.length > 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/42">
                    action queue
                  </p>
                  {recentActions.length > 0 ? (
                    <span className="text-[11px] font-bold text-white/38">최근 {recentActions[0]?.label}</span>
                  ) : null}
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  {actionCandidates.map((action) => (
                    <button
                      className="min-h-[58px] rounded-lg border border-[#00d4ff]/18 bg-[#00d4ff]/8 px-2.5 py-2 text-left text-xs font-bold leading-5 text-[#d8f6ff] transition hover:border-[#00ff88]/45 hover:bg-[#00ff88]/10 disabled:opacity-50"
                      disabled={isSending}
                      key={action.id}
                      onClick={() => handleRunAction(action)}
                      title={action.description}
                      type="button"
                    >
                      <span className="block">{action.label}</span>
                      <span className="mt-0.5 block font-mono text-[9px] font-black uppercase tracking-[0.08em] text-white/35">
                        {action.animationKey}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {presetQuestions.map((preset) => (
                <button
                  className="rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/10 px-3 py-1.5 text-xs font-bold text-[#c8efff] transition hover:border-[#00d4ff]/55 hover:bg-[#00d4ff]/18 disabled:opacity-50"
                  disabled={isSending}
                  key={preset}
                  onClick={() => void ask(preset)}
                  type="button"
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/18 p-3">
              {lines.map((line, index) => (
                <div
                  className={
                    line.role === "visitor"
                      ? "ml-8 rounded-lg bg-[#00d4ff]/18 px-3 py-2 text-sm leading-6 text-[#dff8ff]"
                      : "mr-8 rounded-lg bg-white/[0.07] px-3 py-2 text-sm leading-6 text-white/82"
                  }
                  key={`${line.role}-${index}`}
                >
                  {line.text}
                  {line.role === "npc" ? (
                    <span className="mt-1 block font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#00ff88]/70">
                      {line.usedAi ? "AI live response" : "portfolio fallback memory"}
                    </span>
                  ) : null}
                </div>
              ))}
              {isSending ? (
                <p className="px-1 font-mono text-xs font-bold text-[#00d4ff]/70">
                  {npc.name}가 기억과 감정 상태를 정리하는 중...
                </p>
              ) : null}
            </div>

            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                className="min-w-0 flex-1 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#00d4ff]/70"
                onChange={(event) => setMessage(event.target.value)}
                placeholder={`${npc.name}에게 질문하기`}
                type="text"
                value={message}
              />
              <button
                className="rounded-lg border border-[#00ff88]/45 bg-[#00ff88]/18 px-4 py-2 font-mono text-xs font-black uppercase tracking-[0.12em] text-[#baffd2] transition hover:bg-[#00ff88]/25 disabled:opacity-45"
                disabled={isSending || !message.trim()}
                type="submit"
              >
                Send
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg border border-[#00d4ff]/35 bg-[#00d4ff]/12 px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.12em] text-[#c8efff] transition hover:bg-[#00d4ff]/20"
                onClick={() => onOpenSection(npc.sectionId)}
                type="button"
              >
                {section?.navLabel || "Section"} 열기
              </button>
              <button
                className="rounded-lg border border-white/12 bg-white/[0.05] px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.12em] text-white/60 transition hover:text-white"
                onClick={clearHistory}
                type="button"
              >
                기억 초기화
              </button>
              <button
                className="rounded-lg border border-white/12 bg-white/[0.05] px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.12em] text-white/60 transition hover:text-white"
                onClick={onClose}
                type="button"
              >
                계속 탐험
              </button>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function AgentFact({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-white/38">{label}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-white/68">{value}</p>
    </div>
  );
}
