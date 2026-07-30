"use client";

import {useDarkLab} from "../context";
import {Kicker} from "../parts";

const PRINCIPLES = [
  {
    no: "01",
    title: "시야를 제한한다",
    file: "PlayerLight.cs",
    body:
      "정보를 차단하는 것이 공포의 시작입니다. 빛의 감쇠를 계산하고 렌더링 파이프라인에서 시야각을 좁혀, 플레이어가 등 뒤의 존재를 확인할 수 없게 만듭니다. 손전등 반경 밖은 알 수 없다.",
    echo: "↳ 지금 이 페이지에서 마우스가 손전등인 이유",
    pulse: false,
  },
  {
    no: "02",
    title: "소리를 앞세운다",
    file: "AmbientCue.cs",
    body:
      "눈에 보이지 않는 공포를 소리로 먼저 전달합니다. 공간 음향(Spatial Audio)과 무작위 앰비언트 트리거를 통해 아무것도 없는 어둠 속에서도 존재감을 느끼게 합니다. 소리가 먼저 오면 플레이어는 스스로 최악을 상상한다.",
    echo: "↳ 들어올 때 들린 삐걱임",
    pulse: false,
  },
  {
    no: "03",
    title: "카메라를 뺏는다",
    file: "CameraDirector.cs",
    body:
      "가장 안전하다고 느끼는 순간 통제권을 박탈합니다. 강제적인 시선 유도는 플레이어의 주도권을 무력화하며 극도의 무력감을 유발하는 가장 효과적인 장치입니다.",
    echo: "↳ 잠시 후 한 번 경험하게 됩니다",
    pulse: true,
  },
];

export function PrinciplesSection() {
  const {markSequenceDone, sequencesDone} = useDarkLab();

  return (
    <section id="dl-sec-4" data-dl-section className="relative flex min-h-screen w-full flex-col items-center py-24">
      <div className="z-10 w-full max-w-[820px] px-6">
        <header className="dl-fade-up mb-20">
          <Kicker>02 · 공포는 어디서 오는가</Kicker>
          <h2 className="mb-8 mt-6 text-[32px] font-black leading-tight md:text-[44px]">설계 원칙</h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(255,255,255,0.42)]">
            <p>
              공포 게임에서 기술은 공포를 구현하는 &lsquo;도구&rsquo;가 아닌, 공포 그 자체가 되어야 합니다. 우리는
              플레이어가 시스템의 논리를 파악하지 못하게 만들어야 하며, 그 불확실성 사이에서 긴장감이 탄생합니다.
            </p>
            <p>
              단순한 점프 스케어보다는 심리적인 압박감을 선사하기 위해 세 가지의 프로그래밍 원칙을 지향합니다. 이
              원칙들은 지금 당신이 경험하고 있는 이 페이지에도 녹아있습니다.
            </p>
          </div>
        </header>

        <div className="mb-24 space-y-12">
          {PRINCIPLES.map((p) => (
            <div key={p.no} className="dl-principle-row dl-fade-up group pb-12">
              <div className="flex flex-col items-start md:flex-row md:gap-8">
                <div className="mb-2 w-full shrink-0 pt-1 md:mb-0 md:w-[64px]">
                  <span className="dl-row-number dl-ghost-number font-mono text-[32px] font-black">{p.no}</span>
                </div>
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-[22px] font-black text-[rgba(255,255,255,0.82)]">{p.title}</h3>
                    <span className="rounded border border-[rgba(255,255,255,0.10)] bg-[#0b0708] px-3 py-1 font-mono text-[12px] text-[#ff5a4d]">
                      {p.file}
                    </span>
                  </div>
                  <p className="mb-4 text-[15px] leading-8 text-[rgba(255,255,255,0.62)]">{p.body}</p>
                  <div className="dl-echo-line flex items-center gap-3 font-mono text-[13px] text-[#ff5a4d]">
                    <span className={p.pulse ? "dl-pulse-slow" : ""}>{p.echo}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 예고: 다음 구간에서 제어권을 뺏는다 ── */}
        <div className="dl-fade-up w-full rounded-md border border-[rgba(239,68,68,0.30)] bg-[rgba(239,68,68,0.05)] p-[18px] shadow-[0_0_24px_rgba(239,68,68,0.12)] md:p-6">
          <div className="font-mono text-[11px] tracking-[0.2em] text-[#ef4444]">▲ 다음 페이지 안내</div>
          <p className="mt-2 text-[15px] leading-8 text-[rgba(255,255,255,0.82)]">
            다음 구간에서 화면이 약 3초간 어두워지고 손전등이 커서를 따라오지 않습니다. 큰 소리나 갑작스러운 이미지는
            없습니다.
          </p>
          <button
            type="button"
            onClick={() => markSequenceDone("takeover")}
            disabled={sequencesDone.takeover}
            className="mt-4 rounded border border-white/20 px-4 py-2 font-mono text-[12px] text-[rgba(255,255,255,0.82)] transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            {sequencesDone.takeover ? "[ 건너뛰었습니다 ]" : "[ 이 연출 건너뛰기 ]"}
          </button>
        </div>
      </div>
    </section>
  );
}
