"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {sound} from "../sound";
import {
  LEVELS,
  LEVEL_KEY,
  LEVEL_TOTAL,
  MuscleUpProvider,
  type MuscleUpRoomApi
} from "./context";
import {muMono, muSans} from "./fonts";
import "./muscleup.css";
import {P00Sheet} from "./sections/P00Sheet";
import {P01Hero} from "./sections/P01Hero";
import {P02Loop} from "./sections/P02Loop";
import {P03Refresh} from "./sections/P03Refresh";
import {P04Auth} from "./sections/P04Auth";
import {P05Community} from "./sections/P05Community";
import {P06Cors} from "./sections/P06Cors";
import {P07AiCoach} from "./sections/P07AiCoach";
import {P08Schema} from "./sections/P08Schema";
import {P09Infra} from "./sections/P09Infra";
import {P10OpsIssues} from "./sections/P10OpsIssues";
import {P11Result} from "./sections/P11Result";
import {P12Retro} from "./sections/P12Retro";

interface Props {
  project: ProjectData;
  theme: ProjectTheme;
  onClose: () => void;
}

/**
 * 득근득근(MuscleUp) 룸 — 「RPG 캐릭터 시트 앞에 앉는다.
 * 스크롤을 내리면 내가 레벨업한다.」
 *
 * 구조·순서·연출 문법은 portfolio-specs/04-muscleup.md 를 따르고,
 * **개발 내용·문제점·배운 점은 사용자의 포트폴리오 PDF(6~13쪽)** 를 따른다.
 * 스펙이 11칸이었던 것을 13칸으로 늘린 이유는 context.ts 참고.
 *
 * 이 방의 절대 규칙(스펙 A-8):
 *  - 신체 이미지·체형 비교·다이어트 조장 카피 0개. 시트와 수치만 쓴다
 *  - 레벨업 연출은 **세션당 1회**, 전체 화면 플래시 금지
 *  - 본문에서 스크롤을 잠그지 않는다(생성 시퀀스·라이트박스만 예외)
 *  - 실시간 루프는 뷰포트 밖이면 정지
 *  - 지어낸 지표(가입자 수·DAU·기록 수) 0개
 */
