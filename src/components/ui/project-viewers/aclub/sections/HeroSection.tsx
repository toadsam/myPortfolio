"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useAClub} from "../context";
import {CATEGORY_COLORS, CATEGORY_NAMES, CLUBS} from "../data";

const HEADLINE_1 = "찾는 게 어려운 게 아니라";
const HEADLINE_2 = "흩어져 있는 게 문제였다";
const GITHUB = "https://github.com/aClub2026/FE";

const META = [
  {value: "4", label: "기술 스택", warn: false},
  {value: "6", label: "핵심 화면", warn: false},
  {value: "프론트엔드", label: "담당 범위", warn: false, tight: true},
  {value: "미연동", label: "백엔드", warn: true}
];

function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const MOTIFS = [
  <>
    <circle
      cx="50"
      cy="50"
      r="30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="50" cy="50" r="15" fill="currentColor" />
  </>,
  <path
    d="M10 50 Q 30 20 50 50 T 90 50"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
  />,
  <>
    <rect x="25" y="25" width="20" height="20" fill="currentColor" />
    <rect x="55" y="55" width="20" height="20" fill="currentColor" />
    <rect
      x="55"
      y="25"
      width="20"
      height="20"
      fill="currentColor"
      opacity="0.3"
    />
    <rect
      x="25"
      y="55"
      width="20"
      height="20"
      fill="currentColor"
      opacity="0.3"
    />
  </>,
  <>
    <polygon
      points="50,20 80,80 20,80"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <polygon points="50,40 70,75 30,75" fill="currentColor" opacity="0.5" />
  </>
];

interface Props {
  /** 인트로가 끝나면 true — 이때부터 히어로 타임라인이 돈다. */
  start: boolean;
}

