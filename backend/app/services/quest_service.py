"""갓생 섬(/island) — 일일 퀘스트 4칸 판정과 연속 기록.

## 여기서 정하는 것

- **퀘스트 4칸**: 운동 · 코테 · 코딩 · 노션. 고정이고 매일 똑같다.
- **연속 기록(스트릭)**: 하루 빠지면 **절반으로 깎인다**(0으로 리셋하지 않는다).

## 스트릭을 저장하지 않는 이유

값을 DB에 두면 언젠가 실제 기록과 어긋나고, 어긋난 뒤에는 무엇이 맞는지 알 방법이
없다. "깎이는" 규칙은 순서에 의존하지만 **기록 전체를 처음부터 재생하면 완전히
복원되므로**, 매번 다시 계산한다. 하루 한 줄짜리 테이블이라 비용도 없다.

`chat_service._activity_stats()` 안에도 `streak()` 헬퍼가 있지만 그건 **0으로
리셋하는** 다른 규칙이고 마을 NPC 대사용이다. 서로 건드리지 않는다.
"""

from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import CodingTestLog, DailyActivity
from app.time_utils import today_local


# 섬 개장일. **이 날짜 이전은 세지 않는다** — 안 그러면 이 기능이 없던 과거 전체가
# 실패한 날로 잡혀서 스트릭이 영원히 0에서 시작한다.
ISLAND_OPENED_ON = date(2026, 8, 18)

QUEST_LABELS: dict[str, str] = {
    "workout": "운동",
    "coding-test": "코딩테스트",
    "coding": "오늘의 코딩",
    "notion": "노션 정리",
}
QUEST_IDS = tuple(QUEST_LABELS)


# ─────────────────────────── 순수 판정 로직 ───────────────────────────
#
# 아래 두 함수는 Session 을 받지 않는다 — 규칙만 따로 테스트할 수 있어야 한다.
# (tests/test_quest.py 가 이 둘을 잠근다)


def quest_flags(activity: DailyActivity | None, coding_tests: int) -> dict[str, bool]:
    """그날의 4칸이 채워졌는지. 3칸은 이미 있던 데이터로 판정된다."""
    return {
        "workout": bool(activity and activity.workout_done),
        # 손으로 남긴 기록 **또는** solved.ac 가 잡아낸 오늘치. 둘 중 하나면 된다 —
        # 백준은 자동으로 잡히지만 프로그래머스는 손으로 넣어야 하기 때문이다.
        "coding-test": coding_tests > 0
        or bool(activity and (activity.boj_solved_today or 0) > 0),
        # 커밋이 있으면 자동으로 채워지고, 커밋 없이 코딩만 한 날은 분 단위 수동 입력으로.
        "coding": bool(
            activity
            and ((activity.github_commits or 0) > 0 or (activity.coding_minutes or 0) > 0)
        ),
        "notion": bool(activity and activity.notion_done),
    }


def compute_streak(
    cleared_by_date: dict[date, bool],
    today: date,
    # 기본값으로 ISLAND_OPENED_ON 을 **직접 쓰지 않는다.** 파이썬 기본 인자는
    # 함수 정의 시점에 한 번 굳어서, 나중에 모듈 상수를 바꿔도 반영되지 않는다
    # (테스트에서 개장일을 옮겨 끼우려다 조용히 실패한다). None 으로 받고 안에서 읽는다.
    opened_on: date | None = None,
) -> tuple[int, int]:
    """(현재 스트릭, 최고 스트릭). 하루 빠지면 절반으로 깎는다.

    **오늘은 깎지 않는다.** 아직 진행 중인 날을 실패로 치면, 낮 12시에 들어왔을 때
    스트릭이 이미 반토막 나 있게 되고 — 그러면 그날 하루를 통째로 포기하게 된다.
    오늘은 이미 다 채운 경우에만 +1 로 반영한다.
    """
    streak = 0
    best = 0
    cursor = opened_on if opened_on is not None else ISLAND_OPENED_ON
    while cursor < today:
        if cleared_by_date.get(cursor, False):
            streak += 1
            best = max(best, streak)
        else:
            # 기록이 아예 없는 날 = 안 한 날이다. 정수 나눗셈이라 1은 0이 된다.
            streak //= 2
        cursor += timedelta(days=1)

    if cleared_by_date.get(today, False):
        streak += 1
        best = max(best, streak)
    return streak, best


