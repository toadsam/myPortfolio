"use client";

import {useCallback, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  Shot,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 06 — 건물마다 다른 게임 · 스테이지 구성
//
// 개발 실체: PDF 28쪽 「핵심 포인트」 원문
//            건물별 스테이지(전투/미션/퍼즐) · 성장 루프(완료→보상→강화→다음) ·
//            전투 몰입(입장 시 탑다운 전환) · 최종 목표(모든 스테이지 돌파 후 졸업 보스)
// 연출 장치: **관람객이 건물에 들어간다.** 들어가는 순간 이 페이지의 배경이
//            실내로 어두워지고(셸이 처리), 카드가 탑다운 표기로 뒤집힌다.
//            (스펙 PAGE 06 의 「스크롤을 내리면 페이지 자체가 바뀐다」를 옮긴 것)
//
// 스펙의 낮/밤 보간 시스템은 이 프로젝트에 없어 쓰지 않는다. 대신 PDF 에 있는
// 「입장 시 시점 전환」을 페이지 전체 분위기 전환으로 옮겼다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, map: 3};

const BUILDINGS = [
  {
    k: "combat",
    name: "전투 테마",
    theme: "전투",
    color: "var(--aj-bad)",
    inside: "웨이브가 시작되고 탑다운으로 바뀐다",
    reward: "경험치 · 레벨업"
  },
  {
    k: "mission",
    name: "미션 테마",
    theme: "미션",
    color: "var(--aj-warn)",
    inside: "제한 시간 안에 목표를 끝낸다",
    reward: "보상 아이템"
  },
  {
    k: "puzzle",
    name: "퍼즐 테마",
    theme: "퍼즐",
    color: "var(--aj-ray)",
    inside: "1인칭 시야로 단서를 찾는다",
    reward: "다음 구역 열쇠"
  },
  {
    k: "boss",
    name: "최종 — 졸업",
    theme: "보스",
    color: "var(--aj-accent)",
    inside: "모든 스테이지를 돌파해야 열린다",
    reward: "게임 종료"
  }
] as const;

export function P06Buildings() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [inside, setInside] = useState<string | null>(null);

  const enter = useCallback(
    (k: string, name: string) => {
      setInside(prev => {
        const next = prev === k ? null : k;
        announce(
          next ? `${name}에 들어갔습니다. 탑다운으로 바뀝니다.` : "밖으로 나왔습니다."
        );
        return next;
      });
    },
    [announce]
  );

  return (
    <Page index={6} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        06 · 건물 스테이지
      </Kicker>

      <div className="mt-4">
        <Heading
          text="건물이 곧 스테이지입니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          캠퍼스를 걸어 다니는 동안은 하나의 넓은 공간이지만, 건물에 들어가면
          그때부터 <strong>다른 규칙</strong>입니다. 테마가 다르고, 시점이
          바뀌고, 나오는 보상이 다릅니다. 아래에서 문을 열어 보세요.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        style={rise(on[IDX.map], instant)}
      >
        {BUILDINGS.map(b => {
          const open = inside === b.k;
          return (
            <button
              key={b.k}
              type="button"
              onClick={() => enter(b.k, b.name)}
              aria-pressed={open}
              className="cursor-pointer rounded-md p-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-300 hover:-translate-y-[2px]"
              style={{
                border: `1px solid ${open ? b.color : "rgba(255,255,255,0.12)"}`,
                background: open
                  ? `color-mix(in srgb, ${b.color} 12%, transparent)`
                  : "var(--aj-panel)",
                boxShadow: open
                  ? `0 0 16px color-mix(in srgb, ${b.color} 28%, transparent)`
                  : "none"
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="font-mono text-[11px] font-bold"
                  style={{color: open ? b.color : "var(--aj-muted)"}}
                >
                  {b.name}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "var(--aj-faint)"
                  }}
                >
                  {b.theme}
                </span>
              </div>

              {/* 입장 전 / 후 */}
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="rounded px-2 py-1 font-mono text-[10px] transition-colors duration-300"
                  style={{
                    border: `1px solid ${
                      open ? "rgba(255,255,255,0.12)" : b.color
                    }`,
                    color: open ? "var(--aj-faint)" : b.color
                  }}
                >
                  1인칭
                </span>
                <span
                  className="font-mono text-[10px]"
                  style={{color: open ? b.color : "var(--aj-faint)"}}
                >
                  →
                </span>
                <span
                  className="rounded px-2 py-1 font-mono text-[10px] transition-colors duration-300"
                  style={{
                    border: `1px solid ${
                      open ? b.color : "rgba(255,255,255,0.12)"
                    }`,
                    color: open ? b.color : "var(--aj-faint)"
                  }}
                >
                  탑다운
                </span>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-[var(--aj-muted)]">
                {open ? b.inside : "문을 눌러 들어가 보세요"}
              </p>
              <p
                className="mt-1.5 font-mono text-[10px]"
                style={{color: open ? "var(--aj-accent)" : "var(--aj-faint)"}}
              >
                보상 · {b.reward}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <Hint>
          {inside
            ? "들어온 김에 뒤 배경이 어두워진 걸 보셨을 겁니다 — 실내로 들어왔다는 뜻입니다."
            : "건물마다 규칙이 다른 이유는, 같은 전투를 네 번 반복시키지 않기 위해서입니다."}
        </Hint>
      </div>

      {/* 성장 루프 — PDF 28쪽 원문 */}
      <div className="mt-9">
        <Panel label="성장 루프">
          <div className="flex flex-wrap items-center gap-2">
            {["전투 · 미션 완료", "보상 획득", "상점 / 아이템 강화", "다음 스테이지"].map(
              (s, i, arr) => (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className="rounded px-3 py-2 font-mono text-[11px]"
                    style={{
                      border: "1px solid rgba(163,230,53,0.24)",
                      color: "var(--aj-accent)"
                    }}
                  >
                    {s}
                  </span>
                  {i < arr.length - 1 ? (
                    <span
                      className="font-mono text-[11px]"
                      style={{color: "var(--aj-faint)"}}
                    >
                      →
                    </span>
                  ) : null}
                </div>
              )
            )}
            <span
              className="font-mono text-[11px]"
              style={{color: "var(--aj-faint)"}}
            >
              ↺
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-6 text-[var(--aj-muted)]">
            마지막 목표는 <strong>졸업</strong>입니다. 모든 스테이지를 돌파해야
            최종 보스가 열립니다.
          </p>
        </Panel>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Shot
          src="/projects/ajou-adventure/portal.webp"
          alt="포탈 앞 장면과 씬 전환 장면"
          caption="구역 사이는 포탈로 이어진다 — 씬 로딩이 여기서 일어난다"
          w={986}
          h={537}
        />
        <Shot
          src="/projects/ajou-adventure/view-td.webp"
          alt="건물 내부 탑다운 전투 화면"
          caption="건물 안 — 강의실 책상이 그대로 엄폐물이 된다"
          w={445}
          h={220}
        />
      </div>
    </Page>
  );
}
