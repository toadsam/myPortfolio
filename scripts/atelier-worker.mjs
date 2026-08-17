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
    // 파이썬이 app 패키지를 찾도록 backend/ 를 작업 폴더로 삼는다.
    // 산출물 경로는 config.BACKEND_DIR 기준이라 cwd 와 무관하다.
    cwd: join(root, "backend"),
    env: {...process.env, PYTHONDONTWRITEBYTECODE: "1", PYTHONIOENCODING: "utf-8"},
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
