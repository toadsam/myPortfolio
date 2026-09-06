import json
from dataclasses import dataclass
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


@dataclass(frozen=True)
class ChatMention:
    """모델이 답변과 함께 감지한 '방문자가 다른 NPC 를 감정 담아 언급함'. 적용(±2)은 규칙이 한다."""

    name: str
    sentiment: str  # "positive" | "negative"


def _parse_chat_json(raw: str) -> tuple[str, ChatMention | None]:
    """모델의 JSON 응답에서 (reply, mention) 을 꺼낸다. 어떤 실패든 (원문, None) — 지금까지의 동작."""
    try:
        data = json.loads(raw)
    except (ValueError, TypeError):
        return raw, None
    if not isinstance(data, dict):
        return raw, None
    reply = str(data.get("reply") or "").strip()
    if not reply:
        return raw, None
    mention = data.get("mention")
    if isinstance(mention, dict):
        name = str(mention.get("name") or "").strip()
        sentiment = str(mention.get("sentiment") or "").strip().lower()
        if name and sentiment in ("positive", "negative"):
            return reply, ChatMention(name=name, sentiment=sentiment)
    return reply, None


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
) -> tuple[str, bool, NpcActionOut, ChatMention | None]:
    npc = NPCS.get(npc_id, _npc_profile_for_dynamic_id(npc_id))
    context = build_context(
        npc_id, activity, recent_messages or [], coding_tests or [], cs_notes or [], activity_history, village_state,
        atelier_work=atelier_work, memory_lines=memory_lines,
    )
    suggested_action = choose_npc_action(npc_id, message=message, activity=activity, source="chat")

    if settings.openai_api_key:
        try:
            reply, mention = await answer_with_openai(npc, context, message)
            return reply, True, suggested_action, mention
        except Exception:
            return answer_without_ai(npc_id, message, activity, coding_tests or [], cs_notes or [], activity_history, village_state), False, suggested_action, None

    return answer_without_ai(npc_id, message, activity, coding_tests or [], cs_notes or [], activity_history, village_state), False, suggested_action, None


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


