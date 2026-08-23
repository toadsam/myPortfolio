"use client";

/**
 * 누적 참고 견적 — RPG 상점의 소지금처럼 선택할 때마다 굴러간다.
 * 오르면 주황, 내리면 초록으로 잠깐 물든다. 금액 옆에는 **항상** 면책 문구가 붙는다.
 */

import {useEffect, useRef, useState} from "react";

import {formatMan, type EstimateRange} from "@/lib/commissionPricing";

const DISCLAIMER_SHORT = "참고 범위 · 확정 견적 아님";

export function EstimateTicker({
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
    if (estimate.max === before.max && estimate.min === before.min) return;
    setTint(estimate.max > before.max ? "up" : "down");
    setKey(k => k + 1);
    const timer = window.setTimeout(() => setTint(null), 900);
    return () => window.clearTimeout(timer);
  }, [estimate]);

  const color =
    tint === "up" ? "#ff9d38" : tint === "down" ? "#7bd88f" : "#f3e6c8";

  if (compact) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] text-[#a9bdd6]/70">참고 견적</span>
        <span
          key={key}
          className="intake-ticker text-[14px] font-black tabular-nums transition-colors"
          style={{color}}
        >
          {estimate
            ? `${formatMan(estimate.min)}~${formatMan(estimate.max)} 원`
            : "—"}
        </span>
        {estimate ? (
          <span className="text-[10px] text-[#a9bdd6]/70">
            {estimate.weeksMin}~{estimate.weeksMax}주
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e2c078]/25 bg-white/[0.04] px-3.5 py-3">
      <div className="flex items-center justify-between">
        <p className="v-serif text-[12px] text-[#e2c078]">참고 견적</p>
        <p className="text-[9px] text-[#a9bdd6]/55">{DISCLAIMER_SHORT}</p>
      </div>
      <p
        key={key}
        className="intake-ticker mt-1 text-[20px] font-black tabular-nums transition-colors duration-300"
        style={{color}}
      >
        {estimate ? (
          <>
            {formatMan(estimate.min)} ~ {formatMan(estimate.max)}{" "}
            <span className="text-[12px] font-bold text-[#a9bdd6]">원</span>
          </>
        ) : (
          <span className="text-[13px] font-bold text-[#a9bdd6]/60">
            어떤 사이트인지 고르면 숫자가 생겨요
          </span>
        )}
      </p>
      {estimate ? (
        <p className="mt-0.5 text-[11px] text-[#a9bdd6]">
          제작 기간 {estimate.weeksMin}~{estimate.weeksMax}주
        </p>
      ) : null}
    </div>
  );
}
