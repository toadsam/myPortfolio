"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useSueo} from "../context";
import {Kicker, rise} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

const STEPS = [0, 150, 600];
const IDX = {label: 0, heading: 1, body: 2};

type Owner = "mine" | "mate" | "team";

const NODES: {id: number; label: string; owner: Owner; tag?: string}[] = [
  {id: 1, label: "React 화면", owner: "team", tag: "공동"},
  {id: 2, label: "Spring Boot API", owner: "mine"},
  {id: 3, label: "형태소 분석 · 어순 재배열", owner: "mine"},
  {id: 4, label: "수어 사전 (Firebase)", owner: "mine"},
  {id: 5, label: "시퀀스 조립 · 전환 생성", owner: "mine"},
  {id: 6, label: "3D 아바타 렌더링", owner: "mate", tag: "팀원"},
  {id: 7, label: "화면 표시", owner: "team", tag: "공동"}
];

const EDGES: [number, number][] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 2],
  [2, 4],
  [1, 6],
  [6, 7]
];

const FLOWS = {
  word: {
    path: [1, 2, 4, 2, 1, 6, 7],
    notes: [
      "단어 id 요청",
      "요청 수신",
      "키프레임 조회",
      "응답 조립",
      "데이터 수신",
      "아바타에 적용",
      "재생"
    ]
  },
  sentence: {
    path: [1, 2, 3, 4, 5, 2, 1, 6, 7],
    notes: [
      "문장 전송",
      "요청 수신",
      "어순 재배열",
      "단어별 키프레임 조회",
      "전환 프레임 삽입",
      "타임라인 응답",
      "데이터 수신",
      "아바타에 적용",
      "재생"
    ]
  }
} as const;

const SCOPE: {title: string; items: string[]}[] = [
  {
    title: "API 설계",
    items: [
      "Spring Boot 기반 백엔드 서버 구현",
      "단어 조회와 문장 변환 엔드포인트 설계",
      "응답에 전환 프레임을 포함하도록 구조 변경"
    ]
  },
  {
    title: "데이터",
    items: [
      "수어 데이터 입력 처리와 스키마 설계",
      "단어별 인정 표현 목록 구축",
      "Firebase 컬렉션 구조 정리"
    ]
  },
  {
    title: "학습 로직",
    items: [
      "퀴즈 정답 판정과 피드백 로직 구현",
      "오답 기반 재출제 스케줄링",
      "학습 상태 저장 구조 설계"
    ]
  },
  {
    title: "문장 변환",
    items: [
      "형태소 분석 연동",
      "수어 어순 재배열 규칙 구현",
      "사전에 없는 단어의 지문자 폴백"
    ]
  }
];

const ownerColor = (id: number) =>
  id === 6
    ? "#c4b5fd"
    : id === 1 || id === 7
    ? "rgba(255,255,255,0.8)"
    : "#7eb8ff";

