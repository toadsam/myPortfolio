"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useFestFlow} from "../context";
import {
  Body,
  Card,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  rise,
  usePageIn
} from "../parts";
import {useOnScreen, usePageVisible, useTimeline} from "../../_kit/useTimeline";

// PAGE 03 — 왜 폴링이 아니라 SSE 인가 · 나란히 돌려보기
//
// 개발 실체: 기술 선택 근거 (폴링 · SSE · WebSocket 3안)
// 연출 장치: 같은 데이터를 **두 방식이 동시에 실행** — 관람객이 지연과 요청 수를 눈으로 본다
//
// ⚠️ 아래 카운터는 이 페이지가 돌리는 **시뮬레이션**이다. 서버 실측이 아니며,
//    그 사실을 화면에 명시한다(스펙 A-8: 지어낸 지표 금지).

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const POLL_INTERVAL = 5; // 초 — 흔한 5초 폴링

export function P03Polling() {
  const {reducedMotion, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const boxRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(boxRef, 0.25);
  const visible = usePageVisible();
  const alive = onScreen && visible && !instant;

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pollReq, setPollReq] = useState(0);
  const [sseReq, setSseReq] = useState(0);
  const [changes, setChanges] = useState(0);
  const [pollLagMs, setPollLagMs] = useState(0);
  const lastChangeAt = useRef(0);

  // 1초 틱. 화면 밖·탭 숨김이면 멈춘다.
  useEffect(() => {
    if (!running || !alive) return;
    const id = window.setInterval(() => {
      setElapsed(t => {
        const next = t + 1;
        // 폴링은 5초마다 무조건 한 번 물어본다
        if (next % POLL_INTERVAL === 0) setPollReq(r => r + 1);
        // 상태 변경은 평균 7초에 한 번쯤 일어난다고 두었다
        if (next % 7 === 0) {
          setChanges(c => c + 1);
          setSseReq(r => r + 1); // SSE 는 변경이 있을 때만 흐른다
          lastChangeAt.current = next;
        }
        // 폴링이 그 변경을 알아채기까지 걸린 시간
        const sincePoll = next % POLL_INTERVAL;
        if (lastChangeAt.current > 0) {
          setPollLagMs((POLL_INTERVAL - sincePoll) * 1000);
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, alive]);

  const toggle = useCallback(() => {
    setRunning(r => {
      announce(r ? "비교를 멈췄습니다." : "두 방식을 동시에 돌립니다.");
      return !r;
    });
  }, [announce]);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setPollReq(0);
    setSseReq(0);
    setChanges(0);
    setPollLagMs(0);
    lastChangeAt.current = 0;
  }, []);

  const wasted = Math.max(0, pollReq - changes);

  return (
    <Page index={3} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        03 · 기술 선택
      </Kicker>

      <div className="mt-4">
        <Heading
          text="세 가지 중에 하나를 골라야 했습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          「실시간」이라고 무조건 WebSocket 은 아닙니다. Fest-A 가 보내야 하는 건{" "}
          <strong>서버 → 클라이언트 한 방향</strong>뿐입니다. 부스 상태, 공지,
          혼잡도 — 방문객이 서버로 되쏘는 건 없습니다. 그래서{" "}
          <strong style={{color: "var(--ff-accent)"}}>SSE</strong> 를 골랐습니다.
          아래에서 폴링과 나란히 돌려 보세요.
        </Body>
      </div>

      <div
        ref={boxRef}
        className="mt-9 rounded-md p-5"
        style={{
          border: "1px solid var(--ff-border)",
          background: "var(--ff-panel)",
          ...rise(on[IDX.demo], instant)
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
            SIDE BY SIDE · 경과 {elapsed}초
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggle}
              className="cursor-pointer rounded px-3.5 py-2 font-mono text-[11px] font-bold transition-colors duration-200"
              style={{
                border: "1px solid rgba(251,191,36,0.45)",
                background: "rgba(251,191,36,0.14)",
                color: "var(--ff-accent)"
              }}
            >
              {running ? "■ 정지" : "▶ 동시에 돌리기"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer rounded px-3 py-2 font-mono text-[11px] transition-colors duration-200"
              style={{
                border: "1px solid var(--ff-border)",
                color: "var(--ff-muted)"
              }}
            >
              초기화
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 폴링 */}
          <div
            className="rounded-md p-4"
            style={{
              border: "1px solid rgba(248,113,113,0.32)",
              background: "rgba(248,113,113,0.05)"
            }}
          >
            <div className="font-mono text-[11px] font-bold text-[var(--ff-down)]">
              폴링 · {POLL_INTERVAL}초마다 물어보기
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="font-mono text-[22px] font-black tabular-nums text-[var(--ff-down)]">
                  {pollReq}
                </div>
                <div className="font-mono text-[10px] text-[var(--ff-muted)]">
                  보낸 요청
                </div>
              </div>
              <div>
                <div className="font-mono text-[22px] font-black tabular-nums text-[var(--ff-down)]">
                  {wasted}
                </div>
                <div className="font-mono text-[10px] text-[var(--ff-muted)]">
                  헛걸음 (변경 없음)
                </div>
              </div>
            </div>
            <p className="mt-3 font-mono text-[10px] leading-4 text-[var(--ff-muted)]">
              최악의 경우 <strong>{POLL_INTERVAL}초</strong> 늦게 압니다
              {running && pollLagMs > 0
                ? ` · 지금 다음 확인까지 ${(pollLagMs / 1000).toFixed(0)}초`
                : ""}
            </p>
          </div>

          {/* SSE */}
          <div
            className="rounded-md p-4"
            style={{
              border: "1px solid rgba(74,222,128,0.32)",
              background: "rgba(74,222,128,0.05)"
            }}
          >
            <div className="font-mono text-[11px] font-bold text-[var(--ff-live)]">
              SSE · 바뀔 때만 밀어주기
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="font-mono text-[22px] font-black tabular-nums text-[var(--ff-live)]">
                  {sseReq}
                </div>
                <div className="font-mono text-[10px] text-[var(--ff-muted)]">
                  흘려보낸 이벤트
                </div>
              </div>
              <div>
                <div className="font-mono text-[22px] font-black tabular-nums text-[var(--ff-live)]">
                  0
                </div>
                <div className="font-mono text-[10px] text-[var(--ff-muted)]">
                  헛걸음
                </div>
              </div>
            </div>
            <p className="mt-3 font-mono text-[10px] leading-4 text-[var(--ff-muted)]">
              연결 <strong>하나</strong>를 열어두고, 바뀐 순간 즉시 받습니다
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Hint>
            실제 상태 변경 {changes}건에 폴링은 {pollReq}번 물어봤습니다.{" "}
            <strong>이 카운터는 이 페이지가 돌리는 시뮬레이션</strong>이며 서버
            실측이 아닙니다 — 비율의 성격만 보여주는 용도입니다.
          </Hint>
        </div>
      </div>

      {/* 3안 비교 */}
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card label="폴링" accent="var(--ff-down)">
          <p className="text-[13px] leading-6">
            구현이 제일 쉽지만 <strong>안 바뀌어도 계속 물어봅니다.</strong>{" "}
            방문객이 많아질수록 서버가 손해를 봅니다.
          </p>
        </Card>
        <Card label="WebSocket" accent="var(--ff-stale)">
          <p className="text-[13px] leading-6">
            양방향이라 강력하지만, 이 서비스에{" "}
            <strong>클라이언트가 되쏠 게 없습니다.</strong> 연결 관리 비용만
            늘어납니다.
          </p>
        </Card>
        <Card label="SSE — 선택" accent="var(--ff-live)">
          <p className="text-[13px] leading-6">
            단방향에 딱 맞고, <strong>브라우저가 재연결까지 알아서</strong>{" "}
            합니다. HTTP 그대로라 프록시·배포 환경도 덜 까다롭습니다.
          </p>
        </Card>
      </div>

      <div className="mt-4">
        <Panel label="한 줄 정리">
          <p className="text-[13px] leading-6 text-[var(--ff-muted)]">
            &ldquo;실시간&rdquo;이라는 단어가 아니라{" "}
            <strong className="text-[var(--ff-text)]">
              데이터가 어느 방향으로 흐르는지
            </strong>
            를 보고 골랐습니다.
          </p>
        </Panel>
      </div>
    </Page>
  );
}
