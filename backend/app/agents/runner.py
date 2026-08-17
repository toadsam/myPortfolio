"""Claude Agent SDK 호출 — 직군 에이전트 한 번 실행.

## 이 파일이 지키는 두 가지

**① 승인 없이는 안 돈다.** 맨 처음 줄이 `gate.assert_can_run()` 이고,
실행이 끝나면 상태는 반드시 `*_review` 에서 멈춘다. 다음 단계로 가는 코드는 여기 없다.

**② 지정 폴더 밖에는 못 쓴다.** `_build_guard()` 가 진짜 방어선이다.

## can_use_tool 에 관한 함정 (중요)

SDK 문서에 따르면 `can_use_tool` 콜백은 **권한 판정이 "물어보기"까지 내려올 때만**
호출된다. 다음 경우엔 아예 안 불린다:

- `permission_mode` 가 `acceptEdits` / `bypassPermissions` 일 때
- 그 도구가 `allowed_tools` 에 들어 있을 때
- 설정 파일의 allow 규칙에 걸릴 때

그래서 여기서는 **`permission_mode="default"` 를 쓰고, Write/Edit 계열을
`allowed_tools` 에 절대 넣지 않는다.** 편하자고 `acceptEdits` 로 바꾸는 순간
경로 검사가 통째로 무력화된다 — 에러 하나 없이 조용히. 바꾸지 말 것.
`setting_sources=[]` 도 같은 이유다(내 개인 설정의 allow 규칙이 새 들어오면 안 된다).
"""

import asyncio
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.agents import gate, prompts
from app.agents import workspace as ws
from app.config import settings
from app.models import CommissionRequest, CommissionTask


class AgentUnavailable(Exception):
    """SDK 나 Claude Code CLI 가 없어서 실행할 수 없다. 라우트가 503으로 변환한다."""


# **allowed_tools 는 비워 둔다.** 여기에 도구 이름을 넣으면 그 도구는 콜백이
# 불리기도 전에 자동 승인된다(SDK 가 CanUseToolShadowedWarning 으로 직접 경고한다).
# 모든 호출이 can_use_tool 로 떨어지게 두고, 판단은 아래 표가 한다.
_ALLOWED_TOOLS: tuple[str, ...] = ()

# 아예 손에 쥐여 주지 않는 것들. 셸과 네트워크는 이 작업에 필요 없다.
_DISALLOWED = ("Bash", "BashOutput", "KillShell", "WebSearch", "WebFetch", "Task")

# 경로가 작업 공간 안일 때만 허용하는 것들 → {도구: 경로가 담긴 입력 키}
#
# 읽기(Read/Glob/Grep)까지 가두는 이유: cwd 를 옮겨도 절대경로로 리포 어디든
# 읽을 수 있고, 읽은 내용은 산출물이나 요약을 타고 밖으로 나갈 수 있다.
# 에이전트에게 필요한 맥락은 전부 프롬프트에 들어 있으므로 못 읽어서 곤란할 일이 없다.
_PATH_GUARDED = {
    "Read": "file_path",
    "Write": "file_path",
    "Edit": "file_path",
    "MultiEdit": "file_path",
    "NotebookEdit": "notebook_path",
    "Glob": "path",
    "Grep": "path",
}

# 파일을 만지지 않는 도구 — 경로가 없으니 그냥 허용한다.
_PATHLESS_OK = ("TodoWrite",)


