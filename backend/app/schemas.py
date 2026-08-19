from datetime import date as dt_date
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ActivityIn(BaseModel):
    date: dt_date | None = None
    github_commits: int = Field(default=0, ge=0)
    github_repos: list[str] = Field(default_factory=list)
    study_minutes: int = Field(default=0, ge=0)
    study_topics: list[str] = Field(default_factory=list)
    studied_tech: list[str] = Field(default_factory=list)
    coding_minutes: int = Field(default=0, ge=0)
    project_minutes: dict[str, int] = Field(default_factory=dict)
    workout_done: bool = False
    workout_minutes: int = Field(default=0, ge=0)
    workout_type: str = ""
    focus_score: int = Field(default=50, ge=0, le=100)
    memo: str = ""
    mood: str = "steady"


class ActivityOut(BaseModel):
    id: int
    date: dt_date
    github_commits: int
    github_repos: list[str]
    study_minutes: int
    study_topics: list[str]
    studied_tech: list[str]
    coding_minutes: int
    project_minutes: dict[str, int]
    workout_done: bool
    workout_minutes: int
    workout_type: str
    focus_score: int
    memo: str
    mood: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


LightLevel = Literal["dark", "dim", "normal", "bright"]
AdminLightLevel = Literal["auto", "dark", "dim", "normal", "bright"]
NpcMood = Literal["sleepy", "calm", "busy", "proud", "training", "curious", "focused", "worried", "excited"]
NpcAnimationKey = Literal["wave", "point", "think", "type", "send", "walk-to-building", "open-hologram"]
NpcActionSource = Literal["chat", "tick", "encounter", "manual"]


class NpcActionOut(BaseModel):
    npc_id: str
    action_id: str
    label: str
    description: str
    status_text: str
    animation_key: NpcAnimationKey
    duration_ms: int = Field(default=4500, ge=500, le=30000)
    target_id: str | None = None
    source: NpcActionSource = "chat"


class BuildingState(BaseModel):
    building_id: str
    light_level: LightLevel
    activity_score: int
    reason: str


class NpcState(BaseModel):
    npc_id: str
    mood: NpcMood
    status_text: str


class VillageState(BaseModel):
    activity: ActivityOut
    buildings: list[BuildingState]
    npcs: list[NpcState]
    unlocked_items: list[str]
    summary: str


class ChatMessageIn(BaseModel):
    npc_id: str
    message: str = Field(min_length=1, max_length=1000)
    recent_messages: list[str] = Field(default_factory=list)


class ChatMessageOut(BaseModel):
    npc_id: str
    reply: str
    used_ai: bool
    suggested_action: NpcActionOut | None = None


class NpcTickIn(BaseModel):
    npc_id: str
    mood: NpcMood = "calm"
    energy: int = Field(default=50, ge=0, le=100)
    assigned_building_id: str | None = None
    nearby_npc_ids: list[str] = Field(default_factory=list)
    recent_memory: list[str] = Field(default_factory=list)


class NpcTickOut(BaseModel):
    npc_id: str
    bubble_text: str
    mood: NpcMood
    energy: int = Field(ge=0, le=100)
    next_goal: str
    memory: str
    used_ai: bool
    cooldown_seconds: int
    suggested_action: NpcActionOut | None = None


class EncounterParticipant(BaseModel):
    npc_id: str
    mood: NpcMood = "calm"
    energy: int = Field(default=50, ge=0, le=100)
    assigned_building_id: str | None = None
    recent_memory: list[str] = Field(default_factory=list)


class NpcDialogueLine(BaseModel):
    npc_id: str
    text: str


class NpcStateChange(BaseModel):
    npc_id: str
    mood: NpcMood
    energy: int = Field(ge=0, le=100)


class NpcEncounterIn(BaseModel):
    npc_a: EncounterParticipant
    npc_b: EncounterParticipant
    recent_memory: list[str] = Field(default_factory=list)


class NpcRelationshipOut(BaseModel):
    npc_a: str = ""
    npc_b: str = ""
    affinity: int = 0
    vibe: str = ""
    delta: int = 0
    event: str = ""
    milestone: str = ""


