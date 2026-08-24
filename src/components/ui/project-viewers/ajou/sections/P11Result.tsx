"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {STAGE_TOTAL, useAjou} from "../context";
import {
  Body,
  Caveat,
  Heading,
  Kicker,
  MetaCell,
  Page,
  Shot,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 11 — 결과 · 화면 갤러리
//
// 연출 장치: 캐비닛 화면이 전체 화면으로 확장되며 갤러리로 전환 (스펙 PAGE 09)
//
// 지어낸 지표(다운로드 수 · 플레이 수)는 없다.

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, shots: 3, meta: 4};

const REPO = "https://github.com/toadsam/Ajou_IndiGame";
const VIDEO = "https://www.youtube.com/watch?v=mtIiIWmrSdg";

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
    src: "/projects/ajou-adventure/title.webp",
    alt: "게임 시작 화면",
    caption: "시작 화면 — 00장에서 코인을 넣었던 그 화면",
    w: 1029,
    h: 565,
    wide: true
  },
  {
    src: "/projects/ajou-adventure/view-fp.webp",
    alt: "1인칭 뷰",
    caption: "1인칭 — 캠퍼스를 걸어 다닐 때",
    w: 436,
    h: 222
  },
  {
    src: "/projects/ajou-adventure/view-td.webp",
    alt: "탑다운 뷰",
    caption: "탑다운 — 건물에 들어가 싸울 때",
    w: 445,
    h: 220
  },
  {
    src: "/projects/ajou-adventure/skill-select.webp",
    alt: "스킬 선택 화면",
    caption: "레벨업 — 05장에서 골라 보신 그 3장",
    w: 456,
    h: 254
  },
  {
    src: "/projects/ajou-adventure/boss-appear.webp",
    alt: "보스 등장 화면",
    caption: "보스 — 08장의 세 패턴이 나오는 곳",
    w: 454,
    h: 248
  },
  {
    src: "/projects/ajou-adventure/character-select.webp",
    alt: "캐릭터 선택 화면",
    caption: "캐릭터 선택 — 09장의 「전부 끄고 하나만 켜기」",
    w: 917,
    h: 422
  },
  {
    src: "/projects/ajou-adventure/portal.webp",
    alt: "포탈 앞 장면 / 씬 전환 장면",
    caption: "포탈 — 구역과 구역을 잇는 씬 전환",
    w: 986,
    h: 537
  }
];

export function P11Result() {
  const {reducedMotion, lockScroll, announce, stage} = useAjou();
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
    <Page index={11} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        11 · 결과
      </Kicker>

      <div className="mt-4">
        <Heading
          text="캐비닛 밖으로 꺼낸 화면들"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          여기까지 조작하신 것들은 설명을 위해 다시 그린 것이었습니다. 아래는
          실제 빌드의 화면입니다. 지금 위쪽 표시등은{" "}
          <strong style={{color: "var(--aj-accent)"}}>
            {stage + 1} / {STAGE_TOTAL}
          </strong>{" "}
          까지 켜져 있습니다.
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
        style={rise(on[IDX.meta], instant)}
      >
        <MetaCell value="5개월" label="2024.08 – 2024.12" />
        <MetaCell value="1인" label="기획 · 시스템 · AI · UI" />
        <MetaCell value="Unity" label="C#" />
        <MetaCell value="4" label="핵심 시스템" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          {href: VIDEO, label: "플레이 영상 ↗", primary: true},
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
                    border: "1px solid rgba(163,230,53,0.45)",
                    background: "rgba(163,230,53,0.14)",
                    color: "var(--aj-accent)"
                  }
                : {
                    border: "1px solid var(--aj-border)",
                    color: "var(--aj-muted)"
                  }
            }
          >
            {l.label}
          </a>
        ))}
      </div>

      <Caveat>
        다운로드 수 · 플레이 수 같은 지표는 측정하지 않았으므로 적지 않습니다.
      </Caveat>

      {zoom ? (
        <div
          className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center p-4 sm:p-10"
          style={{background: "rgba(6,10,3,0.94)", backdropFilter: "blur(8px)"}}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
        >
          <figure
            className="m-0 w-full max-w-5xl overflow-hidden rounded-md"
            style={{
              border: "1px solid var(--aj-border)",
              background: "var(--aj-panel)"
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
              style={{borderTop: "1px solid rgba(163,230,53,0.12)"}}
            >
              <span className="font-mono text-[12px] text-[var(--aj-muted)]">
                {zoom.caption}
              </span>
              <button
                type="button"
                onClick={close}
                className="font-mono text-[12px] text-[var(--aj-accent)] transition-colors hover:text-white"
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
