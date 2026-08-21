/**
 * 관리자 입력 → 건물 조명 점수. **미리보기 전용 사본이다.**
 *
 * ## 왜 프런트에 또 있나
 *
 * 관리자 화면의 논지는 "오늘 기록이 마을을 바꾼다"인데, 지금은 **저장한 뒤에야**
 * 결과를 알 수 있다. 타이핑하는 동안 마을에 불이 들어오는 걸 보여주려면 계산이
 * 손안에 있어야 한다 — 키를 누를 때마다 서버에 물으면 그 감각이 안 산다.
 *
 * ## 권위는 여기가 아니다
 *
 * **정답은 `backend/app/services/village_service.py` 의 `derive_village_state` 다.**
 * 이 파일은 그것을 그대로 옮긴 것이고, 규칙이 바뀌면 **양쪽을 같이 고쳐야 한다.**
 * 한쪽만 고치면 미리보기가 조용히 거짓말을 시작한다 — 화면은 멀쩡해 보이므로
 * 아무도 모른다.
 *
 * 그래서 표류를 사람 기억에 맡기지 않는다. `diffAgainstServer()` 로 저장 응답과
 * 대조해 어긋나면 개발 모드 콘솔에 찍는다(아래). 실제로 규칙을 바꾸는 날
 * 저장 한 번이면 걸린다.
 *
 * ## 옮길 때 주의한 것
 *
 * 파이썬의 `//` 는 내림 나눗셈이다. TS 의 `/` 를 그대로 쓰면 소수가 남아 점수가
 * 미세하게 커지고, 34.5 가 임계값 35 근처에서 등급을 바꿔 버린다. 전부
 * `Math.floor` 로 옮겼다.
 */

export type LightLevel = "dark" | "dim" | "normal" | "bright";

/** 관리자 폼이 들고 있는 값 중 조명 계산에 쓰이는 것만 */
export interface LightPreviewInput {
  github_commits: number;
  github_repos: string[];
  study_minutes: number;
  study_topics: string[];
  studied_tech: string[];
  coding_minutes: number;
  project_minutes: Record<string, number>;
  workout_done: boolean;
  workout_minutes: number;
  focus_score: number;
  memo: string;
}

/** 학습 구역은 폼이 아니라 별도 기록에서 온다 */
export interface StudyCounts {
  codingToday: number;
  codingTotal: number;
  csToday: number;
  csTotal: number;
}

// ── 아래 세 표는 village_service.py 의 같은 이름 상수와 1:1 이다 ────────────────
const PROJECT_BUILDING_IDS: Record<string, string> = {
  mywave: "project-mywave",
  mystock: "project-mystock",
  festflow: "project-festflow",
  "sign-language": "project-sign-language",
  aclub: "project-aclub",
  "ajou-adventure": "project-ajou-adventure",
  ajouchong: "project-ajouchong",
  muscleup: "project-muscleup",
  darklab: "project-darklab",
  tserof: "project-tserof"
};

const SKILL_TECH_MAP: Record<string, string[]> = {
  "skill-frontend": ["react", "typescript", "next", "tailwind", "vite"],
  "skill-3d": ["three", "r3f", "drei", "motion", "3d"],
  "skill-backend": ["fastapi", "spring", "mysql", "postgres", "api", "sse"],
  "skill-game": ["unity", "c#", "phaser", "xr", "game"],
  "skill-workflow": ["github", "docker", "nginx", "deploy", "ci"]
};

const SKILL_BUILDING_IDS = Object.keys(SKILL_TECH_MAP);

const EXPERIENCE_BUILDING_IDS = [
  "exp-unity-ui",
  "exp-demo-platform",
  "exp-portfolio"
];

const floorDiv = (a: number, b: number) => Math.floor(a / b);
const clamp100 = (n: number) => Math.max(0, Math.min(n, 100));

export function lightForScore(score: number): LightLevel {
  if (score <= 0) return "dark";
  if (score < 35) return "dim";
  if (score < 75) return "normal";
  return "bright";
}

function repoMatchesProject(projectId: string, repos: string[]): boolean {
  const normalized = projectId.replace(/-/g, "").toLowerCase();
  return repos.some(repo =>
    repo.replace(/-/g, "").replace(/_/g, "").toLowerCase().includes(normalized)
  );
}

