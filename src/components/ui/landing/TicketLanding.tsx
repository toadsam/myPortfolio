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
import {villageBuildings} from "@/lib/constants";
import "./TicketLanding.css";

interface Props {
  onEnterVillage: () => void;
  onOpenResume: () => void;
  onOpenCommission: () => void;
  onPrepareVillage: () => void;
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
  onPrepareVillage
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ticketRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [index, setIndex] = useState(0);
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
  const prepareIfVillage = useCallback(
    (id: TicketId) => {
      if (id === "village") onPrepareVillage();
    },
    [onPrepareVillage]
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

  return (
    <div
      className={`tl-root${ready ? " is-ready" : ""}`}
      onKeyDown={onKeyDown}
      ref={rootRef}
    >
      <div className={`tl-desk${lit ? " is-lit" : ""}`} />
      <div className="tl-lantern" />
      <div className="tl-dust" ref={dustRef} />

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

      <div className="tl-foot">
        <span>정재훈 · 3D 포트폴리오 마을</span>
        <span>
          건물 <b>{counts.buildings}</b>
        </span>
        <span>
          주민 <b>{counts.npcs}</b>
        </span>
        <span>
          프로젝트 <b>{counts.projects}</b>
        </span>
      </div>

      <div className="tl-veil" />
    </div>
  );
}
