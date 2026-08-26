import {chromium} from "playwright";
const ids = process.argv.slice(2);
const b = await chromium.launch({channel: "chromium"});
const p = await b.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 1});
await p.goto("http://localhost:3000/resume", {waitUntil: "networkidle"});
await p.waitForTimeout(1500);
// 그리드로 전환해 카드 제목 버튼을 노출
const toggle = p.locator("button", {hasText: "한번에 보기"});
if (await toggle.count()) { await toggle.first().click(); await p.waitForTimeout(800); }
const btns = p.locator(".project-name-btn");
const n = await btns.count();
console.log("clickable project titles:", n);
const names = [];
for (let i = 0; i < n; i++) names.push((await btns.nth(i).innerText()).trim());
console.log(JSON.stringify(names, null, 0));
for (let i = 0; i < n; i++) {
  await btns.nth(i).scrollIntoViewIfNeeded();
  await btns.nth(i).click();
  await p.waitForTimeout(1800);
  const ov = p.locator(".op-detail");
  if (!(await ov.count())) { console.log(i, names[i], "NO OVERLAY"); continue; }
  const h = await ov.evaluate(e => e.scrollHeight);
  const vh = await ov.evaluate(e => e.clientHeight);
  const slug = String(i).padStart(2,"0");
  // 위에서부터 한 화면씩
  const shots = Math.min(6, Math.ceil(h/vh));
  for (let s = 0; s < shots; s++) {
    await ov.evaluate((e,y)=>e.scrollTo({top:y,behavior:"instant"}), s*vh*0.95);
    await p.waitForTimeout(900);
    await p.screenshot({path: `.tmp/op/${slug}-${s}.png`});
  }
  console.log(i, names[i], "scrollHeight", h, "screens", Math.ceil(h/vh));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(700);
}
await b.close();
