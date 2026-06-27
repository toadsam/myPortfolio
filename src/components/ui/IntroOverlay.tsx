"use client";

import {AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform, type MotionValue} from "framer-motion";
import {useEffect, useMemo, useRef, useState} from "react";
import {sfx} from "@/lib/sfx";
import type {ExplorationMode} from "@/types/portfolio";

interface IntroOverlayProps {
  onStart: (mode: ExplorationMode) => void;
  onResume: () => void;
}

const textItem = {
  hidden: {opacity: 0, y: 20},
  visible: {opacity: 1, y: 0},
  exit: {opacity: 0, y: -12, transition: {duration: 0.22}}
};

// ─── 디코딩(스크램블) 텍스트 ──────────────────────────────────────────────────
const SCRAMBLE = "0123456789<>/\\[]{}#$%&ABCDEFXYZ아주개발";
function Scramble({text, delay = 0, speed = 42}: {text: string; delay?: number; speed?: number}) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let raf = 0;
    const total = text.length * speed + 300;
    const start = performance.now();
    function tick(now: number) {
      const e = now - start - delay;
      if (e < 0) { raf = requestAnimationFrame(tick); return; }
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
function TrailCanvas({mx, my, stageRef}: {mx: MotionValue<number>; my: MotionValue<number>; stageRef: React.RefObject<HTMLDivElement | null>}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
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
        ctx!.strokeStyle = "rgba(0,212,255,0.35)";
        ctx!.lineWidth = 2.5;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(last.x, last.y);
        ctx!.lineTo(x, y);
        ctx!.stroke();
      }
      const g = ctx!.createRadialGradient(x, y, 0, x, y, 14);
      g.addColorStop(0, "rgba(0,212,255,0.55)");
      g.addColorStop(1, "rgba(0,212,255,0)");
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
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1]" />;
}

// ─── 떠다니는 데이터 입자 ─────────────────────────────────────────────────────
function Particles() {
  const [dots, setDots] = useState<{id:number;x:number;y:number;s:number;d:number;delay:number}[]>([]);
  useEffect(() => {
    setDots(Array.from({length: 22}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: 1.5 + Math.random() * 3,
      d: 5 + Math.random() * 7,
      delay: Math.random() * 4,
    })));
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-[#00d4ff]"
          style={{left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, opacity: 0.18}}
          animate={{y: [-12, 12, -12], opacity: [0.06, 0.3, 0.06]}}
          transition={{duration: d.d, delay: d.delay, repeat: Infinity, ease: "easeInOut"}}
        />
      ))}
    </div>
  );
}

