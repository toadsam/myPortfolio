"use client";

import {useCallback, useRef, useState} from "react";
import {ApiError, loginAdmin} from "@/lib/liveApi";
import {VaultDials} from "./VaultDials";
import {burstFrom} from "../_lib/fx";

/**
 * 금고 문 — 배전반에 들어가는 유일한 입구.
 *
 * ## 다이얼은 손맛이고, 자물쇠는 서버다
 *
 * 목업의 다이얼 잠금은 정답 배열과 힌트가 화면에 박혀 있었다. 그러면 자물쇠가
 * 아니라 자물쇠 그림이다. 여기서는 다이얼이 만든 네 자리를 그대로 서버로 보내고
 * (`loginAdmin`), 맞고 틀리고는 서버가 판단한다 — **연출은 전부 가져오고 정답만
 * 서버에 남긴다.**
 *
 * 열리면 불꽃이 사방으로 튀고 문이 밝아지며 사라진다. 틀리면 문이 흔들리고
 * 다이얼이 0으로 되돌아간다. 성공과 실패가 눈으로 구분돼야 한다.
 */
export function AdminGate({onUnlocked}: {onUnlocked: () => void}) {
  const [code, setCode] = useState("0000");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);
  const [pulled, setPulled] = useState(false);
  const [opened, setOpened] = useState(false);
  const doorRef = useRef<HTMLDivElement>(null);

  const submit = useCallback(
    async (attempt: string) => {
      if (busy) return;
      setBusy(true);
      setPulled(true);
      setError("");
      try {
        await loginAdmin(attempt);
        burstFrom(doorRef.current, 34);
        setOpened(true);
        window.setTimeout(onUnlocked, 900);
      } catch (err) {
        /* 실패를 뭉뚱그리면 안 된다.
         *
         * 예전에는 어떤 실패든 "비밀번호가 틀렸다"고 말했다. 그래서 서명키가
         * 기본값이라 서버가 500 을 던지던 동안, 화면은 계속 비밀번호를 탓했다.
         * 맞는 번호를 넣는 사람은 영원히 못 들어가고 이유도 모른다.
         * 401(정말 틀림)과 나머지(서버 문제)를 갈라서 말한다. */
        const status = err instanceof ApiError ? err.status : 0;
        if (status === 401) {
          setError("맞지 않습니다. 다이얼이 처음으로 돌아갔어요.");
        } else if (status === 500) {
          setError(
            "서버가 로그인을 거부했습니다. backend/.env 의 ADMIN_SECRET 을 확인하세요."
          );
        } else {
          setError(
            status
              ? `서버 오류(${status}) — 백엔드 상태를 확인하세요.`
              : "백엔드에 닿지 못했습니다. 서버가 켜져 있는지 확인하세요."
          );
        }
        setShake(n => n + 1);
        setBusy(false);
        setPulled(false);
      }
    },
    [busy, onUnlocked]
  );

  return (
    <main className="admin-switchboard sw-vault text-[#e8edf2]">
      <div aria-hidden="true" className="sw-vault-gears">
        <svg viewBox="0 0 400 400">
          <g className="sw-gear-outer">
            <circle
              cx="200"
              cy="200"
              fill="none"
              r="186"
              stroke="#242c36"
              strokeWidth="2"
            />
            <circle
              cx="200"
              cy="200"
              fill="none"
              r="164"
              stroke="#242c36"
              strokeDasharray="14 10"
              strokeWidth="8"
            />
          </g>
          <g className="sw-gear-inner">
            <circle
              cx="200"
              cy="200"
              fill="none"
              r="118"
              stroke="#232b34"
              strokeDasharray="6 14"
              strokeWidth="10"
            />
            <circle
              cx="200"
              cy="200"
              fill="none"
              r="92"
              stroke="#2b3440"
              strokeWidth="1"
            />
          </g>
        </svg>
      </div>

      <div
        className={`sw-door${error ? " is-wrong" : ""}${
          opened ? " is-open" : ""
        }`}
        ref={doorRef}
      >
        <div className="sw-plate">
          <p className="sw-plate-kicker">Village Control Board</p>
          <h1 className="mt-2 text-2xl font-black">배전반 잠김</h1>
          <p className="mt-2 text-xs leading-6 text-[#8b94a0]">
            마을의 등을 켜는 판입니다. 다이얼 네 자리를 맞춰 주세요.
          </p>
        </div>

        <div className="mt-7 flex items-center justify-center gap-6">
          <VaultDials
            busy={busy}
            onChange={setCode}
            onSubmit={() => submit(code)}
            shake={shake}
          />
          {/* 다이얼을 맞췄으면 손잡이를 당긴다. 한 칸 돌릴 때마다 시도하면
              값도 엉키고 서버에 로그인 요청이 쏟아진다. */}
          <button
            aria-label="회로 열기"
            className={`sw-door-lever${busy ? "" : " is-armed"}${
              pulled ? " is-pulled" : ""
            }`}
            disabled={busy}
            onClick={() => submit(code)}
            type="button"
          />
        </div>

        <p
          aria-live="polite"
          className="mt-5 min-h-[18px] text-center text-xs font-bold text-[#c2492e]"
        >
          {error}
        </p>

        <p className="mt-1 text-center font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#5b646e]">
          {busy
            ? "회로 확인 중…"
            : "다이얼을 돌리거나 번호를 치고, 레버를 당기세요 · Enter"}
        </p>

        <a
          className="mt-6 block text-center font-mono text-xs text-[#6b7580] transition hover:text-[#ff9d38]"
          href="/"
        >
          ← 마을로 돌아가기
        </a>
      </div>
    </main>
  );
}
