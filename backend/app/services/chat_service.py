import re
from typing import Any

from app.catalog import NPCS, PROJECTS
from app.config import settings
from app.models import DailyActivity
from app.schemas import NpcActionOut
from app.services.npc_action_service import choose_npc_action


async def answer_npc_message(
    npc_id: str,
    message: str,
    activity: DailyActivity,
    recent_messages: list[str] | None = None,
) -> tuple[str, bool, NpcActionOut]:
    npc = NPCS.get(npc_id, _npc_profile_for_dynamic_id(npc_id))
    context = build_context(npc_id, activity, recent_messages or [])
    suggested_action = choose_npc_action(npc_id, message=message, activity=activity, source="chat")

    if settings.openai_api_key:
        try:
            return await answer_with_openai(npc, context, message), True, suggested_action
        except Exception:
            return answer_without_ai(npc_id, message, activity), False, suggested_action

    return answer_without_ai(npc_id, message, activity), False, suggested_action


def build_context(npc_id: str, activity: DailyActivity, recent_messages: list[str] | None = None) -> str:
    npc = NPCS.get(npc_id, _npc_profile_for_dynamic_id(npc_id))
    project_lines = [
        (
            f"- {project['title']}: {project['summary']} "
            f"역할: {project['role']} "
            f"기술: {', '.join(project['tech'])} "
            f"핵심 난점: {project['hard_part']} "
            f"채용자 관점 가치: {project.get('recruiter_value', '')}"
        )
        for project in PROJECTS.values()
    ]
    recent = "\n".join(f"- {item}" for item in (recent_messages or [])[-8:]) or "- 없음"
    workout = "완료" if activity.workout_done else "미완료"

    return "\n".join(
        [
            f"NPC ID: {npc_id}",
            f"NPC 이름: {_profile_text(npc, 'name', 'NPC')}",
            f"NPC 역할: {_profile_text(npc, 'role', '')}",
            f"성격: {_profile_text(npc, 'personality', '')}",
            f"감정 경향: {_profile_text(npc, 'emotional_bias', '')}",
            f"기억 초점: {_profile_text(npc, 'memory_focus', '')}",
            f"현재 목표: {_profile_text(npc, 'goal', '')}",
            f"오늘 GitHub 커밋: {activity.github_commits}개",
            f"오늘 공부 시간: {activity.study_minutes}분",
            f"운동 기록: {workout}",
            f"오늘 메모: {activity.memo or '없음'}",
            "최근 대화:",
            recent,
            "프로젝트 지식 베이스:",
            *project_lines,
        ]
    )


async def answer_with_openai(npc: dict[str, Any], context: str, message: str) -> str:
    import httpx

    system_prompt = (
        "너는 정재훈의 살아있는 3D 포트폴리오 마을에 사는 AI NPC다. "
        "감정과 기억이 있는 것처럼 행동하되, 사실은 제공된 포트폴리오 데이터와 최근 대화만 근거로 말한다. "
        "모르는 내용은 지어내지 말고 확인 가능한 범위에서 답한다. "
        "방문자가 채용자라면 강점, 대표 프로젝트, 기술 판단, 협업 가능성을 명확하게 정리한다. "
        "답변은 한국어로 3~7문장, 필요하면 짧은 목록으로 답한다. "
        "브라우저 대화창에 그대로 표시되므로 과한 마크다운, 제목 문법, 코드블록은 쓰지 않는다. "
        "NPC의 성격, 감정 경향, 현재 목표를 말투에 반영한다.\n"
        f"NPC 역할: {_profile_text(npc, 'role', '')}\n"
        f"말투: {_profile_text(npc, 'tone', '')}\n"
        f"응답 범위: {_profile_text(npc, 'scope', '')}\n"
        f"컨텍스트:\n{context}"
    )

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                "temperature": 0.65,
                "max_tokens": 650,
            },
        )
        response.raise_for_status()
        data = response.json()
        return _clean_response_text(data["choices"][0]["message"]["content"])


