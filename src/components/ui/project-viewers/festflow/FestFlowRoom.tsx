"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {
  FestFlowProvider,
  MONITORS,
  MONITOR_KEY,
  MONITOR_TOTAL,
  type FestFlowRoomApi
} from "./context";
import "./festflow.css";
import {ffMono, ffSans} from "./fonts";
import {P00Boot} from "./sections/P00Boot";
import {P01Hero} from "./sections/P01Hero";
import {P02Sse} from "./sections/P02Sse";
import {P03Polling} from "./sections/P03Polling";
import {P04Map} from "./sections/P04Map";
import {P05Roles} from "./sections/P05Roles";
import {P06Predict} from "./sections/P06Predict";
import {P07Fallback} from "./sections/P07Fallback";
import {P08ModelChoice} from "./sections/P08ModelChoice";
import {P09Chatbot} from "./sections/P09Chatbot";
import {P10Structure} from "./sections/P10Structure";
import {P11Field} from "./sections/P11Field";
import {P12Retro} from "./sections/P12Retro";

interface Props {
  project: ProjectData;
  theme: ProjectTheme;
  onClose: () => void;
}

/**
 * FestFlow(Fest-A) 룸 —
 * 「축제 현장 관제 텐트. 지도는 살아 있고, 화면은 나 없이도 계속 바뀐다.」
 *
 * 구조·순서·연출 문법은 portfolio-specs/03-festflow.md 를 따르고,
 * **개발 내용·수치·회고는 최종 발표자료(Fest-A 31장)와 저장소**를 따른다.
 * 스펙이 11칸이었던 것을 13칸으로 늘린 이유는 context.ts 참고.
 *
 * 이 방의 절대 규칙(스펙 A-8):
 *  - 자동 애니메이션은 prefers-reduced-motion 에서 전부 정지
 *  - 실시간 루프는 뷰포트 밖·탭 숨김이면 반드시 멈춘다
 *  - 지어낸 지표 0개. 실측값만 쓰고, 시연 데이터는 시연이라고 밝힌다
 *  - 소리 없음 — 이 방은 무음이고 사운드 토글 자체를 두지 않는다
 */
