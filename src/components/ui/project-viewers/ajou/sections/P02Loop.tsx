"use client";

import {useCallback, useEffect, useRef, useState} from "react";
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
import {useOnScreen, usePageVisible, useTimeline} from "../../_kit/useTimeline";

// PAGE 02 — 직접 돌려보세요 · 코어 루프가 지금 돌고 있다
//
// 개발 실체: PDF 29쪽 「Game Loop & System Architecture」 원문
//            탐색 → 전투/웨이브 → 경험치 → 레벨업 → 스킬 선택 → 성장 → 다음 웨이브
//            + 시스템 모듈 구성 (Player ↔ Skill ↔ UI ↔ AI ↔ Event)
// 연출 장치: **관람객이 루프를 직접 돌린다.** 웨이브가 오르면 난이도도 오르고,
//            지금 어느 모듈이 일하고 있는지가 옆에서 같이 점등된다.
//
// 스펙의 Phaser `update()` 프레임 카운터는 이 프로젝트가 Unity 라 쓰지 않는다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, loop: 3};

const LOOP = [
  {k: "explore", t: "탐색", m: "Player", say: "이동하며 다음 적을 찾는다"},
  {k: "battle", t: "전투 / 웨이브", m: "AI", say: "적이 생성되고 전투가 진행된다"},
  {k: "exp", t: "경험치 획득", m: "Player", say: "적을 처치하면 경험치가 들어온다"},
  {k: "levelup", t: "레벨업", m: "UI", say: "게임이 멈추고 선택 UI 가 열린다"},
  {k: "skill", t: "스킬 선택", m: "Skill", say: "3개 중 하나를 골라 즉시 반영"},
  {k: "next", t: "다음 웨이브", m: "Event", say: "난이도가 오른 채로 다시 탐색"}
] as const;

const MODULES = [
  {k: "Player", d: "이동 · 전투 · 스탯 · 아이템 효과"},
  {k: "Skill", d: "레벨업 선택 · 강화 · 신규 습득"},
  {k: "AI", d: "일반 몬스터 · 보스 패턴"},
  {k: "UI", d: "인벤토리 · 캐릭터 선택 · 튜토리얼 · 대화 · 퀘스트"},
  {k: "Event", d: "포탈 씬 로딩 · 돌발 퀘스트"}
] as const;

