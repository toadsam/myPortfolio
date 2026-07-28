// 면접관용 이력서(ResumeMode) 콘텐츠.
// 기존 배포 포트폴리오(toadsam.github.io/myPortfolio)의 내용을 바탕으로 정리했고,
// 오타는 교정했다. 이미지·수치·외부 링크 URL은 슬롯(빈 값)으로 두고 나중에 채운다.
// TODO(사용자): [확인필요] 표시(숙련도 %·링크 href)를 실제 값으로 채우세요.

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export type ResumeCategory = "web" | "data" | "game" | "ar" | "ops";
export type ProjectStatus = "운영중" | "완료";

export interface ResumeLink {
  label: string; // GitHub · Demo · Notion 등
  href: string; // 빈 문자열이면 "링크 추가 예정" 슬롯으로 표시
}

export interface HeroContent {
  name: string;
  roleTag: string;
  headlineLines: string[];
  bullets: string[];
}

export interface ProficiencyItem {
  label: string;
  percent: number; // [확인필요] 실제 체감치로 조정
}

export interface SkillDetail {
  area: string;
  desc: string;
}

export interface EducationItem {
  org: string;
  program: string;
  period: string;
  desc: string;
  bullets: string[];
}

export interface MainProjectCard {
  id: string;
  title: string;
  subtitle: string;
  category: ResumeCategory;
  status: ProjectStatus;
  tags: string[];
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
  href: string; // 슬롯
}

export interface ValueItem {
  title: string;
  desc: string;
}

// ─── 카테고리 메타 ────────────────────────────────────────────────────────────

export const CATEGORY_META: Record<
  ResumeCategory,
  {label: string; color: string}
