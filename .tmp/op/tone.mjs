import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(1800);
const pick=(sel,label)=>p.evaluate(([s,l])=>{
  const e=document.querySelector(s); if(!e) return {l, err:"없음"};
  const c=getComputedStyle(e);
  return {l, bg:c.backgroundColor, color:c.color, font:c.fontFamily.split(",")[0].replace(/["']/g,""),
    radius:c.borderRadius, border:c.borderColor, weight:c.fontWeight, size:c.fontSize, ls:c.letterSpacing};
},[sel,label]);
console.log("── 이력서 페이지 ──");
for(const [s,l] of [["body","body"],[".resume-terminal .hero-name","히어로 이름"],[".resume-terminal .project-card","프로젝트 카드"],[".resume-terminal .project-metric","지표 칩"],[".resume-terminal .career-card","경력 카드"]]) console.log(JSON.stringify(await pick(s,l)));
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(600);}
await p.locator(".project-name-btn",{hasText:"아주대학교 총학생회"}).first().click();
await p.waitForTimeout(2500);
console.log("── 프로젝트 상세 ──");
for(const [s,l] of [[".op-detail","루트"],[".op-detail h1","제목"],[".op-detail nav","상단바"],[".op-detail .badge","뱃지"],[".op-detail .section-label","섹션 라벨"],[".op-detail .cyber-table td","표 셀"]]) console.log(JSON.stringify(await pick(s,l)));
await p.screenshot({path:".tmp/op/tone-detail.png"});
await p.keyboard.press("Escape"); await p.waitForTimeout(900);
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(600);
await p.screenshot({path:".tmp/op/tone-resume.png"});
await b.close();
