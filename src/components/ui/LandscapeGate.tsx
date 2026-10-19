"use client";

import {useState} from "react";

/**
 * 휴대폰 세로 화면 안내 — 마을은 가로로 본다.
 *
 * 걷기 모드(조이스틱 + 시점 드래그)는 세로 375px 폭에선 손가락 둘이 겹쳐서
 * 가로를 전제로 짰다. 브라우저가 가로를 강제로 잡아 주지는 않는다:
 * `screen.orientation.lock` 은 전체 화면 안에서만, 그것도 안드로이드 크롬에서만
 * 먹는다(iOS Safari 는 없음). 그래서 안내 문을 띄우고, 되는 기기에서는
 * 「전체 화면으로 열기」로 가로 고정까지 건다. 가로가 되면 저절로 사라진다.
 */
export function LandscapeGate() {
  const [busy, setBusy] = useState(false);
  const canLock =
    typeof document !== "undefined" &&
    !!document.documentElement.requestFullscreen &&
    typeof screen !== "undefined" &&
    !!screen.orientation &&
    "lock" in screen.orientation;

  async function openFullscreen() {
    setBusy(true);
    try {
      await document.documentElement.requestFullscreen();
      // 타입에는 lock 이 없는 브라우저도 있어서 느슨하게 부른다
      const o = screen.orientation as unknown as {
        lock?: (v: string) => Promise<void>;
      };
      await o.lock?.("landscape");
    } catch {
      // 못 잠그면 안내 문이 그대로 남아 사용자가 돌린다
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-label="가로 화면 안내"
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5 bg-[#050d1a]/96 px-8 text-center text-[#f3e6c8]"
    >
      <span
        aria-hidden
        className="text-5xl"
        style={{animation: "landscapeHint 1.6s ease-in-out infinite alternate"}}
      >
        📱
      </span>
      <p className="v-serif text-[20px] tracking-[0.06em]">
        휴대폰을 가로로 돌려 주세요
      </p>
      <p className="max-w-[300px] text-[13px] leading-6 text-[#a9bdd6]">
        마을은 가로 화면에서 캐릭터를 직접 움직이며 둘러봅니다. 왼쪽 스틱으로
        걷고, 오른쪽을 끌어 시점을 돌립니다.
      </p>
      {canLock ? (
        <button
          type="button"
          disabled={busy}
          onClick={openFullscreen}
          className="v-panel px-5 py-2.5 text-[13px] font-black text-[#ffd9ae] active:scale-95 disabled:opacity-50"
        >
          전체 화면으로 열기
        </button>
      ) : null}
      <style>{`@keyframes landscapeHint{from{transform:rotate(0)}to{transform:rotate(-90deg)}}`}</style>
    </div>
  );
}
