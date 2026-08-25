"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useFestFlow} from "../context";
import {
  Body,
  Caveat,
  Cm,
  CodeLine,
  CodePanel,
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

// PAGE 06 — AI 혼잡도 예측 · 30분 뒤를 맞힌다  ⭐ 이 방의 명장면
//
// 개발 실체: 발표자료 19·20장 원문
//   RandomForest · 입력 feature 24개 · 예측 목표 「30분 후 혼잡도」
//   출력 등급 LOW / NORMAL / BUSY / VERY_BUSY
//   학습 데이터 HYBRID_SIMULATED (2,520행 × 28 feature)
// 연출 장치: **관람객이 feature 를 직접 움직이면 등급이 그 자리에서 바뀐다.**
//
// ⚠️ 아래 계산은 **이 페이지가 재현한 규칙**이지 실제 RandomForest 추론이 아니다.
//    feature 이름·구간·출력 등급만 실제와 같고, 그 사실을 화면에 명시한다.

const STEPS = [0, 150, 550, 900, 1300];
const IDX = {label: 0, heading: 1, body: 2, demo: 3, detail: 4};

type Level = "LOW" | "NORMAL" | "BUSY" | "VERY_BUSY";

const LEVEL_META: Record<Level, {label: string; color: string; say: string}> = {
  LOW: {
    label: "여유",
    color: "var(--ff-live)",
    say: "지금 가기 좋은 부스로 추천됩니다."
  },
  NORMAL: {
    label: "보통",
    color: "var(--ff-ray)",
    say: "무난합니다. 굳이 피할 이유가 없습니다."
  },
  BUSY: {
    label: "혼잡",
    color: "var(--ff-stale)",
    say: "잠시 후 방문을 추천합니다."
  },
  VERY_BUSY: {
    label: "매우 혼잡",
    color: "var(--ff-down)",
    say: "피해야 할 부스로 분류되고 주의 안내가 생성됩니다."
  }
};

// 전부 발표자료 20장의 실제 feature 이름이다.
const SLIDERS = [
  {
    key: "gps_count_nearby",
    label: "주변 GPS 추정 인원",
    group: "현장 혼잡 신호",
    min: 0,
    max: 200,
    step: 5,
    unit: "명",
    init: 40,
    weight: 0.3
  },
  {
    key: "minutes_to_next_event",
    label: "다음 공연까지 남은 시간",
    group: "공연 임박 신호",
    min: 0,
    max: 90,
    step: 5,
    unit: "분",
    init: 60,
    weight: -0.28,
    invert: true
  },
  {
    key: "wait_minutes",
    label: "현재 대기 시간",
    group: "대기 / 재고",
    min: 0,
    max: 40,
    step: 1,
    unit: "분",
    init: 4,
    weight: 0.24
  },
  {
    key: "reservation_delta_15m",
    label: "최근 15분 예약 증가량",
    group: "예약 / 체크인",
    min: -10,
    max: 40,
    step: 1,
    unit: "건",
    init: 2,
    weight: 0.18
  }
] as const;

type Key = (typeof SLIDERS)[number]["key"];

export function P06Predict() {
  const {reducedMotion, announce} = useFestFlow();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [vals, setVals] = useState<Record<Key, number>>(() => {
    const o = {} as Record<Key, number>;
    for (const s of SLIDERS) o[s.key] = s.init;
    return o;
  });
  const [peak, setPeak] = useState(false);

  const {score, level} = useMemo(() => {
    let s = 0;
    for (const sl of SLIDERS) {
      const raw = (vals[sl.key] - sl.min) / (sl.max - sl.min);
      const norm = "invert" in sl && sl.invert ? 1 - raw : raw;
      s += norm * Math.abs(sl.weight);
    }
    if (peak) s += 0.12;
    const pct = Math.max(0, Math.min(100, Math.round(s * 100)));
    const lv: Level =
      pct >= 72
        ? "VERY_BUSY"
        : pct >= 52
        ? "BUSY"
        : pct >= 30
        ? "NORMAL"
        : "LOW";
    return {score: pct, level: lv};
  }, [vals, peak]);

  const set = useCallback(
    (k: Key, v: number) => setVals(prev => ({...prev, [k]: v})),
    []
  );

  const meta = LEVEL_META[level];

  // 등급이 바뀌면 스크린리더에 읽어 준다.
  // 렌더 도중에 부르면 부모(FestFlowRoom) state 를 렌더 중에 갱신하게 돼
  // React 가 경고한다 — 커밋 뒤 effect 에서 처리한다.
  const lastLevel = useRef<Level>(level);
  useEffect(() => {
    if (lastLevel.current === level) return;
    lastLevel.current = level;
    const m = LEVEL_META[level];
    announce(`30분 뒤 예측: ${m.label}. ${m.say}`);
  }, [level, announce]);

  return (
    <Page index={6} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        06 · AI 혼잡도 예측
      </Kicker>

      <div className="mt-4">
        <Heading
          text="지금 붐비는 건 이미 늦었습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          &ldquo;지금 매우 혼잡&rdquo;을 보고 발길을 돌리면, 도착했을 때는 이미
          한산해져 있을 수도 있습니다. 방문객에게 필요한 건 현재가 아니라{" "}
          <strong style={{color: "var(--ff-accent)"}}>30분 뒤</strong>입니다.
          그래서 <strong>24개 feature</strong>로 30분 후 혼잡도를 예측하고, 그
          결과로 추천 부스와 회피 부스를 나눕니다. 아래 값을 움직여 보세요.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        {/* 입력 */}
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: "1px solid var(--ff-border)",
            background: "var(--ff-panel)"
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
              INPUT FEATURES
            </span>
            <span className="font-mono text-[10px] text-[var(--ff-faint)]">
              24개 중 4개만 노출
            </span>
          </div>

          {SLIDERS.map(s => (
            <div key={s.key}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] text-[var(--ff-text)]">
                  {s.label}
                </span>
                <span
                  className="font-mono text-[12px] font-bold tabular-nums"
                  style={{color: "var(--ff-accent)"}}
                >
                  {vals[s.key]}
                  {s.unit}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={vals[s.key]}
                onChange={e => set(s.key, Number(e.target.value))}
                className="mt-1.5 w-full cursor-pointer accent-[var(--ff-primary)]"
                aria-label={`${s.label} (${s.key})`}
              />
              <div className="mt-0.5 flex justify-between">
                <span className="font-mono text-[10px] text-[var(--ff-faint)]">
                  {s.key}
                </span>
                <span className="font-mono text-[10px] text-[var(--ff-faint)]">
                  {s.group}
                </span>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setPeak(v => !v)}
            role="switch"
            aria-checked={peak}
            className="cursor-pointer rounded-md px-4 py-2.5 text-left font-mono text-[11px] transition-colors duration-200"
            style={{
              border: `1px solid ${
                peak ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.12)"
              }`,
              background: peak ? "rgba(251,191,36,0.10)" : "transparent",
              color: peak ? "var(--ff-primary)" : "var(--ff-muted)"
            }}
          >
            {peak ? "● " : "○ "}is_peak_time = {peak ? "true" : "false"}
            <span className="ml-2 text-[10px] text-[var(--ff-faint)]">
              (피크 시간대 여부)
            </span>
          </button>
        </div>

        {/* 출력 */}
        <div className="flex flex-col gap-3">
          <div
            className="rounded-md p-5 transition-[border-color,background-color] duration-300"
            style={{
              border: `1px solid ${meta.color}`,
              background: `color-mix(in srgb, ${meta.color} 8%, transparent)`
            }}
          >
            <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--ff-muted)]">
              30분 뒤 예측
            </div>
            <div
              className="mt-3 font-mono text-[30px] font-black leading-none sm:text-[36px]"
              style={{color: meta.color}}
            >
              {level}
            </div>
            <div className="mt-1.5 text-[13px] text-[var(--ff-text)]">
              {meta.label}
            </div>

            <div className="ff-bar mt-4">
              <span
                style={{
                  width: `${score}%`,
                  backgroundColor: meta.color,
                  transition: "width 0.25s var(--ff-ease)"
                }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-[var(--ff-faint)]">
              <span>혼잡 위험 점수</span>
              <span className="tabular-nums">{score} / 100</span>
            </div>

            <p className="mt-4 text-[12px] leading-6 text-[var(--ff-muted)]">
              {meta.say}
            </p>
          </div>

          <CodePanel
            filename="AiCongestionService.java"
            badge={{text: "실제 클래스", color: "var(--ff-primary)"}}
            borderColor="var(--ff-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>{"// 현재 축제 상황을 한 번에 모아 스냅샷으로 만든다"}</Cm>
              </CodeLine>
              <CodeLine n={2}>
                {"FestivalSnapshot snap = snapshotService.current();"}
              </CodeLine>
              <CodeLine n={3}>
                {"var gps = gpsLogRepository.findRecent();"}
              </CodeLine>
              <CodeLine n={4}>{""}</CodeLine>
              <CodeLine n={5} highlight>
                {"var out = pythonCongestionModelService"}
              </CodeLine>
              <CodeLine n={6} highlight>
                {"        .predictBatch(toFeatures(snap, gps));"}
              </CodeLine>
              <CodeLine n={7}>{""}</CodeLine>
              <CodeLine n={8}>
                <Cm>{"// 등급 + 위험 점수 + 추천/회피 부스로 정리"}</Cm>
              </CodeLine>
              <CodeLine n={9}>
                {"return out.stream().map(AiBoothRecommendationDto::of)"}
              </CodeLine>
              <CodeLine n={10}>{"          .toList();"}</CodeLine>
            </div>
          </CodePanel>
        </div>
      </div>

      <div className="mt-4">
        <Caveat>
          위 등급은 <strong>이 페이지가 재현한 규칙 계산</strong>이며 실제
          RandomForest 추론이 아닙니다. feature 이름 · 그룹 · 출력 등급 4단계 ·
          &ldquo;30분 후&rdquo;라는 예측 목표만 실제 모델과 같습니다. 실제 학습
          데이터는 HYBRID_SIMULATED(2,520행 × 28 feature)입니다.
        </Caveat>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-2"
        style={rise(on[IDX.detail], instant)}
      >
        <Shot
          src="/projects/festflow/features.webp"
          alt="학습 데이터 & Feature 구성 — 24개 입력 feature 표"
          caption="24개 feature 전체 — 시간 · 공연 · 임박 신호 · 위치 · GPS · 예약 · 대기"
          w={1600}
          h={900}
        />
        <div className="flex flex-col gap-3">
          <Shot
            src="/projects/festflow/model-overview.webp"
            alt="AI 혼잡도 예측 전체 구조"
            caption="수집 → feature 24개 → RandomForest → fallback 보정 → 추천"
            w={1600}
            h={900}
          />
          <Panel label="출력이 곧 행동 지침">
            <p className="text-[13px] leading-6 text-[var(--ff-muted)]">
              예측 등급만 주면 방문객은 여전히 판단해야 합니다. 그래서 등급을{" "}
              <strong className="text-[var(--ff-text)]">
                추천 부스 / 회피 부스 / 나중에 갈 부스
              </strong>
              로 바꿔서 내려보냅니다. VERY_BUSY 는 주의 안내 문구까지 같이
              생성됩니다.
            </p>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <Hint>
          다음 장은 이 예측이 <strong>실패했을 때</strong>의 이야기입니다. 외부
          모델이 죽어도 화면은 살아 있어야 하니까요.
        </Hint>
      </div>
    </Page>
  );
}
