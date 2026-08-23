"""NPC 릴레이 설문(접수 1층)을 받치는 백엔드 조각들.

- 가격표는 `_baseline_estimate()` 와 같은 숫자를 내려줘야 한다(표를 두 벌 두지 않는다).
- `estimate_only()` 는 프런트가 굴린 숫자를 버리고 규칙으로 다시 낸다.
- 연출 가산치(스크롤연출·인터랙티브)가 실제로 더해진다.
- `speaker` 는 AI 없이도 그 식구의 고정 대사로 답하고, 슬롯은 여전히 담는다.
- 라우트 둘(`/commission/pricing`, `/commission/estimate`)이 배선돼 있다.
"""

import asyncio

import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.database import get_db
from app.main import app
from app.schemas import CommissionDraft
from app.services import commission_service as cs


def test_pricing_table_mirrors_baseline():
    table = cs.pricing_table()
    for site_type, entry in table["base_by_type"].items():
        lo, hi, wlo, whi, _ = cs._baseline_estimate(site_type, [], [])
        assert (entry["min"], entry["max"], entry["weeks_min"], entry["weeks_max"]) == (lo, hi, wlo, whi)
    assert table["page_free"] == 5
    assert set(table["feature_weights"]) == set(cs._FEATURE_WEIGHTS)


def test_motion_weights_add_to_estimate():
    plain = cs._baseline_estimate("기업소개", [], [])
    scroll = cs._baseline_estimate("기업소개", [], ["스크롤연출"])
    rich = cs._baseline_estimate("기업소개", [], ["인터랙티브"])
    assert plain[0] < scroll[0] < rich[0]
    assert plain[3] < rich[3]  # 기간도 는다


def test_estimate_only_discards_client_numbers():
    draft = CommissionDraft(
        site_type="랜딩", pages=["메인"], estimate_min=1, estimate_max=999_999_999, weeks_min=99, weeks_max=99
    )
    fresh = cs.estimate_only(draft)
    lo, hi, wlo, whi, _ = cs._baseline_estimate("랜딩", ["메인"], [])
    assert (fresh.estimate_min, fresh.estimate_max, fresh.weeks_min, fresh.weeks_max) == (lo, hi, wlo, whi)
    assert fresh.ready_to_submit is True
    # 원본은 건드리지 않는다
    assert draft.estimate_min == 1


@pytest.mark.parametrize("speaker", ["planner", "designer", "frontend", "backend"])
def test_speaker_fallback_answers_in_character_and_keeps_slots(monkeypatch, speaker):
    monkeypatch.setattr(settings, "openai_api_key", "")
    draft = CommissionDraft(site_type="기업소개", pages=["메인"])
    reply, used_ai, fresh = asyncio.run(cs.consult("결제도 붙이고 싶어요", [], draft, speaker=speaker))
    assert used_ai is False
    assert reply == cs._SPEAKER_FALLBACK[speaker]
    assert "결제" in fresh.features  # 식구가 답해도 슬롯 추출은 그대로


def test_intake_speaker_keeps_old_behaviour(monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "")
    reply, _, _ = asyncio.run(cs.consult("회사 소개 사이트요", [], None, speaker="intake"))
    assert reply not in cs._SPEAKER_FALLBACK.values()


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


def test_pricing_and_estimate_routes(client):
    pricing = client.get("/commission/pricing")
    assert pricing.status_code == 200
    assert "기업소개" in pricing.json()["base_by_type"]

    body = CommissionDraft(site_type="예약", pages=["메인"], features=["예약"]).model_dump()
    res = client.post("/commission/estimate", json=body)
    assert res.status_code == 200
    out = res.json()
    assert out["reply"] == ""
    lo, hi, _, _, _ = cs._baseline_estimate("예약", ["메인"], ["예약"])
    assert out["draft"]["estimate_min"] == lo
    assert out["draft"]["estimate_max"] == hi
    assert out["disclaimer"]


def test_consult_route_accepts_speaker(client):
    res = client.post(
        "/commission/consult",
        json={"message": "분위기는 따뜻하게요", "speaker": "designer", "draft": None},
    )
    assert res.status_code == 200
    assert res.json()["reply"] == cs._SPEAKER_FALLBACK["designer"]

    bad = client.post("/commission/consult", json={"message": "안녕", "speaker": "janitor"})
    assert bad.status_code == 422
