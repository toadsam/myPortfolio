"""NPC 개인 기억 — 마주침·사건·뒷담화·방문자 대화를 NPC 별로 쌓는다.

전에는 마을 전체가 문자열 6개(프런트 `npcMemoryRef`)를 공유했고 새로고침이면
사라졌다. 그러면 "어제 네가 한 말", "C 가 너 얘기하더라" 같은 서사가 생길 수 없다.

여기 쌓인 것은 두 군데로 간다:
  · 프롬프트 — `memory_lines_for_prompt` 가 "내 최근 기억 / 상대에 대해 아는 것"을 만든다.
  · 뒷담화 — 만남 때 `gossip` 이 제3자 이야기를 상대 기억에 심는다.
NPC 당 MAX_PER_NPC 개만 남긴다.
"""

from __future__ import annotations

import random

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.catalog import NPCS, PROJECTS
from app.models import NpcMemory
from app.relations import canon

MAX_PER_NPC = 30
GOSSIP_CHANCE = 0.5

_KIND_NAMES = {
    "guide": "안내원",
    "project": "프로젝트 안내원",
    "developer": "기술 안내원",
    "archivist": "기록 안내원",
    "contact": "연락 안내원",
    "coding": "알고",
    "cs": "노바",
    "overseer": "정재훈",
    "intake": "도안",
    "planner": "체리",
    "designer": "먹지",
    "fe": "리코",
    "be": "굴뚝",
}


def display_name(npc_id: str) -> str:
    """npc_id → 사람이 읽는 이름. npc_brain_service._npc_profile 과 같은 결이되, 순환 import 를 피해 여기 둔다."""
    if npc_id in NPCS:
        return str(NPCS[npc_id].get("name") or npc_id)
    hint = npc_id.replace("npc-", "")
    for project_id, project in PROJECTS.items():
        if project_id in hint or str(project["building_id"]) in hint:
            return f"{project['title']} 안내원"
    kind = canon(npc_id)
    if kind == "coding":
        return str(NPCS["coding-test-npc"]["name"])
    if kind == "cs":
        return str(NPCS["cs-npc"]["name"])
    if "life" in hint:
        return str(NPCS["life-npc"]["name"])
    return _KIND_NAMES.get(kind, npc_id)


def remember(db: Session, npc_id: str, text: str, *, about: str = "", kind: str = "encounter") -> NpcMemory:
    text = text.strip()[:240]
    row = NpcMemory(npc_id=npc_id, about_npc_id=about or "", kind=kind, text=text)
    db.add(row)
    db.flush()
    _trim(db, npc_id)
    db.commit()
    db.refresh(row)
    return row


def _trim(db: Session, npc_id: str) -> None:
    rows = (
        db.query(NpcMemory)
        .filter(NpcMemory.npc_id == npc_id)
        .order_by(NpcMemory.created_at.desc(), NpcMemory.id.desc())
        .all()
    )
    for stale in rows[MAX_PER_NPC:]:
        db.delete(stale)


def recent(db: Session, npc_id: str, limit: int = 5) -> list[str]:
    rows = (
        db.query(NpcMemory)
        .filter(NpcMemory.npc_id == npc_id)
        .order_by(NpcMemory.created_at.desc(), NpcMemory.id.desc())
        .limit(limit)
        .all()
    )
    return [r.text for r in rows]


def about(db: Session, npc_id: str, other_id: str, limit: int = 2) -> list[str]:
    rows = (
        db.query(NpcMemory)
        .filter(and_(NpcMemory.npc_id == npc_id, NpcMemory.about_npc_id == other_id))
        .order_by(NpcMemory.created_at.desc(), NpcMemory.id.desc())
        .limit(limit)
        .all()
    )
    return [r.text for r in rows]


def gossip(db: Session, teller: str, listener: str, rng: random.Random | None = None) -> NpcMemory | None:
    """teller 가 최근 겪은 제3자(C) 이야기를 listener 의 기억에 심는다.

    listener 자신에 관한 기억은 옮기지 않는다 — 본인 앞에서 본인 얘기를 전하는 건
    뒷담화가 아니라 그냥 대화고, 그건 relationship history 가 이미 갖고 있다.
    """
    rng = rng or random.Random()
    if rng.random() >= GOSSIP_CHANCE:
        return None
    source = (
        db.query(NpcMemory)
        .filter(
            and_(
                NpcMemory.npc_id == teller,
                NpcMemory.kind.in_(["encounter", "incident"]),
                NpcMemory.about_npc_id != "",
                NpcMemory.about_npc_id != listener,
            )
        )
        .order_by(NpcMemory.created_at.desc(), NpcMemory.id.desc())
        .first()
    )
    if source is None:
        return None
    text = f"{display_name(teller)}에게 들음: {source.text}"
    return remember(db, listener, text, about=source.about_npc_id, kind="gossip")


def memory_lines_for_prompt(db: Session, npc_id: str, other_id: str | None = None) -> list[str]:
    lines = [f"- {t}" for t in recent(db, npc_id)]
    if not lines:
        lines = ["- (아직 특별히 기억나는 일이 없다)"]
    out = ["내 최근 기억(제공된 것만 근거로 말한다):", *lines]
    if other_id:
        known = about(db, npc_id, other_id)
        if known:
            out.append(f"{display_name(other_id)}에 대해 내가 아는 것:")
            out.extend(f"- {t}" for t in known)
    return out
