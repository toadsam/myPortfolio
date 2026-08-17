"""의뢰 공방 3단계 — 게이트와 작업 공간 격리.

이 스위트가 잠그는 명제는 하나다: **관리자 승인 없이는 아무것도 진행되지 않는다.**
프롬프트로 부탁한 게 아니라 코드가 막는다는 것을, 승인 없이 진행되는 경로를
하나씩 두드려 확인한다. Claude Agent SDK 는 부르지 않는다(순수 로직만).
"""

from pathlib import Path

import pytest

from app.agents import gate
from app.agents import workspace as ws


# ─────────────────────────── 실행 관문 ───────────────────────────

def test_planner_cannot_run_before_gate1():
    """접수 직후에는 기획도 못 돈다 — 게이트1이 실체가 있는 문이라는 뜻."""
    for status in ("received", "reviewing"):
        with pytest.raises(gate.GateViolation, match="게이트1"):
            gate.assert_can_run(status, "ready", "planner")


def test_planner_runs_only_in_briefing():
    gate.assert_can_run("briefing", "ready", "planner")  # 예외 없이 통과


@pytest.mark.parametrize("role", gate.TEAM_ROLES)
@pytest.mark.parametrize("status", ["received", "reviewing", "briefing", "brief_review"])
def test_team_cannot_run_before_gate2(role, status):
    """브리프가 승인되기 전에는 디자인·프론트·백엔드 누구도 못 돈다."""
    with pytest.raises(gate.GateViolation, match="게이트2"):
        gate.assert_can_run(status, "ready", role)


@pytest.mark.parametrize("role", gate.TEAM_ROLES)
def test_team_runs_after_gate2(role):
    gate.assert_can_run("briefed", "ready", role)
    gate.assert_can_run("in_progress", "ready", role)


def test_review_must_be_rejected_before_rerun():
    """검수 대기 중인 작업을 그냥 다시 돌려 덮어쓸 수 없다."""
    with pytest.raises(gate.GateViolation, match="반려"):
        gate.assert_can_run("briefing", "review", "planner")


@pytest.mark.parametrize("task_status", ["running", "approved", "failed"])
def test_only_ready_tasks_run(task_status):
    with pytest.raises(gate.GateViolation):
        gate.assert_can_run("briefing", task_status, "planner")


def test_unknown_role_is_rejected():
    with pytest.raises(gate.GateViolation):
        gate.assert_can_run("briefing", "ready", "devops")


# ─────────────────────── 실행이 끝난 뒤 어디서 멈추나 ───────────────────────

def test_planner_run_stops_at_brief_review():
    assert gate.commission_status_after_run("planner", {}) == "brief_review"


def test_team_run_waits_for_all_three():
    """하나라도 남아 있으면 산출물 검수로 넘어가지 않는다."""
    partial = {"designer": "review", "frontend": "ready", "backend": "ready"}
    assert gate.commission_status_after_run("designer", partial) == "in_progress"


def test_team_run_reaches_artifact_review_when_all_done():
    done = {"designer": "review", "frontend": "review", "backend": "approved"}
    assert gate.commission_status_after_run("backend", done) == "artifact_review"


def test_no_run_outcome_ever_delivers():
    """**핵심 명제.** 에이전트 실행만으로는 절대 delivered 에 도달하지 못한다."""
    every_status = ["ready", "running", "review", "approved", "rejected", "failed"]
    for role in gate.ALL_ROLES:
        for a in every_status:
            for b in every_status:
                for c in every_status:
                    statuses = {"designer": a, "frontend": b, "backend": c}
                    assert gate.commission_status_after_run(role, statuses) != "delivered"


# ─────────────────────────── 게이트 ───────────────────────────

def test_gate1_approve_creates_only_planner():
    effect = gate.apply_gate(1, "received", "approve")
    assert effect.commission_status == "briefing"
    assert effect.create_roles == ("planner",)
    # 팀 3직군은 아직 생기지도 않는다 — '승인 전엔 작업이 존재하지 않는다'
    assert not set(effect.create_roles) & set(gate.TEAM_ROLES)


def test_gate1_reject_ends_it():
    assert gate.apply_gate(1, "received", "reject").commission_status == "rejected"


def test_gate2_approve_opens_the_team():
    effect = gate.apply_gate(2, "brief_review", "approve")
    assert effect.commission_status == "briefed"
    assert set(effect.create_roles) == set(gate.TEAM_ROLES)
    assert effect.approve_roles == ("planner",)


def test_gate2_reject_sends_planner_back():
    effect = gate.apply_gate(2, "brief_review", "reject")
    assert effect.commission_status == "briefing"
    assert effect.reset_roles == ("planner",)


def test_gate3_approve_is_the_only_road_to_delivered():
    assert gate.apply_gate(3, "artifact_review", "approve").commission_status == "delivered"


def test_gate3_reject_sends_team_back():
    effect = gate.apply_gate(3, "artifact_review", "reject")
    assert effect.commission_status == "in_progress"
    assert set(effect.reset_roles) == set(gate.TEAM_ROLES)


@pytest.mark.parametrize(
    "gate_no,status",
    [
        (1, "briefing"),      # 이미 지난 게이트를 다시
        (2, "received"),      # 게이트1을 건너뛰고 2로
        (3, "received"),      # 곧장 전달로
        (3, "brief_review"),  # 브리프 검수 중에 전달로
    ],
)
def test_gates_cannot_be_skipped(gate_no, status):
    with pytest.raises(gate.GateViolation):
        gate.apply_gate(gate_no, status, "approve")