def _build_guard(root: Path):
    """작업 공간 밖으로 나가는 파일 접근을 막는 콜백. **이것이 진짜 방어선이다.**"""
    from claude_agent_sdk import PermissionResultAllow, PermissionResultDeny

    async def guard(tool_name: str, input_data: dict[str, Any], context: Any):
        if tool_name in _PATHLESS_OK:
            return PermissionResultAllow(updated_input=input_data)

        key = _PATH_GUARDED.get(tool_name)
        if key is None:
            # 모르는 도구는 거절한다. 화이트리스트 방식이라야 SDK 에 도구가
            # 새로 생겨도 구멍이 열리지 않는다.
            return PermissionResultDeny(
                message=f"이 작업에서는 {tool_name} 도구를 쓸 수 없습니다."
            )

        target = input_data.get(key) or ""
        if not target:
            # 경로를 안 준 건 cwd(=작업 공간) 기준이라는 뜻이다. Glob/Grep 이 그렇다.
            return PermissionResultAllow(updated_input=input_data)

        if ws.resolve_inside(root, target) is None:
            # interrupt 는 쓰지 않는다 — 턴을 끊으면 에이전트가 안으로 다시
            # 시도할 기회 없이 통째로 멈춘다. 거절 사유만 돌려주고 계속 시킨다.
            return PermissionResultDeny(
                message=(
                    f"'{target}' 은 이 의뢰의 작업 공간 밖이라 거부했습니다. "
                    f"파일은 반드시 작업 공간 안의 상대경로로만 다뤄 주세요."
                )
            )

        return PermissionResultAllow(updated_input=input_data)

    return guard


def _context_for(db: Session, commission: CommissionRequest) -> dict:
    from app.services.commission_service import messages_for

    def money(value: int) -> str:
        return f"{value // 10_000:,}만원" if value else ""

    estimate = ""
    if commission.estimate_min and commission.estimate_max:
        estimate = (
            f"{money(commission.estimate_min)} ~ {money(commission.estimate_max)} / "
            f"{commission.weeks_min}~{commission.weeks_max}주"
        )

    log_lines = [
        f"- {'손님' if row.role == 'visitor' else '도안'}: {row.content.strip()}"
        for row in messages_for(db, commission)
        if row.content.strip()
    ]

    return {
        "public_id": commission.public_id,
        "site_type": commission.site_type,
        "summary": commission.summary,
        "requirements": commission.requirements or {},
        "deadline_hint": commission.deadline_hint,
        "budget_hint": commission.budget_hint,
        "estimate_text": estimate,
        "admin_note": commission.admin_note,
        # 대화가 길면 뒤쪽(최근)만. 요구사항은 대개 뒤에서 굳는다.
        "consult_log": "\n".join(log_lines[-40:]),
    }


async def _drive(system_prompt: str, prompt: str, root: Path) -> tuple[str, float]:
    """SDK 를 돌리고 (최종 요약 텍스트, 비용 USD) 를 돌려준다."""
    try:
        from claude_agent_sdk import (
            AssistantMessage,
            ClaudeAgentOptions,
            ClaudeSDKClient,
            ResultMessage,
            TextBlock,
        )
    except ImportError as error:
        raise AgentUnavailable(
            "claude-agent-sdk 가 설치되어 있지 않습니다. "
            "backend 폴더에서 `pip install -r requirements-agent.txt` 를 실행해 주세요."
        ) from error

    if settings.anthropic_api_key:
        os.environ.setdefault("ANTHROPIC_API_KEY", settings.anthropic_api_key)

    options_kwargs: dict[str, Any] = {
        "system_prompt": system_prompt,
        "cwd": str(root),
        # ↓ 이 네 줄이 세트다. 하나만 바꾸면 경로 검사가 무력화된다(파일 상단 주석 참고).
        "permission_mode": "default",
        "allowed_tools": list(_ALLOWED_TOOLS),
        "disallowed_tools": list(_DISALLOWED),
        "can_use_tool": _build_guard(root),
        "setting_sources": [],
        "max_turns": settings.agent_max_turns,
    }
    if settings.agent_model.strip():
        options_kwargs["model"] = settings.agent_model.strip()

    options = ClaudeAgentOptions(**options_kwargs)

    # query() 가 아니라 ClaudeSDKClient 를 쓰는 이유 — 여기서 한 번 걸렸다.
    #
    # can_use_tool 은 문자열 프롬프트를 거부하고(“requires streaming mode”),
    # 스트리밍으로 바꿔도 **입력 채널이 살아 있어야 한다**. 권한 승인 응답이
    # 그 채널로 되돌아가기 때문이다. 한 번 yield 하고 끝나는 제너레이터를 주면
    # SDK 가 stdin 을 닫아버려서, 첫 Write 부터 `AbortError: Stream closed` 로
    # 전부 실패한다(에이전트는 "파일 쓰기가 안 된다"고 보고하고 빈손으로 끝난다).
    # ClaudeSDKClient 는 컨텍스트가 끝날 때까지 채널을 열어 둔다.
    texts: list[str] = []
    cost = 0.0
    try:
        async with ClaudeSDKClient(options=options) as client:
            await client.query(prompt)
            async for message in client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock) and block.text.strip():
                            texts.append(block.text.strip())
                elif isinstance(message, ResultMessage):
                    cost = float(getattr(message, "total_cost_usd", 0.0) or 0.0)
    except FileNotFoundError as error:
        # SDK 가 claude CLI 를 못 찾은 경우가 대부분이다
        raise AgentUnavailable(
            "Claude Code CLI 를 찾지 못했습니다. `claude` 명령이 PATH 에 있는지 확인해 주세요."
        ) from error

    # 마지막 몇 문단이 보통 "무엇을 만들었는지" 요약이다.
    summary = "\n\n".join(texts[-4:]).strip()
    return summary, cost


