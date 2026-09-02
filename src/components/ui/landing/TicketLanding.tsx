"use client";

/**
 * 표 착륙장 — 이 사이트의 첫 화면.
 *
 * ## 왜 표인가
 *
 * 이 화면의 유일한 일은 **세 곳 중 하나를 고르게 하는 것**이다. 그래서 세 목적지를
 * 세 장의 표로 놓고, **표를 찢어야 들어가게** 했다. 고르는 행위와 들어가는 행위가
 * 한 동작이 되고, 마을이 물로 둘러싸인 섬이라 "통행증"이라는 말도 맞아떨어진다.
 *
 * ## 여기에 three.js 를 들이지 마라
 *
 * `/` 가 별도 라우트로 갈라져 있는 유일한 이유가 무게다(`src/app/page.tsx` 머리
 * 주석). 이 화면의 3D 는 전부 **CSS 3D**(perspective + preserve-3d)이고, 찢기·먼지는
 * Web Animations API 다. three 는 한 줄도 없다. 지켜지는지는 `npm run build` 의
 * 라우트별 First Load JS 로 확인한다.
 *
 * ## 원안에서 반드시 고친 것
 *
 * 이 화면은 사용자가 가져온 HTML 시안을 옮긴 것이다. 그대로 옮기면 안 되는 게
 * 몇 개 있었고, 그중 둘은 눈에 안 보이게 망가지는 종류다.
 *
 * 1. **변환이 서로를 덮어썼다.** 원안은 30ms `setInterval` 부유와 `mousemove`
 *    시차가 **같은 `style.transform` 문자열을 잘라 다시 썼다**
 *    (`w.style.transform.split(' translateY')`). 둘이 경쟁해 카드가 떨리고, 값이
 *    한 번 어긋나면 그 뒤로 계속 어긋난다. 여기서는 층을 나눈다 —
 *    시차는 **무대**에만 걸고, 배치(`--tl-tx/tz/ry/s`)는 React 가, 부유
 *    (`--tl-bob/tilt`)는 rAF 가 각자 제 커스텀 속성만 쓴다. 문자열을 안 만진다.
 * 2. **외부 호스트에 첫 화면이 묶여 있었다.** 종이·나뭇결 질감을
 *    transparenttextures.com 에서 PNG 로 받았다. SVG feTurbulence 로 대체 —
 *    요청 0회. (CSS 의 `--tl-*-grain`)
 * 3. `alert()` → `location.reload()` 자리에 실제 목적지를 넣었다.
 * 4. 카드가 `<div onclick>` 이라 **키보드로 아무것도 못 했다.** `<button>` 으로
 *    바꾸고 좌우 화살표·Enter·포커스 링을 붙였다. 호버 뒤집기는 터치에서 아예
 *    작동하지 않으므로, 터치·키보드에서는 "한 번 눌러 뒷면 → 다시 눌러 입장" 이다.
 * 5. 색이 남의 팔레트였다(초록/남색/빨강 잉크 + 황동). 마을 토큰으로 갈아끼웠다.
 */

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {projects} from "@/data/projects";
import {autonomousNpcs} from "@/data/npcRoster";
import {portfolioLinks} from "@/data/links";
// **`@/data/resume` 가 아니라 `@/data/hero` 다.** 이력서 모듈에서 가져오면 상수
// 하나를 써도 이력서 데이터가 통째로 이 화면 번들에 딸려온다(측정: 216→221KB).
// 자세한 건 `data/hero.ts` 머리 주석.
import {hero, resumePdf} from "@/data/hero";
import {villageBuildings} from "@/lib/constants";
import "./TicketLanding.css";

interface Props {
  onEnterVillage: () => void;
  onOpenResume: () => void;
  onOpenCommission: () => void;
  onPrepareVillage: () => void;
  /** 공방 표에 마우스가 닿았을 때. 데스크톱에서만 실제로 뭔가 받는다. */
  onPrepareCommission: () => void;
}

type TicketId = "village" | "resume" | "atelier";

interface Ticket {
  id: TicketId;
  stub: string;
  title: string;
  sub: string;
  backTitle: string;
  desc: string;
  ink: string;
  seal: React.ReactNode;
}

const REDUCED = "(prefers-reduced-motion: reduce)";

