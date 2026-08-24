"use client";

import {useRef} from "react";
import {useMuscleUp} from "../context";
import {
  Body,
  Card,
  Heading,
  Kicker,
  Page,
  Panel,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 12 — 회고 · 다음 단계 · 퇴장
//
// 개발 실체: KPT 회고 (PROBLEM 필수) + 다음 단계 + 링크
// 연출 장치: 최종 스탯 정산 → 캐릭터 시트 접기 → 퇴장 (셸이 처리)
//
// 배운 점은 PDF 12쪽 「인프라 설계 요약」 원문을 근거로 한다:
//  "도메인, 인증서, CDN, 스토리지를 역할별로 분리하여 장애 원인 분석 및 운영 대응이
//   용이한 구조 설계"
//  "배포 과정에서 발생하는 실질적인 운영 이슈 원인 분석 → 구조적 해결 방식으로 처리"
//  "단순 배포가 아닌 운영과 확장성을 고려한 AWS 기반 서비스 인프라 구성 경험 확보"
// PDF 7쪽 Outcome: "인증·보안·배포·운영까지 고려한 실사용 가능한 풀스택 서비스 완성"

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, learn: 2, kpt: 3, exit: 4};

const REPO = "https://github.com/toadsam/Ajou_MuscleUp";
const DEPLOY = "https://muscle-up.click";

export function P12Retro({onExit}: {onExit: () => void}) {
  const {reducedMotion} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  return (
    <Page index={12} innerRef={ref} className="pb-[140px]">
      <Kicker on={on[IDX.label]} instant={instant}>
        12 · 회고
      </Kicker>

      <div className="mt-4">
        <Heading
          text="기능을 다 만든 뒤가 진짜였습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6" style={rise(on[IDX.learn], instant)}>
        <Body>
          화면이 다 뜨고 API 가 다 돌면 끝난 줄 알았습니다. 실제로 남아 있던 건{" "}
          <strong>인증 · 보안 · 배포 · 운영</strong>이었고, 넷 다 사용자 눈에는
          안 보이는 것들입니다.{" "}
          <span style={{color: "var(--mu-accent)"}}>
            그런데 그게 안 되면 아무도 못 씁니다.
          </span>
        </Body>
        <div className="mt-4">
          <Body>
            그때 생긴 기준이{" "}
            <strong>역할이 다르면 처음부터 갈라 두는 것</strong>입니다. 도메인 ·
            인증서 · CDN · 스토리지를 나눠 놓으니 장애가 났을 때 어디를 봐야
            하는지가 바로 나왔고, 스키마도 같은 이유로 도메인별로 갈랐습니다.
            배포에서 만난 문제들도 그때그때 때우지 않고{" "}
            <strong>구조를 바꿔서</strong> 처리했습니다.
          </Body>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-3 lg:grid-cols-3"
        style={rise(on[IDX.kpt], instant)}
      >
        <Card label="KEEP" accent="var(--mu-primary)">
          <ul className="space-y-1.5 text-[14px] leading-7">
            <li>역할이 다르면 처음부터 갈라 두기</li>
            <li>증상이 아니라 구조를 고치기</li>
            <li>비밀 값은 코드가 아니라 환경변수에</li>
          </ul>
        </Card>

        <Panel label="PROBLEM">
          <ul className="space-y-2 text-[13px] leading-6 text-[var(--mu-muted)]">
            <li>
              <span style={{color: "var(--mu-warn)"}}>·</span>{" "}
              <strong className="text-[var(--mu-text)]">
                운영 지표를 아직 안 본다.
              </strong>{" "}
              analytics_events 테이블은 있는데, 그걸 읽어서 판단하는 화면은 아직
              없다.
            </li>
            <li>
              <span style={{color: "var(--mu-warn)"}}>·</span>{" "}
              <strong className="text-[var(--mu-text)]">
                토큰 탈취를 탐지하지 못한다.
              </strong>{" "}
              로테이션은 재사용을 막지만, 누가 먼저 썼는지는 알려주지 않는다.
            </li>
            <li>
              <span style={{color: "var(--mu-warn)"}}>·</span>{" "}
              <strong className="text-[var(--mu-text)]">
                개선 폭을 수치로 남기지 않았다.
              </strong>{" "}
              캐시 반영 시간이 얼마나 줄었는지 기록해 두지 않아 지금은
              &ldquo;안정화됐다&rdquo; 고밖에 말할 수 없다.
            </li>
          </ul>
        </Panel>

        <Card label="TRY" accent="var(--mu-accent)">
          <ul className="space-y-1.5 text-[14px] leading-7">
            <li>배포 자동화 (지금은 손으로 무효화)</li>
            <li>수집 중인 이벤트를 실제로 읽기</li>
            <li>고치기 전후를 숫자로 남기기</li>
          </ul>
        </Card>
      </div>

      {/* 나가는 문 */}
      <div
        className="mt-12 flex flex-col items-center gap-4 pt-10"
        style={{
          borderTop: "1px solid rgba(244,114,182,0.14)",
          ...rise(on[IDX.exit], instant)
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={DEPLOY}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid var(--mu-border)",
              color: "var(--mu-muted)"
            }}
          >
            muscle-up.click ↗
          </a>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid var(--mu-border)",
              color: "var(--mu-muted)"
            }}
          >
            GitHub 저장소 ↗
          </a>
          <button
            type="button"
            onClick={onExit}
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid rgba(244,114,182,0.45)",
              background: "rgba(244,114,182,0.14)",
              color: "var(--mu-accent)"
            }}
          >
            ← 마을로 돌아가기
          </button>
        </div>
        <p className="font-mono text-[11px] text-[var(--mu-faint)]">
          나가면 최종 스탯이 정산됩니다 · Esc 를 눌러도 나갈 수 있습니다
        </p>
      </div>
    </Page>
  );
}
