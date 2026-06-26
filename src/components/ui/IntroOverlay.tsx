"use client";

import {motion} from "framer-motion";

interface IntroOverlayProps {
  onStart: () => void;
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
      <p className="mt-3 leading-7 text-[#465044]">
        정재훈의 프로젝트와 경험이 살아 움직이는 AI NPC 포트폴리오 마을입니다. 건물은 섹션을, NPC는 안내자를 의미합니다.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {["3D Village", "Projects", "Skills", "Contact"].map((item) => (
          <span className="rounded-full border border-[#c7dd9a] bg-[#eef8db] px-3 py-1.5 text-xs font-black text-[#3f6e35]" key={item}>
            {item}
          </span>
        ))}
      </div>
      <button
        className="mt-6 rounded-lg border border-[#5f9f4f] bg-[#5f9f4f] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#4f8d42]"
        onClick={onStart}
        type="button"
      >
        Start Exploring
      </button>
    </motion.section>
  );
}
