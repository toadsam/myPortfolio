from datetime import timedelta

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models import DailyActivity
from app.schemas import ActivityIn
from app.time_utils import today_local


def list_activity_history(db: Session, days: int = 120) -> list[DailyActivity]:
    days = max(1, min(days, 730))
    start = today_local() - timedelta(days=days - 1)
    return (
        db.query(DailyActivity)
        .filter(DailyActivity.date >= start)
        .order_by(desc(DailyActivity.date))
        .all()
    )


def get_or_create_today(db: Session) -> DailyActivity:
    today = today_local()
    activity = db.query(DailyActivity).filter(DailyActivity.date == today).first()
    if activity:
        return activity

    activity = DailyActivity(date=today)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def upsert_activity(db: Session, payload: ActivityIn) -> DailyActivity:
    activity_date = payload.date or today_local()
    activity = db.query(DailyActivity).filter(DailyActivity.date == activity_date).first()

    if not activity:
        activity = DailyActivity(date=activity_date)
        db.add(activity)

    activity.github_commits = payload.github_commits
    activity.github_repos = _clean_list(payload.github_repos)
    activity.study_minutes = payload.study_minutes
    activity.study_topics = _clean_list(payload.study_topics)
    activity.studied_tech = _clean_list(payload.studied_tech)
    activity.coding_minutes = payload.coding_minutes
    activity.project_minutes = {
        key.strip(): max(0, int(value))
        for key, value in payload.project_minutes.items()
        if key.strip() and int(value) > 0
    }
    activity.workout_done = payload.workout_done
    activity.workout_minutes = payload.workout_minutes if payload.workout_done else 0
    activity.workout_type = payload.workout_type.strip() if payload.workout_done else ""
    activity.focus_score = payload.focus_score
    activity.memo = payload.memo.strip()
    activity.mood = payload.mood.strip() or "steady"
    db.commit()
    db.refresh(activity)
    return activity


def _clean_list(items: list[str]) -> list[str]:
    return list(dict.fromkeys(item.strip() for item in items if item.strip()))
