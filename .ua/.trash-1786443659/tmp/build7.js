const fs = require("fs");
const B = "src/components/ui/project-viewers/aclub/";
const S = B + "sections/";

const F = (p) => "file:" + p;
const FN = (p, n) => "function:" + p + ":" + n;

const files = [
  {
    p: B + "AClubRoom.tsx",
    n: "AClubRoom.tsx",
    s: "ACLUB 프로젝트 전용 전시실의 셸 컴포넌트. 10개 섹션을 스크롤 순서대로 조립하고 reducedMotion·스크롤 잠금·헤더 판독값·스크린리더 알림을 담은 room API를 AClubProvider로 하위에 내려준다.",
    t: ["project-viewer", "shell", "context-provider", "scroll-driven", "accessibility"],
    c: "moderate",
    ln: "인트로가 끝날 때까지 ac-locked 클래스로 스크롤을 봉인하고, lockScroll을 ref 카운터로 중첩 관리해 여러 오버레이가 동시에 잠금을 걸어도 안전하게 풀리도록 했다.",
  },
  {
    p: B + "context.ts",
    n: "context.ts",
    s: "ACLUB 룸이 하위 섹션에 공유하는 React Context와 useAClub 훅을 정의한다. 스크롤 루트 ref, 모션 감소 여부, 스크롤 잠금, 헤더 판독값·스크린리더 알림, 조명 토글, 닫기 콜백을 한 타입으로 묶는다.",
    t: ["context", "hook", "type-definition", "shared-state"],
    c: "simple",
  },
  {
    p: B + "data.ts",
    n: "data.ts",
    s: "ACLUB 전시실이 쓰는 가상 동아리 고정 데이터. 카테고리 색상·이름, 24개 동아리 목록(CLUBS), 정렬 라벨, 그리고 트러블슈팅 시뮬레이터용 축약 목록(SIM_CLUBS·SCROLL_CLUBS)을 제공한다.",
    t: ["fixture-data", "static-data", "data-model", "seeded-random"],
    c: "moderate",
    ln: "Math.random 대신 sin 기반 시드 난수를 써서 서버 렌더와 클라이언트 렌더가 같은 값을 내도록 했다 — Next.js hydration mismatch를 피하는 전형적인 패턴.",
  },
  {
    p: B + "fonts.ts",
    n: "fonts.ts",
    s: "ACLUB 룸 전용 서체 로더. next/font/google로 Noto Sans KR와 JetBrains Mono를 불러와 --ac-font-sans / --ac-font-mono CSS 변수로만 노출한다.",
    t: ["fonts", "styling", "configuration", "next-font"],
    c: "simple",
  },
  {
    p: B + "parts.tsx",
    n: "parts.tsx",
    s: "ACLUB 섹션들이 공유하는 프레젠테이션 프리미티브 모음. 뷰포트 진입 감지 훅(useInViewOnce)과 등장 애니메이션(Reveal·RevealWords), 코드 창(CodeWindow·구문 강조 태그), 메모 박스, 지표 셀을 제공한다.",
    t: ["ui-primitives", "hook", "barrel", "animation", "intersection-observer"],
    c: "complex",
    ln: "IntersectionObserver의 root를 룸 스크롤 컨테이너로 지정하고, reducedMotion이면 관찰 없이 즉시 inView로 처리해 접근성 설정을 우선한다.",
  },
  {
    p: S + "ComponentSection.tsx",
    n: "ComponentSection.tsx",
    s: "공통 컴포넌트 설계를 다루는 장. 카드 하나를 조립/분해(exploded) 뷰로 전환해 5종 레이어가 화면별로 어떻게 조합되는지 보여주고, 각 컴포넌트가 받는 값과 받지 않는 값을 표로 정리한다.",
    t: ["case-study-section", "interactive-demo", "component-design", "scroll-driven"],
    c: "complex",
  },
  {
    p: S + "FilterSection.tsx",
    n: "FilterSection.tsx",
    s: "조건 필터와 목록 재배치를 시연하는 장. 카테고리·모집중·신입생 환영·주말 없음 토글과 정렬을 실제로 걸면 framer-motion 레이아웃 애니메이션으로 포스터가 재배치되고 헤더 판독값이 실시간 갱신된다.",
    t: ["case-study-section", "interactive-demo", "filtering", "framer-motion", "animation"],
    c: "complex",
  },
  {
    p: S + "HeroSection.tsx",
    n: "HeroSection.tsx",
    s: "전시실의 첫 장. 포스터 벽 배경 위로 헤드라인을 단어 단위로 띄우고 기술 스택·핵심 화면·담당 범위·백엔드 미연동 같은 메타 지표와 GitHub 링크, 영상 모달을 노출한다.",
    t: ["case-study-section", "hero", "animation", "timeline", "entry-point"],
    c: "complex",
  },
  {
    p: S + "IntroOverlay.tsx",
    n: "IntroOverlay.tsx",
    s: "룸 진입 시퀀스 오버레이. 빈 벽에 포스터 24장(모바일 12장)이 사방에서 날아와 붙는 타임라인과 함께 프로젝트를 만든 동기 문장을 단어 단위로 읽히고, 끝나면 onDismiss로 룸 스크롤을 푼다.",
    t: ["case-study-section", "intro", "animation", "timeline", "overlay"],
    c: "moderate",
  },
  {
    p: S + "ResultSection.tsx",
    n: "ResultSection.tsx",
    s: "결과 갤러리 장. 6개 핵심 화면 스크린샷 슬롯을 그리드로 배치하고, 화면 수·공통 컴포넌트·재사용 횟수·복구한 브라우저 동작을 카운트업 애니메이션 지표로 보여준다.",
    t: ["case-study-section", "gallery", "metrics", "count-up", "framer-motion"],
    c: "complex",
  },
  {
    p: S + "RetroSection.tsx",
    n: "RetroSection.tsx",
    s: "회고 장이자 룸의 마지막 화면. KEEP·PROBLEM·TRY 3열 KPT 회고와 GitHub 링크를 보여주고, 나가기를 누르면 포스터가 무작위 순서로 떨어지는 연출 뒤 룸을 닫는다.",
    t: ["case-study-section", "retrospective", "exit-transition", "animation"],
    c: "complex",
  },
  {
    p: S + "RoleSection.tsx",
    n: "RoleSection.tsx",
    s: "학생/운영진 역할 분기를 다루는 장. 같은 데이터가 역할에 따라 어떤 화면으로 갈라지는지 토글로 시연하고, 항목별 권한 비교표와 지원자 목록 예시를 함께 제시한다.",
    t: ["case-study-section", "interactive-demo", "role-based-ui", "accessibility"],
    c: "complex",
  },
  {
    p: S + "ScopeSection.tsx",
    n: "ScopeSection.tsx",
    s: "작업 범위를 정리하는 장. 완료한 6개 화면을 포스터 카드로 흩뿌려 배치하고 하지 못한 범위(백엔드 연동·배포 등)를 대비시켜 프로젝트 경계를 명확히 드러낸다.",
    t: ["case-study-section", "scope", "layout", "animation"],
    c: "complex",
  },
  {
    p: S + "ScrollRestoreSection.tsx",
    n: "ScrollRestoreSection.tsx",
    s: "스크롤 복원 트러블슈팅 장. before/after 모드를 전환하며 목록에서 상세로 갔다 돌아올 때 위치가 날아가는 문제와 저장·복원 후의 동작을 실제로 스크롤되는 24행 목록으로 재현한다.",
    t: ["case-study-section", "troubleshooting", "scroll-restoration", "interactive-demo"],
    c: "complex",
    ln: "스크롤 핸들러를 requestAnimationFrame 티킹으로 스로틀해 판독값 갱신이 프레임당 한 번만 일어나게 한다.",
  },
  {
    p: S + "UrlStateSection.tsx",
    n: "UrlStateSection.tsx",
    s: "필터 상태를 주소로 옮긴 트러블슈팅 장. 필터를 쿼리스트링으로 직렬화(toQuery)하고 주소에서 되읽는(fromQuery) 시뮬레이터로 공유·뒤로가기·새로고침 세 가지 실패 사례와 수정 결과를 대비시킨다.",
    t: ["case-study-section", "troubleshooting", "url-state", "serialization", "interactive-demo"],
    c: "complex",
  },
  {
    p: S + "UserFlowSection.tsx",
    n: "UserFlowSection.tsx",
    s: "사용자 흐름과 라우팅 구조를 보여주는 장. 탐색→상세→모집 공고→지원 4단계와 보호 라우트(로그인) 분기를 화면 노드 다이어그램으로 그리고, 대응하는 Routes 코드 블록을 줄 단위로 강조한다.",
    t: ["case-study-section", "user-flow", "routing", "diagram", "interactive-demo"],
    c: "complex",
  },
];

