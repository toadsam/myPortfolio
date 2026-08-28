"use client";

import {useCallback, useRef, useState} from "react";
import {useMuscleUp} from "../context";
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
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 10 — 트러블슈팅 03 · 배포하고 나서 생긴 것들
//
// 개발 실체: PDF 12쪽 「운영 이슈 해결」 원문
//            Issue 1 (ACM 리전 함정) — CloudFront 는 us-east-1 인증서가 필요
//            Issue 2 (캐시 반영 지연) — Invalidation(/*) + 캐시 정책 점검
//            + PDF 13쪽 「환경변수/프로파일 분리」
// 연출 장치: **세 개의 사고를 관람객이 하나씩 골라 재현한다.**
//            고르면 그때의 증상과 고친 방법이 같이 열린다

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, cases: 3};

type CaseKey = "acm" | "cache" | "env";

const CASES: {
  key: CaseKey;
  no: string;
  title: string;
  symptom: string;
  cause: string;
  fix: string;
  detail: string;
}[] = [
  {
    key: "acm",
    no: "ISSUE 01",
    title: "인증서를 발급했는데 CloudFront 가 못 고른다",
    symptom:
      "ACM 에서 muscle-up.click 인증서를 정상 발급했는데, CloudFront 배포 설정의 인증서 목록에 아예 나타나지 않았습니다.",
    cause:
      "CloudFront 는 us-east-1(버지니아 북부) 리전의 인증서만 인식합니다. 다른 리전에서 발급한 인증서는 존재해도 목록에 뜨지 않습니다.",
    fix: "us-east-1 에서 재발급한 뒤 연결해 해결했습니다.",
    detail:
      "리전이 다르면 「없는 것」처럼 보이지 「잘못됐다」고 알려주지 않는다는 게 이 함정의 성격입니다."
  },
  {
    key: "cache",
    no: "ISSUE 02",
    title: "배포했는데 옛날 화면이 그대로 나온다",
    symptom:
      "S3 에 새 빌드를 올렸는데도 접속하면 이전 화면이 나왔습니다. 어떤 사람은 새 화면, 어떤 사람은 옛 화면이었습니다.",
    cause:
      "CloudFront 엣지에 이전 정적 리소스가 남아 있었습니다. 엣지마다 캐시 상태가 달라 사람마다 다르게 보였습니다.",
    fix: "Invalidation(/*) 을 걸고 캐시 정책을 점검해 반영 시간을 안정화했습니다.",
    detail:
      "CDN 을 쓴다는 건 「올리면 끝」이 아니라 「올리고 지워야 끝」이라는 뜻이었습니다."
  },
  {
    key: "env",
    no: "ISSUE 03",
    title: "키 하나가 없어서 서버가 아예 안 뜬다",
    symptom:
      "로컬 설정과 운영 설정이 한 파일에 섞여 있었고, 키가 하나 빠지면 부팅 단계에서 그대로 실패했습니다.",
    cause:
      "설정이 코드에 박혀 있으면 환경이 바뀔 때마다 사람이 기억해서 고쳐야 합니다. 기억은 빠집니다.",
    fix: "prod 프로파일을 분리하고 값은 전부 ${ENV_VAR} 로 주입, .example 템플릿으로 형식만 남겨 운영을 안정화했습니다.",
    detail:
      "6장의 CORS 허용 목록도 같은 이유로 코드에서 빠져나와 환경변수가 됐습니다."
  }
];

