"use client";

/**
 * 일일 퀘스트 4칸.
 *
 * ## 이 화면의 유일한 설계 목표: 손가락 한 번
 *
 * 습관 앱은 재미없어서가 아니라 **귀찮아서** 버려진다. 운동 끝나고 땀 흘리며
 * 폰을 켰을 때 탭 세 번을 요구하면 2주 뒤엔 안 연다. 그래서:
 *
 * - **운동은 줄을 누르면 바로 완료된다.** 시간·종목은 안 적어도 된다(적고
 *   싶으면 아래 화살표를 열면 된다). 필수 입력을 만드는 순간 마찰이 생긴다.
 * - **낙관적 갱신**을 쓴다. 서버 왕복을 기다리며 체크가 늦게 켜지면 눌린 건지
 *   아닌지 몰라 두 번 누르게 된다. 실패하면 되돌리고 이유를 보여준다.
 * - **모든 칸은 되돌릴 수 있다.** 잘못 눌렀을 때 방법이 없으면 그날 기록 전체를
 *   못 믿게 된다.
 */

import {useState} from "react";
import {Crest} from "@/components/ui/Crest";
import {
  saveCodingMinutes,
  saveCodingTestQuest,
  saveNotionQuest,
  saveWorkoutQuest
} from "@/lib/islandApi";
import {deleteCodingTest} from "@/lib/liveApi";
import type {CrestName} from "@/data/villageCrests";
import type {CodingTestLog} from "@/types/live";
import type {IslandToday, Quest, QuestId} from "@/types/island";

const QUEST_CREST: Record<QuestId, CrestName> = {
  workout: "steps",
  "coding-test": "book",
  coding: "gear",
  notion: "scroll"
};

/**
 * 코테 플랫폼.
 *
 * **백준은 2026-04-28 서비스가 종료됐다**(첫 화면이 "BOJ 채점 서비스 준비 중").
 * 링크 제목 긁기도 자동 조회도 불가라, 고를 수는 있게 두되 상태를 표시해서
 * "왜 제목이 안 채워지지?" 하고 헤매지 않게 한다. 돌아오면 badge 만 지우면 된다.
 */
const PLATFORMS: {name: string; badge?: string; note?: string}[] = [
  {name: "프로그래머스"},
  {
    name: "백준",
    badge: "(중단)",
    note: "백준은 2026-04-28 서비스가 종료돼 제목 자동 채우기가 안 됩니다. 직접 적어주세요."
  }
];

const QUEST_HINT: Record<QuestId, string> = {
  workout: "누르면 바로 완료 — 시간·종목은 안 적어도 됩니다",
  "coding-test": "문제 링크를 붙여넣으면 됩니다",
  coding: "커밋이 있으면 자동으로 채워집니다",
  notion: "오늘 정리한 페이지 링크"
};

