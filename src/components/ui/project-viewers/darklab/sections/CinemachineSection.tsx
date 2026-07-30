"use client";

import {useEffect, useRef, useState} from "react";
import {Fn, Kw, Str, Ty} from "../parts";

type CineMode = "manual" | "cine";

const MODE_COPY: Record<CineMode, {label: string; status: string; color: string; duration: string; ease: string}> = {
  manual: {
    label: "직접 Lerp 구현",
    status: "시작과 끝이 툭 끊긴다",
    color: "#f87171",
    duration: "0.45s",
    ease: "linear",
  },
  cine: {
    label: "Cinemachine 블렌드",
    status: "블렌딩이 자동으로 처리된다",
    color: "#4ade80",
    duration: "0.6s",
    ease: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

export function CinemachineSection() {
  const [mode, setMode] = useState<CineMode>("manual");
  const [playing, setPlaying] = useState(false);
  const rigRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  function play() {
    if (playing) return;
    setPlaying(true);
    const rig = rigRef.current;
    const track = trackRef.current;
    if (track) {
      track.style.transition = "none";
      track.style.width = "0%";
      void track.offsetWidth;
      track.style.transition = "width 2.4s linear";
      track.style.width = "100%";
    }
    if (rig) rig.style.transform = "rotateY(-28deg)";

    timers.current.push(
      window.setTimeout(() => {
        if (rigRef.current) rigRef.current.style.transform = "rotateY(0deg)";
      }, 1400),
    );
    timers.current.push(
      window.setTimeout(() => {
        setPlaying(false);
        if (trackRef.current) {
          trackRef.current.style.transition = "width 0.3s ease";
          trackRef.current.style.width = "0%";
        }
      }, 2400),
    );
  }

  const copy = MODE_COPY[mode];

  return (
    <section id="dl-sec-6" data-dl-section className="relative flex min-h-screen w-full flex-col items-center py-24">
      <div className="z-10 w-full max-w-[900px] px-6">
        <header className="dl-fade-up mb-20">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#ff5a4d]">
            03 · 왜 Cinemachine이었나
          </span>
          <h2 className="mb-10 mt-4 text-4xl font-black tracking-tight md:text-[44px]">처음엔 카메라를 직접 움직였다</h2>
          <div className="space-y-6 text-lg leading-8 text-[rgba(255,255,255,0.74)]">
            <p>
              Lerp로 회전시키고, 다 되면 제어권을 돌려주는 식으로 짰다. 동작은 했다. 문제는{" "}
              <span className="font-bold text-[#ff5a4d]">전환이 어색했다는 것이다.</span> 시작할 때 급하게 꺾이고, 끝날
              때 툭 끊겼다.
            </p>
            <p>이징 곡선을 손으로 만지면서 며칠을 썼다. 연출마다 다른 곡선이 필요했고, 그걸 전부 코드로 들고 있어야 했다.</p>
            <p>
              Cinemachine의 가상 카메라로 바꾸고 나서는 어디를 보게 할지만 정하면 블렌딩이 알아서 처리됐다. 연출 하나
              만드는 시간이 절반 이하로 줄었다.
            </p>
          </div>
        </header>

        <div className="dl-fade-up mb-24 overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#0b0708] shadow-2xl">
          <div className="flex h-[44px] items-center justify-between border-b border-white/5 bg-[#0f0a0c] px-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[rgba(255,255,255,0.42)]">
              ▸ CAMERA HANDOFF
            </span>
            <div className="flex h-7 overflow-hidden rounded border border-white/10">
              {(Object.keys(MODE_COPY) as CineMode[]).map((key, i) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={`dl-toggle-btn px-3 font-mono text-[10px] transition-colors ${
                    i === 0 ? "border-r border-white/10" : ""
                  } ${mode === key ? "dl-active" : "text-[rgba(255,255,255,0.42)]"}`}
                >
                  {MODE_COPY[key].label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={play}
              disabled={playing}
              className="font-mono text-[11px] text-[rgba(255,255,255,0.82)] transition-colors hover:text-[#ff5a4d] disabled:opacity-40"
            >
              [ ▶ 재생 ]
            </button>
          </div>

          <div className="dl-scene relative flex h-[360px] items-center justify-center overflow-hidden bg-[#050304]">
            <div
              ref={rigRef}
              className="dl-camera-wrapper flex h-full w-full items-center justify-center"
              style={
                {
                  "--dl-cam-dur": copy.duration,
                  "--dl-cam-ease": copy.ease,
                } as React.CSSProperties
              }
            >
              <div
                className="absolute h-[500px] w-[800px] border-2 border-white/5 bg-[#0e0a0b]"
                style={{transform: "translateZ(-400px)"}}
              >
                <div className="absolute bottom-0 left-20 h-64 w-32 border-r border-white/10 bg-[#16100f]">
                  <div className="absolute inset-y-0 right-0 w-1 bg-[#ff5a4d]/20 blur-sm" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              <div
                className="absolute h-[1200px] w-[1200px] bg-[#0b0708]"
                style={{transform: "rotateX(90deg) translateY(250px)"}}
              />
            </div>
          </div>

          <div className="bg-[#090607] px-8 py-6">
            <div className="relative mb-3 h-1 rounded-full bg-white/10">
              <div ref={trackRef} className="absolute left-0 top-0 h-full w-0 bg-[#ff5a4d]/30" />
            </div>
            <div className="mt-4 font-mono text-[11px]" style={{color: copy.color}}>
              {copy.status}
            </div>
          </div>
        </div>

        <div className="dl-fade-up grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#0b0708]">
            <div className="border-b border-[rgba(255,255,255,0.10)] bg-[#0f0a0c] px-4 py-3">
              <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">DoorRevealSequence.cs</span>
            </div>
            <div className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed whitespace-pre text-white/70">
              <Ty>Sequence</Ty> s = <Ty>DOTween</Ty>.<Fn>Sequence</Fn>();{"\n"}
              s.<Fn>Append</Fn>(door.<Fn>DORotate</Fn>(...));{"\n"}
              <span className="dl-line-hl">
                s.<Fn>OnComplete</Fn>(() =&gt; {"{"}
                {"\n    cam."}
                <Fn>ReleaseControl</Fn>();{"\n});"}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#0b0708]">
            <div className="border-b border-[rgba(255,255,255,0.10)] bg-[#0f0a0c] px-4 py-3">
              <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">PlayerInputLock.cs</span>
            </div>
            <div className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed whitespace-pre text-white/70">
              <Kw>try</Kw> {"{"}
              {"\n    inputAction."}
              <Fn>Disable</Fn>();{"\n    "}
              <Kw>yield return</Kw> <Str>&quot;Cutscene&quot;</Str>;{"\n} "}
              <Kw>finally</Kw> {"{"}
              {"\n"}
              <span className="dl-line-hl">
                {"    inputAction."}
                <Fn>Enable</Fn>();
              </span>
              {"\n}"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
