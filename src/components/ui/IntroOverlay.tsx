"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue
} from "framer-motion";
import {useEffect, useRef, useState} from "react";
import {projects} from "@/data/projects";
import {autonomousNpcs} from "@/data/npcRoster";
import {villageBuildings} from "@/lib/constants";
import {sfx} from "@/lib/sfx";
import type {ExplorationMode} from "@/types/portfolio";

interface IntroOverlayProps {
  onStart: (mode: ExplorationMode) => void;
  onResume: () => void;
}

// ─── 디코딩(스크램블) 텍스트 ──────────────────────────────────────────────────
const SCRAMBLE = "0123456789<>/\\[]{}#$%&ABCDEFXYZ아주개발";
// active가 true가 되면 한 글자씩 쳐지고, 끝나면 onDone 호출.
// 속도를 ±35% 흔들어(휴먼라이즈드) 사람이 치는 리듬을 만들고, 글자마다 틱음.
// caret: "typing" = 치는 동안만 캐럿 / "always" = 활성 후 계속 깜빡임 / "none"
function Typewriter({
  text,
  active,
  speed = 55,
  caret = "none",
  onDone
}: {
  text: string;
  active: boolean;
  speed?: number;
  caret?: "typing" | "always" | "none";
  onDone?: () => void;
}) {
  const [n, setN] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    doneRef.current = false;
    setN(0);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      i += 1;
      setN(i);
      // 공백이 아닌 글자에서만 키 입력음
      if (text[i - 1] && text[i - 1] !== " ") sfx.tick();
      if (i >= text.length) {
        if (!doneRef.current) {
          doneRef.current = true;
          onDoneRef.current?.();
        }
        return;
      }
      // 휴먼라이즈드: 다음 글자까지 텀을 매번 다르게 + 가끔 더 긴 멈칫
      const jitter = speed * (0.65 + Math.random() * 0.7);
      const hesitate = Math.random() < 0.08 ? speed * 2.2 : 0;
      timer = setTimeout(step, jitter + hesitate);
    };
    timer = setTimeout(step, speed);
    return () => clearTimeout(timer);
  }, [active, text, speed]);

  const typing = active && n < text.length;
  const showCaret =
    caret === "always" ? active : caret === "typing" ? typing : false;

  return (
    <>
      {active ? text.slice(0, n) : ""}
      {showCaret ? (
        <span
          className="ml-0.5 inline-block w-[0.5ch] animate-pulse rounded-[1px] bg-[#ffbe7a] align-middle"
          style={{height: "0.82em", boxShadow: "0 0 10px #ffbe7a"}}
        />
      ) : null}
    </>
  );
}

function ScrambleUnused({
  text,
  delay = 0,
  speed = 42
}: {
  text: string;
  delay?: number;
  speed?: number;
}) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let raf = 0;
    const total = text.length * speed + 300;
    const start = performance.now();
    function tick(now: number) {
      const e = now - start - delay;
      if (e < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(e / total, 1);
      const reveal = p * text.length;
      let s = "";
      for (let i = 0; i < text.length; i += 1) {
        if (text[i] === " ") s += " ";
        else if (i < reveal) s += text[i];
        else s += SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setOut(text);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay, speed]);
  return <>{out || " "}</>;
}

// ─── 마우스 트레일 (캔버스 혜성 꼬리) ─────────────────────────────────────────
function TrailCanvas({
  mx,
  my,
  stageRef
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  stageRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    // 동작 줄이기 설정이면 꼬리 연출 자체를 끈다 (캔버스 RAF는 CSS 미디어쿼리가 못 잡는다)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const r = stage!.getBoundingClientRect();
      canvas!.width = r.width;
      canvas!.height = r.height;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    let raf = 0;
    let last: {x: number; y: number} | null = null;
    function loop() {
      const w = canvas!.width;
      const h = canvas!.height;
      const x = (mx.get() / 100) * w;
      const y = (my.get() / 100) * h;

      // 기존 꼬리를 점점 투명하게 (배경 색칠 X)
      ctx!.globalCompositeOperation = "destination-out";
      ctx!.fillStyle = "rgba(0,0,0,0.085)";
      ctx!.fillRect(0, 0, w, h);

      // 글로우 추가
      ctx!.globalCompositeOperation = "lighter";
      if (last) {
        ctx!.strokeStyle = "rgba(255,190,122,0.32)";
        ctx!.lineWidth = 2.5;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(last.x, last.y);
        ctx!.lineTo(x, y);
        ctx!.stroke();
      }
      const g = ctx!.createRadialGradient(x, y, 0, x, y, 14);
      g.addColorStop(0, "rgba(255,190,122,0.5)");
      g.addColorStop(1, "rgba(255,190,122,0)");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(x, y, 14, 0, Math.PI * 2);
      ctx!.fill();

      last = {x, y};
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mx, my, stageRef]);
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1]"
    />
  );
}

