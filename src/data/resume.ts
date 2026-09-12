// 면접관용 이력서(ResumeMode) 콘텐츠.
//
// ## 사실관계의 출처
//
// **`resume/jeong-jaehun-resume.md`(본인이 쓴 이력서 원본)가 정답이다.**
// 기간·역할·팀 규모·외부 링크는 전부 거기서 가져왔고, 거기 없는 값은
// **지어내지 않고 비워 둔다**(`period`·`role` 이 없으면 화면에 그 줄이 안 그려진다).
// 예전에는 이 파일이 배포본(toadsam.github.io) 텍스트만 옮겨와서 기간도 역할도
// 없었고, 외부 링크는 전부 빈 문자열이라 "링크처럼 보이는데 안 눌리는" 라벨이
// 25개 떠 있었다. 링크가 없으면 라벨을 만들지 않는 게 이 파일의 규칙이다.
//
// 제출 전 확인할 값은 파일 맨 아래 `PENDING_BEFORE_SUBMIT` 에 모아 뒀다.

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export type ResumeCategory = "web" | "data" | "game" | "ar" | "ops";
// 카드의 두 번째 축. `category` 는 "무엇을 만들었나(산출물)" 라 웹은 전부 web 이고,
// 그러면 웹 카드 다섯이 서로 뭐가 다른지 안 보인다(2026-09-05). facet 은 "안에
// 무슨 기술이 핵심으로 도는가" — 어휘는 이 넷으로 고정한다. 늘리면 화면에서
// 뺀 `tags`(스택 나열 = 잡음)와 구분이 없어진다. 해당 없는 카드는 비워 둔다.
// "game" 칩은 웹 서비스 안의 게임 장치(캐릭터 성장·랭킹 같은 것)를 말한다 — 첫 지원처가
// 게임 회사라 그 장치를 안 보이게 두는 게 손해다(본인 결정 2026-09-05). 다만 마을 사이트에는
// 달지 않는다: 3D 표현층이 곧 게임은 아니고, 게임으로 읽히지 않게 제목까지 손본 카드다.
export type ResumeFacet = "ai" | "game" | "3d" | "realtime" | "data";
// "출시" 는 Steam 에 상용 출시한 TSEROF 전용이다. 운영중/완료와 층이 다르다 —
// 심사자에게 "만들어 봤다" 와 "상점에 올라가 있다" 는 완전히 다르게 읽힌다.
export type ProjectStatus = "운영중" | "완료" | "출시";

export interface ResumeLink {
  label: string; // GitHub · 사이트 · Notion 등
  href: string; // **빈 문자열이면 렌더하지 않는다** — 죽은 링크를 만들지 않기 위해
}

export type {HeroContent} from "./hero";

// `ProficiencyItem`(숙련도 85%/80%/70%)이 있던 자리.
//
// 지웠다. 근거가 없는 자기평가라서 화면에 「임시 수치 — 조정 필요」라는 편집
// 메모를 달고 다녔고, 그 메모가 그대로 노출돼 있었다. 문구만 지우면 근거 없는
// 숫자가 사실로 나가므로 **수치 자체를 바꿨다** — 지금 그 자리에는
// `mainProjects` 의 카테고리를 직접 센 "작업 비중" 이 들어간다(ResumeMode).
// 되살리지 말 것: 심사자가 검산할 수 없는 숫자는 이 이력서에 두지 않는다.

export interface SkillDetail {
  area: string;
  desc: string;
  /**
   * 주력(금색 칩). 나머지는 "써 본 것". 칩이 전부 같은 모양이면 React 와 Expo 가
   * 같은 무게로 읽혀 심사자가 주력을 못 찾는다(2026-09-06).
   */
  core?: string[];
  /**
   * 그 영역에서 **실제로 쓴 것만**. 이력서 원본의 `Technical Skills` 절이 근거다.
   * 예전에는 이 목록이 아예 없고 상단 칩 12개가 전부였는데, 그중 셋
   * (`Database`·`Game Dev`·`3D`)은 기술명이 아니라 뭉뚱그린 분류라 아무것도
   * 증명하지 못했고, 정작 TypeScript 는 어디에도 없었다.
   */
  stack: string[];
}

export interface EducationItem {
  org: string;
  program: string;
  period: string;
  desc: string;
  bullets: string[];
  /** 증빙 파일(사용자 PC). 화면·PDF 에 안 그리고 제출 요청이 올 때 찾는 용도. */
  evidence?: string;
  /**
   * 기관 로고(`public/logos/*`). 학력·교육 항목의 로고는 증거가 아니라 **표식**이다 —
   * 심사자가 이미 아는 이미지라 글을 읽기 전에 "어디서"가 먼저 잡힌다.
   * 파일이 없거나 못 읽으면 화면은 기관명 첫 글자 원으로 대신한다(ResumeMode).
   * 실제 로고만 쓴다 — 생성 이미지 금지.
   */
  logo?: string;
  /**
   * 로고가 원을 **꽉 채우게** 그린다(여백 0 · cover). 아주대 엠블럼처럼 그 자체가
   * 원이거나, 어썸처럼 바탕이 밝은 정사각 그림에 쓴다. 워드마크(코드잇·구름·
   * 스파르타·FIT)는 잘리므로 켜지 않는다.
   */
  logoFill?: boolean;
  /**
   * 학점. 전공 카드 한 곳에만 적는다(복수전공·마이크로전공 카드에 반복하지 않는다).
   * 만점을 반드시 붙인다 — 4.3 만점 학교도 있어 만점이 없으면 환산이 안 된다.
   * 전공 학점만 적는 건 본인 결정(2026-09-05).
   */
  gpa?: string;
}

/** 활동·경력 — 학력과 섞으면 "경력 없음"으로 읽힌다. */
export interface CareerItem {
  org: string;
  role: string;
  period: string;
  desc: string;
  /** 기관 로고. EducationItem.logo 와 같은 규칙. */
  logo?: string;
  /** EducationItem.logoFill 과 같다. */
  logoFill?: boolean;
  /**
   * 이 활동이 어느 프로젝트로 이어졌는지. 이 이력서에서 가장 강한 사실은
   * **활동과 프로젝트가 같은 자리에서 나왔다**는 것이다 — 헬스 동아리 회장이자
   * 새벽 헬스장 근무자가 득근득근을 만들었고, 총학생회 국원으로 문의를 받던
   * 사람이 국장이 되어 그 웹서비스를 맡았다. 그 선을 화면에 그린다.
   */
  ledTo?: string;
  /** 증빙 파일(사용자 PC). 화면·PDF 에 안 그린다. */
  evidence?: string;
}

/** 근무 경험(아르바이트). 개발 이력과 섞지 않고 따로 한 줄씩만 적는다. */
export interface WorkItem {
  place: string;
  period: string;
  desc: string;
}

/**
 * 수상·수료. **증빙 파일이 있는 것만** 적는다 — 출처는 각 항목의 `evidence`
 * (사용자 PC 의 증서 PDF, 리포에는 넣지 않는다: 상장에 팀원 실명이 있다).
 * `kind` 가 "수상" 이면 상 이름을, "수료" 면 과정 이름을 `title` 에 쓴다.
 */
export interface AwardItem {
  kind: "수상" | "수료";
  title: string;
  /** 주최·발급 기관. */
  org: string;
  /** 수여일(증서에 찍힌 날짜). */
  date: string;
  /** 팀으로 받은 것이면 팀명. 개인이면 비운다. */
  team?: string;
  /** 어느 프로젝트가 이 결과로 이어졌나. `careers[].ledTo` 와 같은 뜻. */
  ledTo?: string;
  /** 증서 파일명·인증번호 — 화면에 안 그리고, 제출 전 대조용. */
  evidence: string;
  /** 주최 기관 로고(`public/logos/*`). 학력·활동과 같은 규칙 — 실제 로고만. */
  logo?: string;
  logoFill?: boolean;
}

/**
 * 자격증. **수상·수료와 배열을 나눈다** — 상은 "받았다" 고 자격증은 "국가가 인정한다" 라,
 * 심사자가 보는 칸 자체가 다르다(금융권·대기업 서류는 자격증에 별도 배점 칸이 있다).
 * 그래서 화면에서도 학력보다 위, 독립 블록이다(본인 결정 2026-09-11).
 */
export interface CertificationItem {
  name: string;
  /** 발급·시행 기관. */
  org: string;
  /** "국가기술자격" · "국가공인" — 자격의 층을 말한다. 화면에서는 이름 옆 꼬리표. */
  grade: string;
  /** 합격(취득) 일자. 증서에 찍힌 날짜 그대로. */
  date: string;
  /**
   * 증서 파일과 자격번호 — 화면·PDF 에 안 그리고 제출 전 대조용.
   * **주소·생년월일은 적지 않는다**: 확인서 원본에 둘 다 있지만 이 파일은
   * 브라우저 번들에 들어간다(전화번호를 `resume/` md 에만 두는 것과 같은 이유).
   */
  evidence: string;
  /**
   * 표식 이미지(`public/logos/*`). 학력·활동의 `logo` 와 같은 규칙 — 실제 로고만
   * 쓰고 생성 이미지는 금지다. 둘 다 **재훈 님이 준 증서 원본에서 뽑았다**:
   * 기관 CI 를 웹에서 받아 오면 출처가 불확실한데, 증서에 찍힌 표식은 그 자격의
   * 공식 표식이면서 출처가 명확하다.
   */
  logo?: string;
  logoFill?: boolean;
}

/**
 * 카드에 얹는 성과 타일. `value` 가 빈 문자열이면 그 타일은 그리지 않는다.
 *
 * `provisional` 이 켜진 값은 **아직 실측하지 않은 임시 숫자**다. 화면에 "잠정"
 * 꼬리표가 함께 붙는다 — 임시값이 그대로 제출돼도 거짓 주장이 되지 않게 하려는
 * 장치이고, 실제 수치를 넣을 때 그 줄만 지우면 꼬리표가 사라진다.
 */
export interface ProjectMetric {
  value: string;
  label: string;
  provisional?: boolean;
}

