import type {BuildingState, NpcState, VillageState} from "@/types/live";

export function getBuildingState(
  villageState: VillageState | null,
  buildingId: string
): BuildingState | undefined {
  return villageState?.buildings.find(
    state => state.building_id === buildingId
  );
}

export function getNpcState(
  villageState: VillageState | null,
  npcId: string
): NpcState | undefined {
  return villageState?.npcs.find(state => state.npc_id === npcId);
}

// villageState가 바뀔 때만(30초 주기) 한 번 만들어 재사용하기 위한 Map 빌더 —
// 렌더 바디의 .map() 안에서 매번 Array.find로 선형 탐색하는 것을 피한다.
export function buildBuildingStateMap(
  villageState: VillageState | null
): Map<string, BuildingState> {
  const map = new Map<string, BuildingState>();
  if (!villageState) return map;
  for (const state of villageState.buildings) map.set(state.building_id, state);
  return map;
}

export function buildNpcStateMap(
  villageState: VillageState | null
): Map<string, NpcState> {
  const map = new Map<string, NpcState>();
  if (!villageState) return map;
  for (const state of villageState.npcs) map.set(state.npc_id, state);
  return map;
}

export function lightIntensity(
  lightLevel: BuildingState["light_level"] | undefined
): number {
  if (lightLevel === "bright") return 1;
  if (lightLevel === "normal") return 0.65;
  if (lightLevel === "dim") return 0.35;
  return 0;
}

export function moodLabel(mood: NpcState["mood"] | undefined): string {
  if (mood === "busy") return "busy";
  if (mood === "proud") return "proud";
  if (mood === "training") return "training";
  if (mood === "curious") return "curious";
  if (mood === "focused") return "focused";
  if (mood === "worried") return "worried";
  if (mood === "excited") return "excited";
  if (mood === "sleepy") return "sleepy";
  return "calm";
}
