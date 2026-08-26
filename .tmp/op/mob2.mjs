import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2200);
// 넘치는 범인 찾기
const bad=await p.evaluate(()=>{
  const W=document.documentElement.clientWidth, out=[];
  for(const e of document.querySelectorAll("*")){
    const r=e.getBoundingClientRect();
    if(r.width>0 && (r.right>W+1||r.left<-1)){
      out.push({t:e.tagName, c:(e.className||"").toString().slice(0,42),
        l:Math.round(r.left), rt:Math.round(r.right), w:Math.round(r.width)});
    }
  }
  // 가장 바깥쪽(부모가 이미 목록에 있으면 제외)
  return {W, sw:document.documentElement.scrollWidth, list:out.slice(0,12)};
});
console.log("뷰포트",bad.W,"scrollWidth",bad.sw);
bad.list.forEach(x=>console.log(` ${x.t}.${x.c} → left ${x.l} right ${x.rt} (w ${x.w})`));
await p.screenshot({path:".tmp/op/m2-hero.png"});
await b.close();
