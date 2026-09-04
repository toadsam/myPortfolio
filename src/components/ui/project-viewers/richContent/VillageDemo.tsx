"use client";

import {motion} from "framer-motion";
import {useMemo, useState} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import {DemoFrame} from "./shared";

// AI 포트폴리오 마을 시그니처 — "관리자 입력이 마을을 바꾼다" 를 직접 만져 본다.
//
// 왼쪽은 관리자 배전반의 축소판, 오른쪽은 마을의 축소판이다. 계산은
// backend/app/services/village_service.py 의 `derive_village_state` 를 **그대로**
// 옮겼다(점수식·문턱값 동일). 그래서 이 데모의 밝기는 실제 서버가 내는 값과
// 같다 — 아래 검산: 같은 입력을 파이썬 함수에 넣어 대조했다(2026-09-03).
// three.js 는 한 줄도 없다. 이력서 상세를 열 때만 dynamic 으로 내려온다.

type Light = "dark" | "dim" | "normal" | "bright";

interface Input {
  commits: number;
  studyMinutes: number;
  codingMinutes: number;
  projectMinutes: number;
  workoutDone: boolean;
  memo: boolean;
}

const INITIAL: Input = {
  commits: 0,
  studyMinutes: 0,
  codingMinutes: 0,
  projectMinutes: 0,
  workoutDone: false,
  memo: false
};

// 파이썬의 `//` 는 음이 아닌 정수에서 Math.floor 와 같다.
const div = (a: number, b: number) => Math.floor(a / b);

function lightFor(score: number): Light {
  if (score <= 0) return "dark";
  if (score < 35) return "dim";
  if (score < 75) return "normal";
  return "bright";
}

/** village_service.derive_village_state 의 이식. 운동 30분·집중도 50 은 고정값이다. */
function derive(input: Input) {
  const WORKOUT_MINUTES = 30;
  const FOCUS = 50;
  const commitScore = Math.min(input.commits * 18, 100);
  const studyScore = Math.min(div(input.studyMinutes, 2), 100);
  const codingScore = Math.min(
    div(input.codingMinutes, 3) + div(input.projectMinutes, 4),
    100
  );
  const workoutScore = input.workoutDone
    ? Math.min(WORKOUT_MINUTES * 2, 100)
    : 0;
  const memoScore = input.memo ? 35 : 0;
  const overall = Math.min(
    div(commitScore, 2) +
      div(studyScore, 2) +
      codingScore +
      div(workoutScore, 3) +
      div(FOCUS, 4) +
      memoScore,
    100
  );
  const projectScore = Math.min(
    input.projectMinutes + (input.projectMinutes > 0 ? div(commitScore, 3) : 0),
    100
  );
  const skillScore = Math.min(studyScore, 100);
  const expScore = Math.max(memoScore, div(studyScore, 2));
  const contactScore = Math.max(div(overall, 2), memoScore);

  const buildings = [
    {id: "plaza", name: "중앙 광장", score: overall},
    {id: "project", name: "프로젝트 건물", score: projectScore},
    {id: "skill", name: "기술관", score: skillScore},
    {id: "exp", name: "경험 기록관", score: expScore},
    {id: "post", name: "우체국", score: contactScore}
  ].map(b => ({...b, light: lightFor(b.score)}));

  const npcs = [
    {
      name: "안내인",
      mood: input.workoutDone ? "training" : overall <= 10 ? "sleepy" : "proud"
    },
    {
      name: "프로젝트",
      mood: input.projectMinutes > 0 || input.commits >= 5 ? "busy" : "calm"
    },
    {
      name: "개발자",
      mood:
        input.studyMinutes >= 90 || input.codingMinutes >= 120
          ? "focused"
          : "calm"
    },
    {name: "기록관", mood: input.memo ? "curious" : "calm"},
    {name: "우체국", mood: "calm"}
  ];

  return {overall, buildings, npcs};
}

const MOOD_ICON: Record<string, string> = {
  training: "🏋️",
  sleepy: "😴",
  proud: "😊",
  busy: "🔥",
  calm: "🙂",
  focused: "🎯",
  curious: "🧐"
};

const LIGHT_ALPHA: Record<Light, number> = {
  dark: 0.08,
  dim: 0.3,
  normal: 0.6,
  bright: 1
};

const LIGHT_LABEL: Record<Light, string> = {
  dark: "꺼짐",
  dim: "희미",
  normal: "보통",
  bright: "밝음"
};

