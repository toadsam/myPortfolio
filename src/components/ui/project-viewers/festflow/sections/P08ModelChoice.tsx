"use client";

import {useCallback, useRef, useState} from "react";
import {useFestFlow} from "../context";
import {
  Body,
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
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 08 — 더 좋은 모델을 안 골랐습니다  ⭐ 이 방의 두 번째 명장면
//
// 개발 실체: 발표자료 21장 「모델 성능 비교」 원문 — 전부 실측값이다.
//   Accuracy  RandomForest 0.7984  /  XGBoost 0.8143
//   Macro F1  RandomForest 0.79    /  XGBoost 0.81
//   선택 이유 4가지 · 평가 지표 선택 이유까지 원문 그대로
// 연출 장치: A/B 토글로 두 숫자를 나란히 놓고, **더 낮은 쪽을 고른 이유**를 편다

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, demo: 3, why: 4};

const SCORES = {
  rf: {name: "RandomForest", acc: 0.7984, f1: 0.79, tag: "운영 모델"},
  xgb: {name: "XGBoost", acc: 0.8143, f1: 0.81, tag: "비교 실험 모델"}
} as const;

// 발표자료 21장 원문
const REASONS = [
  {
    n: "1",
    t: "성능 차이가 작다",
    d: "Accuracy 0.7984 vs 0.8143 / Macro F1 0.79 vs 0.81. XGBoost 가 더 높지만 운영 모델을 바꿀 정도로 큰 차이는 아님"
  },
  {
    n: "2",
    t: "운영 안정성이 중요하다",
    d: "실시간 예측 서비스를 목표로 하므로 최고 성능 1개보다 안정적으로 추론되고 관리되는 모델이 필요"
  },
  {
    n: "3",
    t: "배포와 유지보수가 단순하다",
    d: "scikit-learn 기반으로 모델 저장, Python 추론, 백엔드 연동 구조가 단순하고 안정적"
  },
  {
    n: "4",
    t: "예측 근거를 제시하기 쉽다",
    d: "feature importance 를 통해 어떤 입력값이 혼잡도 예측에 영향을 줬는지 설명 가능"
  }
] as const;

