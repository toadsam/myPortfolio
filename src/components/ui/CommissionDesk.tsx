"use client";

/**
 * 의뢰 공방 — 홈페이지 제작 의뢰 접수 창구.
 *
 * 마을에서 유일하게 외부인이 데이터를 남기는 화면이라, 다른 패널과 다른 규칙이 셋 있다:
 * 1. 견적 옆에는 **항상** 면책 문구가 붙는다. AI가 부른 금액은 확정 견적이 아니다.
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
 */

import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useRef, useState} from "react";

import {
  consultCommission,
  consultCommissionDepth,
  submitCommission
} from "@/lib/liveApi";
import type {
  CommissionAck,
  CommissionDraft,
  CommissionTrack
} from "@/types/live";

type DeskMode = "intake" | "depth";

interface ChatLine {
  role: "visitor" | "npc";
  content: string;
}

const GREETING =
  "어서 오세요. 여기는 마을 지하 의뢰 공방이에요. 저는 접수를 맡은 도안이라고 해요.\n" +
  "만들고 싶은 홈페이지가 어떤 건지 편하게 말씀해 주세요. 막연해도 괜찮아요, 같이 정리해 드릴게요.";

const STARTERS = [
  "우리 가게 홍보용 사이트가 필요해요",
  "예약을 받을 수 있는 페이지를 만들고 싶어요",
  "회사 소개 사이트를 새로 하고 싶어요",
  "제 포트폴리오 사이트요"
];

