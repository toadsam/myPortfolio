import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1600);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
await p.locator(".project-name-btn",{hasText:"득근득근"}).first().click();
await p.waitForTimeout(2400);
const ov=p.locator(".op-detail");
for(const [y,f] of [[2050,"s-arch"],[3800,"s-trouble"],[4980,"s-results"]]){
  await ov.evaluate((e,yy)=>e.scrollTo({top:yy}),y); await p.waitForTimeout(1100);
  await p.screenshot({path:`.tmp/op/${f}.png`});
}
await b.close();
