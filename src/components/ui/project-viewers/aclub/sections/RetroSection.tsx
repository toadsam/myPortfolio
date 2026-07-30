"use client";

import {useEffect, useMemo, useRef, useState, type CSSProperties} from "react";
import {useAClub} from "../context";
import {Kicker, Reveal, useInViewOnce} from "../parts";

const GITHUB = "https://github.com/aClub2026/FE";

const KPT = [
  {
    title: "KEEP",
    color: "#4ade80",
    items: [
      "필터 상태를 주소에서 파생시킨 것",
      "상세를 모달이 아니라 라우트로 만든 것",
      "컴포넌트가 라우터를 모르게 유지한 것",
    ],
  },
  {
    title: "PROBLEM",
    color: "#f87171",
    items: [
      "뒤로가기 문제를 사용자가 말해주기 전까지 몰랐다",
      "스크롤 복원을 처음엔 잘못된 시점에 넣어서 두 번 고쳤다",
      "테스트 코드가 하나도 없다",
    ],
  },
  {
    title: "TRY",
    color: "#fbbf24",
    items: ["백엔드 API 연동과 실제 배포", "핵심 흐름(탐색→지원)에 E2E 테스트 붙이기", "실제 학생 5명에게 조건 필터를 써보게 하기"],
  },
];

function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

interface Props {
  onExit: () => void;
}

