// 개발 경력기술서 PDF — 지원처가 "3쪽 이내 경력기술서"를 필수 서류로 요구할 때 쓴다.
//
// 이력서 PDF(`build-public-resume-pdf.mjs`)는 `resume.ts` 를 그대로 찍는 5쪽짜리
// 전체본이고, 이 문서는 **백엔드 직무에 맞춰 다시 고른 3쪽**이다. 프로젝트 넷 +
// AI 활용 개발 한 절. 틀(흑백 · Pretendard · A4)과 출력 방식은 이력서와 같다.
//
// 문장은 새로 지은 게 아니다 — `resume/jeong-jaehun-resume.md`, `resume.ts` 의
// highlights·metrics, `richContent/data.ts` 의 challenges·diagrams 에 있는 사실을
// 백엔드 심사자 순서로 다시 배열했다. 숫자를 고칠 때는 그쪽을 먼저 고치고 여기를 맞춘다.
//
// 심사자는 3쪽을 1~2분에 훑는다. 그래서 항목마다 「문제 / 해결 / 결과」 라벨 행으로
// 끊고, 문장은 개조식으로 쓰고, 눈이 먼저 닿아야 하는 숫자만 굵게 한다(`**…**`).
//
// 전화번호가 들어가므로 출력은 `resume/` 이다(`public/` 은 배포된다).
//
// 실행:  npm run career:pdf            → resume/정재훈_개발경력기술서.pdf
//        npm run career:pdf -- --html  → .tmp/resume-print/career.html 만 만든다

