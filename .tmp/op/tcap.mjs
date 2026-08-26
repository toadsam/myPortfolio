import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1800);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(800);}
await p.locator(".project-name-btn",{hasText:"aClub"}).first().click();
await p.waitForTimeout(2400);
const ov=p.locator(".op-detail");
await ov.evaluate(el=>{const s=[...el.querySelectorAll("main > section")].find(x=>x.textContent.includes("Results")); if(s) el.scrollTo({top:s.offsetTop-90});});
await p.waitForTimeout(1400);
await p.screenshot({path:".tmp/op/testimonial.png"});
await b.close();
