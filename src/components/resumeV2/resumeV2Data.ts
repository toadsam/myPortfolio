/**
 * `/resume` v2 전용 문구와 수치.
 *
 * 승인된 시안(c-family-v6.html)에서 그대로 옮겼다. resume.ts 에 같은 값이 있는
 * 것(이름·직무·연락처·자격증·활동 기간·교육 과정명)은 ResumeV2.tsx 가 resume.ts 에서
 * 읽고, 여기에는 시안에서 다듬은 문장(불편/고친 것·짧은 줄·숫자 타일·그림 묶음·
 * 기술 공 연결)만 둔다. 클라이언트 연출(ResumeV2Motion)도 이 파일을 읽으므로
 * resume.ts 를 import 하지 않는다(번들에 이력서 데이터 전체가 딸려 오지 않게).
 */

/** 시안의 `img/x.webp` 이름 → public 경로 */
import {codeLinkOk} from "../../lib/codeLinks";

export const IMG: Record<string, string> = {
  aclub: "/projects/aclub-cover.webp",
  "aclub-2": "/projects/aclub-2026-screens.webp",
  "aclub-3": "/projects/aclub.webp",
  "ajou-indigame": "/projects/ajou-indigame.webp",
  ajouchong: "/projects/ajouchong.webp",
  "ajouchong-2": "/projects/ajouchong/v2/rental.webp",
  "ajouchong-3": "/projects/ajouchong/v2/rental-admin.webp",
  "ajouchong-4": "/projects/ajouchong/v2/linkhub.webp",
  festflow: "/projects/festflow/oct/festflow-oct-screens.webp",
  "festflow-2": "/projects/festflow/oct/kitchen.webp",
  "festflow-3": "/projects/festflow/oct/aimatch.webp",
  "festflow-4": "/projects/festflow/oct/console.webp",
  "monsterpoint-ar": "/projects/monsterpoint-ar.webp",
  muscleup: "/projects/muscleup/v2/home-lobby.webp",
  "muscleup-2": "/projects/muscleup/v2/character.webp",
  "muscleup-3": "/projects/muscleup/v2/lounge.webp",
  "muscleup-4": "/projects/muscleup/v2/inbody.webp",
  mystock: "/projects/mystock.webp",
  "otherside-vr": "/projects/otherside-vr.webp",
  "sign-language": "/projects/sign-language.webp",
  tserof: "/projects/tserof.webp",
  "tserof-2": "/projects/tserof/gimmick-icicle.webp",
  village: "/projects/village-portfolio/card-art.webp",
  "village-2": "/projects/village-portfolio/village.webp",
  "village-3": "/projects/village-portfolio/admin.webp",
  "village-4": "/projects/village-portfolio/atelier.webp"
};

export const img = (key: string) => IMG[key] ?? `/projects/${key}.webp`;

export interface V2Project {
  id: string;
  title: string;
  status: "운영중" | "완료" | "출시";
  sub: string;
  pain?: string;
  fix?: string;
  period: string;
  team: string;
  role: string;
  metrics: [string, string][];
  source: string;
}

