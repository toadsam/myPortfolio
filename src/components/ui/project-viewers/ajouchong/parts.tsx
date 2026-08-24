"use client";

import type {CSSProperties, ReactNode} from "react";

// 여러 섹션이 공유하는 조각들.
// 이 방의 소재가 「게시판에 붙은 종이」와 「배포 설정」이라 둘 다 여기에 있다.

/** 등장 전(투명 + 아래로) → 등장 후. */
export function rise(
  on: boolean,
  instant: boolean,
  duration = "0.6s",
  offset = "16px"
): CSSProperties {
  return {
    opacity: on ? 1 : 0,
    transform: on ? "translateY(0)" : `translateY(${offset})`,
    transition: instant
      ? "none"
      : `opacity ${duration} var(--aj-ease), transform ${duration} var(--aj-ease)`
  };
}

export function fade(
  on: boolean,
  instant: boolean,
  duration = "0.5s"
): CSSProperties {
  return {
    opacity: on ? 1 : 0,
    transition: instant ? "none" : `opacity ${duration} var(--aj-ease)`
  };
}

/** 섹션 번호 라벨 (예: 「03 · 새로고침」). */
export function Kicker({
  children,
  on,
  instant,
  color = "var(--aj-muted)",
  className = ""
}: {
  children: ReactNode;
  on: boolean;
  instant: boolean;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`font-mono text-[11px] uppercase tracking-[0.25em] ${className}`}
      style={{color, ...fade(on, instant)}}
    >
      {children}
    </div>
  );
}

/** 낱말이 하나씩 떠오르는 제목. */
export function WordHeading({
  text,
  on,
  instant,
  stepMs = 150,
  className = "text-[26px] font-black leading-tight sm:text-[30px]"
}: {
  text: string;
  on: boolean;
  instant: boolean;
  stepMs?: number;
  className?: string;
}) {
  return (
    <h2 className={`flex flex-wrap gap-x-[0.3em] gap-y-1 ${className}`}>
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block"
          style={{
            opacity: on || instant ? 1 : 0,
            transition: instant
              ? "none"
              : `opacity 0.4s var(--aj-ease) ${(i * stepMs) / 1000}s`
          }}
        >
          {word}
        </span>
      ))}
    </h2>
  );
}

/** 본문 한 문단 — 섹션마다 반복되는 폭·행간을 한 곳에 둔다. */
export function Body({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`max-w-[62ch] text-[15px] leading-[30px] text-[var(--aj-text)] ${className}`}
      style={{textWrap: "pretty"}}
    >
      {children}
    </p>
  );
}