async def answer_with_openai(npc: dict[str, Any], context: str, message: str) -> tuple[str, ChatMention | None]:
    import httpx

    system_prompt = (
        "너는 정재훈의 살아있는 3D 포트폴리오 마을에 사는 AI NPC다. "
        '반드시 JSON 하나로만 답한다: {"reply": "<방문자에게 보여줄 답변>", "mention": null}. '
        "방문자의 이번 메시지가 **다른 NPC 를 감정을 담아** 언급했으면(칭찬·사과 전달·호감 vs 험담·서운함) "
        'mention 을 {"name": "<그 NPC 이름>", "sentiment": "positive"|"negative"} 로 채운다. '
        "그냥 이름만 나오거나(안부 질문 등) 부정문으로 감정을 부인하면 mention 은 null. "
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
                "response_format": {"type": "json_object"},
            },
        )
        response.raise_for_status()
        data = response.json()
        raw = str(data["choices"][0]["message"]["content"])
        reply, mention = _parse_chat_json(raw)
        return _clean_response_text(reply), mention


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
        parts = ["마을 한 바퀴 돌고 오는 길이에요. 다들 잘 지내요."]
        if activity_history:
            s = _activity_stats(activity_history)
            parts.append(
                f"요즘 정재훈님은 연속 {s['record_streak']}일 기록 중이고, 이번 주에 공부 {s['week_study']}분·코딩 {s['week_coding']}분을 채웠어요."
            )
        parts.append(f"지금까지 코딩테스트 {len(coding_tests)}개, CS 노트 {len(cs_notes)}개가 쌓였어요.")
        if village_state is not None:
            parts.append(f"마을은 지금 — {village_state.summary}")
        parts.append("세부는 그걸 맡은 친구가 저보다 잘 알아요. 기술이면 테오, 프로젝트면 픽셀이요.")
        return " ".join(parts)

    if _is_coding_npc(npc_id):
        if not coding_tests:
            return "아직 도장에 남은 풀이가 없어요. /admin에서 푼 문제를 기록하면 여기부터 채워져요."
        latest = coding_tests[0]
        platform = latest.platform or "코딩테스트"
        diff = f" {latest.difficulty}" if latest.difficulty else ""
        lang = f" {latest.language}로" if latest.language else ""
        approach = f" 풀이 접근은 '{latest.approach.strip()}'였어요." if latest.approach.strip() else ""
        return (
            f"가장 최근에는 {latest.solved_date}에 {platform}{diff} '{latest.title}' 문제를{lang} 풀었어요.{approach} "
            f"지금까지 쌓인 풀이는 총 {len(coding_tests)}개예요. 문제 이름이나 언어를 짚으면 그 풀이를 꺼내 볼게요."
        )

    if _is_cs_npc(npc_id):
        if not cs_notes:
            return "아직 서가에 꽂힌 CS 노트가 없어요. /admin에서 공부한 내용을 기록하면 여기부터 채워져요."
        latest = cs_notes[0]
        category = f"[{latest.category}] " if latest.category else ""
        return (
            f"최근에는 {latest.study_date}에 {category}'{latest.title}'를 공부했어요. "
            f"지금까지 정리된 노트는 총 {len(cs_notes)}개예요. 전공 주제 하나를 짚으면 그 노트를 펼쳐요."
        )

    if _is_life_npc(npc_id):
        workout = (
            "오늘 운동까지 마쳤어요. 개발 기록만큼 몸 관리도 꾸준한 편이에요."
            if activity.workout_done
            else "오늘 운동 기록은 아직이에요. 그래도 습관으로 챙기는 중이에요."
        )
        memo = f" 오늘 남긴 메모는 '{activity.memo}'예요." if activity.memo else ""
        return (
            f"여기는 정재훈의 개발 밖 일상을 담은 라이프 구역이에요. {workout}{memo} "
            "운동이나 서재처럼 개발 밖 건물들을 천천히 돌아보면 어떤 사람인지 보일 거예요. "
            "개발 얘기는 픽셀이나 테오 몫이에요."
        )

    project = _project_for_npc_or_message(npc_id, message)

    if _contains(message, ["대표", "추천", "best", "main", "채용자"]):
        return (
            "채용자에게 먼저 보여줄 대표 프로젝트는 MyStock-Desk, FestFlow, 근근 MuscleUp 순서가 좋아요. "
            "MyStock-Desk는 도메인 데이터 모델링과 자산 대시보드(MyWave)의 정보 구조화가 잘 보이고, "
            "FestFlow는 실시간 운영 UX와 권한 분리가 드러나요. "
            "근근 MuscleUp은 인증부터 AI 분석까지 하나의 풀스택 흐름으로 묶은 점이 강해요."
        )

    if _contains(message, ["강점", "요약", "strength", "장점"]):
        return (
            "정재훈은 기능 목록보다 사용자의 흐름을 먼저 잡고, 그걸 화면 구조로 풀어내는 사람이에요. "
            "화면은 React 로, 서버는 Spring Boot 로 짜 봤고요. FastAPI 도 이 마을 백엔드에서 쓰고 있어요. "
            "그래서 프론트와 백엔드를 이어 실제 서비스 흐름을 끝까지 만들 수 있어요. "
            "Three.js 와 Unity 를 만져 본 덕에 포트폴리오 자체를 3D 로 세울 만큼 시각 구현 감각도 있고요."
        )

    if project:
        return _project_answer(project)

    if _contains(message, ["기술", "스택", "stack", "개발", "아키텍처", "구조"]):
        return (
            "이름을 늘어놓기보다 쓰임으로 말할게요. "
            "화면은 React 와 Next.js 로 짜고, 거기서 화면 상태와 사용자 흐름을 설계하는 쪽이 강해요. "
            "서버 쪽은 Spring Boot 나 FastAPI 로 인증, API, 실시간 연결을 붙여 봤고요. "
            "3D 는 Three.js, 게임은 Unity 예요. "
            "이 마을도 그 조합이에요. Next.js 와 Three.js 로 화면을 올리고, 마을 상태와 NPC 대화는 FastAPI 가 받쳐요."
        )

    if _contains(message, ["협업", "팀", "소통", "역할", "collaboration"]):
        return (
            "협업에서는 역할을 화면 단위와 데이터 흐름 단위로 나누는 편이에요. "
            "ACLUB, 아주총학, FestFlow 같은 프로젝트에서 사용자 흐름, 권한, 배포 구조를 나눠 생각했고, "
            "Unity 프로젝트에서는 충돌을 줄이려고 기능 단위로 작업 범위를 갈랐어요."
        )

    if _contains(message, ["오늘", "상태", "활동", "today", "커밋", "공부", "운동"]):
        workout = "운동까지 완료되어 마을 분위기가 더 활기차요" if activity.workout_done else "운동 기록은 아직 없어 광장 에너지는 차분해요"
        memo = f" 오늘 메모는 '{activity.memo}'예요." if activity.memo else ""
        return (
            f"오늘 기록은 GitHub 커밋 {activity.github_commits}개, 공부 {activity.study_minutes}분이에요. "
            f"{workout}.{memo} 이 값이 건물 조명과 NPC 기분, 잠금 장식으로 번져서 지금 컨디션이 마을 모양으로 보여요."
        )

    if _contains(message, ["연락", "메일", "github", "contact", "채용", "문의"]):
        return (
            "연락은 toadsam@naver.com, 코드는 https://github.com/toadsam 이에요. "
            "채용자라면 MyStock-Desk, FestFlow, 근근 MuscleUp을 먼저 보고, 기술 질문은 테오에게 넘기는 길이 가장 빨라요."
        )

    if npc_id == "developer-npc" or "skill" in npc_id:
        return (
            "기술은 프로젝트에 붙여서 봐야 왜 골랐는지가 보여요. "
            "MyStock-Desk 는 React 화면 뒤에 도메인 계산 로직이 있는 쪽이고요. "
            "FestFlow 는 Spring Boot 위에 SSE 를 얹어 실시간 흐름을 만든 쪽이에요. "
            "이 마을은 Next.js 화면과 FastAPI 를 이은 경우고, 3D 는 Three.js 예요. "
            "어느 걸 왜 썼는지는 그 프로젝트 얘기로 들어가야 제대로 나와요."
        )

    if npc_id == "archivist-npc" or "exp" in npc_id:
        return (
            "기록을 보면 정재훈은 결과만 남기는 사람이 아니에요. 어디서 틀렸고 그 다음에 뭐가 달라졌는지를 같이 적어 두는 쪽이에요. "
            "그 흐름이 프로젝트 상세 페이지와 오늘의 마을 상태에 그대로 남아 있어요."
        )

    if npc_id == "contact-npc" or "post" in npc_id:
        return (
            "코드는 github.com/toadsam, 연락은 toadsam@naver.com 이에요. "
            "관심 프로젝트를 한 줄 적어 보내면 답이 빨라요."
        )

    return (
        "여기는 정재훈의 포트폴리오를 마을 모양으로 펼쳐 놓은 곳이에요. "
        "처음이면 빠른 이력서로 훑고, 그다음 MyStock-Desk나 FestFlow 건물에 들어가 보면 돼요."
    )


def _project_answer(project: dict[str, Any]) -> str:
    tech = ", ".join(project["tech"])
    return (
        f"{project['title']}는 {project['summary']} "
        f"정재훈의 역할은 {project['role']}였고, 핵심 난점은 {project['hard_part']} "
        f"쓴 기술은 {tech} 쪽이에요. 채용자 눈으로 보면 — {project.get('recruiter_value', '구현 경험을 확인하기 좋은 프로젝트예요.')}"
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
