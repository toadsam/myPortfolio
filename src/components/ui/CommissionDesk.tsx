"use client";

/**
 * 의뢰 공방 — 홈페이지 제작 의뢰 접수 창구.
 *
 * 마을에서 유일하게 외부인이 데이터를 남기는 화면이라, 다른 패널과 다른 규칙이 셋 있다:
 * 1. 손님 화면에는 **금액을 찍지 않는다**(2026-10-18). 서버는 참고 금액을 계속 계산해
 *    접수와 함께 관리자 접수함에만 보내고, 여기는 예상 제작 기간(주)만 보여준다.
 *    채용 심사자가 보는 사이트에 "AI 견적 창구"가 보이면 기술과 무관한 감점이라 뺐다.
 * 2. 연락처는 동의 체크 없이는 보내지 않는다(백엔드도 한 번 더 막는다).
 * 3. 허니팟 필드를 둔다 — 사람 눈에는 안 보이고 봇만 채우는 함정.
 *
 * 상담 상태(draft)는 이 컴포넌트가 들고 매 턴 백엔드에 되돌려준다. 서버는 stateless다.
 *
 * ## 화면이 둘인데 컴포넌트는 하나다
 *
 * `mode="intake"` 는 접수 창구(1차), `mode="depth"` 는 접수 뒤의 심화 문답(2차)이다.
 * **목적이 정반대다** — 1차는 문턱을 낮춰 접수까지 데려오는 게 목적이라 조금만 듣고
 * 접수 폼을 열고, 2차는 이미 접수한 사람에게서 제작에 필요한 것들을 캐내는 게 목적이라
 * 폼 대신 남은 항목을 보여준다.
 *
 * 그런데도 한 컴포넌트인 이유는 **말풍선·입력창·현판이 같은 물건이어야 하기 때문**이다.
 * 갈라 두면 한쪽만 손보다가 도안이 두 사람처럼 보이게 된다. 다른 것은 mode 분기 세 곳
 * (첫마디 / 보내는 곳 / 오른쪽 패널)뿐이고, 나머지는 전부 공유한다.
 *
 * ## 1차 접수는 자유 채팅이 아니라 릴레이 설문이다 (2026-08-23)
 *
 * `mode="intake"` 의 왼쪽은 `IntakeDialogue` — 공방 식구 넷이 차례로 묻는 게임식 설문이다
 * (대본: `src/data/atelierIntakeScript.ts`, 상태: `useIntakeFlow`). 설문이 끝나면(또는
 * 손님이 "바로 접수" 를 누르면) 오른쪽에 기존 접수 폼이 열린다. 폼·허니팟·동의·영수증은
 * 건드리지 않았다 — 바뀐 건 draft 를 **채우는 방법**뿐이다.
 *
 * 3D 공방에서는 같은 설문을 바닥 HUD 로 띄우고(카메라가 식구를 따라간다), 끝난 뒤 이
 * 컴포넌트를 `prefill` 로 연다. 그때는 설문을 다시 돌리지 않고 요약 + 폼만 보여준다.
 */

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useMemo, useRef, useState} from "react";

import {
  consultCommission,
  consultCommissionDepth,
  submitCommission
} from "@/lib/liveApi";
import type {
  CommissionAck,
  CommissionDraft,
  CommissionTrack,
  SharedArtifact
} from "@/types/live";

import {SPEAKER_NAME} from "@/data/atelierIntakeScript";
import {
  aiQuestionStep,
  buildDepthScript,
  collectAskedPairs,
  depthWrapupLine,
  readSlotValue
} from "@/data/atelierDepthScript";
import {
  generateCommissionQuestions,
  saveCommissionDepthAnswers
} from "@/lib/liveApi";
import "./commission/commissionDesk.css";
import {DurationTicker} from "./commission/DurationTicker";
import {IntakeDialogue} from "./commission/IntakeDialogue";
import {
  useDialogueFlow,
  useIntakeFlow,
  type DialogueLine
} from "./commission/useIntakeFlow";

