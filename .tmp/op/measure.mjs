import {chromium} from "playwright";
const b = await chromium.launch({channel:"chromium"});
const p = await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1200);
const t = p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(600);}
const btns = p.locator(".project-name-btn");
const n = await btns.count();
console.log("id | 총높이 | 빈상자수 | 빈상자총높이 | 빈비율 | 실이미지 | CTA");
for(let i=0;i<n;i++){
  await btns.nth(i).click(); await p.waitForTimeout(1500);
  const r = await p.locator(".op-detail").evaluate(el=>{
    const H = el.scrollHeight;
    const ph=[...el.querySelectorAll(".placeholder-box")];
    const phH = ph.reduce((s,e)=>s+e.getBoundingClientRect().height,0);
    const imgs=[...el.querySelectorAll("img")].length;
    const ctas=[...el.querySelectorAll("main a")].map(a=>a.textContent.trim().replace(/\s+/g," ")).slice(0,4);
    const dead=[...el.querySelectorAll("main a")].filter(a=>!a.getAttribute("href")||a.getAttribute("href")==="#").length;
    const status=el.querySelector("nav")?.innerText.replace(/\s+/g," ").slice(0,60);
    return {H, phN:ph.length, phH:Math.round(phH), imgs, ctas, dead, status};
  });
  const name=(await btns.nth(i).innerText()).trim();
  console.log(`${name} | ${r.H} | ${r.phN} | ${r.phH} | ${(r.phH/r.H*100).toFixed(0)}% | img:${r.imgs} | dead-a:${r.dead} | ${r.ctas.join(" / ")}`);
  if(i===0) console.log("   nav:", r.status);
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
}
await b.close();
