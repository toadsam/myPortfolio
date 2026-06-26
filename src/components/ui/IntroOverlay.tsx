"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";
import type {ExplorationMode} from "@/types/portfolio";

interface IntroOverlayProps {
  onStart: (mode: ExplorationMode) => void;
}

const textItem = {
  hidden: {opacity: 0, y: 24},
  visible: {opacity: 1, y: 0},
  exit: {opacity: 0, y: -12, transition: {duration: 0.22}}
};

export function IntroOverlay({onStart}: IntroOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);

  function handleStart(mode: ExplorationMode) {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => onStart(mode), 820);
  }

  return (
    <AnimatePresence>
      {!isExiting || true ? (
        <motion.div
          animate={isExiting ? "exit" : "visible"}
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col"
          initial="hidden"
          variants={{hidden: {}, visible: {}, exit: {}}}
        >
          {/* 상단 레터박스 */}
          <motion.div
            animate={{height: isExiting ? 0 : "9vh"}}
            className="w-full flex-shrink-0 bg-[#020810]"
            initial={{height: "9vh"}}
            transition={{duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: isExiting ? 0.1 : 0}}
          />

          {/* 중앙 오버레이 */}
          <motion.div
            animate={{opacity: isExiting ? 0 : 1}}
            className="relative flex flex-1 flex-col justify-center overflow-hidden"
            initial={{opacity: 0}}
            style={{background: "linear-gradient(135deg, rgba(0,5,20,0.96) 0%, rgba(0,10,30,0.88) 55%, rgba(0,5,20,0.82) 100%)"}}
            transition={{duration: isExiting ? 0.55 : 0.5, ease: "easeInOut"}}
          >
            {/* 배경 그리드 */}
            <div className="pointer-events-none absolute inset-0" style={{
              backgroundImage: "linear-gradient(rgba(0,180,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.06) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }} />

            {/* 배경 글로우 */}
            <div className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" style={{background: "rgba(0,100,255,0.12)"}} />
            <div className="pointer-events-none absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full blur-[80px]" style={{background: "rgba(0,255,150,0.07)"}} />

            <div className="relative px-8 md:px-14">
              {/* 작은 레이블 */}
              <motion.p
                className="font-mono text-xs font-black uppercase tracking-[0.35em]"
                style={{color: "#00d4ff", textShadow: "0 0 12px #00d4ff88"}}
                transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3}}
                variants={textItem}
              >
                {">"} Developer's City · 2026
              </motion.p>

              {/* 이름 */}
              <motion.h1
                className="mt-4 font-mono text-5xl font-black leading-none text-white md:text-7xl"
                style={{textShadow: "0 0 40px rgba(0,180,255,0.4)"}}
                transition={{duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.9}}
                variants={textItem}
              >
                정재훈
                <span className="ml-3 animate-pulse text-2xl md:text-4xl" style={{color: "#00d4ff"}}>_</span>
              </motion.h1>

              {/* 서브 레이블 */}
              <motion.p
                className="mt-4 font-mono text-sm font-bold tracking-[0.18em] md:text-base"
                style={{color: "rgba(0,180,255,0.7)"}}
                transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 1.6}}
                variants={textItem}
              >
                Fullstack · 3D · Game / XR
              </motion.p>

              {/* 설명 */}
              <motion.p
                className="mt-5 max-w-sm font-mono text-sm leading-7 text-white/50 md:text-base"
                transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 2.2}}
                variants={textItem}
              >
                코드로 이루어진 도시를 탐험하세요.
                <br />
                <span style={{color: "#00d4ff88"}}>{"// "}</span>
                각 건물에 프로젝트와 경험이 담겨있습니다.
              </motion.p>

              {/* 버튼 그룹 */}
              <motion.div
                className="mt-9 flex flex-col gap-3 sm:flex-row"
                transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 2.9}}
                variants={textItem}
              >
                <button
                  className="group relative overflow-hidden rounded-xl px-6 py-4 text-left transition-all duration-300"
                  onClick={() => handleStart("click")}
                  style={{
                    background: "rgba(0,20,50,0.8)",
                    border: "1px solid rgba(0,180,255,0.35)",
                    backdropFilter: "blur(12px)",
                  }}
                  type="button"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(0,212,255,0.8)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,212,255,0.2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(0,180,255,0.35)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xl" style={{color: "#00d4ff"}}>{"[ ]"}</span>
                    <span>
                      <strong className="block font-mono text-sm font-black text-white">Click 탐험</strong>
                      <span className="mt-0.5 block font-mono text-xs" style={{color: "rgba(0,180,255,0.55)"}}>건물 클릭으로 입장 · 드래그 시점 회전</span>
                    </span>
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00d4ff]/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>

                <button
                  className="group relative overflow-hidden rounded-xl px-6 py-4 text-left transition-all duration-300"
                  onClick={() => handleStart("walk")}
                  style={{
                    background: "rgba(0,20,50,0.8)",
                    border: "1px solid rgba(0,255,136,0.3)",
                    backdropFilter: "blur(12px)",
                  }}
                  type="button"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(0,255,136,0.8)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,255,136,0.15)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(0,255,136,0.3)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xl" style={{color: "#00ff88"}}>{">/>"}</span>
                    <span>
                      <strong className="block font-mono text-sm font-black text-white">Walk 탐험</strong>
                      <span className="mt-0.5 block font-mono text-xs" style={{color: "rgba(0,255,136,0.55)"}}>WASD로 직접 캐릭터 이동</span>
                    </span>
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00ff88]/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </motion.div>

              <motion.p
                className="mt-8 font-mono text-xs"
                style={{color: "rgba(0,180,255,0.3)"}}
                transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 3.5}}
                variants={textItem}
              >
                {"// "} scroll to zoom · drag to rotate
              </motion.p>
            </div>

            {/* 우측 장식 */}
            <motion.div
              animate={{opacity: isExiting ? 0 : 1, scaleY: isExiting ? 0 : 1}}
              className="absolute right-8 top-1/2 hidden h-32 w-px origin-bottom -translate-y-1/2 md:block"
              initial={{opacity: 0, scaleY: 0}}
              style={{background: "linear-gradient(to bottom, transparent, rgba(0,212,255,0.4), transparent)"}}
              transition={{duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 2.0}}
            />
          </motion.div>

          {/* 하단 레터박스 */}
          <motion.div
            animate={{height: isExiting ? 0 : "9vh"}}
            className="w-full flex-shrink-0 overflow-hidden bg-[#020810]"
            initial={{height: "9vh"}}
            transition={{duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: isExiting ? 0 : 0}}
          >
            <div className="flex h-full items-center justify-between px-8 md:px-14">
              <motion.span
                animate={{opacity: isExiting ? 0 : 1}}
                className="font-mono text-xs font-bold tracking-[0.2em]"
                initial={{opacity: 0}}
                style={{color: "rgba(0,180,255,0.35)"}}
                transition={{delay: 3.2, duration: 0.5}}
              >
                {">"} DEVELOPER'S CITY
              </motion.span>
              <motion.span
                animate={{opacity: isExiting ? 0 : 1}}
                className="font-mono text-xs font-bold tracking-[0.2em]"
                initial={{opacity: 0}}
                style={{color: "rgba(0,180,255,0.35)"}}
                transition={{delay: 3.4, duration: 0.5}}
              >
                JAEHOON JUNG_
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