const fns = [
  [B + "AClubRoom.tsx", "AClubRoom", [30, 137], "ACLUB 전시실 루트 컴포넌트. 모션 감소 감지·인트로 완료·조명 상태를 소유하고 스크롤 잠금 카운터와 Esc 닫기를 관리하며, 10개 섹션과 고정 헤더를 조립해 AClubProvider로 감싼다.", ["shell", "component", "state-machine", "context-provider"], "complex", true],
  [B + "context.ts", "useAClub", [24, 28], "ACLUB 룸 컨텍스트를 읽는 훅. 룸 바깥에서 호출하면 명시적 에러를 던져 Provider 밖 사용을 막는다.", ["hook", "context", "guard"], "simple", true],
  [B + "parts.tsx", "useInViewOnce", [9, 38], "룸 스크롤 컨테이너를 IntersectionObserver root로 삼아 요소가 처음 뷰포트에 들어올 때 한 번만 발화하는 훅. reducedMotion이면 관찰 없이 즉시 true를 반환한다.", ["hook", "intersection-observer", "animation", "accessibility"], "moderate", true],
  [B + "parts.tsx", "Reveal", [43, 65], "뷰포트에 들어오면 아래에서 위로 떠오르는 등장 래퍼. 렌더 태그와 지연 시간을 props로 받는다.", ["component", "animation", "wrapper"], "simple", true],
  [B + "parts.tsx", "RevealWords", [68, 100], "제목 텍스트를 단어 단위로 쪼개 순차적으로 등장시키는 컴포넌트. 단어당 지연과 시작 색상을 조절할 수 있다.", ["component", "animation", "typography"], "moderate", true],
  [B + "parts.tsx", "Kicker", [104, 118], "섹션 상단의 작은 라벨(키커)을 톤별 색상으로 렌더한다.", ["component", "label", "presentational"], "simple", true],
  [B + "parts.tsx", "CodeWindow", [121, 168], "코드 스니펫을 감싸는 의사 에디터 창. 파일명 헤더·서브헤더·푸터와 톤 색상을 받아 트러블슈팅 장의 코드 블록을 통일된 모습으로 보여준다.", ["component", "code-display", "presentational"], "moderate", true],
  [B + "parts.tsx", "HlLine", [171, 179], "코드 창 안에서 강조 배경을 깔아주는 한 줄 래퍼.", ["component", "code-display", "presentational"], "simple", true],
  [B + "parts.tsx", "NoteBox", [206, 239], "라벨과 톤을 받아 트러블슈팅 결론·주의사항을 담는 메모 상자를 렌더한다.", ["component", "presentational", "annotation"], "moderate", true],
  [B + "parts.tsx", "MetricCell", [242, 249], "값과 라벨 한 쌍을 보여주는 지표 셀.", ["component", "metrics", "presentational"], "simple", true],
  [S + "ComponentSection.tsx", "ComponentSection", [32, 474], "공통 컴포넌트 장 본체. 조립/분해 뷰 상태와 레이어 주석 진행도를 관리하고, 사용자가 먼저 조작하지 않으면 자동 시연을 돌린 뒤 컴포넌트 계약 표를 노출한다.", ["section", "interactive-demo", "component-design", "auto-demo"], "complex", true],
  [S + "FilterSection.tsx", "Motif", [38, 73], "카테고리(예술·학술·운동·봉사·취미)별 SVG 모티프 아이콘을 색상과 함께 그린다.", ["component", "svg", "icon", "presentational"], "simple", false],
  [S + "FilterSection.tsx", "Toggle", [77, 100], "필터 조건용 스위치 컴포넌트. 라벨·체크 상태·변경 핸들러를 받아 접근 가능한 토글을 렌더한다.", ["component", "form-control", "filtering"], "simple", false],
  [S + "FilterSection.tsx", "LiveCount", [104, 127], "필터 결과 개수를 실시간으로 보여주는 카운터. reducedMotion일 때는 애니메이션 없이 값만 바꾼다.", ["component", "metrics", "animation", "accessibility"], "simple", false],
  [S + "FilterSection.tsx", "FilterSection", [261, 706], "필터 장 본체. 카테고리·모집중·신입생·주말 조건과 정렬 키를 상태로 들고 CLUBS를 걸러 재배치하며, 탈락 카드의 퇴장 연출과 헤더 판독값 갱신을 함께 처리한다.", ["section", "filtering", "sorting", "framer-motion", "interactive-demo"], "complex", true],
  [S + "HeroSection.tsx", "HeroSection", [46, 387], "히어로 장 본체. 인트로 종료 신호(start)를 받으면 포스터 유입·헤드라인 단어·메타 셀 순으로 타이머 기반 타임라인을 진행하고 영상 모달 동안 룸 스크롤을 잠근다.", ["section", "hero", "timeline", "animation"], "complex", true],
  [S + "IntroOverlay.tsx", "IntroOverlay", [24, 218], "진입 오버레이 본체. 시드 난수로 사방에서 날아오는 포스터 배치를 계산하고 정착·문구 노출 단계를 타이머로 진행하며, 완료 또는 사용자 조작 시 한 번만 onDismiss를 호출한다.", ["section", "intro", "timeline", "seeded-random"], "complex", true],
  [S + "ResultSection.tsx", "useCountUp", [26, 49], "트리거가 켜지면 0에서 목표값까지 ease-out 곡선으로 800ms 동안 세는 rAF 기반 카운트업 훅. reducedMotion이면 즉시 최종값을 반환한다.", ["hook", "animation", "requestAnimationFrame", "accessibility"], "simple", false],
  [S + "ResultSection.tsx", "StatCell", [51, 68], "카운트업 값과 접미사·라벨을 묶어 하나의 성과 지표 셀로 렌더한다.", ["component", "metrics", "presentational"], "simple", false],
  [S + "ResultSection.tsx", "ResultSection", [70, 299], "결과 장 본체. 6개 화면 갤러리를 반응형 그리드로 배치하고 지표를 카운트업으로 노출하며, 이 장에 닿으면 룸 배경 조명을 한 단계 올린다.", ["section", "gallery", "metrics", "animation"], "complex", true],
  [S + "RetroSection.tsx", "RetroSection", [44, 293], "회고 장 본체. KPT 3열을 노출하고, 나가기 시 셔플된 순서로 포스터가 떨어지는 퇴장 연출 동안 스크롤을 잠근 뒤 onExit으로 룸을 닫는다.", ["section", "retrospective", "exit-transition", "animation"], "complex", true],
  [S + "RoleSection.tsx", "RoleSection", [30, 437], "역할 분기 장 본체. 학생/운영진 라디오 선택을 관리하고 화면과 권한 비교표를 갈아끼우며, 사용자가 먼저 만지기 전까지 자동 시연을 돌리고 변경 시 스크린리더에 알린다.", ["section", "role-based-ui", "auto-demo", "accessibility"], "complex", true],
  [S + "ScopeSection.tsx", "ScopeSection", [99, 343], "범위 장 본체. 완료한 화면 카드를 각기 다른 회전·지연 값으로 흩뿌려 등장시키고 미완 범위와 대비시켜 프로젝트 경계를 보여준다.", ["section", "scope", "layout", "animation"], "complex", true],
  [S + "ScrollRestoreSection.tsx", "ScrollRestoreSection", [10, 481], "스크롤 복원 장 본체. 실제 스크롤되는 24행 목록에서 위치를 저장/복원하고, before 모드에서는 위치 유실 버그를, after 모드에서는 복원 성공을 마커와 판독값으로 대비시킨다.", ["section", "troubleshooting", "scroll-restoration", "interactive-demo"], "complex", true],
  [S + "UrlStateSection.tsx", "toQuery", [22, 29], "시뮬레이터 필터 객체를 cat/recruiting/fresh 쿼리스트링으로 직렬화한다.", ["serialization", "url-state", "utility"], "simple", false],
  [S + "UrlStateSection.tsx", "fromQuery", [31, 42], "URL의 쿼리스트링을 URLSearchParams로 파싱해 시뮬레이터 필터 객체로 되돌린다.", ["deserialization", "url-state", "utility"], "simple", false],
  [S + "UrlStateSection.tsx", "UrlStateSection", [64, 715], "주소 상태 장 본체. before/after 모드와 가상 히스토리 스택을 관리해 공유·뒤로가기·새로고침 세 실패 사례를 재현하고, 필터를 주소에서 파생시킨 수정 결과를 코드 창과 함께 보여준다.", ["section", "troubleshooting", "url-state", "history", "interactive-demo"], "complex", true],
  [S + "UserFlowSection.tsx", "UserFlowSection", [94, 650], "사용자 흐름 장 본체. 4단계 화면 노드와 보호 라우트 분기를 연결선으로 그리고, 선택된 화면에 맞춰 Routes 코드 블록의 해당 줄을 강조한다.", ["section", "user-flow", "routing", "diagram"], "complex", true],
  [S + "UserFlowSection.tsx", "ScreenBox", [652, 679], "흐름 다이어그램의 화면 노드 하나를 그리는 박스 컴포넌트. 위치 스타일과 내용을 받아 렌더한다.", ["component", "diagram", "presentational"], "simple", false],
];

