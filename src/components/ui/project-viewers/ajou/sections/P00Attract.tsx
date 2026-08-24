"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 00 — 어트랙트 모드 (코인 투입)
//
// 개발 실체: 왜 이걸 만들었는가 (동기)
// 연출 장치: 오락실 캐비닛 어트랙트 화면 → 코인 투입 → 첫 문장
//
// 동기 문장은 **PDF 28쪽 「이 게임은 어떤 게임인가요?」 원문**을 근거로 한다.
// 스펙에 예시로 적힌 브라우저 플랫포머 이야기는 이 프로젝트가 아니라 쓰지 않는다.

const STEPS = [0, 420, 760, 1120, 1900, 2500];
const IDX = {frame: 0, title: 1, sub: 2, marquee: 3, motive: 4, coin: 5};

const TITLE = "아주대탐험";

// PDF 28쪽 원문에서 뽑은 어트랙트 마키.
const MARQUEE = [
  "아주대학교 캠퍼스를 무대로",
  "'치토'가 졸업을 목표로 성장하는",
  "캐주얼 액션 어드벤처"
];

export function P00Attract({
  reducedMotion,
  onStart
}: {
  reducedMotion: boolean;
  onStart: () => void;
}) {
  const on = useTimeline(STEPS, true, reducedMotion);
  const instant = reducedMotion;
  const startRef = useRef(onStart);
  startRef.current = onStart;

  const [inserting, setInserting] = useState(false);

  const insert = useCallback(() => {
    if (instant) {
      startRef.current();
      return;
    }
    setInserting(true);
    window.setTimeout(() => startRef.current(), 640);
  }, [instant]);

  // 탈출구 — 아무 클릭·스크롤·키로도 즉시 시작한다(스펙 필수).
  useEffect(() => {
    if (instant) {
      startRef.current();
      return;
    }
    const go = () => insert();
    window.addEventListener("keydown", go);
    window.addEventListener("wheel", go, {passive: true});
    window.addEventListener("touchstart", go, {passive: true});
    const auto = window.setTimeout(go, 7000);
    return () => {
      window.removeEventListener("keydown", go);
      window.removeEventListener("wheel", go);
      window.removeEventListener("touchstart", go);
      window.clearTimeout(auto);
    };
  }, [instant, insert]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-5"
      style={{background: "#0a0f04"}}
      onClick={insert}
      role="presentation"
    >
      {/* 캐비닛 CRT */}
      <div
        className="aj-crtglow relative w-full overflow-hidden rounded-md"
        style={{
          maxWidth: "620px",
          aspectRatio: "4 / 3",
          background: "var(--aj-bg)",
          border: "2px solid rgba(163,230,53,0.28)",
          opacity: on[IDX.frame] ? 1 : 0,
          transition: instant ? "none" : "opacity 0.4s var(--aj-ease)"
        }}
      >
        <div className="aj-grid absolute inset-0" aria-hidden="true" />
        <div className="aj-scan absolute inset-0" aria-hidden="true" />

        <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <div
            className="font-mono text-[10px] tracking-[0.32em] text-[var(--aj-muted)]"
            style={{
              opacity: on[IDX.title] ? 1 : 0,
              transition: instant ? "none" : "opacity 0.3s var(--aj-ease)"
            }}
          >
            AJOU INDIE GAME
          </div>

          <h1
            className="text-[34px] font-black leading-none sm:text-[46px]"
            style={{
              color: "var(--aj-primary)",
              letterSpacing: "0.04em",
              textShadow: "0 0 22px rgba(163,230,53,0.45)",
              opacity: on[IDX.title] ? 1 : 0,
              transform: on[IDX.title] ? "scale(1)" : "scale(0.94)",
              transition: instant
                ? "none"
                : "opacity 0.35s var(--aj-ease), transform 0.35s var(--aj-ease)"
            }}
          >
            {TITLE}
          </h1>

          <div
            className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-accent)]"
            style={{
              opacity: on[IDX.sub] ? 1 : 0,
              transition: instant ? "none" : "opacity 0.3s var(--aj-ease)"
            }}
          >
            Unity · C# · 1인 개발 · 2024.08 – 2024.12
          </div>

          {/* 어트랙트 마키 */}
          <div className="mt-4 flex flex-col gap-1">
            {MARQUEE.map((line, i) => (
              <p
                key={line}
                className="text-[13px] leading-6 text-[var(--aj-text)] sm:text-[15px] sm:leading-7"
                style={{
                  opacity: on[IDX.marquee] ? 1 : 0,
                  transform: on[IDX.marquee]
                    ? "translateY(0)"
                    : "translateY(6px)",
                  transition: instant
                    ? "none"
                    : `opacity 0.3s var(--aj-ease) ${i * 130}ms, transform 0.3s var(--aj-ease) ${i * 130}ms`
                }}
              >
                {line}
              </p>
            ))}
          </div>

          {/* 동기 — 이 페이지의 실체 */}
          <p
            className="mt-5 max-w-[440px] text-[13px] leading-7 text-[var(--aj-muted)]"
            style={{
              opacity: on[IDX.motive] ? 1 : 0,
              transition: instant
                ? "none"
                : "opacity 0.45s var(--aj-ease)"
            }}
          >
            기능을 하나씩 붙이는 게 아니라{" "}
            <span style={{color: "var(--aj-accent)"}}>
              나중에 더 붙일 수 있는 구조
            </span>
            로 만들어 보고 싶었습니다. 코어 루프와 시스템을 갈라 놓는 것부터
            시작했습니다.
          </p>

          <div
            className="mt-6 flex flex-col items-center gap-2"
            style={{
              opacity: on[IDX.coin] ? 1 : 0,
              transition: instant ? "none" : "opacity 0.3s var(--aj-ease)"
            }}
          >
            <span
              className={`text-[24px] ${
                inserting && !instant ? "aj-insert" : ""
              }`}
              style={{color: "var(--aj-warn)"}}
              aria-hidden="true"
            >
              ◉
            </span>
            <span
              className={`font-mono text-[12px] tracking-[0.28em] ${
                instant || inserting ? "" : "aj-coin"
              }`}
              style={{color: "var(--aj-primary)"}}
            >
              {inserting ? "CREDIT 1" : "INSERT COIN"}
            </span>
            <span className="font-mono text-[10px] text-[var(--aj-faint)]">
              아무 키나 누르면 시작합니다
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={insert}
        className="absolute bottom-6 right-6 cursor-pointer font-mono text-[11px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-white"
        style={{
          opacity: on[IDX.frame] ? 1 : 0,
          transition: instant ? "none" : "opacity 0.3s var(--aj-ease)"
        }}
      >
        [ 건너뛰기 ]
      </button>
    </div>
  );
}
