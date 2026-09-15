"use client";

import {useRef} from "react";
import {useSueo} from "../context";
import {fade, Kicker, LimitList, WordHeading} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

const STEPS = [0, 150, 800, 1400, 1800, 2400, 2900, 3200];
const IDX = {
  label: 0,
  heading: 1,
  intro: 2,
  wall: 3,
  frames: 4,
  plates: 5,
  count: 6,
  closing: 7
};

type Plate = {
  title: string;
  detail: string;
  /** 아예 다루지 않은 항목은 액자 안을 비워 둔다. */
  empty?: boolean;
  icon?: React.ReactNode;
};

const PLATES: Plate[] = [
  {
    title: "영상 속 동작의 정확성",
    detail:
      "팀원이 만든 3D 아바타 영상입니다. 농인 당사자나 수어 전문가의 검토는 없었습니다.",
    icon: (
      <svg
        className="h-10 w-10 opacity-55"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 11V6a2 2 0 0 0-4 0v1.5M14 6V4a2 2 0 0 0-4 0v4M10 5V3a2 2 0 0 0-4 0v7.5M6 10v2a6 6 0 0 0 12 0v-1" />
      </svg>
    )
  },
  {
    title: "문장 어순 규칙",
    detail:
      "시간·장소·주어·목적어·서술어 다섯 칸에 줄 세웁니다. 실제 문법은 훨씬 복잡합니다.",
    icon: (
      <svg
        className="h-12 w-12 opacity-55"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="10" width="4" height="4" rx="0.5" />
        <rect x="10" y="10" width="4" height="4" rx="0.5" />
        <rect x="17" y="10" width="4" height="4" rx="0.5" />
        <path
          d="M4 8h16M17 5l3 3-3 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    title: "세 갈래 선택 기준",
    detail:
      "사전에 몇 개 맞았는지로 고릅니다. 옳은지가 아니라 재생할 수 있는지를 셉니다.",
    icon: (
      <svg
        className="h-9 w-9 opacity-55"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="2" y="5" width="20" height="3.5" rx="0.5" />
        <rect x="2" y="10.5" width="20" height="3.5" rx="0.5" />
        <rect x="2" y="16" width="20" height="3.5" rx="0.5" />
      </svg>
    )
  },
  {
    title: "표정·비수지 신호",
    detail:
      "한국수어에서 표정은 문법입니다. 이 프로젝트는 그걸 아예 다루지 않았습니다.",
    empty: true
  },
  {
    title: "지역·세대별 차이",
    detail:
      "표현은 지역과 세대에 따라 다릅니다. 사전은 표기 하나만 담았습니다.",
    empty: true
  }
];

// 왼쪽 열은 GitHub 저장소의 코드와 커밋으로 확인되는 것만 적는다.
const CLAIMS: [string, string][] = [
  [
    "문장을 수어 단어 순서의 재생 목록으로 바꾸는 서버 경로를 만들었다",
    "그 순서가 자연스러운 한국수어인지"
  ],
  [
    "세 분석기 결과를 사전 적중 수로 고르게 했다",
    "그 기준이 정확도를 올리는지"
  ],
  [
    "단어마다 영상을 찾고, 없는 단어도 기억하게 했다",
    "영상이 없는 나머지 103단어가 언제 채워질지"
  ],
  [
    "앱을 GitHub Pages 에, 서버를 Cloud Run 에 올렸다",
    "실제 사용자가 몇 명이고 학습에 도움이 됐는지"
  ],
  [
    "운영 서버에서 영상 있는 단어 17개와 왕복 101ms 를 쟀다",
    "외부 분석기를 켠 상태의 속도와 정확도"
  ]
];

const DEBTS = [
  "로그인은 토큰을 발급까지만 하고, 요청마다 검증하는 자리가 없습니다. 사용자 API 가 인증 없이 열려 있습니다. 팀 전체가 채우지 못한 부분입니다.",
  "자동화된 테스트가 contextLoads() 하나뿐입니다.",
  "정규화가 손으로 쓴 어미 표입니다. 표에 없는 활용형은 외부 분석기가 받아 주지 않으면 사전에서 빠집니다.",
  "저장소에 .idea/ 와 빌드 산출물, 쓰이지 않는 퀴즈 mp4 20개(90MB)가 커밋돼 있습니다.",
  "커밋 메시지가 한동안 「1」, 「]1」이었습니다."
];

const NEXT_TIME = [
  "데이터를 만들기 전에 검토해줄 사람을 먼저 구한다",
  "단어 수를 늘리는 것보다 있는 단어를 검증받는 것을 우선한다",
  "표정을 다룰 수 없다면, 다룰 수 없다는 걸 화면에 표시한다",
  "학습 효과는 주장하지 않고, 사용자에게 물어본 결과만 말한다",
  "로그인을 붙이는 날, 요청마다 토큰을 검증하는 필터까지 한 번에 끝낸다"
];

export function LimitsSection() {
  const {reducedMotion: rm} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.08});
  const t = useTimeline(STEPS, inView, rm);
  const on = (i: number) => t[i] || rm;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto flex w-full max-w-[1020px] flex-col px-6 py-[100px]"
    >
      <Kicker on={on(IDX.label)} instant={rm} className="tracking-wide">
        07 · 이 프로젝트의 한계
      </Kicker>
      <WordHeading
        text="이 서비스의 수어 표현은 감수받지 않았습니다"
        on={on(IDX.heading)}
        instant={rm}
        className="mt-3 text-[28px] font-black leading-tight"
      />
      <p
        className="mt-5 max-w-[740px] text-[16px] leading-[2.25]"
        style={fade(on(IDX.intro), rm, "0.6s")}
      >
        학교 프로젝트였고, 앱이 트는 수어 영상은 팀원이 만든 3D 아바타로
        채웠습니다. 농인 당사자나 수어 전문가에게 검토받은 적은 없습니다. 그래서
        이 서비스가 보여주는 동작과 문장 순서가 정확한지, 자연스러운지를 보증할
        수 없습니다. 이건 기술적인 한계가 아니라{" "}
        <span className="font-bold text-[var(--sd-warn)]">
          만드는 과정에서 빠뜨린 절차입니다.
        </span>
      </p>

      {/* ── 검증 대기 벽 ── */}
      <div
        className="relative mt-[44px] flex min-h-[480px] w-full flex-col overflow-hidden rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-7"
        style={fade(on(IDX.wall), rm, "0.8s")}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(126,184,255,0.04)_0%,transparent_80%)]" />

        <div className="relative z-10 flex w-full flex-wrap justify-center gap-x-6 gap-y-10 sm:gap-x-8">
          {PLATES.map((p, i) => (
            <div key={p.title} className="flex w-[128px] flex-col sm:w-[150px]">
              <button
                type="button"
                className="sd-plate group flex w-full flex-col items-center rounded-sm text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sd-panel)]"
              >
                <div
                  className="aspect-[150/190] w-full border-[8px] border-[#14243a] bg-[var(--sd-bg)] p-px"
                  style={{
                    ...fade(on(IDX.frames), rm, "0.4s"),
                    transitionDelay: rm ? "0s" : `${i * 0.09}s`
                  }}
                >
                  <div className="relative flex h-full w-full items-center justify-center border border-[rgba(126,184,255,0.16)] bg-[var(--sd-panel)] text-white">
                    {p.empty ? (
                      <div className="absolute inset-[15px] flex items-center justify-center border border-dashed border-white/20">
                        <span className="font-mono text-[10px] text-white/35">
                          다루지 않음
                        </span>
                      </div>
                    ) : (
                      p.icon
                    )}
                  </div>
                </div>

                <div
                  className="mt-4 w-full border border-dashed border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.03)] p-[8px_11px]"
                  style={{
                    ...fade(on(IDX.plates), rm, "0.4s"),
                    transitionDelay: rm ? "0s" : `${i * 0.07}s`
                  }}
                >
                  <div className="truncate font-mono text-[11px] leading-tight text-[rgba(255,255,255,0.72)]">
                    {p.title}
                  </div>
                  <div className="mt-1 font-mono text-[9px] text-[rgba(255,255,255,0.42)]">
                    검증 대기
                  </div>
                  <div className="sd-plate-detail">
                    <div>
                      <div className="mt-2 border-t border-dashed border-[rgba(255,255,255,0.15)] pt-2 text-[13px] leading-[28px] text-[rgba(255,255,255,0.72)]">
                        {p.detail}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-auto flex w-full flex-col items-center pb-2 pt-12">
          <div
            className="font-mono text-[11px] tracking-widest tabular-nums text-[var(--sd-muted)]"
            style={fade(on(IDX.count), rm)}
          >
            검증 대기 {PLATES.length} · 검증 완료 0
          </div>
          <div
            className="mt-[28px] max-w-[640px] text-center text-[16px] leading-[2]"
            style={fade(on(IDX.closing), rm, "0.6s")}
          >
            이 벽을 채우려면 코드가 아니라 사람이 필요합니다.
          </div>
        </div>
      </div>

      {/* ── 말할 수 있는 것 / 없는 것 ── */}
      <div className="mt-[52px] flex w-full flex-col">
        <h2 className="mb-[14px] font-mono text-[10px] tracking-[0.18em] text-[var(--sd-muted)]">
          이 프로젝트로 말할 수 있는 것과 없는 것
        </h2>

        <div className="flex flex-col border-t border-[rgba(255,255,255,0.08)]">
          <div className="hidden grid-cols-2 gap-4 border-b border-[rgba(255,255,255,0.08)] py-3 font-mono text-[12px] text-[var(--sd-muted)] sm:grid">
            <div className="px-2">말할 수 있는 것</div>
            <div className="px-2">말할 수 없는 것</div>
          </div>

          {CLAIMS.map(([can, cannot], i) => (
            <div
              key={can}
              className="grid gap-y-1 border-b border-[rgba(255,255,255,0.08)] py-[14px] font-mono text-[12px] transition-all duration-500 sm:grid-cols-2 sm:gap-x-4"
              style={{
                opacity: on(IDX.count) ? 1 : 0,
                transform: on(IDX.count)
                  ? "translateY(0)"
                  : "translateY(0.5rem)",
                transitionDelay: rm ? "0s" : `${i * 0.1}s`
              }}
            >
              <div className="flex items-start gap-2 px-2">
                <span className="shrink-0 text-[var(--sd-ok)]">○</span>
                <span>{can}</span>
              </div>
              <div className="mt-[6px] flex items-start gap-2 px-2 text-[rgba(255,255,255,0.4)] sm:mt-0">
                <span className="shrink-0">✕</span>
                <span>{cannot}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-[24px] text-[15px] leading-[2]">
          왼쪽은 저장소의 코드와 커밋으로 확인할 수 있는 일입니다.
          <br className="hidden sm:block" />
          오른쪽은 이 프로젝트가 답할 수 없는 질문들입니다.
          <br className="hidden sm:block" />
          포트폴리오에서 오른쪽까지 했다고 말하고 싶은 유혹이 있었는데,{" "}
          <span className="font-bold text-[var(--sd-accent)]">
            그러지 않기로 했습니다.
          </span>
        </p>
      </div>

      {/* ── 코드가 가진 빚 (README 「알고 있는 빚」) ── */}
      <LimitList className="mt-[40px]" label="코드가 가진 빚" items={DEBTS} />

      {/* ── 다시 한다면 ── */}
      <div className="mt-[40px] flex flex-col rounded-md border border-[rgba(126,184,255,0.24)] border-l-[3px] border-l-[var(--sd-primary)] bg-[rgba(126,184,255,0.04)] p-[24px]">
        <h3 className="mb-[20px] font-mono text-[11px] tracking-[0.2em] text-[var(--sd-primary)]">
          다시 한다면 먼저 할 것
        </h3>
        <ul className="flex flex-col space-y-[12px]">
          {NEXT_TIME.map((item, i) => (
            <li
              key={item}
              className="flex items-start gap-3 text-[15px] leading-[2]"
            >
              <span className="mt-1 shrink-0 font-mono text-[var(--sd-primary)]">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-[16px] text-[15px] leading-[2]">
          지금은 「수어를 다루는 서비스를 만들어본 경험」까지입니다.
          <br />그 이상을 말하려면 절차가 더 필요합니다.
        </p>
      </div>
    </section>
  );
}
