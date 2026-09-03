// "AI 포트폴리오 마을" 이력서 카드 그림(2.08:1) 합성.
//
// 왜 스크립트로 두는가: build-festflow-card.mjs 와 같은 이유다. 이 그림은
// **살아 있는 화면 두 장을 찍어 붙인 것**이라 마을이나 관리자 페이지가 바뀌면
// 같은 규칙으로 다시 뽑아야 한다. 손으로 찍은 캡처는 다음 사람이 어느 화면을
// 어떤 상태에서 찍었는지 알 수 없다.
//
// 구성: 왼쪽 = /village (입장 버튼과 루미 환영 카드를 지난 뒤의 마을),
// 오른쪽 = /admin (오늘의 활동 입력). 카드의 주장이 "관리자 입력이 마을을
// 바꾼다" 이므로 두 화면이 나란히 있어야 그림이 그 말을 한다.
//
// 관리자 잠금은 **비밀번호 없이** 지난다. /admin 은 토큰이 있어도 다이얼을
// 돌려야 열리므로(admin/page.tsx checkAuth 주석), 대신 `ADMIN_PASSWORD` 를 비운
// 백엔드를 딴 포트(8001)에 잠깐 띄우고 — 비어 있으면 문이 없다 — 캡처 브라우저의
// API 요청만 그쪽으로 돌린다. 실제 백엔드(8000)와 비밀번호는 건드리지 않는다.
// DB 는 같은 SQLite 를 읽는다(읽기만 한다).
//
// 실행: dev 서버를 띄운 뒤
//   node scripts/build-village-card.mjs            (dev 는 http://localhost:3000)
//   BASE=http://localhost:51432 node scripts/build-village-card.mjs
// 산출: public/projects/village-portfolio/card.webp (+ 확인용 .tmp/village-card-*.png)

import {mkdir} from "node:fs/promises";
import {existsSync} from "node:fs";
import {spawn, spawnSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
import sharp from "sharp";
import {launch} from "./e2e/lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const p = (...a) => path.join(root, ...a);

const BASE = process.env.BASE ?? "http://localhost:3000";
// 프론트가 기본으로 부르는 백엔드 주소(liveApi.ts 기본값)와, 인증 끈 임시 백엔드.
const API = process.env.API ?? "http://localhost:8000";
const ALT_PORT = 8001;
const API_ALT = `http://localhost:${ALT_PORT}`;

const W = 1200;
const H = 577; // 2.08:1 — 카드 그림 상자 비율(ResumeTerminal.css 260px 주석).
const HALF = W / 2;

function startOpenBackend() {
  const venvPython =
    process.platform === "win32"
      ? p("backend", ".venv", "Scripts", "python.exe")
      : p("backend", ".venv", "bin", "python");
  const python = existsSync(venvPython) ? venvPython : "python";
  const child = spawn(
    python,
    ["-m", "uvicorn", "app.main:app", "--port", String(ALT_PORT)],
    {
      cwd: p("backend"),
      // 환경변수가 .env 보다 우선한다(pydantic-settings). 빈 값 = 인증 꺼짐.
      env: {...process.env, ADMIN_PASSWORD: "", FRONTEND_ORIGIN: BASE},
      stdio: "ignore"
    }
  );
  return child;
}

function stopOpenBackend(child) {
  if (!child) return;
  if (process.platform === "win32")
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore"
    });
  else child.kill();
}

async function waitOpenBackend() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${API_ALT}/admin/auth-status`);
      if (r.ok) {
        const {auth_enabled} = await r.json();
        if (auth_enabled)
          throw new Error(
            "임시 백엔드에 인증이 켜져 있습니다 — 환경변수 우선순위 확인"
          );
        return;
      }
    } catch (e) {
      if (String(e).includes("인증이 켜져")) throw e;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`임시 백엔드(:${ALT_PORT})가 뜨지 않았습니다`);
}

async function clickIfAny(page, locator) {
  if (await locator.count())
    await locator
      .first()
      .click({timeout: 1000})
      .catch(() => {});
}

async function captureVillage(page, out) {
  await page.goto(`${BASE}/village`, {
    waitUntil: "domcontentloaded",
    timeout: 90000
  });
  await page.waitForFunction(
    () => (window.__three?.gl?.info?.memory?.geometries ?? 0) > 100,
    null,
    {timeout: 120000, polling: 500}
  );
  // 로딩 베일의 입장 버튼 → 루미 환영 카드의 건너뛰기. 둘 다 뜨는 시점이
  // 로드 뒤라 몇 초간 반복해서 누른다.
  for (let i = 0; i < 40; i++) {
    await clickIfAny(page, page.getByText("눌러서 들어가기"));
    await clickIfAny(page, page.getByRole("button", {name: "건너뛰기"}));
    await page.waitForTimeout(500);
  }
  // dev 전용 PERF 패널(F8)이 왼쪽 아래에 찍힌다 — 카드에는 마을만 있어야 한다.
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(b =>
      /F8/.test(b.textContent || "")
    );
    b?.click();
  });
  // 카메라 진입 연출이 끝나고 HUD 가 자리 잡을 시간.
  await page.waitForTimeout(3000);
  await page.screenshot({path: out});
}

async function captureAdmin(page, out) {
  await page.route(`${API}/**`, route =>
    route.continue({url: route.request().url().replace(API, API_ALT)})
  );
  await page.goto(`${BASE}/admin`, {waitUntil: "networkidle"});
  await page
    .getByText("불러오는 중")
    .waitFor({state: "hidden", timeout: 20000})
    .catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({path: out});
  await page.unroute(`${API}/**`);
}

async function main() {
  await mkdir(p(".tmp"), {recursive: true});
  await mkdir(p("public/projects/village-portfolio"), {recursive: true});

  const backend = startOpenBackend();
  const {browser, page, errors} = await launch();
  try {
    await waitOpenBackend();
    // 화면 비율을 카드 반쪽(600×577)과 맞춰 cover 크롭이 최소가 되게 한다.
    await page.setViewportSize({width: 1280, height: 1230});

    const village = p(".tmp/village-card-village.png");
    await captureVillage(page, village);
    const admin = p(".tmp/village-card-admin.png");
    await captureAdmin(page, admin);

    const left = await sharp(village)
      .resize(HALF, H, {fit: "cover", position: "centre"})
      .toBuffer();
    const right = await sharp(admin)
      .resize(HALF, H, {fit: "cover", position: "top"})
      .toBuffer();

    const out = p("public/projects/village-portfolio/card.webp");
    await sharp({
      create: {width: W, height: H, channels: 3, background: "#0b1016"}
    })
      .composite([
        {input: left, left: 0, top: 0},
        {input: right, left: HALF, top: 0}
      ])
      .webp({quality: 82})
      .toFile(out);
    console.log(`생성: ${path.relative(root, out)}`);
    if (errors.length) console.log("page errors:", errors);
  } finally {
    await browser.close();
    stopOpenBackend(backend);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
