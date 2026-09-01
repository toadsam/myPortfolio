import {villageMusic, type SceneHint} from "./villageMusic";

// 에셋 없이 Web Audio로 생성하는 UI 신스 사운드.
// 브라우저 자동재생 정책상 첫 사용자 제스처에서 AudioContext가 활성화된다.

let ctx: AudioContext | null = null;
// 기본은 무음 — 방문자가 스피커 버튼으로 직접 켠다.
let muted = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as {webkitAudioContext: typeof AudioContext})
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  vol = 0.05,
  at = 0
) {
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

// 마을 배경음악은 villageMusic 이 맡는다.
//
// 예전에는 여기에 **드론 + 난수 벨**이 있었다: 110/165Hz 사인 둘을 lowpass 420 로
// 깔고, 그 위에 6초마다 코드를 바꾸며 벨을 아무 데나 떨어뜨렸다. 멜로디도 리듬도
// 없어서 "웅—" 하는 소음으로 들렸고, 실제로 꺼 두고 쓰셨다. 2026-08-30 에
// 화성 진행·모티프 멜로디·리버브를 갖춘 생성형 스코어로 갈아탔다.
// 짧은 UI 효과음(hover/click/enter/tick)은 그대로 이 파일이 낸다.

export const sfx = {
  setMuted(v: boolean) {
    muted = v;
    if (v) sfx.stopAmbient();
  },
  isMuted() {
    return muted;
  },
  // 마을 배경음악 시작/정지
  startAmbient() {
    if (muted) return;
    // 자동재생 정책 — 첫 제스처 전에는 컨텍스트가 잠들어 있다.
    // getCtx 가 resume 을 부르므로 여기서 한 번 깨워 준다.
    getCtx();
    villageMusic.start();
  },
  stopAmbient() {
    villageMusic.stop();
  },
  isAmbientOn() {
    return villageMusic.isPlaying();
  },
  /** 걷기 모드 여부 등 — 편성이 따라 바뀐다 */
  setScene(hint: SceneHint) {
    villageMusic.setScene(hint);
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
  }
};