/** 판(tray) 안의 단계 내용. 시안 PROJECTS 그대로 */
export const PROJECTS: V2Project[] = [
  {
    id: "ajouchong",
    title: "아주대 총학생회 웹",
    status: "운영중",
    sub: "학생이 대여 물품 수량과 신청 링크를 확인하고, 총학생회가 직접 관리하는 웹사이트입니다.",
    pain: "학생은 물품이 남았는지 몰라 학생회실까지 와서야 없다는 말을 들었습니다. 수량이나 링크 하나를 바꾸는 데도 개발자가 배포해야 했습니다.",
    fix: "대여 품목, 대여 기록, 링크를 관리자 화면에서 바로 고치게 만들었습니다. 지금은 총학생회가 개발자 없이 직접 운영합니다. 2026.11 기준 대여 품목 10종, 링크 9개가 올라가 있습니다.",
    period: "2025.03 ~ 진행 중",
    team: "2025 프론트 3인 → 2026 단독 담당",
    role: "2025 프론트 화면 일부 → 2026 단독 담당: UI 전면 개편 · 대여사업 · 링크허브 · 관리자 화면 · Spring Boot API",
    metrics: [
      ["12,314", "검색 노출"],
      ["1,694", "검색 클릭"],
      ["13.8%", "검색 CTR"]
    ],
    source: "Google Search Console · 2025.05~2026.08(16개월) · 검색 유입 기준"
  },
  {
    id: "festflow",
    title: "AjouFesta (구 FestFlow)",
    status: "운영중",
    sub: "5월 첫 운영에서 확인한 문제를 개선하고, 10월 가을축제에서 이틀간 운영한 아주대 축제 앱입니다.",
    pain: "2026.05 대동제에서 AI 소개팅을 하루 운영했는데, 신청 상한이 없어 문자 244통이 잔액 부족으로 실패했습니다.",
    fix: "10월 가을축제에서는 1인당 신청을 3건으로 제한하고, 문자 실패가 저장을 막지 않게 분리했습니다. 이틀 동안 서버 장애 없이 운영했습니다.",
    period: "2026.04 ~ 2026.10",
    team: "개인 개발",
    role: "기획 · 개발 · 배포 · 현장 운영 1인 (React · Spring Boot · JWT · SSE · PWA)",
    metrics: [
      ["7,078명", "축제 주간 방문자"],
      ["장애 0건", "축제 이틀 · 배포 5회"],
      ["100 / 100", "동시 주문 100건 번호 중복 0"]
    ],
    source:
      "아주대 가을축제 2026.10.07–08 · Vercel Web Analytics(10.02–09) · 주문 CSV · 소개팅 통계"
  },
  {
    id: "village",
    title: "AI 포트폴리오 마을",
    status: "운영중",
    sub: "관리자 활동 기록을 건물 불빛과 AI NPC 대화에 반영하는 3D 포트폴리오 사이트입니다.",
    pain: "소개 글을 읽으려는 방문자도 3D 모델 87개(20.7MB)를 먼저 받아야 했습니다.",
    fix: "첫 화면을 3D가 전혀 없는 별도 페이지로 분리했습니다. 첫 화면 JS는 215KB, 3D 모델은 0개입니다. 마을은 표에 마우스를 올리는 순간 미리 받습니다.",
    period: "2026.06 ~ 진행 중",
    team: "개인 개발",
    role: "Next.js 프론트 · FastAPI 백엔드 · 관리자 페이지 · OpenAI NPC(규칙 폴백) · Claude Agent SDK 공방 · 3D 성능 예산",
    metrics: [
      ["215 KB", "첫 화면 JS · 3D 모델 0개"],
      ["70", "공개·관리자 API"],
      ["375", "백엔드 테스트"]
    ],
    source:
      "API·테스트 수는 저장소 소스 기준 (2026.11) · 첫 화면 무게는 빌드 청크 실측 (2026.09)"
  },
  {
    id: "muscleup",
    title: "득근득근 (MuscleUp)",
    status: "운영중",
    sub: "사용자 피드백을 반영해 동아리 소개 홈페이지에 운동 기록·커뮤니티·AI 코칭 기능을 추가했습니다.",
    pain: "1.0은 동아리 소개 홈페이지였고, 써 본 사용자에게서 피드백 4건을 받았습니다.",
    fix: "그중 3건을 2.0에 반영해 운동 기록, 커뮤니티, AI 코칭을 추가했습니다.",
    period: "2025.09 ~ 진행 중",
    team: "개인 개발 (1.0 → 2.0 → 3.0)",
    role: "1.0 소개형 홈페이지 · 인증/배포 → 2.0 게임형 개편(캐릭터 · 랭킹 · 라운지) → 3.0 디자인 · 모임 구조 · 인증 재설계",
    metrics: [
      ["3 / 4", "반영한 사용자 피드백"],
      ["2.0배", "한 페이지 응답 · 20만 행 SQL"],
      ["55명", "가입 회원"]
    ],
    source:
      "피드백 3/4 는 1.0·2.0 발표자료 대조 · 회원 수는 운영 API 실측(2026.10.18) · 도메인은 저장소 소스 기준"
  },
  {
    id: "aclub",
    title: "aClub",
    status: "완료",
    sub: "활성 사용자 3,500명의 동아리 탐색·모집 서비스입니다. 2025년 프론트 개발에 참여하고 2026년에는 프로젝트장으로 출시와 운영을 맡았습니다.",
    pain: "조직으로 저장소를 옮긴 뒤 배포가 아홉 번 연속 실패했고, 출시 당일 오후에는 동아리 필터가 조합에 따라 실패했습니다.",
    fix: "배포 워크플로를 고쳐 통과시키고, 필터가 실패하면 전체 목록을 받아 화면에서 거르는 우회로를 넣어 그날 저녁 예정대로 출시했습니다.",
    period: "2025.01 ~ 2026.03",
    team: "2025 프론트 3인 → 2026 프로젝트장",
    role: "2025 Frontend 개발(로그인 · API 연동) → 2026 프로젝트장: 출시 · 홍보 · 운영, 배포 수리와 출시 전후 수정",
    metrics: [
      ["3,500", "활성 사용자"],
      ["8.8만", "조회수"],
      ["93.4%", "세션 참여율"]
    ],
    source: "Google Analytics 4 · 2026.01–03"
  },
  {
    id: "tserof",
    title: "TSEROF",
    status: "출시",
    sub: "5인 팀의 부팀장으로 참여해 4개월간 개발하고 Steam에 출시한 3D 액션 플랫폼 게임입니다.",
    period: "2023.10 ~ 2024.02",
    team: "5인 팀, 부팀장",
    role: "스테이지 2 · 장애물/기믹 · 3×3 퍼즐 구현 · 기획",
    metrics: [
      ["Steam", "스토어 출시"],
      ["4개월", "기획 → 출시"]
    ],
    source:
      "출시는 Steam 스토어 페이지 · 기간은 첫 커밋과 Steam 출시일 · 담당은 저장소 README 기여자 표"
  }
];

