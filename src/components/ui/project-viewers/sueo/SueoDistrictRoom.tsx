"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {SIGN_TOTAL, SueoProvider, type SueoRoomApi} from "./context";
import {sueoMono, sueoSans} from "./fonts";
import {ArchitectureSection} from "./sections/ArchitectureSection";
import {EntrySection} from "./sections/EntrySection";
import {GallerySection} from "./sections/GallerySection";
import {LimitsSection} from "./sections/LimitsSection";
import {MotionDataSection} from "./sections/MotionDataSection";
import {ResultSection} from "./sections/ResultSection";
import {RetroSection} from "./sections/RetroSection";
import {ReviewLoopSection} from "./sections/ReviewLoopSection";
import {SentenceSection} from "./sections/SentenceSection";
import {Trouble01Section} from "./sections/Trouble01Section";
import {Trouble02Section} from "./sections/Trouble02Section";
import "./sueo.css";

interface Props {
  project: ProjectData;
  theme: ProjectTheme;
  onClose: () => void;
}

// 수어지구 룸 — 엔트리 시퀀스로 시작해 아래로 읽어 내려가는 스크롤 전시실.
// DarkLabRoom과 같은 구조(전용 룸 + 섹션 분리 + 스코프 CSS)를 따른다.
// 헤더의 「손동작 n / 12」는 방문자가 실제로 재생한 수어 동작 수이며 섹션들이 공유한다.
export function SueoDistrictRoom({onClose}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lockCount = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [signCount, setSignCount] = useState(1);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // 엔트리(첫 섹션)를 지나야 헤더가 나온다 — 엔트리 화면은 자체 카운터를 그린다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const first = root.querySelector<HTMLElement>("[data-sd-section]");
    if (!first) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) setHeaderVisible(!entry.isIntersecting);
      },
      {root, threshold: 0.35}
    );
    observer.observe(first);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && lockCount.current === 0) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const lockScroll = useCallback((locked: boolean) => {
    lockCount.current = Math.max(0, lockCount.current + (locked ? 1 : -1));
    rootRef.current?.classList.toggle("sd-locked", lockCount.current > 0);
  }, []);

  const raiseSignCount = useCallback((next: number) => {
    setSignCount(prev => (next > prev ? Math.min(next, SIGN_TOTAL) : prev));
  }, []);

  const bumpSignCount = useCallback(() => {
    setSignCount(prev => Math.min(prev + 1, SIGN_TOTAL));
  }, []);

  const announce = useCallback(
    (message: string) => setLiveMessage(message),
    []
  );

  // 퇴장: 「수고하셨습니다」 수어를 한 번 보여준 뒤 마을로 돌아간다.
  const handleExit = useCallback(() => {
    if (exiting) return;
    if (reducedMotion) {
      onClose();
      return;
    }
    setExiting(true);
    window.setTimeout(onClose, 2600);
  }, [exiting, reducedMotion, onClose]);

  const api = useMemo<SueoRoomApi>(
    () => ({
      rootRef,
      reducedMotion,
      signCount,
      raiseSignCount,
      bumpSignCount,
      lockScroll,
      announce,
      onClose
    }),
    [
      reducedMotion,
      signCount,
      raiseSignCount,
      bumpSignCount,
      lockScroll,
      announce,
      onClose
    ]
  );

  return (
    <SueoProvider value={api}>
      <div
        ref={rootRef}
        className={`sd-root ${sueoSans.variable} ${sueoMono.variable}`}
      >
        <div aria-live="polite" className="sr-only">
          {liveMessage}
        </div>

        {/* ── 고정 헤더 (엔트리 시퀀스 동안은 숨김) ── */}
        <header
          className="fixed inset-x-0 top-0 z-[56] flex h-[54px] items-center justify-between border-b border-[rgba(126,184,255,0.18)] bg-[rgba(6,13,24,0.85)] px-6 backdrop-blur-[10px] transition-opacity duration-500"
          style={{
            opacity: headerVisible ? 1 : 0,
            pointerEvents: headerVisible ? "auto" : "none"
          }}
        >
          <div className="flex-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer font-mono text-[13px] text-[var(--sd-muted)] transition-colors hover:text-white"
            >
              ← 마을로
            </button>
          </div>
          <div className="flex-1 text-center text-[14px] font-black tracking-wide text-[var(--sd-primary)]">
            수어지구
          </div>
          <div className="flex-1 text-right font-mono text-[13px] tabular-nums text-[var(--sd-muted)]">
            손동작 <span className="text-white">{signCount}</span> /{" "}
            {SIGN_TOTAL}
          </div>
        </header>

        <main>
          <EntrySection />
          <GallerySection />
          <MotionDataSection />
          <SentenceSection />
          <Trouble01Section />
          <ReviewLoopSection />
          <Trouble02Section />
          <ArchitectureSection />
          <LimitsSection />
          <ResultSection />
          <RetroSection onExit={handleExit} />
        </main>

        {/* ── 퇴장 시퀀스 ── */}
        {exiting ? (
          <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
            <div className="sd-exit-dim absolute inset-0 bg-[var(--sd-bg)]" />
            <div className="sd-exit-spot absolute h-[300px] w-[300px] bg-[radial-gradient(circle_at_center,rgba(126,184,255,0.15)_0%,transparent_60%)] md:h-[500px] md:w-[500px]" />
            <div className="sd-exit-hand relative z-10 flex flex-col items-center">
              <svg
                className="sd-sign-bye h-[140px] w-[140px]"
                viewBox="0 0 256 256"
                style={{color: "var(--sd-hand)"}}
                aria-hidden="true"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="12"
                >
                  <path d="M104,184a48,48,0,0,1-96,0V112a24,24,0,0,1,48,0v32" />
                  <path d="M56,112V64a24,24,0,0,1,48,0v72" />
                  <path d="M104,104V40a24,24,0,0,1,48,0v72" />
                  <path d="M152,112V64a24,24,0,0,1,48,0v64a48,48,0,0,1-12.77,32.4L152,192" />
                  <path d="M200,128v16a48,48,0,0,1-96,0" />
                </g>
              </svg>
              <span className="mt-6 font-mono text-[12px] text-[var(--sd-accent)]">
                수고하셨습니다
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </SueoProvider>
  );
}
