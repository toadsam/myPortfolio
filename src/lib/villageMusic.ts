// 마을 배경음악 — 오디오 파일 없이 **작곡해서** 연주한다.
//
// ─── 왜 다시 만들었나 ────────────────────────────────────────────────────────
// 예전 것(sfx.ts 의 startMusic)은 음악이 아니라 **지속음 패드**였다: 오실레이터
// 셋을 켜 두고 볼륨만 흔들고, 그 위에 벨을 난수로 떨어뜨렸다. 멜로디도 리듬도
// 화성 진행도 없다. 톤이 나쁜 게 아니라 음악의 구성 요소가 없어서, 몇 분씩
// 돌아다니는 화면에 깔리면 "웅—" 하는 소음으로 들린다. 실제로 꺼 두고 쓰셨다.
//
// ─── 왜 파일이 아니라 합성인가 ───────────────────────────────────────────────
// mp3 한 곡이 3~4MB인데 이 프로젝트는 텍스처 예산이 340MB 경고선에 붙어 있고
// GLB 만 20MB다. 합성은 용량 0이고, 루프 이음매가 없고, 무엇보다 **시간대와
// 걷는 상태에 반응**한다 — 녹음 파일로는 못 하는 것이고 이 마을은 이미 그 값을
// 다 갖고 있다.
//
// ─── 소리를 결정하는 것 셋 ───────────────────────────────────────────────────
// ① **리버브.** 예전 것과 지금의 차이 중 제일 큰 항목이다. 마른 오실레이터는
//    무엇을 연주해도 삑삑거린다. 잡음을 지수 감쇠시킨 임펄스를 즉석에서 구워
//    ConvolverNode 에 물린다(파일 없이).
// ② **예약(lookahead).** setInterval 로 음을 직접 울리면 타이밍이 흔들린다.
//    25ms 마다 깨어나 0.2초 앞까지 **AudioContext 시계에** 예약한다.
// ③ **모티프.** 음을 난수로 고르면 금방 "삑삑거리는 소리"가 된다. 짧은 음형
//    몇 개를 코드 구성음에 맞춰 변주한다.

type Voice = "harp" | "flute" | "pad" | "bass" | "shaker" | "bell" | "click";

/** F 장조 — 따뜻하고 목가적인 조성. 도(261.63)를 기준으로 반음 계산 */
const A4 = 440;
const midi = (n: number) => A4 * Math.pow(2, (n - 69) / 12);

/**
 * F 장조의 음 이름들(피치 클래스). F G A Bb C D E.
 *
 * 지나가는 음을 "코드음 + 2반음" 으로 올렸더니 **조성 밖 음이 나왔다** —
 * Am7 의 E 에서 +2 는 F#, Bbmaj7 의 A 에서 +2 는 B 다. 둘 다 F 장조에 없다.
 * 실제로 64마디를 검사해 6개가 잡혔다(2026-08-30). 반음이 아니라 **음계를 따라**
 * 한 칸 올려야 한다.
 */
const KEY_PCS = [5, 7, 9, 10, 0, 2, 4];

/** n 보다 높은 가장 가까운 조성 안 음 */
function scaleUp(n: number): number {
  for (let m = n + 1; m <= n + 3; m++)
    if (KEY_PCS.includes(((m % 12) + 12) % 12)) return m;
  return n + 2;
}

/**
 * 화성 진행. 마디당 코드 하나, 16마디 한 바퀴(약 49초).
 *
 * 앞 8마디는 I–iii–IV–V 로 밝게 오르고, 뒤 8마디는 vi 로 한 번 그늘을 만든 뒤
 * 다시 I 로 돌아온다. "왕도 진행"이라 부르는 그 흐름이고, 동화풍 마을 음악이
 * 기대하는 온도가 정확히 여기다.
 *
 * 숫자는 근음의 MIDI 노트, 두 번째는 코드 구성음(근음 기준 반음).
 */
