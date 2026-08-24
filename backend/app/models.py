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
    # ── 갓생 섬(/island) 전용 칸 ──
    # ActivityOut(공개 스키마)에는 **일부러 안 넣는다** — /activity/today 는 손님도
    # 부르는 공개 라우트라, 여기에 링크를 실으면 내 노션 주소가 그대로 노출된다.
    # 섬 전용 스키마(IslandTodayOut)로만 나간다.
    notion_done: Mapped[bool] = mapped_column(Boolean, default=False)
    notion_url: Mapped[str] = mapped_column(String(400), default="")
    notion_title: Mapped[str] = mapped_column(String(200), default="")
    # solved.ac 의 '푼 문제 총합' 스냅샷. 오늘 푼 수 = 오늘 총합 − 직전 기록일 총합.
    # 차이를 매번 다시 계산하지 않고 결과를 따로 저장하는 이유: 하루에 여러 번
    # 새로고침해도 값이 흔들리면 안 되고, 판정 함수(quest_flags)가 '어제 행'을
    # 알 필요 없이 순수하게 유지돼야 하기 때문이다.
    boj_solved_total: Mapped[int] = mapped_column(Integer, default=0)
    boj_solved_today: Mapped[int] = mapped_column(Integer, default=0)
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
    # 2026-08-22 부터 **실제 npc_id**(정렬)다. 그 전엔 대표 종류(guide/project…)였는데
    # 프로젝트 NPC 9명이 테오와 관계 한 줄을 공유하는 꼴이었다. 옛 종류-키 행은
    # relationship_service.purge_legacy_kind_rows 가 시작 시 지운다.
    # String(40) 은 SQLite 가 길이를 강제하지 않아 그대로 둔다.
    npc_a: Mapped[str] = mapped_column(String(40), index=True)
    npc_b: Mapped[str] = mapped_column(String(40), index=True)
    affinity: Mapped[int] = mapped_column(Integer, default=0)   # 친밀도 -100..100
    vibe: Mapped[str] = mapped_column(String(60), default="그냥 아는 사이")
    last_event: Mapped[str] = mapped_column(Text, default="")
    history: Mapped[list[str]] = mapped_column(JSON, default=list)  # 최근 사건들(롤링)
    meet_count: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class NpcMemory(Base):
    """NPC 한 명의 기억 한 줄.

    관계 시스템 2단계에서 생겼다. 전엔 마을 전체가 문자열 6개(`npcMemoryRef`)를
    공유하고 새로고침이면 날아갔다. 여기는 NPC 별로 쌓이고 남는다.
      kind: encounter(마주침) | incident(사건) | gossip(남에게 들음) | visitor(방문자 대화)
      about_npc_id: 그 기억이 누구에 관한 것인지 ("" 이면 불특정)
    NPC 당 30개만 남긴다(memory_service.remember 가 자른다).
    """

    __tablename__ = "npc_memory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    npc_id: Mapped[str] = mapped_column(String(120), index=True)
    about_npc_id: Mapped[str] = mapped_column(String(120), default="", index=True)
    kind: Mapped[str] = mapped_column(String(20), default="encounter")
    text: Mapped[str] = mapped_column(Text, default="")
    # 그 기억이 관계를 어느 쪽으로 움직였는지. 뒷담화가 친밀도에 번질 때 부호로 쓴다.
    # (기존 DB 는 database._ensure_npc_memory_columns 가 채운다)
    delta: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class VisitorBond(Base):
    """방문자 ↔ NPC 호감 — 익명 visitor_id(브라우저 uuid) 단위의 '단골' 점수.

    대화할수록(하루 NPC 당 +2 상한), 부탁을 이행하면(+4) 오른다. 개인정보는 없다.
    """

    __tablename__ = "visitor_bond"
    __table_args__ = (UniqueConstraint("visitor_id", "npc_id", name="uq_visitor_bond"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    visitor_id: Mapped[str] = mapped_column(String(80), index=True)
    npc_id: Mapped[str] = mapped_column(String(120), index=True)
    score: Mapped[int] = mapped_column(Integer, default=0)
    visits: Mapped[int] = mapped_column(Integer, default=0)
    # 마지막 대화 시각 + "오늘 오른 폭" (하루 상한 계산용)
    last_day: Mapped[str] = mapped_column(String(10), default="")
    gained_today: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class NpcFavor(Base):
    """NPC 가 방문자에게 건넨 부탁 — "픽셀한테 내가 미안해한다고 전해 줄래?".

    서먹한 상대(친밀도 ≤ SOUR)가 있을 때 대화 중 가끔 생긴다. NPC 당 미완료 1개.
    방문자가 about 쪽 NPC 에게 긍정 relay 를 전하면 이행(fulfilled_at)되고 보상이 +4 로 커진다.
    """

    __tablename__ = "npc_favor"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    npc_id: Mapped[str] = mapped_column(String(120), index=True)  # 부탁한 NPC
    about_npc_id: Mapped[str] = mapped_column(String(120), index=True)  # 전해 받을 NPC
    text: Mapped[str] = mapped_column(String(240), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    fulfilled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class RelationshipMilestone(Base):
    """관계 연표 — 절친/앙숙/화해/틀어짐의 **영구** 기록.

    NpcRelationship.history 는 6개 롤링이라 한 달 뒤엔 다 잊는다. 여기는 지우지 않는다.
    "싸움 3 · 화해 2" 같은 장기 서사는 이 표에서 센다.
    """

    __tablename__ = "relationship_milestone"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    npc_a: Mapped[str] = mapped_column(String(120), index=True)
    npc_b: Mapped[str] = mapped_column(String(120), index=True)
    milestone: Mapped[str] = mapped_column(String(40), default="")
    source: Mapped[str] = mapped_column(String(20), default="encounter")  # encounter | gossip | relay
    affinity: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class VillageEvent(Base):
    """마을 소식 — NPC 사이에 일어난 사건 한 줄. `GET /npc/news` 가 읽는다.

    관계가 바뀌어도 방문자 눈엔 안 보였다. 마주침 결과 중 눈에 띄는 것
    (|delta| ≥ 2, 사건, 마일스톤)만 여기 적는다.
    """

    __tablename__ = "village_event"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    emoji: Mapped[str] = mapped_column(String(8), default="")
    text: Mapped[str] = mapped_column(String(240), default="")
    npc_a: Mapped[str] = mapped_column(String(120), default="")
    npc_b: Mapped[str] = mapped_column(String(120), default="")
    delta: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class CommissionRequest(Base):
    """홈페이지 제작 의뢰 접수 건 — 마을 지하 '의뢰 공방'의 접수원 NPC가 상담해 만든다.

    다른 테이블과 달리 **외부인이 쓰는 유일한 테이블**이다. 그래서
    - 연락처는 최소 수집(이메일만 필수)이고,
    - estimate_* 는 확정 견적이 아니라 참고 범위다(schemas 의 면책 문구 참고).
    3단계(에이전트 제작)에서 CommissionTask/Artifact 가 이 행을 부모로 붙는다.
    """

    __tablename__ = "commission_request"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    public_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)  # 방문자에게 알려주는 접수번호
    # 심화 문답으로 돌아오는 열쇠. **public_id 와 역할이 다르다** — public_id 는
    # 8 hex 라 사람이 받아적을 수 있는 대신 열거를 시도할 수 있어서, 조회 키로는
    # 쓰지 않는다. 이 토큰이 링크에 담기고, 이걸 쥔 사람만 자기 접수 건에 닿는다.
    access_token: Mapped[str] = mapped_column(String(64), default="", index=True)
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

    # 체리(기획)가 산출물에 적은 "확인 필요"를 손님이 답할 수 있는 문장으로 바꾼 것.
    # [{"id": "q1", "question": "...", "answer": ""}] — 답이 차면 answer 가 붙는다.
    #
    # **파이프라인이 자기 구멍을 스스로 메우는 자리다.** 접수 때 못 물어본 것을
    # 체리가 발견하면, 지금까지는 문서에 적히고 끝나서 결국 내가 손님에게 다시
    # 연락해야 했다. 이제 그 목록이 심화 문답의 대본이 된다.
    pending_questions: Mapped[list] = mapped_column(JSON, default=list)

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
    # 손님에게 보여줄지. **기본은 False** — 검수 전 산출물이 새 나가면 안 된다.
    # 켜면 심화 문답 화면에 시안이 뜨고, 손님이 그걸 보고 "어디가 아닌지" 말해 준다.
    shared: Mapped[bool] = mapped_column(Boolean, default=False)
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


class CoachNote(Base):
    """갓생 섬 코치의 '오늘의 한마디'. 하루 한 줄.

    저장하는 이유는 비용이 아니라 **일관성**이다. 섬에 다시 들어올 때마다 코치가
    다른 말을 하면 그날의 브리핑이라는 느낌이 사라진다. 하루에 한 번 정하고 그날은
    그 말을 고수한다. (덤으로 AI 호출도 하루 한 번이 된다.)
    """

    __tablename__ = "coach_note"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, unique=True, index=True)
    message: Mapped[str] = mapped_column(Text, default="")
    # 규칙 기반으로 만든 말인지(=OpenAI 없이). 나중에 키를 넣었을 때 그날 것을
    # 다시 만들지 판단하는 근거가 된다.
    from_ai: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

