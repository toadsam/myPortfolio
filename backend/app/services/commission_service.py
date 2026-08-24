"""의뢰 공방 — 홈페이지 제작 의뢰 상담·견적·접수.

마을에서 유일하게 **외부인이 데이터를 쓰는** 경로다. 그래서 다른 서비스와 다른 원칙이 셋 있다:

1. 견적은 절대 확정값이 아니다. AI가 부른 금액은 `_baseline_estimate()` 규칙 범위를
   벗어나지 못하게 clamp 한다 — 모델이 0원이나 1억을 부르는 사고를 구조적으로 막는다.
2. AI가 죽어도 접수는 살아야 한다. OpenAI 실패 시 규칙 기반 상담으로 조용히 내려간다.
3. 접수되면 반드시 나에게 알린다(디스코드). admin 페이지를 안 열어도 새 의뢰를 놓치지 않게.

파일 뒤쪽 절반은 3단계(직군별 에이전트 제작)다. 접수 건에 CommissionTask 4개가
붙고 게이트 3단을 지나며 산출물이 쌓인다. **다만 "진행해도 되는가"의 판단은
여기 없다** — 전부 app/agents/gate.py 에 있고 이 파일은 그 결정을 저장만 한다.
"""

import json
import logging
import re
import uuid
from typing import Any

from sqlalchemy import desc
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.agents import gate
from app.config import settings
from app.models import (
    CommissionArtifact,
    CommissionMessage,
    CommissionRequest,
    CommissionTask,
)
from app.schemas import (
    ESTIMATE_DISCLAIMER,
    CommissionDraft,
    CommissionIn,
    PlannerQuestion,
)


logger = logging.getLogger(__name__)


# ─────────────────────────── 견적 기준선 ───────────────────────────
#
# 확정가가 아니라 "대화를 이 정도 규모로 이해했다"를 보여주는 범위다.
# 단위: 원. 값은 1인 개발 기준의 보수적인 시작점이고, 실제 협의에서 조정된다.

_BASE_BY_TYPE: dict[str, tuple[int, int, int, int]] = {
    # site_type: (금액 하한, 금액 상한, 기간 하한(주), 기간 상한(주))
    "랜딩": (800_000, 1_800_000, 1, 3),
    "포트폴리오": (600_000, 1_500_000, 1, 3),
    "기업소개": (1_500_000, 3_500_000, 2, 5),
    "예약": (2_500_000, 6_000_000, 4, 8),
    "쇼핑몰": (4_000_000, 12_000_000, 6, 14),
    "웹서비스": (5_000_000, 15_000_000, 8, 16),
}
_DEFAULT_BASE = (1_000_000, 4_000_000, 2, 6)

# 요구사항 텍스트에서 site_type 을 추정할 때 쓰는 힌트
_TYPE_HINTS: dict[str, list[str]] = {
    "쇼핑몰": ["쇼핑몰", "커머스", "결제", "장바구니", "판매", "스토어"],
    "예약": ["예약", "신청", "접수", "부킹", "상담신청", "일정"],
    "웹서비스": ["웹서비스", "플랫폼", "회원", "로그인", "대시보드", "앱", "서비스"],
    "기업소개": ["회사", "기업", "소개", "브랜드", "사업"],
    "포트폴리오": ["포트폴리오", "작업물", "이력", "개인"],
    "랜딩": ["랜딩", "원페이지", "홍보", "이벤트", "한페이지"],
}

# 별도로 값이 크게 붙는 기능들 (금액 하한/상한, 추가 주)
_FEATURE_WEIGHTS: dict[str, tuple[int, int, int]] = {
    "결제": (1_500_000, 4_000_000, 3),
    "로그인": (600_000, 1_500_000, 1),
    "회원": (600_000, 1_500_000, 1),
    "관리자": (1_000_000, 2_500_000, 2),
    "예약": (800_000, 2_000_000, 2),
    "지도": (400_000, 1_000_000, 1),
    "다국어": (500_000, 1_500_000, 1),
    "채팅": (800_000, 2_500_000, 2),
    "알림": (400_000, 1_000_000, 1),
    "게시판": (400_000, 1_200_000, 1),
    "ai": (1_000_000, 3_000_000, 2),
    # 연출 가산 — NPC 릴레이 설문(Q6 움직임 정도)에서 고른다. 화면 연출은 기능이
    # 아니지만 작업량은 기능만큼 드므로 같은 표에서 가산한다.
    "스크롤연출": (300_000, 800_000, 1),
    "인터랙티브": (1_500_000, 4_000_000, 2),
}

# 페이지 가산 — 기본 5장을 넘는 장당. 프론트가 같은 계산을 하므로 상수로 뺀다.
_PAGE_FREE = 5
_PAGE_ADD = (150_000, 300_000)


def pricing_table() -> dict[str, Any]:
    """견적 규칙을 프론트에 내려준다 — NPC 릴레이 설문이 선택지마다 가산치를 보여주고
    누적 견적을 실시간으로 굴리기 위해서다. **표를 두 벌 손으로 복사하지 않는다.**
    화면의 숫자는 참고이고, 서버 `_clamp_estimate()` 가 항상 이긴다."""
    return {
        "base_by_type": {
            k: {"min": lo, "max": hi, "weeks_min": wlo, "weeks_max": whi}
            for k, (lo, hi, wlo, whi) in _BASE_BY_TYPE.items()
        },
        "default_base": {
            "min": _DEFAULT_BASE[0],
            "max": _DEFAULT_BASE[1],
            "weeks_min": _DEFAULT_BASE[2],
            "weeks_max": _DEFAULT_BASE[3],
        },
        "feature_weights": {
            k: {"min": lo, "max": hi, "weeks": w} for k, (lo, hi, w) in _FEATURE_WEIGHTS.items()
        },
        "page_free": _PAGE_FREE,
        "page_add_min": _PAGE_ADD[0],
        "page_add_max": _PAGE_ADD[1],
        "clamp_low": 0.6,
        "clamp_high": 1.8,
    }


def guess_site_type(text: str) -> str:
    """대화 전문에서 사이트 유형을 추정한다. 못 찾으면 빈 문자열."""
    lowered = text.lower()
    for site_type, hints in _TYPE_HINTS.items():
        if any(hint in lowered for hint in hints):
            return site_type
    return ""


def _baseline_estimate(
    site_type: str, pages: list[str], features: list[str]
) -> tuple[int, int, int, int, str]:
    """규칙 기반 참고 견적. AI 결과를 clamp 하는 기준이기도 하다."""
    lo, hi, wlo, whi = _BASE_BY_TYPE.get(site_type, _DEFAULT_BASE)
    reasons = [f"{site_type or '일반 홈페이지'} 기준"]

    # 페이지 가산 — 기본 5장을 넘는 만큼만
    extra_pages = max(0, len(pages) - _PAGE_FREE)
    if extra_pages:
        lo += extra_pages * _PAGE_ADD[0]
        hi += extra_pages * _PAGE_ADD[1]
        whi += (extra_pages + 2) // 3
        reasons.append(f"추가 페이지 {extra_pages}장")

    # 무게 있는 기능 가산
    joined = " ".join(features).lower()
    hit_names: list[str] = []
    for keyword, (add_lo, add_hi, add_weeks) in _FEATURE_WEIGHTS.items():
        if keyword in joined:
            lo += add_lo
            hi += add_hi
            whi += add_weeks
            hit_names.append(keyword)
    if hit_names:
        reasons.append("기능: " + ", ".join(hit_names))

    if whi <= wlo:
        whi = wlo + 1
    return lo, hi, wlo, whi, " · ".join(reasons)


def _clamp_estimate(draft: CommissionDraft) -> CommissionDraft:
    """모델이 제시한 금액을 규칙 기준선의 0.6~1.8배 안으로 가둔다.

    AI가 상담 맥락을 반영해 조정하는 건 허용하되, 자릿수가 튀는 건 막는다.
    """
    lo, hi, wlo, whi, reason = _baseline_estimate(
        draft.site_type, draft.pages, draft.features
    )

    if draft.estimate_min <= 0 or draft.estimate_max <= 0:
        draft.estimate_min, draft.estimate_max = lo, hi
        if not draft.estimate_reason:
            draft.estimate_reason = reason
    else:
        draft.estimate_min = max(int(lo * 0.6), min(draft.estimate_min, int(hi * 1.8)))
        draft.estimate_max = max(int(lo * 0.6), min(draft.estimate_max, int(hi * 1.8)))
        if draft.estimate_max < draft.estimate_min:
            draft.estimate_min, draft.estimate_max = draft.estimate_max, draft.estimate_min

    if draft.weeks_min <= 0 or draft.weeks_max <= 0:
        draft.weeks_min, draft.weeks_max = wlo, whi
    else:
        draft.weeks_min = max(1, min(draft.weeks_min, whi * 2))
        draft.weeks_max = max(draft.weeks_min, min(draft.weeks_max, whi * 2))

    return draft


