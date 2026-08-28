"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useMuscleUp} from "../context";
import {
  Body,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  rise,
  usePageIn
} from "../parts";
import {useOnScreen, usePageVisible, useTimeline} from "../../_kit/useTimeline";

// PAGE 09 — AWS 정적 배포 운영
//
// 개발 실체: PDF 11쪽 「AWS 정적 배포 운영」 원문
//            Route 53 · ACM · CloudFront · S3 · RDS(MySQL) 각 역할과
//            「도메인 → CloudFront → S3」 파이프라인, HTTP→HTTPS 강제,
//            환경변수 기반 설정 관리
// 연출 장치: **요청 하나가 인프라를 실제로 통과한다** — 관람객이 요청을 쏘면
//            홉이 하나씩 켜지고, 각 홉이 무슨 일을 하는지가 그때 나타난다
//
// ⚠️ CloudFront 콘솔 캡처는 계정 ARN 이 그대로 찍혀 있어 싣지 않았다.
//    설정값(TLSv1.2_2021 · HTTP/2 · 기본 루트 index.html)만 옮겼다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, flow: 3};

const HOPS = [
  {
    key: "route53",
    name: "Route 53",
    role: "도메인 · DNS 레코드",
    say: "muscle-up.click 이 어디로 가야 하는지 여기서 정해진다.",
    color: "var(--mu-primary)"
  },
  {
    key: "acm",
    name: "ACM",
    role: "TLS 인증서",
    say: "HTTPS 로 말할 수 있게 인증서를 붙인다. HTTP 로 오면 HTTPS 로 되돌린다.",
    color: "var(--mu-warn)"
  },
  {
    key: "cloudfront",
    name: "CloudFront",
    role: "엣지 캐싱 · CDN",
    say: "가까운 엣지에서 바로 준다. S3 로 가는 부하가 줄어든다.",
    color: "var(--mu-accent)"
  },
  {
    key: "s3",
    name: "S3",
    role: "React 빌드 산출물",
    say: "index.html 과 정적 파일이 여기 있다. 서버가 따로 돌지 않는다.",
    color: "var(--mu-ray)"
  },
  {
    key: "api",
    name: "API · DB",
    // PDF 11쪽은 「RDS(MySQL)」 이라고 적었지만, application-prod.properties 는
    // postgresql:// + PostgreSQLDialect 다. MySQL 은 로컬 프로파일 쪽이다.
    role: "Spring Boot · PostgreSQL",
    say: "화면이 뜬 뒤의 데이터 요청은 이쪽으로 간다. 접속 정보는 환경변수로만 들어온다.",
    color: "var(--mu-ok)"
  }
] as const;

export function P09Infra() {
  const {reducedMotion, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const boxRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(boxRef, 0.2);
  const visible = usePageVisible();

  const [hop, setHop] = useState(-1);
  const [running, setRunning] = useState(false);

  // 홉 진행은 화면 밖·탭 숨김이면 멈춘다(스펙 A-8).
  useEffect(() => {
    if (!running || !onScreen || !visible) return;
    if (hop >= HOPS.length - 1) {
      setRunning(false);
      return;
    }
    const t = window.setTimeout(() => setHop(h => h + 1), 820);
    return () => window.clearTimeout(t);
  }, [running, onScreen, visible, hop]);

  const send = useCallback(() => {
    setHop(0);
    setRunning(true);
    announce("요청을 보냅니다.");
  }, [announce]);

  return (
    <Page index={10} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        10 · 인프라
      </Kicker>

      <div className="mt-4">
        <Heading
          text="주소를 치면 무슨 일이 일어나는가"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          역할을 하나로 뭉쳐 놓으면 장애가 났을 때{" "}
          <strong>어디가 문제인지 알 수가 없습니다.</strong> 그래서 도메인 ·
          인증서 · CDN · 스토리지를 각각 다른 서비스에 맡겼습니다. 아래에서
          요청을 한 번 보내 보세요.
        </Body>
      </div>

      <div
        ref={boxRef}
        className="mt-9 rounded-md p-5"
        style={{
          border: "1px solid var(--mu-border)",
          background: "var(--mu-panel)",
          ...rise(on[IDX.flow], instant)
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--mu-muted)]">
            GET https://muscle-up.click
          </span>
          <button
            type="button"
            onClick={send}
            className="cursor-pointer rounded px-3.5 py-2 font-mono text-[11px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid rgba(244,114,182,0.45)",
              background: "rgba(244,114,182,0.14)",
              color: "var(--mu-accent)"
            }}
          >
            {hop < 0 ? "요청 보내기 ▶" : "다시 보내기 ↻"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-5">
          {HOPS.map((h, i) => {
            const done = i < hop;
            const active = i === hop;
            const lit = done || active;
            return (
              <div
                key={h.key}
                className="rounded-md p-3 transition-[border-color,background-color,box-shadow] duration-300"
                style={{
                  border: `1px solid ${
                    lit ? h.color : "rgba(255,255,255,0.10)"
                  }`,
                  background: lit
                    ? `color-mix(in srgb, ${h.color} 10%, transparent)`
                    : "rgba(255,255,255,0.02)",
                  boxShadow: active
                    ? `0 0 14px color-mix(in srgb, ${h.color} 32%, transparent)`
                    : "none"
                }}
              >
                <div
                  className="font-mono text-[11px] font-bold"
                  style={{color: lit ? h.color : "var(--mu-muted)"}}
                >
                  {done ? "✓ " : ""}
                  {h.name}
                </div>
                <div className="mt-1 font-mono text-[10px] leading-4 text-[var(--mu-faint)]">
                  {h.role}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="mt-4 min-h-[52px] rounded px-3.5 py-3"
          style={{
            background: "var(--mu-code-bg)",
            border: "1px solid var(--mu-code-border)"
          }}
        >
          <p className="font-mono text-[11px] leading-5 text-[var(--mu-text)]">
            {hop < 0
              ? "아직 아무 데도 가지 않았습니다."
              : `${HOPS[hop].name} — ${HOPS[hop].say}`}
          </p>
        </div>

        <div className="mt-3">
          <Hint>
            정적 파일은 서버를 거치지 않고 엣지에서 바로 나갑니다. 그래서
            배포라는 게 「S3 에 올리고 캐시를 지우는 것」이 됩니다 — 이게 다음
            장의 사고 원인이었습니다.
          </Hint>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Panel label="배포 파이프라인">
          <p className="text-[13px] leading-6 text-[var(--mu-muted)]">
            도메인 → CloudFront → S3 로 이어지는 SPA 정적 배포 구조. 배포 절차가
            단순해진다.
          </p>
        </Panel>
        <Panel label="전 구간 HTTPS">
          <p className="text-[13px] leading-6 text-[var(--mu-muted)]">
            HTTP → HTTPS 리다이렉트를 걸어 모든 요청을 암호화 통신으로 강제.
            보안 정책은 TLSv1.2_2021.
          </p>
        </Panel>
        <Panel label="설정 분리">
          <p className="text-[13px] leading-6 text-[var(--mu-muted)]">
            환경변수 기반 설정으로 비밀 키 하드코딩 제거, Local / Production 을
            명확히 분리.
          </p>
        </Panel>
      </div>
    </Page>
  );
}
