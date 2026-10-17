"""작업 지시서 라우트 — 완료하면 그날 기록에 분량이 더해지고, 다른 칸은 그대로인가.

`upsert_activity` 로 하루를 덮어쓰지 않고 한 칸만 더하는지가 이 기능의 전부라,
그 약속을 여기서 잠근다.
"""

from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from app.models import DailyActivity
from app.security import require_admin

DAY = "2026-10-17"


@pytest.fixture()
def client(db_session):
    def _override():
        yield db_session

    app.dependency_overrides[get_db] = _override
    app.dependency_overrides[require_admin] = lambda: None
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.pop(get_db, None)
        app.dependency_overrides.pop(require_admin, None)


def _make(client, **kw):
    body = {"date": DAY, "title": "지시서", "circuit": "study", "minutes": 30, **kw}
    res = client.post("/admin/plan-items", json=body)
    assert res.status_code == 200, res.text
    return res.json()


def _done(client, item_id, done=True):
    res = client.put(f"/admin/plan-items/{item_id}", json={"done": done})
    assert res.status_code == 200, res.text
    return res.json()


def _row(db_session) -> DailyActivity:
    db_session.expire_all()
    return db_session.query(DailyActivity).filter(DailyActivity.date == date(2026, 10, 17)).one()


def test_create_list_delete(client):
    item = _make(client, title="CS 노트", due_label="내일 마감")
    assert item["done"] is False and item["due_label"] == "내일 마감"
    listed = client.get(f"/admin/plan-items?date={DAY}").json()
    assert [i["id"] for i in listed] == [item["id"]]
    assert client.get("/admin/plan-items?date=2026-10-18").json() == []
    assert client.delete(f"/admin/plan-items/{item['id']}").json() == {"ok": True}
    assert client.get(f"/admin/plan-items?date={DAY}").json() == []
    assert client.delete(f"/admin/plan-items/{item['id']}").status_code == 404


def test_done_adds_and_undo_subtracts(client, db_session):
    item = _make(client, circuit="study", minutes=30)
    _done(client, item["id"])
    assert _row(db_session).study_minutes == 30
    _done(client, item["id"], False)
    assert _row(db_session).study_minutes == 0


def test_done_twice_counts_once(client, db_session):
    item = _make(client, circuit="coding", minutes=45)
    _done(client, item["id"])
    _done(client, item["id"])
    assert _row(db_session).coding_minutes == 45


def test_workout_turns_workout_done_on(client, db_session):
    item = _make(client, circuit="workout", minutes=40)
    _done(client, item["id"])
    row = _row(db_session)
    assert row.workout_done is True and row.workout_minutes == 40
    _done(client, item["id"], False)
    row = _row(db_session)
    assert row.workout_done is False and row.workout_minutes == 0


def test_project_minutes_accumulate_and_keep_others(client, db_session):
    db_session.add(DailyActivity(date=date(2026, 10, 17), project_minutes={"muscleup": 20}))
    db_session.commit()
    a = _make(client, circuit="project:portfolio", minutes=30)
    b = _make(client, circuit="project:portfolio", minutes=15)
    _done(client, a["id"])
    _done(client, b["id"])
    assert _row(db_session).project_minutes == {"muscleup": 20, "portfolio": 45}


def test_none_circuit_does_not_touch_activity(client, db_session):
    item = _make(client, circuit="none", minutes=50)
    assert item["minutes"] == 0
    _done(client, item["id"])
    assert db_session.query(DailyActivity).count() == 0


def test_other_fields_survive(client, db_session):
    db_session.add(
        DailyActivity(date=date(2026, 10, 17), memo="결산 정리", github_commits=6, study_minutes=10)
    )
    db_session.commit()
    item = _make(client, circuit="study", minutes=30)
    _done(client, item["id"])
    row = _row(db_session)
    assert (row.memo, row.github_commits, row.study_minutes) == ("결산 정리", 6, 40)


def test_defer_moves_date_and_done_item_is_locked(client):
    item = _make(client)
    res = client.put(f"/admin/plan-items/{item['id']}", json={"date": "2026-10-18"})
    assert res.json()["date"] == "2026-10-18"
    _done(client, item["id"])
    locked = client.put(f"/admin/plan-items/{item['id']}", json={"date": "2026-10-19"})
    assert locked.status_code == 409


def test_rejects_unknown_circuit(client):
    res = client.post("/admin/plan-items", json={"title": "x", "circuit": "sleep", "minutes": 10})
    assert res.status_code == 422
