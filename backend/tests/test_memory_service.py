"""memory_service — NPC 개인 기억과 뒷담화."""

import random

from app.services import memory_service as mem


def test_remember_and_recent_are_newest_first(db_session):
    for i in range(3):
        mem.remember(db_session, "guide-npc", f"기억 {i}")
    assert mem.recent(db_session, "guide-npc") == ["기억 2", "기억 1", "기억 0"]


def test_memory_is_capped_per_npc(db_session):
    for i in range(mem.MAX_PER_NPC + 5):
        mem.remember(db_session, "guide-npc", f"기억 {i}")
    rows = mem.recent(db_session, "guide-npc", limit=100)
    assert len(rows) == mem.MAX_PER_NPC
    assert rows[0] == f"기억 {mem.MAX_PER_NPC + 4}"
    assert f"기억 0" not in rows


def test_about_filters_by_other_npc(db_session):
    mem.remember(db_session, "guide-npc", "픽셀과 만남: 같이 웃었다", about="project-npc")
    mem.remember(db_session, "guide-npc", "테오와 만남: 티격태격", about="developer-npc")
    assert mem.about(db_session, "guide-npc", "project-npc") == ["픽셀과 만남: 같이 웃었다"]
    assert mem.about(db_session, "project-npc", "guide-npc") == []


def test_gossip_passes_third_party_story_to_listener(db_session):
    mem.remember(db_session, "guide-npc", "테오와 만남: 테오가 루미의 간식을 먹었다", about="developer-npc", kind="incident")
    always = random.Random(0)
    always.random = lambda: 0.0  # type: ignore[method-assign]
    row = mem.gossip(db_session, "guide-npc", "project-npc", rng=always)
    assert row is not None
    assert row.kind == "gossip"
    assert row.about_npc_id == "developer-npc"
    assert row.text.startswith("루미에게 들음:")
    assert mem.recent(db_session, "project-npc") == [row.text]


def test_gossip_never_tells_listener_about_themselves(db_session):
    mem.remember(db_session, "guide-npc", "픽셀과 만남: 싸웠다", about="project-npc")
    always = random.Random(0)
    always.random = lambda: 0.0  # type: ignore[method-assign]
    assert mem.gossip(db_session, "guide-npc", "project-npc", rng=always) is None


def test_gossip_respects_chance(db_session):
    mem.remember(db_session, "guide-npc", "테오와 만남", about="developer-npc")
    never = random.Random(0)
    never.random = lambda: 0.99  # type: ignore[method-assign]
    assert mem.gossip(db_session, "guide-npc", "project-npc", rng=never) is None


def test_prompt_lines_include_recent_and_known(db_session):
    mem.remember(db_session, "guide-npc", "픽셀과 만남: 같이 웃었다", about="project-npc")
    lines = mem.memory_lines_for_prompt(db_session, "guide-npc", "project-npc")
    assert lines[0].startswith("내 최근 기억")
    assert "- 픽셀과 만남: 같이 웃었다" in lines
    assert any("픽셀에 대해 내가 아는 것" in line for line in lines)


def test_prompt_lines_when_empty(db_session):
    lines = mem.memory_lines_for_prompt(db_session, "guide-npc")
    assert lines == ["내 최근 기억(제공된 것만 근거로 말한다):", "- (아직 특별히 기억나는 일이 없다)"]


def test_display_name_resolves_dynamic_ids():
    assert mem.display_name("guide-npc") == "루미"
    assert mem.display_name("npc-project-festflow") == "FestFlow 안내원"
    assert mem.display_name("npc-study-codingtest") == "알고"
    assert mem.display_name("npc-life-gym") == "하루"
    assert mem.display_name("atelier-backend-npc") == "굴뚝"
