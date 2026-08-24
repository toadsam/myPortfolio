"use client";

import {useCallback, useMemo, useRef, useState} from "react";
import {useTserof} from "../context";
import {
  Body,
  Card,
  Caveat,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../useTimeline";

// PAGE 03 — 기술 의사결정 · 진행 상황을 어디에 저장할 것인가
//
// 개발 실체: 저장 방식 3안 비교 + 선택 근거 + **대신 포기한 것**
// 연출 장치: 세 안에 **같은 세이브 데이터를 동시에 먹여** 결과가 갈리는 걸 보여준다
//
// 여기서 고른 결과가 실제로 무엇을 막았는지는 PAGE 08 에서 방문자가 직접 확인한다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const PAYLOAD = {
  isFirstStageClear: true,
  isSecondStageClear: false,
  isThirdStageClear: false,
  hiddenItemsCollected: 3
};

const CODE_WORD = "tserof";

function toJson(pretty: boolean) {
  return JSON.stringify(PAYLOAD, null, pretty ? 2 : 0);
}

function xor(data: string, word: string) {
  let out = "";
  for (let i = 0; i < data.length; i++)
    out += String.fromCharCode(
      data.charCodeAt(i) ^ word.charCodeAt(i % word.length)
    );
  return out;
}

function printable(s: string) {
  let out = "";
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    out += c < 32 || c === 127 ? "▯" : ch;
  }
  return out;
}

interface Option {
  key: string;
  name: string;
  sub: string;
  /** 플레이어가 파일을 열었을 때 보이는 것 */
  view: (open: boolean) => string;
  pros: string[];
  cons: string[];
  picked: boolean;
}

