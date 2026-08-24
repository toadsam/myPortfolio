"""visitor_service — 익명 단골 점수 (5단계 E-9)."""

from app.services import visitor_service as vs


def test_bump_daily_cap(db_session):
    for _ in range(5):
        row = vs.bump(db_session, "v1", "guide-npc")
    assert row.visits == 5
    assert row.score == vs.DAILY_CAP  # 하루 상한
    # 다른 NPC 는 별도 통
    other = vs.bump(db_session, "v1", "project-npc")
    assert other.score == 1
    assert vs.bump(db_session, "", "guide-npc") is None


def test_favor_bonus_and_levels(db_session):
    row = vs.bump(db_session, "v1", "guide-npc")
    row = vs.favor_bonus(db_session, "v1", "guide-npc")
    assert row.score == 1 + vs.FAVOR_BONUS
    assert vs.level(0) == "처음 온 손님"
    assert vs.level(vs.FAMILIAR_AT) == "아는 손님"
    assert vs.level(vs.REGULAR_AT) == "단골 손님"
    assert vs.prompt_line(None) == ""
    row.score = vs.REGULAR_AT
    assert "단골" in vs.prompt_line(row)
