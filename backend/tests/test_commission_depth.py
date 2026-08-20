"""심화 문답(접수 뒤 2차) — 제작 슬롯 추출과 저장.

이 스위트가 지키는 것은 결국 **하나의 불변식**이다:

    제작 슬롯을 늘려도 1차 접수 문턱은 그대로여야 한다.

공방은 "얼마짜리 일인가"(1차)와 "어떻게 만들어야 잘 만드는가"(2차)를 다른 시점에
받는다. 둘을 한 대화로 합치려는 유혹이 계속 생기는데, 합치는 순간 접수 창구가
취조실이 되어 손님이 접수 전에 떠난다. 그래서 문턱은 테스트로 못 박아 둔다.

OpenAI 경로는 다루지 않는다(키 없이 도는 스위트) — 대신 키가 없어도 문답이
끝까지 굴러가는 규칙 기반 경로를 확인한다.
"""

import asyncio

import pytest

from app.models import CommissionRequest
from app.schemas import CommissionDraft, CommissionIn
from app.services import commission_service as cs


def _run(coro):
    return asyncio.run(coro)


# ─────────────────────────── 문턱 불변식 ───────────────────────────

def test_depth_slots_do_not_raise_intake_threshold():
    """**이 스위트의 핵심.** 제작 슬롯이 전부 비어 있어도 접수는 열려야 한다."""
    draft = cs._fill_missing(
        CommissionDraft(site_type="예약", features=["예약", "지도"])
    )

    assert draft.ready_to_submit is True
    assert draft.depth_missing, "제작 슬롯은 비어 있는 게 정상이다"
    assert draft.depth_done is False


def test_depth_slots_are_not_in_intake_missing():
    """제작 슬롯 라벨이 1차 `missing` 에 새어 들어가면 도안이 접수 전에 캐묻기 시작한다."""
    draft = cs._fill_missing(CommissionDraft())

    for label in cs._DEPTH_LABELS.values():
        assert label not in draft.missing


def test_depth_done_requires_only_required_slots():
    draft = cs._fill_missing(
        CommissionDraft(
            site_type="랜딩",
            pages=["메인"],
            who_updates="제가 직접",
            content_owner="사진은 제가 드려요",
            success_metric="문의 전화가 늘면 좋겠어요",
            existing_assets="도메인 없음",
        )
    )

    # 선택 슬롯(피하고 싶은 것 / 참고 이유 / 결정하는 분)은 아직 비었지만
    assert draft.depth_missing
    # 필수 넷이 찼으므로 완료로 본다 — 나머지는 있으면 좋은 것이다.
    assert draft.depth_done is True


# ─────────────────────────── 규칙 기반 문답 ───────────────────────────

def test_depth_without_ai_fills_slots_in_order():
    draft = CommissionDraft(site_type="예약")
    answers = ["제가 직접 고쳐요", "사진 있어요", "예약이 늘면 좋겠어요", "도메인 없어요"]

    for answer in answers:
        reply, draft = cs._depth_without_ai(answer, draft)
        assert reply.strip()

    assert draft.who_updates == "제가 직접 고쳐요"
    assert draft.content_owner == "사진 있어요"
    assert draft.success_metric == "예약이 늘면 좋겠어요"
    assert draft.existing_assets == "도메인 없어요"


def test_depth_without_ai_splits_dislikes():
    draft = CommissionDraft()
    for field in ("who_updates", "content_owner", "success_metric", "existing_assets"):
        setattr(draft, field, "답")

    _reply, draft = cs._depth_without_ai("촌스러운 색, 팝업 광고", draft)
    assert draft.dislikes == ["촌스러운 색", "팝업 광고"]


def test_depth_without_ai_closes_when_nothing_left():
    draft = CommissionDraft()
    for field in cs._DEPTH_FIELDS:
        setattr(draft, field, ["x"] if field == "dislikes" else "답")

    reply, _draft = cs._depth_without_ai("더 할 말 없어요", draft)
    assert "연락" in reply  # 마무리 안내로 끝난다


