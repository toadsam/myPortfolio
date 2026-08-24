"""NPC 마주침의 **결과를 정하는 규칙**. 순수 함수 — Session 도, 모델 호출도 없다.

왜 이게 따로 있나: 전에는 LLM 에게 "이 대화로 둘 사이가 얼마나 바뀌었는지 판단해
돌려줘"라고 시켰다. 모델은 소설가라 거의 언제나 훈훈하게 끝내고, 그 결과 친밀도는
올라가기만 해서 전원 절친으로 수렴했다. 싸움에 이유도 없었다.

이제 순서를 뒤집는다. **여기서 결과(delta·이유·기분)를 먼저 정하고**, LLM 은 그
사건이 드러나는 대사만 쓴다. LLM 이 뭐라 돌려주든 친밀도는 이 값으로만 움직인다.
AI 가 꺼져 있어도(키 없음·실패) 관계는 똑같이 굴러간다.

세 가지 재료를 더한다:
  1. 기분 궁합 — 둘 다 busy 면 날카롭고, worried 를 calm 이 달래 준다.
  2. 공통 화제 — 오늘 정재훈의 활동. 커밋이 많은 날 픽셀(프로젝트)과 테오(기술)가 가까워진다.
  3. 확률 사건 — **직군에 맞는 것만**(3단계). 테오는 장황한 설명으로 싸우고 버그를 잡아 주며,
     체리는 범위를 또 늘리고, 하루는 운동을 같이 해 준다. 간식·선물처럼 누구나 할 법한
     공통 사건은 `actors=None`. 친할수록 투닥거리고 앙숙일수록 화해 기회가 오도록 가중해
     **수렴을 막는다**.
합계는 ±5 로 자른다(한 번에 조금씩). 하루 감쇠는 relationship_service 쪽에 있다.
"""

from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Any

from app.relations import canon

# 마주침 한 번에 움직일 수 있는 최대치. relationship_service.apply_outcome 도 같은 값으로 자른다.
MAX_STEP = 5
INCIDENT_CHANCE = 0.12
# 친밀도가 이 위면 "친한 사이" — 투닥거릴 여지(음수 사건)가 커진다.
CLOSE_AFFINITY = 16
# 이 아래면 "서먹/앙숙" — 화해 기회(양수 사건)가 커진다.
SOUR_AFFINITY = -8


@dataclass(frozen=True)
class Outcome:
    delta: int
    reason: str
    kind: str  # bond | clash | incident | neutral
    mood_a: str
    mood_b: str
    # 사건을 저지른/베푼 쪽 npc_id (사건이 아니면 ""). 기억의 delta·소식 문장에 쓴다.
    actor_id: str = ""


_JOSA = {"가": ("이", "가"), "를": ("을", "를"), "는": ("은", "는"), "와": ("과", "와"), "이": ("이", "")}


def josa(word: str, kind: str) -> str:
    """받침에 맞는 조사. "픽셀가/픽셀를" 같은 오류를 막는다. 한글이 아니면 받침 없음으로 본다."""
    with_batchim, without = _JOSA[kind]
    if not word:
        return without
    code = ord(word[-1])
    if 0xAC00 <= code <= 0xD7A3:
        return with_batchim if (code - 0xAC00) % 28 else without
    return without


class Name(str):
    """템플릿에서 `{a:가}` 처럼 쓰면 이름 뒤에 맞는 조사를 붙인다."""

    def __format__(self, spec: str) -> str:
        base = str(self)
        return base + josa(base, spec) if spec else base


@dataclass(frozen=True)
class Incident:
    delta: int
    template: str  # {a} = 행위자, {b} = 상대
    actors: frozenset[str] | None = None  # None 이면 누구나. 아니면 행위자의 canon 종류 집합.


