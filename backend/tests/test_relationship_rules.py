"""relationship_rules — 마주침 결과를 정하는 규칙. 순수 함수라 DB 없이 돈다."""

import random
from types import SimpleNamespace

import pytest

from app.services import relationship_rules as rules


def _activity(**kw):
    base = dict(github_commits=0, study_minutes=0, workout_done=False, memo="")
    base.update(kw)
    return SimpleNamespace(**base)


def _no_incident():
    """random() 이 항상 0.99 → 사건(0.12) 은 절대 안 난다."""
    r = random.Random(1)
    r.random = lambda: 0.99  # type: ignore[method-assign]
    return r


def _always_incident(seed=1):
    r = random.Random(seed)
    real = r.random
    calls = {"n": 0}

    def fake():
        calls["n"] += 1
        return 0.0 if calls["n"] == 1 else real()  # 첫 호출(사건 판정)만 0

    r.random = fake  # type: ignore[method-assign]
    return r


def test_busy_pair_clashes():
    out = rules.decide_outcome("guide-npc", "project-npc", "busy", "busy", _activity(), 0, rng=_no_incident())
    assert out.delta == -2
    assert out.kind == "clash"
    assert "날카로" in out.reason
    assert out.mood_a == out.mood_b == "worried"


def test_calm_consoles_worried():
    out = rules.decide_outcome("guide-npc", "project-npc", "worried", "calm", _activity(), 0, rng=_no_incident())
    assert out.delta == 2
    assert out.kind == "bond"


def test_mood_pair_is_symmetric():
    a = rules.decide_outcome("guide-npc", "project-npc", "excited", "sleepy", _activity(), 0, rng=_no_incident())
    b = rules.decide_outcome("guide-npc", "project-npc", "sleepy", "excited", _activity(), 0, rng=_no_incident())
    assert a.delta == b.delta == -1


def test_commits_bond_project_and_developer_only():
    act = _activity(github_commits=7)
    pair = rules.decide_outcome("npc-project-festflow", "developer-npc", "calm", "focused", act, 0, rng=_no_incident())
    other = rules.decide_outcome("guide-npc", "contact-npc", "calm", "focused", act, 0, rng=_no_incident())
    assert pair.delta == 2 and "커밋" in pair.reason
    assert other.delta == 0


def test_study_bonds_coding_and_cs():
    act = _activity(study_minutes=120)
    out = rules.decide_outcome("npc-study-codingtest", "npc-study-cs", "calm", "focused", act, 0, rng=_no_incident())
    assert out.delta == 2 and "공부" in out.reason


def test_neutral_when_nothing_happens():
    out = rules.decide_outcome("guide-npc", "contact-npc", "focused", "training", _activity(), 0, rng=_no_incident())
    assert out.delta == 0
    assert out.kind == "neutral"
    assert out.reason == "별일 없이 안부만 주고받았다"
    assert (out.mood_a, out.mood_b) == ("focused", "training")


def test_incident_uses_names_and_marks_kind():
    out = rules.decide_outcome(
        "guide-npc", "project-npc", "calm", "calm", _activity(), 0, name_a="루미", name_b="픽셀", rng=_always_incident()
    )
    assert out.kind == "incident"
    assert "루미" in out.reason and "픽셀" in out.reason
    assert out.delta != 1  # calm+calm(+1) 에 사건(±2~3)이 더해져 1 이 아니다


def test_total_is_clamped_to_five():
    # excited+excited(+2) · 커밋(+2) · 선물 사건(+3) = +7 → 5
    hits = 0
    for seed in range(40):
        out = rules.decide_outcome(
            "project-npc", "developer-npc", "excited", "excited", _activity(github_commits=9), 0, rng=_always_incident(seed)
        )
        assert -5 <= out.delta <= 5
        hits += out.delta == 5
    assert hits > 0


def test_close_friends_get_more_negative_incidents():
    """친밀도가 높을수록 음수 사건 가중 2배 — 수렴 방지의 핵심."""
    def share_negative(affinity):
        neg = 0
        for seed in range(300):
            out = rules.decide_outcome("guide-npc", "project-npc", "calm", "calm", _activity(), affinity, rng=_always_incident(seed))
            neg += (out.delta - 1) < 0  # calm+calm 의 +1 을 빼면 사건 부호
        return neg / 300

    assert share_negative(40) > share_negative(-20) + 0.15


def test_negative_outcome_sets_worried_moods():
    out = rules.decide_outcome("guide-npc", "project-npc", "busy", "sleepy", _activity(), 0, rng=_no_incident())
    assert out.delta == -1
    # -1 은 "싸움" 문턱(-2) 미만이라 기분은 그대로
    assert (out.mood_a, out.mood_b) == ("busy", "sleepy")


@pytest.mark.parametrize("seed", [3, 11, 42])
def test_deterministic_for_same_seed(seed):
    kw = dict(activity=_activity(github_commits=6), affinity=10)
    a = rules.decide_outcome("project-npc", "developer-npc", "proud", "curious", rng=random.Random(seed), **kw)
    b = rules.decide_outcome("project-npc", "developer-npc", "proud", "curious", rng=random.Random(seed), **kw)
    assert a == b


