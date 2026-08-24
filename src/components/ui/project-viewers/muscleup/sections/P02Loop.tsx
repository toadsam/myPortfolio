"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {LEVELUP_KEY, useMuscleUp} from "../context";
import {
  Body,
  Card,
  Cm,
  CodeLine,
  CodePanel,
  FlowNode,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 02 — 기록하면 뭔가 일어난다 · 서비스 루프
//
// 개발 실체: PDF 7쪽 「해결 전략」의 실제 루프
//            체성 입력 → AI 분석 → 4주 루틴 → 히스토리 저장 → 커뮤니티 공유
// 연출 장치: **관람객이 직접 루프를 한 바퀴 돌린다** → 마지막에 레벨업이 터지고
//            그 다음 그 흐름을 만드는 실제 서버 코드가 옆에 나타난다
//
// ⚠️ 레벨업 연출은 **세션당 1회**(스펙 A-8). 전체 화면 플래시 금지, 파티클 18개 이하.
//
// 스펙의 「출석 → 퀘스트 → EXP」 게임화 루프는 PDF 에 근거가 없어 쓰지 않는다.
// 대신 PDF 에 적힌 진짜 루프를 같은 연출 장치에 실었다.

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, loop: 3, hook: 4};

// PDF 7쪽 Solution + 9쪽 핵심 기능(2/2) 원문에서 뽑은 5단계.
const LOOP = [
  {
    key: "input",
    title: "체성 정보 입력",
    sub: "키 · 체중 · 목표",
    log: "POST /ai/analyze",
    say: "사용자가 지금 상태와 목표를 넣습니다."
  },
  {
    key: "analyze",
    title: "AI 분석",
    sub: "systemPromptForCoach()",
    log: "AiController.analyze()",
    say: "코치 역할 프롬프트로 현재 상태를 해석합니다."
  },
  {
    key: "plan",
    title: "4주 루틴 생성",
    sub: "systemPromptForPlanner()",
    log: "POST /ai/plan",
    say: "역할을 나눈 두 번째 엔드포인트가 계획을 만듭니다."
  },
  {
    key: "save",
    title: "히스토리 저장",
    sub: "ai_chat_messages",
    log: "AiChatHistoryService.save()",
    say: "맥락이 남아야 다음 대화가 이어집니다."
  },
  {
    key: "share",
    title: "커뮤니티 공유",
    sub: "share / unshare 토글",
    log: "share_slug = UUID",
    say: "혼자 하면 지속률이 낮다 — 그래서 공유가 루프의 끝입니다."
  }
] as const;

