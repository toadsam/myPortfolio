import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,90)));
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2000);
const r=await p.evaluate(()=>{
  const root=document.querySelector(".resume-terminal")||document.body;
  const txt=root.innerText;
  // 섹션 목차
  const secs=[...document.querySelectorAll(".resume-terminal section")].map(s=>{
    const h=s.querySelector("h2,.section-title,.viewport-title");
    return {t:(h?.innerText||s.innerText.slice(0,40)).replace(/\s+/g," ").trim().slice(0,44),
      y:Math.round(s.offsetTop), h:Math.round(s.getBoundingClientRect().height)};
  });
  // 링크
  const as=[...document.querySelectorAll("a[href]")];
  const dead=as.filter(a=>{const h=a.getAttribute("href");return !h||h==="#"||h==="";});
  // 빈 값 / 자리표시자 흔적
  const bad=["확인필요","TODO","준비 중","예정","임시","Lorem","placeholder","이미지 자리"]
    .map(k=>[k,(txt.match(new RegExp(k,"g"))||[]).length]).filter(x=>x[1]>0);
  return {chars:txt.length, H:document.body.scrollHeight, secs, links:as.length, dead:dead.length,
    bad, focusables:document.querySelectorAll("a[href],button,input,select,textarea,[tabindex]").length};
});
console.log("총 높이",r.H,"= 화면",(r.H/900).toFixed(1),"| 글자",r.chars,"≈",Math.round(r.chars/500)+"분");
console.log("링크",r.links,"(빈 href",r.dead+")","| 포커스 가능",r.focusables);
console.log("자리표시자 흔적:", r.bad.length?JSON.stringify(r.bad):"없음 ✅");
console.log("\n섹션:");
r.secs.forEach((s,i)=>console.log(` ${String(i+1).padStart(2)}. y=${String(s.y).padStart(5)} h=${String(s.h).padStart(4)} ${s.t}`));
console.log("\nJS 오류:", errs.length?errs.join(" | "):"없음");
await b.close();
