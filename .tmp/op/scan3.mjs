import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2000);
const sc=await p.evaluate(()=>{const e=document.querySelector(".viewport")||document.scrollingElement;return e.className||"scrollingElement";});
console.log("스크롤 컨테이너:", sc);
// "예정" 3곳 문맥
const ctx=await p.evaluate(()=>{const t=(document.querySelector(".resume-terminal")||document.body).innerText;
  const out=[];let i=-1;while((i=t.indexOf("예정",i+1))>=0) out.push(t.slice(Math.max(0,i-45),i+8).replace(/\s+/g," "));return out;});
ctx.forEach(c=>console.log("  예정 →", c));
for(const [y,f] of [[0,"a-hero"],[900,"a-skills"],[1950,"a-career"],[3300,"a-career2"],[4330,"a-proj"],[6110,"a-values"],[6770,"a-records"],[7580,"a-contact"]]){
  await p.evaluate(yy=>window.scrollTo(0,yy), y); await p.waitForTimeout(900);
  await p.screenshot({path:`.tmp/op/${f}.png`});
}
await b.close();