export function P02Loop() {
  const {reducedMotion, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [step, setStep] = useState(-1);
  const [levelUp, setLevelUp] = useState(false);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(LEVELUP_KEY)) setFired(true);
    } catch {
      /* 무시 */
    }
  }, []);

  const advance = useCallback(() => {
    setStep(prev => {
      const next = prev + 1;
      if (next >= LOOP.length) return prev;
      announce(`${LOOP[next].title} 단계로 넘어갔습니다.`);

      // 루프를 한 바퀴 돌면 레벨업. 세션당 한 번만.
      if (next === LOOP.length - 1) {
        setFired(already => {
          if (already || reducedMotion) return already;
          setLevelUp(true);
          window.setTimeout(() => setLevelUp(false), 1900);
          try {
            window.sessionStorage.setItem(LEVELUP_KEY, "1");
          } catch {
            /* 무시 */
          }
          return true;
        });
      }
      return next;
    });
  }, [announce, reducedMotion]);

  const reset = useCallback(() => {
    setStep(-1);
    announce("루프를 처음으로 되돌렸습니다.");
  }, [announce]);

  const done = step >= LOOP.length - 1;

  return (
    <Page index={2} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        02 · 서비스 루프
      </Kicker>

      <div className="mt-4">
        <Heading
          text="저장이 아니라 한 바퀴를 만들었습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          운동 앱은 많고 대부분 기록을 <strong>저장만</strong> 합니다. 저장은
          다음 행동을 만들지 않습니다. 그래서 득근득근은 입력 하나가{" "}
          <strong style={{color: "var(--mu-accent)"}}>
            분석 → 루틴 → 기록 → 공유
          </strong>
          까지 굴러가게 만들었습니다. 아래에서 직접 한 바퀴 돌려 보세요.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.loop], instant)}
      >
        {/* ── 관람객이 돌리는 루프 ── */}
        <div
          className="relative flex flex-col gap-3 rounded-md p-5"
          style={{
            border: "1px solid var(--mu-border)",
            background: "var(--mu-panel)",
            minHeight: "460px"
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--mu-muted)]">
              LOOP
            </span>
            <span className="font-mono text-[11px] tabular-nums text-[var(--mu-accent)]">
              {Math.max(0, step + 1)} / {LOOP.length}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            {LOOP.map((s, i) => (
              <FlowNode
                key={s.key}
                title={`${i + 1}. ${s.title}`}
                sub={i <= step ? s.say : s.sub}
                active={i === step}
                done={i < step}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={advance}
              disabled={done}
              className="cursor-pointer rounded-md px-4 py-2.5 font-mono text-[12px] font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                border: "1px solid rgba(244,114,182,0.45)",
                background: "rgba(244,114,182,0.14)",
                color: "var(--mu-accent)"
              }}
            >
              {step < 0 ? "루프 돌려보기 ▶" : done ? "한 바퀴 끝" : "다음 단계 ▶"}
            </button>
            {step >= 0 ? (
              <button
                type="button"
                onClick={reset}
                className="cursor-pointer rounded-md px-3 py-2.5 font-mono text-[11px] transition-colors duration-200"
                style={{
                  border: "1px solid var(--mu-border)",
                  color: "var(--mu-muted)"
                }}
              >
                되돌리기
              </button>
            ) : null}
            <span className="font-mono text-[10px] text-[var(--mu-faint)]">
              {step >= 0 ? LOOP[step].log : "아직 아무 요청도 나가지 않았습니다"}
            </span>
          </div>

          {/* 레벨업 — 화면 일부에만, 세션당 1회 */}
          {levelUp ? (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 rounded-md"
                style={{background: "rgba(244,114,182,0.22)"}}
              />
              <div className="mu-levelup relative flex flex-col items-center gap-2">
                <span
                  className="font-mono text-[28px] font-black tracking-[0.2em]"
                  style={{color: "var(--mu-warn)"}}
                >
                  LEVEL UP
                </span>
                <span className="font-mono text-[11px] text-[var(--mu-text)]">
                  루프가 한 바퀴 돌았습니다
                </span>
              </div>
              {Array.from({length: 14}).map((_, i) => (
                <span
                  key={i}
                  className="mu-particle absolute block h-1.5 w-1.5 rounded-full"
                  style={
                    {
                      background: i % 2 ? "var(--mu-accent)" : "var(--mu-warn)",
                      left: `${12 + i * 5.6}%`,
                      top: "56%",
                      "--dx": `${(i % 5) * 8 - 16}px`,
                      "--dy": `${-30 - (i % 4) * 14}px`,
                      animationDelay: `${i * 40}ms`
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* ── 그 흐름을 만드는 실제 코드 ── */}
        <CodePanel
          filename="AiController.java · AiChatHistoryService.java"
          badge={{text: "실제 코드", color: "var(--mu-ok)"}}
          borderColor="var(--mu-code-border)"
          className="min-h-[460px]"
        >
          <div className="py-2">
            <CodeLine n={1}>
              <Cm>{"// desc: 체성문 분석 + 4주 루틴 생성"}</Cm>
            </CodeLine>
            <CodeLine n={2} highlight={step >= 1}>
              {"@PostMapping(\"/analyze\")"}
            </CodeLine>
            <CodeLine n={3} highlight={step >= 1}>
              {"  String content = aiService.requestCompletion("}
            </CodeLine>
            <CodeLine n={4} highlight={step >= 1}>
              {"      systemPromptForCoach(), prompt);"}
            </CodeLine>
            <CodeLine n={5} highlight={step >= 3}>
              {"  aiChatHistoryService.save(userEmail,"}
            </CodeLine>
            <CodeLine n={6} highlight={step >= 3}>
              {"      AiMessageType.ANALYZE, prompt, content);"}
            </CodeLine>
            <CodeLine n={7}>{""}</CodeLine>
            <CodeLine n={8} highlight={step >= 2}>
              {"@PostMapping(\"/plan\")"}
            </CodeLine>
            <CodeLine n={9} highlight={step >= 2}>
              {"  String content = aiService.requestCompletion("}
            </CodeLine>
            <CodeLine n={10} highlight={step >= 2}>
              {"      systemPromptForPlanner(), prompt);"}
            </CodeLine>
            <CodeLine n={11} highlight={step >= 3}>
              {"  aiChatHistoryService.save(userEmail,"}
            </CodeLine>
            <CodeLine n={12} highlight={step >= 3}>
              {"      AiMessageType.PLAN, prompt, content);"}
            </CodeLine>
            <CodeLine n={13}>{""}</CodeLine>
            <CodeLine n={14}>
              <Cm>{"// desc: 히스토리 저장 + 공유 토글"}</Cm>
            </CodeLine>
            <CodeLine n={15} highlight={step >= 4}>
              {"public AiShareResponse share(String email, Long id) {"}
            </CodeLine>
            <CodeLine n={16} highlight={step >= 4}>
              {"  message.setShared(true);"}
            </CodeLine>
            <CodeLine n={17} highlight={step >= 4}>
              {"  message.setShareSlug(UUID.randomUUID()"}
            </CodeLine>
            <CodeLine n={18} highlight={step >= 4}>
              {"      .toString().replace(\"-\", \"\"));"}
            </CodeLine>
            <CodeLine n={19}>{"}"}</CodeLine>
          </div>
        </CodePanel>
      </div>

      <div className="mt-4">
        <Hint>
          {step < 0
            ? "버튼을 누르면 왼쪽 단계가 하나씩 켜지고, 오른쪽에서 그 단계를 담당하는 코드 줄에 불이 들어옵니다."
            : `지금 켜진 코드가 「${LOOP[step].title}」을 담당합니다.`}
        </Hint>
      </div>

      {/* 다음 장으로 넘기는 갈고리 */}
      <div className="mt-9" style={rise(on[IDX.hook], instant)}>
        <Panel label="그런데">
          <Body>
            이 루프는 <strong>로그인한 사람만</strong> 돌릴 수 있습니다. 그리고
            로그인 상태를 유지하는 토큰은, 한 번 탈취되면 그 사람 행세를 계속할
            수 있는 물건입니다. 다음 장은{" "}
            <strong style={{color: "var(--mu-accent)"}}>
              그 토큰을 직접 훔쳐 보시는
            </strong>{" "}
            장입니다.
          </Body>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card label="전략 01" accent="var(--mu-primary)">
          <p className="text-[13px] leading-6">
            AI 기반 개인 맞춤 운동 루틴 — 수준·목표·신체 데이터를 분석해 루틴을
            만든다
          </p>
        </Card>
        <Card label="전략 02" accent="var(--mu-accent)">
          <p className="text-[13px] leading-6">
            성과 공유 중심 커뮤니티 — 기록 공유와 소셜 인터랙션으로 지속률을
            올린다
          </p>
        </Card>
        <Card label="전략 03" accent="var(--mu-warn)">
          <p className="text-[13px] leading-6">
            초보자 기준 UX — 정보 과부하를 줄여 처음 오는 사람이 멈추지 않게
            한다
          </p>
        </Card>
      </div>
    </Page>
  );
}
