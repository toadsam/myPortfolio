"use client";

import {motion} from "framer-motion";
import type {ExplorationMode} from "@/types/portfolio";

interface IntroOverlayProps {
  onStart: (mode: ExplorationMode) => void;
}

export function IntroOverlay({onStart}: IntroOverlayProps) {
  return (
    <motion.section
      animate={{opacity: 1, y: 0}}
      className="pointer-events-auto absolute left-4 top-24 z-20 max-w-[calc(100vw-32px)] rounded-xl border border-[#d9c58a] bg-[#fffaf0]/92 p-5 shadow-panel backdrop-blur-xl md:left-6 md:max-w-[430px] md:p-6"
      initial={{opacity: 0, y: 16}}
      transition={{duration: 0.35, ease: [0.22, 1, 0.36, 1]}}
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#5e9b5b]">Welcome to the village</p>
      <h1 className="mt-3 text-2xl font-black leading-tight text-[#1f2a24] md:text-3xl">AI NPC 포트폴리오 마을</h1>
      <p className="mt-3 leading-7 text-[#465044]">탐색 방식을 선택하세요.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          className="group flex flex-col items-start gap-2 rounded-xl border-2 border-[#5f9f4f] bg-[#5f9f4f]/10 p-4 text-left transition hover:bg-[#5f9f4f]/20"
          onClick={() => onStart("click")}
          type="button"
        >
          <span className="text-2xl">🖱️</span>
          <strong className="text-sm font-black text-[#1f2a24]">Click 탐험</strong>
          <span className="text-xs leading-5 text-[#465044]">건물·NPC 클릭으로 섹션 이동. 마우스 드래그로 시점 회전, 휠로 줌.</span>
        </button>

        <button
          className="group flex flex-col items-start gap-2 rounded-xl border-2 border-[#7b6cf0] bg-[#7b6cf0]/10 p-4 text-left transition hover:bg-[#7b6cf0]/20"
          onClick={() => onStart("walk")}
          type="button"
        >
          <span className="text-2xl">🎮</span>
          <strong className="text-sm font-black text-[#1f2a24]">Walk 탐험</strong>
          <span className="text-xs leading-5 text-[#465044]">WASD / 방향키로 캐릭터를 직접 움직여 마을을 돌아다닙니다.</span>
        </button>
      </div>
    </motion.section>
  );
}
