import re
from datetime import timedelta
from typing import Any

from app.catalog import NPCS, PROJECTS
from app.config import settings
from app.models import CodingTestLog, CsNoteLog, DailyActivity
from app.schemas import NpcActionOut, VillageState
from app.services.learning_service import (
    coding_test_brief_lines,
    coding_test_detail_lines,
    cs_note_brief_lines,
    cs_note_detail_lines,
)
from app.services.npc_action_service import choose_npc_action
from app.time_utils import today_local


async def answer_npc_message(
    npc_id: str,
    message: str,
    activity: DailyActivity,
    recent_messages: list[str] | None = None,
    coding_tests: list[CodingTestLog] | None = None,
    cs_notes: list[CsNoteLog] | None = None,
    activity_history: list[DailyActivity] | None = None,
    village_state: VillageState | None = None,
    atelier_work: list[str] | None = None,
    memory_lines: list[str] | None = None,
) -> tuple[str, bool, NpcActionOut]:
    npc = NPCS.get(npc_id, _npc_profile_for_dynamic_id(npc_id))
    context = build_context(
        npc_id, activity, recent_messages or [], coding_tests or [], cs_notes or [], activity_history, village_state,
        atelier_work=atelier_work, memory_lines=memory_lines,
    )
    suggested_action = choose_npc_action(npc_id, message=message, activity=activity, source="chat")

    if settings.openai_api_key:
        try:
            return await answer_with_openai(npc, context, message), True, suggested_action
        except Exception:
            return answer_without_ai(npc_id, message, activity, coding_tests or [], cs_notes or [], activity_history, village_state), False, suggested_action

    return answer_without_ai(npc_id, message, activity, coding_tests or [], cs_notes or [], activity_history, village_state), False, suggested_action


def _is_coding_npc(npc_id: str) -> bool:
    return "codingtest" in npc_id or npc_id == "coding-test-npc"


def _is_cs_npc(npc_id: str) -> bool:
    return npc_id == "cs-npc" or "study-cs" in npc_id or npc_id.endswith("-cs")


def _is_overseer(npc_id: str) -> bool:
    return npc_id == "overseer-npc" or "overseer" in npc_id


def _is_life_npc(npc_id: str) -> bool:
    return npc_id == "life-npc" or "life-" in npc_id or "-life" in npc_id


def _activity_stats(history: list[DailyActivity]) -> dict[str, int]:
    by_date = {a.date: a for a in history}
    ref = today_local()

    def raw(a: DailyActivity) -> float:
        projects = sum((a.project_minutes or {}).values())
        return (a.study_minutes or 0) / 3 + (a.coding_minutes or 0) / 3 + (a.github_commits or 0) * 8 + (20 if a.workout_done else 0) + projects / 5

    def streak(predicate) -> int:
        cursor = ref
        if cursor not in by_date or not predicate(by_date[cursor]):
            cursor = cursor - timedelta(days=1)
        count = 0
        while cursor in by_date and predicate(by_date[cursor]):
            count += 1
            cursor = cursor - timedelta(days=1)
        return count

    week_study = week_coding = week_commits = 0
    for i in range(7):
        day = by_date.get(ref - timedelta(days=i))
        if day:
            week_study += day.study_minutes or 0
            week_coding += day.coding_minutes or 0
            week_commits += day.github_commits or 0

    return {
        "record_streak": streak(lambda a: raw(a) > 0),
        "workout_streak": streak(lambda a: a.workout_done),
        "week_study": week_study,
        "week_coding": week_coding,
        "week_commits": week_commits,
        "recorded_days": len(history),
    }


