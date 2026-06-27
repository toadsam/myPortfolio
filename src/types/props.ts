// 마을에 배치하는 장식용 prop (GUI 편집 모드로 관리)
export interface PropPlacement {
  id: string; // 고유 id (배치 인스턴스마다)
  glb: string; // public 기준 경로, 예: "/models/props/buildings/tower.glb"
  position: [number, number, number];
  rotationY: number; // Y축 회전 (라디안)
  scale: number; // 균등 스케일
}

// 기존 마을 건물(constants.ts)의 위치/회전/크기 덮어쓰기
export interface BuildingOverride {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
}

export interface PropsLayout {
  props: PropPlacement[];
  buildings?: Record<string, BuildingOverride>; // buildingId → override
}
