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
  Shot,
  Switch2,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 03 — 조작감은 시점의 결과다 · A/B 로 직접 비교
//
// 개발 실체: PDF 30쪽 「Core Dev #1 — Player Mode Switching」
//            카메라 · 컨트롤러 · 물리 제약을 **함께** 전환. 단순 연출이 아니라
//            게임 시스템으로서의 시점 전환.
// 연출 장치: **토글로 두 모드를 번갈아 본다** — 화면만 바뀌는 게 아니라
//            무엇이 같이 바뀌는지가 표로 같이 뒤집힌다 (스펙 PAGE 03 그대로)

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, ab: 3};

// PDF 30쪽 코드에서 그대로 읽은 대응표.
const ROWS = [
  {
    k: "컨트롤러",
    fp: "firstPersonController.enabled = true",
    td: "topDownController.enabled = true",
    why: "둘 중 하나만 켜야 입력이 겹치지 않는다"
  },
  {
    k: "카메라 부모",
    fp: "SetParent(firstPersonCameraParent)",
    td: "topDownCameraFollow.enabled = true",
    why: "부모를 갈아 끼워야 시점이 튀지 않는다"
  },
  {
    k: "물리 제약",
    fp: "제약 없음",
    td: "LockYPositionAfterDelay(3f)",
    why: "전환 직후 흔들림을 코루틴으로 미뤄 잡는다"
  }
] as const;

export function P03ViewMode() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [mode, setMode] = useState<0 | 1>(0); // 0 = 1인칭, 1 = 탑다운

  const change = useCallback(
    (v: 0 | 1) => {
      setMode(v);
      announce(
        v === 0
          ? "1인칭 모드입니다. 캠퍼스를 걸어 다니는 시점입니다."
          : "탑다운 모드입니다. 건물 내부 전투 시점입니다."
      );
    },
    [announce]
  );

  const td = mode === 1;

  return (
    <Page index={3} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant}>
        03 · 시점 전환
      </Kicker>

      <div className="mt-4">
        <Heading
          text="시점을 바꾸면 게임이 바뀝니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          캠퍼스를 돌아다닐 때는 1인칭이 좋고, 건물에 들어가 싸울 때는 탑다운이
          낫습니다. 문제는 <strong>카메라만 돌리면 되는 게 아니라는 것</strong>
          입니다. 컨트롤러도, 물리 제약도 같이 갈아 끼워야 합니다. 아래 토글로
          바꿔 보세요 — 화면 아래 표가 같이 뒤집힙니다.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.ab], instant)}
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
              PlayerMode.{td ? "TopDown" : "FirstPerson"}
            </span>
            <Switch2
              label="플레이어 모드"
              options={["1인칭", "탑다운"]}
              value={mode}
              onChange={change}
            />
          </div>

          {/* 실제 게임 화면 A/B */}
          <div
            className="aj-crtglow relative overflow-hidden rounded"
            style={{
              border: "1px solid rgba(163,230,53,0.22)",
              aspectRatio: "440 / 221"
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                td
                  ? "/projects/ajou-adventure/view-td.webp"
                  : "/projects/ajou-adventure/view-fp.webp"
              }
              alt={td ? "탑다운 뷰 게임 화면" : "1인칭 뷰 게임 화면"}
              width={445}
              height={222}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="aj-scan absolute inset-0" aria-hidden="true" />
            <span
              className="absolute left-2 top-2 rounded px-2 py-1 font-mono text-[10px] font-bold"
              style={{
                background: "rgba(10,15,4,0.8)",
                color: "var(--aj-primary)"
              }}
            >
              {td ? "TOP-DOWN" : "FIRST PERSON"}
            </span>
          </div>

          {/* 같이 바뀌는 것들 */}
          <div className="flex flex-col gap-2">
            {ROWS.map(r => (
              <div
                key={r.k}
                className="rounded-md p-3"
                style={{
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.02)"
                }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="shrink-0 font-mono text-[11px] text-[var(--aj-muted)]">
                    {r.k}
                  </span>
                  <span
                    className="min-w-0 flex-1 break-all text-right font-mono text-[10px] transition-colors duration-300"
                    style={{color: "var(--aj-accent)"}}
                  >
                    {td ? r.td : r.fp}
                  </span>
                </div>
                <p className="mt-1 text-[10px] leading-4 text-[var(--aj-faint)]">
                  {r.why}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 실제 전환 코드 */}
        <CodePanel
          filename="PlayerModeManager.cs"
          badge={{text: "실제 코드", color: "var(--aj-ok)"}}
          borderColor="var(--aj-code-border)"
        >
          <div className="py-2">
            <CodeLine n={1}>
              <Cm>{"// Desc: 시점 전환 시 컨트롤러/카메라/물리 제약을 함께 스위칭"}</Cm>
            </CodeLine>
            <CodeLine n={2}>{"switch (mode)"}</CodeLine>
            <CodeLine n={3}>{"{"}</CodeLine>
            <CodeLine n={4} highlight={!td}>
              {"  case PlayerMode.FirstPerson:"}
            </CodeLine>
            <CodeLine n={5} highlight={!td}>
              {"    firstPersonController.enabled = true;"}
            </CodeLine>
            <CodeLine n={6} highlight={!td}>
              {"    topDownController.enabled = false;"}
            </CodeLine>
            <CodeLine n={7} highlight={!td}>
              {"    mainCamera.transform.SetParent("}
            </CodeLine>
            <CodeLine n={8} highlight={!td}>
              {"        firstPersonCameraParent, false);"}
            </CodeLine>
            <CodeLine n={9} highlight={!td}>
              {"    topDownCameraFollow.enabled = false;"}
            </CodeLine>
            <CodeLine n={10}>{"    break;"}</CodeLine>
            <CodeLine n={11}>{""}</CodeLine>
            <CodeLine n={12} highlight={td}>
              {"  case PlayerMode.TopDown:"}
            </CodeLine>
            <CodeLine n={13} highlight={td}>
              {"    firstPersonController.enabled = false;"}
            </CodeLine>
            <CodeLine n={14} highlight={td}>
              {"    topDownController.enabled = true;"}
            </CodeLine>
            <CodeLine n={15} highlight={td}>
              {"    StartCoroutine(LockYPositionAfterDelay(3f));"}
            </CodeLine>
            <CodeLine n={16} highlight={td}>
              {"    topDownCameraFollow.enabled = true;"}
            </CodeLine>
            <CodeLine n={17}>{"    break;"}</CodeLine>
            <CodeLine n={18}>{"}"}</CodeLine>
          </div>
        </CodePanel>
      </div>

      <div className="mt-4">
        <Hint>
          <strong>enum + switch</strong> 로 짠 이유는 하나입니다 — 나중에 모드를
          하나 더 추가할 때 case 한 줄만 늘리면 됩니다.
        </Hint>
      </div>

      <div className="mt-8">
        <Shot
          src="/projects/ajou-adventure/code-mode.webp"
          alt="PlayerModeManager.cs 전체 코드"
          caption="빨간 줄 세 개 — 컨트롤러 배타 처리, 카메라 부모 교체, 코루틴 지연"
          w={1600}
          h={826}
        />
      </div>
    </Page>
  );
}
