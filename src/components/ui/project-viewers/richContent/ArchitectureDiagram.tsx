"use client";

// ════════════════════════════════════════════════════════════════════════════
//  시스템 아키텍처 다이어그램 — 손으로 배치하는 SVG
//
//  자동 배치를 쓰지 않는다. `VIEW / API / REALTIME / DB` 를 나란히 네 칸으로
//  그리면 **어떤 웹 프로젝트에도 들어맞는 그림**이 나오고, 그건 그 프로젝트에
//  대해 아무 말도 하지 않는다. 좌표·크기·화살표를 데이터에 직접 적는 이유는
//  아래 네 가지를 그림으로 말하기 위해서다.
//
//   1. 갈라지는 지점  — 요청이 REST 와 WebSocket 으로 나뉘는 게 눈에 보여야
//                       "왜 실시간을 따로 뺐나" 라는 질문에 그림이 먼저 답한다.
//   2. 크기의 비대칭  — 28개 컨트롤러짜리 백엔드와 3파일짜리 실시간 서버를
//                       같은 크기로 그리면 그건 거짓말이다. 크기가 정보다.
//   3. 경계           — 내가 만든 것과 가져다 쓴 것(OpenAI·S3)을 점선으로 가른다.
//   4. 실패 경로      — 401 → refresh → 재요청. 정상 경로만 그린 그림은 흔하다.
//
//  숫자(포트·파일 수·도메인 수)는 전부 저장소에서 센 값이라 눌러서 확인된다.
// ════════════════════════════════════════════════════════════════════════════

import {useId} from "react";

import type {ProjectTheme} from "@/data/projectThemes";

export interface DiagramNode {
  id: string;
  label: string;
  /** 박스 안 둘째 줄 — 포트·파일 수처럼 **검증 가능한** 값만 적는다. */
  note?: string;
  /** 셋째 줄 (선택) */
  sub?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 강조 박스. 그 프로젝트의 중심 한 곳에만 준다. */
  accent?: boolean;
}

export interface DiagramGroup {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 점선 = 내 코드가 아닌 것 */
  dashed?: boolean;
}

export interface DiagramEdge {
  /** 시작·끝 좌표를 직접 적는다 — 박스 가장자리 자동 계산은 겹칠 때 엉킨다. */
  from: [number, number];
  to: [number, number];
  label?: string;
  /** solid=단방향 · double=양방향 · dashed=실패/예외 경로 */
  kind?: "solid" | "double" | "dashed";
  /** 라벨을 선 중앙에서 얼마나 띄울지 */
  labelDy?: number;
  /** 라벨 위치를 직접 지정 (선 중앙이 다른 선과 겹칠 때) */
  labelAt?: [number, number];
  /** 꺾인 선을 만들 중간 x (세로→가로) */
  bendX?: number;
}

