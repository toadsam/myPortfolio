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
      className="relative overflow-hidden rounded-lg border border-[#e2c078]/18 bg-[#e2c078]/[0.05] p-4"
      style={{rotateX: rx, rotateY: ry, transformPerspective: 600}}
      whileHover={{
        borderColor: "rgba(226,192,120,0.45)",
        boxShadow: "0 8px 30px rgba(40,26,10,0.45)"
      }}
    >
      <motion.span
        className="pointer-events-none absolute inset-0"
        style={{background: gloss}}
      />
      <div style={{transform: "translateZ(20px)"}}>{children}</div>
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

  // 커서 스포트라이트 — 방문자가 든 '랜턴'. 어두운 막에 구멍을 뚫어 뒤 마을이 드러남
  const revealMask = useMotionTemplate`radial-gradient(circle 210px at ${sx}% ${sy}%, transparent 0%, transparent 26%, black 70%)`;
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
          animate={{height: isExiting ? 0 : "8vh"}}
          className="w-full flex-shrink-0 bg-[#020810]"
          initial={{height: "8vh"}}
          transition={{duration: 0.5, ease: [0.76, 0, 0.24, 1]}}
        />

        <motion.div
          ref={stageRef}
          animate={{opacity: isExiting ? 0 : 1}}
          className="relative flex flex-1 flex-col justify-center overflow-hidden [cursor:none]"
          initial={{opacity: 0}}
          onMouseMove={handleMove}
          transition={{duration: isExiting ? 0.4 : 0.5, ease: "easeInOut"}}
        >
          {/* 어두운 막 — 커서 위치에 구멍이 뚫려 뒤의 살아있는 마을이 드러남 */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(4,8,18,0.985) 0%, rgba(6,11,24,0.965) 60%, rgba(4,9,20,0.94) 100%)",
              WebkitMaskImage: revealMask,
              maskImage: revealMask
            }}
          />
          {/* 드러난 마을을 살짝 덮어 지저분함을 정리하는 상시 스크림 */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 70% 30%, rgba(7,11,19,0.35) 0%, rgba(7,11,19,0.62) 60%, rgba(7,11,19,0.82) 100%)"
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
            className="relative z-[2] px-6 md:px-14"
            style={{x: px, y: py}}
          >
            {/* 라벨 → 제목 → 부제 순서로 타자기처럼 쳐진다 (마을 입구 현판 연출) */}
            <p
              className="min-h-[15px] text-xs font-black uppercase tracking-[0.32em]"
              style={{color: "#e2c078", textShadow: "0 0 12px #e2c07866"}}
            >
              <Typewriter
                text="DEVELOPER'S CITY · 2026"
                active
                speed={26}
                onDone={() => setBootStep(s => Math.max(s, 1))}
              />
            </p>

            <h1
              className="v-panel-title mt-4 max-w-4xl text-4xl leading-tight md:text-7xl"
              style={{textShadow: "0 0 40px rgba(255,157,56,0.32)"}}
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

            <p className="mt-4 min-h-[20px] text-sm font-bold tracking-[0.16em] text-[#a9bdd6]/85 md:text-base">
              <Typewriter
                text="Fullstack / 3D / Game / XR"
                active={bootStep >= 3}
                speed={22}
                onDone={() => setBootStep(s => Math.max(s, 4))}
              />
            </p>

            {/* 부제 타이핑이 끝나면(revealed) 나머지가 한 번에 떠오른다 */}
            <motion.div
              animate={revealed ? {opacity: 1, y: 0} : {opacity: 0, y: 12}}
              initial={{opacity: 0, y: 12}}
              transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1]}}
              style={{pointerEvents: revealed ? "auto" : "none"}}
            >
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#c9d6e8]/80 md:text-base">
                먼저 건물을 클릭해 프로젝트 내부로 들어가거나, NPC에게
                프로젝트와 기술에 대해 질문해보세요. 오늘의 관리자 기록은 마을
                조명과 NPC 상태에 반영됩니다.
              </p>

              <div className="mt-7 grid max-w-3xl gap-3 md:grid-cols-3">
                {[
                  ["1", "건물 클릭", "클릭하면 바로 프로젝트 전시실로 입장"],
                  ["2", "NPC 질문", "프로젝트, 기술, 연락처를 대화로 확인"],
                  ["3", "Admin 기록", "오늘 활동을 마을 상태로 반영"]
                ].map(([index, title, body]) => (
                  <TiltCard key={index}>
                    <span className="text-xs font-black tracking-[0.12em] text-[#e2c078]">
                      STEP {index}
                    </span>
                    <p className="mt-2 text-sm font-black text-[#f3e6c8]">
                      {title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#a9bdd6]/70">
                      {body}
                    </p>
                  </TiltCard>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {/* 메인 CTA — 마을 탐험 시작 (마그네틱) */}
                <Magnetic className="flex-1">
                  <motion.button
                    className="group relative w-full overflow-hidden rounded-xl border border-[#ff9d38]/60 bg-[#ff9d38]/14 px-6 py-5 text-left hover:border-[#ffbe7a] hover:bg-[#ff9d38]/20"
                    onClick={() => handleStart("click")}
                    onMouseEnter={() => sfx.hover()}
                    type="button"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 32px rgba(255,157,56,0.3)"
                    }}
                    whileTap={{scale: 0.97}}
                    transition={{type: "spring", stiffness: 320, damping: 20}}
                  >
                    <span className="flex items-center gap-2 text-base font-black text-[#ffe9d2]">
                      🏘️ 마을 탐험 시작{" "}
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-[#ffd9ae]/80">
                      건물을 클릭해 프로젝트·기술·경험을 둘러봅니다.
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#ffbe7a]/12 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </motion.button>
                </Magnetic>

                {/* 면접관용 빠른 길 — 동등하게 강조 (마그네틱) */}
                <Magnetic className="flex-1">
                  <motion.button
                    className="group relative w-full overflow-hidden rounded-xl border border-[#e2c078]/30 bg-[#e2c078]/[0.07] px-6 py-5 text-left hover:border-[#e2c078]/60 hover:bg-[#e2c078]/[0.12]"
                    onClick={handleResume}
                    onMouseEnter={() => sfx.hover()}
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.97}}
                    transition={{type: "spring", stiffness: 320, damping: 20}}
                    type="button"
                  >
                    <span className="flex items-center gap-2 text-base font-black text-[#f3e6c8]">
                      📄 빠른 이력서 보기{" "}
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-[#a9bdd6]/80">
                      시간이 없다면 — 요약·프로젝트·스킬을 한 페이지로.
                    </span>
                  </motion.button>
                </Magnetic>
              </div>

              <p className="mt-6 text-xs text-[#a9bdd6]/60">
                마을 안에서{" "}
                <span className="text-[#e2c078]/85">WASD 직접 이동</span> 모드로
                전환할 수 있어요 ·{" "}
                <span className="sm:hidden text-[#ffd9ae]/80">
                  모바일은 이력서 보기를 추천
                </span>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{height: isExiting ? 0 : "8vh"}}
          className="w-full flex-shrink-0 overflow-hidden bg-[#020810]"
          initial={{height: "8vh"}}
          transition={{duration: 0.5, ease: [0.76, 0, 0.24, 1]}}
        >
          <div className="flex h-full items-center justify-between px-6 md:px-14">
            <span className="text-xs font-bold tracking-[0.2em] text-[#e2c078]/40">
              DEVELOPER&apos;S CITY
            </span>
            <span className="text-xs font-bold tracking-[0.2em] text-[#e2c078]/40">
              JAEHOON JUNG
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
