"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {sound} from "../sound";
import {DarkLabProvider, type FlashPatch, type SequenceKey} from "./context";
import "./darklab.css";
import {darkLabMono, darkLabSans} from "./fonts";
import {IconVolume} from "./parts";
import {ArchitectureSection} from "./sections/ArchitectureSection";
import {CinemachineSection} from "./sections/CinemachineSection";
import {EntrySection} from "./sections/EntrySection";
import {HeroSection} from "./sections/HeroSection";
import {HonestCostSection} from "./sections/HonestCostSection";
import {PrinciplesSection} from "./sections/PrinciplesSection";
import {RaycastSection} from "./sections/RaycastSection";
import {ResultSection} from "./sections/ResultSection";
import {RetroSection} from "./sections/RetroSection";
import {TakeoverSection} from "./sections/TakeoverSection";
import {Trouble01Section} from "./sections/Trouble01Section";
import {Trouble02Section} from "./sections/Trouble02Section";

const SECTION_COUNT = 12;
const BASE_RADIUS = 220;

// 섹션 진입 시 순차 등장시킬 요소들.
const REVEAL_SELECTOR = ".dl-fade-up, .dl-word, .dl-kpt, .dl-echo-line";

interface Props {
  project: ProjectData;
  theme: ProjectTheme;
  onClose: () => void;
}

