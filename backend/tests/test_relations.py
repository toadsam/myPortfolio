import pytest

from app import relations


@pytest.mark.parametrize(
    "npc_id,expected",
    [
        ("overseer-npc", "overseer"),
        ("npc-study-codingtest", "coding"),
        ("npc-study-cs", "cs"),
        ("guide-npc", "guide"),
        ("developer-npc", "developer"),
        ("npc-skill-backend", "developer"),
        ("archivist-npc", "archivist"),
        ("npc-exp-unity-ui", "archivist"),
        ("contact-npc", "contact"),
        ("npc-post-office", "contact"),
        ("npc-project-mywave", "project"),
    ],
)
def test_canon_matches_building_id_naming_convention(npc_id, expected):
    """CLAUDE.md 규약: 동적 NPC id는 building id의 substring으로 라우팅된다."""
    assert relations.canon(npc_id) == expected


def test_relation_for_is_symmetric():
    assert relations.relation_for("guide-npc", "project-npc") == relations.relation_for("project-npc", "guide-npc")


def test_relation_for_overseer_pair_always_special():
    assert relations.relation_for("overseer-npc", "guide-npc") == relations._OVERSEER_RELATION
    assert relations.relation_for("archivist-npc", "overseer-npc") == relations._OVERSEER_RELATION


def test_relation_for_unknown_pair_falls_back():
    assert (
        relations.relation_for("developer-npc", "archivist-npc")
        == "마을에서 함께 사는 친한 동료. 편하게 안부를 나누는 사이."
    )
