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
  3. 확률 사건 — 간식을 뺏어 먹거나 약속을 깜빡하거나 선물을 준다. 친할수록 투닥거리고,
     앙숙일수록 화해 기회가 오도록 가중해 **수렴을 막는다**.
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

# 확률 사건: (delta, 이유 템플릿). {a}{b} 는 이름으로 치환된다 — a 가 저지른/베푼 쪽.
_INCIDENTS: list[tuple[int, str]] = [
    (-3, "{a}가 {b}의 간식을 몰래 먹어 버렸다"),
    (-2, "{a}가 {b}와의 약속을 깜빡했다"),
    (-2, "{a}의 농담이 {b}에게 좀 과했다"),
    (-2, "{a}가 {b}의 말을 끝까지 안 듣고 끊었다"),
    (3, "{a}가 {b}에게 작은 선물을 줬다"),
    (3, "{a}가 {b}의 일을 말없이 도와줬다"),
    (2, "{a}와 {b}가 옛 얘기를 하다 같이 울컥했다"),
    (2, "{a}가 {b}의 고민을 끝까지 들어줬다"),
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
    return 0, ""


def _pick_incident(affinity: int, rng: random.Random, name_a: str, name_b: str) -> tuple[int, str]:
    weights: list[float] = []
    for delta, _ in _INCIDENTS:
        w = 1.0
        if affinity >= CLOSE_AFFINITY and delta < 0:
            w = 2.0  # 친할수록 투닥거린다
        elif affinity <= SOUR_AFFINITY and delta > 0:
            w = 2.0  # 앙숙일수록 화해 기회
        weights.append(w)
    delta, template = rng.choices(_INCIDENTS, weights=weights, k=1)[0]
    # 누가 저질렀는지는 동전 던지기
    a, b = (name_a, name_b) if rng.random() < 0.5 else (name_b, name_a)
    return delta, template.format(a=a, b=b)


def _result_moods(delta: int, kind: str, mood_a: str, mood_b: str) -> tuple[str, str]:
    if delta <= -2:
        # 싸운 뒤엔 둘 다 뒤숭숭하다. 사건이면 한쪽은 정신없음으로.
        return ("busy", "worried") if kind == "incident" else ("worried", "worried")
    if delta >= 3:
        return "excited", "proud"
    return mood_a or "calm", mood_b or "calm"


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
) -> Outcome:
    rng = rng or random.Random()
    name_a = name_a or npc_a
    name_b = name_b or npc_b

    parts: list[str] = []
    total = 0
    kind = "neutral"

    d, why = _mood_delta(mood_a, mood_b)
    if d:
        total += d
        parts.append(why)

    d, why = _shared_topic(canon(npc_a), canon(npc_b), activity)
    if d:
        total += d
        parts.append(why)

    if rng.random() < INCIDENT_CHANCE:
        d, why = _pick_incident(affinity, rng, name_a, name_b)
        total += d
        parts.append(why)
        kind = "incident"

    total = max(-MAX_STEP, min(MAX_STEP, total))
    if kind != "incident":
        kind = "bond" if total > 0 else "clash" if total < 0 else "neutral"

    reason = " · ".join(parts) if parts else "별일 없이 안부만 주고받았다"
    ma, mb = _result_moods(total, kind, mood_a, mood_b)
    return Outcome(delta=total, reason=reason, kind=kind, mood_a=ma, mood_b=mb)
