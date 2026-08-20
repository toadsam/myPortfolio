"use client";

/**
 * 갓생 섬 — 오늘 할 4가지를 찍는 곳.
 *
 * ## 마을(`/`)과 절대 섞지 않는다
 *
 * 이 라우트는 **마을 코드를 import 하지 않는다.** 특히 `@/lib/constants` 는
 * 모듈이 로드되는 순간 마을 건물 배열 전체를 `spread()` 로 계산하므로, 색
 * 상수 하나 쓰자고 끌어오면 마을 데이터가 통째로 번들에 딸려온다. 색과 틀은
 * `globals.css` 의 `.v-*` 어휘를 쓴다(전역 CSS 한 장이라 추가 비용이 없다).
 *
 * 이 규칙이 지켜지는지는 `npm run build` 의 라우트별 First Load JS 로 확인한다.
 *
 * ## 3D는 아직 없다
 *
 * 계획상 3D 작업실은 나중 단계다. 그리고 **모바일에서는 그때도 3D를 띄우지
 * 않는다** — 운동 직후 땀 흘리며 여는 화면이 여기라, 로딩이 붙는 순간 안 쓰게
 * 된다. 지금은 모든 기기가 이 2D 화면을 본다.
 */

import dynamic from "next/dynamic";
import {useCallback, useEffect, useState} from "react";
import {CoachPanel} from "@/app/island/_components/CoachPanel";
import {IslandGate} from "@/app/island/_components/IslandGate";
import {QuestBoard} from "@/app/island/_components/QuestBoard";
import {StreakBanner} from "@/app/island/_components/StreakBanner";
import {
  IslandApiError,
  fetchIslandHistory,
  fetchIslandToday,
  refreshIsland
} from "@/lib/islandApi";
import {fetchCodingTests} from "@/lib/liveApi";
import type {CodingTestLog} from "@/types/live";
import type {IslandHistoryRow, IslandToday} from "@/types/island";

/**
 * 3D 작업실.
 *
 * **`ssr:false` + 조건부 마운트가 핵심이다.** 이렇게 해야 three.js 청크가
 * 별도 파일로 떨어지고, 터치 기기에서는 그 파일을 **아예 요청하지 않는다.**
 * 정적 import 로 바꾸는 순간 모바일도 three.js 를 받게 되고, 이 페이지의
 * 존재 이유(운동 직후 1초 안에 체크)가 사라진다.
 */
const IslandRoom = dynamic(
  () => import("@/app/island/_components/IslandRoom").then(m => m.IslandRoom),
  {ssr: false}
);

type Phase = "loading" | "gate" | "locked" | "ready" | "offline" | "stale";

/** 터치 전용 기기인가. 마을(AIPortfolioVillage)이 쓰는 판정과 같은 조건이다. */
function useIsTouchDevice(): boolean | null {
  // null = 아직 모름(서버 렌더). 확정 전에는 3D 를 마운트하지 않는다.
  const [isTouch, setIsTouch] = useState<boolean | null>(null);
  useEffect(() => {
    setIsTouch(
      window.matchMedia("(pointer: coarse)").matches &&
        window.matchMedia("(hover: none)").matches
    );
  }, []);
  return isTouch;
}

