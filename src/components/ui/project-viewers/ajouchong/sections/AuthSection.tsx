"use client";

import {useCallback, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  CodeLine,
  CodePanel,
  Kicker,
  SectionShell,
  TryHint,
  WordHeading,
  rise
} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

// 05 · 보호 라우트 — 공지는 누구나, 글쓰기는 학생회만.
// 앞의 두 장이 배포 사고였으니 여기는 짧게 간다(구조 설명 한 장).

const STEPS = [0, 150, 600, 1000];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const TARGETS = [
  {path: "/notice", label: "공지 보기", guarded: false},
  {path: "/qna", label: "문의 목록", guarded: false},
  {path: "/admin/notice/new", label: "공지 작성", guarded: true},
  {path: "/admin/qna", label: "문의 답변", guarded: true}
];

export function AuthSection() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {threshold: 0.2});
  const on = useTimeline(STEPS, inView, reducedMotion);
  const instant = reducedMotion;

  const [loggedIn, setLoggedIn] = useState(false);
  const [at, setAt] = useState("/notice");
  const [bounced, setBounced] = useState(false);

  const visit = useCallback(
    (path: string, guarded: boolean) => {
      if (guarded && !loggedIn) {
        setAt("/login");
        setBounced(true);
        announce(`${path} 은 로그인이 필요해 /login 으로 보냈습니다.`);
        return;
      }
      setAt(path);
      setBounced(false);
      announce(`${path} 로 이동했습니다.`);
    },
    [loggedIn, announce]
  );

  const toggleLogin = useCallback(() => {
    setLoggedIn(prev => {
      if (prev) {
        setAt("/notice");
        setBounced(false);
      }
      announce(prev ? "로그아웃했습니다." : "학생회 계정으로 로그인했습니다.");
      return !prev;
    });
  }, [announce]);

  return (
    <SectionShell innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant}>
        05 · 누가 쓸 수 있는가
      </Kicker>

      <div className="mt-4" style={rise(on[IDX.heading], instant)}>
        <WordHeading
          text="읽기는 모두에게, 쓰기는 학생회에만"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          공지·Q&amp;A·자료는 로그인 없이 열립니다. 반대로 공지를 올리거나
          문의에 답하는 화면은 학생회만 들어가야 했습니다. 라이브러리를 붙일
          만큼 복잡한 요구가 아니라 <strong>Context 하나</strong>로 로그인
          상태를 들고, 보호가 필요한 라우트만 감쌌습니다.
        </Body>
        <div className="mt-3">
          <TryHint>로그아웃 상태로 「공지 작성」을 눌러 보세요</TryHint>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]"
        style={rise(on[IDX.demo], instant, "0.7s")}
      >
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={toggleLogin}
            role="switch"
            aria-checked={loggedIn}
            className="flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors duration-200"
            style={{
              borderColor: loggedIn
                ? "rgba(74,222,128,0.45)"
                : "rgba(255,255,255,0.16)",
              background: loggedIn
                ? "rgba(74,222,128,0.08)"
                : "rgba(255,255,255,0.03)"
            }}
          >
            <span>
              <span className="block text-[13px] font-bold text-white">
                {loggedIn ? "학생회 계정으로 로그인됨" : "로그아웃 상태"}
              </span>
              <span className="mt-0.5 block font-mono text-[10px] text-[var(--aj-muted)]">
                AuthContext · user = {loggedIn ? "{ role: 'council' }" : "null"}
              </span>
            </span>
            <span
              className="relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors duration-200"
              style={{
                background: loggedIn ? "var(--aj-ok)" : "rgba(255,255,255,0.18)"
              }}
              aria-hidden="true"
            >
              <span
                className="absolute top-[3px] h-[16px] w-[16px] rounded-full bg-white transition-[left] duration-200"
                style={{left: loggedIn ? "21px" : "3px"}}
              />
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {TARGETS.map(t => (
              <button
                key={t.path}
                type="button"
                onClick={() => visit(t.path, t.guarded)}
                className="rounded-md border px-3 py-2.5 text-left transition-colors duration-150"
                style={{
                  borderColor:
                    at === t.path
                      ? "var(--aj-primary)"
                      : "rgba(255,255,255,0.14)",
                  background:
                    at === t.path
                      ? "rgba(251,113,133,0.1)"
                      : "rgba(255,255,255,0.03)"
                }}
              >
                <span className="block text-[12px] font-bold text-white">
                  {t.label}
                  {t.guarded ? (
                    <span
                      className="ml-1.5 text-[10px]"
                      style={{color: "var(--aj-warn)"}}
                      aria-label="보호된 경로"
                    >
                      🔒
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[10px] text-[var(--aj-muted)]">
                  {t.path}
                </span>
              </button>
            ))}
          </div>

          {/* 현재 위치 */}
          <div
            className="rounded-md border px-4 py-3 transition-colors duration-300"
            style={{
              borderColor: bounced
                ? "rgba(251,191,36,0.45)"
                : "rgba(255,255,255,0.12)",
              background: bounced ? "rgba(251,191,36,0.08)" : "rgba(0,0,0,0.3)"
            }}
          >
            <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--aj-muted)]">
              현재 주소
            </div>
            <div
              className="mt-1 font-mono text-[14px] font-bold"
              style={{color: bounced ? "var(--aj-warn)" : "var(--aj-accent)"}}
            >
              {at}
            </div>
            {bounced ? (
              <p className="mt-2 text-[12px] leading-5 text-[var(--aj-muted)]">
                보호된 경로라 <code className="font-mono">Navigate</code> 가
                로그인 화면으로 돌려보냈습니다. 위 스위치를 켜고 다시 눌러
                보세요.
              </p>
            ) : null}
          </div>
        </div>

        <CodePanel
          filename="ProtectedRoute.js"
          borderColor="rgba(255,255,255,0.12)"
          footer="보호가 필요한 라우트만 이 컴포넌트로 감싼다"
        >
          <div className="py-2">
            <CodeLine n={1}>
              {"function ProtectedRoute({ children }) {"}
            </CodeLine>
            <CodeLine n={2}>
              {"  const { user } = useContext(AuthContext);"}
            </CodeLine>
            <CodeLine n={3} highlight={bounced}>
              {"  return user ? children : <Navigate to='/login' />;"}
            </CodeLine>
            <CodeLine n={4}>{"}"}</CodeLine>
          </div>
        </CodePanel>
      </div>
    </SectionShell>
  );
}
