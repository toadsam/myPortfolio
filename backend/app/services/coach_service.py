"""갓생 섬 코치 — 안 하면 갈구고, 하면 알아봐 주는 AI.

## 마을 NPC 와 무엇이 다른가

마을 NPC 는 **손님 안내**가 일이고, 손님이 누구인지 모른다. 코치는 반대로
**나를 안다** — 어제 뭘 했는지, 며칠째 이어오고 있는지, 오늘 뭐가 비었는지.
그래서 이 대화는 반드시 `require_island` 뒤에 있어야 한다.
**공개 라우트인 `POST /npc/chat` 에는 절대 얹지 않는다.**

같은 이유로 `catalog.NPCS` 에도 넣지 않는다. 거기 넣으면 관리자 NPC 프리셋 목록과
마을 NPC 기계(관계·조우·틱)에 코치가 딸려 들어간다. 코치는 마을 주민이 아니다.

## 말을 거는 규칙

- **들어올 때 하루 한 번 브리핑.** 그날 것은 DB에 저장하고 그대로 고수한다
  (들어올 때마다 말이 달라지면 '오늘의 브리핑'이라는 느낌이 사라진다).
- **말 걸면 대답.** 그 외엔 먼저 안 떠든다.

## 실패는 침묵이 아니라 규칙 기반 대사로

OPENAI_API_KEY 가 없거나 호출이 실패해도 **절대 예외를 올리지 않는다.**
코치가 조용한 건 괜찮지만, 코치 때문에 오늘 기록을 못 남기면 안 된다.
`chat_service.answer_without_ai` 와 같은 태도다.
"""

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.config import settings
from app.models import CoachNote, DailyActivity
from app.services import quest_service
from app.time_utils import today_local


PERSONA = (
    "너는 '갓생 섬'의 코치다. 상대는 이 섬의 유일한 주인이자 개발자다.\n"
    "성격: 잔소리는 하되 비꼬지 않는다. 못 한 날을 나무라기보다 '내일 뭘 하면 되는지'를 짚는다.\n"
    "말투: 친근한 반말. 짧게. 이모지·마크다운·제목 문법·코드블록은 쓰지 않는다.\n"
    "분량: 2~3문장. 길면 안 읽는다.\n"
    "숫자는 주어진 것만 쓴다. 없는 기록을 지어내지 않는다."
)


# ─────────────────────────── 컨텍스트 ───────────────────────────


def build_context(db: Session) -> str:
    """코치가 아는 전부. 여기 없는 건 코치도 모른다."""
    snapshot = quest_service.today_snapshot(db)
    today = snapshot["date"]

    done = [q["label"] for q in snapshot["quests"] if q["done"]]
    left = [q["label"] for q in snapshot["quests"] if not q["done"]]

    yesterday_row = (
        db.query(DailyActivity).filter(DailyActivity.date == today - timedelta(days=1)).first()
    )
    history = quest_service.cleared_history(db)
    week = sum(
        1 for offset in range(1, 8) if history.get(today - timedelta(days=offset), False)
    )

    now = datetime.now(ZoneInfo(settings.local_timezone))

    lines = [
        f"오늘 날짜: {today} (지금 {now.hour}시)",
        f"오늘 끝낸 것: {', '.join(done) if done else '아직 없음'}",
        f"오늘 남은 것: {', '.join(left) if left else '없음 (4칸 전부 완료)'}",
        f"연속 기록: {snapshot['streak']}일 (최고 {snapshot['best_streak']}일)",
        f"오늘 못 채우면 내일 줄어드는 값: {snapshot['streak'] // 2}일",
        f"최근 7일 중 4칸을 다 채운 날: {week}일",
    ]
    if yesterday_row:
        y_done = "함" if yesterday_row.workout_done else "안 함"
        lines.append(f"어제 운동: {y_done}, 어제 커밋: {yesterday_row.github_commits or 0}개")
    else:
        lines.append("어제 기록: 없음")

    for quest in snapshot["quests"]:
        if quest["detail"]:
            lines.append(f"오늘 {quest['label']} 내용: {quest['detail']}")

    return "\n".join(lines)


# ─────────────────────────── 하루 한 번 브리핑 ───────────────────────────


async def daily_briefing(db: Session) -> tuple[str, bool]:
    """(오늘의 한마디, AI가 쓴 것인지). 이미 있으면 그대로 돌려준다."""
    today = today_local()
    note = db.query(CoachNote).filter(CoachNote.date == today).first()

    # 이미 있으면 고수한다. 다만 예전에 규칙 기반으로 쓴 날에 나중에 키를 넣었다면
    # 한 번은 AI 로 다시 써 준다 — 키를 넣은 보람이 그날 바로 보여야 한다.
    if note and (note.from_ai or not settings.openai_api_key):
        return note.message, note.from_ai

    context = build_context(db)
    message = await _ask_openai(context, None)
    from_ai = message is not None
    if message is None:
        message = _fallback_briefing(db)

    if note:
        note.message = message
        note.from_ai = from_ai
    else:
        db.add(CoachNote(date=today, message=message, from_ai=from_ai))
    db.commit()
    return message, from_ai


