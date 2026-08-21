"""3단계 — 체리의 "확인 필요"가 도안의 대본이 되는 경로.

여태 체리는 물어봐야 할 것을 **문서에 적고 끝냈다.** 그래서 결국 내가 손님에게
다시 연락해서 물어야 했고, 공방이 없애려던 왕복이 그대로 남아 있었다.
여기서 그 목록의 목적지를 바꾼다 — 새로 만든 지능은 없고, 체리는 이미 정확한
목록을 뽑아내고 있다.

파싱을 테스트로 감싸는 이유: **프롬프트는 방어선이 아니다.** 체리에게 형식을
시켰지만 언젠가는 어긴다. 어겨도 대본이 깨지지 않아야 한다.
"""

import pytest

from app.models import CommissionRequest
from app.schemas import CommissionDraft, CommissionIn, PlannerQuestion
from app.services import commission_service as cs


# ─────────────────────────── 파싱 ───────────────────────────

def test_parses_dash_list():
    text = "- 가격을 표시할까요?\n- 지도는 어느 쪽이 편하세요?"
    assert cs.parse_question_lines(text) == [
        "가격을 표시할까요?",
        "지도는 어느 쪽이 편하세요?",
    ]


@pytest.mark.parametrize(
    "line",
    ["- 질문입니다 맞나요?", "* 질문입니다 맞나요?", "1. 질문입니다 맞나요?", "1) 질문입니다 맞나요?"],
)
def test_accepts_every_list_marker(line):
    """체리가 `- ` 대신 번호를 쓰는 일은 실제로 있다. 형식 위반으로 목록을 통째로 잃지 않는다."""
    assert cs.parse_question_lines(line) == ["질문입니다 맞나요?"]


def test_drops_headings_and_prose():
    text = (
        "# 손님 확인 질문\n"
        "\n"
        "> 아래는 확인이 필요한 항목입니다.\n"
        "이것은 설명 문단이라 질문이 아니다\n"
        "- 진짜 질문은 이것입니다. 맞나요?\n"
    )
    assert cs.parse_question_lines(text) == ["진짜 질문은 이것입니다. 맞나요?"]


def test_keeps_bare_lines_that_are_questions():
    """목록 표시를 빠뜨려도 물음표로 끝나면 질문으로 본다."""
    assert cs.parse_question_lines("사진은 직접 주실 수 있나요?") == [
        "사진은 직접 주실 수 있나요?"
    ]


def test_drops_too_short_and_duplicates():
    text = "- 짧음\n- 같은 질문인가요?\n- 같은 질문인가요?"
    assert cs.parse_question_lines(text) == ["같은 질문인가요?"]


def test_caps_the_list():
    """도안이 스무 개를 연달아 물으면 그건 취조다. 위에서부터 여덟 개까지만."""
    text = "\n".join(f"- 질문 번호 {i} 인가요?" for i in range(20))
    assert len(cs.parse_question_lines(text)) == 8


# ─────────────────────────── 저장 ───────────────────────────

def _make(db) -> CommissionRequest:
    return cs.create_commission(
        db,
        CommissionIn(
            contact_email="a@b.com",
            site_type="예약",
            summary="미용실",
            requirements={"pages": ["메인"]},
            consent=True,
        ),
    )


def test_import_stores_questions(db_session):
    commission = _make(db_session)
    cs.import_planner_questions(db_session, commission, "- 가격을 표시할까요?")

    assert commission.pending_questions == [
        {"id": "q1", "question": "가격을 표시할까요?", "answer": ""}
    ]


def test_reimport_keeps_answers_already_collected(db_session):
    """체리를 반려하고 다시 돌리면 질문이 조금 바뀐다.

    그때 같은 질문에 이미 받아 둔 답까지 날리면 **손님에게 두 번 묻게 된다.**
    질문 문장으로 짝을 지어 답을 옮겨 온다.
    """
    commission = _make(db_session)
    cs.import_planner_questions(
        db_session, commission, "- 가격을 표시할까요?\n- 지도는 어디를 쓸까요?"
    )
    commission.pending_questions[0]["answer"] = "네, 표시할게요"
    from sqlalchemy.orm.attributes import flag_modified

    flag_modified(commission, "pending_questions")
    db_session.commit()

    # 체리가 다시 돌면서 질문 순서가 바뀌고 하나가 늘었다
    cs.import_planner_questions(
        db_session,
        commission,
        "- 지도는 어디를 쓸까요?\n- 가격을 표시할까요?\n- 로고가 있으신가요?",
    )

    by_question = {
        item["question"]: item["answer"] for item in commission.pending_questions
    }
    assert by_question["가격을 표시할까요?"] == "네, 표시할게요"
    assert by_question["지도는 어디를 쓸까요?"] == ""
    assert "로고가 있으신가요?" in by_question


