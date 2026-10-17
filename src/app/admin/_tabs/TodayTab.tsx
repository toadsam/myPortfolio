"use client";

/**
 * 배전반 탭 — 오늘 기록을 넣는 곳.
 *
 * 휴대폰에서는 위에서 아래로 컨디션 → 주 회로 → 프로젝트 회로 → 마을 미리보기.
 * 넓은 화면에서는 마을 미리보기가 오른쪽 기둥으로 빠져 붙어 있는다(admin.css).
 * 값을 만지는 동안 지도가 같이 보여야 "기록이 마을을 켠다"가 손으로 느껴진다.
 */

import {useEffect, useMemo, useRef, useState} from "react";
import {projects} from "@/data/projects";
import type {NpcPreview} from "@/lib/villageLightPreview";
import type {ActivityInput} from "@/types/live";
import {CircuitCard} from "../_components/CircuitCard";
import {LiveVillagePreview} from "../_components/LiveVillagePreview";
import {NpcReactions} from "../_components/SwitchboardBits";
import {toggleValue, unique} from "../_lib/activity";
import {
  DAILY_GOALS,
  PLAZA_ONLY,
  SKILL_BUILDINGS,
  moodOptions,
  projectBuildingIds,
  quickTopics,
  workoutTypes
} from "../_lib/options";
import {buzz, sfx} from "../_lib/sfx";

/** 오늘 열릴 수 있는 장식 전부. 잠긴 것도 보여야 무엇을 채우면 되는지 안다.
 *  이름은 `previewUnlocks` 가 돌려주는 것과 같아야 켜진다. */
const ALL_UNLOCKS: [name: string, how: string][] = [
  ["훈련 동상", "운동 기록"],
  ["연구소 신호등", "커밋 5개"],
  ["학습 분수", "공부 120분"],
  ["몰입 터미널", "코딩 180분"]
];

const MOOD_FACE: Record<string, string> = {
  steady: "M8 15h8M9 10h.01M15 10h.01",
  focused: "M8 15c1.2 1 2.6 1.5 4 1.5s2.8-.5 4-1.5M8 9.5h2.5M13.5 9.5H16",
  tired: "M8 16c1.2-1 2.6-1.5 4-1.5s2.8.5 4 1.5M9 10h.01M15 10h.01",
  proud:
    "M8 14.5c1.2 1.3 2.6 2 4 2s2.8-.7 4-2M8 10l1.5-1.5L11 10M13 10l1.5-1.5L16 10"
};

