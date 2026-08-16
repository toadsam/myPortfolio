"use client";

import {motion} from "framer-motion";
import {useEffect, useRef, useState} from "react";
import {useAClub} from "../context";
import {useInViewOnce} from "../parts";

const EASE = [0.22, 1, 0.36, 1] as const;

const GALLERY = [
  {
    header: "01 · 동아리 탐색",
    slot: "[IMG-07]",
    ratio: "16:10",
    aspect: "aspect-[16/10]",
    caption: "조건을 누르면 목록이 재배치된다",
    span: "md:col-span-2",
    narrow: false
  },
  {
    header: "02 · 모바일 목록",
    slot: "[IMG-08]",
    ratio: "9:16",
    aspect: "aspect-[9/16]",
    caption: "모바일에서는 2열",
    span: "md:col-span-1",
    narrow: true
  },
  {
    header: "03 · 동아리 상세",
    slot: "[IMG-09]",
    ratio: "16:10",
    aspect: "aspect-[16/10]",
    caption: "모달이 아니라 독립된 주소를 가진 화면",
    span: "md:col-span-1",
    narrow: false
  },
  {
    header: "04 · 모집 공고",
    slot: "[IMG-10]",
    ratio: "16:10",
    aspect: "aspect-[16/10]",
    caption: "마감일이 가장 먼저 보이도록",
    span: "md:col-span-1",
    narrow: false
  },
  {
    header: "05 · 마이페이지",
    slot: "[IMG-11]",
    ratio: "16:10",
    aspect: "aspect-[16/10]",
    caption: "내가 지원한 것만 모아서",
    span: "md:col-span-1",
    narrow: false
  },
  {
    header: "06 · 관리자 화면",
    slot: "[IMG-12]",
    ratio: "21:9",
    aspect: "aspect-[21/9]",
    caption: "같은 데이터, 완전히 다른 화면",
    span: "md:col-span-full",
    narrow: false
  }
];

const STATS = [
  {value: 6, suffix: "", label: "핵심 화면"},
  {value: 5, suffix: "종", label: "공통 컴포넌트"},
  {value: 17, suffix: "곳", label: "컴포넌트 재사용"},
  {value: 3, suffix: "종", label: "복구한 브라우저 동작"}
];

function useCountUp(end: number, trigger: boolean, reducedMotion: boolean) {
  const [value, setValue] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!trigger) return;
    if (reducedMotion) {
      setValue(end);
      return;
    }
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start) / 800, 1);
      setValue(Math.floor((1 - (1 - p) ** 3) * end));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setValue(end);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [end, trigger, reducedMotion]);

  return value;
}

function StatCell({
  stat,
  index,
  trigger
}: {
  stat: (typeof STATS)[number];
  index: number;
  trigger: boolean;
}) {
  const {reducedMotion} = useAClub();
  const value = useCountUp(stat.value, trigger, reducedMotion);
  return (
    <motion.div
      initial={{opacity: 0, y: reducedMotion ? 0 : 10}}
      animate={trigger ? {opacity: 1, y: 0} : {}}
      transition={{
        delay: reducedMotion ? 0 : 2.3 + index * 0.09,
        duration: 0.5,
        ease: EASE
      }}
      className="flex w-full flex-col justify-center rounded-md border border-[rgba(192,132,252,0.22)] bg-[rgba(192,132,252,0.04)] p-[22px] shadow-sm"
    >
      <div className="font-mono text-[32px] font-black leading-none tracking-tight tabular-nums text-[#c084fc]">
        {value}
        {stat.suffix}
      </div>
      <div className="mt-1.5 font-mono text-[11px] tracking-wide text-[rgba(255,255,255,0.48)]">
        {stat.label}
      </div>
    </motion.div>
  );
}

