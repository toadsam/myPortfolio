"""터미널에서 직군 에이전트를 돌린다.

    npm run atelier                              접수 목록과 상태
    npm run atelier -- WO-3F2A9C71               대기 중인 작업 전부
    npm run atelier -- WO-3F2A9C71 planner       한 직군만

직군을 위치 인자로도 받는 이유: `npm run atelier -- ... --role planner` 는
npm 이 `--role` 을 자기 설정으로 가로채 파이썬까지 오지 않는다.
(python -m 으로 직접 부를 때는 --role 도 그대로 쓸 수 있다)

관리자 페이지 버튼과 **같은 `runner.run_task()` 를 부른다.** 게이트도 똑같이 걸린다 —
터미널이라고 승인을 건너뛸 수 있는 뒷문은 없다.

이 경로가 따로 있는 이유는 배포 때문이다. 공개된 웹 서버에서 파일을 쓰는
에이전트가 도는 건 피하고 싶으므로, 배포본은 AGENT_WORKER_ENABLED 를 끄고
승인만 웹에서 하고 실행은 내 컴퓨터에서 이걸로 한다.
"""

import argparse
import asyncio
import sys

from app.agents import gate
from app.agents.runner import AgentUnavailable, run_task
from app.database import SessionLocal, init_db
from app.models import CommissionRequest
from app.services.commission_service import tasks_for


def _find(db, public_id: str) -> CommissionRequest | None:
    return (
        db.query(CommissionRequest)
        .filter(CommissionRequest.public_id == public_id.strip().upper())
        .first()
    )


def _print_list(db) -> None:
    rows = db.query(CommissionRequest).order_by(CommissionRequest.id.desc()).limit(30).all()
    if not rows:
        print("접수된 의뢰가 없습니다.")
        return
    print(f"{'접수번호':<14} {'상태':<16} 요약")
    print("-" * 70)
    for row in rows:
        summary = (row.summary or "")[:40]
        print(f"{row.public_id:<14} {row.status:<16} {summary}")


async def _run(public_id: str, role: str | None) -> int:
    db = SessionLocal()
    try:
        commission = _find(db, public_id)
        if commission is None:
            print(f"접수번호 {public_id} 를 찾을 수 없습니다.", file=sys.stderr)
            return 1

        tasks = tasks_for(db, commission.id)
        if role:
            tasks = [task for task in tasks if task.role == role]
        pending = [task for task in tasks if task.status == "ready"]

        if not pending:
            print(f"[{commission.public_id}] 실행 대기 중인 작업이 없습니다. (상태: {commission.status})")
            if commission.status in ("received", "reviewing"):
                print("→ /admin 에서 게이트1(접수 승인)을 먼저 통과시켜 주세요.")
            elif commission.status == "brief_review":
                print("→ 브리프 검수 대기 중입니다. /admin 에서 게이트2를 통과시켜 주세요.")
            elif commission.status == "artifact_review":
                print("→ 산출물 검수 대기 중입니다. /admin 에서 확인해 주세요.")
            return 0

        for task in pending:
            npc = gate.ROLE_NPCS[task.role]
            label = gate.ROLE_LABELS[task.role]
            print(f"\n▶ {npc}({label}) 작업 시작 — 라운드 {task.round}")
            try:
                await run_task(db, commission, task)
            except gate.GateViolation as error:
                print(f"  ✗ {error}", file=sys.stderr)
                continue
            except AgentUnavailable as error:
                print(f"  ✗ {error}", file=sys.stderr)
                return 2

            if task.status == "failed":
                print(f"  ✗ 실패: {task.error}", file=sys.stderr)
            else:
                cost = f" · ${task.cost_usd:.2f}" if task.cost_usd else ""
                print(f"  ✔ 완료 ({task.duration_ms / 1000:.0f}초{cost})")
                if task.log:
                    print("  " + task.log.replace("\n", "\n  ")[:800])

        db.refresh(commission)
        print(f"\n상태: {commission.status}")
        if commission.status in ("brief_review", "artifact_review"):
            print("→ /admin 에서 검수하고 게이트를 통과시켜 주세요. 여기서 자동으로 진행하지 않습니다.")
        return 0
    finally:
        db.close()


def main() -> int:
    parser = argparse.ArgumentParser(description="의뢰 공방 직군 에이전트 실행")
    parser.add_argument("public_id", nargs="?", help="접수번호 (예: WO-3F2A9C71)")
    parser.add_argument(
        "role_positional",
        nargs="?",
        choices=list(gate.ALL_ROLES),
        help="이 직군만 실행 (npm 경로에서는 --role 이 npm 에 먹히므로 이쪽을 쓴다)",
    )
    parser.add_argument("--role", choices=list(gate.ALL_ROLES), help="이 직군만 실행")
    parser.add_argument("--list", action="store_true", help="접수 목록 보기")
    args = parser.parse_args()

    init_db()

    if args.list or not args.public_id:
        db = SessionLocal()
        try:
            _print_list(db)
        finally:
            db.close()
        return 0

    return asyncio.run(_run(args.public_id, args.role or args.role_positional))


if __name__ == "__main__":
    raise SystemExit(main())
