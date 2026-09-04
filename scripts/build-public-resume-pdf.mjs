// 이력서 PDF 생성 — `src/data/resume.ts` 를 그대로 읽어 A4 인쇄용 HTML 을 만들고 찍는다.
//
// ── 왜 데이터에서 만드나 ─────────────────────────────────────────────────────
// 예전에는 `resume/jaehoon-jeong-resume.html` 이라는 손으로 쓴 웹페이지(1060px,
// 사이드바 2단)를 A4 로 인쇄했다. 두 가지가 무너졌다:
//   1. 사이드바가 1쪽에서 끝나 2·3쪽 왼쪽 절반이 백지였고, 학력 한 줄이 쪽 경계에
//      잘렸다 — 화면 레이아웃을 종이에 그대로 넣은 결과.
//   2. 사이트 이력서(`resume.ts`)와 원고가 달라, 8월 이후 사이트는 12번 고치는
//      동안 PDF 원고는 4번만 따라갔다. 심사자가 보는 건 PDF 쪽이다.
// 그래서 원고를 하나로 합쳤다. 이 스크립트는 앱의 TS 모듈을 **그대로** 불러오고
// (`scripts/lib/ts-loader.mjs` — check:village 와 같은 방식), 인쇄 전용 템플릿으로
// 다시 그린다. 화면 원페이저(ResumeMode)와 디자인은 다르지만 문장은 같다.
//
// ── 전화번호 ─────────────────────────────────────────────────────────────────
// 번호는 코드 어디에도 없다(`resume.ts` 는 브라우저 번들에 들어간다). `--private`
// 일 때만 원본 md 의 `Phone:` 줄에서 읽어 `resume/` 사본에 넣고, 공개본
// (`public/`)은 번호 없이 찍은 뒤 텍스트 레이어에 번호가 없는지 다시 검사한다.
// (PDF 를 사후 편집해 글자를 지우는 건 텍스트 레이어가 남아 안전하지 않다.)
//
// 실행:  npm run resume:pdf              → public/jeong-jaehoon-resume.pdf (번호 없음)
//        npm run resume:pdf -- --private → resume/jaehoon-jeong-resume.pdf (번호 있음) 도 함께
//        npm run resume:pdf -- --html    → PDF 는 안 찍고 .tmp/resume-print/*.html 만 만든다

