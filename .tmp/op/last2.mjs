import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,90)));
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1800);
// 작업 비중 · 프로젝트 수가 자동으로 따라왔는지
const w=await p.evaluate(()=>document.body.innerText.match(/작업 비중[\s\S]{0,120}/)?.[0].replace(/\s+/g," "));
console.log("작업 비중:", w);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(800);}
console.log("카드 수:", await p.locator(".project-card").count());
// aClub 상세의 사용자 반응
await p.locator(".project-name-btn",{hasText:"aClub"}).first().click();
await p.waitForTimeout(2400);
const ov=p.locator(".op-detail");
const q=await ov.evaluate(el=>{
  const bq=[...el.querySelectorAll("blockquote")].find(x=>x.textContent.includes("모집을 마감"));
  if(!bq) return null;
  const s=[...el.querySelectorAll("main > section")].find(x=>x.contains(bq));
  return {text:bq.innerText.replace(/\s+/g," ").slice(0,120), y:Math.round(bq.offsetTop),
    inResults: !!s && s.textContent.includes("Results")};
});
console.log("aClub 사용자 반응:", JSON.stringify(q));
await ov.evaluate(el=>{const bq=[...el.querySelectorAll("blockquote")].find(x=>x.textContent.includes("모집을 마감")); if(bq) el.scrollTo({top:bq.offsetTop-150});});
await p.waitForTimeout(1100);
await p.screenshot({path:".tmp/op/testimonial.png"});
// 이름·단체명 유출 검사
const leak=await ov.evaluate(el=>["책 읽는","회장님","2026 회장"].filter(k=>el.innerText.includes(k)));
console.log("단체명/실명 유출:", leak.length?leak:"없음 ✅");
console.log("JS 오류:", errs.length?errs.join(" | "):"없음");
await b.close();
