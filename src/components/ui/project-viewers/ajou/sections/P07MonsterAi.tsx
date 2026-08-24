"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  Cm,
  CodeLine,
  CodePanel,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  Shot,
  rise,
  usePageIn
} from "../parts";
import {useOnScreen, usePageVisible, useTimeline} from "../../_kit/useTimeline";

// PAGE 07 — 몬스터는 거리로 생각한다 · NavMesh AI
//
// 개발 실체: PDF 32쪽 「Core Dev #3 — Enemy AI」 원문
//            상태 기반 AI(탐지 → 추적 → 공격), detectRange/attackRange 기반 상태 분기,
//            거리 계산 → 상태 판단 흐름, 조건 분기로 새 상태 추가 용이
// 연출 장치: **관람객이 플레이어를 직접 끌고 다닌다.** 거리가 바뀌면 몬스터 상태가
//            그 자리에서 바뀌고, 오른쪽 코드에서 지금 타는 분기에 불이 들어온다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const ATTACK_RANGE = 18; // % — 데모용 표시 단위
const DETECT_RANGE = 38;

type State = "Attack" | "Chase" | "Patrol";

export function P07MonsterAi() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const arenaRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(arenaRef, 0.2);
  const visible = usePageVisible();

  // 플레이어 위치(%). 몬스터는 가운데 고정이 아니라 순찰한다.
  const [px, setPx] = useState(78);
  const [py, setPy] = useState(30);
  const [mx, setMx] = useState(30);
  const [my, setMy] = useState(55);
  const [dragging, setDragging] = useState(false);

  const dist = Math.hypot(px - mx, py - my);
  const state: State =
    dist <= ATTACK_RANGE ? "Attack" : dist <= DETECT_RANGE ? "Chase" : "Patrol";

  const lastState = useRef<State>(state);
  useEffect(() => {
    if (lastState.current === state) return;
    lastState.current = state;
    announce(
      state === "Attack"
        ? "공격 범위 안입니다. AttackPlayer()"
        : state === "Chase"
        ? "탐지 범위 안입니다. ChasePlayer()"
        : "범위 밖입니다. Patrol()"
    );
  }, [state, announce]);

  // 몬스터의 Update() — 화면 밖·탭 숨김이면 멈춘다(스펙 A-8).
  useEffect(() => {
    if (!onScreen || !visible || instant) return;
    const id = window.setInterval(() => {
      setMx(cx => {
        setMy(cy => {
          if (dist <= ATTACK_RANGE) return cy; // 공격 중엔 멈춘다
          if (dist <= DETECT_RANGE) return cy + (py - cy) * 0.06; // 추적
          return cy + Math.sin(Date.now() / 900) * 0.6; // 순찰
        });
        if (dist <= ATTACK_RANGE) return cx;
        if (dist <= DETECT_RANGE) return cx + (px - cx) * 0.06;
        return cx + Math.cos(Date.now() / 900) * 0.6;
      });
    }, 60);
    return () => window.clearInterval(id);
  }, [onScreen, visible, instant, dist, px, py]);

  const move = useCallback((clientX: number, clientY: number) => {
    const el = arenaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPx(Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100)));
    setPy(Math.max(6, Math.min(94, ((clientY - r.top) / r.height) * 100)));
  }, []);

  const color =
    state === "Attack"
      ? "var(--aj-bad)"
      : state === "Chase"
      ? "var(--aj-warn)"
      : "var(--aj-ok)";

  return (
    <Page index={7} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        07 · 몬스터 AI
      </Kicker>

      <div className="mt-4">
        <Heading
          text="적은 거리 하나로 판단합니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          복잡한 판단 트리를 만들 수도 있었지만,{" "}
          <strong>플레이어와의 거리 하나</strong>로 순찰 · 추적 · 공격을 갈랐습니다.
          조건이 명확하면 플레이어도 예측할 수 있고, 나중에 상태를 하나 더 넣을
          때 분기 한 줄만 추가하면 됩니다. 아래 초록 사각형을 끌어 보세요.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: "1px solid var(--aj-border)",
            background: "var(--aj-panel)"
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-muted)]">
              MonsterAI.Update()
            </span>
            <span
              className="rounded px-2 py-0.5 font-mono text-[10px] font-black tabular-nums"
              style={{
                background: `color-mix(in srgb, ${color} 18%, transparent)`,
                color
              }}
            >
              {state} · distance {dist.toFixed(1)}
            </span>
          </div>

          {/* 아레나 */}
          <div
            ref={arenaRef}
            className="relative touch-none overflow-hidden rounded"
            style={{
              border: "1px solid rgba(163,230,53,0.22)",
              background: "#0e1406",
              aspectRatio: "16 / 10",
              cursor: dragging ? "grabbing" : "crosshair"
            }}
            onPointerDown={e => {
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              setDragging(true);
              move(e.clientX, e.clientY);
            }}
            onPointerMove={e => {
              if (!dragging) return;
              move(e.clientX, e.clientY);
            }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
          >
            <div className="aj-grid absolute inset-0" aria-hidden="true" />

            {/* detectRange */}
            <span
              className="aj-ring"
              style={{
                left: `${mx}%`,
                top: `${my}%`,
                width: `${DETECT_RANGE * 2}%`,
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                border: "1px dashed rgba(251,191,36,0.34)"
              }}
              aria-hidden="true"
            />
            {/* attackRange */}
            <span
              className="aj-ring"
              style={{
                left: `${mx}%`,
                top: `${my}%`,
                width: `${ATTACK_RANGE * 2}%`,
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                border: "1px solid rgba(248,113,113,0.45)",
                background: "rgba(248,113,113,0.06)"
              }}
              aria-hidden="true"
            />

            {/* 몬스터 */}
            <span
              className="absolute block h-6 w-6 rounded-sm"
              style={{
                left: `${mx}%`,
                top: `${my}%`,
                transform: "translate(-50%, -50%)",
                background: color,
                boxShadow: `0 0 12px color-mix(in srgb, ${color} 60%, transparent)`
              }}
              aria-hidden="true"
            />

            {/* 플레이어 */}
            <span
              className="absolute block h-7 w-7 rounded-sm"
              style={{
                left: `${px}%`,
                top: `${py}%`,
                transform: "translate(-50%, -50%)",
                background: "var(--aj-accent)",
                border: "2px solid rgba(255,255,255,0.55)"
              }}
              aria-hidden="true"
            />

            <span className="absolute bottom-2 left-2.5 font-mono text-[10px] text-[var(--aj-faint)]">
              밝은 사각형을 끌어서 움직여 보세요
            </span>
          </div>

          {/* 키보드 대안 — 포인터가 없는 사람도 조작할 수 있어야 한다 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-[var(--aj-faint)]">
              키보드로도 됩니다
            </span>
            {[
              {l: "← 멀리", dx: -8},
              {l: "→ 가까이", dx: 8}
            ].map(b => (
              <button
                key={b.l}
                type="button"
                onClick={() =>
                  setPx(v => Math.max(4, Math.min(96, v + b.dx * -1)))
                }
                className="cursor-pointer rounded px-3 py-1.5 font-mono text-[11px] transition-colors duration-200"
                style={{
                  border: "1px solid var(--aj-border)",
                  color: "var(--aj-muted)"
                }}
              >
                {b.l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <CodePanel
            filename="MonsterAI.cs"
            badge={{text: "실제 코드", color: "var(--aj-ok)"}}
            borderColor="var(--aj-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>
                  {"// desc: 플레이어와의 거리값을 기준으로 이동/추적/공격 판단"}
                </Cm>
              </CodeLine>
              <CodeLine n={2}>{"void Update()"}</CodeLine>
              <CodeLine n={3}>{"{"}</CodeLine>
              <CodeLine n={4} highlight>
                {"  float distance = Vector3.Distance("}
              </CodeLine>
              <CodeLine n={5} highlight>
                {"      transform.position, player.position);"}
              </CodeLine>
              <CodeLine n={6}>{""}</CodeLine>
              <CodeLine n={7} highlight={state === "Attack"}>
                {"  if (distance <= attackRange)"}
              </CodeLine>
              <CodeLine n={8} highlight={state === "Attack"}>
                {"  { AttackPlayer(); }"}
              </CodeLine>
              <CodeLine n={9} highlight={state === "Chase"}>
                {"  else if (distance <= detectRange)"}
              </CodeLine>
              <CodeLine n={10} highlight={state === "Chase"}>
                {"  { ChasePlayer(); }"}
              </CodeLine>
              <CodeLine n={11} highlight={state === "Patrol"}>
                {"  else"}
              </CodeLine>
              <CodeLine n={12} highlight={state === "Patrol"}>
                {"  { Patrol(); }"}
              </CodeLine>
              <CodeLine n={13}>{"}"}</CodeLine>
            </div>
          </CodePanel>

          <Panel label="확장 가능한 AI">
            <p className="text-[13px] leading-6 text-[var(--aj-muted)]">
              상태를 하나 더 넣고 싶으면 <strong>조건 분기 한 줄</strong>이면
              됩니다. 이동은 NavMesh 가 맡고, 이 코드는 &ldquo;무엇을 할지&rdquo;만
              정합니다.
            </p>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <Hint>
          붉은 원이 attackRange, 노란 점선이 detectRange 입니다. 노란 원 밖으로
          나가면 몬스터가 다시 순찰로 돌아갑니다.
        </Hint>
      </div>

      <div className="mt-8">
        <Shot
          src="/projects/ajou-adventure/code-monster.webp"
          alt="MonsterAI.cs 전체 코드"
          caption="거리 한 줄이 세 가지 행동을 가른다"
          w={1600}
          h={1052}
        />
      </div>
    </Page>
  );
}
