import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,90)));
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1800);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(800);}
// 카드에 남은 "잠정" 배지
const prov=await p.locator(".metric-provisional").count();
console.log('카드의 "잠정" 배지:', prov, prov===0?"✅":"⚠");
const cards=await p.evaluate(()=>[...document.querySelectorAll(".project-card")].map(c=>{
  const n=c.querySelector(".project-name")?.textContent.trim();
  const st=c.querySelector(".project-status")?.textContent.trim();
  const ms=[...c.querySelectorAll(".project-metric")].map(m=>m.textContent.replace(/\s+/g," ").trim());
  const ls=[...c.querySelectorAll("a")].map(a=>a.textContent.trim());
  return `${st.padEnd(4)} | ${n} | ${ms.join(" · ")||"(지표없음)"} | ${ls.join(", ")||"(링크없음)"}`;
}));
cards.forEach(c=>console.log(c));
console.log("");
for(const name of ["TSEROF","aClub","아주대학교 총학생회","득근득근"]){
  await p.locator(".project-name-btn",{hasText:name}).first().click();
  await p.waitForTimeout(2200);
  const r=await p.locator(".op-detail").evaluate(el=>({
    status:(el.querySelector("nav")?.innerText||"").replace(/\s+/g," ").match(/Status: \S+/)?.[0]||"(없음)",
    ctas:[...el.querySelectorAll("main a")].slice(0,4).map(a=>a.textContent.trim())
  }));
  console.log(name.padEnd(14), r.status.padEnd(14), "→", r.ctas.join(" | "));
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
}
console.log("JS 오류:", errs.length?errs.join(" | "):"없음");
await b.close();