const nodes = [];
for (const f of files) {
  const n = {
    id: F(f.p),
    type: "file",
    name: f.n,
    filePath: f.p,
    summary: f.s,
    tags: f.t,
    complexity: f.c,
  };
  if (f.ln) n.languageNotes = f.ln;
  nodes.push(n);
}
for (const [p, name, range, s, t, c] of fns) {
  nodes.push({
    id: FN(p, name),
    type: "function",
    name,
    filePath: p,
    lineRange: range,
    summary: s,
    tags: t,
    complexity: c,
  });
}

const edges = [];
const imp = JSON.parse(fs.readFileSync(".ua/tmp/ua-file-analyzer-input-7.json", "utf8")).batchImportData;
for (const [src, targets] of Object.entries(imp)) {
  for (const tgt of targets) {
    edges.push({source: F(src), target: F(tgt), type: "imports", direction: "forward", weight: 0.7});
  }
}
for (const [p, name, , , , , exported] of fns) {
  edges.push({source: F(p), target: FN(p, name), type: "contains", direction: "forward", weight: 1.0});
  if (exported) edges.push({source: F(p), target: FN(p, name), type: "exports", direction: "forward", weight: 0.8});
}

const USE_ACLUB = FN(B + "context.ts", "useAClub");
const USE_INVIEW = FN(B + "parts.tsx", "useInViewOnce");