type DeskMode = "intake" | "depth";

/** 3D 공방 HUD 에서 설문을 마친 뒤 넘겨받는 것. 설문을 다시 돌리지 않는다. */
export interface DeskPrefill {
  draft: CommissionDraft;
  lines: DialogueLine[];
}

interface ChatLine {
  role: "visitor" | "npc";
  content: string;
}

const GREETING =
  "어서 오세요. 여기는 마을 지하 의뢰 공방이에요. 저는 접수를 맡은 도안이라고 해요.\n" +
  "만들고 싶은 홈페이지가 어떤 건지 말씀해 주세요. 막연해도 괜찮아요, 같이 정리하면 돼요.";

const STARTERS = [
  "우리 가게 홍보용 사이트가 필요해요",
  "예약을 받을 수 있는 페이지를 만들고 싶어요",
  "회사 소개 사이트를 새로 하고 싶어요",
  "제 포트폴리오 사이트요"
];

export function CommissionDesk({
  onClose,
  mode = "intake",
  track,
  token = "",
  prefill
}: {
  onClose: () => void;
  /** intake = 접수 창구(1차) · depth = 접수 뒤 심화 문답(2차) */
  mode?: DeskMode;
  /** depth 모드에서만 쓴다. 서버가 준 접수 요약 + 지난 문답. */
  track?: CommissionTrack;
  /** depth 모드의 열쇠. 주소창에서 온다 — track 응답에는 담기지 않는다. */
  token?: string;
  /** 3D 공방 HUD 가 설문을 끝내고 넘겨준 것. 있으면 설문 대신 요약+폼으로 연다. */
  prefill?: DeskPrefill;
}) {
  if (mode === "intake" && !prefill) {
    return <IntakeDesk onClose={onClose} />;
  }
  if (mode === "depth" && track && token) {
    return <DepthRelayDesk onClose={onClose} track={track} token={token} />;
  }
  return (
    <ChatDesk
      onClose={onClose}
      mode={mode}
      track={track}
      token={token}
      prefill={prefill}
    />
  );
}

/* ─────────────────────────── 심화 문답 데스크 (2차 — 릴레이) ───────────────────────────
 *
 * 1층과 같은 엔진(`useDialogueFlow`)에 2층 대본(`atelierDepthScript`)을 꽂는다.
 * 다른 점 셋:
 * - 참고치가 없다(`withEstimate:false`) — 심화 문답은 기간·비용을 다시 잡는 자리가 아니다. 문답 중
 *   새 기능이 드러나면 features 에 누적만 하고 "담당자가 다시 안내"가 규칙.
 * - 답 하나마다 `saveCommissionDepthAnswers` 로 저장한다 — 창을 닫아도 남는다.
 * - 고정 문항이 끝나면 gate 스텝이 서버에서 AI 맞춤 질문(최대 5, 1회 멱등)을 받아 온다.
 */

