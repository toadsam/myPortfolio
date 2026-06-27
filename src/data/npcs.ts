import type {NPCData} from "@/types/portfolio";

export const npcs: NPCData[] = [
  {
    id: "guide-npc",
    sectionId: "intro",
    type: "guide",
    name: "가이드",
    location: "중앙 광장",
    role: "마을 전체 안내",
    dialogue:
      "안녕하세요. 여기는 정재훈의 3D 포트폴리오 마을입니다. 건물을 클릭하면 프로젝트와 경험을 탐험할 수 있어요.",
    position: [0, 0, 1.6],
    color: "#7ecf68",
    accessoryColor: "#f5d26b"
  },
  {
    id: "project-npc",
    sectionId: "projects",
    type: "project",
    name: "프로젝트 안내원",
    location: "프로젝트 구역",
    role: "프로젝트 설명",
    dialogue:
      "이 구역에는 대표 프로젝트가 모여 있습니다. 궁금한 건물을 클릭하면 프로젝트 내부 전시 공간으로 들어갈 수 있어요.",
    position: [-4.2, 0, -0.6],
    color: "#f3b35b",
    accessoryColor: "#5f7be8"
  },
  {
    id: "developer-npc",
    sectionId: "github",
    type: "developer",
    name: "기술 멘토",
    location: "기술 스택 구역",
    role: "기술 스택과 코드 기록 안내",
    dialogue:
      "프론트엔드, 백엔드, 3D, 게임/XR 경험을 기술별로 정리해 두었습니다.",
    position: [4.1, 0, -0.7],
    color: "#68c7cf",
    accessoryColor: "#253342"
  },
  {
    id: "archivist-npc",
    sectionId: "experience",
    type: "archivist",
    name: "기록 관리자",
    location: "경험 기록관",
    role: "경험과 성장 과정 안내",
    dialogue:
      "프로젝트를 만들며 겪은 구현 경험과 성장 과정을 시간순으로 기록하고 있습니다.",
    position: [-3.8, 0, 3.7],
    color: "#c69af0",
    accessoryColor: "#8b5a35"
  },
  {
    id: "contact-npc",
    sectionId: "contact",
    type: "contact",
    name: "연락 담당",
    location: "연락 우체국",
    role: "연락 안내",
    dialogue:
      "협업이나 연락이 필요하다면 이메일과 GitHub 링크를 확인하면 됩니다.",
    position: [3.8, 0, 3.7],
    color: "#ef8f72",
    accessoryColor: "#e8f2ff"
  }
];
