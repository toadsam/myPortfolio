/**
 * `/resume` v2 — 흰 바탕에 떠 있는 판형 이력서.
 *
 * 승인된 시안(c-family-v6.html)을 그대로 옮겼다. 이 파일은 서버 컴포넌트라
 * 첫 HTML 에 이력서 글이 전부 들어간다. 움직임은 안에 하나 붙은
 * `ResumeV2Motion`(클라이언트)이 이 마크업 위에 얹는다.
 *
 * 입장 연출용 클래스(`enter`·`play`)는 서버에서부터 붙여 둔다. 순수 CSS
 * 애니메이션이라 JS 가 늦게 와도 첫 그림부터 연출이 돌고, JS 가 없어도 끝 상태는
 * 보이는 상태다. 스크롤 등장용 숨김(`rv-wait`)만 JS 가 붙인다.
 */

import type {CSSProperties, ReactNode} from "react";
import Link from "next/link";
import {Nunito} from "next/font/google";
import {
  CATEGORY_META,
  FACET_META,
  careers,
  certifications,
  contact,
  education,
  hero,
  mainProjects,
  resumePdf,
  subProjects
} from "@/data/resume";

// 카드 꼬리표: 종류 하나 + 성격 둘 이하. 상세 머리(.p4-kinds)와 같은 규칙이고
// 이름은 resume.ts 의 사전에서만 온다. 타일 id 가 카드 id 와 다른 것은 village 하나.
const CARD_ID: Record<string, string> = {village: "village-portfolio"};
function Kinds({id}: {id: string}) {
  const card = mainProjects.find(p => p.id === (CARD_ID[id] ?? id));
  if (!card) return null;
  const facets = (card.facets ?? [])
    .filter(
      f =>
        !(card.category === "data" && (f === "ai" || f === "data")) &&
        !(card.category === "game" && f === "game")
    )
    .slice(0, 2);
  return (
    <span className="kinds">
      <span className="kind">{CATEGORY_META[card.category].label}</span>
      {facets.map(f => (
        <span className="facet" key={f}>
          {FACET_META[f].label}
        </span>
      ))}
    </span>
  );
}

// 리뉴얼 칩. 다시 만든 프로젝트는 카드에서 바로 보이게 한다(2026-11-15 본인 요청).
// 값은 resume.ts 의 renewed(마친 시점) · renewal(예정)에서만 온다.
function Renew({id}: {id: string}) {
  const card = mainProjects.find(p => p.id === (CARD_ID[id] ?? id));
  if (!card) return null;
  if (card.renewed) return <span className="renew">{card.renewed} 리뉴얼</span>;
  if (card.renewal) return <span className="renew soon">리뉴얼 예정</span>;
  return null;
}

// 사이드 프로젝트 중 상세 페이지가 있는 것. 제목이 그 상세로 간다.
const SUB_DETAIL: Record<string, string> = {
  DarkLab: "darklab",
  아주분투: "ajou-adventure"
};
import {
  ACT_LED,
  ACT_ROLE,
  AWARDS,
  BALLS,
  CHIPS,
  EDU_HOW,
  NUMS,
  OTHERS,
  SHORT,
  SKILL_ROWS,
  TILES,
  WORK,
  detailHref,
  img
} from "./resumeV2Data";
import {ResumeV2Motion} from "./ResumeV2Motion";
import "./resumeV2.css";

// 숫자·라틴용 둥근 글꼴. 한글은 레이아웃이 싣는 Noto Sans KR(--font-body-kr)로 떨어진다.
const nunito = Nunito({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap"
});

const cv = (o: Record<string, string | number>) => o as CSSProperties;