def estimate_only(draft: CommissionDraft) -> CommissionDraft:
    """LLM 없이 draft 의 견적만 규칙으로 다시 낸다 — 릴레이 설문이 선택지를 고를 때마다
    부른다. 프론트가 굴린 숫자는 버리고 기준선으로 덮는다(선택지 경로엔 모델 추정이 없다)."""
    fresh = draft.model_copy(deep=True)
    fresh.estimate_min = fresh.estimate_max = 0
    fresh.weeks_min = fresh.weeks_max = 0
    fresh.estimate_reason = ""
    return _fill_missing(_clamp_estimate(fresh))


# ─────────────────────────── 제작 슬롯 (2차 심화 문답) ───────────────────────────
#
# 이 표가 "재훈이 실제로 만들 때 알아야 하는 것" 목록이다. 견적 슬롯과 목적이 다르다 —
# 견적 슬롯은 *얼마짜리인가*, 여기는 *어떻게 만들어야 잘 만드는가* 를 묻는다.
#
# **1차 상담에서는 이걸 쫓지 않는다.** 접수 전에 여덟 개를 캐물으면 손님이 떠난다.
# 대신 접수를 마친 사람에게 링크를 주고 여기서 차분히 받는다 — 이미 투자한 사람은
# 이탈 비용이 낮고, 답을 받고 싶어 하므로 문턱을 올려도 안전하다.
#
# (필드, 라벨, 필수 여부, 도안이 던질 질문)
_DEPTH_SLOTS: tuple[tuple[str, str, bool, str], ...] = (
    (
        "who_updates",
        "운영·수정 주체",
        True,
        "사이트를 만든 뒤에 내용(사진·글·가격 같은 것)은 누가 고치게 될까요? "
        "직접 고치실 건지, 저에게 요청하실 건지에 따라 만드는 방식이 꽤 달라져요.",
    ),
    (
        "content_owner",
        "콘텐츠 준비",
        True,
        "들어갈 사진과 글은 준비된 게 있으실까요? "
        "가지고 계신 사진을 주시는지, 새로 찍어야 하는지, 글은 누가 쓸지가 궁금해요.",
    ),
    (
        "success_metric",
        "성공 기준",
        True,
        "사이트가 생기고 나서 뭐가 달라지면 잘 만든 걸까요? "
        "문의 전화가 늘어나는 것, 검색해서 찾아오는 것, 그냥 보여드릴 곳이 생기는 것 — 어느 쪽에 가까우세요?",
    ),
    (
        "existing_assets",
        "기존 자산",
        True,
        "이미 가지고 계신 게 있을까요? 도메인 주소, 예전에 만든 사이트, "
        "인스타그램이나 네이버 플레이스 같은 것들이요.",
    ),
    (
        "dislikes",
        "피하고 싶은 것",
        False,
        "반대로, 이건 좀 아니다 싶은 게 있으세요? "
        "예전에 봤던 사이트 중에 별로였던 점이나, 우리 사이트에선 안 했으면 하는 것이요.",
    ),
    (
        "reference_notes",
        "참고 사이트의 이유",
        False,
        "마음에 두신 사이트가 있다면, 그 사이트의 어떤 점이 좋으셨는지 알려주세요. "
        "주소만으로는 어디를 보고 좋아하셨는지 제가 짚기가 어려워서요.",
    ),
    (
        "decision_maker",
        "결정하는 분",
        False,
        "시안을 보고 최종적으로 결정하시는 분은 누구실까요? "
        "여러 분이 함께 보시는지도 알려주시면 일정을 잡기가 수월해요.",
    ),
)

_DEPTH_REQUIRED = tuple(field for field, _, required, _q in _DEPTH_SLOTS if required)
_DEPTH_FIELDS = tuple(field for field, _, _r, _q in _DEPTH_SLOTS)
_DEPTH_LABELS = {field: label for field, label, _r, _q in _DEPTH_SLOTS}
_DEPTH_QUESTIONS = {field: question for field, _l, _r, question in _DEPTH_SLOTS}


def _depth_value(draft: CommissionDraft, field: str) -> str:
    value = getattr(draft, field, "")
    if isinstance(value, list):
        return ", ".join(str(item).strip() for item in value if str(item).strip())
    return str(value or "").strip()


def depth_questions_for(draft: CommissionDraft) -> list[str]:
    """아직 답이 없는 질문 목록. 2차 화면이 안내로 쓴다.

    고정 슬롯이 **먼저**고 체리의 질문이 뒤다. 고정 슬롯은 어떤 의뢰에나 필요한
    것들이라 답을 못 받으면 아예 못 만들고, 체리 질문은 이 의뢰에만 해당하는
    보충이라 뒤로 가도 손해가 적기 때문이다.
    """
    fixed = [
        _DEPTH_QUESTIONS[field]
        for field in _DEPTH_FIELDS
        if not _depth_value(draft, field)
    ]
    return fixed + [item.question for item in unanswered_planner_questions(draft)]


# ─────────────────────────── 상담 ───────────────────────────

_REQUIRED_SLOTS = ("site_type", "summary", "pages", "features")


def _fill_missing(draft: CommissionDraft) -> CommissionDraft:
    missing: list[str] = []
    if not draft.site_type:
        missing.append("어떤 종류의 사이트인지")
    if not draft.summary:
        missing.append("무엇을 하는 사이트인지")
    if not draft.pages:
        missing.append("필요한 페이지 구성")
    if not draft.features:
        missing.append("꼭 있어야 하는 기능")
    if not draft.deadline_hint:
        missing.append("희망 일정")

    draft.missing = missing

    # 접수 문턱은 낮게 잡는다. 유형과 (페이지 또는 기능)만 잡히면 접수할 수 있다.
    #
    # summary 를 문턱에 넣었더니, 모델이 "아직 더 물어봐야지" 하며 summary 를 비워 두는
    # 바람에 유형·기능·일정·예산을 다 말한 손님도 접수 버튼을 못 보는 일이 실제로 났다.
    # 못 들은 항목은 missing 으로 계속 안내하되, 손님을 붙잡아 두지는 않는다 —
    # 어차피 접수 뒤에 사람이 한 번 더 확인하는 창구다.
    draft.ready_to_submit = bool(draft.site_type and (draft.pages or draft.features))

    # 제작 슬롯은 **별도 목록으로** 쫓는다. 여기를 missing 에 합치면 도안이 1차에서
    # 여덟 개를 캐묻기 시작하고, 그 순간 위에서 애써 낮춘 문턱이 무의미해진다.
    draft.depth_missing = [
        _DEPTH_LABELS[field]
        for field in _DEPTH_FIELDS
        if not _depth_value(draft, field)
    ] + [
        # 체리 질문은 라벨이 따로 없으니 질문을 줄여 보여준다.
        (item.question[:18] + "…") if len(item.question) > 18 else item.question
        for item in draft.planner_questions
        if not item.answer.strip()
    ]
    # depth_done 은 **고정 필수 슬롯만** 본다. 체리 질문은 의뢰마다 있을 수도
    # 없을 수도 있어서, 그걸 완료 조건에 넣으면 기준이 의뢰마다 달라진다.
    draft.depth_done = all(_depth_value(draft, field) for field in _DEPTH_REQUIRED)
    return draft


# 릴레이 설문에서 "지금 말하는 식구"가 누구인지. 도안 말고 다른 식구가 답할 때는
# 그 직군의 말투·관심사를 덧씌우되, 슬롯 추출 규칙(특히 제작 슬롯을 먼저 묻지 않기)은
# 그대로다. 페르소나는 catalog 의 공방 프로필에서 가져온다 — 여기에 두 벌 적지 않는다.
SPEAKERS: dict[str, str] = {
    "intake": "atelier-intake-npc",
    "planner": "atelier-planner-npc",
    "designer": "atelier-designer-npc",
    "frontend": "atelier-frontend-npc",
    "backend": "atelier-backend-npc",
}


def _speaker_block(speaker: str) -> str:
    npc_id = SPEAKERS.get(speaker, SPEAKERS["intake"])
    if npc_id == SPEAKERS["intake"]:
        return ""
    from app.catalog import NPCS

    profile = NPCS.get(npc_id, {})
    if not profile:
        return ""
    return (
        "\n\n"
        f"지금 이 턴에 답하는 사람은 도안이 아니라 공방 식구 '{profile['name']}'({profile['role']})이다. "
        f"말투: {profile['tone']} 성격: {profile['personality']} "
        f"자기 분야({profile['scope']}) 이야기는 구체적으로 하되, 다른 분야 질문은 "
        f"'그건 담당이 따로 있어요'라고 짧게 넘긴다. reply 는 {profile['name']}의 1인칭으로 쓴다. "
        "JSON 형식과 슬롯 추출 규칙은 그대로다."
    )


async def consult(
    message: str,
    history: list[str],
    previous: CommissionDraft | None = None,
    speaker: str = "intake",
) -> tuple[str, bool, CommissionDraft]:
    """접수원 NPC 한 턴. (답변, AI 사용 여부, 갱신된 draft)"""
    if settings.openai_api_key:
        try:
            reply, draft = await _consult_with_openai(message, history, previous, speaker)
            return reply, True, _fill_missing(_clamp_estimate(draft))
        except Exception:
            # 폴백은 옳지만 **조용히** 내려가면 안 된다. 여기가 침묵하면
            # "도안이 왜 갑자기 밋밋해졌지"를 알아낼 방법이 없다.
            logger.warning(
                "상담 OpenAI 호출 실패 → 규칙 기반으로 폴백 (model=%s)",
                settings.openai_model,
                exc_info=True,
            )

    reply, draft = _consult_without_ai(message, history, previous, speaker)
    return reply, False, _fill_missing(_clamp_estimate(draft))