export interface MainProjectCard {
  id: string;
  title: string;
  subtitle: string;
  category: ResumeCategory;
  /** 핵심 기술 축. 배지 옆 작은 칩. 근거는 부제·지표에 이미 있는 것만. */
  facets?: ResumeFacet[];
  status: ProjectStatus;
  /**
   * 리뉴얼 예정(본인 확인 2026-09-08: FestFlow · MyWave · 수어지교). 상태 뱃지 옆에
   * 작은 칩으로, PDF 에서는 기간 줄 꼬리로 붙는다. 상태와 별개의 축이다 —
   * "운영중이면서 리뉴얼 예정" 도, "완료인데 리뉴얼 예정" 도 있다.
   */
  renewal?: boolean;
  tags: string[];
  /** 이력서 원본 기준. 근거가 없으면 비운다. */
  period?: string;
  /** "개인 개발" · "5인 팀" 등. */
  team?: string;
  /** 내가 실제로 한 일. */
  role?: string;
  /** 값이 빈 타일은 생략되고, 전부 비면 지표 줄 자체가 사라진다. */
  metrics?: ProjectMetric[];
  /**
   * 지표의 출처와 기간. **거짓말하는 사람은 기간을 안 쓴다** — 기간을 적는
   * 순간 반박당할 수 있게 되므로, 적는 행위 자체가 "검증당할 각오"의 신호로
   * 읽힌다. 캡처 이미지보다 이 한 줄이 신뢰도를 더 올린다.
   * 근거가 없는 지표에는 이 값을 달지 말고, 지표 자체를 빼라.
   */
  metricsSource?: string;
  /** 3D 마을 원페이지(ProjectOnePager)로 연결되는 projects.ts id. 없으면 외부 링크만. */
  richId?: string;
  /** public/ 기준 카드 대표 이미지 경로. 없으면 플레이스홀더 표시. */
  image?: string;
  /**
   * 대표 프로젝트. 그리드에서 **이 넷만 펼쳐 두고** 나머지는 "전체 N건 보기"
   * 뒤로 접는다.
   *
   * 13건을 한 번에 펼치면 "많이 해봤다" 가 아니라 **"하나도 깊게 안 해봤다"**
   * 로 읽힌다 — 특히 직함이 Full-Stack(Web) 인데 화면의 절반이 게임이면
   * 심사자의 첫 질문이 "그래서 무슨 직무죠?" 가 된다. 지운 게 아니라 순서를
   * 준 것이다: 접힌 목록도 한 번의 클릭으로 다 열린다.
   */
  featured?: boolean;
  /**
   * 전폭 카드. 대표가 다섯이 되면서 2열 격자에 한 장이 남게 됐다 — 빈 반 칸을
   * 두는 대신 **이 사이트 자신**을 첫 자리에 한 줄로 편다. "지금 보고 있는
   * 화면이 이 프로젝트" 라는 카드라 첫 자리와 큰 크기가 둘 다 맞다. 격자에서만
   * 뜻이 있고 캐러셀은 무시한다(`ResumeTerminal.css .is-hero`).
   */
  hero?: boolean;
  /**
   * PDF 에서는 대표(상세 항목)가 아니라 「그 밖의 프로젝트」 한 줄 목록으로 내린다.
   *
   * 2026-09-07 이전에는 "A4 2장" 이 고정 예산이라 자리가 모자라면 대표를 여기로
   * 내렸다(그때 TSEROF 가 내려갔다). **그 예산은 없앴다** — 빽빽해서 안 읽히는
   * 2장보다 여백 있는 3장이 낫고, 쪽수는 목표가 아니라 결과여야 한다는 판단이다.
   * 그래서 지금 이 플래그를 쓰는 항목은 없다. 화면 대표인데 종이에서는 줄여야 할
   * 이유가 생겼을 때만 붙이고, 그 이유를 여기 적을 것.
   */
  printCompact?: boolean;
  /**
   * PDF 이력서(`scripts/build-public-resume-pdf.mjs`)에만 쓰는 제목. 화면 제목에
   * 붙은 "(이 사이트)" 같은 꼬리는 종이 위에서는 뜻이 없다. 없으면 `title`.
   */
  printTitle?: string;
  /**
   * PDF 이력서의 성과 줄 2~3개. 화면 카드는 지표 타일과 전용 전시실이 말해 주지만
   * 종이에는 그 둘이 없으므로 "무엇을 어떻게 해서 어떻게 됐나"를 문장으로 적는다.
   * 출처는 `resume/jeong-jaehun-resume.md` — 거기 없는 사실은 적지 않는다.
   * 비어 있으면 PDF 에서 subtitle 한 줄만 나간다.
   */
  highlights?: string[];
  links: ResumeLink[];
}

export interface SubProjectCard {
  title: string;
  desc: string;
  /** public/ 기준 썸네일 이미지 경로. 없으면 텍스트만. */
  image?: string;
  links: ResumeLink[];
}

export interface DevRecord {
  title: string;
  desc: string;
  href: string;
}

export interface ValueItem {
  title: string;
  desc: string;
  /** 그 태도가 드러난 실제 사건. 없으면 그 가치는 형용사일 뿐이다. */
  evidence?: string;
}

// ─── 카테고리 메타 ────────────────────────────────────────────────────────────
// 예전엔 정의만 되고 화면에 안 나와서, "카테고리: Web Service · Data/AI …" 라는
// 안내 문구가 거짓말이 돼 있었다. 지금은 카드마다 배지로 그린다.

export const CATEGORY_META: Record<
  ResumeCategory,
  {label: string; color: string}
> = {
  web: {label: "Web Service", color: "#7cc6ff"},
  data: {label: "Data / AI", color: "#b9a3ff"},
  game: {label: "Game", color: "#6fd6a6"},
  ar: {label: "AR / XR", color: "#ffb457"},
  ops: {label: "Ops", color: "#a9bdd6"}
};

// color 는 칩 색(테두리·바탕 색조·글자). 카테고리 배지 색과 겹치지 않게 골랐다 —
// web 배지가 하늘색이라 data 는 하늘색을 피해 금색.
export const FACET_META: Record<
  ResumeFacet,
  {label: string; hint: string; color: string}
