"use client";

import {useCallback, useRef, useState} from "react";
import {useMuscleUp} from "../context";
import {
  Body,
  Cm,
  CodeLine,
  CodePanel,
  FlowNode,
  Heading,
  Hint,
  Kicker,
  Page,
  Shot,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 04 — 로그인은 두 갈래로 들어온다
//
// 개발 실체: PDF 8쪽 「소셜/이메일 인증」 — SMTP 이메일 인증 플로우 + Google OAuth2
// 연출 장치: 두 경로를 나란히 그린 흐름도 — **관람객이 경로를 고르면 그 갈래만
//            점등되고 코드가 따라온다** (스펙 PAGE 04 그대로)

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, flow: 3};

type Path = "email" | "google";

const FLOWS: Record<
  Path,
  {label: string; color: string; nodes: {t: string; s: string}[]}
> = {
  email: {
    label: "이메일 가입",
    color: "var(--mu-primary)",
    nodes: [
      {t: "이메일 입력", s: "회원가입 폼"},
      {t: "인증코드 전송", s: "EmailSender · JavaMailSender"},
      {t: "코드 저장", s: "email_verifications 테이블"},
      {t: "6자리 코드 확인", s: "verified = true"},
      {t: "가입 완료", s: "201 Created + UserDTO"}
    ]
  },
  google: {
    label: "Google 로그인",
    color: "var(--mu-ray)",
    nodes: [
      {t: "구글 로그인", s: "클라이언트에서 idToken 수령"},
      {t: "idToken 검증", s: "GoogleIdTokenVerifier"},
      {t: "payload 추출", s: "token.getPayload()"},
      {t: "사용자 매칭 · 생성", s: "같은 users 테이블"},
      {t: "가입 완료", s: "이메일 가입과 같은 응답"}
    ]
  }
};

