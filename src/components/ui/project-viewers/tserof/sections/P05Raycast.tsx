"use client";

import {useCallback, useEffect, useRef, useState} from "react";
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
  StatCard,
  Switch2,
  Toggle,
  rise,
  usePageIn
} from "../parts";
import {
  useOnScreen,
  usePageVisible,
  useRafLoop,
  useTimeline
} from "../useTimeline";

// PAGE 05 — 트러블슈팅 02 · 매 프레임 배열을 하나씩 버리고 있었다
//
// PDF 원문: "프레임마다 RaycastAll 을 사용하며 충돌하는 오브젝트 정보를 담은 배열 생성 및 사용"
//        → "미리 배열을 생성하여 전달받는 형태의 RaycastNonAlloc 사용"
//        → "Layer 마스크를 이용해 필요한 Layer 와만 충돌 감지 구현"

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, symptom: 2, demo: 3};

const TARGETS = [
  {x: 26, label: "장식 바위", layer: "Environment", receiver: false},
  {x: 42, label: "발판", layer: "Ground", receiver: false},
  {x: 58, label: "얼음 조각", layer: "Environment", receiver: false},
  {x: 74, label: "수신부", layer: "ReceiverSensor", receiver: true}
];

export function P05Raycast() {
  const {reducedMotion, announce} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const stageRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(stageRef, 0.15);
  const pageVisible = usePageVisible();

  const [mode, setMode] = useState<0 | 1>(0); // 0 = RaycastAll, 1 = NonAlloc
  const [layerMask, setLayerMask] = useState(false);
  const [frames, setFrames] = useState(0);
  const [garbage, setGarbage] = useState<number[]>([]);

  const frameRef = useRef(0);
  const acc = useRef(0);
  const gcId = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const step = useCallback((deltaMs: number) => {
    frameRef.current += 1;
    acc.current += deltaMs;
    if (acc.current < 170) return;
    acc.current = 0;
    setFrames(frameRef.current);
    if (modeRef.current === 0) {
      const id = gcId.current++;
      setGarbage(prev => [...prev.slice(-5), id]);
    }
  }, []);

  useRafLoop(step, onScreen && pageVisible && !instant);

  useEffect(() => {
    if (instant) setFrames(3600);
  }, [instant]);

  const nonAlloc = mode === 1;
  const checked = layerMask ? 1 : TARGETS.length;
  const visible = TARGETS.filter(t => (layerMask ? t.receiver : true));
  const lastHit = visible[visible.length - 1];

  const changeMode = useCallback(
    (v: 0 | 1) => {
      setMode(v);
      if (v === 1) {
        setGarbage([]);
        announce("RaycastNonAlloc 으로 바꿨습니다. 배열을 계속 재사용합니다.");
      } else {
        announce(
          "RaycastAll 로 되돌렸습니다. 프레임마다 배열이 새로 생깁니다."
        );
      }
    },
    [announce]
  );

  const toggleMask = useCallback(() => {
    setLayerMask(prev => {
      announce(
        !prev
          ? "LayerMask 를 걸었습니다. 수신부 레이어만 검사합니다."
          : "LayerMask 를 뗐습니다. 길 위의 모든 콜라이더를 검사합니다."
      );
      return !prev;
    });
  }, [announce]);

  return (
    <Page index={5} innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant} color="var(--ts-bad)">
        05 · 트러블슈팅 02
      </Kicker>

      <div className="mt-4">
        <Heading
          text="매 프레임 배열을 하나씩 버리고 있었다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6" style={rise(on[IDX.symptom], instant)}>
        <Card label="증상" accent="var(--ts-bad)">
          <p className="text-[15px] leading-8">
            레이저 기믹이 있는 구간에서만 프레임이 유독 불안정했다. 레이저
            자체는 선 하나를 그리는 게 전부인데도 그랬다.
          </p>
        </Card>
        <div className="mt-4">
          <Body>
            원인은 그리는 쪽이 아니라 <strong>재는 쪽</strong>이었습니다.{" "}
            <code className="font-mono text-[13px] text-[var(--ts-accent)]">
              Physics.RaycastAll
            </code>{" "}
            은 호출할 때마다 결과 배열을 새로 만들어 돌려주는데, 그게{" "}
            <code className="font-mono text-[13px]">FixedUpdate</code> 안에
            있었습니다.
          </Body>
        </div>
        <div className="mt-3">
          <Hint>두 스위치는 서로 다른 낭비를 잡습니다 — 하나씩 켜 보세요</Hint>
        </div>
      </div>

      <div className="mt-8" style={rise(on[IDX.demo], instant)}>
        <Panel
          label="재현 · 레이저가 앞을 재는 중"
          right={
            <Switch2
              options={["RaycastAll", "NonAlloc"]}
              value={mode}
              onChange={changeMode}
              label="레이캐스트 방식"
            />
          }
        >
          <div ref={stageRef} className="ts-stage w-full" style={{height: 186}}>
            <div
              className="absolute left-[8%] top-1/2 h-7 w-4 -translate-y-1/2 rounded-sm"
              style={{background: "var(--ts-primary)"}}
              aria-hidden="true"
            />
            <div
              className="ts-laser"
              style={{
                left: "10%",
                top: "50%",
                width: `${(lastHit?.x ?? 80) - 10}%`
              }}
              aria-hidden="true"
            />
            {TARGETS.map(t => {
              const ignored = layerMask && !t.receiver;
              return (
                <div
                  key={t.label}
                  className="absolute top-1/2 -translate-y-1/2 text-center"
                  style={{left: `${t.x}%`}}
                >
                  <div
                    className="mx-auto h-11 w-6 rounded-sm transition-opacity duration-300"
                    style={{
                      background: t.receiver
                        ? "var(--ts-accent)"
                        : "rgba(255,255,255,0.25)",
                      opacity: ignored ? 0.2 : 1
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="mt-1.5 whitespace-nowrap font-mono text-[10px] transition-opacity duration-300"
                    style={{
                      color: t.receiver
                        ? "var(--ts-accent)"
                        : "var(--ts-faint)",
                      opacity: ignored ? 0.35 : 1
                    }}
                  >
                    {t.label}
                  </div>
                  <div
                    className="font-mono text-[10px] transition-opacity duration-300"
                    style={{
                      color: "var(--ts-faint)",
                      opacity: ignored ? 0.3 : 0.8
                    }}
                  >
                    {t.layer}
                  </div>
                </div>
              );
            })}
            <div
              className="pointer-events-none absolute bottom-3 left-[10%] flex gap-1.5"
              aria-hidden="true"
            >
              {garbage.map(id => (
                <span
                  key={id}
                  className="ts-garbage rounded border px-1.5 py-0.5 font-mono text-[10px]"
                  style={{
                    borderColor: "rgba(248,113,113,0.5)",
                    color: "var(--ts-bad)"
                  }}
                >
                  RaycastHit[]
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Toggle
              on={layerMask}
              onToggle={toggleMask}
              title="LayerMask"
              note={
                layerMask
                  ? "수신부 레이어만 검사"
                  : "길 위 모든 콜라이더를 검사"
              }
            />
            <div className="grid grid-cols-3 gap-2">
              <StatCard
                n={`${nonAlloc ? 0 : 1}`}
                l="프레임당 할당"
                accent={nonAlloc ? "var(--ts-primary)" : "var(--ts-bad)"}
              />
              <StatCard
                n={`${checked}`}
                l="검사 대상"
                accent={layerMask ? "var(--ts-primary)" : "var(--ts-warn)"}
              />
              <StatCard
                n={frames.toLocaleString("ko-KR")}
                l="돈 프레임"
                accent="var(--ts-accent)"
              />
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CodePanel
          filename="LaserShooter.cs"
          badge={{text: "기존", color: "var(--ts-bad)"}}
          borderColor="rgba(248,113,113,0.28)"
        >
          <div className="py-2">
            <CodeLine n={1}>{"private void ShootLaser()"}</CodeLine>
            <CodeLine n={2}>{"{"}</CodeLine>
            <CodeLine n={3}>
              {"  Ray ray = new Ray(transform.position + transform.right,"}
            </CodeLine>
            <CodeLine n={4}>{"                    transform.right);"}</CodeLine>
            <CodeLine n={5} bad>
              {"  RaycastHit[] hits = Physics.RaycastAll(ray, maxDistance);"}
            </CodeLine>
            <CodeLine n={6}>{"  if (hits.Length >= 1)"}</CodeLine>
            <CodeLine n={7}>
              {"    _currentLaserReceiver = hits[hits.Length - 1]"}
            </CodeLine>
            <CodeLine n={8}>
              {"      .transform.GetComponentInParent<LaserReceiver>();"}
            </CodeLine>
            <CodeLine n={9}>{"}"}</CodeLine>
          </div>
        </CodePanel>

        <CodePanel
          filename="LaserShooter.cs"
          badge={{text: "변경", color: "var(--ts-primary)"}}
          borderColor={nonAlloc ? "rgba(52,211,153,0.4)" : "var(--ts-border)"}
          footer="배열은 한 번만 만들고, 필요한 레이어만 본다"
        >
          <div className="py-2">
            <CodeLine n={1} highlight={nonAlloc}>
              {"RaycastHit[] hits = new RaycastHit[1];   // Preallocation"}
            </CodeLine>
            <CodeLine n={2}>{""}</CodeLine>
            <CodeLine n={3}>{"private void ShootLaser()"}</CodeLine>
            <CodeLine n={4}>{"{"}</CodeLine>
            <CodeLine n={5}>
              {"  Ray ray = new Ray(transform.position + transform.right,"}
            </CodeLine>
            <CodeLine n={6}>{"                    transform.right);"}</CodeLine>
            <CodeLine n={7} highlight={nonAlloc}>
              {"  if (Physics.RaycastNonAlloc(ray, hits, maxDistance,"}
            </CodeLine>
            <CodeLine n={8} highlight={layerMask}>
              {'    LayerMask.GetMask("ReceiverSensor")) >= 1)'}
            </CodeLine>
            <CodeLine n={9}>{"    _currentLaserReceiver = hits[0]"}</CodeLine>
            <CodeLine n={10}>
              {"      .transform.GetComponentInParent<LaserReceiver>();"}
            </CodeLine>
            <CodeLine n={11}>{"}"}</CodeLine>
          </div>
        </CodePanel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          label={nonAlloc && layerMask ? "개선 결과" : "왜 둘 다인가"}
          accent={
            nonAlloc && layerMask ? "var(--ts-primary)" : "var(--ts-warn)"
          }
        >
          {nonAlloc && layerMask ? (
            <ul className="space-y-1.5 text-[14px] leading-7">
              <li>충돌 최소화 및 성능 향상 달성</li>
              <li>가비지 생성 최소화로 CPU 부담 감소</li>
              <li>메모리 할당 최소화 및 효율적인 충돌 체크 수행</li>
            </ul>
          ) : (
            <p className="text-[14px] leading-7">
              둘은 다른 문제입니다. <strong>NonAlloc</strong> 은 결과를 담을
              그릇을 매번 새로 만드는 낭비를, <strong>LayerMask</strong> 는
              애초에 볼 필요 없는 것까지 검사하는 낭비를 잡습니다. 하나만 켜면
              절반만 고쳐집니다.
            </p>
          )}
        </Card>

        <Panel label="남은 한계">
          <ul className="space-y-2 text-[13px] leading-6 text-[var(--ts-muted)]">
            <li>
              <span style={{color: "var(--ts-warn)"}}>·</span> 배열 크기를{" "}
              <code className="font-mono">1</code> 로 고정했습니다. 수신부가
              여러 개 겹치는 상황은 애초에 없다고{" "}
              <strong className="text-[var(--ts-text)]">가정</strong>한 것이고,
              그 가정이 깨지면 뒤쪽이 잘립니다.
            </li>
            <li>
              <span style={{color: "var(--ts-warn)"}}>·</span> 레이어 이름을
              문자열로 매번 조회합니다. 캐싱할 수 있었는데 하지 않았습니다.
            </li>
          </ul>
        </Panel>
      </div>

      <Caveat>
        표적 구성은 레이저 기믹을 설명하기 위한 재현이며 실제 스테이지의
        콜라이더 구성과는 다릅니다. 프레임 수는 이 페이지가 실제로 돈
        횟수입니다.
      </Caveat>
    </Page>
  );
}
