"use client";

import {useCallback, useEffect, useRef, useState} from "react";
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
  Switch2,
  fade,
  rise,
  usePageIn
} from "../parts";
import {useTimeline} from "../useTimeline";

// PAGE 09 — 유저테스트 · 플레이어가 보내온 네 줄
//
// PDF 「유저테스트 실행 방식」 네 건을 **문구 그대로** 옮겼다.
// 왼쪽이 플레이어가 실제로 보낸 말, 오른쪽이 그때 실제로 한 조치다.
// 조치의 결과가 동작으로 드러나므로 「고치기 전 / 후」를 직접 눌러 보게 한다.

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, list: 3};

type Kind = "jump" | "log" | "icicle" | "camera";

interface Feedback {
  kind: Kind;
  who: string;
  says: string;
  did: string;
  tag: "임시 조치" | "동작 수정" | "연출 수정";
}

const FEEDBACK: Feedback[] = [
  {
    kind: "jump",
    who: "테스터 A",
    says: "높이가 낮은 물체에 닿은 후 2단 점프가 안 됩니다.",
    did: "Player 의 Jump 범위에 문제가 생기지 않게 임시적으로 오브젝트의 위치를 수정함. 추후에 Jump 매커니즘을 수정할 예정.",
    tag: "임시 조치"
  },
  {
    kind: "log",
    who: "테스터 A",
    says: "캐릭터를 리스폰해야 통나무가 리스폰되는데 변경되었으면 좋겠습니다.",
    did: "캐릭터 리스폰과 관계없이 밟은 통나무는 7초 후 리스폰되도록 수정함.",
    tag: "동작 수정"
  },
  {
    kind: "icicle",
    who: "테스터 B",
    says: "고드름이 바닥에 닿는 순간 고드름에 닿을 경우 죽는 판정이 변경되었으면 좋겠습니다.",
    did: "땅에 닿기 전에는 콜라이더 활성화, 땅에 닿은 순간부터 콜라이더 비활성화로 변경.",
    tag: "동작 수정"
  },
  {
    kind: "camera",
    who: "테스터 B",
    says: "Stage2 원근감 및 거리감이 불편합니다.",
    did: "카메라의 Y축의 높이를 조정하여 적절한 원근감 및 거리감 구현.",
    tag: "연출 수정"
  }
];

const TAG_COLOR: Record<Feedback["tag"], string> = {
  "임시 조치": "var(--ts-warn)",
  "동작 수정": "var(--ts-primary)",
  "연출 수정": "var(--ts-ray)"
};

/* ── 미니 데모 ── */

function JumpDemo({after}: {after: boolean}) {
  const [jumps, setJumps] = useState(0);
  const [msg, setMsg] = useState("");

  const jump = () => {
    if (jumps === 0) {
      setJumps(1);
      setMsg("1단 점프");
    } else if (jumps === 1) {
      if (after) {
        setJumps(2);
        setMsg("2단 점프 — 성공");
      } else setMsg("2단 점프 — 입력이 먹지 않음");
    } else {
      setJumps(0);
      setMsg("착지");
    }
  };

  const y = jumps === 0 ? 0 : jumps === 1 ? 34 : 66;

  return (
    <div>
      <div className="ts-stage" style={{height: 148}}>
        <div
          className="absolute rounded-sm"
          style={{
            left: "34%",
            bottom: after ? 26 : 22,
            width: 76,
            height: after ? 14 : 10,
            background: "rgba(255,255,255,0.28)",
            transition: "bottom 0.3s var(--ts-ease), height 0.3s var(--ts-ease)"
          }}
          aria-hidden="true"
        />
        <div
          className="absolute rounded-sm"
          style={{
            left: "40%",
            bottom: (after ? 40 : 32) + y,
            width: 16,
            height: 22,
            background: "var(--ts-primary)",
            transition: "bottom 0.22s var(--ts-ease)"
          }}
          aria-hidden="true"
        />
        <div className="ts-ground" style={{height: 22}} />
        <div className="absolute bottom-1.5 left-3 font-mono text-[10px] text-[var(--ts-faint)]">
          {after ? "오브젝트 위치 조정 후" : "조정 전"}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={jump}
          className="rounded-md px-4 py-2.5 font-mono text-[12px] font-bold"
          style={{
            border: "1px solid rgba(52,211,153,0.45)",
            background: "rgba(52,211,153,0.14)",
            color: "var(--ts-accent)"
          }}
        >
          점프
        </button>
        <span
          className="font-mono text-[11px]"
          style={{
            color: msg.includes("먹지") ? "var(--ts-bad)" : "var(--ts-muted)"
          }}
        >
          {msg || "눌러 보세요"}
        </span>
      </div>
    </div>
  );
}

