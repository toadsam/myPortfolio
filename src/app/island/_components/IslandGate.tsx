"use client";

/**
 * 섬 입구 — 로그인, 그리고 "서버가 아예 잠긴" 상태.
 *
 * 상태를 둘로 나눠 보여주는 게 핵심이다:
 *   - **401**: 비밀번호를 넣으면 들어갈 수 있다 (평범한 로그인)
 *   - **403**: `ADMIN_PASSWORD` 가 안 잡혀서 백엔드가 섬을 통째로 닫았다.
 *              여기서 비밀번호 칸을 보여주면 아무리 쳐도 안 열려서 사람을 헤매게 한다.
 *              그래서 이 경우엔 입력칸을 숨기고 **무엇을 고쳐야 하는지**를 적는다.
 */

import {useState} from "react";
import {loginAdmin} from "@/lib/liveApi";

export function IslandGate({
  locked,
  onEntered
}: {
  /** true = 서버가 섬을 닫아 둔 상태(403). 비밀번호로 풀 수 없다. */
  locked: boolean;
  onEntered: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loginAdmin(password);
      onEntered();
    } catch {
      setError("비밀번호가 올바르지 않아요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-5">
      <div className="v-panel w-full max-w-sm p-6">
        <h1 className="v-panel-title text-xl">갓생 섬</h1>

        {locked ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--v-moon))]">
              서버가 섬을 닫아 뒀어요. 여기는 기록이 전부 개인 정보라,
              비밀번호가 설정돼 있지 않으면 아예 열지 않습니다.
            </p>
            <div className="mt-4 rounded-lg border border-[rgb(var(--v-wood)/0.55)] bg-black/25 p-3">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[rgb(var(--v-gold))]">
                고치는 법
              </p>
              <p className="mt-1.5 text-xs text-[rgb(var(--v-moon))]">
                <code className="text-[rgb(var(--v-paper))]">backend/.env</code>{" "}
                에 아래 두 줄을 넣고 서버를 다시 켜세요.
              </p>
              <pre className="mt-2 overflow-x-auto rounded bg-black/40 p-2 text-[11px] leading-relaxed text-[rgb(var(--v-paper))]">
                {`ADMIN_PASSWORD=원하는_비밀번호\nADMIN_SECRET=아무_긴_임의_문자열`}
              </pre>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--v-moon))]">
              여기는 나만 들어오는 곳이에요.
            </p>
            <input
              autoComplete="current-password"
              autoFocus
              className="mt-4 w-full rounded-lg border border-[rgb(var(--v-wood)/0.55)] bg-black/30 px-3 py-3 text-base text-[rgb(var(--v-paper))] outline-none focus:border-[rgb(var(--v-gold)/0.7)]"
              onChange={event => setPassword(event.target.value)}
              placeholder="비밀번호"
              type="password"
              value={password}
            />
            {error ? (
              <p className="mt-2 text-xs text-[#e08a6a]">{error}</p>
            ) : null}
            <button
              className="mt-4 w-full rounded-lg bg-[rgb(var(--v-lantern)/0.9)] py-3 text-base font-bold text-[#20140a] disabled:opacity-50"
              disabled={busy || !password}
              type="submit"
            >
              {busy ? "들어가는 중…" : "섬에 들어가기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
