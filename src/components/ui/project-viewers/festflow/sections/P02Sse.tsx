"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useFestFlow} from "../context";
import {
  Body,
  Cm,
  CodeLine,
  CodePanel,
  Heading,
  Hint,
  Kicker,
  Page,
  rise,
  usePageIn
} from "../parts";
import {useOnScreen, usePageVisible, useTimeline} from "../../_kit/useTimeline";

// PAGE 02 — SSE 는 어떻게 동작하나 · 패킷이 도착한다
//
// 개발 실체: SSE 구독/수신 구현 (발표자료 18장 「SSE 실시간 반영」,
//            26장 「부스 상태 변경 → 현장 상태 즉시 반영」, PB-09 실시간 갱신 Must 8SP)
// 연출 장치: 관람객이 부스 상태를 직접 바꾸면 **서버 → 패킷 → 지도** 경로가
//            눈앞에서 흐르고, 도착 순간 코드가 하이라이트된다.
//            그리고 **아무것도 안 해도** 다른 부스가 알아서 바뀐다 — 그게 SSE 의 정의다.
//
// ⚠️ 자동 루프는 뷰포트 밖·탭 숨김이면 멈춘다(스펙 A-8).

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

type State = "OPEN" | "BUSY" | "SOLDOUT";

const STATE_META: Record<State, {label: string; color: string}> = {
  OPEN: {label: "운영중", color: "var(--ff-live)"},
  BUSY: {label: "혼잡", color: "var(--ff-stale)"},
  SOLDOUT: {label: "품절", color: "var(--ff-down)"}
};

const BOOTHS = [
  "화학공학과 비커주점",
  "산업공학과 이음주점",
  "소프트웨어학과 주점",
  "디지털미디어학과 네온주점"
] as const;

type Packet = {id: number; booth: string; state: State; mine: boolean};

