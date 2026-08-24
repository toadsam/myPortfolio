"use client";

import {useCallback, useMemo, useRef, useState} from "react";
import {NOTICE_TOTAL, useAjou} from "../context";
import {
  Body,
  Caveat,
  Kicker,
  NoteBox,
  SectionShell,
  TryHint,
  WordHeading,
  fade,
  rise
} from "../parts";
import {useInView, useTimeline} from "../useTimeline";

// 01 · 흩어진 공지 — 「불편했다」를 문장으로 말하지 않고 방문자가 겪게 한다.
// 다섯 채널을 직접 열어 공지 6개를 주워야 다음으로 넘어가는 이유가 생긴다.

const STEPS = [0, 150, 600, 1100];
const IDX = {label: 0, heading: 1, body: 2, board: 3};

interface Item {
  id: string;
  text: string;
  /** 공식 공지인가 — 아니면 잡담·홍보 같은 소음. */
  official: boolean;
  meta?: string;
}

interface Channel {
  key: string;
  name: string;
  hint: string;
  items: Item[];
}

const CHANNELS: Channel[] = [
  {
    key: "insta",
    name: "인스타그램",
    hint: "스토리는 24시간이면 사라진다",
    items: [
      {id: "i1", text: "총회 일정 6/30 안내", official: true, meta: "스토리"},
      {id: "i2", text: "대동제 라인업 티저", official: false, meta: "게시물"},
      {id: "i3", text: "제휴 카페 3곳 추가", official: true, meta: "게시물"}
    ]
  },
  {
    key: "everytime",
    name: "에브리타임",
    hint: "공지와 잡담이 같은 목록에 섞인다",
    items: [
      {
        id: "e1",
        text: "학식 환불 어디서 신청함?",
        official: false,
        meta: "자유"
      },
      {id: "e2", text: "학식 환불 접수 시작", official: true, meta: "공지"},
      {id: "e3", text: "도서관 자리 맡기 좀", official: false, meta: "자유"}
    ]
  },
  {
    key: "kakao",
    name: "카톡 공지방",
    hint: "들어간 사람만 본다",
    items: [
      {id: "k1", text: "셔틀 노선 임시 변경", official: true, meta: "공지방"},
      {id: "k2", text: "ㅇㅇ 확인했습니다", official: false, meta: "대화"}
    ]
  },
  {
    key: "mail",
    name: "학과 메일",
    hint: "안 읽은 메일 217통 아래에 묻힌다",
    items: [
      {
        id: "m1",
        text: "1분기 감사 자료 열람 안내",
        official: true,
        meta: "메일"
      },
      {id: "m2", text: "[광고] 학생 대상 보험", official: false, meta: "메일"}
    ]
  },
  {
    key: "poster",
    name: "게시판 포스터",
    hint: "그 건물을 지나야 본다",
    items: [
      {id: "p1", text: "심야 열람실 연장 운영", official: true, meta: "종이"},
      {id: "p2", text: "동아리 신입 모집", official: false, meta: "종이"}
    ]
  }
];