const PROGRESSION: Array<{root: number; tones: number[]}> = [
  {root: 53, tones: [0, 4, 7, 11]}, // F  maj7
  {root: 53, tones: [0, 4, 7, 11]},
  {root: 57, tones: [0, 3, 7, 10]}, // Am7
  {root: 57, tones: [0, 3, 7, 10]},
  {root: 58, tones: [0, 4, 7, 11]}, // Bb maj7
  {root: 58, tones: [0, 4, 7, 11]},
  {root: 60, tones: [0, 4, 7, 10]}, // C7
  {root: 60, tones: [0, 4, 7, 10]},
  {root: 62, tones: [0, 3, 7, 10]}, // Dm7
  {root: 62, tones: [0, 3, 7, 10]},
  {root: 58, tones: [0, 4, 7, 11]}, // Bb maj7
  {root: 58, tones: [0, 4, 7, 11]},
  {root: 60, tones: [0, 4, 7, 10]}, // C7
  {root: 60, tones: [0, 4, 7, 10]},
  {root: 53, tones: [0, 4, 7, 11]}, // F  maj7 — 귀환
  {root: 53, tones: [0, 4, 7, 11]}
];

// ─── 신나게 (2026-08-30) ─────────────────────────────────────────────────────
// 처음엔 78 BPM 에 패드 중심이라 "잔잔"을 넘어 **늘어졌다**. 마을을 뛰어다니는
// 화면인데 음악이 자장가였다. 셋을 바꿔 흥을 만든다:
//
//   ① 템포 78 → 108. 같은 진행이 35초에 한 바퀴 돈다
//   ② **뚱-빠 베이스** — 1·3박은 낮은 근음, 2·4박은 5도를 짧게. 폴카·행진곡이
//      신나게 들리는 이유가 사실상 이 한 가지다
//   ③ **스윙** — 뒷 8분음표를 살짝 늦춘다. 칼같이 맞으면 기계가 치는 소리다
const BPM = 108;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
/** 뒷 8분음표를 8분음표 길이의 이만큼 뒤로 민다 */
const SWING = 0.14;
/** i 번째 8분음표의 실제 시작 시각(마디 안) */
const eighth = (i: number) => (i * BEAT) / 2 + (i % 2 ? (BEAT / 2) * SWING : 0);

/**
 * 멜로디 모티프 — 코드 구성음 인덱스의 **방향 패턴**이다. 절대 음이 아니라
 * 패턴이라, 코드가 바뀌어도 같은 노래로 들리면서 화성에는 늘 맞는다.
 * [코드음 인덱스 오프셋, 길이(박)] 쌍.
 */
const MOTIFS: Array<Array<[number, number]>> = [
  // 짧게 튀어 오르고 길게 앉는다 — 제일 신나는 형태
  [
    [0, 0.5],
    [2, 0.5],
    [1, 0.5],
    [3, 1.5],
    [2, 1]
  ],
  [
    [2, 0.5],
    [3, 0.5],
    [2, 0.5],
    [1, 0.5],
    [0, 2]
  ],
  // 점음표 — 걸음이 붙는 리듬
  [
    [0, 0.75],
    [1, 0.25],
    [2, 0.75],
    [3, 0.25],
    [2, 2]
  ],
  [
    [3, 0.5],
    [2, 0.5],
    [1, 1],
    [2, 0.5],
    [3, 1.5]
  ]
];

/** 재현 가능한 난수 — 같은 마디는 늘 같게 울린다(들을 때마다 딴 곡이면 곤란) */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type Layers = Record<Voice, boolean>;

/** 한 음 — 시간은 마디 시작으로부터의 초 */
export interface NoteEvent {
  voice: Voice;
  /** 셰이커는 음정이 없다 */
  note: number | null;
  at: number;
  dur: number;
  vol: number;
}

/**
 * 한 마디의 악보를 **순수 함수로** 만든다. WebAudio 를 안 건드리므로 Node 에서
 * 그대로 돌려 검사할 수 있다 — 소리를 못 듣는 채로 "화성에 맞는 음만 나오는가,
 * 박자가 마디를 넘지 않는가" 를 확인하려면 이 분리가 필요하다.
 */
