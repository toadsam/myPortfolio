"use client";

/**
 * 릴레이 설문 상태기계 — **대본을 주입받는 엔진**이다.
 *
 * `useDialogueFlow(options)` 가 본체고, 1층 접수는 `useIntakeFlow()`(기본 옵션 래퍼),
 * 2층 심화 문답은 `atelierDepthScript.ts` 가 만든 대본 + 저장 콜백으로 같은 엔진을 쓴다.
 * 화면(`IntakeDialogue`)은 `lines`·`phase`·`speaker`·`question` 만 보고 그린다.
 *
 * 규칙 셋:
 * - 선택지 경로는 LLM 0회. `choose/skip/next` 는 전부 동기 계산이고, 서버는
 *   `POST /commission/estimate` 로 견적만 다시 받는다(서버값이 화면값을 덮는다). 2층은
 *   `withEstimate:false` 로 이 경로 전체가 꺼진다 — 심화 문답은 견적의 자리가 아니다.
 * - "직접 말할게요"·자유 대화만 `consult`(옵션 주입)를 부른다. 실패하면 원문을 담고
 *   되묻지 않고 넘어간다.
 * - `gate` 스텝: 대본이 멈추고 비동기로 스텝을 더 받아 온다(2층 AI 맞춤 질문).
 *   **개수·시점은 대본과 서버 규칙이 정하고**, 실패하면 조용히 0개로 이어진다.
 */

import {useCallback, useEffect, useMemo, useReducer, useRef} from "react";

import {
  INTAKE_SCRIPT,
  LATER_LABEL,
  presetPages,
  wrapupLine,
  type IntakeChoice,
  type IntakeQuestion,
  type IntakeStep,
  type ReactionContext
} from "@/data/atelierIntakeScript";
import {
  emptyCommissionDraft,
  estimateForDraft,
  formatMan,
  mostExpensiveFeature,
  type EstimateRange
} from "@/lib/commissionPricing";
import {
  consultCommission,
  estimateCommission,
  fetchCommissionPricing
} from "@/lib/liveApi";
import type {
  CommissionDraft,
  CommissionPricing,
  CommissionSpeaker
} from "@/types/live";

export interface DialogueLine {
  id: number;
  /** visitor = 내 대사 */
  speaker: CommissionSpeaker | "visitor";
  text: string;
  /** 다른 식구가 끼어든 한마디 */
  intrusion?: boolean;
}

export type FlowPhase =
  /** NPC 가 말하는 중 — "다음" 으로 넘긴다 */
  | "speaking"
  /** 선택지가 열려 있다 */
  | "choosing"
  /** 직접 입력창이 열려 있다 */
  | "free-input"
  /** 서버(consult/gate) 응답 대기 */
  | "waiting"
  /** 설문 끝 */
  | "done";

interface FlowState {
  stepIndex: number;
  phase: FlowPhase;
  speaker: CommissionSpeaker;
  draft: CommissionDraft;
  lines: DialogueLine[];
  /** 복수 선택 문항에서 지금 켜 둔 것 */
  selected: string[];
  /** 직접 입력 중인 선택지 */
  freeChoice: IntakeChoice | null;
  nextLineId: number;
}

type Action =
  | {
      type: "push";
      lines: Omit<DialogueLine, "id">[];
      phase?: FlowPhase;
      speaker?: CommissionSpeaker;
    }
  | {type: "advance"}
  | {type: "draft"; draft: CommissionDraft}
  | {type: "toggle"; id: string}
  | {type: "free"; choice: IntakeChoice | null}
  | {type: "phase"; phase: FlowPhase}
  | {
      type: "answered";
      draft: CommissionDraft;
      lines: Omit<DialogueLine, "id">[];
    };