// ─── 커서 자력 반응형 입자 필드 (캔버스) ──────────────────────────────────────
// 커서 근처 입자는 살짝 밀려나고, 멀어지면 원위치로 복귀한다.
function ParticleField({
  mx,
  my,
  stageRef
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  stageRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    // 동작 줄이기 설정이면 입자 부유 연출을 끈다
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    type P = {
      hx: number;
      hy: number;
      x: number;
      y: number;
      r: number;
      ph: number;
      sp: number;
    };
    let pts: P[] = [];

    function seed() {
      const r = stage!.getBoundingClientRect();
      W = canvas!.width = r.width;
      H = canvas!.height = r.height;
      pts = Array.from({length: 30}, () => {
        const hx = Math.random() * W;
        const hy = Math.random() * H;
        return {
          hx,
          hy,
          x: hx,
          y: hy,
          r: 0.8 + Math.random() * 2.2,
          ph: Math.random() * 6.28,
          sp: 0.4 + Math.random() * 0.7
        };
      });
    }
    seed();
    const ro = new ResizeObserver(seed);
    ro.observe(stage);

    let raf = 0;
    let t = 0;
    function loop() {
      t += 1 / 60;
      ctx!.clearRect(0, 0, W, H);
      const cx = (mx.get() / 100) * W;
      const cy = (my.get() / 100) * H;
      for (const p of pts) {
        // 기준점 주변을 천천히 부유
        const baseX = p.hx + Math.sin(t * p.sp + p.ph) * 10;
        const baseY = p.hy + Math.cos(t * p.sp * 0.8 + p.ph) * 10;
        // 커서 자력(밀어냄)
        const dx = baseX - cx;
        const dy = baseY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const force = Math.max(0, 1 - dist / 150);
        const tx = baseX + (dx / dist) * force * 42;
        const ty = baseY + (dy / dist) * force * 42;
        p.x += (tx - p.x) * 0.12;
        p.y += (ty - p.y) * 0.12;
        const alpha = 0.12 + force * 0.4;
        ctx!.fillStyle = `rgba(255,205,150,${alpha})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r + force * 1.4, 0, 6.28);
        ctx!.fill();
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mx, my, stageRef]);
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1]"
    />
  );
}

// ─── 마을 미술 조각 (SVG 근사치) ─────────────────────────────────────────────
// 손으로 그린 에셋이 들어오기 전까지 쓰는 대역이다. 실제 그림이 오면 각
// 컴포넌트의 <svg> 를 <img src="/ui/…" /> 로 바꾸기만 하면 되도록, 크기는
// 전부 바깥에서 className 으로 정하게 해 뒀다.

// 현판을 타고 오르는 담쟁이
function VineSprig({className, flip}: {className?: string; flip?: boolean}) {
  const leaves = [
    {x: 18, y: 13, r: -30, s: 1},
    {x: 40, y: 25, r: 16, s: 0.86},
    {x: 58, y: 37, r: -20, s: 1.06},
    {x: 76, y: 57, r: 28, s: 0.8},
    {x: 97, y: 72, r: -10, s: 0.92}
  ];
  return (
    <svg
      viewBox="0 0 120 84"
      aria-hidden="true"
      className={className}
      style={flip ? {transform: "scaleX(-1)"} : undefined}
    >
      <defs>
        <linearGradient id="vLeafGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#83a857" />
          <stop offset="1" stopColor="#3c5a29" />
        </linearGradient>
      </defs>
      <path
        d="M6 8 C 34 14 58 32 74 56 C 84 70 98 76 116 78"
        fill="none"
        stroke="#4b6634"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {leaves.map((l, i) => (
        <path
          key={i}
          d="M0 0 C 7 -11 22 -13 27 -2 C 22 9 7 11 0 0 Z"
          fill="url(#vLeafGrad)"
          transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}
        />
      ))}
      <circle cx="31" cy="7" r="3.4" fill="#edd0dc" />
      <circle cx="31" cy="7" r="1.3" fill="#f7e6a4" />
      <circle cx="89" cy="65" r="2.9" fill="#edd0dc" />
      <circle cx="89" cy="65" r="1.1" fill="#f7e6a4" />
    </svg>
  );
}

// 현판 옆에 매달린 랜턴 — 마을 램프와 같은 호박색으로 깜빡인다
function HangingLantern({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 34 76" aria-hidden="true" className={className}>
      <circle
        cx="17"
        cy="33"
        r="15"
        fill="#ff9d38"
        opacity="0.2"
        className="v-lantern-glow"
      />
      <path d="M17 0 V17" stroke="#6b5a3a" strokeWidth="2" />
      <path d="M9 17 H25 L23 23 H11 Z" fill="#5b4526" />
      <rect x="10" y="23" width="14" height="20" rx="2" fill="#3a2a16" />
      <rect
        x="12.2"
        y="25"
        width="9.6"
        height="16"
        rx="1.6"
        fill="#ffbe72"
        className="v-lantern-glow"
      />
      <path d="M11 43 H23 L21 48 H13 Z" fill="#5b4526" />
      <path d="M17 48 V53" stroke="#6b5a3a" strokeWidth="1.6" />
    </svg>
  );
}

// 좌상단 문장(紋章) — 나침반 장미
function CompassBadge({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="8"
        fill="#3d2a16"
        stroke="#b8892f"
        strokeWidth="1.6"
      />
      <circle cx="24" cy="24" r="15" fill="#1c2c44" />
      <path
        d="M24 8 L27.4 20.6 L40 24 L27.4 27.4 L24 40 L20.6 27.4 L8 24 L20.6 20.6 Z"
        fill="#e6c47c"
      />
      <path d="M24 12 L26 22 L24 24 L22 22 Z" fill="#fdf1cd" />
      <circle cx="24" cy="24" r="2.6" fill="#3d2a16" />
    </svg>
  );
}

const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round"
} as const;

// 건물을 클릭한다
function IconHouseClick({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M5 15 L16 6 L27 15" {...LINE} />
      <path d="M8 14 V25 H24 V14" {...LINE} />
      <path d="M14 25 V19 H18 V25" {...LINE} />
      <path
        d="M20 20 L27 23.5 L23.8 24.6 L25.6 28 L23.8 29 L22 25.6 L19.8 27.6 Z"
        fill="currentColor"
      />
    </svg>
  );
}

// 후드 쓴 안내인에게 묻는다
function IconNpcAsk({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M8 27 C8 20 11 17 14 17 C17 17 20 20 20 27" {...LINE} />
      <path d="M14 17 C10 17 8.5 13 9.5 10 C10.4 7.4 13 6 15 6.4" {...LINE} />
      <circle cx="14.6" cy="12.4" r="1.1" fill="currentColor" />
      <path d="M21 6 H29 V13 H25 L22.5 16 V13 H21 Z" {...LINE} />
      <path d="M24 9.4 H26.4" {...LINE} />
      <path d="M24 11.2 H27.6" {...LINE} />
    </svg>
  );
}

// 깃펜 꽂힌 기록부
function IconBookQuill({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path
        d="M16 10 C13 7.6 8.6 7.4 5 8.4 V24 C8.6 23 13 23.2 16 25.6"
        {...LINE}
      />
      <path d="M16 10 C19 7.6 23.4 7.4 27 8.4 V17" {...LINE} />
      <path d="M16 10 V25.6" {...LINE} />
      <path
        d="M29 15 C25 17.5 22 20.5 20.5 25 L23 24 L26 20 Z"
        fill="currentColor"
      />
      <path d="M20.5 25 L18.5 27.5" {...LINE} />
    </svg>
  );
}

// 펼친 지도 — 마을로 입장
function IconMap({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M4 9 L12 6 L20 9 L28 6 V23 L20 26 L12 23 L4 26 Z" {...LINE} />
      <path d="M12 6 V23" {...LINE} />
      <path d="M20 9 V26" {...LINE} />
      <circle cx="16.2" cy="14.6" r="2.2" fill="currentColor" />
      <path d="M7 13 L9.5 15.6" {...LINE} />
      <path d="M23 18.4 L25.6 16" {...LINE} />
    </svg>
  );
}

// 두루마리 — 빠른 이력서
function IconScroll({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path
        d="M9 7 H24 C22.6 8.4 22.6 10 24 11.4 V25 C24 27 22.4 27.6 21 27.6 H10"
        {...LINE}
      />
      <path d="M9 7 C7 7 6.4 8.6 6.4 10 C6.4 11.4 7.6 12 9 12 H12" {...LINE} />
      <path d="M10 27.6 C8 27.6 7.4 26 7.4 24.6 H14" {...LINE} />
      <path d="M12.5 15.4 H20" {...LINE} />
      <path d="M12.5 19 H20" {...LINE} />
    </svg>
  );
}

// 하단 상태바 아이콘
function IconStack({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 3 L21 7.5 L12 12 L3 7.5 Z" {...LINE} />
      <path d="M4.6 12 L12 15.8 L19.4 12" {...LINE} />
      <path d="M4.6 16.5 L12 20.3 L19.4 16.5" {...LINE} />
    </svg>
  );
}

function IconPeople({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="9.4" cy="8.6" r="3.2" {...LINE} />
      <path
        d="M3.6 19.6 C3.6 15.8 6.2 14 9.4 14 C12.6 14 15.2 15.8 15.2 19.6"
        {...LINE}
      />
      <path
        d="M16 6.2 C18.2 6.2 19.6 7.8 19.6 9.6 C19.6 11.4 18.2 12.6 16.4 12.6"
        {...LINE}
      />
      <path d="M17.4 14.6 C19.6 15.2 20.8 17 20.8 19.6" {...LINE} />
    </svg>
  );
}

function IconVillage({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M3 12 L8 7.4 L13 12" {...LINE} />
      <path d="M4.8 11 V19.4 H11.2 V11" {...LINE} />
      <path d="M13 19.4 V10 L17.6 6.4 L21 9.2 V19.4" {...LINE} />
      <path d="M2.4 19.6 H21.8" {...LINE} />
    </svg>
  );
}

// 첫 화면 안내 카드 — 리본 색은 구역 색이 아니라 순서를 구분하는 용도다
const STEP_CARDS = [
  {
    title: "건물 클릭",
    body: "클릭하면 바로 프로젝트 전시실로 입장",
    band: "linear-gradient(180deg,#3a6ea8 0%,#24466f 100%)",
    Icon: IconHouseClick
  },
  {
    title: "NPC 질문",
    body: "프로젝트·기술·연락처를 대화로 확인",
    band: "linear-gradient(180deg,#4e7d46 0%,#2d4c29 100%)",
    Icon: IconNpcAsk
  },
  {
    title: "Admin 기록",
    body: "오늘 활동을 마을 상태로 반영",
    band: "linear-gradient(180deg,#6b4f96 0%,#402e5e 100%)",
    Icon: IconBookQuill
  }
] as const;

// 하단 상태바 — 전부 실제 데이터에서 센다 (지어낸 숫자를 걸지 않는다)
const VILLAGE_STATS = [
  {label: "PROJECTS", value: projects.length, Icon: IconStack},
  {label: "NPC", value: autonomousNpcs.length, Icon: IconPeople},
  {label: "건물", value: villageBuildings.length, Icon: IconVillage}
] as const;

// ─── 마그네틱 래퍼: 커서가 가까우면 요소가 끌려온다 ───────────────────────────
function Magnetic({
  children,
  strength = 0.35,
  className
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mvx = useMotionValue(0);
  const mvy = useMotionValue(0);
  const x = useSpring(mvx, {stiffness: 250, damping: 18});
  const y = useSpring(mvy, {stiffness: 250, damping: 18});
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mvx.set((e.clientX - (r.left + r.width / 2)) * strength);
    mvy.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    mvx.set(0);
    mvy.set(0);
  }
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{x, y}}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}

// ─── 3D 틸트 카드: 커서 위치 따라 기울고 표면에 광택이 흐른다 ──────────────────
function TiltCard({children}: {children: React.ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), {stiffness: 200, damping: 16});
  const ry = useSpring(useMotionValue(0), {stiffness: 200, damping: 16});
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const gloss = useMotionTemplate`radial-gradient(circle 120px at ${gx}% ${gy}%, rgba(255,190,122,0.16), transparent 70%)`;
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 12);
    rx.set((0.5 - py) * 12);
    gx.set(px * 100);
    gy.set(py * 100);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="v-wood relative overflow-hidden"
      style={{rotateX: rx, rotateY: ry, transformPerspective: 600}}
      whileHover={{boxShadow: "0 22px 44px rgba(0,0,0,0.6)"}}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{background: gloss}}
      />
      <div className="relative z-[2]" style={{transform: "translateZ(20px)"}}>
        {children}
      </div>
    </motion.div>
  );
}

// ─── 상단 ONLINE 시계 칩 ──────────────────────────────────────────────────────
function ClockChip() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      try {
        setTime(
          new Date().toLocaleTimeString("en-GB", {
            timeZone: "Asia/Seoul",
            hour12: false
          })
        );
      } catch {
        setTime(new Date().toLocaleTimeString());
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-[#e2c078]/20 bg-[#0b1626]/60 px-3.5 py-1.5 font-mono text-[11px] backdrop-blur-md">
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6fe0a8]"
        style={{boxShadow: "0 0 8px #6fe0a8"}}
      />
      <span className="tracking-[0.12em] text-[#a9bdd6]">ONLINE</span>
      <span className="text-[#5a6678]">·</span>
      <span className="tracking-[0.1em] text-[#f3e6c8]">{time} KST</span>
    </div>
  );
}

export function IntroOverlay({onStart, onResume}: IntroOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [muted, setMuted] = useState(false);
  // 부팅 타이핑 단계: 0 라벨 → 1 제목1 → 2 제목2 → 3 부제 → 4 나머지 reveal
  const [bootStep, setBootStep] = useState(0);
  const revealed = bootStep >= 4;
  const stageRef = useRef<HTMLDivElement>(null);

  // 마우스 추적 (0~100%)
  const mx = useMotionValue(50);
  const my = useMotionValue(42);
  const sx = useSpring(mx, {stiffness: 120, damping: 22});
  const sy = useSpring(my, {stiffness: 120, damping: 22});

  // 랜턴 불빛 글로우 (마을 램프와 같은 호박색)
  const glow = useMotionTemplate`radial-gradient(circle 300px at ${sx}% ${sy}%, rgba(255,157,56,0.11), transparent 70%)`;
  // 패럴랙스 (콘텐츠가 커서 반대로 살짝)
  const px = useTransform(sx, [0, 100], [14, -14]);
  const py = useTransform(sy, [0, 100], [10, -10]);
  // 커서 따라가는 링 위치 (스프링 — 부드럽게 따라옴)
  const ringLeft = useMotionTemplate`${sx}%`;
  const ringTop = useMotionTemplate`${sy}%`;
  // 즉시 추적 커서 점 위치 (스프링 없이 raw)
  const dotLeft = useMotionTemplate`${mx}%`;
  const dotTop = useMotionTemplate`${my}%`;

  function handleMove(e: React.MouseEvent) {
    if (!stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  }

  function handleStart(mode: ExplorationMode) {
    if (isExiting) return;
    sfx.enter();
    // 입장 효과음 뒤로 잔잔한 앰비언트 드론을 깔아 마을로 이어준다
    setTimeout(() => sfx.startAmbient(), 700);
    setIsExiting(true);
    setTimeout(() => onStart(mode), 620);
  }

  function handleResume() {
    if (isExiting) return;
    sfx.click();
    onResume();
  }

  function toggleMute() {
    setMuted(m => {
      const next = !m;
      sfx.setMuted(next);
      return next;
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={isExiting ? "exit" : "visible"}
        className="pointer-events-auto absolute inset-0 z-20 flex flex-col"
        initial="hidden"
        variants={{hidden: {}, visible: {}, exit: {}}}
      >
        <motion.div
          ref={stageRef}
          animate={{opacity: isExiting ? 0 : 1}}
          className="relative flex h-full w-full flex-col justify-center overflow-hidden pb-12 pt-[65px] [cursor:none]"
          initial={{opacity: 0}}
          onMouseMove={handleMove}
          transition={{duration: isExiting ? 0.4 : 0.5, ease: "easeInOut"}}
        >
          {/* 마을은 가리지 않는다 — 글자가 앉는 왼쪽만 숲 그늘처럼 어둡게 깔고
              오른쪽은 열어 둬서 마을 자체가 첫 화면의 주인공이 되게 한다 */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(5,10,20,0.96) 0%, rgba(5,10,20,0.93) 30%, rgba(5,10,20,0.7) 47%, rgba(5,10,20,0.28) 62%, rgba(5,10,20,0.1) 78%, rgba(5,10,20,0.3) 100%)"
            }}
          />
          {/* 위아래 비네트 — 상태바·시계가 앉을 자리를 만든다 */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(4,9,18,0.8) 0%, transparent 15%, transparent 74%, rgba(4,9,18,0.88) 100%)"
            }}
          />
          {/* 랜턴 불빛 글로우 — 격자는 뺐다: 기술 도면이 아니라 밤 들판이니까 */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{background: glow}}
          />
          <ParticleField mx={mx} my={my} stageRef={stageRef} />
          <TrailCanvas mx={mx} my={my} stageRef={stageRef} />

          {/* 상단바: ONLINE 시계 칩(중앙) + 음소거(우측) */}
          <div className="pointer-events-none absolute left-1/2 top-5 z-[3] -translate-x-1/2">
            <ClockChip />
          </div>
          <button
            type="button"
            onClick={toggleMute}
            className="absolute right-5 top-5 z-[3] flex h-9 w-9 items-center justify-center rounded-full border border-[#e2c078]/30 bg-[#0b1626]/70 text-sm text-[#e2c078]/90 transition hover:border-[#e2c078]/70 hover:text-[#ffd9ae]"
            aria-label={muted ? "사운드 켜기" : "사운드 끄기"}
          >
            {muted ? "🔇" : "🔊"}
          </button>

          {/* 커서 따라가는 미리보기 안내 링 */}
          <motion.div
            className="pointer-events-none absolute z-[1] flex items-center justify-center"
            style={{left: ringLeft, top: ringTop, x: "-50%", y: "-50%"}}
          >
            <motion.div
              className="rounded-full border border-[#ffbe7a]/25"
              style={{width: 220, height: 220}}
              animate={{scale: [1, 1.08, 1], opacity: [0.2, 0.42, 0.2]}}
              transition={{duration: 2.4, repeat: Infinity, ease: "easeInOut"}}
            />
          </motion.div>

          {/* 커스텀 링 커서: 바깥 링(부드럽게 따라옴) + 안쪽 점(즉시 추적) */}
          <motion.div
            className="pointer-events-none absolute z-[6] rounded-full border border-[#ffbe7a]/70"
            style={{
              left: ringLeft,
              top: ringTop,
              x: "-50%",
              y: "-50%",
              width: 26,
              height: 26
            }}
            animate={{scale: [1, 1.12, 1]}}
            transition={{duration: 1.8, repeat: Infinity, ease: "easeInOut"}}
          />
          <motion.div
            className="pointer-events-none absolute z-[6] rounded-full bg-[#ffbe7a]"
            style={{
              left: dotLeft,
              top: dotTop,
              x: "-50%",
              y: "-50%",
              width: 5,
              height: 5,
              boxShadow: "0 0 8px #ffbe7a"
            }}
          />

          <motion.div
            className="relative z-[2] w-full px-6 md:px-12 lg:w-[56%] lg:pl-20 lg:pr-4"
            style={{x: px, y: py}}
          >
            {/* 문장 + 리본: 마을 이름표 */}
            <div
              className="flex items-center gap-3"
              style={{filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.55))"}}
            >
              <CompassBadge className="h-11 w-11 shrink-0" />
              <div className="v-ribbon v-wood px-6 py-1.5">
                <span className="block min-h-[14px] text-[11px] font-black tracking-[0.26em] text-[#e2c078]">
                  <Typewriter
                    text="DEVELOPER'S CITY · 2026"
                    active
                    speed={26}
                    onDone={() => setBootStep(s => Math.max(s, 1))}
                  />
                </span>
              </div>
            </div>

            {/* 제목 현판 — 덩굴이 감고 랜턴이 걸린 나무 간판 */}
            <div className="relative mt-4 inline-block">
              <VineSprig className="pointer-events-none absolute -left-7 -top-8 z-[3] w-28 md:w-32" />
              <VineSprig
                className="pointer-events-none absolute -bottom-9 -right-9 z-[3] w-24 md:w-28"
                flip
              />
              <HangingLantern className="pointer-events-none absolute -left-9 top-6 z-[3] h-[4.6rem]" />
              <div className="v-wood v-wood-inset px-8 py-5 md:px-11 md:py-6">
                <span className="v-corner left-2.5 top-2.5" />
                <span className="v-corner right-2.5 top-2.5" />
                <span className="v-corner bottom-2.5 left-2.5" />
                <span className="v-corner bottom-2.5 right-2.5" />
                {/* 화면이 낮으면 제목도 같이 줄어든다 — 현판이 헤더 뒤로 잘리지 않게 */}
                <h1
                  className="v-serif v-emboss relative leading-[1.22]"
                  style={{fontSize: "clamp(1.72rem, min(3.1vw, 5vh), 2.95rem)"}}
                >
                  <Typewriter
                    text="정재훈의 3D"
                    active={bootStep >= 1}
                    speed={70}
                    caret="typing"
                    onDone={() => setBootStep(s => Math.max(s, 2))}
                  />
                  <br />
                  <Typewriter
                    text="포트폴리오 마을"
                    active={bootStep >= 2}
                    speed={70}
                    caret="always"
                    onDone={() => setBootStep(s => Math.max(s, 3))}
                  />
                </h1>
              </div>
            </div>

            {/* 부제 리본 */}
            <div
              className="mt-4 block w-fit"
              style={{filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.5))"}}
            >
              <div
                className="v-ribbon px-8 py-1.5"
                style={{
                  background:
                    "linear-gradient(180deg,#33629b 0%,#1f4270 58%,#16304f 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)"
                }}
              >
                <span className="v-serif block min-h-[20px] text-[15px] tracking-[0.12em] text-[#ecdfba] md:text-lg">
                  <Typewriter
                    text="Fullstack / 3D / Game / XR"
                    active={bootStep >= 3}
                    speed={22}
                    onDone={() => setBootStep(s => Math.max(s, 4))}
                  />
                </span>
              </div>
            </div>

            {/* 부제 타이핑이 끝나면(revealed) 나머지가 한 번에 떠오른다 */}
            <motion.div
              animate={revealed ? {opacity: 1, y: 0} : {opacity: 0, y: 12}}
              initial={{opacity: 0, y: 12}}
              transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1]}}
              style={{pointerEvents: revealed ? "auto" : "none"}}
            >
              <p
                className="mt-4 max-w-lg text-[13px] leading-[1.7] text-[#d6cdb4]"
                style={{textShadow: "0 2px 6px rgba(0,0,0,0.8)"}}
              >
                먼저 건물을 클릭해 프로젝트 내부로 들어가거나, NPC에게
                프로젝트와 기술에 대해 질문해보세요. 오늘의 관리자 기록은 마을
                조명과 NPC 상태에 반영됩니다.
              </p>

              <div className="mt-5 grid max-w-xl gap-2.5 sm:grid-cols-3">
                {STEP_CARDS.map((step, index) => (
                  <TiltCard key={step.title}>
                    <div className="px-3 pb-3 pt-2.5">
                      <div
                        className="mx-auto w-fit"
                        style={{
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.55))"
                        }}
                      >
                        <div
                          className="v-ribbon px-4 py-0.5"
                          style={{background: step.band}}
                        >
                          <span className="text-[10px] font-black tracking-[0.16em] text-[#f0e6cd]">
                            STEP {index + 1}
                          </span>
                        </div>
                      </div>
                      <p className="v-serif mt-2 text-center text-[15px] text-[#f2dfae]">
                        {step.title}
                      </p>
                      <p className="mt-1 text-center text-[11px] leading-[1.5] text-[#bdb094]">
                        {step.body}
                      </p>
                      <div className="mt-2.5 flex justify-center text-[#e2c078]/80">
                        <step.Icon className="h-8 w-8" />
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </div>

              <div className="mt-5 flex max-w-2xl flex-col gap-2.5 sm:flex-row">
                {/* 메인 CTA — 마을로 입장 (마그네틱) */}
                <Magnetic className="flex-1">
                  <motion.button
                    className="v-wood v-wood-inset group relative w-full px-5 py-4 text-left"
                    onClick={() => handleStart("click")}
                    onMouseEnter={() => sfx.hover()}
                    type="button"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 34px rgba(255,157,56,0.28)"
                    }}
                    whileTap={{scale: 0.97}}
                    transition={{type: "spring", stiffness: 320, damping: 20}}
                  >
                    <span className="v-corner left-2 top-2" />
                    <span className="v-corner bottom-2 right-2" />
                    <span className="relative flex items-center gap-3">
                      <IconMap className="h-9 w-9 shrink-0 text-[#e2c078]" />
                      <span className="min-w-0">
                        <span className="v-serif v-emboss block text-[17px]">
                          마을로 입장하기{" "}
                          <span className="inline-block transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[#bdb094]">
                          프로젝트·기술·경험을 둘러봅니다.
                        </span>
                      </span>
                    </span>
                  </motion.button>
                </Magnetic>

                {/* 면접관용 빠른 길 — 동등하게 강조 (마그네틱) */}
                <Magnetic className="flex-1">
                  <motion.button
                    className="v-wood v-wood-inset group relative w-full px-5 py-4 text-left"
                    onClick={handleResume}
                    onMouseEnter={() => sfx.hover()}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 34px rgba(226,192,120,0.22)"
                    }}
                    whileTap={{scale: 0.97}}
                    transition={{type: "spring", stiffness: 320, damping: 20}}
                    type="button"
                  >
                    <span className="v-corner left-2 top-2" />
                    <span className="v-corner bottom-2 right-2" />
                    <span className="relative flex items-center gap-3">
                      <IconScroll className="h-9 w-9 shrink-0 text-[#e2c078]" />
                      <span className="min-w-0">
                        <span className="v-serif v-emboss block text-[17px]">
                          빠른 이력서 보기{" "}
                          <span className="inline-block transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[#bdb094]">
                          시간이 없다면 — 한 페이지 요약으로.
                        </span>
                      </span>
                    </span>
                  </motion.button>
                </Magnetic>
              </div>

              <p
                className="mt-4 text-[11px] text-[#a99e84]"
                style={{textShadow: "0 2px 5px rgba(0,0,0,0.8)"}}
              >
                마을 안에서{" "}
                <span className="text-[#e2c078]">WASD 직접 이동</span> 모드로
                전환할 수 있어요 ·{" "}
                <span className="text-[#ffd9ae] sm:hidden">
                  모바일은 이력서 보기를 추천
                </span>
              </p>
            </motion.div>
          </motion.div>

          {/* 하단 상태바 — 마을의 규모를 실제 데이터로 보여 준다 */}
          <motion.div
            animate={revealed ? {opacity: 1, y: 0} : {opacity: 0, y: 10}}
            initial={{opacity: 0, y: 10}}
            transition={{duration: 0.6, delay: 0.15}}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[3] flex items-center gap-5 border-t border-[#e2c078]/15 px-6 py-2.5 md:gap-8 md:px-12"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,15,26,0.95) 0%, rgba(8,15,26,0.8) 55%, rgba(8,15,26,0.35) 100%)"
            }}
          >
            {VILLAGE_STATS.map(stat => (
              <span key={stat.label} className="flex items-center gap-2">
                <stat.Icon className="h-4 w-4 shrink-0 text-[#e2c078]/70" />
                <span className="text-[10px] font-black tracking-[0.18em] text-[#a99e84]">
                  {stat.label}
                </span>
                <strong className="v-serif text-sm text-[#f2dfae]">
                  {stat.value}
                </strong>
              </span>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
