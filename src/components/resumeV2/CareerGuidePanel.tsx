"use client";

/**
 * 두꺼비 대화창. CareerGuide 가 처음 누를 때 받아 온다.
 *
 * 답의 종류는 서버가 정한다(`mode`):
 *   answer   근거로 만든 답. 아래에 출처 링크가 붙는다.
 *   snippets 답을 못 만들었거나 검사에서 버려져, 찾은 부분만 그대로 보여 준다.
 *   none     기록에 없는 내용.
 * 화면은 그 셋을 그대로 그릴 뿐 문장을 보태지 않는다.
 */

import Link from "next/link";
import {type FormEvent, useEffect, useRef, useState} from "react";
import {ApiError, askCareer, type CareerAnswer} from "@/lib/liveApi";
import {GuideCharacter} from "./CareerGuide";

type Turn =
  | {who: "me"; text: string}
  | {who: "note"; answer: CareerAnswer}
  | {who: "error"; text: string};

const SUGGESTIONS = [
  "백엔드 경험을 요약해 주세요",
  "어떤 기술을 주로 쓰나요?",
  "AjouFesta 5월 운영에서 무슨 문제가 있었나요?",
  "언제 입사할 수 있나요?"
];

const MAX_LEN = 300;

export default function CareerGuidePanel({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const lastQuestion = useRef<string | undefined>(undefined);
  // 처음 열면 두꺼비가 잠깐 뜸을 들였다가 인사한다. 한 번 인사한 뒤에는 다시 열어도 그대로 있다.
  const [greeted, setGreeted] = useState(false);

  useEffect(() => {
    if (!open || greeted) return;
    const timer = window.setTimeout(() => setGreeted(true), 650);
    return () => window.clearTimeout(timer);
  }, [open, greeted]);

  useEffect(() => {
    if (open) inputRef.current?.focus({preventScroll: true});
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [turns, busy]);

  async function send(raw: string) {
    const question = raw.trim().slice(0, MAX_LEN);
    if (!question || busy) return;
    setText("");
    setBusy(true);
    setTurns(t => [...t, {who: "me", text: question}]);
    try {
      const answer = await askCareer(question, lastQuestion.current);
      lastQuestion.current = question;
      setTurns(t => [...t, {who: "note", answer}]);
    } catch (err) {
      const text =
        err instanceof ApiError && err.status === 429
          ? "질문이 잠시 몰렸습니다. 조금 뒤에 다시 물어봐 주세요."
          : "지금은 답을 가져오지 못했습니다. 이력서 본문은 그대로 읽을 수 있습니다.";
      setTurns(t => [...t, {who: "error", text}]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(text);
  }

  return (
    <section
      id="cg-panel"
      className={`cg-panel${open ? " is-open" : ""}`}
      role="dialog"
      aria-label="경력 안내 두꺼비"
      aria-hidden={!open}
      inert={!open}
    >
      <header className="cg-head">
        <GuideCharacter size={36} thinking={busy} />
        <div className="cg-head-text">
          <strong>두꺼비</strong>
          <span>이력서와 프로젝트 기록에서 찾아 답합니다</span>
        </div>
        <button
          type="button"
          className="cg-close"
          onClick={onClose}
          aria-label="닫기"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M4 4l10 10M14 4L4 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <div className="cg-log" ref={logRef} aria-live="polite">
        {greeted ? (
          <div className="cg-msg cg-note cg-hello">
            {/* 인사말은 본인이 정한 말투다(2026-11-15). 다른 화면의 평서체 규칙과 다르다. */}
            <p>안녕하세요~ 재훈의 기록을 들고 다니는 두꺼비예요.</p>
            <p>프로젝트든 경력이든, 궁금한 건 뭐든 물어보세요!</p>
            <p className="cg-notice">
              이력서와 프로젝트 기록에 적힌 내용만 답하고, 답 아래에 근거를
              붙여요.
            </p>
          </div>
        ) : (
          <div className="cg-msg cg-note cg-wait" aria-label="인사하는 중">
            <i />
            <i />
            <i />
          </div>
        )}
        {greeted && turns.length === 0 ? (
          <div className="cg-chips">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                className="cg-chip"
                onClick={() => void send(s)}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {turns.map((turn, i) => {
          if (turn.who === "me")
            return (
              <div key={i} className="cg-msg cg-me">
                <p>{turn.text}</p>
              </div>
            );
          if (turn.who === "error")
            return (
              <div key={i} className="cg-msg cg-note cg-quiet">
                <p>{turn.text}</p>
              </div>
            );
          const {mode, answer, note, sources} = turn.answer;
          // 링크는 페이지 단위라, 같은 페이지의 근거는 칩 하나로 묶는다.
          const pages = sources.filter(
            (s, j) => sources.findIndex(o => o.href === s.href) === j
          );
          return (
            <div
              key={i}
              className={`cg-msg cg-note${mode === "none" ? " cg-quiet" : ""}`}
            >
              {answer ? <p>{answer}</p> : null}
              {note ? <p className="cg-notice">{note}</p> : null}
              {mode === "snippets"
                ? sources.map((s, j) => (
                    <blockquote key={j} className="cg-quote">
                      {s.snippet}
                    </blockquote>
                  ))
                : null}
              {pages.length > 0 ? (
                <ul className="cg-src" aria-label="근거">
                  {pages.map((s, j) => (
                    <li key={j}>
                      <Link href={s.href} onClick={onClose}>
                        <span className="cg-src-k">근거</span>
                        <span className="cg-src-t">
                          {s.href === "/resume"
                            ? `이력서 ${s.section}`
                            : s.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}

        {busy ? (
          <div className="cg-msg cg-note cg-wait" aria-label="기록을 찾는 중">
            <i />
            <i />
            <i />
          </div>
        ) : null}
      </div>

      <form className="cg-form" onSubmit={onSubmit}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={MAX_LEN}
          placeholder="총학생회에서 맡은 일은 무엇인가요?"
          aria-label="질문"
          enterKeyHint="send"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          aria-label="보내기"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M9 15V3M4 8l5-5 5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
      <p className="cg-foot">
        AI 가 기록을 찾아 쓴 답입니다. 질문은 저장하지 않습니다.
      </p>
    </section>
  );
}
