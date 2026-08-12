// 접속 시각에 따른 마을 분위기 — 새벽/낮/노을/밤.
//
// VillageScene 안에 있던 걸 꺼냈다. Building 도 같은 값이 필요하기 때문이다
// (저녁에 창문을 밝히려면 지금이 몇 시대인지 알아야 한다). React context 로
// 내려보내지 않고 모듈 상수로 둔다 — 한 번 정해지면 새로고침 전까지 안 바뀌는
// 값이라, 렌더 트리에 얹으면 리렌더 경로만 늘어난다.
//
// ─── 왜 낮 말고 세 개를 다시 잡았나 ──────────────────────────────────────────
// 바닥이 어두운 사이버펑크 원반이던 시절엔 채워 넣는 빛(ambient·hemi)이 세야
// 형체가 보였다. 잔디로 바꾸면서 **낮만** 4.5 → 1.6 으로 내렸고, 나머지 셋은
// 그대로 2.4~3.4 로 남았다. 그 결과가 밤에 제일 심하게 드러났다 —
// 하늘은 #0b1430(거의 검정)인데 ambient 2.4가 잔디를 대낮처럼 밝혀서,
// "검은 우주에 떠 있는 초록 카펫"이 됐다. 밤답지도 낮답지도 않았다.
//
// 이제 넷 다 같은 기준을 쓴다: **태양이 형태를 만들고 ambient는 그림자 속을
// 채우기만 한다.**
//
// ─── 왜 광량이 통째로 절반 이하로 내려갔나 (그림자와 직결) ───────────────────
// 그림자를 켰는데 잔디에 아무것도 안 찍혔다. 배선 문제가 아니었다 — 태양만 켜고
// 나머지를 0으로 두면 그림자가 아주 선명하게 나왔으니까. **노출이 문제였다.**
//
// 렌더러는 ACES 필믹 톤매핑을 쓴다. 옛 값으로는 잔디 위에서 빛이 합쳐
// ambient 1.6 + hemi 1.0 + fill 0.95 + sun 2.3 ≈ 5.9 였는데, 잔디 알베도가
// 밝아서 초록 채널이 ACES의 어깨 구간(포화 직전)까지 올라간다. 거기서는
// 5.9든 3.6이든 출력이 거의 같은 값으로 눌린다 — **그림자가 눌려 사라졌다.**
//
// 그래서 둘을 같이 했다:
//   ① Canvas의 toneMappingExposure 0.68 — 전체를 어깨 구간 아래로 내린다
//   ② 채움광(ambient+hemi+fill) 합을 태양의 절반 이하로 — 태양이 형태를 만든다
// 전체가 밝거나 어둡다고 느껴지면 개별 intensity 말고 **노출 한 곳만** 만질 것.

export interface VillagePalette {
  /** 하늘 밑동(지평선) — fog 와 같은 색이라 먼 것이 하늘로 녹아든다 */
  skyHorizon: string;
  /** 하늘 꼭대기 */
  skyTop: string;
  fog: string;
  near: number;
  far: number;
  amb: number;
  sun: string;
  sunI: number;
  /** 태양(밤엔 달)의 위치. 고도가 곧 그림자 길이다 */
  sunPos: [number, number, number];
  /** 하늘에 그리는 해/달 원반의 반지름·색 */
  discRadius: number;
  discColor: string;
  fill: string;
  fillI: number;
  hSky: string;
  hGround: string;
  hI: number;
  /** 앰비언트 오클루전 — 접촉면 그늘의 색 */
  aoColor: string;
  /** 앰비언트 오클루전 세기 */
  aoI: number;
  /** 마을에 깔린 따뜻한 보조 pointLight 4개의 배율 */
  lamp: number;
  /** 건물 텍스처를 자기 발광으로 얼마나 되돌릴지 — 저녁에 창문이 켜지는 효과 */
  windowGlow: number;
  /** 구름 — 볕 받는 윗면 / 그늘진 밑면 / 덮는 정도(0이면 맑음) */
  cloudLight: string;
  cloudDark: string;
  cloudCover: number;
  label: string;
}

