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
# 방문자 대화 기억은 별도 통 — 사회 기억이 아무리 쌓여도 밀려나지 않는다 (5단계 D-1)
MAX_VISITOR_PER_NPC = 12
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


def remember(
    db: Session,
    npc_id: str,
    text: str,
    *,
    about: str = "",
    kind: str = "encounter",
    delta: int = 0,
) -> NpcMemory:
    text = text.strip()[:240]
    row = NpcMemory(npc_id=npc_id, about_npc_id=about or "", kind=kind, text=text, delta=int(delta))
    db.add(row)
    db.flush()
    _trim(db, npc_id)
    db.commit()
    db.refresh(row)
    return row


def _trim(db: Session, npc_id: str) -> None:
    """kind 별 2단 캡. visitor 기억을 사회 기억(마주침·사건·뒷담화, 1~2분마다 생김)과
    같은 통에 두면 하루도 못 버티고 밀려나 "다시 온 손님"을 못 알아본다 — 통을 나눈다."""
    rows = (
        db.query(NpcMemory)
        .filter(NpcMemory.npc_id == npc_id)
        .order_by(NpcMemory.created_at.desc(), NpcMemory.id.desc())
        .all()
    )
    social = [r for r in rows if r.kind != "visitor"]
    visitor = [r for r in rows if r.kind == "visitor"]
    for stale in social[MAX_PER_NPC:]:
        db.delete(stale)
    for stale in visitor[MAX_VISITOR_PER_NPC:]:
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


def public_recent(db: Session, npc_id: str, limit: int = 8) -> list[NpcMemory]:
    """관계도에서 보여 줄 기억 — 방문자 대화(visitor)는 뺀다. 다른 손님이 뭘 물었는지는
    이 손님이 볼 일이 아니다."""
    return (
        db.query(NpcMemory)
        .filter(and_(NpcMemory.npc_id == npc_id, NpcMemory.kind != "visitor"))
        .order_by(NpcMemory.created_at.desc(), NpcMemory.id.desc())
        .limit(limit)
        .all()
    )


def visitor_key(visitor_id: str) -> str:
    """방문자 기억의 about_npc_id. 'visitor:' 접두라 NPC id 와 절대 안 섞이고,
    public_recent 는 kind 로 거르니 밖으로 새지 않는다."""
    return f"visitor:{visitor_id.strip()[:64]}"


def visitor_history(db: Session, npc_id: str, visitor_id: str) -> list[str]:
    """이 방문자가 전에 왔었으면 프롬프트에 넣을 줄. 첫 방문이면 빈 리스트."""
    if not visitor_id.strip():
        return []
    key = visitor_key(visitor_id)
    with_me = (
        db.query(NpcMemory)
        .filter(and_(NpcMemory.about_npc_id == key, NpcMemory.npc_id == npc_id))
        .order_by(NpcMemory.created_at.desc(), NpcMemory.id.desc())
        .all()
    )
    with_others = db.query(NpcMemory).filter(and_(NpcMemory.about_npc_id == key, NpcMemory.npc_id != npc_id)).count()
    if not with_me and not with_others:
        return []
    nth = len(with_me) + 1
    line = f"이 방문자: 나와는 {nth}번째 대화"
    if with_me:
        line += f", 지난번엔 {with_me[0].text}"
    if with_others:
        line += f". 마을의 다른 NPC 와도 {with_others}번 얘기했다"
    return ["[이 방문자] " + line + ". 아는 척 반갑게 맞되 이름·신상은 모른다(묻지도 않는다)."]


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
    # 같은 얘기를 만날 때마다 또 옮기지 않는다 — 실측에서 한 사건이 세 번 연속 "소식"이 됐다.
    dup = db.query(NpcMemory).filter(and_(NpcMemory.npc_id == listener, NpcMemory.text == text)).first()
    if dup is not None:
        return None
    # delta 부호를 같이 옮긴다 — 호출자(main)가 listener↔C 친밀도를 이 부호로 ±1 움직인다.
    return remember(db, listener, text, about=source.about_npc_id, kind="gossip", delta=source.delta)


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
