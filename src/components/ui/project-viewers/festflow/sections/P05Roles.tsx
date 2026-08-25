"use client";

import {useCallback, useRef, useState} from "react";
import {useFestFlow} from "../context";
import {
  Body,
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

// PAGE 05 — 같은 화면, 다른 권한 · JWT 역할 분리
//
// 개발 실체: JWT 기반 역할 분리 (저장소: Spring Security + JWT,
//            발표자료 7장 「방문객 / 부스 운영자 / 스태프 / 관리자」 기능 목록 원문)
// 연출 장치: **역할 스위처** — 누르면 같은 화면의 정보가 실제로 사라지고 나타난다

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

type Role = "VISITOR" | "OWNER" | "STAFF" | "ADMIN";

const ROLES: {
  key: Role;
  label: string;
  color: string;
  desc: string;
  can: string[];
}[] = [
  {
    key: "VISITOR",
    label: "방문객",
    color: "var(--ff-ray)",
    desc: "축제 정보를 실시간으로 확인하고 AI 가이드를 받습니다.",
    can: [
      "축제 정보 조회",
      "공연 / 부스 확인",
      "현재 혼잡도",
      "AI 관람도 예측",
      "AI 축제 가이드",
      "AI 챗봇",
      "부스 예약",
      "알림톡 조회",
      "QR 체크인"
    ]
  },
  {
    key: "OWNER",
    label: "부스 운영자",
    color: "var(--ff-live)",
    desc: "예약과 체크인을 관리하고 부스 상태를 실시간으로 갱신합니다.",
    can: [
      "예약 현황 확인",
      "QR 체크인 처리",
      "예약 완료 처리",
      "부스 상태 변경",
      "테이블 설정",
      "운영 현황 확인"
    ]
  },
  {
    key: "STAFF",
    label: "스태프",
    color: "var(--ff-accent)",
    desc: "현장 운영을 AI 가 보조하며 분실물과 구역 상태를 관리합니다.",
    can: [
      "분실물 확인",
      "AI 분실물 매칭",
      "AI 체크리스트",
      "AI 구역 요약",
      "AI 혼잡 예측",
      "스태프 상태 변경"
    ]
  },
  {
    key: "ADMIN",
    label: "관리자",
    color: "var(--ff-primary)",
    desc: "축제 전체를 통합 대시보드에서 모니터링하고 AI 로 운영을 자동화합니다.",
    can: [
      "공지 관리",
      "부스 관리",
      "공연 관리",
      "콘텐츠 모니터링",
      "운영 데이터 확인",
      "AI 운영 브리핑",
      "AI 공지 초안 생성"
    ]
  }
];

// 전 역할이 볼 수 있는 공통 화면 요소
const SHARED = ["축제 지도", "부스 목록", "공연 일정", "공지사항"];

export function P05Roles() {
  const {reducedMotion, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [role, setRole] = useState<Role>("VISITOR");
  const active = ROLES.find(r => r.key === role) ?? ROLES[0];

  const pick = useCallback(
    (r: Role) => {
      setRole(r);
      const found = ROLES.find(x => x.key === r);
      announce(
        found ? `${found.label} 권한입니다. ${found.desc}` : "권한을 바꿨습니다."
      );
    },
    [announce]
  );

  return (
    <Page index={5} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        05 · 권한
      </Kicker>

      <div className="mt-4">
        <Heading
          text="네 사람이 같은 축제를 다르게 봅니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          방문객은 &ldquo;지금 어디가 덜 붐비나&rdquo;를 보고, 부스 운영자는{" "}
          &ldquo;예약이 몇 건 남았나&rdquo;를 봅니다. 화면을 네 벌 만드는 대신{" "}
          <strong style={{color: "var(--ff-accent)"}}>
            같은 화면에 권한을 씌웠습니다.
          </strong>{" "}
          아래 스위처로 바꿔 보세요 — 항목이 실제로 사라지고 나타납니다.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: `1px solid ${active.color}`,
            background: "var(--ff-panel)"
          }}
        >
          <div className="flex flex-wrap gap-2">
            {ROLES.map(r => {
              const sel = r.key === role;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => pick(r.key)}
                  aria-pressed={sel}
                  className="cursor-pointer rounded-md px-3 py-2 font-mono text-[11px] font-bold transition-colors duration-200"
                  style={{
                    border: `1px solid ${
                      sel ? r.color : "rgba(255,255,255,0.12)"
                    }`,
                    background: sel
                      ? `color-mix(in srgb, ${r.color} 14%, transparent)`
                      : "transparent",
                    color: sel ? r.color : "var(--ff-muted)"
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          <p className="text-[13px] leading-6 text-[var(--ff-muted)]">
            {active.desc}
          </p>

          {/* 공통 화면 — 항상 보인다 */}
          <div>
            <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--ff-faint)]">
              모두에게 보이는 것
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SHARED.map(s => (
                <span
                  key={s}
                  className="rounded px-2 py-1 font-mono text-[10px]"
                  style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--ff-muted)"
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* 권한별 화면 — 바뀐다 */}
          <div>
            <div
              className="font-mono text-[10px] tracking-[0.18em]"
              style={{color: active.color}}
            >
              {active.label}에게만 보이는 것 · {active.can.length}개
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {active.can.map((c, i) => (
                <span
                  key={c}
                  className={`rounded px-2 py-1 font-mono text-[10px] ${
                    instant ? "" : "ff-pop"
                  }`}
                  style={{
                    border: `1px solid ${active.color}`,
                    background: `color-mix(in srgb, ${active.color} 12%, transparent)`,
                    color: active.color,
                    animationDelay: `${i * 40}ms`
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <Hint>
            같은 API 를 부르는데 응답이 다릅니다. 프론트가 숨기는 게 아니라{" "}
            <strong>서버가 안 내려줍니다</strong> — 화면에서 숨기는 것만으로는
            권한이 아닙니다.
          </Hint>
        </div>

        <CodePanel
          filename="SecurityConfig.java · JwtAuthenticationFilter.java"
          badge={{text: "지금 역할", color: active.color}}
          borderColor="var(--ff-code-border)"
        >
          <div className="py-2">
            <CodeLine n={1}>
              <Cm>{"// 토큰 페이로드 — 지금 이 방문자의 것"}</Cm>
            </CodeLine>
            <CodeLine n={2}>{"{"}</CodeLine>
            <CodeLine n={3} highlight>
              {`  "role": "${role}",`}
            </CodeLine>
            <CodeLine n={4}>{`  "sub": "user@ajou.ac.kr",`}</CodeLine>
            <CodeLine n={5}>{`  "exp": 1780000000`}</CodeLine>
            <CodeLine n={6}>{"}"}</CodeLine>
            <CodeLine n={7}>{""}</CodeLine>
            <CodeLine n={8}>
              <Cm>{"// 경로별 인가 — 화면이 아니라 서버가 막는다"}</Cm>
            </CodeLine>
            <CodeLine n={9} highlight={role === "VISITOR"}>
              {".requestMatchers(\"/api/booths/**\").permitAll()"}
            </CodeLine>
            <CodeLine n={10} highlight={role === "OWNER"}>
              {".requestMatchers(\"/api/owner/**\").hasRole(\"OWNER\")"}
            </CodeLine>
            <CodeLine n={11} highlight={role === "STAFF"}>
              {".requestMatchers(\"/api/staff/**\").hasRole(\"STAFF\")"}
            </CodeLine>
            <CodeLine n={12} highlight={role === "ADMIN"}>
              {".requestMatchers(\"/api/admin/**\").hasRole(\"ADMIN\")"}
            </CodeLine>
            <CodeLine n={13}>{".anyRequest().authenticated()"}</CodeLine>
          </div>
        </CodePanel>
      </div>

      <div className="mt-4">
        <Hint>
          위 코드는 저장소의 Spring Security 설정을 이 페이지용으로 줄여 옮긴
          것입니다. 역할 이름과 기능 목록은 발표자료 7장 원문입니다.
        </Hint>
      </div>

      <div className="mt-8">
        <Shot
          src="/projects/festflow/roles.webp"
          alt="Fest-A 역할별 핵심 기능 — 방문객 / 부스 운영자 / 스태프 / 관리자"
          caption="네 역할이 각각 보는 화면과 기능 (발표자료 7장)"
          w={1600}
          h={900}
        />
      </div>
    </Page>
  );
}
