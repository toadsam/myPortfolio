// 아주대 총학생회 웹의 2026-11-14 개정분. data.ts 의 ajouchong 위에 덮어쓴다.
// data.ts 끝에서 `RICH_DATA.ajouchong = ajouchong2026(RICH_DATA.ajouchong)` 로 합쳐지므로
// 상세 페이지 · 마을 전시실 · 원페이저가 모두 이 값을 읽는다. data.ts 의 ajouchong 은 2026년 4월까지의
// 원고이고, 여기 없는 칸(perf · decisions · coreCode 등)은 그 값을 그대로 쓴다.
//
// 왜 따로 뒀나: 9월 개편을 반영하며 600줄 가까이 바뀌었고, 시안으로 먼저 확인한 값을 글자 하나 안 바꾸고
// 그대로 쓰려고 덮어쓰는 층으로 남겼다. 원고를 한 파일로 합칠 때는 아래 값을 data.ts 로 옮기고 이 파일을 지운다.
//
// 왜 다시 썼나: 9월에 프론트를 전부 다시 디자인했고(PR #37) 링크허브 순서 관리를 붙였다
// (PR #38 · 백엔드 bf6f1d8a). 실서비스 화면도 그때 바뀌어, 옛 캡처 여섯 장(v2/)은 지금 사이트에 없는 모습이다.
//
// 2026-11-14 에 gh 와 실서비스로 확인한 것:
//   · 프론트 ajouchong-dev/ajouchong-web  #37 +11,771/−8,046 · 87파일 · 2026-09-21 머지 · CI build-and-deploy 통과
//                                          #38 +237/−5 · 2파일 · 2026-09-22 머지
//   · 백엔드 ajouchong-dev/ajouchong      bf6f1d8a +83/−2 · 7파일 · 2026-09-22 (PATCH /api/admin/link/order)
//   · polish.css 는 본인의 4월 PR #36 이 +1,483줄로 넣은 파일이고, #37 직전 커밋에서 !important 가 95개였다.
//     지금 develop 의 index.js · App.js 는 variables.css · common.css 만 import 한다(파일은 저장소에 남아 있다).
//   · 배너 사진: 웹용 사본이 있는 6장의 원본 합 61.4MB(MiB), 사본 6장 합 2.69MB. PR 본문은 "약 71MB → 2.7MB" 라고
//     적었는데 저장소 파일 크기로 다시 더한 값이 달라 더한 값을 쓴다.
//   · develop 의 본인 커밋: 프론트 46개(전체 355) · 백엔드 16개(전체 396). 2026년에 머지한 PR 은 프론트 5 · 백엔드 2.
//   · 실서비스(2026-11-14): 대여 품목 10종 124개(48+35+21+6+4+2+4+1+2+1), 링크허브 링크 9개(9월 4일에는 11개).
//   · Search Console 내보내기는 2026-08-30 까지라 9월 개편 뒤의 수치는 없다. 지어내지 않는다.
//   · 관리자 화면은 로그인이 필요해 새로 찍지 못했다. 옛 관리자 캡처(v2/rental-admin, v2/chatbot)는 뺐다.
//   · 모바일 첫 화면: 4월 개편의 「여섯 갈래 카드」는 9월에 없어졌다. 지금은 사진 히어로와 버튼 둘,
//     「지금 총학」 띠가 먼저 나오고 여섯 갈래는 같은 화면 아래 「바로가기」에 있다. 메뉴는 햄버거가 여는
//     전체 화면 아코디언이다. 그래서 "첫 화면에 여섯 갈래를 폈다"는 문장은 쓰지 않는다.
import type {RichProject} from "./shared";

const V3 = "/projects/ajouchong/v3";

const TL_TITLE = "2026년 · 혼자 맡은 뒤 머지한 것";
const GSC_TITLE = "5~8월 검색 노출 · 2025년과 2026년";
const BANNER_TITLE = "첫 화면 배너 사진 6장의 용량";

