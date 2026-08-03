// 동작 데이터 시연용 키프레임. 실제 서비스 데이터가 아니라 재현용 예시다.

export interface Keyframe {
  timeOffset: number;
  position: {x: number; y: number};
  wristRotation: number;
  fingerFlex: number[];
  hold?: boolean;
}

export interface SignData {
  id: string;
  label: string;
  durationMs: number;
  handedness: string;
  note: string;
  keyframes: Keyframe[];
}

export const SIGNS: Record<string, SignData> = {
  hello: {
    id: "hello",
    label: "안녕하세요",
    durationMs: 1600,
    handedness: "one-handed",
    note: "손을 이마 옆에서 시작해 바깥쪽 아래로 내립니다.",
    keyframes: [
      {
        timeOffset: 0.0,
        position: {x: -30, y: -40},
        wristRotation: -15,
        fingerFlex: [0, 0, 0, 0, 0],
        hold: true
      },
      {
        timeOffset: 0.25,
        position: {x: -20, y: -20},
        wristRotation: -10,
        fingerFlex: [0.1, 0.1, 0.1, 0.1, 0.1]
      },
      {
        timeOffset: 0.5,
        position: {x: 0, y: 10},
        wristRotation: 0,
        fingerFlex: [0.2, 0.3, 0.3, 0.3, 0.3]
      },
      {
        timeOffset: 0.75,
        position: {x: 20, y: 40},
        wristRotation: 5,
        fingerFlex: [0.3, 0.5, 0.5, 0.5, 0.5]
      },
      {
        timeOffset: 1.0,
        position: {x: 40, y: 60},
        wristRotation: 15,
        fingerFlex: [0.4, 0.6, 0.6, 0.6, 0.6]
      }
    ]
  },
  thanks: {
    id: "thanks",
    label: "감사합니다",
    durationMs: 1400,
    handedness: "one-handed",
    note: "손날을 아래로 향하게 하여 턱에서 앞쪽 아래로 내립니다.",
    keyframes: [
      {
        timeOffset: 0.0,
        position: {x: 0, y: -60},
        wristRotation: -90,
        fingerFlex: [0, 0, 0, 0, 0],
        hold: true
      },
      {
        timeOffset: 0.25,
        position: {x: 0, y: -40},
        wristRotation: -90,
        fingerFlex: [0, 0, 0, 0, 0]
      },
      {
        timeOffset: 0.5,
        position: {x: 0, y: -10},
        wristRotation: -85,
        fingerFlex: [0, 0, 0, 0, 0]
      },
      {
        timeOffset: 0.75,
        position: {x: 0, y: 20},
        wristRotation: -80,
        fingerFlex: [0, 0, 0, 0, 0]
      },
      {
        timeOffset: 1.0,
        position: {x: 0, y: 40},
        wristRotation: -75,
        fingerFlex: [0, 0, 0, 0, 0]
      }
    ]
  },
  school: {
    id: "school",
    label: "학교",
    durationMs: 1200,
    handedness: "two-handed (dominant shown)",
    note: "두 손을 마주치듯 모읍니다 (오른손 예시).",
    keyframes: [
      {
        timeOffset: 0.0,
        position: {x: 60, y: 0},
        wristRotation: -30,
        fingerFlex: [0, 0, 0, 0, 0],
        hold: true
      },
      {
        timeOffset: 0.25,
        position: {x: 40, y: 0},
        wristRotation: -35,
        fingerFlex: [0, 0, 0, 0, 0]
      },
      {
        timeOffset: 0.5,
        position: {x: 20, y: 0},
        wristRotation: -40,
        fingerFlex: [0.1, 0.1, 0.1, 0.1, 0.1]
      },
      {
        timeOffset: 0.75,
        position: {x: 10, y: 0},
        wristRotation: -45,
        fingerFlex: [0.2, 0.2, 0.2, 0.2, 0.2]
      },
      {
        timeOffset: 1.0,
        position: {x: 0, y: 0},
        wristRotation: -45,
        fingerFlex: [0.3, 0.3, 0.3, 0.3, 0.3]
      }
    ]
  }
};

export function cloneSigns(): Record<string, SignData> {
  return JSON.parse(JSON.stringify(SIGNS)) as Record<string, SignData>;
}

export const WORD_ORDER = ["hello", "thanks", "school"] as const;
