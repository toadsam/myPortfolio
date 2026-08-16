from collections import Counter

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.catalog import NPCS, PROJECTS
from app.models import (
    ManagedProject,
    NpcConversationLog,
    NpcPresetSetting,
    VillageBuildingOverride,
    VisitorEvent,
)
from app.schemas import (
    AnalyticsMetric,
    AnalyticsSummary,
    ManagedProjectIn,
    NpcPresetIn,
    VillageBuildingOverrideIn,
    VillageState,
    VisitorEventIn,
)
from app.security import ai_usage_snapshot


def seed_admin_defaults(db: Session) -> None:
    for project_id, project in PROJECTS.items():
        exists = db.get(ManagedProject, project_id)
        if exists:
            continue
        db.add(
            ManagedProject(
                id=project_id,
                title=str(project["title"]),
                summary=str(project["summary"]),
                role=str(project["role"]),
                tech=list(project["tech"]),
                priority=80 if project_id in {"mystock", "festflow", "muscleup"} else 50,
                featured=project_id in {"mystock", "festflow", "muscleup"},
                visible=True,
            )
        )

    for npc_id, npc in NPCS.items():
        exists = db.get(NpcPresetSetting, npc_id)
        if exists:
            continue
        db.add(
            NpcPresetSetting(
                npc_id=npc_id,
                questions=_default_questions_for_npc(npc_id),
                enabled=True,
            )
        )

    db.commit()