async def run_task(
    db: Session, commission: CommissionRequest, task: CommissionTask
) -> CommissionTask:
    """직군 에이전트 한 번 실행. 관리자 페이지와 CLI 가 공유하는 유일한 진입점."""
    # ① 승인 관문. 여기를 통과하지 못하면 SDK 는 부르지도 않는다.
    gate.assert_can_run(commission.status, task.status, task.role)

    root = ws.ensure_workspace(commission.public_id, gate.ROLE_DIRS)

    task.status = "running"
    task.error = ""
    task.started_at = datetime.now(timezone.utc)
    db.commit()

    started = time.monotonic()
    try:
        system_prompt = prompts.for_role(task.role, {})
        prompt = prompts.task_prompt(
            task.role,
            _context_for(db, commission),
            task.brief,
            task.feedback,
            task.round,
        )
        summary, cost = await asyncio.wait_for(
            _drive(system_prompt, prompt, root),
            timeout=settings.agent_timeout_seconds,
        )
    except asyncio.TimeoutError:
        _mark_failed(db, task, started, f"{settings.agent_timeout_seconds}초 안에 끝나지 않아 중단했습니다.")
        return task
    except AgentUnavailable:
        # 환경 문제라 작업 잘못이 아니다. 다시 실행할 수 있게 ready 로 돌려놓는다.
        task.status = "ready"
        task.started_at = None
        db.commit()
        raise
    except Exception as error:  # noqa: BLE001 — 무엇이 터지든 작업 상태는 남겨야 한다
        _mark_failed(db, task, started, f"{type(error).__name__}: {error}")
        return task

    task.log = summary[:8000]
    task.cost_usd = cost
    task.duration_ms = int((time.monotonic() - started) * 1000)
    task.finished_at = datetime.now(timezone.utc)
    # ② 여기서 멈춘다. 검수 대기.
    task.status = "review"
    db.commit()

    from app.services.commission_service import sync_artifacts

    sync_artifacts(db, commission, task)

    # ③ 커미션 상태도 검수 대기까지만. delivered 로 가는 길은 게이트에만 있다.
    from app.services.commission_service import tasks_for

    statuses = {row.role: row.status for row in tasks_for(db, commission.id)}
    commission.status = gate.commission_status_after_run(task.role, statuses)
    db.commit()
    db.refresh(task)
    return task


def _mark_failed(db: Session, task: CommissionTask, started: float, message: str) -> None:
    task.status = "failed"
    task.error = message[:4000]
    task.duration_ms = int((time.monotonic() - started) * 1000)
    task.finished_at = datetime.now(timezone.utc)
    db.commit()
