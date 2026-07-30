"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useDarkLab} from "../context";
import {Fn, Kw} from "../parts";

const SUSPECTS = [
  {
    suspect: "Input System 비활성",
    verdict: "제외",
    cause: false,
    reason: "로그 확인 결과 enabled 상태였다",
  },
  {
    suspect: "컷신 콜백 미호출",
    verdict: "원인",
    cause: true,
    reason: "Sequence가 중간에 Kill되면 OnComplete가 무시된다",
  },
];

export function Trouble01Section() {
  const {rootRef, reducedMotion, lockScroll, sequencesDone, markSequenceDone} = useDarkLab();
  const triggerRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const timers = useRef<number[]>([]);

  const [locked, setLocked] = useState(false);
  const [released, setReleased] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const showContent = revealed || sequencesDone.scroll || reducedMotion;

  const finish = useCallback(() => {
    if (running.current) {
      running.current = false;
      lockScroll(false);
    }
    setLocked(false);
    setRevealed(true);
  }, [lockScroll]);

  const run = useCallback(() => {
    if (running.current) return;
    running.current = true;
    markSequenceDone("scroll");
    lockScroll(true);
    setLocked(true);

    timers.current.push(
      window.setTimeout(() => {
        setReleased(true);
        if (running.current) {
          running.current = false;
          lockScroll(false);
        }
      }, 1500),
    );
    timers.current.push(window.setTimeout(finish, 1800));
  }, [finish, lockScroll, markSequenceDone]);

  useEffect(() => {
    if (reducedMotion || sequencesDone.scroll) return;
    const el = triggerRef.current;
    const root = rootRef.current;
    if (!el || !root) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      {root, threshold: 0.8},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion, sequencesDone.scroll, rootRef, run]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      if (running.current) {
        running.current = false;
        lockScroll(false);
      }
    },
    [lockScroll],
  );

  return (
    <section id="dl-sec-8" data-dl-section className="relative flex min-h-screen w-full flex-col items-center py-24">
      {/* 잠금 진행 표시 — 스크롤이 봉인된 1.5초 동안만 보인다 */}
      <div
        className="pointer-events-none fixed left-0 top-0 z-[100] h-[2px]"
        style={{
          width: locked || released ? "100%" : "0%",
          background: released ? "#4ade80" : "#f87171",
          opacity: locked ? 1 : 0,
          transition: `width 1.5s linear, opacity 0.3s ease, background 0.3s ease`,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center font-mono text-[13px] text-[#f87171] transition-opacity"
        style={{opacity: locked ? 1 : 0}}
        aria-hidden="true"
      >
        입력이 잠겼습니다
      </div>

      <div className="z-10 w-full max-w-[900px] px-6">
        <div ref={triggerRef} className="mb-12 flex h-[300px] flex-col justify-end">
          <div className="mb-4 font-mono text-[12px] text-[#fbbf24]">
            ▲ 아래에서 스크롤이 1.5초간 잠깁니다 ·{" "}
            <button
              type="button"
              onClick={() => {
                markSequenceDone("scroll");
                setRevealed(true);
              }}
              disabled={sequencesDone.scroll}
              className="underline transition-colors hover:text-white disabled:no-underline disabled:opacity-60"
            >
              {sequencesDone.scroll ? "[ 건너뛰었습니다 ]" : "[ 건너뛰기 ]"}
            </button>
          </div>
          <div
            className="text-[22px] font-black leading-tight transition-opacity duration-700"
            style={{opacity: showContent ? 1 : 0}}
          >
            방금 스크롤이 잠겼습니다. 게임에서는 이것 때문에 <span className="text-[#ff5a4d]">3일을 썼습니다.</span>
          </div>
        </div>

        <div className="transition-opacity duration-1000" style={{opacity: showContent ? 1 : 0}}>
          <div className="mb-16 rounded-md border border-[#f87171]/30 bg-[#f87171]/[0.04] p-6">
            <div className="mb-6 flex items-start justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#f87171]">TROUBLE 01</span>
              <span className="rounded bg-[#f87171]/15 px-2.5 py-1 font-mono text-[10px] text-[#f87171]">
                치명적 · 진행 불가
              </span>
            </div>
            <h2 className="text-[26px] font-black">연출이 끝나도 플레이어가 움직이지 않는다</h2>
          </div>

          <h3 className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-[rgba(255,255,255,0.42)]">
            ▸ 의심한 것과 제외한 이유
          </h3>
          <div className="mb-16 overflow-hidden border-t border-[rgba(255,255,255,0.10)]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.10)]">
                  {["의심", "결과", "근거"].map((h) => (
                    <th
                      key={h}
                      className="py-4 font-mono text-[10px] uppercase tracking-widest text-[rgba(255,255,255,0.42)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUSPECTS.map((row) => (
                  <tr
                    key={row.suspect}
                    className={
                      row.cause
                        ? "border-l-2 border-[#f87171] bg-[#f87171]/[0.05] text-[14px]"
                        : "border-b border-white/[0.06] text-[14px]"
                    }
                  >
                    <td className={`py-4 font-mono ${row.cause ? "pl-3" : ""}`}>{row.suspect}</td>
                    <td className="py-4">
                      <span
                        className="rounded px-2 py-0.5 font-mono text-[11px]"
                        style={{
                          background: row.cause ? "rgba(248,113,113,0.14)" : "rgba(74,222,128,0.14)",
                          color: row.cause ? "#f87171" : "#4ade80",
                        }}
                      >
                        {row.verdict}
                      </span>
                    </td>
                    <td className="py-4 text-[rgba(255,255,255,0.57)]">{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-md border border-[#f87171]/30 bg-[#131011]">
              <div className="border-b border-[rgba(255,255,255,0.10)] bg-[#0f0a0c] px-4 py-3">
                <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">
                  CutsceneController.cs (before)
                </span>
              </div>
              <div className="p-5 font-mono text-[11px] whitespace-pre text-white/70">
                <span className="-mx-5 block bg-[#f87171]/20 px-5">
                  seq.<Fn>OnComplete</Fn>(() =&gt; input.<Fn>Enable</Fn>());
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-[#4ade80]/30 bg-[#131011]">
              <div className="border-b border-[rgba(255,255,255,0.10)] bg-[#0f0a0c] px-4 py-3">
                <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">PlayState.cs (after)</span>
              </div>
              <div className="p-5 font-mono text-[11px] whitespace-pre text-white/70">
                <Kw>finally</Kw> {"{"}
                {"\n"}
                <span className="-mx-5 block bg-[#4ade80]/20 px-5">
                  {"    state.IsInCutscene = "}
                  <Kw>false</Kw>;
                </span>
                {"}"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
