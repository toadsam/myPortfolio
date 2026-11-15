// 「구조 한눈에 보기」 페이지를 사이트 안으로 들여온다.
//
//   node scripts/import-structure.mjs <id> <html 파일> [그림 폴더]
//
// 결과는 public/structure/<id>/index.html (+ img/). 본문은 고치지 않고 두 가지만 넣는다.
//   1. <base>: 주소가 /resume/<id>/structure 라서 img/… 같은 상대 경로가 엉뚱한 곳을 본다.
//   2. 상세로 돌아가는 링크 하나(오른쪽 위).
// 들여온 뒤 src/data/structurePages.ts 의 STRUCTURE_PAGES 에 id 를 더한다.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [id, htmlFile, imgDir] = process.argv.slice(2);
if (!id || !htmlFile) {
  console.error(
    "usage: node scripts/import-structure.mjs <id> <html> [img dir]"
  );
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(id)) {
  console.error("id 는 소문자·숫자·하이픈만");
  process.exit(1);
}

const out = path.join(root, "public", "structure", id);
fs.mkdirSync(out, {recursive: true});

let html = fs.readFileSync(htmlFile, "utf8");
// <base> 는 딸린 파일이 있을 때만 넣는다. 한 장짜리 페이지에 넣으면 SVG 의 url(#화살표) 같은
// 문서 안 참조가 브라우저에 따라 다른 주소를 볼 수 있다.
const base = `<base href="/structure/${id}/">`;
if (imgDir && !html.includes("<base ")) {
  if (!/<head[^>]*>/i.test(html)) {
    console.error("<head> 가 없는 파일");
    process.exit(1);
  }
  html = html.replace(/<head[^>]*>/i, m => m + base);
}
// 좁은 화면에서는 위쪽 탭을 가리므로 왼쪽 아래로 내린다.
const back =
  `<style>[data-structure-back]{position:fixed;right:12px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:70;` +
  `padding:6px 12px;border-radius:999px;background:#fff;color:#1f2937;font:600 13px system-ui,sans-serif;` +
  `text-decoration:none;box-shadow:0 2px 10px rgba(0,0,0,.16)}` +
  `@media (max-width:860px){[data-structure-back]{top:auto;right:auto;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px)}}</style>` +
  `<a href="/resume/${id}" data-structure-back>← 프로젝트 상세</a>`;
if (!html.includes("data-structure-back")) {
  const i = html.lastIndexOf("</body>");
  html = i >= 0 ? html.slice(0, i) + back + html.slice(i) : html + back;
}
fs.writeFileSync(path.join(out, "index.html"), html, "utf8");

let n = 0;
if (imgDir) {
  const dst = path.join(out, path.basename(imgDir));
  fs.mkdirSync(dst, {recursive: true});
  for (const f of fs.readdirSync(imgDir)) {
    fs.copyFileSync(path.join(imgDir, f), path.join(dst, f));
    n++;
  }
}
console.log(
  `public/structure/${id}/index.html ${html.length} chars, 그림 ${n}장`
);