// ─── fog 범위 ─────────────────────────────────────────────────────────────────
// far 가 140~170 이던 시절엔 물 건너 산(r 62~130)이 통째로 안개에 지워졌다.
// 하늘 지평선 색과 fog 색이 같아서 산이 하늘에 완전히 녹아 **지평선이 그냥 선
// 하나**가 됐다 — 마을·절벽·물·산 네 겹을 쌓아 놓고 뒤의 두 겹을 안개로 지운 꼴.
// near 를 마을 바깥까지 밀어 마을은 또렷하게 두고, far 를 산 너머로 보내
// 산이 옅게라도 형태를 남기게 한다.

// ─── 창문 발광 (windowGlow) ───────────────────────────────────────────────────
// Bloom 을 켜면서 전부 두 배 넘게 올렸다. 문턱이 0.72 라 0.38 짜리 창문은
// 번지기는커녕 밝은 점으로도 안 걸렸다 — 켜 놓고도 아무 변화가 없었다.
// 낮에도 0 이 아니라 0.14 를 준다. 컨셉 아트는 한낮 그림에서도 창문마다 불이
// 들어와 있고, 그 작은 점들이 마을을 "사람이 사는 곳"으로 만든다.

// ─── 태양 고도 ────────────────────────────────────────────────────────────────
// 예전엔 [26, 34, 20] 고정이었다. 고도로 환산하면 46° — 한낮 각도다. 그래서
// 노을 색을 칠해 놓고 그림자는 정오처럼 짧은, 앞뒤가 안 맞는 그림이 나왔다.
// 컨셉 아트의 극적인 느낌은 태양이 낮아서 그림자가 길게 눕는 데서 온다.
// 새벽·노을은 15~17°로 내리고 방위를 반대편에 둬 아침/저녁이 구분되게 한다.