export function ResultSection() {
  const {reducedMotion, lockScroll, setLit} = useAClub();
  const {ref: sectionRef, inView} = useInViewOnce<HTMLElement>({
    threshold: 0.1,
    rootMargin: "-10% 0px"
  });
  const [lightbox, setLightbox] = useState<number | null>(null);

  // 결과 장에 닿으면 페이지 바닥색이 한 단계 밝아진다.
  useEffect(() => {
    if (inView) setLit(true);
  }, [inView, setLit]);

  useEffect(() => {
    if (lightbox === null) return;
    lockScroll(true);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setLightbox(null);
      } else if (e.key === "ArrowRight") {
        setLightbox(i => ((i ?? 0) + 1) % GALLERY.length);
      } else if (e.key === "ArrowLeft") {
        setLightbox(i => ((i ?? 0) - 1 + GALLERY.length) % GALLERY.length);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [lightbox, lockScroll]);

  const item = lightbox !== null ? GALLERY[lightbox]! : null;
  const headWords = "탐색부터 지원까지 한 서비스에서 끝난다".split(" ");

  return (
    <section
      ref={sectionRef}
      id="ac-sec-result"
      data-ac-section
      className="relative z-10 flex min-h-screen w-full flex-col items-center overflow-hidden border-t border-[rgba(192,132,252,0.1)] px-6 py-[120px]"
    >
      {!reducedMotion ? (
        <>
          <motion.div
            initial={{opacity: 0}}
            animate={inView ? {opacity: 1} : {}}
            transition={{duration: 1.2, ease: EASE}}
            className="pointer-events-none absolute left-[20%] top-[30%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
            style={{
              background:
                "radial-gradient(circle, rgba(192, 132, 252, 0.08) 0%, transparent 60%)"
            }}
          />
          <motion.div
            initial={{opacity: 0}}
            animate={inView ? {opacity: 1} : {}}
            transition={{duration: 1.2, ease: EASE}}
            className="pointer-events-none absolute left-[80%] top-[30%] h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
            style={{
              background:
                "radial-gradient(circle, rgba(192, 132, 252, 0.06) 0%, transparent 65%)"
            }}
          />
        </>
      ) : null}

      <div className="relative z-10 mx-auto flex w-full max-w-[1140px] flex-col">
        <header className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <motion.div
            initial={{opacity: 0}}
            animate={inView ? {opacity: 1} : {}}
            transition={{delay: reducedMotion ? 0 : 0.1, duration: 0.4}}
            className="mb-4 font-mono text-sm tracking-widest tabular-nums text-[rgba(255,255,255,0.48)]"
          >
            08 · 결과
          </motion.div>

          <h2 className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[24px] font-black tracking-tight sm:justify-start md:text-[32px]">
            {headWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{opacity: 0, y: reducedMotion ? 0 : 10}}
                animate={inView ? {opacity: 1, y: 0} : {}}
                transition={{
                  delay: reducedMotion ? 0 : 0.1 + i * 0.2,
                  duration: 0.5,
                  ease: EASE
                }}
              >
                {word}
              </motion.span>
            ))}
          </h2>

          <motion.p
            initial={{opacity: 0}}
            animate={inView ? {opacity: 1} : {}}
            transition={{delay: reducedMotion ? 0 : 0.8, duration: 0.6}}
            className="mt-5 max-w-[740px] text-[16px] leading-[36px] text-[rgba(255,255,255,0.88)]"
          >
            조건으로 좁히고, 상세를 보고, 모집 공고를 확인하고, 지원까지
            이어진다. 조건은 주소에 남아서 공유되고, 목록으로 돌아오면 보던
            자리다. 동아리 정보 탐색부터 모집 지원까지 하나의 서비스에서 처리할
            수 있는 플랫폼 프론트엔드를 완성했습니다.
          </motion.p>
        </header>

        {/* ── 화면 갤러리 ── */}
        <div className="mt-12 grid grid-cols-1 items-start gap-4 md:grid-cols-3">
          {GALLERY.map((g, i) => (
            <motion.button
              key={g.slot}
              type="button"
              initial={{opacity: 0, y: reducedMotion ? 0 : 20}}
              animate={inView ? {opacity: 1, y: 0} : {}}
              transition={{
                delay: reducedMotion ? 0 : 1.3 + i * 0.09,
                duration: 0.6,
                ease: EASE
              }}
              onClick={() => setLightbox(i)}
              aria-label={`${g.header}: ${g.caption} — 확대해서 보기`}
              className={`group relative flex flex-col overflow-hidden rounded-md border border-[rgba(192,132,252,0.18)] bg-[#1c1330] text-left outline-none transition-all duration-[350ms] hover:-translate-y-1 hover:border-[rgba(192,132,252,0.45)] ${
                g.span
              } ${
                g.narrow
                  ? "max-[899px]:mx-auto max-[899px]:max-h-[420px] max-[899px]:max-w-[236px] max-[899px]:w-full"
                  : "w-full"
              }`}
              style={{transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)"}}
            >
              <div className="z-10 flex h-[30px] w-full shrink-0 items-center justify-between border-b border-[rgba(192,132,252,0.1)] bg-[#1c1330] px-3">
                <span className="font-mono text-[10px] uppercase tracking-wider tabular-nums text-[rgba(255,255,255,0.48)]">
                  {g.header}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#c084fc] shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
              </div>

              <div
                className={`ac-placeholder-grid relative w-full shrink-0 overflow-hidden ${g.aspect}`}
              >
                <div className="absolute inset-0 flex transform-gpu flex-col items-center justify-center transition-transform duration-[350ms] group-hover:scale-[1.03]">
                  <span className="font-mono text-[12px] tabular-nums text-[rgba(255,255,255,0.35)]">
                    {g.slot} · {g.ratio}
                  </span>
                </div>
              </div>

              <div className="z-10 flex w-full grow items-center border-t border-[rgba(192,132,252,0.10)] bg-[#1c1330] px-[14px] py-[12px] font-mono text-[11px] text-[rgba(255,255,255,0.48)]">
                {g.caption}
              </div>
            </motion.button>
          ))}
        </div>

        {/* ── 수치 ── */}
        <div className="mt-14 grid grid-cols-2 gap-[14px] md:grid-cols-4">
          {STATS.map((stat, i) => (
            <StatCell key={stat.label} stat={stat} index={i} trigger={inView} />
          ))}
        </div>

        {/* ── 면책 ── */}
        <div className="mt-7 flex flex-col gap-3.5">
          <motion.div
            initial={{opacity: 0}}
            animate={inView ? {opacity: 1} : {}}
            transition={{delay: reducedMotion ? 0 : 2.9, duration: 0.5}}
            className="rounded-md border border-[rgba(251,191,36,0.28)] bg-[rgba(251,191,36,0.05)] px-5 py-4"
          >
            <p className="font-mono text-[11px] leading-relaxed tracking-wide text-[#fbbf24]">
              이 프로젝트는 백엔드 연동 전의 프론트엔드 구현입니다. 화면의 모든
              동아리와 지원자는 가상이며, 실제 사용자 데이터는 없습니다.
            </p>
          </motion.div>

          <motion.div
            initial={{opacity: 0}}
            animate={inView ? {opacity: 1} : {}}
            transition={{delay: reducedMotion ? 0 : 3.1, duration: 0.5}}
            className="rounded-md border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.02)] px-[18px] py-[14px]"
          >
            <p className="font-mono text-[11px] leading-relaxed tracking-wide text-[rgba(255,255,255,0.45)]">
              위 숫자는 구현 범위를 센 것입니다. 이용자 수나 지원 건수 같은
              지표는 없습니다.
            </p>
          </motion.div>
        </div>
      </div>

      {item ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[rgba(8,4,14,0.94)] p-6 backdrop-blur-[8px]"
          role="dialog"
          aria-modal="true"
          aria-label="화면 갤러리 확대보기"
          onClick={e => {
            if (e.target === e.currentTarget) setLightbox(null);
          }}
        >
          <div className="relative flex w-full max-w-[1240px] flex-col items-center">
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="닫기"
              className="absolute -top-12 right-0 rounded p-1 text-[rgba(255,255,255,0.48)] outline-none transition-colors hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div
              className={`ac-placeholder-grid relative flex max-h-[80vh] w-full items-center justify-center overflow-hidden rounded-md border border-[rgba(192,132,252,0.18)] shadow-2xl ${item.aspect}`}
            >
              <span className="font-mono text-sm tabular-nums text-[rgba(255,255,255,0.35)]">
                {item.slot} · {item.ratio}
              </span>
            </div>

            <div className="mt-6 flex w-full max-w-2xl items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setLightbox(
                    i => ((i ?? 0) - 1 + GALLERY.length) % GALLERY.length
                  )
                }
                aria-label="이전 이미지"
                className="rounded p-2 text-[rgba(255,255,255,0.48)] outline-none transition-colors hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <p className="px-4 text-center font-mono text-sm tabular-nums text-[rgba(255,255,255,0.48)]">
                {item.header.split("·")[0]!.trim()} /{" "}
                {String(GALLERY.length).padStart(2, "0")}
                <span className="mt-1 block font-sans text-white/80">
                  {item.caption}
                </span>
              </p>
              <button
                type="button"
                onClick={() =>
                  setLightbox(i => ((i ?? 0) + 1) % GALLERY.length)
                }
                aria-label="다음 이미지"
                className="rounded p-2 text-[rgba(255,255,255,0.48)] outline-none transition-colors hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
