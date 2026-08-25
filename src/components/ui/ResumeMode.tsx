"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from "react";
import {projects} from "@/data/projects";
import {getTechIcon} from "@/data/techIcons";
import {
  CATEGORY_META,
  aboutMe,
  careers,
  contact,
  devRecords,
  education,
  hero,
  mainProjects,
  resumePdf,
  githubEvidence,
  skillChips,
  skillDetails,
  subProjects,
  values,
  workExperience,
  type MainProjectCard,
  type ResumeCategory
} from "@/data/resume";
import dynamic from "next/dynamic";
import type {ProjectData} from "@/types/portfolio";
import {ProjectOnePager} from "./ProjectOnePager";
import "./ResumeTerminal.css";

// **three 를 끌고 오는 건 이 둘뿐이다.** 예전엔 이것 때문에 `/resume` 페이지
// 전체가 `dynamic(ssr:false)` 로 묶여 있었고, 그 결과 서버가 내려주는 HTML 에
// 이름 한 글자도 없었다(검색·링크 미리보기·ATS·JS 차단 환경에서 백지).
// 장식 둘만 클라이언트에 가두면 본문은 정상적으로 서버 렌더된다.
const FloatingIsle = dynamic(
  () => import("./FloatingIsle").then(m => m.FloatingIsle),
  {ssr: false}
);
const TechConstellation = dynamic(
  () => import("./TechConstellation").then(m => m.TechConstellation),
  {ssr: false}
);

// 학력: "학과명 (전공)" 에서 태그 분리
function parseEdu(program: string): {name: string; tag: string | null} {
  const m = program.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? {name: m[1], tag: m[2]} : {name: program, tag: null};
}
const isAcademic = (program: string) =>
  /\((전공|복수전공|부전공)\)/.test(program);

// 상단 탭. 7개 섹션 전부를 태우면 캡슐이 터지므로 문서의 세 덩이만 짚는다 —
// 기술/학력(=이력), 프로젝트(=작업), 연락처. id 는 <section id="resume-{id}"> 과 짝.
const NAV_ITEMS = [
  {id: "history", label: "이력"},
  {id: "work", label: "작업"},
  {id: "contact", label: "연락"}
] as const;
type NavId = (typeof NAV_ITEMS)[number]["id"];

interface Props {
  onEnterVillage: () => void;
}

