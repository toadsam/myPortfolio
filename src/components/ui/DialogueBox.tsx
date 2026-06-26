"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useState} from "react";
import {sectionMeta} from "@/lib/constants";
import {sendNpcMessage} from "@/lib/liveApi";
import type {NpcState} from "@/types/live";
import type {NPCData, SectionId} from "@/types/portfolio";

interface DialogueBoxProps {
  npc: NPCData | null;
  npcState?: NpcState;
  onClose: () => void;
  onOpenSection: (sectionId: SectionId) => void;
}

interface ChatLine {
  role: "visitor" | "npc";
  text: string;
  usedAi?: boolean;
}

export function DialogueBox({npc, npcState, onClose, onOpenSection}: DialogueBoxProps) {
  const section = npc ? sectionMeta.find((item) => item.id === npc.sectionId) : null;
  const [message, setMessage] = useState("");
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!npc) {
      setLines([]);
      setMessage("");
      return;
    }

    setLines([{role: "npc", text: npc.dialogue}]);
    setMessage("");
  }, [npc]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!npc || !message.trim() || isSending) return;

    const nextMessage = message.trim();
    setLines((current) => current.concat({role: "visitor", text: nextMessage}));
    setMessage("");
    setIsSending(true);

    try {
      const response = await sendNpcMessage(npc.id, nextMessage);
      setLines((current) => current.concat({role: "npc", text: response.reply, usedAi: response.used_ai}));
    } catch {
      setLines((current) => current.concat({
        role: "npc",
        text: "지금은 백엔드와 연결되지 않아 자세히 답하기 어렵습니다. FastAPI 서버가 켜져 있는지 확인해주세요.",
      }));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AnimatePresence>
      {npc ? (
        <motion.aside
          animate={{opacity: 1, y: 0}}
          className="fixed bottom-24 left-4 z-30 max-w-[calc(100vw-32px)] rounded-xl border border-[#d7c184] bg-[#fffdf6] p-4 text-[#1f2a24] shadow-panel md:bottom-6 md:left-6 md:w-[460px] md:p-5"
          exit={{opacity: 0, y: 18}}
          initial={{opacity: 0, y: 18}}
          role="dialog"
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#57965a]">{npc.location}</p>
              <h2 className="mt-1 text-lg font-black">{npc.name}</h2>
              <p className="text-sm font-semibold text-[#6d725e]">{npc.role}</p>
              {npcState ? <p className="mt-1 text-xs font-bold text-[#57965a]">{npcState.status_text}</p> : null}
            </div>
            <button className="rounded-lg border border-[#d7c184] px-2 py-1 text-xs font-bold text-[#68715e] hover:bg-[#f4e9c7]" onClick={onClose} type="button">
              Close
            </button>
          </div>
          <div className="max-h-[280px] space-y-2 overflow-y-auto rounded-lg border border-[#eadcae] bg-[#fff9e8] p-3">
            {lines.map((line, index) => (
              <div
                className={
                  line.role === "visitor"
                    ? "ml-8 rounded-lg bg-[#5f9f4f] px-3 py-2 text-sm leading-6 text-white"
                    : "mr-8 rounded-lg bg-white px-3 py-2 text-sm leading-6 text-[#38443a]"
                }
                key={`${line.role}-${index}`}
              >
                {line.text}
                {line.role === "npc" && line.usedAi ? (
                  <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.12em] text-[#57965a]">AI response</span>
                ) : null}
              </div>
            ))}
            {isSending ? <p className="px-1 text-xs font-bold text-[#68715e]">NPC가 생각 중입니다...</p> : null}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
            <input
              className="min-w-0 flex-1 rounded-lg border border-[#d7c184] bg-white px-3 py-2 text-sm outline-none focus:border-[#5f9f4f]"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="NPC에게 질문하기"
              type="text"
              value={message}
            />
            <button
              className="rounded-lg border border-[#5f9f4f] bg-[#5f9f4f] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white disabled:opacity-50"
              disabled={isSending || !message.trim()}
              type="submit"
            >
              Send
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-lg border border-[#5f9f4f] bg-[#5f9f4f] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#4f8d42]"
              onClick={() => onOpenSection(npc.sectionId)}
              type="button"
            >
              Open {section?.navLabel || "Section"}
            </button>
            <button
              className="rounded-lg border border-[#d7c184] bg-[#fff7df] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#5d644f] transition hover:bg-[#f4e9c7]"
              onClick={onClose}
              type="button"
            >
              Keep Exploring
            </button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
