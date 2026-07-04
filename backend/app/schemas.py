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


class NpcEncounterOut(BaseModel):
    dialogue: list[NpcDialogueLine]
    state_changes: list[NpcStateChange]
    memory: str
    used_ai: bool
    cooldown_seconds: int
    suggested_actions: list[NpcActionOut] = Field(default_factory=list)


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


class AdminOverview(BaseModel):
    analytics: AnalyticsSummary
    projects: list[ManagedProjectOut]
    npc_presets: list[NpcPresetOut]
    village_overrides: list[VillageBuildingOverrideOut]


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
