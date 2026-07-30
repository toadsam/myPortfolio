"use client";

import {useState} from "react";
import {Kw, Ty} from "../parts";

type ArchMode = "before" | "after";

export function ArchitectureSection() {
  const [mode, setMode] = useState<ArchMode>("before");
  const after = mode === "after";

  return (
    <section id="dl-sec-10" data-dl-section className="relative flex min-h-screen w-full flex-col items-center py-24">
      <div className="z-10 w-full max-w-[900px] px-6">
        <header className="dl-fade-up mb-16">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[rgba(255,255,255,0.42)]">
            04 · 구조 — ScriptableObject
          </span>
          <h2 className="mb-6 mt-2 text-[32px] font-black">매니저 하나가 모든 걸 알고 있었다</h2>
          <p className="text-[17px] leading-9">
            캐릭터 상태를 매니저 하나에 다 넣었다. 씬을 넘나들 때마다 매니저를 찾는 코드가 늘었고, 값을 바꾸려면 다시
            빌드해야 했다. ScriptableObject로 데이터를 빼내고 나서 씬과 로직이 분리됐다.
          </p>
        </header>

        <div className="dl-fade-up mb-20 overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#131011]">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
            <span className="font-mono text-[11px] uppercase text-[rgba(255,255,255,0.42)]">▸ ARCHITECTURE</span>
            <div className="flex rounded-sm bg-white/5 p-0.5">
              {(["before", "after"] as ArchMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="rounded-sm px-3 py-1 font-mono text-[11px] transition-colors"
                  style={
                    mode === m
                      ? {
                          background: m === "before" ? "rgba(248,113,113,0.10)" : "rgba(74,222,128,0.10)",
                          color: m === "before" ? "#f87171" : "#4ade80",
                        }
                      : {color: "rgba(255,255,255,0.42)"}
                  }
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex h-[420px] w-full flex-col items-center justify-center overflow-hidden p-8">
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
              <path
                d="M 300 350 Q 300 250 450 200"
                className="dl-diag-arrow"
                fill="none"
                stroke="#f87171"
                strokeWidth="1.5"
                opacity={after ? 0 : 0.4}
              />
              <path
                d="M 600 350 Q 600 250 450 200"
                className="dl-diag-arrow"
                fill="none"
                stroke="#f87171"
                strokeWidth="1.5"
                opacity={after ? 0 : 0.4}
              />
            </svg>

            <div
              className="dl-diag-box absolute top-12 w-[190px] rounded border border-[#4ade80]/40 bg-[#4ade80]/5 p-4"
              style={{opacity: after ? 1 : 0, transform: after ? "scale(1)" : "scale(0.9)"}}
            >
              <div className="mb-2 border-b border-[#4ade80]/20 pb-1 font-mono text-[11px] text-[#4ade80]/80">
                PlayerState.asset
              </div>
              <div className="font-mono text-[10px] text-white/45">씬과 무관한 데이터 자산</div>
            </div>

            <div
              className="dl-diag-box z-10 w-[210px] rounded border border-[#f87171]/40 bg-[#f87171]/5 p-4"
              style={{opacity: after ? 0.4 : 1, transform: after ? "translateX(40px)" : "translateX(0)"}}
            >
              <div className="mb-3 border-b border-[#f87171]/20 pb-1 font-mono text-[11px] text-[#f87171]/80">
                GameManager
              </div>
              <div className="font-mono text-[10px] text-white/45">상태 · 참조 · 진행도 전부 보관</div>
            </div>

            <div className="absolute bottom-12 flex w-full justify-around px-20">
              {["Scene A", "Scene B"].map((s) => (
                <div
                  key={s}
                  className="w-[100px] rounded border border-white/10 bg-white/5 py-3 text-center font-mono text-[12px] text-[rgba(255,255,255,0.42)]"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dl-fade-up overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#131011]">
          <div className="border-b border-[rgba(255,255,255,0.10)] bg-[#0f0a0c] px-4 py-3">
            <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">PlayerState.cs</span>
          </div>
          <div className="p-5 font-mono text-[12px] whitespace-pre text-white/70">
            <span className="-mx-5 block bg-[#ef4444]/10 px-5">
              <Kw>{'[CreateAssetMenu(fileName = "PlayerState", menuName = "SO/PlayerState")]'}</Kw>
            </span>
            <Kw>public class</Kw> <Ty>PlayerState</Ty> : <Ty>ScriptableObject</Ty> {"{ ... }"}
          </div>
        </div>
      </div>
    </section>
  );
}
