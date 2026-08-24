"use client";

import {useRef, useState} from "react";
import {useAjou} from "../context";
import {Body, Kicker, SectionShell, TryHint, WordHeading, rise} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

// 06 · 구조 — 앞 장들에서 겪은 것들이 어느 층의 일이었는지 한 장으로 정리한다.

const STEPS = [0, 150, 600, 1000];
const IDX = {label: 0, heading: 1, body: 2, stack: 3};

interface Layer {
  tag: string;
  name: string;
  desc: string;
  detail: string;
  /** 이 층에서 벌어졌던 사건 — 앞 장과 이어 붙이는 고리. */
  episode?: string;
  color: string;
}

const LAYERS: Layer[] = [
  {
    tag: "Route",
    name: "React Router SPA",
    desc: "공지 / Q&A / 자료 / 복지 라우팅",
    detail:
      "화면 전환을 브라우저가 담당한다. 주소는 바뀌지만 문서를 다시 받지는 않는다.",
    episode: "02 · 주소는 바뀌는데 새로 받지는 않는다",
    color: "var(--aj-primary)"
  },
  {
    tag: "Auth",
    name: "AuthContext",
    desc: "로그인 상태 전역 · ProtectedRoute",
    detail:
      "라이브러리 없이 Context 하나로 로그인 상태를 들고, 보호가 필요한 라우트만 감쌌다.",
    episode: "05 · 읽기는 모두에게, 쓰기는 학생회에만",
    color: "var(--aj-accent)"
  },
  {
    tag: "Serve",
    name: "Nginx",
    desc: "정적 서빙 · SPA try_files 폴백",
    detail:
      "빌드 산출물을 그대로 내보낸다. 없는 경로는 index.html 로 넘겨 라우터에게 맡긴다.",
    episode: "03 · 새로고침하면 404가 떴다",
    color: "var(--aj-ok)"
  },
  {
    tag: "Ship",
    name: "Docker",
    desc: "빌드 · 실행 환경 고정",
    detail:
      "Node 버전부터 파일명 대소문자 규칙까지 이미지가 정한다. 바깥 환경이 끼어들 자리를 없앴다.",
    episode: "04 · 로컬은 되는데 서버에선 달랐다",
    color: "var(--aj-warn)"
  }
];

export function ArchitectureSection() {
  const {reducedMotion} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {threshold: 0.2});
  const on = useTimeline(STEPS, inView, reducedMotion);
  const instant = reducedMotion;

  const [open, setOpen] = useState(0);

  return (
    <SectionShell innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant}>
        06 · 구조
      </Kicker>

      <div className="mt-4" style={rise(on[IDX.heading], instant)}>
        <WordHeading
          text="네 층으로 나눠 두었다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          앞에서 겪은 두 사고는 각각 다른 층의 문제였습니다. 404는 서빙 층이,
          빌드 차이는 배포 층이 책임집니다. 층을 나눠 두면 사고가 났을 때{" "}
          <strong>어디를 봐야 하는지</strong>가 먼저 정해집니다.
        </Body>
        <div className="mt-3">
          <TryHint>층을 눌러 보세요</TryHint>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]"
        style={rise(on[IDX.stack], instant, "0.7s")}
      >
        {/* 스택 */}
        <div className="flex flex-col gap-2">
          {LAYERS.map((l, i) => {
            const isOpen = i === open;
            return (
              <button
                key={l.tag}
                type="button"
                onClick={() => setOpen(i)}
                aria-expanded={isOpen}
                className={`flex items-center gap-3 rounded-md border px-4 py-3.5 text-left transition-colors duration-200 ${
                  instant ? "" : "aj-stack"
                }`}
                style={{
                  borderColor: isOpen ? l.color : "rgba(255,255,255,0.13)",
                  background: isOpen
                    ? `color-mix(in srgb, ${l.color} 10%, transparent)`
                    : "rgba(255,255,255,0.025)",
                  animationDelay: instant ? undefined : `${i * 90}ms`
                }}
              >
                <span
                  className="w-[52px] shrink-0 rounded px-1.5 py-1 text-center font-mono text-[10px] font-black uppercase tracking-wider"
                  style={{
                    background: `color-mix(in srgb, ${l.color} 18%, transparent)`,
                    color: l.color
                  }}
                >
                  {l.tag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-white">
                    {l.name}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[10px] text-[var(--aj-muted)]">
                    {l.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 펼친 층 설명 */}
        <div
          className="rounded-md border p-5"
          style={{
            borderColor: `color-mix(in srgb, ${LAYERS[open].color} 40%, transparent)`,
            background: `color-mix(in srgb, ${LAYERS[open].color} 6%, transparent)`
          }}
        >
          <div
            className="font-mono text-[10px] tracking-[0.2em]"
            style={{color: LAYERS[open].color}}
          >
            {LAYERS[open].tag}
          </div>
          <h3 className="mt-2 text-[18px] font-black text-white">
            {LAYERS[open].name}
          </h3>
          <p className="mt-3 text-[14px] leading-[28px] text-[var(--aj-text)]">
            {LAYERS[open].detail}
          </p>
          {LAYERS[open].episode ? (
            <p className="mt-4 border-t border-[rgba(255,255,255,0.1)] pt-3 font-mono text-[11px] leading-5 text-[var(--aj-muted)]">
              이 방에서 본 장면 →{" "}
              <span style={{color: LAYERS[open].color}}>
                {LAYERS[open].episode}
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}
