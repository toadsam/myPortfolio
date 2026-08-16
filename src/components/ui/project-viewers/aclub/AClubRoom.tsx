"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {sound} from "../sound";
import "./aclub.css";
import {AClubProvider} from "./context";
import {aClubMono, aClubSans} from "./fonts";
import {ComponentSection} from "./sections/ComponentSection";
import {FilterSection} from "./sections/FilterSection";
import {HeroSection} from "./sections/HeroSection";
import {IntroOverlay} from "./sections/IntroOverlay";
import {ResultSection} from "./sections/ResultSection";
import {RetroSection} from "./sections/RetroSection";
import {RoleSection} from "./sections/RoleSection";
import {ScopeSection} from "./sections/ScopeSection";
import {ScrollRestoreSection} from "./sections/ScrollRestoreSection";
import {UrlStateSection} from "./sections/UrlStateSection";
import {UserFlowSection} from "./sections/UserFlowSection";

interface Props {
  project: ProjectData;
  theme: ProjectTheme;
  onClose: () => void;
}

// ACLUB 룸 — 포스터 벽으로 읽는 10장 스크롤 전시실.
// 카테고리별 뷰어(platform) 대신 프로젝트 전용 연출을 쓴다.
export function AClubRoom({onClose}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const lockCount = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [lit, setLit] = useState(false);

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

  // 인트로 동안에는 룸 스크롤을 봉인한다.
  useEffect(() => {
    rootRef.current?.classList.toggle(
      "ac-locked",
      !introDone && lockCount.current === 0
    );
  }, [introDone]);

  const lockScroll = useCallback((locked: boolean) => {
    lockCount.current = Math.max(0, lockCount.current + (locked ? 1 : -1));
    rootRef.current?.classList.toggle("ac-locked", lockCount.current > 0);
  }, []);

  const setReadout = useCallback((text: string) => {
    if (readoutRef.current) readoutRef.current.textContent = text;
  }, []);

  const announce = useCallback((text: string) => {
    if (liveRef.current) liveRef.current.textContent = text;
  }, []);

  // Esc: 다른 오버레이가 잠금을 걸고 있지 않을 때만 방을 닫는다.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && introDone && lockCount.current === 0) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introDone, onClose]);

  const dismissIntro = useCallback(() => {
    setIntroDone(true);
    sound?.sfx("open");
  }, []);

  const api = useMemo(
    () => ({
      rootRef,
      reducedMotion,
      lockScroll,
      setReadout,
      announce,
      setLit,
      onClose
    }),
    [reducedMotion, lockScroll, setReadout, announce, onClose]
  );

  return (
    <AClubProvider value={api}>
      <div
        ref={rootRef}
        className={`ac-root ${aClubSans.variable} ${aClubMono.variable} ${
          lit ? "ac-lit" : ""
        } ${introDone ? "" : "ac-locked"}`}
      >
        <div ref={liveRef} aria-live="polite" className="sr-only" />

        {/* ── 고정 헤더 ── */}
        <header
          className="fixed inset-x-0 top-0 z-[90] flex h-[54px] items-center justify-between border-b border-[rgba(192,132,252,0.18)] bg-[rgba(13,8,22,0.85)] px-6 backdrop-blur-[10px] transition-opacity duration-500"
          style={{
            opacity: introDone ? 1 : 0,
            pointerEvents: introDone ? "auto" : "none"
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[13px] tracking-wide text-[rgba(255,255,255,0.46)] outline-none transition-colors hover:text-white"
          >
            ← 마을로
          </button>
          <div className="select-none text-[14px] font-black tracking-widest text-[#c084fc]">
            ACLUB
          </div>
          <span
            ref={readoutRef}
            className="font-mono text-[13px] tracking-wide tabular-nums text-[rgba(255,255,255,0.46)]"
          >
            포스터 24 / 24 · 필터 0
          </span>
        </header>

        <main className="relative w-full">
          <HeroSection start={introDone} />
          <FilterSection />
          <UrlStateSection />
          <UserFlowSection />
          <ScrollRestoreSection />
          <RoleSection />
          <ComponentSection />
          <ScopeSection />
          <ResultSection />
          <RetroSection onExit={onClose} />
        </main>

        {introDone ? null : (
          <IntroOverlay
            onDismiss={dismissIntro}
            reducedMotion={reducedMotion}
          />
        )}
      </div>
    </AClubProvider>
  );
}