> = {
  ai: {label: "AI", hint: "LLM·모델이 핵심 기능인 프로젝트", color: "#c9a7ff"},
  game: {
    // "게임 요소" 는 칩 셋 + 배지가 1920 폭에서도 두 줄로 넘쳤다. 뜻은 hint 가 말한다.
    label: "게임",
    hint: "캐릭터 성장·랭킹 등 게임 장치가 들어간 서비스",
    color: "#ff8fa3"
  },
  "3d": {label: "3D", hint: "Three.js·Unity 등 3D 표현층", color: "#7fe0b8"},
  realtime: {
    label: "실시간",
    hint: "SSE·소켓 등 실시간 통신",
    color: "#ff9f6e"
  },
  data: {
    label: "데이터",
    hint: "GA4·분석·대시보드로 개선한 프로젝트",
    color: "#f2d675"
  }
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

// 첫 화면(착륙장)이 이 셋만 쓰는데, 여기서 가져가면 이력서 전체가 그쪽 번들에
// 딸려간다. 그래서 `data/hero.ts` 로 내리고 여기서는 다시 내보내기만 한다
// — 이유는 그 파일 머리 주석에.
export {hero, heroSummary, resumePdf} from "./hero";

// ─── PDF 머리 요약 ────────────────────────────────────────────────────────────
// PDF 이력서 첫 화면의 요약. 화면(ResumeMode)은 헤드라인 세 줄과 지표 바가 이
// 역할을 하지만 종이에는 그게 없다. 문장은 이력서 원본 md 의 Summary 와
// Hiring Signals 를 합쳐 세 줄로 줄인 것 — 예전 PDF 는 같은 주장을 요약 문단·
// 3칸 스트립·시그널 카드 4장에서 세 번 반복했다.

// 2026-09-12: points 를 4개로 늘리면서 lead 의 둘째 문장("기능을 만든 뒤 토큰/세션
// 유지, HTTPS/CORS 같은 배포 조건까지…")을 지웠다. 바로 아래 2번 항목이 같은 말을
// 더 자세히 하고 있었다 — hero.ts 가 헤드라인 밑 bullets 를 지운 것과 같은 이유다.
//
// **이 절은 쪽수에 직접 걸린다.** 1부(인적사항~보유 기술)는 3쪽에 꽉 차 있어서
// 여기서 한 줄만 늘어도 전체가 8쪽 → 9쪽이 된다. 실측(인쇄 폭 657px 기준):
// 8쪽 한계 2900~2924px, 4번째 항목을 넣으면 2924px.
//
// **쪽수는 반드시 `-- --private` 로 확인할 것.** 제출용 사본은 인적사항에
// 휴대전화 줄이 하나 더 붙어 공개본보다 25px(한 줄) 길다. 공개본만 보고
// 8쪽이라 안심했다가 제출용이 9쪽이었다(2026-09-12). **제출용이 기준이다.**
export const printSummary = {
  lead: "React와 Spring Boot를 중심으로 서비스 구현, 인증/보안, 배포 운영 이슈까지 직접 다루는 신입 개발자입니다.",
  points: [
    {
      head: "서비스 전체 흐름을 구현합니다.",
      body: "FestFlow 와 총학생회 웹에서 사용자 화면과 관리자 API 를 한 서비스 안에서 함께 만들었습니다."
    },
    {
      head: "배포 후 드러나는 문제를 재현하고 고쳐 봤습니다.",
      body: "HTTPS/Mixed Content, CORS credentials, 토큰 재발급 경쟁 상태, SSE 연결처럼 프론트와 서버를 함께 봐야 하는 문제를 다뤘습니다."
    },
    {
      head: "실사용 피드백과 지표로 고칩니다.",
      body: "GA4/GSC 지표와 운영 문의를 근거로 정보 구조, CTA, 링크 흐름, 문구를 개선했습니다."
    },
    {
      head: "AI 코딩 도구를 통제하면서 개발했습니다.",
      body: "겪은 실패를 문서로 고정해 반복을 막고, 도구가 제안한 값은 직접 측정해 확인했습니다."
    }
  ]
};

// ─── Skills ───────────────────────────────────────────────────────────────────

/** 머리글 칩. 아래 표가 자세히 말하므로 여기는 주력만 짧게. */

export const skillDetails: SkillDetail[] = [
  // 2026-09-06 정리: 개념·프로토콜 칩(REST API·HTTPS·CORS·SSE·Session)은 뺐다 —
  // 도구가 아니고, 옆의 desc 에 이미 들어 있다. Firebase 는 두 줄에 있던 것을 하나로.
  // Next.js·Three.js(R3F)·FastAPI 는 **이 사이트 자체**가 근거다(package.json ·
  // backend/requirements.txt) — 심사자가 지금 보고 있는 결과물의 기술이 목록에 없었다.
  {
    area: "Frontend",
    desc: "React/TypeScript 기반 SPA 화면 구현과 API 연동",
    core: ["React", "TypeScript", "Next.js"],
    stack: [
      "React",
      "TypeScript",
      "Next.js",
      "Three.js (R3F)",
      "Vite",
      "React Query",
      "Tailwind CSS",
      "Expo",
      "React Native"
    ]
  },
  {
    area: "Backend",
    desc: "Spring Boot + JPA로 REST API 설계/구현",
    core: ["Spring Boot", "Java"],
    stack: [
      "Spring Boot",
      "Java",
      "JPA",
      "Spring Security",
      "Node.js",
      "Express",
      "FastAPI (Python)"
    ]
  },
  {
    area: "Auth",
    // stack 의 "Refresh Token Rotation" 은 남긴다 — 구현하고 운영에서 되돌리기까지
    // 해 본 기술이라 경험은 사실이다. 다만 desc 는 서비스의 현재 동작으로 읽히므로
    // 지금 실제로 도는 것(이중 쿠키 + 재발급 단일화)으로 적는다.
    desc: "JWT 인증/인가 · 이중 쿠키 + 재발급 단일화",
    core: ["JWT"],
    stack: [
      "JWT",
      "Refresh Token Rotation",
      "OAuth2",
      "Passport",
      "Firebase Auth"
    ]
  },
  {
    area: "Infra / Data",
    desc: "AWS 배포 및 HTTPS / Mixed Content / CORS 해결",
    core: ["AWS"],
    stack: ["AWS", "S3", "CloudFront", "MySQL", "MongoDB", "Firebase"]
  },
  {
    // 2026-09-12 추가. **"AI 를 활용한다" 가 아니라 "AI 출력을 신뢰하지 않는
    // 구조를 만든다" 로 적는다.** 신입이 혼자 만든 큰 결과물에서 활용을 앞세우면
    // 심사자의 첫 반응이 "본인이 짠 게 맞나" 라서 방향이 반대로 간다.
    // desc 의 세 가지는 전부 이 저장소에 실물이 있다:
    //   검증  agents/gate.py (진행 권한은 관리자 게이트 하나)
    //   보정  commission_service._clamp_estimate (규칙 기준의 0.6~1.8배)
    //   폴백  chat_service (키 없거나 실패하면 규칙 기반 대사)
    // 셋 다 backend/tests 가 잠그고 있다.
    area: "AI / LLM",
    desc: "LLM 응답을 규칙으로 검증·보정하고, 실패해도 멈추지 않게 설계",
    core: ["OpenAI API", "Claude Agent SDK"],
    // **stack 은 4개까지다(한 줄).** PDF 기술 표는 1부(인적사항~보유 기술)의
    // 마지막 절이고, 1부는 3쪽에 한 줄 여유도 없이 차 있다(실측 2865px / 3쪽
    // 한계 945~955px). 5개로 늘리면 dd 가 두 줄이 되어 1부가 4쪽으로 넘어가고,
    // 포트폴리오가 어차피 새 쪽에서 시작하므로 전체가 8쪽 → 9쪽이 된다.
    // "도구 호출 샌드박스"는 그래서 뺐다 — 같은 사실이 원본 md 의 Hiring Signals
    // 와 village-portfolio 카드 highlights 에 문장으로 들어 있다.
    stack: ["OpenAI API", "Claude Agent SDK", "규칙 기반 폴백", "출력 클램프"]
  },
  {
    area: "Unity XR/AR",
    desc: "인터랙션 및 상태/AI 제어 경험",
    // 2026-09-12: "NavMesh"·"Object Pooling" 을 뺐다. 위 AI / LLM 행을 넣으면서
    // 1부가 한 줄 넘쳤고, 이 둘이 표에서 가장 값이 싼 항목이라서다 — **도구가
    // 아니라 기법**이고, 이 파일 맨 위 주석이 같은 기준으로 개념·프로토콜 칩
    // (REST API·HTTPS·CORS·SSE·Session)을 이미 뺐다. 원본 md 의 Technical Skills
    // 에는 그대로 남아 있다(그쪽이 완전한 기록이고, 여기는 인쇄되는 쪽이다).
    core: ["Unity", "C#"],
    stack: ["Unity", "C#", "AR Foundation", "XR Interaction Toolkit"]
  }
];

/**
 * 표 위의 로고 칩 줄. 예전엔 손으로 적은 13개(HTML5·CSS3 포함)였고 아래 표와 9개가
 * 겹쳤다. 2026-09-06 부터 **주력(core)에서 파생**한다 — 표와 어긋날 수 없고, 주력을
 * 바꾸면 칩 줄이 따라온다. Auth 는 뺀다(JWT 는 언어·프레임워크 칩이 아니다).
 *
 * AI / LLM 도 뺀다. 로고가 없어서가 아니라 **틀린 로고가 붙어서**다 —
 * `getTechIcon` 은 정확히 일치하지 않으면 startsWith 로 찾는데 "C#" 이
 * 정규화되면 "c" 한 글자라, "Claude Agent SDK" 가 C# 아이콘을 집어 온다.
 * 칩 줄에 세우려면 techIcons 에 진짜 아이콘을 먼저 넣어야 한다.
 */
export const skillChips = skillDetails
  .filter(d => d.area !== "Auth" && d.area !== "AI / LLM")
  .flatMap(d => d.core ?? []);

/**
 * 공개 저장소로 검증되는 사실. 잠정 표시가 필요 없는 몇 안 되는 숫자라서
 * 히어로에 그대로 세운다. 근거는 이력서 원본의 `GitHub Evidence` 절.
 */
export const githubEvidence = {
  repoCount: 44,
  recent: ["FestFlow", "Sign-Language", "Ajou_MuscleUp", "Algorithm"],
  languages: ["TypeScript", "Java", "JavaScript", "C++", "C#"]
};

// ─── Education ────────────────────────────────────────────────────────────────

export const education: EducationItem[] = [
  {
    org: "아주대학교",
    logo: "/logos/ajou.png",
    logoFill: true,
    program: "디지털미디어학과 (전공)",
    period: "2021.03 ~ 2027.02 (예정)",
    gpa: "전공 학점 4.05 / 4.5",
    desc: "웹/소프트웨어 엔지니어링을 중심으로 공부했습니다.",
    bullets: ["React/Spring Boot 웹 프로젝트", "Unity XR/AR 인터랙션 프로젝트"]
  },
  {
    org: "아주대학교",
    logo: "/logos/ajou.png",
    logoFill: true,
    program: "인공지능 융합학과 (복수전공)",
    period: "2021.03 ~ 2027.02 (예정)",
    desc: "인공지능 융합학과를 복수전공으로 이수 중입니다.",
    bullets: [
      "웹 프로젝트에 AI 기능 결합 (FestFlow 혼잡 예측 · 득근득근 AI 인바디 상담)"
    ]
  },
  {
    org: "아주대학교",
    logo: "/logos/ajou.png",
    logoFill: true,
    // 마이크로전공은 학칙상 부전공이 아니다 — 2026-09-08 까지 "(부전공)" 으로
    // 적혀 있었고, 학력은 서류에서 검증되는 항목이라 표기를 원본(md)대로 고쳤다.
    // 괄호 안이 화면의 꼬리표(ResumeMode isAcademic)이자 PDF 의 학력 줄이다.
    program: "메타버스기획 (마이크로전공)",
    period: "2021.03 ~ 2027.02 (예정)",
    desc: "메타버스 플랫폼용 상호작용 콘텐츠를 만들었습니다.",
    bullets: ["메타버스 플랫폼 콘텐츠 제작"]
  },
  {
    // 기간·과정명은 HRD-Net 훈련확인증 기준(2026-09-06 확인). 예전 "2023.09 ~ 2024.02" 는
    // 근거 없는 기억값이었다 — 실제 훈련은 8/7 시작, 12/15 수료(1,080시간). 그 앞에
    // 선수 과정 [왕초보] 유니티로 만드는 게임개발 종합반(2023.07.18~08.21, 48시간)이
    // 따로 있는데 화면에는 안 적는다. TSEROF 는 이 과정의 최종 팀 프로젝트다.
    // org 에 "(팀스파르타)" 를 붙였더니 PDF 교육 줄이 접혀 코드잇 한 줄이 3쪽으로
    // 넘어갔다 — 2장 예산이라 org 는 짧게, 법인명은 evidence/주석에만.
    org: "스파르타 내일배움캠프",
    logo: "/logos/sparta.png",
    program: "실무형 Unity 게임개발자 양성과정",
    period: "2023.08.07 ~ 2023.12.15",
    evidence:
      "바탕 화면/기타파일/기타/훈련확인증.png (HRD-Net · 1,080시간 · 수료일 2023-12-15) · 유니티 캠프 수료.png / 유니티 수료2.png 는 바탕 화면/개발/유니티 게임/ (OneDrive 클라우드 전용)",
    desc: "Unity 게임 개발 과정을 1,080시간 수료했습니다.",
    bullets: ["최종 팀 프로젝트 TSEROF — Steam 출시"]
  },
  {
    // 수료증 2장(2026-09-06 확인): "입문 - 용사가 되자"(ARMY-2302011836) ·
    // "SW개발 초급과정 2"(ARMY-2303102294). 증서 기재 교육 기간 2023.03.08~12.31,
    // 발행일 2023.06.16. 주관은 카카오엔터프라이즈 · 구름.
    org: "구름(goorm) · 카카오엔터프라이즈",
    logo: "/logos/goorm.png",
    program: "군 장병 맞춤형 온라인 AI·SW 교육",
    period: "2023.03.08 ~ 2023.12.31",
    evidence:
      "바탕 화면/정재훈의 포트폴리오 모음집/수료증 및 증거/GEC_oirkdcipjD_fri-jun-16-2023-18-11-08_kor.pdf (입문) · GEC_orplXCyDGT_fri-jun-16-2023-18-21-57_kor.pdf (SW개발 초급과정 2) · 발행 2023-06-16",
    desc: "군 복무 중 온라인으로 입문 과정과 SW개발 초급과정 2를 수료하며 HTML, CSS, JavaScript 기초를 익혔습니다.",
    bullets: ["수료증 2장 (입문 · SW개발 초급과정 2)"]
  },
  {
    // 2021년 상반기 기수별 기간(링커리어 공고, 2026-09-06 조사): 1기 02.17~03.15 ·
    // 2기 03.01~03.30 · 3기 03.14~04.12 · 4기 03.31~05.13. "2021.03 ~ 2021.04" 와 맞는
    // 건 3기인데 **수료증으로 기수를 확인하지 못해** 월 단위로 둔다. 확인되면 일자로.
    org: "코드잇",
    logo: "/logos/codeit.png",
    program: "대학생 코딩캠프",
    period: "2021.03 ~ 2021.04",
    desc: "프로그래밍과 웹 개발 기초를 배웠습니다.",
    bullets: ["웹 개발 기초"]
  }
];

// ─── 활동 · 경력 ──────────────────────────────────────────────────────────────
//
// 근거는 **본인이 작성한 채용 지원서의 활동/경력 표**다(2026-08-25 확인). 예전에는
// 이력서 원본의 `Collaboration` 한 문단만 있어서 기간을 "재학 중" 으로밖에 못 적었고,
// 직함도 뭉뚱그려져 있었다. 지금은 연·월과 정식 직함이 있다.
//
// 최신순으로 둔다. 서류에서 가장 먼저 읽히는 건 "지금 무엇을 하고 있는가" 다.

export const careers: CareerItem[] = [
  // 제43·44·45대를 **한 칸으로 합쳤다.** 세 칸으로 나열되어 있을 때는 "학생회를
  // 여러 번 했다" 로 읽혔는데, 실제 사실은 **3년 연속 · 국원에서 국장**이다.
  // 그 사실이 세 칸에 흩어져 있어서 안 보였다(활동 8건 중 5건이 학생자치라
  // "개발을 덜 했나" 로 읽힐 여지까지 있었다).
  //
  // 정답 문서도 이걸 한 줄로 요약한다 — resume/jeong-jaehun-resume.md 「Collaboration」.
  // 중앙비상대책위원회는 44대와 45대 사이(2026.01~03)의 같은 학생자치 이력이라
  // **한 칸에 넣는다**(본인 결정 2026-09-04, 순서 43 → 44 → 비대위 → 45).
  // FIT 학생회는 다른 조직이라 그대로 따로 둔다. 대수와 경로를 role 에 그대로
  // 남겨 두었으므로, 면접에서 어느 대에 무엇을 했는지 물으면 답이 화면에 있다.
  //
  // 재직 여부: 지원서 표에는 `26.03.01~26.05.10` 으로 적혀 있지만 그건 작성 시점
  // 스탬프고, 본인 확인 결과 **지금도 재직 중**이다(2026-08-25).
  {
    org: "아주대학교 총학생회 · 중앙비상대책위원회 (제43~45대)",
    // 제45대 총학생회 '어썸' 로고 (본인 제공, 2026-09-04)
    logo: "/logos/awesome.png",
    logoFill: true,
    role: "생활복지국원(43대) → 소통발전국원(44대) → 비대위 집행국원 → 소통개발국장(45대)",
    period: "2024.03 ~ 재직 중",
    desc: "3년 연속 학생자치 기구에서 활동하며 국원에서 국장이 됐습니다. 학우 대상 온라인 서비스 운영과 정보 전달 구조 개선, 웹 서비스 기획·관리를 맡고 있고, 복지 창구에서 직접 들은 불편이 총학생회 웹으로 이어졌습니다. 2026.01~03에는 중앙비상대책위원회 집행국원으로 학생자치 운영·공지 전달·행사·행정 업무를 맡았습니다.",
    ledTo: "아주대학교 총학생회 웹 서비스"
  },
  {
    org: "헬스 동아리 ‘득근득근’",
    logo: "/logos/muscleup.png",
    role: "회장",
    period: "2025.09 ~ 2026.05",
    desc: "동아리 운영·회원 관리·운동 프로그램 기획을 맡아, 회원이 운동 습관을 이어가도록 활동 방향을 설계했습니다. ‘어떻게 다시 오게 만들까’ 라는 이 질문이 그대로 득근득근 서비스의 출발점이 되었습니다.",
    ledTo: "득근득근 (MuscleUp)"
  },
  {
    org: "코딩·디자인 동아리 ‘두잇’",
    logo: "/logos/doit.png",
    role: "부원",
    period: "2024.03 ~ 2024.06",
    desc: "디자인 협업 도구 Figma로 프레임 구성, 도형·텍스트 배치, 기본 UI 요소 제작 등 화면 설계 과정을 익혔습니다."
  },
  {
    org: "육군 제50보병사단 제121보병여단 3대대",
    logo: "/logos/army.png",
    logoFill: true,
    role: "만기 전역",
    period: "2021.12 ~ 2023.06",
    evidence: "바탕 화면/기타파일/기타/전역증.pdf · 훈련확인증.png",
    desc: "군 복무를 마치고 만기 전역했습니다."
  },
  {
    org: "제25대 정보통신대학 학생회 ‘FIT’",
    logo: "/logos/fit.png",
    role: "대외소통국원",
    period: "2021.03 ~ 2021.12",
    desc: "학과·단과대 학생 대상 공지 전달과 홍보 콘텐츠 제작, 대외 소통 업무를 수행했습니다."
  }
];

// ─── 근무 경험 ────────────────────────────────────────────────────────────────
// 개발 이력과 섞지 않는다. 다만 **헬스장 근무는 득근득근의 도메인 근거**라서 뺄 수 없다.

// ─── Awards ───────────────────────────────────────────────────────────────────
// 2026-09-05 에 사용자 PC 에서 찾은 증서 두 장이 근거다. 예전엔 이력서 어디에도
// 수상·수료 항목이 없었다 — 있는 걸 안 적은 것이지 없던 게 아니다.
// 결과 증빙이 없는 것(GEEKS 2024 글로벌 게임 챌린지 신청서, 모각소 2024 하계·
// 2025 하계 신청서/보고서 양식)은 적지 않았다 — `PENDING_BEFORE_SUBMIT` 에 있다.
// 상장 사진에는 팀원 실명이 있다 — 리포·사이트에 올리지 않는다.

export const awards: AwardItem[] = [
  // 최신순. 종이에서는 이 순서 그대로 나간다.
  {
    kind: "수료",
    title: "혁신 아이디어 MVP 기획 공모전(Zero to One) 수료",
    org: "블레이버스 주최",
    // 로고 둘(blaybus·startupcode)은 우수상 상장 PDF 에 박힌 이미지를 그대로 뽑은 것.
    logo: "/logos/blaybus.png",
    date: "2026.03.16",
    team: "득근득근",
    ledTo: "득근득근 (MuscleUp)",
    evidence:
      "바탕 화면/정재훈의 포트폴리오 모음집/수료증 및 증거/혁신 아이디어 MVP 공모전_수료증-정재훈.pdf · 인증번호 A0057-00002 · 진행 2026.02.26~03.07"
  },
  {
    kind: "수상",
    title: "비즈니스 아이디어 공모전 우수상",
    org: "스타트업코드 · 블레이버스 주최",
    // 스타트업코드 워드마크(startupcode.png)는 9:1 이라 56px 원에서 실선으로만
    // 보인다. 공동 주최인 블레이버스 로고를 쓴다.
    logo: "/logos/blaybus.png",
    date: "2025.05.14",
    team: "데모션 (3인)",
    // 같은 공모전의 "참가 수료증"도 있지만 따로 줄을 만들지 않는다 — 우수상이
    // 참가를 포함하고, 나란히 적으면 채우기로 읽힌다.
    evidence:
      "바탕 화면/정재훈의 포트폴리오 모음집/수료증 및 증거/[비즈니스아이디어공모전]우수상_데모션.pdf · 인증번호 B026-00004 · 참가 수료증(정재훈) 같은 폴더"
  },
  {
    kind: "수상",
    title: "2024 동계 모각소 장려상",
    org: "아주대학교 SW융합교육원",
    logo: "/logos/ajou.png",
    logoFill: true,
    // 상장에 수여일이 안 보인다(사진). 증서 번호 제2025-127호, 사진 촬영 2025-03-12.
    date: "2025.03",
    team: "현재민보 (4인)",
    evidence:
      "바탕 화면/정재훈의 포트폴리오 모음집/수료증 및 증거/KakaoTalk_20250312_145126267.jpg · 제2025-127호 · 수여일은 원본 상장에서 확인할 것"
  },
  {
    kind: "수상",
    title:
      "미디어데이 미디어 시제품 콘텐츠 경진대회 우수상 (디지털미디어학과장상)",
    // 상장 발행처. 패널에는 "지식재산융합인재양성사업" 이 같이 적혀 있다(evidence).
    org: "아주대학교 디지털미디어학과",
    logo: "/logos/ajou.png",
    logoFill: true,
    date: "2024.12.05",
    team: "정재훈 · 이민훈 (2인)",
    ledTo: "아주대탐험",
    evidence:
      "바탕 화면/정재훈의 포트폴리오 모음집/수료증 및 증거/KakaoTalk_20241205_181441149_02.jpg (상장·우수상 패널 사진, 상금 500,000원) · 발표 pptx: 바탕 화면/2024 2학년 2학기/정재훈, 이민훈 공모전 대회.pptx"
  }
];

// ─── 자격증 ───────────────────────────────────────────────────────────────────
// 증서 원본이 근거다(2026-09-11 확인). 예전엔 이력서 어디에도 자격증 칸이 없었다 —
// 있는 걸 안 적은 게 아니라 그날 딴 것이라 자리 자체가 없었다.
//
// 순서는 최신순이 아니라 **무게순**이다. 둘 다 같은 날(09.11) 합격이라 날짜로는
// 안 갈리고, 국가기술자격(정보처리기사)이 국가공인 민간자격(SQLD)보다 먼저 읽힌다.
//
// 증서 파일은 리포에 넣지 않는다 — 취득사항 확인서에는 집 주소와 생년월일이 있다.

export const certifications: CertificationItem[] = [
  {
    name: "정보처리기사",
    // 증서 명의는 과학기술정보통신부이고, 한국산업인력공단 이사장이 위탁받아
    // 확인·발급한다. 서류에서 통용되는 쪽(공단)을 적고 명의는 evidence 에 남긴다.
    org: "한국산업인력공단",
    // 자격증 상단의 **국가기술자격 엠블럼**(오얏꽃). 공단 CI 가 아니라 자격 자체의
    // 표식이라 `grade` 와 짝이 맞는다 — 위키미디어·공식 사이트 어디에도 공단 로고가
    // 깨끗하게 없었고, 증서 배경에서 뽑아 무늬를 지우고 대비만 올렸다(형태는 원본).
    logo: "/logos/hrdk.png",
    // 엠블럼 자체가 원형이라 원을 꽉 채운다(아주대 엠블럼과 같은 이유).
    logoFill: true,
    grade: "국가기술자격",
    date: "2026.09.11",
    evidence:
      "바탕 화면/정재훈의 포트폴리오 모음집/자격증/0-20260911091651266.pdf (자격증) · 3-20260911092029460.pdf (취득사항 확인서) · 자격번호 26202101324W · 2026년 2회 실기 · 합격·발급 모두 2026-09-11 · 과학기술정보통신부 명의(한국산업인력공단 위탁 발급)"
  },
  {
    name: "SQL 개발자 (SQLD)",
    org: "한국데이터산업진흥원",
    // 자격증 상단의 Kdata 워드마크 — PDF 에 박힌 이미지 원본을 그대로 키운 것.
    // 워드마크라 `logoFill` 은 켜지 않는다(켜면 좌우가 잘린다).
    logo: "/logos/kdata.png",
    grade: "국가공인",
    date: "2026.09.11",
    evidence:
      "바탕 화면/정재훈의 포트폴리오 모음집/자격증/noname.pdf · 자격번호 SQLD-062024417 · 유효기간 2026.09.11~2028.09.11 (갱신 필요)"
  }
];

export const workExperience: WorkItem[] = [
  {
    place: "헬스장 인포",
    period: "2025.12 ~ 2026.04",
    desc: "아침 6시 근무. 회원 응대·출입 관리·시설 및 운동 공간 관리. 득근득근을 만드는 동안 매일 그 사용자들을 마주한 자리입니다."
  },
  {
    place: "노래방",
    period: "2025.03 ~ 2025.08",
    desc: "방 관리·고객 응대·기기 점검 및 간단한 고장 처리."
  },
  {
    place: "편의점 (야간)",
    period: "2021.08 ~ 2021.11",
    desc: "야간 단독 근무. 매장 관리·고객 응대·재고 정리·계산."
  }
];

// ─── Main Projects ────────────────────────────────────────────────────────────
// 기간·역할·팀은 `resume/jeong-jaehun-resume.md` 기준. 원본에 없으면 비운다.

export const mainProjects: MainProjectCard[] = [
  {
    // 이 사이트 자체. 2026-09-03 에 대표 다섯 번째로 넣었다(교체가 아니라 추가).
    // 심사자가 지금 보고 있는 화면이 곧 증거라, 다른 카드처럼 링크를 눌러야
    // 확인되는 것과 층이 다르다.
    //
    // **제목이 "3D 마을" 이면 게임 직무로 읽힌다.** 무기는 관리자 입력 → 마을
    // 상태 → AI NPC 로 이어지는 데이터 파이프라인이고 3D 는 표현층이다. 그래서
    // 제목은 "AI 포트폴리오 마을", 부제 앞머리는 "관리자가 적은" 으로 시작한다.
    id: "village-portfolio",
    featured: true,
    hero: true,
    title: "AI 포트폴리오 마을 (이 사이트)",
    subtitle:
      "관리자가 적은 오늘의 활동이 3D 마을의 불빛과 AI NPC 대화로 바뀌는, 살아 있는 포트폴리오",
    category: "web",
    facets: ["ai", "3d"],
    status: "운영중",
    tags: ["FullStack", "Next.js", "FastAPI", "AI"],
    // 첫 커밋 2026-06-26 "기본적인 세팅 추가". 2026-06 이후 커밋은 전부 본인.
    period: "2026.06 ~ 진행 중",
    team: "개인 개발",
    role: "Next.js 프론트 · FastAPI 백엔드 · 관리자 페이지 · OpenAI NPC(규칙 폴백) · Claude Agent SDK 공방 · 3D 성능 예산",
    // 사용자 수가 없는 프로젝트다. FestFlow 에서 "코드량은 능력으로 읽히지
    // 않는다" 며 뺀 기준이 있으므로, **판단의 흔적**(첫 화면을 3D 없이 215KB 로
    // 지킨 것)을 1순위에 두고 API·테스트 수는 규모 근거로 뒤에 둔다.
    // 63 은 backend/app/main.py 의 라우트 수, 258 은 backend/tests 의 test 함수 수.
    metrics: [
      {value: "215 KB", label: "첫 화면 JS · 3D 모델 0개"},
      {value: "65", label: "공개·관리자 API"},
      {value: "258", label: "백엔드 테스트"}
    ],
    metricsSource: "저장소 소스 기준 · 첫 화면 무게는 빌드 청크 실측 (2026.09)",
    richId: "village-portfolio",
    // 카드 그림은 콘셉트 아트(2026-09-04, 본인 선택). 실제 화면 합성본(card.webp,
    // scripts/build-village-card.mjs)은 파일로 남겨 두었다 — 상세 페이지의 실물
    // 캡처가 그 역할을 하고, 목록에서는 그림 한 장이 더 강하다. 2:1 원본이라
    // 2.08:1 상자에서 위아래 2% 만 잘린다.
    image: "/projects/village-portfolio/card-art.webp",
    // 배포 주소가 정해지면 여기 "사이트" 링크를 하나 더 단다. 지금은 상대 경로라
    // 어디에 올라가든 같은 사이트의 마을로 간다.
    printTitle: "AI 포트폴리오 마을 (myPortfolio)",
    highlights: [
      "관리자 입력을 FastAPI 가 건물 밝기·NPC 기분으로 변환하고, NPC 대화는 OpenAI 로 생성하되 키가 없거나 실패하면 규칙 기반 대사로 폴백해 서비스가 멈추지 않게 했습니다.",
      "첫 화면은 three.js 를 전혀 싣지 않는 별도 라우트로 분리하고(JS 215KB · 3D 모델 0개), 마을은 마우스를 올리는 순간 미리 받습니다.",
      "의뢰 공방은 Claude Agent SDK 로 네 직군 에이전트가 산출물을 쓰되 진행 권한은 관리자 게이트 하나에만 두고 도구 호출은 콜백 샌드박스로 막았습니다. 유일한 공개 쓰기 경로는 허니팟·전용 레이트리밋·견적 상하한 클램프로 보호합니다."
    ],
    links: [
      {label: "사이트", href: "https://jaehun.co.kr"},
      {label: "3D 마을 열기", href: "/village"},
      {label: "GitHub", href: "https://github.com/toadsam/myPortfolio"}
    ]
  },
  {
    id: "muscleup",
    featured: true,
    title: "득근득근 (MuscleUp)",
    // 예전 부제는 "인증·보안·배포까지 설계한" 이었다. 그건 1.0 이야기다.
    // 이 프로젝트에서 가장 흉내 내기 어려운 건 기술 스택이 아니라
    // **사용자 말을 듣고 서비스 성격을 바꿨다**는 사실이라 그쪽을 앞에 세웠다.
    // 어순을 뒤집었다. 카드는 3초 안에 부제의 **앞 7글자만** 읽힌다. 예전 문장은
    // 그 자리를 "소개형 홈페이지"(가장 약한 사실)가 쓰고 있었고, 무기인
    // "사용자 말을 듣고 방향을 바꿨다"가 20자 뒤에 있었다. 내용은 그대로다.
    subtitle:
      "사용자 피드백을 듣고 소개형 홈페이지를 운영형 플랫폼으로 다시 만든 피트니스 커뮤니티",
    category: "web",
    // 캐릭터 레벨·티어·진화·랭킹 = 게임 장치, AI 인바디 상담(OpenAI), Socket.IO 실시간
    facets: ["game", "ai", "realtime"],
    status: "운영중",
    // Realtime 을 추가했다 — Socket.IO 실시간 서버가 2.0 의 핵심인데 태그에 없었다.
    tags: ["FullStack", "JWT", "Realtime", "AWS"],
    // 본인 확인(2026-09-07): 개발·운영 참여는 2026.06 까지. 9월 push 는 정리본 업로드라 기간에 안 넣는다.
    period: "2025.09 ~ 2026.06",
    team: "개인 개발 (1.0 → 2.0)",
    // aClub 의 "2025 프론트 3인 → 2026 프로젝트장" 과 같은 문법.
    // 한 프로젝트 안에서 단계가 갈렸다는 걸 이 한 줄이 말해 준다.
    role: "1.0 기획 · UI · API · 인증/권한 · 배포 → 2.0 운영 관점 전면 개편",
    // 임시로 박아 뒀던 "누적 가입자 120 · 운동 기록 1,400" 을 지웠다.
    // 근거가 없던 숫자고, 본인 확인 결과 실제 이용 회원은 약 50명이다.
    // 배포 도메인은 musclehub.co.kr 이다. 오래 muscle-up.click 으로 알고 있어
    // "일시 중단" 이라 적고 링크를 빼 뒀는데, 주소가 틀렸던 것이지 서비스가
    // 내려갔던 게 아니다(2026-09-05 확인 — 200, 첫 화면이 카드 그림과 같다).
    // "4 → 8" 은 1.0 발표자료의 도메인 4개(사용자/커뮤니티/AI/프로그램)와
    // 지금 소스에서 센 8개를 나란히 둔 값이다. 성장을 문장이 아니라 숫자로 보이게.
    // 순서와 구성을 바꿨다. 부제가 "사용자 피드백을 듣고" 로 시작하는데 지표
    // 셋 중 어느 것도 그걸 증명하지 않았다 — 카드가 스스로 한 말을 못 받치고 있었다.
    //
    // `28 백엔드 Controller` 는 지웠다. FestFlow 에서 "코드량은 능력으로 읽히지
    // 않는다"며 뺀 것과 같은 종류인데 여기만 남으면 기준이 카드마다 달라진다.
    // 상세 전시실에는 그대로 있다.
    //
    // `3 / 4` 는 P02Evolution 의 CHANGES — 1.0 발표자료 p.24 에 적힌 사용자 말 넷과
    // 2.0 에서 한 일이 1:1 로 맞물려 있고, **넷 중 셋만 했다**. 그 "안 한 하나" 를
    // 숨기지 않는 것이 나머지 셋을 믿게 만든다(P02Evolution 주석과 같은 판단).
    // `약 50명` 은 지우지 않고 3순위로 내렸다 — 정직한 숫자지만 첫인상 자리는 아니다.
    metrics: [
      {value: "3 / 4", label: "반영한 사용자 피드백"},
      {value: "4 → 8", label: "도메인 (1.0 → 2.0)"},
      {value: "약 50명", label: "이용 회원"}
    ],
    metricsSource:
      "피드백 3/4 는 1.0·2.0 발표자료 대조 · 회원 수는 본인 집계 · 도메인은 저장소 소스 기준",
    richId: "muscleup",
    // 목록 카드는 심사자가 가장 먼저 보는 그림이다. 그래서 두 번 갈아탔다.
    //
    // ① `/projects/muscleup.webp` — 1.0 랜딩의 AI 목업. 확대하면 한글이 깨져 있었다.
    // ② `v2/home-todo.webp` — 2.0 실제 캡처이긴 한데 **로그아웃 상태**였다.
    //    화면에 "캐릭터 준비 중 · 로그인 후 캐릭터가 표시됩니다", 연속 출석 0일,
    //    오늘 상태 대기, 이번 주 0/7 이 찍혀 있다. 원페이지는 같은 이유로 이걸
    //    이미 히어로에서 걷어냈는데(richContent/data.ts `muscleup.heroImage` 주석)
    //    **카드만 계속 쓰고 있었다** — 운영형 플랫폼이라 말하면서 첫 그림이
    //    아무도 안 온 화면이었다.
    // ③ 지금: `v2/home-lobby.webp` — 로그인 상태 로비. 브랜드·태그라인·CTA 와
    //    함께 살아 있는 카운터(라운지 누적 25 · 오늘 출석 1 · 3대 합 8,605kg)가
    //    같이 찍혀 있다. 2:1 로 잘려 있어 카드 그림 상자(2.08:1)와도 맞는다.
    image: "/projects/muscleup/v2/home-lobby.webp",
    highlights: [
      "운동 기록·커뮤니티·AI 코칭을 한 사용자 흐름으로 묶고, Access/Refresh 토큰을 HttpOnly 이중 쿠키로 분리했습니다.",
      "Refresh Token Rotation 이 병렬 요청에서 서로의 토큰을 무효화해 로그아웃되는 경쟁 상태를 만나, 클라이언트 재발급 단일화(single-flight)로 대체했습니다.",
      "AWS 배포에서 HTTPS·Mixed Content·CORS credentials 문제를 해결해 운영 상태로 완성했고, 1.0 사용자 피드백 4건 중 3건을 2.0 에 반영했습니다."
    ],
    // 링크 순서는 심사자가 누를 확률 순이다 — 돌아가는 서비스가 먼저다.
    links: [
      {label: "서비스 열기", href: "https://musclehub.co.kr"},
      {label: "GitHub", href: "https://github.com/toadsam/Ajou_MuscleUp"},
      {
        label: "시연 영상",
        href: "https://youtu.be/0X-BIADC1eQ"
      }
    ]
  },
  {
    id: "aclub",
    featured: true,
    title: "aClub",
    // 예전 문장은 "…를 목표로 만든" 으로 끝났다. 나머지 셋이 전부 "했다" 인데
    // **가장 센 숫자(3,500 · 93.4%)를 가진 카드만 문장이 목표형**이었다. 지어낸
    // "문의 감소 40%" 를 걷어내며 낮춘 표현이라 이유는 옳았지만, 새 성과를 주장하지
    // 않고도 결과형으로 쓸 수 있다 — 기간·팀·GA4 는 이미 이 카드에 있는 사실이다.
    subtitle:
      "프론트 3인 중 한 명으로 시작해 총괄까지 맡은, 활성 사용자 3,500명의 동아리 운영 서비스",
    category: "web",
    facets: ["data"],
    // 2026-09-08 "완료" 로 내렸다. 2026.03 동아리 박람회까지 운영했고 모집이 끝나
    // 도메인(aclub.co.kr)을 닫았다(본인 확인). 닫힌 사이트에 "운영중" 뱃지와
    // "사이트" 링크가 남아 있으면 심사자가 가장 먼저 누르는 링크가 404 가 된다.
    // 지표(GA4 2026.01–03)는 운영 당시 실측이라 그대로 둔다.
    status: "완료",
    // 예전엔 총학 카드와 태그 4개가 **글자까지 똑같아서**, 훑는 사람 눈에 두 카드가
    // 같은 프로젝트로 보였다. 4장은 각각 다른 이유로 눌려야 하므로 축을 갈랐다 —
    // 이쪽은 「실측 규모 + 총괄」, 총학은 「운영자에게 권한을 넘긴 설계」다.
    tags: ["실사용 서비스", "GA4 개선", "프로젝트 총괄", "UX"],
    // 두 번 했다. 2025 는 프론트 3인 중 한 명, 그게 잘 되어서 2026 에
    // 프로젝트장을 맡아 개편했다 — 저장소가 둘인 이유다.
    // 본인 확인(2026-09-07): 2026.03 동아리 박람회까지 운영하고 손을 뗐다.
    period: "2025.01 ~ 2026.03",
    team: "2025 프론트 3인 → 2026 프로젝트장",
    role: "2025 Frontend 개발 → 2026 프로젝트 총괄 · 프론트 리드 · GA4 기반 개선",
    // 전부 GA4 실측이다(2026.01~03). 예전엔 "월 방문자 2,300 · 문의 감소 40%"
    // 라는 지어낸 숫자가 잠정 배지를 달고 화면에 나가고 있었다.
    metrics: [
      {value: "3,500", label: "활성 사용자"},
      {value: "8.8만", label: "조회수"},
      {value: "93.4%", label: "세션 참여율"}
    ],
    metricsSource: "Google Analytics 4 · 2026.01–03",
    richId: "aclub",
    // 카드 그림 상자는 2.08:1 인데 옛 `aclub.webp` 는 640×445(1.44:1)라
    // `object-fit: cover` 가 위아래를 크게 잘라 냈다. 이건 상자에 맞춰 만든
    // 2.08:1 합성본이다. 옛 파일은 원페이지 히어로가 아직 쓰고 있어 남겨 둔다.
    image: "/projects/aclub-cover.webp",
    highlights: [
      "동아리 정보를 공지·모집·행사·자료·신청 흐름으로 정리해 학생이 찾는 순서대로 화면을 다시 짰습니다.",
      "GA4 지표와 운영 문의를 근거로 정보 구조·CTA·링크 흐름·문구를 고쳤습니다. 2025 년 프론트 3인 중 한 명에서 2026 년 프로젝트 총괄·프론트 리드가 됐습니다."
    ],
    // "사이트"(aclub.co.kr) 링크는 뺐다 — 도메인을 닫아 404 다. 링크가 없으면
    // 라벨을 만들지 않는 게 이 파일의 규칙이다.
    links: [
      {label: "GitHub (2026 · 총괄)", href: "https://github.com/aClub2026/FE"},
      {
        label: "GitHub (2025 · 팀원)",
        href: "https://github.com/DBProject-24-2/DB_Project_FE"
      }
    ]
  },
  {
    id: "ajouchong",
    featured: true,
    // 다른 셋은 제품명(득근득근 / aClub / FestFlow)인데 이것만 조직 이름이라,
    // 훑는 사람에게 "총학생회 활동" 으로 읽히고 넘어갔다. 「만든 물건(웹) + 누구
    // 것(아주대 총학생회) + 실제로 떠 있음(도메인)」을 한 줄에 담는다.
    // 4장 중 공개 도메인이 있는 유일한 카드고, 도메인은 그 자체가 살아 있다는 증거다.
    title: "아주대 총학생회 웹 (ajouchong.com)",
    // 1차는 "정보를 한곳에 모았다", 2차(2026.04 개편)는 "총학생회가 직접 고치게
    // 만들었다" 다. 뒤쪽이 운영형 서비스에서 훨씬 어려운 일이라 부제에 세웠다.
    // 득근득근과 같은 이유로 어순을 뒤집었다. "정보를 한곳에 모았다"는 흔한 일이라
    // 앞자리를 줄 수 없고, 앞에 서야 하는 건 개발자를 빼도 굴러가게 만든 쪽이다.
    subtitle:
      "총학생회가 개발자 없이 직접 고칠 수 있게 만든, 흩어진 학생회 정보 통합 서비스",
    category: "web",
    status: "운영중",
    tags: ["운영자 도구", "대여·링크허브", "모바일 개편", "Spring Boot API"],
    period: "2025.03 ~ 진행 중",
    // 2026-09-04 사실 대조: 2025 는 프론트 3인 중 한 명(화면 일부), 2026.04 부터는
    // 혼자 맡아 프론트·백엔드 API·배포를 다 했다(org 저장소 두 곳의 PR 이 증거).
    // "1차/2차" 대신 연도로 적는다 — 시점이 곧 역할의 경계라서.
    team: "2025 프론트 3인 → 2026 단독 담당",
    role: "2025 프론트 화면 일부 → 2026 단독 담당: UI 전면 개편 · 대여사업 · 링크허브 · 관리자 화면 · Spring Boot API",
    // Search Console 실측. **검색 유입 기준**이라는 단서가 라벨에 반드시 붙어야
    // 한다 — 전체 방문자로 읽히면 과장이 된다.
    //
    // 예전엔 `34,200 · 1,080 · 3.2%` 였다. 셋끼리는 앞뒤가 맞아서 오래 살아남았는데
    // (34,200 × 3.2% ≈ 1,080), **어느 것도 이 사이트의 값이 아니었다.** 실적 화면을
    // 열어 보니 16개월 최대 범위(GSC 상한)에서도 노출이 1.23만이라, 34,200 이 나오는
    // 기간 자체가 존재하지 않는다. 「더 넓은 속성이겠지」로도 설명이 안 된다 —
    // 그랬다면 클릭도 같이 커야 하는데 옛 값은 클릭이 오히려 **적었다**.
    // 실측은 오히려 더 좋다: CTR 13.8%(옛 값의 4배), 평균 게재순위 6.7.
    // 아래 셋은 GSC 내보내기 엑셀 487일치(2025-05-01~2026-08-30) 실합계다 —
    // 화면 타일의 `1.23만 · 1.69천` 은 유효숫자 3자리 반올림이라 그대로 쓰지 않는다.
    metrics: [
      {value: "12,314", label: "검색 노출"},
      {value: "1,694", label: "검색 클릭"},
      {value: "13.8%", label: "검색 CTR"}
    ],
    // "검색 유입 기준" 을 명시한다. 전체 방문자로 읽히면 과장이 된다 —
    // 스스로 범위를 좁히는 문장이라 오히려 정직하게 읽힌다.
    // **집계 기간도 반드시 남긴다** — 기간 없는 지표는 검산이 안 된다.
    metricsSource:
      "Google Search Console · 2025.05~2026.08(16개월) · 검색 유입 기준",
    richId: "ajouchong",
    image: "/projects/ajouchong.webp",
    // 2026 작업은 두 org 저장소 모두 main 이 아니라 develop 에 있다. 심사자가
    // 저장소 첫 화면(main)만 보면 2025 커밋 5개밖에 못 찾는다 — 그래서 PR 을 직접
    // 건다. #36 전면 디자인 개편(+2,547줄), #70 대여·링크 API(+644줄), 둘 다 본인 PR.
    highlights: [
      "학생은 물품이 남았는지 몰라 학생회실까지 와서야 없다는 말을 들었고, 수량·링크 하나 바꾸는 데도 개발자가 배포해야 했습니다. Spring Boot 로 대여 품목·대여 기록·링크 엔티티와 사용자/관리자 API 를 만들어(수량 조정은 서버가 0 미만·총량 초과 거부, 관리자 API 는 ADMIN 권한만) 총학생회가 개발자 없이 직접 고치게 했습니다.",
      "링크허브 한 페이지로 인스타 프로필 링크 한도를 우회하고 모바일 첫 화면에 여섯 갈래를 폈습니다. 2026.09 기준 대여 품목 10종·링크 11개가 실서비스에서 운영 중입니다."
    ],
    links: [
      {label: "사이트", href: "https://ajouchong.com"},
      {
        label: "GitHub",
        href: "https://github.com/ajouchong-dev/ajouchong-web"
      },
      {
        label: "개편 PR (프론트 · 2026)",
        href: "https://github.com/ajouchong-dev/ajouchong-web/pull/36"
      },
      {
        label: "대여·링크 API PR (백엔드 · 2026)",
        href: "https://github.com/ajouchong-dev/ajouchong/pull/70"
      }
    ]
  },
  {
    id: "festflow",
    featured: true,
    title: "FestFlow",
    // "~를 위한 시스템" 은 **만들었다**는 뜻일 뿐이고, 이 프로젝트에서 가장 센
    // 사실은 **실제로 돌았다**는 것이다(아주대 대동제 2026.05, AI Match 1일 운영).
    // 4장 중 실사용 현장 기록이 있는 유일한 카드인데 그 말이 카드에 없었다.
    subtitle:
      "아주대 대동제에서 하루 동안 실제 운영한 축제 부스·매칭 관리 시스템",
    category: "web",
    // AI 챗봇·혼잡 예측(RandomForest)·AI Match, SSE 7채널, 운영 집계
    facets: ["ai", "realtime", "data"],
    // 2026-09-08 본인 확인: 지금도 운영 중이고 리뉴얼 예정. period 는 개발 기간이라
    // 그대로 둔다. 공개 URL 이 없어 히어로 "운영 중 서비스" 카운트에는 안 들어간다 —
    // 주소가 생기면 links 에 "사이트" 를 달면 자동으로 센다.
    status: "운영중",
    renewal: true,
    // 여기만 순수 기술 나열이라 다른 3장과 축이 어긋나 있었다. 맨 앞에 성격
    // 태그를 세우고 기술은 뒤로 — scikit-learn(혼잡 예측)은 role 줄에 남아 있다.
    tags: ["현장 운영", "실시간(SSE)", "Spring Boot", "PWA"],
    period: "2026.04 ~ 2026.06",
    team: "개인 개발",
    role: "사용자·관리자 기능 전체 구현 (React · Spring Boot · JWT · SSE · PWA) · 혼잡 예측 모델 연동",
    // 예전 지표는 "SSE 7 채널 · 백엔드 컨트롤러 26" 이었다. 둘 다 저장소에서 실제로
    // 센 값이라 틀린 건 아니지만, **코드량은 심사자에게 능력으로 읽히지 않는다** —
    // 사람이 쓴 흔적이 있는데도 4장 중 첫 인상이 가장 약한 카드가 되어 있었다.
    // 셋 다 현장 실측이다(전용 전시실 P01Hero 타일 · P11Field 와 같은 출처).
    // 기술 숫자는 버린 게 아니라 상세로 내려갔다.
    metrics: [
      {value: "169명", label: "AI Match 등록자"},
      {value: "424건", label: "매칭 신청"},
      {value: "36건", label: "성사 매칭"}
    ],
    metricsSource: "아주대 대동제 2026.05 · AI Match 1일 현장 운영 집계",
    richId: "festflow",
    // 현장 캡처 합성본(`festflow-field.webp`, scripts/build-festflow-card.mjs)으로
    // 한 번 갈아탔다가 이 소개 이미지로 되돌렸다. 부제·지표가 이미 "실제로 돌았다"를
    // 말하고 있으므로, 그림까지 같은 말을 반복하는 것보다 **제품이 어떻게 생겼는지**
    // 보여 주는 편이 카드 한 장에 담기는 정보가 넓다는 판단이다(본인 결정).
    // 현장 캡처본은 지운 게 아니라 public/projects/festflow-field.webp 에 남아 있다 —
    // 쓰고 싶어지면 이 줄만 바꾸면 되고, 원본이 바뀌면 스크립트로 다시 뽑는다.
    //
    // 다만 이 그림은 **데모 데이터 화면**이다("총 방문자 12,345" 는 가상값이고,
    // 화면 안에 DEMO 배지가 붙어 있다). 카드 크기(≈340px)로 줄면 배지 글자는
    // 뭉개지고 숫자만 읽히므로, 바로 아래 지표 줄의 실측값(169·424·36)과
    // 섞여 보일 수 있다. 지표에 출처를 명시해 둔 이유이기도 하다.
    image: "/projects/festflow.webp",
    highlights: [
      "React(Vite)+Tailwind PWA, Spring Boot 3/JPA/Security/JWT, MySQL 구조로 사용자 기능과 관리자 API 를 분리했습니다.",
      "SSE 기반 혼잡도·공연·공지 스트림, 관리자 CRUD/CSV 업로드, KPI/감사 로그, GPS 기반 혼잡도 계산, 분석 API 까지 운영형 구조로 구현했습니다.",
      "2026.05 아주대학교 대동제에서 AI Match 를 1일간 실제 운영했습니다(QA 참여 46명)."
    ],
    links: [{label: "GitHub", href: "https://github.com/toadsam/FestFlow"}]
  },
  {
    id: "tserof",
    // 2026-09-05 대표 여섯째로. 배열 순서가 곧 격자 순서다 — 2단 표지(tier-divider)는
    // "첫 비대표 카드" 앞에 끼워지므로 대표는 반드시 비대표들보다 앞에 있어야 한다(처음엔
    // featured 만 켜고 자리를 안 옮겨 표지 아래에 그려졌다). 히어로 띠 다섯째 칸이 "Steam 출시 01" 인데 그
    // 게임이 접힌 목록에 있으면 숫자는 자랑하고 카드는 숨기는 꼴이었다. 첫 지원처가
    // 게임 회사(서비스 직군)라 "게임을 안에서 만들어 상점까지 올려 봤다" 는 신호가
    // 첫 화면에 있어야 한다. 자리는 **마지막** — 웹 다섯 + 게임 하나가 3열 두 줄에
    // 한 프레임으로 들어오고, 그 비율이 곧 서비스 직군 지원자의 비율이다. 게임을
    // 앞으로 당기면 "그럼 왜 서비스로 넣었나" 를 스스로 묻게 만든다.
    // 부제는 "레벨 디자인" 이 아니라 **기획→출시 완주**를 앞세운다 — 서비스 독자에게
    // 읽히는 건 릴리즈까지 간 경험이다. 4개월(2023.10–2024.02)·5인·부팀장은 상세
    // 전시실(richContent tserof.impact)에 같은 값이 있다 — 기간은 첫 커밋(2023.10.23)과
    // Steam 출시일(2024.02.10)이고, 예전 "2023.07–11 · 5개월" 은 근거가 없었다(2026-09-05
    // 교정, 2026-09-06 시작월 10월로 재교정). role 도 같은 날 실제 담당으로 고쳤다 —
    // 저장소 README 기여자 표 기준 플레이어는 박지원, 저장은 김어진, 본인은 스테이지 2·기믹·퍼즐.
    featured: true,
    title: "TSEROF",
    subtitle:
      "5인 팀 부팀장으로 기획부터 Steam 스토어 출시까지 4개월에 완주한 3D 액션 플랫폼 게임",
    category: "game",
    facets: ["3d"],
    status: "출시",
    tags: ["Unity", "GameDev", "3D", "Steam"],
    period: "2023.10 ~ 2024.02",
    team: "5인 팀 — 부팀장",
    role: "스테이지 2 · 장애물/기믹 · 3×3 퍼즐 구현 · 기획",
    metrics: [
      {value: "Steam", label: "스토어 출시"},
      {value: "4개월", label: "기획 → 출시"}
    ],
    metricsSource:
      "출시는 Steam 스토어 페이지 · 기간(2023.10–2024.02)은 첫 커밋과 Steam 출시일 · 담당은 저장소 README 기여자 표",
    richId: "tserof",
    image: "/projects/tserof.webp",
    // "Steam 출시" 라고 적어 놓고 정작 스토어 링크가 없었다.
    // 출시작이라는 주장은 눌러서 확인될 때만 무게가 있다.
    // GitHub(KimEoJin24/TSEROF) 링크는 2026-09-08 뺐다 — 팀장이 저장소를 비공개로
    // 돌렸고 되돌릴 수 없다(본인 확인). 404 링크는 없는 것보다 나쁘다. 팀원 계정의
    // 공개 사본 dlghdwns97/TSEROF_Code(README 에 기여자 이름)가 있지만 아직 안 건다.
    links: [
      {
        label: "Steam 스토어",
        href: "https://store.steampowered.com/app/2743860/TSEROF/?l=koreana"
      },
      {
        label: "플레이 영상",
        href: "https://www.youtube.com/watch?v=1Lm-lpVsmq8"
      }
    ]
  },
  {
    id: "mystock",
    title: "MyStock-Desk / MyWave",
    subtitle:
      "거래 기록 기반 포트폴리오 분석·AI 체크리스트와 자산 흐름 대시보드(MyWave)를 담은 투자 기록 서비스",
    category: "data",
    facets: ["ai"],
    status: "완료",
    // 2026-09-08 본인 확인: MyWave 리뉴얼 예정.
    renewal: true,
    tags: ["React", "Spring Boot", "AI", "Recharts"],
    team: "개인 개발 (풀스택 1인)",
    role: "도메인 설계 · 프론트 · 백엔드 전부",
    metrics: [{value: "13", label: "백엔드 도메인"}],
    // 마지막 남은 플레이스홀더였다. 실제 화면 캡처가 아니라 **소개용 키 아트**다.
    image: "/projects/mystock.webp",
    richId: "mystock",
    links: [{label: "GitHub", href: "https://github.com/toadsam/MyStock-Desk"}]
  },
  {
    id: "sign-language",
    title: "수어지교",
    subtitle:
      "수어 동작 영상을 보고 뜻을 익히는 학습 앱 (3D 아바타 제작은 팀원 담당)",
    category: "web",
    // 2026-09-08 본인 확인: 현재 운영 중이고 리뉴얼 예정.
    status: "운영중",
    renewal: true,
    tags: ["Spring Boot", "Firebase", "Expo", "React Native"],
    period: "2026.01 ~ 2026.05 · 파란학기제",
    team: "4인 (FE 1 · BE 2 · 3D 아바타 1)",
    role: "Expo/React Native 프론트 · Spring Boot 백엔드 · OAuth2/JWT/Firebase 인증",
    metrics: [{value: "30+", label: "학습 수어 단어"}],
    richId: "sign-language",
    // 그림이 없어 플레이스홀더 상자가 떠 있던 자리. 실제 앱 캡처가 아니라
    // **소개용 키 아트**다 — 화면을 그린 게 아니라 서비스가 무엇인지 말한다.
    image: "/projects/sign-language.webp",
    // 예전 라벨은 "웹 데모"(운영 서비스가 아니라는 뜻)였다. 2026-09-08 본인 확인으로
    // 운영 중이 되면서 "사이트" 로 — 이 라벨이 히어로 "운영 중 서비스" 를 세는 기준이다.
    links: [
      {label: "사이트", href: "https://toadsam.github.io/Sign-Language/home"},
      {label: "GitHub", href: "https://github.com/toadsam/Sign-Language"}
    ]
  },
  {
    id: "otherside-vr",
    // 상세(원페이지)는 2026-09-03 에 PDF 43–48쪽 + 저장소 코드로 새로 만들었다.
    richId: "otherside-vr",
    title: "The Other Side (VR)",
    subtitle: "XR Interaction Toolkit 기반 VR 공포 퍼즐 탈출 게임",
    category: "ar",
    status: "완료",
    tags: ["VR", "XR", "Unity"],
    // 기간·팀은 포트폴리오 PDF(정재훈이력서긴버전, 43쪽 개요 · 5쪽 연표) 기준
    // (2026-09-03 본인 확인). 팀 규모 4인은 본인 확인(2026-09-04) — AR 과 같은 팀원.
    period: "2025.04 ~ 2025.06",
    team: "4인 팀 (AR 과 같은 팀원)",
    role: "AI 몬스터 시스템 · 감지 로직 · 중앙 제어 구조 설계",
    image: "/projects/otherside-vr.webp",
    links: [{label: "GitHub", href: "https://github.com/kbwon/IMP_VR"}]
  },
  {
    id: "monsterpoint-ar",
    // 상세(원페이지)는 2026-09-03 에 PDF 49–55쪽 + 저장소 코드로 새로 만들었다.
    richId: "monsterpoint-ar",
    title: "INTO MONSTER POINT (AR)",
    subtitle: "AR Plane 스캔 기반 전투 공간 생성 슈터 데모 프로젝트",
    category: "ar",
    status: "완료",
    tags: ["AR", "Unity", "Shooter"],
    // 기간은 포트폴리오 PDF(49쪽 개요 · 5쪽 연표) 기준 (2026-09-03 본인 확인).
    // 팀 규모는 PDF 에 없어 비워 둔다 — 지어내지 않는다.
    period: "2025.03 ~ 2025.04",
    team: "4인 팀 (VR 과 같은 팀원)",
    role: "무기 제작 · 스폰 시스템 · 게임 루프 설계",
    image: "/projects/monsterpoint-ar.webp",
    links: [
      {
        label: "플레이 영상",
        href: "https://www.youtube.com/watch?v=9Lf2K1qBJ2E"
      },
      {label: "GitHub", href: "https://github.com/toadsam/IMP"}
    ]
  },
  {
    // 「아주분투」(ajou-adventure)와 **다른 게임이다.** 그쪽은 Phaser 3 로 만든
    // 2D 러너고, 이건 Unity 3D 액션 어드벤처다. 저장소도 Ajou_Mini_Game /
    // Ajou_IndiGame 으로 따로다 — 이름이 비슷해 한 번 섞을 뻔했다.
    id: "ajou-indigame",
    // **`richId: "ajou-adventure"` 를 달지 말 것.** projects.ts 의 `ajou-adventure` 는
    // 이 카드가 아니라 **아주분투**(Phaser 2D 러너)의 상세다 — 이름이 비슷해
    // 2026-09-03 에 실제로 잘못 연결했다가 상세를 열어 보고 되돌렸다. 아주대탐험의
    // 원페이지는 같은 날 `ajou-indigame` 으로 따로 만들었다(PDF 27–34쪽 +
    // 저장소 코드, 그림은 마을 전시실이 쓰던 /projects/ajou-adventure/ 의 것).
    richId: "ajou-indigame",
    title: "아주대탐험",
    subtitle:
      "1인칭↔탑다운 시점 전환과 랜덤 스킬 성장을 얹은 Unity 3D 액션 어드벤처",
    category: "game",
    status: "완료",
    tags: ["Unity", "C#", "NavMesh", "Roguelike"],
    // 지원서(2026-09-07)와 저장소 첫 커밋(2024.09.23) 기준. PDF 의 2024.08 은 근거가 약했다.
    period: "2024.09 ~ 2024.12",
    team: "개인 개발 (1인)",
    role: "게임 시스템 설계·구현 — 코어 루프 · 전투 AI · UI · 이벤트",
    // 카드는 **소개용 키 아트**로 간다(`ajou-indigame.webp`).
    //
    // 직전까지 `ajou-adventure.webp`(실제 인게임 캡처)를 걸고 있었다. 그건 원래
    // 아주분투 카드에 잘못 붙어 있던 걸 여기로 되돌린 것이었다 — 파일 이름이
    // 이 프로젝트(아주대"탐험")를 가리키는데
    // 하필 아주분투의 id 가 `ajou-adventure` 라서 이름만 보고 짝지어졌다.
    // 화면 내용이 증거다 — 3D 캠퍼스·체력바·포탈은 Unity 로 만든 이쪽이고,
    // 아주분투는 Phaser 3 2D 러너다. **이름이 아니라 그림을 보고 붙일 것.**
    //
    // 그 실제 캡처가 사라진 건 아니다 — 원페이지(`ajou/` 전용 뷰어)가
    // `/projects/ajou-adventure/` 폴더의 진짜 화면들을 그대로 쓴다.
    image: "/projects/ajou-indigame.webp",
    links: [
      {
        label: "플레이 영상",
        href: "https://www.youtube.com/watch?v=mtIiIWmrSdg"
      },
      {label: "GitHub", href: "https://github.com/toadsam/Ajou_IndiGame"}
    ]
  }
];

// ─── Sub Projects ─────────────────────────────────────────────────────────────
// 링크 URL 을 아직 확보하지 못했다. `links: []` 로 두면 라벨 자체가 안 그려진다 —
// 예전처럼 눌리지 않는 GitHub/Demo/Notion 라벨 25개를 띄우지 않기 위해서다.

export const subProjects: SubProjectCard[] = [
  {
    // 2026-09-12 공개. 요약 4번째 항목("AI 코딩 도구를 통제하면서 개발했습니다")의
    // **검증 가능한 근거**다 — 그 전까지는 ~/.claude/skills/ 안에만 있어서
    // 심사자가 확인할 방법이 없었다. 그림은 없다(없는 그림을 지어내지 않는다).
    title: "codebase-anatomy (Claude Code 스킬)",
    desc: "코드베이스를 실제 소스에서 읽어 인터랙티브 HTML 해부도를 만드는 스킬. 모든 구조적 주장에 file:line 증거를 요구하고, 추측으로 쓴 도표를 금지한다 (2026.08)",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam/codebase-anatomy"}
    ]
  },
  // 아래 둘은 주요 프로젝트에 있다가 내려왔다(2026-09-01). 만든 사실은 그대로고
  // **어느 칸에 두느냐만 바뀐다** — 주요 칸이 짧을수록 거기 있는 것들이 세진다.
  {
    title: "Ajou Campus Foodmap",
    desc: "세션 기반 OAuth 로그인과 맛집 등록 플로우를 구현한 캠퍼스 지도 서비스 (2024.10~12)",
    image: "/projects/foodmap.webp",
    links: [
      {label: "Client", href: "https://github.com/toadsam/pwd-week6-client"},
      {label: "Server", href: "https://github.com/toadsam/pwd-week6-server"}
    ]
  },
  {
    // 주요에서 내려왔다(2026-09-01). The Other Side (VR) 와 **같은 칸을 두고
    // 겹쳤다** — 둘 다 Unity 로 만든 3D 공포 팀 프로젝트라, 나란히 두면 심사자
    // 눈에는 한 사람이 비슷한 걸 두 번 한 것으로 읽힌다. 공포·Unity 자리는
    // VR/XR 까지 간 The Other Side 하나가 대표한다.
    title: "DarkLab",
    desc: "1인칭 탐색 기반 3D 공포 어드벤처 게임 프로토타입 (2024-1 학기 · 3인 — 프로그래밍 담당)",
    links: [{label: "GitHub", href: "https://github.com/toadsam/DarkLab"}]
  },
  {
    // 그림을 안 붙였다. 리포에 있는 "아주분투" 이미지는 전부 아주대탐험
    // 것이었다(위 mainProjects 주석 참고) — 없는 그림을 남의 것으로 채우지 않는다.
    title: "아주분투",
    desc: "캠퍼스를 네온 톤으로 재해석한 Phaser 3 기반 2D 러닝 게임 (발판 6종·낮/밤 전환)",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam/Ajou_Mini_Game"}
    ]
  },
  {
    title: "고양이로부터 지켜라",
    desc: "타워 디펜스 게임 1인 개발",
    image: "/projects/sub/cat-defense.webp",
    links: []
  },
  {
    title: "루탄의 카드 게임",
    desc: "덱 빌딩 카드 게임 개발",
    image: "/projects/sub/rutan-card.webp",
    links: []
  },
  {
    title: "내 꿈이 현실의 버그에 침식당하기 시작해서 위험해",
    desc: "잠든 개발자가 꿈속 코드 세계에서 버그를 해결하는 게임",
    image: "/projects/sub/dream-bug.webp",
    links: []
  },
  {
    title: "스파르타 던전 배틀 (Text 게임)",
    desc: "나만의 캐릭터를 생성하고, 그 캐릭터를 활용한 텍스트 게임",
    image: "/projects/sub/dungeon-battle.webp",
    links: []
  },
  {
    title: "Fossil Runner",
    desc: "섬에서 자원을 모아 성장하고, 용을 처치해 현실로 돌아가는 게임",
    image: "/projects/sub/fossil-runner.webp",
    links: []
  },
  {
    title: "MOVYDICK",
    desc: "이더리움 고래 활동 추적 및 매매 시점 예측 시스템 개발",
    image: "/projects/sub/movydick.webp",
    links: []
  },
  {
    title: "NovelKub",
    desc: "NPC 단서 수집 기반 살인사건 추리 게임",
    image: "/projects/sub/novelkub.webp",
    links: []
  },
  {
    title: "time rewinder",
    desc: "Godot 기반 퍼즐 게임 개발",
    image: "/projects/sub/time-rewinder.webp",
    links: []
  },
  {
    title: "불빛아래",
    desc: "AI 디자인을 적용한 3D 공포 게임",
    image: "/projects/sub/under-the-light.webp",
    links: []
  },
  {
    title: "경복궁을 지켜라",
    desc: "로블록스 기반으로 제작한 경복궁 복원 게임",
    image: "/projects/sub/gyeongbokgung.webp",
    links: []
  },
  {
    title: "페스트러너",
    desc: "곤충을 피해 도망가는 AR 기반 러너 게임",
    links: []
  }
];

