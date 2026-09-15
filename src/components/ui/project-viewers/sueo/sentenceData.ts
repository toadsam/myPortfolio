// 문장 변환(세 갈래 토큰 경쟁) 시연용 문장.
// 기준은 GitHub 저장소(toadsam/Sign-Language, main)다.
//
// rule   : SignSentenceSimplifier + TextNormalizer 규칙을 코드 그대로 따라 계산한 결과.
//          「지하철역은 어디야?」는 README 에 실린 운영 서버 응답과 같다.
// etri / openai : 외부 분석기의 실제 응답은 저장소에 남아 있지 않다.
//          「이렇게 나왔다면」의 가정값이며, 화면에도 가정이라고 표시한다.

export type StreamSource = "rule" | "etri" | "openai";

export interface SentencePreset {
  text: string;
  rule: string[];
  etri: string[];
  openai: string[];
  /** 운영 서버에서 실제로 받은 응답일 때만 채운다. */
  verified?: {appliedRules: string[]; noVideoWords: string[]};
  note: string;
}

/** 시연 문장에 나오는 단어 중 sign_dictionary.json 에 실제로 있는 것. */
export const IN_DICTIONARY = new Set([
  "지하철역",
  "어디",
  "내일",
  "병원",
  "가다",
  "나"
]);

export const SENTENCES: SentencePreset[] = [
  {
    text: "지하철역은 어디야?",
    rule: ["지하철역", "어디"],
    etri: ["지하철역", "어디"],
    openai: ["지하철역", "어디"],
    verified: {
      appliedRules: ["particle_removal", "question_reordering", "word_order"],
      noVideoWords: ["지하철역", "어디"]
    },
    note: "세 흐름이 같은 답을 내면 동점이고, 우선순위(openai > etri > rule)대로 고릅니다. 결과는 같습니다."
  },
  {
    text: "나는 학교에 간다",
    rule: ["학교", "나", "간다"],
    etri: ["나", "학교", "가다"],
    openai: ["나", "학교", "가다"],
    note: "규칙 표에 「간다」가 없어 규칙 흐름은 1개만 사전에 맞습니다. 외부 흐름이 「가다」로 되돌리면 2개가 맞아 이깁니다. 「학교」는 어느 쪽이든 사전에 없습니다."
  },
  {
    text: "내일 병원에 가요",
    rule: ["내일", "병원", "가다"],
    etri: ["내일", "병원", "가다", "요"],
    openai: ["내일", "병원", "가다"],
    note: "모두 3개가 맞아 동점입니다. OpenAI 가 없고 ETRI 가 사전에 없는 조각을 붙였다면, 동점 우선순위 때문에 그 조각까지 딸려 옵니다. 적중 수 기준의 대가입니다."
  }
];

export const SOURCE_PRIORITY: Record<StreamSource, number> = {
  openai: 3,
  etri: 2,
  rule: 1
};

export const SOURCE_LABEL: Record<StreamSource, string> = {
  rule: "규칙 · SignSentenceSimplifier",
  etri: "ETRI WiseNLU",
  openai: "OpenAI gpt-4o-mini"
};
