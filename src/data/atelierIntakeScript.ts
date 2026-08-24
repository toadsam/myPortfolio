/**
 * 의뢰 공방 접수 1층 — NPC 릴레이 설문 대본. **단일 출처.**
 *
 * 2D 데스크(`CommissionDesk`)와 3D 공방(`/atelier`, 마을 해치)이 같은 파일을 읽는다.
 * 대사·선택지·예시·가산 키워드·채우는 슬롯이 전부 여기 있고, 화면은 이걸 그리기만 한다.
 * 전체 설계와 문항 근거는 `docs/ATELIER_INTAKE_SCRIPT.md`.
 *
 * 규칙 셋:
 * - 필수는 Q1·Q2 뿐. 나머지는 "나중에요" 로 건너뛴다(접수 문턱을 올리지 않는다).
 * - 제작 슬롯(who_updates 등)은 여기서 **묻지 않는다.** 접수 뒤 심화 문답의 몫이다.
 * - 가격은 여기 적지 않는다. 선택지는 **기능 키워드**만 들고, 숫자는 서버 가격표에서 온다.
 */

import type {CommissionDraft, CommissionSpeaker} from "@/types/live";

export type PreviewKind =
  | "site-corp"
  | "site-landing"
  | "site-booking"
  | "site-shop"
  | "site-portfolio"
  | "site-app"
  | "pages-1"
  | "pages-5"
  | "pages-10"
  | "pages-many"
  | "goal-contact"
  | "goal-search"
  | "goal-trust"
  | "goal-action"
  | "feat-form"
  | "feat-map"
  | "feat-booking"
  | "feat-board"
  | "feat-login"
  | "feat-pay"
  | "feat-admin"
  | "feat-i18n"
  | "feat-chat"
  | "feat-ai"
  | "tone-minimal"
  | "tone-warm"
  | "tone-luxury"
  | "tone-pop"
  | "motion-none"
  | "motion-hover"
  | "motion-scroll"
  | "motion-rich"
  | "device-phone"
  | "device-both"
  | "device-desktop";

/** 선택지가 draft 에 주는 변화. 전부 선택적 — 없는 건 건드리지 않는다. */
export interface ChoiceEffect {
  site_type?: string;
  /** "preset" = 유형별 기본 5장, 배열 = 그대로, "free" = 손님이 적은 목록 */
  pages?: string[] | "preset" | "preset+5";
  /** features 에 추가할 기능 키워드(서버 가격표의 키와 같아야 가산이 붙는다) */
  features?: string[];
  tone?: string;
  budget_hint?: string;
  deadline_hint?: string;
  /** summary 뒤에 덧붙일 한 줄 */
  note?: string;
  /** 제작 슬롯(문자열 필드)에 그대로 적기 — 2층 공통 슬롯의 선택지가 쓴다 */
  set?: Partial<
    Record<
      | "who_updates"
      | "content_owner"
      | "success_metric"
      | "existing_assets"
      | "reference_notes"
      | "decision_maker",
      string
    >
  >;
  /** dislikes 목록에 추가 */
  dislikes?: string[];
}

/** 반응 대사가 볼 수 있는 것. 숫자는 전부 원 단위. */
export interface ReactionContext {
  draft: CommissionDraft;
  estimate: {
    min: number;
    max: number;
    weeksMin: number;
    weeksMax: number;
  } | null;
  /** 가장 비싼 기능을 뺐을 때의 견적 — 예산 조정 제안에 쓴다 */
  withoutMostExpensive: {
    feature: string;
    min: number;
    max: number;
  } | null;
  /** 이번에 고른 선택지들(복수 선택이면 여러 개) */
  chosen: IntakeChoice[];
  fmt: (won: number) => string;
}

export interface Intrusion {
  speaker: CommissionSpeaker;
  line: string;
}

