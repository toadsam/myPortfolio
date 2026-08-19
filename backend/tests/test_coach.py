"""갓생 섬 코치 — 규칙 기반(=OpenAI 없이) 대사가 상황을 실제로 가르는지.

AI 응답은 테스트할 수 없지만 **키가 없을 때 나오는 말은 항상 이 코드가 만든다.**
여기가 뭉개져서 어떤 상황에서든 같은 말이 나오면 코치는 없느니만 못하다.
"""

import datetime as dt

import pytest

from app.models import CodingTestLog, DailyActivity
from app.services import coach_service, quest_service
from app.time_utils import today_local


@pytest.fixture()
def past_opening(monkeypatch):
    """개장일을 60일 전으로 — 안 그러면 과거 기록이 스트릭에 안 잡힌다."""
    monkeypatch.setattr(
        quest_service, "ISLAND_OPENED_ON", today_local() - dt.timedelta(days=60)
    )


def _seed(db, *, workout=False, commits=0, notion=False, coding_test=False, prior_days=0):
    today = today_local()
    for offset in range(1, prior_days + 1):
        day = today - dt.timedelta(days=offset)
        db.add(DailyActivity(date=day, workout_done=True, github_commits=1, notion_done=True))
        db.add(CodingTestLog(solved_date=day, title="지난 문제"))
    db.add(
        DailyActivity(date=today, workout_done=workout, github_commits=commits, notion_done=notion)
    )
    if coding_test:
        db.add(CodingTestLog(solved_date=today, title="오늘 문제"))
    db.commit()


def _at_hour(monkeypatch, hour: int):
    class FrozenDatetime:
        @staticmethod
        def now(tz=None):
            return dt.datetime(2026, 8, 18, hour, 0, tzinfo=tz)

    monkeypatch.setattr(coach_service, "datetime", FrozenDatetime)


# ─────────────────────────── 브리핑 ───────────────────────────


def test_한_칸_남으면_그_칸을_콕_집는다(db_session, past_opening, monkeypatch):
    _at_hour(monkeypatch, 14)
    _seed(db_session, workout=True, commits=2, notion=True)
    message = coach_service._fallback_briefing(db_session)
    assert "코딩테스트" in message
    assert "하나" in message


def test_밤에_스트릭이_걸려_있으면_잃을_값을_말한다(db_session, past_opening, monkeypatch):
    """이 규칙의 동기 장치는 '얼마를 잃는가'다. 숫자가 빠지면 그냥 잔소리가 된다."""
    _at_hour(monkeypatch, 22)
    _seed(db_session, prior_days=8)
    message = coach_service._fallback_briefing(db_session)
    assert "8일" in message  # 이어온 것
    assert "4일" in message  # 깎이면 남는 것


def test_아침에는_밤과_다른_말을_한다(db_session, past_opening, monkeypatch):
    _seed(db_session, prior_days=8)
    _at_hour(monkeypatch, 9)
    morning = coach_service._fallback_briefing(db_session)
    _at_hour(monkeypatch, 22)
    night = coach_service._fallback_briefing(db_session)
    assert morning != night


def test_다_채운_날은_연속일수를_인정해준다(db_session, past_opening, monkeypatch):
    _at_hour(monkeypatch, 20)
    _seed(db_session, workout=True, commits=2, notion=True, coding_test=True, prior_days=5)
    message = coach_service._fallback_briefing(db_session)
    assert "6일" in message  # 지난 5일 + 오늘


def test_상황이_다르면_대사도_다르다(db_session, past_opening, monkeypatch):
    """네 갈래가 같은 문장으로 뭉개지지 않는지 — 이 파일의 존재 이유다."""
    _at_hour(monkeypatch, 9)
    _seed(db_session)
    nothing_done = coach_service._fallback_briefing(db_session)

    row = db_session.query(DailyActivity).filter(DailyActivity.date == today_local()).one()
    row.workout_done = True
    row.github_commits = 2
    row.notion_done = True
    db_session.commit()
    one_left = coach_service._fallback_briefing(db_session)

    db_session.add(CodingTestLog(solved_date=today_local(), title="끝"))
    db_session.commit()
    all_done = coach_service._fallback_briefing(db_session)

    assert len({nothing_done, one_left, all_done}) == 3


# ─────────────────────────── 대화 ───────────────────────────


def test_뭐_남았냐고_물으면_남은_칸을_읊는다(db_session, past_opening):
    _seed(db_session, workout=True)
    answer = coach_service._fallback_reply(db_session, "오늘 뭐 남았어?")
    assert "코딩테스트" in answer
    assert "운동" not in answer  # 이미 한 건 안 읊는다


def test_힘들다고_하면_다_하라고_밀어붙이지_않는다(db_session, past_opening):
    """여기서 '그래도 다 해라'라고 하면 그날로 앱을 닫는다."""
    _seed(db_session)
    answer = coach_service._fallback_reply(db_session, "너무 힘들다 오늘은 쉬고 싶어")
    assert "하나만" in answer


def test_며칠째냐고_물으면_숫자로_답한다(db_session, past_opening):
    _seed(db_session, prior_days=3)
    answer = coach_service._fallback_reply(db_session, "나 며칠째야?")
    assert "3일째" in answer


# ─────────────────────────── 컨텍스트 ───────────────────────────


def test_코치는_없는_기록을_넘겨받지_않는다(db_session, past_opening):
    """프롬프트에 들어가는 값이 곧 코치가 아는 전부다 — 빈 날은 빈 대로 넘어가야 한다."""
    _seed(db_session)
    context = coach_service.build_context(db_session)
    assert "오늘 끝낸 것: 아직 없음" in context
    assert "어제 기록: 없음" in context