# 기분 쌍 → (delta, 이유). 키는 정렬된 튜플. 없는 조합은 0.
_MOOD_PAIRS: dict[tuple[str, str], tuple[int, str]] = {
    ("busy", "busy"): (-2, "둘 다 정신없어서 말이 날카로웠다"),
    ("calm", "worried"): (2, "걱정을 털어놓고 위로받았다"),
    ("excited", "excited"): (2, "둘 다 들떠서 신나게 떠들었다"),
    ("proud", "proud"): (2, "서로 자랑하다 같이 으쓱해졌다"),
    ("curious", "curious"): (2, "궁금한 걸 한참 같이 파고들었다"),
    ("excited", "proud"): (1, "기분 좋은 얘기가 오갔다"),
    ("curious", "focused"): (1, "진지한 얘기가 잘 통했다"),
    ("calm", "calm"): (1, "느긋하게 안부를 나눴다"),
    ("excited", "sleepy"): (-1, "한쪽만 들떠서 박자가 안 맞았다"),
    ("busy", "sleepy"): (-1, "바쁜 쪽이 졸린 쪽을 답답해했다"),
    ("sleepy", "worried"): (-1, "걱정을 들어줄 기운이 없었다"),
    ("busy", "worried"): (-1, "바빠서 걱정을 제대로 못 들어줬다"),
}


def _k(*kinds: str) -> frozenset[str]:
    return frozenset(kinds)


# 확률 사건. 직군이 맞는 쪽이 행위자({a})가 된다.
_INCIDENTS: list[Incident] = [
    # ── 공통 ──
    Incident(3, "{a:가} {b}에게 작은 선물을 줬다"),
    Incident(2, "{a:가} {b}의 고민을 끝까지 들어줬다"),
    Incident(-2, "{a:가} {b:와}의 약속을 깜빡했다"),
    Incident(-2, "{a}의 농담이 {b}에게 좀 과했다"),
    # ── 루미(안내) ──
    Incident(-2, "{a:가} 길 안내를 한다며 {b:를} 너무 오래 붙잡았다", _k("guide")),
    Incident(2, "{a:가} 방문객 앞에서 {b:를} 칭찬해 줬다", _k("guide")),
    # ── 픽셀·프로젝트 안내원 ──
    Incident(-2, "{a:가} 자기 프로젝트 자랑만 늘어놓아 {b:가} 지쳤다", _k("project")),
    Incident(3, "{a:가} {b}의 전시 준비를 도와줬다", _k("project")),
    # ── 테오·기술 안내원 ──
    Incident(-2, "{a}의 기술 설명이 너무 장황해서 {b:가} 끊고 싶어했다", _k("developer")),
    Incident(3, "{a:가} {b:를} 괴롭히던 버그를 잡아 줬다", _k("developer")),
    # ── 아카·기록 안내원 ──
    Incident(-2, "{a:가} {b}의 메모를 몰래 들여다봤다", _k("archivist")),
    Incident(2, "{a:가} 옛 기록을 꺼내 {b:와} 같이 울컥했다", _k("archivist")),
    # ── 포스트·연락 ──
    Incident(-2, "{a:가} 손님 응대를 {b}에게 떠넘겼다", _k("contact")),
    Incident(3, "{a:가} {b} 앞으로 온 편지를 대신 전해 줬다", _k("contact")),
    # ── 알고(코딩테스트) ──
    Incident(-1, "{a:가} 문제 얘기로 {b:를} 삼천포에 빠뜨렸다", _k("coding")),
    Incident(2, "{a:가} {b:와} 같이 문제를 풀어 줬다", _k("coding")),
    # ── 노바(CS) ──
    Incident(-1, "{a}의 개념 설명이 밤까지 이어져 {b:가} 졸았다", _k("cs")),
    Incident(2, "{a:가} {b:가} 헷갈리던 개념을 정리해 줬다", _k("cs")),
    # ── 하루(라이프) ──
    Incident(3, "{a:가} {b:와} 운동을 같이 해 줬다", _k("life")),
    Incident(-3, "{a:가} {b}의 간식을 몰래 먹어 버렸다", _k("life")),
    # ── 정재훈(총괄) ──
    Incident(3, "{a:가} 일부러 찾아와 {b:를} 챙겨 줬다", _k("overseer")),
    # ── 의뢰 공방 ──
    Incident(-3, "{a:가} 의뢰 범위를 또 늘려서 {b:가} 한숨을 쉬었다", _k("planner")),
    Incident(-2, "{a:가} 일정 얘기에 뾰족해져 {b}에게 쏘아붙였다", _k("designer")),
    Incident(-2, "{a:와} {b:가} 픽셀 단위로 싸웠다", _k("fe", "designer")),
    Incident(3, "{a:가} {b:가} 벌린 일을 조용히 수습해 줬다", _k("be")),
    Incident(2, "{a:가} 손님 메모를 {b}에게 깔끔하게 넘겨 줬다", _k("intake")),
]