/** 판 첫 단계의 그림 묶음 */
export const GAL: Record<string, string[]> = {
  village: ["village", "village-2", "village-3", "village-4"],
  muscleup: ["muscleup", "muscleup-2", "muscleup-3", "muscleup-4"],
  festflow: ["festflow", "festflow-2", "festflow-3", "festflow-4"],
  aclub: ["aclub", "aclub-2", "aclub-3"],
  ajouchong: ["ajouchong", "ajouchong-2", "ajouchong-3", "ajouchong-4"],
  tserof: ["tserof", "tserof-2"]
};

export const LINKS: Record<string, [string, string][]> = {
  village: [
    ["사이트", "https://jaehun.co.kr"],
    ["GitHub", "https://github.com/toadsam/myPortfolio"]
  ],
  muscleup: [
    ["서비스 열기", "https://musclehub.co.kr"],
    ["GitHub", "https://github.com/toadsam/Ajou_MuscleUp"],
    ["시연 영상", "https://youtu.be/0X-BIADC1eQ"]
  ],
  aclub: [
    ["GitHub (2026 · 프로젝트장)", "https://github.com/aClub2026/FE"],
    ["GitHub (2025 · 팀원)", "https://github.com/DBProject-24-2/DB_Project_FE"]
  ],
  ajouchong: [
    ["사이트", "https://ajouchong.com"],
    ["GitHub", "https://github.com/ajouchong-dev/ajouchong-web"],
    [
      "개편 PR (프론트 · 2026)",
      "https://github.com/ajouchong-dev/ajouchong-web/pull/36"
    ],
    [
      "대여·링크 API PR (백엔드 · 2026)",
      "https://github.com/ajouchong-dev/ajouchong/pull/70"
    ]
  ],
  festflow: [
    ["사이트", "https://www.ajoufesta.com"],
    ["시연 영상", "https://www.youtube.com/watch?v=Jdo5ZNDG8Uk"]
  ],
  tserof: [
    [
      "Steam 스토어",
      "https://store.steampowered.com/app/2743860/TSEROF/?l=koreana"
    ],
    ["플레이 영상", "https://www.youtube.com/watch?v=1Lm-lpVsmq8"]
  ]
};
// PR · 커밋 링크는 화면에 걸지 않는다(lib/codeLinks.ts)
for (const k of Object.keys(LINKS))
  LINKS[k] = LINKS[k].filter(x => codeLinkOk(x[1]));

