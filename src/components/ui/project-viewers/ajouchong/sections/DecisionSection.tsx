"use client";

import {useRef, useState} from "react";
import {useAjou} from "../context";
import {Body, Kicker, SectionShell, TryHint, WordHeading, rise} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

// 07 · 선택 — 고른 것 옆에 「안 고른 것」을 같이 둔다.
// 결과만 적으면 그게 유일한 답처럼 보이는데, 실제로는 저울질이 있었다.

const STEPS = [0, 150, 600, 1000];
const IDX = {label: 0, heading: 1, body: 2, cards: 3};

interface Decision {
  area: string;
  pick: string;
  why: string;
  alt: string;
  altWhy: string;
}

const DECISIONS: Decision[] = [
  {
    area: "구조",
    pick: "SPA",
    why: "메뉴 사이를 오갈 때 화면이 깜빡이지 않는다",
    alt: "MPA (페이지마다 새로고침)",
    altWhy: "배포는 단순해지지만 이동할 때마다 흰 화면을 본다"
  },
  {
    area: "서빙",
    pick: "Nginx",
    why: "정적 파일 서빙과 폴백 처리에 그대로 맞는다",
    alt: "Node 서버",
    altWhy: "정적 파일만 내보내는 데 런타임을 하나 더 띄우게 된다"
  },
  {
    area: "배포",
    pick: "Docker",
    why: "빌드 환경을 이미지에 고정해 사람마다 다를 여지를 없앤다",
    alt: "서버에서 직접 빌드",
    altWhy: "한 번은 되지만, 서버가 바뀌면 같은 문제가 다시 난다"
  },
  {
    area: "인증",
    pick: "Context",
    why: "로그인 여부 하나만 필요해 이걸로 충분했다",
    alt: "상태관리 라이브러리",
    altWhy: "다룰 상태가 하나뿐인데 의존성과 개념이 늘어난다"
  }
];

export function DecisionSection() {
  const {reducedMotion} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {threshold: 0.2});
  const on = useTimeline(STEPS, inView, reducedMotion);
  const instant = reducedMotion;

  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <SectionShell innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant}>
        07 · 선택
      </Kicker>

      <div className="mt-4" style={rise(on[IDX.heading], instant)}>
        <WordHeading
          text="고른 것과 안 고른 것"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          네 가지 갈림길이 있었습니다. 규모가 작은 팀이라 &ldquo;더 좋은
          것&rdquo;보다 <strong>&ldquo;여기에 맞는 것&rdquo;</strong>을
          골랐습니다.
        </Body>
        <div className="mt-3">
          <TryHint>카드를 눌러 안 고른 쪽을 보세요</TryHint>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2"
        style={rise(on[IDX.cards], instant, "0.7s")}
      >
        {DECISIONS.map((d, i) => {
          const isFlipped = flipped === i;
          return (
            <button
              key={d.area}
              type="button"
              onClick={() => setFlipped(isFlipped ? null : i)}
              aria-pressed={isFlipped}
              className="flex min-h-[152px] flex-col rounded-md border p-4 text-left transition-colors duration-300"
              style={{
                borderColor: isFlipped
                  ? "rgba(255,255,255,0.22)"
                  : "rgba(251,113,133,0.3)",
                background: isFlipped
                  ? "rgba(255,255,255,0.035)"
                  : "rgba(251,113,133,0.06)"
              }}
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--aj-muted)]">
                {d.area}
              </span>

              {isFlipped ? (
                <>
                  <span className="mt-2 text-[16px] font-black text-[var(--aj-muted)] line-through">
                    {d.alt}
                  </span>
                  <span className="mt-2 flex-1 text-[13px] leading-[24px] text-[var(--aj-text)]">
                    {d.altWhy}
                  </span>
                  <span className="mt-3 font-mono text-[10px] text-[var(--aj-faint)]">
                    ← 다시 눌러 고른 쪽 보기
                  </span>
                </>
              ) : (
                <>
                  <span
                    className="mt-2 text-[16px] font-black"
                    style={{color: "var(--aj-accent)"}}
                  >
                    {d.pick}
                  </span>
                  <span className="mt-2 flex-1 text-[13px] leading-[24px] text-[var(--aj-text)]">
                    {d.why}
                  </span>
                  <span className="mt-3 font-mono text-[10px] text-[var(--aj-faint)]">
                    안 고른 쪽: {d.alt} →
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </SectionShell>
  );
}
