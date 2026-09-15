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
import {useInView, useTimeline} from "../useTimeline";

// 05 · 트러블슈팅 02 · 배포
// 기준: GitHub 저장소 toadsam/Sign-Language 의 2026-05-28 커밋 네 개(모두 정재훈).
//   e94c200 00:14  Fix GitHub Pages frontend deployment
//   5df7eac 00:19  Update GitHub Pages actions
//   e31b917 00:24  Add GitHub Pages Google client fallback
//   5a9d4d7 00:41  Use production Google OAuth client for Pages
// 무엇을 고쳤는지는 diff 로 확인했다. 어떤 증상을 어떤 순서로 봤는지는 기록이 없어,
// 각 diff 가 막던 상태를 코드로부터 재구성했다고 화면에 밝힌다.

const STEPS = [0, 150, 700, 1200, 1700, 2200];
const IDX = {label: 0, heading: 1, intro: 2, demo: 3, code: 4, notes: 5};

type Lamp = "ok" | "bad" | "unknown";

const COMMITS: {
  hash: string;
  time: string;
  title: string;
  did: string;
  lamps: [Lamp, Lamp, Lamp, Lamp];
  log: string[];
}[] = [
  {
    hash: "da2af99",
    time: "04-30",
    title: "수동 배포 · gh-pages 브랜치",
    did: "로컬에서 웹 빌드를 만들어 gh-pages 브랜치에 직접 올렸다. 브랜치에는 404.html 이 없고, 빌드 결과와 함께 .idea · backend 설정 파일까지 섞여 올라가 있다.",
    lamps: ["bad", "unknown", "unknown", "unknown"],
    log: [
      "GET /Sign-Language/learn (새로고침) → 404",
      "// 빌드할 때 어떤 환경변수가 들어갔는지는 남아 있지 않다"
    ]
  },
  {
    hash: "e94c200",
    time: "00:14",
    title: "GitHub Actions 로 배포",
    did: "워크플로를 새로 만들었다. npm ci → expo export → index.html 을 404.html 로 복사 → .nojekyll → Pages 업로드. 환경변수는 저장소 변수(vars)에서 읽는다. 아이콘을 패키지 내부 경로에서 가져오던 import 두 줄도 기본 경로로 바꿨다.",
    lamps: ["ok", "bad", "bad", "bad"],
    log: [
      "GET /Sign-Language/learn (새로고침) → 404.html = index.html → 앱이 뜬다",
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = "" → 「.env의 EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID를 확인해 주세요」',
      'EXPO_PUBLIC_API_BASE_URL = "" → ?? 기본값에 걸리지 않음 → fetch("/api/quiz/session") → github.io 로 요청'
    ]
  },
  {
    hash: "5df7eac",
    time: "00:19",
    title: "액션 버전 올림",
    did: "checkout·setup-node v4→v6, upload-pages-artifact v3→v5, deploy-pages v4→v5. 동작은 바뀌지 않았다.",
    lamps: ["ok", "bad", "bad", "bad"],
    log: ["// 워크플로 액션 버전만 바뀐 커밋"]
  },
  {
    hash: "e31b917",
    time: "00:24",
    title: "클라이언트 ID 기본값",
    did: "vars 가 비어 있으면 개발용 Google 클라이언트 ID 를 쓰도록 워크플로에 기본값을 넣었다.",
    lamps: ["ok", "ok", "unknown", "bad"],
    log: [
      "Google 로그인 버튼 → 로그인 창이 열린다",
      "// 개발용 ID 의 토큰이 운영 서버의 audience 검증을 통과했는지는 기록이 없다",
      'API 주소는 여전히 "" → github.io 로 요청'
    ]
  },
  {
    hash: "5a9d4d7",
    time: "00:41",
    title: "API 주소 · 운영 클라이언트 ID",
    did: "API 주소 기본값으로 Cloud Run 주소를 넣고, 클라이언트 ID 를 Cloud Run 과 같은 프로젝트 번호(336670885247)의 운영용으로 바꿨다.",
    lamps: ["ok", "ok", "ok", "ok"],
    log: [
      "Google 로그인 → idToken → POST /api/auth/login (audience = 운영 클라이언트 ID)",
      'fetch("https://sign-language-backend-…asia-northeast3.run.app/api/quiz/session") → CORS 허용 목록에 toadsam.github.io → 200',
      "// 지금 배포본의 상태"
    ]
  }
];

const LAMP_LABELS = [
  "새로고침",
  "로그인 버튼",
  "운영 클라이언트 ID",
  "API 주소"
];

