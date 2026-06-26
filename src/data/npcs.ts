import type {NPCData} from "@/types/portfolio";

export const npcs: NPCData[] = [
  {
    id: "guide-npc",
    sectionId: "intro",
    type: "guide",
    name: "Guide NPC",
    location: "중앙 광장",
    role: "전체 안내",
    dialogue: "안녕하세요. 이곳은 정재훈의 포트폴리오 마을입니다. 프로젝트를 보고 싶다면 연구소로 이동해보세요.",
    position: [0, 0, 1.6],
    color: "#7ecf68",
    accessoryColor: "#f5d26b"
  },
  {
    id: "project-npc",
    sectionId: "projects",
    type: "project",
    name: "Project NPC",
    location: "프로젝트 연구소",
    role: "프로젝트 설명",
    dialogue: "이곳은 정재훈의 프로젝트 연구소입니다. 대표 프로젝트와 맡은 역할을 확인할 수 있습니다.",
    position: [-4.2, 0, -0.6],
    color: "#f3b35b",
    accessoryColor: "#5f7be8"
  },
  {
    id: "developer-npc",
    sectionId: "github",
    type: "developer",
    name: "Developer NPC",
    location: "GitHub 작업실",
    role: "기술 스택과 코드 기록 안내",
    dialogue: "이곳은 개발자 작업실입니다. 사용 기술과 GitHub 기록을 확인할 수 있습니다.",
    position: [4.1, 0, -0.7],
    color: "#68c7cf",
    accessoryColor: "#253342"
  },
  {
    id: "archivist-npc",
    sectionId: "experience",
    type: "archivist",
    name: "Archivist NPC",
    location: "기록관",
    role: "경험과 성장 과정 안내",
    dialogue: "이곳은 기록관입니다. 정재훈이 어떤 과정을 거쳐 성장했는지 볼 수 있습니다.",
    position: [-3.8, 0, 3.7],
    color: "#c69af0",
    accessoryColor: "#8b5a35"
  },
  {
    id: "contact-npc",
    sectionId: "contact",
    type: "contact",
    name: "Contact NPC",
    location: "우체국",
    role: "연락 안내",
    dialogue: "이곳은 우체국입니다. 이메일, GitHub, 블로그 링크를 확인할 수 있습니다.",
    position: [3.8, 0, 3.7],
    color: "#ef8f72",
    accessoryColor: "#e8f2ff"
  }
];
