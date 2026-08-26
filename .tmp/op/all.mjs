import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];
p.on("pageerror",e=>errs.push(String(e).slice(0,120)));
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1500);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
const btns=p.locator(".project-name-btn");
const n=await btns.count();
console.log("이름 | 총높이 | 빈상자 | 빈비율 | 데모높이");
for(let i=0;i<n;i++){
  const name=(await btns.nth(i).innerText()).trim();
  await btns.nth(i).scrollIntoViewIfNeeded(); await btns.nth(i).click();
  await p.waitForTimeout(2600);
  const ov=p.locator(".op-detail");
  const m=await ov.evaluate(el=>{
    const ph=[...el.querySelectorAll(".placeholder-box")];
    const secs=[...el.querySelectorAll("main > section")];
    const demoSec=secs.find(s=>s.textContent.includes("설명 대신 직접 눌러"));
    return {H:el.scrollHeight,phN:ph.length,
      phH:Math.round(ph.reduce((s,e)=>s+e.getBoundingClientRect().height,0)),
      demoH: demoSec?Math.round(demoSec.getBoundingClientRect().height):0};
  });
  console.log(`${name} | ${m.H} | ${m.phN} | ${(m.phH/m.H*100).toFixed(0)}% | ${m.demoH}`);
  // 데모 섹션으로 스크롤해 캡처
  await ov.evaluate(el=>{const s=[...el.querySelectorAll("main > section")].find(x=>x.textContent.includes("설명 대신 직접 눌러")); if(s) el.scrollTo({top: s.offsetTop-80});});
  await p.waitForTimeout(1300);
  await p.screenshot({path:`.tmp/op/demo-${String(i).padStart(2,"0")}.png`});
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
}
console.log("JS 오류:", errs.length? errs.join(" | "):"없음");
await b.close();
