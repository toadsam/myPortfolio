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
  // ═══════════════ AI 포트폴리오 마을 (이 사이트 · platform · 개인) ═══════════════
  // 사실 출처: docs/PORTFOLIO_INTERVIEW_STORIES.md(STAR 6편) · docs/VILLAGE_OVERHAUL_REPORT.md
  // (전/후 표) · CLAUDE.md(첫 화면 215.6KB · 87 GLB 20.7MB · 견적 클램프) ·
  // backend/app/services/village_service.py(밝기 규칙). 사용자 수·방문자 수는
  // 계측이 없어 어디에도 적지 않는다 — testimonial · feedbackMap 도 그래서 비어 있다.
  "village-portfolio": {
    tagline: "LIVING PORTFOLIO · NEXT.JS + R3F + FASTAPI (SOLO)",
    // 히어로는 마을 콘셉트 아트(2026-09-04, 본인 선택). 실제 화면 캡처(village.webp)는
    // 갤러리 첫 장으로 내려 "그림"과 "실물"이 둘 다 보이게 한다. 2:1 원본이라
    // ratio 를 맞춰 잘리는 곳이 없게 한다.
    heroImage: {
      src: "/projects/village-portfolio/hero.webp",
      label: "AI 포트폴리오 마을 — 콘셉트 아트",
      ratio: "2/1"
    },
    problemShot: {
      src: "/projects/village-portfolio/admin.webp",
      label: "관리자 페이지 — 오늘의 활동 입력",
      ratio: "16/9"
    },
    gallery: [
      {
        src: "/projects/village-portfolio/village.webp",
        label: "실제 화면 — 3D 마을 광장, 관리자 기록이 건물 불빛으로",
        ratio: "16/9"
      },
      {
        src: "/projects/village-portfolio/atelier.webp",
        label: "의뢰 공방 3D 방 — 식구 4명이 릴레이로 묻는다",
        ratio: "16/9"
      },
      {
        src: "/projects/village-portfolio/resume.webp",
        label: "이력서 화면 — 지금 읽고 있는 이 페이지",
        ratio: "16/9"
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "관리자가 적은 오늘의 활동이 3D 마을의 불빛과 AI NPC 대화로 바뀌는 포트폴리오 사이트 (이 사이트)"
      },
      {
        k: "왜",
        v: "정적 포트폴리오는 갱신이 끊기고, 읽는 사람이 질문할 수 없다"
      },
      {
        k: "결과",
        v: "3D 다운로드 −44% · 첫 화면 3D 모델 20.7MB→0 · 입장 최악 프레임 7,325→233ms"
      },
      {
        k: "내 역할",
        v: "프론트·백엔드·관리자·3D 성능 예산 전부 (1인, Claude Code 와 짝으로)"
      }
    ],
    demo: {live: "/village", repo: "https://github.com/toadsam/myPortfolio"},
    meta: [
      {label: "기간", value: "2026.06 ~ 진행 중"},
      {label: "팀", value: "개인 개발"},
      {
        label: "스택",
        value: "Next.js 16 · React Three Fiber · FastAPI · SQLite · OpenAI API"
      },
      {label: "배포", value: "배포 준비 중 (주소 미정)"},
      {
        label: "AI",
        value:
          "제품: OpenAI NPC(규칙 폴백) · Claude Agent SDK 공방 에이전트 4직군 / 과정: Claude Code 짝 개발"
      }
    ],
    heroScreen: {
      title: "VILLAGE · TODAY",
      kind: "stats",
      stats: [
        {n: "27동", l: "건물 · 각 1명의 안내 NPC"},
        {n: "63", l: "공개·관리자 API"},
        {n: "258", l: "백엔드 테스트"},
        {n: "0", l: "첫 화면 3D 모델"}
      ]
    },
    impact: [
      {n: "−44%", l: "3D 다운로드 54.0→30.3MB"},
      {n: "215 KB", l: "첫 화면 JS · 3D 모델 0개"},
      {n: "233 ms", l: "입장 최악 프레임 (7,325ms에서)"}
    ],
    metricsNote:
      "빌드 산출물 크기와 Playwright 계측(Intel Arc, 1280×800) · 2026.08~09 · 방문자 수는 계측하지 않았다",
    features: [
      {
        t: "활동 → 마을 상태",
        d: "커밋·공부·코딩·운동 기록이 건물 밝기 4단계와 NPC 기분으로"
      },
      {
        t: "AI NPC 대화 + 규칙 폴백",
        d: "OpenAI 로 대사 생성, 키가 없거나 실패하면 규칙 대사로 — 서비스가 멈추지 않는다"
      },
      {
        t: "NPC 관계 사회",
        d: "마주침의 결과는 규칙이 정하고 모델은 대사만 쓴다 · 기억·뒷담화·부탁"
      },
      {
        t: "의뢰 공방",
        d: "식구 4명이 릴레이로 묻는 설문 · 견적은 규칙 기준선의 0.6~1.8× 안에서만"
      },
      {
        t: "이력서 모드",
        d: "채용 담당자용 단일 스크롤 · 3D 없이 별도 라우트"
      },
      {
        t: "성능 예산",
        d: "실광원 풀 고정 · 텍스처 VRAM 실측표 · 배치 정합성 검사 15종"
      },
      {
        t: "직군 에이전트 4명 (Claude Agent SDK)",
        d: "기획·디자인·프론트·백엔드가 실제 파일을 쓴다 · 진행 권한은 사람의 게이트 함수 하나"
      }
    ],
    problem:
      "정적 포트폴리오는 한 번 만들면 갱신이 끊기고, 읽는 사람은 궁금해도 물어볼 수 없다. 활동이 그날그날 화면에 반영되고, 방문자가 건물마다 있는 NPC 에게 물어볼 수 있는 구조가 필요했다. 동시에 첫 화면을 여는 채용 담당자에게 20MB 짜리 3D 를 내려받게 할 수는 없었다.",
    research: {
      quotes: [
        {
          q: "인트로가 살아 있는 마을 위의 오버레이였다. 인트로를 읽으려는 모든 방문자가 87개 GLB(20.7MB)를 내려받았다.",
          who: "설계 메모 (CLAUDE.md · 영어 원문을 옮김)"
        },
        {
          q: "화면 라벨 74개를 숨기자 8.9→42.6fps. 그런데 원복해서 다시 재니 아무것도 안 바꿨는데 47.9fps 였다.",
          who: "마을 오버홀 보고서 §6 · 측정이 나를 속였다"
        }
      ],
      stat: {
        n: "15종",
        l: "커밋 전 배치 정합성 검사 (충돌 0쌍 · 보행 도달 26/26동)"
      }
    },
    hypothesis:
      "“활동이 화면을 바꾸고 방문자가 물어볼 수 있으면 포트폴리오는 살아 있다 — 단, 첫 화면은 3D 한 조각도 싣지 않아야 채용 담당자가 끝까지 읽는다.”",
    process: [
      {t: "마을 배치", d: "육각 방위 원반 섬 · 검사 15종"},
      {t: "데이터 파이프라인", d: "관리자 → village_service → 마을"},
      {t: "NPC 사회", d: "규칙이 결과 · 모델은 대사"},
      {t: "의뢰 공방", d: "릴레이 설문 · 견적 클램프"},
      {t: "성능 예산", d: "광원 풀 · VRAM · 라우트 분리"}
    ],
    architecture: [
      {
        tag: "Frontend",
        name: "Next.js 16 · 3 라우트",
        desc: "/ (0 GLB) · /village (R3F) · /resume"
      },
      {
        tag: "3D",
        name: "React Three Fiber",
        desc: "건물 27동 · 히트박스만 레이캐스트 · 광원 풀"
      },
      {
        tag: "Backend",
        name: "FastAPI · 63 엔드포인트",
        desc: "village_service · chat_service · commission_service"
      },
      {
        tag: "Data",
        name: "SQLite (SQLAlchemy)",
        desc: "DailyActivity · NpcMemory · Commission"
      },
      {
        tag: "AI",
        name: "OpenAI API",
        desc: "NPC 대사 · 견적 초안 — 전부 규칙 폴백 있음"
      },
      {
        tag: "Agents",
        name: "Claude Agent SDK · 공방 3단계",
        desc: "4직군이 산출물을 쓴다 · can_use_tool 샌드박스 · 게이트 테스트 36"
      },
      {
        tag: "Tooling",
        name: "Playwright · pytest",
        desc: "헤드리스 렌더 계측 · 순수 로직 258 테스트"
      }
    ],
    diagrams: [
      {
        title: "활동이 마을이 되는 길",
        viewBox: [1180, 470],
        caption:
          "쓰는 쪽은 관리자(와 의뢰 공방 접수) 뿐이고, 마을·이력서·공방은 읽기만 한다. 규칙(village_service)이 상태를 정하고 모델(chat_service)은 그 위에 말만 얹는다 — 모델이 죽어도 마을은 켜져 있다.",
        groups: [
          {label: "쓰는 쪽", x: 16, y: 40, w: 300, h: 376},
          {label: "FastAPI", x: 400, y: 40, w: 380, h: 376, dashed: true},
          {label: "보는 쪽 (Next.js)", x: 864, y: 40, w: 300, h: 376}
        ],
        nodes: [
          {
            id: "adm",
            label: "관리자 페이지",
            note: "오늘의 활동 · 코딩테스트 · CS 노트",
            x: 34,
            y: 78,
            w: 264,
            h: 76
          },
          {
            id: "gh",
            label: "GitHub 동기화",
            note: "커밋 · repo (토큰 없으면 건너뜀)",
            x: 34,
            y: 190,
            w: 264,
            h: 76
          },
          {
            id: "atl",
            label: "의뢰 공방 접수",
            note: "유일한 외부 쓰기 · 허니팟 · 리밋",
            x: 34,
            y: 302,
            w: 264,
            h: 76
          },
          {
            id: "vs",
            label: "village_service",
            note: "활동 → 건물 밝기 4단계 · NPC 기분",
            x: 420,
            y: 78,
            w: 340,
            h: 84,
            accent: true
          },
          {
            id: "cs",
            label: "chat_service",
            note: "OpenAI 대사 · 실패·무키면 규칙 폴백",
            x: 420,
            y: 196,
            w: 340,
            h: 84
          },
          {
            id: "db",
            label: "SQLite",
            note: "DailyActivity · NpcMemory · Commission",
            x: 420,
            y: 318,
            w: 340,
            h: 76
          },
          {
            id: "vil",
            label: "3D 마을",
            note: "R3F · 87 GLB · 광원 풀",
            x: 882,
            y: 78,
            w: 264,
            h: 76
          },
          {
            id: "res",
            label: "이력서",
            note: "3D 0개 · 215 KB",
            x: 882,
            y: 190,
            w: 264,
            h: 76
          },
          {
            id: "ate",
            label: "공방 3D 방",
            note: "GLB 5종 1.7 MB · 릴레이 설문",
            x: 882,
            y: 302,
            w: 264,
            h: 76
          }
        ],
        edges: [
          {from: [298, 116], to: [420, 116], label: "활동 저장"},
          {from: [298, 228], to: [420, 134], bendX: 360, label: "커밋 수"},
          {from: [298, 340], to: [420, 356], label: "의뢰"},
          {from: [590, 162], to: [590, 196], kind: "double"},
          {from: [590, 280], to: [590, 318], kind: "double"},
          {from: [760, 120], to: [882, 116], label: "밝기 · 기분"},
          {from: [760, 238], to: [882, 228], label: "NPC 대사", kind: "dashed"},
          {from: [760, 356], to: [882, 340], label: "견적 · 진행"}
        ]
      }
    ],
    decisions: [
      {
        area: "첫 화면",
        pick: "3D 없는 별도 라우트",
        why: "인트로를 읽는 모든 방문자가 20.7MB 를 받고 있었다 · hover 때만 마을을 미리 받는다",
        alt: "마을 위 오버레이 인트로 (모두가 3D 다운로드)"
      },
      {
        area: "NPC 대사",
        pick: "OpenAI + 규칙 폴백",
        why: "키가 없거나 호출이 실패해도 NPC 가 답한다 · 실패가 방문자에게 보이지 않음",
        alt: "모델 실패를 그대로 노출"
      },
      {
        area: "클릭 판정",
        pick: "투명 히트박스만 레이캐스트",
        why: "GLB 메시 수천 개를 매 프레임 검사하지 않는다 · 보이지 않는 메시도 판정된다",
        alt: "GLB 메시에 직접 핸들러"
      },
      {
        area: "밤 조명",
        pick: "상주 광원 풀 (개수 고정)",
        why: "광원 개수가 바뀔 때마다 전 재질 셰이더 재컴파일 3초 · 개수가 많은 건 실측상 거의 공짜",
        alt: "가짜 빛으로 개수 줄이기 (화질 희생)"
      },
      {
        area: "견적",
        pick: "규칙 기준선의 0.6~1.8× 클램프",
        why: "모델의 숫자를 그대로 손님에게 보이면 책임질 수 없는 금액이 나간다",
        alt: "모델 견적 신뢰"
      },
      {
        area: "에이전트 권한",
        pick: "진행은 게이트 함수 하나 · 모델은 review 까지",
        why: "'끝까지 가지 마라' 를 프롬프트로 부탁하면 언젠가는 간다 · 순수 함수라 테스트 36개가 잠근다",
        alt: "프롬프트로 자제 요청 (언젠가 어긴다)"
      },
      {
        area: "개발 방식",
        pick: "Claude Code 와 짝 · 계획 승인 뒤 착수",
        why: "판단 기준과 함정을 CLAUDE.md 291줄에 적어 두면 다음 세션이 같은 실수를 안 한다 · 실측·검증은 사람이 쥔다",
        alt: "혼자 전부 (속도 ↓) 또는 AI 에 전권 (검증 ↓)"
      }
    ],
    coreCode: [
      {
        filename: "backend/app/services/village_service.py",
        caption:
          "활동 → 점수 → 밝기 4단계. 규칙이 상태를 정한다 (실제 코드 발췌)",
        highlightLines: [6, 8, 10],
        lines: [
          "commit_score = min(activity.github_commits * 18, 100)",
          "study_score = min(activity.study_minutes // 2 + len(activity.study_topics or []) * 8, 100)",
          "workout_score = min(activity.workout_minutes * 2, 100) if activity.workout_done else 0",
          "",
          "def _light_for_score(score: int) -> str:",
          "    if score <= 0:",
          '        return "dark"',
          "    if score < 35:",
          '        return "dim"',
          "    if score < 75:",
          '        return "normal"',
          '    return "bright"'
        ]
      },
      {
        filename: "src/app/page.tsx",
        caption:
          "hover 때 마을을 미리 받는다 — prefetch 는 라우트 껍질만 가져오므로 씬 청크는 따로 import",
        highlightLines: [2],
        lines: [
          'router.prefetch("/village");',
          'void import("@/components/village/VillageScene");'
        ]
      },
      {
        filename: "src/components/village/LightPool.tsx",
        caption:
          "끄는 것은 intensity 0 이지 visible=false 가 아니다 — three 는 안 보이는 광원을 개수에서 빼서 재컴파일이 되돌아온다",
        highlightLines: [3],
        lines: [
          "if (!slot) {",
          "  // **끄는 것은 intensity 0 이지 visible=false 가 아니다** (위 주석 참고)",
          "  light.intensity = 0;",
          "  continue;",
          "}",
          "light.color.set(slot.req.color);",
          "light.intensity = slot.req.intensity;"
        ]
      },
      {
        filename: "backend/app/agents/runner.py",
        caption:
          "샌드박스는 이 네 줄이 한 세트다 — 하나만 바꾸면 can_use_tool 이 조용히 건너뛰어진다 (실제 코드 발췌)",
        highlightLines: [2, 3, 5, 6],
        lines: [
          "# ↓ 이 네 줄이 세트다. 하나만 바꾸면 경로 검사가 무력화된다(파일 상단 주석 참고).",
          '"permission_mode": "default",',
          '"allowed_tools": list(_ALLOWED_TOOLS),',
          '"disallowed_tools": list(_DISALLOWED),',
          '"can_use_tool": _build_guard(root),',
          '"setting_sources": [],',
          '"max_turns": settings.agent_max_turns,'
        ]
      }
    ],
    work: [
      {
        g: "프론트",
        items: [
          "3 라우트 분리 (첫 화면 0 GLB)",
          "R3F 마을 · 히트박스 픽킹 · 광원 풀"
        ]
      },
      {
        g: "백엔드",
        items: [
          "FastAPI 63 엔드포인트",
          "village_service · NPC 관계 규칙 · 견적 클램프"
        ]
      },
      {
        g: "운영 도구",
        items: ["관리자 배전반 (활동 입력)", "GLB 텍스처 WebP 수술 스크립트"]
      },
      {
        g: "검증",
        items: [
          "pytest 258 (순수 로직)",
          "Playwright 헤드리스 렌더 계측 · 배치 검사 15종"
        ]
      },
      {
        g: "AI 협업",
        items: [
          "Claude Agent SDK 4직군 에이전트 · 게이트 · can_use_tool 샌드박스",
          "개발은 Claude Code 와 짝으로 — 계획 승인 → 실측 → 검증은 사람이 · CLAUDE.md 291줄"
        ]
      }
    ],
    challenges: [
      {
        title: "첫 접속에 빈 하늘만 수 초 — 3D 모델 54MB",
        problem:
          "서빙 GLB 54.0MB 의 8할이 내장 JPEG 텍스처였다. 지오메트리는 이미 Draco 라 더 줄일 게 없었고, 표준 도구는 이 환경에서 깨져 있었다.",
        solution:
          "GLB 를 직접 열어 이미지 청크만 WebP 로 바꿨다(더 작아진 것만 채택). 54.0→30.3MB, A/B 캡처로 화질 차이 없음. VRAM 283MB 는 그대로라는 한계도 적었다.",
        code: {
          filename: "scripts/compress-glb-webp.mjs",
          lines: [
            "// ② 더 작아진 것만 채택",
            "const webp = readFileSync(j.dst);",
            "const bv = json.bufferViews[json.images[j.i].bufferView];",
            "if (webp.length < bv.byteLength * 0.97) replaced.set(j.i, webp);"
          ]
        }
      },
      {
        title: "마을 입장 렉 3초 — 처음 지목한 범인이 틀렸다",
        problem:
          "라벨 74개를 숨기자 8.9→42.6fps 라 라벨을 범인으로 잡았다. 원복하고 다시 재니 47.9fps — 처리 효과가 아니라 시간 효과였다.",
        solution:
          "프레임마다 광원·셰이더 수를 같이 기록하자 원인이 보였다. 광원 개수가 바뀔 때마다 전 재질이 재컴파일된다. 줄이는 대신 광원 풀로 개수를 고정했다(광원 11 · 프로그램 57).",
        perfAfter: true
      },
      {
        title: "첫 화면이 20.7MB 짜리 3D 를 내려받고 있었다",
        problem:
          "인트로가 마을 위 오버레이라, 인트로만 읽는 방문자도 GLB 87개(20.7MB)를 받았다. 우회 세 가지는 구조를 덧대는 것이었고 하나는 첫 화면을 깨뜨렸다.",
        solution:
          "착륙장·마을·이력서를 세 라우트로 갈라 첫 화면엔 three.js 를 싣지 않는다(215.6KB · GLB 0). 마을은 hover 때 prefetch 와 씬 import 두 줄로 미리 받는다.",
        code: {
          filename: "src/app/page.tsx",
          lines: [
            "const prepareVillage = useCallback(() => {",
            '  router.prefetch("/village");',
            '  void import("@/components/village/VillageScene");',
            "}, [router]);"
          ]
        }
      },
      {
        title: "에이전트가 4분 일하고 빈손으로 끝났다",
        problem:
          "SDK 가 권한 응답 채널을 한 번 yield 뒤 닫아 첫 Write 부터 Stream closed. 에이전트는 4분 일하고 '쓰기가 안 됩니다' 라 보고하며 빈손으로 끝났다($0.72).",
        solution:
          "ClaudeSDKClient 로 응답이 끝날 때까지 채널을 유지했다. 같은 부류의 조용한 무력화(permission_mode · allowed_tools · setting_sources)를 한 세트로 잠그고, 읽기도 경로 검사를 태웠다.",
        code: {
          filename: "backend/app/agents/runner.py",
          lines: [
            "async with ClaudeSDKClient(options=options) as client:",
            "    await client.query(prompt)",
            "    async for message in client.receive_response():"
          ]
        }
      }
    ],
    perf: {
      title: "전 → 후 (작을수록 좋음)",
      rows: [
        {label: "3D 다운로드", before: 54.0, after: 30.3, unit: "MB"},
        {label: "첫 화면 3D 모델", before: 20.7, after: 0, unit: "MB"},
        {label: "입장 최악 프레임", before: 7325, after: 233, unit: "ms"}
      ],
      note: "다운로드는 서빙 폴더 실측 · 첫 화면 3D 는 옛 오버레이 인트로가 받던 87 GLB(20.7MB) → 라우트 분리 뒤 0 · 프레임은 Playwright 5초 구간 최악값(예열 40초 뒤)이고, 입장 직후 한 번 남는 3.1초 초기 컴파일은 그대로다"
    },
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "React Three Fiber",
      "FastAPI",
      "SQLAlchemy",
      "SQLite",
      "OpenAI API",
      "Playwright",
      "pytest"
    ],
    resultScreens: [
      {
        // 지어낸 값이 아니다 — 커밋 3 · 공부 60분 · 코딩 90분 · 프로젝트 40분 ·
        // 운동 30분 · 메모 있음을 실제 derive_village_state 에 넣은 출력(2026-09-03 검산).
        title: "LIGHTS · 커밋3 공부60 코딩90 프로젝트40 운동 메모",
        kind: "bars",
        bars: [
          {l: "중앙 광장", p: 100, v: "bright"},
          {l: "프로젝트 건물", p: 58, v: "normal"},
          {l: "기술관", p: 30, v: "dim"},
          {l: "경험 기록관", p: 35, v: "normal"},
          {l: "우체국", p: 50, v: "normal"}
        ]
      },
      {
        title: "BUDGET · FIXED",
        kind: "stats",
        stats: [
          {n: "11", l: "광원 (고정)"},
          {n: "57", l: "셰이더 프로그램"},
          {n: "15/15", l: "배치 검사"},
          {n: "26/26", l: "보행 도달"}
        ]
      }
    ],
    metrics: [
      {n: "−44%", l: "3D 다운로드"},
      {n: "215 KB", l: "첫 화면 JS"},
      {n: "233 ms", l: "최악 프레임"},
      {n: "258", l: "백엔드 테스트"}
    ],
    kpt: {
      keep: [
        "감 대신 실측 — 병목도, 처방의 효과도 숫자로",
        "규칙이 결과를 정하고 모델은 대사만 — 모델이 죽어도 서비스가 산다",
        "AI 는 구조로 통제한다 — 제품에서는 게이트·클램프·폴백, 과정에서는 계획 승인 뒤 착수"
      ],
      problem: [
        "VRAM 283MB 는 그대로 (WebP 는 디코드 후 동일) — KTX2 는 다음 과제",
        "방문자 지표를 계측하지 않아 '누가 얼마나 봤나' 를 말할 수 없다"
      ],
      try: [
        "배포 후 방문 계측 · 이력서 PDF 내려받기 수",
        "UASTC(KTX2) 로 VRAM 4× 절감 — 다운로드 2.5× 증가와 맞바꿀지 실측으로 결정"
      ]
    },
    learningLead:
      "내 측정이 나를 속일 수 있다 — 첫 결론을 그대로 보고했다면 엉뚱한 곳을 고쳤을 것이다.",
    learning:
      "라벨을 범인으로 지목한 첫 측정은 시간 효과였다. 예열 뒤 번갈아 재고, 프레임마다 광원·셰이더 수를 함께 기록한 뒤에야 진짜 원인이 보였다. 그리고 '성능을 위해 화질을 희생한다' 는 통념은 재 보니 이 장면에선 거짓이었다 — 개수가 바뀌는 것이 재앙이고 많은 것은 공짜였다."
  },

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
    learningLead:
      "AI 를 ‘판단 주체’가 아니라 ‘정리 도구’로 제한했을 때 오히려 신뢰가 올라갔다.",
    learning:
      "외부 의존은 반드시 폴백을 두어야 화면이 살아있다는 것도 같이 배웠다."
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
          // 줄을 접어 뒀다. 이 카드가 전폭이 되면 코드가 오른쪽 절반(안쪽 514px)에
          // 들어가는데, 원래 첫 줄은 565px 라 가로 스크롤바가 생겼다.
          lines: [
            "if (!enabled || !Files.exists(script)",
            "    || !Files.exists(model)) return Map.of();",
            "",
            "boolean finished = process.waitFor(",
            "    timeout.toMillis(), MILLISECONDS);  // 20초",
            "",
            "// 비어서 돌아오면 AiCongestionService 가",
            "// fallback(…, MODEL_UNAVAILABLE)"
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
    // 넷 다 코드량이었다(컨트롤러 26 · SSE 7 · feature 24 · 1인). 저장소에서 직접
    // 센 값이라 틀린 건 아니지만, **목록 카드는 「169명 · 424건 · 36건」이라고
    // 말하는데 눌러 들어온 상세가 「컨트롤러 26」이면 카드 쪽이 과장으로 읽힌다.**
    // 게다가 이 프로젝트에서 가장 센 사실은 코드 규모가 아니라 사람이 썼다는 것이다.
    // 코드 규모는 metricsNote 와 아래 구조 절에 그대로 남는다.
    metrics: [
      {n: "169명", l: "AI Match 등록자"},
      {n: "424건", l: "매칭 신청"},
      {n: "36건", l: "성사 매칭"},
      {n: "15명", l: "현장 QA 참여"}
    ],
    metricsNote:
      "2026.05 아주대학교 대동제에서 AI Match 를 1일간 실제 운영한 집계다 — 관리자 화면 실측(활성 프로필 115 / 전체 169명 · 누적 신청 424 · 성사 36)과 현장 QA 참여 15명. 저장소 규모는 따로다: 백엔드 컨트롤러 26 · SSE 채널 7 · 예측 feature 24 (*Controller.java · StreamController.java · congestion_training_profile.json 에서 직접 셌다). 혼잡 예측 모델 정확도는 규칙 기반 0.70 → RandomForest 0.80(macro-F1 0.68 → 0.79)이지만, 운영 경험으로 만든 시뮬레이션 데이터 2,520건 기준이고 실제 축제 데이터로 검증한 값이 아니다.",
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
    learningLead:
      "정확도를 올리는 것보다, 모델이 없을 때 무엇이 남는지를 먼저 정하는 게 서비스에서는 더 급했다.",
    learning:
      "‘실시간’이라고 무조건 WebSocket 이 아니라, 단방향 푸시에는 SSE 를 종류별로 나누는 게 더 단순하고 안정적이었다. 위치 판정도 ‘정확함’보다 ‘현장에서 말이 되는가’가 중요했다."
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
    // before 는 오래 **코드에서 복원한 요약 패널**이었다 — 1.0 캡처가 없었기
    // 때문이다. 발표자료(MuscleUp.pdf p.13~15)의 "화면"은 전부 AI 목업이라 한글이
    // 깨져 있어("목툐, 재형, 종증 투틴") 쓸 수 없었다.
    // 2026-09-04 에 진짜가 생겼다: **배포된 muscle-up.click 이 아직 1.0 이다.**
    // 그 첫 화면을 그대로 찍었고, 화면에 보이는 버튼 두 개와 숫자 셋이
    // frontend/src/pages/Home.tsx @1093e53 (2025-12-03) 의 상수와 정확히 같다 —
    // 복원본이 맞았다는 확인이기도 하다. 브라우저 주소창만 잘라냈다.
    beforeAfter: {
      before: {
        label: "1.0 — 둘러보라고 하는 첫 화면",
        shot: {
          src: "/projects/muscleup/v1/home-1.0.webp",
          label: "1.0 홈 — 배포된 muscle-up.click 실제 화면",
          ratio: "2/1"
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
        "컨트롤러 28개를 8개 도메인으로 묶었다. 크루는 여섯 기능이 컨트롤러 하나에 다 들어 있고, 자랑방은 글과 반응을 둘로 갈랐다 — 같은 저장소 안에 상반된 두 선택이다."
    },
    gallery: [
      // 갤러리는 2열 격자다 — 세로 폰 캡처를 한 칸에 넣으면 그 한 장이 926px
      // 높이가 되어 화면 한 판을 통째로 먹는다. 그래서 데스크톱 캡처와 모바일
      // 캡처를 **한 장 안에** 나란히 놨다(2000×1000, 합성은 배치일 뿐 두 장 다
      // 손대지 않은 실제 화면이다). 모바일은 452px 원본 그대로 — 늘리면 흐려진다.
      {
        src: "/projects/muscleup/v2/lobby-responsive.webp",
        label: "2.0 로비 — 데스크톱과 모바일",
        ratio: "2/1",
        wide: true,
        caption:
          "데스크톱은 「지금 해야 할 일 · 캐릭터 · 라운지」 3열, 모바일은 같은 화면을 세로 한 줄로 접고 「출석하기 · 운동모임」을 화면 아래 고정 바로 내린다. 왼쪽 카드의 연속 출석 2일 · 이번 주 2/7 은 1.0 의 박힌 상수와 달리 그 사람 기록이다."
      },
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
          "“다른 사람들과 더 많이 소통하고 싶어요” 에 대한 답. 캐릭터 위치와 이모트가 실시간 동기화된다 — REST 로는 못 해서 서버를 따로 뺐다."
      },
      {
        src: "/projects/muscleup/v2/character.webp",
        label: "캐릭터 성장 — 레벨 · 티어 · 진화 단계",
        ratio: "6/5",
        caption:
          "“내 운동 데이터를 더 자세히 보고 싶어요” 에 대한 답. 화면의 MASTER·Stage 8·Level 85 가 ERD 의 character_profiles 컬럼 그대로다."
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
        // 예전엔 "1.0 은 기능을 소개하는 랜딩이었다…" 로 시작했다. 그건 **2.0 을
        // 왜 만들었나**지 이걸 왜 만들었나가 아니다. 진짜 동기는 이력서 활동 절에만
        // 있었다 — 헬스 동아리 회장으로 "어떻게 다시 오게 만들까" 를 붙들었고,
        // 헬스장 인포에서 아침마다 그 사용자들을 마주했다. 상세 페이지에서 가장 강한
        // 한 줄이 빠져 있던 셈이라 앞으로 당긴다.
        v: "헬스 동아리 회장으로 “어떻게 다시 오게 만들까”를 붙들고 있었다. 1.0 은 기능을 소개하는 랜딩이었고, 써 본 사람들은 “어디서 뭘 해야 할지 모르겠다”고 했다"
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
        // 예전엔 "아직 안 했다 — 넷 중 유일하게 못 고친 것" 이었다. 그건 고백이지
        // 판단이 아니라, 면접에서 "왜 안 하셨어요?" 에 답이 없었다.
        //
        // 이유를 지어내지 않는다. 실제로는 **방법을 몰라서** 못 했다.
        // 대신 지금은 원인을 안다 — AiService 는 OpenAI 를 세 군데서 부르는데
        // 전부 요청 본문에 stream 이 없고 BodyHandlers.ofString 으로 응답을
        // 통째로 기다린다. 저장소 어디에도 SSE·스트리밍이 없다.
        // 즉 버튼 하나 고치는 일이 아니라 응답 방식을 바꾸는 일이다.
        //
        // "몰랐다" 에서 끝나면 실력 부족으로 읽히고, "지금은 원인을 안다" 까지
        // 가면 알아낸 사람이 된다. 신입에게는 후자가 훨씬 세다.
        did: "그땐 방법을 몰라 못 했다. 원인은 나중에 알았다 — 응답을 통째로 기다리는 동기 호출이라, 스트리밍으로 바꿔야 하는 일이었다",
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
          "요점은 왼쪽에서 경로가 갈라지는 것 — 자주 바뀌는 상태(위치·채팅)만 Socket.IO 가 받고 나머지는 REST 로 간다. 점선 상자는 내가 만들지 않은 것.",
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
          "@Entity 31개를 도메인별로 묶은 것 — 표·개수·FK 는 코드에서 센 값이다. users 한 곳으로 관계 28개가 모이는 허브라, 탈퇴·권한 변경이 전 도메인에 걸린다.",
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
        // 이 행이 `무상태 ↔ 자체 세션` 이라는 **교과서 답**이었다. 바로 위
        // 트러블슈팅이 "교과서대로 로테이션을 넣었다가 걷어냈다" 는 이야기를 하는데
        // 표에는 그 결론이 없어서, 두 절이 다른 시점의 문서처럼 보였다.
        // 실제로 내린 결정(로테이션 철회 · 클라이언트 single-flight)을 적는다.
        area: "인증",
        pick: "JWT access/refresh · 로테이션은 철회",
        why: "동시 401 이 서로의 토큰을 무효화했다 — 클라이언트 single-flight 로 대체",
        alt: "교과서적 refresh 로테이션(경쟁 상태) · 자체 세션(스케일 ↓)"
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
        filename: "realtime/src/server.ts",
        caption:
          "이동은 올 때마다 보내지 않는다 — 60ms 틱에서 변한 게 있을 때만 한 번. 램프 표의 브로드캐스트/s 가 상한 16.7Hz 에 못 미치는 것도, 사람이 늘수록 그 값이 올라가는 것도 이 게이트 때문이다",
        highlightLines: [10],
        lines: [
          'socket.on("player:move", (payload) => {',
          "  // …좌표 유효성 검사 생략",
          "  const updated = updatePlayerPosition(socket.id, payload.x, payload.y);",
          "  if (!updated) return;",
          '  scheduleBroadcast();            // "보낼 게 있다"고 표시만 한다',
          "});",
          "",
          "let pendingBroadcast = false;",
          "setInterval(() => {",
          "  if (!pendingBroadcast) return;  // 변한 게 없으면 아예 안 보낸다",
          "  pendingBroadcast = false;",
          "  broadcastPlayers();             // lounge:players 로 방 전원에게",
          "}, 60);"
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
          "재발급 때 기존 토큰을 폐기하는 로테이션을 넣었더니, 화면 여러 곳이 동시에 401 을 받는 순간 서로를 무효화해 멀쩡히 쓰던 사용자가 로그아웃됐다. 보안 장치가 서비스를 끊은 것이다.",
        solution:
          "서버 로테이션을 되돌리고, 클라이언트에서 재발급을 한 번만 내보내게 했다(single-flight — refreshing 플래그 + 대기 큐). 동시에 만료를 만나도 재발급은 한 번, 나머지는 큐에서 기다렸다 함께 재시도된다. 로테이션이 필요해지면 grace period 나 refresh token family 로 접근할 생각이다.",
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
        // 아래 perf 막대가 이 카드의 증거다. 표시가 없으면 카드 세 장을 전부
        // 지나서 그려져, 실시간 카드가 주장과 근거 사이에 통째로 끼어 있었다.
        perfAfter: true,
        problem:
          "아래 목록 네 곳이 모두 정렬 페이지네이션인데 정렬·필터 컬럼에 인덱스가 없었다. 회원 50명이라 화면에서는 문제가 없다 — 티가 나기 전에 확인해 두는 편이 낫다고 봤다.",
        solution:
          "정렬이 사라지고 인덱스를 거꾸로 훑는 계획으로 바뀐다 — 목록 네 개가 668~2472배. 다만 여기서 멈추면 틀린 결론이다. Page 는 목록과 함께 count 를 날리는데 인덱스가 그걸 못 고친다(57.2 → 57.4ms). 다음 병목은 정렬이 아니라 여기이고, 커서 페이지네이션이나 근사 카운트로 접근할 문제다. 인덱스 넷은 21MB 를 쓴다.",
        code: {
          filename: "EXPLAIN (ANALYZE) — 자랑방 목록 20만 행 · 7회 중앙값",
          lines: [
            "// 인덱스 없음 — 60.2ms",
            "Limit  (cost=14445.15..14446.32 rows=10)",
            "  -> Gather Merge  (rows=166666)",
            "     -> Sort  Sort Key: created_at DESC",
            "        -> Parallel Seq Scan on brag_post   // 20만 행 전부",
            "",
            "// 인덱스 있음 — 0.084ms  (buffers: shared hit=4)",
            "Limit  (cost=0.42..2.44 rows=10)",
            "  -> Index Scan Backward using idx_brag_post_created",
            "",
            "// 그런데 같은 페이지의 count 는 57.2ms -> 57.4ms. 안 변한다."
          ]
        }
      },
      {
        title: "실시간 분리는 했는데, 몇 명까지 버티는지는 안 재 봤다",
        problem:
          "인덱스는 표당 20만 행까지 재 놓고, 정작 이 프로젝트를 대표하는 아키텍처 결정 — 위 가설의 뒤 절반 「서버도 감당 가능하다」 — 은 한 번도 재지 않았다.",
        solution:
          "동시 접속을 25 → 300 으로 올리며 앱이 이미 가진 ping:check 로 왕복 시간을 쟀다. 50명까지 p95 9ms — 회원 전원이 들어와도 여유가 크다. 다만 100명에서 p95 85ms 로 설계 주기 60ms 를 이미 넘는다. 재기 전 내가 짐작한 한계는 훨씬 위였다.\n\n150에서 꺾이고 200부터 무너진다(p95 1.1초). 원인은 구조다 — 매 틱 전원에게 전원 목록을 보내니 바이트가 N² 로 큰다. 다음 병목은 서버가 아니라 페이로드이고, 뷰포트 컬링과 델타 전송이 먼저다.",
        code: {
          filename: "동시접속 램프 — 16초 × 3회 중앙값 (한 대·루프백)",
          lines: [
            "// 명     p50      p95  브로드캐스트/s   서버송신   1인수신  1인당B   CPU",
            "   25     2ms      7ms          6.4    2.7MB/s  110KB/s    795   3.0%",
            "   50     3ms      9ms          7.7   12.2MB/s  250KB/s    795   4.7%",
            "  100     8ms     85ms         11.4   63.3MB/s  648KB/s    795  12.2%",
            "  150    94ms    443ms         12.4  137.4MB/s  938KB/s    796  15.6%",
            "  200   499ms   1115ms         12.7  216.8MB/s 1110KB/s    796  13.5%",
            "  300 51435ms  55818ms         10.0  376.1MB/s 1284KB/s    797  18.9%",
            "",
            "// 1인당 바이트는 795B 고정인데 서버 송신은 140배. 전원 목록을 전원에게 = N^2.",
            "// 무너져도 CPU 는 안 오른다 = 연산이 아니라 송신에서 막힌다.",
            "// 재현: realtime/ 에서 npm run bench (bench/lounge-ramp.mjs)"
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
      {n: "2.0배", l: "목록 페이지 응답 (20만 행 기준)"},
      // `8 × 5 AI 응답 품질 자동 채점` 이 있던 자리다. 트러블슈팅을 3건으로
      // 줄이면서 **그 근거가 본문에서 빠졌고**(의사결정 표 한 줄만 남았다),
      // 지표에만 떠 있으면 확인할 데가 없다. 반대로 동시접속 램프는 이 페이지에서
      // 가장 센 분석인데 3화면 아래 긴 문단 속에 있었다 — 그걸 첫 화면으로 올린다.
      // 처음엔 "100명 p95 50ms" 로 적었는데, 스크립트를 저장소에 넣고 실제로
      // 재 보니 100명은 p95 85ms 로 이미 설계 주기(60ms)를 넘겼다. 짐작이 틀렸다.
      //
      // 그 다음에 "50명 / 동시접속 p95 9ms" 로 고쳤다가 다시 바꾼다. 두 가지가
      // 걸렸다 — (1) 첫 타일이 이미 "약 50명"이라 **같은 숫자가 두 번** 나왔고,
      // (2) 나머지 셋은 「이름 / 숫자」인데 이것만 「숫자가 든 이름 / 조건」으로
      // 방향이 뒤집혀 있었다. 훑는 사람은 "50명 = 회원 수"로 읽고 지나간다.
      //
      // 재서 한계를 찾았다는 것 자체가 이 프로젝트에서 제일 희귀한 대목이라,
      // 자랑이 되는 숫자(9ms) 대신 한계(100명)를 적는다. 근거는 아래 램프 표다.
      {n: "100명", l: "실측한 동시접속 한계"}
    ],
    // 이 숫자들이 원래 12줄짜리 문단 안에 아홉 개가 묻혀 있었다.
    // 막대로 빼면 마지막 줄("한 페이지 전체")이 스스로 논점을 말한다 —
    // 쿼리 막대는 사라지는데 페이지 막대는 3분의 1만 준다.
    perf: {
      rows: [
        {label: "자랑방 목록", before: 60.21, after: 0.08, unit: "ms"},
        {label: "캐릭터 랭킹", before: 58.56, after: 0.05, unit: "ms"},
        {label: "공유 인증 관리", before: 45.45, after: 0.07, unit: "ms"},
        {label: "프로그램 신청", before: 56.87, after: 0.02, unit: "ms"},
        {
          label: "한 페이지 전체 (목록 + count)",
          before: 117.4,
          after: 57.5,
          unit: "ms"
        }
      ],
      note: "맨 아랫줄이 사용자가 기다리는 시간이다 — 목록 막대는 사라지는데 페이지 막대는 절반에서 멈춘다. 남은 57.5ms 가 인덱스로 못 고치는 count 다. (PostgreSQL 17.4 · 20만 행 · 7회 중앙값)"
    },
    metricsNote:
      // 130자가 넘었다. 지표 넷 바로 아래 — 첫 화면급 자리에서 그 길이는 무겁다.
      // 응답 시간의 측정 조건(20만 행 합성 데이터 · 7회 중앙값 · 실사용 규모에선
      // 차이 없음)은 **그 이야기를 하는 Troubleshooting 두 번째 카드**가 이미
      // 본문과 EXPLAIN 으로 다 말한다. 여기서는 출처만 밝힌다.
      "회원 수는 본인 집계 · 피드백 4건은 1.0 발표자료 p.24 원문 · 응답 시간과 동시접속은 저장소의 스크립트로 다시 잴 수 있다 (backend/sql/bench · realtime/bench · 순서는 docs/BENCHMARKS.md)",
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
        "2.0 · 느린 쪽을 고치기 전에 재 봐야 한다 — 정렬을 700배 줄여도 페이지는 2.0배만 빨라졌다(count 가 남아서)"
      ]
    },
    learningLead:
      "사람이 다시 오게 만드는 건 기능 개수가 아니라 첫 화면이 무엇을 시키느냐였다.",
    learning:
      "1.0 에서는 「만드는 법」을 배웠다 — 배포·인증·인코딩처럼 안 되면 아무것도 안 되는 것들. 2.0 에서는 그게 다가 아니라는 걸 배웠다. 사용자 넷이 남긴 말 중 셋이 기능이 아니라 「동선과 관계」에 대한 것이었고, 고친 것도 그쪽이었다."
  },

  // ════════════════════════════ ACLUB / AjouClub FE (platform · 팀) ══════════
  aclub: {
    tagline: "CLUB DISCOVERY · FE 3 → 2026 PROJECT LEAD",
    // 예전 히어로(`aclub.webp`)는 **2025 옛 사이트**(ACM 로고, 소학회 카테고리
    // 상단 배치)였다. 내가 총괄한 2026 디자인이 페이지에 한 장도 없었던 셈이다.
    // 2026 사이트는 폰 폭 앱이라 캡처가 세로로 길다 — 세 장을 한 장(16/9)에
    // 합성한다. 만드는 법: `scripts/build-aclub-screens.mjs`(원본은 리포 밖).
    // 2025 화면은 페이지에서 뺐다. GitHub (2025 · 팀원) 링크가 그 몫이다.
    heroImage: {
      src: "/projects/aclub-2026-screens.webp",
      label: "2026 실제 화면 — 홈 · 모집공고 목록 · 모집공고 상세",
      ratio: "16/9"
    },
    problemShot: {label: "에타·인스타·단톡에 흩어진 동아리 모집", ratio: "4/3"},
    // Troubleshooting 두 카드(중복 fetch · 흩어진 권한 체크)가 끝나는 자리다.
    // 예전엔 여기가 빈 점선 상자였다 — 문제 둘을 말해 놓고 "그래서 어떻게
    // 됐는데" 를 안 보여 주고 결론으로 넘어갔다는 뜻이다.
    //
    // 스크린샷이 아니라 그림인 이유: 이 프로젝트가 고친 건 **화면에 안 보이는
    // 구조**다. "훅으로 모았다"를 캡처로 증명할 방법이 없다. 대신 이 페이지의
    // THE CORE TAKEAWAY("같은 데이터를 어떻게 한 번만 정의해 재사용할까")를
    // 그림이 그대로 받는다.
    //
    // 그림에 적힌 이름은 전부 이 파일이 이미 주장하는 것뿐이다 —
    // architecture(커스텀 훅 · axios 모듈 4) · challenges(중복 fetch · 권한
    // 분기) · research.stat(훅 6+). 새로 지어낸 이름은 없다.
    resultShot: {
      src: "/projects/op/aclub-hooks.svg",
      label: "화면마다 따로 → 한 번 정의해 재사용",
      ratio: "21/9",
      fit: "contain",
      // 캡션은 그림이 말하지 않는 것만 적는다 — 그림 안 부제가 이미 "무엇을
      // 어떻게 모았나" 를 말하므로, 여기는 **그 이름들이 어디서 왔는지**(저장소
      // 실측)만. 예전엔 부제·이 캡션·SVG 발치 줄이 같은 문장 세 벌이었다.
      caption:
        "그림의 이름은 전부 저장소 실측이다 — 도메인 커스텀 훅 6+ · 보호 라우트 2(RequireAuth · AdminRoute) · axios 모듈 4(auth · club · recruitment · user)."
    },
    gallery: [
      // ⚠️ 이 갤러리의 비율은 **원본 픽셀 그대로** 적는다. 셋 다 16/10 으로
      //    적어 두었더니 cover 가 상자에 맞추려고 잘라낸 것이 하필 근거였다 —
      //    GA4 캡처가 940×338(2.78:1) 이라 좌우 42% 가 날아가면서 숫자가
      //    끊겼다. 새 그림을 넣을 땐 ratio 에 그 파일의 실제 크기를 쓸 것.
      //
      // ── GA4 두 장을 쓰는 이유 ─────────────────────────────────────────
      // 예전 `aclub-analytics.webp` 한 장은 **2025 가 섞인 누계**(조회수 6.7만 ·
      // 활성 사용자 7.8천)였다. 위 타일은 2026 단독(3,500 · 8.8만)이라, 같은
      // 이름의 지표가 두 값으로 나란히 놓여 있었다 — 심사자가 확대 한 번이면
      // 마주치는 모순이다. 빼고 아래 둘로 갈았다.
      //
      // 두 장인 건 **한 장으로는 네 타일을 다 못 덮기 때문**이다. 활성 사용자·
      // 조회수는 홈(올해 누계)에, 참여율·세션당 참여 시간은 트래픽 획득
      // 보고서(지난 28일)에 있다. 억지로 한 장에 합치면 없는 화면을 만드는
      // 셈이라, 각자 기간이 찍힌 원본 그대로 둔다. metricsNote 가 어느 값이
      // 어느 창인지 밝힌다.
      //
      // 트래픽 획득이 먼저인 건 그게 **규모가 아니라 성격**을 말하기 때문이다 —
      // 3월 첫 주에 몰린 봉우리, Referral+Direct 94%, 검색 3.8%. 이 페이지에서
      // 「1년에 닷새 쓰이는 서비스」라는 이야기의 근거가 그 한 장에 다 있다.
      //
      // ⚠️ 넷 다 반 칸(594px)이다. 한때 이 장과 에타를 `wide: true` 로 폈는데,
      //    글자는 커졌지만 갤러리만 2,100px 이 되어 페이지가 5.2 → 7.7 화면으로
      //    늘었다. 근거를 늘린 것까진 맞았어도 그렇게까지 살 일은 아니었다.
      //    지금은 여섯 장이 2칸 격자에 세 줄로 앉는다. 표 글씨는 0.4배라 그대로는
      //    안 읽히지만, 숫자는 위 타일과 캡션이 이미 말하고 그림은 눌러서
      //    확인하는 물증이다(⤢ 확대). 다시 펼 땐 **둘을 같이** 펴야 격자가
      //    맞는다 — 전폭 하나 + 반 칸 셋이면 마지막 한 장이 혼자 남는다.
      {
        src: "/projects/op/aclub-ga4-channels.webp",
        label: "유입 채널과 트래픽 분포 — GA4 · 2026.02.16–03.15",
        ratio: "1502/840",
        caption:
          "28일 중 세션 5,311건이 사실상 3월 1~5일에 몰렸다. 유입은 Referral 54.8% + Direct 39.3% = 94%, 검색은 3.8%. 동아리 모집은 1년에 한 번이고 학생은 링크를 타고 들어온다 — 이 서비스의 정상 상태다."
      },
      {
        src: "/projects/op/aclub-ga4-home.webp",
        label: "올해 누계 — GA4 · 2026.01.01–03.15",
        ratio: "790/368",
        caption:
          "위 지표 타일의 활성 사용자 3,500과 조회수 8.8만이 나온 화면(2026.01.01–03.15 누계)."
      },
      // Troubleshooting 마지막 카드의 첫 문장("1주 뒤 재방문이 5.4%였다")의
      // 근거다. 원본은 대시보드 한 판이었는데 코호트 표만 잘라 냈다 — 옆 카드들
      // (시간 경과·페이지 제목)은 이 주장과 무관해서, 같이 두면 무엇을 보라는
      // 건지 흐려진다.
      {
        src: "/projects/op/aclub-ga4-cohort.webp",
        label: "주차별 재방문 유지율 — GA4 · 3월 14일에 끝나는 6주",
        ratio: "552/352",
        caption:
          "1주째 5.4% · 2주째 4.3% · 4주째 1.8%. 이 표를 보고 재방문을 끌어올리는 대신, 애초에 한 번 오는 서비스라는 쪽으로 판단을 바꿨다."
      },
      // 캡션이 "기존 모집 채널(에타·카톡)" 이었다. 그런데 이 그림에 실제로
      // 찍혀 있는 건 흩어진 채널이 아니라 **만든 뒤에 직접 알리고 섭외한
      // 기록**이다 — 문제 서술이 아니라 운영 증거다. 캡션이 그걸 말하지
      // 않으면 심사자는 스크린샷 한 장으로만 보고 지나간다.
      // 숫자는 캡처에 찍힌 것만 적는다(공감 60 · 댓글 12 · 스크랩 111).

      // 출시 저녁 두 장(2026-09-04 추가). 위 [LAUNCH] 카드의 근거다 —
      // 섭외 규모는 답장 목록에, 게시 시각·문의→답변은 게시글+댓글 캡처에.
      // 순서: 답장(짧은 카드)이 코호트 옆, 게시글+댓글(긴 카드)이 에타·카톡 옆.
      // 둘 다 세로로 긴 편이라 같은 줄에 두는 게 격자가 덜 삐뚤다.
      {
        src: "/projects/op/aclub-launch-replies.webp",
        label: "출시 저녁 — 회장들의 답장",
        ratio: "1350/626",
        caption:
          "등록을 요청한 동아리 회장들에게서 그날 저녁 답장이 이어졌다. 직함만 남기고 개인 이름과 사진은 가렸다."
      },
      {
        src: "/projects/op/aclub-launch-post.webp",
        label: "출시 저녁 — 에브리타임 게시글 18:44 · 문의 19:08 · 답변 19:41",
        // 위는 게시글, 아래는 그날 댓글 세 줄. 게시글 본문 끝의 안내문은 잘랐다 —
        // 19:41 운영진 답변과 같은 글이라, 둘 다 있으면 하나가 베낀 것처럼 읽힌다.
        // 공감·스크랩 수는 2026-09-04 에 페이지에서 읽은 값(캡처는 없음).
        ratio: "1040/1109",
        caption:
          "사람이 몰리는 저녁 6시대에 올렸고 같은 날 밤 실시간 인기 글 2위. 24분 뒤 「로그인이 안 돼」가 두 건 달렸고, 33분 뒤 운영진 댓글로 「크롬·사파리로 열어 달라」고 답했다 — 에타 앱 안에서 열면 로그인 버튼이 사라지는 문제였다. 2026-09-04 기준 공감 109 · 스크랩 155."
      },
      {
        src: "/projects/op/aclub-eta.webp",
        label: "직접 알리고 섭외한 기록",
        ratio: "1200/796",
        caption:
          "만들어 두고 기다리지 않았다 — 에브리타임에 직접 알려 스크랩 111·댓글 12를 받았고, 동아리 회장에게 등록을 요청해 승낙을 받았다."
      }
      // `aclub-detail.webp`(동아리 상세·저장)를 여기서 뺐다. 네 장이면 2칸
      // 격자에서 마지막 한 장이 혼자 남아 오른쪽 절반이 빈다. 그리고 넷 중
      // 이 한 장만 "기능이 이렇게 생겼다" 인데, 그건 히어로 이미지와 실사이트
      // 링크의 몫이다. 되살리려면 아래를 풀고 `wide: true` 를 붙일 것.
      //   {
      //     src: "/projects/op/aclub-detail.webp",
      //     label: "동아리 상세·저장",
      //     ratio: "1200/743",
      //     caption:
      //       "탐색에서 고른 동아리를 상세에서 확인하고 저장까지 한 흐름으로 잇는 화면."
      //   }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "동아리 탐색·모집을 한 곳에서 하는 플랫폼 프론트엔드 (aClub)"
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
      // Core Summary 의 「내 역할」(직함: 팀원 → 프로젝트장)과 같은 말을 두 번
      // 하고 있었다. 여기는 **맡은 화면과 코드**만 적는다.
      {
        label: "역할",
        value:
          "탐색·필터·상세 화면 · 데이터 훅 · 보호 라우트 (2026 부터 개편 총괄)"
      },
      {
        label: "스택",
        value: "React · TypeScript · Vite · Tailwind · React Router · Axios"
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
        // 예전엔 「FE 설계 관점」 인용이 하나 더 있었다 — 남의 말이 아니라 내
        // 생각을 따옴표에 넣은 것이라 뺐다. 그 내용은 Hypothesis 와
        // Troubleshooting 첫 카드가 이미 말한다.
        {
          q: "동아리 찾으려면 에타·인스타·단톡을 다 봐야 한다.",
          who: "사용자(학생) 관점"
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
      },
      // 「2026 프로젝트장」의 근거. 앞의 두 카드는 2025 팀원 시절이고, 이 페이지
      // 어디에도 총괄로서 한 일이 없었다 — 심사자가 "그래서 장으로서 뭘 했죠"
      // 라고 물으면 답이 없는 구조였다. 여기 적힌 것은 전부 갤러리 캡처에 있다:
      // 에타 게시 시각 18:44 · 실시간 인기 글 · 인앱 브라우저 안내문은
      // aclub-launch-post.webp, 회장들의 답장은 aclub-launch-replies.webp.
      // 답장 수는 적지 않는다 — 화면에 보이는 것보다 많다고 주장할 근거가 없다.
      // 문의 시각(19:08 댓글 → 19:41 운영진 답변)은 댓글창 캡처에서 읽은 것이다.
      // 그 캡처는 리포 밖(채팅으로만 받음)이라 갤러리에는 없다.
      {
        title: "2026 — 만들어 두면 쓰일 줄 알았다",
        problemLabel: "[LAUNCH]",
        solutionLabel: "Action",
        problem:
          "개편을 끝낸 3월, 사이트는 있었지만 안에 아무것도 없었다. 모집공고는 회장이 올려야 생기고, 학생은 링크가 있어야 들어온다. 프로젝트장으로서 맡은 건 코드가 아니라 이 두 줄을 채우는 일이었다.",
        solution:
          "동아리 회장 전원에게 직접 연락해 등록을 요청하고, 백엔드 팀원과 출시 일정을 맞췄다. 에브리타임 글은 사람이 몰리는 저녁 6시대에 올리고(03/03 18:44) 카톡·인스타로 같이 알렸다 — 그날 밤 실시간 인기 글에 올랐고, 회장들의 답장이 줄지어 왔다.\n\n문의도 직접 받았다. 올린 지 24분 만에 「로그인이 안 돼」 댓글이 달렸다 — 에타 앱 안에서 링크를 열면 로그인 버튼이 사라지는 문제였다. 원인을 파는 대신 33분 뒤 운영진 댓글로 「크롬·사파리로 열어 달라」 안내를 먼저 달고, 게시글 본문에도 붙였다. 출시 저녁엔 고치는 것보다 쓰게 하는 게 먼저였다. 그 링크로 들어온 유입이 28일 세션의 94%다."
      },
      // 앞의 둘은 **만들면서 깨진 것**, 셋째는 **내놓은 날 한 것**이고, 이건 **배포한 뒤에 사용자가
      // 예상과 다르게 쓴 것**이다. 결이 달라서 마지막에 둔다 — 심사자가 여기까지
      // 읽었다면 「무엇을 만들었나」는 이미 알고, 다음 질문은 「그래서 그게
      // 쓰이던가」다.
      //
      // 효과 수치를 일부러 안 쓴다. 동아리별 상세 페이지가 GA4 에서 제목
      // 하나("a Club")로 뭉쳐 잡혀 조회 분포를 뽑을 수 없고, 개편 전 기간은
      // 트래픽이 사실상 0이라 비교할 「전」이 없다. 관찰·해석·조치까지만
      // 사실로 쓰고 결과는 주장하지 않는다.
      //
      // 여기 적힌 숫자는 전부 갤러리 캡처에 찍혀 있다 —
      // 코호트 5.4%/1.8% 는 aclub-ga4-cohort.webp,
      // 세션 5,311 과 채널 94% 는 aclub-ga4-channels.webp.
      {
        title: "1주 뒤 재방문이 5.4%였다",
        // [PROBLEM]/Solution 틀에 넣으면 "고쳤다" 로 읽히는데, 여기서 한 일은
        // **안 고치기로 판단한 것**이다. 라벨만 바꾸고 자리는 그대로 둔다.
        problemLabel: "[OBSERVATION]",
        solutionLabel: "Decision",
        problem:
          "GA4 코호트에서 1주 유지율이 5.4%, 4주 뒤엔 1.8%였다. 보통이면 재방문을 끌어올릴 궁리를 한다. 그런데 28일 세션 5,311건이 사실상 3월 1~5일 닷새에 몰려 있었고, 유입의 94%가 Referral·Direct — 에브리타임과 인스타그램 링크였다.",
        solution:
          "동아리 모집은 1년에 한 번이고, 학생은 동아리를 정하고 나면 돌아올 이유가 없다. 낮은 재방문은 실패가 아니라 이 서비스의 정상 상태였다.\n\n목표를 재방문이 아니라 「그 닷새 안에 원하는 동아리를 찾게 하는 것」으로 잡고, 분야 카테고리를 쪼개 필터를 조합할 수 있게 했다. 2025에 도입하고, 2026에 총괄을 맡으면서 한 번 더 세분화했다."
      }
    ],
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "TailwindCSS",
      "React Router",
      "Axios"
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
    // 네 값의 출처가 **GA4 화면 두 개**다. 예전엔 `2026.01–03` 한 줄로
    // 뭉뚱그렸는데, 앞의 둘은 75일 누계고 뒤의 둘은 28일 값이다. 갤러리에
    // 두 캡처를 나란히 붙여 놓고 기간을 안 밝히면, 확대해 본 심사자가
    // 「어느 게 맞는 숫자냐」에서 멈춘다. 길어도 어느 값이 어느 창인지 적는다.
    //
    // 2025 를 합치면 활성 사용자가 7.8천으로 커지지만 그 해엔 프론트 3인 중
    // 하나였다. 총괄로 맡은 구간만 끊어 세는 편이 숫자는 작아도 주장은 정확하다.
    metricsNote:
      "Google Analytics 4 — 활성 사용자·조회수는 2026.01.01–03.15 누계, 세션 참여율·세션당 참여 시간은 그중 마지막 28일(02.16–03.15) 값이다. 트래픽이 3월 첫 주에 몰려 있어 두 창의 값은 사실상 같다. 2025 팀원 시절은 합산하지 않았다.",
    kpt: {
      keep: [
        "데이터 요청을 훅으로 모은 것",
        "보호 라우트로 권한 일원화",
        "공통 컴포넌트 재사용"
      ],
      problem: ["디자인 시스템이 후반에 정리됨", "테스트 부족"],
      try: ["백엔드 연동 안정화", "검색 고도화"]
    },
    // 예전 결론은 "커스텀 훅과 보호 라우트가 그 답이었다" 였다. 그게 이 페이지의
    // 마지막 문장인 게 문제였다 — 훅으로 요청을 모으고 라우트로 권한을 막는 건
    // React 를 반 년 쓴 사람이면 하는 일이라 변별력이 없는데, 정작 이 페이지
    // 맨 위에는 「3,500 명이 쓴다」와 「프론트 3인 중 1인 → 프로젝트장」이라는
    // 훨씬 희소한 사실이 적혀 있었다. 심사자는 "총괄로 뭘 했지" 를 묻고 끝까지
    // 읽지만, 답이 훅이었다.
    //
    // 게다가 이력서 첫 화면의 주제문은 「만들고 끝내지 않고, 쓰는 사람 말을 듣고
    // 고치는」이다. 대표 프로젝트의 결론이 그 주제문과 다른 이야기를 하고 있었다.
    learningLead: "지표가 나쁘다고 다 고칠 일은 아니었다.",
    learning:
      "재방문율은 낮았지만 그건 1년에 한 번 쓰는 서비스의 정상 상태였다. 고칠 것은 재방문이 아니라 그 닷새 안의 탐색이었다."
  },

  // ════════════════════════════ 아주총학 / ajouchong-web (platform · 팀) ══════
  ajouchong: {
    // 2026-09-04 사실 대조(저장소·실서비스 API 기준)로 다시 썼다.
    //   · 2025: 프론트 3인 중 한 명, 화면 일부(대여사업 검색창·정책집·조직도). 백엔드는 안 만졌다.
    //   · 2026.04~: 혼자 맡았다. 프론트 org 저장소 develop 에 23개 커밋(PR #35 대여 UX·피드백,
    //     #36 전면 디자인 개편), 백엔드 org 저장소 develop 에 RentalItem·RentalRecord·Link
    //     엔티티/서비스/컨트롤러(PR #69·#70). 프론트 main 브랜치엔 2025 것만 있으니
    //     링크는 PR 로 건다 — 심사자가 main 만 보면 2026 작업을 못 찾는다.
    //   · "안내 봇"은 봇이 아니다. 퀵 메뉴 5개 + 의견 폼(Q&A API). LLM 없음. 그렇게 적는다.
    //   · 학생은 온라인으로 예약하지 않는다. 학생 화면은 수량 조회만, 대여·반납 기록은
    //     관리자가 남긴다. "예약"이라 쓰면 사이트에서 확인하는 순간 어긋난다.
    //   · 실서비스(2026-09-04 공개 API): 대여 품목 10종 124개, 링크허브 링크 11개.
    tagline: "STUDENT COUNCIL · 2025 FRONT MEMBER → 2026 SOLE MAINTAINER",
    heroImage: {
      src: "/projects/ajouchong.webp",
      label: "총학생회 메인",
      ratio: "16/9"
    },
    // 학생들은 폰으로 본다. 그런데 2025 모바일은 주요 메뉴가 햄버거 안에만
    // 있었다 — 「정보 탐색 효율 개선」이라고 적어만 두고 근거가 없던 그 지점이다.
    problemShot: {
      src: "/projects/ajouchong/v2/mobile-before.webp",
      label: "2025 모바일 — 메뉴가 햄버거 안에만 있었다",
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
        note: "소개·소식·소통·자료실·학생복지·ACENTIA(아주대 축제)를 아이콘 카드로 히어로 바로 밑에 놨다. 메뉴 구조를 바꾼 게 아니라 안 눌러도 보이게 한 것이다."
      }
    },
    gallery: [
      // ── 2026.04 개편 이후 ──
      // 공통점: 전부 **총학생회가 직접 고치는 화면**이거나 **학생이 오기 전에 보는 화면**이다.
      // 2025 때는 물품 수량 하나 바꾸려 해도 개발자가 배포해야 했다.
      {
        src: "/projects/ajouchong/v2/rental.webp",
        label: "대여사업 — 남은 수량을 오기 전에",
        ratio: "21/10",
        caption:
          "총 품목·대여 가능·재고 임박·최종 업데이트를 한 줄에 세우고, 품목마다 남은 수량을 막대로 보여 준다. 총학생회실 문 앞에서 「남아 있어요?」를 묻던 학생이 오기 전에 알 수 있게 한 화면. 대여·반납 기록은 창구에서 관리자가 남긴다."
      },
      {
        src: "/projects/ajouchong/v2/rental-admin.webp",
        label: "대여 물품 관리 — 운영자가 직접",
        ratio: "21/10",
        caption:
          "수량 옆 −/+ 로 바로 조정하고 「35 (변경됨)」처럼 저장 전 상태를 표시한다. 확인 대화상자로 한 번 더 묻고, 서버는 0 미만·총량 초과를 거부한다 — 실수로 재고가 틀어지면 학생이 헛걸음한다."
      },
      {
        src: "/projects/ajouchong/v2/linkhub.webp",
        label: "링크허브 — 인스타 프로필 링크 한도를 우회",
        ratio: "16/10",
        caption:
          "인스타그램 프로필에는 링크를 몇 개밖에 못 걸어, 접수 폼이 새로 생길 때마다 뭔가를 내려야 했다. 프로필엔 이 페이지 하나만 걸고, 안에서 접수 창구·공모전·수요조사 링크 11개를 모아 보여 준다. 링크는 관리자 화면에서 총학생회가 직접 넣고 뺀다."
      },
      {
        src: "/projects/ajouchong/v2/chatbot.webp",
        label: "홈페이지 도우미 — 퀵 메뉴 + 의견 접수",
        ratio: "21/10",
        caption:
          "챗봇이 아니다. 공지·대여사업·제휴복지·Q&A·건의 다섯 갈래로 보내는 버튼과, 그래도 못 찾으면 의견을 남기는 폼이다. 의견은 Q&A API 로 들어가 관리자 화면에 쌓인다."
      }
      // 피드백 관리 화면(빈 화면 — "접수된 피드백이 없습니다")과 2025 공지 상세(44대
      // 퇴임사 글, 본인 작업이 안 보임)는 2026-09-04 에 뺐다. 증거가 아니라 자리 채움이었다.
    ],
    // 이 이력서에서 **「내가 맡은 뒤 좋아졌다」를 숫자로 보여 주는 유일한 자리**다.
    //
    // 반드시 **같은 달끼리** 비교한다. 대학 사이트는 학기 주기가 커서(방학에 반토막)
    // 단순 전후 비교는 계절을 개선으로 착각하게 만든다. 개편 시점(2026.04) 기준
    // 전/후로 자르면 335일 vs 152일에 계절도 달라 아무 말도 못 한다.
    //
    // 제목의 「참여 → 단독」은 시점 충돌을 막는 말이다. 예전 제목 "맡기 전 → 맡은 뒤"는
    // 기간(2025.03~)·역할(2025 프론트)과 부딪혔다 — 2025년에도 팀에 있었으니까.
    //
    // note 에서 CTR 하락을 **먼저** 밝힌다. 숨기면 심사자가 직접 계산해서 찾아내고,
    // 그때는 나머지 숫자까지 같이 의심받는다. 밝히고 이유를 대면 지표를 읽을 줄
    // 안다는 증거가 된다.
    perf: {
      title:
        "팀원으로 참여한 2025 → 혼자 맡은 2026 · 같은 달 검색 노출 (GSC 실측)",
      lowerBetter: false,
      rows: [
        {label: "5월", before: 839, after: 2371, unit: ""},
        {label: "6월", before: 571, after: 1233, unit: ""},
        {label: "7월", before: 490, after: 843, unit: ""},
        {label: "8월", before: 390, after: 945, unit: ""}
      ],
      note: "Google Search Console 내보내기 487일치(2025-05-01~2026-08-30) 실합계. 계절성을 빼려고 2025년과 2026년의 같은 달만 맞대 놨다. 4개월 합계로 노출 2,290 → 5,392(×2.35), 클릭 321 → 491(×1.53). CTR 은 14.0% → 9.1% 로 내려갔는데, 노출이 넓어지면 덜 관련된 검색어에도 뜨기 시작해 분모가 먼저 커진다 — 클릭 절대수는 늘었다. 늘어난 이유를 개편만으로 돌릴 수는 없다(행사·외부 링크·검색 알고리즘). 확실한 건 시점뿐이다: 2026년 4월부터 이 사이트를 혼자 맡았다."
    },
    // 이 넷만 읽고 나가는 심사자가 있다. 요약·본문·결론이 같은 프로젝트를 말해야 한다 —
    // 예전엔 요약은 2차, 본문(가설·트러블슈팅·결정표)은 전부 2025 얘기였다.
    tldr: [
      {
        k: "무엇을",
        v: "아주대 총학생회 공식 웹 — 2025년엔 프론트 3인 중 한 명, 2026년부터 혼자 맡아 UI 전면 개편 · 대여사업 · 링크허브 · 관리자 화면을 프론트부터 API까지"
      },
      {
        k: "왜",
        v: "학생은 물품이 남았는지 몰라 총학생회실까지 왔고, 인스타 프로필엔 링크를 몇 개밖에 못 걸었고, 수량 하나 고치는 데도 개발자가 필요했다"
      },
      {
        k: "결과",
        v: "학생은 오기 전에 수량을 보고, 총학생회는 수량·링크·의견을 관리 화면에서 직접 고친다 — 품목 10종 · 링크 11개가 실서비스에서 돌아가는 중"
      },
      {
        k: "내 역할",
        v: "2025 프론트 화면 일부 → 2026 단독: React 화면 + Spring Boot API(대여·링크·권한) + 배포"
      }
    ],
    demo: {
      live: "https://ajouchong.com",
      // 실서비스는 조직 저장소다(본인 확인). 개인 포크가 아니라 이쪽을 건다.
      // 2026 작업은 main 이 아니라 develop 에 있다 — PR 링크는 resume.ts links 에.
      repo: "https://github.com/ajouchong-dev/ajouchong-web"
    },
    meta: [
      // 목록 카드(resume.ts)와 **같은 값이어야 한다**.
      {label: "기간", value: "2025.03 ~ 진행 중"},
      {label: "팀", value: "2025 프론트 3인 → 2026 단독 담당"},
      {
        label: "역할",
        value:
          "2025 프론트 화면 일부 → 2026 UI 전면 개편 · 대여사업 · 링크허브 · 관리자 화면 · 백엔드 API"
      },
      {
        label: "스택",
        value:
          "React 18 · CRA · React Router · Spring Boot 3 · JPA · PostgreSQL · JWT · Docker · Nginx"
      },
      {label: "배포", value: "Docker + Nginx · 이미지는 S3 (실서비스 구성)"}
    ],
    heroScreen: {
      title: "ajou-council",
      kind: "feed",
      feed: [
        "[대여] 매트 돗자리 28/35",
        "[링크허브] 접수 창구 11개",
        "[공지] 총회 일정 안내",
        "[의견] 도우미로 접수"
      ]
    },
    // Search Console 실측. 라벨에 **"검색"** 을 반드시 남긴다 —
    // 전체 방문자로 읽히면 과장이 된다.
    // 값의 출처와 옛 값을 버린 이유는 resume.ts 의 같은 지표 주석에 적어 뒀다.
    impact: [
      {n: "12,314", l: "검색 노출"},
      {n: "1,694", l: "검색 클릭"},
      {n: "13.8%", l: "검색 CTR"}
    ],
    features: [
      {t: "대여사업", d: "품목별 남은 수량 · 관리자 −/+ · 대여/반납 기록"},
      {t: "링크허브", d: "접수 폼·공모전 링크 모음 · 관리자가 직접 편집"},
      {t: "관리자 화면", d: "대여·링크·공지·피드백 · ADMIN 권한만"},
      {t: "공지·Q&A·자료실", d: "2025 구조 위에 UI 전면 개편"}
    ],
    problem:
      "학생은 물품이 남았는지 몰라 총학생회실까지 와서야 없다는 말을 들었고, 인스타 프로필에는 링크를 몇 개밖에 못 걸어 접수 폼·공모전 링크가 매번 밀려났다. 사이트는 있었지만 수량 하나, 링크 하나 바꾸는 데도 개발자가 배포해야 했다.",
    research: {
      quotes: [
        {
          q: "물품이 남았는지 몰라 총학생회실까지 와서야 없다는 말을 듣는 학생이 많았다.",
          who: "생활복지국원으로 창구에서 본 것"
        },
        {
          q: "인스타 프로필에는 링크를 몇 개밖에 못 건다 — 접수 폼이 새로 생길 때마다 뭔가를 내려야 했다.",
          who: "소통개발국 운영에서 마주친 문제"
        }
      ],
      stat: {
        n: "10 · 11",
        l: "실서비스 대여 품목 · 링크허브 링크 (2026.09 공개 API 기준)"
      }
    },
    hypothesis:
      "“학생이 오기 전에 수량을 볼 수 있고, 총학생회가 개발자 없이 수량·링크·의견을 직접 고칠 수 있으면 — 헛걸음이 줄고, 사이트는 개발자가 떠나도 살아 있다.”",
    process: [
      {t: "2025", d: "프론트 화면 일부"},
      {t: "UI 개편", d: "모바일 6갈래"},
      {t: "대여사업", d: "API + 화면"},
      {t: "링크허브", d: "Link 테이블 + 관리"},
      {t: "관리자", d: "ADMIN 권한"},
      {t: "배포", d: "Docker · Nginx"}
    ],
    architecture: [
      {
        tag: "Front",
        name: "React Router SPA",
        desc: "학생 화면 + /admin 관리자 화면 (ADMIN role 만)"
      },
      {
        tag: "API",
        name: "Spring Boot · JPA",
        desc: "RentalItem·RentalRecord·Link — 사용자/관리자 컨트롤러 분리"
      },
      {
        tag: "Auth",
        name: "JWT · role",
        desc: "관리자 API 는 ADMIN 권한만 · 학생 조회는 공개"
      },
      {
        tag: "Ship",
        name: "Docker + Nginx",
        desc: "SPA try_files 폴백 · 이미지 S3"
      }
    ],
    decisions: [
      {
        area: "수량",
        pick: "서버가 delta 검증",
        why: "0 미만·총량 초과를 API 에서 거부",
        alt: "화면에서만 검사(우회 가능)"
      },
      {
        area: "대여",
        pick: "학생은 조회만",
        why: "대여·반납은 관리자 기록으로만 — 실물과 수량이 안 어긋남",
        alt: "온라인 예약(노쇼·중복 관리 ↑)"
      },
      {
        area: "링크허브",
        pick: "DB + 관리 화면",
        why: "링크는 매주 바뀐다 — 개발자 없이 갈아끼움",
        alt: "코드에 하드코딩(배포 필요)"
      },
      {
        area: "도우미",
        pick: "퀵 메뉴 + 의견 폼",
        why: "길 안내와 접수면 충분 — 답 품질 책임이 없음",
        alt: "LLM 챗봇(과함)"
      },
      {
        area: "서빙",
        pick: "Nginx try_files",
        why: "SPA 새로고침 404 (2025)",
        alt: "Node 서버(과함)"
      }
    ],
    coreCode: [
      {
        filename: "RentalService.java",
        caption:
          "수량 조정은 서버가 검증한다 — 0 미만·총량 초과 거부 (2026 · 백엔드)",
        highlightLines: [6, 7],
        lines: [
          "@Transactional",
          "public RentalItemResponseDto adjustCurrentQuantity(Long id, Integer delta) {",
          '  if (delta == null || delta == 0) throw new IllegalArgumentException("delta 는 0 이 아니어야");',
          "  RentalItem item = rentalItemRepository.findById(id).orElseThrow(...);",
          "  int next = item.getCurrentQuantity() + delta;",
          '  if (next < 0) throw new IllegalArgumentException("현재 수량은 0보다 작아질 수 없습니다.");',
          '  if (next > item.getTotalQuantity()) throw new IllegalArgumentException("총 수량을 초과할 수 없습니다.");',
          "  item.setCurrentQuantity(next);",
          "  return toItemDto(rentalItemRepository.save(item));",
          "}"
        ]
      },
      {
        filename: "nginx.conf",
        caption: "SPA 새로고침 404 방지 — try_files 폴백 (2025)",
        highlightLines: [2],
        lines: [
          "location / {",
          "  try_files $uri $uri/ /index.html; # 없는 경로는 SPA로",
          "}"
        ]
      }
    ],
    work: [
      {g: "2025 프론트", items: ["대여사업 검색창", "정책집", "조직도"]},
      {
        g: "2026 화면",
        items: [
          "UI 전면 개편 · 모바일 6갈래",
          "대여사업 · 링크허브",
          "관리자(대여·링크·공지·피드백) · 도우미 위젯"
        ]
      },
      {
        g: "2026 API",
        items: [
          "RentalItem · RentalRecord · Link 엔티티/서비스/컨트롤러",
          "사용자/관리자 컨트롤러 분리 · ADMIN 권한"
        ]
      },
      {g: "배포", items: ["Docker · Nginx", "이미지 S3 업로드"]}
    ],
    challenges: [
      {
        title: "학생이 총학생회실까지 와서야 「없다」는 말을 들었다",
        problem:
          "물품 수량이 어디에도 안 보였다. 사이트에 올려도 개발자가 배포해야 바뀌니, 결국 안 올렸다.",
        solution:
          "RentalItem 에 총량·현재 수량을 두고, 관리자 화면의 −/+ 가 PATCH /quantity 로 바로 반영되게 했다. 서버가 0 미만·총량 초과를 거부하고, 대여·반납은 RentalRecord 로 남아 수량을 움직인다. 학생 화면은 그 수량을 읽기만 한다."
      },
      {
        title: "인스타 프로필에 링크를 다 못 걸었다",
        problem:
          "프로필 링크 칸이 몇 개 안 돼, 접수 폼·공모전·수요조사가 생길 때마다 이전 링크를 내려야 했다.",
        solution:
          "/linkHub 한 페이지와 Link 테이블, 관리 화면을 만들었다. 프로필엔 이 페이지 하나만 걸고, 링크는 총학생회가 직접 넣고 뺀다. 지금 11개가 걸려 있다."
      },
      {
        title: "새로고침하면 404가 떴다 (2025)",
        problem:
          "SPA 라우트에서 새로고침 시 Nginx가 실제 파일을 못 찾아 404를 반환했다.",
        solution:
          "try_files로 모든 경로를 index.html로 폴백시켜 클라이언트 라우터가 처리하게 했다."
      }
    ],
    tech: [
      "React 18",
      "React Router",
      "Spring Boot 3",
      "JPA",
      "PostgreSQL",
      "JWT",
      "Docker",
      "Nginx"
    ],
    resultScreens: [
      {
        title: "ajou-council/welfare/rental",
        kind: "bars",
        bars: [
          {l: "매트 돗자리", p: 80, v: "28/35"},
          {l: "은박 돗자리", p: 96, v: "46/48"},
          {l: "우산", p: 50, v: "2/4"},
          {l: "의자", p: 0, v: "0/21"}
        ]
      },
      {
        title: "ajou-council/linkHub",
        kind: "cards",
        cards: [
          {l: "통합 소통 창구", sub: "forms"},
          {l: "굿즈 공모전", sub: "docs"},
          {l: "가을축제 수요조사", sub: "forms"},
          {l: "100인 안건 상정제", sub: "site"}
        ]
      }
    ],
    metrics: [
      // Search Console 실측. 라벨의 **"검색"** 은 지우면 안 된다 —
      // 전체 방문자로 읽히면 과장이 된다.
      // 앞의 셋은 GSC 실적, 마지막 하나는 공개 API 응답을 센 것(2026-09-04).
      // 예전 네 번째 "새로고침 404: 0" 은 채워 넣은 숫자라 뺐다.
      {n: "12,314", l: "검색 노출"},
      {n: "1,694", l: "검색 클릭"},
      {n: "13.8%", l: "검색 CTR"},
      {n: "10 · 11", l: "대여 품목 · 링크 (실서비스)"}
    ],
    metricsNote:
      "검색 셋은 Google Search Console · 2025.05~2026.08(16개월) · 검색 유입 기준 (전체 방문자 아님). 품목·링크 수는 2026.09.04 공개 API 응답을 센 것.",
    kptLabels: {
      keep: "2025에서 배운 것 · 개발·배포",
      problem: "아직 남은 것",
      try: "2026에서 배운 것 · 운영·사용자"
    },
    // KEEP/TRY 를 「2025에서 배운 것 / 2026에서 배운 것」으로 갈랐다.
    // 두 해의 배움이 서로 다른 종류다. (원페이저에는 안 그린다 — ProjectOnePager 참고)
    kpt: {
      keep: [
        "2025 · 배포까지 끝내야 서비스가 된다 — Docker/Nginx 로 환경을 고정",
        "2025 · SPA 는 새로고침에서 깨진다 — Nginx try_files 로 404 를 없앰",
        "2025 · 남의 구조 안에서 화면 일부를 만지며 정보 구조를 배웠다"
      ],
      problem: [
        "대여 신청 자체는 아직 창구에서 받는다 — 온라인은 수량 조회까지",
        "개편 효과는 검색 노출로만 봤다 — 헛걸음 문의가 얼마나 줄었는지는 세지 않았다",
        "접근성(대비·포커스)은 여전히 보강이 필요하다"
      ],
      try: [
        "2026 · 메뉴를 늘리는 게 아니라 안 눌러도 보이게 한다 — 모바일 첫 화면에 6갈래",
        "2026 · 운영자가 직접 고치게 만든다 — 수량·링크·공지·피드백을 관리 화면으로",
        "2026 · 검증은 서버에 둔다 — 화면의 −/+ 는 우회되고 API 의 거부는 안 된다"
      ]
    },
    learningLead:
      "화면을 예쁘게 고치는 것보다, 쓰는 사람이 스스로 할 수 있게 만드는 것이 운영형 서비스의 개선이었다.",
    learning:
      "2025년엔 남의 구조 안에서 화면 일부를 만졌고, 2026년에 혼자 맡아 프론트·API·배포를 다 잡고 나서야 알았다 — 학생은 폰으로 들어와 햄버거를 안 누르고, 총학생회실 문 앞에서 「남아 있어요?」를 묻고, 총학생회는 수량 하나 바꾸려고 개발자를 부르고 싶어 하지 않는다."
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
    learningLead:
      "프론트·아바타·백엔드가 얽힌 협업에서는 ‘데이터 계약을 단일 소스로 통일하는 것’이 가장 중요했다.",
    learning: "백엔드는 결국 신뢰할 수 있는 계약을 내려주는 역할이었다."
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
    learningLead:
      "공포는 ‘놀래키기’가 아니라 ‘플레이어가 스스로 긴장하게 만드는 설계’였다.",
    learning: "연출 도구(Cinemachine)를 잘 위임하는 것도 실력이었다."
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
    learningLead:
      "1인 게임도 Scene/Object/System 으로 나누면 유지보수가 완전히 달라졌다.",
    learning:
      "플레이 감을 ‘느낌’이 아니라 자동 플레이테스트 로그로 검증하니 튜닝이 훨씬 빨라졌다."
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
      {
        k: "결과",
        v: "5인 팀에서 부팀장으로 Steam 스토어 출시까지 완주 (기획 → 출시 5개월)"
      },
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
    // 마을(3D) 뷰어가 읽는 지표. 이력서 원페이지의 「Key Numbers」는 아래
    // `metrics` 를 읽으므로 **둘을 같이 고쳐야 한다** — 한쪽만 바꾸면 같은
    // 프로젝트가 경로에 따라 다른 숫자를 말한다.
    impact: [
      {n: "Steam", l: "스토어 출시"},
      {n: "5인", l: "팀 · 부팀장"},
      {n: "5개월", l: "기획 → 출시"}
    ],
    metricsNote:
      "출시 사실은 Steam 스토어 페이지에서 직접 확인할 수 있다 · 팀 규모와 기간(2023.07–11)은 이력서 원본 기준",
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
    // 원페이지의 「Key Numbers」가 읽는 건 `impact` 가 아니라 **이 배열**이다.
    // 예전 값 넷(팀/다단계/이어하기/Unity)은 하나도 검산할 수 없는 말이었고,
    // 이 이력서에서 가장 확인하기 쉬운 사실인 Steam 출시가 빠져 있었다.
    metrics: [
      {n: "Steam", l: "스토어 출시"},
      {n: "5인", l: "팀 · 부팀장"},
      {n: "5개월", l: "기획 → 출시"},
      {n: "Unity", l: "2022.3 · C#"}
    ],
    kpt: {
      keep: ["4방향 접지 판정으로 조작감 개선", "씬 분리로 협업 충돌 최소화"],
      problem: ["스테이지 분량 부족", "밸런싱 시간 부족"],
      try: ["보스 패턴 추가", "리플레이/타임어택"]
    },
    learningLead:
      "조작감 문제를 시간(코요테 타임)으로 덮으려다 실패하고 나서야, 원인이 판정 위치였다는 걸 알았다.",
    learning:
      "팀 협업에서 ‘기술’만큼 ‘충돌 안 나게 일 나누는 구조’가 중요하다는 걸 배웠다."
  },

  // ════════════════════════════ The Other Side / 이면 (game · VR · 팀) ═══════
  // 2026-09-03 신설. 문장은 포트폴리오 PDF 43–48쪽, 코드는 kbwon/IMP_VR 의
  // Assets/JJH/JJH/Scripts(본인 스크립트)에서 그대로 가져왔다. 특수 카메라
  // (CameraController/Manager)는 팀원(KBW) 스크립트라 **설명만 하고 코드는 싣지 않는다.**
  // 숫자는 전부 코드에서 센 값이다 — 사용자 수·플레이 수 같은 건 없다.
  "otherside-vr": {
    tagline: "VR HORROR PUZZLE · UNITY XR (TEAM)",
    heroImage: {
      src: "/projects/otherside-vr.webp",
      label: "The Other Side 플레이",
      ratio: "16/9"
    },
    problemShot: {
      src: "/projects/op/vr-chase.webp",
      label: "추격 중인 몬스터 (Bookhead)",
      ratio: "16/9",
      fit: "contain"
    },
    // 카메라 화면 셋을 한 장으로 줄였다(2026-09-04). 특수 카메라는 팀원 코드라
    // 그 화면이 갤러리를 채우면 "이거 직접 만들었냐"는 질문에 아니라고 답해야
    // 하는 페이지가 된다. 내 몫(감지·AI·중앙 제어)의 결과 화면은 아직 없다 —
    // 배회 → 손전등 감지 → 추격 3컷을 찍으면 resultShot 으로 넣는다.
    gallery: [
      {
        src: "/projects/op/vr-camera-clue.webp",
        label: "특수 카메라로 본 숨은 단서 (카메라 시스템은 팀원 담당)",
        ratio: "16/9",
        wide: true,
        caption:
          "특수 카메라·PostFX 는 팀원 담당. 내 몫은 이 화면 아래에서 도는 쪽이다 — 카메라·손전등 상태를 감지기가 판정하고, GameManager 가 그 판정으로 몬스터를 켜고 끈다."
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "특수 카메라로만 보이는 단서를 찾고, 손전등을 켜면 들키는 VR 공포 퍼즐·추격 게임"
      },
      {k: "왜", v: "VR 에서 ‘보이는 것’ 자체를 게임 규칙으로 설계하고 싶었음"},
      {
        k: "결과",
        v: "퍼즐이 풀릴 때만 추격이 켜진다 — 감지기는 판정만 하고, GameManager 가 몬스터 2종을 켜고 끈다"
      },
      {
        k: "내 역할",
        v: "AI 몬스터 시스템 · 감지 로직 · 중앙 제어 구조 설계 (몬스터 개발 · 메인 기획)"
      }
    ],
    // 플레이 영상은 PDF 의 링크(sK9OoBNCVvc)가 2026-09-04 기준 404(비공개·삭제)라 뺐다. 공개되면 video: 를 되살린다.
    demo: {
      repo: "https://github.com/kbwon/IMP_VR"
    },
    meta: [
      {label: "기간", value: "2025.04 – 2025.06"},
      {
        label: "팀",
        value: "4인 팀 (AR 과 같은 팀원) · 특수 카메라 시스템은 팀원 담당"
      },
      {label: "역할", value: "AI 몬스터 · 감지 로직 · 중앙 제어 · 메인 기획"},
      {label: "스택", value: "Unity · XR Interaction Toolkit · C# · NavMesh"},
      {
        label: "비고",
        value: "저장소는 팀원 소유(kbwon) · 내 스크립트는 Assets/JJH"
      }
    ],
    heroScreen: {
      title: "THE OTHER SIDE",
      kind: "title",
      titleText: "이면",
      subText: "▶ 특수 카메라 착용"
    },
    impact: [
      {n: "2종", l: "몬스터 AI · Doll / Bookhead"},
      {n: "2", l: "감지기 · 시야각 / 손전등 빛"},
      {n: "5초", l: "시야를 벗어난 뒤 추격 해제"}
    ],
    metricsNote:
      "수치는 Assets/JJH 스크립트에서 센 값(MonsterType 2 · Detector 2 · loseSightDelay 5f)",
    features: [
      {
        t: "특수 카메라 단서",
        d: "정상 시야로는 안 보이는 퍼즐 요소를 카메라 모드로 발견"
      },
      {
        t: "손전등 리스크",
        d: "켜면 빛 원뿔까지 감지 대상 — 시야 확보 vs 들킬 위험"
      },
      {t: "FOV 추격", d: "적 시야각 안에 들어오면 추적, 벗어나면 5초 뒤 해제"},
      {
        t: "퍼즐 ↔ 추격 연동",
        d: "GameManager 토글로 퍼즐 진행에 따라 몬스터 활성화"
      }
    ],
    problem:
      "단순 추격만으로는 공포의 템포를 조절할 수 없었다. 그리고 감지 로직과 AI 로직이 직접 결합되면, 퍼즐 조건이 하나 늘 때마다 몬스터 코드를 고쳐야 해서 유지보수가 어려웠다.",
    research: {
      quotes: [
        {
          q: "단순 추격만으로는 공포 템포 조절 불가.",
          who: "문제 정의 — MonsterAI"
        },
        {
          q: "감지 로직과 AI 로직이 직접 결합되면 유지보수 어려움.",
          who: "문제 정의 — GameManager"
        }
      ]
    },
    hypothesis:
      "“감지기는 감지만 하고, 행동은 GameManager 가 중앙에서 켜고 끄면 — 퍼즐 진행에 따라 추격을 제어할 수 있고, 트리거가 늘어도 결합도는 낮게 유지된다.”",
    process: [
      {t: "탐색", d: "어두운 저택"},
      {t: "발견", d: "카메라 모드"},
      {t: "위협", d: "퍼즐 → 적 활성화"},
      {t: "회피", d: "FOV 추격 대응"}
    ],
    architecture: [
      {
        tag: "Detect",
        name: "EnemyDetector",
        desc: "시야각(90°)·거리(10m) + 손전등 빛 원뿔 10점 샘플링"
      },
      {
        tag: "Detect",
        name: "EnemyLightZoneDetector",
        desc: "손전등 ON + 반경 7m — 두 번째 몬스터용 규칙"
      },
      {
        tag: "Control",
        name: "GameManager (싱글톤)",
        desc: "몬스터 오브젝트·추격 여부를 중앙에서 토글"
      },
      {
        tag: "AI",
        name: "MonsterAI",
        desc: "NavMesh · Wander → Chase → Attack, 타입별 활성 플래그"
      },
      {
        tag: "Team",
        name: "CameraController / Manager",
        desc: "VR 트리거로 카메라 모드 토글 · PostFX + 숨은 오브젝트 렌더링 (팀원)"
      }
    ],
    decisions: [
      {
        area: "구조",
        pick: "감지 / 행동 분리",
        why: "퍼즐 조건 추가 시 몬스터 코드 무변경",
        alt: "감지기가 AI 를 직접 호출 (결합 ↑)"
      },
      {
        area: "손전등 감지",
        pick: "빛 원뿔을 10점으로 샘플링",
        why: "빛줄기 일부만 시야에 걸려도 들킴 — 손전등이 진짜 리스크가 됨",
        alt: "플레이어 위치만 검사 (손전등 무의미)"
      },
      {
        area: "추격 해제",
        pick: "시야 이탈 후 5초 지연",
        why: "코너 하나 돌았다고 바로 풀리면 긴장이 끊김",
        alt: "즉시 해제"
      },
      {
        area: "퍼즐 연동",
        pick: "Enable 토글",
        why: "퍼즐 진행 단계마다 추격 ON/OFF 로 템포 제어",
        alt: "항상 추격 (템포 조절 불가)"
      }
    ],
    coreCode: [
      {
        filename: "EnemyDetector.cs",
        caption:
          "플레이어 본체뿐 아니라 손전등 빛 원뿔을 10점으로 샘플링해 시야각 안에 걸리는지 본다",
        highlightLines: [1, 2, 8, 9, 10],
        lines: [
          "bool seesPlayer = IsPlayerInFOV();",
          "bool seesFlashlight = flashlight.IsEnabled() && IsLightConeInFOV();",
          "",
          "private bool IsLightConeInFOV() {",
          "  Vector3 coneOrigin = flashlight.GetConeOrigin();",
          "  Vector3 coneDir = flashlight.GetConeDirection();",
          "  float coneRange = flashlight.GetConeRange();",
          "  for (int i = 0; i <= 10; i++) {",
          "    Vector3 samplePoint = coneOrigin + coneDir * coneRange * (i / 10f);",
          "    if (InRangeAndAngle(samplePoint)) return true;",
          "  }",
          "  return false;",
          "}"
        ]
      },
      {
        filename: "GameManager.cs",
        caption:
          "감지기는 이 두 메서드만 부른다 — 몬스터를 켜고 끄는 건 여기 한 곳",
        highlightLines: [3, 4],
        lines: [
          "public void ToggleDollBehavior(bool on) {",
          "  if (dollMonsterObject == null) return;",
          "  dollMonsterObject.SetActive(on);",
          "  dollMonster?.SetChaseAndAttackEnabled(on);",
          "}",
          "// EnemyDetector:  seesPlayer || seesFlashlight → ToggleDollBehavior(true)",
          "// 5초 동안 안 보이면               → ToggleDollBehavior(false)"
        ]
      },
      {
        filename: "MonsterAI.cs",
        caption: "거리 기반 상태 전환 — 활성 플래그가 꺼져 있으면 배회만 한다",
        highlightLines: [1, 5, 9],
        lines: [
          "bool isEnabled = monsterType == MonsterType.Doll ? dollCanChaseAndAttack : bookheadCanChaseAndAttack;",
          "float d = Vector3.Distance(transform.position, player.position);",
          "",
          "if (isEnabled && d <= attackDistance && !isAttacking) {",
          "  agent.SetDestination(transform.position); SetAnimation(false, true);   // Attack",
          "  StartCoroutine(EndAttackAfter(attackDuration));",
          "}",
          "else if (isEnabled && d <= chaseDistance && !isAttacking) {",
          "  agent.SetDestination(player.position); animator.speed = 3f;           // Chase",
          "}",
          "else { /* wanderTimer 마다 RandomNavSphere 로 배회 */ }"
        ]
      }
    ],
    work: [
      {
        g: "AI",
        items: [
          "MonsterAI — 배회/추격/공격 상태",
          "타입별 활성 플래그 (Doll · Bookhead)"
        ]
      },
      {
        g: "감지",
        items: [
          "EnemyDetector — 시야각 + 손전등 원뿔",
          "EnemyLightZoneDetector — 반경 + 손전등"
        ]
      },
      {
        g: "제어",
        items: [
          "GameManager 싱글톤 · 중앙 토글",
          "PlayerFlashlight — 상태·원뿔 정보"
        ]
      },
      {g: "기획", items: ["메인 기획 · 게임 흐름 (탐색 → 발견 → 위협 → 회피)"]}
    ],
    challenges: [
      {
        title:
          "감지와 행동이 붙어 있으면 퍼즐이 늘 때마다 몬스터를 고쳐야 했다",
        problem:
          "감지기가 몬스터를 직접 부르면, 트리거·퍼즐 조건이 하나 추가될 때마다 AI 코드에 손이 간다.",
        solution:
          "감지기(EnemyDetector · EnemyLightZoneDetector)는 ‘봤다/놓쳤다’만 판정하고 GameManager.Instance 의 토글 메서드만 부른다. 몬스터를 켜고 끄는 코드는 GameManager 한 곳에만 있다.",
        code: {
          filename: "EnemyLightZoneDetector.cs",
          lines: [
            "bool flashlightOn = flashlight.IsEnabled();",
            "bool inRange = Vector3.Distance(transform.position, playerTransform.position) <= detectionRadius;",
            "if (flashlightOn && inRange) GameManager.Instance.ToggleBookheadBehavior(true);",
            "else if (++loseSightTimer >= loseSightDelay) GameManager.Instance.ToggleBookheadBehavior(false);"
          ]
        }
      },
      {
        title: "손전등이 그냥 조명이면 ‘켤지 말지’가 선택이 안 된다",
        problem:
          "시야 확보와 들킬 위험이 맞바꿔지지 않으면 손전등은 항상 켜 두는 물건이 된다.",
        solution:
          "PlayerFlashlight 가 빛 원뿔(원점·방향·범위)을 내주고, 감지기가 그 원뿔을 따라 10점을 찍어 적 시야각 안에 걸리는지 검사한다. 빛줄기 끝만 걸려도 추격이 시작된다."
      }
    ],
    tech: ["Unity", "XR Interaction Toolkit", "C#", "NavMesh"],
    resultScreens: [
      {
        title: "THE OTHER SIDE · SYSTEMS",
        kind: "stats",
        stats: [
          {n: "2", l: "감지기"},
          {n: "2종", l: "몬스터 AI"},
          {n: "1", l: "중앙 제어"},
          {n: "5초", l: "추격 해제 지연"}
        ]
      },
      {
        title: "THE OTHER SIDE · CAMERA",
        kind: "title",
        titleText: "CAMERA ON",
        subText: "숨은 단서 표시"
      }
    ],
    metrics: [
      {n: "2종", l: "몬스터 AI"},
      {n: "2", l: "감지기"},
      {n: "5초", l: "추격 해제"},
      {n: "4인", l: "팀"}
    ],
    kpt: {
      keep: [
        "감지 / 행동 / 제어를 세 파일로 나눈 구조",
        "손전등을 조명이 아니라 리스크로 만든 규칙"
      ],
      problem: [
        "시야각·거리·5초 같은 값이 스크립트에 하드코딩",
        "몬스터가 2종 — 규칙 조합의 여지가 적음"
      ],
      try: ["감지 규칙을 ScriptableObject 로", "몬스터·퍼즐 조건 추가"]
    },
    learningLead:
      "VR 공포에서 무서운 건 몬스터가 아니라 ‘내가 켠 손전등 때문에 들킬 수 있다’는 규칙이었다.",
    learning:
      "감지기는 감지만, 몬스터는 행동만, 켜고 끄는 건 한 곳에서 — 이렇게 나누고 나서야 퍼즐 조건을 늘리는 일이 몬스터 코드를 건드리지 않는 일이 됐다."
  },

  // ════════════════════════════ INTO MONSTER POINT (game · AR · 팀) ═════════
  // 2026-09-03 신설. 문장은 포트폴리오 PDF 49–55쪽, 코드는 toadsam/IMP 의
  // Weapon2_JJH 브랜치(AdjustmentSystem.cs · Spawner.cs)에서 가져왔다. 무기
  // 발사 코드는 저장소에서 원문을 찾지 못해 PDF 의 설명(입력 방향 있을 때만 발사 ·
  // nextFire 쿨타임 · isUnlocked 차단)까지만 적고 코드는 싣지 않는다.
  "monsterpoint-ar": {
    tagline: "AR WAVE SHOOTER · AR FOUNDATION (TEAM)",
    heroImage: {
      src: "/projects/monsterpoint-ar.webp",
      label: "현실 공간에 등장한 몬스터",
      ratio: "16/9"
    },
    problemShot: {
      src: "/projects/op/ar-scan-after.webp",
      label: "스캔 후 전투 공간 고정",
      ratio: "3/4",
      fit: "contain"
    },
    // 트러블슈팅 1·2번의 결과를 순서대로 — 스캔 전 → 스캔 후 → 바닥·벽 → 보스.
    // PDF 51–54쪽 캡처 4장을 한 줄로 붙였다(2026-09-04). 바닥·벽·보스 컷은
    // 여기로 옮겼으니 갤러리에서 뺐다 — 같은 사진을 두 번 보이지 않는다.
    resultShot: {
      src: "/projects/op/ar-result-4cut.webp",
      label: "스캔 전 → 스캔 후 → 바닥·벽 생성 → 보스 등장",
      ratio: "2/1",
      caption:
        "스캔이 끝나면 평면 boundary 를 월드 좌표로 바꿔 X·Z min/max 로 바닥을 깔고 4방향 벽을 세운다. 그 안에서 처치 수가 10에 닿으면 보스가 나온다."
    },
    gallery: [
      {
        src: "/projects/op/ar-spawn.webp",
        label: "바닥 꼭짓점 기준 랜덤 스폰",
        ratio: "3/4",
        fit: "contain"
      },
      {
        src: "/projects/op/ar-play-bow.webp",
        label: "활 — 조이스틱 방향으로 발사",
        ratio: "3/4",
        fit: "contain"
      },
      {
        src: "/projects/op/ar-play-sword.webp",
        label: "칼 — 근접 무기",
        ratio: "3/4",
        fit: "contain"
      },
      {
        src: "/projects/op/ar-weapon-gun.webp",
        label: "총 — 잠금 해제 무기",
        ratio: "3/4",
        fit: "contain"
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "현실 공간을 스캔해 전장으로 고정하고, 그 안에서 웨이브로 몬스터를 사냥하는 AR 생존 슈터"
      },
      {k: "왜", v: "방마다 다른 현실 공간을 그대로 전투 무대로 쓰고 싶었음"},
      {
        k: "결과",
        v: "평면 boundary → 바닥·벽 → 스폰 → 웨이브 → 보스로 이어지는 루프 · 무기 4종"
      },
      {
        k: "내 역할",
        v: "무기 제작 · 스폰 시스템 · 게임 루프 설계 (개발 · 기획)"
      }
    ],
    demo: {
      video: "https://www.youtube.com/watch?v=9Lf2K1qBJ2E",
      repo: "https://github.com/toadsam/IMP"
    },
    meta: [
      {label: "기간", value: "2025.03 – 2025.04"},
      {label: "팀", value: "4인 팀 (VR 과 같은 팀원)"},
      {label: "역할", value: "무기 제작 · 스폰 시스템 · 게임 루프 설계 · 기획"},
      {label: "스택", value: "Unity · AR Foundation · C#"},
      {
        label: "비고",
        value: "스크립트는 Weapon-JJH / Weapon2_JJH 브랜치 (main 은 템플릿만)"
      }
    ],
    heroScreen: {
      title: "INTO MONSTER POINT",
      kind: "title",
      titleText: "SCAN",
      subText: "▶ 바닥을 비추세요"
    },
    impact: [
      {n: "4", l: "무기 · 활 / 칼 / 마법 / 총"},
      {n: "10", l: "처치 시 보스 등장 (counterBoss)"},
      {n: "4", l: "방향 벽 — 스캔 boundary 에서 생성"}
    ],
    metricsNote:
      "수치는 Spawner.cs(counterBoss = 10) · AdjustmentSystem.cs(CreateWall ×4) · WeaponShooterWithJoystick.cs(무기 4종) 기준 · 사용자 수 같은 값은 없다",
    features: [
      {
        t: "전투 공간 고정",
        d: "Plane Detection 스캔 종료 시 boundary 를 월드 좌표로 변환"
      },
      {t: "바닥·벽 자동 생성", d: "min/max 로 크기를 정하고 4방향 벽을 세움"},
      {t: "웨이브 스폰", d: "spawnInterval 마다 스폰, 처치 수 누적 → 보스"},
      {t: "무기 4종", d: "조이스틱 방향이 있을 때만 발사 · 쿨타임 · 잠금"}
    ],
    problem:
      "현실 공간은 플레이할 때마다 크기와 모양이 다르다. 전장·스폰 위치·경계를 고정값으로 두면 어떤 방에서는 벽 밖에 몬스터가 생기고 어떤 방에서는 전장이 방을 넘는다.",
    research: {
      quotes: [
        {
          q: "실제 공간이 전투 무대가 됨. 플레이 환경에 따라 전투 경험이 달라짐.",
          who: "설계 방향 — 현실 기반 전장"
        },
        {
          q: "거리·방향·공간 크기에 따라 몬스터 스폰 위치가 유동적으로 결정.",
          who: "설계 방향 — 스폰 규칙"
        }
      ]
    },
    hypothesis:
      "“스캔한 평면의 boundary 하나에서 바닥·벽·스폰 위치를 전부 파생시키면 — 어떤 방에서 켜도 전장이 그 방 크기에 맞는다.”",
    process: [
      {t: "스캔", d: "Plane Detection"},
      {t: "고정", d: "boundary → 바닥·벽"},
      {t: "스폰", d: "꼭짓점 기준"},
      {t: "웨이브", d: "처치 수 → 보스"},
      {t: "무기", d: "4종 · 잠금"}
    ],
    architecture: [
      {
        tag: "AR",
        name: "AdjustmentSystem",
        desc: "ARPlaneManager trackables → boundary 월드 변환 → 바닥 스케일 · 벽 4개"
      },
      {
        tag: "Spawn",
        name: "Spawner",
        desc: "spawnInterval 코루틴 · 처치 카운트 · counterBoss 도달 시 보스"
      },
      {
        tag: "Weapon",
        name: "무기 4종",
        desc: "조이스틱 입력 · fireRate/힘/딜레이 분리 · isUnlocked 차단"
      },
      {
        tag: "Hit",
        name: "ProjectileDamage",
        desc: "Monster 태그 충돌 시 데미지 · 소멸 여부 플래그"
      }
    ],
    decisions: [
      {
        area: "전장 크기",
        pick: "boundary min/max 사각형",
        why: "어떤 방에서도 바닥·벽이 스캔 결과를 따라감",
        alt: "고정 크기 전장 (방보다 크거나 작음)"
      },
      {
        area: "카메라 포함",
        pick: "카메라 위치 ±1m 를 범위에 합침",
        why: "플레이어가 선 자리가 전장 밖이 되는 일을 막음",
        alt: "평면만으로 계산"
      },
      {
        area: "보스 트리거",
        pick: "처치 수 누적 (counterBoss)",
        why: "시간이 아니라 플레이 성과로 웨이브가 넘어감",
        alt: "타이머"
      },
      {
        area: "발사 조건",
        pick: "입력 방향이 있을 때만",
        why: "조준 없는 난사 방지 · 조작감",
        alt: "버튼 누르면 항상 발사"
      }
    ],
    coreCode: [
      {
        filename: "AdjustmentSystem.cs",
        caption:
          "스캔 종료 — 바닥 평면들의 boundary 를 월드 좌표로 모아 min/max 로 전장 크기를 정한다",
        highlightLines: [2, 3, 4, 9, 10],
        lines: [
          "foreach (var plane in planeManager.trackables)",
          "  if (plane.alignment == PlaneAlignment.HorizontalUp)",
          "    foreach (var point in plane.boundary)",
          "      allWorldPoints.Add(plane.transform.TransformPoint(new Vector3(point.x, 0f, point.y)));",
          "",
          "// min/max X·Z (+ 카메라 위치 ±1m)",
          "float width = maxX - minX, length = maxZ - minZ;",
          "GameObject floor = Instantiate(floorPrefab, new Vector3(centerX, minY, centerZ), Quaternion.identity);",
          "floor.transform.localScale = new Vector3(width / 10f, 1f, length / 10f); // Plane 은 10×10 단위",
          "CreateWall(c[0], c[1]); CreateWall(c[1], c[2]); CreateWall(c[2], c[3]); CreateWall(c[3], c[0]);"
        ]
      },
      {
        filename: "Spawner.cs",
        caption:
          "일정 간격 스폰 → 처치 수가 counterBoss 에 닿으면 보스 웨이브로 전환",
        highlightLines: [2, 3, 9, 10],
        lines: [
          "IEnumerator SpawnEnemy1() {",
          "  while (enemy1Spawned) { SpawnMonster(enemy1Prefab); yield return new WaitForSeconds(spawnInterval); }",
          "}",
          "",
          "public void OnEnemy1Slained() {",
          "  slainedMoster++;",
          "  if (slainedMoster >= counterBoss && !boss1Spawned) {",
          "    enemy1Spawned = false;",
          "    boss1Spawned = true;",
          "    StartCoroutine(SpawnBoss1());",
          "    slainedMoster = 0;",
          "  }",
          "}"
        ]
      }
    ],
    work: [
      {
        g: "AR",
        items: [
          "Plane Scan 토글 · 스캔 종료 처리",
          "boundary → 바닥 · 4방향 벽"
        ]
      },
      {
        g: "스폰",
        items: ["꼭짓점 기준 스폰 위치", "spawnInterval 루프 · 보스 트리거"]
      },
      {g: "무기", items: ["활 · 칼 · 마법 · 총", "발사 조건 · 쿨타임 · 잠금"]},
      {g: "기획", items: ["게임 루프 설계"]}
    ],
    challenges: [
      {
        title: "방마다 크기가 달라 전장을 고정할 수 없었다",
        problem:
          "스캔된 평면은 여러 조각으로 들어오고 크기도 매번 다르다. 어디까지가 전장인지 코드가 정해야 했다.",
        solution:
          "바닥 평면들의 boundary 점을 전부 월드 좌표로 바꿔 X·Z 의 min/max 를 잡고, 그 사각형으로 바닥을 스케일링한 뒤 네 꼭짓점을 이어 벽을 세웠다. 카메라 위치 ±1m 도 범위에 넣어 플레이어가 전장 밖에 서지 않게 했다.",
        code: {
          filename: "AdjustmentSystem.cs",
          lines: [
            "void CreateWall(Vector3 start, Vector3 end) {",
            "  Vector3 mid = (start + end) / 2; float dist = (end - start).magnitude;",
            "  GameObject wall = Instantiate(wallPrefab, mid, Quaternion.identity);",
            "  wall.transform.localScale = new Vector3(0.01f, 1f, dist);",
            "  wall.transform.rotation = Quaternion.LookRotation(end - start);",
            "}"
          ]
        }
      },
      {
        title: "웨이브가 시간으로 넘어가면 플레이와 무관해진다",
        problem:
          "타이머로 보스를 내보내면 못 잡고 있어도 보스가 온다. 압박은 플레이어의 성과에서 나와야 했다.",
        solution:
          "Spawner 가 처치 콜백(OnEnemyNSlained)으로 카운트를 누적하고, counterBoss(10)에 닿으면 일반 스폰을 멈추고 보스를 소환한다. 보스마다 카운트를 0 으로 되돌려 다음 웨이브로 잇는다."
      }
    ],
    tech: ["Unity", "AR Foundation", "C#"],
    resultScreens: [
      {
        title: "INTO MONSTER POINT · LOOP",
        kind: "stats",
        stats: [
          {n: "스캔", l: "전장 고정"},
          {n: "4", l: "벽"},
          {n: "10", l: "처치 → 보스"},
          {n: "4", l: "무기"}
        ]
      },
      {
        title: "INTO MONSTER POINT · BOSS",
        kind: "title",
        titleText: "BOSS WAVE",
        subText: "counterBoss 도달"
      }
    ],
    metrics: [
      {n: "4", l: "무기"},
      {n: "10", l: "처치 → 보스"},
      {n: "4", l: "방향 벽"},
      {n: "4인", l: "팀"}
    ],
    kpt: {
      keep: [
        "전장·스폰·벽을 전부 스캔 결과에서 파생",
        "처치 수 기반 웨이브 전환"
      ],
      problem: [
        "보스 3종이 같은 counterBoss 값 — 난이도 곡선 없음",
        "무기 잠금 해제 조건이 단순"
      ],
      try: ["웨이브별 난이도 데이터화", "무기 해제 조건을 성과와 연결"]
    },
    learningLead:
      "AR 에서 플레이 공간은 내가 정하는 게 아니라 스캔이 정한다 — 그래서 모든 값이 boundary 에서 나와야 했다.",
    learning:
      "고정값 하나 없이 스캔 결과만으로 전장·벽·스폰이 서게 만들고 나니, 어떤 방에서 켜도 같은 게임이 됐다."
  },

  // ════════════════════════════ 아주대탐험 / Ajou Indie Game (game · 1인) ═══
  // 2026-09-03 신설. 「아주분투」(ajou-adventure, Phaser 2D 러너)와 **다른 게임**이다.
  // 문장은 포트폴리오 PDF 27–34쪽, 코드는 toadsam/Ajou_IndiGame 의 Assets/Script.
  // 그림은 마을 전시실(AjouRoom)이 이미 쓰던 /projects/ajou-adventure/ 의 것 —
  // 폴더 이름은 옛 것이지만 내용은 이 게임(치토·원천관·시점 전환)이다.
  "ajou-indigame": {
    tagline: "3D ACTION ADVENTURE · UNITY (SOLO)",
    heroImage: {
      src: "/projects/ajou-adventure/title.webp",
      label: "아주대탐험 타이틀",
      ratio: "16/9"
    },
    problemShot: {
      src: "/projects/ajou-adventure/view-fp.webp",
      label: "1인칭 시점 — 탐색",
      ratio: "16/9"
    },
    // 트러블슈팅 세 건과 1:1 — 시점 전환(위 두 장) · 랜덤 스킬 3택 · 캐릭터 선택 UI.
    // PDF 30–33쪽 캡처(저장소 ajou-adventure/ 와 같은 원본)를 2×2 로 붙였다
    // (2026-09-04). 여기 쓴 세 컷은 갤러리에서 뺐다.
    resultShot: {
      src: "/projects/op/ajou-result-4cut.webp",
      label: "1인칭↔탑다운 · 레벨업 랜덤 3택 · 캐릭터 선택",
      ratio: "16/9",
      caption:
        "위: 같은 캠퍼스를 1인칭(탐색)과 탑다운(전투)으로 오간다. 아래 왼쪽: 레벨업마다 전체 목록에서 랜덤 3개를 제시하고 고르는 동안 시간을 멈춘다. 아래 오른쪽: 선택한 캐릭터만 활성화되는 선택 화면."
    },
    gallery: [
      {
        src: "/projects/ajou-adventure/boss-appear.webp",
        label: "보스 등장",
        ratio: "16/9"
      },
      {
        src: "/projects/ajou-adventure/quest-ui.webp",
        label: "돌발 퀘스트 알림",
        ratio: "16/9"
      },
      {
        src: "/projects/ajou-adventure/portal.webp",
        label: "포탈 — 씬 전환",
        ratio: "16/9"
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "아주대 캠퍼스에서 마스코트 ‘치토’가 졸업을 목표로 성장하는 Unity 3D 액션 어드벤처"
      },
      {k: "왜", v: "퍼즐 탐색과 전투에 서로 다른 시야·조작을 주고 싶었음"},
      {
        k: "결과",
        v: "1인칭↔탑다운을 조작 충돌·카메라 튐 없이 오가고, 레벨업마다 랜덤 3택으로 매 판 다른 빌드가 나온다"
      },
      {k: "내 역할", v: "시스템 설계 / UI / AI / 전투 / 성장 전부 (1인)"}
    ],
    demo: {
      video: "https://www.youtube.com/watch?v=mtIiIWmrSdg",
      repo: "https://github.com/toadsam/Ajou_IndiGame"
    },
    meta: [
      {label: "기간", value: "2024.08 – 2024.12"},
      {label: "팀", value: "개인 개발 (1인)"},
      {
        label: "역할",
        value: "코어 루프 · AI · UI · 전투 · 성장 시스템 설계/구현"
      },
      {label: "스택", value: "Unity · C# · NavMesh"}
    ],
    heroScreen: {
      title: "AJOU INDIE GAME",
      kind: "title",
      titleText: "아주대탐험",
      subText: "▶ 치토, 졸업을 향해"
    },
    impact: [
      {n: "1인", l: "설계 · UI · AI · 전투 · 성장 전부"},
      {n: "2", l: "시점 · 1인칭 ↔ 탑다운"},
      {n: "3", l: "레벨업 랜덤 스킬 제시"}
    ],
    metricsNote:
      "수치는 저장소 스크립트 기준(PlayerMode enum 2 · randomSkills[3] · WaveManager case 1–5)",
    features: [
      {
        t: "시점 전환",
        d: "1인칭 탐색 ↔ 탑다운 전투 — 카메라·컨트롤러·물리 제약을 함께 전환"
      },
      {t: "랜덤 스킬 성장", d: "레벨업 시 시간 정지 → 3개 중 선택 → 즉시 반영"},
      {t: "상태 기반 AI", d: "NavMesh 일반 몬스터 · 예고 있는 랜덤 패턴 보스"},
      {
        t: "이벤트 시스템",
        d: "돌발 퀘스트 · 포탈 씬 전환 · 소환 스킬(20초/쿨 20초)"
      }
    ],
    problem:
      "퍼즐 탐색과 전투는 요구하는 시야와 조작이 다르다. 하나의 카메라·컨트롤러로 둘을 다 하면 어느 쪽도 몰입이 안 되고, 기능을 하나씩 붙이면 서로 얽혀 확장이 어려워진다.",
    research: {
      quotes: [
        {
          q: "단순 연출이 아닌 게임 시스템으로서 시점 전환 기능 구현.",
          who: "설계 방향 — 시점 전환"
        },
        {
          q: "매 판 다른 빌드를 만들 수 있도록 랜덤 스킬 선택 도입, 반복 플레이 동기 강화.",
          who: "설계 방향 — 성장 루프"
        }
      ],
      stat: {n: "5", l: "시스템 모듈 · Player / Skill / AI / UI / Event"}
    },
    hypothesis:
      "“카메라·컨트롤러·물리 제약을 ‘모드’ 단위로 함께 바꾸면 — 한 캐릭터로 탐색과 전투를 오가면서도 조작이 겹치거나 화면이 튀지 않는다.”",
    process: [
      {t: "탐색", d: "1인칭"},
      {t: "전투", d: "탑다운 · 웨이브"},
      {t: "경험치", d: "적 처치"},
      {t: "레벨업", d: "스킬 3택"},
      {t: "다음 웨이브", d: "난이도 ↑"}
    ],
    architecture: [
      {
        tag: "Player",
        name: "PlayerModeManager",
        desc: "FirstPerson / TopDown — 컨트롤러 enable 전환 · 카메라 Parent · Y축 잠금"
      },
      {
        tag: "Skill",
        name: "InGameSkillManager",
        desc: "레벨업 → 랜덤 3개 제시 → 획득/강화"
      },
      {
        tag: "AI",
        name: "MonsterAI · WaveManager",
        desc: "Idle → Move → Chase → Attack · 웨이브 1–4 + 보스(5)"
      },
      {
        tag: "UI",
        name: "인벤토리 · 캐릭터 선택",
        desc: "선택 결과가 게임 오브젝트 활성/비활성으로 즉시 반영"
      },
      {
        tag: "Event",
        name: "Portal · RobotSummoner · 돌발 퀘스트",
        desc: "코루틴 기반 시간 제어 · 씬 로딩"
      }
    ],
    decisions: [
      {
        area: "시점 전환",
        pick: "컨트롤러 2개를 켜고 끄기",
        why: "모드 전환 시 동시 입력·오작동 방지",
        alt: "한 컨트롤러에 분기 (얽힘)"
      },
      {
        area: "카메라",
        pick: "1인칭은 플레이어 자식으로, 탑다운은 분리",
        why: "시점이 튀지 않게 고정 · localPosition 0 리셋",
        alt: "위치를 매 프레임 계산"
      },
      {
        area: "탑다운 물리",
        pick: "3초 뒤 Y축 Freeze",
        why: "전환 직후 흔들림 방지 · 이후 평면 이동 고정",
        alt: "즉시 고정 (전환 순간 튐)"
      },
      {
        area: "성장",
        pick: "레벨업마다 랜덤 3택",
        why: "매 판 다른 빌드 · 반복 플레이 동기",
        alt: "고정 스킬 트리"
      }
    ],
    coreCode: [
      {
        filename: "PlayerModeManager.cs",
        caption:
          "시점 전환은 카메라만 옮기는 게 아니다 — 컨트롤러·물리 제약·카메라 부모를 한 번에 바꾼다",
        highlightLines: [3, 4, 6, 7, 11, 12],
        lines: [
          "switch (mode) {",
          "  case PlayerMode.FirstPerson:",
          "    firstPersonController.enabled = true;  topDownController.enabled = false;",
          "    UnlockYPosition();",
          "    mainCamera.transform.SetParent(firstPersonCameraParent);",
          "    mainCamera.transform.localPosition = Vector3.zero;",
          "    mainCamera.transform.localRotation = Quaternion.identity;",
          "    break;",
          "  case PlayerMode.TopDown:",
          "    firstPersonController.enabled = false; topDownController.enabled = true;",
          "    StartCoroutine(LockYPositionAfterDelay(3f));",
          "    mainCamera.transform.SetParent(null); topDownCameraFollow.enabled = true;",
          "    break;",
          "}"
        ]
      },
      {
        filename: "InGameSkillManager.cs",
        caption:
          "레벨업 → 랜덤 3개 제시 → 이미 가진 스킬이면 강화, 아니면 획득",
        highlightLines: [3, 8, 9],
        lines: [
          "for (int i = 0; i < 3; i++) {",
          "  randomSkills[i] = availableSkills[Random.Range(0, availableSkills.Count)];",
          "  int index = i; // 클로저 캡처",
          "  skillButtons[i].onClick.AddListener(() => SelectSkill(index));",
          "}",
          "",
          "void SelectSkill(int index) {",
          "  var s = randomSkills[index];",
          "  if (acquiredSkills.Contains(s)) s.Upgrade(); else { acquiredSkills.Add(s); s.ActivateEffectStage(1); }",
          "  skillSelectionUI.SetActive(false);",
          "}"
        ]
      },
      {
        filename: "MonsterAI.cs",
        caption:
          "상태 하나가 곧 메서드 하나 — 거리 조건으로만 다음 상태를 정한다",
        highlightLines: [1, 7, 8],
        lines: [
          "private enum AIState { Idle, Move, Chase, Attack, TakeDamage, Die }",
          "",
          "void Update() {",
          "  switch (currentState) { case AIState.Idle: Idle(); break; case AIState.Chase: ChasePlayer(); break; /* … */ }",
          "}",
          "void ChasePlayer() {",
          "  agent.SetDestination(player.position);",
          "  if (IsPlayerInRange(attackRange)) currentState = AIState.Attack;",
          "  else if (!IsPlayerInRange(detectionRange)) currentState = AIState.Idle;",
          "}"
        ]
      }
    ],
    work: [
      {
        g: "Player",
        items: ["1인칭 ↔ 탑다운 전환", "카메라 Parent · Y축 잠금 · 포탈 트리거"]
      },
      {g: "Skill", items: ["레벨업 랜덤 3택", "획득 / 강화 분기"]},
      {
        g: "AI",
        items: ["Idle/Move/Chase/Attack 상태 AI", "웨이브 5단계 · 보스"]
      },
      {
        g: "UI · Event",
        items: ["인벤토리 · 캐릭터 선택 연동", "돌발 퀘스트 · 포탈 · 소환 스킬"]
      }
    ],
    challenges: [
      {
        title: "시점을 바꾸면 조작이 겹치고 카메라가 튀었다",
        problem:
          "1인칭과 탑다운이 같은 입력을 동시에 받으면 오작동이 나고, 카메라를 위치로만 옮기면 전환 순간 시점이 튄다.",
        solution:
          "컨트롤러 두 개를 모드에 따라 enable/disable 로 갈라 동시 입력을 막고, 1인칭 카메라는 플레이어의 자식으로 붙여 localPosition 을 0 으로 리셋했다. 탑다운은 3초 지연 뒤 Y축을 Freeze 해 전환 직후 흔들림을 넘겼다.",
        code: {
          filename: "PlayerModeManager.cs",
          lines: [
            "IEnumerator LockYPositionAfterDelay(float delay) {",
            "  yield return new WaitForSeconds(delay);",
            "  playerRigidbody.constraints = RigidbodyConstraints.FreezePositionY | RigidbodyConstraints.FreezeRotation;",
            "}"
          ]
        }
      }
    ],
    tech: ["Unity", "C#", "NavMesh"],
    resultScreens: [
      {
        title: "AJOU INDIE GAME · SYSTEMS",
        kind: "stats",
        stats: [
          {n: "2", l: "시점"},
          {n: "3", l: "스킬 3택"},
          {n: "5", l: "웨이브"},
          {n: "20초", l: "소환 / 쿨타임"}
        ]
      },
      {
        title: "AJOU INDIE GAME · BOSS",
        kind: "title",
        titleText: "BOSS",
        subText: "다섯 번째 웨이브"
      }
    ],
    metrics: [
      {n: "2", l: "시점 전환"},
      {n: "3", l: "랜덤 스킬"},
      {n: "5", l: "웨이브"},
      {n: "1인", l: "전담"}
    ],
    kpt: {
      keep: [
        "시스템 5개를 독립 모듈로 나눈 구조",
        "시점 전환을 연출이 아닌 시스템으로"
      ],
      problem: [
        "웨이브마다 몬스터 1마리 — 분량이 얇음",
        "값(3초·20초·범위)이 스크립트에 박혀 있음"
      ],
      try: ["건물별 스테이지 테마 · 최종 보스 ‘졸업’", "밸런스 값 데이터화"]
    },
    learningLead:
      "기능을 붙이는 게 아니라 시스템을 나누는 것이 1인 개발에서도 확장의 전부였다.",
    learning:
      "Player · Skill · AI · UI · Event 를 각자 독립시켜 두니, 새 스킬이나 새 상태를 붙일 때 다른 시스템을 열어 볼 일이 없어졌다."
  }
};
