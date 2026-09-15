// 수어지교 전시실이 쓰는 단어·문항 데이터.
// 기준은 전시실이 아니라 GitHub 저장소(toadsam/Sign-Language, main)다.
// 여기 있는 값은 전부 저장소에서 옮겼고, 출처를 항목마다 적는다.

/**
 * 퀴즈 문항 20개 — backend/scripts/update_quiz_items.py 의 QUIZ_ITEMS 그대로.
 * 영상 주소는 Firestore 에 넣지 않고(videoUrl: ""), 서버가 정답 보기 텍스트로
 * Firebase Storage 에서 찾는다(QuizService.java:201-207).
 */
export interface QuizItem {
  id: string;
  category: "basic" | "daily";
  correct: "A" | "B" | "C" | "D";
  choices: [string, string, string, string];
}

export const QUIZ_ITEMS: QuizItem[] = [
  {
    id: "q001",
    category: "basic",
    correct: "A",
    choices: ["가다", "가깝다", "막히다", "끊다"]
  },
  {
    id: "q002",
    category: "basic",
    correct: "A",
    choices: ["눈", "하늘", "갈색", "체온"]
  },
  {
    id: "q003",
    category: "basic",
    correct: "A",
    choices: ["좋다", "불가능", "안타깝다", "무례"]
  },
  {
    id: "q004",
    category: "basic",
    correct: "B",
    choices: ["알려주다", "모르다", "결심", "평가"]
  },
  {
    id: "q005",
    category: "basic",
    correct: "A",
    choices: ["우유", "에어컨", "사진기", "직인"]
  },
  {
    id: "q006",
    category: "basic",
    correct: "B",
    choices: ["장마", "하늘", "일출", "일몰"]
  },
  {
    id: "q007",
    category: "basic",
    correct: "A",
    choices: ["지도", "샛길", "사거리", "언덕"]
  },
  {
    id: "q008",
    category: "basic",
    correct: "B",
    choices: ["연구", "복습", "견습", "검사"]
  },
  {
    id: "q009",
    category: "basic",
    correct: "A",
    choices: ["십", "얼마", "십억", "일시불"]
  },
  {
    id: "q010",
    category: "basic",
    correct: "C",
    choices: ["더디다", "막히다", "가깝다", "사라지다"]
  },
  {
    id: "q011",
    category: "daily",
    correct: "A",
    choices: ["공항", "서울역", "백화점", "보건소"]
  },
  {
    id: "q012",
    category: "daily",
    correct: "C",
    choices: ["기차", "막차", "서울역", "공항"]
  },
  {
    id: "q013",
    category: "daily",
    correct: "C",
    choices: ["검사", "체온", "보건소", "회복"]
  },
  {
    id: "q014",
    category: "daily",
    correct: "A",
    choices: ["대출", "일시불", "지불하다", "빌리다"]
  },
  {
    id: "q015",
    category: "daily",
    correct: "C",
    choices: ["받다", "주다", "지불하다", "빌리다"]
  },
  {
    id: "q016",
    category: "daily",
    correct: "A",
    choices: ["에어컨", "하늘", "장마", "우유"]
  },
  {
    id: "q017",
    category: "daily",
    correct: "A",
    choices: ["배고프다", "급하다", "난감하다", "형편없다"]
  },
  {
    id: "q018",
    category: "daily",
    correct: "B",
    choices: ["기차", "막차", "사거리", "지름길"]
  },
  {
    id: "q019",
    category: "daily",
    correct: "A",
    choices: ["알려주다", "봐주다", "돕다", "무시하다"]
  },
  {
    id: "q020",
    category: "daily",
    correct: "A",
    choices: ["포기", "회복", "쓰러지다", "퇴사"]
  }
];

export const QUIZ_QUESTION_TEXT: Record<QuizItem["category"], string> = {
  basic: "이 기초 단어 수어의 의미는 무엇인가요?",
  daily: "일상 회화에서 쓰는 이 수어의 의미는 무엇인가요?"
};

export function answerOf(item: QuizItem): string {
  return item.choices["ABCD".indexOf(item.correct)];
}

/**
 * 「단어 하나가 화면에 뜨기까지」 시연에 쓰는 두 요청. 둘 다 실제로 확인한 결과다.
 * - 퀴즈 q006: 배포본 퀴즈 화면 캡처(public/projects/sign-language/quiz.webp)에
 *   이 문항이 아바타 영상과 함께 떠 있다 → Storage 에 「하늘」 영상이 있다.
 *   「하늘」은 sign_dictionary.json 에 없다. 퀴즈 경로는 사전을 거치지 않는다.
 * - 통역기 「지하철역은 어디야?」: README 의 운영 서버 응답(2026-09-07)에서
 *   두 토큰 모두 noVideoWords 로 나왔다. 둘 다 사전에는 있다(id 68, 16).
 */
export interface LookupWord {
  word: string;
  /** null 이면 사전을 보지 않는 경로. */
  inDictionary: boolean | null;
  hasVideo: boolean;
}

export interface LookupScenario {
  id: "quiz" | "translate";
  label: string;
  request: string;
  keyNote: string;
  words: LookupWord[];
}

export const LOOKUPS: LookupScenario[] = [
  {
    id: "quiz",
    label: "퀴즈 문항 q006",
    request: "GET /api/quiz/session",
    keyNote: "정답 보기 B → 「하늘」 (사전을 거치지 않는다)",
    words: [{word: "하늘", inDictionary: null, hasVideo: true}]
  },
  {
    id: "translate",
    label: "통역기 「지하철역은 어디야?」",
    request: 'POST /translate {"text":"지하철역은 어디야?"}',
    keyNote: "문장 변환 결과 토큰 → 「지하철역」, 「어디」",
    words: [
      {word: "지하철역", inDictionary: true, hasVideo: false},
      {word: "어디", inDictionary: true, hasVideo: false}
    ]
  }
];
