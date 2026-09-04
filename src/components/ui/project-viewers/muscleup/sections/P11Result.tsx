"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {LEVEL_TOTAL, useMuscleUp} from "../context";
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
// 연출 장치: 캐릭터 시트가 완성되며 갤러리로 확장 (스펙 PAGE 09)
//
// ⚠️ 이용자 얼굴이 찍힌 커뮤니티 캡처와 AWS 계정 ARN 이 보이는 콘솔 캡처는
//    의도적으로 뺐다. 지어낸 지표(가입자 수·DAU·기록 수)도 없다.

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, shots: 3, meta: 4};

// muscle-up.click 은 현재 응답이 없어 링크로 걸지 않는다(위 MetaCell 주석 참고).
const REPO = "https://github.com/toadsam/Ajou_MuscleUp";
const VIDEO = "https://youtu.be/0X-BIADC1eQ";

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
    src: "/projects/muscleup/signup.webp",
    alt: "회원가입 화면",
    caption: "회원가입 — 이메일 인증코드가 폼 안에서 끝난다",
    w: 1222,
    h: 874
  },
  {
    src: "/projects/muscleup/ai-analyze.webp",
    alt: "AI 상담 입력 화면",
    caption: "AI 상담 — 탭 세 개가 엔드포인트 세 개다",
    w: 1299,
    h: 750
  },
  {
    src: "/projects/muscleup/ai-history.webp",
    alt: "AI 상담 기록 화면",
    caption: "히스토리 — 07장의 저장이 실제로 남긴 것",
    w: 1288,
    h: 799
  },
  {
    src: "/projects/muscleup/erd.webp",
    alt: "ERD — 핵심 테이블",
    caption: "ERD — 08장에서 다섯 묶음으로 갈랐던 그 14개 테이블",
    w: 1600,
    h: 1163,
    wide: true
  }
];

export function P11Result() {
  const {reducedMotion, lockScroll, announce, level} = useMuscleUp();
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
    <Page index={12} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        12 · 결과
      </Kicker>

      <div className="mt-4">
        <Heading
          text="실제로 돌던 서비스입니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          여기까지 오시면서 조작하신 것들은 설명을 위한 재현이었습니다. 아래는
          실제로 돌아갔던 화면입니다. 다만{" "}
          <strong style={{color: "var(--mu-warn)"}}>
            배포(muscle-up.click)는 현재 내려가 있어
          </strong>{" "}
          주소 대신 저장소와 시연 영상을 걸어 둡니다. 지금 위쪽 게이지는{" "}
          <strong style={{color: "var(--mu-accent)"}}>
            Lv.{level + 1} / {LEVEL_TOTAL}
          </strong>{" "}
          입니다.
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
        {/* muscle-up.click 은 응답이 없다(2026-08-28 확인). "배포 중" 이라고
            적고 "서비스 열기" 버튼을 걸어 두면 심사자가 눌렀을 때 바로 들통난다.
            resume.ts 는 이미 같은 이유로 이 링크를 빼 두었는데 이 방만 남아 있었다. */}
        <MetaCell value="일시 중단" label="muscle-up.click" />
        <MetaCell value="2025.09 –" label="진행 중" />
        <MetaCell value="1인" label="기획 · UI · API · 인증 · 배포" />
        {/* PDF 10쪽 ERD 캡처에 그려진 핵심 테이블 수다. 전체 @Entity 는 31개. */}
        <MetaCell value="14" label="핵심 테이블 (전체 31)" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          {href: VIDEO, label: "시연 영상 ↗", primary: true},
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
                    border: "1px solid rgba(244,114,182,0.45)",
                    background: "rgba(244,114,182,0.14)",
                    color: "var(--mu-accent)"
                  }
                : {
                    border: "1px solid var(--mu-border)",
                    color: "var(--mu-muted)"
                  }
            }
          >
            {l.label}
          </a>
        ))}
      </div>

      <Caveat>
        커뮤니티 화면 캡처에는 이용자 얼굴이, AWS 콘솔 캡처에는 계정 식별자가
        찍혀 있어 싣지 않았습니다. 가입자 수 · DAU · 운동 기록 수 같은 지표는
        측정하지 않았으므로 적지 않습니다.
      </Caveat>

      {zoom ? (
        <div
          className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center p-4 sm:p-10"
          style={{
            background: "rgba(12,3,10,0.93)",
            backdropFilter: "blur(8px)"
          }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={zoom.alt}
        >
          <figure
            className="m-0 w-full max-w-5xl overflow-hidden rounded-md"
            style={{
              border: "1px solid var(--mu-border)",
              background: "var(--mu-panel)"
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
              style={{borderTop: "1px solid rgba(244,114,182,0.12)"}}
            >
              <span className="font-mono text-[12px] text-[var(--mu-muted)]">
                {zoom.caption}
              </span>
              <button
                type="button"
                onClick={close}
                className="font-mono text-[12px] text-[var(--mu-accent)] transition-colors hover:text-white"
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
