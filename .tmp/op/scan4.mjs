import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2000);
const vp=p.locator(".viewport");
for(const [y,f] of [[950,"b-skills"],[2000,"b-career"],[3200,"b-career2"],[4350,"b-proj"],[5250,"b-sub"],[6120,"b-values"],[6780,"b-records"],[7600,"b-contact"]]){
  await vp.evaluate((e,yy)=>e.scrollTo({top:yy,behavior:"instant"}), y);
  await p.waitForTimeout(1000);
  await p.screenshot({path:`.tmp/op/${f}.png`});
}
// 히어로 4번째 지표 뜻
const st=await p.evaluate(()=>[...document.querySelectorAll(".status-module")].map(e=>e.innerText.replace(/\s+/g," ").trim()));
console.log("히어로 지표:", JSON.stringify(st));
await b.close();
