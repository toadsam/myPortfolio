// 공개용 이력서 PDF 생성.
//
// 원본 `resume/jaehoon-jeong-resume.pdf` 에는 전화번호가 들어 있다. 그 파일을
// 그대로 public/ 에 올리면 번호가 공개 인터넷에 남아 크롤링·스팸 대상이 된다.
// 그래서 같은 HTML 원고에서 **Phone 블록만 지우고** 다시 인쇄한다.
// (PDF 를 사후 편집해 글자를 지우는 건 텍스트 레이어가 남아 안전하지 않다 —
//  애초에 그 글자가 없는 PDF 를 만드는 게 맞다.)
//
// 실행: node scripts/build-public-resume-pdf.mjs

import {readFile, writeFile, unlink} from "node:fs/promises";
import {join, dirname} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";
import {chromium} from "playwright";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = join(root, "resume/jaehoon-jeong-resume.html");
const OUT = join(root, "public/jeong-jaehoon-resume.pdf");
const TMP = join(root, ".tmp/resume-public.html");

const html = await readFile(SRC, "utf8");

// Phone 이 든 <div> 한 덩이를 통째로 들어낸다.
const stripped = html.replace(/\s*<div>\s*<dt>Phone<\/dt>[\s\S]*?<\/div>/, "");
if (stripped === html) {
  console.error(
    "Phone 블록을 못 찾았습니다 — 원본 구조가 바뀌었는지 확인하세요."
  );
  process.exit(1);
}
if (/6428-6247|tel:/.test(stripped)) {
  console.error("전화번호가 아직 남아 있습니다. 중단합니다.");
  process.exit(1);
}

await writeFile(TMP, stripped, "utf8");

const browser = await chromium.launch({channel: "chromium"});
const page = await browser.newPage();
await page.goto(pathToFileURL(TMP).href, {waitUntil: "networkidle"});
await page.pdf({
  path: OUT,
  format: "A4",
  printBackground: true,
  margin: {top: "14mm", bottom: "14mm", left: "12mm", right: "12mm"}
});
await browser.close();
await unlink(TMP);

console.log(`생성: public/jeong-jaehoon-resume.pdf`);