// DarkLab 룸 — 손전등으로 읽는 12페이지 스크롤 전시실.
// 다른 프로젝트 뷰어와 달리 단계 탭이 아니라 하나의 긴 스크롤로 구성된다.
export function DarkLabRoom({onClose}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  // 마우스 좌표는 state로 들고 있으면 매 프레임 리렌더가 나므로 ref + rAF로만 쓴다.
  const pointer = useRef({x: 0, y: 0, radius: 0, target: 0, follow: true, ignited: false});
  const lockCount = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [sequencesDone, setSequencesDone] = useState<Record<SequenceKey, boolean>>({
    takeover: false,
    scroll: false,
  });

  // 이미 본 연출은 다시 틀지 않는다(세션당 1회).
  useEffect(() => {
    setSequencesDone({
      takeover: sessionStorage.getItem("darklab-seq-takeover") === "1",
      scroll: sessionStorage.getItem("darklab-seq-scroll") === "1",
    });
  }, []);

  const markSequenceDone = useCallback((key: SequenceKey) => {
    sessionStorage.setItem(`darklab-seq-${key}`, "1");
    setSequencesDone((prev) => (prev[key] ? prev : {...prev, [key]: true}));
  }, []);

  // ── 동작 줄이기: 손전등 연출을 통째로 건너뛰고 밝은 상태로 시작한다 ──
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) setLightsOn(true);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (sound) {
      sound.setMood("horror");
      setSoundOn(sound.enabled);
    }
  }, []);

  // ── 손전등 렌더 루프 ──────────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;

    pointer.current.x = window.innerWidth / 2;
    pointer.current.y = window.innerHeight / 2;

    let raf = 0;
    const start = performance.now();

    function tick(now: number) {
      const p = pointer.current;
      // 흔들리는 손 — 반경에 미세한 호흡을 준다.
      const wobble = Math.sin((now - start) / 1200) * 6;
      p.radius += (p.target - p.radius) * 0.18;
      const r = Math.max(0, p.radius + (p.radius > 40 ? wobble : 0));
      root!.style.setProperty("--dl-mx", `${p.x}px`);
      root!.style.setProperty("--dl-my", `${p.y}px`);
      root!.style.setProperty("--dl-r", `${r}px`);
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // ── 커서 추적 + 최초 점화 ────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;

    function ignite() {
      if (pointer.current.ignited) return;
      pointer.current.ignited = true;
      pointer.current.target = BASE_RADIUS;
      sound?.sfx("click");
    }

    function onMove(e: MouseEvent) {
      if (!pointer.current.follow) return;
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      ignite();
    }

    function onTouch(e: TouchEvent) {
      const t = e.touches[0];
      if (!t || !pointer.current.follow) return;
      pointer.current.x = t.clientX;
      pointer.current.y = t.clientY;
      pointer.current.target = 320;
      pointer.current.ignited = true;
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, {passive: true});
    // 마우스가 끝내 움직이지 않아도 3초 뒤에는 켜준다.
    const fallback = window.setTimeout(ignite, 3000);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.clearTimeout(fallback);
    };
  }, [reducedMotion]);

  // ── 스크롤 진행도 → 어둠 농도 · 조명 표시 ────────────────────────────────
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    function onScroll() {
      const el = rootRef.current;
      if (!el) return;
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      if (readoutRef.current) {
        readoutRef.current.textContent = lightsOn ? "● 조명 100%" : `○ 조명 ${Math.round(pct * 100)}%`;
      }
      if (!lightsOn && !reducedMotion && flashRef.current) {
        flashRef.current.style.opacity = String(Math.max(0.1, 0.85 - pct * 0.75));
      }
    }

    onScroll();
    root.addEventListener("scroll", onScroll, {passive: true});
    return () => root.removeEventListener("scroll", onScroll);
  }, [lightsOn, reducedMotion]);

  // ── 섹션 감시: 도트 내비 + 순차 등장 ─────────────────────────────────────
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-dl-section]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sections.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActiveSection(index);

          entry.target.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el, i) => {
            const step = el.classList.contains("dl-word") ? 45 : 100;
            window.setTimeout(() => el.classList.add("dl-in"), i * step);
          });
        }
      },
      {root, threshold: 0.2},
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // ── 스크롤 잠금 (연출용) ─────────────────────────────────────────────────
  const lockScroll = useCallback((locked: boolean) => {
    lockCount.current = Math.max(0, lockCount.current + (locked ? 1 : -1));
    rootRef.current?.classList.toggle("dl-locked", lockCount.current > 0);
  }, []);

  const setFlash = useCallback((patch: FlashPatch) => {
    const p = pointer.current;
    if (patch.radius !== undefined) {
      p.target = patch.radius;
      p.ignited = true;
    }
    if (patch.follow !== undefined) p.follow = patch.follow;
    if (patch.x !== undefined) p.x = patch.x;
    if (patch.y !== undefined) p.y = patch.y;
  }, []);

  // ── Esc: 연출 중이 아닐 때만 방을 닫는다 ─────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && lockCount.current === 0) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggleLights() {
    setLightsOn((on) => {
      const next = !on;
      if (flashRef.current) flashRef.current.style.opacity = next ? "0" : "0.85";
      if (readoutRef.current) readoutRef.current.textContent = next ? "● 조명 100%" : "○ 조명 0%";
      return next;
    });
  }

  function toggleSound() {
    if (!sound) return;
    const next = !sound.enabled;
    sound.setEnabled(next);
    setSoundOn(next);
  }

  // ── 퇴장: 손전등이 한 번 크게 번졌다가 꺼지며 마을로 ─────────────────────
  function handleExit() {
    if (exiting) return;
    setExiting(true);
    sound?.sfx("open");
    const beam = beamRef.current;
    if (beam) {
      beam.style.setProperty("--dl-beam", "300px");
      window.setTimeout(() => beam.style.setProperty("--dl-beam", "0px"), 120);
    }
    window.setTimeout(onClose, reducedMotion ? 0 : 700);
  }

  function goToSection(index: number) {
    rootRef.current
      ?.querySelectorAll<HTMLElement>("[data-dl-section]")
      [index]?.scrollIntoView({behavior: reducedMotion ? "auto" : "smooth", block: "start"});
  }

  const api = useMemo(
    () => ({
      rootRef,
      reducedMotion,
      lightsOn,
      setLightsOn,
      lockScroll,
      setFlash,
      sequencesDone,
      markSequenceDone,
      onClose,
    }),
    [reducedMotion, lightsOn, lockScroll, setFlash, sequencesDone, markSequenceDone, onClose],
  );

  const headerVisible = activeSection > 0;

  return (
    <DarkLabProvider value={api}>
      <div
        ref={rootRef}
        className={`dl-root ${darkLabSans.variable} ${darkLabMono.variable} ${lightsOn ? "dl-lit" : ""}`}
        style={{opacity: exiting ? 0 : 1, transition: "opacity 0.5s cubic-bezier(0.4,0,0.2,1)"}}
      >
        <div className="dl-noise" aria-hidden="true" />
        <div className="dl-torch" aria-hidden="true" />
        <div
          ref={flashRef}
          className="dl-flashlight"
          aria-hidden="true"
          style={{opacity: reducedMotion || lightsOn ? 0 : 0.85}}
        />

        {/* ── 도트 내비 ── */}
        <nav
          className={`fixed right-6 top-1/2 z-[55] hidden -translate-y-1/2 flex-col gap-4 mix-blend-difference ${
            headerVisible ? "md:flex" : ""
          }`}
          aria-label="섹션 이동"
        >
          {Array.from({length: SECTION_COUNT}, (_, i) => (
            <button
              key={i}
              type="button"
              className={`dl-dot ${i === activeSection ? "dl-active" : ""}`}
              onClick={() => goToSection(i)}
              aria-label={`${i + 1}번째 구간으로 이동`}
            />
          ))}
        </nav>

        {/* ── 고정 헤더 ── */}
        <header className="fixed inset-x-0 top-0 z-[56] flex h-[56px] items-center justify-between px-4 transition-all duration-500 md:px-6">
          <div
            className="flex-1 transition-opacity duration-500"
            style={{opacity: headerVisible ? 1 : 0, pointerEvents: headerVisible ? "auto" : "none"}}
          >
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer font-mono text-[13px] text-[rgba(255,255,255,0.42)] outline-none transition-colors hover:text-[rgba(255,255,255,0.82)]"
            >
              ← 마을로
            </button>
          </div>
          <div
            className="select-none text-[14px] font-black tracking-wide text-[rgba(255,255,255,0.82)] transition-opacity duration-500"
            style={{opacity: headerVisible ? 1 : 0}}
          >
            DarkLab
          </div>
          <div className="flex flex-1 items-center justify-end gap-3 font-mono text-[13px] text-[rgba(255,255,255,0.42)] md:gap-4">
            <span
              ref={readoutRef}
              className="hidden transition-opacity duration-500 sm:inline-block"
              style={{opacity: headerVisible ? 1 : 0}}
            >
              ○ 조명 0%
            </span>
            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? "사운드 끄기" : "사운드 켜기"}
              className="cursor-pointer outline-none transition-all duration-500 hover:text-[rgba(255,255,255,0.82)]"
              style={{
                opacity: headerVisible ? 1 : 0,
                pointerEvents: headerVisible ? "auto" : "none",
                color: soundOn ? "#ff5a4d" : undefined,
              }}
            >
              <IconVolume muted={!soundOn} />
            </button>
            {/* 조명 스위치는 항상 보인다 — 어두워서 못 읽는 사람의 탈출구 */}
            <button
              type="button"
              onClick={toggleLights}
              className="cursor-pointer rounded-md border border-white/10 bg-transparent px-3 py-1.5 outline-none transition-colors hover:text-[rgba(255,255,255,0.82)]"
              title="어두워서 읽기 힘들면 눌러주세요"
            >
              {lightsOn ? "[ 조명 끄기 ]" : "[ 조명 켜기 ]"}
            </button>
          </div>
        </header>

        {/* ── 본문 ── */}
        <main>
          <EntrySection />
          <HeroSection />
          <RaycastSection />
          <PrinciplesSection />
          <TakeoverSection />
          <CinemachineSection />
          <HonestCostSection />
          <Trouble01Section />
          <Trouble02Section />
          <ArchitectureSection />
          <ResultSection />
          <RetroSection onExit={handleExit} />
        </main>

        <div ref={beamRef} className="dl-exit-beam" aria-hidden="true" style={{display: exiting ? "block" : "none"}} />
      </div>
    </DarkLabProvider>
  );
}
