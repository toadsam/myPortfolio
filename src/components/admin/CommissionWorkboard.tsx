"use client";

/**
 * 의뢰 공방 3단계 — 관리자 작업 지시/검수 패널.
 *
 * 이 화면의 성격은 "진행 버튼"이 아니라 **검수대**다. 에이전트는 스스로 다음
 * 단계로 못 넘어가고 늘 검수 대기에서 멈추므로, 여기서 사람이 승인해야만
 * 작업이 앞으로 간다(규칙의 출처는 backend/app/agents/gate.py 하나뿐이다).
 *
 * 그래서 UI도 게이트를 숨기지 않는다 — 지금 어디서 멈춰 있고 내가 무엇을
 * 결정해야 하는지가 제일 크게 보이게 배치했다.
 */

import {useCallback, useEffect, useState} from "react";

import {
  fetchCommissionArtifact,
  fetchCommissionBoard,
  postCommissionGate,
  rejectCommissionTask,
  runCommissionTask
} from "@/lib/liveApi";
import type {
  ArtifactContent,
  CommissionBoard,
  CommissionRole,
  CommissionTask,
  CommissionTaskStatus
} from "@/types/live";

/** backend/app/agents/gate.py 의 ROLE_NPCS / ROLE_LABELS / ROLE_DIRS 와 같은 표. */
const ROLE_META: Record<
  CommissionRole,
  {npc: string; label: string; dir: string; color: string}
> = {
  planner: {npc: "체리", label: "기획", dir: "01-기획", color: "#7ecf68"},
  designer: {npc: "먹지", label: "디자인", dir: "02-디자인", color: "#c69af0"},
  frontend: {
    npc: "리코",
    label: "프론트엔드",
    dir: "03-프론트",
    color: "#68c7cf"
  },
  backend: {npc: "굴뚝", label: "백엔드", dir: "04-백엔드", color: "#5f7be8"}
};

const TASK_STATUS_LABEL: Record<CommissionTaskStatus, string> = {
  ready: "실행 대기",
  running: "작업 중…",
  review: "검수 대기",
  approved: "승인됨",
  rejected: "반려됨",
  failed: "실패"
};

const TASK_STATUS_STYLE: Record<CommissionTaskStatus, string> = {
  ready: "border-[#0284c7]/30 bg-[#f0f9ff] text-[#0369a1]",
  running: "border-[#a78bfa]/40 bg-[#f5f3ff] text-[#6d28d9]",
  review: "border-[#f59e0b]/50 bg-[#fef3c7] text-[#92400e]",
  approved: "border-[#10b981]/35 bg-[#ecfdf5] text-[#047857]",
  rejected: "border-[#e3e8ef] bg-[#f1f4f9] text-[#94a3b8]",
  failed: "border-[#ef4444]/35 bg-[#fef2f2] text-[#b91c1c]"
};

/** 게이트별 안내 문구와 버튼 라벨. 무엇을 승인하는 것인지 매번 밝힌다. */
const GATE_COPY: Record<
  1 | 2 | 3,
  {title: string; body: string; approve: string; reject: string}
> = {
  1: {
    title: "게이트 1 — 접수 승인",
    body: "승인하면 기획 담당 체리가 요구사항 정리서를 만듭니다. 여기서 반려하면 의뢰가 종료됩니다.",
    approve: "승인 — 기획 시작",
    reject: "이 의뢰 반려"
  },
  2: {
    title: "게이트 2 — 브리프 검수",
    body: "체리의 정리서를 읽고 승인하면, 이 내용이 그대로 먹지·리코·굴뚝 세 명에게 넘어갑니다. 승인한 버전으로 고정되니 지금 꼼꼼히 보세요.",
    approve: "승인 — 팀 3명 투입",
    reject: "반려 — 기획 다시"
  },
  3: {
    title: "게이트 3 — 산출물 검수",
    body: "세 명의 산출물을 확인하고 전달 완료로 넘깁니다. 실제 전달(메일 등)은 직접 하셔야 합니다.",
    approve: "전달 완료로",
    reject: "반려 — 셋 다 다시"
  }
};

