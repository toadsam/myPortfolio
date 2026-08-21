"use client";

import {useRef, useState} from "react";
import type * as React from "react";

/**
 * 배전반 아래 서랍 — 매일 만지지는 않지만 늘 거기 있어야 하는 것들.
 *
 * ## 안 보이는 탭도 마운트를 유지한다
 *
 * 탭을 바꿀 때마다 언마운트하면 그 안의 목록이 매번 다시 요청된다. 의뢰함·코딩테스트·
 * CS 노트는 각자 열릴 때 한 번 받아 오는데, 탭을 오갈 때마다 세 번 더 부르는 건
 * 낭비다. `hidden` 으로 감추기만 하면 상태와 스크롤 위치까지 그대로 남는다.
 *
 * ## 기본은 닫힘
 *
 * 열어 두면 화면의 3분의 1을 먹는다. 이건 **매일 만지는 것이 아니라** 가끔 여는
 * 칸이고, 그 자리는 회로가 써야 한다. 그래서 평소엔 손잡이(탭 줄)만 남기고
 * 닫아 둔다 — 열려 있는 탭을 다시 누르면 닫힌다.
 *
 * ## 키보드
 *
 * 탭 목록은 좌우 화살표로 옮겨 다닌다(WAI-ARIA 탭 패턴). 마우스만 되는 서랍은
 * 도구가 아니다.
 */
export function SwitchDrawer({
  panels
}: {
  panels: {id: string; label: string; node: React.ReactNode}[];
}) {
  const [active, setActive] = useState(panels[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  function onKeyDown(event: React.KeyboardEvent) {
    const index = panels.findIndex(p => p.id === active);
    if (index < 0) return;
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % panels.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + panels.length) % panels.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = panels.length - 1;
    else return;
    event.preventDefault();
    setActive(panels[next].id);
    const buttons = tabsRef.current?.querySelectorAll("button");
    buttons?.[next]?.focus();
  }

  return (
    <div>
      <div
        className="flex flex-wrap items-stretch"
        onKeyDown={onKeyDown}
        ref={tabsRef}
        role="tablist"
      >
        {panels.map(panel => {
          const selected = open && panel.id === active;
          return (
            <button
              aria-controls={`drawer-${panel.id}`}
              aria-selected={selected}
              className="sw-tab"
              id={`tab-${panel.id}`}
              key={panel.id}
              onClick={() => {
                // 열려 있는 탭을 다시 누르면 닫는다 — 서랍은 닫히기도 해야 한다
                if (open && panel.id === active) setOpen(false);
                else {
                  setActive(panel.id);
                  setOpen(true);
                }
              }}
              role="tab"
              tabIndex={panel.id === active ? 0 : -1}
              type="button"
            >
              {panel.label}
            </button>
          );
        })}
        <span className="sw-drawer-hint">
          {open ? "탭을 다시 누르면 닫힙니다" : "눌러서 열기"}
        </span>
      </div>
      {panels.map(panel => (
        <div
          aria-labelledby={`tab-${panel.id}`}
          hidden={!open || panel.id !== active}
          id={`drawer-${panel.id}`}
          key={panel.id}
          role="tabpanel"
        >
          {panel.node}
        </div>
      ))}
    </div>
  );
}
