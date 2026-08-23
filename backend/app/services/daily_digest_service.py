"""하루 요약(📰) — 어제 마을에서 가장 크게 움직인 관계 하나 + 사건 하나를 한 줄로.

자정 타이머 없이 GET /npc/news 가 `ensure_today_digest` 를 부른다: 오늘 📰 가 없고 어제 소식이 있으면
한 번 만든다. 문장은 템플릿이 기본이고, OPENAI_API_KEY 가 있으면 모델이 한 줄(≤60자)로 다듬는다 —
하루 한 번이라 비용은 무시할 수준. 실패하면 템플릿 그대로.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.config import settings
from app.models import VillageEvent
from app.services import memory_service
from app.services.relationship_rules import josa
from app.time_utils import today_local

DIGEST_EMOJI = "📰"


def _local_date(value: datetime) -> date:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(ZoneInfo(settings.local_timezone)).date()


def compose_digest(events: list[VillageEvent]) -> str:
    """순수 함수 — 어제 소식 목록에서 요약 한 줄을 만든다. 소식이 없으면 빈 문자열."""
    pair_sum: dict[tuple[str, str], int] = {}
    incident: VillageEvent | None = None
    milestones = 0
    for e in events:
        if e.emoji == DIGEST_EMOJI:
            continue
        if e.npc_a and e.npc_b:
            key = tuple(sorted((e.npc_a, e.npc_b)))
            pair_sum[key] = pair_sum.get(key, 0) + e.delta
        if "!" in e.text:
            milestones += 1
        if incident is None and e.emoji in ("💢", "💚", "💞", "💔", "🤝") and "·" in e.text:
            incident = e
    if not pair_sum and incident is None:
        return ""
    parts: list[str] = []
    if pair_sum:
        (a, b), total = max(pair_sum.items(), key=lambda kv: abs(kv[1]))
        na, nb = memory_service.display_name(a), memory_service.display_name(b)
        if total > 0:
            parts.append(f"어제는 {na}{josa(na, '와')} {nb}{josa(nb, '가')} 부쩍 가까워졌다({total:+d})")
        elif total < 0:
            parts.append(f"어제는 {na}{josa(na, '와')} {nb} 사이가 제일 삐걱였다({total:+d})")
        else:
            parts.append(f"어제는 {na}{josa(na, '와')} {nb}{josa(nb, '가')} 가장 자주 엮였다")
    if incident is not None:
        # "A ↔ B · 이유 — 모델 한 줄" 에서 이유만
        body = incident.text.split("·", 1)[1].split("—", 1)[0].strip() if "·" in incident.text else incident.text
        parts.append(f"사건 하나: {body[:50]}")
    if milestones:
        parts.append(f"큰 사건 {milestones}건")
    return " · ".join(parts)[:240]


async def _polish(text: str) -> str:
    if not settings.openai_api_key or not text:
        return text
    try:
        import httpx

        async with httpx.AsyncClient(timeout=12) as client:
            res = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"},
                json={
                    "model": settings.openai_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "마을 신문 한 줄 기사 편집자. 주어진 사실만으로 한국어 60자 이내 한 문장. 이름·숫자를 바꾸지 말 것. 따옴표·제목 없이.",
                        },
                        {"role": "user", "content": text},
                    ],
                    "temperature": 0.6,
                    "max_tokens": 120,
                },
            )
            res.raise_for_status()
            line = str(res.json()["choices"][0]["message"]["content"]).strip().strip('"')
            return line[:120] if line else text
    except Exception:
        return text


async def ensure_today_digest(db: Session) -> VillageEvent | None:
    """오늘 📰 가 없고 어제 소식이 있으면 만든다. 만든 행(또는 None)을 돌려준다."""
    today = today_local()
    recent = db.query(VillageEvent).order_by(VillageEvent.id.desc()).limit(300).all()
    if any(e.emoji == DIGEST_EMOJI and e.created_at is not None and _local_date(e.created_at) == today for e in recent):
        return None
    yesterday = today - timedelta(days=1)
    pool = [e for e in recent if e.created_at is not None and _local_date(e.created_at) == yesterday]
    text = compose_digest(pool)
    if not text:
        return None
    text = await _polish(text)
    row = VillageEvent(emoji=DIGEST_EMOJI, text=text[:240], npc_a="", npc_b="", delta=0)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
