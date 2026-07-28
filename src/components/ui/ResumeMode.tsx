"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from "react";
import * as THREE from "three";
import {projects} from "@/data/projects";
import {getTechIcon} from "@/data/techIcons";
import {
  aboutMe,
  contact,
  education,
  hero,
  mainProjects,
  proficiency,
  skillChips,
  skillDetails,
  subProjects,
  values,
  type MainProjectCard
} from "@/data/resume";
import type {ProjectData} from "@/types/portfolio";
import {ProjectOnePager} from "./ProjectOnePager";
import "./ResumeTerminal.css";

// 학력: "학과명 (전공)" 에서 태그 분리
function parseEdu(program: string): {name: string; tag: string | null} {
  const m = program.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? {name: m[1], tag: m[2]} : {name: program, tag: null};
}
const isAcademic = (program: string) =>
  /\((전공|복수전공|부전공)\)/.test(program);

interface Props {
  onEnterVillage: () => void;
}

export function ResumeMode({onEnterVillage}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef(false);
  const dragMovedRef = useRef(0);
  const rotateRef = useRef<(dir: number) => void>(() => {});
  // 캐러셀 복귀 시 다음 rAF를 기다리지 않고 즉시 카드 배치를 다시 계산하기 위한 통로
  const updateRef = useRef<() => void>(() => {});

  const [gridView, setGridView] = useState(false);
  const [selectedRich, setSelectedRich] = useState<number | null>(null);

  const eduMain = useMemo(
    () => education.filter(e => isAcademic(e.program)),
    []
  );
  const eduExternal = useMemo(
    () => education.filter(e => !isAcademic(e.program)),
    []
  );

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

  // ── Three.js 히어로 (와이어프레임 + 파티클) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(500, 500);

    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const particlesGeometry = new THREE.BufferGeometry();
    const count = 500;
    const posArray = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++)
      posArray[i] = (Math.random() - 0.5) * 10;
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x00f5ff
    });
    const points = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(points);

    camera.position.z = 5;

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      mesh.rotation.x += 0.002;
      mesh.rotation.y += 0.002;
      points.rotation.y -= 0.001;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      geometry.dispose();
      material.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

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
      {threshold: 0.1, rootMargin: "0px 0px -50px 0px"}
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

    const radius = 480;
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

    track.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    track.addEventListener("touchstart", onDown, {passive: true});
    window.addEventListener("touchmove", onMove, {passive: true});
    window.addEventListener("touchend", onUp);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      track.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  // ── 그리드 뷰 토글 시 인라인 트랜스폼 정리 ──
  // useEffect가 아니라 useLayoutEffect여야 한다. useEffect는 페인트 "이후"라,
  // 캐러셀이 넣어둔 인라인 transform(rotateY)이 남은 채로 그리드가 한 프레임 그려지고
  // backface-visibility: hidden 탓에 뒤를 향한 카드가 사라져 보인다.
  // gridRef도 여기서 먼저 뒤집어야 rAF 루프가 transform을 다시 써넣지 않는다.
  useLayoutEffect(() => {
    gridRef.current = gridView;
    const root = rootRef.current;
    if (!root) return;
    if (gridView) {
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
  }, [gridView]);

  return (
    <>
    <div className="resume-terminal" ref={rootRef}>
      {/* ══════════ 히어로 뷰포트 ══════════ */}
      <div className="viewport">
        <header>
          <div className="brand">
            <div className="logo-orb" />
            <span>CORE_SYSTEM // 정재훈.SYS</span>
          </div>
          <div className="nav-capsule">
            <button type="button" className="active">
              ARCHIVE
            </button>
            <button type="button">LABS</button>
            <button type="button">TERMINAL</button>
          </div>
          <button
            type="button"
            className="village-btn"
            onClick={onEnterVillage}
          >
            🏘 3D 마을 탐험 →
          </button>
        </header>

        <aside className="left-rail">
          <div className="vertical-text">TECHNICAL MANIFESTO 2026</div>
        </aside>

        <main>
          <div className="xr-canvas-container">
            <canvas id="mesh-canvas" ref={canvasRef} />
          </div>
          <div className="main-title-wrap">
            <h1 className="hero-name reveal reveal-delay-1">
              <span>{hero.name}</span>
              <span className="filled">{hero.name}</span>
            </h1>
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
              // SYSTEM_BOOT: 웹 아키텍처와 XR 인터랙션을 결합해, 운영에서
              생기는 마찰을 풀스택 구현으로 해결합니다.
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
          <div
            style={{
              marginLeft: "auto",
              fontFamily: "var(--mono)",
              color: "var(--accent)",
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <span className="logo-orb" style={{width: 6, height: 6}} />
            SYSTEM STATUS: OPTIMIZED
          </div>
        </footer>
      </div>

      {/* ══════════ 01 Skills ══════════ */}
      <section>
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
                    icon ? ({"--brand": icon.color} as CSSProperties) : undefined
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
                    <td>{d.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="proficiency-section reveal reveal-delay-3">
            <h3 className="proficiency-title">
              숙련도{" "}
              <span className="proficiency-note">(임시 수치 — 조정 필요)</span>
            </h3>
            <div className="proficiency-list">
              {proficiency.map(p => (
                <div className="proficiency-item" key={p.label}>
                  <span className="proficiency-label">{p.label}</span>
                  <div className="proficiency-bar">
                    <div
                      className="proficiency-fill"
                      style={
                        {"--target-width": `${p.percent}%`} as CSSProperties
                      }
                    />
                  </div>
                  <span className="proficiency-value">{p.percent}%</span>
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
              학력 · 경력 <span className="section-subtitle">(Education)</span>
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
        </div>
      </section>

      {/* ══════════ 03 Main Projects ══════════ */}
      <section>
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
            data-grid={gridView ? "true" : "false"}
          >
            <div className="carousel-scene">
              <div className="carousel-track">
                {mainProjects.map((p, i) => (
                  <div
                    key={p.id}
                    className={`project-card${p.richId ? " clickable" : ""}`}
                    onClick={() => {
                      if (dragMovedRef.current > 6) return;
                      openProject(p);
                    }}
                  >
                    <div className="project-card-header">
                      <span className="project-number">
                        #{String(i + 1).padStart(2, "0")}
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
                        <img src={p.image} alt={p.title} />
                      ) : (
                        <>
                          IMG_{String(i + 1).padStart(2, "0")}
                          <br />
                          이미지 자리
                        </>
                      )}
                    </div>
                    <div className="project-name">{p.title}</div>
                    <div className="project-tags">
                      {p.tags.map(t => (
                        <span className="project-tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
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
              <button
                type="button"
                className="view-toggle-btn"
                onClick={() => setGridView(v => !v)}
              >
                {gridView ? "캐러셀로 보기" : "한번에 보기"}
              </button>
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
                    <img src={s.image} alt={s.title} />
                  </div>
                ) : null}
                <div className="side-project-name">{s.title}</div>
                <div className="side-project-desc">{s.desc}</div>
                <div className="side-project-links">
                  {s.links.map(l =>
                    l.href ? (
                      <a
                        key={l.label}
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="side-project-link"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <span
                        key={l.label}
                        className="side-project-link slot"
                        title="링크 추가 예정"
                      >
                        {l.label}
                      </span>
                    )
                  )}
                </div>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 06 About ══════════ */}
      <section>
        <div className="about-container">
          <header className="section-header reveal">
            <span className="section-id">## 06</span>
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
      <section>
        <div className="contact-container">
          <header className="section-header reveal">
            <span className="section-id">## 07</span>
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
            <button
              type="button"
              className="village-btn"
              onClick={onEnterVillage}
              style={{padding: "16px 32px"}}
            >
              🏘 3D 개발자 마을 탐험하기 →
            </button>
          </div>
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
