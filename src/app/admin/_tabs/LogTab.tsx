"use client";

/**
 * 기록실 탭 — 매일 보지만 조작하지 않는 것들. 예전 왼쪽 계기 레일이 여기로 왔다.
 *
 * 달력 칸을 누르면 그날 요약이 뜨고, "이 날 열기"로 배전반을 그날로 돌린다.
 * 바로 날짜를 바꾸지 않는 이유: 휴대폰에서 스크롤하다 칸을 스치기 쉬운데, 그때마다
 * 편집 중이던 폼이 그날 기록으로 바뀌면 입력하던 것이 사라진다.
 */

import {useState} from "react";
import type {ActivityInput, AiUsage, DailyActivity} from "@/types/live";
import {ActivityCalendar, AiUsageBar} from "../_components/AdminParts";
import {StreakStamps} from "../_components/SwitchboardBits";
import {addDays, prettyDate, today} from "../_lib/activity";
import {DAILY_GOALS} from "../_lib/options";
import {dayKwh, type PowerSummary} from "../_lib/power";
import {sfx} from "../_lib/sfx";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export function LogTab({
  history,
  historyByDate,
  recordedDates,
  stats,
  power,
  form,
  selectedDate,
  aiUsage,
  onOpenDate
}: {
  history: DailyActivity[];
  historyByDate: Record<string, DailyActivity>;
  recordedDates: Set<string>;
  stats: {recordStreak: number; workoutStreak: number; weekCoding: number};
  power: PowerSummary;
  /** 지금 편집 중인 날 — 오늘 고리는 저장 전 값으로 보여 준다 */
  form: ActivityInput;
  selectedDate: string;
  aiUsage: AiUsage | null;
  onOpenDate: (date: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const pickedDay = picked ? historyByDate[picked] : null;
  const recordedDays = history.filter(h => dayKwh(h) > 0).length;

  const week = Array.from({length: 7}, (_, i) => {
    const date = addDays(today(), i - 6);
    const day: Pick<
      ActivityInput,
      "workout_done" | "workout_minutes" | "study_minutes" | "coding_minutes"
    > | null = date === selectedDate ? form : historyByDate[date] ?? null;
    return {date, day};
  });

  return (
    <section className="ab-tab ab-narrow">
      <div className="ab-card">
        <div className="ab-sec-h">
          <h2>가동 기록</h2>
          <small>최근 16주</small>
        </div>
        <div className="ab-stats">
          <Stat label="연속 기록" unit="일" value={stats.recordStreak} />
          <Stat label="연속 운동" unit="일" value={stats.workoutStreak} />
          <Stat label="이번 주 코딩" unit="분" value={stats.weekCoding} />
        </div>
        <div className="ab-mt">
          <StreakStamps dates={recordedDates} />
        </div>
        <div className="ab-mt">
          <ActivityCalendar
            byDate={historyByDate}
            onPick={date => {
              sfx.tick();
              setPicked(date);
            }}
            selectedDate={picked ?? selectedDate}
          />
        </div>
        {picked ? (
          <div className="ab-day-detail">
            <div>
              <b>{prettyDate(picked)}</b>
              {pickedDay ? (
                <span>
                  {" "}
                  · {dayKwh(pickedDay)}kWh · 운동{" "}
                  {pickedDay.workout_done ? pickedDay.workout_minutes : 0}분 ·
                  공부 {pickedDay.study_minutes}분 · 코딩{" "}
                  {pickedDay.coding_minutes}분
                  {pickedDay.memo ? ` · “${pickedDay.memo}”` : ""}
                </span>
              ) : (
                <span> · 빈 날</span>
              )}
            </div>
            <button
              className="ab-chip-btn is-more"
              onClick={() => onOpenDate(picked)}
              type="button"
            >
              이 날 열기
            </button>
          </div>
        ) : (
          <p className="ab-hint ab-left ab-mt">
            칸을 누르면 그날 기록을 보여 드려요.
          </p>
        )}
      </div>

      <div className="ab-card">
        <div className="ab-sec-h">
          <h2>이번 주 목표 고리</h2>
          <small>최근 7일</small>
        </div>
        <div className="ab-rings-week">
          {week.map(({date, day}) => {
            const d = new Date(date + "T00:00:00");
            return (
              <div key={date}>
                <svg aria-hidden="true" viewBox="0 0 44 44">
                  <Ring
                    color="#8fd1ff"
                    p={
                      day?.workout_done
                        ? day.workout_minutes / DAILY_GOALS.workout
                        : 0
                    }
                    r={19}
                  />
                  <Ring
                    color="#b9a6ff"
                    p={(day?.study_minutes ?? 0) / DAILY_GOALS.study}
                    r={13.5}
                  />
                  <Ring
                    color="#ff9d38"
                    p={(day?.coding_minutes ?? 0) / DAILY_GOALS.coding}
                    r={8}
                  />
                </svg>
                {date === today() ? "오늘" : WEEK[d.getDay()]}
              </div>
            );
          })}
        </div>
        <p className="ab-ring-legend">
          <i style={{background: "#8fd1ff"}} />
          운동 {DAILY_GOALS.workout}분 <i style={{background: "#b9a6ff"}} />
          공부 {DAILY_GOALS.study}분 <i style={{background: "#ff9d38"}} />
          코딩 {DAILY_GOALS.coding}분
        </p>
      </div>

      <div className="ab-card">
        <div className="ab-sec-h">
          <h2>마을 전력</h2>
          <small>기록 {recordedDays}일 합계</small>
        </div>
        <div className="ab-stats">
          <Stat label="등급" unit="" value={`Lv.${power.level}`} />
          <Stat label="누적" unit="kWh" value={power.total.toLocaleString()} />
          <Stat
            label="다음 등급까지"
            unit="kWh"
            value={Math.max(0, power.next - power.total).toLocaleString()}
          />
        </div>
        <p className="ab-hint ab-left ab-mt">
          1분이 1kWh예요. 프로젝트는 0.8배, 커밋은 개당 5, 목표 고리 하나를 채울
          때마다 50이 더해져요. 기록에서 매번 다시 계산합니다.
        </p>
      </div>

      {aiUsage ? (
        <div className="ab-card">
          <div className="ab-sec-h">
            <h2>AI 사용량</h2>
            <small>NPC 대화와 공방 상담</small>
          </div>
          <div className="ab-mt">
            <AiUsageBar usage={aiUsage} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Stat({
  label,
  value,
  unit
}: {
  label: string;
  value: number | string;
  unit: string;
}) {
  return (
    <div className="ab-stat">
      <span>{label}</span>
      <b>
        {value}
        {unit ? <small>{unit}</small> : null}
      </b>
    </div>
  );
}

function Ring({r, p, color}: {r: number; p: number; color: string}) {
  const c = 2 * Math.PI * r;
  return (
    <>
      <circle
        cx="22"
        cy="22"
        fill="none"
        r={r}
        stroke="#232b34"
        strokeWidth="4"
      />
      <circle
        cx="22"
        cy="22"
        fill="none"
        r={r}
        stroke={color}
        strokeDasharray={`${c * Math.max(0, Math.min(1, p))} 999`}
        strokeLinecap="round"
        strokeWidth="4"
        transform="rotate(-90 22 22)"
      />
    </>
  );
}
