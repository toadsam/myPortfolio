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


# ── 3단계 ──────────────────────────────────────────────────────────────────


def test_remember_stores_delta_and_gossip_carries_it(db_session):
    mem.remember(db_session, "guide-npc", "테오 만남 — 장황한 설명", about="developer-npc", kind="incident", delta=-2)
    always = random.Random(0)
    always.random = lambda: 0.0  # type: ignore[method-assign]
    row = mem.gossip(db_session, "guide-npc", "project-npc", rng=always)
    assert row is not None and row.delta == -2


def test_public_recent_excludes_visitor_memories(db_session):
    mem.remember(db_session, "guide-npc", "방문자가 '연락처' 하고 물어봤다", kind="visitor")
    mem.remember(db_session, "guide-npc", "픽셀 만남 — 안부", about="project-npc")
    rows = mem.public_recent(db_session, "guide-npc")
    assert [r.text for r in rows] == ["픽셀 만남 — 안부"]


def test_gossip_does_not_repeat_the_same_story(db_session):
    mem.remember(db_session, "guide-npc", "테오 만남 — 장황한 설명", about="developer-npc", kind="incident", delta=-2)
    always = random.Random(0)
    always.random = lambda: 0.0  # type: ignore[method-assign]
    assert mem.gossip(db_session, "guide-npc", "project-npc", rng=always) is not None
    assert mem.gossip(db_session, "guide-npc", "project-npc", rng=always) is None



def test_visitor_history_is_empty_on_first_visit_and_grows(db_session):
    assert mem.visitor_history(db_session, "guide-npc", "") == []
    assert mem.visitor_history(db_session, "guide-npc", "abc") == []
    mem.remember(db_session, "guide-npc", "방문자가 '프로젝트 뭐 있어?' 하고 물어봤다", about=mem.visitor_key("abc"), kind="visitor")
    mem.remember(db_session, "project-npc", "방문자가 '안녕' 하고 물어봤다", about=mem.visitor_key("abc"), kind="visitor")
    lines = mem.visitor_history(db_session, "guide-npc", "abc")
    assert len(lines) == 1 and "2번째 대화" in lines[0] and "프로젝트 뭐 있어?" in lines[0] and "1번" in lines[0]
    # 다른 방문자는 모른다
    assert mem.visitor_history(db_session, "guide-npc", "zzz") == []
    # 관계도용 공개 기억엔 visitor 가 안 섞인다
    assert all(m.kind != "visitor" for m in mem.public_recent(db_session, "guide-npc"))


def test_visitor_memories_survive_social_flood(db_session):
    # 방문자 기억 하나 → 사회 기억 40개가 밀어내지 못한다 (5단계 D-1)
    mem.remember(db_session, "guide-npc", "방문자가 '안녕' 하고 물어봤다", about=mem.visitor_key("abc"), kind="visitor")
    for i in range(40):
        mem.remember(db_session, "guide-npc", f"사건 {i}", about="project-npc", kind="encounter")
    rows = mem.recent(db_session, "guide-npc", limit=60)
    assert len([t for t in rows]) <= mem.MAX_PER_NPC + mem.MAX_VISITOR_PER_NPC
    assert mem.visitor_history(db_session, "guide-npc", "abc")  # 아직 살아 있다


def test_visitor_memories_have_their_own_cap(db_session):
    for i in range(mem.MAX_VISITOR_PER_NPC + 3):
        mem.remember(db_session, "guide-npc", f"방문자 질문 {i}", about=mem.visitor_key("abc"), kind="visitor")
    from sqlalchemy import and_
    from app.models import NpcMemory

    visitor_rows = (
        db_session.query(NpcMemory)
        .filter(and_(NpcMemory.npc_id == "guide-npc", NpcMemory.kind == "visitor"))
        .all()
    )
    assert len(visitor_rows) == mem.MAX_VISITOR_PER_NPC
