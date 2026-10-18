"use client";

/**
 * 배전반 본문 — 컨디션 한 줄 + 회로 블록들.
 *
 * 회로 순서: 운동 · 공부 · 코딩 · 켜진 프로젝트들 · 회로 없음. 프로젝트는 분이 있거나
 * 지시서가 있는 것만 보이고, "+ 프로젝트 회로 켜기"로 더 꺼낸다. 열세 개를 다 늘어놓으면
 * 매일 보는 화면이 목록이 된다.
 */

import {useMemo, useRef, useState} from "react";
import type * as React from "react";
import {projects} from "@/data/projects";
import type {ActivityInput, PlanItem} from "@/types/live";
import {CircuitBlock} from "../_components/CircuitBlock";
import {
  CodingDetails,
  StudyDetails,
  WorkoutDetails
} from "../_components/CircuitDetails";
import {OrderRow} from "../_components/OrderRow";
import {
  DAILY_GOALS,
  PLAZA_ONLY,
  SKILL_BUILDINGS,
  moodOptions,
  projectBuildingIds
} from "../_lib/options";
import {buzz, sfx} from "../_lib/sfx";
import type {PlanItemsApi} from "../_lib/usePlanItems";

const MOOD_FACE: Record<string, string> = {
  steady: "M8 15h8M9 10h.01M15 10h.01",
  focused: "M8 15c1.2 1 2.6 1.5 4 1.5s2.8-.5 4-1.5M8 9.5h2.5M13.5 9.5H16",
  tired: "M8 16c1.2-1 2.6-1.5 4-1.5s2.8.5 4 1.5M9 10h.01M15 10h.01",
  proud:
    "M8 14.5c1.2 1.3 2.6 2 4 2s2.8-.7 4-2M8 10l1.5-1.5L11 10M13 10l1.5-1.5L16 10"
};

