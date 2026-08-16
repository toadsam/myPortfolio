// 마을을 북적이게 하는 무료(비-AI) 상호작용 소스.
// 근접 시 이모트나 짧은 로컬 한 줄 잡담을 띄워 토큰 없이 상시 활기를 만든다.

export const NPC_EMOTES = ["👋", "😄", "❤️", "✨", "🙌", "😆", "👍", "🎶"];

// 지나가다 마주쳤을 때 던지는 짧은 안부/잡담 (누구나 쓰는 범용 대사)
export const NPC_SMALL_TALK = [
  "오, 안녕!",
  "잘 지냈어?",
  "오늘 컨디션 좋아 보인다!",
  "이따 또 봐~",
  "밥은 먹었어?",
  "날씨 좋다, 그치?",
  "방문객 좀 있었어?",
  "재훈이 오늘도 열심이네.",
  "우리 마을 요즘 활기차다!",
  "잠깐 쉬었다 가~",
  "좋은 하루!",
  "역시 넌 최고야 ㅎㅎ"
];

// 총괄 NPC(분신)가 순찰 돌며 친구에게 건네는 따뜻한 안부 한 줄 (AI 실패 시 폴백/무료 버전)
export const OVERSEER_GREETINGS = [
  "얘들아 잘 지내지? 내가 항상 지켜보고 있어!",
  "오늘도 마을 지켜줘서 고마워 ❤️",
  "필요한 거 있으면 언제든 말해~",
  "다들 힘내자! 재훈이도 열심히 하고 있어.",
  "너 요즘 진짜 멋지다, 알지?",
  "잠깐 안부차 들렀어. 별일 없지?"
];

export function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

// 관계용 대표 종류로 정규화 (백엔드 relations.canon 과 동일 규칙)
export function canonKind(npcId: string): string {
  if (npcId === "overseer-npc" || npcId.includes("overseer")) return "overseer";
  if (npcId.includes("codingtest")) return "coding";
  if (npcId === "cs-npc" || npcId.includes("study-cs") || npcId.endsWith("-cs"))
    return "cs";
  if (npcId === "guide-npc") return "guide";
  if (npcId === "developer-npc" || npcId.includes("skill")) return "developer";
  if (npcId === "archivist-npc" || npcId.includes("exp")) return "archivist";
  if (
    npcId === "contact-npc" ||
    npcId.includes("post") ||
    npcId.includes("contact")
  )
    return "contact";
  return "project";
}

// 특정 쌍이 마주칠 때 나오는 러닝개그 (무료, AI 없음)
const PAIR_GAGS: Record<string, string[]> = {
  "developer|project": [
    "또 기술 자랑이야? ㅋㅋ",
    "내 프로젝트가 더 멋지거든~",
    "그거 사실 내가 만든 거야!"
  ],
  "contact|project": [
    "연락 좀 잘 넘겨줘~",
    "또 나한테 떠넘기기? ㅋㅋ",
    "이번엔 네가 응대해!"
  ],
  "coding|developer": [
    "그 문제 시간복잡도 얘기해줘!",
    "DP로 풀었어?",
    "우리 또 삼천포 간다 ㅋㅋ"
  ],
  "coding|cs": ["오늘 몇 문제 풀었어?", "무슨 개념 봤어?", "같이 공부하자!"],
  "guide|project": ["오늘도 수고했어~", "장난 그만 ㅋㅋ", "역시 우리 단짝!"]
};

export function pairGag(aId: string, bId: string): string | null {
  const key = [canonKind(aId), canonKind(bId)].sort().join("|");
  const gags = PAIR_GAGS[key];
  return gags ? gags[Math.floor(Math.random() * gags.length)]! : null;
}
