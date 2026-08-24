"use client";

import {useEffect, useRef, type CSSProperties, type ReactNode} from "react";
import {useMuscleUp} from "./context";
import {useInView, useOnScreen} from "../_kit/useTimeline";

// 여러 페이지가 공유하는 조각들. tserof 룸의 검증된 구성을 이 방의 토큰으로 옮긴 것이다.
// 여러 페이지가 공유하는 조각들.
// 색·크기·이징은 portfolio-specs/04-muscleup.md 의 토큰을 그대로 따른다.

/* ─────────────────────────── 등장 ─────────────────────────── */

export function rise(
  on: boolean,
  instant: boolean,
  duration = "0.45s",
  offset = "14px"
): CSSProperties {
  return {
    opacity: on ? 1 : 0,
    transform: on ? "translateY(0)" : `translateY(${offset})`,
    transition: instant
      ? "none"
      : `opacity ${duration} var(--mu-ease), transform ${duration} var(--mu-ease)`
  };
}

export function fade(
  on: boolean,
  instant: boolean,
  duration = "0.35s"
): CSSProperties {
  return {
    opacity: on ? 1 : 0,
    transition: instant ? "none" : `opacity ${duration} var(--mu-ease)`
  };
}

/* ─────────────────────────── 섹션 셸 ─────────────────────────── */

/**
 * 페이지 한 장. 화면에 들어오면 자기 슬롯을 연다.
 * 스크롤을 막지 않는다 — 스크롤 그 자체가 이 방의 경험치다.
 */
export function Page({
  index,
  children,
  className = "",
  maxWidth = "1040px",
  innerRef
}: {
  index: number;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  innerRef?: React.Ref<HTMLElement>;
}) {
  const {reach} = useMuscleUp();
  const localRef = useRef<HTMLElement>(null);
  const seen = useOnScreen(localRef, 0.28);

  useEffect(() => {
    if (seen) reach(index);
  }, [seen, index, reach]);

  return (
    <section
      ref={node => {
        localRef.current = node;
        if (typeof innerRef === "function") innerRef(node);
        else if (innerRef)
          (innerRef as React.RefObject<HTMLElement | null>).current = node;
      }}
      data-mu-section={index}
      className={`mx-auto w-full px-5 py-[96px] sm:px-6 sm:py-[120px] ${className}`}
      style={{maxWidth}}
    >
      {children}
    </section>
  );
}

/** 섹션이 화면에 들어왔는지 — 타임라인 시작용. */
export function usePageIn(ref: React.RefObject<HTMLElement | null>) {
  return useInView(ref, {threshold: 0.18});
}

/* ─────────────────────────── 글 ─────────────────────────── */

/** 섹션 라벨 (font-mono 11px, tracking 0.25em). */
export function Kicker({
  children,
  on,
  instant,
  color = "var(--mu-primary)"
}: {
  children: ReactNode;
  on: boolean;
  instant: boolean;
  color?: string;
}) {
  return (
    <div
      className="font-mono text-[11px] uppercase tracking-[0.25em]"
      style={{color, ...fade(on, instant)}}
    >
      {children}
    </div>
  );
}

/** 30px font-black 제목 — 낱말 단위 스태거(0.03s). */
export function Heading({
  text,
  on,
  instant,
  className = "text-[24px] font-black leading-tight sm:text-[30px]",
  color
}: {
  text: string;
  on: boolean;
  instant: boolean;
  className?: string;
  color?: string;
}) {
  return (
    <h2
      className={`flex flex-wrap gap-x-[0.32em] gap-y-1 ${className}`}
      style={color ? {color} : undefined}
    >
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block"
          style={{
            opacity: on || instant ? 1 : 0,
            transform: on || instant ? "translateY(0)" : "translateY(8px)",
            transition: instant
              ? "none"
              : `opacity 0.3s var(--mu-ease) ${
                  (i * 30) / 1000
                }s, transform 0.3s var(--mu-ease) ${(i * 30) / 1000}s`
          }}
        >
          {word}
        </span>
      ))}
    </h2>
  );
}

