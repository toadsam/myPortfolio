"use client";

import {AnimatePresence, motion} from "framer-motion";
import dynamic from "next/dynamic";
import type {ComponentType} from "react";
import {Fragment, useEffect, useRef} from "react";
import {getProjectTheme, type ProjectTheme} from "@/data/projectThemes";
// 이름·직함·연락처는 이력서 데이터가 단일 출처다. 여기서 다시 적지 않는다 —
// 예전엔 푸터에 템플릿 잔재("Sam Kim")가 하드코딩돼 있었다.
import {contact, hero} from "@/data/resume";
import type {ProjectData} from "@/types/portfolio";
import {ArchitectureDiagram} from "./project-viewers/richContent/ArchitectureDiagram";
import {RICH_DATA} from "./project-viewers/richContent/data";
import {MYWAVE_BRIEF} from "./project-viewers/richContent/mywaveBrief";
import type {
  CodeSpec,
  ImgSpec,
  RichProject
} from "./project-viewers/richContent/shared";
import {
  CodeLine,
  CompareBars,
  ImageSlot,
  isLightboxOpen,
  MockScreen
} from "./project-viewers/richContent/shared";
import "./ProjectDetail.css";

// ════════════════════════════════════════════════════════════════════════════
//  면접관 원페이지 (단일 스크롤 · 빠른 스캔)
//  - 마을 뷰(ProjectViewer)와 달리 탭·복잡한 인터랙션 없이 위에서 아래로 읽는다.
//  - 이력서 모드 전용이므로 프로젝트별 테마색 대신 단일 터미널 톤(시안+블랙)으로 통일.
//  - 레이아웃/스타일은 ProjectDetail.css (.op-detail 스코프).
// ════════════════════════════════════════════════════════════════════════════

function getBrief(id: string): RichProject | null {
  if (RICH_DATA[id]) return RICH_DATA[id]!;
  if (id === "mywave") return MYWAVE_BRIEF;
  return null;
}

const CATEGORY_LABEL: Record<string, string> = {
  dashboard: "DASHBOARD",
  realtime: "REALTIME",
  platform: "PLATFORM",
  game: "GAME"
};

// ─── 시그니처 라이브 데모 ────────────────────────────────────────────────────
// 이 컴포넌트들은 three.js 를 한 줄도 쓰지 않는 평범한 React 다 — 마을(3D) 경로의
// RICH_RENDERERS 에만 배선돼 있어서, 이력서로 들어온 사람은 볼 수 없었다.
// 대신 보이던 건 "이미지 자리" 라고 적힌 빈 점선 상자였다.
//
// `dynamic(ssr:false)` 인 이유: 이력서 첫 화면의 무게를 늘리지 않기 위해서다.
// 정적 import 로 두면 데모 코드가 ResumeMode 청크에 붙어, 상세를 한 번도 열지
// 않는 방문자까지 내려받게 된다. 상세를 열 때 비로소 가져온다.
const SIGNATURE_DEMO: Partial<
  Record<string, ComponentType<{theme: ProjectTheme}>>
> = {
  festflow: dynamic(
    () =>
      import("./project-viewers/richContent/FestFlowLiveDemo").then(
        m => m.FestFlowLiveDemo
      ),
    {ssr: false}
  ),
  mystock: dynamic(
    () =>
      import("./project-viewers/richContent/MyStockDemo").then(
        m => m.MyStockDemo
      ),
    {ssr: false}
  ),
  muscleup: dynamic(
    () =>
      import("./project-viewers/richContent/MuscleUpDemo").then(
        m => m.MuscleUpDemo
      ),
    {ssr: false}
  ),
  aclub: dynamic(
    () =>
      import("./project-viewers/richContent/AClubDemo").then(m => m.AClubDemo),
    {ssr: false}
  ),
  ajouchong: dynamic(
    () =>
      import("./project-viewers/richContent/AjouchongDemo").then(
        m => m.AjouchongDemo
      ),
    {ssr: false}
  ),
  "sign-language": dynamic(
    () =>
      import("./project-viewers/richContent/SignLanguageDemo").then(
        m => m.SignLanguageDemo
      ),
    {ssr: false}
  ),
  darklab: dynamic(
    () =>
      import("./project-viewers/richContent/DarkLabReveal").then(
        m => m.DarkLabReveal
      ),
    {ssr: false}
  ),
  "ajou-adventure": dynamic(
    () =>
      import("./project-viewers/richContent/AjouAdventureDemo").then(
        m => m.AjouAdventureDemo
      ),
    {ssr: false}
  ),
  tserof: dynamic(
    () =>
      import("./project-viewers/richContent/TserofDemo").then(
        m => m.TserofDemo
      ),
    {ssr: false}
  )
};

// 이력서 모드는 전 프로젝트를 같은 톤으로 통일한다 (ProjectDetail.css의 --accent와 동일).
// 마을(3D) 뷰는 getProjectTheme()을 각자 호출하므로 이 값에 영향받지 않는다.
// 마을 간판금 · 밤하늘. globals.css 의 --v-gold / --v-night 와 같은 값이다.
// (여기는 JS 값이라 CSS 변수를 못 읽어 리터럴로 둔다 — 바꿀 땐 둘 다 바꿀 것)
const TERMINAL_ACCENT = "#e2c078";
const TERMINAL_BG = "#0b1626";

function terminalTheme(base: ProjectTheme): ProjectTheme {
  return {
    ...base,
    primary: TERMINAL_ACCENT,
    secondary: TERMINAL_ACCENT,
    accent: TERMINAL_ACCENT,
    bg: TERMINAL_BG
  };
}

// ─── 아이콘 (아이콘 라이브러리 없이 인라인 SVG — 저장소 관례) ──────────────────

function Icon({name, className}: {name: string; className?: string}) {
  const paths: Record<string, React.ReactNode> = {
    image: (
      <>
        <rect height="16" rx="2" width="18" x="3" y="4" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M3 17l5-4 4 3 4-4 5 4" />
      </>
    ),
    layout: (
      <>
        <rect height="18" rx="2" width="18" x="3" y="3" />
        <path d="M3 9h18M9 21V9" />
      </>
    ),
    server: (
      <>
        <rect height="8" rx="2" width="20" x="2" y="2" />
        <rect height="8" rx="2" width="20" x="2" y="14" />
        <path d="M6 6h.01M6 18h.01" />
      </>
    ),
    zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
        <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </>
    ),
    chart: <path d="M3 3v18h18M7 15l4-5 3 3 5-7" />,
    alert: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v5M12 16h.01" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12.5l2.5 2.5L16 9.5" />
      </>
    ),
    x: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </>
    ),
    rocket: (
      <>
        <path d="M5 13l-2 6 6-2 8.5-8.5A4 4 0 0012 3L5 13z" />
        <path d="M9 15l-2-2" />
      </>
    ),
    github: (
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 00-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0019.9 4a4.9 4.9 0 00-.1-3.6s-1.2-.3-3.9 1.5a13.4 13.4 0 00-7 0C6.2-.1 5 .2 5 .2A4.9 4.9 0 004.9 3.8 5.2 5.2 0 003.5 7.4c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 00-.9 2.6V22" />
    ),
    arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
    arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
    external: (
      <>
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <path d="M15 3h6v6M10 14L21 3" />
      </>
    )
  };
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name] ?? paths.image}
    </svg>
  );
}

