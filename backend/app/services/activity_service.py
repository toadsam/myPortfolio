from sqlalchemy.orm import Session

from app.models import DailyActivity
from app.schemas import ActivityIn
from app.time_utils import today_local


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
    activity.study_minutes = payload.study_minutes
    activity.workout_done = payload.workout_done
    activity.memo = payload.memo.strip()
    activity.mood = payload.mood.strip() or "steady"
    db.commit()
    db.refresh(activity)
    return activity
