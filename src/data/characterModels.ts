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

/** Meshy가 캐릭터를 내보내는 기준 높이 (실측: 로봇·전사·루미 모두 1.7000) */
export const MESHY_HEIGHT = 1.7;

// 캐릭터 키는 건물 크기 사다리(constants.ts)에 맞춘다.
//
// 건물을 "1층 상가 3m"로 보고 계산하면 1.05가 나오는데, 실제로 세워 보니
// 사람이 커 보였다. 이 마을 건물은 표준 M(1.9)조차 창이 여러 층 나 있는
// 3~4층짜리로 읽히기 때문이다. 랜드마크(3.1)를 4층으로 잡으면 유닛당 2.5m 쯤이라
// 사람 1.7m는 0.8유닛이다.
export const NPC_HEIGHT = 0.8;

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
  },
  // ─── 의인화 동물 캐스팅 (2026-08-26~) ────────────────────────────────────
  //
  // Meshy 애니메이션 라이브러리에 "Idle" 이라는 이름의 클립이 없어서, 캐릭터마다
  // **걷기/뛰기가 아닌 클립을 idle 로 돌려쓴다**. 이게 그냥 땜빵이 아니라 오히려
  // 낫다 — 전원이 같은 자세로 숨만 쉬는 대신 각자 직업다운 짓을 하고 서 있다.
  //
  // 돌려쓰기가 성립하는 근거: Meshy 클립은 전부 제자리(in-place)다. Hips 에
  // translation 트랙이 있긴 하지만 상하 흔들림뿐이라 앞으로 밀려나지 않는다
  // (기존 lumi 가 같은 구조로 마을에서 멀쩡히 돈다).
  //
  // idle 을 **두 개 이상** 물리면 NpcCharacter 가 IDLE_SWAP_SECONDS 마다
  // 자동으로 갈아탄다 — buffalo 가 그 경우다.
  tortoise: {
    // 클립: elderly_shaky_walk_inplace / walking / running / golf_drive
    // idle ← 제자리걸음. 흔들흔들 서 있는 노인으로 읽힌다.
    // (golf_drive 는 분류 대상이 아니라 등록만 되고 재생되지 않는다)
    url: "/models/characters/tortoise.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["elderly_shaky"]}
  },
  meerkat: {
    // 클립: wave_for_help_3 / walking / running
    // idle ← 손 흔들기. 동아리(ACLUB) 조직책이 사람을 불러 모으는 그림.
    url: "/models/characters/meerkat.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["wave"]}
  },
  buffalo: {
    // 클립: mage_soell_cast(원본 오타 그대로) / ymca_dance / walking / running
    // idle ← 둘 다. 평소엔 허공에 손짓하며 차트를 가리키다가, 9초쯤마다
    // 한 번씩 춤을 춘다. 주식 데스크(MyStock) NPC 라 "장 좋은 날" 로 읽힌다.
    url: "/models/characters/buffalo.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["mage", "ymca"]}
  },
  parrot: {
    // 클립: mirror_viewing / walking / running
    // idle ← 거울 보기. 축제(FestFlow) 사회자 앵무새가 깃털을 다듬는다.
    url: "/models/characters/parrot.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["mirror"]}
  },
  rabbit: {
    // 클립: groovy_walk / walking / running
    //
    // **여기만 후보가 마땅치 않았다.** 걷기가 아닌 클립이 하나도 없어서
    // 스타일 걷기(groovy)를 idle 로 돌렸다 — 제자리에서 리듬 타는 걸로 보인다.
    // 통통 튀는 토끼라 못 봐줄 정도는 아니지만, 서 있는데 발을 구르는 건
    // 사실이다. Meshy 에서 정지 동작(Idle/Wave/Look Around 등)을 하나 받아
    // 다시 병합하면 이 override 만 바꾸면 된다.
    url: "/models/characters/rabbit.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["groovy"]}
  },
  tiger: {
    // 클립: roundhouse_kick / walking / running
    // idle ← 돌려차기. 알고리즘 '도장' 관장이 품새를 연습한다.
    url: "/models/characters/tiger.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["roundhouse"]}
  },
  gorilla: {
    // 클립: idle_03 / walking / running  ← **진짜 Idle 이 들어왔다**
    // 이름에 "idle" 이 있어서 classifyClip 기본 규칙이 알아서 잡는다. override 불필요.
    // (Meshy 원본 이름은 MuscleUp Monkey 지만 마을에서는 근근 헬스장 고릴라다)
    url: "/models/characters/gorilla.glb",
    height: NPC_HEIGHT
  },
  peacock: {
    // 클립: agree_gesture / walking / running
    // idle ← 끄덕이며 동의. 프론트엔드 담당이라 상시 재생해도 튀지 않는다.
    url: "/models/characters/peacock.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["agree"]}
  },
  stork: {
    // 클립: stand_and_drink / walking / running
    // idle ← 서서 물 마시기. 배달 돌다 우체국 앞에서 한숨 돌리는 그림.
    url: "/models/characters/stork.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["drink"]}
  },
  raccoon: {
    // 클립: idle_03 / walking / running  ← 여기도 진짜 Idle. override 불필요.
    url: "/models/characters/raccoon.glb",
    height: NPC_HEIGHT
  },
  bee: {
    // 클립: jumping_jacks / walking / running
    // idle ← 팔벌려뛰기. 가만히 못 있는 Workflow 담당다운 그림.
    url: "/models/characters/bee.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["jumping"]}
  },
  beaver: {
    // 클립: alert / walking / running
    // idle ← 경계. 백엔드가 서버를 지켜보고 선 것처럼 읽힌다.
    url: "/models/characters/beaver.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["alert"]}
  },
  deer: {
    // 클립: wave_for_help_1 / walking / running
    // idle ← 손 흔들기. 숲(TSEROF)의 정령이 지나가는 사람을 부른다.
    url: "/models/characters/deer.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["wave"]}
  },
  owl: {
    // 클립: gangnam_groove / walking / running
    //
    // **이건 취향을 탄다.** 정지 동작이 하나도 없어서 춤을 idle 로 물렸다.
    // 지식 서고 사서가 상시로 춤추는 셈이라 "반전 매력" 이거나 "안 어울림"
    // 둘 중 하나다. 차분한 쪽을 원하면 Meshy 에서 정지 동작을 하나 받아
    // 다시 병합하고 이 override 만 바꾸면 된다.
    url: "/models/characters/owl.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["gangnam"]}
  },
  chameleon: {
    // 클립: magic_genie / walking / running
    // idle ← 마법 부리는 손짓. 3D/모션 담당이 형태를 빚는 것처럼 보인다.
    url: "/models/characters/chameleon.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["magic"]}
  },
  elephant: {
    // 클립: look_around_dumbfounded / walking / running
    // idle ← 두리번거리기. 가치관 비석 앞을 지키는 코끼리.
    url: "/models/characters/elephant.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["look_around"]}
  },
  kangaroo: {
    // 클립: idle_to_push_up / walking / running
    // idle ← 팔굽혀펴기. 헬스장 캥거루라 이보다 맞는 게 없다.
    // (이름에 "idle" 이 들어 있어 override 없이도 잡히지만, 의도를 남겨 둔다)
    url: "/models/characters/kangaroo.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["push_up"]}
  },
  squirrel: {
    // 클립: mage_soell_cast(원본 오타 그대로) / walking / running
    // idle ← 손짓. 투자 타워에서 차트를 가리킨다 — 옆 구역 buffalo 와 같은
    // 클립이라 "주식·투자 담당은 손으로 설명한다" 는 결이 생긴다.
    url: "/models/characters/squirrel.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["mage"]}
  },
  panda: {
    // 클립: collect_object / fall3 / walking / running
    // idle ← 물건 줍기. 도서관 사서가 책을 정리하는 그림.
    // fall3(넘어짐)은 idle 로 쓰면 넘어진 채 반복돼 이상해서 뺐다 — 등록만 된다.
    url: "/models/characters/panda.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["collect"]}
  },
  jaehoon: {
    // 클립: big_wave_hello / talk_passionately / talk_with_right_hand_open
    //       / walking / running
    //
    // **마을에서 유일한 사람 — 정재훈 본인.** 정지 클립이 셋이나 들어와서
    // 전부 idle 에 물렸다. NpcCharacter 가 IDLE_SWAP_SECONDS 마다 갈아타므로
    // 손 흔들다가, 열정적으로 말하다가, 오른손 펴서 설명한다.
    // 마을 총괄답게 표현이 가장 풍부한 NPC 가 된다.
    url: "/models/characters/jaehoon.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["wave_hello", "talk_"]}
  }
};

export const DEFAULT_NPC_MODEL: CharacterModelId = "robot";

// ─── 클립 이름 → 상태 분류 ───────────────────────────────────────────────────
// Meshy는 내보낼 때마다 클립 이름이 제각각이다:
//   robot   "walk", "run"
//   warrior "Armature|walking_man|baselayer"
//   lumi    "walking", "running", "idle_14", "idle_15", "right_uppercut_from_guard"
// 그래서 부분 문자열로 판정한다. idle을 먼저 봐야 "running"이 run으로 간다.
export function classifyClip(
  name: string,
  overrides?: CharacterModel["clipOverrides"]
): CharacterState | null {
  const lower = name.toLowerCase();

  if (overrides) {
    for (const state of ["idle", "walk", "run"] as const) {
      if (
        overrides[state]?.some(pattern => lower.includes(pattern.toLowerCase()))
      )
        return state;
    }
  }

  if (lower.includes("idle")) return "idle";
  if (lower.includes("run")) return "run";
  if (lower.includes("walk")) return "walk";
  return null; // 분류 안 되는 클립(어퍼컷 등)은 상태 머신이 안 건드린다
}
