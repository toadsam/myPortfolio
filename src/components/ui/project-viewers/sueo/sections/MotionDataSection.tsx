"use client";

import {useRef, useState} from "react";
import {useSueo} from "../context";
import {
  Caveat,
  CodePanel,
  fade,
  Kicker,
  LimitList,
  rise,
  StatCard,
  WordHeading
} from "../parts";
import {LOOKUPS, type LookupScenario} from "../signData";
import {useInView, useTimeline} from "../useTimeline";

// 01 · 단어 하나가 화면에 뜨기까지
// 기준: GitHub 저장소 toadsam/Sign-Language (main).
// 서버는 동작 데이터를 만들지 않는다. 단어 이름으로 Firebase Storage 의 영상 파일을 찾아
// 주소를 내려줄 뿐이다(StorageVideoCache.findUrl). 영상 속 3D 아바타는 팀원 작업이다.

const STEPS = [0, 150, 700, 1200, 1700, 2200];
const IDX = {label: 0, heading: 1, intro: 2, demo: 3, code: 4, table: 5};

const FIND_URL = `public String findUrl(String word) {
  if (word == null || word.isBlank()) {
    return null;
  }

  String normalizedWord = word.trim();
  String cachedUrl = cache.get(normalizedWord);
  if (cachedUrl != null) {
    return cachedUrl;
  }
  if (missingWords.contains(normalizedWord)) {
    return null;
  }

  String loadedUrl = loadUrl(normalizedWord);
  if (loadedUrl == null || loadedUrl.isBlank()) {
    missingWords.add(normalizedWord);
    return null;
  }

  String previousUrl = cache.putIfAbsent(normalizedWord, loadedUrl);
  return previousUrl == null ? loadedUrl : previousUrl;
}`;

// 강조: 없다고 기억한 단어는 다시 묻지 않고(52-53행), 못 찾으면 기억한다(58행).
const FIND_URL_LIT = new Set([11, 12, 17]);

const TRANSLATE_RESPONSE = `// POST /translate  {"text":"지하철역은 어디야?"}
{
  "input": "지하철역은 어디야",
  "simplifiedSentence": "지하철역 어디",
  "normalizedTokens": ["지하철역", "어디"],
  "appliedRules": ["particle_removal", "question_reordering", "word_order"],
  "unknown": [],
  "noVideoWords": ["지하철역", "어디"]
}`;

const DECISIONS: {what: string; how: string; gain: string; cost: string}[] = [
  {
    what: "단어 이름으로 파일을 찾는다",
    how: "파일명 「단어_…​.mp4」의 첫 _ 앞이 단어",
    gain: "사전에 파일 경로를 따로 적지 않아도 된다",
    cost: "이름이 한 글자라도 다르면 못 찾는다"
  },
  {
    what: "없는 것도 기억한다",
    how: "cache 와 함께 missingWords",
    gain: "대부분이 헛조회라 같은 목록 조회를 반복하지 않는다",
    cost: "만료가 없어 새로 올린 영상은 재시작 전까지 안 보인다"
  },
  {
    what: "실패를 둘로 나눠 보낸다",
    how: "unknown(사전에 없음) · noVideoWords(영상만 없음)",
    gain: "화면이 왜 안 나오는지를 보여줄 수 있다",
    cost: "화면이 두 경우를 각각 그려야 한다"
  },
  {
    what: "퀴즈는 사전을 거치지 않는다",
    how: "정답 보기 텍스트로 바로 Storage 조회",
    gain: "「하늘」처럼 사전에 없는 단어도 문항이 된다",
    cost: "통역기 사전과 퀴즈 단어가 따로 논다"
  }
];

type Line = {text: string; tone?: "ok" | "warn" | "bad" | "muted"};

function toneColor(tone: Line["tone"]) {
  if (tone === "ok") return "var(--sd-ok)";
  if (tone === "warn") return "var(--sd-warn)";
  if (tone === "bad") return "var(--sd-bad)";
  if (tone === "muted") return "rgba(255,255,255,0.4)";
  return "var(--sd-text)";
}

