"""FastAPI 라우트 스모크 — 규칙 단위 테스트가 못 잡는 "배선" 을 잠근다.

인메모리 SQLite 를 get_db 에 주입하고 OPENAI_API_KEY 를 비워 폴백 경로만 탄다(네트워크 0).
TestClient 를 with 없이 쓰면 startup 이벤트(실 DB init·씨앗)가 돌지 않는다 — 그게 의도다.
"""

import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.database import get_db
from app.main import app
from app.models import NpcMemory, NpcRelationship, VillageEvent


@pytest.fixture()
def client(db_session, monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "")

    def _override():
        yield db_session

    app.dependency_overrides[get_db] = _override
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.pop(get_db, None)


def _encounter(client, a="guide-npc", b="project-npc"):
    return client.post(
        "/npc/encounter",
        json={"npc_a": {"npc_id": a, "mood": "calm"}, "npc_b": {"npc_id": b, "mood": "calm"}, "recent_memory": []},
    )


def test_encounter_writes_relationship_memory_and_clamps(client, db_session):
    res = _encounter(client)
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["used_ai"] is False and len(body["dialogue"]) >= 2
    rel = body["relationship"]
    assert rel is not None and -5 <= rel["delta"] <= 5
    assert db_session.query(NpcRelationship).count() == 1
    memories = db_session.query(NpcMemory).filter(NpcMemory.kind != "gossip").all()
    assert {m.npc_id for m in memories} == {"guide-npc", "project-npc"}


def test_encounter_with_same_npc_is_rejected(client):
    assert _encounter(client, "guide-npc", "guide-npc").status_code == 400


def test_chat_relay_and_negation(client, db_session):
    res = client.post("/npc/chat", json={"npc_id": "guide-npc", "message": "픽셀이 미안하대", "recent_messages": []})
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["used_ai"] is False and body["reply"]
    assert body["relay"] and body["relay"]["about_npc_id"] == "project-npc" and body["relay"]["delta"] == 2

    res = client.post(
        "/npc/chat", json={"npc_id": "guide-npc", "message": "픽셀이 싫다고 하진 않았어", "recent_messages": []}
    )
    assert res.status_code == 200 and res.json()["relay"] is None


def test_news_is_newest_first_and_memory_hides_visitor(client, db_session):
    client.post("/npc/chat", json={"npc_id": "guide-npc", "message": "안녕?", "recent_messages": []})
    for i in range(3):
        db_session.add(VillageEvent(emoji="💬", text=f"e{i}", npc_a="a", npc_b="b", delta=0))
    db_session.commit()
    news = client.get("/npc/news?limit=2").json()
    assert [n["text"] for n in news] == ["e2", "e1"]
    assert news[0]["created_at"].endswith("Z") or "+00:00" in news[0]["created_at"]

    memory = client.get("/npc/memory/guide-npc").json()
    assert all(m["kind"] != "visitor" for m in memory)
