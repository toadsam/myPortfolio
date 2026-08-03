"use client";

import {useRef} from "react";
import {useSueo} from "../context";
import {fade, Kicker, rise, WordHeading} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

const STEPS = [0, 100, 700, 1200, 2200, 2600, 2900];
const IDX = {label: 0, heading: 1, intro: 2, kpt: 3, next: 4, repo: 5, exit: 6};

const KPT: {key: string; color: string; items: string[]}[] = [
  {
    key: "Keep",
    color: "#4ade80",
    items: [
      "동작을 정지 이미지가 아니라 시계열로 설계한 것",
      "정답을 하나가 아니라 표현 집합으로 바꾼 것",
      "전환 구간을 화면이 아니라 서버에서 정한 것"
    ]
  },
  {
    key: "Problem",
    color: "#f87171",
    items: [
      "수어 표현을 검증할 사람을 끝까지 구하지 않았다",
      "표정을 다루지 않으면서 그 사실을 화면에 표시하지 않았다",
      "단어 수를 늘리는 데 시간을 더 썼다"
    ]
  },
  {
    key: "Try",
    color: "#fbbf24",
    items: [
      "학습 콘텐츠 확장과 실제 사용자 테스트 진행",
      "감수 절차를 개발 일정 안에 넣기",
      "다룰 수 없는 부분을 화면에 명시하기"
    ]
  }
];

export function RetroSection({onExit}: {onExit: () => void}) {
  const {reducedMotion: rm} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.08});
  const t = useTimeline(STEPS, inView, rm);
  const on = (i: number) => t[i] || rm;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto flex w-full max-w-[960px] flex-col items-center px-6 py-[100px]"
    >
      <div className="flex w-full max-w-[720px] flex-col items-start">
        <Kicker
          on={on(IDX.label)}
          instant={rm}
          className="text-[13px] tracking-[0.1em]"
        >
          09 · 회고
        </Kicker>
        <WordHeading
          text="기술보다 먼저 확인했어야 할 게 있었다"
          on={on(IDX.heading)}
          instant={rm}
          className="mt-4 text-[24px] font-black tracking-tight md:text-[30px]"
        />
        <p
          className="mt-[20px] text-[16px] leading-[36px]"
          style={rise(on(IDX.intro), rm)}
        >
          데이터 구조를 잘 짜는 건 제가 할 수 있는 일이었습니다.
          <br className="hidden md:block" /> 그런데 그 데이터가 맞는지는 저
          혼자서는 알 수 없는 일이었고,
          <br className="hidden md:block" /> 그걸 프로젝트가 끝날 때까지
          미뤄뒀습니다.
          <br className="hidden md:block" /> 다음에 비슷한 주제를 다룬다면
          순서를 바꿀 생각입니다.
        </p>
      </div>

      {/* ── KPT ── */}
      <div className="mt-[52px] grid w-full grid-cols-1 gap-[16px] md:grid-cols-3">
        {KPT.map((col, ci) => (
          <div
            key={col.key}
            className="group relative rounded-md border border-[rgba(255,255,255,0.10)] bg-[#101f33] p-[22px] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.22)]"
            style={{
              ...rise(on(IDX.kpt), rm),
              transitionDelay: rm ? "0s" : `${ci * 0.12}s`
            }}
          >
            <div
              className="absolute -left-px -right-px -top-px h-[3px] rounded-t-md transition-all duration-300 group-hover:h-[4px]"
              style={{background: col.color}}
            />
            <h3
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{color: col.color}}
            >
              {col.key}
            </h3>
            <ul className="mt-[18px]">
              {col.items.map((item, i) => (
                <li
                  key={item}
                  className="mb-[14px] text-[15px] leading-[32px] last:mb-0"
                  style={{
                    ...fade(on(IDX.kpt), rm, "0.4s"),
                    transitionDelay: rm ? "0s" : `${ci * 0.12 + i * 0.06}s`
                  }}
                >
                  · {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── 다음 단계 ── */}
      <div
        className="mt-[48px] flex w-full flex-col items-start rounded-md border border-[rgba(126,184,255,0.22)] border-l-[3px] border-l-[var(--sd-primary)] bg-[rgba(126,184,255,0.04)] p-[22px]"
        style={{
          opacity: on(IDX.next) ? 1 : 0,
          transform: on(IDX.next) ? "translateX(0)" : "translateX(-12px)",
          transition: rm ? "none" : "all 0.6s cubic-bezier(0.4,0,0.2,1)"
        }}
      >
        <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--sd-primary)]">
          다음 단계
        </span>
        <p className="mt-[12px] text-[16px] leading-[32px]">
          학습 콘텐츠 확장과 실제 사용자 테스트를 진행할 예정입니다.
          <br className="hidden md:block" /> 다만 단어를 더 넣기 전에, 지금 있는
          12개부터 검토받는 게 먼저라고 생각합니다.
        </p>
      </div>

      {/* ── 저장소 ── */}
      <div
        className="mt-[40px] flex w-full justify-start"
        style={fade(on(IDX.repo), rm)}
      >
        <a
          href="https://github.com/toadsam/Sign-Language"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center rounded-md bg-[var(--sd-primary)] px-[28px] py-[14px] font-mono text-[14px] font-black text-[var(--sd-bg)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_28px_rgba(126,184,255,0.34)] active:scale-[0.97] md:w-auto"
        >
          GitHub 저장소 ↗
        </a>
      </div>

      {/* ── 마을로 돌아가기 ── */}
      <div className="mt-[72px] w-full" style={fade(on(IDX.exit), rm, "0.7s")}>
        <button
          type="button"
          onClick={onExit}
          className="group relative flex h-[72px] w-full items-center justify-center overflow-hidden rounded-md border border-white/15 bg-transparent transition-colors duration-[400ms] hover:border-[rgba(126,184,255,0.45)] md:h-[88px]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(126,184,255,0.08)_0%,transparent_70%)] opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100" />
          <span className="relative z-10 font-mono text-[14px] tracking-[0.1em] text-white/60 transition-colors duration-[400ms] group-hover:text-[var(--sd-primary)] md:text-[15px]">
            ← 마을로 돌아가기
          </span>
        </button>
      </div>
    </section>
  );
}