const CHEV = (
  <svg className="chev" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M5 8l5 5 5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LED_ARROW = (
  <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** 히어로 둘레의 파란 물건 여섯 개 */
const OBS: {
  label: string;
  r?: boolean;
  style: Record<string, string | number>;
  svg: ReactNode;
}[] = [
  {
    label: "득근득근 회장",
    style: {
      "--x": "66px",
      "--y": "124px",
      "--r": "-14deg",
      "--t": "7s",
      "--w": "134px",
      "--d": 16,
      "--n": 0
    },
    svg: (
      <>
        <rect
          x="30"
          y="44"
          width="40"
          height="12"
          rx="6"
          fill="var(--accent-mid)"
        />
        <rect
          x="6"
          y="33"
          width="12"
          height="34"
          rx="6"
          fill="var(--accent-light)"
        />
        <rect
          x="82"
          y="33"
          width="12"
          height="34"
          rx="6"
          fill="var(--accent-light)"
        />
        <rect
          x="18"
          y="22"
          width="16"
          height="56"
          rx="8"
          fill="var(--accent)"
        />
        <rect
          x="66"
          y="22"
          width="16"
          height="56"
          rx="8"
          fill="var(--accent)"
        />
      </>
    )
  },
  {
    label: "총학생회 3년",
    style: {
      "--x": "96px",
      "--y": "306px",
      "--r": "-6deg",
      "--t": "6.5s",
      "--dl": "-1s",
      "--w": "118px",
      "--d": 11,
      "--n": 1
    },
    svg: (
      <>
        <rect
          x="30"
          y="58"
          width="12"
          height="26"
          rx="6"
          fill="var(--accent-mid)"
        />
        <path
          d="M24 39 L60 21 Q68 17 68 26 V74 Q68 83 60 79 L24 61 Z"
          fill="var(--accent)"
        />
        <rect
          x="10"
          y="37"
          width="20"
          height="26"
          rx="8"
          fill="var(--accent-mid)"
        />
        <path
          d="M78 38 Q85 50 78 62"
          fill="none"
          stroke="var(--accent-mid)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M87 29 Q98 50 87 71"
          fill="none"
          stroke="var(--accent-light)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </>
    )
  },
  {
    label: "AjouFesta 현장 운영",
    style: {
      "--x": "44px",
      "--y": "474px",
      "--r": "9deg",
      "--t": "8.5s",
      "--dl": "-4s",
      "--w": "130px",
      "--d": 14,
      "--n": 2
    },
    svg: (
      <>
        <path
          d="M18 26 H56 A7 7 0 0 0 70 26 H82 A10 10 0 0 1 92 36 V64 A10 10 0 0 1 82 74 H70 A7 7 0 0 0 56 74 H18 A10 10 0 0 1 8 64 V36 A10 10 0 0 1 18 26 Z"
          fill="var(--accent)"
        />
        <path
          d="M63 39 V61"
          fill="none"
          stroke="var(--accent-light)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="1 7"
        />
        <rect
          x="19"
          y="39"
          width="30"
          height="7"
          rx="3.5"
          fill="var(--accent-light)"
        />
        <rect
          x="19"
          y="53"
          width="20"
          height="7"
          rx="3.5"
          fill="var(--accent-mid)"
        />
        <circle cx="79" cy="50" r="5.5" fill="var(--accent-light)" />
      </>
    )
  },
  {
    label: "Backend · Spring Boot",
    r: true,
    style: {
      "--x": "80px",
      "--y": "140px",
      "--r": "7deg",
      "--t": "8s",
      "--dl": "-2s",
      "--w": "124px",
      "--d": 15,
      "--n": 3
    },
    svg: (
      <>
        <path d="M20 66 V78 A30 10 0 0 0 80 78 V66 Z" fill="var(--accent)" />
        <ellipse cx="50" cy="66" rx="30" ry="10" fill="var(--accent-mid)" />
        <path d="M20 44 V56 A30 10 0 0 0 80 56 V44 Z" fill="var(--accent)" />
        <ellipse cx="50" cy="44" rx="30" ry="10" fill="var(--accent-mid)" />
        <path d="M20 22 V34 A30 10 0 0 0 80 34 V22 Z" fill="var(--accent)" />
        <ellipse cx="50" cy="22" rx="30" ry="10" fill="var(--accent-light)" />
      </>
    )
  },
  {
    label: "AI 포트폴리오 마을",
    r: true,
    style: {
      "--x": "64px",
      "--y": "356px",
      "--r": "-8deg",
      "--t": "7.5s",
      "--dl": "-3s",
      "--w": "128px",
      "--d": 12,
      "--n": 4
    },
    svg: (
      <>
        <rect
          x="65"
          y="18"
          width="12"
          height="24"
          rx="4"
          fill="var(--accent-mid)"
        />
        <rect
          x="20"
          y="44"
          width="60"
          height="44"
          rx="10"
          fill="var(--accent-mid)"
        />
        <path
          d="M50 18 L86 48 H14 Z"
          fill="var(--accent)"
          stroke="var(--accent)"
          strokeWidth="9"
          strokeLinejoin="round"
        />
        <rect
          x="43"
          y="62"
          width="14"
          height="26"
          rx="7"
          fill="var(--accent)"
        />
        <rect
          x="27"
          y="60"
          width="10"
          height="10"
          rx="3.5"
          fill="var(--accent-light)"
        />
        <rect
          x="63"
          y="60"
          width="10"
          height="10"
          rx="3.5"
          fill="var(--accent-light)"
        />
      </>
    )
  },
  {
    label: "국원에서 국장으로",
    r: true,
    style: {
      "--x": "118px",
      "--y": "506px",
      "--r": "5deg",
      "--t": "9s",
      "--dl": "-5s",
      "--w": "112px",
      "--d": 10,
      "--n": 5
    },
    svg: (
      <>
        <rect
          x="10"
          y="64"
          width="80"
          height="24"
          rx="8"
          fill="var(--accent-light)"
        />
        <rect
          x="36"
          y="42"
          width="54"
          height="26"
          rx="8"
          fill="var(--accent-mid)"
        />
        <rect
          x="62"
          y="16"
          width="28"
          height="30"
          rx="8"
          fill="var(--accent)"
        />
      </>
    )
  }
];

function Row({
  when,
  logo,
  what,
  tag,
  how,
  children
}: {
  when: string;
  logo?: string;
  what: string;
  /** 이름 옆 작은 꼬리표(전공 · 복수전공 · 마이크로전공) */
  tag?: string;
  how?: string;
  children?: ReactNode;
}) {
  return (
    <div className="row">
      <span className="when">{when}</span>
      {logo ? (
        <img
          className="logo"
          src={logo}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <span className="what">
        {what}
        {tag ? <i className="rtag">{tag}</i> : null}
      </span>
      {how ? <span className="how">{how}</span> : null}
      {children}
    </div>
  );
}

export function ResumeV2() {
  const headline = `${hero.headlineLines[0]} ${hero.headlineLines[1]}`;
  const words = headline.split(" ");
  const githubLabel = contact.github.replace(/^https?:\/\//, "");
  const sumMeta = `${hero.roleTag} · ${hero.availability}`;
  const eduRows = education.filter(e => e.org !== "아주대학교");

  return (
    <div className={`rv2 ${nunito.variable}`}>
      <nav className="pill enter" aria-label="구역 이동">
        <span className="ind" id="ind" aria-hidden="true" />
        <Link className="back" href="/">
          ←<span>&nbsp;처음으로</span>
        </Link>
        <button type="button" data-go="intro" aria-current="true">
          소개
        </button>
        <button type="button" data-go="projects">
          프로젝트
        </button>
        <button type="button" data-go="skills">
          기술
        </button>
        <button type="button" data-go="contact">
          연락
        </button>
        <button
          type="button"
          className="sumbtn"
          data-sum=""
          aria-haspopup="dialog"
        >
          30초<span>&nbsp;요약</span>
        </button>
        <a className="pdf press" href={resumePdf} download data-pdf="PDF">
          <span className="lbl">PDF</span>
        </a>
      </nav>

      <main>
        <div className="wrap hero enter" id="intro" data-sec="intro">
          <p className="eyebrow">{hero.roleTag}</p>
          <h1 id="headline" className="play" aria-label={headline}>
            {words.map((w, i) => (
              <span
                className="w"
                aria-hidden="true"
                style={cv({"--i": i})}
                key={i}
              >
                {w + (i < words.length - 1 ? " " : "")}
              </span>
            ))}
          </h1>
          <p className="who">
            개발자 <b>{hero.name}</b>입니다.
          </p>
          <div className="chips">
            {CHIPS.map(c => (
              <span className={c.on ? "chip on" : "chip"} key={c.text}>
                {c.text}
              </span>
            ))}
          </div>
          <div className="cta">
            <button type="button" className="btn press" data-go="projects">
              프로젝트 보기
            </button>
            <a
              className="btn soft press"
              href={resumePdf}
              download
              data-pdf="이력서 PDF 받기"
            >
              <span className="lbl">이력서 PDF 받기</span>
            </a>
          </div>
          <div className="obs" id="obs">
            {OBS.map(o => (
              <button
                type="button"
                className={o.r ? "ob r" : "ob"}
                aria-label={o.label}
                style={cv(o.style)}
                key={o.label}
              >
                <span className="ob-in">
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    {o.svg}
                  </svg>
                </span>
                <span className="tag" aria-hidden="true">
                  {o.label}
                </span>
              </button>
            ))}
          </div>
          <p className="ob-cap" id="obCap" aria-hidden="true" />
        </div>

        <section className="wrap" aria-labelledby="h-num">
          <h2 className="sec-eyebrow rv" id="h-num">
            만든 서비스를 실제로 썼습니다
          </h2>
          <p className="sec-p rv">
            타일을 누르면 숫자의 출처와 기간이 나옵니다.
          </p>
          <div className="nums" id="nums">
            {NUMS.map(([val, lab, from, src], i) => {
              const m = /^([\d,]+)(.*)$/.exec(val);
              const n = m ? m[1] : val;
              const unit = m ? m[2] : "";
              return (
                <button
                  type="button"
                  className="ntile press rv"
                  style={cv({"--i": i})}
                  aria-expanded="false"
                  key={from}
                >
                  <span className="from">{from}</span>
                  <span className="big">
                    <span className="num" data-roll="">
                      {n}
                    </span>
                    <span className="unit">{unit}</span>
                  </span>
                  <span className="lab">
                    <span>{lab}</span>
                    {CHEV}
                  </span>
                  <span className="src">
                    <span>
                      <span className="srcp">{src}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section
          className="wrap"
          id="projects"
          data-sec="projects"
          aria-labelledby="h-proj"
        >
          <h2 className="sec-h rv" id="h-proj">
            겪은 불편에서 시작한 프로젝트
          </h2>
          <p className="sec-p rv">
            타일을 누르면 그 프로젝트의 상세 페이지로 갑니다.
          </p>
          <div className="tiles sec-body">
            {TILES.map(t => {
              const className = `ptile${t.w ? ` w${t.w}` : ""} rv`;
              const style = t.i ? cv({"--i": t.i}) : undefined;
              const inner = (
                <>
                  <span className="pic">
                    <i className="shine" aria-hidden="true" />
                    <img src={img(t.id)} alt="" decoding="async" />
                  </span>
                  <span className="body">
                    <Kinds id={t.id} />
                    <span className="ph3" role="heading" aria-level={3}>
                      {t.title}{" "}
                      <span className={t.badgeOn ? "badge on" : "badge"}>
                        {t.badge}
                      </span>
                      <Renew id={t.id} />
                    </span>
                    <span className="short">
                      {SHORT[t.id] ??
                        "5인 팀이 4개월 만에 Steam 에 출시한 3D 액션 플랫폼 게임입니다. 부팀장으로 스테이지 2와 기믹을 맡았습니다."}
                    </span>
                    <span className="key">
                      <b className="num">{t.key}</b>
                      {t.keyLabel}
                    </span>
                  </span>
                </>
              );
              // 타일은 전부 상세로 바로 간다(2026-11-13, 여섯 상세가 다 채워진 뒤 본인 결정).
              // 제자리 판(data-open)은 "대표 프로젝트" 카드의 옛 데이터·칩에서만 쓴다.
              // a[data-detail] 은 Motion 의 클릭 처리에서 라우터로 옮긴다.
              return (
                <a
                  className={className}
                  href={detailHref(t.id)}
                  data-detail=""
                  style={style}
                  key={t.id}
                >
                  {inner}
                </a>
              );
            })}
          </div>
        </section>

        <section className="wrap" aria-labelledby="h-other">
          {/* 위 여섯 타일과 같은 무게의 대표 프로젝트 다섯. "그 밖의"는 본인이 거절("여기가 훨씬 더 중요한
              대표 프로젝트야", 2026-11-13). 사이드 프로젝트는 그 아래 한참 작게 간다. */}
          <h2 className="sec-h rv" id="h-other">
            대표 프로젝트
          </h2>
          <p className="sec-p rv">
            위 여섯과 함께 이력서에 적은 프로젝트입니다. 카드를 누르면 상세로
            갑니다.
          </p>
          <div className="others sec-body">
            {/* img 키가 RICH_DATA 의 id 와 같다. 카드도 상세로 바로 간다(2026-11-13). */}
            {OTHERS.map((o, i) => (
              <a
                className="other rv"
                href={detailHref(o.img)}
                data-detail=""
                style={cv({"--i": i})}
                key={o.title}
              >
                <img src={img(o.img)} alt="" loading="lazy" decoding="async" />
                <Kinds id={o.img} />
                <b>
                  {o.title} <Renew id={o.img} />
                </b>
                <span>{o.desc}</span>
              </a>
            ))}
          </div>
          {/* 사이드 프로젝트 — 옛 이력서(ResumeMode)의 "사이드 프로젝트" 절. 접힌 목록(거절) → 큰 카드 격자(거절:
              "대표 프로젝트보다 훨씬 작아야지") → 작은 줄 카드(2026-11-13 저녁). 썸네일 44px + 제목 + 한 줄.
              그림 없는 넷은 첫 글자 판. 상세가 있는 것(DarkLab·아주분투)은 상세로, 나머지는 첫 링크로 간다. */}
          <h3 className="subs-h rv" id="h-subs">
            사이드 프로젝트{" "}
            <small>{subProjects.length}개 · 수업·해커톤·개인 실험</small>
          </h3>
          <div className="subs sec-body" aria-labelledby="h-subs">
            {subProjects.map((s, i) => {
              const detail = SUB_DETAIL[s.title];
              const first = s.links[0];
              const href = detail ? detailHref(detail) : first?.href;
              const ext = !detail && !!first;
              const linkProps = ext
                ? {target: "_blank", rel: "noreferrer"}
                : {"data-detail": ""};
              const rest = detail ? s.links : s.links.slice(1);
              return (
                <article
                  className="sub rv"
                  style={cv({"--i": i})}
                  key={s.title}
                >
                  <span className="sub-pic" aria-hidden="true">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="sub-mono">
                        {s.title.trim().slice(0, 1)}
                      </span>
                    )}
                  </span>
                  <div className="sub-body">
                    {href ? (
                      <a className="sub-t" href={href} {...linkProps}>
                        {s.title}
                      </a>
                    ) : (
                      <b className="sub-t">{s.title}</b>
                    )}
                    <span className="sub-d">{s.desc}</span>
                    {detail || rest.length ? (
                      <span className="sub-links">
                        {detail ? (
                          <a href={detailHref(detail)} data-detail="">
                            상세
                          </a>
                        ) : null}
                        {rest.map(l => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {l.label}
                          </a>
                        ))}
                      </span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          className="wrap"
          id="skills"
          data-sec="skills"
          aria-labelledby="h-skill"
        >
          <h2 className="sec-h rv" id="h-skill">
            기술
          </h2>
          <p className="sec-p rv">
            공을 누르면 그 기술을 쓴 대표 프로젝트가 나옵니다. 표에서는 진한
            것이 주력입니다.
          </p>
          <div className="balls-card rv">
            <div
              className="balls"
              id="balls"
              aria-label={`주력 기술 ${BALLS.length}개`}
            >
              {BALLS.map(b =>
                b.big ? (
                  <button
                    type="button"
                    className="ball"
                    data-big=""
                    key={b.name}
                  >
                    {b.name}
                  </button>
                ) : (
                  <button type="button" className="ball" key={b.name}>
                    {b.name}
                  </button>
                )
              )}
            </div>
            <div className="ball-out" id="ballOut" aria-live="polite">
              <span>
                공을 누르면 그 기술을 쓴 대표 프로젝트가 여기에 나옵니다.
              </span>
            </div>
          </div>
          <div className="card sec-body rv">
            {SKILL_ROWS.map(r => (
              <div className="row" key={r.area}>
                <span className="when">{r.area}</span>
                <span className="what">{r.what}</span>
                <span className="stack">
                  {r.main.map(s => (
                    <b key={s}>{s}</b>
                  ))}
                  {r.more.map(s => (
                    <i key={s}>{s}</i>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="wrap" aria-labelledby="h-act">
          <h2 className="sec-h rv" id="h-act">
            활동에서 프로젝트가 나왔습니다
          </h2>
          <p className="sec-p rv">
            파란 버튼을 누르면 그 활동에서 이어진 프로젝트가 열립니다.
          </p>
          <div className="card sec-body rv">
            {careers.map(c => {
              const led = ACT_LED[c.org];
              return (
                <Row
                  when={c.period}
                  logo={c.logo}
                  what={c.org}
                  how={ACT_ROLE[c.org] ?? c.role}
                  key={c.org}
                >
                  {led ? (
                    <a
                      className="led press"
                      href={detailHref(led.id)}
                      data-detail=""
                    >
                      {led.label} {LED_ARROW}
                    </a>
                  ) : null}
                </Row>
              );
            })}
          </div>
        </section>

        <section className="wrap" aria-labelledby="h-cert">
          <h2 className="sec-h rv" id="h-cert">
            자격증 · 학력 · 수상
          </h2>
          <div className="two sec-body">
            <div className="card rv">
              <h3>자격증</h3>
              {certifications.map(c => (
                <Row
                  when={`${c.date} · ${c.grade}`}
                  logo={c.logo}
                  what={c.name}
                  how={c.org}
                  key={c.name}
                />
              ))}
              <h3>학력</h3>
              {/* 전공 · 복수전공 · 마이크로전공을 한 줄씩. program 의 괄호 안이 꼬리표다(resume.ts). */}
              {education
                .filter(e => e.org === "아주대학교")
                .map(e => {
                  const m = e.program.match(/^(.*?)\s*\((.+)\)$/);
                  return (
                    <Row
                      when={e.period}
                      logo={e.logo}
                      what={`${e.org} ${m ? m[1] : e.program}`}
                      tag={m ? m[2] : undefined}
                      how={e.gpa ?? e.bullets?.[0] ?? e.desc}
                      key={e.program}
                    />
                  );
                })}
            </div>
            <div className="card rv" style={cv({"--i": 1})}>
              <h3>수상 · 수료</h3>
              {AWARDS.map(a => (
                <Row {...a} key={a.what} />
              ))}
            </div>
          </div>
        </section>

        <section className="wrap" aria-labelledby="h-edu">
          <h2 className="sec-h rv" id="h-edu">
            교육 · 근무 경험
          </h2>
          <div className="two sec-body">
            <div className="card rv">
              <h3>교육</h3>
              {eduRows.map(e => (
                <Row
                  when={e.period}
                  logo={e.logo}
                  what={`${e.org} · ${e.program}`}
                  how={EDU_HOW[e.org] ?? e.desc}
                  key={e.org}
                />
              ))}
            </div>
            <div className="card rv" style={cv({"--i": 1})}>
              <h3>근무 경험</h3>
              {WORK.map(w => (
                <Row {...w} key={w.what} />
              ))}
            </div>
          </div>
        </section>

        <section
          className="wrap"
          id="contact"
          data-sec="contact"
          aria-labelledby="h-contact"
        >
          <div className="contact rv">
            <h2 id="h-contact">연락은 이메일이 가장 빠릅니다</h2>
            <p>버튼을 누르면 주소가 복사됩니다.</p>
            <div className="cta">
              <button
                type="button"
                className="btn press"
                data-copy={contact.email}
                data-label={`${contact.email} 복사`}
              >
                <span className="lbl">{contact.email} 복사</span>
              </button>
              <button
                type="button"
                className="btn line press"
                data-copy={contact.github}
                data-label={`${githubLabel} 복사`}
              >
                <span className="lbl">{githubLabel} 복사</span>
              </button>
            </div>
          </div>
          <p className="thanks" id="thanks">
            끝까지 읽어 주셔서 고맙습니다.
          </p>
          {/* 시안의 "PDF 미연결" 안내는 실제로 연결했으므로 뺐다. 아래 여백만 남긴다 */}
          <p className="note" aria-hidden="true" />
        </section>
      </main>

      <i
        className="bgd"
        aria-hidden="true"
        style={cv({
          left: "-6vw",
          top: "8vh",
          width: "34vw",
          height: "34vw",
          "--t": "26s",
          "--dx": "50px",
          "--dy": "-40px"
        })}
      />
      <i
        className="bgd"
        aria-hidden="true"
        style={cv({
          right: "-8vw",
          top: "30vh",
          width: "40vw",
          height: "40vw",
          "--t": "34s",
          "--dl": "-9s",
          "--dx": "-60px",
          "--dy": "50px"
        })}
      />
      <i
        className="bgd"
        aria-hidden="true"
        style={cv({
          left: "30vw",
          bottom: "-10vh",
          width: "30vw",
          height: "30vw",
          "--t": "30s",
          "--dl": "-17s",
          "--dx": "40px",
          "--dy": "-70px"
        })}
      />
      <div className="scrim" id="scrim" />
      <div
        className="tray"
        id="tray"
        role="dialog"
        aria-modal="true"
        aria-label="프로젝트 상세"
      >
        <div className="fit" id="fit">
          <div className="grab" id="grab" aria-hidden="true">
            <i />
          </div>
          <div className="tray-head" id="trayHead">
            <b id="trayTitle" />
            <span className="stepname" id="trayStep" />
            <button
              type="button"
              className="icon-btn press"
              id="trayIcon"
              aria-label="닫기"
            />
          </div>
          <div className="tray-in" id="trayIn" />
          <div className="tray-foot" id="trayFoot">
            <span className="sdots" id="sdots" aria-hidden="true" />
            {/* 상세 페이지는 단계와 상관없이 늘 바로 갈 수 있게 둔다 */}
            <a
              className="btn soft press"
              id="trayDetail"
              data-detail=""
              href="/resume"
              hidden
            >
              상세 페이지
            </a>
            <button type="button" className="btn press" id="nextBtn">
              <span className="lbl">계속</span>
            </button>
          </div>
        </div>
      </div>

      <ResumeV2Motion
        name={hero.name}
        sumMeta={sumMeta}
        email={contact.email}
        pdf={resumePdf}
      />
    </div>
  );
}
