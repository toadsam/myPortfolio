"use client";

import {useEffect, useState} from "react";
import {fetchTodayActivity, saveActivity, syncGithubActivity} from "@/lib/liveApi";
import type {ActivityInput, DailyActivity} from "@/types/live";

const initialForm: ActivityInput = {
  github_commits: 0,
  study_minutes: 0,
  workout_done: false,
  memo: "",
  mood: "steady",
};

export default function AdminPage() {
  const [form, setForm] = useState<ActivityInput>(initialForm);
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [status, setStatus] = useState("FastAPI 연결 확인 중");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const today = await fetchTodayActivity();
        setActivity(today);
        setForm({
          github_commits: today.github_commits,
          study_minutes: today.study_minutes,
          workout_done: today.workout_done,
          memo: today.memo,
          mood: today.mood,
        });
        setStatus("오늘 활동 데이터를 불러왔습니다.");
      } catch {
        setStatus("FastAPI 서버에 연결할 수 없습니다. backend 서버를 실행해주세요.");
      }
    }

    load();
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("저장 중");

    try {
      const saved = await saveActivity(form);
      setActivity(saved);
      setStatus("저장 완료. 3D 마을 상태가 갱신됩니다.");
    } catch {
      setStatus("저장 실패. FastAPI 서버 상태를 확인해주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGithubSync() {
    setIsSaving(true);
    setStatus("GitHub 동기화 중");

    try {
      const result = await syncGithubActivity();
      setActivity(result.updated_activity);
      setForm((current) => ({...current, github_commits: result.commits}));
      setStatus(`${result.username} 오늘 커밋 ${result.commits}개를 반영했습니다.`);
    } catch {
      setStatus("GitHub 동기화 실패. 토큰 또는 FastAPI 서버를 확인해주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050d1a] px-5 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#00d4ff]">{">"} Live Village Admin</p>
          <h1 className="mt-2 text-3xl font-black">정재훈 마을 연동 앱</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
            오늘의 활동을 저장하면 FastAPI 백엔드가 마을 상태를 계산하고, 방문자용 3D 마을에 반영합니다.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <form className="rounded-xl border border-[#00d4ff]/20 bg-[#0a1525] p-5" onSubmit={handleSave}>
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
                  <span className="mt-1 block text-sm text-white/55">완료하면 광장 장식이 활성화됩니다.</span>
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
                  <option value="steady">steady</option>
                  <option value="focused">focused</option>
                  <option value="tired">tired</option>
                  <option value="proud">proud</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-white/45">Today memo</span>
                <textarea
                  className="min-h-28 rounded-lg border border-white/10 bg-[#050d1a] px-3 py-3 text-white outline-none focus:border-[#ff6600]"
                  onChange={(event) => setForm((current) => ({...current, memo: event.target.value}))}
                  placeholder="오늘 한 일이나 방문자에게 보여줄 상태 메모"
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

          <aside className="rounded-xl border border-white/10 bg-[#0a1525] p-5">
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#00d4ff]">Status</p>
            <p className="mt-3 text-sm leading-6 text-white/65">{status}</p>

            {activity ? (
              <dl className="mt-5 grid gap-3 text-sm">
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <dt className="font-mono text-xs text-white/35">date</dt>
                  <dd className="mt-1 font-bold">{activity.date}</dd>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <dt className="font-mono text-xs text-white/35">commits</dt>
                  <dd className="mt-1 font-bold text-[#00d4ff]">{activity.github_commits}</dd>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <dt className="font-mono text-xs text-white/35">study</dt>
                  <dd className="mt-1 font-bold text-[#00ff88]">{activity.study_minutes} minutes</dd>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <dt className="font-mono text-xs text-white/35">workout</dt>
                  <dd className="mt-1 font-bold text-[#ff9a6c]">{activity.workout_done ? "done" : "not yet"}</dd>
                </div>
              </dl>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
