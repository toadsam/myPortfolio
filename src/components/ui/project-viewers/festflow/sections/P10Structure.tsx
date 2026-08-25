"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useFestFlow} from "../context";
import {
  Body,
  Heading,
  Hint,
  Kicker,
  MetaCell,
  Page,
  Panel,
  Shot,
  rise,
  usePageIn
} from "../parts";
import {useOnScreen, usePageVisible, useTimeline} from "../../_kit/useTimeline";

// PAGE 10 — 전체 구조와 내가 한 범위
//
// 개발 실체: 발표자료 18장 「기술 아키텍처 및 시스템 구조」 원문
//   FrontEnd React + Vite PWA (Vercel) / BackEnd Spring Boot (Railway)
//   DB PostgreSQL (Railway Plugin) / 외부 OpenAI API / SSE 실시간 반영
//   Security JWT · 요청 검증 Validation · 예외 처리 Exception
// 연출 장치: 데이터 흐름도가 **한 층씩 그려진다.** 1인 개발이라 전 구간이 켜진다.

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, diagram: 3, meta: 4};

const LAYERS = [
  {
    k: "client",
    t: "사용자",
    d: "방문객 · 스태프 / 운영자 · 관리자",
    tech: "브라우저 (HTTPS)",
    color: "var(--ff-ray)"
  },
  {
    k: "front",
    t: "FrontEnd",
    d: "Home · Map · Booth · AI Match · Admin",
    tech: "React + Vite PWA · Vercel",
    color: "var(--ff-live)"
  },
  {
    k: "back",
    t: "BackEnd",
    d: "부스 · 공연/공지 · 분실물/예약 · AI Match · StreamService",
    tech: "Spring Boot · Railway",
    color: "var(--ff-primary)"
  },
  {
    k: "db",
    t: "Database",
    d: "사용자 · 부스/공연/공지 · 신청/매칭/예약 · 운영 로그",
    tech: "PostgreSQL · Railway Plugin",
    color: "var(--ff-accent)"
  },
  {
    k: "ext",
    t: "외부 연동",
    d: "AI Match · 챗봇 · 축제 가이드 · 공지 초안",
    tech: "OpenAI API · Python ML",
    color: "var(--ff-stale)"
  }
] as const;

const GUARDS = [
  {t: "Security", d: "JWT · 필터"},
  {t: "요청 검증", d: "Validation"},
  {t: "예외 처리", d: "Exception"}
] as const;