export interface IntakeChoice {
  id: string;
  /** 내 대사 — 선택지 버튼에 그대로 보인다 */
  label: string;
  preview?: PreviewKind;
  effect?: ChoiceEffect;
  /** 가격 꼬리표를 만들 기능 키워드(effect.features 와 보통 같다). 없으면 꼬리표 없음 */
  priceKeyword?: string;
  /** site_type 선택지면 기준선을 꼬리표로 보여준다 */
  baseOf?: string;
  /** "직접 말할게요" — text 는 LLM 슬롯 추출, raw 는 원문 그대로(LLM 0회), list/links 는 파싱만 */
  free?: "text" | "list" | "links" | "raw";
  /** 예산·일정 비교용 (원 / 주). 선택지에만 붙는다 */
  budgetRange?: [number, number];
  deadlineWeeks?: number;
}

export interface IntakeQuestion {
  id: string;
  speaker: CommissionSpeaker;
  required?: boolean;
  multi?: boolean;
  prompt: string | ((ctx: ReactionContext) => string);
  choices: IntakeChoice[];
  /** 고른 뒤 NPC 가 하는 말 */
  reaction: (ctx: ReactionContext) => string;
  /** 다른 식구가 한마디 끼어드는 조건 */
  intrusion?: (ctx: ReactionContext) => Intrusion | null;
  /** 문항을 건너뛸 때 NPC 가 하는 말 */
  skipLine?: string;
  /** raw 자유 입력이 적을 draft 문자열 필드(2층 슬롯 문항) */
  slotField?: string;
  /** 이 문항의 답을 어디에 저장하는가 — 2층 릴레이가 onAnswered 에서 읽는다 */
  store?: {kind: "slot" | "branch" | "ai"; key: string};
}

export type IntakeStep =
  | {
      kind: "enter";
      speaker: CommissionSpeaker;
      line: string | ((ctx: ReactionContext) => string);
    }
  | {kind: "question"; question: IntakeQuestion}
  | {
      kind: "handoff";
      from: CommissionSpeaker;
      to: CommissionSpeaker;
      line: string;
    }
  /** 대본이 여기서 멈추고 비동기로 스텝을 더 받아 온다(2층 AI 맞춤 질문) */
  | {kind: "gate"; speaker: CommissionSpeaker; line: string}
  | {kind: "wrapup"; speaker: CommissionSpeaker};

export const SPEAKER_NPC_ID: Record<CommissionSpeaker, string> = {
  intake: "atelier-intake-npc",
  planner: "atelier-planner-npc",
  designer: "atelier-designer-npc",
  frontend: "atelier-frontend-npc",
  backend: "atelier-backend-npc"
};

export const SPEAKER_NAME: Record<CommissionSpeaker, string> = {
  intake: "도안",
  planner: "체리",
  designer: "먹지",
  frontend: "리코",
  backend: "굴뚝"
};

export const SPEAKER_ROLE: Record<CommissionSpeaker, string> = {
  intake: "접수",
  planner: "기획",
  designer: "디자인",
  frontend: "프론트엔드",
  backend: "백엔드"
};

/** 유형별 기본 5장 — Q2 "대여섯 장" 프리셋. 서버는 5장까지 가산하지 않는다. */
export const PAGE_PRESETS: Record<string, string[]> = {
  기업소개: ["메인", "회사소개", "서비스", "오시는 길", "문의"],
  랜딩: ["메인"],
  예약: ["메인", "소개", "예약", "이용안내", "문의"],
  쇼핑몰: ["메인", "상품목록", "상품상세", "장바구니", "주문"],
  포트폴리오: ["메인", "작업물", "소개", "연락"],
  웹서비스: ["메인", "로그인", "대시보드", "설정", "안내"]
};

const EXTRA_PAGES = ["소식", "자주 묻는 질문", "갤러리", "팀 소개", "이용약관"];

export function presetPages(siteType: string, plusFive = false): string[] {
  const base = PAGE_PRESETS[siteType] ?? [
    "메인",
    "소개",
    "안내",
    "문의",
    "오시는 길"
  ];
  return plusFive ? [...base, ...EXTRA_PAGES] : base;
}

const DIRECT: IntakeChoice = {
  id: "free",
  label: "직접 말할게요",
  free: "text"
};

/** 건너뛰기 버튼 — 필수 문항(Q1·Q2)에는 안 보인다. */
export const LATER_LABEL = "나중에요 / 잘 모르겠어요";

/* ─────────────────────────── 대본 ─────────────────────────── */

