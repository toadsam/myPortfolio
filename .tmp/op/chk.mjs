import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1800);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(900);}
console.log("출처 줄:", await p.locator(".metric-source").count(), "개");
console.log((await p.locator(".metric-source").allInnerTexts()).join(" | "));
// 캐러셀 상태(기본값)에서 겹침 측정
await p.reload({waitUntil:"networkidle"}); await p.waitForTimeout(2200);
const s=p.locator(".resume-terminal section").nth(2);
await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
const ov=await p.evaluate(()=>{
  const cards=[...document.querySelectorAll(".project-card")].map(c=>c.getBoundingClientRect());
  const btn=document.querySelector(".carousel-wrapper button")?.getBoundingClientRect();
  let hit=0;
  if(btn) for(const r of cards){ if(!(r.right<btn.left||r.left>btn.right||r.bottom<btn.top||r.top>btn.bottom)) hit++; }
  const clipped=cards.filter(r=>r.bottom>window.innerHeight||r.top<80).length;
  return {n:cards.length, btnOverlap:hit, clipped, btn:btn?Math.round(btn.width)+"x"+Math.round(btn.height):"none"};
});
console.log("캐러셀:", JSON.stringify(ov));
await p.screenshot({path:".tmp/op/carousel-now.png"});
await b.close();
