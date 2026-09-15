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

/**
 * 라벨 열 한 절. `keep` 이면 쪽 경계에서 통째로 안 갈라진다(짧은 절만).
 * `newPage` 는 이 절부터 새 쪽에서 시작한다 — 쪽 구성을 흐름에 맡기지 않고
 * 못박는 유일한 장치다(2026-09-12, 아래 `renderDocument` 주석).
 */
function row(label, body, {keep = true, newPage = false} = {}) {
  const cls = ["row", keep ? "keep" : "", newPage ? "newpage" : ""]
    .filter(Boolean)
    .join(" ");
  return `<section class="${cls}">
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

/**
 * 항목 한 줄. 굵은 제목 뒤에 부가 정보를 가운뎃점으로 잇는다.
 *
 * ── 왜 만들었나 (2026-09-12) ────────────────────────────────────────────────
 * 병역·학력·교육·활동·수상·자격증은 항목마다 `kv` 라벨 행을 3~5줄씩 썼다. 실측:
 * 활동 4건 15줄, 수상 4건 18줄, 교육 3건 9줄. 그런데 그 라벨들("기간" "소속"
 * "역할" "주최")은 **값만 봐도 무엇인지 아는 종류**다. 2021.12~2023.06 은 기간이
 * 아닐 수가 없다. 그래서 라벨 줄을 걷어내고 한 줄에 잇는다. 무슨 절인지는 왼쪽
 * `row` 제목이 계속 말해 주므로 잃는 정보가 없다. 이 셋이 45줄에서 12줄이 됐다.
 *
 * 프로젝트 본문(개요·진행 내용·성과)에는 쓰지 않는다 — 거기는 문장이 내용이다.
 *
 * `parts` 의 원소는 문자열이거나 `{h: "<a …>"}`(이미 만들어진 HTML)이다.
 */
function oneLine(head, parts) {
  const tail = parts
    .filter(Boolean)
    .map(p => (typeof p === "object" ? p.h : esc(p)))
    .join(" · ");
  return `    <p class="line"><b>${esc(head)}</b>${tail ? ` ${tail}` : ""}</p>`;
}

function renderTitle() {
  // 헤드라인 마지막 줄이 "개발자 정재훈" 으로 끝난다 — 바로 위가 이름이라 끝의
  // 이름만 뗀다.
  //
  // 2026-09-12 — F-Lab 양식의 "이력서:" 머리글(22pt)을 뺐다. 정보가 0인 한 줄이
  // 22pt 높이를 쓰고 있었고, 그 때문에 기술 표가 1쪽에서 2쪽으로 갈라졌다. 문서가
  // 이력서라는 건 파일명·내용·문맥이 이미 말한다.
  const headline = hero.headlineLines
    .join(" ")
    .replace(new RegExp(`\\s*${hero.name}$`), "");
  return `<header class="title">
  <h1>${esc(hero.name)}</h1>
  <p class="title-role">${esc(hero.roleTag)}</p>
  <p class="title-line">${esc(headline)}</p>
</header>`;
}

function renderProfile(phone) {
  // 2026-09-12 7행 → 3행. `성명` 을 지운 건 바로 위 제목이 30pt 로 같은 이름을
  // 말하고 있어서다. 연락 넷은 각각 한 행을 쓸 값이 아니라 한 묶음이라 한 행에
  // 모았다(두 줄로 감긴다). 전화번호는 `--private` 일 때만 들어온다.
  const contactLine = [
    link(`mailto:${contact.email}`, contact.email),
    phone ? link(`tel:${phone}`, phone) : "",
    link(contact.github),
    link("https://jaehun.co.kr/", "jaehun.co.kr")
  ]
    .filter(Boolean)
    .join(" · ");
  return row(
    "인적사항",
    kv([
      ["연락", contactLine, true],
      ["지원 직무", hero.target],
      ["가능 시점", hero.availability]
    ])
  );
}

function renderSummary() {
  // `printSummary.points` 는 2026-09-12 에 한 줄짜리 문자열 넷이 됐다(예전 구조는
  // {head, body} — resume.ts 주석 참고).
  const points = printSummary.points
    .map(p => `    <p class="line">${esc(p)}</p>`)
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
  // 자격 이름이 제목이다 — 취득일·기관·등급은 그 뒤에 잇는다(6줄 → 2줄).
  const body = certifications
    .map(c => oneLine(c.name, [c.date, c.org, c.grade]))
    .join("\n");
  return row("자격증", body);
}

const isService = c => c.role === "만기 전역";

function renderMilitary() {
  const m = careers.find(isService);
  if (!m) return "";
  return row("병역", oneLine(m.org, [m.period, m.role]));
}

function renderEducation() {
  const groups = groupEducation(education);
  const uni = groups.filter(g => g.programs.some(isAcademic));
  // 학점을 맨 뒤에 둔다 — 전공 셋 사이에 끼면 어느 전공의 학점인지로 읽힌다.
  const body = uni
    .map(g => oneLine(g.org, [g.period, g.programs.join(" · "), g.gpa]))
    .join("\n");
  return row("학력", body);
}

function renderCourses() {
  const rest = education.filter(e => !isAcademic(e.program));
  if (!rest.length) return "";
  const body = rest.map(e => oneLine(e.org, [e.program, e.period])).join("\n");
  return row("교육", body, {keep: false});
}

function renderCareers() {
  const list = careers.filter(c => !isService(c));
  const body = list
    .map(c => oneLine(c.org, [c.role, c.period, c.ledTo ? `↳ ${c.ledTo}` : ""]))
    .join("\n");
  // 강제 쪽 나눔은 쓰지 않는다 — 넣어 봤더니 1부가 4줄 넘쳐 2쪽이 그 4줄만 담고
  // 버려졌다(실측 7쪽·6쪽). 쪽 나눔을 못박는 것보다 1부를 1쪽 안에 맞추는 쪽이
  // 맞고, 남는 줄은 다음 쪽 머리에 이어지는 게 한 쪽을 버리는 것보다 낫다.
  return row("활동", body, {keep: false});
}

function renderAwards() {
  if (!awards.length) return "";
  // 날짜순으로 두면 첫 줄이 수료(2026.03.16 이 가장 최근)가 된다. 심사자가 이 절에서
  // 처음 읽는 줄이 가장 약한 항목이 되므로 수상 셋을 앞으로 모으고 수료를 뒤로 보낸다.
  // 안에서의 순서(날짜 내림차순)는 데이터 순서를 그대로 따른다.
  const sorted = [...awards].sort(
    (a, b) => Number(a.kind === "수료") - Number(b.kind === "수료")
  );
  const body = sorted
    .map(a =>
      oneLine(a.title, [
        a.date,
        a.org,
        // 팀명이 이어진 프로젝트 이름에 이미 들어 있으면 한 번만 적는다.
        a.team && !(a.ledTo ?? "").startsWith(a.team) ? a.team : "",
        a.ledTo ? `↳ ${a.ledTo}` : ""
      ])
    )
    .join("\n");
  return row("수상 · 수료", body, {keep: false});
}

/**
 * 종이에서만 여섯 행을 넷으로 합친다. 화면(`ResumeMode`)은 여섯 행 그대로다 —
 * 거기는 쪽 예산이 없고 행마다 설명(`desc`)이 붙어 제 몫을 한다.
 *
 * 합치는 기준은 "심사자가 한 묶음으로 읽는가" 다. Auth 는 Backend 가 하는 일의
 * 일부이고, Infra 와 Unity 는 성격이 달라도 둘 다 "주력 밖이지만 다룬다" 자리다.
 * 한 행이 2줄씩 감기므로 여섯 행 12줄이 넷 8줄이 된다.
 */
const PRINT_SKILL_GROUPS = [
  {label: "Frontend", areas: ["Frontend"]},
  {label: "Backend", areas: ["Backend", "Auth"]},
  {label: "AI / LLM", areas: ["AI / LLM"]},
  {label: "Infra · Unity", areas: ["Infra / Data", "Unity XR/AR"]}
];

function renderSkills() {
  const byArea = new Map(skillDetails.map(s => [s.area, s]));
  const grouped = new Set(PRINT_SKILL_GROUPS.flatMap(g => g.areas));
  // resume.ts 에 행이 새로 생기면 조용히 사라지지 않게 뒤에 그대로 붙인다.
  const groups = [
    ...PRINT_SKILL_GROUPS,
    ...skillDetails
      .filter(s => !grouped.has(s.area))
      .map(s => ({label: s.area, areas: [s.area]}))
  ];
  const rows = groups.map(g => {
    const items = g.areas.flatMap(a => byArea.get(a)?.stack ?? []);
    const core = g.areas.flatMap(a => byArea.get(a)?.core ?? []);
    const seen = new Set();
    const uniq = items.filter(x => !seen.has(x) && (seen.add(x), true));
    return `    <div><dt>${esc(g.label)}</dt><dd>${uniq
      .map(x => (core.includes(x) ? `<b>${esc(x)}</b>` : esc(x)))
      .join(", ")}</dd></div>`;
  });
  // 언어 목록(TypeScript, Java, …)은 뺐다 — 바로 위 네 행이 같은 언어를 이미
  // 말하고, 이 줄이 두 줄로 감기는 유일한 원인이었다.
  const gh = `    <p class="gh">공개 저장소 ${githubEvidence.repoCount}개${
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

/**
 * 링크 한 개의 표시 글자. 주소 자체가 정보인 것(사이트·저장소)은 주소를 보이고,
 * 나머지는 라벨을 보인다. PDF 에서는 어느 쪽이든 클릭되지만 **종이로 출력해 읽는
 * 심사자**가 있어서, 직접 타이핑할 값인 저장소 주소는 전문을 남긴다.
 */
const linkText = l => {
  // 조직 저장소 PR 은 이 이력서에서 가장 강한 협업 증거인데, 라벨("개편 PR (프론트
  // · 2026)")만 보이면 종이에서는 찾아갈 수 없다. 그렇다고 전체 주소를 적으면 링크
  // 줄이 세 줄이 된다(실측). GitHub 약식 표기로 적는다 — 짧고, 그대로 검색된다.
  const pr = l.href.match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
  if (pr) return `${pr[1]}#${pr[2]}`;
  return /^(GitHub|사이트|서비스 열기)/.test(l.label) ? bare(l.href) : l.label;
};

/**
 * 꼬리 프로젝트는 링크를 하나만 싣는다. 그 하나는 저장소여야 한다 — 데이터 순서로
 * 첫 번째를 집으면 아주대탐험·INTO MONSTER POINT 는 플레이 영상이 먼저라 저장소
 * 주소가 통째로 빠졌다(옛 PDF 와 대조해 발견). 개발 직무 심사자에게 영상보다 코드다.
 */
const preferRepo = links =>
  [...links].sort(
    (a, b) =>
      Number(!/github\.com/.test(a.href)) - Number(!/github\.com/.test(b.href))
  );

function projectFacts(p, {withRole = true} = {}) {
  // 2026-09-12 5~6행 → 2행. 라벨이 값마다 한 줄을 차지하는 게 문제였다. 총학생회
  // 웹은 링크 넷이 각각 한 줄이라 메타데이터만 6줄이었다(실측). 기간·팀·담당·상태는
  // 한 줄에 잇고, 링크는 전부 한 줄에 모은다. 여섯 건 합쳐 18줄이 줄어든다.
  const links = p.links
    .filter(l => l.href && isExternal(l.href))
    .map(l => link(l.href, linkText(l)))
    .join(" · ");
  return kv(
    [
      [
        "기간·팀",
        join_([p.period, p.team, withRole ? p.role : "", stateTail(p)])
      ],
      ["링크", links, true]
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
  // "프로젝트 개요" 제목은 뗐다 — 한 문장 위에 제목을 얹느라 제목 줄 + 위 여백
  // 20px 을 썼고, 그 문장은 제목 바로 아래라 무엇인지 이미 분명하다. 여섯 건에서
  // 10줄이 나온다(실측). "진행 내용"·"성과" 는 남긴다. 그 둘은 문단이 여러 개라
  // 어디서 무엇이 시작하는지 표시가 필요하다.
  return `<article class="proj">
  <div class="proj-head">
    <h3>${esc(p.printTitle ?? p.title)}</h3>
${projectFacts(p, {withRole: !hasHl})}
  </div>
  <p class="proj-lead">${esc(p.subtitle)}</p>
${hl}
${renderMetrics(p)}
</article>`;
}

/**
 * 꼬리 프로젝트 한 줄. 예전에는 대표와 같은 라벨 열을 써서 건당 6~7줄이었고,
 * 다섯 건이 1.2쪽을 먹었다(실측 · 8쪽 PDF 의 7쪽 말미~8쪽 전체). 설명은 한 줄인데
 * 기간·팀·담당·상태·링크 라벨이 여섯 줄이었다. 남기는 건 **무엇이고 무엇을 했고
 * 어디서 보나** 셋이다. 기간과 팀 구성은 이 자리에서 판단을 바꾸지 않는다.
 */
function renderProjectCompact(p) {
  const first = preferRepo(
    p.links.filter(l => l.href && isExternal(l.href))
  )[0];
  // 담당은 머리말만 남긴다. 데이터의 role 은 "게임 시스템 설계·구현 — 코어 루프 ·
  // 전투 AI · UI · 이벤트" 처럼 긴 열거가 붙어 있어서, 그대로 넣으면 한 줄짜리
  // 항목이 두 줄이 된다(다섯 건에서 5줄). 열거는 대표 항목이 할 일이다.
  const role = String(p.role ?? "").split(" — ")[0];
  return oneLine(p.printTitle ?? p.title, [
    p.subtitle,
    role,
    first ? {h: link(first.href, linkText(first))} : ""
  ]);
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
  <div class="others">
${rest.map(renderProjectCompact).join("\n")}
  </div>
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
  grid-template-columns: 118px minmax(0, 1fr);
  gap: 0 22px;
  margin-top: 20px;
}
.row.keep { break-inside: avoid; }
/* 쪽 구성을 못박는 유일한 장치 — renderDocument 주석 참고. */
.row.newpage { break-before: page; margin-top: 0; }
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
.kv div { display: grid; grid-template-columns: 82px minmax(0, 1fr); gap: 0 12px; }
.kv dt { color: var(--muted); font-size: 9.5pt; padding-top: 1px; }
.kv dd { margin: 0; }

/* 절 안의 항목 — 항목마다 얇은 회색 선. 절이 쪽을 넘어가도 이어짐이 읽힌다. */
.item { padding: 8px 0; border-top: 1px solid var(--hair); break-inside: avoid; }
.item:first-child { padding-top: 0; border-top: 0; }

/* 요약 */
.lead { margin-bottom: 10px; }

/* 한 줄 항목 — 굵은 제목 + 가운뎃점으로 이은 부가 정보(oneLine 헬퍼). 라벨 열을
   쓰지 않는다. 항목 사이 회색 선(.item)도 없다 — 한 줄짜리끼리는 선이 오히려
   줄 수를 늘린다. CSS 는 템플릿 문자열 안이므로 주석에 백틱을 쓰면 안 된다. */
.line { padding: 2px 0; color: var(--body); break-inside: avoid; }
.line b { color: var(--ink); font-weight: 700; }

/* 기술 */
.tech div { grid-template-columns: 92px minmax(0, 1fr); padding: 2px 0; break-inside: avoid; }
.tech dt { color: var(--ink); font-weight: 700; font-size: 10.5pt; padding-top: 0; }
.tech dd { color: var(--body); }
.gh { margin-top: 10px; color: var(--muted); font-size: 9.5pt; }

/* 포트폴리오 — 2쪽 압축 절 바로 뒤에 이어 붙는다(강제 쪽 나눔 없음) */
.part { break-before: auto; }
.part-title { margin: 30px 0 18px; break-after: avoid; }
.part-sub { margin: 36px 0 0; padding-top: 11px; border-top: 2px solid var(--rule); font-size: 13pt; font-weight: 800; break-after: avoid; }
.proj { margin-top: 26px; }
.part-title + .proj { margin-top: 0; }
.part-sub + .proj { margin-top: 20px; }
/* 제목과 키-값 줄은 한 덩어리. 문단 사이에서는 갈라져도 된다 — 통째로 묶으면
   앞 쪽 끝에 그만한 구멍이 남는다(예전 틀에서 실측). */
.proj-head { break-inside: avoid; break-after: avoid; }
.proj h3 { margin: 0 0 8px; font-size: 14pt; font-weight: 800; line-height: 1.4; }
.proj h4 { margin: 12px 0 4px; font-size: 11pt; font-weight: 800; break-after: avoid; }
.proj-lead { margin-bottom: 10px; color: var(--ink); }
.proj p { margin-bottom: 10px; color: var(--body); orphans: 2; widows: 2; }
/* 링크를 줄마다 쓰던 때는 라벨("개편 PR (프론트 · 2026)")이 길어 키 칸이 176px
   이어야 했다. 이제 키가 "기간·팀"·"링크" 둘뿐이라 좁혀 본문 폭을 돌려준다. */
.proj .facts div { grid-template-columns: 76px minmax(0, 1fr); }
.proj .facts dd a { color: var(--ink); }
.others { margin-top: 14px; }
.others a { color: var(--ink); }

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

/**
 * ── 쪽 구성 (2026-09-12) ────────────────────────────────────────────────────
 * 예전에는 1부(신원~기술)가 흐름대로 3쪽을 먹고 포트폴리오가 `break-before: page`
 * 로 4쪽에서 시작해 전체가 8쪽이었다. **개발 직무 서류에서 프로젝트가 4쪽부터
 * 시작하면 읽히지 않는다** — 심사자가 보는 첨부 PDF 의 존재 이유가 프로젝트다.
 * (학력·자격·수상은 자사 지원서 양식에 이미 입력하는 값이라 중복이다.)
 *
 * 그래서 쪽을 흐름에 맡기지 않고 두 자리만 못박는다:
 *   1쪽  제목 · 인적사항 · 요약 · 학력 · 병역 · 자격증 · 보유 기술
 *   2쪽  활동 · 수상 · 교육  →  포트폴리오 시작 (`renderCareers` 의 newPage)
 *   3쪽~ 프로젝트가 흐름대로 이어짐
 * 포트폴리오의 강제 쪽 나눔은 없앴다(`.part` 는 이제 `break-before: auto`) —
 * 그게 있으면 2쪽 상단 압축 절 뒤가 통째로 비고 포트폴리오가 3쪽으로 밀린다.
 *
 * 쪽수는 목표가 아니라 결과다(그 원칙은 그대로다). 다만 "1부 3쪽" 은 결과가 아니라
 * 라벨 열이 만든 낭비였다 — 항목당 3~5줄짜리 라벨을 한 줄로 내려 93줄을 줄였다.
 */
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
${renderEducation()}
${renderMilitary()}
${renderCertifications()}
${renderSkills()}
${renderCareers()}
${renderAwards()}
${renderCourses()}
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
