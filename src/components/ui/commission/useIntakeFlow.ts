"use client";

/**
 * 릴레이 설문 상태기계 — 2D 데스크와 3D 공방이 **같은 훅**을 쓴다.
 *
 * 화면은 `lines`(대사 기록)·`phase`·`speaker`·`question` 만 보고 그린다.
 * 규칙 셋:
 * - 선택지 경로는 LLM 0회. `choose/skip/next` 는 전부 동기 계산이고, 서버는
 *   `POST /commission/estimate` 로 견적만 다시 받는다(서버값이 화면값을 덮는다).
 * - "직접 말할게요"·자유 대화만 `consult` 를 부른다(그 식구의 페르소나로).
 *   실패하면 원문을 summary 에 붙이고 되묻지 않고 넘어간다.
 * - draft 는 서버 `CommissionDraft` 그대로다. 설문이 끝나면 기존 접수 폼이 이어받는다.
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
  /** 서버(consult) 응답 대기 */
  | "waiting"
  /** 설문 끝 — 접수 폼 차례 */
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
  /** 이 문항에서 답(또는 건너뛰기)을 이미 했는지 — 반응 대사 뒤 "다음" 이 문항을 넘긴다 */
  answered: boolean;
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
        freeChoice: null,
        answered: false
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
        answered: true,
        freeChoice: null,
        selected: []
      };
    }
    default:
      return state;
  }
}

function applyEffects(
  draft: CommissionDraft,
  chosen: IntakeChoice[]
): CommissionDraft {
  const next: CommissionDraft = {
    ...draft,
    pages: [...draft.pages],
    features: [...draft.features],
    references: [...draft.references]
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

export interface UseIntakeFlowOptions {
  /** 바깥(접수 폼)이 draft 를 따라가야 할 때 */
  onDraftChange?: (draft: CommissionDraft) => void;
}

export function useIntakeFlow(options: UseIntakeFlowOptions = {}) {
  const {onDraftChange} = options;
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    (): FlowState => ({
      stepIndex: -1,
      phase: "speaking",
      speaker: "intake",
      draft: emptyCommissionDraft(),
      lines: [],
      selected: [],
      freeChoice: null,
      nextLineId: 1,
      answered: false
    })
  );

  const pricingRef = useRef<CommissionPricing | null>(null);
  const [, forceRender] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
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
  }, []);

  const pricing = pricingRef.current;

  const localEstimate = useMemo<EstimateRange | null>(() => {
    if (!pricing || !state.draft.site_type) return null;
    return estimateForDraft(pricing, state.draft);
  }, [pricing, state.draft]);

  /** 서버값이 있으면 그게 이긴다. 없으면 화면이 굴린 값. */
  const estimate = useMemo<EstimateRange | null>(() => {
    if (state.draft.estimate_max > 0) {
      return {
        min: state.draft.estimate_min,
        max: state.draft.estimate_max,
        weeksMin: state.draft.weeks_min,
        weeksMax: state.draft.weeks_max
      };
    }
    return localEstimate;
  }, [state.draft, localEstimate]);

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

  const step: IntakeStep | null = INTAKE_SCRIPT[state.stepIndex] ?? null;
  const question: IntakeQuestion | null =
    step?.kind === "question" ? step.question : null;

  /** 한 스텝에 들어설 때 그 스텝의 첫 대사를 민다. */
  const enterStep = useCallback(
    (index: number, draft: CommissionDraft) => {
      const next = INTAKE_SCRIPT[index];
      if (!next) return;
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
      } else if (next.kind === "wrapup") {
        dispatch({
          type: "push",
          lines: [{speaker: next.speaker, text: wrapupLine(draft)}],
          phase: "done",
          speaker: next.speaker
        });
      }
    },
    [buildContext]
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
  const refreshEstimate = useCallback((draft: CommissionDraft) => {
    if (!draft.site_type) return;
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
  }, []);

  /** "다음" — 말하는 중이면 다음 스텝으로. */
  const next = useCallback(() => {
    if (state.phase !== "speaking") return;
    const current = INTAKE_SCRIPT[state.stepIndex];
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
      refreshEstimate(draft);
    },
    [question, state.draft, buildContext, refreshEstimate]
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
  }, [question, state.phase, state.draft]);

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

  /** 직접 입력 제출. list/links 는 LLM 없이 바로 담고, text 는 consult 로 추출한다. */
  const submitFree = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!question || !state.freeChoice || !trimmed) return;
      const choice = state.freeChoice;

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
        return;
      }

      // text → 그 식구의 페르소나로 LLM 슬롯 추출
      dispatch({
        type: "push",
        lines: [{speaker: "visitor", text: trimmed}],
        phase: "waiting"
      });
      try {
        const result = await consultCommission(
          trimmed,
          state.draft,
          history(),
          question.speaker
        );
        const draft = applyEffects(result.draft, []);
        dispatch({
          type: "answered",
          draft,
          lines: [{speaker: question.speaker, text: result.reply}]
        });
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
              text: "적어 뒀어요. 이건 접수되면 제가 다시 읽어 볼게요."
            }
          ]
        });
      }
    },
    [
      question,
      state.freeChoice,
      state.draft,
      buildContext,
      refreshEstimate,
      history
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
        const result = await consultCommission(
          trimmed,
          state.draft,
          history(),
          speaker
        );
        const draft = applyEffects(result.draft, []);
        dispatch({type: "draft", draft});
        dispatch({
          type: "push",
          lines: [{speaker, text: result.reply}],
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
    [state.phase, state.speaker, state.draft, history, refreshEstimate]
  );

  const progress = useMemo(() => {
    const total = INTAKE_SCRIPT.filter(s => s.kind === "question").length;
    const done = INTAKE_SCRIPT.slice(0, Math.max(0, state.stepIndex)).filter(
      s => s.kind === "question"
    ).length;
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

export type IntakeFlow = ReturnType<typeof useIntakeFlow>;
