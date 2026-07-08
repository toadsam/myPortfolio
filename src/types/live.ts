export type LightLevel = "dark" | "dim" | "normal" | "bright";
export type NpcMood = "sleepy" | "calm" | "busy" | "proud" | "training" | "curious" | "focused" | "worried" | "excited";
export type NpcActionSource = "chat" | "tick" | "encounter" | "manual";
export type NpcAnimationKey = "wave" | "point" | "think" | "type" | "send" | "walk-to-building" | "open-hologram";

export interface NpcSuggestedAction {
  npc_id: string;
  action_id: string;
  label: string;
  description: string;
  status_text: string;
  animation_key: NpcAnimationKey;
  duration_ms: number;
  target_id?: string | null;
  source: NpcActionSource;
}

export interface NpcActionState {
  npcId: string;
  actionId: string;
  label: string;
  description: string;
  statusText: string;
  animationKey: NpcAnimationKey;
  startedAt: number;
  durationMs: number;
  targetId?: string;
  source: NpcActionSource;
}

export interface NpcActionDefinition {
  id: string;
  npcId: string;
  label: string;
  description: string;
  triggerKeywords: string[];
  preferredMoods: NpcMood[];
  animationKey: NpcAnimationKey;
  targetId?: string;
  durationMs: number;
}

export interface DailyActivity {
  id: number;
  date: string;
  github_commits: number;
  github_repos: string[];
  study_minutes: number;
  study_topics: string[];
  studied_tech: string[];
  coding_minutes: number;
  project_minutes: Record<string, number>;
  workout_done: boolean;
  workout_minutes: number;
  workout_type: string;
  focus_score: number;
  memo: string;
  mood: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityInput {
  date?: string;
  github_commits: number;
  github_repos: string[];
  study_minutes: number;
  study_topics: string[];
  studied_tech: string[];
  coding_minutes: number;
  project_minutes: Record<string, number>;
  workout_done: boolean;
  workout_minutes: number;
  workout_type: string;
  focus_score: number;
  memo: string;
  mood: string;
}

export interface BuildingState {
  building_id: string;
  light_level: LightLevel;
  activity_score: number;
  reason: string;
}

export interface NpcState {
  npc_id: string;
  mood: NpcMood;
  status_text: string;
}

export interface NpcRuntimeState {
  mood: NpcMood;
  energy: number;
  bubbleText?: string;
  bubbleExpiresAt?: number;
  memory?: string;
  nextGoal?: string;
  currentAction?: NpcActionState;
  recentActions?: NpcActionState[];
  /** NPC끼리 대화 중 마주볼 상대 위치 */
  facePoint?: [number, number, number];
  /** 이 시각까지 멈춰서 마주봄 (NPC 간 대화) */
  holdUntil?: number;
  /** 무료 이모트(이모지) — 근접 시 손인사 등 */
  emote?: string;
  emoteExpiresAt?: number;
}

export interface VillageState {
  activity: DailyActivity;
  buildings: BuildingState[];
  npcs: NpcState[];
  unlocked_items: string[];
  summary: string;
}

export interface NpcChatResponse {
  npc_id: string;
  reply: string;
  used_ai: boolean;
  suggested_action?: NpcSuggestedAction | null;
}

export interface NpcTickRequest {
  npc_id: string;
  mood: NpcMood;
  energy: number;
  assigned_building_id?: string;
  nearby_npc_ids: string[];
  recent_memory: string[];
}

export interface NpcTickResponse {
  npc_id: string;
  bubble_text: string;
  mood: NpcMood;
  energy: number;
  next_goal: string;
  memory: string;
  used_ai: boolean;
  cooldown_seconds: number;
  suggested_action?: NpcSuggestedAction | null;
}

export interface NpcEncounterParticipant {
  npc_id: string;
  mood: NpcMood;
  energy: number;
  assigned_building_id?: string;
  recent_memory?: string[];
}

export interface NpcRelationshipRow {
  npc_a: string;
  npc_b: string;
  affinity: number;
  vibe: string;
  meet_count: number;
}

export interface NpcRelationshipChange {
  npc_a: string;
  npc_b: string;
  affinity: number;
  vibe: string;
  delta: number;
  event: string;
  milestone?: string;
}

export interface NpcEncounterResponse {
  dialogue: Array<{npc_id: string; text: string}>;
  state_changes: Array<{npc_id: string; mood: NpcMood; energy: number}>;
  memory: string;
  used_ai: boolean;
  cooldown_seconds: number;
  suggested_actions: NpcSuggestedAction[];
  relationship?: NpcRelationshipChange | null;
}

export interface NpcGroupChatResponse {
  dialogue: Array<{npc_id: string; text: string}>;
  used_ai: boolean;
  cooldown_seconds: number;
}

export interface GithubSyncResponse {
  commits: number;
  updated_activity: DailyActivity;
  username: string;
  warning?: string | null;
}

export interface VisitorEventInput {
  event_type: string;
  target_id?: string;
  label?: string;
  session_id?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface VisitorEvent {
  id: number;
  event_type: string;
  target_id: string;
  label: string;
  session_id: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsMetric {
  label: string;
  value: number;
}

export interface AnalyticsSummary {
  total_events: number;
  unique_sessions: number;
  npc_messages: number;
  project_views: number;
  contact_clicks: number;
  top_events: AnalyticsMetric[];
  top_projects: AnalyticsMetric[];
  top_npcs: AnalyticsMetric[];
  recent_events: VisitorEvent[];
}

export interface ManagedProject {
  id: string;
  title: string;
  summary: string;
  role: string;
  tech: string[];
  priority: number;
  featured: boolean;
  visible: boolean;
  admin_note: string;
  updated_at: string;
}

export interface ManagedProjectInput {
  title: string;
  summary: string;
  role: string;
  tech: string[];
  priority: number;
  featured: boolean;
  visible: boolean;
  admin_note: string;
}

export interface NpcConversationLog {
  id: number;
  npc_id: string;
  visitor_message: string;
  npc_reply: string;
  used_ai: boolean;
  suggested_action_id: string;
  created_at: string;
}

export interface NpcPreset {
  npc_id: string;
  questions: string[];
  enabled: boolean;
  updated_at: string;
}

export interface NpcPresetInput {
  questions: string[];
  enabled: boolean;
}

export type AdminLightLevel = "auto" | LightLevel;

export interface VillageBuildingOverride {
  building_id: string;
  light_level: AdminLightLevel;
  enabled: boolean;
  featured: boolean;
  note: string;
  updated_at: string;
}

export interface VillageBuildingOverrideInput {
  light_level: AdminLightLevel;
  enabled: boolean;
  featured: boolean;
  note: string;
}

export interface AdminOverview {
  analytics: AnalyticsSummary;
  projects: ManagedProject[];
  npc_presets: NpcPreset[];
  village_overrides: VillageBuildingOverride[];
}

export interface CodingTestLog {
  id: number;
  solved_date: string;
  platform: string;
  problem_no: string;
  title: string;
  difficulty: string;
  language: string;
  url: string;
  code: string;
  approach: string;
  created_at: string;
  updated_at: string;
}

export interface CodingTestInput {
  solved_date?: string;
  platform: string;
  problem_no: string;
  title: string;
  difficulty: string;
  language: string;
  url: string;
  code: string;
  approach: string;
}

export interface CsNote {
  id: number;
  study_date: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CsNoteInput {
  study_date?: string;
  category: string;
  title: string;
  content: string;
}