/** 맥 창 크롬(점 3개) + 파일명이 붙은 코드 패널. */
export function CodePanel({
  filename,
  children,
  footer,
  headerNote,
  borderColor = "var(--aj-frame)",
  className = ""
}: {
  filename: string;
  children: ReactNode;
  footer?: ReactNode;
  headerNote?: ReactNode;
  borderColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-md bg-[var(--aj-code-bg)] ${className}`}
      style={{border: `1px solid ${borderColor}`}}
    >
      <div
        className="flex h-[36px] shrink-0 items-center bg-[rgba(255,255,255,0.02)] px-4"
        style={{borderBottom: `1px solid ${borderColor}`}}
      >
        <div className="mr-4 flex gap-[6px]" aria-hidden="true">
          <div className="h-2 w-2 rounded-full bg-[#ff5f56]" />
          <div className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
          <div className="h-2 w-2 rounded-full bg-[#27c93f]" />
        </div>
        <span className="font-mono text-[11px] text-[var(--aj-muted)]">
          {filename}
        </span>
      </div>
      {headerNote}
      {children}
      {footer ? (
        <div className="shrink-0 border-t border-[rgba(251,113,133,0.12)] bg-[rgba(0,0,0,0.25)] p-3 text-center">
          <span className="font-mono text-[11px] text-[var(--aj-muted)]">
            {footer}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** 코드 한 줄 — 강조된 줄은 왼쪽에 색선이 선다. */
export function CodeLine({
  n,
  children,
  highlight = false,
  dim = false
}: {
  n: number;
  children: ReactNode;
  highlight?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-[3px] font-mono text-[12px] leading-[22px] transition-colors duration-300"
      style={{
        background: highlight ? "rgba(74,222,128,0.09)" : "transparent",
        borderLeft: `2px solid ${highlight ? "var(--aj-ok)" : "transparent"}`,
        color: dim ? "var(--aj-faint)" : "var(--aj-text)"
      }}
    >
      <span className="w-4 shrink-0 select-none text-right text-[var(--aj-faint)]">
        {n}
      </span>
      <span className="whitespace-pre-wrap break-words">{children}</span>
    </div>
  );
}

/** 좌측 강조선이 있는 알림 박스 (원인 / 한계 / 배운 것 …). */
export function NoteBox({
  label,
  accent,
  children,
  className = ""
}: {
  label: string;
  accent: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md p-[20px] ${className}`}
      style={{
        border: `1px solid ${accent}44`,
        borderLeft: `3px solid ${accent}`,
        background: `${accent}0d`
      }}
    >
      <div
        className="mb-3 font-mono text-[10px] tracking-[0.18em]"
        style={{color: accent}}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

/** 숫자 + 캡션 통계 칸. */
export function StatCard({
  n,
  l,
  accent = "var(--aj-primary)",
  numberColor,
  style
}: {
  n: string;
  l: string;
  accent?: string;
  numberColor?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className="flex flex-1 flex-col justify-center rounded-md p-[16px]"
      style={{
        border: `1px solid ${accent}38`,
        background: `${accent}0a`,
        ...style
      }}
    >
      <div
        className="font-mono text-[20px] font-black tabular-nums sm:text-[24px]"
        style={{color: numberColor ?? accent}}
      >
        {n}
      </div>
      <div className="mt-1 font-mono text-[10px] text-[var(--aj-muted)]">
        {l}
      </div>
    </div>
  );
}

/** 게시판에 압정으로 붙은 종이 쪽지. */
export function PaperNote({
  children,
  tilt = 0,
  className = "",
  style
}: {
  children: ReactNode;
  /** 도(°) — 게시판에 삐뚤게 붙은 느낌. */
  tilt?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`aj-paper aj-paper-torn aj-pin relative rounded-[3px] px-4 pb-5 pt-4 ${className}`}
      style={{transform: `rotate(${tilt}deg)`, ...style}}
    >
      {children}
    </div>
  );
}

/** 「아직 남은 것」류의 담백한 목록 박스. */
export function LimitList({
  label,
  items,
  className = ""
}: {
  label: string;
  items: string[];
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] p-[20px] ${className}`}
    >
      <div className="mb-3 font-mono text-[10px] tracking-[0.18em] text-[var(--aj-muted)]">
        {label}
      </div>
      <ul className="space-y-1 text-[14px] leading-[28px]">
        {items.map(item => (
          <li key={item} className="flex gap-2">
            <span className="shrink-0 text-[var(--aj-muted)]">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 측정하지 않은 것을 밝히는 작은 각주. */
export function Caveat({children}: {children: ReactNode}) {
  return (
    <div className="mt-3 font-mono text-[10px] leading-5 text-[var(--aj-faint)]">
      {children}
    </div>
  );
}

/** 방문자가 눌러야 할 곳임을 알리는 힌트 줄. */
export function TryHint({
  children,
  on = true
}: {
  children: ReactNode;
  on?: boolean;
}) {
  return (
    <p
      className="font-mono text-[11px] leading-5 text-[var(--aj-accent)]"
      style={{opacity: on ? 1 : 0, transition: "opacity 0.4s var(--aj-ease)"}}
    >
      {children}
    </p>
  );
}

/** 섹션 공통 셸 — 가운데 정렬 + 위아래 여백. */
export function SectionShell({
  children,
  maxWidth = "1040px",
  className = "",
  innerRef
}: {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
  innerRef?: React.Ref<HTMLElement>;
}) {
  return (
    <section
      ref={innerRef}
      data-aj-section
      className={`mx-auto w-full px-5 py-[84px] sm:px-6 sm:py-[100px] ${className}`}
      style={{maxWidth}}
    >
      {children}
    </section>
  );
}
