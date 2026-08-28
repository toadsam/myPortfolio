"use client";

import {useCallback, useRef, useState} from "react";
import {useMuscleUp} from "../context";
import {
  Body,
  Caveat,
  Cm,
  CodeLine,
  CodePanel,
  Heading,
  Hint,
  Kicker,
  LogLine,
  Page,
  Panel,
  Shot,
  Toggle,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 03 — 트러블슈팅 01 · 직접 훔쳐 보세요  ⭐ 이 방의 기술적 클라이맥스
//
// 개발 실체: PDF 8쪽 「JWT 이중 쿠키 + Refresh 로테이션」의 Threat → Design →
//            Control → Hardening 4단 구조 원문, + PDF 13쪽 「Refresh Token
//            재사용 공격 차단」
// 연출 장치: **관람객에게 훔친 토큰을 쥐여 주고 재사용 버튼을 준다.**
//            로테이션이 꺼져 있으면 진짜로 계속 통한다.
//
// 스펙의 「EXP 조작하기 → 999999」는 PDF 에 근거가 없어 쓰지 않는다.
// 대신 같은 연출 장치(관람객이 직접 공격해 본다)에 PDF 의 진짜 위협을 실었다.
//
// ⚠️ 2026-08-28 정정 — **이 방은 한때 거짓말을 하고 있었다.**
// 이 페이지는 "지금 로테이션으로 막고 있다"고 단언했지만, 저장소를 열면
// `RefreshTokenService.rotate()` 가 기존 토큰을 그대로 돌려준다. 로테이션은
// 2026-04-01 하루에 넣었다가(72b38fa) 같은 날 걷어냈다(bacef85) — 병렬 요청이
// 동시에 /refresh 를 쳐 서로의 토큰을 무효화하는 경쟁 상태로 로그아웃이 났다.
//
// 그래서 구조를 이렇게 바꿨다.
//   - 위쪽 데모는 그대로 둔다. **로테이션이라는 기법**이 재사용을 막는다는 건
//     사실이고, 관람객이 직접 눌러 보는 연출도 그대로 유효하다. 다만 라벨을
//     "첫 버전 / 적용 후" → "로테이션 없음 / 있음" 으로 바꿔, 이 서비스의
//     현재 상태를 가리키는 말이 아니게 했다.
//   - 아래에 **3막**을 새로 붙였다 — "그리고 되돌렸습니다".
// 넣었다 뺀 이야기가 넣기만 한 이야기보다 세다. 지어낼 필요가 없어서 더 그렇다.

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, demo: 3, after: 4};

type Attempt = {
  id: number;
  time: string;
  status: number;
  note: string;
};

const STOLEN = "eyJhbGciOiJIUzI1NiJ9…rt_9f2c";

