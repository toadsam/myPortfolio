import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
for(const [w,h,mob,f] of [[1440,900,false,"dg-desk"],[390,844,true,"dg-mob"]]){
  const p=await b.newPage({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});
  await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
  await p.waitForTimeout(2000);
  const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(800);}
  await p.locator(".project-name-btn",{hasText:"득근득근"}).first().scrollIntoViewIfNeeded();
  await p.locator(".project-name-btn",{hasText:"득근득근"}).first().click();
  await p.waitForTimeout(2400);
  const ov=p.locator(".op-detail");
  await ov.evaluate(el=>{const f=el.querySelector("figure svg[role=img]"); if(f) el.scrollTo({top:f.closest("section").offsetTop-40});});
  await p.waitForTimeout(1300);
  await p.screenshot({path:`.tmp/op/${f}.png`});
  const m=await ov.evaluate(el=>({sw:el.scrollWidth,cw:el.clientWidth,
    svg:(()=>{const s=el.querySelector("figure svg[role=img]");const b=s.getBoundingClientRect();return Math.round(b.width)+"x"+Math.round(b.height);})()}));
  console.log(f, JSON.stringify(m), m.sw>m.cw?"⚠ 넘침":"✅");
  await p.close();
}
await b.close();