export function P02Loop() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const boxRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(boxRef, 0.2);
  const visible = usePageVisible();

  const [step, setStep] = useState(0);
  const [wave, setWave] = useState(1);
  const [level, setLevel] = useState(1);
  const [running, setRunning] = useState(false);

  // 루프는 화면 밖이거나 탭이 숨겨지면 즉시 멈춘다(스펙 A-8).
  useEffect(() => {
    if (!running || !onScreen || !visible) return;
    const t = window.setTimeout(() => {
      setStep(prev => {
        const next = (prev + 1) % LOOP.length;
        if (next === 0) {
          setWave(w => w + 1);
          setLevel(l => l + 1);
        }
        return next;
      });
    }, 760);
    return () => window.clearTimeout(t);
  }, [running, onScreen, visible, step]);

  const toggle = useCallback(() => {
    setRunning(prev => {
      announce(prev ? "루프를 멈췄습니다." : "루프를 돌립니다.");
      return !prev;
    });
  }, [announce]);

  const nudge = useCallback(() => {
    setStep(prev => {
      const next = (prev + 1) % LOOP.length;
      if (next === 0) {
        setWave(w => w + 1);
        setLevel(l => l + 1);
      }
      return next;
    });
  }, []);

  const activeModule = LOOP[step].m;

  return (
    <Page index={2} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        02 · 코어 루프
      </Kicker>

      <div className="mt-4">
        <Heading
          text="이 여섯 칸이 게임의 전부입니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          기능을 나중에 더 붙이려면 <strong>루프와 시스템을 갈라 놔야</strong>{" "}
          합니다. 루프는 순서만 알고, 실제 일은 각 모듈이 합니다. 그래서 새 스킬을
          넣을 때 전투 코드를 열지 않아도 됩니다. 아래 루프를 돌려 보세요 —
          지금 어느 모듈이 일하는지 오른쪽에 같이 켜집니다.
        </Body>
      </div>

      <div
        ref={boxRef}
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_320px]"
        style={rise(on[IDX.loop], instant)}
      >
        {/* ── 루프 ── */}
        <div
          className="rounded-md p-5"
          style={{
            border: "1px solid var(--aj-border)",
            background: "var(--aj-panel)"
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-muted)]">
              CORE LOOP
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tabular-nums text-[var(--aj-accent)]">
                WAVE {wave} · Lv.{level}
              </span>
              <button
                type="button"
                onClick={toggle}
                className="cursor-pointer rounded px-3 py-1.5 font-mono text-[11px] font-bold transition-colors duration-200"
                style={{
                  border: "1px solid rgba(163,230,53,0.45)",
                  background: "rgba(163,230,53,0.14)",
                  color: "var(--aj-accent)"
                }}
              >
                {running ? "■ 정지" : "▶ 돌리기"}
              </button>
              <button
                type="button"
                onClick={nudge}
                className="cursor-pointer rounded px-3 py-1.5 font-mono text-[11px] transition-colors duration-200"
                style={{
                  border: "1px solid var(--aj-border)",
                  color: "var(--aj-muted)"
                }}
              >
                한 칸 ▶
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {LOOP.map((s, i) => {
              const active = i === step;
              return (
                <div
                  key={s.k}
                  className="rounded-md p-3.5 transition-[border-color,background-color,box-shadow] duration-300"
                  style={{
                    border: `1px solid ${
                      active ? "var(--aj-primary)" : "rgba(255,255,255,0.10)"
                    }`,
                    background: active
                      ? "rgba(163,230,53,0.10)"
                      : "rgba(255,255,255,0.02)",
                    boxShadow: active
                      ? "0 0 14px rgba(163,230,53,0.26)"
                      : "none"
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono text-[11px] font-bold"
                      style={{
                        color: active ? "var(--aj-primary)" : "var(--aj-muted)"
                      }}
                    >
                      {i + 1}. {s.t}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                      style={{
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: active ? "var(--aj-accent)" : "var(--aj-faint)"
                      }}
                    >
                      {s.m}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-5 text-[var(--aj-faint)]">
                    {s.say}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <Hint>
              웨이브가 한 바퀴 돌 때마다 난이도가 오릅니다. 루프는 순서만 알고,
              무슨 일이 벌어지는지는 오른쪽 모듈이 정합니다.
            </Hint>
          </div>
        </div>

        {/* ── 시스템 모듈 ── */}
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-muted)]">
            SYSTEM MODULES
          </span>
          {MODULES.map(m => {
            const lit = m.k === activeModule;
            return (
              <div
                key={m.k}
                className="rounded-md p-3 transition-[border-color,background-color] duration-300"
                style={{
                  border: `1px solid ${
                    lit ? "var(--aj-accent)" : "rgba(255,255,255,0.10)"
                  }`,
                  background: lit
                    ? "rgba(190,242,100,0.10)"
                    : "rgba(255,255,255,0.02)"
                }}
              >
                <div
                  className="font-mono text-[11px] font-bold"
                  style={{color: lit ? "var(--aj-accent)" : "var(--aj-muted)"}}
                >
                  {m.k}
                </div>
                <p className="mt-1 text-[10px] leading-4 text-[var(--aj-faint)]">
                  {m.d}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Shot
          src="/projects/ajou-adventure/boot.webp"
          alt="아주대탐험 게임 초기 화면"
          caption="게임 초기 화면 — 플레이어와 환경이 초기화되는 지점"
          w={1000}
          h={476}
        />
        <Panel label="왜 갈랐나">
          <p className="text-[13px] leading-6 text-[var(--aj-muted)]">
            각 시스템이 <strong>독립적으로 확장 가능</strong>해야 기능을
            추가하거나 고칠 때 나머지를 건드리지 않습니다. 실제로 이 구조 덕에
            스킬 · 퀘스트 · 포탈을 나중에 각각 따로 얹을 수 있었습니다.
          </p>
        </Panel>
      </div>
    </Page>
  );
}
