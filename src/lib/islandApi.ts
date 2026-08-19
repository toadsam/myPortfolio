/**
 * 갓생 섬(/island) 전용 API.
 *
 * `liveApi.ts` 와 나눠 둔 이유는 두 가지다:
 *   ① `/island/*` 는 전부 로그인 뒤에 있다. 공개 라우트와 한 파일에 섞어 두면
 *      어느 게 손님에게 보이는 건지 읽는 사람이 매번 확인해야 한다.
 *   ② `/island` 라우트는 마을 번들을 안 받는 게 목적이라, 의존성을 얕게 유지한다.
 *
 * 다만 **토큰 저장은 liveApi 한 곳에서만** 한다(localStorage 키가 둘이 되면
 * 관리자 페이지에서 로그인해도 섬은 로그아웃 상태가 되는 식으로 어긋난다).
 */

import {getAdminToken} from "@/lib/liveApi";
import type {
  CoachMessage,
  CodingTestQuestInput,
  IslandHistoryRow,
  IslandRefresh,
  IslandToday,
  NotionQuestInput,
  WorkoutQuestInput
} from "@/types/island";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class IslandApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, detail?: string) {
    super(detail ?? `요청이 실패했어요 (${status})`);
    this.status = status;
    this.detail = detail;
  }

  /** 403 = ADMIN_PASSWORD 미설정(서버가 섬 자체를 잠근 상태). 401 = 로그인 필요. */
  get isLocked(): boolean {
    return this.status === 403;
  }

  get needsLogin(): boolean {
    return this.status === 401;
  }

  /**
   * 404 = 서버는 살아 있는데 `/island/*` 라우트를 모르는 상태 = **옛 코드로 돌고 있다.**
   *
   * 이걸 따로 안 잡으면 "백엔드에 닿지 못했어요, 서버를 켜세요" 로 떨어지는데,
   * 서버는 멀쩡히 켜져 있으므로 아무리 다시 켜도 같은 화면만 본다. 실제로 한 번
   * 헤맸다 — 고쳐야 할 건 '켜기'가 아니라 '**껐다 다시 켜기**'다.
   */
  get isStaleServer(): boolean {
    return this.status === 404;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? {"X-Admin-Token": token} : {}),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = (await response.json()) as {detail?: unknown};
      detail = typeof body.detail === "string" ? body.detail : undefined;
    } catch {
      detail = response.statusText;
    }
    throw new IslandApiError(response.status, detail);
  }

  return response.json() as Promise<T>;
}

export function fetchIslandToday(): Promise<IslandToday> {
  return requestJson<IslandToday>("/island/today");
}

export function fetchIslandHistory(days = 30): Promise<IslandHistoryRow[]> {
  return requestJson<IslandHistoryRow[]>(`/island/history?days=${days}`);
}

// 아래 셋은 전부 갱신된 '오늘'을 그대로 돌려준다 — 저장하고 나서 따로 다시
// 불러올 필요가 없다(모바일에서 왕복 한 번이 곧 체감 지연이다).

export function saveWorkoutQuest(
  payload: WorkoutQuestInput
): Promise<IslandToday> {
  return requestJson<IslandToday>("/island/quest/workout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function saveNotionQuest(
  payload: NotionQuestInput
): Promise<IslandToday> {
  return requestJson<IslandToday>("/island/quest/notion", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function saveCodingMinutes(minutes: number): Promise<IslandToday> {
  return requestJson<IslandToday>("/island/quest/coding", {
    method: "POST",
    body: JSON.stringify({minutes})
  });
}

/**
 * 섬에 들어올 때 자동으로 채울 수 있는 것들을 채운다(깃허브 커밋 등).
 *
 * **실패해도 화면을 막지 않는다.** 이 호출이 안 되더라도 손으로 찍는 길은
 * 그대로 열려 있어야 하므로, 부르는 쪽에서 catch 로 삼킨다.
 */
export function refreshIsland(): Promise<IslandRefresh> {
  return requestJson<IslandRefresh>("/island/refresh", {method: "POST"});
}

/** 코테 기록 — 링크만 넘기면 제목·플랫폼·문제번호를 서버가 채운다. */
export function saveCodingTestQuest(
  payload: CodingTestQuestInput
): Promise<IslandToday> {
  return requestJson<IslandToday>("/island/quest/coding-test", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/** 오늘의 브리핑. 하루 한 번 만들어져 그날은 같은 말이 온다. */
export function fetchCoachBriefing(): Promise<CoachMessage> {
  return requestJson<CoachMessage>("/island/coach");
}

export function sendCoachMessage(message: string): Promise<CoachMessage> {
  return requestJson<CoachMessage>("/island/coach/chat", {
    method: "POST",
    body: JSON.stringify({message})
  });
}
