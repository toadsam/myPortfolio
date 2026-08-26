import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,100)));
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2000);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(800);}
await p.locator(".project-name-btn",{hasText:"득근득근"}).first().click();
await p.waitForTimeout(2400);
const ov=p.locator(".op-detail");
const fig=ov.locator("figure svg[role=img]");
console.log("다이어그램:", await fig.count(), "개");
if(await fig.count()){
  await fig.first().scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
  const bb=await fig.first().boundingBox();
  console.log("크기:", Math.round(bb.width)+"x"+Math.round(bb.height));
  await p.screenshot({path:".tmp/op/diagram.png"});
  await fig.first().screenshot({path:".tmp/op/diagram-only.png"});
}
const ph=await ov.evaluate(el=>[...el.querySelectorAll(".placeholder-box")].map(e=>e.dataset.ratio+" "+(e.textContent||"").trim().slice(0,24)));
console.log("남은 빈 상자:", ph.length, ph);
console.log("JS 오류:", errs.length?errs.join(" | "):"없음");
await b.close();