export function TodayTab({
  form,
  updateForm,
  setProjectMinutes,
  onMinuteLever,
  onProjectLever,
  npcPreview,
  unlockPreview,
  predictedChanges,
  studyOverrides,
  status,
  registerFocus,
  pickBuilding,
  isPicked,
  pickNote
}: {
  form: ActivityInput;
  updateForm: (patch: Partial<ActivityInput>) => void;
  setProjectMinutes: (projectId: string, minutes: number) => void;
  onMinuteLever: (
    key: "study_minutes" | "coding_minutes",
    next: boolean,
    fallback: number
  ) => void;
  onProjectLever: (projectId: string, next: boolean) => void;
  npcPreview: NpcPreview[];
  unlockPreview: string[];
  predictedChanges: string[];
  studyOverrides: Record<string, number>;
  status: string;
  registerFocus: (ids: string[], focus: () => void) => void;
  pickBuilding: (buildingId: string) => void;
  isPicked: (ids: string[]) => boolean;
  pickNote: string | null;
}) {
  const [hoverIds, setHoverIds] = useState<string[] | null>(null);
  const [hoverName, setHoverName] = useState<string | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [repoInput, setRepoInput] = useState("");
  // 휴대폰 한 줄 화면에서는 지도를 납작하게 — 정사각이면 화면 하나를 지도가 다 먹는다
  const narrow = useNarrow();

  const visibleProjects = useMemo(
    () =>
      showAllProjects
        ? projects
        : projects.filter(p => (form.project_minutes[p.id] ?? 0) > 0),
    [form.project_minutes, showAllProjects]
  );
  const projectTotal = Object.values(form.project_minutes).reduce(
    (sum, m) => sum + Number(m || 0),
    0
  );

  function addTopic() {
    const next = topicInput.trim();
    if (!next) return;
    updateForm({
      study_topics: unique([...form.study_topics, next]),
      studied_tech: unique([...form.studied_tech, next])
    });
    setTopicInput("");
    sfx.fuse();
  }

  function addRepo() {
    const next = repoInput.trim();
    if (!next) return;
    updateForm({github_repos: unique([...form.github_repos, next])});
    setRepoInput("");
    sfx.fuse();
  }

  return (
    <section className="ab-tab ab-today">
      <div className="ab-col-main">
        {/* ── 컨디션: 회로가 아니라 늘 붙어 있는 계기 ── */}
        <div className="ab-card">
          <div className="ab-sec-h">
            <h2>오늘 컨디션</h2>
            <small>계기판</small>
          </div>
          <div className="ab-moods">
            {moodOptions.map(option => (
              <button
                aria-pressed={form.mood === option.value}
                className="ab-mood"
                key={option.value}
                onClick={() => {
                  sfx.tick();
                  buzz(8);
                  updateForm({mood: option.value});
                }}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d={MOOD_FACE[option.value] ?? MOOD_FACE.steady} />
                </svg>
                {option.label}
              </button>
            ))}
          </div>
          <div className="ab-focus-row">
            <FocusDial
              onChange={v => updateForm({focus_score: v})}
              value={form.focus_score}
            />
            <label className="ab-memo">
              <span>오늘 한 줄 · 집중도는 왼쪽 다이얼을 돌리세요</span>
              <input
                autoComplete="off"
                id="admin-memo"
                onChange={e => updateForm({memo: e.target.value})}
                placeholder="AjouFesta 결산 정리하고 운동까지"
                value={form.memo}
              />
            </label>
          </div>
        </div>

        {/* ── 주 회로 ── */}
        <div>
          <div className="ab-sec-h ab-sec-gap">
            <h2>주 회로</h2>
            <small>레버 · 게이지 끌기 · 버튼</small>
          </div>
          <div className="ab-circuits">
            <CircuitCard
              buildingIds={PLAZA_ONLY}
              details={
                <div className="ab-tags">
                  {workoutTypes.map(type => (
                    <button
                      aria-pressed={form.workout_type === type}
                      className="ab-tag"
                      key={type}
                      onClick={() => {
                        sfx.tick();
                        updateForm({
                          workout_type: form.workout_type === type ? "" : type
                        });
                      }}
                      type="button"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              }
              goal={DAILY_GOALS.workout}
              id="workout"
              max={DAILY_GOALS.workout * 3}
              name="운동"
              note="중앙 광장과 가이드 NPC"
              onChange={v =>
                updateForm({workout_minutes: v, workout_done: v > 0})
              }
              onHover={setHoverIds}
              picked={isPicked(PLAZA_ONLY)}
              registerFocus={registerFocus}
              value={form.workout_done ? form.workout_minutes : 0}
            />
            <CircuitCard
              buildingIds={SKILL_BUILDINGS}
              details={
                <>
                  <div className="ab-inline-add">
                    <input
                      aria-label="공부한 주제"
                      onChange={e => setTopicInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTopic();
                        }
                      }}
                      placeholder="공부한 주제: React Query"
                      value={topicInput}
                    />
                    <button
                      className="ab-chip-btn"
                      onClick={addTopic}
                      type="button"
                    >
                      추가
                    </button>
                  </div>
                  <div className="ab-tags">
                    {unique([...quickTopics, ...form.study_topics]).map(
                      item => (
                        <button
                          aria-pressed={form.studied_tech.includes(item)}
                          className="ab-tag"
                          key={item}
                          onClick={() => {
                            sfx.tick();
                            updateForm({
                              studied_tech: toggleValue(
                                form.studied_tech,
                                item
                              ),
                              study_topics: unique([...form.study_topics, item])
                            });
                          }}
                          type="button"
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </>
              }
              goal={DAILY_GOALS.study}
              id="study"
              max={DAILY_GOALS.study * 3}
              name="공부"
              note="기술 건물 다섯 채"
              onChange={v => updateForm({study_minutes: v})}
              onHover={setHoverIds}
              onToggle={next => onMinuteLever("study_minutes", next, 30)}
              picked={isPicked(SKILL_BUILDINGS)}
              registerFocus={registerFocus}
              value={form.study_minutes}
            />
            <CircuitCard
              buildingIds={PLAZA_ONLY}
              details={
                <>
                  <div className="ab-stepper">
                    <span>커밋</span>
                    <button
                      aria-label="커밋 하나 빼기"
                      className="ab-chip-btn"
                      onClick={() => {
                        sfx.tick();
                        updateForm({
                          github_commits: Math.max(0, form.github_commits - 1)
                        });
                      }}
                      type="button"
                    >
                      −
                    </button>
                    <b>{form.github_commits}</b>
                    <button
                      aria-label="커밋 하나 더하기"
                      className="ab-chip-btn"
                      onClick={() => {
                        sfx.tick();
                        updateForm({github_commits: form.github_commits + 1});
                      }}
                      type="button"
                    >
                      +
                    </button>
                    <small>더보기 메뉴의 GitHub 동기화로도 채워져요</small>
                  </div>
                  <div className="ab-inline-add">
                    <input
                      aria-label="오늘 만진 레포"
                      onChange={e => setRepoInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRepo();
                        }
                      }}
                      placeholder="오늘 만진 레포: toadsam/FestFlow"
                      value={repoInput}
                    />
                    <button
                      className="ab-chip-btn"
                      onClick={addRepo}
                      type="button"
                    >
                      추가
                    </button>
                  </div>
                  {form.github_repos.length ? (
                    <div className="ab-tags">
                      {form.github_repos.map(repo => (
                        <span className="ab-tag" aria-pressed="true" key={repo}>
                          {repo}
                          <button
                            aria-label={`${repo} 빼기`}
                            className="ab-tag-x"
                            onClick={() =>
                              updateForm({
                                github_repos: form.github_repos.filter(
                                  r => r !== repo
                                )
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
              }
              goal={DAILY_GOALS.coding}
              id="coding"
              max={DAILY_GOALS.coding * 3}
              name="코딩"
              note="레포가 프로젝트와 겹치면 그 건물도"
              onChange={v => updateForm({coding_minutes: v})}
              onHover={setHoverIds}
              onToggle={next => onMinuteLever("coding_minutes", next, 60)}
              value={form.coding_minutes}
            />
          </div>
        </div>

        {/* ── 프로젝트 회로 ── */}
        <div>
          <div className="ab-proj-h">
            <div className="ab-sec-h">
              <h2>프로젝트 회로</h2>
              <small>합계 {projectTotal}분</small>
            </div>
            <button
              className="ab-link-btn"
              onClick={() => {
                sfx.tick();
                setShowAllProjects(s => !s);
              }}
              type="button"
            >
              {showAllProjects ? "켜진 것만" : `모두 보기 (${projects.length})`}
            </button>
          </div>
          <div className="ab-circuits">
            {visibleProjects.length ? (
              visibleProjects.map(project => (
                <CircuitCard
                  buildingIds={projectBuildingIds[project.id]}
                  goal={60}
                  id={project.id}
                  key={project.id}
                  bonus={false}
                  max={180}
                  name={project.title}
                  note={project.description}
                  onChange={v => setProjectMinutes(project.id, v)}
                  onHover={setHoverIds}
                  onToggle={next => onProjectLever(project.id, next)}
                  picked={isPicked(projectBuildingIds[project.id] ?? [])}
                  registerFocus={registerFocus}
                  value={form.project_minutes[project.id] ?? 0}
                />
              ))
            ) : (
              <p className="ab-hint">
                켜진 프로젝트 회로가 없어요. 모두 보기를 눌러 켜세요.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 마을 미리보기 기둥 ── */}
      <aside className="ab-col-side">
        <div className="ab-card ab-map-card">
          <div className="ab-sec-h">
            <h2>마을 미리보기</h2>
            <small className={pickNote ? "is-warn" : undefined}>
              {pickNote ?? hoverName ?? "건물을 누르면 그 회로로"}
            </small>
          </div>
          <div className="ab-map-wrap">
            <LiveVillagePreview
              form={form}
              highlightIds={hoverIds ?? undefined}
              onHoverBuilding={setHoverName}
              onPickBuilding={id => {
                // 지도는 탭 바깥(오른쪽 기둥)에 있을 수도 있어서 펼쳐 둔다
                if (projects.some(p => `project-${p.id}` === id))
                  setShowAllProjects(true);
                window.setTimeout(() => pickBuilding(id), 80);
              }}
              overrides={studyOverrides}
              study={{codingToday: 0, codingTotal: 0, csToday: 0, csTotal: 0}}
              wide={narrow}
            />
          </div>
          <NpcReactions npcs={npcPreview} />
          <p className="ab-eyebrow ab-mt">오늘 열리는 장식</p>
          <div className="ab-unlocks">
            {ALL_UNLOCKS.map(([name, how]) => {
              const on = unlockPreview.includes(name);
              return (
                <span className={`ab-unlock${on ? " is-on" : ""}`} key={name}>
                  {on ? name : `${name} · ${how}`}
                </span>
              );
            })}
          </div>
        </div>
        <div className="ab-card">
          <p className="ab-eyebrow">송전하면 바뀌는 것</p>
          <ul className="ab-changes">
            {predictedChanges.map(change => (
              <li key={change}>{change}</li>
            ))}
          </ul>
          <p className="ab-status">{status}</p>
        </div>
      </aside>
    </section>
  );
}

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

/** 집중도 다이얼 — 돌리는 손맛. 270° 호 위를 끌어 0~100 을 고른다. */
function FocusDial({
  value,
  onChange
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(value);

  function setFrom(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let a =
      (Math.atan2(
        e.clientY - (r.top + r.height / 2),
        e.clientX - (r.left + r.width / 2)
      ) *
        180) /
      Math.PI;
    a = (a - 135 + 360) % 360;
    if (a > 270) a = a > 315 ? 0 : 270;
    const v = Math.round((a / 270) * 100);
    if (v === value) return;
    if (Math.abs(v - last.current) >= 5) {
      sfx.tick();
      buzz(4);
      last.current = v;
    }
    onChange(v);
  }

  const ARC = 122.5;
  return (
    <div
      aria-label="집중도"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value}
      className="ab-dial"
      onKeyDown={e => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(Math.min(100, value + 5));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(Math.max(0, value - 5));
        }
      }}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setFrom(e);
      }}
      onPointerMove={e => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) setFrom(e);
      }}
      ref={ref}
      role="slider"
      tabIndex={0}
    >
      <svg viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          fill="none"
          r="26"
          stroke="#232b34"
          strokeDasharray={`${ARC} 200`}
          strokeWidth="6"
          transform="rotate(135 32 32)"
        />
        <circle
          cx="32"
          cy="32"
          fill="none"
          r="26"
          stroke="#ff9d38"
          strokeDasharray={`${(value / 100) * ARC} 200`}
          strokeLinecap="round"
          strokeWidth="6"
          transform="rotate(135 32 32)"
        />
      </svg>
      <b>{value}</b>
    </div>
  );
}
