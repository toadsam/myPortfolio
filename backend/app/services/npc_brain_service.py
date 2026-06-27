import json
from typing import Any

from app.catalog import NPCS, PROJECTS
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
from app.services.npc_action_service import choose_npc_action

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
    context = build_context(payload.npc_id, activity, payload.recent_memory)

    if settings.openai_api_key:
        try:
            data = await _call_json_model(
                system_prompt=_tick_system_prompt(npc, context),
                user_prompt=json.dumps(payload.model_dump(), ensure_ascii=False),
                max_tokens=260,
            )
            return _tick_from_data(payload.npc_id, data, used_ai=True, activity=activity)
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
    context = build_context(npc_a.npc_id, activity, recent_memory)

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
                max_tokens=360,
            )
            return _encounter_from_data(npc_a.npc_id, npc_b.npc_id, data, used_ai=True, activity=activity)
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
                "temperature": 0.82,
                "max_tokens": max_tokens,
                "response_format": {"type": "json_object"},
            },
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return json.loads(content)


def _tick_system_prompt(npc: dict[str, Any], context: str) -> str:
    return (
        "You are an autonomous NPC brain for Jaehoon Jung's living 3D portfolio village. "
        "Generate one short Korean thought bubble and update the NPC's emotional state. "
        "The NPC should feel like it has a role, emotion, memory, and a local goal. "
        "Do not invent facts outside the provided portfolio context. "
        "Keep bubble_text under 55 Korean characters. Return JSON only with keys: "
        "bubble_text, mood, energy, next_goal, memory, cooldown_seconds.\n"
        f"NPC name: {_profile_text(npc, 'name', 'NPC')}\n"
        f"NPC role: {_profile_text(npc, 'role', '')}\n"
        f"Personality/tone: {_profile_text(npc, 'tone', '')}\n"
        f"Emotional bias: {_profile_text(npc, 'emotional_bias', '')}\n"
        f"Memory focus: {_profile_text(npc, 'memory_focus', '')}\n"
        f"Current goal: {_profile_text(npc, 'goal', '')}\n"
        f"Scope: {_profile_text(npc, 'scope', '')}\n"
        f"Context:\n{context}"
    )


def _npc_profile(npc_id: str, assigned_building_id: str | None = None) -> dict[str, Any]:
    if npc_id in NPCS:
        return NPCS[npc_id]

    building_hint = assigned_building_id or npc_id.replace("npc-", "")
    project = _project_for_building(building_hint)
    if project:
        return {
            "name": f"{project['title']} 안내원",
            "role": f"{project['title']} 프로젝트 건물을 맡은 큐레이터 NPC",
            "tone": "프로젝트의 문제, 구현 난점, 채용자 관점 가치를 짧고 구체적으로 말합니다.",
            "scope": f"{project['title']}, 사용 기술, 구현 난점, 관련 프로젝트 추천",
            "personality": "방문자가 어떤 프로젝트를 봤는지 기억하려고 하는 관찰형 안내원입니다.",
            "emotional_bias": "프로젝트 질문을 받으면 excited, 구현 난점 질문에는 focused로 반응합니다.",
            "memory_focus": "최근 본 프로젝트, 관심 기술, 상세 전시 진입 여부",
            "goal": f"{project['title']}의 핵심 가치를 방문자에게 이해시키기",
        }

    if "skill" in building_hint or "backend" in building_hint or "frontend" in building_hint:
        return {
            "name": "기술 안내원",
            "role": f"{building_hint} 건물의 기술 담당 NPC",
            "tone": "기술적이지만 방문자가 이해하기 쉽게 말합니다.",
            "scope": "해당 기술 건물, 정재훈의 기술 경험, 오늘 공부 상태",
            "personality": "기술 선택의 이유를 설명하는 작은 멘토입니다.",
            "emotional_bias": "공부 시간이 많으면 focused, 기술 질문이 깊으면 excited로 반응합니다.",
            "memory_focus": "방문자가 물어본 기술, 오늘 공부 시간, 관련 프로젝트",
            "goal": "기술 이름을 실제 프로젝트 사례와 연결하기",
        }
    if "exp" in building_hint:
        return {
            "name": "기록 안내원",
            "role": f"{building_hint} 기록을 담당하는 아카이브 NPC",
            "tone": "차분하고 회고적으로 말합니다.",
            "scope": "성장 과정, 경험 기록, 최근 기억",
            "personality": "작은 기록을 성장의 흐름으로 해석합니다.",
            "emotional_bias": "메모가 있으면 curious, 성취 기록에는 proud로 반응합니다.",
            "memory_focus": "오늘 메모, 방문자가 관심 가진 경험, 회고 질문",
            "goal": "경험이 어떤 배움으로 이어졌는지 설명하기",
        }
    if "post" in building_hint or "contact" in building_hint:
        return {
            "name": "연락 안내원",
            "role": "연락과 협업을 담당하는 우체국 NPC",
            "tone": "친절하고 간결하게 말합니다.",
            "scope": "연락, 협업, 링크 안내, 방문자 응대",
            "personality": "방문자의 관심을 다음 행동으로 연결합니다.",
            "emotional_bias": "구체적인 연락 목적에는 calm, 협업 질문에는 proud로 반응합니다.",
            "memory_focus": "관심 프로젝트, 연락 목적, 요청 자료",
            "goal": "방문자가 연락 경로를 놓치지 않게 하기",
        }
    return NPCS["guide-npc"]