export function QuestBoard({
  today,
  codingTests,
  onUpdate,
  onCodingTestsChanged
}: {
  today: IslandToday;
  codingTests: CodingTestLog[];
  onUpdate: (next: IslandToday) => void;
  onCodingTestsChanged: () => void;
}) {
  const [open, setOpen] = useState<QuestId | null>(null);
  const [error, setError] = useState("");
  // 낙관적 갱신 중인 칸 — 서버 응답이 오면 지운다.
  const [pending, setPending] = useState<Partial<Record<QuestId, boolean>>>({});

  async function run(
    questId: QuestId,
    optimisticDone: boolean,
    action: () => Promise<IslandToday>
  ) {
    setError("");
    setPending(prev => ({...prev, [questId]: optimisticDone}));
    try {
      onUpdate(await action());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "저장하지 못했어요.");
    } finally {
      setPending(prev => {
        const next = {...prev};
        delete next[questId];
        return next;
      });
    }
  }

  return (
    <div className="space-y-2">
      {today.quests.map(quest => (
        <div className="v-panel overflow-hidden" key={quest.id}>
          <QuestRow
            done={pending[quest.id] ?? quest.done}
            expanded={open === quest.id}
            onPrimary={() => {
              // 운동만 줄 누르기로 바로 토글된다. 나머지는 입력이 필요해서 열린다.
              if (quest.id === "workout") {
                const next = !(pending.workout ?? quest.done);
                void run("workout", next, () => saveWorkoutQuest({done: next}));
                return;
              }
              setOpen(open === quest.id ? null : quest.id);
            }}
            onToggleDetail={() => setOpen(open === quest.id ? null : quest.id)}
            quest={quest}
          />

          {open === quest.id ? (
            <div className="border-t border-[rgb(var(--v-wood)/0.4)] px-4 pb-4 pt-3">
              {quest.id === "workout" ? (
                <WorkoutDetail
                  onSave={(minutes, type) =>
                    run("workout", true, () =>
                      saveWorkoutQuest({
                        done: true,
                        minutes,
                        workout_type: type
                      })
                    )
                  }
                />
              ) : null}

              {quest.id === "coding-test" ? (
                <CodingTestDetail
                  entries={codingTests}
                  onChanged={onCodingTestsChanged}
                  onSaved={onUpdate}
                />
              ) : null}

              {quest.id === "coding" ? (
                <CodingDetail
                  onSave={minutes =>
                    run("coding", minutes > 0, () => saveCodingMinutes(minutes))
                  }
                />
              ) : null}

              {quest.id === "notion" ? (
                <NotionDetail
                  done={quest.done}
                  onClear={() =>
                    run("notion", false, () => saveNotionQuest({url: ""}))
                  }
                  onSave={(url, title) =>
                    run("notion", true, () => saveNotionQuest({url, title}))
                  }
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ))}

      {error ? (
        <p className="px-1 text-xs text-[#e08a6a]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// ─────────────────────────── 줄 ───────────────────────────

function QuestRow({
  quest,
  done,
  expanded,
  onPrimary,
  onToggleDetail
}: {
  quest: Quest;
  done: boolean;
  expanded: boolean;
  onPrimary: () => void;
  onToggleDetail: () => void;
}) {
  return (
    <div className="flex items-stretch">
      {/* 손가락 목표를 크게 — min-h 로 68px 을 확보한다 */}
      <button
        className="flex min-h-[68px] flex-1 items-center gap-3.5 px-4 text-left"
        onClick={onPrimary}
        type="button"
      >
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors ${
            done
              ? "border-[rgb(var(--v-lantern)/0.8)] bg-[rgb(var(--v-lantern)/0.18)]"
              : "border-[rgb(var(--v-wood)/0.6)] bg-black/25"
          }`}
        >
          {done ? (
            <CheckMark />
          ) : (
            <Crest
              name={QUEST_CREST[quest.id]}
              size={20}
              tone="rgb(169 189 214 / 0.55)"
            />
          )}
        </span>
        <span className="min-w-0">
          <span
            className={`v-serif block text-[17px] ${
              done ? "text-[rgb(var(--v-paper))]" : "text-[rgb(var(--v-moon))]"
            }`}
          >
            {quest.label}
          </span>
          <span className="mt-0.5 block truncate text-xs text-[rgb(var(--v-moon)/0.7)]">
            {quest.detail || QUEST_HINT[quest.id]}
          </span>
        </span>
      </button>

      <button
        aria-label={`${quest.label} 자세히`}
        className="grid w-12 shrink-0 place-items-center text-[rgb(var(--v-moon)/0.6)]"
        onClick={onToggleDetail}
        type="button"
      >
        <svg
          fill="none"
          height="16"
          style={{
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform .18s"
          }}
          viewBox="0 0 16 16"
          width="16"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.6"
          />
        </svg>
      </button>
    </div>
  );
}

function CheckMark() {
  return (
    <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
      <path
        d="M4.5 10.5l3.6 3.6L15.5 6.5"
        stroke="rgb(var(--v-lantern))"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

// ─────────────────────────── 칸별 입력 ───────────────────────────

// **여기에 w-full 을 넣지 말 것.** Tailwind 는 클래스 문자열 순서가 아니라 CSS
// 출력 순서로 이긴다 — 여기 w-full 이 있으면 사용처의 `w-24`/`w-28` 을 이겨서
// 입력칸이 줄 전체를 먹고 옆 버튼 글자가 두 줄로 쪼개진다. 폭은 사용처에서 정한다.
const fieldClass =
  "rounded-lg border border-[rgb(var(--v-wood)/0.55)] bg-black/30 px-3 py-2.5 text-sm text-[rgb(var(--v-paper))] outline-none focus:border-[rgb(var(--v-gold)/0.7)]";
const buttonClass =
  "shrink-0 whitespace-nowrap rounded-lg bg-[rgb(var(--v-lantern)/0.9)] px-4 py-2.5 text-sm font-bold text-[#20140a] disabled:opacity-40";
const ghostButtonClass =
  "shrink-0 whitespace-nowrap rounded-lg border border-[rgb(var(--v-wood)/0.6)] px-3 py-2.5 text-sm text-[rgb(var(--v-moon))]";

function WorkoutDetail({
  onSave
}: {
  onSave: (minutes: number, type: string) => void;
}) {
  const [minutes, setMinutes] = useState("");
  const [type, setType] = useState("");
  return (
    <div className="space-y-2">
      <p className="text-xs text-[rgb(var(--v-moon)/0.7)]">
        남기고 싶을 때만 적으면 됩니다. 안 적어도 완료는 완료예요.
      </p>
      <div className="flex gap-2">
        <input
          className={`${fieldClass} flex-1`}
          onChange={event => setType(event.target.value)}
          placeholder="종목 (헬스, 러닝…)"
          value={type}
        />
        <input
          className={`${fieldClass} w-24`}
          inputMode="numeric"
          onChange={event => setMinutes(event.target.value)}
          placeholder="분"
          value={minutes}
        />
      </div>
      <button
        className={buttonClass}
        onClick={() => onSave(Number(minutes) || 0, type)}
        type="button"
      >
        기록하기
      </button>
    </div>
  );
}

function CodingDetail({onSave}: {onSave: (minutes: number) => void}) {
  const [minutes, setMinutes] = useState("");
  return (
    <div className="space-y-2">
      <p className="text-xs text-[rgb(var(--v-moon)/0.7)]">
        커밋을 안 남긴 날만 직접 적으면 됩니다.
      </p>
      <div className="flex gap-2">
        <input
          className={`${fieldClass} w-28`}
          inputMode="numeric"
          onChange={event => setMinutes(event.target.value)}
          placeholder="분"
          value={minutes}
        />
        <button
          className={buttonClass}
          onClick={() => onSave(Number(minutes) || 0)}
          type="button"
        >
          기록하기
        </button>
      </div>
    </div>
  );
}

function NotionDetail({
  done,
  onSave,
  onClear
}: {
  done: boolean;
  onSave: (url: string, title: string) => void;
  onClear: () => void;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  return (
    <div className="space-y-2">
      <input
        className={`${fieldClass} w-full`}
        inputMode="url"
        onChange={event => setUrl(event.target.value)}
        placeholder="https://notion.so/…"
        value={url}
      />
      <input
        className={`${fieldClass} w-full`}
        onChange={event => setTitle(event.target.value)}
        placeholder="무엇을 정리했나 (선택)"
        value={title}
      />
      <div className="flex gap-2">
        <button
          className={buttonClass}
          disabled={!url.trim()}
          onClick={() => onSave(url.trim(), title.trim())}
          type="button"
        >
          기록하기
        </button>
        {done ? (
          <button className={ghostButtonClass} onClick={onClear} type="button">
            취소
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CodingTestDetail({
  entries,
  onSaved,
  onChanged
}: {
  entries: CodingTestLog[];
  onSaved: (next: IslandToday) => void;
  onChanged: () => void;
}) {
  const [platform, setPlatform] = useState("프로그래머스");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add() {
    setBusy(true);
    setError("");
    try {
      // 제목은 **보내지 않아도 된다** — 비우면 서버가 링크에서 긁어 채운다.
      // 못 긁으면 빈 채로 저장되고, 그래도 오늘 칸은 채워진다.
      onSaved(
        await saveCodingTestQuest({
          url: url.trim(),
          platform,
          title: title.trim()
        })
      );
      setTitle("");
      setUrl("");
      onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[rgb(var(--v-moon)/0.7)]">
        링크만 붙여넣으면 제목은 알아서 채워집니다.
      </p>
      <input
        autoComplete="off"
        className={`${fieldClass} w-full`}
        inputMode="url"
        onChange={event => setUrl(event.target.value)}
        placeholder="문제 링크 (붙여넣기)"
        value={url}
      />
      <div className="flex gap-2">
        {PLATFORMS.map(entry => (
          <button
            className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
              platform === entry.name
                ? "border-[rgb(var(--v-gold)/0.7)] bg-[rgb(var(--v-gold)/0.14)] text-[rgb(var(--v-paper))]"
                : "border-[rgb(var(--v-wood)/0.55)] text-[rgb(var(--v-moon)/0.75)]"
            }`}
            key={entry.name}
            onClick={() => setPlatform(entry.name)}
            title={entry.note}
            type="button"
          >
            {entry.name}
            {entry.note ? (
              <span className="ml-1 text-[10px] text-[rgb(var(--v-moon)/0.55)]">
                {entry.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <input
        className={`${fieldClass} w-full`}
        onChange={event => setTitle(event.target.value)}
        placeholder="문제 제목 (비워두면 자동)"
        value={title}
      />
      <button
        className={buttonClass}
        disabled={busy || (!title.trim() && !url.trim())}
        onClick={() => void add()}
        type="button"
      >
        {busy ? "가져오는 중…" : "추가하기"}
      </button>
      {error ? <p className="text-xs text-[#e08a6a]">{error}</p> : null}

      {entries.length > 0 ? (
        <ul className="space-y-1.5 pt-1">
          {entries.map(entry => (
            <li
              className="flex items-center gap-2 rounded-lg bg-black/25 px-3 py-2"
              key={entry.id}
            >
              <span className="min-w-0 flex-1 truncate text-xs text-[rgb(var(--v-moon))]">
                <span className="text-[rgb(var(--v-gold))]">
                  {entry.platform}
                </span>{" "}
                {entry.title || entry.url || "(제목 없음)"}
              </span>
              <button
                aria-label="지우기"
                className="shrink-0 px-1 text-[rgb(var(--v-moon)/0.6)]"
                onClick={async () => {
                  await deleteCodingTest(entry.id);
                  onChanged();
                }}
                type="button"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
