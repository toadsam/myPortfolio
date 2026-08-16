"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {CATEGORY_COLORS, CATEGORY_NAMES} from "../data";

const MOTIVATION =
  "동아리 하나 들어가겠다고 학교 커뮤니티, 인스타, 학과 게시판을 다 뒤졌다. 정작 모집 마감은 지나 있었다. 찾는 게 어려운 게 아니라, 흩어져 있는 게 문제였다.";

const SETTLE_EASE = "cubic-bezier(0.22,1,0.36,1)";
const FALL_EASE = "cubic-bezier(0.4,0,1,1)";

// 시드 난수 — 서버·클라이언트가 같은 배치를 그려야 하므로 Math.random을 쓰지 않는다.
function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

interface Props {
  onDismiss: () => void;
  reducedMotion: boolean;
}

// 진입 시퀀스 — 빈 벽에 포스터 24장이 날아와 붙으면서 "왜 만들었나"를 읽힌다.
export function IntroOverlay({onDismiss, reducedMotion}: Props) {
  const [total, setTotal] = useState(24);
  const [settled, setSettled] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState(0);
  const [wordsIn, setWordsIn] = useState(0);
  const timers = useRef<number[]>([]);
  const dismissed = useRef(false);

  useEffect(() => {
    setTotal(window.innerWidth < 768 ? 12 : 24);
  }, []);

  const posters = useMemo(
    () =>
      Array.from({length: total}, (_, i) => {
        const angle = seeded(i + 1) * Math.PI * 2;
        const distance = 1400;
        return {
          color:
            CATEGORY_COLORS[
              CATEGORY_NAMES[Math.floor(seeded(i + 7) * CATEGORY_NAMES.length)]!
            ],
          endX: (seeded(i + 2) * 8 - 4).toFixed(1),
          endY: (seeded(i + 3) * 8 - 4).toFixed(1),
          endR: (seeded(i + 4) * 6 - 3).toFixed(1),
          startX: (Math.cos(angle) * distance).toFixed(1),
          startY: (Math.sin(angle) * distance).toFixed(1),
          startR: (seeded(i + 5) > 0.5 ? 25 : -25) + (seeded(i + 6) * 10 - 5)
        };
      }),
    [total]
  );

  const words = useMemo(() => MOTIVATION.split(" "), []);

  // ── 타임라인 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) {
      setSettled(new Set(Array.from({length: total}, (_, i) => i)));
      setPhase(4);
      setWordsIn(words.length);
      return;
    }

    const push = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    // 앞쪽 6장은 천천히 안착, 나머지는 빠르게 쏟아진다.
    for (let i = 0; i < Math.min(6, total); i += 1) {
      push(() => setSettled(s => new Set(s).add(i)), 200 + i * 90);
    }
    push(() => setPhase(1), 400); // 건너뛰기 노출
    for (let i = 6; i < total; i += 1) {
      push(() => setSettled(s => new Set(s).add(i)), 900 + (i - 6) * 40);
    }
    push(() => setPhase(2), 1800); // 스포트라이트 · 그림자
    push(() => setPhase(3), 2000); // 벽을 낮추고 타이틀
    words.forEach((_, i) =>
      push(() => setWordsIn(n => Math.max(n, i + 1)), 2500 + i * 35)
    );
    push(() => setPhase(4), 4000); // 스크롤 안내

    return () => {
      timers.current.forEach(t => window.clearTimeout(t));
      timers.current = [];
    };
  }, [reducedMotion, total, words]);

  // ── 아무 입력이나 오면 넘어간다 ────────────────────────────────────────────
  useEffect(() => {
    function finish() {
      if (dismissed.current) return;
      dismissed.current = true;
      onDismiss();
    }

    function onKey(e: KeyboardEvent) {
      if (["Escape", "Space", "Enter"].includes(e.code)) finish();
    }

    window.addEventListener("wheel", finish, {passive: true});
    window.addEventListener("touchstart", finish, {passive: true});
    window.addEventListener("click", finish);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchstart", finish);
      window.removeEventListener("click", finish);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[95] flex cursor-pointer touch-none select-none items-center justify-center overflow-hidden bg-[#0d0816]">
      <div className="ac-noise" aria-hidden="true" />

      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{opacity: phase >= 2 ? 1 : 0.2}}
        aria-hidden="true"
      >
        <div className="ac-spotlight left-[28%]" />
        <div className="ac-spotlight left-[72%]" />
      </div>

      {/* ── 날아와 붙는 포스터 벽 ── */}
      <div
        className="absolute inset-0 z-10 flex w-full items-center justify-center p-4 transition-opacity duration-500 ease-out"
        style={{opacity: phase >= 3 ? 0.3 : 1}}
        aria-hidden="true"
      >
        <div className="grid w-full max-w-[900px] grid-cols-4 justify-items-center gap-[16px] md:grid-cols-6 md:gap-[24px]">
          {posters.map((p, i) => {
            const isSettled = settled.has(i);
            const slow = i < 6;
            return (
              <div
                key={i}
                className="relative z-10 h-[78px] w-[58px] shrink-0 rounded-md md:h-[96px] md:w-[72px]"
                style={{
                  backgroundColor: `${p.color}38`,
                  border: `1px solid ${p.color}73`,
                  opacity: isSettled ? 1 : 0,
                  transform: isSettled
                    ? `translate(${p.endX}px, ${p.endY}px) rotate(${p.endR}deg)`
                    : `translate(${p.startX}px, ${p.startY}px) rotate(${p.startR}deg)`,
                  boxShadow: phase >= 2 ? "0 4px 12px rgba(0,0,0,0.3)" : "none",
                  transition: reducedMotion
                    ? "none"
                    : `transform ${slow ? 600 : 400}ms ${
                        slow ? SETTLE_EASE : FALL_EASE
                      }, opacity ${
                        slow ? 600 : 400
                      }ms linear, box-shadow 0.5s ease`
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── 타이틀 · 동기 ── */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6">
        <div
          className="flex flex-col items-center transition-opacity duration-500 ease-out"
          style={{opacity: phase >= 3 ? 1 : 0}}
        >
          <h1 className="text-[36px] font-black leading-none tracking-[-0.02em] text-[#c084fc] md:text-[58px]">
            ACLUB
          </h1>
          <p className="mt-[12px] text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.46)] md:text-[13px]">
            동아리 탐색·모집 플랫폼 · React + TypeScript
          </p>
        </div>

        <p className="mt-[32px] flex max-w-[560px] flex-wrap justify-center gap-x-[0.25em] text-center text-[15px] leading-[36px] text-[rgba(255,255,255,0.88)] md:mt-[48px] md:text-[17px]">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="inline-block transition-all duration-[400ms] ease-out"
              style={{
                opacity: i < wordsIn ? 1 : 0,
                transform: i < wordsIn ? "translateY(0)" : "translateY(6px)"
              }}
            >
              {word}
            </span>
          ))}
        </p>
      </div>

      {/* ── 시작 유도 ── */}
      <button
        type="button"
        onClick={onDismiss}
        className="group pointer-events-auto absolute bottom-[32px] left-1/2 z-30 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-[8px] outline-none transition-opacity duration-500"
        style={{opacity: phase >= 4 ? 1 : 0}}
      >
        <span className="font-mono text-[12px] text-[rgba(255,255,255,0.46)] transition-colors group-hover:text-[rgba(255,255,255,0.88)]">
          ↓ 아무 곳이나 클릭하거나 스크롤해서 시작
        </span>
        <svg
          className="ac-bounce-soft h-[16px] w-[16px] text-[#c084fc]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={onDismiss}
        className="pointer-events-auto absolute bottom-[32px] right-[32px] z-40 cursor-pointer rounded px-2 py-1 font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.35)] outline-none transition-all hover:text-[rgba(255,255,255,0.88)]"
        style={{
          opacity: phase >= 1 && phase < 4 ? 1 : 0,
          pointerEvents: phase >= 1 && phase < 4 ? "auto" : "none"
        }}
      >
        [ 건너뛰기 ]
      </button>
    </div>
  );
}
