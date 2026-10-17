"use client";

/**
 * 마을 배전반 2.0 — 관리자 화면의 셸.
 *
 * 휴대폰에서 매일 쓰는 앱이 목표다. 그래서 한 화면 3단 배전반을 아래 탭 넷
 * (배전반 · 지시서 · 기록실 · 서랍)과 가운데 **꾹 눌러 송전** 버튼으로 나눴다.
 * 이 파일은 상태와 서버 왕복만 들고, 화면은 `_tabs/*` 가 그린다.
 *
 * 데이터 흐름은 예전 그대로다: 그날 `DailyActivity` 를 폼으로 불러와 고치고, 송전하면
 * `saveActivity` 로 하루 전체를 저장한 뒤 마을 상태를 다시 받는다. 새로 생긴 것은
 * 작업 지시서 하나 — 완료하면 서버가 그날 기록에 분량을 더하고, 같은 분량을 여기 폼에도
 * 더한다(`applyPlanMinutes`). 그래서 지시서를 끝낸 뒤 송전해도 값이 어긋나지 않는다.
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
  previewNpcMoods,
  previewUnlocks
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
  buildPredictedChanges,
  computeStats,
  normalizeForm,
  prettyDate,
  today
} from "./_lib/activity";
import {initialForm} from "./_lib/options";
import {dayKwh, powerSummary} from "./_lib/power";
import {buzz, sfx} from "./_lib/sfx";
import {usePlanItems} from "./_lib/usePlanItems";
import {BoardHud} from "./_shell/BoardHud";
import {TabBar, type BoardTab} from "./_shell/TabBar";
import {DrawerTab, type DrawerId} from "./_tabs/DrawerTab";
import {LogTab} from "./_tabs/LogTab";
import {OrdersTab, circuitLabel} from "./_tabs/OrdersTab";
import {TodayTab} from "./_tabs/TodayTab";

const TAB_KEY = "admin-board-tab";

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
  const [status, setStatus] = useState("오늘의 기록을 불러오는 중입니다.");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today());
  const [history, setHistory] = useState<DailyActivity[]>([]);
  const [reward, setReward] = useState<RewardInfo | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [aiUsage, setAiUsage] = useState<AiUsage | null>(null);
  const [tab, setTab] = useState<BoardTab>("today");
  const [drawer, setDrawer] = useState<DrawerId | null>(null);
  const [commissionWaiting, setCommissionWaiting] = useState(0);
  const [pulseToday, setPulseToday] = useState(0);
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
  const unlockPreview = useMemo(() => previewUnlocks(form), [form]);
  const predictedChanges = useMemo(() => buildPredictedChanges(form), [form]);

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

  /* 마지막에 보던 탭을 기억한다 — 휴대폰에서 다시 열면 보던 자리로. */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TAB_KEY) as BoardTab | null;
      if (saved && ["today", "orders", "log", "drawer"].includes(saved))
        setTab(saved);
    } catch {
      // 저장소가 막힌 브라우저 — 배전반부터 연다
    }
  }, []);

  function goTab(next: BoardTab) {
    setTab(next);
    window.scrollTo({top: 0});
    try {
      localStorage.setItem(TAB_KEY, next);
    } catch {
      // 기억 못 해도 화면은 그대로 된다
    }
  }

  /**
   * 잠금 판정 — **들어올 때마다 금고 문이 먼저다.**
   *
   * ## 왜 토큰이 있어도 잠그나
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
        // 백엔드 미응답 시엔 그냥 진행(로컬 개발 편의) — 저장 시점에 오류 표시됨
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
      setStatus("오늘의 기록을 불러왔습니다.");
    } catch {
      setStatus(
        "FastAPI 백엔드에 연결하지 못했습니다. 백엔드를 실행한 뒤 새로고침하세요."
      );
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
    setStatus(
      date === today()
        ? "오늘 기록을 편집 중입니다."
        : `${prettyDate(date)} 기록을 편집 중입니다.`
    );
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
    setStatus("기록을 저장하고 마을 상태를 다시 계산하는 중입니다.");

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
        if (gaps.length) {
          console.warn(
            [
              "[마을 미리보기] 서버 계산과 어긋납니다.",
              "villageLightPreview.ts 를 village_service.py 와 맞추세요:",
              ...gaps
            ].join(" | ")
          );
        }
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
      } else {
        say(`${prettyDate(selectedDate)} 기록을 송전했어요`);
      }
      setStatus(
        "기록이 저장되었습니다. 3D 마을 조명, NPC 상태, 장식이 갱신됐습니다."
      );
    } catch {
      setStatus("기록 저장에 실패했습니다. 백엔드 상태를 확인하세요.");
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

  /**
   * 레버를 내렸다 다시 올릴 때 되돌릴 값.
   *
   * 레버는 값의 거울이라 내리면 그 회로가 0 이 된다. 직전 값을 기억해 두지 않으면
   * 실수로 내린 사람이 숫자를 처음부터 다시 맞춰야 한다. 기억이 없을 때만 기본값으로 켠다.
   */
  const leverMemory = useRef<Record<string, number>>({});

  function throwMinuteLever(
    key: "study_minutes" | "coding_minutes",
    next: boolean,
    fallback: number
  ) {
    if (next) {
      updateForm({[key]: leverMemory.current[key] || fallback});
      return;
    }
    if (form[key] > 0) leverMemory.current[key] = form[key];
    updateForm({[key]: 0});
  }

  function throwProjectLever(projectId: string, next: boolean) {
    const memKey = `project:${projectId}`;
    if (next) {
      setProjectMinutes(projectId, leverMemory.current[memKey] || 30);
      return;
    }
    const current = form.project_minutes[projectId] ?? 0;
    if (current > 0) leverMemory.current[memKey] = current;
    setProjectMinutes(projectId, 0);
  }

  /** 지시서를 완료(또는 취소)했다 — 서버가 더한 분량을 폼에도 같이 더한다. */
  function applyPlanMinutes(item: PlanItem, delta: number) {
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
      setPulseToday(n => n + 1);
    }
    if (delta > 0)
      say(
        `${circuitLabel(item.circuit)} 회로 +${delta}분 · 배전반에 반영했어요`
      );
    else if (delta === 0 && item.done) say("완료! 회로 없는 지시서예요");
    // 서버가 그날 기록을 고쳤으니 기록실·송전 대기 계산도 새 값으로 맞춘다(폼은 건드리지 않는다)
    void fetchActivityHistory(140)
      .then(setHistory)
      .catch(() => undefined);
  }

  /* ── 지도 ↔ 회로 양방향 연결 ──
   * 회로에 손을 올리면 지도의 짝 건물에 조준 고리가 걸리고, 지도의 건물을 누르면 그
   * 건물을 켜는 회로로 스크롤한다. 짝은 `villageLightPreview.ts` 의 점수 표와 같은 id. */
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [pickNote, setPickNote] = useState<string | null>(null);
  const focusByBuilding = useRef<Map<string, () => void>>(new Map());

  // 프로젝트 카드는 "모두 보기"를 켜고 끌 때 다시 마운트되므로 **나중 등록이 이긴다**.
  // 광장은 운동 카드만 등록한다(코딩 카드는 등록하지 않음).
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

  const isPicked = useCallback(
    (ids: string[]) => ids.some(id => pickedIds.includes(id)),
    [pickedIds]
  );

  if (!authChecked) {
    return (
      <main className="admin-switchboard grid min-h-screen place-items-center text-[#8b94a0]">
        <p className="font-mono text-sm">불러오는 중…</p>
      </main>
    );
  }

  if (locked) {
    return <AdminGate onUnlocked={handleUnlocked} />;
  }

  return (
    <main className="admin-switchboard ab-app">
      <CommissionAlert
        onCount={setCommissionWaiting}
        onOpen={() => {
          setDrawer("commission");
          goTab("drawer");
        }}
      />
      <div className="ab-shell">
        <BoardHud
          busy={isSaving}
          date={selectedDate}
          hasRecord={Boolean(savedRow)}
          isToday={isToday}
          onCopyYesterday={copyYesterday}
          onGithubSync={() => void handleGithubSync()}
          onLock={lockBoard}
          onShift={delta => {
            sfx.tick();
            selectDate(addDays(selectedDate, delta));
          }}
          onToday={() => selectDate(today())}
          pending={pending}
          power={power}
          streak={stats.recordStreak}
        />

        <div hidden={tab !== "today"}>
          <TodayTab
            form={form}
            isPicked={isPicked}
            npcPreview={npcPreview}
            onMinuteLever={throwMinuteLever}
            onProjectLever={throwProjectLever}
            pickBuilding={pickBuilding}
            pickNote={pickNote}
            predictedChanges={predictedChanges}
            registerFocus={registerFocus}
            setProjectMinutes={setProjectMinutes}
            status={status}
            studyOverrides={studyOverrides}
            unlockPreview={unlockPreview}
            updateForm={updateForm}
          />
        </div>
        {tab === "orders" ? (
          <OrdersTab
            isToday={isToday}
            onCompleted={applyPlanMinutes}
            plan={plan}
          />
        ) : null}
        {tab === "log" ? (
          <LogTab
            aiUsage={aiUsage}
            form={form}
            history={history}
            historyByDate={historyByDate}
            onOpenDate={date => {
              selectDate(date);
              goTab("today");
            }}
            power={power}
            recordedDates={recordedDates}
            selectedDate={selectedDate}
            stats={stats}
          />
        ) : null}
        {/* 서랍은 열어 둔 것의 상태(편집 중인 글, 목록)를 지키려고 탭을 떠나도 마운트를 유지한다 */}
        <div hidden={tab !== "drawer"}>
          <DrawerTab
            commissionWaiting={commissionWaiting}
            onOpen={setDrawer}
            open={drawer}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      <TabBar
        canSend={dirty || dayKwh(form) > 0}
        drawerAlert={commissionWaiting}
        onSend={() => void handleSave()}
        onTab={goTab}
        ordersAlert={plan.items.some(i => !i.done && Boolean(i.due_label))}
        pulseToday={pulseToday}
        sending={isSaving}
        tab={tab}
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