export function planBar(bar: number, on: Layers): NoteEvent[] {
  const out: NoteEvent[] = [];
  const chord = PROGRESSION[bar % PROGRESSION.length]!;
  const rand = rng(bar * 2654435761);
  const notes = chord.tones.map(t => chord.root + t);
  const fifth = chord.root + 7;

  // ── 패드: 화성만 얇게 받쳐 준다 ────────────────────────────────────────
  // 빠른 곡에서 패드가 두꺼우면 아래가 뭉개져 오히려 처진다. 예전 0.03 에서 낮췄다.
  if (on.pad)
    for (const n of notes)
      out.push({voice: "pad", note: n, at: 0, dur: BAR * 1.02, vol: 0.018});

  // ── 베이스: 뚱-빠 ──────────────────────────────────────────────────────
  if (on.bass) {
    for (let b = 0; b < 4; b++) {
      const low = b % 2 === 0;
      out.push({
        voice: "bass",
        note: low ? chord.root - 12 : fifth - 12,
        at: b * BEAT,
        // 짧게 끊어야 통통 튄다. 길게 끌면 그대로 늘어진다.
        dur: low ? BEAT * 0.5 : BEAT * 0.34,
        vol: low ? 0.085 : 0.05
      });
    }
  }

  // ── 하프: 스윙 8분음표, 마디 끝에 16분 장식 ────────────────────────────
  if (on.harp) {
    const up = bar % 2 === 0;
    for (let i = 0; i < 8; i++) {
      if (!on.flute && i % 2 === 1) continue; // 밤엔 절반만
      if (rand() < 0.06) continue;
      const idx = up ? i : 7 - i;
      const n = notes[idx % notes.length]! + (idx >= notes.length ? 12 : 0);
      out.push({
        voice: "harp",
        note: n + 12,
        at: eighth(i),
        dur: 0.9,
        vol: 0.05 + rand() * 0.02
      });
    }
    // 두 마디에 한 번, 마지막 박에 16분 세 개로 다음 마디로 넘어간다
    if (on.flute && bar % 2 === 1) {
      for (let k = 0; k < 3; k++)
        out.push({
          voice: "harp",
          note: notes[k % notes.length]! + 24,
          at: BEAT * 3.25 + k * (BEAT / 4),
          dur: 0.5,
          vol: 0.045
        });
    }
  }

  // ── 멜로디: 이제 **매 마디** 나온다 ────────────────────────────────────
  if (on.flute) {
    const motif = MOTIFS[Math.floor(rand() * MOTIFS.length)]!;
    let at = 0;
    for (const [step, len] of motif) {
      const base = notes[step % notes.length]!;
      const raw = base + 12 + (step >= notes.length ? 12 : 0);
      const n = rand() < 0.22 ? scaleUp(raw) : raw;
      if (at + len * BEAT > BAR + 0.001) break;
      out.push({
        voice: "flute",
        // 스타카토 — 음을 붙여 끌면 활기가 죽는다
        note: n,
        at,
        dur: len * BEAT * (len <= 0.5 ? 0.62 : 0.85),
        vol: 0.048
      });
      at += len * BEAT;
    }
  }

  // ── 타악: 상시 ─────────────────────────────────────────────────────────
  // 예전엔 걸을 때만 넣었는데, 그래서 서 있으면 곡이 통째로 심심했다.
  // 박자를 아주 여리게 늘 깔고, **걸을 때만** 뒷박 셰이커를 더한다.
  if (on.click)
    for (let b = 0; b < 4; b++)
      out.push({
        voice: "click",
        note: null,
        at: b * BEAT,
        dur: 0.05,
        vol: b % 2 === 0 ? 0.018 : 0.012
      });

  if (on.shaker)
    for (let i = 1; i < 8; i += 2)
      out.push({
        voice: "shaker",
        note: null,
        at: eighth(i),
        dur: 0.1,
        vol: 0.016
      });

  // ── 종: 네 마디마다 한 번, 프레이즈 끝을 짚어 준다 ─────────────────────
  if (on.bell && bar % 4 === 3)
    out.push({
      voice: "bell",
      note: chord.root + 24,
      at: BEAT * 3,
      dur: 1.6,
      vol: 0.035
    });

  return out;
}