function DepthRelayDesk({
  onClose,
  track,
  token
}: {
  onClose: () => void;
  track: CommissionTrack;
  token: string;
}) {
  // 분기 답의 로컬 사본 — gate 의 "이미 물은 것" 목록을 만들 때 쓴다.
  const branchRef = useRef<Record<string, string>>({...track.branch});

  const script = useMemo(() => buildDepthScript(track), [track]);
  const initialLines = useMemo<Omit<DialogueLine, "id">[]>(
    () =>
      (track.messages ?? []).map(message => ({
        speaker:
          message.role === "visitor"
            ? ("visitor" as const)
            : ("intake" as const),
        text: message.content
      })),
    [track.messages]
  );

  const flow = useDialogueFlow({
    script,
    initialDraft: track.draft,
    initialLines,
    withEstimate: false,
    // 자유 대화는 심화 문답 경로(도안 페르소나 + 서버가 곧장 저장)를 탄다.
    replyAs: "intake",
    consult: async (message, _draft, history) => {
      const result = await consultCommissionDepth(token, message, history);
      return {reply: result.reply, draft: result.draft};
    },
    wrapup: () => depthWrapupLine(),
    onAnswered: (question, draft, visitorText, skipped) => {
      if (skipped || !question.store) return;
      const {kind, key} = question.store;
      const payload: Parameters<typeof saveCommissionDepthAnswers>[1] = {};
      if (kind === "slot") {
        payload.slots = {
          [key]:
            readSlotValue(draft as unknown as Record<string, unknown>, key) ||
            visitorText
        };
      } else if (kind === "branch") {
        branchRef.current[key] = visitorText;
        payload.branch = {[key]: visitorText};
      } else {
        payload.ai_answers = {[key]: visitorText};
      }
      if (draft.features.length) payload.features = draft.features;
      // 실패해도 대화는 계속 — 서버 폴백은 consult 경로가 이미 갖고 있다.
      saveCommissionDepthAnswers(token, payload).catch(() => undefined);
    },
    gate: async draft => {
      const asked = collectAskedPairs(
        track.site_type,
        draft as unknown as Record<string, unknown>,
        branchRef.current
      );
      const result = await generateCommissionQuestions(token, asked);
      return result.questions
        .filter(item => !item.answer.trim())
        .map(aiQuestionStep);
    }
  });

  return (
    <DeskShell
      onClose={onClose}
      subtitle={`접수번호 ${track.public_id} · 제작을 위한 심화 문답`}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {track.preview ? <PreviewPane preview={track.preview} /> : null}

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section className="flex min-h-0 flex-1 flex-col cd-bd lg:border-r">
            <IntakeDialogue
              flow={flow}
              layout="panel"
              doneNote="다 여쭤봤어요 · 덧붙일 말은 언제든"
            />
          </section>

          <aside className="flex min-h-0 shrink-0 flex-col overflow-y-auto cd-bd border-t px-5 py-5 lg:w-[340px] lg:border-t-0">
            <DurationCard draft={track.draft} />
            <DepthProgress draft={flow.draft} />
            <p className="cd-note cd-bd mt-4 border-t pt-4">
              여기서 주신 답은 바로 저장돼요. 중간에 닫으셔도 이어서 하실 수
              있어요.
            </p>
          </aside>
        </div>
      </div>
    </DeskShell>
  );
}

/* ─────────────────────────── 릴레이 설문 데스크 (1차) ─────────────────────────── */

function IntakeDesk({onClose}: {onClose: () => void}) {
  const flow = useIntakeFlow();
  const [ack, setAck] = useState<CommissionAck | null>(null);
  const [early, setEarly] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const formOpen =
    !ack && (flow.phase === "done" || early) && flow.draft.ready_to_submit;

  return (
    <DeskShell
      onClose={onClose}
      subtitle={`지금은 ${
        SPEAKER_NAME[flow.speaker]
      } 차례 · 홈페이지 제작 상담과 접수`}
    >
      {ack ? (
        <CommissionReceipt ack={ack} onClose={onClose} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section className="flex min-h-0 flex-1 flex-col cd-bd lg:border-r">
            {/* 휴대폰에서는 기간을 대화 위 한 줄로 올린다. 아래 패널까지 내려가지 않아도 보인다. */}
            <div className="lg:hidden">
              <DurationTicker estimate={flow.estimate} tone="light" compact />
            </div>
            <IntakeDialogue flow={flow} layout="panel" />
          </section>

          {/* 휴대폰에서는 접수 칸이 열리기 전까지 아래 패널 높이를 묶는다. 글자가 커진 만큼
              패널이 대화 영역을 눌러 선택지가 한 장도 안 보였다(390x844 실측). */}
          <aside
            className={`flex min-h-0 shrink-0 flex-col overflow-y-auto cd-bd border-t px-5 py-5 lg:w-[340px] lg:border-t-0 ${
              formOpen ? "" : "max-lg:max-h-[22vh]"
            }`}
          >
            <div className="hidden lg:block">
              <DurationTicker estimate={flow.estimate} tone="light" />
            </div>
            <p className="cd-note mt-3">
              고르는 대로 기간이 움직여요. 확정이 아니라 참고 범위이고, 비용은
              접수 뒤 담당자가 직접 안내드려요.
            </p>
            <RequirementList draft={flow.draft} />

            <AnimatePresence>
              {formOpen ? (
                <SubmitForm draft={flow.draft} onAck={setAck} />
              ) : (
                <p className="cd-note cd-bd mt-4 border-t pt-4">
                  {flow.draft.ready_to_submit ? (
                    <>
                      설문이 끝나면 접수 칸이 열려요.{" "}
                      <button
                        type="button"
                        onClick={() => setEarly(true)}
                        className="cd-link"
                      >
                        지금 바로 접수할래요
                      </button>
                    </>
                  ) : (
                    "어떤 사이트인지, 규모가 어느 정도인지 고르면 접수할 수 있어요."
                  )}
                </p>
              )}
            </AnimatePresence>
          </aside>
        </div>
      )}
    </DeskShell>
  );
}

