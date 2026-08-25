"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useFestFlow} from "../context";
import {
  Body,
  Card,
  Caveat,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  Shot,
  Switch2,
  rise,
  usePageIn
} from "../parts";
import {useOnScreen, usePageVisible, useTimeline} from "../../_kit/useTimeline";

// PAGE 11 — 실제 축제에 올렸습니다  ⭐ 이 방에서 가장 센 페이지
//
// 개발 실체: 발표자료 27장 「실제 축제 적용 사례: AI MATCH」 · 28장 「QA 진행 및 주요 개선 사례」
//   1일 운영 · AI Match 등록자 169명 · 매칭 신청 424건 · 성사 매칭 36건
//   관리자 처리 30+건 · QA 참여 15명
//   관리자 화면 실측: 활성 프로필 115 / 전체 신청 424 / 대기중 144 / 성사된 매치 36
// 연출 장치: 지표가 0에서 실측값까지 올라가고, QA 는 Before/After 를 직접 뒤집는다
//
// ⚠️ 관리자 캡처는 계정명과 「전화번호 완전 삭제」 패널을 잘라내고 통계 구역만 썼다.
//    사용자 캡처의 참가자 얼굴은 복원 불가능하게 한 번 더 뭉갰다.

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, stats: 3, qa: 4};

const STATS = [
  {v: 1, unit: "일", l: "실제 운영 기간", c: "var(--ff-accent)"},
  {v: 169, unit: "명", l: "AI Match 등록자", c: "var(--ff-live)"},
  {v: 424, unit: "건", l: "매칭 신청", c: "var(--ff-primary)"},
  {v: 36, unit: "건", l: "성사 매칭", c: "var(--ff-accent)"},
  {v: 30, unit: "+", l: "관리자 처리", c: "var(--ff-ray)"},
  {v: 15, unit: "명", l: "QA 참여", c: "var(--ff-stale)"}
] as const;

const QA = [
  {
    t: "모바일 사용성 QA",
    problem: "주요 버튼 위치가 불편해 사용 흐름이 끊김 · 다음 행동을 찾기 어려움",
    fix: "하단 고정 CTA 적용"
  },
  {
    t: "데이터 표시 QA",
    problem: "정보가 숫자 중심이라 즉시 판단이 어려움",
    fix: "등급 · 배지 · 문구를 함께 표시"
  }
] as const;

const IMPROVED = [
  {n: "1", t: "모바일 접근성 개선", d: "하단 고정 CTA 적용"},
  {n: "2", t: "운영 흐름 개선", d: "상태 구분으로 처리 실수 감소"},
  {n: "3", t: "데이터 가독성 개선", d: "등급 · 배지 · 문구로 빠른 판단 지원"}
] as const;