function LogDemo({after}: {after: boolean}) {
  const [gone, setGone] = useState(false);
  const [left, setLeft] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
    },
    []
  );

  const stepOn = () => {
    if (gone) return;
    setGone(true);
    if (!after) return;
    setLeft(7);
    timer.current = window.setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) {
          if (timer.current) window.clearInterval(timer.current);
          setGone(false);
          return 0;
        }
        return prev - 1;
      });
    }, 700);
  };

  return (
    <div>
      <div className="ts-stage" style={{height: 148}}>
        <div
          className="absolute rounded-full transition-opacity duration-300"
          style={{
            left: "38%",
            bottom: 46,
            width: 92,
            height: 14,
            background: "linear-gradient(180deg, #8a5a33, #5b3a20)",
            opacity: gone ? 0.12 : 1
          }}
          aria-hidden="true"
        />
        {gone ? (
          <div
            className="absolute font-mono text-[11px]"
            style={{
              left: after ? "40%" : "33%",
              bottom: 66,
              color: after ? "var(--ts-accent)" : "var(--ts-bad)"
            }}
          >
            {after ? `${left}초 후 복구` : "죽어야 돌아옴"}
          </div>
        ) : null}
        <div className="ts-ground" style={{height: 22}} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={stepOn}
          disabled={gone}
          className="rounded-md px-4 py-2.5 font-mono text-[12px] font-bold disabled:opacity-40"
          style={{
            border: "1px solid rgba(52,211,153,0.45)",
            background: "rgba(52,211,153,0.14)",
            color: "var(--ts-accent)"
          }}
        >
          통나무 밟기
        </button>
        {!after ? (
          <button
            type="button"
            onClick={() => {
              setGone(false);
              setLeft(0);
            }}
            className="rounded-md px-4 py-2.5 font-mono text-[12px] font-bold"
            style={{
              border: "1px solid var(--ts-border)",
              color: "var(--ts-muted)"
            }}
          >
            캐릭터 리스폰
          </button>
        ) : null}
      </div>
    </div>
  );
}

