from datetime import date as dt_date
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ActivityIn(BaseModel):
    date: dt_date | None = None
    github_commits: int = Field(default=0, ge=0)
    study_minutes: int = Field(default=0, ge=0)
    workout_done: bool = False
    memo: str = ""
    mood: str = "steady"


class ActivityOut(BaseModel):
    id: int
    date: dt_date
    github_commits: int
    study_minutes: int
    workout_done: bool
    memo: str
    mood: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


LightLevel = Literal["dark", "dim", "normal", "bright"]
NpcMood = Literal["sleepy", "calm", "busy", "proud", "training", "curious", "focused", "worried", "excited"]


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


class ChatMessageOut(BaseModel):
    npc_id: str
    reply: str
    used_ai: bool


class NpcTickIn(BaseModel):
    npc_id: str
    mood: NpcMood = "calm"
    energy: int = Field(default=50, ge=0, le=100)
    assigned_building_id: str | None = None
    nearby_npc_ids: list[str] = []
    recent_memory: list[str] = []


class NpcTickOut(BaseModel):
    npc_id: str
    bubble_text: str
    mood: NpcMood
    energy: int = Field(ge=0, le=100)
    next_goal: str
    memory: str
    used_ai: bool
    cooldown_seconds: int


class EncounterParticipant(BaseModel):
    npc_id: str
    mood: NpcMood = "calm"
    energy: int = Field(default=50, ge=0, le=100)
    assigned_building_id: str | None = None
    recent_memory: list[str] = []


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
    recent_memory: list[str] = []


class NpcEncounterOut(BaseModel):
    dialogue: list[NpcDialogueLine]
    state_changes: list[NpcStateChange]
    memory: str
    used_ai: bool
    cooldown_seconds: int


class GithubSyncOut(BaseModel):
    username: str
    commits: int
    updated_activity: ActivityOut
