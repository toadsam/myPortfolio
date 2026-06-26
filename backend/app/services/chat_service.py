from app.catalog import NPCS, PROJECTS
from app.config import settings
from app.models import DailyActivity


async def answer_npc_message(npc_id: str, message: str, activity: DailyActivity) -> tuple[str, bool]:
    npc = NPCS.get(npc_id, NPCS["guide-npc"])
    context = build_context(npc_id, activity)

    if settings.openai_api_key:
        try:
            return await answer_with_openai(npc, context, message), True
        except Exception:
            return answer_without_ai(npc_id, message, activity), False

    return answer_without_ai(npc_id, message, activity), False


def build_context(npc_id: str, activity: DailyActivity) -> str:
    project_lines = [
        f"- {project['title']}: {project['summary']} 역할: {project['role']} 난점: {project['hard_part']}"
        for project in PROJECTS.values()
    ]
    return "\n".join([
        f"NPC ID: {npc_id}",
        f"오늘 커밋: {activity.github_commits}개",
        f"오늘 공부: {activity.study_minutes}분",
        f"운동 완료: {'예' if activity.workout_done else '아니오'}",
        f"오늘 메모: {activity.memo or '없음'}",
        "프로젝트 정보:",
        *project_lines,
    ])


async def answer_with_openai(npc: dict[str, str], context: str, message: str) -> str:
    import httpx

    system_prompt = (
        "너는 정재훈의 3D 포트폴리오 마을에 사는 AI NPC다. "
        "방문자의 질문에 한국어로 답한다. "
        "모르는 내용은 지어내지 말고 현재 제공된 프로젝트/활동 데이터 기준으로 답한다.\n"
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
                "temperature": 0.7,
                "max_tokens": 500,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


def answer_without_ai(npc_id: str, message: str, activity: DailyActivity) -> str:
    lowered = message.lower()

    if npc_id == "project-npc" or "힘들" in message or "어려" in message:
        hard_parts = " ".join(project["hard_part"] for project in PROJECTS.values())
        return f"프로젝트에서 어려웠던 부분을 묻는다면, 핵심은 이거예요. {hard_parts}"

    if npc_id == "developer-npc" or "기술" in message or "스택" in message:
        return "정재훈은 Next.js, React Three Fiber, FastAPI, PostgreSQL을 엮어서 3D 포트폴리오와 AI NPC 백엔드를 구성하고 있어요."

    if "오늘" in message or "요즘" in message or "상태" in message or "today" in lowered:
        workout = "운동도 완료했어요" if activity.workout_done else "운동 기록은 아직 없어요"
        return f"오늘은 GitHub 커밋 {activity.github_commits}개, 공부 {activity.study_minutes}분이 기록됐고, {workout}."

    if npc_id == "contact-npc":
        return "협업이나 연락은 이메일과 GitHub 링크를 통해 이어갈 수 있어요. 우체국에서 연락 동선을 확인하면 됩니다."

    return "이 마을은 정재훈의 프로젝트와 오늘 활동이 반영되는 디지털 자아 공간이에요. 건물의 조명과 NPC 상태를 보면 요즘 어떤 흐름인지 알 수 있습니다."
