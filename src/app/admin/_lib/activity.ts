import type {ActivityInput, DailyActivity} from "@/types/live";

/* 날짜는 **로컬 기준** YYYY-MM-DD 로 만든다. 예전엔 `toISOString()` 으로 잘랐는데,
   그건 UTC 라서 한국(UTC+9)에서는 아침 9시 전의 "오늘"이 어제가 되고, 자정 기준
   Date 에 하루를 더해도 UTC 로는 같은 날이라 날짜 넘기기·연속 기록 세기가 하루씩
   어긋났다. 백엔드도 LOCAL_TIMEZONE 기준이다. */
function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function today(): string {
  return ymd(new Date());
}

export function addDays(date: string, delta: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return ymd(d);
}

export function prettyDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  const week = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${week})`;
}

export function activityRaw(a?: DailyActivity | null): number {
  if (!a) return 0;
  const projects = Object.values(a.project_minutes ?? {}).reduce(
    (sum, m) => sum + Number(m || 0),
    0
  );
  return (
    (a.study_minutes || 0) / 3 +
    (a.coding_minutes || 0) / 3 +
    (a.github_commits || 0) * 8 +
    (a.workout_done ? 20 : 0) +
    projects / 5
  );
}

export function activityLevel(a?: DailyActivity | null): number {
  const raw = activityRaw(a);
  if (raw <= 0) return 0;
  if (raw < 20) return 1;
  if (raw < 45) return 2;
  if (raw < 80) return 3;
  return 4;
}

/** 활동 달력의 농도 — 등불이 진해지는 계단. 예전엔 파란 잔디였다. */
export const LEVEL_BG = [
  "#232b34",
  "rgba(255,157,56,0.20)",
  "rgba(255,157,56,0.40)",
  "rgba(255,157,56,0.64)",
  "rgba(255,157,56,0.90)"
];

export interface DailyStats {
  recordStreak: number;
  workoutStreak: number;
  weekCoding: number;
}

export function computeStats(history: DailyActivity[]): DailyStats {
  const byDate: Record<string, DailyActivity> = {};
  for (const item of history) byDate[item.date] = item;

  const streak = (predicate: (a: DailyActivity) => boolean) => {
    let cursor = today();
    if (!byDate[cursor] || !predicate(byDate[cursor]))
      cursor = addDays(cursor, -1);
    let count = 0;
    while (byDate[cursor] && predicate(byDate[cursor])) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  };

  let weekCoding = 0;
  for (let i = 0; i < 7; i += 1) {
    const day = byDate[addDays(today(), -i)];
    if (day) weekCoding += day.coding_minutes || 0;
  }

  return {
    recordStreak: streak(a => activityRaw(a) > 0),
    workoutStreak: streak(a => a.workout_done),
    weekCoding
  };
}

export function normalizeForm(form: ActivityInput): ActivityInput {
  const projectMinutes: Record<string, number> = {};
  for (const [key, value] of Object.entries(form.project_minutes)) {
    const minutes = Math.max(0, Number(value || 0));
    if (minutes > 0) projectMinutes[key] = minutes;
  }

  return {
    ...form,
    github_repos: unique(form.github_repos),
    study_topics: unique(form.study_topics),
    studied_tech: unique(form.studied_tech),
    project_minutes: projectMinutes
  };
}

export function buildPredictedChanges(form: ActivityInput): string[] {
  const changes: string[] = [];

  if (form.workout_done && form.workout_minutes > 0) {
    changes.push(
      `중앙 광장과 가이드 NPC가 ${form.workout_type || "운동"} ${
        form.workout_minutes
      }분 기록으로 활기차집니다.`
    );
  }
  if (form.study_minutes > 0) {
    changes.push(
      `기술 스택 구역이 공부 ${form.study_minutes}분과 선택한 기술 주제에 따라 밝아집니다.`
    );
  }
  if (form.coding_minutes > 0) {
    changes.push(
      `코딩 ${form.coding_minutes}분이 개발자 NPC의 집중도와 마을 전체 활기에 반영됩니다.`
    );
  }

  const activeProjects = Object.entries(form.project_minutes).filter(
    ([, minutes]) => minutes > 0
  );
  if (activeProjects.length > 0) {
    changes.push(
      `작업한 프로젝트 ${activeProjects.length}개의 건물이 작업 시간에 따라 밝아집니다.`
    );
  }
  if (form.github_commits > 0 || form.github_repos.length > 0) {
    changes.push(
      `GitHub 커밋 ${form.github_commits}개와 repo 기록이 프로젝트 구역 에너지로 들어갑니다.`
    );
  }
  if (form.memo.trim()) {
    changes.push("오늘 메모가 경험 기록관과 NPC 상태 문구에 반영됩니다.");
  }

  return changes.length > 0
    ? changes
    : ["아직 기록이 없어 마을이 조용한 상태로 유지됩니다."];
}

export function toggleValue(items: string[], item: string): string[] {
  return items.includes(item)
    ? items.filter(value => value !== item)
    : [...items, item];
}

export function unique(items: string[]): string[] {
  return Array.from(new Set(items.map(item => item.trim()).filter(Boolean)));
}
