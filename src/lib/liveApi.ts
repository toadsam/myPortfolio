import type {
  ActivityInput,
  AdminOverview,
  AnalyticsSummary,
  CodingTestInput,
  CodingTestLog,
  CsNote,
  CsNoteInput,
  DailyActivity,
  GithubSyncResponse,
  ManagedProject,
  ManagedProjectInput,
  NpcChatResponse,
  NpcConversationLog,
  NpcEncounterParticipant,
  NpcEncounterResponse,
  NpcGroupChatResponse,
  NpcPreset,
  NpcPresetInput,
  NpcTickRequest,
  NpcTickResponse,
  VillageBuildingOverride,
  VillageBuildingOverrideInput,
  VillageState,
  VisitorEvent,
  VisitorEventInput
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

export function fetchActivityHistory(days = 120): Promise<DailyActivity[]> {
  return requestJson<DailyActivity[]>(`/activity/history?days=${days}`, {cache: "no-store"});
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

export function requestGroupChat(npcIds: string[], recentMemory: string[] = []): Promise<NpcGroupChatResponse> {
  return requestJson<NpcGroupChatResponse>("/npc/group-chat", {
    method: "POST",
    body: JSON.stringify({npc_ids: npcIds, recent_memory: recentMemory.slice(-6)})
  });
}

export function logVisitorEvent(payload: VisitorEventInput): Promise<VisitorEvent> {
  return requestJson<VisitorEvent>("/analytics/event", {
    method: "POST",
    body: JSON.stringify({
      event_type: payload.event_type,
      target_id: payload.target_id ?? "",
      label: payload.label ?? "",
      session_id: payload.session_id ?? getVisitorSessionId(),
      metadata: payload.metadata ?? {}
    })
  });
}

export function trackVisitorEvent(payload: VisitorEventInput): void {
  void logVisitorEvent(payload).catch(() => undefined);
}

export function fetchAdminOverview(): Promise<AdminOverview> {
  return requestJson<AdminOverview>("/admin/overview", {cache: "no-store"});
}

export function fetchAdminAnalytics(): Promise<AnalyticsSummary> {
  return requestJson<AnalyticsSummary>("/admin/analytics", {cache: "no-store"});
}

export function fetchManagedProjects(): Promise<ManagedProject[]> {
  return requestJson<ManagedProject[]>("/admin/projects", {cache: "no-store"});
}

export function updateManagedProject(projectId: string, payload: ManagedProjectInput): Promise<ManagedProject> {
  return requestJson<ManagedProject>(`/admin/projects/${encodeURIComponent(projectId)}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function fetchNpcLogs(): Promise<NpcConversationLog[]> {
  return requestJson<NpcConversationLog[]>("/admin/npc/logs", {cache: "no-store"});
}

export function fetchNpcPresets(): Promise<NpcPreset[]> {
  return requestJson<NpcPreset[]>("/npc/presets", {cache: "no-store"});
}

export function updateNpcPreset(npcId: string, payload: NpcPresetInput): Promise<NpcPreset> {
  return requestJson<NpcPreset>(`/admin/npc/presets/${encodeURIComponent(npcId)}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function fetchVillageOverrides(): Promise<VillageBuildingOverride[]> {
  return requestJson<VillageBuildingOverride[]>("/admin/village/overrides", {cache: "no-store"});
}

export function updateVillageOverride(
  buildingId: string,
  payload: VillageBuildingOverrideInput
): Promise<VillageBuildingOverride> {
  return requestJson<VillageBuildingOverride>(`/admin/village/overrides/${encodeURIComponent(buildingId)}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function fetchCodingTests(): Promise<CodingTestLog[]> {
  return requestJson<CodingTestLog[]>("/coding-tests", {cache: "no-store"});
}

export function createCodingTest(payload: CodingTestInput): Promise<CodingTestLog> {
  return requestJson<CodingTestLog>("/admin/coding-tests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCodingTest(logId: number, payload: CodingTestInput): Promise<CodingTestLog> {
  return requestJson<CodingTestLog>(`/admin/coding-tests/${logId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteCodingTest(logId: number): Promise<{ok: boolean}> {
  return requestJson<{ok: boolean}>(`/admin/coding-tests/${logId}`, {method: "DELETE"});
}

export function fetchCsNotes(): Promise<CsNote[]> {
  return requestJson<CsNote[]>("/cs-notes", {cache: "no-store"});
}

export function createCsNote(payload: CsNoteInput): Promise<CsNote> {
  return requestJson<CsNote>("/admin/cs-notes", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCsNote(noteId: number, payload: CsNoteInput): Promise<CsNote> {
  return requestJson<CsNote>(`/admin/cs-notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteCsNote(noteId: number): Promise<{ok: boolean}> {
  return requestJson<{ok: boolean}>(`/admin/cs-notes/${noteId}`, {method: "DELETE"});
}

export function getVisitorSessionId(): string {
  if (typeof window === "undefined") return "";

  const key = "portfolio-village-session-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, next);
  return next;
}