/* ─────────────────────────── 껍데기 — 현판 머리 ─────────────────────────── */

function DeskShell({
  onClose,
  subtitle,
  children
}: {
  onClose: () => void;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="cd fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-6"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      role="dialog"
      aria-modal="true"
      aria-label="홈페이지 제작 의뢰 공방"
    >
      <motion.div
        className="cd-sheet flex h-full max-h-[860px] w-full max-w-[1040px] flex-col overflow-hidden"
        initial={{opacity: 0, y: 24, scale: 0.98}}
        animate={{opacity: 1, y: 0, scale: 1}}
        exit={{opacity: 0, y: 24, scale: 0.98}}
        transition={{type: "spring", stiffness: 240, damping: 26}}
      >
        <header className="cd-head flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="cd-ico" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3 18l3 3 6.5-6.5a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.4-.6-.6-2.4z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="cd-title">의뢰 공방</p>
              <p className="cd-sub">{subtitle}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="cd-btn shrink-0">
            닫기
          </button>
        </header>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── 채팅 데스크 (2차 심화 · 3D 설문 뒤 요약) ─────────────────────────── */

function ChatDesk({
  onClose,
  mode,
  track,
  token,
  prefill
}: {
  onClose: () => void;
  mode: DeskMode;
  track?: CommissionTrack;
  token: string;
  prefill?: DeskPrefill;
}) {
  const depth = mode === "depth";

  const [lines, setLines] = useState<ChatLine[]>(() => {
    if (prefill) {
      // 3D 공방에서 식구들과 나눈 설문을 그대로 이어 붙인다 — 손님 눈에는 같은 대화다.
      return prefill.lines.map(line => ({
        role: line.speaker === "visitor" ? "visitor" : "npc",
        content:
          line.speaker === "visitor" || line.speaker === "intake"
            ? line.text
            : `[${SPEAKER_NAME[line.speaker]}] ${line.text}`
      }));
    }
    if (!depth) return [{role: "npc", content: GREETING}];
    // 지난 문답이 있으면 그대로 이어 붙인다 — 창을 닫았다 다시 와도 처음부터
    // 설명하지 않아도 되는 게 이 화면의 존재 이유 중 하나다.
    const history: ChatLine[] = (track?.messages ?? []).map(message => ({
      role: message.role,
      content: message.content
    }));
    return [...history, {role: "npc", content: track?.greeting ?? GREETING}];
  });
  const [draft, setDraft] = useState<CommissionDraft | null>(
    prefill?.draft ?? track?.draft ?? null
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [ack, setAck] = useState<CommissionAck | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [lines, sending]);

  // Esc로 닫기 — 접수 완료 화면에서도 동일하게 동작한다
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setInput("");
    setError("");
    setLines(prev => [...prev, {role: "visitor", content: trimmed}]);
    setSending(true);

    try {
      const history = lines.map(line => `${line.role}: ${line.content}`);
      const result =
        depth && token
          ? await consultCommissionDepth(token, trimmed, history)
          : await consultCommission(trimmed, draft, history);
      setDraft(result.draft);
      setLines(prev => [...prev, {role: "npc", content: result.reply}]);
    } catch {
      setError("공방과 연결이 잠시 끊겼어요. 잠시 후 다시 말씀해 주시겠어요?");
    } finally {
      setSending(false);
    }
  }

  // 심화 문답에는 접수 폼이 없다. 이미 접수한 사람이니까.
  const ready = !depth && (draft?.ready_to_submit ?? false);

  return (
    <DeskShell
      onClose={onClose}
      subtitle={
        depth
          ? `접수원 도안 · ${track?.public_id ?? ""} 추가 문답`
          : "접수원 도안 · 정리한 내용 확인과 접수"
      }
    >
      <>
        {ack ? (
          <CommissionReceipt ack={ack} onClose={onClose} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* 시안이 공개돼 있으면 대화보다 위에 둔다 — 먼저 보고 반응하는 순서라야
                "어디가 아닌지"라는 질문이 성립한다. */}
            {depth && track?.preview ? (
              <PreviewPane preview={track.preview} />
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              {/* ── 상담 ── */}
              <section className="flex min-h-0 flex-1 flex-col cd-bd lg:border-r">
                <div
                  ref={scrollRef}
                  className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6"
                >
                  {lines.map((line, index) => (
                    <div
                      key={index}
                      className={
                        line.role === "visitor"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >
                      <p
                        className={
                          line.role === "visitor"
                            ? "cd-me"
                            : "cd-npc max-w-[88%]"
                        }
                      >
                        {line.content}
                      </p>
                    </div>
                  ))}

                  {sending ? (
                    <p className="cd-note">도안이 도면을 살펴보는 중…</p>
                  ) : null}

                  {!depth && lines.length === 1 && !sending ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {STARTERS.map(starter => (
                        <button
                          key={starter}
                          type="button"
                          onClick={() => void send(starter)}
                          className="cd-chip"
                        >
                          {starter}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {error ? (
                  <p className="cd-err mx-4 mb-2 sm:mx-6">{error}</p>
                ) : null}

                <form
                  className="cd-bd flex gap-2 border-t px-4 py-3 sm:px-6"
                  onSubmit={event => {
                    event.preventDefault();
                    void send(input);
                  }}
                >
                  <input
                    value={input}
                    onChange={event => setInput(event.target.value)}
                    placeholder={
                      depth
                        ? "편하게 답해 주세요"
                        : "어떤 홈페이지가 필요하신가요?"
                    }
                    disabled={sending}
                    className="cd-input"
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="cd-btn is-dark shrink-0"
                  >
                    보내기
                  </button>
                </form>
              </section>

              {/* ── 도면(기간·요구사항)과 접수 ── */}
              <aside className="flex min-h-0 shrink-0 flex-col overflow-y-auto cd-bd border-t px-5 py-5 lg:w-[360px] lg:border-t-0">
                <DurationCard draft={draft} />
                <RequirementList draft={draft} />

                {depth ? <DepthProgress draft={draft} /> : null}

                <AnimatePresence>
                  {ready ? (
                    draft ? (
                      <SubmitForm draft={draft} onAck={setAck} />
                    ) : null
                  ) : (
                    <p className="cd-note cd-bd mt-4 border-t pt-4">
                      {depth
                        ? "여기서 주신 답은 바로 저장돼요. 중간에 닫으셔도 이어서 하실 수 있어요."
                        : "대화를 조금 더 나누면 접수 창이 열려요. 어떤 사이트인지, 어떤 기능이 필요한지 알려주세요."}
                    </p>
                  )}
                </AnimatePresence>
              </aside>
            </div>
          </div>
        )}
      </>
    </DeskShell>
  );
}

/* ─────────────────────────── 접수 폼 — 두 데스크가 같이 쓴다 ─────────────────────────── */

function SubmitForm({
  draft,
  onAck
}: {
  draft: CommissionDraft;
  onAck: (ack: CommissionAck) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [org, setOrg] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // 허니팟
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (submitting) return;
    if (!consent) {
      setError("연락을 드리려면 연락처 수집 동의가 필요해요.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await submitCommission({
        contact_name: name,
        contact_email: email,
        contact_phone: phone,
        org,
        site_type: draft.site_type,
        summary: draft.summary,
        requirements: {
          pages: draft.pages,
          features: draft.features,
          tone: draft.tone,
          references: draft.references
        },
        budget_hint: draft.budget_hint,
        deadline_hint: draft.deadline_hint,
        estimate_min: draft.estimate_min,
        estimate_max: draft.estimate_max,
        weeks_min: draft.weeks_min,
        weeks_max: draft.weeks_max,
        estimate_reason: draft.estimate_reason,
        consent,
        website
      });
      onAck(result);
    } catch (caught) {
      const detail =
        caught && typeof caught === "object" && "detail" in caught
          ? String((caught as {detail?: unknown}).detail ?? "")
          : "";
      setError(
        detail || "접수 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      className="cd-bd mt-5 border-t pt-5"
    >
      <p className="cd-h mb-1.5">의뢰 접수하기</p>
      <p className="cd-note mb-3">
        남겨주시면 정재훈이 직접 내용을 확인하고 연락드려요. 이메일만 필수예요.
      </p>

      <div className="space-y-3">
        <Field
          label="이메일 *"
          value={email}
          onChange={setEmail}
          type="email"
          placeholder="you@example.com"
        />
        <Field
          label="이름"
          value={name}
          onChange={setName}
          placeholder="홍길동"
        />
        <Field
          label="연락처"
          value={phone}
          onChange={setPhone}
          placeholder="선택"
        />
        <Field
          label="회사·단체"
          value={org}
          onChange={setOrg}
          placeholder="선택"
        />

        {/* 허니팟 — 사람 눈에 보이지 않는다. 봇만 채운다. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
        >
          <label htmlFor="commission-website">Website</label>
          <input
            id="commission-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={event => setWebsite(event.target.value)}
          />
        </div>

        <label className="cd-note mt-1 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={consent}
            onChange={event => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#4f46e5]"
          />
          <span>
            의뢰 회신을 위해 입력한 연락처와 상담 내용을 보관하는 데 동의합니다.
            회신 목적 외에는 사용하지 않으며, 삭제를 요청하시면 지워 드려요.
          </span>
        </label>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting || !email.trim() || !consent}
          className="cd-btn is-accent is-block mt-1"
        >
          {submitting ? "접수하는 중…" : "이 내용으로 접수하기"}
        </button>
      </div>
    </motion.div>
  );
}

/**
 * 예상 제작 기간 카드. 2026-10-18 까지는 금액 범위 + `estimate_reason` + 서버 면책 문구를
 * 함께 보여주던 `EstimateCard` 였다. 금액은 관리자 접수함(`CommissionAdmin`)에만 남기고
 * 손님에게는 기간만 보여준다. `estimate_reason` 은 금액 근거라 같이 뺐다.
 */
function DurationCard({draft}: {draft: CommissionDraft | null}) {
  const hasWeeks = !!draft && draft.weeks_max > 0;

  return (
    <div className="cd-tile">
      <p className="cd-label">예상 제작 기간</p>

      {hasWeeks ? (
        <p className="cd-big mt-2">
          {draft.weeks_min}~{draft.weeks_max}
          <small>주</small>
        </p>
      ) : (
        <p className="cd-note mt-1.5">대화 내용이 쌓이면 기간을 잡아 드려요.</p>
      )}

      <p className="cd-note mt-3 text-[12.5px]">
        기간은 대화 내용을 바탕으로 한 참고 범위이며 확정이 아닙니다. 비용은
        접수 뒤 담당자가 직접 안내드립니다.
      </p>
    </div>
  );
}

function RequirementList({draft}: {draft: CommissionDraft | null}) {
  if (!draft) return null;

  const rows: {label: string; value: string}[] = [
    {label: "유형", value: draft.site_type},
    {label: "내용", value: draft.summary},
    {label: "페이지", value: draft.pages.join(", ")},
    {label: "기능", value: draft.features.join(", ")},
    {label: "분위기", value: draft.tone},
    {label: "일정", value: draft.deadline_hint},
    {label: "예산", value: draft.budget_hint}
  ].filter(row => row.value.trim());

  if (!rows.length && !draft.missing.length) return null;

  return (
    <div className="mt-5">
      <p className="cd-h mb-2.5">도안이 정리한 내용</p>

      <dl className="cd-dl space-y-2">
        {rows.map(row => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      {draft.missing.length ? (
        <p className="cd-note mt-3">
          아직 못 들은 것 — {draft.missing.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

/**
 * 시안 미리보기 — **납품물이 아니라 미끼다.**
 *
 * 추상적인 질문 열 개보다 구체적으로 틀린 시안 한 장이 정보를 훨씬 많이 뽑아낸다.
 * "이거 보시고 어디가 아닌지 말씀해 주세요" 는 사람이 대답을 정말 잘하는 질문 형태고,
 * 그래서 이 시안이 메인 한 장뿐이어도 결함이 아니다 — 오히려 적당한 미끼다.
 *
 * `srcdoc` 으로 띄우는 이유: 파일마다 공개 주소를 열어 주면 **그 주소가 곧 유출
 * 경로**가 된다. 토큰을 쥔 사람의 응답 안에 본문을 담아 보내는 편이 안전하다.
 * `sandbox` 는 비워 둔다 — 스크립트도, 폼 전송도, 외부 요청도 전부 막힌다.
 * (에이전트 프롬프트가 애초에 자립형 단일 파일을 시키므로 시안은 멀쩡히 보인다.)
 */
function PreviewPane({preview}: {preview: SharedArtifact}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="cd-bd border-b px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="cd-h">먼저 만들어 본 시안이에요</p>
          <p className="cd-note mt-0.5">
            아직 초안이라 사진은 색 블록이에요.{" "}
            <strong className="font-extrabold text-[#0e1116]">
              어디가 아닌지
            </strong>{" "}
            편하게 말씀해 주시면 그게 제일 큰 도움이 돼요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          className="cd-btn is-sm shrink-0"
        >
          {open ? "접기" : "펼치기"}
        </button>
      </div>

      {open ? (
        <div className="cd-bd mt-3 overflow-hidden rounded-[20px] border bg-white">
          <iframe
            title="시안 미리보기"
            srcDoc={preview.content}
            sandbox=""
            className="h-[320px] w-full border-0"
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * 심화 문답의 오른쪽 패널 — 무엇을 받았고 무엇이 남았는지.
 *
 * 접수 폼 자리를 대신한다. 끝이 안 보이는 문답은 사람이 중간에 그만두므로,
 * **남은 개수를 눈에 보이게** 두는 것이 이 패널의 유일한 목적이다.
 */
function DepthProgress({draft}: {draft: CommissionDraft | null}) {
  if (!draft) return null;

  const rows: {label: string; value: string}[] = [
    {label: "운영·수정", value: draft.who_updates},
    {label: "콘텐츠", value: draft.content_owner},
    {label: "성공 기준", value: draft.success_metric},
    {label: "기존 자산", value: draft.existing_assets},
    {label: "피할 것", value: draft.dislikes.join(", ")},
    {label: "참고 이유", value: draft.reference_notes},
    {label: "결정하는 분", value: draft.decision_maker}
  ];
  const answered = rows.filter(row => row.value.trim());

  // 남은 항목은 **여기서 센다.** 서버가 준 depth_missing 을 그대로 쓰면 릴레이가 답을
  // 로컬 draft 에 담는 동안 숫자가 안 줄어, 답해도 그대로인 것처럼 보인다(실측 버그).
  const remaining = rows.filter(row => !row.value.trim()).map(row => row.label);
  const plannerAnswered = draft.planner_questions.filter(item =>
    item.answer.trim()
  );

  return (
    <div className="cd-bd mt-5 border-t pt-5">
      <p className="cd-h mb-2.5">제작에 필요한 것</p>

      {answered.length ? (
        <dl className="cd-dl space-y-2">
          {answered.map(row => (
            <div key={row.label}>
              <dt className="is-done">✓ {row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {plannerAnswered.length ? (
        <>
          <p className="cd-label mt-4">기획자가 더 여쭌 것</p>
          <dl className="mt-2 space-y-2">
            {plannerAnswered.map(item => (
              <div key={item.id} className="text-[14px] leading-relaxed">
                <dt className="cd-dim">{item.question}</dt>
                <dd className="font-bold">→ {item.answer}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      {remaining.length ? (
        <p className="cd-note mt-3">
          남은 항목 {remaining.length}가지 — {remaining.join(" · ")}
        </p>
      ) : (
        <p className="cd-okbox mt-3">
          필요한 내용을 다 받았어요. 덧붙이실 게 있으면 편하게 남겨주세요.
        </p>
      )}
    </div>
  );
}

function CommissionReceipt({
  ack,
  onClose
}: {
  ack: CommissionAck;
  onClose: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-6 py-10 text-center">
      <span className="cd-ico is-lg mt-auto" aria-hidden="true">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <div>
        <p className="cd-title text-[26px]">접수되었습니다</p>
        <p className="mt-2 text-[15px] leading-relaxed">{ack.message}</p>
      </div>
      <p className="cd-code">{ack.public_id}</p>
      <p className="cd-note max-w-[440px]">
        접수번호를 적어두시면 나중에 문의하실 때 빠르게 찾을 수 있어요. 상담
        내용도 함께 저장되어 있어 처음부터 다시 설명하지 않으셔도 됩니다.
      </p>

      {/* 심화 문답으로 가는 문. **접수 직후가 가장 잘 눌리는 순간이다** —
          이미 마음을 낸 참이고, 메일을 기다리는 동안 할 일이 생기는 셈이라. */}
      {ack.track_path ? (
        <div className="cd-tile w-full max-w-[460px] text-left">
          <p className="cd-h">3분만 더 — 결과가 많이 달라져요</p>
          <p className="cd-note mt-1.5">
            사진은 누가 준비하실지, 만든 뒤엔 누가 고치실지 같은 걸 몇 가지 더
            여쭤보고 싶어요. 실제로 만들 때 꼭 필요한 것들이라, 미리 알면 훨씬
            잘 맞춰 드릴 수 있습니다.
          </p>
          <a href={ack.track_path} className="cd-btn is-accent mt-3">
            도안에게 마저 알려주기
          </a>
          <p className="cd-note mt-2.5 text-[12.5px]">
            지금 안 하셔도 괜찮아요. 이 주소는 그대로 열려 있으니 나중에
            돌아오셔도 됩니다.
          </p>
        </div>
      ) : null}

      <button type="button" onClick={onClose} className="cd-btn mb-auto mt-1">
        마을로 돌아가기
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="cd-flabel">{label}</span>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="cd-field"
      />
    </label>
  );
}