export function ArchitectureSection() {
  const {reducedMotion: rm, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.1});
  const t = useTimeline(STEPS, inView, rm);

  const [type, setType] = useState<"word" | "sentence">("word");
  const [running, setRunning] = useState(false);
  const [lit, setLit] = useState<number[]>([]);
  const [litEdges, setLitEdges] = useState<string[]>([]);
  const [chip, setChip] = useState<{
    x: number;
    y: number;
    text: string;
    color: string;
  } | null>(null);
  const [showMateCaption, setShowMateCaption] = useState(false);

  const boundsRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<
    {key: string; x1: number; y1: number; x2: number; y2: number}[]
  >([]);

  const center = useCallback((id: number) => {
    const el = nodeRefs.current[id];
    const box = boundsRef.current;
    if (!el || !box) return {x: 0, y: 0};
    const r = el.getBoundingClientRect();
    const c = box.getBoundingClientRect();
    return {x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2};
  }, []);

  const drawRails = useCallback(() => {
    setLines(
      EDGES.map(([a, b]) => {
        const p1 = center(a);
        const p2 = center(b);
        return {key: `${a}-${b}`, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y};
      })
    );
  }, [center]);

  useEffect(() => {
    drawRails();
    window.addEventListener("resize", drawRails);
    return () => window.removeEventListener("resize", drawRails);
  }, [drawRails]);

  useEffect(() => {
    if (inView) drawRails();
  }, [inView, drawRails]);

  function reset() {
    setLit([]);
    setLitEdges([]);
    setChip(null);
    setShowMateCaption(false);
    if (dotRef.current) dotRef.current.style.opacity = "0";
  }

  async function send() {
    if (running) return;
    setRunning(true);
    reset();

    const {path, notes} = FLOWS[type];

    if (rm) {
      setLit([...path]);
      setLitEdges(["1-6", "6-7"]);
      setShowMateCaption(true);
      setRunning(false);
      return;
    }

    const sleep = (ms: number) => new Promise(r => window.setTimeout(r, ms));
    const dot = dotRef.current;
    if (dot) {
      dot.style.opacity = "1";
      const p0 = center(path[0]);
      dot.style.transition = "none";
      dot.style.transform = `translate(${p0.x}px, ${p0.y}px)`;
      // 위치를 먼저 확정한 뒤 전환을 켠다.
      void dot.offsetWidth;
      dot.style.transition = "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
    }

    for (let i = 0; i < path.length; i++) {
      const id = path[i];
      const p = center(id);
      if (dot) dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
      if (i > 0) await sleep(350);

      if (id === 6) {
        setShowMateCaption(true);
        setLitEdges(e => [...e, "1-6"]);
        if (dot) {
          dot.style.background = "#c4b5fd";
          dot.style.boxShadow = "0 0 12px #c4b5fd";
        }
      }
      if (id === 7) setLitEdges(e => [...e, "6-7"]);

      setLit(l => (l.includes(id) ? l : [...l, id]));
      setChip({x: p.x, y: p.y - 30, text: notes[i], color: ownerColor(id)});
      await sleep(280);
      setChip(null);
    }

    await sleep(300);
    if (dot) {
      dot.style.opacity = "0";
      dot.style.background = "var(--sd-primary)";
      dot.style.boxShadow = "0 0 10px var(--sd-primary)";
    }
    setRunning(false);
    announce(
      type === "word"
        ? "단어 조회 경로를 재생했습니다."
        : "문장 변환 경로를 재생했습니다."
    );
  }

  const on = (i: number) => t[i] || rm;

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto w-full max-w-[1040px] px-6 py-[100px] md:px-8"
    >
      <div className="mb-12">
        <Kicker
          on={on(IDX.label)}
          instant={rm}
          color="var(--sd-primary)"
          className="mb-4 opacity-80"
        >
          06 · 전체 구조
        </Kicker>
        <h1
          className="mb-[20px] break-keep text-[28px] font-black leading-tight"
          style={rise(on(IDX.heading), rm)}
        >
          제가 만든 건 아바타가 아니라, 아바타가 읽는 데이터였습니다
        </h1>
        <p
          className="max-w-[740px] break-keep text-[16px] leading-[36px] text-[var(--sd-muted)]"
          style={rise(on(IDX.body), rm)}
        >
          팀 프로젝트였고 저는 백엔드를 맡았습니다. 화면에서 제일 눈에 띄는 3D
          아바타는 팀원이 만들었습니다. 아래에서 요청을 하나 보내보면, 어느
          구간이 누구 몫이었는지 보입니다.
        </p>
      </div>

      <div
        className="relative mb-[52px] h-[640px] w-full rounded-md border border-[rgba(126,184,255,0.2)] bg-[var(--sd-panel)] p-[26px] md:h-[470px]"
        aria-label="요청 처리 경로 시각화 다이어그램"
      >
        <p className="sr-only">
          시스템 구조와 담당 범위를 보여줍니다. 단어 조회 경로는 React 화면 →
          Spring Boot API → 수어 사전 → API → 화면 → 3D 아바타 → 표시 순서이고,
          문장 변환 경로는 그 사이에 형태소 분석·어순 재배열과 시퀀스 조립
          단계가 들어갑니다. 3D 아바타 렌더링은 팀원이 만든 부분입니다.
        </p>

        {/* 컨트롤 */}
        <div className="absolute left-1/2 top-[26px] z-30 flex -translate-x-1/2 items-center gap-4 rounded-md border border-[rgba(126,184,255,0.1)] bg-[var(--sd-panel)] p-1 shadow-lg">
          <div
            className="flex rounded-md border border-[rgba(126,184,255,0.2)] bg-[var(--sd-bg)] p-1"
            role="radiogroup"
            aria-label="요청 유형 선택"
          >
            {(["word", "sentence"] as const).map(k => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={type === k}
                onClick={() => {
                  setType(k);
                  reset();
                }}
                className="rounded px-3 py-1 font-mono text-[11px] transition-colors"
                style={
                  type === k
                    ? {
                        background: "rgba(126,184,255,0.15)",
                        color: "var(--sd-primary)",
                        fontWeight: 700
                      }
                    : {color: "var(--sd-muted)"}
                }
              >
                {k === "word" ? "단어 조회" : "문장 변환"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={send}
            disabled={running}
            className="rounded-md border border-[rgba(126,184,255,0.45)] px-[20px] py-[9px] font-mono text-[12px] font-black text-[var(--sd-primary)] transition-colors hover:bg-[rgba(126,184,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            요청 보내기
          </button>
        </div>

        {/* 다이어그램 */}
        <div
          ref={boundsRef}
          className="absolute inset-0 top-[80px] h-[calc(100%-80px)] w-full overflow-hidden md:top-0 md:h-full"
        >
          <svg
            ref={svgRef}
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          >
            {lines.map(l => (
              <line
                key={l.key}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                strokeWidth="2"
                className="transition-colors duration-300"
                stroke={
                  litEdges.includes(l.key)
                    ? "#c4b5fd"
                    : "rgba(255,255,255,0.15)"
                }
              />
            ))}
          </svg>

          <div
            ref={dotRef}
            className="sd-pipe-dot -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          />

          {chip ? (
            <div
              className="pointer-events-none absolute z-30 -translate-x-1/2 whitespace-nowrap rounded border bg-[var(--sd-bg)] px-2 py-1 font-mono text-[9px] shadow-md transition-opacity duration-200"
              style={{
                left: chip.x,
                top: chip.y,
                borderColor: chip.color,
                color: chip.color
              }}
            >
              {chip.text}
            </div>
          ) : null}

          {NODES.map(node => (
            <div
              key={node.id}
              ref={el => {
                nodeRefs.current[node.id] = el;
              }}
              className={`sd-node sd-node-${node.id} font-mono ${
                node.owner === "mine"
                  ? "sd-node-mine"
                  : node.owner === "mate"
                  ? "sd-node-mate"
                  : "sd-node-team"
              } ${lit.includes(node.id) ? "sd-lit" : ""}`}
            >
              {node.tag ? (
                <span
                  className="absolute -top-[6px] right-1 bg-[var(--sd-panel)] px-1 font-mono text-[8px]"
                  style={{
                    color:
                      node.owner === "mate"
                        ? "#c4b5fd"
                        : "rgba(255,255,255,0.4)"
                  }}
                >
                  {node.tag}
                </span>
              ) : null}
              {node.label}
              {node.id === 6 ? (
                <div
                  className="pointer-events-none absolute left-1/2 top-[110%] -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-[#c4b5fd] transition-opacity duration-300"
                  style={{opacity: showMateCaption ? 1 : 0}}
                >
                  여기부터는 팀원이 만든 부분입니다
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="absolute bottom-[26px] left-[26px] z-10">
          <span className="font-mono text-[9px] text-white/30">
            구간별 응답 시간은 측정하지 않았습니다
          </span>
        </div>

        <div className="absolute bottom-[26px] right-[26px] z-10 flex flex-col gap-2 rounded border border-white/5 bg-[rgba(13,26,43,0.8)] p-2 font-mono text-[10px] backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-[2px] border border-[var(--sd-primary)] bg-[rgba(126,184,255,0.2)]" />
            <span>내가 만든 부분</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-[2px] border border-[#c4b5fd] bg-[rgba(196,181,253,0.2)]" />
            <span>팀원이 만든 부분</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-[2px] border border-dashed border-white/40" />
            <span>공동 작업</span>
          </div>
        </div>
      </div>

      {/* ── 담당 범위 ── */}
      <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
        {SCOPE.map(box => (
          <div
            key={box.title}
            className="flex flex-col gap-3 rounded-md border border-[rgba(126,184,255,0.2)] bg-[rgba(126,184,255,0.05)] p-[20px]"
          >
            <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--sd-primary)]">
              {box.title}
            </div>
            <ul className="flex flex-col space-y-1 text-[14px] leading-[28px]">
              {box.items.map(item => (
                <li key={item}>
                  <span className="mr-1 text-[var(--sd-primary)]">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── 제가 만들지 않은 것 ── */}
      <div className="relative mt-[36px] rounded-md border border-[rgba(196,181,253,0.3)] border-l-[3px] border-l-[#c4b5fd] bg-[rgba(196,181,253,0.05)] p-[22px] shadow-sm">
        <div className="mb-3 font-mono text-[10px] tracking-[0.18em] text-[#c4b5fd]">
          제가 만들지 않은 것
        </div>
        <p className="break-keep text-[15px] leading-[32px]">
          3D 아바타 모델과 렌더링, 애니메이션 적용은 팀원이 만들었습니다.
          화면에서 제일 먼저 보이는 부분이라 오해되기 쉬운데,{" "}
          <span className="font-bold text-[#c4b5fd]">
            그건 제 작업이 아닙니다
          </span>
          . 저는 그 아바타가 무엇을 언제 어떻게 움직여야 하는지를 정의한
          데이터와, 그 데이터를 만들어 내려보내는 서버를 맡았습니다. 프론트엔드
          화면도 팀에서 나눠서 작업했습니다.
        </p>
      </div>
    </section>
  );
}