export function ResumeMode({onEnterVillage}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef(false);
  const dragMovedRef = useRef(0);
  const rotateRef = useRef<(dir: number) => void>(() => {});
  // 캐러셀 복귀 시 다음 rAF를 기다리지 않고 즉시 카드 배치를 다시 계산하기 위한 통로
  const updateRef = useRef<() => void>(() => {});

  // 클릭 점프가 끝나는 시각(ms). 그때까지 스크롤 스파이는 입을 다문다.
  const navLockRef = useRef(0);

  // 상단 탭 3개가 가리키는 곳. id 는 섹션 <section id=...> 과 짝이다.
  // 탭을 늘리려면 이 배열과 섹션 id 만 맞추면 된다 — 마크업은 map 이 만든다.
  const [activeNav, setActiveNav] = useState<NavId>("history");

  // 이력서 본문은 `.resume-terminal` 자신이 스크롤 컨테이너다(position:fixed +
  // overflow-y:auto). 그래서 window.scrollTo 가 아니라 요소에게 물어봐야 한다 —
  // scrollIntoView 는 스크롤 가능한 조상을 알아서 찾는다.
  //
  // 헤더는 sticky 가 아니라 본문과 같이 흘러가므로 보정할 오프셋이 없다.
  const goToSection = (id: NavId) => {
    setActiveNav(id);
    const el = rootRef.current?.querySelector(`#resume-${id}`);
    if (!el) return;
    // 이 리포의 다른 움직임과 같은 규칙 — 모션을 줄인 사용자에겐 즉시 점프.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 점프가 끝날 때까지 아래 감시자를 재운다. 안 그러면 부드럽게 지나가는
    // 중간 섹션마다 탭이 옮겨 붙어, 누른 곳에 닿기 전에 두세 번 깜빡인다.
    navLockRef.current = still ? 0 : Date.now() + 1000;
    el.scrollIntoView({behavior: still ? "auto" : "smooth", block: "start"});
  };

  // 손으로 스크롤할 때도 탭이 따라오게 한다(스크롤 스파이).
  //
  // 판정은 **화면 중앙의 얇은 띠**로 한다 — rootMargin 으로 위 45% / 아래 50% 를
  // 깎아 5% 짜리 가로줄만 남기고, 거기 걸친 섹션을 현재 위치로 본다. 섹션 높이가
  // 제각각(2,100px ~ 900px)이라 "가장 많이 보이는 섹션" 같은 비율 기준은 큰
  // 섹션이 계속 이기고, threshold 방식은 짧은 섹션이 아예 못 잡힌다.
  //
  // 탭이 없는 구간(02 학력·05 가치관 등)에서는 걸리는 섹션이 없어 **직전 탭이
  // 그대로 남는다.** 이게 원하는 동작이다 — 학력을 읽는 동안 `이력` 이 켜져 있다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const seen = new Set<NavId>();
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const id = entry.target.id.replace("resume-", "") as NavId;
          if (entry.isIntersecting) seen.add(id);
          else seen.delete(id);
        });
        if (Date.now() < navLockRef.current) return;
        const hit = NAV_ITEMS.find(item => seen.has(item.id));
        if (hit) {
          setActiveNav(prev => (prev === hit.id ? prev : hit.id));
          return;
        }
        // 첫 섹션보다 **위**(히어로)로 올라온 경우만은 유지가 아니라 되돌린다.
        // 갓 로드한 화면과 스크롤해 올라온 화면이 같은데 탭이 다르면 틀린 것이다.
        // (섹션 사이 빈 구간은 위 조건에 안 걸리므로 여전히 직전 탭을 지킨다)
        const first = root.querySelector<HTMLElement>(
          `#resume-${NAV_ITEMS[0].id}`
        );
        if (first && root.scrollTop < first.offsetTop) {
          setActiveNav(prev =>
            prev === NAV_ITEMS[0].id ? prev : NAV_ITEMS[0].id
          );
        }
      },
      {root, rootMargin: "-45% 0px -50% 0px"}
    );
    NAV_ITEMS.forEach(item => {
      const el = root.querySelector(`#resume-${item.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const [gridView, setGridView] = useState(false);
  const [selectedRich, setSelectedRich] = useState<number | null>(null);

  // 좁은 화면에서는 **3D 고리가 성립하지 않는다.** 카드 폭이 화면 폭에 육박하면
  // 12장이 한 점에 겹쳐 글자가 서로 위에 포개진다(390px 에서 실제로 그랬다).
  // 반지름을 줄여도 결과는 같다 — 그래서 캐러셀을 끄고 그리드로 고정하고,
  // "캐러셀로 보기" 토글도 감춘다. 돌아갈 곳이 없는 버튼은 없느니만 못하다.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  const isGrid = gridView || narrow;

  // 터치 전용 기기인가. 이 화면에 온 터치 방문자는 대개 자동 전환으로 왔는데,
  // 아래 "마을 탐험" 버튼을 누르면 **조작이 안 되는 마을**로 들어가게 된다.
  // 막지는 않고 한 줄로 알려만 준다.
  //
  // 렌더 중에 matchMedia 를 바로 부르면 서버 렌더(false)와 어긋나 하이드레이션
  // 경고가 난다 — 마운트 뒤에 한 번만 읽는다.
  const [touchOnly, setTouchOnly] = useState(false);
  useEffect(() => {
    setTouchOnly(
      window.matchMedia("(pointer: coarse)").matches &&
        window.matchMedia("(hover: none)").matches
    );
  }, []);

  const eduMain = useMemo(
    () => education.filter(e => isAcademic(e.program)),
    []
  );
  const eduExternal = useMemo(
    () => education.filter(e => !isAcademic(e.program)),
    []
  );

  // 작업 비중. **세는 값이지 자기평가가 아니다.** mainProjects 의 카테고리를
  // 그대로 집계하므로 프로젝트를 추가/삭제하면 막대도 따라 움직인다.
  const areaWeights = useMemo(() => {
    const groups: {label: string; cats: ResumeCategory[]}[] = [
      {label: "웹 서비스 · 데이터", cats: ["web", "data", "ops"]},
      {label: "게임", cats: ["game"]},
      {label: "AR / XR", cats: ["ar"]}
    ];
    return groups
      .map(g => ({
        label: g.label,
        count: mainProjects.filter(p => g.cats.includes(p.category)).length
      }))
      .filter(g => g.count > 0);
  }, []);
  const maxWeight = Math.max(...areaWeights.map(w => w.count), 1);

  const richList = useMemo(
    () =>
      mainProjects
        .map(c =>
          c.richId ? projects.find(p => p.id === c.richId) : undefined
        )
        .filter((p): p is ProjectData => Boolean(p)),
    []
  );

  function openProject(card: MainProjectCard) {
    if (!card.richId) return;
    const idx = richList.findIndex(p => p.id === card.richId);
    if (idx >= 0) setSelectedRich(idx);
  }

  // ── reveal (스크롤 등장) ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root
      .querySelectorAll(".viewport .reveal")
      .forEach(el => el.classList.add("active"));
    const timers = Array.from(
      root.querySelectorAll<HTMLElement>(".spec-item")
    ).map((item, i) =>
      window.setTimeout(() => item.classList.add("visible"), 400 + i * 200)
    );

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // 화면에 들어왔거나, 빠르게 스크롤해 이미 위로 지나간 경우에도 등장 처리.
          // (지나친 요소를 그대로 두면 opacity 0으로 영영 안 보인다 — 스크롤바를
          //  끌거나 앵커로 점프하면 섹션이 통째로 비어 보이던 원인)
          const scrolledPast =
            !!entry.rootBounds &&
            entry.boundingClientRect.bottom < entry.rootBounds.top;
          if (entry.isIntersecting || scrolledPast) {
            entry.target.classList.add("active");
            entry.target
              .querySelectorAll(".proficiency-fill")
              .forEach(b => b.classList.add("active"));
          }
        });
      },
      // **화면에 닿기 전에 미리 시작한다.** 예전엔 -50px 였다 — 요소가 들어오고
      // 50px 더 지나야 전환이 시작돼, 스크롤하면 한동안 빈 자리가 보였다.
      // 양수 rootMargin 은 판정 영역을 아래로 넓혀 도착 전에 켜 준다.
      {threshold: 0.1, rootMargin: "0px 0px 12% 0px"}
    );
    root
      .querySelectorAll("section .reveal, section .section-header")
      .forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
      timers.forEach(t => window.clearTimeout(t));
    };
  }, []);

  // ── 3D 캐러셀 (자동 회전 + 드래그) ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const track = root.querySelector<HTMLElement>(".carousel-track");
    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".project-card")
    );
    if (!track || !cards.length) return;

    // 고리 반지름은 **화면 폭을 따라간다.** 480px 로 못 박아 두면 좁은 화면에서
    // 옆쪽 카드가 뷰포트 밖으로 밀려나고, 루트가 overflow-x:hidden 이라 스크롤로
    // 따라갈 수도 없어 그냥 잘려 보였다(375px 에서 내용 폭이 653px 이었다).
    const radiusFor = () =>
      Math.round(Math.max(190, Math.min(480, window.innerWidth * 0.4)));
    let radius = radiusFor();
    const angleStep = 360 / cards.length;
    let currentAngle = 0;
    let isDragging = false;
    let startX = 0;
    let autoRotate = true;

    cards.forEach((card, i) => {
      card.dataset.baseAngle = String(angleStep * i);
    });

    const update = () => {
      if (gridRef.current) return;
      track.style.transform = `rotateY(${currentAngle}deg)`;
      let closest = 0;
      let closestDiff = Infinity;
      cards.forEach((_card, i) => {
        const a = (angleStep * i + currentAngle) % 360;
        const n = ((a % 360) + 360) % 360;
        const diff = Math.min(Math.abs(n - 180), Math.abs(n - 540));
        if (diff < closestDiff) {
          closestDiff = diff;
          closest = i;
        }
      });
      cards.forEach((card, i) => {
        const base = parseFloat(card.dataset.baseAngle ?? "0");
        if (i === closest) {
          card.classList.add("active");
          card.style.transform = `rotateY(${base}deg) translateZ(${radius}px) scale(1.05)`;
        } else {
          card.classList.remove("active");
          card.style.transform = `rotateY(${base}deg) translateZ(${radius}px)`;
        }
      });
    };

    update();
    updateRef.current = update;

    let raf = 0;
    const animate = () => {
      if (!gridRef.current && autoRotate && !isDragging) {
        currentAngle -= 0.06;
        update();
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const pointerX = (e: MouseEvent | TouchEvent) =>
      "touches" in e ? e.touches[0]?.clientX ?? startX : e.clientX;

    const onDown = (e: MouseEvent | TouchEvent) => {
      if (gridRef.current) return;
      isDragging = true;
      autoRotate = false;
      dragMovedRef.current = 0;
      startX = pointerX(e);
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const x = pointerX(e);
      const d = x - startX;
      dragMovedRef.current += Math.abs(d);
      currentAngle += d * 0.3;
      startX = x;
      update();
    };
    const onUp = () => {
      if (!isDragging) return;
      isDragging = false;
      window.setTimeout(() => {
        autoRotate = true;
      }, 3000);
    };

    rotateRef.current = (dir: number) => {
      autoRotate = false;
      currentAngle += dir * angleStep;
      update();
      window.setTimeout(() => {
        autoRotate = true;
      }, 3000);
    };

    // 화면을 돌리거나 창을 줄이면 반지름을 다시 잰다.
    const onResize = () => {
      const next = radiusFor();
      if (next === radius) return;
      radius = next;
      update();
    };

    track.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    track.addEventListener("touchstart", onDown, {passive: true});
    window.addEventListener("touchmove", onMove, {passive: true});
    window.addEventListener("touchend", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      track.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ── 그리드 뷰 토글 시 인라인 트랜스폼 정리 ──
  // useEffect가 아니라 useLayoutEffect여야 한다. useEffect는 페인트 "이후"라,
  // 캐러셀이 넣어둔 인라인 transform(rotateY)이 남은 채로 그리드가 한 프레임 그려지고
  // backface-visibility: hidden 탓에 뒤를 향한 카드가 사라져 보인다.
  // gridRef도 여기서 먼저 뒤집어야 rAF 루프가 transform을 다시 써넣지 않는다.
  useLayoutEffect(() => {
    gridRef.current = isGrid;
    const root = rootRef.current;
    if (!root) return;
    if (isGrid) {
      root.querySelectorAll<HTMLElement>(".project-card").forEach(c => {
        c.style.transform = "";
        c.style.left = "";
        c.style.top = "";
      });
      const track = root.querySelector<HTMLElement>(".carousel-track");
      if (track) track.style.transform = "";
    } else {
      // 캐러셀 복귀: 다음 rAF를 기다리면 카드가 한 프레임 가운데 겹쳐 보인다.
      updateRef.current();
    }
  }, [isGrid]);

  return (
    <>
      <div className="resume-terminal" ref={rootRef}>
        {/* ══════════ 히어로 뷰포트 ══════════ */}
        <div className="viewport">
          <header>
            <div className="brand">
              <div className="logo-orb" />
              <span>정재훈</span>
            </div>
            <div className="nav-capsule">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === activeNav ? "active" : undefined}
                  onClick={() => goToSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="header-actions">
              {/* 대기업 서류는 대부분 PDF 첨부가 본체고 링크는 부가다.
                  전화번호를 지운 사본이라 공개돼도 안전하다. */}
              <a className="pdf-btn" download href={resumePdf}>
                ⬇ PDF 이력서
              </a>
              <button
                type="button"
                className="village-btn"
                onClick={onEnterVillage}
              >
                🏘 3D 마을 탐험 →
              </button>
            </div>
          </header>

          <aside className="left-rail">
            <div className="vertical-text">2026 · 기록</div>
          </aside>

          <main>
            {/* 기술 별자리 — 예전엔 의미 없는 와이어프레임 정이십면체였다.
                지금은 프로젝트 데이터로 그린다: 별 하나가 기술 하나, 크기는
                그 기술을 쓴 프로젝트 수, 선은 같은 프로젝트에서 함께 쓴 관계. */}
            <div className="xr-canvas-container">
              <TechConstellation />
            </div>
            <div className="main-title-wrap">
              {/* 이름은 한 번만 쓴다.
                  예전엔 같은 이름을 span 두 개로 겹쳐 놓고, 위쪽 흰 글자를
                  clip-path 로 아래 35% 잘라 낸 뒤 그 자리에 1px 윤곽선을
                  드러내는 사이버펑크 글리치였다. 팔레트가 밤·등불로 바뀐 뒤에도
                  글자 연출만 그 시절에 남아 배경과 언어가 어긋났고, 스크린리더와
                  검색엔진에는 "정재훈정재훈" 으로 읽혔다. */}
              <h1 className="hero-name reveal reveal-delay-1">{hero.name}</h1>
              <div className="hero-sub reveal reveal-delay-2">
                <span className="typing-text">{hero.roleTag}</span>
                <span className="cursor-blink" />
              </div>
              <div
                className="reveal reveal-delay-3"
                style={{
                  maxWidth: 400,
                  fontSize: 12,
                  color: "#666",
                  lineHeight: 1.8
                }}
              >
                웹 아키텍처와 XR 인터랙션을 결합해, 운영에서 생기는 마찰을
                풀스택 구현으로 해결합니다.
              </div>
            </div>
          </main>

          <aside className="spec-panel">
            <div className="quote-block reveal reveal-delay-2">
              {hero.headlineLines.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < hero.headlineLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </div>
            <ul className="spec-list">
              {hero.bullets.map((b, i) => (
                <li className="spec-item" key={b}>
                  <span className="spec-label">
                    [ MODULE_{String(i + 1).padStart(2, "0")} ]
                  </span>
                  <span className="spec-value">{b}</span>
                </li>
              ))}
            </ul>
          </aside>

          <footer className="reveal reveal-delay-3">
            <div className="status-module">
              <span className="status-title">Main Projects</span>
              <div className="status-data">
                <span className="status-number">
                  {String(mainProjects.length).padStart(2, "0")}
                </span>
                <span className="status-unit">PROJECTS</span>
              </div>
            </div>
            <div className="vertical-divider" />
            <div className="status-module">
              <span className="status-title">Sub Projects</span>
              <div className="status-data">
                <span className="status-number">
                  {String(subProjects.length).padStart(2, "0")}
                </span>
                <span className="status-unit">MODULES</span>
              </div>
            </div>
            <div className="vertical-divider" />
            <div className="status-module">
              <span className="status-title">Academic Runtime</span>
              <div className="status-data">
                <span className="status-number">
                  {String(education.length).padStart(2, "0")}
                </span>
                <span className="status-unit">EDUCATION</span>
              </div>
            </div>
            <div className="vertical-divider" />
            {/* 공개 저장소 수는 이 화면에서 **누구나 눌러서 확인할 수 있는**
                몇 안 되는 숫자다. 그래서 잠정 표시 없이 그대로 세운다. */}
            <a
              className="status-module status-link"
              href={contact.github}
              rel="noreferrer"
              target="_blank"
            >
              <span className="status-title">Public Repos</span>
              <div className="status-data">
                <span className="status-number">
                  {githubEvidence.repoCount}
                </span>
                <span className="status-unit">GITHUB ↗</span>
              </div>
            </a>
          </footer>
        </div>

        {/* ══════════ 01 Skills ══════════ */}
        <section id="resume-history">
          <div className="skills-container">
            <header className="section-header reveal">
              <span className="section-id">## 01</span>
              <h2 className="section-title">
                기술 스택 <span className="section-subtitle">(Skills)</span>
              </h2>
            </header>

            <div className="skill-tags reveal reveal-delay-1">
              {skillChips.map(s => {
                const icon = getTechIcon(s);
                return (
                  <span
                    className="tag"
                    key={s}
                    style={
                      icon
                        ? ({"--brand": icon.color} as CSSProperties)
                        : undefined
                    }
                  >
                    {icon ? (
                      <svg
                        aria-hidden="true"
                        className="tag-icon"
                        fill={icon.stroke ? "none" : "currentColor"}
                        stroke={icon.stroke ? "currentColor" : undefined}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={icon.stroke ? 1.8 : undefined}
                        viewBox="0 0 24 24"
                      >
                        <path d={icon.d} />
                      </svg>
                    ) : null}
                    {s}
                  </span>
                );
              })}
            </div>

            <div className="skills-table-wrap reveal reveal-delay-2">
              <table className="skills-table">
                <tbody>
                  {skillDetails.map(d => (
                    <tr key={d.area}>
                      <th>{d.area}</th>
                      <td>
                        {d.desc}
                        {/* 영역마다 실제로 쓴 것들. 서술만 있으면 "무엇으로"
                            했는지가 안 보여서, 심사자가 스택을 못 센다. */}
                        <span className="skill-stack">
                          {d.stack.map(s => (
                            <span className="skill-stack-item" key={s}>
                              {s}
                            </span>
                          ))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 예전엔 "숙련도 85% / 80% / 70%" 막대였고, 옆에 「임시 수치 — 조정
                필요」라는 편집 메모가 화면에 그대로 노출돼 있었다. 문구만 지우면
                근거 없는 자기평가가 사실로 나가므로, **수치 자체를 바꿨다.**
                지금 막대는 아래 프로젝트 목록에서 직접 센 값이라 데이터가 바뀌면
                같이 움직이고, 심사자가 스크롤해서 검산할 수 있다. */}
            <div className="proficiency-section reveal reveal-delay-3">
              <h3 className="proficiency-title">
                작업 비중{" "}
                <span className="proficiency-note">
                  (주요 프로젝트 {mainProjects.length}건 기준)
                </span>
              </h3>
              <div className="proficiency-list">
                {areaWeights.map(w => (
                  <div className="proficiency-item" key={w.label}>
                    <span className="proficiency-label">{w.label}</span>
                    <div className="proficiency-bar">
                      <div
                        className="proficiency-fill"
                        style={
                          {
                            "--target-width": `${Math.round(
                              (w.count / maxWeight) * 100
                            )}%`
                          } as CSSProperties
                        }
                      />
                    </div>
                    <span className="proficiency-value">{w.count}건</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ 02 Education ══════════ */}
        <section>
          <div className="education-container">
            <header className="section-header reveal">
              <span className="section-id">## 02</span>
              <h2 className="section-title">
                학력 · 경력{" "}
                <span className="section-subtitle">(Education)</span>
              </h2>
            </header>
            <div className="education-list">
              {eduMain.map(e => {
                const {name, tag} = parseEdu(e.program);
                return (
                  <article
                    className="edu-card reveal reveal-delay-1"
                    key={`${e.org}-${e.program}`}
                  >
                    <div className="edu-header">
                      <h3 className="edu-name">
                        {e.org} — {name}
                        {tag ? <span className="edu-tag">{tag}</span> : null}
                      </h3>
                      <span className="edu-date">{e.period}</span>
                    </div>
                    <p className="edu-desc">{e.desc}</p>
                    <ul className="edu-detail">
                      {e.bullets.map(b => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </article>
                );
              })}

              {eduExternal.length > 0 ? <div className="edu-divider" /> : null}

              {eduExternal.map(e => (
                <article
                  className="edu-card reveal reveal-delay-2"
                  key={`${e.org}-${e.program}`}
                >
                  <div className="edu-header">
                    <h3 className="edu-name">
                      {e.org} — {e.program}
                    </h3>
                    <span className="edu-date">{e.period}</span>
                  </div>
                  <p className="edu-desc">{e.desc}</p>
                  <ul className="edu-detail">
                    {e.bullets.map(b => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            {/* 활동·경력. 학력 6개와 같은 목록에 섞어 두면 "경력 없음"으로 읽힌다 —
                실제로 총학생회 3대·학생회·동아리 회장·병역이 있는데도 그랬다. */}
            {careers.length > 0 ? (
              <div className="career-block reveal reveal-delay-2">
                <h3 className="career-heading">활동 · 경력</h3>
                <div className="career-list">
                  {careers.map(c => (
                    <article className="career-card" key={`${c.org}-${c.role}`}>
                      <div className="edu-header">
                        <h4 className="edu-name">
                          {c.org}
                          <span className="edu-tag">{c.role}</span>
                        </h4>
                        <span className="edu-date">{c.period}</span>
                      </div>
                      <p className="edu-desc">{c.desc}</p>
                      {/* 활동과 프로젝트가 같은 자리에서 나왔다는 걸 한 줄로 잇는다. */}
                      {c.ledTo ? (
                        <p className="career-led">
                          <span aria-hidden="true">↳</span> 이어진 프로젝트 ·{" "}
                          <b>{c.ledTo}</b>
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 근무 경험. 개발 이력과 섞으면 둘 다 흐려진다 — 한 줄씩만. */}
            {workExperience.length > 0 ? (
              <div className="career-block reveal reveal-delay-2">
                <h3 className="career-heading">근무 경험</h3>
                <ul className="work-list">
                  {workExperience.map(w => (
                    <li className="work-row" key={w.place}>
                      <span className="work-place">{w.place}</span>
                      <span className="work-date">{w.period}</span>
                      <span className="work-desc">{w.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        {/* ══════════ 03 Main Projects ══════════ */}
        <section id="resume-work">
          <div className="projects-container">
            <header className="section-header reveal">
              <span className="section-id">## 03</span>
              <h2 className="section-title">
                주요 프로젝트{" "}
                <span className="section-subtitle">(Main Projects)</span>
              </h2>
            </header>

            <div className="projects-category reveal reveal-delay-1">
              카테고리: Web Service · Data/AI · Game · AR/XR · Ops
            </div>

            {/* 그리드 상태는 class가 아니라 data 속성으로 둔다.
              className에 gridView를 섞으면 리렌더마다 class 속성이 통째로 새로 쓰이고,
              IntersectionObserver가 명령형으로 붙여둔 .active가 지워져 opacity:0으로
              사라진다(토글할 때 프로젝트가 사라졌다 뒤늦게 다시 나타나던 원인). */}
            <div
              className="carousel-wrapper reveal reveal-delay-1"
              data-grid={isGrid ? "true" : "false"}
            >
              <div className="carousel-scene">
                <div className="carousel-track">
                  {mainProjects.map((p, i) => {
                    const cat = CATEGORY_META[p.category];
                    // 카드 전체 클릭은 마우스 편의고, **키보드 경로는 제목 버튼**이다.
                    // 카드를 통째로 <button> 으로 만들면 안쪽 <a>(GitHub·사이트)를
                    // 넣을 수 없다 — 버튼 안의 링크는 유효하지 않은 마크업이다.
                    // 그래서 제목만 버튼으로 올리고 링크는 형제로 둔다.
                    const shownMetrics = (p.metrics ?? []).filter(m => m.value);
                    const links = p.links.filter(l => l.href);
                    return (
                      <div
                        key={p.id}
                        className={`project-card${
                          p.richId ? " clickable" : ""
                        }`}
                        onClick={() => {
                          if (dragMovedRef.current > 6) return;
                          openProject(p);
                        }}
                      >
                        <div className="project-card-header">
                          <span
                            className="project-category"
                            style={{"--cat": cat.color} as CSSProperties}
                          >
                            {cat.label}
                          </span>
                          <span
                            className={`project-status ${
                              p.status === "운영중"
                                ? "status-active"
                                : "status-complete"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="project-card-image">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.title}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <span className="project-card-image-empty">
                              {p.title}
                            </span>
                          )}
                        </div>
                        {p.richId ? (
                          <button
                            type="button"
                            className="project-name project-name-btn"
                            onClick={e => {
                              e.stopPropagation();
                              openProject(p);
                            }}
                          >
                            {p.title}
                          </button>
                        ) : (
                          <div className="project-name">{p.title}</div>
                        )}

                        {/* 기간·팀·역할 — 근거가 없는 값은 데이터에서 비어 있고,
                            비면 그 줄이 통째로 사라진다. 지어내지 않기 위해서다. */}
                        {p.period || p.team ? (
                          <div className="project-meta">
                            {[p.period, p.team].filter(Boolean).join(" · ")}
                          </div>
                        ) : null}
                        {p.role ? (
                          <div className="project-role">{p.role}</div>
                        ) : null}

                        {shownMetrics.length > 0 ? (
                          <div className="project-metrics">
                            {shownMetrics.map(m => (
                              <span className="project-metric" key={m.label}>
                                <b>{m.value}</b>
                                {m.label}
                                {m.provisional ? (
                                  <i
                                    className="metric-provisional"
                                    title="아직 실측하지 않은 임시 수치입니다"
                                  >
                                    잠정
                                  </i>
                                ) : null}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="project-tags">
                          {p.tags.map(t => (
                            <span className="project-tag" key={t}>
                              {t}
                            </span>
                          ))}
                        </div>

                        {links.length > 0 ? (
                          <div className="project-links">
                            {links.map(l => (
                              <a
                                key={l.label}
                                className="project-link"
                                href={l.href}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                              >
                                {l.label} ↗
                              </a>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="carousel-controls">
                <button
                  type="button"
                  className="carousel-btn carousel-prev"
                  onClick={() => rotateRef.current(1)}
                >
                  ←
                </button>
                <span className="carousel-hint">DRAG TO ROTATE</span>
                <button
                  type="button"
                  className="carousel-btn carousel-next"
                  onClick={() => rotateRef.current(-1)}
                >
                  →
                </button>
                {/* 좁은 화면에서는 캐러셀이 성립하지 않으므로 토글도 없다. */}
                {narrow ? null : (
                  <button
                    type="button"
                    className="view-toggle-btn"
                    onClick={() => setGridView(v => !v)}
                  >
                    {gridView ? "캐러셀로 보기" : "한번에 보기"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ 04 Sub Projects ══════════ */}
        <section>
          <div className="side-projects-container">
            <header className="section-header reveal">
              <span className="section-id">## 04</span>
              <h2 className="section-title">
                사이드 프로젝트{" "}
                <span className="section-subtitle">(Sub Projects)</span>
              </h2>
            </header>
            <div className="side-projects-grid reveal reveal-delay-1">
              {subProjects.map(s => (
                <div className="side-project-card" key={s.title}>
                  {s.image ? (
                    <div className="side-project-image">
                      <img
                        src={s.image}
                        alt={s.title}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                  <div className="side-project-name">{s.title}</div>
                  <div className="side-project-desc">{s.desc}</div>
                  {/* href 가 없는 라벨은 **그리지 않는다.** 예전엔 빈 슬롯을
                      `<span class="slot">` 으로 띄워서, 링크처럼 보이는데 눌리지
                      않는 GitHub/Demo/Notion 라벨이 25개 떠 있었다. */}
                  {s.links.some(l => l.href) ? (
                    <div className="side-project-links">
                      {s.links
                        .filter(l => l.href)
                        .map(l => (
                          <a
                            key={l.label}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                            className="side-project-link"
                          >
                            {l.label}
                          </a>
                        ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ 05 Values ══════════ */}
        <section>
          <div className="values-container">
            <header className="section-header reveal">
              <span className="section-id">## 05</span>
              <h2 className="section-title">
                일하는 태도{" "}
                <span className="section-subtitle">(Values I Believe In)</span>
              </h2>
            </header>
            <div className="values-grid reveal reveal-delay-1">
              {values.map(v => (
                <div className="value-card" key={v.title}>
                  <h3 className="value-title">{v.title}</h3>
                  <p className="value-desc">{v.desc}</p>
                  {/* 형용사만 있으면 서류에서 가장 먼저 스킵되는 블록이다.
                      실제로 있었던 일 한 줄이 붙어야 읽힌다. */}
                  {v.evidence ? (
                    <p className="value-evidence">{v.evidence}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ 06 Development Records ══════════ */}
        {/* URL 이 있는 것만 그린다 — 하나도 없으면 섹션째 사라진다. */}
        {devRecords.some(r => r.href) ? (
          <section>
            <div className="records-container">
              <header className="section-header reveal">
                <span className="section-id">## 06</span>
                <h2 className="section-title">
                  개발 기록{" "}
                  <span className="section-subtitle">
                    (Development Records)
                  </span>
                </h2>
              </header>
              <div className="records-grid reveal reveal-delay-1">
                {devRecords
                  .filter(r => r.href)
                  .map(r => (
                    <a
                      className="record-card"
                      href={r.href}
                      key={r.title}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <h3 className="record-title">
                        {r.title} <span aria-hidden="true">↗</span>
                      </h3>
                      <p className="record-desc">{r.desc}</p>
                    </a>
                  ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ══════════ 06 About ══════════ */}
        <section>
          <div className="about-container">
            <header className="section-header reveal">
              <span className="section-id">## 07</span>
              <h2 className="section-title">About Me</h2>
            </header>
            <div className="about-list reveal reveal-delay-1">
              {aboutMe.map(line => (
                <p className="about-item" key={line}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ 07 Contact ══════════ */}
        <section id="resume-contact">
          <div className="contact-container">
            <header className="section-header reveal">
              <span className="section-id">## 08</span>
              <h2 className="section-title">
                연락처 <span className="section-subtitle">(Contact)</span>
              </h2>
            </header>
            <p className="contact-intro reveal reveal-delay-1">
              {contact.message}
            </p>
            <div className="contact-links reveal reveal-delay-2">
              <a href={`mailto:${contact.email}`} className="contact-link">
                <span className="contact-link-label">Email</span>
                <span>{contact.email}</span>
              </a>
              <a
                href={contact.github}
                target="_blank"
                rel="noreferrer"
                className="contact-link"
              >
                <span className="contact-link-label">GitHub</span>
                <span>github.com/toadsam</span>
              </a>
              <a className="contact-link" download href={resumePdf}>
                <span className="contact-link-label">이력서</span>
                <span>PDF 내려받기 ⬇</span>
              </a>
              <button
                type="button"
                className="village-btn"
                onClick={onEnterVillage}
                style={{padding: "16px 32px"}}
              >
                🏘 3D 개발자 마을 탐험하기 →
              </button>
              {touchOnly ? (
                <p
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    lineHeight: 1.6,
                    opacity: 0.55
                  }}
                >
                  마을은 마우스·키보드로 돌아다니는 곳이라, PC에서 훨씬 잘
                  동작해요. (약 25MB를 내려받습니다)
                </p>
              ) : null}
            </div>

            {/* 떠 있는 마을 섬 — 바로 위 「3D 개발자 마을 탐험하기」 버튼의 예고편.
                밤 숲길을 걸어 내려온 끝에 마을이 보인다는 흐름을 여기서 닫는다. */}
            <FloatingIsle />
          </div>
        </section>
      </div>

      {/* 프로젝트 상세 — 리치 데이터 있는 프로젝트만 원페이지로.
          .resume-terminal 밖에 둔다: ResumeTerminal.css의 main/nav/section 규칙이
          엘리먼트 선택자라 Tailwind 유틸리티보다 특정도가 높아 원페이지 레이아웃을 덮어쓴다. */}
      <ProjectOnePager
        project={selectedRich === null ? null : richList[selectedRich]}
        index={selectedRich ?? undefined}
        total={richList.length}
        onClose={() => setSelectedRich(null)}
        onPrev={
          selectedRich !== null && selectedRich > 0
            ? () => setSelectedRich(selectedRich - 1)
            : undefined
        }
        onNext={
          selectedRich !== null && selectedRich < richList.length - 1
            ? () => setSelectedRich(selectedRich + 1)
            : undefined
        }
      />
    </>
  );
}