export interface DiagramSpec {
  /** 그림 위에 붙는 제목. 여러 장일 때 무엇에 답하는 그림인지 구분한다. */
  title?: string;
  /** 그림이 무슨 말을 하는지 한 줄. 그림 아래 캡션으로 나간다. */
  caption: string;
  viewBox: [number, number];
  groups?: DiagramGroup[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

function edgePath(e: DiagramEdge) {
  const [x1, y1] = e.from;
  const [x2, y2] = e.to;
  if (e.bendX === undefined) return `M ${x1} ${y1} L ${x2} ${y2}`;
  // 가로 → 세로 → 가로. 직각으로 꺾어야 배선도처럼 읽힌다.
  return `M ${x1} ${y1} H ${e.bendX} V ${y2} H ${x2}`;
}

export function ArchitectureDiagram({
  spec,
  theme
}: {
  spec: DiagramSpec;
  theme: ProjectTheme;
}) {
  const [vw, vh] = spec.viewBox;
  const gold = theme.primary;
  // 한 페이지에 그림이 두 장 이상 올라가면 marker id 가 겹친다. 겹치면
  // 브라우저는 **문서에서 처음 만난 marker** 를 쓰는데, 그게 다른 <svg> 안에
  // 있으면 회전(orient="auto")이 그 svg 기준으로 잡혀 화살촉이 뒤집힌다.
  // FestFlow 의 강등 경로 화살표가 실제로 180° 돌아갔다. id 를 인스턴스마다 나눈다.
  const uid = useId().replace(/[:]/g, "");
  const ARROW = `arch-arrow-${uid}`;
  const ARROW_BACK = `arch-arrow-back-${uid}`;
  const ARROW_DIM = `arch-arrow-dim-${uid}`;

  return (
    <figure className="m-0">
      {spec.title ? (
        <figcaption className="section-label mb-4">{spec.title}</figcaption>
      ) : null}
      <svg
        aria-label={spec.caption}
        className="w-full"
        role="img"
        viewBox={`0 0 ${vw} ${vh}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker
            id={ARROW}
            markerHeight="7"
            markerUnits="strokeWidth"
            markerWidth="7"
            orient="auto"
            refX="6"
            refY="3.5"
          >
            <path d="M0,0 L7,3.5 L0,7 z" fill={gold} />
          </marker>
          <marker
            id={ARROW_BACK}
            markerHeight="7"
            markerUnits="strokeWidth"
            markerWidth="7"
            orient="auto-start-reverse"
            refX="0"
            refY="3.5"
          >
            <path d="M0,0 L7,3.5 L0,7 z" fill={gold} />
          </marker>
          <marker
            id={ARROW_DIM}
            markerHeight="7"
            markerUnits="strokeWidth"
            markerWidth="7"
            orient="auto"
            refX="6"
            refY="3.5"
          >
            <path
              d="M0,0 L7,3.5 L0,7 z"
              fill="rgb(169,189,214)"
              opacity="0.75"
            />
          </marker>
        </defs>

        {/* 경계 상자 — 점선이면 "내 코드가 아니다" */}
        {spec.groups?.map(g => (
          <g key={g.label}>
            <rect
              fill={g.dashed ? "rgb(169,189,214)" : "rgb(226,192,120)"}
              fillOpacity={g.dashed ? 0.03 : 0.04}
              height={g.h}
              rx="10"
              stroke={g.dashed ? "rgb(169,189,214)" : gold}
              strokeDasharray={g.dashed ? "6 5" : undefined}
              strokeOpacity={g.dashed ? 0.4 : 0.35}
              strokeWidth="1"
              width={g.w}
              x={g.x}
              y={g.y}
            />
            <text
              fill={g.dashed ? "rgb(169,189,214)" : gold}
              fillOpacity="0.8"
              fontFamily="var(--mono), monospace"
              fontSize="12"
              letterSpacing="1.4"
              x={g.x + 14}
              y={g.y + 21}
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* 연결선 — 박스보다 먼저 그려 박스가 선 위에 오게 한다 */}
        {spec.edges.map((e, i) => {
          const dim = e.kind === "dashed";
          const mid: [number, number] = [
            (e.from[0] + e.to[0]) / 2,
            (e.from[1] + e.to[1]) / 2
          ];
          return (
            <g key={i}>
              <path
                d={edgePath(e)}
                fill="none"
                markerEnd={`url(#${dim ? ARROW_DIM : ARROW})`}
                markerStart={
                  e.kind === "double" ? `url(#${ARROW_BACK})` : undefined
                }
                stroke={dim ? "rgb(169,189,214)" : gold}
                strokeDasharray={dim ? "5 4" : undefined}
                strokeOpacity={dim ? 0.55 : 0.75}
                strokeWidth={e.kind === "double" ? 2 : 1.5}
              />
              {e.label
                ? (() => {
                    const lx = e.labelAt?.[0] ?? e.bendX ?? mid[0];
                    const ly = e.labelAt?.[1] ?? mid[1] + (e.labelDy ?? -9);
                    // 대각선 위에 글자를 그냥 얹으면 선과 글자가 서로를 갉는다.
                    // 밤하늘색 판을 깔아 글자 뒤에서 선을 끊는다.
                    const w = e.label.length * 7.2 + 14;
                    return (
                      <>
                        <rect
                          fill="rgb(11,22,38)"
                          height="18"
                          rx="4"
                          width={w}
                          x={lx - w / 2}
                          y={ly - 13}
                        />
                        <text
                          fill={dim ? "rgb(169,189,214)" : gold}
                          fillOpacity={dim ? 0.85 : 0.95}
                          fontFamily="var(--mono), monospace"
                          fontSize="12"
                          textAnchor="middle"
                          x={lx}
                          y={ly}
                        >
                          {e.label}
                        </text>
                      </>
                    );
                  })()
                : null}
            </g>
          );
        })}

        {/* 박스 */}
        {spec.nodes.map(n => (
          <g key={n.id}>
            <rect
              fill="rgb(11,22,38)"
              height={n.h}
              rx="8"
              stroke={n.accent ? gold : "rgb(122,90,56)"}
              strokeOpacity={n.accent ? 0.9 : 0.55}
              strokeWidth={n.accent ? 2 : 1}
              width={n.w}
              x={n.x}
              y={n.y}
            />
            <text
              fill={n.accent ? gold : "rgb(243,230,200)"}
              fontFamily="Pretendard, system-ui, sans-serif"
              fontSize="16"
              fontWeight="700"
              x={n.x + 16}
              y={n.y + 30}
            >
              {n.label}
            </text>
            {n.note ? (
              <text
                fill="rgb(169,189,214)"
                fillOpacity="0.85"
                fontFamily="var(--mono), monospace"
                fontSize="12"
                x={n.x + 16}
                y={n.y + 52}
              >
                {n.note}
              </text>
            ) : null}
            {n.sub ? (
              <text
                fill="rgb(169,189,214)"
                fillOpacity="0.7"
                fontFamily="var(--mono), monospace"
                fontSize="12"
                x={n.x + 16}
                y={n.y + 71}
              >
                {n.sub}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <figcaption className="mono mt-3 text-[11px] leading-relaxed text-muted">
        {spec.caption}
      </figcaption>
    </figure>
  );
}
