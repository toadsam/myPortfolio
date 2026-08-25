"use client";

/**
 * 밤 숲 — 이력서 뒤에 깔리는 "세계".
 *
 * ## 이 컴포넌트가 하는 일
 *
 * 이력서 본문(`.resume-terminal`)은 그대로 두고, **그 뒤에 살아 있는 배경을
 * 깐다.** 시차 5겹 · 스쳐 지나가는 등불 · 반딧불 · 커서 랜턴이 전부 여기 있다.
 * 본문 마크업을 한 줄도 건드리지 않으므로, 이력서의 캐러셀·표·reveal 은
 * 그대로 살아 있다.
 *
 * ## 스크롤을 window 에서 읽으면 안 된다
 *
 * `.resume-terminal` 은 `position: fixed; overflow-y: auto` 라 **자기 자신이
 * 스크롤 컨테이너**다. `window.scrollY` 는 항상 0이다. 그래서 여기서는
 * **캡처 단계에서 document 의 scroll 을 듣는다** — scroll 이벤트는 버블링하지
 * 않지만 캡처는 탄다. 이렇게 하면 이력서의 ref 를 넘겨받지 않아도 되고,
 * 나중에 스크롤 주체가 바뀌어도 이 파일은 안 고쳐도 된다.
 *
 * ## 프레임마다 DOM 을 찾지 않는다
 *
 * 원본 시안은 `animate()` 안에서 매 프레임 `querySelectorAll` 을 세 번 돌리고,
 * 마지막 구간에서는 창문 9개마다 `setTimeout` 을 매 프레임 새로 걸었다
 * (초당 540개). 여기서는 ref 로 잡아 둔 엘리먼트에 transform 만 쓴다.
 */

import {useEffect, useRef} from "react";

/** 반딧불 마릿수. 500개는 노이즈고 8마리는 생명이다 — 늘리지 말 것. */
const FIREFLY_COUNT = 8;
const FIREFLY_COUNT_MOBILE = 4;

/**
 * 각 겹이 문서 전체를 지나는 동안 움직이는 거리(뷰포트 높이 배수).
 *
 * 겹마다 다른 속도로 흘러야 공간에 깊이가 생긴다. 하늘은 안 움직이고,
 * 눈앞의 잎사귀가 가장 빠르다. **겹의 높이를 `100% + travel` 로 잡아 두므로**
 * 아무리 스크롤해도 겹이 화면 밖으로 빠져나가 비지 않는다
 * (원본 시안은 `translateY(scrollY * 0.15)` 라 긴 문서에서 먼 숲이 사라졌다).
 */
const TRAVEL = {
  far: 0.14,
  fog: 0.26,
  mid: 0.55,
  front: 1.25
} as const;

/** 등불 사이 간격(뷰포트 높이 배수). 걷다 보면 하나씩 스쳐 지나간다. */
const LAMP_GAP = 0.85;
const LAMP_COUNT = 9;

/** 하늘색: 깊은 밤 → 새벽 기운. 스크롤 진행률로 연속 보간한다. */
const SKY_TOP = [7, 15, 27] as const; // #070f1b
const SKY_END = [22, 38, 60] as const; // #16263c

type Firefly = {
  x: number;
  y: number;
  size: number;
  angle: number;
  speed: number;
  blink: number;
  blinkSpeed: number;
};

