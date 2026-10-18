"use client";

/**
 * 마을 배전반 — 관리자 화면의 셸. 한 화면이다.
 *
 * 위에 붙은 지도와 루미, 회로마다 바로 아래 지시서, 맨 아래 **꾹 눌러 송전** 하나.
 * 2026-10-17 의 탭 넷(배전반·지시서·기록실·서랍)은 손잡이가 많고 결과가 안 보여서
 * 하루 만에 접었다. 기록실·서랍장은 더보기 시트에서 전체 화면으로 열린다.
 * 이 파일은 상태와 서버 왕복만 들고, 화면은 `_screens/*` 가 그린다.
 *
 * 데이터 흐름은 그대로다: 그날 `DailyActivity` 를 폼으로 불러와 고치고, 송전하면
 * `saveActivity` 로 하루 전체를 저장한 뒤 마을 상태를 다시 받는다. 작업 지시서를 완료하면
 * 서버가 그날 기록에 분량을 더하고, 같은 분량을 여기 폼에도 더한다(`applyPlanMinutes`).
 * 그래서 지시서를 끝낸 뒤 송전해도 값이 어긋나지 않는다.
 */

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  fetchActivityHistory,
  fetchAdminAuthStatus,
  fetchAdminOverview,
  fetchVillageState,
  saveActivity,
  setAdminToken,
  syncGithubActivity
} from "@/lib/liveApi";
import {
  diffAgainstServer,
  previewBuildingScores,
  previewNpcMoods
} from "@/lib/villageLightPreview";
import type {
  ActivityInput,
  AiUsage,
  DailyActivity,
  PlanItem,
  VillageState
} from "@/types/live";
import "./admin.css";
import "./board.css";
import {AdminGate} from "./_components/AdminGate";
import {RewardOverlay, type RewardInfo} from "./_components/RewardOverlay";
import {CommissionAlert} from "./_drawers/CommissionAdmin";
import {
  addDays,
  computeStats,
  normalizeForm,
  prettyDate,
  today
} from "./_lib/activity";
import {initialForm} from "./_lib/options";
import {dayKwh, powerSummary} from "./_lib/power";
import {buzz, sfx} from "./_lib/sfx";
import {usePlanItems} from "./_lib/usePlanItems";
import {BoardScreen} from "./_screens/BoardScreen";
import {DrawerScreen, type DrawerId} from "./_screens/DrawerScreen";
import {LogScreen} from "./_screens/LogScreen";
import {BoardHead} from "./_shell/BoardHead";
import {MoreSheet, type MoreAction} from "./_shell/MoreSheet";
import {SendDock} from "./_shell/SendDock";

type Screen = "board" | "log" | "drawer";

function formFrom(activity?: DailyActivity | null): ActivityInput {
  if (!activity) return initialForm;
  return {
    github_commits: activity.github_commits,
    github_repos: activity.github_repos ?? [],
    study_minutes: activity.study_minutes,
    study_topics: activity.study_topics ?? [],
    studied_tech: activity.studied_tech ?? [],
    coding_minutes: activity.coding_minutes ?? 0,
    project_minutes: activity.project_minutes ?? {},
    workout_done: activity.workout_done,
    workout_minutes: activity.workout_minutes ?? 0,
    workout_type: activity.workout_type ?? "",
    focus_score: activity.focus_score ?? 50,
    memo: activity.memo,
    mood: activity.mood
  };
}

