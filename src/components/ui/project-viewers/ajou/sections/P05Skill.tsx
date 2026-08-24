"use client";

import {useCallback, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  Cm,
  CodeLine,
  CodePanel,
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

// PAGE 05 — 매 판 다른 빌드 · 레벨업 랜덤 스킬 선택
//
// 개발 실체: PDF 31쪽 「Core Dev #2」 원문
//            흐름: 전투/탐색 → 레벨업 발생 → 시간 정지 → 3개 중 선택 → 즉시 반영
//            Time.timeScale = 0, GetRandomSkills(3), UI(표시·선택)와 스킬(효과·적용) 책임 분리
// 연출 장치: **관람객이 직접 레벨업하고 3장 중 하나를 고른다.** 고른 것이 쌓여
//            자기 빌드가 만들어지고, 다시 하면 다른 조합이 나온다.
//            (스펙 PAGE 05 의 「규칙을 바꾸면 눈앞에서 다시 만들어진다」)
//
// 스펙의 「자동 발판 생성 슬라이더」는 이 프로젝트가 아니라 쓰지 않는다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const POOL = [
  {n: "공격 속도", d: "공격 간격 감소", c: "var(--aj-bad)"},
  {n: "이동 속도", d: "탐색과 회피가 빨라짐", c: "var(--aj-ray)"},
  {n: "최대 체력", d: "버틸 수 있는 웨이브가 늘어남", c: "var(--aj-ok)"},
  {n: "공격 범위", d: "다수를 한 번에 친다", c: "var(--aj-warn)"},
  {n: "치명타", d: "가끔 크게 터진다", c: "var(--aj-accent)"},
  {n: "회복", d: "웨이브 사이에 체력을 되찾음", c: "var(--aj-ok)"},
  {n: "관통", d: "뒤에 선 적까지 닿음", c: "var(--aj-ray)"},
  {n: "쿨타임 감소", d: "소환 스킬을 더 자주", c: "var(--aj-warn)"}
] as const;

type Card = (typeof POOL)[number];

