"use client";

import {useEffect, useState} from "react";
import {ApiError, fetchTodayActivity, fetchVillageState, saveActivity, syncGithubActivity} from "@/lib/liveApi";
import type {ActivityInput, DailyActivity, VillageState} from "@/types/live";

const initialForm: ActivityInput = {
  github_commits: 0,
  study_minutes: 0,
  workout_done: false,
  memo: "",
  mood: "steady"
};

const moodOptions = [
  {value: "steady", label: "차분함"},
  {value: "focused", label: "집중"},
  {value: "tired", label: "피곤함"},
  {value: "proud", label: "뿌듯함"}
];

export default function AdminPage() {
  const [form, setForm] = useState<ActivityInput>(initialForm);
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [villageState, setVillageState] = useState<VillageState | null>(null);
  const [status, setStatus] = useState("FastAPI 연결을 확인하는 중입니다.");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const [today, state] = await Promise.all([fetchTodayActivity(), fetchVillageState()]);
      setActivity(today);
      setVillageState(state);
      setForm({
        github_commits: today.github_commits,
        study_minutes: today.study_minutes,
        workout_done: today.workout_done,
        memo: today.memo,
        mood: today.mood
      });
      setStatus("오늘 활동 데이터를 불러왔습니다.");
    } catch {
      setStatus("FastAPI 서버에 연결할 수 없습니다. 백엔드 서버를 먼저 실행해 주세요.");
    }
  }

  async function refreshVillageState() {
    try {
      const state = await fetchVillageState();
      setVillageState(state);
    } catch {
      setVillageState(null);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("저장 중입니다.");

    try {
      const saved = await saveActivity(form);
      setActivity(saved);
      setStatus("저장 완료. 3D 마을 조명과 NPC 상태에 반영됩니다.");
      await refreshVillageState();
    } catch (error) {
      setStatus(error instanceof ApiError && error.detail ? `저장 실패: ${error.detail}` : "저장 실패. FastAPI 서버 상태를 확인해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGithubSync() {
    setIsSaving(true);
    setStatus("GitHub 활동을 동기화하는 중입니다.");

    try {
      const result = await syncGithubActivity();
      setActivity(result.updated_activity);
      setForm((current) => ({...current, github_commits: result.commits}));
      setStatus(
        result.warning
          ? result.warning
          : `${result.username} 계정의 오늘 커밋 ${result.commits}개를 반영했습니다.`
      );
      await refreshVillageState();
    } catch (error) {
      setStatus(error instanceof ApiError && error.detail ? `GitHub 동기화 실패: ${error.detail}` : "GitHub 동기화 실패. 토큰 또는 서버 상태를 확인해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050d1a] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#00d4ff]">{">"} Live Village Admin</p>
            <h1 className="mt-2 text-3xl font-black">오늘의 마을 상태 관리</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
              공부 시간, GitHub 커밋, 운동 여부, 메모를 저장하면 백엔드가 마을 조명과 NPC 상태를 다시 계산합니다.
            </p>
          </div>
          <a
            className="inline-flex rounded-lg border border-[#00d4ff]/35 px-4 py-2.5 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#00d4ff] transition hover:bg-[#00d4ff]/10"
            href="/"
          >
            마을로 돌아가기
          </a>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <form className="rounded-lg border border-[#00d4ff]/20 bg-[#0a1525] p-5" onSubmit={handleSave}>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-white/45">GitHub commits</span>
                <input
                  className="rounded-lg border border-white/10 bg-[#050d1a] px-3 py-3 text-white outline-none focus:border-[#00d4ff]"
                  min={0}
                  onChange={(event) => setForm((current) => ({...current, github_commits: Number(event.target.value)}))}
                  type="number"
                  value={form.github_commits}
                />
              </label>

              <label className="grid gap-2">
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-white/45">Study minutes</span>
                <input
                  className="rounded-lg border border-white/10 bg-[#050d1a] px-3 py-3 text-white outline-none focus:border-[#00ff88]"
                  min={0}
                  onChange={(event) => setForm((current) => ({...current, study_minutes: Number(event.target.value)}))}
                  type="number"
                  value={form.study_minutes}
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#050d1a] px-3 py-3">
                <span>
                  <span className="block font-mono text-xs font-black uppercase tracking-[0.16em] text-white/45">Workout done</span>
                  <span className="mt-1 block text-sm text-white/55">완료로 표시하면 광장 장식과 가이드 NPC 상태가 바뀝니다.</span>
                </span>
                <input
                  checked={form.workout_done}
                  className="h-5 w-5"
                  onChange={(event) => setForm((current) => ({...current, workout_done: event.target.checked}))}
                  type="checkbox"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-white/45">Mood</span>
                <select
                  className="rounded-lg border border-white/10 bg-[#050d1a] px-3 py-3 text-white outline-none focus:border-[#aa44ff]"
                  onChange={(event) => setForm((current) => ({...current, mood: event.target.value}))}
                  value={form.mood}
                >
                  {moodOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-white/45">Today memo</span>
                <textarea
                  className="min-h-28 rounded-lg border border-white/10 bg-[#050d1a] px-3 py-3 text-white outline-none focus:border-[#ff6600]"
                  onChange={(event) => setForm((current) => ({...current, memo: event.target.value}))}
                  placeholder="오늘 작업 내용이나 방문자에게 보여줄 상태 메모"
                  value={form.memo}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="rounded-lg bg-[#00d4ff] px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#04101e] disabled:opacity-50"
                disabled={isSaving}
                type="submit"
              >
                Save activity
              </button>
              <button
                className="rounded-lg border border-[#00ff88]/45 px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#00ff88] disabled:opacity-50"
                disabled={isSaving}
                onClick={handleGithubSync}
                type="button"
              >
                Sync GitHub
              </button>
            </div>
          </form>

          <aside className="grid gap-5">
            <section className="rounded-lg border border-white/10 bg-[#0a1525] p-5">
              <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#00d4ff]">Status</p>
              <p className="mt-3 text-sm leading-6 text-white/65">{status}</p>

              {activity ? (
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
                  <Metric label="date" value={activity.date} />
                  <Metric label="commits" value={activity.github_commits} color="#00d4ff" />
                  <Metric label="study" value={`${activity.study_minutes} minutes`} color="#00ff88" />
                  <Metric label="workout" value={activity.workout_done ? "done" : "not yet"} color="#ff9a6c" />
                </dl>
              ) : null}
            </section>

            <section className="rounded-lg border border-white/10 bg-[#0a1525] p-5">
              <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#00ff88]">Village Preview</p>
              {villageState ? (
                <>
                  <p className="mt-3 text-sm leading-6 text-white/65">{villageState.summary}</p>
                  <div className="mt-4 grid gap-2">
                    {villageState.buildings.slice(0, 5).map((building) => (
                      <div className="rounded-lg border border-white/8 bg-white/[0.04] p-3" key={building.building_id}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-xs font-black text-white/60">{building.building_id}</span>
                          <span className="font-mono text-xs font-black text-[#00d4ff]">{building.light_level}</span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-white/45">{building.reason}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-white/45">마을 상태를 불러오지 못했습니다.</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({label, value, color = "#ffffff"}: {label: string; value: string | number; color?: string}) {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <dt className="font-mono text-xs text-white/35">{label}</dt>
      <dd className="mt-1 font-bold" style={{color}}>{value}</dd>
    </div>
  );
}
