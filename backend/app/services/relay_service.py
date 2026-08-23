"""방문자 개입 — 대화창에서 방문자가 **다른 NPC 얘기를 감정을 담아** 전하면 관계가 움직인다.

"루미한테 픽셀이 미안하대" → 루미↔픽셀 +2. "테오 진짜 싫어" → 말 건 NPC↔테오 −2.
그냥 이름만 나오면("루미 잘 지내?") 개입이 아니다.

LLM 을 한 번 더 부르지 않는다 — 이름 사전 + 감정어 사전으로 끝낸다. 포트폴리오 방문자는
한국어로 짧게 말하므로 이 정도면 충분하고, 오탐보다 미탐이 낫다(관계가 엉뚱하게 움직이는
게 더 거슬린다).
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.catalog import NPCS, PROJECTS
from app.models import VillageEvent
from app.services import memory_service
from app.services.relationship_service import apply_outcome

RELAY_STEP = 2

_POSITIVE = ("미안", "사과", "고마", "고맙", "칭찬", "좋아한", "좋아해", "보고 싶", "보고싶", "화해", "응원", "멋지다", "멋있")
_NEGATIVE = ("싫", "욕", "화났", "화나", "짜증", "실망", "거짓말", "배신", "미워", "밉")


@dataclass(frozen=True)
class Relay:
    about_npc_id: str
    about_name: str
    delta: int
    snippet: str


def _name_table() -> list[tuple[str, str]]:
    """(이름, npc_id). 긴 이름부터 — "FestFlow 안내원"이 "안내원"보다 먼저 잡히게."""
    table: list[tuple[str, str]] = []
    for npc_id, profile in NPCS.items():
        name = str(profile.get("name") or "")
        if name:
            table.append((name, npc_id))
    for project in PROJECTS.values():
        table.append((f"{project['title']} 안내원", f"npc-{project['building_id']}"))
    # 전담 NPC 는 동적 id(npc-study-…)로도 산다 — 이름은 같으니 그쪽 id 를 우선한다.
    table = [(n, i) for n, i in table if i not in ("coding-test-npc", "cs-npc")]
    table.append(("알고", "npc-study-codingtest"))
    table.append(("노바", "npc-study-cs"))
    table.sort(key=lambda t: -len(t[0]))
    return table


_NAMES = _name_table()


def detect_relay(message: str, speaker_id: str) -> Relay | None:
    text = message.strip()
    if not text:
        return None
    speaker_name = memory_service.display_name(speaker_id)
    mentioned: tuple[str, str] | None = None
    for name, npc_id in _NAMES:
        if name == speaker_name or npc_id == speaker_id:
            continue
        if name in text:
            mentioned = (name, npc_id)
            break
    if mentioned is None:
        return None
    pos = any(w in text for w in _POSITIVE)
    neg = any(w in text for w in _NEGATIVE)
    if pos == neg:  # 둘 다 없거나 둘 다 있으면 판단 보류
        return None
    return Relay(
        about_npc_id=mentioned[1],
        about_name=mentioned[0],
        delta=RELAY_STEP if pos else -RELAY_STEP,
        snippet=text[:40],
    )


def apply_relay(db: Session, speaker_id: str, relay: Relay) -> str:
    """관계·기억·소식에 반영하고 마일스톤(있으면)을 돌려준다."""
    event = f"방문자가 전해줌: '{relay.snippet}'"
    rel, milestone = apply_outcome(db, speaker_id, relay.about_npc_id, relay.delta, event, source="relay")
    if rel is None:
        return ""
    memory_service.remember(
        db,
        speaker_id,
        f"방문자가 {relay.about_name} 얘기를 전해 줬다: '{relay.snippet}'",
        about=relay.about_npc_id,
        kind="relay",
        delta=relay.delta,
    )
    speaker_name = memory_service.display_name(speaker_id)
    text = f"방문자가 {speaker_name}에게 {relay.about_name} 얘기를 전했다 · '{relay.snippet}'"
    if milestone:
        text += f" → {milestone}!"
    db.add(VillageEvent(emoji="💌", text=text[:240], npc_a=speaker_id, npc_b=relay.about_npc_id, delta=relay.delta))
    db.commit()
    return milestone
