"use client";

import {AnimatePresence, motion, useMotionValue, useSpring, useTransform} from "framer-motion";
import {useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {DemoFrame} from "./shared";

// TSEROF 시그니처 — 마우스를 따라 3D로 기울어지는 스테이지에서 숨은 아이템을 찾아 클릭 수집.
const ITEMS = [
  {id: 1, x: "18%", y: "30%", z: 40},
  {id: 2, x: "70%", y: "22%", z: 70},
  {id: 3, x: "40%", y: "60%", z: 20},
  {id: 4, x: "82%", y: "66%", z: 55},
  {id: 5, x: "55%", y: "40%", z: 90},
];

export function TserofDemo({theme}: {theme: ProjectTheme}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotY = useSpring(useTransform(px, [0, 1], [14, -14]), {stiffness: 200, damping: 20});
  const rotX = useSpring(useTransform(py, [0, 1], [-12, 12]), {stiffness: 200, damping: 20});
  const [collected, setCollected] = useState<number[]>([]);

  const remaining = ITEMS.filter((i) => !collected.includes(i.id));
  const done = collected.length === ITEMS.length;

  return (
    <DemoFrame
      theme={theme}
      label="TSEROF"
      tag="3D STAGE"
      controls={
        <>
          <span className="font-mono text-[12px] font-black" style={{color: theme.primary}}>⭐ {collected.length}/{ITEMS.length}</span>
          {collected.length > 0 ? (
            <button
              type="button"
              onClick={() => setCollected([])}
              className="rounded-lg border px-3 py-1.5 font-mono text-[11px] font-black text-white/50 transition hover:bg-white/5"
              style={{borderColor: "rgba(255,255,255,0.15)"}}
            >
              ↺
            </button>
          ) : null}
        </>
      }
      footer={
        <p className="font-mono text-[11px] leading-5 text-white/45">
          🎮 마우스로 스테이지를 <span style={{color: theme.primary}}>3D로 기울이고, 숨은 별을 클릭</span>해 모으세요.
        </p>
      }
    >
      <div style={{perspective: 900}}>
        <motion.div
          ref={ref}
          className="relative h-[280px] w-full overflow-hidden rounded-xl border"
          style={{
            borderColor: `${theme.primary}33`,
            background: "linear-gradient(160deg, #16203a 0%, #0a0f1e 70%)",
            rotateX: rotX,
            rotateY: rotY,
            transformStyle: "preserve-3d",
          }}
          onMouseMove={(e) => {
            const r = ref.current?.getBoundingClientRect();
            if (!r) return;
            px.set((e.clientX - r.left) / r.width);
            py.set((e.clientY - r.top) / r.height);
          }}
          onMouseLeave={() => {
            px.set(0.5);
            py.set(0.5);
          }}
        >
          {/* 바닥 그리드 */}
          <div className="absolute inset-0 opacity-25" style={{backgroundImage: `linear-gradient(${theme.primary}44 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}44 1px, transparent 1px)`, backgroundSize: "32px 32px", transform: "translateZ(-10px)"}} />

          {/* 플랫폼 블록 */}
          <div className="absolute left-[10%] top-[55%] h-10 w-24 rounded" style={{background: `${theme.primary}33`, transform: "translateZ(30px)"}} />
          <div className="absolute right-[14%] top-[40%] h-10 w-20 rounded" style={{background: `${theme.primary}2a`, transform: "translateZ(50px)"}} />

          {/* 수집 아이템 */}
          <AnimatePresence>
            {remaining.map((it) => (
              <motion.button
                key={it.id}
                type="button"
                className="absolute text-2xl"
                style={{left: it.x, top: it.y, transform: `translateZ(${it.z}px)`}}
                initial={{scale: 0}}
                animate={{scale: 1, rotate: [0, 12, -12, 0], y: [0, -6, 0]}}
                exit={{scale: 1.8, opacity: 0}}
                transition={{rotate: {duration: 2.4, repeat: Infinity}, y: {duration: 1.8, repeat: Infinity}, scale: {duration: 0.3}}}
                whileHover={{scale: 1.35}}
                onClick={() => setCollected((c) => [...c, it.id])}
              >
                ⭐
              </motion.button>
            ))}
          </AnimatePresence>

          {/* 캐릭터 */}
          <div className="absolute bottom-3 left-[44%] text-3xl" style={{transform: "translateZ(60px)"}}>🦊</div>

          {/* 클리어 */}
          <AnimatePresence>
            {done ? (
              <motion.div className="absolute inset-0 flex items-center justify-center" style={{background: "rgba(0,0,0,0.5)", transform: "translateZ(80px)"}} initial={{opacity: 0}} animate={{opacity: 1}}>
                <motion.p className="font-mono text-2xl font-black" style={{color: theme.accent, textShadow: `0 0 24px ${theme.primary}`}} initial={{scale: 0.5}} animate={{scale: 1}} transition={{type: "spring", stiffness: 300, damping: 14}}>
                  STAGE CLEAR! 🏆
                </motion.p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </DemoFrame>
  );
}
