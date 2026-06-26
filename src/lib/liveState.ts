import type {BuildingState, NpcState, VillageState} from "@/types/live";

export function getBuildingState(villageState: VillageState | null, buildingId: string): BuildingState | undefined {
  return villageState?.buildings.find((state) => state.building_id === buildingId);
}

export function getNpcState(villageState: VillageState | null, npcId: string): NpcState | undefined {
  return villageState?.npcs.find((state) => state.npc_id === npcId);
}

export function lightIntensity(lightLevel: BuildingState["light_level"] | undefined): number {
  if (lightLevel === "bright") return 1;
  if (lightLevel === "normal") return 0.65;
  if (lightLevel === "dim") return 0.35;
  return 0;
}

export function moodLabel(mood: NpcState["mood"] | undefined): string {
  if (mood === "busy") return "busy";
  if (mood === "proud") return "proud";
  if (mood === "training") return "training";
  if (mood === "sleepy") return "sleepy";
  return "calm";
}
