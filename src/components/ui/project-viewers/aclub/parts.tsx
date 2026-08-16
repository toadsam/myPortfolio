"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";
import {useAClub} from "./context";

// ── 뷰포트 진입 감지 ────────────────────────────────────────────────────────

/** 룸 스크롤 컨테이너를 root로 삼아 한 번만 발화하는 in-view 훅. */
export function useInViewOnce<T extends HTMLElement>(options?: {
  threshold?: number;
  rootMargin?: string;
}) {
  const {rootRef, reducedMotion} = useAClub();
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setInView(true);
      return;
    }
    const el = ref.current;
    const root = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      {
        root: root ?? null,
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? "0px 0px -50px 0px"
      }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, rootRef, options?.threshold, options?.rootMargin]);

  return {ref, inView} as const;
}

// ── 등장 래퍼 ───────────────────────────────────────────────────────────────

/** 뷰포트에 들어오면 아래에서 위로 떠오르는 블록. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div"
}: {
  children: ReactNode;
  className?: string;
  /** 초 단위 */
  delay?: number;
  as?: "div" | "section" | "header" | "p" | "li" | "ul";
}) {
  const {ref, inView} = useInViewOnce<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={`ac-reveal ${inView ? "ac-in" : ""} ${className}`}
      style={delay ? {transitionDelay: `${delay}s`} : undefined}
    >
      {children}
    </Tag>
  );
}

/** 단어 단위로 순차 등장하는 제목. */
export function RevealWords({
  text,
  className = "",
  step = 0.15,
  start = 0,
  colorFrom
}: {
  text: string;
  className?: string;
  /** 단어당 지연(초) */
  step?: number;
  start?: number;
  /** 이 인덱스부터 강조색을 입힌다 */
  colorFrom?: {index: number; color: string};
}) {
  const {ref, inView} = useInViewOnce<HTMLHeadingElement>({threshold: 0.1});
  return (
    <h2 ref={ref} className={`flex flex-wrap gap-x-2 gap-y-1 ${className}`}>
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={`ac-word ${inView ? "ac-in" : ""}`}
          style={{
            transitionDelay: `${start + i * step}s`,
            color:
              colorFrom && i >= colorFrom.index ? colorFrom.color : undefined
          }}
        >
          {word}
        </span>
      ))}
    </h2>
  );
}

// ── 라벨 · 코드 창 ──────────────────────────────────────────────────────────

export function Kicker({
  children,
  tone = "primary"
}: {
  children: ReactNode;
  tone?: "primary" | "bad" | "warn" | "muted";
}) {
  const color =
    tone === "bad"
      ? "#f87171"
      : tone === "warn"
      ? "#fbbf24"
      : tone === "muted"
      ? "rgba(255,255,255,0.46)"
      : "#c084fc";
  return (
    <div className="font-mono text-[11px] tracking-[0.25em]" style={{color}}>
      {children}
    </div>
  );
}

