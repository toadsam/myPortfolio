"use client";

import {useCallback, useRef, useState} from "react";
import {useTserof} from "../context";
import {
  Body,
  Card,
  CodeLine,
  CodePanel,
  Cm,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../useTimeline";

// PAGE 06 — 핵심 구현 #2 · 스테이지는 상태를 가진다
//
// 연출 장치: 헤더에 떠 있던 보드가 **본문 한가운데로 확대되어 내려온다.**
// 방문자가 직접 클리어시켜서 다음 칸이 열리는 걸 본다.
//
// 두 트러블 사이에 놓인 숨 고르기 장이다(스펙 A-5 관람 곡선).

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const STAGES = [
  {n: 1, name: "설원 초입", role: "튜토리얼 — 기믹을 하나씩"},
  {n: 2, name: "얼음 구간", role: "응용 — 고드름 · 레이저"},
  {n: 3, name: "정상", role: "복합 — 배운 것을 겹쳐서"}
];

export function P06StageState() {
  const {reducedMotion, announce} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [cleared, setCleared] = useState(0); // 몇 스테이지까지 깼는가
  const [log, setLog] = useState<string[]>([]);

  const clear = useCallback(
    (n: number) => {
      if (n !== cleared + 1) return;
      setCleared(n);
      setLog(prev => [
        ...prev.slice(-3),
        `Stage${n}Clear = true → Stage${n + 1} 잠금 해제`
      ]);
      announce(`${n}스테이지를 클리어했습니다. 다음 스테이지가 열렸습니다.`);
    },
    [cleared, announce]
  );

  const reset = useCallback(() => {
    setCleared(0);
    setLog([]);
    announce("진행 상황을 초기화했습니다.");
  }, [announce]);

  return (
    <Page index={6} innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant}>
        06 · 핵심 구현 #2
      </Kicker>

      <div className="mt-4">
        <Heading
          text="스테이지는 상태를 가진다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          스테이지를 처음부터 전부 열어 두지 않았습니다. 하나를 깨야 다음이
          열리고, 그 사실이 저장됩니다.{" "}
          <strong>이 화면 위쪽에 떠 있는 보드</strong>가 그 구조를 그대로 옮긴
          것입니다 — 읽어 내려갈수록 칸이 열리는 것도 같은 원리입니다.
        </Body>
        <div className="mt-3">
          <Hint>직접 클리어시켜 보세요 — 다음 칸이 열립니다</Hint>
        </div>
      </div>

      <div
        className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <Panel
          label="▸ STAGE SELECT"
          right={
            <button
              type="button"
              onClick={reset}
              className="font-mono text-[11px] text-[var(--ts-muted)] transition-colors hover:text-white"
            >
              처음부터
            </button>
          }
        >
          <div className="flex flex-col gap-2.5">
            {STAGES.map(s => {
              const unlocked = s.n <= cleared + 1;
              const done = s.n <= cleared;
              const next = s.n === cleared + 1;
              return (
                <div
                  key={s.n}
                  className="flex items-center gap-3 rounded-md p-3 transition-colors duration-300"
                  style={{
                    border: unlocked
                      ? "1px solid var(--ts-primary)"
                      : "1px solid var(--ts-locked)",
                    background: done
                      ? "rgba(52,211,153,0.10)"
                      : unlocked
                      ? "rgba(52,211,153,0.04)"
                      : "transparent"
                  }}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md font-mono text-[16px] font-black"
                    style={{
                      border: unlocked
                        ? "1px solid var(--ts-primary)"
                        : "1px solid var(--ts-locked)",
                      color: unlocked
                        ? "var(--ts-primary)"
                        : "rgba(255,255,255,0.22)"
                    }}
                  >
                    {unlocked ? `0${s.n}` : "🔒"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-[var(--ts-text)]">
                      {unlocked ? s.name : "???"}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] text-[var(--ts-muted)]">
                      {unlocked ? s.role : "이전 스테이지를 먼저 클리어"}
                    </span>
                  </span>
                  {done ? (
                    <span
                      className="shrink-0 font-mono text-[11px] font-black"
                      style={{color: "var(--ts-primary)"}}
                    >
                      CLEAR
                    </span>
                  ) : next ? (
                    <button
                      type="button"
                      onClick={() => clear(s.n)}
                      className="shrink-0 rounded px-3 py-2 font-mono text-[11px] font-bold"
                      style={{
                        border: "1px solid rgba(52,211,153,0.45)",
                        background: "rgba(52,211,153,0.14)",
                        color: "var(--ts-accent)"
                      }}
                    >
                      클리어
                    </button>
                  ) : (
                    <span className="shrink-0 font-mono text-[11px] text-[var(--ts-faint)]">
                      잠김
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="mt-4 min-h-[74px] rounded p-3"
            style={{
              background: "#031009",
              border: "1px solid rgba(52,211,153,0.12)"
            }}
          >
            {log.length === 0 ? (
              <span className="font-mono text-[11px] text-[var(--ts-faint)]">
                상태 변화가 여기에 기록됩니다
                <span className="ts-caret ml-0.5">▌</span>
              </span>
            ) : (
              log.map(l => (
                <div
                  key={l}
                  className="font-mono text-[11px] leading-5"
                  style={{color: "var(--ts-primary)"}}
                >
                  {l}
                </div>
              ))
            )}
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <CodePanel
            filename="StageManager.cs"
            footer="클리어 여부가 곧 다음 스테이지의 열쇠다"
          >
            <div className="py-2">
              <CodeLine n={1}>{"public bool IsUnlocked(int stage)"}</CodeLine>
              <CodeLine n={2}>{"{"}</CodeLine>
              <CodeLine n={3}>{"  if (stage == 1) return true;"}</CodeLine>
              <CodeLine n={4} highlight={cleared > 0}>
                {"  return _data.IsClear(stage - 1);   "}
                <Cm>{"// 앞 스테이지"}</Cm>
              </CodeLine>
              <CodeLine n={5}>{"}"}</CodeLine>
              <CodeLine n={6}>{""}</CodeLine>
              <CodeLine n={7}>{"public void OnStageClear(int stage)"}</CodeLine>
              <CodeLine n={8}>{"{"}</CodeLine>
              <CodeLine n={9} highlight={cleared > 0}>
                {"  _data.SetClear(stage, true);"}
              </CodeLine>
              <CodeLine n={10}>
                {"  DataPersistenceManager.instance.SaveGame();"}
              </CodeLine>
              <CodeLine n={11}>{"}"}</CodeLine>
            </div>
          </CodePanel>

          <Card label="설계 의도" accent="var(--ts-primary)">
            <p className="text-[14px] leading-7">
              전면 개방하지 않은 이유는{" "}
              <strong>난이도 곡선을 지키기 위해서</strong>였습니다. 2스테이지의
              고드름·레이저를 이해하지 못한 채 3스테이지에 들어가면, 어려운 게
              아니라 <span className="text-[var(--ts-accent)]">불합리하게</span>{" "}
              느껴집니다. 그리고 실패해도 처음부터 다시 하지 않도록 저장을
              붙였습니다 — 그 저장이 다음 두 장의 이야기입니다.
            </p>
          </Card>
        </div>
      </div>
    </Page>
  );
}
