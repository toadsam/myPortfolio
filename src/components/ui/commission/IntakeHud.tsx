"use client";

/**
 * 3D 공방용 설문 HUD — 화면 아래에 대사창만 띄우고 방은 그대로 보인다.
 *
 * 모달(`CommissionDesk`)을 쓰지 않는 이유: 화면을 검게 덮으면 카메라가 체리 자리로
 * 가도 손님이 못 본다. 릴레이의 핵심 연출이 "다음 식구에게 넘어가는 것"이라 방이
 * 보여야 한다. 설문이 끝나면 `onFinish` 로 draft·대사를 넘기고, 호스트가 그걸
 * `CommissionDesk prefill` 로 열어 접수 폼을 보여준다.
 */

import {motion} from "framer-motion";
import {useEffect} from "react";

import {SPEAKER_NPC_ID} from "@/data/atelierIntakeScript";

import {IntakeDialogue} from "./IntakeDialogue";
import {useIntakeFlow, type DialogueLine} from "./useIntakeFlow";
import type {CommissionDraft} from "@/types/live";

export interface IntakeResult {
  draft: CommissionDraft;
  lines: DialogueLine[];
}

export function IntakeHud({
  onSpeakerNpc,
  onFinish,
  onClose
}: {
  /** 지금 말하는 식구의 npc id — 호스트가 카메라를 보낸다 */
  onSpeakerNpc: (npcId: string) => void;
  /** 설문 끝 → 접수 폼으로 */
  onFinish: (result: IntakeResult) => void;
  onClose: () => void;
}) {
  const flow = useIntakeFlow();

  useEffect(() => {
    onSpeakerNpc(SPEAKER_NPC_ID[flow.speaker]);
  }, [flow.speaker, onSpeakerNpc]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const ready = flow.draft.ready_to_submit;
  const done = flow.phase === "done";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 sm:p-5">
      <motion.div
        initial={{opacity: 0, y: 24}}
        animate={{opacity: 1, y: 0}}
        transition={{type: "spring", stiffness: 220, damping: 26}}
        className="pointer-events-auto w-full max-w-[980px]"
      >
        <IntakeDialogue flow={flow} layout="hud" />

        <div className="mt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="v-panel px-3 py-1.5 text-[11px] font-bold text-[#a9bdd6]/80 transition hover:text-[#f3e6c8]"
          >
            설문 그만두기{" "}
            <span className="ml-1 text-[10px] font-normal text-[#a9bdd6]/50">
              Esc
            </span>
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => onFinish({draft: flow.draft, lines: flow.lines})}
            className={`v-panel px-4 py-2 text-[12px] font-black transition active:scale-95 disabled:opacity-40 ${
              done ? "v-lantern-glow text-[#ff9d38]" : "text-[#f3e6c8]"
            }`}
          >
            {done
              ? "견적 보고 접수하기 ▸"
              : ready
              ? "지금 바로 접수하기"
              : "접수하려면 처음 두 개를 골라 주세요"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
