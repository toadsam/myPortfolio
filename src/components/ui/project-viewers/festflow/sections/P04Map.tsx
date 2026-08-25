"use client";

import {useCallback, useRef, useState} from "react";
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
  Shot,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 04 — 지도 위에 부스를 놓는다 · React Leaflet
//
// 개발 실체: 지도 좌표 기반 부스 배치 (저장소 README: React Leaflet, 클러스터링,
//            부스 검색/필터/즐겨찾기/혼잡도) + 발표자료 8장 「혼잡도 지도」 4단계
// 연출 장치: 관람객이 **마커를 직접 드래그** → 아래 코드의 좌표 숫자가 실시간으로 바뀐다
//
// 혼잡도 4단계 라벨은 발표자료 19·20장의 출력 등급 원문:
//   LOW / NORMAL / BUSY / VERY_BUSY

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

type Level = "LOW" | "NORMAL" | "BUSY" | "VERY_BUSY";

const LEVEL_META: Record<Level, {label: string; color: string}> = {
  LOW: {label: "여유", color: "var(--ff-live)"},
  NORMAL: {label: "보통", color: "var(--ff-ray)"},
  BUSY: {label: "혼잡", color: "var(--ff-stale)"},
  VERY_BUSY: {label: "매우 혼잡", color: "var(--ff-down)"}
};

type Marker = {id: string; name: string; x: number; y: number; level: Level};

// 좌표는 이 데모용 상대값(%)이다. 실제 서비스는 위경도를 쓴다.
const INITIAL: Marker[] = [
  {id: "b-01", name: "아주광장", x: 30, y: 34, level: "VERY_BUSY"},
  {id: "b-02", name: "잔디광장", x: 62, y: 28, level: "VERY_BUSY"},
  {id: "b-03", name: "체육관 앞", x: 46, y: 60, level: "BUSY"},
  {id: "b-04", name: "학생회관", x: 74, y: 62, level: "NORMAL"},
  {id: "b-05", name: "성호관 주변", x: 20, y: 72, level: "LOW"}
];