def record_visitor_event(db: Session, payload: VisitorEventIn) -> VisitorEvent:
    event = VisitorEvent(
        event_type=payload.event_type.strip(),
        target_id=payload.target_id.strip(),
        label=payload.label.strip(),
        session_id=payload.session_id.strip(),
        metadata_json=dict(payload.metadata),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def analytics_summary(db: Session, limit: int = 30) -> AnalyticsSummary:
    total_events = db.query(func.count(VisitorEvent.id)).scalar() or 0
    unique_sessions = db.query(func.count(func.distinct(VisitorEvent.session_id))).filter(
        VisitorEvent.session_id != ""
    ).scalar() or 0
    npc_messages = db.query(func.count(NpcConversationLog.id)).scalar() or 0
    project_views = db.query(func.count(VisitorEvent.id)).filter(
        VisitorEvent.event_type.in_(["project_view", "project_open", "project_detail"])
    ).scalar() or 0
    contact_clicks = db.query(func.count(VisitorEvent.id)).filter(
        VisitorEvent.event_type.in_(["contact_click", "external_link"])
    ).scalar() or 0

    recent_events = db.query(VisitorEvent).order_by(desc(VisitorEvent.created_at)).limit(limit).all()
    event_rows = db.query(VisitorEvent.event_type, func.count(VisitorEvent.id)).group_by(
        VisitorEvent.event_type
    ).order_by(desc(func.count(VisitorEvent.id))).limit(8).all()
    project_rows = db.query(VisitorEvent.target_id, func.count(VisitorEvent.id)).filter(
        VisitorEvent.target_id.like("project%")
    ).group_by(VisitorEvent.target_id).order_by(desc(func.count(VisitorEvent.id))).limit(8).all()
    npc_rows = db.query(NpcConversationLog.npc_id, func.count(NpcConversationLog.id)).group_by(
        NpcConversationLog.npc_id
    ).order_by(desc(func.count(NpcConversationLog.id))).limit(8).all()

    return AnalyticsSummary(
        total_events=total_events,
        unique_sessions=unique_sessions,
        npc_messages=npc_messages,
        project_views=project_views,
        contact_clicks=contact_clicks,
        top_events=[AnalyticsMetric(label=str(label), value=int(value)) for label, value in event_rows],
        top_projects=[AnalyticsMetric(label=str(label), value=int(value)) for label, value in project_rows],
        top_npcs=[AnalyticsMetric(label=str(label), value=int(value)) for label, value in npc_rows],
        recent_events=recent_events,
    )


def list_projects(db: Session) -> list[ManagedProject]:
    seed_admin_defaults(db)
    return db.query(ManagedProject).order_by(desc(ManagedProject.featured), desc(ManagedProject.priority)).all()


def update_project(db: Session, project_id: str, payload: ManagedProjectIn) -> ManagedProject:
    seed_admin_defaults(db)
    project = db.get(ManagedProject, project_id)
    if not project:
        project = ManagedProject(id=project_id, title=payload.title)
        db.add(project)

    project.title = payload.title.strip()
    project.summary = payload.summary.strip()
    project.role = payload.role.strip()
    project.tech = [item.strip() for item in payload.tech if item.strip()]
    project.priority = payload.priority
    project.featured = payload.featured
    project.visible = payload.visible
    project.admin_note = payload.admin_note.strip()
    db.commit()
    db.refresh(project)
    return project


def log_npc_conversation(
    db: Session,
    npc_id: str,
    visitor_message: str,
    npc_reply: str,
    used_ai: bool,
    suggested_action_id: str = "",
) -> NpcConversationLog:
    log = NpcConversationLog(
        npc_id=npc_id,
        visitor_message=visitor_message,
        npc_reply=npc_reply,
        used_ai=used_ai,
        suggested_action_id=suggested_action_id,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def list_npc_logs(db: Session, limit: int = 80) -> list[NpcConversationLog]:
    return db.query(NpcConversationLog).order_by(desc(NpcConversationLog.created_at)).limit(limit).all()


def list_npc_presets(db: Session) -> list[NpcPresetSetting]:
    seed_admin_defaults(db)
    return db.query(NpcPresetSetting).order_by(NpcPresetSetting.npc_id).all()


def update_npc_preset(db: Session, npc_id: str, payload: NpcPresetIn) -> NpcPresetSetting:
    preset = db.get(NpcPresetSetting, npc_id)
    if not preset:
        preset = NpcPresetSetting(npc_id=npc_id)
        db.add(preset)

    preset.questions = [item.strip() for item in payload.questions if item.strip()][:8]
    preset.enabled = payload.enabled
    db.commit()
    db.refresh(preset)
    return preset


def list_village_overrides(db: Session) -> list[VillageBuildingOverride]:
    return db.query(VillageBuildingOverride).order_by(VillageBuildingOverride.building_id).all()


def update_village_override(
    db: Session,
    building_id: str,
    payload: VillageBuildingOverrideIn,
) -> VillageBuildingOverride:
    override = db.get(VillageBuildingOverride, building_id)
    if not override:
        override = VillageBuildingOverride(building_id=building_id)
        db.add(override)

    override.light_level = payload.light_level
    override.enabled = payload.enabled
    override.featured = payload.featured
    override.note = payload.note.strip()
    db.commit()
    db.refresh(override)
    return override


def apply_village_overrides(db: Session, state: VillageState) -> VillageState:
    overrides = {item.building_id: item for item in list_village_overrides(db)}
    if not overrides:
        return state

    for building in state.buildings:
        override = overrides.get(building.building_id)
        if not override:
            continue
        if override.light_level != "auto":
            building.light_level = override.light_level
        if not override.enabled:
            building.light_level = "dark"
            building.activity_score = 0
        reasons = [building.reason]
        if override.featured:
            building.activity_score = max(building.activity_score, 85)
            if override.light_level == "auto":
                building.light_level = "bright"
            reasons.append("관리자 강조 표시가 적용되었습니다.")
        if override.note:
            reasons.append(f"관리자 메모: {override.note}")
        building.reason = " ".join(reasons)

    featured = [item.building_id for item in overrides.values() if item.featured]
    state.unlocked_items = list(dict.fromkeys([*state.unlocked_items, *featured]))
    return state


def admin_overview_payload(db: Session):
    seed_admin_defaults(db)
    return {
        "analytics": analytics_summary(db),
        "projects": list_projects(db),
        "npc_presets": list_npc_presets(db),
        "village_overrides": list_village_overrides(db),
        "ai_usage": ai_usage_snapshot(),
    }


def question_frequency(db: Session, limit: int = 8) -> list[AnalyticsMetric]:
    messages = db.query(NpcConversationLog.visitor_message).all()
    tokens = Counter()
    for (message,) in messages:
        normalized = message.strip()
        if normalized:
            tokens[normalized] += 1
    return [AnalyticsMetric(label=label, value=value) for label, value in tokens.most_common(limit)]


def _default_questions_for_npc(npc_id: str) -> list[str]:
    if npc_id == "guide-npc":
        return ["처음이면 어디부터 보면 돼?", "대표 프로젝트만 빠르게 골라줘", "채용자라면 어떤 순서로 보면 좋아?"]
    if npc_id == "project-npc":
        return ["대표 프로젝트 3개만 골라줘", "가장 구현 난이도가 높았던 건 뭐야?", "채용자 관점에서 볼 프로젝트 추천해줘"]
    if npc_id == "developer-npc":
        return ["기술 스택 깊이를 설명해줘", "백엔드 경험도 있어?", "Three.js랑 Unity 경험을 비교해줘"]
    if npc_id == "archivist-npc":
        return ["성장 과정 요약해줘", "협업 경험 알려줘", "오늘 기록은 마을에 어떻게 반영돼?"]
    if npc_id == "contact-npc":
        return ["연락 방법 알려줘", "GitHub 어디서 보면 돼?", "협업 가능한 분야 정리해줘"]
    return ["대표 프로젝트 추천해줘", "기술 깊이를 설명해줘", "연락 방법 알려줘"]