export function IntroOverlay({onStart, onResume}: IntroOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [muted, setMuted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // 마우스 추적 (0~100%)
  const mx = useMotionValue(50);
  const my = useMotionValue(42);
  const sx = useSpring(mx, {stiffness: 120, damping: 22});
  const sy = useSpring(my, {stiffness: 120, damping: 22});

  // 커서 스포트라이트 — 어두운 막에 구멍을 뚫어 뒤 마을이 드러남
  const revealMask = useMotionTemplate`radial-gradient(circle 240px at ${sx}% ${sy}%, transparent 0%, transparent 30%, black 75%)`;
  // 커서 시안 글로우
  const glow = useMotionTemplate`radial-gradient(circle 320px at ${sx}% ${sy}%, rgba(0,212,255,0.12), transparent 70%)`;
  // 패럴랙스 (콘텐츠가 커서 반대로 살짝)
  const px = useTransform(sx, [0, 100], [14, -14]);
  const py = useTransform(sy, [0, 100], [10, -10]);
  // 커서 따라가는 링 위치
  const ringLeft = useMotionTemplate`${sx}%`;
  const ringTop = useMotionTemplate`${sy}%`;

  function handleMove(e: React.MouseEvent) {
    if (!stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  }

  function handleStart(mode: ExplorationMode) {
    if (isExiting) return;
    sfx.enter();
    setIsExiting(true);
    setTimeout(() => onStart(mode), 620);
  }

  function handleResume() {
    if (isExiting) return;
    sfx.click();
    onResume();
  }

  function toggleMute() {
    setMuted((m) => {
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
          className="relative flex flex-1 flex-col justify-center overflow-hidden"
          initial={{opacity: 0}}
          onMouseMove={handleMove}
          transition={{duration: isExiting ? 0.4 : 0.5, ease: "easeInOut"}}
        >
          {/* 어두운 막 — 커서 위치에 구멍이 뚫려 뒤의 살아있는 마을이 드러남 */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(0,5,20,0.985) 0%, rgba(0,9,26,0.96) 60%, rgba(0,6,20,0.93) 100%)",
              WebkitMaskImage: revealMask,
              maskImage: revealMask,
            }}
          />
          {/* 커서 시안 글로우 */}
          <motion.div className="pointer-events-none absolute inset-0" style={{background: glow}} />
          {/* 격자 */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,180,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.06) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}
          />
          <Particles />
          <TrailCanvas mx={mx} my={my} stageRef={stageRef} />

          {/* 음소거 토글 */}
          <button
            type="button"
            onClick={toggleMute}
            className="absolute right-5 top-5 z-[3] flex h-9 w-9 items-center justify-center rounded-full border border-[#00d4ff]/30 bg-[#050d1a]/70 text-sm text-[#00d4ff]/80 transition hover:border-[#00d4ff]/70 hover:text-[#00d4ff]"
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
              className="rounded-full border border-[#00d4ff]/30"
              style={{width: 220, height: 220}}
              animate={{scale: [1, 1.08, 1], opacity: [0.25, 0.5, 0.25]}}
              transition={{duration: 2.4, repeat: Infinity, ease: "easeInOut"}}
            />
          </motion.div>

          <motion.div className="relative z-[2] px-6 md:px-14" style={{x: px, y: py}}>
            <motion.p
              className="font-mono text-xs font-black uppercase tracking-[0.32em]"
              style={{color: "#00d4ff", textShadow: "0 0 12px #00d4ff88"}}
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.12}}
              variants={textItem}
            >
              {">"} Developer's City 2026
            </motion.p>

            <motion.h1
              className="mt-4 max-w-4xl font-mono text-4xl font-black leading-tight text-white md:text-7xl"
              style={{textShadow: "0 0 40px rgba(0,180,255,0.4)"}}
              transition={{duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.25}}
              variants={textItem}
            >
              <Scramble text="정재훈의 3D 포트폴리오 마을" delay={300} />
              <span className="ml-2 animate-pulse text-2xl text-[#00d4ff] md:text-4xl">_</span>
            </motion.h1>

            <motion.p
              className="mt-4 font-mono text-sm font-bold tracking-[0.16em] text-[#00b4ffb3] md:text-base"
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4}}
              variants={textItem}
            >
              Fullstack / 3D / Game / XR
            </motion.p>

            <motion.p
              className="mt-5 max-w-xl text-sm leading-7 text-white/58 md:text-base"
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.55}}
              variants={textItem}
            >
              먼저 건물을 클릭해 프로젝트 내부로 들어가거나, NPC에게 프로젝트와 기술에 대해 질문해보세요.
              오늘의 관리자 기록은 마을 조명과 NPC 상태에 반영됩니다.
            </motion.p>

            <motion.div
              className="mt-7 grid max-w-3xl gap-3 md:grid-cols-3"
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.68}}
              variants={textItem}
            >
              {[
                ["1", "건물 클릭", "클릭하면 바로 프로젝트 전시실로 입장"],
                ["2", "NPC 질문", "프로젝트, 기술, 연락처를 대화로 확인"],
                ["3", "Admin 기록", "오늘 활동을 마을 상태로 반영"]
              ].map(([index, title, body]) => (
                <motion.div
                  key={index}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
                  whileHover={{y: -4, borderColor: "rgba(0,212,255,0.45)", boxShadow: "0 0 22px rgba(0,212,255,0.12)"}}
                  transition={{type: "spring", stiffness: 300, damping: 20}}
                >
                  <span className="font-mono text-xs font-black text-[#00d4ff]">STEP {index}</span>
                  <p className="mt-2 text-sm font-black text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">{body}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.82}}
              variants={textItem}
            >
              {/* 메인 CTA — 마을 탐험 시작 */}
              <motion.button
                className="group relative flex-1 overflow-hidden rounded-xl border border-[#00d4ff]/60 bg-[#00d4ff]/15 px-6 py-5 text-left hover:border-[#00d4ff] hover:bg-[#00d4ff]/22"
                onClick={() => handleStart("click")}
                onMouseEnter={() => sfx.hover()}
                type="button"
                whileHover={{scale: 1.03, y: -3, boxShadow: "0 0 32px rgba(0,212,255,0.35)"}}
                whileTap={{scale: 0.98}}
                transition={{type: "spring", stiffness: 320, damping: 20}}
              >
                <span className="flex items-center gap-2 font-mono text-base font-black text-white">
                  🏘️ 마을 탐험 시작 <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
                <span className="mt-1 block text-xs text-[#00d4ff]/70">건물을 클릭해 프로젝트·기술·경험을 둘러봅니다.</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00d4ff]/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.button>

              {/* 면접관용 빠른 길 — 동등하게 강조 */}
              <motion.button
                className="group relative flex-1 overflow-hidden rounded-xl border border-white/25 bg-white/[0.06] px-6 py-5 text-left hover:border-white/50 hover:bg-white/[0.1]"
                onClick={handleResume}
                onMouseEnter={() => sfx.hover()}
                whileHover={{scale: 1.03, y: -3}}
                whileTap={{scale: 0.98}}
                transition={{type: "spring", stiffness: 320, damping: 20}}
                type="button"
              >
                <span className="flex items-center gap-2 font-mono text-base font-black text-white">
                  📄 빠른 이력서 보기 <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
                <span className="mt-1 block text-xs text-white/50">시간이 없다면 — 요약·프로젝트·스킬을 한 페이지로.</span>
              </motion.button>
            </motion.div>

            <motion.p
              className="mt-6 font-mono text-xs text-white/40"
              transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.95}}
              variants={textItem}
            >
              {"// "}마을 안에서 <span className="text-[#00ff88]/70">WASD 직접 이동</span> 모드로 전환할 수 있어요 · <span className="sm:hidden text-[#00d4ff]/70">모바일은 이력서 보기를 추천</span>
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{height: isExiting ? 0 : "8vh"}}
          className="w-full flex-shrink-0 overflow-hidden bg-[#020810]"
          initial={{height: "8vh"}}
          transition={{duration: 0.5, ease: [0.76, 0, 0.24, 1]}}
        >
          <div className="flex h-full items-center justify-between px-6 md:px-14">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#00b4ff59]">
              {">"} DEVELOPER'S CITY
            </span>
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#00b4ff59]">
              JAEHOON JUNG_
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
