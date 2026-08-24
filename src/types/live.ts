export type LightLevel = "dark" | "dim" | "normal" | "bright";
export type NpcMood =
  | "sleepy"
  | "calm"
  | "busy"
  | "proud"
  | "training"
  | "curious"
  | "focused"
  | "worried"
  | "excited";
export type NpcActionSource = "chat" | "tick" | "encounter" | "manual";
export type NpcAnimationKey =
  | "wave"
  | "point"
  | "think"
  | "type"
  | "send"
  | "walk-to-building"
  | "open-hologram";

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

/** 방문자가 다른 NPC 얘기를 감정 담아 전해서 관계가 움직였을 때 (규칙 기반) */
export interface NpcRelay {
  about_npc_id: string;
  about_name: string;
  delta: number;
  milestone: string;
  /** 방금 생긴 💌 소식 — 폴링 전에 피드에 꽂는다 */
  news?: VillageEvent | null;
  /** 이 전달이 NPC 의 부탁을 이행했다 (delta 는 +4) */
  favor_done?: boolean;
}

/** NPC 가 방문자에게 건넨 부탁 — "픽셀한테 내가 미안해한다고 전해 줄래?" */
export interface NpcFavor {
  id: number;
  npc_id: string;
  npc_name: string;
  about_npc_id: string;
  about_name: string;
  text: string;
}

export interface NpcChatResponse {
  npc_id: string;
  reply: string;
  used_ai: boolean;
  suggested_action?: NpcSuggestedAction | null;
  relay?: NpcRelay | null;
  /** 이번 답변과 함께 NPC 가 건넨 부탁 */
  favor?: NpcFavor | null;
  /** 이 방문자와 이 NPC 의 호감(익명 단골 시스템) */
  bond?: {level: string; score: number} | null;
}

/** NPC 개인 기억 한 줄 (GET /npc/memory/{id}; 방문자 대화는 제외) */
export interface NpcMemoryItem {
  kind: "encounter" | "incident" | "gossip" | "relay" | string;
  about_npc_id: string;
  text: string;
  delta: number;
  created_at: string;
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
  /** 2026-08-22 부터 실제 npc_id (예전엔 대표 종류) */
  npc_a: string;
  npc_b: string;
  affinity: number;
  vibe: string;
  meet_count: number;
  /** 영구 연표(RelationshipMilestone)에서 센 값 */
  fights: number;
  reconciliations: number;
  milestones: string[];
  /** 최근 마일스톤 6개(오래된 순) — 관계도 연표 */
  timeline: Array<{milestone: string; created_at: string}>;
}

/** 마을 소식 한 줄 — NPC 사이에 일어난 눈에 띄는 사건 (GET /npc/news) */
export interface VillageEvent {
  id: number;
  emoji: string;
  text: string;
  npc_a: string;
  npc_b: string;
  delta: number;
  created_at: string;
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
  /** 이 마주침이 만든 소식(눈에 띄는 것만) — 폴링 전에 피드에 꽂는다 */
  news?: VillageEvent | null;
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

export interface AiUsage {
  today_count: number;
  daily_limit: number;
}

export interface AdminOverview {
  analytics: AnalyticsSummary;
  projects: ManagedProject[];
  npc_presets: NpcPreset[];
  village_overrides: VillageBuildingOverride[];
  ai_usage: AiUsage;
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

/* ── 의뢰 공방 (홈페이지 제작 의뢰) ──
   마을에서 유일하게 외부인이 데이터를 쓰는 경로다. */

/** 상담 중 누적되는 요구사항 + 참고 견적. 프런트가 보관하고 매 턴 백엔드에 되돌려준다. */
export interface CommissionDraft {
  site_type: string;
  summary: string;
  pages: string[];
  features: string[];
  tone: string;
  references: string[];
  budget_hint: string;
  deadline_hint: string;
  /** 원 단위. 확정 견적이 아니라 참고 범위다. */
  estimate_min: number;
  estimate_max: number;
  weeks_min: number;
  weeks_max: number;
  estimate_reason: string;