export function HeroSection({start}: Props) {
  const {reducedMotion, lockScroll} = useAClub();
  const [postersIn, setPostersIn] = useState(0);
  const [phase, setPhase] = useState(0);
  const [words1, setWords1] = useState(0);
  const [cellsIn, setCellsIn] = useState(0);
  const [trioIn, setTrioIn] = useState(0);
  const [hintOut, setHintOut] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const timers = useRef<number[]>([]);

  const bgPosters = useMemo(
    () =>
      CLUBS.slice(0, 24).map((club, i) => ({
        name: club.name,
        cat: CATEGORY_NAMES[
          Math.floor(seeded(i + 11) * CATEGORY_NAMES.length)
        ]!,
        motif: MOTIFS[Math.floor(seeded(i + 23) * MOTIFS.length)]!,
        tilt: (seeded(i + 31) * 6 - 3).toFixed(1),
        tx: (seeded(i + 41) * 8 - 4).toFixed(1),
        ty: (seeded(i + 53) * 8 - 4).toFixed(1)
      })),
    []
  );

  const headWords = useMemo(() => HEADLINE_1.split(" "), []);

  useEffect(() => {
    if (!start) return;

    if (reducedMotion) {
      setPostersIn(24);
      setPhase(5);
      setWords1(headWords.length);
      setCellsIn(5);
      setTrioIn(3);
      return;
    }

    const push = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    bgPosters.forEach((_, i) =>
      push(() => setPostersIn(n => Math.max(n, i + 1)), i * 20)
    );
    push(() => setPhase(1), 300); // 키커
    headWords.forEach((_, i) =>
      push(() => setWords1(n => Math.max(n, i + 1)), 500 + i * 40)
    );
    push(() => setPhase(2), 1050); // 두 번째 줄
    push(() => setPhase(3), 1500); // 요약
    for (let i = 0; i < 5; i += 1)
      push(() => setCellsIn(n => Math.max(n, i + 1)), 1950 + i * 90);
    for (let i = 0; i < 3; i += 1)
      push(() => setTrioIn(n => Math.max(n, i + 1)), 2400 + i * 180);
    push(() => setPhase(5), 3100); // 힌트

    return () => {
      timers.current.forEach(t => window.clearTimeout(t));
      timers.current = [];
    };
  }, [start, reducedMotion, bgPosters, headWords]);

  useEffect(() => {
    if (!videoOpen) return;
    lockScroll(true);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setVideoOpen(false);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [videoOpen, lockScroll]);

  const trio = [{rotate: "-3deg"}, {rotate: "2deg"}, {rotate: "-4deg"}];

  return (
    <section
      id="ac-sec-hero"
      data-ac-section
      className="relative z-20 flex min-h-screen w-full flex-col items-center pb-32 pt-[120px]"
    >
      {/* 벽에 남은 테이프 자국 */}
      <div
        className="absolute inset-x-0 top-0 z-0 h-[1px] bg-gradient-to-b from-[#1a1130] to-transparent"
        aria-hidden="true"
      >
        <div className="absolute left-[15%] top-0 h-[4px] w-[12px] rotate-3 bg-[rgba(255,255,255,0.05)]" />
        <div className="absolute left-[45%] top-0 h-[5px] w-[16px] -rotate-2 bg-[rgba(255,255,255,0.04)]" />
        <div className="absolute left-[82%] top-0 h-[4px] w-[10px] rotate-6 bg-[rgba(255,255,255,0.06)]" />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-0 z-0 h-[40vw] w-[60vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(192,132,252,0.05)_0%,transparent_70%)] blur-[50px]"
        aria-hidden="true"
      />

      {/* ── 배경 포스터 벽 ── */}
      <div
        className="ac-wall-mask absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-[88px] grid w-full max-w-[1100px] -translate-x-1/2 grid-cols-3 gap-[16px] px-8 transition-opacity duration-1000 md:grid-cols-6 md:gap-[32px]"
          style={{opacity: postersIn > 0 ? 1 : 0}}
        >
          {bgPosters.map((p, i) => {
            const color = CATEGORY_COLORS[p.cat];
            const shown = i < postersIn;
            return (
              <div
                key={i}
                className={`ac-poster-hover relative mx-auto h-[176px] w-[132px] flex-col overflow-hidden rounded-sm border border-[rgba(192,132,252,0.20)] bg-[#170f26] shadow-sm ${
                  i >= 12 ? "hidden md:flex" : "flex"
                }`}
                style={{
                  opacity: shown ? 1 : 0,
                  transform: `translate(${p.tx}px, ${p.ty}px) rotate(${
                    p.tilt
                  }deg) scale(${shown ? 1 : 0.85})`,
                  transition: reducedMotion
                    ? "none"
                    : "transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.3s linear"
                }}
              >
                <div
                  className="ac-cat-bar absolute inset-x-0 top-0 h-[4px] transition-shadow duration-300"
                  style={{background: color}}
                />
                <div className="absolute left-[10px] top-[-6px] z-10 h-[10px] w-[22px] rotate-[45deg] bg-[rgba(255,255,255,0.08)] backdrop-blur-sm" />
                <div className="absolute right-[10px] top-[-6px] z-10 h-[10px] w-[22px] -rotate-[45deg] bg-[rgba(255,255,255,0.08)] backdrop-blur-sm" />
                <div className="flex flex-grow flex-col justify-between p-3 pt-4">
                  <div>
                    <div className="text-[13px] font-black leading-snug text-[rgba(255,255,255,0.88)]">
                      {p.name}
                    </div>
                    <div className="mt-1 font-mono text-[9px] tracking-wider text-[rgba(255,255,255,0.46)]">
                      {p.cat}
                    </div>
                  </div>
                  <div
                    className="relative h-[60px] w-full opacity-40"
                    style={{color}}
                  >
                    <svg
                      className="absolute bottom-0 right-0 h-[40px] w-[40px]"
                      viewBox="0 0 100 100"
                    >
                      {p.motif}
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="relative z-10 mt-12 flex w-full max-w-[720px] flex-col items-center px-6 md:mt-24">
        <div
          className="mb-6 font-mono text-[12px] uppercase tracking-[0.3em] text-[#c084fc] transition-all duration-500"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "none" : "translateY(10px)"
          }}
        >
          PLATFORM · 동아리 탐색과 모집
        </div>

        <h2 className="flex flex-col items-center text-center text-[27px] font-black leading-tight text-[rgba(255,255,255,0.88)] md:text-[42px]">
          <span className="flex flex-wrap justify-center gap-x-[0.25em]">
            {headWords.map((w, i) => (
              <span
                key={`${w}-${i}`}
                className="inline-block transition-all duration-[400ms] ease-out"
                style={{
                  opacity: i < words1 ? 1 : 0,
                  filter: i < words1 ? "blur(0)" : "blur(4px)",
                  transform: i < words1 ? "none" : "translateY(8px)"
                }}
              >
                {w}
              </span>
            ))}
          </span>
          <span
            className="mt-[10px] text-[#c084fc] transition-all duration-[600ms] ease-out"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "none" : "translateY(10px)"
            }}
          >
            {HEADLINE_2}
          </span>
        </h2>

        <p
          className="mt-[22px] max-w-[640px] text-center text-[16px] leading-[36px] text-[rgba(255,255,255,0.88)] transition-opacity duration-[800ms]"
          style={{opacity: phase >= 3 ? 1 : 0}}
        >
          동아리 24개를 한 벽에 붙여놓고,{" "}
          <strong className="font-bold text-[#d8b4fe]">
            조건을 누르면 남는 것만 남게 했다.
          </strong>
          <br className="hidden md:block" />
          탐색부터 지원까지 한 서비스 안에서 끝나도록 화면 흐름을 설계했다.
        </p>

        <div className="mt-[30px] grid w-full max-w-[700px] grid-cols-2 gap-[16px] md:grid-cols-4">
          {META.map((cell, i) => (
            <div
              key={cell.label}
              className="flex flex-col items-center justify-center rounded-md p-[14px] transition-all duration-[400ms] ease-out"
              style={{
                border: `1px solid ${
                  cell.warn ? "rgba(251,191,36,0.30)" : "rgba(192,132,252,0.20)"
                }`,
                background: "rgba(192,132,252,0.03)",
                opacity: i < cellsIn ? 1 : 0,
                transform: i < cellsIn ? "none" : "translateY(10px)"
              }}
            >
              <div
                className={`font-mono text-[22px] font-black leading-none tabular-nums text-[#c084fc] ${
                  cell.tight ? "text-center tracking-tighter" : ""
                }`}
              >
                {cell.value}
              </div>
              <div className="mt-[8px] font-mono text-[10px] tracking-[0.1em] text-[rgba(255,255,255,0.46)]">
                {cell.label}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-4 text-center font-mono text-[10px] text-[rgba(255,255,255,0.35)] transition-all duration-[400ms]"
          style={{opacity: cellsIn >= 5 ? 1 : 0}}
        >
          백엔드 연동 전 단계입니다. 범위는 뒤에서 그대로 밝힙니다.
        </div>
      </div>

      {/* ── 데모 · 저장소 · 메모 ── */}
      <div className="relative z-20 mt-16 flex w-full max-w-[900px] flex-col items-center justify-center gap-[24px] px-4 md:mt-24 md:flex-row md:gap-[32px]">
        <button
          type="button"
          onClick={() => setVideoOpen(true)}
          onMouseEnter={() => setHintOut(true)}
          onFocus={() => setHintOut(true)}
          className="ac-poster-hover group relative flex h-[176px] w-[132px] flex-col items-center justify-between rounded-sm border border-[rgba(192,132,252,0.20)] bg-[#170f26] p-3 text-left shadow-[0_4px_12px_rgba(0,0,0,0.4)] outline-none md:h-[234px] md:w-[176px] md:p-4"
          style={{
            opacity: trioIn >= 1 ? 1 : 0,
            transform:
              trioIn >= 1
                ? `rotate(${trio[0]!.rotate}) scale(1)`
                : "translateY(30px) rotate(-10deg) scale(0.95)",
            transition:
              "opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)"
          }}
        >
          <span
            className={`ac-tape ${
              trioIn >= 1 ? "ac-in" : ""
            } absolute left-[10px] top-[-6px] z-10 h-[10px] w-[22px] rotate-[45deg] bg-[rgba(255,255,255,0.08)] backdrop-blur-sm`}
          />
          <span
            className={`ac-tape ${
              trioIn >= 1 ? "ac-in" : ""
            } absolute right-[10px] top-[-6px] z-10 h-[10px] w-[22px] -rotate-[45deg] bg-[rgba(255,255,255,0.08)] backdrop-blur-sm`}
          />
          <span className="relative flex w-full flex-grow items-center justify-center overflow-hidden rounded-sm border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.3)]">
            <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[rgba(216,180,254,0.45)] transition-colors group-hover:bg-[rgba(216,180,254,0.1)] md:h-[56px] md:w-[56px]">
              <svg
                className="ml-1 h-[20px] w-[20px] text-[#d8b4fe] md:h-[26px] md:w-[26px]"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </span>
            <span className="ac-blink absolute right-2 top-2 h-[6px] w-[6px] rounded-full bg-[#f87171]" />
          </span>
          <span className="mt-3 flex w-full flex-col gap-1">
            <span className="text-[13px] font-black text-[#d8b4fe] md:text-[15px]">
              데모 영상
            </span>
            <span className="font-mono text-[9px] text-[rgba(255,255,255,0.55)] md:text-[10px]">
              1분 54초
            </span>
          </span>
        </button>

        <a
          href={GITHUB}
          target="_blank"
          rel="noreferrer"
          onMouseEnter={() => setHintOut(true)}
          onFocus={() => setHintOut(true)}
          className="ac-poster-hover group relative flex h-[176px] w-[132px] flex-col items-center justify-between rounded-sm border border-[rgba(192,132,252,0.20)] bg-[#170f26] p-3 text-left no-underline shadow-[0_4px_12px_rgba(0,0,0,0.4)] outline-none md:h-[234px] md:w-[176px] md:p-4"
          style={{
            opacity: trioIn >= 2 ? 1 : 0,
            transform:
              trioIn >= 2
                ? `rotate(${trio[1]!.rotate}) scale(1)`
                : "translateY(30px) rotate(-10deg) scale(0.95)",
            transition:
              "opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)"
          }}
        >
          <span
            className={`ac-tape ${
              trioIn >= 2 ? "ac-in" : ""
            } absolute left-[10px] top-[-6px] z-10 h-[10px] w-[22px] rotate-[45deg] bg-[rgba(255,255,255,0.08)] backdrop-blur-sm`}
          />
          <span
            className={`ac-tape ${
              trioIn >= 2 ? "ac-in" : ""
            } absolute right-[10px] top-[-6px] z-10 h-[10px] w-[22px] -rotate-[45deg] bg-[rgba(255,255,255,0.08)] backdrop-blur-sm`}
          />
          <span className="absolute right-3 top-3 translate-y-2 font-mono text-[rgba(255,255,255,0.5)] opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
            ↗
          </span>
          <span className="relative flex w-full flex-grow items-center justify-center overflow-hidden">
            <span
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "10px 10px"
              }}
            />
            <span className="z-10 font-mono text-[24px] tracking-widest text-[rgba(255,255,255,0.78)] md:text-[30px]">
              &lt;&nbsp;&gt;
            </span>
          </span>
          <span className="z-10 mt-3 flex w-full flex-col gap-1">
            <span className="text-[13px] font-black text-[rgba(255,255,255,0.88)] md:text-[15px]">
              GitHub 저장소
            </span>
            <span className="font-mono text-[8px] leading-tight text-[rgba(255,255,255,0.55)] md:text-[10px]">
              React · TypeScript · Vite
            </span>
          </span>
        </a>

        <div
          tabIndex={0}
          onMouseEnter={() => setHintOut(true)}
          onFocus={() => setHintOut(true)}
          className="ac-poster-hover ac-lined-paper group relative flex h-[176px] w-[132px] flex-col rounded-sm border border-[rgba(192,132,252,0.20)] p-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.4)] outline-none md:h-[234px] md:w-[176px] md:p-6"
          style={{
            opacity: trioIn >= 3 ? 1 : 0,
            transform:
              trioIn >= 3
                ? `rotate(${trio[2]!.rotate}) scale(1)`
                : "translateY(30px) rotate(-10deg) scale(0.95)",
            transition:
              "opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)"
          }}
        >
          <span
            className={`ac-tape ${
              trioIn >= 3 ? "ac-in" : ""
            } absolute left-[40%] top-[-6px] z-10 h-[10px] w-[22px] -rotate-[5deg] bg-[rgba(255,255,255,0.1)] backdrop-blur-sm`}
          />
          <div className="mt-2 flex flex-col gap-[18px] font-mono text-[10px] leading-[18px] text-[rgba(255,255,255,0.62)] md:text-[11px]">
            <span>프론트엔드 단독</span>
            <span>탐색 · 필터 · 상세</span>
            <span>마이페이지 · 관리자</span>
            <span>백엔드 연동 전</span>
          </div>
        </div>
      </div>

      <div
        className="z-20 mt-8 font-mono text-[10px] text-[rgba(255,255,255,0.35)] transition-opacity duration-500"
        style={{opacity: phase >= 5 && !hintOut ? 1 : 0}}
        aria-hidden="true"
      >
        포스터를 눌러보세요
      </div>

      {videoOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(8,4,14,0.94)] p-4 backdrop-blur-[8px]"
          onClick={e => {
            if (e.target === e.currentTarget) setVideoOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="데모 영상"
        >
          <button
            type="button"
            onClick={() => setVideoOpen(false)}
            className="absolute right-6 top-6 z-10 rounded p-2 text-white/50 outline-none transition-colors hover:text-white"
            aria-label="닫기"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
          <div className="relative flex aspect-video w-full max-w-[1020px] items-center justify-center border border-[rgba(192,132,252,0.2)] bg-[#08040e] shadow-2xl">
            <span className="font-mono text-sm tracking-widest text-[rgba(255,255,255,0.4)]">
              데모 영상 자리 · 16:9
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
