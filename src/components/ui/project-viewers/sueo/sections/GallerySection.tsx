"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";
import {useSueo} from "../context";
import {useInView, useTimeline} from "../useTimeline";

const HEADLINE = ["수어는", "손", "모양이", "아니라"];

const STATS: {n: string; l: string; warn?: boolean}[] = [
  {n: "5", l: "기술 스택"},
  {n: "4", l: "핵심 기능"},
  {n: "백엔드", l: "담당 범위"},
  {n: "미감수", l: "수어 표현 검증", warn: true}
];

// 원안 스크립트의 schedule(초) 순서를 ms로 옮긴다.
const STEPS = [
  0, // 0 벽
  0, // 1 바닥
  300, // 2 키커
  500,
  540,
  580,
  620, // 3~6 h1 단어
  1050, // 7 「움직임이다」
  1500, // 8 요약문
  1900,
  1990,
  2080,
  2170,
  2260, // 9~13 스탯 4개 + 주석
  2400,
  2600,
  2900, // 14~16 액자 A(조명·프레임·라벨)
  2850,
  3050,
  3350, // 17~19 액자 B
  3150,
  3350,
  3650, // 20~22 액자 C
  3800 // 23 힌트
];

const IDX = {
  wall: 0,
  floor: 1,
  kicker: 2,
  word: 3,
  h2: 7,
  summary: 8,
  cell: 9,
  a: 14,
  b: 17,
  c: 20,
  hint: 23
};

/** 등장 전 상태(투명 + 아래로 10px)를 인라인 스타일로 표현한다. */
function rise(on: boolean, instant: boolean, duration = "0.5s"): CSSProperties {
  return {
    opacity: on ? 1 : 0,
    transform: on ? "translate(0,0)" : "translateY(10px)",
    transition: instant
      ? "none"
      : `all ${duration} cubic-bezier(0.4, 0, 0.2, 1)`
  };
}

function slide(on: boolean, instant: boolean): CSSProperties {
  return {
    opacity: on ? 1 : 0,
    transform: on ? "translate(0,0)" : "translateX(-10px)",
    transition: instant ? "none" : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  };
}

