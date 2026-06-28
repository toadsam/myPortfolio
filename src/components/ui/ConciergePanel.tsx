"use client";

import {motion} from "framer-motion";

export type ConciergeIntent = "recruit" | "projects" | "skills" | "experience" | "browse";

const CHIPS: {id: ConciergeIntent; icon: string; label: string; desc: string}[] = [
  {id: "recruit", icon: "🧑‍💼", label: "채용 담당자예요", desc: "3분 요약 코스"},
  {id: "projects", icon: "💼", label: "프로젝트 보러", desc: "대표작 구역으로"},
  {id: "skills", icon: "🛠", label: "기술 스택", desc: "스킬 구역으로"},
  {id: "experience", icon: "📜", label: "경험·이력", desc: "경험 기록관으로"},
  {id: "browse", icon: "🚶", label: "그냥 둘러볼래요", desc: "자유 탐험"},
];

export function ConciergePanel({
  onPick,
  onAskAI,
  onClose,
}: {
  onPick: (intent: ConciergeIntent) => void;
  onAskAI: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 z-[55] w-[min(94vw,640px)] -translate-x-1/2 rounded-2xl border border-[#00d4ff]/35 bg-[#050d1a]/92 p-5 shadow-2xl backdrop-blur-md"
      initial={{opacity: 0, y: 30}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: 30}}
      transition={{type: "spring", stiffness: 260, damping: 24}}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#00ff88]/50 bg-[#00ff88]/12 text-lg">🤖</span>
          <div>
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00ff88]">루미 · GUIDE</p>
            <p className="mt-0.5 text-sm font-bold text-white">안녕하세요! 어떤 목적으로 오셨어요?</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg border border-white/15 px-2.5 py-1 font-mono text-[10px] font-black text-white/45 transition hover:text-white/80 active:scale-95"
        >
          건너뛰기
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CHIPS.map((c) => (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            whileHover={{y: -3, borderColor: "rgba(0,212,255,0.6)", background: "rgba(0,212,255,0.08)"}}
            whileTap={{scale: 0.96}}
            className="flex flex-col items-start gap-1 rounded-xl border border-[#00d4ff]/22 bg-white/[0.03] p-3 text-left"
          >
            <span className="text-lg">{c.icon}</span>
            <span className="text-[13px] font-black text-white/90">{c.label}</span>
            <span className="font-mono text-[10px] text-white/45">{c.desc}</span>
          </motion.button>
        ))}
        <motion.button
          type="button"
          onClick={onAskAI}
          whileHover={{y: -3, borderColor: "rgba(0,255,136,0.6)", background: "rgba(0,255,136,0.08)"}}
          whileTap={{scale: 0.96}}
          className="flex flex-col items-start gap-1 rounded-xl border border-[#00ff88]/30 bg-white/[0.03] p-3 text-left"
        >
          <span className="text-lg">💬</span>
          <span className="text-[13px] font-black text-white/90">직접 물어보기</span>
          <span className="font-mono text-[10px] text-white/45">루미와 대화 (AI)</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