function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "push": {
      let id = state.nextLineId;
      const lines = action.lines.map(line => ({...line, id: id++}));
      return {
        ...state,
        lines: [...state.lines, ...lines],
        nextLineId: id,
        phase: action.phase ?? state.phase,
        speaker: action.speaker ?? state.speaker
      };
    }
    case "advance":
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        selected: [],
        freeChoice: null
      };
    case "draft":
      return {...state, draft: action.draft};
    case "toggle":
      return {
        ...state,
        selected: state.selected.includes(action.id)
          ? state.selected.filter(id => id !== action.id)
          : [...state.selected, action.id]
      };
    case "free":
      return {
        ...state,
        freeChoice: action.choice,
        phase: action.choice ? "free-input" : "choosing"
      };
    case "phase":
      return {...state, phase: action.phase};
    case "answered": {
      let id = state.nextLineId;
      const lines = action.lines.map(line => ({...line, id: id++}));
      return {
        ...state,
        draft: action.draft,
        lines: [...state.lines, ...lines],
        nextLineId: id,
        phase: "speaking",
        freeChoice: null,
        selected: []
      };
    }
    default:
      return state;
  }
}

const _SET_FIELDS = [
  "who_updates",
  "content_owner",
  "success_metric",
  "existing_assets",
  "reference_notes",
  "decision_maker"
] as const;

function applyEffects(
  draft: CommissionDraft,
  chosen: IntakeChoice[]
): CommissionDraft {
  const next: CommissionDraft = {
    ...draft,
    pages: [...draft.pages],
    features: [...draft.features],
    references: [...draft.references],
    dislikes: [...draft.dislikes]
  };
  const notes: string[] = [];
  for (const choice of chosen) {
    const effect = choice.effect;
    if (!effect) continue;
    if (effect.site_type) next.site_type = effect.site_type;
    if (effect.pages) {
      next.pages =
        effect.pages === "preset"
          ? presetPages(next.site_type)
          : effect.pages === "preset+5"
            ? presetPages(next.site_type, true)
            : [...effect.pages];
    }
    if (effect.features) {
      for (const feature of effect.features) {
        if (!next.features.includes(feature)) next.features.push(feature);
      }
    }
    if (effect.tone) next.tone = effect.tone;
    if (effect.budget_hint) next.budget_hint = effect.budget_hint;
    if (effect.deadline_hint) next.deadline_hint = effect.deadline_hint;
    if (effect.note) notes.push(effect.note);
    if (effect.set) {
      for (const field of _SET_FIELDS) {
        const value = effect.set[field];
        if (value) next[field] = value;
      }
    }
    if (effect.dislikes) {
      for (const item of effect.dislikes) {
        if (!next.dislikes.includes(item)) next.dislikes.push(item);
      }
    }
  }
  if (notes.length) {
    next.summary = [next.summary, ...notes].filter(Boolean).join(" / ");
  }
  if (!next.summary && next.site_type) {
    next.summary = `${next.site_type} 홈페이지 제작`;
  }
  // 서버가 채우는 값이지만 화면이 바로 쓰므로 같은 규칙으로 미리 맞춘다.
  next.ready_to_submit =
    !!next.site_type && (next.pages.length > 0 || next.features.length > 0);
  return next;
}

