"use client";

import {useEffect, useRef, useState} from "react";
import {StatRow} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 00 — 캐릭터 생성 (진입 시퀀스)
//
// 개발 실체: 왜 이걸 만들었는가 (동기)
// 연출 장치: RPG 캐릭터 시트가 한 칸씩 채워지며 생성됨
//
// 동기 문장은 **PDF 7쪽의 Problem 1 / Problem 2 원문**을 그대로 쓴다.
// 스펙이 예시로 적어둔 "헬스장 3개월 끊어놓고…" 문장은 PDF 에 근거가 없어 쓰지 않는다.

const STEPS = [0, 500, 750, 1000, 1600, 2500, 3600, 4000];
const IDX = {
  outline: 0,
  header: 1,
  rule: 2,
  name: 3,
  stats: 4,
  motive: 5,
  exp: 6,
  hint: 7
};

const NAME = "득근득근";
const SUBTITLE = "MuscleUp · AI 피트니스 커뮤니티 실서비스";

// PDF 6쪽 「역할 · 기술 스택」에서 센 값. 지어낸 수치는 없다.
const STATS = [
  {label: "기술 스택", value: "5", pct: 100},
  {label: "핵심 기능", value: "4", pct: 100},
  {label: "담당 범위", value: "풀스택", pct: 100},
  {label: "개발 인원", value: "1인", pct: 100}
];

// PDF 7쪽 Problem — 이 페이지가 실어 나를 개발 실체.
const MOTIVE = [
  "운동 루틴·식단·기록이 흩어져",
  "「오늘 뭐 하지?」에서 멈춘다.",
  "그리고 혼자 하면 지속률이 낮다."
];

