"use client";

/**
 * 장부 조각들 — 관리자 화면을 "입력 폼"에서 "기록하는 장부"로 바꾸는 네 가지.
 *
 * ## 못 양보한 규칙
 *
 * 이건 **매일 여는 도구**다. 화려해지느라 입력이 느려지면 안 쓰게 된다. 그래서:
 *
 * - 등불 게이지는 숫자 입력을 **대체하지 않는다.** 옆에 나란히 두고 같은 값을
 *   본다. 탭으로 넘어가며 숫자만 때려 넣는 빠른 길은 그대로 살아 있다.
 * - 연출은 전부 **결과 쪽**에만 건다. 입력을 막는 애니메이션은 없다.
 * - 모션을 줄인 사용자에겐 전부 즉시 상태로 끝난다.
 */

import {useCallback, useEffect, useRef, useState} from "react";
import type {NpcPreview} from "@/lib/villageLightPreview";

const REDUCED = "(prefers-reduced-motion: reduce)";

/* ─────────────────────────────────────────────────────────────────────────────
   ② 등불 게이지 — 시간을 "채운다"
   ───────────────────────────────────────────────────────────────────────────*/

/**
 * 드래그로 채우는 등불. 값이 오르면 심지가 밝아진다.
 *
 * **접근성**: `role="slider"` + 화살표/Home/End 키. 마우스가 없어도 조절된다.
 * 옆의 숫자 입력과 같은 상태를 보므로 둘 중 아무거나 써도 된다.
 */
