"""2층 릴레이 설문 백엔드 — 저장(save_depth_form)과 AI 맞춤 질문(generate_ai_questions).

원칙 검증이 목적이다:
- 저장은 화이트리스트·길이 상한·"빈 답은 덮지 않음"·누적 규칙을 지킨다.
- AI 질문은 **한 번만** 생성되고(빈 결과여도), 상한 5개·중복 제거·화자 검증을
  모델이 아니라 규칙이 한다. 실패하면 조용히 0개로 완료된다.
"""

import asyncio

import pytest

from app.config import settings
from app.database import get_db
from app.main import app
from app.schemas import CommissionIn
from app.services import commission_service as cs
from fastapi.testclient import TestClient


def _commission(db):
    return cs.create_commission(
        db,
        CommissionIn(
            contact_email="guest@example.com",
            site_type="예약",
            summary="필라테스 예약 사이트",
            requirements={"pages": ["메인"], "features": ["예약"]},
            consent=True,
            website="",
        ),
    )


# ─────────────────────────── save_depth_form ───────────────────────────


def test_save_depth_form_whitelists_and_accumulates(db_session):
    commission = _commission(db_session)
    cs.save_depth_form(
        db_session,
        commission,
        slots={"who_updates": "직접 고침", "contact_email": "hack@x.y", "nope": "x"},
        branch={"B1": "날짜+시간대", "잘못된 키!": "버려짐"},
        pages=["예약", "메인"],  # 메인은 이미 있다 — 중복 없이 누적
        features=["알림"],
    )
    req = commission.requirements
    assert req["who_updates"] == "직접 고침"
    assert "contact_email" not in req and "nope" not in req
    assert req["branch"] == {"B1": "날짜+시간대"}
    assert req["pages"] == ["메인", "예약"]
    assert req["features"] == ["예약", "알림"]


def test_save_depth_form_empty_answer_keeps_existing(db_session):
    commission = _commission(db_session)
    cs.save_depth_form(db_session, commission, slots={"content_owner": "사진은 내가 준비"})
    cs.save_depth_form(db_session, commission, slots={"content_owner": "   "})
    assert commission.requirements["content_owner"] == "사진은 내가 준비"


def test_save_depth_form_dislikes_splits_and_merges(db_session):
    commission = _commission(db_session)
    cs.save_depth_form(db_session, commission, slots={"dislikes": "촌스러운 색, 팝업"})
    cs.save_depth_form(db_session, commission, slots={"dislikes": "팝업, 자동재생"})
    assert commission.requirements["dislikes"] == ["촌스러운 색", "팝업", "자동재생"]


def test_save_depth_form_ai_answer_merges_by_id(db_session):
    commission = _commission(db_session)
    req = dict(commission.requirements or {})
    req["ai_questions"] = [
        {"id": "a1", "question": "수업은 몇 종류인가요?", "answer": "", "speaker": "planner"}
    ]
    commission.requirements = req
    db_session.commit()

    cs.save_depth_form(db_session, commission, ai_answers={"a1": "세 종류요", "a9": "무시"})
    stored = commission.requirements["ai_questions"]
    assert stored[0]["answer"] == "세 종류요"
    # 빈 답은 기존 답을 덮지 않는다
    cs.save_depth_form(db_session, commission, ai_answers={"a1": ""})
    assert commission.requirements["ai_questions"][0]["answer"] == "세 종류요"


# ─────────────────────────── generate_ai_questions ───────────────────────────


def test_generate_without_key_completes_with_zero(db_session, monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "")
    commission = _commission(db_session)
    questions, generated = asyncio.run(cs.generate_ai_questions(db_session, commission))
    assert questions == [] and generated is True
    # 두 번째 호출은 재생성하지 않는다
    questions, generated = asyncio.run(cs.generate_ai_questions(db_session, commission))
    assert questions == [] and generated is False
    assert commission.requirements["ai_questions_done"] is True


def test_generate_postprocess_caps_dedupes_and_fixes_speaker(db_session, monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "test-key")

    async def fake(commission, asked):
        return [
            {"question": "수업 예약은 회원권이 있어야 하나요?", "speaker": "backend"},
            {"question": "수업 예약은 회원권이 있어야 하나요?", "speaker": "planner"},  # 중복
            {"question": "짧다", "speaker": "planner"},  # 너무 짧음
            {"question": "예약은 어떤 단위인가요?", "speaker": "planner"},  # 이미 물은 것
            {"question": "강사별로 예약을 나눠 받나요?", "speaker": "janitor"},  # 화자 오류
            {"question": "취소 위약금 규정이 있나요?", "speaker": "planner"},
            {"question": "수업 정원이 다 차면 대기를 받나요?", "speaker": "planner"},
            {"question": "요가 매트는 대여인가요?", "speaker": "designer"},
            {"question": "여섯 번째로 잘리는 질문인가요?", "speaker": "planner"},
        ]

    monkeypatch.setattr(cs, "_generate_ai_questions_openai", fake)
    commission = _commission(db_session)
    asked = [{"question": "예약은 어떤 단위인가요?", "answer": "시간대"}]
    questions, generated = asyncio.run(
        cs.generate_ai_questions(db_session, commission, asked)
    )
    assert generated is True
    assert len(questions) == cs.AI_QUESTIONS_CAP
    texts = [item["question"] for item in questions]
    assert "예약은 어떤 단위인가요?" not in texts
    assert "짧다" not in texts
    assert len(texts) == len(set(texts))
    by_text = {item["question"]: item for item in questions}
    assert by_text["강사별로 예약을 나눠 받나요?"]["speaker"] == "intake"  # 오류 → intake
    assert [item["id"] for item in questions] == ["a1", "a2", "a3", "a4", "a5"]


def test_generate_failure_is_silent_zero(db_session, monkeypatch):
    monkeypatch.setattr(settings, "openai_api_key", "test-key")

    async def boom(commission, asked):
        raise RuntimeError("api down")

    monkeypatch.setattr(cs, "_generate_ai_questions_openai", boom)
    commission = _commission(db_session)
    questions, generated = asyncio.run(cs.generate_ai_questions(db_session, commission))
    assert questions == [] and generated is True
    assert commission.requirements["ai_questions_done"] is True


# ─────────────────────────── 라우트 배선 ───────────────────────────


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


def test_answers_and_questions_routes(client, db_session):
    commission = _commission(db_session)
    token = commission.access_token

    saved = client.post(
        f"/commission/track/{token}/answers",
        json={"slots": {"who_updates": "직접"}, "branch": {"B1": "날짜만"}},
    )
    assert saved.status_code == 200
    assert saved.json()["draft"]["who_updates"] == "직접"

    made = client.post(f"/commission/track/{token}/questions", json={"asked": []})
    assert made.status_code == 200
    assert made.json() == {"questions": [], "generated": True}

    track = client.get(f"/commission/track/{token}")
    assert track.status_code == 200
    body = track.json()
    assert body["branch"] == {"B1": "날짜만"}
    assert body["ai_questions_done"] is True

    missing = client.post("/commission/track/no-such-token/answers", json={})
    assert missing.status_code == 404