function techBonus(buildingId: string, studiedTech: string[]): number {
  const tokens = SKILL_TECH_MAP[buildingId] ?? [];
  const normalized = studiedTech.map(item =>
    item.toLowerCase().replace(/\./g, "").replace(/ /g, "")
  );
  let matches = 0;
  for (const token of tokens) {
    const clean = token.toLowerCase().replace(/\./g, "").replace(/ /g, "");
    if (normalized.some(item => item.includes(clean) || clean.includes(item))) {
      matches += 1;
    }
  }
  return Math.min(matches * 18, 55);
}

/** 건물 id → 활동 점수(0..100). 화면에 없는 건물은 키가 없다. */
export function previewBuildingScores(
  form: LightPreviewInput,
  study: StudyCounts
): Map<string, number> {
  const sumProjectMinutes = Object.values(form.project_minutes ?? {}).reduce(
    (a, b) => a + (Number(b) || 0),
    0
  );

  const commitScore = Math.min(form.github_commits * 18, 100);
  const studyScore = Math.min(
    floorDiv(form.study_minutes, 2) + (form.study_topics?.length ?? 0) * 8,
    100
  );
  const codingScore = Math.min(
    floorDiv(form.coding_minutes, 3) + floorDiv(sumProjectMinutes, 4),
    100
  );
  const workoutScore = form.workout_done
    ? Math.min(form.workout_minutes * 2, 100)
    : 0;
  const focusScore = clamp100(form.focus_score);
  const memoScore = form.memo.trim() ? 35 : 0;

  const overall = Math.min(
    floorDiv(commitScore, 2) +
      floorDiv(studyScore, 2) +
      codingScore +
      floorDiv(workoutScore, 3) +
      floorDiv(focusScore, 4) +
      memoScore,
    100
  );

  const out = new Map<string, number>();
  out.set("central-plaza", overall);

  const repos = (form.github_repos ?? []).map(r => r.toLowerCase());
  for (const [projectId, buildingId] of Object.entries(PROJECT_BUILDING_IDS)) {
    const minutes = Number(form.project_minutes?.[projectId] ?? 0) || 0;
    const bonus = repoMatchesProject(projectId, repos) ? 28 : 0;
    const score = Math.min(
      minutes + bonus + (minutes > 0 ? floorDiv(commitScore, 3) : 0),
      100
    );
    out.set(buildingId, score);
  }

  for (const buildingId of SKILL_BUILDING_IDS) {
    out.set(
      buildingId,
      Math.min(studyScore + techBonus(buildingId, form.studied_tech ?? []), 100)
    );
  }

  for (const buildingId of EXPERIENCE_BUILDING_IDS) {
    out.set(buildingId, Math.max(memoScore, floorDiv(studyScore, 2)));
  }

  out.set(
    "study-codingtest",
    study.codingToday > 0
      ? Math.min(60 + study.codingToday * 20, 100)
      : Math.min(study.codingTotal * 6, 45)
  );
  out.set(
    "study-cs",
    study.csToday > 0
      ? Math.min(60 + study.csToday * 20, 100)
      : Math.min(study.csTotal * 6, 45)
  );

  out.set("post-office", Math.max(floorDiv(overall, 2), memoScore));

  return out;
}

/** 오늘 기록으로 움직이는 NPC. 서버의 npcs 배열 중 값이 변하는 넷만 옮겼다. */
export interface NpcPreview {
  id: string;
  name: string;
  mood: string;
  moodLabel: string;
  line: string;
}

const MOOD_LABEL: Record<string, string> = {
  training: "운동 중",
  sleepy: "졸림",
  proud: "뿌듯함",
  busy: "바쁨",
  calm: "차분함",
  focused: "집중",
  curious: "궁금함"
};

/**
 * NPC 기분·한 줄. 조명과 같은 규칙(village_service.derive_village_state)의 사본이고,
 * 같은 표류 주의가 그대로 적용된다 — 위 머리 주석 참고.
 *
 * 연락 NPC 는 값이 항상 calm 이라 뺐다. 안 변하는 걸 띄워 두면 "이 화면은 반응한다"는
 * 신호가 흐려진다.
 */
