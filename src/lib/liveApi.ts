import type {ActivityInput, DailyActivity, NpcChatResponse, VillageState} from "@/types/live";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchVillageState(): Promise<VillageState> {
  return requestJson<VillageState>("/village-state", {cache: "no-store"});
}

export function fetchTodayActivity(): Promise<DailyActivity> {
  return requestJson<DailyActivity>("/activity/today", {cache: "no-store"});
}

export function saveActivity(payload: ActivityInput): Promise<DailyActivity> {
  return requestJson<DailyActivity>("/activity", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function syncGithubActivity(): Promise<{commits: number; updated_activity: DailyActivity; username: string}> {
  return requestJson<{commits: number; updated_activity: DailyActivity; username: string}>("/github/sync", {
    method: "POST",
  });
}

export function sendNpcMessage(npcId: string, message: string): Promise<NpcChatResponse> {
  return requestJson<NpcChatResponse>("/npc/chat", {
    method: "POST",
    body: JSON.stringify({npc_id: npcId, message}),
  });
}
