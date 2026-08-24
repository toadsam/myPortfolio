"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {sound} from "../../sound";
import {useTimeline} from "../useTimeline";

// PAGE 00 — 진입 시퀀스 (부팅 화면)
//
// 개발 실체: 왜 이걸 만들었는가(동기)
// 연출 장치: 게임 부팅 → PRESS SPACE → **관람객의 첫 입력이 점프다**
//
// 스펙 A-8 의 가장 강한 규칙: 스페이스 리스너는 **이 오버레이가 떠 있는 동안에만**
// 살아 있어야 한다. 전역에 남기면 페이지 스크롤이 죽는다.

const STEPS = [300, 900, 1400, 2000, 3200];
const IDX = {grid: 0, block: 1, title: 2, motive: 3, prompt: 4};

const MOTIVE =
  "3D 플랫포머에서 제일 먼저 망가지는 건 레벨이 아니라 점프였다. 발판 끝에서 누른 점프가 씹히는 순간 플레이어는 게임을 끈다. 그 0.1초를 어떻게 다루는지가 궁금해서 만들었다.";

export function P00Boot({
  reducedMotion,
  onBoot
}: {
  reducedMotion: boolean;
  onBoot: () => void;
}) {
  const instant = reducedMotion;
  const on = useTimeline(STEPS, true, instant);
  const [jumping, setJumping] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [touch, setTouch] = useState(false);
  const done = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setTouch(
      typeof window !== "undefined" &&
        window.matchMedia("(pointer: coarse)").matches
    );
  }, []);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(id => window.clearTimeout(id));
  }, []);

  const start = useCallback(() => {
    if (done.current) return;
    done.current = true;

    if (instant) {
      onBoot();
      return;
    }

    setJumping(true);
    sound?.sfx?.("open");
    timers.current.push(window.setTimeout(() => setLeaving(true), 620));
    timers.current.push(window.setTimeout(onBoot, 1070));
  }, [instant, onBoot]);

  // 스페이스 — 이 오버레이가 살아 있는 동안에만.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== " " && e.key !== "Spacebar") return;
      e.preventDefault();
      start();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start]);

  // 5초 동안 아무 입력이 없으면 같은 점프로 넘어간다.
  useEffect(() => {
    if (instant) return;
    const id = window.setTimeout(start, 5000);
    timers.current.push(id);
    return () => window.clearTimeout(id);
  }, [instant, start]);

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-[450ms]"
      style={{
        background: "var(--ts-bg)",
        opacity: leaving ? 0 : 1,
        pointerEvents: leaving ? "none" : "auto"
      }}
      onClick={start}
      onWheel={start}
    >
      {/* 바닥면 그리드 */}
      <div
        className="pointer-events-none absolute inset-x-[-40%] bottom-0 h-[62%]"
        aria-hidden="true"
        style={{opacity: on[IDX.grid] || instant ? 1 : 0}}
      >
        <div
          className={`ts-grid ts-groundgrid h-full w-full ${
            on[IDX.grid] && !instant ? "ts-grid-in" : ""
          }`}
        />
      </div>

      {/* 플레이어 블록 */}
      <div
        className="absolute"
        style={{
          top: "44vh",
          opacity: on[IDX.block] || instant ? 1 : 0
        }}
        aria-hidden="true"
      >
        <div
          className={`h-9 w-9 rounded-sm sm:h-11 sm:w-11 ${
            instant ? "" : jumping ? "ts-hop" : on[IDX.block] ? "ts-drop" : ""
          }`}
          style={{background: "var(--ts-primary)", transformOrigin: "bottom"}}
        />
      </div>

      {/* 제목 + 동기 + 프롬프트 */}
      <div className="relative z-10 flex w-full max-w-[620px] flex-col items-center px-5 text-center">
        <div style={{marginTop: "12vh"}}>
          <h1
            className="font-black leading-none"
            style={{
              fontSize: "clamp(44px, 9vw, 72px)",
              color: "var(--ts-text)",
              letterSpacing: "0.04em",
              opacity: on[IDX.title] || instant ? 1 : 0,
              transform:
                on[IDX.title] || instant ? "translateY(0)" : "translateY(14px)",
              transition: instant
                ? "none"
                : "opacity 0.45s var(--ts-ease), transform 0.45s var(--ts-ease)"
            }}
          >
            TSEROF
          </h1>
          <p
            className="mt-4 font-mono text-[12px] sm:text-[14px]"
            style={{
              color: "var(--ts-muted)",
              letterSpacing: "0.22em",
              opacity: on[IDX.title] || instant ? 1 : 0,
              transition: instant ? "none" : "opacity 0.45s var(--ts-ease)"
            }}
          >
            3D 플랫포머 · Unity · 팀 프로젝트
          </p>
        </div>

        {/* 동기 — 이 페이지에서 관람객이 읽는 첫 진짜 문장 */}
        <p
          className="mt-8 max-w-[560px] text-[16px] leading-9 sm:text-[17px]"
          style={{color: "var(--ts-text)", textWrap: "pretty"}}
        >
          {MOTIVE.split(" ").map((w, i) => (
            <span
              key={`${w}-${i}`}
              className="inline-block"
              style={{
                opacity: on[IDX.motive] || instant ? 1 : 0,
                transform:
                  on[IDX.motive] || instant
                    ? "translateY(0)"
                    : "translateY(6px)",
                transition: instant
                  ? "none"
                  : `opacity 0.3s ease-out ${
                      (i * 30) / 1000
                    }s, transform 0.3s ease-out ${(i * 30) / 1000}s`
              }}
            >
              {w}
              {" "}
            </span>
          ))}
        </p>
      </div>

      {/* 입력 프롬프트 — 진짜 버튼이어야 한다 */}
      <div
        className="absolute inset-x-0 flex flex-col items-center gap-2"
        style={{
          top: "76vh",
          opacity: on[IDX.prompt] || instant ? 1 : 0,
          transition: instant ? "none" : "opacity 0.4s var(--ts-ease)"
        }}
      >
        <button
          type="button"
          onClick={start}
          className={`font-mono text-[16px] font-bold ${
            instant ? "" : "ts-pulse"
          }`}
          style={{color: "var(--ts-primary)", letterSpacing: "0.3em"}}
        >
          {instant ? "[ 시작하기 ]" : touch ? "TAP TO START" : "PRESS SPACE"}
        </button>
        {instant ? null : (
          <span className="font-mono text-[12px] text-[var(--ts-muted)]">
            ( 클릭 · 스크롤도 됩니다 )
          </span>
        )}
      </div>
    </div>
  );
}
