"use client";

import {Fn, Kw, Str, Ty} from "../parts";

export function HonestCostSection() {
  return (
    <section
      id="dl-sec-7"
      data-dl-section
      className="relative flex min-h-screen w-full flex-col items-center py-24"
    >
      <div className="z-10 w-full max-w-[820px] px-6">
        <div className="dl-fade-up mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#ff5a4d]">
          04 · The Honest Cost
        </div>
        <h2 className="dl-fade-up mb-6 text-[32px] font-black leading-tight">
          버그는 공포보다 <br />
          <span className="text-[#ef4444]">더 집요하게</span> 따라붙었다.
        </h2>
        <p className="dl-fade-up mb-12 text-[16px] leading-8 text-[rgba(255,255,255,0.82)]">
          앞서 말한 &lsquo;제어권 반환 실패&rsquo;는 상태 관리에 난 구멍이었다.
          연출 도중에 플레이어가 강제 종료하거나 트리거 두 개가 겹치면 그
          구멍으로 빠졌다.
        </p>

        <div className="dl-fade-up mb-12 overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#0b0708] shadow-2xl">
          <div className="border-b border-[rgba(255,255,255,0.10)] bg-[#0f0a0c] px-4 py-3">
            <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">
              InputRecoverySystem.cs
            </span>
          </div>
          <div className="overflow-x-auto p-6 font-mono text-[12px] leading-relaxed whitespace-pre text-white/70">
            <Kw>public void</Kw> <Fn>ForceRestoreControl</Fn>() {"{"}
            {"\n    "}
            <Kw>if</Kw> (isControlLocked) {"{"}
            {"\n        playerInput.enabled = "}
            <Kw>true</Kw>
            {";\n        uiManager.HideAllCutsceneUI();\n        "}
            <Ty>Debug</Ty>.<Fn>LogWarning</Fn>(
            <Str>&quot;Control forcefully restored.&quot;</Str>);
            {"\n    }\n}"}
          </div>
        </div>

        <div className="dl-fade-up grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-md border border-[#f87171]/30 bg-white/[0.02] p-6">
            <h4 className="mb-2 font-bold text-white">
              Problem: State Deadlock
            </h4>
            <p className="text-[14px] leading-6 text-[rgba(255,255,255,0.42)]">
              이벤트 도중 씬이 로드되거나 객체가 파괴되면 코루틴이 끊겨서
              Input.enabled = true 줄까지 가지 못했다.
            </p>
          </div>
          <div className="rounded-md border border-[#4ade80]/30 bg-white/[0.02] p-6">
            <h4 className="mb-2 font-bold text-white">
              Solution: Global Safety Net
            </h4>
            <p className="text-[14px] leading-6 text-[rgba(255,255,255,0.42)]">
              싱글톤 매니저가 객체 생명주기와 상관없이 비정상 종료를 감지해
              입력을 강제로 풀어 준다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
