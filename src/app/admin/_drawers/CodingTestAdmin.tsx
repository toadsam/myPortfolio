"use client";

import {useEffect, useState} from "react";
import type * as React from "react";
import {
  createCodingTest,
  deleteCodingTest,
  fetchCodingTests,
  updateCodingTest
} from "@/lib/liveApi";
import type {CodingTestLog} from "@/types/live";
import {LabeledField, Panel} from "../_components/AdminParts";
import {prettyDate} from "../_lib/activity";
import {groupByDate, matchesQuery} from "../_lib/listing";

export function CodingTestAdmin({defaultDate}: {defaultDate: string}) {
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
