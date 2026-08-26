import {chromium} from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = ".tmp/op/ff/shots/";

const page = await (
  await chromium.launch({channel: "chromium"})
).newPage({viewport: {width: 1440, height: 960}, deviceScaleFactor: 1});

const errs = [];
page.on("console", m => m.type() === "error" && errs.push(m.text()));
page.on("pageerror", e => errs.push("PAGEERROR " + e.message));

await page.goto(BASE + "/resume", {waitUntil: "networkidle"});
await page.waitForTimeout(1200);

// 그리드 보기로 바꿔 카드를 전부 노출시킨 뒤 FestFlow 카드를 연다.
const gridBtn = page.locator("button", {hasText: /그리드|전체 보기|목록/}).first();
if (await gridBtn.count()) {
  await gridBtn.click().catch(() => {});
  await page.waitForTimeout(600);
}
// 캐러셀이 계속 돌아 Playwright의 안정성 검사에 걸린다 — DOM에서 직접 누른다.
const clicked = await page.evaluate(() => {
  const c = [...document.querySelectorAll(".project-card")].find(el =>
    /FestFlow/i.test(el.textContent || "")
  );
  if (!c) return false;
  c.click();
  return true;
});
console.log("clicked", clicked);
await page.waitForTimeout(2200);

const detail = page.locator(".op-detail").first();
if (!(await detail.count())) {
  console.log("상세가 안 열림");
  process.exit(1);
}

// 전체 높이 + 구역별 캡처
const box = await detail.boundingBox();
console.log("detail height", Math.round(box.height));

await detail.screenshot({path: OUT + "full.png", scale: "css"});

for (const [name, sel] of [
  ["hero", "section:nth-of-type(1)"],
  ["problem", "section:nth-of-type(3)"]
]) {
  const el = detail.locator(sel).first();
  if (await el.count()) await el.screenshot({path: OUT + name + ".png"});
}

// 빈 플레이스홀더가 몇 개 남았는지
const ph = await page.locator(".op-detail .placeholder-box").count();
const imgs = await page.locator(".op-detail img").count();
const broken = await page.evaluate(() =>
  [...document.querySelectorAll(".op-detail img")]
    .filter(i => !i.complete || i.naturalWidth === 0)
    .map(i => i.getAttribute("src"))
);
const overflow = await page.evaluate(() => {
  const d = document.querySelector(".op-detail");
  return {scrollW: d.scrollWidth, clientW: d.clientWidth};
});
console.log(JSON.stringify({placeholders: ph, images: imgs, broken, overflow, errs: errs.slice(0, 6)}, null, 2));

await page.context().browser().close();