async def reply(db: Session, user_message: str) -> tuple[str, bool]:
    """말을 걸었을 때. 저장하지 않는다 — 브리핑과 달리 고수할 이유가 없다."""
    context = build_context(db)
    answer = await _ask_openai(context, user_message)
    if answer is None:
        return _fallback_reply(db, user_message), False
    return answer, True


# ─────────────────────────── OpenAI ───────────────────────────


async def _ask_openai(context: str, user_message: str | None) -> str | None:
    """실패하면 None. **예외를 올리지 않는다.**"""
    if not settings.openai_api_key:
        return None

    import httpx

    if user_message is None:
        task = (
            "섬에 막 들어온 참이다. 오늘의 브리핑을 해라. "
            "남은 칸이 있으면 그중 하나를 콕 집어 권하고, 연속 기록이 걸려 있으면 그걸 근거로 밀어붙여라. "
            "4칸을 이미 다 채웠으면 짧게 인정해 주고 끝내라."
        )
    else:
        task = user_message

    try:
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
                        {"role": "system", "content": f"{PERSONA}\n\n오늘의 기록:\n{context}"},
                        {"role": "user", "content": task},
                    ],
                    "temperature": 0.8,
                    "max_tokens": 300,
                },
            )
            response.raise_for_status()
            text = response.json()["choices"][0]["message"]["content"]
            return " ".join(text.split()) or None
    except Exception:
        return None


# ─────────────────────────── 규칙 기반 (AI 없이) ───────────────────────────
#
# 여기가 '그럭저럭 때우는 문장'이 되면 코치가 없느니만 못하다. 그래서 상황을
# 실제로 갈라서 쓴다 — 남은 칸 수, 시간대, 스트릭이 걸려 있는지.


def _fallback_briefing(db: Session) -> str:
    snapshot = quest_service.today_snapshot(db)
    left = [q["label"] for q in snapshot["quests"] if not q["done"]]
    streak = snapshot["streak"]
    hour = datetime.now(ZoneInfo(settings.local_timezone)).hour

    if not left:
        if streak >= 2:
            return f"오늘도 네 칸 다 채웠네. {streak}일째다. 이 흐름 아깝다, 내일도 가자."
        return "오늘 네 칸 다 채웠다. 시작이 좋네."

    if len(left) == 1:
        return f"{left[0]} 하나 남았다. 이거 하나면 오늘 끝인데 지금 해치우자."

    at_risk = streak > 0 and hour >= 20
    if at_risk:
        return (
            f"{streak}일 이어온 게 오늘 밤에 걸렸다. "
            f"{left[0]}부터라도 찍어두면 {streak // 2}일로 깎이는 건 막는다."
        )

    if hour < 12:
        return f"오늘 {len(left)}칸 남았다. 아침에 {left[0]} 먼저 밀어두면 하루가 편하다."
    if hour < 18:
        return f"아직 {len(left)}칸 비어 있다. {left[0]}부터 하나씩 지우자."
    return f"밤이다. {len(left)}칸 남았는데 {left[0]} 하나만이라도 오늘 안에 찍자."


def _fallback_reply(db: Session, user_message: str) -> str:
    snapshot = quest_service.today_snapshot(db)
    left = [q["label"] for q in snapshot["quests"] if not q["done"]]
    text = user_message.strip()

    if any(word in text for word in ("뭐", "무엇", "뭘", "어떻게", "남았")):
        if left:
            return f"오늘 남은 건 {', '.join(left)}. {left[0]}부터 하자."
        return "오늘은 다 했다. 더 할 거면 내일 몫을 당겨오는 것도 방법이고."

    if any(word in text for word in ("힘들", "피곤", "못하겠", "쉬고")):
        return (
            "그런 날 있지. 다 하려고 하지 말고 제일 만만한 칸 하나만 찍어라. "
            "연속 기록은 절반으로만 깎이니까 완전히 무너지진 않는다."
        )

    if any(word in text for word in ("몇", "며칠", "기록", "연속")):
        return f"지금 {snapshot['streak']}일째, 최고는 {snapshot['best_streak']}일이다."

    if left:
        return f"지금은 {left[0]} 차례다. 그거 끝내고 다시 얘기하자."
    return "오늘 할 건 다 했다. 잘했어."
