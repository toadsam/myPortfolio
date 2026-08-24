"use client";

import {useCallback, useRef, useState} from "react";
import {useAjou} from "../context";
import {
  Body,
  Card,
  Cm,
  CodeLine,
  CodePanel,
  Heading,
  Hint,
  Kicker,
  Page,
  Toggle,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../../_kit/useTimeline";

// PAGE 04 — 트러블슈팅 01 · 전환 순간에만 게임이 망가진다
//
// 개발 실체: PDF 30쪽 「개발 포인트」 원문 — 컨트롤러 분리(오작동/동시 입력 방지),
//            카메라 Parent 구조(시점이 튀지 않게 고정), 코루틴 지연 처리(전환 직후
//            흔들림/버그 방지)
// 연출 장치: **관람객이 안전장치 세 개를 하나씩 꺼 본다.** 끄는 순간 무엇이
//            망가지는지가 미니 화면에 바로 나온다 (스펙 PAGE 04 의 「토글로 어긋남을
//            눈에 보이게」)
//
// 스펙의 「스프라이트 크기와 충돌 박스 불일치」는 이 프로젝트가 아니라 쓰지 않는다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

export function P04ModeTrouble() {
  const {reducedMotion, announce} = useAjou();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [exclusive, setExclusive] = useState(true);
  const [reparent, setReparent] = useState(true);
  const [delay, setDelay] = useState(true);
  const [switched, setSwitched] = useState(0);

  const doSwitch = useCallback(() => {
    setSwitched(n => n + 1);
    const broken = [
      !exclusive && "입력이 두 컨트롤러에 동시에 들어갔습니다",
      !reparent && "카메라가 옛 부모에 남아 시점이 튀었습니다",
      !delay && "전환 직후 Y 위치가 흔들렸습니다"
    ].filter(Boolean);
    announce(
      broken.length === 0
        ? "전환이 깨끗하게 끝났습니다."
        : broken.join(". ") + "."
    );
  }, [exclusive, reparent, delay, announce]);

  const ok = exclusive && reparent && delay;
  const dirty = switched > 0;

  return (
    <Page index={4} innerRef={ref} maxWidth="1120px">
      <Kicker on={on[IDX.label]} instant={instant} color="var(--aj-bad)">
        04 · 트러블슈팅 01
      </Kicker>

      <div className="mt-4">
        <Heading
          text="바꾸는 순간에만 게임이 망가졌습니다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6 max-w-[740px]" style={rise(on[IDX.body], instant)}>
        <Body>
          1인칭도 잘 되고 탑다운도 잘 되는데,{" "}
          <strong style={{color: "var(--aj-bad)"}}>
            바꾸는 그 한순간에만
          </strong>{" "}
          이상해졌습니다. 원인은 세 가지였고 각각 다른 안전장치가 필요했습니다.
          아래 스위치를 꺼 보시면 뭐가 어떻게 깨지는지 보입니다.
        </Body>
      </div>

      <div
        className="mt-9 grid grid-cols-1 gap-[18px] lg:grid-cols-[54%_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div
          className="flex flex-col gap-4 rounded-md p-5"
          style={{
            border: `1px solid ${
              ok ? "rgba(74,222,128,0.32)" : "rgba(248,113,113,0.32)"
            }`,
            background: "var(--aj-panel)"
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--aj-muted)]">
              SWITCH TEST
            </span>
            <span
              className="rounded px-2 py-0.5 font-mono text-[10px] font-black"
              style={{
                background: ok
                  ? "rgba(74,222,128,0.16)"
                  : "rgba(248,113,113,0.16)",
                color: ok ? "var(--aj-ok)" : "var(--aj-bad)"
              }}
            >
              {ok ? "안전장치 3/3" : `안전장치 ${[exclusive, reparent, delay].filter(Boolean).length}/3`}
            </span>
          </div>

          {/* 미니 화면 — 무엇이 깨지는지 */}
          <div
            className="aj-crtglow relative overflow-hidden rounded"
            style={{
              border: "1px solid rgba(163,230,53,0.22)",
              background: "#0e1406",
              aspectRatio: "16 / 9"
            }}
          >
            <div className="aj-grid absolute inset-0" aria-hidden="true" />
            <div className="aj-scan absolute inset-0" aria-hidden="true" />

            {/* 플레이어 — 안전장치가 꺼지면 어긋난다 */}
            <div
              className="absolute left-1/2 top-1/2 h-8 w-8 rounded-sm transition-transform duration-300"
              style={{
                background: "var(--aj-accent)",
                transform: `translate(-50%, -50%) translate(${
                  dirty && !exclusive ? "26px" : "0px"
                }, ${dirty && !delay ? "-18px" : "0px"}) rotate(${
                  dirty && !reparent ? "14deg" : "0deg"
                })`
              }}
              aria-hidden="true"
            />
            {/* 카메라 사각 — reparent 를 끄면 옛 자리에 남는다 */}
            <div
              className="absolute left-1/2 top-1/2 rounded transition-[transform,border-color] duration-300"
              style={{
                width: "56%",
                height: "56%",
                border: `1px dashed ${
                  dirty && !reparent ? "var(--aj-bad)" : "rgba(163,230,53,0.4)"
                }`,
                transform: `translate(-50%, -50%) translate(${
                  dirty && !reparent ? "-40px" : "0px"
                }, ${dirty && !reparent ? "22px" : "0px"})`
              }}
              aria-hidden="true"
            />

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-2.5">
              {!dirty ? (
                <span className="font-mono text-[10px] text-[var(--aj-faint)]">
                  아래 버튼으로 시점을 바꿔 보세요
                </span>
              ) : (
                <>
                  {!exclusive ? (
                    <span
                      className="font-mono text-[10px]"
                      style={{color: "var(--aj-bad)"}}
                    >
                      ✕ 두 컨트롤러가 동시에 입력을 먹었습니다
                    </span>
                  ) : null}
                  {!reparent ? (
                    <span
                      className="font-mono text-[10px]"
                      style={{color: "var(--aj-bad)"}}
                    >
                      ✕ 카메라가 옛 부모에 남아 시점이 튑니다
                    </span>
                  ) : null}
                  {!delay ? (
                    <span
                      className="font-mono text-[10px]"
                      style={{color: "var(--aj-bad)"}}
                    >
                      ✕ 전환 직후 Y 위치가 흔들립니다
                    </span>
                  ) : null}
                  {ok ? (
                    <span
                      className="font-mono text-[10px]"
                      style={{color: "var(--aj-ok)"}}
                    >
                      ✓ 전환이 깨끗하게 끝났습니다
                    </span>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <Toggle
            on={exclusive}
            onToggle={() => setExclusive(v => !v)}
            title="컨트롤러 분리"
            note="한쪽을 켤 때 반대쪽을 반드시 끈다"
            onColor="var(--aj-ok)"
          />
          <Toggle
            on={reparent}
            onToggle={() => setReparent(v => !v)}
            title="카메라 Parent 재지정"
            note="SetParent 로 부모를 갈아 끼운다"
            onColor="var(--aj-ok)"
          />
          <Toggle
            on={delay}
            onToggle={() => setDelay(v => !v)}
            title="코루틴 지연 처리"
            note="LockYPositionAfterDelay(3f)"
            onColor="var(--aj-ok)"
          />

          <button
            type="button"
            onClick={doSwitch}
            className="cursor-pointer rounded-md px-4 py-3 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: "1px solid rgba(163,230,53,0.45)",
              background: "rgba(163,230,53,0.14)",
              color: "var(--aj-accent)"
            }}
          >
            시점 전환 실행 ({switched}회)
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <CodePanel
            filename="PlayerModeManager.cs — 안전장치 세 줄"
            badge={{text: "실제 코드", color: "var(--aj-ok)"}}
            borderColor="var(--aj-code-border)"
          >
            <div className="py-2">
              <CodeLine n={1}>
                <Cm>{"// ① 배타 처리 — 동시 입력 방지"}</Cm>
              </CodeLine>
              <CodeLine n={2} bad={!exclusive} highlight={exclusive}>
                {"firstPersonController.enabled = false;"}
              </CodeLine>
              <CodeLine n={3} bad={!exclusive} highlight={exclusive}>
                {"topDownController.enabled = true;"}
              </CodeLine>
              <CodeLine n={4}>{""}</CodeLine>
              <CodeLine n={5}>
                <Cm>{"// ② 카메라 부모 교체 — 시점 튐 방지"}</Cm>
              </CodeLine>
              <CodeLine n={6} bad={!reparent} highlight={reparent}>
                {"mainCamera.transform.SetParent("}
              </CodeLine>
              <CodeLine n={7} bad={!reparent} highlight={reparent}>
                {"    firstPersonCameraParent, false);"}
              </CodeLine>
              <CodeLine n={8}>{""}</CodeLine>
              <CodeLine n={9}>
                <Cm>{"// ③ 코루틴 지연 — 전환 직후 흔들림 방지"}</Cm>
              </CodeLine>
              <CodeLine n={10} bad={!delay} highlight={delay}>
                {"StartCoroutine(LockYPositionAfterDelay(3f));"}
              </CodeLine>
            </div>
          </CodePanel>

          <Card label="배운 것" accent="var(--aj-primary)">
            <p className="text-[13px] leading-6">
              전환은 <strong>한 프레임짜리 사건이 아니라 상태 변경</strong>
              이었습니다. 켜고 끄는 것만으로는 부족했고, 카메라 계층과 물리가
              안정될 시간까지 줘야 끝났습니다.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-4">
        <Hint>
          세 스위치를 전부 끄고 전환해 보시면, 처음 이 기능을 붙였을 때의 상태가
          그대로 나옵니다.
        </Hint>
      </div>
    </Page>
  );
}
