from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.agents import gate, workspace as agent_workspace
from app.agents.runner import AgentUnavailable, run_task as run_commission_task
from app.config import settings
from app.database import get_db, init_db
from app.models import CommissionRequest, VillageEvent
from app.security import (
    AdminGuard,
    AiRateLimit,
    CommissionRateLimit,
    IslandGuard,
    assert_secret_usable,
    auth_enabled,
    create_admin_token,
    record_commission_success,
    verify_password,
)
from app.schemas import (
    ActivityIn,
    ActivityOut,
    AdminLoginIn,
    AdminLoginOut,
    AdminAuthStatus,
    AdminOverview,
    AnalyticsSummary,
    ChatMessageIn,
    ChatMessageOut,
    ArtifactContentOut,
    CodingTestIn,
    CodingTestOut,
    CommissionAck,
    AiQuestionsIn,
    AiQuestionsOut,
    CommissionDepthAnswersIn,
    CommissionDepthIn,
    CommissionDepthOut,
    CommissionTrackOut,
    ArtifactShareIn,
    PlannerQuestionsOut,
    SharedArtifactOut,
    CommissionArtifactOut,
    CommissionBoardOut,
    CommissionConsultIn,
    CommissionConsultOut,
    CommissionDraft,
    CommissionDetailOut,
    CommissionIn,
    CommissionOut,
    CommissionStatusIn,
    CommissionTaskOut,
    GateIn,
    CoachChatIn,
    CoachMessageOut,
    CodingMinutesIn,
    CodingTestQuestIn,
    IslandHistoryRow,
    IslandRefreshOut,
    IslandTodayOut,
    NotionQuestIn,
    WorkoutQuestIn,
    TaskRejectIn,
    CsNoteIn,
    CsNoteOut,
    GithubSyncOut,
    ManagedProjectIn,
    ManagedProjectOut,
    NpcEncounterIn,
    NpcEncounterOut,
    NpcGroupChatIn,
    NpcGroupChatOut,
    NpcRelationshipOut,
    NpcMemoryOut,
    NpcRelationshipRow,
    AdminAffinityIn,
    FavorOut,
    RelayOut,
    SocietyResetOut,
    VisitorBondOut,
    VillageEventOut,
    NpcConversationLogOut,
    NpcPresetIn,
    NpcPresetOut,
    NpcTickIn,
    NpcTickOut,
    VillageBuildingOverrideIn,
    VillageBuildingOverrideOut,
    VillageState,
    VisitorEventIn,
    VisitorEventOut,
)
from app.services.admin_service import (
    admin_overview_payload,
    analytics_summary,
    apply_village_overrides,
    list_npc_logs,
    list_npc_presets,
    list_projects,
    list_village_overrides,
    log_npc_conversation,
    record_visitor_event,
    seed_admin_defaults,
    update_npc_preset,
    update_project,
    update_village_override,
)
from app.services.activity_service import get_or_create_today, list_activity_history, upsert_activity
from app.services.chat_service import answer_npc_message, atelier_role_for
from app.services import commission_service
from app.services.commission_service import (
    CommissionRejected,
    apply_gate_decision,
    artifacts_for as commission_artifacts_for,
    consult as commission_consult,
    consult_depth as commission_consult_depth,
    generate_ai_questions,
    save_depth_form,
    stored_ai_questions,
    stored_branch_answers,
    create_commission,
    depth_questions_for,
    draft_from_commission,
    ensure_access_token,
    get_by_token as commission_by_token,
    import_planner_questions,
    shared_artifact_for,
    delete_commission,
    get_artifact as commission_get_artifact,
    get_commission,
    get_task as commission_get_task,
    list_commissions,
    messages_for,
    notify_discord,
    recent_messages as commission_recent_messages,
    reject_task as reject_commission_task,
    save_message as save_commission_message,
    store_depth_answers,
    tasks_for as commission_tasks_for,
    update_status as update_commission_status,
    worklog_lines as commission_worklog,
)
from app.services.github_service import fetch_today_commit_count
from app.services.learning_service import (
    count_coding_tests,
    count_coding_tests_today,
    count_cs_notes,
    count_cs_notes_today,
    create_coding_test,
    create_cs_note,
    delete_coding_test,
    delete_cs_note,
    list_coding_tests,
    list_cs_notes,
    update_coding_test,
    update_cs_note,
)
from app.services import memory_service, relay_service
from app.services.npc_brain_service import generate_group_chat, generate_npc_encounter, generate_npc_tick
from app.services.relationship_rules import decide_outcome, josa
from app.services.relationship_service import (
    apply_outcome,
    get_or_create as get_or_create_relationship,
    list_all as list_relationships,
    milestone_counts,
    purge_legacy_kind_rows,
    relationship_context,
    prune_events,
    relationship_lines_for,
    seed_village_if_empty,
    todays_light_shift,
    admin_set_affinity,
    reset_society,
)
from app.services import favor_service, visitor_service
from app.services.daily_digest_service import ensure_today_digest
from app.services import coach_service, external_service, quest_service
from app.services.village_service import apply_light_shift, derive_village_state