export function MotionDataSection() {
  const {reducedMotion: rm, bumpSignCount, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.08});
  const t = useTimeline(STEPS, inView, rm);
  const on = (i: number) => t[i] || rm;

  const [cache, setCache] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [calls, setCalls] = useState(0);
  const [log, setLog] = useState<Line[]>([
    {
      text: "// 서버가 막 떴습니다. 두 캐시가 모두 비어 있습니다.",
      tone: "muted"
    }
  ]);
  const [screen, setScreen] = useState<"idle" | "video" | "text">("idle");
  const [screenWords, setScreenWords] = useState<string[]>([]);

  function run(s: LookupScenario) {
    const lines: Line[] = [
      {text: `→ ${s.request}`},
      {text: `  ${s.keyNote}`, tone: "muted"}
    ];
    let nextCache = [...cache];
    let nextMissing = [...missing];
    let nextCalls = calls;
    let anyVideo = false;

    for (const w of s.words) {
      if (nextCache.includes(w.word)) {
        lines.push({
          text: `  findUrl("${w.word}") → cache 적중 · Storage 조회 없음`,
          tone: "ok"
        });
        anyVideo = true;
        continue;
      }
      if (nextMissing.includes(w.word)) {
        lines.push({
          text: `  findUrl("${w.word}") → missingWords 적중 · null · Storage 조회 없음`,
          tone: "warn"
        });
        continue;
      }
      nextCalls += 1;
      if (w.hasVideo) {
        nextCache = [...nextCache, w.word];
        anyVideo = true;
        lines.push({
          text: `  storage.list(prefix "…/Model_videos/${w.word}") → 파일 찾음 → 주소 생성 → cache 저장`,
          tone: "ok"
        });
      } else {
        nextMissing = [...nextMissing, w.word];
        lines.push({
          text: `  storage.list(prefix "…/Model_videos/${w.word}") → 없음 → missingWords 저장`,
          tone: "warn"
        });
      }
    }

    if (s.id === "translate") {
      lines.push({
        text: '  응답: noVideoWords ["지하철역","어디"] · 사전에는 있고 영상만 없다',
        tone: "warn"
      });
    } else {
      lines.push({
        text: "  응답: videoUrl = Storage 주소 · 문항 출제",
        tone: "ok"
      });
    }
    lines.push({
      text: `  // 누적 Storage 목록 조회 ${nextCalls}회`,
      tone: "muted"
    });

    setCache(nextCache);
    setMissing(nextMissing);
    setCalls(nextCalls);
    setLog(prev => [...prev.slice(-9), ...lines]);
    setScreen(anyVideo ? "video" : "text");
    setScreenWords(s.words.map(w => w.word));
    if (anyVideo) bumpSignCount();
    announce(
      anyVideo ? "영상 주소를 찾았습니다." : "영상이 없어 글자로 보여줍니다."
    );
  }

  function restart() {
    setCache([]);
    setMissing([]);
    setCalls(0);
    setScreen("idle");
    setLog(prev => [
      ...prev.slice(-9),
      {
        text: "// 서버 재시작 · 두 캐시가 비었습니다. 만료가 없으니 새 영상을 반영하는 방법은 이것뿐입니다.",
        tone: "muted"
      }
    ]);
    announce("서버를 다시 띄웠습니다. 캐시가 비었습니다.");
  }

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto flex w-full max-w-[1100px] flex-col px-6 py-[100px] lg:px-8"
    >
      {/* ── 도입 ── */}
      <div className="mb-[48px] w-full max-w-[760px]">
        <Kicker on={on(IDX.label)} instant={rm} className="mb-4">
          01 · 단어 하나가 화면에 뜨기까지
        </Kicker>
        <WordHeading
          text="서버가 내려주는 건 동작이 아니라 영상 주소 하나다"
          on={on(IDX.heading)}
          instant={rm}
          stepMs={40}
          className="mb-8 text-[26px] font-black leading-tight md:text-[28px]"
        />
        <div className="space-y-[18px]" style={fade(on(IDX.intro), rm)}>
          <p className="text-[16px] leading-[36px]">
            수어는 정지된 손 모양이 아니라 움직임이라서, 이 앱은 사진이 아니라
            영상을 보여준다. 영상 속 3D 아바타는 팀원이 만들었고, 파일은
            Firebase Storage 한 폴더에{" "}
            <span className="font-mono text-[14px] text-[var(--sd-accent)]">
              단어_…​.mp4
            </span>{" "}
            이름으로 들어 있다.
          </p>
          <p className="text-[16px] leading-[36px]">
            그래서 서버의 일은 동작을 계산하는 게 아니라{" "}
            <span className="font-bold text-[var(--sd-accent)]">
              단어에 맞는 파일을 찾아 주소를 내려주는 것
            </span>
            이다. 사전 120단어 중 영상이 있는 단어는 17개뿐이라, 대부분의 조회는
            「없음」으로 끝난다. 그 「없음」을 어떻게 다루느냐가 이 칸의 전부다.
          </p>
        </div>
      </div>

      {/* ── 조회 시연 ── */}
      <div
        className="rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-[22px]"
        style={rise(on(IDX.demo), rm)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(126,184,255,0.1)] pb-3">
          <span className="font-mono text-[10px] text-[var(--sd-muted)]">
            조회 순서는 StorageVideoCache.findUrl 그대로 · 같은 요청을 두 번
            눌러 보세요
          </span>
          <div className="flex flex-wrap gap-2">
            {LOOKUPS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => run(s)}
                className="rounded-md border border-[rgba(126,184,255,0.4)] px-3 py-1.5 font-mono text-[11px] text-[var(--sd-primary)] transition-colors hover:bg-[rgba(126,184,255,0.1)]"
              >
                {s.label}
              </button>
            ))}
            <button
              type="button"
              onClick={restart}
              className="rounded-md border border-white/15 px-3 py-1.5 font-mono text-[11px] text-[var(--sd-muted)] transition-colors hover:text-white"
            >
              서버 재시작
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row">
          {/* 앱 화면 */}
          <div className="flex w-full flex-col lg:w-[34%]">
            <div className="mb-2 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-muted)]">
              앱 화면
            </div>
            <div className="relative flex h-[260px] items-center justify-center overflow-hidden rounded-md border border-[rgba(126,184,255,0.14)] bg-[var(--sd-code-bg)]">
              {screen === "video" ? (
                <>
                  {/* 배포본 퀴즈 캡처의 윗부분 — 실제로 뜬 아바타 영상 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/projects/sign-language/quiz.webp"
                    alt="배포본 퀴즈 화면. 3D 아바타 영상이 재생되는 칸"
                    className="h-full w-full object-cover object-top"
                  />
                  <span className="absolute bottom-2 left-2 rounded bg-[rgba(6,13,24,0.8)] px-2 py-0.5 font-mono text-[10px] text-[var(--sd-ok)]">
                    영상 재생 · 「하늘」
                  </span>
                </>
              ) : screen === "text" ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[34px] font-black text-white">
                    {screenWords[screenWords.length - 1]}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--sd-warn)]">
                    영상 없음 · 글자 카드로 넘어감
                  </span>
                </div>
              ) : (
                <span className="font-mono text-[11px] text-[rgba(255,255,255,0.3)]">
                  요청을 보내 보세요
                </span>
              )}
            </div>
          </div>

          {/* 캐시 + 로그 */}
          <div className="flex w-full flex-col gap-3 lg:w-[66%]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatCard
                n={cache.length ? cache.join(", ") : "{ }"}
                l="cache · 찾은 주소"
              />
              <StatCard
                n={missing.length ? missing.join(", ") : "{ }"}
                l="missingWords · 없다고 기억한 단어"
                accent="var(--sd-warn)"
              />
            </div>
            <div className="h-[170px] overflow-y-auto rounded-md border border-[rgba(126,184,255,0.12)] bg-[var(--sd-code-bg)] p-3 font-mono text-[11px] leading-[20px]">
              {log.map((l, i) => (
                <div
                  key={i}
                  className="whitespace-pre-wrap"
                  style={{color: toneColor(l.tone)}}
                >
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        </div>
        <Caveat>
          「하늘」에 영상이 있다는 건 배포본 퀴즈 캡처로,
          「지하철역」·「어디」에 영상이 없다는 건 README 에 실린 운영 서버
          응답(2026-09-07)으로 확인한 사실입니다.
        </Caveat>
      </div>

      {/* ── 코드 ── */}
      <div
        className="mt-[40px] flex flex-col gap-4 lg:flex-row"
        style={rise(on(IDX.code), rm)}
      >
        <CodePanel
          filename="StorageVideoCache.java:42-64"
          className="flex-1"
          footer="// 찾은 것만이 아니라 못 찾은 것도 기억한다"
        >
          <div className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed sm:text-[12px]">
            <table className="w-full border-collapse">
              <tbody>
                {FIND_URL.split("\n").map((line, i) => (
                  <tr
                    key={i}
                    style={{
                      background: FIND_URL_LIT.has(i + 1)
                        ? "rgba(251,191,36,0.10)"
                        : undefined
                    }}
                  >
                    <td className="sd-gutter">{i + 42}</td>
                    <td className="whitespace-pre pl-4">{line || " "}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CodePanel>

        <CodePanel
          filename="운영 서버 응답 · README"
          className="flex-1"
          footer="// 사전에는 있는데 영상만 없다 — 화면은 이 둘을 따로 그린다"
        >
          <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)] sm:text-[12px]">
            {TRANSLATE_RESPONSE}
          </pre>
        </CodePanel>
      </div>

      {/* ── 결정과 대가 ── */}
      <div className="mt-[44px] w-full" style={fade(on(IDX.table), rm)}>
        <div className="mb-4 font-mono text-[10px] tracking-[0.18em] text-[var(--sd-muted)]">
          조회에서 내린 결정과 그 대가
        </div>
        <div className="w-full overflow-x-auto border-t border-white/10 font-mono text-[12px]">
          <div className="min-w-[720px]">
            <div className="flex border-b border-white/10 py-[13px] text-[var(--sd-muted)]">
              <div className="w-[24%] px-2">결정</div>
              <div className="w-[26%] px-2">어떻게</div>
              <div className="w-[26%] px-2">얻는 것</div>
              <div className="w-[24%] px-2">잃는 것</div>
            </div>
            {DECISIONS.map(row => (
              <div
                key={row.what}
                className="flex border-b border-white/10 py-[13px]"
              >
                <div className="w-[24%] px-2 text-[var(--sd-accent)]">
                  {row.what}
                </div>
                <div className="w-[26%] px-2 text-[var(--sd-muted)]">
                  {row.how}
                </div>
                <div className="w-[26%] px-2">{row.gain}</div>
                <div className="w-[24%] px-2 text-[var(--sd-warn)]">
                  {row.cost}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[28px] grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard
            n="120"
            l="사전 단어 · sign_dictionary.json"
            accent="var(--sd-primary)"
          />
          <StatCard n="17" l="그중 영상이 있는 단어" accent="var(--sd-warn)" />
          <StatCard
            n="20"
            l="퀴즈 문항 · update_quiz_items.py"
            accent="var(--sd-primary)"
          />
        </div>
        <Caveat>
          17개는 사전 단어를 운영 서버 POST /translate 에 넣고 items[].hasVideo
          를 센 값입니다(2026-09-07, 캐시가 데워진 상태).
        </Caveat>

        <LimitList
          className="mt-[28px]"
          label="아직 남은 것"
          items={[
            "캐시에 만료가 없습니다. 영상을 새로 올려도 서버를 다시 띄우기 전까지는 없는 단어로 남습니다.",
            "통역기는 로그인 없이 열려 있어, 사용자가 넣은 아무 문자열이나 missingWords 에 쌓일 수 있습니다.",
            "영상 주소에 파일명이 그대로 들어가서, 퀴즈 주소를 풀어 보면 정답 단어가 보입니다.",
            "서명 URL 을 365일로 요청하는데, 운영에서 실제로 어떤 형태의 주소가 나가는지는 확인하지 않았습니다."
          ]}
        />
      </div>
    </section>
  );
}