export function P02Sse() {
  const {reducedMotion, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const boxRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(boxRef, 0.25);
  const visible = usePageVisible();
  const alive = onScreen && visible && !instant;

  const [states, setStates] = useState<State[]>([
    "OPEN",
    "BUSY",
    "OPEN",
    "OPEN"
  ]);
  const [packet, setPacket] = useState<Packet | null>(null);
  const [received, setReceived] = useState(0);
  const [arrived, setArrived] = useState<number | null>(null);
  const seq = useRef(0);

  const emit = useCallback(
    (index: number, next: State, mine: boolean) => {
      seq.current += 1;
      const id = seq.current;
      setPacket({id, booth: BOOTHS[index], state: next, mine});

      // 패킷이 선로를 타고 도착하는 시간
      window.setTimeout(
        () => {
          setStates(prev => {
            const copy = [...prev];
            copy[index] = next;
            return copy;
          });
          setReceived(n => n + 1);
          setArrived(index);
          setPacket(p => (p && p.id === id ? null : p));
          window.setTimeout(() => setArrived(a => (a === index ? null : a)), 620);
        },
        instant ? 0 : 1050
      );
    },
    [instant]
  );

  // 관람객이 직접 바꾼다
  const cycle = useCallback(
    (index: number) => {
      const order: State[] = ["OPEN", "BUSY", "SOLDOUT"];
      const next = order[(order.indexOf(states[index]) + 1) % order.length];
      emit(index, next, true);
      announce(
        `${BOOTHS[index]} 상태를 ${STATE_META[next].label}으로 바꿨습니다. 패킷이 나갑니다.`
      );
    },
    [states, emit, announce]
  );

  // 아무것도 안 해도 계속 바뀐다 — 화면 밖이면 멈춘다
  useEffect(() => {
    if (!alive) return;
    const id = window.setInterval(() => {
      setPacket(p => {
        if (p) return p; // 이미 날아가는 패킷이 있으면 건너뛴다
        const i = Math.floor(Math.random() * BOOTHS.length);
        const order: State[] = ["OPEN", "BUSY", "SOLDOUT"];
        const next = order[Math.floor(Math.random() * order.length)];
        emit(i, next, false);
        return null;
      });
    }, 3600);
    return () => window.clearInterval(id);
  }, [alive, emit]);

  return (
    <Page index={2} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        02 · SSE
      </Kicker>

      <div className="mt-4">
        <Heading
          text="새로고침을 누를 사람이 없습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          축제장에서 부스는 계속 열리고 닫히고 품절됩니다. 방문객이 그걸 알려면{" "}
          <strong>서버가 먼저 말을 걸어야</strong> 합니다. 그래서 상태 변경은
          클라이언트가 묻는 게 아니라{" "}
          <strong style={{color: "var(--ff-accent)"}}>서버가 밀어 보냅니다.</strong>{" "}
          아래 부스를 눌러 직접 바꿔 보세요 — 그리고 가만히 두셔도 다른 부스가
          알아서 바뀝니다.
        </Body>
      </div>

      <div
        ref={boxRef}
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: "1px solid var(--ff-border)",
            background: "var(--ff-panel)"
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
              GET /api/stream · text/event-stream
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`block h-[6px] w-[6px] rounded-full ${
                  alive ? "ff-pulse" : ""
                }`}
                style={{
                  background: alive ? "var(--ff-live)" : "var(--ff-offline)"
                }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-[10px] tabular-nums"
                style={{color: alive ? "var(--ff-live)" : "var(--ff-offline)"}}
              >
                {alive ? `수신 ${received}건` : "일시정지"}
              </span>
            </span>
          </div>

          {/* 선로 — 서버에서 지도까지 */}
          <div
            className="relative flex h-[42px] items-center overflow-hidden rounded px-3"
            style={{
              border: "1px solid rgba(251,191,36,0.16)",
              background: "rgba(0,0,0,0.28)"
            }}
          >
            <span className="shrink-0 font-mono text-[10px] text-[var(--ff-muted)]">
              서버
            </span>
            <span
              className="mx-3 h-px flex-1"
              style={{background: "rgba(251,191,36,0.2)"}}
              aria-hidden="true"
            />
            <span className="shrink-0 font-mono text-[10px] text-[var(--ff-muted)]">
              지도
            </span>
            {packet ? (
              <span
                className={`absolute top-1/2 block -translate-y-1/2 rounded px-2 py-1 font-mono text-[10px] font-bold ${
                  instant ? "" : "ff-packet"
                }`}
                style={{
                  background: packet.mine
                    ? "rgba(251,191,36,0.9)"
                    : "rgba(74,222,128,0.9)",
                  color: "#140f04"
                }}
                aria-hidden="true"
              >
                {packet.state}
              </span>
            ) : null}
          </div>

          {/* 부스 카드 */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {BOOTHS.map((b, i) => {
              const m = STATE_META[states[i]];
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => cycle(i)}
                  className={`cursor-pointer rounded-md p-3.5 text-left transition-[border-color,background-color] duration-300 ${
                    arrived === i && !instant ? "ff-arrive" : ""
                  }`}
                  style={{
                    border: `1px solid ${m.color}`,
                    background: `color-mix(in srgb, ${m.color} 10%, transparent)`
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[12px] font-bold text-[var(--ff-text)]">
                      {b}
                    </span>
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-black"
                      style={{
                        background: `color-mix(in srgb, ${m.color} 22%, transparent)`,
                        color: m.color
                      }}
                    >
                      {m.label}
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-[10px] text-[var(--ff-faint)]">
                    눌러서 상태 바꾸기
                  </p>
                </button>
              );
            })}
          </div>

          <Hint>
            노란 패킷은 방금 <strong>직접</strong> 바꾸신 것, 초록 패킷은{" "}
            <strong>다른 사람</strong>이 바꾼 것입니다. 화면 밖으로 나가면 루프가
            멈춥니다.
          </Hint>
        </div>

        {/* 양쪽 코드 */}
        <div className="flex flex-col gap-3">
          <CodePanel
            filename="StreamService.java (Spring · SseEmitter)"
            badge={{text: "서버", color: "var(--ff-primary)"}}
            borderColor="var(--ff-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>{"// 구독자마다 emitter 를 하나씩 들고 있는다"}</Cm>
              </CodeLine>
              <CodeLine n={2}>{"public SseEmitter subscribe() {"}</CodeLine>
              <CodeLine n={3}>
                {"  SseEmitter emitter = new SseEmitter(TIMEOUT);"}
              </CodeLine>
              <CodeLine n={4}>{"  emitters.add(emitter);"}</CodeLine>
              <CodeLine n={5}>
                {"  emitter.onCompletion(() -> emitters.remove(emitter));"}
              </CodeLine>
              <CodeLine n={6}>{"  return emitter;"}</CodeLine>
              <CodeLine n={7}>{"}"}</CodeLine>
              <CodeLine n={8}>{""}</CodeLine>
              <CodeLine n={9}>
                <Cm>{"// 부스 상태가 바뀌면 구독자 전원에게 민다"}</Cm>
              </CodeLine>
              <CodeLine n={10} highlight={packet !== null}>
                {"public void broadcast(String event, Object payload) {"}
              </CodeLine>
              <CodeLine n={11} highlight={packet !== null}>
                {"  emitters.forEach(e -> e.send("}
              </CodeLine>
              <CodeLine n={12} highlight={packet !== null}>
                {"      SseEmitter.event().name(event).data(payload)));"}
              </CodeLine>
              <CodeLine n={13}>{"}"}</CodeLine>
            </div>
          </CodePanel>

          <CodePanel
            filename="useFestivalStream.ts (React · EventSource)"
            badge={{text: "클라이언트", color: "var(--ff-ray)"}}
            borderColor="var(--ff-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>{"// 브라우저가 알아서 재연결까지 해준다"}</Cm>
              </CodeLine>
              <CodeLine n={2}>
                {"const es = new EventSource(`${API}/api/stream`);"}
              </CodeLine>
              <CodeLine n={3}>{""}</CodeLine>
              <CodeLine n={4} highlight={arrived !== null}>
                {"es.addEventListener(\"booth-status\", (e) => {"}
              </CodeLine>
              <CodeLine n={5} highlight={arrived !== null}>
                {"  const next = JSON.parse(e.data);"}
              </CodeLine>
              <CodeLine n={6} highlight={arrived !== null}>
                {"  setBooths(prev => merge(prev, next));"}
              </CodeLine>
              <CodeLine n={7}>{"});"}</CodeLine>
              <CodeLine n={8}>{""}</CodeLine>
              <CodeLine n={9}>{"return () => es.close();"}</CodeLine>
            </div>
          </CodePanel>
        </div>
      </div>

      <div className="mt-4">
        <Hint>
          위 코드는 이 페이지가 재현한 흐름을 옮긴 것입니다. 실제 구현은 저장소의{" "}
          <strong>StreamService</strong>(SSE 발행)와 프론트의 SSE 훅에 있습니다.
        </Hint>
      </div>
    </Page>
  );
}
