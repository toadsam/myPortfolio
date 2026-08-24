import json
import logging
from typing import Any

from app.catalog import NPCS, PROJECTS
from app.config import settings
from app.models import DailyActivity
from app.models import CodingTestLog, CsNoteLog
from app.schemas import (
    EncounterParticipant,
    NpcDialogueLine,
    NpcEncounterOut,
    NpcGroupChatOut,
    NpcMood,
    NpcRelationshipOut,
    NpcStateChange,
    NpcTickIn,
    NpcTickOut,
)
from app.services.chat_service import build_context
from app.services.npc_action_service import choose_npc_action
from app.services.relationship_rules import Outcome

logger = logging.getLogger("npc_brain")

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
        except Exception as exc:
            logger.warning("NPC tick OpenAI 호출 실패 → 폴백 사용 (model=%s): %r", settings.openai_npc_model, exc)

    return _fallback_tick(payload, activity)


async def generate_npc_encounter(
    npc_a: EncounterParticipant,
    npc_b: EncounterParticipant,
    recent_memory: list[str],
    activity: DailyActivity,
    outcome: Outcome,
    relation_context: str = "",
    memory_lines: list[str] | None = None,
) -> NpcEncounterOut:
    """두 NPC 의 마주침 대사.

    **결과(outcome)는 이미 정해져서 들어온다** (relationship_rules). 모델은 그 사건이
    드러나는 대사만 쓴다. 모델이 돌려주는 state_changes 도 outcome 의 기분으로 덮는다 —
    친밀도·기분의 권한은 규칙에 있고, 모델의 권한은 말투뿐이다.
    """
    a_profile = _npc_profile(npc_a.npc_id, npc_a.assigned_building_id)
    b_profile = _npc_profile(npc_b.npc_id, npc_b.assigned_building_id)
    context = build_context(npc_a.npc_id, activity, recent_memory, memory_lines=memory_lines)

    if settings.openai_api_key:
        try:
            data = await _call_json_model(
                system_prompt=_encounter_system_prompt(a_profile, b_profile, context, relation_context, outcome),
                user_prompt=json.dumps(
                    {
                        "npc_a": npc_a.model_dump(),
                        "npc_b": npc_b.model_dump(),
                        "recent_memory": recent_memory[-5:],
                        "happened": outcome.reason,
                    },
                    ensure_ascii=False,
                ),
                max_tokens=520,
            )
            return _encounter_from_data(npc_a.npc_id, npc_b.npc_id, data, used_ai=True, activity=activity, outcome=outcome)
        except Exception as exc:
            logger.warning("NPC encounter OpenAI 호출 실패 → 폴백 사용 (model=%s): %r", settings.openai_npc_model, exc)

    return _fallback_encounter(npc_a, npc_b, activity, outcome)


async def generate_group_chat(
    npc_ids: list[str],
    activity: DailyActivity,
    recent_memory: list[str],
    coding_tests: list[CodingTestLog] | None = None,
    cs_notes: list[CsNoteLog] | None = None,
) -> NpcGroupChatOut:
    ids = [npc_id for npc_id in npc_ids if npc_id][:6] or [
        "guide-npc",
        "project-npc",
        "developer-npc",
        "archivist-npc",
        "contact-npc",
    ]
    profiles = {npc_id: _npc_profile(npc_id) for npc_id in ids}
    context = build_context(ids[0], activity, recent_memory, coding_tests or [], cs_notes or [])

    if settings.openai_api_key:
        try:
            data = await _call_json_model(
                system_prompt=_group_system_prompt(profiles, context),
                user_prompt=json.dumps(
                    {"npc_ids": ids, "recent_memory": recent_memory[-5:]},
                    ensure_ascii=False,
                ),
                max_tokens=620,
            )
            return _group_from_data(ids, data, used_ai=True)
        except Exception as exc:
            logger.warning("NPC group-chat OpenAI 호출 실패 → 폴백 사용 (model=%s): %r", settings.openai_npc_model, exc)

    return _fallback_group(ids, activity)


