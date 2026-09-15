"use client";

import {useRef, useState} from "react";
import {useSueo} from "../context";
import {
  Caveat,
  CodePanel,
  Kicker,
  LimitList,
  NoteBox,
  WordHeading
} from "../parts";
import {
  answerOf,
  QUIZ_ITEMS,
  QUIZ_QUESTION_TEXT,
  type QuizItem
} from "../signData";
import {useInView, useTimeline} from "../useTimeline";

// 03 · 영상 조회 키
// 기준: GitHub 저장소 toadsam/Sign-Language (main) 의 커밋 두 개.
// - 41bff36 (박지헌, Storage 첫 연결): 퀴즈 영상을 문항 문장(questionText)으로 찾았다.
// - 8fdd313 (정재훈, 2026-04-29 22:29): 정답 보기 텍스트로 찾고, 없으면 Firestore 주소를
//   쓰는 판단을 findUrlOrFallback 한 메서드로 모았다.
// - 133eb9a (정재훈, 같은 날 23:23): 20문항을 「이 수어의 의미는?」 공통 문장 + 보기 4개로
//   다시 올렸다. 문항 문장이 단어가 아니게 되는 순간 옛 조회 키는 절대 맞을 수 없다.
// 커밋 메시지가 「1」이라 당시 화면에서 본 증상은 기록에 없다. 여기서는 코드가 하는 일만 보여준다.

const STEPS = [0, 150, 600, 1100, 1600];
const IDX = {label: 0, heading: 1, body: 2, repro: 3, code: 4};

const DEMO_ITEMS: QuizItem[] = ["q006", "q005", "q011"].map(
  id => QUIZ_ITEMS.find(q => q.id === id)!
);

const BEFORE = `// 41bff36 · QuizService.java
// Storage 캐시에서 단어명으로 동영상 URL 조회, 없으면 Firestore videoUrl로 fallback
String storageUrl = storageVideoCache.findUrl(questionText);
String videoUrl = (storageUrl != null) ? storageUrl : firestoreVideoUrl;

if (isBlank(videoUrl)) {
  return null;   // 영상이 없으면 이 문항을 세션에서 뺀다
}`;

const AFTER = `// 8fdd313 · QuizService.java:199-211
String correctChoiceId = normalizeChoiceId(doc.getString("correctChoiceId"));
String correctChoiceText = choiceTextById(choices, correctChoiceId);
...
String videoUrl = storageVideoCache.findUrlOrFallback(correctChoiceText, firestoreVideoUrl);

if (isBlank(videoUrl)) {
  return null;
}`;

const FALLBACK = `// StorageVideoCache.java:66-72
public String findUrlOrFallback(String word, String fallbackUrl) {
  String storageUrl = findUrl(word);
  if (storageUrl != null && !storageUrl.isBlank()) {
    return storageUrl;
  }
  return fallbackUrl == null ? "" : fallbackUrl.trim();
}`;

function Step({
  n,
  title,
  value,
  tone
}: {
  n: string;
  title: string;
  value: string;
  tone: "ok" | "warn" | "bad" | "muted";
}) {
  const color =
    tone === "ok"
      ? "var(--sd-ok)"
      : tone === "warn"
      ? "var(--sd-warn)"
      : tone === "bad"
      ? "var(--sd-bad)"
      : "var(--sd-muted)";
  return (
    <div className="rounded-md border border-[rgba(126,184,255,0.16)] bg-[var(--sd-code-bg)] p-[12px]">
      <div className="font-mono text-[10px] text-[var(--sd-muted)]">
        {n} {title}
      </div>
      <div className="mt-2 break-keep font-mono text-[12px]" style={{color}}>
        {value}
      </div>
    </div>
  );
}

