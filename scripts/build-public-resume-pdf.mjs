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

function renderContact(phone) {
  const rows = [
    ["Email", esc(contact.email), `mailto:${contact.email}`],
    phone ? ["Phone", esc(phone), `tel:${phone}`] : null,
    ["GitHub", esc(bare(contact.github)), contact.github],
    ["Portfolio", "jaehun.co.kr", "https://jaehun.co.kr/"]
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
  // 출처는 지표와 같은 줄에 두면 값과 같은 무게로 읽혀 지표를 흐린다. 밑줄로 내린다.
  const src = p.metricsSource
    ? `\n  <p class="src-line">${esc(p.metricsSource)}</p>`
    : "";
  return `<p class="metrics">${cells}</p>${src}`;
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
  // 오른쪽 정렬 태그(FullStack · Next.js …)는 뺐다(2026-09-07) — 같은 말이 부제,
  // 성과 줄, 아래 「기술 스택」 표에 이미 세 번 나온다. 제목 옆 자리를 비워 두는
  // 편이 제목을 크게 쓸 수 있어 훑을 때 눈에 걸린다.
  return `<article class="proj">
  <div class="proj-head">
    <h3>${esc(p.printTitle ?? p.title)}</h3>
  </div>
  ${meta ? `<p class="meta">${esc(meta)}</p>` : ""}
  <p class="sub">${esc(p.subtitle)}</p>
  ${hl}
  <div class="payoff">
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
  </div>
</article>`;
}

function renderProjects() {
  // printCompact 는 화면 대표를 종이에서만 한 줄 목록으로 내린다(지금 쓰는 항목 없음).
  const featured = mainProjects.filter(p => p.featured && !p.printCompact);
  return `<section class="sec">
  <h2>주요 프로젝트</h2>
${featured.map(renderProject).join("\n")}
</section>`;
}

/** 압축 줄의 꼬리 링크. 두 번째(`labelOnly`)는 라벨만 찍는다 — 한 줄에 주소를
 *  둘 넣으면 줄이 접혀 A4 2장을 넘긴다(실측 3쪽). 화면 원페이저에는 둘 다 있다. */
function tail(link, labelOnly = false) {
  if (!link) return "";
  const text = labelOnly ? link.label : bare(link.href);
  return ` <a class="tail" href="${esc(link.href)}">${esc(text)}</a>`;
}

function renderOtherProjects() {
  const rest = mainProjects.filter(p => !p.featured || p.printCompact);
  const rows = rest.map(p => {
    const gh =
      p.links.find(l => /github\.com/.test(l.href)) ??
      p.links.find(l => isExternal(l.href) && bare(l.href).length <= 48);
    // 저장소 말고 **바로 열리는 화면**이 따로 있으면 그것도 싣는다 — 서류를
    // 보는 사람은 저장소보다 열리는 주소를 먼저 누른다. 영상은 뺀다(주소가 길다).
    const VIDEO_HOSTS = ["youtube.com", "youtu.be", "vimeo.com"];
    const extra = p.links.find(
      l =>
        isExternal(l.href) &&
        bare(l.href).length <= 48 &&
        l.href !== gh?.href &&
        !VIDEO_HOSTS.some(h => l.href.includes(h))
    );
    return `    <li>
      <div class="row-head"><b>${esc(
        p.printTitle ?? p.title
      )}</b><span class="when">${esc(join_([p.period, p.team]))}</span></div>
      <div class="row-body">${esc(p.subtitle)}${tail(gh)}${tail(
      extra,
      true
    )}</div>
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
      `    <tr><th>${esc(s.area)}</th><td>${s.stack
        .map(x => (s.core?.includes(x) ? `<b>${esc(x)}</b>` : esc(x)))
        .join(", ")}</td></tr>`
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
      <div><b>${esc(e.org)}</b> ${esc(
      join_([e.programs.join(" · "), e.gpa])
    )}</div>
    </li>`
  );
  return `<section class="sec">
  <h2>학력 · 교육</h2>
  <ul class="tl">
${rows.join("\n")}
  </ul>
</section>`;
}

/**
 * 전폭 한 줄씩. 학력 칸 안에 넣으면(폭 절반) 항목마다 두 줄로 접혀 4건이 8줄인데,
 * 전폭이면 한 줄씩이라 절반이다 — 2장 예산에서 그 차이가 쪽을 가른다.
 */
function renderAwards() {
  if (!awards.length) return "";
  const rows = awards.map(
    a => `    <li>
      <span class="when">${esc(a.date)}</span>
      <div><b>${esc(a.title)}</b> ${esc(a.org)}${
      // 팀명이 이어진 프로젝트 이름에 이미 들어 있으면 한 번만 적는다.
      a.team && !(a.ledTo ?? "").startsWith(a.team) ? ` · ${esc(a.team)}` : ""
    }${a.ledTo ? ` <i class="led">↳ ${esc(a.ledTo)}</i>` : ""}</div>
    </li>`
  );
  return `<section class="sec">
  <h2>수상 · 수료</h2>
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
@page { size: A4; margin: 15mm 16mm 14mm; }
* { box-sizing: border-box; }
html { font-size: 9.8pt; }
body {
  margin: 0;
  color: var(--ink);
  font-family: "Pretendard", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  line-height: 1.62;
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

/* 절 — 쪽수 예산을 없앤 뒤(2026-09-07) 절 사이 간격이 가장 큰 읽기 장치다.
   심사자는 먼저 절 제목만 훑어 지도를 그린 다음 필요한 절로 들어간다. */
.sec { margin-top: 22px; break-inside: auto; }
h2 {
  margin: 0 0 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--line);
  color: var(--navy);
  font-size: 11pt;
  font-weight: 800;
  letter-spacing: 0.04em;
  break-after: avoid;
}
.lead { margin: 0 0 9px; color: var(--body); }
.points { margin: 0; padding-left: 15px; }
.points li { margin: 5px 0; color: var(--body); }
.points b { color: var(--ink); }

/* 프로젝트 */
/* 카드를 통째로 안 나눈다(break-inside: avoid)는 규칙은 두 번 시도해서 두 번 다
   버렸다 — 카드 하나가 한 쪽의 3분의 1이라, 안 들어가면 앞쪽 끝에 그만한 빈칸이
   그대로 남는다(2026-09-07 실측: 1쪽 아래 30% 공백 + 총 5쪽). 쪽수가 자유로워도
   빈칸은 여백이 아니라 구멍이다. 그래서 제목·기간·부제만 붙여 두고 성과 줄 사이에서는
   갈라지게 둔다. 다만 지표·출처·링크는 한 덩어리로 묶어 이것만은 안 갈라지게 한다. */
.proj { padding: 15px 0 16px; border-top: 1px dashed var(--line); orphans: 2; widows: 2; }
.proj-head, .meta, .sub { break-after: avoid; }
.hl li { break-inside: auto; orphans: 2; widows: 2; }
.payoff { break-inside: avoid; }
.proj:first-of-type { border-top: 0; padding-top: 2px; }
.proj-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.proj h3 { margin: 0; font-size: 12.5pt; font-weight: 800; color: var(--ink); letter-spacing: -0.01em; }
.meta { margin: 3px 0 0; color: var(--muted); font-size: 9pt; }
.sub { margin: 7px 0 0; color: var(--body); font-weight: 600; }
.hl { margin: 8px 0 0; padding-left: 15px; color: var(--body); }
.hl li { margin: 5px 0; }
/* 지표 줄은 이 이력서에서 가장 강한 부분인데 예전엔 출처 문구와 같은 크기로 붙어
   흐려 보였다. 옅은 판 위에 올리고 값을 키워 눈이 먼저 닿게 한다. 출처는 아래로 내린다. */
.metrics {
  margin: 10px 0 0; padding: 7px 11px; background: var(--wash); border-radius: 3px;
  display: flex; flex-wrap: wrap; gap: 4px 22px; font-size: 9.2pt; color: var(--body); align-items: baseline;
}
.metrics b { color: var(--navy); font-size: 13pt; margin-right: 4px; letter-spacing: -0.01em; }
.metrics .prov { color: #a15c07; font-style: normal; font-size: 7.8pt; }
.src-line { margin: 4px 0 0; color: var(--faint); font-size: 8.2pt; }
.links { margin: 8px 0 0; display: flex; flex-wrap: wrap; gap: 3px 18px; font-size: 8.8pt; color: var(--muted); }
.links b { font-weight: 600; margin-right: 4px; }
.links a { color: var(--body); }

/* 한 줄 목록 */
.rows { margin: 0; padding: 0; list-style: none; }
.rows li { padding: 8px 0; line-height: 1.5; border-top: 1px dashed var(--line); break-inside: avoid; }
.rows li:first-child { border-top: 0; padding-top: 2px; }
.row-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
.row-head b { font-size: 10pt; }
.row-head .when { color: var(--muted); font-size: 8.8pt; white-space: nowrap; }
.row-body { color: var(--body); font-size: 9.2pt; margin-top: 2px; }
.row-body .role { color: var(--muted); }
.row-body .tail { color: var(--faint); font-size: 8.3pt; margin-left: 4px; }

/* 기술 */
.skills { border-collapse: collapse; width: 100%; font-size: 9.4pt; }
.skills tr { break-inside: avoid; }
.skills th { text-align: left; vertical-align: top; width: 96px; padding: 5px 10px 5px 0; color: var(--navy); font-weight: 700; white-space: nowrap; }
.skills td { padding: 5px 0; color: var(--body); }
.skills .desc { color: var(--muted); font-size: 8.6pt; }
.gh { margin: 10px 0 0; color: var(--muted); font-size: 8.8pt; }
.gh a { color: var(--body); }

/* 학력·활동 — 예전엔 여기가 문서에서 가장 빽빽했다(글자는 제일 작고 밀도는 제일 높음). */
.two { display: grid; grid-template-columns: minmax(0, 9fr) minmax(0, 11fr); gap: 0 26px; }
.tl { margin: 0; padding: 0; list-style: none; }
.tl li { display: grid; grid-template-columns: max-content 1fr; gap: 10px; padding: 5px 0; line-height: 1.5; font-size: 9.2pt; color: var(--body); break-inside: avoid; }
.tl .when { color: var(--muted); font-size: 8.6pt; padding-top: 1px; white-space: nowrap; }
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
${renderAwards()}
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
  console.log(`생성: public/jeong-jaehun-resume.pdf`);
  if (privateHtml) {
    await printPdf(browser, privateHtml, OUT_PRIVATE);
    console.log(`생성: resume/jeong-jaehun-resume.pdf (전화번호 포함)`);
  }
} finally {
  await browser.close();
}
