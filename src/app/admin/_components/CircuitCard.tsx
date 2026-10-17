"use client";

/**
 * 회로 카드 — 배전반 2.0 의 기본 단위. 예전 `CircuitRow`(데스크톱 행)를 손가락용으로 바꿨다.
 *
 * ```
 * [레버] 이름 · 설명                    [큰 숫자]분
 *        ▮▮▮▮▮▮▯▯│▯▯▯▯▯▯▯▯  ← 16칸 게이지, 세로선이 목표
 *        −15  +15  +30            상세 ▾
 * ```
 *
 * ## 값은 하나, 손잡이는 넷
 *
 * 레버(탭 또는 끌어올리기), 게이지(드래그·방향키), ± 버튼, 상세 안의 숫자칸이 모두
 * 같은 한 값을 본다. 레버는 별도 상태가 아니라 "값 > 0" 의 거울이다 — 숫자를 0 으로
 * 만들면 저절로 내려가고, 레버를 내리면 숫자가 0 이 된다.
 *
 * ## 목표선을 넘는 순간만 축하한다
 *
 * 축하는 **이 카드에서 손으로 넘겼을 때만** 터진다. 기록을 불러오거나 날짜를 바꿔
 * 값이 한꺼번에 들어올 때 불꽃이 튀면, 아무것도 안 했는데 축하받는 화면이 된다.
 */

import {useCallback, useEffect, useRef, useState} from "react";
import type * as React from "react";
import {floatText, sparksAt} from "../_lib/fx";
import {buzz, sfx} from "../_lib/sfx";

const SEGMENTS = 16;
const STEP = 5;
/** 버튼·방향키로 올릴 수 있는 끝. 게이지 끝(max)보다 길게 일한 날도 있으니 막지 않는다. */
const HARD_CAP = 1440;

