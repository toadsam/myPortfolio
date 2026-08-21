"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type * as React from "react";
import CommissionWorkboard from "@/components/admin/CommissionWorkboard";
import {projects} from "@/data/projects";
import {skills} from "@/data/skills";
import {
  createCodingTest,
  createCsNote,
  deleteCodingTest,
  deleteCommission,
  deleteCsNote,
  fetchActivityHistory,
  fetchAdminAuthStatus,
  fetchAdminOverview,
  fetchCodingTests,
  fetchCommissionDetail,
  fetchCommissions,
  fetchCsNotes,
  fetchVillageState,
  setAdminToken,
  loginAdmin,
  saveActivity,
  syncGithubActivity,
  updateCodingTest,
  updateCommissionStatus,
  updateCsNote
} from "@/lib/liveApi";
import {ApiError} from "@/lib/liveApi";
import {villageBuildings} from "@/lib/constants";
import {LiveVillagePreview} from "./_components/LiveVillagePreview";
import {CircuitRow} from "./_components/CircuitRow";
import {SwitchDrawer} from "./_components/SwitchDrawer";
import {useSwitchboardFx} from "./_components/useSwitchboardFx";
import {VaultDials} from "./_components/VaultDials";
import "./admin.css";
import {
  NpcReactions,
  SaveStamp,
  StreakStamps
} from "./_components/SwitchboardBits";
import {
  diffAgainstServer,
  previewBuildingScores,
  previewNpcMoods,
  previewUnlocks
} from "@/lib/villageLightPreview";
import type {
  ActivityInput,
  AiUsage,
  CodingTestLog,
  Commission,
  CommissionDetail,
  CommissionStatus,
  CsNote,
  DailyActivity,
  VillageState
} from "@/types/live";

const BUILDING_NAME: Record<string, string> = Object.fromEntries(
  villageBuildings.map(building => [building.id, building.name])
);

const UNLOCK_LABEL: Record<string, string> = {
  "training-statue": "🏋️ 운동 동상",
  "lab-beacon": "🔦 연구소 등대",
  "study-fountain": "⛲ 학습 분수",
  "deep-work-terminal": "💻 몰입 터미널"
};

const initialForm: ActivityInput = {
  github_commits: 0,
  github_repos: [],
  study_minutes: 0,
  study_topics: [],
  studied_tech: [],
  coding_minutes: 0,
  project_minutes: {},
  workout_done: false,
  workout_minutes: 0,
  workout_type: "",
  focus_score: 50,
  memo: "",
  mood: "steady"
};

const moodOptions = [
  {value: "steady", label: "차분함"},
  {value: "focused", label: "집중됨"},
  {value: "tired", label: "피곤함"},
  {value: "proud", label: "뿌듯함"}
];

const workoutTypes = ["헬스", "러닝", "산책", "스트레칭", "등산", "기타"];
const quickTopics = [
  "알고리즘",
  "React",
  "Next.js",
  "FastAPI",
  "Spring Boot",
  "Three.js",
  "Unity",
  "DB 설계"
];

