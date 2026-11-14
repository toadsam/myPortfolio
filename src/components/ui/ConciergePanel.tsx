"use client";

import {motion} from "framer-motion";

export type ConciergeIntent =
  | "recruit"
  | "projects"
  | "skills"
  | "experience"
  | "browse";

const CHIPS: {
  id: ConciergeIntent;
  icon: string;
  label: string;
  desc: string;
}[] = [
  {id: "recruit", icon: "🧑‍💼", label: "채용 담당자예요", desc: "3분 요약 코스"},
  {id: "projects", icon: "💼", label: "프로젝트 보러", desc: "대표작 구역으로"},
  {id: "skills", icon: "🛠", label: "기술 스택", desc: "스킬 구역으로"},
  {id: "experience", icon: "📜", label: "경험·이력", desc: "경험 기록관으로"},
  {id: "browse", icon: "🚶", label: "그냥 둘러볼래요", desc: "자유 탐험"}
];

export function ConciergePanel({
  onPick,
  onAskAI,
  onResume,
  onClose
}: {
  onPick: (intent: ConciergeIntent) => void;
  onAskAI: () => void;
  /** 투어 없이 이력서로 곧장 — 급한 심사자용 작은 링크 */
  onResume: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="v-panel fixed bottom-6 left-1/2 z-[55] w-[min(94vw,640px)] -translate-x-1/2 rounded-[30px]! p-5"
      initial={{opacity: 0, y: 40, scale: 0.94}}
      animate={{opacity: 1, y: 0, scale: 1}}
      exit={{opacity: 0, y: 30, scale: 0.96}}
      transition={{type: "spring", stiffness: 300, damping: 22}}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-lg">
            🤖
          </span>
          <div>
            <p className="text-[13px] font-extrabold text-[#c3c0f7]">
              루미 · 마을 안내인
            </p>
            <p className="v-serif mt-0.5 text-[17px] leading-snug text-white md:text-[19px]">
              광장에 잘 오셨어요. 오늘은 어디부터 볼까요?
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 shrink-0 items-center rounded-full bg-white/10 px-4 text-[13.5px] font-extrabold text-white hover:bg-white/[0.16]"
        >
          건너뛰기
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CHIPS.map((c, i) => {
          // 첫 독자가 채용 심사자라 그 길 하나만 인디고로 채운다(시안 B).
          const primary = c.id === "recruit";
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              // 카드가 앉은 뒤 타일이 한 장씩 튀어 오른다
              initial={{opacity: 0, y: 16, scale: 0.92}}
              animate={{opacity: 1, y: 0, scale: 1}}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 22,
                delay: 0.12 + i * 0.05
              }}
              whileHover={{y: -4, scale: 1.02}}
              whileTap={{scale: 0.94}}
              className={`flex flex-col items-start gap-0.5 rounded-[22px] px-4 py-3.5 text-left ${
                primary
                  ? "bg-[#4f46e5] shadow-[0_12px_30px_rgba(79,70,229,0.35)]"
                  : "bg-white/[0.07] hover:bg-white/[0.12]"
              }`}
            >
              <span className="text-lg leading-none">{c.icon}</span>
              <span className="mt-1.5 text-[15px] font-black text-white">
                {c.label}
              </span>
              <span
                className={`text-[12.5px] font-bold ${
                  primary ? "text-[#e3e1fb]" : "text-[#b4bac6]"
                }`}
              >
                {c.desc}
              </span>
            </motion.button>
          );
        })}
        <motion.button
          type="button"
          onClick={onAskAI}
          initial={{opacity: 0, y: 16, scale: 0.92}}
          animate={{opacity: 1, y: 0, scale: 1}}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 22,
            delay: 0.12 + CHIPS.length * 0.05
          }}
          whileHover={{y: -4, scale: 1.02}}
          whileTap={{scale: 0.94}}
          className="flex flex-col items-start gap-0.5 rounded-[22px] bg-white/[0.07] px-4 py-3.5 text-left hover:bg-white/[0.12]"
        >
          <span className="text-lg leading-none">💬</span>
          <span className="mt-1.5 text-[15px] font-black text-white">
            직접 물어보기
          </span>
          <span className="text-[12.5px] font-bold text-[#b4bac6]">
            루미와 대화 (AI)
          </span>
        </motion.button>
      </div>

      {/* 이 마을에서 할 수 있는 것의 전체 목록 — 실제로 이 셋이 전부라 한 줄로 끝난다.
          조작 힌트(ControlsHint)는 이 카드가 닫힌 뒤에야 뜨므로, 카드가 열려 있는
          동안의 안내는 이 줄이 맡는다. */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3.5 text-[13px] font-bold text-[#b4bac6]">
        <span>
          건물을 누르면 내용 · 사람을 누르면 대화 · 바닥을 누르면 이동
        </span>
        <button
          type="button"
          onClick={onResume}
          className="font-extrabold text-[#c3c0f7] underline-offset-2 hover:text-white hover:underline"
        >
          이력서로 바로 가기 →
        </button>
      </div>
    </motion.div>
  );
}
