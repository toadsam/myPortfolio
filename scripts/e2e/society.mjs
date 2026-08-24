// NPC 사회 스모크 — 소식 피드 · relay 칩 · 관계도 연표를 한 바퀴 (5단계 F-10).
// 전제: dev 서버(3000) + 백엔드(8000) 실행 중. `node scripts/e2e/society.mjs`
import {
  feedFirst,
  launch,
  openNpcDialogue,
  openVillage,
  sendChat
} from "./lib.mjs";

const {browser, page, errors} = await launch();
let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "✅" : "❌"} ${name}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failed += 1;
};

try {
  await openVillage(page);

  // 1) 소식 피드가 떠 있다 (씨앗 소식 덕에 빈 DB 여도 있어야 한다)
  const first = await feedFirst(page);
  check("소식 피드", first !== "(없음)", first);

  // 2) 픽셀에게 relay → 💌 칩
  const input = await openNpcDialogue(page, "픽셀");
  check("픽셀 대화창", !!input);
  if (input) {
    await sendChat(page, input, "테오가 고맙다고 전해 달래");
    const chip = await page
      .getByText(/전해졌어요|부탁 완료/)
      .first()
      .textContent()
      .catch(() => null);
    check("relay 칩", !!chip, chip ?? "");
    await page
      .getByRole("button", {name: "대화창 닫기"})
      .click()
      .catch(() => {});
    await page.waitForTimeout(600);
  }

  // 3) 관계도 → 노드 클릭 → 기억/연표 섹션
  await page
    .getByText(/^\s*지휘\s*▸?\s*$/)
    .first()
    .click({timeout: 5000})
    .catch(() => {});
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(b =>
      b.textContent?.includes("관계도")
    );
    b?.click();
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const t = [...document.querySelectorAll("svg text")].find(
      t => t.textContent === "픽셀"
    );
    t?.parentElement?.dispatchEvent(new MouseEvent("click", {bubbles: true}));
  });
  await page.waitForTimeout(1500);
  const memory = await page.evaluate(
    () =>
      !![...document.querySelectorAll("p")].find(p =>
        /의 기억$/.test(p.textContent || "")
      )
  );
  check("노드 클릭 → 기억 목록", memory);

  check("페이지 에러 없음", errors.length === 0, errors.join(" | "));
} finally {
  await page.screenshot({path: "scripts/e2e/last-run.png"}).catch(() => {});
  await browser.close();
}
console.log(failed ? `\n${failed}개 실패` : "\n모두 통과");
process.exit(failed ? 1 : 0);
