"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useSueo} from "../context";
import {Kicker, rise} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

const STEPS = [0, 150, 600];
const IDX = {label: 0, heading: 1, body: 2};

type Owner = "mine" | "mate" | "team";

// 기준: GitHub 저장소 toadsam/Sign-Language (main) 의 git 기록.
const NODES: {id: number; label: string; owner: Owner; tag?: string}[] = [
  {id: 1, label: "Expo 앱", owner: "team", tag: "공동"},
  {id: 2, label: "Spring Boot API", owner: "team", tag: "공동"},
  {id: 3, label: "세 갈래 선택 · 정규화", owner: "mine"},
  {id: 4, label: "영상 조회 캐시", owner: "mine"},
  {id: 5, label: "Firestore 퀴즈·사용자", owner: "mate", tag: "팀원"},
  {id: 6, label: "3D 아바타 영상", owner: "mate", tag: "팀원"},
  {id: 7, label: "화면 재생", owner: "team", tag: "공동"}
];

const EDGES: [number, number][] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 2],
  [2, 5],
  [5, 4],
  [1, 6],
  [6, 7]
];

const FLOWS = {
  word: {
    path: [1, 2, 5, 4, 2, 1, 6, 7],
    notes: [
      "퀴즈 세션 요청",
      "/api/quiz/session",
      "활성 문항 읽기",
      "정답 단어로 영상 조회",
      "정답 뺀 문항 응답",
      "문항 수신",
      "영상 주소 로드",
      "재생"
    ]
  },
  sentence: {
    path: [1, 2, 3, 4, 2, 1, 6, 7],
    notes: [
      "문장 전송",
      "POST /translate",
      "사전 적중 수로 선택",
      "단어별 영상 조회",
      "items[] 응답",
      "재생 목록 수신",
      "영상 주소 로드",
      "재생 · 없으면 글자"
    ]
  }
} as const;

const SCOPE: {title: string; items: string[]}[] = [
  {
    title: "문장 변환",
    items: [
      "번역 API 와 사전 로더 첫 뼈대 (b86a1e8)",
      "OpenAI 기본형 정규화, 두 갈래 선택을 세 갈래로 확장 (e34d174)",
      "활용형을 기본형으로 되돌리는 어미 표 (c68e41c)"
    ]
  },
  {
    title: "영상 조회",
    items: [
      "단어별 지연 조회와 없는 단어 캐시 (8fdd313 · c68e41c)",
      "정답 단어로 찾고 Firestore 주소로 폴백 (8fdd313)",
      "영상 없는 단어도 순서를 지키는 재생 목록 items[] (133eb9a)"
    ]
  },
  {
    title: "배포",
    items: [
      "Dockerfile 과 Cloud Run 배포 (51e4b01)",
      "GitHub Pages 배포 워크플로 (e94c200 외 3건)",
      "CORS 허용 목록과 웹 로그인 팝업 처리 (bc692f8)"
    ]
  },
  {
    title: "퀴즈 데이터",
    items: [
      "기초 단어 · 일상 회화 카테고리 필터 (133eb9a)",
      "20문항 Firestore 업로드 스크립트 (133eb9a)"
    ]
  }
];

const ownerColor = (id: number) =>
  id === 5 || id === 6
    ? "#c4b5fd"
    : id === 1 || id === 2 || id === 7
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
        ? "퀴즈 문항 경로를 재생했습니다."
        : "통역기 문장 경로를 재생했습니다."
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
          제가 만든 건 아바타가 아니라, 문장을 영상으로 잇는 길이었습니다
        </h1>
        <p
          className="max-w-[740px] break-keep text-[16px] leading-[36px] text-[var(--sd-muted)]"
          style={rise(on(IDX.body), rm)}
        >
          네 명이 한 프로젝트였고 저는 백엔드 둘 중 하나였습니다. 화면에서 제일
          눈에 띄는 3D 아바타 영상과 앱 화면 대부분은 팀원이 만들었습니다.
          아래에서 요청을 하나 보내보면, 어느 구간이 누구 몫이었는지 git
          기록대로 보입니다.
        </p>
      </div>

      <div
        className="relative mb-[52px] h-[640px] w-full rounded-md border border-[rgba(126,184,255,0.2)] bg-[var(--sd-panel)] p-[26px] md:h-[470px]"
        aria-label="요청 처리 경로 시각화 다이어그램"
      >
        <p className="sr-only">
          시스템 구조와 담당 범위를 보여줍니다. 퀴즈 경로는 Expo 앱 → Spring
          Boot API → Firestore 문항 → 영상 조회 캐시 → API → 앱 → 3D 아바타 영상
          → 재생 순서이고, 통역기 경로는 Firestore 대신 세 갈래 선택과 정규화를
          거칩니다. 세 갈래 선택과 영상 조회 캐시가 제 코드이고, Firestore
          퀴즈·사용자 도메인과 3D 아바타 영상은 팀원이 만든 부분입니다.
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
                {k === "word" ? "퀴즈 문항" : "통역기 문장"}
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
            통역기 왕복 중앙값 101ms(규칙 경로)만 쟀고 구간별 시간은 재지
            않았습니다
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
          3D 아바타 모델과 수어 동작 애니메이션은 박가원이 만들었고, 앱이 트는
          영상이 그 결과물입니다. 화면에서 제일 먼저 보이는 부분이라 오해되기
          쉬운데,{" "}
          <span className="font-bold text-[#c4b5fd]">
            그건 제 작업이 아닙니다
          </span>
          . 앱 화면 대부분과 퀴즈·오답노트·통계, 규칙 단순화기와 외부 사전
          연동은 류태원이, Google 로그인과 Firestore 사용자 저장, Storage 첫
          연결은 박지헌이 만들었습니다. 저는 그 영상을 단어마다 찾아 순서대로
          넘기는 서버 쪽 길과 배포를 맡았습니다.
        </p>
      </div>
    </section>
  );
}
