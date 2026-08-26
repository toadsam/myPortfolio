import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,90)));
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1800);
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(700);}
// 대비 검사용
const contrast=(a,b)=>{const L=c=>{const [r,g,bl]=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*r+0.7152*g+0.0722*bl};
  const l1=L(a),l2=L(b);return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2)};
for(const [name,f] of [["아주대학교 총학생회","t2-ajouchong"],["FestFlow","t2-festflow"],["TSEROF","t2-tserof"]]){
  await p.locator(".project-name-btn",{hasText:name}).first().click();
  await p.waitForTimeout(2400);
  const ov=p.locator(".op-detail");
  const r=await ov.evaluate(el=>{
    const g=(s)=>{const e=el.querySelector(s);if(!e)return null;const c=getComputedStyle(e);return {bg:c.backgroundColor,color:c.color,font:c.fontFamily.split(",")[0].replace(/["']/g,""),w:c.fontWeight,ls:c.letterSpacing}};
    return {root:g(".op-detail")||{bg:getComputedStyle(el).backgroundColor},nav:g("nav"),h1:g("h1"),td:g(".cyber-table td"),body:g("p")};
  });
  console.log(name, JSON.stringify(r));
  await p.screenshot({path:`.tmp/op/${f}.png`});
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
}
console.log("본문 대비 (달빛 #a9bdd6 on 밤하늘 #0b1626):", contrast([169,189,214],[11,22,38]));
console.log("제목 대비 (양피지 #f3e6c8 on 밤하늘):", contrast([243,230,200],[11,22,38]));
console.log("강조 대비 (간판금 #e2c078 on 밤하늘):", contrast([226,192,120],[11,22,38]));
console.log("보조 대비 (달빛 62% ≈ #6f7f92 on 밤하늘):", contrast([111,127,146],[11,22,38]));
console.log("JS 오류:", errs.length?errs.join(" | "):"없음");
await b.close();
