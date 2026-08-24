"use client";

import {useCallback, useMemo, useRef, useState} from "react";
import {useTserof} from "../context";
import {
  Body,
  Card,
  Caveat,
  CodeLine,
  CodePanel,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  Toggle,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../useTimeline";

// PAGE 08 — 트러블슈팅 04 · 세이브 파일은 그냥 열리는 텍스트였다
//
// PDF 원문: "유저가 파일 내에서 데이터를 변경하거나 삭제할 가능성 존재"
//        → "JSON 으로 데이터를 저장하는 경우, 암호화 방식에 관계없이 보안 취약점 존재"
//        → "처리 속도가 빠른 XOR 암호화를 통해 데이터 암호화"
//        → "암호화를 통해 데이터 변경 가능성을 시각적으로 낮춤"
//
// PAGE 03 에서 고른 방식이 실제로 무엇을 막는지 여기서 확인한다.
// 순서가 중요하다: **먼저 치트를 성공시켜 준 다음** 문을 닫는다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, symptom: 2, demo: 3};

const CODE_WORD = "tserof";

interface SaveData {
  isFirstStageClear: boolean;
  isSecondStageClear: boolean;
  isThirdStageClear: boolean;
  hiddenItemsCollected: number;
}

const FLAGS: {key: keyof SaveData; label: string}[] = [
  {key: "isFirstStageClear", label: "1스테이지 클리어"},
  {key: "isSecondStageClear", label: "2스테이지 클리어"},
  {key: "isThirdStageClear", label: "3스테이지 클리어"}
];

function toJson(d: SaveData) {
  return JSON.stringify(
    {
      lastUpdated: 638498988592771476,
      hiddenItemsCollected: d.hiddenItemsCollected,
      isFirstStageClear: d.isFirstStageClear,
      isSecondStageClear: d.isSecondStageClear,
      isThirdStageClear: d.isThirdStageClear
    },
    null,
    2
  );
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

export function P08Xor() {
  const {reducedMotion, announce} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [encrypted, setEncrypted] = useState(false);
  const [data, setData] = useState<SaveData>({
    isFirstStageClear: true,
    isSecondStageClear: false,
    isThirdStageClear: false,
    hiddenItemsCollected: 3
  });
  const [loaded, setLoaded] = useState<SaveData | null>(null);
  const [cheated, setCheated] = useState(false);

  const json = useMemo(() => toJson(data), [data]);
  const cipher = useMemo(() => printable(xor(json, CODE_WORD)), [json]);

  const flip = useCallback(
    (key: keyof SaveData) => {
      if (encrypted) return;
      setData(prev => {
        if (key === "isThirdStageClear" && !prev[key]) setCheated(true);
        return {...prev, [key]: !prev[key]};
      });
      setLoaded(null);
      announce("세이브 파일의 값을 바꿨습니다.");
    },
    [encrypted, announce]
  );

  const load = useCallback(() => {
    setLoaded(data);
    announce(
      data.isThirdStageClear
        ? "게임이 3스테이지 클리어 상태로 불러왔습니다."
        : "게임이 세이브 파일을 불러왔습니다."
    );
  }, [data, announce]);

  const toggle = useCallback(() => {
    setEncrypted(prev => {
      setLoaded(null);
      announce(
        !prev
          ? "XOR 암호화를 켰습니다. 파일을 열어도 어디를 고칠지 보이지 않습니다."
          : "암호화를 껐습니다. 파일이 다시 읽히는 JSON 이 됩니다."
      );
      return !prev;
    });
  }, [announce]);

  return (
    <Page index={8} innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant} color="var(--ts-bad)">
        08 · 트러블슈팅 04
      </Kicker>

      <div className="mt-4">
        <Heading
          text="세이브 파일은 그냥 열리는 텍스트였다"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-6" style={rise(on[IDX.symptom], instant)}>
        <Card label="증상" accent="var(--ts-bad)">
          <p className="text-[15px] leading-8">
            진행 상황을 JSON 으로 저장했다. 개발 중에는 읽기 쉬워서 편했는데,{" "}
            <strong>플레이어에게도 똑같이 편했다.</strong> 메모장으로 열어서{" "}
            <code className="font-mono text-[14px]">false</code> 를{" "}
            <code className="font-mono text-[14px]">true</code> 로 바꾸면
            끝이었다.
          </p>
        </Card>
        <div className="mt-3">
          <Hint>
            먼저 3스테이지 클리어를 켜고 「게임 불러오기」를 눌러 보세요
          </Hint>
        </div>
      </div>

      <div
        className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]"
        style={rise(on[IDX.demo], instant)}
      >
        <div className="flex flex-col gap-4">
          <CodePanel
            filename="data.game — 메모장"
            badge={
              encrypted
                ? {text: "암호화됨", color: "var(--ts-primary)"}
                : {text: "평문", color: "var(--ts-bad)"}
            }
            borderColor={
              encrypted ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.3)"
            }
          >
            <div className="max-h-[220px] overflow-auto p-4">
              {encrypted ? (
                <p className="break-all font-mono text-[11px] leading-[19px] text-[var(--ts-muted)]">
                  {cipher}
                </p>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-[19px] text-[var(--ts-text)]">
                  {json}
                </pre>
              )}
            </div>
          </CodePanel>

          <Panel
            label={
              encrypted
                ? "무엇을 고쳐야 할지 찾을 수 없다"
                : "값을 눌러 고칠 수 있다"
            }
          >
            <div className="flex flex-col gap-1.5">
              {FLAGS.map(f => {
                const val = data[f.key] as boolean;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => flip(f.key)}
                    disabled={encrypted}
                    className="flex items-center justify-between gap-3 rounded px-3 py-2.5 text-left transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      background: val
                        ? "rgba(52,211,153,0.09)"
                        : "rgba(255,255,255,0.03)"
                    }}
                  >
                    <span className="text-[12px] text-[var(--ts-text)]">
                      {f.label}
                    </span>
                    <span
                      className="shrink-0 font-mono text-[11px] font-bold"
                      style={{
                        color: val ? "var(--ts-primary)" : "var(--ts-faint)"
                      }}
                    >
                      {String(val)}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={load}
              className="mt-3 w-full rounded-md px-4 py-3 font-mono text-[12px] font-bold"
              style={{
                border: "1px solid rgba(52,211,153,0.45)",
                background: "rgba(52,211,153,0.14)",
                color: "var(--ts-accent)"
              }}
            >
              ▶ 게임 불러오기
            </button>

            {loaded ? (
              <div
                className="mt-3 rounded px-3 py-2.5 font-mono text-[11px] leading-5"
                style={{
                  border: loaded.isThirdStageClear
                    ? "1px solid rgba(248,113,113,0.4)"
                    : "1px solid var(--ts-border)",
                  background: loaded.isThirdStageClear
                    ? "rgba(248,113,113,0.08)"
                    : "rgba(255,255,255,0.02)",
                  color: loaded.isThirdStageClear
                    ? "var(--ts-bad)"
                    : "var(--ts-muted)"
                }}
              >
                {loaded.isThirdStageClear
                  ? "스테이지 선택: 01 · 02 · 03 전부 열림 — 플레이한 적 없는 스테이지까지."
                  : "스테이지 선택: 01 까지 열림."}
              </div>
            ) : null}
          </Panel>

          <Toggle
            on={encrypted}
            onToggle={toggle}
            title="XOR 암호화"
            note={
              encrypted
                ? "저장할 때 암호화, 불러올 때 복호화"
                : "JSON 을 그대로 저장한다"
            }
          />
        </div>

        <div className="flex flex-col gap-4">
          <CodePanel
            filename="FileDataHandler.cs"
            borderColor={
              encrypted ? "rgba(52,211,153,0.4)" : "var(--ts-border)"
            }
            footer="같은 함수가 암호화도 복호화도 한다 — XOR 의 성질"
          >
            <div className="py-2">
              <CodeLine n={1} highlight={encrypted}>
                {"if (_useEncryption)"}
              </CodeLine>
              <CodeLine n={2}>
                {"  dataToLoad = EncryptDecrypt(dataToLoad);"}
              </CodeLine>
              <CodeLine n={3}>
                {"loadedData = JsonUtility.FromJson<GameData>(dataToLoad);"}
              </CodeLine>
              <CodeLine n={4}>{""}</CodeLine>
              <CodeLine n={5}>
                {"private string EncryptDecrypt(string data)"}
              </CodeLine>
              <CodeLine n={6}>{"{"}</CodeLine>
              <CodeLine n={7}>{'  string modifiedData = "";'}</CodeLine>
              <CodeLine n={8}>
                {"  for (int i = 0; i < data.Length; i++)"}
              </CodeLine>
              <CodeLine n={9} highlight={encrypted}>
                {"    modifiedData += (char)(data[i] ^"}
              </CodeLine>
              <CodeLine n={10} highlight={encrypted}>
                {"      _encryptionCodeWord[i % _encryptionCodeWord.Length]);"}
              </CodeLine>
              <CodeLine n={11}>{"  return modifiedData;"}</CodeLine>
              <CodeLine n={12}>{"}"}</CodeLine>
            </div>
          </CodePanel>

          <Card
            label={
              encrypted
                ? "개선 결과"
                : cheated
                ? "방금 하신 일"
                : "먼저 해 보세요"
            }
            accent={
              encrypted
                ? "var(--ts-primary)"
                : cheated
                ? "var(--ts-bad)"
                : "var(--ts-warn)"
            }
          >
            <p className="text-[14px] leading-7">
              {encrypted ? (
                <>
                  파일을 열어도 어디를 고쳐야 할지 보이지 않습니다. 기록에도{" "}
                  <strong>
                    &ldquo;데이터 변경 가능성을 시각적으로 낮춤&rdquo;
                  </strong>{" "}
                  이라고 적었습니다 — 막았다가 아니라{" "}
                  <span className="text-[var(--ts-accent)]">낮췄다</span>{" "}
                  입니다.
                </>
              ) : cheated ? (
                <>
                  3스테이지를 <strong>한 번도 플레이하지 않고</strong>{" "}
                  열었습니다. 06 에서 만든 잠금 구조가 파일 하나로
                  무력해졌습니다.
                </>
              ) : (
                <>
                  왼쪽에서 <strong>3스테이지 클리어</strong>를 켜고 「게임
                  불러오기」를 눌러 보세요. 파일 하나로 무엇이 가능한지
                  보입니다.
                </>
              )}
            </p>
          </Card>

          <Panel label="남은 한계 — 솔직하게">
            <p className="text-[13px] leading-6 text-[var(--ts-muted)]">
              XOR 은{" "}
              <strong className="text-[var(--ts-text)]">
                암호학적으로 안전한 방식이 아닙니다.
              </strong>{" "}
              코드워드를 알아내면 그대로 풀리고, 클라이언트에 파일을 두는 이상
              완전히 막는 건 애초에 불가능합니다. 여기서 노린 건{" "}
              <span className="text-[var(--ts-text)]">
                메모장으로 열어 즉흥적으로 고치는 일의 문턱을 올리는 것
              </span>
              까지였습니다.
            </p>
          </Panel>
        </div>
      </div>

      <Caveat>
        위 암호문은 이 페이지에서 실제로 같은 XOR 연산을 돌린
        결과입니다(코드워드는 데모용). 화면에 그릴 수 없는 제어문자는 ▯ 로 바꿔
        표시했습니다.
      </Caveat>
    </Page>
  );
}
