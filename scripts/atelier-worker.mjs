// 의뢰 공방 직군 에이전트를 터미널에서 돌린다.
//
//   npm run atelier                        접수 목록과 상태
//   npm run atelier -- WO-3F2A9C71         대기 중인 작업 전부
//   npm run atelier -- WO-3F2A9C71 --role planner
//
// backend-dev.mjs 와 같은 방식으로 venv 파이썬을 찾는다. 실제 로직은
// backend/app/agents/cli.py 에 있고, 관리자 페이지 버튼과 같은 runner 를 부른다
// (게이트도 똑같이 걸린다 — 터미널이라고 승인을 건너뛰지 못한다).

import {spawn} from "node:child_process";
import {existsSync} from "node:fs";
import {join} from "node:path";

const root = process.cwd();
const venvPython =
  process.platform === "win32"
    ? join(root, "backend", ".venv", "Scripts", "python.exe")
    : join(root, "backend", ".venv", "bin", "python");

const python = existsSync(venvPython) ? venvPython : "python";

const child = spawn(
  python,
  ["-B", "-m", "app.agents.cli", ...process.argv.slice(2)],
  {
    // **작업 폴더는 리포 루트여야 한다.** DATABASE_URL 기본값이
    // `sqlite:///./portfolio_village.db` 라 cwd 기준 상대경로이고,
    // backend-dev.mjs 도 루트에서 uvicorn 을 띄운다(--app-dir backend).
    // 여기서만 backend/ 로 옮기면 서버와 **다른 DB 파일**을 보게 된다
    // (실제로 "접수번호를 찾을 수 없습니다"로 한 번 걸렸다).
    // app 패키지는 cwd 대신 PYTHONPATH 로 찾게 한다.
    cwd: root,
    env: {
      ...process.env,
      PYTHONPATH: join(root, "backend"),
      PYTHONDONTWRITEBYTECODE: "1",
      PYTHONIOENCODING: "utf-8"
    },
    stdio: "inherit"
  }
);

child.on("exit", code => {
  process.exit(code ?? 0);
});

process.on("SIGINT", () => {
  child.kill("SIGINT");
});

process.on("SIGTERM", () => {
  child.kill("SIGTERM");
});
