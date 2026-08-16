"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useDarkLab} from "../context";
import {Cmt, Fn, Kw, Num, Str, Ty} from "../parts";

const TAKEOVER_LINE = "지금 커서를 움직여도 빛이 따라오지 않습니다.";

export function TakeoverSection() {
  const {
    rootRef,
    reducedMotion,
    lockScroll,
    setFlash,
    sequencesDone,
    markSequenceDone
  } = useDarkLab();
  const triggerRef = useRef<HTMLDivElement>(null);
  const cancelled = useRef(false);
  const running = useRef(false);

  const [overlayOn, setOverlayOn] = useState(false);
  const [typed, setTyped] = useState("");
  const [showPunchline, setShowPunchline] = useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);

  const showCode = codeRevealed || sequencesDone.takeover || reducedMotion;

  // 연출을 중단하고 관람객에게 제어권을 돌려준다 — 언마운트·Esc 공통 경로.
  const restore = useCallback(() => {
    setOverlayOn(false);
    setShowPunchline(false);
    setFlash({follow: true, radius: 220});
    if (running.current) {
      running.current = false;
      lockScroll(false);
    }
    setCodeRevealed(true);
  }, [lockScroll, setFlash]);

  const run = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    cancelled.current = false;
    markSequenceDone("takeover");
    lockScroll(true);

    const wait = (ms: number) =>
      new Promise<void>(resolve => {
        window.setTimeout(resolve, ms);
      });
    const alive = () => !cancelled.current;

    setOverlayOn(true);
    setFlash({follow: false, radius: 0});

    await wait(800);
    if (!alive()) return;
    setFlash({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      radius: 260
    });

    for (let i = 1; i <= TAKEOVER_LINE.length; i += 1) {
      await wait(40);
      if (!alive()) return;
      setTyped(TAKEOVER_LINE.slice(0, i));
    }

    await wait(1200);
    if (!alive()) return;
    setShowPunchline(true);

    await wait(1000);
    if (!alive()) return;
    restore();
  }, [lockScroll, markSequenceDone, restore, setFlash]);

  // 뷰포트 진입 시 1회 발동
  useEffect(() => {
    if (reducedMotion || sequencesDone.takeover) return;
    const el = triggerRef.current;
    const root = rootRef.current;
    if (!el || !root) return;

    const io = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          io.disconnect();
          void run();
        }
      },
      {root, threshold: 0.5}
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion, sequencesDone.takeover, rootRef, run]);

  // Esc로 즉시 탈출
  useEffect(() => {
    if (!overlayOn) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      cancelled.current = true;
      restore();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [overlayOn, restore]);

  // 언마운트 시 잠금·손전등 원복 보장
  useEffect(
    () => () => {
      cancelled.current = true;
      if (running.current) {
        running.current = false;
        lockScroll(false);
      }
      setFlash({follow: true, radius: 220});
    },
    [lockScroll, setFlash]
  );

  return (
    <section
      id="dl-sec-5"
      data-dl-section
      className="relative flex min-h-screen w-full flex-col items-center py-24"
    >
      <div ref={triggerRef} className="mb-20 h-1 w-full max-w-[820px]" />

      <div className="z-10 w-full max-w-[820px] px-6">
        <div
          className="transition-opacity duration-1000"
          style={{opacity: showCode ? 1 : 0}}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[12px] font-medium text-[#ff5a4d]">
              {"// 방금 그 3초를 게임에서 만든 코드"}
            </span>
          </div>

          <div className="overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#0b0708] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.10)] bg-[#0f0a0c] px-4 py-3">
              <div className="flex gap-1.5">
                {["#ff5f56", "#ffbd2e", "#27c93f"].map(c => (
                  <span
                    key={c}
                    className="h-3 w-3 rounded-full"
                    style={{background: c}}
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">
                CameraDirector.cs
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto p-4 font-mono text-[11px] leading-relaxed whitespace-pre text-[rgba(255,255,255,0.7)] md:p-6 md:text-[12px]">
              <span className="select-none text-right text-[rgba(255,255,255,0.13)]">
                {Array.from({length: 16}, (_, i) => i + 1).join("\n")}
              </span>
              <div>
                <Kw>public IEnumerator</Kw> <Fn>TakeoverSequence</Fn>() {"{"}
                {"\n    "}
                <Cmt>{"// 1. 플레이어 입력 차단"}</Cmt>
                {"\n    playerInput.enabled = "}
                <Kw>false</Kw>
                {";\n    \n    "}
                <Cmt>{"// 2. 시네마틱 카메라 우선순위 상향"}</Cmt>
                {"\n"}
                <span className="dl-line-hl">
                  {"    cutsceneCam.Priority = "}
                  <Num>99</Num>
                  {";"}
                </span>
                {"\n    \n    "}
                <Kw>yield return new</Kw> <Ty>WaitForSeconds</Ty>(
                <Num>1.0f</Num>);
                {"\n    uiManager.ShowMessage("}
                <Str>&quot;Takeover Active&quot;</Str>
                {");\n    "}
                <Kw>yield return new</Kw> <Ty>WaitForSeconds</Ty>(
                <Num>2.0f</Num>);
                {"\n\n    "}
                <Cmt>{"// 4. 다시 플레이어에게 제어권 반환"}</Cmt>
                {"\n"}
                <span className="dl-line-hl">
                  {"    cutsceneCam.Priority = "}
                  <Num>0</Num>
                  {";"}
                </span>
                {"\n"}
                <span className="dl-line-hl">
                  {"    playerInput.enabled = "}
                  <Kw>true</Kw>
                  {";"}
                </span>
                {"\n}"}
              </div>
            </div>
          </div>

          <p className="mt-12 max-w-[720px] text-[16px] leading-9 text-[rgba(255,255,255,0.82)]">
            제어권을 뺏는 코드는 다섯 줄이면 된다.{" "}
            <span className="font-bold text-[#ff5a4d]">
              어려운 건 돌려주는 쪽이었다.
            </span>{" "}
            연출 도중에 씬이 바뀌거나 플레이어가 죽으면 입력이 잠긴 채로 남았다.
            이 버그를 잡는 데 3일이 걸렸고, 그 얘기는 조금 뒤에 하겠다.
          </p>
        </div>
      </div>

      {/* ── 제어권 탈취 오버레이 ── */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070405] transition-opacity duration-500"
        style={{opacity: overlayOn ? 1 : 0, pointerEvents: "none"}}
        aria-hidden={!overlayOn}
      >
        <div className="absolute right-8 top-8 border border-white/10 px-2 py-1 font-mono text-[10px] text-[rgba(255,255,255,0.42)]">
          ESC to skip
        </div>
        <div className="px-10 text-center">
          <div className="mb-4 text-[18px] text-[rgba(255,255,255,0.82)] md:text-[20px]">
            {typed}
          </div>
          <div
            className="text-[18px] font-bold text-[#ff5a4d] transition-opacity duration-500 md:text-[20px]"
            style={{opacity: showPunchline ? 1 : 0}}
          >
            이게 「카메라를 뺏는다」입니다.
          </div>
        </div>
      </div>
    </section>
  );
}
