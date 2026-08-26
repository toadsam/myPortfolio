import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,90)));
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1600);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
const btns=p.locator(".project-name-btn"); const n=await btns.count();
for(let i=0;i<n;i++){
  const name=(await btns.nth(i).innerText()).trim();
  await btns.nth(i).scrollIntoViewIfNeeded(); await btns.nth(i).click(); await p.waitForTimeout(2300);
  const ov=p.locator(".op-detail");
  // 남은 시안/순검정 픽셀 탐지
  const leak=await ov.evaluate(el=>{
    const bad=[];
    for(const e of el.querySelectorAll("*")){
      const c=getComputedStyle(e);
      for(const [k,v] of [["color",c.color],["bg",c.backgroundColor],["border",c.borderTopColor]]){
        const m=v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if(!m) continue;
        const [r,g,bl]=[+m[1],+m[2],+m[3]];
        if(bl>200&&g>180&&r<80) bad.push("시안 "+k+" "+v+" @"+e.className.toString().slice(0,30));
      }
    }
    return [...new Set(bad)].slice(0,4);
  });
  console.log(name, leak.length?("⚠ "+leak.join(" / ")):"✅ 시안 없음");
  // 데모 섹션 캡처
  await ov.evaluate(el=>{const s=[...el.querySelectorAll("main > section")].find(x=>x.textContent.includes("설명 대신 직접 눌러")); if(s) el.scrollTo({top:s.offsetTop-80});});
  await p.waitForTimeout(1200);
  await p.screenshot({path:`.tmp/op/v-${String(i).padStart(2,"0")}.png`});
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
}
console.log("JS 오류:", errs.length?errs.join(" | "):"없음");
await b.close();