export function P04Map() {
  const {reducedMotion, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const mapRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<Marker[]>(INITIAL);
  const [dragId, setDragId] = useState<string | null>(null);
  const [selected, setSelected] = useState("b-01");

  const move = useCallback(
    (id: string, clientX: number, clientY: number) => {
      const el = mapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
      const y = Math.max(6, Math.min(94, ((clientY - r.top) / r.height) * 100));
      setMarkers(prev => prev.map(m => (m.id === id ? {...m, x, y} : m)));
    },
    []
  );

  const cycleLevel = useCallback(
    (id: string) => {
      const order: Level[] = ["LOW", "NORMAL", "BUSY", "VERY_BUSY"];
      setMarkers(prev =>
        prev.map(m =>
          m.id === id
            ? {...m, level: order[(order.indexOf(m.level) + 1) % order.length]}
            : m
        )
      );
      announce("혼잡도 등급을 바꿨습니다.");
    },
    [announce]
  );

  const active = markers.find(m => m.id === selected) ?? markers[0];

  return (
    <Page index={4} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        04 · 지도
      </Kicker>

      <div className="mt-4">
        <Heading
          text="지도는 그림이 아니라 데이터입니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          방문객이 제일 먼저 여는 화면이 지도입니다. 부스가 어디 있고 지금 얼마나
          붐비는지를 <strong>한 화면에서</strong> 봐야 다음 행동을 정할 수
          있습니다. 마커를 끌어 보세요 — 아래 좌표가 그대로 바뀝니다. 마커를
          누르면 혼잡도 등급이 한 칸씩 돕니다.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-3 rounded-md p-5"
          style={{
            border: "1px solid var(--ff-border)",
            background: "var(--ff-panel)"
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
              MAP · React Leaflet
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(LEVEL_META) as Level[]).map(l => (
                <span
                  key={l}
                  className="flex items-center gap-1 font-mono text-[10px]"
                  style={{color: LEVEL_META[l].color}}
                >
                  <span
                    className="block h-[6px] w-[6px] rounded-full"
                    style={{background: LEVEL_META[l].color}}
                    aria-hidden="true"
                  />
                  {LEVEL_META[l].label}
                </span>
              ))}
            </div>
          </div>

          <div
            ref={mapRef}
            className="ff-grid relative touch-none overflow-hidden rounded"
            style={{
              border: "1px solid rgba(251,191,36,0.2)",
              background: "#12100a",
              aspectRatio: "16 / 11",
              cursor: dragId ? "grabbing" : "default"
            }}
            onPointerMove={e => {
              if (!dragId) return;
              move(dragId, e.clientX, e.clientY);
            }}
            onPointerUp={() => setDragId(null)}
            onPointerCancel={() => setDragId(null)}
          >
            {markers.map(m => {
              const meta = LEVEL_META[m.level];
              const sel = m.id === selected;
              return (
                <button
                  key={m.id}
                  type="button"
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-grab flex-col items-center gap-1"
                  style={{left: `${m.x}%`, top: `${m.y}%`}}
                  onPointerDown={e => {
                    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                    setDragId(m.id);
                    setSelected(m.id);
                  }}
                  onClick={() => {
                    setSelected(m.id);
                    cycleLevel(m.id);
                  }}
                  aria-label={`${m.name} · ${meta.label} · 끌어서 이동, 눌러서 등급 변경`}
                >
                  <span
                    className="block h-[16px] w-[16px] rounded-full transition-colors duration-300"
                    style={{
                      background: meta.color,
                      boxShadow: sel
                        ? `0 0 0 4px color-mix(in srgb, ${meta.color} 28%, transparent)`
                        : "none"
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[10px]"
                    style={{
                      background: "rgba(20,15,4,0.86)",
                      color: sel ? meta.color : "var(--ff-muted)"
                    }}
                  >
                    {m.name}
                  </span>
                </button>
              );
            })}
          </div>

          <Hint>
            마커를 끌면 좌표가, 누르면 등급이 바뀝니다. 실제 서비스는 이 자리에{" "}
            <strong>Leaflet 타일 지도</strong>와 위경도가 들어가고, 마커가 많아지면
            클러스터로 묶입니다.
          </Hint>
        </div>

        <CodePanel
          filename="BoothMarkers.tsx"
          badge={{text: "지금 값", color: "var(--ff-live)"}}
          borderColor="var(--ff-code-border)"
        >
          <div className="py-2">
            <CodeLine n={1}>
              <Cm>{"// 선택한 부스 한 건 — 끌면 아래 숫자가 바로 바뀐다"}</Cm>
            </CodeLine>
            <CodeLine n={2}>{"{"}</CodeLine>
            <CodeLine n={3}>{`  id: "${active.id}",`}</CodeLine>
            <CodeLine n={4}>{`  name: "${active.name}",`}</CodeLine>
            <CodeLine n={5} highlight={dragId === active.id}>
              {`  position: [${active.y.toFixed(2)}, ${active.x.toFixed(2)}],`}
            </CodeLine>
            <CodeLine n={6}>{`  congestion: "${active.level}",`}</CodeLine>
            <CodeLine n={7}>{"}"}</CodeLine>
            <CodeLine n={8}>{""}</CodeLine>
            <CodeLine n={9}>
              <Cm>{"// 마커 렌더 — 등급이 곧 색이다"}</Cm>
            </CodeLine>
            <CodeLine n={10}>{"{booths.map(b => ("}</CodeLine>
            <CodeLine n={11}>
              {"  <Marker key={b.id} position={b.position}"}
            </CodeLine>
            <CodeLine n={12}>{"          icon={iconFor(b.congestion)}>"}</CodeLine>
            <CodeLine n={13}>{"    <Popup>{b.name}</Popup>"}</CodeLine>
            <CodeLine n={14}>{"  </Marker>"}</CodeLine>
            <CodeLine n={15}>{"))}"}</CodeLine>
          </div>
        </CodePanel>
      </div>

      <div className="mt-8">
        <Shot
          src="/projects/festflow/screens.webp"
          alt="Fest-A 실제 서비스 화면 — 메인 홈, 실시간 혼잡도, 부스 상세/예약, 스태프 페이지"
          caption="실제 화면 4종 — 두 번째가 이 장에서 만져 본 혼잡도 지도다"
          w={1600}
          h={900}
        />
      </div>
    </Page>
  );
}
