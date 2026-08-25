"use client";

import {useCallback, useRef, useState} from "react";
import {useFestFlow} from "../context";
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
  Toggle,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 07 — 트러블슈팅 · 남의 서버가 죽어도 축제는 계속된다
//
// 개발 실체: 발표자료 10장 「예외 / 대안 흐름」, 17장 alt [Failure] 분기,
//            23장 PB-20 「외부 API 실패 시 fallback 유지」(Must · 5SP),
//            26장 「fallback 정비」 원문
//   · GPS 데이터가 부족하면 최근 데이터 또는 부분 정보로 제한적으로 분석한다
//   · Python 모델 실행이 실패하면 portable / 규칙 기반 fallback 을 사용한다
//   · 일부 스냅샷 데이터가 비어 있어도 가능한 정보만 반영해 결과를 생성한다
//   · OpenAI 응답 생성이 실패하면 ChatService 가 createFallback(evidence) 로 대체 답변
// 연출 장치: **관람객이 외부 의존을 하나씩 죽여 본다.** 그래도 화면은 안 죽는다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

type Tier = "model" | "portable" | "rule" | "dead";

export function P07Fallback() {
  const {reducedMotion, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [pyDown, setPyDown] = useState(false);
  const [portableDown, setPortableDown] = useState(false);
  const [gpsThin, setGpsThin] = useState(false);
  const [openAiDown, setOpenAiDown] = useState(false);
  const [guard, setGuard] = useState(true);

  const tier: Tier = !guard
    ? pyDown
      ? "dead"
      : "model"
    : !pyDown
    ? "model"
    : !portableDown
    ? "portable"
    : "rule";

  const TIER_META: Record<
    Tier,
    {label: string; color: string; say: string; quality: string}
  > = {
    model: {
      label: "RandomForest 예측",
      color: "var(--ff-live)",
      say: "정상 경로입니다. 24개 feature 로 30분 뒤를 예측합니다.",
      quality: "정확도 최상"
    },
    portable: {
      label: "portable 모델",
      color: "var(--ff-ray)",
      say: "Python 실행이 막혔습니다. 이식용 모델로 같은 예측을 이어갑니다.",
      quality: "정확도 유지"
    },
    rule: {
      label: "규칙 기반 fallback",
      color: "var(--ff-stale)",
      say: "모델을 못 씁니다. 현재 값만으로 규칙 계산해 등급을 냅니다.",
      quality: "예측은 못 하지만 현재 혼잡도는 나온다"
    },
    dead: {
      label: "화면 정지",
      color: "var(--ff-down)",
      say: "폴백이 없으면 여기서 끝입니다. 축제장에서 이건 사고입니다.",
      quality: "서비스 중단"
    }
  };

  const meta = TIER_META[tier];

  const kill = useCallback(
    (name: string, next: boolean) => {
      announce(next ? `${name}을(를) 죽였습니다.` : `${name}을(를) 살렸습니다.`);
    },
    [announce]
  );

  return (
    <Page index={7} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant} color="var(--ff-down)">
        07 · 폴백
      </Kicker>

      <div className="mt-4">
        <Heading
          text="축제 당일에는 고칠 시간이 없습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          AI 기능은 전부 <strong>남의 서버</strong>에 기대고 있습니다 — OpenAI,
          Python 모델 프로세스, GPS 로그. 이게 하루짜리 축제 당일에 죽으면 고칠
          시간이 없습니다. 그래서{" "}
          <strong style={{color: "var(--ff-accent)"}}>
            죽는 걸 전제로
          </strong>{" "}
          설계했습니다. 아래에서 하나씩 죽여 보세요.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-3.5 rounded-md p-5"
          style={{
            border: `1px solid ${meta.color}`,
            background: "var(--ff-panel)"
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
              CHAOS PANEL
            </span>
            <span
              className="rounded px-2 py-0.5 font-mono text-[10px] font-black"
              style={{
                background: `color-mix(in srgb, ${meta.color} 20%, transparent)`,
                color: meta.color
              }}
            >
              {meta.quality}
            </span>
          </div>

          <Toggle
            on={pyDown}
            onToggle={() => {
              setPyDown(v => !v);
              kill("Python 모델 프로세스", !pyDown);
            }}
            title="Python 모델 프로세스 죽이기"
            note="predict() 실행 실패"
            onColor="var(--ff-down)"
          />
          <Toggle
            on={portableDown}
            onToggle={() => {
              setPortableDown(v => !v);
              kill("portable 모델", !portableDown);
            }}
            title="portable 모델도 죽이기"
            note="predictBatchPortable() 실패"
            onColor="var(--ff-down)"
          />
          <Toggle
            on={gpsThin}
            onToggle={() => {
              setGpsThin(v => !v);
              kill("GPS 로그", !gpsThin);
            }}
            title="GPS 로그 끊기"
            note="위치 데이터가 부족한 상태"
            onColor="var(--ff-down)"
          />
          <Toggle
            on={openAiDown}
            onToggle={() => {
              setOpenAiDown(v => !v);
              kill("OpenAI", !openAiDown);
            }}
            title="OpenAI 응답 실패"
            note="챗봇 · 가이드 · 공지 초안"
            onColor="var(--ff-down)"
          />

          <div
            className="mt-1 rounded-md p-4"
            style={{
              border: `1px solid ${meta.color}`,
              background: `color-mix(in srgb, ${meta.color} 8%, transparent)`
            }}
          >
            <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--ff-muted)]">
              지금 화면이 쓰는 경로
            </div>
            <div
              className="mt-1.5 font-mono text-[15px] font-black"
              style={{color: meta.color}}
            >
              {meta.label}
            </div>
            <p className="mt-2 text-[12px] leading-6 text-[var(--ff-muted)]">
              {meta.say}
            </p>

            {gpsThin && tier !== "dead" ? (
              <p
                className="mt-2 font-mono text-[10px] leading-4"
                style={{color: "var(--ff-stale)"}}
              >
                · GPS 부족 → 최근 데이터 / 부분 정보로 제한적으로 분석합니다
              </p>
            ) : null}
            {openAiDown ? (
              <p
                className="mt-1 font-mono text-[10px] leading-4"
                style={{color: "var(--ff-stale)"}}
              >
                · 챗봇은 createFallback(evidence) 로 근거만 정리해 답합니다
              </p>
            ) : null}
          </div>

          <Toggle
            on={guard}
            onToggle={() => setGuard(v => !v)}
            title="폴백 켜기 / 끄기"
            note="꺼 보면 이 설계가 왜 필요했는지 보입니다"
            onColor="var(--ff-live)"
          />
        </div>

        <div className="flex flex-col gap-3">
          {/* 3층 사다리 */}
          <div
            className="rounded-md p-4"
            style={{
              border: "1px solid var(--ff-border)",
              background: "var(--ff-panel)"
            }}
          >
            <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--ff-muted)]">
              내려가는 사다리
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {(
                [
                  ["model", "① Python + .pkl 모델", "정상 예측"],
                  ["portable", "② portable 모델", "이식용 경로로 우회"],
                  ["rule", "③ 규칙 기반 계산", "예측은 포기, 현재값은 지킨다"]
                ] as const
              ).map(([k, t, d]) => {
                const lit = tier === k;
                const passed =
                  (k === "model" && tier !== "model") ||
                  (k === "portable" && tier === "rule");
                return (
                  <div
                    key={k}
                    className="rounded px-3 py-2.5 transition-[border-color,background-color] duration-300"
                    style={{
                      border: `1px solid ${
                        lit
                          ? TIER_META[k].color
                          : passed
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.12)"
                      }`,
                      background: lit
                        ? `color-mix(in srgb, ${TIER_META[k].color} 12%, transparent)`
                        : "transparent",
                      opacity: passed ? 0.4 : 1
                    }}
                  >
                    <div
                      className="font-mono text-[11px] font-bold"
                      style={{
                        color: lit ? TIER_META[k].color : "var(--ff-muted)"
                      }}
                    >
                      {passed ? "✕ " : lit ? "▶ " : ""}
                      {t}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-[var(--ff-faint)]">
                      {d}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <CodePanel
            filename="PythonCongestionModelService · ChatService"
            badge={{text: "실제 클래스", color: "var(--ff-primary)"}}
            borderColor="var(--ff-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>{"// 모델 실행이 실패하면 이식용 경로로 내려간다"}</Cm>
              </CodeLine>
              <CodeLine n={2}>{"try {"}</CodeLine>
              <CodeLine n={3} highlight={tier === "model"}>
                {"  return predictBatch(requests);"}
              </CodeLine>
              <CodeLine n={4}>{"} catch (Exception e) {"}</CodeLine>
              <CodeLine n={5} highlight={tier === "portable"}>
                {"  return predictBatchPortable(requests);"}
              </CodeLine>
              <CodeLine n={6}>{"}"}</CodeLine>
              <CodeLine n={7}>{""}</CodeLine>
              <CodeLine n={8}>
                <Cm>{"// 그것도 안 되면 규칙으로 등급만 낸다"}</Cm>
              </CodeLine>
              <CodeLine n={9} highlight={tier === "rule"} bad={tier === "dead"}>
                {"if (predictions.isEmpty()) return ruleBased(snapshot);"}
              </CodeLine>
              <CodeLine n={10}>{""}</CodeLine>
              <CodeLine n={11}>
                <Cm>{"// 챗봇도 같은 규칙 — 답이 없으면 근거만이라도 준다"}</Cm>
              </CodeLine>
              <CodeLine n={12} highlight={openAiDown}>
                {"catch (OpenAiException e) {"}
              </CodeLine>
              <CodeLine n={13} highlight={openAiDown}>
                {"  return buildResponse(createFallback(evidence), evidence);"}
              </CodeLine>
              <CodeLine n={14}>{"}"}</CodeLine>
            </div>
          </CodePanel>
        </div>
      </div>

      <div className="mt-4">
        <Hint>
          &ldquo;폴백 끄기&rdquo;를 누르고 Python 모델을 죽여 보시면, 폴백이 없을
          때 축제 당일에 무슨 일이 벌어지는지 보입니다.
        </Hint>
      </div>

      <div className="mt-9 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card label="원칙 01" accent="var(--ff-primary)">
          <p className="text-[13px] leading-6">
            <strong>일부 데이터가 비어 있어도</strong> 가능한 정보만 반영해 결과를
            만든다. 전부 있어야만 동작하는 기능은 현장에서 안 돌아간다.
          </p>
        </Card>
        <Card label="원칙 02" accent="var(--ff-accent)">
          <p className="text-[13px] leading-6">
            AI 가 실패해도 <strong>서비스의 뼈대는 그대로</strong> 돈다. 지도 ·
            부스 · 예약 · QR 체크인은 AI 와 무관하게 동작한다.
          </p>
        </Card>
        <Card label="원칙 03" accent="var(--ff-live)">
          <p className="text-[13px] leading-6">
            폴백은 나중에 붙이는 게 아니라{" "}
            <strong>백로그에 Must 로 올려 둔</strong> 항목이었다 (PB-20 · 5 SP).
          </p>
        </Card>
      </div>
    </Page>
  );
}
