/**
 * 의뢰 공방 심화 문답(2층) 대본 — **단일 출처.** 계획: `docs/ATELIER_DEPTH_SCRIPT.md`.
 *
 * 1층(`atelierIntakeScript.ts`)과 같은 형식·같은 엔진(`useDialogueFlow`)을 쓰되,
 * 대본을 정적으로 두지 않고 **track 응답을 보고 조립**한다:
 * 이미 답한 문항은 빼고(공통 슬롯은 draft 값, 분기는 track.branch, AI 질문은 answer),
 * 남은 것만 잇는다 — 창을 닫았다 와도 처음부터 다시 묻지 않는 게 이 화면의 존재 이유다.
 *
 * 세 겹: ① 공통 7슬롯(백엔드 `_DEPTH_SLOTS` 와 같은 필드 — 여기선 카드를 입힌다)
 *        ② 종류별 분기 문항(site_type 이 고른다) ③ AI 맞춤 질문(gate 스텝에서 서버가 준다).
 * 답은 견적을 바꾸지 않는다 — 가격 꼬리표도 없다. 새 기능이 드러나면 features 에
 * 누적만 하고 "견적은 담당자가 다시 안내"가 규칙이다.
 */

import type {
  AiQuestion,
  CommissionSpeaker,
  CommissionTrack
} from "@/types/live";

import type {
  IntakeChoice,
  IntakeQuestion,
  IntakeStep
} from "./atelierIntakeScript";

const RAW: IntakeChoice = {id: "free", label: "직접 적을게요", free: "raw"};

function pick(
  id: string,
  label: string,
  extra?: Partial<IntakeChoice>
): IntakeChoice {
  return {id, label, ...extra};
}

/* ─────────────────────── ① 공통 7슬롯 — 카드 입히기 ─────────────────────── */
/* 필드·취지는 backend `_DEPTH_SLOTS` 그대로. 성격상 자유 입력이 맞는 것
   (기존 자산·참고 이유)은 카드 없이 자유 입력만 연다. */

interface SlotSpec {
  field: string;
  speaker: CommissionSpeaker;
  required: boolean;
  prompt: string;
  choices: IntakeChoice[];
  reaction: string;
  multi?: boolean;
}