export function ajouchong2026(base: RichProject): RichProject {
  return {
    ...base,
    heroImage: {
      src: `${V3}/home-desktop.webp`,
      label: "2026.09 개편 뒤 첫 화면",
      ratio: "1440/688"
    },
    beforeAfter: {
      before: {
        label: "첫 화면에 대여사업 카드 하나뿐이었습니다",
        shot: {
          src: "/projects/ajouchong/v2/mobile-before.webp",
          label: "2025 모바일 메인",
          ratio: "9/16"
        },
        note: "소개·소식·소통·자료실·학생복지로 가려면 오른쪽 위 햄버거를 먼저 눌러야 했습니다."
      },
      after: {
        label: "공지와 대여로 가는 버튼을 첫 화면에 둡니다",
        shot: {
          src: `${V3}/m-home.webp`,
          label: "2026.09 모바일 메인 · 2026-11-14 캡처",
          ratio: "9/16"
        },
        note: "사진 위에 「공지사항 보기」「물품 대여하기」 두 버튼을 두고, 바로 아래 「지금 총학」 띠에 최근 공지와 대여 가능 물품 수를 보여 줍니다. 메뉴 여섯 갈래는 같은 화면 아래 「바로가기」에 있고, 햄버거는 전체 화면 메뉴를 엽니다."
      }
    },
    gallery: [
      {
        src: `${V3}/rental-cards.webp`,
        label: "대여사업 · 남은 수량을 오기 전에",
        ratio: "21/10",
        caption:
          "품목마다 남은 수량을 막대로 보여 줍니다. 대여·반납 기록은 창구에서 관리자가 남깁니다."
      },
      {
        src: `${V3}/linkhub.webp`,
        label: "링크허브 · 접수 창구 모음",
        ratio: "9/4",
        caption:
          "인스타그램 프로필에는 이 페이지 하나만 걸고, 안에서 접수 창구와 신청 링크를 모아 보여 줍니다. 2026-11-14 기준 9개입니다."
      },
      {
        src: `${V3}/home-band.webp`,
        label: "지금 총학 · 최근 공지와 대여 가능 물품 수",
        ratio: "24/7",
        caption: "첫 화면 사진 바로 아래의 띠입니다. 값은 API 에서 읽습니다."
      },
      {
        src: `${V3}/menu-panel.webp`,
        label: "전체 메뉴 패널",
        ratio: "36/13",
        caption:
          "머리 메뉴에 마우스를 올리면 여섯 갈래의 하위 메뉴가 한 번에 열립니다."
      }
    ],
    tldr: [
      {
        k: "무엇을",
        v: "아주대 총학생회 공식 웹. 2025년엔 프론트 3인 중 한 명, 2026년 4월부터 혼자 맡아 대여사업 · 링크허브 · 관리자 화면을 프론트부터 API까지 만들고 9월에 프론트 전체를 다시 디자인"
      },
      base.tldr[1],
      {
        k: "결과",
        v: "학생은 오기 전에 수량을 보고, 총학생회는 수량·링크·의견을 관리 화면에서 직접 고칩니다. 품목 10종 · 링크 9개가 실서비스에서 돌아가는 중(2026-11-14)"
      },
      {
        k: "내 역할",
        v: "2025 프론트 화면 일부 → 2026 단독: React 화면 + Spring Boot API(대여·링크·권한) + 배포 + 9월 전면 리디자인"
      }
    ],
    meta: base.meta.map(m =>
      m.label === "역할"
        ? {
            label: "역할",
            value:
              "2025 프론트 화면 일부 → 2026 대여사업 · 링크허브 · 관리자 화면 · 백엔드 API · 9월 프론트 전면 리디자인"
          }
        : m
    ),
    heroScreen: {
      title: "ajou-council",
      kind: "feed",
      feed: [
        "[대여] 매트 돗자리 24/35",
        "[링크허브] 접수 창구 9개",
        "[공지] 총회 일정 안내",
        "[의견] 도우미로 접수"
      ]
    },
    features: [
      base.features[0],
      {
        t: "링크허브",
        d: "접수 폼·신청 링크 모음 · 관리자가 넣고 빼고 순서를 정함"
      },
      base.features[2],
      {t: "공지·Q&A·자료실", d: "2025 구조 위에 2026.09 전면 리디자인"}
    ],
    research: {
      quotes: [],
      stat: {
        n: "10 · 9",
        l: "실서비스 대여 품목 · 링크허브 링크 (2026.11.14 사이트에서 셈)"
      }
    },
    process: [
      {t: "2025", d: "프론트 화면 일부"},
      {t: "대여사업", d: "API + 화면 · 2026.04"},
      {t: "링크허브", d: "Link 테이블 + 관리"},
      {t: "관리자", d: "ADMIN 권한"},
      {t: "운영", d: "EC2 compose · 힙 384MB"},
      {t: "리디자인", d: "토큰 · 공용 컴포넌트 · 2026.09"},
      {t: "링크 순서", d: "PATCH /order"}
    ],
    work: [
      base.work[0],
      {
        g: "2026 화면",
        items: [
          "대여사업 · 링크허브",
          "관리자(대여·링크·공지·피드백) · 도우미 위젯",
          "9월 전면 리디자인(홈 · 서브 · 관리자, 87파일)"
        ]
      },
      {
        g: "2026 API",
        items: [
          "RentalItem · RentalRecord · Link 엔티티/서비스/컨트롤러",
          "사용자/관리자 컨트롤러 분리 · ADMIN 권한",
          "링크 노출 순서 저장(PATCH /api/admin/link/order)"
        ]
      },
      base.work[3]
    ],
    challenges: [
      base.challenges[0],
      {
        ...base.challenges[1],
        solution:
          "/linkHub 한 페이지와 Link 테이블, 관리 화면을 만들었습니다. 프로필엔 이 페이지 하나만 걸고, 링크는 총학생회가 직접 넣고 뺍니다. 2026-11-14 기준 9개가 걸려 있습니다(9월 4일에는 11개)."
      },
      base.challenges[2],
      base.challenges[3],
      {
        title: "4월에 덧붙여 만든 개편을 9월에 다시 만들었습니다",
        problem:
          "2026년 4월의 디자인 개편(PR #36)은 기존 CSS 를 그대로 둔 채 polish.css 한 파일을 1,483줄 얹는 방식이었습니다. 9월에 다시 열어 보니 그 파일에 !important 가 95개 있었습니다. 화면 하나를 고치려면 원래 규칙과 덧붙인 규칙을 둘 다 읽어야 했습니다.",
        solution:
          "색·간격·서체를 variables.css 의 토큰으로 모으고, 버튼·카드·표 같은 공용 부품을 common.css 에 다시 썼습니다. 쓰는 규칙은 src/styles/DESIGN.md 에 적었습니다. 홈, 서브 페이지, 관리자 화면의 JSX 구조와 CSS 를 그 위에서 다시 만들었고, API 호출·라우트·인증 로직은 바꾸지 않았습니다.\n\npolish.css 는 import 를 끊었습니다.",
        code: {
          filename: "src/App.js",
          lines: [
            "import './styles/variables.css';",
            "import './styles/common.css';",
            "// polish.css 는 더 이상 import 하지 않습니다"
          ]
        },
        evidence: {
          status: "전후 코드로 확인",
          note: "프론트 PR #37(2026-09-21, 87파일 +11,771/−8,046, CI build-and-deploy 통과).",
          url: "https://github.com/ajouchong-dev/ajouchong-web/pull/37"
        }
      },
      {
        title: "화면을 다 바꾸면서 기능이 달라지면 안 됐습니다",
        problem:
          "겉모습을 바꾸다가 API 호출이나 확인 대화상자가 하나 빠져도 알려 줄 사람이 없었습니다.",
        solution:
          "개편 전과 후의 코드에서 API 호출 목록을 뽑아 주소와 메서드를 대조했습니다. 변경은 없었고, 첫 화면 「지금 총학」 띠가 쓰는 조회 2개(/api/rental/items, /api/agora)만 늘었습니다. 라우트 목록과 confirm/alert 20개, withCredentials 21곳, FormData 필드 5개도 개수가 같았습니다.",
        evidence: {
          status: "본인 확인 기록",
          note: "PR #37 본문의 「기능 동일성 확인」과 「테스트」 항목입니다.",
          url: "https://github.com/ajouchong-dev/ajouchong-web/pull/37"
        }
      },
      {
        title: "첫 화면 배너 사진이 원본 그대로 올라가 있었습니다",
        problem:
          "첫 화면 배너에 쓰는 사진 6장이 촬영 원본 그대로였습니다. 가장 큰 것은 한 장에 18.8MB 였고 6장을 더하면 61MB 였습니다.",
        solution:
          "긴 변 1920px 의 웹용 사본을 public/images/banner/web 에 따로 두고 화면은 사본을 쓰게 했습니다. 원본은 지우지 않았습니다. 사본 6장의 합은 2.7MB 입니다."
      },
      {
        title: "링크허브는 등록한 순서대로만 보였습니다",
        problem:
          "링크 목록은 등록한 시각 순서로만 내려왔습니다(findAllByOrderByCreatedAtAsc). 총학생회가 순서를 정할 방법이 없었습니다.",
        solution:
          "Link 에 display_order 칸을 두고, PATCH /api/admin/link/order 가 받은 ID 순서대로 0부터 다시 매기게 했습니다. 목록에 없는 링크는 기존 상대 순서를 유지한 채 뒤에 붙습니다. 순서 값이 없는 기존 행은 COALESCE 로 맨 뒤에 두고 생성일 순을 지킵니다.\n\n관리 화면에서는 행을 끌거나 ↑↓ 버튼으로 옮긴 뒤 「순서 저장」을 눌러야 반영됩니다. 공개 링크허브 페이지는 API 가 순서대로 내려주므로 코드를 바꾸지 않았습니다.",
        code: {
          filename: "LinkService.java · 2026.09.22",
          highlightLines: [6, 7],
          lines: [
            "@Transactional",
            "public List<LinkResponseDto> reorderLinks(LinkOrderRequestDto requestDto) {",
            "  List<Link> all = linkRepository.findAllOrdered();",
            "  ...",
            "  int order = 0;",
            "  for (Long id : requestDto.getOrderedIds()) {",
            "    Link link = byId.remove(id);",
            '    if (link == null) throw new IllegalArgumentException("링크를 찾을 수 없습니다. ID: " + id);',
            "    link.setDisplayOrder(order++);",
            "  }",
            "  // 목록에 없는 링크는 기존 순서대로 뒤에 붙인다",
            "}"
          ]
        },
        evidence: {
          status: "코드로 확인",
          note: "백엔드 커밋(2026-09-22, 7파일 +83/−2)과 프론트 PR #38(2파일 +237/−5).",
          url: "https://github.com/ajouchong-dev/ajouchong/commit/bf6f1d8aba8dfb3ee36271a1fea841ceea8f03b4"
        }
      }
    ],
    resultScreens: [
      {
        title: "ajou-council/welfare/rental",
        kind: "bars",
        bars: [
          {l: "은박 돗자리", p: 92, v: "44/48"},
          {l: "매트 돗자리", p: 69, v: "24/35"},
          {l: "우산", p: 50, v: "2/4"},
          {l: "의자", p: 38, v: "8/21"}
        ]
      },
      base.resultScreens[1]
    ],
    metrics: [
      base.metrics[0],
      base.metrics[1],
      base.metrics[2],
      {
        n: "10 · 9",
        l: "대여 품목 · 링크 (실서비스)",
        sub: "품목 10종 124개 · 링크허브 9개"
      },
      base.metrics[4],
      base.metrics[5],
      {
        n: "87파일",
        l: "9월 전면 리디자인 PR #37",
        sub: "+11,771 / −8,046줄 · 2026.09.21 머지",
        source: "ajouchong-dev/ajouchong-web PR #37 · CI build-and-deploy 통과"
      },
      base.metrics[7]
    ],
    metricsNote:
      "검색 셋은 Google Search Console · 2025.05~2026.08(16개월) · 검색 유입 기준입니다.",
    detail: {
      ...base.detail,
      compareTags: ["2025", "2026.09"],
      intro: {
        show: "아주대 총학생회 공식 사이트입니다. 2025년에는 프론트 3인 중 한 명으로 화면 일부를 맡았고, 2026년 4월부터는 혼자서 화면·Spring Boot API·배포를 맡아 대여 수량 조회, 링크허브, 관리자 화면을 만들고 9월에 프론트 전체를 다시 디자인했습니다.",
        bold: "2026년 4월부터는 혼자서 화면·Spring Boot API·배포를 맡아 대여 수량 조회, 링크허브, 관리자 화면을 만들고 9월에 프론트 전체를 다시 디자인했습니다.",
        more: [
          "학생은 총학생회실에 오기 전에 물품이 남았는지 보고, 총학생회는 수량·링크·공지·의견을 관리 화면에서 직접 고칩니다. 수량 하나 바꾸는 데 개발자 배포가 필요하던 구조를 없앤 것이 핵심입니다.",
          "프론트 PR #35(대여 UX) · #36(4월 디자인 개편) · #37(9월 전면 리디자인, 87파일) · #38(링크 순서), 백엔드 PR #69·#70(RentalItem·RentalRecord·Link 엔티티와 API).",
          "효과는 검색 노출로 쟀습니다(Google Search Console, 2026년 8월까지).",
          "Docker · Nginx · CI 구성 자체는 팀원이 만든 것입니다. 맡은 뒤에 배포용 Dockerfile 과 EC2 compose(JVM 힙 384MB · 자동 재시작)를 손봤습니다."
        ]
      },
      highlights: [
        base.detail!.highlights![0],
        {
          show: "2026년 9월에 프론트 전체를 다시 디자인했습니다(PR #37, 87파일 +11,771/−8,046줄). 4월에 덧붙여 넣은 polish.css(!important 95개)를 빼고 토큰과 공용 컴포넌트로 다시 썼습니다.",
          more: "API 호출·라우트·인증 로직은 바꾸지 않았고, 개편 전후의 호출 목록을 대조해 주소와 메서드가 그대로임을 확인했습니다."
        },
        {
          show: "인스타 프로필엔 링크를 몇 개밖에 못 걸어서 /linkHub 한 페이지와 Link 테이블·관리 화면을 만들었습니다. 9월에는 노출 순서를 저장하는 API 를 붙였습니다.",
          more: "링크는 총학생회가 직접 넣고 빼고 순서를 정합니다. 2026-11-14 기준 9개가 걸려 있습니다."
        }
      ],
      summaries: {
        arch: "React 18(CRA) · Spring Boot 3 + JPA + PostgreSQL · JWT · 팀이 만든 Docker + Nginx 구성 위에서 2026 부터 단독 운영.",
        code: "RentalService 의 수량 검증과 SecurityConfig 의 관리자 경로 규칙.",
        proc: "2025 팀원으로 화면 일부 → 2026.04 대여 API · 화면 · 첫 개편 → 2026.09 전면 리디자인 · 링크 순서."
      },
      problems: {
        items: [
          {
            t: "물품이 남았는지 몰랐습니다",
            d: "학생은 총학생회실까지 와서야 없다는 말을 들었습니다."
          },
          {
            t: "링크를 걸 자리가 모자랐습니다",
            d: "인스타 프로필에는 링크를 몇 개밖에 못 걸어 접수 폼과 공모전 링크가 매번 밀려났습니다."
          },
          {
            t: "고치려면 개발자가 필요했습니다",
            d: "수량 하나, 링크 하나 바꾸는 데도 개발자가 배포해야 했습니다."
          }
        ]
      },
      compact: {
        tiles: [0, 3, 6, 4],
        compareFirst: true,
        compareTitle: "2025 → 2026.09 · 모바일 첫 화면",
        summaries: {
          retro:
            "수량 하나 바꾸는 데 개발자 배포가 필요하던 것을 관리 화면으로 없앴습니다."
        }
      },
      scenes: [
        {
          place: "field",
          kind: "timeline",
          title: TL_TITLE,
          unit: "date",
          from: "2026-04-01",
          to: "2026-10-01",
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
              label: "프론트 #36 4월 디자인 개편",
              href: "https://github.com/ajouchong-dev/ajouchong-web/pull/36",
              detail: "+2,547줄 · 그중 polish.css 1,483줄을 기존 CSS 위에 얹음",
              tone: "warn"
            },
            {
              at: "2026-06-30",
              label: "서버 용량 관리",
              href: "https://github.com/ajouchong-dev/ajouchong/commit/3a5ae244",
              detail:
                "EC2 compose 에 JVM 힙 384MB 상한 · 자동 재시작 · SQL 로그 끔",
              tone: "muted"
            },
            {
              at: "2026-09-21",
              label: "프론트 #37 전면 리디자인",
              href: "https://github.com/ajouchong-dev/ajouchong-web/pull/37",
              detail:
                "87파일 +11,771/−8,046줄 · 토큰과 공용 컴포넌트로 다시 씀",
              tone: "ok"
            },
            {
              at: "2026-09-22",
              label: "링크 순서 · 프론트 #38 · 백엔드 커밋",
              href: "https://github.com/ajouchong-dev/ajouchong-web/pull/38",
              detail:
                "PATCH /api/admin/link/order · 관리 화면에서 끌어서 순서 저장",
              tone: "ok"
            }
          ]
        },
        {
          place: "result",
          kind: "bars",
          title: GSC_TITLE,
          rows: [
            {label: "2025년 5~8월", value: 2290, text: "2,290", tone: "muted"},
            {label: "2026년 5~8월", value: 5392, text: "5,392", tone: "ok"}
          ],
          note: "월별로는 5월 839 → 2,371, 6월 571 → 1,233, 7월 490 → 843, 8월 390 → 945 입니다. 계절 차이를 줄이려고 같은 달끼리 맞댔습니다.",
          source:
            "Google Search Console 내보내기 487일치(2025-05-01~2026-08-30) · 검색 유입만"
        },
        {
          place: "trouble",
          kind: "bars",
          title: BANNER_TITLE,
          unit: "MB",
          rows: [
            {label: "원본 6장", value: 61.4, text: "61.4MB", tone: "muted"},
            {label: "웹용 사본 6장", value: 2.7, text: "2.7MB", tone: "ok"}
          ],
          note: "원본은 지우지 않았고 화면만 사본을 씁니다."
        }
      ],
      story: {
        toc: {
          problem: "문제",
          field: "혼자 맡은 뒤",
          ledger: "문제 · 해결 · 확인",
          built: "지금 화면",
          verify: "검색 유입",
          result: "결과와 남은 것"
        },
        problem: {
          eyebrow: "01 · 문제",
          title:
            "사이트는 있었지만, 수량 하나 바꾸는 데도 개발자가 배포해야 했습니다.",
          em: "개발자가 배포해야 했습니다",
          lead: "2025년에는 프론트 3인 중 한 명으로 화면 일부(대여사업 검색창, 정책집, 조직도)를 맡았습니다. 2026년 4월에 혼자 맡았을 때 아래 세 가지가 남아 있었습니다.",
          after:
            "학생이 방문 전에 수량을 확인하고, 총학생회 담당자가 관리자 화면에서 수량·링크·의견을 직접 관리하도록 설계했습니다."
        },
        field: {
          eyebrow: "02 · 혼자 맡은 뒤",
          title: "2026년 4월부터 화면, API, 배포를 혼자 맡았습니다.",
          em: "혼자",
          lead: "4월 한 달에 대여 API 와 화면, 첫 디자인 개편을 넣었고, 9월에 프론트 전체를 다시 디자인했습니다.",
          facts: [
            {n: "7건", l: "2026년에 머지한 PR · 프론트 5, 백엔드 2"},
            {n: "46개", l: ""},
            {n: "16개", l: ""}
          ],
          scene: TL_TITLE
        },
        ledger: {
          eyebrow: "03 · 한 일",
          title:
            "4월에는 총학생회가 수량과 링크를 직접 고치게 했고, 9월에는 제가 덧붙여 만든 화면을 다시 만들었습니다.",
          em: "제가 덧붙여 만든 화면을 다시 만들었습니다",
          lead: "",
          allLabel: "여덟 가지 전부",
          groups: [
            {
              label: "2026년 4월 · 혼자 맡은 첫 달과 그 뒤 운영",
              short: "4월",
              rows: [
                {
                  problem: {
                    t: "수량이 어디에도 안 보였습니다",
                    d: "학생이 총학생회실까지 와서야 「없다」는 말을 들었습니다."
                  },
                  fix: {
                    t: "서버가 수량을 지키게 했습니다",
                    d: "RentalItem 에 총량·현재 수량을 두고 관리자 −/+ 를 PATCH /quantity 로 반영합니다. 0 미만·총량 초과는 서버가 거부합니다."
                  },
                  check: {
                    big: "10종",
                    d: "124개가 사이트에 올라 있습니다."
                  },
                  challenge: 0
                },
                {
                  problem: {
                    t: "인스타 프로필에 링크를 다 못 걸었습니다",
                    d: "새 폼이 생길 때마다 이전 링크를 내려야 했습니다."
                  },
                  fix: {
                    t: "/linkHub 한 페이지로 모았습니다",
                    d: "Link 테이블과 관리 화면을 만들어 프로필엔 이 페이지 하나만 겁니다."
                  },
                  check: {
                    big: "9개",
                    d: "2026-11-14 에 걸려 있는 링크 수입니다. 9월 4일에는 11개였습니다. 총학생회가 직접 넣고 뺍니다."
                  },
                  challenge: 1
                },
                {
                  problem: {
                    t: "관리자 규칙이 한 경로만 막고 있었습니다",
                    d: "ADMIN 규칙이 /api/admin 한 경로에만 걸려, 그 아래에 새로 만드는 관리자 API 에는 권한 검사가 걸리지 않았습니다."
                  },
                  fix: {
                    t: "/api/admin/** 로 넓혔습니다",
                    d: "수량 조정이 쓰는 PATCH 를 CORS 에 넣고, JWT 필터가 OPTIONS 와 로그인 경로를 건너뛰게 했습니다."
                  },
                  check: {
                    t: "관리 API 가 ADMIN 뒤로",
                    d: "대여·제휴·회의록 관리 API 가 ADMIN 권한 뒤에 놓였습니다."
                  },
                  challenge: 2
                },
                {
                  problem: {
                    t: "배포도 혼자 맡게 됐습니다",
                    d: "Docker · Nginx · CI 는 팀원이 만든 구성이었습니다."
                  },
                  fix: {
                    t: "서버 설정을 손봤습니다",
                    d: "배포용 Dockerfile 에서 빌드 단계를 빼고, EC2 compose 에 JVM 힙 384MB 상한과 자동 재시작을 넣고, 운영 SQL 로그를 껐습니다."
                  },
                  check: {
                    t: "운영 구성에 반영",
                    d: "빌드 단계 없는 배포 이미지와 힙 384MB 상한, 자동 재시작으로 운영하고 있습니다."
                  },
                  challenge: 3
                }
              ]
            },
            {
              label: "2026년 9월 · 프론트 전면 리디자인",
              short: "9월",
              intro:
                "4월의 디자인 개편은 기존 CSS 위에 파일 하나를 얹는 방식이었습니다. 9월에 그것을 걷어내고 다시 만들었습니다.",
              rows: [
                {
                  problem: {
                    t: "4월 개편은 기존 CSS 위에 덧붙인 것이었습니다",
                    d: "제가 넣은 polish.css 는 기존 CSS 위에 1,483줄을 얹은 파일이었고 !important 가 95개였습니다."
                  },
                  fix: {
                    t: "토큰과 공용 컴포넌트로 다시 썼습니다",
                    d: "variables.css 와 common.css 를 다시 쓰고 규칙을 DESIGN.md 에 적었습니다. polish.css 는 import 를 끊었습니다."
                  },
                  check: {
                    big: "87파일",
                    d: "+11,771 / −8,046줄. CI 의 build-and-deploy 를 통과했습니다."
                  },
                  challenge: 4
                },
                {
                  problem: {
                    t: "기능이 달라지면 안 됐습니다",
                    d: "87개 파일을 한 번에 고쳤습니다."
                  },
                  fix: {
                    t: "개편 전후의 호출 목록을 대조했습니다",
                    d: "API 주소와 메서드, 라우트, confirm/alert, withCredentials, FormData 필드 수를 세어 비교했습니다."
                  },
                  check: {
                    t: "주소·메서드 변경 없음",
                    d: "「지금 총학」 띠가 쓰는 조회 2개만 늘었습니다."
                  },
                  challenge: 5
                },
                {
                  problem: {
                    t: "배너 사진이 원본 그대로였습니다",
                    d: "첫 화면 배너 6장을 더하면 61MB 였습니다."
                  },
                  fix: {
                    t: "1920px 웹용 사본을 따로 뒀습니다",
                    d: "public/images/banner/web 에 사본 6장을 넣고 화면은 사본을 씁니다. 원본은 그대로 뒀습니다."
                  },
                  check: {
                    big: "2.7MB",
                    d: "사본 6장의 합입니다."
                  },
                  scene: BANNER_TITLE,
                  challenge: 6
                },
                {
                  problem: {
                    t: "링크가 등록한 순서대로만 보였습니다",
                    d: "총학생회가 순서를 정할 방법이 없었습니다."
                  },
                  fix: {
                    t: "순서를 저장하는 API 와 화면을 붙였습니다",
                    d: "PATCH /api/admin/link/order 가 받은 ID 순서대로 다시 매깁니다. 관리 화면에서 끌거나 화살표로 옮긴 뒤 저장합니다."
                  },
                  check: {
                    t: "기존 링크는 뒤로",
                    d: "순서 값이 없는 기존 행은 맨 뒤에 두고 생성일 순을 지킵니다."
                  },
                  challenge: 7
                }
              ]
            }
          ]
        },
        built: {
          eyebrow: "04 · 지금 화면",
          title: "지금 ajouchong.com 에 올라가 있는 화면입니다.",
          em: "지금",
          lead: "2026년 11월 14일에 실서비스를 그대로 찍었습니다.",
          wide: true,
          items: [
            {
              t: "첫 화면",
              d: "화면 폭을 채우는 사진 위에 AU:SUM 워드마크와 「공지사항 보기」「물품 대여하기」 두 버튼을 둡니다.",
              r: "배너 사진은 1920px 웹용 사본을 씁니다.",
              src: `${V3}/home-desktop.webp`
            },
            {
              t: "지금 총학",
              d: "최근 공지, 대여 가능 물품 수, Q&A 안내를 사진 바로 아래 한 줄에 세웁니다.",
              r: "값은 API 에서 읽습니다. 이 띠 때문에 조회 2개가 늘었습니다.",
              src: `${V3}/home-band.webp`
            },
            {
              t: "대여사업",
              d: "품목마다 남은 수량을 막대로 보여 주고, 「대여 가능만 보기」로 거릅니다.",
              r: "학생은 조회만 하고 대여·반납 기록은 창구에서 관리자가 남깁니다.",
              src: `${V3}/rental-cards.webp`
            },
            {
              t: "링크허브",
              d: "접수 창구와 신청 링크를 카드로 모읍니다. 순서는 관리 화면에서 정합니다.",
              r: "2026-11-14 기준 9개가 걸려 있습니다.",
              src: `${V3}/linkhub.webp`
            }
          ]
        },
        verify: {
          eyebrow: "05 · 검색 유입",
          title: "같은 달끼리 놓으면 검색 노출이 2.35배였습니다.",
          em: "2.35배",
          tag: "검색 유입 기준 · 2026년 8월까지",
          lead: "Google Search Console 로 2025년과 2026년의 5~8월을 맞대 봤습니다. 늘어난 이유를 개편만으로 돌릴 수는 없습니다(행사, 외부 링크, 검색 알고리즘).",
          scene: GSC_TITLE,
          boxes: [
            {
              n: "491",
              d: "2026년 5~8월의 검색 클릭입니다. 2025년 같은 달은 321이었습니다."
            },
            {
              n: "9.1",
              unit: "%",
              d: "같은 기간 CTR 입니다. 14.0% 에서 내려갔습니다."
            }
          ]
        },
        result: {
          eyebrow: "06 · 결과와 남은 것",
          title:
            "학생은 오기 전에 수량을 보고, 총학생회는 관리 화면에서 직접 고칩니다.",
          em: "직접 고칩니다",
          shots: [
            {
              src: `${V3}/m-home-tall.webp`,
              t: "모바일 첫 화면",
              d: "공지와 대여로 가는 버튼 둘이 먼저 보입니다."
            },
            {
              src: `${V3}/m-rental-cards.webp`,
              t: "모바일 대여사업",
              d: "품목 카드마다 남은 수량이 적혀 있습니다."
            },
            {
              src: `${V3}/m-linkhub.webp`,
              t: "모바일 링크허브",
              d: "인스타그램 프로필에서 들어오는 화면입니다."
            }
          ],
          left: [
            "대여 신청은 아직 창구에서 받습니다. 온라인은 수량 조회까지입니다.",
            "접근성(대비 · 포커스) 보강이 다음 일입니다."
          ]
        }
      }
    },
    kpt: {
      keep: base.kpt.keep,
      problem: [
        "대여 신청은 아직 창구에서 받습니다 (온라인은 수량 조회까지)",
        "접근성(대비·포커스)은 여전히 보강이 필요합니다"
      ],
      try: [
        "2026 · 수량·링크·공지·피드백을 총학생회가 관리 화면에서 직접 고칩니다",
        "2026 · 수량 검증을 서버에 뒀습니다. 화면의 −/+ 는 우회할 수 있어도 API 의 거부는 못 합니다",
        "2026 · 넘겨받은 설정은 먼저 읽습니다. 관리자 규칙이 한 경로만 막고 있던 것을 그렇게 찾았습니다",
        "2026 · 4월에 덧붙여 만든 개편을 9월에 토큰과 공용 컴포넌트로 다시 만들었습니다",
        "2026 · 화면을 다 바꿀 때 API 호출 목록을 전후로 대조해 기능이 그대로인지 확인했습니다"
      ]
    },
    learning:
      "2025년에는 프론트엔드 일부를 담당했고, 2026년에는 화면·API·배포를 혼자 맡았습니다. 학생의 대여 수량 조회와 총학생회의 직접 관리 기능을 만들었고, 9월에는 4월에 덧붙여 만든 디자인을 토큰 기반으로 다시 만들었습니다."
  };
}
