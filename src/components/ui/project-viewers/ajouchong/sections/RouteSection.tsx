"use client";

import {useCallback, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  CodeLine,
  CodePanel,
  Kicker,
  SectionShell,
  TryHint,
  WordHeading,
  rise
} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

// 02 · 한 SPA로 모으다 — 클라이언트 라우팅이 무엇을 하는지 눈으로 보여준다.
// 다음 장(새로고침 404)의 복선이라, 여기서 "문서 요청이 한 번뿐"임을 꼭 남긴다.

const STEPS = [0, 150, 600, 1000];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

interface Route {
  path: string;
  label: string;
  rows: {tag: string; title: string; date: string}[];
}

const ROUTES: Route[] = [
  {
    path: "/notice",
    label: "공지",
    rows: [
      {tag: "총회", title: "2026 상반기 전체학생대표자회의", date: "06.24"},
      {tag: "선거", title: "보궐선거 후보 등록 안내", date: "06.20"},
      {tag: "행사", title: "여름 대동제 부스 신청 공고", date: "06.18"}
    ]
  },
  {
    path: "/qna",
    label: "Q&A",
    rows: [
      {tag: "답변완료", title: "학식 환불은 어디서 신청하나요?", date: "06.23"},
      {tag: "접수", title: "동아리방 배정 기준 문의", date: "06.22"},
      {tag: "답변완료", title: "셔틀버스 막차 시간 문의", date: "06.19"}
    ]
  },
  {
    path: "/welfare",
    label: "복지",
    rows: [
      {tag: "신규", title: "제휴 카페 ‘공강’ 10% 할인", date: "06.25"},
      {tag: "운영", title: "심야 열람실 연장 운영", date: "06.21"},
      {tag: "신규", title: "교내 우산 대여 서비스", date: "06.17"}
    ]
  },
  {
    path: "/archive",
    label: "자료",
    rows: [
      {tag: "PDF", title: "6월 정기회의 회의록", date: "06.24"},
      {tag: "PDF", title: "1분기 예산 집행 내역", date: "06.10"},
      {tag: "XLS", title: "제휴업체 전체 목록", date: "06.05"}
    ]
  }
];

const ORIGIN = "ajou-council.kr";

