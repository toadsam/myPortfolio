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

/**
 * special: 평소엔 안 틀고, idle 중에 **가끔** 한 번 재생되는 특기 동작.
 * (2026-08-27 — 숨쉬기 idle 이 들어온 캐릭터들은 원래 idle 로 돌려쓰던
 * 직업 동작을 여기로 옮겼다. NpcCharacter 가 15~35초 간격으로 튼다)
 */
export type ClipRole = CharacterState | "special";

export interface CharacterModel {
  url: string;
  /** 렌더 높이(월드 유닛). GLB 원본 크기와 무관하게 이 높이로 정규화된다 */
  height: number;
  /** 모델이 +Z를 안 보고 있을 때의 보정각(라디안) */
  facing?: number;
  /** 클립 이름 자동 분류가 틀릴 때만 지정. 이름의 일부만 적으면 된다 */
  clipOverrides?: Partial<Record<ClipRole, string[]>>;
}

/** Meshy가 캐릭터를 내보내는 기준 높이 (실측: 로봇·전사·루미 모두 1.7000) */
export const MESHY_HEIGHT = 1.7;

// 캐릭터 키. **축척이 아니라 가독성 기준으로 잡는다.**
//
// 원래는 건물 크기 사다리에서 역산한 0.8 이었다(랜드마크 3.1 을 4층으로 보면
// 유닛당 2.5m, 사람 1.7m → 0.8유닛). 축척으로는 맞지만 실제로 세워 보니
// 캐릭터가 너무 작았다 — 마을을 둘러보는 거리에서 얼굴도 종도 안 읽힌다.
// 게임에서 캐릭터를 배경보다 크게 잡는 건 흔한 과장이고, 여기가 그 경우다.
//
// 0.8 × 1.5 = 1.2. 표준 건물(1.9)의 63% 로, 여전히 집보다는 확실히 작다.
//
// 이 값은 **플레이어 캐릭터도 같이 쓴다**(WarriorCharacter 의 MODEL_SCALE).
// 일부러 묶어 둔 것이다 — 예전에 따로 놀 때 조종 캐릭터가 집만 했다.
//
// 참고: NPC.tsx 의 이름표(y 1.72~2.46)·히트박스 캡슐(반지름 0.8)과
// closeUp 카메라(y 1.35)는 월드 단위로 박혀 있고 원래 이보다 큰 캐릭터에
// 맞춰진 값이었다. 1.2 로 올리면서 오히려 제자리를 찾았다.
export const NPC_HEIGHT = 1.2;

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
  // 자동으로 갈아탄다.
  //
  // **2026-08-27 — 숨쉬기 idle 전면 배치.** 동물 33종 전원에
  // short_breathe_and_look_around 클립을 `add-character-clip.mjs` 로 추가했다
  // (robot·lumi·jaehoon 만 제외 — 로봇은 클립이 없고 나머지 둘은 진짜 정지
  // 클립을 이미 가졌다). 전원 idle ← 숨쉬기, 원래 idle 로 돌려쓰던 직업 동작은
  // special 로 옮겨 **가끔(15~35초)** 한 번씩 나온다. 수달로 보이는 (13)번
  // 파일은 리포에 몸이 없는 새 캐릭터라 보류 — walking/running 까지 받아야 입고.
  tortoise: {
    // 클립: elderly_shaky_walk_inplace / walking / running / golf_drive / breathe
    // idle ← 숨쉬며 둘러보기. special ← 제자리걸음 + 골프 스윙(드디어 쓰인다).
    url: "/models/characters/tortoise.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["elderly_shaky", "golf"]}
  },
  meerkat: {
    // 클립: wave_for_help_3 / walking / running / breathe
    // idle ← 숨쉬기. special ← 손 흔들기(ACLUB 조직책이 가끔 사람을 부른다).
    url: "/models/characters/meerkat.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["wave"]}
  },
  buffalo: {
    // 클립: mage_soell_cast(원본 오타 그대로) / ymca_dance / walking / running / breathe
    // idle ← 숨쉬기. special ← 차트 손짓·YMCA 춤이 가끔 — "장 좋은 날" 유지.
    url: "/models/characters/buffalo.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["mage", "ymca"]}
  },
  parrot: {
    // 클립: mirror_viewing / walking / running / breathe
    // idle ← 숨쉬기. special ← 거울 보며 깃털 다듬기.
    url: "/models/characters/parrot.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["mirror"]}
  },
  rabbit: {
    // 클립: groovy_walk / walking / running / breathe
    // 드디어 진짜 정지 동작이 생겼다 — 서서 발 구르던 문제 해소.
    // special ← 스타일 걷기(가끔 제자리에서 리듬 탄다).
    url: "/models/characters/rabbit.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["groovy"]}
  },
  tiger: {
    // 클립: roundhouse_kick / walking / running / breathe
    // idle ← 숨쉬기. special ← 돌려차기(가끔 품새 연습).
    url: "/models/characters/tiger.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["roundhouse"]}
  },
  gorilla: {
    // 클립: idle_03 / walking / running / breathe — 정지 동작이 둘.
    // 둘 다 idle 로 물려 IDLE_SWAP 로테이션 (Meshy 원본 이름은 MuscleUp Monkey).
    url: "/models/characters/gorilla.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["idle", "breathe"]}
  },
  peacock: {
    // 클립: agree_gesture / walking / running / breathe
    // idle ← 숨쉬기. special ← 끄덕이며 동의(가끔).
    url: "/models/characters/peacock.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["agree"]}
  },
  stork: {
    // 클립: stand_and_drink / walking / running / breathe
    // idle ← 숨쉬기. special ← 서서 물 마시기(가끔 한숨 돌린다).
    url: "/models/characters/stork.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["drink"]}
  },
  raccoon: {
    // 클립: idle_03 / walking / running / breathe — 정지 동작 둘을 로테이션.
    url: "/models/characters/raccoon.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["idle", "breathe"]}
  },
  bee: {
    // 클립: jumping_jacks / walking / running / breathe
    // idle ← 숨쉬기. special ← 팔벌려뛰기(가끔 몸이 근질거린다).
    url: "/models/characters/bee.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["jumping"]}
  },
  beaver: {
    // 클립: alert / walking / running / breathe
    // idle ← 숨쉬기. special ← 경계(가끔 서버 쪽을 살핀다).
    url: "/models/characters/beaver.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["alert"]}
  },
  deer: {
    // 클립: wave_for_help_1 / walking / running / breathe
    // idle ← 숨쉬기. special ← 손 흔들기(숲의 정령이 가끔 사람을 부른다).
    url: "/models/characters/deer.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["wave"]}
  },
  owl: {
    // 클립: gangnam_groove / walking / running / breathe
    // idle ← 숨쉬기(상시 춤 문제 해소). special ← 강남스타일 — 가끔이라 반전 매력.
    url: "/models/characters/owl.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["gangnam"]}
  },
  chameleon: {
    // 클립: magic_genie / walking / running / breathe
    // idle ← 숨쉬기. special ← 마법 손짓(가끔 형태를 빚는다).
    url: "/models/characters/chameleon.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["magic"]}
  },
  elephant: {
    // 클립: look_around_dumbfounded / walking / running / breathe
    // idle ← 숨쉬기. special ← 두리번거리기.
    // ⚠ special 패턴은 "dumbfounded" 여야 한다 — "look_around" 로 쓰면
    // breathe 클립(short_breathe_and_look_around)까지 special 로 삼킨다.
    url: "/models/characters/elephant.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["dumbfounded"]}
  },
  kangaroo: {
    // 클립: idle_to_push_up / walking / running / breathe
    // idle ← 숨쉬기. special ← 팔굽혀펴기(헬스장 캥거루의 세트 사이 휴식).
    // (special 을 먼저 보는 classifyClip 덕에 "idle_to_push_up" 이 idle 로 안 샌다)
    url: "/models/characters/kangaroo.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["push_up"]}
  },
  squirrel: {
    // 클립: mage_soell_cast(원본 오타 그대로) / walking / running / breathe
    // idle ← 숨쉬기. special ← 차트 손짓(buffalo 와 같은 결 유지).
    url: "/models/characters/squirrel.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["mage"]}
  },
  panda: {
    // 클립: collect_object / fall3 / walking / running / breathe
    // idle ← 숨쉬기. special ← 물건 줍기(가끔 책 정리).
    // fall3(넘어짐)은 여전히 등록만 된다.
    url: "/models/characters/panda.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["collect"]}
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
  },

  // ─── 핵심 NPC 6 + 공방 4 (2026-08-26) ───────────────────────────────────
  //
  // 방문자가 실제로 가장 많이 마주치는 NPC 들이다. 그런데 이번 묶음은
  // **정지 클립이 대부분 "춤"으로 들어왔다.** 쓸 만한 게 그것뿐이라 일단 물렸지만,
  // 아래 ⚠ 표시한 넷은 채용 담당자가 제일 오래 보는 NPC 라 차분한 동작으로
  // 바꾸는 걸 권한다(Meshy 에서 정지 클립 하나 더 받아 재병합하면 끝이다).
  collie: {
    // 클립: cheer_with_both_hands_up / walking / running / breathe
    // idle ← 숨쉬기. special ← 두 손 들어 환영(가끔 — 안내원의 인사).
    url: "/models/characters/collie.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["cheer"]}
  },
  cat: {
    // 클립: funnydancing_01 / walking / running / breathe
    // idle ← 숨쉬기(⚠ 상시 춤 해소). special ← 춤(가끔이라 귀엽다).
    url: "/models/characters/cat.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["funnydancing"]}
  },
  goat: {
    // 클립: funnydancing_03 / walking / running / breathe
    // idle ← 숨쉬기(⚠ "기술 멘토가 상시 춤" 해소). special ← 춤(반전 매력으로 강등).
    url: "/models/characters/goat.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["funnydancing"]}
  },
  armadillo: {
    // 클립: funnydancing_01 / walking / running / breathe
    // idle ← 숨쉬기(⚠ 상시 춤 해소). special ← 춤.
    url: "/models/characters/armadillo.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["funnydancing"]}
  },
  swallow: {
    // 클립: wave_for_help_1 / walking / running / breathe
    // idle ← 숨쉬기. special ← 손 흔들기(가끔 사람을 부른다).
    url: "/models/characters/swallow.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["wave"]}
  },
  anteater: {
    // 클립: bubble_dance / walking / running / breathe
    // idle ← 숨쉬기(⚠ 접수원 상시 춤 해소). special ← 버블댄스(한가할 때 몰래).
    url: "/models/characters/anteater.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["bubble"]}
  },
  raven: {
    // 클립: alert / walking / running / breathe
    // idle ← 숨쉬기. special ← 경계(기획자가 가끔 범위를 잰다).
    url: "/models/characters/raven.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["alert"]}
  },
  bat: {
    // 클립: alert / walking / running / breathe  (2026-08-27 입고, 건물 NPC 4차)
    // 폴더명은 "박쥐"(다크랩 몫)인데 실제 모델은 페넥 교수(Professor Fennec)다.
    // idle ← 숨쉬기. special ← 경계(가끔 주위를 살핀다).
    url: "/models/characters/bat.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["alert"]}
  },
  lion: {
    // 클립: left_uppercut_from_guard / walking / running / breathe
    // idle ← 숨쉬기. special ← 어퍼컷(가끔 파이팅 세리머니).
    url: "/models/characters/lion.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["uppercut"]}
  },
  hedgehog: {
    // 클립: stand_on_pole_and_balance / walking / running / breathe
    // idle ← 숨쉬기. special ← 균형 곡예(비행사의 가끔 묘기).
    url: "/models/characters/hedgehog.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["balance"]}
  },
  wolf: {
    // 클립: funnydancing_03 / walking / running / breathe
    // idle ← 숨쉬기. special ← 춤 — DJ 라 자주 나와도 어울리지만 통일한다.
    url: "/models/characters/wolf.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["funnydancing"]}
  },
  octopus: {
    // 클립: jazz_hands_inplace / walking / running / breathe
    // idle ← 숨쉬기. special ← 재즈 핸즈(가끔 "짜잔").
    url: "/models/characters/octopus.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["jazz"]}
  },
  lemur: {
    // 클립: golf_drive / walking / running / breathe
    // idle ← 숨쉬기(⚠ 상시 골프 해소). special ← 골프 스윙(가끔이라 오히려 개그).
    url: "/models/characters/lemur.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["golf"]}
  },
  mole: {
    // 클립: gangnam_groove / walking / running / breathe
    // idle ← 숨쉬기. special ← 강남스타일(지하에서 가끔 혼자 신남).
    url: "/models/characters/mole.glb",
    height: NPC_HEIGHT,
    clipOverrides: {idle: ["breathe"], special: ["gangnam"]}
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
): ClipRole | null {
  const lower = name.toLowerCase();

  if (overrides) {
    // special 을 먼저 본다 — groovy_walk 처럼 이름에 walk 가 든 특기 동작이
    // 기본 규칙(walk)으로 새는 걸 막는다
    for (const state of ["special", "idle", "walk", "run"] as const) {
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