  /* ── 제작 슬롯 ──
     "얼마짜리 일인가"가 아니라 "어떻게 만들어야 잘 만드는가"를 담는다.
     1차 상담에서는 들리면 담기만 하고 먼저 묻지 않으며, 접수 뒤 심화 문답에서 채운다.
     출처: backend/app/services/commission_service.py 의 _DEPTH_SLOTS */
  /** 만든 뒤 내용을 누가 고치나 — 이 한 줄이 아키텍처를 정한다 */
  who_updates: string;
  /** 사진·글·로고를 누가 준비하나 */
  content_owner: string;
  /** 사이트가 생기면 뭐가 달라져야 하나 */
  success_metric: string;
  /** 이미 가진 도메인·기존 사이트·SNS */
  existing_assets: string;
  /** 피하고 싶은 것 */
  dislikes: string[];
  /** 참고 사이트의 "왜" */
  reference_notes: string;
  /** 최종 결정하는 사람 */
  decision_maker: string;

  /** 체리(기획)가 "확인 필요"에서 뽑아낸 추가 질문. 제작 슬롯 뒤에 이어서 묻는다. */
  planner_questions: PlannerQuestion[];

  /** 접수원이 아직 못 들은 항목 */
  missing: string[];
  /** 접수 폼을 띄울 만큼 모였는지 */
  ready_to_submit: boolean;
  /** 심화 문답에서 아직 못 들은 제작 슬롯 (라벨) */
  depth_missing: string[];
  /** 제작 슬롯의 필수분이 다 찼는지 */
  depth_done: boolean;
}

/** 체리가 만든, 손님이 바로 답할 수 있는 질문 하나. */
export interface PlannerQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface PlannerQuestionsResponse {
  questions: PlannerQuestion[];
  source: string;
  message: string;
}

/** 손님에게 공개된 산출물. 심화 문답 화면이 시안을 띄우는 데 쓴다. */
export interface SharedArtifact {
  id: number;
  rel_path: string;
  kind: string;
  /** 본문 전체. iframe srcdoc 으로 띄운다(별도 공개 주소를 만들지 않으려고). */
  content: string;
}

export interface CommissionConsultResponse {
  reply: string;
  used_ai: boolean;
  draft: CommissionDraft;
  disclaimer: string;
}

/** 릴레이 설문에서 지금 말 거는 공방 식구. 백엔드 `commission_service.SPEAKERS` 와 같은 키. */
export type CommissionSpeaker =
  | "intake"
  | "planner"
  | "designer"
  | "frontend"
  | "backend";

/**
 * 견적 규칙표 — `GET /commission/pricing`.
 * 선택지마다 가산치를 보여주고 누적 견적을 굴리는 데 쓴다. 표를 프런트에 손으로
 * 옮겨 적지 않는 게 핵심이다. 금액은 원 단위.
 */
export interface CommissionPricing {
  base_by_type: Record<
    string,
    {min: number; max: number; weeks_min: number; weeks_max: number}
  >;
  default_base: {
    min: number;
    max: number;
    weeks_min: number;
    weeks_max: number;
  };
  feature_weights: Record<string, {min: number; max: number; weeks: number}>;
  page_free: number;
  page_add_min: number;
  page_add_max: number;
  clamp_low: number;
  clamp_high: number;
}

export interface CommissionInput {
  session_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  org: string;
  site_type: string;
  summary: string;
  requirements: Record<string, unknown>;
  budget_hint: string;
  deadline_hint: string;
  estimate_min: number;
  estimate_max: number;
  weeks_min: number;
  weeks_max: number;
  estimate_reason: string;
  /** 연락처 수집 동의. false면 백엔드가 거부한다. */
  consent: boolean;
  /** 허니팟 — 사람은 비워 두는 필드. 값이 있으면 봇으로 보고 거부한다. */
  website?: string;
}

export interface CommissionAck {
  public_id: string;
  status: string;
  message: string;
  /** 심화 문답으로 돌아오는 열쇠 */
  access_token: string;
  /** 프런트 경로 (/commission/<token>) */
  track_path: string;
}

/** 접수 뒤 심화 문답 화면이 받는 공개 정보. **연락처는 담기지 않는다.** */
export interface CommissionTrack {
  public_id: string;
  status: CommissionStatus;
  site_type: string;
  summary: string;
  created_at: string;
  draft: CommissionDraft;
  disclaimer: string;
  /** 도안의 첫마디 — 남은 항목 중 첫 질문이 들어 있다 */
  greeting: string;
  messages: CommissionMessage[];
  /** 공개된 시안. 있으면 화면이 띄우고 "어디가 아닌지" 묻는다. */
  preview: SharedArtifact | null;
  /** 2층 릴레이 설문 — 종류별 분기 답({문항id: 답})과 AI 맞춤 질문. */
  branch: Record<string, string>;
  ai_questions: AiQuestion[];
  /** AI 질문 생성이 이미 끝났는가(빈 목록이어도 true — 재생성하지 않는다) */
  ai_questions_done: boolean;
}

/** AI 가 이 의뢰만 보고 뽑은 맞춤 질문 하나. */
export interface AiQuestion {
  id: string;
  question: string;
  answer: string;
  speaker: CommissionSpeaker;
}

export interface CommissionDepthResponse {
  reply: string;
  used_ai: boolean;
  draft: CommissionDraft;
  disclaimer: string;
}

// backend/app/schemas.py 의 CommissionStatus 와 같은 목록이어야 한다.
// 전이 규칙의 출처는 backend/app/agents/gate.py 하나뿐이다.
export type CommissionStatus =
  | "received"
  | "reviewing" // ← 게이트1
  | "briefing"
  | "brief_review" // ← 게이트2
  | "briefed"
  | "in_progress"
  | "artifact_review" // ← 게이트3
  | "delivered"
  | "rejected";

export interface Commission {
  id: number;
  public_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  org: string;
  site_type: string;
  summary: string;
  requirements: Record<string, unknown>;
  budget_hint: string;
  deadline_hint: string;
  estimate_min: number;
  estimate_max: number;
  weeks_min: number;
  weeks_max: number;
  estimate_reason: string;
  status: CommissionStatus;
  admin_note: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionMessage {
  id: number;
  role: "visitor" | "npc";
  content: string;
  used_ai: boolean;
  created_at: string;
}

export interface CommissionDetail extends Commission {
  session_id: string;
  /** 손님에게 보낼 심화 문답 링크 — 회신 메일에 붙여 쓴다 */
  track_path: string;
  /** 심화 문답으로 받아낸 제작 정보 (라벨 → 답) */
  depth_answers: Record<string, string>;
  messages: CommissionMessage[];
}

export interface CommissionStatusInput {
  status: CommissionStatus;
  admin_note: string;
}

/* ── 3단계: 직군별 에이전트 작업 ─────────────────────────────────── */

export type CommissionRole = "planner" | "designer" | "frontend" | "backend";

export type CommissionTaskStatus =
  | "ready" // 실행 대기 (승인된 상태)
  | "running"
  | "review" // 실행 끝. 검수 대기 — 여기서 멈춘다
  | "approved"
  | "rejected"
  | "failed";

export interface CommissionArtifact {
  id: number;
  task_id: number;
  rel_path: string;
  kind: "markdown" | "html" | "text" | "other";
  size_bytes: number;
  /** 손님 공개 여부. 기본 false — 검수 전 산출물이 새면 안 된다. */
  shared: boolean;
  updated_at: string;
}

export interface CommissionTask {
  id: number;
  role: CommissionRole;
  status: CommissionTaskStatus;
  round: number;
  brief: string;
  feedback: string;
  log: string;
  error: string;
  cost_usd: number;
  duration_ms: number;
  started_at: string | null;
  finished_at: string | null;
  artifacts: CommissionArtifact[];
}

export interface CommissionBoard {
  commission_id: number;
  public_id: string;
  status: CommissionStatus;
  /** 지금 열려 있는 게이트. null이면 통과시킬 게이트가 없다. */
  open_gate: 1 | 2 | 3 | null;
  /** 백엔드에서 에이전트 실행이 켜져 있는지(꺼져 있으면 CLI로 돌려야 한다). */
  worker_enabled: boolean;
  tasks: CommissionTask[];
}

export interface GateInput {
  gate: 1 | 2 | 3;
  decision: "approve" | "reject";
  feedback?: string;
}

export interface ArtifactContent {
  id: number;
  rel_path: string;
  kind: string;
  content: string;
}
