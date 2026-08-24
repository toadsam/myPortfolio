"use client";

import {useCallback, useRef, useState} from "react";
import {useTserof} from "../context";
import {
  Body,
  Card,
  CodeLine,
  CodePanel,
  Cm,
  Heading,
  Hint,
  Kicker,
  Page,
  Panel,
  rise,
  usePageIn
} from "../parts";
import {
  useKeyCapture,
  useOnScreen,
  usePageVisible,
  useRafLoop,
  useTimeline
} from "../useTimeline";

// PAGE 02 — 핵심 구현 #1 · 직접 점프해 보기
//
// 개발 실체: 2단 점프 컨트롤러 + 실제 조작
// 연출 장치: 관람객이 **직접 스페이스로 조작** → 그 감각을 P09 유저테스트에서 회수한다

const STEPS = [0, 150, 550, 900];
const IDX = {label: 0, heading: 1, body: 2, demo: 3};

const W = 640;
const H = 240;
const GROUND = 30;
const SIZE = 18;
const GRAV = 1800;
const JUMP_V = 560;
const SPEED = 210;

interface Platform {
  x: number;
  y: number;
  w: number;
}
const PLATFORMS: Platform[] = [
  {x: 130, y: 74, w: 110},
  {x: 300, y: 122, w: 96},
  {x: 452, y: 82, w: 120}
];

interface Runner {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  jumps: number;
}