/** 액자 위에 떨어지는 스포트라이트. */
function FrameLight({
  on,
  instant,
  className
}: {
  on: boolean;
  instant: boolean;
  className: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${className}`}
      style={{
        opacity: on ? 1 : 0,
        transition: instant ? "none" : "opacity 0.5s"
      }}
      aria-hidden="true"
    >
      <div className="sd-frame-light h-full w-full" />
    </div>
  );
}

/** 액자 아래 붙는 캡션 명패. */
function Plate({
  on,
  instant,
  title,
  sub
}: {
  on: boolean;
  instant: boolean;
  title: string;
  sub: string;
}) {
  return (
    <div
      className="pointer-events-none relative z-10 mt-4 border border-[rgba(126,184,255,0.16)] bg-[var(--sd-panel)] px-[12px] py-[8px] sm:absolute sm:-bottom-[20px] sm:-left-[20px] sm:mt-0"
      style={slide(on, instant)}
    >
      <div className="font-mono text-[11px] text-[rgba(255,255,255,0.86)]">
        {title}
      </div>
      <div className="mt-1 font-mono text-[9px] text-[var(--sd-muted)]">
        {sub}
      </div>
    </div>
  );
}

function Piece({
  children,
  className
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div className={`sd-piece group relative shrink-0 ${className}`}>
      {children}
    </div>
  );
}

const FRAME_CLASS =
  "sd-frame relative block h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sd-bg)]";

export function GallerySection() {
  const {reducedMotion, raiseSignCount, bumpSignCount, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.05});
  const t = useTimeline(STEPS, inView, reducedMotion);

  const [hintHidden, setHintHidden] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [demoPlayed, setDemoPlayed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // 이 페이지에 도달하면 이미 「안녕하세요」를 포함해 세 동작을 본 상태다.
  useEffect(() => {
    if (inView) raiseSignCount(3);
  }, [inView, raiseSignCount]);

  function openDemo() {
    setLightboxOpen(true);
    if (!demoPlayed) {
      bumpSignCount();
      setDemoPlayed(true);
    }
    announce("데모 영상을 열었습니다. Esc 키로 닫을 수 있습니다.");
  }

  // 라이트박스: Esc 닫기 + 포커스 이동
  useEffect(() => {
    if (!lightboxOpen) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setLightboxOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const rm = reducedMotion;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden pb-[92px] pt-[92px]"
      style={{
        background: "linear-gradient(to bottom, #0a1422, #060d18)",
        opacity: t[IDX.wall] || rm ? 1 : 0,
        transition: rm ? "none" : "opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {/* 바닥 선 */}
      <div
        className="absolute inset-x-0 bottom-[20%] h-px origin-left bg-[rgba(126,184,255,0.08)]"
        style={{
          transform: t[IDX.floor] || rm ? "scaleX(1)" : "scaleX(0)",
          transition: rm
            ? "none"
            : "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1140px] flex-col items-center gap-16 px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        {/* ── 왼쪽: 설명 ── */}
        <div className="mx-auto w-full max-w-[520px] shrink-0 pt-4 lg:mx-0 lg:pt-8">
          <div
            className="font-mono text-[12px] uppercase tracking-[0.3em] text-[var(--sd-primary)]"
            style={rise(t[IDX.kicker] || rm, rm)}
          >
            PLATFORM · 수어 학습과 표현
          </div>

          <h1 className="mt-4 break-keep text-[26px] font-black leading-tight text-[var(--sd-text)] lg:text-[40px]">
            {/* inline-block 안의 후행 공백은 접히므로, 낱말 사이 여백은 margin으로 준다. */}
            {HEADLINE.map((word, i) => (
              <span
                key={word}
                className="mr-[0.25em] inline-block"
                style={rise(t[IDX.word + i] || rm, rm)}
              >
                {word}
              </span>
            ))}
            <br className="hidden sm:block lg:hidden" />
            <span
              className="mt-[10px] inline-block text-[var(--sd-primary)]"
              style={rise(t[IDX.h2] || rm, rm)}
            >
              움직임이다
            </span>
          </h1>

          <p
            className="mt-[22px] max-w-[520px] break-keep text-[16px] leading-[36px]"
            style={rise(t[IDX.summary] || rm, rm)}
          >
            아바타가 동작을 보여주고, 사용자가 뜻을 맞히고, 틀린 건 다시 나온다.
            반대로 문장을 입력하면 그 문장의 수어 동작을 이어서 보여준다. 저는
            그{" "}
            <strong className="font-bold text-[var(--sd-accent)]">
              동작 데이터와 판정 로직
            </strong>
            을 만드는 백엔드를 맡았습니다.
          </p>

          <div className="mt-[28px] grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={stat.l}
                className="flex flex-col justify-between rounded-md border bg-[rgba(126,184,255,0.03)] p-[14px]"
                style={{
                  borderColor: stat.warn
                    ? "rgba(251,191,36,0.30)"
                    : "var(--sd-frame)",
                  ...rise(t[IDX.cell + i] || rm, rm)
                }}
              >
                <div
                  className="font-mono text-[22px] font-black tabular-nums"
                  style={{
                    color: stat.warn ? "var(--sd-warn)" : "var(--sd-primary)"
                  }}
                >
                  {stat.n}
                </div>
                <div className="mt-3 font-mono text-[10px] tracking-[0.1em] text-[var(--sd-muted)]">
                  {stat.l}
                </div>
              </div>
            ))}
          </div>

          <p
            className="mt-4 break-keep font-mono text-[10px] text-[rgba(255,255,255,0.35)]"
            style={{
              opacity: t[IDX.cell + 4] || rm ? 1 : 0,
              transition: rm ? "none" : "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            수어 표현의 정확성은 전문가 감수를 받지 못했습니다. 뒤에서 그대로
            밝힙니다.
          </p>
        </div>

        {/* ── 오른쪽: 액자 갤러리 ── */}
        <div
          className="relative mx-auto mt-8 flex w-full max-w-[700px] flex-wrap items-center justify-center gap-y-16 sm:flex-row sm:items-start sm:gap-12 lg:mt-0 lg:block lg:h-[500px] lg:w-[620px] lg:max-w-none lg:gap-0"
          onMouseEnter={() => setHintHidden(true)}
          onFocus={() => setHintHidden(true)}
        >
          {/* GitHub 저장소 */}
          <Piece className="h-[170px] w-full sm:w-[240px] lg:absolute lg:left-0 lg:top-[60px]">
            <FrameLight
              on={t[IDX.b] || rm}
              instant={rm}
              className="-top-[35px] h-[70px] w-[140px]"
            />
            <a
              href="https://github.com/toadsam/Sign-Language"
              target="_blank"
              rel="noreferrer"
              className={FRAME_CLASS}
              style={{
                ...rise(t[IDX.b + 1] || rm, rm),
                boxShadow: "0 30px 40px -10px rgba(0,0,0,0.6)"
              }}
            >
              <div className="pointer-events-none absolute inset-0 border border-[var(--sd-frame)]" />
              <div className="pointer-events-none flex h-full w-full items-center justify-center font-mono text-[26px] tracking-widest text-[rgba(255,255,255,0.78)]">
                &lt;&nbsp;&gt;
              </div>
            </a>
            <Plate
              on={t[IDX.b + 2] || rm}
              instant={rm}
              title="GitHub 저장소"
              sub="Spring Boot · Firebase · React"
            />
          </Piece>

          {/* 데모 영상 */}
          <Piece className="z-10 h-[220px] w-full sm:w-[320px] lg:absolute lg:left-[280px] lg:top-0">
            <FrameLight
              on={t[IDX.a] || rm}
              instant={rm}
              className="-top-[45px] h-[90px] w-[220px]"
            />
            <button
              type="button"
              onClick={openDemo}
              className={FRAME_CLASS}
              style={{
                ...rise(t[IDX.a + 1] || rm, rm),
                boxShadow: "0 40px 50px -15px rgba(0,0,0,0.7)"
              }}
            >
              <div className="pointer-events-none absolute inset-0 border border-[var(--sd-frame)]" />
              <div className="pointer-events-none relative flex h-full w-full flex-col items-center justify-center">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--sd-hand)"
                  strokeWidth="1.2"
                  className="mb-4 opacity-80"
                  aria-hidden="true"
                >
                  <path d="M7 10v6s0 3 5 3 5-3 5-3v-6" strokeLinecap="round" />
                  <path d="M12 2v7" strokeLinecap="round" />
                  <path d="M9 3v6" strokeLinecap="round" />
                  <path d="M15 3v6" strokeLinecap="round" />
                  <path
                    d="M6 13c-1.5 0-2-1-2-1V9l3 1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="font-mono text-[10px] text-[var(--sd-accent)]">
                  「배우다」
                </div>
                <span className="sr-only">수어 동작: 배우다</span>

                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[rgba(191,219,254,0.15)] bg-[rgba(191,219,254,0.12)] backdrop-blur-[2px]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="var(--sd-accent)"
                      className="ml-1"
                      aria-hidden="true"
                    >
                      <polygon points="8,5 19,12 8,19" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
            <Plate
              on={t[IDX.a + 2] || rm}
              instant={rm}
              title="데모 영상"
              sub="1분 28초 · 퀴즈 학습과 문장 변환"
            />
          </Piece>

          {/* 작업 범위 */}
          <Piece className="h-[160px] w-full sm:w-[220px] lg:absolute lg:left-[360px] lg:top-[280px]">
            <FrameLight
              on={t[IDX.c] || rm}
              instant={rm}
              className="-top-[30px] h-[60px] w-[130px]"
            />
            <div
              tabIndex={0}
              className={FRAME_CLASS}
              style={{
                ...rise(t[IDX.c + 1] || rm, rm),
                boxShadow: "0 20px 30px -10px rgba(0,0,0,0.5)"
              }}
            >
              <div className="pointer-events-none absolute inset-0 border border-[var(--sd-frame)]" />
              <div className="flex h-full w-full flex-col justify-center px-5 font-mono text-[10px] leading-[2.2] text-[rgba(255,255,255,0.62)]">
                <p>담당: 백엔드</p>
                <p>수어 데이터 API 설계</p>
                <p>정답 판정 로직</p>
                <p>3D 아바타는 팀원 작업</p>
              </div>
            </div>
            <Plate
              on={t[IDX.c + 2] || rm}
              instant={rm}
              title="작업 범위"
              sub="팀 프로젝트"
            />
          </Piece>

          <div
            className="pointer-events-none mt-8 w-full text-center font-mono text-[10px] text-[rgba(255,255,255,0.35)] lg:absolute lg:-bottom-[40px] lg:left-0 lg:mt-0"
            style={{
              opacity: hintHidden ? 0 : t[IDX.hint] || rm ? 1 : 0,
              transition: rm
                ? "none"
                : "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            액자를 눌러보세요
          </div>
        </div>
      </div>

      {/* ── 데모 라이트박스 ── */}
      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[70]"
          role="dialog"
          aria-modal="true"
          aria-label="데모 영상"
        >
          <div
            className="absolute inset-0 bg-[rgba(4,9,16,0.94)] backdrop-blur-[8px]"
            onClick={() => setLightboxOpen(false)}
          />
          <div className="relative flex h-full w-full flex-col items-center justify-center p-6">
            <div className="mb-4 flex w-full max-w-[1000px] items-center justify-between">
              <span className="font-mono text-[10px] text-[rgba(255,255,255,0.55)]">
                자막 포함
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="px-3 py-2 font-mono text-[12px] text-white opacity-60 transition-opacity hover:opacity-100"
              >
                닫기 [Esc]
              </button>
            </div>
            <div className="flex aspect-video w-full max-w-[1000px] items-center justify-center border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] shadow-2xl">
              <span className="font-mono text-[13px] text-[var(--sd-muted)]">
                데모 영상 자리 · 16:9 · 자막 필수
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
