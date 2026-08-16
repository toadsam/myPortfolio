"use client";

import type {ReactNode} from "react";

// ── 아이콘 (feather-icons 인라인 대체) ──────────────────────────────────────

export function IconPlay({className = "h-6 w-6"}: {className?: string}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

export function IconPlayCircle({
  className = "h-16 w-16"
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon
        points="10 8 16 12 10 16 10 8"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function IconVolume({
  muted,
  className = "h-4 w-4"
}: {
  muted?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {muted ? (
        <>
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  );
}

// ── 코드 패널 ───────────────────────────────────────────────────────────────

/** 맥 스타일 신호등 3개가 달린 코드 창. */
export function CodeWindow({
  file,
  children,
  trafficLights = "mono",
  className = "",
  bodyClassName = "p-5",
  header
}: {
  file: string;
  children: ReactNode;
  trafficLights?: "mono" | "color" | "none";
  className?: string;
  bodyClassName?: string;
  header?: ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#0b0708] ${className}`}
    >
      <div className="flex h-[44px] items-center justify-between border-b border-[rgba(255,255,255,0.10)] bg-[#0f0a0c] px-4">
        {trafficLights === "none" ? (
          <span className="font-mono text-[11px] uppercase tracking-wider text-[rgba(255,255,255,0.42)]">
            {header}
          </span>
        ) : (
          <div className="flex gap-1.5">
            {(trafficLights === "color"
              ? ["#ff5f56", "#ffbd2e", "#27c93f"]
              : ["", "", ""]
            ).map((c, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-full"
                style={{background: c || "rgba(255,255,255,0.10)"}}
              />
            ))}
          </div>
        )}
        <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">
          {file}
        </span>
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

/** 섹션 상단 키커 — "01 · 무엇을 만들었나" 같은 번호표. */
export function Kicker({
  children,
  tone = "red"
}: {
  children: ReactNode;
  tone?: "red" | "accent" | "muted" | "warn";
}) {
  const color =
    tone === "red"
      ? "#ef4444"
      : tone === "accent"
      ? "#ff5a4d"
      : tone === "warn"
      ? "#fbbf24"
      : "rgba(255,255,255,0.42)";
  return (
    <div
      className="font-mono text-[11px] uppercase tracking-[0.25em]"
      style={{color}}
    >
      {children}
    </div>
  );
}

// ── C# 문법 색상 토큰 ───────────────────────────────────────────────────────

export const SYNTAX = {
  comment: "#5e8c6a",
  string: "#d9a45b",
  keyword: "#ef4444",
  number: "#b58cf0",
  type: "#4ec9b0",
  method: "#dcdcaa"
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
export function Ty({children}: {children: ReactNode}) {
  return <span style={{color: SYNTAX.type}}>{children}</span>;
}
export function Fn({children}: {children: ReactNode}) {
  return <span style={{color: SYNTAX.method}}>{children}</span>;
}
export function Cmt({children}: {children: ReactNode}) {
  return <span style={{color: SYNTAX.comment}}>{children}</span>;
}