/** 상세 주소. 마을만 id 가 다르다 */
export const detailHref = (id: string) =>
  `/resume/${id === "village" ? "village-portfolio" : id}`;

/** 숫자 타일 넷: [값, 설명, 출처 이름, 출처 상세] */
export const NUMS: [string, string, string, string][] = [
  ["3,500명", "활성 사용자", "aClub", "Google Analytics 4 · 2026.01–03"],
  [
    "7,078명",
    "축제 주간 방문자",
    "AjouFesta",
    "아주대 가을축제 2026.10.07–08 · Vercel Web Analytics(10.02–09)"
  ],
  [
    "12,314회",
    "검색 노출",
    "총학생회 웹",
    "Google Search Console · 2025.05~2026.08(16개월) · 검색 유입 기준"
  ],
  [
    "215KB",
    "첫 화면 JS",
    "이 포트폴리오",
    "3D 모델 0개 · 빌드 청크 실측 (2026.09)"
  ]
];

/** 프로젝트 타일과 30초 요약의 짧은 줄 */
export const SHORT: Record<string, string> = {
  ajouchong: "물품이 남았는지 몰라 학생회실까지 와야 했습니다.",
  festflow: "신청 상한이 없어 문자 244통이 실패했습니다.",
  village: "소개만 읽으려 해도 3D 모델 87개를 받아야 했습니다.",
  muscleup: "1.0 사용자에게서 피드백 4건을 받았습니다.",
  aclub: "학생이 찾는 순서와 화면 구조가 달랐습니다."
};

/** 프로젝트 타일. w 는 데스크톱 12칸 중 차지하는 폭 */
export const TILES: {
  id: string;
  w?: 7 | 5;
  i?: number;
  title: string;
  badge: string;
  badgeOn: boolean;
  key: string;
  keyLabel: string;
  /** 참이면 타일을 눌렀을 때 판을 펼치지 않고 `/resume/<id>` 상세로 바로 간다 */
  /** 2026-11-13 부터 타일은 전부 상세로 바로 간다. 이 플래그는 더 읽지 않는다. */
  direct?: boolean;
}[] = [
  {
    id: "ajouchong",
    w: 7,
    title: "아주대 총학생회 웹",
    badge: "운영중",
    badgeOn: true,
    key: "12,314",
    keyLabel: "검색 노출"
  },
  {
    id: "festflow",
    w: 5,
    i: 1,
    title: "AjouFesta (구 FestFlow)",
    badge: "운영중",
    badgeOn: true,
    key: "7,078명",
    keyLabel: "축제 주간 방문자"
  },
  {
    id: "village",
    w: 5,
    title: "AI 포트폴리오 마을",
    badge: "운영중",
    badgeOn: true,
    key: "215 KB",
    keyLabel: "첫 화면 JS · 3D 모델 0개"
  },
  {
    id: "muscleup",
    w: 7,
    i: 1,
    title: "득근득근 (MuscleUp)",
    badge: "운영중",
    badgeOn: true,
    key: "3 / 4",
    keyLabel: "반영한 사용자 피드백",
    direct: true
  },
  {
    id: "aclub",
    title: "aClub",
    badge: "완료",
    badgeOn: false,
    key: "3,500",
    keyLabel: "활성 사용자"
  },
  {
    id: "tserof",
    i: 1,
    title: "TSEROF",
    badge: "출시",
    badgeOn: false,
    key: "Steam",
    keyLabel: "스토어 출시"
  }
];

