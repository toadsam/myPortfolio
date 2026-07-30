"use client";

import {useEffect, useRef, useState} from "react";
import {useDarkLab} from "../context";
import {Fn, Kw, Num, Ty} from "../parts";

type RayMode = "before" | "after";

const OPTIMIZATIONS = [
  {title: "판정 주기 낮춤", body: "매 프레임 → 0.12초 간격"},
  {title: "레이어 마스크", body: "상호작용 레이어만 검사"},
  {title: "결과 캐싱", body: "동일 대상 UI 재생성 방지"},
];

export function Trouble02Section() {
  const {rootRef} = useDarkLab();
  const [mode, setMode] = useState<RayMode>("before");
  const modeRef = useRef<RayMode>("before");
  const counterRef = useRef<HTMLSpanElement>(null);
  const chartRef = useRef<SVGPolylineElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const total = useRef(0);
  const points = useRef<number[]>([100]);

  modeRef.current = mode;

  // 화면 밖이거나 탭이 숨겨지면 타이머를 멈춘다.
  useEffect(() => {
    const el = panelRef.current;
    const root = rootRef.current;
    if (!el) return;

    let timer = 0;
    let visible = false;

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = 0;
    }

    function start() {
      if (timer || !visible || document.hidden) return;
      timer = window.setInterval(() => {
        total.current += modeRef.current === "before" ? 6 : 0.8;
        if (counterRef.current) counterRef.current.textContent = String(Math.floor(total.current));

        const next =
          modeRef.current === "before" ? Math.random() * 10 + 10 : Math.random() * 5 + 80;
        points.current.push(next);
        if (points.current.length > 20) points.current.shift();
        if (chartRef.current) {
          chartRef.current.setAttribute(
            "points",
            points.current.map((y, i) => `${i * 5},${y}`).join(" "),
          );
        }
      }, 100);
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = Boolean(entries[0]?.isIntersecting);
        if (visible) start();
        else stop();
      },
      {root: root ?? null, threshold: 0.1},
    );
    io.observe(el);

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [rootRef]);

  const isBefore = mode === "before";
  const tone = isBefore ? "#f87171" : "#4ade80";

  return (
    <section id="dl-sec-9" data-dl-section className="relative flex min-h-screen w-full flex-col items-center py-24">
      <div className="z-10 w-full max-w-[900px] px-6">
        <header className="dl-fade-up mb-16">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#fbbf24]">TROUBLE 02</span>
          <h2 className="mb-6 mt-2 text-[26px] font-black">아무 일도 안 하는데 프레임이 떨어졌다</h2>
          <p className="text-[17px] leading-9">
            프로파일러를 켜고 나서야 범인이 보였다. 상호작용 판정용 레이캐스트가 매 프레임 돌고 있었다. 동작에는 문제가
            없었다. 문제는 아무것도 볼 게 없는 순간에도 똑같이 쐈다는 것이다.
          </p>
        </header>

        <div
          ref={panelRef}
          className="dl-fade-up mb-16 rounded-md border border-[rgba(255,255,255,0.10)] bg-[#131011]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2">
            <span className="font-mono text-[11px] uppercase text-[rgba(255,255,255,0.42)]">
              ▸ RAYCAST 호출 수 · 실시간
            </span>
            <div className="flex rounded-sm bg-white/5 p-0.5">
              {(["before", "after"] as RayMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="rounded-sm px-3 py-1 font-mono text-[11px] transition-colors"
                  style={
                    mode === m
                      ? {
                          background: m === "before" ? "rgba(248,113,113,0.14)" : "rgba(74,222,128,0.14)",
                          color: m === "before" ? "#f87171" : "#4ade80",
                        }
                      : {color: "rgba(255,255,255,0.42)"}
                  }
                >
                  {m === "before" ? "최적화 전" : "최적화 후"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex h-[120px] flex-col items-center justify-center">
            <div className="flex items-baseline gap-3">
              <span
                ref={counterRef}
                className="font-mono text-[56px] font-black tabular-nums"
                style={{color: tone}}
              >
                0
              </span>
              <span
                className="rounded border px-2 py-0.5 font-mono text-[11px]"
                style={{
                  color: tone,
                  borderColor: `${tone}33`,
                  background: `${tone}1a`,
                }}
              >
                {isBefore ? "초당 60회" : "초당 약 8회"}
              </span>
            </div>
          </div>

          <div className="h-[100px] px-4 pb-4">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
              <polyline ref={chartRef} points="0,100" fill="none" strokeWidth="2" stroke={tone} />
            </svg>
          </div>
          <p className="sr-only">
            최적화 전에는 매 프레임(초당 60회) 레이캐스트를 호출했고, 최적화 후에는 초당 약 8회로 줄었습니다.
          </p>
        </div>

        <div className="dl-fade-up mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {OPTIMIZATIONS.map((o) => (
            <div key={o.title} className="rounded-md border border-[#4ade80]/25 bg-[#4ade80]/[0.04] p-4">
              <h4 className="text-[14px] font-black text-white/80">{o.title}</h4>
              <p className="mt-1 text-[12px] text-white/60">{o.body}</p>
            </div>
          ))}
        </div>

        <div className="dl-fade-up overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#131011]">
          <div className="border-b border-[rgba(255,255,255,0.10)] bg-[#0f0a0c] px-4 py-3">
            <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">Interactor.cs (after)</span>
          </div>
          <div className="p-5 font-mono text-[11px] whitespace-pre text-white/70">
            <span className="-mx-5 block bg-[#4ade80]/10 px-5">
              <Kw>if</Kw> (timer &lt; <Num>0.12f</Num>) <Kw>return</Kw>;
            </span>
            <span className="-mx-5 block bg-[#4ade80]/10 px-5">
              <Kw>if</Kw> (<Ty>Physics</Ty>.<Fn>Raycast</Fn>(ray, <Kw>out</Kw> hit, <Num>3f</Num>, <Ty>layer</Ty>)) {"{ ... }"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