export function P10OpsIssues() {
  const {reducedMotion, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [open, setOpen] = useState<CaseKey>("acm");

  const pick = useCallback(
    (k: CaseKey) => {
      setOpen(k);
      const c = CASES.find(x => x.key === k);
      if (c) announce(`${c.no} — ${c.title}`);
    },
    [announce]
  );

  const active = CASES.find(c => c.key === open) ?? CASES[0];

  return (
    <Page index={11} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant} color="var(--mu-bad)">
        11 · 트러블슈팅 03
      </Kicker>

      <div className="mt-4">
        <Heading
          text="배포는 끝이 아니라 시작이었습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          기능이 다 됐다고 끝난 게 아니었습니다. 올리고 나서 생긴 문제 셋은 전부{" "}
          <strong style={{color: "var(--mu-warn)"}}>
            코드가 틀린 게 아니라 구조가 안 잡혀서
          </strong>{" "}
          생긴 것이었습니다. 하나씩 눌러 보세요.
        </Body>
      </div>

      <div className="mt-9" style={rise(on[IDX.cases], instant)}>
        <div className="flex flex-wrap gap-2">
          {CASES.map(c => {
            const sel = c.key === open;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => pick(c.key)}
                aria-pressed={sel}
                className="cursor-pointer rounded-md px-3.5 py-2 font-mono text-[11px] font-bold transition-colors duration-200"
                style={{
                  border: `1px solid ${
                    sel ? "var(--mu-warn)" : "rgba(255,255,255,0.14)"
                  }`,
                  background: sel ? "rgba(251,191,36,0.12)" : "transparent",
                  color: sel ? "var(--mu-warn)" : "var(--mu-muted)"
                }}
              >
                {c.no}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <p className="text-[18px] font-black leading-tight text-[var(--mu-text)] sm:text-[22px]">
            {active.title}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Card label="증상" accent="var(--mu-bad)">
            <p className="text-[13px] leading-6">{active.symptom}</p>
          </Card>
          <Card label="원인" accent="var(--mu-warn)">
            <p className="text-[13px] leading-6">{active.cause}</p>
          </Card>
          <Card label="해결" accent="var(--mu-ok)">
            <p className="text-[13px] leading-6">{active.fix}</p>
          </Card>
        </div>

        <div className="mt-4">
          <Hint>{active.detail}</Hint>
        </div>

        {/* 사고별 증거 */}
        <div className="mt-7">
          {active.key === "acm" ? (
            <Shot
              src="/projects/muscleup/acm-useast1.webp"
              alt="ACM 인증서 목록 — muscle-up.click, 미국 버지니아 북부 리전"
              caption="us-east-1(미국 버지니아 북부)에서 재발급한 인증서 — 리전이 이 화면의 전부다"
              w={1051}
              h={222}
            />
          ) : null}

          {active.key === "cache" ? (
            <div
              className="rounded-md p-5"
              style={{
                border: "1px solid var(--mu-border)",
                background: "var(--mu-panel)"
              }}
            >
              <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--mu-muted)]">
                배포 절차 — 고치기 전 / 고친 뒤
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  className="rounded p-3.5"
                  style={{
                    border: "1px solid rgba(248,113,113,0.3)",
                    background: "rgba(248,113,113,0.05)"
                  }}
                >
                  <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--mu-bad)]">
                    BEFORE
                  </div>
                  <ol className="mt-2 space-y-1 font-mono text-[11px] leading-5 text-[var(--mu-muted)]">
                    <li>1. 빌드</li>
                    <li>2. S3 업로드</li>
                    <li className="text-[var(--mu-bad)]">
                      3. ...끝 (엣지에 옛 파일이 남아 있음)
                    </li>
                  </ol>
                </div>
                <div
                  className="rounded p-3.5"
                  style={{
                    border: "1px solid rgba(74,222,128,0.3)",
                    background: "rgba(74,222,128,0.05)"
                  }}
                >
                  <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--mu-ok)]">
                    AFTER
                  </div>
                  <ol className="mt-2 space-y-1 font-mono text-[11px] leading-5 text-[var(--mu-muted)]">
                    <li>1. 빌드</li>
                    <li>2. S3 업로드</li>
                    <li className="text-[var(--mu-ok)]">
                      3. CloudFront Invalidation (/*)
                    </li>
                    <li className="text-[var(--mu-ok)]">4. 캐시 정책 점검</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : null}

          {active.key === "env" ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
              <CodePanel
                filename="application.properties · application-prod.properties"
                badge={{text: "실제 코드", color: "var(--mu-ok)"}}
                borderColor="var(--mu-code-border)"
              >
                <div className="py-2">
                  <CodeLine n={1}>
                    <Cm>{"# desc: 활성 프로필을 환경변수로 분리"}</Cm>
                  </CodeLine>
                  <CodeLine n={2} highlight>
                    {"spring.profiles.active=${SPRING_PROFILES_ACTIVE:local}"}
                  </CodeLine>
                  <CodeLine n={3}>{""}</CodeLine>
                  <CodeLine n={4}>
                    <Cm>{"# desc: prod 는 DB/키를 전부 환경변수로만 주입"}</Cm>
                  </CodeLine>
                  <CodeLine n={5} highlight>
                    {"spring.datasource.url=${DB_URL}"}
                  </CodeLine>
                  <CodeLine n={6} highlight>
                    {"spring.datasource.username=${DB_USERNAME}"}
                  </CodeLine>
                  <CodeLine n={7} highlight>
                    {"spring.datasource.password=${DB_PASSWORD}"}
                  </CodeLine>
                  <CodeLine n={8}>
                    {"openai.api.key=${OPENAI_API_KEY:}"}
                  </CodeLine>
                  <CodeLine n={9}>
                    {"google.client-id=${GOOGLE_CLIENT_ID:}"}
                  </CodeLine>
                  <CodeLine n={10}>
                    {"google.client-secret=${GOOGLE_CLIENT_SECRET:}"}
                  </CodeLine>
                  <CodeLine n={11}>{""}</CodeLine>
                  <CodeLine n={12}>
                    <Cm>{"# desc: .example 로 기본값/형식만 제공"}</Cm>
                  </CodeLine>
                  <CodeLine n={13}>
                    {"spring.mail.username=${MAIL_USERNAME:}"}
                  </CodeLine>
                  <CodeLine n={14}>
                    {"spring.mail.password=${MAIL_PASSWORD:}"}
                  </CodeLine>
                </div>
              </CodePanel>
              <Shot
                src="/projects/muscleup/code-env.webp"
                alt="application.properties 계열 3개 파일의 환경변수 분리"
                caption="local / prod / example 세 벌 — 실제 값은 어디에도 커밋되지 않는다"
                w={1600}
                h={1319}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Page>
  );
}