// ─── Development Records ──────────────────────────────────────────────────────
// href 가 빈 카드는 화면에 그리지 않는다. 지금은 Algorithm 만 실제 URL 이 있다.

export const devRecords: DevRecord[] = [
  {
    title: "코딩 테스트 문제 풀이 기록",
    desc: "BaekjoonHub 로 백준 풀이를 자동 커밋해, C++ 문제 풀이 기록을 꾸준히 쌓고 있습니다.",
    href: "https://github.com/toadsam/Algorithm"
  },
  {
    title: "개발 기록",
    desc: "개발 중 인상 깊었던 문제와 배운 점, 그날의 고민을 짧게 정리합니다.",
    href: "" // TODO(사용자): 블로그 URL
  },
  {
    title: "개발 개념과 구조 학습 정리",
    desc: "핵심 개념과 구조를 중심으로 학습 내용을 정리합니다.",
    href: "" // TODO(사용자): Notion URL
  }
];

// ─── Values ───────────────────────────────────────────────────────────────────
// 형용사만 있으면 서류에서 가장 먼저 스킵된다. 근거는 전부 실제 프로젝트에서 왔다.

export const values: ValueItem[] = [
  {
    title: "소통",
    desc: "문의와 지표를 근거로 고칠 순서를 정합니다.",
    evidence:
      "총학생회·aClub 운영 문의를 흘려보내지 않고 GA4/GSC 지표와 함께 읽어, 정보 구조를 고칠 순서를 정했습니다."
  },
  {
    title: "협력",
    desc: "팀에서 맡은 몫을 출시까지 끝냅니다.",
    evidence:
      "TSEROF 5인 팀에서 부팀장으로 스테이지 2와 장애물·기믹을 맡아 출시까지 완주했습니다."
  },
  {
    title: "성실",
    desc: "알고리즘 풀이를 저장소에 계속 쌓습니다.",
    evidence:
      "BaekjoonHub 로 알고리즘 풀이를 별도 저장소에 지속 축적하고, 공개 저장소 44개를 관리하고 있습니다."
  },
  {
    title: "도전",
    desc: "주력 밖의 영역도 끝까지 만들어 봤습니다.",
    evidence:
      "웹 풀스택을 주력으로 하면서 Unity XR·AR, 수어 접근성 서비스처럼 낯선 영역까지 완성해 봤습니다."
  }
];