/** 중복 없이 3장. GetRandomSkills(3) 이 하는 일과 같다. */
function drawThree(): Card[] {
  const pool = [...POOL];
  const out: Card[] = [];
  for (let i = 0; i < 3; i += 1) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export function P05Skill() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [level, setLevel] = useState(1);
  const [choices, setChoices] = useState<Card[] | null>(null);
  const [build, setBuild] = useState<string[]>([]);

  const levelUp = useCallback(() => {
    setChoices(drawThree());
    announce("레벨업. 시간이 멈추고 스킬 3개가 제시됩니다.");
  }, [announce]);

  const pick = useCallback(
    (c: Card) => {
      setBuild(prev => [...prev, c.n]);
      setChoices(null);
      setLevel(l => l + 1);
      announce(`${c.n}을(를) 선택했습니다. 시간이 다시 흐릅니다.`);
    },
    [announce]
  );

  const reset = useCallback(() => {
    setBuild([]);
    setLevel(1);
    setChoices(null);
    announce("빌드를 초기화했습니다.");
  }, [announce]);

  const paused = choices !== null;

  return (
    <Page index={5} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        05 · 랜덤 스킬
      </Kicker>

      <div className="mt-4">
        <Heading
          text="매 판 다른 빌드가 나와야 다시 합니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          같은 순서로 같은 능력을 얻으면 두 번째 판은 첫 판의 반복입니다. 그래서
          레벨업마다 <strong>무작위 3장을 뽑아 고르게</strong> 했습니다. 고른
          것들이 쌓여 그 판만의 빌드가 됩니다. 직접 몇 번 올려 보세요 — 매번 다른
          조합이 나옵니다.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: "1px solid var(--aj-border)",
            background: "var(--aj-panel)"
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-muted)]">
              InGameSkillManager
            </span>
            <span
              className="rounded px-2 py-0.5 font-mono text-[10px] font-black tabular-nums"
              style={{
                background: paused
                  ? "rgba(251,191,36,0.16)"
                  : "rgba(163,230,53,0.14)",
                color: paused ? "var(--aj-warn)" : "var(--aj-primary)"
              }}
            >
              Lv.{level} · timeScale = {paused ? "0" : "1"}
            </span>
          </div>

          {/* 선택 화면 */}
          <div
            className="relative flex min-h-[220px] items-center justify-center rounded p-4"
            style={{
              border: "1px solid rgba(163,230,53,0.22)",
              background: "#0e1406"
            }}
          >
            <div className="aj-grid absolute inset-0" aria-hidden="true" />

            {choices ? (
              <div className="relative grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3">
                {choices.map((c, i) => (
                  <button
                    key={c.n}
                    type="button"
                    onClick={() => pick(c)}
                    className={`cursor-pointer rounded-md p-3.5 text-left transition-colors duration-200 ${
                      instant ? "" : "aj-deal"
                    }`}
                    style={{
                      border: `1px solid ${c.c}`,
                      background: `color-mix(in srgb, ${c.c} 10%, transparent)`,
                      animationDelay: `${i * 90}ms`
                    }}
                  >
                    <div
                      className="font-mono text-[12px] font-bold"
                      style={{color: c.c}}
                    >
                      {c.n}
                    </div>
                    <p className="mt-1.5 text-[11px] leading-5 text-[var(--aj-muted)]">
                      {c.d}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative flex flex-col items-center gap-3">
                <span className="font-mono text-[11px] text-[var(--aj-faint)]">
                  {build.length === 0
                    ? "전투 중… 레벨업을 시켜 보세요"
                    : `${build.length}번 성장했습니다`}
                </span>
                <button
                  type="button"
                  onClick={levelUp}
                  className="cursor-pointer rounded-md px-4 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
                  style={{
                    border: "1px solid rgba(163,230,53,0.45)",
                    background: "rgba(163,230,53,0.14)",
                    color: "var(--aj-accent)"
                  }}
                >
                  LEVEL UP ▲
                </button>
              </div>
            )}
          </div>

          {/* 쌓인 빌드 */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-muted)]">
                MY BUILD
              </span>
              {build.length > 0 ? (
                <button
                  type="button"
                  onClick={reset}
                  className="cursor-pointer font-mono text-[10px] text-[var(--aj-faint)] transition-colors hover:text-white"
                >
                  초기화
                </button>
              ) : null}
            </div>
            <div className="mt-2 flex min-h-[34px] flex-wrap gap-1.5">
              {build.length === 0 ? (
                <span className="font-mono text-[10px] text-[var(--aj-faint)]">
                  아직 아무것도 고르지 않았습니다
                </span>
              ) : (
                build.map((b, i) => (
                  <span
                    key={`${b}-${i}`}
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] ${
                      instant ? "" : "aj-pop"
                    }`}
                    style={{
                      border: "1px solid rgba(163,230,53,0.3)",
                      color: "var(--aj-accent)"
                    }}
                  >
                    {b}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <CodePanel
            filename="InGameSkillManager.cs"
            badge={{text: "실제 코드", color: "var(--aj-ok)"}}
            borderColor="var(--aj-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>
                  {"// desc: 레벨업 시 게임을 일시 정지하고 랜덤 스킬 3개를 제시"}
                </Cm>
              </CodeLine>
              <CodeLine n={2}>{"public void LevelUp()"}</CodeLine>
              <CodeLine n={3}>{"{"}</CodeLine>
              <CodeLine n={4} highlight={paused}>
                {"  skillSelectionUI.SetActive(true);"}
              </CodeLine>
              <CodeLine n={5} highlight={paused}>
                {"  Cursor.lockState = CursorLockMode.None;"}
              </CodeLine>
              <CodeLine n={6} highlight={paused}>
                {"  Cursor.visible = true;"}
              </CodeLine>
              <CodeLine n={7}>{""}</CodeLine>
              <CodeLine n={8} highlight={paused}>
                {"  List<InGameSkill> randomSkills = GetRandomSkills(3);"}
              </CodeLine>
              <CodeLine n={9}>
                {"  for (int i = 0; i < skillSlots.Length; i++)"}
              </CodeLine>
              <CodeLine n={10}>{"  {"}</CodeLine>
              <CodeLine n={11}>
                {"    skillSlots[i].SetSkill(randomSkills[i]);"}
              </CodeLine>
              <CodeLine n={12}>{"  }"}</CodeLine>
              <CodeLine n={13}>{""}</CodeLine>
              <CodeLine n={14} highlight={paused}>
                {"  Time.timeScale = 0f;"}
              </CodeLine>
              <CodeLine n={15}>{"}"}</CodeLine>
            </div>
          </CodePanel>

          <Panel label="책임을 나눈 이유">
            <p className="text-[13px] leading-6 text-[var(--aj-muted)]">
              <strong>UI 는 보여주고 고르게만</strong> 하고,{" "}
              <strong>스킬은 효과와 적용만</strong> 맡습니다. 밸런스를 만질 때 UI
              를 열지 않아도 되고, 새 스킬을 추가할 때 선택 화면을 고치지 않아도
              됩니다.
            </p>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <Hint>
          커서를 다시 보이게 하는 두 줄이 같이 있는 이유는, 1인칭에서 커서를
          잠가 놨기 때문입니다 — 03장의 모드 전환과 얽혀 있습니다.
        </Hint>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Shot
          src="/projects/ajou-adventure/skill-select.webp"
          alt="레벨업 스킬 선택 화면"
          caption="실제 스킬 선택 화면 — 시간이 멈춘 상태다"
          w={456}
          h={254}
        />
        <Shot
          src="/projects/ajou-adventure/code-skill.webp"
          alt="InGameSkillManager.cs 전체 코드"
          caption="빨간 줄 — 커서 해제, 3개 추출, timeScale 정지"
          w={1600}
          h={1049}
        />
      </div>
    </Page>
  );
}
