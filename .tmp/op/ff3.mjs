import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1500);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
for(const [name,file] of [["FestFlow","ff3"],["득근득근","mu3"]]){
  const btn=p.locator(".project-name-btn",{hasText:name});
  await btn.first().scrollIntoViewIfNeeded(); await btn.first().click();
  await p.waitForTimeout(2500);
  const ov=p.locator(".op-detail");
  await p.screenshot({path:`.tmp/op/${file}-0.png`});
  await ov.evaluate(e=>e.scrollTo({top:640})); await p.waitForTimeout(1200);
  await p.screenshot({path:`.tmp/op/${file}-1.png`});
  const m=await ov.evaluate(el=>{const ph=[...el.querySelectorAll(".placeholder-box")];
    return {H:el.scrollHeight,phN:ph.length,phH:Math.round(ph.reduce((s,e)=>s+e.getBoundingClientRect().height,0))};});
  console.log(name,"높이",m.H,"빈상자",m.phN,"("+(m.phH/m.H*100).toFixed(0)+"%)");
  await p.keyboard.press("Escape"); await p.waitForTimeout(700);
}
await b.close();
