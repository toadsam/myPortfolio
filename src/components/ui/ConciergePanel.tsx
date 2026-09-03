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
      className="v-panel fixed bottom-6 left-1/2 z-[55] w-[min(94vw,640px)] -translate-x-1/2 p-5"
      initial={{opacity: 0, y: 30}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: 30}}
      transition={{type: "spring", stiffness: 260, damping: 24}}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ff9d38]/50 bg-[#ff9d38]/12 text-lg">
            🤖
          </span>
          <div>
            <p className="v-panel-title text-[13px]">루미 · 마을 안내인</p>
            <p className="mt-0.5 text-sm font-bold text-[#f3e6c8]">
              안녕하세요! 어떤 목적으로 오셨어요?
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg border border-[#e2c078]/20 px-2.5 py-1 text-[11px] font-black text-[#a9bdd6]/70 transition hover:text-[#f3e6c8] active:scale-95"
        >
          건너뛰기
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CHIPS.map(c => (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            whileHover={{
              y: -3,
              borderColor: "rgba(226,192,120,0.6)",
              background: "rgba(226,192,120,0.08)"
            }}
            whileTap={{scale: 0.96}}
            className="flex flex-col items-start gap-1 rounded-xl border border-[#e2c078]/20 bg-white/[0.03] p-3 text-left"
          >
            <span className="text-lg">{c.icon}</span>
            <span className="text-[13px] font-black text-[#eef2f8]">
              {c.label}
            </span>
            <span className="text-[10px] text-[#a9bdd6]/70">{c.desc}</span>
          </motion.button>
        ))}
        <motion.button
          type="button"
          onClick={onAskAI}
          whileHover={{
            y: -3,
            borderColor: "rgba(255,157,56,0.6)",
            background: "rgba(255,157,56,0.08)"
          }}
          whileTap={{scale: 0.96}}
          className="flex flex-col items-start gap-1 rounded-xl border border-[#ff9d38]/35 bg-white/[0.03] p-3 text-left"
        >
          <span className="text-lg">💬</span>
          <span className="text-[13px] font-black text-[#eef2f8]">
            직접 물어보기
          </span>
          <span className="text-[10px] text-[#a9bdd6]/70">
            루미와 대화 (AI)
          </span>
        </motion.button>
      </div>

      {/* 이 마을에서 할 수 있는 것의 전체 목록 — 실제로 이 셋이 전부라 한 줄로 끝난다.
          조작 힌트(ControlsHint)는 이 카드가 닫힌 뒤에야 뜨므로, 카드가 열려 있는
          동안의 안내는 이 줄이 맡는다. */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#e2c078]/15 pt-3 text-[11px] font-bold text-[#a9bdd6]/80">
        <span>
          🏠 건물을 누르면 내용 · 🙂 사람을 누르면 대화 · 📍 바닥을 누르면 이동
        </span>
        <button
          type="button"
          onClick={onResume}
          className="underline-offset-2 transition hover:text-[#f3e6c8] hover:underline"
        >
          이력서로 바로 가기 →
        </button>
      </div>
    </motion.div>
  );
}
