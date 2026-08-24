"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useTserof} from "../context";
import {
  Body,
  Card,
  Caveat,
  CodeLine,
  CodePanel,
  Cm,
  Heading,
  Hint,
  Kicker,
  Meter,
  Page,
  Panel,
  Switch2,
  rise,
  usePageIn
} from "../parts";
import {
  useOnScreen,
  usePageVisible,
  useRafLoop,
  useTimeline
} from "../useTimeline";

// PAGE 04 — 트러블슈팅 01 · 고드름은 계속 태어나고 죽었다
//
// PDF 원문: "스테이지 진행 중 오브젝트의 생성과 파괴가 지속적으로 발생하여 CPU 부담 증가"
//        → "오브젝트를 새로 생성하거나 파괴하는 대신, 기존 오브젝트 재활용"
//        → "Coroutine 에서 사용되는 WaitForSeconds 객체는 Caching 하여 재사용"
//
// 스펙의 트러블 페이지 골격(증상 → 재현 → 원인 → Before/After → 검증 → 한계)을 따르되,
// 「실패한 시도」 칸은 **비워 둔다** — 기록에 없는 것을 지어내지 않는다(스펙 A-8).

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, symptom: 2, demo: 3};

const COLUMNS = 5;
const STAGE_H = 250;
const GROUND_H = 26;
const TOP_Y = 14;
const FALL_SPEED = 300;
const REST_SEC = 1.1;

/** 비교용 고정 바이트 — 절대치가 아니라 「어느 쪽이 늘어나는가」를 보기 위한 값. */
const BYTES_OBJECT = 112;
const BYTES_WAIT = 24;

type Phase = "wait" | "fall" | "rest";
interface Icicle {
  phase: Phase;
  t: number;
  y: number;
}

const waitFor = () => 0.4 + Math.random() * 1.6;

