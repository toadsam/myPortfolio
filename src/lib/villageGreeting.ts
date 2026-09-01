/**
 * 걷기 모드 인사의 **교통정리**.
 *
 * 인사 자체는 NPC 가 각자 판단한다(자기 위치를 자기가 안다). 그런데 각자 판단만
 * 하면 광장처럼 주민이 모인 곳에서 **예닐곱이 동시에 말풍선을 띄운다** — 반가운
 * 게 아니라 아수라장이다. 그래서 "지금 인사해도 되나"를 이 모듈이 혼자 정한다.
 *
 * 규칙 셋:
 *   ① 동시에 하나만 — 말풍선이 겹치면 읽을 수가 없다
 *   ② 인사끼리 최소 간격 — 하나 끝나자마자 옆 사람이 이어 받으면 릴레이가 된다
 *   ③ NPC 당 쿨다운 — 같은 사람 앞을 왔다 갔다 하면 계속 인사받는다
 *
 * 모듈 전역 상태인 이유: NPC 30명이 공유해야 하는데 React state 로 두면 인사
 * 한 번에 마을이 통째로 다시 렌더된다(정적 자식을 memo 로 묶어 둔 사정과 같다).
 */

/** 이 거리 안에 들어오면 인사한다 (캐릭터 키 1.2 기준 서너 배) */
export const GREET_RADIUS = 5;
/**
 * 인사하러 다가가 있는 시간(초). 말풍선(3.6초)보다 조금 길어야 손을 흔드는
 * 동작이 끝까지 나온다.
 */
export const GREET_APPROACH_SECONDS = 5;
/** 손님 앞 이만큼 떨어져 선다 — 코앞까지 오면 화면을 가린다 */
export const GREET_STAND_DIST = 1.8;
/** 말풍선이 떠 있는 시간 */
export const GREET_DURATION_MS = 3600;
/** 같은 NPC 가 다시 인사하기까지 */
const NPC_COOLDOWN_MS = 90_000;
/** 인사와 인사 사이 최소 간격 */
const GLOBAL_GAP_MS = 2600;

let busyUntil = 0;
let lastGreetAt = 0;
const lastByNpc = new Map<string, number>();

/**
 * 지금 이 NPC 가 인사해도 되나. 되면 자리를 **잡고** true 를 준다
 * (물어보기만 하는 함수가 아니다 — 부르는 쪽이 곧바로 말풍선을 띄운다).
 */
export function claimGreeting(npcId: string): boolean {
  const now = Date.now();
  if (now < busyUntil) return false;
  if (now - lastGreetAt < GLOBAL_GAP_MS) return false;
  const last = lastByNpc.get(npcId) ?? 0;
  if (now - last < NPC_COOLDOWN_MS) return false;

  busyUntil = now + GREET_DURATION_MS;
  lastGreetAt = now;
  lastByNpc.set(npcId, now);
  return true;
}

/** 걷기 모드를 나갔다 들어오면 초기화 — 안 그러면 돌아와도 다들 입을 다물고 있다 */
export function resetGreetings(): void {
  busyUntil = 0;
  lastGreetAt = 0;
  lastByNpc.clear();
}

// ─── 만난 기록 ───────────────────────────────────────────────────────────────
// "처음 뵙네요 / 오랜만이다" 를 만드는 값. 서버를 부르지 않는다 — 이건 방문자
// 브라우저 안에서만 의미가 있고, 실패해도 인사는 계속돼야 한다(시크릿 창에서
// localStorage 접근 자체가 던지는 브라우저가 있다).

const KEY = "village.greet.met";

interface MetRecord {
  n: number;
  at: number;
}

function readAll(): Record<string, MetRecord> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, MetRecord>) : {};
  } catch {
    return {};
  }
}

export function readMet(npcId: string): MetRecord {
  return readAll()[npcId] ?? {n: 0, at: 0};
}

export function markMet(npcId: string): void {
  try {
    const all = readAll();
    const prev = all[npcId] ?? {n: 0, at: 0};
    all[npcId] = {n: prev.n + 1, at: Date.now()};
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // 저장이 안 되면 매번 "처음 뵙네요" 가 된다. 인사가 아예 안 되는 것보다 낫다.
  }
}