# ─────────────────────────── DB 조회 ───────────────────────────


def _coding_tests_by_date(db: Session, since: date) -> dict[date, int]:
    rows = (
        db.query(CodingTestLog.solved_date, func.count(CodingTestLog.id))
        .filter(CodingTestLog.solved_date >= since)
        .group_by(CodingTestLog.solved_date)
        .all()
    )
    return {row[0]: int(row[1]) for row in rows}


def _activities_by_date(db: Session, since: date) -> dict[date, DailyActivity]:
    rows = db.query(DailyActivity).filter(DailyActivity.date >= since).all()
    return {row.date: row for row in rows}


def cleared_history(db: Session, since: date | None = None) -> dict[date, bool]:
    """개장일 이후 각 날짜별 '4칸 다 채웠나'."""
    start = since or ISLAND_OPENED_ON
    activities = _activities_by_date(db, start)
    coding = _coding_tests_by_date(db, start)

    result: dict[date, bool] = {}
    for day in set(activities) | set(coding):
        flags = quest_flags(activities.get(day), coding.get(day, 0))
        result[day] = all(flags.values())
    return result


def today_snapshot(db: Session) -> dict:
    """섬에 들어왔을 때 보여줄 전부 — 4칸 상태 + 스트릭."""
    today = today_local()
    activity = db.query(DailyActivity).filter(DailyActivity.date == today).first()
    coding_today = (
        db.query(func.count(CodingTestLog.id))
        .filter(CodingTestLog.solved_date == today)
        .scalar()
        or 0
    )

    flags = quest_flags(activity, int(coding_today))

    history = cleared_history(db)
    history[today] = all(flags.values())
    streak, best = compute_streak(history, today)

    return {
        "date": today,
        "opened_on": ISLAND_OPENED_ON,
        "cleared": all(flags.values()),
        "streak": streak,
        "best_streak": best,
        "quests": [
            {
                "id": quest_id,
                "label": QUEST_LABELS[quest_id],
                "done": flags[quest_id],
                "detail": _detail(quest_id, activity, int(coding_today)),
            }
            for quest_id in QUEST_IDS
        ],
    }


def _detail(quest_id: str, activity: DailyActivity | None, coding_tests: int) -> str:
    """칸 아래 작게 붙는 한 줄. 뭘로 채워졌는지 보이게 한다."""
    if quest_id == "workout":
        if not (activity and activity.workout_done):
            return ""
        # 종목을 안 적은 날은 "운동"을 되풀이하지 않는다 — 줄 제목이 이미 '운동'이라
        # 같은 말이 두 번 찍히면 아무것도 안 알려주는 한 줄이 된다.
        kind = activity.workout_type.strip()
        if activity.workout_minutes and kind:
            return f"{kind} {activity.workout_minutes}분"
        if activity.workout_minutes:
            return f"{activity.workout_minutes}분"
        return kind or "완료"
    if quest_id == "coding-test":
        boj_auto = (activity.boj_solved_today or 0) if activity else 0
        parts = []
        if coding_tests:
            parts.append(f"{coding_tests}문제")
        if boj_auto:
            # 손으로 남긴 것과 구분해서 보여준다 — 어디서 온 숫자인지 알아야
            # solved.ac 가 조용히 멈췄을 때 눈치챌 수 있다.
            parts.append(f"백준 자동 {boj_auto}문제")
        return " · ".join(parts)
    if quest_id == "coding":
        if not activity:
            return ""
        parts = []
        if activity.github_commits:
            parts.append(f"커밋 {activity.github_commits}개")
        if activity.coding_minutes:
            parts.append(f"{activity.coding_minutes}분")
        return " · ".join(parts)
    if quest_id == "notion":
        if not (activity and activity.notion_done):
            return ""
        return activity.notion_title or "정리함"
    return ""


