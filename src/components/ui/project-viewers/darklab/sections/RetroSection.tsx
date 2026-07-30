"use client";

const GITHUB = "https://github.com/toadsam/DarkLab";

const KPT = [
  {
    key: "KEEP",
    color: "#4ade80",
    items: ["시야·소리·카메라 분리", "Cinemachine 도입"],
  },
  {
    key: "PROBLEM",
    color: "#f87171",
    items: ["프로파일러 방치", "레벨 디자인 감 의존", "연출 중 상태 복구를 설계 없이 붙임"],
  },
  {
    key: "TRY",
    color: "#fbbf24",
    items: ["캡처 먼저 남기기", "퍼즐 요소 추가"],
  },
];

export function RetroSection({onExit}: {onExit: () => void}) {
  return (
    <section id="dl-sec-12" data-dl-section className="relative flex min-h-screen w-full flex-col items-center py-24">
      <div className="z-10 flex h-full w-full max-w-[900px] flex-col justify-between px-6">
        <div>
          <header className="mb-12">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[rgba(255,255,255,0.42)]">
              06 · 회고
            </div>
            <h2 className="text-[32px] font-black leading-tight">무섭게 만드는 건 감각이 아니라 목록이었다</h2>
          </header>

          <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {KPT.map((col) => (
              <div
                key={col.key}
                className="dl-kpt rounded-md border border-white/12 bg-[#131011] p-6"
                style={{borderTop: `2px solid ${col.color}`}}
              >
                <h3
                  className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em]"
                  style={{color: col.color}}
                >
                  {col.key}
                </h3>
                <ul className="list-disc space-y-2 pl-4 text-[14px] leading-7 text-white/70">
                  {col.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="dl-fade-up mb-8 max-w-[720px] text-[15px] leading-8 text-[rgba(255,255,255,0.62)]">
            다음은 퍼즐과 엔딩 시퀀스를 붙여 챕터형으로 확장하는 것입니다. 그 전에 프로파일러를 켜 둔 채로 만드는
            습관부터 들일 생각입니다.
          </p>

          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-md bg-[#ef4444] px-7 py-3.5 font-mono text-[14px] font-black text-[#070405] transition-transform hover:scale-[1.04]"
          >
            GitHub 저장소 ↗
          </a>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="dl-exit-btn group relative mt-24 flex h-[88px] w-full items-center justify-center overflow-hidden rounded-md border border-white/[0.14] bg-transparent outline-none"
        >
          <span className="pointer-events-none absolute inset-0 bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative z-10 font-mono text-[15px] tracking-[0.1em] text-white/60 transition-colors group-hover:text-[#ff5a4d]">
            ← 마을로 돌아가기
          </span>
          <span className="dl-exit-border z-10" />
        </button>
      </div>
    </section>
  );
}