export default function CommissionWorkboard({
  commissionId,
  publicId,
  onStatusChange
}: {
  commissionId: number;
  publicId: string;
  /** 상태가 바뀌면 바깥 목록도 새로고침하게 알린다. */
  onStatusChange?: () => void;
}) {
  const [board, setBoard] = useState<CommissionBoard | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState<ArtifactContent | null>(null);

  const load = useCallback(async () => {
    try {
      setBoard(await fetchCommissionBoard(commissionId));
      setError("");
    } catch {
      setError("작업 정보를 불러오지 못했습니다.");
    }
  }, [commissionId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(label: string, run: () => Promise<CommissionBoard>) {
    setBusy(label);
    setError("");
    try {
      setBoard(await run());
      setFeedback("");
      onStatusChange?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "요청에 실패했습니다."
      );
    } finally {
      setBusy("");
    }
  }

  async function openArtifact(artifactId: number) {
    setBusy("artifact");
    try {
      setViewing(await fetchCommissionArtifact(commissionId, artifactId));
    } catch {
      setError("산출물을 열지 못했습니다.");
    } finally {
      setBusy("");
    }
  }

  if (!board) {
    return (
      <p className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] p-3 text-sm text-[#94a3b8]">
        {error || "작업 정보를 불러오는 중…"}
      </p>
    );
  }

  const gate = board.open_gate;
  const cliHint = `npm run atelier -- ${publicId}`;

  return (
    <div className="grid gap-3">
      {error ? (
        <p className="rounded-lg border border-[#ef4444]/30 bg-[#fef2f2] px-3 py-2 text-xs leading-5 text-[#b91c1c]">
          {error}
        </p>
      ) : null}

      {/* ── 게이트 ── 지금 내가 결정해야 하는 것 */}
      {gate !== null ? (
        <div className="rounded-lg border border-[#f59e0b]/40 bg-[#fffbeb] p-3">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#b45309]">
            {GATE_COPY[gate].title}
          </p>
          <p className="mt-1.5 text-sm leading-6 text-[#78350f]">
            {GATE_COPY[gate].body}
          </p>
          <textarea
            className="field mt-2 min-h-[64px]"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="반려한다면 무엇이 아쉬웠는지 적어주세요. 이 내용이 다음 실행 프롬프트에 그대로 들어갑니다."
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-[#f59e0b] px-4 py-2 font-mono text-xs font-black uppercase tracking-[0.12em] text-[#1f1300] transition hover:bg-[#fbbf24] disabled:opacity-45"
              disabled={!!busy}
              type="button"
              onClick={() =>
                void act("gate", () =>
                  postCommissionGate(commissionId, {
                    gate,
                    decision: "approve",
                    feedback
                  })
                )
              }
            >
              {GATE_COPY[gate].approve}
            </button>
            <button
              className="sub-button disabled:opacity-45"
              disabled={!!busy}
              type="button"
              onClick={() =>
                void act("gate", () =>
                  postCommissionGate(commissionId, {
                    gate,
                    decision: "reject",
                    feedback
                  })
                )
              }
            >
              {GATE_COPY[gate].reject}
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] px-3 py-2 text-xs leading-5 text-[#64748b]">
          {board.status === "delivered"
            ? "전달 완료된 의뢰입니다."
            : board.status === "rejected"
            ? "반려된 의뢰입니다."
            : "지금은 통과시킬 게이트가 없습니다. 아래 작업을 실행하면 검수 단계로 넘어갑니다."}
        </p>
      )}

      {/* ── 직군 4명 ── */}
      {board.tasks.length === 0 ? (
        <p className="rounded-lg border border-[#e3e8ef] bg-[#f1f4f9] px-3 py-2 text-xs leading-5 text-[#94a3b8]">
          아직 배정된 작업이 없습니다. 게이트 1을 승인하면 기획부터 시작합니다.
        </p>
      ) : (
        <div className="grid gap-2">
          {board.tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              busy={!!busy}
              workerEnabled={board.worker_enabled}
              cliHint={cliHint}
              onRun={() =>
                void act("run", () => runCommissionTask(commissionId, task.id))
              }
              onReject={() =>
                void act("reject", () =>
                  rejectCommissionTask(commissionId, task.id, feedback)
                )
              }
              onOpen={openArtifact}
            />
          ))}
        </div>
      )}

      {!board.worker_enabled && board.tasks.length > 0 ? (
        <p className="rounded-lg border border-[#e3e8ef] bg-white px-3 py-2 text-xs leading-5 text-[#64748b]">
          이 서버에서는 에이전트 실행이 꺼져 있습니다(
          <code className="font-mono text-[11px]">AGENT_WORKER_ENABLED</code>).
          터미널에서{" "}
          <code className="rounded bg-[#f1f4f9] px-1.5 py-0.5 font-mono text-[11px] text-[#b45309]">
            {cliHint}
          </code>{" "}
          로 실행하세요. 승인은 여기서 그대로 하시면 됩니다.
        </p>
      ) : null}

      {viewing ? (
        <ArtifactViewer artifact={viewing} onClose={() => setViewing(null)} />
      ) : null}
    </div>
  );
}

