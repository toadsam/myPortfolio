"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";
import type {ExplorationMode} from "@/types/portfolio";

interface IntroOverlayProps {
  onStart: (mode: ExplorationMode) => void;
  onResume: () => void;
}

const textItem = {
  hidden: {opacity: 0, y: 20},
  visible: {opacity: 1, y: 0},
  exit: {opacity: 0, y: -12, transition: {duration: 0.22}}
};

export function IntroOverlay({onStart, onResume}: IntroOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);

  function handleStart(mode: ExplorationMode) {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => onStart(mode), 620);
  }

  function handleResume() {
    if (isExiting) return;
    onResume();
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={isExiting ? "exit" : "visible"}
        className="pointer-events-auto absolute inset-0 z-20 flex flex-col"
        initial="hidden"
        variants={{hidden: {}, visible: {}, exit: {}}}
      >
        <motion.div
          animate={{height: isExiting ? 0 : "8vh"}}
          className="w-full flex-shrink-0 bg-[#020810]"
          initial={{height: "8vh"}}
          transition={{duration: 0.5, ease: [0.76, 0, 0.24, 1]}}
        />

        <motion.div
          animate={{opacity: isExiting ? 0 : 1}}
          className="relative flex flex-1 flex-col justify-center overflow-hidden"
          initial={{opacity: 0}}
          style={{background: "linear-gradient(135deg, rgba(0,5,20,0.96) 0%, rgba(0,10,30,0.9) 58%, rgba(0,5,20,0.84) 100%)"}}
          transition={{duration: isExiting ? 0.4 : 0.5, ease: "easeInOut"}}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,180,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.06) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}
          />

          <div className="relative px-6 md:px-14">
            <motion.p
              className="font-mono text-xs font-black uppercase tracking-[0.32em]"
              style={{color: "#00d4ff", textShadow: "0 0 12px #00d4ff88"}}
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.12}}
              variants={textItem}
            >
              {">"} Developer's City 2026
            </motion.p>

            <motion.h1
              className="mt-4 max-w-4xl font-mono text-4xl font-black leading-tight text-white md:text-7xl"
              style={{textShadow: "0 0 40px rgba(0,180,255,0.4)"}}
              transition={{duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.25}}
              variants={textItem}
            >
              정재훈의 3D 포트폴리오 마을
              <span className="ml-2 animate-pulse text-2xl text-[#00d4ff] md:text-4xl">_</span>
            </motion.h1>

            <motion.p
              className="mt-4 font-mono text-sm font-bold tracking-[0.16em] text-[#00b4ffb3] md:text-base"
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4}}
              variants={textItem}
            >
              Fullstack / 3D / Game / XR
            </motion.p>

            <motion.p
              className="mt-5 max-w-xl text-sm leading-7 text-white/58 md:text-base"
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.55}}
              variants={textItem}
            >
              먼저 건물을 클릭해 프로젝트 내부로 들어가거나, NPC에게 프로젝트와 기술에 대해 질문해보세요.
              오늘의 관리자 기록은 마을 조명과 NPC 상태에 반영됩니다.
            </motion.p>

            <motion.div
              className="mt-7 grid max-w-3xl gap-3 md:grid-cols-3"
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.68}}
              variants={textItem}
            >
              {[
                ["1", "건물 클릭", "확인창을 거쳐 프로젝트 전시실로 입장"],
                ["2", "NPC 질문", "프로젝트, 기술, 연락처를 대화로 확인"],
                ["3", "Admin 기록", "오늘 활동을 마을 상태로 반영"]
              ].map(([index, title, body]) => (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4" key={index}>
                  <span className="font-mono text-xs font-black text-[#00d4ff]">STEP {index}</span>
                  <p className="mt-2 text-sm font-black text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">{body}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.82}}
              variants={textItem}
            >
              <button
                className="group relative overflow-hidden rounded-lg border border-[#00d4ff]/45 bg-[#00d4ff]/10 px-6 py-4 text-left transition hover:border-[#00d4ff] hover:bg-[#00d4ff]/16 hover:shadow-[0_0_22px_rgba(0,212,255,0.22)]"
                onClick={() => handleStart("click")}
                type="button"
              >
                <span className="block font-mono text-sm font-black text-white">클릭으로 탐험</span>
                <span className="mt-1 block text-xs text-[#00d4ff]/65">건물을 클릭하고 드래그로 시점을 돌립니다.</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00d4ff]/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>

              <button
                className="group relative overflow-hidden rounded-lg border border-[#00ff88]/35 bg-[#00ff88]/10 px-6 py-4 text-left transition hover:border-[#00ff88] hover:bg-[#00ff88]/16 hover:shadow-[0_0_22px_rgba(0,255,136,0.16)]"
                onClick={() => handleStart("walk")}
                type="button"
              >
                <span className="block font-mono text-sm font-black text-white">직접 이동</span>
                <span className="mt-1 block text-xs text-[#00ff88]/65">WASD로 캐릭터를 움직이며 마을을 둘러봅니다.</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00ff88]/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>

              <button
                className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-4 text-left transition hover:border-white/25 hover:bg-white/[0.07]"
                onClick={handleResume}
                type="button"
              >
                <span className="block font-mono text-sm font-black text-white">빠른 이력서 보기</span>
                <span className="mt-1 block text-xs text-white/45">채용자용 요약 화면으로 바로 이동합니다.</span>
              </button>
            </motion.div>

            <motion.p
              className="mt-7 font-mono text-xs text-[#00b4ff4d]"
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.95}}
              variants={textItem}
            >
              {"// "}drag to rotate / scroll to zoom / ESC closes panels
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          animate={{height: isExiting ? 0 : "8vh"}}
          className="w-full flex-shrink-0 overflow-hidden bg-[#020810]"
          initial={{height: "8vh"}}
          transition={{duration: 0.5, ease: [0.76, 0, 0.24, 1]}}
        >
          <div className="flex h-full items-center justify-between px-6 md:px-14">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#00b4ff59]">
              {">"} DEVELOPER'S CITY
            </span>
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#00b4ff59]">
              JAEHOON JUNG_
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
