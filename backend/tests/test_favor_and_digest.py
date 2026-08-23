"""4단계 C — 부탁(NpcFavor), 건물 불빛 ↔ 마일스톤, 하루 요약(📰)."""

import asyncio
import random
from datetime import datetime, timedelta, timezone

from app.models import NpcFavor, RelationshipMilestone, VillageEvent
from app.services import daily_digest_service as digest
from app.services import favor_service, relay_service, relationship_service
from app.services.village_service import LIGHT_LEVELS, apply_light_shift
from app.schemas import BuildingState, VillageState


def _make_sour(db, a="guide-npc", b="project-npc"):
    for _ in range(4):
        relationship_service.apply_outcome(db, a, b, -5, "말다툼")
    return relationship_service.get_or_create(db, a, b)


def test_favor_not_issued_without_sour_relationship(db_session):
    assert favor_service.maybe_issue(db_session, "guide-npc", rng=random.Random(0)) is None


def test_favor_issued_once_and_fulfilled_by_relay(db_session):
    rel = _make_sour(db_session)
    assert rel.affinity <= -8
    rng = random.Random(3)
    favor = None
    for _ in range(30):
        favor = favor_service.maybe_issue(db_session, "guide-npc", rng=rng)
        if favor:
            break
    assert favor is not None and favor.about_npc_id == "project-npc" and "전해 줄래" in favor.text
    # 미완료가 있으면 또 안 만든다
    assert favor_service.maybe_issue(db_session, "guide-npc", rng=random.Random(0)) is None
    assert [f.id for f in favor_service.list_pending(db_session)] == [favor.id]

    # 엉뚱한 방향(루미에게 픽셀 얘기)은 이행이 아니다
    wrong = relay_service.apply_relay(db_session, "guide-npc", relay_service.detect_relay("픽셀이 미안하대", "guide-npc"))
    assert wrong.favor_done is False and wrong.delta == 2

    # 픽셀에게 루미 얘기를 긍정으로 전하면 이행 → +4, 🎁
    before = relationship_service.get_or_create(db_session, "guide-npc", "project-npc").affinity
    done = relay_service.apply_relay(db_session, "project-npc", relay_service.detect_relay("루미가 미안하대", "project-npc"))
    assert done.favor_done is True and done.delta == favor_service.FAVOR_REWARD
    assert done.news is not None and done.news.emoji == "🎁"
    after = relationship_service.get_or_create(db_session, "guide-npc", "project-npc").affinity
    assert after == before + favor_service.FAVOR_REWARD
    assert db_session.get(NpcFavor, favor.id).fulfilled_at is not None
    assert favor_service.list_pending(db_session) == []


def test_home_building_mapping():
    assert relationship_service.home_building("npc-study-codingtest") == "study-codingtest"
    assert relationship_service.home_building("guide-npc") == "central-plaza"
    assert relationship_service.home_building("atelier-backend") == ""


def _state(*ids):
    # apply_light_shift 는 buildings 만 본다 — 나머지 필드는 모양만 맞춘다
    return VillageState.model_construct(
        buildings=[BuildingState(building_id=i, light_level="normal", activity_score=50, reason="r") for i in ids],
        npcs=[],
        unlocked_items=[],
        summary="",
    )


def test_light_shift_from_todays_milestones(db_session):
    db_session.add(RelationshipMilestone(npc_a="guide-npc", npc_b="npc-study-cs", milestone="사이가 틀어졌어요", affinity=-1))
    db_session.add(RelationshipMilestone(npc_a="developer-npc", npc_b="npc-project-festflow", milestone="화해했어요", affinity=1))
    # 어제 것은 무시
    db_session.add(
        RelationshipMilestone(
            npc_a="archivist-npc", npc_b="contact-npc", milestone="앙숙이 됐어요", affinity=-30,
            created_at=datetime.now(timezone.utc) - timedelta(days=2),
        )
    )
    db_session.commit()
    shift = relationship_service.todays_light_shift(db_session)
    assert shift["central-plaza"][0] == -1 and shift["study-cs"][0] == -1
    assert shift["skill-backend"][0] == 1 and shift["project-festflow"][0] == 1
    assert "exp-portfolio" not in shift and "post-office" not in shift

    state = apply_light_shift(_state("central-plaza", "skill-backend", "other"), shift)
    by_id = {b.building_id: b for b in state.buildings}
    assert by_id["central-plaza"].light_level == "dim" and "싸워서" in by_id["central-plaza"].reason
    assert by_id["skill-backend"].light_level == "bright" and "화해" in by_id["skill-backend"].reason
    assert by_id["other"].light_level == "normal" and by_id["other"].reason == "r"
    assert LIGHT_LEVELS == ["dark", "dim", "normal", "bright"]


def test_compose_digest_picks_biggest_pair_and_incident():
    ev = [
        VillageEvent(emoji="💚", text="루미 ↔ 픽셀 · 작은 선물 — 모델 한 줄", npc_a="guide-npc", npc_b="project-npc", delta=3),
        VillageEvent(emoji="💢", text="테오 ↔ 픽셀 · 기술 설명이 장황 → 사이가 틀어졌어요!", npc_a="developer-npc", npc_b="project-npc", delta=-4),
        VillageEvent(emoji="🗣️", text="…", npc_a="guide-npc", npc_b="developer-npc", delta=-1),
    ]
    text = digest.compose_digest(ev)
    assert "테오" in text and "픽셀" in text and "-4" in text
    assert "사건 하나: 작은 선물" in text
    assert "큰 사건 1건" in text
    assert digest.compose_digest([]) == ""


def test_ensure_today_digest_once_per_day(db_session, monkeypatch):
    from app.config import settings

    monkeypatch.setattr(settings, "openai_api_key", "")
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    db_session.add(VillageEvent(emoji="💚", text="루미 ↔ 픽셀 · 간식", npc_a="guide-npc", npc_b="project-npc", delta=2, created_at=yesterday))
    db_session.commit()
    row = asyncio.run(digest.ensure_today_digest(db_session))
    assert row is not None and row.emoji == "📰" and "루미" in row.text
    assert asyncio.run(digest.ensure_today_digest(db_session)) is None
    assert db_session.query(VillageEvent).filter(VillageEvent.emoji == "📰").count() == 1


def test_digest_skipped_when_yesterday_was_quiet(db_session, monkeypatch):
    from app.config import settings

    monkeypatch.setattr(settings, "openai_api_key", "")
    assert asyncio.run(digest.ensure_today_digest(db_session)) is None