const SLOT_SPECS: SlotSpec[] = [
  {
    field: "who_updates",
    speaker: "intake",
    required: true,
    prompt:
      "사이트를 만든 뒤에 내용(사진·글·가격 같은 것)은 누가 고치게 될까요? 이 답 하나로 만드는 방식이 꽤 달라져요.",
    choices: [
      pick("self", "제가 직접 고치고 싶어요", {
        effect: {set: {who_updates: "본인이 직접 수정 (관리 화면 필요)"}}
      }),
      pick("rare", "자주 안 바뀌어요. 바뀔 때만 요청할게요", {
        effect: {
          set: {who_updates: "변경 잦지 않음, 필요할 때 제작자에게 요청"}
        }
      }),
      pick("staff", "직원이 여럿이서 고칠 거예요", {
        effect: {
          set: {who_updates: "직원 여러 명이 수정 (권한 구분 필요할 수 있음)"}
        }
      }),
      RAW
    ],
    reaction:
      "적었어요. 직접 고치는 쪽이면 관리 화면을, 요청하는 쪽이면 가볍게 — 여기서 갈려요."
  },
  {
    field: "content_owner",
    speaker: "designer",
    required: true,
    prompt: "들어갈 사진과 글은 준비된 게 있으실까요? 사진이 반이에요, 진짜로.",
    choices: [
      pick("ready", "사진도 글도 어느 정도 있어요", {
        effect: {set: {content_owner: "사진·글 보유, 전달 예정"}}
      }),
      pick("photo-only", "사진은 있는데 글은 못 썼어요", {
        effect: {set: {content_owner: "사진 보유, 글은 제작 측 도움 필요"}}
      }),
      pick("none", "둘 다 없어요. 도움이 필요해요", {
        effect: {
          set: {content_owner: "사진·글 모두 준비 필요 (촬영/작성 도움)"}
        }
      }),
      RAW
    ],
    reaction: "알겠어요. 없는 쪽은 저희가 기준을 잡아 드리면 돼요, 걱정 마세요."
  },
  {
    field: "success_metric",
    speaker: "planner",
    required: true,
    prompt:
      "사이트가 생기고 나서 뭐가 달라지면 '잘 만들었다'고 하실 것 같아요?",
    choices: [
      pick("calls", "문의·전화가 늘면요", {
        effect: {set: {success_metric: "문의/전화 증가"}}
      }),
      pick("search", "검색해서 찾아오면요", {
        effect: {set: {success_metric: "검색 유입"}}
      }),
      pick("show", "보여드릴 곳이 생기는 것만으로 충분해요", {
        effect: {set: {success_metric: "소개 창구 확보"}}
      }),
      pick("action", "예약·구매가 실제로 일어나면요", {
        effect: {set: {success_metric: "예약/구매 전환"}}
      }),
      RAW
    ],
    reaction: "그걸 기준으로 화면 순서를 정할게요. 이 답이 사실 제일 중요해요."
  },
  {
    field: "existing_assets",
    speaker: "intake",
    required: true,
    prompt:
      "이미 가진 게 있으세요? 도메인 주소, 예전 사이트, 인스타 계정 같은 것들이요. 있는 대로 적어 주세요.",
    choices: [
      pick("none", "아무것도 없어요. 처음이에요", {
        effect: {set: {existing_assets: "없음 (처음)"}}
      }),
      RAW
    ],
    reaction: "적었어요. 있는 건 살리고, 없는 건 저희가 잡아 드릴게요."
  },
  {
    field: "dislikes",
    speaker: "designer",
    required: false,
    multi: true,
    prompt:
      "반대로, 이건 싫다 하는 게 있으세요? 피해야 할 걸 알면 헛돌지 않아요.",
    choices: [
      pick("flashy", "번쩍거리고 정신없는 거", {
        effect: {dislikes: ["번쩍거리고 정신없는 연출"]}
      }),
      pick("popup", "팝업·광고 느낌", {effect: {dislikes: ["팝업/광고 느낌"]}}),
      pick("dark", "어두운 분위기", {effect: {dislikes: ["어두운 분위기"]}}),
      pick("text", "글이 빽빽한 거", {
        effect: {dislikes: ["글이 빽빽한 화면"]}
      }),
      pick("old", "촌스러운 옛날 디자인", {effect: {dislikes: ["구식 디자인"]}})
    ],
    reaction: "기억할게요. 싫다고 하신 건 시안에서 처음부터 뺄 거예요."
  },
  {
    field: "reference_notes",
    speaker: "designer",
    required: false,
    prompt:
      "참고 사이트를 주셨다면(또는 지금 떠오른 게 있다면) — 그 사이트의 **어떤 점**이 좋았어요? 색인지, 정돈된 느낌인지, 사진인지.",
    choices: [RAW],
    reaction: "그 '왜'가 제일 값져요. 겉만 베끼는 걸 막아 주거든요."
  },
  {
    field: "decision_maker",
    speaker: "planner",
    required: false,
    prompt:
      "시안이 나오면 최종 결정은 누가 하세요? 확인받아야 할 분이 있는지 궁금해요.",
    choices: [
      pick("me", "제가 결정해요", {effect: {set: {decision_maker: "본인"}}}),
      pick("together", "동업자/가족과 같이요", {
        effect: {set: {decision_maker: "공동 결정 (동업자/가족)"}}
      }),
      pick("boss", "대표님/윗분 확인이 필요해요", {
        effect: {set: {decision_maker: "상급자 승인 필요"}}
      }),
      RAW
    ],
    reaction: "알겠어요. 결정하실 분이 보기 편한 형태로 정리해 드릴게요."
  }
];

