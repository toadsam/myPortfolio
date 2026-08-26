import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on("pageerror",e=>errs.push(String(e).slice(0,100)));
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1500);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
const btns=p.locator(".project-name-btn"); const n=await btns.count();
console.log("이름 | 상단바 상태 | CTA | 이미지수");
for(let i=0;i<n;i++){
  const name=(await btns.nth(i).innerText()).trim();
  await btns.nth(i).scrollIntoViewIfNeeded(); await btns.nth(i).click(); await p.waitForTimeout(2200);
  const ov=p.locator(".op-detail");
  const r=await ov.evaluate(el=>({
    nav: (el.querySelector("nav")?.innerText||"").replace(/\s+/g," ").trim(),
    ctas: [...el.querySelectorAll("main a")].slice(0,3).map(a=>a.textContent.trim().replace(/\s+/g," ")+" → "+a.getAttribute("href")),
    imgs: el.querySelectorAll("img").length
  }));
  console.log(`${name} | ${r.nav.includes("운영 중")?"운영 중 ✅":"(없음)"} | ${r.ctas.join(" ‖ ")} | ${r.imgs}`);
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
}
console.log("JS 오류:", errs.length?errs.join(" | "):"없음");
await b.close();
