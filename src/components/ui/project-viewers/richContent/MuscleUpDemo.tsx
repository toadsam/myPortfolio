"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {DemoFrame} from "./shared";

// MuscleUp 시그니처 — 운동을 기록할수록 XP가 차고 레벨업하는 게이미피케이션.
const WORKOUTS = [
  {n: "푸시업", xp: 20, icon: "💪"},
  {n: "스쿼트", xp: 25, icon: "🦵"},
  {n: "러닝 1km", xp: 30, icon: "🏃"},
  {n: "플랭크", xp: 15, icon: "🧘"}
];

const PER_LEVEL = 100;

export function MuscleUpDemo({theme}: {theme: ProjectTheme}) {
  const [xp, setXp] = useState(40);
  const [streak, setStreak] = useState(3);
  const [burst, setBurst] = useState(0); // 레벨업 연출 트리거
  const [float, setFloat] = useState<{id: number; xp: number} | null>(null);

  const level = Math.floor(xp / PER_LEVEL) + 1;
  const into = xp % PER_LEVEL;
  const pct = (into / PER_LEVEL) * 100;

  const addWorkout = (gain: number) => {
    setXp(prev => {
      const before = Math.floor(prev / PER_LEVEL);
      const next = prev + gain;
      if (Math.floor(next / PER_LEVEL) > before) setBurst(b => b + 1);
      return next;
    });
    setStreak(s => s + (Math.random() > 0.7 ? 1 : 0));
    setFloat({id: Date.now(), xp: gain});
  };

  return (
    <DemoFrame
      theme={theme}
      label="MuscleUp"
      tag="LEVEL SYSTEM"
      controls={
        <button
          type="button"
          onClick={() => {
            setXp(40);
            setStreak(3);
          }}
          className="rounded-lg border px-3 py-1.5 font-mono text-[11px] font-black text-white/50 transition hover:bg-white/5"
          style={{borderColor: "rgba(255,255,255,0.15)"}}
        >
          ↺ 초기화
        </button>
      }
      footer={
        <p className="font-mono text-[11px] leading-5 text-white/45">
          💡 운동을 기록할수록{" "}
          <span style={{color: theme.primary}}>경험치가 쌓이고 레벨업</span> —
          꾸준함을 게임처럼 보상합니다.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* 좌: 레벨 + XP 바 */}
        <div
          className="relative flex flex-col justify-center rounded-xl border p-5"
          style={{
            borderColor: `${theme.primary}22`,
            background: "rgba(0,0,0,0.2)"
          }}
        >
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                key={level}
                className="flex h-14 w-14 items-center justify-center rounded-2xl font-mono text-2xl font-black"
                style={{
                  background: `${theme.primary}1a`,
                  color: theme.primary,
                  border: `1px solid ${theme.primary}55`
                }}
                initial={{scale: 0.6, rotate: -12}}
                animate={{scale: 1, rotate: 0}}
                transition={{type: "spring", stiffness: 320, damping: 16}}
              >
                {level}
              </motion.div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">
                  LEVEL
                </p>
                <p className="font-mono text-sm font-black text-white">
                  근력 Lv.{level}
                </p>
              </div>
            </div>
            <div className="text-right">
              <motion.p
                key={streak}
                className="font-mono text-lg font-black"
                style={{color: "#fb923c"}}
                initial={{scale: 1.4}}
                animate={{scale: 1}}
              >
                🔥 {streak}일
              </motion.p>
              <p className="font-mono text-[10px] text-white/65">출석 스트릭</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between font-mono text-[10px] text-white/45">
              <span>XP</span>
              <span>
                {into} / {PER_LEVEL}
              </span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full"
              style={{background: "rgba(255,255,255,0.08)"}}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`
                }}
                animate={{width: `${pct}%`}}
                transition={{type: "spring", stiffness: 140, damping: 20}}
              />
            </div>
          </div>

          {/* 떠오르는 +XP */}
          <AnimatePresence>
            {float ? (
              <motion.span
                key={float.id}
                className="pointer-events-none absolute right-5 top-3 font-mono text-lg font-black"
                style={{color: theme.primary}}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: -14}}
                exit={{opacity: 0, y: -30}}
                transition={{duration: 0.7}}
                onAnimationComplete={() => setFloat(null)}
              >
                +{float.xp} XP
              </motion.span>
            ) : null}
          </AnimatePresence>

          {/* 레벨업 버스트 */}
          <AnimatePresence>
            {burst > 0 ? (
              <motion.div
                key={burst}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                initial={{opacity: 0}}
                animate={{opacity: [0, 1, 0]}}
                transition={{duration: 1.1, times: [0, 0.3, 1]}}
              >
                <motion.span
                  className="font-mono text-2xl font-black"
                  style={{
                    color: theme.accent,
                    textShadow: `0 0 24px ${theme.primary}`
                  }}
                  initial={{scale: 0.5}}
                  animate={{scale: 1.15}}
                >
                  LEVEL UP! ⚡
                </motion.span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* 우: 운동 버튼 */}
        <div>
          <p
            className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.18em]"
            style={{color: theme.primary}}
          >
            운동 기록 · 👆 탭하면 XP 획득
          </p>
          <div className="grid grid-cols-2 gap-2">
            {WORKOUTS.map(w => (
              <motion.button
                key={w.n}
                type="button"
                onClick={() => addWorkout(w.xp)}
                whileHover={{
                  y: -3,
                  borderColor: `${theme.primary}66`,
                  background: `${theme.primary}10`
                }}
                whileTap={{scale: 0.95}}
                className="flex flex-col items-start gap-1 rounded-xl border p-3 text-left"
                style={{
                  borderColor: `${theme.primary}22`,
                  background: "rgba(255,255,255,0.02)"
                }}
              >
                <span className="text-xl">{w.icon}</span>
                <span className="font-mono text-[12px] font-bold text-white/85">
                  {w.n}
                </span>
                <span
                  className="font-mono text-[10px]"
                  style={{color: theme.primary}}
                >
                  +{w.xp} XP
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}
