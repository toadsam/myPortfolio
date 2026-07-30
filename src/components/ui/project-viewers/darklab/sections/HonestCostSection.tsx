"use client";

import {Fn, Kw, Str, Ty} from "../parts";

export function HonestCostSection() {
  return (
    <section id="dl-sec-7" data-dl-section className="relative flex min-h-screen w-full flex-col items-center py-24">
      <div className="z-10 w-full max-w-[820px] px-6">
        <div className="dl-fade-up mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#ff5a4d]">
          04 · The Honest Cost
        </div>
        <h2 className="dl-fade-up mb-6 text-[32px] font-black leading-tight">
          버그는 공포보다 <br />
          <span className="text-[#ef4444]">더 집요하게</span> 따라붙었습니다.
        </h2>
        <p className="dl-fade-up mb-12 text-[16px] leading-8 text-[rgba(255,255,255,0.82)]">
          앞서 말한 &lsquo;제어권 반환 실패&rsquo;는 단순한 코딩 실수가 아니었습니다. 플레이어가 시네마틱 연출 도중 강제
          종료를 하거나, 예기치 못한 트리거가 중첩될 때 발생하는 상태 관리의 허점이었습니다.
        </p>

        <div className="dl-fade-up mb-12 overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#0b0708] shadow-2xl">
          <div className="border-b border-[rgba(255,255,255,0.10)] bg-[#0f0a0c] px-4 py-3">
            <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">InputRecoverySystem.cs</span>
          </div>
          <div className="overflow-x-auto p-6 font-mono text-[12px] leading-relaxed whitespace-pre text-white/70">
            <Kw>public void</Kw> <Fn>ForceRestoreControl</Fn>() {"{"}
            {"\n    "}
            <Kw>if</Kw> (isControlLocked) {"{"}
            {"\n        playerInput.enabled = "}
            <Kw>true</Kw>
            {";\n        uiManager.HideAllCutsceneUI();\n        "}
            <Ty>Debug</Ty>.<Fn>LogWarning</Fn>(<Str>&quot;Control forcefully restored.&quot;</Str>);
            {"\n    }\n}"}
          </div>
        </div>

        <div className="dl-fade-up grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-md border border-[#f87171]/30 bg-white/[0.02] p-6">
            <h4 className="mb-2 font-bold text-white">Problem: State Deadlock</h4>
            <p className="text-[14px] leading-6 text-[rgba(255,255,255,0.42)]">
              이벤트 도중 씬이 로드되거나 객체가 파괴될 때, 코루틴이 중단되면서 Input.enabled = true 문에 도달하지
              못하는 현상.
            </p>
          </div>
          <div className="rounded-md border border-[#4ade80]/30 bg-white/[0.02] p-6">
            <h4 className="mb-2 font-bold text-white">Solution: Global Safety Net</h4>
            <p className="text-[14px] leading-6 text-[rgba(255,255,255,0.42)]">
              싱글톤 매니저가 객체 생명주기와 무관하게 모든 비정상 종료 시점을 추적하여 강제 해제 명령을 하달.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
