"use client";

import {useRef} from "react";
import {useFestFlow} from "../context";
import {
  Body,
  Card,
  Heading,
  Kicker,
  Page,
  Panel,
  Shot,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 12 — 회고 · 다음 단계 · 퇴장
//
// 개발 실체: KPT 회고 (PROBLEM 필수) + 다음 단계 + GitHub
// 연출 장치: 축제 종료 → 관제 모니터가 한 대씩 꺼지며 퇴장 (셸이 처리)
//
// TRY 는 발표자료 22장 「AI 모델 고도화 방향」과 29장 「향후 개선 방향」 원문:
//   실제 운영 데이터 기반 재학습 · 시계열 예측 모델 · Drift 감지 자동 재학습 ·
//   설명 가능한 AI(SHAP) · 개인화 추천 확장
//   데이터 수집 확장 · 서비스 안정성/보안 · 지속적 QA · 축제 현장 UI/UX · 접근성

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, learn: 2, kpt: 3, exit: 4};

const REPO = "https://github.com/toadsam/FestFlow";
const VIDEO = "https://www.youtube.com/watch?v=-RomuYp93TQ";
const DEPLOY = "https://fest-flow-smoky.vercel.app";

export function P12Retro({onExit}: {onExit: () => void}) {
  const {reducedMotion} = useFestFlow();
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
          text="하루짜리 행사가 기준을 바꿨습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6" style={rise(on[IDX.learn], instant)}>
        <Body>
          축제는 <strong>하루</strong>입니다. 배포하고 나서 고칠 시간이 없고,
          장애가 나면 다음 기회도 없습니다. 그래서 이 프로젝트에서는{" "}
          <span style={{color: "var(--ff-accent)"}}>
            &ldquo;가장 잘 되는 상태&rdquo;가 아니라 &ldquo;가장 안 죽는
            상태&rdquo;
          </span>
          를 기준으로 골랐습니다.
        </Body>
        <div className="mt-4">
          <Body>
            더 정확한 XGBoost 대신 RandomForest 를 올린 것도, AI 가 죽어도
            지도·예약·QR 은 돌게 만든 것도 같은 이유입니다. 그리고 실제로
            축제장에 올려 보니{" "}
            <strong>
              내가 예상한 문제와 사람들이 겪는 문제가 달랐습니다
            </strong>{" "}
            — QA 15명이 짚어준 건 알고리즘이 아니라 버튼 위치와 숫자 읽기였습니다.
          </Body>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-3 lg:grid-cols-3"
        style={rise(on[IDX.kpt], instant)}
      >
        <Card label="KEEP" accent="var(--ff-primary)">
          <ul className="space-y-1.5 text-[14px] leading-7">
            <li>죽는 걸 전제로 폴백을 먼저 깔기</li>
            <li>데이터 흐름 방향을 보고 기술 고르기</li>
            <li>만든 걸 실제 현장에 올려 보기</li>
          </ul>
        </Card>

        <Panel label="PROBLEM">
          <ul className="space-y-2 text-[13px] leading-6 text-[var(--ff-muted)]">
            <li>
              <span style={{color: "var(--ff-stale)"}}>·</span>{" "}
              <strong className="text-[var(--ff-text)]">
                학습 데이터가 시뮬레이션이다.
              </strong>{" "}
              HYBRID_SIMULATED(2,520행)로 학습했고, 실제 축제 로그로 재학습하지는
              못했다. 예측 정확도의 현장 성능은 아직 모른다.
            </li>
            <li>
              <span style={{color: "var(--ff-stale)"}}>·</span>{" "}
              <strong className="text-[var(--ff-text)]">
                운영 검증이 AI Match 한 기능에 몰렸다.
              </strong>{" "}
              혼잡도 예측과 챗봇은 현장에서 같은 규모로 검증하지 못했다.
            </li>
            <li>
              <span style={{color: "var(--ff-stale)"}}>·</span>{" "}
              <strong className="text-[var(--ff-text)]">
                개선 전후를 수치로 남기지 않았다.
              </strong>{" "}
              QA 로 세 가지를 고쳤지만 이탈률·완료율 같은 지표를 재지 않아
              &ldquo;나아졌다&rdquo;고밖에 말할 수 없다.
            </li>
          </ul>
        </Panel>

        <Card label="TRY" accent="var(--ff-accent)">
          <ul className="space-y-1.5 text-[14px] leading-7">
            <li>실제 운영 데이터로 재학습</li>
            <li>시계열 예측 (LSTM · Temporal CNN)</li>
            <li>Drift 감지 → 자동 재학습</li>
            <li>SHAP 으로 추천 이유 설명</li>
            <li>고치기 전후를 숫자로 남기기</li>
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Shot
          src="/projects/festflow/roadmap.webp"
          alt="Fest-A 향후 개선 방향 5가지"
          caption="향후 개선 방향 (발표자료 29장) — 데이터 수집 · 안정성 · QA · UI/UX · 접근성"
          w={1600}
          h={900}
        />
        <Shot
          src="/projects/festflow/status.webp"
          alt="개발 완료 현황 — 기능별 완료 상태와 AI 고도화 예정 항목"
          caption="완료 현황 — AI 고도화 3건은 「향후 개선」으로 명확히 갈라 놓았습니다"
          w={1600}
          h={900}
        />
      </div>

      {/* 나가는 문 */}
      <div
        className="mt-12 flex flex-col items-center gap-4 pt-10"
        style={{
          borderTop: "1px solid rgba(251,191,36,0.16)",
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
              border: "1px solid var(--ff-border)",
              color: "var(--ff-muted)"
            }}
          >
            서비스 열기 ↗
          </a>
          <a
            href={VIDEO}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid var(--ff-border)",
              color: "var(--ff-muted)"
            }}
          >
            시연 영상 ↗
          </a>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid var(--ff-border)",
              color: "var(--ff-muted)"
            }}
          >
            GitHub ↗
          </a>
          <button
            type="button"
            onClick={onExit}
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid rgba(251,191,36,0.45)",
              background: "rgba(251,191,36,0.14)",
              color: "var(--ff-accent)"
            }}
          >
            ← 마을로 돌아가기
          </button>
        </div>
        <p className="font-mono text-[11px] text-[var(--ff-faint)]">
          나가면 관제 모니터가 꺼집니다 · Esc 를 눌러도 나갈 수 있습니다
        </p>
      </div>
    </Page>
  );
}
