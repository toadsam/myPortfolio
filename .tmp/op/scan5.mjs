import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2000);
const info=await p.evaluate(()=>{
  const all=[...document.querySelectorAll("*")].filter(e=>e.scrollHeight>e.clientHeight+50 && e.clientHeight>400);
  return all.slice(0,4).map(e=>({cls:(e.className||"").toString().slice(0,40),tag:e.tagName,sh:e.scrollHeight,ch:e.clientHeight}));
});
console.log("스크롤 가능 요소:", JSON.stringify(info));
const n=await p.locator(".resume-terminal section").count();
console.log("섹션 수:", n);
for(let i=0;i<n;i++){
  const s=p.locator(".resume-terminal section").nth(i);
  await s.scrollIntoViewIfNeeded();
  await p.waitForTimeout(1100);
  await p.screenshot({path:`.tmp/op/c-${String(i).padStart(2,"0")}.png`});
  const t=(await s.innerText()).replace(/\s+/g," ").slice(0,50);
  console.log(i, t);
}
await b.close();
