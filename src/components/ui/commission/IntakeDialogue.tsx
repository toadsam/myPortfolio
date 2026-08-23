"use client";

/**
 * 릴레이 설문의 대사창 — 게임 NPC 와 얘기하는 느낌의 껍데기.
 *
 * 2D 데스크 안(`layout="panel"`)과 3D 공방 바닥(`layout="hud"`)에서 **같은 컴포넌트**다.
 * 다른 것은 바깥 상자뿐이고 대사·선택지·직접 입력·말 걸기는 전부 공유한다.
 *
 * - 마지막 NPC 대사는 한 글자씩 찍힌다. 누르면 다 보인다. 다 찍혀야 선택지가 열린다.
 * - 선택지는 "내 대사" 다. 카드엔 예시 미리보기와 가격 꼬리표가 붙는다.
 * - 아래 입력창은 항상 열려 있다 — 지금 말하는 식구에게 아무거나 묻는다.
 */

import {motion} from "framer-motion";
import {useEffect, useMemo, useRef, useState} from "react";

import {atelierNpcs} from "@/data/atelierRoster";
import {
  LATER_LABEL,
  SPEAKER_NAME,
  SPEAKER_NPC_ID,
  SPEAKER_ROLE,
  type IntakeChoice
} from "@/data/atelierIntakeScript";
import {featureWeight, formatMan, priceTag} from "@/lib/commissionPricing";
import type {CommissionPricing, CommissionSpeaker} from "@/types/live";

import {ChoicePreview} from "./ChoicePreview";
import {EstimateTicker} from "./EstimateTicker";
import type {DialogueLine, IntakeFlow} from "./useIntakeFlow";

const NPC_COLOR: Record<string, string> = Object.fromEntries(
  atelierNpcs.map(npc => [npc.id, npc.color])
);

function speakerColor(speaker: CommissionSpeaker | "visitor"): string {
  if (speaker === "visitor") return "#ff9d38";
  return NPC_COLOR[SPEAKER_NPC_ID[speaker]] ?? "#e2c078";
}

/* ─────────────────────────── 타자 연출 ─────────────────────────── */

function useTypewriter(text: string, active: boolean, cps = 38) {
  const [count, setCount] = useState(active ? 0 : text.length);
  const doneRef = useRef(!active);

  useEffect(() => {
    if (!active) {
      setCount(text.length);
      doneRef.current = true;
      return;
    }
    setCount(0);
    doneRef.current = false;
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        window.clearInterval(timer);
        doneRef.current = true;
      }
    }, 1000 / cps);
    return () => window.clearInterval(timer);
  }, [text, active, cps]);

  return {
    shown: text.slice(0, count),
    done: count >= text.length,
    finish: () => setCount(text.length)
  };
}

/* ─────────────────────────── 초상화 ─────────────────────────── */

function Portrait({
  speaker,
  size = 44,
  active = true
}: {
  speaker: CommissionSpeaker;
  size?: number;
  active?: boolean;
}) {
  const color = speakerColor(speaker);
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full border-2 font-black transition-all"
      style={{
        width: size,
        height: size,
        borderColor: color,
        background: `${color}22`,
        color,
        fontSize: size * 0.38,
        boxShadow: active ? `0 0 18px ${color}66` : "none",
        opacity: active ? 1 : 0.55
      }}
      aria-hidden="true"
    >
      {SPEAKER_NAME[speaker][0]}
    </div>
  );
}

/* ─────────────────────────── 선택지 카드 ─────────────────────────── */

function tagFor(
  choice: IntakeChoice,
  pricing: CommissionPricing | null
): string | null {
  if (!pricing) return null;
  if (choice.baseOf) {
    const base = pricing.base_by_type[choice.baseOf];
    return base
      ? `${formatMan(base.min)}~${formatMan(base.max)} 원 · ${base.weeks_min}~${
          base.weeks_max
        }주`
      : null;
  }
  if (choice.priceKeyword) {
    const w = featureWeight(pricing, choice.priceKeyword);
    return w ? `${priceTag(w.min, w.max)} · +${w.weeks}주` : null;
  }
  if (choice.effect?.features?.length || choice.effect?.pages)
    return "추가 비용 없음";
  return null;
}