export function P08ModelChoice() {
  const {reducedMotion, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [pick, setPick] = useState<0 | 1>(0); // 0 = RF, 1 = XGB
  const chosen = pick === 0 ? SCORES.rf : SCORES.xgb;

  const change = useCallback(
    (v: 0 | 1) => {
      setPick(v);
      announce(
        v === 0
          ? "RandomForest — 실제로 운영에 올린 모델입니다."
          : "XGBoost — 성능은 더 높지만 비교 실험에만 썼습니다."
      );
    },
    [announce]
  );

  return (
    <Page index={8} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        08 · 모델 선택
      </Kicker>

      <div className="mt-4">
        <Heading
          text="더 좋은 모델을 안 골랐습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          두 모델을 다 학습시켜 재 봤고, <strong>XGBoost 가 더 높았습니다.</strong>{" "}
          그런데 운영에 올린 건 RandomForest 입니다.{" "}
          <span style={{color: "var(--ff-accent)"}}>
            숫자가 0.016 높은 것보다, 축제 당일에 안 죽는 게 중요했기 때문입니다.
          </span>
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-5 rounded-md p-5"
          style={{
            border: "1px solid var(--ff-border)",
            background: "var(--ff-panel)"
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
              MODEL BENCH · 실측값
            </span>
            <Switch2
              label="모델 선택"
              options={["RandomForest", "XGBoost"]}
              value={pick}
              onChange={change}
            />
          </div>

          {/* 두 지표를 나란히 */}
          {(
            [
              ["Accuracy", SCORES.rf.acc, SCORES.xgb.acc],
              ["Macro F1", SCORES.rf.f1, SCORES.xgb.f1]
            ] as const
          ).map(([label, rf, xgb]) => (
            <div key={label}>
              <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--ff-muted)]">
                {label}
              </div>
              <div className="mt-2.5 flex flex-col gap-2">
                {(
                  [
                    ["RandomForest", rf, pick === 0],
                    ["XGBoost", xgb, pick === 1]
                  ] as const
                ).map(([n, v, sel]) => (
                  <div key={n} className="flex items-center gap-3">
                    <span
                      className="w-[92px] shrink-0 font-mono text-[11px]"
                      style={{color: sel ? "var(--ff-primary)" : "var(--ff-muted)"}}
                    >
                      {n}
                    </span>
                    <div className="ff-bar flex-1">
                      <span
                        style={{
                          width: `${v * 100}%`,
                          backgroundColor: sel
                            ? "var(--ff-primary)"
                            : "rgba(255,255,255,0.22)"
                        }}
                      />
                    </div>
                    <span
                      className="w-[54px] shrink-0 text-right font-mono text-[12px] font-bold tabular-nums"
                      style={{color: sel ? "var(--ff-accent)" : "var(--ff-muted)"}}
                    >
                      {v.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div
            className="rounded-md p-4"
            style={{
              border:
                pick === 0
                  ? "1px solid rgba(74,222,128,0.34)"
                  : "1px solid rgba(255,255,255,0.12)",
              background:
                pick === 0 ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.02)"
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[12px] font-bold text-[var(--ff-text)]">
                {chosen.name}
              </span>
              <span
                className="rounded px-2 py-0.5 font-mono text-[10px] font-black"
                style={{
                  background:
                    pick === 0
                      ? "rgba(74,222,128,0.18)"
                      : "rgba(255,255,255,0.08)",
                  color: pick === 0 ? "var(--ff-live)" : "var(--ff-muted)"
                }}
              >
                {chosen.tag}
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-6 text-[var(--ff-muted)]">
              {pick === 0
                ? "실제 서비스가 부르는 모델입니다. scikit-learn 으로 저장하고 Python 으로 추론합니다."
                : "학습해서 재 보기만 했습니다. 운영에는 올리지 않았습니다."}
            </p>
          </div>

          <Hint>
            <strong>평가 지표를 둘 다 본 이유</strong> — 혼잡도 예측은 다중 클래스
            분류이고, 운영상 BUSY / VERY_BUSY 를 놓치지 않는 게 중요하므로 전체
            정확도(Accuracy)와 클래스 균형 성능(Macro F1)을 함께 평가했습니다.
          </Hint>
        </div>

        {/* 고른 이유 */}
        <div
          className="flex flex-col gap-2.5"
          style={rise(on[IDX.why], instant)}
        >
          <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
            왜 RandomForest 를 운영 모델로 선택했는가
          </div>
          {REASONS.map(r => (
            <div
              key={r.n}
              className="rounded-md p-3.5"
              style={{
                border: "1px solid var(--ff-border)",
                background: "var(--ff-panel)"
              }}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className="font-mono text-[11px] font-black"
                  style={{color: "var(--ff-primary)"}}
                >
                  {r.n}
                </span>
                <span className="text-[13px] font-bold text-[var(--ff-text)]">
                  {r.t}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] leading-6 text-[var(--ff-muted)]">
                {r.d}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Shot
          src="/projects/festflow/model-compare.webp"
          alt="모델 성능 비교 — RandomForest vs XGBoost"
          caption="실측 비교표 (발표자료 21장) — 위 막대의 원본"
          w={1600}
          h={900}
        />
        <Panel label="여기서 배운 것">
          <p className="text-[13px] leading-6 text-[var(--ff-muted)]">
            모델을 고르는 기준이 <strong className="text-[var(--ff-text)]">
            숫자 하나</strong>가 아니라는 걸 이때 알았습니다. 배포 난이도, 추론
            안정성, 설명 가능성까지 같이 놓고 봐야 &ldquo;운영할 수 있는
            모델&rdquo;이 나옵니다. 0.016 을 포기하고 얻은 게 그거였습니다.
          </p>
        </Panel>
      </div>
    </Page>
  );
}