export default function IslandPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [today, setToday] = useState<IslandToday | null>(null);
  const [history, setHistory] = useState<IslandHistoryRow[]>([]);
  const [codingTests, setCodingTests] = useState<CodingTestLog[]>([]);
  const [refresh, setRefresh] = useState<{
    filled: string[];
    notes: string[];
  } | null>(null);
  const isTouch = useIsTouchDevice();

  const loadCodingTests = useCallback(async (forDate: string) => {
    try {
      const all = await fetchCodingTests();
      setCodingTests(all.filter(entry => entry.solved_date === forDate));
    } catch {
      setCodingTests([]);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const snapshot = await fetchIslandToday();
      setToday(snapshot);
      setPhase("ready");
      // 잔디밭과 코테 목록은 있으면 좋은 것들이라, 실패해도 오늘 화면을 막지 않는다.
      void fetchIslandHistory(30)
        .then(setHistory)
        .catch(() => undefined);
      void loadCodingTests(snapshot.date);

      // 자동 채우기(깃허브 커밋 등). **화면을 띄운 뒤에** 부른다 — 남의 서버를
      // 기다리느라 오늘 칸이 늦게 뜨면, 그 몇 초가 매일 쌓여 안 열게 만든다.
      void refreshIsland()
        .then(result => {
          setToday(result.today);
          setRefresh({filled: result.filled, notes: result.notes});
        })
        .catch(() => undefined);
    } catch (cause) {
      if (cause instanceof IslandApiError) {
        if (cause.isLocked) return setPhase("locked");
        if (cause.needsLogin) return setPhase("gate");
        if (cause.isStaleServer) return setPhase("stale");
      }
      setPhase("offline");
    }
  }, [loadCodingTests]);

  useEffect(() => {
    void load();
  }, [load]);

  if (phase === "loading") {
    return (
      <Shell>
        <p className="pt-24 text-center text-sm text-[rgb(var(--v-moon)/0.7)]">
          섬으로 가는 중…
        </p>
      </Shell>
    );
  }

  if (phase === "gate" || phase === "locked") {
    return (
      <Shell>
        <IslandGate
          locked={phase === "locked"}
          onEntered={() => {
            setPhase("loading");
            void load();
          }}
        />
      </Shell>
    );
  }

  // 서버는 켜져 있는데 섬 라우트를 모르는 경우. '켜기'가 아니라 '다시 켜기'가
  // 답이라, 아래 offline 안내와 반드시 구분해서 보여준다.
  if (phase === "stale") {
    return (
      <Shell>
        <div className="v-panel mt-24 p-5 text-sm text-[rgb(var(--v-moon))]">
          <p>백엔드가 옛 버전으로 돌고 있어요.</p>
          <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--v-moon)/0.7)]">
            서버는 켜져 있지만 섬 기능이 없는 코드예요. 실행 중인 백엔드를{" "}
            <strong className="text-[rgb(var(--v-paper))]">껐다가</strong> 다시
            켜면 됩니다 (그때 DB 칸도 자동으로 추가돼요).
          </p>
          <button
            className="mt-4 rounded-lg bg-[rgb(var(--v-lantern)/0.9)] px-4 py-2.5 text-sm font-bold text-[#20140a]"
            onClick={() => {
              setPhase("loading");
              void load();
            }}
            type="button"
          >
            다시 확인
          </button>
        </div>
      </Shell>
    );
  }

  if (phase === "offline" || !today) {
    return (
      <Shell>
        <div className="v-panel mt-24 p-5 text-sm text-[rgb(var(--v-moon))]">
          <p>백엔드에 닿지 못했어요.</p>
          <p className="mt-2 text-xs text-[rgb(var(--v-moon)/0.7)]">
            <code className="text-[rgb(var(--v-paper))]">
              npm run backend:dev
            </code>{" "}
            로 서버를 켠 뒤 새로고침해 주세요.
          </p>
        </div>
      </Shell>
    );
  }

  const doneCount = today.quests.filter(quest => quest.done).length;

  return (
    <Shell
      room={
        // isTouch 가 확정(false)된 데스크톱에서만 마운트한다. null(판정 전)에도
        // 안 띄워서, 모바일이 잠깐이라도 three.js 를 받는 일이 없게 한다.
        isTouch === false ? <IslandRoom doneCount={doneCount} /> : null
      }
    >
      <header className="pb-4 pt-6">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[rgb(var(--v-moon)/0.65)]">
          {formatDate(today.date)}
        </p>
        <h1 className="v-serif mt-1 text-2xl text-[rgb(var(--v-gold))]">
          {today.cleared ? "오늘 치 다 했습니다" : `오늘 ${doneCount} / 4`}
        </h1>
      </header>

      <StreakBanner
        best={today.best_streak}
        cleared={today.cleared}
        history={history}
        streak={today.streak}
      />

      <CoachPanel />

      <div className="mt-3">
        <QuestBoard
          codingTests={codingTests}
          onCodingTestsChanged={() => {
            void loadCodingTests(today.date);
            void fetchIslandToday()
              .then(setToday)
              .catch(() => undefined);
          }}
          onUpdate={next => {
            setToday(next);
            void fetchIslandHistory(30)
              .then(setHistory)
              .catch(() => undefined);
          }}
          today={today}
        />
      </div>

      {refresh && (refresh.filled.length > 0 || refresh.notes.length > 0) ? (
        <div className="mt-3 px-1">
          {refresh.filled.length > 0 ? (
            <p className="text-xs text-[rgb(var(--v-gold)/0.85)]">
              자동으로 채움 — {refresh.filled.join(" · ")}
            </p>
          ) : null}
          {/* 왜 자동 조회가 안 됐는지. 오류가 아니라 안내라, 눈에 안 띄게 둔다 —
              다만 아예 숨기면 "왜 안 채워지지?" 하고 헤매게 된다. */}
          {refresh.notes.map(note => (
            <p
              className="mt-1 text-[11px] leading-relaxed text-[rgb(var(--v-moon)/0.5)]"
              key={note}
            >
              {note}
            </p>
          ))}
        </div>
      ) : null}

      <footer className="py-8 text-center">
        <a
          className="text-xs text-[rgb(var(--v-moon)/0.55)] underline underline-offset-4"
          href="/village"
        >
          마을로 돌아가기
        </a>
      </footer>
    </Shell>
  );
}

function Shell({
  children,
  room
}: {
  children: React.ReactNode;
  /** 뒤에 깔릴 3D 방. 없으면(모바일·로그인 전) 밤하늘 그라디언트만 남는다. */
  room?: React.ReactNode;
}) {
  return (
    <main
      // `flow-root` 가 없으면 안쪽 카드의 위쪽 마진(mt-24 등)이 main 밖으로
      // 빠져나가 main 자체를 밀어낸다(마진 상쇄). 그 틈으로 body 의 마을
      // 크림색 바탕이 그대로 비친다 — 밤하늘 화면에 크림색 띠가 생긴다.
      className="min-h-dvh flow-root px-4"
      style={{
        // 마을 밤하늘과 같은 바탕. VILLAGE_PALETTE 를 import 하지 않고 토큰만 쓴다.
        background:
          "radial-gradient(120% 80% at 50% 0%, #16263c 0%, #0b1626 55%, #070f1b 100%)"
      }}
    >
      {room ? (
        // 화면 전체를 덮되 패널보다 **아래**. `-z-10` 을 쓰면 안 된다 —
        // main 자신이 배경 그라디언트를 칠하므로, 음수 z 는 그 배경 뒤로 들어가
        // 캔버스가 통째로 가려진다(실제로 한 번 그렇게 사라졌다).
        <div className="pointer-events-none fixed inset-0 z-0">{room}</div>
      ) : null}
      <div className="relative z-10 mx-auto w-full max-w-md">{children}</div>
    </main>
  );
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][
    new Date(year, month - 1, day).getDay()
  ];
  return `${month}월 ${day}일 ${weekday}요일`;
}