// ─── 왜 노을이 기본이 됐나 ────────────────────────────────────────────────────
// 컨셉 아트를 우리 렌더와 나란히 놓고 가장 크게 달랐던 게 빛이다. 컨셉의 인상은
// 구름이나 소품이 아니라 **낮게 깔린 노을 + 금색으로 타는 창문·등불**에서 온다.
// 우리는 8~17시가 전부 푸른 한낮이라, 방문자 대부분이 물 빠진 화면을 봤다.
//
// 시간대 기능 자체는 살린다(백엔드 마을 상태·NPC 기분이 여기 물려 있다).
// 대신 두 가지를 했다:
//   ① 노을 구간을 15~20시로 넓혀 저녁 접속이 전부 노을에 걸리게 한다
//   ② **한낮도 따뜻하게 내린다** — 태양 고도 52°→32°, 색을 미색에서 금색으로,
//      지평선을 주황빛 아지랑이로. 정오에 들어와도 컨셉 톤이 유지된다.
export function timePalette(hour: number): VillagePalette {
  if (hour >= 21 || hour < 5) {
    return {
      skyHorizon: "#24365e", skyTop: "#0b1430", fog: "#24365e", near: 62, far: 230,
      amb: 0.2, sun: "#9fb4e8", sunI: 0.95, sunPos: [-30, 44, -26],
      discRadius: 9, discColor: "#e8eeff",
      fill: "#3a4f8c", fillI: 0.14, hSky: "#22345e", hGround: "#141f26", hI: 0.24,
      // 밤은 태양(달)이 약해 형태를 거의 못 만든다. AO가 그 몫을 대신 지므로 제일 세다.
      aoColor: "#080d1e", aoI: 2.2,
      lamp: 2.6, windowGlow: 1.15,
      cloudLight: "#6b7ba6", cloudDark: "#1b2440", cloudCover: 0.6, label: "밤"
    };
  }
  if (hour < 8) {
    return {
      skyHorizon: "#f2cfad", skyTop: "#4d5f9c", fog: "#eccdb2", near: 72, far: 260,
      amb: 0.42, sun: "#ffd6a6", sunI: 2.5, sunPos: [-58, 17, 34],
      discRadius: 15, discColor: "#fff0d2",
      fill: "#ffc2d2", fillI: 0.35, hSky: "#f0c8a4", hGround: "#566a3a", hI: 0.5,
      aoColor: "#3b2c3a", aoI: 1.6,
      lamp: 1.2, windowGlow: 0.55,
      cloudLight: "#fff0ee", cloudDark: "#c79bb2", cloudCover: 0.75, label: "새벽"
    };
  }
  if (hour < 15) {
    return {
      // 지평선을 푸른 회색(#c3dcf2)에서 금빛 아지랑이로 바꿨다. 하늘 밑동은
      // fog 와 같은 색이라, 이 한 값이 먼 산·물·숲의 공기색까지 같이 따뜻하게 만든다.
      skyHorizon: "#f7d7a6", skyTop: "#3f7fc4", fog: "#f2d3ac", near: 78, far: 280,
      amb: 0.44, sun: "#ffe6b8", sunI: 3.0, sunPos: [34, 32, 26],
      discRadius: 11, discColor: "#fff8dc",
      fill: "#ffd9b0", fillI: 0.36, hSky: "#a8cfee", hGround: "#5a7a34", hI: 0.5,
      // 순수 검정으로 어둡게 하면 잔디 그늘이 때 탄 것처럼 보인다. 따뜻한 흙빛으로
      // 내려야 햇빛 아래 그늘로 읽힌다 — fog·지평선을 금빛으로 맞춘 것과 같은 이유.
      aoColor: "#2f2a1f", aoI: 1.5,
      // 컨셉은 한낮 그림에서도 창문마다 불이 들어와 있다. 0.14 는 Bloom 문턱(0.72)에
      // 걸리지도 않아 켜 놓으나 마나였다.
      lamp: 0.7, windowGlow: 0.4,
      cloudLight: "#ffffff", cloudDark: "#c2cfe0", cloudCover: 0.66, label: "낮"
    };
  }
  return {
    // 태양 고도 15°→11°. 그림자가 더 길게 눕는다.
    skyHorizon: "#ffae63", skyTop: "#2e2f6b", fog: "#f0b483", near: 72, far: 255,
    amb: 0.4, sun: "#ffa062", sunI: 3.1, sunPos: [58, 11, 26],
    discRadius: 19, discColor: "#fff2c8",
    fill: "#ffa878", fillI: 0.42, hSky: "#f0a068", hGround: "#4a4626", hI: 0.5,
    // 노을은 하늘이 보라(#2e2f6b)라 그늘에 그 색이 돈다.
    aoColor: "#33203a", aoI: 1.6,
    lamp: 2.1, windowGlow: 1.05,
    cloudLight: "#ffe3bd", cloudDark: "#8a6a86", cloudCover: 0.85, label: "노을"
  };
}

/**
 * AO 를 끄고 비교해 보고 싶을 때: /?ao=0
 *
 * AO 는 "켜면 좋아진다"가 아니라 세기·색·반경을 눈으로 맞춰야 하는 값이라,
 * 같은 각도에서 껐다 켰다 할 수 있어야 판단이 선다.
 */
export const AO_ENABLED =
  typeof window === "undefined" || new URLSearchParams(window.location.search).get("ao") !== "0";

/** 접속 시각 대신 원하는 시간대를 보고 싶을 때: /?hour=13 */
function paletteHour() {
  if (typeof window !== "undefined") {
    const forced = Number(new URLSearchParams(window.location.search).get("hour"));
    if (Number.isInteger(forced) && forced >= 0 && forced <= 23) return forced;
  }
  return new Date().getHours();
}

/**
 * 이번 방문의 팔레트. 모듈이 처음 로드될 때 한 번만 정해진다.
 * VillageScene 은 `ssr: false` 로 동적 로드되므로 이 모듈은 브라우저에서만
 * 평가된다 — 서버와 클라이언트가 다른 시각을 읽어 하이드레이션이 깨질 일이 없다.
 */
export const VILLAGE_PALETTE = timePalette(paletteHour());
