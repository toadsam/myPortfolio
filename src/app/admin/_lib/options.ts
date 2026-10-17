import {projects} from "@/data/projects";
import {villageBuildings} from "@/lib/constants";
import type {ActivityInput} from "@/types/live";

export const BUILDING_NAME: Record<string, string> = Object.fromEntries(
  villageBuildings.map(building => [building.id, building.name])
);

export const UNLOCK_LABEL: Record<string, string> = {
  "training-statue": "🏋️ 운동 동상",
  "lab-beacon": "🔦 연구소 등대",
  "study-fountain": "⛲ 학습 분수",
  "deep-work-terminal": "💻 몰입 터미널"
};

export const initialForm: ActivityInput = {
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

export const moodOptions = [
  {value: "steady", label: "차분함"},
  {value: "focused", label: "집중됨"},
  {value: "tired", label: "피곤함"},
  {value: "proud", label: "뿌듯함"}
];

export const workoutTypes = [
  "헬스",
  "러닝",
  "산책",
  "스트레칭",
  "등산",
  "기타"
];
export const quickTopics = [
  "알고리즘",
  "React",
  "Next.js",
  "FastAPI",
  "Spring Boot",
  "Three.js",
  "Unity",
  "DB 설계"
];
/* 회로가 켜는 건물. `villageLightPreview.ts` 의 점수 표와 같은 id 여야 지도와
   회로가 같은 것을 가리킨다 — 여기서 오타가 나면 조준 고리만 조용히 안 걸린다. */
export const PLAZA_ONLY = ["central-plaza"];
export const SKILL_BUILDINGS = [
  "skill-frontend",
  "skill-3d",
  "skill-backend",
  "skill-game",
  "skill-workflow"
];
/** 프로젝트 id → 건물 id. 프로젝트마다 건물 하나로 1:1 이다. */
export const projectBuildingIds: Record<string, string[]> = Object.fromEntries(
  projects.map(project => [project.id, [`project-${project.id}`]])
);

export const DAILY_GOALS = {workout: 30, coding: 120, study: 60};