class NpcRelationshipRow(BaseModel):
    npc_a: str
    npc_b: str
    affinity: int
    vibe: str
    meet_count: int

    model_config = {"from_attributes": True}


class NpcEncounterOut(BaseModel):
    dialogue: list[NpcDialogueLine]
    state_changes: list[NpcStateChange]
    memory: str
    used_ai: bool
    cooldown_seconds: int
    suggested_actions: list[NpcActionOut] = Field(default_factory=list)
    relationship: NpcRelationshipOut | None = None


class NpcGroupChatIn(BaseModel):
    npc_ids: list[str] = Field(default_factory=list)
    recent_memory: list[str] = Field(default_factory=list)


class NpcGroupChatOut(BaseModel):
    dialogue: list[NpcDialogueLine]
    used_ai: bool
    cooldown_seconds: int


class GithubSyncOut(BaseModel):
    username: str
    commits: int
    updated_activity: ActivityOut
    warning: str | None = None


class VisitorEventIn(BaseModel):
    event_type: str = Field(min_length=1, max_length=80)
    target_id: str = Field(default="", max_length=160)
    label: str = Field(default="", max_length=200)
    session_id: str = Field(default="", max_length=120)
    metadata: dict[str, str | int | float | bool | None] = Field(default_factory=dict)


class VisitorEventOut(BaseModel):
    id: int
    event_type: str
    target_id: str
    label: str
    session_id: str
    metadata_json: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalyticsMetric(BaseModel):
    label: str
    value: int


class AnalyticsSummary(BaseModel):
    total_events: int
    unique_sessions: int
    npc_messages: int
    project_views: int
    contact_clicks: int
    top_events: list[AnalyticsMetric]
    top_projects: list[AnalyticsMetric]
    top_npcs: list[AnalyticsMetric]
    recent_events: list[VisitorEventOut]