/* ─────────────────────── ② 종류별 분기 문항 ─────────────────────── */

interface BranchSpec {
  id: string;
  speaker: CommissionSpeaker;
  prompt: string;
  choices: IntakeChoice[];
  reaction: string;
  /** 이 답이 기능을 드러내면 features 에 누적 (견적은 관리자 몫) */
  featureOn?: {choiceId: string; feature: string};
}

const BRANCH_TREES: Record<string, BranchSpec[]> = {
  쇼핑몰: [
    {
      id: "S1",
      speaker: "backend",
      prompt: "상품이 대략 몇 가지나 되나요? 정확하지 않아도 돼요.",
      choices: [
        pick("s", "10개 미만"),
        pick("m", "10~50개"),
        pick("l", "50~200개"),
        pick("xl", "200개 이상"),
        RAW
      ],
      reaction: "…적었습니다. 개수에 따라 상품을 올리는 방식이 달라져요."
    },
    {
      id: "S2",
      speaker: "backend",
      prompt: "사이즈나 색 같은 옵션이 있나요?",
      choices: [
        pick("none", "없어요, 단품이에요"),
        pick("one", "한 종류만 있어요 (예: 사이즈)"),
        pick("combo", "조합이에요 (사이즈×색)"),
        RAW
      ],
      reaction: "옵션 조합은 재고 관리가 같이 붙는 얘기라, 미리 알아야 했어요."
    },
    {
      id: "S3",
      speaker: "backend",
      prompt: "결제는 어떤 걸 받고 싶으세요?",
      choices: [
        pick("card", "카드·간편결제면 돼요"),
        pick("bank", "무통장입금도 받고 싶어요"),
        pick("global", "해외 결제도 필요해요"),
        RAW
      ],
      reaction:
        "…해외 결제는 심사가 따로 있어요. 그건 접수된 내용에 적어 두겠습니다."
    },
    {
      id: "S4",
      speaker: "backend",
      prompt: "배송이랑 반품은 어떻게 하실 계획이세요?",
      choices: [
        pick("self", "제가 직접 보내요"),
        pick("api", "택배사 연동까지 있으면 좋겠어요"),
        pick("tbd", "아직 정하지 못했어요"),
        RAW
      ],
      reaction: "알겠습니다. 반품 규정 문구는 나중에 저희가 초안을 드릴게요."
    },
    {
      id: "S5",
      speaker: "planner",
      prompt: "재고가 떨어지면 사이트가 알아야 하나요?",
      choices: [
        pick("soldout", "품절 표시만 되면 돼요"),
        pick("stock", "수량까지 관리하고 싶어요"),
        pick("no", "필요 없어요"),
        RAW
      ],
      reaction:
        "적었어요. 수량 관리는 관리 화면 쪽 일이 늘어나는 항목이라 표시해 둘게요."
    },
    {
      id: "S6",
      speaker: "designer",
      prompt: "상품 사진은 어떤 상태예요?",
      choices: [
        pick("have", "촬영해 둔 게 있어요"),
        pick("need", "찍어야 해요"),
        pick("supplier", "공급사 사진을 쓸 거예요"),
        RAW
      ],
      reaction: "쇼핑몰은 사진이 매출이에요. 상태 봐서 보정 기준을 잡을게요."
    }
  ],
  예약: [
    {
      id: "B1",
      speaker: "backend",
      prompt: "예약은 어떤 단위인가요?",
      choices: [
        pick("date", "날짜만 고르면 돼요"),
        pick("time", "날짜와 시간대까지요"),
        pick("seat", "인원이나 좌석까지 골라요"),
        RAW
      ],
      reaction: "…단위가 달력 모양을 정해요. 적었습니다."
    },
    {
      id: "B2",
      speaker: "backend",
      prompt: "같은 시간에 몇 팀까지 받으세요?",
      choices: [
        pick("one", "한 팀만요"),
        pick("cap", "여러 팀인데 정원이 있어요"),
        pick("free", "제한 없어요"),
        RAW
      ],
      reaction: "정원이 있으면 마감 표시가 필요하죠. 기억해 둘게요."
    },
    {
      id: "B3",
      speaker: "planner",
      prompt: "예약이 들어오면 어떻게 알고 싶으세요?",
      choices: [
        pick("sms", "문자나 카톡으로요"),
        pick("mail", "이메일이면 돼요"),
        pick("panel", "관리 화면에서 확인할게요"),
        RAW
      ],
      reaction:
        "알림 방식 적었어요. 문자 쪽은 발송 비용이 조금 드는 것도 나중에 안내드릴게요."
    },
    {
      id: "B4",
      speaker: "planner",
      prompt: "취소나 변경 규정이 있나요?",
      choices: [
        pick("free", "자유롭게 취소·변경돼요"),
        pick("day", "하루 전까지만요"),
        pick("call", "취소는 전화로만 받고 싶어요"),
        RAW
      ],
      reaction: "규정이 화면 문구가 돼요. 그대로 적어 둘게요."
    },
    {
      id: "B5",
      speaker: "backend",
      prompt: "예약금을 미리 받으세요?",
      choices: [
        pick("no", "안 받아요"),
        pick("part", "일부만 받아요"),
        pick("full", "전액 선결제예요"),
        RAW
      ],
      reaction:
        "…예약금을 받으면 결제 기능이 붙습니다. 그건 견적이 달라질 수 있어서, 담당자가 다시 안내드릴 거예요.",
      featureOn: {choiceId: "part", feature: "결제"}
    }
  ],
  웹서비스: [
    {
      id: "A1",
      speaker: "planner",
      prompt: "회원이 몇 종류인가요?",
      choices: [
        pick("one", "한 종류예요"),
        pick("admin", "일반 회원과 관리자요"),
        pick("multi", "셋 이상이에요 (예: 판매자와 구매자)"),
        RAW
      ],
      reaction: "종류 수가 화면 수를 정해요. 적었어요."
    },
    {
      id: "A2",
      speaker: "planner",
      prompt:
        "로그인하면 제일 먼저 뭐가 보여야 하나요? 그 화면 하나를 말로 그려 주세요.",
      choices: [RAW],
      reaction: "그 화면이 이 서비스의 심장이에요. 잘 받았어요."
    },
    {
      id: "A3",
      speaker: "backend",
      prompt: "다른 서비스와 연동이 필요한가요?",
      choices: [
        pick("no", "없어요"),
        pick("social", "카카오·구글 로그인 정도요"),
        pick("api", "외부 서비스와 데이터를 주고받아야 해요"),
        RAW
      ],
      reaction:
        "…연동은 상대편 사정이 절반이라, 일찍 알수록 좋아요. 적었습니다."
    },
    {
      id: "A4",
      speaker: "backend",
      prompt: "다루는 정보 중에 민감한 게 있나요?",
      choices: [
        pick("no", "없어요"),
        pick("contact", "연락처 정도요"),
        pick("sensitive", "건강·금융 같은 민감한 정보요"),
        RAW
      ],
      reaction: "…민감정보는 보관 방식부터 달라집니다. 중요한 답이었어요."
    },
    {
      id: "A5",
      speaker: "planner",
      prompt: "처음엔 몇 명 정도가 쓸 것 같으세요?",
      choices: [
        pick("s", "지인 규모요"),
        pick("m", "수백 명쯤요"),
        pick("l", "그보다 많이요"),
        RAW
      ],
      reaction:
        "규모 감 잡았어요. 처음부터 크게 지을지 가볍게 시작할지의 기준이 돼요."
    }
  ],
  기업소개: [
    {
      id: "C1",
      speaker: "planner",
      prompt: "소개할 내용이 어느 정도 분량인가요?",
      choices: [
        pick("short", "한두 문단이면 돼요"),
        pick("mid", "연혁과 팀 소개까지 있어요"),
        pick("long", "사업별로 페이지가 나뉠 만큼요"),
        RAW
      ],
      reaction: "분량 적었어요. 많으면 나누고, 적으면 한 호흡으로 가면 돼요."
    },
    {
      id: "C2",
      speaker: "planner",
      prompt: "소식이나 공지를 올릴 일이 있나요?",
      choices: [
        pick("no", "없어요"),
        pick("rare", "가끔요 (일 년에 몇 번)"),
        pick("often", "자주 올릴 거예요"),
        RAW
      ],
      reaction:
        "자주 올리시면 게시판과 관리 화면 얘기가 붙어요. 그건 담당자가 다시 안내드릴게요.",
      featureOn: {choiceId: "often", feature: "게시판"}
    },
    {
      id: "C3",
      speaker: "designer",
      prompt: "로고와 회사 색이 정해져 있나요?",
      choices: [
        pick("full", "로고 파일도 색도 있어요"),
        pick("logo", "로고만 있어요"),
        pick("none", "없어요, 제안해 주세요"),
        RAW
      ],
      reaction: "알겠어요. 있으면 맞추고, 없으면 업종에 맞게 제가 제안드릴게요."
    },
    {
      id: "C4",
      speaker: "designer",
      prompt: "회사나 매장 사진이 있나요?",
      choices: [
        pick("have", "있어요"),
        pick("need", "찍어야 해요"),
        pick("na", "사진이 필요 없는 업종이에요"),
        RAW
      ],
      reaction: "사진 상태까지 받았어요. 이제 그림이 그려져요."
    }
  ],
  포트폴리오: [
    {
      id: "P1",
      speaker: "designer",
      prompt: "작업물이 몇 점이나 되고, 어떤 형태예요?",
      choices: [
        pick("img", "이미지 위주로 10점 안팎"),
        pick("many", "이미지 위주로 수십 점"),
        pick("video", "영상이 섞여 있어요"),
        pick("doc", "글·문서 형태도 있어요"),
        RAW
      ],
      reaction: "형태 적었어요. 영상은 올리는 방식이 달라서 미리 알아야 했어요."
    },
    {
      id: "P2",
      speaker: "planner",
      prompt: "작업물을 종류별로 나눠 보여줄까요?",
      choices: [
        pick("cat", "네, 카테고리로 나눠 주세요"),
        pick("flat", "아니요, 한 줄로 쭉 볼게요"),
        RAW
      ],
      reaction: "구성 적었어요."
    },
    {
      id: "P3",
      speaker: "planner",
      prompt: "새 작업물은 얼마나 자주 올리실 것 같아요?",
      choices: [
        pick("often", "자주요, 직접 올리고 싶어요"),
        pick("rare", "가끔이요, 그때 요청할게요"),
        RAW
      ],
      reaction:
        "직접 올리시려면 관리 화면 얘기가 붙어요. 담당자가 다시 안내드릴게요.",
      featureOn: {choiceId: "often", feature: "관리자"}
    }
  ],
  랜딩: [
    {
      id: "L1",
      speaker: "planner",
      prompt: "이 한 장에서 손님이 딱 하나만 하게 한다면, 뭐예요?",
      choices: [
        pick("call", "전화하기"),
        pick("apply", "신청서 남기기"),
        pick("buy", "구매하기"),
        pick("visit", "매장·행사에 오기"),
        RAW
      ],
      reaction: "그 버튼 하나가 이 페이지의 전부예요. 잘 받았어요."
    },
    {
      id: "L2",
      speaker: "planner",
      prompt: "언제까지 쓰는 페이지예요? 행사용인가요?",
      choices: [
        pick("event", "행사·기간 한정이에요"),
        pick("keep", "계속 쓸 거예요"),
        RAW
      ],
      reaction:
        "기간 적었어요. 행사용이면 날짜 지나고 어떻게 할지도 나중에 정해요."
    },
    {
      id: "L3",
      speaker: "designer",
      prompt: "제일 크게 박을 한 문장이 있나요? 없으면 같이 만들어요.",
      choices: [pick("no", "아직 없어요, 같이 만들어 주세요"), RAW],
      reaction: "그 문장이 절반이에요. 초안을 몇 개 만들어서 보여드릴게요."
    }
  ]
};