_SYSTEM_PROMPT = """너는 정재훈의 3D 포트폴리오 마을 지하에 있는 '의뢰 공방'의 접수원 NPC '도안'이다.
홈페이지 제작을 의뢰하러 온 방문자와 대화하며 요구사항을 파악하고 참고 견적을 안내한다.

지켜야 할 것:
- 한국어로, 3~5문장으로 짧게 답한다. 마크다운 제목·굵게·코드블록은 쓰지 않는다.
- 한 번에 질문은 최대 2개까지만. 취조하듯 몰아붙이지 않는다.
- 아직 못 들은 항목이 있으면 그중 가장 중요한 것부터 자연스럽게 묻는다.
- **같은 질문을 두 번 하지 않는다.** 손님이 답을 피하거나 화제를 돌렸으면 그 항목은
  비워 둔 채 넘어간다. 되풀이하면 대화가 제자리를 돈다.
- **무거운 단서가 나오면 쫓던 항목을 제쳐두고 그 뒤를 먼저 판다.**
  결제·로그인·회원·예약·외부 연동·다국어가 언급되면, 그게 견적과 난이도를 가장 크게
  바꾸는 지점이다. 한 겹 더 들어가서 묻는다 —
  결제면 "무엇을 얼마에 파시는지, 월 몇 건쯤 예상하시는지",
  로그인이면 "누가 로그인하고 로그인해야만 볼 수 있는 게 무엇인지",
  연동이면 "어떤 서비스와 무엇을 주고받아야 하는지".
  기능 이름만 목록에 담고 넘어가면 나중에 견적이 통째로 틀어진다.
- 금액을 말할 때는 반드시 '참고 범위'라고 밝힌다. 확정 견적처럼 말하지 않는다.
- 정재훈이 실제로 할 수 있는 범위(웹 프론트엔드, 백엔드 API, 3D/인터랙션)를 넘는 약속은 하지 않는다.
- 방문자가 밝히지 않은 정보를 지어내지 않는다. 모르면 빈 값으로 둔다.
- 공방 분위기는 따뜻하고 차분하다. 장인의 작업실에 손님이 찾아온 느낌으로 응대한다.

반드시 아래 JSON 형식으로만 답한다:
{
  "reply": "방문자에게 보여줄 답변",
  "site_type": "랜딩|포트폴리오|기업소개|예약|쇼핑몰|웹서비스 중 하나 또는 빈 문자열",
  "summary": "이 사이트가 무엇을 하는지 한 문장",
  "pages": ["필요한 페이지"],
  "features": ["필요한 기능"],
  "tone": "원하는 분위기/톤",
  "references": ["방문자가 언급한 참고 사이트"],
  "budget_hint": "방문자가 말한 예산 (없으면 빈 문자열)",
  "deadline_hint": "방문자가 말한 일정 (없으면 빈 문자열)",
  "estimate_min": 원 단위 정수,
  "estimate_max": 원 단위 정수,
  "weeks_min": 주 단위 정수,
  "weeks_max": 주 단위 정수,
  "estimate_reason": "그 범위가 나온 근거 한 줄",
  "who_updates": "만든 뒤 내용을 누가 고치는지 (안 나왔으면 빈 문자열)",
  "content_owner": "사진·글·로고를 누가 준비하는지 (안 나왔으면 빈 문자열)",
  "success_metric": "사이트가 생기면 뭐가 달라져야 하는지 (안 나왔으면 빈 문자열)",
  "existing_assets": "이미 가진 도메인·기존 사이트·SNS (안 나왔으면 빈 문자열)",
  "dislikes": ["피하고 싶다고 말한 것"],
  "reference_notes": "참고 사이트의 어떤 점이 좋다고 했는지 (안 나왔으면 빈 문자열)",
  "decision_maker": "최종 결정하는 사람 (안 나왔으면 빈 문자열)"
}

**마지막 일곱 개(who_updates ~ decision_maker)는 먼저 묻지 않는다.** 손님이 말이 나온
김에 알려주면 담기만 하고, 없으면 빈 문자열로 둔다. 이건 접수 뒤에 따로 여쭐 것들이라
지금 캐물으면 접수까지 못 가고 손님이 떠난다. 채우려고 질문을 만들어내지 마라.

pages/features/references 는 이전 대화에서 이미 파악된 것을 **누적해서** 모두 담는다.
summary 는 아직 질문이 남았더라도 **지금까지 들은 내용으로 항상 채운다** — 손님이 한 문장으로
정리해 말해주지 않았어도, 대화에서 파악한 대로 네가 요약해 넣는다. 비워 두지 않는다."""


async def _consult_with_openai(
    message: str,
    history: list[str],
    previous: CommissionDraft | None,
    speaker: str = "intake",
) -> tuple[str, CommissionDraft]:
    import httpx

    known = previous.model_dump() if previous else {}
    context_lines = [
        "지금까지 파악된 내용(JSON):",
        json.dumps(known, ensure_ascii=False),
        "",
        "최근 대화:",
        *(f"- {line}" for line in history[-10:] or ["- (첫 대화)"]),
        "",
        "규칙 기반 참고 견적 기준선(이 범위에서 크게 벗어나지 말 것):",
    ]
    lo, hi, wlo, whi, reason = _baseline_estimate(
        known.get("site_type", "") or guess_site_type(message),
        list(known.get("pages", [])),
        list(known.get("features", [])),
    )
    context_lines.append(f"- {lo:,}원 ~ {hi:,}원 / {wlo}~{whi}주 ({reason})")

    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_model,
                "messages": [
                    {
                        "role": "system",
                        "content": _SYSTEM_PROMPT
                        + _speaker_block(speaker)
                        + "\n\n"
                        + "\n".join(context_lines),
                    },
                    {"role": "user", "content": message},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.6,
                "max_tokens": 900,
            },
        )
        response.raise_for_status()
        raw = response.json()["choices"][0]["message"]["content"]

    data = json.loads(raw)
    reply = _clean(str(data.get("reply", "")).strip())
    if not reply:
        raise ValueError("빈 응답")

    return reply, _draft_from_data(data, previous)


def _keeps_more(previous: str, fresh: str) -> bool:
    """새 값이 이전 값을 **줄여 쓴 것**인가.

    실제로 돌려 보고 잡은 사고다. 손님이 "가격표가 자주 바뀌어서 제가 직접 고칠 수
    있으면 좋겠어요, 컴퓨터를 잘 다루진 못해요" 라고 답해 슬롯이 그대로 찼는데,
    다음 턴에 모델이 같은 항목을 "손님" 으로 다시 요약해 보내면서 원문을 덮어썼다.
    지워진 "컴퓨터를 잘 못 다룬다" 는 CMS 를 붙일지 말지를 가르는 정보였다.

    그래서 새 값이 이전 값 안에 이미 들어 있으면(=줄여 쓴 것이면) 이전 값을 지킨다.
    정정은 대개 없던 말을 들고 오므로 이 규칙에 걸리지 않는다.
    """
    if not previous or not fresh:
        return False
    return fresh in previous


def _draft_from_data(data: dict, previous: CommissionDraft | None) -> CommissionDraft:
    """모델이 돌려준 JSON을 draft 로 만든다. **정보를 잃는 쪽으로는 바꾸지 않는다.**

    두 가지를 막는다:
    1. 빈 값 덮어쓰기 — 이번 턴에 언급이 없었다는 이유로 모델이 빈 문자열을 돌려주는
       일이 흔하다. 그대로 반영하면 앞 턴에 어렵게 받아낸 답이 지워진다.
    2. 요약으로 덮어쓰기 — `_keeps_more()` 참고. 이쪽이 더 알아채기 어렵다.

    제작 슬롯은 한 번 듣고 지나가는 항목이라 둘 다 치명적이다.
    """
    prev = previous or CommissionDraft()

    def text(key: str) -> str:
        fresh = str(data.get(key, "") or "").strip()
        before = str(getattr(prev, key, "") or "")
        if not fresh:
            return before
        if _keeps_more(before, fresh):
            return before
        return fresh

    def items(key: str) -> list[str]:
        fresh = _str_list(data.get(key))
        return fresh or list(getattr(prev, key, []) or [])

    return CommissionDraft(
        site_type=text("site_type"),
        summary=text("summary"),
        pages=items("pages"),
        features=items("features"),
        tone=text("tone"),
        references=items("references"),
        budget_hint=text("budget_hint"),
        deadline_hint=text("deadline_hint"),
        estimate_min=_int(data.get("estimate_min")) or prev.estimate_min,
        estimate_max=_int(data.get("estimate_max")) or prev.estimate_max,
        weeks_min=_int(data.get("weeks_min")) or prev.weeks_min,
        weeks_max=_int(data.get("weeks_max")) or prev.weeks_max,
        estimate_reason=text("estimate_reason"),
        who_updates=text("who_updates"),
        content_owner=text("content_owner"),
        success_metric=text("success_metric"),
        existing_assets=text("existing_assets"),
        dislikes=items("dislikes"),
        reference_notes=text("reference_notes"),
        decision_maker=text("decision_maker"),
    )