def test_delivered_is_terminal():
    """전달까지 간 건은 어떤 게이트도 다시 열리지 않는다."""
    for gate_no in (1, 2, 3):
        with pytest.raises(gate.GateViolation):
            gate.apply_gate(gate_no, "delivered", "approve")


def test_gate_for_status_matches_the_table():
    assert gate.gate_for_status("received") == 1
    assert gate.gate_for_status("brief_review") == 2
    assert gate.gate_for_status("artifact_review") == 3
    assert gate.gate_for_status("briefing") is None
    assert gate.gate_for_status("delivered") is None


def test_bad_decision_is_rejected():
    with pytest.raises(gate.GateViolation):
        gate.apply_gate(1, "received", "maybe")


# ─────────────────────── 작업 공간 격리 ───────────────────────

def test_resolve_inside_accepts_plain_paths(tmp_path):
    root = tmp_path / "WO-TEST"
    root.mkdir()
    assert ws.resolve_inside(root, "01-기획/정리서.md") is not None
    assert ws.resolve_inside(root, "새폴더/깊이/파일.html") is not None


@pytest.mark.parametrize(
    "escape",
    [
        "../외부.md",
        "../../외부.md",
        "01-기획/../../외부.md",
        "01-기획/../../../package.json",
    ],
)
def test_resolve_inside_blocks_traversal(tmp_path, escape):
    """`..` 를 문자열로 막는 게 아니라 정규화 후 판정하므로 조합 우회가 안 통한다."""
    root = tmp_path / "WO-TEST"
    root.mkdir()
    assert ws.resolve_inside(root, escape) is None


def test_resolve_inside_blocks_absolute_paths(tmp_path):
    """cwd 를 옮겨도 절대경로 한 방이면 나갈 수 있다 — 그래서 이 검사가 진짜 방어선이다."""
    root = tmp_path / "WO-TEST"
    root.mkdir()
    outside = tmp_path / "다른곳" / "package.json"
    assert ws.resolve_inside(root, str(outside)) is None
    assert ws.resolve_inside(root, str(Path(root.anchor) / "Windows" / "system.ini")) is None


def test_resolve_inside_allows_the_root_itself(tmp_path):
    root = tmp_path / "WO-TEST"
    root.mkdir()
    assert ws.resolve_inside(root, str(root)) is not None


def test_sibling_workspace_is_outside(tmp_path):
    """접두사가 같은 이웃 폴더로 새지 않는다 (WO-TEST vs WO-TEST2)."""
    root = tmp_path / "WO-TEST"
    root.mkdir()
    (tmp_path / "WO-TEST2").mkdir()
    assert ws.resolve_inside(root, str(tmp_path / "WO-TEST2" / "x.md")) is None


def test_workspace_for_sanitizes_public_id():
    """접수번호가 경로 조각이 되므로 조작 문자를 걸러 낸다."""
    root = ws.commissions_root()
    assert ws.workspace_for("../../etc").parent == root
    assert ws.workspace_for("WO-ABC123").name == "WO-ABC123"
    with pytest.raises(ValueError):
        ws.workspace_for("../")


def test_collect_artifacts_indexes_by_kind(tmp_path):
    root = tmp_path / "WO-TEST"
    (root / "01-기획").mkdir(parents=True)
    (root / "03-프론트").mkdir(parents=True)
    (root / "01-기획" / "정리서.md").write_text("# 정리", encoding="utf-8")
    (root / "03-프론트" / "시안.html").write_text("<h1>안녕</h1>", encoding="utf-8")

    found = dict((rel, kind) for rel, kind, _ in ws.collect_artifacts(root))
    assert found["01-기획/정리서.md"] == "markdown"
    assert found["03-프론트/시안.html"] == "html"


def test_collect_artifacts_skips_noise(tmp_path):
    root = tmp_path / "WO-TEST"
    (root / "__pycache__").mkdir(parents=True)
    (root / "__pycache__" / "x.pyc").write_bytes(b"\x00")
    (root / "본문.md").write_text("x", encoding="utf-8")
    assert [rel for rel, _, _ in ws.collect_artifacts(root)] == ["본문.md"]


def test_read_artifact_refuses_outside(tmp_path):
    root = tmp_path / "WO-TEST"
    root.mkdir()
    (tmp_path / "비밀.md").write_text("비밀", encoding="utf-8")
    assert ws.read_artifact(root, "../비밀.md") is None


def test_read_artifact_refuses_huge_files(tmp_path):
    root = tmp_path / "WO-TEST"
    root.mkdir()
    (root / "큰파일.md").write_text("가" * (ws.MAX_ARTIFACT_BYTES + 10), encoding="utf-8")
    assert ws.read_artifact(root, "큰파일.md") is None


# ─────────────────── 러너의 권한 설정이 무력화되지 않았는지 ───────────────────

def test_runner_permission_mode_keeps_the_guard_alive():
    """`acceptEdits` 로 바꾸면 can_use_tool 이 호출되지 않아 경로 검사가 조용히 죽는다.

    실수로 바꾸는 걸 막으려고 상수 자체를 테스트로 잠근다.
    (runner.py 상단 주석의 함정 설명 참고)
    """
    from app.agents import runner

    source = Path(runner.__file__).read_text(encoding="utf-8")
    assert '"permission_mode": "default"' in source
    assert '"setting_sources": []' in source

    # 쓰기 도구가 자동 승인 목록에 있으면 역시 콜백을 건너뛴다
    for tool in ("Write", "Edit", "MultiEdit", "NotebookEdit"):
        assert tool not in runner._AUTO_ALLOWED

    # 셸과 네트워크는 애초에 쥐여 주지 않는다
    for tool in ("Bash", "WebFetch", "WebSearch"):
        assert tool in runner._DISALLOWED