export default function AdminPage() {
  const [form, setForm] = useState<ActivityInput>(initialForm);
  const [villageState, setVillageState] = useState<VillageState | null>(null);
  const [status, setStatus] = useState("오늘의 기록을 불러오는 중입니다.");
  const [isSaving, setIsSaving] = useState(false);
  const [repoInput, setRepoInput] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());
  const [history, setHistory] = useState<DailyActivity[]>([]);
  const [reward, setReward] = useState<{
    state: VillageState;
    date: string;
  } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [aiUsage, setAiUsage] = useState<AiUsage | null>(null);

  // 코딩테스트·CS 는 아래쪽 별도 패널이 저장한다. 이 폼으로는 못 움직이므로
  // 미리보기에서 0 으로 두면 실제로 켜져 있는 도장·서고가 꺼져 보인다.
  const [stampKey, setStampKey] = useState(0);
  const npcPreview = useMemo(() => previewNpcMoods(form), [form]);
  const unlockPreview = useMemo(() => previewUnlocks(form), [form]);
  /** 기록이 남아 있는 날짜 — 연속 도장이 읽는다 */
  const recordedDates = useMemo(
    () => new Set(history.map(h => h.date)),
    [history]
  );

  const studyOverrides = useMemo(() => {
    const out: Record<string, number> = {};
    for (const b of villageState?.buildings ?? []) {
      if (
        b.building_id === "study-codingtest" ||
        b.building_id === "study-cs"
      ) {
        out[b.building_id] = b.activity_score;
      }
    }
    return out;
  }, [villageState]);

  const isToday = selectedDate === today();
  const historyByDate = useMemo(() => {
    const map: Record<string, DailyActivity> = {};
    for (const item of history) map[item.date] = item;
    return map;
  }, [history]);
  const stats = useMemo(() => computeStats(history), [history]);

  /**
   * 잠금 판정 — **들어올 때마다 금고 문이 먼저다.**
   *
   * ## 왜 토큰이 있어도 잠그나
   *
   * 처음엔 저장된 토큰이 유효하면 그냥 통과시켰다. 그런데 토큰은 비밀번호가 아니라
   * `ADMIN_SECRET` 으로 서명되고 유효기간이 7일이라, **비밀번호를 바꿔도 이미 나간
   * 토큰은 그대로 살아 있다.** 그래서 6247 로 바꾼 뒤에도 배전반이 그냥 열렸다 —
   * 로직은 정직하게 동작했지만 원하는 동작이 아니었다.
   *
   * 이 화면의 입구는 다이얼이다. 그래서 인증이 켜져 있으면 토큰이 뭐든 일단 잠근다.
   * 대신 **토큰을 지우지는 않는다** — 지우면 다른 탭이나 갓생 섬이 같이 로그아웃된다.
   * 문을 다시 여는 건 네 자리를 돌리는 것뿐이고, 그게 이 화면이 원하는 의식이다.
   *
   * 인증이 꺼져 있으면(로컬에서 `ADMIN_PASSWORD` 를 비워 둔 경우) 문이 없다.
   * 잠글 것이 없는데 잠근 척하는 화면은 거짓말이다.
   */
  useEffect(() => {
    async function checkAuth() {
      try {
        const status = await fetchAdminAuthStatus();
        if (status.auth_enabled) {
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

  const totalProjectMinutes = useMemo(
    () =>
      Object.values(form.project_minutes).reduce(
        (sum, minutes) => sum + Number(minutes || 0),
        0
      ),
    [form.project_minutes]
  );

  const activeProjects = useMemo(
    () =>
      projects
        .map(project => ({
          project,
          minutes: form.project_minutes[project.id] ?? 0
        }))
        .filter(item => item.minutes > 0)
        .sort((a, b) => b.minutes - a.minutes),
    [form.project_minutes]
  );

  const predictedChanges = useMemo(() => buildPredictedChanges(form), [form]);

  function applyActivity(activity: DailyActivity | null) {
    if (!activity) {
      setForm(initialForm);
      return;
    }
    setForm({
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
    });
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
      applyActivity(hist.find(item => item.date === todayKey) ?? null);
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
    applyActivity(historyByDate[date] ?? null);
    setStatus(
      date === today()
        ? "오늘 기록을 편집 중입니다."
        : `${date} 기록을 편집 중입니다.`
    );
  }

  function shiftDate(delta: number) {
    selectDate(addDays(selectedDate, delta));
  }

  function copyYesterday() {
    const prev = historyByDate[addDays(selectedDate, -1)];
    if (!prev) {
      setStatus("어제 기록이 없어 복사할 내용이 없습니다.");
      return;
    }
    applyActivity(prev);
    setStatus("어제 기록을 불러왔습니다. 수정 후 저장하세요.");
  }

  async function handleSave(event?: React.FormEvent) {
    event?.preventDefault();
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
      setStampKey(k => k + 1);
      if (isToday) setReward({state, date: selectedDate});
      setStatus(
        "기록이 저장되었습니다. 3D 마을 조명, NPC 상태, 장식이 갱신됐습니다."
      );
    } catch {
      setStatus("기록 저장에 실패했습니다. 백엔드 상태를 확인하세요.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGithubSync() {
    setIsSaving(true);
    setStatus("GitHub 커밋 수를 동기화하는 중입니다.");

    try {
      const result = await syncGithubActivity();
      setForm(current => ({...current, github_commits: result.commits}));
      const state = await fetchVillageState();
      setVillageState(state);
      setStatus(
        result.warning ??
          `GitHub 커밋 ${result.commits}개를 오늘 기록에 반영했습니다.`
      );
    } catch {
      setStatus(
        "GitHub 동기화에 실패했습니다. 토큰 또는 백엔드 상태를 확인하세요."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function updateForm(patch: Partial<ActivityInput>) {
    setForm(current => ({...current, ...patch}));
  }

  /**
   * 레버를 내렸다 다시 올릴 때 되돌릴 값.
   *
   * 레버는 값의 거울이라 내리면 그 회로가 0 이 된다. 직전 값을 기억해 두지 않으면
   * 실수로 내린 사람이 숫자를 처음부터 다시 쳐야 한다 — 매일 여는 도구에서 그건
   * 그냥 손해다. 기억이 없을 때만 기본값으로 켠다.
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

  /** 프로젝트 회로는 값이 하나가 아니라 표라서, 표째로 기억했다 되돌린다. */
  const projectMemory = useRef<Record<string, number>>({});

  function throwProjectLever(next: boolean) {
    if (next) {
      const restored = Object.entries(projectMemory.current).filter(
        ([, minutes]) => minutes > 0
      );
      updateForm({
        project_minutes: restored.length
          ? Object.fromEntries(restored)
          : {[projects[0]?.id ?? "portfolio"]: 30}
      });
      return;
    }
    projectMemory.current = {...form.project_minutes};
    updateForm({project_minutes: {}});
  }

  /* ── 지도 ↔ 회로 양방향 연결 ──────────────────────────────────────────
   *
   * 이 화면의 논지는 "값을 넣으면 저 건물에 불이 켜진다"인데, 그 짝을 화살표나
   * 설명으로 알려 주면 아무도 안 읽는다. 손으로 확인시킨다:
   *
   * - 회로에 마우스를 올리면 → 지도의 짝 건물에 조준 고리가 걸린다
   * - 지도의 건물을 누르면   → 그 건물을 켜는 회로로 스크롤 + 포커스
   *
   * 짝은 `villageLightPreview.ts` 의 점수 표와 같은 id 를 쓴다. 거기가 원본이라
   * 규칙이 바뀌어도 한쪽만 어긋나는 일이 없다.
   */
  const [hoverIds, setHoverIds] = useState<string[] | null>(null);
  const [hoverName, setHoverName] = useState<string | null>(null);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [pickNote, setPickNote] = useState<string | null>(null);

  // 배전반이 살아 있게 만드는 연출들(유휴 방전·조명 추적·파문·자석 버튼).
  // 잠금이 풀린 뒤에만 건다 — 금고 문에는 회로가 없다.
  useSwitchboardFx(!locked);

  // 건물 id → 그 건물을 켜는 회로를 포커스하는 함수. 렌더마다 다시 만들면
  // CircuitRow 의 등록 effect 가 매번 돌아서 ref 로 들고 있는다.
  const focusByBuilding = useRef<Map<string, () => void>>(new Map());

  const registerFocus = useCallback(
    (buildingIds: string[], focus: () => void) => {
      for (const id of buildingIds) {
        // 먼저 등록한 회로가 그 건물의 주인이다. 프로젝트 건물은 1:1 이라
        // 겹치지 않고, 광장처럼 여럿이 켜는 건물만 첫 회로로 간다.
        if (!focusByBuilding.current.has(id)) {
          focusByBuilding.current.set(id, focus);
        }
      }
    },
    []
  );

  const pickBuilding = useCallback((buildingId: string) => {
    const focus = focusByBuilding.current.get(buildingId);
    if (!focus) {
      // 모든 건물이 회로를 갖는 건 아니다 — 경력·서고 건물은 다른 기록에서
      // 켜진다. 아무 반응이 없으면 고장으로 보이므로 왜 안 되는지 말해 준다.
      setPickNote(
        "이 건물은 여기 회로로 켜지지 않아요 (다른 기록에서 밝아집니다)"
      );
      window.setTimeout(() => setPickNote(null), 2600);
      return;
    }
    setPickedIds([buildingId]);
    focus();
    // 강조는 잠깐만 — 계속 켜 두면 다음에 뭘 눌렀는지 헷갈린다
    window.setTimeout(() => setPickedIds([]), 1600);
  }, []);

  const isPicked = useCallback(
    (ids: string[]) => ids.some(id => pickedIds.includes(id)),
    [pickedIds]
  );

  /**
   * 저장에 성공하면 살아 있는 회로가 순서대로 통전하고, 저장 버튼에서 불꽃이
   * 터진다. `stampKey` 는 저장 성공에만 오르므로 실패했을 땐 아무 일도 없다 —
   * 연출이 결과를 헷갈리게 만들면 그건 장식이 아니라 버그다.
   */
  useEffect(() => {
    if (!stampKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = document.querySelectorAll<HTMLElement>(".sw-row.is-live");
    const timers: number[] = [];
    rows.forEach((row, index) => {
      timers.push(
        window.setTimeout(() => {
          row.classList.add("is-surging");
          timers.push(
            window.setTimeout(() => row.classList.remove("is-surging"), 520)
          );
        }, index * 70)
      );
    });
    burstFrom(document.querySelector<HTMLElement>(".sw-save-main"));
    return () => timers.forEach(t => window.clearTimeout(t));
  }, [stampKey]);

  function setProjectMinutes(projectId: string, minutes: number) {
    setForm(current => ({
      ...current,
      project_minutes: {
        ...current.project_minutes,
        [projectId]: Math.max(0, minutes)
      }
    }));
  }

  function addRepo() {
    const next = repoInput.trim();
    if (!next) return;
    updateForm({github_repos: unique([...form.github_repos, next])});
    setRepoInput("");
  }

  function addTopic() {
    const next = topicInput.trim();
    if (!next) return;
    updateForm({
      study_topics: unique([...form.study_topics, next]),
      studied_tech: unique([...form.studied_tech, next])
    });
    setTopicInput("");
  }

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
    <main className="admin-switchboard sw-board text-[#e8edf2]">
      {/* ── 모선: 화면 위를 가로지르는 구리 띠 ─────────────────────────── */}
      <header className="sw-busbar">
        <div className="flex min-w-0 items-baseline gap-4">
          <span className="font-mono text-sm font-black uppercase tracking-[0.22em] text-[#e2c078]">
            Village Control Board
          </span>
          <span className="hidden truncate text-xs text-[#6b7580] xl:inline">
            레버를 올리면 회로가 열리고, 오른쪽 지도에 불이 들어옵니다
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded border border-[#38414d] bg-[#12161c] p-1">
            <button
              aria-label="이전 날"
              className="step-button"
              onClick={() => shiftDate(-1)}
              type="button"
            >
              ◀
            </button>
            <input
              className="field w-[142px] text-center"
              max={today()}
              onChange={event => selectDate(event.target.value || today())}
              type="date"
              value={selectedDate}
            />
            <button
              aria-label="다음 날"
              className="step-button disabled:opacity-30"
              disabled={isToday}
              onClick={() => shiftDate(1)}
              type="button"
            >
              ▶
            </button>
          </div>
          {!isToday ? (
            <button
              className="sub-button"
              onClick={() => selectDate(today())}
              type="button"
            >
              오늘로
            </button>
          ) : null}
          <button className="sub-button" onClick={copyYesterday} type="button">
            어제 복사
          </button>
          <span className="rounded-full border border-[#ff9d38]/25 px-3 py-1 font-mono text-[11px] text-[#e2c078]">
            {isToday ? "오늘" : prettyDate(selectedDate)}
            {historyByDate[selectedDate] ? " · 기록 있음" : " · 빈 날"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="sub-button"
            disabled={isSaving}
            onClick={handleGithubSync}
            type="button"
          >
            GitHub 동기화
          </button>
          <a className="sub-button" href="/">
            마을 보기
          </a>
          <button className="sub-button" onClick={lockBoard} type="button">
            잠그기
          </button>
          <button
            className="rounded bg-[#ff9d38] px-5 py-2.5 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#12161c] transition hover:bg-[#ffb15e] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={isSaving}
            form="daily-form"
            type="submit"
          >
            기록 저장
          </button>
        </div>
      </header>

      {/* ── 계기 레일: 매일 보지만 조작하지 않는 것들 ─────────────────── */}
      <aside className="sw-rail">
        <CommissionAlert />

        <span className="sw-rail-label">Streak</span>
        <div className="grid grid-cols-3 gap-2">
          <Metric label="연속" value={`${stats.recordStreak}일`} />
          <Metric label="운동" value={`${stats.workoutStreak}일`} />
          <Metric label="주 코딩" value={`${stats.weekCoding}분`} />
        </div>
        <div className="mt-4">
          <StreakStamps dates={recordedDates} />
        </div>
        <div className="mt-4">
          <ActivityCalendar
            byDate={historyByDate}
            onPick={selectDate}
            selectedDate={selectedDate}
          />
        </div>

        <span className="sw-rail-label mt-8">Daily Rings</span>
        <GoalRings
          coding={form.coding_minutes}
          study={form.study_minutes}
          workout={form.workout_done ? form.workout_minutes : 0}
        />

        {aiUsage ? (
          <>
            <span className="sw-rail-label mt-8">AI Usage</span>
            <AiUsageBar usage={aiUsage} />
          </>
        ) : null}

        <span className="sw-rail-label mt-8">오늘 열리는 장식</span>
        {unlockPreview.length ? (
          <ul className="grid gap-1.5 text-xs text-[#e2c078]">
            {unlockPreview.map(item => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs leading-5 text-[#5b646e]">
            조건을 채우면 여기에 나타납니다.
          </p>
        )}
      </aside>

      {/* ── 본체: 회로들 ──────────────────────────────────────────────── */}
      <div className="sw-main">
        <form id="daily-form" onSubmit={handleSave}>
          {/* 컨디션은 회로가 아니다 — 켜고 끄는 게 아니라 늘 붙어 있는 계기다.
              그래서 레버 없이 맨 위 스트립으로 둔다. */}
          <div className="sw-strip">
            <label className="grid gap-2">
              <span className="field-label">오늘 기분</span>
              <select
                className="field"
                onChange={event => updateForm({mood: event.target.value})}
                value={form.mood}
              >
                {moodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="field-label">
                집중도 <b className="text-[#ff9d38]">{form.focus_score}%</b>
              </span>
              <input
                className="w-full accent-[#ff9d38]"
                max={100}
                min={0}
                onChange={event =>
                  updateForm({focus_score: Number(event.target.value)})
                }
                type="range"
                value={form.focus_score}
              />
            </label>
            <label className="grid gap-2">
              <span className="field-label">오늘 한 줄</span>
              <input
                className="field"
                onChange={event => updateForm({memo: event.target.value})}
                placeholder="예: FestFlow SSE 흐름을 정리하고 운동까지 완료"
                value={form.memo}
              />
            </label>
          </div>

          <p className="sw-rail-label mt-9">Main Circuits</p>
          <div>
            <CircuitRow
              buildingIds={PLAZA_ONLY}
              extras={
                <label className="flex items-center gap-3">
                  <span className="field-label">운동 종류</span>
                  <select
                    className="field max-w-[220px]"
                    disabled={!form.workout_done}
                    onChange={event =>
                      updateForm({workout_type: event.target.value})
                    }
                    value={form.workout_type}
                  >
                    <option value="">선택 안 함</option>
                    {workoutTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              }
              live={form.workout_done}
              max={180}
              name="운동"
              note="중앙 광장과 가이드 NPC 상태에 반영됩니다"
              onChange={value =>
                updateForm({workout_minutes: value, workout_done: value > 0})
              }
              onHover={setHoverIds}
              onToggle={next =>
                updateForm({
                  workout_done: next,
                  workout_minutes: next ? form.workout_minutes || 30 : 0
                })
              }
              picked={isPicked(PLAZA_ONLY)}
              registerFocus={registerFocus}
              value={form.workout_minutes}
            />

            <CircuitRow
              buildingIds={SKILL_BUILDINGS}
              extras={
                <div className="grid gap-2">
                  <div className="flex gap-2">
                    <input
                      className="field min-w-0 flex-1"
                      onChange={event => setTopicInput(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTopic();
                        }
                      }}
                      placeholder="공부한 주제/기술 — 예: React Query, DB Index"
                      value={topicInput}
                    />
                    <button
                      className="sub-button"
                      onClick={addTopic}
                      type="button"
                    >
                      추가
                    </button>
                  </div>
                  <TagCloud
                    items={unique([...quickTopics, ...form.study_topics])}
                    onToggle={item =>
                      updateForm({
                        studied_tech: toggleValue(form.studied_tech, item),
                        study_topics: unique([...form.study_topics, item])
                      })
                    }
                    selected={form.studied_tech}
                  />
                </div>
              }
              live={form.study_minutes > 0}
              max={480}
              name="공부"
              note="기술 건물 다섯 채의 조명을 함께 올립니다"
              onChange={value => updateForm({study_minutes: value})}
              onHover={setHoverIds}
              onToggle={next => throwMinuteLever("study_minutes", next, 30)}
              picked={isPicked(SKILL_BUILDINGS)}
              registerFocus={registerFocus}
              value={form.study_minutes}
            />

            <CircuitRow
              buildingIds={PLAZA_ONLY}
              extras={
                <div className="grid gap-3 lg:grid-cols-[200px_minmax(0,1fr)]">
                  <label className="flex items-center gap-3">
                    <span className="field-label whitespace-nowrap">커밋</span>
                    <input
                      className="field w-full text-center"
                      min={0}
                      onChange={event =>
                        updateForm({
                          github_commits: Math.max(
                            0,
                            Number(event.target.value) || 0
                          )
                        })
                      }
                      type="number"
                      value={form.github_commits}
                    />
                  </label>
                  <div className="grid gap-2">
                    <div className="flex gap-2">
                      <input
                        className="field min-w-0 flex-1"
                        onChange={event => setRepoInput(event.target.value)}
                        onKeyDown={event => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addRepo();
                          }
                        }}
                        placeholder="오늘 만진 레포 — 예: toadsam/FestFlow"
                        value={repoInput}
                      />
                      <button
                        className="sub-button"
                        onClick={addRepo}
                        type="button"
                      >
                        추가
                      </button>
                    </div>
                    {form.github_repos.length ? (
                      <div className="flex flex-wrap gap-2">
                        {form.github_repos.map(repo => (
                          <Chip
                            key={repo}
                            onRemove={() =>
                              updateForm({
                                github_repos: form.github_repos.filter(
                                  item => item !== repo
                                )
                              })
                            }
                          >
                            {repo}
                          </Chip>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              }
              live={form.coding_minutes > 0}
              max={600}
              name="코딩"
              note="레포 이름이 프로젝트와 겹치면 그 건물도 함께 밝아집니다"
              onChange={value => updateForm({coding_minutes: value})}
              onHover={setHoverIds}
              onToggle={next => throwMinuteLever("coding_minutes", next, 60)}
              picked={isPicked(PLAZA_ONLY)}
              registerFocus={registerFocus}
              value={form.coding_minutes}
            />
          </div>

          <div className="mt-9 flex items-baseline justify-between">
            <p className="sw-rail-label">Project Circuits</p>
            <span className="font-mono text-xs text-[#6b7580]">
              합계 <b className="text-[#ff9d38]">{totalProjectMinutes}</b>분
            </span>
          </div>
          <div>
            {projects.map(project => {
              const minutes = form.project_minutes[project.id] ?? 0;
              const ids = projectBuildingIds[project.id];
              return (
                <CircuitRow
                  buildingIds={ids}
                  key={project.id}
                  live={minutes > 0}
                  max={300}
                  name={project.title}
                  note={project.description}
                  onChange={value => setProjectMinutes(project.id, value)}
                  onHover={setHoverIds}
                  picked={isPicked(ids)}
                  registerFocus={registerFocus}
                  value={minutes}
                />
              );
            })}
          </div>
        </form>
      </div>

      {/* ── 지도 기둥: 값을 넣는 내내 보인다 ──────────────────────────── */}
      <aside className="sw-pillar">
        <div className="sw-pillar-head">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#e2c078]">
            Village Live Feed
          </span>
          <span
            className={`truncate font-mono text-[11px] ${
              pickNote ? "text-[#e07a5f]" : "text-[#6b7580]"
            }`}
          >
            {pickNote ?? hoverName ?? "저장 전 미리보기"}
          </span>
        </div>
        <div className="sw-pillar-body">
          {/* 숫자를 만지는 동안 마을에 불이 들어온다. 건물을 누르면 그 건물을
              켜는 회로로 데려간다 — 지도는 그림이 아니라 목차이기도 하다. */}
          <LiveVillagePreview
            form={form}
            highlightIds={hoverIds ?? undefined}
            onHoverBuilding={setHoverName}
            onPickBuilding={pickBuilding}
            overrides={studyOverrides}
            study={{codingToday: 0, codingTotal: 0, csToday: 0, csTotal: 0}}
          />

          <NpcReactions npcs={npcPreview} />

          <div className="relative rounded border border-[#38414d] bg-[#12161c] p-3">
            <SaveStamp date={selectedDate} stampKey={stampKey} />
            <p className="text-xs leading-6 text-[#9aa4b0]">{status}</p>
            <button
              className="sw-save-main mt-3 w-full rounded bg-[#ff9d38] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#12161c] transition hover:bg-[#ffb15e] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={isSaving}
              form="daily-form"
              type="submit"
            >
              기록 저장하고 마을 갱신
            </button>
          </div>

          <div>
            <span className="sw-rail-label">저장하면 바뀌는 것</span>
            <ul className="grid gap-1.5 text-xs leading-5 text-[#9aa4b0]">
              {predictedChanges.map(change => (
                <li className="flex gap-2" key={change}>
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#ff9d38]" />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="sw-rail-label">현재 마을 상태</span>
            {villageState ? (
              <div className="grid gap-2">
                <p className="text-xs leading-5 text-[#9aa4b0]">
                  {villageState.summary}
                </p>
                {villageState.buildings
                  .filter(building => building.activity_score > 0)
                  .sort((a, b) => b.activity_score - a.activity_score)
                  .slice(0, 5)
                  .map(building => (
                    <div
                      className="flex items-center justify-between gap-3 rounded border border-[#38414d] bg-[#12161c] px-2.5 py-1.5"
                      key={building.building_id}
                    >
                      <span className="truncate font-mono text-[11px] text-[#8b94a0]">
                        {building.building_id}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-[#e2c078]">
                        {building.light_level}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs leading-5 text-[#5b646e]">
                저장 후 마을 상태가 표시됩니다.
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* ── 서랍 ──────────────────────────────────────────────────────── */}
      <footer className="sw-drawer">
        <SwitchDrawer
          panels={[
            {id: "commission", label: "의뢰 접수함", node: <CommissionAdmin />},
            {
              id: "coding",
              label: "코딩테스트",
              node: <CodingTestAdmin defaultDate={selectedDate} />
            },
            {
              id: "cs",
              label: "CS 노트",
              node: <CsNoteAdmin defaultDate={selectedDate} />
            }
          ]}
        />
      </footer>

      {reward ? (
        <RewardCard onClose={() => setReward(null)} reward={reward} />
      ) : null}
    </main>
  );
}

function groupByDate<T>(
  items: T[],
  dateOf: (item: T) => string
): [string, T[]][] {
  const order: string[] = [];
  const map: Record<string, T[]> = {};
  for (const item of items) {
    const key = dateOf(item);
    if (!map[key]) {
      map[key] = [];
      order.push(key);
    }
    map[key].push(item);
  }
  return order.map(key => [key, map[key]!]);
}

function matchesQuery(query: string, fields: (string | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some(field => (field ?? "").toLowerCase().includes(q));
}

/* ─────────────────────────── 새 의뢰 알림 ───────────────────────────
 *
 * 접수함 안에 「새 접수 N건」 칩이 있긴 했지만, 이 페이지가 2,400줄이라
 * 스크롤해서 그 패널까지 가야 보였다. 새 의뢰가 왔다는 건 페이지를 열자마자
 * 알아야 하는 정보라 맨 위로 끌어올린다.
 *
 * **세는 대상은 "새 접수"가 아니라 "내 결재를 기다리는 것" 전부다.**
 * 게이트가 3단이라 의뢰 하나가 나를 세 번 부른다 — 접수 직후, 기획 검수,
 * 산출물 검수. 접수만 세면 나머지 둘에서 조용히 멈춰 있게 된다.
 * 상태 → 게이트 대응은 backend/app/agents/gate.py 의 _GATE_OPEN_AT 이 원본이다.
 *
 * 한계 — 이건 **관리자 페이지를 열어 놨을 때만** 동작한다. 자는 동안 들어온
 * 의뢰는 다음에 페이지를 열 때 알게 된다. 자리를 비운 사이에도 알려면 외부
 * 채널(메일·메신저)이 따로 필요하다. 대신 탭 제목에 건수를 박아 두어서,
 * 탭을 켜 놓고 다른 일을 하는 동안에도 눈에 걸리게 했다.
 */

const WAITING_ON_ME: Partial<Record<CommissionStatus, string>> = {
  received: "새 접수 — 검토 시작",
  reviewing: "검토 중 — 기획 승인 대기",
  brief_review: "기획안 검수 대기",
  artifact_review: "산출물 검수 대기"
};

/** 폴링 간격. 의뢰는 하루 몇 건이라 자주 볼 이유가 없다. */
const POLL_MS = 60_000;

function CommissionAlert() {
  const [items, setItems] = useState<Commission[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    async function poll() {
      try {
        const list = await fetchCommissions();
        if (alive) {
          setItems(list);
          setFailed(false);
        }
      } catch {
        // 백엔드가 꺼져 있어도 관리자 페이지의 나머지는 써야 하므로
        // 조용히 접어 둔다. 배너 자리에 빨간 에러를 띄우면 매번 거슬린다.
        if (alive) setFailed(true);
      }
    }

    void poll();
    const timer = setInterval(() => void poll(), POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const waiting = items.filter(item => WAITING_ON_ME[item.status]);

  // 탭 제목에 건수를 박는다 — 다른 탭을 보고 있어도 눈에 걸린다.
  useEffect(() => {
    const base = "관리자 · Developer's City";
    document.title = waiting.length ? `(${waiting.length}) ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [waiting.length]);

  if (failed || waiting.length === 0) return null;

  return (
    <div className="border-b border-[#ffb15e]/40 bg-[#2a2118]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffb15e] opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ffb15e]" />
        </span>
        <strong className="text-sm font-black text-[#ff9d38]">
          내 처리를 기다리는 의뢰 {waiting.length}건
        </strong>
        <span className="flex flex-wrap gap-2">
          {waiting.map(item => (
            <a
              className="rounded-full border border-[#ffb15e]/40 bg-[#1a2027] px-3 py-1 font-mono text-[11px] font-black text-[#ff9d38] transition hover:bg-[#2a2118]"
              href="#commission-inbox"
              key={item.id}
            >
              {item.public_id} · {WAITING_ON_ME[item.status]}
            </a>
          ))}
        </span>
      </div>
    </div>
  );
}

/** 의뢰 공방 접수함 — 외부인이 남긴 유일한 데이터라 삭제는 되물어보고 진행한다. */
function CommissionAdmin() {
  const [items, setItems] = useState<Commission[]>([]);
  const [detail, setDetail] = useState<CommissionDetail | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setItems(await fetchCommissions());
      setStatus("");
    } catch {
      setStatus("의뢰 목록을 불러오지 못했습니다. 백엔드를 확인하세요.");
    }
  }

  async function toggle(commission: Commission) {
    if (openId === commission.id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(commission.id);
    setDetail(null);
    try {
      const loaded = await fetchCommissionDetail(commission.id);
      setDetail(loaded);
      setNote(loaded.admin_note);
    } catch {
      setStatus("상세 내용을 불러오지 못했습니다.");
    }
  }

  async function changeStatus(
    commission: Commission,
    next: CommissionStatus,
    adminNote: string
  ) {
    setBusy(true);
    try {
      const updated = await updateCommissionStatus(commission.id, {
        status: next,
        admin_note: adminNote
      });
      setItems(list =>
        list.map(item => (item.id === updated.id ? updated : item))
      );
      if (detail?.id === updated.id) setDetail({...detail, ...updated});
      setStatus("저장했습니다.");
    } catch {
      setStatus("상태를 저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(commission: Commission) {
    const ok = window.confirm(
      `${commission.public_id} 의뢰를 삭제할까요? 상담 대화 기록도 함께 지워지고 되돌릴 수 없습니다.`
    );
    if (!ok) return;

    setBusy(true);
    try {
      await deleteCommission(commission.id);
      setItems(list => list.filter(item => item.id !== commission.id));
      if (openId === commission.id) {
        setOpenId(null);
        setDetail(null);
      }
      setStatus("삭제했습니다.");
    } catch {
      setStatus("삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  // 배너(CommissionAlert)와 **같은 기준**으로 센다. 예전엔 여기만 "received"
  // 를 세서, 위 배너가 "1건 기다림"이라는데 이 칩은 "새 접수 0건"이라고 하는
  // 모순이 났다 — 게이트2·3 대기는 접수 상태가 아니기 때문이다.
  const pending = items.filter(item => WAITING_ON_ME[item.status]).length;

  return (
    <div id="commission-inbox" className="scroll-mt-8">
      <Panel title="의뢰 접수함" kicker="Commission Atelier">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#ffb15e]/30 bg-[#2a2118] px-3 py-1.5 font-mono text-xs font-black text-[#ff9d38]">
            내 처리 대기 {pending}건 · 전체 {items.length}건
          </span>
          <button
            className="sub-button"
            onClick={() => void load()}
            type="button"
          >
            새로고침
          </button>
          {status ? (
            <span className="text-xs text-[#8b94a0]">{status}</span>
          ) : null}
        </div>

        {items.length === 0 ? (
          <p className="rounded-lg border border-[#38414d] bg-[#232b34] p-4 text-sm leading-6 text-[#6b7580]">
            아직 접수된 의뢰가 없습니다. 마을의 &ldquo;제작 의뢰&rdquo; 버튼으로
            방문자가 접수하면 여기에 쌓입니다.
          </p>
        ) : (
          <div className="grid gap-2">
            {items.map(item => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-[#232b34] bg-[#232b34] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => void toggle(item)}
                      type="button"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-black text-[#ff9d38]">
                          {item.public_id}
                        </span>
                        <CommissionStatusBadge status={item.status} />
                        <span className="font-mono text-[11px] text-[#6b7580]">
                          {prettyDate(item.created_at.slice(0, 10))}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-bold text-[#e8edf2]">
                        {item.site_type ? `[${item.site_type}] ` : ""}
                        {item.summary || "(내용 없음)"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#6b7580]">
                        {formatWon(item.estimate_min)} ~{" "}
                        {formatWon(item.estimate_max)} · {item.weeks_min}~
                        {item.weeks_max}주 · {item.contact_email}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        className="rounded-md border border-[#38414d] px-2 py-1 text-xs text-[#8b94a0] transition hover:border-[#ffb15e]/50 hover:text-[#ff9d38]"
                        onClick={() => void toggle(item)}
                        type="button"
                      >
                        {isOpen ? "접기" : "상세"}
                      </button>
                      <button
                        className="rounded-md border border-[#38414d] px-2 py-1 text-xs text-[#8b94a0] transition hover:border-[#c2492e]/50 hover:text-[#e07a5f]"
                        onClick={() => void remove(item)}
                        type="button"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {isOpen ? (
                    detail && detail.id === item.id ? (
                      <div className="mt-3 border-t border-[#38414d] pt-3">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="grid gap-3">
                            <DetailRow label="연락처">
                              {[
                                detail.contact_name,
                                detail.contact_email,
                                detail.contact_phone,
                                detail.org
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </DetailRow>
                            <DetailRow label="요청 내용">
                              {detail.summary || "-"}
                            </DetailRow>
                            <DetailRow label="요구사항">
                              <RequirementDump value={detail.requirements} />
                            </DetailRow>
                            <DetailRow label="일정 / 예산">
                              {`${detail.deadline_hint || "-"} / ${
                                detail.budget_hint || "-"
                              }`}
                            </DetailRow>
                            <DetailRow label="견적 근거">
                              {detail.estimate_reason || "-"}
                            </DetailRow>

                            <DepthPanel detail={detail} />

                            <div className="grid gap-2 rounded-lg border border-[#38414d] bg-[#1a2027] p-3">
                              <LabeledField label="진행 상태">
                                <select
                                  className="field"
                                  value={detail.status}
                                  disabled={busy}
                                  onChange={e =>
                                    void changeStatus(
                                      item,
                                      e.target.value as CommissionStatus,
                                      note
                                    )
                                  }
                                >
                                  {COMMISSION_STATUS_OPTIONS.map(option => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </LabeledField>
                              <LabeledField label="관리자 메모">
                                <textarea
                                  className="field min-h-[80px]"
                                  value={note}
                                  onChange={e => setNote(e.target.value)}
                                  placeholder="연락 예정일, 판단, 거절 사유 등"
                                />
                              </LabeledField>
                              <button
                                className="rounded-lg bg-[#ffb15e] px-4 py-2.5 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#0d1116] transition hover:bg-[#e2c078] disabled:opacity-45"
                                disabled={busy}
                                onClick={() =>
                                  void changeStatus(item, detail.status, note)
                                }
                                type="button"
                              >
                                메모 저장
                              </button>
                            </div>
                          </div>

                          <div>
                            <div>
                              <p className="mb-2 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#ff9d38]/70">
                                상담 대화 기록
                              </p>
                              {detail.messages.length === 0 ? (
                                <p className="text-sm text-[#6b7580]">
                                  상담 없이 바로 접수된 건입니다.
                                </p>
                              ) : (
                                <div className="grid max-h-[420px] gap-1.5 overflow-y-auto rounded-lg border border-[#38414d] bg-[#1a2027] p-3">
                                  {detail.messages.map(message => (
                                    <p
                                      key={message.id}
                                      className={
                                        message.role === "visitor"
                                          ? "rounded-md bg-[#2a2118] px-2.5 py-1.5 text-xs leading-5 text-[#c9a55f]"
                                          : "rounded-md bg-[#232b34] px-2.5 py-1.5 text-xs leading-5 text-[#9aa4b0]"
                                      }
                                    >
                                      <span className="mr-1.5 font-mono text-[10px] font-black opacity-60">
                                        {message.role === "visitor"
                                          ? "방문자"
                                          : "도안"}
                                      </span>
                                      {message.content}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3단계 — 게이트와 직군별 작업.
                          2단 그리드 밖에 두어 **전체 폭**을 쓴다: HTML 시안을
                          좁은 칸에서 보면 태블릿 브레이크포인트만 보여 검수가 안 된다. */}
                        <div className="mt-4 border-t border-[#38414d] pt-4">
                          <p className="mb-2 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#ff9d38]/70">
                            작업 지시 · 검수
                          </p>
                          <CommissionWorkboard
                            commissionId={detail.id}
                            publicId={detail.public_id}
                            onStatusChange={() => void load()}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 border-t border-[#38414d] pt-3 text-sm text-[#6b7580]">
                        불러오는 중…
                      </p>
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

const COMMISSION_STATUS_OPTIONS: {value: CommissionStatus; label: string}[] = [
  {value: "received", label: "접수됨"},
  {value: "reviewing", label: "검토중"},
  {value: "briefing", label: "기획 작업중"},
  {value: "brief_review", label: "브리프 검수 대기"},
  {value: "briefed", label: "브리프 확정"},
  {value: "in_progress", label: "제작중"},
  {value: "artifact_review", label: "산출물 검수 대기"},
  {value: "delivered", label: "전달 완료"},
  {value: "rejected", label: "반려"}
];

const COMMISSION_STATUS_STYLE: Record<CommissionStatus, string> = {
  received: "border-[#ffb15e]/40 bg-[#2a2118] text-[#ff9d38]",
  reviewing: "border-[#ff9d38]/30 bg-[#2a2118] text-[#e2c078]",
  briefing: "border-[#9b8ac4]/40 bg-[#1a2027] text-[#8877b8]",
  // 검수 대기는 "내가 움직여야 하는 상태"라 눈에 띄게 — 여기서 멈춰 있다는 신호다
  brief_review: "border-[#ffb15e]/50 bg-[#2a2118] text-[#c9a55f]",
  briefed: "border-[#9b8ac4]/40 bg-[#1a2027] text-[#8877b8]",
  in_progress: "border-[#9b8ac4]/40 bg-[#1a2027] text-[#8877b8]",
  artifact_review: "border-[#ffb15e]/50 bg-[#2a2118] text-[#c9a55f]",
  delivered: "border-[#6fae8a]/35 bg-[#22301f] text-[#4d8a6a]",
  rejected: "border-[#38414d] bg-[#232b34] text-[#6b7580]"
};

function CommissionStatusBadge({status}: {status: CommissionStatus}) {
  const label =
    COMMISSION_STATUS_OPTIONS.find(option => option.value === status)?.label ??
    status;
  return (
    <span
      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-black ${
        COMMISSION_STATUS_STYLE[status] ?? COMMISSION_STATUS_STYLE.rejected
      }`}
    >
      {label}
    </span>
  );
}

/**
 * 심화 문답 패널 — 손님에게 보낼 링크와, 그렇게 받아낸 제작 정보.
 *
 * 접수 원문과 **일부러 갈라 둔다.** 접수 때 들은 것과 나중에 받아낸 것은
 * 확실성이 다르고(후자가 더 확정적이다), 섞어 두면 어느 쪽을 믿고 만들지가
 * 흐려진다. 여기 값이 차 있을수록 실제로 만들 때 되물을 일이 줄어든다.
 */
function DepthPanel({detail}: {detail: CommissionDetail}) {
  const [copied, setCopied] = useState(false);
  const answers = Object.entries(detail.depth_answers ?? {});

  const link =
    typeof window !== "undefined" && detail.track_path
      ? `${window.location.origin}${detail.track_path}`
      : detail.track_path;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-2 rounded-lg border border-[#38414d] bg-[#1a2027] p-3">
      <p className="font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#ff9d38]/70">
        제작 정보 (심화 문답)
      </p>

      {answers.length ? (
        <dl className="grid gap-1.5">
          {answers.map(([label, value]) => (
            <div key={label} className="flex gap-2 text-xs leading-5">
              <dt className="w-20 shrink-0 font-bold text-[#ff9d38]">
                {label}
              </dt>
              <dd className="flex-1 text-[#9aa4b0]">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-xs leading-5 text-[#6b7580]">
          아직 받은 게 없습니다. 아래 링크를 회신 메일에 붙여 보내면 도안이 대신
          여쭤봅니다 — 운영·수정 주체, 콘텐츠 준비, 성공 기준, 기존 자산.
        </p>
      )}

      {detail.track_path ? (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md bg-[#232b34] px-2 py-1.5 font-mono text-[11px] text-[#9aa4b0]">
            {link}
          </code>
          <button
            className="sub-button"
            onClick={() => void copy()}
            type="button"
          >
            {copied ? "복사됨" : "링크 복사"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#6b7580]">
        {label}
      </p>
      <div className="mt-1 text-sm leading-6 text-[#e8edf2]">{children}</div>
    </div>
  );
}

function RequirementDump({value}: {value: Record<string, unknown>}) {
  const entries = Object.entries(value).filter(([, item]) =>
    Array.isArray(item) ? item.length > 0 : !!item
  );
  if (entries.length === 0) return <>-</>;

  const LABELS: Record<string, string> = {
    pages: "페이지",
    features: "기능",
    tone: "분위기",
    references: "참고"
  };

  return (
    <ul className="grid gap-0.5">
      {entries.map(([key, item]) => (
        <li key={key}>
          <span className="text-[#6b7580]">{LABELS[key] ?? key}</span>{" "}
          {Array.isArray(item) ? item.join(", ") : String(item)}
        </li>
      ))}
    </ul>
  );
}

function formatWon(value: number): string {
  if (!value) return "-";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  return `${Math.round(value / 10_000).toLocaleString()}만`;
}

function CodingTestAdmin({defaultDate}: {defaultDate: string}) {
  const emptyOf = (date: string) => ({
    solved_date: date,
    platform: "백준",
    problem_no: "",
    title: "",
    difficulty: "",
    language: "Python",
    url: "",
    code: "",
    approach: ""
  });
  const [form, setForm] = useState(emptyOf(defaultDate));
  const [logs, setLogs] = useState<CodingTestLog[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (editingId === null) setForm(f => ({...f, solved_date: defaultDate}));
  }, [defaultDate, editingId]);

  async function load() {
    try {
      setLogs(await fetchCodingTests());
    } catch {
      setStatus("코딩테스트 기록을 불러오지 못했습니다. 백엔드를 확인하세요.");
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(f => ({
      ...emptyOf(defaultDate),
      platform: f.platform,
      language: f.language
    }));
  }

  function startEdit(log: CodingTestLog) {
    setEditingId(log.id);
    setForm({
      solved_date: log.solved_date,
      platform: log.platform || "백준",
      problem_no: log.problem_no,
      title: log.title,
      difficulty: log.difficulty,
      language: log.language || "Python",
      url: log.url,
      code: log.code,
      approach: log.approach
    });
    setStatus(`#${log.id} 수정 중`);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setStatus("문제 제목을 입력하세요.");
      return;
    }
    setBusy(true);
    setStatus("저장 중...");
    try {
      if (editingId !== null) {
        await updateCodingTest(editingId, form);
        setStatus("코딩테스트 기록을 수정했습니다.");
      } else {
        await createCodingTest(form);
        setStatus(
          "코딩테스트 풀이가 저장됐습니다. 알고리즘 도장이 밝아지고 알고가 이 풀이를 기억합니다."
        );
      }
      resetForm();
      await load();
    } catch {
      setStatus("저장에 실패했습니다. 백엔드 상태를 확인하세요.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCodingTest(id);
      if (editingId === id) resetForm();
      await load();
    } catch {
      setStatus("삭제에 실패했습니다.");
    }
  }

  const filtered = logs.filter(log =>
    matchesQuery(query, [
      log.title,
      log.platform,
      log.difficulty,
      log.language,
      log.problem_no
    ])
  );
  const groups = groupByDate(filtered, log => log.solved_date);

  return (
    <Panel title="코딩테스트 풀이 기록" kicker="Algorithm Dojo">
      <form className="grid gap-4" onSubmit={handleSave}>
        <div className="grid gap-3 md:grid-cols-4">
          <LabeledField label="날짜">
            <input
              className="field"
              type="date"
              value={form.solved_date}
              onChange={e => setForm({...form, solved_date: e.target.value})}
            />
          </LabeledField>
          <LabeledField label="플랫폼">
            <select
              className="field"
              value={form.platform}
              onChange={e => setForm({...form, platform: e.target.value})}
            >
              {["백준", "프로그래머스", "리트코드", "SWEA", "기타"].map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </LabeledField>
          <LabeledField label="문제 번호 (선택)">
            <input
              className="field"
              value={form.problem_no}
              onChange={e => setForm({...form, problem_no: e.target.value})}
              placeholder="예: 1463"
            />
          </LabeledField>
          <LabeledField label="난이도">
            <input
              className="field"
              value={form.difficulty}
              onChange={e => setForm({...form, difficulty: e.target.value})}
              placeholder="예: 실버3, Lv.2"
            />
          </LabeledField>
        </div>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <LabeledField label="문제 제목">
            <input
              className="field"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="예: 1로 만들기"
            />
          </LabeledField>
          <LabeledField label="언어">
            <select
              className="field"
              value={form.language}
              onChange={e => setForm({...form, language: e.target.value})}
            >
              {[
                "Python",
                "Java",
                "C++",
                "JavaScript",
                "C",
                "Kotlin",
                "기타"
              ].map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </LabeledField>
        </div>
        <LabeledField label="문제 링크 (선택)">
          <input
            className="field"
            value={form.url}
            onChange={e => setForm({...form, url: e.target.value})}
            placeholder="https://www.acmicpc.net/problem/1463"
          />
        </LabeledField>
        <LabeledField label="풀이 방법 / 접근">
          <textarea
            className="field min-h-[90px]"
            value={form.approach}
            onChange={e => setForm({...form, approach: e.target.value})}
            placeholder="어떤 접근으로 풀었는지, 막혔던 부분, 시간복잡도 등"
          />
        </LabeledField>
        <LabeledField label="코드">
          <textarea
            className="field min-h-[160px] font-mono text-xs"
            value={form.code}
            onChange={e => setForm({...form, code: e.target.value})}
            placeholder="제출한 코드를 붙여넣으세요"
            spellCheck={false}
          />
        </LabeledField>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-lg bg-[#ffb15e] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#1a2027] transition hover:bg-[#e2c078] disabled:opacity-45"
            disabled={busy}
            type="submit"
          >
            {editingId !== null ? "수정 저장" : "코딩테스트 기록 저장"}
          </button>
          {editingId !== null ? (
            <button className="sub-button" onClick={resetForm} type="button">
              새 기록으로
            </button>
          ) : null}
          {status ? (
            <span className="text-xs text-[#8b94a0]">{status}</span>
          ) : null}
        </div>
      </form>

      <div className="mt-6 mb-3 flex items-center justify-between gap-3">
        <input
          className="field max-w-[260px]"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="제목·플랫폼·언어 검색"
        />
        <span className="shrink-0 font-mono text-[11px] text-[#6b7580]">
          {filtered.length}개
        </span>
      </div>

      <div className="grid gap-4">
        {groups.length === 0 ? (
          <p className="text-sm text-[#6b7580]">기록이 없습니다.</p>
        ) : (
          groups.map(([date, items]) => (
            <div key={date}>
              <p className="mb-1.5 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#e2c078]/70">
                {prettyDate(date)}
              </p>
              <div className="grid gap-2">
                {items.map(log => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#232b34] bg-[#232b34] p-3"
                    key={log.id}
                  >
                    <button
                      className="min-w-0 text-left"
                      onClick={() => startEdit(log)}
                      type="button"
                    >
                      <p className="truncate text-sm font-bold text-[#e8edf2] hover:text-[#e2c078]">
                        {log.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#6b7580]">
                        {[
                          log.platform,
                          log.difficulty,
                          log.language,
                          log.problem_no && `#${log.problem_no}`
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        className="rounded-md border border-[#38414d] px-2 py-1 text-xs text-[#8b94a0] transition hover:border-[#e2c078]/50 hover:text-[#e2c078]"
                        onClick={() => startEdit(log)}
                        type="button"
                      >
                        수정
                      </button>
                      <button
                        className="rounded-md border border-[#38414d] px-2 py-1 text-xs text-[#8b94a0] transition hover:border-[#c2492e]/50 hover:text-[#e07a5f]"
                        onClick={() => handleDelete(log.id)}
                        type="button"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

function CsNoteAdmin({defaultDate}: {defaultDate: string}) {
  const emptyOf = (date: string) => ({
    study_date: date,
    category: "운영체제",
    title: "",
    content: ""
  });
  const [form, setForm] = useState(emptyOf(defaultDate));
  const [notes, setNotes] = useState<CsNote[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (editingId === null) setForm(f => ({...f, study_date: defaultDate}));
  }, [defaultDate, editingId]);

  async function load() {
    try {
      setNotes(await fetchCsNotes());
    } catch {
      setStatus("CS 노트를 불러오지 못했습니다. 백엔드를 확인하세요.");
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(f => ({...emptyOf(defaultDate), category: f.category}));
  }

  function startEdit(note: CsNote) {
    setEditingId(note.id);
    setForm({
      study_date: note.study_date,
      category: note.category || "운영체제",
      title: note.title,
      content: note.content
    });
    setStatus(`#${note.id} 수정 중`);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setStatus("노트 제목을 입력하세요.");
      return;
    }
    setBusy(true);
    setStatus("저장 중...");
    try {
      if (editingId !== null) {
        await updateCsNote(editingId, form);
        setStatus("CS 노트를 수정했습니다.");
      } else {
        await createCsNote(form);
        setStatus(
          "CS 전공지식 노트가 저장됐습니다. 지식 서고가 밝아지고 노바가 이 내용을 기억합니다."
        );
      }
      resetForm();
      await load();
    } catch {
      setStatus("저장에 실패했습니다. 백엔드 상태를 확인하세요.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCsNote(id);
      if (editingId === id) resetForm();
      await load();
    } catch {
      setStatus("삭제에 실패했습니다.");
    }
  }

  const filtered = notes.filter(note =>
    matchesQuery(query, [note.title, note.category, note.content])
  );
  const groups = groupByDate(filtered, note => note.study_date);

  return (
    <Panel title="CS 전공지식 노트" kicker="Knowledge Archive">
      <form className="grid gap-4" onSubmit={handleSave}>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_2fr]">
          <LabeledField label="날짜">
            <input
              className="field"
              type="date"
              value={form.study_date}
              onChange={e => setForm({...form, study_date: e.target.value})}
            />
          </LabeledField>
          <LabeledField label="분야">
            <select
              className="field"
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
            >
              {[
                "운영체제",
                "네트워크",
                "데이터베이스",
                "자료구조",
                "알고리즘",
                "컴퓨터구조",
                "기타"
              ].map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </LabeledField>
          <LabeledField label="제목">
            <input
              className="field"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="예: 프로세스와 스레드의 차이"
            />
          </LabeledField>
        </div>
        <LabeledField label="공부한 내용">
          <textarea
            className="field min-h-[180px]"
            value={form.content}
            onChange={e => setForm({...form, content: e.target.value})}
            placeholder="공부한 내용을 정리해 적으세요. 마크다운 없이 자유롭게 작성해도 됩니다."
          />
        </LabeledField>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-lg bg-[#9b8ac4] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#0d1116] transition hover:bg-[#b3a4d0] disabled:opacity-45"
            disabled={busy}
            type="submit"
          >
            {editingId !== null ? "수정 저장" : "CS 노트 저장"}
          </button>
          {editingId !== null ? (
            <button className="sub-button" onClick={resetForm} type="button">
              새 노트로
            </button>
          ) : null}
          {status ? (
            <span className="text-xs text-[#8b94a0]">{status}</span>
          ) : null}
        </div>
      </form>

      <div className="mt-6 mb-3 flex items-center justify-between gap-3">
        <input
          className="field max-w-[260px]"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="제목·분야·내용 검색"
        />
        <span className="shrink-0 font-mono text-[11px] text-[#6b7580]">
          {filtered.length}개
        </span>
      </div>

      <div className="grid gap-4">
        {groups.length === 0 ? (
          <p className="text-sm text-[#6b7580]">노트가 없습니다.</p>
        ) : (
          groups.map(([date, items]) => (
            <div key={date}>
              <p className="mb-1.5 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#9b8ac4]/70">
                {prettyDate(date)}
              </p>
              <div className="grid gap-2">
                {items.map(note => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#232b34] bg-[#232b34] p-3"
                    key={note.id}
                  >
                    <button
                      className="min-w-0 text-left"
                      onClick={() => startEdit(note)}
                      type="button"
                    >
                      <p className="truncate text-sm font-bold text-[#e8edf2] hover:text-[#9b8ac4]">
                        {note.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#6b7580]">
                        {[note.category].filter(Boolean).join(" · ")}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        className="rounded-md border border-[#38414d] px-2 py-1 text-xs text-[#8b94a0] transition hover:border-[#b3a4d0]/50 hover:text-[#9b8ac4]"
                        onClick={() => startEdit(note)}
                        type="button"
                      >
                        수정
                      </button>
                      <button
                        className="rounded-md border border-[#38414d] px-2 py-1 text-xs text-[#8b94a0] transition hover:border-[#c2492e]/50 hover:text-[#e07a5f]"
                        onClick={() => handleDelete(note.id)}
                        type="button"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

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
function AdminGate({onUnlocked}: {onUnlocked: () => void}) {
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
          {busy ? "회로 확인 중…" : "다이얼을 맞추고 레버를 당기세요 · Enter"}
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

/** 어떤 요소의 한가운데서 불꽃을 사방으로 터뜨린다. 저장·해정처럼 **성공했을 때만** 부른다. */
function burstFrom(el: HTMLElement | null, count = 22) {
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("div");
    spark.className = "sw-burst";
    spark.style.left = `${cx}px`;
    spark.style.top = `${cy}px`;
    document.body.appendChild(spark);
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const dist = 80 + Math.random() * 170;
    spark.animate(
      [
        {transform: "translate(0,0) scale(1)", opacity: 1},
        {
          transform: `translate(${Math.cos(angle) * dist}px, ${
            Math.sin(angle) * dist
          }px) scale(0)`,
          opacity: 0
        }
      ],
      {duration: 750, easing: "ease-out"}
    );
    window.setTimeout(() => spark.remove(), 780);
  }
}
/* 회로가 켜는 건물. `villageLightPreview.ts` 의 점수 표와 같은 id 여야 지도와
   회로가 같은 것을 가리킨다 — 여기서 오타가 나면 조준 고리만 조용히 안 걸린다. */
const PLAZA_ONLY = ["central-plaza"];
const SKILL_BUILDINGS = [
  "skill-frontend",
  "skill-3d",
  "skill-backend",
  "skill-game",
  "skill-workflow"
];
/** 프로젝트 id → 건물 id. 프로젝트마다 건물 하나로 1:1 이다. */
const projectBuildingIds: Record<string, string[]> = Object.fromEntries(
  projects.map(project => [project.id, [`project-${project.id}`]])
);

const DAILY_GOALS = {workout: 30, coding: 120, study: 60};

function GoalRing({
  label,
  value,
  goal,
  color
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const R = 26;
  const C = 2 * Math.PI * R;
  const done = pct >= 1;
  return (
    <div className="grid place-items-center">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle
          cx="38"
          cy="38"
          r={R}
          fill="none"
          stroke="#232b34"
          strokeWidth="7"
        />
        <circle
          cx="38"
          cy="38"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 38 38)"
          style={{transition: "stroke-dashoffset 0.5s ease"}}
        />
        <text
          x="38"
          y="43"
          textAnchor="middle"
          fontSize="15"
          fontWeight="800"
          fill={done ? color : "#e8edf2"}
        >
          {done ? "✓" : `${Math.round(pct * 100)}%`}
        </text>
      </svg>
      <p className="mt-1 text-xs font-bold text-[#9aa4b0]">{label}</p>
      <p className="font-mono text-[10px] text-[#6b7580]">
        {value}/{goal}분
      </p>
    </div>
  );
}

function GoalRings({
  workout,
  coding,
  study
}: {
  workout: number;
  coding: number;
  study: number;
}) {
  const allDone =
    workout >= DAILY_GOALS.workout &&
    coding >= DAILY_GOALS.coding &&
    study >= DAILY_GOALS.study;
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <GoalRing
          label="운동"
          value={workout}
          goal={DAILY_GOALS.workout}
          color="#ffb15e"
        />
        <GoalRing
          label="코딩"
          value={coding}
          goal={DAILY_GOALS.coding}
          color="#ff9d38"
        />
        <GoalRing
          label="공부"
          value={study}
          goal={DAILY_GOALS.study}
          color="#6fae6a"
        />
      </div>
      <p
        className={`mt-3 rounded-lg border p-2.5 text-center text-xs font-bold ${
          allDone
            ? "border-[#6fae6a]/30 bg-[#6fae6a]/8 text-[#4d8a4a]"
            : "border-[#38414d] text-[#6b7580]"
        }`}
      >
        {allDone
          ? "🎉 오늘 목표 세 개 다 채웠어요!"
          : "세 링을 다 채우면 하루 완성!"}
      </p>
    </div>
  );
}

function LabeledField({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, delta: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function prettyDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  const week = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${week})`;
}

function activityRaw(a?: DailyActivity | null): number {
  if (!a) return 0;
  const projects = Object.values(a.project_minutes ?? {}).reduce(
    (sum, m) => sum + Number(m || 0),
    0
  );
  return (
    (a.study_minutes || 0) / 3 +
    (a.coding_minutes || 0) / 3 +
    (a.github_commits || 0) * 8 +
    (a.workout_done ? 20 : 0) +
    projects / 5
  );
}

function activityLevel(a?: DailyActivity | null): number {
  const raw = activityRaw(a);
  if (raw <= 0) return 0;
  if (raw < 20) return 1;
  if (raw < 45) return 2;
  if (raw < 80) return 3;
  return 4;
}

/** 활동 달력의 농도 — 등불이 진해지는 계단. 예전엔 파란 잔디였다. */
const LEVEL_BG = [
  "#232b34",
  "rgba(255,157,56,0.20)",
  "rgba(255,157,56,0.40)",
  "rgba(255,157,56,0.64)",
  "rgba(255,157,56,0.90)"
];

interface DailyStats {
  recordStreak: number;
  workoutStreak: number;
  weekCoding: number;
}

function computeStats(history: DailyActivity[]): DailyStats {
  const byDate: Record<string, DailyActivity> = {};
  for (const item of history) byDate[item.date] = item;

  const streak = (predicate: (a: DailyActivity) => boolean) => {
    let cursor = today();
    if (!byDate[cursor] || !predicate(byDate[cursor]))
      cursor = addDays(cursor, -1);
    let count = 0;
    while (byDate[cursor] && predicate(byDate[cursor])) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  };

  let weekCoding = 0;
  for (let i = 0; i < 7; i += 1) {
    const day = byDate[addDays(today(), -i)];
    if (day) weekCoding += day.coding_minutes || 0;
  }

  return {
    recordStreak: streak(a => activityRaw(a) > 0),
    workoutStreak: streak(a => a.workout_done),
    weekCoding
  };
}

function ActivityCalendar({
  byDate,
  selectedDate,
  onPick
}: {
  byDate: Record<string, DailyActivity>;
  selectedDate: string;
  onPick: (date: string) => void;
}) {
  const weeks = 16;
  const totalDays = weeks * 7;
  const days: string[] = [];
  for (let i = totalDays - 1; i >= 0; i -= 1) days.push(addDays(today(), -i));

  const leadPad = new Date(days[0] + "T00:00:00").getDay(); // 첫 날 요일만큼 앞 패딩
  const cells: (string | null)[] = [...Array(leadPad).fill(null), ...days];
  const columns: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {columns.map((col, ci) => (
          <div className="flex flex-col gap-[3px]" key={ci}>
            {col.map((date, ri) => {
              if (!date) return <span className="h-3 w-3" key={ri} />;
              const level = activityLevel(byDate[date]);
              const selected = date === selectedDate;
              return (
                <button
                  key={date}
                  type="button"
                  title={`${date} · ${
                    byDate[date] ? "기록 있음" : "기록 없음"
                  }`}
                  onClick={() => onPick(date)}
                  className="h-3 w-3 rounded-[3px] transition hover:scale-125"
                  style={{
                    background: LEVEL_BG[level],
                    outline: selected ? "1.5px solid #ff9d38" : "none",
                    outlineOffset: selected ? "1px" : undefined
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 font-mono text-[10px] text-[#6b7580]">
        <span>적음</span>
        {LEVEL_BG.map((bg, i) => (
          <span
            className="h-2.5 w-2.5 rounded-[2px]"
            key={i}
            style={{background: bg}}
          />
        ))}
        <span>많음</span>
      </div>
    </div>
  );
}

function RewardCard({
  reward,
  onClose
}: {
  reward: {state: VillageState; date: string};
  onClose: () => void;
}) {
  const {state} = reward;
  const lit = state.buildings
    .filter(b => b.activity_score > 0 && b.building_id !== "central-plaza")
    .sort((a, b) => b.activity_score - a.activity_score)
    .slice(0, 6);
  const unlocked = state.unlocked_items.filter(
    item => !item.startsWith("active-")
  );
  const npcLine =
    state.npcs.find(n => n.npc_id === "guide-npc")?.status_text ??
    state.npcs[0]?.status_text ??
    "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#e8edf2]/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-[min(94vw,520px)] rounded-2xl border border-[#ff9d38]/30 bg-[#1a2027] p-6 shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ff9d38]">
              Village Updated
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#e8edf2]">
              오늘 마을에 생긴 일 ✨
            </h2>
          </div>
          <button
            className="text-[#6b7580] hover:text-[#e8edf2]"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-[#9aa4b0]">{state.summary}</p>

        {lit.length > 0 ? (
          <div className="mt-4">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.14em] text-[#e2c078]">
              밝아진 건물
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {lit.map(b => (
                <span
                  className="rounded-full border border-[#6fae6a]/30 bg-[#6fae6a]/10 px-3 py-1 text-xs font-bold text-[#4d8a4a]"
                  key={b.building_id}
                >
                  {BUILDING_NAME[b.building_id] ?? b.building_id} ·{" "}
                  {b.light_level}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {unlocked.length > 0 ? (
          <div className="mt-4">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.14em] text-[#ff9d38]">
              새로 해금
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {unlocked.map(item => (
                <span
                  className="rounded-full border border-[#e2c078]/30 bg-[#e2c078]/10 px-3 py-1 text-xs font-bold text-[#ff9d38]"
                  key={item}
                >
                  {UNLOCK_LABEL[item] ?? item}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {npcLine ? (
          <div className="mt-4 rounded-lg border border-[#38414d] bg-[#232b34] p-3">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#6b7580]">
              루미의 한마디
            </p>
            <p className="mt-1 text-sm leading-6 text-[#2a323b]">“{npcLine}”</p>
          </div>
        ) : null}

        <a
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff9d38] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#1a2027] transition hover:bg-[#ffb15e]"
          href="/"
        >
          마을에서 직접 보기 →
        </a>
      </div>
    </div>
  );
}

/**
 * 배전반의 한 판. `lever` 를 주면 그 판은 **회로**가 되고, `live` 인 동안 왼쪽
 * 모선에 전기가 흐른다(admin.css 의 `.sw-circuit.is-live::before`).
 *
 * `live` 는 따로 저장하는 상태가 아니라 **값에서 파생**된다 — 숫자가 0 이면 꺼지고
 * 값이 들어가면 켜진다. 그래야 화면이 거짓말을 하지 않는다.
 */
function Panel({
  children,
  kicker,
  lever,
  live,
  title
}: {
  children: React.ReactNode;
  kicker: string;
  lever?: React.ReactNode;
  live?: boolean;
  title: string;
}) {
  return (
    <section
      className={`sw-circuit${
        live ? " is-live" : ""
      } rounded-lg border border-[#38414d] bg-[#1a2027] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.45)]`}
    >
      <div className="flex items-start gap-4">
        {lever ?? null}
        <div className="min-w-0">
          <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff9d38]">
            {kicker}
          </p>
          <h2 className="mt-2 text-xl font-black">{title}</h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Metric({label, value}: {label: string; value: string | number}) {
  return (
    <div className="rounded-lg border border-[#38414d] bg-[#232b34] p-3">
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#6b7580]">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-[#ff9d38]">{value}</p>
    </div>
  );
}

function AiUsageBar({usage}: {usage: AiUsage}) {
  const ratio =
    usage.daily_limit > 0 ? usage.today_count / usage.daily_limit : 0;
  const color = ratio >= 0.9 ? "#b03a24" : ratio >= 0.6 ? "#e2c078" : "#ff9d38";
  return (
    <div className="rounded-lg border border-[#38414d] bg-[#232b34] p-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#6b7580]">
          오늘 AI 호출
        </p>
        <p className="font-mono text-xs font-black" style={{color}}>
          {usage.today_count} / {usage.daily_limit}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#38414d]">
        <div
          className="h-full rounded-full transition-[width]"
          style={{width: `${Math.min(100, ratio * 100)}%`, background: color}}
        />
      </div>
    </div>
  );
}

function TagCloud({
  items,
  onToggle,
  selected
}: {
  items: string[];
  onToggle: (item: string) => void;
  selected: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => {
        const active = selected.includes(item);
        return (
          <button
            className={
              active
                ? "rounded-full border border-[#7dbd77]/45 bg-[#7dbd77]/12 px-3 py-1.5 text-xs font-bold text-[#4d8a4a]"
                : "rounded-full border border-[#38414d] bg-[#232b34] px-3 py-1.5 text-xs font-bold text-[#8b94a0] transition hover:border-[#4a5462] hover:text-[#e8edf2]"
            }
            key={item}
            onClick={() => onToggle(item)}
            type="button"
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function Chip({
  children,
  onRemove
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#ff9d38]/25 bg-[#ff9d38]/8 px-3 py-1.5 text-xs font-bold text-[#e2c078]">
      {children}
      <button
        className="text-[#6b7580] hover:text-[#e8edf2]"
        onClick={onRemove}
        type="button"
      >
        x
      </button>
    </span>
  );
}

function normalizeForm(form: ActivityInput): ActivityInput {
  const projectMinutes: Record<string, number> = {};
  for (const [key, value] of Object.entries(form.project_minutes)) {
    const minutes = Math.max(0, Number(value || 0));
    if (minutes > 0) projectMinutes[key] = minutes;
  }

  return {
    ...form,
    github_repos: unique(form.github_repos),
    study_topics: unique(form.study_topics),
    studied_tech: unique(form.studied_tech),
    project_minutes: projectMinutes
  };
}

function buildPredictedChanges(form: ActivityInput): string[] {
  const changes: string[] = [];

  if (form.workout_done && form.workout_minutes > 0) {
    changes.push(
      `중앙 광장과 가이드 NPC가 ${form.workout_type || "운동"} ${
        form.workout_minutes
      }분 기록으로 활기차집니다.`
    );
  }
  if (form.study_minutes > 0) {
    changes.push(
      `기술 스택 구역이 공부 ${form.study_minutes}분과 선택한 기술 주제에 따라 밝아집니다.`
    );
  }
  if (form.coding_minutes > 0) {
    changes.push(
      `코딩 ${form.coding_minutes}분이 개발자 NPC의 집중도와 마을 전체 활기에 반영됩니다.`
    );
  }

  const activeProjects = Object.entries(form.project_minutes).filter(
    ([, minutes]) => minutes > 0
  );
  if (activeProjects.length > 0) {
    changes.push(
      `작업한 프로젝트 ${activeProjects.length}개의 건물이 작업 시간에 따라 밝아집니다.`
    );
  }
  if (form.github_commits > 0 || form.github_repos.length > 0) {
    changes.push(
      `GitHub 커밋 ${form.github_commits}개와 repo 기록이 프로젝트 구역 에너지로 들어갑니다.`
    );
  }
  if (form.memo.trim()) {
    changes.push("오늘 메모가 경험 기록관과 NPC 상태 문구에 반영됩니다.");
  }

  return changes.length > 0
    ? changes
    : ["아직 기록이 없어 마을이 조용한 상태로 유지됩니다."];
}

function toggleValue(items: string[], item: string): string[] {
  return items.includes(item)
    ? items.filter(value => value !== item)
    : [...items, item];
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.map(item => item.trim()).filter(Boolean)));
}
