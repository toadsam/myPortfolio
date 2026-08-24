"use client";

import {useCallback, useRef, useState} from "react";
import {useMuscleUp} from "../context";
import {
  Body,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  Shot,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 08 — 스키마 설계 · 도메인별로 갈라 놓은 이유
//
// 개발 실체: PDF 10쪽 「MySQL 스키마 설계」 원문
//            Domain Split(사용자/커뮤니티/AI/로그) · Data Integrity(FK) ·
//            Performance(조회 중심 인덱스 + 페이지네이션)
//            핵심 테이블: users, brag_post, brag_comment, brag_like, ai_chat_messages
// 연출 장치: 다이어그램이 **한 도메인씩 켜진다** — 관람객이 도메인을 고르면
//            그 묶음만 남고 나머지는 흐려진다
//
// 테이블·컬럼 이름은 전부 PDF 10쪽 ERD 캡처에서 그대로 읽은 것이다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, erd: 3};

type DomainKey = "user" | "community" | "ai" | "log" | "ops";

const DOMAINS: Record<
  DomainKey,
  {label: string; color: string; why: string}
> = {
  user: {
    label: "사용자",
    color: "var(--mu-primary)",
    why: "인증에 필요한 것만 모았다. 토큰과 인증코드는 사용자에 붙지만 수명이 달라 테이블을 나눴다."
  },
  community: {
    label: "커뮤니티",
    color: "var(--mu-accent)",
    why: "게시글 하나에 댓글·좋아요·미디어가 따라붙는다. FK 로 묶어 두면 글이 지워질 때 딸린 것도 함께 정리된다."
  },
  ai: {
    label: "AI",
    color: "var(--mu-ray)",
    why: "analyze / plan / chat 이 전부 한 테이블에 type 으로 구분돼 쌓인다. 맥락을 이어가려면 한 줄로 읽혀야 한다."
  },
  log: {
    label: "로그",
    color: "var(--mu-warn)",
    why: "서비스 데이터와 섞이면 조회가 느려진다. 성격이 다른 것은 처음부터 갈라 둔다."
  },
  ops: {
    label: "운영",
    color: "var(--mu-ok)",
    why: "제품·신청·문의처럼 운영이 들여다보는 것들. 사용자 흐름과 분리해 두면 관리 화면만 따로 손볼 수 있다."
  }
};

const TABLES: {
  name: string;
  domain: DomainKey;
  cols: string[];
  core?: boolean;
}[] = [
  {
    name: "users",
    domain: "user",
    cols: ["id", "name", "email", "password", "role", "nickname"],
    core: true
  },
  {
    name: "refresh_tokens",
    domain: "user",
    cols: ["id", "user_id", "token", "expires_at"]
  },
  {
    name: "email_verifications",
    domain: "user",
    cols: ["id", "email", "code", "expire_at", "verified", "attempts"]
  },
  {
    name: "brag_post",
    domain: "community",
    cols: ["id", "user_id", "title", "content", "movement", "weight"],
    core: true
  },
  {
    name: "brag_comment",
    domain: "community",
    cols: ["id", "brag_post_id", "user_id", "content"],
    core: true
  },
  {
    name: "brag_like",
    domain: "community",
    cols: ["id", "brag_post_id", "user_id"],
    core: true
  },
  {name: "brag_media", domain: "community", cols: ["brag_id", "media_url"]},
  {
    name: "review",
    domain: "community",
    cols: ["id", "user_id", "protein_id", "rating", "content"]
  },
  {
    name: "ai_chat_messages",
    domain: "ai",
    cols: ["id", "user_id", "type", "question", "answer", "shared", "share_slug"],
    core: true
  },
  {
    name: "audit_logs",
    domain: "log",
    cols: ["id", "user_id", "action", "resource", "summary", "metadata"]
  },
  {
    name: "analytics_events",
    domain: "log",
    cols: ["id", "user_id", "page", "action", "metadata"]
  },
  {
    name: "proteins",
    domain: "ops",
    cols: ["id", "name", "price", "category", "avg_rating"]
  },
  {
    name: "program_applications",
    domain: "ops",
    cols: ["id", "name", "email", "goal", "track", "status"]
  },
  {name: "inquiries", domain: "ops", cols: ["id", "name", "email", "message"]}
];

export function P08Schema() {
  const {reducedMotion, announce} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [picked, setPicked] = useState<DomainKey | null>(null);

  const pick = useCallback(
    (d: DomainKey) => {
      setPicked(prev => {
        const next = prev === d ? null : d;
        announce(
          next
            ? `${DOMAINS[d].label} 도메인만 남겼습니다.`
            : "전체 도메인을 다시 보여줍니다."
        );
        return next;
      });
    },
    [announce]
  );

  return (
    <Page index={8} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        08 · 스키마
      </Kicker>

      <div className="mt-4">
        <Heading
          text="한 덩어리로 두면 나중에 못 늘립니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          테이블 14개를 <strong>성격별로 다섯 묶음</strong>으로 갈랐습니다. 관계는
          FK 로 묶어 무결성을 지키고, 조회가 몰리는 테이블은 인덱스와
          페이지네이션을 전제로 설계했습니다. 아래에서 묶음을 눌러 보세요 — 왜
          갈랐는지가 같이 나옵니다.
        </Body>
      </div>

      <div className="mt-9" style={rise(on[IDX.erd], instant)}>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DOMAINS) as DomainKey[]).map(d => {
            const info = DOMAINS[d];
            const sel = picked === d;
            const count = TABLES.filter(t => t.domain === d).length;
            return (
              <button
                key={d}
                type="button"
                onClick={() => pick(d)}
                aria-pressed={sel}
                className="cursor-pointer rounded-full px-3.5 py-2 font-mono text-[11px] font-bold transition-colors duration-200"
                style={{
                  border: `1px solid ${
                    sel ? info.color : "rgba(255,255,255,0.14)"
                  }`,
                  background: sel
                    ? `color-mix(in srgb, ${info.color} 14%, transparent)`
                    : "transparent",
                  color: sel ? info.color : "var(--mu-muted)"
                }}
              >
                {info.label} · {count}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          <Hint>
            {picked
              ? DOMAINS[picked].why
              : "묶음을 누르면 그 도메인만 남습니다. 한 번 더 누르면 전체로 돌아옵니다."}
          </Hint>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TABLES.map(t => {
            const info = DOMAINS[t.domain];
            const dim = picked !== null && picked !== t.domain;
            return (
              <div
                key={t.name}
                className="rounded-md p-3.5 transition-[border-color,background-color,box-shadow] duration-300"
                style={{
                  border: `1px solid ${
                    dim ? "rgba(255,255,255,0.06)" : `${info.color}55`
                  }`,
                  background: dim
                    ? "rgba(255,255,255,0.01)"
                    : "var(--mu-panel)",
                  opacity: dim ? 0.32 : 1
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-mono text-[12px] font-bold"
                    style={{color: dim ? "var(--mu-faint)" : info.color}}
                  >
                    {t.name}
                  </span>
                  {t.core ? (
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                      style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        color: "var(--mu-faint)"
                      }}
                    >
                      핵심
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.cols.map(c => (
                    <span
                      key={c}
                      className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        color: c.endsWith("_id")
                          ? "var(--mu-ray)"
                          : "var(--mu-muted)"
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Shot
          src="/projects/muscleup/erd.webp"
          alt="득근득근 MySQL ERD — 도메인별로 분리한 14개 테이블"
          caption="실제 ERD — 붉은 사각형이 「사용자가 계속 행동하게 만드는」 핵심 테이블"
          w={1600}
          h={1163}
        />
        <div className="flex flex-col gap-3">
          <Panel label="DOMAIN SPLIT">
            <p className="text-[13px] leading-6 text-[var(--mu-muted)]">
              사용자 / 커뮤니티 / AI / 로그 도메인 분리
            </p>
          </Panel>
          <Panel label="DATA INTEGRITY">
            <p className="text-[13px] leading-6 text-[var(--mu-muted)]">
              FK 기반 관계 설정으로 데이터 무결성 유지
            </p>
          </Panel>
          <Panel label="PERFORMANCE">
            <p className="text-[13px] leading-6 text-[var(--mu-muted)]">
              조회 중심 테이블 인덱스 및 페이지네이션 고려
            </p>
          </Panel>
        </div>
      </div>
    </Page>
  );
}