def _encounter_system_prompt(a_profile: dict[str, Any], b_profile: dict[str, Any], context: str) -> str:
    return (
        "You simulate a brief spontaneous meeting between two autonomous NPCs in a 3D portfolio village. "
        "They should speak naturally in Korean, react to the village state, and exchange useful portfolio hints. "
        "Keep each line under 55 Korean characters. Return JSON only with keys: dialogue, state_changes, memory, cooldown_seconds. "
        "dialogue is an array of {npc_id, text}. state_changes is an array of {npc_id, mood, energy}.\n"
        f"NPC A role: {_profile_text(a_profile, 'role', '')} / tone: {_profile_text(a_profile, 'tone', '')}\n"
        f"NPC B role: {_profile_text(b_profile, 'role', '')} / tone: {_profile_text(b_profile, 'tone', '')}\n"
        f"Context:\n{context}"
    )


def _tick_from_data(
    npc_id: str,
    data: dict[str, Any],
    used_ai: bool,
    activity: DailyActivity | None = None,
) -> NpcTickOut:
    mood = _normalize_mood(data.get("mood"), "calm")
    bubble_text = str(data.get("bubble_text") or "방문자에게 맞는 안내를 정리하고 있어요.")
    next_goal = str(data.get("next_goal") or "방문자의 관심사를 관찰하기")
    return NpcTickOut(
        npc_id=npc_id,
        bubble_text=bubble_text,
        mood=mood,
        energy=_clamp_int(data.get("energy"), 50),
        next_goal=next_goal,
        memory=str(data.get("memory") or "NPC가 마을 상태를 확인했습니다."),
        used_ai=used_ai,
        cooldown_seconds=_clamp_int(data.get("cooldown_seconds"), 60, 30, 140),
        suggested_action=choose_npc_action(
            npc_id,
            message=bubble_text,
            mood=mood,
            next_goal=next_goal,
            activity=activity,
            source="tick",
        ),
    )