const Q1: IntakeQuestion = {
  id: "q1",
  speaker: "intake",
  required: true,
  prompt:
    "처음이시죠? 어려운 말 안 써요 — 제가 하나씩 여쭤볼 테니 비슷한 걸 고르시면 돼요. 중간에 궁금한 건 아무 때나 물어보시고요.\n먼저, 어떤 사이트를 생각하고 계세요?",
  choices: [
    {
      id: "corp",
      label: "가게나 회사를 소개하는 홈페이지요",
      preview: "site-corp",
      effect: {site_type: "기업소개"},
      baseOf: "기업소개"
    },
    {
      id: "landing",
      label: "한 장짜리 홍보 페이지면 돼요",
      preview: "site-landing",
      effect: {site_type: "랜딩"},
      baseOf: "랜딩"
    },
    {
      id: "booking",
      label: "예약이나 신청을 받고 싶어요",
      preview: "site-booking",
      effect: {site_type: "예약"},
      baseOf: "예약"
    },
    {
      id: "shop",
      label: "물건을 팔 거예요",
      preview: "site-shop",
      effect: {site_type: "쇼핑몰"},
      baseOf: "쇼핑몰"
    },
    {
      id: "portfolio",
      label: "제 작업물을 보여주는 포트폴리오요",
      preview: "site-portfolio",
      effect: {site_type: "포트폴리오"},
      baseOf: "포트폴리오"
    },
    {
      id: "app",
      label: "회원이 쓰는 서비스예요",
      preview: "site-app",
      effect: {site_type: "웹서비스"},
      baseOf: "웹서비스"
    },
    DIRECT
  ],
  reaction: ({draft, estimate, fmt}) => {
    const type = draft.site_type || "홈페이지";
    const range = estimate
      ? ` 보통 ${fmt(estimate.min)}에서 ${fmt(
          estimate.max
        )} 원 사이에서 시작하는데,`
      : "";
    const lines: Record<string, string> = {
      기업소개: `소개 사이트요. 제일 많이 오시는 의뢰예요.${range} 지금부터 고르시는 것에 따라 위아래로 움직여요. 저 위 숫자 보이시죠? 저게 따라다닐 거예요.`,
      랜딩: `한 장짜리요. 제일 가볍고 빨라요.${range} 대신 한 장에 뭘 넣을지가 전부라 그걸 잘 정해야 해요.`,
      예약: `예약이요. 달력이랑 시간 고르는 화면이 들어가겠네요.${range} 예약이 들어오면 어디로 알려드릴지도 나중에 여쭐게요.`,
      쇼핑몰: `판매하시는군요. 결제가 붙어서 제일 꼼꼼해야 하는 유형이에요.${range} 상품이 몇 개쯤인지는 접수 뒤에 자세히 여쭐게요.`,
      포트폴리오: `포트폴리오요. 작업물이 주인공이라 사진이 제일 중요해요.${range} 사진만 준비되면 금방 나와요.`,
      웹서비스: `회원이 쓰는 서비스요. 로그인 뒤에 뭐가 보이는지가 핵심이에요.${range} 이건 식구들이 궁금한 게 많을 거예요.`
    };
    return (
      lines[draft.site_type] ??
      `${type} 쪽이네요. 일단 그렇게 적어 두고, 얘기 들으면서 맞춰 갈게요.${
        range ? range.replace(",", ".") : ""
      }`
    );
  }
};

const Q2: IntakeQuestion = {
  id: "q2",
  speaker: "intake",
  required: true,
  prompt: "페이지는 어느 정도 규모로 생각하세요?",
  choices: [
    {
      id: "one",
      label: "한 장에 다 넣어도 돼요",
      preview: "pages-1",
      effect: {pages: ["메인"]}
    },
    {
      id: "five",
      label: "대여섯 장 정도요 (소개·메뉴·오시는 길·문의…)",
      preview: "pages-5",
      effect: {pages: "preset"}
    },
    {
      id: "ten",
      label: "열 장 안팎이요",
      preview: "pages-10",
      effect: {pages: "preset+5"}
    },
    {
      id: "many",
      label: "훨씬 많아요 / 직접 적을게요",
      preview: "pages-many",
      free: "list"
    }
  ],
  reaction: ({draft}) => {
    const n = draft.pages.length;
    if (n <= 1)
      return "한 장이면 스크롤 하나로 다 보여드리는 거네요. 가볍고 좋아요.";
    if (n <= 6)
      return `${draft.pages.join(
        ", "
      )} — 이 정도 뼈대면 딱 표준이에요. 다섯 장까지는 따로 돈이 안 붙어요.`;
    return `${n}장이면 다섯 장 넘는 만큼은 장당 조금씩 붙어요. 대신 나중에 줄여도 되니까 일단 다 적어 두세요.`;
  }
};

