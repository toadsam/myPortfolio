"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {sound} from "../sound";
import "./ajou.css";
import {
  AjouProvider,
  STAGES,
  STAGE_KEY,
  STAGE_TOTAL,
  type AjouRoomApi
} from "./context";
import {ajMono, ajSans} from "./fonts";
import {P00Attract} from "./sections/P00Attract";
import {P01Hero} from "./sections/P01Hero";
import {P02Loop} from "./sections/P02Loop";
import {P03ViewMode} from "./sections/P03ViewMode";
import {P04ModeTrouble} from "./sections/P04ModeTrouble";
import {P05Skill} from "./sections/P05Skill";
import {P06Buildings} from "./sections/P06Buildings";
import {P07MonsterAi} from "./sections/P07MonsterAi";
import {P08Boss} from "./sections/P08Boss";
import {P09UiWorld} from "./sections/P09UiWorld";
import {P10Events} from "./sections/P10Events";
import {P11Result} from "./sections/P11Result";
import {P12Retro} from "./sections/P12Retro";

interface Props {
  project: ProjectData;
  theme: ProjectTheme;
  onClose: () => void;
}

/**
 * 아주대탐험(Ajou Indie Game) 룸 —
 * 「오락실 캐비닛 앞에 선다. 코인을 넣으면 스테이지가 하나씩 열린다.」
 *
 * 구조·순서·연출 문법은 portfolio-specs/08-ajou-adventure.md 를 따르고,
 * **개발 내용·문제점·배운 점은 사용자의 포트폴리오 PDF(27~34쪽)** 를 따른다.
 *
 * 스펙은 이 프로젝트를 **브라우저 Phaser 플랫포머**로 상정하고 쓰였지만,
 * PDF 의 실체는 **Unity 3D 캠퍼스 액션 어드벤처**다. 그래서 「관람객이 직접
 * 조작한다」는 연출 장치는 그대로 두되, 조작 대상은 PDF 에 있는 실제 시스템
 * (시점 전환 · 랜덤 스킬 · NavMesh AI · 보스 패턴 · 이벤트 시스템)으로 바꿨다.
 * 스펙에만 있던 코요테 타임 · 자동 발판 생성 · 낮밤 · localStorage 점수는 쓰지 않는다.
 *
 * 이 방의 절대 규칙(스펙 A-8):
 *  - CRT 스캔라인은 정적. 초당 3회 이상 밝기 변화 금지
 *  - 시뮬레이션 루프는 뷰포트 밖·탭 숨김이면 정지
 *  - 키 입력은 해당 데모가 포커스·호버일 때만 캡처. 페이지 스크롤을 뺏지 않는다
 *  - 지어낸 지표(다운로드 수·플레이 수) 0개
 */
