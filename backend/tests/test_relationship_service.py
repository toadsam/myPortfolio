from datetime import datetime, timedelta, timezone

from app.models import NpcRelationship
from app.services import relationship_service


def test_self_pair_has_no_relationship(db_session):
    assert relationship_service.get_or_create(db_session, "developer-npc", "developer-npc") is None


def test_same_kind_different_npcs_get_their_own_row(db_session):
    # 2026-08-22: 관계는 NPC 개인 단위. developer-npc 와 npc-skill-backend 는 같은
    # 종류(developer)지만 서로 다른 NPC 라 관계가 생긴다(같은 구역 동료).
    rel = relationship_service.get_or_create(db_session, "developer-npc", "npc-skill-backend")
    assert rel is not None
    assert (rel.npc_a, rel.npc_b) == ("developer-npc", "npc-skill-backend")
    assert rel.affinity == 0


def test_rows_are_keyed_by_npc_id_not_kind(db_session):
    # 프로젝트 안내원 둘이 테오와 각각 다른 관계를 가진다 — 예전엔 한 줄을 공유했다.
    a = relationship_service.get_or_create(db_session, "npc-project-festflow", "developer-npc")
    b = relationship_service.get_or_create(db_session, "npc-project-aclub", "developer-npc")
    assert a.id != b.id
    assert a.affinity == b.affinity == -3  # 종류 쌍(developer, project) 씨앗은 둘 다 물려받는다


def test_decay_pulls_affinity_toward_zero_per_day(db_session):
    rel = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    rel.affinity = 10
    rel.updated_at = datetime.now(timezone.utc) - timedelta(days=3, hours=1)
    db_session.commit()
    again = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    assert again.affinity == 7
    assert again.vibe == "친한 사이"


def test_decay_never_crosses_zero(db_session):
    rel = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    rel.affinity = -2
    rel.updated_at = datetime.now(timezone.utc) - timedelta(days=30)
    db_session.commit()
    assert relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc").affinity == 0


def test_purge_legacy_kind_rows_removes_only_kind_keyed_rows(db_session):
    db_session.add(NpcRelationship(npc_a="developer", npc_b="project", affinity=4, vibe="", history=[]))
    db_session.commit()
    relationship_service.get_or_create(db_session, "developer-npc", "project-npc")
    assert relationship_service.purge_legacy_kind_rows(db_session) == 1
    rows = relationship_service.list_all(db_session)
    assert [(r.npc_a, r.npc_b) for r in rows] == [("developer-npc", "project-npc")]


def test_seeded_pair_starts_with_seed_affinity(db_session):
    rel = relationship_service.get_or_create(db_session, "guide-npc", "project-npc")
    assert rel is not None
    assert rel.affinity == 6
    assert rel.vibe == "친한 사이"


def test_unseeded_pair_starts_neutral(db_session):
    rel = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    assert rel.affinity == 0
    assert rel.meet_count == 0


def test_apply_outcome_caps_delta_at_five_per_interaction(db_session):
    relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    updated, _ = relationship_service.apply_outcome(
        db_session, "developer-npc", "archivist-npc", affinity_delta=100, event="", vibe="쿨한 사이"
    )
    assert updated.affinity == 5
    # vibe 는 LLM 문구가 아니라 친밀도 문턱에서 나온다 (5 → 그냥 아는 사이)
    assert updated.vibe == "그냥 아는 사이"
    assert updated.meet_count == 1


def test_apply_outcome_clamps_affinity_to_upper_bound(db_session):
    rel = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    rel.affinity = 98
    updated, _ = relationship_service.apply_outcome(
        db_session, "developer-npc", "archivist-npc", affinity_delta=100, event="", vibe=""
    )
    assert updated.affinity == 100


def test_apply_outcome_records_event_history_capped_at_six(db_session):
    for i in range(8):
        relationship_service.apply_outcome(
            db_session, "developer-npc", "archivist-npc", affinity_delta=1, event=f"사건 {i}", vibe=""
        )
    updated = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    assert len(updated.history) == 6
    assert updated.history[-1] == "사건 7"
    assert updated.meet_count == 8


def test_apply_outcome_crossing_thirty_triggers_best_friend_milestone(db_session):
    rel = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    rel.affinity = 28
    _, milestone = relationship_service.apply_outcome(
        db_session, "developer-npc", "archivist-npc", affinity_delta=5, event="같이 밤새 디버깅했다", vibe="든든한 사이"
    )
    assert milestone == "절친이 됐어요"


def test_apply_outcome_crossing_zero_downward_triggers_falling_out_milestone(db_session):
    rel = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    rel.affinity = 2
    _, milestone = relationship_service.apply_outcome(
        db_session, "developer-npc", "archivist-npc", affinity_delta=-5, event="크게 다퉜다", vibe="서먹한 사이"
    )
    assert milestone == "사이가 틀어졌어요"


def test_apply_outcome_crossing_zero_upward_triggers_reconciled_milestone(db_session):
    rel = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    rel.affinity = -3
    _, milestone = relationship_service.apply_outcome(
        db_session, "developer-npc", "archivist-npc", affinity_delta=5, event="화해했다", vibe="편한 사이"
    )
    assert milestone == "화해했어요"


# ── 3단계: 감쇠 주기 · 영구 연표 ──────────────────────────────────────────────


def test_close_friends_decay_slower(db_session):
    from app.models import NpcRelationship as _R  # noqa: F401

    rel = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    rel.affinity = 40
    rel.updated_at = datetime.now(timezone.utc) - timedelta(days=7, hours=1)
    db_session.commit()
    again = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    assert again.affinity == 40 - 7 // 3  # 3일에 1


def test_milestone_rows_are_permanent_and_counted(db_session):
    from app.models import RelationshipMilestone

    rel = relationship_service.get_or_create(db_session, "developer-npc", "archivist-npc")
    rel.affinity = 1
    db_session.commit()
    relationship_service.apply_outcome(db_session, "developer-npc", "archivist-npc", -5, "싸움")  # 틀어짐
    relationship_service.apply_outcome(db_session, "developer-npc", "archivist-npc", 5, "화해", source="relay")
    # history 는 롤링이지만 연표는 남는다
    for i in range(10):
        relationship_service.apply_outcome(db_session, "developer-npc", "archivist-npc", 0, f"잡담 {i}")
    rows = db_session.query(RelationshipMilestone).all()
    assert [r.milestone for r in rows] == ["사이가 틀어졌어요", "화해했어요"]
    assert rows[1].source == "relay"
    counts = relationship_service.milestone_counts(db_session)[("archivist-npc", "developer-npc")]
    assert counts == {"fights": 1, "reconciliations": 1, "milestones": ["사이가 틀어졌어요", "화해했어요"]}