export interface SceneHint {
  /** 0~23. 생략하면 실제 시각 */
  hour?: number;
  /** 걷기 모드로 돌아다니는 중인가 — 가벼운 타악이 붙는다 */
  walking?: boolean;
}

class VillageMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wet: GainNode | null = null;
  private dry: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextBar = 0;
  private barIndex = 0;
  private scene: SceneHint = {};
  private running = false;

  setScene(hint: SceneHint) {
    this.scene = {...this.scene, ...hint};
  }

  isPlaying() {
    return this.running;
  }

  start() {
    if (this.running) return;
    const ctx = this.ensure();
    if (!ctx) return;
    this.running = true;
    this.barIndex = 0;
    // 첫 마디를 조금 뒤로 잡아, 켜자마자 음이 잘리지 않게 한다
    this.nextBar = ctx.currentTime + 0.25;
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.master!.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);
    this.timer = setInterval(() => this.tick(), 25);
    this.tick();
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    // 갑자기 끊으면 딸깍 소리가 난다
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setValueAtTime(this.master.gain.value, ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
  }

  // ─── 배선 ────────────────────────────────────────────────────────────────
  private ensure(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return this.ctx;
    }
    if (typeof window === "undefined") return null;
    const AC =
      window.AudioContext ||
      (window as unknown as {webkitAudioContext: typeof AudioContext})
        .webkitAudioContext;
    if (!AC) return null;
    try {
      const ctx = new AC();
      this.ctx = ctx;

      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(ctx.destination);

      // 전체를 살짝 덮어 날카로움을 깎는다
      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 5200;
      tone.connect(master);

      const dry = ctx.createGain();
      dry.gain.value = 0.75;
      dry.connect(tone);

      const wet = ctx.createGain();
      wet.gain.value = 0.42;
      const reverb = ctx.createConvolver();
      reverb.buffer = this.makeImpulse(ctx, 2.6, 2.4);
      wet.connect(reverb);
      reverb.connect(tone);

      this.master = master;
      this.dry = dry;
      this.wet = wet;
      return ctx;
    } catch {
      this.ctx = null;
      return null;
    }
  }

  /**
   * 리버브용 임펄스를 즉석에서 굽는다. 잡음을 지수로 감쇠시킨 것뿐인데,
   * 마른 신스와 "방 안에서 울리는 악기"를 가르는 게 사실상 이 한 조각이다.
   */
  private makeImpulse(ctx: AudioContext, seconds: number, decay: number) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        // 앞부분을 살짝 눌러 초기 반사가 튀지 않게 한다
        data[i] =
          (Math.random() * 2 - 1) *
          Math.pow(1 - t, decay) *
          (t < 0.01 ? t * 100 : 1);
      }
    }
    return buf;
  }

  // ─── 예약 루프 ───────────────────────────────────────────────────────────
  private tick() {
    const ctx = this.ctx;
    if (!ctx || !this.running) return;
    // 0.2초 앞까지 채워 둔다. 브라우저가 잠깐 바빠도 음이 안 끊긴다.
    while (this.nextBar < ctx.currentTime + 0.2) {
      this.scheduleBar(this.nextBar, this.barIndex);
      this.nextBar += BAR;
      this.barIndex += 1;
    }
  }

  /** 지금 시간대의 편성 — 낮엔 다 나오고, 밤엔 하프와 패드만 남는다 */
  private layers(): Layers {
    const h = this.scene.hour ?? new Date().getHours();
    const night = h >= 20 || h < 5;
    const dawn = h >= 5 && h < 8;
    return {
      harp: true,
      // 밤에 멜로디가 울면 잠든 마을이 안 된다
      flute: !night && !dawn,
      pad: true,
      bass: !night,
      // 박자는 늘 깔되 밤에는 뺀다
      click: !night && !dawn,
      // 걸을 때만 — 서 있는 화면에 뒷박까지 깔리면 재촉당하는 느낌이 든다
      shaker: !!this.scene.walking && !night,
      bell: !dawn
    };
  }

  private scheduleBar(t0: number, bar: number) {
    if (!this.ctx) return;
    for (const ev of planBar(bar, this.layers())) {
      this.playNote(
        ev.voice,
        ev.note === null ? 0 : midi(ev.note),
        t0 + ev.at,
        ev.dur,
        ev.vol
      );
    }
  }

  // ─── 악기 ────────────────────────────────────────────────────────────────
  private playNote(
    voice: Voice,
    freq: number,
    at: number,
    dur: number,
    vol: number
  ) {
    const ctx = this.ctx;
    if (!ctx || !this.dry || !this.wet) return;

    const g = ctx.createGain();
    g.connect(this.dry);
    g.connect(this.wet);

    if (voice === "shaker" || voice === "click") {
      // 잡음 한 조각 — 오실레이터로는 못 내는 소리다
      const len = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      if (voice === "shaker") {
        f.type = "highpass";
        f.frequency.value = 4200;
      } else {
        // 나무 블록 — 좁은 대역만 남기면 "톡" 하는 소리가 된다
        f.type = "bandpass";
        f.frequency.value = 1750;
        f.Q.value = 6;
      }
      src.connect(f);
      f.connect(g);
      g.gain.setValueAtTime(vol, at);
      src.start(at);
      src.stop(at + dur);
      return;
    }

    const o = ctx.createOscillator();
    let attack = 0.01;
    let release = dur;

    if (voice === "harp") {
      // 하프·첼레스타 — 즉시 튕기고 길게 잦아든다
      o.type = "triangle";
      attack = 0.006;
      const o2 = ctx.createOscillator();
      o2.type = "sine";
      o2.frequency.value = freq * 2;
      o2.detune.value = 4;
      const g2 = ctx.createGain();
      g2.gain.value = 0.35; // 배음을 살짝 얹어 금속성을 준다
      o2.connect(g2);
      g2.connect(g);
      o2.start(at);
      o2.stop(at + dur + 0.1);
    } else if (voice === "flute") {
      o.type = "sine";
      // 스타카토 음(0.1초 안팎)에는 0.07초 어택이 음 길이의 대부분이다 —
      // 소리가 제 크기까지 못 올라가고 뭉개진다. 짧은 음은 어택도 짧게.
      attack = Math.min(0.07, dur * 0.4);
      release = dur + 0.25;
      // 아주 얕은 비브라토 — 없으면 기계가 부는 소리가 된다
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      lfo.frequency.value = 5.2;
      lg.gain.value = 3.5;
      lfo.connect(lg);
      lg.connect(o.detune);
      lfo.start(at);
      lfo.stop(at + release + 0.1);
    } else if (voice === "bell") {
      // 글로켄슈필 — 사인 하나에 배음을 얹고 길게 잦아든다
      o.type = "sine";
      attack = 0.004;
      const o2 = ctx.createOscillator();
      o2.type = "sine";
      o2.frequency.value = freq * 2.76; // 비정수 배음이 금속성을 만든다
      const g2 = ctx.createGain();
      g2.gain.value = 0.18;
      o2.connect(g2);
      g2.connect(g);
      o2.start(at);
      o2.stop(at + dur + 0.1);
    } else if (voice === "pad") {
      o.type = "triangle";
      attack = 1.2;
      o.detune.value = (Math.random() - 0.5) * 8;
    } else {
      // bass
      o.type = "sine";
      attack = 0.03;
    }

    o.frequency.value = freq;
    o.connect(g);

    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(vol, at + attack);
    if (voice === "pad") {
      // 패드는 **버텼다가** 놓는다. 처음엔 다른 악기와 같이 계속 감쇠시켰더니
      // 코드가 마디 중간에 사라져 화성이 흐릿해졌다.
      g.gain.setValueAtTime(vol, at + Math.max(attack, release - 0.9));
      g.gain.exponentialRampToValueAtTime(0.0001, at + release);
    } else {
      g.gain.exponentialRampToValueAtTime(0.0001, at + release);
    }

    o.start(at);
    o.stop(at + release + 0.15);
  }
}

export const villageMusic = new VillageMusic();
