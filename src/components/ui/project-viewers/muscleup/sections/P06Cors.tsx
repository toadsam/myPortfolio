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
  LogLine,
  Page,
  Shot,
  Toggle,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 06 — 트러블슈팅 02 · 쿠키가 안 실린다
//
// 개발 실체: PDF 13쪽 「CORS + 쿠키 인증 연동」
//            문제: 프론트–API 도메인 분리로 인한 쿠키 동작 및 프리플라이트 이슈
//            해결: 허용 Origin/Method/Header + credentials 설정으로 안정화
// 연출 장치: **관람객이 스위치 두 개를 직접 끄고 켜며 요청을 날린다.**
//            (스펙 PAGE 06 의 「관람객이 직접 실패를 발생시킨다」)
//
// 스펙의 「출석이 두 번 찍혔다 → 멱등성」은 PDF 에 근거가 없어 쓰지 않는다.

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, demo: 3, after: 4};

type Entry = {
  id: number;
  time: string;
  method: string;
  path: string;
  status: number;
  note: string;
};

export function P06Cors() {
  const {reducedMotion, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [originAllowed, setOriginAllowed] = useState(false);
  const [credentials, setCredentials] = useState(false);
  const [log, setLog] = useState<Entry[]>([]);
  const [shake, setShake] = useState(false);
  const seq = useRef(0);
  const clock = useRef(0);

  const send = useCallback(() => {
    seq.current += 1;
    clock.current += 3;
    const time = `14:${String(20 + clock.current).padStart(2, "0")}`;
    const entries: Entry[] = [];

    // 프리플라이트 — Origin 이 허용 목록에 없으면 여기서 끝난다.
    if (!originAllowed) {
      entries.push({
        id: seq.current * 10,
        time,
        method: "OPTIONS",
        path: "/api/brags",
        status: 403,
        note: "Origin 불허"
      });
      setLog(prev => [...entries, ...prev].slice(0, 6));
      setShake(true);
      window.setTimeout(() => setShake(false), 300);
      announce("프리플라이트에서 막혔습니다. 본 요청은 나가지도 않았습니다.");
      return;
    }

    entries.push({
      id: seq.current * 10,
      time,
      method: "OPTIONS",
      path: "/api/brags",
      status: 204,
      note: "프리플라이트 통과"
    });

    // 본 요청 — credentials 가 없으면 쿠키가 실리지 않아 인증이 없는 요청이 된다.
    entries.push({
      id: seq.current * 10 + 1,
      time,
      method: "GET",
      path: "/api/brags",
      status: credentials ? 200 : 401,
      note: credentials ? "쿠키 동봉됨" : "쿠키 없음"
    });

    setLog(prev => [...entries.reverse(), ...prev].slice(0, 6));
    if (!credentials) {
      setShake(true);
      window.setTimeout(() => setShake(false), 300);
    }
    announce(
      credentials
        ? "요청이 성공했습니다."
        : "프리플라이트는 통과했지만 쿠키가 실리지 않아 401 입니다."
    );
  }, [originAllowed, credentials, announce]);

  const ok = originAllowed && credentials;

  return (
    <Page index={7} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant} color="var(--mu-bad)">
        07 · 트러블슈팅 02
      </Kicker>

      <div className="mt-4">
        <Heading
          text="로그인은 됐는데 목록이 안 나옵니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          프론트는 CloudFront 도메인, API 는 다른 도메인에 있습니다. 이렇게{" "}
          <strong>도메인이 갈리면</strong> 브라우저는 본 요청을 보내기 전에 먼저
          허락을 구하고, 쿠키는{" "}
          <strong style={{color: "var(--mu-bad)"}}>
            따로 허용해 주지 않으면 아예 실리지 않습니다.
          </strong>{" "}
          아래 스위치 두 개를 끄고 켜 보면, 같은 요청이 어디서 어떻게 죽는지
          보입니다.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        {/* ── 스위치 + 요청 ── */}
        <div
          className={`flex flex-col gap-4 rounded-md p-5 ${
            shake && !instant ? "mu-blocked" : ""
          }`}
          style={{
            border: `1px solid ${
              ok ? "rgba(74,222,128,0.32)" : "rgba(248,113,113,0.32)"
            }`,
            background: "var(--mu-panel)"
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--mu-muted)]">
              CorsConfig
            </span>
            <span
              className="rounded px-2 py-0.5 font-mono text-[10px] font-black"
              style={{
                background: ok
                  ? "rgba(74,222,128,0.16)"
                  : "rgba(248,113,113,0.16)",
                color: ok ? "var(--mu-ok)" : "var(--mu-bad)"
              }}
            >
              {ok ? "정상" : "미설정"}
            </span>
          </div>

          <Toggle
            on={originAllowed}
            onToggle={() => setOriginAllowed(v => !v)}
            title="allowedOrigins 에 프론트 도메인 등록"
            note="addAllowedOriginPattern(...)"
            onColor="var(--mu-ok)"
          />
          <Toggle
            on={credentials}
            onToggle={() => setCredentials(v => !v)}
            title="setAllowCredentials(true)"
            note="이게 없으면 쿠키가 실리지 않습니다"
            onColor="var(--mu-ok)"
          />

          <button
            type="button"
            onClick={send}
            className="cursor-pointer rounded-md px-4 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid rgba(244,114,182,0.45)",
              background: "rgba(244,114,182,0.14)",
              color: "var(--mu-accent)"
            }}
          >
            GET /api/brags — 자랑글 목록 요청
          </button>

          {/* 요청이 어디까지 갔는지 눈으로 */}
          <div className="flex items-center gap-2">
            {[
              {k: "브라우저", lit: true},
              {k: "프리플라이트", lit: originAllowed},
              {k: "본 요청", lit: originAllowed},
              {k: "인증 통과", lit: ok}
            ].map((s, i) => (
              <div key={s.k} className="flex flex-1 items-center gap-2">
                <span
                  className="flex-1 rounded px-2 py-1.5 text-center font-mono text-[10px] transition-colors duration-300"
                  style={{
                    border: `1px solid ${
                      s.lit ? "var(--mu-ok)" : "rgba(255,255,255,0.10)"
                    }`,
                    color: s.lit ? "var(--mu-ok)" : "var(--mu-faint)"
                  }}
                >
                  {s.k}
                </span>
                {i < 3 ? (
                  <span
                    className="shrink-0 font-mono text-[10px]"
                    style={{color: s.lit ? "var(--mu-ok)" : "var(--mu-bad)"}}
                  >
                    {s.lit ? "→" : "✕"}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div
            className="min-h-[112px] rounded"
            style={{
              background: "var(--mu-code-bg)",
              border: "1px solid var(--mu-code-border)"
            }}
          >
            {log.length === 0 ? (
              <p className="px-3 py-5 text-center font-mono text-[11px] text-[var(--mu-faint)]">
                아직 요청하지 않았습니다
              </p>
            ) : (
              <div className="py-1.5">
                {log.map(e => (
                  <LogLine
                    key={e.id}
                    time={e.time}
                    method={e.method}
                    path={e.path}
                    status={e.status}
                    note={e.note}
                  />
                ))}
              </div>
            )}
          </div>

          <p
            className="font-mono text-[11px] leading-5"
            style={{color: ok ? "var(--mu-ok)" : "var(--mu-warn)"}}
          >
            {!originAllowed
              ? "본 요청은 나가지도 않았습니다. 브라우저가 먼저 막습니다."
              : !credentials
              ? "가장 헷갈렸던 상태입니다 — 요청은 200 처럼 나가는데 서버는 로그인하지 않은 사람으로 봅니다."
              : "허용 Origin · Method · Header + credentials 가 다 맞아야 여기까지 옵니다."}
          </p>
        </div>

        {/* ── 해결한 코드 ── */}
        <CodePanel
          filename="CorsConfig.java"
          badge={{text: "실제 코드", color: "var(--mu-ok)"}}
          borderColor="var(--mu-code-border)"
        >
          <div className="py-2">
            <CodeLine n={1}>
              <Cm>
                {"// desc: 허용 Origin/Method/Header 지정 + credentials 허용"}
              </Cm>
            </CodeLine>
            <CodeLine n={2}>{"@Bean"}</CodeLine>
            <CodeLine n={3}>
              {"public CorsConfigurationSource corsConfigurationSource("}
            </CodeLine>
            <CodeLine n={4} highlight={originAllowed}>
              {'    @Value("${cors.allowed-origins:http://localhost:5173}")'}
            </CodeLine>
            <CodeLine n={5} highlight={originAllowed}>
              {"    List<String> allowedOrigins) {"}
            </CodeLine>
            <CodeLine n={6}>
              {"  CorsConfiguration cfg = new CorsConfiguration();"}
            </CodeLine>
            <CodeLine n={7} highlight={originAllowed}>
              {"  allowedOrigins.forEach(cfg::addAllowedOriginPattern);"}
            </CodeLine>
            <CodeLine n={8}>{'  cfg.addAllowedHeader("*");'}</CodeLine>
            <CodeLine n={9}>{'  cfg.addAllowedMethod("*");'}</CodeLine>
            <CodeLine n={10} highlight={credentials}>
              {"  cfg.setAllowCredentials(true);"}
            </CodeLine>
            <CodeLine n={11}>
              {'  source.registerCorsConfiguration("/**", cfg);'}
            </CodeLine>
            <CodeLine n={12}>{"}"}</CodeLine>
          </div>
        </CodePanel>
      </div>

      <div className="mt-4">
        <Hint>
          허용 목록을 코드에 박지 않고{" "}
          <strong>{"${cors.allowed-origins}"}</strong> 로 뺀 것이 핵심입니다 —
          로컬과 운영이 서로 다른 도메인을 쓰기 때문입니다. 이 이야기는 10장에서
          한 번 더 나옵니다.
        </Hint>
      </div>

      <div
        className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]"
        style={rise(on[IDX.after], instant)}
      >
        <Shot
          src="/projects/muscleup/code-cors.webp"
          alt="CorsConfig.java 전체 코드"
          caption="빨간 줄 두 개가 이 장에서 켜고 끈 스위치 두 개다"
          w={1600}
          h={634}
        />
        <div className="flex flex-col gap-3">
          <Card label="문제" accent="var(--mu-bad)">
            <p className="text-[13px] leading-6">
              프론트–API 도메인 분리로 인한 쿠키 동작 및 프리플라이트 이슈 발생
            </p>
          </Card>
          <Card label="해결" accent="var(--mu-ok)">
            <p className="text-[13px] leading-6">
              허용 Origin / Method / Header 지정 + credentials 설정으로 안정화
            </p>
          </Card>
        </div>
      </div>
    </Page>
  );
}
