"use client";

import {useEffect, useRef} from "react";
import {useAjou} from "../context";
import {fade, rise} from "../parts";
import {useTimeline} from "../useTimeline";

// 엔트리 — 방의 첫 화면. 공지가 채널마다 흩어져 떠 있는 상태를 먼저 보여준다.
// 이 방의 질문("그래서 그 공지는 어디에 있나요?")을 던지고 아래로 내려보낸다.

const STEPS = [200, 700, 1300, 1900, 2500];
const IDX = {notes: 0, kicker: 1, title: 2, sub: 3, hint: 4};

/** 화면에 흩뿌려진 공지 — 좌표는 고정값이라 매번 같은 그림이 나온다. */
const SCATTER: {
  ch: string;
  text: string;
  x: string;
  y: string;
  tilt: number;
  delay: number;
}[] = [
  {ch: "인스타", text: "총회 일정 6/30", x: "8%", y: "18%", tilt: -7, delay: 0},
  {
    ch: "에브리타임",
    text: "학식 환불 접수?",
    x: "72%",
    y: "12%",
    tilt: 5,
    delay: 120
  },
  {
    ch: "카톡 공지방",
    text: "셔틀 노선 변경",
    x: "14%",
    y: "68%",
    tilt: 4,
    delay: 240
  },
  {
    ch: "학과 메일",
    text: "감사 자료 열람 안내",
    x: "66%",
    y: "72%",
    tilt: -5,
    delay: 360
  },
  {
    ch: "게시판 포스터",
    text: "제휴 카페 3곳",
    x: "42%",
    y: "84%",
    tilt: 3,
    delay: 480
  }
];

export function EntrySection() {
  const {reducedMotion} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const on = useTimeline(STEPS, true, reducedMotion);
  const instant = reducedMotion;

  // 방에 들어오면 항상 맨 위에서 시작한다(이전 스크롤 위치가 남지 않게).
  const {rootRef} = useAjou();
  useEffect(() => {
    rootRef.current?.scrollTo({top: 0});
  }, [rootRef]);

  return (
    <section
      ref={ref}
      data-aj-section
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-5 text-center"
    >
      {/* 흩어진 공지 쪽지들 — 장식이므로 보조기기에서 숨긴다 */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {SCATTER.map(n => (
          <div
            key={n.ch}
            className="absolute w-[124px] sm:w-[150px]"
            style={{
              left: n.x,
              top: n.y,
              ...fade(on[IDX.notes], instant, "1s"),
              transitionDelay: instant ? "0s" : `${n.delay}ms`
            }}
          >
            <div
              className="aj-paper rounded-[3px] px-3 py-2 text-left"
              style={{transform: `rotate(${n.tilt}deg)`}}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(42,27,27,0.5)]">
                {n.ch}
              </div>
              <div className="mt-0.5 text-[11px] font-bold leading-4 text-[var(--aj-ink)]">
                {n.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 가운데를 읽기 좋게 어둡게 깔아 준다 */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(22,7,9,0.94) 0%, rgba(22,7,9,0.7) 55%, transparent 100%)"
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <div
          className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--aj-primary)]"
          style={fade(on[IDX.kicker], instant)}
        >
          Student Council · Team SPA + Deploy
        </div>

        <h1
          className="mt-5 max-w-[16ch] text-[30px] font-black leading-[1.28] sm:text-[42px]"
          style={{...rise(on[IDX.title], instant, "0.8s"), textWrap: "balance"}}
        >
          그 공지, 어디서
          <br />
          보셨어요?
        </h1>

        <p
          className="mt-6 max-w-[38ch] text-[14px] leading-[28px] text-[var(--aj-muted)] sm:text-[15px]"
          style={{...rise(on[IDX.sub], instant, "0.8s"), textWrap: "pretty"}}
        >
          인스타, 에브리타임, 카톡방, 학과 메일, 게시판 포스터.
          <br className="hidden sm:block" /> 총학생회 정보는 다섯 군데에 흩어져
          있었고, 하나를 놓치면 그걸로 끝이었습니다.
        </p>

        <div
          className="mt-12 flex flex-col items-center gap-2"
          style={fade(on[IDX.hint], instant)}
        >
          <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--aj-faint)]">
            아래로 내려서 읽기
          </span>
          <span
            className="text-[16px] text-[var(--aj-primary)]"
            aria-hidden="true"
          >
            ↓
          </span>
        </div>
      </div>
    </section>
  );
}