export function P03SaveDecision() {
  const {reducedMotion, announce} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [opened, setOpened] = useState(false);

  const cipher = useMemo(() => printable(xor(toJson(true), CODE_WORD)), []);

  const OPTIONS: Option[] = useMemo(
    () => [
      {
        key: "prefs",
        name: "PlayerPrefs",
        sub: "Unity 내장 키-값 저장소",
        view: open =>
          open
            ? "HKCU\\Software\\...\\isThirdStageClear = 0\nHKCU\\Software\\...\\hiddenItems = 3"
            : "레지스트리 · plist 에 키 단위로 흩어짐",
        pros: ["코드가 가장 짧다", "따로 파일을 다루지 않아도 된다"],
        cons: [
          "구조를 가진 데이터를 담기 어렵다",
          "여전히 평문이고 위치만 옮긴 셈이다",
          "백업·이관이 번거롭다"
        ],
        picked: false
      },
      {
        key: "json",
        name: "JSON 파일",
        sub: "직렬화해서 파일로",
        view: open => (open ? toJson(true) : "사람이 읽는 그대로의 텍스트"),
        pros: ["구조화가 쉽다", "개발 중 디버깅이 편하다", "백업·이관이 쉽다"],
        cons: ["읽기 쉬운 만큼 고치기도 쉽다", "플레이어가 값을 바꿀 수 있다"],
        picked: false
      },
      {
        key: "xor",
        name: "JSON + XOR",
        sub: "직렬화 후 문자마다 XOR",
        view: open =>
          open ? cipher.slice(0, 180) + " …" : "같은 구조 + 읽히지 않는 형태",
        pros: [
          "JSON 의 장점을 그대로 가져간다",
          "메모장으로 열어도 어디를 고칠지 안 보인다",
          "세이브·로드마다 도는 코드라 **처리 속도가 빠른 것**이 중요했다"
        ],
        cons: [
          "암호학적으로 안전하지 않다 — 코드워드를 알면 풀린다",
          "디버깅할 때 한 단계 번거로워진다"
        ],
        picked: true
      }
    ],
    [cipher]
  );

  const toggleOpen = useCallback(() => {
    setOpened(prev => {
      announce(
        !prev
          ? "세 방식의 저장 결과를 메모장으로 열어 봅니다."
          : "메모장을 닫았습니다."
      );
      return !prev;
    });
  }, [announce]);

  return (
    <Page index={3} innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant}>
        03 · 기술 의사결정
      </Kicker>

      <div className="mt-4">
        <Heading
          text="진행 상황을 어디에 저장할 것인가"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          이 게임은 스테이지를 순서대로 열어 가는 구조라{" "}
          <strong>&ldquo;어디까지 깼는지&rdquo;가 곧 게임의 상태</strong>
          입니다. 그걸 어디에 어떻게 둘지 세 가지를 놓고 비교했습니다.
        </Body>
        <div className="mt-3">
          <Hint>
            같은 세이브 데이터를 세 방식에 동시에 넣었습니다 — 「메모장으로
            열기」를 눌러 보세요
          </Hint>
        </div>
      </div>

      <div className="mt-8" style={rise(on[IDX.demo], instant)}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleOpen}
            aria-pressed={opened}
            className="rounded-md px-4 py-2.5 font-mono text-[12px] font-bold transition-colors duration-200"
            style={{
              border: `1px solid ${
                opened ? "var(--ts-warn)" : "var(--ts-border)"
              }`,
              background: opened ? "rgba(251,191,36,0.1)" : "var(--ts-panel)",
              color: opened ? "var(--ts-warn)" : "var(--ts-muted)"
            }}
          >
            {opened ? "메모장 닫기" : "메모장으로 열기"}
          </button>
          <span className="font-mono text-[11px] text-[var(--ts-faint)]">
            같은 데이터 · 3스테이지는 아직 미클리어
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {OPTIONS.map(o => (
            <div
              key={o.key}
              className="flex flex-col rounded-md p-4"
              style={{
                border: o.picked
                  ? "1px solid var(--ts-primary)"
                  : "1px solid var(--ts-border)",
                background: o.picked
                  ? "rgba(52,211,153,0.06)"
                  : "var(--ts-panel)"
              }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-black text-[var(--ts-text)]">
                  {o.name}
                </span>
                {o.picked ? (
                  <span
                    className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-black"
                    style={{
                      background: "rgba(52,211,153,0.18)",
                      color: "var(--ts-primary)"
                    }}
                  >
                    채택
                  </span>
                ) : null}
              </div>
              <span className="mt-0.5 font-mono text-[10px] text-[var(--ts-muted)]">
                {o.sub}
              </span>

              {/* 결과 */}
              <div
                className="mt-3 min-h-[112px] overflow-hidden rounded p-2.5"
                style={{
                  background: "#031009",
                  border: "1px solid rgba(52,211,153,0.12)"
                }}
              >
                <pre
                  className="whitespace-pre-wrap break-all font-mono text-[10px] leading-[17px]"
                  style={{
                    color: opened
                      ? o.picked
                        ? "var(--ts-muted)"
                        : "var(--ts-bad)"
                      : "var(--ts-faint)"
                  }}
                >
                  {o.view(opened)}
                </pre>
              </div>

              <ul className="mt-3 space-y-1">
                {o.pros.map(p => (
                  <li
                    key={p}
                    className="flex gap-2 text-[12px] leading-5 text-[var(--ts-text)]"
                  >
                    <span style={{color: "var(--ts-primary)"}}>+</span>
                    <span>{p.replace(/\*\*/g, "")}</span>
                  </li>
                ))}
                {o.cons.map(c => (
                  <li
                    key={c}
                    className="flex gap-2 text-[12px] leading-5 text-[var(--ts-muted)]"
                  >
                    <span style={{color: "var(--ts-bad)"}}>−</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card label="고른 이유" accent="var(--ts-primary)">
            <p className="text-[14px] leading-7">
              JSON 의 구조화·백업 이점은 그대로 두고,{" "}
              <strong>읽히는 것만</strong> 막고 싶었습니다. 여러 암호화 방식 중
              XOR 을 고른 건{" "}
              <span className="text-[var(--ts-accent)]">
                세이브·로드마다 매번 도는 코드
              </span>
              라 처리 속도가 중요했기 때문입니다.
            </p>
          </Card>

          <Panel label="대신 포기한 것">
            <ul className="space-y-2 text-[13px] leading-6 text-[var(--ts-muted)]">
              <li>
                <span style={{color: "var(--ts-warn)"}}>·</span>{" "}
                <strong className="text-[var(--ts-text)]">
                  진짜 보안은 포기했습니다.
                </strong>{" "}
                코드워드를 찾아내면 그대로 풀립니다.
              </li>
              <li>
                <span style={{color: "var(--ts-warn)"}}>·</span> 디버깅 중
                세이브를 눈으로 확인하려면 한 번 복호화해야 합니다.
              </li>
              <li>
                <span style={{color: "var(--ts-warn)"}}>·</span> 세이브 데이터{" "}
                <strong className="text-[var(--ts-text)]">버전 관리</strong>는
                끝내 넣지 못했습니다. 다음 목표로 남았습니다.
              </li>
            </ul>
          </Panel>
        </div>

        <Caveat>
          위 세 칸은 같은 데이터를 각 방식으로 저장했을 때 플레이어가 보게 될
          모습을 재현한 것입니다. XOR 결과는 이 페이지에서 실제로 연산한 값이며,
          화면에 그릴 수 없는 제어문자는 ▯ 로 바꿨습니다.
        </Caveat>
      </div>
    </Page>
  );
}
