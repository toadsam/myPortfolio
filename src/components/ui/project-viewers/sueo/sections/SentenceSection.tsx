"use client";

import {useRef, useState} from "react";
import {useSueo} from "../context";
import {
  Caveat,
  CodePanel,
  fade,
  Kicker,
  LimitList,
  NoteBox,
  rise,
  WordHeading
} from "../parts";
import {
  IN_DICTIONARY,
  SENTENCES,
  SOURCE_LABEL,
  SOURCE_PRIORITY,
  type StreamSource
} from "../sentenceData";
import {useInView, useTimeline} from "../useTimeline";

// 02 · 문장 변환
// 기준: GitHub 저장소 toadsam/Sign-Language (main).
// 한 문장을 규칙 · ETRI · OpenAI 세 갈래로 따로 쪼갠 뒤, 사전에 몇 개나 맞았는지로
// 이긴 쪽을 쓴다(TranslationService.chooseTokenStream). 두 갈래(규칙·ETRI) 비교는 류태원이
// 먼저 만들었고(dae303b), OpenAI 갈래와 동점 우선순위는 정재훈이 붙였다(e34d174).
// 어순 규칙(SignSentenceSimplifier)은 류태원 코드다.

const STEPS = [0, 150, 700, 1200, 1700, 2200, 2700];
const IDX = {
  label: 0,
  heading: 1,
  intro: 2,
  pipe: 3,
  demo: 4,
  code: 5,
  notes: 6
};

const PIPELINE: {
  n: string;
  title: string;
  file: string;
  mine: boolean;
  note?: string;
}[] = [
  {n: "①", title: "규칙 단순화", file: "SignSentenceSimplifier", mine: false},
  {n: "②", title: "ETRI 형태소", file: "ExternalLexiconApiClient", mine: false},
  {
    n: "③",
    title: "OpenAI 기본형",
    file: "OpenAiMorphologyNormalizerService",
    mine: true
  },
  {
    n: "④",
    title: "사전 적중 수로 선택",
    file: "TranslationService.chooseTokenStream",
    mine: true,
    note: "두 갈래 → 세 갈래 확장"
  },
  {
    n: "⑤",
    title: "단어별 영상 조회",
    file: "StorageVideoCache.findUrl",
    mine: true,
    note: "첫 연결은 박지헌"
  }
];

const CHOOSE = `TokenStreamChoice best = choices.get(0);
int bestHits = countDictionaryHits(best.tokens());
for (TokenStreamChoice choice : choices.subList(1, choices.size())) {
  int hits = countDictionaryHits(choice.tokens());
  if (hits > bestHits || (hits == bestHits && shouldPreferTie(choice.source(), best.source()))) {
    best = choice;
    bestHits = hits;
  }
}
return best;`;

const PRIORITY = `private int sourcePriority(String source) {
  return switch (source) {
    case "openai" -> 3;
    case "etri" -> 2;
    default -> 1;
  };
}`;

const ORDER = `List<String> orderedTokens = new ArrayList<>();
orderedTokens.addAll(timeTokens);       // 시간
orderedTokens.addAll(placeTokens);      // 장소
orderedTokens.addAll(subjectTokens);    // 주어
orderedTokens.addAll(objectTokens);     // 목적어
orderedTokens.addAll(predicateTokens);  // 서술어`;

const SOURCES: StreamSource[] = ["rule", "etri", "openai"];

function hits(tokens: string[]) {
  return tokens.filter(t => IN_DICTIONARY.has(t)).length;
}

