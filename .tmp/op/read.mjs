import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1600);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
await p.locator(".project-name-btn",{hasText:"득근득근"}).first().click();
await p.waitForTimeout(2400);
const r=await p.locator(".op-detail").evaluate(el=>{
  const secs=[...el.querySelectorAll("main > section")];
  return {
    H: el.scrollHeight, vh: el.clientHeight,
    chars: el.innerText.replace(/\s+/g," ").length,
    sections: secs.map(s=>{
      const lab=s.querySelector(".section-label")?.textContent.trim()
        || s.querySelector("h1,h2,h3")?.textContent.trim().slice(0,20) || "(라벨없음)";
      return {lab, top: Math.round(s.offsetTop), h: Math.round(s.getBoundingClientRect().height),
        chars: s.innerText.replace(/\s+/g," ").length};
    })
  };
});
console.log("총 높이", r.H, "= 화면", (r.H/r.vh).toFixed(1),"개 | 글자수", r.chars, "≈ 읽는 시간", Math.round(r.chars/500)+"분");
console.log("");
console.log("순서 | 섹션 | 시작y | 높이 | 글자".padEnd(10));
r.sections.forEach((s,i)=>console.log(`${i+1}. ${s.lab.padEnd(24)} y=${String(s.top).padStart(5)} h=${String(s.h).padStart(4)} 글자 ${s.chars}`));
await b.close();
