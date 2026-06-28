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

// 앰비언트 드론 (Developer City 이식) — 저역 사인 2개 + lowpass
let drone: {osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode} | null = null;

// ── 생성형 마을 배경음악 — 코드 패드 + 스파스 벨 아르페지오 + 에코 (에셋 없음) ──
// 잔잔한 코드 진행을 천천히 순환하며, 위에 벨이 띄엄띄엄 떨어진다.
const PROGRESSION: number[][] = [
  [130.81, 196.0, 246.94, 329.63], // Cmaj7 (밝은 보이싱)
  [123.47, 196.0, 293.66, 369.99], // Gmaj7
  [130.81, 220.0, 261.63, 329.63], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
];
const CHORD_DUR = 6; // 초 (살짝 경쾌하게)

let music: {master: GainNode; lp: BiquadFilterNode; delay: DelayNode} | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let chordIdx = 0;

function playChord() {
  const c = getCtx();
  if (!c || !music || muted) return;
  const chord = PROGRESSION[chordIdx % PROGRESSION.length]!;
  chordIdx += 1;
  const t0 = c.currentTime;

  // 패드 (코드 구성음을 부드럽게)
  for (const f of chord) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    o.detune.value = (Math.random() - 0.5) * 6;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.022, t0 + 1.6);
    g.gain.linearRampToValueAtTime(0.018, t0 + CHORD_DUR - 1.5);
    g.gain.linearRampToValueAtTime(0.0001, t0 + CHORD_DUR);
    o.connect(g);
    g.connect(music.lp);
    o.start(t0);
    o.stop(t0 + CHORD_DUR + 0.1);
  }

  // 벨 아르페지오 (한 옥타브 위에서 띄엄띄엄)
  const notes = chord.map((f) => f * 2);
  const hits = 5;
  for (let i = 0; i < hits; i += 1) {
    if (Math.random() < 0.18) continue; // 가끔 쉼 (밝게 — 더 자주)
    const at = 0.4 + i * (CHORD_DUR / hits) + Math.random() * 0.5;
    const f = notes[Math.floor(Math.random() * notes.length)]!;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    const ts = t0 + at;
    g.gain.setValueAtTime(0, ts);
    g.gain.linearRampToValueAtTime(0.03, ts + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ts + 1.4);
    o.connect(g);
    g.connect(music.delay); // 에코
    g.connect(music.lp);
    o.start(ts);
    o.stop(ts + 1.6);
  }
}

function startMusic() {
  if (muted || music) return;
  const c = getCtx();
  if (!c) return;
  const master = c.createGain();
  master.gain.setValueAtTime(0, c.currentTime);
  master.connect(c.destination);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3200; // 더 개방적(밝게)
  lp.connect(master);
  const delay = c.createDelay(1.0);
  delay.delayTime.value = 0.38;
  const fb = c.createGain();
  fb.gain.value = 0.28;
  delay.connect(fb);
  fb.connect(delay);
  delay.connect(master);
  music = {master, lp, delay};
  master.gain.linearRampToValueAtTime(0.5, c.currentTime + 2.2);
  chordIdx = 0;
  playChord();
  musicTimer = setInterval(playChord, CHORD_DUR * 1000);
}

function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  if (!music) return;
  const c = getCtx();
  const m = music;
  music = null;
  if (!c) return;
  m.master.gain.linearRampToValueAtTime(0, c.currentTime + 0.8);
  setTimeout(() => {
    try {
      m.master.disconnect();
    } catch {
      /* noop */
    }
  }, 1000);
}

export const sfx = {
  setMuted(v: boolean) {
    muted = v;
    if (v) sfx.stopAmbient();
  },
  isMuted() {
    return muted;
  },
  // 잔잔한 배경 드론 시작/정지
  startAmbient() {
    if (muted || drone) return;
    const c = getCtx();
    if (!c) return;
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.connect(c.destination);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    lp.connect(g);
    const o1 = c.createOscillator();
    o1.type = "sine";
    o1.frequency.value = 110;
    const o2 = c.createOscillator();
    o2.type = "sine";
    o2.frequency.value = 165;
    o2.detune.value = 4;
    o1.connect(lp);
    o2.connect(lp);
    o1.start();
    o2.start();
    g.gain.linearRampToValueAtTime(0.04, c.currentTime + 1.4);
    drone = {osc1: o1, osc2: o2, gain: g};
    // 드론 위에 잔잔한 마을 배경음악을 얹는다
    startMusic();
  },
  stopAmbient() {
    stopMusic();
    if (!drone) return;
    const c = getCtx();
    const d = drone;
    drone = null;
    if (!c) return;
    d.gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
    setTimeout(() => {
      try {
        d.osc1.stop();
        d.osc2.stop();
      } catch {
        /* already stopped */
      }
    }, 600);
  },
  isAmbientOn() {
    return drone !== null || music !== null;
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
  // 키 입력 틱 — 타자기 한 글자. 피치를 살짝 흔들어 기계식 키보드 느낌
  tick() {
    const f = 2100 + (Math.random() - 0.5) * 600;
    tone(f, 0.025, "square", 0.012);
  },
};
