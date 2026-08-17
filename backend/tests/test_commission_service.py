"""의뢰 공방 순수 로직 테스트 — 견적 산출/clamp, 유형 추정, 규칙 상담, 접수 검증.

OpenAI 호출 경로는 다른 테스트들과 마찬가지로 다루지 않는다(키 없이 도는 스위트).
대신 '키가 없어도 상담이 끊기지 않는다'는 fallback 경로를 확인한다.
"""

import asyncio

import pytest

from app.schemas import CommissionDraft, CommissionIn
from app.services import commission_service as cs


# ─────────────────────────── 유형 추정 ───────────────────────────

@pytest.mark.parametrize(
    "text,expected",
    [
        ("결제 되는 사이트 만들고 싶어요", "쇼핑몰"),
        ("예약 받는 페이지가 필요해요", "예약"),
        ("회원 로그인이 있는 플랫폼이요", "웹서비스"),
        ("회사 소개 사이트요", "기업소개"),
        ("제 포트폴리오를 올리고 싶어요", "포트폴리오"),
        ("한페이지짜리 홍보용이요", "랜딩"),
    ],
)
def test_guess_site_type(text, expected):
    assert cs.guess_site_type(text) == expected


def test_guess_site_type_returns_empty_when_unknown():
    assert cs.guess_site_type("음... 그냥 뭔가 만들고 싶어요") == ""


# ─────────────────────────── 견적 기준선 ───────────────────────────

def test_baseline_uses_type_table():
    lo, hi, wlo, whi, _ = cs._baseline_estimate("랜딩", [], [])
    assert (lo, hi) == cs._BASE_BY_TYPE["랜딩"][:2]
    assert wlo < whi


def test_baseline_falls_back_for_unknown_type():
    lo, hi, _, _, _ = cs._baseline_estimate("", [], [])
    assert (lo, hi) == cs._DEFAULT_BASE[:2]


def test_baseline_charges_only_pages_beyond_five():
    five = cs._baseline_estimate("랜딩", [f"p{i}" for i in range(5)], [])
    eight = cs._baseline_estimate("랜딩", [f"p{i}" for i in range(8)], [])
    assert five[0] == cs._BASE_BY_TYPE["랜딩"][0]  # 5장까지는 가산 없음
    assert eight[0] > five[0]
    assert eight[1] > five[1]


def test_baseline_adds_weight_for_heavy_features():
    plain = cs._baseline_estimate("기업소개", [], [])
    with_payment = cs._baseline_estimate("기업소개", [], ["결제 연동"])
    assert with_payment[0] > plain[0]
    assert with_payment[3] > plain[3]  # 기간 상한도 늘어난다
    assert "결제" in with_payment[4]


def test_baseline_weeks_range_is_never_degenerate():
    _, _, wlo, whi, _ = cs._baseline_estimate("랜딩", [], [])
    assert whi > wlo


# ─────────────────────────── 견적 clamp ───────────────────────────
#
# 핵심 안전장치: AI가 부른 금액이 규칙 기준선의 0.6~1.8배를 벗어나지 못한다.

def test_clamp_fills_in_when_ai_gave_nothing():
    draft = CommissionDraft(site_type="랜딩")
    cs._clamp_estimate(draft)
    lo, hi, _, _, _ = cs._baseline_estimate("랜딩", [], [])
    assert draft.estimate_min == lo
    assert draft.estimate_max == hi
    assert draft.estimate_reason


def test_clamp_rejects_absurdly_low_estimate():
    draft = CommissionDraft(site_type="랜딩", estimate_min=1, estimate_max=10)
    cs._clamp_estimate(draft)
    lo, _, _, _, _ = cs._baseline_estimate("랜딩", [], [])
    assert draft.estimate_min >= int(lo * 0.6)
    assert draft.estimate_max >= int(lo * 0.6)


def test_clamp_rejects_absurdly_high_estimate():
    draft = CommissionDraft(site_type="랜딩", estimate_min=90_000_000, estimate_max=100_000_000)
    cs._clamp_estimate(draft)
    _, hi, _, _, _ = cs._baseline_estimate("랜딩", [], [])
    assert draft.estimate_max <= int(hi * 1.8)


def test_clamp_keeps_reasonable_ai_estimate_untouched():
    lo, hi, _, _, _ = cs._baseline_estimate("기업소개", [], [])
    draft = CommissionDraft(site_type="기업소개", estimate_min=lo, estimate_max=hi)
    cs._clamp_estimate(draft)
    assert draft.estimate_min == lo
    assert draft.estimate_max == hi


def test_clamp_swaps_reversed_range():
    draft = CommissionDraft(site_type="랜딩", estimate_min=1_700_000, estimate_max=900_000)
    cs._clamp_estimate(draft)
    assert draft.estimate_min <= draft.estimate_max


def test_clamp_bounds_weeks_too():
    draft = CommissionDraft(site_type="랜딩", weeks_min=0, weeks_max=0)
    cs._clamp_estimate(draft)
    assert draft.weeks_min >= 1
    assert draft.weeks_max >= draft.weeks_min


# ─────────────────────────── 누락 항목 / 접수 가능 판정 ───────────────────────────

def test_fill_missing_flags_everything_on_empty_draft():
    draft = cs._fill_missing(CommissionDraft())
    assert draft.missing
    assert draft.ready_to_submit is False


