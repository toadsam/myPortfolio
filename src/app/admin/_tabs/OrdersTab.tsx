"use client";

/**
 * 작업 지시서 탭 — 그날의 계획.
 *
 * 지시서마다 **회로와 분량**을 건다. 끝내고 오른쪽으로 밀면(또는 퓨즈를 누르면) 그
 * 분량이 그 회로로 흘러가 배전반 게이지가 찬다. 계획을 지운 만큼 오늘 기록이
 * 저절로 채워지는 것 — 같은 일을 두 번 적지 않게 하는 게 이 탭의 존재 이유다.
 *
 * 밀기는 손맛이고, 같은 일을 하는 버튼이 항상 있다(퓨즈 = 완료, 카드를 누르면 펼쳐지는
 * 내일로·삭제). 스와이프만 있으면 키보드와 스크린 리더로는 아무것도 못 한다.
 */

import {useRef, useState} from "react";
import {projects} from "@/data/projects";
import type {PlanItem} from "@/types/live";
import {sparksAt} from "../_lib/fx";
import {buzz, sfx} from "../_lib/sfx";
import type {PlanItemsApi} from "../_lib/usePlanItems";

const CIRCUITS: [value: string, label: string][] = [
  ["none", "회로 없음"],
  ["workout", "운동"],
  ["study", "공부"],
  ["coding", "코딩"],
  ...projects.map(p => [`project:${p.id}`, p.title] as [string, string])
];
const MINUTES = [15, 30, 45, 60, 90, 120];
const SWIPE = 90;

export function circuitLabel(circuit: string): string {
  return CIRCUITS.find(([v]) => v === circuit)?.[1] ?? circuit;
}

function circuitTone(circuit: string): string {
  if (circuit.startsWith("project:")) return "is-project";
  return `is-${circuit}`;
}

function fmt(m: number): string {
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  return `${h}시간${m % 60 ? ` ${m % 60}분` : ""}`;
}