/** 맥 신호등 3개가 달린 코드 창. tone이 테두리 색을 결정한다. */
export function CodeWindow({
  file,
  children,
  footer,
  subHeader,
  tone = "neutral",
  className = ""
}: {
  file: string;
  children: ReactNode;
  footer?: ReactNode;
  subHeader?: ReactNode;
  tone?: "neutral" | "bad" | "ok";
  className?: string;
}) {
  const border =
    tone === "bad"
      ? "rgba(248,113,113,0.28)"
      : tone === "ok"
      ? "rgba(74,222,128,0.28)"
      : "rgba(192,132,252,0.18)";
  const headBorder =
    tone === "bad"
      ? "rgba(248,113,113,0.14)"
      : tone === "ok"
      ? "rgba(74,222,128,0.14)"
      : "rgba(192,132,252,0.18)";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-md bg-[#0f0a1a] ${className}`}
      style={{border: `1px solid ${border}`}}
    >
      <div
        className="flex h-[36px] shrink-0 items-center bg-[#170f26] px-4"
        style={{borderBottom: `1px solid ${headBorder}`}}
      >
        <div className="mr-4 hidden gap-1.5 sm:flex">
          {["#ff5f56", "#ffbd2e", "#27c93f"].map(c => (
            <span
              key={c}
              className="h-[8px] w-[8px] rounded-full"
              style={{background: c}}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-[rgba(255,255,255,0.45)]">
          {file}
        </span>
      </div>
      {subHeader}
      <div className="ac-scroll-thin relative overflow-x-auto whitespace-pre p-4 font-mono text-[11px] leading-relaxed sm:text-[12px]">
        <div className="w-max min-w-full text-[rgba(255,255,255,0.88)]">
          {children}
        </div>
      </div>
      {footer ? (
        <div className="flex h-[36px] shrink-0 items-center border-t border-[rgba(192,132,252,0.12)] bg-[#0f0a1a] px-4">
          <span className="font-mono text-[11px] text-[rgba(255,255,255,0.45)]">
            {footer}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** 강조 배경이 깔린 코드 한 줄(또는 블록). */
export function HlLine({
  children,
  tone = "primary"
}: {
  children: ReactNode;
  tone?: "primary" | "bad" | "ok";
}) {
  const bg =
    tone === "bad"
      ? "rgba(248,113,113,0.12)"
      : tone === "ok"
      ? "rgba(74,222,128,0.12)"
      : "rgba(192,132,252,0.12)";
  return (
    <div className="relative -mx-4 my-0.5 px-4 py-0.5" style={{background: bg}}>
      {children}
    </div>
  );
}

// ── TypeScript 문법 색상 토큰 ───────────────────────────────────────────────

export const SYNTAX = {
  comment: "#7a5f8a",
  string: "#fcd34d",
  keyword: "#c084fc",
  number: "#7dd3fc"
} as const;

export function Kw({children}: {children: ReactNode}) {
  return <span style={{color: SYNTAX.keyword}}>{children}</span>;
}
export function Str({children}: {children: ReactNode}) {
  return <span style={{color: SYNTAX.string}}>{children}</span>;
}
export function Num({children}: {children: ReactNode}) {
  return <span style={{color: SYNTAX.number}}>{children}</span>;
}
export function Cmt({children}: {children: ReactNode}) {
  return <span style={{color: SYNTAX.comment}}>{children}</span>;
}

// ── 공용 카드 ───────────────────────────────────────────────────────────────

/** 증상 / 원인 / 남은 것처럼 왼쪽에 색 띠가 있는 노트 박스. */
export function NoteBox({
  label,
  tone,
  children,
  className = ""
}: {
  label: string;
  tone: "bad" | "warn" | "primary" | "muted";
  children: ReactNode;
  className?: string;
}) {
  const palette = {
    bad: {
      c: "#f87171",
      border: "rgba(248,113,113,0.28)",
      bg: "rgba(248,113,113,0.05)"
    },
    warn: {
      c: "#fbbf24",
      border: "rgba(251,191,36,0.30)",
      bg: "rgba(251,191,36,0.05)"
    },
    primary: {
      c: "#c084fc",
      border: "rgba(192,132,252,0.24)",
      bg: "rgba(192,132,252,0.04)"
    },
    muted: {
      c: "rgba(255,255,255,0.46)",
      border: "rgba(255,255,255,0.12)",
      bg: "rgba(255,255,255,0.02)"
    }
  }[tone];

  return (
    <div
      className={`rounded-md p-5 ${className}`}
      style={{
        border: `1px solid ${palette.border}`,
        borderLeft: `3px solid ${palette.c}`,
        background: palette.bg
      }}
    >
      <div
        className="mb-3 font-mono text-[10px] tracking-[0.18em]"
        style={{color: palette.c}}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

/** 초록 테두리 수치 셀. */
export function MetricCell({value, label}: {value: string; label: string}) {
  return (
    <div className="flex flex-1 flex-col justify-center rounded-md border border-[rgba(74,222,128,0.22)] bg-[rgba(74,222,128,0.04)] p-4">
      <div className="mb-1 font-mono text-[26px] font-black leading-none tabular-nums text-[#4ade80]">
        {value}
      </div>
      <div className="font-mono text-[10px] text-[rgba(255,255,255,0.46)]">
        {label}
      </div>
    </div>
  );
}