# AI 없이 식구가 답할 때의 고정 대사. 릴레이 설문은 선택지만으로 완주되므로
# 여기는 "자유롭게 말 걸었는데 AI 가 없는" 드문 경우만 받친다.
_SPEAKER_FALLBACK: dict[str, str] = {
    "planner": "들었어요, 적어 둘게요. 지금은 제가 길게 못 답해 드리지만 접수되면 화면 목록으로 정리해서 짚어 드릴게요.",
    "designer": "메모해 뒀어요. 분위기는 말보다 시안으로 보여 드리는 게 빨라서, 접수 뒤에 한 장 그려서 보여 드릴게요.",
    "frontend": "오케이, 기억해 둘게요! 구현 얘기는 접수되고 나서 제대로 해 드릴게요.",
    "backend": "…적어 뒀습니다. 자세한 건 접수 뒤에 다시 여쭙겠습니다.",
}


def _consult_without_ai(
    message: str,
    history: list[str],
    previous: CommissionDraft | None,
    speaker: str = "intake",
) -> tuple[str, CommissionDraft]:
    """OPENAI_API_KEY 가 없거나 호출이 실패해도 상담이 끊기지 않게 하는 규칙 기반 경로."""
    draft = previous.model_copy(deep=True) if previous else CommissionDraft()

    if not draft.site_type:
        draft.site_type = guess_site_type(message)
    if not draft.summary and len(message.strip()) > 8:
        draft.summary = message.strip()[:200]

    # 기능 키워드 누적
    lowered = message.lower()
    for keyword in _FEATURE_WEIGHTS:
        if keyword in lowered and keyword not in [f.lower() for f in draft.features]:
            draft.features.append(keyword)

    # 일정/예산 힌트
    if not draft.deadline_hint:
        found = re.search(r"(\d+\s*(?:주|개월|달|일)\s*(?:안|이내|정도)?)", message)
        if found:
            draft.deadline_hint = found.group(1).strip()
    if not draft.budget_hint:
        found = re.search(r"(\d[\d,]*\s*(?:만원|만 원|원|억))", message)
        if found:
            draft.budget_hint = found.group(1).strip()

    draft = _fill_missing(draft)

    if speaker in _SPEAKER_FALLBACK:
        return _SPEAKER_FALLBACK[speaker], draft

    if draft.missing:
        ask = draft.missing[0]
        reply = (
            "말씀 잘 들었어요. 도면을 그리려면 조금만 더 알려주세요 — "
            f"{ask}를 알려주시면 범위를 잡아볼게요."
        )
    else:
        lo, hi, wlo, whi, _ = _baseline_estimate(draft.site_type, draft.pages, draft.features)
        reply = (
            f"정리하면 {draft.site_type or '홈페이지'} 쪽이네요. "
            f"지금까지 들은 내용이면 대략 {lo // 10_000:,}만원~{hi // 10_000:,}만원, "
            f"{wlo}~{whi}주 정도로 봅니다. 다만 이건 참고 범위이고 확정 견적은 아니에요. "
            "이대로 접수해두시면 정재훈이 직접 확인하고 연락드릴게요."
        )

    return reply, draft


# ─────────────────────────── 심화 문답 (접수 뒤 2차) ───────────────────────────
#
# 1차와 같은 인물(도안)이지만 **목적이 다르다.** 1차는 "얼마짜리 일인지" 가늠해
# 접수까지 데려오는 것이고, 여기는 "재훈이 잘 만들 수 있게" 제작 정보를 받아내는 것이다.
# 이미 접수한 사람이라 문턱을 올려도 안전하다 — 그래서 여기서는 캐물어도 된다.

_DEPTH_SYSTEM_PROMPT = """너는 '의뢰 공방'의 접수원 NPC '도안'이다.
이 손님은 **이미 의뢰를 접수한 분**이다. 지금은 견적을 내는 자리가 아니라,
정재훈이 실제로 잘 만들 수 있도록 **제작에 필요한 것들을 마저 여쭙는 자리**다.

지켜야 할 것:
- 한국어로, 2~4문장으로 짧게 답한다. 마크다운 제목·굵게·코드블록은 쓰지 않는다.
- 접수해 주셔서 고맙다는 태도로, 이미 말씀하신 걸 다시 묻지 않는다.
- **한 번에 한 가지만 묻는다.** 아래 '아직 못 들은 것' 중 맨 위 하나를 고른다.
- 손님의 답이 막연하면(예: "잘 모르겠어요") 선택지를 두어 개 제시해 고르게 돕는다.
  이 손님은 대개 웹을 모르는 분이다. 전문용어를 쓰지 않는다.
- 다 여쭤봤으면 더 묻지 말고, 정재훈이 곧 연락드릴 거라고 안내하며 마무리한다.
- 금액·납기를 확정처럼 말하지 않는다.

반드시 아래 JSON 형식으로만 답한다:
{
  "reply": "손님에게 보여줄 답변",
  "who_updates": "만든 뒤 내용을 누가 고치는지",
  "content_owner": "사진·글·로고를 누가 준비하는지",
  "success_metric": "사이트가 생기면 뭐가 달라져야 하는지",
  "existing_assets": "이미 가진 도메인·기존 사이트·SNS",
  "dislikes": ["피하고 싶다고 말한 것"],
  "reference_notes": "참고 사이트의 어떤 점이 좋다고 했는지",
  "decision_maker": "최종 결정하는 사람",
  "pages": ["추가로 언급된 페이지"],
  "features": ["추가로 언급된 기능"],
  "planner_answers": {"q1": "그 질문에 손님이 준 답", "q2": "..."}
}

`planner_answers` 는 아래 '기획자가 추가로 여쭤보라고 한 것' 에 붙은 번호(q1, q2…)를 쓴다.
답을 받은 질문만 넣는다. 아직 안 물어본 질문은 넣지 않는다.

**아직 답을 못 들은 항목은 빈 문자열로 둔다. 지어내지 않는다.**
이 문서는 그대로 제작에 쓰이므로, 없는 답을 채우면 잘못 만들게 된다.

**이미 받은 항목도 빈 문자열로 둔다.** 손님이 앞서 한 말을 **정정**할 때만 새 값을 쓴다.
같은 내용을 다시 요약해서 보내면 앞서 받은 원문이 덮어써진다.

값을 적을 때는 **손님이 한 말을 줄이지 않는다.** "손님" 같은 한 단어가 아니라
"가격이 자주 바뀌어서 직접 고치고 싶어하심, 컴퓨터는 익숙하지 않음" 처럼
판단에 필요한 맥락을 그대로 남긴다. 이 값을 보고 무엇을 만들지 정하기 때문이다."""


async def consult_depth(
    message: str, history: list[str], previous: CommissionDraft
) -> tuple[str, bool, CommissionDraft]:
    """심화 문답 한 턴. (답변, AI 사용 여부, 갱신된 draft)

    1차와 마찬가지로 **AI가 죽어도 문답은 굴러가야 한다.** 실패하면 규칙 기반으로
    다음 질문을 그냥 읽어 준다 — 말투는 밋밋해도 항목은 끝까지 다 받는다.
    """
    if settings.openai_api_key:
        try:
            reply, draft = await _depth_with_openai(message, history, previous)
            return reply, True, _fill_missing(draft)
        except Exception:
            logger.warning("심화 문답 OpenAI 호출 실패 → 규칙 기반으로 진행", exc_info=True)

    reply, draft = _depth_without_ai(message, previous)
    return reply, False, _fill_missing(draft)