def test_consult_depth_runs_without_api_key(monkeypatch):
    monkeypatch.setattr(cs.settings, "openai_api_key", None)

    reply, used_ai, draft = _run(
        cs.consult_depth("제가 직접 고칠게요", [], CommissionDraft(site_type="랜딩"))
    )

    assert used_ai is False
    assert reply.strip()
    assert draft.who_updates == "제가 직접 고칠게요"


# ─────────────────────────── 빈 값이 답을 지우지 않는다 ───────────────────────────

def test_draft_from_data_keeps_previous_when_model_returns_blank():
    """모델은 이번 턴에 언급 없는 항목을 빈 문자열로 돌려주는 일이 흔하다.

    그대로 반영하면 앞 턴에 어렵게 받아낸 답이 지워진다 — 제작 슬롯은 한 번 듣고
    지나가는 항목이라 이 사고가 특히 치명적이다.
    """
    previous = CommissionDraft(
        site_type="예약",
        pages=["메인", "예약"],
        who_updates="제가 직접",
        estimate_min=1_000_000,
    )

    merged = cs._draft_from_data({"reply": "네", "who_updates": "", "pages": []}, previous)

    assert merged.who_updates == "제가 직접"
    assert merged.pages == ["메인", "예약"]
    assert merged.site_type == "예약"
    assert merged.estimate_min == 1_000_000


def test_draft_from_data_overwrites_when_model_has_a_value():
    previous = CommissionDraft(who_updates="제가 직접")
    merged = cs._draft_from_data({"who_updates": "직원이 고쳐요"}, previous)
    assert merged.who_updates == "직원이 고쳐요"


# ─────────────────────────── 저장 ───────────────────────────

def _make_commission(db) -> CommissionRequest:
    return cs.create_commission(
        db,
        CommissionIn(
            contact_email="a@b.com",
            site_type="예약",
            summary="미용실 예약",
            requirements={"pages": ["메인"], "features": ["예약"]},
            consent=True,
        ),
    )


def test_create_commission_issues_access_token(db_session):
    commission = _make_commission(db_session)
    assert len(commission.access_token) == 32


def test_get_by_token_rejects_short_values(db_session):
    _make_commission(db_session)
    assert cs.get_by_token(db_session, "short") is None
    assert cs.get_by_token(db_session, "") is None


def test_get_by_token_finds_the_commission(db_session):
    commission = _make_commission(db_session)
    found = cs.get_by_token(db_session, commission.access_token)
    assert found is not None and found.id == commission.id


def test_store_depth_answers_persists_and_survives_reload(db_session):
    commission = _make_commission(db_session)
    draft = cs.draft_from_commission(commission)
    draft.who_updates = "제가 직접"
    draft.dislikes = ["팝업"]

    cs.store_depth_answers(db_session, commission, draft)
    reloaded = cs.draft_from_commission(commission)

    assert reloaded.who_updates == "제가 직접"
    assert reloaded.dislikes == ["팝업"]


def test_store_depth_answers_does_not_touch_the_estimate(db_session):
    """견적은 **관리자가 본 그 값**으로 남아야 한다. 손님이 나중에 말을 보태는
    자리이지, 이미 접수된 내용을 갈아엎는 자리가 아니다."""
    commission = _make_commission(db_session)
    commission.estimate_min, commission.estimate_max = 2_000_000, 5_000_000
    db_session.commit()

    draft = cs.draft_from_commission(commission)
    draft.who_updates = "제가 직접"
    draft.estimate_min, draft.estimate_max = 1, 2   # 손님 쪽에서 조작해도

    cs.store_depth_answers(db_session, commission, draft)

    assert commission.estimate_min == 2_000_000
    assert commission.estimate_max == 5_000_000


