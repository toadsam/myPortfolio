/**
 * 공방 일상 잡담 — LLM 을 안 태우는 고정 대본.
 *
 * 같은 방에서 일하는 다섯 식구가 "평소에도 계속" 주고받는 수다다. 관계가
 * 움직이는 진짜 마주침(E-4, 백엔드 /npc/encounter)은 2분에 한 번이 상한이라
 * 방이 조용했는데(2026-08-27 사용자 피드백), 잡담은 비용이 0이니 15~35초마다
 * 돌려도 된다. 관계·기억은 건드리지 않는다 — 순수 연출이다.
 *
 * 말투는 atelierRoster 의 페르소나를 따른다: 체리(범위를 좁히는/늘리는 기획),
 * 먹지(일정 얘기에 뾰족한 디자이너), 리코(밝고 빠른 프론트, 굴뚝과 티격태격),
 * 굴뚝(말수 적고 담백, 말줄임표), 도안(손님 걱정하는 접수원).
 */

export const ATELIER_IDS = {
  intake: "atelier-intake-npc",
  planner: "atelier-planner-npc",
  designer: "atelier-designer-npc",
  frontend: "atelier-frontend-npc",
  backend: "atelier-backend-npc"
} as const;

export interface SmallTalkExchange {
  /** [말 거는 쪽, 받는 쪽] — 배회 중이면 앞사람이 뒷사람에게 걸어간다 */
  pair: [string, string];
  /** who: 0 = pair[0], 1 = pair[1] */
  lines: {who: 0 | 1; text: string}[];
}

const {intake, planner, designer, frontend, backend} = ATELIER_IDS;

