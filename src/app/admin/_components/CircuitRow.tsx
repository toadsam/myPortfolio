"use client";

/**
 * 회로 한 줄 — 배전반의 기본 단위.
 *
 * ```
 * [레버] 이름/설명            [ 큰 숫자 ] [━━━━━ 게이지 ━━━━━]
 *        (필요하면 아래로 부속 입력들)
 * ```
 *
 * ## 카드가 아니라 행인 이유
 *
 * 이전 디자인은 27개 패널이 전부 같은 크기의 둥근 카드로 세로로 쌓여 있었다.
 * 위계가 없으니 전부 똑같이 중요해 보였고, 훑을 수가 없었다. 행으로 세우면
 * 레버·이름·값·게이지가 **세로로 정렬**돼서 한눈에 비교된다 — 오늘 어디에
 * 시간을 썼는지가 표처럼 읽힌다.
 *
 * ## 숫자와 게이지를 둘 다 둔다
 *
 * 게이지는 감각적이지만 정확한 값을 넣기 어렵고, 숫자는 정확하지만 크기가 안
 * 보인다. 둘은 같은 값을 보므로 아무거나 써도 되고, 탭으로 넘어가며 숫자만
 * 때려 넣는 빠른 길이 항상 살아 있다.
 *
 * ## 지도와 양방향으로 연결된다
 *
 * `buildingId` 를 주면 이 행은 지도의 그 건물과 짝이 된다. 행에 마우스를 올리면
 * 지도의 건물이 밝아지고, 지도에서 건물을 누르면 이 행이 빛나며 포커스를 받는다.
 * "값을 넣으면 저 건물에 불이 켜진다"를 말이 아니라 손으로 확인시키는 부분이다.
 */

import {useCallback, useEffect, useId, useRef, useState} from "react";
import {SwitchLever} from "./SwitchLever";
import {scrambleOverlay} from "./useSwitchboardFx";

const REDUCED = "(prefers-reduced-motion: reduce)";

export interface CircuitRowHandle {
  focus: () => void;
}