const Q3: IntakeQuestion = {
  id: "q3",
  speaker: "planner",
  prompt:
    "사이트가 생기고 나서, 뭐가 달라지길 제일 바라세요? 이게 정해져야 화면 순서가 정해져요.",
  choices: [
    {
      id: "contact",
      label: "전화나 문의가 늘었으면 좋겠어요",
      preview: "goal-contact",
      effect: {note: "목표: 문의 증가"}
    },
    {
      id: "search",
      label: "검색하면 우리가 나왔으면 해요",
      preview: "goal-search",
      effect: {note: "목표: 검색 노출"}
    },
    {
      id: "trust",
      label: "믿을 만해 보였으면 해요 (명함 대신)",
      preview: "goal-trust",
      effect: {note: "목표: 신뢰감"}
    },
    {
      id: "action",
      label: "직접 뭔가를 하게 하고 싶어요 (예약·구매·가입)",
      preview: "goal-action",
      effect: {note: "목표: 행동 유도"}
    },
    DIRECT
  ],
  skipLine: "괜찮아요, 만들면서 같이 찾아도 돼요.",
  reaction: ({chosen}) => {
    const id = chosen[0]?.id;
    const lines: Record<string, string> = {
      contact:
        "그럼 모든 페이지에서 문의로 가는 길이 보여야겠네요. 이건 돈이 드는 게 아니라 구조의 문제라 제가 기억해 둘게요.",
      search:
        "검색이요. 그건 예쁜 거랑 별개로 글이 좀 필요해요. 어떤 글을 넣을지는 접수 뒤에 같이 정해요.",
      trust:
        "명함 대신이요, 좋아요. 그럼 화려한 것보다 정돈된 게 중요하겠네요. 먹지한테 그렇게 전할게요.",
      action:
        "직접 하게 하는 거요. 그럼 버튼 하나가 주인공이에요. 그 버튼까지 가는 길을 제가 그릴게요."
    };
    return lines[id ?? ""] ?? "알겠어요, 그 방향으로 적어 둘게요.";
  }
};

const Q4: IntakeQuestion = {
  id: "q4",
  speaker: "planner",
  multi: true,
  prompt:
    "꼭 필요한 기능을 전부 골라 주세요. 여러 개 고르셔도 되고, 없으면 그냥 넘어가셔도 돼요.",
  choices: [
    {
      id: "form",
      label: "문의 폼 (이름·연락처·내용)",
      preview: "feat-form",
      effect: {features: ["문의 폼"]}
    },
    {
      id: "map",
      label: "지도·오시는 길",
      preview: "feat-map",
      effect: {features: ["지도"]},
      priceKeyword: "지도"
    },
    {
      id: "booking",
      label: "예약·신청 받기",
      preview: "feat-booking",
      effect: {features: ["예약"]},
      priceKeyword: "예약"
    },
    {
      id: "board",
      label: "게시판·공지·블로그",
      preview: "feat-board",
      effect: {features: ["게시판"]},
      priceKeyword: "게시판"
    },
    {
      id: "login",
      label: "회원가입·로그인",
      preview: "feat-login",
      effect: {features: ["로그인"]},
      priceKeyword: "로그인"
    },
    {
      id: "pay",
      label: "결제",
      preview: "feat-pay",
      effect: {features: ["결제"]},
      priceKeyword: "결제"
    },
    {
      id: "admin",
      label: "내가 직접 글·사진 고치는 관리자 화면",
      preview: "feat-admin",
      effect: {features: ["관리자"]},
      priceKeyword: "관리자"
    },
    {
      id: "i18n",
      label: "외국어 버전",
      preview: "feat-i18n",
      effect: {features: ["다국어"]},
      priceKeyword: "다국어"
    },
    {
      id: "chat",
      label: "실시간 채팅·상담",
      preview: "feat-chat",
      effect: {features: ["채팅"]},
      priceKeyword: "채팅"
    },
    {
      id: "ai",
      label: "AI 기능 (챗봇·추천)",
      preview: "feat-ai",
      effect: {features: ["ai"]},
      priceKeyword: "ai"
    }
  ],
  skipLine: "그럼 소개 중심이네요. 제일 빨리 나오는 유형이에요.",
  reaction: ({chosen}) => {
    if (!chosen.length)
      return "그럼 소개 중심이네요. 제일 빨리 나오는 유형이에요.";
    if (chosen.length >= 3)
      return "욕심이 많으시네요(웃음). 다 되긴 하는데, 순서를 정하면 1차 견적이 확 내려가요. 그건 접수되고 나서 같이 정해요.";
    return `${chosen
      .map(c => c.label.split(" (")[0])
      .join("이랑 ")} — 적었어요. 이 정도면 구조가 단단해요.`;
  },
  intrusion: ({chosen}) => {
    const heavy = chosen.some(c => c.id === "pay" || c.id === "login");
    if (!heavy) return null;
    return {
      speaker: "backend",
      line: "…결제나 로그인이 들어가면 저한테 먼저 물어보셔야 해요. 카드사 심사랑 보안 때문에 기간이 제일 많이 늘어나는 게 그거라. 접수되면 제가 따로 여쭐게요."
    };
  }
};

