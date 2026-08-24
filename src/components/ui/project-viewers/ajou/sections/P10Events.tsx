"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  Card,
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
import {useOnScreen, usePageVisible, useTimeline} from "../../_kit/useTimeline";

// PAGE 10 — 이벤트 시스템 · 전투가 단조로워지지 않게
//
// 개발 실체: PDF 34쪽 「Event Systems」 원문
//            RobotSummoner.cs — 소환 유지 시간 + 쿨타임을 코루틴으로, canSummon 플래그
//            SpecialQuest.cs — remainingTime -= Time.deltaTime, 시간 초과 시 EndQuest(false)
//            포탈 씬 전환 · 제한 시간/상태 변화를 UI 로 즉시 인지
// 연출 장치: **관람객이 소환을 눌러 쿨타임에 갇혀 본다.** 동시에 퀘스트 타이머가
//            줄고, 시간이 다 되면 실제로 실패 처리된다.
//
// ⚠️ 두 타이머는 화면 밖·탭 숨김이면 멈춘다(스펙 A-8).

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const DURATION = 4; // 소환 유지 (초)
const COOLDOWN = 5; // 쿨타임 (초)
const QUEST_TIME = 20; // 퀘스트 제한 시간 (초)

type SummonPhase = "ready" | "active" | "cooldown";

