/**
 * 전력(kWh)과 등급 — 배전반의 게임 점수.
 *
 * **저장하는 값이 아니라 기록에서 계산하는 값이다.** 따로 점수를 쌓으면 기록을
 * 고쳐도 점수가 그대로 남아 둘이 어긋난다. 그래서 매번 지난 기록 전체에서 다시
 * 센다. 공식을 바꾸면 과거 등급도 같이 바뀌는데, 그게 맞다.
 *
 * 1분 = 1kWh 가 기본이고, 프로젝트는 코딩과 겹치기 쉬워서 0.8 배, 커밋은 개당 5,
 * 하루 목표 고리(운동 30 · 공부 60 · 코딩 120분)를 하나 채울 때마다 보너스 50.
 */
import type {ActivityInput} from "@/types/live";
import {DAILY_GOALS} from "./options";

type DayLike = Pick<
  ActivityInput,
  | "workout_done"
  | "workout_minutes"
  | "study_minutes"
  | "coding_minutes"
  | "project_minutes"
  | "github_commits"
>;

export const GOAL_BONUS = 50;

/** 등급 문턱. 앞쪽은 며칠이면 오르고 뒤로 갈수록 길어진다. */
const LEVEL_STEPS = [
  0, 300, 800, 1500, 2500, 4000, 6000, 8500, 11500, 15000, 20000, 26000, 33000,
  41000, 50000
];

export function goalsHit(day: DayLike) {
  return {
    workout:
      day.workout_done && (day.workout_minutes || 0) >= DAILY_GOALS.workout,
    study: (day.study_minutes || 0) >= DAILY_GOALS.study,
    coding: (day.coding_minutes || 0) >= DAILY_GOALS.coding
  };
}

export function dayKwh(day?: DayLike | null): number {
  if (!day) return 0;
  const projects = Object.values(day.project_minutes ?? {}).reduce(
    (sum, m) => sum + Number(m || 0),
    0
  );
  const hits = Object.values(goalsHit(day)).filter(Boolean).length;
  return Math.round(
    (day.workout_done ? day.workout_minutes || 0 : 0) +
      (day.study_minutes || 0) +
      (day.coding_minutes || 0) +
      projects * 0.8 +
      (day.github_commits || 0) * 5 +
      hits * GOAL_BONUS
  );
}

export interface PowerSummary {
  /** 저장된 기록 전체의 합 */
  total: number;
  level: number;
  /** 지금 등급의 시작 문턱 */
  floor: number;
  /** 다음 등급 문턱 (마지막 등급이면 floor 와 같다) */
  next: number;
}

export function powerSummary(history: DayLike[]): PowerSummary {
  const total = history.reduce((sum, day) => sum + dayKwh(day), 0);
  let level = 1;
  while (level < LEVEL_STEPS.length && total >= LEVEL_STEPS[level]!) level += 1;
  const floor = LEVEL_STEPS[level - 1]!;
  const next = LEVEL_STEPS[level] ?? floor;
  return {total, level, floor, next};
}
