"""방문자 단골 시스템 (5단계 E-9) — 익명 visitor_id 와 NPC 사이의 호감 점수.

bump: 대화 한 번마다 visits +1, score 는 하루 NPC 당 DAILY_CAP 까지만 +1.
favor_bonus: 부탁 이행 시 +4 (상한 무시 — 행동으로 얻은 점수).
등급 문턱은 level() 한 곳에만 둔다.
"""

from __future__ import annotations

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models import VisitorBond
from app.time_utils import today_local

DAILY_CAP = 2
FAVOR_BONUS = 4
REGULAR_AT = 20
FAMILIAR_AT = 8


def level(score: int) -> str:
    if score >= REGULAR_AT:
        return "단골 손님"
    if score >= FAMILIAR_AT:
        return "아는 손님"
    return "처음 온 손님"


def _get_or_create(db: Session, visitor_id: str, npc_id: str) -> VisitorBond:
    row = (
        db.query(VisitorBond)
        .filter(and_(VisitorBond.visitor_id == visitor_id, VisitorBond.npc_id == npc_id))
        .first()
    )
    if row is None:
        row = VisitorBond(visitor_id=visitor_id, npc_id=npc_id, score=0, visits=0, last_day="", gained_today=0)
        db.add(row)
        db.flush()
    return row


def bump(db: Session, visitor_id: str, npc_id: str) -> VisitorBond | None:
    """대화 한 번. visitor_id 없으면 None."""
    visitor_id = visitor_id.strip()[:64]
    if not visitor_id:
        return None
    row = _get_or_create(db, visitor_id, npc_id)
    today = today_local().isoformat()
    if row.last_day != today:
        row.last_day = today
        row.gained_today = 0
    row.visits += 1
    if row.gained_today < DAILY_CAP:
        row.score += 1
        row.gained_today += 1
    db.commit()
    db.refresh(row)
    return row


def favor_bonus(db: Session, visitor_id: str, npc_id: str) -> VisitorBond | None:
    """부탁 이행 보상 — 부탁했던 NPC 가 방문자를 더 좋아하게 된다."""
    visitor_id = visitor_id.strip()[:64]
    if not visitor_id:
        return None
    row = _get_or_create(db, visitor_id, npc_id)
    row.score += FAVOR_BONUS
    db.commit()
    db.refresh(row)
    return row


def prompt_line(row: VisitorBond | None) -> str:
    """visitor_history 앞에 붙일 한 줄. 처음 온 손님이면 빈 문자열(있는 척하지 않는다)."""
    if row is None or row.score < FAMILIAR_AT:
        return ""
    return f"이 방문자는 {level(row.score)}(호감 {row.score})이다. 단골답게 티 나게 반긴다."
