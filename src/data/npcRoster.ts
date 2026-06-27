import {villageBuildings} from "@/lib/constants";
import type {NPCData, NPCType, Vector3Tuple} from "@/types/portfolio";

const districtNpcType: Record<string, NPCType> = {
  plaza: "guide",
  projects: "project",
  skills: "developer",
  experience: "archivist",
  contact: "contact"
};

const districtColor: Record<string, {body: string; accessory: string}> = {
  projects: {body: "#f3b35b", accessory: "#5f7be8"},
  skills: {body: "#68c7cf", accessory: "#253342"},
  experience: {body: "#c69af0", accessory: "#8b5a35"},
  contact: {body: "#ef8f72", accessory: "#e8f2ff"},
  plaza: {body: "#7ecf68", accessory: "#f5d26b"}
};

export const autonomousNpcs: NPCData[] = [
  {
    id: "guide-npc",
    sectionId: "intro",
    type: "guide",
    name: "가이드",
    location: "중앙 광장",
    role: "마을 전체 안내",
    dialogue:
      "안녕하세요. 여기는 정재훈의 살아있는 3D 포트폴리오 마을입니다. 건물, NPC, 관리자 기록이 서로 연결되어 있어요.",
    position: [0, 0, 1.6],
    color: "#7ecf68",
    accessoryColor: "#f5d26b"
  },
  ...villageBuildings
    .filter((building) => building.id !== "central-plaza")
    .map((building, index) => {
      const type = districtNpcType[building.district] ?? "guide";
      const color = districtColor[building.district] ?? districtColor.plaza;
      const [x, , z] = building.position;
      const [w, , d] = building.size;
      const angle = (index % 8) * (Math.PI / 4);
      const distance = Math.max(w, d) * 0.75 + 0.9;
      const position: Vector3Tuple = [
        x + Math.cos(angle) * distance,
        0,
        z + Math.sin(angle) * distance
      ];

      return {
        id: `npc-${building.id}`,
        sectionId: building.sectionId,
        type,
        name: `${building.name} 안내원`,
        location: building.name,
        role: `${building.name} 공간 안내`,
        dialogue:
          `${building.name} 건물을 담당하고 있습니다. 이 공간과 관련된 프로젝트나 경험을 자세히 설명할 수 있어요.`,
        position,
        color: color.body,
        accessoryColor: color.accessory
      };
    })
];