export default function AdminPage() {
  const [form, setForm] = useState<ActivityInput>(initialForm);
  const [villageState, setVillageState] = useState<VillageState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today());
  const [history, setHistory] = useState<DailyActivity[]>([]);
  const [reward, setReward] = useState<RewardInfo | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [aiUsage, setAiUsage] = useState<AiUsage | null>(null);
  const [screen, setScreen] = useState<Screen>("board");
  const [more, setMore] = useState(false);
  const [drawer, setDrawer] = useState<DrawerId | null>(null);
  const [commissionWaiting, setCommissionWaiting] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef(0);

  const isToday = selectedDate === today();
  const plan = usePlanItems(selectedDate, authChecked && !locked);

  const historyByDate = useMemo(() => {
    const map: Record<string, DailyActivity> = {};
    for (const item of history) map[item.date] = item;
    return map;
  }, [history]);
  /** 기록이 남아 있는 날짜 — 연속 도장이 읽는다 */
  const recordedDates = useMemo(
    () => new Set(history.map(h => h.date)),
    [history]
  );
  const stats = useMemo(() => computeStats(history), [history]);
  const power = useMemo(() => powerSummary(history), [history]);
  const savedRow = historyByDate[selectedDate] ?? null;
  /** 송전 대기 — 지금 폼이 저장된 그날 기록보다 얼마나 더 켜져 있나 */
  const pending = Math.max(0, dayKwh(form) - dayKwh(savedRow));
  const dirty = useMemo(
    () =>
      JSON.stringify(normalizeForm(form)) !==
      JSON.stringify(normalizeForm(formFrom(savedRow))),
    [form, savedRow]
  );
  const npcPreview = useMemo(() => previewNpcMoods(form), [form]);

  // 코딩테스트·CS 는 서랍이 저장한다. 이 폼으로는 못 움직이므로 미리보기에서 0 으로
  // 두면 실제로 켜져 있는 도장·서고가 꺼져 보인다 — 서버 값을 그대로 덮어 쓴다.
  const studyOverrides = useMemo(() => {
    const out: Record<string, number> = {};
    for (const b of villageState?.buildings ?? []) {
      if (b.building_id === "study-codingtest" || b.building_id === "study-cs")
        out[b.building_id] = b.activity_score;
    }
    return out;
  }, [villageState]);

  const say = useCallback((text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  function goScreen(next: Screen) {
    setScreen(next);
    window.scrollTo({top: 0});
  }

  /**
   * 잠금 판정 — **들어올 때마다 금고 문이 먼저다.**
   *
   * 토큰은 비밀번호가 아니라 `ADMIN_SECRET` 으로 서명되고 유효기간이 7일이라,
   * **비밀번호를 바꿔도 이미 나간 토큰은 그대로 살아 있다.** 그래서 인증이 켜져
   * 있으면 토큰이 뭐든 일단 잠근다. 대신 **토큰을 지우지는 않는다** — 지우면 다른
   * 탭이나 갓생 섬이 같이 로그아웃된다.
   *
   * 인증이 꺼져 있으면(로컬에서 `ADMIN_PASSWORD` 를 비워 둔 경우) 문이 없다.
   * 잠글 것이 없는데 잠근 척하는 화면은 거짓말이다.
   */
  useEffect(() => {
    async function checkAuth() {
      try {
        const auth = await fetchAdminAuthStatus();
        if (auth.auth_enabled) {
          setLocked(true);
          setAuthChecked(true);
          return;
        }
      } catch {
        // 백엔드 미응답 시엔 그냥 진행(로컬 개발 편의) — 송전 때 오류가 드러난다
      }
      setAuthChecked(true);
      void loadAll();
    }
    void checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleUnlocked() {
    setLocked(false);
    void loadAll();
  }

  /** 배전반을 다시 잠근다 — 토큰을 버리고 금고 문으로 돌아간다. */
  function lockBoard() {
    setAdminToken(null);
    setLocked(true);
  }

  async function loadAll() {
    try {
      const [hist, state] = await Promise.all([
        fetchActivityHistory(140),
        fetchVillageState()
      ]);
      setHistory(hist);
      setVillageState(state);
      const todayKey = today();
      setSelectedDate(todayKey);
      setForm(formFrom(hist.find(item => item.date === todayKey)));
    } catch {
      say("백엔드에 연결하지 못했어요. 백엔드를 띄운 뒤 새로고침하세요");
    }
    try {
      const overview = await fetchAdminOverview();
      setAiUsage(overview.ai_usage);
    } catch {
      // AI 사용량은 부가 정보 — 조회 실패해도 기록 화면 자체는 그대로 쓸 수 있게 조용히 무시
    }
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    setForm(formFrom(historyByDate[date]));
  }

  function copyYesterday() {
    const prev = historyByDate[addDays(selectedDate, -1)];
    if (!prev) {
      say("어제 기록이 없어 복사할 내용이 없어요");
      return;
    }
    setForm(formFrom(prev));
    say("어제 기록을 불러왔어요. 고친 뒤 송전하세요");
  }

  async function handleSave() {
    const levelBefore = power.level;
    const gained = pending;
    const savedForm = form;
    setIsSaving(true);
    try {
      await saveActivity({...normalizeForm(form), date: selectedDate});
      const [hist, state] = await Promise.all([
        fetchActivityHistory(140),
        fetchVillageState()
      ]);
      setHistory(hist);
      setVillageState(state);

      // 미리보기(프런트 사본)와 서버 계산을 대조한다. 규칙이 한쪽에서만 바뀌면
      // 미리보기는 아무 티도 안 내고 틀린 그림을 계속 보여주므로, 저장할 때마다
      // 확인해 **규칙을 바꾼 그날** 걸리게 한다. 개발 모드에서만 시끄럽다.
      if (process.env.NODE_ENV === "development") {
        const gaps = diffAgainstServer(
          previewBuildingScores(form, {
            codingToday: 0,
            codingTotal: 0,
            csToday: 0,
            csTotal: 0
          }),
          state.buildings.filter(
            b =>
              b.building_id !== "study-codingtest" &&
              b.building_id !== "study-cs"
          )
        );
        if (gaps.length)
          console.warn(
            [
              "[마을 미리보기] 서버 계산과 어긋납니다.",
              "villageLightPreview.ts 를 village_service.py 와 맞추세요:",
              ...gaps
            ].join(" | ")
          );
      }

      sfx.power();
      buzz([30, 50, 30, 50, 80]);
      if (isToday) {
        setReward({
          state,
          date: selectedDate,
          form: savedForm,
          gained,
          levelBefore,
          levelAfter: powerSummary(hist).level
        });
      } else say(`${prettyDate(selectedDate)} 기록을 송전했어요`);
    } catch {
      say("송전에 실패했어요. 백엔드 상태를 확인하세요");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGithubSync() {
    setIsSaving(true);
    try {
      const result = await syncGithubActivity();
      setForm(current => ({...current, github_commits: result.commits}));
      setVillageState(await fetchVillageState());
      say(result.warning ?? `GitHub 커밋 ${result.commits}개를 반영했어요`);
    } catch {
      say("GitHub 동기화에 실패했어요. 토큰이나 백엔드를 확인하세요");
    } finally {
      setIsSaving(false);
    }
  }

  const updateForm = useCallback((patch: Partial<ActivityInput>) => {
    setForm(current => ({...current, ...patch}));
  }, []);

  const setProjectMinutes = useCallback(
    (projectId: string, minutes: number) => {
      setForm(current => ({
        ...current,
        project_minutes: {
          ...current.project_minutes,
          [projectId]: Math.max(0, minutes)
        }
      }));
    },
    []
  );

  /** 지시서를 완료(또는 취소)했다 — 서버가 더한 분량을 폼에도 같이 더한다. 연출은 회로 블록이 했다. */
  const applyPlanMinutes = useCallback(
    (item: PlanItem, delta: number) => {
      if (item.date === selectedDate && delta !== 0) {
        setForm(current => {
          const c = item.circuit;
          if (c === "workout") {
            const minutes = Math.max(
              0,
              (current.workout_done ? current.workout_minutes : 0) + delta
            );
            return {
              ...current,
              workout_minutes: minutes,
              workout_done: minutes > 0
            };
          }
          if (c === "study")
            return {
              ...current,
              study_minutes: Math.max(0, current.study_minutes + delta)
            };
          if (c === "coding")
            return {
              ...current,
              coding_minutes: Math.max(0, current.coding_minutes + delta)
            };
          if (c.startsWith("project:")) {
            const id = c.slice("project:".length);
            return {
              ...current,
              project_minutes: {
                ...current.project_minutes,
                [id]: Math.max(0, (current.project_minutes[id] ?? 0) + delta)
              }
            };
          }
          return current;
        });
      }
      // 서버가 그날 기록을 고쳤으니 기록실·송전 대기 계산도 새 값으로 맞춘다(폼은 건드리지 않는다)
      void fetchActivityHistory(140)
        .then(setHistory)
        .catch(() => undefined);
    },
    [selectedDate]
  );

  /* ── 지도 ↔ 회로 양방향 연결 ──
   * 지도의 건물을 누르면 그 건물을 켜는 회로로 스크롤하고, 회로가 목표선을 넘으면
   * 지도의 짝 건물이 한 번 번쩍인다. 짝은 `villageLightPreview.ts` 의 점수 표와 같은 id. */
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [pickNote, setPickNote] = useState<string | null>(null);
  const [flashIds, setFlashIds] = useState<string[]>([]);
  const focusByBuilding = useRef<Map<string, () => void>>(new Map());

  const registerFocus = useCallback(
    (buildingIds: string[], focus: () => void) => {
      for (const id of buildingIds) focusByBuilding.current.set(id, focus);
    },
    []
  );

  const pickBuilding = useCallback((buildingId: string) => {
    const focus = focusByBuilding.current.get(buildingId);
    if (!focus) {
      // 모든 건물이 회로를 갖는 건 아니다 — 경력·서고 건물은 다른 기록에서 켜진다.
      setPickNote("이 건물은 다른 기록에서 밝아져요");
      window.setTimeout(() => setPickNote(null), 2600);
      return;
    }
    setPickedIds([buildingId]);
    sfx.fuse();
    focus();
    window.setTimeout(() => setPickedIds([]), 1600);
  }, []);

  const flashBuildings = useCallback((ids: string[]) => {
    setFlashIds(ids);
    window.setTimeout(() => setFlashIds([]), 700);
  }, []);

  const isPicked = useCallback(
    (ids: string[]) => ids.some(id => pickedIds.includes(id)),
    [pickedIds]
  );

  function onMore(action: MoreAction) {
    if (action === "log") goScreen("log");
    else if (action === "drawer") goScreen("drawer");
    else if (action === "github") void handleGithubSync();
    else if (action === "yesterday") copyYesterday();
    else if (action === "village") window.location.href = "/village";
    else if (action === "lock") lockBoard();
  }

  if (!authChecked) {
    return (
      <main className="admin-switchboard grid min-h-screen place-items-center text-[#8b94a0]">
        <p className="font-mono text-sm">불러오는 중…</p>
      </main>
    );
  }

  if (locked) return <AdminGate onUnlocked={handleUnlocked} />;

  return (
    <main className="admin-switchboard ab-app">
      <CommissionAlert
        onCount={setCommissionWaiting}
        onOpen={() => {
          setDrawer("commission");
          goScreen("drawer");
        }}
      />
      <div className="ab-shell">
        {screen === "board" ? (
          <>
            <BoardHead
              date={selectedDate}
              form={form}
              hasRecord={Boolean(savedRow)}
              highlightIds={flashIds}
              isToday={isToday}
              npcPreview={npcPreview}
              onMore={() => setMore(true)}
              onPickBuilding={pickBuilding}
              onShift={delta => {
                sfx.tick(0.3);
                selectDate(addDays(selectedDate, delta));
              }}
              onToday={() => selectDate(today())}
              pending={pending}
              pickNote={pickNote}
              studyOverrides={studyOverrides}
            />
            <BoardScreen
              form={form}
              isPicked={isPicked}
              onFlashBuildings={flashBuildings}
              onOrderApplied={applyPlanMinutes}
              plan={plan}
              registerFocus={registerFocus}
              setProjectMinutes={setProjectMinutes}
              updateForm={updateForm}
            />
          </>
        ) : null}
        {screen === "log" ? (
          <LogScreen
            aiUsage={aiUsage}
            form={form}
            history={history}
            historyByDate={historyByDate}
            onBack={() => goScreen("board")}
            onOpenDate={date => {
              selectDate(date);
              goScreen("board");
            }}
            power={power}
            recordedDates={recordedDates}
            selectedDate={selectedDate}
            stats={stats}
          />
        ) : null}
        {/* 서랍은 열어 둔 것의 상태(편집 중인 글, 목록)를 지키려고 화면을 떠나도 마운트를 유지한다 */}
        <div hidden={screen !== "drawer"}>
          <DrawerScreen
            commissionWaiting={commissionWaiting}
            onBack={() => goScreen("board")}
            onOpen={setDrawer}
            open={drawer}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      {screen === "board" ? (
        <SendDock
          canSend={dirty || dayKwh(form) > 0}
          onSend={() => void handleSave()}
          sending={isSaving}
        />
      ) : null}

      <MoreSheet
        busy={isSaving}
        commissionWaiting={commissionWaiting}
        onClose={() => setMore(false)}
        onPick={onMore}
        open={more}
      />

      {toast ? (
        <div className="ab-toast" role="status">
          {toast}
        </div>
      ) : null}

      {reward ? (
        <RewardOverlay onClose={() => setReward(null)} reward={reward} />
      ) : null}
    </main>
  );
}