export function AjouRoom({onClose}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lockCount = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState(0);
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
    sound?.setMood("arcade");
  }, []);

  // 이어하기 — 지난번에 클리어한 스테이지를 복원한다.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STAGE_KEY);
      if (saved) {
        const n = Number.parseInt(saved, 10);
        if (Number.isFinite(n))
          setStage(Math.min(Math.max(n, 0), STAGE_TOTAL - 1));
      }
    } catch {
      /* 세션 저장소를 못 쓰는 환경이면 STAGE 01 부터 */
    }
  }, []);

  // 06장(건물 진입)부터 실내로 들어가 배경이 어두워진다.
  useEffect(() => {
    rootRef.current?.classList.toggle("aj-night", current >= 6);
  }, [current]);

  const lockScroll = useCallback((locked: boolean) => {
    lockCount.current = Math.max(0, lockCount.current + (locked ? 1 : -1));
    rootRef.current?.classList.toggle("aj-locked", lockCount.current > 0);
  }, []);

  const reach = useCallback((index: number) => {
    setCurrent(index);
    setStage(prev => {
      if (index <= prev) return prev;
      try {
        window.sessionStorage.setItem(STAGE_KEY, String(index));
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

  // 어트랙트 모드가 끝나기 전엔 스크롤을 잡아 둔다. 끝나면 즉시 푼다.
  useEffect(() => {
    if (started) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [started, lockScroll]);

  // 퇴장 — GAME OVER → 크레딧 → 캐비닛 전원 종료.
  const handleExit = useCallback(() => {
    if (exiting) return;
    if (reducedMotion) {
      onClose();
      return;
    }
    setExiting(true);
    window.setTimeout(onClose, 2400);
  }, [exiting, reducedMotion, onClose]);

  const api = useMemo<AjouRoomApi>(
    () => ({
      rootRef,
      reducedMotion,
      stage,
      current,
      reach,
      lockScroll,
      announce,
      onClose
    }),
    [reducedMotion, stage, current, reach, lockScroll, announce, onClose]
  );

  return (
    <AjouProvider value={api}>
      <div
        ref={rootRef}
        className={`aj-root ${ajSans.variable} ${ajMono.variable}`}
      >
        <div aria-live="polite" className="sr-only">
          {liveMessage}
        </div>

        {/* ── 캐비닛 상단 마키 (어트랙트 중에는 숨김) ── */}
        <header
          className="fixed inset-x-0 top-0 z-[56] flex h-[54px] items-center justify-between gap-3 px-4 backdrop-blur-[10px] transition-opacity duration-500 sm:px-6"
          style={{
            background: "rgba(20,26,10,0.86)",
            borderBottom: "1px solid rgba(163,230,53,0.18)",
            opacity: started ? 1 : 0,
            pointerEvents: started ? "auto" : "none"
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

          <div
            className="shrink-0 text-[14px] font-black"
            style={{color: "var(--aj-primary)", letterSpacing: "0.04em"}}
          >
            아주대탐험
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <span className="font-mono text-[12px] tabular-nums text-[var(--aj-accent)]">
              STAGE {STAGES[Math.min(stage, STAGE_TOTAL - 1)].n} / {STAGE_TOTAL}
            </span>
            {/* 스테이지 표시등 — 이 방의 유일한 진행 지표 */}
            <div className="hidden gap-[3px] sm:flex" aria-hidden="true">
              {STAGES.map((s, i) => {
                const lit = i <= stage;
                const cur = i === current;
                return (
                  <span
                    key={s.n}
                    className={`block h-[10px] w-[10px] ${
                      lit && !reducedMotion ? "aj-lamp" : ""
                    }`}
                    style={{
                      background: cur
                        ? "var(--aj-accent)"
                        : lit
                        ? "var(--aj-primary)"
                        : "rgba(255,255,255,0.10)",
                      boxShadow: cur
                        ? "0 0 6px rgba(190,242,100,0.75)"
                        : undefined
                    }}
                  />
                );
              })}
            </div>
            <span className="sr-only">
              {STAGE_TOTAL}개 중 {stage + 1}번째 스테이지
            </span>
          </div>
        </header>

        <main>
          <P01Hero />
          <P02Loop />
          <P03ViewMode />
          <P04ModeTrouble />
          <P05Skill />
          <P06Buildings />
          <P07MonsterAi />
          <P08Boss />
          <P09UiWorld />
          <P10Events />
          <P11Result />
          <P12Retro onExit={handleExit} />
        </main>

        {started ? null : (
          <P00Attract
            reducedMotion={reducedMotion}
            onStart={() => {
              setStarted(true);
              reach(0);
            }}
          />
        )}

        {/* ── 퇴장: GAME OVER → 크레딧 → 전원 종료 ── */}
        {exiting ? (
          <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
            <div
              className="aj-fadeblack absolute inset-0 bg-black"
              style={{opacity: 0}}
            />
            <div className="aj-poweroff relative z-10 flex flex-col items-center gap-3">
              <span
                className="font-mono text-[26px] font-black tracking-[0.28em]"
                style={{color: "var(--aj-primary)"}}
              >
                GAME OVER
              </span>
              <span className="font-mono text-[11px] tracking-[0.22em] text-[var(--aj-muted)]">
                기획 · 시스템 · AI · UI — 1인 개발
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </AjouProvider>
  );
}