import {mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = new Set(process.argv.slice(2));
const PRIVATE = args.has("--private");
const HTML_ONLY = args.has("--html");

const OUT_PUBLIC = join(root, "public/jeong-jaehoon-resume.pdf");
const OUT_PRIVATE = join(root, "resume/jaehoon-jeong-resume.pdf");
const SRC_MD = join(root, "resume/jaehoon-jeong-resume.md");
const TMP_DIR = join(root, ".tmp/resume-print");

// ── 데이터 ───────────────────────────────────────────────────────────────────
// `@/data/resume` 는 ts-loader 가 풀어 준다. 없이 실행하면 여기서 죽으므로
// 메시지를 남긴다.
let data;
try {
  data = await import("../src/data/resume.ts");
} catch (e) {
  console.error(
    "resume.ts 를 불러오지 못했습니다. `npm run resume:pdf` 로 실행하세요 " +
      "(--experimental-strip-types + scripts/lib/ts-loader.mjs 가 필요합니다).\n" +
      String(e)
  );
  process.exit(1);
}
const {
  hero,
  printSummary,
  skillDetails,
  githubEvidence,
  education,
  careers,
  mainProjects,
  devRecords,
  contact
} = data;

// ── 유틸 ─────────────────────────────────────────────────────────────────────
const esc = s =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const bare = href => href.replace(/^https?:\/\//, "").replace(/\/$/, "");
const isExternal = href => /^https?:\/\//.test(href);
const join_ = (xs, sep = " · ") => xs.filter(Boolean).join(sep);

/** 학력은 같은 기관·같은 기간이면 한 줄로 묶는다(아주대 전공 셋). */
function groupEducation(items) {
  const out = [];
  for (const e of items) {
    const prev = out[out.length - 1];
    if (prev && prev.org === e.org && prev.period === e.period)
      prev.programs.push(e.program);
    else out.push({org: e.org, period: e.period, programs: [e.program]});
  }
  return out;
}

// ── 조각 ─────────────────────────────────────────────────────────────────────

function renderContact(phone) {
  const rows = [
    ["Email", esc(contact.email), `mailto:${contact.email}`],
    phone ? ["Phone", esc(phone), `tel:${phone}`] : null,
    ["GitHub", esc(bare(contact.github)), contact.github],
    [
      "Portfolio",
      "toadsam.github.io/myPortfolio",
      "https://toadsam.github.io/myPortfolio/"
    ]
  ].filter(Boolean);
  return `<dl class="contact">
${rows
  .map(
    ([k, v, href]) =>
      `  <div><dt>${k}</dt><dd><a href="${esc(href)}">${v}</a></dd></div>`
  )
  .join("\n")}
</dl>`;
}

function renderHeader(phone) {
  // 헤드라인 마지막 줄이 "개발자 정재훈" 으로 끝난다 — h1 바로 아래라 이름이
  // 두 번 보이므로 끝의 이름만 뗀다.
  const headline = hero.headlineLines
    .join(" ")
    .replace(new RegExp(`\\s*${hero.name}$`), "");
  return `<header class="head">
  <div class="head-main">
    <p class="head-role">${esc(hero.roleTag)}</p>
    <h1>${esc(hero.name)}</h1>
    <p class="head-line">${esc(headline)}</p>
    <dl class="head-facts">
      <div><dt>지원 직무</dt><dd>${esc(hero.target)}</dd></div>
      <div><dt>가능 시점</dt><dd>${esc(hero.availability)}</dd></div>
    </dl>
  </div>
  ${renderContact(phone)}
</header>`;
}

function renderSummary() {
  return `<section class="sec">
  <h2>요약</h2>
  <p class="lead">${esc(printSummary.lead)}</p>
  <ul class="points">
${printSummary.points
  .map(p => `    <li><b>${esc(p.head)}</b> ${esc(p.body)}</li>`)
  .join("\n")}
  </ul>
</section>`;
}

function renderMetrics(p) {
  const ms = (p.metrics ?? []).filter(m => m.value);
  if (!ms.length) return "";
  const cells = ms
    .map(
      m =>
        `<span><b>${esc(m.value)}</b> ${esc(m.label)}${
          m.provisional ? ' <i class="prov">잠정</i>' : ""
        }</span>`
    )
    .join("");
  const src = p.metricsSource
    ? `<span class="src">${esc(p.metricsSource)}</span>`
    : "";
  return `<p class="metrics">${cells}${src}</p>`;
}

function renderProject(p) {
  const links = p.links.filter(l => l.href && isExternal(l.href));
  const hasHl = (p.highlights ?? []).length > 0;
  // 성과 줄이 "무엇을 했나"를 말하므로 그때는 role 을 겹쳐 적지 않는다.
  const meta = join_([p.period, p.team, hasHl ? "" : p.role]);
  const hl = hasHl
    ? `<ul class="hl">${p.highlights
        .map(h => `<li>${esc(h)}</li>`)
        .join("")}</ul>`
    : "";
  return `<article class="proj">
  <div class="proj-head">
    <h3>${esc(p.printTitle ?? p.title)}</h3>
    <span class="tags">${esc(p.tags.join(" · "))}</span>
  </div>
  ${meta ? `<p class="meta">${esc(meta)}</p>` : ""}
  <p class="sub">${esc(p.subtitle)}</p>
  ${hl}
  ${renderMetrics(p)}
  ${
    links.length
      ? `<p class="links">${links
          .map(
            l =>
              `<span><b>${esc(l.label)}</b> <a href="${esc(l.href)}">${esc(
                bare(l.href)
              )}</a></span>`
          )
          .join("")}</p>`
      : ""
  }
</article>`;
}

function renderProjects() {
  const featured = mainProjects.filter(p => p.featured);
  return `<section class="sec">
  <h2>주요 프로젝트</h2>
${featured.map(renderProject).join("\n")}
</section>`;
}

function renderOtherProjects() {
  const rest = mainProjects.filter(p => !p.featured);
  const rows = rest.map(p => {
    const gh =
      p.links.find(l => /github\.com/.test(l.href)) ??
      p.links.find(l => isExternal(l.href) && bare(l.href).length <= 48);
    return `    <li>
      <div class="row-head"><b>${esc(
        p.printTitle ?? p.title
      )}</b><span class="when">${esc(join_([p.period, p.team]))}</span></div>
      <div class="row-body">${esc(p.subtitle)}${
      gh
        ? ` <a class="tail" href="${esc(gh.href)}">${esc(bare(gh.href))}</a>`
        : ""
    }</div>
    </li>`;
  });
  // 소품(`subProjects`)은 싣지 않는다 — 2쪽 예산 밖이고 화면 원페이저에 있다.
  return `<section class="sec">
  <h2>그 밖의 프로젝트</h2>
  <ul class="rows">
${rows.join("\n")}
  </ul>
</section>`;
}

function renderSkills() {
  return `<section class="sec">
  <h2>기술 스택</h2>
  <table class="skills">
${skillDetails
  .map(
    s =>
      `    <tr><th>${esc(s.area)}</th><td>${esc(s.stack.join(", "))}</td></tr>`
  )
  .join("\n")}
  </table>
  <p class="gh">공개 저장소 ${githubEvidence.repoCount}개 (${esc(
    githubEvidence.languages.join(", ")
  )})${
    devRecords[0]?.href
      ? ` · 알고리즘 풀이 기록 <a href="${esc(devRecords[0].href)}">${esc(
          bare(devRecords[0].href)
        )}</a>`
      : ""
  }</p>
</section>`;
}

function renderEducation() {
  const rows = groupEducation(education).map(
    e => `    <li>
      <span class="when">${esc(e.period)}</span>
      <div><b>${esc(e.org)}</b> ${esc(e.programs.join(" · "))}</div>
    </li>`
  );
  return `<section class="sec">
  <h2>학력 · 교육</h2>
  <ul class="tl">
${rows.join("\n")}
  </ul>
</section>`;
}

function renderCareers() {
  const rows = careers.map(
    c => `    <li>
      <span class="when">${esc(c.period)}</span>
      <div><b>${esc(c.org)}</b> ${esc(c.role)}${
      c.ledTo ? ` <i class="led">↳ ${esc(c.ledTo)}</i>` : ""
    }</div>
    </li>`
  );
  return `<section class="sec">
  <h2>활동</h2>
  <ul class="tl">
${rows.join("\n")}
  </ul>
</section>`;
}

// ── 문서 ─────────────────────────────────────────────────────────────────────

const CSS = `
:root {
  --ink: #111827;
  --body: #2b3648;
  --muted: #6b7280;
  --faint: #9aa3b2;
  --line: #d9dee6;
  --navy: #16324f;
  --wash: #f3f6fa;
}
@page { size: A4; margin: 12mm 14mm 13mm; }
* { box-sizing: border-box; }
html { font-size: 9.2pt; }
body {
  margin: 0;
  color: var(--ink);
  font-family: "Pretendard", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  line-height: 1.4;
  word-break: keep-all;
  overflow-wrap: anywhere;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
a { color: inherit; text-decoration: none; }
b { font-weight: 700; }

/* 머리 */
.head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0 28px;
  align-items: end;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--navy);
}
.head-role { margin: 0 0 2px; color: var(--navy); font-size: 9.5pt; font-weight: 700; letter-spacing: 0.02em; }
h1 { margin: 0; font-size: 24pt; line-height: 1.1; color: var(--navy); letter-spacing: -0.01em; }
.head-line { margin: 5px 0 0; font-size: 10.5pt; color: var(--body); }
.head-facts { margin: 6px 0 0; font-size: 8.8pt; color: var(--body); }
.head-facts div { display: grid; grid-template-columns: 52px 1fr; gap: 6px; line-height: 1.55; }
.head-facts dt { color: var(--muted); font-weight: 600; }
.head-facts dd { margin: 0; }
.contact { margin: 0; font-size: 9pt; }
.contact div { display: grid; grid-template-columns: 58px 1fr; gap: 6px; line-height: 1.65; }
.contact dt { color: var(--muted); font-weight: 600; }
.contact dd { margin: 0; color: var(--ink); }

/* 절 */
.sec { margin-top: 9px; break-inside: auto; }
h2 {
  margin: 0 0 5px;
  padding-bottom: 3px;
  border-bottom: 1px solid var(--line);
  color: var(--navy);
  font-size: 10.5pt;
  font-weight: 800;
  letter-spacing: 0.04em;
  break-after: avoid;
}
.lead { margin: 0 0 5px; color: var(--body); }
.points { margin: 0; padding-left: 14px; }
.points li { margin: 1px 0; color: var(--body); }
.points b { color: var(--ink); }

/* 프로젝트 */
/* 카드를 통째로 안 나누면(break-inside: avoid) 앞쪽 끝에 카드 하나 크기의 빈칸이
   남는다. 제목·메타·부제는 붙여 두고, 성과 줄 사이에서는 나뉘게 둔다. */
.proj { padding: 5px 0 6px; border-top: 1px dashed var(--line); orphans: 2; widows: 2; }
.proj-head, .meta, .sub { break-after: avoid; }
.hl li { break-inside: avoid; }
.proj:first-of-type { border-top: 0; padding-top: 2px; }
.proj-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.proj h3 { margin: 0; font-size: 11pt; font-weight: 800; color: var(--ink); }
.tags { color: var(--muted); font-size: 8.5pt; white-space: nowrap; }
.meta { margin: 1px 0 0; color: var(--muted); font-size: 8.8pt; }
.sub { margin: 3px 0 0; color: var(--body); font-weight: 600; }
.hl { margin: 3px 0 0; padding-left: 14px; color: var(--body); }
.hl li { margin: 1px 0; }
.metrics { margin: 4px 0 0; display: flex; flex-wrap: wrap; gap: 3px 14px; font-size: 9pt; color: var(--body); align-items: baseline; }
.metrics b { color: var(--navy); font-size: 10pt; margin-right: 3px; }
.metrics .src { color: var(--faint); font-size: 8pt; }
.metrics .prov { color: #a15c07; font-style: normal; font-size: 7.5pt; }
.links { margin: 3px 0 0; display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: 8.5pt; color: var(--muted); }
.links b { font-weight: 600; margin-right: 3px; }
.links a { color: var(--body); }

/* 한 줄 목록 */
.rows { margin: 0; padding: 0; list-style: none; }
.rows li { padding: 2px 0; line-height: 1.35; border-top: 1px dashed var(--line); break-inside: avoid; }
.rows li:first-child { border-top: 0; }
.row-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
.row-head .when { color: var(--muted); font-size: 8.5pt; white-space: nowrap; }
.row-body { color: var(--body); font-size: 8.9pt; }
.row-body .role { color: var(--muted); }
.row-body .tail { color: var(--faint); font-size: 8.3pt; margin-left: 4px; }

/* 기술 */
.skills { border-collapse: collapse; width: 100%; font-size: 9.2pt; }
.skills tr { break-inside: avoid; }
.skills th { text-align: left; vertical-align: top; width: 92px; padding: 1px 8px 1px 0; color: var(--navy); font-weight: 700; white-space: nowrap; }
.skills td { padding: 1px 0; color: var(--body); }
.skills .desc { color: var(--muted); font-size: 8.3pt; }
.gh { margin: 6px 0 0; color: var(--muted); font-size: 8.5pt; }
.gh a { color: var(--body); }

/* 학력·활동 */
.two { display: grid; grid-template-columns: minmax(0, 9fr) minmax(0, 11fr); gap: 0 20px; }
.tl { margin: 0; padding: 0; list-style: none; }
.tl li { display: grid; grid-template-columns: max-content 1fr; gap: 8px; padding: 1px 0; line-height: 1.32; font-size: 8.9pt; color: var(--body); break-inside: avoid; }
.tl .when { color: var(--muted); font-size: 8.3pt; padding-top: 1px; white-space: nowrap; }
.tl b { color: var(--ink); }
.tl .led { color: var(--navy); font-style: normal; font-size: 8.3pt; }

/* 화면 미리보기용 — 인쇄엔 무관 */
@media screen {
  html { background: #e9edf2; }
  body { max-width: 210mm; margin: 24px auto; padding: 13mm 14mm; background: #fff; box-shadow: 0 12px 40px rgba(0,0,0,.12); min-height: 297mm; }
}
`;

function renderDocument({phone} = {}) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>${esc(hero.name)} 이력서 — ${esc(hero.roleTag)}</title>
<style>${CSS}</style>
</head>
<body>
${renderHeader(phone)}
${renderSummary()}
${renderProjects()}
${renderOtherProjects()}
${renderSkills()}
<div class="two">
${renderEducation()}
${renderCareers()}
</div>
</body>
</html>
`;
}

// ── 실행 ─────────────────────────────────────────────────────────────────────

async function readPhone() {
  const md = await readFile(SRC_MD, "utf8");
  const m = md.match(/^Phone:\s*([0-9-]+)/m);
  if (!m) {
    console.error("원본 md 에서 Phone: 줄을 찾지 못했습니다.");
    process.exit(1);
  }
  return m[1];
}

async function printPdf(browser, html, out) {
  const page = await browser.newPage();
  await page.setContent(html, {waitUntil: "networkidle"});
  await page.emulateMedia({media: "print"});
  await page.pdf({
    path: out,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    // 2쪽부터 누구 이력서인지 알 수 있어야 한다 — 낱장으로 돌 때를 위해.
    footerTemplate: `<div style="width:100%;padding:0 15mm;display:flex;justify-content:space-between;font-family:'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;font-size:7.5pt;color:#9aa3b2;">
      <span>${esc(hero.name)} · ${esc(hero.roleTag)}</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`
  });
  await page.close();
}

await mkdir(TMP_DIR, {recursive: true});

const publicHtml = renderDocument();
if (/6428-6247|tel:/.test(publicHtml)) {
  console.error("공개본 HTML 에 전화번호가 들어 있습니다. 중단합니다.");
  process.exit(1);
}
const publicHtmlPath = join(TMP_DIR, "public.html");
await writeFile(publicHtmlPath, publicHtml, "utf8");
console.log(`HTML: ${publicHtmlPath}`);

let privateHtml = null;
if (PRIVATE) {
  privateHtml = renderDocument({phone: await readPhone()});
  await writeFile(join(TMP_DIR, "private.html"), privateHtml, "utf8");
}

if (HTML_ONLY) {
  console.log(`미리보기: ${pathToFileURL(publicHtmlPath).href}`);
  process.exit(0);
}

const {launchChromium} = await import("./e2e/lib.mjs");
const browser = await launchChromium();
try {
  await printPdf(browser, publicHtml, OUT_PUBLIC);
  console.log(`생성: public/jeong-jaehoon-resume.pdf`);
  if (privateHtml) {
    await printPdf(browser, privateHtml, OUT_PRIVATE);
    console.log(`생성: resume/jaehoon-jeong-resume.pdf (전화번호 포함)`);
  }
} finally {
  await browser.close();
}
