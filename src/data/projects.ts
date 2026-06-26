import type {ProjectData} from "@/types/portfolio";

export const projects: ProjectData[] = [
  {
    id: "demotion",
    title: "Demotion",
    description: "B2B SaaS 데모 생성 및 마케팅 인사이트 플랫폼",
    role: "백엔드 API 설계, 데모 흐름 구현, 로그 수집 구조 설계",
    tech: ["Spring Boot", "React", "JWT", "PostgreSQL"],
    features: ["데모 생성", "ViewLog", "StepViewLog", "CTA 클릭 분석", "대시보드 통계"],
    learning: "사용자 행동 데이터를 기반으로 마케팅 인사이트를 설계하는 경험",
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
    links: [
      {label: "GitHub", href: "https://github.com/toadsam"},
      {label: "Demo", href: "https://github.com/toadsam"}
    ]
  }
];