/** 쉼표·줄바꿈으로 적은 목록. */
function parseList(text: string): string[] {
  return text
    .split(/[,\n·]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function parseLinks(text: string): string[] {
  const found =
    text.match(/https?:\/\/\S+|[a-z0-9-]+\.[a-z]{2,}(?:\/\S*)?/gi) ?? [];
  return found.length ? found : parseList(text);
}

export interface ConsultResult {
  reply: string;
  draft: CommissionDraft;
}

export interface DialogueFlowOptions {
  /** 대본. gate 스텝이 있으면 실행 중에 늘어날 수 있다. */
  script: IntakeStep[];
  initialDraft?: CommissionDraft;
  /** 지난 대화 복원(2층) — 대사 기록 맨 앞에 깔린다. */
  initialLines?: Omit<DialogueLine, "id">[];
  /** 견적 기능(가격표 fetch·티커·서버 재계산). 1층 true, 2층 false. */
  withEstimate?: boolean;
  /** 자유 입력·말 걸기의 LLM 경로. 기본은 1층 consultCommission. */
  consult?: (
    message: string,
    draft: CommissionDraft,
    history: string[],
    speaker: CommissionSpeaker
  ) => Promise<ConsultResult>;
  /** 자유 대화 답의 표시 화자 고정(2층: 도안 페르소나라 intake 로 고정) */
  replyAs?: CommissionSpeaker;
  /** 문항 하나가 끝날 때(답·건너뛰기·자유입력). 2층이 저장에 쓴다. */
  onAnswered?: (
    question: IntakeQuestion,
    draft: CommissionDraft,
    visitorText: string,
    skipped: boolean
  ) => void;
  /** gate 스텝 도달 시 추가 스텝을 만들어 온다. 실패하면 빈 배열처럼 진행. */
  gate?: (draft: CommissionDraft) => Promise<IntakeStep[]>;
  /** wrapup 대사. 기본은 1층 요약 낭독. */
  wrapup?: (draft: CommissionDraft) => string;
  onDraftChange?: (draft: CommissionDraft) => void;
}

export function useDialogueFlow(options: DialogueFlowOptions) {
  const {
    initialDraft,
    initialLines,
    withEstimate = true,
    consult = (message, draft, history, speaker) =>
      consultCommission(message, draft, history, speaker),
    replyAs,
    onAnswered,
    gate,
    wrapup = wrapupLine,
    onDraftChange
  } = options;

  // 대본은 ref 로 든다 — gate 가 실행 중에 스텝을 끼워 넣기 때문. stepIndex 는 state.
  const scriptRef = useRef<IntakeStep[]>(options.script);

  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    (): FlowState => {
      let id = 1;
      const seeded = (initialLines ?? []).map(line => ({...line, id: id++}));
      return {
        stepIndex: -1,
        phase: "speaking",
        speaker: "intake",
        draft: initialDraft ?? emptyCommissionDraft(),
        lines: seeded,
        selected: [],
        freeChoice: null,
        nextLineId: id
      };
    }
  );

  const pricingRef = useRef<CommissionPricing | null>(null);
  const [, forceRender] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!withEstimate) return;
    let alive = true;
    fetchCommissionPricing()
      .then(pricing => {
        if (!alive) return;
        pricingRef.current = pricing;
        forceRender();
      })
      .catch(() => {
        // 가격표 없이도 설문은 돈다. 꼬리표만 사라진다.
      });
    return () => {
      alive = false;
    };
  }, [withEstimate]);

  const pricing = pricingRef.current;

  const localEstimate = useMemo<EstimateRange | null>(() => {
    if (!withEstimate || !pricing || !state.draft.site_type) return null;
    return estimateForDraft(pricing, state.draft);
  }, [withEstimate, pricing, state.draft]);

  /** 서버값이 있으면 그게 이긴다. 없으면 화면이 굴린 값. 2층은 항상 null. */
  const estimate = useMemo<EstimateRange | null>(() => {
    if (!withEstimate) return null;
    if (state.draft.estimate_max > 0) {
      return {
        min: state.draft.estimate_min,
        max: state.draft.estimate_max,
        weeksMin: state.draft.weeks_min,
        weeksMax: state.draft.weeks_max
      };
    }
    return localEstimate;
  }, [withEstimate, state.draft, localEstimate]);

  const buildContext = useCallback(
    (draft: CommissionDraft, chosen: IntakeChoice[]): ReactionContext => {
      const est =
        pricing && draft.site_type ? estimateForDraft(pricing, draft) : null;
      let withoutMostExpensive: ReactionContext["withoutMostExpensive"] = null;
      if (pricing && est) {
        const feature = mostExpensiveFeature(pricing, draft.features);
        if (feature) {
          const trimmed = estimateForDraft(pricing, {
            ...draft,
            features: draft.features.filter(
              item => !item.toLowerCase().includes(feature)
            )
          });
          withoutMostExpensive = {feature, min: trimmed.min, max: trimmed.max};
        }
      }
      return {
        draft,
        estimate: est,
        withoutMostExpensive,
        chosen,
        fmt: formatMan
      };
    },
    [pricing]
  );

  const step: IntakeStep | null = scriptRef.current[state.stepIndex] ?? null;
  const question: IntakeQuestion | null =
    step?.kind === "question" ? step.question : null;

  /** 한 스텝에 들어설 때 그 스텝의 첫 대사를 민다. */
  const enterStep = useCallback(
    (index: number, draft: CommissionDraft) => {
      const next = scriptRef.current[index];
      if (!next) {
        dispatch({type: "phase", phase: "done"});
        return;
      }
      const ctx = buildContext(draft, []);
      if (next.kind === "enter") {
        const text =
          typeof next.line === "function" ? next.line(ctx) : next.line;
        dispatch({
          type: "push",
          lines: [{speaker: next.speaker, text}],
          phase: "speaking",
          speaker: next.speaker
        });
      } else if (next.kind === "handoff") {
        dispatch({
          type: "push",
          lines: [{speaker: next.from, text: next.line}],
          phase: "speaking",
          speaker: next.from
        });
      } else if (next.kind === "question") {
        const q = next.question;
        const text = typeof q.prompt === "function" ? q.prompt(ctx) : q.prompt;
        dispatch({
          type: "push",
          lines: [{speaker: q.speaker, text}],
          phase: "choosing",
          speaker: q.speaker
        });
      } else if (next.kind === "gate") {
        // 대본이 여기서 멈추고 스텝을 더 받아 온다. 실패는 조용히 0개.
        dispatch({
          type: "push",
          lines: [{speaker: next.speaker, text: next.line}],
          phase: "waiting",
          speaker: next.speaker
        });
        const proceed = (extra: IntakeStep[]) => {
          scriptRef.current = [
            ...scriptRef.current.slice(0, index + 1),
            ...extra,
            ...scriptRef.current.slice(index + 1)
          ];
          dispatch({type: "advance"});
          enterStep(index + 1, draft);
        };
        if (!gate) {
          proceed([]);
          return;
        }
        gate(draft)
          .then(proceed)
          .catch(() => proceed([]));
      } else if (next.kind === "wrapup") {
        dispatch({
          type: "push",
          lines: [{speaker: next.speaker, text: wrapup(draft)}],
          phase: "done",
          speaker: next.speaker
        });
      }
    },
    [buildContext, gate, wrapup]
  );

  // 첫 스텝
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    dispatch({type: "advance"});
    enterStep(0, state.draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onDraftChange?.(state.draft);
  }, [state.draft, onDraftChange]);

  // 서버 견적으로 덮기 — draft 의 견적 슬롯이 바뀔 때마다. 응답이 늦게 와도 최신만 반영.
  const estimateSeq = useRef(0);
  const refreshEstimate = useCallback(
    (draft: CommissionDraft) => {
      if (!withEstimate || !draft.site_type) return;
      const seq = ++estimateSeq.current;
      estimateCommission(draft)
        .then(result => {
          if (seq !== estimateSeq.current) return;
          dispatch({
            type: "draft",
            draft: {
              ...draft,
              estimate_min: result.draft.estimate_min,
              estimate_max: result.draft.estimate_max,
              weeks_min: result.draft.weeks_min,
              weeks_max: result.draft.weeks_max,
              estimate_reason: result.draft.estimate_reason,
              missing: result.draft.missing,
              ready_to_submit: result.draft.ready_to_submit,
              depth_missing: result.draft.depth_missing
            }
          });
        })
        .catch(() => undefined);
    },
    [withEstimate]
  );

  /** "다음" — 말하는 중이면 다음 스텝으로. */
  const next = useCallback(() => {
    if (state.phase !== "speaking") return;
    const current = scriptRef.current[state.stepIndex];
    if (!current) return;
    // 넘김 연출: 말이 끝나면 화자가 바뀐다
    if (current.kind === "handoff") {
      dispatch({type: "push", lines: [], speaker: current.to});
    }
    const nextIndex = state.stepIndex + 1;
    dispatch({type: "advance"});
    enterStep(nextIndex, state.draft);
  }, [state.phase, state.stepIndex, state.draft, enterStep]);

  /** 선택(단일) 또는 복수 선택 확정. */
  const settle = useCallback(
    (chosen: IntakeChoice[], visitorText: string) => {
      if (!question) return;
      const draft = applyEffects(state.draft, chosen);
      const ctx = buildContext(draft, chosen);
      const lines: Omit<DialogueLine, "id">[] = [
        {speaker: "visitor", text: visitorText},
        {speaker: question.speaker, text: question.reaction(ctx)}
      ];
      const intrusion = question.intrusion?.(ctx);
      if (intrusion) {
        lines.push({
          speaker: intrusion.speaker,
          text: intrusion.line,
          intrusion: true
        });
      }
      dispatch({type: "answered", draft, lines});
      onAnswered?.(question, draft, visitorText, false);
      refreshEstimate(draft);
    },
    [question, state.draft, buildContext, onAnswered, refreshEstimate]
  );

  const choose = useCallback(
    (choice: IntakeChoice) => {
      if (!question || state.phase !== "choosing") return;
      if (choice.free) {
        dispatch({type: "free", choice});
        return;
      }
      if (question.multi) {
        dispatch({type: "toggle", id: choice.id});
        return;
      }
      settle([choice], choice.label);
    },
    [question, state.phase, settle]
  );

  const confirmMulti = useCallback(() => {
    if (!question?.multi || state.phase !== "choosing") return;
    const chosen = question.choices.filter(c => state.selected.includes(c.id));
    settle(
      chosen,
      chosen.length
        ? chosen.map(c => c.label.split(" (")[0]).join(", ")
        : "딱히 없어요"
    );
  }, [question, state.phase, state.selected, settle]);

  const skip = useCallback(() => {
    if (!question || question.required || state.phase !== "choosing") return;
    dispatch({
      type: "answered",
      draft: state.draft,
      lines: [
        {speaker: "visitor", text: LATER_LABEL},
        {
          speaker: question.speaker,
          text: question.skipLine ?? "알겠어요, 나중에 여쭐게요."
        }
      ]
    });
    onAnswered?.(question, state.draft, "", true);
  }, [question, state.phase, state.draft, onAnswered]);

  const cancelFree = useCallback(
    () => dispatch({type: "free", choice: null}),
    []
  );

  const history = useCallback(
    () =>
      state.lines
        .slice(-10)
        .map(
          line =>
            `${line.speaker === "visitor" ? "visitor" : "npc"}: ${line.text}`
        ),
    [state.lines]
  );

  /** 직접 입력 제출. raw/list/links 는 LLM 없이 담고, text 는 consult 로 추출한다. */
  const submitFree = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!question || !state.freeChoice || !trimmed) return;
      const choice = state.freeChoice;

      if (choice.free === "raw") {
        // 원문 그대로 담는다 — 2층 슬롯·분기·AI 질문의 자유 입력 경로.
        const draft = question.slotField
          ? applyEffects(
              {...state.draft, [question.slotField]: trimmed},
              []
            )
          : state.draft;
        const ctx = buildContext(draft, [choice]);
        dispatch({
          type: "answered",
          draft,
          lines: [
            {speaker: "visitor", text: trimmed},
            {speaker: question.speaker, text: question.reaction(ctx)}
          ]
        });
        onAnswered?.(question, draft, trimmed, false);
        return;
      }

      if (choice.free === "list") {
        const pages = parseList(trimmed);
        const draft = applyEffects({...state.draft, pages}, []);
        const ctx = buildContext(draft, [choice]);
        dispatch({
          type: "answered",
          draft,
          lines: [
            {speaker: "visitor", text: trimmed},
            {speaker: question.speaker, text: question.reaction(ctx)}
          ]
        });
        onAnswered?.(question, draft, trimmed, false);
        refreshEstimate(draft);
        return;
      }
      if (choice.free === "links") {
        const references = [...state.draft.references, ...parseLinks(trimmed)];
        const draft = {...state.draft, references};
        const ctx = buildContext(draft, [choice]);
        dispatch({
          type: "answered",
          draft,
          lines: [
            {speaker: "visitor", text: trimmed},
            {speaker: question.speaker, text: question.reaction(ctx)}
          ]
        });
        onAnswered?.(question, draft, trimmed, false);
        return;
      }

      // text → 그 식구의 페르소나로 LLM 슬롯 추출
      dispatch({
        type: "push",
        lines: [{speaker: "visitor", text: trimmed}],
        phase: "waiting"
      });
      try {
        const result = await consult(
          trimmed,
          state.draft,
          history(),
          question.speaker
        );
        const draft = applyEffects(result.draft, []);
        dispatch({
          type: "answered",
          draft,
          lines: [{speaker: replyAs ?? question.speaker, text: result.reply}]
        });
        onAnswered?.(question, draft, trimmed, false);
        refreshEstimate(draft);
      } catch {
        // 추출 실패 — 원문만 담고 되묻지 않는다.
        const draft = applyEffects(
          {
            ...state.draft,
            summary: [state.draft.summary, trimmed].filter(Boolean).join(" / ")
          },
          []
        );
        dispatch({
          type: "answered",
          draft,
          lines: [
            {
              speaker: question.speaker,
              text: "적어 뒀어요. 이건 제가 다시 읽어 볼게요."
            }
          ]
        });
        onAnswered?.(question, draft, trimmed, false);
      }
    },
    [
      question,
      state.freeChoice,
      state.draft,
      buildContext,
      onAnswered,
      refreshEstimate,
      history,
      consult,
      replyAs
    ]
  );

  /** 아무 때나 말 걸기 — 문항 진행과 별개. */
  const say = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || state.phase === "waiting") return;
      const speaker = state.speaker;
      const phaseBefore = state.phase;
      dispatch({
        type: "push",
        lines: [{speaker: "visitor", text: trimmed}],
        phase: "waiting"
      });
      try {
        const result = await consult(trimmed, state.draft, history(), speaker);
        const draft = applyEffects(result.draft, []);
        dispatch({type: "draft", draft});
        dispatch({
          type: "push",
          lines: [{speaker: replyAs ?? speaker, text: result.reply}],
          phase: phaseBefore
        });
        refreshEstimate(draft);
      } catch {
        dispatch({
          type: "push",
          lines: [
            {
              speaker,
              text: "잠깐 연결이 끊겼어요. 선택지로 이어가 주시면 제가 따라갈게요."
            }
          ],
          phase: phaseBefore
        });
      }
    },
    [state.phase, state.speaker, state.draft, history, refreshEstimate, consult, replyAs]
  );

  const progress = useMemo(() => {
    const script = scriptRef.current;
    const total = script.filter(s => s.kind === "question").length;
    const done = script
      .slice(0, Math.max(0, state.stepIndex))
      .filter(s => s.kind === "question").length;
    return {done, total};
  }, [state.stepIndex]);

  return {
    lines: state.lines,
    phase: state.phase,
    speaker: state.speaker,
    draft: state.draft,
    question,
    selected: state.selected,
    freeChoice: state.freeChoice,
    pricing,
    estimate,
    progress,
    next,
    choose,
    confirmMulti,
    skip,
    cancelFree,
    submitFree,
    say
  };
}

/** 1층 접수 설문 — 기본 대본과 기본 옵션. */
export function useIntakeFlow(
  options: Pick<DialogueFlowOptions, "onDraftChange"> = {}
) {
  return useDialogueFlow({script: INTAKE_SCRIPT, ...options});
}

export type IntakeFlow = ReturnType<typeof useDialogueFlow>;
