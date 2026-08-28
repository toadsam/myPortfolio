"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useMuscleUp} from "../context";
import {
  Body,
  Caveat,
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
import {useOnScreen, usePageVisible, useTimeline} from "../../_kit/useTimeline";

// PAGE 07 — AI 피트니스 코치 · 입력 한 번에서 4주 루틴까지
//
// 개발 실체: PDF 9쪽 「AI 피트니스 코치」 원문
//            Endpoints: /ai/analyze, /ai/plan, /ai/chat — 역할 분리로 유지보수성 확보
//            State: 채팅 히스토리를 DB 에 저장해 맥락 유지, 공유는 share/unshare 토글
//            UX: "추천 → 수정 → 저장" 흐름
// 연출 장치: 4단계가 눈앞에서 순차 실행됨 (스펙 PAGE 07 그대로)
//
// 스펙의 「사진 한 장 업로드 → 인바디 파싱」은 PDF 에 근거가 없어 쓰지 않는다.
// PDF 의 실제 입력은 사진이 아니라 키·체중·목표 같은 수치다.

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, pipe: 3, shots: 4};

const STAGES = [
  {
    key: "input",
    title: "① 입력",
    endpoint: "폼",
    detail: "키 · 체중 · 체성 수치 · 목표",
    code: "buildAnalysisPrompt(req)"
  },
  {
    key: "analyze",
    title: "② 분석",
    endpoint: "POST /ai/analyze",
    detail: "코치 역할 프롬프트로 현재 상태를 해석",
    code: "requestCompletion(systemPromptForCoach(), prompt)"
  },
  {
    key: "plan",
    title: "③ 4주 루틴",
    endpoint: "POST /ai/plan",
    detail: "플래너 역할 프롬프트로 4주 계획을 생성",
    code: "requestCompletion(systemPromptForPlanner(), prompt)"
  },
  {
    key: "save",
    title: "④ 저장 · 공유",
    endpoint: "ai_chat_messages",
    detail: "히스토리를 남겨 맥락 유지 · share/unshare 토글",
    code: "setShareSlug(UUID.randomUUID()...)"
  }
] as const;

