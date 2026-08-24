"use client";

import {useRef} from "react";
import {useAjou} from "../context";
import {
  Body,
  Kicker,
  LimitList,
  NoteBox,
  SectionShell,
  WordHeading,
  rise
} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

// 09 · 회고 — 방을 닫는 장. 배운 것을 한 문단으로 남기고 마을로 돌려보낸다.

const STEPS = [0, 150, 600, 1000, 1400];
const IDX = {label: 0, heading: 1, learn: 2, kpt: 3, exit: 4};

const REPO = "https://github.com/toadsam/ajouchong-web";

export function RetroSection({onExit}: {onExit: () => void}) {
  const {reducedMotion} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {threshold: 0.15});
  const on = useTimeline(STEPS, inView, reducedMotion);
  const instant = reducedMotion;

  return (
    <SectionShell innerRef={ref} className="pb-[120px]">
      <Kicker on={on[IDX.label]} instant={instant}>
        09 · 회고
      </Kicker>

      <div className="mt-4" style={rise(on[IDX.heading], instant)}>
        <WordHeading
          text="만드는 것과 쓰이게 하는 것은 다른 일이었다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6" style={rise(on[IDX.learn], instant)}>
        <Body>
          화면을 다 만들었을 때 저는 끝났다고 생각했습니다. 실제로는
          거기서부터가 절반이었습니다. 새로고침 한 번에 404가 뜨고, 내
          노트북에서만 되는 빌드를 마주하고 나서야{" "}
          <strong>&lsquo;배포&rsquo;가 별도의 기술 영역</strong>
          이라는 걸 알았습니다.
        </Body>
        <div className="mt-4">
          <Body>
            두 사고 모두 코드를 고쳐서 해결한 게 아니라는 점이 오래 남았습니다.
            하나는 서버 설정 한 줄이었고, 하나는 실행 환경을 통째로 고정하는
            일이었습니다. 그 뒤로는 무언가를 만들 때{" "}
            <span className="text-[var(--aj-accent)]">
              &ldquo;이건 어디서 돌아가지?&rdquo;
            </span>{" "}
            를 먼저 묻게 됐습니다.
          </Body>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-3 lg:grid-cols-3"
        style={rise(on[IDX.kpt], instant, "0.7s")}
      >
        <NoteBox label="KEEP" accent="var(--aj-ok)">
          <ul className="space-y-1 text-[14px] leading-[28px]">
            <li>실제 배포까지 끝낸 경험</li>
            <li>환경을 Docker로 고정한 습관</li>
          </ul>
        </NoteBox>
        <LimitList
          label="PROBLEM"
          items={["모바일 최적화 미흡", "접근성 보강 필요"]}
        />
        <NoteBox label="TRY" accent="var(--aj-primary)">
          <ul className="space-y-1 text-[14px] leading-[28px]">
            <li>공지 알림 기능</li>
            <li>관리자용 열람 통계</li>
          </ul>
        </NoteBox>
      </div>

      {/* ── 나가는 문 ── */}
      <div
        className="mt-12 flex flex-col items-center gap-4 border-t border-[rgba(255,255,255,0.1)] pt-10"
        style={rise(on[IDX.exit], instant, "0.7s")}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              borderColor: "rgba(255,255,255,0.18)",
              color: "var(--aj-muted)"
            }}
          >
            저장소 보기 ↗
          </a>
          <button
            type="button"
            onClick={onExit}
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              background: "rgba(251,113,133,0.16)",
              border: "1px solid rgba(251,113,133,0.45)",
              color: "var(--aj-accent)"
            }}
          >
            ← 마을로 돌아가기
          </button>
        </div>
        <p className="font-mono text-[11px] text-[var(--aj-faint)]">
          Esc 를 눌러도 나갈 수 있습니다
        </p>
      </div>
    </SectionShell>
  );
}
