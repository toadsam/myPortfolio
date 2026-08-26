import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2200);
await p.screenshot({path:".tmp/op/f-hero.png"});
const st=await p.evaluate(()=>[...document.querySelectorAll(".status-module")].map(e=>e.innerText.replace(/\s+/g," ").trim()));
console.log("히어로:", st.join("  |  "));
await p.locator(".resume-terminal section").first().scrollIntoViewIfNeeded(); await p.waitForTimeout(1300);
await p.screenshot({path:".tmp/op/f-proj.png"});
await p.locator(".resume-terminal section").nth(2).scrollIntoViewIfNeeded(); await p.waitForTimeout(1300);
await p.screenshot({path:".tmp/op/f-edu.png"});
// 교육이수 위치 확인
const ord=await p.evaluate(()=>{const s=[...document.querySelectorAll(".career-heading")].map(h=>h.textContent.trim());return s;});
console.log("학력·경력 안 소제목 순서:", ord.join(" → "));
await b.close();
