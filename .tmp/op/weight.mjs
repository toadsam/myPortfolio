import {chromium} from "playwright";
const b=await chromium.launch({channel:"chromium"});
const p=await b.newPage({viewport:{width:1440,height:900}});
let bytes=0, reqs=0;
p.on("response",async r=>{ if(/\.js(\?|$)/.test(r.url())){reqs++; try{bytes+=(await r.body()).length;}catch{} }});
await p.goto("http://localhost:3000/resume",{waitUntil:"networkidle"});
await p.waitForTimeout(2000);
console.log("초기 로드 JS:", Math.round(bytes/1024)+"KB /", reqs+"개");
const before=bytes, breq=reqs;
const t=p.locator("button",{hasText:"한번에 보기"}); if(await t.count()){await t.first().click();await p.waitForTimeout(600);}
await p.locator(".project-name-btn",{hasText:"FestFlow"}).first().click();
await p.waitForTimeout(3000);
console.log("상세 열 때 추가:", Math.round((bytes-before)/1024)+"KB /", (reqs-breq)+"개");
await b.close();
