import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1600);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
await p.locator(".project-name-btn",{hasText:"득근득근"}).first().click();
await p.waitForTimeout(2400);
const r=await p.locator(".op-detail").evaluate(el=>{
  const out={};
  // 본문 단락 폭 → 한 줄 글자수 추정
  const ps=[...el.querySelectorAll("main p")].filter(e=>e.innerText.trim().length>40);
  out.paras = ps.slice(0,4).map(e=>{const c=getComputedStyle(e);
    return {w:Math.round(e.getBoundingClientRect().width), fs:c.fontSize, lh:c.lineHeight,
      perLine: Math.round(e.getBoundingClientRect().width / parseFloat(c.fontSize))};});
  // 서체 종류
  out.fonts=[...new Set([...el.querySelectorAll("main *")].map(e=>getComputedStyle(e).fontFamily.split(",")[0].replace(/["']/g,"")))];
  // 글자 크기 분포
  const sizes={};
  el.querySelectorAll("main *").forEach(e=>{const t=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
    if(!t)return; const s=getComputedStyle(e).fontSize; sizes[s]=(sizes[s]||0)+1;});
  out.sizes=Object.entries(sizes).sort((a,b)=>parseFloat(a[0])-parseFloat(b[0]));
  // 목차/앵커 유무
  out.anchors = el.querySelectorAll('a[href^="#"]').length;
  return out;
});
console.log("본문 단락:", JSON.stringify(r.paras));
console.log("서체 종류:", r.fonts.join(" / "));
console.log("글자 크기 분포:", r.sizes.map(([s,n])=>`${s}×${n}`).join("  "));
console.log("페이지 내 목차/앵커:", r.anchors);
await b.close();
