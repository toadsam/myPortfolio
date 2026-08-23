"""relay_service — 방문자가 대화창에서 다른 NPC 얘기를 전하면 관계가 움직인다."""

from app.models import VillageEvent
from app.services import memory_service as mem
from app.services import relationship_service, relay_service


def test_detect_positive_relay_by_name_and_feeling():
    relay = relay_service.detect_relay("루미한테 픽셀이 미안하대", "guide-npc")
    assert relay is not None
    assert relay.about_npc_id == "project-npc"
    assert relay.about_name == "픽셀"
    assert relay.delta == relay_service.RELAY_STEP


def test_detect_negative_relay():
    relay = relay_service.detect_relay("테오 진짜 싫어", "guide-npc")
    assert relay is not None
    assert relay.about_npc_id == "developer-npc"
    assert relay.delta == -relay_service.RELAY_STEP


def test_plain_mention_is_not_a_relay():
    assert relay_service.detect_relay("픽셀 잘 지내?", "guide-npc") is None


def test_feeling_without_other_npc_is_not_a_relay():
    assert relay_service.detect_relay("너 정말 고마워", "guide-npc") is None


def test_mentioning_the_speaker_itself_is_ignored():
    assert relay_service.detect_relay("루미 고마워", "guide-npc") is None


def test_mixed_feelings_are_ignored():
    assert relay_service.detect_relay("픽셀 고마운데 좀 싫어", "guide-npc") is None


def test_dynamic_project_guide_names_resolve():
    relay = relay_service.detect_relay("FestFlow 안내원 멋지다고 전해줘", "guide-npc")
    assert relay is not None
    assert relay.about_npc_id == "npc-project-festflow"


def test_apply_relay_moves_affinity_and_records(db_session):
    relay = relay_service.detect_relay("픽셀이 미안하대", "guide-npc")
    milestone = relay_service.apply_relay(db_session, "guide-npc", relay)
    rel = relationship_service.get_or_create(db_session, "guide-npc", "project-npc")
    assert rel.affinity == 6 + 2  # 씨앗 6 + 전달 2
    assert rel.history[-1].startswith("방문자가 전해줌")
    assert milestone == ""
    memories = mem.recent(db_session, "guide-npc")
    assert memories and "픽셀 얘기를 전해 줬다" in memories[0]
    events = db_session.query(VillageEvent).all()
    assert len(events) == 1 and events[0].emoji == "💌" and events[0].delta == 2