const Q5: IntakeQuestion = {
  id: "q5",
  speaker: "designer",
  prompt: "어떤 인상을 주고 싶으세요? 카드 보시면서 '이거다' 싶은 걸로요.",
  choices: [
    {
      id: "minimal",
      label: "깔끔하고 믿음직하게",
      preview: "tone-minimal",
      effect: {tone: "미니멀·신뢰감"}
    },
    {
      id: "warm",
      label: "따뜻하고 친근하게",
      preview: "tone-warm",
      effect: {tone: "따뜻함·친근함"}
    },
    {
      id: "luxury",
      label: "세련되고 고급스럽게",
      preview: "tone-luxury",
      effect: {tone: "고급·절제"}
    },
    {
      id: "pop",
      label: "밝고 통통 튀게",
      preview: "tone-pop",
      effect: {tone: "활기·젊음"}
    },
    {
      id: "refs",
      label: "참고 사이트를 보여 드릴게요"
    },
    DIRECT
  ],
  skipLine:
    "그럼 제가 체리한테 들은 걸로 먼저 한 장 그려 볼게요. 보고 고치는 게 더 빨라요.",
  reaction: ({chosen}) => {
    const id = chosen[0]?.id;
    const lines: Record<string, string> = {
      minimal:
        "깔끔하게요. 흰 바탕에 남색을 조금, 글자는 반듯한 걸로. 믿음직하다는 건 결국 정돈돼 보인다는 거라서요.",
      warm: "카페나 공방 손님들이 많이 고르세요. 저는 크림색 바탕에 주황을 조금만 쓸 것 같아요. 사진이 따뜻하면 더 좋고요 — 사진 얘기는 접수되고 나서 따로 여쭐게요.",
      luxury:
        "고급스럽게요. 그건 색을 많이 쓰는 게 아니라 비우는 거예요. 검정이랑 금색 조금, 여백 많이.",
      pop: "통통 튀게요! 원색이랑 큰 글자. 대신 너무 많이 튀면 촌스러워지니까 튀는 데를 한 군데만 정할 거예요.",
      refs: "좋아요, 링크는 잠시 뒤에 리코가 받을 거예요. 저도 같이 볼게요. 일단 움직임만 하나 더 여쭐게요."
    };
    return lines[id ?? ""] ?? "알겠어요, 그 느낌으로 기준을 잡아 볼게요.";
  }
};

