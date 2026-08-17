"""의뢰 공방 — 홈페이지 제작 의뢰 상담·견적·접수.

마을에서 유일하게 **외부인이 데이터를 쓰는** 경로다. 그래서 다른 서비스와 다른 원칙이 셋 있다:

1. 견적은 절대 확정값이 아니다. AI가 부른 금액은 `_baseline_estimate()` 규칙 범위를
   벗어나지 못하게 clamp 한다 — 모델이 0원이나 1억을 부르는 사고를 구조적으로 막는다.
2. AI가 죽어도 접수는 살아야 한다. OpenAI 실패 시 규칙 기반 상담으로 조용히 내려간다.
3. 접수되면 반드시 나에게 알린다(디스코드). admin 페이지를 안 열어도 새 의뢰를 놓치지 않게.

3단계(직군별 에이전트 제작)에서는 이 파일의 `get_commission()` 이 만든 행을 부모로
CommissionTask/CommissionArtifact 가 붙는다. 지금은 접수까지만 한다.
"""

import json
import re
import uuid
from typing import Any

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.config import settings
from app.models import CommissionMessage, CommissionRequest
from app.schemas import (
    ESTIMATE_DISCLAIMER,
    CommissionDraft,
    CommissionIn,
)


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
    extra_pages = max(0, len(pages) - 5)
    if extra_pages:
        lo += extra_pages * 150_000
        hi += extra_pages * 300_000
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
    return draft


async def consult(
    message: str, history: list[str], previous: CommissionDraft | None = None
) -> tuple[str, bool, CommissionDraft]:
    """접수원 NPC 한 턴. (답변, AI 사용 여부, 갱신된 draft)"""
    if settings.openai_api_key:
        try:
            reply, draft = await _consult_with_openai(message, history, previous)
            return reply, True, _fill_missing(_clamp_estimate(draft))
        except Exception:
            pass

    reply, draft = _consult_without_ai(message, history, previous)
    return reply, False, _fill_missing(_clamp_estimate(draft))


_SYSTEM_PROMPT = """너는 정재훈의 3D 포트폴리오 마을 지하에 있는 '의뢰 공방'의 접수원 NPC '도안'이다.
홈페이지 제작을 의뢰하러 온 방문자와 대화하며 요구사항을 파악하고 참고 견적을 안내한다.

지켜야 할 것:
- 한국어로, 3~5문장으로 짧게 답한다. 마크다운 제목·굵게·코드블록은 쓰지 않는다.
- 한 번에 질문은 최대 2개까지만. 취조하듯 몰아붙이지 않는다.
- 아직 못 들은 항목이 있으면 그중 가장 중요한 것부터 자연스럽게 묻는다.
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
  "estimate_reason": "그 범위가 나온 근거 한 줄"
}

pages/features/references 는 이전 대화에서 이미 파악된 것을 **누적해서** 모두 담는다.
summary 는 아직 질문이 남았더라도 **지금까지 들은 내용으로 항상 채운다** — 손님이 한 문장으로
정리해 말해주지 않았어도, 대화에서 파악한 대로 네가 요약해 넣는다. 비워 두지 않는다."""


async def _consult_with_openai(
    message: str, history: list[str], previous: CommissionDraft | None
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
                    {"role": "system", "content": _SYSTEM_PROMPT + "\n\n" + "\n".join(context_lines)},
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

    draft = CommissionDraft(
        site_type=str(data.get("site_type", "") or ""),
        summary=str(data.get("summary", "") or ""),
        pages=_str_list(data.get("pages")),
        features=_str_list(data.get("features")),
        tone=str(data.get("tone", "") or ""),
        references=_str_list(data.get("references")),
        budget_hint=str(data.get("budget_hint", "") or ""),
        deadline_hint=str(data.get("deadline_hint", "") or ""),
        estimate_min=_int(data.get("estimate_min")),
        estimate_max=_int(data.get("estimate_max")),
        weeks_min=_int(data.get("weeks_min")),
        weeks_max=_int(data.get("weeks_max")),
        estimate_reason=str(data.get("estimate_reason", "") or ""),
    )
    return reply, draft


def _consult_without_ai(
    message: str, history: list[str], previous: CommissionDraft | None
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
    db.delete(commission)
    db.commit()
    return True


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
