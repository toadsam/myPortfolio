from typing import Any, Literal

from app.catalog import NPCS
from app.models import DailyActivity
from app.schemas import NpcActionOut, NpcMood

ActionSource = Literal["chat", "tick", "encounter", "manual"]


ACTION_DEFINITIONS: dict[str, list[dict[str, Any]]] = {
    "guide-npc": [
        {
            "action_id": "welcome-visitor",
            "label": "방문자 환영",
            "description": "처음 온 방문자에게 마을의 첫 동선을 안내합니다.",
            "keywords": ["처음", "시작", "안내", "어디", "intro"],
            "moods": ["calm", "proud", "training"],
            "animation_key": "wave",
            "target_id": "central-plaza",
            "duration_ms": 4200,
        },
        {
            "action_id": "recommend-route",
            "label": "다음 목적지 추천",
            "description": "방문자의 목적에 맞춰 다음에 볼 구역을 추천합니다.",
            "keywords": ["추천", "동선", "다음", "빠르게", "순서"],
            "moods": ["curious", "focused"],
            "animation_key": "point",
            "target_id": "project-mywave",
            "duration_ms": 4400,
        },
        {
            "action_id": "celebrate-activity",
            "label": "오늘 활동 축하",
            "description": "오늘 기록을 보고 마을 전체 상태를 활기차게 소개합니다.",
            "keywords": ["오늘", "활동", "운동", "상태", "기록"],
            "moods": ["training", "proud", "excited"],
            "animation_key": "wave",
            "target_id": "central-plaza",
            "duration_ms": 4200,
        },
    ],
    "project-npc": [
        {
            "action_id": "recommend-projects",
            "label": "대표 프로젝트 추천",
            "description": "방문자에게 대표 프로젝트 3개를 추천합니다.",
            "keywords": ["대표", "추천", "프로젝트", "best", "채용자"],
            "moods": ["excited", "focused", "busy"],
            "animation_key": "point",
            "target_id": "project-mywave",
            "duration_ms": 4600,
        },
        {
            "action_id": "point-project-building",
            "label": "프로젝트 건물 가리키기",
            "description": "관심 있는 프로젝트 건물을 가리키는 행동입니다.",
            "keywords": ["mywave", "festflow", "건물", "상세", "클릭"],
            "moods": ["curious", "excited"],
            "animation_key": "point",
            "target_id": "project-mywave",
            "duration_ms": 4300,
        },
        {
            "action_id": "prepare-exhibition",
            "label": "전시 자료 정리",
            "description": "프로젝트 전시 내용을 정리하는 행동입니다.",
            "keywords": ["전시", "정리", "커밋", "구현", "결과"],
            "moods": ["busy", "focused"],
            "animation_key": "open-hologram",
            "target_id": "project-festflow",
            "duration_ms": 5200,
        },
    ],
    "developer-npc": [
        {
            "action_id": "analyze-tech-stack",
            "label": "기술 스택 분석",
            "description": "기술 스택을 프로젝트 사례와 연결해 분석합니다.",
            "keywords": ["기술", "스택", "분석", "아키텍처", "구조"],
            "moods": ["focused", "excited"],
            "animation_key": "think",
            "target_id": "skill-backend",
            "duration_ms": 5000,
        },
        {
            "action_id": "prepare-architecture-board",
            "label": "아키텍처 보드 준비",
            "description": "서비스 구조와 데이터 흐름을 설명할 보드를 준비합니다.",
            "keywords": ["구조", "흐름", "백엔드", "api", "설계"],
            "moods": ["focused", "busy"],
            "animation_key": "open-hologram",
            "target_id": "skill-backend",
            "duration_ms": 5200,
        },
        {
            "action_id": "explain-code-flow",
            "label": "코드 흐름 정리",
            "description": "구현 흐름을 단계별로 설명할 준비를 합니다.",
            "keywords": ["코드", "구현", "흐름", "개발", "로직"],
            "moods": ["focused"],
            "animation_key": "type",
            "target_id": "skill-frontend",
            "duration_ms": 4800,
        },
    ],
    "archivist-npc": [
        {
            "action_id": "summarize-daily-log",
            "label": "오늘 기록 정리",
            "description": "오늘의 공부, 커밋, 메모를 성장 기록으로 정리합니다.",
            "keywords": ["오늘", "기록", "메모", "성장", "회고"],
            "moods": ["curious", "focused"],
            "animation_key": "type",
            "target_id": "exp-portfolio",
            "duration_ms": 4600,
        },
        {
            "action_id": "read-growth-log",
            "label": "성장 로그 읽기",
            "description": "프로젝트 경험과 회고를 연결해서 읽어줍니다.",
            "keywords": ["회고", "경험", "배운", "협업", "성장"],
            "moods": ["calm", "curious"],
            "animation_key": "think",
            "target_id": "exp-portfolio",
            "duration_ms": 4700,
        },
        {
            "action_id": "archive-reflection",
            "label": "회고 보관",
            "description": "방문자의 질문을 성장 기록의 단서로 보관합니다.",
            "keywords": ["보관", "정리", "기억", "질문"],
            "moods": ["focused"],
            "animation_key": "type",
            "target_id": "exp-demo-platform",
            "duration_ms": 4300,
        },
    ],
    "contact-npc": [
        {
            "action_id": "share-contact",
            "label": "연락처 안내",
            "description": "이메일과 연락 동선을 안내합니다.",
            "keywords": ["연락", "메일", "문의", "contact", "이메일"],
            "moods": ["calm", "proud"],
            "animation_key": "send",
            "target_id": "post-office",
            "duration_ms": 4200,
        },
        {
            "action_id": "deliver-github-link",
            "label": "GitHub 링크 전달",
            "description": "GitHub 링크를 방문자에게 전달합니다.",
            "keywords": ["github", "깃허브", "코드", "링크", "저장소"],
            "moods": ["calm", "focused"],
            "animation_key": "send",
            "target_id": "post-office",
            "duration_ms": 4200,
        },
        {
            "action_id": "organize-collaboration-inquiry",
            "label": "협업 문의 정리",
            "description": "협업이나 채용 문의에 필요한 정보를 정리합니다.",
            "keywords": ["협업", "채용", "인터뷰", "지원", "문의"],
            "moods": ["focused", "proud"],
            "animation_key": "type",
            "target_id": "post-office",
            "duration_ms": 4700,
        },
    ],
}


