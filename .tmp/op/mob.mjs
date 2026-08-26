import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1500);
const btns=p.locator(".project-name-btn");
console.log("titles:",await btns.count());
await btns.first().scrollIntoViewIfNeeded();
await btns.first().click();
await p.waitForTimeout(1800);
const ov=p.locator(".op-detail");
const info=await ov.evaluate(el=>({H:el.scrollHeight,vh:el.clientHeight,ow:el.scrollWidth,cw:el.clientWidth}));
console.log(JSON.stringify(info));
for(let s=0;s<4;s++){await ov.evaluate((e,y)=>e.scrollTo({top:y}),s*800);await p.waitForTimeout(700);await p.screenshot({path:`.tmp/op/m-${s}.png`});}
await b.close();
