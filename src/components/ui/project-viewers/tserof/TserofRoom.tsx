"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {sound} from "../sound";
import {
  SLOTS,
  SLOT_TOTAL,
  TserofProvider,
  UNLOCK_KEY,
  type TserofRoomApi
} from "./context";
import {tsMono, tsSans} from "./fonts";
import {P00Boot} from "./sections/P00Boot";
import {P01Hero} from "./sections/P01Hero";
import {P02Jump} from "./sections/P02Jump";
import {P03SaveDecision} from "./sections/P03SaveDecision";
import {P04Icicle} from "./sections/P04Icicle";
import {P05Raycast} from "./sections/P05Raycast";
import {P06StageState} from "./sections/P06StageState";
import {P07Collision} from "./sections/P07Collision";
import {P08Xor} from "./sections/P08Xor";
import {P09UserTest} from "./sections/P09UserTest";
import {P10Structure} from "./sections/P10Structure";
import {P11Result} from "./sections/P11Result";
import {P12Retro} from "./sections/P12Retro";
import "./tserof.css";

interface Props {
  project: ProjectData;
  theme: ProjectTheme;
  onClose: () => void;
}

/**
 * TSEROF 룸 — 「이 페이지가 스테이지 셀렉트 화면이다.
 * 읽어 내려갈수록 다음 스테이지가 잠금 해제된다.」
 *
 * 구조·순서·연출 문법은 portfolio-specs/10-tserof.md 를 따르고,
 * **문제점과 배운 점의 내용은 사용자의 포트폴리오 PDF** 를 따른다.
 * 스펙이 11칸이었던 것을 13칸으로 늘린 이유: PDF 의 실제 트러블이 네 건이고
 * 유저테스트가 독립된 한 장이기 때문이다.
 *
 * 이 방의 절대 규칙(스펙 A-8):
 *  - 제어권 박탈 0회. 본문에서 스크롤을 잠그지 않는다(부팅·라이트박스만 예외)
 *  - 스페이스/방향키는 데모가 포커스·호버일 때만 캡처한다
 *  - 물리 루프는 화면 밖·탭 숨김이면 멈춘다
 */
export function TserofRoom({onClose}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lockCount = useRef(0);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [booted, setBooted] = useState(false);
  const [unlocked, setUnlocked] = useState(0);
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

  // 이어하기 — 지난번에 열어둔 칸을 복원한다(게임의 세이브를 그대로 옮긴 것).
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(UNLOCK_KEY);
      if (saved) {
        const n = Number.parseInt(saved, 10);
        if (Number.isFinite(n))
          setUnlocked(Math.min(Math.max(n, 0), SLOT_TOTAL - 1));
      }
    } catch {
      /* 세션 저장소를 못 쓰는 환경이면 그냥 처음부터 */
    }
  }, []);

  const lockScroll = useCallback((locked: boolean) => {
    lockCount.current = Math.max(0, lockCount.current + (locked ? 1 : -1));
    rootRef.current?.classList.toggle("ts-locked", lockCount.current > 0);
  }, []);

  const reach = useCallback((index: number) => {
    setCurrent(index);
    setUnlocked(prev => {
      if (index <= prev) return prev;
      try {
        window.sessionStorage.setItem(UNLOCK_KEY, String(index));
      } catch {
        /* 무시 */
      }
      return index;
    });
  }, []);

  const announce = useCallback(
    (message: string) => setLiveMessage(message),
    []
  );

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

  // 퇴장 — 세이브 파일이 저장되고 SAVED 가 뜬 뒤 암전.
  const handleExit = useCallback(() => {
    if (exiting) return;
    if (reducedMotion) {
      onClose();
      return;
    }
    setExiting(true);
    window.setTimeout(onClose, 2200);
  }, [exiting, reducedMotion, onClose]);

  const api = useMemo<TserofRoomApi>(
    () => ({
      rootRef,
      reducedMotion,
      unlocked,
      current,
      reach,
      lockScroll,
      announce,
      onClose
    }),
    [reducedMotion, unlocked, current, reach, lockScroll, announce, onClose]
  );

  return (
    <TserofProvider value={api}>
      <div
        ref={rootRef}
        className={`ts-root ${tsSans.variable} ${tsMono.variable}`}
      >
        <div aria-live="polite" className="sr-only">
          {liveMessage}
        </div>

        {/* ── 상시 헤더 (부팅 중에는 숨김) ── */}
        <header
          className="fixed inset-x-0 top-0 z-[56] flex h-[56px] items-center justify-between gap-3 px-4 backdrop-blur-[8px] transition-opacity duration-500 sm:px-6"
          style={{
            background: "rgba(4,18,13,0.78)",
            borderBottom: "1px solid rgba(52,211,153,0.14)",
            opacity: booted ? 1 : 0,
            pointerEvents: booted ? "auto" : "none"
          }}
        >
          <div className="flex-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer font-mono text-[13px] text-[var(--ts-muted)] transition-colors hover:text-white"
            >
              ← 마을로
            </button>
          </div>

          <div
            className="shrink-0 text-[14px] font-black text-[var(--ts-text)]"
            style={{letterSpacing: "0.06em"}}
          >
            TSEROF
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <span className="font-mono text-[13px] tabular-nums text-[var(--ts-primary)]">
              ▮ 잠금 해제 {unlocked + 1} / {SLOT_TOTAL}
            </span>
            {/* 미니 스테이지 보드 — 이 방의 유일한 진행 지표 */}
            <div className="hidden gap-[3px] sm:flex" aria-hidden="true">
              {SLOTS.map((s, i) => {
                const isOpen = i <= unlocked;
                const isCur = i === current;
                return (
                  <span
                    key={s.n}
                    className={`block h-[10px] w-[10px] rounded-sm ${
                      isOpen && !reducedMotion ? "ts-cellpop" : ""
                    }`}
                    style={{
                      background: isCur
                        ? "var(--ts-accent)"
                        : isOpen
                        ? "var(--ts-primary)"
                        : "var(--ts-locked)",
                      outline: isCur ? "1px solid var(--ts-accent)" : undefined,
                      boxShadow: isCur
                        ? "0 0 6px rgba(110,231,183,0.7)"
                        : undefined
                    }}
                  />
                );
              })}
            </div>
            <span className="sr-only">
              {SLOT_TOTAL}칸 중 {unlocked + 1}칸 열림
            </span>
          </div>
        </header>

        <main>
          <P01Hero />
          <P02Jump />
          <P03SaveDecision />
          <P04Icicle />
          <P05Raycast />
          <P06StageState />
          <P07Collision />
          <P08Xor />
          <P09UserTest />
          <P10Structure />
          <P11Result />
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

        {/* ── 퇴장: 세이브 → SAVED → 암전 ── */}
        {exiting ? (
          <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
            <div
              className="ts-fadeblack absolute inset-0 bg-[var(--ts-bg)]"
              style={{opacity: 0}}
            />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <span className="font-mono text-[12px] tracking-[0.25em] text-[var(--ts-muted)]">
                진행 상황 저장 중…
              </span>
              <span
                className="font-mono text-[26px] font-black tracking-[0.3em]"
                style={{color: "var(--ts-primary)"}}
              >
                SAVED
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </TserofProvider>
  );
}