export function P10Structure() {
  const {reducedMotion, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const boxRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(boxRef, 0.2);
  const visible = usePageVisible();

  const [drawn, setDrawn] = useState(instant ? LAYERS.length : 0);

  // 한 층씩 그려진다. 화면 밖·탭 숨김이면 멈춘다(스펙 A-8).
  useEffect(() => {
    if (instant || !onScreen || !visible) return;
    if (drawn >= LAYERS.length) return;
    const t = window.setTimeout(() => setDrawn(d => d + 1), 380);
    return () => window.clearTimeout(t);
  }, [instant, onScreen, visible, drawn]);

  const redraw = useCallback(() => {
    setDrawn(0);
    announce("구조도를 다시 그립니다.");
  }, [announce]);

  return (
    <Page index={10} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        10 · 구조
      </Kicker>

      <div className="mt-4">
        <Heading
          text="전 구간이 제 담당이었습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          기획 · 프론트 · 백엔드 · AI · 배포까지 <strong>1인 개발</strong>입니다.
          그래서 구조를 그릴 때 &ldquo;누가 뭘 맡나&rdquo;가 아니라{" "}
          <strong style={{color: "var(--ff-accent)"}}>
            어디가 죽으면 뭐가 멈추나
          </strong>
          를 기준으로 나눴습니다.
        </Body>
      </div>

      <div
        ref={boxRef}
        className="mt-9 rounded-md p-5"
        style={{
          border: "1px solid var(--ff-border)",
          background: "var(--ff-panel)",
          ...rise(on[IDX.diagram], instant)
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
            SYSTEM · {Math.min(drawn, LAYERS.length)} / {LAYERS.length} 층
          </span>
          <button
            type="button"
            onClick={redraw}
            className="cursor-pointer rounded px-3 py-1.5 font-mono text-[11px] transition-colors duration-200"
            style={{
              border: "1px solid var(--ff-border)",
              color: "var(--ff-muted)"
            }}
          >
            다시 그리기 ↻
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          {LAYERS.map((l, i) => {
            const lit = i < drawn;
            return (
              <div key={l.k}>
                <div
                  className={`rounded-md p-3.5 transition-[border-color,background-color,opacity] duration-500 ${
                    lit && !instant ? "ff-signal" : ""
                  }`}
                  style={{
                    border: `1px solid ${
                      lit ? l.color : "rgba(255,255,255,0.08)"
                    }`,
                    background: lit
                      ? `color-mix(in srgb, ${l.color} 8%, transparent)`
                      : "rgba(255,255,255,0.01)",
                    opacity: lit ? 1 : 0.25
                  }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span
                      className="font-mono text-[12px] font-bold"
                      style={{color: lit ? l.color : "var(--ff-faint)"}}
                    >
                      {l.t}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--ff-faint)]">
                      {l.tech}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-[var(--ff-muted)] sm:text-[12px]">
                    {l.d}
                  </p>
                </div>
                {i < LAYERS.length - 1 ? (
                  <div className="flex justify-center py-0.5">
                    <span
                      className="font-mono text-[11px] transition-colors duration-500"
                      style={{
                        color: i + 1 < drawn ? l.color : "var(--ff-faint)"
                      }}
                      aria-hidden="true"
                    >
                      ↓
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* 백엔드에 항상 붙어 있는 것 */}
        <div className="mt-5">
          <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--ff-muted)]">
            백엔드에 상시 붙는 것
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {GUARDS.map(g => (
              <span
                key={g.t}
                className="rounded px-2.5 py-1.5 font-mono text-[10px]"
                style={{
                  border: "1px solid rgba(251,191,36,0.22)",
                  color: "var(--ff-accent)"
                }}
              >
                {g.t} · {g.d}
              </span>
            ))}
            <span
              className="rounded px-2.5 py-1.5 font-mono text-[10px]"
              style={{
                border: "1px solid rgba(74,222,128,0.3)",
                color: "var(--ff-live)"
              }}
            >
              SSE 실시간 반영 (역방향)
            </span>
          </div>
        </div>

        <div className="mt-4">
          <Hint>
            화살표는 요청 방향이고, SSE 만 <strong>반대로</strong> 흐릅니다 —
            서버에서 사용자 쪽으로. 02장에서 보신 그 선로입니다.
          </Hint>
        </div>
      </div>

      <div
        className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
        style={rise(on[IDX.meta], instant)}
      >
        <MetaCell value="1인" label="기획 · FE · BE · AI · 배포" />
        <MetaCell value="7" label="2주 스프린트" />
        <MetaCell value="20" label="사용자 스토리 · 138 SP" />
        <MetaCell value="183" label="커밋 (main)" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Shot
          src="/projects/festflow/architecture.webp"
          alt="Fest-A 기술 아키텍처 및 시스템 구조"
          caption="실제 아키텍처 다이어그램 (발표자료 18장)"
          w={1600}
          h={900}
        />
        <div className="flex flex-col gap-3">
          <Shot
            src="/projects/festflow/backlog.webp"
            alt="제품 백로그 — 사용자 스토리 20개, MoSCoW 우선순위, 138 SP"
            caption="백로그 20건 — PB-11(30분 예측)과 PB-13(챗봇)이 각 13 SP 로 가장 무거웠다"
            w={1600}
            h={900}
          />
          <Panel label="일정을 먼저 쪼갠 이유">
            <p className="text-[13px] leading-6 text-[var(--ff-muted)]">
              혼자 만들면 &ldquo;되는 것부터&rdquo; 하게 됩니다. 그래서 MoSCoW 로{" "}
              <strong className="text-[var(--ff-text)]">Must 를 먼저 박고</strong>{" "}
              2주 단위로 끊었습니다. 실시간(S4)과 AI(S5)를 뒤에 둔 건, 앞의 부스 ·
              예약 · QR 이 안 되면 AI 를 붙일 대상 자체가 없기 때문입니다.
            </p>
          </Panel>
        </div>
      </div>

      <div className="mt-6">
        <Shot
          src="/projects/festflow/gantt.webp"
          alt="간트차트 — 2주 스프린트 7개, 2026.03.04 ~ 06.10"
          caption="S1 기반 → S2 방문객 코어 → S3 예약/QR → S4 실시간 → S5 AI → S6 운영 → S7 통합·QA"
          w={1600}
          h={900}
        />
      </div>
    </Page>
  );
}