def choose_npc_action(
    npc_id: str,
    message: str = "",
    mood: NpcMood | str = "calm",
    next_goal: str = "",
    activity: DailyActivity | None = None,
    source: ActionSource = "chat",
) -> NpcActionOut:
    canonical_id = _canonical_npc_id(npc_id)
    actions = ACTION_DEFINITIONS[canonical_id]
    haystack = f"{message} {next_goal}".lower()

    for action in actions:
        if any(str(keyword).lower() in haystack for keyword in action["keywords"]):
            return _to_action_out(npc_id, action, source)

    if activity:
        activity_action = _action_from_activity(canonical_id, activity)
        if activity_action:
            return _to_action_out(npc_id, activity_action, source)

    for action in actions:
        if mood in action["moods"]:
            return _to_action_out(npc_id, action, source)

    return _to_action_out(npc_id, actions[0], source)


def _action_from_activity(canonical_id: str, activity: DailyActivity) -> dict[str, Any] | None:
    if canonical_id == "guide-npc" and activity.workout_done:
        return _find_action(canonical_id, "celebrate-activity")
    if canonical_id == "project-npc" and activity.github_commits >= 5:
        return _find_action(canonical_id, "prepare-exhibition")
    if canonical_id == "developer-npc" and activity.study_minutes >= 90:
        return _find_action(canonical_id, "analyze-tech-stack")
    if canonical_id == "archivist-npc" and activity.memo.strip():
        return _find_action(canonical_id, "summarize-daily-log")
    return None


def _find_action(canonical_id: str, action_id: str) -> dict[str, Any] | None:
    return next((action for action in ACTION_DEFINITIONS[canonical_id] if action["action_id"] == action_id), None)


def _to_action_out(npc_id: str, action: dict[str, Any], source: ActionSource) -> NpcActionOut:
    name = NPCS.get(_canonical_npc_id(npc_id), {}).get("name", _fallback_npc_name(npc_id))
    label = str(action["label"])
    return NpcActionOut(
        npc_id=npc_id,
        action_id=str(action["action_id"]),
        label=label,
        description=str(action["description"]),
        status_text=f"{name}가 {label} 행동을 실행합니다.",
        animation_key=action["animation_key"],
        duration_ms=int(action["duration_ms"]),
        target_id=action.get("target_id"),
        source=source,
    )


def _canonical_npc_id(npc_id: str) -> str:
    if npc_id in ACTION_DEFINITIONS:
        return npc_id
    if "skill" in npc_id or "backend" in npc_id or "frontend" in npc_id:
        return "developer-npc"
    if "exp" in npc_id:
        return "archivist-npc"
    if "post" in npc_id or "contact" in npc_id:
        return "contact-npc"
    if "project" in npc_id:
        return "project-npc"
    return "guide-npc"


def _fallback_npc_name(npc_id: str) -> str:
    if "project" in npc_id:
        return "프로젝트 안내원"
    if "skill" in npc_id:
        return "기술 안내원"
    if "exp" in npc_id:
        return "기록 안내원"
    if "post" in npc_id or "contact" in npc_id:
        return "연락 안내원"
    return "NPC"
