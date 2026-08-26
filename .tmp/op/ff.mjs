import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1500);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
const btn=p.locator(".project-name-btn",{hasText:"FestFlow"});
await btn.first().scrollIntoViewIfNeeded(); await btn.first().click();
await p.waitForTimeout(2500);
const ov=p.locator(".op-detail");
const m=await ov.evaluate(el=>{
  const ph=[...el.querySelectorAll(".placeholder-box")];
  return {H:el.scrollHeight, phN:ph.length, phH:Math.round(ph.reduce((s,e)=>s+e.getBoundingClientRect().height,0))};
});
console.log("after:",JSON.stringify(m), "빈비율", (m.phH/m.H*100).toFixed(0)+"%");
for(let s=0;s<3;s++){await ov.evaluate((e,y)=>e.scrollTo({top:y}),s*860);await p.waitForTimeout(1000);await p.screenshot({path:`.tmp/op/ff-${s}.png`});}
// 데모 상호작용: 부스 버튼 하나 눌러보기
const demoBtns = ov.locator("section button");
console.log("demo buttons:", await demoBtns.count());
await b.close();
