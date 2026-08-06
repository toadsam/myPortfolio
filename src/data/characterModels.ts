// NPC/캐릭터 3D 모델 레지스트리.
//
// 새 캐릭터 추가 절차:
//   ① Meshy에서 애니메이션별 GLB를 받아 폴더에 모은다
//   ② node scripts/merge-character.mjs "<폴더>" <이름>   → 클립을 하나로 합침
//   ③ npm run optimize -- characters                     → 텍스처 축소
//   ④ types/portfolio.ts의 CharacterModelId 유니온에 <이름> 추가
//   ⑤ 아래 표에 한 줄 추가 (④를 빼먹으면 컴파일이 막아준다)
//   ⑥ npcRoster.ts의 해당 NPC에 model: "<이름>" 지정

import type {CharacterModelId} from "@/types/portfolio";

export type CharacterState = "idle" | "walk" | "run";

export interface CharacterModel {
  url: string;
  /** 렌더 높이(월드 유닛). GLB 원본 크기와 무관하게 이 높이로 정규화된다 */
  height: number;
  /** 모델이 +Z를 안 보고 있을 때의 보정각(라디안) */
  facing?: number;
  /** 클립 이름 자동 분류가 틀릴 때만 지정. 이름의 일부만 적으면 된다 */
  clipOverrides?: Partial<Record<CharacterState, string[]>>;
}

// Meshy 캐릭터는 전부 높이 1.7 유닛으로 나온다(실측: 로봇/전사/루미 모두 1.7000).
// 기존 NPC가 scale 0.73으로 렌더되던 크기를 그대로 유지하는 값.
export const NPC_HEIGHT = 1.7 * 0.73;

export const characterModels: Record<CharacterModelId, CharacterModel> = {
  robot: {
    url: "/models/characters/neon-robot-npc.glb",
    height: NPC_HEIGHT
  },
  lumi: {
    // 클립: idle_14 / idle_15 / walking / running / right_uppercut_from_guard
    // 어퍼컷은 아직 안 쓰지만 넣어뒀다 (8KB라 비용 없음)
    url: "/models/characters/lumi.glb",
    height: NPC_HEIGHT
  }
};

export const DEFAULT_NPC_MODEL: CharacterModelId = "robot";

// ─── 클립 이름 → 상태 분류 ───────────────────────────────────────────────────
// Meshy는 내보낼 때마다 클립 이름이 제각각이다:
//   robot   "walk", "run"
//   warrior "Armature|walking_man|baselayer"
//   lumi    "walking", "running", "idle_14", "idle_15", "right_uppercut_from_guard"
// 그래서 부분 문자열로 판정한다. idle을 먼저 봐야 "running"이 run으로 간다.
export function classifyClip(name: string, overrides?: CharacterModel["clipOverrides"]): CharacterState | null {
  const lower = name.toLowerCase();

  if (overrides) {
    for (const state of ["idle", "walk", "run"] as const) {
      if (overrides[state]?.some((pattern) => lower.includes(pattern.toLowerCase()))) return state;
    }
  }

  if (lower.includes("idle")) return "idle";
  if (lower.includes("run")) return "run";
  if (lower.includes("walk")) return "walk";
  return null; // 분류 안 되는 클립(어퍼컷 등)은 상태 머신이 안 건드린다
}