function TaskCard({
  task,
  busy,
  workerEnabled,
  cliHint,
  onRun,
  onReject,
  onOpen
}: {
  task: CommissionTask;
  busy: boolean;
  workerEnabled: boolean;
  cliHint: string;
  onRun: () => void;
  onReject: () => void;
  onOpen: (artifactId: number) => void;
}) {
  const meta = ROLE_META[task.role];
  const seconds = task.duration_ms ? Math.round(task.duration_ms / 1000) : 0;

  return (
    <div className="rounded-lg border border-[#e3e8ef] bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{backgroundColor: meta.color}}
        />
        <span className="text-sm font-bold text-[#1e293b]">{meta.npc}</span>
        <span className="font-mono text-[11px] text-[#94a3b8]">
          {meta.label}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-black ${
            TASK_STATUS_STYLE[task.status]
          }`}
        >
          {TASK_STATUS_LABEL[task.status]}
        </span>
        {task.round > 1 ? (
          <span className="font-mono text-[10px] font-black text-[#b45309]">
            {task.round}회차
          </span>
        ) : null}
        {seconds ? (
          <span className="font-mono text-[10px] text-[#94a3b8]">
            {seconds}초{task.cost_usd ? ` · $${task.cost_usd.toFixed(2)}` : ""}
          </span>
        ) : null}
      </div>

      {task.error ? (
        <p className="mt-2 rounded-md bg-[#fef2f2] px-2.5 py-1.5 text-xs leading-5 text-[#b91c1c]">
          {task.error}
        </p>
      ) : null}

      {task.feedback && task.status === "ready" && task.round > 1 ? (
        <p className="mt-2 rounded-md bg-[#fffbeb] px-2.5 py-1.5 text-xs leading-5 text-[#78350f]">
          <span className="mr-1.5 font-mono text-[10px] font-black opacity-60">
            다음 실행에 전달될 피드백
          </span>
          {task.feedback}
        </p>
      ) : null}

      {task.log ? (
        <p className="mt-2 whitespace-pre-wrap rounded-md bg-[#f8fafc] px-2.5 py-1.5 text-xs leading-5 text-[#475569]">
          {task.log}
        </p>
      ) : null}

      {task.artifacts.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {task.artifacts.map(artifact => (
            <button
              key={artifact.id}
              className="rounded-md border border-[#e3e8ef] bg-[#f8fafc] px-2 py-1 font-mono text-[11px] text-[#475569] transition hover:border-[#f59e0b]/50 hover:text-[#b45309]"
              type="button"
              onClick={() => onOpen(artifact.id)}
            >
              {artifact.kind === "html" ? "🖼 " : "📄 "}
              {artifact.rel_path}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {task.status === "ready" ? (
          workerEnabled ? (
            <button
              className="rounded-md border border-[#f59e0b]/45 bg-[#fffbeb] px-2.5 py-1 text-xs font-bold text-[#b45309] transition hover:bg-[#fef3c7] disabled:opacity-45"
              disabled={busy}
              type="button"
              onClick={onRun}
            >
              {meta.npc} 실행
            </button>
          ) : (
            <span className="font-mono text-[11px] text-[#94a3b8]">
              터미널에서 {cliHint} --role {task.role}
            </span>
          )
        ) : null}
        {task.status === "review" || task.status === "failed" ? (
          <button
            className="rounded-md border border-[#e3e8ef] px-2.5 py-1 text-xs text-[#64748b] transition hover:border-[#ff6b6b]/50 hover:text-[#b91c1c] disabled:opacity-45"
            disabled={busy}
            type="button"
            onClick={onReject}
          >
            이 직군만 다시
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ArtifactViewer({
  artifact,
  onClose
}: {
  artifact: ArtifactContent;
  onClose: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#e3e8ef] bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-black text-[#b45309]">
          {artifact.rel_path}
        </span>
        <button className="sub-button" type="button" onClick={onClose}>
          닫기
        </button>
      </div>

      {artifact.kind === "html" ? (
        <>
          {/*
            srcdoc + sandbox="" 로 넣는다.
            · sandbox="" 는 고유 불투명 오리진 + 스크립트 전면 차단이라,
              에이전트가 만든 HTML 이 관리자 페이지 안에서 코드를 돌릴 수 없다.
            · src 로 백엔드를 가리키지 않는 이유: iframe 은 X-Admin-Token 헤더를
              못 싣고, 토큰을 쿼리스트링에 넣는 건 하지 않는다.
          */}
          <iframe
            className="h-[70vh] w-full rounded-md border border-[#e3e8ef] bg-white"
            sandbox=""
            srcDoc={artifact.content}
            title={artifact.rel_path}
          />
          <p className="mt-1.5 font-mono text-[10px] text-[#94a3b8]">
            미리보기는 스크립트·외부 요청이 차단된 샌드박스입니다.
          </p>
        </>
      ) : (
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-md bg-[#f8fafc] p-3 text-xs leading-6 text-[#334155]">
          {artifact.content}
        </pre>
      )}
    </div>
  );
}
