"use client";

import {useEffect, useState} from "react";
import {useDarkLab} from "../context";
import {IconPlay} from "../parts";

const HEADLINE_1 = "어두운 방에서 무서운 건 무언가가 있어서가 아니다.";
const HEADLINE_2 = "있는지 없는지 모르기 때문이다.";

const META = [
  {value: "6", label: "기술 스택"},
  {value: "5", label: "핵심 시스템"},
  {value: "1인칭", label: "시점"},
  {value: "Unity", label: "엔진 / URP"},
];

const GITHUB = "https://github.com/toadsam/DarkLab";

export function HeroSection() {
  const {lockScroll} = useDarkLab();
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (!videoOpen) return;
    lockScroll(true);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setVideoOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [videoOpen, lockScroll]);

  return (
    <section
      id="dl-sec-2"
      data-dl-section
      className="relative flex min-h-screen w-full flex-col items-center pb-24 pt-[18vh]"
    >
      <div className="relative z-10 flex w-full max-w-[820px] flex-col px-6">
        <div className="dl-fade-up mb-[4vh] font-mono text-[12px] uppercase tracking-[0.3em] text-[#ef4444] md:mb-[8vh]">
          UNITY · 1인칭 탐색 공포 어드벤처
        </div>

        <h2 className="mb-[10vh] max-w-[600px] text-[28px] font-black leading-tight md:mb-[20vh] md:text-[40px]">
          <span className="flex flex-wrap gap-x-[0.25em] gap-y-2 text-[rgba(255,255,255,0.82)]">
            {HEADLINE_1.split(" ").map((w, i) => (
              <span key={i} className="dl-word">
                {w}
              </span>
            ))}
          </span>
          <span className="mt-[12px] flex flex-wrap gap-x-[0.25em] gap-y-2 text-[#ff5a4d]">
            {HEADLINE_2.split(" ").map((w, i) => (
              <span key={i} className="dl-word">
                {w}
              </span>
            ))}
          </span>
        </h2>

        <div className="mb-[10vh] grid w-full grid-cols-2 gap-4 md:mb-[16vh] md:grid-cols-4">
          {META.map((cell) => (
            <div
              key={cell.label}
              className="dl-fade-up rounded-md border border-[rgba(255,255,255,0.08)] p-4"
            >
              <div className="font-mono text-[24px] font-black text-[rgba(255,255,255,0.82)]">{cell.value}</div>
              <div className="mt-1 font-mono text-[11px] tracking-[0.1em] text-[rgba(255,255,255,0.42)]">
                {cell.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── 디스커버리 월: 손전등으로 비춰야 보이는 오브젝트 3개 ── */}
        <div className="dl-fade-up group relative h-[340px] w-full overflow-hidden rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0a0708] shadow-2xl md:h-[300px]">
          <div className="pointer-events-none absolute bottom-4 left-1/2 w-full -translate-x-1/2 text-center font-mono text-[11px] text-[rgba(255,255,255,0.30)] transition-opacity group-hover:opacity-0">
            손전등으로 벽을 비춰보세요
          </div>

          <div className="absolute inset-0 z-20">
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="absolute left-[24%] top-[42%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center opacity-30 outline-none transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100"
            >
              <span className="dl-wall-pulse flex h-[132px] w-[132px] items-center justify-center rounded-full border border-[#ff5a4d]/45">
                <IconPlay className="ml-1 h-6 w-6 text-[#ff5a4d]" />
              </span>
              <span className="mt-4 flex flex-col items-center gap-1">
                <span className="font-mono text-[12px] text-[#ff5a4d]">▶ 플레이 영상</span>
                <span className="font-mono text-[10px] text-[rgba(255,255,255,0.42)]">1분 42초</span>
              </span>
            </button>

            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="absolute left-[58%] top-[66%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center opacity-30 outline-none transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100"
            >
              <span className="flex h-[108px] w-[108px] items-center justify-center rounded-2xl border border-white/20 transition-colors hover:bg-white/5">
                <span className="font-mono text-[26px] tracking-widest text-[rgba(255,255,255,0.82)]">&lt; &gt;</span>
              </span>
              <span className="mt-3 flex flex-col items-center gap-1">
                <span className="font-mono text-[12px] text-[rgba(255,255,255,0.82)]">GitHub 저장소</span>
                <span className="font-mono text-[10px] text-[rgba(255,255,255,0.42)]">C# · Unity 2022</span>
              </span>
            </a>

            <div className="absolute left-[82%] top-[30%] -translate-x-1/2 -translate-y-1/2 opacity-30 transition-opacity duration-300 hover:opacity-100">
              <div className="flex h-[64px] w-[96px] -rotate-3 items-center justify-center border border-white/10 bg-[#14100e] p-2 transition-all hover:-translate-y-1 hover:rotate-0">
                <span className="text-center font-mono text-[10px] text-white/55">개발 4주 · 1인 프로토타입</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {videoOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(2,2,3,0.92)] p-6 backdrop-blur-md"
          onClick={() => setVideoOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="플레이 영상"
        >
          <div className="dl-lightbox-in w-full max-w-[1000px]">
            <div className="dl-hatch flex aspect-video w-full items-center justify-center rounded-md border border-white/10 bg-[#131011]">
              <span className="font-mono text-[16px] text-white/35">게임플레이 영상 자리 · 16:9</span>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">복도 탐색 · 손전등 · 상호작용 1회</span>
              <span className="font-mono text-[12px] text-white/35">ESC · 클릭으로 닫기</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
