from app.services import relationship_service


def test_same_kind_pair_has_no_relationship(db_session):
    # developer-npc와 npc-skill-backend는 둘 다 canon("developer")로 정규화된다
    assert relationship_service.get_or_create(db_session, "developer-npc", "npc-skill-backend") is None


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
    assert updated.vibe == "쿨한 사이"
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
