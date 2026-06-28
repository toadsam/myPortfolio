import type {RichProject} from "./shared";

// 임시 목업 데이터 — 나중에 실제 내용으로 교체.
export const RICH_DATA: Record<string, RichProject> = {
  // ════════════════════════════ MyStock-Desk (dashboard) ════════════════════
  mystock: {
    tagline: "INVESTMENT PORTFOLIO · WEB APP",
    problemShot: {label: "엑셀로 수익률을 직접 관리하던 기존 방식", ratio: "4/3"},
    gallery: [
      {label: "보유 종목 수익률 화면", ratio: "16/10"},
      {label: "자산 비중 차트", ratio: "16/10"},
      {label: "AI 체크포인트 리포트", ratio: "16/10"},
    ],
    tldr: [
      {k: "무엇을", v: "거래 기록 기반 포트폴리오 분석 + AI 체크포인트 웹앱"},
      {k: "왜", v: "수익률·자산 비중·뉴스 영향을 한 곳에서 보기 어려움"},
      {k: "결과", v: "증권사 연동 없이 입력 데이터만으로 포트폴리오 분석 제공"},
      {k: "내 역할", v: "풀스택 — React 프론트 + Spring Boot 백엔드"},
    ],
    demo: {videoLen: "1:12", live: "#", video: "#", repo: "https://github.com/toadsam/MyStock-Desk"},
    meta: [
      {label: "기간", value: "2025.01 – 2025.04 · 4개월"},
      {label: "팀", value: "개인 프로젝트 (풀스택 1인)"},
      {label: "역할", value: "도메인 설계 · 프론트 · 백엔드"},
      {label: "스택", value: "React · TypeScript · Spring Boot · MySQL · Recharts"},
      {label: "배포", value: "Docker · AWS EC2"},
    ],
    heroScreen: {title: "mystock.app/portfolio", kind: "dashboard", kpi: [{l: "평가액", v: "₩8.7M"}, {l: "수익률", v: "+12.4%"}, {l: "종목", v: "9"}], chart: [20, 26, 22, 34, 30, 42, 38, 50, 58, 64]},
    impact: [{n: "9", l: "분석 도메인"}, {n: "0", l: "외부 연동 의존"}, {n: "4개월", l: "기획→배포"}],
    features: [
      {t: "보유 종목 수익률", d: "평균 매입가 기반 실현·평가 손익 계산"},
      {t: "자산 비중 차트", d: "종목·섹터별 포트폴리오 분산 시각화"},
      {t: "AI 체크포인트", d: "매수/매도 추천이 아닌 리스크·뉴스 변화 요약"},
      {t: "뉴스 영향도", d: "보유 종목 관련 뉴스의 영향 정리"},
    ],
    problem: "투자 기록을 직접 관리하는 사람은 수익률과 자산 비중을 한눈에 파악하기 어렵고, 뉴스가 내 포트폴리오에 어떤 영향을 주는지 판단할 도구가 부족하다.",
    research: {
      quotes: [
        {q: "엑셀로 수익률 계산하는데, 종목이 늘어나니까 관리가 안 돼요.", who: "개인 투자자 A · 3년차"},
        {q: "뉴스는 보는데 그게 내 종목에 좋은 건지 나쁜 건지 모르겠어요.", who: "직장인 투자자 B"},
      ],
      stat: {n: "6/7", l: "“내 포트폴리오 상태를 한눈에 못 본다”고 답함"},
    },
    beforeCode: {
      filename: "naive-pnl.ts",
      caption: "단순 현재가 합산 — 평균 매입가/실현손익 개념이 없음",
      lines: ["// 기존: 보유 수량 × 현재가만 합산", "const total = holdings.reduce(", "  (sum, h) => sum + h.qty * h.price, 0", "); // 언제 얼마에 샀는지가 반영되지 않는다"],
    },
    hypothesis: "“거래 기록을 평균 매입가 기준으로 집계하고, AI는 ‘판단’이 아니라 ‘정리’ 역할로 한정하면, 사용자가 스스로 더 나은 결정을 내릴 수 있다.”",
    process: [{t: "도메인 설계", d: "01월"}, {t: "백엔드 API", d: "01–02월"}, {t: "프론트", d: "02–03월"}, {t: "AI 연동", d: "03월"}, {t: "배포", d: "04월"}],
    architecture: [
      {tag: "View", name: "React + Recharts", desc: "포트폴리오·수익률·뉴스 화면"},
      {tag: "API", name: "Spring Boot REST", desc: "stock / portfolio / transaction / news"},
      {tag: "AI", name: "Checkpoint Service", desc: "LLM 호출로 리스크·뉴스 변화 요약"},
      {tag: "DB", name: "MySQL", desc: "거래·종목·뉴스 영속화"},
    ],
    decisions: [
      {area: "백엔드", pick: "Spring Boot", why: "도메인 분리·검증에 강함", alt: "Express(타입 약함)"},
      {area: "AI 역할", pick: "정리형", why: "투자 추천의 법적·신뢰 리스크 회피", alt: "추천형(리스크 ↑)"},
      {area: "차트", pick: "Recharts", why: "선언적 구현", alt: "Chart.js(명령형)"},
      {area: "장애대응", pick: "seed fallback", why: "외부 실패 시 화면 유지", alt: "에러 노출(UX ↓)"},
    ],
    coreCode: [
      {filename: "PortfolioService.java", caption: "평균 매입가 기반 평가손익 계산", highlightLines: [4, 5], lines: ["public Pnl evaluate(List<Trade> trades, long price) {", "  long qty = 0, cost = 0;", "  for (Trade t : trades) {", "    qty  += t.getQty();", "    cost += t.getQty() * t.getPrice(); // 누적 매입가", "  }", "  long avg = qty == 0 ? 0 : cost / qty;", "  return new Pnl(qty, avg, (price - avg) * qty);", "}"]},
      {filename: "checkpoint.ts", caption: "AI는 추천 대신 ‘변화 정리’만 반환", lines: ["const res = await ai.summarize({", "  holdings, recentNews,", "  instruction: '추천 금지. 리스크·뉴스 변화만 정리'", "});", "return res.bullets; // 사용자가 판단의 주체"]},
    ],
    work: [
      {g: "백엔드", items: ["도메인 4종 API 설계", "거래 기반 손익 계산 로직"]},
      {g: "프론트", items: ["포트폴리오·수익률 화면", "자산 비중 차트"]},
      {g: "AI", items: ["체크포인트 프롬프트 설계", "응답 구조 정규화"]},
      {g: "운영", items: ["Docker 배포", "seed 데이터 fallback"]},
    ],
    challenges: [
      {title: "외부 시세/뉴스 API 실패 시 화면이 깨졌다", problem: "Provider 호출이 실패하면 대시보드 전체가 빈 화면이 됐다.", solution: "Provider 실패 시 seed/mock 데이터로 폴백해 화면 구조를 유지하고, 상태 배지로 ‘예시 데이터’임을 표시했다.", code: {filename: "provider.ts", lines: ["try {", "  return await fetchQuotes(symbols);", "} catch {", "  return SEED_QUOTES; // 화면은 살아있게", "}"]}},
      {title: "AI가 추천처럼 답하려 함", problem: "프롬프트에 따라 ‘사세요/파세요’ 류 답이 섞여 나왔다.", solution: "출력 스키마를 ‘변화 항목 배열’로 강제하고 추천 어휘를 후처리 필터로 차단했다."},
    ],
    perf: {rows: [{label: "포트폴리오 API 응답", before: 820, after: 180, unit: "ms"}, {label: "대시보드 첫 렌더", before: 2.4, after: 0.9, unit: "s"}], note: "쿼리 N+1 제거 · 응답 캐시"},
    tech: ["React", "TypeScript", "Spring Boot", "MySQL", "Recharts", "Docker"],
    resultScreens: [
      {title: "mystock.app/portfolio", kind: "dashboard", kpi: [{l: "평가액", v: "₩8.7M"}, {l: "수익률", v: "+12.4%"}, {l: "현금", v: "18%"}], chart: [22, 30, 26, 40, 36, 48, 56, 62]},
      {title: "mystock.app/allocation", kind: "bars", bars: [{l: "반도체", p: 38, v: "38%"}, {l: "2차전지", p: 24, v: "24%"}, {l: "현금", p: 18, v: "18%"}, {l: "기타", p: 20, v: "20%"}]},
    ],
    metrics: [{n: "9", l: "분석 도메인"}, {n: "-78%", l: "API 응답시간"}, {n: "100%", l: "장애 시 화면 유지"}, {n: "4개월", l: "기획→배포"}],
    usability: {rows: [{label: "수익률 파악 속도(체감)", before: 2.2, after: 4.5, unit: "점"}, {label: "재방문(주간)", before: 1.5, after: 3.8, unit: "회"}], note: "사용자 7명 사전/사후"},
    kpt: {keep: ["도메인을 먼저 설계하고 화면을 붙인 순서", "AI 역할을 명확히 제한"], problem: ["테스트 코드 부족", "프론트 상태 관리가 후반에 복잡해짐"], try: ["실시간 시세 WebSocket 연동", "포트폴리오 자동 갱신"]},
    learning: "AI를 ‘판단하는 주체’가 아니라 ‘정리해주는 도구’로 제한했을 때 오히려 신뢰가 올라간다는 걸 배웠다. 기술보다 역할 정의가 먼저였다.",
  },

  // ════════════════════════════ FestFlow (realtime) ═════════════════════════
  festflow: {
    tagline: "REALTIME FESTIVAL OPS · WEB APP",
    problemShot: {label: "기존 수동 운영 방식 (전화·메신저)", ratio: "4/3"},
    gallery: [
      {label: "실시간 부스 현황 피드", ratio: "16/10"},
      {label: "Leaflet 지도 기반 부스 배치", ratio: "16/10"},
      {label: "관리자 대시보드", ratio: "16/10"},
    ],
    tldr: [
      {k: "무엇을", v: "대학 축제 부스를 실시간으로 운영·관제하는 웹앱"},
      {k: "왜", v: "수십 개 부스 현황을 실시간으로 공유할 도구가 없었음"},
      {k: "결과", v: "SSE로 부스 상태를 실시간 반영하는 풀스택 서비스"},
      {k: "내 역할", v: "프론트 전체 + 실시간 백엔드 일부"},
    ],
    demo: {videoLen: "0:55", live: "#", video: "#", repo: "https://github.com/toadsam/FestFlow"},
    meta: [
      {label: "기간", value: "2025.04 – 2025.05 · 6주"},
      {label: "팀", value: "팀 프로젝트 · 프론트 담당"},
      {label: "역할", value: "프론트 전체 · SSE 연동"},
      {label: "스택", value: "React · Vite · Spring Boot · SSE · MySQL · Leaflet"},
      {label: "배포", value: "Vercel · PWA"},
    ],
    heroScreen: {title: "festflow.app/live", kind: "feed", feed: ["부스 #12 운영중 전환", "부스 #07 품절 알림", "스태프 A 체크인", "부스 #03 대기열 24명"]},
    impact: [{n: "40+", l: "동시 부스"}, {n: "<1s", l: "상태 반영"}, {n: "6주", l: "기획→배포"}],
    features: [
      {t: "실시간 부스 현황", d: "SSE로 상태 변경을 즉시 푸시"},
      {t: "지도 기반 배치", d: "Leaflet 실제 지도 위에 부스 핀"},
      {t: "권한 분리", d: "관리자 / 스태프 / 방문자 JWT 권한"},
      {t: "PWA", d: "현장 오프라인 대응"},
    ],
    problem: "대학 축제는 수십 개의 부스가 동시에 운영되는데, 운영 현황을 실시간으로 파악하고 역할별로 공유할 수 있는 도구가 없었다.",
    research: {
      quotes: [
        {q: "부스가 품절됐는지 본부에서는 전화 돌려야 알 수 있었어요.", who: "축제 운영 스태프"},
        {q: "방문객은 어디가 붐비는지 모르고 그냥 돌아다녀요.", who: "축제 방문객"},
      ],
      stat: {n: "40+", l: "동시 운영 부스를 수동으로 관리하던 상황"},
    },
    hypothesis: "“부스 상태 변경을 SSE로 모두에게 즉시 푸시하면, 관리자·스태프·방문자가 같은 현황을 실시간으로 공유할 수 있다.”",
    process: [{t: "요구분석", d: "04월"}, {t: "SSE 설계", d: "04월"}, {t: "프론트", d: "04–05월"}, {t: "지도연동", d: "05월"}, {t: "배포", d: "05월"}],
    architecture: [
      {tag: "View", name: "React + Leaflet", desc: "지도·부스 카드·관리 대시보드"},
      {tag: "Stream", name: "SSE Client", desc: "EventSource 구독 · 자동 재연결"},
      {tag: "API", name: "Spring Boot", desc: "SseEmitter 브로드캐스트 · JWT"},
      {tag: "DB", name: "MySQL", desc: "부스·스태프·이벤트"},
    ],
    decisions: [
      {area: "실시간", pick: "SSE", why: "단방향 푸시에 충분·구현 단순", alt: "WebSocket(양방향 과함)"},
      {area: "지도", pick: "React Leaflet", why: "오픈소스·커스텀 핀 용이", alt: "Google Maps(비용)"},
      {area: "인증", pick: "JWT", why: "역할별 무상태 권한", alt: "세션(스케일 ↓)"},
      {area: "배포", pick: "PWA", why: "현장 네트워크 불안정 대응", alt: "네이티브 앱(공수 ↑)"},
    ],
    coreCode: [
      {filename: "useBoothStream.ts", caption: "SSE 구독 — 부스 상태를 실시간 반영", highlightLines: [2, 3], lines: ["export function useBoothStream() {", "  const es = new EventSource('/api/booths/stream');", "  es.onmessage = (e) => setBooths(JSON.parse(e.data));", "  useEffect(() => () => es.close(), []);", "}"]},
      {filename: "BoothController.java", caption: "상태 변경 시 모든 구독자에게 브로드캐스트", lines: ["public void updateStatus(Long id, Status s) {", "  boothService.update(id, s);", "  emitters.forEach(em ->", "    em.send(boothService.snapshot())); // 전체 푸시", "}"]},
    ],
    work: [
      {g: "프론트", items: ["지도·부스·관리 화면 구현", "SSE 연동 + 자동 재연결"]},
      {g: "백엔드", items: ["SseEmitter 브로드캐스트", "JWT 권한 분리"]},
      {g: "UX", items: ["PWA 설정", "오프라인 폴백"]},
    ],
    challenges: [
      {title: "SSE 연결이 끊기면 현황이 멈췄다", problem: "모바일에서 네트워크가 불안정하면 EventSource가 끊긴 채 복구되지 않았다.", solution: "끊김 감지 시 지수 백오프로 재연결하고, 재연결 직후 전체 스냅샷을 다시 받아 상태를 동기화했다.", code: {filename: "reconnect.ts", lines: ["es.onerror = () => {", "  es.close();", "  setTimeout(connect, backoff()); // 지수 백오프", "};"]}},
      {title: "Emitter가 쌓여 메모리 누수", problem: "구독 해제가 안 된 SseEmitter가 누적돼 메모리가 증가했다.", solution: "onCompletion/onTimeout 콜백에서 emitter를 리스트에서 제거하도록 정리 로직을 추가했다."},
    ],
    perf: {rows: [{label: "상태 반영 지연", before: 5000, after: 600, unit: "ms"}, {label: "수동 확인 횟수/시간", before: 30, after: 0, unit: "회"}], note: "폴링 → SSE 전환"},
    tech: ["React", "Vite", "Spring Boot", "SSE", "JWT", "Leaflet", "PWA"],
    resultScreens: [
      {title: "festflow.app/live", kind: "feed", feed: ["부스 #12 운영중", "부스 #07 품절", "대기열 24명", "스태프 체크인"]},
      {title: "festflow.app/map", kind: "cards", cards: [{l: "푸드존", sub: "12 부스"}, {l: "플리마켓", sub: "9 부스"}, {l: "체험존", sub: "8 부스"}, {l: "무대", sub: "혼잡"}]},
    ],
    metrics: [{n: "40+", l: "동시 부스"}, {n: "-88%", l: "상태 반영 지연"}, {n: "3", l: "권한 등급"}, {n: "6주", l: "기획→배포"}],
    usability: {rows: [{label: "현황 파악 속도", before: 1.8, after: 4.7, unit: "점"}, {label: "본부-스태프 전화", before: 25, after: 4, unit: "회"}], note: "운영 1일 비교"},
    kpt: {keep: ["SSE로 단방향 실시간을 간단히 해결", "역할별 권한을 초기에 분리"], problem: ["부하 테스트 부족", "지도 핀이 많을 때 렌더 최적화 미흡"], try: ["부스 매출 집계", "혼잡도 히트맵"]},
    learning: "‘실시간’이라고 무조건 WebSocket이 아니라는 걸 배웠다. 요구사항(단방향 푸시)에 맞는 가장 단순한 도구가 가장 안정적이었다.",
  },

  // ════════════════════════════ MuscleUp (realtime) ═════════════════════════
  muscleup: {
    tagline: "GAMIFIED FITNESS · COMMUNITY",
    problemShot: {label: "작심삼일로 끊기던 기존 운동 기록", ratio: "4/3"},
    gallery: [
      {label: "레벨·경험치 대시보드", ratio: "16/10"},
      {label: "운동 기록 입력 화면", ratio: "16/10"},
      {label: "커뮤니티 챌린지", ratio: "16/10"},
    ],
    tldr: [
      {k: "무엇을", v: "운동 기록을 게임처럼 지속하게 만드는 피트니스 플랫폼"},
      {k: "왜", v: "운동 앱은 기록은 되지만 ‘다시 오게’ 만드는 장치가 약함"},
      {k: "결과", v: "기록→캐릭터 성장→커뮤니티로 이어지는 루프 구현"},
      {k: "내 역할", v: "풀스택 — 기획·프론트·백엔드 전반"},
    ],
    demo: {videoLen: "1:05", live: "#", video: "#", repo: "https://github.com/toadsam/Ajou_MuscleUp"},
    meta: [
      {label: "기간", value: "2025.02 – 2025.05 · 4개월"},
      {label: "팀", value: "팀 프로젝트 · 풀스택 참여"},
      {label: "역할", value: "핵심 루프 설계 · 프론트 · 백엔드"},
      {label: "스택", value: "TypeScript · React · Spring Boot · JWT · OAuth · SSE"},
      {label: "배포", value: "Docker · 클라우드"},
    ],
    heroScreen: {title: "muscleup.app/home", kind: "bars", bars: [{l: "근력 Lv", p: 72, v: "Lv.7"}, {l: "지구력", p: 55, v: "Lv.5"}, {l: "출석 스트릭", p: 90, v: "18일"}]},
    impact: [{n: "5", l: "성장 스탯"}, {n: "실시간", l: "라운지 소통"}, {n: "4개월", l: "기획→배포"}],
    features: [
      {t: "출석 & 캐릭터 성장", d: "기록이 캐릭터 스탯으로 즉시 반영"},
      {t: "실시간 라운지", d: "SSE 기반 응원·소통 피드"},
      {t: "랭킹 · 크루", d: "주간 랭킹과 크루 활동"},
      {t: "AI 인바디", d: "개인화된 운동 의사결정 지원"},
    ],
    problem: "운동 앱은 기록하는 순간엔 유용하지만 꾸준히 돌아오게 만드는 장치가 약하다. 기록이 성장·커뮤니티로 즉시 연결되는 경험이 필요했다.",
    research: {
      quotes: [
        {q: "3일 쓰고 안 열게 돼요. 기록만 쌓이고 변화가 안 느껴져서.", who: "헬스 입문자 A"},
        {q: "혼자 하니까 동기부여가 안 돼요.", who: "직장인 B"},
      ],
      stat: {n: "70%", l: "운동 앱을 2주 내 그만둔 경험이 있다고 답함"},
    },
    hypothesis: "“운동 기록을 캐릭터 성장·랭킹·실시간 커뮤니티로 즉시 연결하면, 사용자가 ‘다시 오는’ 이유가 생긴다.”",
    process: [{t: "루프 기획", d: "02월"}, {t: "인증/도메인", d: "02–03월"}, {t: "프론트", d: "03–04월"}, {t: "실시간 라운지", d: "04월"}, {t: "배포", d: "05월"}],
    architecture: [
      {tag: "View", name: "React", desc: "홈·라운지·랭킹·캐릭터"},
      {tag: "Stream", name: "SSE Lounge", desc: "실시간 응원·활동 피드"},
      {tag: "API", name: "Spring Boot", desc: "기록·성장·랭킹 · JWT/OAuth"},
      {tag: "DB", name: "MySQL", desc: "유저·기록·크루"},
    ],
    decisions: [
      {area: "동기설계", pick: "게임 루프", why: "기록→성장 즉시 피드백", alt: "단순 기록(이탈 ↑)"},
      {area: "실시간", pick: "SSE", why: "라운지 단방향 피드에 적합", alt: "WebSocket(과함)"},
      {area: "인증", pick: "JWT+OAuth", why: "간편 로그인·무상태", alt: "자체 세션"},
      {area: "성장식", pick: "서버 계산", why: "조작 방지", alt: "클라 계산(치팅)"},
    ],
    coreCode: [
      {filename: "level.ts", caption: "운동 기록 → 경험치 → 레벨", highlightLines: [2], lines: ["export function gainXp(record: Workout) {", "  const xp = record.sets * record.reps * record.weightFactor;", "  return applyLevel(xp); // 누적 후 레벨 환산", "}"]},
      {filename: "LoungeController.java", caption: "활동 발생 시 라운지에 실시간 푸시", lines: ["public void cheer(Long fromId, Long toId) {", "  var event = cheerService.create(fromId, toId);", "  emitters.forEach(e -> e.send(event)); // 실시간", "}"]},
    ],
    work: [
      {g: "기획", items: ["기록→성장→커뮤니티 루프 설계", "캐릭터 스탯 모델"]},
      {g: "프론트", items: ["홈·라운지·랭킹 화면", "SSE 실시간 피드"]},
      {g: "백엔드", items: ["JWT+OAuth 인증", "성장·랭킹 계산"]},
      {g: "AI", items: ["인바디 분석 연동", "리포트 화면"]},
    ],
    challenges: [
      {title: "성장 수치를 클라이언트에서 계산해 조작 가능했다", problem: "초기엔 경험치를 프론트에서 계산해 값을 조작하면 레벨이 올라갔다.", solution: "모든 성장 계산을 서버로 옮기고, 클라이언트는 결과만 표시하도록 신뢰 경계를 명확히 했다."},
      {title: "라운지 인원이 늘면 피드가 밀렸다", problem: "동시 접속이 늘자 모든 이벤트를 전부 푸시해 클라이언트가 버벅였다.", solution: "이벤트를 묶어 일정 간격으로 배치 전송하고, 화면엔 최근 N개만 유지했다.", code: {filename: "batch.ts", lines: ["// 100ms 윈도우로 이벤트 묶어 전송", "buffer.push(ev);", "scheduleFlush(() => emit(buffer.splice(0)));"]}},
    ],
    perf: {rows: [{label: "라운지 렌더 프레임", before: 90, after: 16, unit: "ms"}, {label: "성장 조작 가능성", before: 100, after: 0, unit: "%"}], note: "서버 계산 전환 · 이벤트 배치"},
    tech: ["TypeScript", "React", "Spring Boot", "JWT", "OAuth", "SSE"],
    resultScreens: [
      {title: "muscleup.app/character", kind: "bars", bars: [{l: "근력", p: 72, v: "Lv.7"}, {l: "지구력", p: 55, v: "Lv.5"}, {l: "유연성", p: 40, v: "Lv.4"}]},
      {title: "muscleup.app/rank", kind: "feed", feed: ["1위 크루 ‘아주짐’", "내 순위 12위 ↑3", "오늘 응원 24회", "주간 스트릭 18일"]},
    ],
    metrics: [{n: "5", l: "성장 스탯"}, {n: "-82%", l: "라운지 렌더시간"}, {n: "0%", l: "성장 조작"}, {n: "4개월", l: "기획→배포"}],
    usability: {rows: [{label: "주간 재방문", before: 1.6, after: 4.4, unit: "회"}, {label: "운동 지속(주)", before: 1.2, after: 3.6, unit: "주"}], note: "베타 사용자 표본"},
    kpt: {keep: ["기록을 성장으로 즉시 연결한 루프", "신뢰 경계를 명확히 한 것"], problem: ["AI 인바디 정확도 검증 부족", "온보딩이 다소 복잡"], try: ["웨어러블 연동", "크루 챌린지 시스템"]},
    learning: "기능을 많이 만드는 것보다 ‘다시 오게 하는 하나의 루프’를 단단히 만드는 게 핵심이라는 걸 배웠다.",
  },

  // ════════════════════════════ ACLUB (platform) ════════════════════════════
  aclub: {
    tagline: "CLUB DISCOVERY · PLATFORM FE",
    problemShot: {label: "여기저기 흩어져 있던 동아리 모집 공고", ratio: "4/3"},
    gallery: [
      {label: "동아리 카드 리스트", ratio: "16/10"},
      {label: "동아리 상세·모집 페이지", ratio: "16/10"},
      {label: "지원 신청 폼", ratio: "16/10"},
    ],
    tldr: [
      {k: "무엇을", v: "동아리 탐색·모집을 한 곳에서 하는 플랫폼 프론트엔드"},
      {k: "왜", v: "동아리 정보가 흩어져 탐색·지원이 번거로움"},
      {k: "결과", v: "탐색→상세→지원까지 한 흐름으로 처리하는 FE 완성"},
      {k: "내 역할", v: "프론트엔드 개발 (React + TypeScript)"},
    ],
    demo: {videoLen: "0:50", live: "#", video: "#", repo: "https://github.com/aClub2026/FE"},
    meta: [
      {label: "기간", value: "2025.03 – 2025.06"},
      {label: "팀", value: "팀 프로젝트 · 프론트 담당"},
      {label: "역할", value: "탐색·상세·마이·관리 화면"},
      {label: "스택", value: "React · TypeScript · Vite · TailwindCSS"},
      {label: "배포", value: "Vercel"},
    ],
    heroScreen: {title: "aclub.app/explore", kind: "cards", cards: [{l: "밴드 동아리", sub: "모집중"}, {l: "코딩 동아리", sub: "12명 지원"}, {l: "사진 동아리", sub: "모집중"}, {l: "축구 동아리", sub: "마감"}]},
    impact: [{n: "5", l: "주요 화면"}, {n: "2", l: "사용자 역할"}, {n: "100%", l: "타입 안정성"}],
    features: [
      {t: "동아리 탐색·필터", d: "카테고리·모집상태로 빠른 탐색"},
      {t: "모집공고 조회", d: "공고 상세와 지원 흐름"},
      {t: "마이페이지", d: "지원 현황 관리"},
      {t: "관리자 페이지", d: "동아리 운영자 전용 뷰"},
    ],
    problem: "대학교 동아리 정보는 채널마다 흩어져 있어 학생들이 원하는 동아리를 탐색하고 지원하기 어렵다.",
    research: {
      quotes: [
        {q: "동아리 찾으려면 에브리타임, 인스타, 단톡을 다 봐야 해요.", who: "신입생 A"},
        {q: "지원했는지 안 했는지도 헷갈려요.", who: "재학생 B"},
      ],
      stat: {n: "3+", l: "동아리 정보를 찾으려 거쳐야 하는 채널 수"},
    },
    hypothesis: "“탐색·필터·상세·지원을 한 흐름으로 묶으면, 학생이 한 곳에서 동아리를 찾고 지원까지 끝낼 수 있다.”",
    process: [{t: "IA 설계", d: "03월"}, {t: "공통 컴포넌트", d: "03–04월"}, {t: "화면 구현", d: "04–05월"}, {t: "관리자뷰", d: "05월"}, {t: "배포", d: "06월"}],
    architecture: [
      {tag: "Route", name: "React Router", desc: "탐색/상세/마이/관리 라우팅"},
      {tag: "State", name: "Context + Hooks", desc: "필터·인증 상태"},
      {tag: "UI", name: "공통 컴포넌트", desc: "카드·필터·폼 재사용"},
      {tag: "API", name: "REST 연동", desc: "동아리·지원 데이터"},
    ],
    decisions: [
      {area: "빌드", pick: "Vite", why: "빠른 HMR·가벼움", alt: "CRA(느림)"},
      {area: "타입", pick: "TypeScript", why: "대규모 화면 안정성", alt: "JS(런타임 오류 ↑)"},
      {area: "스타일", pick: "Tailwind", why: "일관성·반응형 속도", alt: "CSS Modules"},
      {area: "상태", pick: "Context", why: "규모에 충분", alt: "Redux(과함)"},
    ],
    coreCode: [
      {filename: "useClubFilter.ts", caption: "카테고리·상태 필터를 URL과 동기화", highlightLines: [3], lines: ["export function useClubFilter(clubs: Club[]) {", "  const [params] = useSearchParams();", "  return useMemo(() => clubs.filter(c =>", "    matchCategory(c, params) && matchStatus(c, params)", "  ), [clubs, params]); // URL이 곧 필터 상태", "}"]},
    ],
    work: [
      {g: "탐색", items: ["탐색·필터·상세 화면", "URL 동기화 필터"]},
      {g: "지원", items: ["모집공고 조회·지원 폼"]},
      {g: "마이/관리", items: ["마이페이지", "관리자 페이지"]},
      {g: "공통", items: ["공통 컴포넌트 설계", "라우팅 구성"]},
    ],
    challenges: [
      {title: "필터 상태가 새로고침하면 사라졌다", problem: "필터를 컴포넌트 state로만 들고 있어 새로고침·공유 시 초기화됐다.", solution: "필터를 URL 쿼리스트링과 동기화해, 새로고침·링크 공유에도 같은 결과가 유지되게 했다."},
      {title: "동아리 목록이 많아지면 렌더가 느렸다", problem: "수백 개 카드를 한 번에 렌더해 스크롤이 버벅였다.", solution: "리스트 가상화와 카드 메모이제이션으로 보이는 만큼만 렌더하도록 했다."},
    ],
    tech: ["React", "TypeScript", "Vite", "TailwindCSS"],
    resultScreens: [
      {title: "aclub.app/explore", kind: "cards", cards: [{l: "밴드", sub: "모집중"}, {l: "코딩", sub: "12명"}, {l: "사진", sub: "모집중"}, {l: "축구", sub: "마감"}]},
      {title: "aclub.app/my", kind: "feed", feed: ["코딩 동아리 지원 완료", "밴드 동아리 서류 합격", "사진 동아리 면접 예정"]},
    ],
    metrics: [{n: "5", l: "주요 화면"}, {n: "1곳", l: "탐색→지원 통합"}, {n: "100%", l: "타입 적용"}, {n: "4개월", l: "프로젝트 기간"}],
    kpt: {keep: ["URL을 상태의 원천으로 삼은 설계", "공통 컴포넌트 재사용"], problem: ["디자인 시스템이 후반에 정리됨", "테스트 부족"], try: ["백엔드 연동 후 실배포", "검색 고도화"]},
    learning: "필터 같은 상태는 URL을 source of truth로 두면 공유·새로고침 문제까지 한 번에 풀린다는 걸 배웠다.",
  },

  // ════════════════════════════ 아주총총 (platform) ══════════════════════════
  ajouchong: {
    tagline: "STUDENT COUNCIL · OFFICIAL SPA",
    problemShot: {label: "여러 채널에 흩어져 있던 학생회 공지", ratio: "4/3"},
    gallery: [
      {label: "공지·Q&A 게시판", ratio: "16/10"},
      {label: "복지·제휴 안내 페이지", ratio: "16/10"},
      {label: "회의록 자료실", ratio: "16/10"},
    ],
    tldr: [
      {k: "무엇을", v: "아주대 총학생회 공식 웹사이트 프론트엔드"},
      {k: "왜", v: "공지·Q&A·복지 정보가 여러 채널에 흩어져 있었음"},
      {k: "결과", v: "정보를 한 곳에 모은 SPA를 Docker+Nginx로 실제 배포"},
      {k: "내 역할", v: "프론트엔드 (React SPA) · 배포"},
    ],
    demo: {videoLen: "0:48", live: "#", video: "#", repo: "https://github.com/toadsam/ajouchong-web"},
    meta: [
      {label: "기간", value: "2025.03 – 2025.06"},
      {label: "팀", value: "총학생회 IT · 프론트 담당"},
      {label: "역할", value: "SPA 라우팅·화면·배포"},
      {label: "스택", value: "React · React Router · Docker · Nginx"},
      {label: "배포", value: "Docker + Nginx (실서비스)"},
    ],
    heroScreen: {title: "ajou-council.app", kind: "feed", feed: ["[공지] 총회 일정 안내", "[Q&A] 학식 환불 문의", "[복지] 제휴 업체 추가", "[자료] 회의록 6월"]},
    impact: [{n: "6", l: "서비스 영역"}, {n: "실배포", l: "Docker+Nginx"}, {n: "SPA", l: "단일 페이지"}],
    features: [
      {t: "공지사항", d: "목록·상세, 카테고리 분류"},
      {t: "Q&A", d: "학생 문의 작성·조회"},
      {t: "자료실", d: "회칙·회의록·감사 자료"},
      {t: "복지/제휴", d: "제휴·대여 정보"},
    ],
    problem: "총학생회 정보가 여러 채널에 분산되어 학생들이 공지·Q&A·복지 정보를 한 곳에서 확인하기 어려웠다.",
    research: {
      quotes: [
        {q: "공지가 인스타에만 올라와서 놓치면 끝이에요.", who: "재학생 A"},
        {q: "제휴 업체 목록을 어디서 보는지 모르겠어요.", who: "재학생 B"},
      ],
      stat: {n: "6", l: "흩어져 있던 정보 영역(공지·Q&A·자료·복지 등)"},
    },
    hypothesis: "“총학생회의 핵심 정보를 하나의 SPA로 모으고 안정적으로 배포하면, 학생들의 정보 접근성이 크게 올라간다.”",
    process: [{t: "정보구조", d: "03월"}, {t: "라우팅·화면", d: "03–05월"}, {t: "인증", d: "05월"}, {t: "Docker 배포", d: "06월"}],
    architecture: [
      {tag: "Route", name: "React Router SPA", desc: "공지/Q&A/자료/복지 라우팅"},
      {tag: "Auth", name: "AuthContext", desc: "로그인 상태 전역 관리·보호 라우트"},
      {tag: "Serve", name: "Nginx", desc: "정적 서빙·SPA 폴백"},
      {tag: "Ship", name: "Docker", desc: "이미지 빌드·배포"},
    ],
    decisions: [
      {area: "구조", pick: "SPA", why: "빠른 화면 전환", alt: "MPA(새로고침)"},
      {area: "서빙", pick: "Nginx", why: "정적+폴백 안정적", alt: "Node 서버(과함)"},
      {area: "배포", pick: "Docker", why: "환경 일관성", alt: "수동 배포(실수 ↑)"},
      {area: "인증", pick: "Context", why: "단순 로그인 상태", alt: "라이브러리(과함)"},
    ],
    coreCode: [
      {filename: "nginx.conf", caption: "SPA 새로고침 404 방지 — try_files 폴백", highlightLines: [2], lines: ["location / {", "  try_files $uri $uri/ /index.html; # SPA 폴백", "}"]},
      {filename: "ProtectedRoute.tsx", caption: "로그인 상태에 따른 보호 라우트", lines: ["function Protected({ children }) {", "  const { user } = useAuth();", "  return user ? children : <Navigate to='/login' />;", "}"]},
    ],
    work: [
      {g: "라우팅", items: ["SPA 전체 라우팅 구조", "보호 라우트"]},
      {g: "화면", items: ["공지·Q&A·자료실 화면"]},
      {g: "인증", items: ["AuthContext 로그인 상태"]},
      {g: "배포", items: ["Docker 이미지", "Nginx 설정"]},
    ],
    challenges: [
      {title: "새로고침하면 404가 떴다", problem: "SPA 라우트에서 새로고침 시 Nginx가 실제 파일을 못 찾아 404를 반환했다.", solution: "try_files로 모든 경로를 index.html로 폴백시켜 클라이언트 라우터가 처리하게 했다."},
      {title: "배포마다 환경이 달라 깨졌다", problem: "로컬에선 되는데 서버에선 빌드가 다르게 동작했다.", solution: "Docker로 빌드·실행 환경을 고정해 ‘내 컴퓨터에선 되는데’ 문제를 제거했다."},
    ],
    tech: ["React", "React Router", "Docker", "Nginx"],
    resultScreens: [
      {title: "ajou-council.app/notice", kind: "feed", feed: ["총회 일정 안내", "학식 운영 변경", "장학 신청 안내"]},
      {title: "ajou-council.app/welfare", kind: "cards", cards: [{l: "제휴 카페", sub: "10% 할인"}, {l: "물품 대여", sub: "우산·충전기"}, {l: "제휴 식당", sub: "신규"}, {l: "프린터", sub: "무료"}]},
    ],
    metrics: [{n: "6", l: "서비스 영역"}, {n: "실서비스", l: "배포 완료"}, {n: "0", l: "새로고침 404"}, {n: "4개월", l: "프로젝트 기간"}],
    kpt: {keep: ["실제 배포까지 끝낸 경험", "환경을 Docker로 고정"], problem: ["모바일 최적화 미흡", "접근성 보강 필요"], try: ["알림 기능", "관리자 통계"]},
    learning: "처음으로 ‘만드는 것’을 넘어 ‘배포해서 진짜 쓰이게 하는 것’까지 해보며 Docker·Nginx 같은 운영 지식의 가치를 배웠다.",
  },

  // ════════════════════════════ 수어지교 (platform) ══════════════════════════
  "sign-language": {
    tagline: "SIGN LANGUAGE · LEARNING SERVICE",
    problemShot: {label: "영상만 보며 따라하던 기존 학습 방식", ratio: "4/3"},
    gallery: [
      {label: "단어 학습 목록", ratio: "16/10"},
      {label: "3D 아바타 수어 표현", ratio: "16/10"},
      {label: "퀴즈·연습 모드", ratio: "16/10"},
    ],
    tldr: [
      {k: "무엇을", v: "수어 아바타로 배우고 표현하는 학습 서비스"},
      {k: "왜", v: "수어를 체계적으로 연습할 도구가 부족함"},
      {k: "결과", v: "30개+ 단어 학습 + 텍스트→수어 변환 시제품 완성"},
      {k: "내 역할", v: "백엔드 (Spring Boot) — 서버·API·데이터 처리"},
    ],
    demo: {videoLen: "1:00", live: "#", video: "#", repo: "https://github.com/toadsam/Sign-Language"},
    meta: [
      {label: "기간", value: "2025.03 – 2025.06 · 파란학기제"},
      {label: "팀", value: "팀 프로젝트 · 백엔드 담당"},
      {label: "역할", value: "서버 구축·API 설계·데이터 처리"},
      {label: "스택", value: "Spring Boot · React · TypeScript · 3D Avatar"},
      {label: "배포", value: "클라우드 서버"},
    ],
    heroScreen: {title: "signedu.app/learn", kind: "cards", cards: [{l: "안녕하세요", sub: "인사"}, {l: "감사합니다", sub: "표현"}, {l: "이름", sub: "기본"}, {l: "도와주세요", sub: "요청"}]},
    impact: [{n: "30+", l: "학습 단어"}, {n: "양방향", l: "학습+변환"}, {n: "팀", l: "백엔드 담당"}],
    features: [
      {t: "수어 퀴즈 학습", d: "아바타 동작을 보고 의미 맞히기"},
      {t: "텍스트→수어 변환", d: "입력 텍스트를 아바타 동작으로"},
      {t: "반복 학습 흐름", d: "오답 기반 반복 출제"},
      {t: "정답 피드백", d: "즉각적 정오 피드백"},
    ],
    problem: "수어를 배우고 싶어도 체계적으로 연습할 수 있는 도구가 부족하고, 수어 동작을 보고 의미를 바로 이해하기 어렵다.",
    research: {
      quotes: [
        {q: "영상 보고 따라하는 게 전부라 내가 맞게 하는지 모르겠어요.", who: "수어 입문자 A"},
        {q: "단어를 검색해도 동작을 텍스트로만 설명해서 어려워요.", who: "학습자 B"},
      ],
      stat: {n: "30+", l: "시제품에 담은 학습 단어 수"},
    },
    hypothesis: "“아바타가 동작을 보여주고 사용자가 의미를 입력하는 양방향 구조면, 수어를 더 직관적으로 학습할 수 있다.”",
    process: [{t: "요구분석", d: "03월"}, {t: "API 설계", d: "03–04월"}, {t: "데이터 구축", d: "04–05월"}, {t: "연동", d: "05월"}, {t: "발표", d: "06월"}],
    architecture: [
      {tag: "View", name: "React + 3D Avatar", desc: "퀴즈·변환 화면"},
      {tag: "API", name: "Spring Boot", desc: "학습·정답판별·변환 API"},
      {tag: "Logic", name: "Quiz Engine", desc: "출제·정답 정규화·반복"},
      {tag: "DB", name: "단어/동작 데이터", desc: "수어 단어·매핑"},
    ],
    decisions: [
      {area: "백엔드", pick: "Spring Boot", why: "API·검증 구조에 적합", alt: "Flask(타입 약함)"},
      {area: "정답판별", pick: "정규화 비교", why: "표기 흔들림 흡수", alt: "완전 일치(오답 ↑)"},
      {area: "데이터", pick: "단어-동작 매핑", why: "양방향 변환 용이", alt: "영상 링크만(확장 ↓)"},
      {area: "협업", pick: "API 우선", why: "프론트와 병렬 작업", alt: "후순위(병목)"},
    ],
    coreCode: [
      {filename: "QuizController.java", caption: "정답을 정규화해 표기 차이를 흡수", highlightLines: [3], lines: ["public Result check(Long id, String answer) {", "  var word = repo.findById(id);", "  boolean ok = normalize(word.getMeaning())", "             .equals(normalize(answer)); // 공백·표기 정규화", "  return new Result(ok, word.getMeaning());", "}"]},
    ],
    work: [
      {g: "서버", items: ["Spring Boot 서버 구축", "학습·변환 API 설계"]},
      {g: "데이터", items: ["수어 단어·동작 매핑", "입력 데이터 처리"]},
      {g: "로직", items: ["퀴즈 출제·정답 판별", "반복 학습 흐름"]},
    ],
    challenges: [
      {title: "같은 의미를 다르게 입력하면 오답 처리됐다", problem: "‘감사합니다’와 ‘감사 합니다’가 다른 답으로 처리됐다.", solution: "공백·표기를 정규화한 뒤 비교해 의미가 같으면 정답으로 처리했다."},
      {title: "아바타 동작과 데이터 동기화", problem: "단어 데이터와 아바타 애니메이션 키가 어긋나 동작이 안 나왔다.", solution: "단어-동작 매핑을 단일 소스로 두고 API가 그 키를 그대로 내려주도록 계약을 통일했다."},
    ],
    tech: ["Spring Boot", "React", "TypeScript", "3D Avatar"],
    resultScreens: [
      {title: "signedu.app/quiz", kind: "stats", stats: [{n: "27/30", l: "정답"}, {n: "90%", l: "정답률"}, {n: "3회", l: "반복 학습"}, {n: "+12", l: "오늘 학습"}]},
      {title: "signedu.app/translate", kind: "cards", cards: [{l: "입력: 안녕", sub: "→ 동작 재생"}, {l: "입력: 이름", sub: "→ 동작 재생"}]},
    ],
    metrics: [{n: "30+", l: "학습 단어"}, {n: "양방향", l: "학습+변환"}, {n: "API", l: "백엔드 설계"}, {n: "4개월", l: "프로젝트 기간"}],
    kpt: {keep: ["API를 먼저 정해 병렬 작업한 것", "정답 정규화로 UX 개선"], problem: ["단어 수가 적음", "실사용자 테스트 부족"], try: ["단어 100개+ 확장", "동작 인식(카메라) 도입"]},
    learning: "프론트·아바타·백엔드가 얽힌 프로젝트에서 ‘데이터 계약을 단일 소스로 통일하는 것’이 협업의 핵심이라는 걸 배웠다.",
  },

  // ════════════════════════════ DarkLab (game · horror) ═════════════════════
  darklab: {
    tagline: "FIRST-PERSON HORROR · UNITY",
    problemShot: {label: "초기 그레이박스 프로토타입", ratio: "4/3"},
    gallery: [
      {label: "1인칭 탐색 플레이 화면", ratio: "16/9"},
      {label: "라이팅·분위기 연출", ratio: "16/9"},
      {label: "인터랙션·퍼즐 구간", ratio: "16/9"},
    ],
    tldr: [
      {k: "무엇을", v: "1인칭 탐색 기반 3D 공포 어드벤처 프로토타입"},
      {k: "왜", v: "공포의 긴장감은 사운드보다 ‘공간 탐색·상호작용’에서 나옴"},
      {k: "결과", v: "탐색·상호작용·카메라 연출이 유기적으로 연결된 프로토타입"},
      {k: "내 역할", v: "게임 프로그래밍 — 제어·상호작용·연출"},
    ],
    demo: {videoLen: "1:20", live: "#", video: "#", repo: "https://github.com/toadsam/DarkLab"},
    meta: [
      {label: "기간", value: "2025.05 – 2025.06"},
      {label: "팀", value: "팀 프로젝트 · 프로그래밍"},
      {label: "역할", value: "플레이어·상호작용·카메라 연출"},
      {label: "스택", value: "Unity · C# · Cinemachine · DOTween · URP"},
      {label: "플랫폼", value: "PC"},
    ],
    heroScreen: {title: "DARKLAB", kind: "title", titleText: "DARKLAB", subText: "▶ ENTER THE LAB"},
    impact: [{n: "1인칭", l: "탐색 몰입"}, {n: "URP", l: "연출 파이프라인"}, {n: "6주", l: "프로토타입"}],
    features: [
      {t: "1인칭 탐색", d: "레이캐스트 기반 오브젝트 조사"},
      {t: "카메라 연출", d: "Cinemachine 전환·시야 제한"},
      {t: "상태 관리", d: "ScriptableObject 기반 캐릭터 상태"},
      {t: "이벤트 연출", d: "NPC·트리거 이벤트"},
    ],
    problem: "공포 게임의 긴장감은 단순한 사운드보다 공간 탐색과 오브젝트 상호작용에서 나온다. 이를 자연스럽게 구현하는 카메라 연출과 이벤트 흐름이 필요했다.",
    research: {
      quotes: [
        {q: "점프스케어만 있는 공포는 금방 질려요. 탐색이 무서워야죠.", who: "공포게임 플레이어 A"},
        {q: "뭘 상호작용할 수 있는지 안 보이면 답답해요.", who: "플레이테스터 B"},
      ],
      stat: {n: "탐색", l: "긴장감의 핵심을 ‘공간·상호작용’으로 정의"},
    },
    hypothesis: "“레이캐스트 상호작용 + Cinemachine 시야 연출을 결합하면, 점프스케어 없이도 탐색 자체로 긴장감을 만들 수 있다.”",
    process: [{t: "프로토", d: "05월 초"}, {t: "상호작용", d: "05월"}, {t: "카메라 연출", d: "05–06월"}, {t: "이벤트", d: "06월"}, {t: "빌드", d: "06월"}],
    architecture: [
      {tag: "Input", name: "Input System", desc: "1인칭 이동·시점"},
      {tag: "Interact", name: "Raycast Interactor", desc: "오브젝트 조사·집기"},
      {tag: "Camera", name: "Cinemachine", desc: "전환·시야 제한 연출"},
      {tag: "Data", name: "ScriptableObject", desc: "캐릭터·상태 데이터"},
    ],
    decisions: [
      {area: "상호작용", pick: "Raycast", why: "직관적 ‘바라보는 것’ 조사", alt: "트리거 콜라이더(부정확)"},
      {area: "카메라", pick: "Cinemachine", why: "블렌딩·연출 강력", alt: "수동 카메라(공수 ↑)"},
      {area: "데이터", pick: "ScriptableObject", why: "디자이너 친화·유지보수", alt: "하드코딩(경직)"},
      {area: "렌더", pick: "URP", why: "조명·포스트 연출", alt: "Built-in(연출 ↓)"},
    ],
    coreCode: [
      {filename: "Interactor.cs", caption: "바라보는 오브젝트를 레이캐스트로 조사", highlightLines: [3, 4], lines: ["void TryInteract() {", "  Ray ray = cam.ViewportPointToRay(center);", "  if (Physics.Raycast(ray, out var hit, 2.5f))", "    hit.collider.GetComponent<IInteractable>()?.Interact();", "}"]},
      {filename: "PlayerState.cs", caption: "상태를 ScriptableObject로 분리 — 씬 간 공유", lines: ["[CreateAssetMenu]", "public class PlayerState : ScriptableObject {", "  public int sanity;", "  public bool hasKey;", "}"]},
    ],
    work: [
      {g: "제어", items: ["1인칭 이동·시점", "Input System 연동"]},
      {g: "상호작용", items: ["레이캐스트 조사·집기", "IInteractable 인터페이스"]},
      {g: "연출", items: ["Cinemachine 카메라 전환", "DOTween 연출"]},
      {g: "데이터", items: ["ScriptableObject 상태 설계"]},
    ],
    challenges: [
      {title: "카메라 전환이 뚝뚝 끊겼다", problem: "이벤트마다 카메라를 수동으로 옮기니 전환이 부자연스러웠다.", solution: "Cinemachine 가상 카메라 우선순위로 블렌딩해 부드럽게 시점이 넘어가도록 했다."},
      {title: "무엇을 상호작용할지 안 보였다", problem: "플레이어가 조사 가능한 오브젝트를 인지 못 해 답답해했다.", solution: "레이캐스트가 IInteractable에 닿으면 미세한 하이라이트/커서 변화를 줘 단서를 제공했다.", code: {filename: "Highlight.cs", lines: ["if (hit && hit.GetComponent<IInteractable>())", "  reticle.SetActive(true); // 조사 가능 신호"]}},
    ],
    tech: ["Unity", "C#", "Cinemachine", "DOTween", "URP"],
    resultScreens: [
      {title: "DARKLAB · LAB", kind: "title", titleText: "CHAPTER 1", subText: "THE LAB"},
      {title: "interactions", kind: "feed", feed: ["문서 조사 — 단서 1", "잠긴 문 — 열쇠 필요", "전원 차단기 작동", "복도 카메라 전환"]},
    ],
    metrics: [{n: "1인칭", l: "탐색 몰입"}, {n: "Cinemachine", l: "연출"}, {n: "ScriptableObject", l: "상태 구조"}, {n: "6주", l: "프로토타입"}],
    kpt: {keep: ["연출을 Cinemachine으로 위임한 것", "상태를 데이터로 분리"], problem: ["퍼즐 분량 부족", "사운드 디자인 미흡"], try: ["퍼즐·엔딩 시퀀스 추가", "세이브 시스템"]},
    learning: "공포는 ‘놀래키기’가 아니라 ‘플레이어가 스스로 긴장하게 만드는 설계’라는 걸 배웠다. 연출 도구를 잘 위임하는 것도 실력이었다.",
  },

  // ════════════════════════════ 아주분투 (game · arcade) ═════════════════════
  "ajou-adventure": {
    tagline: "2D CASUAL RUNNER · PHASER 3",
    problemShot: {label: "초기 프로토타입 화면", ratio: "4/3"},
    gallery: [
      {label: "인게임 러닝 플레이", ratio: "16/9"},
      {label: "장애물 구간", ratio: "16/9"},
      {label: "점수·결과 화면", ratio: "16/9"},
    ],
    tldr: [
      {k: "무엇을", v: "아주대 캠퍼스 배경 2D 캐주얼 러닝 게임"},
      {k: "왜", v: "대학생이 공감할 가벼운 웹 게임을 만들고 싶었음"},
      {k: "결과", v: "PC·모바일에서 바로 플레이되는 완성형 캐주얼 게임"},
      {k: "내 역할", v: "게임 기획 및 전체 개발"},
    ],
    demo: {videoLen: "0:45", live: "#", video: "#", repo: "https://github.com/toadsam/Ajou_Mini_Game"},
    meta: [
      {label: "기간", value: "2025.04 · 2주"},
      {label: "팀", value: "개인 프로젝트"},
      {label: "역할", value: "기획·개발 전담"},
      {label: "스택", value: "TypeScript · Phaser 3 · Vite"},
      {label: "플랫폼", value: "Web (PC/모바일)"},
    ],
    heroScreen: {title: "AJOU RUN", kind: "title", titleText: "아주분투", subText: "▶ PRESS START"},
    impact: [{n: "60fps", l: "안정 프레임"}, {n: "PC+모바일", l: "크로스"}, {n: "2주", l: "기획→배포"}],
    features: [
      {t: "자동 횡스크롤 러닝", d: "끊임없이 달리는 러너 구조"},
      {t: "낮/노을/밤 전환", d: "진행에 따른 배경 변화"},
      {t: "와이어 액션", d: "줄을 걸어 점프하는 메커닉"},
      {t: "최고 점수 저장", d: "localStorage 기록"},
    ],
    problem: "캠퍼스 생활을 소재로 가볍게 즐길 웹 게임이 없었고, 대학생이 공감할 요소로 게임을 만들고 싶었다.",
    research: {
      quotes: [
        {q: "쉬는 시간에 잠깐 할 가벼운 게임이 의외로 없어요.", who: "재학생 A"},
        {q: "우리 학교 배경이면 더 재밌을 것 같아요.", who: "재학생 B"},
      ],
      stat: {n: "캠퍼스", l: "공감 요소를 핵심 차별점으로 설정"},
    },
    hypothesis: "“캠퍼스 공간과 대학생 공감 아이템(A+, 학생증, 과제 폭탄)을 러너에 녹이면, 가볍지만 몰입되는 게임이 된다.”",
    process: [{t: "기획", d: "1주차"}, {t: "코어 루프", d: "1주차"}, {t: "아이템·연출", d: "2주차"}, {t: "최적화", d: "2주차"}, {t: "배포", d: "2주차"}],
    architecture: [
      {tag: "Scene", name: "Phaser Scenes", desc: "타이틀·플레이·게임오버"},
      {tag: "Loop", name: "Update Loop", desc: "발판·아이템 생성/제거"},
      {tag: "Pool", name: "Object Pool", desc: "화면 밖 오브젝트 재사용"},
      {tag: "Store", name: "localStorage", desc: "최고 점수"},
    ],
    decisions: [
      {area: "엔진", pick: "Phaser 3", why: "2D 웹게임 표준·빠른 개발", alt: "Canvas 직접(공수 ↑)"},
      {area: "성능", pick: "오브젝트 풀링", why: "GC 끊김 제거", alt: "매번 생성/파괴(렉)"},
      {area: "빌드", pick: "Vite", why: "빠른 개발·경량 번들", alt: "Webpack(무거움)"},
      {area: "저장", pick: "localStorage", why: "서버 없이 기록 유지", alt: "백엔드(과함)"},
    ],
    coreCode: [
      {filename: "spawner.ts", caption: "화면 밖 발판을 풀에서 재사용 (생성/파괴 X)", highlightLines: [2, 3], lines: ["update() {", "  if (platform.x < -W) pool.release(platform); // 재사용", "  const p = pool.acquire();", "  p.setPosition(W + gap, randomY());", "}"]},
    ],
    work: [
      {g: "기획", items: ["코어 러닝 루프", "캠퍼스 아이템/장애물 설계"]},
      {g: "구현", items: ["와이어 액션 점프", "낮/노을/밤 배경 전환"]},
      {g: "성능", items: ["오브젝트 풀링", "프레임 안정화"]},
      {g: "운영", items: ["최고 점수 저장", "PC/모바일 대응"]},
    ],
    challenges: [
      {title: "발판이 늘어날수록 프레임이 떨어졌다", problem: "발판·아이템을 매 프레임 생성/파괴하니 GC가 끊김을 유발했다.", solution: "오브젝트 풀을 도입해 화면 밖 객체를 재사용, 생성/파괴를 없애 60fps를 유지했다."},
      {title: "난이도가 너무 빨리 어려워졌다", problem: "속도 증가가 선형이라 초반에 급격히 어려워 이탈했다.", solution: "점수 구간별로 속도·간격을 완만한 곡선으로 조정해 체감 난이도를 다듬었다.", code: {filename: "difficulty.ts", lines: ["// 로그 곡선으로 완만하게 상승", "speed = base + Math.log2(score + 1) * 0.4;"]}},
    ],
    perf: {rows: [{label: "프레임", before: 38, after: 60, unit: "fps"}, {label: "GC 끊김/분", before: 14, after: 1, unit: "회"}], note: "오브젝트 풀링 적용"},
    tech: ["TypeScript", "Phaser 3", "Vite"],
    resultScreens: [
      {title: "AJOU RUN · PLAY", kind: "stats", stats: [{n: "1,240", l: "점수"}, {n: "x3", l: "콤보"}, {n: "60", l: "fps"}, {n: "BEST", l: "갱신"}]},
      {title: "AJOU RUN · OVER", kind: "title", titleText: "GAME OVER", subText: "BEST 1,240"},
    ],
    metrics: [{n: "60fps", l: "안정 프레임"}, {n: "-93%", l: "GC 끊김"}, {n: "PC+모바일", l: "크로스"}, {n: "2주", l: "기획→배포"}],
    kpt: {keep: ["풀링으로 성능을 측정 기반 개선", "공감 소재 선택"], problem: ["사운드/이펙트 부족", "콘텐츠 분량 적음"], try: ["리더보드·소셜 공유", "스테이지 다양화"]},
    learning: "‘재미’ 이전에 ‘끊기지 않음’이 먼저라는 걸 배웠다. 오브젝트 풀링 같은 기본기가 체감 품질을 좌우했다.",
  },

  // ════════════════════════════ TSEROF (game · platformer) ══════════════════
  tserof: {
    tagline: "3D PLATFORMER · UNITY (TEAM OF 5)",
    problemShot: {label: "그레이박스 레벨 프로토타입", ratio: "4/3"},
    gallery: [
      {label: "스테이지 플레이 화면", ratio: "16/9"},
      {label: "숨은 아이템 탐색", ratio: "16/9"},
      {label: "스테이지 클리어 화면", ratio: "16/9"},
    ],
    tldr: [
      {k: "무엇을", v: "숨은 아이템을 찾아 스테이지를 클리어하는 3D 플랫포머"},
      {k: "왜", v: "이동 조작감과 스테이지 진행감을 동시에 살리고 싶었음"},
      {k: "결과", v: "5인 팀 협업으로 스테이지 클리어 구조 완성"},
      {k: "내 역할", v: "게임 프로그래밍 — 제어·스테이지 시스템"},
    ],
    demo: {videoLen: "1:10", live: "#", video: "#", repo: "https://github.com/KimEoJin24/TSEROF"},
    meta: [
      {label: "기간", value: "2025.04 – 2025.06"},
      {label: "팀", value: "5인 팀 · 프로그래밍"},
      {label: "역할", value: "플레이어 제어·스테이지 시스템"},
      {label: "스택", value: "Unity 2022.3 · C#"},
      {label: "플랫폼", value: "PC"},
    ],
    heroScreen: {title: "TSEROF", kind: "title", titleText: "TSEROF", subText: "▶ START GAME"},
    impact: [{n: "5인", l: "팀 협업"}, {n: "다단계", l: "스테이지"}, {n: "저장", l: "진행 유지"}],
    features: [
      {t: "WASD + 2단 점프", d: "조작감 있는 플레이어 컨트롤"},
      {t: "스테이지 잠금 해제", d: "클리어 시 다음 스테이지 오픈"},
      {t: "진행상황 저장", d: "이어하기 지원"},
      {t: "숨겨진 아이템", d: "탐색형 클리어 조건"},
    ],
    problem: "플랫포머에서 스테이지 진행감과 탐색 재미를 동시에 살리려면 이동 조작과 스테이지 구조가 잘 맞물려야 한다.",
    research: {
      quotes: [
        {q: "점프 조작이 어색하면 그 게임은 바로 끄게 돼요.", who: "플랫포머 유저 A"},
        {q: "다 깬 스테이지를 또 처음부터 하면 짜증나요.", who: "플레이테스터 B"},
      ],
      stat: {n: "5인", l: "Unity 씬 충돌 없이 협업해야 하는 팀 규모"},
    },
    hypothesis: "“정확한 2단 점프 컨트롤 + 스테이지 잠금/저장을 갖추면, 조작감과 진행감을 동시에 만족시킬 수 있다.”",
    process: [{t: "기획", d: "04월"}, {t: "컨트롤러", d: "04–05월"}, {t: "스테이지", d: "05월"}, {t: "저장", d: "05–06월"}, {t: "빌드", d: "06월"}],
    architecture: [
      {tag: "Input", name: "Player Controller", desc: "이동·2단 점프"},
      {tag: "Flow", name: "Stage Manager", desc: "선택·잠금 해제·전환"},
      {tag: "Save", name: "Progress Save", desc: "클리어·이어하기"},
      {tag: "Git", name: "Team Workflow", desc: "씬 충돌 최소화 분업"},
    ],
    decisions: [
      {area: "점프", pick: "코요테 타임", why: "조작감·관용도 ↑", alt: "엄격 판정(좌절 ↑)"},
      {area: "스테이지", pick: "잠금 해제식", why: "진행감 부여", alt: "전면 개방(동기 ↓)"},
      {area: "저장", pick: "JSON 직렬화", why: "단순·디버그 쉬움", alt: "PlayerPrefs(구조 빈약)"},
      {area: "협업", pick: "씬 분리", why: "5인 머지 충돌 최소화", alt: "단일 씬(충돌 ↑)"},
    ],
    coreCode: [
      {filename: "PlayerController.cs", caption: "코요테 타임을 둔 2단 점프", highlightLines: [3, 4], lines: ["void Jump() {", "  bool canGround = grounded || coyote > 0;", "  if (canGround) { Leap(); jumps = 1; }", "  else if (jumps > 0) { Leap(); jumps--; } // 2단", "}"]},
      {filename: "StageManager.cs", caption: "클리어 시 다음 스테이지 잠금 해제 + 저장", lines: ["public void Clear(int stage) {", "  progress.unlocked = Mathf.Max(progress.unlocked, stage + 1);", "  Save.Write(progress); // 이어하기", "}"]},
    ],
    work: [
      {g: "제어", items: ["이동·2단 점프 컨트롤러", "코요테 타임 판정"]},
      {g: "스테이지", items: ["선택·잠금 해제 시스템"]},
      {g: "저장", items: ["진행상황 직렬화·이어하기"]},
      {g: "협업", items: ["씬 분리 작업 구조"]},
    ],
    challenges: [
      {title: "5인이 같은 씬을 건드려 머지 충돌이 잦았다", problem: "Unity .unity 씬 파일은 머지가 어려워 협업 시 충돌이 빈번했다.", solution: "스테이지를 씬/프리팹 단위로 분리하고 담당을 나눠, 한 파일을 여러 명이 동시에 만지지 않게 작업 규칙을 세웠다."},
      {title: "점프가 ‘떨어지는 순간’ 안 먹혔다", problem: "발판 끝에서 점프하면 무시되는 경우가 있어 답답했다.", solution: "착지 직후 짧은 코요테 타임을 둬, 막 떨어진 순간에도 점프를 허용해 조작감을 높였다."},
    ],
    tech: ["Unity", "C#"],
    resultScreens: [
      {title: "TSEROF · STAGE", kind: "cards", cards: [{l: "Stage 1", sub: "클리어"}, {l: "Stage 2", sub: "클리어"}, {l: "Stage 3", sub: "진행중"}, {l: "Stage 4", sub: "잠김"}]},
      {title: "TSEROF · PLAY", kind: "stats", stats: [{n: "3/5", l: "스테이지"}, {n: "12", l: "아이템"}, {n: "02:14", l: "기록"}, {n: "이어하기", l: "저장됨"}]},
    ],
    metrics: [{n: "5인", l: "팀 협업"}, {n: "다단계", l: "스테이지"}, {n: "이어하기", l: "저장 지원"}, {n: "3개월", l: "프로젝트 기간"}],
    kpt: {keep: ["코요테 타임으로 조작감 개선", "씬 분리로 협업 충돌 최소화"], problem: ["스테이지 분량 부족", "밸런싱 시간 부족"], try: ["보스 패턴 추가", "리플레이/타임어택"]},
    learning: "5인 협업에서 ‘기술’만큼 ‘충돌 안 나게 일 나누는 구조’가 중요하다는 걸 배웠다. 조작감은 디테일(코요테 타임) 한 줄에서 갈렸다.",
  },
};
