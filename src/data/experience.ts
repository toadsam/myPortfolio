import type {ExperienceItem} from "@/types/portfolio";

// 실제 회사/인턴 경력이 아니라 개인 프로젝트·학습 이력입니다.
// (연도/문구는 [확인필요] — 실제 진행 시기에 맞게 조정하세요)
export const experienceItems: ExperienceItem[] = [
  {
    year: "2024",
    title: "Unity 3D 게임 프로그래밍 (팀)",
    description:
      "DarkLab·TSEROF 등 팀 프로젝트에서 플레이어 제어, 상호작용, 카메라 연출, 스테이지 시스템을 구현하며 C#과 Unity 협업 워크플로를 익혔습니다."
  },
  {
    year: "2025",
    title: "풀스택 웹 서비스 개발 (개인·팀)",
    description:
      "StockFlow·FestFlow·MuscleUp 등에서 Spring Boot 백엔드와 React 프론트를 직접 설계·구현했습니다. SSE·Socket.IO 실시간, JWT/OAuth 인증, 외부 API 폴백 같은 실전 설계를 경험했습니다."
  },
  {
    year: "2026",
    title: "AI Portfolio Village (개인)",
    description:
      "React Three Fiber 3D 마을과 FastAPI 백엔드로, 프로젝트·기술·경험을 탐색하고 AI NPC와 대화하는 인터랙티브 포트폴리오를 만들었습니다."
  }
];
