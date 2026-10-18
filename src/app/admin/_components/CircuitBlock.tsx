"use client";

/**
 * 회로 블록 — 한 화면 배전반의 기본 단위. 머리 + 게이지 하나 + 그 회로의 지시서.
 *
 * ```
 * ● 공부  기술 건물 다섯 채                 45분  상세
 *   ▮▮▮▮▯▯▯▯│▯▯▯▯▯▯▯▯   ← 게이지 하나가 유일한 손잡이
 *   ─────────────────────
 *   ☐ CS 노트: 트랜잭션 격리         30분   ← 오른쪽 밀면 완료
 *   + 공부 지시서 한 줄, Enter
 * ```
 *
 * ## 손잡이는 게이지 하나
 *
 * 값 0 에서 탭하면 목표치, 켜져 있으면 탭마다 +15, 끌면 그 위치, 600ms 길게 누르면 0.
 * 레버·±버튼은 뺐다. 손잡이가 넷이면 세 보이지만 매일 쓸 땐 "어느 걸 누르지"가 먼저다.
 *
 * ## 지시서 완료는 전기가 날아간 뒤에 더한다
 *
 * 카드 완료 → 퓨즈 불꽃 → `bolt` 가 게이지로 → 도착하면 분을 더하고 게이지가 번쩍.
 * 서버 요청(`onToggleOrder`)은 밀자마자 보낸다. 연출은 손맛이고 저장은 사실이다.
 *
 * ## 목표선을 손으로 넘길 때만 축하한다
 *
 * 불러오기나 지시서 완료로 넘어갈 때는 `setMin` 을 거치지 않으므로(부모가 폼을 직접
 * 고친다) 불꽃이 안 튄다. 아무것도 안 했는데 축하받는 화면을 막는다.
 */

import {useCallback, useEffect, useRef, useState} from "react";
import type * as React from "react";
import type {PlanItem} from "@/types/live";
import {bolt, floatText, sparksAt} from "../_lib/fx";
import {buzz, sfx} from "../_lib/sfx";
import {OrderRow, fmtMinutes} from "./OrderRow";

const SEGMENTS = 16;
const STEP = 5;
const HARD_CAP = 1440;
const HOLD_OFF_MS = 600;
const ADD_MINUTES = [15, 30, 45, 60, 90];

