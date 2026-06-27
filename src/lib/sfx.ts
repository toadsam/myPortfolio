// 에셋 없이 Web Audio로 생성하는 UI 신스 사운드.
// 브라우저 자동재생 정책상 첫 사용자 제스처에서 AudioContext가 활성화된다.

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.05, at = 0) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  setMuted(v: boolean) {
    muted = v;
  },
  isMuted() {
    return muted;
  },
  // 짧은 호버 블립
  hover() {
    tone(1180, 0.07, "triangle", 0.022);
  },
  // 상승 클릭음
  click() {
    tone(523.25, 0.1, "sine", 0.04);
    tone(783.99, 0.14, "sine", 0.03, 0.05);
  },
  // 입장 — 부드러운 상승 코드
  enter() {
    tone(392, 0.5, "sine", 0.045);
    tone(587.33, 0.55, "sine", 0.035, 0.04);
    tone(783.99, 0.6, "triangle", 0.03, 0.08);
  },
};
