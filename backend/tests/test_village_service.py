from datetime import date, datetime, timezone

from app.models import DailyActivity
from app.services.village_service import derive_village_state


def make_activity(**overrides) -> DailyActivity:
    """derive_village_state는 순수 함수라 DB 없이 plain 객체로 테스트 가능.

    SQLAlchemy의 mapped_column(default=...)는 INSERT 시점에만 적용되므로,
    산술 연산에 쓰이는 필드와, VillageState 응답 직렬화(ActivityOut)에 필요한
    id/date/created_at/updated_at까지 여기서 명시적으로 채워줘야 한다.
    """
    now = datetime.now(timezone.utc)
    defaults = dict(
        id=1,
        date=date(2026, 1, 1),
        created_at=now,
        updated_at=now,
        github_commits=0,
        github_repos=[],
        study_minutes=0,
        study_topics=[],
        studied_tech=[],
        coding_minutes=0,
        project_minutes={},
        workout_done=False,
        workout_minutes=0,
        workout_type="",
        focus_score=50,
        memo="",
        mood="steady",
    )
    defaults.update(overrides)
    return DailyActivity(**defaults)


def building(state, building_id):
    return next(b for b in state.buildings if b.building_id == building_id)


def test_empty_day_is_quiet_and_nothing_unlocked():
    # focus_score는 기본값 50이라 완전히 0점을 보려면 명시적으로 0을 줘야 한다
    state = derive_village_state(make_activity(focus_score=0))
    assert state.unlocked_items == []
    assert building(state, "central-plaza").light_level == "dark"
    assert "아직 조용합니다" in state.summary


def test_workout_unlocks_training_statue_and_lifts_guide_mood():
    state = derive_village_state(make_activity(workout_done=True, workout_minutes=40))
    assert "training-statue" in state.unlocked_items
    guide = next(n for n in state.npcs if n.npc_id == "guide-npc")
    assert guide.mood == "training"


def test_five_commits_unlocks_lab_beacon_and_busies_project_npc():
    state = derive_village_state(make_activity(github_commits=5))
    assert "lab-beacon" in state.unlocked_items
    project_npc = next(n for n in state.npcs if n.npc_id == "project-npc")
    assert project_npc.mood == "busy"


def test_long_study_unlocks_fountain():
    state = derive_village_state(make_activity(study_minutes=120))
    assert "study-fountain" in state.unlocked_items


def test_long_coding_unlocks_deep_work_terminal():
    state = derive_village_state(make_activity(coding_minutes=180))
    assert "deep-work-terminal" in state.unlocked_items


def test_project_minutes_lights_up_matching_building_and_unlocks_active_flag():
    state = derive_village_state(make_activity(project_minutes={"mywave": 30}))
    assert building(state, "project-mywave").light_level != "dark"
    assert "active-mywave" in state.unlocked_items
    # 손대지 않은 다른 프로젝트 건물은 그대로 어두워야 함
    assert building(state, "project-festflow").light_level == "dark"


def test_coding_test_today_brightens_study_codingtest_building():
    state = derive_village_state(make_activity(), coding_today=2, coding_total=2)
    assert building(state, "study-codingtest").light_level == "bright"


def test_coding_test_history_only_keeps_dim_baseline():
    state = derive_village_state(make_activity(), coding_today=0, coding_total=10)
    # 오늘 기록이 없으면 누적 기록은 60점 미만의 은은한 밝기만 준다
    assert building(state, "study-codingtest").activity_score < 60