const ARCH_ICONS = ["layout", "server", "zap", "database"];

// 결론 한 줄의 크기를 글 길이에서 뽑는다.
//
// 프로젝트마다 손으로 정하면 그게 또 제각각이 되고, 반대로 전부 30px 로 고정하면
// 44자짜리와 57자짜리가 같은 크기로 나와 한쪽은 한 줄, 한쪽은 세 줄이 된다.
// 어느 길이든 **두 줄 안팎**으로 떨어지게 잡은 값이다 —
// 상자 안쪽(max-w-3xl = 768px) 기준으로 30px→25자/줄, 24px→32자/줄, 20px→38자/줄.
// 지금 아홉 개의 결론은 42~57자에 있다.
function leadSize(text: string) {
  const n = text.length;
  if (n <= 44) return "text-xl md:text-2xl lg:text-3xl";
  if (n <= 56) return "text-lg md:text-xl lg:text-2xl";
  return "text-base md:text-lg lg:text-xl";
}

// 코드 블록은 프로젝트당 **최대 2개**, 그것도 "남들이 안 겪은 것"만 고른다.
//
// 예전엔 `coreCode` 를 전부 그렸다. 그런데 aClub 의 `useClubs` 는
// useState + useEffect + fetch 로 요청 취소도 에러 처리도 없고, 스택에 적어 둔
// React Query 를 정작 여기서 안 쓴다 — 심사자가 파고들면 가점이 아니라 **감점
// 재료**다. `RequireAuth` · `ProtectedRoute` 도 교과서 예제라 읽을 이유가 없다.
// 반대로 토큰 재발급 단일화, SSE 재연결, nginx try_files 404, 20만 행 EXPLAIN
// 같은 건 겪어 본 사람만 쓸 수 있어서 그대로 면접 질문이 된다.
//
// 파일명으로 고른다. 목록에 없는 프로젝트는 앞에서 둘만 쓴다(데이터 순서가 곧 우선순위).
// 빈 배열은 "이 프로젝트는 보여줄 코드가 없다" 는 뜻이고, 그건 부끄러운 게 아니라
// 약한 카드를 안 내미는 판단이다. 데이터는 그대로 있으므로 되살리기 쉽다.
// (한 번 틀렸다: 처음엔 RefreshTokenService·reconnect.ts·StorageVideoCache 를
//  골랐는데 그것들은 `coreCode` 가 아니라 `challenges[].code` 에 있다. 그 결과
//  득근득근 Implementation 이 통째로 0개가 됐다. **여기 이름은 반드시 coreCode
//  배열에 있는 것이어야 한다.** 그리고 오히려 잘된 면도 있다 — 가장 센 스니펫들이
//  원래 트러블슈팅 안에 있었고, 그 절이 이제 두 번째로 올라왔다.)
// 절별 상한. **프로젝트마다 하나씩 확인하며 넣는다** — 여기 없는 프로젝트는
// 지금까지처럼 전부 그린다. 틀은 같게 두고 적용만 차례로 하기 위한 구조다.
//
// 왜 상한이 필요한가: 원페이지 길이를 절별로 재 보니 득근득근이 10.3화면이었고,
// 그중 트러블슈팅 3.5 + 결과 갤러리 2.5 = 6화면이었다. 나머지 다섯 절을 합쳐도
// 2.3화면이니 군더더기는 이 둘에만 있다.
//
//   challenges 3 — 트러블슈팅은 개수가 아니라 깊이로 읽힌다. 3건까지는 "문제를
//     파는 사람", 5건부터는 "목록"이 된다. 득근득근의 앞 3건(Refresh 로테이션
//     철회 · 인덱스 넣고 보니 느린 건 다른 쪽 · 실시간 부하 미측정)이 가장 세고,
//     빠지는 「브라우저·배포 인증 차이」는 1번과 같은 인증 주제라 중복이다.
//   gallery 2 — 이력서에서 값이 있는 이미지는 **결과를 증명하는 것**과 **구조를
//     설명하는 것** 둘뿐이다. 3번째부터는 전부 "기능이 이렇게 생겼다" 인데 그건
//     GitHub README 와 실사이트 링크의 몫이다. 이 페이지엔 이미 히어로 1 +
//     Before→After 1 + 다이어그램 2 + 트러블슈팅 결과 화면 1이 있다.
//
// 데이터는 자르지 않는다 — 숫자만 지우면 전부 돌아온다.
const SECTION_LIMIT: Record<
  string,
  {challenges?: number; gallery?: number; galleryPick?: string[]}
> = {
  muscleup: {
    challenges: 3,
    // 갤러리는 개수가 아니라 **이름으로** 고른다. 앞에서 둘을 자르면 1번이
    // 「인증 시퀀스」인데, 그 이야기는 Troubleshooting 첫 카드가 코드까지 붙여
    // 이미 했다 — 같은 걸 페이지에서 두 번 말하게 된다. 2.0 에서 새로 생긴
    // 화면 둘로 바꾼다(실시간 라운지 · 캐릭터 성장). 둘 다 1.0 피드백에
    // 1:1 로 대응하는 캡션이 붙어 있어 Context 의 「들은 말 4, 한 것 3」 표를
    // 그림으로 받는다.
    galleryPick: [
      "실시간 라운지 — Socket.IO",
      "캐릭터 성장 — 레벨 · 티어 · 진화 단계"
    ]
  }
};

const CODE_PICK: Record<string, string[]> = {
  // useClubs 는 useState+useEffect+fetch, RequireAuth 는 교과서 예제라 둘 다 뺀다.
  aclub: [],
  // ProtectedRoute.js 는 교과서다. nginx try_files 404 는 실제로 겪은 것이라 남긴다.
  ajouchong: ["nginx.conf"],
  // `axios-interceptor.ts` 를 뺐다. 401 이면 refresh 후 재요청하는 **순진한 버전**
  // 이라 대기 큐도 refreshing 플래그도 없는데, 바로 위 Troubleshooting 첫 카드가
  // "그렇게 하면 여러 요청이 동시에 401 을 받는 순간 서로를 무효화한다" 며 그걸
  // 걷어낸 이야기를 한다. 같은 페이지에서 문제를 설명하고 그 문제를 가진 코드를
  // 보여 주면 "그래서 지금 코드는 어느 쪽이냐" 가 된다. 실시간 분리 쪽만 남긴다.
  // ⚠️ 이 문자열은 data.ts 의 coreCode[].filename 과 **정확히** 같아야 한다.
  // 한 번 어긋나서 Implementation 이 통째로 0개가 된 적이 있다.
  muscleup: ["realtime/src/server.ts"],
  // PortfolioService 는 "요청마다 스냅샷 갱신" 이라 평범하다. 시세 소스를
  // 인터페이스로 뺀 쪽만 남긴다(Yahoo/Demo 교체 가능 — 설계 판단이 보인다).
  mystock: ["MarketDataProvider.java"]
  // festflow(SSE 7채널 분리 · GPS 80m 판정), muscleup(실시간 서버 분리 · 401 재발급),
  // darklab, tserof 는 둘 다 특색이 있어 기본값(앞에서 둘)을 그대로 쓴다.
};