/** 도장 그림. 표마다 하나씩, 잉크색을 그대로 받는다. */
const SealVillage = (
  <svg aria-hidden="true" viewBox="0 0 100 100">
    <path d="M50 14 14 44v42h26V60h20v26h26V44z" fill="currentColor" />
  </svg>
);
const SealResume = (
  <svg aria-hidden="true" viewBox="0 0 100 100">
    <path
      d="M26 14h38l16 16v56H26zM62 15v16h17M36 46h30M36 57h30M36 68h20"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="4"
    />
  </svg>
);
const SealAtelier = (
  <svg aria-hidden="true" viewBox="0 0 100 100">
    <path
      d="M20 62 40 82 84 36 64 16 20 62Z"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="5"
    />
    <path d="M20 62 16 84l22-4" fill="currentColor" />
  </svg>
);

export function TicketLanding({
  onEnterVillage,
  onOpenResume,
  onOpenCommission,
  onPrepareVillage,
  onPrepareCommission
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ticketRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // **가운데는 이력서다.** `tickets` 는 마을(0)·이력서(1)·공방(2) 순이라 1 이 곧
  // 가운데다 — 왼쪽에 마을, 오른쪽에 공방이 놓인다.
  //
  // 배열 순서를 바꾸지 않고 여기만 옮기는 이유가 있다. 배열을 이력서 먼저로
  // 돌리면 가운데 기준 왼쪽이 공방이 되어 「둘러보기 ↔ 의뢰」의 좌우가 뒤집히고,
  // 앞면의 `NO. 00X` 일련번호까지 같이 흔들린다.
  //
  // 0(마을)이 기본이던 동안 이력서 표는 58° 돌아간 채 `blur 1.4px`·밝기 64%·
  // `tabIndex -1` 이었다. 이 사이트의 첫 독자가 채용 심사자라면, 그가 찾는 표가
  // 정확히 화면에서 가장 안 읽히는 자리에 있었다는 뜻이다.
  const [index, setIndex] = useState(1);
  const [ready, setReady] = useState(false);
  const [lit, setLit] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [stamped, setStamped] = useState<boolean[]>([false, false, false]);
  const tearingRef = useRef(false);

  // 숫자는 데이터에서 뽑는다. 하드코딩한 "27채"는 건물이 늘면 거짓이 된다.
  const counts = useMemo(
    () => ({
      buildings: villageBuildings.length,
      npcs: autonomousNpcs.length,
      projects: projects.length
    }),
    []
  );

  const tickets = useMemo<Ticket[]>(
    () => [
      {
        id: "village",
        stub: "마을 통행증",
        title: "마을 보기",
        sub: "걸어서 둘러보기",
        backTitle: "걸어서 둘러보기",
        desc: `${counts.buildings}채가 서 있고 ${counts.npcs}명이 살고 있습니다. 건물을 누르면 그 프로젝트 안으로 들어가고, 주민에게 물으면 답합니다.`,
        ink: "var(--tl-ink-village)",
        seal: SealVillage
      },
      {
        id: "resume",
        stub: "열람증",
        title: "이력서 보기",
        sub: "한 장으로 읽기",
        backTitle: "한 장으로 읽기",
        desc: `시간이 없다면 이쪽입니다. 기술·학력·프로젝트 ${counts.projects}건을 스크롤 한 번에 정리해 두었습니다.`,
        ink: "var(--tl-ink-resume)",
        seal: SealResume
      },
      {
        id: "atelier",
        stub: "공방 의뢰서",
        title: "작업 의뢰하기",
        sub: "지하 공방으로",
        backTitle: "지하 공방으로",
        desc: "홈페이지 제작을 맡기실 분. 접수하면 도안이 요구사항을 정리하고 참고용 견적을 냅니다.",
        ink: "var(--tl-ink-atelier)",
        seal: SealAtelier
      }
    ],
    [counts]
  );

  const go = useCallback(
    (id: TicketId) => {
      return id === "village"
        ? onEnterVillage
        : id === "resume"
        ? onOpenResume
        : onOpenCommission;
    },
    [onEnterVillage, onOpenResume, onOpenCommission]
  );

  // ── 등장 ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t1 = window.setTimeout(() => setLit(true), 120);
    const t2 = window.setTimeout(() => setReady(true), 700);
    // 도장은 한 장씩 시차를 두고 찍힌다 — 셋이 동시에 찍히면 그냥 페이드인이다.
    const stamps = [0, 1, 2].map(i =>
      window.setTimeout(
        () => setStamped(prev => prev.map((v, j) => (j === i ? true : v))),
        900 + i * 160
      )
    );
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      stamps.forEach(window.clearTimeout);
    };
  }, []);

  // ── 부유 + 마우스 시차 (rAF 하나) ──────────────────────────────────────────
  // 원안은 setInterval 30ms 였다. rAF 로 합치면 프레임에 맞고, 숨은 탭에서는
  // 브라우저가 알아서 멈춘다(document.hidden 검사도 같이 둔다).
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;
    const stage = stageRef.current;
    let raf = 0;
    const mouse = {x: 0, y: 0};

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 22;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 13;
    };
    window.addEventListener("pointermove", onMove, {passive: true});

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (stage) {
        stage.style.setProperty("--tl-px", `${mouse.x.toFixed(2)}deg`);
        stage.style.setProperty("--tl-py", `${(-mouse.y).toFixed(2)}deg`);
      }
      const t = performance.now() / 1500;
      ticketRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.setProperty(
          "--tl-bob",
          `${(Math.sin(t + i) * 7).toFixed(2)}px`
        );
        el.style.setProperty(
          "--tl-tilt",
          `${(Math.cos(t + i) * 1.3).toFixed(2)}deg`
        );
      });
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // ── 먼지 ───────────────────────────────────────────────────────────────────
  const dustRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = dustRef.current;
    if (!host || window.matchMedia(REDUCED).matches) return;
    const made: HTMLElement[] = [];
    for (let i = 0; i < 36; i++) {
      const d = document.createElement("div");
      const size = Math.random() * 3.5 + 1;
      d.className = "tl-mote";
      d.style.width = `${size}px`;
      d.style.height = `${size}px`;
      d.style.left = `${Math.random() * 100}%`;
      d.style.top = `${Math.random() * 100}%`;
      host.appendChild(d);
      made.push(d);
      d.animate(
        [
          {transform: "translate(0,0)", opacity: 0},
          {
            transform: `translate(${(Math.random() - 0.5) * 200}px, ${
              (Math.random() - 0.5) * 200
            }px)`,
            opacity: 0.28
          },
          {
            transform: `translate(${(Math.random() - 0.5) * 400}px, ${
              (Math.random() - 0.5) * 400
            }px)`,
            opacity: 0
          }
        ],
        {
          duration: 12000 + Math.random() * 10000,
          iterations: Infinity,
          easing: "ease-in-out"
        }
      );
    }
    return () => made.forEach(d => d.remove());
  }, []);

  // ── 회전 ───────────────────────────────────────────────────────────────────
  const rotate = useCallback((dir: number) => {
    if (tearingRef.current) return;
    setFlipped(false);
    setIndex(i => (i + dir + 3) % 3);
  }, []);

  // 마을 청크는 마을 표가 앞에 나오는 순간 미리 받아 둔다. 누르고 나서 받으면
  // 그만큼 늦다. 다만 **마운트 때 부르면 안 된다** — 마을 표가 처음부터 앞에 있어서,
  // "활성이면 미리 받는다"로 짰더니 착륙장이 열리자마자 씬 청크와 Draco 디코더
  // (gstatic)를 받았다. 이 화면이 가벼운 이유가 통째로 사라진다. 실제로 측정에
  // draco_decoder.wasm 요청이 찍혀서 알았다.
  //
  // 그래서 신호는 **의도**여야 한다 — 표에 마우스를 올리거나 포커스가 닿았을 때만.
  // (아래 `<button>` 의 onPointerEnter / onFocus)
  //
  // 공방 표도 같은 대접을 받는다 — 데스크톱에서는 이 표가 3D 방(`/atelier`)으로
  // 가기 때문이다. 모바일에서는 부르는 쪽이 아무것도 안 하도록 되어 있다.
  const prepareIfVillage = useCallback(
    (id: TicketId) => {
      if (id === "village") onPrepareVillage();
      if (id === "atelier") onPrepareCommission();
    },
    [onPrepareVillage, onPrepareCommission]
  );

  // ── 찢기 ───────────────────────────────────────────────────────────────────
  const tear = useCallback(
    (i: number) => {
      if (tearingRef.current) return;
      const wrapper = ticketRefs.current[i];
      const enter = go(tickets[i].id);
      if (!wrapper || window.matchMedia(REDUCED).matches) {
        enter();
        return;
      }
      tearingRef.current = true;
      wrapper.classList.add("is-tearing");

      const front = wrapper.querySelector(".tl-front");
      const html = front ? front.innerHTML : "";
      const halves: HTMLElement[] = [];
      for (const side of ["l", "r"] as const) {
        const half = document.createElement("div");
        half.className = `tl-half tl-half-${side}`;
        half.innerHTML = html;
        wrapper.appendChild(half);
        halves.push(half);
      }
      halves[0].animate(
        [
          {transform: "translateX(0) rotate(0)", opacity: 1},
          {
            transform: "translateX(-70px) translateY(120px) rotate(-12deg)",
            opacity: 0
          }
        ],
        {duration: 700, easing: "ease-in", fill: "forwards"}
      );
      halves[1].animate(
        [
          {transform: "translateX(0) rotate(0)", opacity: 1},
          {
            transform: "translateX(110px) translateY(-140vh) rotate(22deg)",
            opacity: 0
          }
        ],
        {
          duration: 950,
          easing: "cubic-bezier(0.5, 0, 0.5, 1)",
          fill: "forwards"
        }
      );

      // 뜯긴 자리에서 종이 부스러기가 튄다
      for (let p = 0; p < 22; p++) {
        const scrap = document.createElement("div");
        scrap.className = "tl-scrap";
        scrap.style.left = "50%";
        scrap.style.top = `${Math.random() * 100}%`;
        wrapper.appendChild(scrap);
        scrap.animate(
          [
            {transform: "translate(0,0) scale(1)", opacity: 1},
            {
              transform: `translate(${(Math.random() - 0.5) * 260}px, ${
                (Math.random() - 0.5) * 260
              }px) rotate(${Math.random() * 360}deg) scale(0)`,
              opacity: 0
            }
          ],
          {duration: 800, easing: "cubic-bezier(0,1,0.5,1)", fill: "forwards"}
        );
      }

      // 나머지 두 장은 책상 아래로 물러난다
      ticketRefs.current.forEach((el, j) => {
        if (!el || j === i) return;
        el.animate([{opacity: 1}, {opacity: 0}], {
          duration: 500,
          delay: j * 70,
          fill: "forwards"
        });
      });

      // 밤으로 덮으며 넘어간다 — 마을·이력서 어느 쪽이든 배경이 밤이라 이어진다
      const veil = rootRef.current?.querySelector(".tl-veil");
      veil?.animate([{opacity: 0}, {opacity: 1}], {
        duration: 620,
        delay: 480,
        fill: "forwards"
      });
      window.setTimeout(enter, 1050);
    },
    [go, tickets]
  );

  const onTicket = useCallback(
    (i: number, viaPointer: boolean) => {
      if (i !== index) {
        // 옆 표를 누르면 그쪽으로 돌린다 (짧은 쪽으로)
        rotate(i - index === 2 || i - index === -1 ? -1 : 1);
        return;
      }
      // 포인터가 호버로 이미 뒤집어 보여준 기기라면 바로 입장.
      // 터치·키보드는 뒷면을 한 번 보여주고, 다시 눌러야 입장한다.
      const hoverCapable = window.matchMedia("(hover: hover)").matches;
      if (hoverCapable && viaPointer) {
        tear(i);
        return;
      }
      if (!flipped) setFlipped(true);
      else tear(i);
    },
    [index, flipped, rotate, tear]
  );

  // ── 키보드 ─────────────────────────────────────────────────────────────────
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        rotate(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        rotate(-1);
      }
    },
    [rotate]
  );

  // 회전하면 새 활성 표로 포커스를 옮긴다 — 키보드 사용자가 길을 잃지 않는다
  useEffect(() => {
    if (!ready) return;
    const el = ticketRefs.current[index];
    if (el && document.activeElement?.classList.contains("tl-ticket")) {
      el.focus();
    }
  }, [index, ready]);

  const ink = tickets[index].ink;
  // 주소는 `data/links.ts` 것을 쓴다 — 여기 또 적으면 언젠가 한쪽만 바뀐다.
  const github = portfolioLinks.find(l => l.label === "GitHub");

  return (
    <div
      className={`tl-root${ready ? " is-ready" : ""}`}
      onKeyDown={onKeyDown}
      ref={rootRef}
    >
      <div className={`tl-desk${lit ? " is-lit" : ""}`} />
      <div className="tl-lantern" />
      <div className="tl-dust" ref={dustRef} />

      {/* ── 신원 ──────────────────────────────────────────────────────────────
          표만 있던 시절, 이 화면에서 「누가 · 무슨 직무인가」를 말하는 것은 발밑
          11px 푸터 한 줄뿐이었다. 채용 심사자는 30초 안에 그 둘을 확인하러
          오는데, 첫 화면이 그 시간을 은유(표·도장·랜턴)를 이해시키는 데 썼다.

          **여기서 새로 지어내는 문장은 없다.** 세 줄 전부 `data/resume.ts` 의
          `hero` 를 그대로 읽는다 — 이력서와 한 소스라서, 직무명을 고치면 두 곳이
          같이 바뀐다. 따로 적어 두면 언젠가 반드시 어긋난다.

          표(700ms)보다 먼저 `lit`(120ms)에 붙는다. 연출이 끝나기 전에 사실이 먼저
          읽혀야 한다. 이 화면의 유일한 `h1` 이기도 하다. */}
      <header className={`tl-head${lit ? " is-in" : ""}`}>
        <h1 className="tl-name">{hero.name}</h1>
        <p className="tl-role">{hero.roleTag}</p>
        <p className="tl-avail">{hero.availability}</p>
      </header>

      <div className="tl-stage" ref={stageRef}>
        {tickets.map((t, i) => {
          // 자리 계산: -1 왼쪽 / 0 가운데 / 1 오른쪽 (셋이 고리로 돈다)
          let diff = i - index;
          if (diff > 1) diff -= 3;
          if (diff < -1) diff += 3;
          const active = diff === 0;
          const side = active ? 0 : diff === 1 ? 1 : -1;

          return (
            <button
              aria-current={active ? "true" : undefined}
              aria-label={`${t.stub} — ${t.title}`}
              className={`tl-ticket${active ? " is-active" : ""}`}
              key={t.id}
              onClick={e => onTicket(i, e.detail > 0)}
              onFocus={() => prepareIfVillage(t.id)}
              onPointerEnter={() => prepareIfVillage(t.id)}
              ref={el => {
                ticketRefs.current[i] = el;
              }}
              style={
                {
                  "--tl-tx": active ? "0%" : `${side * 62}%`,
                  "--tl-tz": active ? "100px" : "-400px",
                  "--tl-ry": active ? "0deg" : `${side * -58}deg`,
                  "--tl-s": active ? 1.05 : 0.8,
                  "--tl-dim": active ? "108%" : "64%",
                  "--tl-blur": active ? "0px" : "1.4px",
                  "--tl-z": active ? 30 : 10,
                  color: t.ink
                } as React.CSSProperties
              }
              tabIndex={active ? 0 : -1}
              type="button"
            >
              <div
                className={`tl-inner${active && flipped ? " is-flipped" : ""}`}
              >
                <div className="tl-face tl-front">
                  <span className="tl-stub">{t.stub}</span>
                  <span className="tl-title">{t.title}</span>
                  <span className="tl-rule" />
                  <span className="tl-sub">{t.sub}</span>
                  <span className={`tl-seal${stamped[i] ? " is-stamped" : ""}`}>
                    {t.seal}
                  </span>
                  <span className="tl-serial">
                    NO. {String(i + 1).padStart(3, "0")} · 2026
                  </span>
                  <span className="tl-perf" />
                  <span className="tl-scan" />
                </div>
                <div className="tl-face tl-back">
                  <span className="tl-back-inner">
                    <span className="tl-back-title">{t.backTitle}</span>
                    <span className="tl-back-desc">{t.desc}</span>
                    <span className="tl-back-cta">눌러서 들어가기</span>
                  </span>
                  <span className="tl-perf" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        aria-label="이전 표"
        className="tl-nav tl-nav-prev"
        onClick={() => rotate(-1)}
        type="button"
      >
        〈
      </button>
      <button
        aria-label="다음 표"
        className="tl-nav tl-nav-next"
        onClick={() => rotate(1)}
        type="button"
      >
        〉
      </button>

      <div className="tl-dots" style={{color: ink}}>
        {tickets.map((t, i) => (
          <button
            aria-label={t.title}
            className={`tl-dot${i === index ? " is-on" : ""}`}
            key={t.id}
            onClick={() => {
              setFlipped(false);
              setIndex(i);
            }}
            type="button"
          />
        ))}
      </div>

      {/* ── 발밑 ──────────────────────────────────────────────────────────────
          예전 푸터는 `정재훈 · 건물 27 · 주민 32 · 프로젝트 9` 였다. 이름은 이제
          머리글에 있고, **건물·주민은 마을 표 뒷면이 이미 같은 말로 한다**
          (`${counts.buildings}채가 서 있고 …`) — 푸터에서 한 번 더 세는 건 중복인
          데다, 그 둘은 경력이 아니라 이 사이트를 자랑하는 숫자다.

          대신 **PDF 를 여기 둔다.** 대기업 서류 심사는 첨부 PDF 가 본체라 사이트를
          안 열고 파일만 받아 가는 경우가 실제로 많은데, 지금까지 그러려면
          `/resume` 까지 한 번 더 건너가야 했다(`ResumeMode` 헤더의 같은 버튼). */}
      <div className="tl-foot">
        <span>
          프로젝트 <b>{counts.projects}</b>
        </span>
        {github ? (
          <a href={github.href} rel="noreferrer" target="_blank">
            {github.value}
          </a>
        ) : null}
        <a className="tl-pdf" download href={resumePdf}>
          ⬇ PDF 이력서
        </a>
      </div>

      <div className="tl-veil" />
    </div>
  );
}
