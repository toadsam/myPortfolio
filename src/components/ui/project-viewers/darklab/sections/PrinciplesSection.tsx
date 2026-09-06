"use client";

import {useDarkLab} from "../context";
import {Kicker} from "../parts";

const PRINCIPLES = [
  {
    no: "01",
    title: "시야를 제한한다",
    file: "PlayerLight.cs",
    body: "정보를 끊는 데서 공포가 시작된다. 빛의 감쇠를 계산하고 렌더링 파이프라인에서 시야각을 좁혀서, 플레이어가 등 뒤를 확인할 수 없게 했다. 손전등 반경 밖은 알 수 없다.",
    echo: "↳ 지금 이 페이지에서 마우스가 손전등인 이유",
    pulse: false
  },
  {
    no: "02",
    title: "소리를 앞세운다",
    file: "AmbientCue.cs",
    body: "보이지 않는 것은 소리로 먼저 알린다. 공간 음향(Spatial Audio)과 무작위 앰비언트 트리거로 아무것도 없는 어둠에도 뭔가 있는 것처럼 느끼게 했다. 소리가 먼저 오면 플레이어는 스스로 최악을 상상한다.",
    echo: "↳ 들어올 때 들린 삐걱임",
    pulse: false
  },
  {
    no: "03",
    title: "카메라를 뺏는다",
    file: "CameraDirector.cs",
    body: "제일 안전하다고 느끼는 순간에 조작을 뺏는다. 시선을 강제로 돌리면 플레이어는 아무것도 할 수 없다. 그 무력감을 노렸다.",
    echo: "↳ 잠시 뒤에 한 번 겪는다",
    pulse: true
  }
];

export function PrinciplesSection() {
  const {markSequenceDone, sequencesDone} = useDarkLab();

  return (
    <section
      id="dl-sec-4"
      data-dl-section
      className="relative flex min-h-screen w-full flex-col items-center py-24"
    >
      <div className="z-10 w-full max-w-[820px] px-6">
        <header className="dl-fade-up mb-20">
          <Kicker>02 · 공포는 어디서 오는가</Kicker>
          <h2 className="mb-8 mt-6 text-[32px] font-black leading-tight md:text-[44px]">
            설계 원칙
          </h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(255,255,255,0.42)]">
            <p>
              플레이어가 시스템의 규칙을 눈치채지 못하게 하고 싶었다. 뭐가
              어떻게 돌아가는지 모르는 데서 긴장이 생긴다.
            </p>
            <p>
              점프 스케어 대신 심리적인 압박을 택했고, 그걸 위해 원칙 셋을
              정했다. 셋 다 지금 보고 있는 이 페이지에도 넣어 뒀다.
            </p>
          </div>
        </header>

        <div className="mb-24 space-y-12">
          {PRINCIPLES.map(p => (
            <div key={p.no} className="dl-principle-row dl-fade-up group pb-12">
              <div className="flex flex-col items-start md:flex-row md:gap-8">
                <div className="mb-2 w-full shrink-0 pt-1 md:mb-0 md:w-[64px]">
                  <span className="dl-row-number dl-ghost-number font-mono text-[32px] font-black">
                    {p.no}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-[22px] font-black text-[rgba(255,255,255,0.82)]">
                      {p.title}
                    </h3>
                    <span className="rounded border border-[rgba(255,255,255,0.10)] bg-[#0b0708] px-3 py-1 font-mono text-[12px] text-[#ff5a4d]">
                      {p.file}
                    </span>
                  </div>
                  <p className="mb-4 text-[15px] leading-8 text-[rgba(255,255,255,0.62)]">
                    {p.body}
                  </p>
                  <div className="dl-echo-line flex items-center gap-3 font-mono text-[13px] text-[#ff5a4d]">
                    <span className={p.pulse ? "dl-pulse-slow" : ""}>
                      {p.echo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 예고: 다음 구간에서 제어권을 뺏는다 ── */}
        <div className="dl-fade-up w-full rounded-md border border-[rgba(239,68,68,0.30)] bg-[rgba(239,68,68,0.05)] p-[18px] shadow-[0_0_24px_rgba(239,68,68,0.12)] md:p-6">
          <div className="font-mono text-[11px] tracking-[0.2em] text-[#ef4444]">
            ▲ 다음 페이지 안내
          </div>
          <p className="mt-2 text-[15px] leading-8 text-[rgba(255,255,255,0.82)]">
            다음 구간에서 화면이 약 3초간 어두워지고 손전등이 커서를 따라오지
            않습니다. 큰 소리나 갑작스러운 이미지는 없습니다.
          </p>
          <button
            type="button"
            onClick={() => markSequenceDone("takeover")}
            disabled={sequencesDone.takeover}
            className="mt-4 rounded border border-white/20 px-4 py-2 font-mono text-[12px] text-[rgba(255,255,255,0.82)] transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            {sequencesDone.takeover
              ? "[ 건너뛰었습니다 ]"
              : "[ 이 연출 건너뛰기 ]"}
          </button>
        </div>
      </div>
    </section>
  );
}