export function CircuitRow({
  buildingIds,
  disabled,
  extras,
  live,
  max,
  name,
  note,
  onChange,
  onHover,
  onToggle,
  picked,
  registerFocus,
  step = 5,
  unit = "분",
  value
}: {
  /**
   * 지도에서 짝이 되는 건물들. 하나가 아니라 배열인 이유는 회로마다 켜는 건물
   * 수가 다르기 때문이다 — 프로젝트 회로는 자기 건물 하나지만, 공부 회로는
   * 기술 건물 다섯 채를 한꺼번에 밝힌다. 하나만 이어 두면 화면이 거짓말을 한다.
   */
  buildingIds?: string[];
  disabled?: boolean;
  /** 이 회로에 딸린 부속 입력(태그·선택 등). 두 번째 줄에 놓인다. */
  extras?: React.ReactNode;
  live: boolean;
  max: number;
  name: string;
  note?: string;
  onChange: (next: number) => void;
  onHover?: (buildingIds: string[] | null) => void;
  /** 레버. 안 주면 값에서 파생된 기본 동작(마지막 값 복원 / 0) 을 쓴다. */
  onToggle?: (next: boolean) => void;
  picked?: boolean;
  /** 지도에서 이 행을 부를 수 있게 포커스 함수를 등록한다 */
  registerFocus?: (buildingIds: string[], focus: () => void) => void;
  step?: number;
  unit?: string;
  value: number;
}) {
  const inputId = useId();
  const rowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const memory = useRef(0);
  const [typing, setTyping] = useState(false);
  const typingTimer = useRef(0);

  const ratio = max > 0 ? Math.max(0, Math.min(value / max, 1)) : 0;

  // 지도가 이 행을 부를 수 있도록 포커스 함수를 올려 준다
  useEffect(() => {
    if (!buildingIds?.length || !registerFocus) return;
    registerFocus(buildingIds, () => {
      rowRef.current?.scrollIntoView({
        behavior: window.matchMedia(REDUCED).matches ? "auto" : "smooth",
        block: "center"
      });
      inputRef.current?.focus();
    });
  }, [buildingIds, registerFocus]);

  useEffect(() => () => window.clearTimeout(typingTimer.current), []);

  function flashTyping() {
    setTyping(true);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setTyping(false), 260);
  }

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || disabled) return;
      const rect = el.getBoundingClientRect();
      const raw = ((clientX - rect.left) / rect.width) * max;
      // step 단위로 떨어뜨린다 — 1분 단위로 끌면 손이 떨려서 값이 안 잡힌다
      onChange(Math.max(0, Math.min(Math.round(raw / step) * step, max)));
    },
    [disabled, max, onChange, step]
  );

  function toggle(next: boolean) {
    if (onToggle) {
      onToggle(next);
      return;
    }
    if (next) {
      onChange(memory.current || Math.min(30, max));
    } else {
      if (value > 0) memory.current = value;
      onChange(0);
    }
  }

  return (
    <div
      className={`sw-row${live ? " is-live" : ""}${picked ? " is-picked" : ""}`}
      onPointerEnter={() => buildingIds?.length && onHover?.(buildingIds)}
      onPointerLeave={() => buildingIds?.length && onHover?.(null)}
      ref={rowRef}
    >
      <SwitchLever
        disabled={disabled}
        label={`${name} 회로`}
        on={live}
        onToggle={toggle}
      />

      <div className="min-w-0">
        <label className="sw-row-name" htmlFor={inputId}>
          {name}
        </label>
        {note ? <p className="sw-row-note">{note}</p> : null}
      </div>

      <div className="sw-readout-slot flex items-baseline">
        <input
          className={`sw-readout${typing ? " is-typing" : ""}`}
          disabled={disabled}
          id={inputId}
          inputMode="numeric"
          onChange={event => {
            flashTyping();
            onChange(Math.max(0, Number(event.target.value) || 0));
          }}
          onFocus={event => scrambleOverlay(event.currentTarget)}
          ref={inputRef}
          type="number"
          value={value}
        />
        <span className="sw-unit">{unit}</span>
      </div>

      <div className="sw-gauge-wrap">
        <div
          aria-disabled={disabled}
          aria-label={`${name} 끌어서 조절`}
          aria-valuemax={max}
          aria-valuemin={0}
          aria-valuenow={value}
          aria-valuetext={`${value}${unit}`}
          className="sw-gauge"
          onKeyDown={event => {
            if (disabled) return;
            const jump = event.shiftKey ? step * 6 : step * 2;
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              onChange(Math.min(value + jump, max));
            } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              event.preventDefault();
              onChange(Math.max(value - jump, 0));
            } else if (event.key === "Home") {
              event.preventDefault();
              onChange(0);
            } else if (event.key === "End") {
              event.preventDefault();
              onChange(max);
            }
          }}
          onPointerDown={event => {
            if (disabled) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setFromClientX(event.clientX);
          }}
          onPointerMove={event => {
            if (event.buttons === 0) return;
            setFromClientX(event.clientX);
          }}
          ref={trackRef}
          role="slider"
          style={{"--r": `${ratio * 100}%`} as React.CSSProperties}
          tabIndex={disabled ? -1 : 0}
        >
          {/* 꺼진 칸들. 0일 때 이게 보이니까 "빈 막대"가 아니라 "다 꺼진 계기"로
              읽힌다 — 앞선 디자인이 고장 난 것처럼 보였던 이유가 이거였다. */}
          <span aria-hidden="true" className="sw-gauge-cells" />
          {/* 켜진 칸들. 같은 격자를 clip 으로 잘라 쓴다. 너비로 자르면 칸 경계가
              값에 따라 어긋나 마지막 칸이 반쪽으로 남는다. */}
          <span aria-hidden="true" className="sw-gauge-lit" />
          {/* 지침 — 끌 수 있다는 신호이자 지금 값의 정확한 위치 */}
          <span aria-hidden="true" className="sw-gauge-needle" />
        </div>
        <div aria-hidden="true" className="sw-gauge-scale">
          <span>0</span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      </div>

      {extras ? <div className="sw-row-extra">{extras}</div> : null}
    </div>
  );
}
