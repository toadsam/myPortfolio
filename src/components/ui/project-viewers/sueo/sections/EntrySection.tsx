"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {SIGN_TOTAL, useSueo} from "../context";
import {useTimeline} from "../useTimeline";

// 4초 안에 "왜 만들었나"를 읽히는 게 이 페이지의 유일한 목적이다.
const MOTIVATION =
  "수어를 배워보려고 검색했더니, 단어 사진이 나열된 페이지가 대부분이었다. 수어는 정지된 손 모양이 아니라 움직임인데, 그 움직임을 보고 따라 할 수 있는 도구가 잘 없었다.";

// 원안 스크립트의 schedule(ms) 순서를 그대로 옮긴다.
const T = {
  lamp: 400,
  skip: 500,
  hand: 1100,
  sign: 1500,
  dim: 3000,
  title: 3100,
  words: 3500,
  counter: 4600,
  end: 5000
};
const STEPS = [
  T.lamp,
  T.skip,
  T.hand,
  T.sign,
  T.dim,
  T.title,
  T.words,
  T.counter,
  T.end
];

/** 「안녕하세요」를 표현하는 손. 손목(60,140)을 축으로 회전한다. */
function SignHand({animate}: {animate: boolean}) {
  return (
    <svg
      viewBox="0 0 120 160"
      className="h-full w-full"
      style={{fill: "var(--sd-hand)"}}
      aria-hidden="true"
    >
      <g
        className={animate ? "sd-hand-animate" : undefined}
        style={{transformOrigin: "60px 140px"}}
      >
        <rect x="45" y="110" width="30" height="30" rx="4" />
        <path d="M 35 60 L 85 60 A 15 15 0 0 1 100 75 L 100 100 A 15 15 0 0 1 85 115 L 35 115 A 15 15 0 0 1 20 100 L 20 75 A 15 15 0 0 1 35 60 Z" />
        <rect
          x="90"
          y="68"
          width="16"
          height="36"
          rx="8"
          transform="rotate(35 90 70)"
        />
        <rect x="23" y="30" width="12" height="40" rx="6" />
        <rect x="41" y="20" width="12" height="45" rx="6" />
        <rect x="59" y="15" width="12" height="50" rx="6" />
        <rect x="77" y="25" width="12" height="45" rx="6" />
      </g>
    </svg>
  );
}