export function LanternGauge({
  value,
  max,
  onChange,
  label,
  disabled
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  disabled?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const t = Math.max(0, Math.min(value / max, 1));

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      // 5분 단위로 떨어뜨린다 — 분 단위로 드래그하면 손이 떨려서 값이 안 잡힌다
      const raw = Math.max(0, Math.min(ratio, 1)) * max;
      onChange(Math.round(raw / 5) * 5);
    },
    [max, onChange]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (disabled || e.buttons === 0) return;
    setFromClientX(e.clientX);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const step = e.shiftKey ? 30 : 10;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(value + step, max));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(value - step, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div
      aria-disabled={disabled}
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
      aria-valuetext={`${value}분`}
      className="grid gap-1.5 select-none"
      onKeyDown={onKeyDown}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      style={{opacity: disabled ? 0.45 : 1}}
    >
      <div className="flex items-center justify-between text-xs text-[#64748b]">
        <span>{label}</span>
        <span className="font-bold text-[#b45309]">{value}분</span>
      </div>
      <div
        className="relative h-9 cursor-ew-resize overflow-hidden rounded-lg border border-[#e3e8ef] bg-[#f1f4f9]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        ref={trackRef}
      >
        {/* 채워진 만큼 등불빛 */}
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-150"
          style={{
            width: `${t * 100}%`,
            background:
              "linear-gradient(90deg, rgba(255,157,56,0.18), rgba(255,157,56,0.55))"
          }}
        />
        {/* 심지 — 값이 오를수록 밝고 커진다 */}
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full transition-all duration-150"
          style={{
            left: `calc(${t * 100}% - 6px)`,
            background: `rgba(255, 157, 56, ${0.35 + t * 0.65})`,
            boxShadow: `0 0 ${4 + t * 16}px rgba(255, 157, 56, ${
              0.3 + t * 0.6
            })`
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ③ 저장 = 도장
   ───────────────────────────────────────────────────────────────────────────*/

/**
 * 저장에 성공하면 장부에 도장이 쿵 찍힌다. `stampKey` 가 바뀔 때마다 다시 찍힌다.
 *
 * 화면을 덮지 않는다 — 저장 버튼 근처에 얹히고 1.6초 뒤 사라진다. 도구를 막으면 안 된다.
 */
export function SaveStamp({stampKey, date}: {stampKey: number; date: string}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!stampKey) return;
    setOn(true);
    const t = window.setTimeout(() => setOn(false), 1600);
    return () => window.clearTimeout(t);
  }, [stampKey]);

  if (!on) return null;
  const still = window.matchMedia(REDUCED).matches;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
    >
      <div
        style={{
          border: "3px solid rgba(180, 83, 9, 0.65)",
          borderRadius: 10,
          color: "rgba(180, 83, 9, 0.75)",
          padding: "10px 18px",
          fontWeight: 900,
          letterSpacing: "0.08em",
          transform: "rotate(-11deg)",
          animation: still
            ? undefined
            : "ledger-stamp 0.5s cubic-bezier(0.2,1.4,0.4,1)"
        }}
      >
        <div style={{fontSize: 18}}>기록 완료</div>
        <div style={{fontSize: 11, opacity: 0.75}}>{date}</div>
      </div>
      <style>{`@keyframes ledger-stamp{
        0%{transform:rotate(-11deg) scale(2.2);opacity:0}
        60%{opacity:1}
        100%{transform:rotate(-11deg) scale(1);opacity:1}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ④ 연속 기록 — 장부 가장자리의 도장 줄
   ───────────────────────────────────────────────────────────────────────────*/

/**
 * 최근 N일을 도장으로 늘어놓는다. **빈 날은 빈 칸으로 남긴다** — 안 채운 게
 * 눈에 보여야 연속 기록이 의미를 갖는다.
 */
export function StreakStamps({
  dates,
  days = 21
}: {
  /** 기록이 있는 날짜(YYYY-MM-DD) 집합 */
  dates: Set<string>;
  days?: number;
}) {
  const cells: {key: string; on: boolean; label: string}[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    cells.push({
      key,
      on: dates.has(key),
      label: `${d.getMonth() + 1}/${d.getDate()}`
    });
  }
  // 오늘부터 거슬러 올라가며 연속 일수
  let streak = 0;
  for (let i = cells.length - 1; i >= 0; i--) {
    if (!cells[i].on) break;
    streak += 1;
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-[#64748b]">최근 {days}일</span>
        <span className="text-xs text-[#64748b]">
          연속 <b className="text-[#b45309]">{streak}</b>일
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cells.map(c => (
          <span
            key={c.key}
            title={`${c.label}${c.on ? " · 기록 있음" : " · 비어 있음"}`}
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              display: "grid",
              placeItems: "center",
              fontSize: 9,
              fontWeight: 800,
              border: c.on
                ? "1.5px solid rgba(180,83,9,0.55)"
                : "1.5px dashed rgba(148,163,184,0.5)",
              color: c.on ? "rgba(180,83,9,0.8)" : "transparent",
              background: c.on ? "rgba(255,157,56,0.12)" : "transparent"
            }}
          >
            ✓
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ⑤ NPC 즉시 반응
   ───────────────────────────────────────────────────────────────────────────*/

const MOOD_TONE: Record<string, string> = {
  training: "#16a34a",
  proud: "#b45309",
  sleepy: "#94a3b8",
  busy: "#b45309",
  focused: "#0284c7",
  curious: "#7c3aed",
  calm: "#94a3b8"
};

/** 숫자를 만지면 담당 NPC 의 기분과 한 줄이 그 자리에서 바뀐다. */
export function NpcReactions({npcs}: {npcs: NpcPreview[]}) {
  return (
    <ul className="grid gap-2">
      {npcs.map(n => (
        <li
          className="flex items-start gap-2 rounded-lg border border-[#e3e8ef] bg-[#fbfcfe] px-3 py-2"
          key={n.id}
        >
          <span
            aria-hidden="true"
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors duration-300"
            style={{background: MOOD_TONE[n.mood] ?? "#94a3b8"}}
          />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <b className="text-sm">{n.name}</b>
              <span
                className="text-xs transition-colors duration-300"
                style={{color: MOOD_TONE[n.mood] ?? "#94a3b8"}}
              >
                {n.moodLabel}
              </span>
            </div>
            <p className="truncate text-xs text-[#64748b]">{n.line}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
