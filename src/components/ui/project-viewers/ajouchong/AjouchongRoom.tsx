"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {sound} from "../sound";
import "./ajouchong.css";
import {AjouProvider, NOTICE_TOTAL, type AjouRoomApi} from "./context";
import {ajMono, ajSans} from "./fonts";
import {ArchitectureSection} from "./sections/ArchitectureSection";
import {AuthSection} from "./sections/AuthSection";
import {DecisionSection} from "./sections/DecisionSection";
import {DockerSection} from "./sections/DockerSection";
import {EntrySection} from "./sections/EntrySection";
import {RefreshSection} from "./sections/RefreshSection";
import {ResultSection} from "./sections/ResultSection";
import {RetroSection} from "./sections/RetroSection";
import {RouteSection} from "./sections/RouteSection";
import {ScatterSection} from "./sections/ScatterSection";

interface Props {
  project: ProjectData;
  theme: ProjectTheme;
  onClose: () => void;
}

/**
 * 아주총 룸 — 게시판에서 시작해 배포로 끝나는 스크롤 전시실.
 *
 * 카테고리 뷰어(platform)를 쓰지 않는 이유: 이 프로젝트의 핵심은 화면이 아니라
 * **「새로고침하면 404가 떴다」와 「로컬은 되는데 서버에선 달랐다」** 두 사건이고,
 * 그건 스크린샷으로는 전달되지 않는다. 방문자가 직접 새로고침을 눌러 404를 만나고
 * nginx.conf 한 줄로 고치는 편이 훨씬 빠르다.
 *
 * 헤더의 「공지 n/6 · 배포 ✕/✓」는 방의 진행도이자 서사 요약이다.
 */
export function AjouchongRoom({onClose}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lockCount = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [noticeCount, setNoticeCount] = useState(0);
  const [deployFixed, setDeployFixed] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    sound?.setMood("calm");
  }, []);

  // 엔트리(첫 섹션)를 지나야 헤더가 나온다 — 엔트리 화면은 자체 카피를 그린다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const first = root.querySelector<HTMLElement>("[data-aj-section]");
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

  // Esc: 오버레이가 잠금을 걸고 있지 않을 때만 방을 닫는다.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && lockCount.current === 0) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const lockScroll = useCallback((locked: boolean) => {
    lockCount.current = Math.max(0, lockCount.current + (locked ? 1 : -1));
    rootRef.current?.classList.toggle("aj-locked", lockCount.current > 0);
  }, []);

  // 뒤로 스크롤해도 줄지 않게 — 올라가기만 한다.
  const raiseNoticeCount = useCallback((next: number) => {
    setNoticeCount(prev => (next > prev ? Math.min(next, NOTICE_TOTAL) : prev));
  }, []);

  const announce = useCallback(
    (message: string) => setLiveMessage(message),
    []
  );

  const api = useMemo<AjouRoomApi>(
    () => ({
      rootRef,
      reducedMotion,
      noticeCount,
      raiseNoticeCount,
      deployFixed,
      setDeployFixed,
      lockScroll,
      announce,
      onClose
    }),
    [
      reducedMotion,
      noticeCount,
      raiseNoticeCount,
      deployFixed,
      lockScroll,
      announce,
      onClose
    ]
  );

  return (
    <AjouProvider value={api}>
      <div
        ref={rootRef}
        className={`aj-root ${ajSans.variable} ${ajMono.variable} ${
          deployFixed ? "aj-lit" : ""
        }`}
      >
        <div aria-live="polite" className="sr-only">
          {liveMessage}
        </div>

        {/* ── 고정 헤더 (엔트리 시퀀스 동안은 숨김) ── */}
        <header
          className="fixed inset-x-0 top-0 z-[56] flex h-[54px] items-center justify-between gap-3 border-b border-[var(--aj-frame)] bg-[rgba(22,7,9,0.88)] px-4 backdrop-blur-[10px] transition-opacity duration-500 sm:px-6"
          style={{
            opacity: headerVisible ? 1 : 0,
            pointerEvents: headerVisible ? "auto" : "none"
          }}
        >
          <div className="flex-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer font-mono text-[13px] text-[var(--aj-muted)] transition-colors hover:text-white"
            >
              ← 마을로
            </button>
          </div>
          <div className="shrink-0 text-[13px] font-black tracking-wide text-[var(--aj-primary)] sm:text-[14px]">
            아주대 총학생회
          </div>
          <div className="flex flex-1 justify-end gap-3 font-mono text-[12px] tabular-nums text-[var(--aj-muted)] sm:text-[13px]">
            <span className="hidden sm:inline">
              공지 <span className="text-white">{noticeCount}</span> /{" "}
              {NOTICE_TOTAL}
            </span>
            <span>
              배포{" "}
              <span
                style={{color: deployFixed ? "var(--aj-ok)" : "var(--aj-bad)"}}
              >
                {deployFixed ? "✓" : "✕"}
              </span>
            </span>
          </div>
        </header>

        <main>
          <EntrySection />
          <ScatterSection />
          <RouteSection />
          <RefreshSection />
          <DockerSection />
          <AuthSection />
          <ArchitectureSection />
          <DecisionSection />
          <ResultSection />
          <RetroSection onExit={onClose} />
        </main>
      </div>
    </AjouProvider>
  );
}
