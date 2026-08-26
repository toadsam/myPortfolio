import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1800);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
await p.locator(".project-name-btn",{hasText:"득근득근"}).first().click();
await p.waitForTimeout(2400);
const r=await p.locator(".op-detail").evaluate(el=>{
  const small=[],wide=[];
  for(const e of el.querySelectorAll("main *")){
    const hasText=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
    if(!hasText) continue;
    const c=getComputedStyle(e), fs=parseFloat(c.fontSize);
    if(fs<=11) small.push(fs+"px "+e.tagName+"."+(e.className||"").toString().slice(0,38));
    const w=e.getBoundingClientRect().width;
    if(fs>=13 && w/fs>60 && e.textContent.trim().length>60)
      wide.push(Math.round(w/fs)+"자 "+e.tagName+"."+(e.className||"").toString().slice(0,38));
  }
  return {small:[...new Set(small)].slice(0,8), wide:[...new Set(wide)].slice(0,6)};
});
console.log("11px 이하:"); r.small.forEach(x=>console.log("  "+x));
console.log("한 줄 60자 초과:"); r.wide.forEach(x=>console.log("  "+x));
await b.close();