async def _depth_with_openai(
    message: str, history: list[str], previous: CommissionDraft
) -> tuple[str, CommissionDraft]:
    import httpx

    known_lines = [
        f"- {_DEPTH_LABELS[field]}: {_depth_value(previous, field)}"
        for field in _DEPTH_FIELDS
        if _depth_value(previous, field)
    ]
    remaining = [
        f"- {_DEPTH_LABELS[field]}: {_DEPTH_QUESTIONS[field]}"
        for field in _DEPTH_FIELDS
        if not _depth_value(previous, field)
    ]

    # 체리(기획)가 산출물을 만들며 "이건 손님에게 물어봐야 한다"고 남긴 것들.
    planner_lines = [
        f"- [{item.id}] {item.question}"
        for item in unanswered_planner_questions(previous)
    ]

    context_lines = [
        "접수된 의뢰 내용:",
        f"- 유형: {previous.site_type or '-'}",
        f"- 요약: {previous.summary or '-'}",
        f"- 페이지: {', '.join(previous.pages) or '-'}",
        f"- 기능: {', '.join(previous.features) or '-'}",
        "",
        "이미 받은 제작 정보:",
        *(known_lines or ["- (아직 없음)"]),
        "",
        "아직 못 들은 것 (위에서부터 하나씩):",
        *(remaining or ["- (없음)"]),
    ]

    if planner_lines:
        context_lines += [
            "",
            "기획자가 추가로 여쭤보라고 한 것 (위 항목을 다 받은 뒤에 묻는다):",
            *planner_lines,
        ]
    elif not remaining:
        context_lines.append("")
        context_lines.append("→ 더 물을 것이 없다. 감사 인사와 함께 마무리한다.")

    messages = [
        {"role": "system", "content": _DEPTH_SYSTEM_PROMPT + "\n\n" + "\n".join(context_lines)}
    ]
    if history:
        messages.append(
            {"role": "user", "content": "최근 대화:\n" + "\n".join(history[-10:])}
        )
    messages.append({"role": "user", "content": message})

    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_model,
                "messages": messages,
                "response_format": {"type": "json_object"},
                "temperature": 0.6,
                "max_tokens": 700,
            },
        )
        response.raise_for_status()
        raw = response.json()["choices"][0]["message"]["content"]

    data = json.loads(raw)
    reply = _clean(str(data.get("reply", "")).strip())
    if not reply:
        raise ValueError("빈 응답")

    draft = _draft_from_data(data, previous)
    return reply, _apply_planner_answers(draft, data.get("planner_answers"))


def _apply_planner_answers(draft: CommissionDraft, answers: Any) -> CommissionDraft:
    """모델이 돌려준 {질문id: 답} 을 대본에 채운다. 빈 답은 무시한다."""
    if not isinstance(answers, dict):
        return draft

    for item in draft.planner_questions:
        fresh = str(answers.get(item.id, "") or "").strip()
        if fresh and not _keeps_more(item.answer, fresh):
            item.answer = fresh
    return draft


def _depth_without_ai(message: str, previous: CommissionDraft) -> tuple[str, CommissionDraft]:
    """AI 없이도 문답이 끝까지 가게 하는 경로.

    직전에 물어본 항목에 지금 답을 준 것으로 보고 그 슬롯에 담은 뒤, 다음 질문을 읽어 준다.
    투박하지만 **항목이 빠짐없이 채워지는 것**이 이 화면의 목적이라 이걸로도 목적은 이룬다.
    """
    draft = previous.model_copy(deep=True)
    answer = message.strip()

    pending = [field for field in _DEPTH_FIELDS if not _depth_value(draft, field)]
    if pending and len(answer) > 1:
        field = pending[0]
        if field == "dislikes":
            draft.dislikes = [part.strip() for part in re.split(r"[,·/]", answer) if part.strip()]
        else:
            setattr(draft, field, answer[:400])
        pending = pending[1:]
    elif not pending and len(answer) > 1:
        # 고정 슬롯이 끝났으면 체리 질문 차례다.
        waiting = unanswered_planner_questions(draft)
        if waiting:
            waiting[0].answer = answer[:400]

    if pending:
        reply = _DEPTH_QUESTIONS[pending[0]]
    elif unanswered_planner_questions(draft):
        reply = unanswered_planner_questions(draft)[0].question
    else:
        reply = (
            "여기까지면 충분해요. 알려주신 내용은 그대로 작업에 반영됩니다. "
            "정재훈이 확인하고 남겨주신 이메일로 연락드릴게요. 고맙습니다."
        )
    return reply, draft


def draft_from_commission(commission: CommissionRequest) -> CommissionDraft:
    """저장된 접수 건에서 draft 를 복원한다.

    제작 슬롯은 `requirements` JSON 안에 산다 — 컬럼을 일곱 개 늘리는 대신
    이미 JSON 인 자리를 쓴다(마이그레이션 0). 조회·문답 양쪽이 이 함수를 쓴다.
    """
    requirements = dict(commission.requirements or {})

    draft = CommissionDraft(
        site_type=commission.site_type or "",
        summary=commission.summary or "",
        pages=_str_list(requirements.get("pages")),
        features=_str_list(requirements.get("features")),
        tone=str(requirements.get("tone", "") or ""),
        references=_str_list(requirements.get("references")),
        budget_hint=commission.budget_hint or "",
        deadline_hint=commission.deadline_hint or "",
        estimate_min=commission.estimate_min or 0,
        estimate_max=commission.estimate_max or 0,
        weeks_min=commission.weeks_min or 0,
        weeks_max=commission.weeks_max or 0,
        estimate_reason=commission.estimate_reason or "",
        who_updates=str(requirements.get("who_updates", "") or ""),
        content_owner=str(requirements.get("content_owner", "") or ""),
        success_metric=str(requirements.get("success_metric", "") or ""),
        existing_assets=str(requirements.get("existing_assets", "") or ""),
        dislikes=_str_list(requirements.get("dislikes")),
        reference_notes=str(requirements.get("reference_notes", "") or ""),
        decision_maker=str(requirements.get("decision_maker", "") or ""),
        planner_questions=[
            PlannerQuestion(
                id=str(item.get("id", "")),
                question=str(item.get("question", "")),
                answer=str(item.get("answer", "")),
            )
            for item in (commission.pending_questions or [])
            if str(item.get("question", "")).strip()
        ],
    )
    return _fill_missing(draft)


def store_depth_answers(
    db: Session, commission: CommissionRequest, draft: CommissionDraft
) -> CommissionRequest:
    """심화 문답에서 받은 제작 정보를 접수 건에 반영한다.

    **접수 원문(요약·유형·견적)은 건드리지 않는다.** 손님이 나중에 말을 보태는 자리이지
    이미 접수된 내용을 갈아엎는 자리가 아니고, 견적은 관리자가 본 그 값으로 남아야 한다.
    """
    requirements = dict(commission.requirements or {})

    for field in _DEPTH_FIELDS:
        value = getattr(draft, field)
        if isinstance(value, list):
            if value:
                requirements[field] = [str(item) for item in value]
        elif str(value or "").strip():
            requirements[field] = str(value).strip()

    # 문답 중에 페이지·기능이 더 나오면 누적한다(덮어쓰지 않는다).
    for key, fresh in (("pages", draft.pages), ("features", draft.features)):
        merged = list(dict.fromkeys([*_str_list(requirements.get(key)), *fresh]))
        if merged:
            requirements[key] = merged

    # 체리 질문지의 답도 같이 갈무리한다. 여기서도 빈 답은 기존 답을 덮지 않는다.
    if draft.planner_questions:
        by_id = {item.id: item.answer.strip() for item in draft.planner_questions}
        merged = []
        for item in commission.pending_questions or []:
            answer = str(item.get("answer", ""))
            fresh = by_id.get(str(item.get("id", "")), "")
            merged.append({**item, "answer": fresh or answer})
        commission.pending_questions = merged
        flag_modified(commission, "pending_questions")

    commission.requirements = requirements
    # SQLAlchemy 는 JSON 컬럼의 **제자리 변경**을 감지하지 못한다. 새 dict 를 대입하더라도
    # 확실히 하려고 명시적으로 표시해 둔다 — 이걸 빼면 답이 조용히 저장되지 않는다.
    flag_modified(commission, "requirements")
    db.commit()
    db.refresh(commission)
    return commission


# ─────────────────── 체리의 질문지 → 도안의 대본 (3단계) ───────────────────
#
# 체리는 산출물에 "확인 필요"를 적는다. 여태 그건 **문서에 적히고 끝났고**, 결국 내가
# 손님에게 다시 연락해서 물어야 했다 — 공방이 없애려던 왕복이 그대로 남았던 것이다.
#
# 여기서 그 목록을 손님에게 던질 질문으로 옮긴다. 새로 만들 지능은 없다.
# 체리는 이미 정확한 목록을 뽑아내고 있고, **목적지만 바꾸는 것**이다.

PLANNER_QUESTION_FILE = "01-기획/손님-확인-질문.md"

# 대본에 넣지 않는 줄 — 체리가 형식을 어기고 제목이나 설명을 끼워 넣었을 때 걸러낸다.
_QUESTION_MIN_LEN = 6


def parse_question_lines(text: str) -> list[str]:
    """질문지 markdown 에서 질문 줄만 뽑는다.

    체리에게 "한 줄에 하나, `- ` 로 시작" 을 시켰지만 **프롬프트는 방어선이 아니다.**
    제목·번호·빈 줄이 섞여 들어와도 깨지지 않게 여기서 한 번 더 거른다.
    """
    questions: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or line.startswith(">"):
            continue

        # "- ", "* ", "1. ", "1) " 를 모두 받아 준다
        stripped = re.sub(r"^\s*(?:[-*+]|\d+[.)])\s+", "", line)
        if stripped == line:
            # 목록 표시가 없는 줄은 설명 문단으로 보고 버린다 (물음표로 끝나면 살린다)
            if not line.endswith("?"):
                continue
            stripped = line

        stripped = stripped.strip("*_` ").strip()
        if len(stripped) < _QUESTION_MIN_LEN:
            continue
        if stripped not in questions:
            questions.append(stripped)

    return questions[:8]


