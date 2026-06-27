from app.catalog import NPCS, PROJECTS
from app.config import settings
from app.models import DailyActivity


async def answer_npc_message(
    npc_id: str,
    message: str,
    activity: DailyActivity,
    recent_messages: list[str] | None = None,
) -> tuple[str, bool]:
    npc = NPCS.get(npc_id, _npc_profile_for_dynamic_id(npc_id))
    context = build_context(npc_id, activity, recent_messages or [])

    if settings.openai_api_key:
        try:
            return await answer_with_openai(npc, context, message), True
        except Exception:
            return answer_without_ai(npc_id, message, activity), False

    return answer_without_ai(npc_id, message, activity), False


def build_context(npc_id: str, activity: DailyActivity, recent_messages: list[str] | None = None) -> str:
    project_lines = [
        (
            f"- {project['title']}: {project['summary']} "
            f"역할: {project['role']} "
            f"기술: {', '.join(project['tech'])} "
            f"난점: {project['hard_part']}"
        )
        for project in PROJECTS.values()
    ]
    recent = "\n".join(f"- {item}" for item in (recent_messages or [])[-8:]) or "- 없음"
    return "\n".join([
        f"NPC ID: {npc_id}",
        f"오늘 커밋: {activity.github_commits}개",
        f"오늘 공부: {activity.study_minutes}분",
        f"운동 완료: {'예' if activity.workout_done else '아니오'}",
        f"오늘 메모: {activity.memo or '없음'}",
        "최근 대화:",
        recent,
        "프로젝트 정보:",
        *project_lines,
    ])


async def answer_with_openai(npc: dict[str, str], context: str, message: str) -> str:
    import httpx

    system_prompt = (
        "너는 정재훈의 3D 포트폴리오 마을에 사는 AI NPC다. "
        "방문자의 질문에 한국어로 답하고, 제공된 프로젝트/기술/활동 데이터만 근거로 사용한다. "
        "모르는 내용은 지어내지 말고 확인 가능한 범위에서 답한다. "
        "채용자 관점의 질문에는 강점, 대표 프로젝트, 협업 가능성을 간결하게 정리한다.\n"
        f"NPC 역할: {npc['role']}\n"
        f"말투: {npc['tone']}\n"
        f"답변 범위: {npc['scope']}\n"
        f"현재 컨텍스트:\n{context}"
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
                "temperature": 0.6,
                "max_tokens": 500,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


def answer_without_ai(npc_id: str, message: str, activity: DailyActivity) -> str:
    lowered = message.lower()

    if _contains(message, ["대표", "추천", "best", "main"]):
        return (
            "대표 프로젝트로는 FestFlow, 득근득근, MyStock-Desk를 추천할 수 있습니다. "
            "FestFlow는 실시간 SSE와 운영자 권한 설계가 강하고, 득근득근은 운동 기록/커뮤니티/AI 분석을 풀스택으로 묶은 프로젝트입니다. "
            "MyStock-Desk는 금융 도메인 데이터를 구조화하고 AI 체크리스트로 신뢰 경계를 잡은 점이 좋습니다."
        )

    if _contains(message, ["강점", "요약", "strength", "장점"]):
        return (
            "강점은 세 가지입니다. 첫째, React/TypeScript 기반 UI를 실제 사용자 흐름에 맞게 설계합니다. "
            "둘째, Spring Boot/FastAPI 백엔드와 실시간 데이터 흐름까지 함께 다룹니다. "
            "셋째, Unity와 Three.js 경험이 있어 웹과 3D/게임 인터랙션을 연결할 수 있습니다."
        )

    if npc_id == "project-npc" or _contains(message, ["프로젝트", "난점", "어려", "구현"]):
        featured = [PROJECTS["festflow"], PROJECTS["muscleup"], PROJECTS["mystock"]]
        lines = " ".join(f"{item['title']}는 {item['hard_part']}" for item in featured)
        return f"프로젝트 구현 난점을 묻는다면 이 세 가지가 핵심입니다. {lines}"

    if npc_id == "developer-npc" or _contains(message, ["기술", "스택", "stack", "개발"]):
        return (
            "주요 기술은 Next.js, React, TypeScript, React Three Fiber, FastAPI, Spring Boot입니다. "
            "프론트 UI와 백엔드 API, 실시간 SSE, 3D 인터랙션을 하나의 제품 흐름으로 연결하는 경험이 있습니다."
        )

    if _contains(message, ["오늘", "상태", "활동", "today"]) or "today" in lowered:
        workout = "운동도 완료했습니다" if activity.workout_done else "운동 기록은 아직 없습니다"
        memo = f" 메모는 '{activity.memo}'입니다." if activity.memo else ""
        return f"오늘은 GitHub 커밋 {activity.github_commits}개, 공부 {activity.study_minutes}분이 기록됐고, {workout}.{memo}"

    if npc_id == "contact-npc" or _contains(message, ["연락", "메일", "github", "contact"]):
        return (
            "연락은 toadsam@naver.com 으로 보낼 수 있고, GitHub는 https://github.com/toadsam 입니다. "
            "프로젝트 협업, 인터뷰, 포트폴리오 관련 문의 모두 이 경로로 연결하면 됩니다."
        )

    return (
        "이 마을은 정재훈의 프로젝트와 오늘 활동이 반영되는 디지털 포트폴리오 공간입니다. "
        "건물의 조명과 NPC 상태를 보면 오늘 어떤 활동이 있었는지 알 수 있고, 프로젝트 건물에 들어가면 상세 전시를 볼 수 있습니다."
    )


def _contains(message: str, tokens: list[str]) -> bool:
    lowered = message.lower()
    return any(token.lower() in lowered or token in message for token in tokens)


def _npc_profile_for_dynamic_id(npc_id: str) -> dict[str, str]:
    if "skill" in npc_id:
        return NPCS["developer-npc"]
    if "exp" in npc_id:
        return NPCS["archivist-npc"]
    if "post" in npc_id or "contact" in npc_id:
        return NPCS["contact-npc"]
    if "project" in npc_id:
        return NPCS["project-npc"]
    return NPCS["guide-npc"]