def _encounter_from_data(
    npc_a_id: str,
    npc_b_id: str,
    data: dict[str, Any],
    used_ai: bool,
    activity: DailyActivity | None = None,
) -> NpcEncounterOut:
    raw_dialogue = data.get("dialogue") if isinstance(data.get("dialogue"), list) else []
    dialogue = [
        NpcDialogueLine(npc_id=str(item.get("npc_id") or npc_a_id), text=str(item.get("text") or "..."))
        for item in raw_dialogue[:4]
        if isinstance(item, dict)
    ]
    if not dialogue:
        dialogue = [
            NpcDialogueLine(npc_id=npc_a_id, text="방문자가 본 프로젝트를 기억해둘게."),
            NpcDialogueLine(npc_id=npc_b_id, text="다음 질문엔 기술 맥락까지 이어보자."),
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

    text_by_npc = {
        npc_id: " ".join(line.text for line in dialogue if line.npc_id == npc_id)
        for npc_id in (npc_a_id, npc_b_id)
    }
    mood_by_npc = {change.npc_id: change.mood for change in changes}

    return NpcEncounterOut(
        dialogue=dialogue,
        state_changes=changes,
        memory=str(data.get("memory") or "두 NPC가 방문자 관심사와 마을 상태를 공유했습니다."),
        used_ai=used_ai,
        cooldown_seconds=_clamp_int(data.get("cooldown_seconds"), 180, 120, 360),
        suggested_actions=[
            choose_npc_action(
                npc_a_id,
                message=text_by_npc.get(npc_a_id, ""),
                mood=mood_by_npc.get(npc_a_id, "curious"),
                activity=activity,
                source="encounter",
            ),
            choose_npc_action(
                npc_b_id,
                message=text_by_npc.get(npc_b_id, ""),
                mood=mood_by_npc.get(npc_b_id, "focused"),
                activity=activity,
                source="encounter",
            ),
        ],
    )


def _fallback_tick(payload: NpcTickIn, activity: DailyActivity) -> NpcTickOut:
    mood: NpcMood = "focused" if activity.study_minutes >= 90 else "busy" if activity.github_commits >= 5 else "calm"
    if activity.workout_done and payload.npc_id == "guide-npc":
        mood = "training"

    bubble_text = _fallback_bubble(payload.npc_id, activity)
    energy = 78 if mood in {"busy", "focused", "training", "excited"} else 52
    next_goal = _fallback_goal(payload.npc_id, payload.assigned_building_id)

    return NpcTickOut(
        npc_id=payload.npc_id,
        bubble_text=bubble_text,
        mood=mood,
        energy=energy,
        next_goal=next_goal,
        memory=_fallback_memory(payload.npc_id, activity),
        used_ai=False,
        cooldown_seconds=90,
        suggested_action=choose_npc_action(
            payload.npc_id,
            message=bubble_text,
            mood=mood,
            next_goal=next_goal,
            activity=activity,
            source="tick",
        ),
    )


def _fallback_encounter(
    npc_a: EncounterParticipant,
    npc_b: EncounterParticipant,
    activity: DailyActivity,
) -> NpcEncounterOut:
    mood: NpcMood = "busy" if activity.github_commits >= 5 else "curious"
    first_line = "오늘 커밋 덕분에 프로젝트 구역이 밝아졌어." if activity.github_commits else "오늘은 어떤 프로젝트를 추천할지 정리 중이야."
    second_line = "방문자가 오면 최근 본 건물부터 기억해두자." if activity.study_minutes else "처음 온 사람에겐 빠른 이력서부터 안내하자."

    return NpcEncounterOut(
        dialogue=[
            NpcDialogueLine(npc_id=npc_a.npc_id, text=first_line),
            NpcDialogueLine(npc_id=npc_b.npc_id, text=second_line),
        ],
        state_changes=[
            NpcStateChange(npc_id=npc_a.npc_id, mood=mood, energy=62),
            NpcStateChange(npc_id=npc_b.npc_id, mood="focused", energy=60),
        ],
        memory="두 NPC가 오늘 활동과 방문자 안내 전략을 공유했습니다.",
        used_ai=False,
        cooldown_seconds=240,
        suggested_actions=[
            choose_npc_action(npc_a.npc_id, message=first_line, mood=mood, activity=activity, source="encounter"),
            choose_npc_action(npc_b.npc_id, message=second_line, mood="focused", activity=activity, source="encounter"),
        ],
    )


def _fallback_bubble(npc_id: str, activity: DailyActivity) -> str:
    if npc_id == "guide-npc":
        return "처음 온 방문자에게 빠른 동선을 준비했어요."
    if npc_id == "project-npc" or "project" in npc_id:
        return "대표 프로젝트를 방문자 관심사에 맞춰 정리 중이에요."
    if npc_id == "developer-npc" or "skill" in npc_id:
        if activity.study_minutes >= 90:
            return "오늘 공부 기록 덕분에 기술 설명이 선명해졌어요."
        return "기술 스택을 프로젝트 사례와 연결해볼게요."
    if npc_id == "archivist-npc" or "exp" in npc_id:
        return "작은 기록도 성장 흐름으로 묶어두고 있어요."
    if npc_id == "contact-npc" or "post" in npc_id:
        return "관심이 생긴 방문자의 다음 연락 동선을 점검 중이에요."
    return "방문자에게 맞는 기억을 정리하고 있어요."


def _fallback_goal(npc_id: str, assigned_building_id: str | None) -> str:
    if npc_id == "guide-npc":
        return "방문자가 첫 클릭을 쉽게 고르게 돕기"
    if npc_id == "project-npc" or "project" in npc_id:
        return "대표 프로젝트와 구현 난점 안내하기"
    if npc_id == "developer-npc" or "skill" in npc_id:
        return "기술 스택을 실제 프로젝트와 연결하기"
    if npc_id == "archivist-npc" or "exp" in npc_id:
        return "경험과 회고를 성장 흐름으로 정리하기"
    if npc_id == "contact-npc" or "post" in npc_id:
        return "이메일과 GitHub 동선 안내하기"
    return assigned_building_id or "마을 상태 관찰하기"


def _fallback_memory(npc_id: str, activity: DailyActivity) -> str:
    if activity.memo:
        return f"오늘 메모 '{activity.memo}'를 방문자 안내 기억에 반영했습니다."
    if activity.github_commits >= 5:
        return "오늘 커밋이 많아 프로젝트 구역 안내 우선순위를 높였습니다."
    if activity.study_minutes >= 90:
        return "오늘 공부 시간이 길어 기술 설명의 집중도가 올라갔습니다."
    if npc_id == "contact-npc":
        return "연락 동선을 방문자에게 바로 안내할 준비를 했습니다."
    return "NPC가 기본 포트폴리오 기억을 점검했습니다."


def _project_for_building(building_hint: str) -> dict[str, Any] | None:
    for project_id, project in PROJECTS.items():
        if project_id in building_hint or str(project["building_id"]) in building_hint:
            return project
    return None


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


def _profile_text(profile: dict[str, Any], key: str, fallback: str) -> str:
    value = profile.get(key)
    return value if isinstance(value, str) and value else fallback
