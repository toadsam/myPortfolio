// 백엔드 개발 서버. uvicorn 의 --reload 를 쓰지 않고 이 스크립트가 직접 감시·재시작한다.
//
// 왜: Windows 에서 uvicorn --reload 는 재시작 때 CTRL_C 를 프로세스 그룹에 보내는데, npm 을 띄운
// cmd 가 그걸 받아 "일괄 작업을 끝내시겠습니까 (Y/N)?" 프롬프트를 띄우고 거기서 멈춘다 — 파일 하나
// 고칠 때마다 서버가 죽은 것처럼 보였다. 여기서는 CTRL_C 없이 자식을 taskkill(/T /F) 로 끝내고
// 새로 띄우므로 프롬프트가 뜰 일이 없다. 다른 OS 에선 SIGTERM.
import {spawn, spawnSync} from "node:child_process";
import {existsSync, watch} from "node:fs";
import {join} from "node:path";

const root = process.cwd();
const appDir = join(root, "backend", "app");
const venvPython =
  process.platform === "win32"
    ? join(root, "backend", ".venv", "Scripts", "python.exe")
    : join(root, "backend", ".venv", "bin", "python");
const python = existsSync(venvPython) ? venvPython : "python";
const PORT = process.env.BACKEND_PORT || "8000";
const DEBOUNCE_MS = 400;

let child = null;
let restartTimer = null;
let shuttingDown = false;

function log(msg) {
  console.log(`[backend-dev] ${msg}`);
}

function start() {
  child = spawn(
    python,
    [
      "-B",
      "-m",
      "uvicorn",
      "app.main:app",
      "--app-dir",
      "backend",
      "--port",
      PORT
    ],
    {
      env: {
        ...process.env,
        PYTHONDONTWRITEBYTECODE: "1",
        PYTHONUNBUFFERED: "1"
      },
      stdio: "inherit",
      windowsHide: true
    }
  );
  const me = child;
  me.on("exit", code => {
    if (shuttingDown) process.exit(code ?? 0);
    if (me !== child) return; // 우리가 재시작하려고 죽인 것
    // 스스로 죽었다(문법 오류 등) — 다음 저장 때 다시 띄운다.
    log(`서버가 종료됨 (code ${code}). 파일을 저장하면 다시 띄웁니다.`);
    child = null;
  });
}

function kill(proc) {
  if (!proc || proc.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(proc.pid), "/T", "/F"], {
      stdio: "ignore"
    });
  } else {
    proc.kill("SIGTERM");
  }
}

function restart(reason) {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    log(`restart: ${reason}`);
    const old = child;
    child = null;
    kill(old);
    start();
  }, DEBOUNCE_MS);
}

// backend/app 아래 .py 만 본다. fs.watch recursive 는 Windows/macOS 에서 지원된다.
watch(appDir, {recursive: true}, (_event, filename) => {
  if (!filename || !String(filename).endsWith(".py")) return;
  if (String(filename).includes("__pycache__")) return;
  restart(String(filename));
});

function shutdown() {
  shuttingDown = true;
  kill(child);
  if (!child) process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

log(`uvicorn :${PORT} (watching backend/app/**/*.py)`);
start();