export function P02Jump() {
  const {reducedMotion, announce} = useTserof();
  const ref = useRef<HTMLElement>(null);
  const seen = usePageIn(ref);
  const on = useTimeline(STEPS, seen, reducedMotion);
  const instant = reducedMotion;

  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(boxRef, 0.15);
  const pageVisible = usePageVisible();

  const [jumpLabel, setJumpLabel] = useState("대기");
  const [maxCombo, setMaxCombo] = useState(0);

  const held = useRef({left: false, right: false});
  const st = useRef<Runner>({
    x: 60,
    y: 0,
    vy: 0,
    onGround: true,
    jumps: 0
  });

  const doJump = useCallback(() => {
    const s = st.current;
    // 2단 점프 — 땅에서 한 번, 공중에서 한 번 더.
    if (s.jumps >= 2) {
      setJumpLabel("남은 점프 없음");
      return;
    }
    s.vy = JUMP_V;
    s.onGround = false;
    s.jumps += 1;
    setJumpLabel(s.jumps === 1 ? "1단 점프" : "2단 점프");
    setMaxCombo(prev => (s.jumps > prev ? s.jumps : prev));
  }, []);

  const {active, handlers} = useKeyCapture(
    boxRef,
    [" ", "Spacebar", "ArrowLeft", "ArrowRight", "ArrowUp", "a", "d"],
    key => {
      if (key === "ArrowLeft" || key === "a") held.current.left = true;
      else if (key === "ArrowRight" || key === "d") held.current.right = true;
      else doJump();
    },
    key => {
      if (key === "ArrowLeft" || key === "a") held.current.left = false;
      else if (key === "ArrowRight" || key === "d") held.current.right = false;
    }
  );

  const step = useCallback((deltaMs: number) => {
    const dt = Math.min(deltaMs, 40) / 1000;
    const s = st.current;

    const dir = (held.current.right ? 1 : 0) - (held.current.left ? 1 : 0);
    s.x = Math.max(4, Math.min(W - SIZE - 4, s.x + dir * SPEED * dt));

    const prevY = s.y;
    s.vy -= GRAV * dt;
    s.y += s.vy * dt;

    // 착지 판정 — 내려오는 중일 때만 발판을 본다.
    let landed = false;
    if (s.vy <= 0) {
      for (const p of PLATFORMS) {
        const over = s.x + SIZE > p.x && s.x < p.x + p.w;
        if (over && prevY >= p.y && s.y <= p.y) {
          s.y = p.y;
          landed = true;
          break;
        }
      }
    }
    if (s.y <= 0) {
      s.y = 0;
      landed = true;
    }

    if (landed) {
      s.vy = 0;
      if (!s.onGround) {
        s.onGround = true;
        s.jumps = 0;
      }
    } else {
      s.onGround = false;
    }

    // 가로는 논리 폭(W) 기준이므로 실제 컨테이너 폭에 맞춰 환산한다.
    // 발판이 %로 배치돼 있어 어떤 폭에서도 같은 코스가 유지된다.
    const node = dotRef.current;
    const boxW = boxRef.current?.clientWidth ?? W;
    if (node) {
      node.style.transform = `translate3d(${(s.x / W) * boxW}px, ${-s.y}px, 0)`;
    }
  }, []);

  useRafLoop(step, onScreen && pageVisible && !instant);

  return (
    <Page index={2} innerRef={ref}>
      <Kicker on={on[IDX.label]} instant={instant}>
        02 · 핵심 구현 #1
      </Kicker>

      <div className="mt-4">
        <Heading
          text="직접 점프해 보세요"
          on={on[IDX.heading]}
          instant={instant}
        />
      </div>

      <div className="mt-5" style={rise(on[IDX.body], instant)}>
        <Body>
          이 게임의 조작은 단순합니다. 이동하고, 점프하고, 공중에서 한 번 더
          점프합니다. 대신 <strong>타이밍이 전부</strong>입니다 — 장애물 패턴을
          보고 언제 누를지 정하는 게 플레이의 대부분이고, 실수하면 즉시
          실패합니다.
        </Body>
        <div className="mt-3">
          <Hint>
            아래 화면에 마우스를 올리거나 Tab 으로 포커스한 뒤 · ← → 이동 ·
            Space 점프
          </Hint>
        </div>
      </div>

      <div className="mt-8" style={rise(on[IDX.demo], instant)}>
        <div
          ref={boxRef}
          tabIndex={0}
          role="application"
          aria-label="점프 조작 데모 — 방향키로 이동, 스페이스로 점프"
          className="ts-stage w-full"
          style={{
            height: H,
            boxShadow: active ? "0 0 0 2px var(--ts-primary)" : undefined
          }}
          {...handlers}
        >
          {/* 발판 — 가로는 비율(%)로 두어 어떤 폭에서도 같은 코스가 나온다 */}
          {PLATFORMS.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                left: `${(p.x / W) * 100}%`,
                bottom: GROUND + p.y,
                width: `${(p.w / W) * 100}%`,
                height: 10,
                background: "rgba(52,211,153,0.30)",
                borderTop: "2px solid rgba(110,231,183,0.5)"
              }}
              aria-hidden="true"
            />
          ))}
          {/* 플레이어 */}
          <div
            ref={dotRef}
            className="absolute rounded-sm"
            style={{
              left: 0,
              bottom: GROUND,
              width: SIZE,
              height: SIZE + 6,
              background: "var(--ts-primary)",
              willChange: "transform"
            }}
            aria-hidden="true"
          />
          <div
            className="ts-ground absolute"
            style={{height: GROUND}}
            aria-hidden="true"
          />

          <div className="absolute left-3 top-3 font-mono text-[10px] text-[var(--ts-muted)]">
            {active ? "조작 가능" : "마우스를 올리거나 Tab 으로 포커스"}
          </div>
          <div
            className="absolute right-3 top-3 font-mono text-[10px]"
            style={{color: "var(--ts-accent)"}}
          >
            {jumpLabel}
          </div>
        </div>

        {/* 모바일·키보드 대체 조작 — 제스처만으로 끝내지 않는다 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onPointerDown={() => (held.current.left = true)}
            onPointerUp={() => (held.current.left = false)}
            onPointerLeave={() => (held.current.left = false)}
            className="rounded-md px-4 py-2.5 font-mono text-[12px] font-bold"
            style={{
              border: "1px solid var(--ts-border)",
              color: "var(--ts-muted)"
            }}
            aria-label="왼쪽으로 이동"
          >
            ←
          </button>
          <button
            type="button"
            onPointerDown={() => (held.current.right = true)}
            onPointerUp={() => (held.current.right = false)}
            onPointerLeave={() => (held.current.right = false)}
            className="rounded-md px-4 py-2.5 font-mono text-[12px] font-bold"
            style={{
              border: "1px solid var(--ts-border)",
              color: "var(--ts-muted)"
            }}
            aria-label="오른쪽으로 이동"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => {
              doJump();
              announce(jumpLabel);
            }}
            className="rounded-md px-5 py-2.5 font-mono text-[12px] font-bold"
            style={{
              border: "1px solid rgba(52,211,153,0.45)",
              background: "rgba(52,211,153,0.14)",
              color: "var(--ts-accent)"
            }}
          >
            점프
          </button>
          <span className="font-mono text-[11px] text-[var(--ts-faint)]">
            최대 연속 점프 {maxCombo}단
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
        <CodePanel
          filename="PlayerController.cs"
          footer="땅에 닿으면 점프 횟수가 0으로 돌아간다"
        >
          <div className="py-2">
            <CodeLine n={1}>
              {'if (Input.GetButtonDown("Jump") && _jumpCount < maxJump)'}
            </CodeLine>
            <CodeLine n={2}>{"{"}</CodeLine>
            <CodeLine n={3} highlight>
              {"  _rigidbody.velocity = new Vector3("}
            </CodeLine>
            <CodeLine n={4} highlight>
              {"    _rigidbody.velocity.x, jumpForce, _rigidbody.velocity.z);"}
            </CodeLine>
            <CodeLine n={5}>{"  _jumpCount++;"}</CodeLine>
            <CodeLine n={6}>{"}"}</CodeLine>
            <CodeLine n={7}>{""}</CodeLine>
            <CodeLine n={8}>{"private void FixedUpdate()"}</CodeLine>
            <CodeLine n={9}>{"{"}</CodeLine>
            <CodeLine n={10}>
              {"  CheckIsGrounded();   "}
              <Cm>{"// 접지 판정"}</Cm>
            </CodeLine>
            <CodeLine n={11}>
              {"  CheckIsFalling();    "}
              <Cm>{"// 낙하 상태"}</Cm>
            </CodeLine>
            <CodeLine n={12}>{"}"}</CodeLine>
          </div>
        </CodePanel>

        <div className="flex flex-col gap-4">
          <Panel label="이 조작이 이 방에서 하는 일">
            <ul className="space-y-2 text-[14px] leading-7 text-[var(--ts-text)]">
              <li>
                <span className="text-[var(--ts-accent)]">·</span> 뒤에 나올
                장애물 이야기가 <strong>무엇을 방해하는지</strong> 먼저 몸으로
                알게 합니다
              </li>
              <li>
                <span className="text-[var(--ts-accent)]">·</span> 09
                유저테스트에서 플레이어가 보낸 첫 문장이{" "}
                <strong>바로 이 2단 점프</strong>에 대한 것입니다
              </li>
            </ul>
          </Panel>

          <Card label="맡은 범위" accent="var(--ts-primary)">
            <p className="text-[14px] leading-7">
              컨트롤러 자체는 팀의 공동 작업이었고, 제가 맡은 건{" "}
              <strong>이 조작이 놓일 자리</strong> — 레벨 디자인과 장애물·기믹
              구현이었습니다. 그래서 이 방의 나머지는 전부{" "}
              <span className="text-[var(--ts-accent)]">
                플레이어 앞을 가로막는 것들
              </span>{" "}
              이야기입니다.
            </p>
          </Card>
        </div>
      </div>
    </Page>
  );
}