class ManagedProjectIn(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    summary: str = ""
    role: str = ""
    tech: list[str] = Field(default_factory=list)
    priority: int = Field(default=50, ge=0, le=100)
    featured: bool = False
    visible: bool = True
    admin_note: str = ""


class ManagedProjectOut(ManagedProjectIn):
    id: str
    updated_at: datetime

    model_config = {"from_attributes": True}


class NpcConversationLogOut(BaseModel):
    id: int
    npc_id: str
    visitor_message: str
    npc_reply: str
    used_ai: bool
    suggested_action_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class NpcPresetIn(BaseModel):
    questions: list[str] = Field(default_factory=list)
    enabled: bool = True


class NpcPresetOut(NpcPresetIn):
    npc_id: str
    updated_at: datetime

    model_config = {"from_attributes": True}


class VillageBuildingOverrideIn(BaseModel):
    light_level: AdminLightLevel = "auto"
    enabled: bool = True
    featured: bool = False
    note: str = ""


class VillageBuildingOverrideOut(VillageBuildingOverrideIn):
    building_id: str
    updated_at: datetime

    model_config = {"from_attributes": True}


class AiUsage(BaseModel):
    today_count: int
    daily_limit: int


class AdminOverview(BaseModel):
    analytics: AnalyticsSummary
    projects: list[ManagedProjectOut]
    npc_presets: list[NpcPresetOut]
    village_overrides: list[VillageBuildingOverrideOut]
    ai_usage: AiUsage


class AdminLoginIn(BaseModel):
    password: str = ""


class AdminLoginOut(BaseModel):
    token: str
    auth_enabled: bool


class AdminAuthStatus(BaseModel):
    auth_enabled: bool


class CodingTestIn(BaseModel):
    solved_date: dt_date | None = None
    platform: str = Field(default="", max_length=60)
    problem_no: str = Field(default="", max_length=60)
    title: str = Field(min_length=1, max_length=200)
    difficulty: str = Field(default="", max_length=60)
    language: str = Field(default="", max_length=60)
    url: str = Field(default="", max_length=400)
    code: str = ""
    approach: str = ""


class CodingTestOut(BaseModel):
    id: int
    solved_date: dt_date
    platform: str
    problem_no: str
    title: str
    difficulty: str
    language: str
    url: str
    code: str
    approach: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CsNoteIn(BaseModel):
    study_date: dt_date | None = None
    category: str = Field(default="", max_length=60)
    title: str = Field(min_length=1, max_length=200)
    content: str = ""


class CsNoteOut(BaseModel):
    id: int
    study_date: dt_date
    category: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────── 홈페이지 제작 의뢰 (의뢰 공방) ───────────────────────────

# 3단계 게이트가 지나가는 길. 전이 규칙은 app/agents/gate.py 가 유일한 출처다.
# 프론트의 CommissionStatus 유니온과 COMMISSION_STATUS_STYLE 이 이 목록의 거울이라,
# 여기에 추가하고 저기를 빠뜨리면 타입체크가 잡아 준다.
CommissionStatus = Literal[
    "received",         # 접수됨
    "reviewing",        # 관리자 검토중        ← 게이트1
    "briefing",         # 기획 에이전트 실행 대기/실행중
    "brief_review",     # 브리프 검수 대기      ← 게이트2
    "briefed",          # 브리프 확정, 팀 3직군 대기
    "in_progress",      # 디자인·프론트·백엔드 제작중
    "artifact_review",  # 산출물 검수 대기      ← 게이트3
    "delivered",        # 전달 완료
    "rejected",         # 반려/거절
]

# AI가 부른 금액은 확정 견적이 아니다. 방문자 화면과 접수 메일 양쪽에 이 문구를 노출한다.
ESTIMATE_DISCLAIMER = (
    "이 금액과 기간은 대화 내용을 바탕으로 한 참고 범위이며 확정 견적이 아닙니다. "
    "정확한 견적은 담당자 확인 후 안내드립니다."
)


class CommissionDraft(BaseModel):
    """상담 대화에서 추출한 구조화 요구사항 + 참고 견적."""

    site_type: str = ""
    summary: str = ""
    pages: list[str] = Field(default_factory=list)
    features: list[str] = Field(default_factory=list)
    tone: str = ""
    references: list[str] = Field(default_factory=list)
    budget_hint: str = ""
    deadline_hint: str = ""
    estimate_min: int = 0
    estimate_max: int = 0
    weeks_min: int = 0
    weeks_max: int = 0
    estimate_reason: str = ""
    missing: list[str] = Field(default_factory=list)   # 아직 못 들은 항목
    ready_to_submit: bool = False                      # 접수 폼을 띄워도 될 만큼 모였는지


class CommissionConsultIn(BaseModel):
    session_id: str = Field(default="", max_length=120)
    message: str = Field(min_length=1, max_length=2000)
    recent_messages: list[str] = Field(default_factory=list)
    # 지금까지 파악된 내용. 프런트가 돌려주므로 백엔드는 상태를 들고 있지 않는다.
    draft: CommissionDraft | None = None


class CommissionConsultOut(BaseModel):
    reply: str
    used_ai: bool
    draft: CommissionDraft
    disclaimer: str = ESTIMATE_DISCLAIMER


class CommissionIn(BaseModel):
    session_id: str = Field(default="", max_length=120)

    contact_name: str = Field(default="", max_length=80)
    contact_email: str = Field(min_length=3, max_length=200)
    contact_phone: str = Field(default="", max_length=60)
    org: str = Field(default="", max_length=160)

    site_type: str = Field(default="", max_length=60)
    summary: str = Field(default="", max_length=2000)
    requirements: dict = Field(default_factory=dict)
    budget_hint: str = Field(default="", max_length=120)
    deadline_hint: str = Field(default="", max_length=120)

    estimate_min: int = Field(default=0, ge=0)
    estimate_max: int = Field(default=0, ge=0)
    weeks_min: int = Field(default=0, ge=0)
    weeks_max: int = Field(default=0, ge=0)
    estimate_reason: str = Field(default="", max_length=2000)

    consent: bool = False   # 연락처 수집 동의 — False면 접수 거부
    website: str = ""       # 허니팟. 사람은 비워 두는 필드라 값이 있으면 봇.


class CommissionOut(BaseModel):
    id: int
    public_id: str
    contact_name: str
    contact_email: str
    contact_phone: str
    org: str
    site_type: str
    summary: str
    requirements: dict
    budget_hint: str
    deadline_hint: str
    estimate_min: int
    estimate_max: int
    weeks_min: int
    weeks_max: int
    estimate_reason: str
    status: str
    admin_note: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CommissionAck(BaseModel):
    """접수 직후 방문자에게 돌려주는 최소 정보(내부 id는 노출하지 않는다)."""

    public_id: str
    status: str
    message: str


class CommissionMessageOut(BaseModel):
    id: int
    role: str
    content: str
    used_ai: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CommissionDetailOut(CommissionOut):
    session_id: str
    messages: list[CommissionMessageOut] = Field(default_factory=list)


class CommissionStatusIn(BaseModel):
    status: CommissionStatus
    admin_note: str = Field(default="", max_length=4000)


# ─────────────────── 3단계: 직군별 에이전트 작업 ───────────────────

CommissionRole = Literal["planner", "designer", "frontend", "backend"]


class CommissionArtifactOut(BaseModel):
    id: int
    task_id: int
    rel_path: str
    kind: str
    size_bytes: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class CommissionTaskOut(BaseModel):
    id: int
    role: str
    status: str
    round: int
    brief: str
    feedback: str
    log: str
    error: str
    cost_usd: float
    duration_ms: int
    started_at: datetime | None = None
    finished_at: datetime | None = None
    artifacts: list[CommissionArtifactOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class CommissionBoardOut(BaseModel):
    """관리자 작업 지시 패널이 한 번에 받아 가는 묶음."""

    commission_id: int
    public_id: str
    status: str
    open_gate: int | None = None   # 지금 열려 있는 게이트(없으면 None)
    worker_enabled: bool = False   # 관리자 페이지의 [실행] 버튼을 띄울지
    tasks: list[CommissionTaskOut] = Field(default_factory=list)


class GateIn(BaseModel):
    gate: Literal[1, 2, 3]
    decision: Literal["approve", "reject"]
    feedback: str = Field(default="", max_length=4000)


class TaskRejectIn(BaseModel):
    feedback: str = Field(default="", max_length=4000)


class ArtifactContentOut(BaseModel):
    id: int
    rel_path: str
    kind: str
    content: str


# ─────────────────────────── 갓생 섬 (/island) ───────────────────────────
#
# ActivityOut 과 일부러 분리한다 — /activity/today 는 손님도 부르는 공개
# 라우트라, 노션 링크 같은 개인 정보는 섬 스키마로만 나가야 한다.


class QuestOut(BaseModel):
    id: str
    label: str
    done: bool
    detail: str = ""


class IslandTodayOut(BaseModel):
    date: dt_date
    opened_on: dt_date
    cleared: bool
    streak: int
    best_streak: int
    quests: list[QuestOut]


class IslandHistoryRow(BaseModel):
    date: dt_date
    cleared: bool
    done_count: int


class WorkoutQuestIn(BaseModel):
    done: bool = True
    minutes: int = Field(default=0, ge=0, le=600)
    workout_type: str = ""


class NotionQuestIn(BaseModel):
    # url 이 비면 '취소'로 본다 — 잘못 누른 걸 되돌릴 수 있어야 한다.
    url: str = ""
    title: str = ""


class CodingMinutesIn(BaseModel):
    minutes: int = Field(default=0, ge=0, le=1440)


class CodingTestQuestIn(BaseModel):
    """섬에서 코테를 남길 때 — **링크 하나만 있어도 된다.**
    제목이 비면 서버가 긁어서 채우고, 못 긁으면 그냥 빈 채로 저장한다."""

    url: str = ""
    platform: str = ""
    title: str = ""


class IslandRefreshOut(BaseModel):
    today: IslandTodayOut
    # 무엇이 자동으로 채워졌는지 사람이 읽을 한 줄. 아무것도 없으면 빈 리스트.
    filled: list[str] = Field(default_factory=list)
    # 자동 조회가 왜 안 됐는지(핸들 미설정 등). 실패해도 오류가 아니라 안내다.
    notes: list[str] = Field(default_factory=list)


class CoachMessageOut(BaseModel):
    message: str
    # AI가 쓴 말인지 규칙 기반인지. 화면에 티내려는 게 아니라, OPENAI_API_KEY 를
    # 넣었는데도 규칙 기반이 나오면 뭔가 잘못된 걸 알아채기 위한 신호다.
    from_ai: bool


class CoachChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=500)
