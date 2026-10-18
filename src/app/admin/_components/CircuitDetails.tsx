"use client";

/**
 * 회로의 부속 입력 — 운동 종류 · 공부 주제 · 커밋/레포. 블록 머리의 "상세" 글자 버튼으로
 * 접혀 있다. 매일 만지는 건 분량이고, 이건 가끔이다. 데이터는 전부 그대로 남긴다.
 */

import {useState} from "react";
import type {ActivityInput} from "@/types/live";
import {toggleValue, unique} from "../_lib/activity";
import {quickTopics, workoutTypes} from "../_lib/options";
import {sfx} from "../_lib/sfx";

export function WorkoutDetails({
  form,
  updateForm
}: {
  form: ActivityInput;
  updateForm: (patch: Partial<ActivityInput>) => void;
}) {
  return (
    <div className="ab-tags">
      {workoutTypes.map(type => (
        <button
          aria-pressed={form.workout_type === type}
          className="ab-tag"
          key={type}
          onClick={() => {
            sfx.tick(0.3);
            updateForm({workout_type: form.workout_type === type ? "" : type});
          }}
          type="button"
        >
          {type}
        </button>
      ))}
    </div>
  );
}

export function StudyDetails({
  form,
  updateForm
}: {
  form: ActivityInput;
  updateForm: (patch: Partial<ActivityInput>) => void;
}) {
  const [input, setInput] = useState("");
  function add() {
    const next = input.trim();
    if (!next) return;
    updateForm({
      study_topics: unique([...form.study_topics, next]),
      studied_tech: unique([...form.studied_tech, next])
    });
    setInput("");
    sfx.fuse();
  }
  return (
    <>
      <div className="ab-inline-add">
        <input
          aria-label="공부한 주제"
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="공부한 주제: React Query"
          value={input}
        />
        <button className="ab-chip" onClick={add} type="button">
          추가
        </button>
      </div>
      <div className="ab-tags">
        {unique([...quickTopics, ...form.study_topics]).map(item => (
          <button
            aria-pressed={form.studied_tech.includes(item)}
            className="ab-tag"
            key={item}
            onClick={() => {
              sfx.tick(0.3);
              updateForm({
                studied_tech: toggleValue(form.studied_tech, item),
                study_topics: unique([...form.study_topics, item])
              });
            }}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
    </>
  );
}

export function CodingDetails({
  form,
  updateForm
}: {
  form: ActivityInput;
  updateForm: (patch: Partial<ActivityInput>) => void;
}) {
  const [input, setInput] = useState("");
  function add() {
    const next = input.trim();
    if (!next) return;
    updateForm({github_repos: unique([...form.github_repos, next])});
    setInput("");
    sfx.fuse();
  }
  return (
    <>
      <div className="ab-stepper">
        <span>커밋</span>
        <button
          aria-label="커밋 하나 빼기"
          className="ab-chip"
          onClick={() => {
            sfx.tick(0.2);
            updateForm({github_commits: Math.max(0, form.github_commits - 1)});
          }}
          type="button"
        >
          −
        </button>
        <b>{form.github_commits}</b>
        <button
          aria-label="커밋 하나 더하기"
          className="ab-chip"
          onClick={() => {
            sfx.tick(0.5);
            updateForm({github_commits: form.github_commits + 1});
          }}
          type="button"
        >
          +
        </button>
        <small>더보기의 GitHub 동기화로도 채워져요</small>
      </div>
      <div className="ab-inline-add">
        <input
          aria-label="오늘 만진 레포"
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="오늘 만진 레포: toadsam/FestFlow"
          value={input}
        />
        <button className="ab-chip" onClick={add} type="button">
          추가
        </button>
      </div>
      {form.github_repos.length ? (
        <div className="ab-tags">
          {form.github_repos.map(repo => (
            <span aria-pressed="true" className="ab-tag" key={repo}>
              {repo}
              <button
                aria-label={`${repo} 빼기`}
                className="ab-tag-x"
                onClick={() =>
                  updateForm({
                    github_repos: form.github_repos.filter(r => r !== repo)
                  })
                }
                type="button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}
