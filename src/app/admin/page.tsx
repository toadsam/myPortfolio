"use client";

import {useEffect, useMemo, useState} from "react";
import type * as React from "react";
import {projects} from "@/data/projects";
import {skills} from "@/data/skills";
import {
  createCodingTest,
  createCsNote,
  deleteCodingTest,
  deleteCsNote,
  fetchActivityHistory,
  fetchAdminAuthStatus,
  fetchAdminOverview,
  fetchCodingTests,
  fetchCsNotes,
  fetchVillageState,
  hasAdminToken,
  loginAdmin,
  saveActivity,
  syncGithubActivity,
  updateCodingTest,
  updateCsNote
} from "@/lib/liveApi";
import {villageBuildings} from "@/lib/constants";
import type {ActivityInput, AiUsage, CodingTestLog, CsNote, DailyActivity, VillageState} from "@/types/live";

const BUILDING_NAME: Record<string, string> = Object.fromEntries(
  villageBuildings.map((building) => [building.id, building.name])
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
const quickTopics = ["알고리즘", "React", "Next.js", "FastAPI", "Spring Boot", "Three.js", "Unity", "DB 설계"];

export default function AdminPage() {
  const [form, setForm] = useState<ActivityInput>(initialForm);
  const [villageState, setVillageState] = useState<VillageState | null>(null);
  const [status, setStatus] = useState("오늘의 기록을 불러오는 중입니다.");
  const [isSaving, setIsSaving] = useState(false);
  const [repoInput, setRepoInput] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());
  const [history, setHistory] = useState<DailyActivity[]>([]);
  const [reward, setReward] = useState<{state: VillageState; date: string} | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [aiUsage, setAiUsage] = useState<AiUsage | null>(null);

  const isToday = selectedDate === today();
  const historyByDate = useMemo(() => {
    const map: Record<string, DailyActivity> = {};
    for (const item of history) map[item.date] = item;
    return map;
  }, [history]);
  const stats = useMemo(() => computeStats(history), [history]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const status = await fetchAdminAuthStatus();
        if (status.auth_enabled && !hasAdminToken()) {
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

  const totalProjectMinutes = useMemo(
    () => Object.values(form.project_minutes).reduce((sum, minutes) => sum + Number(minutes || 0), 0),
    [form.project_minutes]
  );

  const activeProjects = useMemo(
    () =>
      projects
        .map((project) => ({project, minutes: form.project_minutes[project.id] ?? 0}))
        .filter((item) => item.minutes > 0)
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
      const [hist, state] = await Promise.all([fetchActivityHistory(140), fetchVillageState()]);
      setHistory(hist);
      setVillageState(state);
      const todayKey = today();
      setSelectedDate(todayKey);
      applyActivity(hist.find((item) => item.date === todayKey) ?? null);
      setStatus("오늘의 기록을 불러왔습니다.");
    } catch {
      setStatus("FastAPI 백엔드에 연결하지 못했습니다. 백엔드를 실행한 뒤 새로고침하세요.");
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
    setStatus(date === today() ? "오늘 기록을 편집 중입니다." : `${date} 기록을 편집 중입니다.`);
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
      const [hist, state] = await Promise.all([fetchActivityHistory(140), fetchVillageState()]);
      setHistory(hist);
      setVillageState(state);
      if (isToday) setReward({state, date: selectedDate});
      setStatus("기록이 저장되었습니다. 3D 마을 조명, NPC 상태, 장식이 갱신됐습니다.");
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
      setForm((current) => ({...current, github_commits: result.commits}));
      const state = await fetchVillageState();
      setVillageState(state);
      setStatus(result.warning ?? `GitHub 커밋 ${result.commits}개를 오늘 기록에 반영했습니다.`);
    } catch {
      setStatus("GitHub 동기화에 실패했습니다. 토큰 또는 백엔드 상태를 확인하세요.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateForm(patch: Partial<ActivityInput>) {
    setForm((current) => ({...current, ...patch}));
  }

  function setProjectMinutes(projectId: string, minutes: number) {
    setForm((current) => ({
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
      <main className="grid min-h-screen place-items-center bg-[#f6f8fb] text-[#64748b]">
        <p className="font-mono text-sm">불러오는 중…</p>
      </main>
    );
  }

  if (locked) {
    return <AdminGate onUnlocked={handleUnlocked} />;
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#1e293b]">
      <form onSubmit={handleSave}>
        <header className="border-b border-[#e3e8ef] bg-[#ffffff]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#0284c7]">Daily Village Journal</p>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">오늘의 기록이 마을을 바꿉니다</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#475569]">
                운동, 공부, 코딩, 프로젝트 작업, GitHub 활동을 기록하면 포트폴리오 마을의 조명과 NPC 상태가 자동으로 달라집니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="rounded-lg border border-[#0284c7]/35 px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#0369a1] transition hover:bg-[#0284c7]/10"
                href="/"
              >
                마을 보기
              </a>
              <button
                className="rounded-lg bg-[#0284c7] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#06111f] transition hover:bg-[#0ea5e9] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={isSaving}
                type="submit"
              >
                오늘 기록 저장
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 pt-5">
          <div className="flex items-center gap-1 rounded-lg border border-[#e3e8ef] bg-[#ffffff] p-1">
            <button className="step-button" onClick={() => shiftDate(-1)} type="button" aria-label="이전 날">◀</button>
            <input
              className="field w-[150px] text-center"
              type="date"
              max={today()}
              value={selectedDate}
              onChange={(event) => selectDate(event.target.value || today())}
            />
            <button
              className="step-button disabled:opacity-30"
              onClick={() => shiftDate(1)}
              type="button"
              aria-label="다음 날"
              disabled={isToday}
            >
              ▶
            </button>
          </div>
          {!isToday ? (
            <button className="sub-button" onClick={() => selectDate(today())} type="button">오늘로</button>
          ) : null}
          <button className="sub-button" onClick={copyYesterday} type="button">어제 기록 복사</button>
          <span className="rounded-full border border-[#0284c7]/25 px-3 py-1.5 font-mono text-xs text-[#0369a1]">
            {isToday ? "오늘" : prettyDate(selectedDate)}{historyByDate[selectedDate] ? " · 기록 있음" : " · 빈 날"}
          </span>
        </div>

        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 xl:grid-cols-[1fr_410px]">
          <section className="grid gap-5">
            <Panel title="오늘 컨디션" kicker="Daily Check-in">
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr]">
                <label className="grid gap-2">
                  <span className="field-label">오늘 기분</span>
                  <select
                    className="field"
                    onChange={(event) => updateForm({mood: event.target.value})}
                    value={form.mood}
                  >
                    {moodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="field-label">집중도</span>
                  <div className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] px-3 py-3">
                    <input
                      className="w-full accent-[#0284c7]"
                      max={100}
                      min={0}
                      onChange={(event) => updateForm({focus_score: Number(event.target.value)})}
                      type="range"
                      value={form.focus_score}
                    />
                    <div className="mt-2 flex justify-between font-mono text-xs text-[#94a3b8]">
                      <span>느슨함</span>
                      <span>{form.focus_score}%</span>
                      <span>몰입</span>
                    </div>
                  </div>
                </label>
                <label className="grid gap-2">
                  <span className="field-label">오늘 한 줄 메모</span>
                  <input
                    className="field"
                    onChange={(event) => updateForm({memo: event.target.value})}
                    placeholder="예: FestFlow SSE 흐름을 정리하고 운동까지 완료"
                    value={form.memo}
                  />
                </label>
              </div>
            </Panel>

            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="운동 기록" kicker="Body Energy">
                <div className="grid gap-4">
                  <label className="flex items-center justify-between gap-4 rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] px-4 py-3">
                    <span>
                      <span className="block text-sm font-black">오늘 운동 완료</span>
                      <span className="mt-1 block text-xs text-[#94a3b8]">운동 기록은 중앙 광장과 가이드 NPC 상태에 반영됩니다.</span>
                    </span>
                    <input
                      checked={form.workout_done}
                      className="h-5 w-5"
                      onChange={(event) => updateForm({workout_done: event.target.checked})}
                      type="checkbox"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <NumberField
                      disabled={!form.workout_done}
                      label="운동 시간"
                      suffix="분"
                      value={form.workout_minutes}
                      onChange={(value) => updateForm({workout_minutes: value})}
                    />
                    <label className="grid gap-2">
                      <span className="field-label">운동 종류</span>
                      <select
                        className="field"
                        disabled={!form.workout_done}
                        onChange={(event) => updateForm({workout_type: event.target.value})}
                        value={form.workout_type}
                      >
                        <option value="">선택 안 함</option>
                        {workoutTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </Panel>

              <Panel title="공부 기록" kicker="Study Energy">
                <div className="grid gap-4">
                  <NumberField
                    label="공부 시간"
                    suffix="분"
                    value={form.study_minutes}
                    onChange={(value) => updateForm({study_minutes: value})}
                  />
                  <div className="grid gap-2">
                    <span className="field-label">공부한 주제/기술</span>
                    <div className="flex gap-2">
                      <input
                        className="field min-w-0 flex-1"
                        onChange={(event) => setTopicInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addTopic();
                          }
                        }}
                        placeholder="예: React Query, DB Index"
                        value={topicInput}
                      />
                      <button className="sub-button" onClick={addTopic} type="button">
                        추가
                      </button>
                    </div>
                    <TagCloud
                      items={unique([...quickTopics, ...form.study_topics])}
                      selected={form.studied_tech}
                      onToggle={(item) => updateForm({studied_tech: toggleValue(form.studied_tech, item), study_topics: unique([...form.study_topics, item])})}
                    />
                  </div>
                </div>
              </Panel>
            </div>

            <Panel title="코딩 기록" kicker="Development Log">
              <div className="grid gap-5">
                <div className="grid gap-4 lg:grid-cols-3">
                  <NumberField
                    label="총 코딩 시간"
                    suffix="분"
                    value={form.coding_minutes}
                    onChange={(value) => updateForm({coding_minutes: value})}
                  />
                  <NumberField
                    label="GitHub 커밋"
                    value={form.github_commits}
                    onChange={(value) => updateForm({github_commits: value})}
                  />
                  <div className="grid content-end">
                    <button className="sub-button h-[46px]" disabled={isSaving} onClick={handleGithubSync} type="button">
                      GitHub 커밋 동기화
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <span className="field-label">오늘 건드린 GitHub repo</span>
                  <div className="flex gap-2">
                    <input
                      className="field min-w-0 flex-1"
                      onChange={(event) => setRepoInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addRepo();
                        }
                      }}
                      placeholder="예: toadsam/FestFlow"
                      value={repoInput}
                    />
                    <button className="sub-button" onClick={addRepo} type="button">
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.github_repos.map((repo) => (
                      <Chip key={repo} onRemove={() => updateForm({github_repos: form.github_repos.filter((item) => item !== repo)})}>
                        {repo}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="프로젝트별 작업 시간" kicker="Project Work">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => {
                  const minutes = form.project_minutes[project.id] ?? 0;
                  return (
                    <article
                      className={minutes > 0 ? "project-card active" : "project-card"}
                      key={project.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black">{project.title}</h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#94a3b8]">{project.description}</p>
                        </div>
                        <span className="rounded-full border border-[#0284c7]/25 px-2 py-0.5 font-mono text-[11px] text-[#0369a1]">
                          {minutes}m
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <button className="step-button" onClick={() => setProjectMinutes(project.id, minutes - 30)} type="button">
                          -30
                        </button>
                        <input
                          className="field min-w-0 flex-1 text-center"
                          min={0}
                          onChange={(event) => setProjectMinutes(project.id, Number(event.target.value))}
                          type="number"
                          value={minutes}
                        />
                        <button className="step-button" onClick={() => setProjectMinutes(project.id, minutes + 30)} type="button">
                          +30
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Panel>
          </section>

          <aside className="grid content-start gap-5">
            <Panel title="기록 스트릭" kicker="Keep Going">
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <Metric label="연속 기록" value={`${stats.recordStreak}일`} />
                  <Metric label="운동 연속" value={`${stats.workoutStreak}일`} />
                  <Metric label="이번 주 코딩" value={`${stats.weekCoding}분`} />
                </div>
                {aiUsage ? <AiUsageBar usage={aiUsage} /> : null}
                <ActivityCalendar
                  byDate={historyByDate}
                  selectedDate={selectedDate}
                  onPick={selectDate}
                />
              </div>
            </Panel>

            <Panel title="데일리 목표" kicker="Daily Rings">
              <GoalRings
                workout={form.workout_done ? form.workout_minutes : 0}
                coding={form.coding_minutes}
                study={form.study_minutes}
              />
            </Panel>

            <Panel title="오늘 기록 요약" kicker="Village Impact">
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="운동" value={form.workout_done ? `${form.workout_minutes}분` : "미완료"} />
                  <Metric label="공부" value={`${form.study_minutes}분`} />
                  <Metric label="코딩" value={`${form.coding_minutes}분`} />
                  <Metric label="프로젝트" value={`${totalProjectMinutes}분`} />
                </div>
                <div className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] p-4">
                  <p className="font-black text-[#0284c7]">저장하면 바뀌는 것</p>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#475569]">
                    {predictedChanges.map((change) => (
                      <li className="flex gap-2" key={change}>
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0284c7]" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>

            <Panel title="활성 프로젝트" kicker="Today Focus">
              {activeProjects.length > 0 ? (
                <div className="grid gap-2">
                  {activeProjects.slice(0, 5).map(({project, minutes}) => (
                    <div className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] p-3" key={project.id}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold">{project.title}</span>
                        <span className="font-mono text-xs text-[#0284c7]">{minutes}분</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[#94a3b8]">이 프로젝트 건물 조명과 프로젝트 NPC 추천에 반영됩니다.</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] p-4 text-sm leading-6 text-[#94a3b8]">
                  작업한 프로젝트 시간을 입력하면 해당 건물이 밝아집니다.
                </p>
              )}
            </Panel>

            <Panel title="현재 마을 상태" kicker="Live Preview">
              {villageState ? (
                <div className="grid gap-3">
                  <p className="text-sm leading-6 text-[#475569]">{villageState.summary}</p>
                  <div className="grid gap-2">
                    {villageState.buildings
                      .filter((building) => building.activity_score > 0)
                      .sort((a, b) => b.activity_score - a.activity_score)
                      .slice(0, 6)
                      .map((building) => (
                        <div className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] p-3" key={building.building_id}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-xs font-black text-[#475569]">{building.building_id}</span>
                            <span className="rounded-full border border-[#0284c7]/25 px-2 py-0.5 text-xs text-[#0369a1]">
                              {building.light_level}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#94a3b8]">{building.reason}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] p-4 text-sm leading-6 text-[#94a3b8]">
                  저장 후 마을 상태가 표시됩니다.
                </p>
              )}
            </Panel>

            <div className="rounded-lg border border-[#e3e8ef] bg-[#ffffff] p-4">
              <p className="text-sm leading-6 text-[#475569]">{status}</p>
              <button
                className="mt-4 w-full rounded-lg bg-[#0284c7] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#06111f] transition hover:bg-[#0ea5e9] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={isSaving}
                type="submit"
              >
                기록 저장하고 마을 갱신
              </button>
            </div>
          </aside>
        </div>
      </form>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 pb-10">
        <CodingTestAdmin defaultDate={selectedDate} />
        <CsNoteAdmin defaultDate={selectedDate} />
      </div>

      {reward ? <RewardCard reward={reward} onClose={() => setReward(null)} /> : null}
    </main>
  );
}

function groupByDate<T>(items: T[], dateOf: (item: T) => string): [string, T[]][] {
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
  return order.map((key) => [key, map[key]!]);
}

function matchesQuery(query: string, fields: (string | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => (field ?? "").toLowerCase().includes(q));
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
    if (editingId === null) setForm((f) => ({...f, solved_date: defaultDate}));
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
    setForm((f) => ({...emptyOf(defaultDate), platform: f.platform, language: f.language}));
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
        setStatus("코딩테스트 풀이가 저장됐습니다. 알고리즘 도장이 밝아지고 알고가 이 풀이를 기억합니다.");
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

  const filtered = logs.filter((log) => matchesQuery(query, [log.title, log.platform, log.difficulty, log.language, log.problem_no]));
  const groups = groupByDate(filtered, (log) => log.solved_date);

  return (
    <Panel title="코딩테스트 풀이 기록" kicker="Algorithm Dojo">
      <form className="grid gap-4" onSubmit={handleSave}>
        <div className="grid gap-3 md:grid-cols-4">
          <LabeledField label="날짜">
            <input className="field" type="date" value={form.solved_date} onChange={(e) => setForm({...form, solved_date: e.target.value})} />
          </LabeledField>
          <LabeledField label="플랫폼">
            <select className="field" value={form.platform} onChange={(e) => setForm({...form, platform: e.target.value})}>
              {["백준", "프로그래머스", "리트코드", "SWEA", "기타"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </LabeledField>
          <LabeledField label="문제 번호 (선택)">
            <input className="field" value={form.problem_no} onChange={(e) => setForm({...form, problem_no: e.target.value})} placeholder="예: 1463" />
          </LabeledField>
          <LabeledField label="난이도">
            <input className="field" value={form.difficulty} onChange={(e) => setForm({...form, difficulty: e.target.value})} placeholder="예: 실버3, Lv.2" />
          </LabeledField>
        </div>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <LabeledField label="문제 제목">
            <input className="field" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="예: 1로 만들기" />
          </LabeledField>
          <LabeledField label="언어">
            <select className="field" value={form.language} onChange={(e) => setForm({...form, language: e.target.value})}>
              {["Python", "Java", "C++", "JavaScript", "C", "Kotlin", "기타"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </LabeledField>
        </div>
        <LabeledField label="문제 링크 (선택)">
          <input className="field" value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} placeholder="https://www.acmicpc.net/problem/1463" />
        </LabeledField>
        <LabeledField label="풀이 방법 / 접근">
          <textarea className="field min-h-[90px]" value={form.approach} onChange={(e) => setForm({...form, approach: e.target.value})} placeholder="어떤 접근으로 풀었는지, 막혔던 부분, 시간복잡도 등" />
        </LabeledField>
        <LabeledField label="코드">
          <textarea className="field min-h-[160px] font-mono text-xs" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} placeholder="제출한 코드를 붙여넣으세요" spellCheck={false} />
        </LabeledField>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-lg bg-[#38bdf8] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#06111f] transition hover:bg-[#7dd3fc] disabled:opacity-45" disabled={busy} type="submit">
            {editingId !== null ? "수정 저장" : "코딩테스트 기록 저장"}
          </button>
          {editingId !== null ? (
            <button className="sub-button" onClick={resetForm} type="button">새 기록으로</button>
          ) : null}
          {status ? <span className="text-xs text-[#64748b]">{status}</span> : null}
        </div>
      </form>

      <div className="mt-6 mb-3 flex items-center justify-between gap-3">
        <input
          className="field max-w-[260px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목·플랫폼·언어 검색"
        />
        <span className="shrink-0 font-mono text-[11px] text-[#94a3b8]">{filtered.length}개</span>
      </div>

      <div className="grid gap-4">
        {groups.length === 0 ? (
          <p className="text-sm text-[#94a3b8]">기록이 없습니다.</p>
        ) : (
          groups.map(([date, items]) => (
            <div key={date}>
              <p className="mb-1.5 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#0369a1]/70">{prettyDate(date)}</p>
              <div className="grid gap-2">
                {items.map((log) => (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[#eef1f5] bg-[#f1f4f9] p-3" key={log.id}>
                    <button className="min-w-0 text-left" onClick={() => startEdit(log)} type="button">
                      <p className="truncate text-sm font-bold text-[#1e293b] hover:text-[#0369a1]">{log.title}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#94a3b8]">
                        {[log.platform, log.difficulty, log.language, log.problem_no && `#${log.problem_no}`].filter(Boolean).join(" · ")}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button className="rounded-md border border-[#e3e8ef] px-2 py-1 text-xs text-[#64748b] transition hover:border-[#0369a1]/50 hover:text-[#0369a1]" onClick={() => startEdit(log)} type="button">수정</button>
                      <button className="rounded-md border border-[#e3e8ef] px-2 py-1 text-xs text-[#64748b] transition hover:border-[#ff6b6b]/50 hover:text-[#ff9a9a]" onClick={() => handleDelete(log.id)} type="button">삭제</button>
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
  const emptyOf = (date: string) => ({study_date: date, category: "운영체제", title: "", content: ""});
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
    if (editingId === null) setForm((f) => ({...f, study_date: defaultDate}));
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
    setForm((f) => ({...emptyOf(defaultDate), category: f.category}));
  }

  function startEdit(note: CsNote) {
    setEditingId(note.id);
    setForm({study_date: note.study_date, category: note.category || "운영체제", title: note.title, content: note.content});
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
        setStatus("CS 전공지식 노트가 저장됐습니다. 지식 서고가 밝아지고 노바가 이 내용을 기억합니다.");
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

  const filtered = notes.filter((note) => matchesQuery(query, [note.title, note.category, note.content]));
  const groups = groupByDate(filtered, (note) => note.study_date);

  return (
    <Panel title="CS 전공지식 노트" kicker="Knowledge Archive">
      <form className="grid gap-4" onSubmit={handleSave}>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_2fr]">
          <LabeledField label="날짜">
            <input className="field" type="date" value={form.study_date} onChange={(e) => setForm({...form, study_date: e.target.value})} />
          </LabeledField>
          <LabeledField label="분야">
            <select className="field" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              {["운영체제", "네트워크", "데이터베이스", "자료구조", "알고리즘", "컴퓨터구조", "기타"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </LabeledField>
          <LabeledField label="제목">
            <input className="field" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="예: 프로세스와 스레드의 차이" />
          </LabeledField>
        </div>
        <LabeledField label="공부한 내용">
          <textarea className="field min-h-[180px]" value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} placeholder="공부한 내용을 정리해 적으세요. 마크다운 없이 자유롭게 작성해도 됩니다." />
        </LabeledField>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-lg bg-[#a78bfa] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#0b0820] transition hover:bg-[#c4b5fd] disabled:opacity-45" disabled={busy} type="submit">
            {editingId !== null ? "수정 저장" : "CS 노트 저장"}
          </button>
          {editingId !== null ? (
            <button className="sub-button" onClick={resetForm} type="button">새 노트로</button>
          ) : null}
          {status ? <span className="text-xs text-[#64748b]">{status}</span> : null}
        </div>
      </form>

      <div className="mt-6 mb-3 flex items-center justify-between gap-3">
        <input
          className="field max-w-[260px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목·분야·내용 검색"
        />
        <span className="shrink-0 font-mono text-[11px] text-[#94a3b8]">{filtered.length}개</span>
      </div>

      <div className="grid gap-4">
        {groups.length === 0 ? (
          <p className="text-sm text-[#94a3b8]">노트가 없습니다.</p>
        ) : (
          groups.map(([date, items]) => (
            <div key={date}>
              <p className="mb-1.5 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#7c3aed]/70">{prettyDate(date)}</p>
              <div className="grid gap-2">
                {items.map((note) => (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[#eef1f5] bg-[#f1f4f9] p-3" key={note.id}>
                    <button className="min-w-0 text-left" onClick={() => startEdit(note)} type="button">
                      <p className="truncate text-sm font-bold text-[#1e293b] hover:text-[#7c3aed]">{note.title}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#94a3b8]">{[note.category].filter(Boolean).join(" · ")}</p>
                    </button>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button className="rounded-md border border-[#e3e8ef] px-2 py-1 text-xs text-[#64748b] transition hover:border-[#c4b5fd]/50 hover:text-[#7c3aed]" onClick={() => startEdit(note)} type="button">수정</button>
                      <button className="rounded-md border border-[#e3e8ef] px-2 py-1 text-xs text-[#64748b] transition hover:border-[#ff6b6b]/50 hover:text-[#ff9a9a]" onClick={() => handleDelete(note.id)} type="button">삭제</button>
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

function AdminGate({onUnlocked}: {onUnlocked: () => void}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loginAdmin(password);
      onUnlocked();
    } catch {
      setError("비밀번호가 올바르지 않습니다.");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fb] px-5 text-[#1e293b]">
      <form
        onSubmit={submit}
        className="w-[min(92vw,380px)] rounded-2xl border border-[#e3e8ef] bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.06)]"
      >
        <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#0284c7]">Admin</p>
        <h1 className="mt-2 text-2xl font-black">관리자 인증</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          이 페이지는 정재훈 본인만 기록을 남길 수 있어요. 비밀번호를 입력해 주세요.
        </p>
        <input
          autoFocus
          className="field mt-5"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
        />
        {error ? <p className="mt-2 text-xs font-bold text-[#dc2626]">{error}</p> : null}
        <button
          className="mt-5 w-full rounded-lg bg-[#0284c7] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#0ea5e9] disabled:opacity-45"
          disabled={busy}
          type="submit"
        >
          {busy ? "확인 중…" : "입장"}
        </button>
        <a className="mt-4 block text-center font-mono text-xs text-[#94a3b8] transition hover:text-[#0284c7]" href="/">
          ← 마을로 돌아가기
        </a>
      </form>
    </main>
  );
}

const DAILY_GOALS = {workout: 30, coding: 120, study: 60};

function GoalRing({label, value, goal, color}: {label: string; value: number; goal: number; color: string}) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const R = 26;
  const C = 2 * Math.PI * R;
  const done = pct >= 1;
  return (
    <div className="grid place-items-center">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={R} fill="none" stroke="#e9edf3" strokeWidth="7" />
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
        <text x="38" y="43" textAnchor="middle" fontSize="15" fontWeight="800" fill={done ? color : "#1e293b"}>
          {done ? "✓" : `${Math.round(pct * 100)}%`}
        </text>
      </svg>
      <p className="mt-1 text-xs font-bold text-[#475569]">{label}</p>
      <p className="font-mono text-[10px] text-[#94a3b8]">{value}/{goal}분</p>
    </div>
  );
}

function GoalRings({workout, coding, study}: {workout: number; coding: number; study: number}) {
  const allDone = workout >= DAILY_GOALS.workout && coding >= DAILY_GOALS.coding && study >= DAILY_GOALS.study;
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <GoalRing label="운동" value={workout} goal={DAILY_GOALS.workout} color="#f97316" />
        <GoalRing label="코딩" value={coding} goal={DAILY_GOALS.coding} color="#0284c7" />
        <GoalRing label="공부" value={study} goal={DAILY_GOALS.study} color="#16a34a" />
      </div>
      <p className={`mt-3 rounded-lg border p-2.5 text-center text-xs font-bold ${allDone ? "border-[#16a34a]/30 bg-[#16a34a]/8 text-[#15803d]" : "border-[#e3e8ef] text-[#94a3b8]"}`}>
        {allDone ? "🎉 오늘 목표 세 개 다 채웠어요!" : "세 링을 다 채우면 하루 완성!"}
      </p>
    </div>
  );
}

function LabeledField({label, children}: {label: string; children: React.ReactNode}) {
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
  const projects = Object.values(a.project_minutes ?? {}).reduce((sum, m) => sum + Number(m || 0), 0);
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

const LEVEL_BG = [
  "#eef1f5",
  "rgba(2,132,199,0.22)",
  "rgba(2,132,199,0.42)",
  "rgba(2,132,199,0.66)",
  "rgba(2,132,199,0.92)"
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
    if (!byDate[cursor] || !predicate(byDate[cursor])) cursor = addDays(cursor, -1);
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
    recordStreak: streak((a) => activityRaw(a) > 0),
    workoutStreak: streak((a) => a.workout_done),
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
                  title={`${date} · ${byDate[date] ? "기록 있음" : "기록 없음"}`}
                  onClick={() => onPick(date)}
                  className="h-3 w-3 rounded-[3px] transition hover:scale-125"
                  style={{
                    background: LEVEL_BG[level],
                    outline: selected ? "1.5px solid #0284c7" : "none",
                    outlineOffset: selected ? "1px" : undefined
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 font-mono text-[10px] text-[#94a3b8]">
        <span>적음</span>
        {LEVEL_BG.map((bg, i) => (
          <span className="h-2.5 w-2.5 rounded-[2px]" key={i} style={{background: bg}} />
        ))}
        <span>많음</span>
      </div>
    </div>
  );
}

function RewardCard({reward, onClose}: {reward: {state: VillageState; date: string}; onClose: () => void}) {
  const {state} = reward;
  const lit = state.buildings
    .filter((b) => b.activity_score > 0 && b.building_id !== "central-plaza")
    .sort((a, b) => b.activity_score - a.activity_score)
    .slice(0, 6);
  const unlocked = state.unlocked_items.filter((item) => !item.startsWith("active-"));
  const npcLine =
    state.npcs.find((n) => n.npc_id === "guide-npc")?.status_text ?? state.npcs[0]?.status_text ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e293b]/40 p-4" onClick={onClose}>
      <div
        className="w-[min(94vw,520px)] rounded-2xl border border-[#0284c7]/30 bg-[#ffffff] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#0284c7]">Village Updated</p>
            <h2 className="mt-1 text-2xl font-black text-[#1e293b]">오늘 마을에 생긴 일 ✨</h2>
          </div>
          <button className="text-[#94a3b8] hover:text-[#1e293b]" onClick={onClose} type="button">✕</button>
        </div>

        <p className="mt-3 text-sm leading-6 text-[#475569]">{state.summary}</p>

        {lit.length > 0 ? (
          <div className="mt-4">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.14em] text-[#0369a1]">밝아진 건물</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {lit.map((b) => (
                <span
                  className="rounded-full border border-[#16a34a]/30 bg-[#16a34a]/10 px-3 py-1 text-xs font-bold text-[#15803d]"
                  key={b.building_id}
                >
                  {BUILDING_NAME[b.building_id] ?? b.building_id} · {b.light_level}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {unlocked.length > 0 ? (
          <div className="mt-4">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.14em] text-[#b45309]">새로 해금</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {unlocked.map((item) => (
                <span className="rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/10 px-3 py-1 text-xs font-bold text-[#b45309]" key={item}>
                  {UNLOCK_LABEL[item] ?? item}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {npcLine ? (
          <div className="mt-4 rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] p-3">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">루미의 한마디</p>
            <p className="mt-1 text-sm leading-6 text-[#334155]">“{npcLine}”</p>
          </div>
        ) : null}

        <a
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0284c7] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#06111f] transition hover:bg-[#0ea5e9]"
          href="/"
        >
          마을에서 직접 보기 →
        </a>
      </div>
    </div>
  );
}

function Panel({children, kicker, title}: {children: React.ReactNode; kicker: string; title: string}) {
  return (
    <section className="rounded-lg border border-[#e3e8ef] bg-[#ffffff] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#0284c7]">{kicker}</p>
      <h2 className="mt-2 text-xl font-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function NumberField({
  disabled,
  label,
  onChange,
  suffix,
  value
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: number) => void;
  suffix?: string;
  value: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="field-label">{label}</span>
      <div className="flex rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] focus-within:border-[#0284c7]">
        <input
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none disabled:opacity-45"
          disabled={disabled}
          min={0}
          onChange={(event) => onChange(Number(event.target.value))}
          type="number"
          value={value}
        />
        {suffix ? <span className="px-3 py-3 text-sm text-[#94a3b8]">{suffix}</span> : null}
      </div>
    </label>
  );
}

function Metric({label, value}: {label: string; value: string | number}) {
  return (
    <div className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] p-3">
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#0284c7]">{value}</p>
    </div>
  );
}

function AiUsageBar({usage}: {usage: AiUsage}) {
  const ratio = usage.daily_limit > 0 ? usage.today_count / usage.daily_limit : 0;
  const color = ratio >= 0.9 ? "#dc2626" : ratio >= 0.6 ? "#d97706" : "#0284c7";
  return (
    <div className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] p-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">오늘 AI 호출</p>
        <p className="font-mono text-xs font-black" style={{color}}>
          {usage.today_count} / {usage.daily_limit}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e3e8ef]">
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
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            className={
              active
                ? "rounded-full border border-[#22c55e]/45 bg-[#22c55e]/12 px-3 py-1.5 text-xs font-bold text-[#15803d]"
                : "rounded-full border border-[#e3e8ef] bg-[#f1f4f9] px-3 py-1.5 text-xs font-bold text-[#64748b] transition hover:border-[#cbd5e1] hover:text-[#1e293b]"
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

function Chip({children, onRemove}: {children: React.ReactNode; onRemove: () => void}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#0284c7]/25 bg-[#0284c7]/8 px-3 py-1.5 text-xs font-bold text-[#0369a1]">
      {children}
      <button className="text-[#94a3b8] hover:text-[#1e293b]" onClick={onRemove} type="button">
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
    changes.push(`중앙 광장과 가이드 NPC가 ${form.workout_type || "운동"} ${form.workout_minutes}분 기록으로 활기차집니다.`);
  }
  if (form.study_minutes > 0) {
    changes.push(`기술 스택 구역이 공부 ${form.study_minutes}분과 선택한 기술 주제에 따라 밝아집니다.`);
  }
  if (form.coding_minutes > 0) {
    changes.push(`코딩 ${form.coding_minutes}분이 개발자 NPC의 집중도와 마을 전체 활기에 반영됩니다.`);
  }

  const activeProjects = Object.entries(form.project_minutes).filter(([, minutes]) => minutes > 0);
  if (activeProjects.length > 0) {
    changes.push(`작업한 프로젝트 ${activeProjects.length}개의 건물이 작업 시간에 따라 밝아집니다.`);
  }
  if (form.github_commits > 0 || form.github_repos.length > 0) {
    changes.push(`GitHub 커밋 ${form.github_commits}개와 repo 기록이 프로젝트 구역 에너지로 들어갑니다.`);
  }
  if (form.memo.trim()) {
    changes.push("오늘 메모가 경험 기록관과 NPC 상태 문구에 반영됩니다.");
  }

  return changes.length > 0 ? changes : ["아직 기록이 없어 마을이 조용한 상태로 유지됩니다."];
}

function toggleValue(items: string[], item: string): string[] {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item];
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}
