"use client";

/**
 * 누적 예상 제작 기간 — RPG 상점의 소지금처럼 선택할 때마다 굴러간다.
 * 늘면 주황, 줄면 초록으로 잠깐 물든다.
 *
 * 2026-10-18 까지는 금액 카운터(`EstimateTicker`)였다. 금액은 서버가 계속 계산해
 * 관리자 접수함에만 보이고, 손님 화면에는 **기간만** 남겼다. `estimate.min/max` 는
 * 여기서 읽지 않는다.
 */

import {useEffect, useRef, useState} from "react";

import type {EstimateRange} from "@/lib/commissionPricing";

const NOTE_SHORT = "참고 범위 · 확정 아님";

export function DurationTicker({
  estimate,
  compact = false
}: {
  estimate: EstimateRange | null;
  compact?: boolean;
}) {
  const prev = useRef<EstimateRange | null>(null);
  const [tint, setTint] = useState<"up" | "down" | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const before = prev.current;
    prev.current = estimate;
    if (!estimate || !before) return;
    if (
      estimate.weeksMax === before.weeksMax &&
      estimate.weeksMin === before.weeksMin
    )
      return;
    setTint(estimate.weeksMax > before.weeksMax ? "up" : "down");
    setKey(k => k + 1);
    const timer = window.setTimeout(() => setTint(null), 900);
    return () => window.clearTimeout(timer);
  }, [estimate]);

  const color =
    tint === "up" ? "#ff9d38" : tint === "down" ? "#7bd88f" : "#f3e6c8";

  if (compact) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] text-[#a9bdd6]/70">예상 기간</span>
        <span
          key={key}
          className="intake-ticker text-[14px] font-black tabular-nums transition-colors"
          style={{color}}
        >
          {estimate ? `${estimate.weeksMin}~${estimate.weeksMax}주` : "—"}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e2c078]/25 bg-white/[0.04] px-3.5 py-3">
      <div className="flex items-center justify-between">
        <p className="v-serif text-[12px] text-[#e2c078]">예상 제작 기간</p>
        <p className="text-[9px] text-[#a9bdd6]/55">{NOTE_SHORT}</p>
      </div>
      <p
        key={key}
        className="intake-ticker mt-1 text-[20px] font-black tabular-nums transition-colors duration-300"
        style={{color}}
      >
        {estimate ? (
          <>
            {estimate.weeksMin} ~ {estimate.weeksMax}{" "}
            <span className="text-[12px] font-bold text-[#a9bdd6]">주</span>
          </>
        ) : (
          <span className="text-[13px] font-bold text-[#a9bdd6]/60">
            어떤 사이트인지 고르면 기간이 잡혀요
          </span>
        )}
      </p>
    </div>
  );
}
