import type {ProjectData} from "@/types/portfolio";

export const projects: ProjectData[] = [
  {
    id: "demotion",
    title: "Demotion",
    description: "B2B SaaS 데모 생성 및 마케팅 인사이트 플랫폼",
    role: "백엔드 API 설계, 데모 흐름 구현, 로그 수집 구조 설계",
    tech: ["Spring Boot", "React", "JWT", "PostgreSQL"],
    features: ["데모 생성", "ViewLog 수집", "StepViewLog 수집", "CTA 클릭 분석", "대시보드 통계"],
    learning: "사용자 행동 데이터를 기반으로 마케팅 인사이트를 설계하는 경험",
    problem:
      "SaaS 제품은 실제 사용 흐름을 보여줘야 설득력이 커지지만, 단순 랜딩 페이지나 정적인 소개 자료만으로는 어떤 단계에서 사용자가 이탈하는지 파악하기 어렵습니다.",
    approach: [
      "데모를 iframe으로 임베드할 수 있는 구조를 잡고, 사용자가 보는 페이지와 단계 단위 로그를 분리했습니다.",
      "CTA 클릭, 페이지 체류 시간, 완료율처럼 마케팅 의사결정에 필요한 이벤트를 별도 로그로 정의했습니다.",
      "프론트엔드 화면과 백엔드 API가 같은 데모 흐름을 기준으로 움직이도록 데이터 모델을 단순화했습니다."
    ],
    contribution: [
      "데모 생성과 조회 API 흐름 설계",
      "ViewLog, PageViewLog, StepViewLog 수집 구조 설계",
      "CTA 클릭 분석과 대시보드 통계 흐름 구현",
      "JWT 기반 인증 흐름과 PostgreSQL 데이터 구조 정리"
    ],
    result:
      "단순한 제품 소개가 아니라 사용자의 실제 행동 데이터를 기반으로 데모 성과를 해석할 수 있는 플랫폼 방향을 만들었습니다.",
    nextStep: "GitHub API와 실제 배포 데모 링크를 연결해 프로젝트 상세 증빙을 더 강화할 예정입니다.",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam"},
      {label: "Demo", href: "https://github.com/toadsam"}
    ]
  },
  {
    id: "mywave",
    title: "MyWave",
    description: "나만의 투자 흐름을 만드는 금융/투자 관리 웹앱",
    role: "서비스 기획, UI 설계, 프론트엔드 구조 설계",
    tech: ["React", "TypeScript", "Chart UI"],
    features: ["소비/투자 흐름 시각화", "목표 관리", "개인화 대시보드"],
    learning: "데이터 시각화와 사용자 중심 금융 UX 설계",
    problem:
      "금융 서비스는 정보가 많을수록 사용자가 부담을 느끼기 쉽습니다. 사용자가 자신의 소비와 투자 흐름을 한눈에 이해할 수 있는 구조가 필요했습니다.",
    approach: [
      "자산 흐름을 숫자 목록이 아니라 시각적인 흐름으로 볼 수 있도록 화면 구조를 설계했습니다.",
      "목표 관리와 대시보드 정보를 분리해 사용자가 다음 행동을 쉽게 결정하도록 구성했습니다.",
      "TypeScript 기반 데이터 모델을 가정해 차트 UI와 카드 UI가 같은 데이터 구조를 바라보도록 설계했습니다."
    ],
    contribution: [
      "서비스 핵심 사용자 흐름 기획",
      "금융 데이터 카드와 차트 UI 구조 설계",
      "프론트엔드 컴포넌트 분리 방향 정의",
      "개인화 대시보드 정보 구조 설계"
    ],
    result:
      "투자와 소비 데이터를 어렵게 나열하지 않고, 개인의 흐름과 목표 중심으로 읽히는 금융 UX 방향을 만들었습니다.",
    nextStep: "실제 금융 데이터 연동 전, mock 데이터 기반 대시보드 프로토타입을 먼저 완성할 예정입니다.",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam"},
      {label: "Demo", href: "https://github.com/toadsam"}
    ]
  },
  {
    id: "farm-owner",
    title: "일해라 농장주",
    description: "스마트폰 과의존 완화를 위한 농장 육성 DTx 게임",
    role: "UI 이미지 생성, Unity UI 코드 구현",
    tech: ["Unity", "C#", "UI System"],
    features: ["집중 시간 기반 농장 성장", "성공/실패 피드백 UI"],
    learning: "게임 UI와 사용자 행동 피드백 구조에 대한 이해",
    problem:
      "스마트폰 과의존 완화 서비스는 사용자가 지속적으로 참여해야 효과가 있습니다. 집중 행동을 보상과 피드백으로 자연스럽게 연결하는 UI가 필요했습니다.",
    approach: [
      "집중 세션 결과가 농장 성장이라는 시각적 보상으로 느껴지도록 UI 상태를 구성했습니다.",
      "성공과 실패 피드백이 즉시 전달되도록 Unity UI 화면 전환과 상태 표현을 구현했습니다.",
      "게임 분위기에 맞는 UI 이미지를 생성하고, 실제 Unity 화면에 적용 가능한 형태로 정리했습니다."
    ],
    contribution: [
      "UI 관련 이미지 생성 및 화면 리소스 정리",
      "Unity UI 코드 구현",
      "성공/실패 결과 화면 구성",
      "게임 UI 흐름과 피드백 구조 구현"
    ],
    result:
      "사용자의 집중 행동이 게임 내 성장 피드백으로 이어지는 구조를 경험했고, 게임 UI의 상태 표현 중요성을 학습했습니다.",
    nextStep: "실제 집중 세션 런타임, 이탈 감지, 저장 시스템은 팀 내 다른 역할과 분리해 문서화할 예정입니다.",
    links: [
      {label: "GitHub", href: "https://github.com/toadsam"},
      {label: "Demo", href: "https://github.com/toadsam"}
    ]
  }
];
