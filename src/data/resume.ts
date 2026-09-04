// 면접관용 이력서(ResumeMode) 콘텐츠.
//
// ## 사실관계의 출처
//
// **`resume/jaehoon-jeong-resume.md`(본인이 쓴 이력서 원본)가 정답이다.**
// 기간·역할·팀 규모·외부 링크는 전부 거기서 가져왔고, 거기 없는 값은
// **지어내지 않고 비워 둔다**(`period`·`role` 이 없으면 화면에 그 줄이 안 그려진다).
// 예전에는 이 파일이 배포본(toadsam.github.io) 텍스트만 옮겨와서 기간도 역할도
// 없었고, 외부 링크는 전부 빈 문자열이라 "링크처럼 보이는데 안 눌리는" 라벨이
// 25개 떠 있었다. 링크가 없으면 라벨을 만들지 않는 게 이 파일의 규칙이다.
//
// 제출 전 확인할 값은 파일 맨 아래 `PENDING_BEFORE_SUBMIT` 에 모아 뒀다.

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export type ResumeCategory = "web" | "data" | "game" | "ar" | "ops";
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
}

/** 활동·경력 — 학력과 섞으면 "경력 없음"으로 읽힌다. */
export interface CareerItem {
  org: string;
  role: string;
  period: string;
  desc: string;
  /**
   * 이 활동이 어느 프로젝트로 이어졌는지. 이 이력서에서 가장 강한 사실은
   * **활동과 프로젝트가 같은 자리에서 나왔다**는 것이다 — 헬스 동아리 회장이자
   * 새벽 헬스장 근무자가 득근득근을 만들었고, 총학생회 국원으로 문의를 받던
   * 사람이 국장이 되어 그 웹서비스를 맡았다. 그 선을 화면에 그린다.
   */
  ledTo?: string;
}

