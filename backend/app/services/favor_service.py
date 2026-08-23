"""NPC 의 부탁(퀘스트) — NPC 가 먼저 방문자에게 다리를 놓아 달라고 한다.

발급: /npc/chat 끝에서 `maybe_issue` — 말 건 NPC 에게 서먹한 상대(≤ SOUR_AFFINITY)가 있고 미완료 부탁이
없으면 ISSUE_CHANCE 확률로 하나 만든다. 이행: relay_service 가 `fulfill_if_matches` 를 부른다 —
방문자가 *그 상대* 에게 *부탁한 NPC* 얘기를 긍정으로 전하면 완료. 보상은 평소 relay(+2) 대신 +4.
"""

from __future__ import annotations

import random
from datetime import datetime, timezone

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models import NpcFavor
from app.services import memory_service
from app.services.relationship_rules import SOUR_AFFINITY, josa
from app.services.relationship_service import list_all

ISSUE_CHANCE = 0.2
FAVOR_REWARD = 4


def pending_for(db: Session, npc_id: str) -> NpcFavor | None:
    return (
        db.query(NpcFavor)
        .filter(and_(NpcFavor.npc_id == npc_id, NpcFavor.fulfilled_at.is_(None)))
        .order_by(NpcFavor.id.desc())
        .first()
    )


def list_pending(db: Session, limit: int = 5) -> list[NpcFavor]:
    return db.query(NpcFavor).filter(NpcFavor.fulfilled_at.is_(None)).order_by(NpcFavor.id.desc()).limit(limit).all()


def favor_text(npc_id: str, about_id: str, affinity: int) -> str:
    about = memory_service.display_name(about_id)
    if affinity <= -25:  # 앙숙은 직접 사과까진 못 간다 — 간접
        return f"{about}{josa(about, '가')} 요즘 어떻게 지내는지 슬쩍 물어봐 줄래?"
    return f"{about}한테 내가 미안해한다고 전해 줄래?"


def maybe_issue(db: Session, npc_id: str, rng: random.Random | None = None) -> NpcFavor | None:
    """조건이 맞으면 부탁을 하나 만든다. 아니면 None."""
    rng = rng or random.Random()
    if pending_for(db, npc_id) is not None:
        return None
    sour = [
        r for r in list_all(db) if (r.npc_a == npc_id or r.npc_b == npc_id) and r.affinity <= SOUR_AFFINITY
    ]
    if not sour:
        return None
    if rng.random() >= ISSUE_CHANCE:
        return None
    rel = min(sour, key=lambda r: r.affinity)
    about = rel.npc_b if rel.npc_a == npc_id else rel.npc_a
    favor = NpcFavor(npc_id=npc_id, about_npc_id=about, text=favor_text(npc_id, about, rel.affinity))
    db.add(favor)
    db.commit()
    db.refresh(favor)
    return favor


def fulfill_if_matches(db: Session, speaker_id: str, about_id: str, delta: int) -> NpcFavor | None:
    """방문자가 speaker(=부탁의 about) 에게 about(=부탁한 NPC) 얘기를 긍정으로 전했으면 이행."""
    if delta <= 0:
        return None
    favor = (
        db.query(NpcFavor)
        .filter(and_(NpcFavor.npc_id == about_id, NpcFavor.about_npc_id == speaker_id, NpcFavor.fulfilled_at.is_(None)))
        .order_by(NpcFavor.id.desc())
        .first()
    )
    if favor is None:
        return None
    favor.fulfilled_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(favor)
    return favor
