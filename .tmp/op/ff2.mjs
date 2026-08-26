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
await p.screenshot({path:".tmp/op/ff2-0.png"});
// 데모까지 스크롤 후 부스 클릭 → 피드 반영 확인
await ov.evaluate(e=>e.scrollTo({top:700}));
await p.waitForTimeout(1000);
const before = await ov.locator("text=실시간 피드").locator("xpath=../..").innerText().catch(()=> "");
const booth = ov.locator("button", {hasText:"핸드메이드"});
console.log("핸드메이드 버튼:", await booth.count());
if(await booth.count()){ await booth.first().click(); await p.waitForTimeout(1400); await booth.first().click(); await p.waitForTimeout(1600); }
await p.screenshot({path:".tmp/op/ff2-1.png"});
const m=await ov.evaluate(el=>{
  const ph=[...el.querySelectorAll(".placeholder-box")];
  return {H:el.scrollHeight, phN:ph.length, phH:Math.round(ph.reduce((s,e)=>s+e.getBoundingClientRect().height,0))};
});
console.log("빈상자:",m.phN,"/", m.phH+"px", "= "+(m.phH/m.H*100).toFixed(0)+"% (원래 49%)");
await b.close();
