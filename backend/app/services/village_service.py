from app.models import DailyActivity
from app.schemas import BuildingState, NpcState, VillageState


PROJECT_BUILDING_IDS = {
    "mywave": "project-mywave",
    "mystock": "project-mystock",
    "festflow": "project-festflow",
    "sign-language": "project-sign-language",
    "aclub": "project-aclub",
    "ajou-adventure": "project-ajou-adventure",
    "ajouchong": "project-ajouchong",
    "muscleup": "project-muscleup",
    "darklab": "project-darklab",
    "tserof": "project-tserof",
}

SKILL_TECH_MAP = {
    "skill-frontend": ["react", "typescript", "next", "tailwind", "vite"],
    "skill-3d": ["three", "r3f", "drei", "motion", "3d"],
    "skill-backend": ["fastapi", "spring", "mysql", "postgres", "api", "sse"],
    "skill-game": ["unity", "c#", "phaser", "xr", "game"],
    "skill-workflow": ["github", "docker", "nginx", "deploy", "ci"],
}

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
    study_score = min(activity.study_minutes // 2 + len(activity.study_topics or []) * 8, 100)
    coding_score = min(activity.coding_minutes // 3 + sum((activity.project_minutes or {}).values()) // 4, 100)
    workout_score = min(activity.workout_minutes * 2, 100) if activity.workout_done else 0
    focus_score = max(0, min(activity.focus_score, 100))
    memo_score = 35 if activity.memo.strip() else 0
    overall_score = min(
        commit_score // 2 + study_score // 2 + coding_score + workout_score // 3 + focus_score // 4 + memo_score,
        100,
    )

    buildings: list[BuildingState] = [
        BuildingState(
            building_id="central-plaza",
            light_level=_light_for_score(overall_score),
            activity_score=overall_score,
            reason="오늘의 전체 활동량이 중앙 광장의 밝기를 결정합니다.",
        )
    ]

    touched_repos = [item.lower() for item in (activity.github_repos or [])]
    project_minutes = activity.project_minutes or {}
    active_project_ids: list[str] = []

    for project_id, building_id in PROJECT_BUILDING_IDS.items():
        minutes = int(project_minutes.get(project_id, 0))
        repo_bonus = 28 if _repo_matches_project(project_id, touched_repos) else 0
        project_score = min(minutes + repo_bonus + (commit_score // 3 if minutes > 0 else 0), 100)
        if project_score > 0:
            active_project_ids.append(project_id)
        buildings.append(
            BuildingState(
                building_id=building_id,
                light_level=_light_for_score(project_score),
                activity_score=project_score,
                reason=_project_reason(project_id, minutes, repo_bonus, activity.github_commits),
            )
        )

    for building_id in SKILL_BUILDING_IDS:
        tech_bonus = _tech_bonus(building_id, activity.studied_tech or [])
        skill_score = min(study_score + tech_bonus, 100)
        buildings.append(
            BuildingState(
                building_id=building_id,
                light_level=_light_for_score(skill_score),
                activity_score=skill_score,
                reason=f"오늘 공부 {activity.study_minutes}분과 기술 기록 {len(activity.studied_tech or [])}개가 이 구역의 에너지로 전환되었습니다.",
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
    project_mood = "busy" if active_project_ids or activity.github_commits >= 5 else "calm"
    developer_mood = "focused" if activity.study_minutes >= 90 or activity.coding_minutes >= 120 else "calm"
    archivist_mood = "curious" if activity.memo.strip() else "calm"

    npcs = [
        NpcState(npc_id="guide-npc", mood=guide_mood, status_text=_guide_status(activity)),
        NpcState(
            npc_id="project-npc",
            mood=project_mood,
            status_text=_project_status(activity, active_project_ids),
        ),
        NpcState(
            npc_id="developer-npc",
            mood=developer_mood,
            status_text=f"공부 {activity.study_minutes}분, 코딩 {activity.coding_minutes}분, 집중도 {activity.focus_score}%를 기술 설명의 밀도에 반영했습니다.",
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
    if activity.coding_minutes >= 180:
        unlocked_items.append("deep-work-terminal")
    if active_project_ids:
        unlocked_items.extend(f"active-{project_id}" for project_id in active_project_ids[:3])

    return VillageState(
        activity=activity,
        buildings=buildings,
        npcs=npcs,
        unlocked_items=unlocked_items,
        summary=_summary(activity, overall_score),
    )


def _guide_status(activity: DailyActivity) -> str:
    if activity.workout_done:
        return f"{activity.workout_type or '운동'} {activity.workout_minutes}분 기록 덕분에 광장 장식과 가이드 NPC 상태가 활기찹니다."
    if activity.github_commits == 0 and activity.study_minutes == 0 and activity.coding_minutes == 0:
        return "아직 오늘 활동 기록이 없어 마을이 조용합니다."
    return "오늘 활동 기록을 방문자에게 안내할 준비가 되어 있습니다."


def _summary(activity: DailyActivity, overall_score: int) -> str:
    worked_projects = [key for key, minutes in (activity.project_minutes or {}).items() if minutes > 0]
    if overall_score >= 80:
        return f"오늘의 정재훈 마을은 매우 활발합니다. 코딩 {activity.coding_minutes}분, 공부 {activity.study_minutes}분, 프로젝트 {len(worked_projects)}개 기록이 반영됐어요."
    if overall_score >= 40:
        return f"오늘의 정재훈 마을은 안정적으로 움직이고 있습니다. 기록된 작업 프로젝트는 {len(worked_projects)}개입니다."
    if overall_score > 0:
        return "오늘의 정재훈 마을은 천천히 깨어나는 중입니다."
    return "오늘의 정재훈 마을은 아직 조용합니다."


def _repo_matches_project(project_id: str, repos: list[str]) -> bool:
    normalized_project = project_id.replace("-", "").lower()
    return any(normalized_project in repo.replace("-", "").replace("_", "").lower() for repo in repos)


def _project_reason(project_id: str, minutes: int, repo_bonus: int, commits: int) -> str:
    if minutes > 0 and repo_bonus > 0:
        return f"오늘 {project_id} 작업 {minutes}분과 GitHub repo 기록이 이 건물을 밝게 만들었습니다."
    if minutes > 0:
        return f"오늘 {project_id} 작업 {minutes}분이 이 프로젝트 건물의 조명에 반영되었습니다."
    if repo_bonus > 0:
        return f"GitHub에서 {project_id} 관련 repo 활동이 감지되어 건물이 활성화되었습니다."
    if commits > 0:
        return f"오늘 전체 커밋 {commits}개가 약한 기본 에너지로 반영되었습니다."
    return "오늘 이 프로젝트에 기록된 작업이 없어 조용한 상태입니다."


def _tech_bonus(building_id: str, studied_tech: list[str]) -> int:
    tokens = SKILL_TECH_MAP.get(building_id, [])
    normalized = [item.lower().replace(".", "").replace(" ", "") for item in studied_tech]
    matches = 0
    for token in tokens:
        clean_token = token.lower().replace(".", "").replace(" ", "")
        if any(clean_token in item or item in clean_token for item in normalized):
            matches += 1
    return min(matches * 18, 55)


def _project_status(activity: DailyActivity, active_project_ids: list[str]) -> str:
    if active_project_ids:
        projects = ", ".join(active_project_ids[:3])
        return f"오늘 작업한 {projects} 프로젝트를 중심으로 추천 순서를 정리 중입니다."
    return f"커밋 {activity.github_commits}개를 바탕으로 대표 프로젝트 추천 순서를 정리 중입니다."
