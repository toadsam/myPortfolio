  festflow: {
    tagline: "REALTIME FESTIVAL OPS · FULL-STACK WEB APP",
    heroImage: {
      src: "/projects/op/festflow-two-faces.webp",
      label: "같은 앱, 역할에 따라 다른 화면",
      ratio: "16/9",
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
        caption:
          "7개 SSE 채널 중 lost-items — 등록·반환 상태가 즉시 전파된다 (표시된 화면은 데이터가 없는 상태)"
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
      {t: "실시간 스트림", d: "혼잡도·부스·공지·분실물·예약·스태프·이벤트 7채널"},
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
        viewBox: [1180, 440],
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
            y: 300,
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
          {from: [470, 205], to: [518, 110], label: "정상", labelAt: [455, 140]},
          {
            from: [470, 250],
            to: [518, 346],
            kind: "dashed",
            label: "꺼짐 · 파일 없음 · 20초 초과",
            labelAt: [330, 350]
          },
          {from: [800, 110], to: [858, 205]},
          {from: [800, 346], to: [858, 250], kind: "dashed"}
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
        title: "혼잡 예측을 붙이면 축제 당일 모델이 서비스를 끌고 내려갈 수 있었다",
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
