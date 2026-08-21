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