def _mood_delta(mood_a: str, mood_b: str) -> tuple[int, str]:
    key = tuple(sorted((mood_a or "calm", mood_b or "calm")))
    return _MOOD_PAIRS.get(key, (0, ""))  # type: ignore[arg-type]


def _shared_topic(kind_a: str, kind_b: str, activity: Any) -> tuple[int, str]:
    """오늘 활동이 두 직군에게 공통 화제가 되는가. 가장 센 한 가지만 고른다."""
    kinds = {kind_a, kind_b}
    commits = int(getattr(activity, "github_commits", 0) or 0)
    study = int(getattr(activity, "study_minutes", 0) or 0)
    workout = bool(getattr(activity, "workout_done", False))
    memo = str(getattr(activity, "memo", "") or "").strip()

    if commits >= 5 and kinds == {"project", "developer"}:
        return 2, f"오늘 커밋 {commits}개 얘기로 신났다"
    if commits >= 5 and "project" in kinds and len(kinds) == 1:
        return 1, "오늘 올라온 커밋을 같이 구경했다"
    if study >= 90 and kinds == {"coding", "cs"}:
        return 2, f"오늘 공부 {study}분짜리 얘기로 통했다"
    if study >= 90 and kinds == {"developer", "cs"}:
        return 1, "오늘 공부한 개념을 놓고 한참 얘기했다"
    if workout and ("guide" in kinds or "life" in kinds):
        return 1, "오늘 운동한 얘기로 기운이 났다"
    if memo and "archivist" in kinds:
        return 1, "오늘 메모를 같이 들여다봤다"
    # 한쪽 직군만 걸려도 그 사람의 기분이 대화에 묻는다 (5단계 E-8) — 공통 화제가 없을 때만
    if commits >= 5 and kinds & {"developer", "project"}:
        return 1, f"오늘 커밋 {commits}개 소식에 기분이 좋았다"
    if study >= 90 and kinds & {"coding", "cs"}:
        return 1, "오늘 공부 얘기가 나와 신이 났다"
    if not workout and "life" in kinds:
        return -1, "운동 기록이 비어 하루가 시무룩했다"
    return 0, ""


def candidate_incidents(kind_a: str, kind_b: str) -> list[tuple[Incident, list[str]]]:
    """두 직군이 낄 수 있는 사건과, 각 사건에서 행위자가 될 수 있는 쪽('a'/'b')."""
    out: list[tuple[Incident, list[str]]] = []
    for inc in _INCIDENTS:
        if inc.actors is None:
            out.append((inc, ["a", "b"]))
            continue
        sides = [s for s, k in (("a", kind_a), ("b", kind_b)) if k in inc.actors]
        if sides:
            out.append((inc, sides))
    return out


def _pick_incident(
    kind_a: str,
    kind_b: str,
    affinity: int,
    rng: random.Random,
    name_a: str,
    name_b: str,
) -> tuple[int, str, str]:
    """(delta, 문장, 행위자 side 'a'|'b')"""
    candidates = candidate_incidents(kind_a, kind_b)
    weights: list[float] = []
    for inc, _ in candidates:
        w = 1.0
        if affinity >= CLOSE_AFFINITY and inc.delta < 0:
            w = 2.0  # 친할수록 투닥거린다
        elif affinity <= SOUR_AFFINITY and inc.delta > 0:
            w = 2.0  # 앙숙일수록 화해 기회
        weights.append(w)
    inc, sides = rng.choices(candidates, weights=weights, k=1)[0]
    side = sides[0] if len(sides) == 1 else ("a" if rng.random() < 0.5 else "b")
    a, b = (name_a, name_b) if side == "a" else (name_b, name_a)
    return inc.delta, inc.template.format(a=Name(a), b=Name(b)), side


