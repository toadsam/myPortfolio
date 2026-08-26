import {chromium} from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = ".tmp/op/ff/shots/";

const browser = await chromium.launch({channel: "chromium"});
const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
await page.goto(BASE + "/resume", {waitUntil: "networkidle"});
await page.waitForTimeout(1200);
await page.evaluate(() => {
  const c = [...document.querySelectorAll(".project-card")].find(el =>
    /FestFlow/i.test(el.textContent || "")
  );
  c && c.click();
});
await page.waitForTimeout(2000);

// .op-detail 자체가 스크롤 컨테이너다. 구역을 하나씩 화면에 올려 찍는다.
const info = await page.evaluate(() => {
  const d = document.querySelector(".op-detail");
  return {
    scrollH: d.scrollHeight,
    clientH: d.clientHeight,
    sections: [...d.querySelectorAll("section")].map(s => ({
      label: (s.querySelector(".section-label")?.textContent || "").trim(),
      top: s.offsetTop,
      h: s.offsetHeight
    }))
  };
});
console.log(JSON.stringify(info, null, 1));

let i = 0;
for (const s of info.sections) {
  await page.evaluate(t => {
    document.querySelector(".op-detail").scrollTop = t - 40;
  }, s.top);
  await page.waitForTimeout(900); // reveal 애니메이션
  await page.screenshot({path: `${OUT}s${String(i).padStart(2, "0")}.png`});
  i++;
}

await browser.close();
