"use client";

/**
 * 더보기 시트 — 매일 안 쓰는 것들을 한 장에.
 * 기록실·서랍장은 전체 화면으로 열리고(← 로 돌아옴), 나머지는 한 번 누르면 끝나는 동작이다.
 */

import {useEffect} from "react";
import {sfx} from "../_lib/sfx";

export type MoreAction =
  | "log"
  | "drawer"
  | "github"
  | "yesterday"
  | "village"
  | "lock";

export function MoreSheet({
  open,
  busy,
  commissionWaiting,
  onPick,
  onClose
}: {
  open: boolean;
  busy: boolean;
  commissionWaiting: number;
  onPick: (action: MoreAction) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pick = (a: MoreAction) => {
    sfx.tick(0.3);
    onClose();
    onPick(a);
  };

  return (
    <div
      aria-label="더보기"
      aria-modal="true"
      className="ab-sheet"
      onClick={onClose}
      role="dialog"
    >
      <div className="ab-sheet-in" onClick={e => e.stopPropagation()}>
        <button onClick={() => pick("log")} type="button">
          기록실 <small>연속 기록 · 달력 · 마을 전력</small>
        </button>
        <button onClick={() => pick("drawer")} type="button">
          서랍장{" "}
          <small>
            의뢰 접수함
            {commissionWaiting ? ` (${commissionWaiting}건 대기)` : ""} ·
            코딩테스트 · CS 노트 · NPC 사회
          </small>
        </button>
        <button disabled={busy} onClick={() => pick("github")} type="button">
          GitHub 커밋 동기화
        </button>
        <button onClick={() => pick("yesterday")} type="button">
          어제 기록 복사
        </button>
        <button onClick={() => pick("village")} type="button">
          마을 보기
        </button>
        <button onClick={() => pick("lock")} type="button">
          배전반 잠그기
        </button>
        <button className="is-quiet" onClick={onClose} type="button">
          닫기
        </button>
      </div>
    </div>
  );
}
