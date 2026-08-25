"use client";

import {useCallback, useRef, useState} from "react";
import {useFestFlow} from "../context";
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

// PAGE 09 — 근거 없이는 대답하지 않는다 · AI 챗봇
//
// 개발 실체: 발표자료 14~17장 원문
//   ChatPage → ChatController.ask → ChatService.answer
//   searchEvidence → BoothService / EventService / NoticeService /
//   LostItemService / AiCongestionService → buildPrompt → OpenAI
//   실패 시 createFallback(evidence) → buildResponse
//   ChatResponseDto: answer / confidence / evidence / warnings
//   ChatEvidenceDto: type / id / label / reason / updatedAt
// 연출 장치: 관람객이 질문을 고르면 **근거를 모으는 과정이 한 줄씩 보이고**,
//            답변에 그 근거 카드가 붙는다

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

type Ev = {type: string; label: string; reason: string; color: string};

const QUESTIONS: {
  q: string;
  ev: Ev[];
  answer: string;
  warn?: string;
}[] = [
  {
    q: "지금 안 붐비는 음식 부스 알려줘",
    ev: [
      {
        type: "BOOTH",
        label: "성호관 주변 부스",
        reason: "현재 혼잡도 여유",
        color: "var(--ff-live)"
      },
      {
        type: "CONGESTION",
        label: "30분 뒤 예측",
        reason: "NORMAL 유지 전망",
        color: "var(--ff-ray)"
      },
      {
        type: "BOOTH",
        label: "아주광장 부스",
        reason: "매우 혼잡 — 회피 대상",
        color: "var(--ff-down)"
      }
    ],
    answer:
      "성호관 주변이 지금 가장 여유롭고, 30분 뒤에도 보통 수준을 유지할 것으로 보입니다. 아주광장 쪽은 지금 매우 혼잡해서 잠시 후 방문을 권합니다."
  },
  {
    q: "8시에 무슨 공연 있어?",
    ev: [
      {
        type: "EVENT",
        label: "메인 스테이지 라인업",
        reason: "20:00 시작 일정 있음",
        color: "var(--ff-primary)"
      },
      {
        type: "CONGESTION",
        label: "공연 임박 신호",
        reason: "event_soon = true",
        color: "var(--ff-stale)"
      }
    ],
    answer:
      "20시에 메인 스테이지 공연이 예정돼 있습니다. 공연 30분 전부터 주변 혼잡도가 올라가니 미리 이동하시는 게 좋습니다."
  },
  {
    q: "지갑 잃어버렸어",
    ev: [
      {
        type: "LOST_ITEM",
        label: "분실물 접수 목록",
        reason: "키워드 일치 항목 확인",
        color: "var(--ff-accent)"
      },
      {
        type: "NOTICE",
        label: "분실물 안내 공지",
        reason: "접수처 위치 안내",
        color: "var(--ff-ray)"
      }
    ],
    answer:
      "분실물 목록에서 비슷한 항목을 찾아 안내해 드리고, 접수처 위치를 함께 알려드립니다.",
    warn: "본인 확인이 필요한 정보는 챗봇이 직접 알려주지 않습니다."
  }
];

