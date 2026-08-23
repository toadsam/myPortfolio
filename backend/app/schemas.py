from datetime import date as dt_date
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field, field_validator


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
    # 익명 방문자 식별자(브라우저 localStorage 의 무작위 uuid). 개인정보 아님. 없으면 첫 방문 취급.
    visitor_id: str = Field(default="", max_length=64)


class RelayOut(BaseModel):
    """방문자가 다른 NPC 얘기를 전해 관계가 움직였을 때."""

    about_npc_id: str
    about_name: str
    delta: int
    milestone: str = ""
    # 방금 생긴 소식 — 프런트가 60초 폴링을 기다리지 않고 피드 맨 앞에 꽂는다.
    news: "VillageEventOut | None" = None
    # 이 전달이 NPC 의 부탁(NpcFavor)을 이행했으면 True — delta 는 +4 로 커져 있다.
    favor_done: bool = False


class FavorOut(BaseModel):
    """NPC 가 방문자에게 건넨 부탁."""

    id: int
    npc_id: str
    npc_name: str = ""
    about_npc_id: str
    about_name: str = ""
    text: str


class ChatMessageOut(BaseModel):
    npc_id: str
    reply: str
    used_ai: bool
    suggested_action: NpcActionOut | None = None
    relay: RelayOut | None = None
    # 이번 답변과 함께 NPC 가 건넨 부탁(없으면 None)
    favor: FavorOut | None = None


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
    # 영구 연표(RelationshipMilestone)에서 센 값. 싸움 = 틀어짐·앙숙, 화해 = 화해·절친.
    fights: int = 0
    reconciliations: int = 0
    milestones: list[str] = Field(default_factory=list)
    timeline: list["MilestoneOut"] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class MilestoneOut(BaseModel):
    milestone: str
    created_at: datetime

    @field_validator("created_at")
    @classmethod
    def _as_utc(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value


class NpcMemoryOut(BaseModel):
    kind: str
    about_npc_id: str
    text: str
    delta: int
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("created_at")
    @classmethod
    def _as_utc(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value


class VillageEventOut(BaseModel):
    """마을 소식 한 줄 — NPC 사이의 눈에 띄는 사건."""

    id: int
    emoji: str
    text: str
    npc_a: str
    npc_b: str
    delta: int
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("created_at")
    @classmethod
    def _as_utc(cls, value: datetime) -> datetime:
        # SQLite 의 func.now() 는 UTC 인데 tz 없이 돌아온다. 그대로 내보내면 브라우저가
        # 로컬 시각으로 읽어 "9시간 전"이 된다(KST). UTC 를 명시해 'Z' 가 붙게 한다.
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value


class NpcEncounterOut(BaseModel):
    dialogue: list[NpcDialogueLine]
    state_changes: list[NpcStateChange]
    memory: str
    used_ai: bool
    cooldown_seconds: int
    suggested_actions: list[NpcActionOut] = Field(default_factory=list)
    relationship: NpcRelationshipOut | None = None
    # 이 마주침이 만든 마을 소식(눈에 띄는 것만). 프런트가 즉시 피드에 꽂는다.
    news: VillageEventOut | None = None


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


class PlannerQuestion(BaseModel):
    """체리가 "확인 필요"에서 뽑아낸, 손님이 바로 답할 수 있는 질문 하나."""

    id: str
    question: str
    answer: str = ""


class CommissionDraft(BaseModel):
    """상담 대화에서 추출한 구조화 요구사항 + 참고 견적.

    필드가 **두 무리**로 나뉜다. 이걸 섞으면 접수 창구가 취조실이 된다.

    ① 견적 슬롯 (site_type ~ estimate_reason)
       "얼마짜리 일인가"를 계산하려고 받는다. 1차 상담에서 도안이 **먼저 묻는다.**

    ② 제작 슬롯 (who_updates ~ decision_maker)
       "어떻게 만들어야 잘 만드는가"를 위해 받는다. 이쪽이 실제 제작 난이도와
       퀄리티를 좌우하지만, 1차에서 캐물으면 손님이 떠난다. 그래서 1차에서는
       **들리면 담기만 하고 먼저 묻지 않으며**, 접수 뒤 심화 문답(2차)에서
       `depth_missing` 을 쫓아 채운다.

    ready_to_submit 은 ①만 본다. 접수 문턱은 지금 그대로 낮게 유지한다 —
    문턱을 올려 이탈시키는 대신, 뽑는 시점을 접수 뒤로 옮기는 게 이 설계다.
    """

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

    # ── 제작 슬롯 (2차 심화 문답에서 채운다) ──
    # 만든 뒤 누가 고치나. **이 한 줄이 아키텍처를 정한다** — 정적 HTML / CMS / 어드민.
    who_updates: str = ""
    # 사진·글·로고를 누가 준비하나. 웹 프로젝트 지연 원인 1위라 착수 전에 알아야 한다.
    content_owner: str = ""
    # "뭐가 일어나면 성공인가". 카피·CTA·디자인 결정이 전부 여기서 나온다.
    success_metric: str = ""
    # 도메인·호스팅·기존 사이트·SNS. 있으면 작업이 반으로 줄고, 없으면 새로 준비해야 한다.
    existing_assets: str = ""
    # 피하고 싶은 것. 취향은 좋아하는 것보다 싫어하는 것에서 훨씬 정확하게 드러난다.
    dislikes: list[str] = Field(default_factory=list)
    # references 의 짝 — "그 사이트의 뭐가 좋으세요?". URL만 있으면 읽을 수가 없다.
    reference_notes: str = ""
    # 최종 승인자·관여 인원.
    decision_maker: str = ""

    # 체리가 만든 추가 질문 (있으면 제작 슬롯 뒤에 이어서 묻는다)
    planner_questions: list["PlannerQuestion"] = Field(default_factory=list)

    missing: list[str] = Field(default_factory=list)        # 1차에서 아직 못 들은 항목
    ready_to_submit: bool = False                           # 접수 폼을 띄워도 될 만큼 모였는지
    depth_missing: list[str] = Field(default_factory=list)  # 2차에서 아직 못 들은 제작 슬롯
    depth_done: bool = False                                # 제작 슬롯의 필수분이 다 찼는지


class CommissionConsultIn(BaseModel):
    session_id: str = Field(default="", max_length=120)
    message: str = Field(min_length=1, max_length=2000)
    recent_messages: list[str] = Field(default_factory=list)
    # 지금까지 파악된 내용. 프런트가 돌려주므로 백엔드는 상태를 들고 있지 않는다.
    draft: CommissionDraft | None = None
    # 릴레이 설문에서 지금 말 거는 식구. intake(도안)가 기본 — 옛 프런트와 호환.
    speaker: Literal["intake", "planner", "designer", "frontend", "backend"] = "intake"


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
    # 심화 문답으로 돌아오는 열쇠. public_id 는 8 hex 라 열거를 시도할 수 있어
    # 조회 키로 쓰지 않는다. 이 토큰을 아는 사람만 자기 접수 건에 닿는다.
    access_token: str = ""
    track_path: str = ""   # 프런트 경로 (/commission/<token>)


class SharedArtifactOut(BaseModel):
    """손님에게 공개된 산출물 하나. 심화 문답 화면이 시안을 띄우는 데 쓴다.

    **관리자가 켠 것만** 나간다(`CommissionArtifact.shared`). 내용을 통째로 실어
    보내는 이유는 iframe 을 `srcdoc` 으로 띄우기 위해서다 — 별도 주소를 열어 주면
    그 주소가 곧 공개 링크가 되어 버린다.
    """

    id: int
    rel_path: str
    kind: str
    content: str


class CommissionTrackOut(BaseModel):
    """접수 조회 + 심화 문답 화면이 받는 공개 정보.

    **연락처는 절대 담지 않는다.** 링크가 전달되는 경로(메일·메신저)는
    통제할 수 없으므로, 토큰을 쥔 사람이 볼 수 있는 것은 자기가 이미 말한
    내용과 진행 상태까지다.
    """

    public_id: str
    status: str
    site_type: str
    summary: str
    created_at: datetime
    draft: CommissionDraft
    disclaimer: str = ESTIMATE_DISCLAIMER
    greeting: str = ""
    messages: list["CommissionMessageOut"] = Field(default_factory=list)
    # 공개된 시안. 있으면 화면이 이걸 띄우고 "어디가 아닌지" 묻는다 —
    # 추상적인 질문 열 개보다 구체적으로 틀린 시안 한 장이 정보를 더 뽑아낸다.
    preview: SharedArtifactOut | None = None


class CommissionDepthIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    recent_messages: list[str] = Field(default_factory=list)


class ArtifactShareIn(BaseModel):
    shared: bool


class PlannerQuestionsOut(BaseModel):
    """체리의 질문지를 손님 대본으로 옮긴 결과."""

    questions: list[PlannerQuestion] = Field(default_factory=list)
    source: str = ""      # 어느 파일에서 뽑았는지
    message: str = ""


class CommissionDepthOut(BaseModel):
    reply: str
    used_ai: bool
    draft: CommissionDraft
    disclaimer: str = ESTIMATE_DISCLAIMER


class CommissionMessageOut(BaseModel):
    id: int
    role: str
    content: str
    used_ai: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# CommissionTrackOut 이 CommissionMessageOut 을 앞서 참조한다(전방 참조).
# 여기서 한 번 확정해 둔다 — 첫 요청 때 지연 해석에 기대지 않는다.
CommissionTrackOut.model_rebuild()


class CommissionDetailOut(CommissionOut):
    session_id: str
    # 손님에게 보낼 심화 문답 링크. 회신 메일에 붙여 쓴다.
    track_path: str = ""
    # 심화 문답으로 받아낸 제작 정보 (라벨 → 답). 접수 원문과 섞이지 않게 따로 둔다.
    depth_answers: dict[str, str] = Field(default_factory=dict)
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
    shared: bool = False
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


# 앞에서 문자열로 참조한 타입(RelayOut.news, NpcRelationshipRow.timeline)을 확정한다.
RelayOut.model_rebuild()
NpcRelationshipRow.model_rebuild()