def import_planner_questions(
    db: Session, commission: CommissionRequest, text: str
) -> list[dict]:
    """질문지 본문을 파싱해 대본으로 저장한다. **이미 받은 답은 지우지 않는다.**

    체리를 반려하고 다시 돌리면 질문이 조금 바뀐다. 그때 같은 질문에 이미 받아 둔
    답까지 날리면 손님에게 두 번 묻게 된다 — 질문 문장으로 짝을 지어 답을 옮겨 온다.
    """
    previous = {
        str(item.get("question", "")): str(item.get("answer", ""))
        for item in (commission.pending_questions or [])
    }

    questions = [
        {
            "id": f"q{index + 1}",
            "question": question,
            "answer": previous.get(question, ""),
        }
        for index, question in enumerate(parse_question_lines(text))
    ]

    commission.pending_questions = questions
    flag_modified(commission, "pending_questions")
    db.commit()
    db.refresh(commission)
    return questions


def unanswered_planner_questions(draft: CommissionDraft) -> list[Any]:
    return [item for item in draft.planner_questions if not item.answer.strip()]




# ─────────────────── 2층 릴레이 저장 + AI 맞춤 질문 (docs/ATELIER_DEPTH_SCRIPT.md) ───────────────────
#
# 릴레이 설문은 답 하나마다 저장을 부른다(창을 닫아도 남게). LLM 없는 순수 저장이라
# 리밋을 안 태우는 대신, 여기서 키 화이트리스트와 길이 상한으로 막는다.

_BRANCH_KEY_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_-]{0,23}$")
_DEPTH_ANSWER_MAX = 1200

# AI 맞춤 질문 — 개수·길이·화자는 전부 여기 규칙이 정한다. 모델은 후보만 낸다.
AI_QUESTIONS_CAP = 5
_AI_QUESTION_MAX_LEN = 120
_AI_SPEAKERS = ("intake", "planner", "designer", "frontend", "backend")


def save_depth_form(
    db: Session,
    commission: CommissionRequest,
    *,
    slots: dict[str, str] | None = None,
    branch: dict[str, str] | None = None,
    ai_answers: dict[str, str] | None = None,
    pages: list[str] | None = None,
    features: list[str] | None = None,
) -> CommissionRequest:
    """릴레이 설문의 답 하나를 접수 건에 반영한다.

    `store_depth_answers` 와 같은 원칙: 접수 원문(요약·유형·견적)은 건드리지 않고,
    빈 답은 기존 답을 덮지 않으며, pages/features 는 누적한다.
    """
    requirements = dict(commission.requirements or {})

    for field, value in (slots or {}).items():
        if field not in _DEPTH_FIELDS:
            continue  # 화이트리스트 밖은 조용히 버린다 — 공개 경로다
        text = str(value or "").strip()[:_DEPTH_ANSWER_MAX]
        if not text:
            continue
        if field == "dislikes":
            items = [part.strip() for part in re.split(r"[,\n]", text) if part.strip()]
            merged = list(dict.fromkeys([*_str_list(requirements.get(field)), *items]))
            requirements[field] = merged
        else:
            requirements[field] = text

    if branch:
        stored = dict(requirements.get("branch") or {})
        for key, value in branch.items():
            if not _BRANCH_KEY_RE.match(str(key)):
                continue
            text = str(value or "").strip()[:_DEPTH_ANSWER_MAX]
            if text:
                stored[str(key)] = text
        if stored:
            requirements["branch"] = stored

    if ai_answers:
        items = [dict(item) for item in (requirements.get("ai_questions") or [])]
        for item in items:
            fresh = str(ai_answers.get(str(item.get("id", "")), "") or "").strip()
            if fresh:  # 빈 답이 기존 답을 덮지 않는다
                item["answer"] = fresh[:_DEPTH_ANSWER_MAX]
        requirements["ai_questions"] = items

    for key, extra in (("pages", pages or []), ("features", features or [])):
        cleaned = [str(item).strip()[:80] for item in extra if str(item).strip()][:20]
        if cleaned:
            requirements[key] = list(
                dict.fromkeys([*_str_list(requirements.get(key)), *cleaned])
            )

    commission.requirements = requirements
    flag_modified(commission, "requirements")
    db.commit()
    db.refresh(commission)
    return commission


def _squash(text: str) -> str:
    return re.sub(r"\s+", "", text)


async def generate_ai_questions(
    db: Session, commission: CommissionRequest, asked: list[dict] | None = None
) -> tuple[list[dict], bool]:
    """이 의뢰만 보고 뽑은 맞춤 질문. (목록, 이번에 새로 생성했는가)

    고정 트리가 못 덮는 "신박한" 의뢰에서만 일하는 겹이다 — 전형적 의뢰면 0~2개가 정상.
    **한 번만 생성한다.** 이미 생성했으면(빈 목록이어도) 저장본을 그대로 돌려준다 —
    새로고침할 때마다 질문이 늘어나면 그게 곧 취조실이다.
    실패하면 조용히 0개로 완료 처리한다: 2층은 이미 완주 상태라 잃는 게 없다.
    """
    requirements = dict(commission.requirements or {})
    if requirements.get("ai_questions_done"):
        return list(requirements.get("ai_questions") or []), False

    asked = asked or []
    raw: list[dict] = []
    if settings.openai_api_key:
        try:
            raw = await _generate_ai_questions_openai(commission, asked)
        except Exception:
            logger.warning("AI 맞춤 질문 생성 실패 → 0개로 진행", exc_info=True)

    # 후처리 — 모델 출력은 여기 규칙이 다듬는다: 상한·길이·중복(이미 물은 것 포함)·화자.
    asked_keys = [_squash(str(item.get("question", ""))) for item in asked]
    asked_keys += [_squash(question) for question in _DEPTH_QUESTIONS.values()]
    cleaned: list[dict] = []
    seen: set[str] = set()
    for item in raw:
        text = _clean(str(item.get("question", "")).strip())[:_AI_QUESTION_MAX_LEN]
        if len(text) < 6:
            continue
        key = _squash(text)
        if key in seen:
            continue
        if any(key in prev or prev in key for prev in asked_keys if prev):
            continue
        seen.add(key)
        speaker = str(item.get("speaker", "") or "")
        if speaker not in _AI_SPEAKERS:
            speaker = "intake"
        cleaned.append(
            {
                "id": f"a{len(cleaned) + 1}",
                "question": text,
                "answer": "",
                "speaker": speaker,
            }
        )
        if len(cleaned) >= AI_QUESTIONS_CAP:
            break

    requirements["ai_questions"] = cleaned
    requirements["ai_questions_done"] = True
    commission.requirements = requirements
    flag_modified(commission, "requirements")
    db.commit()
    db.refresh(commission)
    return cleaned, True


_AI_QUESTIONS_PROMPT = """너는 홈페이지 제작 공방의 접수 검토자다. 아래는 한 손님의 의뢰 내용과,
이미 물어본 질문·답 전체다. **이 의뢰를 실제로 만들기 시작할 때 막히게 될, 아직 불명확한
지점**만 골라 손님에게 던질 추가 질문을 만든다.

규칙:
- 이미 답이 있는 것, 이미 물어본 것과 겹치는 질문은 절대 내지 않는다.
- 최대 {cap}개. **내용이 이미 명백하면 빈 배열을 돌려준다** — 억지로 채우지 않는다.
- 웹을 모르는 손님이 바로 답할 수 있는 쉬운 한국어 한 문장으로. 전문용어 금지. 120자 이내.
- 연락처·개인정보를 묻지 않는다. 견적·가격 흥정을 하지 않는다.
- speaker 는 그 질문과 가장 가까운 담당: planner(구조·내용), designer(생김새·자료),
  frontend(화면·기기), backend(데이터·연동·결제), 애매하면 intake.

반드시 아래 JSON 형식으로만 답한다:
{{"questions": [{{"question": "...", "speaker": "planner|designer|frontend|backend|intake"}}]}}"""


async def _generate_ai_questions_openai(
    commission: CommissionRequest, asked: list[dict]
) -> list[dict]:
    import httpx

    requirements = dict(commission.requirements or {})
    requirements.pop("ai_questions", None)
    requirements.pop("ai_questions_done", None)

    # 연락처는 requirements 에 없다(컬럼에 있다). 그래도 방어적으로 요약만 추린다.
    context = {
        "site_type": commission.site_type,
        "summary": commission.summary,
        "budget_hint": commission.budget_hint,
        "deadline_hint": commission.deadline_hint,
        "requirements": requirements,
    }
    lines = [
        "의뢰 내용(JSON):",
        json.dumps(context, ensure_ascii=False),
        "",
        "이미 물어본 질문과 답:",
        *(
            f"- Q: {item.get('question', '')} / A: {item.get('answer', '') or '(답 없음)'}"
            for item in asked[:40]
        ),
    ]

    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_model,
                "messages": [
                    {
                        "role": "system",
                        "content": _AI_QUESTIONS_PROMPT.format(cap=AI_QUESTIONS_CAP),
                    },
                    {"role": "user", "content": "\n".join(lines)},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.4,
                "max_tokens": 600,
            },
        )
        response.raise_for_status()
        data = json.loads(response.json()["choices"][0]["message"]["content"])

    items = data.get("questions")
    if not isinstance(items, list):
        return []
    return [item for item in items if isinstance(item, dict)]


