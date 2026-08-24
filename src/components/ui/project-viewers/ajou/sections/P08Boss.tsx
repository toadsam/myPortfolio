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
  Toggle,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 08 — 트러블슈팅 02 · 랜덤인데 불공평하지 않게
//
// 개발 실체: PDF 32쪽 「Core Dev #3」 후반 원문
//            랜덤 패턴 보스: 공격 전 **예고로 대응 가능성 확보**
//            이벤트 기반 판정: 애니메이션 타이밍에 맞춘 데미지 처리
//            Random.Range(1, 4) 로 3패턴 중 하나 선택, agent.isStopped = true
// 연출 장치: **관람객이 예고를 끄고 켜며 직접 보스를 상대한다.**
//            예고가 없으면 랜덤이 그냥 불공평해진다는 걸 몸으로 알게 된다.
//            (스펙 PAGE 08 의 「슬라이더로 깨졌다 고쳐진다」를 옮긴 것)
//
// 스펙의 모바일 해상도 스케일링은 이 프로젝트에 없어 쓰지 않는다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const PATTERNS = [
  {id: 1, name: "Attack1", tell: "발을 구른다", cover: "옆으로 피하세요"},
  {id: 2, name: "Attack2", tell: "팔을 든다", cover: "뒤로 물러나세요"},
  {id: 3, name: "Attack3", tell: "몸을 웅크린다", cover: "가까이 붙으세요"}
] as const;

type Phase = "idle" | "tell" | "hit";

