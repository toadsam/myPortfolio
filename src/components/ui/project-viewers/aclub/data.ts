// ACLUB 룸에 등장하는 동아리는 전부 가상입니다.
// 실제 동아리·학생 데이터를 쓰지 않기 위해 이름과 값을 모두 지어냈습니다.

export const CATEGORY_COLORS = {
  예술: "#f472b6",
  학술: "#38bdf8",
  운동: "#fbbf24",
  봉사: "#4ade80",
  취미: "#c084fc"
} as const;

export type CategoryName = keyof typeof CATEGORY_COLORS;

export const CATEGORY_NAMES = Object.keys(CATEGORY_COLORS) as CategoryName[];

const RAW_CLUBS: {name: string; cat: CategoryName}[] = [
  {name: "빛그림 사진회", cat: "예술"},
  {name: "한밤의 밴드", cat: "예술"},
  {name: "달리는 사람들", cat: "운동"},
  {name: "고전읽기 모임", cat: "학술"},
  {name: "코드나무", cat: "학술"},
  {name: "손끝공방", cat: "취미"},
  {name: "새벽등산부", cat: "운동"},
  {name: "무대 위 사람들", cat: "예술"},
  {name: "종이비행기 봉사단", cat: "봉사"},
  {name: "수요 토론회", cat: "학술"},
  {name: "바다탐사대", cat: "학술"},
  {name: "느린 산책", cat: "취미"},
  {name: "필름 아카이브", cat: "예술"},
  {name: "매듭공예부", cat: "취미"},
  {name: "야구공 던지기", cat: "운동"},
  {name: "심야 상영회", cat: "취미"},
  {name: "북쪽 별 관측회", cat: "학술"},
  {name: "발효식품 연구회", cat: "취미"},
  {name: "종이접기 학회", cat: "취미"},
  {name: "달빛 합창단", cat: "예술"},
  {name: "숲 가꾸기", cat: "봉사"},
  {name: "체스 한 판", cat: "취미"},
  {name: "라디오 만들기", cat: "학술"},
  {name: "한글 서예회", cat: "예술"}
];

// 시드 기반 난수 — 서버·클라이언트에서 같은 값이 나와야 하므로 Math.random을 쓰지 않는다.
function seeded(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export interface Club {
  id: string;
  name: string;
  category: CategoryName;
  recruiting: boolean;
  newbieWelcome: boolean;
  noWeekend: boolean;
  /** 모집 마감까지 남은 일수. 모집이 끝났으면 -1. */
  daysLeft: number;
  createdAt: number;
  /** 필터에서 탈락할 때 떨어지는 회전각 */
  exitRotate: number;
}

export const CLUBS: Club[] = RAW_CLUBS.map((c, i) => {
  const recruiting = seeded(i * 1.1) > 0.3;
  return {
    id: `club-${i}`,
    name: c.name,
    category: c.cat,
    recruiting,
    newbieWelcome: seeded(i * 1.2) > 0.4,
    noWeekend: seeded(i * 1.3) > 0.5,
    daysLeft: recruiting ? Math.floor(seeded(i * 1.4) * 20) : -1,
    createdAt: 1600000000000 - Math.floor(seeded(i * 1.5) * 10000000000),
    exitRotate: (seeded(i * 1.6) > 0.5 ? 1 : -1) * (6 + seeded(i * 1.7) * 8)
  };
});

export type SortKey = "deadline" | "name" | "recent";

export const SORT_LABELS: {key: SortKey; label: string}[] = [
  {key: "deadline", label: "마감 임박순"},
  {key: "name", label: "가나다순"},
  {key: "recent", label: "최근 등록순"}
];

// 주소 상태 시뮬레이터(트러블슈팅 01)용 축약 목록
export const SIM_CLUBS: {
  id: string;
  name: string;
  cat: CategoryName;
  rec: boolean;
  newbie: boolean;
}[] = [
  {id: "1", name: "푸른 캔버스", cat: "예술", rec: true, newbie: true},
  {id: "2", name: "코드의 향연", cat: "학술", rec: true, newbie: false},
  {id: "3", name: "필름 속으로", cat: "예술", rec: false, newbie: true},
  {id: "4", name: "별빛 관측회", cat: "학술", rec: true, newbie: true},
  {id: "5", name: "달리는 청춘", cat: "운동", rec: false, newbie: false},
  {id: "6", name: "따뜻한 손길", cat: "봉사", rec: true, newbie: true},
  {id: "7", name: "종이접기부", cat: "취미", rec: true, newbie: false},
  {id: "8", name: "야구 사랑", cat: "운동", rec: false, newbie: true},
  {id: "9", name: "연극 바닥", cat: "예술", rec: true, newbie: false},
  {id: "10", name: "환경지킴이", cat: "봉사", rec: false, newbie: false},
  {id: "11", name: "독서 토론", cat: "학술", rec: true, newbie: true},
  {id: "12", name: "보드게임부", cat: "취미", rec: true, newbie: true}
];

// 스크롤 복원 시뮬레이터(트러블슈팅 02)용 24행 목록
export const SCROLL_CLUBS: {name: string; cat: CategoryName}[] = [
  {name: "푸른 캔버스", cat: "예술"},
  {name: "코드의 향연", cat: "학술"},
  {name: "필름 속으로", cat: "예술"},
  {name: "별빛 관측회", cat: "학술"},
  {name: "달리는 청춘", cat: "운동"},
  {name: "따뜻한 손길", cat: "봉사"},
  {name: "종이접기부", cat: "취미"},
  {name: "야구 사랑", cat: "운동"},
  {name: "연극 바닥", cat: "예술"},
  {name: "환경지킴이", cat: "봉사"},
  {name: "독서 토론", cat: "학술"},
  {name: "보드게임부", cat: "취미"},
  {name: "무대 위의 나", cat: "예술"},
  {name: "알고리즘 캠프", cat: "학술"},
  {name: "산악 구조대", cat: "운동"},
  {name: "마음 나눔", cat: "봉사"},
  {name: "스케치북", cat: "예술"},
  {name: "로봇 공학회", cat: "학술"},
  {name: "클라이밍", cat: "운동"},
  {name: "동물 보호소", cat: "봉사"},
  {name: "클래식 기타", cat: "취미"},
  {name: "단편 소설회", cat: "학술"},
  {name: "아침 조깅부", cat: "운동"},
  {name: "바리스타 랩", cat: "취미"}
];
