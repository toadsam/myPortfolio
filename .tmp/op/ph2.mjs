import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2000);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(800);}
await p.locator(".project-name-btn",{hasText:"FestFlow"}).first().click();
await p.waitForTimeout(2400);
const boxes=p.locator('.op-detail .placeholder-box[data-ratio="21:9"]');
console.log("21:9 상자:", await boxes.count(), "개");
for(let i=0;i<await boxes.count();i++){
  await boxes.nth(i).scrollIntoViewIfNeeded();
  await p.waitForTimeout(1100);
  await p.screenshot({path:`.tmp/op/ph219-${i}.png`});
  const r=await boxes.nth(i).evaluate(e=>{const b=e.getBoundingClientRect();
    return {w:Math.round(b.width),h:Math.round(b.height),label:(e.textContent||"").trim()};});
  console.log(" ", JSON.stringify(r));
}
await b.close();