export function P10Events() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const boxRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(boxRef, 0.2);
  const visible = usePageVisible();
  const alive = onScreen && visible;

  const [phase, setPhase] = useState<SummonPhase>("ready");
  const [left, setLeft] = useState(0);

  const [questOn, setQuestOn] = useState(false);
  const [questLeft, setQuestLeft] = useState(QUEST_TIME);
  const [questResult, setQuestResult] = useState<null | boolean>(null);

  // SummonRoutine() — 유지 → 파괴 → 쿨타임 → 다시 가능
  useEffect(() => {
    if (phase === "ready" || !alive) return;
    if (left <= 0) {
      if (phase === "active") {
        setPhase("cooldown");
        setLeft(COOLDOWN);
        announce("소환물이 사라졌습니다. 쿨타임입니다.");
      } else {
        setPhase("ready");
        announce("다시 소환할 수 있습니다.");
      }
      return;
    }
    const t = window.setTimeout(() => setLeft(v => Math.max(0, v - 0.1)), 100);
    return () => window.clearTimeout(t);
  }, [phase, left, alive, announce]);

  // QuestTimer() — remainingTime -= Time.deltaTime
  useEffect(() => {
    if (!questOn || !alive) return;
    if (questLeft <= 0) {
      setQuestOn(false);
      setQuestResult(false);
      announce("제한 시간이 지나 퀘스트가 실패했습니다.");
      return;
    }
    const t = window.setTimeout(
      () => setQuestLeft(v => Math.max(0, v - 0.1)),
      100
    );
    return () => window.clearTimeout(t);
  }, [questOn, questLeft, alive, announce]);

  const summon = useCallback(() => {
    if (phase !== "ready") return;
    setPhase("active");
    setLeft(DURATION);
    announce("로봇을 소환했습니다.");
  }, [phase, announce]);

  const startQuest = useCallback(() => {
    setQuestOn(true);
    setQuestLeft(QUEST_TIME);
    setQuestResult(null);
    announce("돌발 퀘스트가 시작되었습니다.");
  }, [announce]);

  const clearQuest = useCallback(() => {
    setQuestOn(false);
    setQuestResult(true);
    announce("퀘스트를 완료했습니다.");
  }, [announce]);

  const summonPct =
    phase === "active"
      ? (left / DURATION) * 100
      : phase === "cooldown"
      ? (1 - left / COOLDOWN) * 100
      : 100;

  return (
    <Page index={10} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        10 · 이벤트 시스템
      </Kicker>

      <div className="mt-4">
        <Heading
          text="같은 전투가 반복되지 않게"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          웨이브만 계속 돌면 지루해집니다. 그래서 <strong>돌발 퀘스트</strong>와{" "}
          <strong>소환 스킬</strong>과 <strong>포탈</strong>을 얹어 루프를
          흔들었습니다. 셋 다 시간이 핵심이라 전부 코루틴으로 짰고, 남은 시간은
          반드시 화면에 띄웠습니다 — 안 보이면 판단할 수가 없으니까요.
        </Body>
      </div>

      <div
        ref={boxRef}
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-2"
        style={rise(on[IDX.demo], instant)}
      >
        {/* ── 소환 + 쿨타임 ── */}
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: "1px solid var(--aj-border)",
            background: "var(--aj-panel)"
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-muted)]">
              RobotSummoner
            </span>
            <span
              className="rounded px-2 py-0.5 font-mono text-[10px] font-black tabular-nums"
              style={{
                background:
                  phase === "ready"
                    ? "rgba(163,230,53,0.14)"
                    : phase === "active"
                    ? "rgba(125,211,252,0.16)"
                    : "rgba(251,191,36,0.16)",
                color:
                  phase === "ready"
                    ? "var(--aj-primary)"
                    : phase === "active"
                    ? "var(--aj-ray)"
                    : "var(--aj-warn)"
              }}
            >
              canSummon = {phase === "ready" ? "true" : "false"}
            </span>
          </div>

          <div
            className="relative flex h-[132px] items-center justify-center overflow-hidden rounded"
            style={{
              border: "1px solid rgba(163,230,53,0.22)",
              background: "#0e1406"
            }}
          >
            <div className="aj-grid absolute inset-0" aria-hidden="true" />
            {phase === "active" ? (
              <span
                className={`relative block h-12 w-12 rounded-sm ${
                  instant ? "" : "aj-pop"
                }`}
                style={{
                  background: "var(--aj-ray)",
                  boxShadow: "0 0 18px rgba(125,211,252,0.55)"
                }}
                aria-hidden="true"
              />
            ) : (
              <span className="relative font-mono text-[11px] text-[var(--aj-faint)]">
                {phase === "ready"
                  ? "소환할 수 있습니다"
                  : "쿨타임 — 잠시 기다려야 합니다"}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-[var(--aj-muted)]">
                {phase === "active"
                  ? "WaitForSeconds(duration)"
                  : phase === "cooldown"
                  ? "WaitForSeconds(cooldown)"
                  : "대기"}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-[var(--aj-accent)]">
                {phase === "ready" ? "준비 완료" : `${left.toFixed(1)}초`}
              </span>
            </div>
            <div className="aj-bar mt-1.5">
              <span
                style={{
                  width: `${summonPct}%`,
                  backgroundColor:
                    phase === "cooldown" ? "var(--aj-warn)" : "var(--aj-ray)",
                  transition: "width 0.1s linear"
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={summon}
            disabled={phase !== "ready"}
            className="cursor-pointer rounded-md px-4 py-3 font-mono text-[12px] font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45"
            style={{
              border: "1px solid rgba(163,230,53,0.45)",
              background: "rgba(163,230,53,0.14)",
              color: "var(--aj-accent)"
            }}
          >
            소환 (SummonRoutine)
          </button>
        </div>

        {/* ── 돌발 퀘스트 ── */}
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: `1px solid ${
              questResult === false
                ? "rgba(248,113,113,0.32)"
                : questResult
                ? "rgba(74,222,128,0.32)"
                : "var(--aj-border)"
            }`,
            background: "var(--aj-panel)"
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-muted)]">
              SpecialQuest
            </span>
            <span
              className="rounded px-2 py-0.5 font-mono text-[10px] font-black tabular-nums"
              style={{
                background: questOn
                  ? "rgba(251,191,36,0.16)"
                  : "rgba(255,255,255,0.06)",
                color: questOn ? "var(--aj-warn)" : "var(--aj-faint)"
              }}
            >
              {questOn ? `${Math.ceil(questLeft)}초` : "대기"}
            </span>
          </div>

          <div
            className="relative flex h-[132px] flex-col items-center justify-center gap-2 overflow-hidden rounded"
            style={{
              border: "1px solid rgba(163,230,53,0.22)",
              background: "#0e1406"
            }}
          >
            <div className="aj-grid absolute inset-0" aria-hidden="true" />
            {questOn ? (
              <>
                <span
                  className="relative font-mono text-[26px] font-black tabular-nums"
                  style={{
                    color:
                      questLeft < 6 ? "var(--aj-bad)" : "var(--aj-warn)"
                  }}
                >
                  {Math.ceil(questLeft)}초
                </span>
                <span className="relative font-mono text-[10px] text-[var(--aj-muted)]">
                  돌발 퀘스트 진행 중
                </span>
              </>
            ) : questResult === null ? (
              <span className="relative font-mono text-[11px] text-[var(--aj-faint)]">
                아직 퀘스트가 뜨지 않았습니다
              </span>
            ) : (
              <span
                className="relative font-mono text-[16px] font-black"
                style={{
                  color: questResult ? "var(--aj-ok)" : "var(--aj-bad)"
                }}
              >
                {questResult ? "QUEST CLEAR" : "EndQuest(false)"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startQuest}
              className="flex-1 cursor-pointer rounded-md px-3 py-3 font-mono text-[11px] font-bold transition-colors duration-200"
              style={{
                border: "1px solid rgba(251,191,36,0.45)",
                background: "rgba(251,191,36,0.12)",
                color: "var(--aj-warn)"
              }}
            >
              {questOn || questResult !== null ? "다시 시작" : "퀘스트 시작"}
            </button>
            <button
              type="button"
              onClick={clearQuest}
              disabled={!questOn}
              className="flex-1 cursor-pointer rounded-md px-3 py-3 font-mono text-[11px] font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                border: "1px solid rgba(74,222,128,0.45)",
                background: "rgba(74,222,128,0.10)",
                color: "var(--aj-ok)"
              }}
            >
              목표 완료
            </button>
          </div>

          <Hint>
            가만히 두시면 20초 뒤 <strong>EndQuest(false)</strong> 로 실패
            처리됩니다. 시간이 화면에 없으면 이 판단을 할 수가 없습니다.
          </Hint>
        </div>
      </div>

      {/* 코드 */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CodePanel
          filename="RobotSummoner.cs"
          badge={{text: "실제 코드", color: "var(--aj-ok)"}}
          borderColor="var(--aj-code-border)"
        >
          <div className="py-2">
            <CodeLine n={1}>
              <Cm>
                {"// desc: 소환 오브젝트를 일정 시간 유지하고 쿨타임 이후 재사용"}
              </Cm>
            </CodeLine>
            <CodeLine n={2}>{"IEnumerator SummonRoutine()"}</CodeLine>
            <CodeLine n={3}>{"{"}</CodeLine>
            <CodeLine n={4} highlight={phase !== "ready"}>
              {"  canSummon = false;"}
            </CodeLine>
            <CodeLine n={5} highlight={phase === "active"}>
              {"  GameObject robot = Instantiate(robotPrefab,"}
            </CodeLine>
            <CodeLine n={6} highlight={phase === "active"}>
              {"      summonPos.position, Quaternion.identity);"}
            </CodeLine>
            <CodeLine n={7} highlight={phase === "active"}>
              {"  yield return new WaitForSeconds(duration);"}
            </CodeLine>
            <CodeLine n={8}>{""}</CodeLine>
            <CodeLine n={9} highlight={phase === "cooldown"}>
              {"  Destroy(robot);"}
            </CodeLine>
            <CodeLine n={10} highlight={phase === "cooldown"}>
              {"  yield return new WaitForSeconds(cooldown);"}
            </CodeLine>
            <CodeLine n={11}>{""}</CodeLine>
            <CodeLine n={12} highlight={phase === "ready"}>
              {"  canSummon = true;"}
            </CodeLine>
            <CodeLine n={13}>{"}"}</CodeLine>
          </div>
        </CodePanel>

        <CodePanel
          filename="SpecialQuest.cs"
          badge={{text: "실제 코드", color: "var(--aj-ok)"}}
          borderColor="var(--aj-code-border)"
        >
          <div className="py-2">
            <CodeLine n={1}>
              <Cm>
                {"// desc: 제한 시간 동안 퀘스트를 진행하며 시간 초과 시 실패 처리"}
              </Cm>
            </CodeLine>
            <CodeLine n={2}>{"IEnumerator QuestTimer()"}</CodeLine>
            <CodeLine n={3}>{"{"}</CodeLine>
            <CodeLine n={4} highlight={questOn}>
              {"  while (remainingTime > 0f)"}
            </CodeLine>
            <CodeLine n={5}>{"  {"}</CodeLine>
            <CodeLine n={6} highlight={questOn}>
              {"    remainingTime -= Time.deltaTime;"}
            </CodeLine>
            <CodeLine n={7} highlight={questOn}>
              {"    timerText.text ="}
            </CodeLine>
            <CodeLine n={8} highlight={questOn}>
              {"        $\"{Mathf.CeilToInt(remainingTime)}초\";"}
            </CodeLine>
            <CodeLine n={9} highlight={questOn}>
              {"    yield return null;"}
            </CodeLine>
            <CodeLine n={10}>{"  }"}</CodeLine>
            <CodeLine n={11}>{""}</CodeLine>
            <CodeLine n={12} bad={questResult === false}>
              {"  EndQuest(false);"}
            </CodeLine>
            <CodeLine n={13}>{"}"}</CodeLine>
          </div>
        </CodePanel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
        <Card label="왜 코루틴인가" accent="var(--aj-primary)">
          <p className="text-[13px] leading-6">
            <strong>프레임 독립적</strong>이기 때문입니다. 프레임 수를 세면
            기기마다 시간이 달라지지만, <code>Time.deltaTime</code> 을 빼면 어느
            기기에서도 20초는 20초입니다.
          </p>
        </Card>
        <Shot
          src="/projects/ajou-adventure/quest-ui.webp"
          alt="돌발 퀘스트 알림 UI"
          caption="돌발 퀘스트 알림 — 제한 시간이 화면에 있어야 판단할 수 있다"
          w={461}
          h={250}
        />
      </div>
    </Page>
  );
}
