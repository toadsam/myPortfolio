from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, init_db
from app.schemas import (
    ActivityIn,
    ActivityOut,
    ChatMessageIn,
    ChatMessageOut,
    GithubSyncOut,
    NpcEncounterIn,
    NpcEncounterOut,
    NpcTickIn,
    NpcTickOut,
    VillageState,
)
from app.services.activity_service import get_or_create_today, upsert_activity
from app.services.chat_service import answer_npc_message
from app.services.github_service import fetch_today_commit_count
from app.services.npc_brain_service import generate_npc_encounter, generate_npc_tick
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/activity/today", response_model=ActivityOut)
def activity_today(db: Session = Depends(get_db)):
    return get_or_create_today(db)


@app.post("/activity", response_model=ActivityOut)
def save_activity(payload: ActivityIn, db: Session = Depends(get_db)):
    return upsert_activity(db, payload)


@app.get("/village-state", response_model=VillageState)
def village_state(db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    return derive_village_state(activity)


@app.post("/npc/chat", response_model=ChatMessageOut)
async def npc_chat(payload: ChatMessageIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    reply, used_ai = await answer_npc_message(payload.npc_id, payload.message, activity)
    return ChatMessageOut(npc_id=payload.npc_id, reply=reply, used_ai=used_ai)


@app.post("/npc/tick", response_model=NpcTickOut)
async def npc_tick(payload: NpcTickIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    return await generate_npc_tick(payload, activity)


@app.post("/npc/encounter", response_model=NpcEncounterOut)
async def npc_encounter(payload: NpcEncounterIn, db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    return await generate_npc_encounter(payload.npc_a, payload.npc_b, payload.recent_memory, activity)


@app.post("/github/sync", response_model=GithubSyncOut)
async def github_sync(db: Session = Depends(get_db)):
    activity = get_or_create_today(db)
    commits = await fetch_today_commit_count()
    payload = ActivityIn(
        date=activity.date,
        github_commits=commits,
        study_minutes=activity.study_minutes,
        workout_done=activity.workout_done,
        memo=activity.memo,
        mood=activity.mood,
    )
    updated = upsert_activity(db, payload)
    return GithubSyncOut(username=settings.github_username, commits=commits, updated_activity=updated)