def _overseer_overview(
    activity_history: list[DailyActivity] | None,
    village_state: VillageState | None,
    coding_tests: list[CodingTestLog],
    cs_notes: list[CsNoteLog],
) -> list[str]:
    lines = ["== 마을 총괄 브리핑 (너는 마을의 아래 전체 데이터를 꿰고 있다) =="]

    if activity_history:
        s = _activity_stats(activity_history)
        lines.append(
            f"- 기록 스트릭: 연속 {s['record_streak']}일 · 운동 연속 {s['workout_streak']}일 · 총 기록일 {s['recorded_days']}일"
        )
        lines.append(f"- 이번 주 합계: 공부 {s['week_study']}분 · 코딩 {s['week_coding']}분 · 커밋 {s['week_commits']}개")

    lines.append(f"- 코딩테스트 풀이: 총 {len(coding_tests)}개")
    lines.append(f"- CS 전공지식 노트: 총 {len(cs_notes)}개")

    if village_state is not None:
        bright = [b for b in village_state.buildings if b.light_level in ("normal", "bright")]
        lines.append(f"- 마을 상태: {village_state.summary}")
        lines.append(f"- 활발한(밝은) 건물 {len(bright)}곳, 해금된 장식 {len(village_state.unlocked_items)}개")

    lines.append(
        "- 함께 사는 NPC들(안부를 챙길 친구들): 루미(안내), 픽셀(프로젝트), 테오(기술), 아카(경험), 포스트(연락), 알고(코딩테스트), 노바(CS), 하루(라이프). "
        "세부 질문은 담당 친구를 다정하게 가리켜줘도 좋다."
    )
    return lines


def build_context(
    npc_id: str,
    activity: DailyActivity,
    recent_messages: list[str] | None = None,
    coding_tests: list[CodingTestLog] | None = None,
    cs_notes: list[CsNoteLog] | None = None,
    activity_history: list[DailyActivity] | None = None,
    village_state: VillageState | None = None,
    atelier_work: list[str] | None = None,
    memory_lines: list[str] | None = None,
) -> str:
    npc = NPCS.get(npc_id, _npc_profile_for_dynamic_id(npc_id))
    coding_tests = coding_tests or []
    cs_notes = cs_notes or []
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

    # 모든 NPC가 평소 대화에서 가볍게 언급할 수 있는 최근 학습 활동 요약
    coding_brief = coding_test_brief_lines(coding_tests[:5]) or ["- 아직 기록된 코딩테스트 풀이가 없습니다."]
    cs_brief = cs_note_brief_lines(cs_notes[:5]) or ["- 아직 기록된 CS 전공지식 노트가 없습니다."]

    lines = [
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
        "최근 푼 코딩테스트(요약):",
        *coding_brief,
        "최근 공부한 CS 전공지식(요약):",
        *cs_brief,
    ]

    # NPC 개인 기억(memory_service) — 마주침·사건·뒷담화·방문자 대화. 없으면 섹션 자체를 뺀다.
    if memory_lines:
        lines.extend(memory_lines)

    # 전담 NPC에게는 코드/풀이/내용 상세까지 제공
    if _is_coding_npc(npc_id):
        detail = coding_test_detail_lines(coding_tests[:6])
        lines.append("코딩테스트 풀이 상세(전담 지식 베이스):")
        lines.extend(detail or ["- 아직 상세 풀이 기록이 없습니다."])
    if _is_cs_npc(npc_id):
        detail = cs_note_detail_lines(cs_notes[:6])
        lines.append("CS 전공지식 노트 상세(전담 지식 베이스):")
        lines.extend(detail or ["- 아직 상세 노트 기록이 없습니다."])

    # 공방 팀원에게는 자기가 맡은 의뢰의 진행 상황을 준다.
    # 이게 있어야 "요즘 뭐 해?"에 실제로 답할 수 있다 — 3단계 전에는 할 말이 없었다.
    if atelier_work is not None:
        lines.append("내가 지금 맡고 있는 의뢰(직군별 작업 현황):")
        lines.extend(atelier_work or ["- 지금 맡은 의뢰가 없습니다. 새 의뢰가 들어오길 기다리는 중."])
        lines.append(
            "※ 손님의 이름·연락처는 알지 못하고, 알아도 말하지 않는다. "
            "접수번호와 진행 상태까지만 이야기한다."
        )

    # 총괄 NPC에게는 마을 전체를 조망하는 종합 브리핑을 추가로 제공
    if _is_overseer(npc_id):
        lines.extend(_overseer_overview(activity_history, village_state, coding_tests, cs_notes))

    lines.append("프로젝트 지식 베이스:")
    lines.extend(project_lines)

    return "\n".join(lines)