const Q6: IntakeQuestion = {
  id: "q6",
  speaker: "designer",
  prompt: "화면이 얼마나 움직였으면 하세요? 카드가 실제로 그 정도로 움직여요.",
  choices: [
    {
      id: "none",
      label: "안 움직여도 돼요. 빠르고 단순하게",
      preview: "motion-none"
    },
    {
      id: "hover",
      label: "살짝만 — 버튼에 손 올리면 반응하는 정도",
      preview: "motion-hover",
      effect: {features: ["기본연출"]}
    },
    {
      id: "scroll",
      label: "스크롤하면 내용이 스르륵 나타나게",
      preview: "motion-scroll",
      effect: {features: ["스크롤연출"]},
      priceKeyword: "스크롤연출"
    },
    {
      id: "rich",
      label: "풍성하게 — 3D나 인터랙티브한 장면도",
      preview: "motion-rich",
      effect: {features: ["인터랙티브"]},
      priceKeyword: "인터랙티브"
    }
  ],
  skipLine: "그럼 기본만 살짝 넣을게요. 나중에 더 얹을 수 있어요.",
  reaction: ({chosen}) => {
    const id = chosen[0]?.id;
    const lines: Record<string, string> = {
      none: "단순하게요. 그게 제일 빨리 뜨고 제일 안 질려요. 좋은 선택이에요.",
      hover:
        "살짝만요. 손 올리면 반응하는 정도는 기본으로 들어가요. 돈 안 붙어요.",
      scroll:
        "스르륵이요. 요즘 제일 많이 하는 거예요. 읽는 리듬이 생겨서 글이 많아도 안 지루해요.",
      rich: "(눈 반짝) 이건 제가 제일 좋아하는 주문인데, 비싸요. 그리고 폰에서 무거워질 수 있어서 리코가 한 소리 할 거예요. 그래도 하실 거면 저는 찬성."
    };
    return lines[id ?? ""] ?? "알겠어요.";
  },
  intrusion: ({chosen}) =>
    chosen[0]?.id === "rich"
      ? {
          speaker: "frontend",
          line: "저 들었어요! 3D는 폰에서 다르게 보여 드려야 해요. 그건 제가 할게요."
        }
      : null
};

const Q7: IntakeQuestion = {
  id: "q7",
  speaker: "frontend",
  prompt:
    "참고하고 싶은 사이트가 있어요? 말로 열 번 듣는 것보다 링크 하나가 나아요.",
  choices: [
    {
      id: "have",
      label: "있어요, 주소 적을게요",
      free: "links"
    },
    {
      id: "rival",
      label: "경쟁사 사이트가 있는데 그것보단 낫게요",
      free: "links"
    },
    {
      id: "none",
      label: "없어요, 알아서 해주세요"
    }
  ],
  skipLine: "오케이, 나중에 생각나면 알려주세요.",
  reaction: ({chosen, draft}) => {
    const id = chosen[0]?.id;
    if (id === "none")
      return "알겠어요! 그럼 먹지가 잡은 분위기로 제가 먼저 그려 볼게요.";
    if (draft.references.length)
      return `고마워요, 이런 게 제일 도움 돼요. ${draft.references.length}개 적어 뒀어요. 어디가 좋았는지는 접수 뒤에 여쭐게요.`;
    return "고마워요, 적어 뒀어요. 어디가 좋았는지는 접수 뒤에 여쭐게요.";
  }
};

const Q8: IntakeQuestion = {
  id: "q8",
  speaker: "frontend",
  prompt: "손님들이 주로 어디서 볼까요?",
  choices: [
    {
      id: "phone",
      label: "거의 폰이요 (인스타·카톡에서 들어옴)",
      preview: "device-phone",
      effect: {features: ["모바일 우선"]}
    },
    {
      id: "both",
      label: "반반이요",
      preview: "device-both"
    },
    {
      id: "desktop",
      label: "주로 컴퓨터요 (회사·관공서)",
      preview: "device-desktop",
      effect: {features: ["데스크톱 우선"]}
    }
  ],
  skipLine: "그럼 둘 다 똑같이 잘 보이게 할게요.",
  reaction: ({chosen}) => {
    const id = chosen[0]?.id;
    const lines: Record<string, string> = {
      phone:
        "그럼 폰 화면을 먼저 그리고 컴퓨터는 넓혀요. 버튼은 엄지로 누르기 좋게 크게. 이건 돈이 아니라 순서 문제라 견적엔 안 붙어요.",
      both: "반반이면 둘 다 똑같이 신경 써요. 기본이에요, 돈 안 붙어요.",
      desktop:
        "컴퓨터 위주요. 그럼 넓은 화면에 정보를 많이 보여줄 수 있어요. 표 같은 것도 편하고요."
    };
    return lines[id ?? ""] ?? "알겠어요.";
  }
};

