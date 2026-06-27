import type {
  ActivityInput,
  DailyActivity,
  GithubSyncResponse,
  NpcChatResponse,
  NpcEncounterParticipant,
  NpcEncounterResponse,
  NpcTickRequest,
  NpcTickResponse,
  VillageState
} from "@/types/live";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, detail?: string) {
    super(detail ? `API request failed: ${detail}` : `API request failed: ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
    throw new ApiError(response.status, detail);
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
    body: JSON.stringify(payload)
  });
}

export function syncGithubActivity(): Promise<GithubSyncResponse> {
  return requestJson<GithubSyncResponse>("/github/sync", {
    method: "POST"
  });
}

export function sendNpcMessage(
  npcId: string,
  message: string,
  recentMessages: string[] = []
): Promise<NpcChatResponse> {
  return requestJson<NpcChatResponse>("/npc/chat", {
    method: "POST",
    body: JSON.stringify({npc_id: npcId, message, recent_messages: recentMessages.slice(-8)})
  });
}

export function requestNpcTick(payload: NpcTickRequest): Promise<NpcTickResponse> {
  return requestJson<NpcTickResponse>("/npc/tick", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function requestNpcEncounter(
  npcA: NpcEncounterParticipant,
  npcB: NpcEncounterParticipant,
  recentMemory: string[]
): Promise<NpcEncounterResponse> {
  return requestJson<NpcEncounterResponse>("/npc/encounter", {
    method: "POST",
    body: JSON.stringify({npc_a: npcA, npc_b: npcB, recent_memory: recentMemory})
  });
}
