"use client";

import {motion} from "framer-motion";
import {useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {DemoFrame} from "./shared";

// 수어 학습 시그니처 — 단어를 고르면 아바타가 그 단어의 수어 동작을 재생(스타일화).
interface Sign {
  word: string;
  roman: string;
  // 좌/우 팔 회전 키프레임 (어깨 기준, deg)
  left: number[];
  right: number[];
}

const SIGNS: Sign[] = [
  {word: "안녕하세요", roman: "annyeonghaseyo", left: [10, 10, 10], right: [-20, -80, -20]},
  {word: "감사합니다", roman: "gamsahamnida", left: [30, -10, 30], right: [-30, 10, -30]},
  {word: "이름", roman: "ireum", left: [10, 40, 10], right: [-10, -40, -10]},
  {word: "도와주세요", roman: "dowajuseyo", left: [60, 20, 60], right: [-60, -20, -60]},
];

export function SignLanguageDemo({theme}: {theme: ProjectTheme}) {
  const [active, setActive] = useState<Sign>(SIGNS[0]);
  const [playKey, setPlayKey] = useState(0);

  const play = (s: Sign) => {
    setActive(s);
    setPlayKey((k) => k + 1);
  };

  return (
    <DemoFrame
      theme={theme}
      label="SignEdu"
      tag="SIGN AVATAR"
      footer={
        <p className="font-mono text-[11px] leading-5 text-white/45">
          💡 단어를 누르면 <span style={{color: theme.primary}}>아바타가 해당 수어 동작</span>을 재생합니다. (실제 모션 데이터로 교체 예정)
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* 아바타 무대 */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border py-6" style={{borderColor: `${theme.primary}22`, background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.04), rgba(0,0,0,0.25) 70%)"}}>
          <svg width="180" height="190" viewBox="0 0 180 190">
            {/* 머리 */}
            <circle cx="90" cy="40" r="22" fill="none" stroke={theme.primary} strokeWidth="3" />
            {/* 몸통 */}
            <line x1="90" y1="62" x2="90" y2="130" stroke={theme.primary} strokeWidth="3" strokeLinecap="round" />
            {/* 다리 */}
            <line x1="90" y1="130" x2="72" y2="172" stroke={`${theme.primary}88`} strokeWidth="3" strokeLinecap="round" />
            <line x1="90" y1="130" x2="108" y2="172" stroke={`${theme.primary}88`} strokeWidth="3" strokeLinecap="round" />
            {/* 왼팔 (어깨 75,78) */}
            <motion.g
              key={`l-${playKey}`}
              style={{originX: "75px", originY: "78px"}}
              animate={{rotate: active.left}}
              transition={{duration: 1.4, times: [0, 0.5, 1], ease: "easeInOut"}}
            >
              <line x1="75" y1="78" x2="50" y2="110" stroke={theme.accent} strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="50" cy="110" r="6" fill={theme.accent} />
            </motion.g>
            {/* 오른팔 (어깨 105,78) */}
            <motion.g
              key={`r-${playKey}`}
              style={{originX: "105px", originY: "78px"}}
              animate={{rotate: active.right}}
              transition={{duration: 1.4, times: [0, 0.5, 1], ease: "easeInOut"}}
            >
              <line x1="105" y1="78" x2="130" y2="110" stroke={theme.accent} strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="130" cy="110" r="6" fill={theme.accent} />
            </motion.g>
          </svg>
          <motion.div key={`cap-${playKey}`} initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} className="mt-1 text-center">
            <p className="font-mono text-lg font-black text-white">{active.word}</p>
            <p className="font-mono text-[11px] tracking-[0.15em] text-white/40">{active.roman}</p>
          </motion.div>
          <motion.div
            key={`bar-${playKey}`}
            className="absolute bottom-0 left-0 h-0.5"
            style={{background: theme.primary}}
            initial={{width: "0%"}}
            animate={{width: "100%"}}
            transition={{duration: 1.4, ease: "linear"}}
          />
        </div>

        {/* 단어 목록 */}
        <div>
          <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.18em]" style={{color: theme.primary}}>
            단어 · 👆 누르면 재생
          </p>
          <div className="flex flex-col gap-2">
            {SIGNS.map((s) => {
              const on = s.word === active.word;
              return (
                <motion.button
                  key={s.word}
                  type="button"
                  onClick={() => play(s)}
                  whileHover={{x: 3}}
                  whileTap={{scale: 0.97}}
                  className="flex items-center justify-between rounded-lg border px-4 py-2.5 text-left"
                  style={on ? {borderColor: theme.primary, background: `${theme.primary}12`} : {borderColor: `${theme.primary}1f`, background: "rgba(255,255,255,0.02)"}}
                >
                  <span>
                    <span className="font-mono text-[13px] font-bold text-white/85">{s.word}</span>
                    <span className="ml-2 font-mono text-[10px] text-white/35">{s.roman}</span>
                  </span>
                  <span className="font-mono text-[11px] font-black" style={{color: theme.primary}}>{on ? "▶ 재생중" : "▷"}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}
