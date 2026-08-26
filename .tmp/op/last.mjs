import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
// ① 이력서 본문이 안 변했는지
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1600);
const r=await p.evaluate(()=>{const c=getComputedStyle(document.body);return {bg:c.backgroundColor,color:c.color}});
console.log("이력서 body (변하면 안 됨):", JSON.stringify(r));
await p.screenshot({path:".tmp/op/last-resume.png"});
// ② 모바일에서 상세
const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
await m.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await m.waitForTimeout(1800);
await m.locator(".project-name-btn",{hasText:"아주대학교 총학생회"}).first().scrollIntoViewIfNeeded();
await m.locator(".project-name-btn",{hasText:"아주대학교 총학생회"}).first().click();
await m.waitForTimeout(2200);
const mm=await m.locator(".op-detail").evaluate(e=>({sw:e.scrollWidth,cw:e.clientWidth,bg:getComputedStyle(e).backgroundColor}));
console.log("모바일 상세:", JSON.stringify(mm), mm.sw>mm.cw?("⚠ 가로 "+(mm.sw-mm.cw)+"px 넘침"):"✅ 넘침 없음");
await m.screenshot({path:".tmp/op/last-mobile.png"});
await b.close();
