"use client";

import {AnimatePresence, motion} from "framer-motion";

interface Props {
  active: boolean;
  color?: string;
}

const EASE = [0.7, 0, 0.2, 1] as const;

// 장면 전환 "스우시" — 사선 와이프 패널이 휙 쓸고 지나가며, 스피드 라인 + 순간 플래시가 곁들여진다.
export function SceneTransition({active, color = "#0a0e1a"}: Props) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
          initial={{opacity: 1}}
          animate={{opacity: 1}}
          exit={{opacity: 1}}
        >
          {/* 뒤따르는 잔상 패널 (살짝 늦게) */}
          <motion.div
            className="absolute inset-[-25%]"
            style={{
              background: "rgba(0,212,255,0.13)",
              transformOrigin: "left center"
            }}
            initial={{x: "-130%", skewX: -14}}
            animate={{x: "0%", skewX: 0}}
            exit={{x: "130%", skewX: 14}}
            transition={{duration: 0.46, ease: EASE, delay: 0.05}}
          />
          {/* 메인 패널 */}
          <motion.div
            className="absolute inset-[-25%]"
            style={{
              background: `linear-gradient(120deg, #060d18, ${color} 55%, #060d18)`,
              transformOrigin: "left center"
            }}
            initial={{x: "-120%", skewX: -12}}
            animate={{x: "0%", skewX: 0}}
            exit={{x: "120%", skewX: 12}}
            transition={{duration: 0.42, ease: EASE}}
          />
          {/* 스피드 라인 */}
          {Array.from({length: 7}).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px"
              style={{
                top: `${10 + i * 12}%`,
                left: 0,
                right: 0,
                background:
                  "linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent)"
              }}
              initial={{x: "-100%", opacity: 0}}
              animate={{x: "100%", opacity: [0, 1, 0]}}
              transition={{duration: 0.5, delay: i * 0.025, ease: "easeIn"}}
            />
          ))}
          {/* 순간 플래시 */}
          <motion.div
            className="absolute inset-0"
            style={{background: "#cdeeff"}}
            initial={{opacity: 0}}
            animate={{opacity: [0, 0.22, 0]}}
            transition={{duration: 0.5, times: [0, 0.45, 1]}}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
