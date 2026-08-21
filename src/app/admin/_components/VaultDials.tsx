"use client";

/**
 * 금고 다이얼 — 네 자리를 돌려 맞추면 배전반이 열린다.
 *
 * ## 정답은 여기 없다
 *
 * 목업에는 정답 배열(`targetCombo`)과 힌트가 화면에 박혀 있었다. 그러면 자물쇠가
 * 아니라 자물쇠 그림이다. 여기서는 **다이얼이 만든 네 자리를 서버로 보내고**
 * (`loginAdmin`), 맞고 틀리고는 서버가 판단한다. 손맛은 그대로, 정답만 서버에.
 *
 * ## 다이얼이 유일한 입력이면 안 된다
 *
 * 클릭으로만 돌아가는 자물쇠는 키보드 사용자에게 벽이다. 그래서 각 다이얼은
 * 버튼이고, 포커스한 채로:
 *
 * - 숫자키(0~9)를 누르면 그 값이 바로 들어가고 다음 칸으로 넘어간다
 * - ↑/↓ 로 값을 올리고 내린다
 * - ←/→ 로 칸을 옮긴다
 * - Backspace 로 앞 칸으로
 *
 * ## 돌리는 것과 여는 것은 다른 동작이다
 *
 * 처음엔 네 자리가 차면 바로 시도하게 만들었는데, 클릭으로 돌릴 때는 "다 돌렸다"를
 * 알 방법이 없어서 **한 칸 돌릴 때마다 로그인을 시도**해 버렸다. 값도 엉키고
 * 서버에는 시도가 쏟아진다. 실물 금고가 그렇듯 **다이얼을 맞춘 뒤 손잡이를 당겨야**
 * 열린다 — 여기서는 바깥의 차단기 레버(또는 Enter)가 그 손잡이다.
 */

import {useCallback, useEffect, useRef, useState} from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const SIZE = 4;

export function VaultDials({
  busy,
  onChange,
  onSubmit,
  shake
}: {
  busy: boolean;
  /** 다이얼이 만든 네 자리. 바뀔 때마다 알려 준다. */
  onChange: (code: string) => void;
  /** Enter 로 바로 열려는 경우. 검증은 바깥(서버)이 한다. */
  onSubmit: () => void;
  /** 틀렸을 때 바깥에서 올려 주는 신호. 값이 바뀔 때마다 다이얼이 흔들린다. */
  shake: number;
}) {
  const [digits, setDigits] = useState<number[]>(Array(SIZE).fill(0));
  const [spinning, setSpinning] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const spinTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(spinTimer.current), []);

  // 틀리면 0으로 되돌린다 — 실물 금고도 틀리면 처음부터 다시 돌린다
  useEffect(() => {
    if (!shake) return;
    setDigits(Array(SIZE).fill(0));
    onChange("0000");
    refs.current[0]?.focus();
  }, [shake, onChange]);

  const commit = useCallback(
    (next: number[]) => {
      setDigits(next);
      onChange(next.join(""));
    },
    [onChange]
  );

  function setDigit(index: number, value: number, advance: boolean) {
    if (busy) return;
    setSpinning(index);
    window.clearTimeout(spinTimer.current);
    spinTimer.current = window.setTimeout(() => setSpinning(null), 260);

    const next = [...digits];
    next[index] = ((value % 10) + 10) % 10;
    commit(next);
    if (advance && index < SIZE - 1) refs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, event: React.KeyboardEvent) {
    if (busy) return;
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
      return;
    }
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      setDigit(index, Number(event.key), true);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setDigit(index, digits[index] + 1, false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setDigit(index, digits[index] - 1, false);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      refs.current[Math.min(index + 1, SIZE - 1)]?.focus();
    } else if (event.key === "ArrowLeft" || event.key === "Backspace") {
      event.preventDefault();
      refs.current[Math.max(index - 1, 0)]?.focus();
    }
  }

  const still =
    typeof window !== "undefined" && window.matchMedia(REDUCED).matches;

  return (
    <div className="sw-dials" role="group" aria-label="금고 다이얼 네 자리">
      {digits.map((digit, index) => (
        <button
          aria-label={`${index + 1}번째 다이얼, 현재 ${digit}`}
          className={`sw-dial${
            spinning === index && !still ? " is-spinning" : ""
          }`}
          disabled={busy}
          key={index}
          onClick={() => setDigit(index, digit + 1, false)}
          onKeyDown={event => onKeyDown(index, event)}
          ref={el => {
            refs.current[index] = el;
          }}
          type="button"
        >
          <span className="sw-dial-face">{digit}</span>
          <span aria-hidden="true" className="sw-dial-notch" />
        </button>
      ))}
    </div>
  );
}