export function previewNpcMoods(form: LightPreviewInput): NpcPreview[] {
  const sumProjectMinutes = Object.values(form.project_minutes ?? {}).reduce(
    (a, b) => a + (Number(b) || 0),
    0
  );
  const scores = previewBuildingScores(form, {
    codingToday: 0,
    codingTotal: 0,
    csToday: 0,
    csTotal: 0
  });
  const overall = scores.get("central-plaza") ?? 0;
  const hasActiveProject = sumProjectMinutes > 0;

  const guideMood = form.workout_done
    ? "training"
    : overall <= 10
    ? "sleepy"
    : "proud";
  const guideLine = form.workout_done
    ? "운동 기록 덕분에 광장이 활기찹니다."
    : form.github_commits === 0 &&
      form.study_minutes === 0 &&
      form.coding_minutes === 0
    ? "아직 오늘 활동 기록이 없어 마을이 조용합니다."
    : "오늘 활동을 방문자에게 안내할 준비가 됐습니다.";

  return [
    {
      id: "guide-npc",
      name: "루미",
      mood: guideMood,
      moodLabel: MOOD_LABEL[guideMood],
      line: guideLine
    },
    {
      id: "project-npc",
      name: "프로젝트 안내인",
      mood: hasActiveProject || form.github_commits >= 5 ? "busy" : "calm",
      moodLabel:
        MOOD_LABEL[
          hasActiveProject || form.github_commits >= 5 ? "busy" : "calm"
        ],
      line: hasActiveProject
        ? `오늘 작업한 프로젝트 ${sumProjectMinutes}분을 소개할 수 있습니다.`
        : "오늘 손댄 프로젝트가 아직 없습니다."
    },
    {
      id: "developer-npc",
      name: "기술 안내인",
      mood:
        form.study_minutes >= 90 || form.coding_minutes >= 120
          ? "focused"
          : "calm",
      moodLabel:
        MOOD_LABEL[
          form.study_minutes >= 90 || form.coding_minutes >= 120
            ? "focused"
            : "calm"
        ],
      line: `공부 ${form.study_minutes}분 · 코딩 ${form.coding_minutes}분 · 집중 ${form.focus_score}%`
    },
    {
      id: "archivist-npc",
      name: "기록 보관인",
      mood: form.memo.trim() ? "curious" : "calm",
      moodLabel: MOOD_LABEL[form.memo.trim() ? "curious" : "calm"],
      line: form.memo.trim()
        ? form.memo.trim().slice(0, 40)
        : "오늘의 메모를 기다리고 있습니다."
    }
  ];
}

/** 오늘 기록으로 열리는 장식. 서버의 unlocked_items 와 같은 조건이다. */
export function previewUnlocks(form: LightPreviewInput): string[] {
  const out: string[] = [];
  if (form.workout_done) out.push("훈련 동상");
  if (form.github_commits >= 5) out.push("연구소 신호등");
  if (form.study_minutes >= 120) out.push("학습 분수");
  if (form.coding_minutes >= 180) out.push("몰입 터미널");
  return out;
}

/**
 * 저장 응답으로 돌아온 서버 계산과 대조한다. **개발 모드에서만** 부른다.
 *
 * 이 함수가 있는 이유는 위 머리 주석의 표류 때문이다 — 규칙이 한쪽에서만 바뀌면
 * 미리보기는 아무 티도 안 내고 틀린 그림을 계속 보여준다. 저장할 때마다 대조하면
 * 규칙을 바꾼 바로 그날 걸린다.
 */
export function diffAgainstServer(
  preview: Map<string, number>,
  server: {building_id: string; activity_score: number}[]
): string[] {
  const gaps: string[] = [];
  for (const b of server) {
    if (!preview.has(b.building_id)) continue;
    const mine = preview.get(b.building_id) ?? 0;
    if (mine !== b.activity_score) {
      gaps.push(
        `${b.building_id}: 미리보기 ${mine} ≠ 서버 ${b.activity_score}`
      );
    }
  }
  return gaps;
}
