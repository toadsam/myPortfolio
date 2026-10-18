"use client";

/**
 * 작업 지시서 목록 — 고른 날과 그다음 날("내일로 넘긴 것")을 같이 들고 있는다.
 *
 * 화면은 **먼저 바뀌고**(낙관적 갱신) 서버가 실패하면 되돌린다. 밀어서 완료하는
 * 손맛이 네트워크 왕복을 기다리면 죽는다. 완료하면 걸어 둔 분량을 서버가 그날
 * DailyActivity 에 더하고, 같은 분량을 화면의 기록 폼에도 더해야 하므로 `toggle`
 * 은 성공했을 때 바뀐 항목을 돌려준다(부르는 쪽이 폼에 반영한다).
 */

import {useCallback, useEffect, useState} from "react";
import {
  ApiError,
  createPlanItem,
  deletePlanItem,
  fetchPlanItems,
  updatePlanItem
} from "@/lib/liveApi";
import type {PlanItem, PlanItemInput} from "@/types/live";
import {addDays} from "./activity";

function explain(err: unknown): string {
  if (err instanceof ApiError && err.status === 404)
    return "작업 지시서 서버가 아직 없어요. 백엔드를 최신으로 띄워 주세요.";
  if (err instanceof ApiError && err.status === 401)
    return "잠금이 풀린 상태가 아니에요. 다시 열어 주세요.";
  return "지시서를 저장하지 못했어요. 백엔드 상태를 확인하세요.";
}

export function usePlanItems(date: string, enabled: boolean) {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [later, setLater] = useState<PlanItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const next = addDays(date, 1);

  const reload = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([
        fetchPlanItems(date),
        fetchPlanItems(next)
      ]);
      setItems(a);
      setLater(b);
      setError(null);
    } catch (err) {
      setError(explain(err));
    } finally {
      setLoaded(true);
    }
  }, [date, next]);

  useEffect(() => {
    if (enabled) void reload();
  }, [enabled, reload]);

  async function create(input: Omit<PlanItemInput, "date">) {
    try {
      const made = await createPlanItem({...input, date});
      setItems(list => [made, ...list]);
      setError(null);
      return made;
    } catch (err) {
      setError(explain(err));
      return null;
    }
  }

  /** 완료 ↔ 미완료. 성공하면 바뀐 항목, 실패하면 null(화면은 되돌린다). */
  async function toggle(item: PlanItem): Promise<PlanItem | null> {
    const flipped = {...item, done: !item.done};
    setItems(list => list.map(i => (i.id === item.id ? flipped : i)));
    try {
      const saved = await updatePlanItem(item.id, {done: flipped.done});
      setItems(list => list.map(i => (i.id === item.id ? saved : i)));
      setError(null);
      return saved;
    } catch (err) {
      setItems(list => list.map(i => (i.id === item.id ? item : i)));
      setError(explain(err));
      return null;
    }
  }

  /** 분량만 바꾼다. 완료된 항목은 서버가 409 로 막는다(먼저 되돌려야 한다). */
  async function setMinutes(item: PlanItem, minutes: number) {
    const patched = {...item, minutes};
    setItems(list => list.map(i => (i.id === item.id ? patched : i)));
    try {
      const saved = await updatePlanItem(item.id, {minutes});
      setItems(list => list.map(i => (i.id === item.id ? saved : i)));
      setError(null);
    } catch (err) {
      setItems(list => list.map(i => (i.id === item.id ? item : i)));
      setError(
        err instanceof ApiError && err.status === 409
          ? "완료를 먼저 되돌려야 분량을 바꿀 수 있어요"
          : explain(err)
      );
    }
  }

  async function moveTo(item: PlanItem, toDate: string) {
    const fromToday = item.date === date;
    if (fromToday) {
      setItems(list => list.filter(i => i.id !== item.id));
      setLater(list => [...list, {...item, date: toDate}]);
    } else {
      setLater(list => list.filter(i => i.id !== item.id));
      setItems(list => [...list, {...item, date: toDate}]);
    }
    try {
      await updatePlanItem(item.id, {date: toDate});
      setError(null);
      return true;
    } catch (err) {
      setError(explain(err));
      void reload();
      return false;
    }
  }

  async function remove(item: PlanItem) {
    setItems(list => list.filter(i => i.id !== item.id));
    setLater(list => list.filter(i => i.id !== item.id));
    try {
      await deletePlanItem(item.id);
      setError(null);
    } catch (err) {
      setError(explain(err));
      void reload();
    }
  }

  return {
    items,
    later,
    error,
    loaded,
    create,
    toggle,
    setMinutes,
    defer: (item: PlanItem) => moveTo(item, next),
    restore: (item: PlanItem) => moveTo(item, date),
    remove
  };
}

export type PlanItemsApi = ReturnType<typeof usePlanItems>;