function ChoiceCard({
  choice,
  pricing,
  selected,
  onClick,
  compact
}: {
  choice: IntakeChoice;
  pricing: CommissionPricing | null;
  selected: boolean;
  onClick: () => void;
  compact: boolean;
}) {
  const tag = tagFor(choice, pricing);
  const free = !!choice.free;
  return (
    <motion.button
      type="button"
      initial={{opacity: 0, y: 8}}
      animate={{opacity: 1, y: 0}}
      whileHover={{y: -2}}
      whileTap={{scale: 0.97}}
      onClick={onClick}
      className={`group flex min-w-0 flex-col rounded-xl border text-left transition ${
        selected
          ? "border-[#ff9d38] bg-[#ff9d38]/15"
          : free
          ? "border-dashed border-[#e2c078]/35 bg-white/[0.02] hover:border-[#e2c078]/70"
          : "border-[#e2c078]/25 bg-white/[0.04] hover:border-[#ff9d38]/70 hover:bg-[#ff9d38]/8"
      } ${compact ? "p-2" : "p-2.5"}`}
      aria-pressed={selected}
    >
      {choice.preview && !compact ? (
        <div className="mb-2">
          <ChoicePreview kind={choice.preview} />
        </div>
      ) : null}
      <span className="flex items-start gap-1.5 text-[12px] font-bold leading-snug text-[#f3e6c8]">
        <span className="mt-[1px] text-[#ff9d38]">{selected ? "◆" : "▸"}</span>
        <span className="min-w-0 flex-1">
          {free ? "✎ " : ""}
          {choice.label}
        </span>
      </span>
      {tag ? (
        <span
          className={`mt-1 inline-block self-start rounded-full px-1.5 py-[2px] text-[10px] font-bold ${
            tag === "추가 비용 없음"
              ? "bg-[#7bd88f]/12 text-[#7bd88f]"
              : "bg-[#ff9d38]/12 text-[#ffb865]"
          }`}
        >
          {tag}
        </span>
      ) : null}
    </motion.button>
  );
}

/* ─────────────────────────── 대사 한 줄 ─────────────────────────── */

