"""의뢰 공방 3단계의 상태 기계 — "언제까지나 나랑 상의한다"를 구조로 강제한다.

이 파일이 존재하는 이유는 하나다. **에이전트에게 "끝까지 가지 마라"를 프롬프트로
부탁하면 언젠가는 간다.** 그래서 진행 권한 자체를 모델에게 주지 않는다.

에이전트가 할 수 있는 일은 태스크를 `running` → `review` 로 옮기는 것까지다.
`review` 에서 다음으로 나가는 문은 관리자의 게이트 호출뿐이고, 그 함수는
`apply_gate()` 하나다. 자동으로 불리는 경로는 코드 어디에도 없다.

    received ─[게이트1]─▶ briefing ─▶ brief_review ─[게이트2]─▶ briefed
       │                  (체리)          │                        │
       └──▶ rejected                      └──반려(round+1)──┘      ▼
                                                             in_progress
                                                      (먹지·리코·굴뚝 병렬)
                                 delivered ◀─[게이트3]─ artifact_review
                                                         └──반려(round+1)──┘

이 모듈은 **순수 함수만** 둔다(DB 세션을 받지 않는다). 규칙을 테스트가 직접
잠글 수 있어야 하기 때문이고, 실제 저장은 commission_service 가 한다.
"""

from typing import Literal


Role = Literal["planner", "designer", "frontend", "backend"]

PLANNER: Role = "planner"
TEAM_ROLES: tuple[Role, ...] = ("designer", "frontend", "backend")
ALL_ROLES: tuple[Role, ...] = (PLANNER, *TEAM_ROLES)

ROLE_LABELS: dict[str, str] = {
    "planner": "기획",
    "designer": "디자인",
    "frontend": "프론트엔드",
    "backend": "백엔드",
}

# 직군 ↔ 공방 NPC (catalog.py / atelierRoster.ts 와 같은 인물)
ROLE_NPCS: dict[str, str] = {
    "planner": "체리",
    "designer": "먹지",
    "frontend": "리코",
    "backend": "굴뚝",
}

# 산출물이 들어갈 폴더. 에이전트 프롬프트와 관리자 UI가 같은 값을 본다.
ROLE_DIRS: dict[str, str] = {
    "planner": "01-기획",
    "designer": "02-디자인",
    "frontend": "03-프론트",
    "backend": "04-백엔드",
}


class GateViolation(Exception):
    """승인 없이 진행하려 했다. 라우트가 409로 변환한다."""


# ─────────────────────────── 실행 가능 조건 ───────────────────────────
#
# "이 직군은 커미션이 어떤 상태일 때 돌 수 있나". 이 표가 승인 게이트의 실체다.
# 게이트1 을 통과해야 briefing 이 되고, 게이트2 를 통과해야 briefed 가 되므로,
# 승인 전에는 애초에 실행 가능한 상태 자체가 아니다.

_RUNNABLE_COMMISSION_STATUS: dict[str, tuple[str, ...]] = {
    "planner": ("briefing",),
    "designer": ("briefed", "in_progress"),
    "frontend": ("briefed", "in_progress"),
    "backend": ("briefed", "in_progress"),
}

# 태스크 자신이 실행 대기 상태여야 한다. review(검수 대기)를 다시 돌리려면
# 반드시 반려를 거쳐 ready 로 돌아와야 한다 — 검수를 건너뛰고 덮어쓰지 못하게.
_RUNNABLE_TASK_STATUS = ("ready",)


def assert_can_run(commission_status: str, task_status: str, role: str) -> None:
    """실행 직전 관문. 조건이 안 맞으면 GateViolation 을 던진다.

    runner 와 CLI 양쪽이 이 함수를 반드시 통과해야 SDK 를 부른다.
    """
    if role not in ALL_ROLES:
        raise GateViolation(f"알 수 없는 직군입니다: {role}")

    allowed = _RUNNABLE_COMMISSION_STATUS[role]
    if commission_status not in allowed:
        label = ROLE_LABELS[role]
        if role == PLANNER:
            raise GateViolation(
                f"{label} 작업은 게이트1(접수 승인) 뒤에만 실행할 수 있습니다. "
                f"지금 상태: {commission_status}"
            )
        raise GateViolation(
            f"{label} 작업은 게이트2(브리프 승인) 뒤에만 실행할 수 있습니다. "
            f"지금 상태: {commission_status}"
        )

    if task_status not in _RUNNABLE_TASK_STATUS:
        if task_status == "review":
            raise GateViolation(
                "검수 대기 중인 작업입니다. 다시 돌리려면 먼저 반려해 주세요 "
                "(그래야 무엇이 마음에 안 들었는지가 다음 실행에 전달됩니다)."
            )
        raise GateViolation(f"실행할 수 있는 상태가 아닙니다: {task_status}")