export function Body({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`max-w-[62ch] text-[15px] leading-8 text-[var(--mu-text)] sm:text-[16px] ${className}`}
      style={{textWrap: "pretty"}}
    >
      {children}
    </p>
  );
}

/** 좌측 강조선 카드 — 증상 / 원인 / 결과 / 한계 전부 이 모양. */
export function Card({
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
      className={`rounded-md p-5 ${className}`}
      style={{
        border: `1px solid ${accent}47`,
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

/** 담백한 패널 — 목록·표를 담는다. */
export function Panel({
  label,
  children,
  className = "",
  right
}: {
  label?: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <div
      className={`rounded-md p-4 ${className}`}
      style={{
        border: "1px solid var(--mu-border)",
        background: "var(--mu-panel)"
      }}
    >
      {label ? (
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--mu-muted)]">
            {label}
          </span>
          {right}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** 메타 그리드 한 칸 — 값 24px 위, 라벨 11px 아래. */
export function MetaCell({value, label}: {value: string; label: string}) {
  return (
    <div
      className="rounded-md p-4"
      style={{
        border: "1px solid var(--mu-border)",
        background: "var(--mu-panel)"
      }}
    >
      <div className="font-mono text-[20px] font-black text-[var(--mu-text)] sm:text-[24px]">
        {value}
      </div>
      <div className="mt-1 font-mono text-[11px] tracking-[0.1em] text-[var(--mu-muted)]">
        {label}
      </div>
    </div>
  );
}

/* ─────────────────────────── 코드 ─────────────────────────── */

export function CodePanel({
  filename,
  children,
  footer,
  badge,
  borderColor = "var(--mu-border)",
  className = ""
}: {
  filename: string;
  children: ReactNode;
  footer?: ReactNode;
  badge?: {text: string; color: string};
  borderColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-md ${className}`}
      style={{border: `1px solid ${borderColor}`, background: "var(--mu-code-bg)"}}
    >
      <div
        className="flex h-[34px] shrink-0 items-center gap-3 px-4"
        style={{
          borderBottom: `1px solid ${borderColor}`,
          background: "rgba(255,255,255,0.02)"
        }}
      >
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--mu-muted)]">
          {filename}
        </span>
        {badge ? (
          <span
            className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-black"
            style={{
              background: `color-mix(in srgb, ${badge.color} 18%, transparent)`,
              color: badge.color
            }}
          >
            {badge.text}
          </span>
        ) : null}
      </div>
      {children}
      {footer ? (
        <div
          className="shrink-0 p-3 text-center"
          style={{
            borderTop: "1px solid rgba(244,114,182,0.12)",
            background: "rgba(0,0,0,0.25)"
          }}
        >
          <span className="font-mono text-[11px] text-[var(--mu-muted)]">
            {footer}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function CodeLine({
  n,
  children,
  highlight = false,
  bad = false,
  dim = false
}: {
  n: number;
  children: ReactNode;
  highlight?: boolean;
  bad?: boolean;
  dim?: boolean;
}) {
  const accent = bad ? "var(--mu-bad)" : "var(--mu-primary)";
  const marked = highlight || bad;
  return (
    <div
      className="flex items-start gap-3 px-4 py-[3px] font-mono text-[12px] leading-[22px] transition-colors duration-300"
      style={{
        background: marked
          ? `color-mix(in srgb, ${accent} 10%, transparent)`
          : "transparent",
        borderLeft: `2px solid ${marked ? accent : "transparent"}`,
        color: dim ? "var(--mu-faint)" : "var(--mu-text)"
      }}
    >
      <span className="w-5 shrink-0 select-none text-right text-[var(--mu-faint)]">
        {n}
      </span>
      <span className="whitespace-pre-wrap break-words">{children}</span>
    </div>
  );
}

/** 코드 안의 주석 — 색만 따로 준다. */
export function Cm({children}: {children: ReactNode}) {
  return <span style={{color: "var(--mu-c-comment)"}}>{children}</span>;
}

/* ─────────────────────────── 계측 ─────────────────────────── */

export function Meter({
  label,
  value,
  max,
  unit = "",
  color = "var(--mu-primary)",
  hint
}: {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
  hint?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--mu-muted)]">
          {label}
        </span>
        <span
          className="font-mono text-[12px] font-bold tabular-nums"
          style={{color}}
        >
          {Math.round(value).toLocaleString("ko-KR")}
          {unit}
        </span>
      </div>
      <div
        className="mu-bar"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={Math.round(max)}
        aria-label={label}
      >
        <span style={{width: `${pct}%`, backgroundColor: color}} />
      </div>
      {hint ? (
        <p className="mt-1 font-mono text-[10px] leading-4 text-[var(--mu-faint)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function StatCard({
  n,
  l,
  accent = "var(--mu-primary)"
}: {
  n: string;
  l: string;
  accent?: string;
}) {
  return (
    <div
      className="flex flex-1 flex-col justify-center rounded-md p-4"
      style={{border: `1px solid ${accent}38`, background: `${accent}0a`}}
    >
      <div
        className="font-mono text-[18px] font-black tabular-nums sm:text-[22px]"
        style={{color: accent}}
      >
        {n}
      </div>
      <div className="mt-1 font-mono text-[10px] text-[var(--mu-muted)]">
        {l}
      </div>
    </div>
  );
}

/* ─────────────────────────── 조작 ─────────────────────────── */

/** 두 갈래 토글 — 이 방의 트러블 페이지가 전부 같은 모양을 쓴다. */
export function Switch2({
  options,
  value,
  onChange,
  label
}: {
  options: [string, string];
  value: 0 | 1;
  onChange: (v: 0 | 1) => void;
  label: string;
}) {
  return (
    <div
      className="flex overflow-hidden rounded"
      style={{border: "1px solid var(--mu-border)"}}
      role="group"
      aria-label={label}
    >
      {options.map((opt, i) => {
        const on = value === i;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(i as 0 | 1)}
            aria-pressed={on}
            className="px-3 py-1.5 font-mono text-[11px] font-bold transition-colors duration-200"
            style={{
              background: on ? "rgba(244,114,182,0.20)" : "transparent",
              color: on ? "var(--mu-primary)" : "var(--mu-muted)"
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  on,
  onToggle,
  title,
  note,
  onColor = "var(--mu-primary)"
}: {
  on: boolean;
  onToggle: () => void;
  title: string;
  note: string;
  onColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className="flex w-full items-center justify-between gap-3 rounded-md px-4 py-3.5 text-left transition-colors duration-200"
      style={{
        border: `1px solid ${
          on
            ? `color-mix(in srgb, ${onColor} 45%, transparent)`
            : "var(--mu-border)"
        }`,
        background: on
          ? `color-mix(in srgb, ${onColor} 8%, transparent)`
          : "var(--mu-panel)"
      }}
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-bold text-[var(--mu-text)]">
          {title}
        </span>
        <span className="mt-0.5 block font-mono text-[10px] text-[var(--mu-muted)]">
          {note}
        </span>
      </span>
      <span
        className="relative h-[24px] w-[44px] shrink-0 rounded-full transition-colors duration-200"
        style={{background: on ? onColor : "rgba(255,255,255,0.18)"}}
        aria-hidden="true"
      >
        <span
          className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-[left] duration-200"
          style={{left: on ? "23px" : "3px"}}
        />
      </span>
    </button>
  );
}

/** 방문자가 눌러야 할 곳임을 알리는 힌트. */
export function Hint({children}: {children: ReactNode}) {
  return (
    <p className="font-mono text-[11px] leading-5 text-[var(--mu-faint)]">
      {children}
    </p>
  );
}

/** 측정하지 않은 것을 밝히는 각주. */
export function Caveat({children}: {children: ReactNode}) {
  return (
    <div className="mt-4 font-mono text-[10px] leading-5 text-[var(--mu-faint)]">
      {children}
    </div>
  );
}

/* ─────────────────────────── 이미지 ─────────────────────────── */

/** 이미지 슬롯. 소스가 없으면 절대 빈 회색 박스를 두지 않는다(그레이박스 대체). */
export function Shot({
  src,
  alt,
  caption,
  w,
  h,
  onOpen,
  className = ""
}: {
  src?: string;
  alt: string;
  caption: string;
  w: number;
  h: number;
  onOpen?: () => void;
  className?: string;
}) {
  const ratio = `${w} / ${h}`;
  const inner = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
    />
  ) : (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#220c1d]">
      <div className="flex flex-col items-center gap-1" aria-hidden="true">
        <span className="block h-2.5 w-24 rounded-sm bg-[#3a1430]" />
        <span className="block h-2.5 w-16 rounded-sm bg-[#31102a]" />
        <span className="block h-2.5 w-28 rounded-sm bg-[#3a1430]" />
      </div>
      <span className="font-mono text-[12px] text-[rgba(255,255,255,0.35)]">
        {caption}
      </span>
      <span className="font-mono text-[10px] text-[var(--mu-faint)]">
        {w} : {h} · 이미지 자리
      </span>
    </div>
  );

  return (
    <figure
      className={`m-0 overflow-hidden rounded-md ${className}`}
      style={{
        border: "1px solid var(--mu-border)",
        background: "var(--mu-panel)"
      }}
    >
      {onOpen && src ? (
        <button
          type="button"
          onClick={onOpen}
          className="group relative block w-full cursor-zoom-in overflow-hidden"
          style={{aspectRatio: ratio}}
          aria-label={`${alt} — 확대해서 보기`}
        >
          {inner}
          <span
            className="pointer-events-none absolute right-2 top-2 rounded px-2 py-1 font-mono text-[10px] font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{background: "rgba(0,0,0,0.6)", color: "var(--mu-accent)"}}
          >
            ⤢ 확대
          </span>
        </button>
      ) : (
        <div className="group relative w-full" style={{aspectRatio: ratio}}>
          {inner}
        </div>
      )}
      <figcaption
        className="px-3 py-2 font-mono text-[11px] text-[var(--mu-muted)]"
        style={{borderTop: "1px solid rgba(244,114,182,0.12)"}}
      >
        {caption}
      </figcaption>
    </figure>
  );
}

/* ───────────────────── 이 방에만 있는 조각 ───────────────────── */

/**
 * 캐릭터 시트의 스탯 한 줄 — 라벨 + 6px 핑크 막대 + 모노 수치.
 * 스펙 PAGE 00/01 의 STAT ROWS 를 그대로 옮긴 것.
 */
export function StatRow({
  label,
  value,
  pct = 100,
  on,
  delay = 0,
  instant
}: {
  label: string;
  value: string;
  pct?: number;
  on: boolean;
  delay?: number;
  instant: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        opacity: on ? 1 : 0,
        transition: instant
          ? "none"
          : `opacity 0.3s var(--mu-ease) ${delay}ms`
      }}
    >
      <span className="w-[62px] shrink-0 font-mono text-[11px] text-[var(--mu-muted)]">
        {label}
      </span>
      <div className="mu-bar flex-1">
        <span
          style={{
            width: on ? `${pct}%` : "0%",
            transitionDelay: instant ? "0ms" : `${delay + 60}ms`
          }}
        />
      </div>
      <span className="w-[52px] shrink-0 text-right font-mono text-[11px] tabular-nums text-[var(--mu-accent)]">
        {value}
      </span>
    </div>
  );
}

/**
 * 장비 슬롯 — 링크를 버튼 줄로 늘어놓지 않기 위한 이 방의 규칙.
 * 스펙 PAGE 01: 「링크가 버튼이 아니라 캐릭터 시트의 장비 슬롯 3칸에 장착된 아이템」
 */
export function EquipSlot({
  slotLabel,
  caption,
  children,
  href,
  onClick,
  equipped,
  delay = 0,
  instant,
  note
}: {
  slotLabel: string;
  caption: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  equipped: boolean;
  delay?: number;
  instant: boolean;
  note?: string;
}) {
  const body = (
    <>
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        {equipped && !instant ? (
          <span
            className="mu-ring absolute rounded-full"
            style={{
              border: "1px solid rgba(244,114,182,0.5)",
              animationDelay: `${delay}ms`
            }}
          />
        ) : null}
      </span>
      <span
        className={equipped && !instant ? "mu-equip" : ""}
        style={{animationDelay: `${delay}ms`}}
      >
        {children}
      </span>
    </>
  );

  const boxClass =
    "relative flex h-[92px] w-full items-center justify-center rounded-md transition-[border-color,transform,box-shadow] duration-300 sm:h-[96px]";
  const boxStyle: CSSProperties = {
    border: equipped
      ? "1px solid rgba(244,114,182,0.45)"
      : "1px dashed rgba(244,114,182,0.28)",
    background: "rgba(244,114,182,0.03)"
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className={`${boxClass} cursor-pointer hover:-translate-y-[3px] hover:border-[rgba(244,114,182,0.7)]`}
          style={boxStyle}
          aria-label={`${slotLabel} — ${caption}`}
        >
          {body}
        </a>
      ) : onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={`${boxClass} cursor-pointer hover:-translate-y-[3px] hover:border-[rgba(244,114,182,0.7)]`}
          style={boxStyle}
          aria-label={`${slotLabel} — ${caption}`}
        >
          {body}
        </button>
      ) : (
        <div className={boxClass} style={boxStyle}>
          {body}
        </div>
      )}
      <span className="font-mono text-[10px] text-[rgba(255,255,255,0.40)]">
        {slotLabel}
      </span>
      <span
        className="text-center font-mono text-[10px] leading-4"
        style={{color: note ? "var(--mu-muted)" : "var(--mu-accent)"}}
      >
        {caption}
      </span>
    </div>
  );
}

/**
 * 흐름도의 한 마디. 점등되면 색이 들어온다.
 * 스펙 PAGE 04(두 갈래 로그인)·PAGE 07(AI 파이프라인)이 쓰는 공통 조각.
 */
export function FlowNode({
  title,
  sub,
  active,
  done,
  color = "var(--mu-primary)"
}: {
  title: string;
  sub?: string;
  active?: boolean;
  done?: boolean;
  color?: string;
}) {
  const lit = active || done;
  return (
    <div
      className="rounded-md px-3 py-2.5 transition-[border-color,background-color,box-shadow] duration-300"
      style={{
        border: `1px solid ${lit ? color : "rgba(255,255,255,0.10)"}`,
        background: lit
          ? `color-mix(in srgb, ${color} 12%, transparent)`
          : "rgba(255,255,255,0.02)",
        boxShadow: active ? `0 0 12px color-mix(in srgb, ${color} 35%, transparent)` : "none"
      }}
    >
      <div
        className="font-mono text-[11px] font-bold"
        style={{color: lit ? color : "var(--mu-muted)"}}
      >
        {done ? "✓ " : ""}
        {title}
      </div>
      {sub ? (
        <div className="mt-1 font-mono text-[10px] leading-4 text-[var(--mu-faint)]">
          {sub}
        </div>
      ) : null}
    </div>
  );
}

/** 서버가 돌려준 응답 한 줄 — 성공/실패 색이 다르다. */
export function LogLine({
  time,
  method,
  path,
  status,
  note
}: {
  time: string;
  method: string;
  path: string;
  status: number;
  note?: string;
}) {
  const ok = status < 400;
  const color = ok ? "var(--mu-ok)" : "var(--mu-bad)";
  return (
    <div className="flex items-start gap-2 px-3 py-1 font-mono text-[11px] leading-5">
      <span className="shrink-0 text-[var(--mu-faint)]">{time}</span>
      <span className="shrink-0 text-[var(--mu-muted)]">{method}</span>
      <span className="min-w-0 flex-1 truncate text-[var(--mu-text)]">
        {path}
      </span>
      <span className="shrink-0 font-bold tabular-nums" style={{color}}>
        {status}
      </span>
      {note ? (
        <span className="shrink-0 text-[10px]" style={{color}}>
          {note}
        </span>
      ) : null}
    </div>
  );
}
