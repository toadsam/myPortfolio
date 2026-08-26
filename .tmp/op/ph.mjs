import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2000);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(800);}
const btns=p.locator(".project-name-btn"); const n=await btns.count();
console.log("프로젝트 | 빈상자 수 | 총 높이(px) | 라벨");
let tot=0, totH=0;
for(let i=0;i<n;i++){
  const name=(await btns.nth(i).innerText()).trim();
  await btns.nth(i).scrollIntoViewIfNeeded(); await btns.nth(i).click(); await p.waitForTimeout(2000);
  const ov=p.locator(".op-detail");
  const r=await ov.evaluate(el=>{
    const ph=[...el.querySelectorAll(".placeholder-box")];
    return {n:ph.length, h:Math.round(ph.reduce((s,e)=>s+e.getBoundingClientRect().height,0)),
      docH: el.scrollHeight,
      items: ph.map(e=>({r:e.dataset.ratio||"", h:Math.round(e.getBoundingClientRect().height),
        w:Math.round(e.getBoundingClientRect().width), t:(e.textContent||"").trim().slice(0,26)}))};
  });
  tot+=r.n; totH+=r.h;
  console.log(`${name} | ${r.n}개 | ${r.h}px (${(r.h/r.docH*100).toFixed(0)}%) | ${r.items.map(x=>`${x.r} ${x.w}×${x.h} "${x.t}"`).join(" / ")}`);
  if(i===3){ // FestFlow 캡처
    await ov.evaluate(el=>{const b=el.querySelector('.placeholder-box[data-ratio="21:9"]'); if(b) el.scrollTo({top:b.offsetTop-120});});
    await p.waitForTimeout(1200); await p.screenshot({path:".tmp/op/ph-219.png"});
  }
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
}
console.log(`\n합계: 빈상자 ${tot}개 · ${totH}px`);
await b.close();