# ── 3단계: 직군별 사건 ──────────────────────────────────────────────────────


def _incident_actor(a, b, seed, affinity=0):
    out = rules.decide_outcome(a, b, "calm", "calm", _activity(), affinity, name_a=a, name_b=b, rng=_always_incident(seed))
    assert out.kind == "incident"
    return out


def test_incident_actor_id_is_one_of_the_pair():
    for seed in range(20):
        out = _incident_actor("developer-npc", "project-npc", seed)
        assert out.actor_id in ("developer-npc", "project-npc")
        assert out.actor_id in out.reason  # {a} 자리엔 행위자 이름(여기선 id)이 들어간다


def test_developer_never_steals_snacks_but_life_can():
    """간식 사건은 life(하루) 전용. 테오↔픽셀 300번에 한 번도 안 나와야 한다."""
    for seed in range(300):
        out = _incident_actor("developer-npc", "project-npc", seed)
        assert "간식" not in out.reason
    seen = any("간식" in _incident_actor("npc-life-gym", "guide-npc", seed).reason for seed in range(300))
    assert seen


def test_role_specific_incident_is_attributed_to_the_right_side():
    """'범위를 또 늘려서' 는 planner 만 저지른다 — 체리↔굴뚝 에서 행위자는 항상 체리."""
    for seed in range(300):
        out = _incident_actor("atelier-planner-npc", "atelier-backend-npc", seed)
        if "범위" in out.reason:
            assert out.actor_id == "atelier-planner-npc"
            break
    else:
        raise AssertionError("planner 사건이 300번 안에 한 번도 안 나왔다")


def test_candidate_incidents_filter_by_kind():
    kinds = {inc.template for inc, _ in rules.candidate_incidents("developer", "project")}
    assert any("기술 설명" in t for t in kinds)
    assert any("프로젝트 자랑" in t for t in kinds)
    assert not any("간식" in t for t in kinds)
    assert any("선물" in t for t in kinds)  # 공통은 항상


def test_josa_follows_batchim():
    assert rules.josa("픽셀", "가") == "이"
    assert rules.josa("루미", "가") == "가"
    assert rules.josa("픽셀", "를") == "을"
    assert rules.josa("테오", "를") == "를"
    assert rules.josa("굴뚝", "와") == "과"
    assert rules.josa("FestFlow 안내원", "가") == "이"
    assert rules.josa("abc", "가") == "가"


def test_incident_sentences_use_correct_particles():
    for seed in range(200):
        out = rules.decide_outcome(
            "developer-npc", "project-npc", "calm", "calm", _activity(), 0,
            name_a="테오", name_b="픽셀", rng=_always_incident(seed),
        )
        assert "픽셀가" not in out.reason and "픽셀를" not in out.reason and "픽셀와" not in out.reason



def _aff(*pairs):
    return {frozenset((a, b)): v for a, b, v in pairs}


def test_side_bias_friends_enemy_cools_down():
    # 루미(a)–테오(c) 절친, 테오–픽셀(b) 앙숙 → 루미는 픽셀에게 한 칸 차갑다
    d, why = rules.side_bias("guide-npc", "project-npc", _aff(("guide-npc", "developer-npc", 20), ("developer-npc", "project-npc", -10)))
    assert d == -1 and "편을 들어서" in why


def test_side_bias_mutual_friend_warms_up():
    d, why = rules.side_bias("guide-npc", "project-npc", _aff(("guide-npc", "developer-npc", 20), ("developer-npc", "project-npc", 18)))
    assert d == 1 and "둘 다의 친구" in why


def test_side_bias_cancels_and_is_capped():
    aff = _aff(
        ("guide-npc", "developer-npc", 20), ("developer-npc", "project-npc", -10),  # 적
        ("guide-npc", "archivist-npc", 20), ("archivist-npc", "project-npc", 20),  # 친구
    )
    # 공통 친구는 양쪽에서 보이므로(+2) 한쪽만의 적(−1)보다 세다 → +1 로 캡
    assert rules.side_bias("guide-npc", "project-npc", aff)[0] == 1
    # 적이 둘이어도 −1 까지만
    aff2 = _aff(
        ("guide-npc", "developer-npc", 20), ("developer-npc", "project-npc", -10),
        ("guide-npc", "archivist-npc", 20), ("archivist-npc", "project-npc", -10),
    )
    assert rules.side_bias("guide-npc", "project-npc", aff2)[0] == -1
    assert rules.side_bias("guide-npc", "project-npc", None) == (0, "")


def test_decide_outcome_applies_side_bias_in_reason():
    aff = _aff(("guide-npc", "developer-npc", 20), ("developer-npc", "project-npc", -10))
    out = rules.decide_outcome(
        "guide-npc", "project-npc", "calm", "calm", _activity(), 0,
        name_a="루미", name_b="픽셀", rng=random.Random(1), affinities=aff,
        name_of=lambda x: {"guide-npc": "루미", "project-npc": "픽셀", "developer-npc": "테오"}[x],
    )
    assert "루미가 테오 편을 들어서" in out.reason
    assert -5 <= out.delta <= 5
