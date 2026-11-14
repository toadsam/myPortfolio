// 경력 안내(쪽지) 말뭉치 생성 — 사이트에 이미 공개된 글을 절 단위 조각으로 자른다.
//
// 읽는 곳은 화면이 읽는 데이터와 같다: `resume.ts`, `RICH_DATA`, `MU4_DATA`, `resumeV2Data`.
// 그래서 화면 문구를 고치고 이 스크립트를 다시 돌리면 답의 근거도 같이 바뀐다.
// 면접 원고(`docs/PORTFOLIO_INTERVIEW_STORIES.md`)나 근거 메모(`docs/BACKEND_EVIDENCE.md`)는
// 공개하지 않은 문장이 답으로 나갈 수 있어 넣지 않는다.
//
// 결과: backend/app/data/career_corpus.json      (조각)
//       backend/app/data/career_embeddings.json  (`--embed` 일 때, 256차원 float32 base64)
//
// 실행: npm run career:corpus            조각만
//       npm run career:corpus -- --embed  임베딩도 (backend/.env 의 OPENAI_API_KEY 사용)
// 임베딩은 본문 해시로 캐시해서 바뀐 조각만 다시 만든다.

import {createHash} from "node:crypto";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "backend", "app", "data");
const EMBED = process.argv.includes("--embed");
const EMBED_MODEL = "text-embedding-3-small";
const EMBED_DIM = 256;
const MAX = 700; // 조각 하나의 글자 수 상한
const MIN = 20; // 이보다 짧은 조각은 버린다(라벨 한 줄 등)

const resume = await import("../src/data/resume.ts");
const {RICH_DATA} = await import("../src/components/ui/project-viewers/richContent/data.ts");
const {MU4_DATA} = await import("../src/components/resumeV2/detail/muscleupDetail.data.ts");
const v2 = await import("../src/components/resumeV2/resumeV2Data.ts");

// ── 글자만 뽑기 ────────────────────────────────────────────────────────────

// 화면에 글로 나오지 않는 칸: 그림 경로, 링크, 코드 줄, 레이아웃 설정.
const SKIP_KEYS = new Set([
  "src", "img", "image", "logo", "href", "url", "lines", "highlightLines", "filename", "icon",
  "id", "richId", "category", "facets", "featured", "hero", "direct", "logoFill", "poster",
  "video", "thumb", "cover", "kind", "scene", "challenge", "compact", "toc", "wide", "maxWidth",
  "em", "eyebrow", "short", "key", "tone", "color", "accent", "x", "y", "from", "to", "span",
  "heroImage", "heroScreen", "gallery", "problemShot", "resultShot", "resultScreens", "demo",
  "coreCode", "beforeCode", "diagrams", "scenes", "printTitle",
]);