// ─── 이미지 자리 ──────────────────────────────────────────────────────────────
// src가 있으면 기존 ImageSlot(확대 보기 지원)을, 없으면 목업의 점선 플레이스홀더를 쓴다.

function Shot({
  spec,
  ratio,
  theme,
  className = "",
  iconName = "image",
  big = false
}: {
  spec?: ImgSpec;
  ratio: string;
  theme: ProjectTheme;
  className?: string;
  iconName?: string;
  big?: boolean;
}) {
  if (spec?.src) {
    return <ImageSlot className={className} spec={spec} theme={theme} />;
  }
  // 슬롯 자체가 없으면 아무것도 그리지 않는다. spec 은 있는데 src 만 없으면
  // "채울 예정" 이므로 점선 상자를 남긴다.
  if (!spec) return null;
  return (
    <div
      className={`placeholder-box ${className}`}
      data-ratio={ratio.replace("/", ":")}
      style={{aspectRatio: ratio.replace("/", " / ")}}
    >
      <Icon
        className={`${big ? "h-12 w-12" : "h-8 w-8"} mb-2 opacity-20`}
        name={iconName}
      />
      <p className="px-4 text-center text-xs uppercase tracking-widest text-[rgb(169,189,214,0.72)] md:text-xs">
        {spec?.label ?? "이미지 자리"}
      </p>
    </div>
  );
}

// ─── 코드 창 ──────────────────────────────────────────────────────────────────