def history_rows(db: Session, days: int = 30) -> list[dict]:
    """잔디밭용 — 최근 N일을 오래된 순으로. 기록이 없는 날도 빈칸으로 채워 보낸다."""
    days = max(1, min(days, 365))
    today = today_local()
    start = max(ISLAND_OPENED_ON, today - timedelta(days=days - 1))

    activities = _activities_by_date(db, start)
    coding = _coding_tests_by_date(db, start)

    rows: list[dict] = []
    cursor = start
    while cursor <= today:
        flags = quest_flags(activities.get(cursor), coding.get(cursor, 0))
        rows.append(
            {
                "date": cursor,
                "cleared": all(flags.values()),
                "done_count": sum(1 for value in flags.values() if value),
            }
        )
        cursor += timedelta(days=1)
    return rows


# ─────────────────────────── 기록하기 ───────────────────────────
#
# **`activity_service.upsert_activity` 를 쓰면 안 된다.** 그건 관리자 폼이 보낸
# 전체 값으로 하루를 통째로 덮어쓰므로, 섬에서 운동만 찍으면 그날의 커밋 수와
# 메모가 같이 0 으로 날아간다. 여기서는 건드릴 칸만 건드린다.


def _today_row(db: Session) -> DailyActivity:
    today = today_local()
    activity = db.query(DailyActivity).filter(DailyActivity.date == today).first()
    if not activity:
        activity = DailyActivity(date=today)
        db.add(activity)
        db.commit()
        db.refresh(activity)
    return activity


def set_workout(db: Session, done: bool, minutes: int = 0, workout_type: str = "") -> None:
    activity = _today_row(db)
    activity.workout_done = done
    activity.workout_minutes = max(0, minutes) if done else 0
    activity.workout_type = workout_type.strip() if done else ""
    db.commit()


def set_notion(db: Session, url: str = "", title: str = "") -> None:
    """url 이 비면 취소로 본다 — 잘못 누른 걸 되돌릴 수 있어야 한다."""
    activity = _today_row(db)
    url = url.strip()
    activity.notion_url = url
    activity.notion_title = title.strip()
    activity.notion_done = bool(url)
    db.commit()


def set_github_commits(db: Session, commits: int) -> None:
    """섬에서 부르는 깃허브 동기화. `activity_service.upsert_activity` 를 안 쓰는
    이유는 위 주석과 같다 — 하루 전체를 덮어쓰지 않고 이 칸만 건드린다."""
    activity = _today_row(db)
    activity.github_commits = max(0, commits)
    db.commit()


def apply_boj_snapshot(db: Session, current_total: int) -> int:
    """solved.ac 총합 스냅샷을 오늘 행에 반영하고, **오늘 푼 수**를 돌려준다.

    오늘 푼 수 = 오늘 총합 − *직전 기록일*의 총합. 직전 '새로고침'이 아니라
    직전 **날짜**를 기준으로 잡아야, 하루에 여러 번 들어와도 값이 안 흔들린다.

    **첫 실행은 기준선만 잡고 0 을 돌려준다.** 안 그러면 여태 푼 문제 수천 개가
    통째로 '오늘 푼 것'으로 잡혀서 첫날부터 코테 칸이 거짓으로 채워진다.
    """
    today = today_local()
    activity = _today_row(db)

    previous = (
        db.query(DailyActivity)
        .filter(DailyActivity.date < today, DailyActivity.boj_solved_total > 0)
        .order_by(DailyActivity.date.desc())
        .first()
    )

    if previous is None:
        solved_today = 0  # 기준선 잡는 날
    else:
        solved_today = max(0, current_total - (previous.boj_solved_total or 0))

    activity.boj_solved_total = current_total
    activity.boj_solved_today = solved_today
    db.commit()
    return solved_today


def set_coding_minutes(db: Session, minutes: int) -> None:
    """커밋 없이 코딩만 한 날을 위한 수동 입력."""
    activity = _today_row(db)
    activity.coding_minutes = max(0, minutes)
    db.commit()
