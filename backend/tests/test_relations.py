import pytest

from app import relations
from app.catalog import NPCS
from app.services.chat_service import _npc_profile_for_dynamic_id


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
        ("npc-life-gym", "life"),
        ("life-npc", "life"),
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


# ─────────────────────────── 의뢰 공방 라우팅 ───────────────────────────
#
# 공방 NPC 는 canon(관계)과 프로필(말투) 두 곳에서 갈린다. 한쪽만 고치면
# "말투는 기획인데 관계는 백엔드"인 어긋남이 생기므로 둘을 같이 잠가둔다.

ATELIER_CASES = [
    ("atelier-intake-npc", "intake", "atelier-intake-npc"),
    ("atelier-planner-npc", "planner", "atelier-planner-npc"),
    ("atelier-designer-npc", "designer", "atelier-designer-npc"),
    ("atelier-frontend-npc", "fe", "atelier-frontend-npc"),
    ("atelier-backend-npc", "be", "atelier-backend-npc"),
]


@pytest.mark.parametrize("npc_id,expected_canon,_profile", ATELIER_CASES)
def test_atelier_canon_is_not_swallowed_by_developer_branch(npc_id, expected_canon, _profile):
    """atelier-backend/-frontend 가 developer 로 먹히면 안 된다 (canon 맨 앞 가드)."""
    assert relations.canon(npc_id) == expected_canon


@pytest.mark.parametrize("npc_id,_canon,expected_profile", ATELIER_CASES)
def test_atelier_profile_routes_to_its_own_role(npc_id, _canon, expected_profile):
    assert _npc_profile_for_dynamic_id(npc_id) is NPCS[expected_profile]


def test_atelier_team_members_have_distinct_voices():
    """전부 도안 말투로 대답하면 팀이 아니라 한 사람이다."""
    names = {
        _npc_profile_for_dynamic_id(npc_id)["name"] for npc_id, _, _ in ATELIER_CASES
    }
    assert len(names) == len(ATELIER_CASES)


def test_atelier_profile_falls_back_to_intake_for_unknown_role():
    assert _npc_profile_for_dynamic_id("atelier-unknown-npc") is NPCS["atelier-intake-npc"]