# ─────────────────────────── 실행 뒤 ───────────────────────────


def commission_status_after_run(role: str, team_task_statuses: dict[str, str]) -> str:
    """에이전트 실행이 끝난 뒤 커미션이 놓일 상태.

    **어떤 경우에도 delivered 로 가지 않는다.** 최대치는 `*_review` 이고,
    그 앞은 관리자만 열 수 있다. 이게 이 파일의 존재 이유다.

    team_task_statuses: 팀 3직군의 현재 태스크 상태 {role: status}.
        planner 실행에는 쓰이지 않는다.
    """
    if role == PLANNER:
        return "brief_review"

    # 팀 셋이 모두 검수 대기(또는 이미 통과)에 도달해야 산출물 검수로 넘어간다.
    # 하나라도 아직 돌고 있거나 대기 중이면 계속 in_progress.
    done = {"review", "approved"}
    if all(team_task_statuses.get(item) in done for item in TEAM_ROLES):
        return "artifact_review"
    return "in_progress"


# ─────────────────────────── 게이트 ───────────────────────────

GateNumber = Literal[1, 2, 3]
Decision = Literal["approve", "reject"]


class GateEffect:
    """게이트 통과의 결과. 서비스가 이대로 저장한다."""

    def __init__(
        self,
        commission_status: str,
        create_roles: tuple[str, ...] = (),
        reset_roles: tuple[str, ...] = (),
        approve_roles: tuple[str, ...] = (),
    ) -> None:
        self.commission_status = commission_status
        self.create_roles = create_roles      # 없으면 만들고, 있으면 ready 로
        self.reset_roles = reset_roles        # 반려 — round+1, feedback 저장, ready 로
        self.approve_roles = approve_roles    # 검수 통과 표시

    def __repr__(self) -> str:  # 테스트 실패 메시지를 읽을 수 있게
        return (
            f"GateEffect(status={self.commission_status!r}, create={self.create_roles}, "
            f"reset={self.reset_roles}, approve={self.approve_roles})"
        )


# 게이트가 열려 있는 상태. 이 밖에서 게이트를 부르면 거부한다.
_GATE_OPEN_AT: dict[int, tuple[str, ...]] = {
    1: ("received", "reviewing"),
    2: ("brief_review",),
    3: ("artifact_review",),
}


def apply_gate(gate: int, commission_status: str, decision: str) -> GateEffect:
    """관리자의 승인/반려 한 번. **진행이 일어나는 유일한 함수다.**"""
    if gate not in _GATE_OPEN_AT:
        raise GateViolation(f"게이트 번호가 올바르지 않습니다: {gate}")
    if decision not in ("approve", "reject"):
        raise GateViolation(f"승인 또는 반려만 가능합니다: {decision}")

    open_at = _GATE_OPEN_AT[gate]
    if commission_status not in open_at:
        raise GateViolation(
            f"게이트{gate}는 지금 열 수 없습니다. "
            f"필요한 상태: {' 또는 '.join(open_at)} · 지금: {commission_status}"
        )

    if gate == 1:
        if decision == "reject":
            return GateEffect(commission_status="rejected")
        # 기획 태스크를 만들어 실행 대기로. 팀 3직군은 아직 만들지 않는다 —
        # 게이트2 전에는 '작업이 존재하지 않는다'로 승인 규칙을 표현한다.
        return GateEffect(commission_status="briefing", create_roles=(PLANNER,))

    if gate == 2:
        if decision == "reject":
            # 기획을 다시. 커미션은 briefing 으로 되돌아간다.
            return GateEffect(commission_status="briefing", reset_roles=(PLANNER,))
        return GateEffect(
            commission_status="briefed",
            create_roles=TEAM_ROLES,
            approve_roles=(PLANNER,),
        )

    if decision == "reject":
        # 팀 산출물 반려 — 셋 다 다시 돌린다. 개별 반려는 태스크 단위 API 로 따로 한다.
        return GateEffect(commission_status="in_progress", reset_roles=TEAM_ROLES)
    return GateEffect(commission_status="delivered", approve_roles=TEAM_ROLES)


def gate_for_status(commission_status: str) -> int | None:
    """지금 열려 있는 게이트 번호(관리자 UI가 버튼을 켜고 끄는 데 쓴다)."""
    for gate, statuses in _GATE_OPEN_AT.items():
        if commission_status in statuses:
            return gate
    return None