import {mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const HTML_ONLY = process.argv.includes("--html");
const OUT = join(root, "resume/정재훈_개발경력기술서.pdf");
const SRC_MD = join(root, "resume/jeong-jaehun-resume.md");
const TMP_DIR = join(root, ".tmp/resume-print");
const MAX_PAGES = 3;

const {hero, contact, certifications} = await import("../src/data/resume.ts");

const esc = s =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
/** 원고의 `**굵게**` 만 `<b>` 로 바꾼다. 그 밖의 HTML 은 받지 않는다. */
const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const bare = href => href.replace(/^https?:\/\//, "").replace(/\/$/, "");
const link = (href, text) =>
  `<a href="${esc(href)}">${esc(text ?? bare(href))}</a>`;

// ── 원고 ─────────────────────────────────────────────────────────────────────
// 순서가 곧 주장이다: Java/Spring 백엔드 깊이(득근득근) → 실제 운영(FestFlow) →
// 운영자가 직접 굴리는 API(총학생회) → 팀 협업(수어지교) → AI 도구를 통제하며 쓰는 법.
//
// items: [제목, [[라벨, 문장], …]]. 라벨은 문제·해결·결과가 기본이고, 측정이 본론인
// 항목은 측정·원인·판단을 쓴다.

// ── 문체 (2026-09-19) ────────────────────────────────────────────────────────
// 경력기술서는 **개조식**(명사형·"~함" 종결)으로 쓴다. 처음엔 이력서처럼 존댓말 서술문
// 이었는데 본인이 "AI 말투 같다"고 짚었다. 티가 난 곳은 문장 하나하나가 아니라 틀이었다 —
// 매끈한 인과 서술, 단락 끝을 닫는 짧은 단언("복구할 시간이 없습니다"), 의인화("승인이
// 쥐고 있습니다"), "X가 아니라 Y". 개발자가 직접 쓴 경력기술서는 대부분 개조식이고,
// 개조식에서는 저 틀들이 설 자리가 없다. 굵게는 숫자와 핵심 조치에만.

const SUMMARY = [
  "**Java · Spring Boot 백엔드 4개** 개발. 네 서비스 모두 저장소와 서비스 주소 공개",
  "배포 후 발생한 토큰 재발급 경쟁 상태, HTTPS · CORS credentials, SPA 새로고침 404를 **직접 재현해 수정**",
  "Claude Code · Claude Agent SDK 사용. 도구가 제안한 수치는 실측 후 반영, 에이전트의 단계 진행은 관리자 승인으로 제한"
];

const SKILLS = [
  ["Backend", "Java, Spring Boot 3, Spring Security, JPA, JWT, OAuth2, SSE"],
  [
    "Data · Infra",
    "PostgreSQL, MySQL, AWS S3 · CloudFront, Google Cloud Run, Docker, Nginx"
  ],
  [
    "AI",
    "Claude Code, Claude Agent SDK, OpenAI API (구조화 출력 · 규칙 기반 폴백)"
  ],
  ["그 밖", "React, TypeScript, Socket.IO, FastAPI (Python), pytest"]
];

const PROJECTS = [
  {
    title: "득근득근 (MuscleUp)",
    lead: "운동 기록 · 커뮤니티 · AI 인바디 상담을 제공하는 피트니스 커뮤니티 서비스",
    meta: "2025.09 ~ 2026.06 · 개인 개발 (1.0 → 2.0) · 이용 회원 약 50명 · 1.0 사용자 의견 4건 중 3건을 2.0에 반영",
    stack:
      "Spring Boot 3.5, JPA, PostgreSQL, JWT/OAuth, Socket.IO, AWS S3, React 19, TypeScript",
    links: [
      ["https://musclehub.co.kr"],
      ["https://github.com/toadsam/Ajou_MuscleUp"]
    ],
    diagram: "muscleup",
    items: [
      [
        "토큰 재발급 경쟁 상태",
        [
          [
            "문제",
            "Access/Refresh Token을 HttpOnly 쿠키 2개로 분리하고, 재발급 시 기존 토큰을 폐기하는 Rotation 적용. 이후 여러 요청이 동시에 401을 받으면 서로의 토큰을 무효화해 사용 중이던 사용자가 **로그아웃**됨"
          ],
          [
            "해결",
            "72b38fa → bacef85에서 서버 토큰 교체 제거. 프론트 single-flight는 기존 구현이며 동일 페이지의 요청을 단일화. 이후 64e41f2에서 로테이션·유예 처리 추가"
          ],
          [
            "결과",
            "여러 요청이 동시에 만료를 만나도 재발급은 1회. 나머지 요청은 대기 후 일괄 재시도"
          ]
        ],
        // 저장소 원문 그대로다(backend/…/service/RefreshTokenService.java rotate()).
        // 클라이언트 쪽 짝은 frontend/src/lib/api.ts 의 refreshing + waiters.
        {
          filename: "RefreshTokenService.java · rotate()",
          lines: [
            "// Keep refresh token stable to prevent race-condition logouts when",
            "// parallel requests trigger refresh at the same time.",
            "return current.getToken();"
          ]
        }
      ],
      [
        "목록 조회 인덱스",
        [
          [
            "문제",
            "정렬 페이지네이션 목록 4곳의 정렬 · 필터 컬럼에 인덱스 없음"
          ],
          [
            "측정",
            "20만 행 기준 EXPLAIN (ANALYZE) 7회 중앙값. 자랑방 목록 **60.2ms → 0.084ms**. 같은 페이지의 count 쿼리는 **57.2ms → 57.4ms**로 변화 없음"
          ],
          [
            "과제",
            "count 쿼리가 다음 병목. 커서 페이지네이션, 근사 카운트가 후보 (docs/BENCHMARKS.md에 기록)"
          ]
        ]
      ],
      [
        "실시간 라운지 부하 측정",
        [
          [
            "측정",
            "Socket.IO 라운지 동시 접속을 25명 → 300명으로 올리며 왕복 시간 측정. p95 **50명 9ms · 100명 85ms · 200명 1.1초**"
          ],
          [
            "원인",
            "200명에서도 CPU는 13.5%. 매 틱 전원에게 전원 목록을 보내 송신량이 **인원의 제곱**으로 증가하는 구조. 뷰포트 컬링, 델타 전송이 개선 후보"
          ]
        ]
      ],
      [
        "AI 응답 품질 하네스",
        [
          [
            "문제",
            "인바디 상담 응답이 프롬프트 수정 전후로 나아졌는지 비교할 기준이 없었음"
          ],
          [
            "해결",
            "체형 · 목표가 다른 **표본 8건**을 고정하고 응답을 **5개 축**(구조, 진단 적합, 우선순위, 설명 깊이, 안전성)으로 채점해 리포트 생성 (AiInbodyQualityHarnessTest.java). OPENAI_API_KEY가 없는 환경에서는 테스트를 건너뜀"
          ]
        ]
      ]
    ]
  },
  {
    title: "FestFlow",
    lead: "아주대 대동제에서 1일간 실제 운영한 축제 부스 · 매칭 관리 웹앱",
    meta: "2026.04 ~ 2026.06 · 개인 개발 · 운영 중",
    stack:
      "Spring Boot 3, JPA, Spring Security, JWT, SSE, MySQL, React (Vite) PWA, scikit-learn",
    links: [
      ["https://fest-flow-smoky.vercel.app"],
      ["https://github.com/toadsam/FestFlow"]
    ],
    items: [
      [
        "실시간 스트림과 관리자 API",
        [
          [
            "구현",
            "혼잡도 · 공연 · 공지를 **SSE**로 전송. 사용자 기능과 관리자 API 분리, 관리자 쪽에 CRUD · CSV 일괄 업로드 · KPI · 감사 로그"
          ],
          ["문제", "서버 재시작·통신 끊김으로 SSE 이벤트를 놓치면 주문 화면이 이전 상태에 머물 수 있음"],
          [
            "해결",
            "2026년 10월 보완: 미완료 주문 20초·운영 콘솔 15초 조건부 폴백 폴링과 화면 복귀 시 재조회. 서버에 20초 하트비트·DB 커밋 후 이벤트 발행 추가(FestFlow 1c850be). 하트비트와 주문 데이터 재조회는 별도 역할"
          ]
        ]
      ],
      [
        "혼잡 예측 모델 분리",
        [
          [
            "문제",
            "RandomForest 모델이 파이썬 자산이라, 응답 경로에 직접 넣으면 파이썬이 느려질 때 **부스 목록 API 전체**가 같이 느려짐"
          ],
          [
            "해결",
            "모델을 별도 프로세스로 분리. 설정 off · 스크립트나 모델 파일 없음 · **20초 초과** 시 규칙 기반 점수로 자동 전환, 응답 형식은 동일"
          ]
        ]
      ],
      [
        "사전 QA와 당일 운영",
        [
          [
            "진행",
            "축제 직전 **46명** 사전 테스트로 AI Match 3건 수정. 얼굴 인식 실패 사유를 5종으로 나눠 응답(서버), 대기 시간 단계별 안내와 신청함 하단 고정(화면)"
          ],
          [
            "결과",
            "2026.05 대동제 당일 **등록 169명 · 매칭 신청 424건 · 성사 36건**"
          ]
        ]
      ]
    ]
  },
  {
    title: "아주대 총학생회 웹 (ajouchong.com)",
    lead: "총학생회가 개발자 없이 직접 수정할 수 있는 학생회 정보 통합 서비스",
    meta: "2025.03 ~ 진행 중 · 2025 프론트 3인 → 2026.04부터 단독 담당 (프론트 · API · 배포)",
    stack: "Spring Boot 3, JPA, PostgreSQL, JWT, Docker, Nginx, React 18",
    links: [
      ["https://ajouchong.com"],
      [
        "https://github.com/ajouchong-dev/ajouchong/pull/70",
        "ajouchong-dev/ajouchong#70 (대여·링크 API)"
      ]
    ],
    items: [
      [
        "대여 API",
        [
          [
            "문제",
            "물품 잔여 수량을 볼 곳이 없어 학생이 **총학생회실에 와서야** 재고가 없다는 걸 알게 됨. 수량 하나를 바꾸는 데도 개발자 배포 필요"
          ],
          [
            "해결",
            "RentalItem(총량 · 현재 수량) 설계, 관리자 화면의 −/+ 를 PATCH /quantity로 즉시 반영. 서버에서 **0 미만 · 총량 초과 요청 거부**. 대여 · 반납은 RentalRecord로 기록, 관리자 API는 ADMIN 권한만 허용"
          ]
        ]
      ],
      [
        "링크허브와 배포",
        [
          [
            "문제",
            "인스타 프로필 링크 개수 제한으로 접수 폼 링크를 매번 교체. SPA 경로에서 새로고침하면 404 (2025)"
          ],
          [
            "해결",
            "Link 테이블과 관리 화면 추가, 프로필에는 링크허브 한 페이지만 연결. 404는 Nginx try_files로 수정"
          ],
          [
            "결과",
            "2026.09 기준 **대여 품목 10종 · 링크 11개** 운영 중. 검색 유입 16개월간 노출 12,314회 · 클릭 1,694회 (Search Console)"
          ]
        ]
      ]
    ]
  },
  {
    // 흐름에 맡기면 2쪽이 바닥까지 차고 3쪽이 절반 빈다(실측). 여기서 끊어 고르게 한다.
    newPage: true,
    title: "수어지교 (Sign-Language)",
    lead: "수어 동작 영상을 보고 뜻을 익히는 학습 앱 · 파란학기제 4인 팀",
    meta: "2026.01 ~ 2026.05 · 4인 (FE 1 · BE 2 · 3D 아바타 1) · 백엔드 2인 중 한 명 (로그인 · 번역 API · 배포)",
    stack:
      "Spring Boot, Firebase Firestore · Storage, OpenAI API, Google Cloud Run, Expo, React Native",
    links: [
      ["https://toadsam.github.io/Sign-Language/home"],
      ["https://github.com/toadsam/Sign-Language"]
    ],
    // 2026-09-19 저장소 blame 대조: 퀴즈 채점 정규화(QuizService)는 팀원 커밋이고
    // Storage 영상 연결도 팀원이 시작했다. 아래는 본인 커밋으로 확인되는 것만 적는다 —
    // OpenAiMorphologyNormalizerService(139줄 전부), 로그인 API, 300단어 사전, Cloud Run 배포.
    items: [
      [
        "텍스트 → 수어 번역 API의 문장 정규화",
        [
          [
            "구현",
            "입력 문장을 수어 사전 단어로 바꾸는 번역 API 중 문장 정규화 담당. OpenAI로 문장을 기본형 토큰으로 변환 (OpenAiMorphologyNormalizerService). 키가 없거나 호출이 실패하면 **규칙 기반 토큰**으로 번역 진행"
          ],
          [
            "그 밖",
            "로그인 API (인증 · 토큰 서비스), 수어 사전 **300단어** 선정과 영상 연동, Google Cloud Run 배포"
          ]
        ]
      ]
    ]
  }
];

const AI = {
  title: "AI 활용 개발 (myPortfolio)",
  lead: "관리자 입력이 3D 마을과 AI NPC 대화에 반영되는 포트폴리오 사이트 · 백엔드는 FastAPI (Python)",
  meta: "2026.06 ~ 진행 중 · 개인 개발 · 공개·관리자 API 65개 · 순수 로직 pytest 258개",
  links: [
    ["https://jaehun.co.kr"],
    ["https://github.com/toadsam/myPortfolio"],
    ["https://github.com/toadsam/codebase-anatomy"]
  ],
  diagram: "agent",
  items: [
    [
      "Claude Code 운용",
      [
        [
          "방식",
          "프로젝트 규칙과 실패 사례를 문서(CLAUDE.md)로 관리, **3개월간 24회** 갱신. 도구가 제안한 수치는 번들 크기 · 텍스처 VRAM 등을 **직접 측정한 뒤** 반영. 반복되는 분석 작업은 Claude Code 스킬(codebase-anatomy)로 만들어 공개"
        ]
      ]
    ],
    [
      "에이전트 하네스",
      [
        [
          "설계",
          "Claude Agent SDK 기반 직군 에이전트 4종이 산출물 작성. 에이전트는 작업을 **검토 대기**까지만 바꿀 수 있고, 다음 단계 전환은 관리자 API에서만 호출. 상태 전이 규칙은 순수 함수로 분리해 테스트. 도구 호출은 콜백에서 건별 검사, 읽기 경로도 제한"
        ],
        [
          "문제",
          "SDK가 권한 응답 채널을 먼저 닫아, 에이전트가 약 4분 실행 후 **파일을 하나도 쓰지 못하고 종료**. 응답이 끝날 때까지 채널을 유지하도록 수정"
        ]
      ]
    ],
    [
      "LLM 응답 검증",
      [
        [
          "설계",
          "모델이 낸 견적을 규칙 기반 기준의 **0.6~1.8배** 범위로 제한. API 키가 없거나 호출이 실패하면 규칙 기반 응답으로 대체"
        ]
      ]
    ],
    [
      "공개 쓰기 경로 보호",
      [
        [
          "설계",
          "외부 사용자가 쓰는 경로는 제작 의뢰 1개. 허니팟과 **AI 호출과 분리한 전용 레이트리밋** 적용. 진행 조회는 접근 토큰으로만 가능, 응답에 연락처 미포함"
        ]
      ]
    ]
  ]
};

// ── 그림 ─────────────────────────────────────────────────────────────────────
// 득근득근 구성도. 노드·숫자·라벨은 richContent/data.ts 의 "System Architecture"
// (Controller 28 · Service 25)를 따르고, 엔티티 수는 저장소에서 다시 센 값(@Entity 32)이다.
// 종이가 흑백이라 강조는 굵은 테두리 하나(Spring Boot)뿐이다.

function box(x, y, w, h, title, note, {bold = false, dashed = false} = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#fff" stroke="#111" stroke-width="${
    bold ? 1.8 : 0.9
  }"${dashed ? ' stroke-dasharray="3 2"' : ""} />
  <text x="${x + w / 2}" y="${
    y + (note ? h / 2 - 2 : h / 2 + 3.5)
  }" text-anchor="middle" font-size="9.5" font-weight="700">${esc(
    title
  )}</text>${
    note
      ? `\n  <text x="${x + w / 2}" y="${
          y + h / 2 + 10
        }" text-anchor="middle" font-size="7.6" fill="#555">${esc(note)}</text>`
      : ""
  }`;
}

const arrow = (x1, y1, x2, y2, label, lx, ly) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="0.9" marker-end="url(#ah)" />
  <text x="${lx}" y="${ly}" text-anchor="middle" font-size="7.4" fill="#555">${esc(
    label
  )}</text>`;

