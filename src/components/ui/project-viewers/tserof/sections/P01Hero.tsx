"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {SLOTS, SLOT_TOTAL, useTserof} from "../context";
import {
  Heading,
  Hint,
  Kicker,
  MetaCell,
  Page,
  Shot,
  fade,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../useTimeline";

// PAGE 01 — 히어로 · 스테이지 셀렉트 보드
//
// 개발 실체: 프로젝트 정체 + 데모 영상 · GitHub 저장소
// 연출 장치: 링크가 버튼이 아니라 **보드 위의 특별 슬롯 2칸**

const STEPS = [0, 150, 550, 950, 1400, 1600, 2600, 2900];
const IDX = {
  kicker: 0,
  head1: 1,
  head2: 2,
  meta: 3,
  board: 4,
  slots: 5,
  special: 6,
  hint: 7
};

const REPO = "https://github.com/KimEoJin24/TSEROF";
const VIDEO = "https://www.youtube.com/watch?v=1Lm-lpVsmq8";

/** 위/아래 두 줄로 나눈 경로 — 7칸 + 6칸. */
const ROW_A = SLOTS.slice(0, 7);
const ROW_B = SLOTS.slice(7);

export function P01Hero() {
  const {reducedMotion, unlocked, current, announce, lockScroll} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [video, setVideo] = useState(false);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (current > 1) setPassed(true);
  }, [current]);

  const openVideo = useCallback(() => {
    setVideo(true);
    lockScroll(true);
    announce("플레이 영상을 엽니다. Esc 로 닫습니다.");
  }, [lockScroll, announce]);

  const closeVideo = useCallback(() => {
    setVideo(prev => {
      if (prev) lockScroll(false);
      return false;
    });
  }, [lockScroll]);

  useEffect(() => {
    if (!video) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      closeVideo();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [video, closeVideo]);

  const slotCell = (s: (typeof SLOTS)[number], i: number) => {
    const isOpen = i <= unlocked;
    const isCur = i === current;
    return (
      <div
        key={s.n}
        className={`flex flex-col items-center gap-1.5 ${
          on[IDX.slots] && !instant ? "ts-pop" : ""
        }`}
        style={{animationDelay: instant ? undefined : `${i * 60}ms`}}
      >
        <div
          className={`flex h-[56px] w-[56px] items-center justify-center rounded-md sm:h-[68px] sm:w-[68px] ${
            isCur && !instant ? "ts-breathe" : ""
          } ${!isOpen && !instant ? "ts-nope" : ""}`}
          style={{
            border: isOpen
              ? "1px solid var(--ts-primary)"
              : "1px solid var(--ts-locked)",
            background: isOpen ? "rgba(52,211,153,0.07)" : "transparent",
            outline: isCur ? "1px solid var(--ts-accent)" : undefined,
            boxShadow: isCur ? "0 0 14px rgba(110,231,183,0.35)" : undefined
          }}
          aria-disabled={!isOpen}
          aria-label={isOpen ? `${s.n} ${s.label}` : `${s.n} 잠김`}
          role="img"
        >
          {isOpen ? (
            <span
              className="font-mono text-[17px] font-black sm:text-[20px]"
              style={{color: "var(--ts-primary)"}}
            >
              {s.n}
            </span>
          ) : (
            <span
              className="text-[14px]"
              style={{color: "rgba(255,255,255,0.22)"}}
              aria-hidden="true"
            >
              🔒
            </span>
          )}
        </div>
        <span
          className="font-mono text-[10px]"
          style={{color: "var(--ts-muted)"}}
        >
          {isOpen ? s.label : "???"}
        </span>
      </div>
    );
  };

  return (
    <Page index={1} innerRef={ref} className="pt-[120px]" maxWidth="900px">
      <Kicker on={on[IDX.kicker]} instant={instant}>
        Unity · 3D 플랫포머 · 팀 프로젝트
      </Kicker>

      <div className="mt-5">
        <Heading
          text="플레이어가 게임을 끄는 건 어려워서가 아니다."
          on={on[IDX.head1]}
          instant={instant}
          className="text-[26px] font-black leading-tight sm:text-[40px]"
        />
        <div className="mt-3">
          <Heading
            text="내 조작이 안 먹혔다고 느낄 때다."
            on={on[IDX.head2]}
            instant={instant}
            className="text-[26px] font-black leading-tight sm:text-[40px]"
            color="var(--ts-accent)"
          />
        </div>
      </div>

      {/* 타이틀 컷 + 메타 */}
      <div
        className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[44%_56%]"
        style={rise(on[IDX.meta], instant)}
      >
        <Shot
          src="/projects/tserof.png"
          alt="TSEROF 타이틀 화면"
          caption="타이틀 화면"
          w={630}
          h={500}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetaCell value="2단" label="점프 · 타이밍 판정" />
          <MetaCell value="다단계" label="스테이지 · 잠금 해제" />
          <MetaCell value="부팀장" label="레벨 · 장애물/기믹 · 기획" />
          <MetaCell value="Unity" label="C# · Steam 출시" />
        </div>
      </div>

      {/* ── 스테이지 셀렉트 보드 ── */}
      <div
        className="mt-8 rounded-md p-5 sm:p-6"
        style={{
          border: "1px solid var(--ts-border)",
          background: "var(--ts-panel)",
          ...rise(on[IDX.board], instant)
        }}
      >
        <div
          className="font-mono text-[11px] tracking-[0.2em]"
          style={{color: "var(--ts-muted)"}}
        >
          ▸ STAGE SELECT
        </div>

        <div className="mt-5 flex flex-col gap-5">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-4 sm:justify-start">
            {ROW_A.map((s, i) => slotCell(s, i))}
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-4 sm:justify-start sm:pl-8">
            {ROW_B.map((s, i) => slotCell(s, i + ROW_A.length))}
          </div>
        </div>

        {/* 특별 슬롯 2칸 — 링크 줄을 대신한다 */}
        <div
          className="mt-6 grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-2"
          style={{
            borderColor: "rgba(52,211,153,0.12)",
            ...fade(on[IDX.special], instant)
          }}
        >
          <button
            type="button"
            onClick={openVideo}
            className="flex items-center gap-4 rounded-md px-4 py-4 text-left transition-transform duration-200 hover:-translate-y-1"
            style={{
              border: "1px solid var(--ts-accent)",
              background: "rgba(110,231,183,0.08)"
            }}
          >
            <span
              className="text-[22px] leading-none"
              style={{color: "var(--ts-accent)"}}
              aria-hidden="true"
            >
              ▶
            </span>
            <span>
              <span
                className="block font-mono text-[11px] font-bold"
                style={{color: "var(--ts-accent)"}}
              >
                플레이 영상
              </span>
              <span className="mt-0.5 block font-mono text-[10px] text-[var(--ts-muted)]">
                [확인필요] 길이
              </span>
            </span>
          </button>

          <a
            href={REPO}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-4 rounded-md px-4 py-4 text-left transition-transform duration-200 hover:-translate-y-1"
            style={{
              border: "1px solid var(--ts-accent)",
              background: "rgba(110,231,183,0.08)"
            }}
          >
            <span
              className="font-mono text-[20px] leading-none"
              style={{color: "rgba(255,255,255,0.80)"}}
              aria-hidden="true"
            >
              &lt; &gt;
            </span>
            <span>
              <span className="block font-mono text-[11px] font-bold text-[var(--ts-text)]">
                GitHub 저장소
              </span>
              <span
                className="mt-0.5 block font-mono text-[10px]"
                style={{color: "var(--ts-warn)"}}
              >
                팀원 소유 · 접근 제한 가능
              </span>
            </span>
          </a>
        </div>

        {!passed ? (
          <div className="mt-5 text-center" style={fade(on[IDX.hint], instant)}>
            <Hint>아래로 내려가면 스테이지가 하나씩 열립니다</Hint>
          </div>
        ) : null}
      </div>

      {/* ── 영상 라이트박스 ── */}
      {video ? (
        <div
          className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center p-4 sm:p-10"
          style={{background: "rgba(2,10,7,0.92)", backdropFilter: "blur(6px)"}}
          onClick={closeVideo}
          role="dialog"
          aria-modal="true"
          aria-label="플레이 영상"
        >
          <div
            className="w-full max-w-[1000px] overflow-hidden rounded-md"
            style={{
              border: "1px solid var(--ts-border)",
              background: "var(--ts-panel)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="ts-grid relative flex aspect-video w-full flex-col items-center justify-center gap-3 bg-[#071f16]">
              <div
                className="flex flex-col items-center gap-1"
                aria-hidden="true"
              >
                <span className="block h-3 w-32 rounded-sm bg-[#0a2a1d]" />
                <span className="block h-3 w-20 rounded-sm bg-[#092518]" />
                <span className="block h-3 w-40 rounded-sm bg-[#0a2a1d]" />
              </div>
              <span className="font-mono text-[12px] text-[rgba(255,255,255,0.35)]">
                게임플레이 영상 자리 · 16:9
              </span>
              <a
                href={VIDEO}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 rounded-md px-4 py-2.5 font-mono text-[12px] font-bold"
                style={{
                  border: "1px solid var(--ts-accent)",
                  background: "rgba(110,231,183,0.1)",
                  color: "var(--ts-accent)"
                }}
              >
                YouTube 에서 보기 ↗
              </a>
            </div>
            <div
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{borderTop: "1px solid rgba(52,211,153,0.12)"}}
            >
              <span className="font-mono text-[12px] text-[var(--ts-muted)]">
                이동 · 2단 점프 · 스테이지 클리어
              </span>
              <button
                type="button"
                onClick={closeVideo}
                className="font-mono text-[12px] text-[var(--ts-accent)] transition-colors hover:text-white"
              >
                닫기 (Esc)
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <span className="sr-only">
        스테이지 보드 {SLOT_TOTAL}칸 중 {unlocked + 1}칸이 열려 있습니다.
      </span>
    </Page>
  );
}
