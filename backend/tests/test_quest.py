"""갓생 섬 — 퀘스트 판정과 '깎이는' 연속 기록 규칙.

스트릭은 DB에 저장하지 않고 매번 다시 계산한다(quest_service 주석 참고).
그래서 **규칙이 곧 저장소**다 — 여기가 깨지면 지난 기록이 통째로 다르게 읽힌다.
"""

from datetime import date, timedelta

from app.models import DailyActivity
from app.services.quest_service import compute_streak, quest_flags


OPENED = date(2026, 1, 1)


def _days(pattern: str) -> dict[date, bool]:
    """'OOXO' → 개장일부터 하루씩. O=달성, X=실패(또는 기록 없음)."""
    return {OPENED + timedelta(days=i): ch == "O" for i, ch in enumerate(pattern)}


def _today(pattern: str) -> date:
    """패턴 **다음 날**이 '오늘'이다.

    마지막 날을 오늘로 잡으면 안 된다 — 오늘은 일부러 깎지 않는 날이라,
    패턴 끝의 X 가 규칙에 닿지 못하고 그냥 무시된다. 패턴 전체를 과거로 두어야
    '깎임'을 검사할 수 있다.
    """
    return OPENED + timedelta(days=len(pattern))


# ─────────────────────────── 스트릭 ───────────────────────────


def test_연속_달성이면_날짜만큼_쌓인다():
    streak, best = compute_streak(_days("OOOOO"), _today("OOOOO"), OPENED)
    assert streak == 5
    assert best == 5


def test_하루_빠지면_0이_아니라_절반이_된다():
    # 10일 쌓고 하루 빠짐 → 5 (0으로 리셋하지 않는 것이 이 규칙의 핵심)
    streak, _ = compute_streak(_days("OOOOOOOOOOX"), _today("OOOOOOOOOOX"), OPENED)
    assert streak == 5


def test_빠진_뒤_다시_쌓으면_절반에서_이어진다():
    streak, best = compute_streak(_days("OOOOOOOOOOXOO"), _today("OOOOOOOOOOXOO"), OPENED)
    assert streak == 7  # 10 → 5 → 6 → 7
    assert best == 10  # 최고 기록은 깎이지 않는다


def test_이틀_연속_빠지면_두_번_깎인다():
    streak, _ = compute_streak(_days("OOOOOOOOXX"), _today("OOOOOOOOXX"), OPENED)
    assert streak == 2  # 8 → 4 → 2


def test_1에서_빠지면_0이_된다():
    # 정수 나눗셈이라 1//2 == 0. 바닥은 0이고 음수로 내려가지 않는다.
    streak, _ = compute_streak(_days("OX"), _today("OX"), OPENED)
    assert streak == 0


def test_계속_빠져도_음수로_안_내려간다():
    streak, _ = compute_streak(_days("XXXXX"), _today("XXXXX"), OPENED)
    assert streak == 0


def test_기록이_아예_없는_날은_실패로_친다():
    # 사이 날짜 키가 통째로 빠져 있어도 결과가 'X' 와 같아야 한다.
    sparse = {OPENED: True, OPENED + timedelta(days=1): True, OPENED + timedelta(days=3): True}
    streak, _ = compute_streak(sparse, OPENED + timedelta(days=4), OPENED)
    assert streak == 2  # 2 → (키가 없는 날) 1 → 2


def test_오늘은_못_채워도_깎이지_않는다():
    """낮에 들어왔을 때 스트릭이 이미 반토막 나 있으면 그날을 통째로 포기하게 된다."""
    history = _days("OOOO")  # 어제까지 4일 연속
    today = OPENED + timedelta(days=4)  # 오늘은 아직 아무것도 안 함
    streak, _ = compute_streak(history, today, OPENED)
    assert streak == 4


def test_오늘_채우면_바로_반영된다():
    history = _days("OOOO")
    today = OPENED + timedelta(days=4)
    history[today] = True
    streak, _ = compute_streak(history, today, OPENED)
    assert streak == 5


def test_개장일_이전은_세지_않는다():
    """이 기능이 없던 과거가 실패로 잡히면 스트릭이 영원히 0에서 시작한다."""
    history = {OPENED - timedelta(days=day): False for day in range(1, 200)}
    history.update(_days("OOO"))
    streak, _ = compute_streak(history, _today("OOO"), OPENED)
    assert streak == 3


# ─────────────────────────── 4칸 판정 ───────────────────────────


