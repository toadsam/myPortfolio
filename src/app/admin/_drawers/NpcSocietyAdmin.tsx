"use client";

import {useCallback, useEffect, useState} from "react";
import {
  adminResetSociety,
  adminSetAffinity,
  fetchRelationships
} from "@/lib/liveApi";
import {autonomousNpcs} from "@/data/npcRoster";
import {atelierNpcs} from "@/data/atelierRoster";
import type {NpcRelationshipRow} from "@/types/live";
import {Panel} from "../_components/AdminParts";

/** NPC 사회 관리 — 관계 조정과 사회 리셋. 라이브 데모 전에 마을을 깨끗이 하거나
 *  특정 서사(앙숙/절친)를 손으로 연출할 때 쓴다. 활동·코테·의뢰 데이터는 건드리지 않는다. */
export function NpcSocietyAdmin() {
  const [rels, setRels] = useState<NpcRelationshipRow[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRels(await fetchRelationships());
      setStatus("");
    } catch {
      setStatus("관계를 불러오지 못했습니다. 백엔드를 확인하세요.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function nudge(r: NpcRelationshipRow, delta: number) {
    setBusy(true);
    try {
      const updated = await adminSetAffinity(
        r.npc_a,
        r.npc_b,
        Math.max(-100, Math.min(100, r.affinity + delta))
      );
      setRels(current =>
        current.map(row =>
          row.npc_a === updated.npc_a && row.npc_b === updated.npc_b
            ? updated
            : row
        )
      );
    } catch {
      setStatus("조정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function resetSociety() {
    if (
      !window.confirm(
        "NPC 사회(관계·기억·소식·연표·부탁·단골)를 전부 지우고 씨앗부터 다시 시작합니다.\n활동/코테/CS/의뢰 기록은 남습니다. 계속할까요?"
      )
    )
      return;
    setBusy(true);
    try {
      const out = await adminResetSociety();
      setStatus(`리셋 완료 — ${out.removed}행 정리, 씨앗 소식 ${out.seeded}개`);
      await load();
    } catch {
      setStatus("리셋에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const nameOf = (id: string) => societyNpcName(id);

  return (
    <div className="grid gap-3">
      {status ? (
        <p className="text-xs font-bold text-[#e2c078]">{status}</p>
      ) : null}
      <div className="grid max-h-[300px] gap-1.5 overflow-y-auto pr-1">
        {rels.map(r => (
          <div
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs"
            key={`${r.npc_a}:${r.npc_b}`}
          >
            <span className="min-w-0 flex-1 truncate">
              {nameOf(r.npc_a)} ↔ {nameOf(r.npc_b)}
              <span className="ml-2 text-[#8b94a0]">
                {r.vibe} ({r.affinity >= 0 ? "+" : ""}
                {r.affinity})
                {r.fights + r.reconciliations > 0
                  ? ` · 싸움 ${r.fights} 화해 ${r.reconciliations}`
                  : ""}
              </span>
            </span>
            <button
              className="rounded border border-white/15 px-2 py-0.5 font-black text-[#ff8a8a] disabled:opacity-40"
              disabled={busy}
              onClick={() => void nudge(r, -10)}
              type="button"
            >
              −10
            </button>
            <button
              className="rounded border border-white/15 px-2 py-0.5 font-black text-[#7ee787] disabled:opacity-40"
              disabled={busy}
              onClick={() => void nudge(r, 10)}
              type="button"
            >
              +10
            </button>
          </div>
        ))}
        {rels.length === 0 ? (
          <p className="text-xs text-[#5b646e]">아직 관계가 없습니다.</p>
        ) : null}
      </div>
      <button
        className="w-fit rounded-lg border border-[#ff8a8a]/40 bg-[#ff8a8a]/10 px-3 py-1.5 text-xs font-black text-[#ff8a8a] disabled:opacity-40"
        disabled={busy}
        onClick={() => void resetSociety()}
        type="button"
      >
        ⚠ 사회 리셋 (씨앗부터 다시)
      </button>
    </div>
  );
}

/** npc_id → 이름. 마을 로스터 + 공방 로스터에서 찾는다. */
export function societyNpcName(id: string): string {
  return (
    autonomousNpcs.find(n => n.id === id)?.name ??
    atelierNpcs.find(n => n.id === id)?.name ??
    id
  );
}
