/**
 * 배전반 효과음과 진동 — 파일 없이 WebAudio 로 합성한다.
 *
 * 매일 여는 도구라 소리는 짧고 작게. 브라우저는 사용자가 한 번 만지기 전에는
 * 소리를 막으므로, AudioContext 는 첫 호출(=첫 조작) 때 만든다. 끄기 여부는
 * 이 기기에만 기억한다(localStorage). 진동은 지원하는 휴대폰에서만 울린다.
 */

const KEY = "admin-sfx-off";

let ctx: AudioContext | null = null;
let muted = readMuted();

function readMuted(): boolean {
  try {
    return typeof window !== "undefined" && localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function isSoundOn(): boolean {
  return !muted;
}

export function setSoundOn(on: boolean) {
  muted = !on;
  try {
    localStorage.setItem(KEY, on ? "0" : "1");
  } catch {
    // 저장이 막힌 브라우저에선 이번 방문 동안만 기억한다
  }
}

function tone(
  freq: number,
  duration = 0.08,
  type: OscillatorType = "square",
  volume = 0.04,
  slideTo?: number
) {
  if (muted || typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as {webkitAudioContext: typeof AudioContext})
        .webkitAudioContext;
    ctx ??= new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (slideTo)
      osc.frequency.exponentialRampToValueAtTime(
        slideTo,
        ctx.currentTime + duration
      );
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // 소리는 장식이다 — 실패해도 조작은 그대로 된다
  }
}

const later = (ms: number, fn: () => void) => window.setTimeout(fn, ms);

export const sfx = {
  /** 눈금 하나. p(0~1)를 주면 게이지가 찰수록 음이 올라간다 */
  tick: (p?: number) =>
    tone(p === undefined ? 1400 : 700 + p * 900, 0.025, "square", 0.017),
  /** 회로를 끄는 소리 — 아래로 떨어진다 */
  off: () => tone(300, 0.15, "square", 0.03, 80),
  /** 레버가 걸리는 소리 */
  clack: () => {
    tone(180, 0.06, "square", 0.05);
    later(40, () => tone(90, 0.08, "square", 0.04));
  },
  /** 회로에 전기가 들어가는 순간 */
  zap: () => tone(900, 0.18, "sawtooth", 0.03, 120),
  /** 목표 달성 */
  chime: () =>
    [660, 880, 1320].forEach((f, i) =>
      later(i * 80, () => tone(f, 0.25, "triangle", 0.05))
    ),
  /** 지시서 완료 · 발행 */
  fuse: () => {
    tone(520, 0.06, "square", 0.04);
    later(60, () => tone(1040, 0.12, "triangle", 0.05));
  },
  /** 송전 버튼이 차오르는 동안 (p: 0~1) */
  charge: (p: number) => tone(200 + p * 600, 0.03, "sine", 0.02),
  /** 송전 완료 */
  power: () =>
    [262, 330, 392, 523, 659].forEach((f, i) =>
      later(i * 110, () => tone(f, 0.4, "triangle", 0.05))
    )
};

export function buzz(pattern: number | number[]) {
  try {
    // 한 번도 화면을 만지기 전에 부르면 크롬이 막고 콘솔에 오류를 남긴다
    const activation = (
      navigator as Navigator & {userActivation?: {hasBeenActive: boolean}}
    ).userActivation;
    if (activation && !activation.hasBeenActive) return;
    navigator.vibrate?.(pattern);
  } catch {
    // 진동을 막은 브라우저 — 조용히 넘어간다
  }
}