const BUDGET_CHOICES: IntakeChoice[] = [
  {
    id: "b1",
    label: "100만 원 아래",
    budgetRange: [0, 1_000_000],
    effect: {budget_hint: "100만원 이하"}
  },
  {
    id: "b2",
    label: "100~300만 원",
    budgetRange: [1_000_000, 3_000_000],
    effect: {budget_hint: "100~300만원"}
  },
  {
    id: "b3",
    label: "300~600만 원",
    budgetRange: [3_000_000, 6_000_000],
    effect: {budget_hint: "300~600만원"}
  },
  {
    id: "b4",
    label: "600만 원 이상",
    budgetRange: [6_000_000, 99_000_000],
    effect: {budget_hint: "600만원 이상"}
  },
  {id: "b0", label: "아직 모르겠어요"},
  {...DIRECT, label: "직접 적을게요"}
];

const Q9: IntakeQuestion = {
  id: "q9",
  speaker: "intake",
  prompt: ({estimate, fmt}) =>
    estimate
      ? `다시 오셨네요. 식구들 얘기 다 모았어요. 지금까지 고르신 걸로 참고 견적이 ${fmt(
          estimate.min
        )}~${fmt(estimate.max)} 원, ${estimate.weeksMin}~${
          estimate.weeksMax
        }주 정도로 나와요.\n마지막 두 가지만요 — 생각하시는 예산대가 있으세요?`
      : "다시 오셨네요. 식구들 얘기 다 모았어요. 마지막 두 가지만요 — 생각하시는 예산대가 있으세요?",
  choices: BUDGET_CHOICES,
  skipLine: "괜찮아요. 견적 보시고 나중에 말씀하셔도 돼요.",
  reaction: ({chosen, estimate, withoutMostExpensive, fmt}) => {
    const range = chosen[0]?.budgetRange;
    if (!range || !estimate) return "알겠어요, 적어 둘게요.";
    const [lo, hi] = range;
    if (hi < estimate.min) {
      if (withoutMostExpensive) {
        return `솔직히 말씀드리면 지금 고르신 대로면 조금 넘어요. 그런데 방법이 있어요 — '${
          withoutMostExpensive.feature
        }'를 2차로 미루면 ${fmt(withoutMostExpensive.min)}~${fmt(
          withoutMostExpensive.max
        )} 원 정도로 들어와요. 접수하시고 체리랑 순서를 정하면 돼요.`;
      }
      return "솔직히 말씀드리면 지금 고르신 대로면 조금 넘어요. 페이지를 줄이거나 연출을 빼면 맞출 수 있어요. 접수하시고 같이 조정해요.";
    }
    if (lo > estimate.max)
      return "여유가 있으시네요. 그렇다고 비싸게 부르진 않아요(웃음). 대신 연출이나 관리자 화면 같은 걸 넣을 여지가 있다고 적어 둘게요.";
    return "딱 맞네요. 그 안에서 잘 맞춰 볼게요.";
  }
};

const Q10: IntakeQuestion = {
  id: "q10",
  speaker: "intake",
  prompt: "언제까지 필요하세요?",
  choices: [
    {
      id: "d1",
      label: "급해요, 한 달 안에",
      deadlineWeeks: 4,
      effect: {deadline_hint: "1개월 이내"}
    },
    {
      id: "d2",
      label: "두세 달 안에",
      deadlineWeeks: 12,
      effect: {deadline_hint: "2~3개월"}
    },
    {
      id: "d3",
      label: "여유 있어요",
      deadlineWeeks: 52,
      effect: {deadline_hint: "여유 있음"}
    },
    {id: "d4", label: "날짜가 있어요 (직접 적기)", free: "text"}
  ],
  skipLine: "알겠어요. 일정은 정해지면 알려주세요.",
  reaction: ({chosen, estimate}) => {
    const weeks = chosen[0]?.deadlineWeeks;
    if (!weeks || !estimate) return "적어 뒀어요.";
    if (weeks < estimate.weeksMin)
      return "그 기간이면 범위를 좀 줄여야 해요. 접수는 되고, 뭘 먼저 할지 체리가 정리해서 연락드릴 거예요.";
    if (weeks < estimate.weeksMax)
      return "빠듯하지만 돼요. 접수되면 순서를 먼저 정할게요.";
    return "여유 있네요. 그럼 급하게 안 하고 꼼꼼하게 갈 수 있어요.";
  }
};

