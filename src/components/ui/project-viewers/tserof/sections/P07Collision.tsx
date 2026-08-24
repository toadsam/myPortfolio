"use client";

import {useCallback, useRef, useState} from "react";
import {useTserof} from "../context";
import {
  Body,
  Card,
  Caveat,
  CodeLine,
  CodePanel,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  Switch2,
  Toggle,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../useTimeline";

// PAGE 07 — 트러블슈팅 03 · 이미 끝난 것들이 계속 돌고 있었다
//
// PDF 원문: "플랫포머 게임의 특성상 잦은 충돌 연산으로 성능 저하 발생"
//        → 해결 1: "여러 Collider 를 구, 캡슐 등 단순한 형태로 간소화"
//        → 해결 2: "조건문을 활용하여 특정 조건을 만족할 때만 충돌 확인으로 변경"
//
// 앞의 두 장이 「덜 만들기」였다면 이 장은 「덜 보기」다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, symptom: 2, demo: 3};

const ACTORS = [
  {name: "회전 발판", cost: 3, cleared: true, does: "Rotate() · ShootLaser()"},
  {name: "레이저 기둥 A", cost: 4, cleared: true, does: "ShootLaser()"},
  {name: "레이저 기둥 B", cost: 4, cleared: true, does: "ShootLaser()"},
  {name: "고드름 3기", cost: 3, cleared: true, does: "충돌 판정"},
  {
    name: "플레이어",
    cost: 5,
    cleared: false,
    does: "CheckIsGrounded() · CheckIsFalling()"
  },
  {name: "이동 발판", cost: 3, cleared: false, does: "충돌 판정"}
];

const SHAPES = [
  {label: "원본 지형 그대로", sub: "Mesh Collider · 면 다수", cost: 100},
  {label: "구 · 캡슐로 간소화", sub: "Sphere / Capsule", cost: 22}
];

export function P07Collision() {
  const {reducedMotion, announce} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [guarded, setGuarded] = useState(false);
  const [shape, setShape] = useState<0 | 1>(0);

  const running = ACTORS.filter(a => !(guarded && a.cleared));
  const cost = running.reduce((s, a) => s + a.cost, 0);
  const maxCost = ACTORS.reduce((s, a) => s + a.cost, 0);

  const toggleGuard = useCallback(() => {
    setGuarded(prev => {
      announce(
        !prev
          ? "클리어된 오브젝트가 FixedUpdate 초반에 빠져나갑니다."
          : "조건문을 뺐습니다. 모든 오브젝트가 매 프레임 계산됩니다."
      );
      return !prev;
    });
  }, [announce]);

  return (
    <Page index={7} innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant} color="var(--ts-bad)">
        07 · 트러블슈팅 03
      </Kicker>

      <div className="mt-4">
        <Heading
          text="이미 끝난 것들이 계속 돌고 있었다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6" style={rise(on[IDX.symptom], instant)}>
        <Card label="증상" accent="var(--ts-bad)">
          <p className="text-[15px] leading-8">
            플랫포머는 원래 충돌 연산이 많은 장르라 처음엔 &ldquo;이 정도는 어쩔
            수 없다&rdquo;고 생각했다. 그런데 프로파일러로 들여다보니{" "}
            <strong>이미 클리어한 구간의 기믹들</strong>이 여전히 매 프레임
            충돌을 확인하고 있었다.
          </p>
        </Card>
        <div className="mt-3">
          <Hint>두 가지를 따로 켜 보세요 — 잡는 낭비가 서로 다릅니다</Hint>
        </div>
      </div>

      <div
        className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div className="flex flex-col gap-4">
          <Panel
            label="FixedUpdate 에서 실제로 도는 것"
            right={
              <span
                className="font-mono text-[12px] font-bold tabular-nums"
                style={{
                  color: guarded ? "var(--ts-primary)" : "var(--ts-bad)"
                }}
              >
                {running.length} / {ACTORS.length}
              </span>
            }
          >
            <div className="flex flex-col gap-1.5">
              {ACTORS.map(a => {
                const off = guarded && a.cleared;
                return (
                  <div
                    key={a.name}
                    className="flex items-center gap-3 rounded px-3 py-2 transition-colors duration-300"
                    style={{
                      background: off
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(52,211,153,0.07)",
                      opacity: off ? 0.4 : 1
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        background: off
                          ? "var(--ts-faint)"
                          : "var(--ts-primary)"
                      }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] text-[var(--ts-text)]">
                        {a.name}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-[var(--ts-muted)]">
                        {a.does}
                      </span>
                    </span>
                    <span
                      className="shrink-0 font-mono text-[10px]"
                      style={{
                        color: off ? "var(--ts-faint)" : "var(--ts-accent)"
                      }}
                    >
                      {off ? "early return" : "실행"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-[rgba(52,211,153,0.12)] pt-4">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--ts-muted)]">
                  프레임당 상대 연산량
                </span>
                <span
                  className="font-mono text-[12px] font-bold tabular-nums"
                  style={{
                    color: guarded ? "var(--ts-primary)" : "var(--ts-bad)"
                  }}
                >
                  {Math.round((cost / maxCost) * 100)}%
                </span>
              </div>
              <div className="ts-meter">
                <span
                  style={{
                    width: `${(cost / maxCost) * 100}%`,
                    backgroundColor: guarded
                      ? "var(--ts-primary)"
                      : "var(--ts-bad)"
                  }}
                />
              </div>
            </div>
          </Panel>

          <Toggle
            on={guarded}
            onToggle={toggleGuard}
            title="조건문으로 먼저 빠져나가기"
            note={
              guarded
                ? "isSuccess · ignorePlayerStatus 로 early return"
                : "조건 없이 전부 매 프레임 계산"
            }
          />

          <Panel
            label="콜라이더 모양 — 큐브 미로·원형 미로가 특히 무거웠다"
            right={
              <Switch2
                options={["원본", "간소화"]}
                value={shape}
                onChange={setShape}
                label="콜라이더 모양"
              />
            }
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[var(--ts-text)]">
                  {SHAPES[shape].label}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-[var(--ts-muted)]">
                  {SHAPES[shape].sub}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="font-mono text-[22px] font-black tabular-nums"
                  style={{
                    color: shape === 1 ? "var(--ts-primary)" : "var(--ts-warn)"
                  }}
                >
                  {SHAPES[shape].cost}
                </div>
                <div className="font-mono text-[10px] text-[var(--ts-faint)]">
                  상대 비용
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <CodePanel
            filename="LaserPillar.cs"
            badge={
              guarded
                ? {text: "적용", color: "var(--ts-primary)"}
                : {text: "미적용", color: "var(--ts-faint)"}
            }
            borderColor={guarded ? "rgba(52,211,153,0.4)" : "var(--ts-border)"}
            footer="Success 를 통해 충돌 체크 여부 확인"
          >
            <div className="py-2">
              <CodeLine n={1}>{"private void GetSuccess()"}</CodeLine>
              <CodeLine n={2}>{"{"}</CodeLine>
              <CodeLine n={3}>{"  isSuccess = _startTime >= 0 &&"}</CodeLine>
              <CodeLine n={4}>
                {"    Time.time - _startTime > successTime;"}
              </CodeLine>
              <CodeLine n={5}>{"}"}</CodeLine>
              <CodeLine n={6}>{""}</CodeLine>
              <CodeLine n={7}>{"private void FixedUpdate()"}</CodeLine>
              <CodeLine n={8}>{"{"}</CodeLine>
              <CodeLine n={9} highlight={guarded}>
                {"  if (isSuccess) { return; }"}
              </CodeLine>
              <CodeLine n={10}>{"  if (isRotate) { Rotate(); }"}</CodeLine>
              <CodeLine n={11}>{"  ShootLaser();"}</CodeLine>
              <CodeLine n={12}>{"}"}</CodeLine>
            </div>
          </CodePanel>

          <CodePanel
            filename="ForceReceiver.cs"
            badge={
              guarded
                ? {text: "적용", color: "var(--ts-primary)"}
                : {text: "미적용", color: "var(--ts-faint)"}
            }
            borderColor={guarded ? "rgba(52,211,153,0.4)" : "var(--ts-border)"}
            footer="ignorePlayerStatus 를 통해 충돌 체크 여부 확인"
          >
            <div className="py-2">
              <CodeLine n={1}>{"private void Update()"}</CodeLine>
              <CodeLine n={2}>{"{"}</CodeLine>
              <CodeLine n={3}>
                {"  if (Stage2Manager.instance.isStage2Clear)"}
              </CodeLine>
              <CodeLine n={4}>{"  {"}</CodeLine>
              <CodeLine n={5} highlight={guarded}>
                {"    _forceReceiver.ignorePlayerStatus = true;"}
              </CodeLine>
              <CodeLine n={6}>{"    _rigidbody.useGravity = false;"}</CodeLine>
              <CodeLine n={7}>{"    ClearMove();"}</CodeLine>
              <CodeLine n={8}>{"  }"}</CodeLine>
              <CodeLine n={9}>{"}"}</CodeLine>
              <CodeLine n={10}>{""}</CodeLine>
              <CodeLine n={11}>{"private void FixedUpdate()"}</CodeLine>
              <CodeLine n={12}>{"{"}</CodeLine>
              <CodeLine n={13} highlight={guarded}>
                {"  if (ignorePlayerStatus) { return; }"}
              </CodeLine>
              <CodeLine n={14}>{"  CheckIsGrounded();"}</CodeLine>
              <CodeLine n={15}>{"  CheckIsFalling();"}</CodeLine>
              <CodeLine n={16}>{"}"}</CodeLine>
            </div>
          </CodePanel>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          label={guarded && shape === 1 ? "정리" : "처음에 놓친 것"}
          accent={
            guarded && shape === 1 ? "var(--ts-primary)" : "var(--ts-warn)"
          }
        >
          <p className="text-[14px] leading-7">
            {guarded && shape === 1 ? (
              <>
                두 방향이 다릅니다. 콜라이더 단순화는{" "}
                <strong>한 번의 검사를 싸게</strong> 만들고, 조건문은{" "}
                <strong>검사 자체를 없앱니다.</strong>{" "}
                <span className="text-[var(--ts-accent)]">
                  가장 빠른 코드는 실행되지 않는 코드였습니다.
                </span>
              </>
            ) : (
              <>
                처음엔 &ldquo;충돌을 더 빠르게 하는 방법&rdquo;만 찾았습니다.
                크게 줄어든 건 <strong>안 해도 되는 검사를 찾아 끈</strong>{" "}
                뒤였습니다. 위 두 스위치를 다 켜 보세요.
              </>
            )}
          </p>
        </Card>

        <Panel label="남은 한계">
          <ul className="space-y-2 text-[13px] leading-6 text-[var(--ts-muted)]">
            <li>
              <span style={{color: "var(--ts-warn)"}}>·</span> 조건이{" "}
              <code className="font-mono">Stage2Manager.instance</code> 를 직접
              보고 있습니다. 스테이지가 늘어나면 같은 코드를 또 고쳐야 합니다.
            </li>
            <li>
              <span style={{color: "var(--ts-warn)"}}>·</span> 콜라이더를
              단순화한 만큼{" "}
              <strong className="text-[var(--ts-text)]">
                판정이 실제 모양과 어긋나는 자리
              </strong>
              가 생깁니다. 그 대가는 레벨 배치로 피해 갔습니다.
            </li>
          </ul>
        </Panel>
      </div>

      <Caveat>
        「상대 연산량」과 「상대 비용」은 어느 쪽이 무거운지 비교하기 위한 도식
        수치입니다. 실제 병목 판단은 Unity Profiler 로 했고 그 수치는 기록에
        남기지 않았습니다.
      </Caveat>
    </Page>
  );
}
