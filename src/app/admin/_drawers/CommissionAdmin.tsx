"use client";

import {useEffect, useState} from "react";
import type * as React from "react";
import CommissionWorkboard from "@/components/admin/CommissionWorkboard";
import {
  deleteCommission,
  fetchCommissionDetail,
  fetchCommissions,
  updateCommissionStatus
} from "@/lib/liveApi";
import type {
  Commission,
  CommissionDetail,
  CommissionStatus
} from "@/types/live";
import {LabeledField, Panel} from "../_components/AdminParts";
import {prettyDate} from "../_lib/activity";

/* ─────────────────────────── 새 의뢰 알림 ───────────────────────────
 *
 * 접수함 안에 「새 접수 N건」 칩이 있긴 했지만, 이 페이지가 2,400줄이라
 * 스크롤해서 그 패널까지 가야 보였다. 새 의뢰가 왔다는 건 페이지를 열자마자
 * 알아야 하는 정보라 맨 위로 끌어올린다.
 *
 * **세는 대상은 "새 접수"가 아니라 "내 결재를 기다리는 것" 전부다.**
 * 게이트가 3단이라 의뢰 하나가 나를 세 번 부른다 — 접수 직후, 기획 검수,
 * 산출물 검수. 접수만 세면 나머지 둘에서 조용히 멈춰 있게 된다.
 * 상태 → 게이트 대응은 backend/app/agents/gate.py 의 _GATE_OPEN_AT 이 원본이다.
 *
 * 한계 — 이건 **관리자 페이지를 열어 놨을 때만** 동작한다. 자는 동안 들어온
 * 의뢰는 다음에 페이지를 열 때 알게 된다. 자리를 비운 사이에도 알려면 외부
 * 채널(메일·메신저)이 따로 필요하다. 대신 탭 제목에 건수를 박아 두어서,
 * 탭을 켜 놓고 다른 일을 하는 동안에도 눈에 걸리게 했다.
 */

export const WAITING_ON_ME: Partial<Record<CommissionStatus, string>> = {
  received: "새 접수 — 검토 시작",
  reviewing: "검토 중 — 기획 승인 대기",
  brief_review: "기획안 검수 대기",
  artifact_review: "산출물 검수 대기"
};

/** 폴링 간격. 의뢰는 하루 몇 건이라 자주 볼 이유가 없다. */
export const POLL_MS = 60_000;

