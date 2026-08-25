"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {SLOT_TOTAL, useTserof} from "../context";
import {
  Body,
  Caveat,
  Heading,
  Kicker,
  Page,
  Shot,
  StatCard,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../useTimeline";

// PAGE 11 — 결과 · 전 스테이지 잠금 해제
//
// 연출 장치: 이 장에 닿으면 보드가 사실상 전부 열린다. 여기서 처음으로
// **진짜 게임 화면**이 나온다(앞의 무대는 전부 재현이었다).

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, shots: 3, stats: 4};

const STEAM = "https://store.steampowered.com/app/2743860/TSEROF/?l=koreana";
const VIDEO = "https://www.youtube.com/watch?v=1Lm-lpVsmq8";
const REPO = "https://github.com/KimEoJin24/TSEROF";

interface ShotDef {
  src: string;
  alt: string;
  caption: string;
  w: number;
  h: number;
  wide?: boolean;
}

const SHOTS: ShotDef[] = [
  {
    src: "/projects/op/tserof-stage.webp",
    alt: "스테이지 선택 화면",
    caption: "스테이지 선택 — 이 페이지가 흉내 낸 그 화면",
    w: 530,
    h: 301
  },
  {
    src: "/projects/op/tserof-difficulty.webp",
    alt: "난이도 선택 화면",
    caption: "난이도 선택 — 재도전 문턱을 낮추기 위한 장치",
    w: 605,
    h: 388
  },
  {
    src: "/projects/op/tserof-feedback.webp",
    alt: "유저테스트 피드백 정리 화면",
    caption: "유저테스트 기록 — 09 의 네 줄이 나온 곳",
    w: 870,
    h: 497,
    wide: true
  }
];

export function P11Result() {
  const {reducedMotion, lockScroll, announce, unlocked} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [zoom, setZoom] = useState<ShotDef | null>(null);
  const zoomRef = useRef<ShotDef | null>(null);
  zoomRef.current = zoom;

  const open = useCallback(
    (s: ShotDef) => {
      setZoom(s);
      lockScroll(true);
      announce(`${s.alt} 확대해서 봅니다. Esc 로 닫습니다.`);
    },
    [lockScroll, announce]
  );

  const close = useCallback(() => {
    setZoom(prev => {
      if (prev) lockScroll(false);
      return null;
    });
  }, [lockScroll]);

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

  useEffect(
    () => () => {
      if (zoomRef.current) lockScroll(false);
    },
    [lockScroll]
  );

  return (
    <Page index={11} innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant} color="var(--ts-primary)">
        11 · 결과
      </Kicker>

      <div className="mt-4">
        <Heading
          text="스토어에 올라간 빌드"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          여기까지 오시면서 보신 무대는 전부 설명을 위해 다시 그린 것이었습니다.
          아래는 실제로 플레이어가 보던 화면입니다. 지금 위쪽 보드는{" "}
          <strong>
            {unlocked + 1} / {SLOT_TOTAL}
          </strong>{" "}
          까지 열려 있습니다.
        </Body>
      </div>

      <div
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
        style={rise(on[IDX.shots], instant)}
      >
        {SHOTS.map(s => (
          <Shot
            key={s.src}
            src={s.src}
            alt={s.alt}
            caption={s.caption}
            w={s.w}
            h={s.h}
            onOpen={() => open(s)}
            className={s.wide ? "sm:col-span-2" : ""}
          />
        ))}
      </div>

      <div
        className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
        style={rise(on[IDX.stats], instant)}
      >
        <StatCard n="Steam" l="상용 플랫폼 출시" accent="var(--ts-primary)" />
        <StatCard n="4개월" l="2023.07 — 2023.11" accent="var(--ts-accent)" />
        <StatCard n="4건" l="유저테스트 반영" accent="var(--ts-accent)" />
        <StatCard n="부팀장" l="레벨 · 기믹 · 기획" accent="var(--ts-ray)" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          {href: STEAM, label: "Steam 스토어 ↗", primary: true},
          {href: VIDEO, label: "플레이 영상 ↗", primary: false},
          {href: REPO, label: "GitHub ↗", primary: false}
        ].map(l => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md px-4 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={
              l.primary
                ? {
                    border: "1px solid rgba(52,211,153,0.45)",
                    background: "rgba(52,211,153,0.14)",
                    color: "var(--ts-accent)"
                  }
                : {
                    border: "1px solid var(--ts-border)",
                    color: "var(--ts-muted)"
                  }
            }
          >
            {l.label}
          </a>
        ))}
      </div>

      <Caveat>
        저장소는 팀원 소유이며 접근이 제한될 수 있습니다. 판매량·평점·플레이
        시간 같은 상용 지표는 공개하지 않습니다.
      </Caveat>

      {zoom ? (
        <div
          className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center p-4 sm:p-10"
          style={{background: "rgba(2,10,7,0.92)", backdropFilter: "blur(6px)"}}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
        >
          <figure
            className="m-0 w-full max-w-5xl overflow-hidden rounded-md"
            style={{
              border: "1px solid var(--ts-border)",
              background: "var(--ts-panel)"
            }}
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
            <figcaption
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{borderTop: "1px solid rgba(52,211,153,0.12)"}}
            >
              <span className="font-mono text-[12px] text-[var(--ts-muted)]">
                {zoom.caption}
              </span>
              <button
                type="button"
                onClick={close}
                className="font-mono text-[12px] text-[var(--ts-accent)] transition-colors hover:text-white"
              >
                닫기 (Esc)
              </button>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </Page>
  );
}