def test_ready_to_submit_needs_type_and_scope():
    draft = cs._fill_missing(
        CommissionDraft(site_type="랜딩", summary="행사 홍보용 한 페이지", features=["문의 폼"])
    )
    assert draft.ready_to_submit is True


def test_not_ready_without_pages_or_features():
    draft = cs._fill_missing(CommissionDraft(site_type="랜딩", summary="뭔가 만들고 싶어요"))
    assert draft.ready_to_submit is False


def test_ready_even_when_model_left_summary_blank():
    """회귀 방지: 모델이 summary 를 비워 둬도 손님을 붙잡아 두지 않는다.

    실제로 났던 일 — 손님이 유형·기능·일정·예산을 다 말했는데도 모델이
    '아직 더 물어봐야지' 하며 summary 를 비워서 접수 버튼이 안 열렸다.
    """
    draft = cs._fill_missing(
        CommissionDraft(site_type="예약", summary="", features=["로그인", "결제"])
    )
    assert draft.ready_to_submit is True
    assert "무엇을 하는 사이트인지" in draft.missing  # 안내는 계속한다


# ─────────────────────────── AI 없는 상담 경로 ───────────────────────────

def test_consult_without_ai_returns_reply_and_draft():
    reply, draft = cs._consult_without_ai("결제 되는 쇼핑몰 만들고 싶어요", [], None)
    assert reply.strip()
    assert draft.site_type == "쇼핑몰"


def test_consult_without_ai_accumulates_across_turns():
    _, first = cs._consult_without_ai("예약 받는 사이트요", [], None)
    _, second = cs._consult_without_ai("로그인도 있으면 좋겠어요", [], first)
    assert second.site_type == "예약"          # 이전 턴 정보가 유지된다
    assert "로그인" in second.features          # 새 정보가 누적된다


def test_consult_without_ai_picks_up_deadline_and_budget():
    _, draft = cs._consult_without_ai("3주 안에 되나요? 예산은 300만원이에요", [], None)
    assert "3주" in draft.deadline_hint
    assert "300" in draft.budget_hint


def test_consult_falls_back_without_api_key(monkeypatch):
    """OPENAI_API_KEY 가 없어도 상담은 반드시 응답한다.

    (pytest-asyncio 를 의존성에 더하지 않으려고 asyncio.run 으로 직접 돌린다.)
    """
    monkeypatch.setattr(cs.settings, "openai_api_key", None)
    reply, used_ai, draft = asyncio.run(cs.consult("회사 소개 사이트 만들고 싶어요", [], None))
    assert used_ai is False
    assert reply.strip()
    assert draft.estimate_min > 0  # clamp가 기준선을 채워줬다


# ─────────────────────────── 접수 검증 ───────────────────────────

def _valid_payload(**overrides) -> CommissionIn:
    base = {
        "contact_email": "client@example.com",
        "summary": "행사 홍보용 원페이지",
        "site_type": "랜딩",
        "consent": True,
    }
    base.update(overrides)
    return CommissionIn(**base)


def test_create_commission_stores_row_and_assigns_public_id(db_session):
    commission = cs.create_commission(db_session, _valid_payload())
    assert commission.public_id.startswith("WO-")
    assert commission.status == "received"
    assert commission.contact_email == "client@example.com"


def test_create_commission_rejects_honeypot(db_session):
    with pytest.raises(cs.CommissionRejected):
        cs.create_commission(db_session, _valid_payload(website="http://spam.example"))


def test_create_commission_requires_consent(db_session):
    with pytest.raises(cs.CommissionRejected):
        cs.create_commission(db_session, _valid_payload(consent=False))


@pytest.mark.parametrize("email", ["not-an-email", "a@b", "@example.com", "a b@example.com"])
def test_create_commission_validates_email(db_session, email):
    with pytest.raises(cs.CommissionRejected):
        cs.create_commission(db_session, _valid_payload(contact_email=email))


def test_create_commission_requires_some_content(db_session):
    with pytest.raises(cs.CommissionRejected):
        cs.create_commission(db_session, _valid_payload(summary="", requirements={}))


def test_create_commission_attaches_prior_consultation_log(db_session):
    """접수 전에 쌓인 상담 로그가 접수 건에 귀속돼야 관리자가 맥락을 볼 수 있다."""
    session_id = "visitor-session-1"
    cs.save_message(db_session, session_id, "visitor", "쇼핑몰 만들고 싶어요")
    cs.save_message(db_session, session_id, "npc", "어떤 상품을 파시나요?", used_ai=False)

    commission = cs.create_commission(db_session, _valid_payload(session_id=session_id))
    messages = cs.messages_for(db_session, commission)

    assert len(messages) == 2
    assert messages[0].role == "visitor"


def test_recent_messages_returns_chronological_order(db_session):
    session_id = "visitor-session-2"
    for i in range(3):
        cs.save_message(db_session, session_id, "visitor", f"메시지 {i}")
    rows = cs.recent_messages(db_session, session_id)
    assert [row.content for row in rows] == ["메시지 0", "메시지 1", "메시지 2"]


def test_update_and_delete_commission(db_session):
    commission = cs.create_commission(db_session, _valid_payload())
    updated = cs.update_status(db_session, commission.id, "reviewing", "연락 예정")
    assert updated is not None
    assert updated.status == "reviewing"
    assert updated.admin_note == "연락 예정"

    assert cs.delete_commission(db_session, commission.id) is True
    assert cs.get_commission(db_session, commission.id) is None
