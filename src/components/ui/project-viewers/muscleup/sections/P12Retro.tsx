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
// 배포 주소(muscle-up.click)는 응답이 없어 링크로 걸지 않는다.

export function P12Retro({onExit}: {onExit: () => void}) {
  const {reducedMotion} = useMuscleUp();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  return (
    <Page index={13} innerRef={ref} className="pb-[140px]">
      <Kicker on={on[IDX.label]} instant={instant}>
        13 · 회고
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
            그게 <strong>1.0 에서 배운 것</strong>입니다. 그리고 한 번 더
            만들면서{" "}
            <strong style={{color: "var(--mu-accent)"}}>
              배운 종류가 갈렸습니다.
            </strong>{" "}
            1.0 이 「어떻게 만드나」였다면 2.0 은 「왜 안 오나」였고, 답은
            기능이 아니라 <strong>첫 화면이 무엇을 시키느냐</strong>에
            있었습니다.
          </Body>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-3 lg:grid-cols-3"
        style={rise(on[IDX.kpt], instant)}
      >
        <Card label="1.0 에서 배운 것 · 개발" accent="var(--mu-primary)">
          <ul className="space-y-2 text-[14px] leading-7">
            <li>역할이 다르면 처음부터 갈라 두기</li>
            <li>비밀 값은 코드가 아니라 환경변수에</li>
            <li>DB 문자열과 JVM 인코딩은 같이 맞춰야 한다</li>
            <li>SPA 라우팅은 호스팅 설정 문제다</li>
            <li>증상이 아니라 구조를 고치기</li>
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
                Refresh 로테이션을 되돌린 채로 두고 있다.
              </strong>{" "}
              병렬 요청이 서로의 토큰을 무효화해 로그아웃이 나서 걷어냈고,
              클라이언트 재발급 단일화로 급한 불만 껐다. 유예 시간이나 토큰
              계보(family)로 다시 넣는 것이 숙제로 남아 있다. 탈취 자체를
              탐지하는 장치도 아직 없다.
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

        <Card label="2.0 에서 배운 것 · 운영·사용자" accent="var(--mu-accent)">
          <ul className="space-y-2 text-[14px] leading-7">
            <li>재방문은 기능 수가 아니라 첫 화면이 정한다</li>
            <li>「소통하고 싶다」는 게시판으로 안 풀린다</li>
            <li>기록은 보여 주는 게 아니라 돌려줘야 한다</li>
            <li>로그는 읽는 화면이 있어야 의미가 생긴다</li>
            <li>교과서 기법이 운영에선 장애가 되기도 한다</li>
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
        {/* muscle-up.click 링크를 뺐다 — 응답이 없다(2026-08-28 확인).
            방을 끝까지 본 사람이 마지막에 누르는 버튼이라 죽어 있으면 가장 나쁘다. */}
        <div className="flex flex-wrap items-center justify-center gap-3">
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