/** 근무 경험(아르바이트). 개발 이력과 섞지 않고 따로 한 줄씩만 적는다. */
export interface WorkItem {
  place: string;
  period: string;
  desc: string;
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
  status: ProjectStatus;
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
   * PDF 이력서(`scripts/build-public-resume-pdf.mjs`)에만 쓰는 제목. 화면 제목에
   * 붙은 "(이 사이트)" 같은 꼬리는 종이 위에서는 뜻이 없다. 없으면 `title`.
   */
  printTitle?: string;
  /**
   * PDF 이력서의 성과 줄 2~3개. 화면 카드는 지표 타일과 전용 전시실이 말해 주지만
   * 종이에는 그 둘이 없으므로 "무엇을 어떻게 해서 어떻게 됐나"를 문장으로 적는다.
   * 출처는 `resume/jaehoon-jeong-resume.md` — 거기 없는 사실은 적지 않는다.
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

export const printSummary = {
  lead: "React와 Spring Boot를 중심으로 서비스 구현, 인증/보안, 배포 운영 이슈까지 직접 다루는 신입 개발자입니다. 기능을 만드는 데서 멈추지 않고 사용자 흐름, API 책임, 토큰/세션 유지, HTTPS/CORS 같은 운영 조건까지 확인해 실제 서비스로 닫는 개발을 지향합니다.",
  points: [
    {
      head: "서비스 전체 흐름을 구현합니다.",
      body: "화면, API, 인증, DB, 배포 환경을 따로 보지 않고 사용자가 실제로 지나가는 흐름 기준으로 설계합니다."
    },
    {
      head: "배포 후 드러나는 문제를 재현하고 고쳐 봤습니다.",
      body: "HTTPS, Mixed Content, CORS credentials, 토큰 재발급 경쟁 상태, 세션 저장소, SSE 연결처럼 프론트와 서버 설정을 함께 봐야 하는 문제를 다뤘습니다."
    },
    {
      head: "실사용 피드백과 지표로 고칩니다.",
      body: "GA4/GSC 지표와 운영 문의를 근거로 정보 구조, CTA, 링크 흐름, 문구를 개선했습니다."
    }
  ]
};

// ─── Skills ───────────────────────────────────────────────────────────────────

/** 머리글 칩. 아래 표가 자세히 말하므로 여기는 주력만 짧게. */
export const skillChips = [
  "HTML5",
  "CSS3",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Java",
  "Spring Boot",
  "MySQL",
  "AWS",
  "Unity",
  "C#"
];

export const skillDetails: SkillDetail[] = [
  {
    area: "Frontend",
    desc: "React/TypeScript 기반 SPA 설계 및 구현 — 컴포넌트 구조화, 상태 흐름 설계, API 연동",
    stack: [
      "React",
      "TypeScript",
      "Vite",
      "React Query",
      "Axios",
      "Tailwind CSS",
      "Expo",
      "React Native"
    ]
  },
  {
    area: "Backend",
    desc: "Spring Boot + JPA로 REST API 설계/구현",
    stack: [
      "Java",
      "Spring Boot",
      "Spring Security",
      "JPA",
      "REST API",
      "Node.js",
      "Express"
    ]
  },
  {
    area: "Auth",
    // stack 의 "Refresh Token Rotation" 은 남긴다 — 구현하고 운영에서 되돌리기까지
    // 해 본 기술이라 경험은 사실이다. 다만 desc 는 서비스의 현재 동작으로 읽히므로
    // 지금 실제로 도는 것(이중 쿠키 + 재발급 단일화)으로 적는다.
    desc: "JWT 인증/인가 · 이중 쿠키 + 재발급 단일화",
    stack: [
      "JWT",
      "Refresh Token Rotation",
      "OAuth2",
      "Passport",
      "Session",
      "Firebase Auth"
    ]
  },
  {
    area: "Infra / Data",
    desc: "AWS 배포 및 HTTPS / Mixed Content / CORS 해결",
    stack: [
      "AWS",
      "S3",
      "CloudFront",
      "HTTPS",
      "CORS",
      "SSE",
      "MySQL",
      "MongoDB",
      "Firebase"
    ]
  },
  {
    area: "Unity XR/AR",
    desc: "인터랙션 및 상태/AI 제어 경험",
    stack: [
      "Unity",
      "C#",
      "AR Foundation",
      "XR Interaction Toolkit",
      "NavMesh",
      "Object Pooling"
    ]
  }
];

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
    program: "디지털미디어학과 (전공)",
    period: "2021.03 ~ 2027.02 (예정)",
    desc: "웹/소프트웨어 엔지니어링 중심으로 학습하며 서비스 구조 설계와 구현 역량을 확장했습니다.",
    bullets: [
      "웹(React/Spring Boot) 중심 프로젝트 경험",
      "Unity XR/AR 프로젝트로 인터랙션 경험 확장"
    ]
  },
  {
    org: "아주대학교",
    program: "인공지능 융합학과 (복수전공)",
    period: "2021.03 ~ 2027.02 (예정)",
    desc: "AI/데이터 기반 개발 역량을 함께 확장하고 있습니다.",
    bullets: ["웹 개발과의 융합 관점으로 프로젝트 경험"]
  },
  {
    org: "아주대학교",
    program: "메타버스기획 마이크로전공 (부전공)",
    period: "2021.03 ~ 2027.02 (예정)",
    desc: "메타버스 플랫폼에서 상호작용 콘텐츠를 제작했습니다.",
    bullets: ["메타버스 플랫폼 콘텐츠 제작 경험"]
  },
  {
    org: "스파르타 내일배움캠프",
    program: "Unity 게임개발자 양성과정",
    period: "2023.09 ~ 2024.02",
    desc: "Unity 기반 게임 개발 역량을 확장했습니다.",
    bullets: ["Unity 기반 게임 개발 프로젝트 경험"]
  },
  {
    org: "구름(goorm)",
    program: "군장병 AI/SW 역량강화",
    period: "2023.03 ~ 2023.12",
    desc: "HTML, CSS, JavaScript에 대한 기초 감각을 익혔습니다.",
    bullets: ["프론트엔드 기초 감각 확장"]
  },
  {
    org: "코드잇",
    program: "대학생 코딩캠프",
    period: "2021.03 ~ 2021.04",
    desc: "프로그래밍에 대한 기초 이해와 웹 개발 전반에 대한 감각을 익혔습니다.",
    bullets: ["프로그래밍에 대한 기초 이해 확장"]
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
  // 정답 문서도 이걸 한 줄로 요약한다 — resume/jaehoon-jeong-resume.md 「Collaboration」.
  // 중앙비상대책위원회·FIT 학생회는 **다른 조직이라 합치지 않는다.** 합치면 사실이
  // 뭉개진다. 대수(제43~45대)와 승진 경로를 role 에 그대로 남겨 두었으므로,
  // 면접에서 어느 대에 무엇을 했는지 물으면 답이 화면에 이미 있다.
  //
  // 재직 여부: 지원서 표에는 `26.03.01~26.05.10` 으로 적혀 있지만 그건 작성 시점
  // 스탬프고, 본인 확인 결과 **지금도 재직 중**이다(2026-08-25).
  {
    org: "아주대학교 총학생회 (제43~45대)",
    role: "생활복지국원(43대) → 소통발전국원(44대) → 소통개발국장(45대)",
    period: "2024.03 ~ 재직 중",
    desc: "3년 연속 학생자치 기구에서 활동하며 국원에서 국장이 됐습니다. 학우 대상 온라인 서비스 운영과 정보 전달 구조 개선, 웹 서비스 기획·관리를 맡고 있고, 복지 창구에서 직접 들은 불편이 총학생회 웹으로 이어졌습니다.",
    ledTo: "아주대학교 총학생회 웹 서비스"
  },
  {
    org: "아주대학교 중앙비상대책위원회",
    role: "집행국원",
    period: "2026.01 ~ 2026.03",
    desc: "학생자치 운영, 공지 전달, 행사·행정 업무를 맡아 조직 내 협업과 책임 있는 업무 처리 경험을 쌓았습니다."
  },
  {
    org: "헬스 동아리 ‘득근득근’",
    role: "회장",
    period: "2025.09 ~ 2026.05",
    desc: "동아리 운영·회원 관리·운동 프로그램 기획을 맡아, 회원이 운동 습관을 이어가도록 활동 방향을 설계했습니다. ‘어떻게 다시 오게 만들까’ 라는 이 질문이 그대로 득근득근 서비스의 출발점이 되었습니다.",
    ledTo: "득근득근 (MuscleUp)"
  },
  {
    org: "코딩·디자인 동아리 ‘두잇’",
    role: "부원",
    period: "2024.03 ~ 2024.06",
    desc: "디자인 협업 도구 Figma로 프레임 구성, 도형·텍스트 배치, 기본 UI 요소 제작 등 화면 설계 과정을 익혔습니다."
  },
  {
    org: "육군 제50보병사단 제121보병여단 3대대",
    role: "만기 전역",
    period: "2021.12 ~ 2023.06",
    desc: "군 복무를 마치고 만기 전역했습니다."
  },
  {
    org: "제25대 정보통신대학 학생회 ‘FIT’",
    role: "대외소통국원",
    period: "2021.03 ~ 2021.12",
    desc: "학과·단과대 학생 대상 공지 전달과 홍보 콘텐츠 제작, 대외 소통 업무를 수행했습니다."
  }
];

