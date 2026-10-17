"""작업 지시서 — 관리자의 하루 계획과, 완료했을 때 그날 기록에 분량을 더하는 일.

## 완료는 그날 DailyActivity 의 한 칸만 건드린다

**`activity_service.upsert_activity` 를 쓰면 안 된다.** 그건 관리자 폼이 보낸 전체
값으로 하루를 통째로 덮어쓰므로, 지시서 하나를 끝낼 때마다 그날의 메모·커밋이 같이
날아간다. `quest_service` 의 섬 기록과 같은 방식으로 해당 칸만 더하고 뺀다.

- 운동은 `workout_done` 도 켠다. 마을 점수는 `workout_done` 이 꺼져 있으면 분을 안 센다.
- 프로젝트는 `project_minutes` 에 **새 dict 를 대입**한다. JSON 칸을 제자리에서 고치면
  SQLAlchemy 가 바뀐 줄 모르고 저장하지 않는다.
- 완료 → 취소면 더했던 만큼 뺀다(0 아래로는 안 내려간다). 같은 상태로 다시 보내면
  아무것도 안 한다 — 휴대폰에서 두 번 눌려도 두 번 더해지지 않는다.

## 완료된 지시서는 날짜·회로·분량을 못 바꾼다

이미 더한 분량을 어느 칸에서 빼야 할지 헷갈리게 만드는 길을 아예 막는다. 바꾸려면
먼저 완료를 취소한다(그때 뺀다). 제목·마감 꼬리표는 언제든 고칠 수 있다.
"""

from datetime import date as dt_date
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import DailyActivity, PlanItem
from app.schemas import PlanItemIn, PlanItemUpdate
from app.time_utils import today_local


class PlanItemLocked(ValueError):
    """완료된 지시서의 날짜·회로·분량을 바꾸려 했다."""


def list_plan_items(db: Session, day: dt_date | None = None) -> list[PlanItem]:
    day = day or today_local()
    return (
        db.query(PlanItem)
        .filter(PlanItem.date == day)
        .order_by(PlanItem.done, PlanItem.created_at.desc(), PlanItem.id.desc())
        .all()
    )


def create_plan_item(db: Session, payload: PlanItemIn) -> PlanItem:
    item = PlanItem(
        date=payload.date or today_local(),
        title=payload.title.strip(),
        circuit=payload.circuit,
        minutes=0 if payload.circuit == "none" else payload.minutes,
        due_label=(payload.due_label or "").strip() or None,
        done=False,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_plan_item(db: Session, item_id: int, payload: PlanItemUpdate) -> PlanItem | None:
    item = db.get(PlanItem, item_id)
    if not item:
        return None

    fields = payload.model_fields_set
    if item.done and payload.done is not False:
        changing = (
            ("date" in fields and payload.date is not None and payload.date != item.date)
            or ("circuit" in fields and payload.circuit is not None and payload.circuit != item.circuit)
            or ("minutes" in fields and payload.minutes is not None and payload.minutes != item.minutes)
        )
        if changing:
            raise PlanItemLocked("완료된 지시서는 먼저 완료를 취소해야 날짜·회로·분량을 바꿀 수 있습니다")

    if payload.title is not None:
        item.title = payload.title.strip()
    if "due_label" in fields:
        item.due_label = (payload.due_label or "").strip() or None

    # 완료 취소는 **옛 날짜·회로·분량으로** 먼저 빼고, 그다음에 다른 칸을 바꾼다
    if payload.done is False and item.done:
        _apply(db, item.date, item.circuit, -item.minutes)
        item.done = False
        item.done_at = None

    if not item.done:
        if payload.date is not None:
            item.date = payload.date
        if payload.circuit is not None:
            item.circuit = payload.circuit
        if payload.minutes is not None:
            item.minutes = payload.minutes
        if item.circuit == "none":
            item.minutes = 0

    if payload.done is True and not item.done:
        _apply(db, item.date, item.circuit, item.minutes)
        item.done = True
        item.done_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(item)
    return item


def delete_plan_item(db: Session, item_id: int) -> bool:
    """지운다. 완료된 지시서의 분량은 그날 기록에 **남긴다** — 일은 이미 한 것이다."""
    item = db.get(PlanItem, item_id)
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


# ─────────────────────────── 그날 기록에 더하기 ───────────────────────────


def _day_row(db: Session, day: dt_date) -> DailyActivity:
    activity = db.query(DailyActivity).filter(DailyActivity.date == day).first()
    if not activity:
        activity = DailyActivity(date=day)
        db.add(activity)
        db.flush()
    return activity


def _apply(db: Session, day: dt_date, circuit: str, delta: int) -> None:
    """그날 기록의 회로 칸에 delta 분을 더한다(음수면 뺀다). 커밋은 부르는 쪽이 한다."""
    if circuit == "none" or delta == 0:
        return
    activity = _day_row(db, day)
    if circuit == "workout":
        current = (activity.workout_minutes or 0) if activity.workout_done else 0
        minutes = max(0, current + delta)
        activity.workout_minutes = minutes
        activity.workout_done = minutes > 0
        if not activity.workout_done:
            activity.workout_type = ""
    elif circuit == "study":
        activity.study_minutes = max(0, (activity.study_minutes or 0) + delta)
    elif circuit == "coding":
        activity.coding_minutes = max(0, (activity.coding_minutes or 0) + delta)
    elif circuit.startswith("project:"):
        project_id = circuit[len("project:"):]
        table = dict(activity.project_minutes or {})
        minutes = max(0, int(table.get(project_id, 0) or 0) + delta)
        if minutes:
            table[project_id] = minutes
        else:
            table.pop(project_id, None)
        activity.project_minutes = table