def stored_ai_questions(commission: CommissionRequest) -> tuple[list[dict], bool]:
    requirements = commission.requirements or {}
    return (
        list(requirements.get("ai_questions") or []),
        bool(requirements.get("ai_questions_done")),
    )


def stored_branch_answers(commission: CommissionRequest) -> dict[str, str]:
    branch = (commission.requirements or {}).get("branch") or {}
    return {str(key): str(value) for key, value in branch.items()}


def ensure_access_token(db: Session, commission: CommissionRequest) -> str:
    """심화 문답 링크의 열쇠. 없으면(=이 기능 이전에 들어온 접수) 그 자리에서 발급한다."""
    if not (commission.access_token or "").strip():
        commission.access_token = uuid.uuid4().hex
        db.commit()
        db.refresh(commission)
    return commission.access_token


def get_by_token(db: Session, token: str) -> CommissionRequest | None:
    cleaned = (token or "").strip()
    if len(cleaned) < 16:
        # 짧은 값은 조회조차 하지 않는다 — 대입 시도에 DB 를 쓰게 두지 않는다.
        return None
    return (
        db.query(CommissionRequest)
        .filter(CommissionRequest.access_token == cleaned)
        .first()
    )


# ─────────────────────────── 접수 CRUD ───────────────────────────

