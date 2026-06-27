"use client";

import {useEffect, useMemo, useState} from "react";
import type * as React from "react";
import {projects} from "@/data/projects";
import {skills} from "@/data/skills";
import {fetchTodayActivity, fetchVillageState, saveActivity, syncGithubActivity} from "@/lib/liveApi";
import type {ActivityInput, VillageState} from "@/types/live";

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

  useEffect(() => {
    void loadToday();
  }, []);

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

  async function loadToday() {
    try {
      const [activity, state] = await Promise.all([fetchTodayActivity(), fetchVillageState()]);
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
      setVillageState(state);
      setStatus("오늘의 기록을 불러왔습니다.");
    } catch {
      setStatus("FastAPI 백엔드에 연결하지 못했습니다. 백엔드를 실행한 뒤 새로고침하세요.");
    }
  }

  async function handleSave(event?: React.FormEvent) {
    event?.preventDefault();
    setIsSaving(true);
    setStatus("오늘의 기록을 저장하고 마을 상태를 다시 계산하는 중입니다.");

    try {
      await saveActivity(normalizeForm(form));
      const state = await fetchVillageState();
      setVillageState(state);
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

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <form onSubmit={handleSave}>
        <header className="border-b border-white/10 bg-[#0b1018]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#00d4ff]">Daily Village Journal</p>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">오늘의 기록이 마을을 바꿉니다</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                운동, 공부, 코딩, 프로젝트 작업, GitHub 활동을 기록하면 포트폴리오 마을의 조명과 NPC 상태가 자동으로 달라집니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="rounded-lg border border-[#00d4ff]/35 px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#9beaff] transition hover:bg-[#00d4ff]/10"
                href="/"
              >
                마을 보기
              </a>
              <button
                className="rounded-lg bg-[#00d4ff] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#06111f] transition hover:bg-[#79e8ff] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={isSaving}
                type="submit"
              >
                오늘 기록 저장
              </button>
            </div>
          </div>
        </header>

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
                  <div className="rounded-lg border border-white/10 bg-[#070b12] px-3 py-3">
                    <input
                      className="w-full accent-[#00d4ff]"
                      max={100}
                      min={0}
                      onChange={(event) => updateForm({focus_score: Number(event.target.value)})}
                      type="range"
                      value={form.focus_score}
                    />
                    <div className="mt-2 flex justify-between font-mono text-xs text-white/45">
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
                  <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3">
                    <span>
                      <span className="block text-sm font-black">오늘 운동 완료</span>
                      <span className="mt-1 block text-xs text-white/45">운동 기록은 중앙 광장과 가이드 NPC 상태에 반영됩니다.</span>
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
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{project.description}</p>
                        </div>
                        <span className="rounded-full border border-[#00d4ff]/25 px-2 py-0.5 font-mono text-[11px] text-[#9beaff]">
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
            <Panel title="오늘 기록 요약" kicker="Village Impact">
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="운동" value={form.workout_done ? `${form.workout_minutes}분` : "미완료"} />
                  <Metric label="공부" value={`${form.study_minutes}분`} />
                  <Metric label="코딩" value={`${form.coding_minutes}분`} />
                  <Metric label="프로젝트" value={`${totalProjectMinutes}분`} />
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                  <p className="font-black text-[#00d4ff]">저장하면 바뀌는 것</p>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/60">
                    {predictedChanges.map((change) => (
                      <li className="flex gap-2" key={change}>
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00d4ff]" />
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
                    <div className="rounded-lg border border-white/10 bg-[#070b12] p-3" key={project.id}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold">{project.title}</span>
                        <span className="font-mono text-xs text-[#00d4ff]">{minutes}분</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-white/42">이 프로젝트 건물 조명과 프로젝트 NPC 추천에 반영됩니다.</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/45">
                  작업한 프로젝트 시간을 입력하면 해당 건물이 밝아집니다.
                </p>
              )}
            </Panel>

            <Panel title="현재 마을 상태" kicker="Live Preview">
              {villageState ? (
                <div className="grid gap-3">
                  <p className="text-sm leading-6 text-white/58">{villageState.summary}</p>
                  <div className="grid gap-2">
                    {villageState.buildings
                      .filter((building) => building.activity_score > 0)
                      .sort((a, b) => b.activity_score - a.activity_score)
                      .slice(0, 6)
                      .map((building) => (
                        <div className="rounded-lg border border-white/10 bg-[#070b12] p-3" key={building.building_id}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-xs font-black text-white/60">{building.building_id}</span>
                            <span className="rounded-full border border-[#00d4ff]/25 px-2 py-0.5 text-xs text-[#9beaff]">
                              {building.light_level}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/42">{building.reason}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/45">
                  저장 후 마을 상태가 표시됩니다.
                </p>
              )}
            </Panel>

            <div className="rounded-lg border border-white/10 bg-[#0b1018] p-4">
              <p className="text-sm leading-6 text-white/58">{status}</p>
              <button
                className="mt-4 w-full rounded-lg bg-[#00d4ff] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#06111f] transition hover:bg-[#79e8ff] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={isSaving}
                type="submit"
              >
                기록 저장하고 마을 갱신
              </button>
            </div>
          </aside>
        </div>
      </form>
    </main>
  );
}

function Panel({children, kicker, title}: {children: React.ReactNode; kicker: string; title: string}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b1018] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#00d4ff]">{kicker}</p>
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
      <div className="flex rounded-lg border border-white/10 bg-[#070b12] focus-within:border-[#00d4ff]">
        <input
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none disabled:opacity-45"
          disabled={disabled}
          min={0}
          onChange={(event) => onChange(Number(event.target.value))}
          type="number"
          value={value}
        />
        {suffix ? <span className="px-3 py-3 text-sm text-white/35">{suffix}</span> : null}
      </div>
    </label>
  );
}

function Metric({label, value}: {label: string; value: string | number}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-white/35">{label}</p>
      <p className="mt-1 text-xl font-black text-[#00d4ff]">{value}</p>
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
                ? "rounded-full border border-[#7ee787]/45 bg-[#7ee787]/12 px-3 py-1.5 text-xs font-bold text-[#baffd2]"
                : "rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-bold text-white/50 transition hover:border-white/25 hover:text-white"
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
    <span className="inline-flex items-center gap-2 rounded-full border border-[#00d4ff]/25 bg-[#00d4ff]/8 px-3 py-1.5 text-xs font-bold text-[#c8efff]">
      {children}
      <button className="text-white/38 hover:text-white" onClick={onRemove} type="button">
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