export const INTAKE_SCRIPT: IntakeStep[] = [
  {
    kind: "enter",
    speaker: "intake",
    line: "어서 오세요. 여기는 마을 지하 의뢰 공방이에요. 저는 접수를 맡은 도안이라고 해요."
  },
  {kind: "question", question: Q1},
  {kind: "question", question: Q2},
  {
    kind: "handoff",
    from: "intake",
    to: "planner",
    line: "좋아요, 뼈대는 잡혔어요. 이제 '이 사이트로 뭘 하고 싶은지'는 기획 담당이 훨씬 잘 물어봐요. 체리, 손님 모셔 갈게요."
  },
  {
    kind: "enter",
    speaker: "planner",
    line: ({draft}) =>
      `기획 맡은 체리예요. 도안한테 들었어요, ${
        draft.site_type || "홈페이지"
      } 만드신다고요. 저는 '예쁜지'보다 '이 화면에서 손님이 뭘 하길 원하는지'를 먼저 정해요. 그게 정해져야 나머지가 안 흔들리거든요.`
  },
  {kind: "question", question: Q3},
  {kind: "question", question: Q4},
  {
    kind: "handoff",
    from: "planner",
    to: "designer",
    line: "구조는 이 정도면 됐어요. 이제 어떻게 보일지는 먹지가 물어볼 거예요. 먹지, 손님 부탁해."
  },
  {
    kind: "enter",
    speaker: "designer",
    line: "디자인 맡은 먹지예요. 체리한테 대충 들었어요. '예쁘게 해주세요'는 저한테 제일 어려운 주문이에요 — 그래서 누구에게 어떤 인상을 주고 싶은지부터 고를게요."
  },
  {kind: "question", question: Q5},
  {kind: "question", question: Q6},
  {
    kind: "handoff",
    from: "designer",
    to: "frontend",
    line: "분위기는 잡혔어요. 실제로 어떻게 구현될지는 리코한테 들어 보세요."
  },
  {
    kind: "enter",
    speaker: "frontend",
    line: ({draft}) =>
      `프론트 맡은 리코예요! 먹지가 ${
        draft.tone ? `'${draft.tone}'` : "그"
      } 느낌이라고 했죠? 저는 그걸 진짜 돌아가는 화면으로 옮겨요. 두 개만 여쭐게요.`
  },
  {kind: "question", question: Q7},
  {kind: "question", question: Q8},
  {
    kind: "handoff",
    from: "frontend",
    to: "intake",
    line: "제 쪽은 끝! 마지막으로 예산이랑 일정은 도안이 받을 거예요. 접수대로 돌아가실게요."
  },
  {kind: "question", question: Q9},
  {kind: "question", question: Q10},
  {kind: "wrapup", speaker: "intake"}
];

export const INTAKE_QUESTIONS: IntakeQuestion[] = INTAKE_SCRIPT.flatMap(step =>
  step.kind === "question" ? [step.question] : []
);

/** 마무리 — 요약 낭독. */
export function wrapupLine(draft: CommissionDraft): string {
  const parts: string[] = [];
  if (draft.site_type) parts.push(`${draft.site_type}`);
  if (draft.pages.length) parts.push(`${draft.pages.length}장`);
  if (draft.features.length) parts.push(`기능은 ${draft.features.join(", ")}`);
  if (draft.tone) parts.push(`분위기는 ${draft.tone}`);
  if (draft.budget_hint) parts.push(`예산 ${draft.budget_hint}`);
  if (draft.deadline_hint) parts.push(`일정 ${draft.deadline_hint}`);
  return (
    `정리해 드릴게요. ${parts.join(" · ")}.\n` +
    "빠진 거나 덧붙일 말 있으세요? 없으면 바로 접수할게요. 옆에 견적이랑 접수 칸이 열려 있어요."
  );
}