export function P03Refresh() {
  const {reducedMotion, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [rotation, setRotation] = useState(false);
  const [log, setLog] = useState<Attempt[]>([]);
  const [revoked, setRevoked] = useState(false);
  const seq = useRef(0);
  const clock = useRef(0);

  const attack = useCallback(() => {
    seq.current += 1;
    clock.current += 7;
    const time = `10:${String(12 + clock.current).padStart(2, "0")}`;

    if (!rotation) {
      // 로테이션 이전 — 훔친 토큰은 만료 전까지 계속 통한다.
      setLog(prev =>
        [
          {
            id: seq.current,
            time,
            status: 200,
            note: "새 access 발급됨"
          },
          ...prev
        ].slice(0, 6)
      );
      announce("재사용이 성공했습니다. 새 access 토큰이 발급되었습니다.");
      return;
    }

    // 로테이션 이후 — 첫 재발급 때 기존 토큰이 DB 에서 사라진다.
    if (!revoked) {
      setRevoked(true);
      setLog(prev =>
        [
          {id: seq.current, time, status: 200, note: "발급 + 기존 토큰 폐기"},
          ...prev
        ].slice(0, 6)
      );
      announce("한 번은 통했지만 기존 토큰이 즉시 폐기되었습니다.");
      return;
    }
    setLog(prev =>
      [
        {id: seq.current, time, status: 401, note: "DB 에 없는 토큰"},
        ...prev
      ].slice(0, 6)
    );
    announce("재사용이 차단되었습니다. 401 입니다.");
  }, [rotation, revoked, announce]);

  const switchMode = useCallback(
    (next: boolean) => {
      setRotation(next);
      setRevoked(false);
      setLog([]);
      clock.current = 0;
      announce(
        next
          ? "로테이션을 켰습니다. 재발급 시 기존 토큰이 폐기됩니다."
          : "로테이션을 껐습니다. 훔친 토큰이 계속 통합니다."
      );
    },
    [announce]
  );

  return (
    <Page index={4} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant} color="var(--mu-bad)">
        04 · 트러블슈팅 01
      </Kicker>

      <div className="mt-4">
        <Heading
          text="이 토큰을 훔쳤다고 칩시다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          로컬스토리지에 넣어둔 토큰은 XSS 한 방이면 그대로 새어 나갑니다. 더
          문제는 그 다음입니다 —{" "}
          <strong style={{color: "var(--mu-bad)"}}>
            탈취한 Refresh 토큰은 만료 전까지 몇 번이고 다시 쓸 수 있습니다.
          </strong>{" "}
          아래 콘솔에 훔친 토큰을 미리 넣어 두었습니다. 직접 재사용해 보세요.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        {/* ── 공격 콘솔 ── */}
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: `1px solid ${
              rotation ? "rgba(74,222,128,0.32)" : "rgba(248,113,113,0.32)"
            }`,
            background: "var(--mu-panel)"
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--mu-muted)]">
              ATTACKER CONSOLE
            </span>
            <span
              className="rounded px-2 py-0.5 font-mono text-[10px] font-black"
              style={{
                background: rotation
                  ? "rgba(74,222,128,0.16)"
                  : "rgba(248,113,113,0.16)",
                color: rotation ? "var(--mu-ok)" : "var(--mu-bad)"
              }}
            >
              {rotation ? "로테이션 있음" : "로테이션 없음"}
            </span>
          </div>

          <div
            className="rounded px-3 py-2.5 font-mono text-[11px]"
            style={{
              background: "var(--mu-code-bg)",
              border: "1px solid var(--mu-code-border)"
            }}
          >
            <div className="text-[var(--mu-muted)]">훔친 refresh 토큰</div>
            <div
              className={`mt-1 break-all ${
                rotation && revoked && !instant ? "mu-revoke" : ""
              }`}
              style={{color: "var(--mu-warn)"}}
            >
              {STOLEN}
            </div>
            {rotation && revoked ? (
              <div
                className="mt-1.5 text-[10px]"
                style={{color: "var(--mu-ok)"}}
              >
                ↑ DB 에서 삭제됨 — 이제 이 문자열은 아무 의미가 없습니다
              </div>
            ) : null}
          </div>

          <Toggle
            on={rotation}
            onToggle={() => switchMode(!rotation)}
            title="Refresh 로테이션"
            note={
              rotation
                ? "켬 — 재발급 시 기존 토큰을 즉시 폐기합니다"
                : "끔 — 만료 전까지 몇 번이든 통합니다"
            }
            onColor="var(--mu-ok)"
          />

          <button
            type="button"
            onClick={attack}
            className="cursor-pointer rounded-md px-4 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid rgba(248,113,113,0.5)",
              background: "rgba(248,113,113,0.14)",
              color: "var(--mu-bad)"
            }}
          >
            POST /auth/refresh — 훔친 토큰으로 재발급 시도
          </button>

          <div
            className="min-h-[128px] rounded"
            style={{
              background: "var(--mu-code-bg)",
              border: "1px solid var(--mu-code-border)"
            }}
          >
            {log.length === 0 ? (
              <p className="px-3 py-4 text-center font-mono text-[11px] text-[var(--mu-faint)]">
                아직 시도하지 않았습니다
              </p>
            ) : (
              <div className="py-1.5">
                {log.map(a => (
                  <LogLine
                    key={a.id}
                    time={a.time}
                    method="POST"
                    path="/auth/refresh"
                    status={a.status}
                    note={a.note}
                  />
                ))}
              </div>
            )}
          </div>

          <p
            className="font-mono text-[11px] leading-5"
            style={{color: rotation ? "var(--mu-ok)" : "var(--mu-bad)"}}
          >
            {rotation
              ? revoked
                ? "두 번째부터는 막힙니다. 훔친 쪽이든 원래 주인이든, 먼저 쓴 쪽만 통합니다."
                : "한 번은 통합니다. 그 한 번이 기존 토큰을 지웁니다."
              : log.length === 0
              ? "로테이션이 꺼져 있습니다. 몇 번이든 눌러 보세요."
              : `${log.length}번 연속으로 통했습니다. 로테이션이 없으면 이렇게 됩니다.`}
          </p>
        </div>

        {/* ── 막은 코드 ── */}
        <CodePanel
          filename="RefreshTokenService.java"
          badge={{text: "1차 구현 · 지금은 아님", color: "var(--mu-warn)"}}
          borderColor="var(--mu-code-border)"
        >
          <div className="py-2">
            <CodeLine n={1}>
              <Cm>
                {"// desc: Refresh 토큰 재발급 시 기존 토큰 폐기(로테이션)"}
              </Cm>
            </CodeLine>
            <CodeLine n={2} highlight={rotation}>
              {"refreshTokenRepository.deleteByUser_Id(user.getId());"}
            </CodeLine>
            <CodeLine n={3}>
              {"String token = jwtUtil.generateRefreshToken(user.getEmail());"}
            </CodeLine>
            <CodeLine n={4}>{"refreshTokenRepository.save(rt);"}</CodeLine>
            <CodeLine n={5} highlight={rotation}>
              {"RefreshToken current = refreshTokenRepository"}
            </CodeLine>
            <CodeLine n={6} highlight={rotation}>
              {"    .findByToken(oldToken).orElseThrow(...);"}
            </CodeLine>
            <CodeLine n={7} highlight={rotation}>
              {"refreshTokenRepository.delete(current);"}
            </CodeLine>
            <CodeLine n={8}>{"return issueFor(user);"}</CodeLine>
            <CodeLine n={9}>{""}</CodeLine>
            <CodeLine n={10}>
              <Cm>{"// file: RefreshToken.java — DB 단일 저장 엔티티"}</Cm>
            </CodeLine>
            <CodeLine n={11}>{"@Entity"}</CodeLine>
            <CodeLine n={12}>{'@Table(name = "refresh_tokens")'}</CodeLine>
            <CodeLine n={13}>{"private String token;"}</CodeLine>
          </div>
        </CodePanel>
      </div>

      <div className="mt-4">
        <Hint>
          토큰을 DB 에 <strong>단 하나만</strong> 두는 것이 핵심입니다. 서버가
          기억하는 토큰이 하나뿐이면, 재발급 순간 나머지는 전부 무효가 됩니다.
          <br />
          <strong style={{color: "var(--mu-warn)"}}>
            그런데 바로 그 「하나뿐」이 문제를 만들었습니다.
          </strong>{" "}
          아래에 이어집니다.
        </Hint>
      </div>

      {/* PDF 8쪽의 4단 구조 원문 — 설계 당시의 계획이다. 그대로 남지 않았다. */}
      <p
        className="mt-10 font-mono text-[11px] tracking-[0.2em] text-[var(--mu-muted)]"
        style={rise(on[IDX.after], instant)}
      >
        설계 당시의 계획 (2025.09)
      </p>
      <div
        className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-4"
        style={rise(on[IDX.after], instant)}
      >
        <Panel label="THREAT">
          <p className="text-[13px] leading-6">
            로컬스토리지 토큰은 XSS 에 취약하고, 탈취된 Refresh 는 재사용 공격이
            가능하다
          </p>
        </Panel>
        <Panel label="DESIGN">
          <p className="text-[13px] leading-6">
            Access <strong style={{color: "var(--mu-accent)"}}>15분</strong> /
            Refresh <strong style={{color: "var(--mu-accent)"}}>14일</strong> 로
            분리하고, Refresh 는 DB 에 단일 저장
          </p>
        </Panel>
        <Panel label="CONTROL">
          <p className="text-[13px] leading-6">
            재발급 시 기존 Refresh 즉시 폐기(로테이션) → 오래된 토큰은 재사용
            불가
            <br />
            <strong style={{color: "var(--mu-warn)"}}>
              ← 이 칸이 지금은 다릅니다
            </strong>
          </p>
        </Panel>
        <Panel label="HARDENING">
          <p className="text-[13px] leading-6">
            HttpOnly 쿠키로 전달해 클라이언트 JS 접근 차단 + 권한(Role) 기반 API
            보호
          </p>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Shot
          src="/projects/muscleup/code-jwt.webp"
          alt="JwtUtil · RefreshTokenService · AuthController 코드"
          caption="만료 시간과 type 클레임 분리, HttpOnly 쿠키 저장까지"
          w={1600}
          h={869}
        />
        <div className="flex flex-col gap-3">
          <Caveat>
            위 콘솔의 토큰 문자열과 응답 시각은{" "}
            <strong>설명을 위해 만든 예시</strong>입니다. Access 15분과 HttpOnly
            쿠키는 실제 구현값입니다. 로테이션은{" "}
            <strong style={{color: "var(--mu-warn)"}}>
              한때 구현했다가 되돌렸습니다
            </strong>{" "}
            — 아래에 그 이야기를 적었습니다.
          </Caveat>
          <Panel label="아직 남은 것">
            <p className="text-[13px] leading-6 text-[var(--mu-muted)]">
              토큰이 실제로 탈취됐을 때 <strong>탐지</strong>하는 장치는 아직
              없습니다. 로테이션을 다시 넣더라도 재사용을 막을 뿐, 누가 먼저
              썼는지는 알려주지 않습니다. 기록에 남지 않은 것을 지어내지 않기
              위해 여기까지만 적습니다.
            </p>
          </Panel>
        </div>
      </div>

      {/* ── 3막 · 그리고 되돌렸습니다 ─────────────────────────────────────
          이 방에서 가장 중요한 칸이다. 위까지는 "교과서대로 막았다"는 이야기고,
          여기서부터가 **실제로 운영해 본 사람만 할 수 있는 이야기**다.
          근거는 전부 git 이다 — 2026-04-01 의 커밋 두 개. */}
      <div className="mt-12" style={rise(on[IDX.after], instant)}>
        <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--mu-bad)]">
          그런데 · 2026.04.01
        </p>
        <h3 className="mt-3 text-[22px] font-black leading-[1.4] text-[var(--mu-text)]">
          이 로테이션은 지금 코드에 없습니다. 제가 걷어냈습니다.
        </h3>

        <div className="mt-5 max-w-[760px]">
          <Body>
            로테이션을 켜자 <strong>로그아웃이 터지기 시작했습니다.</strong>{" "}
            화면 하나가 열릴 때 API 를 대여섯 개씩 동시에 부르는데, Access 가
            만료된 순간 그것들이 <strong>다 같이</strong> 401 을 받고{" "}
            <strong>다 같이</strong> 재발급을 칩니다. 첫 요청이 토큰을 갈아
            끼우면, 뒤따라온 요청들이 든 토큰은 그 순간 DB 에 없는 토큰이
            됩니다. 공격자가 아니라 <strong>본인이 재사용 공격자로 판정</strong>
            되는 겁니다.
          </Body>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
          <CodePanel
            filename="RefreshTokenService.java"
            badge={{text: "지금 코드", color: "var(--mu-ok)"}}
            borderColor="var(--mu-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                {"public String rotate(String oldToken) {"}
              </CodeLine>
              <CodeLine n={2}>
                {"    RefreshToken current = refreshTokenRepository"}
              </CodeLine>
              <CodeLine n={3}>
                {"        .findByToken(oldToken).orElseThrow(...);"}
              </CodeLine>
              <CodeLine n={4}>{""}</CodeLine>
              <CodeLine n={5}>
                <Cm>{"// Keep refresh token stable to prevent"}</Cm>
              </CodeLine>
              <CodeLine n={6}>
                <Cm>{"// race-condition logouts when parallel"}</Cm>
              </CodeLine>
              <CodeLine n={7}>
                <Cm>{"// requests trigger refresh at the same time."}</Cm>
              </CodeLine>
              <CodeLine n={8} highlight>
                {"    return current.getToken();"}
              </CodeLine>
              <CodeLine n={9}>{"}"}</CodeLine>
            </div>
          </CodePanel>

          <CodePanel
            filename="frontend/src/lib/api.ts"
            badge={{text: "대신 여기서 막습니다", color: "var(--mu-ok)"}}
            borderColor="var(--mu-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>{"// 재발급은 한 번만 나간다 (single-flight)"}</Cm>
              </CodeLine>
              <CodeLine n={2}>{"let refreshing = false;"}</CodeLine>
              <CodeLine n={3}>
                {"let waiters: Array<(ok: boolean) => void> = [];"}
              </CodeLine>
              <CodeLine n={4}>{""}</CodeLine>
              <CodeLine n={5} highlight>
                {"if (refreshing) {"}
              </CodeLine>
              <CodeLine n={6} highlight>
                {"  const ok = await new Promise("}
              </CodeLine>
              <CodeLine n={7} highlight>
                {"    r => waiters.push(r));"}
              </CodeLine>
              <CodeLine n={8}>
                {"  if (!ok) return Promise.reject(error);"}
              </CodeLine>
              <CodeLine n={9}>{"  return api(originalRequest);"}</CodeLine>
              <CodeLine n={10}>{"}"}</CodeLine>
            </div>
          </CodePanel>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Panel label="바꾼 것">
            <p className="text-[13px] leading-6">
              서버는 토큰을 <strong>회전시키지 않습니다</strong>. 대신 프론트가
              재발급을 <strong>한 번만</strong> 보내고, 나머지 요청은 큐에서
              기다렸다가 함께 재시도합니다. 실패하면 대기하던 것까지 전부
              정리하고 로그인으로 보냅니다.
            </p>
          </Panel>
          <Panel label="그래서 지금 폐기는">
            <p className="text-[13px] leading-6">
              <strong>로그아웃 시점</strong>에 일어납니다. 쿠키 3종을 즉시
              만료시키고 그 사용자의 <code>refresh_tokens</code> 행을 지웁니다.
              재발급 때가 아니라 여기서 한 번에.
            </p>
          </Panel>
          <Panel label="다시 넣는다면">
            <p className="text-[13px] leading-6">
              회전 직후 <strong>짧은 유예 시간</strong>을 두어 그 안에 들어온 옛
              토큰은 통과시키거나, 토큰에 계보(family)를 붙여 재사용을 계보째
              끊는 방법이 있습니다. 경쟁 상태를 먼저 풀지 않으면 로테이션은
              보안이 아니라 장애가 됩니다.
            </p>
          </Panel>
        </div>

        <div className="mt-5">
          <Caveat>
            근거는 저장소에 있습니다 — <strong>2026-04-01</strong> 의 커밋 두
            개(<code>72b38fa</code> 「로그인풀림수정」 · <code>bacef85</code>
            )에서 로테이션이 들어갔다 나갔습니다. 교과서에 있는 걸 넣었다고
            적기는 쉽지만, <strong>넣어 보고 무슨 일이 생기는지 겪은 것</strong>
            은 저것뿐입니다.
          </Caveat>
        </div>
      </div>
    </Page>
  );
}