export function Trouble01Section() {
  const {reducedMotion: rm, announce, bumpSignCount} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.1});
  const t = useTimeline(STEPS, inView, rm);
  const on = (i: number) => t[i] || rm;

  const [itemIdx, setItemIdx] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);

  const item = DEMO_ITEMS[itemIdx];
  const answer = answerOf(item);
  const question = QUIZ_QUESTION_TEXT[item.category];
  const key = fixed ? answer : question;
  // 파일명은 「단어_…​.mp4」라 문장으로는 절대 맞지 않는다.
  const storageHit = fixed && hasVideo;
  const served = storageHit;

  function choose(next: {i?: number; f?: boolean; v?: boolean}) {
    const i = next.i ?? itemIdx;
    const f = next.f ?? fixed;
    const v = next.v ?? hasVideo;
    setItemIdx(i);
    setFixed(f);
    setHasVideo(v);
    const ok = f && v;
    if (ok) bumpSignCount();
    announce(
      ok
        ? "영상 주소를 찾아 문항이 출제됩니다."
        : "영상 주소가 비어 문항이 세션에서 빠집니다."
    );
  }

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto flex w-full max-w-[1020px] flex-col px-6 py-[100px]"
    >
      <Kicker on={on(IDX.label)} instant={rm} color="var(--sd-bad)">
        03 · 트러블슈팅 01 · 영상 조회 키
      </Kicker>
      <WordHeading
        text="파일은 있는데, 찾는 이름이 틀렸다"
        on={on(IDX.heading)}
        instant={rm}
        className="mt-2 text-[30px] font-black leading-tight"
      />

      <div
        className="mt-[24px] max-w-[760px] space-y-[16px] text-[16px] leading-8"
        style={{
          opacity: on(IDX.body) ? 1 : 0,
          transition: rm ? "none" : "opacity 0.5s cubic-bezier(0.4,0,0.2,1)"
        }}
      >
        <p>
          퀴즈 영상을 Storage 에 처음 연결한 코드는 영상을{" "}
          <span className="font-mono text-[14px] text-[var(--sd-accent)]">
            문항 문장(questionText)
          </span>
          으로 찾았다. 그런데 Storage 의 파일은 「단어_…​.mp4」 이름이다. 문항
          문장에 단어가 들어 있을 때만 맞는 조회였다.
        </p>
        <p>
          퀴즈를 「이 기초 단어 수어의 의미는 무엇인가요?」와 보기 네 개로
          정리하려면 문항 문장은 모든 문항에서 같아진다. 그 순간 옛 조회는{" "}
          <span className="font-bold text-[var(--sd-warn)]">
            어떤 파일과도 맞을 수 없다.
          </span>{" "}
          다음으로 보는 Firestore 의 videoUrl 은 빈 문자열이고, 주소가 비면 그
          문항은 세션에서 조용히 빠진다. 예외도 로그도 남지 않는다.
        </p>
        <p>
          그래서 조회 키를 정답 보기로 옮기고(8fdd313), 한 시간 뒤 20문항을 새
          구조로 다시 올렸다(133eb9a). Storage 에 없을 때 Firestore 주소로
          넘어가는 판단은 한 메서드로 모았다.
        </p>
      </div>

      {/* ── 재현 ── */}
      <div
        className="relative mt-[36px] rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-[22px]"
        style={{
          opacity: on(IDX.repro) ? 1 : 0,
          transform: on(IDX.repro) ? "translateY(0)" : "translateY(16px)",
          transition: rm ? "none" : "all 0.6s cubic-bezier(0.4,0,0.2,1)"
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(126,184,255,0.10)] pb-3">
          <span className="font-mono text-[10px] text-[var(--sd-muted)]">
            퀴즈 세션 하나를 만들 때 문항 하나가 거치는 길
          </span>
          <div className="flex gap-1" role="group" aria-label="코드 버전">
            {[false, true].map(mode => (
              <button
                key={String(mode)}
                type="button"
                aria-pressed={fixed === mode}
                onClick={() => choose({f: mode})}
                className="rounded px-2 py-0.5 font-mono text-[11px] transition-colors"
                style={
                  fixed === mode
                    ? {
                        background: "rgba(126,184,255,0.14)",
                        color: "var(--sd-primary)"
                      }
                    : {color: "var(--sd-muted)"}
                }
              >
                {mode ? "수정 후 · 8fdd313" : "수정 전 · 41bff36"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {DEMO_ITEMS.map((q, i) => (
            <button
              key={q.id}
              type="button"
              aria-pressed={i === itemIdx}
              onClick={() => choose({i})}
              className="rounded-full border px-[14px] py-[6px] font-mono text-[12px] transition-colors"
              style={
                i === itemIdx
                  ? {
                      background: "rgba(126,184,255,0.14)",
                      color: "var(--sd-primary)",
                      borderColor: "var(--sd-primary)"
                    }
                  : {borderColor: "rgba(126,184,255,0.24)"}
              }
            >
              {q.id} · 정답 {q.correct}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={hasVideo}
            onClick={() => choose({v: !hasVideo})}
            className="ml-auto rounded-md border px-3 py-1.5 font-mono text-[11px]"
            style={{
              borderColor: hasVideo ? "var(--sd-ok)" : "rgba(255,255,255,0.2)",
              color: hasVideo ? "var(--sd-ok)" : "var(--sd-muted)"
            }}
          >
            Storage 에 「{answer}」 영상 {hasVideo ? "있음" : "없음"}
          </button>
        </div>

        <div className="mt-3 rounded-md bg-[var(--sd-code-bg)] p-3 font-mono text-[11px] leading-[20px] text-[var(--sd-muted)]">
          questionText = &quot;{question}&quot;
          <br />
          choices = [{item.choices.join(", ")}] · correctChoiceId = &quot;
          {item.correct}&quot;
          <br />
          videoUrl = &quot;&quot;
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Step
            n="①"
            title="조회 키"
            value={fixed ? `「${key}」` : "문항 문장 전체"}
            tone={fixed ? "ok" : "warn"}
          />
          <Step
            n="②"
            title="Storage"
            value={
              storageHit
                ? `${answer}_…​.mp4 찾음`
                : fixed
                ? "없음"
                : "파일명과 맞을 수 없음"
            }
            tone={storageHit ? "ok" : "warn"}
          />
          <Step
            n="③"
            title="Firestore videoUrl"
            value={storageHit ? "보지 않음" : '"" 빈 문자열'}
            tone={storageHit ? "muted" : "warn"}
          />
          <Step
            n="④"
            title="문항"
            value={served ? "출제됨" : "return null · 세션에서 빠짐"}
            tone={served ? "ok" : "bad"}
          />
        </div>
        <Caveat>
          문항 내용은 backend/scripts/update_quiz_items.py 원문입니다. q006
          「하늘」은 배포본 캡처에서 영상이 뜨는 것을 확인했고, 나머지 두 단어의
          영상 유무는 스위치로 바꿔 보는 설정입니다.
        </Caveat>
      </div>

      {/* ── 코드 ── */}
      <div
        className="mt-[40px] flex flex-col gap-4"
        style={{
          opacity: on(IDX.code) ? 1 : 0,
          transition: rm ? "none" : "opacity 0.6s cubic-bezier(0.4,0,0.2,1)"
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          <CodePanel
            filename="before · 41bff36"
            borderColor="rgba(248,113,113,0.28)"
            className="flex-1"
          >
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)] sm:text-[12px]">
              {BEFORE}
            </pre>
          </CodePanel>
          <CodePanel
            filename="after · 8fdd313"
            borderColor="rgba(74,222,128,0.28)"
            className="flex-1"
          >
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)] sm:text-[12px]">
              {AFTER}
            </pre>
          </CodePanel>
        </div>
        <CodePanel
          filename="StorageVideoCache.java · 호출부는 이것만 부른다"
          footer="// 퀴즈 세션, 북마크, 저장한 오답노트가 모두 이 메서드로 영상 주소를 받는다"
        >
          <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)] sm:text-[12px]">
            {FALLBACK}
          </pre>
        </CodePanel>
      </div>

      <NoteBox label="배운 것" accent="#fbbf24" className="mt-[40px]">
        <p className="text-[16px] leading-8">
          에러가 나는 실패는 로그를 보고 찾는다. 빈 문자열은 정상 값처럼
          흘러가서 화면까지 가야 드러나고, 그때는{" "}
          <span className="font-bold text-[var(--sd-warn)]">왜 비었는지</span>를
          이미 잃어버린 뒤다. 통역기 응답이 실패를 unknown(사전에 없음)과
          noVideoWords(영상만 없음)로 나눠 보내는 것도 같은 이유다.
        </p>
      </NoteBox>

      <LimitList
        className="mt-[28px]"
        label="아직 남은 것"
        items={[
          "자동화된 테스트가 없습니다. 조회 키가 다시 틀어져도 알려줄 장치가 없습니다.",
          "Storage 와 Firestore 둘 다에 없으면 문항은 여전히 조용히 빠집니다. 몇 개가 빠졌는지 기록하지 않습니다.",
          "같은 커밋의 UserService.resolveQuizVideoUrl 은 아직 문항 문장으로 한 번 먼저 찾은 뒤 단어로 찾습니다. 결과는 맞지만 헛조회가 한 번 붙습니다.",
          "정답 단어로 파일을 찾으니, 영상 주소의 파일명을 풀어 보면 정답이 보입니다.",
          "커밋 메시지가 「1」이라, 이 수정의 이유와 당시 증상은 코드 말고는 남아 있지 않습니다."
        ]}
      />
    </section>
  );
}