const DEFAULT_BRANCH: BranchSpec[] = [
  {
    id: "G1",
    speaker: "planner",
    prompt: "이 사이트에서 손님(방문자)이 제일 자주 할 일 하나를 꼽는다면요?",
    choices: [RAW],
    reaction: "그걸 중심으로 화면을 잡을게요."
  }
];

/* ─────────────────────── 대본 조립 ─────────────────────── */

function slotQuestion(spec: SlotSpec): IntakeQuestion {
  return {
    id: `slot-${spec.field}`,
    speaker: spec.speaker,
    required: false, // "필수"여도 그 자리에서 강제하지 않는다 — depth_missing 이 계속 쫓는다
    multi: spec.multi,
    prompt: spec.prompt,
    choices: spec.choices,
    reaction: () => spec.reaction,
    skipLine: "괜찮아요, 나중에 다시 여쭐게요.",
    slotField: spec.field,
    store: {kind: "slot", key: spec.field}
  };
}

function branchQuestion(spec: BranchSpec): IntakeQuestion {
  return {
    id: `branch-${spec.id}`,
    speaker: spec.speaker,
    required: false,
    prompt: spec.prompt,
    choices: spec.choices.map(choice =>
      spec.featureOn && choice.id === spec.featureOn.choiceId
        ? {
            ...choice,
            effect: {...choice.effect, features: [spec.featureOn.feature]}
          }
        : choice
    ),
    reaction: () => spec.reaction,
    skipLine: "네, 넘어갈게요.",
    store: {kind: "branch", key: spec.id}
  };
}

