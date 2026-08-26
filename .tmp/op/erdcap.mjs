import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:1100}});
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,100)));
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2000);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(800);}
await p.locator(".project-name-btn",{hasText:"득근득근"}).first().click();
await p.waitForTimeout(2500);
const figs=p.locator(".op-detail figure svg[role=img]");
console.log("다이어그램:", await figs.count(), "장");
for(let i=0;i<await figs.count();i++){
  await figs.nth(i).scrollIntoViewIfNeeded(); await p.waitForTimeout(1000);
  await figs.nth(i).screenshot({path:`.tmp/op/fig-${i}.png`});
  const bb=await figs.nth(i).boundingBox();
  console.log(` ${i}: ${Math.round(bb.width)}x${Math.round(bb.height)}`);
}
console.log("JS 오류:", errs.length?errs.join(" | "):"없음");
await b.close();
