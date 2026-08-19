"use client";

/**
 * 코치 — 들어오면 한마디, 물으면 대답.
 *
 * ## 화면에서 차지하는 자리를 일부러 작게 뒀다
 *
 * 이 페이지의 본체는 퀘스트 4칸이다. 코치가 크게 자리를 먹으면 매일 아침
 * "체크하러" 들어온 사람이 대화창부터 마주하게 된다. 그래서 기본은 **말풍선 한 줄**이고,
 * 대화창은 눌러야 열린다.
 *
 * ## 브리핑이 늦게 와도 화면은 이미 떠 있다
 *
 * 코치는 OpenAI 를 부르므로 몇 초가 걸릴 수 있다. 그 사이 4칸을 못 누르면
 * 그게 곧 마찰이다. 그래서 이 컴포넌트는 **자기 자리에서만 로딩**하고,
 * 실패하면 조용히 사라진다(코치가 없다고 오늘 기록을 못 남기면 안 된다).
 */

import {useEffect, useRef, useState} from "react";
import {fetchCoachBriefing, sendCoachMessage} from "@/lib/islandApi";

interface Turn {
  who: "me" | "coach";
  text: string;
}

export function CoachPanel() {
  const [briefing, setBriefing] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 실패는 조용히 삼킨다 — 코치는 있으면 좋은 것이지 없으면 안 되는 게 아니다.
    void fetchCoachBriefing()
      .then(result => setBriefing(result.message))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({block: "end"});
  }, [turns, open]);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    setTurns(prev => [...prev, {who: "me", text}]);
    setBusy(true);
    try {
      const result = await sendCoachMessage(text);
      setTurns(prev => [...prev, {who: "coach", text: result.message}]);
    } catch {
      setTurns(prev => [
        ...prev,
        {who: "coach", text: "지금은 대답을 못 하겠다. 기록은 그냥 남겨."}
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!briefing) return null;

  return (
    <div className="v-panel mt-3 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="v-lantern-glow mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[rgb(var(--v-lantern)/0.5)] bg-[rgb(var(--v-lantern)/0.14)] text-sm"
        >
          <CoachMark />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[rgb(var(--v-moon)/0.6)]">
            코치
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[rgb(var(--v-paper))]">
            {briefing}
          </p>
        </div>
      </div>

      {open ? (
        <div className="mt-3 border-t border-[rgb(var(--v-wood)/0.4)] pt-3">
          {turns.length > 0 ? (
            <div className="mb-2 max-h-56 space-y-2 overflow-y-auto pr-1">
              {turns.map((turn, index) => (
                <p
                  className={
                    turn.who === "me"
                      ? "ml-8 rounded-lg bg-[rgb(var(--v-gold)/0.12)] px-3 py-2 text-sm text-[rgb(var(--v-paper))]"
                      : "mr-4 text-sm leading-relaxed text-[rgb(var(--v-moon))]"
                  }
                  key={`${turn.who}-${index}`}
                >
                  {turn.text}
                </p>
              ))}
              {busy ? (
                <p className="text-xs text-[rgb(var(--v-moon)/0.5)]">
                  생각하는 중…
                </p>
              ) : null}
              <div ref={endRef} />
            </div>
          ) : null}

          <div className="flex gap-2">
            <input
              autoFocus
              className="min-w-0 flex-1 rounded-lg border border-[rgb(var(--v-wood)/0.55)] bg-black/30 px-3 py-2.5 text-sm text-[rgb(var(--v-paper))] outline-none focus:border-[rgb(var(--v-gold)/0.7)]"
              onChange={event => setDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter") void send();
              }}
              placeholder="뭐라도 물어보기"
              value={draft}
            />
            <button
              className="shrink-0 whitespace-nowrap rounded-lg bg-[rgb(var(--v-lantern)/0.9)] px-4 py-2.5 text-sm font-bold text-[#20140a] disabled:opacity-40"
              disabled={busy || !draft.trim()}
              onClick={() => void send()}
              type="button"
            >
              보내기
            </button>
          </div>
        </div>
      ) : (
        <button
          className="mt-2 text-xs text-[rgb(var(--v-moon)/0.6)] underline underline-offset-4"
          onClick={() => setOpen(true)}
          type="button"
        >
          말 걸기
        </button>
      )}
    </div>
  );
}

/** 랜턴 하나 — 코치 자리 표시. 마을 문장 세트에 '사람' 글리프가 없어서 직접 그린다. */
function CoachMark() {
  return (
    <svg fill="none" height="17" viewBox="0 0 20 20" width="17">
      <path
        d="M10 3.2v2M7 6.6h6l1 6.2a4 4 0 01-8 0l1-6.2zM8.6 16.6h2.8"
        stroke="rgb(var(--v-lantern))"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