export function BoardScreen({
  form,
  updateForm,
  setProjectMinutes,
  plan,
  onOrderApplied,
  onFlashBuildings,
  registerFocus,
  isPicked
}: {
  form: ActivityInput;
  updateForm: (patch: Partial<ActivityInput>) => void;
  setProjectMinutes: (projectId: string, minutes: number) => void;
  plan: PlanItemsApi;
  onOrderApplied: (item: PlanItem, delta: number) => void;
  onFlashBuildings: (ids: string[]) => void;
  registerFocus: (ids: string[], focus: () => void) => void;
  isPicked: (ids: string[]) => boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [laterOpen, setLaterOpen] = useState(false);
  const ordersOf = (circuit: string) =>
    plan.items.filter(i => i.circuit === circuit);

  const visibleProjects = useMemo(
    () =>
      projects.filter(
        p =>
          (form.project_minutes[p.id] ?? 0) > 0 ||
          plan.items.some(i => i.circuit === `project:${p.id}`)
      ),
    [form.project_minutes, plan.items]
  );
  const hiddenProjects = projects.filter(p => !visibleProjects.includes(p));

  const common = {
    onAddOrder:
      (circuit: string) =>
      (title: string, minutes: number, due: string | null) =>
        void plan.create({title, circuit, minutes, due_label: due}),
    onToggleOrder: (item: PlanItem) => plan.toggle(item),
    onOrderApplied,
    onOrderMinutes: (item: PlanItem, m: number) =>
      void plan.setMinutes(item, m),
    onDeferOrder: (item: PlanItem) => void plan.defer(item),
    onRemoveOrder: (item: PlanItem) => void plan.remove(item),
    onFlashBuildings,
    registerFocus
  };

  return (
    <section className="ab-board">
      <ConditionRow form={form} updateForm={updateForm} />

      <CircuitBlock
        {...common}
        buildingIds={PLAZA_ONLY}
        color="var(--ab-c-workout)"
        details={<WorkoutDetails form={form} updateForm={updateForm} />}
        goal={DAILY_GOALS.workout}
        id="workout"
        max={DAILY_GOALS.workout * 3}
        name="운동"
        note="광장 · 루미"
        onAddOrder={common.onAddOrder("workout")}
        onChange={v => updateForm({workout_minutes: v, workout_done: v > 0})}
        orders={ordersOf("workout")}
        picked={isPicked(PLAZA_ONLY)}
        value={form.workout_done ? form.workout_minutes : 0}
      />
      <CircuitBlock
        {...common}
        buildingIds={SKILL_BUILDINGS}
        color="var(--ab-c-study)"
        details={<StudyDetails form={form} updateForm={updateForm} />}
        goal={DAILY_GOALS.study}
        id="study"
        max={DAILY_GOALS.study * 3}
        name="공부"
        note="기술 건물 다섯 채"
        onAddOrder={common.onAddOrder("study")}
        onChange={v => updateForm({study_minutes: v})}
        orders={ordersOf("study")}
        picked={isPicked(SKILL_BUILDINGS)}
        value={form.study_minutes}
      />
      <CircuitBlock
        {...common}
        color="var(--ab-c-coding)"
        details={<CodingDetails form={form} updateForm={updateForm} />}
        goal={DAILY_GOALS.coding}
        id="coding"
        max={DAILY_GOALS.coding * 3}
        name="코딩"
        note="광장 · 레포가 겹치는 프로젝트"
        onAddOrder={common.onAddOrder("coding")}
        onChange={v => updateForm({coding_minutes: v})}
        orders={ordersOf("coding")}
        registerFocus={undefined}
        value={form.coding_minutes}
      />
      {visibleProjects.map(p => (
        <CircuitBlock
          {...common}
          bonus={false}
          buildingIds={projectBuildingIds[p.id]}
          color="var(--ab-c-project)"
          goal={60}
          id={p.id}
          key={p.id}
          max={180}
          name={p.title}
          note="프로젝트 건물"
          onAddOrder={common.onAddOrder(`project:${p.id}`)}
          onChange={v => setProjectMinutes(p.id, v)}
          orders={ordersOf(`project:${p.id}`)}
          picked={isPicked(projectBuildingIds[p.id] ?? [])}
          value={form.project_minutes[p.id] ?? 0}
        />
      ))}
      {hiddenProjects.length ? (
        <div className="ab-picker">
          <button
            aria-expanded={pickerOpen}
            className="ab-chip is-wide"
            onClick={() => {
              sfx.tick(0.3);
              setPickerOpen(o => !o);
            }}
            type="button"
          >
            + 프로젝트 회로 켜기 ({hiddenProjects.length})
          </button>
          {pickerOpen ? (
            <div className="ab-picker-list">
              {hiddenProjects.map(p => (
                <button
                  className="ab-chip"
                  key={p.id}
                  onClick={() => {
                    sfx.zap();
                    buzz(10);
                    setProjectMinutes(p.id, 60);
                    setPickerOpen(false);
                  }}
                  type="button"
                >
                  {p.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <CircuitBlock
        {...common}
        color="var(--ab-c-none)"
        goal={0}
        id="none"
        max={0}
        name="회로 없음"
        noGauge
        note="기록에 안 들어가는 일 · 완료하면 +10kWh"
        onAddOrder={common.onAddOrder("none")}
        onChange={() => undefined}
        orders={ordersOf("none")}
        registerFocus={undefined}
        value={0}
      />

      {plan.later.length ? (
        <div className="ab-later">
          <button
            aria-expanded={laterOpen}
            className="ab-later-head"
            onClick={() => {
              sfx.tick(0.2);
              setLaterOpen(o => !o);
            }}
            type="button"
          >
            내일로 넘긴 것 <b>{plan.later.length}</b>
            <span>{laterOpen ? "접기" : "펼치기"}</span>
          </button>
          {laterOpen ? (
            <div className="ab-orders">
              {plan.later.map(item => (
                <OrderRow
                  item={item}
                  key={item.id}
                  noCircuit
                  onDefer={() => undefined}
                  onMinutes={() => undefined}
                  onRemove={() => void plan.remove(item)}
                  onToggle={() => {
                    sfx.tick(0.3);
                    void plan.restore(item);
                  }}
                />
              ))}
              <p className="ab-hint ab-left">
                오른쪽으로 밀면 오늘로 돌아와요.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {plan.error ? <p className="ab-err">{plan.error}</p> : null}
      <p className="ab-hint">
        게이지: 탭하면 목표만큼 켜지고, 끌면 맞춰지고, 길게 누르면 꺼져요.
        <br />
        지시서: 오른쪽으로 밀면 완료, 누르면 고치기.
      </p>
    </section>
  );
}

/** 기분 · 집중도 · 한 줄. 회로가 아니라 늘 붙어 있는 계기라 한 줄로 작게. */
function ConditionRow({
  form,
  updateForm
}: {
  form: ActivityInput;
  updateForm: (patch: Partial<ActivityInput>) => void;
}) {
  return (
    <div className="ab-cond">
      <div className="ab-moods" role="group" aria-label="오늘 기분">
        {moodOptions.map(option => (
          <button
            aria-label={option.label}
            aria-pressed={form.mood === option.value}
            className="ab-mood"
            key={option.value}
            onClick={() => {
              sfx.tick(0.4);
              buzz(8);
              updateForm({mood: option.value});
            }}
            title={option.label}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" />
              <path d={MOOD_FACE[option.value] ?? MOOD_FACE.steady} />
            </svg>
          </button>
        ))}
      </div>
      <FocusDial
        onChange={v => updateForm({focus_score: v})}
        value={form.focus_score}
      />
      <input
        aria-label="오늘 한 줄"
        autoComplete="off"
        className="ab-memo"
        id="admin-memo"
        onChange={e => updateForm({memo: e.target.value})}
        placeholder="오늘 한 줄"
        value={form.memo}
      />
    </div>
  );
}

/** 집중도 다이얼 — 작게. 270° 호 위를 끌어 0~100. */
function FocusDial({
  value,
  onChange
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(value);
  function setFrom(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let a =
      (Math.atan2(
        e.clientY - (r.top + r.height / 2),
        e.clientX - (r.left + r.width / 2)
      ) *
        180) /
      Math.PI;
    a = (a - 135 + 360) % 360;
    if (a > 270) a = a > 315 ? 0 : 270;
    const v = Math.round((a / 270) * 100);
    if (v === value) return;
    if (Math.abs(v - last.current) >= 5) {
      sfx.tick(v / 100);
      buzz(4);
      last.current = v;
    }
    onChange(v);
  }
  const ARC = 122.5;
  return (
    <div
      aria-label="집중도"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value}
      className="ab-dial"
      onKeyDown={e => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(Math.min(100, value + 5));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(Math.max(0, value - 5));
        }
      }}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setFrom(e);
      }}
      onPointerMove={e => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) setFrom(e);
      }}
      ref={ref}
      role="slider"
      tabIndex={0}
      title="집중도"
    >
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          fill="none"
          r="26"
          stroke="#232b34"
          strokeDasharray={`${ARC} 200`}
          strokeWidth="7"
          transform="rotate(135 32 32)"
        />
        <circle
          cx="32"
          cy="32"
          fill="none"
          r="26"
          stroke="#ff9d38"
          strokeDasharray={`${(value / 100) * ARC} 200`}
          strokeLinecap="round"
          strokeWidth="7"
          transform="rotate(135 32 32)"
        />
      </svg>
      <b>{value}</b>
    </div>
  );
}
