"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useRef, useState} from "react";

// 전역 클릭 "주스" 레이어 — 어디를 클릭하든 그 지점에서 입자 버스트 + 링이 퍼진다.
// 클릭 대상이 버튼/링크면 더 크게 + (지원 시) 햅틱 진동. reduced-motion이면 비활성.
interface Burst {
  id: number;
  x: number;
  y: number;
  interactive: boolean;
}

export function InteractionLayer() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced) return;

    function onDown(e: PointerEvent) {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.("button, a, [role='button'], label, summary, input[type='checkbox'], input[type='radio']");
      const interactive = !!el;

      if (interactive && typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.(9);
        } catch {
          /* noop */
        }
      }

      const id = idRef.current++;
      setBursts((list) => [...list.slice(-6), {id, x: e.clientX, y: e.clientY, interactive}]);
      window.setTimeout(() => setBursts((list) => list.filter((b) => b.id !== id)), 650);
    }

    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      <AnimatePresence>
        {bursts.map((burst) => (
          <BurstFx key={burst.id} burst={burst} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function BurstFx({burst}: {burst: Burst}) {
  const color = burst.interactive ? "#7ed9ff" : "rgba(255,255,255,0.75)";
  const ringSize = burst.interactive ? 54 : 34;
  const count = burst.interactive ? 8 : 5;
  const reach = burst.interactive ? 30 : 18;

  const particles = Array.from({length: count}, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (burst.interactive ? 0.2 : 0);
    return {dx: Math.cos(angle) * reach, dy: Math.sin(angle) * reach};
  });

  return (
    <div className="absolute" style={{left: burst.x, top: burst.y}}>
      <motion.span
        className="absolute rounded-full border"
        style={{width: ringSize, height: ringSize, borderColor: color, marginLeft: -ringSize / 2, marginTop: -ringSize / 2}}
        initial={{scale: 0.2, opacity: 0.85}}
        animate={{scale: 1, opacity: 0}}
        exit={{opacity: 0}}
        transition={{duration: 0.5, ease: "easeOut"}}
      />
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{width: 4, height: 4, marginLeft: -2, marginTop: -2, background: color, boxShadow: `0 0 6px ${color}`}}
          initial={{x: 0, y: 0, opacity: 1, scale: 1}}
          animate={{x: p.dx, y: p.dy, opacity: 0, scale: 0.4}}
          exit={{opacity: 0}}
          transition={{duration: 0.5, ease: "easeOut"}}
        />
      ))}
    </div>
  );
}
