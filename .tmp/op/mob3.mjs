import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2200);
await p.locator(".project-name-btn",{hasText:"aClub"}).first().scrollIntoViewIfNeeded();
await p.locator(".project-name-btn",{hasText:"aClub"}).first().click();
await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{
  const el=document.querySelector(".op-detail");
  const W=el.clientWidth, out=[];
  for(const e of el.querySelectorAll("*")){
    const b=e.getBoundingClientRect(), p=el.getBoundingClientRect();
    const right=b.right-p.left, left=b.left-p.left;
    if(b.width>0 && (right>W+1||left<-1)) out.push({t:e.tagName,c:(e.className||"").toString().slice(0,46),
      l:Math.round(left),rt:Math.round(right),w:Math.round(b.width)});
  }
  return {W, sw:el.scrollWidth, list:out.slice(0,10)};
});
console.log("상세 clientWidth",r.W,"scrollWidth",r.sw, r.sw>r.W?("⚠ "+(r.sw-r.W)+"px 넘침"):"✅");
r.list.forEach(x=>console.log(` ${x.t}.${x.c} → ${x.l}~${x.rt} (w ${x.w})`));
for(let i=0;i<3;i++){ await p.locator(".op-detail").evaluate((e,y)=>e.scrollTo({top:y}), i*760); await p.waitForTimeout(800);
  await p.screenshot({path:`.tmp/op/m3-${i}.png`}); }
await b.close();