export function CommissionAlert({
  onCount,
  onOpen
}: {
  /** 내 처리를 기다리는 건수 — 아래 탭의 서랍 배지가 쓴다 */
  onCount?: (count: number) => void;
  /** 칩을 누르면 서랍장의 의뢰 접수함을 연다 */
  onOpen?: () => void;
} = {}) {
  const [items, setItems] = useState<Commission[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    async function poll() {
      try {
        const list = await fetchCommissions();
        if (alive) {
          setItems(list);
          setFailed(false);
        }
      } catch {
        // 백엔드가 꺼져 있어도 관리자 페이지의 나머지는 써야 하므로
        // 조용히 접어 둔다. 배너 자리에 빨간 에러를 띄우면 매번 거슬린다.
        if (alive) setFailed(true);
      }
    }

    void poll();
    const timer = setInterval(() => void poll(), POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const waiting = items.filter(item => WAITING_ON_ME[item.status]);

  useEffect(() => {
    onCount?.(waiting.length);
  }, [onCount, waiting.length]);

  // 탭 제목에 건수를 박는다 — 다른 탭을 보고 있어도 눈에 걸린다.
  useEffect(() => {
    const base = "관리자 · Developer's City";
    document.title = waiting.length ? `(${waiting.length}) ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [waiting.length]);

  if (failed || waiting.length === 0) return null;

  return (
    <div className="border-b border-[#ffb15e]/40 bg-[#2a2118]">
      <div className="mx-auto flex max-w-[980px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffb15e] opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ffb15e]" />
        </span>
        <strong className="text-sm font-black text-[#ff9d38]">
          내 처리를 기다리는 의뢰 {waiting.length}건
        </strong>
        <span className="flex flex-wrap gap-2">
          {waiting.map(item => (
            <button
              className="rounded-full border border-[#ffb15e]/40 bg-[#1a2027] px-3 py-1 font-mono text-[11px] font-black text-[#ff9d38] transition hover:bg-[#2a2118]"
              key={item.id}
              onClick={onOpen}
              type="button"
            >
              {item.public_id} · {WAITING_ON_ME[item.status]}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}

/** 의뢰 공방 접수함 — 외부인이 남긴 유일한 데이터라 삭제는 되물어보고 진행한다. */
export function CommissionAdmin() {
  const [items, setItems] = useState<Commission[]>([]);
  const [detail, setDetail] = useState<CommissionDetail | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setItems(await fetchCommissions());
      setStatus("");
    } catch {
      setStatus("의뢰 목록을 불러오지 못했습니다. 백엔드를 확인하세요.");
    }
  }

  async function toggle(commission: Commission) {
    if (openId === commission.id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(commission.id);
    setDetail(null);
    try {
      const loaded = await fetchCommissionDetail(commission.id);
      setDetail(loaded);
      setNote(loaded.admin_note);
    } catch {
      setStatus("상세 내용을 불러오지 못했습니다.");
    }
  }

  async function changeStatus(
    commission: Commission,
    next: CommissionStatus,
    adminNote: string
  ) {
    setBusy(true);
    try {
      const updated = await updateCommissionStatus(commission.id, {
        status: next,
        admin_note: adminNote
      });
      setItems(list =>
        list.map(item => (item.id === updated.id ? updated : item))
      );
      if (detail?.id === updated.id) setDetail({...detail, ...updated});
      setStatus("저장했습니다.");
    } catch {
      setStatus("상태를 저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(commission: Commission) {
    const ok = window.confirm(
      `${commission.public_id} 의뢰를 삭제할까요? 상담 대화 기록도 함께 지워지고 되돌릴 수 없습니다.`
    );
    if (!ok) return;

    setBusy(true);
    try {
      await deleteCommission(commission.id);
      setItems(list => list.filter(item => item.id !== commission.id));
      if (openId === commission.id) {
        setOpenId(null);
        setDetail(null);
      }
      setStatus("삭제했습니다.");
    } catch {
      setStatus("삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  // 배너(CommissionAlert)와 **같은 기준**으로 센다. 예전엔 여기만 "received"
  // 를 세서, 위 배너가 "1건 기다림"이라는데 이 칩은 "새 접수 0건"이라고 하는
  // 모순이 났다 — 게이트2·3 대기는 접수 상태가 아니기 때문이다.
  const pending = items.filter(item => WAITING_ON_ME[item.status]).length;

  return (
    <div id="commission-inbox" className="scroll-mt-8">
      <Panel title="의뢰 접수함" kicker="Commission Atelier">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#ffb15e]/30 bg-[#2a2118] px-3 py-1.5 font-mono text-xs font-black text-[#ff9d38]">
            내 처리 대기 {pending}건 · 전체 {items.length}건
          </span>
          <button
            className="sub-button"
            onClick={() => void load()}
            type="button"
          >
            새로고침
          </button>
          {status ? (
            <span className="text-xs text-[#8b94a0]">{status}</span>
          ) : null}
        </div>

        {items.length === 0 ? (
          <p className="rounded-lg border border-[#38414d] bg-[#232b34] p-4 text-sm leading-6 text-[#6b7580]">
            아직 접수된 의뢰가 없습니다. 마을의 &ldquo;제작 의뢰&rdquo; 버튼으로
            방문자가 접수하면 여기에 쌓입니다.
          </p>
        ) : (
          <div className="grid gap-2">
            {items.map(item => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-[#232b34] bg-[#232b34] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => void toggle(item)}
                      type="button"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-black text-[#ff9d38]">
                          {item.public_id}
                        </span>
                        <CommissionStatusBadge status={item.status} />
                        <span className="font-mono text-[11px] text-[#6b7580]">
                          {prettyDate(item.created_at.slice(0, 10))}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-bold text-[#e8edf2]">
                        {item.site_type ? `[${item.site_type}] ` : ""}
                        {item.summary || "(내용 없음)"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#6b7580]">
                        {formatWon(item.estimate_min)} ~{" "}
                        {formatWon(item.estimate_max)} · {item.weeks_min}~
                        {item.weeks_max}주 · {item.contact_email}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        className="rounded-md border border-[#38414d] px-2 py-1 text-xs text-[#8b94a0] transition hover:border-[#ffb15e]/50 hover:text-[#ff9d38]"
                        onClick={() => void toggle(item)}
                        type="button"
                      >
                        {isOpen ? "접기" : "상세"}
                      </button>
                      <button
                        className="rounded-md border border-[#38414d] px-2 py-1 text-xs text-[#8b94a0] transition hover:border-[#c2492e]/50 hover:text-[#e07a5f]"
                        onClick={() => void remove(item)}
                        type="button"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {isOpen ? (
                    detail && detail.id === item.id ? (
                      <div className="mt-3 border-t border-[#38414d] pt-3">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="grid gap-3">
                            <DetailRow label="연락처">
                              {[
                                detail.contact_name,
                                detail.contact_email,
                                detail.contact_phone,
                                detail.org
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </DetailRow>
                            <DetailRow label="요청 내용">
                              {detail.summary || "-"}
                            </DetailRow>
                            <DetailRow label="요구사항">
                              <RequirementDump value={detail.requirements} />
                            </DetailRow>
                            <DetailRow label="일정 / 예산">
                              {`${detail.deadline_hint || "-"} / ${
                                detail.budget_hint || "-"
                              }`}
                            </DetailRow>
                            <DetailRow label="견적 근거">
                              {detail.estimate_reason || "-"}
                            </DetailRow>

                            <DepthPanel detail={detail} />

                            <div className="grid gap-2 rounded-lg border border-[#38414d] bg-[#1a2027] p-3">
                              <LabeledField label="진행 상태">
                                <select
                                  className="field"
                                  value={detail.status}
                                  disabled={busy}
                                  onChange={e =>
                                    void changeStatus(
                                      item,
                                      e.target.value as CommissionStatus,
                                      note
                                    )
                                  }
                                >
                                  {COMMISSION_STATUS_OPTIONS.map(option => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </LabeledField>
                              <LabeledField label="관리자 메모">
                                <textarea
                                  className="field min-h-[80px]"
                                  value={note}
                                  onChange={e => setNote(e.target.value)}
                                  placeholder="연락 예정일, 판단, 거절 사유 등"
                                />
                              </LabeledField>
                              <button
                                className="rounded-lg bg-[#ffb15e] px-4 py-2.5 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#0d1116] transition hover:bg-[#e2c078] disabled:opacity-45"
                                disabled={busy}
                                onClick={() =>
                                  void changeStatus(item, detail.status, note)
                                }
                                type="button"
                              >
                                메모 저장
                              </button>
                            </div>
                          </div>

                          <div>
                            <div>
                              <p className="mb-2 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#ff9d38]/70">
                                상담 대화 기록
                              </p>
                              {detail.messages.length === 0 ? (
                                <p className="text-sm text-[#6b7580]">
                                  상담 없이 바로 접수된 건입니다.
                                </p>
                              ) : (
                                <div className="grid max-h-[420px] gap-1.5 overflow-y-auto rounded-lg border border-[#38414d] bg-[#1a2027] p-3">
                                  {detail.messages.map(message => (
                                    <p
                                      key={message.id}
                                      className={
                                        message.role === "visitor"
                                          ? "rounded-md bg-[#2a2118] px-2.5 py-1.5 text-xs leading-5 text-[#c9a55f]"
                                          : "rounded-md bg-[#232b34] px-2.5 py-1.5 text-xs leading-5 text-[#9aa4b0]"
                                      }
                                    >
                                      <span className="mr-1.5 font-mono text-[10px] font-black opacity-60">
                                        {message.role === "visitor"
                                          ? "방문자"
                                          : "도안"}
                                      </span>
                                      {message.content}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3단계 — 게이트와 직군별 작업.
                          2단 그리드 밖에 두어 **전체 폭**을 쓴다: HTML 시안을
                          좁은 칸에서 보면 태블릿 브레이크포인트만 보여 검수가 안 된다. */}
                        <div className="mt-4 border-t border-[#38414d] pt-4">
                          <p className="mb-2 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#ff9d38]/70">
                            작업 지시 · 검수
                          </p>
                          <CommissionWorkboard
                            commissionId={detail.id}
                            publicId={detail.public_id}
                            onStatusChange={() => void load()}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 border-t border-[#38414d] pt-3 text-sm text-[#6b7580]">
                        불러오는 중…
                      </p>
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

export const COMMISSION_STATUS_OPTIONS: {
  value: CommissionStatus;
  label: string;
}[] = [
  {value: "received", label: "접수됨"},
  {value: "reviewing", label: "검토중"},
  {value: "briefing", label: "기획 작업중"},
  {value: "brief_review", label: "브리프 검수 대기"},
  {value: "briefed", label: "브리프 확정"},
  {value: "in_progress", label: "제작중"},
  {value: "artifact_review", label: "산출물 검수 대기"},
  {value: "delivered", label: "전달 완료"},
  {value: "rejected", label: "반려"}
];

export const COMMISSION_STATUS_STYLE: Record<CommissionStatus, string> = {
  received: "border-[#ffb15e]/40 bg-[#2a2118] text-[#ff9d38]",
  reviewing: "border-[#ff9d38]/30 bg-[#2a2118] text-[#e2c078]",
  briefing: "border-[#9b8ac4]/40 bg-[#1a2027] text-[#8877b8]",
  // 검수 대기는 "내가 움직여야 하는 상태"라 눈에 띄게 — 여기서 멈춰 있다는 신호다
  brief_review: "border-[#ffb15e]/50 bg-[#2a2118] text-[#c9a55f]",
  briefed: "border-[#9b8ac4]/40 bg-[#1a2027] text-[#8877b8]",
  in_progress: "border-[#9b8ac4]/40 bg-[#1a2027] text-[#8877b8]",
  artifact_review: "border-[#ffb15e]/50 bg-[#2a2118] text-[#c9a55f]",
  delivered: "border-[#6fae8a]/35 bg-[#22301f] text-[#4d8a6a]",
  rejected: "border-[#38414d] bg-[#232b34] text-[#6b7580]"
};

export function CommissionStatusBadge({status}: {status: CommissionStatus}) {
  const label =
    COMMISSION_STATUS_OPTIONS.find(option => option.value === status)?.label ??
    status;
  return (
    <span
      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-black ${
        COMMISSION_STATUS_STYLE[status] ?? COMMISSION_STATUS_STYLE.rejected
      }`}
    >
      {label}
    </span>
  );
}

/**
 * 심화 문답 패널 — 손님에게 보낼 링크와, 그렇게 받아낸 제작 정보.
 *
 * 접수 원문과 **일부러 갈라 둔다.** 접수 때 들은 것과 나중에 받아낸 것은
 * 확실성이 다르고(후자가 더 확정적이다), 섞어 두면 어느 쪽을 믿고 만들지가
 * 흐려진다. 여기 값이 차 있을수록 실제로 만들 때 되물을 일이 줄어든다.
 */
export function DepthPanel({detail}: {detail: CommissionDetail}) {
  const [copied, setCopied] = useState(false);
  const answers = Object.entries(detail.depth_answers ?? {});

  // 2층 릴레이가 추가로 받은 것 — 종류별 분기 답과 AI 맞춤 문답(답 있는 것만).
  const requirements = (detail.requirements ?? {}) as {
    branch?: Record<string, string>;
    ai_questions?: {id: string; question: string; answer: string}[];
  };
  const branch = Object.entries(requirements.branch ?? {});
  const aiAnswered = (requirements.ai_questions ?? []).filter(item =>
    (item.answer ?? "").trim()
  );

  const link =
    typeof window !== "undefined" && detail.track_path
      ? `${window.location.origin}${detail.track_path}`
      : detail.track_path;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-2 rounded-lg border border-[#38414d] bg-[#1a2027] p-3">
      <p className="font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#ff9d38]/70">
        제작 정보 (심화 문답)
      </p>

      {answers.length ? (
        <dl className="grid gap-1.5">
          {answers.map(([label, value]) => (
            <div key={label} className="flex gap-2 text-xs leading-5">
              <dt className="w-20 shrink-0 font-bold text-[#ff9d38]">
                {label}
              </dt>
              <dd className="flex-1 text-[#9aa4b0]">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-xs leading-5 text-[#6b7580]">
          아직 받은 게 없습니다. 아래 링크를 회신 메일에 붙여 보내면 공방
          식구들이 대신 여쭤봅니다 — 운영·수정 주체, 콘텐츠 준비, 성공 기준,
          기존 자산, 그리고 사이트 종류별 세부 문항까지.
        </p>
      )}

      {branch.length ? (
        <>
          <p className="mt-1 font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#ff9d38]/50">
            종류별 문답
          </p>
          <dl className="grid gap-1.5">
            {branch.map(([key, value]) => (
              <div key={key} className="flex gap-2 text-xs leading-5">
                <dt className="w-20 shrink-0 font-bold text-[#ff9d38]/80">
                  {key}
                </dt>
                <dd className="flex-1 text-[#9aa4b0]">{value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      {aiAnswered.length ? (
        <>
          <p className="mt-1 font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#c69af0]/70">
            AI 가 더 물은 것
          </p>
          <dl className="grid gap-1.5">
            {aiAnswered.map(item => (
              <div key={item.id} className="text-xs leading-5">
                <dt className="text-[#c69af0]/80">{item.question}</dt>
                <dd className="text-[#9aa4b0]">→ {item.answer}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      {detail.track_path ? (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md bg-[#232b34] px-2 py-1.5 font-mono text-[11px] text-[#9aa4b0]">
            {link}
          </code>
          <button
            className="sub-button"
            onClick={() => void copy()}
            type="button"
          >
            {copied ? "복사됨" : "링크 복사"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function DetailRow({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#6b7580]">
        {label}
      </p>
      <div className="mt-1 text-sm leading-6 text-[#e8edf2]">{children}</div>
    </div>
  );
}

export function RequirementDump({value}: {value: Record<string, unknown>}) {
  const entries = Object.entries(value).filter(([, item]) =>
    Array.isArray(item) ? item.length > 0 : !!item
  );
  if (entries.length === 0) return <>-</>;

  const LABELS: Record<string, string> = {
    pages: "페이지",
    features: "기능",
    tone: "분위기",
    references: "참고"
  };

  return (
    <ul className="grid gap-0.5">
      {entries.map(([key, item]) => (
        <li key={key}>
          <span className="text-[#6b7580]">{LABELS[key] ?? key}</span>{" "}
          {Array.isArray(item) ? item.join(", ") : String(item)}
        </li>
      ))}
    </ul>
  );
}

export function formatWon(value: number): string {
  if (!value) return "-";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  return `${Math.round(value / 10_000).toLocaleString()}만`;
}
