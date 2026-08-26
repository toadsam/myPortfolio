import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1800);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(900);}
await p.locator(".project-card").first().scrollIntoViewIfNeeded();
await p.waitForTimeout(700);
await p.screenshot({path:".tmp/op/final-grid.png"});
await p.locator(".project-name-btn",{hasText:"TSEROF"}).first().click();
await p.waitForTimeout(2400);
await p.screenshot({path:".tmp/op/final-tserof.png"});
await p.keyboard.press("Escape"); await p.waitForTimeout(700);
await p.locator(".project-name-btn",{hasText:"aClub"}).first().click();
await p.waitForTimeout(2400);
await p.screenshot({path:".tmp/op/final-aclub.png"});
await b.close();
