"use client";

import {useCallback, useEffect, useRef} from "react";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 00 — 부팅 시퀀스 (관제 시스템 기동)
//
// 개발 실체: 왜 이걸 만들었는가 (동기)
// 연출 장치: 관제 모니터가 순차 부팅되며 마지막에 동기 문장이 뜸
//
// 동기는 **발표자료 2장 「기획 출발점: 기존 축제 운영의 문제」 원문**을 쓴다.

const STEPS = [0, 420, 760, 1100, 1440, 2100, 2700];
const IDX = {frame: 0, l1: 1, l2: 2, l3: 3, title: 4, motive: 5, hint: 6};

// 발표자료 2장 원문
const LINES = [
  {k: "01", t: "방문객 정보 부족", d: "부스 혼잡도, 대기 현황, 품절 여부를 현장에 가기 전에는 알기 어려움"},
  {k: "02", t: "운영진 소통 지연", d: "카톡·구두 전달에 의존해 정보 누락, 전달 지연, 취합 지연 발생"},
  {k: "03", t: "통합 운영 도구 부재", d: "방문객, 운영진, 관리자 정보가 한 플랫폼에서 연결되지 않음"}
] as const;

export function P00Boot({
  reducedMotion,
  onBoot
}: {
  reducedMotion: boolean;
  onBoot: () => void;
}) {
  const on = useTimeline(STEPS, true, reducedMotion);
  const instant = reducedMotion;
  const bootRef = useRef(onBoot);
  bootRef.current = onBoot;

  const go = useCallback(() => bootRef.current(), []);

  // 탈출구 — 아무 클릭·스크롤·키로도 즉시 진입한다(스펙 필수).
  useEffect(() => {
    if (instant) {
      go();
      return;
    }
    window.addEventListener("keydown", go);
    window.addEventListener("wheel", go, {passive: true});
    window.addEventListener("touchstart", go, {passive: true});
    const auto = window.setTimeout(go, 7200);
    return () => {
      window.removeEventListener("keydown", go);
      window.removeEventListener("wheel", go);
      window.removeEventListener("touchstart", go);
      window.clearTimeout(auto);
    };
  }, [instant, go]);

  const rows = [on[IDX.l1], on[IDX.l2], on[IDX.l3]];

  return (
    <div
      className="ff-grid fixed inset-0 z-[90] flex items-center justify-center px-5"
      style={{background: "var(--ff-bg)"}}
      onClick={go}
      role="presentation"
    >
      <div
        className="w-full rounded-lg p-[22px] sm:p-[30px]"
        style={{
          maxWidth: "620px",
          background: "var(--ff-panel)",
          border: "1px solid rgba(251,191,36,0.24)",
          opacity: on[IDX.frame] ? 1 : 0,
          transition: instant ? "none" : "opacity 0.4s var(--ff-ease)"
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] tracking-[0.28em] text-[var(--ff-muted)]">
            FESTIVAL OPS · BOOTING
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`block h-[6px] w-[6px] rounded-full ${
                instant ? "" : "ff-pulse"
              }`}
              style={{background: "var(--ff-live)"}}
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] text-[var(--ff-live)]">
              LIVE
            </span>
          </span>
        </div>

        {/* 진단 세 줄이 순차 점등 — 이 페이지가 실어 나를 개발 실체 */}
        <div className="mt-6 flex flex-col gap-2.5">
          {LINES.map((l, i) => (
            <div
              key={l.k}
              className={`rounded-md p-3.5 ${
                rows[i] && !instant ? "ff-signal" : ""
              }`}
              style={{
                border: `1px solid ${
                  rows[i] ? "rgba(248,113,113,0.34)" : "rgba(255,255,255,0.08)"
                }`,
                background: rows[i]
                  ? "rgba(248,113,113,0.06)"
                  : "rgba(255,255,255,0.02)",
                opacity: rows[i] ? 1 : 0.25,
                transition: instant ? "none" : "opacity 0.3s var(--ff-ease)"
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-[10px]"
                  style={{color: "var(--ff-down)"}}
                >
                  {l.k}
                </span>
                <span
                  className="font-mono text-[12px] font-bold"
                  style={{color: rows[i] ? "var(--ff-text)" : "var(--ff-faint)"}}
                >
                  {l.t}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-[var(--ff-muted)] sm:text-[12px]">
                {l.d}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-7 pt-6"
          style={{borderTop: "1px solid rgba(251,191,36,0.14)"}}
        >
          <h1
            className="text-[26px] font-black leading-none sm:text-[34px]"
            style={{
              color: "var(--ff-primary)",
              opacity: on[IDX.title] ? 1 : 0,
              transform: on[IDX.title] ? "translateY(0)" : "translateY(8px)",
              transition: instant
                ? "none"
                : "opacity 0.4s var(--ff-ease), transform 0.4s var(--ff-ease)"
            }}
          >
            Fest-A
          </h1>
          <p
            className="mt-2 font-mono text-[11px] tracking-[0.16em] text-[var(--ff-accent)] sm:text-[12px]"
            style={{
              opacity: on[IDX.title] ? 1 : 0,
              transition: instant ? "none" : "opacity 0.4s var(--ff-ease)"
            }}
          >
            AI 기반 대학교 축제 통합 운영 플랫폼 · 1인 개발
          </p>

          {/* 동기 — 발표자료 2장 「핵심 문제」 원문 */}
          <p
            className="mt-5 text-[14px] leading-8 sm:text-[16px] sm:leading-9"
            style={{
              maxWidth: "480px",
              color: "var(--ff-text)",
              opacity: on[IDX.motive] ? 1 : 0,
              transition: instant ? "none" : "opacity 0.5s var(--ff-ease)"
            }}
          >
            축제 정보가 <strong>실시간으로 연결되지 않아</strong> 방문객과
            운영진 모두 비효율을 겪고 있었습니다.
          </p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-[76px] flex flex-col items-center gap-1"
        style={{
          opacity: on[IDX.hint] ? 1 : 0,
          transition: instant ? "none" : "opacity 0.4s var(--ff-ease)"
        }}
      >
        <span className="font-mono text-[12px] text-[var(--ff-muted)]">
          ↓ 내려가면 모니터가 한 대씩 켜집니다
        </span>
        <span
          className={instant ? "" : "ff-chev"}
          style={{color: "var(--ff-primary)"}}
          aria-hidden="true"
        >
          ▼
        </span>
      </div>

      <button
        type="button"
        onClick={go}
        className="absolute bottom-6 right-6 cursor-pointer font-mono text-[11px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-white"
        style={{
          opacity: on[IDX.frame] ? 1 : 0,
          transition: instant ? "none" : "opacity 0.3s var(--ff-ease)"
        }}
      >
        [ 건너뛰기 ]
      </button>
    </div>
  );
}
