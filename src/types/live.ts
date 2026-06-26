export type LightLevel = "dark" | "dim" | "normal" | "bright";
export type NpcMood = "sleepy" | "calm" | "busy" | "proud" | "training";

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
