import json
from typing import Any

from app.catalog import NPCS
from app.config import settings
from app.models import DailyActivity
from app.schemas import (
    EncounterParticipant,
    NpcDialogueLine,
    NpcEncounterOut,
    NpcMood,
    NpcStateChange,
    NpcTickIn,
    NpcTickOut,
)
from app.services.chat_service import build_context

VALID_MOODS: set[str] = {
    "sleepy",
    "calm",
    "busy",
    "proud",
    "training",
    "curious",
    "focused",
    "worried",
    "excited",
}


async def generate_npc_tick(payload: NpcTickIn, activity: DailyActivity) -> NpcTickOut:
    npc = _npc_profile(payload.npc_id, payload.assigned_building_id)
    context = build_context(payload.npc_id, activity)

    if settings.openai_api_key:
        try:
            data = await _call_json_model(
                system_prompt=_tick_system_prompt(npc, context),
                user_prompt=json.dumps(payload.model_dump(), ensure_ascii=False),
                max_tokens=220,
            )
            return _tick_from_data(payload.npc_id, data, used_ai=True)
        except Exception:
            pass

    return _fallback_tick(payload, activity)


async def generate_npc_encounter(
    npc_a: EncounterParticipant,
    npc_b: EncounterParticipant,
    recent_memory: list[str],
    activity: DailyActivity,
) -> NpcEncounterOut:
    a_profile = _npc_profile(npc_a.npc_id, npc_a.assigned_building_id)
    b_profile = _npc_profile(npc_b.npc_id, npc_b.assigned_building_id)
    context = build_context(npc_a.npc_id, activity)

    if settings.openai_api_key:
        try:
            data = await _call_json_model(
                system_prompt=_encounter_system_prompt(a_profile, b_profile, context),
                user_prompt=json.dumps(
                    {
                        "npc_a": npc_a.model_dump(),
                        "npc_b": npc_b.model_dump(),
                        "recent_memory": recent_memory[-5:],
                    },
                    ensure_ascii=False,
                ),
                max_tokens=320,
            )
            return _encounter_from_data(npc_a.npc_id, npc_b.npc_id, data, used_ai=True)
        except Exception:
            pass

    return _fallback_encounter(npc_a, npc_b, activity)


async def _call_json_model(system_prompt: str, user_prompt: str, max_tokens: int) -> dict[str, Any]:
    import httpx

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_npc_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.8,
                "max_tokens": max_tokens,
                "response_format": {"type": "json_object"},
            },
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return json.loads(content)


def _tick_system_prompt(npc: dict[str, str], context: str) -> str:
    return (
        "You are an autonomous NPC brain for Jaehoon Jung's living 3D portfolio village. "
        "Generate one short Korean thought bubble and update the NPC's emotional state. "
        "Do not use fixed template-like lines. Use the current context, memory, role, and mood. "
        "Keep the bubble under 55 Korean characters. Return JSON only with keys: "
        "bubble_text, mood, energy, next_goal, memory, cooldown_seconds.\n"
        f"NPC role: {npc['role']}\n"
        f"Personality/tone: {npc['tone']}\n"
        f"Scope: {npc['scope']}\n"
        f"Context:\n{context}"
    )


def _npc_profile(npc_id: str, assigned_building_id: str | None = None) -> dict[str, str]:
    if npc_id in NPCS:
        return NPCS[npc_id]

    building_hint = assigned_building_id or npc_id.replace("npc-", "")
    if "skill" in building_hint or "backend" in building_hint or "frontend" in building_hint:
        return {
            "name": npc_id,
            "role": f"{building_hint} 건물의 기술 담당 NPC",
            "tone": "기술적이지만 방문자가 이해하기 쉽게 말합니다.",
            "scope": "담당 기술 건물, 정재훈의 기술 경험, 오늘 활동 상태",
        }
    if "exp" in building_hint:
        return {
            "name": npc_id,
            "role": f"{building_hint} 기록을 담당하는 아카이브 NPC",
            "tone": "차분하고 회고적으로 말합니다.",
            "scope": "성장 과정, 경험 기록, 최근 기억",
        }
    if "post" in building_hint or "contact" in building_hint:
        return {
            "name": npc_id,
            "role": "연락과 협업을 담당하는 우체국 NPC",
            "tone": "친절하고 간결하게 말합니다.",
            "scope": "연락, 협업, 링크 안내, 방문자 응대",
        }
    return {
        "name": npc_id,
        "role": f"{building_hint} 프로젝트 건물 담당 NPC",
        "tone": "프로젝트 맥락을 구체적으로 말하고 스스로 생각합니다.",
        "scope": "담당 프로젝트 건물, 주변 NPC 대화, 오늘 마을 활동 상태",
    }