def _activity(**kwargs) -> DailyActivity:
    return DailyActivity(date=OPENED, **kwargs)


def test_기록이_아예_없으면_네_칸_모두_비어있다():
    assert quest_flags(None, 0) == {
        "workout": False,
        "coding-test": False,
        "coding": False,
        "notion": False,
    }


def test_운동은_workout_done_으로_판정한다():
    assert quest_flags(_activity(workout_done=True), 0)["workout"] is True


def test_코딩은_커밋이나_직접입력_둘_중_하나면_된다():
    assert quest_flags(_activity(github_commits=3), 0)["coding"] is True
    assert quest_flags(_activity(coding_minutes=40), 0)["coding"] is True
    assert quest_flags(_activity(github_commits=0, coding_minutes=0), 0)["coding"] is False


def test_코테는_그날_기록_건수로_판정한다():
    assert quest_flags(None, 1)["coding-test"] is True
    assert quest_flags(None, 0)["coding-test"] is False


def test_노션은_링크가_있어야_완료다():
    assert quest_flags(_activity(notion_done=True), 0)["notion"] is True
    assert quest_flags(_activity(notion_done=False), 0)["notion"] is False


# ─────────────────────── 백준 스냅샷 (solved.ac) ───────────────────────
#
# 이 규칙이 틀리면 코테 칸이 **거짓으로 채워진다**. 첫날 기준선을 안 잡으면
# 여태 푼 수천 문제가 전부 '오늘 푼 것'이 된다.

from datetime import timedelta as _td

from app.services.quest_service import apply_boj_snapshot
from app.time_utils import today_local


def test_첫_조회는_기준선만_잡고_0을_돌려준다(db_session):
    """여태 푼 1200 문제가 '오늘 푼 것'으로 잡히면 안 된다."""
    assert apply_boj_snapshot(db_session, 1200) == 0

    row = db_session.query(DailyActivity).filter(DailyActivity.date == today_local()).one()
    assert row.boj_solved_total == 1200  # 기준선은 저장됐다
    assert row.boj_solved_today == 0


def test_어제_대비_증가분이_오늘_푼_수다(db_session):
    yesterday = DailyActivity(date=today_local() - _td(days=1), boj_solved_total=1200)
    db_session.add(yesterday)
    db_session.commit()

    assert apply_boj_snapshot(db_session, 1203) == 3


def test_하루에_여러_번_불러도_값이_안_흔들린다(db_session):
    """직전 '새로고침'이 아니라 직전 '날짜'가 기준이라 몇 번을 불러도 같다."""
    db_session.add(DailyActivity(date=today_local() - _td(days=1), boj_solved_total=1200))
    db_session.commit()

    assert apply_boj_snapshot(db_session, 1203) == 3
    assert apply_boj_snapshot(db_session, 1203) == 3
    assert apply_boj_snapshot(db_session, 1205) == 5


def test_기록이_빈_날들을_건너뛰고_마지막_기준선을_찾는다(db_session):
    """섬에 며칠 안 들어온 뒤 와도 그 사이 총합 증가분이 전부 잡히면 안 된다 —
    마지막으로 총합을 남긴 날을 기준으로 잡는다."""
    db_session.add(DailyActivity(date=today_local() - _td(days=5), boj_solved_total=1200))
    db_session.add(DailyActivity(date=today_local() - _td(days=2), boj_solved_total=1210))
    db_session.commit()

    assert apply_boj_snapshot(db_session, 1212) == 2  # 1210 기준이지 1200 이 아니다


def test_총합이_줄어도_음수가_안_된다(db_session):
    """solved.ac 가 이상한 값을 주거나 문제가 내려가도 음수는 안 된다."""
    db_session.add(DailyActivity(date=today_local() - _td(days=1), boj_solved_total=1200))
    db_session.commit()

    assert apply_boj_snapshot(db_session, 1190) == 0


def test_백준_자동분만_있어도_코테_칸이_채워진다():
    """프로그래머스는 수동인데 백준은 자동이라, 자동분만으로도 통과해야 한다."""
    activity = DailyActivity(date=OPENED, boj_solved_today=2)
    assert quest_flags(activity, 0)["coding-test"] is True


def test_자동분이_0이면_코테_칸은_안_채워진다():
    activity = DailyActivity(date=OPENED, boj_solved_today=0)
    assert quest_flags(activity, 0)["coding-test"] is False
