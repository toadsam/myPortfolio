/** 갓생 섬(/island) 타입 — 백엔드 `schemas.py` 의 Island* 스키마와 1:1. */

export type QuestId = "workout" | "coding-test" | "coding" | "notion";

export interface Quest {
  id: QuestId;
  label: string;
  done: boolean;
  /** 무엇으로 채워졌는지 한 줄 ("헬스 40분", "커밋 3개") */
  detail: string;
}

export interface IslandToday {
  date: string;
  opened_on: string;
  cleared: boolean;
  streak: number;
  best_streak: number;
  quests: Quest[];
}

export interface IslandHistoryRow {
  date: string;
  cleared: boolean;
  done_count: number;
}

export interface WorkoutQuestInput {
  done: boolean;
  minutes?: number;
  workout_type?: string;
}

export interface NotionQuestInput {
  /** 비우면 취소 — 잘못 누른 걸 되돌릴 수 있어야 한다. */
  url: string;
  title?: string;
}

export interface CodingTestQuestInput {
  /** 링크 하나만 있어도 된다 — 제목은 서버가 긁어서 채운다. */
  url: string;
  platform?: string;
  title?: string;
}

export interface IslandRefresh {
  today: IslandToday;
  /** 자동으로 채워진 것들 ("깃허브 커밋 3개") */
  filled: string[];
  /** 왜 자동 조회가 안 됐는지 — 오류가 아니라 안내 */
  notes: string[];
}

export interface CoachMessage {
  message: string;
  /** AI가 쓴 말인지 규칙 기반인지 — 키를 넣었는데 false면 뭔가 잘못된 것 */
  from_ai: boolean;
}