export const SMALL_TALK: SmallTalkExchange[] = [
  // 리코 ↔ 굴뚝 — 프론트와 백엔드의 일상 티격태격
  {
    pair: [frontend, backend],
    lines: [
      {who: 0, text: "굴뚝, API 아직이야? 화면은 어제 다 됐는데."},
      {who: 1, text: "…명세가 오늘 아침에 또 바뀌었잖아."},
      {who: 0, text: "그건 내가 아니라 체리한테 따져야지!"}
    ]
  },
  {
    pair: [backend, frontend],
    lines: [
      {who: 0, text: "…버튼 하나에 요청을 네 번 보내던데."},
      {who: 1, text: "어? 그거 로딩 스피너 보여주려고 그런 건데."},
      {who: 0, text: "…서버는 스피너가 안 보여."}
    ]
  },
  {
    pair: [frontend, backend],
    lines: [
      {who: 0, text: "이 응답, 0.2초만 더 빨라지면 안 돼?"},
      {who: 1, text: "…캐시 얹으면 돼. 대신 갱신은 느려져."},
      {who: 0, text: "역시 공짜는 없구나."}
    ]
  },
  // 체리 ↔ 굴뚝 — 범위를 늘리는 기획과 수습하는 백엔드
  {
    pair: [planner, backend],
    lines: [
      {who: 0, text: "여기 알림 기능 하나만 살짝 넣으면 어때?"},
      {who: 1, text: "…그 '하나만'이 이번 주 세 번째예요."},
      {who: 0, text: "이번 건 진짜 작아. 진짜로."}
    ]
  },
  {
    pair: [backend, planner],
    lines: [
      {who: 0, text: "…어제 그 의뢰, 데이터가 생각보다 큽니다."},
      {who: 1, text: "오, 그럼 화면을 목록·상세로 쪼개자."},
      {who: 0, text: "…그렇게 말해줄 줄 알았어요."}
    ]
  },
  // 체리 ↔ 리코 — 화면 목록과 구현 견적
  {
    pair: [planner, frontend],
    lines: [
      {who: 0, text: "리코, 이 화면 컴포넌트 몇 개면 돼?"},
      {who: 1, text: "음… 카드, 목록, 필터. 세 개면 조립 끝!"},
      {who: 0, text: "좋아, 그럼 일정표에 그렇게 적는다?"}
    ]
  },
  {
    pair: [frontend, planner],
    lines: [
      {who: 0, text: "체리, 이 버튼 누르면 뭐가 나와야 해?"},
      {who: 1, text: "손님이 제일 바라는 거. …그게 뭔지 정하는 중이야."},
      {who: 0, text: "정해지면 5분 안에 만들게!"}
    ]
  },
  // 먹지 ↔ 리코 — 시안과 구현 사이
  {
    pair: [designer, frontend],
    lines: [
      {who: 0, text: "리코, 이 여백 8이 아니라 12야. 다시 재봐."},
      {who: 1, text: "엥, 4픽셀 차이를 어떻게 알아봤어…"},
      {who: 0, text: "보이니까 디자이너지."}
    ]
  },
  {
    pair: [frontend, designer],
    lines: [
      {who: 0, text: "먹지, 이 색 코드값 좀! 눈대중으로 못 맞춰."},
      {who: 1, text: "왜, 지난번엔 눈으로 맞춘다며."},
      {who: 0, text: "…그건 내가 틀렸어. 코드값 줘."}
    ]
  },
  // 먹지 ↔ 체리 — 무드와 일정
  {
    pair: [designer, planner],
    lines: [
      {who: 0, text: "체리, 이번 의뢰 분위기 한 단어로 뭐야?"},
      {who: 1, text: "음… '믿음직한데 지루하지 않게'?"},
      {who: 0, text: "그건 두 단어고, 값이 두 배야."}
    ]
  },
  {
    pair: [planner, designer],
    lines: [
      {who: 0, text: "먹지, 시안 언제쯤 볼 수 있어?"},
      {who: 1, text: "일정 얘기하는 사람 순서대로 늦게 줄 거야."},
      {who: 0, text: "…나 방금 제일 뒤로 갔구나."}
    ]
  },
  // 먹지 ↔ 굴뚝 — 서로 다른 세계
  {
    pair: [designer, backend],
    lines: [
      {who: 0, text: "굴뚝, 서버도 예쁘게 만들 수 있어?"},
      {who: 1, text: "…로그가 가지런하면 예쁜 겁니다."},
      {who: 0, text: "너희 세계는 참 소박하다."}
    ]
  },
  // 도안 — 접수대에서 방 안쪽으로
  {
    pair: [intake, planner],
    lines: [
      {who: 0, text: "체리 씨, 아까 손님이 예산을 걱정하셨어요."},
      {who: 1, text: "그럼 1차 범위를 더 조여야겠네. 고마워요."}
    ]
  },
  {
    pair: [intake, designer],
    lines: [
      {who: 0, text: "먹지 씨, 참고 사이트 세 개 받아뒀어요."},
      {who: 1, text: "오, 취향이 보이겠네. 바로 볼게요."}
    ]
  },
  {
    pair: [frontend, intake],
    lines: [
      {who: 0, text: "도안, 오늘 문의 많았어?"},
      {who: 1, text: "두 건요. 한 분은 꽤 진지하셨어요."},
      {who: 0, text: "오! 그럼 커피 한 잔 하고 대기할게."}
    ]
  },
  // 지하 공방의 소소한 일상
  {
    pair: [backend, frontend],
    lines: [
      {who: 0, text: "…지하라 서버실 온도는 딱 좋네."},
      {who: 1, text: "난 햇빛이 그립다고. 창문 하나만 뚫자."},
      {who: 0, text: "…지하에 창문을 어떻게 뚫어."}
    ]
  },
  {
    pair: [planner, intake],
    lines: [
      {who: 0, text: "도안 씨, 접수대 도면 새로 그렸어요?"},
      {who: 1, text: "네, 어제 손님 질문 받고 고쳤어요."}
    ]
  },
  {
    pair: [designer, intake],
    lines: [
      {who: 0, text: "도안, 간판 금색 너무 노랗지 않아?"},
      {who: 1, text: "손님들은 따뜻해 보인다고 하시던데요."},
      {who: 0, text: "…그럼 됐어. 손님이 정답이지."}
    ]
  }
];