def test_draft_carries_questions(db_session):
    commission = _make(db_session)
    cs.import_planner_questions(db_session, commission, "- 가격을 표시할까요?")

    draft = cs.draft_from_commission(commission)
    assert [item.question for item in draft.planner_questions] == ["가격을 표시할까요?"]


def test_store_depth_answers_saves_question_answers(db_session):
    commission = _make(db_session)
    cs.import_planner_questions(db_session, commission, "- 가격을 표시할까요?")

    draft = cs.draft_from_commission(commission)
    draft.planner_questions[0].answer = "네, 표시할게요"
    cs.store_depth_answers(db_session, commission, draft)

    reloaded = cs.draft_from_commission(commission)
    assert reloaded.planner_questions[0].answer == "네, 표시할게요"


# ─────────────────────────── 순서와 완료 조건 ───────────────────────────

def test_fixed_slots_are_asked_before_planner_questions():
    """고정 슬롯은 어떤 의뢰에나 필요하고, 체리 질문은 이 의뢰에만 해당하는 보충이다."""
    draft = CommissionDraft(
        planner_questions=[PlannerQuestion(id="q1", question="가격을 표시할까요?")]
    )
    questions = cs.depth_questions_for(draft)

    assert questions[0] == cs._DEPTH_QUESTIONS["who_updates"]
    assert questions[-1] == "가격을 표시할까요?"


def test_depth_done_ignores_planner_questions():
    """완료 조건에 체리 질문을 넣으면 기준이 의뢰마다 달라진다. 고정 필수 슬롯만 본다."""
    draft = CommissionDraft(
        who_updates="a",
        content_owner="b",
        success_metric="c",
        existing_assets="d",
        planner_questions=[PlannerQuestion(id="q1", question="아직 안 물어본 것?")],
    )
    filled = cs._fill_missing(draft)

    assert filled.depth_done is True
    assert filled.depth_missing, "안 물어본 체리 질문은 남은 항목에 보여야 한다"


def test_planner_questions_appear_in_depth_missing():
    draft = cs._fill_missing(
        CommissionDraft(
            planner_questions=[PlannerQuestion(id="q1", question="가격을 표시할까요?")]
        )
    )
    assert "가격을 표시할까요?" in draft.depth_missing


# ─────────────────────────── 모델 응답 반영 ───────────────────────────

def test_apply_planner_answers():
    draft = CommissionDraft(
        planner_questions=[
            PlannerQuestion(id="q1", question="가격?"),
            PlannerQuestion(id="q2", question="지도?"),
        ]
    )
    cs._apply_planner_answers(draft, {"q1": "네 표시할게요", "q2": ""})

    assert draft.planner_questions[0].answer == "네 표시할게요"
    assert draft.planner_questions[1].answer == ""


def test_apply_planner_answers_ignores_garbage():
    draft = CommissionDraft(planner_questions=[PlannerQuestion(id="q1", question="가격?")])
    cs._apply_planner_answers(draft, "문자열이 왔다")
    assert draft.planner_questions[0].answer == ""


def test_apply_planner_answers_does_not_shrink():
    """제작 슬롯과 같은 규칙 — 요약이 원문을 덮지 않는다."""
    draft = CommissionDraft(
        planner_questions=[
            PlannerQuestion(id="q1", question="가격?", answer="네, 표시하되 제가 직접 고칠게요")
        ]
    )
    cs._apply_planner_answers(draft, {"q1": "네"})
    assert draft.planner_questions[0].answer == "네, 표시하되 제가 직접 고칠게요"


def test_rule_based_path_asks_planner_questions_after_fixed_slots(monkeypatch):
    draft = CommissionDraft(
        planner_questions=[PlannerQuestion(id="q1", question="가격을 표시할까요?")]
    )
    for field in ("who_updates", "content_owner", "success_metric", "existing_assets"):
        setattr(draft, field, "답")
    draft.dislikes = ["x"]
    draft.reference_notes = "답"
    draft.decision_maker = "답"

    reply, draft = cs._depth_without_ai("네", draft)
    assert reply == "가격을 표시할까요?"

    _reply2, draft = cs._depth_without_ai("네, 표시할게요", draft)
    assert draft.planner_questions[0].answer == "네, 표시할게요"