export function MuscleUpRoom({onClose}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gaugeRef = useRef<HTMLDivElement>(null);
  const expRef = useRef(0);
  const lockCount = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [created, setCreated] = useState(false);
  const [level, setLevel] = useState(0);
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

  useEffect(() => {
    sound?.setMood("energy");
  }, []);

  // 이어하기 — 지난번에 올려둔 레벨을 복원한다.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(LEVEL_KEY);
      if (saved) {
        const n = Number.parseInt(saved, 10);
        if (Number.isFinite(n))
          setLevel(Math.min(Math.max(n, 0), LEVEL_TOTAL - 1));
      }
    } catch {
      /* 세션 저장소를 못 쓰는 환경이면 그냥 Lv.1 부터 */
    }
  }, []);

  /**
   * EXP 게이지 — 스크롤 진행도를 **React state 를 거치지 않고** CSS 변수로 흘린다.
   * 스펙 PAGE 01: "Bind scroll progress to a CSS custom property inside a
   * requestAnimationFrame-throttled listener - do NOT store scroll position in
   * React state."
   */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;

    const measure = () => {
      raf = 0;
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0;
      expRef.current = pct;
      el.style.setProperty("--mu-exp", pct.toFixed(2) + "%");
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };

    measure();
    el.addEventListener("scroll", onScroll, {passive: true});
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [created]);

  // 레벨이 바뀔 때 게이지에 작은 펄스 한 번. 전체 화면 효과는 절대 쓰지 않는다.
  useEffect(() => {
    const el = gaugeRef.current;
    if (!el || reducedMotion || level === 0) return;
    el.classList.remove("mu-gaugepulse");
    // 리플로우를 한 번 강제해야 같은 클래스가 다시 재생된다.
    void el.offsetWidth;
    el.classList.add("mu-gaugepulse");
  }, [level, reducedMotion]);

  const lockScroll = useCallback((locked: boolean) => {
    lockCount.current = Math.max(0, lockCount.current + (locked ? 1 : -1));
    rootRef.current?.classList.toggle("mu-locked", lockCount.current > 0);
  }, []);

  const reach = useCallback((index: number) => {
    setCurrent(index);
    setLevel(prev => {
      if (index <= prev) return prev;
      try {
        window.sessionStorage.setItem(LEVEL_KEY, String(index));
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

  // 캐릭터 생성이 끝나기 전엔 스크롤을 잡아 둔다. 끝나면 즉시 푼다.
  useEffect(() => {
    if (created) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [created, lockScroll]);

  // 퇴장 — 최종 스탯 정산 뒤 시트가 접히고 암전.
  const handleExit = useCallback(() => {
    if (exiting) return;
    if (reducedMotion) {
      onClose();
      return;
    }
    setExiting(true);
    window.setTimeout(onClose, 2200);
  }, [exiting, reducedMotion, onClose]);

  const api = useMemo<MuscleUpRoomApi>(
    () => ({
      rootRef,
      reducedMotion,
      level,
      current,
      expRef,
      reach,
      lockScroll,
      announce,
      onClose
    }),
    [reducedMotion, level, current, reach, lockScroll, announce, onClose]
  );

  return (
    <MuscleUpProvider value={api}>
      <div
        ref={rootRef}
        className={`mu-root mu-glow ${muSans.variable} ${muMono.variable}`}
      >
        <div aria-live="polite" className="sr-only">
          {liveMessage}
        </div>

        {/* ── 상시 헤더 (생성 시퀀스 중에는 숨김) ── */}
        <header
          className="fixed inset-x-0 top-0 z-[56] flex h-[54px] items-center justify-between gap-3 px-4 backdrop-blur-[10px] transition-opacity duration-500 sm:px-6"
          style={{
            background: "rgba(20,5,16,0.85)",
            borderBottom: "1px solid rgba(244,114,182,0.18)",
            opacity: created ? 1 : 0,
            pointerEvents: created ? "auto" : "none"
          }}
        >
          <div className="flex-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer font-mono text-[13px] text-[var(--mu-muted)] transition-colors hover:text-white"
            >
              ← 마을로
            </button>
          </div>

          <div className="shrink-0 text-[14px] font-black text-[var(--mu-primary)]">
            득근득근
          </div>

          {/* EXP 게이지 — 진행 지표이자 이 방의 컨셉 그 자체 */}
          <div className="flex flex-1 items-center justify-end gap-2.5">
            <div
              ref={gaugeRef}
              className="hidden h-[6px] w-[96px] overflow-hidden rounded-full sm:block"
              style={{background: "rgba(255,255,255,0.08)"}}
              role="progressbar"
              aria-valuenow={level + 1}
              aria-valuemin={1}
              aria-valuemax={LEVEL_TOTAL}
              aria-label="페이지 진행도"
            >
              <span
                className="mu-expfill block h-full rounded-full"
                style={{background: "var(--mu-primary)"}}
              />
            </div>
            <span className="font-mono text-[12px] tabular-nums text-[var(--mu-accent)]">
              Lv.{level + 1}
              <span className="ml-1 hidden text-[var(--mu-muted)] sm:inline">
                {LEVELS[Math.min(level, LEVEL_TOTAL - 1)].label}
              </span>
            </span>
          </div>
        </header>

        <main>
          <P01Hero />
          <P02Loop />
          <P03Refresh />
          <P04Auth />
          <P05Community />
          <P06Cors />
          <P07AiCoach />
          <P08Schema />
          <P09Infra />
          <P10OpsIssues />
          <P11Result />
          <P12Retro onExit={handleExit} />
        </main>

        {created ? null : (
          <P00Sheet
            reducedMotion={reducedMotion}
            onDone={() => {
              setCreated(true);
              reach(0);
            }}
          />
        )}

        {/* ── 퇴장: 정산 → 시트 접기 → 암전 ── */}
        {exiting ? (
          <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
            <div
              className="mu-fadeblack absolute inset-0 bg-[var(--mu-bg)]"
              style={{opacity: 0}}
            />
            <div className="mu-fold relative z-10 flex flex-col items-center gap-3">
              <span className="font-mono text-[12px] tracking-[0.25em] text-[var(--mu-muted)]">
                최종 스탯 정산
              </span>
              <span
                className="font-mono text-[26px] font-black tracking-[0.2em]"
                style={{color: "var(--mu-primary)"}}
              >
                Lv.{LEVEL_TOTAL}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </MuscleUpProvider>
  );
}