const DIAGRAMS = {
  muscleup: `<figure class="diagram">
<svg viewBox="0 0 640 118" xmlns="http://www.w3.org/2000/svg" font-family="Pretendard, 'Malgun Gothic', sans-serif">
  <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#111" /></marker></defs>
  ${box(4, 34, 118, 50, "React SPA", "401 → refresh → 재요청")}
  ${box(214, 6, 190, 46, "Spring Boot (REST)", "Controller 28 · Service 25", {
    bold: true
  })}
  ${box(214, 68, 190, 44, "Socket.IO 서버", "위치 · 채팅만 분리")}
  ${box(496, 2, 140, 34, "PostgreSQL", "JPA 엔티티 32")}
  ${box(496, 42, 140, 32, "AWS S3", "이미지", {dashed: true})}
  ${box(496, 80, 140, 32, "OpenAI", "인바디 분석 · 상담", {dashed: true})}
  ${arrow(122, 50, 212, 30, "HTTP / REST", 166, 32)}
  ${arrow(122, 70, 212, 90, "WebSocket", 166, 94)}
  ${arrow(404, 22, 494, 19, "JPA", 449, 14)}
  ${arrow(404, 34, 494, 56, "", 0, 0)}
  ${arrow(404, 44, 494, 94, "", 0, 0)}
</svg>
<figcaption>위치 · 채팅처럼 자주 바뀌는 상태만 Socket.IO로 분리, 나머지는 REST. 점선은 외부 서비스</figcaption>
</figure>`,
  // 근거: backend/app/agents/ — 에이전트 실행은 작업을 review 까지만 올리고,
  // 단계를 넘기는 건 관리자 라우트가 부르는 gate.apply_gate() 하나다.
  agent: `<figure class="diagram">
<svg viewBox="0 0 640 96" xmlns="http://www.w3.org/2000/svg" font-family="Pretendard, 'Malgun Gothic', sans-serif">
  <defs><marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#111" /></marker></defs>
  ${box(4, 4, 150, 40, "에이전트 실행", "Claude Agent SDK")}
  ${box(244, 4, 170, 40, "can_use_tool 콜백", "도구 호출마다 경로 검사", {
    bold: true
  })}
  ${box(496, 4, 140, 40, "의뢰별 작업 폴더", "그 밖의 경로는 거부")}
  ${box(4, 54, 150, 38, "작업 상태: 검토 대기", "에이전트 권한 범위")}
  ${box(244, 54, 170, 38, "관리자 게이트 API", "관리자 승인", {bold: true})}
  ${box(496, 54, 140, 38, "gate.apply_gate()", "순수 함수 · 테스트 있음")}
  ${arrow(154, 24, 242, 24, "도구 호출", 198, 18).replaceAll("#ah", "#ah2")}
  ${arrow(414, 24, 494, 24, "허용", 454, 18).replaceAll("#ah", "#ah2")}
  ${arrow(154, 73, 242, 73, "결과 제출", 198, 67).replaceAll("#ah", "#ah2")}
  ${arrow(414, 73, 494, 73, "다음 단계", 454, 67).replaceAll("#ah", "#ah2")}
</svg>
<figcaption>도구 호출은 콜백에서 검사, 단계 진행은 관리자 승인 후에만 가능</figcaption>
</figure>`
};

