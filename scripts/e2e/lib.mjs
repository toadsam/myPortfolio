// 마을 E2E 헬퍼 — 헤드리스 검증 때마다 다시 발명하던 "여는 순서"를 한 곳에 (5단계 F-10).
//
// 사용: dev 서버(3000)와 백엔드(8000)를 띄운 뒤 `node scripts/e2e/society.mjs`.
// playwright-core 가 없다면 `npm i playwright-core` (전역 아님, devDependency 도 아님 —
// CI 가 아니라 로컬 검증 전용이라 package.json 에 넣지 않는다). channel:"chromium" 은
// 설치된 크로미움을 그대로 쓴다.
//
// 하드런에서 배운 순서 그대로다:
// 1) three 지오메트리가 100개 넘을 때까지(씬 로드) 기다린다
// 2) "건너뛰기"(루미 안내 패널)를 닫는다 — 로드 후에도 다시 뜨므로 두 번 돈다
// 3) PERF 패널(F8)을 닫는다 — NPC 독을 덮어 클릭을 먹는다
// 4) HUD(마을 소식)를 펼친다
import {chromium} from "playwright-core";

// 번들 크로미움이 없으면(버전이 오르면 다시 받아야 한다) 설치된 Chrome → Edge 로
// 내려간다. 캡처·검증용이라 어느 크로미움이든 같다. PW_CHANNEL 로 못박을 수 있다.
export async function launchChromium(options = {}) {
  const channels = process.env.PW_CHANNEL
    ? [process.env.PW_CHANNEL]
    : ["chromium", "chrome", "msedge"];
  let lastError;
  for (const channel of channels) {
    try {
      return await chromium.launch({channel, headless: true, ...options});
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

export async function launch() {
  const browser = await launchChromium();
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800}
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
  return {browser, page, errors};
}

export async function openVillage(page, base = "http://localhost:3000") {
  await page.goto(`${base}/village`, {
    waitUntil: "domcontentloaded",
    timeout: 90000
  });
  await page.waitForFunction(
    () => (window.__three?.gl?.info?.memory?.geometries ?? 0) > 100,
    null,
    {timeout: 120000, polling: 500}
  );
  for (let i = 0; i < 60; i++) {
    const skip = page.getByRole("button", {name: "건너뛰기"});
    if (await skip.count())
      await skip
        .first()
        .click({timeout: 1000})
        .catch(() => {});
    if (
      !(await page.getByText(/마을을 짓는 중/).count()) &&
      (await page.getByText(/AI NPC/).count())
    )
      break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1200);
  for (let i = 0; i < 20; i++) {
    const skip = page.getByRole("button", {name: "건너뛰기"});
    if (!(await skip.count())) break;
    await skip
      .first()
      .click({timeout: 1000})
      .catch(() => {});
    await page.waitForTimeout(500);
  }
  // PERF 패널이 NPC 독(왼쪽 아래)을 덮는다
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(b =>
      /F8/.test(b.textContent || "")
    );
    b?.click();
  });
  // HUD(마을 소식) 펼치기
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(
      b => b.getAttribute("title") === "펼치기"
    );
    b?.click();
  });
  await page.waitForTimeout(500);
}

/** NPC 독에서 이름으로 대화창 열기. 루미는 대화창이 아니라 안내 패널을 열므로 넣지 말 것. */
export async function openNpcDialogue(page, name) {
  await page
    .getByText(/AI NPC/)
    .first()
    .click({timeout: 5000})
    .catch(() => {});
  await page.waitForTimeout(600);
  await page.evaluate(npcName => {
    const b = [...document.querySelectorAll("button")].find(
      b =>
        (b.textContent || "").includes(npcName) &&
        !/관계도|지휘/.test(b.textContent || "")
    );
    b?.click();
  }, name);
  await page.waitForTimeout(1800);
  const input = page.locator('input[aria-label$="질문 입력"]');
  return (await input.count()) ? input : null;
}

/** 메시지를 보내고 답변(입력 재활성화)까지 기다린다. */
export async function sendChat(page, input, text) {
  await input.fill(text);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1500);
  for (let j = 0; j < 120; j++) {
    if (await input.isEnabled().catch(() => false)) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(400);
}

/** HUD 소식 피드의 첫 줄 텍스트 (펼쳐져 있어야 한다). */
export async function feedFirst(page) {
  return page.evaluate(() => {
    const h = [...document.querySelectorAll("p")].find(
      e => e.textContent?.trim() === "NPC 들 사이에서"
    );
    const first = h?.parentElement?.querySelector("p + p");
    return first?.innerText?.replace(/\n+/g, " ").slice(0, 140) ?? "(없음)";
  });
}