function formatMoney(value: number): string {
  if (!value) return "-";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억원`;
  return `${Math.round(value / 10_000).toLocaleString()}만원`;
}

export function CommissionDesk({
  onClose,
  mode = "intake",
  track,
  token = ""
}: {
  onClose: () => void;
  /** intake = 접수 창구(1차) · depth = 접수 뒤 심화 문답(2차) */
  mode?: DeskMode;
  /** depth 모드에서만 쓴다. 서버가 준 접수 요약 + 지난 문답. */
  track?: CommissionTrack;
  /** depth 모드의 열쇠. 주소창에서 온다 — track 응답에는 담기지 않는다. */
  token?: string;
}) {
  const depth = mode === "depth";

  const [lines, setLines] = useState<ChatLine[]>(() => {
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
    track?.draft ?? null
  );
  const [disclaimer, setDisclaimer] = useState(track?.disclaimer ?? "");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [org, setOrg] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // 허니팟
  const [submitting, setSubmitting] = useState(false);
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
      setDisclaimer(result.disclaimer);
      setLines(prev => [...prev, {role: "npc", content: result.reply}]);
    } catch {
      setError("공방과 연결이 잠시 끊겼어요. 잠시 후 다시 말씀해 주시겠어요?");
    } finally {
      setSending(false);
    }
  }

  async function submit() {
    if (!draft || submitting) return;
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
      setAck(result);
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

  // 심화 문답에는 접수 폼이 없다. 이미 접수한 사람이니까.
  const ready = !depth && (draft?.ready_to_submit ?? false);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      role="dialog"
      aria-modal="true"
      aria-label="홈페이지 제작 의뢰 공방"
    >
      <motion.div
        className="v-panel flex h-full max-h-[860px] w-full max-w-[1040px] flex-col overflow-hidden"
        initial={{opacity: 0, y: 24, scale: 0.98}}
        animate={{opacity: 1, y: 0, scale: 1}}
        exit={{opacity: 0, y: 24, scale: 0.98}}
        transition={{type: "spring", stiffness: 240, damping: 26}}
      >
        {/* 현판 머리 */}
        <header className="flex items-center justify-between gap-3 border-b border-[#7a5a38]/50 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="v-lantern-glow flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ff9d38]/50 bg-[#ff9d38]/12 text-lg">
              🛠️
            </span>
            <div>
              <p className="v-panel-title text-[15px]">의뢰 공방</p>
              <p className="mt-0.5 text-[11px] text-[#a9bdd6]/75">
                {depth
                  ? `접수원 도안 · ${track?.public_id ?? ""} 추가 문답`
                  : "접수원 도안 · 홈페이지 제작 상담과 접수"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-[#e2c078]/25 px-3 py-1.5 text-[11px] font-black text-[#a9bdd6]/80 transition hover:border-[#e2c078]/60 hover:text-[#f3e6c8] active:scale-95"
          >
            닫기
          </button>
        </header>

        {ack ? (
          <CommissionReceipt ack={ack} onClose={onClose} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            {/* ── 상담 ── */}
            <section className="flex min-h-0 flex-1 flex-col lg:border-r lg:border-[#7a5a38]/40">
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4"
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
                          ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm border border-[#ff9d38]/35 bg-[#ff9d38]/12 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#f3e6c8]"
                          : "max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-[#e2c078]/20 bg-white/[0.04] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#dfe7f2]"
                      }
                    >
                      {line.content}
                    </p>
                  </div>
                ))}

                {sending ? (
                  <p className="text-[12px] text-[#a9bdd6]/60">
                    도안이 도면을 살펴보는 중…
                  </p>
                ) : null}

                {!depth && lines.length === 1 && !sending ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {STARTERS.map(starter => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => void send(starter)}
                        className="rounded-full border border-[#e2c078]/25 px-3 py-1.5 text-[11px] text-[#a9bdd6] transition hover:border-[#e2c078]/60 hover:text-[#f3e6c8] active:scale-95"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {error ? (
                <p className="mx-5 mb-2 rounded-lg border border-[#ff9d38]/40 bg-[#ff9d38]/10 px-3 py-2 text-[12px] text-[#f3e6c8]">
                  {error}
                </p>
              ) : null}

              <form
                className="flex gap-2 border-t border-[#7a5a38]/40 px-5 py-3"
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
                  className="min-w-0 flex-1 rounded-lg border border-[#e2c078]/25 bg-white/[0.04] px-3 py-2.5 text-[13px] text-[#f3e6c8] outline-none transition placeholder:text-[#a9bdd6]/45 focus:border-[#ff9d38]/60 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="shrink-0 rounded-lg border border-[#ff9d38]/50 bg-[#ff9d38]/15 px-4 py-2.5 text-[12px] font-black text-[#f3e6c8] transition hover:bg-[#ff9d38]/25 active:scale-95 disabled:opacity-40"
                >
                  보내기
                </button>
              </form>
            </section>

            {/* ── 도면(견적·요구사항)과 접수 ── */}
            <aside className="flex min-h-0 shrink-0 flex-col overflow-y-auto border-t border-[#7a5a38]/40 px-5 py-4 lg:w-[380px] lg:border-t-0">
              <EstimateCard draft={draft} disclaimer={disclaimer} />
              <RequirementList draft={draft} />

              {depth ? <DepthProgress draft={draft} /> : null}

              <AnimatePresence>
                {ready ? (
                  <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    className="mt-4 border-t border-[#7a5a38]/40 pt-4"
                  >
                    <p className="v-serif mb-2 text-[13px] text-[#e2c078]">
                      의뢰 접수하기
                    </p>
                    <p className="mb-3 text-[11px] leading-relaxed text-[#a9bdd6]/75">
                      남겨주시면 정재훈이 직접 내용을 확인하고 연락드려요.
                      이메일만 필수예요.
                    </p>

                    <div className="space-y-2">
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

                      <label className="mt-1 flex cursor-pointer items-start gap-2 text-[11px] leading-relaxed text-[#a9bdd6]">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={event => setConsent(event.target.checked)}
                          className="mt-0.5 shrink-0 accent-[#ff9d38]"
                        />
                        <span>
                          의뢰 회신을 위해 입력한 연락처와 상담 내용을 보관하는
                          데 동의합니다. 회신 목적 외에는 사용하지 않으며,
                          삭제를 요청하시면 지워 드려요.
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => void submit()}
                        disabled={submitting || !email.trim() || !consent}
                        className="mt-1 w-full rounded-lg border border-[#ff9d38]/50 bg-[#ff9d38]/15 px-4 py-2.5 text-[12px] font-black text-[#f3e6c8] transition hover:bg-[#ff9d38]/25 active:scale-95 disabled:opacity-40"
                      >
                        {submitting ? "접수하는 중…" : "이 내용으로 접수하기"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <p className="mt-4 border-t border-[#7a5a38]/40 pt-4 text-[11px] leading-relaxed text-[#a9bdd6]/60">
                    {depth
                      ? "여기서 주신 답은 바로 저장돼요. 중간에 닫으셔도 이어서 하실 수 있어요."
                      : "대화를 조금 더 나누면 접수 창이 열려요. 어떤 사이트인지, 어떤 기능이 필요한지 알려주세요."}
                  </p>
                )}
              </AnimatePresence>
            </aside>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function EstimateCard({
  draft,
  disclaimer
}: {
  draft: CommissionDraft | null;
  disclaimer: string;
}) {
  const hasEstimate = !!draft && draft.estimate_max > 0;

  return (
    <div className="rounded-xl border border-[#e2c078]/25 bg-white/[0.04] p-3.5">
      <p className="v-serif text-[12px] text-[#e2c078]">참고 견적</p>

      {hasEstimate ? (
        <>
          <p className="mt-1.5 text-[18px] font-black text-[#f3e6c8]">
            {formatMoney(draft.estimate_min)} ~{" "}
            {formatMoney(draft.estimate_max)}
          </p>
          <p className="mt-0.5 text-[12px] text-[#a9bdd6]">
            제작 기간 {draft.weeks_min}~{draft.weeks_max}주
          </p>
          {draft.estimate_reason ? (
            <p className="mt-2 text-[11px] leading-relaxed text-[#a9bdd6]/70">
              {draft.estimate_reason}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-1.5 text-[12px] text-[#a9bdd6]/60">
          대화 내용이 쌓이면 범위를 잡아 드려요.
        </p>
      )}

      {/* 금액이 보이는 곳에는 면책 문구가 반드시 따라붙는다 */}
      <p className="mt-2.5 border-t border-[#7a5a38]/40 pt-2 text-[10px] leading-relaxed text-[#a9bdd6]/60">
        {disclaimer ||
          "금액과 기간은 대화 내용을 바탕으로 한 참고 범위이며 확정 견적이 아닙니다."}
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
    <div className="mt-3.5">
      <p className="v-serif mb-2 text-[12px] text-[#e2c078]">
        도안이 정리한 내용
      </p>

      <dl className="space-y-1.5">
        {rows.map(row => (
          <div key={row.label} className="flex gap-2 text-[11px]">
            <dt className="w-12 shrink-0 text-[#a9bdd6]/60">{row.label}</dt>
            <dd className="flex-1 leading-relaxed text-[#dfe7f2]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {draft.missing.length ? (
        <p className="mt-2.5 text-[11px] leading-relaxed text-[#a9bdd6]/55">
          아직 못 들은 것 — {draft.missing.join(" · ")}
        </p>
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

  const answered: {label: string; value: string}[] = [
    {label: "운영·수정", value: draft.who_updates},
    {label: "콘텐츠", value: draft.content_owner},
    {label: "성공 기준", value: draft.success_metric},
    {label: "기존 자산", value: draft.existing_assets},
    {label: "피할 것", value: draft.dislikes.join(", ")},
    {label: "참고 이유", value: draft.reference_notes},
    {label: "결정하는 분", value: draft.decision_maker}
  ].filter(row => row.value.trim());

  const remaining = draft.depth_missing;

  return (
    <div className="mt-4 border-t border-[#7a5a38]/40 pt-4">
      <p className="v-serif mb-2 text-[13px] text-[#e2c078]">
        제작에 필요한 것
      </p>

      {answered.length ? (
        <dl className="space-y-1.5">
          {answered.map(row => (
            <div key={row.label} className="flex gap-2 text-[11px]">
              <dt className="w-16 shrink-0 text-[#7bd88f]">✓ {row.label}</dt>
              <dd className="flex-1 leading-relaxed text-[#dfe7f2]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {remaining.length ? (
        <p className="mt-3 text-[11px] leading-relaxed text-[#a9bdd6]/60">
          남은 항목 {remaining.length}가지 — {remaining.join(" · ")}
        </p>
      ) : (
        <p className="mt-3 rounded-lg border border-[#7bd88f]/30 bg-[#7bd88f]/10 px-3 py-2 text-[11px] leading-relaxed text-[#dfe7f2]">
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
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <span className="v-lantern-glow text-4xl">🕯️</span>
      <div>
        <p className="v-panel-title text-[18px]">접수되었습니다</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#dfe7f2]">
          {ack.message}
        </p>
      </div>
      <p className="rounded-lg border border-[#e2c078]/30 bg-white/[0.04] px-4 py-2 font-mono text-[14px] font-black tracking-wider text-[#e2c078]">
        {ack.public_id}
      </p>
      <p className="max-w-[420px] text-[11px] leading-relaxed text-[#a9bdd6]/60">
        접수번호를 적어두시면 나중에 문의하실 때 빠르게 찾을 수 있어요. 상담
        내용도 함께 저장되어 있어 처음부터 다시 설명하지 않으셔도 됩니다.
      </p>

      {/* 심화 문답으로 가는 문. **접수 직후가 가장 잘 눌리는 순간이다** —
          이미 마음을 낸 참이고, 메일을 기다리는 동안 할 일이 생기는 셈이라. */}
      {ack.track_path ? (
        <div className="w-full max-w-[440px] rounded-xl border border-[#e2c078]/25 bg-white/[0.04] p-4">
          <p className="v-serif text-[13px] text-[#e2c078]">
            3분만 더 — 결과가 많이 달라져요
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#a9bdd6]/80">
            사진은 누가 준비하실지, 만든 뒤엔 누가 고치실지 같은 걸 몇 가지 더
            여쭤보고 싶어요. 실제로 만들 때 꼭 필요한 것들이라, 미리 알면 훨씬
            잘 맞춰 드릴 수 있습니다.
          </p>
          <a
            href={ack.track_path}
            className="mt-3 inline-block rounded-lg border border-[#ff9d38]/50 bg-[#ff9d38]/15 px-4 py-2.5 text-[12px] font-black text-[#f3e6c8] transition hover:bg-[#ff9d38]/25 active:scale-95"
          >
            도안에게 마저 알려주기
          </a>
          <p className="mt-2 text-[10px] leading-relaxed text-[#a9bdd6]/50">
            지금 안 하셔도 괜찮아요. 이 주소는 그대로 열려 있으니 나중에
            돌아오셔도 됩니다.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onClose}
        className="mt-1 rounded-lg border border-[#e2c078]/25 px-5 py-2.5 text-[12px] font-black text-[#a9bdd6]/80 transition hover:border-[#e2c078]/60 hover:text-[#f3e6c8] active:scale-95"
      >
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
      <span className="mb-1 block text-[10px] font-bold text-[#a9bdd6]/70">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#e2c078]/25 bg-white/[0.04] px-3 py-2 text-[12px] text-[#f3e6c8] outline-none transition placeholder:text-[#a9bdd6]/40 focus:border-[#ff9d38]/60"
      />
    </label>
  );
}