const WORKFLOW_DIFF = `# e94c200 · deploy-pages.yml
env:
  EXPO_PUBLIC_API_BASE_URL: \${{ vars.EXPO_PUBLIC_API_BASE_URL }}
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: \${{ vars.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID }}

# 5a9d4d7 · 지금
env:
  EXPO_PUBLIC_API_BASE_URL: \${{ vars.EXPO_PUBLIC_API_BASE_URL || 'https://sign-language-backend-…run.app' }}
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: \${{ vars.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '336670885247-….apps.googleusercontent.com' }}`;

const BASE_URL = `// frontendcodes/lib/api/base-url.ts
const DEFAULT_BASE_URL = 'http://localhost:8080';

export function getBaseUrl() {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const raw = envBaseUrl ?? DEFAULT_BASE_URL;   // "" 는 null 이 아니라 기본값으로 안 넘어간다
  ...`;

const FALLBACK_STEP = `# deploy-pages.yml
- name: Add GitHub Pages fallback
  run: |
    cp dist/index.html dist/404.html   # 없는 경로로 새로고침해도 앱이 뜬다
    touch dist/.nojekyll               # _expo/ 폴더를 Jekyll 이 버리지 않게`;

function lampColor(l: Lamp) {
  if (l === "ok") return "var(--sd-ok)";
  if (l === "bad") return "var(--sd-bad)";
  return "rgba(255,255,255,0.25)";
}

