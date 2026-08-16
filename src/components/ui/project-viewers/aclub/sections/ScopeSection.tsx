"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";
import {useAClub} from "../context";
import {Reveal, useInViewOnce} from "../parts";

const DONE: {
  label: string;
  rotFinal: string;
  rotOver: string;
  delay: string;
  glyph: ReactNode;
}[] = [
  {
    label: "동아리 탐색 화면",
    rotFinal: "-1.5deg",
    rotOver: "-3deg",
    delay: "0s",
    glyph: (
      <>
        <div className="mb-1 h-6 w-10 rounded-sm border border-white/20" />
        <div className="flex gap-1">
          <div className="h-4 w-4 rounded bg-white/10" />
          <div className="h-4 w-4 rounded bg-white/10" />
        </div>
      </>
    )
  },
  {
    label: "필터와 재배치",
    rotFinal: "2deg",
    rotOver: "4deg",
    delay: "0.11s",
    glyph: (
      <div className="flex w-full max-w-[40px] flex-col gap-1.5">
        <div className="h-1 w-full rounded-full bg-white/20" />
        <div className="h-1 w-3/4 rounded-full bg-white/20" />
      </div>
    )
  },
  {
    label: "상세 · 모집 공고",
    rotFinal: "-0.5deg",
    rotOver: "-1.5deg",
    delay: "0.22s",
    glyph: (
      <>
        <div className="mb-2 h-10 w-full rounded-sm border border-white/20" />
        <div className="h-1 w-full rounded-full bg-white/10" />
      </>
    )
  },
  {
    label: "지원 흐름 · 보호 라우트",
    rotFinal: "1.5deg",
    rotOver: "3deg",
    delay: "0.33s",
    glyph: (
      <>
        <div className="h-4 w-8 rounded-full border border-white/20" />
        <svg
          className="h-3 w-3 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
        <div className="h-4 w-8 rounded-full bg-white/10" />
      </>
    )
  },
  {
    label: "마이페이지",
    rotFinal: "-2.5deg",
    rotOver: "-5deg",
    delay: "0.44s",
    glyph: (
      <>
        <div className="mb-2 h-8 w-8 rounded-full border border-white/20" />
        <div className="h-1 w-12 rounded-full bg-white/20" />
      </>
    )
  },
  {
    label: "관리자 화면",
    rotFinal: "1deg",
    rotOver: "2deg",
    delay: "0.55s",
    glyph: (
      <div className="grid w-10 grid-cols-2 gap-1">
        <div className="aspect-square rounded-sm bg-white/20" />
        <div className="aspect-square rounded-sm bg-white/10" />
        <div className="aspect-square rounded-sm bg-white/10" />
        <div className="aspect-square rounded-sm bg-white/20" />
      </div>
    )
  }
];

const NOT_DONE = [
  {label: "백엔드 API", status: "미구현", tip: "화면은 mock data로 동작합니다"},
  {
    label: "로그인 · 인증",
    status: "화면만 있음",
    tip: "역할 전환은 프론트에서만 이뤄집니다"
  },
  {
    label: "데이터베이스",
    status: "미구현",
    tip: "새로고침하면 상태가 초기화됩니다"
  },
  {label: "실제 배포", status: "안 함", tip: "로컬에서만 실행해봤습니다"},
  {
    label: "실사용자 테스트",
    status: "안 함",
    tip: "팀 내부에서만 확인했습니다"
  },
  {label: "이미지 업로드", status: "미구현", tip: "이미지는 고정 에셋을 씁니다"}
];