export function ScatterSection() {
  const {reducedMotion, noticeCount, raiseNoticeCount, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {threshold: 0.2});
  const on = useTimeline(STEPS, inView, reducedMotion);
  const instant = reducedMotion;

  const [open, setOpen] = useState<string | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [opened, setOpened] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);

  const done = found.length >= NOTICE_TOTAL;

  const openChannel = useCallback((key: string) => {
    setOpen(prev => (prev === key ? null : key));
    setOpened(prev => (prev.includes(key) ? prev : [...prev, key]));
    setMiss(null);
  }, []);

  const pick = useCallback(
    (item: Item) => {
      if (!item.official) {
        setMiss(item.id);
        announce(`${item.text} — 공식 공지가 아닙니다.`);
        return;
      }
      if (found.includes(item.id)) return;
      const next = [...found, item.id];
      setFound(next);
      raiseNoticeCount(next.length);
      announce(
        next.length >= NOTICE_TOTAL
          ? `공지 ${next.length}개를 모두 찾았습니다.`
          : `공지를 찾았습니다. ${next.length} / ${NOTICE_TOTAL}`
      );
    },
    [found, raiseNoticeCount, announce]
  );

  const openedCount = opened.length;
  const progressPct = useMemo(
    () => Math.round((found.length / NOTICE_TOTAL) * 100),
    [found.length]
  );

  return (
    <SectionShell innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant}>
        01 · 흩어진 공지
      </Kicker>

      <div className="mt-4" style={rise(on[IDX.heading], instant)}>
        <WordHeading
          text="공지 6개를 찾아 보세요"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          채널을 눌러 열고, 그 안에서 <strong>공식 공지</strong>만 골라 담아
          주세요. 잡담과 광고가 같이 섞여 있습니다. 실제로 학생들이 매주 하던
          일입니다.
        </Body>
        <div className="mt-3">
          <TryHint>채널 카드를 눌러 펼치고 → 공지 줄을 누르면 담깁니다</TryHint>
        </div>
      </div>

      {/* ── 게시판 ── */}
      <div className="mt-9" style={rise(on[IDX.board], instant, "0.7s")}>
        {/* 진행 막대 */}
        <div className="mb-5 flex items-center gap-4">
          <div
            className="h-[6px] flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]"
            role="progressbar"
            aria-valuenow={found.length}
            aria-valuemin={0}
            aria-valuemax={NOTICE_TOTAL}
            aria-label="찾은 공지"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${progressPct}%`,
                background: done ? "var(--aj-ok)" : "var(--aj-primary)"
              }}
            />
          </div>
          <span className="shrink-0 font-mono text-[12px] tabular-nums text-[var(--aj-muted)]">
            <span style={{color: done ? "var(--aj-ok)" : "var(--aj-primary)"}}>
              {found.length}
            </span>{" "}
            / {NOTICE_TOTAL}
          </span>
        </div>

        <div className="aj-cork rounded-lg border border-[rgba(255,255,255,0.08)] p-3 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CHANNELS.map(ch => {
              const isOpen = open === ch.key;
              const chFound = ch.items.filter(
                i => i.official && found.includes(i.id)
              ).length;
              const chTotal = ch.items.filter(i => i.official).length;
              const cleared = chFound === chTotal;

              return (
                <div key={ch.key} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => openChannel(ch.key)}
                    aria-expanded={isOpen}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-3 text-left transition-colors duration-200"
                    style={{
                      borderColor: cleared
                        ? "rgba(74,222,128,0.4)"
                        : isOpen
                        ? "var(--aj-primary)"
                        : "rgba(255,255,255,0.14)",
                      background: isOpen
                        ? "rgba(251,113,133,0.10)"
                        : "rgba(0,0,0,0.32)"
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-white">
                        {ch.name}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] text-[var(--aj-muted)]">
                        {ch.hint}
                      </span>
                    </span>
                    <span
                      className="shrink-0 font-mono text-[11px] tabular-nums"
                      style={{
                        color: cleared ? "var(--aj-ok)" : "var(--aj-faint)"
                      }}
                    >
                      {cleared ? "✓" : `${chFound}/${chTotal}`}
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="mt-2 flex flex-col gap-1.5 rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.45)] p-2">
                      {ch.items.map(item => {
                        const taken = found.includes(item.id);
                        const missed = miss === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => pick(item)}
                            disabled={taken}
                            className={`flex items-center gap-2 rounded px-2.5 py-2 text-left transition-colors duration-150 ${
                              missed && !instant ? "aj-shake" : ""
                            }`}
                            style={{
                              background: taken
                                ? "rgba(74,222,128,0.12)"
                                : missed
                                ? "rgba(248,113,113,0.14)"
                                : "rgba(255,255,255,0.03)",
                              cursor: taken ? "default" : "pointer"
                            }}
                          >
                            <span
                              className="shrink-0 font-mono text-[10px] uppercase tracking-wider"
                              style={{color: "var(--aj-faint)"}}
                            >
                              {item.meta}
                            </span>
                            <span
                              className="min-w-0 flex-1 truncate text-[12px]"
                              style={{
                                color: taken
                                  ? "var(--aj-ok)"
                                  : "rgba(255,255,255,0.82)",
                                textDecoration: taken ? "line-through" : "none"
                              }}
                            >
                              {item.text}
                            </span>
                            {taken ? (
                              <span
                                className="shrink-0 text-[11px]"
                                style={{color: "var(--aj-ok)"}}
                                aria-hidden="true"
                              >
                                담김
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 결론 ── */}
        <div
          className="mt-6"
          style={fade(done, instant, "0.6s")}
          aria-hidden={!done}
        >
          {done ? (
            <NoteBox label="방금 하신 일" accent="var(--aj-primary)">
              <p className="text-[14px] leading-[28px]">
                공지 <strong>6개</strong>를 모으려고 채널{" "}
                <strong>{openedCount}개</strong>를 열었습니다. 학생 한 명이 매주
                반복하던 동선이고,{" "}
                <span className="text-[var(--aj-accent)]">
                  하나라도 안 열면 그 공지는 못 본 것
                </span>
                이 됩니다.
              </p>
              <p className="mt-3 text-[14px] leading-[28px] text-[var(--aj-muted)]">
                그래서 목표는 기능을 늘리는 게 아니라{" "}
                <strong>주소를 하나로 줄이는 것</strong>이었습니다.
              </p>
            </NoteBox>
          ) : null}
        </div>

        <Caveat>
          채널 구성과 문구는 당시 상황을 재현한 예시입니다. 채널별 실제 도달률은
          측정하지 않았습니다.
        </Caveat>
      </div>
    </SectionShell>
  );
}
