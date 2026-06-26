import type {BuildingData, Vector3Tuple} from "@/types/portfolio";

export interface WorldPoint {
  x: number;
  z: number;
}

export function isInsideBuildingFootprint(
  point: WorldPoint,
  building: Pick<BuildingData, "position" | "size">,
  padding = 0.34,
): boolean {
  const [bx, , bz] = building.position;
  const [w, , d] = building.size;

  return (
    point.x > bx - w / 2 - padding &&
    point.x < bx + w / 2 + padding &&
    point.z > bz - d / 2 - padding &&
    point.z < bz + d / 2 + padding
  );
}

export function isWalkablePosition(
  point: WorldPoint,
  buildings: Array<Pick<BuildingData, "id" | "position" | "size">>,
  options: {padding?: number; ignoreBuildingId?: string} = {},
): boolean {
  return !buildings.some((building) => {
    if (building.id === options.ignoreBuildingId) return false;
    return isInsideBuildingFootprint(point, building, options.padding ?? 0.34);
  });
}

export function distanceXZ(a: Vector3Tuple, b: Vector3Tuple): number {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dz * dz);
}
