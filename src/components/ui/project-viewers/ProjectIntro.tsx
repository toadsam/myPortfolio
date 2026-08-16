"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {INTRO_COPY, type AmbientVariant} from "./atmosphere";
import {sound} from "./sound";

// 프로젝트를 열면 한 번 재생되는 진입 타이틀 시퀀스. (클릭/키로 건너뛰기)
export function ProjectIntro({
  title,
  theme,
  variant
}: {
  title: string;
  theme: ProjectTheme;
  variant: AmbientVariant;
}) {
  const [show, setShow] = useState(true);
  const copy = INTRO_COPY[variant];

  useEffect(() => {
    if (sound) sound.sfx("intro");
    const t = setTimeout(() => setShow(false), 2200);
    const skip = () => setShow(false);
    window.addEventListener("keydown", skip);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  const horror = variant === "horror";
  const arcade = variant === "arcade";

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed inset-0 z-[85] flex flex-col items-center justify-center"
          style={{background: theme.bg}}
          initial={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.6}}
          onClick={() => setShow(false)}
        >
          {/* 분위기 글로우 */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${theme.primary}1a, transparent 60%)`
            }}
            animate={
              horror
                ? {opacity: [0.2, 0.05, 0.3, 0.1]}
                : {opacity: [0.1, 0.3, 0.1]}
            }
            transition={{
              duration: horror ? 0.4 : 2,
              repeat: Infinity,
              repeatType: "mirror"
            }}
          />

          <motion.p
            className="mb-3 font-mono text-[11px] font-black uppercase tracking-[0.5em]"
            style={{color: theme.primary}}
            initial={{opacity: 0, letterSpacing: "0.2em"}}
            animate={{opacity: 1, letterSpacing: "0.5em"}}
            transition={{duration: 0.6, delay: 0.1}}
          >
            {copy.kicker}
          </motion.p>

          <motion.h1
            className="px-6 text-center text-6xl font-black text-white md:text-7xl"
            initial={{
              opacity: 0,
              scale: horror ? 1.1 : 0.85,
              filter: "blur(8px)"
            }}
            animate={
              horror
                ? {
                    opacity: [0, 1, 0.4, 1],
                    scale: 1,
                    filter: "blur(0px)",
                    x: [0, -4, 4, -2, 0]
                  }
                : {opacity: 1, scale: 1, filter: "blur(0px)"}
            }
            transition={{duration: horror ? 0.9 : 0.7, delay: 0.25}}
            style={{textShadow: `0 0 40px ${theme.primary}55`}}
          >
            {title}
          </motion.h1>

          <motion.p
            className="mt-4 font-mono text-sm tracking-[0.2em] text-white/45"
            initial={{opacity: 0}}
            animate={arcade ? {opacity: [1, 0.2, 1]} : {opacity: 1}}
            transition={
              arcade
                ? {duration: 0.9, repeat: Infinity, delay: 0.6}
                : {duration: 0.5, delay: 0.7}
            }
          >
            {copy.sub}
          </motion.p>

          {/* 로딩 바 */}
          <motion.div
            className="mt-8 h-0.5 w-48 overflow-hidden rounded-full"
            style={{background: "rgba(255,255,255,0.1)"}}
          >
            <motion.div
              className="h-full"
              style={{background: theme.primary}}
              initial={{width: "0%"}}
              animate={{width: "100%"}}
              transition={{duration: 2, ease: "easeInOut"}}
            />
          </motion.div>

          <motion.p
            className="absolute bottom-8 font-mono text-[10px] text-white/25"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 1}}
          >
            클릭하거나 아무 키나 눌러 건너뛰기
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
