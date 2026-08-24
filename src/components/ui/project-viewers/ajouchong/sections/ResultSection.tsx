"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  Caveat,
  Kicker,
  SectionShell,
  StatCard,
  WordHeading,
  rise
} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

// 08 · 결과 — 여기서 처음으로 진짜 스크린샷이 나온다.
// 앞 장들이 전부 재현 화면이었으므로, 실제로 배포된 사이트를 보여 주며 닫는다.

const STEPS = [0, 150, 600, 1000, 1400];
const IDX = {label: 0, heading: 1, body: 2, shots: 3, stats: 4};

interface Shot {
  src: string;
  alt: string;
  caption: string;
  w: number;
  h: number;
}

const SHOTS: Shot[] = [
  {
    src: "/projects/ajouchong.png",
    alt: "아주대 총학생회 웹사이트 메인 화면",
    caption: "메인 — 공지·Q&A·복지·자료가 한 주소 아래로 모였다",
    w: 1889,
    h: 904
  },
  {
    src: "/projects/op/ajouchong-notice.png",
    alt: "공지 상세 페이지 화면",
    caption: "공지 상세 — 새로고침해도 그대로 열린다",
    w: 1882,
    h: 845
  },
  {
    src: "/projects/op/ajouchong-detail.png",
    alt: "세부 안내 페이지 화면",
    caption: "세부 안내 페이지",
    w: 600,
    h: 367
  }
];

const STATS = [
  {n: "5 → 1", l: "확인해야 할 채널 수"},
  {n: "0", l: "새로고침 404"},
  {n: "3인", l: "프론트엔드 팀"},
  {n: "Docker + Nginx", l: "실배포 구성"}
];

export function ResultSection() {
  const {reducedMotion, lockScroll, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {threshold: 0.15});
  const on = useTimeline(STEPS, inView, reducedMotion);
  const instant = reducedMotion;

  const [zoom, setZoom] = useState<Shot | null>(null);

  const open = useCallback(
    (shot: Shot) => {
      setZoom(shot);
      lockScroll(true);
      announce(`${shot.alt} 확대해서 봅니다. Esc 로 닫습니다.`);
    },
    [lockScroll, announce]
  );

  const close = useCallback(() => {
    setZoom(prev => {
      if (prev) lockScroll(false);
      return null;
    });
  }, [lockScroll]);

  // 확대 중에는 Esc 가 방을 닫지 않고 확대만 닫아야 한다.
  useEffect(() => {
    if (!zoom) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [zoom, close]);

  // 언마운트될 때 잠금이 남지 않게 한다.
  // 클로저로 zoom 을 읽으면 첫 렌더의 null 이 잡혀 해제가 안 되므로 ref 로 본다.
  const zoomRef = useRef<Shot | null>(null);
  zoomRef.current = zoom;
  useEffect(
    () => () => {
      if (zoomRef.current) lockScroll(false);
    },
    [lockScroll]
  );

  return (
    <SectionShell innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant} color="var(--aj-ok)">
        08 · 결과
      </Kicker>

      <div className="mt-4" style={rise(on[IDX.heading], instant)}>
        <WordHeading
          text="실제로 배포된 사이트"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          여기까지 보신 화면은 전부 설명을 위해 다시 그린 것이었습니다. 아래는
          실제로 학생들이 쓰던 화면입니다.
        </Body>
      </div>

      {/* 스크린샷 */}
      <div
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
        style={rise(on[IDX.shots], instant, "0.7s")}
      >
        {SHOTS.map((shot, i) => (
          <figure
            key={shot.src}
            className={`m-0 overflow-hidden rounded-md border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)] ${
              i === 0 ? "sm:col-span-2" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => open(shot)}
              className="group relative block w-full cursor-zoom-in overflow-hidden"
              style={{aspectRatio: `${shot.w} / ${shot.h}`}}
              aria-label={`${shot.alt} — 확대해서 보기`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot.src}
                alt={shot.alt}
                width={shot.w}
                height={shot.h}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span
                className="pointer-events-none absolute right-2 top-2 rounded px-2 py-1 font-mono text-[10px] font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  color: "var(--aj-accent)"
                }}
              >
                ⤢ 확대
              </span>
            </button>
            <figcaption className="border-t border-[rgba(255,255,255,0.09)] px-4 py-2.5 font-mono text-[11px] leading-5 text-[var(--aj-muted)]">
              {shot.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* 수치 */}
      <div
        className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
        style={rise(on[IDX.stats], instant, "0.7s")}
      >
        {STATS.map(s => (
          <StatCard
            key={s.l}
            n={s.n}
            l={s.l}
            accent={s.n === "0" ? "var(--aj-ok)" : "var(--aj-primary)"}
          />
        ))}
      </div>

      <Caveat>
        「5 → 1」은 정보를 찾으러 들르던 채널 수가 사이트 하나로 줄었다는
        뜻이며, 방문자 수·이용률 같은 운영 지표는 측정하지 않았습니다. 「0」은
        배포 뒤 새로고침 404 재발이 없었다는 의미입니다.
      </Caveat>

      {/* ── 확대 ── */}
      {zoom ? (
        <div
          className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center p-4 sm:p-10"
          style={{background: "rgba(8,3,4,0.9)", backdropFilter: "blur(4px)"}}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
        >
          <figure
            className="m-0 w-full max-w-5xl overflow-hidden rounded-lg border border-[var(--aj-frame)] bg-[var(--aj-code-bg)]"
            onClick={e => e.stopPropagation()}
          >
            <div style={{aspectRatio: `${zoom.w} / ${zoom.h}`}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoom.src}
                alt={zoom.alt}
                width={zoom.w}
                height={zoom.h}
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.1)] px-4 py-3">
              <span className="font-mono text-[12px] text-[var(--aj-muted)]">
                {zoom.caption}
              </span>
              <button
                type="button"
                onClick={close}
                className="shrink-0 font-mono text-[12px] text-[var(--aj-accent)] transition-colors hover:text-white"
              >
                닫기 (Esc)
              </button>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </SectionShell>
  );
}
