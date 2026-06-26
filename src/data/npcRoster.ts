import {villageBuildings} from "@/lib/constants";
import type {NPCData, NPCType, Vector3Tuple} from "@/types/portfolio";

const districtNpcType: Record<string, NPCType> = {
  plaza: "guide",
  projects: "project",
  skills: "developer",
  experience: "archivist",
  contact: "contact",
};

const districtColor: Record<string, {body: string; accessory: string}> = {
  projects: {body: "#f3b35b", accessory: "#5f7be8"},
  skills: {body: "#68c7cf", accessory: "#253342"},
  experience: {body: "#c69af0", accessory: "#8b5a35"},
  contact: {body: "#ef8f72", accessory: "#e8f2ff"},
  plaza: {body: "#7ecf68", accessory: "#f5d26b"},
};

export const autonomousNpcs: NPCData[] = [
  {
    id: "guide-npc",
    sectionId: "intro",
    type: "guide",
    name: "Guide NPC",
    location: "Central Plaza",
    role: "마을 전체 안내",
    dialogue: "안녕하세요. 이곳은 정재훈의 살아있는 포트폴리오 마을입니다.",
    position: [0, 0, 1.6],
    color: "#7ecf68",
    accessoryColor: "#f5d26b",
  },
  ...villageBuildings.map((building, index) => {
    const type = districtNpcType[building.district] ?? "guide";
    const color = districtColor[building.district] ?? districtColor.plaza!;
    const [x, , z] = building.position;
    const [w, , d] = building.size;
    const angle = (index % 8) * (Math.PI / 4);
    const distance = Math.max(w, d) * 0.75 + 0.9;
    const position: Vector3Tuple = [
      x + Math.cos(angle) * distance,
      0,
      z + Math.sin(angle) * distance,
    ];

    return {
      id: `npc-${building.id}`,
      sectionId: building.sectionId,
      type,
      name: `${building.name} NPC`,
      location: building.name,
      role: `${building.name} 담당 NPC`,
      dialogue: `${building.name} 건물을 담당하고 있어요. 이 공간의 역할과 정재훈의 경험을 설명할 수 있습니다.`,
      position,
      color: color.body,
      accessoryColor: color.accessory,
    };
  }),
];