export function VillageDemo({theme}: {theme: ProjectTheme}) {
  const [input, setInput] = useState<Input>(INITIAL);
  const state = useMemo(() => derive(input), [input]);
  const set = <K extends keyof Input>(k: K, v: Input[K]) =>
    setInput(prev => ({...prev, [k]: v}));

  return (
    <DemoFrame
      theme={theme}
      label="AI 포트폴리오 마을"
      tag="ADMIN → VILLAGE"
      controls={
        <button
          type="button"
          onClick={() => setInput(INITIAL)}
          className="rounded-lg border px-3 py-1.5 font-mono text-[11px] font-black text-white/50 transition hover:bg-white/5"
          style={{borderColor: "rgba(255,255,255,0.15)"}}
        >
          ↺ 초기화
        </button>
      }
      footer={
        <p className="font-mono text-[11px] leading-5 text-white/45">
          💡 왼쪽은 관리자 배전반, 오른쪽은 마을의 축소판 — 점수식과 문턱값(0 ·
          35 · 75)은{" "}
          <span style={{color: theme.primary}}>
            서버의 village_service.py 와 같다
          </span>
          . 모델(OpenAI)은 이 결정에 관여하지 않고 그 위에 대사만 얹는다.
        </p>
      }
    >
      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* 관리자 배전반 축소판 */}
        <div
          className="rounded-xl border p-4"
          style={{borderColor: `${theme.primary}22`}}
        >
          <div className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Village Control Board
          </div>
          <Slider
            theme={theme}
            label="GitHub 커밋"
            value={input.commits}
            max={8}
            unit="개"
            onChange={v => set("commits", v)}
          />
          <Slider
            theme={theme}
            label="공부"
            value={input.studyMinutes}
            max={180}
            step={15}
            unit="분"
            onChange={v => set("studyMinutes", v)}
          />
          <Slider
            theme={theme}
            label="코딩"
            value={input.codingMinutes}
            max={240}
            step={15}
            unit="분"
            onChange={v => set("codingMinutes", v)}
          />
          <Slider
            theme={theme}
            label="프로젝트 작업"
            value={input.projectMinutes}
            max={120}
            step={10}
            unit="분"
            onChange={v => set("projectMinutes", v)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Toggle
              theme={theme}
              on={input.workoutDone}
              label="운동 30분 했다"
              onClick={() => set("workoutDone", !input.workoutDone)}
            />
            <Toggle
              theme={theme}
              on={input.memo}
              label="오늘 메모 남김"
              onClick={() => set("memo", !input.memo)}
            />
          </div>
        </div>

        {/* 마을 축소판 */}
        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: `${theme.primary}22`,
            background: "rgba(4, 8, 20, 0.6)"
          }}
        >
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            <span>Village State</span>
            <span style={{color: theme.primary}}>
              전체 활동 {state.overall}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {state.buildings.map(b => (
              <div key={b.id} className="flex flex-col items-center gap-1.5">
                <motion.div
                  className="flex h-16 w-full items-end justify-center rounded-md border"
                  style={{borderColor: `${theme.primary}33`}}
                  animate={{
                    background: `rgba(226, 192, 120, ${
                      LIGHT_ALPHA[b.light] * 0.55
                    })`,
                    boxShadow:
                      b.light === "bright"
                        ? `0 0 22px ${theme.primary}88`
                        : b.light === "normal"
                        ? `0 0 10px ${theme.primary}44`
                        : "none"
                  }}
                  transition={{duration: 0.5}}
                >
                  <span
                    className="mb-1 font-mono text-[10px] font-black"
                    style={{
                      color:
                        b.light === "dark" ? "rgba(255,255,255,0.3)" : "#0b1626"
                    }}
                  >
                    {b.score}
                  </span>
                </motion.div>
                <span className="text-center text-[11px] leading-tight text-white/70">
                  {b.name}
                </span>
                <span className="font-mono text-[10px] text-white/40">
                  {LIGHT_LABEL[b.light]}
                </span>
              </div>
            ))}
          </div>
          <div
            className="mt-4 border-t pt-3"
            style={{borderColor: `${theme.primary}22`}}
          >
            <div className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              NPC Mood
            </div>
            <div className="flex flex-wrap gap-2">
              {state.npcs.map(n => (
                <span
                  key={n.name}
                  className="rounded-full border px-2.5 py-1 font-mono text-[11px] text-white/75"
                  style={{borderColor: `${theme.primary}33`}}
                >
                  {MOOD_ICON[n.mood]} {n.name} · {n.mood}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}

function Slider({
  theme,
  label,
  value,
  max,
  step = 1,
  unit,
  onChange
}: {
  theme: ProjectTheme;
  label: string;
  value: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mb-3 block">
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="text-white/70">{label}</span>
        <span className="font-mono font-black" style={{color: theme.primary}}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{accentColor: theme.primary}}
        aria-label={label}
      />
    </label>
  );
}

function Toggle({
  theme,
  on,
  label,
  onClick
}: {
  theme: ProjectTheme;
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="rounded-lg border px-3 py-1.5 font-mono text-[11px] font-black transition"
      style={{
        borderColor: on ? theme.primary : "rgba(255,255,255,0.15)",
        color: on ? "#0b1626" : "rgba(255,255,255,0.6)",
        background: on ? theme.primary : "transparent"
      }}
    >
      {on ? "✓ " : ""}
      {label}
    </button>
  );
}