export function aiQuestionStep(item: AiQuestion): IntakeStep {
  const speaker = item.speaker ?? "intake";
  return {
    kind: "question",
    question: {
      id: `ai-${item.id}`,
      speaker,
      required: false,
      prompt: item.question,
      choices: [{id: "free", label: "답할게요", free: "raw"}],
      reaction: () => "고마워요, 그대로 전달할게요.",
      skipLine: "네, 이건 넘어갈게요.",
      store: {kind: "ai", key: item.id}
    }
  };
}

/** speaker 가 바뀌는 지점에 짧은 넘김 대사를 끼운다 — 릴레이 느낌의 최소 연출. */
const HANDOFF_LINE: Record<CommissionSpeaker, string> = {
  intake: "다음은 제가 받을게요.",
  planner: "이어서 기획 쪽에서 여쭐게요. 체리예요.",
  designer: "여기부턴 디자인 얘기라 먹지가 여쭐게요.",
  frontend: "화면 얘기는 리코가 이어서요!",
  backend: "…다음은 데이터 쪽입니다. 굴뚝이 여쭙겠습니다."
};

function withHandoffs(questions: IntakeQuestion[]): IntakeStep[] {
  const steps: IntakeStep[] = [];
  let current: CommissionSpeaker | null = null;
  for (const question of questions) {
    if (current !== null && question.speaker !== current) {
      steps.push({
        kind: "enter",
        speaker: question.speaker,
        line: HANDOFF_LINE[question.speaker]
      });
    }
    current = question.speaker;
    steps.push({kind: "question", question});
  }
  return steps;
}

