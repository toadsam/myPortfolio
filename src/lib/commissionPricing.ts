/**
 * 릴레이 설문의 실시간 참고치 — 백엔드 `_baseline_estimate()` 의 거울.
 *
 * 규칙표(`CommissionPricing`)는 서버에서 받아 온다. 여기서는 **같은 공식**으로 숫자를
 * 굴리되, 손님 화면에는 **제작 기간(주)만** 보여준다 (2026-10-18). 금액 칸(`min`/`max`)은
 * 서버가 draft 에 채워 접수와 함께 관리자에게 가고, 화면 어디에도 찍지 않는다 —
 * 채용 심사자가 보는 사이트에 "AI 견적 창구"가 보이면 기술과 무관한 감점이라 뺐다.
 * 표가 없으면(요청 실패) 기간 꼬리표 없이 설문만 진행된다 — 접수는 막히지 않는다.
 */

import type {CommissionDraft, CommissionPricing} from "@/types/live";

export interface EstimateRange {
  /** 원 단위. 관리자 참고용 — 손님 화면에는 찍지 않는다 */
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

/** 기능 키워드 하나의 가산치. 표에 없으면 null(꼬리표 없이 보여준다). */
export function featureWeight(
  pricing: CommissionPricing | null,
  keyword: string
): {min: number; max: number; weeks: number} | null {
  if (!pricing) return null;
  return pricing.feature_weights[keyword] ?? null;
}

/** "+1주" 꼴의 기간 꼬리표. 0 이면 null(꼬리표 없음). */
export function weeksTag(weeks: number): string | null {
  if (!weeks) return null;
  return `+${weeks}주`;
}
