from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, JSON, String, Text, UniqueConstraint, func
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


class CommissionRequest(Base):
    """홈페이지 제작 의뢰 접수 건 — 마을 지하 '의뢰 공방'의 접수원 NPC가 상담해 만든다.

    다른 테이블과 달리 **외부인이 쓰는 유일한 테이블**이다. 그래서
    - 연락처는 최소 수집(이메일만 필수)이고,
    - estimate_* 는 확정 견적이 아니라 참고 범위다(schemas 의 면책 문구 참고).
    3단계(에이전트 제작)에서 CommissionTask/Artifact 가 이 행을 부모로 붙는다.
    """

    __tablename__ = "commission_request"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    public_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)  # 방문자 조회용 접수번호
    session_id: Mapped[str] = mapped_column(String(120), default="", index=True)

    contact_name: Mapped[str] = mapped_column(String(80), default="")
    contact_email: Mapped[str] = mapped_column(String(200), default="")
    contact_phone: Mapped[str] = mapped_column(String(60), default="")
    org: Mapped[str] = mapped_column(String(160), default="")

    site_type: Mapped[str] = mapped_column(String(60), default="")   # 랜딩/기업소개/쇼핑몰/예약/포트폴리오/기타
    summary: Mapped[str] = mapped_column(Text, default="")           # 한 줄 요약
    requirements: Mapped[dict] = mapped_column(JSON, default=dict)   # {pages: [], features: [], tone: "", references: []}
    budget_hint: Mapped[str] = mapped_column(String(120), default="")
    deadline_hint: Mapped[str] = mapped_column(String(120), default="")

    # 참고 견적 범위 (원 / 주). 0 이면 산출 못 한 것.
    estimate_min: Mapped[int] = mapped_column(Integer, default=0)
    estimate_max: Mapped[int] = mapped_column(Integer, default=0)
    weeks_min: Mapped[int] = mapped_column(Integer, default=0)
    weeks_max: Mapped[int] = mapped_column(Integer, default=0)
    estimate_reason: Mapped[str] = mapped_column(Text, default="")

    status: Mapped[str] = mapped_column(String(30), default="received", index=True)
    admin_note: Mapped[str] = mapped_column(Text, default="")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CommissionMessage(Base):
    """접수원 NPC ↔ 방문자 상담 로그.

    상담은 접수 **이전에** 시작되므로 commission_id 는 나중에 채워진다.
    그전까지는 session_id 로만 묶인다.
    """

    __tablename__ = "commission_message"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(120), default="", index=True)
    commission_id: Mapped[int | None] = mapped_column(Integer, default=None, index=True)
    role: Mapped[str] = mapped_column(String(20), default="visitor")  # visitor | npc
    content: Mapped[str] = mapped_column(Text, default="")
    used_ai: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class CommissionTask(Base):
    """접수 건 하나에 딸린 직군별 작업. 3단계 에이전트의 실행 단위다.

    한 접수 건은 태스크를 최대 4개 갖는다(planner/designer/frontend/backend).
    planner 는 게이트1 승인 시 곧바로 만들어지고, 나머지 셋은 **게이트2를
    통과해야** 만들어진다 — 승인 없이 작업이 시작되지 않는다는 규칙을
    행의 존재 자체로 표현한 것이다. 전이 규칙은 app/agents/gate.py 참고.

    status:
      ready    실행 대기 (관리자가 승인한 상태)
      running  에이전트 실행 중
      review   실행 끝. **관리자 검수 대기** — 여기서 반드시 멈춘다
      approved 검수 통과
      rejected 반려됨. feedback 을 안고 다시 ready 로 돌아간다
      failed   실행 실패 (error 참고)
    """

    __tablename__ = "commission_task"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    commission_id: Mapped[int] = mapped_column(Integer, index=True)
    role: Mapped[str] = mapped_column(String(20), index=True)  # planner|designer|frontend|backend
    status: Mapped[str] = mapped_column(String(20), default="ready", index=True)
    round: Mapped[int] = mapped_column(Integer, default=1)  # 반려로 재실행될 때마다 +1

    brief: Mapped[str] = mapped_column(Text, default="")     # 이 직군에 전달된 지시(기획 산출물에서 옴)
    feedback: Mapped[str] = mapped_column(Text, default="")  # 관리자가 반려하며 남긴 말. 다음 실행 프롬프트에 들어간다
    log: Mapped[str] = mapped_column(Text, default="")       # 마지막 실행에서 에이전트가 남긴 요약
    error: Mapped[str] = mapped_column(Text, default="")

    cost_usd: Mapped[float] = mapped_column(Float, default=0.0)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)

    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CommissionArtifact(Base):
    """에이전트가 실제로 만든 파일 한 개.

    파일 본문은 DB가 아니라 workspace/commissions/<public_id>/ 아래 디스크에 있다.
    이 행은 목록·미리보기를 위한 색인이라, 실행이 끝날 때마다 디렉터리를 훑어
    통째로 다시 만든다(app/agents/workspace.py 의 collect_artifacts).
    그래서 rel_path 가 사실상의 키다.
    """

    __tablename__ = "commission_artifact"
    __table_args__ = (UniqueConstraint("commission_id", "rel_path", name="uq_artifact_path"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    commission_id: Mapped[int] = mapped_column(Integer, index=True)
    task_id: Mapped[int] = mapped_column(Integer, index=True)
    rel_path: Mapped[str] = mapped_column(String(400))  # 작업 공간 루트 기준 상대경로
    kind: Mapped[str] = mapped_column(String(20), default="other")  # markdown|html|other
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
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
