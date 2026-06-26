export type LightLevel = "dark" | "dim" | "normal" | "bright";
export type NpcMood = "sleepy" | "calm" | "busy" | "proud" | "training" | "curious" | "focused" | "worried" | "excited";

export interface DailyActivity {
  id: number;
  date: string;
  github_commits: number;
  study_minutes: number;
  workout_done: boolean;
  memo: string;
  mood: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityInput {
  date?: string;
  github_commits: number;
  study_minutes: number;
  workout_done: boolean;
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
}

export interface NpcEncounterParticipant {
  npc_id: string;
  mood: NpcMood;
  energy: number;
  assigned_building_id?: string;
  recent_memory?: string[];
}

export interface NpcEncounterResponse {
  dialogue: Array<{npc_id: string; text: string}>;
  state_changes: Array<{npc_id: string; mood: NpcMood; energy: number}>;
  memory: string;
  used_ai: boolean;
  cooldown_seconds: number;
}
