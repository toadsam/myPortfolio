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
  [
    "-B",
    "-m",
    "uvicorn",
    "app.main:app",
    "--app-dir",
    "backend",
    "--reload",
    "--port",
    "8000"
  ],
  {
    env: {...process.env, PYTHONDONTWRITEBYTECODE: "1"},
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
