"use client";

import {useRef} from "react";
import {useTserof} from "../context";
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
import {useTimeline} from "../useTimeline";

// PAGE 12 — 회고 · 다음 단계 · 퇴장
//
// 개발 실체: KPT 회고 (PROBLEM 3개 필수) · 다음 단계 · GitHub
// 연출 장치: 퇴장 시 **세이브 파일이 저장되고 SAVED → 암전** (셸이 처리)
//
// 배운 점은 PDF 원문 그대로:
//  "출시 과정에서 성능과 안정성(저장/충돌/레이캐스트)이 품질을 좌우한다는 점을 배움.
//   Unity Profiler 기반으로 병목을 찾아 개선하는 습관 형성"
//  "다음 프로젝트에서는 로딩/리소스 관리(Addressables)와 세이브 데이터 버전 관리까지
//   확장하여 더 안정적인 운영 목표"

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, learn: 2, kpt: 3, exit: 4};

const REPO = "https://github.com/KimEoJin24/TSEROF";

export function P12Retro({onExit}: {onExit: () => void}) {
  const {reducedMotion} = useTserof();
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
          text="출시는 기능이 아니라 품질에서 막혔다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6" style={rise(on[IDX.learn], instant)}>
        <Body>
          스테이지를 다 만들었을 때 저는 끝났다고 생각했습니다. 실제로 남은 일은{" "}
          <strong>저장 · 충돌 · 레이캐스트</strong>였습니다. 셋 다 새 기능이
          아니고 플레이어가 눈으로 볼 수 있는 것도 아닌데,{" "}
          <span className="text-[var(--ts-accent)]">
            그게 안 되면 올릴 수가 없었습니다.
          </span>
        </Body>
        <div className="mt-4">
          <Body>
            그때 생긴 습관이{" "}
            <strong>Unity Profiler 로 먼저 재고 고치는 것</strong>입니다.
            &ldquo;여기가 느릴 것 같다&rdquo;는 짐작으로 건드린 곳은 대체로
            범인이 아니었고, 진짜 병목은 고드름처럼{" "}
            <strong>눈에 안 띄게 계속 반복되는 것</strong> 쪽에 있었습니다.
          </Body>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-3 lg:grid-cols-3"
        style={rise(on[IDX.kpt], instant)}
      >
        <Card label="KEEP" accent="var(--ts-primary)">
          <ul className="space-y-1.5 text-[14px] leading-7">
            <li>짐작하지 않고 먼저 재는 습관</li>
            <li>출시까지 끝내 본 경험</li>
            <li>플레이어의 말과 내 의도를 분리해 보기</li>
          </ul>
        </Card>

        <Panel label="PROBLEM">
          <ul className="space-y-2 text-[13px] leading-6 text-[var(--ts-muted)]">
            <li>
              <span style={{color: "var(--ts-warn)"}}>·</span>{" "}
              <strong className="text-[var(--ts-text)]">
                점프 매커니즘을 끝내 고치지 못했다.
              </strong>{" "}
              오브젝트를 옮겨 증상만 피한 채 출시했다.
            </li>
            <li>
              <span style={{color: "var(--ts-warn)"}}>·</span>{" "}
              <strong className="text-[var(--ts-text)]">
                개선 폭을 수치로 남기지 않았다.
              </strong>{" "}
              Profiler 로 확인만 하고 기록하지 않아, 지금은
              &ldquo;좋아졌다&rdquo; 고밖에 말할 수 없다.
            </li>
            <li>
              <span style={{color: "var(--ts-warn)"}}>·</span>{" "}
              <strong className="text-[var(--ts-text)]">
                유저테스트를 정량화하지 않았다.
              </strong>{" "}
              네 줄의 피드백은 남았지만 테스터 수·이탈 지점은 남지 않았다.
            </li>
          </ul>
        </Panel>

        <Card label="TRY" accent="var(--ts-accent)">
          <ul className="space-y-1.5 text-[14px] leading-7">
            <li>로딩 · 리소스 관리 (Addressables)</li>
            <li>세이브 데이터 버전 관리</li>
            <li>증상이 아니라 매커니즘을 고치기</li>
          </ul>
        </Card>
      </div>

      {/* 나가는 문 */}
      <div
        className="mt-12 flex flex-col items-center gap-4 pt-10"
        style={{
          borderTop: "1px solid rgba(52,211,153,0.14)",
          ...rise(on[IDX.exit], instant)
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid var(--ts-border)",
              color: "var(--ts-muted)"
            }}
          >
            GitHub 저장소 ↗
          </a>
          <button
            type="button"
            onClick={onExit}
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid rgba(52,211,153,0.45)",
              background: "rgba(52,211,153,0.14)",
              color: "var(--ts-accent)"
            }}
          >
            ← 마을로 돌아가기
          </button>
        </div>
        <p className="font-mono text-[11px] text-[var(--ts-faint)]">
          나가면 진행 상황이 저장됩니다 · Esc 를 눌러도 나갈 수 있습니다
        </p>
      </div>
    </Page>
  );
}
