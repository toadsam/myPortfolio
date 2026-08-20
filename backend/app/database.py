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
    _ensure_commission_columns()


def _ensure_columns(table: str, columns: dict[str, str]) -> None:
    """SQLite 한정 자동 컬럼 패치.

    **SQLite 에서만 돈다.** Postgres 로 옮기면 여기서 아무 일도 일어나지 않으므로,
    그때는 컬럼을 손으로 추가하거나 마이그레이션 도구를 들여야 한다.
    이 함수를 부르는 곳들의 목록이 곧 "손으로 추가해야 할 것" 목록이다.
    """
    if not settings.database_url.startswith("sqlite"):
        return

    with engine.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql(f"PRAGMA table_info({table})").fetchall()
        }
        for column, definition in columns.items():
            if column not in existing:
                connection.exec_driver_sql(
                    f"ALTER TABLE {table} ADD COLUMN {column} {definition}"
                )


def _ensure_commission_columns() -> None:
    # 심화 문답(2차)으로 돌아오는 열쇠. 기존 접수 건에는 값이 없으므로,
    # commission_service.ensure_access_token() 이 조회 시점에 채워 준다.
    _ensure_columns("commission_request", {"access_token": "VARCHAR(64) DEFAULT ''"})


def _ensure_daily_activity_columns() -> None:
    columns = {
        "github_repos": "JSON DEFAULT '[]'",
        "study_topics": "JSON DEFAULT '[]'",
        "studied_tech": "JSON DEFAULT '[]'",
        "coding_minutes": "INTEGER DEFAULT 0",
        "project_minutes": "JSON DEFAULT '{}'",
        "workout_minutes": "INTEGER DEFAULT 0",
        "workout_type": "VARCHAR(80) DEFAULT ''",
        "focus_score": "INTEGER DEFAULT 50",
        # 갓생 섬(/island)
        "notion_done": "BOOLEAN DEFAULT 0",
        "notion_url": "VARCHAR(400) DEFAULT ''",
        "notion_title": "VARCHAR(200) DEFAULT ''",
        "boj_solved_total": "INTEGER DEFAULT 0",
        "boj_solved_today": "INTEGER DEFAULT 0",
    }

    _ensure_columns("daily_activity", columns)
