"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";
import type {ExplorationMode} from "@/types/portfolio";

interface IntroOverlayProps {
  onStart: (mode: ExplorationMode) => void;
}

const textItem = {
  hidden: {opacity: 0, y: 28},
  visible: {opacity: 1, y: 0},
  exit: {opacity: 0, y: -16, transition: {duration: 0.25}}
};

export function IntroOverlay({onStart}: IntroOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [chosenMode, setChosenMode] = useState<ExplorationMode>("click");

  function handleStart(mode: ExplorationMode) {
    if (isExiting) return;
    setChosenMode(mode);
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
          variants={{
            hidden: {},
            visible: {},
            exit: {}
          }}
        >
          {/* 상단 레터박스 */}
          <motion.div
            animate={{height: isExiting ? 0 : "9vh"}}
            className="w-full flex-shrink-0 bg-black"
            initial={{height: "9vh"}}
            transition={{duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: isExiting ? 0.1 : 0}}
          />

          {/* 중앙 오버레이 */}
          <motion.div
            animate={{opacity: isExiting ? 0 : 1}}
            className="relative flex flex-1 flex-col justify-center"
            initial={{opacity: 0}}
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.38) 100%)"
            }}
            transition={{duration: isExiting ? 0.55 : 0.5, ease: "easeInOut"}}
          >
            <div className="px-8 md:px-14">
              {/* 작은 레이블 */}
              <motion.p
                className="text-xs font-black uppercase tracking-[0.35em] text-[#7ed9ff]/80"
                transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3}}
                variants={textItem}
              >
                Portfolio Village · 2026
              </motion.p>

              {/* 이름 */}
              <motion.h1
                className="mt-4 text-5xl font-black leading-none text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] md:text-7xl"
                transition={{duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.9}}
                variants={textItem}
              >
                정재훈
              </motion.h1>

              {/* 서브 레이블 */}
              <motion.p
                className="mt-4 text-sm font-bold tracking-[0.18em] text-white/70 md:text-base"
                transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 1.6}}
                variants={textItem}
              >
                Frontend · 3D · Game / XR
              </motion.p>

              {/* 설명 */}
              <motion.p
                className="mt-5 max-w-sm text-sm leading-7 text-white/55 md:text-base"
                transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 2.2}}
                variants={textItem}
              >
                프로젝트와 경험이 살아 움직이는 3D 포트폴리오 마을입니다.
                <br />
                탐험 방식을 선택하고 시작하세요.
              </motion.p>

              {/* 버튼 그룹 */}
              <motion.div
                className="mt-9 flex flex-col gap-3 sm:flex-row"
                transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 2.9}}
                variants={textItem}
              >
                <button
                  className="group relative overflow-hidden rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-left backdrop-blur-md transition-all duration-300 hover:border-[#7ed957]/60 hover:bg-[#7ed957]/15"
                  onClick={() => handleStart("click")}
                  type="button"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">🖱️</span>
                    <span>
                      <strong className="block text-sm font-black text-white">Click 탐험</strong>
                      <span className="mt-0.5 block text-xs text-white/55">건물 클릭으로 입장 · 드래그 시점 회전</span>
                    </span>
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>

                <button
                  className="group relative overflow-hidden rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-left backdrop-blur-md transition-all duration-300 hover:border-[#a78bfa]/60 hover:bg-[#a78bfa]/15"
                  onClick={() => handleStart("walk")}
                  type="button"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">🎮</span>
                    <span>
                      <strong className="block text-sm font-black text-white">Walk 탐험</strong>
                      <span className="mt-0.5 block text-xs text-white/55">WASD로 직접 캐릭터 이동</span>
                    </span>
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </motion.div>

              {/* 스크롤 힌트 */}
              <motion.p
                className="mt-8 text-xs text-white/30"
                transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 3.5}}
                variants={textItem}
              >
                ↓ 마우스 휠로 줌 · 드래그로 시점 조절
              </motion.p>
            </div>

            {/* 우측 장식 라인 (데스크탑) */}
            <motion.div
              animate={{opacity: isExiting ? 0 : 1, scaleY: isExiting ? 0 : 1}}
              className="absolute right-8 top-1/2 hidden h-32 w-px origin-bottom -translate-y-1/2 bg-gradient-to-b from-transparent via-white/30 to-transparent md:block"
              initial={{opacity: 0, scaleY: 0}}
              transition={{duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 2.0}}
            />
          </motion.div>

          {/* 하단 레터박스 */}
          <motion.div
            animate={{height: isExiting ? 0 : "9vh"}}
            className="w-full flex-shrink-0 overflow-hidden bg-black"
            initial={{height: "9vh"}}
            transition={{duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: isExiting ? 0 : 0}}
          >
            <div className="flex h-full items-center justify-between px-8 md:px-14">
              <motion.span
                animate={{opacity: isExiting ? 0 : 1}}
                className="text-xs font-bold tracking-[0.2em] text-white/40"
                initial={{opacity: 0}}
                transition={{delay: 3.2, duration: 0.5}}
              >
                AI PORTFOLIO VILLAGE
              </motion.span>
              <motion.span
                animate={{opacity: isExiting ? 0 : 1}}
                className="text-xs font-bold tracking-[0.2em] text-white/40"
                initial={{opacity: 0}}
                transition={{delay: 3.4, duration: 0.5}}
              >
                JAEHOON JUNG
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
