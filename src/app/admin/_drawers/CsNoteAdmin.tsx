"use client";

import {useEffect, useState} from "react";
import type * as React from "react";
import {
  createCsNote,
  deleteCsNote,
  fetchCsNotes,
  updateCsNote
} from "@/lib/liveApi";
import type {CsNote} from "@/types/live";
import {LabeledField, Panel} from "../_components/AdminParts";
import {prettyDate} from "../_lib/activity";
import {groupByDate, matchesQuery} from "../_lib/listing";

export function CsNoteAdmin({defaultDate}: {defaultDate: string}) {
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