export function RetroSection({onExit}: Props) {
  const {reducedMotion, lockScroll} = useAClub();
  const {ref: sectionRef, inView} = useInViewOnce<HTMLElement>({threshold: 0.1});
  const [exiting, setExiting] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const timer = useRef(0);

  useEffect(() => {
    setMobile(window.innerWidth < 768);
  }, []);

  const cols = mobile ? 4 : 6;
  const rows = mobile ? 3 : 4;
  const count = cols * rows;

  // 떨어지는 순서를 섞어둔다 — 위에서 아래로 순서대로 떨어지면 기계적으로 보인다.
  const posters = useMemo(() => {
    const order = Array.from({length: count}, (_, i) => i);
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(seeded(i + 3) * (i + 1));
      [order[i], order[j]] = [order[j]!, order[i]!];
    }
    const stagger = count > 1 ? 0.65 / (count - 1) : 0;
    return order.map((slot, i) => ({
      fall: 0.45 + slot * stagger,
      rotate: (seeded(i + 17) > 0.5 ? 1 : -1) * (8 + seeded(i + 29) * 10),
    }));
  }, [count]);

  function handleExit() {
    if (exiting) return;
    setExiting(true);
    lockScroll(true);
    timer.current = window.setTimeout(onExit, reducedMotion ? 300 : 2300);
  }

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    [],
  );

  return (
    <section
      ref={sectionRef}
      id="ac-sec-retro"
      data-ac-section
      className="relative z-10 w-full border-t border-[rgba(192,132,252,0.1)]"
    >
      <div
        className="mx-auto flex max-w-[960px] flex-col items-center px-6 py-[120px] transition-opacity duration-300"
        style={{opacity: exiting ? 0 : 1}}
      >
        <div className="flex w-full max-w-[720px] flex-col items-center text-center">
          <Kicker tone="muted">09 · 회고</Kicker>

          <h2 className="mt-6 flex flex-wrap justify-center gap-x-[0.25em] gap-y-1 text-[24px] font-black leading-tight md:text-[30px]">
            {"기능을 만드는 것보다 브라우저를 되찾는 데 시간을 더 썼다".split(" ").map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="inline-block transition-all duration-[600ms]"
                style={{
                  transitionDelay: reducedMotion ? "0s" : `${i * 0.15}s`,
                  transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
                  opacity: inView ? 1 : 0,
                  transform: inView ? "none" : "translateY(12px)",
                }}
              >
                {word}
              </span>
            ))}
          </h2>

          <p
            className="mt-[20px] w-full text-center text-[16px] leading-[36px] text-[rgba(255,255,255,0.88)] transition-all duration-[800ms]"
            style={{
              transitionDelay: reducedMotion ? "0s" : "0.7s",
              transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(16px)",
            }}
          >
            필터도 목록도 상세도 하루면 만들었습니다.
            <br className="hidden md:block" />
            그런데 뒤로가기, 공유, 스크롤 위치 같은 것들을 제대로 돌려놓는 데
            <br className="hidden md:block" />
            그보다 훨씬 오래 걸렸고, 배운 것도 그쪽이 훨씬 많았습니다.
          </p>
        </div>

        {/* ── KPT ── */}
        <div className="mt-[52px] grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {KPT.map((col, colIndex) => {
            const delay = 1.2 + colIndex * 0.12;
            const isHovered = hovered === colIndex;
            return (
              <div
                key={col.title}
                onMouseEnter={() => setHovered(colIndex)}
                onMouseLeave={() => setHovered(null)}
                className="relative rounded-md bg-[#1c1330] p-[22px] transition-all duration-300 ease-out"
                style={{
                  transitionDelay: reducedMotion ? "0s" : `${delay}s`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? (isHovered ? "translateY(-4px)" : "none") : "translateY(20px)",
                  borderStyle: "solid",
                  borderWidth: 1,
                  borderColor: isHovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)",
                  borderTopWidth: isHovered ? 4 : 3,
                  borderTopColor: col.color,
                }}
              >
                <h3 className="mb-[18px] font-mono text-[11px] uppercase tracking-[0.2em]" style={{color: col.color}}>
                  {col.title}
                </h3>
                <div className="flex flex-col gap-[14px]">
                  {col.items.map((item, itemIndex) => (
                    <div
                      key={item}
                      className="flex items-start text-[15px] leading-[32px] text-[rgba(255,255,255,0.88)] transition-all duration-500"
                      style={{
                        transitionDelay: reducedMotion ? "0s" : `${delay + 0.06 * (itemIndex + 2)}s`,
                        transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
                        opacity: inView ? 1 : 0,
                        transform: inView ? "none" : "translateX(-10px)",
                      }}
                    >
                      <span className="mr-1.5 opacity-60">·</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Reveal className="mt-[48px] w-full rounded-md border border-[rgba(192,132,252,0.22)] border-l-[3px] border-l-[#c084fc] bg-[rgba(192,132,252,0.04)] p-[22px]">
          <div className="font-mono text-[11px] tracking-[0.2em] text-[#c084fc]">다음 단계</div>
          <p className="mt-3 text-[16px] leading-[32px] text-[rgba(255,255,255,0.88)]">
            백엔드 API 연동과 실제 배포를 진행할 예정입니다.
            <br className="hidden md:block" />
            붙이는 순간 데이터 출처만 바꾸면 되도록 mock 계층을 분리해뒀습니다.
          </p>
        </Reveal>

        <Reveal className="mt-[40px] w-full md:w-auto">
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="inline-block w-full rounded-md bg-[#c084fc] px-7 py-[14px] text-center font-mono text-[14px] font-black tabular-nums text-[#0d0816] outline-none transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_28px_rgba(192,132,252,0.36)] active:scale-[0.97] md:w-auto"
          >
            GitHub 저장소 ↗
          </a>
        </Reveal>

        {/* ── 마을로 돌아가기 ── */}
        <div
          className="group relative mt-[72px] h-[72px] w-full overflow-hidden rounded-md transition-opacity duration-500 md:h-[88px]"
          style={{opacity: inView ? 1 : 0}}
        >
          {(
            [
              {cls: "top-0 left-1/2 -translate-x-1/2 h-[1px]", grow: "width"},
              {cls: "bottom-0 left-1/2 -translate-x-1/2 h-[1px]", grow: "width"},
              {cls: "top-1/2 left-0 -translate-y-1/2 w-[1px]", grow: "height"},
              {cls: "top-1/2 right-0 -translate-y-1/2 w-[1px]", grow: "height"},
            ] as const
          ).map((edge, i) => (
            <span
              key={i}
              className={`absolute z-20 bg-[rgba(255,255,255,0.14)] transition-all duration-[700ms] group-hover:bg-[rgba(192,132,252,0.45)] ${edge.cls}`}
              style={{
                [edge.grow]: inView ? "100%" : "0%",
                transitionDelay: reducedMotion ? "0s" : "2.9s",
                transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
              } as CSSProperties}
            />
          ))}

          <button
            type="button"
            onClick={handleExit}
            className="relative z-10 flex h-full w-full items-center justify-center rounded-md bg-transparent font-mono text-[14px] tracking-[0.1em] text-[rgba(255,255,255,0.62)] outline-none transition-colors duration-[400ms] group-hover:text-[#c084fc] md:text-[15px]"
          >
            <span className="pointer-events-none absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_center,_rgba(192,132,252,0.12)_0%,_transparent_60%)] opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100" />
            ← 마을로 돌아가기
          </button>
        </div>
      </div>

      {/* ── 퇴장: 포스터가 한 장씩 떨어지고 불이 꺼진다 ── */}
      {exiting ? (
        <div className="pointer-events-none fixed inset-0 z-[110] overflow-hidden" aria-hidden="true">
          {reducedMotion ? (
            <div className="absolute inset-0 bg-[#0d0816]" />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 50% -20%, rgba(192,132,252,0.12), transparent 50%), radial-gradient(circle at 50% 120%, rgba(192,132,252,0.06), transparent 50%)",
                }}
              />
              <div
                className="absolute inset-0 mx-auto grid h-full w-full max-w-[1200px]"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  gap: mobile ? "12px" : "24px",
                  padding: mobile ? "32px 16px" : "64px 32px",
                }}
              >
                {posters.map((p, i) => (
                  <div key={i} className="relative flex h-full w-full items-center justify-center">
                    <div
                      className="ac-exit-poster relative flex h-full max-h-[160px] w-full flex-col rounded-sm border border-[rgba(255,255,255,0.10)] bg-[#1c1330] px-3 pt-6"
                      style={
                        {
                          "--ac-exit-delay": `${p.fall}s`,
                          "--ac-exit-rot": `${p.rotate}deg`,
                        } as CSSProperties
                      }
                    >
                      <span
                        className="ac-exit-tape absolute -top-[6px] left-1/2 h-4 w-8 -translate-x-1/2 rounded-sm bg-white/20 backdrop-blur-[2px] md:-top-[10px] md:h-5 md:w-12"
                        style={{"--ac-exit-peel": `${Math.max(0.25, p.fall - 0.1)}s`} as CSSProperties}
                      />
                      <span className="mb-3 h-1.5 w-[80%] rounded-full bg-white/10 md:h-2" />
                      <span className="mb-2 h-1.5 w-[50%] rounded-full bg-white/10 md:h-2" />
                      <span className="h-1.5 w-[60%] rounded-full bg-white/10 md:h-2" />
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="absolute inset-0 bg-[#0d0816] opacity-0 transition-opacity duration-[350ms]"
                style={{animation: "ac-exit-blackout 0.35s ease 1.85s forwards"}}
              />
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
