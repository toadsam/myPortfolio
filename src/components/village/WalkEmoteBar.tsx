"use client";

import {memo, useSyncExternalStore} from "react";
import {
  emoteHotkey,
  PLAYER_EMOTES,
  type PlayerEmote
} from "@/data/playerEmotes";
import {
  getPlayerEmote,
  subscribePlayerEmote,
  togglePlayerEmote
} from "@/lib/playerEmote";

/**
 * 걷기 모드 동작 버튼.
 *
 * 스위치다 — 한 번 누르면 그 동작이 계속 돌고, 같은 걸 다시 누르거나 한 발이라도
 * 움직이면 꺼진다. 그래서 **불이 저절로 꺼지는 경우가 있고**, 그걸 알려면 DOM 이
 * 캔버스 쪽 상태를 구독해야 한다(playerEmote 모듈이 전역인 이유).
 *
 * 자기 상태를 자기가 들고 있는 별도 컴포넌트인 이유: 이걸 VillageScene 의 state
 * 로 두면 버튼 한 번에 건물 28채 + 주민 전원의 JSX 가 다시 만들어진다.
 */
function WalkEmoteBarImpl() {
  const active = useSyncExternalStore(
    subscribePlayerEmote,
    getPlayerEmote,
    // 서버에서는 아무 동작도 안 하고 있다
    () => null
  );

  return (
    <div className="pointer-events-auto absolute bottom-[5.25rem] left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border border-[#7a5a38]/55 bg-[#0b1626]/85 px-2.5 py-2 backdrop-blur-md md:bottom-[5.75rem]">
      {PLAYER_EMOTES.map((e: PlayerEmote, i) => {
        const on = active === e.id;
        return (
          <button
            key={e.id}
            type="button"
            title={`${e.label} (${i + 1})`}
            aria-label={e.label}
            aria-pressed={on}
            onClick={() => togglePlayerEmote(e.id)}
            className={
              on
                ? "relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2c078] bg-[#e2c078]/18 text-base shadow-inner transition active:scale-90"
                : "relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#7a5a38]/55 bg-[#13223a]/80 text-base transition hover:border-[#e2c078]/80 hover:bg-[#e2c078]/10 active:scale-90"
            }
          >
            <span aria-hidden>{e.icon}</span>
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 rounded bg-[#0b1626] px-1 font-mono text-[9px] font-black leading-tight text-[#e2c078]/75"
            >
              {emoteHotkey(i).replace("Digit", "")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export const WalkEmoteBar = memo(WalkEmoteBarImpl);