// ─── About / Contact ──────────────────────────────────────────────────────────

export const aboutMe = [
  "총학생회 웹의 관리자 화면과 FestFlow 현장 운영까지, 만든 기능을 실제로 쓰이는 데까지 가져갔습니다.",
  "배포 후 생기는 HTTPS·CORS 같은 문제를 로그/설정/네트워크까지 파고들어 해결해왔습니다.",
  "aClub 은 GA4 지표와 운영 문의를 근거로 정보 구조와 문구를 고쳤습니다.",
  "AI 기능은 모델 응답을 그대로 내보내지 않습니다. 진행 권한은 사람 쪽에 두고, 호출이 실패해도 규칙 기반 경로로 이어지게 만들었습니다.",
  "웹이 주력이지만, Unity XR 경험으로 인터랙션 영역도 다룰 수 있습니다."
];

export const contact = {
  message:
    "협업/인턴/프로젝트 제안 모두 환영합니다. 가장 빠른 연락은 이메일로 부탁드립니다.",
  email: "toadsam@naver.com",
  github: "https://github.com/toadsam"
};

// ─── 제출 전 채울 것 ──────────────────────────────────────────────────────────
//
// 두 종류가 섞여 있다.
//
// **(A) `provisional: true` 인 임시 숫자** — 실측하지 않은 값이라 화면에 "잠정"
// 꼬리표가 붙는다. 실제 수치로 바꾸고 `provisional: true` 줄을 지우면 끝이다.
//   1. muscleup   — 누적 가입자 120 · 누적 운동 기록 1,400
//   2. aclub      — 월 방문자 2,300 · 문의 감소 40%      (GA4 에서 확인)
//   3. ajouchong  — 월 방문자 5,800 · 공지 열람률 62%     (GA4 에서 확인)
//
// **(B) 아예 비어 있는 값** — 빈 값은 화면에 안 그려지므로 지금도 거짓은 아니다.
//   4. devRecords[1].href  — 개발 기록 블로그 URL
//   5. devRecords[2].href  — 개발 개념 정리 Notion URL
//   6. period 미확인       — mystock · ajou-adventure · otherside-vr
//                            · monsterpoint-ar
//                            (darklab 의 "2024-1 학기" 는 이력서 원본이 아니라
//                             richContent/data.ts 에 이미 있던 값이다. 한 번 확인해 주세요.)
//
// 값 하나만 넣으면 카드·원페이저에 바로 반영된다. 다른 파일은 손댈 필요 없다.
export const PENDING_BEFORE_SUBMIT = [
  "[잠정] muscleup: 누적 가입자 120 / 누적 운동 기록 1,400",
  "[잠정] aclub: 월 방문자 2,300 / 문의 감소 40%",
  "[잠정] ajouchong: 월 방문자 5,800 / 공지 열람률 62%",
  "[비어 있음] devRecords: 블로그 URL · Notion URL",
  "[비어 있음] period: mystock · ajou-adventure · otherside-vr · monsterpoint-ar",
  "[확인 요망] darklab period '2024-1 학기' — 이력서 원본이 아닌 data.ts 출처",
  "[확인 요망] awards: GEEKS 2024 글로벌 게임 챌린지(아주대탐험, 2024.11) — 신청서만 있고 결과 증빙 없음",
  "[확인 요망] awards: 아주대 모각소 2024 하계, 2025 하계 — 신청서/보고서 양식만 있고 수료 증빙 없음 (2024 동계는 장려상으로 확인)",
  "[확인 요망] awards: 2024 동계 모각소 장려상 수여일 — 상장 사진에 날짜가 안 보임(제2025-127호)",
  "[확인 요망] awards: 데모션(2025-1 미디어프로젝트, Demotion-BE 저장소) 이 프로젝트 목록에 없다 — 공모전 우수상의 실체"
] as const;
