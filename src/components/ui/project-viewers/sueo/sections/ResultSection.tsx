"use client";

import {useEffect, useRef, useState} from "react";
import {useSueo} from "../context";
import {fade, Kicker, rise, WordHeading} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

const STEPS = [0, 100, 800, 1300, 1390, 1480, 1570, 1660, 2200, 2800, 3000];
const IDX = {
  label: 0,
  heading: 1,
  intro: 2,
  shot: 3, // 3~7 갤러리 5장
  stats: 8,
  warn: 9,
  note: 10
};

// 배포본(GitHub Pages)에서 찍은 실제 화면 5장. GitHub 저장소 README 의 캡처와 같다.
// 폰 비율(500×1023)이라 상자를 세로로 두고 contain 으로 넣는다.
const SHOTS = [
  {
    tag: "01 · 홈",
    src: "/projects/sign-language/home.webp",
    cap: "오늘의 목표 · 오늘의 챌린지 · 최근 7일 풀이"
  },
  {
    tag: "02 · 퀴즈",
    src: "/projects/sign-language/quiz.webp",
    cap: "아바타 영상을 보고 보기 4개 중 뜻 고르기"
  },
  {
    tag: "03 · 학습하기",
    src: "/projects/sign-language/learn.webp",
    cap: "기초 단어 · 오답 복습 · 일상 회화"
  },
  {
    tag: "04 · 통역기",
    src: "/projects/sign-language/translator.webp",
    cap: "문장을 수어 단어 순서로 · 영상 없는 단어는 글자"
  },
  {
    tag: "05 · 변환 결과",
    src: "/projects/sign-language/translate-detail.webp",
    cap: "매칭된 토큰 · 사전에 없는 토큰 · 영상이 없는 단어"
  }
];

// 기준: 저장소 파일을 센 값, 17 만 운영 서버(2026-09-07)에서 센 값.
const COUNTERS = [
  {to: 120, l: "사전 단어 · sign_dictionary.json"},
  {to: 17, l: "그중 영상이 있는 단어", warn: true},
  {to: 20, l: "퀴즈 문항 · update_quiz_items.py"},
  {to: 0, l: "전문가 감수 횟수", warn: true}
];