def _result_moods(delta: int, kind: str, mood_a: str, mood_b: str) -> tuple[str, str]:
    if delta <= -2:
        # 싸운 뒤엔 둘 다 뒤숭숭하다. 사건이면 한쪽은 정신없음으로.
        return ("busy", "worried") if kind == "incident" else ("worried", "worried")
    if delta >= 3:
        return "excited", "proud"
    return mood_a or "calm", mood_b or "calm"


Affinities = dict[frozenset[str], int]


def side_bias(
    npc_a: str,
    npc_b: str,
    affinities: Affinities | None,
    *,
    name_of=None,
) -> tuple[int, str]:
    """편 들기 — 삼각관계 규칙 한 개. (delta 보정, 이유) 를 돌려준다.

    A 의 절친 C(≥ CLOSE_AFFINITY)가 B 와 앙금(≤ SOUR_AFFINITY)이면 A 는 B 에게 한 칸 차갑다(−1, "친구의 적").
    C 가 B 와도 절친이면 한 칸 따뜻하다(+1, "친구의 친구"). B 쪽에서도 같은 걸 본다.
    양쪽이 상쇄되면 0. 한 번에 ±1 까지만 — 관계 엔진의 주인공은 여전히 둘의 직접 상호작용이다.
    """
    if not affinities:
        return 0, ""
    name_of = name_of or (lambda x: x)

    def aff(x: str, y: str) -> int | None:
        return affinities.get(frozenset((x, y)))

    others = {n for pair in affinities for n in pair} - {npc_a, npc_b}
    score = 0
    why: list[str] = []
    for me, them in ((npc_a, npc_b), (npc_b, npc_a)):
        for c in sorted(others):
            mine = aff(me, c)
            theirs = aff(c, them)
            if mine is None or theirs is None or mine < CLOSE_AFFINITY:
                continue
            if theirs <= SOUR_AFFINITY:
                score -= 1
                why.append(f"{name_of(me)}{josa(name_of(me), '가')} {name_of(c)} 편을 들어서")
            elif theirs >= CLOSE_AFFINITY:
                score += 1
                why.append(f"{name_of(c)}{josa(name_of(c), '가')} 둘 다의 친구라서")
    score = max(-1, min(1, score))
    if score == 0:
        return 0, ""
    # 점수 부호에 맞는 이유만 남긴다(상쇄된 쪽은 버림)
    keep = [w for w in why if ("편을" in w) == (score < 0)]
    return score, keep[0] if keep else ""


def decide_outcome(
    npc_a: str,
    npc_b: str,
    mood_a: str,
    mood_b: str,
    activity: Any,
    affinity: int,
    *,
    name_a: str | None = None,
    name_b: str | None = None,
    rng: random.Random | None = None,
    affinities: Affinities | None = None,
    name_of=None,
) -> Outcome:
    rng = rng or random.Random()
    name_a = name_a or npc_a
    name_b = name_b or npc_b
    kind_a, kind_b = canon(npc_a), canon(npc_b)

    parts: list[str] = []
    total = 0
    kind = "neutral"
    actor_id = ""

    d, why = _mood_delta(mood_a, mood_b)
    if d:
        total += d
        parts.append(why)

    d, why = _shared_topic(kind_a, kind_b, activity)
    if d:
        total += d
        parts.append(why)

    if rng.random() < INCIDENT_CHANCE:
        d, why, side = _pick_incident(kind_a, kind_b, affinity, rng, name_a, name_b)
        total += d
        parts.append(why)
        kind = "incident"
        actor_id = npc_a if side == "a" else npc_b

    # 편 들기 — 공통 친구/적이 있으면 한 칸 보정
    d, why = side_bias(
        npc_a,
        npc_b,
        affinities,
        name_of=name_of or (lambda x: name_a if x == npc_a else name_b if x == npc_b else x),
    )
    if d:
        total += d
        parts.append(why)

    total = max(-MAX_STEP, min(MAX_STEP, total))
    if kind != "incident":
        kind = "bond" if total > 0 else "clash" if total < 0 else "neutral"

    reason = " · ".join(parts) if parts else "별일 없이 안부만 주고받았다"
    ma, mb = _result_moods(total, kind, mood_a, mood_b)
    return Outcome(delta=total, reason=reason, kind=kind, mood_a=ma, mood_b=mb, actor_id=actor_id)
