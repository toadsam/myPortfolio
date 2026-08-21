"""NPC들 사이의 '살아있는 관계' — 대화 결과로 친밀도가 오르내리고, 사건을 기억한다.

2026-08-22 부터 관계는 **NPC 개인(npc_id) 쌍**으로 관리한다. 그 전엔 대표 종류
(canon) 쌍이라 프로젝트 안내원 9명이 테오와 관계 한 줄을 공유했고, 같은 종류끼리는
관계가 없었다. 종류 쌍은 이제 **초기 씨앗(SEED_AFFINITY)과 기본 톤(relations)** 에만 쓴다.

친밀도 변화량은 relationship_rules.decide_outcome 이 정한다(LLM 아님). 여기는
저장·감쇠·마일스톤만 맡는다.
"""

from datetime import datetime, timezone

from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models import NpcRelationship
from app.relations import canon, relation_for

# 초기 친밀도 씨앗(대표 종류 쌍). 대부분 0에서 시작해 대화로 굴러간다.
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

# 하루에 0 쪽으로 이만큼 돌아간다. 안 만나면 서서히 "그냥 아는 사이"로.
DECAY_PER_DAY = 1


def _pair(npc_a: str, npc_b: str) -> tuple[str, str]:
    return tuple(sorted((npc_a, npc_b)))  # type: ignore[return-value]


def _seed_for(npc_a: str, npc_b: str) -> int:
    return SEED_AFFINITY.get(tuple(sorted((canon(npc_a), canon(npc_b)))), 0)  # type: ignore[arg-type]


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


def _apply_decay(rel: NpcRelationship, now: datetime | None = None) -> bool:
    """마지막 갱신 뒤 지난 날수만큼 0 쪽으로 당긴다. 바뀌었으면 True."""
    if rel.affinity == 0 or rel.updated_at is None:
        return False
    now = now or datetime.now(timezone.utc)
    last = rel.updated_at
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    days = (now - last).days
    if days <= 0:
        return False
    step = min(abs(rel.affinity), days * DECAY_PER_DAY)
    rel.affinity -= step if rel.affinity > 0 else -step
    rel.vibe = _vibe_label(rel.affinity)
    return True


def list_all(db: Session) -> list[NpcRelationship]:
    rows = db.query(NpcRelationship).order_by(NpcRelationship.affinity.desc()).all()
    changed = False
    for rel in rows:
        changed = _apply_decay(rel) or changed
    if changed:
        db.commit()
    return rows


def get_or_create(db: Session, npc_a: str, npc_b: str) -> NpcRelationship | None:
    if npc_a == npc_b:
        return None  # 자기 자신과의 관계는 없다
    a, b = _pair(npc_a, npc_b)
    rel = (
        db.query(NpcRelationship)
        .filter(and_(NpcRelationship.npc_a == a, NpcRelationship.npc_b == b))
        .first()
    )
    if rel:
        if _apply_decay(rel):
            db.commit()
            db.refresh(rel)
        return rel
    seed = _seed_for(a, b)
    rel = NpcRelationship(npc_a=a, npc_b=b, affinity=seed, vibe=_vibe_label(seed), history=[])
    db.add(rel)
    db.commit()
    db.refresh(rel)
    return rel


def purge_legacy_kind_rows(db: Session) -> int:
    """종류-키 시절 행(npc_a 가 'guide' 처럼 id 가 아닌 것)을 지운다. 시작 시 한 번."""
    rows = db.query(NpcRelationship).all()
    stale = [r for r in rows if "npc" not in r.npc_a or "npc" not in r.npc_b]
    for r in stale:
        db.delete(r)
    if stale:
        db.commit()
    return len(stale)


def relationship_context(
    db: Session,
    npc_a: str,
    npc_b: str,
    known_lines: list[str] | None = None,
) -> str:
    """다음 대화 프롬프트에 넣을, '현재 사이'와 기억."""
    rel = get_or_create(db, npc_a, npc_b)
    if rel is None:
        return ""
    if rel.history:
        recent = "; ".join(rel.history[-3:])
    else:
        recent = f"(아직 별일 없음. 기본 성향: {relation_for(npc_a, npc_b)})"
    lines = [
        f"[두 사람의 현재 사이] 친밀도 {rel.affinity:+d} ({rel.vibe}), 지금까지 {rel.meet_count}번 만남. "
        f"최근 있었던 일: {recent} "
        "이 관계와 기억을 대화에 자연스럽게 반영해라 — 지난 일을 꺼내거나, 삐친 걸 티내거나, 반가워하거나."
    ]
    if known_lines:
        lines.extend(known_lines)
    return "\n".join(lines)


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
    vibe: str = "",
) -> tuple[NpcRelationship | None, str]:
    """친밀도를 delta(±5 클램프)만큼 움직이고 사건을 기억한다.

    vibe 라벨은 **항상 친밀도 문턱에서** 뽑는다. 예전엔 LLM 이 준 문구("앙숙", "절친")를
    그대로 썼는데, 수치와 라벨이 따로 놀았다. 인자는 호환용으로만 남겨 둔다.
    """
    rel = get_or_create(db, npc_a, npc_b)
    if rel is None:
        return None, ""
    old = rel.affinity
    delta = max(-5, min(5, int(affinity_delta)))  # 한 번에 조금씩만 변함(자연스럽게)
    rel.affinity = max(-100, min(100, rel.affinity + delta))
    milestone = _milestone(old, rel.affinity)
    rel.vibe = _vibe_label(rel.affinity)
    if event.strip():
        history = list(rel.history or [])
        history.append(event.strip()[:120])
        rel.history = history[-6:]
        rel.last_event = event.strip()[:200]
    rel.meet_count += 1
    db.commit()
    db.refresh(rel)
    return rel, milestone
