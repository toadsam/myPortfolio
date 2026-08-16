"use client";

import {useRef, useState} from "react";
import {sound} from "../../sound";
import {Kicker, Kw, Str} from "../parts";

type Target = "door" | "box" | "key";

const TARGETS: {id: Target; tag: string; call: string}[] = [
  {id: "door", tag: "Door", call: "OpenDoor(hit.collider.gameObject);"},
  {id: "box", tag: "Box", call: "PushObject(hit.collider.gameObject);"},
  {id: "key", tag: "Key", call: "PickUp(hit.collider.gameObject);"}
];

export function RaycastSection() {
  const [hit, setHit] = useState<Target | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function shoot(target: Target) {
    setHit(target);
    sound?.sfx("click");
    // 스윕 애니메이션 재시작 — 클래스만 껐다 켠다(리렌더 없음).
    const panel = panelRef.current;
    if (!panel) return;
    panel.classList.remove("dl-sweeping");
    void panel.offsetWidth;
    panel.classList.add("dl-sweeping");
  }

  const revealed = hit !== null;

  return (
    <section
      id="dl-sec-3"
      data-dl-section
      className="relative flex min-h-screen w-full flex-col items-center py-24"
    >
      <div className="z-10 w-full max-w-[1100px] px-6">
        <header className="dl-fade-up mb-16">
          <Kicker>01 · 무엇을 만들었나</Kicker>
          <h2 className="mb-8 mt-6 text-[32px] font-black leading-tight md:text-[44px]">
            레이캐스트 상호작용
          </h2>
          <div className="grid max-w-[900px] grid-cols-1 gap-8 text-[15px] leading-relaxed text-[rgba(255,255,255,0.42)] md:grid-cols-2">
            <p>
              이 프로젝트의 핵심은 &lsquo;보이지 않는 것과의 조우&rsquo;입니다.
              플레이어는 제한된 시야 속에서 주변 사물을 탐색하고,
              레이캐스트(Raycast)를 통해 물리적 거리를 계산하여 상호작용 가능한
              객체를 식별합니다.
            </p>
            <p>
              단순히 거리가 가깝다고 상호작용되는 것이 아닌, 플레이어의 시선이
              정확히 대상을 향하고 있을 때만 반응하도록 설계하여 1인칭 공포 게임
              특유의 몰입감을 극대화했습니다.
            </p>
          </div>
        </header>

        <div className="dl-fade-up grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* ── 관람객이 직접 쏘는 샌드박스 ── */}
          <div className="relative h-[500px] overflow-hidden rounded-md border border-white/10 bg-[#0a0708] lg:col-span-5">
            <div className="absolute left-6 top-4 z-20">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(255,255,255,0.42)]">
                Interactive Sandbox
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center gap-8 px-8">
              <button
                type="button"
                onClick={() => shoot("door")}
                className={`dl-object-node flex h-56 w-32 flex-col items-center justify-center gap-3 rounded-sm border border-white/10 bg-white/[0.01] ${
                  hit === "door" ? "dl-active" : ""
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="font-mono text-[11px] uppercase text-[rgba(255,255,255,0.42)]">
                  Door
                </span>
              </button>

              <button
                type="button"
                onClick={() => shoot("box")}
                className={`dl-object-node flex h-24 w-24 items-center justify-center rounded-sm border border-white/10 bg-white/[0.01] ${
                  hit === "box" ? "dl-active" : ""
                }`}
              >
                <span className="font-mono text-[11px] uppercase text-[rgba(255,255,255,0.42)]">
                  Box
                </span>
              </button>

              <button
                type="button"
                onClick={() => shoot("key")}
                className={`dl-object-node flex h-8 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.01] ${
                  hit === "key" ? "dl-active" : ""
                }`}
              >
                <span className="font-mono text-[11px] uppercase text-[rgba(255,255,255,0.42)]">
                  Key
                </span>
              </button>
            </div>

            <div
              className="pointer-events-none absolute inset-x-0 bottom-6 text-center transition-opacity"
              style={{opacity: revealed ? 0 : 0.6}}
            >
              <span className="font-mono text-[11px] text-[#ff5a4d]">
                물체를 클릭하세요
              </span>
            </div>
          </div>

          {/* ── 클릭 즉시 옆에서 실행되는 실제 코드 ── */}
          <div
            ref={panelRef}
            className="relative flex flex-col overflow-hidden rounded-md border border-[rgba(255,255,255,0.10)] bg-[#0b0708] lg:col-span-7"
          >
            <span className="dl-ray-sweep" aria-hidden="true" />
            <div className="flex items-center justify-between border-b border-white/5 bg-black/20 p-4">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-white/10"
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] text-[rgba(255,255,255,0.42)]">
                InteractionSystem.cs
              </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-6 font-mono text-[13px] leading-relaxed">
              <div
                className={`dl-code-line text-[rgba(255,255,255,0.42)] ${
                  revealed ? "dl-revealed" : ""
                }`}
              >
                void Update() {"{"}
              </div>
              <div
                className={`dl-code-line pl-4 text-[rgba(255,255,255,0.42)] ${
                  revealed ? "dl-revealed" : ""
                }`}
              >
                Ray ray = cam.ScreenPointToRay(Input.mousePosition);
              </div>
              <div
                className={`dl-code-line pl-4 text-[rgba(255,255,255,0.42)] ${
                  revealed ? "dl-revealed" : ""
                }`}
              >
                if (Physics.Raycast(ray, out RaycastHit hit, maxDist)) {"{"}
              </div>

              {TARGETS.map((t, i) => (
                <div
                  key={t.id}
                  className={`dl-code-line pl-8 ${
                    revealed ? "dl-revealed" : ""
                  }`}
                  style={
                    hit === t.id
                      ? {background: "rgba(239,68,68,0.12)"}
                      : undefined
                  }
                >
                  <Kw>{i === 0 ? "if" : "else if"}</Kw>{" "}
                  (hit.collider.CompareTag(
                  <Str>&quot;{t.tag}&quot;</Str>)) {"{"}
                  <div className="pl-4 text-blue-300">{t.call}</div>
                  {"}"}
                </div>
              ))}

              <div
                className={`dl-code-line pl-4 text-[rgba(255,255,255,0.42)] ${
                  revealed ? "dl-revealed" : ""
                }`}
              >
                {"}"}
              </div>
              <div
                className={`dl-code-line text-[rgba(255,255,255,0.42)] ${
                  revealed ? "dl-revealed" : ""
                }`}
              >
                {"}"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