function CodeWindow({spec, theme}: {spec: CodeSpec; theme: ProjectTheme}) {
  const hl = spec.highlightLines ?? [];
  return (
    <div className="code-window">
      <div className="code-header">
        <div className="code-dots">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <span className="mono text-xs text-gray-500">{spec.filename}</span>
      </div>
      <pre className="mono overflow-x-auto p-6 text-xs leading-relaxed text-[rgb(243,230,200,0.9)]">
        {spec.lines.map((line, i) => (
          <div
            key={i}
            style={
              hl.includes(i + 1)
                ? {
                    // 강조 줄 — 간판금 옅게 (예전엔 시안이었다)
                    background: "rgba(226,192,120,0.10)",
                    marginInline: -24,
                    paddingInline: 24
                  }
                : undefined
            }
          >
            {line.trim() === "" ? " " : <CodeLine line={line} theme={theme} />}
          </div>
        ))}
      </pre>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  메인
// ════════════════════════════════════════════════════════════════════════════

interface Props {
  project: ProjectData | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  index?: number;
  total?: number;
}

export function ProjectOnePager({
  project,
  onClose,
  onPrev,
  onNext,
  index,
  total
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rawTheme = project ? getProjectTheme(project.id) : null;
  const theme = rawTheme ? terminalTheme(rawTheme) : null;
  const data = project ? getBrief(project.id) : null;

  // 프로젝트가 바뀌면 스크롤을 맨 위로.
  useEffect(() => {
    scrollRef.current?.scrollTo({top: 0, behavior: "auto"});
  }, [project?.id]);

  // 스크롤 등장 — 목업과 동일하게 IntersectionObserver로 .visible을 붙인다.
  // root를 스크롤 컨테이너로 지정해야 오버레이 내부 스크롤에서도 동작한다.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !project) return;
    const targets = root.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale"
    );
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // 화면에 들어왔거나, 빠르게 스크롤해 이미 위로 지나가 버린 경우에도 등장 처리.
          // (지나간 요소를 그대로 두면 opacity 0으로 영영 안 보인다)
          const scrolledPast =
            !!entry.rootBounds &&
            entry.boundingClientRect.bottom < entry.rootBounds.top;
          if (entry.isIntersecting || scrolledPast) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      {root, rootMargin: "0px 0px -80px 0px", threshold: 0.1}
    );
    targets.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    function onKey(e: KeyboardEvent) {
      // 그림 확대창이 떠 있으면 그쪽이 먼저다. 예전엔 ESC 한 번에 확대창과
      // 이 화면이 같이 닫혀 목록까지 나갔고, 화살표는 확대 중에 뒤에서
      // 프로젝트를 넘겼다.
      if (isLightboxOpen()) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === "ArrowLeft") onPrev?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose, onNext, onPrev]);

  if (!project || !theme || !data) {
    return <AnimatePresence />;
  }

  // "득근득근 (MuscleUp)"처럼 괄호가 붙은 제목은 괄호 부분만 강조색으로.
  const titleMatch = project.title.match(/^(.*?)\s*(\([^)]*\))\s*$/);
  const repoHref = data.demo.repo ?? project.links[0]?.href;
  // 실제로 열리는 주소가 있을 때만 "운영 중" 이라고 말하고, 그 주소로 보낸다.
  const liveHref = data.demo.live;
  // 오른쪽 5칸에 무엇을 둘지: 대표 이미지가 실제로 있으면 그걸 쓴다.
  // 없을 때만 사실 묶음을 올린다 — 예전엔 여기가 "이미지 자리" 라고 적힌
  // 빈 점선 상자였고, 이미지가 0장인 프로젝트에서는 첫 화면 절반이 그거였다.
  const hasHeroShot = Boolean(data.heroImage?.src);
  const asideOnRight = !hasHeroShot;
  const teamMeta = data.meta.find(m => m.label === "팀");
  // 기간·역할은 `data.meta` 에 늘 있었는데 아무도 읽지 않았다.
  // 값이 비어 있으면(= 근거가 없어 비워 둔 프로젝트) 그 항목은 빠진다.
  const factRows = ["기간", "역할"]
    .map(label => data.meta.find(m => m.label === label))
    .filter((m): m is (typeof data.meta)[number] => Boolean(m?.value));
  const roleRow = (k: string) => k.includes("역할");
  const limit = SECTION_LIMIT[project.id] ?? {};
  const challenges = limit.challenges
    ? data.challenges.slice(0, limit.challenges)
    : data.challenges;
  const galleryAll = data.gallery ?? [];
  // 지역 변수로 받아 둔다 — 콜백 안에서는 `limit.galleryPick` 의 좁힘이 풀린다.
  const galleryPick = limit.galleryPick;
  const gallery = galleryPick
    ? galleryAll.filter(g => galleryPick.includes(g.label))
    : limit.gallery
    ? galleryAll.slice(0, limit.gallery)
    : galleryAll;

  const codePick = CODE_PICK[project.id];
  const codes = codePick
    ? data.coreCode.filter(c => codePick.includes(c.filename))
    : data.coreCode.slice(0, 2);

  // 전/후 막대를 **주장 바로 밑**에 세운다.
  //
  // perf 는 프로젝트 단위 필드라 카드 세 장을 전부 지난 뒤에 그려졌다. 그런데
  // 득근득근의 막대는 「인덱스」 카드의 증거인데 그 사이에 실시간 카드가 통째로
  // 끼어 있어서, 근거가 주장에서 한 카드 떨어져 있었다. 카드가
  // `perfAfter` 를 달면 그 카드 뒤(격자 안 전폭 칸)에 그린다.
  //
  // 아무도 안 달면 예전처럼 격자 뒤에 그린다 — 총학의 막대(맡기 전/후 검색
  // 노출)는 특정 카드의 증거가 아니라 프로젝트 전체 결과라 그 자리가 맞다.
  const perfClaimedByCard = challenges.some(c => c.perfAfter);
  const perfBlock = data.perf ? (
    <div className="reveal rounded-xl border border-[rgb(122,90,56,0.45)] bg-[rgb(169,189,214,0.045)] p-6 md:p-8">
      <h3 className="block-label mb-6">
        {data.perf.title ?? "인덱스 전 → 후 · 실측"}
      </h3>
      <CompareBars
        lowerBetter={data.perf.lowerBetter ?? true}
        rows={data.perf.rows}
        theme={theme}
      />
      {data.perf.note ? (
        <p className="mt-6 border-t border-[rgb(122,90,56,0.26)] pt-4 text-[12px] leading-relaxed text-muted">
          {data.perf.note}
        </p>
      ) : null}
    </div>
  ) : null;

  // `Signature`(라이브 데모)와 `heroLayer`(아키텍처 강조 카드)가 여기 있었다.
  // 두 자리 다 걷어내면서 죽은 선언이 됐다. SIGNATURE_DEMO 지도와 ARCH_ICONS 는
  // 남겨 둔다 — 되살릴 때 필요한 건 이 두 줄뿐이다.

  // 히어로 오른쪽(또는 데모가 없을 때 왼쪽 아래)에 오는 사실 묶음.
  // 두 자리에서 같은 것을 그리므로 변수로 한 번만 적는다.
  const heroAside = (
    <>
      {/* 기간 · 역할 — `data.meta` 다섯 줄 중 예전엔 팀 하나만 읽고 기간과
          역할을 버렸다. 서류 심사자가 가장 먼저 찾는 두 값이다.
          근거가 없어 비어 있으면 그 줄은 빠진다. */}
      {factRows.length > 0 ? (
        <dl className="flex flex-wrap gap-x-8 gap-y-3 rounded-lg border border-[rgb(122,90,56,0.45)] bg-[rgb(169,189,214,0.045)] px-6 py-4">
          {factRows.map(m => (
            <div key={m.label}>
              <dt className="mono text-xs uppercase tracking-widest text-[rgb(169,189,214,0.74)]">
                {m.label}
              </dt>
              <dd className="text-sm text-gray-200">{m.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {/* 뱃지 — 팀 구성 + 기술 스택 (앞 3개는 강조) */}
      <div className="flex flex-wrap gap-2">
        {teamMeta ? (
          <span className="badge">Team: {teamMeta.value}</span>
        ) : null}
        {data.tech.map((t, i) => (
          <span
            className={`badge ${i < 3 ? "border-accent text-accent" : ""}`}
            key={t}
          >
            {t}
          </span>
        ))}
      </div>

      {/* CTA — 라이브 사이트가 있으면 그게 첫 버튼이다.
          실제로 돌아가는 서비스가 저장소 링크보다 강한 증거다. */}
      <div className="flex flex-wrap gap-4 pt-4">
        {liveHref ? (
          <a
            className="flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-85"
            href={liveHref}
            rel="noreferrer"
            target="_blank"
          >
            <Icon className="h-4 w-4" name="external" />
            라이브 사이트 열기
          </a>
        ) : null}
        {project.links.map((link, i) => {
          // 라벨로 아이콘을 고른다. 링크가 GitHub 하나뿐이던 시절엔 전부
          // 깃허브 아이콘이었는데, 이제 스팀 스토어·시연 영상이 섞인다.
          const icon = /영상|video/i.test(link.label)
            ? "rocket"
            : /steam|스토어|사이트|store/i.test(link.label)
            ? "external"
            : "github";
          // 첫 링크만 채운 버튼. 나머지는 테두리 버튼이라 무게가 갈린다 —
          // 상용 출시 스토어와 참고용 저장소가 같은 크기로 보이면 안 된다.
          const solid = i === 0 && !liveHref;
          return (
            <a
              className={
                solid
                  ? "flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-85"
                  : "flex items-center gap-2 rounded-md border border-[rgb(122,90,56,0.45)] px-6 py-3 text-sm font-bold text-gray-300 transition-colors hover:border-accent hover:text-white"
              }
              href={link.href}
              key={link.label}
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="h-4 w-4" name={icon} />
              {link.label}
            </a>
          );
        })}
      </div>
    </>
  );

  return (
    <AnimatePresence>
      <motion.div
        animate={{opacity: 1}}
        className="op-detail fixed inset-0 z-[70] w-full overflow-y-auto"
        exit={{opacity: 0}}
        initial={{opacity: 0}}
        key={project.id}
        ref={scrollRef}
        transition={{duration: 0.25}}
      >
        {/* ══════════ 상단 바 ══════════ */}
        {/* 목업은 position:fixed지만, 스크롤 컨테이너 안에서는 sticky가 같은 결과를 준다 */}
        <nav className="op-nav sticky top-0 z-50 w-full border-b border-[rgb(122,90,56,0.45)] px-5 py-4 backdrop-blur-md md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <button
              className="flex shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted transition-colors hover:text-white"
              onClick={onClose}
              type="button"
            >
              <Icon className="h-4 w-4" name="arrowLeft" />
              목록으로
            </button>

            <div className="mono hidden items-center gap-6 text-xs uppercase tracking-widest text-[rgb(169,189,214,0.72)] md:flex">
              {/* 상태는 `demo.live` 하나만 근거로 삼는다. 예전엔 "Deployed" 가
                  9개 전부에 하드코딩돼, 배포라는 말이 성립하지 않는 Unity
                  게임에까지 붙었다. 근거가 없으면 아무 말도 하지 않는다. */}
              {liveHref ? (
                <span>
                  Status: <span className="text-green-500">운영 중</span>
                </span>
              ) : null}
              <span className="text-accent">
                {CATEGORY_LABEL[theme.category] ?? "PROJECT"} ·{" "}
                {project.id.toUpperCase()}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {typeof index === "number" && typeof total === "number" ? (
                <span className="mono hidden text-xs text-[rgb(169,189,214,0.72)] sm:inline">
                  {index + 1} / {total}
                </span>
              ) : null}
              {onPrev ? (
                <button
                  aria-label="이전 프로젝트"
                  className="mono rounded-full border border-[rgb(122,90,56,0.45)] px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-accent hover:text-white"
                  onClick={onPrev}
                  type="button"
                >
                  ‹
                </button>
              ) : null}
              {onNext ? (
                <button
                  aria-label="다음 프로젝트"
                  className="mono rounded-full border border-[rgb(122,90,56,0.45)] px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-accent hover:text-white"
                  onClick={onNext}
                  type="button"
                >
                  ›
                </button>
              ) : null}
              {repoHref ? (
                <a
                  aria-label="GitHub 저장소"
                  className="rounded-full border border-[rgb(122,90,56,0.45)] p-2 transition-colors hover:border-accent"
                  href={repoHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon className="h-4 w-4" name="github" />
                </a>
              ) : null}
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl space-y-20 px-5 pb-20 pt-10 md:space-y-24 md:px-8">
          {/* ══════════ HERO ══════════ */}
          {/* 히어로는 늘 12단이다. 오른쪽 5칸에 들어가는 게 달라질 뿐 —
              데모가 없으면 대표 화면(Shot), 있으면 사실표·뱃지·CTA 가 온다.
              데모를 오른쪽에 넣지 않는 이유: 데모 내부가 3단 그리드라
              약 500px 칸에서는 부스 이름이 줄바꿈돼 찌그러진다. */}
          <section className="anim-fade-up space-y-10 md:space-y-12">
            {/* 윗단: 제목과 대표 화면을 마주 놓는다.
                예전엔 왼쪽 7칸에 제목·요약·메타·칩·버튼을 다 넣고 오른쪽
                5칸에 이미지 하나만 뒀다. 왼쪽이 900px 인데 오른쪽 이미지는
                270px 라, **오른쪽 열 아래 2/3 가 통째로 빈 공간**이었다.
                제목과 이미지를 같은 줄에 두면 둘 다 자기 무게를 갖는다. */}
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div
                className={`anim-slide-left delay-1 ${
                  hasHeroShot ? "lg:col-span-6" : "lg:col-span-12"
                }`}
              >
                <h1 className="op-title mb-4 text-4xl md:text-5xl lg:text-6xl">
                  {titleMatch ? (
                    <>
                      {titleMatch[1]}{" "}
                      <span className="text-accent">{titleMatch[2]}</span>
                    </>
                  ) : (
                    project.title
                  )}
                </h1>
                <p className="text-base font-medium uppercase tracking-widest text-gray-400 md:text-xl">
                  {data.tagline}
                </p>
              </div>

              {hasHeroShot ? (
                <div className="anim-slide-right delay-2 lg:col-span-6">
                  <Shot
                    big
                    className="w-full rounded-xl"
                    ratio="16/9"
                    spec={data.heroImage}
                    theme={theme}
                  />
                </div>
              ) : null}
            </div>

            {/* 아랫단: 요약표(7) + 사실 묶음(5). 요약표가 전체폭에 가까워져
                「왜」 행이 두 줄로 접히지 않는다. */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="anim-slide-left delay-2 rounded-lg border border-[rgb(122,90,56,0.45)] bg-[rgb(169,189,214,0.045)] p-6 lg:col-span-7">
                <h2 className="section-label mb-4">Core Summary</h2>
                <table className="cyber-table w-full text-sm">
                  <tbody>
                    {data.tldr.map(r => (
                      <tr key={r.k}>
                        <td className="mono w-24 text-accent">{r.k}</td>
                        <td
                          className={`text-gray-300 ${
                            roleRow(r.k) ? "font-bold" : ""
                          }`}
                        >
                          {r.v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="anim-slide-right delay-3 space-y-6 lg:col-span-5">
                {heroAside}
              </div>
            </div>
          </section>

          {/* ══════════ 핵심 지표 ══════════
              결과 섹션(문서 76% 지점)에 있던 것을 여기로 올렸다. 이 페이지는
              11,000px 이라 3화면 보고 닫는 사람이 숫자를 한 번도 못 봤다.
              출처 줄을 반드시 붙여 둔다 — 숫자만 큰 타일은 광고로 읽힌다. */}
          <section className="reveal space-y-6">
            <h2 className="section-label">Key Numbers</h2>
            <div className="stagger-children grid grid-cols-2 gap-6 lg:grid-cols-4">
              {/* h-full: 한 줄 안에서 타일 높이를 맞춘다. 값이 두 줄이 되는 타일이
                  하나라도 있으면 옆 타일과 밑변이 어긋나 계단처럼 보였다.
                  break-keep: 한국어 라벨이 단어 중간에서 끊기는 걸 막는다. */}
              {data.metrics.map(m => (
                <div className="stat-tile reveal h-full" key={m.l}>
                  <div className="mono mb-1 break-keep text-xs uppercase tracking-widest text-muted">
                    {m.l}
                  </div>
                  {/* 카운트업 연출을 뺐다. 이 페이지의 주제가 "숫자에 출처가
                      있다" 인데, 굴러가는 도중 "약 49명"(실제 50) 처럼 **틀린
                      값이 보인다.** 정확한 값이 요점인 자리에서 연출이 값을
                      깎아먹으면 연출을 버리는 게 맞다. */}
                  {/* whitespace-nowrap: 375px 2단 격자에서 "약 50명" 이 "약 50" /
                      "명" 으로 갈라졌다. 숫자와 단위가 끊기면 값이 아니라 문장으로
                      읽힌다. 모바일에서만 한 단계 작게 잡아 안 넘치게 한다. */}
                  <span className="mono block whitespace-nowrap text-2xl font-black text-accent sm:text-3xl md:text-4xl">
                    {m.n}
                  </span>
                </div>
              ))}
            </div>
            {data.metricsNote ? (
              <p className="mono text-xs leading-relaxed text-muted">
                {data.metricsNote}
              </p>
            ) : null}
          </section>

          {/* ══════════ 문제 정의 ══════════ */}
          {/* 예전엔 Troubleshooting 이 여기(3번째)에 있고 Context 가 그 뒤였다.
              이력서 카드가 약속하는 건 「사용자 피드백을 듣고 다시 만들었다」인데,
              그걸 보고 누른 사람이 처음 만나는 게 JWT·EXPLAIN·부하시험 4.2화면이었다.
              좋은 이야기지만 **약속한 이야기가 아니다.** 클릭한 이유를 먼저 갚는다 —
              가설과 「들은 말 4, 한 것 3」 이 48% 지점에서 15% 지점으로 올라온다.

              Context 안의 순서(문제 → 사용자의 말 → 가설)는 그대로다. 예전엔 왼쪽에
              problemShot 이 있었는데 Before→After 로 옮기면서 구멍이 생겼고, 사용자의
              말이 Problem 문단과 떨어져 **근거로 읽히지 않아서** 한 흐름에 세웠다. */}
          <section className="reveal space-y-8">
            <h2 className="section-label">Context</h2>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="reveal-left space-y-6 lg:col-span-7">
                <h3 className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
                  <Icon className="h-7 w-7 text-red-500" name="alert" />
                  Problem
                </h3>
                <p className="text-base leading-relaxed text-gray-400 md:text-lg">
                  {data.problem}
                </p>
                {/* 사용자가 실제로 한 말. Problem 바로 밑에 둬야 근거로 읽힌다.
                    단, 아래 「들은 말 n, 한 것 m」 표가 같은 인용을 전부 싣는
                    프로젝트에서는 여기서 반복하지 않는다 — 표가 더 많은 걸
                    말하므로 표만 남긴다. */}
                <div
                  className={
                    "space-y-4 pt-2 " + (data.feedbackMap ? "hidden" : "")
                  }
                >
                  {data.research.quotes.map(q => (
                    <blockquote
                      className="border-l-2 border-[rgb(122,90,56,0.45)] pl-4 text-sm italic leading-relaxed text-gray-500"
                      key={q.who}
                    >
                      “{q.q}”
                      <span className="mono mt-1 block not-italic text-xs uppercase tracking-widest text-[rgb(169,189,214,0.72)]">
                        — {q.who}
                      </span>
                    </blockquote>
                  ))}
                </div>
              </div>

              <div className="reveal-right lg:col-span-5">
                <div className="highlight-box p-6 md:p-8">
                  <h4 className="mono mb-4 text-xs uppercase tracking-widest text-accent">
                    Hypothesis
                  </h4>
                  <blockquote className="text-lg font-light italic leading-snug text-white md:text-xl">
                    {data.hypothesis}
                  </blockquote>
                </div>
              </div>
            </div>

            {/* 들은 말 넷과 한 것 — Key Numbers 의 「3 / 4」를 여기서 검증한다.
                인용만 흩어 두면 심사자가 세어 볼 수가 없다. 마지막 줄(안 고친
                것)을 흐리게 두되 지우지 않는 게 이 표의 요점이다. */}
            {data.feedbackMap && data.feedbackMap.length > 0 ? (
              <div className="reveal">
                <h3 className="block-label">
                  들은 말 {data.feedbackMap.length}, 한 것{" "}
                  {data.feedbackMap.filter(f => f.done).length}
                </h3>
                <ul className="divide-y divide-[rgb(122,90,56,0.32)] overflow-hidden rounded-lg border border-[rgb(122,90,56,0.45)]">
                  {data.feedbackMap.map(f => (
                    <li
                      className={
                        "grid grid-cols-1 gap-1 p-4 md:grid-cols-12 md:items-baseline md:gap-6 " +
                        (f.done ? "" : "bg-[rgb(255,157,56,0.05)]")
                      }
                      key={f.said}
                    >
                      <p className="text-sm italic leading-relaxed text-gray-400 md:col-span-5">
                        “{f.said}”
                      </p>
                      <p
                        className={
                          "flex gap-2 text-sm leading-relaxed md:col-span-7 " +
                          (f.done ? "text-white" : "text-accent")
                        }
                      >
                        <span
                          aria-hidden
                          className="mono select-none opacity-60"
                        >
                          →
                        </span>
                        {f.did}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[12px] leading-relaxed text-muted">
                  {data.research.quotes[0]?.who
                    ? "출처: " + data.research.quotes[0].who
                    : null}
                </p>
              </div>
            ) : null}
          </section>

          {/* ══════════ 트러블슈팅 ══════════ */}
          {/* 라이브 데모(가짜 데이터 목업)가 있던 자리다. 내용이 「사운드웨이브
              음악·24명」 같은 **지어낸 데이터**였는데, 바로 위에 실제 사이트 링크가
              있는 페이지에서 목업을 앞세우면 심사자가 「이건 진짜인가」 에서 멈춘다.
              그래서 Troubleshooting 을 올렸다 — 예전엔 7번째, 5화면 아래라 대부분
              못 보고 닫았다. 지금은 Context 다음이다: 무엇을 왜 만들었는지 먼저
              말하고, 그 다음에 「만들면서 뭐가 깨졌나」 로 간다.
              데모 컴포넌트(SIGNATURE_DEMO)는 지우지 않았다. */}
          {challenges.length > 0 ? (
            <section className="reveal space-y-12">
              <h2 className="section-label">Troubleshooting</h2>

              <div className="stagger-children grid grid-cols-1 gap-8 lg:grid-cols-2">
                {challenges.map((c, ci) => {
                  // 2칸 격자에서 항목이 홀수면 마지막 줄 오른쪽이 통째로
                  // 빈다(화면 절반). 마지막 하나를 펴서 그 구멍을 없앤다.
                  const isWide =
                    ci === challenges.length - 1 && challenges.length % 2 === 1;
                  const card = (
                    <div
                      className={`reveal flex flex-col overflow-hidden rounded-xl border border-[rgb(122,90,56,0.45)] bg-[rgb(169,189,214,0.045)] ${
                        isWide ? "lg:col-span-2" : ""
                      }`}
                      key={c.title}
                    >
                      <div className="border-b border-red-500/20 bg-red-500/10 p-6">
                        <p
                          aria-hidden="true"
                          className="mono mb-2 text-xs uppercase tracking-widest text-red-300"
                        >
                          [PROBLEM]
                        </p>
                        <h3 className="font-bold text-gray-200">{c.title}</h3>
                      </div>
                      {/* 전폭 카드는 글을 세로로만 쌓으면 오른쪽 절반(565×480)이
                        통째로 빈다. 글 왼쪽 · 코드 오른쪽으로 나눈다. 부수 효과로
                        카드가 940 → 608px 로 줄었다.

                        ⚠️ 여기 들어가는 코드 줄에는 폭 예산이 있다. 절반 칸이
                        565px, 코드창 안쪽은 패딩 빼고 **514px** 다. 넘으면 가로
                        스크롤바가 생긴다 — 실제로 FestFlow 의 자바 한 줄(565px)이
                        걸려서 데이터 쪽에서 줄을 접었다. 새 코드를 넣을 땐
                        가장 긴 줄을 재 볼 것. */}
                      <div
                        className={
                          isWide && c.code
                            ? "grid flex-grow grid-cols-1 items-start gap-6 p-6 lg:grid-cols-2 lg:gap-8"
                            : "flex-grow space-y-4 p-6"
                        }
                      >
                        <div className="space-y-4">
                          {/* 카드가 홀수면 마지막 하나가 전폭(1,216px)으로 펴진다.
                            14px 글자로 한 줄 80자가 넘어 눈이 다음 줄 첫머리를
                            놓친다 — 한국어는 40~45자가 적당하다. 반폭 카드는
                            애초에 580px 라 이 제한에 걸리지 않는다. */}
                          <p className="max-w-[62ch] text-sm leading-relaxed text-gray-400">
                            {c.problem}
                          </p>
                          <div className="flex items-center gap-2 text-accent">
                            <Icon className="h-4 w-4" name="arrowRight" />
                            <span className="text-xs font-bold uppercase tracking-widest">
                              Solution
                            </span>
                          </div>
                          {/* whitespace-pre-line — 문단 안의 빈 줄을 살린다.
                            긴 해결 서술은 한 덩이로 두면 14줄이 줄바꿈 없이 이어져
                            마지막 문장(대개 가장 센 결론)이 묻힌다. 데이터 쪽에서
                            빈 줄을 넣은 것만 나뉘고, 나머지는 그대로 한 문단이다. */}
                          <p className="max-w-[62ch] whitespace-pre-line rounded border-l-2 border-accent bg-accent/5 p-4 text-sm leading-relaxed text-gray-200">
                            {c.solution}
                          </p>
                        </div>
                        {c.code ? (
                          <CodeWindow spec={c.code} theme={theme} />
                        ) : null}
                      </div>
                    </div>
                  );
                  // 이 카드가 막대를 데리고 있으면 바로 뒤 전폭 칸에 세운다.
                  // 격자 안에 넣어야 카드와 같은 흐름으로 읽힌다 — 격자 밖으로
                  // 빼면 "카드 다음에 나오는 별개의 그림" 이 된다.
                  return c.perfAfter && perfBlock ? (
                    <Fragment key={c.title}>
                      {card}
                      <div className="lg:col-span-2">{perfBlock}</div>
                    </Fragment>
                  ) : (
                    card
                  );
                })}
              </div>

              {/* 측정값은 산문에서 꺼내 막대로 세운다. 위 카드의 문단에
                  숫자가 아홉 개 묻혀 있어 아무도 안 읽었다. 맨 아랫줄이
                  논점이다 — 쿼리 막대는 사라지는데 페이지 막대는 절반에서
                  멈춘다. 그림이 문장보다 그걸 빨리 말한다.

                  어느 카드가 `perfAfter` 로 데려갔으면 여기서는 안 그린다. */}
              {perfClaimedByCard ? null : perfBlock}

              <Shot
                big
                className="w-full rounded-xl"
                iconName="chart"
                ratio="21/9"
                spec={
                  data.resultShot ?? {label: "개선 결과 화면", ratio: "21/9"}
                }
                theme={theme}
              />
            </section>
          ) : null}

          {/* ══════════ 개선 전 / 후 ══════════
              문제를 말한 직후가 이 칸의 자리다 — "그래서 뭘 바꿨나" 를 아키텍처
              설명보다 먼저 보여 준다. 심사자가 끝까지 안 읽고 나가도 여기까지는
              본다.

              두 장을 나란히 놓기만 하면 안 읽힌다. **차이를 말로 짚어 주는
              note 가 그림보다 중요하다** — 그림은 근거고, 문장이 주장이다. */}
          {data.beforeAfter ? (
            <section className="reveal space-y-8 md:space-y-10">
              <h2 className="section-label">Before → After</h2>
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
                {(
                  [
                    ["Before", data.beforeAfter.before, "#f87171"],
                    ["After", data.beforeAfter.after, theme.primary]
                  ] as const
                ).map(([tag, side], i) => (
                  <Fragment key={tag}>
                    {i === 1 ? (
                      <div
                        aria-hidden="true"
                        className="mono hidden items-center justify-center self-center text-3xl font-black lg:flex"
                        style={{color: theme.primary}}
                      >
                        →
                      </div>
                    ) : null}
                    <div
                      className="reveal space-y-4 rounded-xl border p-5"
                      style={{
                        borderColor:
                          tag === "Before"
                            ? "rgb(248 113 113 / 0.3)"
                            : `${theme.primary}40`,
                        background:
                          tag === "Before"
                            ? "rgb(248 113 113 / 0.04)"
                            : `${theme.primary}0a`
                      }}
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span
                          className="mono text-xs font-black uppercase tracking-widest"
                          style={{
                            color: tag === "Before" ? "#f87171" : theme.primary
                          }}
                        >
                          {tag}
                        </span>
                        <span className="text-sm font-bold text-white/90">
                          {side.label}
                        </span>
                      </div>
                      {/* 세로로 긴 폰 캡처가 들어오면 카드 폭(약 558px)을 다
                          채워 900px 넘게 솟는다. 게다가 개선 전 캡처는 원본이
                          372px 라 늘리면 흐려진다 — 원본보다 크게 그리지 않도록
                          폭을 묶는다. 가로로 긴 캡처는 그대로 폭을 쓴다. */}
                      {side.shot ? (
                        <div
                          className={
                            (side.shot.ratio ?? "9/16").startsWith("9/") ||
                            (side.shot.ratio ?? "").startsWith("3/4")
                              ? "mx-auto w-full max-w-[330px]"
                              : "w-full"
                          }
                        >
                          <Shot
                            className="w-full"
                            ratio={side.shot.ratio ?? "9/16"}
                            spec={side.shot}
                            theme={theme}
                          />
                        </div>
                      ) : null}
                      {/* 캡처가 남아 있지 않은 쪽. 없는 화면을 그럴듯한 가짜
                          스크린샷으로 채우면 확대하는 순간 들통난다 —
                          창 제목에 출처(파일·커밋)를 박은 요약 패널로 그린다. */}
                      {!side.shot && side.screen ? (
                        <MockScreen spec={side.screen} theme={theme} />
                      ) : null}
                      {side.note ? (
                        <p className="text-sm leading-relaxed text-gray-400">
                          {side.note}
                        </p>
                      ) : null}
                    </div>
                  </Fragment>
                ))}
              </div>
            </section>
          ) : null}

          {/* ══════════ 아키텍처 ══════════ */}
          <section className="reveal space-y-12 md:space-y-16">
            <h2 className="section-label">Architecture &amp; Design</h2>

            {/* 4칸 레이어 카드(ROUTE / DATA / API / UI)를 걷어냈다.
                내용이 "React Router 로 라우팅", "axios 모듈", "공통 컴포넌트 재사용"
                처럼 **아키텍처가 아니라 폴더 구조**였다. 신입 프로젝트면 거의 다
                그렇게 생겼으므로 변별력이 없는데 한 화면을 썼다. 진짜 설계 이야기는
                아래 Technical Decision Table(선택 / 이유 / 대안)에 있다.
                데이터(`architecture`)는 그대로 두었다. */}

            {/* 다이어그램이 있으면 그린다. 없으면 **아무것도 안 그린다** —
                예전엔 여기가 "시스템 아키텍처 다이어그램" 이라고 적힌
                1216×521 빈 점선 상자였다. 9개 전부에 있었으니, 없는 걸
                아홉 번 광고하고 있었던 셈이다. */}
            {data.diagrams?.map(dg => (
              // 좁은 화면에서 폭에 맞추면 350px 로 줄어 글자가 3px 이 된다.
              // 최소 폭을 주고 가로로 굴린다 — 아래 결정 표와 같은 방식.
              <div className="reveal" key={dg.title ?? dg.caption}>
                {/* 좁은 화면에서는 가로로 굴러간다. 굴러간다는 걸 말해 주지
                    않으면 잘린 그림으로 보이고, tabIndex 가 없으면 키보드로는
                    아예 오른쪽을 볼 수 없다(스크롤 영역의 기본 규칙). */}
                <p className="mono mb-2 text-xs text-muted md:hidden">
                  → 옆으로 밀면 전체 구성도가 보입니다
                </p>
                <div
                  aria-label={dg.title ?? "시스템 구성도"}
                  className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0"
                  role="region"
                  tabIndex={0}
                >
                  <div className="min-w-[880px]">
                    <ArchitectureDiagram spec={dg} theme={theme} />
                  </div>
                </div>
              </div>
            )) ?? null}

            <div className="reveal space-y-8">
              <h3 className="block-label">Technical Decision Table</h3>
              <p className="mono -mt-4 text-xs text-muted md:hidden">
                → 옆으로 밀면 「이유 / 대안」 칸이 보입니다
              </p>
              <div
                aria-label="기술 의사결정 표"
                className="overflow-x-auto rounded-lg border border-[rgb(122,90,56,0.45)]"
                role="region"
                tabIndex={0}
              >
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead className="mono bg-[rgb(11,22,38,0.75)] text-xs uppercase tracking-widest text-accent">
                    <tr>
                      <th className="border-b border-[rgb(122,90,56,0.45)] p-4">
                        영역
                      </th>
                      <th className="border-b border-[rgb(122,90,56,0.45)] p-4">
                        선택 (Choice)
                      </th>
                      <th className="border-b border-[rgb(122,90,56,0.45)] p-4">
                        이유 / 대안 (Why vs Alternatives)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(122,90,56,0.45)]">
                    {data.decisions.map(d => (
                      <tr
                        className="transition-colors hover:bg-white/[0.02]"
                        key={d.area}
                      >
                        <td className="p-4 font-bold text-white">{d.area}</td>
                        <td className="p-4 text-accent">{d.pick}</td>
                        <td className="p-4 text-gray-400">
                          {d.why} ↔ {d.alt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ══════════ 핵심 구현 ══════════ */}
          {codes.length > 0 ? (
            <section className="reveal space-y-12">
              <h2 className="section-label">Implementation</h2>
              {/* 2칸 격자는 코드가 둘일 때만 쓴다. 하나인 프로젝트(득근득근·총학
                  ·MyStock)는 왼쪽 절반만 차고 오른쪽 620px 가 통째로 비었다.
                  전폭 코드창은 트레일링 공백이 남지만 그건 편집기와 같은 모습이라
                  구멍으로 안 읽힌다 — 창 옆이 비는 것과 창 안이 비는 것은 다르다. */}
              <div
                className={`grid grid-cols-1 gap-8 ${
                  codes.length > 1 ? "lg:grid-cols-2" : ""
                }`}
              >
                {codes.map((c, i) => (
                  <div
                    className={`space-y-4 ${
                      i % 2 === 0 ? "reveal-left" : "reveal-right"
                    }`}
                    key={c.filename}
                  >
                    <p className="text-sm font-medium text-gray-400">
                      <span className="text-accent">💡</span>{" "}
                      {c.caption ?? c.filename}
                    </p>
                    <CodeWindow spec={c} theme={theme} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* ══════════ 결과 & 회고 ══════════ */}
          <section className="reveal space-y-12 md:space-y-16">
            <h2 className="section-label">Results &amp; Retrospective</h2>

            {/* 사용자 반응 — 지표보다 먼저 온다.
                "몇 명이 왔다" 보다 "그래서 무슨 일이 벌어졌다" 가 세다. */}
            {data.testimonial ? (
              <blockquote className="reveal highlight-box p-6 md:p-8">
                <p className="text-lg font-light italic leading-snug text-white md:text-2xl">
                  “{data.testimonial.q}”
                </p>
                <footer className="mono mt-4 text-xs uppercase tracking-widest text-muted">
                  — {data.testimonial.who}
                </footer>
              </blockquote>
            ) : null}

            {/* 결과 스크린샷 */}
            {gallery.length > 0 ? (
              <div className="stagger-children grid grid-cols-1 gap-6 md:grid-cols-2">
                {gallery.map(g => (
                  <div
                    className={`reveal ${g.wide ? "md:col-span-2" : ""}`}
                    key={g.label}
                  >
                    <Shot
                      className="w-full"
                      ratio={g.ratio ?? "16/10"}
                      spec={g}
                      theme={theme}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {/* KEEP / PROBLEM / TRY 세 칸을 걷어냈다.
                회고 습관 자체는 좋지만, **약점을 스스로 목록으로 만들어 마지막에
                보여주는 건** 이력서에서 불리하게만 읽힌다("테스트 부족", "디자인
                시스템이 후반에 정리됨"). 심사자는 그 줄을 읽고 질문을 만들지
                않는다 — 판단을 내린다. 배운 것은 바로 아래 THE CORE TAKEAWAY
                한 문장이 더 세게 말한다.
                데이터(`kpt` · `kptLabels`)는 지우지 않았다 — 되살리려면 이 자리에
                다시 그리면 된다. */}

            {/* 핵심 배움 — 결론 한 줄(크게) + 근거(작게, 왼쪽 정렬)
                예전엔 learning 한 문자열을 30px 가운데 정렬로 통째로 그렸다.
                짧은 프로젝트(76~106자)는 2줄이라 괜찮았는데 긴 쪽(181~194자)은
                4줄이 됐고, 줄마다 시작 x 가 달라 눈이 매번 왼쪽 끝을 다시 찾아야
                했다. 게다가 진짜 결론(마지막 문장)이 나머지와 **같은 크기로**
                맨 끝에 묻혀서, 크기는 큰데 위계가 없었다.
                양식은 아홉 프로젝트가 같고, 크기만 글 길이에서 뽑는다. */}
            <div className="reveal-scale space-y-6 rounded-2xl border border-accent/20 bg-accent/10 p-8 text-center md:p-12">
              <div className="mono text-xs uppercase tracking-widest text-accent">
                The Core Takeaway
              </div>
              {data.learningLead ? (
                <>
                  <p
                    className={`mx-auto max-w-3xl font-light leading-snug ${leadSize(
                      data.learningLead
                    )}`}
                  >
                    {data.learningLead}
                  </p>
                  {/* 근거는 왼쪽 정렬이다. 가운데 정렬은 한두 줄짜리 인용구에서만
                      읽히고, 여러 줄 산문에서는 줄 시작점이 흔들린다. */}
                  <p className="mx-auto max-w-[62ch] text-left text-sm leading-relaxed text-gray-400 md:text-base">
                    {data.learning}
                  </p>
                </>
              ) : (
                <p className="mx-auto max-w-3xl text-lg font-light leading-snug md:text-2xl lg:text-3xl">
                  {data.learning}
                </p>
              )}
            </div>
          </section>
        </main>

        {/* ══════════ 푸터 ══════════ */}
        <footer className="mt-24 border-t border-[rgb(122,90,56,0.45)] bg-[rgb(11,22,38)] py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-5 md:flex-row md:px-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="text-sm font-bold tracking-tight">
                {project.title}
              </div>
              {/* **하드코딩된 남의 이름이 있던 자리다.** developerFolio 템플릿의
                  "Fullstack Developer: Sam Kim" 이 그대로 남아, 프로젝트 상세
                  9개 전부의 푸터에 다른 사람 이름이 찍히고 있었다.
                  이제 이력서 데이터 한 곳(`hero`)에서 가져온다. */}
              <p className="mono text-xs uppercase tracking-widest text-[rgb(169,189,214,0.72)]">
                {hero.name} · {hero.roleTag}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {/* "System Operational: 100%" 가 있던 자리. 같은 템플릿 잔재이고
                  아무것도 뜻하지 않는 장식이었다. 그 자리에는 실제로 확인할 수
                  있는 것만 둔다 — 연락처. */}
              <a
                // 이메일은 uppercase 를 걸지 않는다 — 대문자로 찍힌 주소는
                // 동작은 해도 잘못 옮겨 적기 쉽다.
                className="mono flex items-center gap-2 text-xs tracking-wider text-[rgb(169,189,214,0.74)] transition-colors hover:text-accent"
                href={`mailto:${contact.email}`}
              >
                <span className="h-2 w-2 rounded-full bg-accent" />
                {contact.email}
              </a>
              {onNext ? (
                <button
                  className="mono rounded-lg border border-[rgb(122,90,56,0.45)] px-6 py-3 text-xs font-bold text-gray-400 transition-colors hover:border-accent hover:text-white"
                  onClick={onNext}
                  type="button"
                >
                  다음 프로젝트 →
                </button>
              ) : null}
              <button
                className="text-xs text-gray-500 underline underline-offset-4 transition-colors hover:text-accent"
                onClick={() =>
                  scrollRef.current?.scrollTo({top: 0, behavior: "smooth"})
                }
                type="button"
              >
                Top of Page
              </button>
            </div>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
