"use client";

import {motion} from "framer-motion";
import {useEffect, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {DemoFrame} from "./shared";

// 아주분투 시그니처 — 패럴럭스 배경 위를 캐릭터가 달리고, 클릭하면 점프하는 2D 러너.
function Strip({speed, children, opacity = 1, bottom}: {speed: number; children: React.ReactNode; opacity?: number; bottom: number}) {
  return (
    <motion.div
      className="absolute flex"
      style={{bottom, left: 0, opacity}}
      animate={{x: ["0%", "-50%"]}}
      transition={{duration: speed, repeat: Infinity, ease: "linear"}}
    >
      <div className="flex shrink-0">{children}</div>
      <div className="flex shrink-0">{children}</div>
    </motion.div>
  );
}

function Buildings({color, heights}: {color: string; heights: number[]}) {
  return (
    <div className="flex items-end gap-3 pr-3">
      {heights.map((h, i) => (
        <div key={i} className="w-10 rounded-t" style={{height: h, background: color}} />
      ))}
    </div>
  );
}

export function AjouAdventureDemo({theme}: {theme: ProjectTheme}) {
  const [jump, setJump] = useState(0);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setScore((s) => s + 7), 120);
    return () => clearInterval(t);
  }, [running]);

  return (
    <DemoFrame
      theme={theme}
      label="아주분투"
      tag="2D RUNNER"
      controls={
        <>
          <span className="font-mono text-[12px] font-black" style={{color: theme.primary}}>{score.toLocaleString()} m</span>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="rounded-lg border px-3 py-1.5 font-mono text-[11px] font-black text-white/60 transition hover:bg-white/5"
            style={{borderColor: "rgba(255,255,255,0.15)"}}
          >
            {running ? "⏸" : "▶"}
          </button>
        </>
      }
      footer={
        <p className="font-mono text-[11px] leading-5 text-white/45">
          🏃 <span style={{color: theme.primary}}>무대를 클릭하면 점프</span> — 캠퍼스 배경이 패럴럭스로 흐릅니다.
        </p>
      }
    >
      <div
        className="relative h-[240px] w-full cursor-pointer overflow-hidden rounded-xl border"
        style={{borderColor: `${theme.primary}22`, background: "linear-gradient(180deg, #1a1430 0%, #2a1f45 55%, #0d0a18 100%)"}}
        onClick={() => setJump((j) => j + 1)}
      >
        {/* 달/별 */}
        <div className="absolute right-10 top-6 h-12 w-12 rounded-full" style={{background: `${theme.accent}`, boxShadow: `0 0 40px ${theme.accent}88`}} />
        {/* 먼 건물 (느림) */}
        <Strip speed={18} opacity={0.4} bottom={36}>
          <Buildings color="#3a2f55" heights={[70, 110, 50, 90, 60, 130, 80]} />
        </Strip>
        {/* 가까운 건물 (중간) */}
        <Strip speed={9} opacity={0.8} bottom={28}>
          <Buildings color={`${theme.primary}55`} heights={[50, 80, 40, 100, 60]} />
        </Strip>
        {/* 바닥 (빠름) */}
        <div className="absolute bottom-0 left-0 h-7 w-full" style={{background: theme.primary, opacity: 0.85}} />
        <Strip speed={2.2} bottom={10}>
          <div className="flex gap-8 pr-8">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-1.5 w-10 rounded-full bg-black/30" />
            ))}
          </div>
        </Strip>

        {/* 캐릭터 */}
        <motion.div
          key={jump}
          className="absolute bottom-7 left-[14%] text-4xl"
          initial={{y: 0}}
          animate={jump === 0 ? {y: [0, -6, 0]} : {y: [0, -70, 0]}}
          transition={jump === 0 ? {duration: 0.5, repeat: Infinity} : {duration: 0.6, ease: "easeOut"}}
        >
          🏃
        </motion.div>

        {/* 장애물 */}
        <motion.div
          className="absolute bottom-7 text-2xl"
          animate={{x: ["110%", "-20%"]}}
          transition={{duration: 2.4, repeat: Infinity, ease: "linear"}}
          style={{left: 0}}
        >
          🚧
        </motion.div>
      </div>
    </DemoFrame>
  );
}
