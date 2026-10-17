/* 서랍 안 옛 패널과 기록실이 같이 쓰는 작은 부품들. page.tsx 가 3,000줄이던 때 맨 아래 있던 것을 옮겼다. */

import type * as React from "react";
import type {AiUsage, DailyActivity} from "@/types/live";

import {LEVEL_BG, activityLevel, addDays, today} from "../_lib/activity";

export function LabeledField({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export function ActivityCalendar({
  byDate,
  selectedDate,
  onPick
}: {
  byDate: Record<string, DailyActivity>;
  selectedDate: string;
  onPick: (date: string) => void;
}) {
  const weeks = 16;
  const totalDays = weeks * 7;
  const days: string[] = [];
  for (let i = totalDays - 1; i >= 0; i -= 1) days.push(addDays(today(), -i));

  const leadPad = new Date(days[0] + "T00:00:00").getDay(); // 첫 날 요일만큼 앞 패딩
  const cells: (string | null)[] = [...Array(leadPad).fill(null), ...days];
  const columns: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {columns.map((col, ci) => (
          <div className="flex flex-col gap-[3px]" key={ci}>
            {col.map((date, ri) => {
              if (!date) return <span className="h-3 w-3" key={ri} />;
              const level = activityLevel(byDate[date]);
              const selected = date === selectedDate;
              return (
                <button
                  key={date}
                  type="button"
                  title={`${date} · ${
                    byDate[date] ? "기록 있음" : "기록 없음"
                  }`}
                  onClick={() => onPick(date)}
                  className="h-3 w-3 rounded-[3px] transition hover:scale-125"
                  style={{
                    background: LEVEL_BG[level],
                    outline: selected ? "1.5px solid #ff9d38" : "none",
                    outlineOffset: selected ? "1px" : undefined
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 font-mono text-[10px] text-[#6b7580]">
        <span>적음</span>
        {LEVEL_BG.map((bg, i) => (
          <span
            className="h-2.5 w-2.5 rounded-[2px]"
            key={i}
            style={{background: bg}}
          />
        ))}
        <span>많음</span>
      </div>
    </div>
  );
}

/**
 * 배전반의 한 판. `lever` 를 주면 그 판은 **회로**가 되고, `live` 인 동안 왼쪽
 * 모선에 전기가 흐른다(admin.css 의 `.sw-circuit.is-live::before`).
 *
 * `live` 는 따로 저장하는 상태가 아니라 **값에서 파생**된다 — 숫자가 0 이면 꺼지고
 * 값이 들어가면 켜진다. 그래야 화면이 거짓말을 하지 않는다.
 */
export function Panel({
  children,
  kicker,
  lever,
  live,
  title
}: {
  children: React.ReactNode;
  kicker: string;
  lever?: React.ReactNode;
  live?: boolean;
  title: string;
}) {
  return (
    <section
      className={`sw-circuit${
        live ? " is-live" : ""
      } rounded-lg border border-[#38414d] bg-[#1a2027] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.45)]`}
    >
      <div className="flex items-start gap-4">
        {lever ?? null}
        <div className="min-w-0">
          <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff9d38]">
            {kicker}
          </p>
          <h2 className="mt-2 text-xl font-black">{title}</h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AiUsageBar({usage}: {usage: AiUsage}) {
  const ratio =
    usage.daily_limit > 0 ? usage.today_count / usage.daily_limit : 0;
  const color = ratio >= 0.9 ? "#b03a24" : ratio >= 0.6 ? "#e2c078" : "#ff9d38";
  return (
    <div className="rounded-lg border border-[#38414d] bg-[#232b34] p-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#6b7580]">
          오늘 AI 호출
        </p>
        <p className="font-mono text-xs font-black" style={{color}}>
          {usage.today_count} / {usage.daily_limit}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#38414d]">
        <div
          className="h-full rounded-full transition-[width]"
          style={{width: `${Math.min(100, ratio * 100)}%`, background: color}}
        />
      </div>
    </div>
  );
}
