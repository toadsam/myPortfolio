// 이력서 PDF 생성 — `src/data/resume.ts` 를 그대로 읽어 A4 인쇄용 HTML 을 만들고 찍는다.
//
// ── 왜 데이터에서 만드나 ─────────────────────────────────────────────────────
// 예전에는 `resume/jeong-jaehun-resume.html` 이라는 손으로 쓴 웹페이지(1060px,
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
// 실행:  npm run resume:pdf              → public/jeong-jaehun-resume.pdf (번호 없음)
//        npm run resume:pdf -- --private → resume/jeong-jaehun-resume.pdf (번호 있음) 도 함께
//        npm run resume:pdf -- --html    → PDF 는 안 찍고 .tmp/resume-print/*.html 만 만든다

import {mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = new Set(process.argv.slice(2));
const PRIVATE = args.has("--private");
const HTML_ONLY = args.has("--html");

const OUT_PUBLIC = join(root, "public/jeong-jaehun-resume.pdf");
const OUT_PRIVATE = join(root, "resume/jeong-jaehun-resume.pdf");
const SRC_MD = join(root, "resume/jeong-jaehun-resume.md");
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
  awards,
  certifications,
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

/**
 * 기간 줄 꼬리. 화면은 상태 뱃지와 리뉴얼 칩이 말하지만 종이에는 둘 다 없다.
 * "운영 중" 은 period 가 이미 "진행 중" 으로 끝나면 겹치므로 생략한다.
 */
const stateTail = p =>
  join_([
    p.status === "운영중" && !(p.period ?? "").includes("진행 중")
      ? "운영 중"
      : "",
    p.renewal ? "리뉴얼 예정" : ""
  ]);

/** 학력은 같은 기관·같은 기간이면 한 줄로 묶는다(아주대 전공 셋). */
function groupEducation(items) {
  const out = [];
  for (const e of items) {
    const prev = out[out.length - 1];
    if (prev && prev.org === e.org && prev.period === e.period) {
      prev.programs.push(e.program);
      if (e.gpa && !prev.gpa) prev.gpa = e.gpa;
    } else {
      out.push({
        org: e.org,
        period: e.period,
        programs: [e.program],
        gpa: e.gpa
      });
    }
  }
  return out;
}

// ── 조각 ─────────────────────────────────────────────────────────────────────
//
// 2026-09-08 양식 교체. 예전 틀(절 제목 + 밑줄 + 본문)은 구분이 약하고 빽빽했다.
// 지금은 F-Lab 공개 이력서의 틀 — **왼쪽 라벨 열 + 오른쪽 키-값 행, 절마다 두 열
// 모두 위에 굵은 가로줄, 여백 넉넉, 완전 흑백** — 을 따른다. 쪽수는 결과이지
// 목표가 아니다(본인 결정). 문장·숫자·링크는 예전 PDF 와 같은 집합이다.

const isAcademic = program =>
  /\((전공|복수전공|부전공|마이크로전공)\)/.test(program);

/** 라벨 열 한 절. `keep` 이면 쪽 경계에서 통째로 안 갈라진다(짧은 절만). */
function row(label, body, {keep = true} = {}) {
  return `<section class="row${keep ? " keep" : ""}">
  <h2>${esc(label)}</h2>
  <div class="cell">
${body}
  </div>
</section>`;
}

/** 키-값 행 묶음. 값이 빈 행은 그리지 않는다. `raw` 는 이미 HTML 인 값. */
function kv(pairs, cls = "kv") {
  const rows = pairs
    .filter(([, v]) => v)
    .map(
      ([k, v, raw]) =>
        `    <div><dt>${esc(k)}</dt><dd>${raw ? v : esc(v)}</dd></div>`
    );
  return `<dl class="${cls}">\n${rows.join("\n")}\n  </dl>`;
}

const link = (href, text) =>
  `<a href="${esc(href)}">${esc(text ?? bare(href))}</a>`;

function renderTitle() {
  // 헤드라인 마지막 줄이 "개발자 정재훈" 으로 끝난다 — 바로 위가 이름이라 끝의
  // 이름만 뗀다.
  const headline = hero.headlineLines
    .join(" ")
    .replace(new RegExp(`\\s*${hero.name}$`), "");
  return `<header class="title">
  <p class="title-kicker">이력서:</p>
  <h1>${esc(hero.name)}</h1>
  <p class="title-role">${esc(hero.roleTag)}</p>
  <p class="title-line">${esc(headline)}</p>
</header>`;
}

function renderProfile(phone) {
  return row(
    "인적사항",
    kv([
      ["성명", hero.name],
      ["E-mail", link(`mailto:${contact.email}`, contact.email), true],
      phone
        ? ["휴대전화", link(`tel:${phone}`, phone), true]
        : ["휴대전화", ""],
      ["GitHub", link(contact.github), true],
      ["Portfolio", link("https://jaehun.co.kr/", "jaehun.co.kr"), true],
      ["지원 직무", hero.target],
      ["가능 시점", hero.availability]
    ])
  );
}

function renderSummary() {
  const points = printSummary.points
    .map(
      p =>
        `    <div class="pt"><b>${esc(p.head)}</b><p>${esc(p.body)}</p></div>`
    )
    .join("\n");
  return row(
    "요약",
    `    <p class="lead">${esc(printSummary.lead)}</p>\n${points}`,
    {keep: false}
  );
}

function renderCertifications() {
  if (!certifications.length) return "";
  // 기관과 등급은 둘 다 "이 자격이 얼마나 무거운가"를 말하므로 한 줄에 둔다.
  const body = certifications
    .map(
      c => `    <div class="item">
${kv([
  ["취득", c.date],
  ["자격", c.name],
  ["발급", join_([c.org, c.grade])]
])}
    </div>`
    )
    .join("\n");
  return row("자격증", body);
}

const isService = c => c.role === "만기 전역";

function renderMilitary() {
  const m = careers.find(isService);
  if (!m) return "";
  return row(
    "병역",
    kv([
      ["기간", m.period],
      ["소속", m.org],
      ["구분", m.role]
    ])
  );
}

function renderEducation() {
  const groups = groupEducation(education);
  const uni = groups.filter(g => g.programs.some(isAcademic));
  const body = uni
    .map(
      g => `    <div class="item">
${kv([
  ["기간", g.period],
  ["학교", g.org],
  ["전공", g.programs.join(" · ")],
  ["학점", g.gpa]
])}
    </div>`
    )
    .join("\n");
  return row("학력사항", body);
}

function renderCourses() {
  const rest = education.filter(e => !isAcademic(e.program));
  if (!rest.length) return "";
  const body = rest
    .map(
      e => `    <div class="item">
${kv([
  ["기간", e.period],
  ["기관", e.org],
  ["과정", e.program]
])}
    </div>`
    )
    .join("\n");
  // 통째로 묶지 않는다 — 묶으면 앞 쪽 끝에 그만한 공백이 남는다(실측). 항목 단위로만.
  return row("교육", body, {keep: false});
}

function renderCareers() {
  const list = careers.filter(c => !isService(c));
  const body = list
    .map(
      c => `    <div class="item">
${kv([
  ["기간", c.period],
  ["소속", c.org],
  ["역할", c.role],
  ["이어진 프로젝트", c.ledTo ? `↳ ${c.ledTo}` : ""]
])}
    </div>`
    )
    .join("\n");
  // 항목이 여럿이라 절 통째로는 안 묶고(다음 쪽 앞이 비게 된다) 항목 단위로만 묶는다.
  return row("활동 내역", body, {keep: false});
}

function renderAwards() {
  if (!awards.length) return "";
  const body = awards
    .map(
      a => `    <div class="item">
${kv([
  ["일자", a.date],
  [a.kind, a.title],
  ["주최", a.org],
  // 팀명이 이어진 프로젝트 이름에 이미 들어 있으면 한 번만 적는다.
  ["팀", a.team && !(a.ledTo ?? "").startsWith(a.team) ? a.team : ""],
  ["이어진 프로젝트", a.ledTo ? `↳ ${a.ledTo}` : ""]
])}
    </div>`
    )
    .join("\n");
  return row("수상 · 수료", body, {keep: false});
}

function renderSkills() {
  const rows = skillDetails.map(
    s =>
      `    <div><dt>${esc(s.area)}</dt><dd>${s.stack
        .map(x => (s.core?.includes(x) ? `<b>${esc(x)}</b>` : esc(x)))
        .join(", ")}</dd></div>`
  );
  const gh = `    <p class="gh">공개 저장소 ${
    githubEvidence.repoCount
  }개 (${esc(githubEvidence.languages.join(", "))})${
    devRecords[0]?.href
      ? ` · 알고리즘 풀이 기록 ${link(devRecords[0].href)}`
      : ""
  }</p>`;
  // 통째로 묶었더니 3쪽 아래 40% 가 비고 이 절 하나가 4쪽을 혼자 썼다(실측). 행 단위로만.
  return row(
    "보유 기술",
    `<dl class="kv tech">\n${rows.join("\n")}\n  </dl>\n${gh}`,
    {keep: false}
  );
}

// ── 포트폴리오 ───────────────────────────────────────────────────────────────

function projectFacts(p, {withRole = true} = {}) {
  const links = p.links
    .filter(l => l.href && isExternal(l.href))
    .map(l => [l.label, link(l.href), true]);
  return kv(
    [
      ["기간", p.period],
      ["팀", p.team],
      withRole ? ["담당", p.role] : ["담당", ""],
      ["상태", stateTail(p)],
      ...links
    ],
    "kv facts"
  );
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
    ? `\n  <p class="src">${esc(p.metricsSource)}</p>`
    : "";
  return `  <h4>성과</h4>
  <div class="metrics">${cells}</div>${src}`;
}

function renderProject(p) {
  // 성과 문단이 "무엇을 했나"를 말하므로 그때는 담당 줄을 겹쳐 적지 않는다.
  const hasHl = (p.highlights ?? []).length > 0;
  const hl = hasHl
    ? `  <h4>진행 내용</h4>\n${p.highlights
        .map(h => `  <p>${esc(h)}</p>`)
        .join("\n")}`
    : "";
  return `<article class="proj">
  <div class="proj-head">
    <h3>${esc(p.printTitle ?? p.title)}</h3>
${projectFacts(p, {withRole: !hasHl})}
  </div>
  <h4>프로젝트 개요</h4>
  <p>${esc(p.subtitle)}</p>
${hl}
${renderMetrics(p)}
</article>`;
}

function renderProjectCompact(p) {
  return `<article class="proj compact">
  <div class="proj-head">
    <h3>${esc(p.printTitle ?? p.title)}</h3>
${projectFacts(p)}
  </div>
  <p>${esc(p.subtitle)}</p>
</article>`;
}

function renderPortfolio() {
  // printCompact 는 화면 대표를 종이에서만 축약판으로 내린다(지금 쓰는 항목 없음).
  const featured = mainProjects.filter(p => p.featured && !p.printCompact);
  const rest = mainProjects.filter(p => !p.featured || p.printCompact);
  // 소품(`subProjects`)은 싣지 않는다 — 화면 원페이저에 있다.
  return `<section class="part">
  <h1 class="part-title">포트폴리오</h1>
${featured.map(renderProject).join("\n")}
  <h2 class="part-sub">그 밖의 프로젝트</h2>
${rest.map(renderProjectCompact).join("\n")}
</section>`;
}

// ── 문서 ─────────────────────────────────────────────────────────────────────

const CSS = `
:root {
  --ink: #111;
  --body: #333;
  --muted: #6b6b6b;
  --rule: #111;
  --hair: #cfcfcf;
}
@page { size: A4; margin: 20mm 18mm 18mm; }
* { box-sizing: border-box; }
html { font-size: 10.5pt; }
body {
  margin: 0;
  color: var(--ink);
  font-family: "Pretendard", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  line-height: 1.78;
  word-break: keep-all;
  overflow-wrap: anywhere;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
a { color: inherit; text-decoration: none; }
b { font-weight: 700; }
p { margin: 0; }

/* 제목 — F-Lab 첫 화면: "이력서:" 한 줄, 이름 한 줄 */
.title { margin: 4px 0 36px; }
.title-kicker { font-size: 22pt; font-weight: 800; line-height: 1.25; }
h1 { margin: 0 0 12px; font-size: 30pt; font-weight: 800; line-height: 1.2; letter-spacing: -0.01em; }
.title-role { color: var(--muted); font-size: 10pt; }
.title-line { margin-top: 4px; color: var(--body); }

/* 라벨 열 절 — 두 열 모두 위에 굵은 줄. 이 줄이 문서의 구분 장치 전부다. */
.row {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 0 26px;
  margin-top: 24px;
}
.row.keep { break-inside: avoid; }
.row h2 {
  margin: 0;
  padding-top: 10px;
  border-top: 2px solid var(--rule);
  font-size: 11pt;
  font-weight: 800;
  line-height: 1.6;
}
.row .cell { padding-top: 10px; border-top: 2px solid var(--rule); }

/* 키-값 행 */
.kv { margin: 0; }
.kv div { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 0 12px; }
.kv dt { color: var(--muted); font-size: 9.5pt; padding-top: 1px; }
.kv dd { margin: 0; }

/* 절 안의 항목 — 항목마다 얇은 회색 선. 절이 쪽을 넘어가도 이어짐이 읽힌다. */
.item { padding: 8px 0; border-top: 1px solid var(--hair); break-inside: avoid; }
.item:first-child { padding-top: 0; border-top: 0; }

/* 요약 */
.lead { margin-bottom: 12px; }
.pt { margin-top: 10px; break-inside: avoid; }
.pt b { display: block; }
.pt p { color: var(--body); }

/* 기술 */
.tech div { grid-template-columns: 110px minmax(0, 1fr); padding: 2px 0; break-inside: avoid; }
.tech dt { color: var(--ink); font-weight: 700; font-size: 10.5pt; padding-top: 0; }
.tech dd { color: var(--body); }
.gh { margin-top: 10px; color: var(--muted); font-size: 9.5pt; }

/* 포트폴리오 — 새 쪽 */
.part { break-before: page; }
.part-title { margin: 4px 0 34px; }
.part-sub { margin: 36px 0 0; padding-top: 11px; border-top: 2px solid var(--rule); font-size: 13pt; font-weight: 800; break-after: avoid; }
.proj { margin-top: 38px; }
.part-title + .proj { margin-top: 0; }
.part-sub + .proj { margin-top: 20px; }
/* 제목과 키-값 줄은 한 덩어리. 문단 사이에서는 갈라져도 된다 — 통째로 묶으면
   앞 쪽 끝에 그만한 구멍이 남는다(예전 틀에서 실측). */
.proj-head { break-inside: avoid; break-after: avoid; }
.proj h3 { margin: 0 0 8px; font-size: 14pt; font-weight: 800; line-height: 1.4; }
.proj h4 { margin: 20px 0 6px; font-size: 11pt; font-weight: 800; break-after: avoid; }
.proj p { margin-bottom: 10px; color: var(--body); orphans: 2; widows: 2; }
/* 링크 라벨("개편 PR (프론트 · 2026)")이 길어 키 칸을 넓힌다 — 96px 에서는 세 줄로 접혔다. */
.proj .facts div { grid-template-columns: 176px minmax(0, 1fr); }
.proj .facts dd a { color: var(--ink); }
.compact { margin-top: 26px; }
.compact h3 { font-size: 12pt; }
.compact .proj-head { margin-bottom: 8px; }

/* 성과 — 흑백이라 판 대신 위아래 얇은 선으로 묶는다. 값만 굵고 크다. */
.metrics {
  display: flex; flex-wrap: wrap; gap: 4px 30px; align-items: baseline;
  padding: 10px 0; border-top: 1px solid var(--hair); border-bottom: 1px solid var(--hair);
  color: var(--body); break-inside: avoid;
}
.metrics b { color: var(--ink); font-size: 12.5pt; margin-right: 5px; letter-spacing: -0.01em; }
.metrics .prov { color: var(--muted); font-style: normal; font-size: 8.5pt; }
.src { margin-top: 6px; color: var(--muted); font-size: 9pt; }

/* 화면 미리보기용 — 인쇄엔 무관 */
@media screen {
  html { background: #e9edf2; }
  body { max-width: 210mm; margin: 24px auto; padding: 14mm 14mm; background: #fff; box-shadow: 0 12px 40px rgba(0,0,0,.12); min-height: 297mm; }
  .part { margin-top: 60px; padding-top: 40px; border-top: 1px dashed #bbb; }
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
${renderTitle()}
${renderProfile(phone)}
${renderSummary()}
${renderCertifications()}
${renderMilitary()}
${renderEducation()}
${renderCourses()}
${renderCareers()}
${renderAwards()}
${renderSkills()}
${renderPortfolio()}
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
  console.log(`생성: public/jeong-jaehun-resume.pdf`);
  if (privateHtml) {
    await printPdf(browser, privateHtml, OUT_PRIVATE);
    console.log(`생성: resume/jeong-jaehun-resume.pdf (전화번호 포함)`);
  }
} finally {
  await browser.close();
}
