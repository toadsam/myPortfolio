from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, init_db
from app.schemas import (
    ActivityIn,
    ActivityOut,
    AdminOverview,
    AnalyticsSummary,
    ChatMessageIn,
    ChatMessageOut,
    CodingTestIn,
    CodingTestOut,
    CsNoteIn,
    CsNoteOut,
    GithubSyncOut,
    ManagedProjectIn,
    ManagedProjectOut,
    NpcEncounterIn,
    NpcEncounterOut,
    NpcGroupChatIn,
    NpcGroupChatOut,
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
from app.services.chat_service import answer_npc_message
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


@app.get("/activity/today", response_model=ActivityOut)
def activity_today(db: Session = Depends(get_db)):
    return get_or_create_today(db)


@app.post("/activity", response_model=ActivityOut)
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


@app.post("/npc/chat", response_model=ChatMessageOut)
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

    reply, used_ai, suggested_action = await answer_npc_message(
        payload.npc_id,
        payload.message,
        activity,
        payload.recent_messages,
        coding_tests=list_coding_tests(db, limit=coding_limit),
        cs_notes=list_cs_notes(db, limit=coding_limit),
        activity_history=activity_history,
        village_state=village_state_ctx,
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


@app.post("/npc/tick", response_model=NpcTickOut)
async def npc_tick(payload: NpcTickIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    return await generate_npc_tick(payload, activity)


@app.post("/npc/encounter", response_model=NpcEncounterOut)
async def npc_encounter(payload: NpcEncounterIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    return await generate_npc_encounter(payload.npc_a, payload.npc_b, payload.recent_memory, activity)


@app.post("/npc/group-chat", response_model=NpcGroupChatOut)
async def npc_group_chat(payload: NpcGroupChatIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    return await generate_group_chat(
        payload.npc_ids,
        activity,
        payload.recent_memory,
        coding_tests=list_coding_tests(db, limit=8),
        cs_notes=list_cs_notes(db, limit=8),
    )


@app.post("/github/sync", response_model=GithubSyncOut)
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


@app.get("/admin/overview", response_model=AdminOverview)
def admin_overview(db: Session = Depends(get_db)):
    return admin_overview_payload(db)


@app.get("/admin/analytics", response_model=AnalyticsSummary)
def admin_analytics(db: Session = Depends(get_db)):
    return analytics_summary(db)


@app.get("/admin/projects", response_model=list[ManagedProjectOut])
def admin_projects(db: Session = Depends(get_db)):
    return list_projects(db)


@app.put("/admin/projects/{project_id}", response_model=ManagedProjectOut)
def admin_update_project(project_id: str, payload: ManagedProjectIn, db: Session = Depends(get_db)):
    return update_project(db, project_id, payload)


@app.get("/admin/npc/logs", response_model=list[NpcConversationLogOut])
def admin_npc_logs(db: Session = Depends(get_db)):
    return list_npc_logs(db)


@app.get("/npc/presets", response_model=list[NpcPresetOut])
def npc_presets(db: Session = Depends(get_db)):
    return list_npc_presets(db)


@app.get("/admin/npc/presets", response_model=list[NpcPresetOut])
def admin_npc_presets(db: Session = Depends(get_db)):
    return list_npc_presets(db)


@app.put("/admin/npc/presets/{npc_id}", response_model=NpcPresetOut)
def admin_update_npc_preset(npc_id: str, payload: NpcPresetIn, db: Session = Depends(get_db)):
    return update_npc_preset(db, npc_id, payload)


@app.get("/admin/village/overrides", response_model=list[VillageBuildingOverrideOut])
def admin_village_overrides(db: Session = Depends(get_db)):
    return list_village_overrides(db)


@app.put("/admin/village/overrides/{building_id}", response_model=VillageBuildingOverrideOut)
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


@app.post("/admin/coding-tests", response_model=CodingTestOut)
def admin_create_coding_test(payload: CodingTestIn, db: Session = Depends(get_db)):
    return create_coding_test(db, payload)


@app.put("/admin/coding-tests/{log_id}", response_model=CodingTestOut)
def admin_update_coding_test(log_id: int, payload: CodingTestIn, db: Session = Depends(get_db)):
    log = update_coding_test(db, log_id, payload)
    if not log:
        raise HTTPException(status_code=404, detail="해당 코딩테스트 기록을 찾을 수 없습니다.")
    return log


@app.delete("/admin/coding-tests/{log_id}")
def admin_delete_coding_test(log_id: int, db: Session = Depends(get_db)):
    if not delete_coding_test(db, log_id):
        raise HTTPException(status_code=404, detail="해당 코딩테스트 기록을 찾을 수 없습니다.")
    return {"ok": True}


# ─────────────────────────── CS 전공지식 노트 ───────────────────────────

@app.get("/cs-notes", response_model=list[CsNoteOut])
def cs_notes(db: Session = Depends(get_db)):
    return list_cs_notes(db)


@app.post("/admin/cs-notes", response_model=CsNoteOut)
def admin_create_cs_note(payload: CsNoteIn, db: Session = Depends(get_db)):
    return create_cs_note(db, payload)


@app.put("/admin/cs-notes/{note_id}", response_model=CsNoteOut)
def admin_update_cs_note(note_id: int, payload: CsNoteIn, db: Session = Depends(get_db)):
    note = update_cs_note(db, note_id, payload)
    if not note:
        raise HTTPException(status_code=404, detail="해당 CS 노트를 찾을 수 없습니다.")
    return note


@app.delete("/admin/cs-notes/{note_id}")
def admin_delete_cs_note(note_id: int, db: Session = Depends(get_db)):
    if not delete_cs_note(db, note_id):
        raise HTTPException(status_code=404, detail="해당 CS 노트를 찾을 수 없습니다.")
    return {"ok": True}