export function CircuitCard({
  id,
  name,
  note,
  value,
  goal,
  max,
  bonus = true,
  buildingIds,
  onChange,
  onToggle,
  onHover,
  registerFocus,
  picked,
  details
}: {
  id: string;
  name: string;
  note?: string;
  value: number;
  /** 목표선. 넘기면 축하한다. */
  goal: number;
  /** 게이지 끝. 값이 이보다 커도 되고, 그땐 게이지가 꽉 찬 채로 숫자만 오른다. */
  max: number;
  /** 목표를 채우면 kWh 보너스가 붙는 회로인가(주 회로 셋만). */
  bonus?: boolean;
  /** 지도에서 이 회로가 켜는 건물들 */
  buildingIds?: string[];
  onChange: (minutes: number) => void;
  /** 레버를 손으로 젖혔을 때. 없으면 켜짐=목표치, 꺼짐=0. */
  onToggle?: (next: boolean) => void;
  onHover?: (ids: string[] | null) => void;
  registerFocus?: (ids: string[], focus: () => void) => void;
  /** 지도에서 이 회로의 건물을 짚었다 */
  picked?: boolean;
  /** "상세 ▾" 안에 들어갈 부속 입력 */
  details?: React.ReactNode;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const gaugeRef = useRef<HTMLDivElement>(null);
  const leverRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const live = value > 0;

  // 지도 → 회로: 건물을 누르면 이 카드로 스크롤하고 잠깐 빛난다
  useEffect(() => {
    if (!buildingIds?.length || !registerFocus) return;
    registerFocus(buildingIds, () => {
      cardRef.current?.scrollIntoView({behavior: "smooth", block: "center"});
      setFlash(true);
      window.setTimeout(() => setFlash(false), 1300);
    });
  }, [buildingIds, registerFocus]);

  /** 손으로 바꾼 값. 목표선을 넘으면 축하한다. */
  const setByHand = useCallback(
    (raw: number, cap: number = HARD_CAP) => {
      const next = Math.max(0, Math.min(cap, Math.round(raw / STEP) * STEP));
      if (next === value) return;
      if (value < goal && next >= goal) {
        sparksAt(gaugeRef.current, 22, "#e2c078");
        floatText(
          cardRef.current?.querySelector(".ab-c-val") ?? null,
          bonus ? "목표 달성 +50kWh" : "목표 달성"
        );
        sfx.chime();
        buzz([20, 40, 20]);
      }
      onChange(next);
    },
    [bonus, goal, onChange, value]
  );

  const throwLever = useCallback(
    (next: boolean) => {
      sfx.clack();
      buzz(15);
      if (next) {
        sparksAt(leverRef.current, 10);
        sfx.zap();
      }
      if (onToggle) onToggle(next);
      else setByHand(next ? goal : 0);
    },
    [goal, onToggle, setByHand]
  );

  /* ── 레버 끌어올리기 ──
     탭이면 토글, 6px 넘게 끌면 손잡이가 손가락을 따라오고 놓은 위치로 켜고 끈다. */
  const drag = useRef<{y: number; moved: boolean; start: boolean} | null>(null);
  const [knobTop, setKnobTop] = useState<number | null>(null);
  const KNOB_ON = 8;
  const KNOB_OFF = 46;

  function onLeverDown(e: React.PointerEvent<HTMLButtonElement>) {
    drag.current = {y: e.clientY, moved: false, start: live};
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onLeverMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dy) < 6) return;
    d.moved = true;
    const base = d.start ? KNOB_ON : KNOB_OFF;
    setKnobTop(Math.max(KNOB_ON, Math.min(KNOB_OFF, base + dy)));
  }
  function onLeverUp() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) {
      throwLever(!live);
      return;
    }
    const want = (knobTop ?? KNOB_OFF) < (KNOB_ON + KNOB_OFF) / 2;
    setKnobTop(null);
    if (want !== live) throwLever(want);
  }

  /* ── 게이지 드래그 ── */
  const lastSeg = useRef(-1);
  function gaugeAt(clientX: number) {
    const el = gaugeRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const seg = Math.round(ratio * SEGMENTS);
    if (seg !== lastSeg.current) {
      lastSeg.current = seg;
      sfx.tick();
      buzz(4);
    }
    setByHand(ratio * max, max);
  }

  const onSeg = Math.round((Math.min(value, max) / max) * SEGMENTS);
  const goalSeg = Math.ceil((goal / max) * SEGMENTS);
  const goalPos = Math.min(100, (goal / max) * 100);

  return (
    <article
      className={`ab-circuit${live ? " is-live" : ""}${
        value >= goal ? " is-full" : ""
      }${flash || picked ? " is-flash" : ""}`}
      data-circuit={id}
      onPointerEnter={() => buildingIds && onHover?.(buildingIds)}
      onPointerLeave={() => onHover?.(null)}
      ref={cardRef}
    >
      <button
        aria-label={`${name} 회로 레버`}
        aria-pressed={live}
        className="ab-lever"
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            throwLever(!live);
          }
        }}
        onPointerCancel={() => {
          drag.current = null;
          setKnobTop(null);
        }}
        onPointerDown={onLeverDown}
        onPointerMove={onLeverMove}
        onPointerUp={onLeverUp}
        ref={leverRef}
        type="button"
      >
        <span className="ab-lever-slot" />
        <span
          className="ab-lever-knob"
          style={
            knobTop === null ? undefined : {top: knobTop, transition: "none"}
          }
        />
        <span className="ab-lever-lamp" />
      </button>

      <div className="min-w-0">
        <div className="ab-c-top">
          <span className="ab-c-name">{name}</span>
          {note ? <span className="ab-c-note">{note}</span> : null}
          <span className="ab-c-val">
            <b>{value}</b>분
          </span>
        </div>

        <div
          aria-label={`${name} 시간(분)`}
          aria-valuemax={max}
          aria-valuemin={0}
          aria-valuenow={value}
          className="ab-gauge"
          onKeyDown={e => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              setByHand(value + STEP);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              setByHand(value - STEP);
            }
          }}
          onPointerDown={e => {
            e.currentTarget.setPointerCapture(e.pointerId);
            lastSeg.current = -1;
            gaugeAt(e.clientX);
          }}
          onPointerMove={e => {
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              gaugeAt(e.clientX);
          }}
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
          <span className="ab-goal" style={{left: `${goalPos}%`}}>
            <span>목표 {goal}</span>
          </span>
        </div>

        <div className="ab-c-actions">
          {[-15, 15, 30].map(delta => (
            <button
              className="ab-chip-btn"
              key={delta}
              onClick={e => {
                sfx.tick();
                buzz(6);
                if (delta > 0) floatText(e.currentTarget, `+${delta}`);
                setByHand(value + delta);
              }}
              type="button"
            >
              {delta > 0 ? `+${delta}` : `−${-delta}`}
            </button>
          ))}
          {details ? (
            <button
              aria-expanded={open}
              className="ab-chip-btn is-more"
              onClick={() => {
                sfx.tick();
                setOpen(o => !o);
              }}
              type="button"
            >
              {open ? "접기 ▴" : "상세 ▾"}
            </button>
          ) : null}
        </div>

        {details && open ? <div className="ab-extra">{details}</div> : null}
      </div>
    </article>
  );
}