// ── 조각 ─────────────────────────────────────────────────────────────────────

function renderLinks(links) {
  return links.map(([href, text]) => link(href, text)).join(" · ");
}

function renderCode(code) {
  if (!code) return "";
  const lines = code.lines.map(esc).join("\n");
  return `    <pre class="code"><span>${esc(
    code.filename
  )}</span>${lines}</pre>`;
}

function renderItem([head, rows, code]) {
  const body = rows
    .map(([k, v]) => `    <div><dt>${esc(k)}</dt><dd>${fmt(v)}</dd></div>`)
    .join("\n");
  return `  <section class="item">
    <h4>${esc(head)}</h4>
    <dl>
${body}
    </dl>
${renderCode(code)}
  </section>`;
}

function renderProject(p) {
  return `<article class="proj${p.newPage ? " newpage" : ""}">
  <div class="proj-head">
    <h3>${esc(p.title)}</h3>
    <p class="lead">${esc(p.lead)}</p>
    <p class="meta">${esc(p.meta)}</p>
    ${p.stack ? `<p class="meta"><span>기술</span> ${esc(p.stack)}</p>` : ""}
    <p class="meta"><span>링크</span> ${renderLinks(p.links)}</p>
  </div>
${p.diagram ? DIAGRAMS[p.diagram] : ""}
${p.items.map(renderItem).join("\n")}
</article>`;
}

