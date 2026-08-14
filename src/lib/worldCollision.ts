import type {BuildingData, Vector3Tuple} from "@/types/portfolio";

export interface WorldPoint {
  x: number;
  z: number;
}

export function isInsideBuildingFootprint(
  point: WorldPoint,
  building: Pick<BuildingData, "position" | "size" | "rotationY">,
  padding = 0.34
): boolean {
  const [bx, , bz] = building.position;
  const [w, , d] = building.size;
  // 건물이 임의 각으로 돌므로(고리 배치) 점을 모델 좌표로 역회전해 재야 한다.
  // rotationY=r 은 +X 를 (cos r, −sin r) 로 돌린다 — 역은 전치 행렬.
  const r = building.rotationY ?? 0;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const dx = point.x - bx;
  const dz = point.z - bz;
  const lx = c * dx - s * dz;
  const lz = s * dx + c * dz;

  return Math.abs(lx) < w / 2 + padding && Math.abs(lz) < d / 2 + padding;
}

export function isWalkablePosition(
  point: WorldPoint,
  buildings: Array<
    Pick<BuildingData, "id" | "position" | "size" | "rotationY">
  >,
  options: {padding?: number; ignoreBuildingId?: string} = {}
): boolean {
  return !buildings.some(building => {
    if (building.id === options.ignoreBuildingId) return false;
    return isInsideBuildingFootprint(point, building, options.padding ?? 0.34);
  });
}

export function distanceXZ(a: Vector3Tuple, b: Vector3Tuple): number {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dz * dz);
}
