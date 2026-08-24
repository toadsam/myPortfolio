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

// 03 · 새로고침하면 404가 떴다 — 이 방의 핵심.
//
// 「try_files 로 고쳤다」는 한 줄로 끝낼 수도 있었지만, 그러면 읽는 사람은
// 무엇이 왜 깨졌는지 모른 채 결론만 받는다. 여기서는 방문자가 직접 새로고침을
// 눌러 404를 만나고, 설정 한 줄을 켜서 같은 동작이 살아나는 걸 본다.

const STEPS = [0, 150, 600, 1000];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const PATH = "/notice";
const DOC_ROOT = "/usr/share/nginx/html";

/** 디스크에 실제로 있는 것 — 빌드 산출물이 전부다. */
const DISK = [
  {name: "index.html", dir: false},
  {name: "favicon.ico", dir: false},
  {name: "static/", dir: true},
  {name: "asset-manifest.json", dir: false}
];

type Phase = "idle" | "flying" | "ok" | "notfound";

export function RefreshSection() {
  const {reducedMotion, deployFixed, setDeployFixed, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {threshold: 0.2});
  const on = useTimeline(STEPS, inView, reducedMotion);
  const instant = reducedMotion;

  const [tryFiles, setTryFiles] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [attempts, setAttempts] = useState(0);
  const [sawError, setSawError] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  const refresh = useCallback(() => {
    if (phase === "flying") return;
    setPhase("flying");
    setAttempts(a => a + 1);
    announce("새로고침 중입니다.");

    const land = () => {
      if (tryFiles) {
        setPhase("ok");
        setDeployFixed(true);
        announce("200 OK — 공지 화면이 그대로 보입니다.");
      } else {
        setPhase("notfound");
        setSawError(true);
        announce(`404 Not Found — 서버가 ${PATH} 파일을 찾지 못했습니다.`);
      }
    };

    if (instant) {
      land();
      return;
    }
    timer.current = window.setTimeout(land, 950);
  }, [phase, tryFiles, instant, setDeployFixed, announce]);

  const toggleConf = useCallback(() => {
    setTryFiles(prev => {
      const next = !prev;
      // 껐으면 방의 「배포 ✓」도 정직하게 되돌린다.
      if (!next) setDeployFixed(false);
      setPhase("idle");
      announce(
        next
          ? "try_files 폴백을 켰습니다. 다시 새로고침해 보세요."
          : "try_files 폴백을 껐습니다."
      );
      return next;
    });
  }, [setDeployFixed, announce]);

  const busy = phase === "flying";

  return (
    <SectionShell innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant} color="var(--aj-bad)">
        03 · 배포에서 마주친 것
      </Kicker>

      <div className="mt-4" style={rise(on[IDX.heading], instant)}>
        <WordHeading
          text="새로고침하면 404가 떴다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          앞 장에서 메뉴로 이동할 때는 멀쩡했습니다. 그런데 그 주소에서{" "}
          <strong>새로고침</strong>을 누르면 이야기가 달라집니다. 이번엔
          브라우저가 라우터를 거치지 않고{" "}
          <code className="font-mono text-[13px] text-[var(--aj-accent)]">
            {PATH}
          </code>{" "}
          를 서버에 직접 요청하기 때문입니다.
        </Body>
        <div className="mt-3">
          <TryHint>
            먼저 새로고침을 눌러 보세요. 그다음 아래 nginx.conf 스위치를 켜고
            다시 눌러 보세요
          </TryHint>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]"
        style={rise(on[IDX.demo], instant, "0.7s")}
      >
        {/* ── 브라우저 ── */}
        <div className="flex flex-col gap-4">
          <div className="aj-browser">
            {/* 주소창 + 새로고침 */}
            <div className="flex items-center gap-2 border-b border-[var(--aj-frame)] bg-[rgba(255,255,255,0.03)] px-3 py-2">
              <button
                type="button"
                onClick={refresh}
                disabled={busy}
                aria-label="새로고침"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[rgba(255,255,255,0.09)] disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 ${busy && !instant ? "aj-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  style={{color: "var(--aj-accent)"}}
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                  <path d="M21 3v6h-6" />
                </svg>
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-1 rounded bg-[rgba(0,0,0,0.5)] px-2.5 py-1.5">
                <span className="shrink-0 font-mono text-[10px] text-[var(--aj-faint)]">
                  https://ajou-council.kr
                </span>
                <span
                  className="truncate font-mono text-[11px] font-bold"
                  style={{color: "var(--aj-accent)"}}
                >
                  {PATH}
                </span>
              </div>
            </div>

            {/* 요청이 날아가는 선 */}
            <div
              className="relative h-[3px] overflow-hidden bg-[rgba(255,255,255,0.05)]"
              aria-hidden="true"
            >
              {busy && !instant ? (
                <span
                  className="aj-travel absolute top-0 h-full w-[42px] rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--aj-accent))"
                  }}
                />
              ) : null}
            </div>

            {/* 화면 */}
            <div className="min-h-[268px] bg-[rgba(255,255,255,0.02)]">
              {phase === "notfound" ? (
                <div
                  className={`flex min-h-[268px] flex-col items-center justify-center px-6 text-center ${
                    instant ? "" : "aj-shake"
                  }`}
                >
                  <div
                    className="font-mono text-[52px] font-black leading-none"
                    style={{color: "var(--aj-bad)"}}
                  >
                    404
                  </div>
                  <div className="mt-3 font-mono text-[13px] text-[rgba(255,255,255,0.7)]">
                    Not Found
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-[var(--aj-faint)]">
                    nginx/1.25.3
                  </div>
                  <p className="mt-5 max-w-[34ch] text-[12px] leading-5 text-[var(--aj-muted)]">
                    서버는 <code className="font-mono">{PATH}</code> 라는 파일을
                    디스크에서 찾았고, 없어서 404를 돌려줬습니다.
                  </p>
                </div>
              ) : phase === "ok" ? (
                <div>
                  <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.07)] px-4 py-3">
                    <span className="text-[12px] font-black text-[var(--aj-primary)]">
                      총학생회
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[var(--aj-primary)]">
                      공지
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4">
                    {[
                      {t: "2026 상반기 전체학생대표자회의", d: "06.24"},
                      {t: "보궐선거 후보 등록 안내", d: "06.20"},
                      {t: "여름 대동제 부스 신청 공고", d: "06.18"}
                    ].map(r => (
                      <div
                        key={r.t}
                        className="flex items-center gap-3 rounded border border-[rgba(255,255,255,0.07)] px-3 py-2.5"
                      >
                        <span className="min-w-0 flex-1 truncate text-[12px] text-[rgba(255,255,255,0.82)]">
                          {r.t}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--aj-faint)]">
                          {r.d}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.07)] px-4 py-2.5">
                    <span className="font-mono text-[11px] text-[var(--aj-ok)]">
                      200 OK · 새로고침해도 그대로입니다
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[268px] flex-col items-center justify-center gap-2 px-6 text-center">
                  <span className="font-mono text-[12px] text-[var(--aj-faint)]">
                    {busy ? "요청을 보내는 중…" : "새로고침 버튼을 눌러 보세요"}
                  </span>
                  <span
                    className="font-mono text-[11px]"
                    style={{color: "var(--aj-muted)"}}
                  >
                    현재 try_files 폴백:{" "}
                    <span
                      style={{
                        color: tryFiles ? "var(--aj-ok)" : "var(--aj-bad)"
                      }}
                    >
                      {tryFiles ? "켜짐" : "꺼짐"}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 서버가 디스크에서 본 것 */}
          <CodePanel
            filename={`서버 디스크 — ${DOC_ROOT}`}
            borderColor="rgba(255,255,255,0.12)"
          >
            <div className="flex flex-wrap gap-1.5 p-3">
              {DISK.map(f => (
                <span
                  key={f.name}
                  className="rounded border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] px-2 py-1 font-mono text-[10px] text-[var(--aj-muted)]"
                >
                  {f.dir ? "📁" : "📄"} {f.name}
                </span>
              ))}
              <span
                className="rounded border px-2 py-1 font-mono text-[10px]"
                style={{
                  borderColor: "rgba(248,113,113,0.45)",
                  background: "rgba(248,113,113,0.1)",
                  color: "var(--aj-bad)"
                }}
              >
                ✕ notice — 없음
              </span>
            </div>
          </CodePanel>
        </div>

        {/* ── nginx.conf ── */}
        <div className="flex flex-col gap-4">
          <CodePanel
            filename="nginx.conf"
            borderColor={
              tryFiles ? "rgba(74,222,128,0.35)" : "rgba(248,113,113,0.3)"
            }
            footer={
              tryFiles
                ? "없는 경로는 index.html 로 넘겨 → 라우터가 처리한다"
                : "폴백이 없으면 서버는 파일이 없다고 답한다"
            }
          >
            <div className="py-2">
              <CodeLine n={1}>{"location / {"}</CodeLine>
              <CodeLine n={2} highlight={tryFiles} dim={!tryFiles}>
                {tryFiles
                  ? "  try_files $uri $uri/ /index.html;"
                  : "  # try_files $uri $uri/ /index.html;"}
              </CodeLine>
              <CodeLine n={3}>{"}"}</CodeLine>
            </div>
          </CodePanel>

          {/* 스위치 */}
          <button
            type="button"
            onClick={toggleConf}
            role="switch"
            aria-checked={tryFiles}
            className="flex items-center justify-between gap-3 rounded-md border px-4 py-3.5 text-left transition-colors duration-200"
            style={{
              borderColor: tryFiles
                ? "rgba(74,222,128,0.45)"
                : "rgba(255,255,255,0.16)",
              background: tryFiles
                ? "rgba(74,222,128,0.08)"
                : "rgba(255,255,255,0.03)"
            }}
          >
            <span className="min-w-0">
              <span className="block text-[13px] font-bold text-white">
                try_files 폴백
              </span>
              <span className="mt-0.5 block font-mono text-[10px] text-[var(--aj-muted)]">
                {tryFiles ? "켜짐 — 없는 경로도 SPA로" : "꺼짐 — 파일만 찾는다"}
              </span>
            </span>
            <span
              className="relative h-[24px] w-[44px] shrink-0 rounded-full transition-colors duration-200"
              style={{
                background: tryFiles ? "var(--aj-ok)" : "rgba(255,255,255,0.18)"
              }}
              aria-hidden="true"
            >
              <span
                className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-[left] duration-200"
                style={{left: tryFiles ? "23px" : "3px"}}
              />
            </span>
          </button>

          {/* 요청이 처리된 경로 */}
          <div className="rounded-md border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)] p-3">
            <div className="mb-2.5 font-mono text-[10px] tracking-[0.18em] text-[var(--aj-muted)]">
              요청이 지나간 길
            </div>
            <ol className="space-y-1.5 font-mono text-[11px] leading-5">
              <li className="text-[rgba(255,255,255,0.75)]">
                1. GET {PATH} — 브라우저 → 서버
              </li>
              <li className="text-[rgba(255,255,255,0.75)]">
                2. $uri 찾기 →{" "}
                <span style={{color: "var(--aj-bad)"}}>없음</span>
              </li>
              <li
                style={{
                  color: tryFiles ? "var(--aj-ok)" : "var(--aj-faint)",
                  textDecoration: tryFiles ? "none" : "line-through"
                }}
              >
                3. /index.html 로 폴백 {tryFiles ? "→ 200" : "(설정 없음)"}
              </li>
              <li
                style={{
                  color: tryFiles ? "var(--aj-faint)" : "var(--aj-bad)",
                  textDecoration: tryFiles ? "line-through" : "none"
                }}
              >
                {tryFiles ? "4. 404 (해당 없음)" : "4. 404 Not Found"}
              </li>
            </ol>
            <p className="mt-3 font-mono text-[10px] leading-5 text-[var(--aj-faint)]">
              시도 <span className="text-[var(--aj-muted)]">{attempts}</span>회
            </p>
          </div>
        </div>
      </div>

      {/* ── 결론: 404를 본 뒤에만 나온다 ── */}
      <div
        className="mt-6"
        style={fade(sawError, instant, "0.6s")}
        aria-hidden={!sawError}
      >
        {sawError ? (
          <NoteBox
            label={deployFixed ? "고친 방법" : "원인"}
            accent={deployFixed ? "var(--aj-ok)" : "var(--aj-bad)"}
          >
            <p className="text-[14px] leading-[28px]">
              {deployFixed ? (
                <>
                  설정 <strong>한 줄</strong>입니다. 없는 경로는 무조건{" "}
                  <code className="font-mono text-[13px]">index.html</code> 을
                  주고, 그다음은 클라이언트 라우터가 알아서 하게 넘깁니다.
                  코드는 한 글자도 바뀌지 않았습니다 —{" "}
                  <span className="text-[var(--aj-accent)]">
                    바뀐 건 서버가 요청을 해석하는 방식
                  </span>
                  이었습니다.
                </>
              ) : (
                <>
                  라우팅을 <strong>브라우저가</strong> 하는데, 새로고침은{" "}
                  <strong>서버에게</strong> 묻습니다. 서버 입장에서{" "}
                  <code className="font-mono text-[13px]">{PATH}</code> 는 그냥
                  없는 파일이라 404가 정상 동작이었습니다. 오른쪽 스위치를 켜
                  보세요.
                </>
              )}
            </p>
          </NoteBox>
        ) : null}
      </div>

      <Caveat>
        실제 배포는 nginx 1.25 · CRA 빌드 산출물 정적 서빙 구성이었습니다. 위
        디스크 목록과 상태 표시는 그 구성을 재현한 예시입니다.
      </Caveat>
    </SectionShell>
  );
}
