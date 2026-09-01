import type {NPCData, NPCType} from "@/types/portfolio";

/**
 * 걷기 모드에서 옆을 지나가면 주민이 건네는 인사.
 *
 * ─── 왜 대본인가 (LLM 을 안 쓴다) ───────────────────────────────────────────
 * 지나갈 때마다 모델을 부르면 비용도 지연도 감당이 안 된다. 마을을 한 바퀴 돌면
 * 스무 번이 넘게 스치는데, 그때마다 1~2초 기다렸다 말풍선이 뜨면 인사가 아니라
 * **버벅임**으로 읽힌다. 공방 잡담(`atelierSmallTalk.ts`)이 같은 이유로 고정
 * 대본이고, 그쪽이 실제로 잘 돌아간다 — 같은 방식을 마을로 가져왔다.
 *
 * 대신 **상황 변수**로 문장을 고른다: 그 NPC 를 처음 보는지, 오늘 이미 봤는지,
 * 오랜만인지, 지금이 밤인지. 이 넷만으로도 "기억하고 있다"는 인상이 난다.
 *
 * ─── 왜 "재훈아" 인가 ────────────────────────────────────────────────────────
 * 걷기 모드의 조종 캐릭터는 마을 주인 본인이다(`player-jaehoon`). 주민이 이름을
 * 부르는 순간 "이 마을은 누구 것인가"가 대사 한 줄로 전달된다. 방문자는 정재훈이
 * 되어 자기 마을을 걷는 셈이다.
 */

export interface GreetingContext {
  /** 이 NPC 를 처음 만나는가 */
  first: boolean;
  /** 지난 만남 이후 하루 넘게 지났는가 */
  longTime: boolean;
  /** 밤인가 (18시~5시) */
  night: boolean;
}

/**
 * 인사를 걸 수 있는 NPC 인가.
 *
 * 광장의 `overseer-npc` 는 **정재훈 본인**이다(마을에서 유일한 사람). 걷기 모드의
 * 조종 캐릭터도 정재훈이라, 빼지 않으면 자기가 자기한테 "재훈아 왔구나!" 한다.
 */
export function canGreet(npc: NPCData): boolean {
  return npc.id !== "overseer-npc";
}

/** 어떤 NPC 든 쓸 수 있는 공통 인사 */
const COMMON: string[] = [
  "재훈아, 왔구나!",
  "어, 재훈아! 오늘도 한 바퀴 도는 중이야?",
  "재훈아 안녕! 마을은 오늘도 조용해.",
  "재훈아, 지나가는 김에 인사!"
];

/** 처음 만났을 때 — 자기소개가 섞인다 */
const FIRST: Partial<Record<NPCType, string[]>> = {
  guide: ["재훈아, 어서 와! 길 잃으면 나한테 물어봐."],
  project: ["재훈아! 여기 뭘 만들었는지 궁금하면 말 걸어."],
  developer: ["재훈아, 왔어? 이 안에 코드 얘기 잔뜩 있어."],
  archivist: ["재훈 씨, 기록은 내가 다 챙겨 뒀어요."],
  contact: ["재훈아! 편지 부칠 일 있으면 여기로 와."]
};

/** 오랜만일 때 */
const LONG_TIME: string[] = [
  "재훈아, 오랜만이다! 어디 갔었어?",
  "한참 안 보이더니, 재훈아 반가워!",
  "재훈아! 얼굴 잊어버리는 줄 알았잖아."
];

/** 밤 */
const NIGHT: string[] = [
  "재훈아, 이 시간까지 안 자고?",
  "밤공기 좋지. 재훈아, 조심히 다녀.",
  "재훈아! 등불 켜 뒀어, 발밑 조심해."
];

/** 직군별 평상시 인사 — 그 NPC 가 뭘 하는 사람인지가 드러나게 */
const BY_TYPE: Record<NPCType, string[]> = {
  guide: [
    "재훈아, 오늘은 어디부터 볼까?",
    "재훈아! 광장 쪽은 방금 정리해 뒀어.",
    "길 안내 필요하면 불러, 재훈아."
  ],
  project: [
    "재훈아, 이거 만들 때 고생 많았지.",
    "재훈아! 여기 들어와서 한 번 볼래?",
    "재훈아, 이 프로젝트 얘기 또 해도 돼?"
  ],
  developer: [
    "재훈아, 그 버그 결국 잡았더라?",
    "재훈아! 오늘 커밋은 했고?",
    "재훈아, 이쪽 구조 얘기 좀 하자."
  ],
  archivist: [
    "재훈 씨, 기록은 잘 남기고 있죠?",
    "재훈 씨! 그때 그 일도 다 적어 뒀어요.",
    "재훈 씨, 연혁 보러 온 거예요?"
  ],
  contact: [
    "재훈아, 편지 왔어!",
    "재훈아! 연락 남기고 간 사람 있어.",
    "재훈아, 우체통 한 번 봐 봐."
  ]
};

/**
 * 인사 한 줄 고르기. **난수를 쓰지 않는다** — 같은 상황에서 같은 NPC 가 매번
 * 다른 말을 하면 대본이 아니라 소음이 된다. NPC id 와 만난 횟수를 섞어 돌린다.
 */
export function pickGreeting(
  npc: NPCData,
  metCount: number,
  ctx: GreetingContext
): string {
  const pool = ctx.first
    ? FIRST[npc.type] ?? BY_TYPE[npc.type] ?? COMMON
    : ctx.longTime
    ? LONG_TIME
    : ctx.night
    ? NIGHT
    : BY_TYPE[npc.type] ?? COMMON;

  let seed = metCount;
  for (let i = 0; i < npc.id.length; i++)
    seed = (seed * 31 + npc.id.charCodeAt(i)) | 0;
  return pool[Math.abs(seed) % pool.length];
}