export function EntrySection() {
  const {reducedMotion, lockScroll, raiseSignCount} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);

  // 아무 입력이나 들어오면 연출을 건너뛰고 최종 상태로 점프한다(원안의 forceEndState).
  const [skipped, setSkipped] = useState(false);
  const instant = reducedMotion || skipped;
  const [lamp, skipBtn, hand, sign, dim, title, words, counter, ended] =
    useTimeline(STEPS, true, instant);

  const finished = ended || instant;

  const forceEnd = useCallback(() => {
    setSkipped(prev => prev || true);
  }, []);

  // 연출이 도는 동안에는 스크롤을 잠가 둔다 — 끝나면 갤러리로 내려갈 수 있다.
  useEffect(() => {
    if (finished) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [finished, lockScroll]);

  // 마우스/휠/키/터치 — 무엇이든 한 번 들어오면 즉시 최종 상태.
  useEffect(() => {
    if (finished) return;
    const events = ["mousedown", "wheel", "keydown", "touchstart"] as const;
    events.forEach(evt =>
      document.addEventListener(evt, forceEnd, {passive: true})
    );
    return () =>
      events.forEach(evt => document.removeEventListener(evt, forceEnd));
  }, [finished, forceEnd]);

  useEffect(() => {
    if (counter || instant) raiseSignCount(1);
  }, [counter, instant, raiseSignCount]);

  const on = (flag: boolean) => flag || instant;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className={`relative flex h-screen w-full select-none flex-col items-center overflow-hidden ${
        instant ? "sd-instant" : ""
      }`}
    >
      <p className="sr-only">
        손이 「안녕하세요」에 해당하는 수어 동작을 수행합니다.
      </p>

      {/* 바닥 선 */}
      <div
        className="absolute inset-x-0 bottom-[33%] z-0 h-px bg-[rgba(126,184,255,0.08)]"
        aria-hidden="true"
      />

      {/* 천장 조명 */}
      <div
        className={`sd-lamp absolute left-1/2 top-0 z-0 h-[60vh] w-[300px] md:h-[600px] md:w-[420px] ${
          on(lamp) ? "sd-lamp-on" : ""
        } ${on(dim) ? "sd-lamp-wide" : ""}`}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center pt-[15vh]">
        {/* 손 */}
        <div
          className="flex flex-col items-center transition-opacity duration-300"
          style={{
            opacity: on(dim) ? 0.55 : on(hand) ? 1 : 0,
            transitionDuration: instant ? "0s" : undefined
          }}
        >
          <div className="h-[180px] w-[160px] md:h-[200px] md:w-[180px]">
            <SignHand animate={on(sign) && !instant} />
          </div>

          <div
            className="mt-5 flex flex-col items-center transition-opacity duration-300"
            style={{
              opacity: on(sign) ? 1 : 0,
              transitionDuration: instant ? "0s" : undefined
            }}
          >
            <span className="font-mono text-[13px] text-[var(--sd-accent)]">
              안녕하세요
            </span>
            <span className="mt-1.5 font-mono text-[10px] tracking-wide text-[var(--sd-muted)]">
              지금 이 손이 하고 있는 말입니다
            </span>
          </div>
        </div>

        {/* 타이틀 + 동기 */}
        <div className="mt-[6vh] flex w-full max-w-[560px] flex-col items-center px-6 text-center md:mt-[8vh]">
          <div
            className="flex flex-col items-center transition-all duration-700"
            style={{
              opacity: on(title) ? 1 : 0,
              transform: on(title) ? "translateY(0)" : "translateY(10px)",
              transitionDuration: instant ? "0s" : undefined
            }}
          >
            <h1 className="text-[34px] font-black leading-none tracking-[-0.02em] text-[var(--sd-primary)] md:text-[54px]">
              수어지구
            </h1>
            <p className="mt-[12px] font-mono text-[11px] tracking-[0.14em] text-[var(--sd-muted)] md:text-[13px]">
              수어 학습·표현 서비스 · Spring Boot 백엔드
            </p>
          </div>

          <p
            className={`mt-[28px] flex flex-wrap justify-center break-keep text-[15px] leading-[36px] text-[var(--sd-text)] md:text-[17px] ${
              on(words) ? "sd-reveal" : ""
            }`}
          >
            {MOTIVATION.split(" ").map((word, i) => (
              <span
                key={i}
                className="sd-word"
                style={{transitionDelay: instant ? "0s" : `${i * 0.035}s`}}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* 손동작 카운터 — 이 화면에는 공용 헤더가 없어 직접 그린다 */}
      <div
        className="absolute right-6 top-6 z-20 font-mono text-[12px] tabular-nums text-[var(--sd-muted)] transition-opacity duration-[400ms] md:right-8"
        style={{
          opacity: on(counter) ? 1 : 0,
          transitionDuration: instant ? "0s" : undefined
        }}
      >
        손동작 1 / {SIGN_TOTAL}
      </div>

      <div
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center transition-opacity duration-[400ms]"
        style={{
          opacity: finished ? 1 : 0,
          transitionDuration: instant ? "0s" : undefined
        }}
      >
        <span className="mb-2 font-mono text-[12px] text-[var(--sd-muted)]">
          ↓ 갤러리로
        </span>
        <svg
          className={`h-4 w-4 opacity-80 ${instant ? "" : "sd-bob"}`}
          style={{color: "var(--sd-accent)"}}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <button
        type="button"
        onClick={forceEnd}
        className="absolute bottom-8 right-6 z-50 cursor-pointer border-none bg-transparent p-2 font-mono text-[11px] text-[rgba(255,255,255,0.35)] transition-opacity duration-300 hover:text-white md:right-8"
        style={{
          opacity: !finished && on(skipBtn) ? 1 : 0,
          pointerEvents: !finished && on(skipBtn) ? "auto" : "none"
        }}
      >
        [ 건너뛰기 ]
      </button>
    </section>
  );
}
