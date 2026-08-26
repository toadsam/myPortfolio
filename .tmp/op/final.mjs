import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1500);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
for(const [name,f] of [["아주대학교 총학생회","fin-ajouchong"],["득근득근","fin-muscleup"]]){
  await p.locator(".project-name-btn",{hasText:name}).first().click();
  await p.waitForTimeout(2400);
  await p.screenshot({path:`.tmp/op/${f}.png`});
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
}
// 최종 빈상자 집계
const btns=p.locator(".project-name-btn"); const n=await btns.count();
let tot=0, totPh=0;
for(let i=0;i<n;i++){
  await btns.nth(i).click(); await p.waitForTimeout(1800);
  const m=await p.locator(".op-detail").evaluate(el=>{const ph=[...el.querySelectorAll(".placeholder-box")];
    return {H:el.scrollHeight,phH:Math.round(ph.reduce((s,e)=>s+e.getBoundingClientRect().height,0)),n:ph.length};});
  tot+=m.H; totPh+=m.phH;
  await p.keyboard.press("Escape"); await p.waitForTimeout(400);
}
console.log("9개 합계 빈상자 비율:", (totPh/tot*100).toFixed(0)+"%  (착수 전 34%)");
await b.close();