def _group_system_prompt(profiles: dict[str, dict[str, Any]], context: str) -> str:
    roster = "\n".join(
        f"- npc_id={npc_id} / 이름={_profile_text(p, 'name', 'NPC')} / 역할={_profile_text(p, 'role', '')} / 말투={_profile_text(p, 'tone', '')}"
        for npc_id, p in profiles.items()
    )
    count = len(profiles)
    lines = min(max(count + 2, 6), 8)
    return (
        "정재훈의 3D 마을 캐릭터들이 광장에 둘러앉아 다 같이 나누는 짧고 자연스러운 한국어 단체 수다를 써라. "
        "이들은 포트폴리오 홍보원이 아니라 같이 사는 친구/동료다. 사람처럼, 감정적으로, 반말로 친근하게 말한다. "
        "주제는 대부분 일상·감정 잡담(오늘 기분, 피곤함, 방문객 구경, 사소한 농담, 먹을 것)이고, "
        "오늘 정재훈의 활동(커밋·공부·푼 코딩테스트·CS 공부)을 가끔 가볍게 언급해도 좋다 — 단 설명조 금지. "
        "진짜 단체 대화처럼: 각 줄은 바로 앞사람 말에 반응하고, 여러 캐릭터가 번갈아 끼어든다. "
        f"dialogue는 {lines}개 줄 안팎의 {{npc_id, text}} 객체 배열이고, 등장 캐릭터가 골고루 한 번 이상 말해야 한다. "
        "각 줄은 40자 이내. 아래 명단의 정확한 npc_id 값만 사용해라. "
        "JSON만 반환: 키는 dialogue, cooldown_seconds.\n"
        f"참여 캐릭터 명단:\n{roster}\n"
        f"마을 상황(필요할 때만 슬쩍 참고):\n{context}"
    )


def _group_from_data(ids: list[str], data: dict[str, Any], used_ai: bool) -> NpcGroupChatOut:
    id_set = set(ids)
    raw = data.get("dialogue") if isinstance(data.get("dialogue"), list) else []
    dialogue: list[NpcDialogueLine] = []
    for item in raw[:8]:
        if not isinstance(item, dict):
            continue
        npc_id = str(item.get("npc_id") or "")
        if npc_id not in id_set:
            npc_id = ids[len(dialogue) % len(ids)]
        text = str(item.get("text") or "").strip()
        if text:
            dialogue.append(NpcDialogueLine(npc_id=npc_id, text=text))

    if not dialogue:
        return _fallback_group(ids, None)

    return NpcGroupChatOut(
        dialogue=dialogue,
        used_ai=used_ai,
        cooldown_seconds=_clamp_int(data.get("cooldown_seconds"), 180, 90, 360),
    )


def _fallback_group(ids: list[str], activity: DailyActivity | None) -> NpcGroupChatOut:
    name = {npc_id: _profile_text(_npc_profile(npc_id), "name", "NPC") for npc_id in ids}
    pool = [
        "다들 모여라~ 오랜만에 한자리네.",
        "오늘 방문객 좀 있었어? 난 종일 한산했어.",
        "재훈님 오늘도 뭔가 만들고 계시던데.",
        "그러게, 커밋 올라오는 거 보면 바쁘신가 봐.",
        "난 잠깐 쉬고 싶다… 다리 아파.",
        "에이, 우리 로봇인데 다리가 어딨어.",
        "그래도 이렇게 다 같이 노는 거 좋다!",
        "맞아, 가끔은 이런 시간도 필요하지.",
    ]
    dialogue = [
        NpcDialogueLine(npc_id=ids[i % len(ids)], text=pool[i])
        for i in range(min(len(pool), max(len(ids) + 2, 6)))
    ]
    # 이름 기반 살짝 개인화(첫 줄)
    if dialogue:
        dialogue[0] = NpcDialogueLine(npc_id=ids[0], text=f"{name.get(ids[-1], '얘들아')}, 다들 모여라~ 오랜만이네!")
    return NpcGroupChatOut(dialogue=dialogue, used_ai=False, cooldown_seconds=240)


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
        "정재훈의 살아있는 3D 마을에 사는 캐릭터의 속마음을 짧게 한 줄 쓴다. "
        "지금 mood(감정)를 강하게 반영해 사람처럼 혼잣말한다. "
        "대부분 일상·기분 잡담(피곤, 오늘 기분, 날씨, 방문객 구경, 배고픔, 사소한 생각)이고, "
        "자기 역할/일 얘기는 가끔 가볍게만 — 설명조 금지. 반말로 친근하게. "
        "거짓 사실(없는 프로젝트 등)은 지어내지 마라. "
        "bubble_text는 50자 이내. JSON만 반환, 키: "
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
            "tone": "프로젝트의 문제, 구현 시점, 채용자 관점 가치를 짧고 구체적으로 말합니다.",
            "scope": f"{project['title']}, 사용 기술, 구현 난점, 관련 프로젝트 추천",
            "personality": "방문자가 어떤 프로젝트를 봤는지 기억하려고 하는 관찰형 안내자입니다.",
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
    if "life" in building_hint:
        return NPCS["life-npc"]
    return NPCS["guide-npc"]