export function P11Field() {
  const {reducedMotion, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const boxRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(boxRef, 0.2);
  const visible = usePageVisible();

  const [t, setT] = useState(instant ? 1 : 0);
  const [qa, setQa] = useState<0 | 1>(0); // 0 = Before, 1 = After

  // 0 → 1 로 차오르며 지표가 올라간다. 화면 밖·탭 숨김이면 멈춘다(스펙 A-8).
  useEffect(() => {
    if (instant || !onScreen || !visible || t >= 1) return;
    const id = window.setInterval(
      () => setT(v => Math.min(1, v + 0.045)),
      40
    );
    return () => window.clearInterval(id);
  }, [instant, onScreen, visible, t]);

  const flip = useCallback(
    (v: 0 | 1) => {
      setQa(v);
      announce(
        v === 0
          ? "QA 이전 화면입니다."
          : "QA 반영 화면입니다. 하단 고정 CTA 와 등급 표시가 들어갔습니다."
      );
    },
    [announce]
  );

  // 부드럽게 감속
  const eased = 1 - Math.pow(1 - t, 3);

  return (
    <Page index={11} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant} color="var(--ff-live)">
        11 · 현장 검증
      </Kicker>

      <div className="mt-4">
        <Heading
          text="실제 축제에 올렸습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          여기까지는 전부 &ldquo;이렇게 만들었습니다&rdquo;였습니다. 이 장은
          다릅니다 —{" "}
          <strong style={{color: "var(--ff-accent)"}}>
            1일간 실제 대학 축제에서 운영
          </strong>
          하며 신청부터 매칭까지 전 과정을 현장에서 검증했습니다. 아래 숫자는
          전부 그때 실제로 찍힌 값입니다.
        </Body>
      </div>

      {/* 실측 지표 */}
      <div
        ref={boxRef}
        className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        style={rise(on[IDX.stats], instant)}
      >
        {STATS.map(s => (
          <div
            key={s.l}
            className="rounded-md p-4"
            style={{
              border: `1px solid ${s.c}`,
              background: `color-mix(in srgb, ${s.c} 8%, transparent)`
            }}
          >
            <div
              className="font-mono text-[26px] font-black leading-none tabular-nums sm:text-[30px]"
              style={{color: s.c}}
            >
              {Math.round(s.v * eased)}
              <span className="text-[14px]">{s.unit}</span>
            </div>
            <div className="mt-1.5 font-mono text-[10px] leading-4 text-[var(--ff-muted)]">
              {s.l}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Hint>
          <strong>424건이 들어와서 36건이 성사</strong>됐고, 그 사이 144건이 응답
          대기 상태였습니다. 관리자 화면이 그걸 실시간으로 세고 있었습니다.
        </Hint>
      </div>

      {/* 실제 화면 */}
      <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <Shot
            src="/projects/festflow/field-admin.webp"
            alt="AI Match 관리자 대시보드 통계 — 활성 프로필 115, 전체 신청 424, 대기중 144, 성사된 매치 36"
            caption="실제 관리자 화면 — 축제 당일 이 숫자를 보며 운영했습니다"
            w={1106}
            h={303}
          />
          <Panel label="관리자가 본 것">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["115", "활성 프로필", "전체 169명"],
                ["424", "전체 신청", "누적"],
                ["144", "대기중", "응답 필요"],
                ["36", "성사된 매치", "연락 조율"]
              ].map(([v, l, sub]) => (
                <div key={l}>
                  <div className="font-mono text-[18px] font-black tabular-nums text-[var(--ff-text)]">
                    {v}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--ff-muted)]">
                    {l}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--ff-faint)]">
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <Shot
          src="/projects/festflow/field-user.webp"
          alt="AI Match 사용자 화면 — 매칭 카드 목록"
          caption="실제 사용자 화면 — 참가자 사진은 식별 불가능하게 처리했습니다"
          w={465}
          h={798}
        />
      </div>

      <Caveat>
        관리자 캡처는 계정명과 「전화번호 완전 삭제」 패널을 잘라내고 통계
        구역만 실었습니다. 사용자 캡처의 참가자 얼굴은 복원할 수 없게 다시
        처리했습니다. 닉네임은 서비스 안에서 쓰던 가명입니다.
      </Caveat>

      {/* QA */}
      <div className="mt-12" style={rise(on[IDX.qa], instant)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[18px] font-black text-[var(--ff-text)] sm:text-[22px]">
            그리고 QA 에서 세 가지를 고쳤습니다
          </h3>
          <Switch2
            label="QA 반영 전후"
            options={["QA 이전", "QA 반영"]}
            value={qa}
            onChange={flip}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
          <div
            className="rounded-md p-4"
            style={{
              border:
                qa === 0
                  ? "1px solid rgba(248,113,113,0.34)"
                  : "1px solid rgba(74,222,128,0.34)",
              background:
                qa === 0 ? "rgba(248,113,113,0.05)" : "rgba(74,222,128,0.05)"
            }}
          >
            <div
              className="font-mono text-[11px] font-bold"
              style={{
                color: qa === 0 ? "var(--ff-down)" : "var(--ff-live)"
              }}
            >
              {qa === 0 ? "BEFORE — QA 에서 발견한 문제" : "AFTER — 반영된 개선"}
            </div>
            <ul className="mt-3 space-y-2.5">
              {QA.map(q => (
                <li key={q.t}>
                  <div className="font-mono text-[10px] text-[var(--ff-muted)]">
                    {q.t}
                  </div>
                  <p className="mt-0.5 text-[13px] leading-6 text-[var(--ff-text)]">
                    {qa === 0 ? q.problem : q.fix}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2.5">
            {IMPROVED.map(m => (
              <div
                key={m.n}
                className="rounded-md p-3.5 transition-opacity duration-300"
                style={{
                  border: "1px solid var(--ff-border)",
                  background: "var(--ff-panel)",
                  opacity: qa === 1 ? 1 : 0.35
                }}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-mono text-[11px] font-black"
                    style={{color: "var(--ff-live)"}}
                  >
                    {m.n}
                  </span>
                  <span className="text-[13px] font-bold text-[var(--ff-text)]">
                    {m.t}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-[var(--ff-muted)]">
                  {m.d}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <Shot
            src="/projects/festflow/qa.webp"
            alt="QA 진행 및 주요 개선 사례 — Before / After 화면 비교"
            caption="실제 Before / After 화면 (발표자료 28장) — QA 결과는 서비스 화면에 반영되었습니다"
            w={1600}
            h={900}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Card label="검증 01" accent="var(--ff-live)">
            <p className="text-[13px] leading-6">
              <strong>실제 운영 검증 완료</strong> — 축제 현장에서 1일간 실
              운영하며 신청부터 매칭까지 전 과정을 검증
            </p>
          </Card>
          <Card label="검증 02" accent="var(--ff-primary)">
            <p className="text-[13px] leading-6">
              <strong>관리자 처리 흐름 확인</strong> — 관리자 대시보드로 신청
              현황, 매칭 처리, 운영 효율을 확인
            </p>
          </Card>
          <Card label="검증 03" accent="var(--ff-accent)">
            <p className="text-[13px] leading-6">
              <strong>사용자 참여 경험 검증</strong> — 사용자 화면을 통해 매칭
              탐색과 신청 경험을 현장에서 검증
            </p>
          </Card>
        </div>
      </div>
    </Page>
  );
}
