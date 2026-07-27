import type {RichProject} from "./shared";

// MyWave 원페이지(면접관 뷰)용 raw 데이터.
// 마을 뷰(MyWaveRichSection)는 별도의 인터랙티브 렌더러라, 원페이지에서 쓰려고
// 동일 내용을 RichProject 형태로 정리한 것. (이미지/수치/링크 슬롯은 나중에 채움)
export const MYWAVE_BRIEF: RichProject = {
  tagline: "PERSONAL FINANCE · WEB APP (컨셉/설계)",
  heroImage: {label: "MyWave 대시보드 — 자산 흐름 화면", ratio: "16/9"},
  problemShot: {label: "거래를 표로만 나열하던 기존 방식", ratio: "4/3"},
  gallery: [
    {label: "자산 흐름 대시보드", ratio: "16/10"},
    {label: "목표 관리 화면", ratio: "16/10"},
    {label: "월간 리포트", ratio: "16/10"}
  ],
  tldr: [
    {k: "무엇을", v: "소비·투자를 하나의 ‘흐름’으로 보는 개인 자산 관리 웹앱"},
    {k: "왜", v: "기존 앱은 거래를 나열만 함 → 누적 흐름 + 목표선으로 재해석"},
    {
      k: "결과",
      v: "거래를 누적 흐름 + 목표선으로 보여주는 대시보드 UX 설계·구현"
    },
    {k: "내 역할", v: "기획 · UX 설계 · 프론트엔드 전체 (1인 프로젝트)"}
  ],
  demo: {},
  meta: [
    {label: "기간", value: "[확인필요] 개인 프로젝트"},
    {label: "팀", value: "개인 프로젝트 (기획·디자인·개발 1인)"},
    {label: "역할", value: "서비스 기획 · UX 설계 · 프론트엔드 전체"},
    {
      label: "스택",
      value: "React · TypeScript · Recharts · Zustand · Tailwind"
    },
    {label: "성격", value: "개인 컨셉·설계 프로젝트 (공개 리포 없음)"}
  ],
  heroScreen: {
    title: "mywave.app/dashboard",
    kind: "dashboard",
    kpi: [
      {l: "총 자산", v: "₩12.4M"},
      {l: "이번 달", v: "+8.2%"},
      {l: "목표", v: "64%"}
    ],
    chart: [12, 18, 15, 26, 22, 34, 30, 42, 48, 44, 58, 64]
  },
  impact: [
    {n: "4", l: "핵심 화면(대시보드·흐름·목표·리포트)"},
    {n: "1인", l: "기획·UX·프론트"},
    {n: "흐름+목표선", l: "핵심 UX 컨셉"}
  ],
  features: [
    {
      t: "자산 흐름 시각화",
      d: "거래를 누적 area 차트로 — 흐름과 목표선을 한 화면에"
    },
    {t: "목표 기반 저축", d: "목표별 진행률·남은 금액 자동 계산"},
    {t: "소비 패턴 분석", d: "카테고리별 비중과 변화 추이"},
    {t: "월간 리포트", d: "저축률·투자 비중을 월 단위로 요약"}
  ],
  problem:
    "기존 가계부·금융 앱은 거래 내역을 단순 표로 나열한다. 숫자는 많지만 정작 ‘내 돈이 어디로 흘러가는지’, ‘목표까지 얼마나 왔는지’는 한눈에 보이지 않았다.",
  research: {
    quotes: [
      {
        q: "가계부는 쓰는데, 막상 이번 달에 내가 잘 하고 있는 건지 한눈에 안 보인다.",
        who: "직접 겪은 불편"
      },
      {
        q: "투자와 소비가 다른 앱에 흩어져 있어 전체 그림이 안 그려진다.",
        who: "문제 정의"
      }
    ]
  },
  hypothesis:
    "거래를 누적 흐름 + 목표선으로 바꿔 보여주면, 사용자가 자신의 재정 상태를 즉시 직관적으로 이해할 것이다.",
  process: [
    {t: "리서치", d: "문제 정의"},
    {t: "IA·기획", d: "화면 흐름"},
    {t: "프로토타입", d: "핵심 UX"},
    {t: "개발", d: "프론트 구현"},
    {t: "정리", d: "회고"}
  ],
  architecture: [
    {name: "UI Layer", desc: "React 컴포넌트 · 대시보드/차트/폼", tag: "View"},
    {
      name: "State",
      desc: "Zustand store · 거래·목표·필터 전역 상태",
      tag: "Store"
    },
    {
      name: "Domain Logic",
      desc: "useCashFlow · goalProgress · 통화 정규화",
      tag: "Hooks"
    },
    {name: "Data Source", desc: "REST API ↔ localStorage 캐시", tag: "I/O"}
  ],
  decisions: [
    {
      area: "차트",
      pick: "Recharts",
      why: "선언적 API로 빠른 구현, SVG 기반 커스터마이즈",
      alt: "visx(러닝커브 ↑), D3(과한 복잡도)"
    },
    {
      area: "상태관리",
      pick: "Zustand",
      why: "보일러플레이트 최소, 선택적 구독으로 리렌더 최소화",
      alt: "Redux(무거움), Context(전역 리렌더)"
    },
    {
      area: "스타일",
      pick: "Tailwind",
      why: "반응형을 빠르게, 디자인 일관성 유지",
      alt: "CSS Modules, styled-components"
    },
    {
      area: "데이터",
      pick: "API + localStorage",
      why: "MVP는 로컬로 빠르게, 이후 API 전환 용이하게 추상화",
      alt: "처음부터 풀백엔드(속도 ↓)"
    }
  ],
  coreCode: [
    {
      filename: "useCashFlow.ts",
      caption: "거래 배열 → 일별 누적 잔액 시계열로 변환",
      highlightLines: [7, 8, 9],
      lines: [
        "// 거래 목록을 누적 흐름(시계열)으로 가공하는 훅",
        "export function useCashFlow(txns: Transaction[]) {",
        "  return useMemo(() => {",
        "    let running = 0;",
        "    return txns",
        "      .sort((a, b) => a.date - b.date)",
        "      .map((tx) => {",
        "        running += normalizeToKRW(tx);",
        "        return { date: tx.date, balance: running };",
        "      });",
        "  }, [txns]);",
        "}"
      ]
    },
    {
      filename: "FlowChart.tsx",
      caption: "누적 흐름 위에 목표선을 겹쳐 ‘현재 위치’를 시각화",
      lines: [
        "<AreaChart data={flow}>",
        "  <defs>",
        "    <linearGradient id='wave'>",
        "      <stop offset='0%' stopColor={accent} stopOpacity={0.4} />",
        "      <stop offset='100%' stopOpacity={0} />",
        "    </linearGradient>",
        "  </defs>",
        "  <Area dataKey='balance' stroke={accent} fill='url(#wave)' />",
        "  <ReferenceLine y={goal} label='목표' strokeDasharray='4 4' />",
        "</AreaChart>"
      ]
    }
  ],
  work: [
    {
      g: "기획·UX",
      items: ["문제 정의와 핵심 UX 컨셉 도출", "정보 구조(IA)와 화면 흐름 설계"]
    },
    {
      g: "프론트엔드",
      items: ["흐름 차트·목표·리포트 화면 구현", "반응형 + PWA 대응"]
    },
    {g: "데이터", items: ["거래→흐름 변환 로직", "Zustand 전역 상태 설계"]},
    {g: "성능", items: ["차트 리렌더 최적화", "수천 건 거래 집계 처리"]}
  ],
  challenges: [
    {
      title: "실시간 갱신마다 차트가 깜빡였다",
      problem:
        "거래가 추가될 때 차트 데이터 배열이 매번 새 참조로 만들어져, Recharts가 전체를 리마운트하며 애니메이션이 끊기고 깜빡였다.",
      solution:
        "흐름 데이터를 useMemo로 안정화하고, 차트의 key를 데이터 길이가 아닌 의미 단위로 고정해 불필요한 리마운트를 제거했다.",
      code: {
        filename: "useStableFlow.ts",
        caption: "참조 안정화로 리마운트 제거 → 부드러운 갱신",
        highlightLines: [3],
        lines: [
          "const flow = useCashFlow(txns);",
          "// 길이가 같으면 동일 참조 유지 → 차트 리마운트 방지",
          "const stable = useMemo(() => flow, [flow.length, flow.at(-1)?.balance]);",
          "return <FlowChart data={stable} key='cashflow' />;"
        ]
      }
    },
    {
      title: "통화가 섞인 거래의 합산",
      problem:
        "해외 결제 등으로 거래 통화가 섞여 있어 단순 합산 시 금액이 왜곡됐다.",
      solution:
        "거래 ‘시점’의 환율로 KRW에 정규화한 뒤 누적했다. 환율은 거래에 스냅샷으로 저장해 과거 값이 흔들리지 않게 했다.",
      code: {
        filename: "currency.ts",
        caption: "거래 시점 환율로 KRW 정규화 (스냅샷 보존)",
        lines: [
          "export function normalizeToKRW(tx: Transaction) {",
          "  if (tx.currency === 'KRW') return tx.amount;",
          "  // 거래 당시 환율 스냅샷 사용 (현재 환율 X)",
          "  return Math.round(tx.amount * tx.rateAtTime);",
          "}"
        ]
      }
    }
  ],
  tech: [
    "React",
    "TypeScript",
    "Recharts",
    "Zustand",
    "TailwindCSS",
    "Vite",
    "PWA"
  ],
  resultScreens: [],
  metrics: [
    {n: "4", l: "핵심 화면"},
    {n: "흐름+목표선", l: "핵심 UX 컨셉"},
    {n: "1인", l: "기획·UX·프론트"},
    {n: "React·Recharts", l: "구현 스택"}
  ],
  kpt: {
    keep: [
      "문제→가설→UX 컨셉으로 이어지는 설계 흐름",
      "데이터를 ‘흐름·목표’ 맥락으로 재구성한 관점"
    ],
    problem: ["초기 데이터 모델을 너무 일찍 고정", "테스트 커버리지 부족"],
    try: ["백엔드 연동해 실데이터 검증", "온보딩 A/B 테스트"]
  },
  learning:
    "데이터를 ‘보여주는 것’과 ‘읽히게 하는 것’은 다르다는 걸 체감했다. 같은 거래 데이터라도 흐름·목표라는 맥락을 입히자 이해가 완전히 달라졌고, 기술 선택은 ‘멋짐’이 아니라 ‘이 문제에 맞는가’로 판단해야 한다는 걸 배웠다."
};