export function OrdersTab({
  plan,
  isToday,
  onCompleted
}: {
  plan: PlanItemsApi;
  isToday: boolean;
  /** 완료 상태가 바뀌어 회로에 분량이 들고 났다 (delta: +분 / −분) */
  onCompleted: (item: PlanItem, delta: number) => void;
}) {
  const [title, setTitle] = useState("");
  const [circuit, setCircuit] = useState("study");
  const [minutes, setMinutes] = useState(30);
  const [due, setDue] = useState("");
  const [empty, setEmpty] = useState(false);

  const done = plan.items.filter(i => i.done).length;
  const total = plan.items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const sorted = [...plan.items].sort(
    (a, b) => Number(a.done) - Number(b.done)
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = title.trim();
    if (!text) {
      setEmpty(true);
      return;
    }
    const made = await plan.create({
      title: text,
      circuit,
      minutes: circuit === "none" ? 0 : minutes,
      due_label: due.trim() || null
    });
    if (made) {
      setTitle("");
      setDue("");
      sfx.fuse();
      buzz(10);
    }
  }

  async function complete(item: PlanItem, el: HTMLElement | null) {
    if (!item.done) {
      sfx.fuse();
      buzz([10, 30, 10]);
      sparksAt(el?.querySelector(".ab-fuse") ?? null, 14, "#7bd88f");
    } else sfx.tick();
    const saved = await plan.toggle(item);
    if (!saved) return;
    if (saved.circuit !== "none" && saved.minutes > 0)
      onCompleted(saved, saved.done ? saved.minutes : -saved.minutes);
    else if (saved.done) onCompleted(saved, 0);
    if (saved.done && plan.items.every(i => i.id === saved.id || i.done))
      window.setTimeout(() => sfx.chime(), 300);
  }

  return (
    <section className="ab-tab ab-narrow">
      <div className="ab-card">
        <div className="ab-sec-h">
          <h2>{isToday ? "오늘의 작업 지시서" : "그날의 작업 지시서"}</h2>
          <small>
            {done}/{total} 완료
          </small>
        </div>
        <div className="ab-quest">
          <span className="ab-lv-badge is-ok">퀘스트</span>
          <div className="ab-xp-bar">
            <i className="ab-xp-fill is-ok" style={{width: `${pct}%`}} />
          </div>
          <span className="ab-mono-sm">{pct}%</span>
        </div>
        <p className="ab-hint ab-left">
          끝낸 지시서는 오른쪽으로 밀거나 퓨즈를 누르세요. 걸어 둔 분량이 그
          회로로 흘러갑니다. 왼쪽으로 밀면 내일로 넘어갑니다.
        </p>
      </div>

      <form
        autoComplete="off"
        className="ab-card ab-order-add"
        onSubmit={submit}
      >
        <div className="ab-row">
          <input
            aria-label="새 지시서"
            id="plan-title"
            onChange={e => {
              setTitle(e.target.value);
              setEmpty(false);
            }}
            placeholder="새 지시서: 프로그래머스 두 문제"
            value={title}
          />
          <button className="ab-go-btn" type="submit">
            발행
          </button>
        </div>
        {empty ? (
          <span className="ab-err">지시서 내용을 먼저 적어 주세요.</span>
        ) : null}
        <div className="ab-sel-row" role="group" aria-label="회로">
          {CIRCUITS.map(([value, label]) => (
            <button
              aria-pressed={circuit === value}
              className="ab-tag"
              key={value}
              onClick={() => {
                sfx.tick();
                setCircuit(value);
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        {circuit !== "none" ? (
          <div className="ab-sel-row" role="group" aria-label="걸어 둘 분량">
            {MINUTES.map(m => (
              <button
                aria-pressed={minutes === m}
                className="ab-chip-btn"
                key={m}
                onClick={() => {
                  sfx.tick();
                  setMinutes(m);
                }}
                type="button"
              >
                {fmt(m)}
              </button>
            ))}
          </div>
        ) : null}
        <input
          aria-label="마감 꼬리표 (선택)"
          className="ab-due-in"
          id="plan-due"
          onChange={e => setDue(e.target.value)}
          placeholder="마감 꼬리표 (선택): 내일 마감"
          value={due}
        />
      </form>

      {plan.error ? <p className="ab-err ab-card">{plan.error}</p> : null}

      <div className="ab-orders">
        {sorted.length ? (
          sorted.map(item => (
            <OrderCard
              item={item}
              key={item.id}
              onComplete={el => void complete(item, el)}
              onDefer={() => {
                sfx.tick();
                void plan.defer(item);
              }}
              onRemove={() => {
                sfx.tick();
                void plan.remove(item);
              }}
            />
          ))
        ) : plan.loaded ? (
          <p className="ab-hint">
            이 날 지시서가 없어요. 위에서 발행해 보세요.
          </p>
        ) : null}
      </div>

      <div className="ab-sec-h ab-sec-gap">
        <h2 className="is-sub">내일로 넘긴 것</h2>
        <small>{plan.later.length}</small>
      </div>
      <div className="ab-orders">
        {plan.later.length ? (
          plan.later.map(item => (
            <OrderCard
              isLater
              item={item}
              key={item.id}
              onComplete={() => {
                sfx.tick();
                void plan.restore(item);
              }}
              onRemove={() => {
                sfx.tick();
                void plan.remove(item);
              }}
            />
          ))
        ) : (
          <p className="ab-hint">넘긴 지시서가 없어요.</p>
        )}
      </div>
    </section>
  );
}

function OrderCard({
  item,
  isLater,
  onComplete,
  onDefer,
  onRemove
}: {
  item: PlanItem;
  isLater?: boolean;
  /** 오늘 목록: 완료 토글 · 내일 목록: 오늘로 되돌리기 */
  onComplete: (el: HTMLElement | null) => void;
  onDefer?: () => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    lock: boolean | null;
    buzzed: boolean;
  } | null>(null);
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);
  const moved = useRef(false);

  function end() {
    const d = drag.current;
    drag.current = null;
    if (!d?.lock) {
      setDx(0);
      return;
    }
    const final = dx;
    setDx(0);
    if (final > SWIPE) onComplete(ref.current);
    else if (final < -SWIPE && onDefer && !item.done) onDefer();
    window.setTimeout(() => (moved.current = false), 0);
  }

  return (
    <div className="ab-order-wrap">
      <div className="ab-order-under" aria-hidden="true">
        <span className="is-l">
          {isLater ? "오늘로 ▶" : item.done ? "되돌리기 ▶" : "완료 ▶"}
        </span>
        {onDefer && !item.done ? <span className="is-r">◀ 내일로</span> : null}
      </div>
      <div
        className={`ab-order${item.done ? " is-done" : ""}${
          drag.current?.lock ? " is-dragging" : ""
        }`}
        onPointerCancel={end}
        onPointerDown={e => {
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            lock: null,
            buzzed: false
          };
          moved.current = false;
        }}
        onPointerMove={e => {
          const d = drag.current;
          if (!d) return;
          const mx = e.clientX - d.x;
          const my = e.clientY - d.y;
          if (d.lock === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) {
            d.lock = Math.abs(mx) > Math.abs(my);
            if (d.lock) e.currentTarget.setPointerCapture(e.pointerId);
          }
          if (!d.lock) return;
          moved.current = true;
          setDx(mx);
          if (Math.abs(mx) > SWIPE && !d.buzzed) {
            d.buzzed = true;
            buzz(12);
            sfx.tick();
          }
        }}
        onPointerUp={end}
        ref={ref}
        style={
          dx
            ? {
                transform: `translateX(${dx}px) rotate(${dx / 40}deg)`,
                transition: "none"
              }
            : undefined
        }
      >
        <button
          aria-label={
            isLater
              ? `${item.title} 오늘로 가져오기`
              : `${item.title} ${item.done ? "완료 취소" : "완료"}`
          }
          className="ab-fuse"
          onClick={() => !moved.current && onComplete(ref.current)}
          type="button"
        />
        <button
          aria-expanded={open}
          className="ab-order-body"
          onClick={() => !moved.current && setOpen(o => !o)}
          type="button"
        >
          <span className="ab-o-title">{item.title}</span>
          <span className="ab-o-meta">
            <span className={`ab-pill ${circuitTone(item.circuit)}`}>
              {item.circuit === "none"
                ? "회로 없음"
                : `${circuitLabel(item.circuit)} 회로`}
            </span>
            {item.due_label ? (
              <span className="ab-pill is-due">{item.due_label}</span>
            ) : null}
          </span>
        </button>
        <span className="ab-o-min">
          {item.minutes ? fmt(item.minutes) : "—"}
          <small>걸어 둔 분량</small>
        </span>
        <span className="ab-stamp" aria-hidden="true">
          완료
        </span>
      </div>
      {open ? (
        <div className="ab-order-actions">
          {onDefer && !item.done ? (
            <button className="ab-chip-btn" onClick={onDefer} type="button">
              내일로 넘기기
            </button>
          ) : null}
          <button
            className="ab-chip-btn is-danger"
            onClick={onRemove}
            type="button"
          >
            지우기
          </button>
        </div>
      ) : null}
    </div>
  );
}
