import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base


@pytest.fixture()
def db_session():
    """각 테스트마다 새로 만드는 인메모리 SQLite 세션 — 실제 개발 DB(portfolio_village.db)는 건드리지 않는다."""
    from app import models  # noqa: F401  (Base.metadata에 테이블 등록)

    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = session_local()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()
