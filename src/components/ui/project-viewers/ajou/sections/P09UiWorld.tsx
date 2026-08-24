"use client";

import {useCallback, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  Cm,
  CodeLine,
  CodePanel,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  Shot,
  Switch2,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 09 — UI 에서 고른 것이 진짜 게임을 바꾼다
//
// 개발 실체: PDF 33쪽 「Core Dev #4 — UI ↔ Game World 연동」 원문
//            상태 초기화 후 적용(선택 전 자식 오브젝트 비활성화로 충돌 방지),
//            선택 기반 활성화, Parent 기준 일괄 관리, Prefab 등록만으로 확장,
//            캐릭터/장비에 **동일한 설계 적용**
// 연출 장치: **관람객이 캐릭터와 장비를 직접 고른다.** 고르는 순간 아래 씬 계층
//            트리에서 무엇이 켜지고 무엇이 꺼지는지가 같이 보인다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const CHARACTERS = ["치토", "치타", "치돌"] as const;
const ITEMS = ["기본 무기", "장검", "해머"] as const;

export function P09UiWorld() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [tab, setTab] = useState<0 | 1>(0); // 0 = 캐릭터, 1 = 인벤토리
  const [character, setCharacter] = useState(0);
  const [item, setItem] = useState(0);
  const [reset, setReset] = useState(true);

  const list = tab === 0 ? CHARACTERS : ITEMS;
  const selected = tab === 0 ? character : item;
  const parent = tab === 0 ? "charactersParent" : "equipParent";

  const pick = useCallback(
    (i: number) => {
      if (tab === 0) setCharacter(i);
      else setItem(i);
      announce(`${list[i]}을(를) 선택했습니다.`);
    },
    [tab, list, announce]
  );

  return (
    <Page index={9} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        09 · UI ↔ 월드
      </Kicker>

      <div className="mt-4">
        <Heading
          text="UI 에서 고른 게 진짜로 바뀌어야 합니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          메뉴에서 장비를 골랐는데 게임 안에서 아무것도 안 바뀌면, 그건 그냥
          그림입니다. 선택이{" "}
          <strong style={{color: "var(--aj-accent)"}}>
            실제 게임 오브젝트 상태
          </strong>
          로 이어져야 플레이가 달라집니다. 캐릭터와 장비에 <strong>같은
          패턴</strong>을 썼습니다 — 아래에서 골라 보세요.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: "1px solid var(--aj-border)",
            background: "var(--aj-panel)"
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-muted)]">
              {tab === 0 ? "CharacterSelectManager" : "InventoryManager"}
            </span>
            <Switch2
              label="선택 대상"
              options={["캐릭터", "인벤토리"]}
              value={tab}
              onChange={setTab}
            />
          </div>

          {/* 선택 UI */}
          <div className="grid grid-cols-3 gap-2.5">
            {list.map((name, i) => {
              const sel = selected === i;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={sel}
                  className="cursor-pointer rounded-md p-3 text-center transition-[border-color,background-color] duration-200"
                  style={{
                    border: `1px solid ${
                      sel ? "var(--aj-primary)" : "rgba(255,255,255,0.12)"
                    }`,
                    background: sel
                      ? "rgba(163,230,53,0.12)"
                      : "rgba(255,255,255,0.02)"
                  }}
                >
                  <span
                    className="block h-8 w-full rounded-sm"
                    style={{
                      background: sel
                        ? "var(--aj-accent)"
                        : "rgba(255,255,255,0.08)"
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="mt-2 block font-mono text-[11px]"
                    style={{color: sel ? "var(--aj-primary)" : "var(--aj-muted)"}}
                  >
                    {name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 씬 계층 트리 — 실제로 뭐가 켜지는지 */}
          <div
            className="rounded p-3.5"
            style={{
              background: "var(--aj-code-bg)",
              border: "1px solid var(--aj-code-border)"
            }}
          >
            <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--aj-muted)]">
              HIERARCHY
            </div>
            <div className="mt-2 font-mono text-[11px] leading-6">
              <div style={{color: "var(--aj-accent)"}}>▾ {parent}</div>
              {list.map((name, i) => {
                const active = reset ? selected === i : selected >= i;
                return (
                  <div
                    key={name}
                    className="pl-4 transition-colors duration-200"
                    style={{color: active ? "var(--aj-ok)" : "var(--aj-faint)"}}
                  >
                    {active ? "● " : "○ "}
                    {name}
                    <span className="ml-2 text-[10px]">
                      SetActive({active ? "true" : "false"})
                    </span>
                  </div>
                );
              })}
            </div>
            {!reset ? (
              <p
                className="mt-2 font-mono text-[10px] leading-4"
                style={{color: "var(--aj-bad)"}}
              >
                ✕ 이전 선택을 끄지 않아 오브젝트가 겹쳐 있습니다 — 충돌이 납니다
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setReset(v => !v)}
            role="switch"
            aria-checked={reset}
            className="cursor-pointer rounded-md px-4 py-3 text-left font-mono text-[11px] transition-colors duration-200"
            style={{
              border: `1px solid ${
                reset ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.45)"
              }`,
              background: reset
                ? "rgba(74,222,128,0.08)"
                : "rgba(248,113,113,0.08)",
              color: reset ? "var(--aj-ok)" : "var(--aj-bad)"
            }}
          >
            {reset
              ? "● 상태 초기화 후 적용 — 전부 끄고 고른 것만 켠다"
              : "○ 초기화 없이 적용 — 눌러서 다시 켜기"}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <CodePanel
            filename={
              tab === 0
                ? "CharacterSelectManager.cs"
                : "InventoryManager.cs"
            }
            badge={{text: "실제 코드", color: "var(--aj-ok)"}}
            borderColor="var(--aj-code-border)"
          >
            {tab === 0 ? (
              <div className="py-2">
                <CodeLine n={1}>
                  <Cm>
                    {"// desc: UI에서 선택한 캐릭터만 활성화하고 나머지는 비활성화"}
                  </Cm>
                </CodeLine>
                <CodeLine n={2}>{"public void ApplySelectedCharacter()"}</CodeLine>
                <CodeLine n={3}>{"{"}</CodeLine>
                <CodeLine n={4} highlight={reset}>
                  {"  foreach (Transform child in charactersParent.transform)"}
                </CodeLine>
                <CodeLine n={5}>{"  {"}</CodeLine>
                <CodeLine n={6} highlight={reset}>
                  {"    bool isActive = child.name"}
                </CodeLine>
                <CodeLine n={7} highlight={reset}>
                  {"        == activeCharacter.characterName;"}
                </CodeLine>
                <CodeLine n={8} highlight={reset}>
                  {"    child.gameObject.SetActive(isActive);"}
                </CodeLine>
                <CodeLine n={9}>{"  }"}</CodeLine>
                <CodeLine n={10}>{"}"}</CodeLine>
              </div>
            ) : (
              <div className="py-2">
                <CodeLine n={1}>
                  <Cm>
                    {"// desc: 아이템 장착 시 기존 장비를 해제하고 선택한 장비만 활성화"}
                  </Cm>
                </CodeLine>
                <CodeLine n={2}>
                  {"public void EquipItem(GameObject selectedItem)"}
                </CodeLine>
                <CodeLine n={3}>{"{"}</CodeLine>
                <CodeLine n={4} highlight={reset} bad={!reset}>
                  {"  foreach (Transform child in equipParent)"}
                </CodeLine>
                <CodeLine n={5}>{"  {"}</CodeLine>
                <CodeLine n={6} highlight={reset} bad={!reset}>
                  {"    child.gameObject.SetActive(false);"}
                </CodeLine>
                <CodeLine n={7}>{"  }"}</CodeLine>
                <CodeLine n={8}>{""}</CodeLine>
                <CodeLine n={9} highlight>
                  {"  selectedItem.SetActive(true);"}
                </CodeLine>
                <CodeLine n={10} highlight>
                  {"  equippedItem = selectedItem;"}
                </CodeLine>
                <CodeLine n={11}>{"}"}</CodeLine>
              </div>
            )}
          </CodePanel>

          <Panel label="같은 패턴을 두 곳에">
            <p className="text-[13px] leading-6 text-[var(--aj-muted)]">
              캐릭터와 장비가 <strong>같은 모양의 코드</strong>를 씁니다. 부모
              밑을 전부 끄고 고른 것만 켜는 것. 그래서 새 캐릭터나 새 무기를
              추가할 때 <strong>Prefab 을 부모 밑에 넣기만</strong> 하면 됩니다.
            </p>
          </Panel>
        </div>
      </div>

      <div className="mt-4">
        <Hint>
          &ldquo;초기화 없이 적용&rdquo;으로 바꿔 보시면 왜 먼저 전부 꺼야 하는지
          보입니다 — 켜진 게 겹치면 무기가 두 개 달립니다.
        </Hint>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Shot
          src="/projects/ajou-adventure/character-select.webp"
          alt="캐릭터 선택 화면"
          caption="실제 캐릭터 선택 화면"
          w={917}
          h={422}
        />
        <Shot
          src="/projects/ajou-adventure/code-inventory.webp"
          alt="InventoryManager.cs 단일 장착 상태 관리 로직"
          caption="장착은 「전부 끄고 하나만 켜기」 — 캐릭터 선택과 같은 모양이다"
          w={1600}
          h={922}
        />
      </div>
    </Page>
  );
}
