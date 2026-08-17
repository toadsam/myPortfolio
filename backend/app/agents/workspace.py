"""에이전트 작업 공간 — 포트폴리오 리포를 건드리지 못하게 가둔다.

산출물은 리포 루트의 `workspace/commissions/<public_id>/` 아래에만 생긴다
(`.gitignore` 에 `workspace/` 가 들어 있다). 이 파일이 그 경계를 지킨다.

경계를 두 겹으로 친다:

1. `ClaudeAgentOptions(cwd=root)` — 에이전트의 기본 작업 폴더를 옮긴다.
   **이건 방어가 아니라 편의다.** 절대경로를 쓰면 그냥 넘어간다.
2. `can_use_tool` 콜백에서 `resolve_inside()` 로 실제 경로를 검사한다.
   이쪽이 진짜 방어선이다. runner.py 참고.
"""

from pathlib import Path
import re

from app.config import BACKEND_DIR, settings


# backend/ 의 부모가 리포 루트다.
REPO_ROOT = BACKEND_DIR.parent

# 미리보기·목록에서 다룰 확장자. 그 외는 kind="other" 로 두고 본문을 열지 않는다.
_KIND_BY_SUFFIX = {
    ".md": "markdown",
    ".markdown": "markdown",
    ".html": "html",
    ".htm": "html",
    ".txt": "text",
    ".json": "text",
    ".css": "text",
}

# 색인에서 제외할 것들 (에이전트가 남길 수 있는 부산물)
_SKIP_DIRS = {".git", ".claude", "node_modules", "__pycache__", ".venv"}

_SAFE_ID = re.compile(r"[^A-Za-z0-9_-]")

# 산출물 한 개의 상한. 관리자 페이지가 통째로 받아 렌더하므로 걸어 둔다.
MAX_ARTIFACT_BYTES = 512 * 1024


def commissions_root() -> Path:
    """모든 의뢰의 작업 공간이 모이는 폴더."""
    if settings.agent_workspace_dir.strip():
        base = Path(settings.agent_workspace_dir.strip()).expanduser()
    else:
        base = REPO_ROOT / "workspace"
    return (base / "commissions").resolve()


def workspace_for(public_id: str) -> Path:
    """접수번호 하나의 작업 공간. public_id 는 경로 조각이 되므로 소독한다.

    지금은 `WO-` + 16진수라 안전하지만, 접수번호 생성 규칙이 바뀌어도
    여기서 경로 조작이 새지 않도록 막아 둔다.
    """
    safe = _SAFE_ID.sub("", public_id.strip())
    if not safe:
        raise ValueError("접수번호가 비어 있어 작업 공간을 만들 수 없습니다.")
    return commissions_root() / safe


def ensure_workspace(public_id: str, role_dirs: dict[str, str] | None = None) -> Path:
    """작업 공간과 직군 폴더를 만들어 둔다. 이미 있으면 그대로 둔다."""
    root = workspace_for(public_id)
    root.mkdir(parents=True, exist_ok=True)
    for name in (role_dirs or {}).values():
        (root / name).mkdir(parents=True, exist_ok=True)
    return root


def resolve_inside(root: Path, candidate: str | Path) -> Path | None:
    """candidate 를 root 안의 실제 경로로 풀어 준다. 밖으로 나가면 None.

    `..` · 절대경로 · 심볼릭 링크를 전부 통과시킨 뒤 판정하므로,
    문자열 검사로 막을 때 생기는 우회(`foo/../../etc`, `C:\\Windows\\...`)가 안 통한다.
    """
    try:
        root_resolved = root.resolve()
        target = Path(candidate)
        if not target.is_absolute():
            target = root_resolved / target
        # strict=False: 아직 만들어지지 않은 파일도 판정할 수 있어야 한다
        # (Write 는 존재하지 않는 경로에 대해 불린다).
        target = target.resolve()
    except (OSError, ValueError):
        return None

    if target == root_resolved or target.is_relative_to(root_resolved):
        return target
    return None


def kind_for(path: Path) -> str:
    return _KIND_BY_SUFFIX.get(path.suffix.lower(), "other")


def collect_artifacts(root: Path) -> list[tuple[str, str, int]]:
    """작업 공간을 훑어 (상대경로, 종류, 바이트) 목록을 만든다.

    실행이 끝날 때마다 통째로 다시 훑는다 — 에이전트가 파일을 지우거나
    이름을 바꿔도 색인이 따라가게 하려면 증분보다 이쪽이 정직하다.
    """
    if not root.exists():
        return []

    found: list[tuple[str, str, int]] = []
    for path in sorted(root.rglob("*")):
        if path.is_dir():
            continue
        if any(part in _SKIP_DIRS for part in path.relative_to(root).parts):
            continue
        try:
            size = path.stat().st_size
        except OSError:
            continue
        rel = path.relative_to(root).as_posix()
        found.append((rel, kind_for(path), size))
    return found


def read_artifact(root: Path, rel_path: str) -> str | None:
    """산출물 본문. 경로가 작업 공간 밖이거나 너무 크면 None."""
    target = resolve_inside(root, rel_path)
    if target is None or not target.is_file():
        return None
    try:
        if target.stat().st_size > MAX_ARTIFACT_BYTES:
            return None
        return target.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
