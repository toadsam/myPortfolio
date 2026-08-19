"use client";

/**
 * 연속 기록 머리말 — 화면에서 제일 먼저 눈에 들어와야 하는 숫자.
 *
 * 규칙이 "빠지면 절반으로 깎임" 이라, 손해가 **얼마인지**를 보여주는 게
 * 0으로 리셋되는 것보다 오히려 압박이 된다. 오늘이 아직이면
 * "지금 채우면 N일" 이 아니라 **"내일 못 채우면 M일로 깎임"** 을 같이 적는다.
 */

import type {IslandHistoryRow} from "@/types/island";

export function StreakBanner({
  streak,
  best,
  cleared,
  history
}: {
  streak: number;
  best: number;
  cleared: boolean;
  history: IslandHistoryRow[];
}) {
  return (
    <div className="v-panel px-5 py-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[rgb(var(--v-moon)/0.7)]">
            연속 기록
          </p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <span
              className={`v-serif text-5xl leading-none ${
                cleared
                  ? "v-lantern-glow text-[rgb(var(--v-lantern))]"
                  : "text-[rgb(var(--v-gold))]"
              }`}
            >
              {streak}
            </span>
            <span className="text-sm text-[rgb(var(--v-moon))]">일</span>
          </p>
        </div>
        <div className="text-right text-[11px] leading-relaxed text-[rgb(var(--v-moon)/0.75)]">
          <p>최고 {best}일</p>
          {/* 깎이는 규칙이라 '잃을 것'을 명시한다 — 이게 이 화면의 동기 장치다. */}
          {streak > 0 ? <p>빠지면 {Math.floor(streak / 2)}일</p> : null}
        </div>
      </div>

      <GrassRow rows={history} />
    </div>
  );
}

/** 잔디밭 — 최근 며칠을 한 줄로. 4칸 중 몇 칸 채웠는지에 따라 밝기가 다르다. */
function GrassRow({rows}: {rows: IslandHistoryRow[]}) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-4 flex gap-[3px] overflow-x-auto pb-1">
      {rows.map(row => {
        // 0/4 는 거의 안 보이게, 4/4 는 랜턴색으로. 중간은 비율만큼.
        const ratio = row.done_count / 4;
        return (
          <span
            aria-hidden="true"
            // max-w 가 없으면 기록이 하루뿐인 날 칸 하나가 폭을 다 먹어서
            // 잔디밭이 아니라 '덜 찬 진행바'처럼 보인다.
            className="h-6 min-w-[8px] max-w-[16px] flex-1 rounded-sm"
            key={row.date}
            style={{
              background: row.cleared
                ? "rgb(var(--v-lantern))"
                : `rgb(var(--v-gold) / ${0.08 + ratio * 0.45})`
            }}
            title={`${row.date} — ${row.done_count}/4`}
          />
        );
      })}
    </div>
  );
}