export function RouteSection() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {threshold: 0.2});
  const on = useTimeline(STEPS, inView, reducedMotion);
  const instant = reducedMotion;

  const [active, setActive] = useState(0);
  const [swaps, setSwaps] = useState(0);

  const go = useCallback(
    (i: number) => {
      if (i === active) return;
      setActive(i);
      setSwaps(s => s + 1);
      announce(
        `${ROUTES[i].label} 화면으로 이동했습니다. 주소는 ${ROUTES[i].path}`
      );
    },
    [active, announce]
  );

  const route = ROUTES[active];

  return (
    <SectionShell innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant}>
        02 · 한 주소로 모으다
      </Kicker>

      <div className="mt-4" style={rise(on[IDX.heading], instant)}>
        <WordHeading
          text="주소는 바뀌는데 새로 받지는 않는다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          다섯 채널을 한 사이트로 모으면서 React Router 로 화면을 나눴습니다.
          메뉴를 누르면 주소는 바뀌지만{" "}
          <strong>서버에 문서를 다시 요청하지는 않습니다</strong> — 브라우저
          안에서 라우터가 화면만 갈아 끼웁니다. 빠른 대신, 이 성질이 다음 장의
          사고를 만듭니다.
        </Body>
        <div className="mt-3">
          <TryHint>
            메뉴를 눌러 보세요 — 주소창과 오른쪽 요청 기록을 같이 보세요
          </TryHint>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]"
        style={rise(on[IDX.demo], instant, "0.7s")}
      >
        {/* ── 브라우저 ── */}
        <div className="aj-browser">
          {/* 주소창 */}
          <div className="flex items-center gap-2 border-b border-[var(--aj-frame)] bg-[rgba(255,255,255,0.03)] px-3 py-2">
            <div className="flex gap-[6px]" aria-hidden="true">
              <div className="h-2 w-2 rounded-full bg-[#ff5f56]" />
              <div className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
              <div className="h-2 w-2 rounded-full bg-[#27c93f]" />
            </div>
            <div className="ml-2 flex min-w-0 flex-1 items-center gap-1 rounded bg-[rgba(0,0,0,0.5)] px-2.5 py-1.5">
              <span className="shrink-0 font-mono text-[10px] text-[var(--aj-faint)]">
                https://
              </span>
              <span className="truncate font-mono text-[11px] text-[var(--aj-muted)]">
                {ORIGIN}
              </span>
              <span
                className="truncate font-mono text-[11px] font-bold"
                style={{color: "var(--aj-accent)"}}
              >
                {route.path}
              </span>
            </div>
          </div>

          {/* 사이트 내부 */}
          <div className="bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.07)] px-4 py-3">
              <span className="shrink-0 text-[12px] font-black text-[var(--aj-primary)]">
                총학생회
              </span>
              <nav className="flex gap-0.5 overflow-x-auto">
                {ROUTES.map((r, i) => {
                  const isOn = i === active;
                  return (
                    <button
                      key={r.path}
                      type="button"
                      onClick={() => go(i)}
                      aria-current={isOn ? "page" : undefined}
                      className="relative shrink-0 px-3 py-1.5 font-mono text-[11px] font-bold transition-colors duration-150"
                      style={{
                        color: isOn ? "var(--aj-primary)" : "var(--aj-muted)"
                      }}
                    >
                      {r.label}
                      {isOn ? (
                        <span
                          className="absolute inset-x-2 -bottom-[9px] h-[2px] rounded-full"
                          style={{background: "var(--aj-primary)"}}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex flex-col gap-1.5 p-4">
              {route.rows.map(row => (
                <div
                  key={row.title}
                  className="flex items-center gap-3 rounded border border-[rgba(255,255,255,0.07)] px-3 py-2.5"
                >
                  <span
                    className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-black"
                    style={{
                      background: "rgba(251,113,133,0.14)",
                      color: "var(--aj-accent)"
                    }}
                  >
                    {row.tag}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-[rgba(255,255,255,0.82)]">
                    {row.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--aj-faint)]">
                    {row.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 요청 기록 ── */}
        <div className="flex flex-col gap-4">
          <CodePanel filename="네트워크 — 문서 요청">
            <div className="p-3">
              <div className="flex items-center gap-2 rounded border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.08)] px-3 py-2">
                <span className="font-mono text-[10px] font-black text-[var(--aj-ok)]">
                  200
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[rgba(255,255,255,0.75)]">
                  GET /index.html
                </span>
                <span className="shrink-0 font-mono text-[10px] text-[var(--aj-faint)]">
                  최초 1회
                </span>
              </div>
              <p className="mt-3 font-mono text-[11px] leading-5 text-[var(--aj-muted)]">
                이후 메뉴 이동 <span className="text-white">{swaps}</span>회 —
                <span className="text-[var(--aj-accent)]">
                  {" "}
                  추가 문서 요청 0건
                </span>
              </p>
              <p className="mt-2 font-mono text-[10px] leading-5 text-[var(--aj-faint)]">
                서버는 /notice 라는 주소가 있는 줄도 모릅니다.
              </p>
            </div>
          </CodePanel>

          <CodePanel filename="App.js" borderColor="rgba(255,255,255,0.12)">
            <div className="py-2">
              <CodeLine n={1}>{"<Routes>"}</CodeLine>
              <CodeLine n={2}>
                {'  <Route path="/notice" element={<Notice />} />'}
              </CodeLine>
              <CodeLine n={3}>
                {'  <Route path="/qna" element={<Qna />} />'}
              </CodeLine>
              <CodeLine n={4} dim>
                {"  …"}
              </CodeLine>
              <CodeLine n={5}>{"</Routes>"}</CodeLine>
            </div>
          </CodePanel>
        </div>
      </div>
    </SectionShell>
  );
}