export function ForestWorld() {
  const rootRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const lampsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // ── 상태는 전부 ref 바깥의 지역 변수로 둔다 (리렌더를 일으키지 않는다) ──
    let progress = 0; // 0~1 문서 진행률
    let scrollPx = 0; // 픽셀 스크롤량
    let speed = 0; // 프레임당 스크롤 속도(부호 있음)
    let lastScroll = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let lightX = -9999; // 커서 랜턴은 스프링으로 지연 추적한다
    let lightY = -9999;
    let vw = window.innerWidth;
    let vh = window.innerHeight;

    // ── 반딧불 ──
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") ?? null;
    const flies: Firefly[] = [];

    function seedFlies() {
      flies.length = 0;
      if (reduced) return;
      const n = coarse ? FIREFLY_COUNT_MOBILE : FIREFLY_COUNT;
      for (let i = 0; i < n; i += 1) {
        flies.push({
          x: Math.random() * vw,
          y: Math.random() * vh,
          size: 1 + Math.random() * 1.6,
          angle: Math.random() * Math.PI * 2,
          // 마리마다 속도가 달라야 무리가 아니라 개체로 보인다
          speed: 0.014 + Math.random() * 0.022,
          blink: Math.random() * Math.PI * 2,
          blinkSpeed: 0.02 + Math.random() * 0.03
        });
      }
    }

    function resize() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      if (canvas) {
        // DPR 을 반영하되 2배까지만 — 반딧불 8개에 4K 버퍼는 낭비다
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(vw * dpr);
        canvas.height = Math.floor(vh * dpr);
        canvas.style.width = `${vw}px`;
        canvas.style.height = `${vh}px`;
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      seedFlies();
    }
    resize();
    window.addEventListener("resize", resize);

    // ── 스크롤 ──
    //
    // 두 경로로 읽는다. 캡처 리스너는 **어느 컨테이너가 스크롤하든** 잡아서
    // 스크롤 주체를 알아내는 용도이고(scroll 은 버블링하지 않지만 캡처는 탄다),
    // 실제 값은 **프레임마다 직접 읽는다.**
    //
    // 이벤트만 믿으면 안 되는 이유: 크롬은 스크롤 이벤트를 프레임에 맞춰 쏘기
    // 때문에 배경 탭에서는 아예 안 오고(측정으로 확인함), 앵커 점프나
    // `scrollTop = x` 같은 프로그램 스크롤에서도 타이밍이 어긋난다.
    // 프레임마다 읽는 비용은 캐시된 엘리먼트 하나의 scrollTop 이라 무시할 수준이고,
    // 아래 루프가 **읽기 → 쓰기** 순서라 레이아웃을 되풀이해 계산하지도 않는다.
    let scroller: HTMLElement | null = null;

    function onScroll(event: Event) {
      const el = event.target;
      if (el instanceof HTMLElement && el.scrollHeight > el.clientHeight) {
        scroller = el;
      }
    }
    document.addEventListener("scroll", onScroll, true);

    function readScroll() {
      if (!scroller || !scroller.isConnected) {
        scroller =
          document.querySelector<HTMLElement>(".resume-terminal") ??
          (document.scrollingElement as HTMLElement | null);
      }
      if (!scroller) return;
      const max = scroller.scrollHeight - scroller.clientHeight;
      if (max <= 0) return;
      scrollPx = scroller.scrollTop;
      progress = Math.min(1, Math.max(0, scrollPx / max));
    }

    function onMove(event: PointerEvent) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (lightX < -9000) {
        lightX = mouseX;
        lightY = mouseY;
      }
    }
    if (!coarse) window.addEventListener("pointermove", onMove);

    // ── 프레임 루프 ──
    let raf = 0;
    let lastTime = performance.now();

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - lastTime) / 16.67, 3); // 60fps 기준 배수, 폭주 방지
      lastTime = now;

      // 읽기를 먼저, 쓰기를 나중에 — 순서가 바뀌면 매 프레임 레이아웃이 다시 계산된다
      readScroll();

      // 스크롤 속도는 감쇠시킨다 — 멈추면 스스로 0으로 돌아온다(관성)
      speed += (scrollPx - lastScroll - speed) * 0.25;
      lastScroll = scrollPx;
      speed *= 0.9;

      // 하늘색 보간
      if (skyRef.current) {
        const r = Math.round(SKY_TOP[0] + (SKY_END[0] - SKY_TOP[0]) * progress);
        const g = Math.round(SKY_TOP[1] + (SKY_END[1] - SKY_TOP[1]) * progress);
        const b = Math.round(SKY_TOP[2] + (SKY_END[2] - SKY_TOP[2]) * progress);
        skyRef.current.style.background = `linear-gradient(to bottom, rgb(${r},${g},${b}) 0%, #0b1626 55%, #060c16 100%)`;
      }

      if (!reduced) {
        // 시차 — 겹마다 다른 거리를 이동한다
        if (farRef.current)
          farRef.current.style.transform = `translate3d(0,${
            -progress * TRAVEL.far * vh
          }px,0)`;
        if (fogRef.current) {
          // 안개는 세로로 흐르면서 가로로도 아주 느리게 흘러간다
          const drift = Math.sin(now * 0.00004) * 40;
          fogRef.current.style.transform = `translate3d(${drift}px,${
            -progress * TRAVEL.fog * vh
          }px,0)`;
          // 숲이 열릴수록 안개가 옅어진다
          fogRef.current.style.opacity = String(0.5 - progress * 0.34);
        }
        if (midRef.current)
          midRef.current.style.transform = `translate3d(0,${
            -progress * TRAVEL.mid * vh
          }px,0)`;

        // 앞 잎사귀 — 스크롤 **속도**에 반응해 눕는다. 멈추면 스프링으로 돌아온다.
        if (frontRef.current) {
          const tilt = Math.max(-11, Math.min(11, speed * 0.35));
          frontRef.current.style.transform = `translate3d(0,${
            -progress * TRAVEL.front * vh
          }px,0) rotate(${tilt}deg)`;
        }

        // 등불 — 걷다 보면 하나씩 위로 스쳐 지나간다
        if (lampsRef.current) {
          lampsRef.current.style.transform = `translate3d(0,${
            -progress * (LAMP_COUNT - 1) * LAMP_GAP * vh
          }px,0)`;
        }
      }

      // 커서 랜턴 — 스프링 지연 추적
      if (!coarse && !reduced && cursorRef.current && mouseX > -9000) {
        lightX += (mouseX - lightX) * 0.12 * dt;
        lightY += (mouseY - lightY) * 0.12 * dt;
        cursorRef.current.style.transform = `translate3d(${lightX}px,${lightY}px,0) translate(-50%,-50%)`;
        cursorRef.current.style.opacity = "1";
      }

      // 반딧불
      if (ctx && !reduced) {
        ctx.clearRect(0, 0, vw, vh);
        // shadow 는 그리기 **전에** 걸어야 첫 마리부터 발광한다
        // (원본 시안은 draw 끝에 설정해 한 박자씩 밀렸다)
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#ff9d38";
        for (const f of flies) {
          f.angle += f.speed * dt;
          f.x += Math.sin(f.angle) * 1.6 * dt;
          f.y += Math.cos(f.angle * 0.5) * 1.1 * dt;

          // 커서 쪽으로 **아주 천천히** 끌려온다. 급하게 끌어당기면
          // 벌레가 아니라 자석이 된다.
          const dx = mouseX - f.x;
          const dy = mouseY - f.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 240 && dist > 1) {
            const pull = 0.016 * (1 - dist / 240) * dt;
            f.x += dx * pull;
            f.y += dy * pull;
          }

          // 스크롤하면 뒤로 끌려간다
          f.y -= speed * 0.35 * dt;

          // 화면을 벗어나면 반대편에서 다시 들어온다
          if (f.y < -40) f.y = vh + 40;
          if (f.y > vh + 40) f.y = -40;
          if (f.x < -40) f.x = vw + 40;
          if (f.x > vw + 40) f.x = -40;

          f.blink += f.blinkSpeed * dt;
          const alpha = 0.25 + (Math.sin(f.blink) + 1) * 0.32;
          ctx.fillStyle = `rgba(255, 157, 56, ${alpha})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      // `forest-world` 는 스타일이 아니라 **인쇄 때 숨기기 위한 손잡이**다
      // (ResumeTerminal.css 의 @media print). Tailwind 유틸리티만으로는
      // 바깥에서 이 겹을 지목할 방법이 없다.
      className="forest-world pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* ① 하늘 — 유일하게 안 움직이는 겹. 색만 스크롤로 변한다 */}
      <div ref={skyRef} className="absolute inset-0" />

      {/* ② 먼 숲 — 능선처럼 낮고 성긴 실루엣 */}
      <Layer ref={farRef} travel={TRAVEL.far} opacity={0.55}>
        <TreeBand
          count={26}
          minH={90}
          maxH={190}
          fill="#050a14"
          baseline={0.62}
        />
      </Layer>

      {/* ③ 안개 — 가로로 흐르는 띠 몇 겹. 진행할수록 옅어진다 */}
      <Layer ref={fogRef} travel={TRAVEL.fog} opacity={0.5} blur={26}>
        <FogBands />
      </Layer>

      {/* ④ 중간 숲 — 화면을 실제로 채우는 겹 */}
      <Layer ref={midRef} travel={TRAVEL.mid} opacity={0.9}>
        <TreeBand
          count={18}
          minH={220}
          maxH={420}
          fill="#04080f"
          baseline={0.98}
        />
      </Layer>

      {/* ⑤ 지나가는 등불 — 걷다 보면 하나씩 스친다 */}
      <div
        ref={lampsRef}
        className="absolute inset-x-0 top-0 will-change-transform"
        style={{height: `${100 + (LAMP_COUNT - 1) * LAMP_GAP * 100}vh`}}
      >
        {Array.from({length: LAMP_COUNT}, (_, i) => (
          <Lamp index={i} key={i} />
        ))}
      </div>

      {/* ⑥ 눈앞의 잎 — 가장 빠르고, 스크롤 속도에 따라 눕는다 */}
      <Layer ref={frontRef} travel={TRAVEL.front} opacity={0.9}>
        <FrontLeaves />
      </Layer>

      {/* 반딧불 */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 커서 랜턴 — 어두운 바탕 위에서 '빛'으로 얹히려면 screen 합성이어야 한다 */}
      <div
        ref={cursorRef}
        className="absolute left-0 top-0 h-[620px] w-[620px] rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(255,157,56,0.10) 0%, rgba(255,157,56,0.04) 38%, transparent 70%)",
          mixBlendMode: "screen"
        }}
      />
    </div>
  );
}

/**
 * 시차 겹 하나.
 *
 * 높이를 `100% + travel` 로 잡는 게 핵심이다 — 그래야 위로 밀어 올려도
 * 아래쪽에 그릴 게 남아 있어 겹이 비지 않는다.
 */
const Layer = ({
  ref,
  travel,
  opacity,
  blur,
  children
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  travel: number;
  opacity: number;
  blur?: number;
  children: React.ReactNode;
}) => (
  <div
    ref={ref}
    className="absolute inset-x-0 top-0 will-change-transform"
    style={{
      height: `${100 + travel * 100}vh`,
      opacity,
      filter: blur ? `blur(${blur}px)` : undefined
    }}
  >
    {children}
  </div>
);

/**
 * 침엽수 실루엣 띠.
 *
 * 나무를 이미지로 두지 않고 그 자리에서 만든다 — 파일이 늘지 않고, 겹마다
 * 밀도·높이만 바꿔 다르게 보이게 할 수 있다. 시드를 고정해 매 렌더 같은
 * 숲이 나오게 한다(안 그러면 리렌더마다 숲이 바뀐다).
 */
function TreeBand({
  count,
  minH,
  maxH,
  fill,
  baseline
}: {
  count: number;
  minH: number;
  maxH: number;
  fill: string;
  baseline: number;
}) {
  const trees: string[] = [];
  let seed = count * 977 + minH;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const W = 1000;
  const H = 1000;
  const groundY = H * baseline;
  for (let i = 0; i < count; i += 1) {
    const x = (i / (count - 1)) * W + (rand() - 0.5) * (W / count) * 0.9;
    const h = minH + rand() * (maxH - minH);
    const w = h * (0.34 + rand() * 0.16);
    // 삼각형 세 겹을 쌓아 전나무 실루엣을 만든다
    const tiers = 3;
    for (let t = 0; t < tiers; t += 1) {
      const ty = groundY - h * (0.28 + t * 0.26);
      const tw = w * (1 - t * 0.24);
      const th = h * 0.42;
      trees.push(
        `M${x - tw / 2},${ty} L${x},${ty - th} L${x + tw / 2},${ty} Z`
      );
    }
    trees.push(
      `M${x - w * 0.06},${groundY} L${x - w * 0.06},${groundY - h * 0.3} L${
        x + w * 0.06
      },${groundY - h * 0.3} L${x + w * 0.06},${groundY} Z`
    );
  }
  return (
    <svg
      className="h-full w-full"
      preserveAspectRatio="none"
      viewBox={`0 0 ${W} ${H}`}
    >
      <path
        d={`M0,${groundY} L${W},${groundY} L${W},${H} L0,${H} Z`}
        fill={fill}
      />
      <path d={trees.join(" ")} fill={fill} />
    </svg>
  );
}

/** 안개 — 가로로 긴 띠 몇 개. blur 는 Layer 쪽에서 건다. */
function FogBands() {
  return (
    <svg
      className="h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 1000 1000"
    >
      {[180, 360, 540, 720, 880].map((y, i) => (
        <ellipse
          cx={i % 2 === 0 ? 380 : 640}
          cy={y}
          fill="rgba(169,189,214,0.16)"
          key={y}
          rx={620 - i * 40}
          ry={34 + i * 6}
        />
      ))}
    </svg>
  );
}

/**
 * 눈앞의 잎 — 화면 **가장자리에만** 둔다.
 * 가운데를 덮으면 읽는 걸 방해한다. 분위기가 가독성을 이기면 안 된다.
 *
 * **한 장짜리 SVG 를 겹 전체에 늘리면 안 된다.** 이 겹은 225vh 높이라
 * `preserveAspectRatio="none"` 으로 늘리면 잎이 세로로 두 배 넘게 뭉개져
 * 화면 위쪽에 커다란 검은 얼룩으로 보인다(실제로 그렇게 나왔다).
 * 그래서 **고정 크기 가지 여러 개**를 좌우 번갈아 흩어 둔다.
 */
const LEAF_SPRIGS = 7;

function FrontLeaves() {
  return (
    <>
      {Array.from({length: LEAF_SPRIGS}, (_, i) => {
        const left = i % 2 === 0;
        return (
          <svg
            className="absolute"
            height={190}
            key={i}
            style={{
              top: `${6 + i * 15}%`,
              [left ? "left" : "right"]: `${-3 + ((i * 5) % 7)}%`,
              transform: left ? undefined : "scaleX(-1)"
            }}
            viewBox="0 0 260 190"
            width={260}
          >
            <g fill="#03070d">
              {/* 늘어진 가지 하나 + 잎 세 장 */}
              <path d="M-10,8 C60,26 108,62 128,112 C104,74 58,44 -10,32 Z" />
              <path d="M22,30 C58,22 92,44 104,80 C74,58 46,44 22,42 Z" />
              <path d="M62,66 C96,64 122,92 128,126 C104,100 82,84 60,78 Z" />
              <path d="M-10,52 C42,62 78,92 92,132 C68,102 34,78 -10,70 Z" />
            </g>
          </svg>
        );
      })}
    </>
  );
}

/** 길가 등불 하나. 좌우를 번갈아 세우고, 저마다 다른 위상으로 흔들린다. */
function Lamp({index}: {index: number}) {
  const left = index % 2 === 0;
  return (
    <div
      className="absolute"
      style={{
        top: `${index * LAMP_GAP * 100 + 18}vh`,
        [left ? "left" : "right"]: `${6 + ((index * 7) % 9)}%`,
        animation: `forest-sway ${5.5 + (index % 4) * 0.9}s ease-in-out ${
          index * 0.4
        }s infinite`,
        transformOrigin: "top center"
      }}
    >
      {/* 매다는 줄 */}
      <div className="mx-auto h-[120px] w-px bg-[rgb(var(--v-wood))]" />
      {/* 등불 몸통 */}
      <div className="relative mx-auto h-[42px] w-[28px] rounded-[5px] border border-[rgb(var(--v-wood))] bg-[rgb(var(--v-night))] shadow-[inset_0_0_16px_rgba(255,157,56,0.35)]">
        {/* 빛 — screen 합성이라야 뒤 숲 위에 빛으로 얹힌다 */}
        <div
          className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,157,56,0.55) 0%, rgba(255,157,56,0.16) 35%, transparent 70%)",
            filter: "blur(8px)",
            mixBlendMode: "screen",
            animation: `forest-breathe ${
              4.2 + (index % 5) * 0.7
            }s ease-in-out infinite`
          }}
        />
      </div>
    </div>
  );
}