export const OTHERS: {img: string; title: string; desc: string}[] = [
  {
    img: "mystock",
    title: "MyStock-Desk / MyWave",
    desc: "운영 중인 개인 재무 웹앱 · 테스트 98개 · CI · 검사받는 AI 코치"
  },
  {
    img: "sign-language",
    title: "수어링고 (구 수어지교)",
    desc: "수어 동작을 보고 뜻을 익히는 학습 앱 · 11월에 디자인을 다시 그림"
  },
  {
    img: "otherside-vr",
    title: "The Other Side (VR)",
    desc: "XR Interaction Toolkit 기반 VR 공포 퍼즐 탈출 게임"
  },
  {
    img: "monsterpoint-ar",
    title: "INTO MONSTER POINT (AR)",
    desc: "AR Plane 스캔 기반 전투 공간 생성 슈터 데모"
  },
  {
    img: "ajou-indigame",
    title: "아주대탐험",
    desc: "시점 전환과 랜덤 스킬 성장을 얹은 Unity 3D 액션 어드벤처"
  }
];

/** 기술 공. big 은 주력(파랑 채움) */
export const BALLS: {name: string; big?: boolean}[] = [
  {name: "Spring Boot", big: true},
  {name: "Java", big: true},
  {name: "React", big: true},
  {name: "TypeScript", big: true},
  {name: "Next.js", big: true},
  {name: "JWT"},
  {name: "AWS"},
  {name: "OpenAI API"},
  {name: "Claude Agent SDK"},
  {name: "Unity"},
  {name: "C#"}
];

/** 공을 누르면 나오는 대표 프로젝트 */
export const BALLP: Record<string, string[]> = {
  "Spring Boot": ["festflow", "ajouchong"],
  Java: ["festflow", "ajouchong"],
  React: ["festflow"],
  JWT: ["festflow"],
  "Next.js": ["village"],
  "OpenAI API": ["village"],
  "Claude Agent SDK": ["village"],
  AWS: ["muscleup"],
  Unity: ["tserof"],
  "C#": ["tserof"]
};

/** 기술 표. main 은 주력, more 는 써 본 것 */
export const SKILL_ROWS: {
  area: string;
  what: string;
  main: string[];
  more: string[];
}[] = [
  {
    area: "Backend",
    what: "Spring Boot + JPA로 REST API 설계/구현",
    main: ["Spring Boot", "Java"],
    more: ["JPA", "Spring Security", "Node.js", "Express", "FastAPI (Python)"]
  },
  {
    area: "Frontend",
    what: "React/TypeScript 기반 SPA 화면 구현과 API 연동",
    main: ["React", "TypeScript", "Next.js"],
    more: [
      "Three.js (R3F)",
      "Vite",
      "React Query",
      "Tailwind CSS",
      "Expo",
      "React Native"
    ]
  },
  {
    area: "Auth",
    what: "JWT 인증/인가 · 이중 쿠키 + 유예 창 회전",
    main: ["JWT"],
    more: [
      "Refresh Token Rotation (유예 창 · 재사용 감지)",
      "OAuth2",
      "Passport",
      "Firebase Auth"
    ]
  },
  {
    area: "Infra / Data",
    what: "AWS 배포 및 HTTPS / Mixed Content / CORS 해결",
    main: ["AWS"],
    more: ["S3", "CloudFront", "MySQL", "MongoDB", "Firebase"]
  },
  {
    area: "AI / LLM",
    what: "LLM 응답을 규칙으로 검증·보정하고, 실패해도 멈추지 않게 설계",
    main: ["OpenAI API", "Claude Agent SDK"],
    more: ["규칙 기반 폴백", "출력 클램프"]
  },
  {
    area: "Unity XR/AR",
    what: "시점 전환 · 몬스터 AI · AR 전장 생성 구현",
    main: ["Unity", "C#"],
    more: ["AR Foundation", "XR Interaction Toolkit"]
  }
];