def _encounter_system_prompt(
    a_profile: dict[str, Any],
    b_profile: dict[str, Any],
    context: str,
    relation: str = "",
    outcome: Outcome | None = None,
) -> str:
    relation_line = f"{relation}\n" if relation else ""
    happened = ""
    if outcome is not None:
        happened = (
            f"이번 만남에서 실제로 일어난 일(이미 정해짐, 바꾸지 마라): {outcome.reason} "
            f"(둘 사이 {outcome.delta:+d}). 대사 네 줄 안에서 이 일이 자연스럽게 드러나야 한다 — "
            "설명하지 말고 겪는 것처럼. 나쁜 일이면 정말 삐치거나 쏘아붙이고, 좋은 일이면 정말 고마워하거나 좋아해라.\n"
        )
    return (
        "두 캐릭터가 아담한 3D 마을에서 우연히 마주쳐 나누는 짧고 자연스러운 한국어 수다를 써라. "
        "이들은 포트폴리오를 홍보하는 안내원이 아니라, 그냥 같이 사는 친구/동료다. 사람처럼, 감정적으로 말한다. "
        "각 캐릭터의 말투는 user JSON의 'mood' 값을 강하게 반영해야 한다 "
        "(sleepy=나른하게, busy=정신없이, excited=들떠서, worried=걱정스럽게, proud=으쓱하며, calm=느긋하게, "
        "curious=호기심 가득, focused=진지하게, training=기운차게). "
        "내용은 대부분 일상·감정 잡담이다: 오늘 기분, 피곤함, 날씨, 방문객 구경, 사소한 농담, 먹을 것, 어제 있었던 일 등. "
        "역할/일 얘기는 최대 한 번만, 그것도 가볍게 흘리듯이 — 절대 설명조로 늘어놓지 마라. "
        "진짜 주고받기: 각 줄은 상대가 '방금' 한 말에 직접 반응해야 한다 (맞장구·되묻기·농담 받기·티격태격). "
        "반말로 친근하게, 각 줄은 40자 이내, 실제 채팅처럼 자연스럽게. "
        "dialogue는 정확히 4개의 {npc_id, text} 객체, A, B, A, B 순서. user message의 정확한 npc_id 값을 써라. "
        "JSON만 반환: 키는 dialogue, memory, cooldown_seconds. memory 는 이 만남을 한 문장으로.\n"
        f"{happened}"
        f"{relation_line}"
        f"캐릭터 A — 역할 힌트: {_profile_text(a_profile, 'role', '')} / 평소 말투: {_profile_text(a_profile, 'tone', '')}\n"
        f"캐릭터 B — 역할 힌트: {_profile_text(b_profile, 'role', '')} / 평소 말투: {_profile_text(b_profile, 'tone', '')}\n"
        f"마을 상황(필요할 때만 슬쩍 참고):\n{context}"
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
    outcome: Outcome | None = None,
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
            NpcDialogueLine(npc_id=npc_b_id, text="다음 질문은 기술 맥락까지 이어보자."),
        ]

    # 기분은 규칙(outcome)이 정한다. 모델이 state_changes 를 보내도 무시한다 —
    # 싸운 직후에 모델이 "excited" 를 보내는 일이 실제로 있었다.
    if outcome is not None:
        changes = _outcome_changes(npc_a_id, npc_b_id, outcome)
    else:
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

    # 친밀도 변화는 규칙이 정한 값만. 모델이 relationship 을 보내도 읽지 않는다.
    relationship = (
        NpcRelationshipOut(delta=outcome.delta, event=outcome.reason)
        if outcome is not None
        else NpcRelationshipOut(delta=0)
    )

    return NpcEncounterOut(
        dialogue=dialogue,
        state_changes=changes,
        memory=str(data.get("memory") or "두 NPC가 방문자 관심사와 마을 상태를 공유했습니다."),
        used_ai=used_ai,
        cooldown_seconds=_clamp_int(data.get("cooldown_seconds"), 180, 120, 360),
        relationship=relationship,
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


def _outcome_changes(npc_a_id: str, npc_b_id: str, outcome: Outcome) -> list[NpcStateChange]:
    energy = 40 if outcome.delta < 0 else 66 if outcome.delta > 0 else 55
    return [
        NpcStateChange(npc_id=npc_a_id, mood=_normalize_mood(outcome.mood_a, "calm"), energy=energy),
        NpcStateChange(npc_id=npc_b_id, mood=_normalize_mood(outcome.mood_b, "calm"), energy=energy),
    ]


# AI 없이 쓰는 대사 풀 — outcome.kind 별. 규칙이 정한 결과가 폴백에서도 보여야
# "AI 가 꺼져도 관계가 굴러간다"가 말이 된다. {reason} 은 outcome.reason 으로 치환.
_FALLBACK_LINES: dict[str, list[list[str]]] = {
    "bond": [
        ["오, 딱 보고 싶었는데!", "나도! 오늘 기분 좋다.", "그치, {reason}.", "이런 날은 같이 걸어야지."],
        ["요즘 어때?", "좋아. 너 덕분에 더 좋아.", "뭐야 갑자기 ㅋㅋ", "{reason}잖아. 고마워서."],
        ["어제 그 얘기 계속 생각나더라.", "나도. 웃겼지.", "{reason}. 이런 게 좋아.", "다음엔 광장에서 보자."],
        ["간식 먹을래? 남았는데.", "오, 웬일이야.", "{reason}거든. 기분이다.", "잘 먹을게. 다음엔 내가 살게."],
        ["너 요즘 얼굴 좋아 보인다?", "그래 보여? 실제로 좋아.", "{reason}.", "부럽다~ 나도 옮았으면."],
    ],
    "clash": [
        ["…야, 지금 좀 그래.", "뭐가? 나도 바빠.", "{reason}.", "알았어, 나중에 얘기해."],
        ["아까 그거 말인데.", "또 그 얘기야?", "{reason}. 기분 별로였어.", "…미안. 근데 나도 힘들었어."],
        ["할 말 있으면 해.", "…없어.", "{reason}. 그래서 그래?", "몰라. 좀 내버려 둬."],
        ["요즘 왜 피해 다녀?", "피하긴 누가.", "{reason}잖아.", "…그건 인정. 근데 지금은 아니야."],
        ["안녕이라도 하자.", "…안녕.", "{reason}. 서운했어.", "나도 할 말은 있는데, 다음에."],
    ],
    "incident": [
        ["너 진짜…", "왜, 왜 그래?", "{reason}.", "아… 그건 내가 잘못했네."],
        ["잠깐 얘기 좀.", "응, 무슨 일인데?", "{reason}.", "헉, 그랬어? 고마워… 아니, 미안해…"],
        ["방금 그거 봤어?", "뭘?", "{reason}.", "어떡해, 들켰네."],
        ["할 얘기가 있어. 앉아 봐.", "갑자기? 무서운데.", "{reason}.", "…이건 좀 짚고 넘어가자."],
        ["소문 들었는데.", "무슨 소문?", "{reason}래.", "누가 그런 얘길… 아니 사실이긴 한데."],
    ],
    "neutral": [
        ["어, 안녕!", "오 왔네. 밥은?", "먹었지. 너는?", "나도. 이따 또 봐~"],
        ["오늘 방문객 좀 있었어?", "조용했어. 너 쪽은?", "비슷해. 날씨 좋더라.", "그러게, 산책이나 할까."],
        ["분수대 물소리 좋다.", "맞아, 밤엔 더 좋아.", "가끔 멍하니 듣게 돼.", "그럴 땐 옆에 껴 줘."],
        ["요즘 별일 없지?", "응, 평화로워.", "그게 제일이지.", "맞아. 무소식이 희소식."],
        ["가로등 하나 깜빡이던데.", "어느 쪽? 광장?", "다리 건너 쪽.", "이따 봐 둘게. 고마워."],
    ],
}


def _fallback_encounter(
    npc_a: EncounterParticipant,
    npc_b: EncounterParticipant,
    activity: DailyActivity,
    outcome: Outcome,
) -> NpcEncounterOut:
    pool = _FALLBACK_LINES.get(outcome.kind) or _FALLBACK_LINES["neutral"]
    script = pool[(abs(hash((npc_a.npc_id, npc_b.npc_id, outcome.reason))) % len(pool))]
    texts = [line.replace("{reason}", outcome.reason) for line in script]
    ids = [npc_a.npc_id, npc_b.npc_id, npc_a.npc_id, npc_b.npc_id]
    changes = _outcome_changes(npc_a.npc_id, npc_b.npc_id, outcome)

    return NpcEncounterOut(
        dialogue=[NpcDialogueLine(npc_id=i, text=t) for i, t in zip(ids, texts)],
        state_changes=changes,
        memory=f"{outcome.reason}.",
        used_ai=False,
        cooldown_seconds=240,
        relationship=NpcRelationshipOut(delta=outcome.delta, event=outcome.reason),
        suggested_actions=[
            choose_npc_action(npc_a.npc_id, message=texts[0], mood=changes[0].mood, activity=activity, source="encounter"),
            choose_npc_action(npc_b.npc_id, message=texts[1], mood=changes[1].mood, activity=activity, source="encounter"),
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
        return "작은 기록을 성장 흐름으로 묶어보고 있어요."
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