def answer_without_ai(npc_id: str, message: str, activity: DailyActivity) -> str:
    project = _project_for_npc_or_message(npc_id, message)

    if _contains(message, ["대표", "추천", "best", "main", "채용자"]):
        return (
            "채용자에게 먼저 보여줄 대표 프로젝트는 MyWave, FestFlow, 근근 MuscleUp 순서가 좋아요. "
            "MyWave는 문제 정의와 정보 구조화가 잘 보이고, FestFlow는 실시간 운영 UX와 권한 분리가 드러나요. "
            "근근 MuscleUp은 인증, SSE, 커뮤니티, AI 분석을 하나의 풀스택 흐름으로 묶은 점이 강합니다."
        )

    if _contains(message, ["강점", "요약", "strength", "장점"]):
        return (
            "정재훈의 강점은 세 가지로 정리할 수 있어요. "
            "첫째, 기능 목록보다 사용자의 흐름을 먼저 잡고 화면 구조로 풀어냅니다. "
            "둘째, React/TypeScript 프론트엔드와 Spring Boot/FastAPI 백엔드를 함께 다뤄 실제 서비스 흐름을 만들 수 있습니다. "
            "셋째, Three.js와 Unity 경험이 있어 포트폴리오 자체를 3D 인터랙션으로 표현할 만큼 시각 구현 감각이 있습니다."
        )

    if project:
        return _project_answer(project)

    if _contains(message, ["기술", "스택", "stack", "개발", "아키텍처", "구조"]):
        return (
            "주요 기술은 React, TypeScript, Next.js, Three.js/R3F, FastAPI, Spring Boot, Unity/C#입니다. "
            "프론트엔드는 화면 상태와 사용자 흐름을 설계하는 쪽이 강하고, 백엔드는 인증, API, 실시간 SSE 같은 서비스 기능 연결 경험이 있습니다. "
            "이 포트폴리오 마을도 Next.js 화면, Three.js 3D 월드, FastAPI 라이브 상태, NPC 대화 API가 함께 연결된 구조예요."
        )

    if _contains(message, ["협업", "팀", "소통", "역할", "collaboration"]):
        return (
            "협업에서는 역할을 화면 단위와 데이터 흐름 단위로 나누는 편이에요. "
            "ACLUB, 아주총학, FestFlow 같은 프로젝트에서 사용자 흐름, 권한, 배포 구조를 나눠 생각했고, "
            "Unity 프로젝트에서는 충돌을 줄이기 위해 기능 단위로 작업 범위를 분리한 경험이 있습니다."
        )

    if _contains(message, ["오늘", "상태", "활동", "today", "커밋", "공부", "운동"]):
        workout = "운동까지 완료되어 마을 분위기가 더 활기차요" if activity.workout_done else "운동 기록은 아직 없어 광장 에너지는 차분해요"
        memo = f" 오늘 메모는 '{activity.memo}'입니다." if activity.memo else ""
        return (
            f"오늘 기록은 GitHub 커밋 {activity.github_commits}개, 공부 {activity.study_minutes}분이에요. "
            f"{workout}.{memo} 이 값은 건물 조명, NPC 기분, 잠금 장식에 반영되어 방문자가 현재 컨디션을 볼 수 있게 설계되어 있어요."
        )

    if _contains(message, ["연락", "메일", "github", "contact", "채용", "문의"]):
        return (
            "연락은 toadsam@naver.com 으로 보낼 수 있고, GitHub는 https://github.com/toadsam 입니다. "
            "채용자 관점에서는 MyWave, FestFlow, 근근 MuscleUp을 먼저 본 뒤 기술 질문은 테오에게 이어서 물어보는 흐름이 가장 빠릅니다."
        )

    if npc_id == "developer-npc" or "skill" in npc_id:
        return (
            "기술 질문이라면 프로젝트와 연결해서 보는 게 좋아요. "
            "MyWave는 React/TypeScript 기반 정보 구조화, FestFlow는 Spring Boot와 SSE 실시간 흐름, "
            "이 포트폴리오는 Next.js와 Three.js/FastAPI 연결 경험을 보여줍니다."
        )

    if npc_id == "archivist-npc" or "exp" in npc_id:
        return (
            "기록 관점에서 보면 정재훈은 결과만 남기는 타입보다 문제, 접근, 기여, 배운 점을 같이 묶는 타입이에요. "
            "그 흐름이 프로젝트 상세 페이지와 오늘의 마을 상태에 함께 반영되어 있습니다."
        )

    if npc_id == "contact-npc" or "post" in npc_id:
        return (
            "다음 행동은 간단해요. 코드를 보고 싶다면 github.com/toadsam, 직접 연락하려면 toadsam@naver.com 으로 이어가면 됩니다. "
            "관심 프로젝트를 함께 적어주면 대화가 더 빠르게 이어질 거예요."
        )

    return (
        "이 마을은 정재훈의 프로젝트, 기술, 경험, 오늘 활동을 하나의 3D 공간으로 묶은 포트폴리오예요. "
        "처음이라면 빠른 이력서로 전체를 훑고, 그다음 MyWave나 FestFlow 건물에 들어가 상세 전시를 보는 흐름을 추천해요."
    )


def _project_answer(project: dict[str, Any]) -> str:
    tech = ", ".join(project["tech"])
    return (
        f"{project['title']}는 {project['summary']} "
        f"정재훈의 역할은 {project['role']}였고, 핵심 난점은 {project['hard_part']} "
        f"사용 기술은 {tech}입니다. 채용자 관점에서는 {project.get('recruiter_value', '구현 경험을 확인하기 좋은 프로젝트입니다.')}"
    )


def _project_for_npc_or_message(npc_id: str, message: str) -> dict[str, Any] | None:
    normalized = message.lower().replace(" ", "")
    for project_id, project in PROJECTS.items():
        title = str(project["title"]).lower().replace(" ", "")
        building_id = str(project["building_id"])
        if project_id in npc_id or building_id in npc_id or project_id in normalized or title in normalized:
            return project
    return None


def _contains(message: str, tokens: list[str]) -> bool:
    lowered = message.lower()
    return any(token.lower() in lowered or token in message for token in tokens)


def _profile_text(profile: dict[str, Any], key: str, fallback: str) -> str:
    value = profile.get(key)
    return value if isinstance(value, str) and value else fallback


def _clean_response_text(text: str) -> str:
    cleaned = text.strip()
    cleaned = cleaned.replace("**", "").replace("__", "")
    cleaned = re.sub(r"^#{1,6}\s*", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"^\s*[-*]\s+", "- ", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def _npc_profile_for_dynamic_id(npc_id: str) -> dict[str, Any]:
    if "skill" in npc_id or "backend" in npc_id or "frontend" in npc_id:
        return NPCS["developer-npc"]
    if "exp" in npc_id:
        return NPCS["archivist-npc"]
    if "post" in npc_id or "contact" in npc_id:
        return NPCS["contact-npc"]
    if "project" in npc_id:
        return NPCS["project-npc"]
    return NPCS["guide-npc"]