const CSS = `
:root { --ink: #111; --body: #333; --muted: #6b6b6b; --rule: #111; --hair: #cfcfcf; }
@page { size: A4; margin: 15mm 16mm 15mm; }
* { box-sizing: border-box; }
html { font-size: 9.6pt; }
body {
  margin: 0; color: var(--ink);
  font-family: "Pretendard", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  line-height: 1.6; word-break: keep-all; overflow-wrap: anywhere;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
a { color: inherit; text-decoration: none; }
b { font-weight: 700; color: var(--ink); }
p { margin: 0; }

.title { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 7px; border-bottom: 2px solid var(--rule); }
h1 { margin: 0; font-size: 20pt; font-weight: 800; line-height: 1.2; letter-spacing: -0.01em; }
h1 small { margin-left: 8px; font-size: 10.5pt; font-weight: 700; color: var(--body); }
.contact { text-align: right; color: var(--body); font-size: 8.6pt; line-height: 1.5; }

.summary { margin-top: 8px; color: var(--body); }
.summary p { padding-left: 10px; text-indent: -10px; }
.summary p::before { content: "· "; }

.skills { margin: 8px 0 0; padding: 6px 0; border-top: 1px solid var(--hair); border-bottom: 1px solid var(--hair); }
.skills div { display: grid; grid-template-columns: 92px minmax(0, 1fr); }
.skills dt { font-weight: 700; }
.skills dd { margin: 0; color: var(--body); }

/* 쪽 나눔은 newPage 한 곳만 못박고 나머지는 흐름에 맡긴다. 제목 묶음과 항목 하나는
   쪽 경계에서 갈라지지 않는다. */
.proj { margin-top: 15px; }
.proj.newpage { break-before: page; margin-top: 0; }
.proj-head { break-inside: avoid; break-after: avoid; padding-top: 7px; border-top: 2px solid var(--rule); margin-bottom: 4px; }
.proj h3 { margin: 0; font-size: 12.5pt; font-weight: 800; line-height: 1.4; }
.lead { color: var(--ink); }
.meta { color: var(--muted); font-size: 8.5pt; }
.meta span { display: inline-block; min-width: 26px; color: var(--ink); font-weight: 700; }
.meta a { color: var(--body); }

.diagram { margin: 8px 0 2px; break-inside: avoid; }
.diagram svg { display: block; width: 88%; margin: 0 auto; height: auto; }
.diagram figcaption { margin-top: 3px; color: var(--muted); font-size: 8.2pt; text-align: center; }

/* 항목 — 제목 한 줄 + 라벨 행. 라벨 열이 좁아 본문 폭을 거의 안 먹는다. */
.item { margin-top: 7px; break-inside: avoid; }
.item h4 { margin: 0 0 1px; font-size: 10.2pt; font-weight: 800; }
.item dl { margin: 0; }
.item dl div { display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 0 8px; }
.item dt { color: var(--muted); font-size: 8.4pt; padding-top: 1.5px; }
.item dd { margin: 0; color: var(--body); }

/* 코드 조각 — 저장소 원문. 흑백이라 옅은 회색 판 하나로만 구분한다. */
.code { margin: 3px 0 0 38px; padding: 5px 9px; background: #f3f3f3; border-left: 2px solid var(--rule); font-family: "JetBrains Mono", "D2Coding", Consolas, monospace; font-size: 8pt; line-height: 1.5; color: var(--ink); white-space: pre-wrap; }
.code span { display: block; color: var(--muted); font-family: "Pretendard", "Malgun Gothic", sans-serif; font-size: 7.8pt; }

.tail { margin-top: 13px; padding-top: 7px; border-top: 2px solid var(--rule); color: var(--body); break-inside: avoid; }

@media screen {
  html { background: #e9edf2; }
  body { max-width: 210mm; margin: 24px auto; padding: 15mm 16mm; background: #fff; box-shadow: 0 12px 40px rgba(0,0,0,.12); }
}
`;