export function FestFlowRoom({onClose}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lockCount = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [booted, setBooted] = useState(false);
  const [monitor, setMonitor] = useState(0);
  const [current, setCurrent] = useState(0);
  const [liveMessage, setLiveMessage] = useState("");
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // 이어보기 — 지난번에 켜둔 모니터를 복원한다.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(MONITOR_KEY);
      if (saved) {
        const n = Number.parseInt(saved, 10);
        if (Number.isFinite(n))
          setMonitor(Math.min(Math.max(n, 0), MONITOR_TOTAL - 1));
      }
    } catch {
      /* 세션 저장소를 못 쓰는 환경이면 처음부터 */
    }
  }, []);

  // 11장(현장 검증)부터 축제가 저문다.
  useEffect(() => {
    rootRef.current?.classList.toggle("ff-late", current >= 11);
  }, [current]);

  const lockScroll = useCallback((locked: boolean) => {
    lockCount.current = Math.max(0, lockCount.current + (locked ? 1 : -1));
    rootRef.current?.classList.toggle("ff-locked", lockCount.current > 0);
  }, []);

  const reach = useCallback((index: number) => {
    setCurrent(index);
    setMonitor(prev => {
      if (index <= prev) return prev;
      try {
        window.sessionStorage.setItem(MONITOR_KEY, String(index));
      } catch {
        /* 무시 */
      }
      return index;
    });
  }, []);

  const announce = useCallback((message: string) => setLiveMessage(message), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && lockCount.current === 0) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 부팅이 끝나기 전엔 스크롤을 잡아 둔다. 끝나면 즉시 푼다.
  useEffect(() => {
    if (booted) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [booted, lockScroll]);

  // 퇴장 — 축제 종료. 관제 모니터가 꺼진다.
  const handleExit = useCallback(() => {
    if (exiting) return;
    if (reducedMotion) {
      onClose();
      return;
    }
    setExiting(true);
    window.setTimeout(onClose, 2400);
  }, [exiting, reducedMotion, onClose]);

  const api = useMemo<FestFlowRoomApi>(
    () => ({
      rootRef,
      reducedMotion,
      monitor,
      current,
      reach,
      lockScroll,
      announce,
      onClose
    }),
    [reducedMotion, monitor, current, reach, lockScroll, announce, onClose]
  );

  return (
    <FestFlowProvider value={api}>
      <div
        ref={rootRef}
        className={`ff-root ${ffSans.variable} ${ffMono.variable}`}
      >
        <div aria-live="polite" className="sr-only">
          {liveMessage}
        </div>

        {/* ── 관제 헤더 (부팅 중에는 숨김) ── */}
        <header
          className="fixed inset-x-0 top-0 z-[56] flex h-[54px] items-center justify-between gap-3 px-4 backdrop-blur-[10px] transition-opacity duration-500 sm:px-6"
          style={{
            background: "rgba(20,15,4,0.86)",
            borderBottom: "1px solid rgba(251,191,36,0.16)",
            opacity: booted ? 1 : 0,
            pointerEvents: booted ? "auto" : "none"
          }}
        >
          <div className="flex-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer font-mono text-[13px] text-[var(--ff-muted)] transition-colors hover:text-white"
            >
              ← 마을로
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`block h-[7px] w-[7px] rounded-full ${
                reducedMotion ? "" : "ff-pulse"
              }`}
              style={{background: "var(--ff-live)"}}
              aria-hidden="true"
            />
            <span
              className="text-[14px] font-black"
              style={{color: "var(--ff-primary)", letterSpacing: "0.04em"}}
            >
              Fest-A
            </span>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <span className="font-mono text-[12px] tabular-nums text-[var(--ff-accent)]">
              MON {MONITORS[Math.min(monitor, MONITOR_TOTAL - 1)].n} /{" "}
              {MONITOR_TOTAL}
            </span>
            {/* 관제 모니터 표시등 — 이 방의 유일한 진행 지표 */}
            <div className="hidden gap-[3px] sm:flex" aria-hidden="true">
              {MONITORS.map((m, i) => {
                const lit = i <= monitor;
                const cur = i === current;
                return (
                  <span
                    key={m.n}
                    className={`block h-[10px] w-[14px] rounded-[2px] ${
                      lit && !reducedMotion ? "ff-lamp" : ""
                    }`}
                    style={{
                      background: cur
                        ? "var(--ff-live)"
                        : lit
                        ? "var(--ff-primary)"
                        : "rgba(255,255,255,0.10)",
                      boxShadow: cur
                        ? "0 0 6px rgba(74,222,128,0.75)"
                        : undefined
                    }}
                  />
                );
              })}
            </div>
            <span className="sr-only">
              모니터 {MONITOR_TOTAL}대 중 {monitor + 1}대 신호 정상
            </span>
          </div>
        </header>

        <main>
          <P01Hero />
          <P02Sse />
          <P03Polling />
          <P04Map />
          <P05Roles />
          <P06Predict />
          <P07Fallback />
          <P08ModelChoice />
          <P09Chatbot />
          <P10Structure />
          <P11Field />
          <P12Retro onExit={handleExit} />
        </main>

        {booted ? null : (
          <P00Boot
            reducedMotion={reducedMotion}
            onBoot={() => {
              setBooted(true);
              reach(0);
            }}
          />
        )}

        {/* ── 퇴장: 축제 종료 → 모니터 소등 ── */}
        {exiting ? (
          <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
            <div
              className="ff-fadeblack absolute inset-0 bg-black"
              style={{opacity: 0}}
            />
            <div className="ff-poweroff relative z-10 flex flex-col items-center gap-3">
              <span
                className="font-mono text-[22px] font-black tracking-[0.24em] sm:text-[26px]"
                style={{color: "var(--ff-primary)"}}
              >
                FESTIVAL CLOSED
              </span>
              <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
                관제 모니터 13대 소등
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </FestFlowProvider>
  );
}
