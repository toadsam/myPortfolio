from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_daily_activity_columns()


def _ensure_daily_activity_columns() -> None:
    if not settings.database_url.startswith("sqlite"):
        return

    columns = {
        "github_repos": "JSON DEFAULT '[]'",
        "study_topics": "JSON DEFAULT '[]'",
        "studied_tech": "JSON DEFAULT '[]'",
        "coding_minutes": "INTEGER DEFAULT 0",
        "project_minutes": "JSON DEFAULT '{}'",
        "workout_minutes": "INTEGER DEFAULT 0",
        "workout_type": "VARCHAR(80) DEFAULT ''",
        "focus_score": "INTEGER DEFAULT 50",
    }

    with engine.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(daily_activity)").fetchall()
        }
        for column, definition in columns.items():
            if column not in existing:
                connection.exec_driver_sql(f"ALTER TABLE daily_activity ADD COLUMN {column} {definition}")