export function P07AiCoach() {
  const {reducedMotion, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const boxRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(boxRef, 0.2);
  const visible = usePageVisible();

  const [stage, setStage] = useState(-1);
  const [running, setRunning] = useState(false);

  // 파이프라인은 화면 밖이거나 탭이 숨겨지면 즉시 멈춘다(스펙 A-8).
  useEffect(() => {
    if (!running || !onScreen || !visible) return;
    if (stage >= STAGES.length - 1) {
      setRunning(false);
      return;
    }
    const t = window.setTimeout(() => setStage(s => s + 1), 900);
    return () => window.clearTimeout(t);
  }, [running, onScreen, visible, stage]);

  const run = useCallback(() => {
    setStage(0);
    setRunning(true);
    announce("AI 파이프라인을 실행합니다.");
  }, [announce]);

  return (
    <Page index={8} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        08 · AI 코치
      </Kicker>

      <div className="mt-4">
        <Heading
          text="엔드포인트를 셋으로 쪼갠 이유"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          한 엔드포인트가 분석도 하고 루틴도 짜고 상담도 받으면, 프롬프트를 한
          줄 고칠 때마다 나머지 둘이 같이 흔들립니다. 그래서{" "}
          <strong style={{color: "var(--mu-accent)"}}>
            /ai/analyze · /ai/plan · /ai/chat
          </strong>{" "}
          으로 <strong>역할을 나눴습니다.</strong> 각자 다른 시스템 프롬프트를
          쓰고, 결과는 전부 같은 히스토리 테이블에 쌓입니다.
        </Body>
      </div>

      <div
        ref={boxRef}
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.pipe], instant)}
      >
        <div
          className="flex flex-col gap-3 rounded-md p-5"
          style={{
            border: "1px solid var(--mu-border)",
            background: "var(--mu-panel)"
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--mu-muted)]">
              PIPELINE
            </span>
            <button
              type="button"
              onClick={run}
              className="cursor-pointer rounded px-3 py-1.5 font-mono text-[11px] font-bold transition-colors duration-200"
              style={{
                border: "1px solid rgba(244,114,182,0.45)",
                background: "rgba(244,114,182,0.14)",
                color: "var(--mu-accent)"
              }}
            >
              {stage < 0 ? "실행 ▶" : "다시 실행 ↻"}
            </button>
          </div>

          {STAGES.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            const lit = done || active;
            return (
              <div
                key={s.key}
                className="rounded-md p-3.5 transition-[border-color,background-color,box-shadow] duration-300"
                style={{
                  border: `1px solid ${
                    lit ? "var(--mu-primary)" : "rgba(255,255,255,0.10)"
                  }`,
                  background: lit
                    ? "rgba(244,114,182,0.08)"
                    : "rgba(255,255,255,0.02)",
                  boxShadow: active ? "0 0 14px rgba(244,114,182,0.28)" : "none"
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-mono text-[12px] font-bold"
                    style={{
                      color: lit ? "var(--mu-primary)" : "var(--mu-muted)"
                    }}
                  >
                    {done ? "✓ " : ""}
                    {s.title}
                  </span>
                  <span
                    className="font-mono text-[10px]"
                    style={{
                      color: lit ? "var(--mu-accent)" : "var(--mu-faint)"
                    }}
                  >
                    {s.endpoint}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-5 text-[var(--mu-muted)]">
                  {s.detail}
                </p>
                {lit ? (
                  <p className="mt-1.5 break-all font-mono text-[10px] text-[var(--mu-faint)]">
                    {s.code}
                  </p>
                ) : null}
              </div>
            );
          })}

          <Hint>
            {stage < 0
              ? "실행을 누르면 네 단계가 순서대로 켜집니다."
              : stage >= STAGES.length - 1
              ? "여기까지가 한 번의 상담입니다. 히스토리가 남았으니 다음 대화는 맥락을 이어갑니다."
              : "진행 중… (화면 밖으로 나가면 자동으로 멈춥니다)"}
          </Hint>
        </div>

        <CodePanel
          filename="AiController.java · AiService.java"
          badge={{text: "실제 코드", color: "var(--mu-ok)"}}
          borderColor="var(--mu-code-border)"
        >
          <div className="py-2">
            <CodeLine n={1}>
              <Cm>{"// desc: GPT API 연동 응답 요청"}</Cm>
            </CodeLine>
            <CodeLine n={2}>
              {"HttpRequest request = HttpRequest.newBuilder()"}
            </CodeLine>
            <CodeLine n={3} highlight={stage >= 1}>
              {'  .uri(URI.create(openAiBase + "/v1/chat/completions"))'}
            </CodeLine>
            <CodeLine n={4}>
              {'  .header("Authorization", "Bearer " + key)'}
            </CodeLine>
            <CodeLine n={5}>
              {"  .POST(HttpRequest.BodyPublishers.ofString("}
            </CodeLine>
            <CodeLine n={6}>
              {"      root.toString(), StandardCharsets.UTF_8))"}
            </CodeLine>
            <CodeLine n={7}>{"  .build();"}</CodeLine>
            <CodeLine n={8}>{""}</CodeLine>
            <CodeLine n={9}>
              <Cm>{"// desc: 히스토리 저장 + 공유 토글"}</Cm>
            </CodeLine>
            <CodeLine n={10} highlight={stage >= 3}>
              {"public AiChatMessage save(String email, AiMessageType type,"}
            </CodeLine>
            <CodeLine n={11} highlight={stage >= 3}>
              {"    String question, String answer) {"}
            </CodeLine>
            <CodeLine n={12} highlight={stage >= 3}>
              {"  return messageRepository.save(message);"}
            </CodeLine>
            <CodeLine n={13}>{"}"}</CodeLine>
            <CodeLine n={14} highlight={stage >= 3}>
              {"public void unshare(String email, Long messageId) {"}
            </CodeLine>
            <CodeLine n={15} highlight={stage >= 3}>
              {"  message.setShared(false);"}
            </CodeLine>
            <CodeLine n={16} highlight={stage >= 3}>
              {"  message.setShareSlug(null);"}
            </CodeLine>
            <CodeLine n={17}>{"}"}</CodeLine>
          </div>
        </CodePanel>
      </div>

      <div
        className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2"
        style={rise(on[IDX.shots], instant)}
      >
        <Shot
          src="/projects/muscleup/ai-analyze.webp"
          alt="AI 상담 화면 — 체성 분석 · 루틴 설계 · AI 상담 탭"
          caption="입력 화면 — 탭 세 개가 그대로 엔드포인트 세 개다"
          w={1299}
          h={750}
        />
        <Shot
          src="/projects/muscleup/ai-history.webp"
          alt="AI 상담 기록 화면 — 내 히스토리"
          caption="히스토리 — DB 에 남기지 않으면 다음 대화가 맥락을 잃는다"
          w={1288}
          h={799}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Shot
          src="/projects/muscleup/code-ai.webp"
          alt="AiController · AiChatHistoryService · AiService 코드"
          caption="analyze / plan 이 각자 다른 시스템 프롬프트를 쓰는 지점"
          w={1035}
          h={960}
        />
        <Panel label="공유는 되돌릴 수 있어야 한다">
          <p className="text-[13px] leading-6 text-[var(--mu-muted)]">
            상담 결과를 공유하면 <strong>share_slug</strong> 가 생기고, 공유를
            끄면 <strong>null</strong> 로 되돌아갑니다. 한 번 올린 것을 못
            내리는 구조는 만들지 않았습니다.
          </p>
          <Caveat>
            화면 속 「분석 응답 3회 · 1.8s」 같은 숫자는 서비스 화면에 표시되는
            값입니다. 프로젝트 성과 지표로 쓰지 않았습니다.
          </Caveat>
        </Panel>
      </div>
    </Page>
  );
}
