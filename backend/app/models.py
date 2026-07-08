from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class DailyActivity(Base):
    __tablename__ = "daily_activity"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, unique=True, index=True)
    github_commits: Mapped[int] = mapped_column(Integer, default=0)
    github_repos: Mapped[list[str]] = mapped_column(JSON, default=list)
    study_minutes: Mapped[int] = mapped_column(Integer, default=0)
    study_topics: Mapped[list[str]] = mapped_column(JSON, default=list)
    studied_tech: Mapped[list[str]] = mapped_column(JSON, default=list)
    coding_minutes: Mapped[int] = mapped_column(Integer, default=0)
    project_minutes: Mapped[dict[str, int]] = mapped_column(JSON, default=dict)
    workout_done: Mapped[bool] = mapped_column(Boolean, default=False)
    workout_minutes: Mapped[int] = mapped_column(Integer, default=0)
    workout_type: Mapped[str] = mapped_column(String(80), default="")
    focus_score: Mapped[int] = mapped_column(Integer, default=50)
    memo: Mapped[str] = mapped_column(Text, default="")
    mood: Mapped[str] = mapped_column(String(40), default="steady")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class VisitorEvent(Base):
    __tablename__ = "visitor_event"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_type: Mapped[str] = mapped_column(String(80), index=True)
    target_id: Mapped[str] = mapped_column(String(160), default="", index=True)
    label: Mapped[str] = mapped_column(String(200), default="")
    session_id: Mapped[str] = mapped_column(String(120), default="", index=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class ManagedProject(Base):
    __tablename__ = "managed_project"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    summary: Mapped[str] = mapped_column(Text, default="")
    role: Mapped[str] = mapped_column(Text, default="")
    tech: Mapped[list[str]] = mapped_column(JSON, default=list)
    priority: Mapped[int] = mapped_column(Integer, default=50)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    visible: Mapped[bool] = mapped_column(Boolean, default=True)
    admin_note: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class NpcConversationLog(Base):
    __tablename__ = "npc_conversation_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    npc_id: Mapped[str] = mapped_column(String(120), index=True)
    visitor_message: Mapped[str] = mapped_column(Text)
    npc_reply: Mapped[str] = mapped_column(Text)
    used_ai: Mapped[bool] = mapped_column(Boolean, default=False)
    suggested_action_id: Mapped[str] = mapped_column(String(120), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class NpcPresetSetting(Base):
    __tablename__ = "npc_preset_setting"

    npc_id: Mapped[str] = mapped_column(String(120), primary_key=True)
    questions: Mapped[list[str]] = mapped_column(JSON, default=list)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class VillageBuildingOverride(Base):
    __tablename__ = "village_building_override"

    building_id: Mapped[str] = mapped_column(String(120), primary_key=True)
    light_level: Mapped[str] = mapped_column(String(20), default="auto")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    note: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CodingTestLog(Base):
    __tablename__ = "coding_test_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    solved_date: Mapped[date] = mapped_column(Date, index=True)
    platform: Mapped[str] = mapped_column(String(60), default="")          # 백준 / 프로그래머스 / 리트코드 등
    problem_no: Mapped[str] = mapped_column(String(60), default="")        # 문제 번호/식별자 (선택)
    title: Mapped[str] = mapped_column(String(200), default="")            # 문제 제목
    difficulty: Mapped[str] = mapped_column(String(60), default="")        # 실버3, Lv.2 등
    language: Mapped[str] = mapped_column(String(60), default="")          # 풀이 언어
    url: Mapped[str] = mapped_column(String(400), default="")             # 문제 링크 (선택)
    code: Mapped[str] = mapped_column(Text, default="")                   # 제출 코드
    approach: Mapped[str] = mapped_column(Text, default="")               # 풀이 방법/접근
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class NpcRelationship(Base):
    __tablename__ = "npc_relationship"
    __table_args__ = (UniqueConstraint("npc_a", "npc_b", name="uq_npc_pair"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    npc_a: Mapped[str] = mapped_column(String(40), index=True)  # 정렬된 대표 종류
    npc_b: Mapped[str] = mapped_column(String(40), index=True)
    affinity: Mapped[int] = mapped_column(Integer, default=0)   # 친밀도 -100..100
    vibe: Mapped[str] = mapped_column(String(60), default="그냥 아는 사이")
    last_event: Mapped[str] = mapped_column(Text, default="")
    history: Mapped[list[str]] = mapped_column(JSON, default=list)  # 최근 사건들(롤링)
    meet_count: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CsNoteLog(Base):
    __tablename__ = "cs_note_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    study_date: Mapped[date] = mapped_column(Date, index=True)
    category: Mapped[str] = mapped_column(String(60), default="")          # 운영체제 / 네트워크 / DB / 자료구조 등
    title: Mapped[str] = mapped_column(String(200), default="")            # 제목
    content: Mapped[str] = mapped_column(Text, default="")                # 공부한 내용
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
