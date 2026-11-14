"use client";

/**
 * 누적 예상 제작 기간 — RPG 상점의 소지금처럼 선택할 때마다 굴러간다.
 * 늘면 주황, 줄면 초록으로 잠깐 물든다.
 *
 * 2026-10-18 까지는 금액 카운터(`EstimateTicker`)였다. 금액은 서버가 계속 계산해
 * 관리자 접수함에만 보이고, 손님 화면에는 **기간만** 남겼다. `estimate.min/max` 는
 * 여기서 읽지 않는다.
 *
 * `tone="light"` 는 흰 2D 데스크용(2026-11-14). 큰 카드는 오른쪽 패널, compact 는 휴대폰에서
 * 대화 위에 붙는 한 줄이다. 기본(dark)은 3D 공방 바닥 HUD 가 쓴다.
 */

import {useEffect, useRef, useState} from "react";

import type {EstimateRange} from "@/lib/commissionPricing";

const NOTE_SHORT = "참고 범위 · 확정 아님";

export function DurationTicker({
  estimate,
  compact = false,
  tone = "dark"
}: {
  estimate: EstimateRange | null;
  compact?: boolean;
  tone?: "dark" | "light";
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
    tint === "up" ? "#8b85f0" : tint === "down" ? "#7bd88f" : "#f5f6f8";

  if (tone === "light") {
    // 흰 바탕에서는 주황·초록을 한 단 어둡게(글자 대비 4.5:1)
    const ink =
      tint === "up" ? "#c2410c" : tint === "down" ? "#15803d" : undefined;
    if (compact) {
      return (
        <div className="cd-strip">
          <p className="cd-label">예상 제작 기간</p>
          <p
            key={key}
            className="intake-ticker text-[22px] font-black leading-none tabular-nums transition-colors duration-300"
            style={{color: ink}}
          >
            {estimate ? (
              <>
                {estimate.weeksMin}~{estimate.weeksMax}
                <small>주</small>
              </>
            ) : (
              <span className="cd-dim text-[13px] font-bold">
                고르면 잡혀요
              </span>
            )}
          </p>
        </div>
      );
    }
    return (
      <div className="cd-tile">
        <div className="flex items-baseline justify-between gap-2">
          <p className="cd-label">예상 제작 기간</p>
          <p className="cd-note text-[12px]">{NOTE_SHORT}</p>
        </div>
        {estimate ? (
          <p
            key={key}
            className="intake-ticker cd-big mt-2 transition-colors duration-300"
            style={{color: ink}}
          >
            {estimate.weeksMin}~{estimate.weeksMax}
            <small>주</small>
          </p>
        ) : (
          <p className="cd-note mt-2 font-bold">
            어떤 사이트인지 고르면 기간이 잡혀요
          </p>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] text-[#b4bac6]/70">예상 기간</span>
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
    <div className="rounded-xl border border-[#c3c0f7]/25 bg-white/[0.04] px-3.5 py-3">
      <div className="flex items-center justify-between">
        <p className="v-serif text-[12px] text-[#c3c0f7]">예상 제작 기간</p>
        <p className="text-[9px] text-[#b4bac6]/55">{NOTE_SHORT}</p>
      </div>
      <p
        key={key}
        className="intake-ticker mt-1 text-[20px] font-black tabular-nums transition-colors duration-300"
        style={{color}}
      >
        {estimate ? (
          <>
            {estimate.weeksMin} ~ {estimate.weeksMax}{" "}
            <span className="text-[12px] font-bold text-[#b4bac6]">주</span>
          </>
        ) : (
          <span className="text-[13px] font-bold text-[#b4bac6]/60">
            어떤 사이트인지 고르면 기간이 잡혀요
          </span>
        )}
      </p>
    </div>
  );
}
