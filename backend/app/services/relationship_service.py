"""NPC들 사이의 '살아있는 관계' — 대화 결과로 친밀도가 오르내리고, 사건을 기억한다.

관계는 대표 종류(canon) 쌍으로 관리한다. 같은 종류끼리는 관계를 만들지 않는다.
초기 친밀도만 아주 살짝 씨앗을 주고(SEED), 그 뒤로는 전부 대화로 창발한다.
"""

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models import NpcRelationship
from app.relations import canon, relation_for

# 초기 친밀도 씨앗(선택). 대부분 0에서 시작해 대화로 굴러간다.
SEED_AFFINITY: dict[tuple[str, str], int] = {
    ("guide", "project"): 6,
    ("developer", "project"): -3,
    ("archivist", "contact"): 4,
    ("coding", "developer"): 5,
    ("archivist", "cs"): 4,
    ("contact", "project"): -2,
    ("guide", "developer"): 3,
    ("coding", "cs"): 6,
}


def _pair(npc_a: str, npc_b: str) -> tuple[str, str]:
    return tuple(sorted((canon(npc_a), canon(npc_b))))  # type: ignore[return-value]


def _vibe_label(affinity: int) -> str:
    if affinity <= -25:
        return "앙숙"
    if affinity <= -8:
        return "서먹한 사이"
    if affinity < 6:
        return "그냥 아는 사이"
    if affinity < 16:
        return "친한 사이"
    if affinity < 30:
        return "꽤 가까운 사이"
    return "절친"


def list_all(db: Session) -> list[NpcRelationship]:
    return db.query(NpcRelationship).order_by(NpcRelationship.affinity.desc()).all()


def get_or_create(db: Session, npc_a: str, npc_b: str) -> NpcRelationship | None:
    a, b = _pair(npc_a, npc_b)
    if a == b:
        return None  # 같은 종류끼리는 관계 없음
    rel = (
        db.query(NpcRelationship)
        .filter(and_(NpcRelationship.npc_a == a, NpcRelationship.npc_b == b))
        .first()
    )
    if rel:
        return rel
    seed = SEED_AFFINITY.get((a, b), 0)
    rel = NpcRelationship(npc_a=a, npc_b=b, affinity=seed, vibe=_vibe_label(seed), history=[])
    db.add(rel)
    db.commit()
    db.refresh(rel)
    return rel


def relationship_context(db: Session, npc_a: str, npc_b: str) -> str:
    """다음 대화 프롬프트에 넣을, '현재 사이'와 기억."""
    rel = get_or_create(db, npc_a, npc_b)
    if rel is None:
        return ""
    if rel.history:
        recent = "; ".join(rel.history[-3:])
    else:
        recent = f"(아직 별일 없음. 기본 성향: {relation_for(npc_a, npc_b)})"
    return (
        f"[두 사람의 현재 사이] 친밀도 {rel.affinity:+d} ({rel.vibe}), 지금까지 {rel.meet_count}번 만남. "
        f"최근 있었던 일: {recent} "
        "이 관계와 기억을 대화에 자연스럽게 반영해라 — 지난 일을 꺼내거나, 삐친 걸 티내거나, 반가워하거나. "
        "그리고 이번 대화가 사이를 어떻게 바꿨는지 판단해서 relationship 필드로 반환해라."
    )


def _milestone(old: int, new: int) -> str:
    """친밀도가 특정 문턱을 넘으면 '큰 사건'으로 알린다."""
    if old < 30 <= new:
        return "절친이 됐어요"
    if old > -25 >= new:
        return "앙숙이 됐어요"
    if old < 0 <= new:
        return "화해했어요"
    if old >= 0 > new:
        return "사이가 틀어졌어요"
    return ""


def apply_outcome(
    db: Session,
    npc_a: str,
    npc_b: str,
    affinity_delta: int,
    event: str,
    vibe: str,
) -> tuple[NpcRelationship | None, str]:
    rel = get_or_create(db, npc_a, npc_b)
    if rel is None:
        return None, ""
    old = rel.affinity
    delta = max(-5, min(5, int(affinity_delta)))  # 한 번에 조금씩만 변함(자연스럽게)
    rel.affinity = max(-100, min(100, rel.affinity + delta))
    milestone = _milestone(old, rel.affinity)
    rel.vibe = vibe.strip()[:60] if vibe.strip() else _vibe_label(rel.affinity)
    if event.strip():
        history = list(rel.history or [])
        history.append(event.strip()[:120])
        rel.history = history[-6:]
        rel.last_event = event.strip()[:200]
    rel.meet_count += 1
    db.commit()
    db.refresh(rel)
    return rel, milestone
