"""FastAPI 라우트 스모크 — 규칙 단위 테스트가 못 잡는 "배선" 을 잠근다.

인메모리 SQLite 를 get_db 에 주입하고 OPENAI_API_KEY 를 비워 폴백 경로만 탄다(네트워크 0).
TestClient 를 with 없이 쓰면 startup 이벤트(실 DB init·씨앗)가 돌지 않는다 — 그게 의도다.
"""

import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.database import get_db
from app.main import app
from app.security import require_admin
from app.models import NpcMemory, NpcRelationship, VillageEvent


@pytest.fixture()
def client(db_session, monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "")

    def _override():
        yield db_session

    app.dependency_overrides[get_db] = _override
    # 관리자 라우트 스모크용 — 실제 토큰 검증은 security 쪽 몫이라 여기선 통과시킨다
    app.dependency_overrides[require_admin] = lambda: None
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.pop(get_db, None)
        app.dependency_overrides.pop(require_admin, None)


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


def test_fallback_reply_carries_favor_text(client, db_session):
    # 서먹한 관계를 만들고 부탁 발급을 강제(확률 무시) — 폴백 답변 끝에 부탁 문장이 붙는다 (D-2)
    from app.services import favor_service, relationship_service

    for _ in range(4):
        relationship_service.apply_outcome(db_session, "guide-npc", "project-npc", -5, "말다툼")
    import app.services.favor_service as fs

    original = fs.ISSUE_CHANCE
    fs.ISSUE_CHANCE = 1.0
    try:
        res = client.post("/npc/chat", json={"npc_id": "guide-npc", "message": "안녕!", "recent_messages": []})
    finally:
        fs.ISSUE_CHANCE = original
    body = res.json()
    assert body["favor"] is not None
    assert body["favor"]["text"] in body["reply"]


def test_admin_society_reset_and_set_affinity(client, db_session):
    from app.models import DailyActivity, NpcRelationship, VillageEvent

    _encounter(client)  # 사회 데이터 생성 (활동 행도 생긴다)
    assert db_session.query(NpcRelationship).count() >= 1

    res = client.put(
        "/admin/npc/relationships", json={"npc_a": "guide-npc", "npc_b": "project-npc", "affinity": 42}
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["affinity"] == 42 and body["vibe"] == "절친"

    res = client.post("/admin/npc/society/reset")
    assert res.status_code == 200
    out = res.json()
    assert out["removed"] >= 1 and out["seeded"] >= 4
    # 사회는 씨앗만, 활동 기록은 그대로
    assert db_session.query(VillageEvent).count() == out["seeded"]
    assert db_session.query(DailyActivity).count() >= 1

    res = client.put(
        "/admin/npc/relationships", json={"npc_a": "guide-npc", "npc_b": "guide-npc", "affinity": 0}
    )
    assert res.status_code == 400