/** 활동 줄에서 resume.ts 와 표기가 다른 것(시안 문구 우선) */
export const ACT_ROLE: Record<string, string> = {
  "아주대학교 총학생회 · 중앙비상대책위원회 (제43~45대)":
    "생활복지국원 → 소통발전국원 → 비대위 집행국원 → 소통개발국장"
};

/** 활동 → 이어진 프로젝트 버튼 */
export const ACT_LED: Record<string, {id: string; label: string}> = {
  "아주대학교 총학생회 · 중앙비상대책위원회 (제43~45대)": {
    id: "ajouchong",
    label: "총학생회 웹 서비스"
  },
  "헬스 동아리 ‘득근득근’": {id: "muscleup", label: "득근득근 (MuscleUp)"}
};

/** 학력 한 줄(복수전공·마이크로전공을 합쳐 적는다) */
export const ACADEMIC = {
  when: "2021.03 ~ 2027.02 (예정)",
  logo: "/logos/ajou.png",
  what: "아주대학교 디지털미디어학과",
  how: "전공 학점 4.05 / 4.5 · 인공지능 융합학과 복수전공 · 메타버스기획 마이크로전공"
};

/** 교육 줄의 설명(과정명·기간·로고는 resume.ts) */
export const EDU_HOW: Record<string, string> = {
  "스파르타 내일배움캠프":
    "1,080시간 수료 · 최종 팀 프로젝트 TSEROF를 Steam에 출시",
  "구름(goorm) · 카카오엔터프라이즈":
    "군 복무 중 입문 과정과 SW개발 초급과정 2 수료 (수료증 2장)",
  코드잇: "프로그래밍과 웹 개발 기초"
};

export const AWARDS: {when: string; logo: string; what: string; how: string}[] =
  [
    {
      when: "2026.03.16 · 수료",
      logo: "/logos/blaybus.png",
      what: "혁신 아이디어 MVP 기획 공모전(Zero to One)",
      how: "블레이버스 주최 · 팀 득근득근"
    },
    {
      when: "2025.05.14 · 수상",
      logo: "/logos/blaybus.png",
      what: "비즈니스 아이디어 공모전 우수상",
      how: "스타트업코드 · 블레이버스 주최"
    },
    {
      when: "2025.03 · 수상",
      logo: "/logos/ajou.png",
      what: "2024 동계 모각소 장려상",
      how: "아주대학교 SW융합교육원"
    },
    {
      when: "2024.12.05 · 수상",
      logo: "/logos/ajou.png",
      what: "미디어데이 미디어 시제품 콘텐츠 경진대회 우수상",
      how: "아주대학교 디지털미디어학과"
    }
  ];

export const WORK: {when: string; what: string; how: string}[] = [
  {
    when: "2025.12 ~ 2026.04",
    what: "헬스장 인포",
    how: "아침 6시 근무. 회원 응대·출입 관리·시설 및 운동 공간 관리. 득근득근 개발 기간에 병행했습니다."
  },
  {
    when: "2025.03 ~ 2025.08",
    what: "노래방",
    how: "방 관리·고객 응대·기기 점검 및 간단한 고장 처리."
  },
  {
    when: "2021.08 ~ 2021.11",
    what: "편의점 (야간)",
    how: "야간 단독 근무. 매장 관리·고객 응대·재고 정리·계산."
  }
];

export const CHIPS: {text: string; on?: boolean}[] = [
  {text: "즉시 입사 가능", on: true},
  {text: "2027.02 졸업 예정"},
  {text: "정보처리기사 · SQLD"}
];

/** 30초 요약 아래 한 줄 */
export const SUM_LINE =
  "정보처리기사 · SQLD · 아주대학교 디지털미디어학과 (전공 학점 4.05 / 4.5)";