const callsAclub = [
  [B + "parts.tsx", "useInViewOnce"],
  [B + "AClubRoom.tsx", "AClubRoom"],
  [S + "ComponentSection.tsx", "ComponentSection"],
  [S + "FilterSection.tsx", "FilterSection"],
  [S + "HeroSection.tsx", "HeroSection"],
  [S + "ResultSection.tsx", "ResultSection"],
  [S + "RetroSection.tsx", "RetroSection"],
  [S + "RoleSection.tsx", "RoleSection"],
  [S + "ScopeSection.tsx", "ScopeSection"],
  [S + "ScrollRestoreSection.tsx", "ScrollRestoreSection"],
  [S + "UrlStateSection.tsx", "UrlStateSection"],
  [S + "UserFlowSection.tsx", "UserFlowSection"],
];
for (const [p, n] of callsAclub) {
  const src = FN(p, n);
  if (src === USE_ACLUB) continue;
  // AClubRoom uses the Provider, not the hook
  if (p === B + "AClubRoom.tsx") continue;
  edges.push({source: src, target: USE_ACLUB, type: "calls", direction: "forward", weight: 0.8});
}

const callsInView = [
  [S + "ComponentSection.tsx", "ComponentSection"],
  [S + "FilterSection.tsx", "FilterSection"],
  [S + "ResultSection.tsx", "ResultSection"],
  [S + "RetroSection.tsx", "RetroSection"],
  [S + "RoleSection.tsx", "RoleSection"],
  [S + "ScopeSection.tsx", "ScopeSection"],
  [S + "ScrollRestoreSection.tsx", "ScrollRestoreSection"],
  [S + "UrlStateSection.tsx", "UrlStateSection"],
  [S + "UserFlowSection.tsx", "UserFlowSection"],
];
for (const [p, n] of callsInView) {
  edges.push({source: FN(p, n), target: USE_INVIEW, type: "calls", direction: "forward", weight: 0.8});
}

// AClubRoom is mounted by the generic ProjectViewer signature map (cross-batch)
edges.push({
  source: F("src/components/ui/ProjectViewer.tsx"),
  target: F(B + "AClubRoom.tsx"),
  type: "depends_on",
  direction: "forward",
  weight: 0.6,
});

// sanity
const ids = new Set(nodes.map((n) => n.id));
if (ids.size !== nodes.length) throw new Error("dup node ids");
for (const e of edges) if (e.source === e.target) throw new Error("self edge " + e.source);
const impCount = Object.values(imp).reduce((a, b) => a + b.length, 0);
const emitted = edges.filter((e) => e.type === "imports").length;
if (impCount !== emitted) throw new Error("import mismatch " + impCount + " vs " + emitted);

fs.writeFileSync(".ua/intermediate/batch-7.json", JSON.stringify({nodes, edges}, null, 1));
console.log("nodes", nodes.length, "edges", edges.length, "imports", emitted);