def save_message(
    db: Session, session_id: str, role: str, content: str, used_ai: bool = False
) -> CommissionMessage:
    row = CommissionMessage(
        session_id=session_id.strip(),
        role=role,
        content=content,
        used_ai=used_ai,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def recent_messages(db: Session, session_id: str, limit: int = 20) -> list[CommissionMessage]:
    if not session_id.strip():
        return []
    rows = (
        db.query(CommissionMessage)
        .filter(CommissionMessage.session_id == session_id.strip())
        .order_by(desc(CommissionMessage.id))
        .limit(limit)
        .all()
    )
    return list(reversed(rows))


class CommissionRejected(Exception):
    """접수 거부(봇/동의 누락/형식 오류). 라우트가 400으로 변환한다."""


_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def create_commission(db: Session, payload: CommissionIn) -> CommissionRequest:
    """접수. 검증은 라우트가 아니라 여기서 한다 — 호출 경로가 늘어도 안 새도록."""
    # 허니팟: 사람에게는 보이지 않는 필드라 값이 있으면 봇이다. 조용히 거절한다.
    if payload.website.strip():
        raise CommissionRejected("접수를 처리할 수 없습니다.")

    if not payload.consent:
        raise CommissionRejected("연락처 수집 동의가 필요합니다.")

    email = payload.contact_email.strip()
    if not _EMAIL_RE.match(email):
        raise CommissionRejected("이메일 형식이 올바르지 않습니다.")

    if not payload.summary.strip() and not payload.requirements:
        raise CommissionRejected("어떤 사이트를 원하시는지 내용을 알려주세요.")

    commission = CommissionRequest(
        public_id=f"WO-{uuid.uuid4().hex[:8].upper()}",
        # 심화 문답으로 돌아오는 열쇠는 접수 순간에 만든다 — 접수 완료 화면이 바로 링크를 준다.
        access_token=uuid.uuid4().hex,
        session_id=payload.session_id.strip(),
        contact_name=payload.contact_name.strip(),
        contact_email=payload.contact_email.strip(),
        contact_phone=payload.contact_phone.strip(),
        org=payload.org.strip(),
        site_type=payload.site_type.strip(),
        summary=payload.summary.strip(),
        requirements=dict(payload.requirements),
        budget_hint=payload.budget_hint.strip(),
        deadline_hint=payload.deadline_hint.strip(),
        estimate_min=payload.estimate_min,
        estimate_max=payload.estimate_max,
        weeks_min=payload.weeks_min,
        weeks_max=payload.weeks_max,
        estimate_reason=payload.estimate_reason.strip(),
        status="received",
    )
    db.add(commission)
    db.commit()
    db.refresh(commission)

    # 이 세션의 상담 로그를 접수 건에 귀속시킨다
    if commission.session_id:
        db.query(CommissionMessage).filter(
            CommissionMessage.session_id == commission.session_id,
            CommissionMessage.commission_id.is_(None),
        ).update({"commission_id": commission.id}, synchronize_session=False)
        db.commit()

    return commission


def list_commissions(db: Session, limit: int = 100) -> list[CommissionRequest]:
    return (
        db.query(CommissionRequest)
        .order_by(desc(CommissionRequest.created_at))
        .limit(limit)
        .all()
    )


def get_commission(db: Session, commission_id: int) -> CommissionRequest | None:
    return db.get(CommissionRequest, commission_id)


def messages_for(db: Session, commission: CommissionRequest) -> list[CommissionMessage]:
    return (
        db.query(CommissionMessage)
        .filter(CommissionMessage.commission_id == commission.id)
        .order_by(CommissionMessage.id)
        .all()
    )


def update_status(
    db: Session, commission_id: int, status: str, admin_note: str
) -> CommissionRequest | None:
    commission = db.get(CommissionRequest, commission_id)
    if not commission:
        return None
    commission.status = status
    commission.admin_note = admin_note.strip()
    db.commit()
    db.refresh(commission)
    return commission


def delete_commission(db: Session, commission_id: int) -> bool:
    commission = db.get(CommissionRequest, commission_id)
    if not commission:
        return False
    db.query(CommissionMessage).filter(
        CommissionMessage.commission_id == commission.id
    ).delete(synchronize_session=False)
    # 3단계 작업·산출물 색인도 함께. 디스크의 workspace/ 는 남긴다 —
    # 접수 기록을 지운다고 만들어 둔 산출물까지 날리는 건 되돌릴 수 없어서 위험하다.
    db.query(CommissionArtifact).filter(
        CommissionArtifact.commission_id == commission.id
    ).delete(synchronize_session=False)
    db.query(CommissionTask).filter(
        CommissionTask.commission_id == commission.id
    ).delete(synchronize_session=False)
    db.delete(commission)
    db.commit()
    return True


# ─────────────────── 3단계: 직군별 작업 (게이트) ───────────────────
#
# 여기는 저장만 한다. "진행해도 되는가"의 판단은 전부 app/agents/gate.py 에 있다.

def tasks_for(db: Session, commission_id: int) -> list[CommissionTask]:
    rows = (
        db.query(CommissionTask)
        .filter(CommissionTask.commission_id == commission_id)
        .all()
    )
    order = {role: index for index, role in enumerate(gate.ALL_ROLES)}
    return sorted(rows, key=lambda row: order.get(row.role, 99))


def get_task(db: Session, task_id: int) -> CommissionTask | None:
    return db.get(CommissionTask, task_id)


def artifacts_for(db: Session, commission_id: int) -> list[CommissionArtifact]:
    return (
        db.query(CommissionArtifact)
        .filter(CommissionArtifact.commission_id == commission_id)
        .order_by(CommissionArtifact.rel_path)
        .all()
    )


def get_artifact(db: Session, artifact_id: int) -> CommissionArtifact | None:
    return db.get(CommissionArtifact, artifact_id)


# ─────────────────── 시안 공개 (4단계) ───────────────────
#
# 시안을 납품물이 아니라 **미끼**로 쓴다. 추상적인 질문 열 개보다 구체적으로 틀린
# 시안 한 장이 정보를 훨씬 많이 뽑아낸다 — "이거 보시고 어디가 아닌지 말씀해 주세요"
# 는 사람이 대답을 정말 잘하는 질문 형태다.
#
# 그래서 여기 공개된 시안은 히어로+갤러리만 있어도 결함이 아니다. 오히려 적당한 미끼다.


def set_artifact_shared(
    db: Session,
    commission: CommissionRequest,
    artifact: CommissionArtifact,
    shared: bool,
) -> CommissionArtifact:
    """산출물 하나를 손님에게 공개/비공개한다.

    **한 번에 하나만 공개된다.** 손님에게 파일 목록을 늘어놓는 자리가 아니라
    반응 하나를 받아내는 자리라서, 여러 개를 띄우면 초점이 흩어진다.
    """
    if shared:
        db.query(CommissionArtifact).filter(
            CommissionArtifact.commission_id == commission.id,
            CommissionArtifact.id != artifact.id,
        ).update({"shared": False}, synchronize_session=False)

    artifact.shared = shared
    db.commit()
    db.refresh(artifact)
    return artifact


def shared_artifact_for(
    db: Session, commission_id: int
) -> tuple[CommissionArtifact, str] | None:
    """공개된 산출물과 그 본문. 파일이 사라졌으면 None(색인만 남은 경우)."""
    from app.agents import workspace as ws

    artifact = (
        db.query(CommissionArtifact)
        .filter(
            CommissionArtifact.commission_id == commission_id,
            CommissionArtifact.shared.is_(True),
        )
        .first()
    )
    if not artifact:
        return None

    commission = db.get(CommissionRequest, commission_id)
    if not commission:
        return None

    content = ws.read_artifact(ws.workspace_for(commission.public_id), artifact.rel_path)
    if content is None:
        return None
    return artifact, content


def _team_task_statuses(db: Session, commission_id: int) -> dict[str, str]:
    return {row.role: row.status for row in tasks_for(db, commission_id)}


def apply_gate_decision(
    db: Session, commission: CommissionRequest, gate_number: int, decision: str, feedback: str
) -> CommissionRequest:
    """관리자의 승인/반려를 저장한다. 규칙 위반이면 gate.GateViolation 이 올라온다."""
    effect = gate.apply_gate(gate_number, commission.status, decision)

    existing = {row.role: row for row in tasks_for(db, commission.id)}

    # 새로 열리는 작업 — 없으면 만들고, 있으면 다시 실행 대기로 돌린다
    for role in effect.create_roles:
        task = existing.get(role)
        if task is None:
            task = CommissionTask(commission_id=commission.id, role=role, status="ready")
            db.add(task)
            existing[role] = task
        else:
            task.status = "ready"

    # 반려 — 무엇이 아쉬웠는지를 안고 다시 대기열로. 이 feedback 이 다음 실행 프롬프트에 들어간다.
    for role in effect.reset_roles:
        task = existing.get(role)
        if task is None:
            continue
        task.status = "ready"
        task.round = task.round + 1
        task.feedback = feedback.strip()
        task.error = ""

    for role in effect.approve_roles:
        task = existing.get(role)
        if task is not None:
            task.status = "approved"

    commission.status = effect.commission_status
    if feedback.strip() and decision == "reject":
        commission.admin_note = feedback.strip()

    db.commit()

    # 게이트2 통과 = 기획 문서를 팀에게 넘기는 순간. 브리프를 태스크에 박아 둔다.
    if gate_number == 2 and decision == "approve":
        _handoff_brief(db, commission)

    db.refresh(commission)
    return commission


def _handoff_brief(db: Session, commission: CommissionRequest) -> None:
    """기획 산출물을 팀 3직군의 brief 에 복사한다.

    실행 시점에 파일을 다시 읽지 않고 여기서 굳히는 이유: 승인한 그 내용으로
    작업이 돌아야 하기 때문이다. 승인 뒤에 기획 파일이 바뀌어도 팀이 받은
    지시는 관리자가 승인한 그 버전으로 남는다.
    """
    from app.agents import workspace as ws

    root = ws.workspace_for(commission.public_id)
    planner_dir = gate.ROLE_DIRS[gate.PLANNER]

    chunks: list[str] = []
    for rel_path, kind, _size in ws.collect_artifacts(root):
        if not rel_path.startswith(f"{planner_dir}/") or kind != "markdown":
            continue
        body = ws.read_artifact(root, rel_path)
        if body:
            chunks.append(f"## {rel_path}\n\n{body}")

    brief = "\n\n---\n\n".join(chunks).strip()
    if not brief:
        return

    for task in tasks_for(db, commission.id):
        if task.role in gate.TEAM_ROLES:
            task.brief = brief[:20000]
    db.commit()


def worklog_lines(db: Session, role: str, limit: int = 4) -> list[str]:
    """이 직군이 지금 뭘 하고 있는지 — 공방 NPC 대화에 넣을 요약.

    마을에서 굴뚝에게 말을 걸면 "지금 WO-… API 명세 잡고 있어요" 라고 답하게 하는
    재료다. 손님의 개인정보는 절대 넣지 않는다 — NPC 대화는 아무나 볼 수 있다.
    """
    rows = (
        db.query(CommissionTask, CommissionRequest)
        .join(CommissionRequest, CommissionRequest.id == CommissionTask.commission_id)
        .filter(CommissionTask.role == role)
        .order_by(desc(CommissionTask.updated_at))
        .limit(limit)
        .all()
    )

    labels = {
        "ready": "곧 시작할 참",
        "running": "지금 작업 중",
        "review": "정재훈의 검수를 기다리는 중",
        "approved": "검수를 통과함",
        "rejected": "다시 손보는 중",
        "failed": "실패해서 다시 해야 함",
    }

    lines: list[str] = []
    for task, commission in rows:
        state = labels.get(task.status, task.status)
        what = commission.site_type or "홈페이지"
        retry = f" ({task.round}회차)" if task.round > 1 else ""
        lines.append(f"- {commission.public_id} {what} 건: {state}{retry}")
    return lines


def reject_task(db: Session, task: CommissionTask, feedback: str) -> CommissionTask:
    """개별 직군만 다시 돌린다(게이트3에서 셋 다 반려하는 것과 별개)."""
    if task.status not in ("review", "failed", "approved"):
        raise gate.GateViolation(f"반려할 수 있는 상태가 아닙니다: {task.status}")
    task.status = "ready"
    task.round = task.round + 1
    task.feedback = feedback.strip()
    task.error = ""

    commission = db.get(CommissionRequest, task.commission_id)
    if commission and commission.status == "artifact_review":
        # 하나라도 다시 도는 중이면 산출물 검수 상태가 아니다
        commission.status = "in_progress"

    db.commit()
    db.refresh(task)
    return task


def sync_artifacts(db: Session, commission: CommissionRequest, task: CommissionTask) -> None:
    """작업 공간을 훑어 산출물 색인을 이 태스크 기준으로 갱신한다."""
    from app.agents import workspace as ws

    root = ws.workspace_for(commission.public_id)
    role_dir = gate.ROLE_DIRS.get(task.role, "")
    found = ws.collect_artifacts(root)

    existing = {
        row.rel_path: row
        for row in db.query(CommissionArtifact)
        .filter(CommissionArtifact.commission_id == commission.id)
        .all()
    }

    seen: set[str] = set()
    for rel_path, kind, size in found:
        seen.add(rel_path)
        row = existing.get(rel_path)
        if row is None:
            db.add(
                CommissionArtifact(
                    commission_id=commission.id,
                    task_id=task.id,
                    rel_path=rel_path,
                    kind=kind,
                    size_bytes=size,
                )
            )
            continue
        row.kind = kind
        row.size_bytes = size
        # 이번에 돈 직군의 폴더에 있는 파일만 소유자를 이 태스크로 옮긴다.
        # 남의 폴더 파일까지 가져오면 검수 화면에서 누가 만든 건지 뒤섞인다.
        if role_dir and rel_path.startswith(f"{role_dir}/"):
            row.task_id = task.id

    for rel_path, row in existing.items():
        if rel_path not in seen:
            db.delete(row)

    db.commit()


# ─────────────────────────── 접수 알림 ───────────────────────────

async def notify_discord(commission: CommissionRequest) -> bool:
    """새 접수를 디스코드로 알린다. 실패해도 접수 자체는 성공으로 둔다."""
    if not settings.discord_webhook_url.strip():
        return False

    import httpx

    def money(value: int) -> str:
        return f"{value // 10_000:,}만원" if value else "-"

    fields = [
        {"name": "접수번호", "value": commission.public_id, "inline": True},
        {"name": "유형", "value": commission.site_type or "-", "inline": True},
        {
            "name": "참고 견적",
            "value": f"{money(commission.estimate_min)} ~ {money(commission.estimate_max)}",
            "inline": True,
        },
        {
            "name": "연락처",
            "value": f"{commission.contact_name or '이름 미기재'} / {commission.contact_email}"
            + (f" / {commission.contact_phone}" if commission.contact_phone else ""),
            "inline": False,
        },
        {"name": "요청 내용", "value": (commission.summary or "-")[:1000], "inline": False},
    ]

    # 심화 문답 링크. 손님에게 이걸 보내면 제작에 필요한 나머지(운영 주체·콘텐츠 준비·
    # 성공 기준·기존 자산)를 도안이 대신 받아 준다. 알림에 넣어 두면 바로 복사해 쓸 수 있다.
    if commission.access_token:
        base = settings.frontend_origin.strip().rstrip("/")
        fields.append(
            {
                "name": "손님에게 보낼 심화 문답 링크",
                "value": f"{base}/commission/{commission.access_token}",
                "inline": False,
            }
        )
    if commission.deadline_hint or commission.budget_hint:
        fields.append(
            {
                "name": "일정 / 예산",
                "value": f"{commission.deadline_hint or '-'} / {commission.budget_hint or '-'}",
                "inline": False,
            }
        )

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                settings.discord_webhook_url.strip(),
                json={
                    "content": "🛠️ 의뢰 공방에 새 접수가 들어왔습니다.",
                    "embeds": [
                        {
                            "title": f"[{commission.public_id}] {commission.site_type or '홈페이지'} 제작 의뢰",
                            "color": 0xFF9D38,  # 마을 랜턴색
                            "fields": fields,
                            "footer": {"text": ESTIMATE_DISCLAIMER[:120]},
                        }
                    ],
                },
            )
            response.raise_for_status()
        return True
    except Exception:
        return False


# ─────────────────────────── 유틸 ───────────────────────────

def _str_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()][:20]


def _int(value: Any) -> int:
    try:
        return max(0, int(float(value)))
    except (TypeError, ValueError):
        return 0


def _clean(text: str) -> str:
    cleaned = text.replace("**", "").replace("__", "")
    cleaned = re.sub(r"^#{1,6}\s*", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()
