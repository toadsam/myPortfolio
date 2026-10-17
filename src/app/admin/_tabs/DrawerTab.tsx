"use client";

/**
 * 서랍장 탭 — 매일 만지지는 않는 도구 넷(의뢰 접수함 · 코딩테스트 · CS 노트 · NPC 사회).
 *
 * ## 한 번 연 서랍은 닫아도 마운트를 유지한다
 *
 * 예전 `SwitchDrawer` 와 같은 규칙이다. 닫을 때마다 언마운트하면 다시 열 때 목록을
 * 또 받아 온다. 그래서 **처음 열 때 마운트하고**, 그 뒤로는 `hidden` 으로만 감춘다.
 * 처음부터 넷 다 마운트하지 않는 건, 이 탭을 안 여는 날이 대부분이라서다.
 */

import {useState} from "react";
import type * as React from "react";
import {CodingTestAdmin} from "../_drawers/CodingTestAdmin";
import {CommissionAdmin} from "../_drawers/CommissionAdmin";
import {CsNoteAdmin} from "../_drawers/CsNoteAdmin";
import {NpcSocietyAdmin} from "../_drawers/NpcSocietyAdmin";
import {buzz, sfx} from "../_lib/sfx";

export type DrawerId = "commission" | "coding" | "cs" | "society";

export function DrawerTab({
  open,
  onOpen,
  selectedDate,
  commissionWaiting
}: {
  open: DrawerId | null;
  onOpen: (id: DrawerId | null) => void;
  selectedDate: string;
  commissionWaiting: number;
}) {
  // 한 번이라도 연 서랍. open 이 바뀌는 렌더에서 바로 더해 둔다.
  const [mounted, setMounted] = useState<Set<DrawerId>>(() => new Set());
  if (open && !mounted.has(open)) setMounted(new Set(mounted).add(open));

  const drawers: {
    id: DrawerId;
    plate: string;
    label: string;
    badge?: number;
    node: React.ReactNode;
  }[] = [
    {
      id: "commission",
      plate: "ATELIER",
      label: "의뢰 접수함",
      badge: commissionWaiting,
      node: <CommissionAdmin />
    },
    {
      id: "coding",
      plate: "DOJO",
      label: "코딩테스트 도장",
      node: <CodingTestAdmin defaultDate={selectedDate} />
    },
    {
      id: "cs",
      plate: "ARCHIVE",
      label: "CS 노트 서고",
      node: <CsNoteAdmin defaultDate={selectedDate} />
    },
    {
      id: "society",
      plate: "SOCIETY",
      label: "NPC 사회",
      node: <NpcSocietyAdmin />
    }
  ];

  return (
    <section className="ab-tab ab-drawer-tab">
      <div className="ab-sec-h">
        <h2>서랍장</h2>
        <small>매일 쓰지 않는 도구</small>
      </div>
      <div className="ab-cabinet">
        {drawers.map(d => {
          const isOpen = open === d.id;
          return (
            <div className={`ab-drawer${isOpen ? " is-open" : ""}`} key={d.id}>
              <button
                aria-controls={`drawer-${d.id}`}
                aria-expanded={isOpen}
                className="ab-drawer-face"
                onClick={() => {
                  sfx.clack();
                  buzz(10);
                  onOpen(isOpen ? null : d.id);
                }}
                type="button"
              >
                <span className="ab-plate">{d.plate}</span>
                <span className="ab-drawer-label">{d.label}</span>
                {d.badge ? <span className="ab-badge">{d.badge}</span> : null}
                <span className="ab-handle" aria-hidden="true" />
              </button>
              {mounted.has(d.id) ? (
                <div
                  className="ab-drawer-body"
                  hidden={!isOpen}
                  id={`drawer-${d.id}`}
                >
                  {d.node}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