def test_store_depth_answers_accumulates_pages(db_session):
    commission = _make_commission(db_session)
    draft = cs.draft_from_commission(commission)
    draft.pages = ["문의"]

    cs.store_depth_answers(db_session, commission, draft)

    assert commission.requirements["pages"] == ["메인", "문의"]


def test_store_depth_answers_ignores_blank_answers(db_session):
    commission = _make_commission(db_session)
    draft = cs.draft_from_commission(commission)
    draft.who_updates = "제가 직접"
    cs.store_depth_answers(db_session, commission, draft)

    blank = cs.draft_from_commission(commission)
    blank.who_updates = ""
    cs.store_depth_answers(db_session, commission, blank)

    assert commission.requirements["who_updates"] == "제가 직접"


# ─────────────────────────── 질문지 ───────────────────────────

def test_depth_questions_shrink_as_answers_arrive():
    draft = CommissionDraft()
    before = cs.depth_questions_for(draft)
    assert len(before) == len(cs._DEPTH_FIELDS)

    draft.who_updates = "제가 직접"
    after = cs.depth_questions_for(draft)
    assert len(after) == len(before) - 1


@pytest.mark.parametrize("field", cs._DEPTH_FIELDS)
def test_every_slot_has_a_question(field):
    """슬롯을 늘리면서 질문을 빠뜨리면 그 항목은 영원히 안 물어보게 된다."""
    assert cs._DEPTH_QUESTIONS[field].strip()
    assert cs._DEPTH_LABELS[field].strip()


# ─────────────────────── 요약이 원문을 덮지 않는다 ───────────────────────
#
# 실제로 브라우저에서 돌려 보고 잡은 사고다. 손님이 맥락까지 담아 답해 슬롯이
# 잘 찼는데, 다음 턴에 모델이 같은 항목을 한 단어로 다시 요약해 보내면서 원문을
# 덮어썼다. 지워진 "컴퓨터를 잘 못 다룬다"는 CMS 를 붙일지 말지를 가르는 정보였다.

def test_summary_does_not_overwrite_the_original_answer():
    previous = CommissionDraft(
        who_updates="가격표가 자주 바뀌어서 손님께서 직접 고치고 싶어하심. 컴퓨터는 익숙하지 않음"
    )

    merged = cs._draft_from_data({"who_updates": "손님"}, previous)

    assert "컴퓨터는 익숙하지 않음" in merged.who_updates


def test_a_real_correction_still_wins():
    """정정은 대개 없던 말을 들고 오므로 축약 방지 규칙에 걸리지 않아야 한다."""
    previous = CommissionDraft(who_updates="손님께서 직접 고치심")

    merged = cs._draft_from_data({"who_updates": "직원이 고치기로 바꾸셨음"}, previous)

    assert merged.who_updates == "직원이 고치기로 바꾸셨음"


@pytest.mark.parametrize(
    "previous,fresh,expected",
    [
        ("손님께서 직접 고치심", "손님", True),    # 줄여 쓴 것 → 이전을 지킨다
        ("손님께서 직접 고치심", "직원이 고침", False),  # 새 정보 → 갱신한다
        ("", "손님", False),                        # 처음 받는 값
        ("손님", "", False),                        # 빈 값은 다른 규칙이 막는다
    ],
)
def test_keeps_more(previous, fresh, expected):
    assert cs._keeps_more(previous, fresh) is expected


# ─────────────────────── 질문 문구는 평문이어야 한다 ───────────────────────

@pytest.mark.parametrize("field", cs._DEPTH_FIELDS)
def test_questions_carry_no_markdown(field):
    """말풍선은 평문으로 렌더된다. `**강조**`를 넣으면 별표가 그대로 손님에게 보인다.

    모델에게는 마크다운을 쓰지 말라고 해 놓고 손으로 쓴 질문에 넣어 두는 실수를 실제로 했다.
    """
    question = cs._DEPTH_QUESTIONS[field]
    for token in ("**", "##", "`", "__"):
        assert token not in question
