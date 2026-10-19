"use client";

import {useEffect, useState} from "react";
import {villageBuildings} from "@/lib/constants";
import type {Vector3Tuple} from "@/types/portfolio";

/** 건물 상자 가장자리에서 이 안에 서면 「들어가기」가 뜬다 */
const NEAR = 1.6;

const candidates = villageBuildings.filter(b => b.district !== "plaza");

function nearestBuilding(pos: Vector3Tuple): string | null {
  let best: string | null = null;
  let bestD = NEAR;
  for (const b of candidates) {
    const r = b.rotationY ?? 0;
    const dx = pos[0] - b.position[0];
    const dz = pos[2] - b.position[2];
    // 돌아선 건물은 모델 좌표로 되돌려 잰다(villageWalk 의 상자와 같은 규약)
    const lx = Math.cos(r) * dx - Math.sin(r) * dz;
    const lz = Math.sin(r) * dx + Math.cos(r) * dz;
    const ox = Math.max(0, Math.abs(lx) - b.size[0] / 2);
    const oz = Math.max(0, Math.abs(lz) - b.size[2] / 2);
    const d = Math.hypot(ox, oz);
    if (d < bestD) {
      bestD = d;
      best = b.id;
    }
  }
  return best;
}

/**
 * 걷기 모드에서 건물 가까이 가면 뜨는 「들어가기」 단추.
 *
 * 걷기 모드는 건물 탭이 입장이 아니다(바닥 탭 이동과 부딪힌다). 키보드가 없는
 * 휴대폰은 그러면 건물에 들어갈 길이 없어서, 캐릭터 위치(playerPosRef)를
 * 1/4초마다 보고 가장 가까운 건물을 단추로 내민다.
 */
export function WalkEnterPrompt({
  playerPosRef,
  onRequestEnter
}: {
  playerPosRef: React.MutableRefObject<Vector3Tuple | null>;
  onRequestEnter: (buildingId: string) => void;
}) {
  const [near, setNear] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      const pos = playerPosRef.current;
      const next = pos ? nearestBuilding(pos) : null;
      setNear(prev => (prev === next ? prev : next));
    }, 250);
    return () => clearInterval(t);
  }, [playerPosRef]);

  if (!near) return null;
  const building = villageBuildings.find(b => b.id === near);
  if (!building) return null;

  return (
    <button
      type="button"
      onClick={() => onRequestEnter(building.id)}
      className="v-panel pointer-events-auto absolute bottom-5 right-5 flex items-center gap-2 px-4 py-2.5 text-[13px] font-black text-[#f3e6c8] active:scale-95"
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{
          background: building.accentColor,
          boxShadow: `0 0 6px ${building.accentColor}`
        }}
      />
      {building.name} 들어가기 →
    </button>
  );
}
