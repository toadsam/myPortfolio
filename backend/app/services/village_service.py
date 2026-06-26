from app.models import DailyActivity
from app.schemas import BuildingState, NpcState, VillageState


def _light_for_score(score: int) -> str:
    if score <= 0:
        return "dark"
    if score < 35:
        return "dim"
    if score < 75:
        return "normal"
    return "bright"


def derive_village_state(activity: DailyActivity) -> VillageState:
    commit_score = min(activity.github_commits * 18, 100)
    study_score = min(activity.study_minutes // 2, 100)
    workout_score = 100 if activity.workout_done else 0
    overall_score = min(commit_score + study_score + workout_score // 2, 100)

    buildings = [
        BuildingState(
            building_id="project-demotion",
            light_level=_light_for_score(commit_score),
            activity_score=commit_score,
            reason=f"오늘 GitHub 커밋 {activity.github_commits}개가 연구소 조명에 반영됐습니다.",
        ),
        BuildingState(
            building_id="project-mywave",
            light_level=_light_for_score(study_score),
            activity_score=study_score,
            reason=f"오늘 공부 {activity.study_minutes}분이 분석실 에너지로 전환됐습니다.",
        ),
        BuildingState(
            building_id="project-farm",
            light_level=_light_for_score(workout_score),
            activity_score=workout_score,
            reason="운동 완료 여부가 농장주 건물의 활력에 반영됩니다.",
        ),
        BuildingState(
            building_id="central-plaza",
            light_level=_light_for_score(overall_score),
            activity_score=overall_score,
            reason="오늘의 전체 활동량이 광장 분위기를 결정합니다.",
        ),
    ]

    npc_mood = "busy" if activity.github_commits >= 5 else "calm"
    if activity.workout_done:
        guide_mood = "training"
    elif overall_score <= 10:
        guide_mood = "sleepy"
    else:
        guide_mood = "proud"

    npcs = [
        NpcState(npc_id="guide-npc", mood=guide_mood, status_text=_guide_status(activity)),
        NpcState(npc_id="project-npc", mood=npc_mood, status_text=f"커밋 {activity.github_commits}개를 바탕으로 프로젝트 기록을 정리 중입니다."),
        NpcState(npc_id="developer-npc", mood="busy" if activity.study_minutes >= 90 else "calm", status_text=f"오늘 학습 시간은 {activity.study_minutes}분입니다."),
        NpcState(npc_id="archivist-npc", mood="calm", status_text=activity.memo or "오늘의 기록을 기다리고 있습니다."),
        NpcState(npc_id="contact-npc", mood="calm", status_text="방문자에게 연락 동선을 안내하고 있습니다."),
    ]

    unlocked_items: list[str] = []
    if activity.workout_done:
        unlocked_items.append("training-statue")
    if activity.github_commits >= 5:
        unlocked_items.append("lab-beacon")
    if activity.study_minutes >= 120:
        unlocked_items.append("study-fountain")

    return VillageState(
        activity=activity,
        buildings=buildings,
        npcs=npcs,
        unlocked_items=unlocked_items,
        summary=_summary(activity, overall_score),
    )


def _guide_status(activity: DailyActivity) -> str:
    if activity.workout_done:
        return "운동 완료 기록 덕분에 광장에 활력이 돌고 있습니다."
    if activity.github_commits == 0 and activity.study_minutes == 0:
        return "아직 오늘의 활동 기록이 없어 마을이 조용합니다."
    return "오늘 활동 기록을 방문자에게 안내할 준비가 됐습니다."


def _summary(activity: DailyActivity, overall_score: int) -> str:
    if overall_score >= 80:
        return "오늘의 정재훈 마을은 매우 활발합니다."
    if overall_score >= 40:
        return "오늘의 정재훈 마을은 안정적으로 움직이고 있습니다."
    if overall_score > 0:
        return "오늘의 정재훈 마을은 천천히 깨어나는 중입니다."
    return "오늘의 정재훈 마을은 아직 조용합니다."
