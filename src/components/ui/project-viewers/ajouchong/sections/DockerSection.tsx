"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  Caveat,
  CodeLine,
  CodePanel,
  Kicker,
  NoteBox,
  SectionShell,
  TryHint,
  WordHeading,
  fade,
  rise
} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

// 04 · 로컬은 되는데 서버에선 달랐다 — 환경 차이를 나란히 놓고 직접 돌려 보게 한다.
// Docker 를 "쓰면 좋다"가 아니라 "무엇이 같아지는가"로 설명하려는 장.

const STEPS = [0, 150, 600, 1000];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

interface EnvRow {
  k: string;
  local: string;
  server: string;
  /** Docker 로 고정되는 항목인가 */
  pinned: boolean;
}

const ENV: EnvRow[] = [
  {k: "Node", local: "18.17.0", server: "16.20.2", pinned: true},
  {k: "npm", local: "9.6.7", server: "8.19.4", pinned: true},
  {k: "OS", local: "macOS 14", server: "Ubuntu 22.04", pinned: true},
  {k: "파일명 대소문자", local: "구분 안 함", server: "구분함", pinned: true},
  {k: "TZ", local: "Asia/Seoul", server: "UTC", pinned: true}
];

/** Docker 로 고정한 뒤 양쪽이 공유하는 값 — 이미지가 정하는 것들. */
const PINNED: Record<string, string> = {
  Node: "18.17.0",
  npm: "9.6.7",
  OS: "node:18-alpine",
  "파일명 대소문자": "구분함",
  TZ: "Asia/Seoul"
};

const DOCKERFILE = [
  "FROM node:18-alpine AS build",
  "WORKDIR /app",
  "COPY package*.json ./",
  "RUN npm ci",
  "COPY . .",
  "RUN npm run build",
  "",
  "FROM nginx:1.25-alpine",
  "COPY --from=build /app/build /usr/share/nginx/html",
  "COPY nginx.conf /etc/nginx/conf.d/default.conf"
];

type Phase = "idle" | "running" | "done";

