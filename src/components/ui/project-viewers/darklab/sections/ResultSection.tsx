"use client";

import {useEffect, useRef, useState} from "react";
import {useDarkLab} from "../context";
import {IconPlayCircle} from "../parts";

const CAPTIONS = ["복도 탐색", "상호작용 프롬프트", "Cinemachine 연출", "Unity 에디터"];

export function ResultSection() {
  const {rootRef, lightsOn, setLightsOn, lockScroll, reducedMotion} = useDarkLab();
  const triggerRef = useRef<HTMLDivElement>(null);
  const metric1 = useRef<HTMLDivElement>(null);
  const metric2 = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const counted = useRef(false);

  const [momentOn, setMomentOn] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // ── 여기서 불을 켠다 ──
  useEffect(() => {
    const el = triggerRef.current;
    const root = rootRef.current;
    if (!el || !root) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || counted.current) return;
        counted.current = true;
        io.disconnect();
        setLightsOn(true);
        timers.current.push(window.setTimeout(() => setMomentOn(true), 500));
        timers.current.push(
          window.setTimeout(() => {
            countTo(metric1.current, 6, 100);
            countTo(metric2.current, 5, 120);
          }, 1000),
        );
      },
      {root, threshold: 0.1},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef, setLightsOn]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  function countTo(node: HTMLDivElement | null, target: number, step: number) {
    if (!node) return;
    if (reducedMotion) {
      node.textContent = String(target);
      return;
    }
    let value = 0;
    const iv = window.setInterval(() => {
      value += 1;
      node.textContent = String(value);
      if (value >= target) window.clearInterval(iv);
    }, step);
    timers.current.push(iv);
  }

  useEffect(() => {
    if (lightbox === null) return;
    lockScroll(true);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setLightbox(null);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [lightbox, lockScroll]);

  return (
    <section id="dl-sec-11" data-dl-section className="relative flex min-h-screen w-full flex-col items-center py-24">
      <div ref={triggerRef} className="absolute top-[10%] h-1 w-full" />

      <div className="z-10 flex w-full max-w-[1020px] flex-col items-center px-6">
        <div
          className="mb-12 flex flex-col items-center justify-center transition-opacity duration-700"
          style={{opacity: momentOn || lightsOn ? 1 : 0}}
        >
          <p className="text-[20px] font-medium text-[#ff5a4d]">여기부터는 불을 켜고 이야기하겠습니다.</p>
          <div className="mt-12 font-mono text-[11px] uppercase tracking-[0.25em] text-[rgba(255,255,255,0.42)]">
            05 · 결과
          </div>
        </div>

        <div className="dl-fade-up mb-20 w-full">
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[#ff5a4d]">▶ 플레이 영상 · 전체</span>
          </div>
          <button
            type="button"
            onClick={() => setLightbox(-1)}
            className="group relative w-full cursor-pointer overflow-hidden rounded-md border border-[#ff5a4d]/30 bg-[#131011]"
          >
            <div className="flex aspect-video w-full flex-col items-center justify-center bg-gradient-to-br from-[#0f0b0c] to-[#16100f]">
              <IconPlayCircle className="h-16 w-16 text-[#ff5a4d] transition-transform group-hover:scale-110" />
            </div>
          </button>
        </div>

        <div className="mb-6 grid w-full grid-cols-1 gap-5 md:grid-cols-2">
          {CAPTIONS.map((caption, i) => (
            <button
              key={caption}
              type="button"
              onClick={() => setLightbox(i)}
              className="dl-fade-up dl-gallery-card cursor-pointer overflow-hidden rounded-md border border-white/10 bg-[#131011]"
            >
              <div className="dl-hatch flex aspect-video w-full items-center justify-center">
                <span className="font-mono text-[12px] text-white/30">이미지 자리 {i + 1} · {caption}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 측정하지 못한 것을 숨기지 않는다 */}
        <p className="dl-fade-up mb-24 w-full text-center font-mono text-[11px] leading-6 text-[rgba(255,255,255,0.42)]">
          이 프로젝트는 지표를 수집하지 않았습니다. 아래 숫자는 성과가 아니라 구성 요소의 개수입니다.
        </p>

        <div className="mb-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="dl-fade-up rounded-md border border-white/10 bg-[#131011] p-6">
            <div ref={metric1} className="font-mono text-[30px] font-black tabular-nums text-[#ff5a4d]">
              0
            </div>
            <div className="mt-2 text-[12px] text-[rgba(255,255,255,0.42)]">기술 스택</div>
          </div>
          <div className="dl-fade-up rounded-md border border-white/10 bg-[#131011] p-6">
            <div ref={metric2} className="font-mono text-[30px] font-black tabular-nums text-[#ff5a4d]">
              0
            </div>
            <div className="mt-2 text-[12px] text-[rgba(255,255,255,0.42)]">핵심 시스템</div>
          </div>
          <div className="dl-fade-up rounded-md border border-white/10 bg-[#131011] p-6">
            <div className="font-mono text-[30px] font-black text-[#ff5a4d]">프로토타입</div>
            <div className="mt-2 text-[12px] text-[rgba(255,255,255,0.42)]">완성도</div>
          </div>
        </div>
      </div>

      {lightbox !== null ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020203]/90 p-6 backdrop-blur-md"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox >= 0 ? CAPTIONS[lightbox] : "플레이 영상"}
        >
          <div className="dl-lightbox-in relative w-full max-w-[1100px]">
            <div className="dl-hatch flex aspect-video w-full items-center justify-center rounded-md border border-white/10 bg-[#131011]">
              <span className="font-mono text-[18px] text-white/30">
                {lightbox >= 0 ? "이미지 확대" : "게임플레이 영상 자리 · 16:9"}
              </span>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">
                {lightbox >= 0 ? CAPTIONS[lightbox] : "플레이 영상 · 전체"}
              </span>
              <span className="font-mono text-[12px] text-white/35">ESC · 클릭으로 닫기</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