function slotValue(track: CommissionTrack, field: string): string {
  const value = (track.draft as unknown as Record<string, unknown>)[field];
  if (Array.isArray(value)) return value.join(", ");
  return String(value ?? "").trim();
}

/**
 * track 응답으로 2층 대본을 조립한다. 이미 답한 문항은 뺀다.
 * AI 질문이 이미 생성돼 있으면(재방문) gate 없이 미답 질문만 잇는다.
 */
export function buildDepthScript(track: CommissionTrack): IntakeStep[] {
  const remainingSlots = SLOT_SPECS.filter(
    spec => !slotValue(track, spec.field)
  );
  const tree = BRANCH_TREES[track.site_type] ?? DEFAULT_BRANCH;
  const remainingBranch = tree.filter(spec => !track.branch[spec.id]);

  const questions: IntakeQuestion[] = [
    ...remainingSlots.map(slotQuestion),
    ...remainingBranch.map(branchQuestion)
  ];

  const steps: IntakeStep[] = [];
  // 재방문 판정에 messages 만 보면 안 된다 — 릴레이 선택지로만 답한 사람은 대화 로그가
  // 비어 있어서 두 번째 방문에도 첫 인사를 다시 듣게 된다(실측).
  const revisit =
    track.messages.length > 0 ||
    Object.keys(track.branch).length > 0 ||
    SLOT_SPECS.some(spec => slotValue(track, spec.field));
  const nothingLeft =
    questions.length === 0 &&
    (!track.ai_questions_done
      ? false
      : track.ai_questions.every(item => item.answer.trim()));

  steps.push({
    kind: "enter",
    speaker: "intake",
    line: nothingLeft
      ? `접수번호 ${track.public_id} 건은 필요한 내용을 다 받았어요. 덧붙이고 싶은 게 있으면 아래에 편하게 남겨주세요.`
      : revisit
      ? "다시 오셨네요. 남은 것만 이어서 여쭐게요."
      : `다시 뵙네요. 접수번호 ${track.public_id} 건으로 몇 가지만 더 여쭐게요. ` +
        "실제로 만들 때 꼭 알아야 하는 것들이라, 답해주시면 결과가 많이 달라져요. " +
        "부담스러운 건 건너뛰셔도 돼요."
  });

  steps.push(...withHandoffs(questions));

  if (!track.ai_questions_done) {
    // 고정 문항이 끝난 지점 — 이 의뢰만 보고 뽑는 맞춤 질문을 서버가 만든다(1회, 최대 5개).
    steps.push({
      kind: "gate",
      speaker: "intake",
      line: "잠깐만요, 식구들이 지금까지 들은 걸 훑어보고 있어요. 이 의뢰에만 필요한 게 남았는지 볼게요…"
    });
  } else {
    const unanswered = track.ai_questions.filter(item => !item.answer.trim());
    steps.push(...unanswered.map(aiQuestionStep));
  }

  steps.push({kind: "wrapup", speaker: "intake"});
  return steps;
}