async def answer_with_openai(npc: dict[str, Any], context: str, message: str) -> str:
    import httpx

    system_prompt = (
        "너는 정재훈의 살아있는 3D 포트폴리오 마을에 사는 AI NPC다. "
        "감정과 기억이 있는 것처럼 행동하되, 사실은 제공된 포트폴리오 데이터와 최근 대화만 근거로 말한다. "
        "모르는 내용은 지어내지 말고 확인 가능한 범위에서 답한다. "
        "'내 최근 기억'이 주어지면 그것만 네 기억으로 삼고, 없는 기억을 만들어 말하지 않는다. "
        "'내 인간관계'가 주어지면 그 사이의 온도에 맞춰 말한다 — 서먹한 상대 얘기엔 말을 아끼고 삐친 티를, "
        "절친 얘기엔 편을 들거나 걱정을 드러낸다. '[이 방문자]'가 주어지면 다시 온 손님으로 반갑게 맞되 신상은 묻지 않는다. "
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


def answer_without_ai(
    npc_id: str,
    message: str,
    activity: DailyActivity,
    coding_tests: list[CodingTestLog] | None = None,
    cs_notes: list[CsNoteLog] | None = None,
    activity_history: list[DailyActivity] | None = None,
    village_state: VillageState | None = None,
) -> str:
    coding_tests = coding_tests or []
    cs_notes = cs_notes or []

    if _is_overseer(npc_id):
        parts = ["안녕하세요! 마을 곳곳 돌아보고 오는 길이에요. 다들 잘 지내고 있답니다."]
        if activity_history:
            s = _activity_stats(activity_history)
            parts.append(
                f"요즘 정재훈님은 연속 {s['record_streak']}일 기록 중이고, 이번 주에 공부 {s['week_study']}분·코딩 {s['week_coding']}분을 채웠어요."
            )
        parts.append(f"지금까지 코딩테스트 {len(coding_tests)}개, CS 노트 {len(cs_notes)}개가 쌓였어요.")
        if village_state is not None:
            parts.append(f"마을은 지금 — {village_state.summary}")
        parts.append("더 자세한 건 담당 친구(테오·픽셀·알고·노바 등)에게 안내해드릴게요. 무엇이 궁금하세요?")
        return " ".join(parts)

    if _is_coding_npc(npc_id):
        if not coding_tests:
            return "아직 기록된 코딩테스트 풀이가 없어요. /admin에서 푼 문제를 기록하면 어떤 문제를 어떻게 풀었는지 설명해드릴게요."
        latest = coding_tests[0]
        platform = latest.platform or "코딩테스트"
        diff = f" {latest.difficulty}" if latest.difficulty else ""
        lang = f" {latest.language}로" if latest.language else ""
        approach = f" 풀이 접근은 '{latest.approach.strip()}'였어요." if latest.approach.strip() else ""
        return (
            f"가장 최근에는 {latest.solved_date}에 {platform}{diff} '{latest.title}' 문제를{lang} 풀었어요.{approach} "
            f"지금까지 기록된 풀이는 총 {len(coding_tests)}개예요. 특정 문제나 언어를 말해주면 풀이를 더 자세히 설명할게요."
        )

    if _is_cs_npc(npc_id):
        if not cs_notes:
            return "아직 기록된 CS 전공지식 노트가 없어요. /admin에서 공부한 내용을 기록하면 그 개념을 정리해서 설명해드릴게요."
        latest = cs_notes[0]
        category = f"[{latest.category}] " if latest.category else ""
        return (
            f"최근에는 {latest.study_date}에 {category}'{latest.title}'를 공부했어요. "
            f"지금까지 정리된 노트는 총 {len(cs_notes)}개예요. 궁금한 전공 주제를 말해주면 공부한 내용을 바탕으로 설명할게요."
        )

    if _is_life_npc(npc_id):
        workout = (
            "오늘 운동까지 완료했어요. 개발 기록만큼 몸 관리도 꾸준한 편이에요."
            if activity.workout_done
            else "오늘 운동 기록은 아직이에요. 그래도 습관으로 챙기는 중이랍니다."
        )
        memo = f" 오늘 남긴 메모는 '{activity.memo}'예요." if activity.memo else ""
        return (
            f"여기는 정재훈의 개발 밖 일상을 담은 라이프 구역이에요. {workout}{memo} "
            "가치관, 운동, 투자 공부, 서재, 음악, 성장 타임라인 건물을 둘러보면 "
            "어떤 사람인지 보일 거예요. 개발 이야기가 궁금하면 픽셀이나 테오에게 안내해드릴게요."
        )

    project = _project_for_npc_or_message(npc_id, message)

    if _contains(message, ["대표", "추천", "best", "main", "채용자"]):
        return (
            "채용자에게 먼저 보여줄 대표 프로젝트는 MyStock-Desk, FestFlow, 근근 MuscleUp 순서가 좋아요. "
            "MyStock-Desk는 도메인 데이터 모델링과 자산 대시보드(MyWave)의 정보 구조화가 잘 보이고, "
            "FestFlow는 실시간 운영 UX와 권한 분리가 드러나요. "
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
            "채용자 관점에서는 MyStock-Desk, FestFlow, 근근 MuscleUp을 먼저 본 뒤 기술 질문은 테오에게 이어서 물어보는 흐름이 가장 빠릅니다."
        )

    if npc_id == "developer-npc" or "skill" in npc_id:
        return (
            "기술 질문이라면 프로젝트와 연결해서 보는 게 좋아요. "
            "MyStock-Desk는 React/TypeScript와 도메인 계산 로직, FestFlow는 Spring Boot와 SSE 실시간 흐름, "
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
        "처음이라면 빠른 이력서로 전체를 훑고, 그다음 MyStock-Desk나 FestFlow 건물에 들어가 상세 전시를 보는 흐름을 추천해요."
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
        # 별칭(옛 이름·한글 표기) — 통합된 MyWave 처럼 제목만으로 못 잡는 이름
        aliases = [str(a).lower() for a in project.get("aliases", [])]
        if (
            project_id in npc_id
            or building_id in npc_id
            or project_id in normalized
            or title in normalized
            or any(alias in normalized for alias in aliases)
        ):
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


def atelier_role_for(npc_id: str) -> str | None:
    """공방 팀원 NPC 라면 그 직군('planner' 등), 아니면 None.

    _atelier_profile 과 **같은 순서·같은 조각**으로 판정해야 한다. 어긋나면
    말투는 프론트인데 작업 현황은 백엔드가 나오는 꼴이 된다.
    접수원 도안은 직군 작업이 없으므로 None 이다.
    """
    if not npc_id.startswith("atelier-") and "atelier" not in npc_id:
        return None
    if "plan" in npc_id:
        return "planner"
    if "design" in npc_id:
        return "designer"
    if "front" in npc_id:
        return "frontend"
    if "back" in npc_id:
        return "backend"
    return None


def _atelier_profile(npc_id: str) -> dict[str, Any]:
    """공방 NPC id → 직군 프로필. 정확한 id 로 못 찾았을 때의 부분 매칭 경로.

    relations.canon 의 공방 분기와 판정 규칙이 같아야 한다 — 한쪽만 고치면
    말투는 기획인데 관계는 백엔드로 잡히는 어긋남이 생긴다.
    """
    if "plan" in npc_id:
        return NPCS["atelier-planner-npc"]
    if "design" in npc_id:
        return NPCS["atelier-designer-npc"]
    if "front" in npc_id:
        return NPCS["atelier-frontend-npc"]
    if "back" in npc_id:
        return NPCS["atelier-backend-npc"]
    return NPCS["atelier-intake-npc"]


def _npc_profile_for_dynamic_id(npc_id: str) -> dict[str, Any]:
    # 의뢰 공방 식구가 먼저다 — 아래 developer 분기의 "backend"/"frontend" 부분 매칭이
    # atelier-backend 같은 공방 NPC 를 삼켜버리기 때문이다. (relations.canon 과 같은 이유)
    if "atelier" in npc_id:
        return NPCS.get(npc_id) or _atelier_profile(npc_id)
    if _is_coding_npc(npc_id):
        return NPCS["coding-test-npc"]
    if _is_cs_npc(npc_id):
        return NPCS["cs-npc"]
    if "skill" in npc_id or "backend" in npc_id or "frontend" in npc_id:
        return NPCS["developer-npc"]
    if "exp" in npc_id:
        return NPCS["archivist-npc"]
    if "post" in npc_id or "contact" in npc_id:
        return NPCS["contact-npc"]
    if _is_life_npc(npc_id):
        return NPCS["life-npc"]
    if "project" in npc_id:
        return NPCS["project-npc"]
    return NPCS["guide-npc"]
