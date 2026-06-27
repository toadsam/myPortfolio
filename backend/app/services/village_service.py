from app.models import DailyActivity
from app.schemas import BuildingState, NpcState, VillageState


PROJECT_BUILDING_IDS = [
    "project-mywave",
    "project-mystock",
    "project-festflow",
    "project-sign-language",
    "project-aclub",
    "project-ajou-adventure",
    "project-ajouchong",
    "project-muscleup",
    "project-darklab",
    "project-tserof",
]

SKILL_BUILDING_IDS = [
    "skill-frontend",
    "skill-3d",
    "skill-backend",
    "skill-game",
    "skill-workflow",
]

EXPERIENCE_BUILDING_IDS = [
    "exp-unity-ui",
    "exp-demo-platform",
    "exp-portfolio",
]


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
    memo_score = 35 if activity.memo.strip() else 0
    overall_score = min(commit_score + study_score + workout_score // 2 + memo_score, 100)

    buildings: list[BuildingState] = [
        BuildingState(
            building_id="central-plaza",
            light_level=_light_for_score(overall_score),
            activity_score=overall_score,
            reason="오늘의 전체 활동량이 중앙 광장의 밝기를 결정합니다.",
        )
    ]

    for building_id in PROJECT_BUILDING_IDS:
        buildings.append(
            BuildingState(
                building_id=building_id,
                light_level=_light_for_score(commit_score),
                activity_score=commit_score,
                reason=f"오늘 GitHub 커밋 {activity.github_commits}개가 프로젝트 구역 조명에 반영되었습니다.",
            )
        )

    for building_id in SKILL_BUILDING_IDS:
        buildings.append(
            BuildingState(
                building_id=building_id,
                light_level=_light_for_score(study_score),
                activity_score=study_score,
                reason=f"오늘 공부 {activity.study_minutes}분이 기술 스택 구역의 에너지로 전환되었습니다.",
            )
        )

    for building_id in EXPERIENCE_BUILDING_IDS:
        score = max(memo_score, study_score // 2)
        buildings.append(
            BuildingState(
                building_id=building_id,
                light_level=_light_for_score(score),
                activity_score=score,
                reason="오늘 메모와 학습 시간이 경험 기록관의 분위기를 만듭니다.",
            )
        )

    contact_score = max(overall_score // 2, memo_score)
    buildings.append(
        BuildingState(
            building_id="post-office",
            light_level=_light_for_score(contact_score),
            activity_score=contact_score,
            reason="전체 활동과 메모가 연락 우체국의 응답 준비 상태를 높입니다.",
        )
    )

    guide_mood = "training" if activity.workout_done else "sleepy" if overall_score <= 10 else "proud"
    project_mood = "busy" if activity.github_commits >= 5 else "calm"
    developer_mood = "focused" if activity.study_minutes >= 90 else "calm"
    archivist_mood = "curious" if activity.memo.strip() else "calm"

    npcs = [
        NpcState(npc_id="guide-npc", mood=guide_mood, status_text=_guide_status(activity)),
        NpcState(
            npc_id="project-npc",
            mood=project_mood,
            status_text=f"커밋 {activity.github_commits}개를 바탕으로 대표 프로젝트 추천 순서를 정리 중입니다.",
        ),
        NpcState(
            npc_id="developer-npc",
            mood=developer_mood,
            status_text=f"오늘 공부 시간 {activity.study_minutes}분을 기술 설명의 집중도에 반영했습니다.",
        ),
        NpcState(
            npc_id="archivist-npc",
            mood=archivist_mood,
            status_text=activity.memo or "오늘의 메모를 기다리며 성장 기록을 정리하고 있습니다.",
        ),
        NpcState(
            npc_id="contact-npc",
            mood="calm",
            status_text="방문자가 관심을 보이면 이메일과 GitHub 동선을 바로 안내할 준비가 되어 있습니다.",
        ),
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
        return "운동 완료 기록 덕분에 광장 장식과 가이드 NPC 상태가 활기찹니다."
    if activity.github_commits == 0 and activity.study_minutes == 0:
        return "아직 오늘 활동 기록이 없어 마을이 조용합니다."
    return "오늘 활동 기록을 방문자에게 안내할 준비가 되어 있습니다."


def _summary(activity: DailyActivity, overall_score: int) -> str:
    if overall_score >= 80:
        return "오늘의 정재훈 마을은 매우 활발합니다. NPC들이 방문자 응대를 적극적으로 준비하고 있어요."
    if overall_score >= 40:
        return "오늘의 정재훈 마을은 안정적으로 움직이고 있습니다."
    if overall_score > 0:
        return "오늘의 정재훈 마을은 천천히 깨어나는 중입니다."
    return "오늘의 정재훈 마을은 아직 조용합니다."