export function SentenceSection() {
  const {reducedMotion: rm, bumpSignCount, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.08});
  const t = useTimeline(STEPS, inView, rm);
  const on = (i: number) => t[i] || rm;

  const [idx, setIdx] = useState(0);
  const [keys, setKeys] = useState(true);
  const s = SENTENCES[idx];

  const alive = SOURCES.filter(src => src === "rule" || keys);
  let best: {src: StreamSource; h: number} | null = null;
  for (const src of alive) {
    const h = hits(s[src]);
    if (
      !best ||
      h > best.h ||
      (h === best.h && SOURCE_PRIORITY[src] > SOURCE_PRIORITY[best.src])
    ) {
      best = {src, h};
    }
  }

  function pick(i: number) {
    setIdx(i);
    bumpSignCount();
    announce(`「${SENTENCES[i].text}」 문장을 골랐습니다.`);
  }

  function toggleKeys() {
    const next = !keys;
    setKeys(next);
    announce(
      next
        ? "외부 키가 있는 개발 환경입니다."
        : "외부 키가 없는 운영 배포본 상태입니다."
    );
  }

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto flex w-full max-w-[1080px] flex-col px-6 py-[100px]"
    >
      {/* ── 도입 ── */}
      <div className="mb-[36px] w-full max-w-[760px]">
        <Kicker on={on(IDX.label)} instant={rm} className="mb-4">
          02 · 문장 변환
        </Kicker>
        <WordHeading
          text="누가 옳은지 모를 때, 셀 수 있는 것으로 골랐다"
          on={on(IDX.heading)}
          instant={rm}
          stepMs={60}
          className="mb-8 text-[26px] font-black leading-tight md:text-[28px]"
        />
        <div className="space-y-[18px]" style={rise(on(IDX.intro), rm)}>
          <p className="text-[16px] leading-[36px]">
            한국수어는 한국어를 손으로 옮긴 게 아니라 문법이 다른 언어다. 조사가
            없고, 시간과 장소가 앞에 오고, 의문사는 뒤로 간다. 그리고 우리
            사전에는 기본형만 있다. 그래서 「지하철역은 어디야?」를 영상으로
            바꾸려면 조사를 떼고, 「어디야」를 「어디」로 되돌리고, 어순을
            바꿔야 한다.
          </p>
          <p className="text-[16px] leading-[36px]">
            방법은 셋이었다. 손으로 쓴 규칙, ETRI 형태소 분석 API, OpenAI.{" "}
            <span className="font-bold text-[var(--sd-accent)]">
              어느 쪽이 옳은지 채점할 정답 데이터가 없었다.
            </span>{" "}
            대신 셀 수 있는 게 하나 있었다. 결과가 우리 사전에 몇 개나
            들어가는가. 사전에 있어야 영상을 틀 수 있기 때문이다. 이 기준은
            팀원이 규칙과 ETRI 두 갈래를 비교하려고 먼저 만들었고, 나는 여기에
            OpenAI 갈래를 붙이고 동점일 때의 우선순위(OpenAI, ETRI, 규칙 순)를
            넣어 세 갈래로 넓혔다.
          </p>
        </div>
      </div>

      {/* ── 파이프라인 ── */}
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-5"
        style={fade(on(IDX.pipe), rm)}
      >
        {PIPELINE.map(p => (
          <div
            key={p.n}
            className="rounded-md border p-3"
            style={{
              borderColor: p.mine
                ? "rgba(126,184,255,0.45)"
                : "rgba(196,181,253,0.35)",
              background: p.mine
                ? "rgba(126,184,255,0.06)"
                : "rgba(196,181,253,0.04)"
            }}
          >
            <div className="font-mono text-[11px] text-[var(--sd-muted)]">
              {p.n}
            </div>
            <div className="mt-1 text-[14px] font-bold">{p.title}</div>
            <div className="mt-1 break-all font-mono text-[9px] text-[rgba(255,255,255,0.4)]">
              {p.file}
            </div>
            <div
              className="mt-2 font-mono text-[9px]"
              style={{color: p.mine ? "var(--sd-primary)" : "#c4b5fd"}}
            >
              {p.mine
                ? p.note
                  ? `내 코드 · ${p.note}`
                  : "내 코드"
                : "팀원 코드"}
            </div>
          </div>
        ))}
      </div>
      <Caveat>
        ①~③은 따로 돌고 ④가 셋 중 하나를 고릅니다. 외부 키가 없으면 ②·③은 조용히
        빠집니다. 사전에 없는 토큰을 사전 API 로 한 번 더 찾는 단계는 그림에서
        생략했습니다.
      </Caveat>

      {/* ── 세 갈래 경쟁 ── */}
      <div
        className="mt-[36px] rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-[22px]"
        style={rise(on(IDX.demo), rm)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(126,184,255,0.1)] pb-3">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="문장 고르기"
          >
            {SENTENCES.map((p, i) => (
              <button
                key={p.text}
                type="button"
                aria-pressed={idx === i}
                onClick={() => pick(i)}
                className="rounded-full border px-[14px] py-[6px] font-mono text-[12px] transition-colors"
                style={
                  idx === i
                    ? {
                        background: "rgba(126,184,255,0.14)",
                        color: "var(--sd-primary)",
                        borderColor: "var(--sd-primary)"
                      }
                    : {borderColor: "rgba(126,184,255,0.24)"}
                }
              >
                {p.text}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={keys}
            onClick={toggleKeys}
            className="rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors"
            style={{
              borderColor: keys ? "var(--sd-primary)" : "var(--sd-warn)",
              color: keys ? "var(--sd-primary)" : "var(--sd-warn)"
            }}
          >
            {keys ? "외부 키 있음 · 개발 환경" : "외부 키 없음 · 운영 배포본"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {SOURCES.map(src => {
            const off = !(src === "rule" || keys);
            const win = best?.src === src;
            const tokens = s[src];
            return (
              <div
                key={src}
                className="rounded-md border p-[14px] transition-all duration-300"
                style={{
                  opacity: off ? 0.4 : 1,
                  borderColor: win
                    ? "var(--sd-primary)"
                    : "rgba(255,255,255,0.12)",
                  background: win
                    ? "rgba(126,184,255,0.08)"
                    : "rgba(255,255,255,0.02)"
                }}
              >
                <div className="font-mono text-[11px] text-[var(--sd-accent)]">
                  {SOURCE_LABEL[src]}
                  {src !== "rule" ? (
                    <span className="ml-1 text-[var(--sd-muted)]">(가정)</span>
                  ) : null}
                </div>
                <div className="mt-3 flex min-h-[32px] flex-wrap gap-1.5">
                  {off ? (
                    <span className="font-mono text-[11px] text-[var(--sd-muted)]">
                      키 없음 · 호출 안 함
                    </span>
                  ) : (
                    tokens.map((tok, i) => {
                      const hit = IN_DICTIONARY.has(tok);
                      return (
                        <span
                          key={`${tok}-${i}`}
                          className="rounded border px-2 py-0.5 font-mono text-[12px]"
                          style={{
                            borderColor: hit
                              ? "var(--sd-ok)"
                              : "rgba(255,255,255,0.18)",
                            color: hit
                              ? "var(--sd-ok)"
                              : "rgba(255,255,255,0.45)",
                            textDecoration: hit ? undefined : "line-through"
                          }}
                        >
                          {tok}
                        </span>
                      );
                    })
                  )}
                </div>
                <div className="mt-3 font-mono text-[10px] text-[var(--sd-muted)]">
                  {off
                    ? "Optional.empty()"
                    : `사전 적중 ${hits(tokens)}개${win ? " · 선택됨" : ""}`}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-md bg-[var(--sd-code-bg)] p-3 font-mono text-[12px] leading-[22px]">
          <div>
            chooseTokenStream() →{" "}
            <span className="text-[var(--sd-ok)]">{best?.src}</span> ({best?.h}
            개)
          </div>
          <div className="text-[var(--sd-muted)]">
            {keys
              ? s.note
              : "운영 배포본에는 외부 키가 없어 규칙 흐름 하나만 남습니다. 경쟁 없이 규칙 결과가 그대로 쓰입니다."}
          </div>
          {s.verified && !keys ? (
            <div className="mt-1 text-[var(--sd-warn)]">
              운영 서버 실제 응답: appliedRules [
              {s.verified.appliedRules.join(", ")}] · noVideoWords [
              {s.verified.noVideoWords.join(", ")}]
            </div>
          ) : null}
        </div>
        <Caveat>
          초록 테두리는 sign_dictionary.json 에 실제로 있는 단어입니다. 규칙
          흐름은 코드를 따라 계산했고, ETRI·OpenAI 결과는 실제 응답이 남아 있지
          않아 가정값입니다.
        </Caveat>
      </div>

      {/* ── 코드 ── */}
      <div
        className="mt-[40px] flex flex-col gap-4"
        style={rise(on(IDX.code), rm)}
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          <CodePanel
            filename="TranslationService.java:131-157 · 세 갈래 확장(e34d174)"
            className="flex-[3]"
            footer="// 옳은지가 아니라 사전에 몇 개 맞았는지를 센다"
          >
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)] sm:text-[12px]">
              {CHOOSE}
            </pre>
          </CodePanel>
          <CodePanel
            filename="TranslationService.java:203-209"
            className="flex-[2]"
          >
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)] sm:text-[12px]">
              {PRIORITY}
            </pre>
          </CodePanel>
        </div>
        <CodePanel
          filename="SignSentenceSimplifier.java:113-118 · 팀원 코드"
          borderColor="rgba(196,181,253,0.3)"
          footer="// 부정이면 끝에 「아니다」, 과거면 「끝」, 의문사는 맨 뒤로 붙인다"
        >
          <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)] sm:text-[12px]">
            {ORDER}
          </pre>
        </CodePanel>
      </div>

      {/* ── 대가와 한계 ── */}
      <div
        className="mt-[40px] flex flex-col gap-4"
        style={fade(on(IDX.notes), rm)}
      >
        <NoteBox label="이 선택의 대가" accent="#fbbf24">
          <ul className="space-y-2 text-[15px] leading-8">
            <li>
              · 요청 하나에 외부 호출이 최대 두 번 붙습니다. OpenAI 에는 10초
              타임아웃을 걸었지만 ETRI 호출에는 따로 걸지 않았습니다.
            </li>
            <li>
              · 정확도가 아니라{" "}
              <span className="font-bold text-[var(--sd-warn)]">
                재생할 수 있는 토큰 수
              </span>
              를 최대로 만듭니다. 사전에 있는 엉뚱한 단어가 사전에 없는 옳은
              단어를 이길 수 있습니다.
            </li>
            <li>
              · 운영 배포본에는 외부 키가 없어 규칙 흐름만 돕니다. 응답의
              appliedRules 에 OpenAI 규칙이 한 번도 붙지 않는 것으로
              확인했습니다. 같은 문장 왕복 중앙값 101ms(7회)는 이 상태에서 잰
              값입니다.
            </li>
          </ul>
        </NoteBox>

        <LimitList
          label="이 방식의 한계"
          items={[
            "어순은 시간·장소·주어·목적어·서술어 다섯 칸에 줄 세우는 것까지입니다. 실제 한국수어 문법은 훨씬 복잡합니다.",
            "조사가 없는 단어는 기본값으로 목적어 칸에 들어가서, 서술어 판정까지 가지 못합니다.",
            "표정과 비수지 신호를 다루지 않습니다. 사전에 없는 단어를 지문자로 바꾸는 기능도 없고, 영상이 없는 단어는 앱이 글자 카드로 4초 보여주고 넘어갑니다.",
            "세 흐름 중 어느 쪽이 얼마나 자주 이기는지 기록한 적이 없고, 결과가 자연스러운 수어인지 확인해줄 사람도 없었습니다."
          ]}
        />
      </div>
    </section>
  );
}
