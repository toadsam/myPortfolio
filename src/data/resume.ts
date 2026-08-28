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

export interface HeroContent {
  name: string;
  roleTag: string;
  headlineLines: string[];
  bullets: string[];
}

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

export const hero: HeroContent = {
  name: "정재훈",
  roleTag: "Full-Stack (Web) · Unity XR Developer",
  headlineLines: ["웹을 주력으로,", "운영 문제까지 해결하는", "개발자 정재훈"],
  bullets: [
    "React · Spring Boot 기반 Full-Stack(Web) 개발",
    // 예전엔 "인증·보안(Refresh Token Rotation)" 이라고 적었다. 로테이션은
    // 2026-04-01 에 병렬 재발급 경쟁 상태 때문에 걷어냈고 지금 코드에 없다.
    // 대표 사례로 걸면 저장소를 연 사람이 찾다가 못 찾는다 — 겪은 문제 쪽으로 바꿨다.
    "인증·보안(JWT 이중 쿠키 · 토큰 재발급 경쟁 상태)과 운영 이슈(HTTPS·CORS) 해결 경험",
    "Unity XR·게임 개발 경험 보유"
  ]
};

export const heroSummary = "웹 주력 + 운영 이슈 해결 중심";

/** public/ 기준. 전화번호를 지운 사본이다(원본은 `resume/` 폴더). */
export const resumePdf = "/jeong-jaehoon-resume.pdf";

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
  {
    org: "제45대 아주대학교 총학생회 ‘어썸’",
    role: "소통개발국장",
    // 지원서 표에는 `26.03.01~26.05.10` 으로 적혀 있지만 그건 작성 시점 스탬프고,
    // 본인 확인 결과 **지금도 재직 중**이다(2026-08-25). 현직이라는 사실이
    // 지난 활동보다 훨씬 강하게 읽히므로 그대로 적는다.
    period: "2026.03 ~ 재직 중",
    desc: "학우 대상 온라인 서비스 운영, 정보 전달 구조 개선, 웹 서비스 기획·관리를 담당하고 있습니다. 개발 역량과 학생자치 운영 경험을 연결해 실사용자 중심의 서비스 개선을 수행하고 있습니다.",
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
    org: "제44대 아주대학교 총학생회 ‘아침’",
    role: "소통발전국원",
    period: "2025.01 ~ 2025.12",
    desc: "학우 대상 정보 전달과 온라인 콘텐츠 관리, 웹 서비스 개선에 참여했습니다. 사용자 반응을 근거로 정보 접근성과 소통 방식을 고쳤습니다.",
    ledTo: "아주대학교 총학생회 웹 서비스"
  },
  {
    org: "제43대 아주대학교 총학생회 ‘아우름’",
    role: "생활복지국원",
    period: "2024.03 ~ 2024.12",
    desc: "학우 복지 사업 운영과 안내 업무에 참여하며, 학생들이 실제로 무엇을 불편해하는지 창구에서 직접 확인했습니다."
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
    id: "muscleup",
    title: "득근득근 (MuscleUp)",
    // 예전 부제는 "인증·보안·배포까지 설계한" 이었다. 그건 1.0 이야기다.
    // 이 프로젝트에서 가장 흉내 내기 어려운 건 기술 스택이 아니라
    // **사용자 말을 듣고 서비스 성격을 바꿨다**는 사실이라 그쪽을 앞에 세웠다.
    subtitle:
      "소개형 홈페이지로 만들었다가, 사용자 피드백을 듣고 운영형 플랫폼으로 다시 만든 피트니스 커뮤니티",
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
    metrics: [
      {value: "약 50명", label: "이용 회원"},
      {value: "4 → 8", label: "도메인 (1.0 → 2.0)"},
      {value: "28", label: "백엔드 Controller"}
    ],
    metricsSource:
      "회원 수는 본인 집계 · 도메인/Controller 는 저장소 소스 기준",
    richId: "muscleup",
    image: "/projects/muscleup.webp",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam/Ajou_MuscleUp"},
      {
        label: "시연 영상",
        href: "https://www.youtube.com/watch?v=y6pbAoxveQM"
      }
    ]
  },
  {
    id: "aclub",
    title: "aClub",
    subtitle:
      "실사용 운영에서 ‘문의 감소·참여 동선 명확화’를 목표로 만든 운영형 웹 서비스",
    category: "web",
    status: "운영중",
    tags: ["WebService", "Operations", "UX", "Analytics"],
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
    image: "/projects/aclub.webp",
    links: [
      {label: "사이트", href: "https://aclub.co.kr/"},
      {label: "GitHub (2026)", href: "https://github.com/aClub2026/FE"},
      {
        label: "GitHub (2025)",
        href: "https://github.com/DBProject-24-2/DB_Project_FE"
      }
    ]
  },
  {
    id: "ajouchong",
    title: "아주대학교 총학생회",
    // 1차는 "정보를 한곳에 모았다", 2차(2026.04 개편)는 "총학생회가 직접 고치게
    // 만들었다" 다. 뒤쪽이 운영형 서비스에서 훨씬 어려운 일이라 부제에 세웠다.
    subtitle:
      "흩어진 학생회 정보를 한곳에 모으고, 총학생회가 개발자 없이 직접 고칠 수 있게 만든 운영형 웹 서비스",
    category: "web",
    status: "운영중",
    tags: ["WebService", "Operations", "UX", "Analytics"],
    period: "2025.03 ~ 진행 중",
    team: "총학생회 IT · 프론트 3인",
    // 득근득근과 같은 「1차 → 2차」 문법. 두 프로젝트가 같은 방향으로 자랐다.
    role: "1차 Frontend·정보 구조 설계 → 2차 모바일 동선 개편 · 운영자용 관리 화면 구축",
    // Search Console 실측. **검색 유입 기준**이라는 단서가 라벨에 반드시 붙어야
    // 한다 — 전체 방문자로 읽히면 과장이 된다.
    metrics: [
      {value: "34,200", label: "검색 노출"},
      {value: "1,080", label: "검색 클릭"},
      {value: "3.2%", label: "검색 CTR"}
    ],
    // "검색 유입 기준" 을 명시한다. 전체 방문자로 읽히면 과장이 된다 —
    // 스스로 범위를 좁히는 문장이라 오히려 정직하게 읽힌다.
    metricsSource: "Google Search Console · 검색 유입 기준",
    richId: "ajouchong",
    image: "/projects/ajouchong.webp",
    links: [
      {label: "사이트", href: "https://ajouchong.com"},
      {
        label: "GitHub",
        href: "https://github.com/ajouchong-dev/ajouchong-web"
      }
    ]
  },
  {
    id: "festflow",
    title: "FestFlow",
    subtitle: "대학 축제 운영자를 위한 실시간 부스 관리 시스템",
    category: "web",
    status: "완료",
    tags: ["React", "SSE", "Spring Boot", "PWA", "scikit-learn"],
    period: "~ 2026.06",
    team: "개인 개발",
    role: "사용자·관리자 기능 전체 구현 (React · Spring Boot · JWT · SSE · PWA) · 혼잡 예측 모델 연동",
    // "SSE 3" 으로 적혀 있었는데 StreamController.java 의 엔드포인트는 7개다.
    // 컨트롤러 26개도 저장소에서 센 값(*Controller.java).
    metrics: [
      {value: "7", label: "SSE 실시간 채널"},
      {value: "26", label: "백엔드 컨트롤러"}
    ],
    metricsSource: "저장소 소스 집계 · 2026.06 기준",
    richId: "festflow",
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
    richId: "mystock",
    links: [{label: "GitHub", href: "https://github.com/toadsam/MyStock-Desk"}]
  },
  {
    id: "foodmap",
    title: "Ajou Campus Foodmap",
    subtitle:
      "세션 기반 OAuth 로그인과 맛집 등록 플로우를 구현한 캠퍼스 지도 서비스",
    category: "web",
    status: "완료",
    tags: ["FullStack", "OAuth", "Workflow"],
    period: "2024.10 ~ 2024.12",
    role: "Passport Local + Google/Naver OAuth 통합 · MongoStore 세션 유지 · CORS allowlist",
    image: "/projects/foodmap.webp",
    links: [
      {label: "Client", href: "https://github.com/toadsam/pwd-week6-client"},
      {label: "Server", href: "https://github.com/toadsam/pwd-week6-server"}
    ]
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
    id: "ajou-adventure",
    title: "아주분투",
    subtitle:
      "캠퍼스를 네온 톤으로 재해석한 Phaser 3 기반 2D 러닝 게임 (발판 6종·낮/밤 전환)",
    category: "game",
    status: "완료",
    tags: ["TypeScript", "Phaser 3", "Vite"],
    team: "개인 개발 (전담)",
    richId: "ajou-adventure",
    image: "/projects/ajou-adventure.webp",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam/Ajou_Mini_Game"}
    ]
  },
  {
    id: "darklab",
    title: "DarkLab",
    subtitle: "1인칭 탐색 기반 3D 공포 어드벤처 게임 프로토타입",
    category: "game",
    status: "완료",
    tags: ["Unity", "C#", "Cinemachine", "Horror"],
    period: "2024-1 학기",
    team: "3인 — 프로그래밍 담당",
    richId: "darklab",
    links: [{label: "GitHub", href: "https://github.com/toadsam/DarkLab"}]
  },
  {
    id: "otherside-vr",
    title: "The Other Side (VR)",
    subtitle: "XR Interaction Toolkit 기반 VR 공포 퍼즐 탈출 게임",
    category: "ar",
    status: "완료",
    tags: ["VR", "XR", "Unity"],
    role: "AI 몬스터 시스템 · 감지 로직 · 중앙 제어 구조 설계",
    image: "/projects/otherside-vr.webp",
    links: [
      {
        label: "플레이 영상",
        href: "https://www.youtube.com/watch?v=sK9OoBNCVvc"
      },
      {label: "GitHub", href: "https://github.com/kbwon/IMP_VR"}
    ]
  },
  {
    id: "monsterpoint-ar",
    title: "INTO MONSTER POINT (AR)",
    subtitle: "AR Plane 스캔 기반 전투 공간 생성 슈터 데모 프로젝트",
    category: "ar",
    status: "완료",
    tags: ["AR", "Unity", "Shooter"],
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
    title: "아주대탐험",
    subtitle:
      "1인칭↔탑다운 시점 전환과 랜덤 스킬 성장을 얹은 Unity 3D 액션 어드벤처",
    category: "game",
    status: "완료",
    tags: ["Unity", "C#", "NavMesh", "Roguelike"],
    period: "2024.08 ~ 2024.12",
    team: "개인 개발 (1인)",
    role: "게임 시스템 설계·구현 — 코어 루프 · 전투 AI · UI · 이벤트",
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