function renderDocument(phone) {
  const contactLines = [
    `${link(`mailto:${contact.email}`, contact.email)} · ${link(
      `tel:${phone}`,
      phone
    )}`,
    `${link(contact.github)} · ${link("https://jaehun.co.kr/", "jaehun.co.kr")}`
  ];
  const tail = [
    ...certifications.map(
      c =>
        `<b>${esc(c.name)}</b> ${esc(c.date)} · ${esc(c.org)} · ${esc(c.grade)}`
    ),
    "<b>아주대학교</b> 디지털미디어학과 · 인공지능융합전공 복수전공 · 2027.02 졸업 예정"
  ];
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>${esc(hero.name)} 개발 경력기술서</title>
<style>${CSS}</style>
</head>
<body>
<header class="title">
  <h1>${esc(hero.name)}<small>개발 경력기술서 · Backend</small></h1>
  <div class="contact">${contactLines
    .map(l => `<div>${l}</div>`)
    .join("")}</div>
</header>
<section class="summary">
${SUMMARY.map(s => `  <p>${fmt(s)}</p>`).join("\n")}
</section>
<dl class="skills">
${SKILLS.map(
  ([k, v]) => `  <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`
).join("\n")}
</dl>
${PROJECTS.map(renderProject).join("\n")}
${renderProject(AI)}
<section class="tail">
${tail.map(t => `  <p>${t}</p>`).join("\n")}
</section>
</body>
</html>
`;
}

// ── 실행 ─────────────────────────────────────────────────────────────────────

const md = await readFile(SRC_MD, "utf8");
// 2026-10-09: 번호는 원고 md 에서 빠지고 gitignore 된 resume/phone.local.txt 로 옮겼다.
const localPhone = await readFile(join(root, "resume/phone.local.txt"), "utf8").catch(() => "");
const phone =
  localPhone.match(/([0-9][0-9-]{8,})/)?.[1] ?? md.match(/^Phone:\s*([0-9-]+)/m)?.[1];
if (!phone) {
  console.error("원본 md 에서 Phone: 줄을 찾지 못했습니다.");
  process.exit(1);
}

await mkdir(TMP_DIR, {recursive: true});
const html = renderDocument(phone);
const htmlPath = join(TMP_DIR, "career.html");
await writeFile(htmlPath, html, "utf8");
console.log(`HTML: ${htmlPath}`);
if (HTML_ONLY) {
  console.log(`미리보기: ${pathToFileURL(htmlPath).href}`);
  process.exit(0);
}

const {launchChromium} = await import("./e2e/lib.mjs");
const browser = await launchChromium();
try {
  const page = await browser.newPage();
  await page.setContent(html, {waitUntil: "networkidle"});
  await page.emulateMedia({media: "print"});
  const pdf = await page.pdf({
    path: OUT,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="width:100%;padding:0 16mm;display:flex;justify-content:space-between;font-family:'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;font-size:7.5pt;color:#9aa3b2;">
      <span>${esc(hero.name)} · 개발 경력기술서</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`
  });
  // 쪽수는 지원처가 정한 상한이다. 넘으면 조용히 내보내지 않는다.
  const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? [])
    .length;
  console.log(`생성: resume/정재훈_개발경력기술서.pdf (${pages}쪽)`);
  if (pages > MAX_PAGES) {
    console.error(`${MAX_PAGES}쪽을 넘었습니다. 원고를 줄이세요.`);
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