export function P00Sheet({
  reducedMotion,
  onDone
}: {
  reducedMotion: boolean;
  onDone: () => void;
}) {
  const on = useTimeline(STEPS, true, reducedMotion);
  const instant = reducedMotion;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const [typed, setTyped] = useState(instant ? NAME.length : 0);

  // 이름은 ~50자/초로 타이핑된다(스펙 t=1.00s).
  useEffect(() => {
    if (instant || !on[IDX.name]) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= NAME.length) window.clearInterval(id);
    }, 90);
    return () => window.clearInterval(id);
  }, [on, instant]);

  // 탈출구 — 아무 클릭·스크롤·키·Esc 로 즉시 끝 상태로 간다(스펙 필수).
  useEffect(() => {
    const skip = () => doneRef.current();
    if (instant) {
      skip();
      return;
    }
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, {passive: true});
    window.addEventListener("touchstart", skip, {passive: true});
    const auto = window.setTimeout(skip, 6200);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.clearTimeout(auto);
    };
  }, [instant]);

  return (
    <div
      className="mu-glow fixed inset-0 z-[90] flex items-center justify-center px-5"
      style={{background: "var(--mu-bg)"}}
      onClick={() => doneRef.current()}
      role="presentation"
    >
      <div
        className="w-full rounded-lg p-[22px] sm:p-[34px]"
        style={{
          maxWidth: "560px",
          background: "var(--mu-panel)",
          border: "1px solid rgba(244,114,182,0.24)",
          opacity: on[IDX.outline] ? 1 : 0,
          transition: instant ? "none" : "opacity 0.5s var(--mu-ease)"
        }}
      >
        <div
          className="font-mono text-[11px] tracking-[0.22em] text-[var(--mu-muted)]"
          style={{
            opacity: on[IDX.header] ? 1 : 0,
            transition: instant ? "none" : "opacity 0.3s var(--mu-ease)"
          }}
        >
          CHARACTER SHEET
        </div>

        <div
          className="mt-3 h-px origin-left"
          style={{
            background: "var(--mu-primary)",
            transform: on[IDX.rule] ? "scaleX(1)" : "scaleX(0)",
            transition: instant ? "none" : "transform 0.4s var(--mu-ease)"
          }}
        />

        {/* NAME */}
        <div
          className="mt-6"
          style={{
            opacity: on[IDX.name] ? 1 : 0,
            transition: instant ? "none" : "opacity 0.3s var(--mu-ease)"
          }}
        >
          <div className="font-mono text-[10px] text-[var(--mu-muted)]">
            NAME
          </div>
          <div
            className="mt-1 text-[30px] font-black sm:text-[38px]"
            style={{color: "var(--mu-primary)"}}
          >
            {NAME.slice(0, typed)}
            {typed < NAME.length ? (
              <span className="mu-caret" aria-hidden="true">
                _
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 font-mono text-[12px] text-[var(--mu-muted)] sm:text-[13px]">
            {SUBTITLE}
          </div>
        </div>

        {/* STAT ROWS */}
        <div className="mt-6 flex flex-col gap-2.5">
          {STATS.map((s, i) => (
            <StatRow
              key={s.label}
              label={s.label}
              value={s.value}
              pct={s.pct}
              on={on[IDX.stats]}
              delay={i * 140}
              instant={instant}
            />
          ))}
        </div>

        {/* 동기 — 이 페이지의 실체 */}
        <div
          className="mt-7 pt-6"
          style={{borderTop: "1px solid rgba(244,114,182,0.14)"}}
        >
          <p
            className="text-[15px] leading-8 sm:text-[17px] sm:leading-9"
            style={{maxWidth: "470px", color: "var(--mu-text)"}}
          >
            {MOTIVE.map((line, li) => (
              <span key={line} className="block">
                {line.split(" ").map((w, wi) => (
                  <span
                    key={`${li}-${wi}`}
                    className="inline-block"
                    style={{
                      opacity: on[IDX.motive] ? 1 : 0,
                      transform: on[IDX.motive]
                        ? "translateY(0)"
                        : "translateY(6px)",
                      transition: instant
                        ? "none"
                        : `opacity 0.3s var(--mu-ease) ${
                            (li * 6 + wi) * 35
                          }ms, transform 0.3s var(--mu-ease) ${
                            (li * 6 + wi) * 35
                          }ms`
                    }}
                  >
                    {w}&nbsp;
                  </span>
                ))}
              </span>
            ))}
          </p>
          <p
            className="mt-4 text-[14px] leading-7"
            style={{
              color: "var(--mu-accent)",
              opacity: on[IDX.motive] ? 1 : 0,
              transition: instant ? "none" : "opacity 0.4s var(--mu-ease) 700ms"
            }}
          >
            기록–커뮤니티–AI 코치를 하나의 흐름으로 묶으면 달라질까 싶었습니다.
          </p>
        </div>

        {/* EXP 바 — 이 방의 영구 진행 지표. 곧 헤더로 옮겨간다. */}
        <div
          className="mt-7 flex items-center gap-3"
          style={{
            opacity: on[IDX.exp] ? 1 : 0,
            transition: instant ? "none" : "opacity 0.4s var(--mu-ease)"
          }}
        >
          <div
            className="h-[8px] flex-1 overflow-hidden rounded-full"
            style={{background: "rgba(255,255,255,0.08)"}}
            role="progressbar"
            aria-valuenow={1}
            aria-valuemin={1}
            aria-valuemax={13}
            aria-label="페이지 진행도"
          >
            <span
              className="block h-full rounded-full"
              style={{
                width: on[IDX.exp] ? "4%" : "0%",
                background: "var(--mu-primary)",
                transition: instant ? "none" : "width 0.6s var(--mu-ease)"
              }}
            />
          </div>
          <span className="font-mono text-[11px] tabular-nums text-[var(--mu-accent)]">
            Lv.1 4%
          </span>
        </div>
      </div>

      {/* 스크롤 약속 — 이 뒤의 모든 페이지가 지켜야 하는 문장 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[76px] flex flex-col items-center gap-1"
        style={{
          opacity: on[IDX.hint] ? 1 : 0,
          transition: instant ? "none" : "opacity 0.4s var(--mu-ease)"
        }}
      >
        <span className="font-mono text-[12px] text-[var(--mu-muted)]">
          ↓ 스크롤하면 경험치가 오릅니다
        </span>
        <span
          className={instant ? "" : "mu-chev"}
          style={{color: "var(--mu-primary)"}}
          aria-hidden="true"
        >
          ▼
        </span>
      </div>

      <button
        type="button"
        onClick={() => doneRef.current()}
        className="absolute bottom-6 right-6 cursor-pointer font-mono text-[11px] text-[rgba(255,255,255,0.35)] transition-colors hover:text-white"
        style={{
          opacity: on[IDX.outline] ? 1 : 0,
          transition: instant ? "none" : "opacity 0.3s var(--mu-ease)"
        }}
      >
        [ 건너뛰기 ]
      </button>
    </div>
  );
}
