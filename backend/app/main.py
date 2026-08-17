from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.agents import gate, workspace as agent_workspace
from app.agents.runner import AgentUnavailable, run_task as run_commission_task
from app.config import settings
from app.database import get_db, init_db
from app.models import CommissionRequest
from app.security import (
    AdminGuard,
    AiRateLimit,
    CommissionRateLimit,
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
    CommissionArtifactOut,
    CommissionBoardOut,
    CommissionConsultIn,
    CommissionConsultOut,
    CommissionDetailOut,
    CommissionIn,
    CommissionOut,
    CommissionStatusIn,
    CommissionTaskOut,
    GateIn,
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
    NpcRelationshipRow,
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
from app.services.commission_service import (
    CommissionRejected,
    apply_gate_decision,
    artifacts_for as commission_artifacts_for,
    consult as commission_consult,
    create_commission,
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
from app.services.npc_brain_service import generate_group_chat, generate_npc_encounter, generate_npc_tick
from app.services.relationship_service import apply_outcome, list_all as list_relationships, relationship_context
from app.services.village_service import derive_village_state

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
    return apply_village_overrides(db, state)


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

    reply, used_ai, suggested_action = await answer_npc_message(
        payload.npc_id,
        payload.message,
        activity,
        payload.recent_messages,
        coding_tests=list_coding_tests(db, limit=coding_limit),
        cs_notes=list_cs_notes(db, limit=coding_limit),
        activity_history=activity_history,
        village_state=village_state_ctx,
        atelier_work=atelier_work,
    )
    log_npc_conversation(
        db,
        payload.npc_id,
        payload.message,
        reply,
        used_ai,
        suggested_action.action_id if suggested_action else "",
    )
    return ChatMessageOut(
        npc_id=payload.npc_id,
        reply=reply,
        used_ai=used_ai,
        suggested_action=suggested_action,
    )


@app.post("/npc/tick", response_model=NpcTickOut, dependencies=[AiRateLimit])
async def npc_tick(payload: NpcTickIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    return await generate_npc_tick(payload, activity)


@app.post("/npc/encounter", response_model=NpcEncounterOut, dependencies=[AiRateLimit])
async def npc_encounter(payload: NpcEncounterIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    rel_ctx = relationship_context(db, payload.npc_a.npc_id, payload.npc_b.npc_id)
    result = await generate_npc_encounter(payload.npc_a, payload.npc_b, payload.recent_memory, activity, rel_ctx)

    # 이번 대화 결과를 관계 상태에 반영 (친밀도·사건 기억)
    if result.relationship is not None:
        rel, milestone = apply_outcome(
            db,
            payload.npc_a.npc_id,
            payload.npc_b.npc_id,
            result.relationship.delta,
            result.relationship.event,
            result.relationship.vibe,
        )
        result.relationship = (
            NpcRelationshipOut(
                npc_a=rel.npc_a,
                npc_b=rel.npc_b,
                affinity=rel.affinity,
                vibe=rel.vibe,
                delta=result.relationship.delta,
                event=result.relationship.event,
                milestone=milestone,
            )
            if rel is not None
            else None
        )
    return result


@app.get("/npc/relationships", response_model=list[NpcRelationshipRow])
def npc_relationships(db: Session = Depends(get_db)):
    return list_relationships(db)


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

    reply, used_ai, draft = await commission_consult(payload.message, history, payload.draft)

    if payload.session_id:
        save_commission_message(db, payload.session_id, "visitor", payload.message)
        save_commission_message(db, payload.session_id, "npc", reply, used_ai=used_ai)

    return CommissionConsultOut(reply=reply, used_ai=used_ai, draft=draft)


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
    )


@app.get("/admin/commissions", response_model=list[CommissionOut], dependencies=[AdminGuard])
def admin_commissions(db: Session = Depends(get_db)):
    return list_commissions(db)


@app.get("/admin/commissions/{commission_id}", response_model=CommissionDetailOut, dependencies=[AdminGuard])
def admin_commission_detail(commission_id: int, db: Session = Depends(get_db)):
    commission = get_commission(db, commission_id)
    if not commission:
        raise HTTPException(status_code=404, detail="해당 의뢰를 찾을 수 없습니다.")
    return CommissionDetailOut(
        **CommissionOut.model_validate(commission).model_dump(),
        session_id=commission.session_id,
        messages=messages_for(db, commission),
    )


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