function IcicleDemo({after}: {after: boolean}) {
  const [phase, setPhase] = useState<"top" | "ground">("top");
  const [msg, setMsg] = useState("");

  const touch = () => {
    if (phase === "top") {
      setMsg("떨어지는 중 접촉 — 사망 (의도한 판정)");
      return;
    }
    setMsg(
      after
        ? "바닥에 놓인 고드름 접촉 — 안전"
        : "바닥에 놓인 고드름 접촉 — 사망 (억울함)"
    );
  };

  return (
    <div>
      <div className="ts-stage" style={{height: 148}}>
        <div
          className="ts-icicle"
          style={{
            left: "46%",
            top: phase === "top" ? 12 : 98,
            transition: "top 0.45s cubic-bezier(0.5,0,0.9,0.6)",
            opacity: after && phase === "ground" ? 0.5 : 1
          }}
          aria-hidden="true"
        />
        {after && phase === "ground" ? (
          <div
            className="absolute font-mono text-[10px]"
            style={{left: "52%", top: 102, color: "var(--ts-primary)"}}
          >
            콜라이더 비활성
          </div>
        ) : null}
        <div className="ts-ground" style={{height: 22}} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setPhase(p => (p === "top" ? "ground" : "top"));
            setMsg("");
          }}
          className="rounded-md px-4 py-2.5 font-mono text-[12px] font-bold"
          style={{
            border: "1px solid rgba(125,211,252,0.4)",
            background: "rgba(125,211,252,0.1)",
            color: "var(--ts-ray)"
          }}
        >
          {phase === "top" ? "떨어뜨리기" : "되돌리기"}
        </button>
        <button
          type="button"
          onClick={touch}
          className="rounded-md px-4 py-2.5 font-mono text-[12px] font-bold"
          style={{
            border: "1px solid var(--ts-border)",
            color: "var(--ts-muted)"
          }}
        >
          고드름에 닿기
        </button>
      </div>
      {msg ? (
        <p
          className="mt-2 font-mono text-[11px]"
          style={{
            color: msg.includes("사망") ? "var(--ts-bad)" : "var(--ts-primary)"
          }}
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}

function CameraDemo({after}: {after: boolean}) {
  return (
    <div className="ts-stage" style={{height: 148}}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${26 + i * 20}%`,
            bottom: after ? 40 + i * 16 : 44 + i * 5,
            width: 62,
            height: 10,
            background: `rgba(52,211,153,${0.5 - i * 0.12})`,
            transition: "bottom 0.4s var(--ts-ease)"
          }}
          aria-hidden="true"
        />
      ))}
      <div className="ts-ground" style={{height: 22}} />
      <div
        className="absolute right-3 top-3 font-mono text-[10px]"
        style={{color: after ? "var(--ts-primary)" : "var(--ts-warn)"}}
      >
        camera.y = {after ? "8.5" : "4.0"}
      </div>
      <div className="absolute bottom-1.5 left-3 font-mono text-[10px] text-[var(--ts-faint)]">
        {after
          ? "발판 사이 거리가 구분된다"
          : "발판이 겹쳐 보여 거리 판단이 어렵다"}
      </div>
    </div>
  );
}

function Demo({kind, after}: {kind: Kind; after: boolean}) {
  if (kind === "jump") return <JumpDemo after={after} />;
  if (kind === "log") return <LogDemo after={after} />;
  if (kind === "icicle") return <IcicleDemo after={after} />;
  return <CameraDemo after={after} />;
}

export function P09UserTest() {
  const {reducedMotion, announce} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const [pick, setPick] = useState(0);
  const [after, setAfter] = useState<0 | 1>(0);
  const [read, setRead] = useState<number[]>([0]);

  const select = useCallback(
    (i: number) => {
      setPick(i);
      setAfter(0);
      setRead(prev => (prev.includes(i) ? prev : [...prev, i]));
      announce(`${FEEDBACK[i].who}의 피드백을 열었습니다.`);
    },
    [announce]
  );

  const f = FEEDBACK[pick];

  return (
    <Page index={9} innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant} color="var(--ts-accent)">
        09 · 유저테스트
      </Kicker>

      <div className="mt-4">
        <Heading
          text="플레이어가 보내온 네 줄"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          출시 전에 실제 플레이어를 앉혀 놓고 테스트를 돌렸습니다. 돌아온 말은
          네 줄이었고, <strong>넷 다 제가 만든 장애물에 대한 것</strong>
          이었습니다. 그중 첫 줄은 02 에서 직접 눌러 보신 그 2단 점프입니다.
        </Body>
        <div className="mt-3">
          <Hint>
            피드백을 고르고 「고치기 전 / 후」를 바꿔 가며 직접 눌러 보세요
          </Hint>
        </div>
      </div>

      <div
        className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]"
        style={rise(on[IDX.list], instant)}
      >
        <div className="flex flex-col gap-2">
          {FEEDBACK.map((fb, i) => {
            const active = i === pick;
            return (
              <button
                key={fb.says}
                type="button"
                onClick={() => select(i)}
                aria-pressed={active}
                className={`flex gap-3 rounded-md p-3.5 text-left transition-colors duration-200 ${
                  instant ? "" : "ts-arrive"
                }`}
                style={{
                  border: active
                    ? "1px solid var(--ts-accent)"
                    : "1px solid var(--ts-border)",
                  background: active
                    ? "rgba(110,231,183,0.08)"
                    : "var(--ts-panel)",
                  animationDelay: instant ? undefined : `${i * 90}ms`
                }}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-black"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "var(--ts-muted)"
                  }}
                  aria-hidden="true"
                >
                  {fb.who.slice(-1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--ts-faint)]">
                      {fb.who}
                    </span>
                    {read.includes(i) ? null : (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{background: "var(--ts-accent)"}}
                        aria-label="읽지 않음"
                      />
                    )}
                  </span>
                  <span className="mt-1 block text-[13px] leading-[22px] text-[var(--ts-text)]">
                    “{fb.says}”
                  </span>
                </span>
              </button>
            );
          })}
          <p className="mt-1 font-mono text-[10px] leading-5 text-[var(--ts-faint)]">
            문구는 유저테스트 기록에 적힌 그대로입니다.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Panel
            label={f.tag}
            right={
              <Switch2
                options={["고치기 전", "고친 후"]}
                value={after}
                onChange={setAfter}
                label="고치기 전과 후 비교"
              />
            }
          >
            <div
              className="mb-3 h-[2px] w-10 rounded-full"
              style={{background: TAG_COLOR[f.tag]}}
              aria-hidden="true"
            />
            <Demo
              key={`${f.kind}-${after}`}
              kind={f.kind}
              after={after === 1}
            />
            <p className="mt-4 border-t border-[rgba(52,211,153,0.12)] pt-3 text-[13px] leading-6 text-[var(--ts-text)]">
              {f.did}
            </p>
          </Panel>

          <div style={fade(read.length >= FEEDBACK.length, instant, "0.5s")}>
            {read.length >= FEEDBACK.length ? (
              <Card label="네 줄을 다 읽고 나서" accent="var(--ts-accent)">
                <p className="text-[14px] leading-7">
                  넷 중 어느 것도 <strong>버그가 아니었습니다.</strong> 전부
                  제가 의도한 대로 동작하고 있었는데, 플레이어에게는 그게
                  불합리하게 느껴졌습니다.{" "}
                  <span className="text-[var(--ts-accent)]">
                    만든 사람은 규칙을 알아서 영원히 못 느끼는 종류의
                    불편이었습니다.
                  </span>
                </p>
                <p className="mt-3 text-[14px] leading-7 text-[var(--ts-muted)]">
                  첫 번째 건은 지금 봐도 <strong>임시 조치</strong>였습니다.
                  점프 매커니즘을 고치는 대신 오브젝트를 옮겨 증상을 피했고,
                  기록에도 &ldquo;추후 수정 예정&rdquo;이라고 남겼습니다. 출시
                  일정 안에서 내린 선택이지만 근본 수정은 아니었습니다.
                </p>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <Caveat>
        위 미니 데모는 각 조치가 무엇을 바꿨는지 보여 주기 위해 이 페이지에서
        다시 만든 것이며 실제 게임 물리와는 다릅니다. 테스터 수·세션 수 같은
        정량 지표는 기록하지 않았습니다.
      </Caveat>
    </Page>
  );
}