> = {
  web: {label: "Web Service", color: "#38bdf8"},
  data: {label: "Data / AI", color: "#a78bfa"},
  game: {label: "Game", color: "#34d399"},
  ar: {label: "AR / XR", color: "#fbbf24"},
  ops: {label: "Ops", color: "#94a3b8"}
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

export const hero: HeroContent = {
  name: "정재훈",
  roleTag: "Full-Stack (Web) · Unity XR Developer",
  headlineLines: ["웹을 주력으로,", "운영 문제까지 해결하는", "개발자 정재훈"],
  bullets: [
    "React · Spring Boot 기반 Full-Stack(Web) 개발",
    "인증·보안(Refresh Token Rotation)과 운영 이슈(HTTPS·CORS) 해결 경험",
    "Unity XR·게임 개발 경험 보유"
  ]
};

export const heroSummary = "웹 주력 + 운영 이슈 해결 중심";

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skillChips = [
  "HTML5",
  "CSS3",
  "JavaScript",
  "React",
  "Node.js",
  "Spring Boot",
  "Database",
  "AWS",
  "Unity",
  "C#",
  "Game Dev",
  "3D"
];

export const skillDetails: SkillDetail[] = [
  {
    area: "Frontend",
    desc: "React/TypeScript 기반 SPA 설계 및 구현 — 컴포넌트 구조화, 상태 흐름 설계, API 연동"
  },
  {area: "Backend", desc: "Spring Boot + JPA로 REST API 설계/구현"},
  {area: "Auth", desc: "JWT 인증/인가 + Refresh Token Rotation"},
  {area: "Infra", desc: "AWS 배포 및 HTTPS / Mixed Content / CORS 해결"},
  {area: "Unity XR/AR", desc: "인터랙션 및 상태/AI 제어 경험"}
];

export const proficiency: ProficiencyItem[] = [
  {label: "Web (Frontend)", percent: 85},
  {label: "Web (Backend)", percent: 80},
  {label: "Game / XR", percent: 70}
];

// ─── Education / 경력 ─────────────────────────────────────────────────────────

export const education: EducationItem[] = [
  {
    org: "아주대학교",
    program: "디지털미디어학과 (전공)",
    period: "2021.03 ~ 2026.02 (예정)",
    desc: "웹/소프트웨어 엔지니어링 중심으로 학습하며 서비스 구조 설계와 구현 역량을 확장했습니다.",
    bullets: [
      "웹(React/Spring Boot) 중심 프로젝트 경험",
      "Unity XR/AR 프로젝트로 인터랙션 경험 확장"
    ]
  },
  {
    org: "아주대학교",
    program: "인공지능 융합학과 (복수전공)",
    period: "2021.03 ~ 2026.02 (예정)",
    desc: "AI/데이터 기반 개발 역량을 함께 확장하고 있습니다.",
    bullets: ["웹 개발과의 융합 관점으로 프로젝트 경험"]
  },
  {
    org: "아주대학교",
    program: "메타버스기획 마이크로전공 (부전공)",
    period: "2021.03 ~ 2026.02 (예정)",
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

// ─── Main Projects (3D 마을 10 + 기존 사이트 신규 3 = 합집합 13) ───────────────
// richId가 있으면 카드 클릭 시 ProjectOnePager로 연결, 없으면 외부 링크만.

export const mainProjects: MainProjectCard[] = [
  {
    id: "muscleup",
    title: "득근득근 (MuscleUp)",
    subtitle:
      "운영을 전제로 인증·보안·배포까지 설계한 피트니스 커뮤니티 풀스택 서비스",
    category: "web",
    status: "운영중",
    tags: ["FullStack", "JWT", "AWS", "Security"],
    richId: "muscleup",
    image: "/projects/muscleup.png",
    links: []
  },
  {
    id: "aclub",
    title: "aClub",
    subtitle:
      "실사용 운영에서 ‘문의 감소·참여 동선 명확화’를 목표로 만든 운영형 웹 서비스",
    category: "web",
    status: "운영중",
    tags: ["WebService", "Operations", "UX", "Analytics"],
    richId: "aclub",
    image: "/projects/aclub.jpg",
    links: []
  },
  {
    id: "ajouchong",
    title: "아주대학교 총학생회",
    subtitle:
      "반복 문의를 줄이고 ‘공지→확인→신청’ 동선을 명확히 만든 운영형 웹 서비스",
    category: "web",
    status: "운영중",
    tags: ["WebService", "Operations", "UX", "Analytics"],
    richId: "ajouchong",
    image: "/projects/ajouchong.png",
    links: []
  },
  {
    id: "festflow",
    title: "FestFlow",
    subtitle: "대학 축제 운영자를 위한 실시간 부스 관리 시스템",
    category: "web",
    status: "완료",
    tags: ["React", "SSE", "Spring Boot", "PWA"],
    richId: "festflow",
    links: []
  },
  {
    id: "mystock",
    title: "MyStock-Desk",
    subtitle:
      "거래 기록 기반 포트폴리오 분석과 AI 체크리스트를 제공하는 투자 기록 서비스",
    category: "data",
    status: "완료",
    tags: ["React", "Spring Boot", "AI", "Recharts"],
    richId: "mystock",
    links: []
  },
  {
    id: "foodmap",
    title: "Ajou Campus Foodmap",
    subtitle:
      "세션 기반 OAuth 로그인과 맛집 등록 플로우를 구현한 캠퍼스 지도 서비스",
    category: "web",
    status: "완료",
    tags: ["FullStack", "OAuth", "Workflow"],
    image: "/projects/foodmap.png",
    links: [
      {label: "GitHub", href: ""},
      {label: "Demo", href: ""}
    ]
  },
  {
    id: "sign-language",
    title: "수어지구",
    subtitle: "수어 아바타를 활용한 학습 및 표현 서비스",
    category: "web",
    status: "완료",
    tags: ["Spring Boot", "Firebase", "3D Avatar"],
    richId: "sign-language",
    links: []
  },
  {
    id: "mywave",
    title: "MyWave",
    subtitle: "개인 자산 흐름을 한눈에 보는 금융 관리 대시보드 (컨셉/설계)",
    category: "data",
    status: "완료",
    tags: ["React", "TypeScript", "Recharts"],
    richId: "mywave",
    links: []
  },
  {
    id: "tserof",
    title: "TSEROF",
    subtitle: "출시·배포까지 완주한 3D 액션 플랫폼 게임 프로젝트",
    category: "game",
    status: "운영중",
    tags: ["Unity", "GameDev", "3D"],
    richId: "tserof",
    image: "/projects/tserof.png",
    links: []
  },
  {
    id: "ajou-adventure",
    title: "아주대탐험",
    subtitle: "스킬·AI·이벤트 시스템을 통합 구현한 캐주얼 액션 어드벤처 게임",
    category: "game",
    status: "완료",
    tags: ["Unity", "AI", "GameSystem"],
    richId: "ajou-adventure",
    image: "/projects/ajou-adventure.png",
    links: []
  },
  {
    id: "darklab",
    title: "DarkLab",
    subtitle: "1인칭 탐색 기반 3D 공포 어드벤처 게임 프로토타입",
    category: "game",
    status: "완료",
    tags: ["Unity", "C#", "Cinemachine", "Horror"],
    richId: "darklab",
    links: []
  },
  {
    id: "otherside-vr",
    title: "The Other Side (VR)",
    subtitle: "XR Interaction Toolkit 기반 VR 공포 퍼즐 탈출 게임",
    category: "ar",
    status: "완료",
    tags: ["VR", "XR", "Unity"],
    image: "/projects/otherside-vr.png",
    links: [
      {label: "GitHub", href: ""},
      {label: "Demo", href: ""}
    ]
  },
  {
    id: "monsterpoint-ar",
    title: "INTO MONSTER POINT (AR)",
    subtitle: "AR Plane 스캔 기반 전투 공간 생성 슈터 데모 프로젝트",
    category: "ar",
    status: "완료",
    tags: ["AR", "Unity", "Shooter"],
    image: "/projects/monsterpoint-ar.png",
    links: [
      {label: "GitHub", href: ""},
      {label: "Demo", href: ""}
    ]
  }
];

// ─── Sub Projects (기존 사이트) ───────────────────────────────────────────────

export const subProjects: SubProjectCard[] = [
  {
    title: "고양이로부터 지켜라",
    desc: "타워 디펜스 게임 1인 개발",
    image: "/projects/sub/cat-defense.png",
    links: [{label: "Demo", href: ""}]
  },
  {
    title: "루탄의 카드 게임",
    desc: "덱 빌딩 카드 게임 개발",
    image: "/projects/sub/rutan-card.png",
    links: [
      {label: "GitHub", href: ""},
      {label: "Demo", href: ""}
    ]
  },
  {
    title: "내 꿈이 현실의 버그에 침식당하기 시작해서 위험해",
    desc: "잠든 개발자가 꿈속 코드 세계에서 버그를 해결하는 게임",
    image: "/projects/sub/dream-bug.png",
    links: [
      {label: "GitHub", href: ""},
      {label: "Demo", href: ""},
      {label: "Notion", href: ""}
    ]
  },
  {
    title: "스파르타 던전 배틀 (Text 게임)",
    desc: "나만의 캐릭터를 생성하고, 그 캐릭터를 활용한 텍스트 게임",
    image: "/projects/sub/dungeon-battle.png",
    links: [
      {label: "GitHub", href: ""},
      {label: "Demo", href: ""},
      {label: "Notion", href: ""}
    ]
  },
  {
    title: "Fossil Runner",
    desc: "섬에서 자원을 모아 성장하고, 용을 처치해 현실로 돌아가는 게임",
    image: "/projects/sub/fossil-runner.png",
    links: [
      {label: "GitHub", href: ""},
      {label: "Demo", href: ""}
    ]
  },
  {
    title: "MOVYDICK",
    desc: "이더리움 고래 활동 추적 및 매매 시점 예측 시스템 개발",
    image: "/projects/sub/movydick.png",
    links: [
      {label: "Demo", href: ""},
      {label: "Notion", href: ""}
    ]
  },
  {
    title: "NovelKub",
    desc: "NPC 단서 수집 기반 살인사건 추리 게임",
    image: "/projects/sub/novelkub.png",
    links: [
      {label: "GitHub", href: ""},
      {label: "Demo", href: ""},
      {label: "Notion", href: ""}
    ]
  },
  {
    title: "time rewinder",
    desc: "Godot 기반 퍼즐 게임 개발",
    image: "/projects/sub/time-rewinder.png",
    links: [{label: "Demo", href: ""}]
  },
  {
    title: "불빛아래",
    desc: "AI 디자인을 적용한 3D 공포 게임",
    image: "/projects/sub/under-the-light.png",
    links: [
      {label: "GitHub", href: ""},
      {label: "Demo", href: ""}
    ]
  },
  {
    title: "경복궁을 지켜라",
    desc: "로블록스 기반으로 제작한 경복궁 복원 게임",
    image: "/projects/sub/gyeongbokgung.png",
    links: [{label: "Demo", href: ""}]
  },
  {
    title: "페스트러너",
    desc: "곤충을 피해 도망가는 AR 기반 러너 게임",
    links: [
      {label: "GitHub", href: ""},
      {label: "Demo", href: ""}
    ]
  }
];

// ─── Development Records ──────────────────────────────────────────────────────

export const devRecords: DevRecord[] = [
  {
    title: "개발 기록",
    desc: "개발 중 인상 깊었던 문제와 배운 점, 그날의 고민을 짧게 정리합니다.",
    href: ""
  },
  {
    title: "개발 개념과 구조 학습 정리",
    desc: "핵심 개념과 구조를 중심으로 학습 내용을 정리합니다.",
    href: ""
  },
  {
    title: "코딩 테스트 문제 풀이 기록",
    desc: "문제 풀이 과정과 접근 방식을 정리합니다.",
    href: ""
  }
];

// ─── Values ───────────────────────────────────────────────────────────────────

export const values: ValueItem[] = [
  {title: "소통", desc: "생각과 상황을 공유하며 방향을 맞춥니다."},
  {title: "협력", desc: "역할을 존중하며 함께 더 나은 결과를 만듭니다."},
  {title: "성실", desc: "작은 기록과 반복을 통해 꾸준히 성장합니다."},
  {title: "도전", desc: "익숙함에 머무르지 않고 새로운 시도를 선택합니다."}
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
