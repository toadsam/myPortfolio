"use client";

/**
 * 맨 아래 송전 버튼 하나.
 *
 * ## 한 번 누르면 보낸다 (2026-11-15)
 *
 * 예전에는 0.9초 꾹 눌러야 송전됐다. 저장이 하루 기록 전체를 덮어쓰는 동작이라
 * 스크롤하다 엄지가 스치는 것을 막으려던 장치였다. 매일 쓰기에는 그 0.9초가 더
 * 불편하다는 본인 의견으로 한 번 누르기로 바꿨고, 실수는 **되돌리기**가 받는다.
 * 보낸 직후 이 버튼 위에 「되돌리기」가 뜨고, 누르면 보내기 전 기록으로 한 번 더
 * 저장한다(같은 저장 API 를 쓴다. 서버는 바뀌지 않았다).
 *
 * 되돌리기는 **그날 기록이 이미 있었을 때만** 나온다. 그날 첫 송전을 되돌리려면 기록을
 * 지워야 하는데 지우는 API 가 없고, 빈 값으로 덮어쓰면 "기록한 날"로 남아 연속 기록이
 * 틀어진다. 그래서 첫 송전에는 되돌리기를 보여 주지 않는다.
 */

import {useState} from "react";
import {buzz, sfx} from "../_lib/sfx";

export function SendDock({
  canSend,
  sending,
  pending,
  undoLabel,
  onSend,
  onUndo
}: {
  canSend: boolean;
  sending: boolean;
  /** 송전 대기 kWh — 0 이어도 바뀐 내용이 있으면 보낼 수 있다 */
  pending: number;
  /** 방금 보낸 것을 되돌릴 수 있으면 그 안내 문구, 아니면 null */
  undoLabel: string | null;
  onSend: () => void;
  onUndo: () => void;
}) {
  const [hint, setHint] = useState<string | null>(null);

  function say(text: string) {
    setHint(text);
    window.setTimeout(() => setHint(null), 1800);
  }

  function press() {
    if (sending) return;
    if (!canSend) {
      say("켜진 회로가 없어요");
      sfx.tick(0.1);
      return;
    }
    sfx.charge(1);
    buzz(12);
    onSend();
  }

  const label = sending
    ? "보내는 중…"
    : hint ??
      (canSend
        ? pending > 0
          ? `마을에 보내기 +${pending}kWh`
          : "바뀐 내용 보내기"
        : "보낼 것이 없어요");

  return (
    <div className="ab-dock">
      <div className="ab-dock-in">
        {undoLabel && !sending ? (
          <div className="ab-undo" role="status">
            <span>{undoLabel}</span>
            <button
              onClick={() => {
                sfx.tick(0.2);
                onUndo();
              }}
              type="button"
            >
              되돌리기
            </button>
          </div>
        ) : null}
        <button
          aria-label="송전: 오늘 기록 저장"
          className={`ab-send${canSend && !sending ? " is-ready" : ""}${
            sending ? " is-sending" : ""
          }`}
          onClick={press}
          type="button"
        >
          <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
          </svg>
          <span className="ab-send-label">{label}</span>
        </button>
      </div>
    </div>
  );
}