export function Trouble02Section() {
  const {reducedMotion: rm, announce} = useSueo();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {threshold: 0.08});
  const t = useTimeline(STEPS, inView, rm);
  const on = (i: number) => t[i] || rm;

  const [step, setStep] = useState(0);
  const c = COMMITS[step];

  function go(i: number) {
    setStep(i);
    const ok = COMMITS[i].lamps.filter(l => l === "ok").length;
    announce(`${COMMITS[i].hash} 적용. 네 항목 중 ${ok}개 정상.`);
  }

  return (
    <section
      ref={sectionRef}
      data-sd-section
      className="mx-auto flex w-full max-w-[1040px] flex-col px-6 py-[100px]"
    >
      <Kicker on={on(IDX.label)} instant={rm} color="var(--sd-bad)">
        05 · 트러블슈팅 02 · 배포
      </Kicker>
      <WordHeading
        text="배포는 성공했는데, 앱이 서버를 못 찾았다"
        on={on(IDX.heading)}
        instant={rm}
        className="mt-2 text-[28px] font-black leading-tight md:text-[30px]"
      />

      <div
        className="mt-[24px] max-w-[760px] space-y-[16px] text-[16px] leading-8"
        style={fade(on(IDX.intro), rm)}
      >
        <p>
          앱은 Expo 웹 빌드를 GitHub Pages 에, 서버는 Spring Boot 를 Cloud Run
          서울 리전에 올렸다. 둘을 잇는 건 코드가 아니라 설정이다. 원래 손으로
          올리던 앱 배포를 GitHub Actions 로 옮긴 날, 27분 동안 커밋 네 개가
          연달아 나갔다.
        </p>
        <p>
          핵심은 하나였다.{" "}
          <span className="font-bold text-[var(--sd-accent)]">
            EXPO_PUBLIC_ 로 시작하는 값은 실행할 때 읽히지 않고, 빌드할 때 번들
            JS 안에 문자열로 박힌다.
          </span>{" "}
          워크플로에서 값이 비면 배포본에는 빈 문자열이 들어가고, 코드의{" "}
          <span className="font-mono text-[14px]">??</span> 는 빈 문자열을
          「없음」으로 보지 않아 기본값으로도 넘어가지 않는다.
        </p>
      </div>

      {/* ── 커밋 타임라인 ── */}
      <div
        className="mt-[36px] rounded-md border border-[rgba(126,184,255,0.18)] bg-[var(--sd-panel)] p-[22px]"
        style={rise(on(IDX.demo), rm)}
      >
        <div
          className="flex flex-wrap gap-2 border-b border-[rgba(126,184,255,0.1)] pb-3"
          role="group"
          aria-label="커밋 고르기"
        >
          {COMMITS.map((cm, i) => (
            <button
              key={cm.hash}
              type="button"
              aria-pressed={step === i}
              onClick={() => go(i)}
              className="rounded-md border px-3 py-1.5 text-left font-mono text-[11px] transition-colors"
              style={
                step === i
                  ? {
                      borderColor: "var(--sd-primary)",
                      background: "rgba(126,184,255,0.12)",
                      color: "var(--sd-primary)"
                    }
                  : {
                      borderColor: "rgba(126,184,255,0.2)",
                      color: "var(--sd-muted)"
                    }
              }
            >
              <span className="block">{cm.hash}</span>
              <span className="block text-[9px] opacity-70">
                {cm.time} · {cm.title}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[15px] leading-8">{c.did}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {LAMP_LABELS.map((label, i) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-md border border-white/10 p-3 text-center"
            >
              <span
                className="h-3 w-3 rounded-full transition-colors duration-300"
                style={{background: lampColor(c.lamps[i])}}
              />
              <span className="font-mono text-[11px]">{label}</span>
              <span className="font-mono text-[9px] text-[var(--sd-muted)]">
                {c.lamps[i] === "ok"
                  ? "정상"
                  : c.lamps[i] === "bad"
                  ? "막힘"
                  : "기록 없음"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-md bg-[var(--sd-code-bg)] p-3 font-mono text-[11px] leading-[20px]">
          {c.log.map(line => (
            <div
              key={line}
              className="whitespace-pre-wrap break-all"
              style={{
                color: line.startsWith("//")
                  ? "rgba(255,255,255,0.4)"
                  : "var(--sd-text)"
              }}
            >
              {line}
            </div>
          ))}
        </div>
        <Caveat>
          각 커밋이 바꾼 내용은 diff 로 확인했습니다. 막힘·정상 표시는 그 diff
          가 무엇을 고치는지로부터 재구성한 것이고, 당시 화면에서 증상을 본
          순서는 기록에 없습니다.
        </Caveat>
      </div>

      {/* ── 코드 ── */}
      <div
        className="mt-[40px] flex flex-col gap-4"
        style={rise(on(IDX.code), rm)}
      >
        <CodePanel
          filename=".github/workflows/deploy-pages.yml · 환경변수"
          footer="// 공개 식별자라 비밀은 아니다. vars 를 채우면 그 값이 먼저다"
        >
          <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)] sm:text-[12px]">
            {WORKFLOW_DIFF}
          </pre>
        </CodePanel>
        <div className="flex flex-col gap-4 lg:flex-row">
          <CodePanel filename="base-url.ts" className="flex-1">
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)]">
              {BASE_URL}
            </pre>
          </CodePanel>
          <CodePanel filename="deploy-pages.yml · SPA 폴백" className="flex-1">
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[var(--sd-text)]">
              {FALLBACK_STEP}
            </pre>
          </CodePanel>
        </div>
      </div>

      <div
        className="mt-[40px] flex flex-col gap-4"
        style={fade(on(IDX.notes), rm)}
      >
        <NoteBox label="원리 셋" accent="#7eb8ff">
          <ul className="space-y-2 text-[15px] leading-8">
            <li>
              · <b>빌드 시점 값.</b> 브라우저에서 도는 앱에는 환경변수를 읽을
              서버가 없다. 그래서 값을 바꾸려면 다시 빌드해야 하고, 비밀 값은
              절대 넣으면 안 된다. 여기에는 API 주소와 공개 클라이언트 ID 만
              들어간다.
            </li>
            <li>
              · <b>정적 호스팅의 새로고침.</b> Pages 는 파일만 준다.
              /Sign-Language/learn 이라는 파일은 없으니 404 다. 404.html 을 앱
              자체로 두면 어떤 경로든 앱이 뜨고 라우터가 화면을 고른다.
            </li>
            <li>
              · <b>출처가 둘.</b> 앱은 toadsam.github.io, 서버는 run.app 이다.
              서버의 CORS 허용 목록에 Pages 주소를 넣었고(bc692f8), 서버가
              검증하는 Google 토큰의 audience 와 앱이 쓰는 클라이언트 ID 가 같은
              프로젝트여야 한다.
            </li>
          </ul>
        </NoteBox>

        <LimitList
          label="아직 남은 것"
          items={[
            "서버(Cloud Run) 배포는 자동화하지 않았습니다. 워크플로는 앱 배포 하나뿐입니다.",
            "API 주소와 클라이언트 ID 기본값이 워크플로 파일에 적혀 있습니다. 비밀은 아니지만 설정이 코드에 박혀 있습니다.",
            "이 네 커밋은 PR 없이 main 에 바로 올라갔고, 배포 뒤 헬스체크나 알림은 없습니다.",
            "Cloud Run 첫 요청 지연(콜드 스타트)은 재지 않았습니다."
          ]}
        />
      </div>
    </section>
  );
}
