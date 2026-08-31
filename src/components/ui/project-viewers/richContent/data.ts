import type {RichProject} from "./shared";

// 실제 GitHub 저장소(README·소스·구조)를 근거로 작성한 콘텐츠.
// 원칙: 검증 불가능한 수치(성능 %, 사용자 테스트 점수 등)는 넣지 않는다.
//   - metrics/impact 는 리포에서 셀 수 있는 값(도메인 수·API 수·모듈 수 등)만 사용.
//   - perf/usability(측정치) 필드는 실측이 없으므로 비워 둠(의도적).
// 기간·역할·팀은 `resume/jaehoon-jeong-resume.md`(이력서 원본) 기준. 원본에 근거가
// 없는 프로젝트(mystock · ajou-adventure)는 기간 행 자체를 두지 않는다 — 예전엔
// 그 자리에 `"[확인필요] 개인 프로젝트"` 라는 글자가 그대로 들어 있었고, 원페이저가
// 기간 행을 렌더하는 순간 그게 화면에 나갈 뻔했다. 지어내느니 비운다.
//   - demo.live: 실제 배포 URL이 있으면 추가 (지금은 repo만).
//   - meta '기간': 실제 진행 기간으로 수정.
export const RICH_DATA: Record<string, RichProject> = {
  // ════════════════════════════ MyStock-Desk / StockFlow (dashboard) ═════════
  mystock: {
    tagline: "INVESTMENT PORTFOLIO · FULL-STACK WEB APP",
    problemShot: {
      label: "엑셀로 수익률을 직접 관리하던 기존 방식",
      ratio: "4/3"
    },
    gallery: [
      {label: "보유 종목 · 수익률 화면", ratio: "16/10"},
      {label: "자산 비중 차트", ratio: "16/10"},
      {label: "AI 체크포인트(리서치) 리포트", ratio: "16/10"},
      {label: "MyWave 자산 흐름 대시보드", ratio: "16/10"}
    ],
    tldr: [
      {
        k: "무엇을",
        v: "거래 기록 기반 포트폴리오 분석 + AI 체크포인트 웹앱 (StockFlow) · 자산 흐름 대시보드(MyWave) 포함"
      },
      {k: "왜", v: "수익률·자산 비중·뉴스 영향을 한 곳에서 보기 어려움"},
      {
        k: "결과",
        v: "증권사 실연동 없이 입력 거래만으로 포트폴리오를 계산·분석"
      },
      {k: "내 역할", v: "1인 풀스택 — React 프론트 + Spring Boot 백엔드"}
    ],
    demo: {repo: "https://github.com/toadsam/MyStock-Desk"},
    meta: [
      {label: "팀", value: "개인 프로젝트 (풀스택 1인)"},
      {label: "역할", value: "도메인 설계 · 프론트 · 백엔드 전부"},
      {
        label: "스택",
        value: "React · TS · Vite · Spring Boot · JPA · H2/MySQL · Recharts"
      },
      {label: "실행", value: "Gradle bootRun + Vite · 데모 계정 제공"}
    ],
    heroScreen: {
      title: "stockflow/portfolio",
      kind: "dashboard",
      kpi: [
        {l: "도메인", v: "13"},
        {l: "Provider", v: "Yahoo+Demo"},
        {l: "AI", v: "정리형"}
      ],
      chart: [20, 26, 22, 34, 30, 42, 38, 50, 58, 64]
    },
    impact: [
      {n: "13", l: "백엔드 도메인 모듈"},
      {n: "2", l: "시세 Provider(폴백)"},
      {n: "1인", l: "풀스택"}
    ],
    features: [
      {
        t: "보유 종목·수익률",
        d: "입력 거래 기반 보유 종목·평가/실현 손익 계산"
      },
      {t: "자산 비중 차트", d: "종목·비중을 Recharts로 시각화"},
      {t: "AI 체크포인트", d: "매수/매도 추천이 아닌 리스크·뉴스 변화 ‘정리’"},
      {t: "테마·뉴스 탐색", d: "Google News RSS 기반 관련 기사·키워드"}
    ],
    problem:
      "투자 기록을 직접 관리하면 수익률·자산 비중을 한눈에 파악하기 어렵고, 뉴스가 내 종목에 어떤 영향을 주는지 판단할 도구가 부족하다. 실제 증권사 연동 없이도 ‘내가 입력한 데이터’만으로 분석이 되어야 했다.",
    research: {
      quotes: [
        {
          q: "종목이 늘어날수록 엑셀로는 평균 매입가·수익률 관리가 무너진다.",
          who: "프로젝트 문제 정의"
        },
        {
          q: "AI가 ‘사라/팔라’를 말하면 오히려 신뢰가 떨어진다 — 판단은 사용자 몫이어야 한다.",
          who: "설계 원칙 (README)"
        }
      ],
      stat: {
        n: "13",
        l: "member·stock·portfolio·transaction·research 등 도메인 모듈 수"
      }
    },
    beforeCode: {
      filename: "naive-pnl.ts",
      caption: "단순 현재가 합산 — 평균 매입가/실현손익 개념이 없음",
      lines: [
        "// 기존: 보유 수량 × 현재가만 합산",
        "const total = holdings.reduce(",
        "  (sum, h) => sum + h.qty * h.price, 0",
        "); // 언제 얼마에 샀는지가 반영되지 않는다"
      ]
    },
    hypothesis:
      "“거래 기록을 도메인별로 나눠 서버에서 집계하고, AI는 ‘판단’이 아니라 ‘정리’ 역할로 한정하며, 외부 시세가 실패해도 Demo Provider로 폴백하면 — 실연동 없이도 신뢰할 수 있는 포트폴리오 분석을 제공할 수 있다.”",
    process: [
      {t: "도메인 설계", d: "13개 모듈"},
      {t: "백엔드 API", d: "JPA·Security"},
      {t: "프론트", d: "React·Recharts"},
      {t: "AI 리서치", d: "정리형"},
      {t: "시세 폴백", d: "Yahoo→Demo"}
    ],
    architecture: [
      {
        tag: "View",
        name: "React + Recharts",
        desc: "포트폴리오·수익률·뉴스·리서치 화면"
      },
      {
        tag: "API",
        name: "Spring Boot REST",
        desc: "portfolio · transaction · stock · research 등 13 도메인"
      },
      {
        tag: "Market",
        name: "MarketDataProvider",
        desc: "Yahoo Finance ↔ Demo(seed) 폴백 인터페이스"
      },
      {tag: "DB", name: "H2 / MySQL", desc: "JPA로 거래·보유·리서치 영속화"}
    ],
    decisions: [
      {
        area: "백엔드",
        pick: "Spring Boot",
        why: "도메인 분리·검증·보안에 강함",
        alt: "Express(타입·검증 약함)"
      },
      {
        area: "AI 역할",
        pick: "정리형",
        why: "투자 추천의 신뢰·법적 리스크 회피",
        alt: "추천형(리스크 ↑)"
      },
      {
        area: "시세",
        pick: "Provider 추상화",
        why: "Yahoo 실패 시 Demo로 폴백",
        alt: "단일 연동(장애 시 빈 화면)"
      },
      {
        area: "차트",
        pick: "Recharts",
        why: "선언적 구현·React 친화",
        alt: "Chart.js(명령형)"
      }
    ],
    coreCode: [
      {
        filename: "MarketDataProvider.java",
        caption: "시세 소스를 인터페이스로 추상화 — Yahoo/Demo 교체 가능",
        highlightLines: [1],
        lines: [
          "public interface MarketDataProvider {",
          "  List<StockQuoteSnapshot> fetch(List<String> symbols);",
          "}",
          "// YahooFinanceMarketDataProvider · DemoMarketDataProvider 가 구현",
          "// 설정(stockflow.market-data.provider)으로 스위치 → 실패 시 Demo 폴백"
        ]
      },
      {
        filename: "PortfolioService.java",
        caption: "요청마다 스냅샷을 갱신한 뒤 포트폴리오 반환",
        highlightLines: [3],
        lines: [
          "@Transactional",
          "public PortfolioDto getPortfolio() {",
          "  Portfolio portfolio = findPortfolio();",
          "  portfolioSnapshotService.refresh(portfolio); // 최신 시세 반영",
          "  return PortfolioDto.from(portfolio);",
          "}"
        ]
      }
    ],
    work: [
      {
        g: "백엔드",
        items: ["13개 도메인 모듈 설계", "거래 기반 보유/손익 집계"]
      },
      {g: "프론트", items: ["포트폴리오·수익률·비중 화면", "뉴스/리서치 화면"]},
      {
        g: "AI/데이터",
        items: ["리서치(정리형) 응답 설계", "Google News RSS 연동"]
      },
      {g: "안정성", items: ["Provider 폴백", "데모 계정·seed 데이터"]}
    ],
    challenges: [
      {
        title: "외부 시세/뉴스가 실패하면 화면이 비었다",
        problem:
          "Yahoo Finance·뉴스 RSS 호출이 실패하면 대시보드가 빈 화면이 됐다.",
        solution:
          "MarketDataProvider를 인터페이스로 두고 DemoMarketDataProvider(seed)로 폴백해, 외부가 죽어도 화면 구조를 유지했다.",
        code: {
          filename: "provider-switch",
          lines: [
            "// 설정으로 provider 선택, 실패 시 Demo로",
            "provider = resolve(props.getProvider());",
            "return provider.fetch(symbols); // Demo면 seed 반환"
          ]
        }
      },
      {
        title: "AI가 추천처럼 답하려 했다",
        problem: "프롬프트에 따라 ‘사세요/파세요’ 류 답이 섞여 신뢰를 해쳤다.",
        solution:
          "리서치 응답을 ‘리스크·뉴스 변화 정리’ 스키마로 한정하고, 판단 주체를 사용자로 유지했다."
      }
    ],
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "Spring Boot",
      "Spring Data JPA",
      "H2/MySQL",
      "Recharts"
    ],
    resultScreens: [
      {
        title: "stockflow/portfolio",
        kind: "bars",
        bars: [
          {l: "보유 종목", p: 70, v: "다수"},
          {l: "자산 비중", p: 55, v: "차트"},
          {l: "현금", p: 30, v: "비중"}
        ]
      },
      {
        title: "stockflow/research",
        kind: "feed",
        feed: [
          "리스크 점검 항목",
          "관련 뉴스 변화",
          "재무지표 변화",
          "보유 기준 영향도"
        ]
      }
    ],
    metrics: [
      {n: "13", l: "백엔드 도메인"},
      {n: "9", l: "주요 페이지"},
      {n: "2", l: "시세 Provider"},
      {n: "1인", l: "풀스택"}
    ],
    kpt: {
      keep: [
        "도메인을 먼저 나누고 화면을 붙인 순서",
        "AI 역할을 ‘정리’로 제한",
        "Provider 폴백 설계"
      ],
      problem: ["테스트 코드 부족", "프론트 상태 관리가 후반에 복잡해짐"],
      try: ["실시간 시세 연동", "포트폴리오 자동 갱신"]
    },
    learning:
      "AI를 ‘판단 주체’가 아니라 ‘정리 도구’로 제한했을 때 오히려 신뢰가 올라갔다. 그리고 외부 의존은 반드시 폴백을 두어야 화면이 살아있다는 걸 배웠다."
  },

  // ════════════════════════════ FestFlow / Fest-A (realtime) ════════════════
  festflow: {
    tagline: "REALTIME FESTIVAL OPS · FULL-STACK WEB APP",
    heroImage: {
      src: "/projects/op/festflow-two-faces.webp",
      label: "같은 앱, 역할에 따라 다른 화면",
      // 정사각. 16:9 로 두면 5칸(약 480px)짜리 자리에서 폰이 96px 폭이 된다.
      ratio: "1/1",
      caption:
        "왼쪽은 방문객이 보는 부스 지도(Leaflet + OSM), 오른쪽은 운영진이 보는 무대 혼잡 관제. 한 코드베이스이며 프론트 셸의 data-route-scope=“public|ops” 로 갈린다."
    },
    problemShot: {
      src: "/projects/festflow/problem.webp",
      label: "기획 단계에서 정의한 축제 운영의 문제",
      ratio: "16/9",
      caption: "중간 기획 발표 자료 — 구현 전에 정리한 문제 정의"
    },
    // 이 페이지에서 가장 넓은 자리(약 1,216px)라 세로로 긴 폰 캡처를
    // 가로로 늘어놓기에 알맞다. 갤러리(약 390px)에 넣으면 글씨가 죽는다.
    resultShot: {
      src: "/projects/op/festflow-screens.webp",
      label: "실제 화면 4종",
      ratio: "21/9",
      caption:
        "왼쪽 셋은 방문객 화면(부스 목록·공연 일정·AI 허브), 오른쪽은 운영진 관제. 저장소 docs/assets/ 에 커밋된 캡처를 그대로 옮겼다."
    },
    gallery: [
      {
        src: "/projects/op/festflow-g-admin.webp",
        label: "관리자 운영 콘솔",
        ratio: "4/5",
        caption: "공지 발행·부스 상태 변경 — SSE 팬아웃이 시작되는 지점"
      },
      {
        src: "/projects/op/festflow-g-chat.webp",
        label: "AI 축제 챗봇",
        ratio: "4/5",
        caption: "혼잡·공연·부스를 자연어로 묻는다 (AiGuideController)"
      },
      {
        src: "/projects/op/festflow-g-lost.webp",
        label: "분실물 센터",
        ratio: "4/5",
        caption: "7개 SSE 채널 중 lost-items — 등록·반환 상태가 즉시 전파된다"
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "대학 축제 부스를 실시간으로 운영·관제하는 웹앱 (Fest-A)"
      },
      {
        k: "왜",
        v: "수십 개 부스의 상태·혼잡도·공지를 실시간 공유할 도구가 없었음"
      },
      {
        k: "결과",
        v: "7개 SSE 채널 · 백엔드 컨트롤러 26개 · GPS 지오펜싱 · AI 혼잡 예측까지 1인 구현"
      },
      {k: "내 역할", v: "1인 풀스택 (프론트 전체 + Spring Boot 백엔드 + 모델)"}
    ],
    demo: {repo: "https://github.com/toadsam/FestFlow"},
    meta: [
      {label: "기간", value: "~ 2026.06"},
      {label: "팀", value: "개인 프로젝트 (풀스택 1인)"},
      {label: "역할", value: "프론트 전체 · SSE·GPS 백엔드 · 혼잡 예측 모델"},
      {
        label: "스택",
        value:
          "React · Vite · Leaflet · PWA · Spring Boot 3 · JWT · SSE · MySQL · scikit-learn"
      },
      {label: "실행", value: "Gradle bootRun + Vite · PWA"}
    ],
    heroScreen: {
      title: "fest-a/live",
      kind: "feed",
      feed: [
        "혼잡도 스트림 갱신",
        "부스 상태 변경 푸시",
        "운영 공지(긴급/분실물)",
        "예약/체크인 이벤트"
      ]
    },
    impact: [
      {n: "7", l: "SSE 실시간 채널"},
      {n: "26", l: "백엔드 컨트롤러"},
      {n: "80m", l: "GPS 부스 판정"}
    ],
    features: [
      {
        t: "실시간 스트림",
        d: "혼잡도·부스·공지·분실물·예약·스태프·이벤트 7채널"
      },
      {
        t: "실제 지도 배치",
        d: "React Leaflet + OpenStreetMap 타일 위 부스 마커·카테고리 필터"
      },
      {
        t: "GPS 지오펜싱",
        d: "부스 반경 80m 로 근접 판정 · 무대는 반경 55m·수용 4,000명 기준"
      },
      {
        t: "AI 혼잡 예측",
        d: "24개 feature 로 30분 뒤 혼잡도 분류 (RandomForest)"
      },
      {
        t: "AI 안내·번역·분실물·예약",
        d: "챗봇·실시간 번역·분실물·QR 체크인까지 컨트롤러 26개"
      },
      {
        t: "역할별 화면 분리",
        d: "방문객/스태프/관리자 JWT 3등급 · 다국어·고대비 모드 · PWA"
      }
    ],
    problem:
      "대학 축제는 수십 개 부스가 동시에 운영되는데, 혼잡도·품절·공지·분실물 같은 상태를 실시간으로 공유하고 역할별로 접근할 도구가 없어 전화·메신저로 처리하고 있었다.",
    research: {
      quotes: [
        {
          q: "부스가 품절됐는지 본부에서는 전화를 돌려야 알 수 있었다.",
          who: "운영 현장 문제 정의"
        },
        {q: "방문객은 어디가 붐비는지 모른 채 돌아다닌다.", who: "방문객 관점"}
      ],
      stat: {
        n: "7",
        l: "혼잡도·부스·공지·분실물·예약·스태프·이벤트 SSE 채널 수"
      }
    },
    hypothesis:
      "“상태 변화를 종류별 SSE 채널로 분리해 즉시 푸시하고, 실제 지도 위에서 GPS 반경으로 부스를 판정하면 — 관리자·스태프·방문자가 같은 현황을 실시간으로 공유할 수 있다.”",
    process: [
      {t: "요구분석", d: "운영 흐름"},
      {t: "SSE 채널 설계", d: "7종 분리"},
      {t: "지도·GPS", d: "Leaflet·지오펜싱"},
      {t: "권한", d: "JWT 3등급"},
      {t: "혼잡 예측", d: "모델 + 폴백"}
    ],
    // ── 그림 두 장이 답하는 질문 ──────────────────────────────────────────
    //  ① 관리자가 버튼 하나 누르면 왜 방문객 화면이 새로고침 없이 바뀌는가
    //  ② 파이썬 모델이 죽으면 서비스도 같이 죽는가 (아니오 — 그래서 그렸다)
    //  좌표는 손으로 잡았다. 자동 배치로 뽑은 네모 네 개짜리 그림은
    //  어떤 프로젝트에나 들어맞고, 그래서 이 프로젝트에 대해 아무 말도 못 한다.
    diagrams: [
      {
        title: "Realtime Fan-out",
        viewBox: [1180, 470],
        caption:
          "요점은 가운데서 한 번 모였다가 종류별로 갈라진다는 것 — 상태를 한 채널로 다 밀면 관심 없는 이벤트까지 모두가 받는다. 엔드포인트 7개는 StreamController.java 에 그대로 있다.",
        groups: [
          {label: "상태를 바꾸는 쪽 (쓰기)", x: 16, y: 40, w: 300, h: 376},
          {label: "구독하는 쪽 (읽기)", x: 864, y: 40, w: 300, h: 376}
        ],
        nodes: [
          {
            id: "adm",
            label: "관리자 콘솔",
            note: "공지 발행 · 부스 상태",
            x: 34,
            y: 78,
            w: 264,
            h: 76
          },
          {
            id: "stf",
            label: "스태프 화면",
            note: "예약 · 체크인 · 분실물",
            x: 34,
            y: 190,
            w: 264,
            h: 76
          },
          {
            id: "gps",
            label: "GPS 수집",
            note: "반경 80m 혼잡도 집계",
            x: 34,
            y: 302,
            w: 264,
            h: 76
          },
          {
            id: "hub",
            label: "StreamService",
            note: "SseEmitter 목록 관리",
            sub: "끊긴 연결 정리",
            x: 420,
            y: 170,
            w: 340,
            h: 96,
            accent: true
          },
          {
            id: "ch",
            label: "7개 채널",
            note: "/congestion /events /notices /booths",
            sub: "/staff /lost-items /reservations",
            x: 396,
            y: 330,
            w: 388,
            h: 96
          },
          {
            id: "vis",
            label: "방문객 앱",
            note: "EventSource · 자동 재연결",
            x: 882,
            y: 78,
            w: 264,
            h: 76
          },
          {
            id: "ops",
            label: "관제 대시보드",
            note: "KPI · 혼잡 · 공지",
            x: 882,
            y: 190,
            w: 264,
            h: 76
          },
          {
            id: "fld",
            label: "스태프 화면",
            note: "현장 상태 즉시 반영",
            x: 882,
            y: 302,
            w: 264,
            h: 76
          }
        ],
        edges: [
          {from: [298, 116], to: [416, 196]},
          {from: [298, 228], to: [416, 218]},
          {from: [298, 340], to: [416, 240]},
          {from: [762, 196], to: [880, 116]},
          {from: [762, 218], to: [880, 228]},
          {from: [762, 240], to: [880, 340]},
          {from: [590, 268], to: [590, 326]}
        ]
      },
      {
        title: "Congestion Prediction — Fallback First",
        viewBox: [1180, 460],
        caption:
          "모델이 있으면 쓰고, 없으면 규칙으로 내려간다. 강등 조건은 셋 — 설정으로 꺼져 있거나, 스크립트·모델 파일이 없거나, 20초 안에 못 끝내거나. 정확도는 시뮬레이션 데이터 2,520건 기준이지 실제 축제 데이터가 아니다.",
        nodes: [
          {
            id: "req",
            label: "혼잡 조회",
            note: "부스 목록 요청",
            x: 16,
            y: 190,
            w: 164,
            h: 76
          },
          {
            id: "svc",
            label: "AiCongestionService",
            note: "예약·체크인·GPS·대기 집계",
            sub: "24개 feature 구성",
            x: 220,
            y: 180,
            w: 250,
            h: 96,
            accent: true
          },
          {
            id: "py",
            label: "파이썬 모델 프로세스",
            note: "ProcessBuilder(python3)",
            sub: "random_forest_*.pkl · 20초 제한",
            x: 520,
            y: 60,
            w: 280,
            h: 96
          },
          {
            id: "rule",
            label: "규칙 기반 점수",
            note: "가중 휴리스틱",
            sub: "MODEL_UNAVAILABLE",
            x: 520,
            y: 316,
            w: 280,
            h: 96
          },
          {
            id: "out",
            label: "예측 혼잡도",
            note: "여유 · 보통 · 혼잡 · 매우 혼잡",
            sub: "30분 뒤 기준",
            x: 860,
            y: 180,
            w: 300,
            h: 96
          }
        ],
        edges: [
          {from: [180, 228], to: [218, 228]},
          {
            from: [470, 205],
            to: [518, 110],
            label: "정상",
            labelAt: [497, 146]
          },
          {
            from: [470, 252],
            to: [518, 362],
            kind: "dashed",
            label: "꺼짐 · 파일 없음 · 20초 초과",
            labelAt: [450, 300]
          },
          {from: [800, 110], to: [858, 205]},
          {from: [800, 362], to: [858, 252], kind: "dashed"}
        ]
      }
    ],
    architecture: [
      {
        tag: "View",
        name: "React + Leaflet(PWA)",
        desc: "지도·부스 카드·관리 대시보드"
      },
      {
        tag: "Stream",
        name: "7× SseEmitter",
        desc: "/api/stream/congestion·booths·notices·…"
      },
      {
        tag: "Geo",
        name: "BoothService",
        desc: "GPS 로그 기반 반경 80m 지오펜싱"
      },
      {tag: "DB", name: "MySQL 8", desc: "부스·예약·GPS 로그·스태프"}
    ],
    decisions: [
      {
        area: "실시간",
        pick: "SSE(채널 분리)",
        why: "단방향 푸시에 충분, 종류별 구독으로 부하 분리",
        alt: "WebSocket(양방향 과함)"
      },
      {
        area: "지도",
        pick: "React Leaflet + OSM",
        why: "오픈소스·비용 0·커스텀 마커",
        alt: "Google Maps(비용)"
      },
      {
        area: "위치",
        pick: "반경 80m 지오펜싱",
        why: "현장 도보 판정에 현실적",
        alt: "정확 좌표 매칭(오차 ↑)"
      },
      {
        area: "혼잡 예측",
        pick: "파이썬 모델을 별도 프로세스로",
        why: "scikit-learn 자산을 그대로 쓰고, 죽어도 API 는 안 죽는다",
        alt: "자바 안에서 재구현(학습·검증을 다시)"
      },
      {
        area: "인증",
        pick: "JWT 3등급",
        why: "관리자/스태프/방문자 무상태 권한",
        alt: "세션(스케일 ↓)"
      }
    ],
    coreCode: [
      {
        filename: "StreamController.java",
        caption: "상태 종류별로 SSE 채널을 분리 (7개 엔드포인트)",
        highlightLines: [3, 4],
        lines: [
          '@RestController @RequestMapping("/api/stream")',
          "public class StreamController {",
          '  @GetMapping(value="/congestion", produces=TEXT_EVENT_STREAM_VALUE)',
          "  public SseEmitter congestion() { return service.subscribeCongestion(); }",
          "  // + /events /notices /booths /staff /lost-items /reservations",
          "}"
        ]
      },
      {
        filename: "BoothService.java",
        caption: "GPS 로그 기준 반경 80m로 부스 근접 판정",
        highlightLines: [1],
        lines: [
          "private static final double BOOTH_RADIUS_METERS = 80.0;",
          "// 방문자 GPS 로그와 부스 좌표 거리 계산 → 반경 안이면 ‘도착’",
          "boolean near = distance(gps, booth) <= BOOTH_RADIUS_METERS;"
        ]
      }
    ],
    work: [
      {g: "프론트", items: ["지도·부스·관리 화면", "7개 SSE 채널 구독"]},
      {g: "백엔드", items: ["SseEmitter 채널 분리", "GPS 지오펜싱·예약"]},
      {g: "모델", items: ["24 feature 학습·비교", "자바↔파이썬 연결·폴백"]},
      {g: "인증", items: ["JWT 관리자/스태프/방문자 분리"]},
      {g: "UX", items: ["PWA·오프라인·다국어·고대비", "카카오/네이버 길찾기"]}
    ],
    challenges: [
      {
        title: "모바일에서 SSE 연결이 끊기면 현황이 멈췄다",
        problem: "네트워크가 불안정하면 EventSource가 끊긴 채 복구되지 않았다.",
        solution:
          "끊김 감지 시 재연결하고, 재연결 직후 스냅샷을 다시 받아 상태를 동기화하도록 했다.",
        code: {
          filename: "reconnect.ts",
          lines: [
            "es.onerror = () => { es.close(); setTimeout(connect, backoff()); };",
            "// 재연결 직후 전체 스냅샷 재수신으로 상태 정합성 복구"
          ]
        }
      },
      {
        title: "모든 상태를 한 채널로 밀면 부하가 컸다",
        problem:
          "혼잡도·공지·부스를 한 스트림에 섞으니 불필요한 이벤트까지 모두가 받았다.",
        solution:
          "상태 종류별로 SSE 채널을 7개로 분리해, 클라이언트가 필요한 것만 구독하도록 했다."
      },
      {
        title:
          "혼잡 예측을 붙이면 축제 당일 모델이 서비스를 끌고 내려갈 수 있었다",
        problem:
          "학습한 RandomForest 는 파이썬 자산인데, 이걸 응답 경로에 그대로 넣으면 파이썬이 없거나 느린 순간 부스 목록 API 전체가 멈춘다. 축제 당일에는 복구할 시간이 없다.",
        solution:
          "모델을 별도 프로세스로 떼어 내고, 강등 조건 셋(설정 off · 스크립트/모델 파일 없음 · 20초 초과)에서 규칙 기반 점수로 자동으로 내려가게 했다. 화면은 어느 쪽이든 같은 라벨을 받는다.",
        code: {
          filename: "PythonCongestionModelService.java",
          lines: [
            "if (!enabled || !Files.exists(script) || !Files.exists(model)) return Map.of();",
            "boolean finished = process.waitFor(timeout.toMillis(), MILLISECONDS); // 20s",
            "// 비어서 돌아오면 AiCongestionService 가 fallback(…, MODEL_UNAVAILABLE)"
          ]
        }
      }
    ],
    tech: [
      "React",
      "Vite",
      "React Leaflet",
      "PWA",
      "Spring Boot 3",
      "JWT",
      "SSE",
      "MySQL",
      "scikit-learn"
    ],
    resultScreens: [
      {
        title: "fest-a/map",
        kind: "cards",
        cards: [
          {l: "푸드존", sub: "부스 마커"},
          {l: "플리마켓", sub: "클러스터"},
          {l: "체험존", sub: "혼잡도"},
          {l: "무대", sub: "공연 상태"}
        ]
      },
      {
        title: "fest-a/stream",
        kind: "feed",
        feed: ["혼잡도 갱신", "긴급 공지", "분실물 등록", "부스 예약/체크인"]
      }
    ],
    metrics: [
      {n: "26", l: "백엔드 컨트롤러"},
      {n: "7", l: "SSE 채널"},
      {n: "24", l: "예측 feature"},
      {n: "1인", l: "풀스택"}
    ],
    metricsNote:
      "컨트롤러·채널·feature 수는 저장소에서 직접 센 값이다 (*Controller.java · StreamController.java · congestion_training_profile.json). 모델 정확도는 규칙 기반 0.70 → RandomForest 0.80(macro-F1 0.68 → 0.79)이지만, 운영 경험으로 만든 시뮬레이션 데이터 2,520건 기준이고 실제 축제 데이터로 검증한 값이 아니다.",
    kpt: {
      keep: [
        "상태를 종류별 채널로 분리한 설계",
        "모델보다 폴백을 먼저 만든 것",
        "실제 지도 + GPS로 현장성 확보"
      ],
      problem: [
        "부하 테스트 부족",
        "예측 모델의 학습 데이터가 실측이 아니라 시뮬레이션",
        "마커가 많을 때 렌더 최적화 미흡"
      ],
      try: ["실제 운영 로그로 재학습", "부스 매출 집계", "혼잡도 히트맵"]
    },
    learning:
      "‘실시간’이라고 무조건 WebSocket이 아니라, 단방향 푸시에는 SSE를 종류별로 나누는 게 더 단순하고 안정적이었다. 위치 판정도 ‘정확함’보다 ‘현장에서 말이 되는가’가 중요했다. 그리고 모델을 붙이면서 배운 건, 정확도를 올리는 것보다 모델이 없을 때 무엇이 남는지를 먼저 정하는 게 서비스에서는 더 급하다는 것이다."
  },

  // ════════════════════════════ MuscleUp (realtime) ═════════════════════════
  muscleup: {
    tagline: "GAMIFIED FITNESS · 3-TIER FULL-STACK",
    // 대표 이미지가 **1.0 랜딩의 AI 목업**이었다. 이 페이지가 바로 그 화면을
    // "둘러보라고만 하는 첫 화면"이라고 비판하는데, 맨 위에 그걸 걸어 두고
    // 있었다. 게다가 확대하면 한글이 깨져 있다("목툐, 재형, 종증 투틴").
    // 2.0 의 실제 캡처로 바꾼다 — 「지금 해야 할 일」이 이 페이지의 주장이다.
    heroImage: {
      // `home-todo.webp` 를 걸었다가 되돌렸다. 3패널 합성이라 비율은 맞았지만
      // **로그아웃 상태 캡처**였다 — 화면에 "로그인 후 캐릭터가 표시됩니다",
      // "캐릭터 준비 중", 연속 출석 0일, 오늘 상태 대기, 이번 주 0/7 이 찍혀
      // 있다. 이 페이지의 주장이 "홈을 로비로 바꿔 다시 오게 만들었다" 인데
      // 맨 위 그림이 아무도 안 온 화면이면 첫 3초에 주장이 꺾인다.
      //
      // `home-lobby.webp` 는 로그인 상태다(내비에 로그아웃 버튼이 있다).
      // 아래 Before → After 의 after 와 같은 파일인데, 그건 중복이 아니라
      // 배치다 — 여기서는 포스터로 걸고, 거기서는 1.0 소스 코드와 나란히
      // 놓아 논거로 쓴다.
      //
      // 다만 원본이 659px 라 1440 화면에서 586px 로 그려진다(1.12배 — 실측).
      // 레티나 기준 2배에 한참 못 미친다. 이 페이지 그림 8장 중 2배를
      // 넘는 건 admin/inbody 둘뿐이다(둘 다 1400px). 1600px 이상으로
      // 재촬영하는 게 남은 일이고, 그 전까지는 "흐린 진짜"가 "선명한 0"
      // 보다 낫다고 봤다.
      src: "/projects/muscleup/v2/home-lobby.webp",
      label: "2.0 홈 — 첫 버튼이 「오늘 출석 시작」이다",
      ratio: "2/1"
    },
    // 1.0 발표자료(MuscleUp.pdf) p.24 에 실제 사용자 피드백 4개가 있고,
    // 2.0 발표자료(득근득근2.0.pdf)가 그중 셋을 어떻게 고쳤는지를 보여 준다.
    // Before/After 를 지어낼 필요가 없었다 — 문서 두 개가 서로를 증명한다.
    // 1.0 의 첫 화면은 **캡처가 남아 있지 않다.** 발표자료(MuscleUp.pdf p.13~15)의
    // "화면"은 전부 AI 가 그린 목업이라 한글이 깨져 있다("목툐, 재형, 종증 투틴") —
    // 그걸 실제 화면인 척 올리면 확대하는 순간 주장 전체가 무너진다.
    // 대신 **저장소 코드**에서 복원했다. 아래 문자열은 전부
    // frontend/src/pages/Home.tsx @1093e53 (2025-12-03) 원문이다.
    beforeAfter: {
      before: {
        label: "1.0 — 둘러보라고 하는 첫 화면",
        screen: {
          title: "Home.tsx @ 1.0 (2025-12-03)",
          kind: "cards",
          cards: [
            {l: "AI 상담·루틴 받기", sub: "첫 번째 버튼 → /ai"},
            {l: "커뮤니티 둘러보기", sub: "두 번째 버튼 → /brag"},
            {l: "180+ 활동 회원", sub: "const stats — 코드에 박힌 상수"},
            {l: "45 · 24", sub: "주간 운동 · 체크인 (역시 상수)"}
          ]
        },
        note: "버튼 둘 다 「받기·둘러보기」다. 오늘 뭘 하라는 말은 없다. 아래 숫자 셋은 서버가 아니라 소스에 적혀 있었다."
      },
      after: {
        label: "2.0 — 오늘 할 일을 시키는 로비",
        shot: {
          src: "/projects/muscleup/v2/home-lobby.webp",
          label: "2.0 홈 — 게임형 피트니스 로비",
          ratio: "2/1"
        },
        note: "첫 버튼이 「오늘 출석 시작」 하나로 좁혀졌고, 숫자는 metrics.todayAttendanceCount 처럼 서버에서 읽는다 — 서비스 자랑이 아니라 오늘 내가 한 것."
      }
    },
    // 컨트롤러 28개를 세어만 두면 "28"이 숫자로만 남는다. 8개 도메인으로 묶어
    // 그리니 프로틴 공유·이벤트 CMS 처럼 사이트에 없던 기능이 드러났다.
    // 근거는 전부 소스다 — @RequestMapping 과 @*Mapping 을 센 값.
    resultShot: {
      src: "/projects/muscleup/api-map.svg",
      label: "백엔드 API 도메인 지도 — 컨트롤러 28개 · 엔드포인트 136개",
      ratio: "21/9",
      caption:
        "controller/*.java 28개를 8개 도메인으로 묶었다. 크루 하나가 15개로 가장 크고, 자랑방은 글(BragPost)과 반응(BragInteraction)을 컨트롤러로 갈라 뒀다."
    },
    gallery: [
      {
        src: "/projects/muscleup/auth-sequence.svg",
        label: "인증 시퀀스 — 로그인 · 만료 · 재발급",
        ratio: "16/10",
        wide: true,
        fit: "contain",
        caption:
          "access 가 15분에 만료돼도 화면은 끊기지 않는다. 여러 요청이 동시에 401 을 받아도 재발급은 axios 인터셉터에서 한 번만 나가고(single-flight), 나머지는 큐에서 기다렸다가 함께 재시도된다."
      },
      // ── 2.0 화면 ──
      // 출처는 2.0 발표자료(득근득근2.0.pdf)에 실린 실제 캡처다. 새로 찍은 것은 없다.
      // 홈 화면 배너에 참여자 얼굴이 있어 그 구간은 잘라내고 썼다.
      {
        src: "/projects/muscleup/v2/lounge.webp",
        fit: "contain",
        label: "실시간 라운지 — Socket.IO",
        ratio: "16/10",
        caption:
          "1.0 피드백 “다른 사람들과 더 많이 소통하고 싶어요” 에 대한 답. 접속자 수·핑·미니맵이 좌상단에 뜨고, 캐릭터 위치와 이모트가 실시간 동기화된다. REST 로는 못 해서 실시간 서버를 :4001 로 따로 뺐다."
      },
      {
        src: "/projects/muscleup/v2/character.webp",
        label: "캐릭터 성장 — 레벨 · 티어 · 진화 단계",
        ratio: "6/5",
        caption:
          "“내 운동 데이터를 더 자세히 보고 싶어요” 에 대한 답. 화면의 MASTER·Stage 8·Level 85 가 ERD 의 character_profiles(tier, level, evolution_stage, title) 그대로다."
      },
      {
        src: "/projects/muscleup/v2/admin.webp",
        fit: "contain",
        label: "관리자 콘솔 — 탭 5개",
        ratio: "16/12",
        caption:
          "개요·행동 추적·검수/콘텐츠·출석 기록·운영 자동화. analytics_events 와 audit_logs 를 읽는 화면이 여기다 — 테이블만 있고 안 보던 것을 2.0 에서 화면으로 세웠다."
      },
      {
        src: "/projects/muscleup/v2/inbody.webp",
        fit: "contain",
        label: "인바디 AI 분석",
        ratio: "16/10",
        caption:
          "이미지·PDF 를 올리면 OCR 로 읽어 현재 대 목표를 고정 축으로 비교하고 탄단지 비율을 낸다. 1.0 의 루틴 추천에서 체성분 정밀 분석으로 올라간 지점."
      }
      // 옛 ERD 캡처(`op/muscleup-erd.webp`)도 뺐다. 1.0 때 dbdiagram.io 로 그린
      // 것이라 **테이블이 14개뿐**이고 크루·친구채팅·캐릭터·출석·이벤트가 통째로
      // 빠져 있다 — 같은 페이지가 "31 테이블 / 8 도메인" 이라고 말하는 옆에
      // 두면 그 자체로 모순이다. 게다가 발표용 빨간 동그라미와 손글씨가
      // 얹힌 흰 배경 슬라이드라 어두운 페이지에서 혼자 튄다.
      // 도메인 구조는 바로 위 Architecture 의 **코드에서 뽑은** 인라인
      // 다이어그램이 이미, 더 정확하게 보여 준다.
      // AWS 콘솔 캡처(`muscleup-aws.webp`)를 뺐다. 배포 구성을 보여 주려던
      // 자료였지만 실제로는 CloudFront 콘솔 화면이라, distribution ARN에
      // **계정 ID가 그대로 노출**돼 있었고 화면 절반이 요금 안내였다.
      // 배포 구성은 캡처가 아니라 직접 그린 구성도로 보여 주는 게 맞다.
    ],
    tldr: [
      {
        k: "무엇을",
        v: "운동 기록을 게임처럼 지속하게 만드는 피트니스 커뮤니티 플랫폼"
      },
      {
        k: "왜",
        v: "1.0 은 기능을 소개하는 랜딩이었다. 써 본 사람들이 “어디서 뭘 해야 할지 모르겠다”고 했다"
      },
      {
        k: "결과",
        v: "홈=로비 · 출석=성장데이터 · 관리자=운영콘솔로 성격을 바꿨다. 1.0 에서 들은 피드백 4건 중 3건을 기능으로 반영했고, 안 고친 1건은 그대로 적어 뒀다"
      },
      {k: "내 역할", v: "1인 풀스택 — 1.0 기획·개발 → 2.0 운영 관점 개편"}
    ],
    demo: {repo: "https://github.com/toadsam/Ajou_MuscleUp"},
    meta: [
      {label: "기간", value: "2025.09 ~ 진행 중"},
      {label: "팀", value: "개인 프로젝트 (풀스택 1인)"},
      {label: "역할", value: "핵심 루프 설계 · 프론트 · 백엔드 · 실시간 서버"},
      {
        label: "스택",
        value:
          "React 19 · TS · TanStack Query · Spring Boot 3.5 · Socket.IO · JWT/OAuth · S3"
      },
      {label: "실행", value: "3-tier(FE:5173 · BE:8080 · Realtime:4001)"}
    ],
    heroScreen: {
      title: "muscleup/home",
      kind: "bars",
      bars: [
        {l: "REST API", p: 90, v: "Controller 28"},
        {l: "실시간", p: 70, v: "Socket.IO"},
        {l: "인증", p: 80, v: "JWT+OAuth"}
      ]
    },
    impact: [
      {n: "3", l: "실행 단위(FE/BE/RT)"},
      {n: "28", l: "Controller"},
      {n: "Socket.IO", l: "실시간 라운지"}
    ],
    features: [
      {t: "출석 & 캐릭터 성장", d: "운동 기록이 캐릭터 티어·레벨·진화로 반영"},
      {t: "실시간 라운지", d: "Socket.IO로 접속자 이동·채팅·이모트 동기화"},
      {
        t: "AI 인바디 상담",
        d: "이미지/PDF 기반 분석·계획·PDF 리포트(OpenAI·PDFBox)"
      },
      {t: "인증·운영", d: "JWT access/refresh + Google OAuth · 관리자 CMS"}
    ],
    problem:
      "운동 앱은 기록하는 순간엔 유용하지만 꾸준히 돌아오게 만드는 장치가 약하다. 기록이 캐릭터 성장·랭킹·실시간 커뮤니티로 즉시 연결되는 경험이 필요했고, 자주 바뀌는 실시간 상태를 REST와 분리해야 했다.",
    research: {
      quotes: [
        {
          q: "처음 사용할 때 어디서 뭘 해야 할지 몰랐어요",
          who: "1.0 사용자 피드백 · 발표자료 p.24 원문"
        },
        {
          q: "다른 사람들과 더 많이 소통하고 싶어요",
          who: "같은 자료, 두 번째 피드백"
        },
        {
          q: "AI 답변이 나올 때까지 기다리는 게 길어요",
          who: "같은 자료 — 넷 중 유일하게 아직 못 고친 것"
        }
      ],
      stat: {n: "4", l: "1.0 사용자 피드백 원문 · 그중 셋을 2.0 에서 고쳤다"}
    },
    feedbackMap: [
      {
        said: "처음 사용할 때 어디서 뭘 해야 할지 몰랐어요",
        did: "홈을 로비로 — 첫 화면 CTA 를 「오늘 출석 시작」 하나로",
        done: true
      },
      {
        said: "다른 사람들과 더 많이 소통하고 싶어요",
        did: "실시간 라운지(Socket.IO) + 크루 챌린지",
        done: true
      },
      {
        said: "내 운동 데이터를 더 자세히 보고 싶어요",
        did: "캐릭터 레벨·티어·진화 + 공개 랭킹 + 인바디 OCR 분석",
        done: true
      },
      {
        said: "AI 답변이 나올 때까지 기다리는 게 길어요",
        did: "아직 안 했다 — 넷 중 유일하게 못 고친 것",
        done: false
      }
    ],
    hypothesis:
      "“운동 기록을 캐릭터 성장·랭킹·라운지로 즉시 연결하고, 빈번히 바뀌는 실시간 상태(위치·채팅·이모트)는 Socket.IO 서버로 분리하면 — 사용자가 ‘다시 오는’ 이유가 생기면서 서버도 감당 가능하다.”",
    process: [
      {t: "루프 기획", d: "기록→성장"},
      {t: "REST 도메인", d: "8 도메인 · 28 컨트롤러"},
      {t: "인증", d: "JWT+OAuth"},
      {t: "실시간 분리", d: "Socket.IO :4001"},
      {t: "AI", d: "OpenAI·PDF"}
    ],
    // ── 시스템 아키텍처 ──
    // 숫자는 전부 저장소(toadsam/Ajou_MuscleUp)에서 센 값이다. 포트는 소스에서
    // 확인했다 — realtime/src/server.ts 의 `PORT ?? 4001`, backend 의
    // application.properties `server.port=${PORT:8080}`.
    //
    // 이 그림이 말하려는 건 한 가지다: **요청이 왼쪽에서 두 갈래로 갈라진다.**
    // 자주 바뀌는 상태(위치·채팅)는 WebSocket 으로 얇은 서버가 받고, 나머지는
    // REST 로 두꺼운 서버가 받는다. 두 서버의 박스 크기가 다른 것도 사실이다 —
    // backend 는 Controller 28개, realtime 은 소스 파일 3개다.
    diagrams: [
      {
        title: "System Architecture",
        viewBox: [1180, 470],
        caption:
          "왼쪽에서 경로가 갈라지는 게 이 설계의 요점 — 자주 바뀌는 상태(위치·채팅)만 Socket.IO 가 받고 나머지는 REST 로 간다. 박스 크기 차이도 실제다(백엔드 Controller 28개 vs 실시간 서버 소스 3개). 점선 상자는 내가 만들지 않은 것.",
        groups: [
          {label: "BROWSER", x: 20, y: 60, w: 250, h: 330},
          {label: "MY SERVERS", x: 360, y: 30, w: 400, h: 400},
          {label: "EXTERNAL", x: 860, y: 210, w: 300, h: 220, dashed: true}
        ],
        nodes: [
          {
            id: "fe",
            label: "React SPA",
            note: "Vite · :5173",
            sub: "pages 38 · components 23",
            x: 40,
            y: 150,
            w: 210,
            h: 150
          },
          {
            id: "api",
            label: "Spring Boot",
            note: ":8080 · REST",
            sub: "Controller 28 · Service 25",
            x: 385,
            y: 80,
            w: 350,
            h: 150,
            accent: true
          },
          {
            id: "rt",
            label: "Socket.IO",
            note: ":4001 · WebSocket",
            sub: "server.ts · rooms.ts · types.ts",
            x: 385,
            y: 310,
            w: 350,
            h: 95
          },
          {
            id: "db",
            label: "PostgreSQL",
            note: "운영 · JPA · Entity 31",
            sub: "로컬은 MySQL",
            x: 880,
            y: 70,
            w: 260,
            h: 80
          },
          {
            id: "s3",
            label: "AWS S3",
            note: "app.s3.enabled 로 전환",
            x: 880,
            y: 250,
            w: 260,
            h: 70
          },
          {
            id: "ai",
            label: "OpenAI GPT",
            note: "/ai/analyze · plan · chat",
            x: 880,
            y: 340,
            w: 260,
            h: 70
          }
        ],
        edges: [
          // ── 갈라지는 두 경로. 이 그림이 말하려는 건 사실상 이것뿐이다. ──
          {
            from: [250, 195],
            to: [381, 140],
            label: "HTTP / REST",
            kind: "solid",
            labelAt: [316, 152]
          },
          {
            from: [258, 268],
            to: [381, 348],
            label: "WebSocket",
            kind: "double",
            labelAt: [316, 330]
          },
          // 실패 경로. 정상 경로만 그린 다이어그램은 흔하다.
          {
            from: [383, 215],
            to: [268, 243],
            label: "401 → refresh → 재요청",
            kind: "dashed",
            labelAt: [338, 243]
          },
          // 오른쪽은 직각으로 꺾어 EXTERNAL 상자를 비스듬히 가로지르지 않게 한다.
          {
            from: [737, 110],
            to: [876, 110],
            label: "JPA",
            kind: "solid",
            labelAt: [806, 100]
          },
          {
            from: [737, 170],
            to: [876, 285],
            label: "이미지",
            kind: "solid",
            bendX: 810,
            labelAt: [810, 218]
          },
          {
            from: [737, 200],
            to: [876, 375],
            label: "AI 코치",
            kind: "solid",
            bendX: 786,
            labelAt: [786, 320]
          }
        ]
      },
      {
        title: "Data Model — 31 tables / 8 domains",
        viewBox: [1200, 656],
        caption:
          "저장소의 @Entity 클래스 31개를 전부 읽어 도메인별로 묶은 것 — 표 이름·개수·FK 수는 코드에서 센 값이다. users 한 곳으로 관계가 28개 모이는 허브 구조이고, 그래서 회원 탈퇴·권한 변경이 전 도메인에 걸린다. 선 위 숫자는 그 도메인이 users 를 참조하는 횟수.",
        nodes: [
          {
            id: "users",
            label: "users",
            note: "id · name · email · password",
            sub: "nickname · created_at · FK 28 유입",
            x: 30,
            y: 268,
            w: 292,
            h: 130,
            accent: true
          },
          {
            id: "d0",
            label: "인증 · 계정",
            note: "테이블 4 · users FK 2",
            sub: "User · RefreshToken · EmailVerification · UserBodyStats",
            x: 396,
            y: 8,
            w: 764,
            h: 76
          },
          {
            id: "d1",
            label: "커뮤니티",
            note: "테이블 3 · users FK 3",
            sub: "BragPost · BragComment · BragLike",
            x: 396,
            y: 88,
            w: 764,
            h: 76
          },
          {
            id: "d2",
            label: "크루",
            note: "테이블 4 · users FK 4",
            sub: "WorkoutCrew · Member · JoinRequest · CrewChallenge",
            x: 396,
            y: 168,
            w: 764,
            h: 76
          },
          {
            id: "d3",
            label: "친구 · 채팅",
            note: "테이블 4 · users FK 7",
            sub: "Friendship · FriendRequest · ChatRoom · ChatMessage",
            x: 396,
            y: 248,
            w: 764,
            h: 76
          },
          {
            id: "d4",
            label: "프로틴 공유",
            note: "테이블 4 · users FK 4",
            sub: "Protein · ShareApplication · ShareMessage · Review",
            x: 396,
            y: 328,
            w: 764,
            h: 76
          },
          {
            id: "d5",
            label: "기록 · AI",
            note: "테이블 4 · users FK 4",
            sub: "AttendanceLog · AiChatMessage · CharacterProfile · EvolutionHistory",
            x: 396,
            y: 408,
            w: 764,
            h: 76
          },
          {
            id: "d6",
            label: "이벤트 · 프로그램",
            note: "테이블 4 · users FK 1",
            sub: "Event · EventParticipant · CmsEvent · ProgramApplication",
            x: 396,
            y: 488,
            w: 764,
            h: 76
          },
          {
            id: "d7",
            label: "운영 · 로그",
            note: "테이블 4 · users FK 3",
            sub: "AuditLog · AnalyticsEvent · LoungeVisitLog · Inquiry",
            x: 396,
            y: 568,
            w: 764,
            h: 76
          }
        ],
        edges: [
          {
            from: [322, 333],
            to: [392, 46],
            label: "×2",
            kind: "solid",
            labelAt: [345, 171]
          },
          {
            from: [322, 333],
            to: [392, 126],
            label: "×3",
            kind: "solid",
            labelAt: [345, 216]
          },
          {
            from: [322, 333],
            to: [392, 206],
            label: "×4",
            kind: "solid",
            labelAt: [345, 261]
          },
          {
            from: [322, 333],
            to: [392, 286],
            label: "×7",
            kind: "solid",
            labelAt: [345, 305]
          },
          {
            from: [322, 333],
            to: [392, 366],
            label: "×4",
            kind: "solid",
            labelAt: [345, 350]
          },
          {
            from: [322, 333],
            to: [392, 446],
            label: "×4",
            kind: "solid",
            labelAt: [345, 395]
          },
          {
            from: [322, 333],
            to: [392, 526],
            label: "×1",
            kind: "solid",
            labelAt: [345, 440]
          },
          {
            from: [322, 333],
            to: [392, 606],
            label: "×3",
            kind: "solid",
            labelAt: [345, 485]
          }
        ]
      }
    ],
    architecture: [
      {
        tag: "View",
        name: "React 19 + TanStack Query",
        desc: "홈·라운지·랭킹·AI (PWA)"
      },
      {
        tag: "API",
        name: "Spring Boot 3.5",
        desc: "Controller 28개 · JWT/OAuth · S3 · PDFBox"
      },
      {
        tag: "Realtime",
        name: "Node + Socket.IO",
        desc: "라운지 위치·채팅·이모트 (:4001)"
      },
      {
        tag: "DB",
        name: "PostgreSQL (운영) · MySQL (로컬)",
        desc: "유저·기록·크루·이벤트 · Entity 31"
      }
    ],
    decisions: [
      {
        area: "실시간",
        pick: "Socket.IO 분리 서버",
        why: "빈번한 상태(위치·채팅)를 REST와 분리",
        alt: "REST 폴링(부하·지연)"
      },
      {
        area: "인증",
        pick: "JWT access/refresh + OAuth",
        why: "무상태·간편 로그인·쿠키/Bearer 겸용",
        alt: "자체 세션(스케일 ↓)"
      },
      {
        area: "서버상태",
        pick: "TanStack Query",
        why: "캐시·재검증으로 서버 상태 일원화",
        alt: "수동 fetch(중복 상태)"
      },
      {
        area: "AI 검증",
        pick: "표본 8건 × 5축 품질 하네스",
        why: "프롬프트를 고칠 때 좋아졌는지 숫자로 본다",
        alt: "눈으로 확인(회귀를 못 잡음)"
      },
      {
        area: "파일",
        pick: "로컬/S3 추상화",
        why: "개발은 로컬, 배포는 S3로 전환",
        alt: "S3 고정(로컬 불편)"
      }
    ],
    coreCode: [
      {
        filename: "server.ts (realtime)",
        caption: "라운지 상태는 Socket.IO 서버가 전담 — REST와 분리",
        highlightLines: [2],
        lines: [
          'io.on("connection", (socket) => {',
          '  socket.on("move", (p) => room.update(socket.id, p)); // 위치',
          '  socket.on("chat", (m) => io.to(room.id).emit("chat", m));',
          '  socket.on("disconnect", () => room.leave(socket.id));',
          "});"
        ]
      },
      {
        filename: "axios-interceptor.ts",
        caption: "401이면 refresh로 토큰 갱신 후 재요청",
        highlightLines: [3],
        lines: [
          "api.interceptors.response.use(ok, async (err) => {",
          "  if (err.response?.status === 401) {",
          '    await api.post("/api/auth/refresh"); // access 재발급',
          "    return api(err.config); // 원요청 재시도",
          "  }",
          "  throw err;",
          "});"
        ]
      }
    ],
    work: [
      {g: "기획", items: ["기록→성장→커뮤니티 루프", "캐릭터 성장 모델"]},
      {g: "프론트", items: ["홈·라운지·랭킹·AI 화면", "TanStack Query·PWA"]},
      {g: "백엔드", items: ["Controller 28개", "JWT/OAuth·S3·PDF"]},
      {g: "실시간", items: ["Socket.IO 라운지 서버", "room 상태 관리"]}
    ],
    challenges: [
      {
        title: "교과서대로 넣은 Refresh 로테이션을 다시 걷어냈다",
        problem:
          "재발급 때 기존 토큰을 폐기하는 로테이션을 넣었더니, 화면 여러 곳이 동시에 401 을 받는 순간 서로의 토큰을 무효화해 멀쩡히 쓰던 사용자가 로그아웃됐다. 보안을 위해 넣은 장치가 실사용에서 서비스를 끊은 것이다.",
        solution:
          "서버 쪽 로테이션을 되돌리고, 대신 클라이언트에서 재발급을 한 번만 내보내도록 바꿨다(single-flight — refreshing 플래그 + 대기 큐). 지금은 여러 요청이 동시에 만료를 만나도 재발급은 한 번이고 나머지는 큐에서 기다렸다 함께 재시도된다. 로테이션이 필요해지면 grace period 나 refresh token family 로 다시 접근할 생각이다.",
        code: {
          filename: "RefreshTokenService.java (지금 코드)",
          lines: [
            "// Keep refresh token stable to prevent race-condition",
            "// logouts when parallel requests trigger refresh.",
            "return current.getToken();"
          ]
        }
      },
      {
        title: "인덱스를 넣고 재 보니, 정작 느린 건 다른 쪽이었다",
        problem:
          "자랑방 목록 · 캐릭터 랭킹 · 공유 인증 관리 · 프로그램 신청은 모두 정렬 페이지네이션인데 정렬·필터 컬럼에 인덱스가 없었다. 지금 회원은 약 50명이라 화면에서는 아무 문제가 없다 — 티가 나기 전에 확인해 두는 편이 낫다고 봤다.",
        solution:
          "정렬이 사라지고 인덱스를 거꾸로 훑는 계획으로 바뀐다. 다만 여기서 멈추면 틀린 결론이다 — Spring Data 의 Page 는 목록과 함께 count 를 날리는데 인덱스는 그걸 못 고친다. 그래서 쿼리는 400배 넘게 줄어도 한 페이지가 그려지는 시간은 3.2배만 빨라진다. 다음 병목은 정렬이 아니라 count 이고, 커서 페이지네이션이나 근사 카운트로 접근할 문제다. 인덱스 넷이 쓰는 디스크는 합쳐 21MB 였다.",
        code: {
          filename: "EXPLAIN — 자랑방 목록 (20만 행)",
          lines: [
            "// 인덱스 없음 — 22.8ms",
            "Limit  (cost=18080.15..18081.32 rows=10)",
            "  -> Gather Merge  (rows=166666)   // 전체 정렬",
            "",
            "// 인덱스 있음 — 0.052ms",
            "Limit  (cost=0.42..3.57 rows=10)",
            "  -> Index Scan Backward using idx_brag_post_created"
          ]
        }
      },
      {
        title: "실시간 분리는 했는데, 몇 명까지 버티는지는 안 재 봤다",
        problem:
          "가설이 두 문장이었다 — 「…Socket.IO 서버로 분리하면 다시 오는 이유가 생기면서 서버도 감당 가능하다」. 앞 절반만 말하고 뒤 절반은 한 번도 재지 않았다. 인덱스는 표당 20만 행까지 재 놓고, 정작 이 프로젝트를 대표하는 아키텍처 결정은 안 잰 상태였다.",
        solution:
          "서버를 그대로 띄우고 동시 접속을 25 → 300 으로 올리며 앱이 이미 가진 ping:check 로 왕복 시간을 쟀다. 100명까지는 p95 50ms 이고 설계한 60ms 주기가 15.9Hz 로 유지된다 — 회원 전원이 동시에 들어와도 여유가 두 배다. 150에서 꺾이고 200부터 무너지는데, 그때 CPU 는 오히려 내려간다(47% → 20%). 연산이 막힌 게 아니라 못 보내서 노는 것이고, 그 사이 RSS 가 오르는 게 큐가 쌓인다는 증거다. 원인은 구조다 — 매 틱 전원에게 전원 목록을 보내니 바이트가 N² 로 큰다(한 명 약 600B, growthParams 숫자 19개가 대부분). 이동을 60ms 로 합친 건 잘한 결정이지만 다음 병목은 거기가 아니라 페이로드다. 뷰포트 컬링과 델타 전송이 먼저이고, 그 전에 서버 대수를 늘리면 대역폭은 그대로다. 그리고 100명이면 한 사람이 초당 957KB 를 받는다 — 루프백이라 여기선 안 보이지만 LTE 사용자에게는 서버보다 이쪽이 먼저 죽는다.",
        code: {
          filename: "동시접속 램프 — 16초 × 3회 중앙값 (한 대·루프백)",
          lines: [
            "// 명    p50     p95   브로드캐스트/s   서버송신   1인수신    CPU",
            "   25    2ms     7ms           15.2    5.6MB/s  229KB/s   4.3%",
            "   50    4ms    26ms           15.7   23.0MB/s  472KB/s  15.2%",
            "  100   22ms    50ms           15.9   93.4MB/s  957KB/s    34%",
            "  150  104ms   416ms           14.2  187.6MB/s 1280KB/s  47.3%",
            "  200  196ms  3725ms           11.5  248.3MB/s 1271KB/s  30.1%",
            "  300  185ms  8888ms            6.2  286.0MB/s  976KB/s  20.7%",
            "",
            "// 인원 2배 -> 송신 4.1배. 전원 목록을 전원에게 보내니 N^2.",
            "// 무너질 때 CPU 가 내려간다 = 연산이 아니라 송신에서 막힌다."
          ]
        }
      },
      {
        title: "AI 답변이 맞는 말인지 사람이 매번 읽어 볼 수 없었다",
        problem:
          "인바디 분석은 체성분 수치를 받아 운동·식단을 권하는 기능이라, 모델이 그럴듯하지만 위험한 조언을 해도 화면상으로는 멀쩡해 보인다. 프롬프트를 고칠 때마다 결과가 나아졌는지 나빠졌는지 판단할 근거가 없었다.",
        solution:
          "테스트로 품질 하네스를 만들었다. 체형·목표가 다른 표본 8건을 고정해 두고 매번 같은 입력을 넣은 뒤, 응답을 구조·진단 적합·우선순위·설명 깊이·안전성 5개 축으로 채점해 마크다운 리포트로 뽑는다. OPENAI_API_KEY 가 없으면 스스로 건너뛰므로 키 없는 환경의 빌드를 깨지 않는다.",
        code: {
          filename: "AiInbodyQualityHarnessTest.java",
          lines: [
            'scores.put("structure", scoreStructure(...));',
            'scores.put("diagnosisFit", scoreDiagnosisFit(...));',
            'scores.put("priorityFit", scorePriorityFit(...));',
            'scores.put("detailDepth", scoreDepth(...));',
            'scores.put("safety", scoreSafety(...));'
          ]
        }
      },
      {
        title: "브라우저·배포 환경에서 인증 방식이 달랐다",
        problem:
          "쿠키 기반과 Bearer 토큰 기반 환경이 섞여 로그인 유지가 불안정했다.",
        solution:
          "요청 인터셉터에서 access 토큰을 자동 첨부하고 401 시 refresh로 재발급하며, 백엔드가 쿠키·Bearer를 모두 처리하도록 했다.",
        code: {
          filename: "auth-note",
          lines: [
            "// FE: access 자동 첨부 + 401 → refresh 재시도",
            "// BE: 쿠키/Bearer 둘 다 파싱 → 환경 차이 흡수"
          ]
        }
      }
    ],
    tech: [
      "React 19",
      "TypeScript",
      "TanStack Query",
      "Spring Boot 3.5",
      "Socket.IO",
      "JWT/OAuth",
      "AWS S3"
    ],
    resultScreens: [
      {
        title: "muscleup/lounge",
        kind: "feed",
        feed: [
          "접속자 위치 동기화",
          "라운지 채팅/이모트",
          "응원 이벤트",
          "파티 요청"
        ]
      },
      {
        title: "muscleup/ai",
        kind: "cards",
        cards: [
          {l: "인바디 분석", sub: "이미지/PDF"},
          {l: "운동 계획", sub: "추천"},
          {l: "AI 채팅", sub: "상담"},
          {l: "PDF 리포트", sub: "공유"}
        ]
      }
    ],
    metrics: [
      {n: "약 50명", l: "이용 회원"},
      {n: "3 / 4", l: "반영한 사용자 피드백"},
      {n: "3.2배", l: "목록 페이지 응답 (20만 행 기준)"},
      {n: "8 × 5", l: "AI 응답 품질 자동 채점 (표본 × 축)"}
    ],
    // 이 숫자들이 원래 12줄짜리 문단 안에 아홉 개가 묻혀 있었다.
    // 막대로 빼면 마지막 줄("한 페이지 전체")이 스스로 논점을 말한다 —
    // 쿼리 막대는 사라지는데 페이지 막대는 3분의 1만 준다.
    perf: {
      rows: [
        {label: "자랑방 목록", before: 22.79, after: 0.05, unit: "ms"},
        {label: "캐릭터 랭킹", before: 14.14, after: 0.07, unit: "ms"},
        {label: "공유 인증 관리", before: 11.56, after: 0.07, unit: "ms"},
        {label: "프로그램 신청", before: 15.7, after: 0.08, unit: "ms"},
        {
          label: "한 페이지 전체 (목록 + count)",
          before: 32.8,
          after: 10.1,
          unit: "ms"
        }
      ],
      note: "PostgreSQL 16 · 표당 20만 행 합성 데이터 · 각 7회 중앙값. 맨 아랫줄이 사용자가 기다리는 시간이다 — 인덱스가 못 고치는 count 가 남아 있다."
    },
    metricsNote:
      "회원 수는 본인 집계 · 피드백 4건은 1.0 발표자료 p.24 원문 · 응답 시간은 PostgreSQL 16 에 표당 20만 행을 넣은 합성 데이터에서 각 7회 측정한 중앙값(현재 실사용 규모에서는 차이가 없다) · 품질 하네스는 AiInbodyQualityHarnessTest",
    kptLabels: {
      keep: "1.0 에서 배운 것 · 개발",
      problem: "아직 남은 것",
      try: "2.0 에서 배운 것 · 운영·사용자"
    },
    // 두 번 만들었고, 두 번의 배움이 종류가 다르다.
    // KEEP = 1.0(개발), TRY = 2.0(운영·사용자). 이 갈라짐 자체가 이 카드의 요점이다.
    kpt: {
      keep: [
        "1.0 · 프로필과 비밀 값은 처음부터 갈라 둔다 — 하드코딩 때문에 배포가 부팅부터 실패했다",
        "1.0 · DB 커넥션 문자열과 JVM 인코딩은 같이 맞춰야 한다 — 환경마다 한글이 깨졌다",
        "1.0 · SPA 라우팅은 프론트가 아니라 호스팅 설정 문제다 — CloudFront 403",
        "1.0 · 실시간은 실시간 서버로, 데이터는 REST 로 책임을 나눈다"
      ],
      problem: [
        "AI 응답 속도는 아직 손대지 못했다 — 사용자가 지적한 넷 중 유일하게 안 고친 것",
        "Refresh 로테이션을 되돌린 채로 두고 있다 (병렬 재발급 경쟁 상태)",
        "analytics_events 를 쌓고는 있지만 그걸로 판단한 적은 없다",
        "테스트가 AI 품질 하네스와 컨텍스트 로드 둘뿐이다 — 인증·출석 도메인부터 붙이는 게 다음 순서다",
        "CI 가 없어 지금은 로컬에서만 돌린다 (GitHub Actions 로 하네스부터 올릴 계획)"
      ],
      try: [
        "2.0 · 재방문은 기능 수가 아니라 첫 화면이 무엇을 시키느냐가 정한다 — 홈을 로비로",
        "2.0 · ‘소통하고 싶다’는 게시판으로 안 풀린다 — 같이 있다는 감각이 필요했다",
        "2.0 · 기록은 보여 주는 게 아니라 돌려줘야 한다 — 캐릭터·티어·랭킹",
        "2.0 · 로그 테이블은 읽는 화면이 있어야 의미가 생긴다 — 관리자 콘솔",
        "2.0 · 느린 쪽을 고치기 전에 재 봐야 한다 — 정렬을 400배 줄여도 페이지는 3.2배만 빨라졌다(count 가 남아서)"
      ]
    },
    learning:
      "1.0 에서는 「만드는 법」을 배웠다 — 배포·인증·인코딩처럼 안 되면 아무것도 안 되는 것들. 2.0 에서는 그게 다가 아니라는 걸 배웠다. 사용자 넷이 남긴 말 중 셋이 기능이 아니라 「동선과 관계」에 대한 것이었고, 고친 것도 그쪽이었다. 사람이 다시 오게 만드는 건 기능 개수가 아니라 첫 화면이 무엇을 시키느냐였다."
  },

  // ════════════════════════════ ACLUB / AjouClub FE (platform · 팀) ══════════
  aclub: {
    tagline: "CLUB DISCOVERY · TEAM FRONTEND",
    heroImage: {
      src: "/projects/aclub.webp",
      label: "동아리 탐색 홈",
      ratio: "16/9"
    },
    problemShot: {label: "에타·인스타·단톡에 흩어진 동아리 모집", ratio: "4/3"},
    gallery: [
      {
        src: "/projects/op/aclub-analytics.webp",
        label: "동아리 이용 분석",
        ratio: "16/10"
      },
      {
        src: "/projects/op/aclub-eta.webp",
        label: "기존 모집 채널(에타·카톡)",
        ratio: "16/10"
      },
      {
        src: "/projects/op/aclub-detail.webp",
        label: "동아리 상세·저장",
        ratio: "16/10"
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "동아리 탐색·모집을 한 곳에서 하는 플랫폼 프론트엔드 (AjouClub)"
      },
      {k: "왜", v: "동아리 정보가 여러 채널에 흩어져 탐색·지원이 번거로움"},
      {k: "결과", v: "탐색→상세→지원까지 한 흐름으로 처리하는 FE 완성"},
      {
        k: "내 역할",
        v: "2025 프론트 3인 중 1인 → 2026 프로젝트장 · 프론트 리드"
      }
    ],
    demo: {
      live: "https://aclub.co.kr/",
      repo: "https://github.com/aClub2026/FE"
    },
    // 서비스를 쓴 동아리 회장이 보내온 실제 메시지. **익명으로 적는다** —
    // 공개될 걸 알고 보낸 사적인 메시지가 아니라서, 단체명·직함·캡처는 쓰지
    // 않고 벌어진 일만 옮긴다. 지표 여섯 개보다 이 한 문장이 세다.
    testimonial: {
      q: "처음엔 이렇게 많이 신청해 주실 줄 몰라 상시모집으로 열어 뒀는데, 관리가 어려울 것 같아 급하게 모집을 마감했습니다.",
      who: "서비스에 등록한 한 동아리 회장"
    },
    meta: [
      {label: "기간", value: "2025.01 ~ 진행 중 (2025 팀원 → 2026 프로젝트장)"},
      {label: "팀", value: "프론트엔드 3인 (본인 포함)"},
      {
        label: "역할",
        value: "2025 화면·훅 담당 → 2026 프로젝트 총괄 · 프론트 리드"
      },
      {
        label: "스택",
        value: "React · TypeScript · Vite · Tailwind · React Router · axios"
      },
      {label: "배포", value: "GitHub Pages (커스텀 도메인 · CNAME)"}
    ],
    heroScreen: {
      title: "ajouclub/explore",
      kind: "cards",
      cards: [
        {l: "밴드", sub: "모집중"},
        {l: "코딩", sub: "지원 접수"},
        {l: "사진", sub: "모집중"},
        {l: "축구", sub: "마감"}
      ]
    },
    // 예전엔 "커스텀 훅 6+ / FE 팀 3인 / 타입 TS" 였다 — 전부 **내가 만든 것의
    // 개수**지 성과가 아니다. 심사자가 다음에 묻는 건 "그래서 몇 명이 썼나요" 다.
    // 아래는 GA4 실측(2026.01~03).
    impact: [
      {n: "3,500", l: "활성 사용자"},
      {n: "8.8만", l: "조회수"},
      {n: "93.4%", l: "세션 참여율"},
      {n: "1분 28초", l: "세션당 참여 시간"}
    ],
    features: [
      {t: "동아리 탐색·필터", d: "카테고리·모집상태·정렬(BottomSheet)"},
      {t: "모집공고 상세", d: "설명·이미지·지원 바(RecruitmentApplyBar)"},
      {t: "마이페이지", d: "즐겨찾기·지원 현황·관리 동아리"},
      {t: "권한 라우팅", d: "RequireAuth · AdminRoute 보호 라우트"}
    ],
    problem:
      "동아리 정보는 에브리타임·인스타·단톡 등 여러 채널에 흩어져 있어 학생들이 원하는 동아리를 탐색하고 지원 현황을 관리하기 어려웠다.",
    research: {
      quotes: [
        {
          q: "동아리 찾으려면 에타·인스타·단톡을 다 봐야 한다.",
          who: "사용자(학생) 관점"
        },
        {
          q: "여러 화면에서 같은 데이터를 부르니, 요청 로직을 훅으로 모아야 했다.",
          who: "FE 설계 관점"
        }
      ],
      stat: {n: "6+", l: "useClubs·useRecruitments 등 재사용 데이터 훅 수"}
    },
    hypothesis:
      "“탐색·필터·상세·지원을 한 흐름으로 묶고, 데이터 요청을 도메인별 커스텀 훅으로 모으면 — 학생은 한 곳에서 동아리를 찾고, 팀은 화면을 병렬로 개발할 수 있다.”",
    process: [
      {t: "IA 설계", d: "화면 흐름"},
      {t: "공통 컴포넌트", d: "Card·Chip·Field"},
      {t: "데이터 훅", d: "useClubs 등"},
      {t: "화면 구현", d: "탐색·상세·마이"},
      {t: "배포", d: "GitHub Pages"}
    ],
    architecture: [
      {
        tag: "Route",
        name: "React Router",
        desc: "탐색/상세/필터/마이/관리 라우팅"
      },
      {
        tag: "Data",
        name: "Custom Hooks",
        desc: "useClubs · useRecruitments · useMypageData …"
      },
      {
        tag: "API",
        name: "axios 모듈",
        desc: "auth · club · recruitment · user"
      },
      {
        tag: "UI",
        name: "공통 컴포넌트",
        desc: "Card · Chip · Field · Modal 재사용"
      }
    ],
    decisions: [
      {area: "빌드", pick: "Vite", why: "빠른 HMR·경량", alt: "CRA(느림)"},
      {
        area: "타입",
        pick: "TypeScript",
        why: "여러 명이 만지는 화면의 안정성",
        alt: "JS(런타임 오류 ↑)"
      },
      {
        area: "데이터",
        pick: "도메인 커스텀 훅",
        why: "요청 로직 재사용·화면 병렬 개발",
        alt: "컴포넌트마다 fetch(중복)"
      },
      {
        area: "권한",
        pick: "RequireAuth/AdminRoute",
        why: "라우트 단위 보호를 명시적으로",
        alt: "화면 안에서 분기(누락 위험)"
      }
    ],
    coreCode: [
      {
        filename: "useClubs.ts",
        caption: "동아리 데이터 요청을 훅으로 모아 화면에서 재사용",
        highlightLines: [2],
        lines: [
          "export function useClubs(params: ClubQuery) {",
          "  // axios 모듈 + 로딩/에러 상태를 한곳에 캡슐화",
          "  const [data, setData] = useState<Club[]>([]);",
          "  useEffect(() => { club.list(params).then(setData); }, [params]);",
          "  return data;",
          "}"
        ]
      },
      {
        filename: "RequireAuth.tsx",
        caption: "로그인 여부로 보호 라우트 처리",
        lines: [
          "function RequireAuth({ children }) {",
          "  const { user } = useAuth();",
          "  return user ? children : <Navigate to='/login' replace />;",
          "}"
        ]
      }
    ],
    work: [
      {g: "탐색", items: ["탐색·필터·정렬 화면", "동아리 카드 컴포넌트"]},
      {g: "상세/지원", items: ["모집 상세·지원 바", "마이페이지 지원 현황"]},
      {g: "데이터", items: ["도메인 커스텀 훅", "axios API 모듈"]},
      {g: "공통", items: ["Card·Chip·Field 공통 컴포넌트", "보호 라우트"]}
    ],
    challenges: [
      {
        title: "여러 화면이 같은 데이터를 제각각 불렀다",
        problem:
          "탐색·상세·마이페이지가 동아리 데이터를 각자 fetch해 로직이 중복되고 상태가 어긋났다.",
        solution:
          "도메인별 커스텀 훅(useClubs·useRecruitments 등)으로 요청·상태를 캡슐화해 화면들이 같은 훅을 재사용하게 했다."
      },
      {
        title: "로그인/관리자 화면 접근 제어가 흩어졌다",
        problem: "권한 체크를 화면마다 넣다 보니 누락이 생겼다.",
        solution:
          "RequireAuth·AdminRoute 보호 라우트로 라우팅 계층에서 한 번에 제어했다."
      }
    ],
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "TailwindCSS",
      "React Router",
      "axios"
    ],
    resultScreens: [
      {
        title: "ajouclub/explore",
        kind: "cards",
        cards: [
          {l: "밴드", sub: "모집중"},
          {l: "코딩", sub: "접수중"},
          {l: "사진", sub: "모집중"},
          {l: "축구", sub: "마감"}
        ]
      },
      {
        title: "ajouclub/my",
        kind: "feed",
        feed: [
          "코딩 동아리 지원 완료",
          "밴드 동아리 즐겨찾기",
          "사진 동아리 면접 예정"
        ]
      }
    ],
    metrics: [
      // 예전엔 "커스텀 훅 6+ / FE 팀 3인 / TS / GitHub Pages" 였다 — 넷 다
      // **내가 만든 것의 개수·이름**이지 성과가 아니다. GA4 실측으로 바꿨다.
      {n: "3,500", l: "활성 사용자"},
      {n: "8.8만", l: "조회수"},
      {n: "93.4%", l: "세션 참여율"},
      {n: "1분 28초", l: "세션당 참여"}
    ],
    metricsNote: "Google Analytics 4 · 2026.01–03 · 활성 사용자 기준",
    kpt: {
      keep: [
        "데이터 요청을 훅으로 모은 것",
        "보호 라우트로 권한 일원화",
        "공통 컴포넌트 재사용"
      ],
      problem: ["디자인 시스템이 후반에 정리됨", "테스트 부족"],
      try: ["백엔드 연동 안정화", "검색 고도화"]
    },
    learning:
      "팀 프론트엔드에서는 ‘같은 데이터를 어떻게 한 번만 정의해 재사용할까’가 협업 속도를 좌우했다. 커스텀 훅과 보호 라우트가 그 답이었다."
  },

  // ════════════════════════════ 아주총학 / ajouchong-web (platform · 팀) ══════
  ajouchong: {
    tagline: "STUDENT COUNCIL · TEAM SPA + DEPLOY",
    heroImage: {
      src: "/projects/ajouchong.webp",
      label: "총학생회 메인",
      ratio: "16/9"
    },
    // 학생들은 폰으로 본다. 그런데 1차 모바일은 주요 메뉴가 햄버거 안에만
    // 있었다 — 「정보 탐색 효율 개선」이라고 적어만 두고 근거가 없던 그 지점이다.
    problemShot: {
      src: "/projects/ajouchong/v2/mobile-before.webp",
      label: "1차 모바일 — 메뉴가 햄버거 안에만 있었다",
      ratio: "9/16",
      caption:
        "첫 화면에 있는 건 대여사업 카드 하나뿐. 소개·소식·소통·자료실·학생복지로 가려면 오른쪽 위 햄버거를 먼저 눌러야 했다."
    },
    // 2026.04 개편 — 개선 전/후 캡처가 실제로 남아 있다(업데이트 자료 3차례분).
    beforeAfter: {
      before: {
        label: "햄버거를 눌러야 메뉴가 보인다",
        shot: {
          src: "/projects/ajouchong/v2/mobile-before.webp",
          label: "개편 전 모바일 메인",
          ratio: "9/16"
        },
        note: "탭 한 번을 더 써야 목적지가 나온다. 어디로 갈 수 있는지조차 첫 화면에 안 보인다."
      },
      after: {
        label: "첫 화면에 여섯 갈래를 편다",
        shot: {
          src: "/projects/ajouchong/v2/mobile-after.webp",
          label: "개편 후 모바일 메인",
          ratio: "9/16"
        },
        note: "소개·소식·소통·자료실·학생복지·ACENTIA 를 아이콘 카드로 히어로 바로 밑에 놨다. 메뉴 구조를 바꾼 게 아니라 안 눌러도 보이게 한 것이다."
      }
    },
    gallery: [
      // ── 2026.04 개편 이후 ──
      // 이 넷의 공통점: 전부 **총학생회가 직접 고치는 화면**이다.
      // 1차 때는 물품 수량 하나 바꾸려 해도 개발자가 배포해야 했다.
      {
        src: "/projects/ajouchong/v2/rental.webp",
        label: "대여사업 — 실시간 수량",
        ratio: "21/10",
        caption:
          "총 품목·대여 가능·재고 임박·최종 업데이트를 한 줄에 세우고, 품목마다 남은 수량을 막대로 보여 준다. 「지금 빌릴 수 있나」를 묻지 않고 알 수 있게 한 화면."
      },
      {
        src: "/projects/ajouchong/v2/rental-admin.webp",
        label: "대여 물품 관리 — 운영자가 직접",
        ratio: "21/10",
        caption:
          "수량 옆 −/+ 로 바로 조정하고 「35 (변경됨)」처럼 저장 전 상태를 표시한다. 확인 대화상자로 한 번 더 묻는다 — 실수로 재고가 틀어지면 학생이 헛걸음한다."
      },
      {
        src: "/projects/ajouchong/v2/chatbot.webp",
        label: "안내 봇 — 문의를 사람이 받지 않게",
        ratio: "21/10",
        caption:
          "공지·대여사업·제휴복지·Q&A·건의로 가는 길을 먼저 제시하고, 그래도 없으면 의견을 남긴다. 반복 문의가 사람에게 도달하기 전에 걸러지는 자리."
      },
      {
        src: "/projects/ajouchong/v2/feedback.webp",
        label: "피드백 관리 화면",
        ratio: "21/10",
        caption: "학생이 남긴 의견을 총학생회가 열어 보는 곳."
      },
      {
        src: "/projects/op/ajouchong-notice.webp",
        label: "공지 상세 페이지",
        ratio: "16/10"
      },
      {
        src: "/projects/op/ajouchong-detail.webp",
        label: "세부 안내 페이지",
        ratio: "16/10"
      }
    ],
    tldr: [
      {k: "무엇을", v: "아주대 총학생회 공식 웹사이트 프론트엔드"},
      {k: "왜", v: "공지·Q&A·복지·자료가 여러 채널에 흩어져 있었음"},
      {k: "결과", v: "정보를 한 SPA에 모아 Docker + Nginx로 실제 배포"},
      {k: "내 역할", v: "3인 팀 프론트엔드 · 배포 담당"}
    ],
    demo: {
      live: "https://ajouchong.com",
      // 실서비스는 조직 저장소다(본인 확인). 개인 포크가 아니라 이쪽을 건다.
      repo: "https://github.com/ajouchong-dev/ajouchong-web"
    },
    meta: [
      {label: "기간", value: "2025.01 ~ 진행 중"},
      {label: "팀", value: "총학생회 IT · 프론트 3인"},
      {label: "역할", value: "SPA 라우팅·화면 · Docker/Nginx 배포"},
      {
        label: "스택",
        value: "React 18 · CRA · JavaScript · React Router · Docker · Nginx"
      },
      {label: "배포", value: "Docker + Nginx (실서비스 구성)"}
    ],
    heroScreen: {
      title: "ajou-council",
      kind: "feed",
      feed: [
        "[공지] 총회 일정 안내",
        "[Q&A] 학식 환불 문의",
        "[복지] 제휴 업체 추가",
        "[자료] 회의록"
      ]
    },
    // Search Console 실측. 라벨에 **"검색"** 을 반드시 남긴다 —
    // 전체 방문자로 읽히면 과장이 된다.
    impact: [
      {n: "34,200", l: "검색 노출"},
      {n: "1,080", l: "검색 클릭"},
      {n: "3.2%", l: "검색 CTR"}
    ],
    features: [
      {t: "공지·소개", d: "메인·소개·공지 목록/상세"},
      {t: "Q&A", d: "학생 문의 작성·조회"},
      {t: "자료실", d: "회칙·회의록·감사 자료"},
      {t: "복지/제휴", d: "제휴·대여·캠퍼스맵 안내"}
    ],
    problem:
      "총학생회 정보가 인스타·공지 등 여러 채널에 분산되어 학생들이 공지·Q&A·복지·자료를 한 곳에서 확인하기 어려웠고, 실제로 배포해 ‘쓰이는 서비스’로 만들어야 했다.",
    research: {
      quotes: [
        {q: "공지가 인스타에만 올라와서 놓치면 끝이다.", who: "학생 관점"},
        {
          q: "SPA는 새로고침하면 서버가 경로 파일을 못 찾아 404가 난다.",
          who: "배포에서 실제 마주친 문제"
        }
      ],
      stat: {n: "3", l: "함께 개발한 프론트엔드 팀 인원"}
    },
    hypothesis:
      "“핵심 정보를 하나의 SPA로 모으고 Docker + Nginx로 환경을 고정해 배포하면 — 학생 정보 접근성이 오르고, ‘내 컴퓨터에선 되는데’ 문제 없이 안정적으로 운영된다.”",
    process: [
      {t: "정보구조", d: "메뉴 설계"},
      {t: "라우팅·화면", d: "공지·Q&A·자료"},
      {t: "인증", d: "AuthContext"},
      {t: "컨테이너화", d: "Docker"},
      {t: "서빙", d: "Nginx"}
    ],
    architecture: [
      {
        tag: "Route",
        name: "React Router SPA",
        desc: "공지/Q&A/자료/복지 라우팅"
      },
      {
        tag: "Auth",
        name: "AuthContext",
        desc: "로그인 상태 전역·ProtectedRoute"
      },
      {tag: "Serve", name: "Nginx", desc: "정적 서빙 · SPA try_files 폴백"},
      {tag: "Ship", name: "Docker", desc: "빌드·실행 환경 고정"}
    ],
    decisions: [
      {area: "구조", pick: "SPA", why: "빠른 화면 전환", alt: "MPA(새로고침)"},
      {
        area: "서빙",
        pick: "Nginx",
        why: "정적+폴백 안정적",
        alt: "Node 서버(과함)"
      },
      {
        area: "배포",
        pick: "Docker",
        why: "환경 일관성 확보",
        alt: "수동 배포(실수 ↑)"
      },
      {
        area: "인증",
        pick: "Context",
        why: "단순 로그인 상태에 충분",
        alt: "라이브러리(과함)"
      }
    ],
    coreCode: [
      {
        filename: "nginx.conf",
        caption: "SPA 새로고침 404 방지 — try_files 폴백",
        highlightLines: [2],
        lines: [
          "location / {",
          "  try_files $uri $uri/ /index.html; # 없는 경로는 SPA로",
          "}"
        ]
      },
      {
        filename: "ProtectedRoute.js",
        caption: "로그인 상태에 따른 보호 라우트",
        lines: [
          "function ProtectedRoute({ children }) {",
          "  const { user } = useContext(AuthContext);",
          "  return user ? children : <Navigate to='/login' />;",
          "}"
        ]
      }
    ],
    work: [
      {g: "라우팅", items: ["SPA 라우팅 구조", "보호 라우트"]},
      {g: "화면", items: ["공지·Q&A·자료실 화면"]},
      {g: "인증", items: ["AuthContext 로그인 상태"]},
      {g: "배포", items: ["Docker 이미지", "Nginx 설정"]}
    ],
    challenges: [
      {
        title: "새로고침하면 404가 떴다",
        problem:
          "SPA 라우트에서 새로고침 시 Nginx가 실제 파일을 못 찾아 404를 반환했다.",
        solution:
          "try_files로 모든 경로를 index.html로 폴백시켜 클라이언트 라우터가 처리하게 했다."
      },
      {
        title: "로컬은 되는데 서버에선 달랐다",
        problem: "환경 차이로 빌드·실행이 다르게 동작했다.",
        solution:
          "Docker로 빌드·실행 환경을 고정해 ‘내 컴퓨터에선 되는데’ 문제를 없앴다."
      }
    ],
    tech: ["React 18", "JavaScript", "React Router", "Docker", "Nginx"],
    resultScreens: [
      {
        title: "ajou-council/notice",
        kind: "feed",
        feed: ["총회 일정 안내", "학식 운영 변경", "장학 신청 안내"]
      },
      {
        title: "ajou-council/welfare",
        kind: "cards",
        cards: [
          {l: "제휴 카페", sub: "할인"},
          {l: "물품 대여", sub: "우산·충전기"},
          {l: "제휴 식당", sub: "신규"},
          {l: "캠퍼스맵", sub: "안내"}
        ]
      }
    ],
    metrics: [
      // Search Console 실측. 라벨의 **"검색"** 은 지우면 안 된다 —
      // 전체 방문자로 읽히면 과장이 된다.
      {n: "34,200", l: "검색 노출"},
      {n: "1,080", l: "검색 클릭"},
      {n: "3.2%", l: "검색 CTR"},
      {n: "0", l: "새로고침 404"}
    ],
    metricsNote: "Google Search Console · 검색 유입 기준 (전체 방문자 아님)",
    kptLabels: {
      keep: "1차에서 배운 것 · 개발·배포",
      problem: "아직 남은 것",
      try: "2차에서 배운 것 · 운영·사용자"
    },
    // KEEP/TRY 를 「1차에서 배운 것 / 2차에서 배운 것」으로 갈랐다.
    // 이 프로젝트도 두 번 만들었고, 두 번의 배움이 서로 다른 종류다.
    kpt: {
      keep: [
        "1차 · 배포까지 끝내야 서비스가 된다 — Docker/Nginx 로 환경을 고정",
        "1차 · SPA 는 새로고침에서 깨진다 — Nginx try_files 로 404 를 없앰",
        "1차 · 정보 구조를 먼저 정하면 화면은 따라온다"
      ],
      // 「모바일 최적화 미흡」은 1차 회고에 스스로 적어 둔 문제였고, 2차에서 고쳤다.
      problem: [
        "링크허브는 개편했지만 실데이터로 다시 채우는 중이다",
        "개편 효과를 Search Console 로 아직 재보지 않았다",
        "접근성(대비·포커스)은 여전히 보강이 필요하다"
      ],
      try: [
        "2차 · 메뉴를 늘리는 게 아니라 안 눌러도 보이게 한다 — 모바일 첫 화면에 6갈래",
        "2차 · 운영자가 직접 고치게 만든다 — 수량·공지·링크·피드백을 관리 화면으로",
        "2차 · 반복 문의는 사람에게 닿기 전에 안내 봇이 먼저 받는다"
      ]
    },
    learning:
      "1차에서는 ‘배포해서 진짜 쓰이게 하는 것’(Docker·Nginx·SPA 폴백)을 배웠고, 2차에서는 그 다음을 배웠다 — 학생은 폰으로 들어와 햄버거를 안 누르고, 총학생회는 물품 수량 하나 바꾸려고 개발자를 부르고 싶어 하지 않는다. 화면을 예쁘게 고치는 것보다 **쓰는 사람이 스스로 할 수 있게 만드는 것**이 운영형 서비스의 개선이었다."
  },

  // ════════════════════════════ 수어지교 / Sign-Language (platform · 팀) ══════
  "sign-language": {
    tagline: "SIGN LANGUAGE LEARNING · TEAM (BACKEND)",
    problemShot: {label: "영상만 보며 따라하던 기존 학습 방식", ratio: "4/3"},
    gallery: [
      {label: "수어 단어 학습·퀴즈", ratio: "16/10"},
      {label: "수어 동작 영상 재생", ratio: "16/10"},
      {label: "정답 피드백·반복 학습", ratio: "16/10"}
    ],
    tldr: [
      {
        k: "무엇을",
        v: "수어 동작 영상을 보고 뜻을 맞히며 익히는 학습 앱 (파란학기 과제 · 3D 아바타는 팀원 담당)"
      },
      {
        k: "왜",
        v: "수어를 ‘번역 대상’이 아니라 ‘읽고 익히는 언어’로 학습할 도구가 부족"
      },
      {
        k: "결과",
        v: "동작 보고 의미 맞히기 + 텍스트→수어 변환 시제품 (30+ 단어)"
      },
      {k: "내 역할", v: "4인 팀의 백엔드 — Spring Boot 서버·API·데이터 처리"}
    ],
    demo: {repo: "https://github.com/toadsam/Sign-Language"},
    meta: [
      {label: "기간", value: "~ 2026.05 · 파란학기제 (한 학기)"},
      {label: "팀", value: "4인 (FE 1 · BE 2 · 3D 아바타 1)"},
      {label: "역할", value: "백엔드 — 서버 구축·API 설계·입력 데이터 처리"},
      {
        label: "스택",
        value:
          "Spring Boot(Gradle) · Firebase Firestore · Firebase Storage · Expo · React Native"
      },
      {label: "배포", value: "GitHub Pages (프론트) · /api/health 상태 체크"}
    ],
    heroScreen: {
      title: "sign/learn",
      kind: "cards",
      cards: [
        {l: "안녕하세요", sub: "인사"},
        {l: "감사합니다", sub: "표현"},
        {l: "이름", sub: "기본"},
        {l: "도와주세요", sub: "요청"}
      ]
    },
    impact: [
      {n: "4인", l: "팀 · 백엔드 담당"},
      {n: "Firestore", l: "데이터·스토리지"},
      {n: "30+", l: "학습 단어"}
    ],
    features: [
      {t: "수어 퀴즈 학습", d: "수어 영상을 보고 보기 4개 중 뜻을 고름"},
      {t: "텍스트→수어 변환", d: "입력 텍스트를 수어 표현으로 보여줌"},
      {t: "오답노트·반복 학습", d: "틀린 단어를 누적해 다시 출제"},
      {t: "학습 피드백", d: "정답률·최대 연속 정답·최다 오답 단어 집계"}
    ],
    problem:
      "기존 수어 플랫폼은 대부분 ‘문장을 넣으면 아바타가 수어로 보여주는’ 구조라, 이미 수어를 아는 사람을 전제한다. 수어를 처음 접하는 사람이 동작을 보고 의미를 익히는 ‘읽기 학습’ 도구가 부족했다.",
    research: {
      quotes: [
        {
          q: "수어를 ‘번역 대상’이 아니라 ‘읽고 익히는 언어’로 재정의했다.",
          who: "팀 문제 정의 (README)"
        },
        {
          q: "영상은 Storage에, 단어 정보는 Firestore에 따로 쌓여서 조회 경로를 하나로 모아야 했다.",
          who: "백엔드 담당(본인) 관점"
        }
      ],
      stat: {n: "30+", l: "시제품 목표 학습 단어 수 (README 기준)"}
    },
    hypothesis:
      "“동작을 먼저 보여주고 뜻을 고르게 하는 구조 + 단어-영상 조회 경로를 단일 소스로 두면 — 처음 배우는 사람도 반복으로 수어를 ‘읽는’ 감각을 기를 수 있다.”",
    process: [
      {t: "요구분석", d: "학습 흐름"},
      {t: "API 설계", d: "학습·판정·변환"},
      {t: "데이터 구축", d: "단어-동작 매핑"},
      {t: "연동", d: "FE·아바타 팀원과 API 계약"},
      {t: "발표", d: "파란학기"}
    ],
    architecture: [
      {
        tag: "View",
        name: "Expo (React Native)",
        desc: "퀴즈·변환 화면 · expo-video"
      },
      {tag: "API", name: "Spring Boot", desc: "학습·정답판정·변환 API (담당)"},
      {
        tag: "Data",
        name: "Firebase/Firestore",
        desc: "단어·영상 매핑 · Firestore + Cloud Storage"
      },
      {
        tag: "Contract",
        name: "단일 조회 경로",
        desc: "Storage → Firestore 폴백을 한 곳으로"
      }
    ],
    decisions: [
      {
        area: "백엔드",
        pick: "Spring Boot",
        why: "API·검증 구조에 적합",
        alt: "Flask(타입 약함)"
      },
      {
        area: "데이터",
        pick: "Firestore + Storage",
        why: "단어·에셋을 빠르게 저장·확장",
        alt: "자체 DB 구축(공수 ↑)"
      },
      {
        area: "정답판정",
        pick: "표기 정규화 비교",
        why: "공백·표기 흔들림 흡수",
        alt: "완전 일치(오답 ↑)"
      },
      {
        area: "협업",
        pick: "API 계약 우선",
        why: "FE·아바타와 병렬 작업",
        alt: "후순위(병목)"
      }
    ],
    coreCode: [
      {
        filename: "QuizService.java",
        caption: "선택지 ID를 양쪽 다 정규화한 뒤 비교",
        highlightLines: [1, 2, 4],
        lines: [
          'String correctChoiceId = normalizeChoiceId(doc.getString("correctChoiceId"));',
          "String selectedChoiceId = normalizeChoiceId(request.selectedChoiceId());",
          "",
          "boolean isCorrect = correctChoiceId.equals(selectedChoiceId);",
          "",
          "private String normalizeChoiceId(String value) {",
          '  return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);',
          "}"
        ]
      },
      {
        filename: "StorageVideoCache.java",
        caption: "Storage에 없으면 Firestore URL로 폴백 — 조회 경로를 하나로",
        highlightLines: [2, 6],
        lines: [
          "public String findUrlOrFallback(String word, String fallbackUrl) {",
          "  String storageUrl = findUrl(word);",
          "  if (storageUrl != null && !storageUrl.isBlank()) {",
          "    return storageUrl;",
          "  }",
          '  return fallbackUrl == null ? "" : fallbackUrl.trim();',
          "}"
        ]
      }
    ],
    work: [
      {g: "서버", items: ["Spring Boot 서버 구축", "학습·변환 API 설계"]},
      {g: "데이터", items: ["단어-영상 매핑 처리", "Firestore/Storage 연동"]},
      {g: "로직", items: ["퀴즈 출제·선택지 정규화", "오답노트·반복 학습 흐름"]}
    ],
    challenges: [
      {
        title: "선택지 값이 조금만 달라도 오답 처리됐다",
        problem:
          "클라이언트가 보낸 선택지 ID의 대소문자·공백이 저장된 정답과 달라 맞은 답이 오답이 됐다.",
        solution:
          "채점 전에 양쪽 선택지 ID를 trim + 대문자로 정규화한 뒤 비교하도록 통일했다."
      },
      {
        title: "단어에 맞는 수어 영상이 안 나오는 경우가 있었다",
        problem:
          "영상은 Firebase Storage에, 메타데이터는 Firestore에 따로 있어 한쪽에만 있는 단어는 재생이 비었다.",
        solution:
          "Storage를 단어로 먼저 조회하고 없으면 Firestore의 영상 URL로 폴백하는 단일 조회 경로를 만들었다."
      }
    ],
    tech: [
      "Spring Boot",
      "Firebase Firestore",
      "Firebase Storage",
      "Expo",
      "React Native"
    ],
    resultScreens: [
      {
        title: "sign/quiz",
        kind: "stats",
        stats: [
          {n: "동작→의미", l: "퀴즈"},
          {n: "정규화", l: "판정"},
          {n: "반복", l: "학습"},
          {n: "30+", l: "단어"}
        ]
      },
      {
        title: "sign/translate",
        kind: "cards",
        cards: [
          {l: "입력: 안녕", sub: "→ 동작 재생"},
          {l: "입력: 이름", sub: "→ 동작 재생"}
        ]
      }
    ],
    metrics: [
      {n: "4인", l: "팀(BE 담당)"},
      {n: "Firestore", l: "데이터"},
      {n: "양방향", l: "학습+변환"},
      {n: "30+", l: "단어"}
    ],
    kpt: {
      keep: ["API 계약을 먼저 정해 병렬 작업", "정답 정규화로 UX 개선"],
      problem: ["단어 수가 적음", "실사용자 테스트 부족"],
      try: ["단어 100개+ 확장", "동작 인식(카메라) 도입"]
    },
    learning:
      "프론트·아바타·백엔드가 얽힌 협업에서 ‘데이터 계약을 단일 소스로 통일하는 것’이 가장 중요하다는 걸 배웠다. 백엔드는 결국 신뢰할 수 있는 계약을 내려주는 역할이었다."
  },

  // ════════════════════════════ DarkLab (game · horror · 팀) ═════════════════
  darklab: {
    tagline: "FIRST-PERSON HORROR · UNITY (TEAM)",
    problemShot: {label: "초기 그레이박스 프로토타입", ratio: "4/3"},
    gallery: [
      {label: "1인칭 탐색 플레이", ratio: "16/9"},
      {label: "URP 라이팅·분위기 연출", ratio: "16/9"},
      {label: "상호작용·이벤트 구간", ratio: "16/9"}
    ],
    tldr: [
      {
        k: "무엇을",
        v: "1인칭 탐색 기반 3D 공포 어드벤처 프로토타입 (Threshold)"
      },
      {k: "왜", v: "공포의 긴장감은 사운드보다 ‘공간 탐색·상호작용’에서 나옴"},
      {
        k: "결과",
        v: "탐색·상호작용·카메라 연출 + 3개국어 로컬라이즈 프로토타입"
      },
      {k: "내 역할", v: "3인 팀의 게임 프로그래밍 — 제어·상호작용·연출"}
    ],
    demo: {repo: "https://github.com/toadsam/DarkLab"},
    meta: [
      {label: "기간", value: "2024-1 학기 (팀 프로젝트)"},
      {label: "팀", value: "3인 (프로그래밍 담당)"},
      {label: "역할", value: "플레이어 제어·상호작용·카메라 연출"},
      {
        label: "스택",
        value:
          "Unity 2022.3.2f1 · C# · URP · Cinemachine · DOTween · Localization"
      },
      {label: "플랫폼", value: "PC (프로토타입 빌드)"}
    ],
    heroScreen: {
      title: "DARKLAB",
      kind: "title",
      titleText: "DARKLAB",
      subText: "▶ ENTER THE LAB"
    },
    impact: [
      {n: "3개국어", l: "로컬라이즈(en/ja/ko)"},
      {n: "Cinemachine", l: "카메라 연출"},
      {n: "3인", l: "팀 협업"}
    ],
    features: [
      {t: "1인칭 탐색", d: "Input System 기반 이동·시점"},
      {t: "레이캐스트 상호작용", d: "바라보는 오브젝트 조사·집기"},
      {t: "카메라 연출", d: "Cinemachine 전환·시야 제한 + DOTween"},
      {t: "상태 데이터 분리", d: "ScriptableObject로 캐릭터·상태 관리"}
    ],
    problem:
      "공포 게임의 긴장감은 단순한 점프스케어보다 공간 탐색과 오브젝트 상호작용에서 나온다. 이를 자연스럽게 구현하는 카메라 연출과 이벤트 흐름, 그리고 다국어 지원까지 필요했다.",
    research: {
      quotes: [
        {
          q: "점프스케어만 있는 공포는 금방 질린다 — 탐색이 무서워야 한다.",
          who: "장르 문제 정의"
        },
        {q: "뭘 상호작용할 수 있는지 안 보이면 답답하다.", who: "플레이 관점"}
      ],
      stat: {n: "3", l: "지원 언어 (Unity Localization: en/ja/ko-KR)"}
    },
    hypothesis:
      "“레이캐스트 상호작용 + Cinemachine 시야 연출을 결합하면, 점프스케어 없이도 탐색 자체로 긴장감을 만들 수 있다.”",
    process: [
      {t: "프로토", d: "그레이박스"},
      {t: "상호작용", d: "레이캐스트"},
      {t: "카메라", d: "Cinemachine"},
      {t: "데이터", d: "SO 분리"},
      {t: "로컬라이즈", d: "3개국어"}
    ],
    architecture: [
      {tag: "Input", name: "Input System", desc: "1인칭 이동·시점"},
      {
        tag: "Interact",
        name: "Raycast Interactor",
        desc: "IInteractable 조사·집기"
      },
      {
        tag: "Camera",
        name: "Cinemachine + DOTween",
        desc: "전환·시야 제한 연출"
      },
      {
        tag: "Data",
        name: "ScriptableObject",
        desc: "캐릭터·상태 · Localization/Addressables"
      }
    ],
    decisions: [
      {
        area: "상호작용",
        pick: "Raycast",
        why: "직관적 ‘바라보는 것’ 조사",
        alt: "트리거 콜라이더(부정확)"
      },
      {
        area: "카메라",
        pick: "Cinemachine",
        why: "블렌딩·연출 강력",
        alt: "수동 카메라(공수 ↑)"
      },
      {
        area: "데이터",
        pick: "ScriptableObject",
        why: "디자이너 친화·유지보수",
        alt: "하드코딩(경직)"
      },
      {
        area: "렌더/다국어",
        pick: "URP + Localization",
        why: "조명 연출 + 3개국어 대응",
        alt: "Built-in(연출 ↓)"
      }
    ],
    coreCode: [
      {
        filename: "Interactor.cs",
        caption: "화면 중앙에서 레이캐스트로 상호작용 대상 조사",
        highlightLines: [3, 4],
        lines: [
          "void TryInteract() {",
          "  Ray ray = cam.ViewportPointToRay(center);",
          "  if (Physics.Raycast(ray, out var hit, 2.5f))",
          "    hit.collider.GetComponent<IInteractable>()?.Interact();",
          "}"
        ]
      },
      {
        filename: "PlayerState.cs",
        caption: "상태를 ScriptableObject로 분리 — 씬 간 공유",
        lines: [
          "[CreateAssetMenu]",
          "public class PlayerState : ScriptableObject {",
          "  public int sanity;",
          "  public bool hasKey;",
          "}"
        ]
      }
    ],
    work: [
      {g: "제어", items: ["1인칭 이동·시점", "Input System 연동"]},
      {
        g: "상호작용",
        items: ["레이캐스트 조사·집기", "IInteractable 인터페이스"]
      },
      {g: "연출", items: ["Cinemachine 카메라 전환", "DOTween 연출"]},
      {g: "데이터", items: ["ScriptableObject 상태 설계"]}
    ],
    challenges: [
      {
        title: "카메라 전환이 뚝뚝 끊겼다",
        problem: "이벤트마다 카메라를 수동으로 옮기니 전환이 부자연스러웠다.",
        solution:
          "Cinemachine 가상 카메라 우선순위로 블렌딩해 부드럽게 시점이 넘어가도록 했다."
      },
      {
        title: "무엇을 상호작용할지 안 보였다",
        problem: "플레이어가 조사 가능한 오브젝트를 인지 못 해 답답해했다.",
        solution:
          "레이캐스트가 IInteractable에 닿으면 미세한 하이라이트/커서 변화를 줘 단서를 제공했다.",
        code: {
          filename: "Highlight.cs",
          lines: [
            "if (hit && hit.GetComponent<IInteractable>())",
            "  reticle.SetActive(true); // 조사 가능 신호"
          ]
        }
      }
    ],
    tech: [
      "Unity 2022.3",
      "C#",
      "URP",
      "Cinemachine",
      "DOTween",
      "Localization"
    ],
    resultScreens: [
      {
        title: "DARKLAB · LAB",
        kind: "title",
        titleText: "CHAPTER 1",
        subText: "THE LAB"
      },
      {
        title: "interactions",
        kind: "feed",
        feed: [
          "문서 조사 — 단서",
          "잠긴 문 — 열쇠 필요",
          "전원 차단기 작동",
          "복도 카메라 전환"
        ]
      }
    ],
    metrics: [
      {n: "3개국어", l: "로컬라이즈"},
      {n: "Cinemachine", l: "연출"},
      {n: "ScriptableObject", l: "상태 구조"},
      {n: "3인", l: "팀"}
    ],
    kpt: {
      keep: [
        "연출을 Cinemachine으로 위임",
        "상태를 데이터로 분리",
        "다국어 대응"
      ],
      problem: ["퍼즐 분량 부족", "사운드 디자인 미흡"],
      try: ["퍼즐·엔딩 시퀀스 추가", "세이브 시스템"]
    },
    learning:
      "공포는 ‘놀래키기’가 아니라 ‘플레이어가 스스로 긴장하게 만드는 설계’라는 걸 배웠다. 연출 도구(Cinemachine)를 잘 위임하는 것도 실력이었다."
  },

  // ════════════════════════════ 아주분투 / Ajou_Mini_Game (game · arcade) ════
  "ajou-adventure": {
    tagline: "2D CASUAL RUNNER · PHASER 3 (SOLO)",
    heroImage: {
      src: "/projects/ajou-adventure.webp",
      label: "인게임 플레이",
      ratio: "16/9"
    },
    problemShot: {label: "도형 기반 초기 프로토타입", ratio: "4/3"},
    gallery: [
      {src: "/projects/op/aa-title.webp", label: "타이틀 화면", ratio: "16/9"},
      {src: "/projects/op/aa-levelup.webp", label: "레벨업 UI", ratio: "16/9"},
      {src: "/projects/op/aa-cheeto.webp", label: "아이템·연출", ratio: "16/9"}
    ],
    tldr: [
      {k: "무엇을", v: "아주대 캠퍼스 테마 2D 캐주얼 러닝 게임 (아주분투)"},
      {k: "왜", v: "대학생이 공감할 가벼운 웹 게임을 만들고 싶었음"},
      {
        k: "결과",
        v: "Scene/Object/System으로 모듈화 + 자동 플레이테스트 하네스"
      },
      {k: "내 역할", v: "기획·개발 전담 (1인)"}
    ],
    demo: {repo: "https://github.com/toadsam/Ajou_Mini_Game"},
    meta: [
      {label: "팀", value: "개인 프로젝트 (전담)"},
      {label: "역할", value: "기획·개발·플레이테스트 전부"},
      {label: "스택", value: "TypeScript · Phaser 3 · Vite"},
      {label: "배포", value: "GitHub Pages / Vercel (정적)"}
    ],
    heroScreen: {
      title: "AJOU RUN",
      kind: "title",
      titleText: "아주분투",
      subText: "▶ PRESS START"
    },
    impact: [
      {n: "4·4·4", l: "Scene/Object/System 모듈"},
      {n: "2단 점프", l: "코어 조작"},
      {n: "자동", l: "플레이테스트 하네스"}
    ],
    features: [
      {t: "자동 횡스크롤 러닝", d: "끊긴 발판 자동 생성 + 화면 밖 제거"},
      {t: "2단 점프", d: "클릭/스페이스로 점프 (maxJumps=2)"},
      {t: "낮/노을/밤 전환", d: "점수 구간(1500·3500)별 배경 fade"},
      {t: "최고 점수 저장", d: "localStorage 기반 기록 유지"}
    ],
    problem:
      "쉬는 시간에 잠깐 즐길, 대학생이 공감할 가벼운 웹 게임이 의외로 없었다. 캠퍼스 감성을 살리되(공식 로고 없이 도형 기반) 조작이 매끄럽고 끊기지 않는 러너가 필요했다.",
    research: {
      quotes: [
        {
          q: "공식 엠블럼 없이 캠퍼스 감성만 도형 그래픽으로 표현했다.",
          who: "제작 방향 (README)"
        },
        {
          q: "발판·아이템을 매 프레임 생성/파괴하면 GC로 끊긴다.",
          who: "구현에서 마주친 문제"
        }
      ],
      stat: {n: "3", l: "점수 구간 배경(낮 0 / 노을 1500 / 밤 3500)"}
    },
    hypothesis:
      "“게임을 Scene/Object/System 레이어로 나누고, 발판·아이템을 재사용(풀링)하면 — 혼자서도 유지보수 가능하고 끊기지 않는 러너를 만들 수 있다.”",
    process: [
      {t: "기획", d: "캠퍼스 테마"},
      {t: "모듈 구조", d: "Scene/Obj/Sys"},
      {t: "코어 루프", d: "러닝·점프"},
      {t: "연출", d: "배경 전환"},
      {t: "플레이테스트", d: "자동 하네스"}
    ],
    architecture: [
      {
        tag: "Scene",
        name: "Boot/Menu/Game/GameOver",
        desc: "씬 단위 화면 흐름"
      },
      {
        tag: "Object",
        name: "Player/Platform/Item/Obstacle",
        desc: "게임 오브젝트 클래스"
      },
      {
        tag: "System",
        name: "Spawner/Score/Background/Input",
        desc: "생성·점수·배경·입력 매니저"
      },
      {tag: "Store", name: "localStorage", desc: "최고 점수 저장"}
    ],
    decisions: [
      {
        area: "엔진",
        pick: "Phaser 3",
        why: "2D 웹게임 표준·빠른 개발",
        alt: "Canvas 직접(공수 ↑)"
      },
      {
        area: "구조",
        pick: "Scene/Object/System 분리",
        why: "1인 유지보수·확장 용이",
        alt: "단일 파일(스파게티)"
      },
      {
        area: "충돌",
        pick: "스프라이트≠충돌박스",
        why: "208×140 스프라이트에 38×58 바디로 판정 정확화",
        alt: "스프라이트 전체 충돌(부정확)"
      },
      {
        area: "저장",
        pick: "localStorage",
        why: "서버 없이 기록 유지",
        alt: "백엔드(과함)"
      }
    ],
    coreCode: [
      {
        filename: "Player.ts",
        caption: "2단 점프 — 지상/공중 점프 횟수로 제어",
        highlightLines: [3],
        lines: [
          "private jumpCount = 0;",
          "private readonly maxJumps = 2;",
          "jump() { if (this.jumpCount < this.maxJumps) { this.leap(); this.jumpCount++; } }",
          "// 착지 시 jumpCount = 0 으로 리셋"
        ]
      },
      {
        filename: "Player.ts (collision)",
        caption: "큰 스프라이트에서 실제 몸통만 충돌 처리",
        lines: [
          "// 스프라이트 프레임은 208×140, 몸통만 충돌",
          "this.setSize(38, 58);",
          "this.setOffset(85, 36); // 중앙 몸통 영역"
        ]
      }
    ],
    work: [
      {g: "기획", items: ["캠퍼스 러너 코어 루프", "아이템/장애물 설계"]},
      {g: "구현", items: ["2단 점프 컨트롤러", "낮/노을/밤 배경 전환"]},
      {g: "구조", items: ["Scene/Object/System 모듈화", "발판 생성/제거"]},
      {g: "검증", items: ["자동 플레이테스트 하네스", "스크린샷·로그 기록"]}
    ],
    challenges: [
      {
        title: "큰 스프라이트가 실제보다 크게 부딪혔다",
        problem:
          "208×140 캐릭터 스프라이트 전체로 충돌 판정하니, 몸에 안 닿았는데 죽는 억울한 판정이 났다.",
        solution:
          "스프라이트와 충돌 바디를 분리해, 중앙 몸통(38×58)만 충돌하도록 setSize/setOffset을 조정했다.",
        code: {
          filename: "hitbox",
          lines: [
            "this.setSize(38, 58);   // 스프라이트 208×140",
            "this.setOffset(85, 36); // 중앙 몸통만 판정"
          ]
        }
      },
      {
        title: "손으로 반복 테스트하기 어려웠다",
        problem:
          "점프·발판 간격 튜닝을 매번 손으로 플레이해 확인하기 번거로웠다.",
        solution:
          "플레이를 자동 실행해 스크린샷과 로그(JSON)를 뽑는 플레이테스트 하네스를 만들어, 간격·점프 튜닝을 반복 검증했다."
      }
    ],
    tech: ["TypeScript", "Phaser 3", "Vite"],
    resultScreens: [
      {
        title: "AJOU RUN · PLAY",
        kind: "stats",
        stats: [
          {n: "낮/노을/밤", l: "배경 전환"},
          {n: "2단", l: "점프"},
          {n: "풀링", l: "발판 재사용"},
          {n: "BEST", l: "localStorage"}
        ]
      },
      {
        title: "AJOU RUN · OVER",
        kind: "title",
        titleText: "GAME OVER",
        subText: "BEST SCORE"
      }
    ],
    metrics: [
      {n: "4·4·4", l: "Scene/Obj/Sys 모듈"},
      {n: "2단 점프", l: "조작"},
      {n: "자동", l: "플레이테스트"},
      {n: "1인", l: "전담"}
    ],
    kpt: {
      keep: ["게임을 레이어로 모듈화", "자동 플레이테스트로 튜닝 검증"],
      problem: ["와이어 액션은 비활성(미완)", "사운드/콘텐츠 분량 부족"],
      try: ["리더보드·소셜 공유", "와이어 액션 완성·스테이지 다양화"]
    },
    learning:
      "1인 게임도 Scene/Object/System으로 나누면 유지보수가 완전히 달라졌고, 플레이 감을 ‘느낌’이 아니라 자동 플레이테스트 로그로 검증하니 튜닝이 훨씬 빨라졌다."
  },

  // ════════════════════════════ TSEROF (game · platformer · 팀 · 비공개) ═════
  tserof: {
    tagline: "3D PLATFORMER · UNITY (TEAM)",
    heroImage: {
      src: "/projects/tserof.webp",
      label: "TSEROF 타이틀",
      ratio: "16/9"
    },
    problemShot: {label: "그레이박스 레벨 프로토타입", ratio: "4/3"},
    gallery: [
      {
        src: "/projects/op/tserof-difficulty.webp",
        label: "난이도 선택",
        ratio: "16/9"
      },
      {src: "/projects/op/tserof-stage.webp", label: "스테이지", ratio: "16/9"},
      {
        src: "/projects/op/tserof-feedback.webp",
        label: "유저 피드백 반영",
        ratio: "16/9"
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "잃어버린 아이템을 찾아 스테이지를 클리어하는 3D 플랫포머"
      },
      {k: "왜", v: "이동 조작감과 스테이지 진행감을 동시에 살리고 싶었음"},
      {k: "결과", v: "팀 협업으로 스테이지 선택·잠금 해제·이어하기 구조 완성"},
      {k: "내 역할", v: "부팀장 — 레벨 디자인·장애물/기믹 구현·기획"}
    ],
    demo: {repo: "https://github.com/KimEoJin24/TSEROF"},
    meta: [
      {label: "기간", value: "2023.07 – 2023.11"},
      {label: "팀", value: "5인 팀 프로젝트"},
      {label: "역할", value: "레벨 디자인 · 장애물/기믹 구현 · 기획 · 부팀장"},
      {label: "스택", value: "Unity 2022.3 · C#"},
      {label: "출시", value: "Steam 스토어 출시"},
      {
        label: "비고",
        value: "비공개 저장소 (팀원 소유) · 링크는 접근 제한될 수 있음"
      }
    ],
    heroScreen: {
      title: "TSEROF",
      kind: "title",
      titleText: "TSEROF",
      subText: "▶ START GAME"
    },
    impact: [
      {n: "팀", l: "협업 프로젝트"},
      {n: "다단계", l: "스테이지"},
      {n: "이어하기", l: "진행 저장"}
    ],
    features: [
      {t: "WASD + 2단 점프", d: "조작감 있는 플레이어 컨트롤"},
      {t: "스테이지 잠금 해제", d: "클리어 시 다음 스테이지 오픈"},
      {t: "진행상황 저장", d: "이어하기 지원"},
      {t: "숨겨진 아이템", d: "탐색형 클리어 조건"}
    ],
    problem:
      "3D 플랫포머에서 스테이지 진행감과 탐색 재미를 동시에 살리려면 이동 조작과 스테이지 구조가 잘 맞물려야 하고, 저장·이어하기까지 고려해야 한다.",
    research: {
      quotes: [
        {
          q: "점프 조작이 어색하면 그 게임은 바로 끄게 된다.",
          who: "장르 문제 정의"
        },
        {
          q: "Unity .unity 씬 파일은 머지가 어려워 팀 협업 시 충돌이 잦다.",
          who: "협업에서 마주친 문제"
        }
      ]
    },
    hypothesis:
      "“정확한 2단 점프 컨트롤 + 스테이지 잠금/저장을 갖추고, 씬을 분리해 작업을 나누면 — 조작감·진행감을 살리면서 팀 머지 충돌도 줄일 수 있다.”",
    process: [
      {t: "기획", d: "레벨 구성"},
      {t: "컨트롤러", d: "이동·점프"},
      {t: "스테이지", d: "잠금 해제"},
      {t: "저장", d: "이어하기"},
      {t: "빌드", d: "PC"}
    ],
    architecture: [
      {tag: "Input", name: "Player Controller", desc: "이동·2단 점프"},
      {tag: "Flow", name: "Stage Manager", desc: "선택·잠금 해제·전환"},
      {tag: "Save", name: "Progress Save", desc: "클리어·이어하기"},
      {tag: "Git", name: "Team Workflow", desc: "씬 분리로 머지 충돌 최소화"}
    ],
    decisions: [
      {
        area: "접지 판정",
        pick: "발 4방향 레이",
        why: "가장자리에서만 정확히 접지로 잡힘",
        alt: "코요테 타임(공중 점프 부작용)"
      },
      {
        area: "스테이지",
        pick: "잠금 해제식",
        why: "진행감 부여",
        alt: "전면 개방(동기 ↓)"
      },
      {
        area: "저장",
        pick: "직렬화 저장",
        why: "구조적 진행 저장·디버그",
        alt: "PlayerPrefs(구조 빈약)"
      },
      {
        area: "협업",
        pick: "씬 분리",
        why: "머지 충돌 최소화",
        alt: "단일 씬(충돌 ↑)"
      }
    ],
    coreCode: [
      {
        filename: "ForceReceiver.cs",
        caption:
          "접지를 한 점이 아니라 발 4방향으로 검사 — 가장자리 점프 씹힘 해결",
        highlightLines: [2, 3, 4, 5, 9],
        lines: [
          "Ray[] rays = new Ray[4]",
          "{",
          "  new Ray(transform.position + transform.forward * 0.25f + Vector3.up * 0.01f, Vector3.down),",
          "  new Ray(transform.position - transform.forward * 0.25f + Vector3.up * 0.01f, Vector3.down),",
          "  new Ray(transform.position + transform.right   * 0.25f + Vector3.up * 0.01f, Vector3.down),",
          "  new Ray(transform.position - transform.right   * 0.25f + Vector3.up * 0.01f, Vector3.down)",
          "};",
          "",
          "for (int i = 0; i < rays.Length; i++)",
          '  if (Physics.Raycast(rays[i], maxDistance, LayerMask.GetMask("Ground")))',
          "  { if (!isGrounded) EnterGround(); return; }"
        ]
      },
      {
        filename: "FileDataHandler.cs",
        caption:
          "세이브 파일을 XOR로 난독화 — 메모장으로 열어 고치는 것만 막는 수준",
        highlightLines: [4],
        lines: [
          "private string EncryptDecrypt(string data) {",
          '  string modifiedData = "";',
          "  for (int i = 0; i < data.Length; i++)",
          "    modifiedData += (char)(data[i] ^ _encryptionCodeWord[i % _encryptionCodeWord.Length]);",
          "  return modifiedData;",
          "}"
        ]
      }
    ],
    work: [
      {g: "제어", items: ["이동·2단 점프 컨트롤러", "4방향 레이 접지 판정"]},
      {g: "스테이지", items: ["선택·잠금 해제 시스템"]},
      {
        g: "저장",
        items: ["진행상황 직렬화·이어하기", "XOR 저장 데이터 난독화"]
      },
      {g: "협업", items: ["씬 분리 작업 구조"]}
    ],
    challenges: [
      {
        title: "같은 씬을 여럿이 건드려 머지 충돌이 잦았다",
        problem:
          "Unity .unity 씬 파일은 머지가 어려워 협업 시 충돌이 빈번했다.",
        solution:
          "스테이지를 씬/프리팹 단위로 분리하고 담당을 나눠, 한 파일을 동시에 만지지 않는 작업 규칙을 세웠다."
      },
      {
        title: "발판 가장자리에서 점프가 씹혔다",
        problem:
          "접지 판정을 발밑 한 점으로만 봐서, 발이 발판 끝에 걸친 상태에서는 땅으로 인식되지 않아 점프가 무시됐다.",
        solution:
          "코요테 타임을 먼저 시도했지만 공중에서도 점프가 나가는 부작용이 있어 뺐다. 최종적으로는 접지 레이를 앞·뒤·좌·우 4방향(±0.25)으로 늘리고 Ground 레이어만 검사해, 한 방향이라도 닿으면 접지로 처리했다."
      }
    ],
    tech: ["Unity 2022.3", "C#"],
    resultScreens: [
      {
        title: "TSEROF · STAGE",
        kind: "cards",
        cards: [
          {l: "Stage 1", sub: "클리어"},
          {l: "Stage 2", sub: "클리어"},
          {l: "Stage 3", sub: "진행중"},
          {l: "Stage 4", sub: "잠김"}
        ]
      },
      {
        title: "TSEROF · PLAY",
        kind: "stats",
        stats: [
          {n: "다단계", l: "스테이지"},
          {n: "숨은", l: "아이템"},
          {n: "2단", l: "점프"},
          {n: "이어하기", l: "저장"}
        ]
      }
    ],
    metrics: [
      {n: "팀", l: "협업"},
      {n: "다단계", l: "스테이지"},
      {n: "이어하기", l: "저장 지원"},
      {n: "Unity", l: "2022.3"}
    ],
    kpt: {
      keep: ["4방향 접지 판정으로 조작감 개선", "씬 분리로 협업 충돌 최소화"],
      problem: ["스테이지 분량 부족", "밸런싱 시간 부족"],
      try: ["보스 패턴 추가", "리플레이/타임어택"]
    },
    learning:
      "팀 협업에서 ‘기술’만큼 ‘충돌 안 나게 일 나누는 구조’가 중요하다는 걸 배웠다. 그리고 조작감 문제를 시간(코요테 타임)으로 덮으려다 실패하고 나서야, 원인이 판정 위치였다는 걸 알았다."
  }
};
