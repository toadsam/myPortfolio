import {autonomousNpcs} from "@/data/npcRoster";
import {villageBuildings} from "@/lib/constants";
import type {Vector3Tuple} from "@/types/portfolio";

export interface NpcBehaviorProfile {
  npcId: string;
  assignedBuildingId: string;
  home: Vector3Tuple;
  roamRadius: number;
  roleSummary: string;
}

const baseProfiles: Record<string, NpcBehaviorProfile> = {
  "guide-npc": {
    npcId: "guide-npc",
    assignedBuildingId: "central-plaza",
    home: [0, 0, 1.6],
    roamRadius: 2.6,
    roleSummary: "마을 전체와 오늘 활동 상태를 안내합니다.",
  },
  "project-npc": {
    npcId: "project-npc",
    assignedBuildingId: "project-mywave",
    home: [-5.7, 0, 1.5],
    roamRadius: 5.2,
    roleSummary: "프로젝트 건물들의 의미와 구현 경험을 설명합니다.",
  },
  "developer-npc": {
    npcId: "developer-npc",
    assignedBuildingId: "skill-backend",
    home: [4.5, 0, -3.2],
    roamRadius: 4.4,
    roleSummary: "기술 스택과 백엔드/프론트엔드 설계를 설명합니다.",
  },
  "archivist-npc": {
    npcId: "archivist-npc",
    assignedBuildingId: "exp-portfolio",
    home: [6.2, 0, 6.5],
    roamRadius: 3.2,
    roleSummary: "경험과 성장 기록을 정리합니다.",
  },
  "contact-npc": {
    npcId: "contact-npc",
    assignedBuildingId: "post-office",
    home: [1.8, 0, 7.4],
    roamRadius: 2.4,
    roleSummary: "연락과 협업 동선을 안내합니다.",
  },
};

const generatedProfiles = Object.fromEntries(
  autonomousNpcs
    .filter((npc) => npc.id !== "guide-npc")
    .map((npc): [string, NpcBehaviorProfile] => {
      const buildingId = npc.id.replace(/^npc-/, "");
      const building = villageBuildings.find((item) => item.id === buildingId);

      return [
        npc.id,
        {
          npcId: npc.id,
          assignedBuildingId: buildingId,
          home: npc.position,
          roamRadius: building ? Math.max(1.8, Math.max(building.size[0], building.size[2]) * 1.35) : 2.4,
          roleSummary: npc.role,
        },
      ];
    }),
);

export const npcBehaviorProfiles: Record<string, NpcBehaviorProfile> = {
  ...generatedProfiles,
  ...baseProfiles,
};