export function P08Boss() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [telegraph, setTelegraph] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pattern, setPattern] = useState<(typeof PATTERNS)[number] | null>(null);
  const [dodged, setDodged] = useState(0);
  const [hit, setHit] = useState(0);
  const reacted = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const attack = useCallback(() => {
    clearTimers();
    reacted.current = false;
    const p = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    setPattern(p);

    // 예고가 켜져 있으면 0.8초 예고 뒤 판정, 꺼져 있으면 곧바로 판정.
    const lead = telegraph ? 800 : 90;
    setPhase("tell");
    announce(
      telegraph
        ? `보스가 ${p.tell}. ${p.cover}`
        : "보스가 예고 없이 공격했습니다."
    );

    timers.current.push(
      window.setTimeout(() => {
        setPhase("hit");
        if (reacted.current) {
          setDodged(n => n + 1);
          announce("회피했습니다.");
        } else {
          setHit(n => n + 1);
          announce("맞았습니다.");
        }
        timers.current.push(
          window.setTimeout(() => {
            setPhase("idle");
            setPattern(null);
          }, 700)
        );
      }, lead)
    );
  }, [telegraph, announce, clearTimers]);

  const dodge = useCallback(() => {
    if (phase !== "tell") return;
    reacted.current = true;
  }, [phase]);

  return (
    <Page index={8} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant} color="var(--aj-bad)">
        08 · 트러블슈팅 02
      </Kicker>

      <div className="mt-4">
        <Heading
          text="랜덤은 재미있지만 불공평합니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          보스가 세 패턴 중 하나를 무작위로 고르게 하면 전투가 매번 달라집니다.
          그런데 <strong style={{color: "var(--aj-bad)"}}>예고가 없으면</strong>{" "}
          플레이어는 전략을 세울 수가 없고, 그냥 운으로 맞습니다. 아래에서 예고를
          꺼 보시면 차이가 바로 느껴집니다.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: `1px solid ${
              telegraph ? "rgba(163,230,53,0.26)" : "rgba(248,113,113,0.32)"
            }`,
            background: "var(--aj-panel)"
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-muted)]">
              BossMonster
            </span>
            <span className="font-mono text-[11px] tabular-nums">
              <span style={{color: "var(--aj-ok)"}}>회피 {dodged}</span>
              <span style={{color: "var(--aj-faint)"}}> · </span>
              <span style={{color: "var(--aj-bad)"}}>피격 {hit}</span>
            </span>
          </div>

          {/* 전투 화면 */}
          <div
            className="aj-crtglow relative overflow-hidden rounded"
            style={{
              border: "1px solid rgba(163,230,53,0.22)",
              background: "#0e1406",
              aspectRatio: "16 / 9"
            }}
          >
            <div className="aj-grid absolute inset-0" aria-hidden="true" />
            <div className="aj-scan absolute inset-0" aria-hidden="true" />

            {/* 보스 */}
            <span
              className="absolute left-1/2 top-[34%] block h-14 w-14 rounded-sm transition-colors duration-200"
              style={{
                transform: "translate(-50%, -50%)",
                background:
                  phase === "hit"
                    ? "var(--aj-bad)"
                    : phase === "tell"
                    ? "var(--aj-warn)"
                    : "rgba(163,230,53,0.5)"
              }}
              aria-hidden="true"
            />

            {/* 예고 게이지 */}
            {phase === "tell" && telegraph ? (
              <div
                className="absolute left-1/2 top-[58%] h-1.5 w-[46%] overflow-hidden rounded-full"
                style={{
                  transform: "translateX(-50%)",
                  background: "rgba(255,255,255,0.10)"
                }}
                aria-hidden="true"
              >
                <span
                  className={instant ? "" : "aj-tell"}
                  style={{
                    display: "block",
                    height: "100%",
                    background: "var(--aj-warn)"
                  }}
                />
              </div>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 p-2.5">
              <p
                className="font-mono text-[11px]"
                style={{
                  color:
                    phase === "hit"
                      ? "var(--aj-bad)"
                      : phase === "tell"
                      ? "var(--aj-warn)"
                      : "var(--aj-faint)"
                }}
              >
                {phase === "idle"
                  ? "보스가 대기 중입니다"
                  : phase === "tell"
                  ? telegraph
                    ? `${pattern?.tell} — ${pattern?.cover}`
                    : "…"
                  : reacted.current
                  ? `회피 성공 (${pattern?.name})`
                  : `피격 (${pattern?.name})`}
              </p>
            </div>
          </div>

          <Toggle
            on={telegraph}
            onToggle={() => {
              setTelegraph(v => !v);
              setDodged(0);
              setHit(0);
            }}
            title="공격 전 예고"
            note="0.8초 동안 무슨 패턴인지 알려준다"
            onColor="var(--aj-ok)"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={attack}
              disabled={phase !== "idle"}
              className="flex-1 cursor-pointer rounded-md px-4 py-3 font-mono text-[12px] font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                border: "1px solid rgba(248,113,113,0.5)",
                background: "rgba(248,113,113,0.14)",
                color: "var(--aj-bad)"
              }}
            >
              보스 공격 (PerformRandomAttack)
            </button>
            <button
              type="button"
              onClick={dodge}
              disabled={phase !== "tell"}
              className="flex-1 cursor-pointer rounded-md px-4 py-3 font-mono text-[12px] font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                border: "1px solid rgba(163,230,53,0.45)",
                background: "rgba(163,230,53,0.14)",
                color: "var(--aj-accent)"
              }}
            >
              회피
            </button>
          </div>

          <p
            className="font-mono text-[11px] leading-5"
            style={{color: telegraph ? "var(--aj-ok)" : "var(--aj-bad)"}}
          >
            {telegraph
              ? "예고가 있으면 랜덤이 「대응할 수 있는 변수」가 됩니다."
              : "예고가 없으면 회피 버튼을 누를 시간이 없습니다 — 이게 처음 상태였습니다."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <CodePanel
            filename="BossMonster.cs"
            badge={{text: "실제 코드", color: "var(--aj-ok)"}}
            borderColor="var(--aj-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>
                  {"// desc: 보스가 공격 시 3가지 패턴 중 하나를 랜덤으로 선택"}
                </Cm>
              </CodeLine>
              <CodeLine n={2}>{"void PerformRandomAttack()"}</CodeLine>
              <CodeLine n={3}>{"{"}</CodeLine>
              <CodeLine n={4} highlight={phase !== "idle"}>
                {"  int attackType = Random.Range(1, 4);"}
              </CodeLine>
              <CodeLine n={5}>{""}</CodeLine>
              <CodeLine n={6} highlight={phase !== "idle"}>
                {"  isAttacking = true;"}
              </CodeLine>
              <CodeLine n={7} highlight={phase !== "idle"}>
                {"  agent.isStopped = true;"}
              </CodeLine>
              <CodeLine n={8}>{""}</CodeLine>
              <CodeLine n={9} highlight={pattern?.id === 1}>
                {"  if (attackType == 1)"}
              </CodeLine>
              <CodeLine n={10} highlight={pattern?.id === 1}>
                {"    animator.SetTrigger(\"Attack1\");"}
              </CodeLine>
              <CodeLine n={11} highlight={pattern?.id === 2}>
                {"  else if (attackType == 2)"}
              </CodeLine>
              <CodeLine n={12} highlight={pattern?.id === 2}>
                {"    animator.SetTrigger(\"Attack2\");"}
              </CodeLine>
              <CodeLine n={13} highlight={pattern?.id === 3}>
                {"  else"}
              </CodeLine>
              <CodeLine n={14} highlight={pattern?.id === 3}>
                {"    animator.SetTrigger(\"Attack3\");"}
              </CodeLine>
              <CodeLine n={15}>{"}"}</CodeLine>
            </div>
          </CodePanel>

          <Card label="이벤트 기반 판정" accent="var(--aj-primary)">
            <p className="text-[13px] leading-6">
              데미지는 버튼을 누른 프레임이 아니라{" "}
              <strong>애니메이션의 타격 프레임</strong>에서 처리합니다. 그래야
              화면에서 보이는 것과 실제 판정이 어긋나지 않습니다.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-4">
        <Hint>
          <strong>agent.isStopped = true</strong> 한 줄이 중요한 이유 — 공격
          모션 중에 NavMesh 가 계속 밀고 들어오면, 예고를 보고 피해도 보스가
          따라와서 맞습니다.
        </Hint>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Shot
          src="/projects/ajou-adventure/boss-appear.webp"
          alt="보스 등장 화면"
          caption="보스 등장 화면"
          w={454}
          h={248}
        />
        <Shot
          src="/projects/ajou-adventure/boss-ui.webp"
          alt="보스 등장 UI"
          caption="보스 등장 UI — 지금 무엇과 싸우는지 먼저 알린다"
          w={448}
          h={216}
        />
        <Shot
          src="/projects/ajou-adventure/code-boss.webp"
          alt="BossMonster.cs 전체 코드"
          caption="Random.Range(1, 4) 와 isStopped 두 줄"
          w={1600}
          h={917}
        />
      </div>
    </Page>
  );
}
