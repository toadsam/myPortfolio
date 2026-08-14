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
  "overseer-npc": {
    npcId: "overseer-npc",
    assignedBuildingId: "central-plaza",
    home: [0, 0, 0],
    roamRadius: 16, // 마을 전역을 자유롭게 돌아다니며 NPC들 안부를 챙긴다
    roleSummary:
      "마을 전역을 돌아다니며 모든 NPC를 살피고 챙기는 따뜻한 총괄 관리자입니다."
  },
  "guide-npc": {
    npcId: "guide-npc",
    assignedBuildingId: "central-plaza",
    home: [0, 0, 1.6],
    roamRadius: 2.6,
    roleSummary: "마을 전체 흐름과 오늘의 활동 상태를 안내합니다."
  },
  "project-npc": {
    npcId: "project-npc",
    assignedBuildingId: "project-mystock",
    home: [-2.6, 0, -20.2],
    roamRadius: 5.2,
    roleSummary: "대표 프로젝트와 구현 난이도를 추천합니다."
  },
  "developer-npc": {
    npcId: "developer-npc",
    assignedBuildingId: "skill-backend",
    home: [18, 0, -12.9],
    roamRadius: 4.4,
    roleSummary: "기술 스택과 개발 판단을 설명합니다."
  },
  "archivist-npc": {
    npcId: "archivist-npc",
    assignedBuildingId: "exp-portfolio",
    home: [-18.4, 0, -11.7],
    roamRadius: 3.2,
    roleSummary: "경험, 회고, 성장 기록을 정리합니다."
  },
  "contact-npc": {
    npcId: "contact-npc",
    assignedBuildingId: "post-office",
    home: [0, 0, 21.9],
    roamRadius: 2.4,
    roleSummary: "연락과 협업 동선을 안내합니다."
  }
};

const generatedProfiles = Object.fromEntries(
  autonomousNpcs
    .filter(npc => !baseProfiles[npc.id])
    .map((npc): [string, NpcBehaviorProfile] => {
      const buildingId = npc.id.replace(/^npc-/, "");
      const building = villageBuildings.find(item => item.id === buildingId);

      return [
        npc.id,
        {
          npcId: npc.id,
          assignedBuildingId: buildingId,
          home: npc.position,
          roamRadius: building
            ? Math.max(1.8, Math.max(building.size[0], building.size[2]) * 1.35)
            : 2.4,
          roleSummary: npc.agent?.specialty ?? npc.role
        }
      ];
    })
);

export const npcBehaviorProfiles: Record<string, NpcBehaviorProfile> = {
  ...generatedProfiles,
  ...baseProfiles
};