export function CircuitBlock({
  id,
  name,
  note,
  color,
  value,
  goal,
  max,
  bonus = true,
  noGauge = false,
  buildingIds,
  orders,
  onChange,
  onFlashBuildings,
  registerFocus,
  picked,
  details,
  onAddOrder,
  onToggleOrder,
  onOrderApplied,
  onOrderMinutes,
  onDeferOrder,
  onRemoveOrder
}: {
  id: string;
  name: string;
  note?: string;
  /** CSS 색 — `var(--ab-c-study)` 처럼 */
  color: string;
  value: number;
  goal: number;
  max: number;
  /** 목표를 채우면 kWh 보너스가 붙는 회로인가(주 회로 셋만) */
  bonus?: boolean;
  /** "회로 없음" 묶음 — 게이지가 없다 */
  noGauge?: boolean;
  buildingIds?: string[];
  orders: PlanItem[];
  onChange: (minutes: number) => void;
  /** 목표선을 넘었다 — 지도의 짝 건물을 번쩍이게 */
  onFlashBuildings?: (ids: string[]) => void;
  registerFocus?: (ids: string[], focus: () => void) => void;
  picked?: boolean;
  details?: React.ReactNode;
  onAddOrder: (title: string, minutes: number, dueLabel: string | null) => void;
  /** 완료/취소. 돌아오는 값은 서버가 확정한 항목(실패면 null). */
  onToggleOrder: (item: PlanItem) => Promise<PlanItem | null>;
  /** 서버가 확정한 뒤 폼에 분량을 더하거나 뺀다(부모가 함수형 갱신으로 처리). */
  onOrderApplied: (item: PlanItem, delta: number) => void;
  onOrderMinutes: (item: PlanItem, minutes: number) => void;
  onDeferOrder: (item: PlanItem) => void;
  onRemoveOrder: (item: PlanItem) => void;
}) {
  const blockRef = useRef<HTMLElement>(null);
  const gaugeRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addMin, setAddMin] = useState(30);
  const [addDue, setAddDue] = useState(false);
  const live = value > 0;

  useEffect(() => {
    if (!buildingIds?.length || !registerFocus) return;
    registerFocus(buildingIds, () => {
      blockRef.current?.scrollIntoView({behavior: "smooth", block: "center"});
      setFlash(true);
      window.setTimeout(() => setFlash(false), 1300);
    });
  }, [buildingIds, registerFocus]);

  /** 값을 바꾼다. 손으로 목표선을 넘기면 축하한다. */
  const setMin = useCallback(
    (raw: number) => {
      const next = Math.max(
        0,
        Math.min(HARD_CAP, Math.round(raw / STEP) * STEP)
      );
      if (next === value) return;
      if (value < goal && next >= goal) {
        sparksAt(gaugeRef.current, 22, "#e2c078");
        floatText(
          blockRef.current?.querySelector(".ab-c-val") ?? null,
          bonus ? "목표 달성 +50kWh" : "목표 달성"
        );
        if (buildingIds) onFlashBuildings?.(buildingIds);
        sfx.chime();
        buzz([20, 40, 20]);
      } else if (value === 0 && next > 0) {
        sparksAt(blockRef.current?.querySelector(".ab-c-name") ?? null, 8);
        sfx.zap();
        if (buildingIds) onFlashBuildings?.(buildingIds);
      }
      onChange(next);
    },
    [bonus, buildingIds, goal, onChange, onFlashBuildings, value]
  );

  /* ── 게이지: 탭 = 켜기/+15, 끌기 = 맞추기, 길게 = 끄기 ── */
  const gd = useRef<{
    x: number;
    moved: boolean;
    held: boolean;
    last: number;
    hold: number;
  } | null>(null);

  function gaugeDown(e: React.PointerEvent<HTMLDivElement>) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // 합성 이벤트(테스트)나 이미 끝난 포인터 — 캡처 없이도 탭은 된다
    }
    gd.current = {
      x: e.clientX,
      moved: false,
      held: false,
      last: -1,
      hold: window.setTimeout(() => {
        const d = gd.current;
        if (!d || d.moved) return;
        d.held = true;
        onChange(0);
        sfx.off();
        buzz(30);
        floatText(gaugeRef.current, `${name} 회로를 껐어요`);
      }, HOLD_OFF_MS)
    };
  }
  function gaugeMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = gd.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientX - d.x) < 6) return;
    d.moved = true;
    window.clearTimeout(d.hold);
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const seg = Math.round(ratio * SEGMENTS);
    if (seg !== d.last) {
      d.last = seg;
      sfx.tick(ratio);
      buzz(4);
    }
    setMin(ratio * max);
  }
  function gaugeUp() {
    const d = gd.current;
    gd.current = null;
    if (!d) return;
    window.clearTimeout(d.hold);
    if (d.moved || d.held) return;
    if (value === 0) setMin(goal);
    else {
      setMin(Math.min(HARD_CAP, value + 15));
      floatText(gaugeRef.current, "+15");
      sfx.tick(0.5);
      buzz(6);
    }
  }

  /* ── 지시서 완료 연출 ── */
  function toggleOrder(item: PlanItem, el: HTMLElement) {
    const willDone = !item.done;
    if (willDone) {
      sparksAt(el.querySelector(".ab-fuse"), 12, "#7bd88f");
      sfx.fuse();
      buzz([10, 30, 10]);
    } else sfx.tick(0.2);
    void onToggleOrder(item).then(saved => {
      if (!saved) return;
      if (noGauge || !saved.minutes) {
        onOrderApplied(saved, 0);
        return;
      }
      if (saved.done) {
        // 전기가 게이지에 닿는 순간 값이 들어간다. 축하(목표선 불꽃)는 손으로 넘길 때만이라
        // 여기서는 setMin 이 아니라 부모의 함수형 갱신으로 바로 더한다.
        bolt(el, gaugeRef.current, () => {
          onOrderApplied(saved, saved.minutes);
          gaugeRef.current?.animate(
            [
              {filter: "brightness(1)"},
              {filter: "brightness(1.8)"},
              {filter: "brightness(1)"}
            ],
            {duration: 400}
          );
        });
      } else onOrderApplied(saved, -saved.minutes);
    });
  }

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = addTitle.trim();
    if (!title) {
      (e.currentTarget as HTMLFormElement)
        .querySelector("input")
        ?.animate(
          [
            {transform: "translateX(0)"},
            {transform: "translateX(-4px)"},
            {transform: "translateX(4px)"},
            {transform: "translateX(0)"}
          ],
          {duration: 250}
        );
      return;
    }
    onAddOrder(title, noGauge ? 0 : addMin, addDue ? "마감" : null);
    setAddTitle("");
    setAddDue(false);
    sfx.fuse();
    buzz(10);
  }

  const onSeg = noGauge
    ? 0
    : Math.round((Math.min(value, max) / max) * SEGMENTS);
  const goalSeg = noGauge ? 0 : Math.ceil((goal / max) * SEGMENTS);

  return (
    <section
      className={`ab-circuit${live ? " is-live" : ""}${
        !noGauge && value >= goal ? " is-full" : ""
      }${flash || picked ? " is-flash" : ""}`}
      data-circuit={id}
      ref={blockRef}
      style={{["--c" as string]: color}}
    >
      <div className="ab-c-head">
        <div className="ab-c-top">
          <span className="ab-c-name">{name}</span>
          {note ? <span className="ab-c-note">{note}</span> : null}
          {noGauge ? null : (
            <span className="ab-c-val">
              <b>{value}</b>분
            </span>
          )}
          {details ? (
            <button
              aria-expanded={open}
              className="ab-c-more"
              onClick={() => {
                sfx.tick(0.3);
                setOpen(o => !o);
              }}
              type="button"
            >
              {open ? "접기" : "상세"}
            </button>
          ) : null}
        </div>
        {noGauge ? null : (
          <div
            aria-label={`${name} 시간(분). 탭하면 켜지고, 끌어서 맞추고, 길게 누르면 꺼져요`}
            aria-valuemax={max}
            aria-valuemin={0}
            aria-valuenow={value}
            className="ab-gauge"
            onKeyDown={e => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                setMin(value + STEP);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                setMin(value - STEP);
              } else if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                onChange(0);
                sfx.off();
              }
            }}
            onPointerCancel={gaugeUp}
            onPointerDown={gaugeDown}
            onPointerMove={gaugeMove}
            onPointerUp={gaugeUp}
            ref={gaugeRef}
            role="slider"
            tabIndex={0}
          >
            {Array.from({length: SEGMENTS}, (_, i) => (
              <i
                className={`ab-seg${
                  i < onSeg ? (i >= goalSeg ? " is-on is-over" : " is-on") : ""
                }`}
                key={i}
              />
            ))}
            <span
              className="ab-goal"
              style={{left: `${Math.min(100, (goal / max) * 100)}%`}}
            >
              <span>목표 {goal}</span>
            </span>
          </div>
        )}
        {details && open ? <div className="ab-extra">{details}</div> : null}
      </div>

      <div className="ab-orders">
        {orders.map(item => (
          <OrderRow
            item={item}
            key={item.id}
            noCircuit={noGauge}
            onDefer={() => onDeferOrder(item)}
            onMinutes={m => onOrderMinutes(item, m)}
            onRemove={() => onRemoveOrder(item)}
            onToggle={el => toggleOrder(item, el)}
          />
        ))}
        <form autoComplete="off" className="ab-add" onSubmit={submitAdd}>
          <span aria-hidden="true" className="ab-add-plus">
            +
          </span>
          <input
            aria-label={`${name} 지시서 추가`}
            id={`plan-add-${id}`}
            onChange={e => setAddTitle(e.target.value)}
            onFocus={() => setAddOpen(true)}
            placeholder={
              noGauge ? "할 일 한 줄, Enter" : `${name} 지시서 한 줄, Enter`
            }
            value={addTitle}
          />
          {addOpen ? (
            <div className="ab-add-row">
              {noGauge
                ? null
                : ADD_MINUTES.map(m => (
                    <button
                      aria-pressed={addMin === m}
                      className="ab-chip"
                      key={m}
                      onClick={() => {
                        sfx.tick(0.3);
                        setAddMin(m);
                      }}
                      type="button"
                    >
                      {fmtMinutes(m)}
                    </button>
                  ))}
              <button
                aria-pressed={addDue}
                className="ab-chip"
                onClick={() => {
                  sfx.tick(0.3);
                  setAddDue(d => !d);
                }}
                type="button"
              >
                마감 꼬리표
              </button>
              <button
                className="ab-chip is-quiet"
                onClick={() => setAddOpen(false)}
                type="button"
              >
                접기
              </button>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