const looksLikePath = (s) => /^(\/|https?:|mailto:|#)/.test(s) || /\.(webp|png|jpe?g|svg|mp4|pdf)$/i.test(s);

/** 노드 아래의 글을 한 덩어리로. 짧은 값만 가진 객체(수치 타일 등)는 한 줄로 잇는다. */
function flatten(node) {
  if (node == null || typeof node === "boolean" || typeof node === "number") return "";
  if (typeof node === "string") return looksLikePath(node) ? "" : node.trim();
  if (Array.isArray(node)) return node.map(flatten).filter(Boolean).join("\n");
  const parts = Object.entries(node)
    // resume.ts 의 `evidence` 문자열은 증빙 파일 위치·자격번호라 화면에 안 나온다. 객체인 evidence(근거 상자)는 글이다.
    .filter(([k, v]) => !SKIP_KEYS.has(k) && !(k === "evidence" && typeof v === "string"))
    .map(([, v]) => flatten(v))
    .filter(Boolean);
  const short = parts.every((p) => p.length <= 40 && !p.includes("\n"));
  return parts.join(short ? " · " : "\n");
}

const titleOf = (node) => {
  if (!node || typeof node !== "object" || Array.isArray(node)) return "";
  for (const k of ["title", "t", "label", "name", "q", "org", "what"]) {
    const v = node[k];
    if (typeof v === "string" && v.length <= 60 && !looksLikePath(v)) return v;
    if (v && typeof v === "object" && typeof v.t === "string") return v.t;
  }
  return "";
};

function splitLongText(text) {
  const out = [];
  let cur = "";
  for (const s of text.split(/(?<=[.!?。다요])\s+|\n+/)) {
    if (!s) continue;
    if (cur && (cur + " " + s).length > MAX) {
      out.push(cur);
      cur = s;
    } else cur = cur ? cur + " " + s : s;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * 노드를 MAX 이하 조각으로. 큰 노드는 자식으로 내려가고, 작은 형제는 MAX 까지 묶는다.
 * 반환: [{label, text}]
 */
function pieces(node, label) {
  const text = flatten(node);
  if (!text) return [];
  if (text.length <= MAX) return [{label, text}];
  if (typeof node === "string") return splitLongText(text).map((t) => ({label, text: t}));

  const children = Array.isArray(node)
    ? node.map((v) => [null, v])
    : Object.entries(node).filter(([k]) => !SKIP_KEYS.has(k));
  const out = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({label, text: buf});
    buf = "";
  };
  for (const [, child] of children) {
    const t = flatten(child);
    if (!t) continue;
    if (t.length > MAX) {
      flush();
      const sub = titleOf(child);
      out.push(...pieces(child, sub ? `${label} · ${sub}` : label));
    } else if (buf && (buf + "\n" + t).length > MAX) {
      flush();
      buf = t;
    } else buf = buf ? buf + "\n" + t : t;
  }
  flush();
  return out;
}

/**
 * 값만 나열하면 모델이 칸의 뜻을 추측한다. 「SQLD · 국가공인 · 2026.09.11」을 읽고 날짜를 유효기간으로,
 * 구분을 옆 자격증과 같은 것으로 답한 적이 있다. 표처럼 생긴 항목은 칸 이름을 붙여 한 줄씩 적는다.
 * labels 에 없는 칸은 이름 없이 뒤에 그대로 붙는다(새 칸이 조용히 사라지지 않게).
 */
function labeled(obj, labels) {
  const lines = [];
  for (const [key, label] of Object.entries(labels)) {
    // 목록(요점 여러 줄)은 줄마다 이름을 붙인다. 한 줄로 이으면 넓은 질문에서 한 문장만 골라 쓸 수 없다.
    if (Array.isArray(obj[key]) && obj[key].every((v) => typeof v === "string" && v.length > 40)) {
      for (const v of obj[key]) lines.push(`${label}: ${v.trim()}`);
      continue;
    }
    const text = flatten(obj[key]);
    if (text) lines.push(`${label}: ${text.split(String.fromCharCode(10)).join(" / ")}`);
  }
  for (const [key, value] of Object.entries(obj)) {
    if (key in labels || SKIP_KEYS.has(key) || (key === "evidence" && typeof value === "string")) continue;
    const text = flatten(value);
    if (text) lines.push(text);
  }
  return lines;
}

// ── 조각 모으기 ────────────────────────────────────────────────────────────

const chunks = [];
const seen = new Set();
function add(project, title, section, href, node) {
  for (const p of pieces(node, section)) {
    const text = p.text.replace(/[ \t]+/g, " ").trim();
    if (text.length < MIN) continue;
    const key = project + "|" + text;
    if (seen.has(key)) continue;
    seen.add(key);
    chunks.push({project, title, section: p.label, href, text});
  }
}

// 프로젝트 이름과 별칭. 질문에 이 말이 나오면 그 프로젝트 조각을 먼저 본다.
const ALIASES = {
  "village-portfolio": ["마을", "포트폴리오 마을", "이 사이트", "포트폴리오 사이트", "myPortfolio", "NPC", "공방"],
  mystock: ["MyStock", "MyWave", "마이스톡", "마이웨이브", "mywave", "가계부", "자산"],
  festflow: ["FestFlow", "AjouFesta", "페스트플로우", "아주페스타", "축제", "주점", "AI Match", "매칭"],
  muscleup: ["득근득근", "득근", "MuscleUp", "머슬업", "운동 앱", "헬스"],
  aclub: ["aClub", "에이클럽", "동아리"],
  ajouchong: ["총학생회", "총학", "ajouchong", "학생회 웹"],
  "sign-language": ["수어지교", "수어", "수화"],
  darklab: ["DarkLab", "다크랩", "공포 게임"],
  "ajou-adventure": ["아주대탐험", "아주대 탐험"],
  tserof: ["TSEROF", "티세로프", "쎄로프"],
  "otherside-vr": ["Otherside", "아더사이드", "VR", "IMP_VR"],
  "monsterpoint-ar": ["MonsterPoint", "몬스터포인트", "AR", "IMP"],
  "ajou-indigame": ["인디게임", "Ajou_IndiGame", "아주 인디게임"],
};

const cards = new Map(resume.mainProjects.map((c) => [c.richId ?? c.id, c]));
const projectTitle = (id) => cards.get(id)?.title ?? ALIASES[id]?.[0] ?? id;

// 상세 페이지의 칸 이름 → 답 아래 출처에 보일 절 이름.
const SECTION = {
  tagline: "한 줄 소개", tldr: "요약", meta: "기간·역할", impact: "성과", metricsNote: "수치 출처",
  features: "기능", problem: "문제", research: "조사", hypothesis: "가설", process: "만든 순서",
  architecture: "구조", decisions: "기술 선택", work: "맡은 일", challenges: "문제 해결",
  perf: "성능", tech: "기술 스택", metrics: "수치", kpt: "회고", learningLead: "배운 점",
  learning: "배운 점", detail: "상세", beforeAfter: "전후 비교", fieldDay: "운영 당일",
  secondRun: "2차 운영", feedbackMap: "피드백 반영", testimonial: "사용자 말",
};

for (const [id, rich] of Object.entries(RICH_DATA)) {
  const title = projectTitle(id);
  const href = `/resume/${id}`;
  for (const [key, value] of Object.entries(rich)) {
    if (SKIP_KEYS.has(key) || !SECTION[key]) continue;
    if (key === "detail") {
      for (const [dk, dv] of Object.entries(value)) {
        if (SKIP_KEYS.has(dk)) continue;
        if (dk === "story") {
          for (const [sk, sv] of Object.entries(dv)) {
            if (!SKIP_KEYS.has(sk)) add(id, title, titleOf(sv) || "상세", href, sv);
          }
        } else add(id, title, "상세", href, dv);
      }
    } else add(id, title, SECTION[key], href, value);
  }
}

// 득근득근 상세는 따로 든 데이터가 있다.
add("muscleup", projectTitle("muscleup"), "상세", "/resume/muscleup", MU4_DATA);

// 이력서 카드: 프로젝트마다 기간·팀·역할·수치·요점.
for (const c of resume.mainProjects) {
  const id = c.richId ?? c.id;
  add(
    id,
    c.title,
    "이력서 카드",
    RICH_DATA[id] ? `/resume/${id}` : "/resume",
    labeled(
      {
        title: c.title, subtitle: c.subtitle, status: c.status, period: c.period, team: c.team,
        role: c.role, tags: c.tags,
        metrics: (c.metrics ?? []).map((m) => `${m.value} (${m.label})`).join(", "),
        metricsSource: c.metricsSource, highlights: c.highlights,
      },
      {
        title: "프로젝트", subtitle: "무엇", status: "상태", period: "기간", team: "인원 구성",
        role: "정재훈이 맡은 일", tags: "분야", metrics: "수치", metricsSource: "수치 출처", highlights: "한 일",
      },
    ),
  );
}
for (const s of resume.subProjects) add("side", s.title ?? "사이드 프로젝트", "사이드 프로젝트", "/resume", s);

const R = "/resume";
const me = "정재훈";
add("profile", me, "소개", R, {intro: resume.hero, summary: resume.heroSummary, print: resume.printSummary, about: resume.aboutMe});
// 기술은 영역마다 조각이 따로라 "주로 쓰는 기술"을 물으면 일부만 잡힌다. 주력(core)만 모은
// 조각을 하나 둔다. 주력/써 본 것 구분은 resume.ts 의 `core` 그대로다.
add("profile", me, "주력 기술", R, [
  "주로 쓰는 기술 스택(주력)입니다. 영역 순서가 주력 순서입니다.",
  ...resume.skillDetails.map((s) => {
    const core = s.core ?? [];
    const rest = s.stack.filter((t) => !core.includes(t));
    return `${s.area} 주력: ${core.join(", ") || "없음"}${rest.length ? ` · 써 본 것: ${rest.join(", ")}` : ""}`;
  }),
]);
for (const s of resume.skillDetails) add("profile", me, "기술", R, s);
add("profile", me, "기술", R, v2.SKILL_ROWS);
for (const e of resume.education)
  add("profile", me, "학력", R, labeled(e, {org: "학교·기관", program: "과정·전공", period: "기간", gpa: "학점", desc: "내용", bullets: "세부"}));
add("profile", me, "학력", R, {academic: v2.ACADEMIC, how: v2.EDU_HOW});
for (const c of resume.careers)
  add("profile", me, "활동·경력", R, labeled(c, {org: "기관", role: "직책", period: "기간", desc: "한 일", ledTo: "이어진 프로젝트"}));
add("profile", me, "활동·경력", R, {role: v2.ACT_ROLE, work: v2.WORK});
for (const w of resume.workExperience)
  add("profile", me, "근무 경험", R, labeled(w, {place: "근무처", period: "기간", desc: "한 일"}));
for (const a of resume.awards)
  add("profile", me, "수상", R, labeled(a, {kind: "종류(수상 또는 수료)", title: "이름", org: "주최", date: "받은 날", team: "팀", ledTo: "이어진 프로젝트"}));
add("profile", me, "수상", R, v2.AWARDS);
for (const c of resume.certifications)
  add("profile", me, "자격·수료", R, labeled(c, {name: "자격증", org: "발급 기관", grade: "구분", date: "취득일"}));
add("profile", me, "GitHub·개발 기록", R, {github: resume.githubEvidence, records: resume.devRecords});
for (const v of resume.values) add("profile", me, "일하는 방식", R, v);
add("profile", me, "연락처", R, resume.contact);

chunks.forEach((c, i) => {
  c.hash = createHash("sha1").update(c.text).digest("hex").slice(0, 16);
  c.id = `${c.project}-${i}`;
});

// 화면에 없는 것이 섞였으면 파일을 쓰지 않는다. 답으로 나가면 되돌릴 수 없다.
const LEAK = /바탕 화면|자격번호|인증번호|01[016789]-?\d{3,4}-?\d{4}|phone\.local/;
const leaked = chunks.filter((c) => LEAK.test(c.text));
if (leaked.length) {
  console.error("공개하면 안 되는 내용이 조각에 들어 있습니다:");
  for (const c of leaked) console.error(` - ${c.id} (${c.section}): ${c.text.match(LEAK)[0]}`);
  process.exit(1);
}

const projects = Object.keys(RICH_DATA).map((id) => ({
  id,
  title: projectTitle(id),
  aliases: [...new Set([projectTitle(id), ...(ALIASES[id] ?? [])])],
}));

await mkdir(outDir, {recursive: true});
await writeFile(
  join(outDir, "career_corpus.json"),
  JSON.stringify({projects, chunks}, null, 1) + "\n",
);
const chars = chunks.reduce((a, c) => a + c.text.length, 0);
console.log(`조각 ${chunks.length}개 · ${chars.toLocaleString()}자 · 평균 ${Math.round(chars / chunks.length)}자`);

// ── 임베딩 ─────────────────────────────────────────────────────────────────

if (EMBED) {
  const env = await readFile(join(root, "backend", ".env"), "utf8").catch(() => "");
  const key = process.env.OPENAI_API_KEY ?? env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
  if (!key) {
    console.error("OPENAI_API_KEY 가 없어 임베딩을 건너뜁니다. 검색은 키워드만으로 동작합니다.");
    process.exit(0);
  }
  const embPath = join(outDir, "career_embeddings.json");
  const old = JSON.parse(await readFile(embPath, "utf8").catch(() => "{}"));
  const cache = old.model === EMBED_MODEL && old.dim === EMBED_DIM ? (old.vectors ?? {}) : {};
  const vectors = {};
  const todo = [];
  for (const c of chunks) {
    if (cache[c.hash]) vectors[c.hash] = cache[c.hash];
    else todo.push(c);
  }
  for (let i = 0; i < todo.length; i += 96) {
    const batch = todo.slice(i, i + 96);
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {Authorization: `Bearer ${key}`, "Content-Type": "application/json"},
      body: JSON.stringify({
        model: EMBED_MODEL,
        dimensions: EMBED_DIM,
        input: batch.map((c) => `${c.title} · ${c.section}\n${c.text}`),
      }),
    });
    if (!res.ok) throw new Error(`임베딩 실패 ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    data.data.forEach((d, j) => {
      vectors[batch[j].hash] = Buffer.from(new Float32Array(d.embedding).buffer).toString("base64");
    });
  }
  await writeFile(embPath, JSON.stringify({model: EMBED_MODEL, dim: EMBED_DIM, vectors}) + "\n");
  console.log(`임베딩 ${Object.keys(vectors).length}개 (새로 만든 것 ${todo.length}개)`);
}