export function P09Chatbot() {
  const {reducedMotion, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [qi, setQi] = useState<number | null>(null);
  const [stage, setStage] = useState(0); // 0 대기 · 1 근거수집 · 2 답변
  const timers = useRef<number[]>([]);

  const ask = useCallback(
    (i: number) => {
      timers.current.forEach(t => window.clearTimeout(t));
      timers.current = [];
      setQi(i);
      setStage(instant ? 2 : 1);
      announce("질문을 보냈습니다. 근거를 모으는 중입니다.");
      if (!instant) {
        timers.current.push(
          window.setTimeout(() => {
            setStage(2);
            announce("근거를 붙인 답변이 도착했습니다.");
          }, 1400)
        );
      }
    },
    [instant, announce]
  );

  const active = qi === null ? null : QUESTIONS[qi];

  return (
    <Page index={9} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        09 · AI 챗봇
      </Kicker>

      <div className="mt-4">
        <Heading
          text="근거 없이는 대답하지 않습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          축제 챗봇이 그럴듯하게 지어내면 방문객은 <strong>없는 부스로
          걸어갑니다.</strong> 그래서 질문이 오면 먼저 부스 · 공연 · 공지 · 분실물
          · 혼잡도에서 <strong style={{color: "var(--ff-accent)"}}>근거를
          찾고</strong>, 그 근거만으로 프롬프트를 만들고, 답변에{" "}
          <strong>근거 카드를 붙여서</strong> 내려보냅니다.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: "1px solid var(--ff-border)",
            background: "var(--ff-panel)"
          }}
        >
          <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
            ChatPage
          </span>

          <div className="flex flex-col gap-2">
            {QUESTIONS.map((q, i) => (
              <button
                key={q.q}
                type="button"
                onClick={() => ask(i)}
                aria-pressed={qi === i}
                className="cursor-pointer rounded-md px-3.5 py-2.5 text-left text-[12px] transition-colors duration-200"
                style={{
                  border: `1px solid ${
                    qi === i ? "var(--ff-primary)" : "rgba(255,255,255,0.12)"
                  }`,
                  background:
                    qi === i ? "rgba(251,191,36,0.10)" : "transparent",
                  color: qi === i ? "var(--ff-accent)" : "var(--ff-muted)"
                }}
              >
                “{q.q}”
              </button>
            ))}
          </div>

          {/* 근거 수집 */}
          <div
            className="min-h-[210px] rounded p-3.5"
            style={{
              background: "var(--ff-code-bg)",
              border: "1px solid var(--ff-code-border)"
            }}
          >
            {!active ? (
              <p className="py-12 text-center font-mono text-[11px] text-[var(--ff-faint)]">
                위에서 질문을 하나 눌러 보세요
              </p>
            ) : (
              <>
                <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--ff-muted)]">
                  searchEvidence(question)
                </div>
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {active.ev.map((e, i) => (
                    <div
                      key={e.label}
                      className={`rounded px-2.5 py-2 ${
                        instant ? "" : "ff-pop"
                      }`}
                      style={{
                        border: `1px solid ${e.color}`,
                        background: `color-mix(in srgb, ${e.color} 10%, transparent)`,
                        animationDelay: `${i * 260}ms`
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-mono text-[10px] font-bold"
                          style={{color: e.color}}
                        >
                          {e.type}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--ff-faint)]">
                          updatedAt
                        </span>
                      </div>
                      <div className="mt-1 text-[12px] text-[var(--ff-text)]">
                        {e.label}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-[var(--ff-muted)]">
                        {e.reason}
                      </div>
                    </div>
                  ))}
                </div>

                {stage >= 2 ? (
                  <div
                    className={`mt-3 rounded px-3 py-2.5 ${
                      instant ? "" : "ff-pop"
                    }`}
                    style={{
                      border: "1px solid rgba(251,191,36,0.34)",
                      background: "rgba(251,191,36,0.07)"
                    }}
                  >
                    <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--ff-primary)]">
                      ANSWER
                    </div>
                    <p className="mt-1.5 text-[12px] leading-6 text-[var(--ff-text)]">
                      {active.answer}
                    </p>
                    {active.warn ? (
                      <p
                        className="mt-2 font-mono text-[10px] leading-4"
                        style={{color: "var(--ff-stale)"}}
                      >
                        ⚠ {active.warn}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 font-mono text-[11px] text-[var(--ff-muted)]">
                    근거를 모으는 중
                    <span className="ff-caret" aria-hidden="true">
                      _
                    </span>
                  </p>
                )}
              </>
            )}
          </div>

          <Hint>
            답변보다 <strong>근거가 먼저</strong> 나오는 순서가 핵심입니다. 근거를
            못 찾으면 지어내지 않고 일반 안내 문구를 주거나 추가 질문을 유도합니다.
          </Hint>
        </div>

        <div className="flex flex-col gap-3">
          <CodePanel
            filename="ChatService.java"
            badge={{text: "실제 클래스", color: "var(--ff-primary)"}}
            borderColor="var(--ff-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>{"// ① 먼저 근거를 찾는다 — 다섯 곳에서"}</Cm>
              </CodeLine>
              <CodeLine n={2} highlight={stage >= 1}>
                {"var evidence = searchEvidence(question);"}
              </CodeLine>
              <CodeLine n={3}>{"  boothService.search(keyword);"}</CodeLine>
              <CodeLine n={4}>{"  eventService.search(keyword);"}</CodeLine>
              <CodeLine n={5}>{"  noticeService.getNotices();"}</CodeLine>
              <CodeLine n={6}>{"  lostItemService.searchLostItem(keyword);"}</CodeLine>
              <CodeLine n={7}>{"  aiCongestionService.analyzeCurrent();"}</CodeLine>
              <CodeLine n={8}>{""}</CodeLine>
              <CodeLine n={9}>
                <Cm>{"// ② 찾은 근거로만 프롬프트를 만든다"}</Cm>
              </CodeLine>
              <CodeLine n={10} highlight={stage >= 2}>
                {"String prompt = buildPrompt(evidence);"}
              </CodeLine>
              <CodeLine n={11} highlight={stage >= 2}>
                {"String answer = openAiApi.generateAnswer(prompt);"}
              </CodeLine>
              <CodeLine n={12}>{""}</CodeLine>
              <CodeLine n={13}>
                <Cm>{"// ③ 답변 + 근거 + 경고를 같이 내려보낸다"}</Cm>
              </CodeLine>
              <CodeLine n={14} highlight={stage >= 2}>
                {"return buildResponse(answer, evidence);"}
              </CodeLine>
              <CodeLine n={15}>
                <Cm>{"//    → ChatResponseDto { answer, confidence,"}</Cm>
              </CodeLine>
              <CodeLine n={16}>
                <Cm>{"//                       evidence, warnings }"}</Cm>
              </CodeLine>
            </div>
          </CodePanel>

          <Panel label="확신도와 경고까지 같이">
            <p className="text-[13px] leading-6 text-[var(--ff-muted)]">
              응답에는 답변만이 아니라{" "}
              <strong className="text-[var(--ff-text)]">
                confidence · evidence · warnings
              </strong>
              가 함께 들어갑니다. 확신이 낮으면 화면이 그걸 그대로 표시하고,
              본인 확인이 필요한 정보는 경고로 막습니다.
            </p>
          </Panel>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Shot
          src="/projects/festflow/class-chat.webp"
          alt="근거 기반 AI 챗봇 클래스 다이어그램"
          caption="ChatPage → ChatController → ChatService → 다섯 데이터 서비스"
          w={1600}
          h={900}
        />
        <Shot
          src="/projects/festflow/seq-chat.webp"
          alt="근거 기반 AI 챗봇 시퀀스 다이어그램"
          caption="22단계 — 오른쪽 아래 alt [Failure] 가 07장의 폴백이다"
          w={1600}
          h={900}
        />
      </div>
    </Page>
  );
}