export function P04Icicle() {
  const {reducedMotion, announce} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const stageRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(stageRef, 0.15);
  const pageVisible = usePageVisible();

  const [mode, setMode] = useState<0 | 1>(0); // 0 = 기존, 1 = 재사용
  const [stats, setStats] = useState({
    instantiate: 0,
    destroy: 0,
    bytes: 0,
    seconds: 0
  });

  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef<Icicle[]>(
    Array.from({length: COLUMNS}, () => ({
      phase: "wait" as Phase,
      t: waitFor(),
      y: TOP_Y
    }))
  );
  const counters = useRef({instantiate: 0, destroy: 0, bytes: 0, seconds: 0});
  const flushAt = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const groundY = STAGE_H - GROUND_H - 22;

  const step = useCallback(
    (deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000;
      const c = counters.current;
      const pooled = modeRef.current === 1;
      c.seconds += dt;

      for (let i = 0; i < state.current.length; i++) {
        const ic = state.current[i];

        if (ic.phase === "wait") {
          ic.t -= dt;
          if (ic.t <= 0) {
            ic.phase = "fall";
            ic.y = TOP_Y;
            if (!pooled) {
              c.instantiate += 1;
              c.bytes += BYTES_OBJECT + BYTES_WAIT;
            }
          }
        } else if (ic.phase === "fall") {
          ic.y += FALL_SPEED * dt;
          if (ic.y >= groundY) {
            ic.y = groundY;
            ic.phase = "rest";
            ic.t = REST_SEC;
            if (!pooled) c.bytes += BYTES_WAIT;
          }
        } else {
          ic.t -= dt;
          if (ic.t <= 0) {
            if (!pooled) c.destroy += 1;
            ic.phase = "wait";
            ic.t = waitFor();
            ic.y = TOP_Y;
          }
        }

        // 위치는 DOM 을 직접 만진다 — 이 장이 렉을 만들면 안 된다.
        const node = nodes.current[i];
        if (node) {
          node.style.opacity = ic.phase === "wait" ? "0" : "1";
          node.style.transform = `translate3d(0, ${ic.y}px, 0)`;
        }
      }

      if (c.seconds - flushAt.current > 0.125) {
        flushAt.current = c.seconds;
        setStats({
          instantiate: c.instantiate,
          destroy: c.destroy,
          bytes: c.bytes,
          seconds: c.seconds
        });
      }
    },
    [groundY]
  );

  useRafLoop(step, onScreen && pageVisible && !instant);

  useEffect(() => {
    if (!instant) return;
    setStats({
      instantiate: mode === 1 ? 0 : 148,
      destroy: mode === 1 ? 0 : 148,
      bytes: mode === 1 ? 0 : 148 * (BYTES_OBJECT + BYTES_WAIT * 2),
      seconds: 30
    });
  }, [instant, mode]);

  const reset = useCallback(() => {
    counters.current = {instantiate: 0, destroy: 0, bytes: 0, seconds: 0};
    flushAt.current = 0;
    setStats({instantiate: 0, destroy: 0, bytes: 0, seconds: 0});
  }, []);

  const changeMode = useCallback(
    (v: 0 | 1) => {
      setMode(v);
      reset();
      announce(
        v === 1
          ? "재사용으로 바꿨습니다. 생성과 파괴가 더 이상 늘지 않습니다."
          : "매번 만들고 파괴하는 방식으로 되돌렸습니다."
      );
    },
    [reset, announce]
  );

  const pooled = mode === 1;
  const perMin =
    stats.seconds > 1 ? (stats.instantiate / stats.seconds) * 60 : 0;

  return (
    <Page index={4} innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant} color="var(--ts-bad)">
        04 · 트러블슈팅 01
      </Kicker>

      <div className="mt-4">
        <Heading
          text="고드름은 계속 태어나고 죽었다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      {/* A. 증상 */}
      <div className="mt-6" style={rise(on[IDX.symptom], instant)}>
        <Card label="증상" accent="var(--ts-bad)">
          <p className="text-[15px] leading-8">
            스테이지를 오래 돌릴수록 프레임이 고르지 않았다. 특정 장면에서
            갑자기 걸리는 게 아니라, <strong>계속 조금씩 끊겼다.</strong>
            <br />
            눈에 보이는 건 &ldquo;고드름이 떨어졌다가 다시 생긴다&rdquo;
            뿐이었다.
          </p>
        </Card>
      </div>

      {/* B. 재현 */}
      <div className="mt-9" style={rise(on[IDX.demo], instant)}>
        <Panel
          label="재현 · 고드름이 떨어지는 구간"
          right={
            <Switch2
              options={["기존", "재사용"]}
              value={mode}
              onChange={changeMode}
              label="오브젝트 처리 방식"
            />
          }
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <div
                ref={stageRef}
                className="ts-stage w-full"
                style={{height: STAGE_H}}
              >
                <div
                  className="absolute inset-x-0 top-0"
                  style={{
                    height: 10,
                    background:
                      "linear-gradient(180deg, rgba(125,211,252,0.22), transparent)"
                  }}
                  aria-hidden="true"
                />
                {Array.from({length: COLUMNS}, (_, i) => (
                  <div
                    key={i}
                    ref={el => {
                      nodes.current[i] = el;
                    }}
                    className="ts-icicle"
                    style={{
                      left: `${10 + i * 19}%`,
                      top: 0,
                      opacity: 0,
                      willChange: "transform"
                    }}
                    aria-hidden="true"
                  />
                ))}
                <div className="ts-ground" style={{height: GROUND_H}} />
                <div className="absolute bottom-2 left-3 font-mono text-[10px] text-[var(--ts-faint)]">
                  Stage 2 — 얼음 구간
                </div>
                <div
                  className="absolute right-3 top-3 rounded px-2 py-1 font-mono text-[10px] font-black"
                  style={{
                    background: pooled
                      ? "rgba(52,211,153,0.16)"
                      : "rgba(248,113,113,0.16)",
                    color: pooled ? "var(--ts-primary)" : "var(--ts-bad)"
                  }}
                >
                  {pooled ? "재사용" : "Instantiate / Destroy"}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-md px-4 py-2.5 font-mono text-[12px] font-bold"
                  style={{
                    border: "1px solid var(--ts-border)",
                    color: "var(--ts-muted)"
                  }}
                >
                  카운터 초기화
                </button>
                <Hint>
                  측정 {stats.seconds.toFixed(1)}초 · 실제로 돌고 있습니다
                </Hint>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Meter
                label="Instantiate 누적"
                value={stats.instantiate}
                max={Math.max(60, stats.instantiate)}
                unit="회"
                color={pooled ? "var(--ts-primary)" : "var(--ts-bad)"}
                hint={
                  pooled
                    ? "재사용이라 더 이상 늘지 않는다"
                    : "고드름 하나가 떨어질 때마다 한 번"
                }
              />
              <Meter
                label="Destroy 누적"
                value={stats.destroy}
                max={Math.max(60, stats.destroy)}
                unit="회"
                color={pooled ? "var(--ts-primary)" : "var(--ts-bad)"}
              />
              <Meter
                label="가비지 누적(추정)"
                value={stats.bytes / 1024}
                max={Math.max(4, stats.bytes / 1024)}
                unit=" KB"
                color={pooled ? "var(--ts-primary)" : "var(--ts-warn)"}
                hint={
                  pooled
                    ? "WaitForSeconds 를 한 번만 만들어 재사용한다"
                    : "오브젝트 + 코루틴의 WaitForSeconds 가 매번 새로 할당된다"
                }
              />
              <div className="grid grid-cols-2 gap-3 border-t border-[rgba(52,211,153,0.12)] pt-4">
                <div>
                  <div className="font-mono text-[10px] text-[var(--ts-muted)]">
                    분당 생성
                  </div>
                  <div
                    className="mt-1 font-mono text-[20px] font-black tabular-nums"
                    style={{
                      color: pooled ? "var(--ts-primary)" : "var(--ts-bad)"
                    }}
                  >
                    {Math.round(perMin)}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-[var(--ts-muted)]">
                    살아 있는 고드름
                  </div>
                  <div className="mt-1 font-mono text-[20px] font-black tabular-nums text-[var(--ts-text)]">
                    {COLUMNS}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* C. 원인 */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card label="원인" accent="var(--ts-warn)">
          <p className="text-[14px] leading-7">
            화면에 보이는 동작은 &ldquo;떨어졌다가 다시 생긴다&rdquo; 하나지만,
            엔진 입장에서는 매번 <strong>새 오브젝트를 만들고 버리는</strong>{" "}
            중이었습니다. 버려진 것들은 GC 가 치우고, 그 순간 프레임이 걸립니다.
            거기에 코루틴 안의{" "}
            <code className="font-mono text-[13px]">WaitForSeconds</code> 도
            루프를 돌 때마다 새로 만들어지고 있었습니다.
          </p>
        </Card>

        <Panel label="기록에 남지 않은 것">
          <p className="text-[13px] leading-6 text-[var(--ts-muted)]">
            이 항목은 포트폴리오 기록에{" "}
            <span className="text-[var(--ts-text)]">
              문제 → 해결 → 개선 결과
            </span>
            만 남아 있습니다. 중간에 시도했다가 버린 방법이 있었는지는 기록이
            없어{" "}
            <strong className="text-[var(--ts-text)]">적지 않습니다.</strong>
          </p>
        </Panel>
      </div>

      {/* D. Before / After */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CodePanel
          filename="IcicleMove.cs"
          badge={{text: "기존", color: "var(--ts-bad)"}}
          borderColor="rgba(248,113,113,0.28)"
          footer="떨어지면 즉시 파괴하고 정해진 위치에 다시 생성"
        >
          <div className="py-2">
            <CodeLine n={1}>{"public IEnumerator MoveStart()"}</CodeLine>
            <CodeLine n={2}>{"{"}</CodeLine>
            <CodeLine n={3}>{"  while (true)"}</CodeLine>
            <CodeLine n={4}>{"  {"}</CodeLine>
            <CodeLine n={5}>
              {"    int fallingSecond = Random.Range(1, 8);"}
            </CodeLine>
            <CodeLine n={6} bad>
              {"    yield return new WaitForSeconds(fallingSecond);"}
            </CodeLine>
            <CodeLine n={7} bad>
              {"    GameObject falling = Instantiate(gameObject, …);  "}
              <Cm>{"// 생성"}</Cm>
            </CodeLine>
            <CodeLine n={8}>{"    _rigidbody.isKinematic = false;"}</CodeLine>
            <CodeLine n={9} bad>
              {"    yield return new WaitForSeconds(2.5f);"}
            </CodeLine>
            <CodeLine n={10}>{"    _rigidbody.isKinematic = true;"}</CodeLine>
            <CodeLine n={11} bad>
              {"    Destroy(falling);                                 "}
              <Cm>{"// 파괴"}</Cm>
            </CodeLine>
            <CodeLine n={12}>{"  }"}</CodeLine>
            <CodeLine n={13}>{"}"}</CodeLine>
          </div>
        </CodePanel>

        <CodePanel
          filename="IcicleMove.cs"
          badge={{text: "변경", color: "var(--ts-primary)"}}
          borderColor={pooled ? "rgba(52,211,153,0.4)" : "var(--ts-border)"}
          footer="바닥에 닿고 일정 시간이 지나면 정해진 위치로 되돌린다"
        >
          <div className="py-2">
            <CodeLine n={1}>{"public IEnumerator MoveStart()"}</CodeLine>
            <CodeLine n={2}>{"{"}</CodeLine>
            <CodeLine n={3} highlight={pooled}>
              {"  var deleyTime = new WaitForSeconds(2.5f);   "}
              <Cm>{"// 캐싱"}</Cm>
            </CodeLine>
            <CodeLine n={4}>{"  while (true)"}</CodeLine>
            <CodeLine n={5}>{"  {"}</CodeLine>
            <CodeLine n={6}>
              {"    int fallingsecond = Random.Range(1, 8);"}
            </CodeLine>
            <CodeLine n={7}>
              {"    yield return new WaitForSeconds(fallingsecond);"}
            </CodeLine>
            <CodeLine n={8}>{"    _rigidbody.isKinematic = false;"}</CodeLine>
            <CodeLine n={9} highlight={pooled}>
              {"    yield return deleyTime;                    "}
              <Cm>{"// 재사용"}</Cm>
            </CodeLine>
            <CodeLine n={10}>{"    _rigidbody.isKinematic = true;"}</CodeLine>
            <CodeLine n={11}>{"    _collider.isTrigger = true;"}</CodeLine>
            <CodeLine n={12} highlight={pooled}>
              {"    transform.SetPositionAndRotation(_startPos, …);"}
            </CodeLine>
            <CodeLine n={13}>{"  }"}</CodeLine>
            <CodeLine n={14}>{"}"}</CodeLine>
          </div>
        </CodePanel>
      </div>

      {/* E. 검증 + 남은 한계 */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card label="개선 결과" accent="var(--ts-primary)">
          <ul className="space-y-1.5 text-[14px] leading-7">
            <li>메모리와 성능 효율 향상</li>
            <li>가비지 생성 최소화로 CPU 부담 감소</li>
            <li>코드의 가독성과 유지보수성 향상</li>
          </ul>
          <p className="mt-3 text-[13px] leading-6 text-[var(--ts-muted)]">
            화면에서 보이는 동작은 <strong>완전히 같습니다.</strong> 바뀐 건
            엔진이 매 초 하던 일의 양뿐입니다.
          </p>
        </Card>

        <Panel label="남은 한계">
          <ul className="space-y-2 text-[13px] leading-6 text-[var(--ts-muted)]">
            <li>
              <span style={{color: "var(--ts-warn)"}}>·</span> 본격적인{" "}
              <strong className="text-[var(--ts-text)]">오브젝트 풀</strong>이
              아니라{" "}
              <strong className="text-[var(--ts-text)]">제자리 되돌리기</strong>
              입니다. 고드름처럼 개수가 고정된 것에만 통합니다.
            </li>
            <li>
              <span style={{color: "var(--ts-warn)"}}>·</span> 개선 폭을{" "}
              <strong className="text-[var(--ts-text)]">
                수치로 남기지 않았습니다.
              </strong>{" "}
              Profiler 로 확인만 하고 넘어갔습니다.
            </li>
            <li>
              <span style={{color: "var(--ts-warn)"}}>·</span> 같은 고드름이{" "}
              <strong className="text-[var(--ts-text)]">한 번 더</strong> 문제를
              일으킵니다 — 이번엔 성능이 아니라 판정으로, 09 유저테스트에서.
            </li>
          </ul>
        </Panel>
      </div>

      <Caveat>
        위 카운터는 이 페이지에서 실제로 도는 시뮬레이션의 값이고, 「가비지
        누적」은 할당 횟수에 고정 바이트를 곱한 <strong>비교용 추정치</strong>
        입니다. 실제 게임의 GC Alloc 은 Unity Profiler 로 확인했으며 그 수치는
        기록에 남기지 않았습니다.
      </Caveat>
    </Page>
  );
}
