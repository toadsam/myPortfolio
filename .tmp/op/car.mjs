import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2200);
const s=p.locator(".resume-terminal section").first();
await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(1400);
await p.screenshot({path:".tmp/op/car-now.png"});
const m=await p.evaluate(()=>{
  const tb=[...document.querySelectorAll("button")].find(b=>/한번에 보기|캐러셀로 보기/.test(b.textContent));
  if(!tb) return {err:"버튼 없음"};
  const r=tb.getBoundingClientRect();
  let hit=[];
  for(const c of document.querySelectorAll(".project-card")){
    const q=c.getBoundingClientRect();
    if(!(q.right<r.left||q.left>r.right||q.bottom<r.top||q.top>r.bottom))
      hit.push((c.querySelector(".project-name")?.textContent||"").trim());
  }
  return {btn:Math.round(r.width)+"x"+Math.round(r.height), y:Math.round(r.top), overlap:hit};
});
console.log(JSON.stringify(m));
await b.close();
