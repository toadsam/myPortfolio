/**
 * 릴레이 설문의 실시간 참고 견적 — 백엔드 `_baseline_estimate()` 의 거울.
 *
 * 규칙표(`CommissionPricing`)는 서버에서 받아 온다. 여기서는 **같은 공식**으로 숫자를
 * 굴려 선택지 옆에 "+30~80만 원" 을 붙이고 누적 견적 카운터를 움직일 뿐이다.
 * 화면 숫자는 참고이고, 매 문항 뒤 `POST /commission/estimate` 가 준 서버값이 덮는다.
 * 표가 없으면(요청 실패) 가격표 없이 설문만 진행된다 — 접수는 막히지 않는다.
 */

import type {CommissionDraft, CommissionPricing} from "@/types/live";

export interface EstimateRange {
  min: number;
  max: number;
  weeksMin: number;
  weeksMax: number;
}

export function emptyCommissionDraft(): CommissionDraft {
  return {
    site_type: "",
    summary: "",
    pages: [],
    features: [],
    tone: "",
    references: [],
    budget_hint: "",
    deadline_hint: "",
    estimate_min: 0,
    estimate_max: 0,
    weeks_min: 0,
    weeks_max: 0,
    estimate_reason: "",
    who_updates: "",
    content_owner: "",
    success_metric: "",
    existing_assets: "",
    dislikes: [],
    reference_notes: "",
    decision_maker: "",
    planner_questions: [],
    missing: [],
    ready_to_submit: false,
    depth_missing: [],
    depth_done: false
  };
}

export function estimateFromPricing(
  pricing: CommissionPricing,
  siteType: string,
  pages: string[],
  features: string[]
): EstimateRange {
  const base = pricing.base_by_type[siteType] ?? pricing.default_base;
  let min = base.min;
  let max = base.max;
  const weeksMin = base.weeks_min;
  let weeksMax = base.weeks_max;

  const extraPages = Math.max(0, pages.length - pricing.page_free);
  if (extraPages) {
    min += extraPages * pricing.page_add_min;
    max += extraPages * pricing.page_add_max;
    weeksMax += Math.floor((extraPages + 2) / 3);
  }

  const joined = features.join(" ").toLowerCase();
  for (const [keyword, weight] of Object.entries(pricing.feature_weights)) {
    if (joined.includes(keyword)) {
      min += weight.min;
      max += weight.max;
      weeksMax += weight.weeks;
    }
  }

  return {min, max, weeksMin, weeksMax};
}

export function estimateForDraft(
  pricing: CommissionPricing,
  draft: CommissionDraft
): EstimateRange {
  return estimateFromPricing(
    pricing,
    draft.site_type,
    draft.pages,
    draft.features
  );
}

/** 기능 키워드 하나의 가산치. 표에 없으면 null(가격표 없이 보여준다). */
export function featureWeight(
  pricing: CommissionPricing | null,
  keyword: string
): {min: number; max: number; weeks: number} | null {
  if (!pricing) return null;
  return pricing.feature_weights[keyword] ?? null;
}

/** 가장 비싼 기능 하나 — 예산이 모자랄 때 도안이 "이걸 2차로 미루면" 하고 짚는다. */
export function mostExpensiveFeature(
  pricing: CommissionPricing,
  features: string[]
): string | null {
  let best: string | null = null;
  let bestMax = 0;
  const joined = features.join(" ").toLowerCase();
  for (const [keyword, weight] of Object.entries(pricing.feature_weights)) {
    if (joined.includes(keyword) && weight.max > bestMax) {
      best = keyword;
      bestMax = weight.max;
    }
  }
  return best;
}

/** 원 → "150만" / "1.2억". 0 이면 "-". */
export function formatMan(value: number): string {
  if (!value) return "-";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  return `${Math.round(value / 10_000).toLocaleString()}만`;
}

/** "+40~100만 원" 꼴의 가격 꼬리표. 둘 다 0 이면 "추가 비용 없음". */
export function priceTag(min: number, max: number): string {
  if (!min && !max) return "추가 비용 없음";
  return `+${formatMan(min)}~${formatMan(max)} 원`;
}
