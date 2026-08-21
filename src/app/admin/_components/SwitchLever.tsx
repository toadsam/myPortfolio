"use client";

/**
 * 차단기 레버 — 이 화면의 시그니처.
 *
 * ## 왜 이게 있나
 *
 * 관리자 화면의 논지는 "오늘 기록이 마을을 바꾼다"인데, 그 인과가 화면에 없었다.
 * 숫자를 넣고 저장한 **뒤에야** 텍스트로 결과를 알려줬을 뿐이다. 레버는 그 인과를
 * 한 번의 물리 동작으로 만든다 — 값이 들어가면 레버가 올라가고, 회로에 전기가
 * 흐르고, 오른쪽 지도의 건물에 불이 들어온다.
 *
 * ## 체크박스가 아니라 버튼인 이유
 *
 * 레버는 **값의 상태를 비추는 거울**이지 별도의 데이터가 아니다. 숫자를 지우면
 * 저절로 내려가고, 레버를 내리면 숫자가 0이 된다. 둘은 같은 하나의 값을 본다.
 * 체크박스로 만들면 "체크는 됐는데 값은 0" 같은 거짓 상태가 생긴다.
 *
 * `aria-pressed` 로 켜짐/꺼짐을 읽어 주고, 라벨은 항상 넘긴다 — 이 버튼은
 * 시각적으로만 의미가 있어서 이름을 안 주면 스크린 리더에서 정체불명이 된다.
 *
 * ## 불꽃은 조작한 순간에만 튄다
 *
 * 원안(목업)에는 600ms·1500ms 간격으로 상시 도는 인터벌이 있었다. 가만히 있어도
 * 매초 DOM 을 만들고 지우는데, 이건 **매일 여는 도구**다. 켜 두면 배터리만 먹는다.
 * 그래서 불꽃은 레버를 젖히는 그 순간에만 8개, 0.55초. 모션을 줄인 사용자에겐 없다.
 */

import {useCallback, useEffect, useRef} from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

export function SwitchLever({
  on,
  onToggle,
  label,
  disabled
}: {
  /** 회로에 전기가 흐르는가 — 값에서 파생된 상태지 별도 저장값이 아니다 */
  on: boolean;
  onToggle: (next: boolean) => void;
  /** 어떤 회로인지. 스크린 리더가 읽는 유일한 이름이다. */
  label: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);

  // 언마운트 뒤에 남은 타이머가 지워진 노드를 건드리지 않도록 정리한다
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(t => window.clearTimeout(t));
    };
  }, []);

  const burst = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCED).matches) return;
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement("span");
      spark.className = "sw-spark";
      // 위쪽 부채꼴로 튄다 — 아래로 흐르면 불꽃이 아니라 물처럼 보인다
      const angle = ((Math.random() * 150 - 75) * Math.PI) / 180;
      const dist = 26 + Math.random() * 34;
      spark.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
      spark.style.setProperty("--ty", `${Math.sin(angle) * dist - 14}px`);
      spark.style.animationDelay = `${Math.random() * 0.1}s`;
      el.appendChild(spark);
      const t = window.setTimeout(() => spark.remove(), 700);
      timers.current.push(t);
    }
  }, []);

  return (
    <button
      aria-label={label}
      aria-pressed={on}
      className="sw-lever"
      disabled={disabled}
      onClick={() => {
        burst();
        onToggle(!on);
      }}
      ref={ref}
      type="button"
    />
  );
}
