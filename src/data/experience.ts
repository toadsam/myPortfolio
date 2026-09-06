import type {ExperienceItem} from "@/types/portfolio";

// 실제 회사/인턴 경력이 아니라 개인 프로젝트·학습 이력입니다.
// (연도/문구는 [확인필요] — 실제 진행 시기에 맞게 조정하세요)
export const experienceItems: ExperienceItem[] = [
  {
    year: "2024",
    title: "Unity 3D 게임 프로그래밍 (팀)",
    description:
      "DarkLab·TSEROF 팀 프로젝트에서 플레이어 제어와 스테이지·기믹 시스템을 C#으로 만들었습니다."
  },
  {
    year: "2025",
    title: "풀스택 웹 서비스 개발 (개인·팀)",
    description:
      "StockFlow·FestFlow·MuscleUp 의 Spring Boot 백엔드와 React 프론트를 만들었습니다. SSE·Socket.IO 실시간 통신과 JWT/OAuth 인증까지 직접 붙였습니다."
  },
  {
    year: "2026",
    title: "AI Portfolio Village (개인)",
    description:
      "React Three Fiber 3D 마을과 FastAPI 백엔드로 만든 인터랙티브 포트폴리오입니다. 건물마다 AI NPC 와 대화할 수 있습니다."
  }
];