export function DockerSection() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {threshold: 0.2});
  const on = useTimeline(STEPS, inView, reducedMotion);
  const instant = reducedMotion;

  const [docker, setDocker] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [ranBare, setRanBare] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  const run = useCallback(() => {
    if (phase === "running") return;
    setPhase("running");
    announce("빌드를 실행합니다.");

    const land = () => {
      setPhase("done");
      if (!docker) setRanBare(true);
      announce(
        docker
          ? "두 환경 모두 같은 이미지를 실행해 결과가 같습니다."
          : "환경이 달라 서버 빌드가 실패했습니다."
      );
    };

    if (instant) {
      land();
      return;
    }
    timer.current = window.setTimeout(land, 1000);
  }, [phase, docker, instant, announce]);

  const toggleDocker = useCallback(() => {
    setDocker(prev => {
      setPhase("idle");
      announce(
        !prev
          ? "Docker 로 환경을 고정했습니다. 다시 실행해 보세요."
          : "Docker 를 껐습니다. 각자 환경으로 돌아갑니다."
      );
      return !prev;
    });
  }, [announce]);

  const busy = phase === "running";
  const showResult = phase === "done";

  const valueOf = (row: EnvRow, side: "local" | "server") =>
    docker && row.pinned ? PINNED[row.k] : row[side];

  return (
    <SectionShell innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant} color="var(--aj-warn)">
        04 · 두 번째 사고
      </Kicker>

      <div className="mt-4" style={rise(on[IDX.heading], instant)}>
        <WordHeading
          text="로컬은 되는데 서버에선 달랐다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          404를 고치고 나니 다음 벽이 나왔습니다. 같은 코드인데 내 노트북에서는
          빌드가 되고 서버에서는 안 됐습니다. 원인은 코드가 아니라{" "}
          <strong>코드를 돌리는 환경</strong>이었습니다.
        </Body>
        <div className="mt-3">
          <TryHint>
            먼저 그냥 실행해 보고, Docker 스위치를 켠 뒤 다시 실행해 보세요
          </TryHint>
        </div>
      </div>

      <div className="mt-9" style={rise(on[IDX.demo], instant, "0.7s")}>
        {/* 컨트롤 */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="rounded-md px-4 py-2.5 font-mono text-[12px] font-bold transition-colors duration-150 disabled:opacity-50"
            style={{
              background: "rgba(251,113,133,0.16)",
              border: "1px solid rgba(251,113,133,0.45)",
              color: "var(--aj-accent)"
            }}
          >
            {busy ? "실행 중…" : "▶ npm run build 실행"}
          </button>

          <button
            type="button"
            onClick={toggleDocker}
            role="switch"
            aria-checked={docker}
            className="flex items-center gap-3 rounded-md border px-4 py-2.5 transition-colors duration-200"
            style={{
              borderColor: docker
                ? "rgba(74,222,128,0.45)"
                : "rgba(255,255,255,0.16)",
              background: docker
                ? "rgba(74,222,128,0.08)"
                : "rgba(255,255,255,0.03)"
            }}
          >
            <span className="font-mono text-[12px] font-bold text-white">
              Docker
            </span>
            <span
              className="relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors duration-200"
              style={{
                background: docker ? "var(--aj-ok)" : "rgba(255,255,255,0.18)"
              }}
              aria-hidden="true"
            >
              <span
                className="absolute top-[3px] h-[16px] w-[16px] rounded-full bg-white transition-[left] duration-200"
                style={{left: docker ? "21px" : "3px"}}
              />
            </span>
          </button>
        </div>

        {/* 두 대의 기계 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(["local", "server"] as const).map(side => {
            const isLocal = side === "local";
            const label = isLocal ? "내 노트북" : "배포 서버";
            const ok = docker || isLocal;
            return (
              <div
                key={side}
                className="rounded-md border p-4 transition-colors duration-300"
                style={{
                  borderColor: !showResult
                    ? "rgba(255,255,255,0.12)"
                    : ok
                    ? "rgba(74,222,128,0.35)"
                    : "rgba(248,113,113,0.4)",
                  background: !showResult
                    ? "rgba(255,255,255,0.02)"
                    : ok
                    ? "rgba(74,222,128,0.05)"
                    : "rgba(248,113,113,0.06)"
                }}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-white">
                    {label}
                  </span>
                  {docker ? (
                    <span
                      className="rounded px-2 py-0.5 font-mono text-[10px] font-black"
                      style={{
                        background: "rgba(74,222,128,0.16)",
                        color: "var(--aj-ok)"
                      }}
                    >
                      같은 이미지
                    </span>
                  ) : null}
                </div>

                <dl className="space-y-1">
                  {ENV.map(row => {
                    const v = valueOf(row, side);
                    const other = valueOf(row, isLocal ? "server" : "local");
                    const mismatch = v !== other;
                    return (
                      <div
                        key={row.k}
                        className="flex items-center justify-between gap-2 rounded px-2 py-1.5"
                        style={{
                          background: mismatch
                            ? "rgba(248,113,113,0.09)"
                            : "rgba(255,255,255,0.03)"
                        }}
                      >
                        <dt className="shrink-0 font-mono text-[10px] text-[var(--aj-muted)]">
                          {row.k}
                        </dt>
                        <dd
                          className="min-w-0 truncate font-mono text-[11px]"
                          style={{
                            color: mismatch
                              ? "var(--aj-bad)"
                              : "rgba(255,255,255,0.8)"
                          }}
                        >
                          {v}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                {/* 실행 결과 */}
                <div className="mt-3 min-h-[62px] rounded border border-[rgba(255,255,255,0.09)] bg-[rgba(0,0,0,0.45)] p-2.5">
                  {busy ? (
                    <span className="font-mono text-[11px] text-[var(--aj-muted)]">
                      building…
                      <span className="aj-caret ml-0.5">▌</span>
                    </span>
                  ) : showResult ? (
                    ok ? (
                      <div className="font-mono text-[11px] leading-5">
                        <div style={{color: "var(--aj-ok)"}}>
                          ✓ Compiled successfully
                        </div>
                        <div className="text-[var(--aj-faint)]">
                          build/ 생성 · 서빙 준비 완료
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-[11px] leading-5">
                        <div style={{color: "var(--aj-bad)"}}>✕ 빌드 실패</div>
                        <div className="text-[var(--aj-faint)]">
                          Unsupported engine · Module not found: ./Notice
                        </div>
                      </div>
                    )
                  ) : (
                    <span className="font-mono text-[11px] text-[var(--aj-faint)]">
                      실행 대기
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dockerfile */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
          <CodePanel
            filename="Dockerfile"
            borderColor={
              docker ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.12)"
            }
            footer={
              docker
                ? "빌드도 서빙도 이미지 안에서 — 바깥 환경이 끼어들 자리가 없다"
                : "이 파일을 쓰기 전에는 각자 컴퓨터가 곧 빌드 환경이었다"
            }
          >
            <div className="py-2">
              {DOCKERFILE.map((line, i) => (
                <CodeLine
                  key={i}
                  n={i + 1}
                  dim={!docker}
                  highlight={docker && (i === 0 || i === 7)}
                >
                  {line || " "}
                </CodeLine>
              ))}
            </div>
          </CodePanel>

          <div
            style={fade(showResult || ranBare, instant, "0.6s")}
            aria-hidden={!(showResult || ranBare)}
          >
            {showResult || ranBare ? (
              <NoteBox
                label={docker ? "고친 방법" : "원인"}
                accent={docker ? "var(--aj-ok)" : "var(--aj-warn)"}
              >
                <p className="text-[14px] leading-[28px]">
                  {docker ? (
                    <>
                      환경을 <strong>이미지 안에 넣어</strong> 두 컴퓨터가 같은
                      것을 실행하게 했습니다. Node 버전도, 파일명 대소문자
                      규칙도 이제 이미지가 정합니다.{" "}
                      <span className="text-[var(--aj-accent)]">
                        &lsquo;내 컴퓨터에선 되는데&rsquo;라는 문장 자체가
                        성립하지 않게
                      </span>{" "}
                      만든 셈입니다.
                    </>
                  ) : (
                    <>
                      Node 버전이 두 단계 차이 났고, 무엇보다{" "}
                      <strong>파일명 대소문자</strong>에서 갈렸습니다. macOS는
                      구분하지 않아{" "}
                      <code className="font-mono text-[13px]">./notice</code> 로
                      써도 넘어갔지만, Ubuntu는 구분해서 파일을 못 찾았습니다.
                      Docker 스위치를 켜 보세요.
                    </>
                  )}
                </p>
              </NoteBox>
            ) : null}
          </div>
        </div>

        <Caveat>
          버전 숫자와 실패 메시지는 당시 상황을 재현한 예시입니다. 빌드 시간
          변화는 측정하지 않았습니다.
        </Caveat>
      </div>
    </SectionShell>
  );
}