/** 0 → target 까지 800ms 동안 올라가는 숫자. */
function CountUp({
  to,
  run,
  instant
}: {
  to: number;
  run: boolean;
  instant: boolean;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (instant || to === 0) {
      setN(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 800, 1);
      setN(Math.floor(p * (2 - p) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to, instant]);

  return <>{n}</>;
}

export function ResultSection() {
  const {reducedMotion: rm} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.08});
  const t = useTimeline(STEPS, inView, rm);

  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (lightbox === null) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight")
        setLightbox(i => ((i ?? 0) + 1) % SHOTS.length);
      if (e.key === "ArrowLeft")
        setLightbox(i => ((i ?? 0) - 1 + SHOTS.length) % SHOTS.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const on = (i: number) => t[i] || rm;
  const shot = lightbox === null ? null : SHOTS[lightbox];

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="relative mx-auto w-full max-w-[1140px] px-6 py-[100px] lg:px-8"
      style={{background: "linear-gradient(to bottom, #0a1422, #060d18)"}}
    >
      <div className="mb-12">
        <Kicker
          on={on(IDX.label)}
          instant={rm}
          className="mb-4 text-[13px] tracking-wider"
        >
          08 · 결과
        </Kicker>
        <WordHeading
          text="동작을 보고 배우고, 문장을 입력해 확인할 수 있는 서비스"
          on={on(IDX.heading)}
          instant={rm}
          stepMs={40}
          className="mb-[20px] text-[24px] font-black leading-tight tracking-tight md:text-[32px]"
        />
        <p
          className="max-w-[740px] text-[16px] leading-[36px]"
          style={rise(on(IDX.intro), rm)}
        >
          수어 영상을 보고 뜻을 고르며 익히고, 문장을 넣으면 수어 단어 순서로
          이어 보는 앱을 네 명이 만들어 GitHub Pages 와 Cloud Run 에 올렸습니다.
          제 몫은 문장 변환의 세 갈래 선택과 정규화, 단어별 영상 조회, 그리고
          앱과 서버의 배포였습니다. 아래는 배포본에서 찍은 실제 화면입니다.
        </p>
      </div>

      {/* ── 갤러리 ── */}
      <div className="mb-[56px] grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {SHOTS.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setLightbox(i)}
            className="group flex w-full flex-col overflow-hidden rounded-md border border-[rgba(126,184,255,0.18)] bg-[#101f33] text-left transition-all duration-[350ms] hover:-translate-y-1 hover:border-[rgba(126,184,255,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-primary)]"
            style={rise(on(IDX.shot + i), rm)}
          >
            <div className="flex h-[30px] items-center justify-between border-b border-[rgba(126,184,255,0.1)] px-3">
              <span className="font-mono text-[10px] uppercase text-[var(--sd-muted)]">
                {s.tag}
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--sd-primary)] opacity-80" />
            </div>
            <div
              className="relative w-full overflow-hidden bg-[var(--sd-bg)]"
              style={{aspectRatio: "500/1023"}}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.cap}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-[350ms] group-hover:scale-[1.03]"
              />
            </div>
            <div className="mt-auto border-t border-[rgba(126,184,255,0.1)] p-[12px_14px]">
              <p className="font-mono text-[11px] text-[var(--sd-muted)]">
                {s.cap}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── 숫자 ── */}
      <div className="mb-[32px] grid grid-cols-2 gap-[14px] md:grid-cols-4">
        {COUNTERS.map((c, i) => (
          <div
            key={c.l}
            className="flex flex-col justify-center rounded-md border p-[22px]"
            style={{
              borderColor: c.warn
                ? "rgba(251,191,36,0.30)"
                : "rgba(126,184,255,0.22)",
              background: "rgba(126,184,255,0.04)",
              ...rise(on(IDX.stats), rm),
              transitionDelay: rm ? "0s" : `${i * 0.09}s`
            }}
          >
            <div
              className="font-mono text-[32px] font-black leading-none tabular-nums"
              style={{color: c.warn ? "var(--sd-warn)" : "var(--sd-primary)"}}
            >
              <CountUp to={c.to} run={on(IDX.stats)} instant={rm} />
            </div>
            <div className="mt-[6px] font-mono text-[11px] text-[var(--sd-muted)]">
              {c.l}
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-md border border-[rgba(251,191,36,0.28)] bg-[rgba(251,191,36,0.05)] p-[16px_20px] font-mono text-[11px] leading-[1.6] text-[var(--sd-warn)]"
        style={rise(on(IDX.warn), rm)}
      >
        이 서비스의 수어 표현은 농인 당사자나 수어 전문가의 감수를 받지
        않았습니다. 학습용 프로토타입이며, 정확한 수어 학습 자료로 사용하기에는
        검증이 부족합니다.
      </div>

      <div
        className="mt-[14px] rounded-md border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.02)] p-[14px_18px] font-mono text-[11px] leading-[1.6] text-[rgba(255,255,255,0.45)]"
        style={rise(on(IDX.note), rm)}
      >
        120·20·0 은 저장소 파일을 센 값이고, 17 은 사전 단어를 운영 서버에 넣어
        센 값입니다(2026-09-07). 사용자 수나 학습 효과에 대한 데이터는 없습니다.
      </div>

      {/* ── 라이트박스 ── */}
      {shot ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="이미지 갤러리 뷰어"
        >
          <div
            className="absolute inset-0 bg-[rgba(4,9,16,0.94)] backdrop-blur-[8px]"
            onClick={() => setLightbox(null)}
          />
          <div className="relative z-10 flex w-full max-w-[1240px] flex-col items-center p-4 sm:p-12">
            <div className="mb-4 flex w-full justify-end">
              <button
                ref={closeRef}
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="닫기"
                className="p-2 font-mono text-[12px] text-[var(--sd-muted)] transition-colors hover:text-white"
              >
                닫기 [Esc]
              </button>
            </div>
            <div className="flex max-h-[76vh] w-full items-center justify-center overflow-hidden rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-bg)] shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot.src}
                alt={shot.cap}
                className="max-h-[76vh] w-auto object-contain"
              />
            </div>
            <p className="mt-4 w-full text-center font-mono text-[12px] text-[var(--sd-muted)]">
              {shot.cap}
            </p>
            <div className="mt-3 flex gap-6">
              <button
                type="button"
                onClick={() =>
                  setLightbox(i => ((i ?? 0) - 1 + SHOTS.length) % SHOTS.length)
                }
                aria-label="이전 이미지"
                className="p-2 font-mono text-[12px] text-[var(--sd-muted)] hover:text-white"
              >
                ← 이전
              </button>
              <button
                type="button"
                onClick={() => setLightbox(i => ((i ?? 0) + 1) % SHOTS.length)}
                aria-label="다음 이미지"
                className="p-2 font-mono text-[12px] text-[var(--sd-muted)] hover:text-white"
              >
                다음 →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