export function P04Auth() {
  const {reducedMotion, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [path, setPath] = useState<Path | null>(null);
  const [step, setStep] = useState(-1);

  const choose = useCallback(
    (p: Path) => {
      setPath(p);
      setStep(0);
      announce(`${FLOWS[p].label} 경로를 선택했습니다.`);
    },
    [announce]
  );

  const next = useCallback(() => {
    if (!path) return;
    setStep(prev => Math.min(prev + 1, FLOWS[path].nodes.length - 1));
  }, [path]);

  const active = path ? FLOWS[path] : null;
  const atEnd = active ? step >= active.nodes.length - 1 : false;

  return (
    <Page index={5} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        05 · 인증
      </Kicker>

      <div className="mt-4">
        <Heading
          text="두 갈래로 들어와서 한 곳에서 만납니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          이메일로 가입하는 사람과 구글로 로그인하는 사람은 다른 문으로
          들어옵니다. 문이 둘이면 흔히{" "}
          <strong>사용자 경험도 둘로 갈라집니다.</strong> 그래서 두 경로가{" "}
          <strong style={{color: "var(--mu-accent)"}}>
            같은 users 테이블, 같은 응답 형태
          </strong>
          로 합류하게 만들었습니다. 어느 문으로 들어오는지 골라 보세요.
        </Body>
      </div>

      <div className="mt-9" style={rise(on[IDX.flow], instant)}>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FLOWS) as Path[]).map(p => {
            const f = FLOWS[p];
            const sel = path === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => choose(p)}
                aria-pressed={sel}
                className="cursor-pointer rounded-md px-4 py-2.5 font-mono text-[12px] font-bold transition-colors duration-200"
                style={{
                  border: `1px solid ${
                    sel ? f.color : "rgba(255,255,255,0.12)"
                  }`,
                  background: sel
                    ? `color-mix(in srgb, ${f.color} 14%, transparent)`
                    : "transparent",
                  color: sel ? f.color : "var(--mu-muted)"
                }}
              >
                {f.label}
              </button>
            );
          })}
          {path ? (
            <button
              type="button"
              onClick={next}
              disabled={atEnd}
              className="cursor-pointer rounded-md px-4 py-2.5 font-mono text-[12px] font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45"
              style={{
                border: "1px solid var(--mu-border)",
                color: "var(--mu-accent)"
              }}
            >
              {atEnd ? "합류 완료" : "다음 단계 ▶"}
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-[18px] lg:grid-cols-[46%_1fr]">
          {/* 두 갈래 흐름도 */}
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(FLOWS) as Path[]).map(p => {
              const f = FLOWS[p];
              const lit = path === p;
              return (
                <div key={p} className="flex flex-col gap-2">
                  <div
                    className="font-mono text-[10px] tracking-[0.18em]"
                    style={{color: lit ? f.color : "var(--mu-faint)"}}
                  >
                    {f.label}
                  </div>
                  {f.nodes.map((nd, i) => (
                    <FlowNode
                      key={nd.t}
                      title={nd.t}
                      sub={lit ? nd.s : undefined}
                      active={lit && i === step}
                      done={lit && i < step}
                      color={f.color}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* 그 갈래의 실제 코드 */}
          <CodePanel
            filename="EmailSender.java · EmailVerificationService.java · AuthController.java"
            badge={{text: "실제 코드", color: "var(--mu-ok)"}}
            borderColor="var(--mu-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>{"// file: EmailSender.java — SMTP 메일 전송"}</Cm>
              </CodeLine>
              <CodeLine n={2} highlight={path === "email" && step >= 1}>
                {"private final JavaMailSender mailSender;"}
              </CodeLine>
              <CodeLine n={3} highlight={path === "email" && step >= 1}>
                {'@Value("${spring.mail.username}") private String from;'}
              </CodeLine>
              <CodeLine n={4} highlight={path === "email" && step >= 1}>
                {"mailSender.send(message);"}
              </CodeLine>
              <CodeLine n={5}>{""}</CodeLine>
              <CodeLine n={6}>
                <Cm>
                  {"// file: EmailVerificationService.java — 코드 저장/전송"}
                </Cm>
              </CodeLine>
              <CodeLine n={7} highlight={path === "email" && step >= 2}>
                {"EmailVerification v = EmailVerification.builder()...build();"}
              </CodeLine>
              <CodeLine n={8} highlight={path === "email" && step >= 2}>
                {"repo.save(v);"}
              </CodeLine>
              <CodeLine n={9} highlight={path === "email" && step >= 3}>
                {"emailSender.sendSimpleAsync(email, subject, text);"}
              </CodeLine>
              <CodeLine n={10}>{""}</CodeLine>
              <CodeLine n={11}>
                <Cm>{"// file: AuthController.java — 구글 OAuth2 검증"}</Cm>
              </CodeLine>
              <CodeLine n={12} highlight={path === "google" && step >= 1}>
                {"GoogleIdToken token = verifier.verify(idToken);"}
              </CodeLine>
              <CodeLine n={13} highlight={path === "google" && step >= 2}>
                {"return token != null ? token.getPayload() : null;"}
              </CodeLine>
              <CodeLine n={14}>{""}</CodeLine>
              <CodeLine n={15}>
                <Cm>{"// file: UserController.java — 회원가입 응답 일관성"}</Cm>
              </CodeLine>
              <CodeLine n={16} highlight={atEnd}>
                {"UserDTO created = userService.register(req);"}
              </CodeLine>
              <CodeLine n={17} highlight={atEnd}>
                {"return ResponseEntity.created(...).body(created);"}
              </CodeLine>
            </div>
          </CodePanel>
        </div>

        <div className="mt-4">
          <Hint>
            {path === null
              ? "위에서 문을 하나 고르면 그 갈래만 점등되고, 오른쪽에서 담당 코드에 불이 들어옵니다."
              : atEnd
              ? "두 경로 모두 마지막 두 줄에서 만납니다 — 응답 형태가 같아야 프론트가 갈라지지 않습니다."
              : `${active?.nodes[step].t} 단계입니다.`}
          </Hint>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Shot
          src="/projects/muscleup/signup.webp"
          alt="득근득근 회원가입 화면 — 이메일 인증코드 입력란"
          caption="회원가입 화면 — 인증코드 전송과 6자리 코드 확인이 한 폼 안에 있다"
          w={1222}
          h={874}
        />
        <Shot
          src="/projects/muscleup/code-email-oauth.webp"
          alt="EmailSender · EmailVerificationService · AuthController 코드"
          caption="SMTP 전송 · 코드 저장 · 구글 idToken 검증 · 응답 일관성"
          w={1079}
          h={960}
        />
      </div>
    </Page>
  );
}
