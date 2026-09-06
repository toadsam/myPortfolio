import type {SkillData} from "@/types/portfolio";

export const skills: SkillData[] = [
  {
    name: "Next.js",
    group: "Frontend",
    description: "이 사이트의 페이지 구조와 배포가 App Router 위에 있습니다."
  },
  {
    name: "TypeScript",
    group: "Frontend",
    description:
      "이 사이트의 데이터 모델, 컴포넌트 props, UI 상태를 전부 TypeScript 로 적었습니다."
  },
  {
    name: "React",
    group: "Frontend",
    description: "FestFlow 와 이 사이트의 화면을 React 컴포넌트로 만들었습니다."
  },
  {
    name: "Tailwind CSS",
    group: "Frontend",
    description: "FestFlow PWA 와 이 사이트의 반응형 레이아웃에 썼습니다."
  },
  {
    name: "Three.js",
    group: "3D / Motion",
    description: "이 마을의 3D 공간, 조명, 카메라가 Three.js 입니다."
  },
  {
    name: "React Three Fiber",
    group: "3D / Motion",
    description: "마을 씬을 React 컴포넌트로 조립하고 클릭 이벤트를 받습니다."
  },
  {
    name: "Drei",
    group: "3D / Motion",
    description: "HTML 라벨과 카메라 컨트롤은 Drei 에서 가져옵니다."
  },
  {
    name: "Framer Motion",
    group: "3D / Motion",
    description: "패널과 카드가 열리고 닫히는 전환에 씁니다."
  },
  {
    name: "FastAPI",
    group: "Backend",
    description: "마을 상태, NPC 대화, GitHub 동기화 API 가 FastAPI 서버입니다."
  },
  {
    name: "Spring Boot",
    group: "Backend",
    description:
      "FestFlow·StockFlow·득근득근의 REST API, 인증, 실시간 기능을 Spring Boot 로 만들었습니다."
  },
  {
    name: "PostgreSQL",
    group: "Backend",
    description: "총학생회 웹의 데이터를 PostgreSQL 에 저장합니다."
  },
  {
    name: "Unity",
    group: "Game / XR",
    description:
      "TSEROF·DarkLab 의 플레이어 조작과 스테이지, XR/AR 인터랙션 프로젝트를 Unity 로 만들었습니다."
  },
  {
    name: "GitHub",
    group: "Workflow",
    description: "공개 저장소 44개. 백준 풀이는 BaekjoonHub 로 자동 커밋합니다."
  },
  {
    name: "Notion",
    group: "Workflow",
    description: "기획 문서와 작업 로그, 회고를 여기에 씁니다."
  }
];
