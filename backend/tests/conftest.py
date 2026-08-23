import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.database import Base


@pytest.fixture()
def db_session():
    """각 테스트마다 새로 만드는 인메모리 SQLite 세션 — 실제 개발 DB(portfolio_village.db)는 건드리지 않는다."""
    from app import models  # noqa: F401  (Base.metadata에 테이블 등록)

    # StaticPool: ":memory:" 는 커넥션마다 다른 DB 다. TestClient 는 다른 스레드에서 라우트를
    # 돌리므로(test_npc_routes) 커넥션 하나를 고정해야 같은 테이블이 보인다.
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = session_local()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()