// ─── 근무 경험 ────────────────────────────────────────────────────────────────
// 개발 이력과 섞지 않는다. 다만 **헬스장 근무는 득근득근의 도메인 근거**라서 뺄 수 없다.

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
// 기간·역할·팀은 `resume/jaehoon-jeong-resume.md` 기준. 원본에 없으면 비운다.

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
      {value: "63", label: "공개·관리자 API"},
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
    status: "운영중",
    // Realtime 을 추가했다 — Socket.IO 실시간 서버가 2.0 의 핵심인데 태그에 없었다.
    tags: ["FullStack", "JWT", "Realtime", "AWS"],
    period: "2025.09 ~ 진행 중",
    team: "개인 개발 (1.0 → 2.0)",
    // aClub 의 "2025 프론트 3인 → 2026 프로젝트장" 과 같은 문법.
    // 한 프로젝트 안에서 단계가 갈렸다는 걸 이 한 줄이 말해 준다.
    role: "1.0 기획 · UI · API · 인증/권한 · 배포 → 2.0 운영 관점 전면 개편",
    // 임시로 박아 뒀던 "누적 가입자 120 · 운동 기록 1,400" 을 지웠다.
    // 근거가 없던 숫자고, 본인 확인 결과 실제 이용 회원은 약 50명이다.
    // 배포 도메인(muscle-up.click)은 현재 일시 중단이라 링크하지 않는다.
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
    links: [
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
    status: "운영중",
    // 예전엔 총학 카드와 태그 4개가 **글자까지 똑같아서**, 훑는 사람 눈에 두 카드가
    // 같은 프로젝트로 보였다. 4장은 각각 다른 이유로 눌려야 하므로 축을 갈랐다 —
    // 이쪽은 「실측 규모 + 총괄」, 총학은 「운영자에게 권한을 넘긴 설계」다.
    tags: ["실사용 서비스", "GA4 개선", "프로젝트 총괄", "UX"],
    // 두 번 했다. 2025 는 프론트 3인 중 한 명, 그게 잘 되어서 2026 에
    // 프로젝트장을 맡아 개편했다 — 저장소가 둘인 이유다.
    period: "2025.01 ~ 진행 중",
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
    links: [
      {label: "사이트", href: "https://aclub.co.kr/"},
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
    status: "완료",
    // 여기만 순수 기술 나열이라 다른 3장과 축이 어긋나 있었다. 맨 앞에 성격
    // 태그를 세우고 기술은 뒤로 — scikit-learn(혼잡 예측)은 role 줄에 남아 있다.
    tags: ["현장 운영", "실시간(SSE)", "Spring Boot", "PWA"],
    period: "~ 2026.06",
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
      "2026.05 아주대학교 대동제에서 AI Match 를 1일간 실제 운영했습니다(QA 참여 15명)."
    ],
    links: [{label: "GitHub", href: "https://github.com/toadsam/FestFlow"}]
  },
  {
    id: "mystock",
    title: "MyStock-Desk / MyWave",
    subtitle:
      "거래 기록 기반 포트폴리오 분석·AI 체크리스트와 자산 흐름 대시보드(MyWave)를 담은 투자 기록 서비스",
    category: "data",
    status: "완료",
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
    status: "완료",
    tags: ["Spring Boot", "Firebase", "Expo", "React Native"],
    period: "2026.01 ~ 2026.05 · 파란학기제",
    team: "4인 (FE 1 · BE 2 · 3D 아바타 1)",
    role: "Expo/React Native 프론트 · Spring Boot 백엔드 · OAuth2/JWT/Firebase 인증",
    metrics: [{value: "30+", label: "학습 수어 단어"}],
    richId: "sign-language",
    // 그림이 없어 플레이스홀더 상자가 떠 있던 자리. 실제 앱 캡처가 아니라
    // **소개용 키 아트**다 — 화면을 그린 게 아니라 서비스가 무엇인지 말한다.
    image: "/projects/sign-language.webp",
    links: [{label: "GitHub", href: "https://github.com/toadsam/Sign-Language"}]
  },
  {
    id: "tserof",
    title: "TSEROF",
    subtitle: "출시·배포까지 완주한 3D 액션 플랫폼 게임 프로젝트",
    category: "game",
    status: "출시",
    tags: ["Unity", "GameDev", "3D", "Steam"],
    period: "2023.07 ~ 2023.11",
    team: "5인 팀 — 부팀장",
    role: "레벨 디자인 · 장애물/기믹 구현 · 기획",
    metrics: [{value: "Steam", label: "스토어 출시"}],
    richId: "tserof",
    image: "/projects/tserof.webp",
    // "Steam 출시" 라고 적어 놓고 정작 스토어 링크가 없었다.
    // 출시작이라는 주장은 눌러서 확인될 때만 무게가 있다.
    links: [
      {
        label: "Steam 스토어",
        href: "https://store.steampowered.com/app/2743860/TSEROF/?l=koreana"
      },
      {label: "GitHub", href: "https://github.com/KimEoJin24/TSEROF"},
      {
        label: "플레이 영상",
        href: "https://www.youtube.com/watch?v=1Lm-lpVsmq8"
      }
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
    period: "2024.08 ~ 2024.12",
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
    desc: "생각과 상황을 공유하며 방향을 맞춥니다.",
    evidence:
      "총학생회·aClub 운영 문의를 흘려보내지 않고 GA4/GSC 지표와 함께 읽어, 정보 구조를 고칠 순서를 정했습니다."
  },
  {
    title: "협력",
    desc: "역할을 존중하며 함께 더 나은 결과를 만듭니다.",
    evidence:
      "TSEROF 5인 팀에서 부팀장으로 레벨·기믹을 나눠 맡아 출시까지 완주했습니다."
  },
  {
    title: "성실",
    desc: "작은 기록과 반복을 통해 꾸준히 성장합니다.",
    evidence:
      "BaekjoonHub 로 알고리즘 풀이를 별도 저장소에 지속 축적하고, 공개 저장소 44개를 관리하고 있습니다."
  },
  {
    title: "도전",
    desc: "익숙함에 머무르지 않고 새로운 시도를 선택합니다.",
    evidence:
      "웹 풀스택을 주력으로 하면서 Unity XR·AR, 수어 접근성 서비스처럼 낯선 영역까지 완성해 봤습니다."
  }
];

// ─── About / Contact ──────────────────────────────────────────────────────────

export const aboutMe = [
  "작은 기능도 끝까지 다듬어 ‘운영 가능한 상태’로 만듭니다.",
  "배포 후 생기는 HTTPS·CORS 같은 문제를 로그/설정/네트워크까지 파고들어 해결해왔습니다.",
  "저는 운영과 사용자 소통까지 이어져야 비로소 ‘완성된 개발’이라고 생각합니다.",
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
  "[확인 요망] darklab period '2024-1 학기' — 이력서 원본이 아닌 data.ts 출처"
] as const;