app = FastAPI(title="AI Portfolio Village API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    # 관계가 종류-키에서 NPC id-키로 바뀌었다(2026-08-22). 옛 행은 어떤 id 와도
    # 안 맞으니 한 번 지운다. 빈 DB 에선 아무 일도 안 한다.
    from app.database import SessionLocal

    with SessionLocal() as db:
        purge_legacy_kind_rows(db)
        # 빈 DB 면 씨앗 관계 + 소식 몇 줄 — 첫 방문자가 텅 빈 마을을 보지 않게
        seed_village_if_empty(db)
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        seed_admin_defaults(db)
    finally:
        db.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/admin/auth-status", response_model=AdminAuthStatus)
def admin_auth_status() -> AdminAuthStatus:
    return AdminAuthStatus(auth_enabled=auth_enabled())


@app.post("/admin/login", response_model=AdminLoginOut)
def admin_login(payload: AdminLoginIn) -> AdminLoginOut:
    assert_secret_usable()
    if not verify_password(payload.password):
        raise HTTPException(status_code=401, detail="비밀번호가 올바르지 않습니다.")
    token = create_admin_token() if auth_enabled() else ""
    return AdminLoginOut(token=token, auth_enabled=auth_enabled())


@app.get("/activity/today", response_model=ActivityOut)
def activity_today(db: Session = Depends(get_db)):
    return get_or_create_today(db)


@app.post("/activity", response_model=ActivityOut, dependencies=[AdminGuard])
def save_activity(payload: ActivityIn, db: Session = Depends(get_db)):
    return upsert_activity(db, payload)


@app.get("/activity/history", response_model=list[ActivityOut])
def activity_history(days: int = 120, db: Session = Depends(get_db)):
    return list_activity_history(db, days)


# ─────────────────────────── 갓생 섬 (/island) ───────────────────────────
#
# 전부 IslandGuard 뒤에 있다. 여기 있는 건 손님용 데이터가 아니라 내 하루 기록이다.
# 마을 라우트와 달리 공개판이 하나도 없다는 점이 이 구역의 규칙이다.


@app.get("/island/today", response_model=IslandTodayOut, dependencies=[IslandGuard])
def island_today(db: Session = Depends(get_db)):
    return quest_service.today_snapshot(db)


@app.get("/island/history", response_model=list[IslandHistoryRow], dependencies=[IslandGuard])
def island_history(days: int = 30, db: Session = Depends(get_db)):
    return quest_service.history_rows(db, days)


@app.post("/island/quest/workout", response_model=IslandTodayOut, dependencies=[IslandGuard])
def island_quest_workout(payload: WorkoutQuestIn, db: Session = Depends(get_db)):
    quest_service.set_workout(db, payload.done, payload.minutes, payload.workout_type)
    return quest_service.today_snapshot(db)


@app.post("/island/quest/notion", response_model=IslandTodayOut, dependencies=[IslandGuard])
def island_quest_notion(payload: NotionQuestIn, db: Session = Depends(get_db)):
    quest_service.set_notion(db, payload.url, payload.title)
    return quest_service.today_snapshot(db)


@app.post("/island/refresh", response_model=IslandRefreshOut, dependencies=[IslandGuard])
async def island_refresh(db: Session = Depends(get_db)):
    """섬에 들어올 때 자동으로 채울 수 있는 것들을 채운다.

    **여기서 나는 어떤 실패도 500 이 되지 않는다.** 깃허브가 죽든 solved.ac 가
    막히든, 오늘 화면은 떠야 하고 손으로 찍는 길은 열려 있어야 한다. 실패는
    `notes` 에 안내 문구로 담아 돌려준다.
    """
    filled: list[str] = []
    notes: list[str] = []

    # ── 깃허브 커밋 ──
    if settings.github_token:
        try:
            commits = await fetch_today_commit_count()
            quest_service.set_github_commits(db, commits)
            if commits:
                filled.append(f"깃허브 커밋 {commits}개")
        except Exception:
            notes.append("깃허브를 불러오지 못했어요. 코딩 칸은 직접 적으면 됩니다.")
    else:
        notes.append("GITHUB_TOKEN 이 없어 커밋 자동 조회를 건너뛰었어요.")

    # ── 백준(solved.ac) ──
    if settings.boj_handle.strip():
        total = await external_service.fetch_boj_solved_total()
        if total is None:
            notes.append("solved.ac 에 닿지 못했어요. 코테는 링크로 남기면 됩니다.")
        else:
            solved_today = quest_service.apply_boj_snapshot(db, total)
            if solved_today:
                filled.append(f"백준 {solved_today}문제")
    else:
        notes.append("BOJ_HANDLE 이 없어 백준 자동 조회를 건너뛰었어요.")

    return IslandRefreshOut(today=quest_service.today_snapshot(db), filled=filled, notes=notes)


@app.post("/island/quest/coding-test", response_model=IslandTodayOut, dependencies=[IslandGuard])
async def island_quest_coding_test(payload: CodingTestQuestIn, db: Session = Depends(get_db)):
    """링크 하나로 코테 기록 남기기. 제목이 비면 긁어서 채우되, 못 긁어도 저장은 된다."""
    url = payload.url.strip()
    title = payload.title.strip()
    platform = payload.platform.strip() or external_service.platform_of(url)

    if not title and url:
        title = await external_service.fetch_link_title(url)

    if not title and not url:
        raise HTTPException(status_code=400, detail="링크나 제목 중 하나는 필요해요.")

    # 제목을 못 긁었어도 **저장은 반드시 성공해야 한다.** CodingTestIn.title 은
    # 최소 1글자를 요구하므로(빈 제목으로는 저장이 막힌다), 링크에서 알아낼 수
    # 있는 만큼으로 대체 제목을 만든다. 남의 사이트가 죽었다고 내 오늘 기록이
    # 안 남으면 안 된다 — 백준이 실제로 그렇게 됐다.
    if not title:
        problem_no = external_service.problem_no_of(url)
        title = f"{platform} {problem_no}번".strip() if problem_no else url[:200]

    create_coding_test(
        db,
        CodingTestIn(
            solved_date=None,
            platform=platform,
            problem_no=external_service.problem_no_of(url),
            title=title,
            difficulty="",
            language="",
            url=url,
            code="",
            approach="",
        ),
    )
    return quest_service.today_snapshot(db)


@app.post("/island/quest/coding", response_model=IslandTodayOut, dependencies=[IslandGuard])
def island_quest_coding(payload: CodingMinutesIn, db: Session = Depends(get_db)):
    """커밋 없이 코딩만 한 날의 수동 입력. 커밋이 있으면 이걸 안 눌러도 자동으로 채워진다."""
    quest_service.set_coding_minutes(db, payload.minutes)
    return quest_service.today_snapshot(db)


@app.get("/island/coach", response_model=CoachMessageOut, dependencies=[IslandGuard])
async def island_coach_briefing(db: Session = Depends(get_db)):
    """오늘의 브리핑. 하루 한 번 만들고 그날은 그 말을 고수한다."""
    message, from_ai = await coach_service.daily_briefing(db)
    return CoachMessageOut(message=message, from_ai=from_ai)


@app.post("/island/coach/chat", response_model=CoachMessageOut, dependencies=[IslandGuard])
async def island_coach_chat(payload: CoachChatIn, db: Session = Depends(get_db)):
    """코치와 대화.

    **`/npc/chat`(공개)에 얹지 않고 여기 따로 둔 이유**: 코치는 내 운동 기록과
    연속 기록을 프롬프트에 담는다. 그 대화창이 공개 라우트에 있으면 남이 내
    하루를 물어볼 수 있다. AiRateLimit 도 안 붙인다 — 여기는 나 혼자 쓰고,
    IslandGuard 가 이미 남을 막는다.
    """
    message, from_ai = await coach_service.reply(db, payload.message)
    return CoachMessageOut(message=message, from_ai=from_ai)


@app.get("/village-state", response_model=VillageState)
def village_state(db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    state = derive_village_state(
        activity,
        coding_today=count_coding_tests_today(db),
        coding_total=count_coding_tests(db),
        cs_today=count_cs_notes_today(db),
        cs_total=count_cs_notes(db),
    )
    # 관리자 override 가 최종 — 그 위에 오늘의 관계 마일스톤(싸움 −1칸 / 화해 +1칸)만 얹는다
    return apply_light_shift(apply_village_overrides(db, state), todays_light_shift(db))


@app.post("/npc/chat", response_model=ChatMessageOut, dependencies=[AiRateLimit])
async def npc_chat(payload: ChatMessageIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    is_overseer = payload.npc_id == "overseer-npc" or "overseer" in payload.npc_id

    # 총괄 NPC는 마을 전체 데이터를 안다 — 전체 코테/CS + 활동 히스토리 + 마을 상태를 함께 넘긴다.
    coding_limit = None if is_overseer else 12
    activity_history = list_activity_history(db, 140) if is_overseer else None
    village_state_ctx = None
    if is_overseer:
        village_state_ctx = apply_village_overrides(
            db,
            derive_village_state(
                activity,
                coding_today=count_coding_tests_today(db),
                coding_total=count_coding_tests(db),
                cs_today=count_cs_notes_today(db),
                cs_total=count_cs_notes(db),
            ),
        )

    # 공방 팀원이면 자기 직군의 작업 현황을 들려 보낸다 (접수번호·상태까지만)
    atelier_role = atelier_role_for(payload.npc_id)
    atelier_work = commission_worklog(db, atelier_role) if atelier_role else None

    # 단골 점수 — 대화 한 번마다. 답변 생성 전에 올려서 프롬프트에 최신 등급이 들어간다 (5단계 E-9)
    bond = visitor_service.bump(db, payload.visitor_id, payload.npc_id)
    bond_line = visitor_service.prompt_line(bond)
    # NPC 의 부탁은 **답변 생성 전에** 판정한다 — 그래야 대사에 부탁이 자연스럽게 섞인다 (5단계 D-2)
    favor = favor_service.maybe_issue(db, payload.npc_id)
    favor_lines = (
        [f"[지금 이 대화에서] 방문자에게 이렇게 부탁하려던 참이다: '{favor.text}' — 답변 끝에 자연스럽게 이 부탁을 꺼내라."]
        if favor is not None
        else []
    )
    reply, used_ai, suggested_action, mention = await answer_npc_message(
        payload.npc_id,
        payload.message,
        activity,
        payload.recent_messages,
        coding_tests=list_coding_tests(db, limit=coding_limit),
        cs_notes=list_cs_notes(db, limit=coding_limit),
        activity_history=activity_history,
        village_state=village_state_ctx,
        atelier_work=atelier_work,
        memory_lines=[
            # 현재 관계 온도(누구와 서먹한지) → 기억(사건 문장) → 이 방문자와의 과거 → 부탁 순
            *relationship_lines_for(db, payload.npc_id),
            *memory_service.memory_lines_for_prompt(db, payload.npc_id),
            *([bond_line] if bond_line else []),
            *memory_service.visitor_history(db, payload.npc_id, payload.visitor_id),
            *favor_lines,
        ],
    )
    if favor is not None:
        # 모델이 부탁을 대사에 안 녹였으면(상대 이름이 답변에 없음) 끝에 직접 붙인다.
        # 폴백 대사는 항상 부탁을 모른 채 나오므로 같은 길로 온다.
        about_name = memory_service.display_name(favor.about_npc_id)
        if not used_ai or about_name not in reply:
            reply = f"{reply}\n\n아, 그리고… {favor.text}"
    # 방문자와 나눈 말도 기억에 남긴다 — 원문 40자만(전문은 NpcConversationLog 에 이미 있다).
    # visitor_id 가 있으면 about 에 'visitor:…' 로 묶어 다음 방문 때 알아본다.
    memory_service.remember(
        db,
        payload.npc_id,
        f"방문자가 '{payload.message.strip()[:40]}' 하고 물어봤다",
        about=memory_service.visitor_key(payload.visitor_id) if payload.visitor_id.strip() else "",
        kind="visitor",
    )
    log_npc_conversation(
        db,
        payload.npc_id,
        payload.message,
        reply,
        used_ai,
        suggested_action.action_id if suggested_action else "",
    )
    # 방문자 개입 — 다른 NPC 얘기를 감정 담아 전했으면 그 둘 사이가 움직인다.
    # 감지는 두 겹: 사전 규칙(detect_relay, 오탐 필터 검증됨)이 우선, 놓치면 모델이 답변과 함께
    # 감지한 mention(resolve_mention 으로 규칙 검증)을 쓴다. 적용(±2)은 언제나 규칙 (5단계 D-5).
    relay_out = None
    relay = relay_service.detect_relay(payload.message, payload.npc_id)
    if relay is None and used_ai and mention is not None:
        relay = relay_service.resolve_mention(
            mention.name, mention.sentiment, payload.npc_id, snippet=payload.message.strip()
        )
    if relay is not None:
        applied = relay_service.apply_relay(db, payload.npc_id, relay)
        if applied.favor_done:
            # 부탁했던 NPC(= 전달받은 상대, relay.about)가 방문자를 더 좋아하게 된다
            visitor_service.favor_bonus(db, payload.visitor_id, relay.about_npc_id)
        relay_out = RelayOut(
            about_npc_id=relay.about_npc_id,
            about_name=relay.about_name,
            delta=applied.delta,
            milestone=applied.milestone,
            news=VillageEventOut.model_validate(applied.news) if applied.news is not None else None,
            favor_done=applied.favor_done,
        )
    favor_out = None
    if favor is not None:
        favor_out = FavorOut(
            id=favor.id,
            npc_id=favor.npc_id,
            npc_name=memory_service.display_name(favor.npc_id),
            about_npc_id=favor.about_npc_id,
            about_name=memory_service.display_name(favor.about_npc_id),
            text=favor.text,
        )
    return ChatMessageOut(
        npc_id=payload.npc_id,
        reply=reply,
        used_ai=used_ai,
        suggested_action=suggested_action,
        relay=relay_out,
        favor=favor_out,
        bond=VisitorBondOut(level=visitor_service.level(bond.score), score=bond.score) if bond is not None else None,
    )


@app.post("/npc/tick", response_model=NpcTickOut, dependencies=[AiRateLimit])
async def npc_tick(payload: NpcTickIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    return await generate_npc_tick(payload, activity)


@app.post("/npc/encounter", response_model=NpcEncounterOut, dependencies=[AiRateLimit])
async def npc_encounter(payload: NpcEncounterIn, db: Session = Depends(get_db)):
    """두 NPC 의 마주침. 순서가 중요하다:

    1. 규칙(relationship_rules)이 **결과**를 정한다 — 친밀도 변화·이유·기분.
    2. 모델은 그 결과가 드러나는 대사만 쓴다(실패하면 폴백 대사).
    3. 관계·기억·뒷담화·마을 소식에 저장한다.
    모델이 돌려주는 친밀도는 어디에도 쓰지 않는다.
    """
    a_id, b_id = payload.npc_a.npc_id, payload.npc_b.npc_id
    activity = get_or_create_today(db)
    rel = get_or_create_relationship(db, a_id, b_id)
    if rel is None:
        raise HTTPException(status_code=400, detail="같은 NPC 끼리는 마주칠 수 없어요.")

    name_a, name_b = memory_service.display_name(a_id), memory_service.display_name(b_id)
    # 편 들기 규칙(C-14)용 — 마을 전체 친밀도 표. 행 수가 수백이라 매번 읽어도 싸다.
    affinities = {frozenset((r.npc_a, r.npc_b)): r.affinity for r in list_relationships(db)}
    outcome = decide_outcome(
        a_id,
        b_id,
        payload.npc_a.mood,
        payload.npc_b.mood,
        activity,
        rel.affinity,
        name_a=name_a,
        name_b=name_b,
        affinities=affinities,
        name_of=memory_service.display_name,
    )
    known = memory_service.about(db, a_id, b_id)
    rel_ctx = relationship_context(
        db, a_id, b_id, known_lines=[f"{name_a}가 {name_b}에 대해 기억하는 것: " + "; ".join(known)] if known else None
    )
    result = await generate_npc_encounter(
        payload.npc_a,
        payload.npc_b,
        payload.recent_memory,
        activity,
        outcome,
        rel_ctx,
        memory_lines=memory_service.memory_lines_for_prompt(db, a_id, b_id),
    )

    rel, milestone = apply_outcome(db, a_id, b_id, outcome.delta, outcome.reason)
    if rel is not None:
        result.relationship = NpcRelationshipOut(
            npc_a=rel.npc_a,
            npc_b=rel.npc_b,
            affinity=rel.affinity,
            vibe=rel.vibe,
            delta=outcome.delta,
            event=outcome.reason,
            milestone=milestone,
        )

        # 각자의 기억 + 뒷담화
        memory_kind = "incident" if outcome.kind == "incident" else "encounter"
        memory_service.remember(
            db, a_id, f"{name_b} 만남 — {outcome.reason}", about=b_id, kind=memory_kind, delta=outcome.delta
        )
        memory_service.remember(
            db, b_id, f"{name_a} 만남 — {outcome.reason}", about=a_id, kind=memory_kind, delta=outcome.delta
        )
        # 뒷담화는 **친밀도에도 번진다** — 듣는 이와 제3자 사이가 들은 얘기의 부호대로 ±1.
        # 관계가 셋 이상으로 퍼지는 유일한 경로라 소식에도 남긴다.
        for teller, listener in ((a_id, b_id), (b_id, a_id)):
            planted = memory_service.gossip(db, teller, listener)
            if planted is None or planted.delta == 0 or planted.about_npc_id == listener:
                continue
            step = 1 if planted.delta > 0 else -1
            third = planted.about_npc_id
            third_name = memory_service.display_name(third)
            listener_name = memory_service.display_name(listener)
            teller_name = memory_service.display_name(teller)
            _, g_milestone = apply_outcome(
                db, listener, third, step, f"{teller_name}에게 들은 얘기로", source="gossip"
            )
            feeling = "호감이 생겼다" if step > 0 else "서운해졌다"
            g_text = f"{listener_name}{josa(listener_name, '가')} {teller_name}에게 들은 얘기로 {third_name}에게 {feeling}"
            if g_milestone:
                g_text += f" → {g_milestone}!"
            db.add(VillageEvent(emoji="🗣️", text=g_text[:240], npc_a=listener, npc_b=third, delta=step))
            db.commit()

        # 마을 소식 — 눈에 띄는 것만
        if milestone or outcome.kind == "incident" or abs(outcome.delta) >= 2:
            emoji = (
                "💞" if "절친" in milestone
                else "🤝" if "화해" in milestone
                else "💔" if milestone
                else "💢" if outcome.delta < 0
                else "💚" if outcome.delta > 0
                else "💬"
            )
            text = f"{name_a} ↔ {name_b} · {outcome.reason}"
            # 모델이 쓴 한 줄(memory)을 덧붙이면 템플릿 문장만 반복되는 단조로움이 풀린다. 비용 0.
            if result.used_ai and result.memory and result.memory.strip() not in outcome.reason:
                text += f" — {result.memory.strip()}"
            if milestone:
                text += f" → {milestone}!"
            news = VillageEvent(emoji=emoji, text=text[:240], npc_a=a_id, npc_b=b_id, delta=outcome.delta)
            db.add(news)
            db.commit()
            db.refresh(news)
            result.news = VillageEventOut.model_validate(news)
        prune_events(db)
    return result


@app.get("/npc/news", response_model=list[VillageEventOut])
async def npc_news(limit: int = 12, db: Session = Depends(get_db)):
    """마을 소식 — NPC 사이에 최근 일어난 사건. 읽기 전용, 레이트리밋 없음.

    하루 첫 호출이 어제 요약(📰)을 만든다(daily_digest_service) — 자정 타이머 대신.
    """
    limit = max(1, min(50, limit))
    await ensure_today_digest(db)
    return db.query(VillageEvent).order_by(VillageEvent.created_at.desc(), VillageEvent.id.desc()).limit(limit).all()


@app.post("/admin/npc/society/reset", response_model=SocietyResetOut, dependencies=[AdminGuard])
def admin_reset_society(db: Session = Depends(get_db)):
    """NPC 사회(관계·기억·소식·연표·부탁·단골)만 백지로 되돌리고 씨앗을 다시 심는다.

    활동·코테·CS·의뢰 데이터는 건드리지 않는다. 라이브 데모 전에 마을을 깨끗이 할 때 쓴다.
    """
    removed = reset_society(db)
    seeded = seed_village_if_empty(db)
    return SocietyResetOut(removed=removed, seeded=seeded)


@app.put("/admin/npc/relationships", response_model=NpcRelationshipRow, dependencies=[AdminGuard])
def admin_set_relationship(payload: AdminAffinityIn, db: Session = Depends(get_db)):
    rel = admin_set_affinity(db, payload.npc_a, payload.npc_b, payload.affinity)
    if rel is None:
        raise HTTPException(status_code=400, detail="같은 NPC 끼리는 관계가 없어요.")
    counts = milestone_counts(db).get((rel.npc_a, rel.npc_b), {})
    return NpcRelationshipRow(
        npc_a=rel.npc_a,
        npc_b=rel.npc_b,
        affinity=rel.affinity,
        vibe=rel.vibe,
        meet_count=rel.meet_count,
        fights=counts.get("fights", 0),
        reconciliations=counts.get("reconciliations", 0),
        milestones=counts.get("milestones", []),
        timeline=counts.get("timeline", []),
    )


@app.get("/npc/favors", response_model=list[FavorOut])
def npc_favors(db: Session = Depends(get_db)):
    """미완료 부탁 — 새로고침 뒤에도 HUD 가 보여 주게. 공개, 읽기 전용."""
    return [
        FavorOut(
            id=f.id,
            npc_id=f.npc_id,
            npc_name=memory_service.display_name(f.npc_id),
            about_npc_id=f.about_npc_id,
            about_name=memory_service.display_name(f.about_npc_id),
            text=f.text,
        )
        for f in favor_service.list_pending(db)
    ]


@app.get("/npc/relationships", response_model=list[NpcRelationshipRow])
def npc_relationships(db: Session = Depends(get_db)):
    counts = milestone_counts(db)
    out = []
    for rel in list_relationships(db):
        extra = counts.get((rel.npc_a, rel.npc_b), {})
        out.append(
            NpcRelationshipRow(
                npc_a=rel.npc_a,
                npc_b=rel.npc_b,
                affinity=rel.affinity,
                vibe=rel.vibe,
                meet_count=rel.meet_count,
                fights=extra.get("fights", 0),
                reconciliations=extra.get("reconciliations", 0),
                milestones=extra.get("milestones", []),
                timeline=extra.get("timeline", []),
            )
        )
    return out


@app.get("/npc/memory/{npc_id}", response_model=list[NpcMemoryOut])
def npc_memory(npc_id: str, db: Session = Depends(get_db)):
    """관계도에서 노드를 눌렀을 때 보여 줄 그 NPC 의 기억. 방문자 대화는 뺀다."""
    return memory_service.public_recent(db, npc_id)


@app.post("/npc/group-chat", response_model=NpcGroupChatOut, dependencies=[AiRateLimit])
async def npc_group_chat(payload: NpcGroupChatIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    return await generate_group_chat(
        payload.npc_ids,
        activity,
        payload.recent_memory,
        coding_tests=list_coding_tests(db, limit=8),
        cs_notes=list_cs_notes(db, limit=8),
    )


@app.post("/github/sync", response_model=GithubSyncOut, dependencies=[AdminGuard])
async def github_sync(db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    warning: str | None = None

    if not settings.github_token:
        commits = 0
        warning = "GITHUB_TOKEN이 없어 GitHub 동기화를 건너뛰었습니다. backend/.env에 토큰을 설정하면 오늘 커밋 수를 가져올 수 있습니다."
    else:
        try:
            commits = await fetch_today_commit_count()
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"GitHub API 동기화 실패: {exc}") from exc

    payload = ActivityIn(
        date=activity.date,
        github_commits=commits,
        github_repos=activity.github_repos,
        study_minutes=activity.study_minutes,
        study_topics=activity.study_topics,
        studied_tech=activity.studied_tech,
        coding_minutes=activity.coding_minutes,
        project_minutes=activity.project_minutes,
        workout_done=activity.workout_done,
        workout_minutes=activity.workout_minutes,
        workout_type=activity.workout_type,
        focus_score=activity.focus_score,
        memo=activity.memo,
        mood=activity.mood,
    )
    updated = upsert_activity(db, payload)
    return GithubSyncOut(username=settings.github_username, commits=commits, updated_activity=updated, warning=warning)


@app.post("/analytics/event", response_model=VisitorEventOut)
def create_visitor_event(payload: VisitorEventIn, db: Session = Depends(get_db)):
    return record_visitor_event(db, payload)


@app.get("/admin/overview", response_model=AdminOverview, dependencies=[AdminGuard])
def admin_overview(db: Session = Depends(get_db)):
    return admin_overview_payload(db)


@app.get("/admin/analytics", response_model=AnalyticsSummary, dependencies=[AdminGuard])
def admin_analytics(db: Session = Depends(get_db)):
    return analytics_summary(db)


@app.get("/admin/projects", response_model=list[ManagedProjectOut], dependencies=[AdminGuard])
def admin_projects(db: Session = Depends(get_db)):
    return list_projects(db)


@app.put("/admin/projects/{project_id}", response_model=ManagedProjectOut, dependencies=[AdminGuard])
def admin_update_project(project_id: str, payload: ManagedProjectIn, db: Session = Depends(get_db)):
    return update_project(db, project_id, payload)


@app.get("/admin/npc/logs", response_model=list[NpcConversationLogOut], dependencies=[AdminGuard])
def admin_npc_logs(db: Session = Depends(get_db)):
    return list_npc_logs(db)


@app.get("/npc/presets", response_model=list[NpcPresetOut])
def npc_presets(db: Session = Depends(get_db)):
    return list_npc_presets(db)


@app.get("/admin/npc/presets", response_model=list[NpcPresetOut], dependencies=[AdminGuard])
def admin_npc_presets(db: Session = Depends(get_db)):
    return list_npc_presets(db)


@app.put("/admin/npc/presets/{npc_id}", response_model=NpcPresetOut, dependencies=[AdminGuard])
def admin_update_npc_preset(npc_id: str, payload: NpcPresetIn, db: Session = Depends(get_db)):
    return update_npc_preset(db, npc_id, payload)


@app.get("/admin/village/overrides", response_model=list[VillageBuildingOverrideOut], dependencies=[AdminGuard])
def admin_village_overrides(db: Session = Depends(get_db)):
    return list_village_overrides(db)


@app.put("/admin/village/overrides/{building_id}", response_model=VillageBuildingOverrideOut, dependencies=[AdminGuard])
def admin_update_village_override(
    building_id: str,
    payload: VillageBuildingOverrideIn,
    db: Session = Depends(get_db),
):
    return update_village_override(db, building_id, payload)


# ─────────────────────────── 코딩테스트 풀이 기록 ───────────────────────────

@app.get("/coding-tests", response_model=list[CodingTestOut])
def coding_tests(db: Session = Depends(get_db)):
    return list_coding_tests(db)


@app.post("/admin/coding-tests", response_model=CodingTestOut, dependencies=[AdminGuard])
def admin_create_coding_test(payload: CodingTestIn, db: Session = Depends(get_db)):
    return create_coding_test(db, payload)


@app.put("/admin/coding-tests/{log_id}", response_model=CodingTestOut, dependencies=[AdminGuard])
def admin_update_coding_test(log_id: int, payload: CodingTestIn, db: Session = Depends(get_db)):
    log = update_coding_test(db, log_id, payload)
    if not log:
        raise HTTPException(status_code=404, detail="해당 코딩테스트 기록을 찾을 수 없습니다.")
    return log


@app.delete("/admin/coding-tests/{log_id}", dependencies=[AdminGuard])
def admin_delete_coding_test(log_id: int, db: Session = Depends(get_db)):
    if not delete_coding_test(db, log_id):
        raise HTTPException(status_code=404, detail="해당 코딩테스트 기록을 찾을 수 없습니다.")
    return {"ok": True}


# ─────────────────────────── CS 전공지식 노트 ───────────────────────────

@app.get("/cs-notes", response_model=list[CsNoteOut])
def cs_notes(db: Session = Depends(get_db)):
    return list_cs_notes(db)


@app.post("/admin/cs-notes", response_model=CsNoteOut, dependencies=[AdminGuard])
def admin_create_cs_note(payload: CsNoteIn, db: Session = Depends(get_db)):
    return create_cs_note(db, payload)


@app.put("/admin/cs-notes/{note_id}", response_model=CsNoteOut, dependencies=[AdminGuard])
def admin_update_cs_note(note_id: int, payload: CsNoteIn, db: Session = Depends(get_db)):
    note = update_cs_note(db, note_id, payload)
    if not note:
        raise HTTPException(status_code=404, detail="해당 CS 노트를 찾을 수 없습니다.")
    return note


@app.delete("/admin/cs-notes/{note_id}", dependencies=[AdminGuard])
def admin_delete_cs_note(note_id: int, db: Session = Depends(get_db)):
    if not delete_cs_note(db, note_id):
        raise HTTPException(status_code=404, detail="해당 CS 노트를 찾을 수 없습니다.")
    return {"ok": True}


# ─────────────────────────── 의뢰 공방 (홈페이지 제작 의뢰) ───────────────────────────
#
# /commission/* 는 마을에서 유일하게 외부인이 쓰는 공개 경로다.
# consult 는 AI 리밋을, 접수는 별도의 commission 리밋을 탄다.

@app.post("/commission/consult", response_model=CommissionConsultOut, dependencies=[AiRateLimit])
async def commission_consult_route(payload: CommissionConsultIn, db: Session = Depends(get_db)):
    """접수원 NPC '도안'과의 상담 한 턴."""
    history = payload.recent_messages[-10:]
    if payload.session_id and not history:
        # 새로고침 등으로 프런트 히스토리가 비었으면 DB에서 복구한다
        history = [f"{row.role}: {row.content}" for row in commission_recent_messages(db, payload.session_id)]

    reply, used_ai, draft = await commission_consult(
        payload.message, history, payload.draft, speaker=payload.speaker
    )

    if payload.session_id:
        save_commission_message(db, payload.session_id, "visitor", payload.message)
        save_commission_message(db, payload.session_id, "npc", reply, used_ai=used_ai)

    return CommissionConsultOut(reply=reply, used_ai=used_ai, draft=draft)


# 아래 둘은 NPC 릴레이 설문용이다. LLM 도 DB 도 안 건드리는 순수 계산이라 리밋을
# 안 붙인다 — 선택지를 고를 때마다 불리므로 AI 리밋에 얹으면 설문 한 바퀴에 할당량이 다 샌다.
@app.get("/commission/pricing")
def commission_pricing():
    """견적 규칙표. 프런트가 선택지마다 가산치를 보여주고 누적 견적을 굴리는 데 쓴다."""
    return commission_service.pricing_table()


@app.post("/commission/estimate", response_model=CommissionConsultOut)
def commission_estimate(draft: CommissionDraft):
    """draft 의 견적만 규칙으로 다시 낸다. 화면의 숫자는 참고이고 이 값이 이긴다."""
    fresh = commission_service.estimate_only(draft)
    return CommissionConsultOut(reply="", used_ai=False, draft=fresh)


@app.post("/commission", response_model=CommissionAck, dependencies=[CommissionRateLimit])
async def submit_commission(request: Request, payload: CommissionIn, db: Session = Depends(get_db)):
    """의뢰 접수. 저장에 성공하면 디스코드로 알린다(알림 실패는 접수를 실패시키지 않는다)."""
    try:
        commission = create_commission(db, payload)
    except CommissionRejected as error:
        # 검증에 걸린 요청은 성공 할당량을 깎지 않는다 — 오타 재시도를 막지 않기 위해서.
        raise HTTPException(status_code=400, detail=str(error)) from error

    record_commission_success(request)
    await notify_discord(commission)

    return CommissionAck(
        public_id=commission.public_id,
        status=commission.status,
        message=(
            f"접수되었습니다. 접수번호는 {commission.public_id} 입니다. "
            "정재훈이 직접 내용을 확인한 뒤 남겨주신 이메일로 연락드릴게요."
        ),
        access_token=commission.access_token,
        track_path=f"/commission/{commission.access_token}",
    )


# ─────────────────── 심화 문답 (접수 뒤 2차) ───────────────────
#
# 접수는 "얼마짜리 일인가"까지만 받는다. 실제로 만들 때 필요한 것들(운영 주체·콘텐츠
# 준비·성공 기준·기존 자산)은 여기서 받는다 — **이미 접수한 사람은 이탈 비용이 낮아서**
# 문턱을 올려도 안전하기 때문이다.
#
# 열쇠는 public_id 가 아니라 access_token 이다. public_id 는 8 hex 라 사람이
# 받아적을 수 있는 대신 열거를 시도할 수 있어서, 조회 키로는 쓰지 않는다.


def _load_by_token(db: Session, token: str) -> CommissionRequest:
    commission = commission_by_token(db, token)
    if not commission:
        # 존재하지 않는 토큰과 형식이 틀린 토큰을 구분해 주지 않는다.
        raise HTTPException(status_code=404, detail="접수 내역을 찾을 수 없어요. 링크를 다시 확인해 주세요.")
    return commission


def _track_session(commission: CommissionRequest) -> str:
    """심화 문답 로그를 담을 세션 id. 1차 상담과 **다른 값**을 쓴다.

    같은 session_id 에 이어 붙이면 관리자 화면에서 '접수 전에 나눈 대화'와
    '접수 후 문답'이 한 덩어리로 보여 어느 쪽이 확정된 요구사항인지 흐려진다.
    """
    return f"depth-{commission.public_id}"


@app.get("/commission/track/{token}", response_model=CommissionTrackOut, dependencies=[CommissionRateLimit])
def commission_track(token: str, db: Session = Depends(get_db)):
    """접수 조회 + 심화 문답 진입. **연락처는 절대 담지 않는다** — 링크가 어디로
    전달될지 통제할 수 없으므로, 토큰을 쥔 사람이 볼 수 있는 건 자기가 말한 내용까지다."""
    commission = _load_by_token(db, token)
    draft = draft_from_commission(commission)
    remaining = depth_questions_for(draft)
    past = commission_recent_messages(db, _track_session(commission), limit=40)

    if not remaining:
        greeting = (
            f"접수번호 {commission.public_id} 건은 필요한 내용을 다 받았어요. "
            "덧붙이고 싶은 게 있으면 편하게 남겨주세요."
        )
    elif past:
        # 이어서 하는 사람에게 자기소개를 다시 하지 않는다. 남은 질문만 잇는다.
        greeting = remaining[0]
    else:
        greeting = (
            f"다시 뵙네요. 접수번호 {commission.public_id} 건으로 몇 가지만 더 여쭐게요. "
            "정재훈이 실제로 만들 때 꼭 알아야 하는 것들이라, 답해주시면 결과가 많이 달라져요.\n\n"
            + remaining[0]
        )

    ai_questions, ai_done = stored_ai_questions(commission)
    return CommissionTrackOut(
        public_id=commission.public_id,
        status=commission.status,
        site_type=commission.site_type,
        summary=commission.summary,
        created_at=commission.created_at,
        draft=draft,
        greeting=greeting,
        messages=past,
        preview=_shared_preview(db, commission),
        branch=stored_branch_answers(commission),
        ai_questions=ai_questions,
        ai_questions_done=ai_done,
    )


# 아래 둘은 2층 릴레이 설문용이다 (docs/ATELIER_DEPTH_SCRIPT.md).
# answers 는 LLM 없는 순수 저장이라 리밋을 안 태운다 — 답 하나마다 불리므로
# 시도 리밋(20회/시간)에 태우면 설문 반 바퀴에 손님이 잠긴다. 토큰(32 hex)이
# 곧 자물쇠고, 키 화이트리스트·길이 상한은 서비스가 건다.
@app.post("/commission/track/{token}/answers", response_model=CommissionDepthOut)
def commission_track_answers(
    token: str, payload: CommissionDepthAnswersIn, db: Session = Depends(get_db)
):
    """릴레이 설문의 답 하나를 저장한다. 창을 닫아도 여기까지는 남는다."""
    commission = _load_by_token(db, token)
    commission = save_depth_form(
        db,
        commission,
        slots=payload.slots,
        branch=payload.branch,
        ai_answers=payload.ai_answers,
        pages=payload.pages,
        features=payload.features,
    )
    return CommissionDepthOut(reply="", used_ai=False, draft=draft_from_commission(commission))


# questions 는 의뢰당 **1회만** 실제 생성한다(이후엔 저장본 반환). AI 리밋을 태우면
# 하루 상한을 깎으므로 여기서도 안 태우되, 생성 자체가 1회 멱등이라 비용은 의뢰당 1콜이다.
@app.post("/commission/track/{token}/questions", response_model=AiQuestionsOut)
async def commission_track_questions(
    token: str, payload: AiQuestionsIn, db: Session = Depends(get_db)
):
    """고정 문항이 끝난 뒤, 이 의뢰만 보고 뽑는 AI 맞춤 질문(최대 5개, 없으면 0개)."""
    commission = _load_by_token(db, token)
    questions, generated = await generate_ai_questions(db, commission, payload.asked)
    return AiQuestionsOut(questions=questions, generated=generated)


def _shared_preview(db: Session, commission: CommissionRequest) -> SharedArtifactOut | None:
    """손님에게 공개된 시안 하나. **관리자가 켠 것만** 나간다.

    내용을 통째로 실어 보내고 프런트가 `srcdoc` 으로 띄운다 — 파일마다 공개 주소를
    열어 주면 그 주소가 곧 유출 경로가 되기 때문이다. 토큰을 쥔 사람만 볼 수 있게
    이 응답 안에 담아 보내는 편이 안전하다.
    """
    found = shared_artifact_for(db, commission.id)
    if not found:
        return None

    artifact, content = found
    return SharedArtifactOut(
        id=artifact.id,
        rel_path=artifact.rel_path,
        kind=artifact.kind,
        content=content,
    )


@app.post(
    "/commission/track/{token}/consult",
    response_model=CommissionDepthOut,
    dependencies=[AiRateLimit],
)
async def commission_track_consult(
    token: str, payload: CommissionDepthIn, db: Session = Depends(get_db)
):
    """심화 문답 한 턴. 받은 답은 곧바로 접수 건에 반영한다(중간에 창을 닫아도 남게)."""
    commission = _load_by_token(db, token)
    previous = draft_from_commission(commission)

    session_id = _track_session(commission)
    history = payload.recent_messages[-10:]
    if not history:
        history = [f"{row.role}: {row.content}" for row in commission_recent_messages(db, session_id)]

    reply, used_ai, draft = await commission_consult_depth(payload.message, history, previous)

    save_commission_message(db, session_id, "visitor", payload.message)
    save_commission_message(db, session_id, "npc", reply, used_ai=used_ai)
    store_depth_answers(db, commission, draft)

    return CommissionDepthOut(reply=reply, used_ai=used_ai, draft=draft)


@app.get("/admin/commissions", response_model=list[CommissionOut], dependencies=[AdminGuard])
def admin_commissions(db: Session = Depends(get_db)):
    return list_commissions(db)


@app.get("/admin/commissions/{commission_id}", response_model=CommissionDetailOut, dependencies=[AdminGuard])
def admin_commission_detail(commission_id: int, db: Session = Depends(get_db)):
    commission = get_commission(db, commission_id)
    if not commission:
        raise HTTPException(status_code=404, detail="해당 의뢰를 찾을 수 없습니다.")
    # 이 기능 이전에 들어온 접수 건에는 토큰이 없다. 여는 김에 발급해 준다.
    token = ensure_access_token(db, commission)
    return CommissionDetailOut(
        **CommissionOut.model_validate(commission).model_dump(),
        session_id=commission.session_id,
        track_path=f"/commission/{token}",
        depth_answers={
            label: value
            for label, value in _depth_summary(commission).items()
        },
        messages=messages_for(db, commission) + commission_recent_messages(
            db, _track_session(commission), limit=60
        ),
    )


def _depth_summary(commission: CommissionRequest) -> dict[str, str]:
    """관리자 화면에 보여줄 '제작 정보' 요약. 심화 문답으로 받은 것들이다."""
    from app.services.commission_service import _DEPTH_FIELDS, _DEPTH_LABELS, _depth_value

    draft = draft_from_commission(commission)
    return {
        _DEPTH_LABELS[field]: _depth_value(draft, field)
        for field in _DEPTH_FIELDS
        if _depth_value(draft, field)
    }


@app.patch("/admin/commissions/{commission_id}", response_model=CommissionOut, dependencies=[AdminGuard])
def admin_update_commission(commission_id: int, payload: CommissionStatusIn, db: Session = Depends(get_db)):
    commission = update_commission_status(db, commission_id, payload.status, payload.admin_note)
    if not commission:
        raise HTTPException(status_code=404, detail="해당 의뢰를 찾을 수 없습니다.")
    return commission


@app.delete("/admin/commissions/{commission_id}", dependencies=[AdminGuard])
def admin_delete_commission(commission_id: int, db: Session = Depends(get_db)):
    if not delete_commission(db, commission_id):
        raise HTTPException(status_code=404, detail="해당 의뢰를 찾을 수 없습니다.")
    return {"ok": True}


# ─────────────────── 의뢰 공방 3단계 — 직군별 에이전트 ───────────────────
#
# 진행은 오직 /gate 로만 일어난다. 실행 라우트는 게이트를 통과한 작업만 돌릴 수 있고,
# 실행이 끝나면 반드시 검수 대기에서 멈춘다(app/agents/gate.py).

def _load_commission(db: Session, commission_id: int) -> CommissionRequest:
    commission = get_commission(db, commission_id)
    if not commission:
        raise HTTPException(status_code=404, detail="해당 의뢰를 찾을 수 없습니다.")
    return commission


def _board(db: Session, commission: CommissionRequest) -> CommissionBoardOut:
    by_task: dict[int, list] = {}
    for artifact in commission_artifacts_for(db, commission.id):
        by_task.setdefault(artifact.task_id, []).append(
            CommissionArtifactOut.model_validate(artifact)
        )

    tasks = [
        CommissionTaskOut(
            **CommissionTaskOut.model_validate(task).model_dump(exclude={"artifacts"}),
            artifacts=by_task.get(task.id, []),
        )
        for task in commission_tasks_for(db, commission.id)
    ]
    return CommissionBoardOut(
        commission_id=commission.id,
        public_id=commission.public_id,
        status=commission.status,
        open_gate=gate.gate_for_status(commission.status),
        worker_enabled=settings.agent_worker_enabled,
        tasks=tasks,
    )


@app.get(
    "/admin/commissions/{commission_id}/tasks",
    response_model=CommissionBoardOut,
    dependencies=[AdminGuard],
)
def admin_commission_tasks(commission_id: int, db: Session = Depends(get_db)):
    return _board(db, _load_commission(db, commission_id))


@app.post(
    "/admin/commissions/{commission_id}/gate",
    response_model=CommissionBoardOut,
    dependencies=[AdminGuard],
)
def admin_commission_gate(commission_id: int, payload: GateIn, db: Session = Depends(get_db)):
    """게이트 통과. **작업이 앞으로 나아가는 유일한 입구다.**"""
    commission = _load_commission(db, commission_id)
    try:
        apply_gate_decision(db, commission, payload.gate, payload.decision, payload.feedback)
    except gate.GateViolation as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return _board(db, commission)


@app.post(
    "/admin/commissions/{commission_id}/tasks/{task_id}/run",
    response_model=CommissionBoardOut,
    dependencies=[AdminGuard],
)
async def admin_run_commission_task(
    commission_id: int, task_id: int, db: Session = Depends(get_db)
):
    """에이전트 한 번 실행. AGENT_WORKER_ENABLED 가 켜져 있을 때만 연다."""
    if not settings.agent_worker_enabled:
        raise HTTPException(
            status_code=409,
            detail=(
                "이 서버에서는 에이전트 실행이 꺼져 있습니다. "
                "backend/.env 에 AGENT_WORKER_ENABLED=true 를 넣거나, "
                "터미널에서 `npm run atelier -- <접수번호>` 로 실행해 주세요."
            ),
        )

    commission = _load_commission(db, commission_id)
    task = commission_get_task(db, task_id)
    if not task or task.commission_id != commission.id:
        raise HTTPException(status_code=404, detail="해당 작업을 찾을 수 없습니다.")

    try:
        await run_commission_task(db, commission, task)
    except gate.GateViolation as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except AgentUnavailable as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    return _board(db, commission)


@app.post(
    "/admin/commissions/{commission_id}/questions",
    response_model=PlannerQuestionsOut,
    dependencies=[AdminGuard],
)
def admin_publish_questions(commission_id: int, db: Session = Depends(get_db)):
    """체리의 질문지를 도안의 대본으로 옮긴다.

    **진행이 아니다** — 게이트를 건드리지 않고 상태도 바꾸지 않는다. 손님에게 물어볼
    목록이 생길 뿐이라, `gate.py` 의 불변식과 무관하다.
    """
    commission = _load_commission(db, commission_id)
    root = agent_workspace.workspace_for(commission.public_id)
    text = agent_workspace.read_artifact(root, commission_service.PLANNER_QUESTION_FILE)

    if text is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"{commission_service.PLANNER_QUESTION_FILE} 이 아직 없습니다. "
                "체리(기획)를 먼저 실행해 주세요."
            ),
        )

    questions = import_planner_questions(db, commission, text)
    if not questions:
        raise HTTPException(
            status_code=422,
            detail="질문지에서 질문을 찾지 못했습니다. 파일이 `- 질문` 형식인지 확인해 주세요.",
        )

    return PlannerQuestionsOut(
        questions=questions,
        source=commission_service.PLANNER_QUESTION_FILE,
        message=(
            f"질문 {len(questions)}개를 도안에게 넘겼습니다. "
            "손님이 심화 문답 링크로 들어오면 제작 항목을 받은 뒤 이어서 여쭤봅니다."
        ),
    )


@app.patch(
    "/admin/commissions/{commission_id}/artifacts/{artifact_id}/share",
    response_model=CommissionBoardOut,
    dependencies=[AdminGuard],
)
def admin_share_artifact(
    commission_id: int,
    artifact_id: int,
    payload: ArtifactShareIn,
    db: Session = Depends(get_db),
):
    """산출물 하나를 손님에게 공개/비공개한다.

    공개된 시안은 심화 문답 화면에 뜨고, 손님이 그걸 보고 "어디가 아닌지" 말해 준다.
    **기본은 비공개**이고, 한 번에 하나만 공개된다(마지막에 켠 것이 이긴다) —
    손님에게 파일 목록을 늘어놓는 자리가 아니라 반응을 받아내는 자리라서다.
    """
    commission = _load_commission(db, commission_id)
    artifact = commission_get_artifact(db, artifact_id)
    if not artifact or artifact.commission_id != commission.id:
        raise HTTPException(status_code=404, detail="해당 산출물을 찾을 수 없습니다.")

    commission_service.set_artifact_shared(db, commission, artifact, payload.shared)
    return _board(db, commission)


@app.post(
    "/admin/commissions/{commission_id}/tasks/{task_id}/reject",
    response_model=CommissionBoardOut,
    dependencies=[AdminGuard],
)
def admin_reject_commission_task(
    commission_id: int, task_id: int, payload: TaskRejectIn, db: Session = Depends(get_db)
):
    """직군 하나만 다시 돌린다. 피드백은 다음 실행 프롬프트에 들어간다."""
    commission = _load_commission(db, commission_id)
    task = commission_get_task(db, task_id)
    if not task or task.commission_id != commission.id:
        raise HTTPException(status_code=404, detail="해당 작업을 찾을 수 없습니다.")
    try:
        reject_commission_task(db, task, payload.feedback)
    except gate.GateViolation as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    db.refresh(commission)
    return _board(db, commission)


@app.get(
    "/admin/commissions/{commission_id}/artifacts/{artifact_id}",
    response_model=ArtifactContentOut,
    dependencies=[AdminGuard],
)
def admin_commission_artifact(
    commission_id: int, artifact_id: int, db: Session = Depends(get_db)
):
    """산출물 본문.

    HTML 시안도 여기서 **텍스트로** 내려간다 — 관리자 페이지가 srcdoc + sandbox
    iframe 에 넣어 렌더한다. text/html 로 직접 서빙하면 관리자 오리진에서
    에이전트가 만든 스크립트가 도는 셈이 되므로 그렇게 하지 않는다.
    """
    commission = _load_commission(db, commission_id)
    artifact = commission_get_artifact(db, artifact_id)
    if not artifact or artifact.commission_id != commission.id:
        raise HTTPException(status_code=404, detail="해당 산출물을 찾을 수 없습니다.")

    root = agent_workspace.workspace_for(commission.public_id)
    content = agent_workspace.read_artifact(root, artifact.rel_path)
    if content is None:
        raise HTTPException(status_code=404, detail="파일을 읽을 수 없습니다(삭제되었거나 너무 큽니다).")

    return ArtifactContentOut(
        id=artifact.id,
        rel_path=artifact.rel_path,
        kind=artifact.kind,
        content=content,
    )
