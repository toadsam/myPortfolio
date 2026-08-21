"use client";

/**
 * 배전반 계기들 — 관리자 화면을 "입력 폼"에서 "조작하는 배전반"으로 바꾸는 네 가지.
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

import {useEffect, useState} from "react";
import type {NpcPreview} from "@/lib/villageLightPreview";

const REDUCED = "(prefers-reduced-motion: reduce)";

/* ─────────────────────────────────────────────────────────────────────────────
   ③ 저장 = 도장
   ───────────────────────────────────────────────────────────────────────────*/

/**
 * 저장에 성공하면 계기판에 기록 도장이 찍힌다. `stampKey` 가 바뀔 때마다 다시 찍힌다.
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
          border: "3px solid rgba(255, 157, 56, 0.65)",
          borderRadius: 10,
          color: "rgba(255, 157, 56, 0.75)",
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
   ④ 연속 기록 — 계기 레일의 통전 기록
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
        <span className="text-xs text-[#8b94a0]">최근 {days}일</span>
        <span className="text-xs text-[#8b94a0]">
          연속 <b className="text-[#ff9d38]">{streak}</b>일
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
                ? "1.5px solid rgba(255,157,56,0.55)"
                : "1.5px dashed rgba(107,117,128,0.55)",
              color: c.on ? "rgba(255,157,56,0.8)" : "transparent",
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
  training: "#6fae6a",
  proud: "#ff9d38",
  sleepy: "#6b7580",
  busy: "#ff9d38",
  focused: "#ff9d38",
  curious: "#9b8ac4",
  calm: "#6b7580"
};

/** 숫자를 만지면 담당 NPC 의 기분과 한 줄이 그 자리에서 바뀐다. */
export function NpcReactions({npcs}: {npcs: NpcPreview[]}) {
  return (
    <ul className="grid gap-2">
      {npcs.map(n => (
        <li
          // min-w-0 이 li 에도 있어야 한다 — 안쪽 truncate 는 줄바꿈 금지라
          // 그 최소 폭이 그대로 부모의 최소 폭이 되고, 좁은 화면에서 패널을
          // 밀어내 페이지에 가로 스크롤이 생긴다.
          className="flex min-w-0 items-start gap-2 rounded-lg border border-[#38414d] bg-[#1a2027] px-3 py-2"
          key={n.id}
        >
          <span
            aria-hidden="true"
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors duration-300"
            style={{background: MOOD_TONE[n.mood] ?? "#6b7580"}}
          />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <b className="text-sm">{n.name}</b>
              <span
                className="text-xs transition-colors duration-300"
                style={{color: MOOD_TONE[n.mood] ?? "#6b7580"}}
              >
                {n.moodLabel}
              </span>
            </div>
            <p className="truncate text-xs text-[#8b94a0]">{n.line}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