export function ScopeSection() {
  const {reducedMotion} = useAClub();
  const {ref: sectionRef, inView} = useInViewOnce<HTMLElement>({
    threshold: 0.1
  });

  const [phase, setPhase] = useState(0);
  const [wallActive, setWallActive] = useState(false);
  const [dropped, setDropped] = useState<Set<number>>(new Set());
  const [dividerOn, setDividerOn] = useState(false);
  const [tagOn, setTagOn] = useState(false);
  const [emptyIn, setEmptyIn] = useState(0);
  const [countOn, setCountOn] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!inView) return;

    if (reducedMotion) {
      setPhase(3);
      setWallActive(true);
      setDropped(new Set(DONE.map((_, i) => i)));
      setDividerOn(true);
      setTagOn(true);
      setEmptyIn(NOT_DONE.length);
      setCountOn(true);
      return;
    }

    const push = (fn: () => void, ms: number) =>
      timers.current.push(window.setTimeout(fn, ms));

    setPhase(1); // 라벨 · 제목
    push(() => setPhase(2), 700); // 설명문
    push(() => setPhase(3), 1200); // 벽 등장
    push(() => {
      setWallActive(true);
      DONE.forEach((p, i) => {
        push(
          () => setDropped(s => new Set(s).add(i)),
          parseFloat(p.delay) * 1000 + 650
        );
      });
    }, 1600);
    push(() => {
      setDividerOn(true);
      push(() => setTagOn(true), 300);
    }, 2400);
    push(() => {
      NOT_DONE.forEach((_, i) =>
        push(() => setEmptyIn(n => Math.max(n, i + 1)), i * 70)
      );
    }, 2900);
    push(() => setCountOn(true), 3400);

    return () => {
      timers.current.forEach(t => window.clearTimeout(t));
      timers.current = [];
    };
  }, [inView, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="ac-sec-scope"
      data-ac-section
      className="relative z-10 w-full border-t border-[rgba(192,132,252,0.1)]"
    >
      <div className="mx-auto flex max-w-[1040px] flex-col items-center px-6 py-[120px]">
        <div className="w-full">
          <div
            className="mb-4 font-mono text-[12px] tracking-wider text-[rgba(255,255,255,0.46)] transition-opacity duration-[400ms]"
            style={{opacity: phase >= 1 ? 1 : 0}}
          >
            07 · 이 프로젝트의 범위
          </div>
          <h2 className="flex flex-wrap gap-x-2 text-[28px] font-black leading-tight text-[rgba(255,255,255,0.88)]">
            {"벽의 절반은 아직 비어 있습니다".split(" ").map((w, i) => (
              <span
                key={w}
                className="inline-block transition-all duration-[400ms]"
                style={{
                  transitionDelay: `${i * 0.15}s`,
                  opacity: phase >= 1 ? 1 : 0,
                  transform: phase >= 1 ? "none" : "translateY(8px)"
                }}
              >
                {w}
              </span>
            ))}
          </h2>
          <p
            className="mt-[20px] max-w-[740px] text-[16px] leading-[36px] text-[rgba(255,255,255,0.88)] transition-all duration-[600ms]"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "none" : "translateY(16px)"
            }}
          >
            포트폴리오에서는 프로젝트를 크게 보이게 만들 방법이 많습니다. 그런데
            면접에서 한 번만 물어보면 다 드러납니다. 그래서 여기에 범위를 그대로
            적어두기로 했습니다.
          </p>
        </div>

        {/* ── 절반만 채운 벽 ── */}
        <div
          className={`relative mt-[44px] min-h-[520px] w-full overflow-hidden rounded-md border border-[rgba(192,132,252,0.18)] bg-[#170f26] p-[26px] transition-all duration-[800ms] min-[900px]:h-[520px] ${
            wallActive ? "ac-wall-active" : ""
          }`}
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "none" : "translateY(32px)"
          }}
        >
          <div className="ac-noise" aria-hidden="true" />

          <div className="sr-only">
            이 섹션은 프로젝트의 구현 범위와 미구현 범위를 보여줍니다. 완료된
            항목 6개: {DONE.map(d => d.label).join(", ")}. 미구현 또는 축소된
            항목 6개: {NOT_DONE.map(d => d.label).join(", ")}.
          </div>

          <div className="relative z-10 grid h-full w-full grid-cols-2 place-items-center gap-[16px] sm:grid-cols-3 min-[900px]:grid-cols-6 min-[900px]:place-items-stretch">
            {DONE.map((p, i) => (
              <div
                key={p.label}
                className={`ac-scope-poster group relative flex aspect-[3/4] w-full flex-col rounded border border-[rgba(255,255,255,0.1)] bg-[#110b17] drop-shadow-md ${
                  dropped.has(i) ? "ac-dropped" : ""
                }`}
                style={
                  {
                    "--ac-delay": p.delay,
                    "--ac-rot-final": p.rotFinal,
                    "--ac-rot-over": p.rotOver
                  } as CSSProperties
                }
              >
                <div className="h-1 w-full rounded-t bg-[#c084fc]" />
                <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-3 opacity-40">
                  {p.glyph}
                </div>
                <div className="relative mt-auto border-t border-[rgba(255,255,255,0.06)] bg-[#130d1c] p-3">
                  <div className="break-keep font-mono text-[11px] leading-snug text-[rgba(255,255,255,0.88)]">
                    {p.label}
                  </div>
                  <div className="absolute bottom-2 right-2 font-mono text-[9px] tabular-nums text-[#4ade80]">
                    완료
                  </div>
                </div>
                <div className="ac-dust absolute -bottom-3 left-1/2 h-6 w-16 -translate-x-1/2 blur-[3px]" />
              </div>
            ))}

            {NOT_DONE.map((p, i) => (
              <div
                key={p.label}
                tabIndex={0}
                className="group relative flex aspect-[3/4] w-full flex-col items-center justify-center rounded border border-dashed border-[rgba(255,255,255,0.14)] bg-transparent outline-none transition-all duration-300 hover:border-[rgba(255,255,255,0.28)] focus:border-[rgba(255,255,255,0.28)]"
                style={{opacity: i < emptyIn ? 1 : 0}}
              >
                {[
                  "left-1 top-1",
                  "right-1 top-1",
                  "bottom-1 left-1",
                  "bottom-1 right-1"
                ].map(pos => (
                  <span
                    key={pos}
                    className={`absolute ${pos} h-[6px] w-[6px] rounded-[1px] bg-[rgba(255,255,255,0.05)]`}
                  />
                ))}

                <div className="mb-1 font-mono text-[11px] text-[rgba(255,255,255,0.42)]">
                  {p.label}
                </div>
                <div className="font-mono text-[9px] text-[rgba(255,255,255,0.30)]">
                  {p.status}
                </div>

                <div
                  role="tooltip"
                  className={`pointer-events-none absolute bottom-full z-30 mb-3 whitespace-nowrap rounded border border-[rgba(255,255,255,0.16)] bg-[#0f0a1a] px-[10px] py-[6px] font-mono text-[10px] text-[rgba(255,255,255,0.88)] opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100 ${
                    i === NOT_DONE.length - 1
                      ? "min-[900px]:right-0 min-[900px]:translate-x-4"
                      : ""
                  }`}
                >
                  {p.tip}
                </div>
              </div>
            ))}
          </div>

          {/* 여기까지 만들었습니다 */}
          <div
            className="absolute left-0 top-1/2 z-20 flex h-[1px] w-full -translate-y-1/2 origin-left items-center justify-center bg-[rgba(192,132,252,0.20)] transition-transform duration-[500ms] ease-out"
            style={{transform: `translateY(-50%) scaleX(${dividerOn ? 1 : 0})`}}
          >
            <div
              className="rounded border border-[rgba(251,191,36,0.35)] bg-[#170f26] px-[12px] py-[5px] font-mono text-[10px] tabular-nums text-[#fbbf24] transition-opacity duration-300"
              style={{opacity: tagOn ? 1 : 0}}
            >
              여기까지 만들었습니다
            </div>
          </div>

          <div
            className="absolute bottom-[26px] right-[26px] z-20 font-mono text-[10px] tabular-nums text-[rgba(255,255,255,0.46)] transition-opacity duration-[600ms]"
            style={{opacity: countOn ? 1 : 0}}
          >
            완료 6 · 미완 6
          </div>
        </div>

        <Reveal className="mt-[44px] w-full rounded-md border border-[rgba(192,132,252,0.24)] border-l-[3px] border-l-[#c084fc] bg-[rgba(192,132,252,0.04)] p-[24px]">
          <div className="mb-4 font-mono text-[11px] tracking-[0.2em] text-[#c084fc]">
            왜 여기서 멈췄나
          </div>
          <p className="mb-4 text-[16px] leading-[36px] text-[rgba(255,255,255,0.88)]">
            이 프로젝트에서 제가 맡은 건 프론트엔드였고, 팀에서 백엔드는 별도로
            진행 중이었습니다. API가 나오기를 기다리는 대신 mock data로 화면
            흐름을 전부 완성해뒀습니다.
          </p>
          <p className="text-[16px] leading-[36px] text-[rgba(255,255,255,0.88)]">
            덕분에 탐색부터 지원까지의 흐름과 필터·라우팅 문제를 먼저 다
            겪었습니다.{" "}
            <strong className="font-bold text-[#d8b4fe]">
              데이터 출처만 바꾸면 되도록
            </strong>{" "}
            만들어두는 것까지가 이번 범위였습니다.
          </p>
        </Reveal>

        <Reveal className="mt-[36px] flex w-full flex-col gap-[16px] md:flex-row">
          <div className="flex-1 rounded-md border border-[rgba(192,132,252,0.22)] bg-[rgba(192,132,252,0.04)] p-[20px]">
            <div className="mb-5 font-mono text-[10px] tracking-[0.18em] text-[#c084fc]">
              제가 한 일
            </div>
            <ul className="space-y-2">
              {[
                "동아리 탐색, 필터, 상세 페이지 구현",
                "모집 공고 조회와 지원 화면 구현",
                "마이페이지와 관리자 화면 구조 설계",
                "공통 컴포넌트와 라우팅 구조 정리"
              ].map(t => (
                <li
                  key={t}
                  className="flex items-start gap-2 text-[15px] leading-[32px] text-[rgba(255,255,255,0.88)]"
                >
                  <span className="mt-[2px] select-none text-[#c084fc]">·</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.02)] p-[20px]">
            <div className="mb-5 font-mono text-[10px] tracking-[0.18em] text-[rgba(255,255,255,0.46)]">
              이 프로젝트로 증명되는 것 / 안 되는 것
            </div>
            <ul className="space-y-2">
              {[
                {
                  mark: "○",
                  text: "긴 사용자 흐름을 화면 단위로 설계할 수 있다",
                  dim: false
                },
                {
                  mark: "○",
                  text: "브라우저 기본 동작(주소·뒤로가기·스크롤)을 다룰 수 있다",
                  dim: false
                },
                {
                  mark: "✕",
                  text: "서버 구현과 실제 권한 처리는 이 프로젝트로 보여지지 않는다",
                  dim: true
                },
                {
                  mark: "✕",
                  text: "실사용자 규모에서의 동작은 확인된 바 없다",
                  dim: true
                }
              ].map(row => (
                <li
                  key={row.text}
                  className="flex items-start gap-2 text-[15px] leading-[32px]"
                  style={{
                    color: row.dim
                      ? "rgba(255,255,255,0.40)"
                      : "rgba(255,255,255,0.88)"
                  }}
                >
                  <span
                    className="mt-[2px] select-none"
                    style={{
                      color: row.dim ? "rgba(255,255,255,0.40)" : "#4ade80"
                    }}
                  >
                    {row.mark}
                  </span>
                  <span>{row.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
