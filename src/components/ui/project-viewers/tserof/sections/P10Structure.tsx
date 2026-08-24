"use client";

import {useRef, useState} from "react";
import {useTserof} from "../context";
import {
  Body,
  Caveat,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../useTimeline";

// PAGE 10 — 구조 · 씬을 어떻게 나눴고, 내가 어디를 맡았나
//
// 개발 실체: 프로젝트 구조 + **내가 한 것 / 팀원이 한 것 / 아무도 못 한 것**
// 담당 범위는 PDF 기준 — 레벨 디자인 · 장애물/기믹 구현 · 기획 · 부팀장.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, map: 3};

type Owner = "me" | "team" | "none";

const OWNER_COLOR: Record<Owner, string> = {
  me: "var(--ts-primary)",
  team: "rgba(255,255,255,0.34)",
  none: "var(--ts-warn)"
};
const OWNER_LABEL: Record<Owner, string> = {
  me: "내가 맡은 것",
  team: "팀원이 맡은 것",
  none: "아무도 못 한 것"
};

interface Node {
  name: string;
  desc: string;
  owner: Owner;
}

const SCENES: {scene: string; nodes: Node[]}[] = [
  {
    scene: "StartScene · StageSelect",
    nodes: [
      {
        name: "스테이지 선택 흐름",
        desc: "잠금 해제 · 이어하기 진입",
        owner: "team"
      },
      {name: "난이도 선택", desc: "재도전 문턱 낮추기", owner: "me"}
    ]
  },
  {
    scene: "Stage1 · 2 · 3",
    nodes: [
      {
        name: "레벨 배치",
        desc: "멈춤–질주–회피 리듬 · 난이도 곡선",
        owner: "me"
      },
      {
        name: "장애물 · 기믹",
        desc: "고드름 · 레이저 · 통나무 · 회전 발판",
        owner: "me"
      },
      {
        name: "플레이어 컨트롤러",
        desc: "이동 · 2단 점프 · 접지 판정",
        owner: "team"
      }
    ]
  },
  {
    scene: "공통 시스템",
    nodes: [
      {name: "세이브 · 이어하기", desc: "직렬화 + XOR", owner: "team"},
      {
        name: "성능 최적화",
        desc: "풀링 · 레이캐스트 · 조건부 충돌",
        owner: "me"
      },
      {
        name: "Addressables 리소스 관리",
        desc: "끝내 손대지 못함",
        owner: "none"
      },
      {
        name: "세이브 데이터 버전 관리",
        desc: "다음 목표로 남음",
        owner: "none"
      },
      {name: "점프 매커니즘 근본 수정", desc: "임시 조치로 출시", owner: "none"}
    ]
  }
];

export function P10Structure() {
  const {reducedMotion} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [filter, setFilter] = useState<Owner | "all">("all");

  const counts = SCENES.flatMap(s => s.nodes).reduce(
    (acc, n) => ({...acc, [n.owner]: (acc[n.owner] ?? 0) + 1}),
    {} as Record<Owner, number>
  );

  return (
    <Page index={10} innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant}>
        10 · 구조
      </Kicker>

      <div className="mt-4">
        <Heading
          text="씬을 나누고, 내가 맡은 곳"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          5인 팀에서 저는 <strong>부팀장</strong>으로 기획에 참여하고,{" "}
          <strong>레벨 디자인과 장애물·기믹 구현</strong>을 맡았습니다. 앞의 네
          트러블이 전부 제 담당 구역에서 나온 이유이기도 합니다 — 매 프레임 도는
          것들은 대개 장애물이었습니다.
        </Body>
        <div className="mt-3">
          <Hint>범례를 눌러 담당별로 걸러 보세요</Hint>
        </div>
      </div>

      <div className="mt-8" style={rise(on[IDX.map], instant)}>
        {/* 범례 = 필터 */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "me", "team", "none"] as const).map(o => {
            const active = filter === o;
            const color =
              o === "all" ? "var(--ts-accent)" : OWNER_COLOR[o as Owner];
            return (
              <button
                key={o}
                type="button"
                onClick={() => setFilter(o)}
                aria-pressed={active}
                className="flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] font-bold transition-colors duration-200"
                style={{
                  border: active
                    ? `1px solid ${color}`
                    : "1px solid var(--ts-border)",
                  background: active
                    ? `color-mix(in srgb, ${color} 12%, transparent)`
                    : "var(--ts-panel)",
                  color: active ? color : "var(--ts-muted)"
                }}
              >
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{background: color}}
                  aria-hidden="true"
                />
                {o === "all"
                  ? "전체"
                  : `${OWNER_LABEL[o as Owner]} ${counts[o as Owner] ?? 0}`}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {SCENES.map(s => (
            <Panel key={s.scene} label={s.scene}>
              <div className="flex flex-col gap-2">
                {s.nodes.map(n => {
                  const dim = filter !== "all" && filter !== n.owner;
                  return (
                    <div
                      key={n.name}
                      className="rounded p-2.5 transition-opacity duration-300"
                      style={{
                        borderLeft: `3px solid ${OWNER_COLOR[n.owner]}`,
                        background: "rgba(255,255,255,0.03)",
                        opacity: dim ? 0.25 : 1
                      }}
                    >
                      <div className="text-[12px] font-bold text-[var(--ts-text)]">
                        {n.name}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] leading-4 text-[var(--ts-muted)]">
                        {n.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          ))}
        </div>

        <Caveat>
          팀 인원(5인)과 씬 구성은 저장소 기록 기준이며, 팀원별 세부 담당 범위는{" "}
          [확인필요] 입니다. 위 분류는 제 담당을 중심으로 정리한 것이라 팀원
          쪽은 묶어서 표시했습니다.
        </Caveat>
      </div>
    </Page>
  );
}
