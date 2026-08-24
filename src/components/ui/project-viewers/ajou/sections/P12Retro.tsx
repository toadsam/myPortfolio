"use client";

import {useRef} from "react";
import {useAjou} from "../context";
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
// 개발 실체: KPT 회고 (PROBLEM 필수) + 다음 단계 + GitHub
// 연출 장치: GAME OVER → 크레딧 → 캐비닛 전원 종료 (셸이 처리)
//
// 배운 점의 근거는 PDF 34쪽 마지막 문장 원문:
//  "이 프로젝트는 기능 구현을 넘어, 게임 시스템을 구조적으로 설계하고
//   확장 가능한 형태로 구현하는 경험에 집중"
// 및 PDF 29쪽 「확장 가능한 구조를 목표로 Core Loop–System을 분리 설계하여
//   기능 추가/수정이 쉬운 형태로 구현」

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, learn: 2, kpt: 3, exit: 4};

const REPO = "https://github.com/toadsam/Ajou_IndiGame";
const VIDEO = "https://www.youtube.com/watch?v=mtIiIWmrSdg";

export function P12Retro({onExit}: {onExit: () => void}) {
  const {reducedMotion} = useAjou();
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
          text="기능이 아니라 구조를 만든 프로젝트였습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6" style={rise(on[IDX.learn], instant)}>
        <Body>
          혼자 만드는 게임이라 기능을 빨리 붙이는 게 이득처럼 보였습니다. 그런데
          기능이 여덟 개쯤 되니까{" "}
          <span style={{color: "var(--aj-accent)"}}>
            하나를 고칠 때마다 다른 게 부러졌습니다.
          </span>{" "}
          그래서 중간에 방향을 바꿔 코어 루프와 시스템을 갈랐습니다.
        </Body>
        <div className="mt-4">
          <Body>
            효과는 뒤에서 나왔습니다. 스킬 · 퀘스트 · 포탈은 전부{" "}
            <strong>나중에 얹은 것</strong>인데, 얹을 때 전투 코드를 열지 않아도
            됐습니다. 시점 전환처럼 여러 시스템을 동시에 건드리는 기능도{" "}
            <strong>enum + switch 한 곳</strong>에서 끝났습니다.
          </Body>
        </div>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-3 lg:grid-cols-3"
        style={rise(on[IDX.kpt], instant)}
      >
        <Card label="KEEP" accent="var(--aj-primary)">
          <ul className="space-y-1.5 text-[14px] leading-7">
            <li>루프와 시스템을 갈라 두기</li>
            <li>조건을 명확히 해서 플레이어가 예측하게 하기</li>
            <li>Prefab 등록만으로 늘어나는 구조</li>
          </ul>
        </Card>

        <Panel label="PROBLEM">
          <ul className="space-y-2 text-[13px] leading-6 text-[var(--aj-muted)]">
            <li>
              <span style={{color: "var(--aj-warn)"}}>·</span>{" "}
              <strong className="text-[var(--aj-text)]">
                밸런스를 감으로 잡았다.
              </strong>{" "}
              스킬 수치와 웨이브 난이도를 데이터로 빼지 않아 매번 코드를 고쳐
              돌려봐야 했다.
            </li>
            <li>
              <span style={{color: "var(--aj-warn)"}}>·</span>{" "}
              <strong className="text-[var(--aj-text)]">
                시점 전환의 지연을 상수로 박았다.
              </strong>{" "}
              3초는 &ldquo;해보니 되더라&rdquo;로 정한 값이고, 왜 3초인지는
              지금도 설명하지 못한다.
            </li>
            <li>
              <span style={{color: "var(--aj-warn)"}}>·</span>{" "}
              <strong className="text-[var(--aj-text)]">
                플레이 테스트 기록이 없다.
              </strong>{" "}
              혼자 만들다 보니 남이 어디서 막히는지를 남겨 두지 않았다.
            </li>
          </ul>
        </Panel>

        <Card label="TRY" accent="var(--aj-accent)">
          <ul className="space-y-1.5 text-[14px] leading-7">
            <li>수치를 ScriptableObject 로 빼기</li>
            <li>상수에 「왜 이 값인지」 남기기</li>
            <li>남이 하는 걸 보고 기록하기</li>
          </ul>
        </Card>
      </div>

      {/* 나가는 문 */}
      <div
        className="mt-12 flex flex-col items-center gap-4 pt-10"
        style={{
          borderTop: "1px solid rgba(163,230,53,0.16)",
          ...rise(on[IDX.exit], instant)
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={VIDEO}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid var(--aj-border)",
              color: "var(--aj-muted)"
            }}
          >
            플레이 영상 ↗
          </a>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid var(--aj-border)",
              color: "var(--aj-muted)"
            }}
          >
            GitHub 저장소 ↗
          </a>
          <button
            type="button"
            onClick={onExit}
            className="rounded-md px-5 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid rgba(163,230,53,0.45)",
              background: "rgba(163,230,53,0.14)",
              color: "var(--aj-accent)"
            }}
          >
            ← 마을로 돌아가기
          </button>
        </div>
        <p className="font-mono text-[11px] text-[var(--aj-faint)]">
          나가면 캐비닛 전원이 꺼집니다 · Esc 를 눌러도 나갈 수 있습니다
        </p>
      </div>
    </Page>
  );
}