function Line({
  line,
  typing,
  onFinish
}: {
  line: DialogueLine;
  typing: boolean;
  onFinish?: () => void;
}) {
  const isVisitor = line.speaker === "visitor";
  const {shown, done, finish} = useTypewriter(line.text, typing && !isVisitor);

  if (isVisitor) {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm border border-[#ff9d38]/35 bg-[#ff9d38]/12 px-3.5 py-2 text-[13px] leading-relaxed text-[#f3e6c8]">
          {line.text}
        </p>
      </div>
    );
  }

  const npc = line.speaker as CommissionSpeaker;
  const color = speakerColor(npc);
  return (
    <div
      className={`flex items-start gap-2.5 ${line.intrusion ? "pl-6" : ""}`}
      onClick={() => {
        if (!done) {
          finish();
          onFinish?.();
        }
      }}
    >
      <Portrait
        speaker={npc}
        size={line.intrusion ? 28 : 36}
        active={!line.intrusion}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold" style={{color}}>
          {SPEAKER_NAME[npc]}
          <span className="ml-1 font-normal text-[#a9bdd6]/60">
            {SPEAKER_ROLE[npc]}
          </span>
          {line.intrusion ? (
            <span className="ml-1 text-[#a9bdd6]/50">끼어듦</span>
          ) : null}
        </p>
        <p
          className={`mt-0.5 whitespace-pre-wrap rounded-2xl rounded-tl-sm border px-3.5 py-2 text-[13px] leading-relaxed text-[#dfe7f2] ${
            line.intrusion
              ? "border-dashed border-[#e2c078]/25 bg-white/[0.02]"
              : "border-[#e2c078]/20 bg-white/[0.04]"
          }`}
        >
          {shown}
          {!done ? (
            <span className="intake-caret ml-[1px] inline-block w-[6px] text-[#e2c078]">
              ▌
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────── 본체 ─────────────────────────── */

export function IntakeDialogue({
  flow,
  layout = "panel",
  className = ""
}: {
  flow: IntakeFlow;
  /** panel = 데스크 안 · hud = 3D 공방 바닥 */
  layout?: "panel" | "hud";
  className?: string;
}) {
  const {
    lines,
    phase,
    speaker,
    question,
    selected,
    freeChoice,
    pricing,
    estimate,
    progress
  } = flow;
  const hud = layout === "hud";

  const [typedDone, setTypedDone] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [chat, setChat] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 마지막 NPC 대사 묶음(반응 + 끼어듦)만 타자 연출. 그 앞은 이미 본 것.
  const lastNpcIndex = useMemo(() => {
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      if (lines[i].speaker !== "visitor") return i;
    }
    return -1;
  }, [lines]);

  // 새 NPC 대사가 오면 타자 완료 플래그를 내린다. 길이 기준 대략 맞춰 풀어준다.
  useEffect(() => {
    setTypedDone(false);
    const last = lines[lastNpcIndex];
    if (!last) return;
    const ms = Math.min(6000, (last.text.length / 38) * 1000 + 150);
    const timer = window.setTimeout(() => setTypedDone(true), ms);
    return () => window.clearTimeout(timer);
  }, [lastNpcIndex, lines]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [lines, typedDone, phase]);

  const choicesOpen = phase === "choosing" && typedDone && !!question;
  const showNext = phase === "speaking" && typedDone;

  // Enter 로 "다음"
  useEffect(() => {
    if (!showNext) return;
    function onKey(event: KeyboardEvent) {
      if (
        event.key === "Enter" &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        flow.next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showNext, flow]);

  const shell = hud
    ? "v-panel flex max-h-[min(48vh,440px)] flex-col overflow-hidden"
    : "flex min-h-0 flex-1 flex-col";

  return (
    <div className={`${shell} ${className}`}>
      {/* 머리 — 지금 말하는 식구 + 진행 + (hud 면) 견적 */}
      <div className="flex items-center justify-between gap-3 border-b border-[#7a5a38]/40 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Portrait speaker={speaker} size={32} />
          <div>
            <p className="text-[12px] font-black text-[#f3e6c8]">
              {SPEAKER_NAME[speaker]}{" "}
              <span className="text-[10px] font-bold text-[#a9bdd6]/70">
                {SPEAKER_ROLE[speaker]}
              </span>
            </p>
            <p className="text-[10px] text-[#a9bdd6]/60">
              {phase === "done"
                ? "설문 끝 · 접수만 남았어요"
                : `${progress.done}/${progress.total} 문항`}
            </p>
          </div>
        </div>
        {hud ? <EstimateTicker estimate={estimate} compact /> : null}
      </div>

      {/* 대사 기록 */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
      >
        {lines.map((line, index) => (
          <Line
            key={line.id}
            line={line}
            typing={index >= lastNpcIndex && line.speaker !== "visitor"}
            onFinish={() => setTypedDone(true)}
          />
        ))}
        {phase === "waiting" ? (
          <p className="pl-12 text-[11px] text-[#a9bdd6]/60">
            {SPEAKER_NAME[speaker]}이(가) 생각하는 중…
          </p>
        ) : null}

        {/* 선택지 — exit 애니메이션은 일부러 안 쓴다. 숨은 탭에서 RAF 가 멈추면
            exit 이 끝나지 않아 답한 뒤에도 선택지가 남는다. 사라지는 건 즉시. */}
        {choicesOpen && question ? (
          <motion.div
            key={question.id}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="pl-0 sm:pl-12"
          >
            <div
              className={`grid gap-2 ${
                hud
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              }`}
            >
              {question.choices.map(choice => (
                <ChoiceCard
                  key={choice.id}
                  choice={choice}
                  pricing={pricing}
                  selected={selected.includes(choice.id)}
                  onClick={() => flow.choose(choice)}
                  compact={question.choices.length > 7}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {question.multi ? (
                <button
                  type="button"
                  onClick={flow.confirmMulti}
                  className="rounded-lg border border-[#ff9d38]/50 bg-[#ff9d38]/15 px-3.5 py-1.5 text-[11px] font-black text-[#f3e6c8] transition hover:bg-[#ff9d38]/25 active:scale-95"
                >
                  {selected.length
                    ? `이 ${selected.length}개로 할게요`
                    : "딱히 없어요"}
                </button>
              ) : null}
              {!question.required ? (
                <button
                  type="button"
                  onClick={flow.skip}
                  className="rounded-lg border border-[#e2c078]/20 px-3 py-1.5 text-[11px] text-[#a9bdd6]/70 transition hover:border-[#e2c078]/50 hover:text-[#f3e6c8]"
                >
                  {LATER_LABEL}
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}

        {/* 직접 입력 */}
        {phase === "free-input" && freeChoice ? (
          <form
            className="sm:pl-12"
            onSubmit={event => {
              event.preventDefault();
              void flow.submitFree(freeText);
              setFreeText("");
            }}
          >
            <textarea
              autoFocus
              value={freeText}
              onChange={event => setFreeText(event.target.value)}
              rows={freeChoice.free === "text" ? 3 : 4}
              placeholder={
                freeChoice.free === "list"
                  ? "페이지 이름을 쉼표나 줄바꿈으로 적어 주세요 — 메인, 메뉴, 예약, 오시는 길…"
                  : freeChoice.free === "links"
                  ? "주소를 한 줄에 하나씩"
                  : "편하게 말씀해 주세요"
              }
              className="w-full rounded-xl border border-[#ff9d38]/40 bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-[#f3e6c8] outline-none placeholder:text-[#a9bdd6]/40 focus:border-[#ff9d38]/70"
            />
            <div className="mt-1.5 flex gap-2">
              <button
                type="submit"
                disabled={!freeText.trim()}
                className="rounded-lg border border-[#ff9d38]/50 bg-[#ff9d38]/15 px-3.5 py-1.5 text-[11px] font-black text-[#f3e6c8] transition hover:bg-[#ff9d38]/25 active:scale-95 disabled:opacity-40"
              >
                이렇게요
              </button>
              <button
                type="button"
                onClick={flow.cancelFree}
                className="rounded-lg border border-[#e2c078]/20 px-3 py-1.5 text-[11px] text-[#a9bdd6]/70 hover:text-[#f3e6c8]"
              >
                다시 고를게요
              </button>
            </div>
          </form>
        ) : null}

        {/* 다음 */}
        {showNext ? (
          <div className="flex justify-end">
            <motion.button
              type="button"
              initial={{opacity: 0, x: 6}}
              animate={{opacity: 1, x: 0}}
              onClick={flow.next}
              className="rounded-lg border border-[#e2c078]/35 bg-white/[0.04] px-4 py-1.5 text-[12px] font-black text-[#f3e6c8] transition hover:border-[#ff9d38]/70 hover:bg-[#ff9d38]/10 active:scale-95"
            >
              다음 ▸{" "}
              <span className="ml-1 text-[10px] font-normal text-[#a9bdd6]/60">
                Enter
              </span>
            </motion.button>
          </div>
        ) : null}
      </div>

      {/* 말 걸기 — 항상 열려 있다 */}
      <form
        className="flex gap-2 border-t border-[#7a5a38]/40 px-4 py-2.5"
        onSubmit={event => {
          event.preventDefault();
          const text = chat;
          setChat("");
          void flow.say(text);
        }}
      >
        <input
          value={chat}
          onChange={event => setChat(event.target.value)}
          disabled={phase === "waiting"}
          placeholder={`${SPEAKER_NAME[speaker]}에게 궁금한 걸 물어보세요 (선택지와 별개예요)`}
          className="min-w-0 flex-1 rounded-lg border border-[#e2c078]/20 bg-white/[0.03] px-3 py-2 text-[12px] text-[#f3e6c8] outline-none placeholder:text-[#a9bdd6]/40 focus:border-[#ff9d38]/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={phase === "waiting" || !chat.trim()}
          className="shrink-0 rounded-lg border border-[#e2c078]/30 px-3.5 py-2 text-[11px] font-black text-[#f3e6c8] transition hover:border-[#ff9d38]/60 active:scale-95 disabled:opacity-40"
        >
          말 걸기
        </button>
      </form>
    </div>
  );
}