/** draft 에서 슬롯 값 읽기(문자열/목록 공용). */
export function readSlotValue(
  draft: Record<string, unknown>,
  field: string
): string {
  const value = draft[field];
  if (Array.isArray(value)) return value.join(", ");
  return String(value ?? "").trim();
}

/**
 * AI 질문 생성에 넘길 "이미 물은 것" 목록 — 중복 질문 방지의 재료.
 * 슬롯·분기 문항의 질문 원문과 현재 답을 모은다(답 없으면 빈 문자열).
 */
export function collectAskedPairs(
  siteType: string,
  draft: Record<string, unknown>,
  branch: Record<string, string>
): {question: string; answer: string}[] {
  const pairs: {question: string; answer: string}[] = [];
  for (const spec of SLOT_SPECS) {
    pairs.push({
      question: spec.prompt,
      answer: readSlotValue(draft, spec.field)
    });
  }
  const tree = BRANCH_TREES[siteType] ?? DEFAULT_BRANCH;
  for (const spec of tree) {
    pairs.push({question: spec.prompt, answer: branch[spec.id] ?? ""});
  }
  return pairs;
}

export function depthWrapupLine(): string {
  return (
    "여기까지예요, 고생하셨어요! 주신 답은 전부 저장됐고 정재훈이 그대로 이어받아요.\n" +
    "더 하실 말씀이 있으면 아래에 언제든 남겨 주세요 — 이 페이지는 계속 열려 있어요."
  );
}
