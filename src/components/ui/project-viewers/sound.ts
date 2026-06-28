"use client";

// 가벼운 WebAudio 사운드 매니저 — 오디오 파일 없이 합성한다.
// 분위기별 앰비언트 패드 + 인터랙션 효과음. 음소거 토글은 localStorage에 저장.
import type {AmbientVariant} from "./atmosphere";

const MOOD: Record<AmbientVariant, {base: number; fifth: number; type: OscillatorType}> = {
  horror: {base: 55, fifth: 58.27, type: "sawtooth"}, // 불협 · 음산
  energy: {base: 110, fifth: 164.81, type: "triangle"},
  data: {base: 98, fifth: 146.83, type: "sine"},
  arcade: {base: 130.81, fifth: 196, type: "square"},
  calm: {base: 130.81, fifth: 196, type: "sine"},
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  private oscs: OscillatorNode[] = [];
  private mood: AmbientVariant = "data";
  enabled = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.enabled = window.localStorage.getItem("portfolio-sound") === "on";
    }
  }

  private ensure() {
    if (this.ctx) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  private startPad() {
    if (!this.ctx || !this.master || this.oscs.length) return;
    const {base, fifth, type} = MOOD[this.mood];
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    this.padGain = this.ctx.createGain();
    this.padGain.gain.value = 0;
    filter.connect(this.padGain);
    this.padGain.connect(this.master);

    [base, fifth, base * 2].forEach((f, i) => {
      const o = this.ctx!.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = i === 2 ? 6 : -4;
      o.connect(filter);
      o.start();
      this.oscs.push(o);
    });

    // 느린 호흡(LFO)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(this.padGain.gain);
    lfo.start();
    this.oscs.push(lfo);

    this.padGain.gain.linearRampToValueAtTime(0.09, this.ctx.currentTime + 2);
  }

  private stopPad() {
    if (this.padGain && this.ctx) {
      this.padGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
    }
    const oscs = this.oscs;
    this.oscs = [];
    setTimeout(() => oscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        /* noop */
      }
    }), 500);
    this.padGain = null;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (typeof window !== "undefined") window.localStorage.setItem("portfolio-sound", on ? "on" : "off");
    if (on) {
      this.ensure();
      this.ctx?.resume();
      this.startPad();
    } else {
      this.stopPad();
    }
  }

  setMood(mood: AmbientVariant) {
    if (this.mood === mood) return;
    this.mood = mood;
    if (this.enabled) {
      this.stopPad();
      this.ensure();
      this.ctx?.resume();
      this.startPad();
    }
  }

  // 효과음 — 짧은 톤/노이즈.
  sfx(kind: "open" | "click" | "intro") {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx || !this.master) return;
    this.ctx.resume();
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.connect(this.master);
    const o = this.ctx.createOscillator();
    o.connect(g);
    const {base} = MOOD[this.mood];
    if (kind === "click") {
      o.type = "triangle";
      o.frequency.setValueAtTime(base * 4, t);
      g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.start(t);
      o.stop(t + 0.14);
    } else {
      // open / intro — 짧은 상승 스윕
      o.type = "sine";
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * 3, t + (kind === "intro" ? 0.5 : 0.3));
      g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "intro" ? 0.7 : 0.4));
      o.start(t);
      o.stop(t + 0.8);
    }
  }
}

export const sound = typeof window !== "undefined" ? new SoundManager() : (null as unknown as SoundManager);
