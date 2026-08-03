"use client";

import type {CSSProperties, ReactNode} from "react";

// 여러 섹션이 공유하는 조각들.
// 원안 HTML들이 페이지마다 같은 마크업을 반복하므로 여기로 모은다.

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
      : `opacity ${duration} cubic-bezier(0.4,0,0.2,1), transform ${duration} cubic-bezier(0.4,0,0.2,1)`
  };
}

export function fade(
  on: boolean,
  instant: boolean,
  duration = "0.5s"
): CSSProperties {
  return {
    opacity: on ? 1 : 0,
    transition: instant
      ? "none"
      : `opacity ${duration} cubic-bezier(0.4,0,0.2,1)`
  };
}

/** 섹션 번호 라벨 (예: 「01 · 동작 데이터」). */
export function Kicker({
  children,
  on,
  instant,
  color = "var(--sd-muted)",
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

/** 낱말이 하나씩 떠오르는 제목. 원안의 h2 스태거를 그대로 옮긴다. */
export function WordHeading({
  text,
  on,
  instant,
  stepMs = 150,
  className = "text-[28px] font-black leading-tight"
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
              : `opacity 0.4s cubic-bezier(0.4,0,0.2,1) ${(i * stepMs) / 1000}s`
          }}
        >
          {word}
        </span>
      ))}
    </h2>
  );
}

/** 맥 창 크롬(점 3개) + 파일명이 붙은 코드 패널. */
export function CodePanel({
  filename,
  children,
  footer,
  headerNote,
  borderColor = "rgba(126,184,255,0.18)",
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
      className={`flex flex-col overflow-hidden rounded-md bg-[var(--sd-code-bg)] ${className}`}
      style={{border: `1px solid ${borderColor}`}}
    >
      <div
        className="flex h-[36px] shrink-0 items-center bg-[rgba(255,255,255,0.02)] px-4"
        style={{borderBottom: `1px solid ${borderColor}`}}
      >
        <div className="mr-4 flex gap-[6px]">
          <div className="h-2 w-2 rounded-full bg-[#ff5f56]" />
          <div className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
          <div className="h-2 w-2 rounded-full bg-[#27c93f]" />
        </div>
        <span className="font-mono text-[11px] text-[rgba(255,255,255,0.45)]">
          {filename}
        </span>
      </div>
      {headerNote}
      {children}
      {footer ? (
        <div className="shrink-0 border-t border-[rgba(126,184,255,0.12)] bg-[rgba(0,0,0,0.2)] p-3 text-center">
          <span className="font-mono text-[11px] text-[rgba(255,255,255,0.45)]">
            {footer}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** 좌측 강조선이 있는 알림 박스 (원인 / 한계 / 다음 단계 …). */
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
      className={`rounded-md p-[22px] ${className}`}
      style={{
        border: `1px solid ${accent}44`,
        borderLeft: `3px solid ${accent}`,
        background: `${accent}0d`
      }}
    >
      <div
        className="mb-4 font-mono text-[10px] tracking-[0.18em]"
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
  accent = "var(--sd-ok)",
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
        className="font-mono text-[26px] font-black tabular-nums"
        style={{color: numberColor ?? accent}}
      >
        {n}
      </div>
      <div className="mt-1 font-mono text-[10px] text-[var(--sd-muted)]">
        {l}
      </div>
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
      <div className="mb-4 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-muted)]">
        {label}
      </div>
      <ul className="space-y-1 text-[15px] leading-[32px]">
        {items.map(item => (
          <li key={item} className="flex gap-2">
            <span className="shrink-0 text-[var(--sd-muted)]">·</span>
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
    <div className="mt-3 font-mono text-[10px] text-[rgba(255,255,255,0.32)]">
      {children}
    </div>
  );
}

/** 섹션 공통 셸 — 헤더 높이만큼 띄우고 가운데 정렬한다. */
export function SectionShell({
  children,
  maxWidth = "1040px",
  className = ""
}: {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}) {
  return (
    <section
      data-sd-section
      className={`mx-auto w-full px-6 py-[100px] ${className}`}
      style={{maxWidth}}
    >
      {children}
    </section>
  );
}