def _encounter_system_prompt(a_profile: dict[str, str], b_profile: dict[str, str], context: str) -> str:
    return (
        "You simulate a brief spontaneous meeting between two autonomous NPCs in a 3D portfolio village. "
        "They should speak naturally in Korean, react to the village state, and change mood/energy based on the conversation. "
        "Keep each line under 55 Korean characters. Return JSON only with keys: dialogue, state_changes, memory, cooldown_seconds. "
        "dialogue is an array of {npc_id, text}. state_changes is an array of {npc_id, mood, energy}.\n"
        f"NPC A role: {a_profile['role']} / tone: {a_profile['tone']}\n"
        f"NPC B role: {b_profile['role']} / tone: {b_profile['tone']}\n"
        f"Context:\n{context}"
    )


def _tick_from_data(npc_id: str, data: dict[str, Any], used_ai: bool) -> NpcTickOut:
    mood = _normalize_mood(data.get("mood"), "calm")
    return NpcTickOut(
        npc_id=npc_id,
        bubble_text=str(data.get("bubble_text") or "잠깐 생각을 정리하는 중이야."),
        mood=mood,
        energy=_clamp_int(data.get("energy"), 50),
        next_goal=str(data.get("next_goal") or "wander"),
        memory=str(data.get("memory") or "짧은 생각을 남겼다."),
        used_ai=used_ai,
        cooldown_seconds=_clamp_int(data.get("cooldown_seconds"), 60, 30, 120),
    )


def _encounter_from_data(npc_a_id: str, npc_b_id: str, data: dict[str, Any], used_ai: bool) -> NpcEncounterOut:
    raw_dialogue = data.get("dialogue") if isinstance(data.get("dialogue"), list) else []
    dialogue = [
        NpcDialogueLine(npc_id=str(item.get("npc_id") or npc_a_id), text=str(item.get("text") or "..."))
        for item in raw_dialogue[:4]
        if isinstance(item, dict)
    ]
    if not dialogue:
        dialogue = [
            NpcDialogueLine(npc_id=npc_a_id, text="잠깐, 방금 마을 분위기가 바뀐 것 같아."),
            NpcDialogueLine(npc_id=npc_b_id, text="응. 오늘 기록이 NPC들한테도 전해졌어."),
        ]

    raw_changes = data.get("state_changes") if isinstance(data.get("state_changes"), list) else []
    changes = [
        NpcStateChange(
            npc_id=str(item.get("npc_id") or npc_a_id),
            mood=_normalize_mood(item.get("mood"), "curious"),
            energy=_clamp_int(item.get("energy"), 55),
        )
        for item in raw_changes[:2]
        if isinstance(item, dict)
    ]
    if not changes:
        changes = [
            NpcStateChange(npc_id=npc_a_id, mood="curious", energy=58),
            NpcStateChange(npc_id=npc_b_id, mood="focused", energy=58),
        ]

    return NpcEncounterOut(
        dialogue=dialogue,
        state_changes=changes,
        memory=str(data.get("memory") or "두 NPC가 마을 상태에 대해 짧게 대화했다."),
        used_ai=used_ai,
        cooldown_seconds=_clamp_int(data.get("cooldown_seconds"), 180, 120, 360),
    )


def _fallback_tick(payload: NpcTickIn, activity: DailyActivity) -> NpcTickOut:
    mood: NpcMood = "focused" if activity.study_minutes >= 90 else "busy" if activity.github_commits >= 5 else "calm"
    if activity.workout_done and payload.npc_id == "guide-npc":
        mood = "training"
    return NpcTickOut(
        npc_id=payload.npc_id,
        bubble_text="잠깐 생각이 정리되지 않았어. 다시 말을 걸어줘.",
        mood=mood,
        energy=70 if mood in {"busy", "focused", "training"} else 45,
        next_goal=payload.assigned_building_id or "wander",
        memory="잠시 생각을 정리하며 마을 상태를 살폈다.",
        used_ai=False,
        cooldown_seconds=90,
    )


def _fallback_encounter(
    npc_a: EncounterParticipant,
    npc_b: EncounterParticipant,
    activity: DailyActivity,
) -> NpcEncounterOut:
    mood: NpcMood = "busy" if activity.github_commits >= 5 else "curious"
    return NpcEncounterOut(
        dialogue=[
            NpcDialogueLine(npc_id=npc_a.npc_id, text="지금은 생각이 조금 흐릿해."),
            NpcDialogueLine(npc_id=npc_b.npc_id, text="그래도 마을 상태는 계속 변하고 있어."),
        ],
        state_changes=[
            NpcStateChange(npc_id=npc_a.npc_id, mood=mood, energy=58),
            NpcStateChange(npc_id=npc_b.npc_id, mood="focused", energy=58),
        ],
        memory="두 NPC가 마을 상태에 대해 짧게 대화했다.",
        used_ai=False,
        cooldown_seconds=240,
    )


def _normalize_mood(value: Any, fallback: NpcMood) -> NpcMood:
    if isinstance(value, str) and value in VALID_MOODS:
        return value  # type: ignore[return-value]
    return fallback


def _clamp_int(value: Any, fallback: int, min_value: int = 0, max_value: int = 100) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        parsed = fallback
    return max(min_value, min(max_value, parsed))
