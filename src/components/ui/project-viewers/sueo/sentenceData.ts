// 문장 → 수어 어순 변환 시연용 사전. 실제 형태소 분석기가 아니라 재현용 규칙이다.

export interface DictEntry {
  type: string;
  word: string;
  duration: number;
}

export interface Token {
  w: string;
  dict?: DictEntry;
  /** 수어에 없는 요소(조사·어미) — 위쪽 줄에서 취소선으로 보여준다. */
  drop?: boolean;
  /** 사전에 없는 단어 — 지문자로 처리한다. */
  unknown?: boolean;
  /** 어순 재배열로 앞으로 당겨진 단어 — 화살표를 붙인다. */
  movedFront?: boolean;
}

export interface Conversion {
  kor: Token[];
  sign: Token[];
}

const D = (type: string, word: string, duration: number): DictEntry => ({
  type,
  word,
  duration
});

export const DICTIONARY: Record<string, DictEntry> = {
  내일: D("time", "내일", 1000),
  학교: D("place", "학교", 1000),
  에: D("particle", "에", 0),
  가다: D("verb", "가다", 1200),
  갑니다: D("verb_ending", "갑니다", 0),
  저: D("noun", "저", 800),
  는: D("particle", "는", 0),
  학생: D("noun", "학생", 1000),
  입니다: D("verb_ending", "입니다", 0),
  지금: D("time", "지금", 900),
  몇: D("modifier", "몇", 800),
  시: D("noun", "시간", 1000),
  "예요?": D("verb_ending", "예요?", 0)
};

export const PRESETS: Record<string, Conversion> = {
  "내일 학교에 갑니다": {
    kor: [
      {w: "내일", dict: DICTIONARY["내일"]},
      {w: "학교", dict: DICTIONARY["학교"]},
      {w: "에", drop: true},
      {w: "가다", dict: DICTIONARY["가다"]},
      {w: "습니다", drop: true}
    ],
    sign: [
      {w: "내일", dict: DICTIONARY["내일"], movedFront: true},
      {w: "학교", dict: DICTIONARY["학교"]},
      {w: "가다", dict: DICTIONARY["가다"]}
    ]
  },
  "저는 학생입니다": {
    kor: [
      {w: "저", dict: DICTIONARY["저"]},
      {w: "는", drop: true},
      {w: "학생", dict: DICTIONARY["학생"]},
      {w: "입니다", drop: true}
    ],
    sign: [
      {w: "저", dict: DICTIONARY["저"]},
      {w: "학생", dict: DICTIONARY["학생"]}
    ]
  },
  "지금 몇 시예요?": {
    kor: [
      {w: "지금", dict: DICTIONARY["지금"]},
      {w: "몇", dict: DICTIONARY["몇"]},
      {w: "시", dict: DICTIONARY["시"]},
      {w: "예요?", drop: true}
    ],
    sign: [
      {w: "지금", dict: DICTIONARY["지금"]},
      {w: "시간", dict: DICTIONARY["시"]},
      {w: "몇", dict: DICTIONARY["몇"]}
    ]
  }
};

export const PRESET_KEYS = Object.keys(PRESETS);

const PARTICLES = ["에", "는", "가", "을", "를"];
const ENDINGS = ["입니다", "습니다"];

/** 프리셋에 없는 문장을 대충 쪼개는 폴백. 조사·어미를 떼고 시간 표현을 앞으로 보낸다. */
export function parseFreeText(text: string): Conversion {
  const kor: Token[] = [];
  const sign: Token[] = [];

  text
    .split(" ")
    .filter(Boolean)
    .forEach(w => {
      const entry = DICTIONARY[w];
      if (entry) {
        kor.push({w, dict: entry});
        const isGrammarOnly =
          entry.type === "particle" ||
          entry.word.endsWith("니다") ||
          entry.word.endsWith("요?");
        if (!isGrammarOnly) sign.push({w, dict: entry});
        return;
      }

      const ending = ENDINGS.find(e => w.endsWith(e) && w.length > e.length);
      if (ending) {
        const base = w.slice(0, -ending.length);
        kor.push({w: base, unknown: true}, {w: ending, drop: true});
        sign.push({w: base, unknown: true});
        return;
      }

      const particle = PARTICLES.find(p => w.endsWith(p) && w.length > 1);
      if (particle) {
        const base = w.slice(0, -1);
        kor.push({w: base, unknown: true}, {w: particle, drop: true});
        sign.push({w: base, unknown: true});
        return;
      }

      kor.push({w, unknown: true});
      sign.push({w, unknown: true});
    });

  // 수어 어순: 시간 표현을 맨 앞으로.
  const timeIdx = sign.findIndex(x => x.dict?.type === "time");
  if (timeIdx > 0) {
    const [moved] = sign.splice(timeIdx, 1);
    sign.unshift({...moved, movedFront: true});
  }

  return {kor, sign};
}

export function convert(text: string): Conversion {
  return PRESETS[text.trim()] ?? parseFreeText(text.trim());
}

export function cellDuration(item: Token): number {
  if (item.drop) return 500;
  return item.dict?.duration || 1200;
}
