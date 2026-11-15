import type {RichProject} from "./shared";
import {stripCodeLinks} from "../../../../lib/codeLinks";
import {aclubStory} from "./aclubStory";
import {ajouchong2026} from "./ajouchong2026";
import {mywaveStory} from "./mywaveStory";
import {signStory} from "./signStory";
import {tserofStory} from "./tserofStory";
import {villageStory} from "./villageStory";

// 실제 GitHub 저장소(README·소스·구조)를 근거로 작성한 콘텐츠.
// 원칙: 검증 불가능한 수치(성능 %, 사용자 테스트 점수 등)는 넣지 않는다.
//   - metrics/impact 는 리포에서 셀 수 있는 값(도메인 수·API 수·모듈 수 등)만 사용.
//   - perf/usability(측정치) 필드는 실측이 없으므로 비워 둠(의도적).
// research.quotes 는 "다른 사람이 실제로 한 말" 또는 커밋 메시지처럼 남에게 보여 줄
// 수 있는 기록만 넣는다. 내가 쓴 README·설계 메모·문제 정의를 따옴표로 감싸 출처를
// 붙이면 인용이 아니라 자기 인용이고, 읽는 쪽에는 근거가 아니라 군더더기로 보인다.
// 그런 문장은 problem·hypothesis·troubleshooting 이 이미 같은 말을 하고 있다.
// 기간·역할·팀은 `resume/jeong-jaehun-resume.md`(이력서 원본) 기준. 원본에 근거가
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
    heroImage: {
      src: "/projects/village-portfolio/village.webp",
      label: "3D 마을 광장 · 관리자 기록이 건물 불빛으로",
      ratio: "16/9"
    },
    problemShot: {
      src: "/projects/village-portfolio/admin.webp",
      label: "관리자 페이지 · 오늘의 활동 입력",
      ratio: "16/9"
    },
    gallery: [
      {
        src: "/projects/village-portfolio/atelier.webp",
        label: "의뢰 공방 · 직군 에이전트 4명의 순차 질문",
        ratio: "16/9"
      },
      {
        src: "/projects/village-portfolio/resume.webp",
        label: "이력서 화면 · 지금 읽고 있는 이 페이지",
        ratio: "16/9"
      },
      {
        src: "/projects/village-portfolio/admin.webp",
        label: "관리자 배전반 · 활동 입력과 마을 반응 미리보기",
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
        v: "활동 기록을 사이트에 반영하고, 방문자가 NPC에게 프로젝트를 물어볼 수 있게 하려고 했습니다."
      },
      {
        k: "결과",
        v: "3D 다운로드 −44% · 첫 화면 3D 모델 20.7MB→0 · 입장 최악 프레임 7,325→233ms"
      },
      {
        k: "내 역할",
        v: "설계·구현·운영·검증을 혼자 맡았습니다. 코드는 Claude Code와 함께 작성하고, 기능 선정과 측정·검증은 직접 진행했습니다."
      }
    ],
    demo: {
      live: "https://jaehun.co.kr",
      repo: "https://github.com/toadsam/myPortfolio"
    },
    meta: [
      {label: "기간", value: "2026.06 ~ 진행 중"},
      {label: "팀", value: "개인 개발"},
      {
        label: "스택",
        value: "Next.js 16 · React Three Fiber · FastAPI · SQLite · OpenAI API"
      },
      {label: "배포", value: "https://jaehun.co.kr"},
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
    features: [
      {
        t: "활동 → 마을 상태",
        d: "커밋·공부·코딩·운동 기록이 건물 밝기 4단계와 NPC 기분으로"
      },
      {
        t: "AI NPC 대화 + 규칙 폴백",
        d: "OpenAI 로 대사 생성, 키가 없거나 실패하면 규칙 대사로 바꿔 서비스가 멈추지 않습니다"
      },
      {
        t: "NPC 관계 사회",
        d: "마주침의 결과는 규칙이 정하고 모델은 대사만 씁니다 · 기억·뒷담화·부탁"
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
        d: "기획·디자인·프론트·백엔드가 실제 파일을 씁니다 · 진행 권한은 사람의 게이트 함수 하나"
      }
    ],
    problem:
      "관리자 활동 기록을 화면에 반영하고, 방문자가 건물마다 있는 NPC에게 프로젝트를 물어볼 수 있게 하려고 했습니다. 동시에 첫 화면을 여는 채용 담당자에게 20MB 짜리 3D 를 내려받게 할 수는 없었습니다.",
    research: {
      quotes: [],
      stat: {
        n: "215.6 KB",
        l: "첫 화면이 받는 JS · GLB 0개 (마을 표에 마우스를 올리면 920 KB)"
      }
    },
    hypothesis:
      "관리자 활동 기록을 화면에 반영하고 NPC 와 대화할 수 있게 했습니다. 첫 화면은 3D를 내려받지 않는 별도 라우트로 분리했습니다.",
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
        desc: "NPC 대사 · 견적 초안 (전부 규칙 폴백 있음)"
      },
      {
        tag: "Agents",
        name: "Claude Agent SDK · 공방 3단계",
        desc: "4직군이 산출물을 씁니다 · can_use_tool 샌드박스 · 게이트 테스트 36"
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
          "쓰는 쪽은 관리자(와 의뢰 공방 접수) 뿐이고, 마을·이력서·공방은 읽기만 합니다. 마을 상태는 규칙(village_service)으로 계산하고, 모델(chat_service)은 NPC 대사 생성에 사용했습니다. 모델 호출이 실패해도 마을은 켜져 있습니다.",
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
        why: "인트로를 읽는 모든 방문자가 20.7MB 를 받고 있었습니다 · hover 때만 마을을 미리 받습니다",
        alt: "마을 위 오버레이 인트로 (모두가 3D 다운로드)"
      },
      {
        area: "NPC 대사",
        pick: "OpenAI + 규칙 폴백",
        why: "키가 없거나 호출이 실패해도 NPC 가 답합니다 · 실패가 방문자에게 보이지 않음",
        alt: "모델 실패를 그대로 노출"
      },
      {
        area: "클릭 판정",
        pick: "투명 히트박스만 레이캐스트",
        why: "GLB 메시 수천 개를 매 프레임 검사하지 않습니다 · 보이지 않는 메시도 판정됩니다",
        alt: "GLB 메시에 직접 핸들러"
      },
      {
        area: "밤 조명",
        pick: "상주 광원 풀 (개수 고정)",
        why: "광원 개수가 바뀔 때 셰이더 재컴파일에 3초가 걸려, 광원 풀로 개수를 고정했습니다.",
        alt: "실제 광원 대신 발광 효과로 표현"
      },
      {
        area: "견적",
        pick: "규칙 기준선의 0.6~1.8× 클램프",
        why: "모델의 숫자를 그대로 손님에게 보이면 책임질 수 없는 금액이 나갑니다",
        alt: "모델 견적 신뢰"
      },
      {
        area: "에이전트 권한",
        pick: "진행은 게이트 함수 하나 · 모델은 review 까지",
        why: "프롬프트에만 의존하지 않고 단계 진행 권한을 게이트 함수로 제한했습니다. 단계 전이 로직은 순수 함수로 분리하고 테스트 36개로 검증했습니다.",
        alt: "프롬프트만으로 단계 진행 제한"
      },
      {
        area: "개발 방식",
        pick: "Claude Code 와 짝 · 계획 승인 뒤 착수",
        why: "같은 실수를 줄이기 위해 판단 기준과 주의사항을 CLAUDE.md 291줄로 정리했습니다. AI가 작성한 결과는 직접 측정하고 테스트했습니다.",
        alt: "전체 직접 작성 또는 AI 결과를 별도 검증 없이 반영"
      }
    ],
    coreCode: [
      {
        filename: "backend/app/services/village_service.py",
        caption:
          "활동 → 점수 → 밝기 4단계. 규칙이 상태를 정합니다 (실제 코드 발췌)",
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
          "hover 때 마을을 미리 받습니다. prefetch 는 라우트 껍질만 가져오므로 씬 청크는 따로 import",
        highlightLines: [2],
        lines: [
          'router.prefetch("/village");',
          'void import("@/components/village/VillageScene");'
        ]
      },
      {
        filename: "src/components/village/LightPool.tsx",
        caption:
          "끄는 것은 intensity 0 이지 visible=false 가 아닙니다. three 는 안 보이는 광원을 개수에서 빼서 재컴파일이 되돌아옵니다",
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
          "샌드박스 관련 네 설정을 함께 적용했습니다. 설정 조합에 따라 can_use_tool 콜백이 실행되지 않을 수 있습니다. (실제 코드 발췌)",
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
          "개발은 Claude Code 와 짝으로. 계획 승인·실측·검증은 사람이 · CLAUDE.md 291줄"
        ]
      }
    ],
    challenges: [
      {
        title: "54MB의 3D 모델 다운로드로 첫 화면 표시가 지연됐습니다",
        problem:
          "서빙 GLB 54.0MB 의 8할이 내장 JPEG 텍스처였습니다. 지오메트리는 이미 Draco 라 더 줄일 게 없었고, 표준 도구는 이 환경에서 깨져 있었습니다.",
        solution:
          "GLB 를 직접 열어 이미지 청크만 WebP 로 바꿨습니다(더 작아진 것만 채택). 54.0→30.3MB, A/B 캡처로 화질 차이 없음. VRAM 283MB 는 그대로라는 한계도 적었습니다.",
        code: {
          filename: "scripts/compress-glb-webp.mjs",
          lines: [
            "// ② 더 작아진 것만 채택",
            "const webp = readFileSync(j.dst);",
            "const bv = json.bufferViews[json.images[j.i].bufferView];",
            "if (webp.length < bv.byteLength * 0.97) replaced.set(j.i, webp);"
          ]
        },
        evidence: {
          status: "코드로 확인",
          note: "압축 스크립트가 추가된 커밋입니다. 수정 전에는 이 파일이 없었어요. 화질 A/B와 용량 수치는 포트폴리오의 당시 측정 서술입니다.",
          url: "https://github.com/toadsam/myPortfolio/blob/72d82e4a4fe02c060320672bdd2941f11c72afbf/scripts/compress-glb-webp.mjs"
        }
      },
      {
        title: "마을 입장 시 3초 지연의 원인을 다시 측정했습니다",
        problem:
          "라벨 74개를 숨기자 8.9→42.6fps 라 라벨이 원인이라고 판단했습니다. 원복하고 다시 재니 47.9fps 였습니다. 라벨 표시 여부보다 예열 시간이 측정 결과에 영향을 줬습니다.",
        solution:
          "프레임마다 광원·셰이더 수를 같이 기록하자 원인이 보였습니다. 광원 개수가 바뀔 때마다 전 재질이 재컴파일됩니다. 줄이는 대신 광원 풀로 개수를 고정했습니다(광원 11 · 프로그램 57).",
        perfAfter: true,
        evidence: {
          status: "전후 코드로 확인",
          note: "LightPool.tsx도 같은 커밋에 추가됐습니다. 고정 광원이 많으면 첫 컴파일 비용이 커질 수 있어 무조건 많을수록 좋은 것은 아닙니다.",
          url: "https://github.com/toadsam/myPortfolio/blob/2eb4362bfdc0e2a60904b54dc19a8545a2219b1a/src/components/village/Building.tsx"
        }
      },
      {
        title: "첫 화면이 20.7MB 짜리 3D 를 내려받고 있었습니다",
        problem:
          "인트로가 마을 위 오버레이라, 인트로만 읽는 방문자도 GLB 87개(20.7MB)를 받았습니다. 우회하는 방법 세 가지를 써 봤지만 구조는 그대로였고, 그중 하나는 첫 화면을 깨뜨렸습니다.",
        solution:
          "착륙장·마을·이력서를 세 라우트로 갈라 첫 화면엔 three.js 를 싣지 않습니다(215.6KB · GLB 0). 마을은 hover 때 prefetch 와 씬 import 두 줄로 미리 받습니다.",
        code: {
          filename: "src/app/page.tsx",
          lines: [
            "const prepareVillage = useCallback(() => {",
            '  router.prefetch("/village");',
            '  void import("@/components/village/VillageScene");',
            "}, [router]);"
          ]
        },
        evidence: {
          status: "전후 코드로 확인",
          note: "모든 기기에서 항상 같은 다운로드량이라는 보장은 아닙니다.",
          url: "https://github.com/toadsam/myPortfolio/blob/c8a80a026261f32d89a9a3f6ae839032001d9124/src/app/page.tsx"
        }
      },
      {
        title: "에이전트가 4분간 실행됐지만 파일을 작성하지 못했습니다",
        problem:
          "SDK 가 권한 응답 채널을 한 번 yield 뒤 닫아 첫 Write 부터 Stream closed. 에이전트는 파일 쓰기 실패를 보고한 뒤 종료됐습니다(실행 4분 · 비용 $0.72).",
        solution:
          "ClaudeSDKClient 로 응답이 끝날 때까지 채널을 유지했습니다. 관련 권한 설정(permission_mode · allowed_tools · setting_sources)을 함께 점검하고, 파일 읽기에도 경로 검사를 적용했습니다.",
        code: {
          filename: "backend/app/agents/runner.py",
          lines: [
            "async with ClaudeSDKClient(options=options) as client:",
            "    await client.query(prompt)",
            "    async for message in client.receive_response():"
          ]
        },
        evidence: {
          status: "전후 코드로 확인",
          note: "실제 SDK를 실행하거나 파일을 쓰는 실험은 아닙니다.",
          url: "https://github.com/toadsam/myPortfolio/blob/d6f3fcaa5595c713d9020eb384f13bc10ddef9b0/backend/app/agents/runner.py"
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
      note: "다운로드는 서빙 폴더 실측 · 첫 화면 3D 는 옛 오버레이 인트로가 받던 87 GLB(20.7MB) → 라우트 분리 뒤 0 · 프레임은 Playwright 5초 구간 최악값(예열 40초 뒤)이고, 입장 직후 한 번 남는 3.1초 초기 컴파일은 그대로입니다"
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
        "병목과 처방 효과를 Playwright 프레임 계측으로 확인한 것",
        "NPC 대사에 규칙 폴백을 둬서 OpenAI 호출이 실패해도 마을이 멈추지 않은 것",
        "에이전트 진행은 게이트 함수 하나, 견적은 0.6~1.8× 클램프로 묶은 것"
      ],
      problem: [
        "VRAM 283MB 는 그대로입니다 (WebP 는 디코드 후 동일). KTX2 는 다음 과제"
      ],
      try: [
        "배포 후 방문 계측 · 이력서 PDF 내려받기 수",
        "UASTC(KTX2) 로 VRAM 4× 절감. 다운로드가 2.5× 늘어나는 것을 감수할지 실측으로 결정"
      ]
    },
    learningLead:
      "라벨 74개를 숨겨 얻은 8.9→42.6fps 는 예열 시간 효과였습니다. 확인한 원인은 광원 개수가 바뀔 때의 셰이더 재컴파일이었습니다.",
    learning:
      "예열 후 조건을 번갈아 측정하고, 프레임마다 광원·셰이더 수를 함께 기록해 원인을 확인했습니다. 광원 수를 줄이는 대신 광원 풀로 개수를 고정해 재컴파일을 줄였습니다."
  },

  // ════════════════════════════ MyStock-Desk / StockFlow (dashboard) ═════════
  mystock: {
    // ── 2026-11-13 전면 갱신. 출처는 저장소 toadsam/MyStock-Desk 의 README(2026-11 판)·
    // docs/SCREENS.md(2026-10-12 캡처)·docs/TROUBLESHOOTING.md(2026-11-10 공개일 점검).
    // 예전 서술("StockFlow 13 도메인·9 페이지")은 2026-06 이전 것이었고, 그 뒤 UI 가 MyWave 로
    // 바뀌고 2026-10 에 홈을 「오늘 더 써도 되는 돈」 중심으로 다시 설계했으며 2026-11-10 에
    // mywave.day 로 공개했다(2026-11-13 200 확인). 화면 캡처는 저장소 docs/screens 의 것을
    // 그대로 가져왔다(repo-*.webp, 1440×900 · 모바일 780×1688). 숫자는 README 표와 점검 기록의 값만.
    // ── 2026-11-13 저녁 2차. 저장소 HEAD a5b5995(2026-11-11) 를 다시 읽고 맞췄다(docs/BACKEND_EVIDENCE.md).
    //   ① 「AI 화면 넷 중 모델 호출은 테마 설명 하나」는 2026-11-11 5615d12 로 옛말이 됐다. 코치도 모델이 답을
    //      쓰고 CoachAnswerGuard 가 숫자·투자 조언을 검사한다(기본 provider 는 local 이라 꺼져 있을 수 있다).
    //   ② 테스트는 공개일 29 → 41, 다음 날 87 → 98(@Test 를 커밋별로 셈). README 의 29 는 낡았다.
    //   ③ 운영 가드(ProductionGuard · compose 필수값 · CI 3잡)를 트러블슈팅과 장면으로 올렸다.
    tagline: "PERSONAL FINANCE · FULL-STACK WEB APP (MyWave)",
    heroImage: {
      src: "/projects/mystock/repo-home.webp",
      label: "홈 · 오늘 더 써도 되는 돈",
      ratio: "16/10",
      caption:
        "홈에는 숫자 하나만 크게 둡니다. 이번 달 남은 생활비를 남은 날수로 나눈 하루 예산에서 오늘 쓴 돈을 뺀 값이고, 소비를 하나 기록할 때마다 서버가 기록에서 다시 계산합니다. 데모 계정, 2026-10-12 캡처."
    },
    gallery: [
      {
        src: "/projects/mystock/repo-spending.webp",
        label: "소비 · 지난달 같은 날짜까지와 비교",
        ratio: "16/10",
        caption:
          "12일까지 쓴 돈을 지난달 한 달 전체와 비교하면 매달 초에는 늘 줄어든 것으로 나오기 때문에, 지난달 같은 기간까지와 비교합니다. 기록은 직접 입력, 퀵버튼, 카드 문자 붙여넣기, 결제 캡처로 넣습니다."
      },
      {
        src: "/projects/mystock/repo-goals.webp",
        label: "목표 · 메인 목표와 추천 행동",
        ratio: "16/10",
        caption:
          "목표일이 가장 가까운 목표를 메인으로 두고 하루에 얼마씩 모으면 되는지 보여 줍니다. 추천 행동은 이번 달 많이 쓴 카테고리 세 곳을 20% 줄였을 때 아끼는 돈입니다."
      },
      {
        src: "/projects/mystock/repo-portfolio-detail.webp",
        label: "투자 상세 · 보유 종목과 거래 기록",
        ratio: "16/10",
        caption:
          "증권사 계좌에 연결하지 않고 직접 넣은 매매 기록만으로 평균단가·수익률·비중을 계산합니다. 거래를 고치면 보유 종목을 처음부터 다시 재생합니다."
      },
      {
        src: "/projects/mystock/repo-coach.webp",
        label: "AI 코치 · 이번 달 재무 상태 요약과 대화",
        ratio: "16/10",
        caption:
          "캡처 시점(2026-10-12)의 답변은 자바 규칙 4갈래였습니다. 2026-11-11 부터는 모델이 문장을 쓰고, 서버가 계산한 숫자만 쓰는지와 투자 조언이 없는지를 코드가 검사한 뒤 내보냅니다. 걸리면 이 규칙 답으로 돌아갑니다."
      },
      {
        src: "/projects/mystock/repo-reports.webp",
        label: "리포트 · 이번 달 돈 리포트 · 6개월 소비와 예산",
        ratio: "16/10"
      },
      {
        src: "/projects/mystock/repo-portfolio-allocation.webp",
        label: "자산 비중 · 종목·자산군별",
        ratio: "16/10"
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "대학생이 매일 여는 개인 재무 웹앱(MyWave). 홈의 큰 숫자 하나 「오늘 더 써도 되는 돈」 아래에 저축 목표와 투자가 붙습니다"
      },
      {
        k: "왜",
        v: "수익률·자산 비중·소비를 한 곳에서 보되, 화면 어디에도 예시 숫자를 채우지 않고 기록에서만 계산되게 하려고"
      },
      {
        k: "결과",
        v: "2026-11-10 mywave.day 로 공개. 화면 19개, 엔드포인트 111개(MyWave 가 쓰는 것 55개), 테스트는 공개일 29 → 41개에서 다음 날 98개. 모든 push 에 CI 3잡"
      },
      {k: "내 역할", v: "1인 · 도메인 설계 · Spring Boot API · React 화면 전부"}
    ],
    demo: {
      live: "https://mywave.day",
      repo: "https://github.com/toadsam/MyStock-Desk"
    },
    meta: [
      // README 표 그대로. 첫 커밋 2026-05-25 「주식 체계 프론트 디자인」.
      {
        label: "기간",
        value:
          "2026.05 ~ 진행 중 (첫 커밋 05.25 · 2026.10 홈 재설계 · 11.10 공개)"
      },
      {
        label: "팀",
        value: "1명 · 도메인 설계 · Spring Boot API · React 화면 전부"
      },
      {label: "상태", value: "운영 중 (mywave.day) · 2026-11-10 공개"},
      {
        label: "스택",
        value:
          "React · TypeScript · Vite · Spring Boot · JPA · H2/MySQL · Recharts · Docker Compose / Railway"
      },
      {
        label: "이름",
        value: "저장소 MyStock-Desk · 패키지 com.stockflow · 화면 MyWave"
      }
    ],
    heroScreen: {
      title: "mywave/today",
      kind: "dashboard",
      kpi: [
        {l: "화면", v: "19"},
        {l: "엔드포인트", v: "111"},
        {l: "테스트", v: "98"}
      ],
      chart: [20, 26, 22, 34, 30, 42, 38, 50, 58, 64]
    },
    impact: [
      {n: "19", l: "화면"},
      {n: "111", l: "엔드포인트 (MyWave 사용 55)"},
      {n: "1인", l: "풀스택"}
    ],
    features: [
      {
        t: "오늘 더 써도 되는 돈",
        d: "남은 생활비 ÷ 남은 날수 − 오늘 쓴 돈. 저장하지 않고 요청마다 계산"
      },
      {
        t: "소비 기록 네 갈래",
        d: "직접 입력 · 퀵버튼 · 카드 문자 붙여넣기 · 결제 캡처"
      },
      {
        t: "입력 거래 기반 투자",
        d: "매수는 이동평균, 매도는 수량만. 거래 수정 시 전체 재생"
      },
      {
        t: "검사받는 AI 코치",
        d: "숫자는 서버가 계산해 주고 모델은 문장만. 자료에 없는 숫자·투자 조언은 코드가 걸러 규칙 답으로"
      },
      {
        t: "외부 연동 4곳",
        d: "Yahoo Finance · Google News RSS · OpenDART · SEC EDGAR, 응답마다 출처 문자열"
      },
      {
        // 2026-11-15: 운영은 구글 로그인만 받는다(STOCKFLOW_PASSWORD_LOGIN_ENABLED=false). 그 스위치가 데모 버튼도
        // 같이 끄므로 「로그인 화면에서 데모 계정으로 바로 들어간다」는 옛 문장은 mywave.day 와 맞지 않았다.
        t: "구글 로그인",
        d: "구글 계정 하나로 가입과 로그인. 화면이 받은 ID 토큰은 서버가 구글 공개키로 직접 검증"
      }
    ],
    problem:
      "투자 기록을 직접 관리하면 수익률·자산 비중을 한눈에 파악하기 어렵고, 소비·목표·투자가 화면마다 다른 숫자를 말하기 쉽습니다. 증권사 연동 없이 직접 입력한 기록만으로 계산되고, 기록이 없으면 0 이어야 했습니다.",
    research: {
      quotes: [],
      stat: {n: "19", l: "화면 수 (로그인 1 + 로그인 뒤 18 · docs/SCREENS.md)"}
    },
    beforeCode: {
      filename: "naive-pnl.ts",
      caption: "단순 현재가 합산 · 평균 매입가/실현손익 개념이 없음",
      lines: [
        "// 기존: 보유 수량 × 현재가만 합산",
        "const total = holdings.reduce(",
        "  (sum, h) => sum + h.qty * h.price, 0",
        "); // 언제 얼마에 샀는지가 반영되지 않는다"
      ]
    },
    hypothesis:
      "숫자를 저장하지 않고 요청마다 기록에서 다시 세면 홈·소비·코치가 서로 다른 숫자를 말할 일이 없고, 예시 데이터를 화면에 깔지 않으면 「이거 내 기록 맞아?」라고 물을 일이 없다고 봤습니다.",
    process: [
      {t: "도메인 설계", d: "2026.05 · 투자 기록"},
      {t: "백엔드 API", d: "JPA · Security · 외부 연동 4곳"},
      {t: "MyWave UI", d: "2026.06 전면 교체"},
      {t: "홈 재설계", d: "2026.10 · 예시 숫자 제거"},
      {t: "공개·점검", d: "2026.11.10 mywave.day"}
    ],
    architecture: [
      {
        tag: "View",
        name: "React + Vite",
        desc: "화면 19개 · 데스크톱/모바일 같은 주소"
      },
      {
        tag: "API",
        name: "Spring Boot + JPA",
        desc: "엔드포인트 111개 · 요청마다 재계산"
      },
      {tag: "Data", name: "H2 / MySQL", desc: "엔티티 24개 (MyWave 사용 14)"},
      {
        tag: "External",
        name: "Yahoo · RSS · DART · EDGAR",
        desc: "응답 DTO 마다 출처 문자열"
      }
    ],
    decisions: [
      {
        area: "숫자",
        pick: "저장하지 않고 매번 계산",
        why: "소비 하나 지우면 같이 고칠 숫자가 넷. 계산하는 곳이 한 곳이면 화면끼리 어긋나지 않음",
        alt: "집계값 저장(빠르지만 하나를 빠뜨림)"
      },
      {
        area: "투자",
        pick: "거래 수정 시 전체 재생",
        why: "과거 거래의 단가를 고치면 뒤의 평균단가가 조용히 틀어짐. 어떤 순서로 고쳐도 결과가 하나로 수렴",
        alt: "증분 갱신(빠르지만 틀린 걸 알 방법이 없음)"
      },
      {
        area: "AI",
        pick: "모델은 문장만, 숫자와 금지는 코드가",
        why: "지시문만으로는 약속이 되지 않음. 답에 자료에 없는 숫자나 사라·팔라가 있으면 버리고 규칙 답으로",
        alt: "지시문만 믿기(어림한 숫자와 투자 권유가 그대로 나감)"
      },
      {
        area: "시세",
        pick: "실패하면 건너뛰기",
        why: "Provider 는 부팅 때 하나만 뜬다. 조회 실패 종목은 마지막 성공값을 유지",
        alt: "실행 중 Demo 자동 폴백"
      }
    ],
    coreCode: [
      {
        filename: "Holding.java",
        caption:
          "이 서비스의 숫자를 전부 결정하는 곳입니다. 매수는 이동평균, 매도는 수량만 줄이고 평균단가를 건드리지 않습니다",
        highlightLines: [5, 6, 13],
        lines: [
          "public void buy(Integer buyQuantity, BigDecimal executionPrice) {",
          "    BigDecimal previousCost = purchaseAmount();",
          "    BigDecimal addedCost = executionPrice.multiply(BigDecimal.valueOf(buyQuantity));",
          "    quantity += buyQuantity;",
          "    averagePrice = previousCost.add(addedCost)",
          "            .divide(BigDecimal.valueOf(quantity), PRICE_SCALE, RoundingMode.HALF_UP);",
          "}",
          "",
          "public void sell(Integer sellQuantity) {",
          "    if (quantity < sellQuantity) {",
          '        throw new IllegalArgumentException("보유 수량이 부족합니다.");',
          "    }",
          "    quantity -= sellQuantity; // 평균단가는 그대로",
          "}"
        ]
      },
      {
        filename: "MarketDataRefreshService.java",
        caption:
          "조회 실패 종목은 건너뛰고 마지막 성공값을 남깁니다. 갱신을 건너뛰는 방식입니다",
        highlightLines: [2, 3],
        lines: [
          "StockQuoteSnapshot quote = quoteBySymbol.get(stock.getSymbol());",
          "if (quote == null) {",
          "    continue; // 마지막 성공값 유지",
          "}"
        ]
      }
    ],
    work: [
      {
        g: "도메인",
        items: ["패키지 25개 · 컨트롤러 27개", "엔티티 24개(MyWave 사용 14)"]
      },
      {
        g: "계산",
        items: [
          "하루 예산 · 투자 가능 금액 · 달성률을 요청마다",
          "거래 수정 시 보유 전체 재생"
        ]
      },
      {
        g: "외부 연동",
        items: [
          "Yahoo · Google News RSS · OpenDART · SEC EDGAR",
          "응답마다 출처·신뢰 등급"
        ]
      },
      {
        g: "공개 운영",
        items: [
          "mywave.day 배포(Railway) · compose · 부팅 가드",
          "CI 3잡 · 공개일 점검 152건 · 수정 9건"
        ]
      }
    ],
    challenges: [
      {
        title: "거래 하나를 고치면 보유 종목을 처음부터 다시 계산합니다",
        problem:
          "거래 기록은 사용자가 나중에 수정하고 삭제합니다. 보유 수량과 평균단가를 그때그때 더하고 빼면, 5월 매수 기록의 단가를 고치는 순간 그 뒤에 쌓인 모든 평균단가가 조용히 틀어지고 틀린 것을 알 방법도 없습니다.",
        solution:
          "등록·수정·삭제 세 경로 전부가 rebuildPortfolioFromTransactions() 를 부릅니다. 보유 종목을 전부 지우고, 현금을 기준값으로 되돌리고, 거래를 날짜순으로 정렬해 처음부터 다시 재생합니다. 각 거래의 실현손익도 재생 도중 다시 계산되어 저장됩니다. 대신 거래 하나를 고칠 때마다 전체 거래 수 n 에 비례해 계산합니다. 한 사람의 매매 기록이라 n 이 몇 천을 넘길 일이 잘 없습니다. 넘긴다면 스냅샷을 찍고 그 뒤만 재생하는 것이 다음 순서입니다.",
        code: {
          filename: "TransactionService.java",
          caption:
            "보유를 지우고 예수금을 기준값으로 되돌린 뒤 거래를 날짜순으로 다시 재생",
          highlightLines: [3, 4, 8],
          lines: [
            "private void rebuildPortfolioFromTransactions(Long memberId) {",
            "    Portfolio portfolio = findPortfolio(memberId);",
            "    holdingRepository.deleteByPortfolioId(portfolio.getId());",
            "    portfolio.resetForRecordRecalculation(RECORD_BASE_CASH);",
            "    List<InvestmentTransaction> transactions = transactionRepository",
            "            .findByMemberIdOrderByTransactionDateDescCreatedAtDesc(memberId).stream()",
            "            .sorted(Comparator.comparing(InvestmentTransaction::getTransactionDate)",
            "                    .thenComparing(InvestmentTransaction::getCreatedAt)).toList();",
            "    for (InvestmentTransaction transaction : transactions) { … applyRecord(…) … }",
            "}"
          ]
        }
      },
      {
        title: "모델이 쓴 답을 그대로 내보내지 않고 코드로 검사합니다",
        problem:
          "AI 코치가 정해진 문장 네 개로만 답해 대화가 되지 않았습니다. 모델을 붙이면 대화는 생기지만, 모델은 숫자를 어림해 만들고 투자 질문에 「사세요」라고 답하기도 합니다. 지시문만으로는 약속이 되지 않습니다.",
        solution:
          "2026-11-11 에 코치 답을 모델이 쓰게 하되 모델의 일을 문장 쓰기로 줄였습니다. 숫자는 서버가 계산해 [자료]로 주고, 답이 돌아오면 CoachAnswerGuard 가 두 가지를 확인합니다. 답에 나온 세 자리 이상 숫자가 자료나 질문에 없으면 그 답을 버리고, 사라·팔라·오를 것이다 같은 표현이 있으면 정해진 거절 문장으로 바꿉니다. 「1만 3천원」처럼 한글 단위로 어림한 금액도 걸립니다. 질문에 적힌 이메일·전화번호·긴 숫자는 보내기 전에 가립니다(CoachPrivacy).\n\n한 사람 하루 30번, 전체 하루 1,500번을 넘거나 모델을 부르지 못하면 예전의 규칙 답으로 돌아가므로 코치는 언제나 답합니다. 모델을 기다리는 몇 초 동안 DB 연결을 잡지 않으려고 이 경로는 트랜잭션으로 묶지 않았습니다. 대신 맞는 답도 버려집니다. 모델이 자료의 두 숫자를 더해 말하면 그 합은 자료에 없으므로 버립니다.",
        code: {
          filename: "CoachAiAnswerer.java",
          caption:
            "모델의 답은 두 검사를 지나야 나갑니다. 걸리면 거절 문장이나 null(규칙 답)",
          highlightLines: [5, 6, 9, 11],
          lines: [
            "String answer = client.complete(INSTRUCTIONS, userContent);",
            "if (answer == null) {",
            "    return null;",
            "}",
            "if (CoachAnswerGuard.looksLikeInvestmentAdvice(answer)) {",
            "    return INVESTMENT_REFUSAL;",
            "}",
            "String unknown = CoachAnswerGuard",
            '        .firstUnknownNumber(answer, context + "\\n" + safeQuestion);',
            "if (unknown != null) {",
            "    return null; // 자료에 없는 숫자가 있으면 버린다",
            "}",
            "return answer;"
          ]
        },
        evidence: {
          status: "구현 확인 · 테스트 15개",
          note: "CoachAnswerGuardTest 8개와 FinancialCoachAiIntegrationTest 7개가 모델을 가짜로 바꿔 지어낸 숫자 폐기·투자 조언 치환·개인정보 미전송·하루 한도를 확인합니다.",
          url: "https://github.com/toadsam/MyStock-Desk/blob/main/backend/src/main/java/com/stockflow/coach/service/CoachAnswerGuard.java"
        }
      },
      {
        title: "공개한 날 점검에서 데모 계정과 로그아웃 토큰이 걸렸습니다",
        problem:
          "2026-11-10 mywave.day 로 공개한 날 API 전수 검사 152건 중 15건이 걸렸습니다. 공개 데모 계정으로 들어온 누구나 비밀번호와 이메일을 바꿀 수 있었고(한 번 바뀌면 그 뒤 데모 로그인이 전부 실패), 로그아웃한 뒤에도 비밀번호를 바꾼 뒤에도 예전 토큰이 24시간 동안 그대로 통했습니다. AuthController.logout() 이 아무 일도 하지 않는 빈 메서드였습니다.",
        solution:
          "DemoAccountPolicy 를 두고 데모 계정의 프로필 수정과 비밀번호 변경을 403 으로 막았습니다(지출·목표 같은 기록은 써 보라고 둔 것이라 막지 않음). 로그아웃한 토큰은 즉시 무효가 되게 했고, 오류 문구는 Request failed with status code 400 대신 서버가 적은 한글 문장으로 바꿨습니다. 점검과 수정은 Claude Code 와 함께 했고, 걸린 항목은 코드를 열어 원인을 확인한 뒤에만 문제로 적었습니다. 쓰기 테스트는 로컬 H2 에서만 하고 운영에는 읽기와 거절되는 요청만 보냈습니다. 결과는 152건 중 통과 137 → 146, 백엔드 테스트 29 → 41개입니다(다음 날 코치 검사 테스트가 붙어 98개). 남은 6건은 없는 기록에 404 대신 400 을 주는 상태 코드 관례라 이번 범위에서 뺐습니다.",
        evidence: {
          status: "전후 코드로 확인 · 점검 기록",
          note: "docs/TROUBLESHOOTING.md(2026-11-10) 「한눈에」 표. 운영에서 데모 계정으로 두 요청을 보내 403 과 안내 문구를 받은 것으로 확인했습니다.",
          url: "https://github.com/toadsam/MyStock-Desk/blob/main/docs/TROUBLESHOOTING.md"
        },
        perfAfter: true
      },
      {
        title: "운영 설정이 위험하면 서버가 뜨지 않게 했습니다",
        problem:
          "개발용 JWT 시크릿이나 H2 콘솔이 켜진 채로 운영에 올라가도 서버는 조용히 뜹니다. 설정에 기본값이 있으면 환경변수를 빠뜨린 것을 아무도 모릅니다.",
        solution:
          "운영 프로파일은 DB 주소·계정·JWT 시크릿에 기본값을 두지 않아 하나라도 빠지면 부팅이 멈춥니다. 뜬 뒤에는 ProductionGuard 가 다섯 가지를 한 번 더 봅니다. 시크릿이 32바이트보다 짧은지, 개발용 문자열이 들어 있는지, H2 콘솔·mock 회원·show-sql 이 켜져 있는지. 하나라도 걸리면 이유를 적고 예외로 부팅을 거부합니다.\n\ndocker-compose 도 같은 생각으로 짰습니다. 비밀값이 비면 compose 가 멈추고, MySQL 헬스체크가 통과한 뒤에 백엔드가, 백엔드 헬스체크 뒤에 nginx 가 뜨며, 밖으로 여는 포트는 nginx 하나입니다. CI 는 「필수값 없이 compose 설정이 통과하면 실패」를 push 마다 확인합니다. 아직 못 한 것이 두 가지 있습니다. Flyway 가 없어 운영도 ddl-auto: update 이고, 서버 모니터링은 헬스체크 하나뿐입니다.",
        code: {
          filename: "ProductionGuard.java",
          caption:
            "prod 프로파일에서만 도는 부팅 검사. 걸리면 서버를 띄우지 않습니다",
          highlightLines: [2, 5, 8, 11],
          lines: [
            "@PostConstruct void verify() {",
            "    if (secret.getBytes(UTF_8).length < MIN_SECRET_BYTES) problems.add(…);",
            '    if (lower.contains("development") || lower.contains("change-before")',
            '            || lower.startsWith("stockflow-local")) problems.add(…);',
            "    if (h2ConsoleEnabled) problems.add(…);",
            "    if (currentMemberProvider.hasFallbackMember()) problems.add(…);",
            "    if (showSql) problems.add(…);",
            "    if (!problems.isEmpty()) {",
            "        throw new IllegalStateException(",
            '            "운영 설정이 안전하지 않아 서버를 띄우지 않습니다." + …);',
            "    }",
            "}"
          ]
        },
        evidence: {
          status: "구현 확인",
          note: "실제 운영은 Railway 가 같은 Dockerfile 로 띄웁니다.",
          url: "https://github.com/toadsam/MyStock-Desk/blob/main/backend/src/main/java/com/stockflow/global/config/ProductionGuard.java"
        }
      },
      {
        title:
          "외부 시세 조회가 실패해도 화면이 비지 않는 것은 갱신을 건너뛰기 때문이었습니다",
        problem:
          "처음에는 Provider 를 인터페이스로 두었으니 Yahoo 조회가 실패하면 Demo 로 자동 전환된다고 적어 두었습니다. 코드를 다시 읽으니 그렇지 않았습니다.",
        solution:
          "YahooFinanceMarketDataProvider 와 DemoMarketDataProvider 는 @ConditionalOnProperty 로 부팅 때 하나만 뜨고 실행 중에는 바뀌지 않습니다. 실제로 화면을 지키는 것은 두 곳입니다. 종목 조회가 실패하면 예외를 잡아 null 을 돌려주고, 갱신 루프는 null 인 종목을 건너뜁니다. 그래서 시세는 마지막으로 성공한 값 그대로 남고 화면은 비지 않습니다.",
        code: {
          filename: "MarketDataRefreshService.java",
          lines: [
            "StockQuoteSnapshot quote = quoteBySymbol.get(stock.getSymbol());",
            "if (quote == null) {",
            "    continue;",
            "}"
          ]
        },
        evidence: {
          status: "구현 확인 · 자동 폴백 주장 정정",
          note: "YahooFinanceMarketDataProvider(@ConditionalOnProperty) · (실패 시 null) · MarketDataRefreshService(건너뜀). GET /api/news 를 종목 없이 호출해 [] 를 받아 뉴스 쪽도 확인했습니다.",
          url: "https://github.com/toadsam/MyStock-Desk/blob/main/backend/src/main/java/com/stockflow/marketdata/service/MarketDataRefreshService.java"
        }
      }
    ],
    perf: {
      title: "공개일 점검 전 → 후 · 2026-11-10",
      lowerBetter: false,
      rows: [
        {
          label: "API 검사 통과 (152건 중)",
          before: 137,
          after: 146,
          unit: "건"
        },
        {label: "백엔드 테스트", before: 29, after: 41, unit: "개"}
      ],
      note: "컨트롤러와 요청 DTO 를 읽고 쓴 검사 스크립트로 조회 주소 56개를 전부 부르고, 막혀야 하는 요청(음수 금액 · 99조 원 · 미래 날짜 · 2만 자 메시지 · 남의 기록 수정 · 로그아웃한 토큰)을 섞어 152건을 돌렸습니다. 남은 6건은 상태 코드 관례(404 대신 400)입니다."
    },
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "Spring Boot",
      "Spring Data JPA",
      "H2/MySQL",
      "Recharts",
      "Docker"
    ],
    resultScreens: [
      {
        title: "mywave/portfolio",
        kind: "bars",
        bars: [
          {l: "보유 종목", p: 70, v: "표"},
          {l: "자산 비중", p: 55, v: "차트"},
          {l: "리스크", p: 30, v: "집중도"}
        ]
      },
      {
        title: "mywave/coach",
        kind: "feed",
        feed: [
          "이번 달 상태 요약",
          "목표 전망",
          "규칙 기반 답변",
          "면책 문장(데이터)"
        ]
      }
    ],
    // 2026-11-13 저녁: 「화면 19」 타일을 빼고 테스트·CI 를 올렸다. 화면 수는 tldr·metricsNote 에 남는다.
    // 테스트 98 은 저장소 HEAD(a5b5995)의 @Test 를 직접 센 값이고, 꺾은선은 커밋별로 센 29 → 41 → 87 → 98 이다.
    metrics: [
      {
        n: "146",
        l: "공개일 API 검사 통과 (152건 중)",
        sub: "점검 전 137 → 수정 후 146",
        mini: {kind: "bars", before: 137, after: 146},
        source: "공개일 점검 기록 · 남은 6건은 상태 코드 관례"
      },
      {
        n: "98",
        l: "백엔드 테스트",
        sub: "공개일 29 → 41 · 다음 날 98",
        mini: {kind: "line", points: [29, 41, 87, 98]},
        source: "통합 50 + 단위 48, H2"
      },
      {
        n: "3잡",
        l: "CI · 모든 push",
        sub: "테스트 · lint/build · compose 검사",
        source: "2026-11-02 도입 · 배포는 안 함"
      },
      {
        n: "111",
        l: "엔드포인트",
        sub: "MyWave 가 쓰는 것 55개",
        mini: {kind: "bars", before: 111, after: 55},
        source: "안 쓰는 56개는 남은 과제"
      }
    ],
    metricsNote:
      "외부 연동 4곳은 Yahoo Finance · Google News RSS · OpenDART · SEC EDGAR 입니다.",
    detail: {
      intro: {
        show: "대학생이 매일 여는 개인 재무 웹앱입니다. 홈에는 숫자 하나만 크게 둡니다. 오늘 더 써도 되는 돈. 이 숫자를 포함해 하루 예산·투자 가능 금액·달성률을 저장하지 않고 요청마다 기록에서 다시 계산하고, 화면 어디에도 예시 숫자를 채우지 않습니다.",
        bold: "하루 예산·투자 가능 금액·달성률을 저장하지 않고 요청마다 기록에서 다시 계산하고, 화면 어디에도 예시 숫자를 채우지 않습니다.",
        more: [
          "2026-05-25 첫 커밋 뒤 06월에 UI 를 MyWave 로 갈아엎었고, 10월에 홈을 「오늘 더 써도 되는 돈」 중심으로 다시 설계하면서 옛 화면 11장과 3,800줄짜리 MyWaveApp.tsx, 하드코딩된 투자 의견을 걷어냈습니다.",
          "2026-11-10 mywave.day 로 공개했고, 공개한 날 API 전수 검사 152건을 돌려 데모 계정 잠금·로그아웃 토큰 무효화 등 9건을 고쳤습니다. 다음 날 AI 코치를 모델 답변으로 바꾸면서 답을 검사하는 코드와 테스트를 같이 넣었습니다."
        ]
      },
      highlights: [
        {
          show: "숫자를 저장하지 않고 매번 계산합니다. 하루 예산·남은 생활비·투자 가능 금액·목표 달성률은 DB 에 없고, 소비를 하나 지우면 서버가 기록에서 다시 셉니다. 거래를 고치면 보유 종목도 처음부터 다시 재생합니다.",
          bold: true,
          more: "계산하는 곳이 한 곳뿐이라 홈·소비 화면·코치가 서로 다른 숫자를 말할 일이 없습니다. TodayService.today() 는 날짜를 주입받은 Clock 에서 얻어 테스트가 날짜를 고정해 확인합니다. 대신 재생에는 거래 수 n 에 비례하는 시간이 듭니다."
        },
        {
          show: "AI 코치는 모델이 문장을 쓰고 코드가 검사합니다. 답에 자료에 없는 숫자가 있으면 버리고, 투자 조언처럼 보이면 거절 문장으로 바꿉니다(CoachAnswerGuard · 테스트 15개).",
          more: "숫자는 서버가 계산해 자료로 주고 개인정보는 보내기 전에 가립니다. 하루 한도를 넘거나 모델을 못 부르면 규칙 답으로 돌아가 코치는 언제나 답합니다."
        },
        {
          show: "공개한 날 API 전수 검사 152건을 돌려 통과 137 → 146 으로 올렸고, 모든 push 에 CI 3잡이 돕니다. 운영 설정이 위험하면 서버가 뜨지 않습니다(ProductionGuard). 테스트는 29 → 41 → 98개.",
          more: "쓰기 테스트는 로컬 H2 에서만 하고 운영에는 읽기와 거절되는 요청만 보냈습니다. 점검은 Claude Code 와 함께 했고, 걸린 항목은 코드를 열어 원인을 확인한 뒤에만 문제로 적었습니다. 아직 못 한 것은 Flyway 없는 ddl-auto: update 와 모니터링입니다."
        }
      ],
      briefs: [
        {
          problem:
            "과거 거래의 단가를 고치면 그 뒤 평균단가가 조용히 틀어지고, 틀린 걸 알 방법이 없었습니다.",
          did: "등록·수정·삭제 세 경로가 전부 보유를 지우고 거래를 날짜순으로 처음부터 다시 재생하게 했습니다.",
          result:
            "어떤 순서로 고쳐도 결과가 하나로 수렴하고 실현손익도 같이 다시 계산됩니다. 비용은 거래 수에 비례하지만 한 사람의 기록이라 감수했습니다."
        },
        {
          problem:
            "정해진 문장 네 개로는 대화가 안 됐고, 모델을 붙이면 숫자를 어림하거나 「사세요」라고 답할 수 있었습니다.",
          did: "모델은 문장만 쓰게 하고, 답에 자료에 없는 숫자가 있으면 버리고 투자 조언처럼 보이면 거절 문장으로 바꾸는 검사를 코드로 넣었습니다. 개인정보는 보내기 전에 가립니다.",
          result:
            "테스트 15개로 이 동작을 확인합니다. 한도를 넘거나 검사에 걸리면 규칙 답으로 돌아가 코치는 언제나 답합니다. 대신 맞는 답도 버려질 수 있습니다."
        },
        {
          problem:
            "공개한 날 전수 검사 152건 중 15건이 걸렸습니다. 데모 계정 비밀번호를 누구나 바꿀 수 있었고, 로그아웃 토큰이 24시간 살아 있었습니다.",
          did: "DemoAccountPolicy 로 데모 계정 수정을 403, 로그아웃 토큰은 즉시 무효, 오류 문구는 서버가 적은 한글 문장으로 바꿨습니다.",
          result:
            "통과 137 → 146, 테스트 29 → 41(다음 날 98). 남은 6건은 상태 코드 관례라 범위에서 뺐습니다."
        },
        {
          problem:
            "개발용 시크릿이나 H2 콘솔이 켜진 채 운영에 올라가도 서버는 조용히 뜹니다.",
          did: "운영 설정에 기본값을 두지 않고, 부팅 때 ProductionGuard 가 다섯 가지를 검사해 걸리면 예외로 멈추게 했습니다. compose 는 비밀값이 비면 멈추고 헬스체크 순서로 뜹니다.",
          result: "CI 가 push 마다 테스트·빌드·compose 설정을 확인합니다."
        },
        {
          problem:
            "「Yahoo 가 실패하면 Demo 로 자동 전환」이라고 적어 두었는데 코드를 다시 읽으니 그렇지 않았습니다.",
          did: "Provider 는 부팅 때 하나만 뜨고, 조회 실패 종목은 null 로 건너뛰어 마지막 성공값을 유지한다는 실제 메커니즘으로 문장을 고쳤습니다.",
          result: "화면은 비지 않지만 폴백은 아닙니다."
        }
      ],
      summaries: {
        arch: "React + Vite 화면 19 · Spring Boot 엔드포인트 111(사용 55) · 외부 연동 4곳 · compose(MySQL → 백엔드 → nginx) · CI 3잡.",
        code: "Holding.buy()/sell() 의 이동평균과 MarketDataRefreshService 의 갱신 건너뛰기.",
        proc: "2026.05 도메인 설계 → 06 MyWave UI → 10 홈 재설계 → 11.02 운영 가드·CI → 11.10 공개와 점검 → 11.11 검사받는 AI 코치."
      },
      scenes: [
        {
          place: "trouble",
          kind: "steps",
          title: "push 한 번이 운영 부팅까지 지나는 문 네 개",
          steps: [
            {t: "push", d: ""},
            {
              t: "CI 3잡",
              d: "백엔드 테스트(H2) · 프론트 lint/build · compose 설정 검사",
              alt: {
                t: "하나라도 실패",
                d: "병합하지 않음",
                tone: "fail"
              }
            },
            {
              t: "기동 순서",
              d: "MySQL 헬스체크 → 백엔드 → nginx(포트 하나)",
              alt: {
                t: "비밀값이 비면 멈춤",
                d: "compose 의 ${VAR:?…} · prod 설정엔 기본값 없음",
                tone: "fail"
              }
            },
            {
              t: "부팅 가드",
              d: "ProductionGuard 다섯 검사",
              tone: "warn",
              alt: {
                t: "개발용 시크릿 · H2 콘솔",
                d: "예외로 부팅 거부",
                tone: "fail"
              }
            },
            {t: "/api/health", d: "DB 연결 확인 · 실패 시 503", tone: "ok"}
          ],
          note: "CI 는 배포하지 않습니다. 운영은 Railway 가 같은 Dockerfile 과 헬스체크로 띄웁니다.",
          source: "CI 설정과 compose, 운영 가드, 헬스체크 코드"
        },
        {
          place: "result",
          kind: "line",
          title: "백엔드 테스트 수",
          unit: "개",
          points: [
            {x: "", y: 29},
            {x: "11.10 공개일", y: 41},
            {x: "11.11 코치 검사", y: 87},
            {x: "11.11 코치 뉴스", y: 98}
          ],
          note: "공개일 점검에서 12개, 다음 날 AI 코치 검사와 뉴스에서 57개가 붙었습니다.",
          source: "29 는 공개일 점검 전 값"
        },
        {
          place: "trouble",
          kind: "steps",
          title: "시세 갱신 경로 · 실패하면 건너뛰기",
          steps: [
            {
              t: "부팅 때 Provider 하나",
              d: "@ConditionalOnProperty 로 Yahoo 또는 Demo 중 하나만 뜸. 실행 중엔 안 바뀜"
            },
            {
              t: "종목마다 시세 조회",
              d: "POST /api/data/refresh → Yahoo chart"
            },
            {
              t: "실패하면 null",
              d: "예외를 잡고 null (YahooFinanceMarketDataProvider)",
              tone: "warn"
            },
            {
              t: "null 은 건너뜀",
              d: "갱신 루프가 continue (MarketDataRefreshService)",
              alt: {
                t: "마지막 성공값 유지",
                d: "그래서 화면은 비지 않음",
                tone: "ok"
              }
            }
          ],
          note: "GET /api/news 를 종목 없이 불러 [] 를 받아 확인했습니다."
        }
      ]
    },
    kpt: {
      keep: [
        "숫자를 저장하지 않고 요청마다 기록에서 계산",
        "AI 역할을 문장 쓰기로 제한하고 답은 코드가 검사",
        "응답 DTO 마다 출처 문자열(DART OpenAPI · demo-public-disclosure · OFFICIAL/AGGREGATED)"
      ],
      problem: [
        "MyWave 가 쓰지 않는 엔드포인트 56개·테이블 10개가 백엔드에 남아 있음",
        "외부 시세를 범위 검증 없이 씀(현재가가 평균단가의 10배로 들어와 수익률 900% 가 찍힌 적)",
        "스키마 마이그레이션 도구 없이 ddl-auto: update",
        "서버 모니터링이 헬스체크 하나뿐이고 로그인 제한은 서버 메모리"
      ],
      try: [
        "안 쓰는 API·테이블 정리",
        "시세 범위 검증",
        "Flyway 도입 후 validate 로",
        "거래 CSV 가져오기 UI"
      ]
    },
    learningLead:
      "숫자를 저장하지 않고 요청마다 기록에서 다시 세는 쪽을 골랐습니다. 화면끼리 어긋날 자리를 없애는 대신 계산 비용을 냅니다.",
    learning:
      "폴백이라고 적어 둔 것이 코드에는 갱신 건너뛰기였습니다. 결과가 같아도 메커니즘을 다르게 적으면 그 문장 하나가 나머지 숫자까지 의심받게 하므로, 다시 읽고 고쳤습니다."
  },

  festflow: {
    tagline: "REALTIME FESTIVAL OPS · FULL-STACK WEB APP",
    // 2026-10-09: 이 절의 그림 셋(heroImage · resultShot · gallery)을 5월판에서 10월판으로
    // 바꿨다. 전부 운영 사이트의 눌러 보는 운영 매뉴얼(/guide/live) 연습 서버 화면이라
    // 실제 참가자 정보가 없다. 주점 손님 화면 위쪽의 단체 사진 띠는 잘라 냈다.
    // 옛 그림(public/projects/op/festflow-*.webp)은 지우지 않았다.
    heroImage: {
      src: "/projects/festflow/oct/festflow-oct-two-faces.webp",
      label: "같은 앱, 역할에 따라 다른 화면",
      // 정사각. 16:9 로 두면 5칸(약 480px)짜리 자리에서 폰이 96px 폭이 된다.
      ratio: "1/1",
      caption:
        "왼쪽은 참가자가 보는 사주 소개팅 목록, 오른쪽은 운영진이 보는 소개팅 관리자 화면입니다. 같은 앱에서 주소와 권한으로 갈립니다. 2026 가을축제 버전을 운영 매뉴얼(/guide/live)의 연습 서버 데이터로 찍었습니다."
    },
    // 2026-11-13 밤: 5월 화면 넷과 10월 화면 넷이 같은 구도(2100×900)라 전/후 슬라이더로 묶었다.
    // 다시 만들었다는 것이 글이 아니라 화면으로 먼저 보여야 한다는 본인 요청이다. 둘 다 실제 캡처이고
    // 10월 쪽은 연습 서버 데이터다. compact.compareFirst 로 첫 화면 타일 바로 아래에 온다.
    beforeAfter: {
      before: {
        label: "5월 대동제 · 기능을 늘어놓은 화면",
        shot: {
          src: "/projects/op/festflow-screens.webp",
          label: "2026.05 화면 넷",
          ratio: "21/9"
        },
        note: "기능은 많았지만 현장에서 실제로 운영한 것은 소개팅 하나였습니다."
      },
      after: {
        label: "10월 가을축제 · 현장에서 쓰는 화면",
        shot: {
          src: "/projects/festflow/oct/festflow-oct-screens.webp",
          label: "2026.10 화면 넷",
          ratio: "21/9"
        },
        note: "주점 주문 · 분실물 · 스태프 현황판을 새로 만들었고, 주문 142건(첫날)과 소개팅 가입 322명이 이 화면으로 들어왔습니다."
      }
    },
    problemShot: {
      src: "/projects/festflow/problem.webp",
      label: "기획 단계에서 정의한 축제 운영의 문제",
      ratio: "16/9",
      caption: "중간 기획 발표 자료 · 구현 전에 정리한 문제 정의"
    },
    // 이 페이지에서 가장 넓은 자리(약 1,216px)라 세로로 긴 폰 캡처를
    // 가로로 늘어놓기에 알맞다. 갤러리(약 390px)에 넣으면 글씨가 죽는다.
    resultShot: {
      src: "/projects/festflow/oct/festflow-oct-screens.webp",
      label: "10월 실제 화면 4종",
      ratio: "21/9",
      caption:
        "왼쪽 셋은 손님 화면(축제 첫 화면, 주점 메뉴 담기, 분실물 안내판), 오른쪽은 스태프의 자리 현황판입니다. 2026 가을축제 버전을 운영 매뉴얼(/guide/live)의 연습 서버 데이터로 찍었습니다."
    },
    gallery: [
      {
        src: "/projects/festflow/oct/festflow-oct-g-admin.webp",
        label: "총괄 화면",
        ratio: "4/5",
        caption:
          "주점 상태, 공지, 공연 일정, 분실물 등록을 한 화면에서 고칩니다. 공지를 올리면 SSE로 손님 화면이 바로 바뀝니다"
      },
      {
        src: "/projects/festflow/oct/festflow-oct-g-table.webp",
        label: "주점 테이블 고르기",
        ratio: "4/5",
        caption:
          "테이블 QR을 찍거나 번호를 골라 주문을 시작합니다. 포장 주문도 같은 흐름이고, 첫날 포장은 9건이었습니다"
      },
      {
        src: "/projects/festflow/oct/festflow-oct-g-match.webp",
        label: "소개팅 데이트 신청 현황",
        ratio: "4/5",
        caption:
          "받은 요청과 보낸 요청을 보는 신청함. 한 사람당 신청은 3건까지입니다"
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
      // 예전엔 "7개 SSE 채널 · 컨트롤러 26개 · 1인 구현" 이었다. 카드에서 코드량을
      // 지표에서 뺀 이유(능력으로 안 읽힌다)가 그대로 여기에도 적용된다 — 첫 표에
      // 코드량이 돌아와 있으면 카드 쪽이 과장으로 읽힌다. 코드량은 metricsNote 에.
      {
        k: "결과",
        v: "아주대 축제에서 두 번 실제 운영. 5월 AI 소개팅 하루, 10월 가을축제 이틀(방문자 7,078명 · 주점 첫날 주문 142건 · 소개팅 가입 322명)"
      },
      {
        k: "리뉴얼",
        v: "1차 2026.05 대동제(소개팅만 하루) → 전면 리뉴얼 2026.10 가을축제(주점·소개팅·스태프 이틀)"
      },
      {k: "내 역할", v: "1인 풀스택 (프론트 전체 + Spring Boot 백엔드 + 모델)"}
    ],
    // 저장소는 2026-10 에 비공개로 돌렸다(DB 덤프 CSV 와 원본 사진이 기록에 남아 있다).
    // 2026-11-13: 사진·DB 덤프·연락처를 빼고 가린 공개 사본 toadsam/AjouFesta 를 만들었다(한 커밋).
    // 근거 링크는 그 사본의 파일을 가리킨다. 커밋 기록은 원본에만 있다.
    demo: {
      live: "https://www.ajoufesta.com",
      // 2026-10-09 가을축제 버전 시연 영상. 있으면 Key Numbers 뒤에 영상 절이 생긴다.
      video: "https://www.youtube.com/watch?v=Jdo5ZNDG8Uk",
      repo: "https://github.com/toadsam/AjouFesta"
    },
    meta: [
      // 카드(resume.ts)와 같은 값. 2026-10-09 가을축제 개편까지 반영(리뉴얼 예정 → 끝).
      {label: "기간", value: "2026.04 ~ 2026.10 · 축제 두 번 현장 운영"},
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
      {n: "8", l: "SSE 실시간 채널"},
      {n: "5곳", l: "DB 행 잠금"},
      {n: "27", l: "요청 한도 규칙"}
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
      "대학 축제는 수십 개 부스가 동시에 운영되는데, 혼잡도·품절·공지·분실물 같은 상태를 실시간으로 공유하고 역할별로 접근할 도구가 없어 전화·메신저로 처리하고 있었습니다.",
    research: {
      // 인용 두 개("부스가 품절됐는지 본부에서는 전화를 돌려야…")를 뺐다.
      // 출처가 "운영 현장 문제 정의" · "방문객 관점" — 사람이 한 말이 아니라 본인이
      // 쓴 문제 정의를 따옴표로 감싼 것이었다. 실사용자가 있는 프로젝트에서 그건
      // 신뢰를 깎는다. 실제 들은 말이 생기면 그때 넣는다. 그날 이야기는 fieldDay 에.
      quotes: [],
      stat: {
        n: "7",
        l: "혼잡도·부스·공지·분실물·예약·스태프·이벤트 SSE 채널 수"
      }
    },
    hypothesis:
      "상태 변화는 종류별 SSE 채널로 즉시 푸시하고, 부스는 실제 지도 위 GPS 반경으로 판정합니다. 관리자·스태프·방문자가 같은 현황을 보게 하는 것이 목표였습니다.",
    process: [
      {t: "요구분석", d: "운영 흐름"},
      {t: "SSE 채널 설계", d: "7종 분리"},
      {t: "지도·GPS", d: "Leaflet·지오펜싱"},
      {t: "권한", d: "JWT 3등급"},
      {t: "혼잡 예측", d: "모델 + 폴백"}
    ],
    // ── 운영 당일 ─────────────────────────────────────────────────────────
    // 카드와 Key Numbers 가 「하루 동안 실제 운영 · 169명 · 424건 · 36건」을
    // 말하는데, 이 페이지 어디에도 AI Match 라는 단어가 없었다. 클릭한 이유를
    // 갚는 절이다. 줄마다 출처를 단다 — 숫자는 Solapi 메시지 로그를 사용자
    // 계정으로 직접 읽어 집계했고(2026-09-04, 10페이지 485행), 코드·문서는
    // 공개 저장소 그대로, 이유는 본인 서술이다. 추정(문구 길이와 LMS 의 인과,
    // SMS 단가 비교)은 싣지 않았다.
    // 2026-10-09: "now" 가 「지금이라면」(계획)이었는데, 가을축제에서 셋 다 실제로
    // 고쳐 돌렸으므로 라벨을 「10월에는」으로 바꾸고 계획 문장을 결과로 바꿨다.
    // 출처는 FestFlow 저장소 README 「5월 운영 이후 바뀐 것」 표와 docs/festflow/축제-결산.md.
    fieldDay: {
      title: "운영 당일 · 2026.05.22",
      nowLabel: "10월에는",
      lead: "아주대 대동제에서 AI Match 를 하루 동안 실제로 돌렸습니다. 등록 169명, 신청 424건, 성사 36건. 현장 운영에서 신청 상한, 문자 비용, 일정 조율과 관련된 문제를 확인했습니다.",
      items: [
        {
          t: "신청에 1인 상한이 없었습니다",
          happened:
            "같은 상대에게 중복 신청만 막았을 뿐, 한 사람이 여러 명에게 계속 신청할 수 있었습니다. 신청이 하루 424건까지 몰렸고, 신청마다 상대에게 알림 문자가 나가는 구조라 그만큼 발송이 시도됐습니다.",
          now: "1인당 신청을 3건으로 제한했습니다. 가을축제에서 신청 420건이 들어왔지만 한 사람에게 몰리지 않았습니다."
        },
        {
          t: "문자가 장문으로 나가 오후 4시에 잔액이 바닥났습니다",
          happened:
            "알림 문구에 링크가 붙어 있었고 문자는 전부 장문(LMS, 한 통 45원)으로 나갔습니다. 11:49 첫 발송, 15:06~15:57 사이 125통, 15:57경 잔액 0원. 그 뒤 244통이 연속으로 「잔액 부족」으로 나가지 못했습니다(그날 실패 합계는 247통). 예치금이 43.9원 남아 한 통에 1.1원이 모자랐습니다.",
          now: "문자 전송 실패는 로그만 남기고 신청 저장은 그대로 둡니다. 알림은 한 통씩 보내고 조율 문자는 번호당 2분에 한 통으로 묶었습니다. 이틀 동안 문자 문제가 없었습니다.",
          source:
            "Solapi 메시지 로그 실측 (05/22 시도 435 · 성공 188 · 잔액 부족 247)"
        },
        {
          t: "성사 뒤 일정 조율은 사람이 했습니다",
          happened:
            "앱 안에서 양쪽이 약속을 제안하고 확정하는 기능은 축제 사흘 전에 만들어 뒀습니다. 그러나 그 흐름을 현장에서 검증할 시간이 없어, 성사 36건은 운영진이 양쪽에 전화해 시간과 장소를 맞췄습니다. 수락 문자 문구부터 「곧 관리자가 연락해 일정을 조율해드릴게요」였습니다.",
          now: "앱에서 시간 제안, 확정, 30분 전 알림, 블라인드 채팅까지 처리했고 부스에서 30쌍이 만났습니다. 축제 전에 눌러 보는 운영 매뉴얼로 7개 흐름을 끝까지 돌려 봤습니다.",
          source:
            "저장소 커밋 이력(05/17 meetup API·화면) · AiMatchSmsNotifier 문구 · 관리자 설명서 §5"
        }
      ],
      // 그날 문자의 시간표 (2026-11-13). 시각과 건수는 전부 Solapi 로그 집계(2026-09-04)다.
      // 실패가 몇 시에 끝났는지는 로그에서 안 읽었으므로 끝 시각을 비운다(축 끝까지 빗금).
      // 244 는 잔액이 바닥난 뒤의 연속 실패, 247 은 그날 실패 합계(435 − 188)다.
      timeline: {
        title: "그날 문자 발송 · 2026.05.22",
        from: "11:00",
        to: "19:00",
        events: [
          {
            at: "11:49",
            until: "15:06",
            label: "첫 발송 뒤 3시간 17분 동안 63통",
            detail: "그날 성공 188통 중 오후 피크 전의 몫(188 − 125)",
            tone: "ok"
          },
          {
            at: "15:06",
            until: "15:57",
            label: "51분 동안 125통 성공",
            detail: "신청이 오후에 몰렸습니다. 한 통 45원(LMS).",
            tone: "ok"
          },
          {
            at: "15:57",
            label: "잔액 0원",
            detail: "예치금 43.9원, 한 통 45원에 1.1원 모자람",
            tone: "warn"
          },
          {
            at: "15:58",
            label: "이후 244통 연속 「잔액 부족」 실패",

            tone: "fail"
          }
        ],
        totals: [
          {label: "성공", n: 188, tone: "ok"},
          {label: "실패", n: 247, tone: "fail"}
        ],
        note: "시도 435통 중 성공 188, 실패 247. 신청 1건당 상대에게 1통, 수락 시 신청자에게 1통이 나가는 구조였고 1인당 신청 상한이 없었습니다.",
        source:
          "Solapi 메시지 로그(console.solapi.com) 2026.05.22, 2026-09-04 직접 집계"
      }
    },
    // ── 두 번째 운영 ──────────────────────────────────────────────────────
    // 2026-10-09 추가. 같은 앱을 가을축제 "바람"에서 이틀 돌린 기록이다.
    // 숫자는 전부 FestFlow 저장소 docs/festflow/축제-결산.md, 5월 문자 수치는
    // Solapi 메시지 로그(2026-09-04 집계). 8.5% 는 36 ÷ 424 로 계산한 값이다.
    // 시간 확정 줄 주의: 5월에도 제안·확정 기능은 있었다(05/17 커밋). 검증을 못 해서
    // 쓰지 않았을 뿐이라 "없었다" 고 쓰면 틀린다.
    // 화면 넷: 5월 소개팅(얼굴 흐림 처리본) / 10월 소개팅 / 주문 콘솔 / 요리사 창.
    // 10월 첫 화면 캡처는 출연 아티스트 사진이 크게 들어 있어 쓰지 않았다.
    secondRun: {
      title: '전면 리뉴얼 뒤 두 번째 운영 · 2026.10.07–08 가을축제 "바람"',
      lead: "5월에는 소개팅 하나만 하루 돌렸습니다. 그때 드러난 문제를 고쳐 소개팅을 다시 만들고, 주점 주문과 스태프 화면을 새로 붙여 총학생회 축제 운영 전체를 이 앱으로 이틀 돌렸습니다. 이틀 동안 서버 장애는 없었습니다.",
      stats: [
        {n: "7,078명", l: "축제 주간 방문자", s: "Vercel 10.02–09"},
        {n: "142건", l: "주점 첫날 주문", s: "주문 CSV 10.07"},
        {n: "246만원", l: "첫날 입금 확인 매출", s: "2,462,000원 · 주문 CSV"},
        {n: "48초", l: "주문 후 입금 확인", s: "중앙값 · 주문 CSV"},
        {n: "322명", l: "소개팅 가입", s: "관리자 통계"},
        {n: "97쌍", l: "소개팅 성사", s: "신청 420건 중 23%"},
        {n: "30쌍", l: "부스에서 만남", s: "관리자 통계"},
        {n: "0회", l: "이틀간 서버 장애", s: "축제 중 배포 5번"}
      ],
      scope: [
        {k: "운영 기간", before: "하루 (5/22)", after: "이틀 (10/7–8)"},
        {
          k: "현장에 낸 기능",
          before:
            "AI 소개팅 하나. 부스 예약은 개인정보 처리와 QA가 덜 돼 열지 않았습니다",
          after: "손님 앱, 주점 QR 주문, 사주 소개팅, 스태프 화면, 총괄 화면"
        },
        {k: "소개팅 가입", before: "169명", after: "322명"},
        {
          k: "소개팅 성사",
          before: "36건 (신청 424건 중 8.5%)",
          after: "97쌍 (신청 420건 중 23%)"
        },
        {
          k: "성사 뒤 만남",
          before: "운영진이 전화로 시간과 장소를 맞췄습니다",
          after: "앱에서 시간을 확정해 부스에서 30쌍이 만났습니다"
        },
        {
          k: "문자",
          before: "435통 시도, 잔액 부족으로 244통 실패",
          after: "이틀 동안 문자가 끊기지 않았습니다"
        },
        {
          k: "서버 테스트",
          before: "3파일",
          after: "23파일, 눌러 보는 운영 매뉴얼 흐름 7개"
        }
      ],
      shots: [
        {
          label: "5월 · AI Match 참가자 목록",
          src: "/projects/festflow/field-user.webp",
          alt: "5월 AI Match 참가자 목록 화면. 사진은 흐림 처리했습니다"
        },
        {
          label: "10월 · AI 사주 소개팅",
          src: "/projects/festflow/oct/aimatch.webp",
          alt: "10월 AI 사주 소개팅 첫 화면. 밤 테마와 치토 도사의 산통"
        },
        {
          label: "10월 새로 · 주점 주문 콘솔",
          src: "/projects/festflow/oct/console.webp",
          alt: "총학생회 주점 주문 콘솔. 빈 테이블, 입금 대기 주문, 품절 바꾸기"
        },
        {
          label: "10월 새로 · 메뉴별 요리사 창",
          src: "/projects/festflow/oct/kitchen.webp",
          alt: "요리사 창. 기기마다 맡은 메뉴를 고르는 화면"
        }
      ],
      remadeTitle: "다시 만든 것: 사주 소개팅",
      remade: [
        {
          t: "디자인",
          before: "Fest-A 번개 브랜딩의 밝은 카드 목록",
          after:
            "가을축제 마스코트 치토와 사주풍 밤 테마. 명식 표, 산통 뽑기, 궁합 풀이"
        },
        {
          t: "신청 상한",
          before:
            "같은 상대 중복만 막아서 한 사람이 몇 번이든 신청할 수 있었습니다",
          after: "1인당 신청 3건. 신청 420건이 한 사람에게 몰리지 않았습니다"
        },
        {
          t: "문자 처리",
          before:
            "신청마다 장문 문자가 나갔고 오후 3시 57분에 잔액이 떨어졌습니다. 전송 실패가 500 에러로 올라왔습니다",
          after:
            "실패는 로그만 남기고 신청 저장은 유지합니다. 알림은 한 통씩, 조율 문자는 번호당 2분에 한 통",
          source: "Solapi 로그 · AiMatchSmsNotifier"
        },
        {
          t: "시간 확정",
          before:
            "제안·확정 기능을 축제 사흘 전에 만들었지만 검증할 시간이 없어 쓰지 않았습니다",
          after:
            "20분 단위 시간 칸, 제안과 확정, 약속 30분 전 알림 문자, 확정 뒤에는 바꿀 수 없게 막았습니다",
          source: "FestFlow 커밋 05/17 · 09/29"
        },
        {
          t: "당일 진행",
          before: "운영진이 한 쌍씩 연락했습니다",
          after:
            "대기 장소 사진과 동선 안내, 도착 버튼, 스태프가 부스로 안내하는 4단계",
          source: "FestFlow 커밋 09/29–30"
        },
        {
          t: "블라인드 채팅",
          before: "없었습니다",
          after:
            "부스에서 10분 채팅한 뒤 둘 다 원할 때만 얼굴을 봅니다. 채팅은 14일 뒤 자동 삭제",
          source: "FestFlow 커밋 09/30"
        },
        {
          t: "사람이 몰렸을 때",
          before: "막을 방법이 없었습니다",
          after:
            "첫날 성사 82쌍에 부스 칸이 44개뿐이라, 그날 밤 만들어 둘째 날 아침 배포했습니다. 서로 동의하면 연락처 교환, 관리자 새 가입 막기 스위치"
        }
      ],
      added: [
        {
          t: "주점 QR 주문",
          what: "테이블 QR을 찍으면 메뉴를 담고 계좌이체한 뒤 상태 화면에서 조리 상황을 봅니다. 포장 주문도 같은 흐름입니다.",
          result: "첫날 주문 142건, 테이블 60개 중 55개 사용, 포장 9건."
        },
        {
          t: "주문 콘솔",
          what: "입금 대기 주문을 들어온 순서로 보여 주고, 새 주문이 오면 2초짜리 알림 소리를 냅니다.",
          result: "주문 후 입금 확인까지 중앙값 48초, 90%가 2.3분 안."
        },
        {
          t: "메뉴별 요리사 창",
          what: "축제 전날 밤에 주방이 메뉴별로 4곳이라는 걸 듣고, 완료를 주문 단위에서 메뉴 줄 단위로 바꿨습니다.",
          result: "주방에서 맡은 메뉴만 보여서 편했다는 반응이 나왔습니다."
        },
        {
          t: "스태프 화면",
          what: "내 근무와 서로의 상태, 위치, 교대를 폰 하나로 보고, 시간표는 엑셀로 한꺼번에 고칩니다.",
          result: "스태프 약 55명이 썼습니다."
        }
      ],
      prep: "축제 전에 점검을 세 번 했습니다. 10월 1일 보안과 부하, 10월 3~4일 소개팅 당일 흐름 시뮬레이션, 10월 5일 총점검입니다. AI 사진 변환이 DB 연결을 최대 120초 붙잡아 주문까지 멈출 수 있던 것, 부스 목록 쿼리 99개, 최신순이라 엉뚱한 주문을 입금 확인할 수 있던 입금 대기 목록 등 20개 정도를 미리 고쳤습니다. 로컬 부하 시험은 SSE 6,000개와 가상 방문자 600명 조건에서 초당 1,104건, p95 443ms, 오류 0이었습니다.",
      gaps: [
        "성사 97쌍에 부스 시간 칸이 44개라 성사의 3분의 2가 부스에서 만나지 못했습니다.",
        "바쁜 시간대(18~19시, 21시)에 입금 확인부터 서빙까지 30~45분이 걸렸습니다.",
        "축제 뒤 개인정보 삭제가 수동이고, 전화번호 인증이 없습니다."
      ],
      source: "저장소는 비공개이고 요청하면 공개합니다.",
      // 2026-10-09 추가. 원문은 FestFlow 저장소 docs/festflow/AI-활용.md(비공개).
      // 사례는 그 문서에 있는 것만 쓴다(본인 결정). 숫자도 같은 문서.
      ai: {
        title: "Claude Code와 같이 만든 방식",
        lead: "가을축제 버전은 Claude Code(코딩 에이전트)와 같이 만들었고, 코드의 대부분은 Claude가 작성했습니다. 만들 기능과 순서, 고칠지 미룰지는 현장을 보고 직접 정했고, AI가 고쳤다고 한 것은 테스트와 실제 기기, 운영 사이트에서 다시 확인했습니다.",
        stats: [
          {n: "129 / 130", l: "Claude 공동 작성 커밋 (9/7 이후)"},
          {n: "3 → 23", l: "서버 테스트 파일"},
          {n: "37건", l: "현장 불편 → 바꾼 것 기록"},
          {n: "4개", l: "총점검에서 고른 운영 전 수정"}
        ],
        roles: {
          mine: [
            "만들 기능과 우선순위",
            "현장 정보 전달(총학 확정, 주방 구성, 운영 시간)",
            "고칠지, 미룰지, 안 고칠지",
            "운영 데이터와 배포 시점",
            "현장에서 직접 눌러 보고 받아들일지"
          ],
          ai: [
            "코드와 테스트 작성",
            "코드를 영역별로 읽고 위험한 곳 찾기",
            "문서 초안과 지표 집계",
            "화면 녹화와 스크린샷 스크립트"
          ]
        },
        triage: {
          lead: '총점검에서는 주점, 소개팅, 스태프 화면, 배포 설정을 나눠 AI 네 개가 동시에 코드를 읽게 했습니다. 문제가 수십 개 나왔고, "내일 바로 운영한다면 지금 고쳐야 하는 것" 넷만 골랐습니다. 나머지는 결산의 남은 과제로 넘겼습니다.',
          items: [
            "문자 라이브러리 예외가 안 잡혀 한 통 실패로 신청 화면이 실패로 뜨고, 약속 전 알림이 전원에게 안 가던 것",
            "테이블 이름을 바꾸면 재배포 때 메뉴, 계좌, 테이블이 초기값으로 돌아가던 것",
            "다른 폰에서 건 품절이나 바꾼 계좌를 저장 버튼이 되돌리던 것",
            "입금 대기 목록에 새 주문이 맨 위로 끼어들어 엉뚱한 주문을 입금 확인할 수 있던 것"
          ]
        },
        verify: [
          {
            t: "재현 테스트",
            d: "고칠 때마다 그 문제를 재현하는 테스트를 같이 넣었습니다. 문자 예외는 연결이 안 되는 주소로 실제 라이브러리를 불러 잡히는지 봅니다."
          },
          {
            t: "두 기기 동시 테스트",
            d: "주문 콘솔 두 개를 띄워 한쪽에서 품절을 걸고 다른 쪽에서 저장한 뒤 품절이 남는지 확인했습니다."
          },
          {
            t: "매뉴얼을 테스트로",
            d: '스태프 교육용 /guide/live 를 Playwright가 "누를 곳"만 따라 끝까지 가는지 봅니다. 영상을 녹화하다 주점 1단계에서 막히는 버그를 찾았습니다.'
          },
          {
            t: "배포 후 확인",
            d: "push 뒤 Railway 배포 상태를 보고 운영 사이트를 직접 열어 바뀐 화면을 확인했습니다."
          }
        ],
        corrected: [
          {
            t: "시연 데이터 정리",
            d: "AI가 만든 정리 코드는 시연 데이터 넣기가 꺼진 서버에서만 돌았습니다. 운영 서버는 켜져 있어 가짜 분실물이 손님 화면에 남았고, 배포 뒤 운영 사이트에서 직접 확인해 다시 고치게 했습니다."
          },
          {
            t: "의도한 설정을 결함으로 보고",
            d: "리허설용으로 일부러 열어 둔 소개팅 날짜가 점검마다 결함으로 나왔습니다. 의도라는 걸 AI의 메모에 적어 같은 지적이 반복되지 않게 했습니다."
          },
          {
            t: "문서 말투",
            d: "문서 초안의 제목이 구호 같고 줄표가 많았습니다. 보통 문서 제목과 설명문으로 다시 쓰게 했습니다."
          }
        ],
        rules: [
          "되돌리기 어려운 작업(강제 push, 삭제, reset --hard)은 실행 전에 묻습니다",
          "운영 키와 암호는 화면에 출력하지 않고, 점검 결과는 저장소 밖에 둡니다",
          "운영 DB는 허락 없이 직접 고치지 않습니다. 정리는 조건에 맞는 것만 지우는 코드와 테스트로",
          "커밋 메시지에 무엇을 왜 바꿨는지 적습니다"
        ],
        source:
          "FestFlow 저장소 docs/festflow/AI-활용.md · 커밋 기록(Co-Authored-By) · 테스트-중-바꾼-것.md. 저장소는 비공개이고 요청하면 공개합니다."
      }
    },
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
          "요점은 가운데서 한 번 모였다가 종류별로 갈라진다는 것입니다. 상태를 한 채널로 다 밀면 관심 없는 이벤트까지 모두가 받습니다. 엔드포인트 7개는 StreamController.java 에 그대로 있습니다.",
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
        title: "Congestion Prediction: Fallback First",
        viewBox: [1180, 460],
        caption:
          "모델이 있으면 쓰고, 없으면 규칙으로 내려갑니다. 강등 조건은 셋입니다. 설정으로 꺼 두었거나, 스크립트나 모델 파일이 없거나, 20초 안에 끝나지 않을 때입니다. 정확도는 시뮬레이션 데이터 2,520건 기준이지 실제 축제 데이터가 아닙니다.",
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
        name: "SSE 8채널",
        desc: "커밋 뒤 발행 · 20초 하트비트 · 끊기면 15~20초 재조회"
      },
      {
        tag: "Order",
        name: "주문 직렬화",
        desc: "부스 행 잠금 · 부스별 락 15초 · 20초 중복 창"
      },
      {
        tag: "DB",
        name: "MySQL · PostgreSQL",
        desc: "엔티티 31 · 연결 풀 24 · 운영은 ddl-auto validate"
      }
    ],
    decisions: [
      {
        area: "실시간",
        pick: "SSE(채널 분리)",
        why: "단방향 푸시에 충분, 종류별 구독으로 부하 분리",
        alt: "WebSocket 기반 양방향 통신"
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
        why: "scikit-learn 자산을 그대로 쓰고, 모델 호출이 실패하면 규칙 기반 결과를 반환합니다",
        alt: "자바 안에서 재구현(학습·검증을 다시)"
      },
      {
        area: "인증",
        pick: "JWT 3등급",
        why: "관리자/스태프/방문자 무상태 권한",
        alt: "서버 세션 기반 인증"
      }
    ],
    // 2026-11-13 저녁: 예전 두 장(StreamController 7채널 · GPS 반경 80m)은 5월 구조 소개였다.
    // 10월 운영을 버틴 코드 두 장으로 바꿨다. 저장소 HEAD 11aebd6b(2026-10-09) 에서 그대로 옮겼다.
    coreCode: [
      {
        filename: "OrderController.java",
        caption:
          "같은 부스의 주문은 서버 안에서 한 줄로. 줄 서는 동안엔 DB 연결을 잡지 않고, 15초를 넘기면 503",
        highlightLines: [2, 3, 5, 12],
        lines: [
          "ReentrantLock lock = boothLocks",
          "        .computeIfAbsent(boothId, ignored -> new ReentrantLock(true));",
          "boolean locked = lock.tryLock(ORDER_QUEUE_WAIT_SECONDS, TimeUnit.SECONDS); // 15초",
          "if (!locked) {",
          '    throw new ResponseStatusException(SERVICE_UNAVAILABLE, "주문이 몰리고 있어요. …");',
          "}",
          "try {",
          "    // DB 가 잠금 충돌로 되돌린 주문은 통째로 취소된 것이라 다시 넣어도 안전하다.",
          "    for (int attempt = 1; ; attempt++) {",
          "        try {",
          "            return orderService.createOrder(boothId, requestDto);",
          "        } catch (PessimisticLockingFailureException e) {",
          "            if (attempt >= 3) throw e;",
          "        }",
          "    }",
          "} finally {",
          "    lock.unlock();",
          "}"
        ]
      },
      {
        filename: "StreamService.java",
        caption:
          "실시간 알림은 DB 커밋 뒤에 보냅니다. 롤백된 주문이 화면에 뜨지 않게",
        highlightLines: [5, 6],
        lines: [
          "if (TransactionSynchronizationManager.isSynchronizationActive()",
          "        && TransactionSynchronizationManager.isActualTransactionActive()) {",
          "    TransactionSynchronizationManager.registerSynchronization(",
          "            new TransactionSynchronization() {",
          "        @Override public void afterCommit() {",
          "            channel.offer(json);",
          "        }",
          "    });",
          "    return;",
          "}",
          "channel.offer(json);"
        ]
      }
    ],
    work: [
      {
        g: "프론트",
        items: ["지도·부스·관리 화면", "SSE 구독 + 15~20초 폴백 재조회"]
      },
      {
        g: "백엔드",
        items: [
          "SSE 채널 8개 · 커밋 뒤 발행 · 20초 하트비트",
          "주문 직렬화(행 잠금 5곳 · 부스별 락) · 레이트리밋 27규칙"
        ]
      },
      {
        g: "검증",
        items: ["서버 테스트 127개 · CI", "축제 전 점검 3회 · 부하 시험"]
      },
      {g: "모델", items: ["24 feature 학습·비교", "자바↔파이썬 연결·폴백"]},
      {g: "인증", items: ["JWT 관리자/스태프/방문자 분리"]},
      {g: "UX", items: ["PWA·오프라인·다국어·고대비", "카카오/네이버 길찾기"]}
    ],
    challenges: [
      {
        title:
          "주문이 한꺼번에 몰려도 주문번호와 테이블 한도가 겹치지 않게 했습니다",
        problem:
          "주점 QR 주문은 같은 부스로 동시에 들어옵니다. 두 주문이 같은 순간에 이 부스의 다음 주문번호와 이 테이블에 남은 한도를 읽으면 번호가 겹치고 한도가 샙니다. 통신이 끊겨 응답을 못 받은 손님은 버튼을 다시 누릅니다.",
        solution:
          "두 겹으로 줄을 세웠습니다. DB 에서는 부스 행을 잠그고 읽어(PESSIMISTIC_WRITE) 같은 부스의 주문을 한 번에 하나씩 처리합니다. 그 앞 서버 안에서는 부스마다 공정 락을 두어 최대 15초를 기다리게 했습니다. 줄을 서는 동안에는 DB 연결을 잡지 않으므로 주문이 몰려도 다른 요청이 쓸 연결이 남습니다. 15초를 넘기면 503 과 「잠시 후 다시 눌러 주세요」를 돌려주고, DB 가 잠금 충돌로 되돌린 주문은 통째로 취소된 것이라 세 번까지 다시 넣습니다.\n\n다시 누른 손님은 20초 창으로 받았습니다. 같은 테이블·입금자·메뉴의 주문이 20초 안에 또 오면 새로 만들지 않고 먼저 만든 주문을 돌려줍니다. 주방 쪽은 주문 행을 잠그고 상태를 바꾸며, 상태를 뒤로 돌리는 요청은 409 로 거절합니다. 이 잠금이 실제로 일을 하는지는 축제 뒤에 확인했습니다. 첫날 주문 142건은 번호가 0001~0142 로 겹치지 않았지만, 가장 몰린 순간이 같은 초에 2건이라 잠금이 시험받지 않았습니다. 그래서 실제 PostgreSQL 에서 주문 100건을 스레드 20개로 동시에 넣어 봤습니다. 잠금이 있으면 번호 100개가 빈 번호 없이 나왔고, 잠금만 뺀 대조군은 100건이 전부 저장됐는데 번호가 17종뿐이었습니다(CI 러너에서는 38종). 한 테이블에 20건을 넣으면 한도인 5건만 받았고, 같은 주문을 10번 눌러도 주문은 하나였습니다. 서버 안의 락은 서버 한 대를 전제로 하고, 서버 두 대로 겹쳐 보지는 않았습니다.",
        code: {
          filename: "OrderService.java",
          caption:
            "부스 행을 잠그고 읽은 뒤, 20초 안에 같은 주문이 있으면 그 주문을 돌려줍니다",
          highlightLines: [2, 6, 7],
          lines: [
            "@Transactional public BoothOrderDto createOrder(Long boothId, OrderCreateRequestDto dto) {",
            "    Booth booth = boothRepository.findByIdForUpdate(boothId)   // 부스 행 잠금",
            "            .orElseThrow(…);",
            "    …",
            "    // 통신이 끊겨 응답을 못 받고 다시 누른 경우다.",
            "    LocalDateTime duplicateSince = LocalDateTime.now()",
            "            .minusSeconds(DUPLICATE_WINDOW_SECONDS);           // 20초",
            "    for (BoothOrder existing : activeOnThisTable) { … 같은 입금자 · 같은 메뉴면 return existing … }",
            "}"
          ]
        },
        evidence: {
          status: "운영 기록 확인 · 축제 뒤 테스트",
          note: "2026-10-01 「축제 전 보안 · 동접 대비」 점검의 14항목 중 하나입니다(47파일 +1,781/−286). 10.07 주문 내역 CSV 142건에서 번호 중복 0건을 셌고, 2026-11-13 에 OrderConcurrencyTest 4개(Testcontainers PostgreSQL 16)를 더했습니다. 축제 전에 쓴 테스트가 아닙니다. 행 잠금은 주문·좌석·주방 완료·연락처 동의·전화번호 한도 다섯 곳에 있습니다. 코드는 공개 사본 toadsam/AjouFesta 에서 볼 수 있습니다(커밋 기록은 원본에만 있습니다).",
          url: "https://github.com/toadsam/AjouFesta/blob/main/backend/src/test/java/com/festflow/backend/concurrency/OrderConcurrencyTest.java"
        }
      },
      {
        title: "SSE가 끊겨도 주문 상태를 다시 읽도록 보완했습니다",
        problem:
          "서버 재시작이나 통신 끊김으로 SSE 이벤트를 받지 못하면 주문 화면이 이전 상태에 머물 수 있었습니다.",
        solution:
          "2026년 10월 보완에서는 SSE와 별도로 폴백 폴링을 추가했습니다. 주문 상태 화면은 미완료 주문을 20초마다, 운영 콘솔은 15초마다 조건부로 다시 읽고, 화면으로 돌아올 때도 재조회하도록 했습니다. 서버에는 20초 하트비트와 DB 커밋 후 이벤트 발행을 추가했습니다. 하트비트는 연결 확인을 돕는 신호이며, 주문 데이터 갱신은 별도의 조회가 담당합니다.",
        code: {
          filename: "OrderStatusPage.jsx",
          lines: [
            "const refresh = () => {",
            '  if (document.visibilityState === "hidden") return;',
            "  fetchOrder(orderId, key)",
            "    .then((data) => alive && setOrder(data))",
            "    .catch(() => {});",
            "};",
            "const timer = window.setInterval(refresh, 20000);",
            'document.addEventListener("visibilitychange", refresh);'
          ]
        },
        evidence: {
          status: "전후 코드로 확인",
          // 저장소가 비공개(2026-10)라 커밋 링크는 404 다. 열람 요청 메일로 바꿨다(2026-11-13).
          note: "주문 화면은 20초, 운영 콘솔은 15초마다 폴백 폴링을 하고, 서버는 20초 하트비트를 보내며 이벤트는 커밋 뒤에 발행합니다. 코드는 공개 사본 toadsam/AjouFesta 에서 볼 수 있습니다(커밋 기록은 원본에만 있습니다).",
          url: "https://github.com/toadsam/AjouFesta/blob/main/backend/src/main/java/com/festflow/backend/service/stream/StreamService.java"
        }
      },
      {
        title: "AI 그림 변환이 DB 연결을 붙잡아 주문까지 멈출 수 있었습니다",
        problem:
          "소개팅 가입은 사진을 AI 그림으로 바꿉니다. 축제 전 점검에서 이 변환이 트랜잭션 안에서 OpenAI 를 기다리며 DB 연결을 최대 120초 붙잡는 것을 찾았습니다. 가입 10건이 겹치면 연결 풀이 비어 주점 주문까지 멈추는 구조였습니다.",
        solution:
          "DB 는 앞뒤로 잠깐씩만 쓰게 바꿨습니다. 짧은 트랜잭션에서 전화번호 행을 잠그고 변환 횟수를 미리 하나 잡은 뒤, 트랜잭션 밖에서 OpenAI 를 부르고, 실패하면 잡아 둔 횟수를 돌려줍니다. 동시 변환은 세마포어로 12개까지만 받고 자리가 없으면 503 을 돌려줍니다. 연결 풀은 10 에서 24 로 올렸습니다(Railway Postgres 최대 100 안쪽). 문자도 같은 원칙이라 커밋 뒤에 보내고, 전송 실패는 로그만 남기고 신청 저장은 그대로 둡니다. 5월에 문자 실패가 500 으로 올라와 신청까지 깨지던 것을 고친 자리입니다.",
        code: {
          filename: "AiMatchService.java",
          caption:
            "① 짧은 트랜잭션에서 횟수를 잡고 ② 트랜잭션 밖에서 OpenAI ③ 실패하면 되돌립니다",
          highlightLines: [1, 3, 8, 11],
          lines: [
            "acquired = imageConversionSlots.tryAcquire(IMAGE_CONVERSION_WAIT_SECONDS, SECONDS);",
            "if (!acquired) throw new ResponseStatusException(SERVICE_UNAVAILABLE, …);",
            "int usedCount = transactionTemplate.execute(status -> {      // ① 짧게",
            "    AiMatchPhoneUsage usage = getOrCreatePhoneUsageForUpdate(phoneNumberKey);",
            "    usage.recordSuccessfulImageConversion();",
            "    return usage.getSuccessfulImageConversionCount();",
            "});",
            "try {                                                       // ② 트랜잭션 밖",
            "    String generated = aiImageGenerationService.generateFestivalProfileImage(…);",
            "} catch (IOException | RuntimeException e) {",
            "    releaseImageConversion(phoneNumberKey);                 // ③ 되돌림",
            "    throw e;",
            "}"
          ]
        },
        evidence: {
          status: "전후 코드로 확인 · 점검 기록",
          note: "저장소 docs/festflow/축제-결산.md 「보안과 부하 (10월 1일)」 절에 적은 기록입니다. 같은 점검에서 부스 목록 조회를 쿼리 99개에서 3개로 줄이고 1초 캐시와 gzip 을 넣었습니다. 10월 가입 322명 동안 서버 장애는 없었습니다.",
          url: "https://github.com/toadsam/AjouFesta/blob/main/backend/src/main/java/com/festflow/backend/service/AiMatchService.java"
        }
      },
      // "모든 상태를 한 채널로 밀면 부하가 컸다" 카드를 뺐다. 부하를 잰 적이 없다
      // (kpt.problem 에 "부하 테스트 부족" 이라고 스스로 적어 뒀다) — 겪은 문제가
      // 아니라 설계 근거를 문제처럼 쓴 것이고, 결정표 "실시간" 행과 겹친다.
      {
        title:
          "혼잡 예측 모델의 실행 실패나 지연이 부스 목록 API에 영향을 줄 수 있었습니다",
        problem:
          "Java API에서 Python 예측 결과를 사용하려면 실행 환경이나 모델 파일이 없거나 실행이 지연되는 경우에도 응답을 만들 경로가 필요했습니다.",
        solution:
          "처음 구현에 별도 Python 프로세스 실행과 기본 20초의 waitFor 제한을 넣었습니다. 설정 off·파일 없음·실행 실패 등으로 모델 결과가 비면 호출자가 규칙 기반 결과를 만듭니다. 요청 스레드는 프로세스를 기다리므로 비동기 처리나 전체 HTTP 응답의 20초 상한을 보장하는 구현은 아닙니다.",
        code: {
          filename: "PythonCongestionModelService.java",
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
        },
        evidence: {
          status: "코드로 확인",
          note: "처음 구현(PythonCongestionModelService.java) 기준의 설명입니다. 그 뒤에 Java 로 옮긴 경로가 추가됐습니다. 코드는 공개 사본 toadsam/AjouFesta 에서 볼 수 있습니다(커밋 기록은 원본에만 있습니다).",
          url: "https://github.com/toadsam/AjouFesta/blob/main/backend/src/main/java/com/festflow/backend/service/PythonCongestionModelService.java"
        }
      }
    ],
    tech: [
      "React",
      "Vite",
      "React Leaflet",
      "PWA",
      "Spring Boot 3",
      "JPA",
      "JWT",
      "SSE",
      "MySQL / PostgreSQL",
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
    // 2026-11-13: 타일마다 출처(source)와 보조 한 줄(sub)을 달았다. 값은 metricsNote 와
    // 같은 곳에서 왔고 새 숫자는 없다. 322명 타일의 작은 막대는 5월 169 → 10월 322.
    // 2026-11-13 저녁: 타일을 여덟 칸으로 늘렸다(본인 요청 「다 있었으면」). 윗줄 넷은 사람이 쓴 숫자,
    // 아랫줄 넷은 서버가 버틴 숫자다. 격자가 4열이라 여덟이면 두 줄이 꽉 찬다.
    // 아랫줄 출처는 전부 저장소 docs/festflow/축제-결산.md 와 README(2026-10-09), 테스트 수는 @Test 를 직접 셈.
    metrics: [
      {
        n: "7,078명",
        l: "10월 축제 주간 방문자",
        sub: "Vercel 집계 10.02–09 · 축제는 10.07–08",
        source: "Vercel Web Analytics · 10.02–09 · 축제 이틀보다 넓은 창"
      },
      {
        n: "142건",
        l: "10월 주점 첫날 주문",
        sub: "테이블 60개 중 55개 · 포장 9건",
        source: "주점 주문 콘솔 CSV · 10.07 하루분(10.08 CSV 없음)"
      },
      {
        n: "322명",
        l: "10월 소개팅 가입",
        sub: "5월 169명 → 10월 322명",
        mini: {kind: "bars", before: 169, after: 322},
        source: "소개팅 관리자 통계 · 5월 169명은 AI Match 관리자 화면"
      },
      {
        n: "169명",
        l: "5월 AI Match 등록자",
        sub: "신청 424건 · 성사 36건 · 하루 운영",
        source: "AI Match 관리자 화면 · 2026.05.22 · 활성 115 / 전체 169"
      },
      {
        n: "0건",
        l: "축제 이틀 서버 장애",
        sub: "축제 중 배포 5회",
        source: "10.07–08 · Railway 서버와 Vercel 사이트"
      },
      {
        n: "127개",
        l: "서버 테스트",
        sub: "5월 3파일 → 24파일 · 4개는 축제 뒤",
        mini: {kind: "bars", before: 3, after: 24},
        source: "푸시마다 CI 에서 실행"
      },
      {
        n: "99 → 3",
        l: "부스 목록 조회 쿼리",
        sub: "축제 전 점검 · 1초 캐시와 gzip 도 같이",
        mini: {kind: "bars", before: 99, after: 3},
        source: "2026-10-01 · 쿼리 개수"
      },
      {
        n: "0.8분",
        l: "주문 → 입금 확인 (중앙값)",
        sub: "90%가 2.3분 안 · 서빙까지 중앙값 31분",
        source: "10.07 주문 142건 · 서빙은 기록된 117건"
      }
    ],
    // ── 상세 페이지에서 손으로 쓰는 칸 (2026-11-13) ─────────────────────
    // 공용 틀이 projects.ts 의 5월판 설명("실시간 부스 관리 시스템")과 자동으로 자른
    // 문장을 쓰던 자리다. 새 사실은 없고, 이 파일과 resume.ts 에 이미 있는 말을 짧게
    // 다시 썼다. 숫자는 위 metrics · fieldDay · secondRun 과 같은 값이어야 한다.
    detail: {
      intro: {
        show: "10월 가을축제 이틀 동안 주점 QR 주문·소개팅·스태프 화면을 장애 없이 운영했습니다.",
        bold: "10월 가을축제 이틀 동안 주점 QR 주문·소개팅·스태프 화면을 장애 없이 운영했습니다.",
        more: [
          "아주대 축제에서 두 번 실제로 돌린 축제 운영 웹앱입니다. 5월 대동제에서 AI 소개팅을 하루 운영하며 신청 상한과 문자 예산이 없다는 걸 겪었습니다.",
          "손님은 QR 로 주점 메뉴를 담고 입금을 확인받으며, 소개팅 신청·확정·30분 전 알림·블라인드 채팅까지 앱 안에서 끝납니다.",
          "운영진은 총괄 화면에서 주점 상태·공지·분실물을 고치고, 공지는 SSE 로 손님 화면에 바로 닿습니다. 스태프 약 55명이 /staff 화면을 썼습니다.",
          "React(Vite) PWA + Spring Boot 3 · JPA · JWT · SSE. 1인 풀스택이고, 10월 개편은 Claude Code 와 함께 만들었습니다(커밋 130개 중 129개 공동 작성).",
          "서버 쪽 준비는 축제 엿새 전 한 커밋에 모여 있습니다(2026-10-01, 47파일). 주문 직렬화, 커밋 뒤 SSE 발행과 20초 하트비트, 외부 호출을 트랜잭션 밖으로, 부스 목록 쿼리 99 → 3, 연결 풀 24."
        ]
      },
      highlights: [
        {
          show: "문자 244통 실패의 원인을 로그로 찾아, 문자가 실패해도 신청은 저장되게 했습니다.",
          bold: true,
          more: "장문 LMS 가 45원씩 나가 오후 3시 57분에 잔액이 0원이 됐습니다. Solapi 메시지 로그 05/22: 시도 435 · 성공 188 · 실패 247(잔액이 바닥난 뒤 연속 244). 10월에는 문자를 DB 커밋 뒤에 보내고, 전송 실패는 로그만 남기며 저장은 그대로 둡니다. 조율 문자는 번호당 2분에 한 통으로 묶었습니다."
        },
        {
          show: "같은 부스로 몰리는 주문을 한 줄로 세워 주문번호와 테이블 한도가 겹치지 않게 했습니다.",
          more: "DB 행 잠금과 부스별 락(15초 대기 후 503)을 두 겹으로 두고, 20초 안에 다시 누른 주문은 먼저 만든 주문을 돌려줍니다. 첫날 142건이 이 경로로 들어왔습니다. 행 잠금은 주문·좌석·주방 완료·연락처 동의·전화번호 한도 다섯 곳에 있고, 주문 상태를 뒤로 돌리는 요청은 409 입니다. 축제 뒤 실제 PostgreSQL 에서 100건을 겹쳐 보니 잠금이 있으면 번호가 100개, 잠금을 빼면 17개였습니다. 서버 한 대를 전제로 한 설계입니다."
        },
        {
          show: "축제 엿새 전, AI 변환이 DB 연결을 붙잡는 것을 찾아 고쳤습니다.",
          more: "변환이 연결을 최대 120초 잡던 것을 트랜잭션 밖으로 빼고, SSE 가 끊겨도 화면이 멈추지 않게 20초 하트비트와 폴백 폴링을 넣었습니다. 축제 중 배포는 5회였습니다. 1인당 신청 상한(3건)과 시간 확정·블라인드 채팅으로 5월에 사람이 전화로 하던 조율을 앱이 처리했습니다(부스에서 30쌍 만남). 부하 시험은 2026-11-13 에 스크립트를 새로 써서 다시 쟀습니다. SSE 6,000개 + 가상 방문자 600명에서 초당 1,018건, p95 938ms, 오류 0 이었습니다(로컬, 조회만)."
        }
      ],
      briefs: [
        {
          problem:
            "같은 부스로 주문이 동시에 들어오면 주문번호가 겹치고 테이블 한도가 샜고, 응답을 못 받은 손님은 버튼을 다시 눌렀습니다.",
          did: "부스 행을 잠그고 읽게 하고, 그 앞에 부스별 락을 두어 DB 연결을 잡지 않은 채 최대 15초 줄을 서게 했습니다. 20초 안에 같은 주문이 또 오면 먼저 만든 주문을 돌려줍니다.",
          result:
            "첫날 주문 142건이 이 경로로 들어왔고, 입금 확인까지 중앙값 0.8분이었습니다. 축제 뒤 테스트에서 100건 동시 주문의 번호 중복은 0건, 잠금을 뺀 대조군은 83건이었습니다."
        },
        {
          problem:
            "서버 재시작이나 통신 끊김으로 SSE 이벤트를 놓치면 주문 화면이 옛 상태에 머물렀습니다.",
          did: "SSE 와 별도로 폴백 폴링을 넣었습니다. 주문 화면은 미완료 주문을 20초마다, 운영 콘솔은 15초마다 다시 읽고, 화면으로 돌아올 때도 재조회합니다. 서버에는 20초 하트비트와 DB 커밋 뒤 이벤트 발행을 넣었습니다.",
          result:
            "이틀 운영 동안 주문 화면이 멈춘 신고가 없었습니다. 하트비트는 연결 확인용이고 데이터 갱신은 조회가 맡습니다."
        },
        {
          problem:
            "AI 그림 변환이 트랜잭션 안에서 OpenAI 를 기다리며 DB 연결을 최대 120초 잡았습니다. 가입 10건이 겹치면 주문까지 멈추는 구조였습니다.",
          did: "횟수만 짧은 트랜잭션에서 잡고 OpenAI 는 트랜잭션 밖에서 부르게 했습니다. 동시 변환은 12개로 묶고 연결 풀은 24 로 올렸습니다. 문자는 커밋 뒤에 보냅니다.",
          result:
            "가입 322명 동안 서버 장애가 없었습니다. 같은 점검에서 부스 목록 쿼리를 99개에서 3개로 줄였습니다."
        },
        {
          problem:
            "Java API 가 Python 예측을 부르는데, 실행 환경이나 모델 파일이 없거나 늦어도 부스 목록 응답은 나가야 했습니다.",
          did: "예측을 별도 Python 프로세스로 띄우고 기본 20초 waitFor 제한을 뒀습니다. 설정 off·파일 없음·실행 실패로 결과가 비면 호출자가 규칙 기반 점수를 만듭니다.",
          result:
            "모델이 없어도 목록 API 는 답합니다. 다만 요청 스레드가 프로세스를 기다리므로 전체 HTTP 응답 시간의 20초 상한을 보장하는 구현은 아닙니다."
        }
      ],
      summaries: {
        second:
          "코드는 대부분 AI 가 쓰고, 무엇을 만들지와 받아들일지는 직접 정했습니다.",
        arch: "Spring Boot REST + SSE 8채널 · 행 잠금 5곳 · 레이트리밋 27규칙.",
        code: "부스별 주문 줄 세우기(OrderController)와 커밋 뒤 SSE 발행(StreamService).",
        proc: "운영 흐름 분석 → SSE 채널 → 지도·GPS → 권한 → 혼잡 예측, 그리고 5월 운영 뒤 10월 개편."
      },
      // 2026-11-14 이야기 배치. 시안 일곱 중 본인이 고른 G(문제였던 것 → 고친 것 → 확인 표).
      // 새 사실은 없다. 위 fieldDay · challenges · secondRun · scenes 에 있는 말을 표 한 칸 분량으로 다시 묶었다.
      // 숫자는 그 값들과 같아야 한다.
      story: {
        problem: {
          eyebrow: "문제",
          title: "축제 정보가 실시간으로 이어지지 않았습니다.",
          em: "실시간으로 이어지지 않았습니다.",
          lead: "대학 축제는 수십 개 부스가 동시에 돌아갑니다. 혼잡도, 품절, 공지, 분실물 같은 상태를 함께 볼 도구가 없어서 전화와 메신저로 처리하고 있었습니다.",
          quote:
            "관리자, 스태프, 방문자가 같은 현황을 보게 하는 것이 목표였습니다.",
          after:
            "그래서 상태 변화는 종류별 SSE 채널로 바로 밀고, 부스는 실제 지도 위 GPS 반경으로 판정하기로 했습니다."
        },
        field: {
          eyebrow: "5월 첫 운영 · 2026.05.22",
          title: "하루 운영에서 문자 435통 중 244통이 실패했습니다.",
          em: "244통이 실패했습니다.",
          lead: "아주대 대동제에서 AI 소개팅(AI Match)을 하루 동안 실제로 돌렸습니다. 기능은 돌아갔는데, 운영에서 상한이 없다는 문제가 먼저 드러났습니다.",
          facts: [
            {n: "169명", l: "등록"},
            {n: "424건", l: "신청"},
            {n: "36건", l: "성사"}
          ]
        },
        ledger: {
          eyebrow: "겪고, 고치고, 확인한 여섯 가지",
          title: "문제 하나에 고친 것 하나, 확인 하나.",
          em: "고친 것 하나, 확인 하나.",
          lead: "위 셋은 5월 운영에서 겪은 것이고, 아래 셋은 10월 축제 엿새 전 점검에서 찾은 것입니다. 가로로 한 줄씩 읽으면 됩니다.",
          groups: [
            {
              label: "5월 운영에서 겪은 것 · 2026.05.22",
              short: "5월에 겪은 것",
              rows: [
                {
                  problem: {
                    t: "신청에 1인 상한이 없었습니다",
                    d: "같은 상대 중복만 막아서 한 사람이 여러 명에게 계속 신청할 수 있었습니다. 신청이 하루 424건까지 몰렸고, 신청마다 문자가 나갔습니다."
                  },
                  fix: {
                    t: "1인당 신청 3건",
                    d: "한 사람이 보낼 수 있는 신청을 3건으로 제한했습니다."
                  },
                  check: {
                    big: "420건",
                    d: "10월 신청 420건이 한 사람에게 몰리지 않았습니다."
                  }
                },
                {
                  problem: {
                    t: "문자 435통 중 244통이 실패했습니다",
                    d: "알림 문구에 링크가 붙어 문자가 전부 장문(한 통 45원)으로 나갔고 15:57 에 잔액이 0원이 됐습니다. 전송 실패가 500 에러로 올라와 신청까지 깨졌습니다."
                  },
                  fix: {
                    t: "문자 실패와 신청 저장을 분리",
                    d: "문자는 DB 커밋 뒤에 보내고, 실패는 로그만 남깁니다. 조율 문자는 번호당 2분에 한 통으로 묶었습니다."
                  },
                  check: {
                    t: "이틀 동안 문자 문제가 없었습니다",
                    src: "Solapi 로그 실측 (시도 435 · 성공 188 · 잔액 부족 247)"
                  }
                },
                {
                  problem: {
                    t: "성사 뒤 일정 조율을 사람이 했습니다",
                    d: "약속 제안·확정 기능은 축제 사흘 전에 만들었지만 검증할 시간이 없었습니다. 성사 36건은 운영진이 양쪽에 전화해 맞췄습니다. 수락 문자 문구부터 「곧 관리자가 연락해 일정을 조율해드릴게요」였습니다."
                  },
                  fix: {
                    t: "앱 안에서 약속까지",
                    d: "시간 제안, 확정, 30분 전 알림, 블라인드 채팅을 앱에서 처리했습니다. 축제 전에 운영 매뉴얼로 7개 흐름을 끝까지 돌려 봤습니다."
                  },
                  check: {
                    big: "30쌍",
                    d: "부스에서 만났습니다. 성사는 97쌍(신청의 23%)이었습니다.",
                    src: "소개팅 관리자 통계 · 관리자 설명서"
                  }
                }
              ]
            },
            {
              label: "10월 축제 엿새 전 점검에서 찾은 것 · 2026.10.01",
              short: "축제 전 점검",
              intro:
                "10월에는 주점 QR 주문이 새로 붙어 같은 부스로 주문이 몰립니다. 화면보다 먼저, 몰렸을 때 깨지는 자리를 찾아 고쳤습니다. 한 커밋에 모여 있습니다(47파일).",
              rows: [
                {
                  problem: {
                    t: "주문이 몰리면 번호가 겹칠 수 있었습니다",
                    d: "같은 부스로 주문이 동시에 들어오면 주문번호가 겹치고 테이블 한도가 샜습니다. 응답을 못 받은 손님은 버튼을 다시 눌렀습니다."
                  },
                  fix: {
                    t: "주문을 한 줄로",
                    d: "부스 행을 잠그고 읽고, 그 앞에 부스별 줄(최대 15초)을 세웠습니다. 줄을 서는 동안에는 DB 연결을 잡지 않습니다. 20초 안에 같은 주문이 오면 먼저 만든 주문을 돌려줍니다."
                  },
                  check: {
                    when: "축제 뒤 검증 · 2026-11-13",
                    big: "100 대 17",
                    d: "동시 주문 100건의 서로 다른 번호. 잠금이 있으면 100개, 빼면 17개였습니다. 축제 첫날 142건은 번호 중복 0건, 입금 확인까지 중앙값 0.8분이었습니다.",
                    src: "10.07 주문 CSV"
                  },
                  scene: "주문 한 건이 지나는 길 · 겹치지 않게 세운 줄",
                  challenge: 0
                },
                {
                  problem: {
                    t: "AI 그림 변환이 DB 연결을 붙잡았습니다",
                    d: "소개팅 가입은 사진을 AI 그림으로 바꿉니다. 이 변환이 트랜잭션 안에서 OpenAI 를 기다리며 연결을 최대 120초 잡았습니다. 가입 10건이 겹치면 주점 주문까지 멈추는 구조였습니다."
                  },
                  fix: {
                    t: "외부 호출을 트랜잭션 밖으로",
                    d: "횟수만 짧은 트랜잭션에서 잡고 OpenAI 는 밖에서 부릅니다. 동시 변환은 12개, 연결 풀은 10 에서 24 로 올렸습니다."
                  },
                  check: {
                    big: "0건",
                    d: "가입 322명 동안 서버 장애가 없었습니다. 같은 점검에서 부스 목록 쿼리를 99개에서 3개로 줄였습니다.",
                    src: "2026.10.01 점검"
                  },
                  challenge: 2
                },
                {
                  problem: {
                    t: "SSE 를 놓치면 화면이 옛 상태에 머물렀습니다",
                    d: "서버 재시작이나 통신 끊김으로 이벤트를 놓치면 주문 화면이 바뀌지 않았습니다."
                  },
                  fix: {
                    t: "끊겨도 다시 읽기",
                    d: "주문 화면은 20초, 운영 콘솔은 15초마다 다시 읽고, 화면으로 돌아올 때도 읽습니다. 서버에는 20초 하트비트를 넣고 이벤트는 커밋 뒤에 발행합니다."
                  },
                  check: {
                    t: "이틀 동안 주문 화면이 멈춘 신고가 없었습니다"
                  },
                  challenge: 1
                }
              ]
            }
          ]
        },
        built: {
          eyebrow: "새로 만든 화면",
          title: "주점 주문과 스태프 화면을 새로 붙였습니다.",
          em: "새로 붙였습니다.",
          lead: "5월에는 소개팅 하나만 하루 돌렸습니다. 10월에는 총학생회 축제 운영 전체를 이 앱으로 이틀 돌렸습니다.",
          items: [
            {
              t: "주점 QR 주문",
              d: "테이블 QR 을 찍으면 메뉴를 담고 계좌이체한 뒤 상태 화면에서 조리 상황을 봅니다. 포장 주문도 같은 흐름입니다.",
              r: "첫날 142건 · 테이블 60개 중 55개 · 포장 9건",
              src: "/projects/festflow/oct/phone-table.webp"
            },
            {
              t: "주문 콘솔",
              d: "입금 대기 주문을 들어온 순서로 보여 주고, 새 주문이 오면 2초짜리 알림 소리를 냅니다.",
              r: "입금 확인까지 중앙값 48초 · 90%가 2.3분 안",
              src: "/projects/festflow/oct/phone-console.webp"
            },
            {
              t: "메뉴별 요리사 창",
              d: "축제 전날 밤 주방이 메뉴별로 4곳이라는 걸 듣고, 완료를 주문 단위에서 메뉴 줄 단위로 바꿨습니다.",
              r: "주방에서 맡은 메뉴만 보여 편했다는 반응",
              src: "/projects/festflow/oct/phone-kitchen.webp"
            },
            {
              t: "스태프 · 총괄 화면",
              d: "내 근무와 서로의 상태, 위치, 교대를 폰 하나로 봅니다. 총괄 화면에서 공지를 올리면 SSE 로 손님 화면이 바로 바뀝니다.",
              r: "스태프 약 55명이 사용",
              src: "/projects/festflow/oct/phone-admin.webp"
            }
          ]
        },
        verify: {
          eyebrow: "검증",
          title: "잠금을 빼면 주문번호 100개 중 83개가 겹쳤습니다.",
          em: "83개가 겹쳤습니다.",
          tag: "축제가 끝난 뒤에 한 검증입니다 · 2026-11-13",
          lead: "첫날 142건은 번호가 0001부터 0142까지 겹치지 않았습니다. 그런데 가장 몰린 순간이 같은 초에 2건이라, 잠금이 실제로 일을 했는지는 알 수 없었습니다. 그래서 실제 PostgreSQL 에 주문 100건을 동시에 넣어 봤습니다.",
          scene: "주문 100건을 동시에 넣었을 때 생긴 서로 다른 주문번호",
          boxes: [
            {
              n: "5건",
              unit: "만 받음",
              d: "한 테이블에 20건을 동시에 넣으면 한도인 5건만 받고 15건은 거절했습니다. 같은 주문을 10번 눌러도 주문은 하나였습니다."
            },
            {
              n: "127개",
              unit: "· 푸시마다 CI",
              d: "서버 테스트는 5월 3파일에서 24파일이 됐습니다. 이 가운데 4개가 축제 뒤에 쓴 동시 주문 테스트이고, 지금은 푸시마다 돕니다."
            },
            {
              n: "1,018건",
              unit: "/초 · 오류 0",
              d: "SSE 6,000개와 가상 방문자 600명 조건의 부하 시험입니다. p95 938ms, 요청 61,107건에 오류 0. 로컬에서 조회만 잰 값입니다."
            },
            {
              n: "99 → 3",
              d: "부스 목록 조회 쿼리 수입니다. 축제 전 점검에서 줄였고 1초 캐시와 gzip 을 같이 넣었습니다."
            }
          ],
          noteLabel: "부하 시험을 두 번 잰 사정"
        },
        result: {
          eyebrow: "결과 · 2026.10.07–08",
          title: "가을축제 이틀을 서버 장애 없이 운영했습니다.",
          em: "서버 장애 없이",
          // 폰 화면만 오린 그림(oct/phone-*.webp, 투명 배경). 배경은 페이지가 연회색으로 칠한다.
          // 원래 gallery 의 남색 판 합성 그림은 마을 전시실이 쓰므로 그대로 둔다.
          shots: [
            {
              src: "/projects/festflow/oct/phone-admin.webp",
              t: "총괄 화면",
              d: "주점 상태, 공지, 공연 일정, 분실물 등록을 한 화면에서 고칩니다. 공지를 올리면 SSE로 손님 화면이 바로 바뀝니다."
            },
            {
              src: "/projects/festflow/oct/phone-table.webp",
              t: "주점 테이블 고르기",
              d: "테이블 QR을 찍거나 번호를 골라 주문을 시작합니다. 포장 주문도 같은 흐름이고, 첫날 포장은 9건이었습니다."
            },
            {
              src: "/projects/festflow/oct/phone-match.webp",
              t: "소개팅 데이트 신청 현황",
              d: "받은 요청과 보낸 요청을 보는 신청함. 한 사람당 신청은 3건까지입니다."
            }
          ],
          left: [
            "성사 97쌍에 부스 시간 칸이 44개라 성사의 3분의 2가 부스에서 만나지 못했습니다.",
            "바쁜 시간대(18~19시, 21시)에 입금 확인부터 서빙까지 30~45분이 걸렸습니다.",
            "축제 뒤 개인정보 삭제가 수동이고, 전화번호 인증이 없습니다.",
            "서버 모니터링은 로그뿐이고, CI 는 축제 뒤(2026-11-13)에야 붙였습니다."
          ]
        }
      },
      // 2026-11-13 줄인 배치 시안. 이 한 장만 켰다. 타일은 사람 둘(방문자 · 주문) + 서버 둘(장애 · 테스트)을
      // 위에 두고 나머지 넷은 접는다. 대표 장면은 「주문 한 건이 지나는 길」.
      compact: {
        // 머리 그림: 소개팅 두 장(1:1) 대신 10월 실제 화면 넷(21:9). 주문 이야기와 맞고 높이가 절반 아래다.
        // 2026-11-13 밤: 손님 화면 넷은 아래 전/후 슬라이더가 보여 주므로, 머리에는 운영 쪽 셋을 새로 합성했다
        // (oct/console · kitchen · aimatch 실제 캡처, 연습 서버 데이터).
        hero: {
          src: "/projects/festflow/oct/festflow-oct-ops.webp",
          label: "10월 운영 화면 셋",
          ratio: "21/9",
          caption: "연습 서버 데이터"
        },
        compareFirst: true,
        compareTitle: "5월 → 10월 · 화면을 다시 만들었습니다",
        // 접힌 절 머리. secondRun.title 은 마을 전시실도 읽으므로 이 배치에서만 짧게 바꾼다.
        secondTitle: "Claude Code 와 같이 만든 방식",
        tiles: [0, 1, 4, 5],
        // 2026-11-13 밤, 본인 결정으로 이 페이지에서만 뺐다. 혼잡 예측은 10월에 쓰지 않았고 데이터가
        // 시뮬레이션이라 카드(색인 3)와 구조 그림(색인 1)을, 5월 구조 설명인 결정표와 1인 개발이라
        // 의미가 없는 「만든 순서와 맡은 일」 절을 숨긴다. 데이터는 마을 전시실이 쓰므로 남긴다.
        hide: {challenges: [3], diagrams: [1], decisions: true, process: true},
        scene: "주문 한 건이 지나는 길 · 겹치지 않게 세운 줄",
        summaries: {
          why: "수십 개 부스의 혼잡·품절·공지를 전화와 메신저로 돌리던 것을 한 앱으로.",
          field: "문자 435통 중 244통이 실패한 날.",
          retro: "실제 운영에서는 상한이 없는 것이 먼저 문제가 됐습니다.",
          trouble: "주문 줄 세우기 · SSE 끊김 대비 · DB 연결을 잡던 AI 변환.",
          result: "손님 · 운영진 · 스태프 화면과 5월 대비 10월의 저장소 수치."
        }
      },
      compareTags: ["2026.05", "2026.10"],
      // 2026-11-13 밤: 발표 자료 슬라이드(problem.webp) 대신 같은 내용을 카드로 직접 그린다. 문장은 그 슬라이드의 것.
      problems: {
        items: [
          {
            t: "방문객 정보 부족",
            d: "부스 혼잡도, 대기 현황, 품절 여부를 현장에 가기 전에는 알기 어려웠습니다."
          },
          {
            t: "운영진 소통 지연",
            d: "카톡과 구두 전달에 의존해 정보 누락, 전달 지연, 취합 지연이 생겼습니다."
          },
          {
            t: "통합 운영 도구 부재",
            d: "방문객, 운영진, 관리자의 정보가 한 곳에서 이어지지 않았습니다."
          }
        ],
        core: "축제 정보가 실시간으로 이어지지 않아 방문객과 운영진 모두 불편을 겪고 있었습니다.",
        source: "중간 기획 발표 자료의 문제 정의 (구현 전에 정리한 것)"
      },
      secondTocTitle: "AI 와 만든 방식",
      bench:
        "부하 시험은 두 번 쟀습니다. 2026-10-01 축제 전 로컬 측정은 SSE 6,000개 + 가상 방문자 600명에서 초당 1,104건, p95 443ms, 오류 0 이었는데 스크립트를 남기지 않았습니다. 2026-11-13 에 스크립트를 새로 써서 같은 규모로 다시 재니 초당 1,018건, p95 938ms, 오류 0 / 61,107건, SSE 6,000개 유지였습니다. 방문자의 동작을 같게 맞출 수 없어 두 수치를 나란히 비교할 수는 없습니다. 스크립트와 결과 원문은 공개 사본의 scripts/load 에 있습니다.",
      scenes: [
        {
          place: "trouble",
          kind: "steps",
          title: "주문 한 건이 지나는 길 · 겹치지 않게 세운 줄",
          steps: [
            {
              t: "QR 주문",
              d: "POST /api/booths/{id}/orders · IP 당 10분에 600건 한도",
              alt: {t: "한도 초과", d: "429 와 Retry-After", tone: "fail"}
            },
            {
              t: "부스별 줄",
              d: "공정 락으로 최대 15초 · DB 연결은 안 잡음",
              tone: "warn",
              alt: {
                t: "15초 넘김",
                d: "503 「잠시 후 다시 눌러 주세요」",
                tone: "fail"
              }
            },
            {
              t: "부스 행 잠금",
              d: "주문번호 · 테이블 한도를 한 번에 하나씩",
              alt: {
                t: "20초 안 같은 주문",
                d: "새로 만들지 않고 먼저 만든 주문을 돌려줌",
                tone: "muted"
              }
            },
            {t: "커밋", d: "주문 저장 · 금액은 서버 가격으로 계산"},
            {
              t: "커밋 뒤 SSE",
              d: "운영 콘솔 · 요리사 창에 발행",
              tone: "ok",
              alt: {
                t: "SSE 가 끊겨 있으면",
                d: "콘솔 15초 · 주문 화면 20초마다 다시 읽음",
                tone: "muted"
              }
            }
          ],
          note: "서버 안의 락은 서버 한 대 전제입니다. 여러 대면 DB 행 잠금만 남습니다.",
          source:
            "toadsam/AjouFesta · OrderController · OrderService · StreamService"
        },
        {
          place: "trouble",
          kind: "bars",
          title: "주문 100건을 동시에 넣었을 때 생긴 서로 다른 주문번호",
          unit: "개",
          max: 100,
          rows: [
            {
              label: "부스 행 잠금 있음",
              value: 100,
              text: "100개 · 0001~0100",
              tone: "ok"
            },
            {
              label: "잠금만 뺀 대조군",
              value: 17,
              text: "17개 · 83건이 겹침",
              tone: "fail"
            }
          ],
          note: "축제 뒤(2026-11-13)에 쓴 테스트입니다. 축제 첫날 142건은 같은 초에 최대 2건이라 잠금이 시험받지 않았습니다. 대조군은 서비스 코드를 그대로 두고 잠그고 읽는 조회만 잠그지 않는 조회로 바꿨습니다. 겹치는 정도는 기기마다 달라 제 컴퓨터에서는 14개와 17개, GitHub Actions 러너에서는 38개가 나왔고, 잠금이 있는 쪽은 어디서나 100개였습니다. 스레드 20개, PostgreSQL 16 컨테이너, 서버 한 대 조건입니다. 지금은 푸시마다 CI 에서 이 테스트가 돕니다.",
          source:
            "toadsam/AjouFesta OrderConcurrencyTest.java · docs/festflow/동시-주문-시험.md · 2026-10-07 주문 내역 CSV"
        },
        {
          place: "result",
          kind: "bars",
          title: "5월에서 10월로 · 저장소에서 센 것",
          unit: "",
          rows: [
            {
              label: "서버 테스트 파일 · 5월",
              value: 3,
              text: "3",
              tone: "muted"
            },
            {
              label: "서버 테스트 파일 · 10월",
              value: 23,
              text: "23 (123개)",
              tone: "ok"
            },
            {
              label: "부스 목록 쿼리 · 점검 전",
              value: 99,
              text: "99",
              tone: "fail"
            },
            {label: "부스 목록 쿼리 · 점검 후", value: 3, text: "3", tone: "ok"}
          ],
          note: "테스트는 Mockito 단위 테스트 중심입니다. 실제 DB 를 띄우는 동시 주문 테스트 4개와 CI 는 축제 뒤(2026-11-13)에 붙였습니다."
        }
      ]
    },
    metricsNote:
      '방문자·주문·가입 수는 2026.10.07–08 가을축제 "바람" 집계입니다(방문자는 Vercel Web Analytics 10.02–09, 주문은 주문 콘솔 CSV, 가입은 소개팅 관리자 통계 · 저장소 docs/festflow/축제-결산.md). 5월 등록자 수는 2026.05 아주대학교 대동제에서 AI Match 를 1일간 실제 운영한 집계입니다. 관리자 화면 실측(활성 프로필 115 / 전체 169명 · 누적 신청 424 · 성사 36)과 현장 QA 참여 46명. 서버 쪽 넷(장애 0건 · 테스트 127개 · 쿼리 99 → 3 · 입금 확인 0.8분)은 저장소 docs/festflow/축제-결산.md 와 README 의 값이고, 테스트 수는 backend/src/test 의 @Test 를 직접 셌습니다(2026-10-09, 단위 테스트 중심 · CI 없음). 저장소 규모는 별도입니다: 백엔드 컨트롤러 26 · SSE 채널 7(5월) → 8(10월) · 예측 feature 24 (*Controller.java · StreamController.java · congestion_training_profile.json 에서 직접 셌다). 혼잡 예측 모델 정확도는 규칙 기반 0.70 → RandomForest 0.80(macro-F1 0.68 → 0.79)이지만, 운영 경험으로 만든 시뮬레이션 데이터 2,520건 기준이고 실제 축제 데이터로 검증한 값이 아닙니다.',
    kpt: {
      keep: [
        "외부 호출(OpenAI · 문자)을 트랜잭션 밖 · 커밋 뒤로 뺀 것",
        "상태를 종류별 채널로 분리한 설계",
        "모델보다 폴백을 먼저 만든 것",
        "실제 지도 + GPS로 현장성 확보"
      ],
      // 실제로 돌린 날 겪은 것으로 바꿨다. 예전 목록("부하 테스트 부족" ·
      // "마커 렌더 최적화 미흡")은 안 해 본 일이지 겪은 문제가 아니었다.
      problem: [
        "1인당 신청 상한이 없어 신청이 하루 424건까지 몰렸습니다",
        "알림 문자가 장문(LMS)으로 나가 당일 오후 잔액이 바닥났습니다",
        "만남 제안 기능을 검증하지 못해 성사 조율을 사람이 했습니다",
        "예측 모델의 학습 데이터는 시뮬레이션이고 실측이 없음",
        "CI 는 축제 뒤(2026-11-13)에야 붙였고, 서버 모니터링은 로그뿐입니다"
      ],
      try: [
        "1인당 신청 상한 · 문자 발송 예산 상한",
        "알림 문구 90바이트 이하 · 잔액 임계 경보",
        "만남 제안 흐름을 소수에게 먼저 검증한 뒤 현장에",
        "실제 운영 로그로 혼잡 예측 재학습"
      ]
    },
    learningLead:
      "실제 운영에서는 상한이 없는 것이 먼저 문제가 됐습니다. 신청 상한과 문자 예산이 없어 5월 하루에 문자 244통이 실패했고, 10월에는 그 상한들과 외부 호출의 자리를 먼저 고쳤습니다.",
    learning:
      "단방향 푸시라 WebSocket 대신 SSE 를 종류별로 나눴고, 부스 판정은 정확한 좌표 대신 반경 80m 로 잡았습니다. 실제 운영에서는 신청 상한과 문자 예산 상한이 없다는 게 먼저 드러났습니다."
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
      label: "2.0 홈 · 첫 버튼이 「오늘 출석 시작」입니다",
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
        label: "1.0 · 둘러보라고 하는 첫 화면",
        shot: {
          src: "/projects/muscleup/v1/home-1.0.webp",
          label: "1.0 홈 · 배포된 muscle-up.click 실제 화면",
          ratio: "2/1"
        },
        note: "버튼 둘 다 「받기·둘러보기」다. 오늘 뭘 하라는 말은 없습니다. 아래 숫자 셋은 서버가 아니라 소스에 적혀 있었습니다."
      },
      after: {
        label: "2.0 · 출석을 첫 동작으로 안내하는 로비",
        // 히어로 캡처(home-lobby.webp)를 걸었다가 바꿨다. 원본이 659px 라 이
        // 자리에서 1.12배로만 그려져, 옆의 1.0 캡처(1400px)보다 **자랑하려는
        // 쪽이 더 흐렸다.** 지금은 데스크톱 1428px + 모바일 452px 원본을 한 장에
        // 담은 합성본이다 — 합성은 배치일 뿐 두 장 다 손대지 않은 실제 화면이다.
        // 덤으로 before 가 못 보여 주는 것을 하나 더 말한다: 좁은 화면에서도
        // 같은 결정을 유지했다는 것.
        shot: {
          src: "/projects/muscleup/v2/lobby-responsive.webp",
          label: "2.0 로비 · 데스크톱과 모바일",
          ratio: "2/1"
        },
        // before 의 note 와 **같은 두 가지**를 짚는다 — 버튼과 숫자.
        note: "「받기·둘러보기」가 시키는 일 하나로 바뀌었습니다. 데스크톱은 「지금 해야 할 일」 카드, 모바일은 화면 아래 고정 「출석하기」. 숫자도 소스 상수가 아니라 서버에서 읽습니다(연속 출석 2일 · 이번 주 2/7)."
      }
    },
    // 컨트롤러 28개를 세어만 두면 "28"이 숫자로만 남는다. 8개 도메인으로 묶어
    // 그리니 프로틴 공유·이벤트 CMS 처럼 사이트에 없던 기능이 드러났다.
    // 근거는 전부 소스다 — @RequestMapping 과 @*Mapping 을 센 값.
    resultShot: {
      src: "/projects/muscleup/api-map.svg",
      label: "백엔드 API 도메인 지도 · 컨트롤러 28개 · 엔드포인트 136개",
      ratio: "21/9",
      caption:
        "컨트롤러 28개를 8개 도메인으로 묶었습니다. 크루는 여섯 기능이 컨트롤러 하나에 다 들어 있고, 자랑방은 글과 반응을 둘로 갈랐습니다. 같은 저장소 안에 상반된 두 선택입니다."
    },
    gallery: [
      // 갤러리는 2열 격자다 — 세로 폰 캡처를 한 칸에 넣으면 그 한 장이 926px
      // 높이가 되어 화면 한 판을 통째로 먹는다. 그래서 데스크톱 캡처와 모바일
      // 캡처를 **한 장 안에** 나란히 놨다(2000×1000, 합성은 배치일 뿐 두 장 다
      // 손대지 않은 실제 화면이다). 모바일은 452px 원본 그대로 — 늘리면 흐려진다.
      {
        src: "/projects/muscleup/v2/lobby-responsive.webp",
        label: "2.0 로비 · 데스크톱과 모바일",
        ratio: "2/1",
        wide: true,
        caption:
          "데스크톱은 「지금 해야 할 일 · 캐릭터 · 라운지」 3열, 모바일은 같은 화면을 세로 한 줄로 접고 「출석하기 · 운동모임」을 화면 아래 고정 바로 내립니다. 왼쪽 카드의 연속 출석 2일 · 이번 주 2/7 은 1.0 의 박힌 상수와 달리 그 사람 기록입니다."
      },
      {
        src: "/projects/muscleup/auth-sequence.svg",
        label: "인증 시퀀스 · 로그인 · 만료 · 재발급",
        ratio: "16/10",
        wide: true,
        fit: "contain",
        caption:
          "access 가 15분에 만료돼도 화면은 끊기지 않습니다. 여러 요청이 동시에 401 을 받아도 재발급은 axios 인터셉터에서 한 번만 나가고(single-flight), 나머지는 큐에서 기다렸다가 함께 재시도됩니다."
      },
      // ── 2.0 화면 ──
      // 출처는 2.0 발표자료(득근득근2.0.pdf)에 실린 실제 캡처다. 새로 찍은 것은 없다.
      // 홈 화면 배너에 참여자 얼굴이 있어 그 구간은 잘라내고 썼다.
      {
        src: "/projects/muscleup/v2/lounge.webp",
        fit: "contain",
        label: "실시간 라운지 · Socket.IO",
        ratio: "16/10",
        caption:
          "“다른 사람들과 더 많이 소통하고 싶어요” 에 대한 답. 캐릭터 위치와 이모트가 실시간 동기화됩니다. 위치와 이모트 동기화는 별도 Socket.IO 서버에서 처리했습니다."
      },
      {
        src: "/projects/muscleup/v2/character.webp",
        label: "캐릭터 성장 · 레벨 · 티어 · 진화 단계",
        ratio: "6/5",
        caption:
          "“내 운동 데이터를 더 자세히 보고 싶어요” 에 대한 답. 화면의 MASTER·Stage 8·Level 85 가 ERD 의 character_profiles 컬럼 그대로입니다."
      },
      {
        src: "/projects/muscleup/v2/admin.webp",
        fit: "contain",
        label: "관리자 콘솔 · 탭 5개",
        ratio: "16/12",
        caption:
          "개요·행동 추적·검수/콘텐츠·출석 기록·운영 자동화. analytics_events 와 audit_logs 를 읽는 화면이 이곳입니다. 테이블만 있고 안 보던 것을 2.0 에서 화면으로 세웠습니다."
      },
      {
        src: "/projects/muscleup/v2/inbody.webp",
        fit: "contain",
        label: "인바디 AI 분석",
        ratio: "16/10",
        caption:
          "이미지·PDF 를 올리면 OCR 로 읽어 현재 대 목표를 고정 축으로 비교하고 탄단지 비율을 냅니다. 1.0 의 루틴 추천에서 체성분 정밀 분석으로 올라간 지점."
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
        v: "헬스 동아리 회장으로 회원이 꾸준히 이용할 수 있는 기능을 고민했습니다. 1.0 은 기능을 소개하는 랜딩이었고, 써 본 사람들은 “어디서 뭘 해야 할지 모르겠다”고 했습니다"
      },
      {
        k: "결과",
        v: "홈에서 출석과 캐릭터 성장을 확인하고, 관리자가 운영 기록을 조회하도록 개편했습니다. 1.0 사용자 피드백 4건 중 3건을 반영했습니다. AI 응답 지연은 남은 과제로 기록했습니다."
      },
      {
        k: "리뉴얼",
        v: "1.0 2025.09 동아리 소개 홈페이지 → 2.0 2026.03 출석·운동 기록·커뮤니티 기능 추가 (1.0 피드백 4건 중 3건 반영)"
      },
      {
        k: "내 역할",
        v: "1.0 기획·개발과 2.0의 출석·커뮤니티·관리자 기능 개발을 혼자 맡았습니다."
      }
    ],
    demo: {repo: "https://github.com/toadsam/Ajou_MuscleUp"},
    // ── 리뉴얼 ──────────────────────────────────────────────────────────────
    // 2026-10-09 추가(로컬 검토용, 아직 배포 안 함). 아래 Context 의 1.0 → 2.0 전후
    // 비교와 feedbackMap 을 한눈에 묶는 요약이다. 근거는 docs/projects/muscleup.md
    // (1.0 MuscleUp.pdf · 2.0 득근득근2.0.pdf 대조), 저장소 커밋 분포(2026-02-22 ~
    // 03-30, 3월 111개), 이력서 카드 지표. 새 숫자는 만들지 않았다.
    secondRun: {
      label: "Renewal · 1.0 → 2.0",
      beforeHead: "1.0 · 2025.09",
      afterHead: "2.0 · 2026.03 리뉴얼",
      beforeTag: "1.0",
      afterTag: "2.0",
      addedTitle: "2.0 에서 새로 만든 것",
      prepTitle: "어떻게 다시 만들었나",
      title: "동아리 소개 홈페이지에 출석·운동 기록·커뮤니티 기능 추가",
      lead: "1.0 은 AI 상담, 자랑방, 프로틴, 프로그램 신청을 소개하는 정보 중심 홈페이지였습니다. 써 본 사람들의 피드백 넷을 기준으로 2026년 3월에 출석·커뮤니티·관리자 기능을 추가했습니다. 홈은 로비, 출석은 성장 데이터, 관리자는 운영 콘솔이 됐습니다.",
      stats: [
        {n: "3 / 4", l: "반영한 1.0 피드백", s: "1.0·2.0 발표자료 대조"},
        {n: "4 → 8", l: "도메인", s: "1.0 자료 · 2.0 저장소"},
        {n: "111개", l: "2026.03 커밋", s: "저장소 커밋 기록"},
        {n: "약 50명", l: "이용 회원", s: "본인 집계"}
      ],
      scope: [
        {
          k: "서비스 성격",
          before: "기능을 소개하는 정보 중심 홈페이지",
          after:
            "첫 화면에서 출석을 시작하고 운동 기록과 캐릭터 성장을 확인하는 서비스"
        },
        {
          k: "첫 화면",
          before:
            "「받기 · 둘러보기」 버튼 둘. 아래 숫자 셋은 소스에 박힌 상수",
          after:
            "「오늘 출석 시작」 하나. 연속 출석 · 이번 주 출석은 서버에서 읽은 그 사람 기록"
        },
        {
          k: "도메인",
          before: "4개 (AI 상담 · 자랑방 · 프로틴 · 프로그램 신청)",
          after: "8개 · 엔티티 31 · 컨트롤러 28"
        },
        {
          k: "소통",
          before: "게시판형 자랑방",
          after: "실시간 라운지(Socket.IO 서버 분리)와 크루 챌린지"
        },
        {
          k: "운영",
          before: "로그 테이블만 있고 보는 화면이 없었습니다",
          after:
            "관리자 콘솔 탭 5개(개요 · 행동 추적 · 검수 · 출석 기록 · 운영 자동화)"
        }
      ],
      shots: [
        {
          label: "1.0 · 둘러보라고 하는 첫 화면",
          src: "/projects/muscleup/v1/home-1.0.webp",
          alt: "득근득근 1.0 홈 화면. 받기와 둘러보기 버튼"
        },
        {
          label: "2.0 · 출석을 첫 동작으로 안내하는 로비",
          src: "/projects/muscleup/v2/home-lobby.webp",
          alt: "득근득근 2.0 로비. 오늘 출석 시작 버튼"
        },
        {
          label: "2.0 새로 · 실시간 라운지",
          src: "/projects/muscleup/v2/lounge.webp",
          alt: "득근득근 2.0 실시간 라운지 화면"
        },
        {
          label: "2.0 새로 · 관리자 콘솔",
          src: "/projects/muscleup/v2/admin.webp",
          alt: "득근득근 2.0 관리자 콘솔 화면"
        }
      ],
      remadeTitle: "피드백 넷에 대한 답",
      remade: [
        {
          t: "“처음 사용할 때 어디서 뭘 해야 할지 몰랐어요”",
          before: "첫 화면이 기능 소개와 둘러보기 버튼이었습니다",
          after:
            "홈을 로비로 바꾸고 첫 버튼을 「오늘 출석 시작」 하나로. 데스크톱은 「지금 해야 할 일」 카드, 모바일은 화면 아래 고정 「출석하기」",
          source:
            "1.0 발표자료 p.24 피드백 원문 · 2.0 발표자료 · 저장소 Home 화면"
        },
        {
          t: "“다른 사람들과 더 많이 소통하고 싶어요”",
          before: "글을 올리고 댓글을 다는 자랑방뿐이었습니다",
          after:
            "캐릭터 위치와 이모트가 실시간으로 맞춰지는 라운지(Socket.IO 를 별도 서버로)와 크루 챌린지",
          source: "1.0 발표자료 p.24"
        },
        {
          t: "“내 운동 데이터를 더 자세히 보고 싶어요”",
          before: "루틴 추천 수준이었습니다",
          after:
            "출석이 캐릭터 레벨 · 티어 · 진화로 쌓이고, 공개 랭킹과 인바디 OCR 분석으로 체성분까지 봅니다",
          source: "1.0 발표자료 p.24 · character_profiles 테이블"
        },
        {
          t: "“AI 답변이 나올 때까지 기다리는 게 길어요”",
          before: "응답을 통째로 기다리는 동기 호출이었습니다",
          after: "아직 못 고쳤습니다. 스트리밍으로 바꿔야 풀리는 문제입니다",
          source: "1.0 발표자료 p.24"
        }
      ],
      added: [
        {
          t: "실시간 라운지",
          what: "자주 바뀌는 위치 · 채팅 · 이모트를 실시간으로 동기화하기 위해 Socket.IO 서버(:4001)로 따로 뺐습니다.",
          result:
            "REST 서버(:8080)와 실시간 서버가 갈린 3-tier 구조가 됐습니다."
        },
        {
          t: "캐릭터 성장과 랭킹",
          what: "출석과 운동 기록이 레벨 · 티어 · 진화 단계로 쌓입니다.",
          result: "출석과 운동 기록에 따라 캐릭터가 성장하도록 구현했습니다."
        },
        {
          t: "인바디 AI 분석",
          what: "이미지나 PDF 를 올리면 OCR 로 읽어 현재와 목표를 고정 축으로 비교하고 탄단지 비율을 냅니다.",
          result: "1.0 의 루틴 추천에서 체성분 분석으로 올라갔습니다."
        },
        {
          t: "관리자 콘솔",
          what: "analytics_events 와 audit_logs 를 읽는 탭 5개를 세웠습니다.",
          result: "운영자가 행동 추적, 검수, 출석 기록을 화면에서 봅니다."
        }
      ],
      prep: "1.0 발표자료에 남은 사용자 피드백 원문 넷을 기준으로 무엇을 바꿀지 정했습니다. 작업은 2026년 2월 말부터 3월 말에 몰려 있고, 3월 한 달 커밋이 111개입니다. 이벤트, 챌린지, 출석, 캐릭터, 라운지, 관리자 개편 순서로 나갔습니다. 1.0 발표자료에 남은 피드백과 2.0의 반영 결과를 대조했습니다.",
      gaps: [
        "AI 응답 지연 피드백은 아직 고치지 못했습니다(스트리밍 전환 필요).",
        "이용 회원 약 50명은 본인 집계라 분석 도구 수치가 아닙니다."
      ],
      source:
        "1.0 MuscleUp.pdf(28쪽) · 2.0 득근득근2.0.pdf(13쪽) 대조, 저장소 toadsam/Ajou_MuscleUp 커밋 기록과 소스. 화면은 두 발표자료에 실린 캡처이고, 2.0 홈 배너의 참여자 얼굴 구간은 잘라 냈습니다."
    },
    meta: [
      // 이력서 카드(resume.ts)와 같은 값. 개발·운영 참여는 2026.06 까지(본인 확인 2026-09-07).
      {label: "기간", value: "2025.09 ~ 2026.06"},
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
      "운동 기록 외에 회원이 함께 이용할 커뮤니티와 성장 기능을 추가하려고 했습니다. 기록이 캐릭터 성장·랭킹·실시간 커뮤니티로 즉시 연결되는 경험이 필요했고, 자주 바뀌는 실시간 상태를 REST와 분리해야 했습니다.",
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
          who: "같은 자료, 네 번째 피드백"
        }
      ],
      stat: {
        n: "4",
        l: "1.0 사용자 피드백 원문 · 그중 셋을 2.0 에서 고쳤습니다"
      }
    },
    feedbackMap: [
      {
        said: "처음 사용할 때 어디서 뭘 해야 할지 몰랐어요",
        did: "홈을 로비로. 첫 화면 CTA 를 「오늘 출석 시작」 하나로",
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
        did: "그땐 방법을 몰라 못 했습니다. 응답을 통째로 기다리는 동기 호출이라, 스트리밍으로 바꿔야 하는 일이었습니다",
        done: false
      }
    ],
    hypothesis:
      "운동 기록이 캐릭터 성장·랭킹·라운지로 바로 이어져야 다시 올 이유가 생긴다고 봤습니다. 자주 바뀌는 위치·채팅·이모트를 Socket.IO 서버로 분리하면 실시간 통신과 REST API의 처리를 분리할 수 있다고 판단했습니다.",
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
          "요점은 왼쪽에서 경로가 갈라지는 것입니다. 자주 바뀌는 상태(위치·채팅)만 Socket.IO 가 받고 나머지는 REST 로 갑니다. 점선 상자는 내가 만들지 않은 것.",
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
        title: "Data Model · 31 tables / 8 domains",
        viewBox: [1200, 656],
        caption:
          "@Entity 31개를 도메인별로 묶은 것입니다. users 한 곳으로 관계 28개가 모이는 허브라, 탈퇴·권한 변경이 전 도메인에 걸립니다.",
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
        why: "동시 401 이 서로의 토큰을 무효화해 클라이언트 single-flight 로 대체",
        alt: "Refresh Token Rotation 유지 또는 서버 세션 방식"
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
        why: "프롬프트를 고칠 때 좋아졌는지 숫자로 봅니다",
        alt: "응답을 수동으로 확인"
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
          "이동은 올 때마다 보내지 않습니다. 60ms 틱에서 변한 게 있을 때만 한 번. 램프 표의 브로드캐스트/s 가 상한 16.7Hz 에 못 미치는 것도, 사람이 늘수록 그 값이 올라가는 것도 이 게이트 때문입니다",
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
        title:
          "Refresh Token Rotation의 경쟁 조건을 줄이기 위해 기존 토큰을 유지했습니다",
        problem:
          "같은 refresh 토큰을 가진 두 재발급 요청에서, A가 토큰 값을 바꿔 저장한 뒤 B가 이전 값으로 조회하면 B가 실패할 수 있었습니다. 모든 동시 요청에서 반드시 발생하는 것은 아니며 처리 순서에 따른 문제였습니다.",
        solution:
          "클라이언트의 single-flight(refreshing 플래그와 대기 큐)는 이미 있던 장치로, 같은 페이지에서 재발급 요청을 묶는 역할입니다. 서버 수정과 동시에 새로 도입한 것으로 설명하지 않습니다.",
        code: {
          filename: "RefreshTokenService.java · bacef85 당시",
          lines: [
            "// Keep refresh token stable to prevent race-condition",
            "// logouts when parallel requests trigger refresh.",
            "return current.getToken();"
          ]
        },
        evidence: {
          status: "전후 코드로 확인",
          note: "서버 토큰 유지 변경과 기존 single-flight를 분리했습니다.",
          url: "https://github.com/toadsam/Ajou_MuscleUp/commit/bacef85146739a5c915177fe12c4e0be26bfe7d2"
        }
      },
      {
        title: "인덱스를 넣고 재 보니, count 쿼리가 남은 병목이었습니다",
        perfAfter: true,
        problem:
          "아래 목록 네 곳이 모두 정렬 페이지네이션인데 정렬·필터 컬럼에 인덱스가 없었습니다. 회원 50명이라 화면에서는 문제가 없습니다. 데이터가 늘어날 때의 응답 시간을 확인하려고 했습니다.",
        solution:
          "정렬이 사라지고 인덱스를 거꾸로 훑는 계획으로 바뀝니다. 목록 네 개가 668~2472배. 합성 데이터 20만 행·7회 중앙값으로 목록 SQL과 count SQL의 합산 시간을 확인했습니다. 이는 HTTP 요청 전체의 응답 시간이 아닙니다. Page 는 목록과 함께 count 를 날리는데 인덱스가 그걸 못 고칩니다(57.2 → 57.4ms). 다음 병목은 이 count 이고, 커서 페이지네이션이나 근사 카운트로 접근할 문제입니다. 인덱스 넷은 21MB 를 씁니다.",
        code: {
          filename: "EXPLAIN (ANALYZE) · 자랑방 목록 20만 행 · 7회 중앙값",
          lines: [
            "// 인덱스 없음 · 60.2ms",
            "Limit  (cost=14445.15..14446.32 rows=10)",
            "  -> Gather Merge  (rows=166666)",
            "     -> Sort  Sort Key: created_at DESC",
            "        -> Parallel Seq Scan on brag_post   // 20만 행 전부",
            "",
            "// 인덱스 있음 · 0.084ms  (buffers: shared hit=4)",
            "Limit  (cost=0.42..2.44 rows=10)",
            "  -> Index Scan Backward using idx_brag_post_created",
            "",
            "// 그런데 같은 페이지의 count 는 57.2ms -> 57.4ms. 안 변한다."
          ]
        },
        evidence: {
          status: "전후 코드로 확인",
          note: "SQL 측정 기록이며 실제 HTTP·운영 성능 재측정은 아닙니다.",
          url: "https://github.com/toadsam/Ajou_MuscleUp/commit/75092f449839548df22cc52e5b735c939d61e7d5"
        }
      },
      {
        title: "실시간 분리는 했는데, 몇 명까지 감당하는지는 안 재 봤습니다",
        problem:
          "인덱스는 표당 20만 행 기준으로 측정했지만, 별도로 분리한 실시간 서버의 동시접속 한계는 확인하지 않은 상태였습니다.",
        solution:
          "동시접속을 25 → 300으로 늘리며 ping:check로 왕복 시간을 측정했습니다. 50명에서 p95 9ms였고, 100명에서는 p95 85ms로 설계 주기 60ms를 넘었습니다. 측정 전 예상보다 낮은 인원에서 지연이 발생했습니다.\n\n150명부터 지연이 커지고 200명에서 p95 1.1초를 기록했습니다. 변경이 있을 때 전체 사용자 목록을 모든 사용자에게 보내 전송량이 N²에 비례해 증가했습니다. 당시 개선 과제는 뷰포트 컬링과 변경 데이터 전송이었습니다. 후속 버전의 p95 개선 수치는 여기서 검증하지 않았습니다.",
        code: {
          filename: "동시접속 램프 · 16초 × 3회 중앙값 (한 대·루프백)",
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
        },
        evidence: {
          status: "전후 코드로 확인",
          note: "전체 목록 브로드캐스트와 후속 변경분 전송을 확인했습니다. 과거 부하 측정과 후속 개선 성능은 별개입니다.",
          url: "https://github.com/toadsam/Ajou_MuscleUp/commit/89bd39c7eaf7c773f2393bdb33d0681296c937a9"
        }
      },
      {
        title: "AI 답변이 맞는 말인지 사람이 매번 읽어 볼 수 없었습니다",
        problem:
          "인바디 분석은 체성분 수치를 받아 운동·식단을 권하는 기능이라, 모델이 그럴듯하지만 위험한 조언을 해도 화면상으로는 멀쩡해 보입니다. 프롬프트를 고칠 때마다 결과가 나아졌는지 나빠졌는지 판단할 근거가 없었습니다.",
        solution:
          "테스트로 품질 하네스를 만들었습니다. 체형·목표가 다른 표본 8건을 고정해 두고 매번 같은 입력을 넣은 뒤, 응답을 구조·진단 적합·우선순위·설명 깊이·안전성 5개 축으로 채점해 마크다운 리포트로 뽑습니다. OPENAI_API_KEY 가 없으면 스스로 건너뛰므로 키 없는 환경의 빌드를 깨지 않습니다.",
        code: {
          filename: "AiInbodyQualityHarnessTest.java",
          lines: [
            'scores.put("structure", scoreStructure(...));',
            'scores.put("diagnosisFit", scoreDiagnosisFit(...));',
            'scores.put("priorityFit", scorePriorityFit(...));',
            'scores.put("detailDepth", scoreDepth(...));',
            'scores.put("safety", scoreSafety(...));'
          ]
        },
        evidence: {
          status: "코드로 확인",
          note: "8개 고정 표본·5개 규칙 채점 축의 테스트 추가. API 키가 없으면 건너뛰며 품질 통과나 개선 점수를 뜻하지 않습니다.",
          url: "https://github.com/toadsam/Ajou_MuscleUp/commit/3380e55cfca9b57238d7d24607bc2f087ba04e97"
        }
      },
      {
        title: "브라우저·배포 환경에서 인증 방식이 달랐습니다",
        problem:
          "쿠키 기반과 Bearer 토큰 기반 환경이 섞여 로그인 유지가 불안정했습니다.",
        solution:
          "기존 Authorization을 보존하므로 모든 재시도에서 새 토큰 사용이 보장된다고 단정하지 않습니다.",
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
      note: "맨 아랫줄이 사용자가 기다리는 시간입니다. 목록 막대는 사라지는데 페이지 막대는 절반에서 멈춥니다. 남은 57.5ms 가 인덱스로 못 고치는 count 다. (PostgreSQL 17.4 · 20만 행 · 7회 중앙값)"
    },
    metricsNote:
      // 130자가 넘었다. 지표 넷 바로 아래 — 첫 화면급 자리에서 그 길이는 무겁다.
      // 응답 시간의 측정 조건(20만 행 합성 데이터 · 7회 중앙값 · 실사용 규모에선
      // 차이 없음)은 **그 이야기를 하는 Troubleshooting 두 번째 카드**가 이미
      // 본문과 EXPLAIN 으로 다 말한다. 여기서는 출처만 밝힌다.
      "회원 수는 본인 집계 · 피드백 4건은 1.0 발표자료 p.24 원문 · 응답 시간과 동시접속은 저장소의 스크립트로 다시 잴 수 있습니다 (backend/sql/bench · realtime/bench · 순서는 docs/BENCHMARKS.md)",
    kptLabels: {
      keep: "1.0 에서 배운 것 · 개발",
      problem: "아직 남은 것",
      try: "2.0 에서 배운 것 · 운영·사용자"
    },
    // 두 번 만들었고, 두 번의 배움이 종류가 다르다.
    // KEEP = 1.0(개발), TRY = 2.0(운영·사용자). 이 갈라짐 자체가 이 카드의 요점이다.
    kpt: {
      keep: [
        "1.0 · 비밀 값을 하드코딩했다가 배포가 부팅부터 실패해, 프로필과 비밀 값을 갈라 뒀습니다",
        "1.0 · 환경마다 한글이 깨져서 DB 커넥션 문자열과 JVM 인코딩을 같이 맞췄습니다",
        "1.0 · SPA 새로고침의 CloudFront 403 은 호스팅 설정에서 풀었습니다",
        "1.0 · 위치·채팅은 Socket.IO 서버, 나머지는 REST 로 나눴습니다"
      ],
      problem: [
        "AI 응답 속도는 아직 손대지 못했습니다 (피드백 넷 중 유일하게 안 고친 것)",
        "Refresh 로테이션을 되돌린 채로 두고 있습니다 (병렬 재발급 경쟁 상태)",
        "analytics_events 를 쌓고는 있지만 그걸로 판단한 적은 없습니다",
        "테스트가 AI 품질 하네스와 컨텍스트 로드 둘뿐입니다. 인증·출석 도메인부터 붙일 차례입니다",
        "CI 가 없어 지금은 로컬에서만 돌린다 (GitHub Actions 로 하네스부터 올릴 계획)"
      ],
      try: [
        "2.0 · 홈을 로비로 바꿔 첫 버튼을 「오늘 출석 시작」 하나로 줄였습니다",
        "2.0 · ‘소통하고 싶다’는 말에 게시판 대신 실시간 라운지로 답했습니다",
        "2.0 · 운동 기록을 캐릭터 레벨·티어·랭킹으로 돌려줬습니다",
        "2.0 · 쌓기만 하던 analytics_events·audit_logs 를 관리자 콘솔에서 읽게 했습니다",
        "2.0 · 인덱스 적용 후 목록 정렬은 700배, 페이지 전체는 2.0배 빨라졌습니다. count 쿼리는 남은 병목으로 확인했습니다."
      ]
    },
    learningLead:
      "2.0 에서 제일 먼저 고친 것은 홈 첫 화면이었습니다. 버튼 둘을 「오늘 출석 시작」 하나로 줄였습니다.",
    learning:
      "1.0에서는 배포·인증·인코딩 문제를 해결했습니다. 2.0에서는 첫 화면 이용 방법과 회원 간 소통, 운동 데이터 확인에 관한 피드백을 반영했습니다. AI 응답 지연은 아직 해결하지 못했습니다."
  },

  // ════════════════════════════ ACLUB / AjouClub FE (platform · 팀) ══════════
  aclub: {
    // ── 2026-11-13 밤. 커밋 기록에 맞춰 전면 수정(docs/BACKEND_EVIDENCE.md 6절).
    //   예전 상세는 「2026 프론트를 TypeScript 로 다시 짰다 · 커스텀 훅 7개 · 보호 라우트」를 본인 일로 적었다.
    //   저장소(aClub2026/FE)를 보니 그 코드는 2025-09~11 팀원 JIYOON·YeonWoo choi 가 쓴 것이고
    //   (useClubs bcb4fd1 · RequireAuth a3173d8 · AdminRoute b898a36 · 필터 6feb64c 전부 JIYOON),
    //   본인은 2026-01-18 부터 프로젝트장으로 들어와 main 79 커밋 중 23개를 남겼다.
    //   본인 것으로 확인되는 것만 남겼다: 2025 로그인·API 연동(DB_Project_FE 48/310 커밋, 머지 PR 9건),
    //   2026 배포 워크플로 수리(9회 연속 실패 → 성공) · 출시 당일 필터 폴백 · 모집 종류 칩 · 상세 404,
    //   그리고 커밋에 안 남는 출시·홍보·문의 응대. 문장은 본인이 쓴 저장소 README(2026-09-07)를 따랐다.
    tagline: "CLUB DISCOVERY · 2025 FE MEMBER → 2026 PROJECT LEAD",
    // 예전 히어로(`aclub.webp`)는 **2025 옛 사이트**(ACM 로고, 소학회 카테고리
    // 상단 배치)였다. 내가 총괄한 2026 디자인이 페이지에 한 장도 없었던 셈이다.
    // 2026 사이트는 폰 폭 앱이라 캡처가 세로로 길다 — 세 장을 한 장(16/9)에
    // 합성한다. 만드는 법: `scripts/build-aclub-screens.mjs`(원본은 리포 밖).
    // 2025 화면은 페이지에서 뺐다. GitHub (2025 · 팀원) 링크가 그 몫이다.
    heroImage: {
      src: "/projects/aclub-2026-screens.webp",
      label: "2026 실제 화면 · 홈 · 모집공고 목록 · 모집공고 상세",
      ratio: "16/9"
    },
    // 「흩어진 모집 공고」를 찍어 둔 자료가 없어 이미지 자리를 뺐다(2026-09-07).
    // 회색 상자가 서 있는 것보다 없는 편이 낫다.
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
        "2026 저장소의 구조입니다. 이름은 전부 저장소 실측이고(커스텀 훅 · 보호 라우트 2 · axios 모듈), 이 구조는 2025년 9~11월에 팀원들이 TypeScript 로 다시 짜며 만든 것입니다. 저는 그 위에서 2026년 1월부터 고쳤습니다."
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
        label: "유입 채널과 트래픽 분포 · GA4 · 2026.02.16–03.15",
        ratio: "1502/840",
        caption:
          "28일 중 세션 5,311건이 사실상 3월 1~5일에 몰렸습니다. 유입은 Referral 54.8% + Direct 39.3% = 94%, 검색은 3.8%. 모집 기간에 링크로 들어오는 이용자가 대부분이라, 그 기간에 화면이 깨지지 않는 쪽에 시간을 썼습니다."
      },
      {
        src: "/projects/op/aclub-ga4-home.webp",
        label: "올해 누계 · GA4 · 2026.01.01–03.15",
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
        label: "주차별 재방문 유지율 · GA4 · 3월 14일에 끝나는 6주",
        ratio: "552/352",
        caption:
          "1주째 5.4% · 2주째 4.3% · 3주째 3.2% · 4주째 1.8%. 이 표를 보고 재방문 기능은 만들지 않기로 했습니다."
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
        label: "출시 저녁 · 회장들의 답장",
        ratio: "1350/626",
        caption:
          "등록을 요청한 동아리 회장들에게서 그날 저녁 답장이 이어졌습니다. 직함만 남기고 개인 이름과 사진은 가렸습니다."
      },
      {
        src: "/projects/op/aclub-launch-post.webp",
        label: "출시 저녁 · 에브리타임 게시글 18:44 · 문의 19:08 · 답변 19:41",
        // 위는 게시글, 아래는 그날 댓글 세 줄. 게시글 본문 끝의 안내문은 잘랐다 —
        // 19:41 운영진 답변과 같은 글이라, 둘 다 있으면 하나가 베낀 것처럼 읽힌다.
        // 공감·스크랩 수는 2026-09-04 에 페이지에서 읽은 값(캡처는 없음).
        ratio: "1040/1109",
        caption:
          "사람이 몰리는 저녁 6시대에 올렸고 같은 날 밤 실시간 인기 글 2위. 24분 뒤 「로그인이 안 돼」가 두 건 달렸고, 33분 뒤 운영진 댓글로 「크롬·사파리로 열어 달라」고 답했습니다. 에타 앱 안에서 열면 로그인 버튼이 사라지는 문제였습니다. 2026-09-04 기준 공감 109 · 스크랩 155."
      },
      {
        src: "/projects/op/aclub-eta.webp",
        label: "2025년 3월 첫 출시 · 직접 알리고 섭외한 기록",
        ratio: "1200/796",
        caption:
          "2025년 첫 출시 때의 캡처입니다(댓글 날짜 2025-03-04). 에브리타임 글에 공감 60 · 댓글 12 · 스크랩 111 이 찍혀 있고, 소학회 회장에게 등록을 요청해 승낙을 받았습니다."
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
        v: "동아리 탐색·모집을 한 곳에서 하는 아주대 플랫폼 (aClub)"
      },
      {k: "왜", v: "동아리 정보가 여러 채널에 흩어져 탐색·지원이 번거로움"},
      {
        k: "결과",
        v: "2026년 3월 모집 시즌에 출시. 75일 동안 활성 사용자 3,500명(GA4)"
      },
      {
        k: "내 역할",
        v: "2025 프론트 3인 중 1인(로그인·API 연동) → 2026 프로젝트장(출시·홍보·운영, 배포 수리와 출시 전후 수정)"
      }
    ],
    // live(aclub.co.kr)는 뺐다 — 모집이 끝나 도메인을 닫았다(2026-09-08, 404).
    demo: {repo: "https://github.com/aClub2026/FE"},
    // 서비스를 쓴 동아리 회장이 보내온 실제 메시지. **익명으로 적는다** —
    // 공개될 걸 알고 보낸 사적인 메시지가 아니라서, 단체명·직함·캡처는 쓰지
    // 않고 벌어진 일만 옮긴다. 지표 여섯 개보다 이 한 문장이 세다.
    testimonial: {
      q: "처음엔 이렇게 많이 신청해 주실 줄 몰라 상시모집으로 열어 뒀는데, 관리가 어려울 것 같아 급하게 모집을 마감했습니다.",
      who: "서비스에 등록한 한 동아리 회장"
    },
    meta: [
      {label: "기간", value: "2025.01 ~ 2026.03 (2025 팀원 → 2026 프로젝트장)"},
      {
        label: "팀",
        value:
          "2025 프론트 3인 · 2026 프론트 3인 + 백엔드 (본인은 2026.01 합류)"
      },
      {
        label: "역할",
        value:
          "2025 로그인·회원정보·API 연동 → 2026 프로젝트장: 출시 일정·홍보·문의 응대 · 배포 수리 · 출시 전후 수정"
      },
      {
        label: "스택",
        value: "React · TypeScript · Vite · Tailwind · React Router · Axios"
      },
      {label: "배포", value: "GitHub Pages (커스텀 도메인 · CNAME)"},
      {
        label: "코드",
        value:
          "2026 TypeScript 저장소는 2025.09~11 팀원 둘이 작성. 본인 커밋은 main 79개 중 23개"
      }
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
      "동아리 정보는 에브리타임·인스타·단톡 등 여러 채널에 흩어져 있어 학생들이 원하는 동아리를 탐색하고 지원 현황을 관리하기 어려웠습니다.",
    research: {
      quotes: [],
      stat: {
        n: "9",
        l: "연속으로 실패하던 배포 실행 (2026-01-13 ~ 02-01, GitHub Actions 기록)"
      }
    },
    hypothesis:
      "탐색·필터·상세·지원을 한 흐름으로 묶으면 학생은 한 곳에서 동아리를 찾습니다. 이용은 모집 기간 며칠에 몰릴 것이므로, 그 며칠 동안 화면이 깨지지 않는 것이 먼저라고 봤습니다.",
    process: [
      {t: "2025.01~02", d: "로그인·회원정보·API 연동 (팀원)"},
      {t: "2025.09~11", d: "팀원들이 TypeScript 로 재작성"},
      {t: "2026.01", d: "프로젝트장 합류 · 404·정렬 수정"},
      {t: "2026.02.01", d: "배포 워크플로 수리"},
      {t: "2026.03.03", d: "출시 · 필터 폴백 · 문의 응대"}
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
    // 2026-11-13 밤: 예전 표(Vite · TypeScript · 커스텀 훅 · 보호 라우트)는 팀이 2025 에 고른 것이라 뺐다.
    // 아래 넷은 본인 커밋과 저장소 README 「결정과 근거」에서 확인되는 것이다.
    decisions: [
      {
        area: "필터",
        pick: "서버가 실패하면 전체를 받아 화면에서 거름",
        why: "출시 당일 오후 필터 API 가 조합에 따라 가끔 실패. 학생이 들어오는 기간은 3월 첫 주뿐",
        alt: "백엔드 수정을 기다리기(맞는 답이지만 그날 저녁 출시를 못 함)"
      },
      {
        area: "모집 칩",
        pick: "모집 상태와 모집 종류를 다른 축으로",
        why: "상시·수시 둘 다 마감일이 없어 전부 「상시모집」으로 찍힘",
        alt: "칩 문구만 고치기(원인인 한 축 설계가 남음)"
      },
      {
        area: "배포",
        pick: "알림·검증 스텝이 배포 결과를 뒤집지 않게",
        why: "배포는 성공하는데 Discord 알림 스텝의 if 가 secrets 를 읽다 워크플로가 실패",
        alt: "알림 스텝 삭제"
      },
      {
        area: "재방문",
        pick: "올리지 않기로",
        why: "1주 재방문 5.4% 는 모집 닷새에 한 번 오는 서비스의 성격",
        alt: "리텐션 기능 추가"
      }
    ],
    // 2026-11-13 밤: useClubs 훅 원형과 RequireAuth 는 팀원 코드라 뺐다. 본인 커밋 두 개로 바꿨다.
    coreCode: [
      {
        filename: "useClubs.ts · 2026.03.03",
        caption:
          "필터 API 가 던지면 전체 목록을 받아 같은 조건으로 화면에서 거릅니다. 출시 당일 16:14 커밋",
        highlightLines: [5, 8, 9],
        lines: [
          "try {",
          "  response = await axios.get<ApiResponse<ApiClubData[]>>('/api/club/filter', {",
          "    params: apiParams,",
          "  });",
          "} catch {",
          "  // Some filter combinations intermittently fail on the filter endpoint.",
          "  // Fallback to /all and apply identical filtering on the client.",
          "  const allResponse = await axios.get<ApiResponse<ApiClubData[]>>('/api/club/all');",
          "  return applyClientFilters(allResponse.data.data, filters).map(mapApiClubToClub);",
          "}"
        ]
      },
      {
        filename: "deploy.yml · 2026.02.01",
        caption:
          "스텝의 if 에서는 secrets 를 읽을 수 없습니다. env 로 한 번 받아 비교하게 바꿨습니다",
        highlightLines: [2, 3, 4],
        lines: [
          "- if: ${{ failure() && secrets.DISCORD_WEBHOOK_URL != '' }}",
          "+ if: ${{ failure() && env.DISCORD_WEBHOOK_URL != '' }}",
          "+ env:",
          "+   DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}"
        ]
      }
    ],
    work: [
      {
        g: "2025 팀원",
        items: [
          "로그인 · 회원정보 · 구글 로그인 화면 · 토큰 재발급",
          "동아리 · 모집공고 API 연동 · 모집공고 상세"
        ]
      },
      {
        g: "2026 코드",
        items: [
          "배포 워크플로 수리 · 필터 폴백",
          "모집 종류 칩 · 종류별 상세 조회 · 최신순 정렬"
        ]
      },
      {
        g: "2026 프로젝트장",
        items: [
          "출시 일정 조율 · 동아리 회장 섭외",
          "에브리타임 게시 · 문의 응대"
        ]
      },
      {
        g: "판단",
        items: ["GA4 로 이용 패턴 확인", "재방문 대신 모집 닷새에 집중"]
      }
    ],
    // 2026-11-13 밤: 예전 첫 두 장(커스텀 훅 · 보호 라우트)은 팀원 JIYOON 의 커밋이라 뺐다.
    // 본인 커밋 세 건으로 바꿨고, 재방문 카드에서 6feb64c(역시 JIYOON, 2025-11)를 근거로 든 문장을 지웠다.
    challenges: [
      {
        title: "배포가 아홉 번 연속 실패했는데, 실패한 건 배포가 아니었습니다",
        problem:
          "CI/CD 는 2025년 11월에 팀원이 만들어 둔 것이었고, 저장소를 조직으로 옮긴 뒤 워크플로가 계속 실패했습니다. 2026년 1월 13일부터 2월 1일까지 실행 아홉 번이 전부 실패였습니다.",
        solution:
          "세 가지가 겹쳐 있었습니다. gh-pages 에 쓸 권한(permissions: contents: write)이 없었고, 배포 검증 스텝이 옮기기 전 개인 계정 주소를 보고 있었고, 마지막 Discord 알림 스텝의 if 가 secrets 를 직접 읽고 있었습니다. 셋째가 핵심이었습니다. 배포 자체는 성공하는데 알림 스텝 때문에 워크플로가 실패로 끝났습니다.\n\n셋째는 두 번 잘못 짚었습니다. 처음엔 조건을 추가만 했고, 다음엔 ${{ }} 로 감싸면 되는 줄 알았습니다. GitHub Actions 는 스텝의 if 에서 secrets 를 읽지 못합니다. env 로 한 번 받아 env 값을 비교하게 바꾸자 통과했습니다(세 커밋이 3분 사이). 검증 스텝에는 continue-on-error 를 붙였습니다. 알림이나 검증이 실패해도 배포 결과는 바뀌지 않게 했습니다.",
        code: {
          filename: "deploy.yml",
          lines: [
            "- if: ${{ failure() && secrets.DISCORD_WEBHOOK_URL != '' }}",
            "+ if: ${{ failure() && env.DISCORD_WEBHOOK_URL != '' }}",
            "+ env:",
            "+   DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}"
          ]
        },
        evidence: {
          status: "전후 코드로 확인 · Actions 기록",
          note: "GitHub Actions 실행 기록: 2026-01-13 ~ 02-01 13:08 까지 9회 failure, 02-01 13:09 커밋부터 success, 이후 main 푸시 8회 전부 success. CI/CD 를 처음 만든 것은 팀원입니다.",
          url: "https://github.com/aClub2026/FE/commit/31c4188"
        }
      },
      {
        title: "출시 당일 오후, 동아리 필터가 조합에 따라 실패했습니다",
        problem:
          "2026년 3월 3일 오후, 동아리 목록 필터가 조합에 따라 가끔 실패했습니다. 고칠 곳은 백엔드의 필터 API 입니다. 그런데 그날 저녁 6시대에 에브리타임에 글을 올리기로 백엔드 담당과 날짜를 맞춰 둔 상태였고, 학생이 들어오는 기간은 3월 첫 주뿐이었습니다.",
        solution:
          "필터 API 가 예외를 던지면 전체 목록을 받아 화면에서 같은 조건으로 거르게 했습니다(16:14 커밋). 같은 커밋에서 「모집 여부」 필터는 화면에서 뺐습니다. 서버와 화면의 판정이 어긋나 틀린 결과가 나오는 항목이었습니다. 18:04 에 동아리 로고와 신청 문구를 한 번 더 고치고 18:44 에 글을 올렸습니다.\n\n단점이 세 가지 있습니다. 필터를 걸 때마다 동아리 전량을 받습니다(2026년 3월 규모에서는 괜찮지만 동아리가 늘면 감당하지 못합니다). 서버 필터 버그는 그대로 남았습니다. 같은 조건 판정이 프론트와 백엔드 두 곳에 생겼습니다. 임시 방편인 걸 알고 넣었고 아직 임시 방편입니다.",
        code: {
          filename: "useClubs.ts",
          lines: [
            "} catch {",
            "  // Fallback to /all and apply identical filtering on the client.",
            "  const allResponse = await axios.get<ApiResponse<ApiClubData[]>>('/api/club/all');",
            "  return applyClientFilters(allResponse.data.data, filters).map(mapApiClubToClub);",
            "}"
          ]
        },
        evidence: {
          status: "전후 코드로 확인",
          note: "2026-03-03 16:14 커밋(useClubs.ts +30/−5 · ClubFilterPage.tsx −20)과 18:04 커밋입니다. 훅 자체(useClubs)는 2025-09 팀원이 만든 것이고 제가 넣은 것은 폴백과 applyClientFilters 입니다.",
          url: "https://github.com/aClub2026/FE/commit/470135d8fc8993fe199910dc292ed9e6a81cfa3d"
        }
      },
      {
        title: "수시모집으로 올린 동아리가 전부 「상시모집」으로 찍혔습니다",
        problem:
          "모집 상태 칩이 마감일 계산 결과 하나만 받고 있었습니다. 상시모집도 수시모집도 마감일이 없어 둘 다 같은 값으로 떨어졌고, 칩은 그 값을 보고 무조건 「상시모집」이라고 적었습니다.",
        solution:
          "버그라기보다 축을 하나로 본 설계였습니다. 모집 상태(기간이 얼마 남았나)와 모집 종류(상시냐 수시냐)는 다른 축입니다. 모집 종류를 목록·카드·상세 네 화면을 지나 칩까지 넘기고, 칩은 마감일이 없을 때 넘겨받은 종류를 그대로 적게 했습니다. 칩 한 줄을 고치려고 파일 8개를 고쳐야 했습니다. 같은 시기에 동아리 상세가 404 로 떨어지던 것도 고쳤습니다. 중앙동아리와 소학회의 조회 주소가 달라, 종류를 알면 그 주소만 부르게 했습니다.",
        evidence: {
          status: "전후 코드로 확인",
          note: "2026-02-27 커밋(8파일 +44/−40, PR #3)과 2026-01-25 커밋(useClubDetails.ts)입니다. PR 은 세 건 모두 제가 열고 제가 머지했습니다.",
          url: "https://github.com/aClub2026/FE/commit/7706ca4"
        }
      },
      {
        title: "출시 저녁, 모집공고 등록과 홍보와 문의를 직접 맡았습니다",
        problemLabel: "[LAUNCH]",
        solutionLabel: "Action",
        problem:
          "3월 초 사이트는 열렸지만 모집공고가 등록되지 않은 상태였습니다. 프로젝트장으로서 출시 일정 조율과 동아리 모집공고 등록 요청, 서비스 홍보를 맡았습니다.",
        solution:
          "동아리 회장들에게 직접 연락해 등록을 요청하고, 백엔드 팀원과 출시 일정을 맞췄습니다. 에브리타임 글은 사람이 몰리는 저녁 6시대에 올리고(03/03 18:44) 카톡·인스타로 같이 알렸습니다. 그날 밤 게시글이 실시간 인기 글에 올랐고, 동아리 회장들에게 등록 관련 답변을 받았습니다.\n\n문의도 직접 받았습니다. 올린 지 24분 만에 「로그인이 안 돼」 댓글이 달렸습니다. 에타 앱 안에서 링크를 열면 구글 로그인 버튼이 뜨지 않는 문제였습니다. 문의 33분 뒤 운영진 댓글과 게시글 본문에 「크롬·사파리로 열어 달라」고 안내했습니다. 코드로는 아직 고치지 않았습니다.",
        evidence: {
          status: "게시글·댓글 캡처 기준",
          note: "시각은 에브리타임 게시글과 댓글 캡처에서 읽었습니다."
        }
      },
      {
        title: "1주 뒤 재방문이 5.4%였습니다",
        problemLabel: "[OBSERVATION]",
        solutionLabel: "Decision",
        problem:
          "GA4 코호트에서 1주 유지율이 5.4%, 4주 뒤엔 1.8%였습니다. 그런데 28일 세션 5,311건이 사실상 3월 1~5일 닷새에 몰려 있었고, 유입의 94%가 Referral·Direct, 에브리타임과 인스타그램 링크였습니다.",
        solution:
          "이 숫자는 모집 기간에 한 번 오는 서비스라서 나오는 값이라고 봤습니다. 재방문을 끌어올리는 기능은 만들지 않기로 했고, 닷새 동안 화면이 깨지지 않는 쪽(위의 필터 폴백과 칩 수정)에 시간을 썼습니다. GA4 연동(gtag)은 2025년 11월에 팀원이 넣은 것이고, 저는 그 화면에서 수치를 읽었습니다.",
        evidence: {
          status: "GA4 화면 캡처 기준",
          note: "코호트 표와 트래픽 획득 보고서 캡처(갤러리)에서 읽은 값입니다."
        }
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
      {
        n: "3,500",
        l: "활성 사용자",
        sub: "2026.01.01–03.15 누계",
        source: "GA4 홈 화면 캡처 · 75일 누계 · 연동은 팀원(2025.11)"
      },
      {
        n: "8.8만",
        l: "조회수",
        sub: "같은 75일 누계",
        source: "같은 GA4 홈 화면 · 75일 누계"
      },
      {
        n: "93.4%",
        l: "세션 참여율",
        sub: "지난 28일 · 02.16–03.15",
        source: "GA4 트래픽 획득 보고서 · 02.16–03.15 (28일)"
      },
      {
        n: "1분 28초",
        l: "세션당 참여",
        sub: "세션 5,311건 · 3월 1~5일에 집중",
        source: "같은 28일 보고서 · 세션은 3월 1~5일에 집중"
      },
      // 2026-11-13 밤: 아랫줄 넷은 본인 몫이 얼마인지를 저장소 기록으로 적는다.
      {
        n: "9 → 0",
        l: "연속 실패하던 배포",
        sub: "2026.02.01 세 커밋으로 통과",
        mini: {kind: "bars", before: 9, after: 0},
        source: "GitHub Actions 기록 · 01.13~02.01 · 이후 8회 전부 성공"
      },
      {
        n: "23 / 79",
        l: "2026 저장소 내 커밋",
        sub: "2026.01.18~03.05 · 코드 20 · 머지 3",
        source: "나머지는 팀원 둘(2025.09~11)"
      },
      {
        n: "48 / 310",
        l: "2025 저장소 내 커밋",
        sub: "2025.01~02 · 로그인 · API 연동",
        source: "DBProject-24-2/DB_Project_FE"
      },
      {
        n: "9건",
        l: "2025 머지된 PR",
        sub: "로그인 · API 연동 · 구글 로그인",
        source: "DB_Project_FE · 2025.01~02 · 연 것 19건 중 머지 9건"
      }
    ],
    // ── 상세 페이지 손글씨 칸 (2026-11-13). 저장소 수치는 gh 로 다시 셌다:
    //   2026 aClub2026/FE: tsx 58 · ts 23 · jsx 0, src/Hooks 7개(useClubs·useClubDetails·useRecruitments·
    //   useRecruitmentDetail·useRecruitmentPost·useMypageData·useClubActivityImages), src/api 5개.
    //   2025 DBProject-24-2/DB_Project_FE: jsx 68 · tsx 0.
    detail: {
      intro: {
        show: "동아리를 찾고 모집 공고를 올리는 아주대 플랫폼입니다. 2025년엔 프론트 3인 중 한 명으로 로그인과 API 연동을 맡았고, 2026년엔 프로젝트장으로 출시와 홍보를 맡았습니다. 코드로는 아홉 번 연속 실패하던 배포를 고치고, 출시 당일 필터가 실패하자 그날 오후에 우회로를 넣었습니다. 75일 동안 활성 사용자 3,500명이 썼습니다.",
        bold: "코드로는 아홉 번 연속 실패하던 배포를 고치고, 출시 당일 필터가 실패하자 그날 오후에 우회로를 넣었습니다.",
        more: [
          "2026 저장소의 TypeScript 코드(화면·커스텀 훅·보호 라우트)는 2025년 9~11월에 팀원 둘이 다시 짠 것입니다. 저는 2026년 1월 18일에 합류해 main 커밋 79개 중 23개를 남겼고, 그중 코드 수정이 20건입니다.",
          "이용은 모집 기간 닷새에 몰립니다. 28일 세션 5,311건이 사실상 3월 1~5일이고, 유입의 94%가 에브리타임·인스타그램 링크(Referral+Direct)였습니다. 그래서 재방문(1주 5.4%)을 올리는 기능 대신 그 닷새에 화면이 깨지지 않는 쪽에 시간을 썼습니다.",
          "도메인 aclub.co.kr 은 2026-09-08 에 닫혔습니다(404). 코드는 GitHub(2026 aClub2026/FE · 2025 DBProject-24-2)에 있습니다."
        ]
      },
      highlights: [
        {
          show: "아홉 번 연속 실패하던 배포 워크플로를 고쳤습니다. 배포는 성공하는데 알림 스텝의 if 가 secrets 를 읽다 실패하고 있었습니다. 두 번 잘못 짚고 세 번째 커밋에서 통과했습니다.",
          bold: true,
          more: "GitHub Actions 기록으로 2026-01-13 ~ 02-01 의 실패 9회와 그 뒤 성공 8회가 확인됩니다. CI/CD 를 처음 만든 것은 팀원이고(2025-11), 저는 조직 이전 뒤 고장 난 것을 고쳤습니다."
        },
        {
          show: "출시 당일 오후 필터 API 가 조합에 따라 실패하자, 전체 목록을 받아 화면에서 같은 조건으로 거르는 우회로를 넣고(16:14) 그날 저녁 18:44 에 예정대로 출시했습니다.",
          more: "임시 방편입니다. 필터마다 전량을 받고, 서버 버그는 남았고, 판정이 두 곳에 생겼습니다. 어긋나던 「모집 여부」 필터는 틀린 결과를 보여 주느니 화면에서 뺐습니다."
        },
        {
          show: "출시 저녁을 직접 운영했습니다. 에브리타임에 18:44 게시 → 19:08 「로그인이 안 돼」 문의 → 19:41 운영진 답변(에타 인앱 브라우저에서 로그인 버튼이 안 뜨는 문제, 크롬·사파리 안내).",
          more: "동아리 회장들에게 등록을 요청해 그날 저녁 답장을 받았고, 게시글은 그날 밤 실시간 인기 글에 올랐습니다. 시각은 게시글·댓글 캡처에서 읽었습니다. GA4 수치는 팀원이 연동해 둔 화면에서 읽은 값입니다."
        }
      ],
      briefs: [
        {
          problem:
            "조직으로 저장소를 옮긴 뒤 배포 워크플로가 아홉 번 연속 실패했습니다. 배포 자체는 성공하고 있었습니다.",
          did: "쓰기 권한과 검증 주소를 고치고, 알림 스텝의 if 가 secrets 대신 env 를 비교하게 바꿨습니다. 검증 스텝은 실패해도 배포 결과를 뒤집지 않게 했습니다.",
          result:
            "2026-02-01 13:09 부터 통과했고 이후 main 푸시 8회가 전부 성공했습니다. 원인을 두 번 잘못 짚었습니다."
        },
        {
          problem:
            "출시 당일 오후 동아리 필터가 조합에 따라 가끔 실패했습니다. 저녁 출시는 이미 정해져 있었습니다.",
          did: "필터 API 가 던지면 전체 목록을 받아 화면에서 같은 조건으로 거르게 하고, 판정이 어긋나던 「모집 여부」 필터는 뺐습니다.",
          result:
            "예정대로 18:44 에 출시했습니다. 임시 방편이라 서버 버그는 남았고 필터마다 전량을 받습니다."
        },
        {
          problem:
            "수시모집으로 올린 동아리가 전부 「상시모집」으로 찍혔습니다.",
          did: "모집 상태와 모집 종류를 다른 축으로 나누고, 종류를 네 화면을 지나 칩까지 넘겼습니다.",
          result:
            "칩 한 줄을 고치려고 파일 8개를 건드렸습니다. 같은 시기에 동아리 상세 404 도 종류별 조회로 고쳤습니다."
        },
        {
          problem:
            "3월 초 사이트는 열렸지만 모집 공고가 등록되지 않은 상태였습니다.",
          did: "프로젝트장으로 동아리 회장들에게 직접 등록을 요청하고, 사람이 몰리는 저녁 6시대(18:44)에 에브리타임에 올리고 카톡·인스타로 같이 알렸습니다.",
          result:
            "그날 밤 실시간 인기 글에 올랐고, 24분 뒤 로그인 문의에 33분 뒤 운영진 댓글로 우회 방법(크롬·사파리)을 안내했습니다. 코드로는 아직 안 고쳤습니다."
        },
        {
          problem: "GA4 코호트에서 1주 유지율이 5.4%, 4주 뒤엔 1.8%였습니다.",
          did: "이용이 모집 기간에 집중된다는 판단을 기록하고, 재방문 기능 대신 그 닷새에 화면이 깨지지 않는 쪽에 시간을 썼습니다.",
          result:
            "1주 5.4%, 4주 1.8%라는 값을 그 판단의 근거로 기록해 두었습니다."
        }
      ],
      summaries: {
        arch: "React + TypeScript · 커스텀 훅 7 · axios 모듈 5 · 보호 라우트 2 · GitHub Pages. 이 구조는 2025.09~11 팀원 작성.",
        code: "필터 폴백(useClubs.ts)과 배포 알림 조건(deploy.yml). 둘 다 본인 커밋.",
        proc: "2025.01~02 로그인·API 연동 → 2025.09~11 팀원들이 TS 재작성 → 2026.01 프로젝트장 → 02.01 배포 수리 → 03.03 출시."
      },
      scenes: [
        {
          place: "why",
          kind: "bars",
          title: "28일 유입 채널 · 세션 5,311건",
          unit: "%",
          max: 100,
          rows: [
            {label: "Referral", value: 54.8},
            {label: "Direct", value: 39.3},
            {label: "검색", value: 3.8, tone: "muted"}
          ],
          note: "에브리타임·인스타그램 링크로 들어오는 Referral + Direct 가 94%. 검색은 3.8%입니다. 대부분 링크를 타고 닷새 안에 들어옵니다.",
          source:
            "GA4 트래픽 획득 보고서 2026-02-16~03-15 (갤러리 「유입 채널과 트래픽 분포」 캡처)"
        },
        {
          place: "why",
          kind: "line",
          title: "주차별 재방문 유지율",
          unit: "%",
          points: [
            {x: "1주", y: 5.4},
            {x: "2주", y: 4.3},
            {x: "3주", y: 3.2},
            {x: "4주", y: 1.8}
          ],
          note: "5주째(0.0%)는 아직 기간이 차지 않은 칸이라 그리지 않았습니다. 이 표를 보고 재방문을 끌어올리는 기능은 만들지 않기로 했습니다.",
          source:
            "GA4 코호트 표, 3월 14일에 끝나는 6주 (갤러리 「주차별 재방문 유지율」 캡처)"
        },
        {
          place: "trouble",
          kind: "timeline",
          title: "배포가 통과하기까지 · 2026.02.01",
          from: "09:00",
          to: "13:30",
          events: [
            {
              at: "09:18",
              until: "09:36",
              label: "실패 네 번",
              detail: "설정을 고치는 커밋 네 개가 연달아 실패",
              tone: "fail"
            },
            {
              at: "13:06",
              label: "실패 · 조건만 추가",
              detail: "if: failure() && secrets.…",
              tone: "fail"
            },
            {
              at: "13:08",
              label: "실패 · ${{ }} 로 감쌈",
              detail: "그래도 if 에서는 secrets 를 못 읽음",
              tone: "fail"
            },
            {
              at: "13:09",
              label: "통과 · env 로 받아 비교",
              detail: "env.DISCORD_WEBHOOK_URL",
              tone: "ok",
              href: "https://github.com/aClub2026/FE/commit/31c4188"
            }
          ],
          totals: [
            {label: "01.13 ~ 02.01 실패", n: 9, tone: "fail"},
            {label: "그 뒤 main 푸시 성공", n: 8, tone: "ok"}
          ],
          note: "앞선 실패 세 번은 1월 13·19·24일입니다. 배포 자체는 성공하고 있었고, 실패한 것은 마지막 알림 스텝이었습니다.",
          source: "GitHub Actions 실행 기록 · 시각은 KST"
        },
        {
          place: "trouble",
          kind: "timeline",
          title: "출시일 · 2026.03.03",
          from: "16:00",
          to: "20:00",
          events: [
            {
              at: "16:14",
              label: "필터 폴백 커밋",
              detail: "필터 API 실패 시 전체를 받아 화면에서 거름",
              tone: "warn",
              href: "https://github.com/aClub2026/FE/commit/470135d8fc8993fe199910dc292ed9e6a81cfa3d"
            },
            {
              at: "18:04",
              label: "로고 · 신청 문구 수정",
              detail: "출시 40분 전 마지막 커밋",
              tone: "muted"
            },
            {
              at: "18:44",
              label: "에브리타임 게시",
              detail: "사람이 몰리는 저녁 6시대 · 카톡·인스타 동시",
              tone: "ok"
            },
            {
              at: "19:08",
              label: "「로그인이 안 돼」 댓글 두 건",
              detail:
                "게시 24분 뒤 · 에타 인앱 브라우저에서 로그인 버튼이 안 뜸",
              tone: "warn"
            },
            {
              at: "19:41",
              label: "운영진 답변",
              detail:
                "문의 33분 뒤 · 「크롬·사파리로 열어 달라」 + 게시글 본문에도 안내",
              tone: "ok"
            }
          ],
          note: "같은 날 밤 실시간 인기 글 2위. 그날 저녁 동아리 회장들의 등록 답장이 이어졌습니다.",
          source:
            "커밋 시각은 저장소 기록(KST), 게시·문의·답변 시각은 에브리타임 게시글·댓글 캡처(갤러리 「출시 저녁」 두 장)"
        },
        {
          place: "arch",
          kind: "bars",
          title: "두 저장소에서 내 커밋이 차지하는 몫",
          unit: "개",
          rows: [
            {label: "2025 저장소 전체", value: 310, tone: "muted"},
            {label: "2025 · 내 커밋", value: 48},
            {label: "2026 저장소 main 전체", value: 79, tone: "muted"},
            {label: "2026 · 내 커밋", value: 23}
          ],
          note: "2025 는 JSX 68개짜리 저장소였고, 2026 저장소(TSX 58 · TS 23 · Hooks 7 · api 5)는 2025년 9~11월에 팀원 둘이 다시 짠 것입니다. 제 2026 커밋은 그 위의 수정입니다."
        }
      ]
    },
    // 네 값의 출처가 **GA4 화면 두 개**다. 예전엔 `2026.01–03` 한 줄로
    // 뭉뚱그렸는데, 앞의 둘은 75일 누계고 뒤의 둘은 28일 값이다. 갤러리에
    // 두 캡처를 나란히 붙여 놓고 기간을 안 밝히면, 확대해 본 심사자가
    // 「어느 게 맞는 숫자냐」에서 멈춘다. 길어도 어느 값이 어느 창인지 적는다.
    //
    // 2025 를 합치면 활성 사용자가 7.8천으로 커지지만 그 해엔 프론트 3인 중
    // 하나였다. 총괄로 맡은 구간만 끊어 세는 편이 숫자는 작아도 주장은 정확하다.
    metricsNote:
      "윗줄 넷은 Google Analytics 4 화면에서 읽은 값입니다. 활성 사용자·조회수는 2026.01.01–03.15 누계, 세션 참여율·세션당 참여 시간은 그중 마지막 28일(02.16–03.15)입니다. 아랫줄 넷은 저장소 기록입니다.",
    kpt: {
      keep: [
        "알림이나 검증 스텝이 배포 결과를 뒤집지 않게 한 것",
        "틀린 결과를 보여 주느니 필터를 화면에서 뺀 것",
        "출시 시각을 사람이 몰리는 저녁으로 잡고 문의를 직접 받은 것"
      ],
      problem: [
        "서버 필터 버그가 그대로 남았고 판정이 프론트와 백엔드 두 곳에 있습니다",
        "인앱 브라우저에서 구글 로그인 버튼이 안 뜨는 문제를 코드로 못 고쳤습니다"
      ],
      try: [
        "필터 버그를 백엔드에서 고치고 폴백을 걷어내기",
        "인앱 브라우저 감지 후 외부 브라우저로 열기 안내"
      ]
    },
    // 예전 결론은 "커스텀 훅과 보호 라우트가 그 답이었다" 였다. 그게 이 페이지의
    // 마지막 문장인 게 문제였다 — 훅으로 요청을 모으고 라우트로 권한을 막는 건
    // React 를 반 년 쓴 사람이면 하는 일이라 변별력이 없는데, 정작 이 페이지
    // 맨 위에는 「3,500 명이 쓴다」와 「프론트 3인 중 1인 → 프로젝트장」이라는
    // 훨씬 희소한 사실이 적혀 있었다. 심사자는 "총괄로 뭘 했지" 를 묻고 끝까지
    // 읽지만, 답이 훅이었다.
    //
    // 게다가 이력서 첫 화면의 주제문은 「말 없이 참고 넘기던 불편 하나에서 떠난다 —
    // 그 하나까지 찾아내는」(2026-09-05 개정, 그 전엔 「쓰는 사람 말을 듣고
    // 고치는」)이다. 대표 프로젝트의 결론이 그 주제문과 다른 이야기를 하고 있었다.
    learningLead:
      "배포가 아홉 번 실패로 찍히는 동안 배포 자체는 성공하고 있었고, 실패한 곳은 알림 스텝이었습니다. 실패한 단계를 먼저 봤으면 한 번에 끝났을 일입니다.",
    learning:
      "2026년의 저는 코드를 가장 많이 쓴 사람이 아니었습니다. 팀원들이 다시 짠 코드 위에서 출시를 막는 문제를 고쳤고, 출시일과 그 저녁을 맡았습니다. 맞는 해법(백엔드 수정)을 기다릴 수 없는 날에는 임시 방편을 넣고 그게 임시라는 것을 적어 두었습니다."
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
      // 파일이 640×306 이다. 16/9 로 적으면 위아래가 잘린다(2026-11-13 실측).
      ratio: "640/306"
    },
    // 학생들은 폰으로 본다. 그런데 2025 모바일은 주요 메뉴가 햄버거 안에만
    // 있었다 — 「정보 탐색 효율 개선」이라고 적어만 두고 근거가 없던 그 지점이다.
    problemShot: {
      src: "/projects/ajouchong/v2/mobile-before.webp",
      label: "2025 모바일 · 메뉴가 햄버거 안에만 있었습니다",
      ratio: "9/16",
      caption:
        "첫 화면에 있는 건 대여사업 카드 하나뿐. 소개·소식·소통·자료실·학생복지로 가려면 오른쪽 위 햄버거를 먼저 눌러야 했습니다."
    },
    // 2026.04 개편 — 개선 전/후 캡처가 실제로 남아 있다(업데이트 자료 3차례분).
    beforeAfter: {
      before: {
        label: "햄버거를 눌러야 메뉴가 보입니다",
        shot: {
          src: "/projects/ajouchong/v2/mobile-before.webp",
          label: "개편 전 모바일 메인",
          ratio: "9/16"
        },
        note: "탭 한 번을 더 써야 목적지가 나옵니다. 어디로 갈 수 있는지조차 첫 화면에 안 보입니다."
      },
      after: {
        label: "첫 화면에 여섯 갈래를 폅니다",
        shot: {
          src: "/projects/ajouchong/v2/mobile-after.webp",
          label: "개편 후 모바일 메인",
          ratio: "9/16"
        },
        note: "소개·소식·소통·자료실·학생복지·ACENTIA(아주대 축제)를 아이콘 카드로 히어로 바로 밑에 놨습니다. 기존 메뉴 여섯 개를 첫 화면에서 확인할 수 있도록 배치했습니다."
      }
    },
    gallery: [
      // ── 2026.04 개편 이후 ──
      // 공통점: 전부 **총학생회가 직접 고치는 화면**이거나 **학생이 오기 전에 보는 화면**이다.
      // 2025 때는 물품 수량 하나 바꾸려 해도 개발자가 배포해야 했다.
      {
        src: "/projects/ajouchong/v2/rental.webp",
        label: "대여사업 · 남은 수량을 오기 전에",
        ratio: "21/10",
        caption:
          "총 품목·대여 가능·재고 임박·최종 업데이트를 한 줄에 세우고, 품목마다 남은 수량을 막대로 보여 줍니다. 총학생회실 문 앞에서 「남아 있어요?」를 묻던 학생이 오기 전에 알 수 있게 한 화면. 대여·반납 기록은 창구에서 관리자가 남깁니다."
      },
      {
        src: "/projects/ajouchong/v2/rental-admin.webp",
        label: "대여 물품 관리 · 운영자가 직접",
        ratio: "21/10",
        caption:
          "수량 옆 −/+ 로 바로 조정하고 「35 (변경됨)」처럼 저장 전 상태를 표시합니다. 확인 대화상자로 한 번 더 묻고, 서버는 0 미만·총량 초과를 거부합니다. 실수로 재고가 틀어지면 학생이 헛걸음합니다."
      },
      {
        src: "/projects/ajouchong/v2/linkhub.webp",
        label: "링크허브 · 인스타 프로필 링크 한도를 우회",
        ratio: "16/10",
        caption:
          "인스타그램 프로필에는 링크를 몇 개밖에 못 걸어, 접수 폼이 새로 생길 때마다 뭔가를 내려야 했습니다. 프로필엔 이 페이지 하나만 걸고, 안에서 접수 창구·공모전·수요조사 링크 11개를 모아 보여 줍니다. 링크는 관리자 화면에서 총학생회가 직접 넣고 뺍니다."
      },
      {
        src: "/projects/ajouchong/v2/chatbot.webp",
        label: "홈페이지 도우미 · 퀵 메뉴 + 의견 접수",
        ratio: "21/10",
        caption:
          "공지·대여사업·제휴복지·Q&A·건의 메뉴로 이동하는 버튼과 의견 제출 폼을 제공했습니다. 의견은 Q&A API 로 들어가 관리자 화면에 쌓입니다."
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
      note: "Google Search Console 내보내기 487일치(2025-05-01~2026-08-30) 실합계. 계절에 따른 차이를 줄이고자 2025년과 2026년의 같은 달만 맞대 놨습니다. 4개월 합계로 노출 2,290 → 5,392(×2.35), 클릭 321 → 491(×1.53). CTR은 14.0% → 9.1%로 내려갔습니다. 노출이 증가한 영향일 수 있지만, 검색어별 분석 없이 원인을 확정하지는 않았습니다. 클릭 절대수는 늘었습니다. 늘어난 이유를 개편만으로 돌릴 수는 없습니다(행사·외부 링크·검색 알고리즘). 확실한 건 시점뿐입니다: 2026년 4월부터 이 사이트를 혼자 맡았습니다."
    },
    // 이 넷만 읽고 나가는 심사자가 있다. 요약·본문·결론이 같은 프로젝트를 말해야 한다 —
    // 예전엔 요약은 2차, 본문(가설·트러블슈팅·결정표)은 전부 2025 얘기였다.
    tldr: [
      {
        k: "무엇을",
        v: "아주대 총학생회 공식 웹 · 2025년엔 프론트 3인 중 한 명, 2026년부터 혼자 맡아 UI 전면 개편 · 대여사업 · 링크허브 · 관리자 화면을 프론트부터 API까지"
      },
      {
        k: "왜",
        v: "학생은 물품이 남았는지 몰라 총학생회실까지 왔고, 인스타 프로필엔 링크를 몇 개밖에 못 걸었고, 수량 하나 고치는 데도 개발자가 필요했습니다"
      },
      {
        k: "결과",
        v: "학생은 오기 전에 수량을 보고, 총학생회는 수량·링크·의견을 관리 화면에서 직접 고칩니다. 품목 10종 · 링크 11개가 실서비스에서 돌아가는 중"
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
      "학생은 물품이 남았는지 몰라 총학생회실까지 와서야 없다는 말을 들었고, 인스타 프로필에는 링크를 몇 개밖에 못 걸어 접수 폼·공모전 링크가 매번 밀려났습니다. 사이트는 있었지만 수량 하나, 링크 하나 바꾸는 데도 개발자가 배포해야 했습니다.",
    research: {
      // 창구·운영 경험 인용 둘을 뺐다. problem 이 같은 두 문장을 그대로 담고 있어,
      // 따옴표를 씌우고 "(본인)" 을 붙인 만큼만 군더더기였다.
      quotes: [],
      stat: {
        n: "10 · 11",
        l: "실서비스 대여 품목 · 링크허브 링크 (2026.09 공개 API 기준)"
      }
    },
    hypothesis:
      "학생이 방문 전에 수량을 확인하고, 총학생회 담당자가 관리자 화면에서 수량·링크·의견을 직접 관리하도록 설계했습니다.",
    process: [
      {t: "2025", d: "프론트 화면 일부"},
      {t: "UI 개편", d: "모바일 6갈래"},
      {t: "대여사업", d: "API + 화면"},
      {t: "링크허브", d: "Link 테이블 + 관리"},
      {t: "관리자", d: "ADMIN 권한"},
      {t: "운영", d: "EC2 compose · 힙 384MB"}
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
        desc: "RentalItem·RentalRecord·Link · 사용자/관리자 컨트롤러 분리"
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
        why: "대여·반납은 관리자 기록으로만, 실물과 수량이 안 어긋남",
        alt: "온라인 예약(노쇼·중복 관리 ↑)"
      },
      {
        area: "링크허브",
        pick: "DB + 관리 화면",
        why: "링크는 매주 바뀌어 개발자 없이 갈아끼움",
        alt: "코드에 하드코딩(배포 필요)"
      },
      {
        area: "도우미",
        pick: "퀵 메뉴 + 의견 폼",
        why: "길 안내와 접수면 충분, 답 품질 책임이 없음",
        alt: "LLM 기반 질의응답"
      },
      {
        area: "권한",
        pick: "/api/admin/** 전체에 ADMIN",
        why: "넘겨받은 규칙이 /api/admin 한 경로만 막고 있었음 (2026 · PR #69)",
        alt: "컨트롤러마다 @PreAuthorize(빠뜨리면 열림)"
      }
    ],
    coreCode: [
      {
        filename: "RentalService.java",
        caption:
          "수량 조정은 서버가 검증합니다. 0 미만·총량 초과 거부 (2026 · 백엔드)",
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
      // 2026-11-13 저녁: nginx.conf(SPA 폴백) 카드를 뺐다. 그 파일은 팀원(y.tnwjd)이 쓴 것이다.
      // 대신 본인 PR #69 의 한 줄 수정을 싣는다(gh 로 diff 확인).
      {
        filename: "SecurityConfig.java · PR #69",
        caption:
          "관리자 규칙이 /api/admin 한 경로만 가리키고 있었습니다. 아래 경로 전체로 넓혔습니다 (2026 · 백엔드)",
        highlightLines: [2, 3],
        lines: [
          '.requestMatchers("/favicon.ico", "/img/**").permitAll()',
          '- .requestMatchers("/api/admin").hasRole(MemberRole.ADMIN.name())',
          '+ .requestMatchers("/api/admin/**").hasRole(MemberRole.ADMIN.name())',
          ".anyRequest().permitAll()"
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
      {
        g: "2026 운영",
        items: [
          "Dockerfile 빌드 단계 제거 · EC2 compose 힙 384MB",
          "전역 예외 처리 보강 · SQL 로그 끔"
        ]
      }
    ],
    challenges: [
      {
        title: "학생이 총학생회실까지 와서야 「없다」는 말을 들었습니다",
        problem:
          "물품 수량이 어디에도 안 보였습니다. 사이트에 올려도 개발자가 배포해야 바뀌니, 결국 안 올렸습니다.",
        solution:
          "RentalItem 에 총량·현재 수량을 두고, 관리자 화면의 −/+ 가 PATCH /quantity 로 바로 반영되게 했습니다. 서버가 0 미만·총량 초과를 거부하고, 대여·반납은 RentalRecord 로 남아 수량을 움직입니다. 학생 화면은 그 수량을 읽기만 합니다.",
        evidence: {
          status: "코드로 확인",
          note: "수량 검증은 RentalService 에 있습니다.",
          url: "https://github.com/ajouchong-dev/ajouchong/blob/3b26e9f0adca83c91b29ecb88a2f220397156ea4/src/main/java/com/ajouchong/service/RentalService.java"
        }
      },
      {
        title: "인스타 프로필에 링크를 다 못 걸었습니다",
        problem:
          "프로필 링크 칸이 몇 개 안 돼, 접수 폼·공모전·수요조사가 생길 때마다 이전 링크를 내려야 했습니다.",
        solution:
          "/linkHub 한 페이지와 Link 테이블, 관리 화면을 만들었습니다. 프로필엔 이 페이지 하나만 걸고, 링크는 총학생회가 직접 넣고 뺍니다. 지금 11개가 걸려 있습니다.",
        evidence: {
          status: "코드로 확인",
          note: "LinkHub 페이지를 추가한 커밋입니다. 코드의 url 필드는 그 뒤 link 로 바뀌었습니다.",
          url: "https://github.com/ajouchong-dev/ajouchong-web/blob/8a4c261807a26da04c38f5d3375d32115e4430da/src/pages/LinkHub/index.js"
        }
      },
      // 2026-11-13 저녁: 「새로고침하면 404 (2025)」 카드를 뺐다. nginx.conf 는 팀원이 쓴 파일이고
      // 폴백이 없던 전 상태도 이력에서 못 찾았다. 본인 커밋으로 확인되는 2026 백엔드 두 건으로 바꿨다.
      {
        title: "관리자 API 의 권한 규칙이 한 경로만 막고 있었습니다",
        problem:
          "2026년 4월에 백엔드를 넘겨받아 대여 관리 API 를 붙이다가 Security 설정을 읽었습니다. ADMIN 규칙이 /api/admin 한 경로에만 걸려 있고 나머지는 전부 허용이라, /api/admin/ 아래에 새로 만드는 관리자 컨트롤러에는 권한 검사가 걸리지 않는 상태였습니다.",
        solution:
          "규칙을 /api/admin/** 로 넓혀 관리자 경로 전체에 ADMIN 권한을 요구하게 했습니다. 같은 PR 에서 관리 화면의 수량 조정이 쓰는 PATCH 를 CORS 허용 메서드에 넣고, JWT 필터가 OPTIONS 와 로그인·로그아웃 경로를 건너뛰게 했습니다. 며칠 뒤에는 전역 예외 처리에 로그와 없는 경로 404 응답을 보탰습니다. 혼자 맡은 저장소의 한계입니다.",
        code: {
          filename: "SecurityConfig.java",
          lines: [
            '- .requestMatchers("/api/admin").hasRole(MemberRole.ADMIN.name())',
            '+ .requestMatchers("/api/admin/**").hasRole(MemberRole.ADMIN.name())',
            "  .anyRequest().permitAll()"
          ]
        },
        evidence: {
          status: "전후 코드로 확인",
          note: "백엔드 PR #69(2026-04-05, 23파일 +946/−8)의 SecurityConfig.java · JwtAuthenticationFilter.java diff 입니다. 전역 예외 처리는 04-11 · 04-12 커밋입니다.",
          url: "https://github.com/ajouchong-dev/ajouchong/pull/69/files"
        }
      },
      {
        title: "배포 구성은 팀이 만든 것이고, 맡은 뒤에 서버 설정을 손봤습니다",
        problem:
          "Docker · Nginx · CI 구성은 2024~2025년에 팀원이 만들었습니다. 2026년 4월부터는 배포도 혼자 맡았습니다.",
        solution:
          "2026-04-12 에 배포용 Dockerfile 에서 빌드 단계를 빼고 미리 빌드한 jar 를 복사하게 바꿨습니다(.dockerignore 추가). 2026-06-30 「서버 용량 관리」 커밋에서는 EC2 용 compose 에 JVM 힙 상한(-Xms128m -Xmx384m, 메타스페이스 128m)과 컨테이너 자동 재시작(restart: unless-stopped)을 넣고, 운영에서 켜져 있던 SQL 로그(show-sql)를 껐습니다.",
        code: {
          filename: "docker-compose.ec2.yml · 2026.06.30",
          lines: [
            "  backend:",
            "+   restart: unless-stopped",
            "    environment:",
            '+     JAVA_OPTS: "-Xms128m -Xmx384m -XX:MaxMetaspaceSize=128m"',
            '+     SPRING_JPA_SHOW_SQL: "false"'
          ]
        }
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
      {
        n: "12,314",
        l: "검색 노출",
        sub: "GSC 487일 · 2025.05~2026.08",
        source: "Google Search Console · 2025.05~2026.08 · 검색 유입만"
      },
      {
        n: "1,694",
        l: "검색 클릭",
        sub: "같은 기간 · CTR 13.8%",
        mini: {kind: "bars", before: 321, after: 491},
        source: "같은 GSC · 막대는 5~8월 클릭 2025 321 → 2026 491"
      },
      {
        n: "13.8%",
        l: "검색 CTR",
        sub: "같은 달 비교에서는 14.0% → 9.1%",
        source: "16개월 전체 CTR · 같은 달 비교에선 14.0% → 9.1%"
      },
      {
        n: "10 · 11",
        l: "대여 품목 · 링크 (실서비스)",
        sub: "품목 10종 124개 · 링크허브 11개"
      },
      // 2026-11-13 저녁: 아랫줄 넷은 2026 년에 혼자 맡은 뒤의 저장소 기록이다(gh 로 확인).
      {
        n: "2건",
        l: "2026 백엔드 PR",
        sub: "#69 +946줄 · #70 +644줄",
        source: "ajouchong-dev/ajouchong · 2026.04 · 리뷰 없는 셀프 머지"
      },
      {
        n: "5개",
        l: "새로 만든 엔티티",
        sub: "대여 품목·기록 · 제휴 · 회의록 분류·문서",
        source: "PR #69 · #70 파일 목록 · Link 는 기존 것을 고침"
      },
      {
        n: "+2,547줄",
        l: "프론트 전면 개편 PR #36",
        source: "ajouchong-dev/ajouchong-web PR #36 · 추가 줄 수"
      },
      {
        n: "46개",
        l: "프론트 커밋",
        sub: "전체 355개 중 · 2025.03~2026.09"
      }
    ],
    metricsNote:
      "검색 셋은 Google Search Console · 2025.05~2026.08(16개월) · 검색 유입 기준 (전체 방문자 아님). 품목·링크 수는 2026.09.04 공개 API 응답을 센 것.",
    // ── 상세 페이지 손글씨 칸 (2026-11-13). PR 수치는 gh 로 다시 확인했다:
    //   프론트 ajouchong-dev/ajouchong-web  #35 Jjh rental +1,274/−299 (04-10) · #36 Renew design +2,547/−71 (04-27, develop)
    //   백엔드 ajouchong-dev/ajouchong      #69 Jjh rental +946/−8 (04-05) · #70 Jjh rental +644/−70 (04-10)
    //   develop 브랜치의 본인 커밋 46개(2026-11-13 기준).
    detail: {
      compareTags: ["2025", "2026"],
      intro: {
        show: "아주대 총학생회 공식 사이트입니다. 2025년에는 프론트 3인 중 한 명으로 화면 일부를 맡았고, 2026년 4월부터는 혼자서 화면·Spring Boot API·배포를 전부 맡아 모바일 첫 화면 개편, 대여 수량 조회, 링크허브, 관리자 화면을 넣었습니다.",
        bold: "2026년 4월부터는 혼자서 화면·Spring Boot API·배포를 전부 맡아 모바일 첫 화면 개편, 대여 수량 조회, 링크허브, 관리자 화면을 넣었습니다.",
        more: [
          "학생은 총학생회실에 오기 전에 물품이 남았는지 보고, 총학생회는 수량·링크·공지·의견을 관리 화면에서 직접 고칩니다. 수량 하나 바꾸는 데 개발자 배포가 필요하던 구조를 없앤 것이 핵심입니다.",
          "프론트 PR #36(전면 디자인 개편, +2,547줄) · #35(대여 UX), 백엔드 PR #69·#70(RentalItem·RentalRecord·Link 엔티티와 API).",
          "효과는 검색 노출로만 쟀습니다(Google Search Console). 헛걸음 문의가 얼마나 줄었는지는 세지 않았습니다.",
          "백엔드를 넘겨받으며 관리자 권한 규칙이 한 경로만 막고 있던 것을 /api/admin/** 로 넓혔고, 배포용 Dockerfile 과 EC2 compose(JVM 힙 384MB · 자동 재시작)를 손봤습니다. Docker · Nginx · CI 구성 자체는 팀원이 만든 것입니다."
        ]
      },
      highlights: [
        {
          show: "대여 수량을 서버가 지키게 했습니다. RentalItem 에 총량·현재 수량을 두고 관리자 화면의 −/+ 가 PATCH /quantity 로 바로 반영되며, 0 미만·총량 초과는 서버가 거부합니다.",
          bold: true,
          more: "대여·반납은 RentalRecord 로 남아 수량을 움직이고, 학생 화면은 그 수량을 읽기만 합니다. 화면의 −/+ 는 우회할 수 있어도 API 의 거부는 못 합니다. 백엔드 PR #69(+946줄)·#70(+644줄)."
        },
        {
          show: "모바일 첫 화면에 메뉴 여섯 갈래를 펴서 햄버거를 안 눌러도 갈 곳이 보이게 했습니다(프론트 PR #36, +2,547줄, 2026-04-27 머지).",
          more: "2025 화면은 첫 화면에 대여사업 카드 하나뿐이었고, 소개·소식·소통·자료실·학생복지로 가려면 오른쪽 위 햄버거를 먼저 눌러야 했습니다. 아래 전/후 슬라이더가 그 두 화면입니다."
        },
        {
          show: "인스타 프로필엔 링크를 몇 개밖에 못 걸어서 /linkHub 한 페이지와 Link 테이블·관리 화면을 만들었습니다. 지금 11개가 걸려 있습니다.",
          more: "링크는 총학생회가 직접 넣고 뺍니다. 2026-09-04 공개 API 로 센 값이 11개입니다."
        }
      ],
      briefs: [
        {
          problem:
            "물품 수량이 어디에도 안 보여 학생이 총학생회실까지 와서야 「없다」는 말을 들었습니다.",
          did: "RentalItem 에 총량·현재 수량을 두고 관리자 −/+ 를 PATCH /quantity 로 바로 반영, 0 미만·총량 초과는 서버가 거부하게 했습니다.",
          result:
            "학생은 오기 전에 수량을 보고, 대여·반납은 RentalRecord 로 남습니다."
        },
        {
          problem:
            "인스타 프로필 링크 칸이 몇 개 안 돼 새 폼이 생길 때마다 이전 링크를 내려야 했습니다.",
          did: "/linkHub 페이지와 Link 테이블, 관리 화면을 만들어 프로필엔 이 페이지 하나만 걸게 했습니다.",
          result:
            "총학생회가 링크를 직접 넣고 빼며, 2026-09 기준 11개가 걸려 있습니다. 초기 커밋의 url 필드는 뒤에 link 로 바뀌었습니다."
        },
        {
          problem:
            "ADMIN 규칙이 /api/admin 한 경로에만 걸려 있어 그 아래에 새로 만드는 관리자 API 에는 권한 검사가 걸리지 않았습니다.",
          did: "규칙을 /api/admin/** 로 넓히고, 수량 조정이 쓰는 PATCH 를 CORS 에 넣고, JWT 필터가 OPTIONS 와 로그인 경로를 건너뛰게 했습니다.",
          result: "대여·제휴·회의록 관리 API 가 ADMIN 권한 뒤에 놓였습니다."
        },
        {
          problem:
            "Docker · Nginx · CI 는 팀원이 만든 구성이었고, 2026년 4월부터 배포도 혼자 맡았습니다.",
          did: "배포용 Dockerfile 에서 빌드 단계를 빼고, EC2 compose 에 JVM 힙 384MB 상한과 자동 재시작을 넣고, 운영 SQL 로그를 껐습니다.",
          result:
            "빌드 단계 없는 배포 이미지와 힙 384MB 상한, 자동 재시작이 운영 구성에 들어갔습니다."
        }
      ],
      summaries: {
        arch: "React 18(CRA) · Spring Boot 3 + JPA + PostgreSQL · JWT · 팀이 만든 Docker + Nginx 구성 위에서 2026 부터 단독 운영.",
        code: "RentalService 의 수량 검증과 SecurityConfig 의 관리자 경로 규칙.",
        proc: "2025 팀원으로 화면 일부 → 2026.04 단독: 대여 API → 대여 UX → 전면 개편 → 링크허브."
      },
      scenes: [
        {
          place: "trouble",
          kind: "timeline",
          title: "2026년 4월 · 혼자 맡은 첫 달에 머지한 PR",
          unit: "date",
          from: "2026-04-01",
          to: "2026-05-01",
          events: [
            {
              at: "2026-04-05",
              label: "백엔드 #69 대여 API",
              href: "https://github.com/ajouchong-dev/ajouchong/pull/69",
              detail: "RentalItem · RentalRecord 엔티티와 서비스 · +946줄",
              tone: "ok"
            },
            {
              at: "2026-04-10",
              label: "프론트 #35 대여 UX · 백엔드 #70",
              href: "https://github.com/ajouchong-dev/ajouchong-web/pull/35",
              detail: "+1,274줄 · +644줄, 관리자 −/+ 와 PATCH /quantity",
              tone: "ok"
            },
            {
              at: "2026-04-27",
              label: "프론트 #36 전면 디자인 개편",
              href: "https://github.com/ajouchong-dev/ajouchong-web/pull/36",
              detail: "+2,547줄",
              tone: "ok"
            }
          ]
        }
      ]
    },
    kptLabels: {
      keep: "2025에서 배운 것 · 개발·배포",
      problem: "아직 남은 것",
      try: "2026에서 배운 것 · 운영·사용자"
    },
    // KEEP/TRY 를 「2025에서 배운 것 / 2026에서 배운 것」으로 갈랐다.
    // 두 해의 배움이 서로 다른 종류다. (원페이저에는 안 그린다 — ProjectOnePager 참고)
    kpt: {
      keep: [
        "2025 · 기존 프로젝트의 프론트엔드 일부(대여 검색 · 정책집 · 조직도)를 담당했습니다",
        "2025 · Docker · Nginx · CI 배포 구성은 팀원이 만든 것입니다. 2026 에 그 위에서 설정을 손봤습니다"
      ],
      problem: [
        "대여 신청은 아직 창구에서 받습니다 (온라인은 수량 조회까지)",
        "개편 효과는 검색 노출로만 봤습니다. 헛걸음 문의가 얼마나 줄었는지는 세지 않았습니다",
        "접근성(대비·포커스)은 여전히 보강이 필요합니다"
      ],
      try: [
        "2026 · 모바일 첫 화면에 여섯 갈래를 펴서 햄버거를 안 눌러도 보이게 했습니다",
        "2026 · 수량·링크·공지·피드백을 총학생회가 관리 화면에서 직접 고칩니다",
        "2026 · 수량 검증을 서버에 뒀습니다. 화면의 −/+ 는 우회할 수 있어도 API 의 거부는 못 합니다",
        "2026 · 넘겨받은 설정은 먼저 읽습니다. 관리자 규칙이 한 경로만 막고 있던 것을 그렇게 찾았습니다"
      ]
    },
    learningLead:
      "수량 하나 바꾸는 데 개발자 배포가 필요했던 것을 관리 화면으로 없앤 것이 2026 개편의 핵심이었습니다.",
    learning:
      "2025년에는 프론트엔드 일부를 담당했고, 2026년에는 화면·API·배포를 혼자 맡았습니다. 모바일 첫 화면에 메뉴를 배치하고, 학생의 대여 수량 조회와 총학생회의 직접 관리 기능을 구현했습니다."
  },

  // ════════════════════════════ 수어지교 / Sign-Language (platform · 팀) ══════
  "sign-language": {
    // 2026-11-13 밤: 저장소를 줄 단위로 다시 확인했다. 「백엔드 둘 중 하나」와 git blame 수치는 맞다
    // (TranslationService 338줄 중 158 · StorageVideoCache 177 중 128, 백엔드 자바 4,228줄 중 877줄,
    // Dockerfile 과 deploy-pages.yml 은 본인 커밋뿐). 커밋 수(backend 32 중 8)만 보고 낮게 본 것은 틀렸다.
    // 빠져 있던 것은 2차 작업이다. 2026.09~10 ml/ 커밋 32개 중 28개가 본인이고 실험 기록이
    // ml/experiments.md 에 자동으로 남아 있다. 타일 넷과 꺾은선 장면 하나로 보탰다.
    tagline: "SIGN LANGUAGE LEARNING · TEAM (BACKEND)",
    // 배포본(GitHub Pages)에서 그대로 찍은 화면 다섯 장. 폰 비율(500×1023)이라
    // 16/10 상자에 cover 로 넣으면 위아래가 잘려 아무것도 안 보인다 — 상자를
    // 세로로 두고 contain 으로 넣어 화면 전체가 남게 한다.
    // 문제 단계 그림(problemShot)은 뺐다. "기존 학습 방식" 을 찍은 사진이
    // 없어서 회색 상자만 서 있었고, 없는 그림 자리를 비워 두는 편이 낫다.
    heroImage: {
      src: "/projects/sign-language/quiz.webp",
      label: "퀴즈 · 아바타 동작을 보고 뜻 고르기",
      ratio: "1/1",
      fit: "contain",
      caption:
        "동작을 먼저 보여주고 보기 4개 중 뜻을 고르게 합니다. 문항마다 난이도와 정답률이 붙고, 표본이 적으면 그 사실을 화면에 적어 둡니다."
    },
    gallery: [
      {
        src: "/projects/sign-language/learn.webp",
        label: "학습 과정 · 기초 단어 · 오답 복습 · 일상 회화 · 상황별 표현",
        ratio: "3/4",
        fit: "contain"
      },
      {
        src: "/projects/sign-language/translator.webp",
        label: "통역기 · 한국어 문장을 수어 단어 순서로",
        ratio: "3/4",
        fit: "contain"
      },
      {
        src: "/projects/sign-language/translate-detail.webp",
        label: "변환 결과 · 매칭된 토큰 · 사전에 없는 토큰 · 영상이 없는 단어",
        ratio: "3/4",
        fit: "contain",
        caption:
          "영상 저장소와 단어 메타데이터가 나뉘어 있어 한쪽에만 있는 단어는 재생이 비었습니다. 그래서 조회 결과에서 사전 등록 여부와 영상 유무를 구분해 표시했습니다."
      },
      {
        src: "/projects/sign-language/home.webp",
        label: "홈 · 오늘의 목표 · 최근 7일 풀이 그래프",
        ratio: "3/4",
        fit: "contain",
        caption:
          "기록이 없는 새 계정으로 들어간 화면이라 그래프가 0입니다. 「로그인 없이 시작」으로 바로 들어올 수 있습니다."
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "수어 동작 영상을 보고 뜻을 맞히며 익히는 학습 앱 (파란학기 과제 · 3D 아바타는 팀원 담당)"
      },
      {
        k: "왜",
        v: "수어 동작을 보고 뜻을 고르는 퀴즈로 기초 단어를 익히게 하려고 했습니다."
      },
      {
        k: "결과",
        v: "퀴즈 20문항과 사전 120단어로 배포. 운영 서버에서 세어 보니 영상이 있는 단어는 17개, 같은 문장 왕복 중앙값 101ms(규칙 경로)"
      },
      {
        k: "내 역할",
        v: "4인 팀 백엔드 둘 중 하나 · 텍스트→수어 변환 파이프라인·사전·영상 조회·Cloud Run/Pages 배포"
      }
    ],
    demo: {
      live: "https://toadsam.github.io/Sign-Language/home",
      repo: "https://github.com/toadsam/Sign-Language"
    },
    meta: [
      // 카드와 같은 값. 현재 운영 중 · 리뉴얼 예정(본인 확인 2026-09-08).
      // README(2026-09): 첫 커밋 2026-02-01, 마지막 05-28, main 커밋 70개.
      {
        label: "기간",
        value:
          "2026.02 ~ 2026.05 파란학기제 한 학기 · 운영 중 · 2차 ML 실험 2026.09 ~ 10"
      },
      {label: "팀", value: "4인 (FE 1 · BE 2 · 3D 아바타 1)"},
      {
        label: "역할",
        value:
          "백엔드 둘 중 하나(변환 파이프라인 · 사전 · 영상 조회 · 배포) · 2차 수어 동작 토큰화(VQ-VAE) 실험"
      },
      {
        label: "스택",
        value:
          "Spring Boot(Gradle) · Firebase Firestore · Firebase Storage · Expo · React Native"
      },
      {
        label: "배포",
        value: "GitHub Pages (앱) · Cloud Run (API, Docker 이미지)"
      }
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
      {n: "120", l: "사전 단어 (영상 17)"},
      {n: "101ms", l: "변환 왕복 중앙값"}
    ],
    features: [
      {t: "수어 퀴즈 학습", d: "수어 영상을 보고 보기 4개 중 뜻을 고름"},
      {t: "텍스트→수어 변환", d: "입력 텍스트를 수어 표현으로 보여줌"},
      {t: "오답노트·반복 학습", d: "틀린 단어를 누적해 다시 출제"},
      {t: "학습 피드백", d: "정답률·최대 연속 정답·최다 오답 단어 집계"}
    ],
    problem:
      "수어를 처음 배우는 사람이 동작을 보고 의미를 반복해 익힐 수 있도록, 영상을 보고 뜻을 맞히는 학습 기능을 만들려고 했습니다.",
    research: {
      quotes: [],
      stat: {
        n: "20",
        l: "퀴즈 문항 수 (backend/scripts/update_quiz_items.py 로 Firestore 에 올림)"
      }
    },
    hypothesis:
      "동작을 먼저 보여주고 뜻을 고르게 하면 처음 배우는 사람도 반복으로 수어를 읽는 감각을 기를 수 있습니다. 단어-영상 조회 경로는 단일 소스로 둡니다.",
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
        alt: "Flask 기반 API 구성"
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
        caption: "Storage에 없으면 Firestore URL로 폴백해 조회 경로를 하나로",
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
        title: "선택지 값이 조금만 달라도 오답 처리됐습니다",
        problem:
          "클라이언트가 보낸 선택지 ID의 대소문자·공백이 저장된 정답과 달라 맞은 답이 오답이 됐습니다.",
        solution:
          "채점 전에 양쪽 선택지 ID를 trim + 대문자로 정규화한 뒤 비교하도록 통일했습니다. 다만 최초 서비스에도 정규화가 있어, 정규화 없는 버전에서 버그를 고친 전후 이력은 확인되지 않았습니다.",
        evidence: {
          status: "코드로 확인",
          note: "최초 구현에 이미 양쪽 정규화가 있습니다.",
          url: "https://github.com/toadsam/Sign-Language/blob/1061a603aa7247e0f2976f1389d5b27763eccace/backend/src/main/java/com/wow/signlanguage/quiz/QuizService.java"
        }
      },
      {
        title: "단어에 맞는 수어 영상이 안 나오는 경우가 있었습니다",
        problem:
          "영상은 Firebase Storage에, 메타데이터는 Firestore에 따로 있어 한쪽에만 있는 단어는 재생이 비었습니다.",
        solution:
          "Storage를 단어로 먼저 조회하고 없으면 Firestore의 영상 URL로 폴백하는 단일 조회 경로를 만들었습니다.",
        evidence: {
          status: "전후 코드로 확인",
          note: "Storage·Firestore의 실제 네트워크 호출은 하지 않습니다.",
          url: "https://github.com/toadsam/Sign-Language/blob/41bff361eefd30aee9fdebfeecbb86fb16a97e49/backend/src/main/java/com/wow/signlanguage/quiz/QuizService.java"
        }
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
          {n: "120", l: "단어"}
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
    // 2026-11-13: 저장소 README(2026-09) 「측정 결과」의 값으로 바꿨다. 예전 "30+ 단어" 는 목표치였다.
    metrics: [
      {
        n: "120",
        l: "사전 단어",
        sub: "영상이 있는 단어는 17개",
        mini: {kind: "bars", before: 120, after: 17},
        source: "2026-09-07 운영 서버 POST /translate"
      },
      {
        n: "101ms",
        l: "변환 왕복 중앙값",
        sub: "같은 문장 7회 · 규칙 경로만",
        source: "같은 날 7회 · 규칙 경로만(OpenAI 키 없음)"
      },
      {
        n: "20",
        l: "퀴즈 문항",
        sub: "Firestore · attempt/correct 집계",
        source: "Firestore attempt/correct"
      },
      {
        n: "417줄",
        l: "제가 쓴 핵심 파일 줄",
        sub: "Translation 158 · Normalizer 131 · VideoCache 128",
        source: "백엔드 자바 4,228줄 중 877줄"
      },
      // 2026-11-13 밤: 아랫줄 넷은 2차(2026.09~10) ML 작업이다. 값은 전부 저장소 ml/experiments.md 의 표.
      {
        n: "5회",
        l: "수어 동작 토큰화 실험",
        sub: "VQ-VAE · 2026.10.14~16 · GCP Spot T4",
        source: "학습이 끝날 때마다 한 줄씩 자동 기록"
      },
      {
        n: "27.0mm",
        l: "손 관절 복원 오차 (test, 최저)",
        sub: "토큰 512개 · 20만 회 · 첫 실험 28.1mm",
        source: "고정 평가 화자 · 관절 평균 거리"
      },
      {
        n: "511 / 512",
        l: "쓰인 토큰 (test)",
        sub: "관문은 사용률 50% 이상",
        source: "코드 사용 열"
      },
      {
        n: "28 / 32",
        l: "ml/ 폴더 내 커밋",
        sub: "2026.09.22~10.18 · 인수인계 문서까지",
        source: "테스트는 팀원 작성"
      }
    ],
    metricsNote: "첫 커밋 2026-02-01 · 마지막 05-28 · main 커밋 70개.",
    detail: {
      intro: {
        show: "수어 동작 영상을 보고 뜻을 맞히며 익히고, 한국어 문장을 넣으면 수어 단어 순서로 바꿔 보여 주는 학습 앱입니다. 아주대 파란학기제로 넷이 만들었고, 저는 백엔드 둘 중 하나로 텍스트를 수어로 바꾸는 파이프라인과 사전, 영상 조회, Cloud Run·Pages 배포를 맡았습니다.",
        bold: "저는 백엔드 둘 중 하나로 텍스트를 수어로 바꾸는 파이프라인과 사전, 영상 조회, Cloud Run·Pages 배포를 맡았습니다.",
        more: [
          "기존 수어 서비스는 대부분 「문장을 넣으면 아바타가 보여 준다」라 이미 수어를 아는 사람을 전제합니다. 수어를 외국어처럼 읽고 익힐 언어로 놓고, 동작을 먼저 보여 준 뒤 뜻을 고르게 했습니다.",
          "정답 데이터가 없어서 세 분석기(규칙·ETRI·OpenAI)를 다 돌리고 사전 적중 수로 이긴 쪽을 고릅니다.",
          "학기가 끝난 뒤 2026년 9~10월에는 같은 저장소에서 수어 동작을 토큰 512개로 쪼개는 모델(VQ-VAE) 실험을 다섯 번 돌리고 다음 사람에게 넘기는 문서를 썼습니다. ml/ 폴더 커밋 32개 중 28개가 제 것입니다."
        ]
      },
      highlights: [
        {
          show: "분석기 셋을 고르지 않고 셋 다 돌린 뒤 사전에 가장 많이 맞은 스트림을 씁니다(TranslationService.chooseTokenStream, 동점이면 openai → etri → 규칙).",
          bold: true,
          more: "단점이 두 가지 있습니다. 요청 하나에 외부 호출이 최대 두 번 나가고(OpenAI 10초 타임아웃), 정확도보다 재생 가능한 토큰 수를 높이는 쪽으로 고릅니다. 사전에 있는 엉뚱한 단어가 사전에 없는 옳은 단어를 이길 수 있습니다."
        },
        {
          show: "영상이 안 나오는 경우를 둘로 갈라 내보냅니다. 사전에 단어가 없음(unknown)과 사전엔 있는데 영상만 없음(noVideoWords).",
          more: "화면의 「세부 결과」에 두 칸이 따로 있는 이유입니다. 하나로 뭉쳤으면 사용자는 왜 안 나오는지 알 수 없었습니다."
        },
        {
          show: "영상 조회는 찾은 URL 과 함께 못 찾은 단어도 캐시합니다(missingWords). 사전 120단어 중 영상이 있는 건 17개라 대부분의 조회가 결과 없이 끝나기 때문입니다.",
          more: "대신 캐시에 만료가 없습니다. 영상을 새로 올려도 서버를 다시 띄우기 전까지는 없는 단어로 남습니다. 단어 120개 규모라 그대로 뒀습니다."
        }
      ],
      briefs: [
        {
          problem:
            "클라이언트가 보낸 선택지 ID 의 대소문자·공백이 저장된 정답과 달라 맞은 답이 오답이 됐습니다.",
          did: "채점 전에 양쪽 선택지 ID 를 trim + 대문자로 정규화한 뒤 비교하게 통일했습니다.",
          result:
            "확인한 최초 서비스에도 정규화가 있어, 정규화 없는 버전에서 고친 전후는 확인되지 않습니다."
        },
        {
          problem:
            "영상은 Firebase Storage 에, 메타데이터는 Firestore 에 따로 있어 한쪽에만 있는 단어는 재생이 비었습니다.",
          did: "Storage 를 단어로 먼저 조회하고 없으면 Firestore 의 영상 URL 로 폴백하는 단일 조회 경로를 만들었습니다(StorageVideoCache.findUrlOrFallback).",
          result: "못 찾은 단어도 캐시하므로 만료가 없다는 대가가 있습니다."
        }
      ],
      summaries: {
        arch: "Expo(React Native) 앱 · Spring Boot API(Cloud Run) · Firestore + Storage · 세 갈래 분석기 경쟁.",
        code: "QuizService 의 선택지 정규화와 StorageVideoCache 의 Storage → Firestore 폴백.",
        proc: "2026.02 첫 커밋 → API 계약 먼저 → 변환 파이프라인·사전 → 05 발표·배포."
      },
      scenes: [
        {
          place: "result",
          kind: "line",
          title: "2차 · 동작 토큰화 실험 다섯 번의 손 복원 오차 (test)",
          unit: "mm",
          points: [
            {x: "E1 512", y: 28.1},
            {x: "E2 얼굴 포함", y: 31.7},
            {x: "E4a 1024", y: 29.9},
            {x: "E4b 20만 회", y: 27.0},
            {x: "E5 단어+문장", y: 28.2}
          ],
          note: "토큰을 1024개로 늘리면 더 나빠졌고(29.9), 학습을 20만 회로 늘린 쪽이 1.1mm 줄였습니다(27.0). E5 는 문장 데이터를 합친 다른 분할표라 앞의 넷과 바로 비교할 수 없습니다. 수치는 학습 스크립트가 끝날 때 표에 자동으로 적은 값입니다.",
          source:
            "toadsam/Sign-Language ml/experiments.md (2026-10-14 ~ 16, GCP Spot T4, 고정 평가 화자)"
        },
        {
          place: "trouble",
          kind: "steps",
          title:
            "「지하철역은 어디야?」가 수어 단어 순서가 되기까지 · POST /translate",
          steps: [
            {t: "입력", d: "지하철역은 어디야?"},
            {
              t: "세 갈래로 쪼갬",
              d: "규칙 · ETRI 형태소 · OpenAI 기본형(10초 타임아웃)",
              alt: {
                t: "운영 서버에선 규칙만",
                d: "OpenAI 키가 없으면 그 경로는 조용히 빠짐",
                tone: "warn"
              }
            },
            {t: "사전 적중 수로 승자", d: "동점이면 openai → etri → 규칙 순"},
            {
              t: "토큰",
              d: "지하철역 · 어디 (particle_removal · question_reordering · word_order)"
            },
            {
              t: "영상 조회",
              d: "Storage 접두사로 목록 조회 → 없으면 접두사 바꿔 한 번 더",
              alt: {
                t: "그래도 없으면 Firestore URL",
                d: "둘 다 없으면 noVideoWords 로",
                tone: "fail"
              }
            },
            {
              t: "응답을 둘로",
              d: "unknown(사전에 없음) / noVideoWords(사전엔 있는데 영상 없음)",
              tone: "ok"
            }
          ],
          note: "위 예문의 실제 응답: simplifiedSentence 「지하철역 어디」, unknown [], noVideoWords [지하철역, 어디]. 두 단어 다 사전엔 있지만 영상이 없어 글자로 재생됩니다."
        },
        {
          place: "result",
          kind: "bars",
          title: "사전 120단어 중 영상이 있는 단어",
          unit: "개",
          rows: [
            {label: "사전 단어", value: 120, tone: "muted"},
            {label: "영상 있음", value: 17},
            {label: "퀴즈 문항", value: 20}
          ],
          note: "그래서 통역기는 대부분의 문장에서 영상 대신 글자를 보여 줍니다. 갤러리의 통역기 캡처는 지금의 기본 상태 그대로입니다."
        }
      ]
    },
    kpt: {
      keep: ["API 계약을 먼저 정해 병렬 작업", "정답 정규화로 UX 개선"],
      problem: ["단어 수가 적음", "실사용자 테스트 부족"],
      try: ["단어 100개+ 확장", "동작 인식(카메라) 도입"]
    },
    learningLead:
      "영상은 Storage, 단어 정보는 Firestore 에 따로 있어서 조회 경로를 백엔드 한 곳으로 모았습니다.",
    learning:
      "선택지 ID 의 대소문자·공백 차이로 맞은 답이 오답이 되던 것도 채점 전 정규화로 잡았습니다."
  },

  // ════════════════════════════ DarkLab (game · horror · 팀) ═════════════════
  darklab: {
    // ── 2026-11-13 담당 교정. 저장소 toadsam/DarkLab 커밋 317개 중 본인(toadsam) 126개,
    // 기간은 첫 커밋 2024-02-24 ~ 마지막 코드 커밋 2024-09-03(README 는 "2024-1 학기 프로젝트").
    // 본인 커밋 메시지에 "(-재훈)" 서명이 있어 담당이 읽힌다: 1인칭 조작(07-29) · 응시 판정
    // (07-31 SeeDetector) · 할머니 NPC 공포 이벤트(GrandMaMove 6커밋 · BedEvent 2커밋) · 램프
    // 이벤트(PulsingLamp) · 눈 UI·공포이벤트 UI · 맵 C/D 구역 · 캐릭터 애니메이션.
    // 예전 본문의 「Cinemachine 우선순위 블렌딩」은 CameraChange.cs(hyeona 작성, SetActive 전환)와
    // 맞지 않아 뺐고, 「레이캐스트 상호작용」은 CameraRays.cs(3인 공동 수정, 화면 중앙 레이가
    // FocusObject 에 2초 머물면 실행)로 적는다. 숫자는 gh 로 센 값만.
    tagline: "FIRST-PERSON HORROR · UNITY (TEAM OF 3)",
    heroImage: {
      src: "/projects/darklab/title.webp",
      label: "타이틀 · Threshold",
      ratio: "16/9",
      caption:
        "플레이 영상(Unity Game 뷰 녹화)에서 뽑은 프레임입니다. 에디터 크롬은 잘라냈습니다."
    },
    gallery: [
      {
        src: "/projects/darklab/explore.webp",
        label: "1인칭 탐색 · 오른쪽 위 시계가 밤을 민다 (11:53 PM)",
        ratio: "16/9"
      },
      {
        src: "/projects/darklab/room-night.webp",
        label: "같은 방, 12:37 AM · 시간이 지나면 방이 달라져 있다",
        ratio: "16/9"
      },
      {
        src: "/projects/darklab/figure.webp",
        label: "01:04 AM · 침대 옆에 형체가 서 있다",
        ratio: "16/9",
        caption:
          "같은 방을 세 번 찍은 것입니다. 시계가 넘어갈수록 가구가 늘고, 마지막엔 없던 것이 서 있습니다."
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "어두운 집을 1인칭으로 탐색하며 물건을 응시해 조사하는 3D 공포 프로토타입 (Threshold)"
      },
      {
        k: "왜",
        v: "점프스케어보다 공간 탐색·응시·시간 경과에서 긴장이 나온다고 봤음"
      },
      {
        k: "결과",
        v: "응시 판정 · 할머니 NPC 공포 이벤트 · 램프·침대 이벤트 · 3개국어 로컬라이즈가 든 PC 프로토타입"
      },
      {
        k: "내 역할",
        v: "3인 팀 · 커밋 126/317 · 1인칭 조작 초기, 응시 판정, 할머니 NPC·램프·침대 공포 이벤트, UI"
      }
    ],
    demo: {repo: "https://github.com/toadsam/DarkLab"},
    meta: [
      {
        label: "기간",
        value: "2024.02 ~ 2024.09 (첫 커밋 02-24 · 마지막 코드 커밋 09-03)"
      },
      {label: "팀", value: "3인 (toadsam 126 · hyeona 108 · PAVDUP 83 커밋)"},
      {
        label: "역할",
        value:
          "1인칭 조작 초기 · 응시 상호작용 · 할머니 NPC 공포 이벤트 · 램프/침대 이벤트 · 눈·공포 UI · 맵 일부"
      },
      {
        label: "스택",
        value:
          "Unity 2022.3.2f1 · C# · URP · Input System · Cinemachine · DOTween · Localization"
      },
      {label: "플랫폼", value: "PC (프로토타입 빌드)"}
    ],
    heroScreen: {
      title: "THRESHOLD",
      kind: "title",
      titleText: "THRESHOLD",
      subText: "▶ 11:53 PM"
    },
    impact: [
      {n: "126", l: "내 커밋 (317 중)"},
      {n: "2초", l: "응시 판정 시간"},
      {n: "3개국어", l: "로컬라이즈(en/ja/ko)"}
    ],
    features: [
      {
        t: "1인칭 탐색",
        d: "Input System 기반 이동·시점, 상태 머신(Idle·Walk·Run·Jump·Fall)"
      },
      {
        t: "응시 상호작용",
        d: "화면 중앙 레이가 FocusObject 에 2초 머물면 조사 실행"
      },
      {
        t: "할머니 NPC 이벤트",
        d: "이동 → 플레이어 카메라 강제 주시 → 추격 → 페이드"
      },
      {
        t: "램프·침대 이벤트",
        d: "심장박동 소리와 붉은 맥동 · 흔들리다 넘어가는 침대"
      },
      {t: "시간 경과", d: "시계가 넘어갈수록 같은 방이 달라짐"},
      {t: "로컬라이즈", d: "Unity Localization 3개국어 (팀원 담당)"}
    ],
    problem:
      "공포 게임의 긴장감은 점프스케어보다 공간 탐색과 오브젝트 상호작용에서 나옵니다. 플레이어가 무엇을 조사할 수 있는지, 언제 무언가가 나타나는지를 손으로 짜 넣어야 했습니다.",
    research: {
      quotes: [
        {
          q: "할머니를 머지했는데 왜 안 무서울까?",
          who: "2024-08-01 커밋 메시지 · JJH_Grandma 브랜치"
        }
      ],
      stat: {n: "3", l: "지원 언어 (Unity Localization: en/ja/ko-KR)"}
    },
    hypothesis:
      "조사할 수 있는 물건을 2초 응시로 고르고, NPC 와 가구가 시간에 따라 움직이면 점프스케어 없이 탐색 자체가 긴장을 만든다고 봤습니다.",
    process: [
      {t: "맵·캐릭터", d: "2024.05 C/D 구역 · 애니메이션"},
      {t: "통합 씬", d: "06 · 포커스 상호작용 수정"},
      {t: "1인칭 조작", d: "07.29 · 상호작용 키"},
      {t: "응시·공포 이벤트", d: "07.31~08 · 할머니·램프·침대"},
      {t: "마무리", d: "08 · 눈 UI · 공포이벤트 UI"}
    ],
    architecture: [
      {
        tag: "Input",
        name: "Input System + 상태 머신",
        desc: "PlayerStateMachine · Idle/Walk/Run/Jump/Fall"
      },
      {
        tag: "Interact",
        name: "CameraRays (응시)",
        desc: "ViewportPointToRay → RaycastAll → FocusObject 2초"
      },
      {
        tag: "Event",
        name: "ScaryEvent 계층",
        desc: "Audio · Light · PostProcessing · DOTween 효과 (팀)"
      },
      {
        tag: "NPC",
        name: "GrandMaMove · BedEvent",
        desc: "이동·주시·추격·페이드 · 흔들림·회전 (담당)"
      }
    ],
    decisions: [
      {
        area: "조사 판정",
        pick: "응시 2초",
        why: "키를 누르지 않고 바라보는 것만으로 조사되면 손이 비어 더 불안함. GREEN_RAY_THRESHOLD = 2.0",
        alt: "E 키 즉시 상호작용"
      },
      {
        area: "NPC 연출",
        pick: "카메라 강제 주시",
        why: "할머니가 움직이는 동안 플레이어 카메라가 할머니를 보게 하고 이동을 막음",
        alt: "자유 시점(놓치면 연출이 안 보임)"
      },
      {
        area: "사라짐",
        pick: "머티리얼 알파 페이드",
        why: "렌더러 전부를 Transparent 큐로 바꿔 서서히 사라지게",
        alt: "SetActive(false) (뚝 끊김)"
      }
    ],
    coreCode: [
      {
        filename: "CameraRays.cs",
        caption:
          "화면 중앙에서 쏜 레이가 FocusObject 에 2초 머물면 조사 실행 (3인 공동 수정)",
        highlightLines: [3, 7, 8],
        lines: [
          "ray = mainCamera.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0));",
          "ratHits = Physics.RaycastAll(ray, MAX_RAY_DISTANCE);",
          'if (hit.collider.CompareTag("FocusObject") && !data.isComplete)',
          "{",
          "    greenRayDuration += Time.deltaTime;",
          "    if (greenRayDuration >= GREEN_RAY_THRESHOLD) // 2.0f",
          "    {",
          "        ExecuteFunction(ratHits[0].point, hit.collider.gameObject);",
          "        greenRayDuration = 0.0f;",
          "    }",
          "}"
        ]
      },
      {
        filename: "GrandMaMove.cs",
        caption:
          "할머니 이벤트: 앞으로 이동하는 동안 플레이어 카메라를 할머니 쪽으로 Slerp 하고, 렌더러는 미리 Transparent 큐로 바꿔 둬 페이드가 되게 (담당)",
        highlightLines: [2, 9, 12],
        lines: [
          "foreach (Renderer renderer in childRenderers) {",
          '    material.SetOverrideTag("RenderType", "Transparent");',
          "    material.renderQueue = 3000;            // 페이드용 투명 큐",
          "}",
          "public void StartGrandmaEvent() {",
          "    isGrandEvent = true;",
          "    targetPosition = initialPosition + transform.forward * moveDistance;",
          "    StartCoroutine(GrandmaEventSequence());",
          "}",
          "// GrandmaEventSequence: MoveTowards(targetPosition) 하면서",
          "Quaternion lookRotation = Quaternion.LookRotation(transform.position - playerCamera.transform.position);",
          "playerCamera.transform.rotation = Quaternion.Slerp(playerCamera.transform.rotation, lookRotation, Time.deltaTime * rotationSpeed);"
        ]
      }
    ],
    work: [
      {
        g: "조작·판정",
        items: [
          "1인칭 조작 초기(07-29)",
          "응시 판정 SeeDetector(07-31) · CameraRays 수정"
        ]
      },
      {
        g: "공포 이벤트",
        items: [
          "할머니 이동·주시·추격·페이드(GrandMaMove)",
          "침대 흔들림·회전(BedEvent) · 램프 맥동(PulsingLamp)"
        ]
      },
      {
        g: "UI·맵",
        items: ["눈 UI · 공포이벤트 UI", "맵 C/D 구역 · 캐릭터 애니메이션"]
      }
    ],
    challenges: [
      {
        title:
          "무엇을 조사할 수 있는지 안 보여서, 바라보기만 해도 조사되게 했습니다",
        problem:
          "플레이어가 조사 가능한 오브젝트를 인지하지 못해 답답해했습니다. 키를 눌러야 반응하는 구조면 뭘 눌러야 하는지부터 알아야 합니다.",
        solution:
          "화면 중앙에서 레이를 쏴 FocusObject 태그에 닿으면 초록 선으로 표시하고, 2초(GREEN_RAY_THRESHOLD) 머물면 조사를 실행하게 했습니다(CameraRays.cs). 07-31 에 응시·관찰 판정을 SeeDetector 로 먼저 넣었고, 뒤에 CameraRays 로 정리됐습니다. 조사가 끝난 오브젝트(isComplete)는 다시 반응하지 않습니다.",
        evidence: {
          status: "구현 확인 · 3인 공동 수정 파일",
          note: "07-31 커밋 「응시, 관찰, 상호작용 (-재훈)」이 SeeDetector.cs(+134줄)를 추가했고, HEAD 에서는 주석 처리돼 있습니다.",
          url: "https://github.com/toadsam/DarkLab/blob/6cb748fb98ed2eab610e22245a8c9a4b5eb22085/Threshold/Assets/Scripts/Characters/Player/Interaction/CameraRays.cs"
        }
      },
      {
        title:
          "할머니를 머지했는데 왜 안 무서울까. 연출을 세 단계로 다시 짰습니다",
        problem:
          "할머니 NPC 를 씬에 넣었더니(08-01) 그냥 서 있는 모델이었습니다. 커밋 메시지가 「할머니를 머지했는데 왜 안 무서울까?」입니다.",
        solution:
          "GrandMaMove 는 네 단계입니다. 할머니가 이동하면 플레이어 카메라가 강제로 그쪽을 보고, 이어서 쫓아오다가(chaseSpeed) 머티리얼 알파를 내려 사라집니다. 이동하는 동안 플레이어 이동을 막고(08-28 「플레이어가 움직이는 동안 움직임 막는 거 수정」), 사라질 때는 자식 렌더러 전부를 Transparent 큐로 바꿔 서서히 지웁니다. 소리는 이동음과 추격음을 나눠 soundDelay 뒤에 틉니다.",
        evidence: {
          status: "구현 확인 · 본인 커밋 6건",
          note: "GrandMaMove.cs 커밋 6건 전부 toadsam. 08-01 「할머니 이동하는 공포 이벤트 추가」 → 08-11 「할머니 사라지는 것 수정」 → 08-28 이동 막기 수정.",
          url: "https://github.com/toadsam/DarkLab/blob/main/Threshold/Assets/Scripts/Characters/GrandMa/GrandMaMove.cs"
        }
      },
      {
        title: "침대와 램프에 시간이 지나면 달라지는 연출을 넣었습니다",
        problem:
          "같은 방이 밤새 똑같으면 시계가 넘어가도 긴장이 쌓이지 않았습니다.",
        solution:
          "BedEvent 는 자식 오브젝트를 주기적으로 흔들다가 조건이 켜지면 부모를 Z축 90도까지 회전시키고 지연 뒤 특정 오브젝트를 켭니다. PulsingLamp 는 조명 세기를 min~max 로 맥동시키며 색을 붉게 바꾸고 심장박동 소리를 틉니다. 갤러리의 세 장이 그 결과입니다.",
        evidence: {
          status: "구현 확인 · 본인 커밋",
          note: "침대 이벤트는 8월 3일, 램프 이벤트는 8월 13일에 넣었습니다. 침대 이벤트 커밋 두 건은 제 것이고 램프는 세 건 중 두 건입니다.",
          url: "https://github.com/toadsam/DarkLab/blob/main/Threshold/Assets/Scripts/Characters/GrandMa/BedEvent.cs"
        }
      }
    ],
    tech: [
      "Unity 2022.3",
      "C#",
      "URP",
      "Input System",
      "Cinemachine",
      "DOTween",
      "Localization"
    ],
    resultScreens: [
      {
        title: "threshold/clock",
        kind: "stats",
        stats: [
          {n: "11:53", l: "탐색"},
          {n: "12:37", l: "방이 달라짐"},
          {n: "01:04", l: "형체"}
        ]
      }
    ],
    metrics: [
      {
        n: "126",
        l: "내 커밋 (317 중)",
        sub: "2024.02 ~ 2024.09",
        mini: {kind: "bars", before: 317, after: 126},
        source: "메시지에 (-재훈) 서명"
      },
      {
        n: "2초",
        l: "응시 판정",
        sub: "이만큼 바라보면 조사됩니다"
      },
      {
        n: "3",
        l: "공포 이벤트 스크립트",
        sub: "GrandMaMove · BedEvent · PulsingLamp",
        source: "커밋 작성자 · GrandMaMove 6/6 · BedEvent 2/2 · PulsingLamp 2/3"
      },
      {
        n: "3개국어",
        l: "로컬라이즈",
        sub: "en · ja · ko-KR (팀원 담당)",
        source: "Unity Localization · 로컬라이즈는 팀원(PAVDUP) 작업"
      }
    ],
    metricsNote: "로컬라이즈와 공포 효과 계층은 팀원 작업입니다.",
    detail: {
      intro: {
        show: "어두운 집을 1인칭으로 탐색하며 물건을 바라봐 조사하는 3인 팀 공포 프로토타입입니다. 저는 커밋 126개로 1인칭 조작 초기, 2초 응시 판정, 그리고 할머니 NPC·램프·침대의 공포 이벤트를 맡았습니다.",
        bold: "저는 커밋 126개로 1인칭 조작 초기, 2초 응시 판정, 그리고 할머니 NPC·램프·침대의 공포 이벤트를 맡았습니다.",
        more: [
          "시계가 넘어갈수록 같은 방이 달라집니다. 11:53 PM 탐색 → 12:37 AM 가구가 늘어남 → 01:04 AM 침대 옆에 형체. 갤러리와 아래 장면이 그 세 프레임입니다.",
          "카메라 전환(CameraChange.cs)은 팀원이 작성했습니다.",
          "있는 사실은 코드와 커밋뿐이라 그것만 적었습니다."
        ]
      },
      highlights: [
        {
          show: "바라보기만 해도 조사되는 응시 판정. 화면 중앙 레이가 FocusObject 에 2초 머물면 실행(CameraRays, GREEN_RAY_THRESHOLD 2.0f). 07-31 SeeDetector 로 먼저 넣었습니다.",
          bold: true,
          more: "조사가 끝난 오브젝트는 isComplete 로 다시 반응하지 않습니다."
        },
        {
          show: "할머니 NPC 공포 이벤트를 이동, 카메라 강제 주시, 추격, 페이드 네 단계로 짰습니다(GrandMaMove, 본인 커밋 6건).",
          more: "이동하는 동안 플레이어 이동을 막고, 사라질 때는 자식 렌더러 전부를 Transparent 큐로 바꿔 서서히 지웁니다. 08-01 「할머니를 머지했는데 왜 안 무서울까?」가 출발점이었습니다."
        },
        {
          show: "침대(흔들림 → Z축 90도 회전 → 지연 뒤 오브젝트)와 램프(세기 맥동 · 붉은 색 · 심장박동)로 시간 경과를 만들었습니다.",
          more: "BedEvent 2/2 · PulsingLamp 2/3 커밋이 본인. 갤러리 세 장(11:53 PM · 12:37 AM · 01:04 AM)이 그 결과입니다."
        }
      ],
      briefs: [
        {
          problem: "무엇을 조사할 수 있는지 안 보여 플레이어가 답답해했습니다.",
          did: "화면 중앙 레이가 FocusObject 에 닿으면 표시하고 2초 머물면 조사를 실행하게 했습니다(CameraRays · 07-31 SeeDetector).",
          result: "키 없이 바라보는 것만으로 조사됩니다."
        },
        {
          problem:
            "할머니 NPC 를 넣었더니 그냥 서 있는 모델이었습니다(「머지했는데 왜 안 무서울까?」).",
          did: "네 단계로 다시 짜고, 이동 중 플레이어 조작을 막았습니다.",
          result:
            "GrandMaMove.cs 커밋 6건 전부 본인. 08-01 → 08-11 → 08-28 로 세 번 고쳤습니다."
        },
        {
          problem:
            "같은 방이 밤새 똑같으면 시계가 넘어가도 긴장이 쌓이지 않았습니다.",
          did: "침대는 흔들리다 넘어가고 특정 오브젝트가 켜지며, 램프는 붉게 맥동하며 심장박동 소리를 내게 했습니다.",
          result: "같은 방을 세 시각에 찍은 프레임이 그 결과입니다."
        }
      ],
      summaries: {
        arch: "Input System 상태 머신 · CameraRays 응시 판정 · ScaryEvent 계층(팀) · GrandMaMove·BedEvent(담당).",
        code: "CameraRays 의 2초 응시 판정과 GrandMaMove 의 주시·페이드.",
        proc: "2024.05 맵·캐릭터 → 06 통합 씬 → 07.29 1인칭 조작 → 07.31~08 응시·공포 이벤트 → 08 UI."
      },
      scenes: [
        {
          place: "result",
          kind: "frames",
          title: "같은 방, 세 시각 · 손잡이를 끌어 보세요",
          ratio: "16/9",
          frames: [
            {
              src: "/projects/darklab/explore.webp",
              label: "탐색 시작",
              at: "11:53 PM"
            },
            {
              src: "/projects/darklab/room-night.webp",
              label: "가구가 늘어나 있다",
              at: "12:37 AM"
            },
            {
              src: "/projects/darklab/figure.webp",
              label: "침대 옆에 형체",
              at: "01:04 AM"
            }
          ],
          note: "플레이 영상에서 뽑은 프레임 세 장입니다. 침대·램프 이벤트와 할머니 NPC 가 이 사이에서 움직입니다.",
          source:
            "Unity Game 뷰 녹화 프레임(public/projects/darklab) · 시각은 화면 오른쪽 위 시계"
        },
        {
          place: "trouble",
          kind: "steps",
          title: "할머니 이벤트 네 단계 · GrandMaMove.cs",
          steps: [
            {
              t: "등장·이동",
              d: "initialPosition 에서 forward 로 moveDistance 만큼 MoveTowards"
            },
            {
              t: "카메라 강제 주시",
              d: "플레이어 카메라가 할머니를 바라보게, 이동은 막음",
              tone: "warn"
            },
            {
              t: "추격",
              d: "chaseSpeed 로 플레이어 쪽으로 · 추격음으로 교체",
              tone: "fail"
            },
            {
              t: "페이드",
              d: "fadeDelay 뒤 fadeDuration 동안 알파 0 으로",
              alt: {t: "SetActive(false)", d: "뚝 끊겨서 안 씀", tone: "muted"}
            }
          ],
          note: "렌더러 전부를 Transparent 큐(renderQueue 3000)로 바꿔 두기 때문에 페이드가 됩니다.",
          source: "본인 커밋 6건"
        }
      ]
    },
    kpt: {
      keep: [
        "응시 2초로 조사 판정",
        "NPC 연출을 이동·주시·추격·페이드로 나눔",
        "이벤트마다 소리를 분리"
      ],
      problem: [],
      try: ["퍼즐·엔딩 시퀀스", "세이브 시스템", "테스터 기록 남기기"]
    },
    learningLead:
      "조사 가능한 물건이 안 보이는 문제는 키 입력 대신 2초 응시로 풀었고, NPC 가 안 무서운 문제는 연출을 네 단계로 쪼개서 풀었습니다.",
    learning: "팀원이 짠 카메라 전환을 제 것처럼 적었던 문장은 뺐습니다."
  },

  "ajou-adventure": {
    tagline: "2D CASUAL RUNNER · PHASER 3 (SOLO)",
    heroImage: {
      src: "/projects/ajou-adventure.webp",
      label: "인게임 플레이",
      ratio: "16/9"
    },
    // 도형 프로토타입 시절 캡처가 없어 이미지 자리를 뺐다(2026-09-07).
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
      "쉬는 시간에 잠깐 즐길, 대학생이 공감할 가벼운 웹 게임이 의외로 없었다. 캠퍼스 감성을 살리되(공식 로고 없이 도형 기반) 조작이 끊기지 않는 러너가 필요했다.",
    research: {
      quotes: [],
      stat: {n: "3", l: "점수 구간 배경(낮 0 / 노을 1500 / 밤 3500)"}
    },
    hypothesis:
      "게임을 Scene/Object/System 레이어로 나누고 발판·아이템을 풀링하는 것이 혼자 유지보수하면서 끊김을 없애는 길이었다.",
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
        caption: "2단 점프를 점프 횟수로 제어",
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
        },
        evidence: {
          status: "코드로 확인",
          note: "충돌 크기 setSize(38,58)·setOffset(85,36)는 Player.ts 의 처음 커밋부터 이 값입니다.",
          url: "https://github.com/toadsam/Ajou_Mini_Game/blob/364e72e4ead0fa2950d6ddcbeafc1b626fcb8a38/src/game/objects/Player.ts"
        }
      },
      {
        title: "손으로 반복 테스트하기 어려웠다",
        problem:
          "점프·발판 간격 튜닝을 매번 손으로 플레이해 확인하기 번거로웠다.",
        solution:
          "저장소에 자동 플레이 결과로 기록된 스크린샷과 JSON 로그가 남아 있습니다. 자동화 구현 방식은 포트폴리오 설명 기준으로 남깁니다.",
        evidence: {
          status: "산출물로 확인",
          note: "playtest-output-gap-check/gap-log.json 과 캡처 산출물로 확인했습니다.",
          url: "https://github.com/toadsam/Ajou_Mini_Game/blob/3d62498d7351a04ac4dc469e73fdd03b3495d68e/playtest-output-gap-check/gap-log.json"
        }
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
      problem: ["와이어 액션은 다음 작업으로 남김"],
      try: ["리더보드·소셜 공유", "와이어 액션 완성·스테이지 다양화"]
    },
    learningLead:
      "발판·아이템을 매 프레임 만들고 부수면 GC 로 끊겨서, 재사용(풀링)으로 바꿨다.",
    learning:
      "점프·발판 간격은 자동 플레이테스트가 뽑은 스크린샷과 JSON 로그로 검증했다."
  },

  // ════════════════════════════ TSEROF (game · platformer · 팀 · 비공개) ═════
  tserof: {
    tagline: "3D PLATFORMER · UNITY (TEAM)",
    heroImage: {
      src: "/projects/tserof.webp",
      label: "TSEROF 타이틀",
      // 파일이 630×500(1.26:1)이다. 16/9 로 적으면 위아래가 잘린다(2026-11-13 실측).
      ratio: "630/500",
      caption:
        "포트폴리오 원본의 소개용 키 아트입니다(2025-12). 게임 화면은 아래 갤러리에 있습니다."
    },
    // 그레이박스 시절 캡처는 남아 있지 않아 「문제」 그림 자리는 비웠다.
    // 대신 내가 맡은 기믹의 전후 비교를 갤러리 끝에 넣는다 — problemShot 은
    // 원페이저에서 렌더되지 않아 이력서로 들어온 사람은 못 본다.
    gallery: [
      // 비율은 파일 실측(2026-11-13): 605×388 · 530×301 · 870×497. 16/9 로 적혀 있던 것을 고쳤다.
      {
        src: "/projects/op/tserof-difficulty.webp",
        label: "난이도 선택",
        ratio: "605/388"
      },
      {
        src: "/projects/op/tserof-stage.webp",
        label: "스테이지",
        ratio: "530/301"
      },
      {
        src: "/projects/op/tserof-feedback.webp",
        label: "유저 피드백 반영",
        ratio: "870/497"
      },
      {
        src: "/projects/tserof/gimmick-icicle.webp",
        label: "낙하물(고드름) 기믹 · 매번 만들고 부수던 것을 위치 재사용으로",
        ratio: "834/776",
        fit: "contain",
        caption:
          "떨어질 때마다 Instantiate/Destroy 하던 코드를, 대기 시간을 캐싱하고 SetPositionAndRotation 으로 제자리에 돌려놓는 방식으로 바꿨습니다. 포트폴리오 원본 자료(2025-12)."
      }
    ],
    // 2026-09-06 담당 교정. 예전 본문은 플레이어 컨트롤러(발 4방향 접지 레이)·저장(XOR)·
    // 풀링을 내 일처럼 적었는데, 저장소 README 기여자 표와 커밋 이력상 플레이어는 박지원,
    // 저장·게임 매니저·씬 전환은 김어진, 스테이지 선택·옵션·사운드는 김형중 작업이다.
    // 내 몫(커밋 216/1,204건, 2023.10.23~12.13)은 스테이지 2 전체 + 기믹(README
    // 「Gimmick(정재훈)」 UML) + 3×3 퍼즐. 아래 코드·결정·트러블은 전부 내 브랜치
    // (JJH_Stage2 · JJH_CodeClean · JJH_PJW_EndingScene)의 스크립트와 커밋에서 가져왔다.
    tldr: [
      {
        k: "무엇을",
        v: "잃어버린 아이템을 찾아 스테이지를 클리어하는 3D 플랫포머"
      },
      {
        k: "왜",
        v: "스테이지 2의 구간 전환·장애물·퍼즐을 한 곳에서 관리하려고 했습니다."
      },
      {
        k: "결과",
        v: "5인 팀의 부팀장으로 4개월간 개발에 참여하고 Steam에 출시했습니다."
      },
      {
        k: "내 역할",
        v: "부팀장 · 스테이지 2 전체 · 장애물/기믹 · 3×3 패턴 퍼즐 · 기획"
      }
    ],
    // 저장소(KimEoJin24/TSEROF)는 팀장이 비공개로 돌려 404 다 — 링크를 걸지 않는다(2026-09-08).
    demo: {},
    meta: [
      {label: "기간", value: "2023.10 – 2024.02"},
      {label: "팀", value: "5인 팀 프로젝트"},
      {
        label: "역할",
        value: "스테이지 2 · 장애물/기믹 · 3×3 퍼즐 · 기획 · 부팀장"
      },
      {label: "스택", value: "Unity 2022.3 · C# · Cinemachine"},
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
      {n: "4개월", l: "기획 → 출시"}
    ],
    // 기간은 2023.10–2024.02 — 첫 커밋 2023.10.23, Steam 출시 2024.02.10 (2026-09-06 교정.
    // 예전 "2023.11–" 은 커밋 이력을 늦게 잡은 값, 그 전의 "2023.07–11 · 5개월" 은 근거가 없었다).
    features: [
      {t: "스테이지 2 통합 씬", d: "구간별 카메라·리스폰·클리어 판정"},
      {t: "3×3 패턴 퍼즐", d: "정답 패턴 5종을 주기적으로 교체"},
      {t: "속성 큐브", d: "마그마·용암·물·얼음·얼음벽"},
      {t: "장애물 기믹", d: "대포·낙하물·회전·가시·레버·토네이도"}
    ],
    problem:
      "스테이지 2 는 처음에 2-1·2-2·2-3 세 씬이었습니다. 구간을 넘길 때마다 씬을 로드했고 카메라·리스폰·클리어 판정이 구간마다 흩어져 있어, 장애물과 퍼즐을 늘릴수록 카메라·리스폰·클리어 판정을 통합해 관리할 필요가 있었습니다.",
    research: {
      quotes: [
        {
          q: "스테이지 2 통합 씬 생성 (-재훈)",
          who: "2023-11-27 커밋 메시지 · JJH_Stage2 브랜치"
        },
        {
          q: "Player 의 Jump 범위에 문제가 생기지 않게 임시적으로 오브젝트의 위치를 수정함.",
          who: "유저 테스트 조치 기록 · 내가 놓은 장애물에 대한 피드백"
        }
      ]
    },
    hypothesis:
      "“세 씬을 한 씬으로 합쳐 카메라·리스폰·클리어를 매니저 하나에 모으고, 큐브·퍼즐·장애물을 같은 규약으로 묶으면 기믹을 늘려도 구간 전환이 끊기지 않고 팀원도 같은 방식으로 붙일 수 있다.”",
    process: [
      {t: "기획", d: "스테이지 2 구성"},
      {t: "씬 통합", d: "2-1·2-2·2-3"},
      {t: "기믹", d: "큐브·장애물"},
      {t: "퍼즐", d: "3×3 패턴"},
      {t: "정리", d: "인터페이스"}
    ],
    architecture: [
      {
        tag: "Stage",
        name: "Stage2Manager",
        desc: "구간 on/off · Cinemachine 카메라 · 리스폰 · 클리어"
      },
      {tag: "Puzzle", name: "PuzzleManager", desc: "정답 5종 교체 · 순서 비교"},
      {
        tag: "Gimmick",
        name: "CubeType · Obstacles",
        desc: "enum 분기 · 장애물 반응"
      },
      {
        tag: "Contract",
        name: "IMovable 외 4종",
        desc: "기믹 공통 인터페이스 (12월 정리)"
      }
    ],
    decisions: [
      {
        area: "스테이지 2 구성",
        pick: "한 씬 + 구간 그룹 on/off",
        why: "구간 전환에 씬 로드가 없고 카메라·리스폰만 바뀜",
        alt: "씬 3개(전환마다 로드 · 상태 유지 어려움)"
      },
      {
        area: "퍼즐 판정",
        pick: "int[9] 정답 배열 순서 비교",
        why: "정답 패턴을 배열로 추가하고 SequenceEqual로 비교했습니다.",
        alt: "칸별 개별 판정"
      },
      {
        area: "큐브 속성",
        pick: "enum 하나로 switch 분기",
        why: "큐브 종류마다 스크립트를 늘리지 않음",
        alt: "큐브 종류별 스크립트"
      },
      {
        area: "무한 코루틴",
        pick: "WaitForSeconds 캐싱",
        why: "루프마다 new 하지 않아 할당 감소",
        alt: "매 루프 new WaitForSeconds"
      }
    ],
    coreCode: [
      {
        filename: "Stage2Manager.cs",
        caption:
          "구간 하나가 켜질 때 리스폰 지점과 Cinemachine 카메라가 같이 바뀝니다. 씬 로드 없이 2-1 → 2-2",
        highlightLines: [3, 4, 6],
        lines: [
          "public void Stage2Start()",
          "{",
          "    _stage2.SetActive(true);",
          "    curRespawnPosition = stage2RespawnPosition.transform.position;",
          "    _stage1Camera.enabled = false;",
          "    _stage2Camera.enabled = true;",
          "    _stage3Camera.enabled = false;",
          "    isStage1 = false;",
          "    isStage2 = true;",
          "    isStage3 = false;",
          "}"
        ]
      },
      {
        filename: "PatternSign.cs · PuzzleManager.cs",
        caption:
          "정답 패턴 5종을 25초마다 무작위로 바꾸고, 플레이어가 놓은 배열을 정답과 순서대로 비교",
        highlightLines: [3, 7, 11],
        lines: [
          "public IEnumerator PatternChange()",
          "{",
          "    var deleyTime = new WaitForSeconds(25f); // 무한 코루틴 — 할당을 줄이려 캐싱",
          "    while (true)",
          "    {",
          "        yield return deleyTime;",
          "        _random = Random.Range(0, 5);",
          "        _puzzleObjects.SettingObject(_patterns[_random]);",
          "    }",
          "}",
          "bool isRight = puzzleObjects.QuestionPattern().SequenceEqual(patternSign.AnswerPattern());"
        ]
      },
      {
        filename: "CubeType.cs",
        caption:
          "큐브 하나에 enum 하나. 마그마는 튕기고, 용암·물은 리스폰, 얼음은 코루틴으로 떨어졌다 되돌아옵니다",
        highlightLines: [1, 5, 8, 11],
        lines: [
          "public enum Cube { Magma, Luva, Ice, Water, IceWall }",
          "",
          "switch (_cube)",
          "{",
          "    case Cube.Magma:",
          "        forceReceiver.StartGimmick(Gimmicks.AddVelocity, rb, 0, _magmaJumpPower, 0, 30f);",
          "        break;",
          "    case Cube.Luva: case Cube.Water:",
          "        SwichPos();",
          "        break;",
          "    case Cube.Ice:",
          "        StartCoroutine(IceMoveStart());",
          "        break;",
          "    case Cube.IceWall:",
          "        StartCoroutine(IceWallMove());",
          "        break;",
          "}"
        ]
      }
    ],
    work: [
      {
        g: "스테이지 2",
        items: [
          "2-1·2-2·2-3 씬을 한 씬으로 통합",
          "Stage2Manager · 구간별 Cinemachine 카메라 전환 · 리스폰 지점 · 클리어 판정",
          "스테이지 2 카메라 회전 (CamPos)"
        ]
      },
      {
        g: "퍼즐",
        items: [
          "3×3 패턴 퍼즐 · PuzzleManager · PatternSign · PuzzleButton · PuzzleObjects 등 7개 스크립트"
        ]
      },
      {
        g: "기믹",
        items: [
          "속성 큐브 CubeType (마그마·용암·물·얼음·얼음벽)",
          "대포 · 낙하물 · 회전 장애물 · 측면 가시 · 투명 가시(F키)",
          "레버 · 나뭇잎 탑승 · 토네이도 · 히든맵"
        ]
      },
      {
        g: "정리",
        items: [
          "IMovable·IRotatable·IDisturbing·IPlayerRespwanable·IInteractable 도입 (박지원과, 12월)",
          "엔딩 씬 일부"
        ]
      }
    ],
    // 2026-09-06 교정. 예전 네 건(풀링·NonAlloc·콜라이더·XOR)은 포트폴리오 PDF 「트러블슈팅」을
    // 옮긴 것이었는데, 저장소상 XOR 저장(FileDataHandler)은 김어진, 점프 이펙트 풀링은 이홍준
    // 작업이라 내 몫으로 적을 수 없다. 아래는 내 브랜치 커밋 메시지와 코드에서 확인되는 것만.
    // 3D 전시실(tserof/sections P04·P05·P07·P08)은 아직 예전 네 건을 그대로 보여 준다.
    challenges: [
      {
        title: "세 씬으로 나뉜 스테이지 2를 하나로 통합했습니다",
        problem:
          "2-1·2-2·2-3 이 별도 씬이라 구간마다 카메라·리스폰·클리어 판정을 따로 들고 있었고, 씬을 넘기는 순간 상태가 끊겼습니다.",
        solution:
          "세 씬을 Stage2Scene 하나로 합치고(11.27 통합 씬 생성 → 11.28 씬 합치기 → 11.29 씬 넘어가는 문제 해결), Stage2Manager 가 구간 오브젝트 그룹 on/off · Cinemachine 카메라 enable · 현재 리스폰 지점을 한 곳에서 바꾸게 했습니다.",
        evidence: {
          status: "코드로 확인",
          note: "씬 통합 전체는 여러 커밋에 걸쳤고, 이 파일 하나로 씬 자산 병합 전체를 재현하지 않습니다. 저장소(KimEoJin24/TSEROF)는 팀장 소유 비공개라 링크를 걸지 않습니다."
        }
      },
      {
        title: "반복 플레이에서 정답 패턴이 고정되는 문제를 개선했습니다",
        problem:
          "3×3 발판에 얼음·물을 맞추는 퍼즐인데 정답이 고정이면 반복 플레이에서 퍼즐 구실을 못 했습니다.",
        solution:
          "정답 패턴 5종을 int[9] 배열로 두고 코루틴이 25초마다 무작위로 바꾸며 표지판을 갱신했습니다. SequenceEqual로 플레이어 배열과 정답 배열을 비교했습니다.",
        evidence: {
          status: "전후 코드로 확인",
          note: "판정은 별도 PuzzleManager의 SequenceEqual이며, 퍼즐의 물리 반응은 이 모형에 포함하지 않습니다."
        }
      },
      {
        title: "큐브 종류별 반응을 enum과 switch로 관리했습니다",
        problem:
          "마그마·용암·물·얼음·얼음벽이 각각 다른 반응(튕김·리스폰·낙하 후 복귀)을 해야 했습니다.",
        solution:
          "CubeType 하나에 enum 으로 속성을 두고 충돌 시 switch 로 분기했습니다. 얼음은 코루틴으로 잠시 뒤 떨어졌다가 kinematic 을 되돌려 원위치하고, 마그마는 점프력을 주기적으로 바꿨습니다."
      },
      {
        title:
          "기믹이 늘수록 이동·회전·리스폰 처리 방식이 스크립트마다 달랐습니다",
        problem:
          "장애물마다 움직임·회전·플레이어 리스폰을 제각각 구현해 놓아 팀원이 붙이기 어려웠습니다.",
        solution:
          "코드 정리 과정에서 IMovable 등 공통 인터페이스를 적용했습니다. 리스폰 인터페이스의 해당 시점 실제 이름은 IPlayerRespwanable이며 빈 인터페이스입니다. 모든 인터페이스의 기능이 이 한 커밋에서 완성됐다고 설명하지 않습니다.",
        evidence: {
          status: "전후 코드로 확인",
          note: "원문 표기와 달리 저장소에 IPlayerRespwanable이라는 철자도 있으며, 그 시점에는 빈 인터페이스였습니다."
        }
      }
    ],
    tech: ["Unity 2022.3", "C#", "Cinemachine"],
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
      {
        n: "Steam",
        l: "스토어 출시",
        sub: "app/2743860 · 2024.02.10",
        source: "Steam 스토어 app/2743860"
      },
      {
        n: "216",
        l: "내 커밋 (1,204 중)",
        sub: "2023.10.23 ~ 12.13 · 부팀장",
        mini: {kind: "bars", before: 1204, after: 216},
        source: "지금은 비공개"
      },
      {
        n: "5종",
        l: "퍼즐 정답 패턴 · 25초 교체",
        sub: "int[9] 배열 5개 · SequenceEqual 판정",
        source: "장면의 패턴 값은 예시"
      },
      {
        n: "3 → 1",
        l: "스테이지 2 씬 통합",
        sub: "2-1·2-2·2-3 → Stage2Scene · 11.27~29",
        mini: {kind: "bars", before: 3, after: 1},
        source: "커밋 11-27~29"
      }
    ],
    // ── 상세 페이지 손글씨 칸 (2026-11-13). 새 사실 없음 — 2026-09-06 담당 교정 때 확인한 것만.
    detail: {
      intro: {
        show: "잃어버린 아이템을 찾아 스테이지를 깨는 3D 플랫포머로, 5인 팀이 4개월 만에 Steam 에 출시했습니다. 저는 부팀장으로 스테이지 2 전체와 장애물·속성 큐브 기믹, 3×3 패턴 퍼즐을 맡았고 커밋 216개를 제가 썼습니다.",
        bold: "저는 부팀장으로 스테이지 2 전체와 장애물·속성 큐브 기믹, 3×3 패턴 퍼즐을 맡았고 커밋 216개를 제가 썼습니다.",
        more: [
          "세 씬으로 나뉘어 있던 스테이지 2 를 한 씬으로 합치고 카메라·리스폰·클리어 판정을 Stage2Manager 한 곳에 모았습니다(11.27~29).",
          "출시는 Steam 스토어에서 확인할 수 있습니다."
        ]
      },
      highlights: [
        {
          show: "스테이지 2 의 세 씬(2-1·2-2·2-3)을 Stage2Scene 하나로 합치고, 구간 오브젝트 on/off · Cinemachine 카메라 enable · 리스폰 지점을 Stage2Manager 가 한 곳에서 바꾸게 했습니다.",
          bold: true,
          more: "11.27 통합 씬 생성 → 11.28 씬 합치기 → 11.29 씬 넘어가는 문제 해결. 씬을 넘기는 순간 상태가 끊기던 문제가 사라졌습니다."
        },
        {
          show: "3×3 패턴 퍼즐의 정답을 int[9] 배열 5종으로 두고 코루틴이 25초마다 무작위로 바꾸며 표지판을 갱신, SequenceEqual 로 플레이어 배열과 비교하게 했습니다.",
          more: "정답이 고정이면 반복 플레이에서 퍼즐 구실을 못 했습니다. 아래 장면에서 직접 눌러 볼 수 있습니다(패턴 값은 예시)."
        },
        {
          show: "마그마·용암·물·얼음·얼음벽 큐브를 enum 하나와 switch 로 분기하고, 12월 코드 정리에서 IMovable 등 공통 인터페이스를 기믹에 적용했습니다.",
          more: "리스폰 인터페이스는 그 시점 이름이 IPlayerRespwanable 이고 빈 인터페이스였습니다."
        }
      ],
      briefs: [
        {
          problem:
            "2-1·2-2·2-3 이 별도 씬이라 구간마다 카메라·리스폰·클리어 판정을 따로 들고 있었고, 씬을 넘기는 순간 상태가 끊겼습니다.",
          did: "세 씬을 Stage2Scene 하나로 합치고 Stage2Manager 가 구간 그룹 on/off · 카메라 enable · 리스폰 지점을 한 곳에서 바꾸게 했습니다.",
          result:
            "11.27~29 세 커밋. 씬 자산 병합 전체는 여러 커밋에 걸쳐 있어 파일 하나로 재현되진 않습니다."
        },
        {
          problem:
            "3×3 발판 퍼즐의 정답이 고정이라 반복 플레이에서 퍼즐 구실을 못 했습니다.",
          did: "정답 패턴 5종을 int[9] 로 두고 코루틴이 25초마다 무작위로 바꾸며 표지판을 갱신, SequenceEqual 로 비교했습니다.",
          result: "퍼즐의 물리 반응은 별도입니다."
        },
        {
          problem:
            "마그마·용암·물·얼음·얼음벽이 각각 다른 반응(튕김·리스폰·낙하 후 복귀)을 해야 했습니다.",
          did: "CubeType enum 하나로 속성을 두고 충돌 시 switch 로 분기, 얼음은 코루틴으로 떨어졌다 kinematic 을 되돌려 원위치하게 했습니다.",
          result: "처음에는 네 종류였고 얼음벽은 뒤에 추가했습니다."
        },
        {
          problem:
            "장애물마다 움직임·회전·리스폰을 제각각 구현해 팀원이 붙이기 어려웠습니다.",
          did: "12월 코드 정리에서 IMovable 등 공통 인터페이스를 적용했습니다.",
          result: "움직이는 발판부터 같은 인터페이스로 붙였습니다."
        }
      ],
      moreLabel: "큐브 enum 분기 · 기믹 공통 인터페이스",
      summaries: {
        arch: "Unity 2022.3 · Stage2Manager 가 구간·카메라·리스폰을 한 곳에서 · 큐브는 enum/switch · 기믹은 인터페이스 5종.",
        code: "Stage2Manager 의 구간 전환, PatternSign 의 25초 패턴 교체, CubeType 의 switch.",
        proc: "2023.10 기획 → 11 씬 통합·기믹 → 12 코드 정리 → 2024.02 Steam 출시."
      },
      scenes: [
        {
          place: "trouble",
          kind: "puzzle",
          title: "3×3 패턴 퍼즐 · 표지판을 보고 발판을 맞추세요",
          size: 3,
          patterns: [
            [1, 0, 1, 0, 1, 0, 1, 0, 1],
            [0, 1, 0, 1, 1, 1, 0, 1, 0],
            [1, 1, 1, 0, 0, 0, 1, 1, 1],
            [1, 0, 0, 1, 0, 0, 1, 1, 1],
            [0, 0, 1, 0, 1, 0, 1, 0, 0]
          ],
          interval: 25,
          demoInterval: 10,
          legend: ["물", "얼음"],
          caveat:
            "패턴 값 다섯 개는 예시입니다. 실제 int[9] 배열은 비공개 저장소에 있어 가져오지 못했습니다. 규칙(5종 · 주기 교체 · 순서대로 비교)은 PatternSign.cs·PuzzleManager.cs 그대로입니다."
        },
        {
          place: "proc",
          kind: "timeline",
          title: "첫 커밋에서 Steam 출시까지 · 2023.10 ~ 2024.02",
          unit: "date",
          from: "2023-10-15",
          to: "2024-02-20",
          events: [
            {
              at: "2023-10-23",
              label: "첫 커밋",
              detail: "스테이지 2 구성 기획",
              tone: "ok"
            },
            {
              at: "2023-11-27",
              until: "2023-11-29",
              label: "스테이지 2 세 씬을 한 씬으로",
              detail: "통합 씬 생성 → 씬 합치기 → 씬 넘어가는 문제 해결",
              tone: "ok"
            },
            {
              at: "2023-12-13",
              label: "내 마지막 커밋 · 코드 정리",
              detail: "IMovable 등 공통 인터페이스 적용",
              tone: "ok"
            },
            {
              at: "2024-02-10",
              label: "Steam 출시",
              detail: "app/2743860",
              tone: "warn"
            }
          ],
          note: "4개월은 첫 커밋(10.23)에서 출시(02.10)까지입니다. 제 커밋은 12.13 까지 216개입니다.",
          source: "Steam 스토어 페이지"
        }
      ]
    },
    kpt: {
      keep: [
        "세 씬을 한 씬으로 합쳐 카메라·리스폰·클리어를 Stage2Manager 한 곳에 모음",
        "기믹을 인터페이스 5종으로 묶어 팀원이 같은 방식으로 붙이게 함"
      ],
      problem: ["밸런싱 시간 부족"],
      try: [
        "퍼즐 패턴을 코드 배열에서 데이터로 분리",
        "인터페이스 기반으로 장애물 종류 확장"
      ]
    },
    learningLead:
      "카메라·리스폰·클리어 처리를 Stage2Manager로 모으고, 기믹에 공통 인터페이스를 적용했습니다.",
    learning:
      "12월 코드 정리에서 팀원과 함께 공통 인터페이스를 적용했습니다. 퍼즐 패턴은 아직 코드에 정의돼 있어, 다음에는 기획자가 직접 수정할 수 있는 데이터로 분리하고자 합니다."
  },

  // ════════════════════════════ The Other Side / 이면 (game · VR · 팀) ═══════
  // 2026-09-03 신설. 문장은 포트폴리오 PDF 43–48쪽, 코드는 kbwon/IMP_VR 의
  // Assets/JJH/JJH/Scripts(본인 스크립트)에서 그대로 가져왔다. 특수 카메라
  // (CameraController/Manager)는 팀원(KBW) 스크립트라 **설명만 하고 코드는 싣지 않는다.**
  // 숫자는 전부 코드에서 센 값이다 — 사용자 수·플레이 수 같은 건 없다.
  // 2026-11-13 저장소(kbwon/IMP_VR develop) 대조로 고쳤다: 첫 커밋 2025-05-18 · 마지막 06-16, 커밋 161 중
  // toadsam 25. 본인 파일은 Assets/JJH/JJH/Scripts(EnemyDetector · EnemyLightZoneDetector · PlayerFlashlight
  // · GameManager · MonsterAI · BookheadMover 등). 「메인 기획」은 팀장 README 가 콘셉트·핵심 플레이 기획을
  // 자기 몫으로 적고 있어 「기획 참여」로 내렸다. 「GameManager 한 곳에서만 켜고 끈다」는 develop 에서 팀원의
  // 방 스크립트(FourthRoomManager · SixthRoomManager · ObjectDetectManager)가 몬스터를 직접 켜기도 해서 뺐다.
  "otherside-vr": {
    tagline: "VR HORROR PUZZLE · UNITY XR (TEAM OF 4)",
    heroImage: {
      src: "/projects/otherside-vr.webp",
      label: "The Other Side 플레이",
      // 파일 640×300. 16/9 로 두면 좌우 17% 가 잘렸다.
      ratio: "640/300"
    },
    problemShot: {
      src: "/projects/op/vr-chase.webp",
      label: "추격 중인 몬스터 (Bookhead)",
      ratio: "510/537",
      fit: "contain"
    },
    // 특수 카메라 꺼짐/켜짐 한 쌍(PDF 47쪽). 카메라 시스템은 팀원(kbwon) 코드라 캡션에 그렇게 적는다.
    beforeAfter: {
      before: {
        label: "맨눈에는 보이지 않는 단서",
        shot: {
          src: "/projects/op/vr-cam-off.webp",
          label: "카메라 끔",
          ratio: "1072/602"
        },
        note: "같은 방입니다. 손전등만으로는 단서가 보이지 않고, 손전등을 켜면 제 감지기가 적에게 들키게 만듭니다."
      },
      after: {
        label: "특수 카메라로 보면 나타난다",
        shot: {
          src: "/projects/op/vr-cam-on.webp",
          label: "카메라 켬",
          ratio: "1072/602"
        },
        note: "특수 카메라와 PostFX 는 팀원(kbwon) 담당입니다. 저는 그 카메라·손전등 상태를 읽어 몬스터를 켜고 끄는 쪽을 맡았습니다."
      }
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
          "특수 카메라·PostFX는 팀원이 담당했습니다. 저는 몬스터 AI와 감지 로직, GameManager의 추격 제어를 담당했습니다. 카메라·손전등 상태를 감지기가 판정하고, GameManager 가 그 판정으로 몬스터를 켜고 끕니다."
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
        v: "감지기 둘(시야각 · 손전등 빛 원뿔)이 봤는지 놓쳤는지만 판정하고 GameManager 가 몬스터 2종을 켜고 끕니다. 5초 못 보면 추격이 풀립니다"
      },
      {
        k: "내 역할",
        v: "AI 몬스터 2종 · 감지기 2 · GameManager 중앙 제어 (Assets/JJH, 커밋 25/161) · 기획 참여"
      }
    ],
    // 플레이 영상은 PDF 의 링크(sK9OoBNCVvc)가 2026-09-04 기준 404(비공개·삭제)라 뺐다. 공개되면 video: 를 되살린다.
    demo: {
      repo: "https://github.com/kbwon/IMP_VR"
    },
    meta: [
      // 저장소 첫 커밋 2025-05-18 · 마지막 06-16. 예전 "2025.04" 는 저장소에 근거가 없었다.
      {
        label: "기간",
        value: "2025.05 – 2025.06 (첫 커밋 05.18 · 마지막 06.16)"
      },
      {
        label: "팀",
        value: "4인 팀 (AR 과 같은 팀원) · 특수 카메라 시스템은 팀원 담당"
      },
      {label: "역할", value: "AI 몬스터 · 감지 로직 · 중앙 제어 · 기획 참여"},
      {label: "스택", value: "Unity · XR Interaction Toolkit · C# · NavMesh"}
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
    metricsNote: "몬스터 두 종, 감지기 둘, 놓친 뒤 5초 기준입니다.",
    features: [
      {
        t: "특수 카메라 단서",
        d: "정상 시야로는 안 보이는 퍼즐 요소를 카메라 모드로 발견"
      },
      {
        t: "손전등 리스크",
        d: "켜면 빛 원뿔까지 감지 대상. 시야 확보 vs 들킬 위험"
      },
      {t: "FOV 추격", d: "적 시야각 안에 들어오면 추적, 벗어나면 5초 뒤 해제"},
      {
        t: "퍼즐 ↔ 추격 연동",
        d: "GameManager 토글로 퍼즐 진행에 따라 몬스터 활성화"
      }
    ],
    problem:
      "단순 추격만으로는 공포의 템포를 조절할 수 없었습니다. 그리고 감지 로직과 AI 로직이 직접 결합되면, 퍼즐 조건이 하나 늘 때마다 몬스터 코드를 고쳐야 해서 유지보수가 어려웠습니다.",
    research: {
      quotes: []
    },
    hypothesis:
      "감지기는 감지만 하고 행동은 GameManager 가 중앙에서 켜고 끕니다. 퍼즐 진행에 따라 추격을 제어할 수 있고, 트리거가 늘어도 감지기는 GameManager 만 알면 됩니다.",
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
        desc: "시야각(90°)·거리(10m) + 손전등 빛 원뿔 10등분·양끝 포함 11점 샘플링"
      },
      {
        tag: "Detect",
        name: "EnemyLightZoneDetector",
        desc: "손전등 ON + 반경 7m · 두 번째 몬스터용 규칙"
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
        pick: "빛 원뿔을 10등분·양끝 포함 11점으로 샘플링",
        why: "손전등 빛이 몬스터의 시야에 들어오면 추격하도록 구현했습니다.",
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
          "플레이어 본체와 함께 손전등 빛 원뿔을 10등분·양끝 포함 11점으로 샘플링해 시야각 안에 걸리는지 봅니다",
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
          "감지기는 이 두 메서드만 부릅니다. 몬스터를 켜고 끄는 건 여기 한 곳",
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
        caption: "거리 기반 상태 전환. 활성 플래그가 꺼지면 배회만 합니다",
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
          "MonsterAI · 배회/추격/공격 상태",
          "타입별 활성 플래그 (Doll · Bookhead)"
        ]
      },
      {
        g: "감지",
        items: [
          "EnemyDetector · 시야각 + 손전등 원뿔",
          "EnemyLightZoneDetector · 반경 + 손전등"
        ]
      },
      {
        g: "제어",
        items: [
          "GameManager 싱글톤 · 중앙 토글",
          "PlayerFlashlight · 상태·원뿔 정보"
        ]
      },
      {
        g: "기획",
        items: ["기획 참여 · 몬스터 쪽 흐름 (탐색 → 발견 → 위협 → 회피)"]
      }
    ],
    challenges: [
      {
        title:
          "감지와 행동이 붙어 있으면 퍼즐이 늘 때마다 몬스터를 고쳐야 했습니다",
        problem:
          "감지기가 몬스터를 직접 부르면, 트리거·퍼즐 조건이 하나 추가될 때마다 AI 코드에 손이 갑니다.",
        solution:
          "감지기(EnemyDetector · EnemyLightZoneDetector)는 봤는지 놓쳤는지만 판정하고 GameManager.Instance 의 ToggleDollBehavior · ToggleBookheadBehavior 만 부릅니다. 제 코드 안에서는 몬스터를 켜고 끄는 자리가 GameManager 하나입니다."
      },
      {
        title: "손전등이 그냥 조명이면 ‘켤지 말지’가 선택이 안 됩니다",
        problem:
          "시야 확보와 들킬 위험이 맞바꿔지지 않으면 손전등은 항상 켜 두는 물건이 됩니다.",
        solution:
          "PlayerFlashlight 가 빛 원뿔(원점·방향·범위)을 내주고, 감지기가 그 원뿔을 따라 10등분하고 양끝을 포함한 11점(i=0부터 i<=10)을 검사해 적 시야각 안에 걸리는지 검사합니다. 빛줄기 끝만 걸려도 추격이 시작됩니다.",
        evidence: {
          status: "코드로 확인",
          note: "주 코드가 빛 정보를 넘기고 감지 알고리즘은 같은 커밋의 EnemyDetector에 있습니다. 아래 시야 도식은 단순화했으며 장애물 가림까지 재현하지 않습니다.",
          url: "https://github.com/kbwon/IMP_VR/blob/8f92d0ba6826dde2845652435a66e863b1c423b3/Assets/JJH/JJH/Scripts/PlayerFlashlight.cs"
        }
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
      {
        n: "2종",
        l: "몬스터 AI",
        sub: "Doll · Bookhead · 추격 8m / 공격 2m",
        source: "chaseDistance 8f"
      },
      {
        n: "2",
        l: "감지기",
        sub: "시야각 90°·10m · 손전등 빛 7m",
        source:
          "EnemyDetector viewAngle 90f · viewRange 10f / EnemyLightZoneDetector 7f"
      },
      {
        n: "5초",
        l: "놓친 뒤 추격 해제",
        sub: "놓친 뒤 추격을 푸는 시간",
        source: "본인 커밋 2/2"
      },
      {
        n: "25",
        l: "내 커밋 (161 중)",
        sub: "2025.05.20 ~ 06.16 · Assets/JJH",
        mini: {kind: "bars", before: 161, after: 25}
      }
    ],
    // ── 상세 페이지 손글씨 칸 (2026-11-13) ──
    detail: {
      compareTags: ["카메라 끔", "카메라 켬"],
      intro: {
        show: "특수 카메라로만 보이는 단서를 찾고, 손전등을 켜면 들키는 VR 공포 퍼즐·추격 게임입니다. 4인 팀에서 저는 몬스터 AI 2종과 감지기 2개, 그리고 그 둘을 잇는 GameManager 를 맡았습니다. 손전등 빛 원뿔을 11점으로 찍어 적 시야각에 넣는 바람에, 손전등을 켜는 것 자체가 위험이 됩니다.",
        bold: "손전등 빛 원뿔을 11점으로 찍어 적 시야각에 넣는 바람에, 손전등을 켜는 것 자체가 위험이 됩니다.",
        more: [
          "특수 카메라·PostFX·방 진행은 팀원 작업입니다. 제 스크립트는 Assets/JJH/JJH/Scripts 열 개이고, 저장소 커밋 161개 중 25개가 제 커밋입니다(2025-05-20 ~ 06-16).",
          "감지기는 봤는지 놓쳤는지만 판정하고 GameManager 가 몬스터를 켜고 끕니다. 5초 동안 못 보면 추격이 풀립니다."
        ]
      },
      highlights: [
        {
          show: "손전등 빛 원뿔(원점·방향·범위)을 10등분·양끝 포함 11점(i=0..10)으로 찍어 적 시야각(90° · 10m) 안에 걸리는지 검사합니다. 빛줄기 끝만 걸려도 추격이 시작됩니다.",
          bold: true,
          more: "EnemyDetector.cs 의 IsPlayerInFOV 와 샘플 루프(i <= sampleCount). 장애물 가림은 재현하지 않습니다. 본인 커밋 2/2."
        },
        {
          show: "감지(EnemyDetector · EnemyLightZoneDetector) / 행동(MonsterAI) / 켜고 끄기(GameManager) 를 세 파일로 나눴습니다. 감지기는 GameManager 의 토글만 부릅니다."
        },
        {
          show: "MonsterAI 는 평소엔 배회하다(RandomNavSphere) 8m 안에 들어오면 쫓고 2m 안에서 공격합니다. 놓친 뒤 5초(loseSightDelay)가 지나면 GameManager 가 추격을 끕니다.",
          more: "chaseDistance 8f · attackDistance 2f · animator.speed 3f · loseSightDelay 5f."
        }
      ],
      briefs: [
        {
          problem:
            "감지기가 몬스터를 직접 부르면 퍼즐 조건이 하나 늘 때마다 AI 코드에 손이 갔습니다.",
          did: "감지기는 봤는지 놓쳤는지만 판정하고 GameManager 의 ToggleDollBehavior · ToggleBookheadBehavior 만 부르게 했습니다.",
          result:
            "제 코드 안에선 켜고 끄는 자리가 GameManager 하나입니다. 팀원 방 스크립트는 몬스터를 직접 켜기도 해 전체가 한 곳은 아닙니다."
        },
        {
          problem: "손전등이 그냥 조명이면 켤지 말지가 선택이 안 됩니다.",
          did: "빛 원뿔을 11점으로 찍어 적 시야각 검사에 넣었습니다. 빛줄기 끝만 걸려도 추격이 시작됩니다.",
          result:
            "손전등을 켜는 것이 곧 들킬 위험이 됐습니다. 처음 추가한 커밋부터 이 로직입니다."
        }
      ],
      summaries: {
        arch: "감지기 2 → GameManager 토글 → MonsterAI 2종. 특수 카메라는 팀원.",
        code: "EnemyDetector 의 11점 샘플링, GameManager 의 토글, MonsterAI 의 추격·공격 거리.",
        proc: "2025.05.18 첫 커밋 → 06.05 Assets/JJH 추가 → 06.16 주석·마무리."
      },
      scenes: [
        {
          place: "trouble",
          kind: "steps",
          title: "들키는 순서 · EnemyDetector → GameManager → MonsterAI",
          steps: [
            {
              t: "시야각 판정",
              d: "플레이어가 10m 안 · 정면 ±45° 안이면 봤다",
              alt: {
                t: "손전등 켜짐",
                d: "빛 원뿔 11점 중 하나라도 시야각 안이면 봤다",
                tone: "warn"
              }
            },
            {
              t: "GameManager 토글",
              d: "ToggleDollBehavior(true) · 감지기는 여기까지만"
            },
            {
              t: "MonsterAI 추격",
              d: "8m 안이면 추격 · 2m 안이면 공격 · animator.speed 3",
              tone: "fail"
            },
            {
              t: "놓치면 5초 뒤 해제",
              d: "loseSightDelay 5f → ToggleDollBehavior(false)",
              alt: {
                t: "손전등 빛 구역 7m",
                d: "EnemyLightZoneDetector → Bookhead 쪽 토글",
                tone: "muted"
              }
            }
          ],
          note: ""
        },
        {
          place: "proc",
          kind: "timeline",
          title: "내 커밋 25개 · 2025.05.20 ~ 06.16",
          unit: "date",
          from: "2025-05-15",
          to: "2025-06-20",
          events: [
            {at: "2025-05-18", label: "저장소 시작 (팀장)", tone: "muted"},
            {at: "2025-05-20", label: "내 첫 커밋", tone: "ok"},
            {
              at: "2025-06-05",
              label: "Assets/JJH 추가 · 감지기·AI·GameManager",
              href: "https://github.com/kbwon/IMP_VR/blob/8f92d0ba6826dde2845652435a66e863b1c423b3/Assets/JJH/JJH/Scripts/EnemyDetector.cs",
              tone: "ok"
            },
            {
              at: "2025-06-06",
              until: "2025-06-10",
              label: "AI·감지 수정 10건",
              tone: "ok"
            },
            {
              at: "2025-06-16",
              label: "주석 추가 · 마지막 커밋",
              tone: "ok"
            }
          ]
        }
      ]
    },
    kpt: {
      keep: [
        "감지 / 행동 / 제어를 세 파일로 나눈 구조",
        "손전등을 켜면 들킬 위험이 생기게 한 규칙"
      ],
      problem: [
        "시야각·거리·5초 같은 값이 스크립트에 하드코딩",
        "몬스터가 2종이라 규칙 조합의 여지가 적음"
      ],
      try: ["감지 규칙을 ScriptableObject 로", "몬스터·퍼즐 조건 추가"]
    },
    learningLead:
      "손전등 빛 원뿔을 10등분·양끝 포함 11점 샘플링해 적 시야각 검사에 넣자, 손전등을 켜는 것 자체가 들킬 위험이 됐습니다.",
    learning:
      "감지기는 판정만, 몬스터는 행동만, 켜고 끄는 건 GameManager 로 모으려 했습니다. 다음엔 팀 규약으로 먼저 정해야 할 일입니다."
  },

  // ════════════════════════════ INTO MONSTER POINT (game · AR · 팀) ═════════
  // 2026-09-03 신설, 2026-11-13 저장소(toadsam/IMP develop) 대조로 고쳤다.
  // 예전 본문의 AdjustmentSystem.cs(바닥·벽)는 RBTylenol, Spawner.cs(스폰·보스)는 kbwon 작성이라
  // 내 코드가 아니었다. 내 코드는 Assets/Scripts/JJH — WeaponShooterWithJoystick(커밋 11/12) ·
  // SkillCooldown · ProjectileDamage · PlayerHealth · TimedSpawnerOnProjectile. "무기 발사 코드를
  // 저장소에서 못 찾았다" 던 옛 주석은 틀렸다(develop 에 있다). 커밋 109 중 toadsam 51,
  // 실제 작업 기간 2025-04-18 ~ 05-03. 무기 4종은 Assets/Scenes/Final.unity 의 heldWeaponPrefab 4개.
  "monsterpoint-ar": {
    tagline: "AR WAVE SHOOTER · AR FOUNDATION (TEAM OF 4)",
    heroImage: {
      src: "/projects/monsterpoint-ar.webp",
      label: "현실 공간에 등장한 몬스터",
      // 파일 1200×577. 16/9 로 두면 좌우 14% 가 잘렸다.
      ratio: "1200/577"
    },
    problemShot: {
      src: "/projects/op/ar-scan-after.webp",
      label: "스캔 후 전투 공간 고정 (바닥·벽은 팀원 코드)",
      ratio: "160/320",
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
        "스캔이 끝나면 평면 boundary 를 월드 좌표로 바꿔 X·Z min/max 로 바닥을 깔고 4방향 벽을 세웁니다(AdjustmentSystem, 팀원 RBTylenol). 그 안에서 처치 수가 10에 닿으면 보스가 나옵니다(Spawner, 팀원 kbwon). 저는 그 안에서 쓰는 무기 네 종의 발사·전환·잠금을 맡았습니다."
    },
    gallery: [
      {
        src: "/projects/op/ar-spawn.webp",
        label: "바닥 꼭짓점 기준 랜덤 스폰 (스폰은 팀원 코드)",
        ratio: "375/742",
        fit: "contain"
      },
      {
        src: "/projects/op/ar-play-bow.webp",
        label: "활 · 조이스틱 방향으로 발사",
        ratio: "380/584",
        fit: "contain"
      },
      {
        src: "/projects/op/ar-play-sword.webp",
        label: "칼 · 근접 무기",
        ratio: "378/532",
        fit: "contain"
      },
      {
        src: "/projects/op/ar-weapon-gun.webp",
        label: "총 · 잠금 해제 무기",
        ratio: "378/400",
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
        v: "무기 시스템(발사 · 전환 · 잠금 · 쿨타임) · 체력 · 게임 루프 기획 (Assets/Scripts/JJH, 커밋 51/109)"
      }
    ],
    demo: {
      video: "https://www.youtube.com/watch?v=9Lf2K1qBJ2E",
      repo: "https://github.com/toadsam/IMP"
    },
    meta: [
      // 저장소 init 2025-03-15, 실제 작업 04-18 ~ 05-03. 예전 "2025.03 – 2025.04" 는 5월을 빠뜨렸다.
      {label: "기간", value: "2025.04 – 2025.05 (작업 04.18 ~ 05.03)"},
      {label: "팀", value: "4인 팀 (VR 과 같은 팀원)"},
      {label: "역할", value: "무기 시스템 · 체력 · 게임 루프 기획"},
      {label: "스택", value: "Unity · AR Foundation · C#"}
    ],
    heroScreen: {
      title: "INTO MONSTER POINT",
      kind: "title",
      titleText: "SCAN",
      subText: "▶ 바닥을 비추세요"
    },
    impact: [
      {n: "4", l: "무기 · 활 / 칼 / 마법 / 총"},
      {n: "0.5초", l: "발사 간격 (fireRate)"},
      {n: "51", l: "내 커밋 (109 중)"}
    ],
    metricsNote:
      "fireRate 0.5f · 스킬 쿨타임 6f 는 Assets/Scripts/JJH 의 상수. 바닥·벽(CreateWall ×4)과 보스 트리거(counterBoss 10)는 팀원 코드의 값입니다.",
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
      "현실 공간은 플레이할 때마다 크기와 모양이 다릅니다. 전장·스폰 위치·경계를 고정값으로 두면 어떤 방에서는 벽 밖에 몬스터가 생기고 어떤 방에서는 전장이 방을 넘습니다.",
    research: {
      quotes: []
    },
    hypothesis:
      "스캔한 평면의 boundary를 기준으로 전장 크기와 바닥·벽·스폰 위치를 계산했습니다.",
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
        name: "Spawner (팀원)",
        desc: "spawnInterval 코루틴 · 처치 카운트 · counterBoss 도달 시 보스 · kbwon 작성"
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
        why: "시간 대신 플레이 성과로 웨이브가 넘어감",
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
        filename: "WeaponShooterWithJoystick.cs",
        caption: "조이스틱 입력이 있을 때만, 무기별 간격으로 발사",
        highlightLines: [3, 5, 12],
        lines: [
          "void Update() {",
          "    WeaponData currentWeapon = weapons[currentWeaponIndex];",
          "    if (Time.time > nextFire && (joystick.Horizontal != 0 || joystick.Vertical != 0))",
          "    {",
          "        nextFire = Time.time + currentWeapon.fireRate;   // 무기마다 다른 간격",
          "        StartCoroutine(ShootWeaponWithSpawnDelay(currentWeapon));",
          "    }",
          "}",
          "",
          "IEnumerator ShootWeaponWithSpawnDelay(WeaponData currentWeapon) {",
          "    if (!currentWeapon.isUnlocked) {",
          '        Debug.Log("Weapon is locked."); yield break;   // 잠긴 무기는 여기서 끝',
          "    }",
          "    // 애니메이션 → spawnDelay 뒤 발사체 생성 → fireSound → 2초 뒤 Destroy"
        ]
      },
      {
        filename: "SkillCooldown.cs",
        caption:
          "쿨타임을 숫자 대신 칸(fillImages)으로 표시. chargeInterval 마다 한 칸씩 켜지고 다 차면 isSkillReady",
        highlightLines: [3, 9],
        lines: [
          "public GameObject[] fillImages;      // Fill_1 ~ Fill_6",
          "public float chargeInterval = 1f;",
          "public float cooldownTime = 6f;",
          "private int currentIndex = 0;",
          "public bool isSkillReady => currentIndex >= fillImages.Length;",
          "",
          "void Update() {",
          "    if (!isCharging || isSkillReady) return;",
          "    timer += Time.deltaTime;             // interval 마다 다음 칸을 켠다",
          "}"
        ]
      }
    ],
    work: [
      {
        g: "무기",
        items: ["활 · 칼 · 마법 · 총", "발사 조건 · fireRate · 잠금 · 전환"]
      },
      {
        g: "스킬·체력",
        items: ["SkillCooldown 칸 UI (6초)", "PlayerHealth · ProjectileDamage"]
      },
      {g: "기획", items: ["게임 루프 기획 참여"]},
      {
        g: "팀 시스템 (참고)",
        items: [
          "바닥·벽 AdjustmentSystem · RBTylenol",
          "스폰·보스 Spawner · kbwon"
        ]
      }
    ],
    challenges: [
      {
        title: "버튼을 누르면 항상 나가는 총은 조준이 없었습니다",
        problem:
          "AR 화면에서 발사 버튼 하나로 쏘게 하면 방향 없이 난사가 됩니다. 조이스틱이 가리키는 쪽으로만, 무기마다 다른 간격으로 나가야 했습니다.",
        solution:
          "WeaponShooterWithJoystick.Update 에서 조이스틱 입력이 0 이 아니고 Time.time 이 nextFire 를 넘겼을 때만 발사하고, 발사 직후 nextFire = Time.time + currentWeapon.fireRate 로 다음 발사 시각을 무기별로 잡았습니다. 발사는 코루틴이라 무기마다 spawnDelay 뒤에 발사체가 생기고, 애니메이션과 소리는 그 앞뒤에 붙습니다."
      },
      {
        title: "무기 네 종을 한 손으로 돌리고, 잠긴 무기는 안 나가게",
        problem:
          "무기가 넷(활·칼·마법·총)인데 화면이 좁아 버튼을 넷 둘 수 없었고, 아직 못 얻은 무기가 그냥 나가면 진행이 의미가 없었습니다.",
        solution:
          "Next/PreviousWeapon 이 currentWeaponIndex 를 돌리며 들고 있는 프리팹을 바꾸고, WeaponData.isUnlocked 가 false 면 발사 코루틴이 첫 줄에서 yield break 합니다. UnlockWeapon(index) 가 풀어 주고 잠금 아이콘(lockImage)을 같이 다룹니다.",
        evidence: {
          status: "구현 확인 · 본인 커밋",
          note: "같은 파일의 UnlockWeapon · NextWeapon · PreviousWeapon.",
          url: "https://github.com/toadsam/IMP/blob/develop/Assets/Scripts/JJH/WeaponShooterWithJoystick.cs"
        }
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
      {
        n: "4",
        l: "무기 · 활 / 칼 / 마법 / 총",
        sub: "활 · 칼 · 마법 · 총"
      },
      {
        n: "0.5초",
        l: "발사 간격",
        sub: "기본값 · 무기마다 다름"
      },
      {
        n: "6초",
        l: "스킬 쿨타임",
        sub: "1초마다 한 칸 · 6칸 차면 준비",
        source: "chargeInterval 1f · cooldownTime 6f"
      },
      {
        n: "51",
        l: "내 커밋 (109 중)",
        sub: "2025.04.18 ~ 05.03 · Assets/Scripts/JJH",
        mini: {kind: "bars", before: 109, after: 51}
      }
    ],
    // ── 상세 페이지 손글씨 칸 (2026-11-13) ──
    detail: {
      intro: {
        show: "현실 공간을 스캔해 전장으로 고정하고 그 안에서 웨이브로 몬스터를 사냥하는 4인 팀 AR 슈터입니다. 저는 무기 네 종의 발사·전환·잠금·쿨타임과 체력을 맡았고, 조이스틱이 가리킬 때만 무기별 간격으로 나가게 만들었습니다.",
        bold: "저는 무기 네 종의 발사·전환·잠금·쿨타임과 체력을 맡았고, 조이스틱이 가리킬 때만 무기별 간격으로 나가게 만들었습니다.",
        more: [
          "바닥·벽 생성(AdjustmentSystem)은 팀원 RBTylenol, 스폰과 보스 트리거(Spawner)는 팀원 kbwon 의 코드입니다.",
          "저장소 커밋 109개 중 51개가 제 커밋이고 실제 작업은 2025-04-18 ~ 05-03 입니다."
        ]
      },
      highlights: [
        {
          show: "조이스틱 입력이 0 이 아니고 nextFire 를 넘겼을 때만 발사, 발사 직후 nextFire = Time.time + fireRate 로 무기별 간격을 둡니다(WeaponShooterWithJoystick.Update).",
          bold: true,
          more: "발사는 코루틴이라 spawnDelay 뒤에 발사체가 생기고 2초 뒤 Destroy 됩니다. 본인 커밋 11/12, 첫 커밋 2025-04-29."
        },
        {
          show: "잠긴 무기(isUnlocked=false)는 발사 코루틴 첫 줄에서 끝나고, Next/PreviousWeapon 이 네 무기를 한 손으로 돌립니다.",
          more: "UnlockWeapon(index) 가 풀어 주고 lockImage 를 다룹니다."
        },
        {
          show: "스킬 쿨타임은 숫자 대신 칸 여섯 개로 보여 줍니다. 1초마다 한 칸, 다 차면 isSkillReady(SkillCooldown).",
          more: "chargeInterval 1f · cooldownTime 6f. 본인 커밋 2/3."
        }
      ],
      briefs: [
        {
          problem: "발사 버튼 하나면 방향 없이 난사가 됐습니다.",
          did: "조이스틱 입력이 있을 때만, 무기별 fireRate 간격으로 발사하게 했습니다.",
          result: "조준이 생겼고 무기마다 손맛이 달라졌습니다."
        },
        {
          problem:
            "무기 넷을 둘 버튼 자리가 없었고 못 얻은 무기가 그냥 나갔습니다.",
          did: "인덱스를 돌려 전환하고 isUnlocked 가 false 면 발사를 끊었습니다.",
          result: "무기 4종이 한 손으로 돌아가고 잠금 아이콘이 같이 바뀝니다."
        }
      ],
      summaries: {
        arch: "평면 스캔, 바닥과 벽, 스폰과 보스는 팀원이 만들었고 저는 그 안에서 쓰는 무기·스킬·체력을 맡았습니다.",
        code: "WeaponShooterWithJoystick 의 발사 조건·잠금과 SkillCooldown 의 칸 UI.",
        proc: "2025.03 init → 04.18 작업 시작 → 04.29 무기 발사 → 05.03 마무리."
      },
      scenes: [
        {
          place: "trouble",
          kind: "steps",
          title: "한 발이 나가기까지 · WeaponShooterWithJoystick",
          steps: [
            {
              t: "조이스틱 입력?",
              d: "Horizontal 또는 Vertical ≠ 0",
              alt: {
                t: "입력 없음",
                d: "아무것도 안 함 · 난사 방지",
                tone: "muted"
              }
            },
            {
              t: "쿨타임 지났나?",
              d: "Time.time > nextFire",
              alt: {t: "아직", d: "다음 프레임에 다시", tone: "muted"}
            },
            {
              t: "잠긴 무기?",
              d: "!isUnlocked 면 코루틴 첫 줄에서 yield break",
              tone: "warn",
              alt: {t: "잠김", d: "lockImage 표시 · 발사 없음", tone: "fail"}
            },
            {
              t: "발사",
              d: "nextFire = now + fireRate · 애니메이션 → spawnDelay → 발사체 · 소리 · 2초 뒤 Destroy",
              tone: "ok"
            }
          ],
          note: "fireRate 기본 0.5초, 무기마다 다르게 둘 수 있습니다. 발사체의 데미지 처리는 ProjectileDamage 가 맡습니다."
        },
        {
          place: "result",
          kind: "frames",
          title: "무기 네 종 · 손잡이를 끌어 보세요",
          ratio: "380/370",
          maxWidth: 560,
          frames: [
            {src: "/projects/op/ar-weapon-bow.webp", label: "활", at: "1"},
            {src: "/projects/op/ar-weapon-sword.webp", label: "칼", at: "2"},
            {src: "/projects/op/ar-weapon-magic.webp", label: "마법", at: "3"},
            {
              src: "/projects/op/ar-weapon-gun.webp",
              label: "총 · 잠금 해제 무기",
              at: "4"
            }
          ],
          source:
            "public/projects/op/ar-weapon-*.webp · Assets/Scenes/Final.unity"
        },
        {
          place: "proc",
          kind: "timeline",
          title: "내 커밋 51개 · 2025.04.18 ~ 05.03",
          unit: "date",
          from: "2025-04-15",
          to: "2025-05-06",
          events: [
            {
              at: "2025-04-18",
              label: "작업 시작",
              detail: "3월 15일 init 뒤 첫 실제 커밋",
              tone: "ok"
            },
            {
              at: "2025-04-29",
              label: "WeaponShooterWithJoystick 첫 커밋",
              href: "https://github.com/toadsam/IMP/commit/5120004f",
              tone: "ok"
            },
            {
              at: "2025-04-30",
              until: "2025-05-02",
              label: "무기 전환·잠금·스킬 쿨타임",
              tone: "ok"
            },
            {
              at: "2025-05-03",
              label: "마지막 커밋 · EndUI 연결",
              tone: "warn"
            }
          ],
          note: "전체 109 커밋 중 51개."
        }
      ]
    },
    kpt: {
      keep: [
        "조이스틱 방향이 있을 때만 발사하는 조건",
        "무기별 fireRate·spawnDelay 를 데이터(WeaponData)로 분리"
      ],
      problem: ["바닥·벽·스폰은 팀원 코드라 제가 손댈 수 없었음"],
      try: ["무기 해제 조건을 성과와 연결", "무기 데이터를 ScriptableObject 로"]
    },
    learningLead:
      "발사를 조이스틱 방향과 무기별 쿨타임에 묶자 조준이 생겼습니다.",
    learning:
      "팀 저장소에서 제가 맡은 것은 무기·스킬·체력입니다. 바닥·벽과 스폰은 팀원의 코드입니다."
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
      label: "1인칭 시점 · 탐색",
      ratio: "16/9"
    },
    // 트러블슈팅 세 건과 1:1 — 시점 전환(위 두 장) · 랜덤 스킬 3택 · 캐릭터 선택 UI.
    // PDF 30–33쪽 캡처(저장소 ajou-adventure/ 와 같은 원본)를 2×2 로 붙였다
    // (2026-09-04). 여기 쓴 세 컷은 갤러리에서 뺐다.
    resultShot: {
      src: "/projects/op/ajou-result-4cut.webp",
      label: "1인칭↔탑다운 · 레벨업 랜덤 3택 · 캐릭터 선택",
      ratio: "16/9",
      caption: "위: 같은 캠퍼스를 1인칭(탐색)과 탑다운(전투)으로 오갑니다."
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
        label: "포탈 · 씬 전환",
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
        v: "1인칭↔탑다운을 컨트롤러·카메라 부모·물리 제약 단위로 함께 바꾸고, 레벨업마다 랜덤 3택으로 매 판 다른 빌드가 나옵니다. 2024.09.23 ~ 12.30 커밋 124개 전부 혼자"
      },
      {k: "내 역할", v: "시스템 설계 / UI / AI / 전투 / 성장 전부 (1인)"}
    ],
    demo: {
      video: "https://www.youtube.com/watch?v=mtIiIWmrSdg",
      repo: "https://github.com/toadsam/Ajou_IndiGame"
    },
    meta: [
      // 카드(resume.ts)와 같은 값 — 지원서·첫 커밋(2024.09.23) 기준. 2024.08 은 근거가 약했다.
      {label: "기간", value: "2024.09 – 2024.12"},
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
        d: "1인칭 탐색 ↔ 탑다운 전투, 카메라·컨트롤러·물리 제약을 함께 전환"
      },
      {
        t: "랜덤 스킬 성장",
        d: "레벨업 시 3개 중 선택, 즉시 반영"
      },
      {
        t: "상태 기반 AI",
        d: "NavMesh 일반 몬스터(감지 10 · 공격 3) · 랜덤 패턴 보스 · 보스 웨이브 3초 예고 패널"
      },
      {
        t: "이벤트 시스템",
        d: "돌발 퀘스트 · 포탈 씬 전환 · 소환 스킬(20초/쿨 20초)"
      }
    ],
    problem:
      "퍼즐 탐색과 전투는 요구하는 시야와 조작이 다릅니다. 탐색과 전투에 서로 다른 시야와 조작 방식을 적용하고, 기능별 역할을 분리하려고 했습니다.",
    research: {
      quotes: [],
      stat: {
        n: "40",
        l: "스크립트 파일 수 · Manager 8 · Player 13 · Monster 5 · Skills 5 · Robot 3 · Map 2 · 기타 4"
      }
    },
    hypothesis:
      "카메라·컨트롤러·물리 제약을 모드 단위로 함께 바꿔야 한 캐릭터로 탐색과 전투를 오가면서도 조작이 겹치거나 화면이 튀지 않습니다.",
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
        desc: "FirstPerson / TopDown · 컨트롤러 enable 전환 · 카메라 Parent · Y축 잠금"
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
          "시점 전환은 카메라만 옮기지 않습니다. 컨트롤러·물리 제약·카메라 부모를 한 번에 바꿉니다",
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
          "상태 하나가 곧 메서드 하나. 거리 조건으로만 다음 상태를 정합니다",
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
        title: "시점을 바꾸면 조작이 겹치고 카메라가 튀었습니다",
        problem:
          "1인칭과 탑다운이 같은 입력을 동시에 받으면 오작동이 나고, 카메라를 위치로만 옮기면 전환 순간 시점이 튑니다.",
        solution:
          "컨트롤러 enable/disable과 카메라 부모 연결·localPosition 초기화는 수정 전에도 있었습니다. 2024-11-11 커밋에서 바뀐 것은 1인칭 진입 시 Y축 잠금을 풀고, 탑다운 전환 3초 뒤 FreezePositionY와 FreezeRotation을 적용한 부분입니다.",
        code: {
          filename: "PlayerModeManager.cs",
          lines: [
            "IEnumerator LockYPositionAfterDelay(float delay) {",
            "  yield return new WaitForSeconds(delay);",
            "  playerRigidbody.constraints = RigidbodyConstraints.FreezePositionY | RigidbodyConstraints.FreezeRotation;",
            "}"
          ]
        },
        evidence: {
          status: "전후 코드로 확인",
          note: "2024-11-11 커밋의 전후입니다. 이 화면에서 Unity 물리나 카메라를 실제로 돌리지는 않습니다.",
          url: "https://github.com/toadsam/Ajou_IndiGame/blob/172a051eb4986da29a703d9ac4dfb0fb0f01d8f1/Assets/Script/Manager/PlayerModeManager.cs"
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
      {
        n: "2",
        l: "시점 · 1인칭 ↔ 탑다운",
        sub: "T 키 · 탑다운 3초 뒤 Y축 잠금",
        source: "PlayerModeManager.cs"
      },
      {
        n: "3",
        l: "레벨업 랜덤 스킬 제시",
        sub: "randomSkills[3] · 즉시 반영"
      },
      {
        n: "5",
        l: "웨이브 · 다섯 번째 보스",
        sub: "case 1~5 · 보스 예고 패널 3초",
        source: "case 5 → ShowBossWavePanel"
      },
      {
        n: "124",
        l: "커밋 · 전부 혼자",
        sub: "2024.09.23 ~ 12.30 · Assets/Script 40파일",
        mini: {kind: "bars", before: 124, after: 124}
      }
    ],
    // ── 상세 페이지 손글씨 칸 (2026-11-13) ──
    detail: {
      intro: {
        show: "아주대 캠퍼스에서 마스코트 치토가 졸업을 향해 성장하는 혼자 만든 Unity 3D 액션 어드벤처입니다. 탐색은 1인칭, 전투는 탑다운으로 시점을 바꾸는데, 카메라만 옮기지 않고 컨트롤러·카메라 부모·물리 제약을 한 번에 바꿉니다.",
        bold: "카메라만 옮기지 않고 컨트롤러·카메라 부모·물리 제약을 한 번에 바꿉니다.",
        more: [
          "2024-09-23 첫 커밋부터 12-30 까지 커밋 124개가 전부 제 것입니다.",
          "레벨업마다 스킬 3개를 랜덤으로 제시하고, 다섯 번째 웨이브에 보스가 나옵니다."
        ]
      },
      highlights: [
        {
          show: "시점 전환을 시스템으로 만들었습니다. T 키를 누르면 조작 스크립트를 바꾸고 카메라를 옮겨 붙입니다. 탑다운이면 3초 뒤 Y축 위치와 회전을 잠급니다.",
          bold: true,
          more: "2024-11-11 커밋에서 Y축 잠금 해제·3초 뒤 재잠금이 들어갔습니다."
        },
        {
          show: "레벨업마다 전체 스킬에서 랜덤 3개를 제시합니다(randomSkills[3])."
        },
        {
          show: "WaveManager 가 case 1~5 로 웨이브를 돌리고 5에서 보스 예고 패널을 3초 띄운 뒤 BossMonster 를 냅니다. 보스 공격은 세 가지 패턴 가운데 하나가 무작위로 나옵니다.",
          more: "일반 몬스터는 Idle·Move·Chase·Attack·TakeDamage·Die 여섯 상태, 감지 10 · 공격 3."
        }
      ],
      briefs: [
        {
          problem:
            "1인칭과 탑다운이 같은 입력을 동시에 받으면 오작동이 나고, 카메라를 위치로만 옮기면 전환 순간 시점이 튀었습니다.",
          did: "컨트롤러 enable/disable 과 카메라 부모 교체는 그 전에도 있었고, 2024-11-11 커밋에서 1인칭 진입 시 Y축 잠금 해제와 탑다운 3초 뒤 FreezePositionY·FreezeRotation 을 넣었습니다.",
          result: "두 커밋의 전후가 저장소에서 확인됩니다."
        }
      ],
      summaries: {
        arch: "Manager 8 · Player 13 · Monster 5 · Skills 5 · Robot 3 · Map 2. PlayerModeManager 가 시점을, WaveManager 가 흐름을 맡습니다.",
        code: "PlayerModeManager 의 모드 전환, InGameSkillManager 의 랜덤 3택, MonsterAI 의 여섯 상태.",
        proc: "2024.09.23 시작 → 10.09 시점 전환 → 11.03 웨이브·스킬 → 11.11 Y축 잠금·AI → 11.29 보스 → 12.30 마지막."
      },
      scenes: [
        {
          place: "trouble",
          kind: "steps",
          title:
            "T 키 한 번에 바뀌는 네 가지 · PlayerModeManager.SetPlayerMode",
          steps: [
            {
              t: "T 키",
              d: "FirstPerson ↔ TopDown 토글"
            },
            {
              t: "컨트롤러 교체",
              d: "1인칭 컨트롤러 / 탑다운 컨트롤러 enable 을 서로 반대로"
            },
            {
              t: "카메라 부모",
              d: "1인칭: SetParent(머리) + localPosition 초기화 · 탑다운: SetParent(null) + TopDownCameraFollow"
            },
            {
              t: "물리 제약",
              d: "탑다운이면 3초 뒤 FreezePositionY | FreezeRotation",
              tone: "warn",
              alt: {t: "1인칭 진입", d: "Y축 잠금 해제", tone: "ok"}
            }
          ],
          source: "PlayerModeManager.cs"
        },
        {
          place: "result",
          kind: "frames",
          title: "같은 캠퍼스, 두 시점 · 손잡이를 끌어 보세요",
          ratio: "2/1",
          frames: [
            {
              src: "/projects/ajou-adventure/view-fp.webp",
              label: "1인칭 · 탐색",
              at: "FP"
            },
            {
              src: "/projects/ajou-adventure/view-td.webp",
              label: "탑다운 · 전투",
              at: "TD"
            }
          ],
          source: "public/projects/ajou-adventure/view-fp.webp · view-td.webp"
        },
        {
          place: "proc",
          kind: "timeline",
          title: "커밋 124개 · 2024.09.23 ~ 12.30",
          unit: "date",
          from: "2024-09-15",
          to: "2025-01-05",
          events: [
            {
              at: "2024-09-23",
              label: "첫날 커밋 16개 · 프로젝트 시작",
              tone: "ok"
            },
            {
              at: "2024-10-09",
              label: "PlayerModeManager · 시점 전환",
              href: "https://github.com/toadsam/Ajou_IndiGame/commit/7cffe4d7",
              tone: "ok"
            },
            {
              at: "2024-11-03",
              label: "WaveManager · InGameSkillManager",
              tone: "ok"
            },
            {
              at: "2024-11-11",
              label: "Y축 잠금 수정 · MonsterAI",
              detail: "커밋 2건",
              href: "https://github.com/toadsam/Ajou_IndiGame/commit/172a051e",
              tone: "warn"
            },
            {
              at: "2024-11-25",
              until: "2024-11-29",
              label: "캐릭터 선택 · BossMonster",
              tone: "ok"
            },
            {
              at: "2024-12-30",
              label: "마지막 커밋 · WaveManager",
              tone: "ok"
            }
          ],
          note: "월별 커밋 9월 17 · 10월 32 · 11월 65 · 12월 7."
        }
      ]
    },
    kpt: {
      keep: [
        "스크립트 40개를 Manager·Player·Monster·Skills·Robot·Map 으로 나눈 구조",
        "시점 전환을 연출이 아닌 시스템으로"
      ],
      problem: ["값(3초·20초·범위)이 스크립트에 박혀 있음"],
      try: ["건물별 스테이지 테마 · 최종 보스 ‘졸업’", "밸런스 값 데이터화"]
    },
    learningLead:
      "시점 전환은 카메라만 옮기지 않고 컨트롤러·물리 제약·카메라 부모를 한 번에 바꿨습니다. 그래야 조작이 겹치거나 화면이 튀지 않았습니다.",
    learning:
      "스크립트를 Manager·Player·Monster·Skills·Robot·Map 폴더로 나눠 각 시스템의 역할을 구분했습니다."
  }
};

// 총학생회 웹은 2026-11-14 개정분(9월 리디자인 · 새 캡처 · 이야기 배치)을 덮어쓴다. ajouchong2026.ts 참고.
RICH_DATA.ajouchong = ajouchong2026(RICH_DATA.ajouchong as RichProject);
// aClub 은 이야기 배치 개정분을 덮어쓴다. aclubStory.ts 참고.
RICH_DATA.aclub = aclubStory(RICH_DATA.aclub as RichProject);
// TSEROF 도 이야기 배치 개정분(실제 규칙의 퍼즐 포함)을 덮어쓴다. tserofStory.ts 참고.
RICH_DATA.tserof = tserofStory(RICH_DATA.tserof as RichProject);
// 포트폴리오 마을도 2026-11-14 개정분(다시 센 숫자 · 새 캡처 · 이야기 배치)을 덮어쓴다. villageStory.ts 참고.
RICH_DATA["village-portfolio"] = villageStory(
  RICH_DATA["village-portfolio"] as RichProject
);

// PR · 커밋 · 코드 파일 링크는 화면에 걸지 않는다(lib/codeLinks.ts). 주소는 위 데이터에 그대로 있다.
// MyWave 는 이야기 배치 개정분을 덮어쓴다. mywaveStory.ts 참고.
RICH_DATA.mystock = mywaveStory(RICH_DATA.mystock as RichProject);
// 수어링고(구 수어지교)는 이야기 배치 개정분을 덮어쓴다. signStory.ts 참고.
RICH_DATA["sign-language"] = signStory(
  RICH_DATA["sign-language"] as RichProject
);
stripCodeLinks(RICH_DATA);
