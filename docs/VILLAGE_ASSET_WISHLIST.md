# 마을에 아직 필요한 에셋 — 전부

> 2026-08-10 전면 재작성 → **2026-08-14 갱신 (광장 물 고리 작업 뒤).**
>
> 사용자 에셋 폴더 `바탕 화면/정재훈의 포트폴리오 모음집/3d 포트폴리오 마을에 대한 정보/`
> 하위를 GLB 72개·PNG 90여 장까지 전부 대조한 결과이고, 그 뒤로 받은 것까지 반영했다.
>
> 이 문서가 에셋 요청의 단일 출처다. `MESHY_VILLAGE_ASSETS.md` 는 대체됐다.
> 건물 프롬프트 원본은 `MESHY_BUILDING_PROMPTS.md` 에 있고, 여기에도 그대로 옮겨 적었다.

---

## 한눈에 — 지금 필요한 것

급한 순서. **① 은 지금 마을에서 눈에 걸리는 문제를 바로 고치는 것들이다.**

| #      | 무엇                    | 파일명                                      | 왜 지금                                                                                         |
| ------ | ----------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **B8** | **광장 문 아치 돌다리** | `props/raw/decor/bridge-arch.glb`           | 광장 물 고리에 문이 넷 생겼다. 지금은 골짜기 개울 다리와 **똑같은 모델**이라 정문으로 안 읽힌다 |
| **B9** | **물길 둔치 한 토막**   | `props/raw/decor/water-bank.glb`            | 물이 잔디에 칠한 파란 띠로 보인다. 물가에 자갈·둔덕이 있어야 깊이가 생긴다                      |
| **B2** | 지식 서고               | `buildings/raw/study-cs.glb`                | 건물 27채 중 마지막. 지금은 배경 민가가 대신 서 있다                                            |
| **B7** | 구역 축대 직선 한 토막  | `props/raw/decor/terrace-bank.glb`          | 코드로 그린 돌쌓기라 줄눈이 반듯한 격자다                                                       |
| B7     | 〃 바깥 모서리          | `props/raw/decor/terrace-bank-corner.glb`   | 〃                                                                                              |
| **C4** | 물가 소품 5종           | `props/raw/nature/reed-clump.glb` 외        | 물가 65유닛이 새로 생겼는데 심을 게 일반 덤불뿐이다                                             |
| **X1** | **`raw/` 원본 3개**     | `wall-low` · `fence-rail` · `terrace-steps` | 원본이 없어 **디라이팅에서 빠졌다.** 담장 218토막이 아직 옛 구운 조명을 달고 있다               |

> B8·B9·C4 는 2026-08-14 에 생겼다 — 광장을 두르는 물 고리를 넣으면서 물가가
> 마을 한복판으로 들어왔기 때문이다. 자세한 건 각 항목.
>
> B7 은 2026-08-11 에 생겼다. 받은 축대 에셋 세 개(`terrace-wall`·
> `terrace-slab`·`terrace-stair`) 중 **계단만 쓸 수 있었다** — 나머지 둘은
> 자기 잔디를 이고 있는 지형 덩어리라 사각형 단에 못 붙는다. 자세한 건 B7.

넣고 나서는 이거 한 줄이면 끝이다:

```bash
npm run optimize
```

**파일명이 곧 연결이다.** 건물은 파일명 = 건물 id 면 `optimize` 가 끝나면서
`src/data/buildingModels.json` 을 다시 써 자동으로 물려 준다.
장식물도 아래 이름 그대로면 배치 코드를 안 고쳐도 그 자리에 선다.

### 들어온 것 (아래 A·B 항목 본문은 재발주용으로 남겨 둔다)

A1 수어지구 · A2 아주분투 · A3 가치관 비석 · A4 투자 타워 · A5 도서관 ·
A6 SKILLS 아치 · B1 알고리즘 도장 · B3 연혁 타임라인 · B4 연락 우체국 · B5 CONTACT 아치 —
전부 입고 완료(5차). A7·A8 채움 민가는 받은 파일이 `house-a`·`house-b` 와
**바이트 단위로 같은 중복**이라 안 넣었고, B6 담장은 코드로 구워 해결했다.

---

## 지금 마을 상태 (2026-08-10 저녁)

- 건물 27채 중 **26채가 진짜 모델**이다. 남은 한 채가 `study-cs`(지식 서고)로,
  아직 배경 민가 GLB를 빌려 쓰고 있어서 STUDY 구역에서 이름표만 붙은 평범한 집으로 보인다.
- 구역 현판 아치 **6/6 완료.** 예전 팻말(`SIGN_OF`)은 이제 아무 데도 안 붙는다 —
  아치가 깨졌을 때 되돌릴 대역으로 표만 남겨 뒀다.
  (`arch-alt.glb` 는 EXPERIENCE 를 두 번 뽑은 중복본이라 여전히 미사용이다.)
- 채움 민가는 **3종으로 25채.** 한 블록 안에 같은 집이 두 번씩 나오는 건 그대로다 —
  급하진 않지만 2종(A7·A8)을 **새로** 뽑으면 눈에 띄게 나아진다.
- 담장은 `scripts/make-low-wall.mjs` 가 상자 둘로 구운 것이다. 128토막이 24삼각형씩
  = 3k 로 싸게 돌지만 무늬가 단조롭다. 급하지 않다.

---

# A. 이미지가 이미 있는 것 (8)

**그림을 다시 그리지 마세요.** 아래 파일을 Meshy `Image to 3D` 에 그대로 올리면 된다.
텍스트로 다시 뽑으면 화풍이 흔들리고, 특히 아치는 글자를 자주 틀린다.

경로는 전부 `바탕 화면/정재훈의 포트폴리오 모음집/3d 포트폴리오 마을에 대한 정보/` 기준.

| #   | 올릴 이미지                                                                           |
| --- | ------------------------------------------------------------------------------------- |
| A1  | `건물 찐 모음집/ChatGPT Image 2026년 8월 9일 오후 06_31_25.png` (흰 돔 + 손 모양)     |
| A2  | `포트폴리오건물모음집/아주대탐험.png`                                                 |
| A3  | `건물 찐 모음집/ChatGPT Image 2026년 8월 9일 오후 06_32_59.png` (가치관 비석)         |
| A4  | `건물 찐 모음집/ChatGPT Image 2026년 8월 9일 오후 06_33_14.png` (INVEST 저울 탑)      |
| A5  | `건물 찐 모음집/ChatGPT Image 2026년 8월 9일 오후 06_33_20.png` (LIBRARY 돔)          |
| A6  | `장식물사진/ChatGPT Image 2026년 8월 10일 오전 08_37_36.png` (SKILLS 아치)            |
| A7  | `장식물사진/장식물4/ChatGPT Image 2026년 8월 10일 오후 01_26_46.png` (파란 지붕 민가) |
| A8  | `장식물사진/장식물4/ChatGPT Image 2026년 8월 10일 오후 01_26_49.png` (붉은 지붕 민가) |

> 장식물4 의 민가 그림은 셋인데(파랑·빨강·초록) 초록만 3D로 뽑으셨다 — 그게 지금 `house-c` 다.

### 그래도 프롬프트가 필요하면 (다시 뽑거나 마음에 안 들 때)

이미지 생성 공통 프리픽스 — **건물 A1~A5 에 앞에 붙인다:**

```
3D rendered miniature fairytale village building, stylized low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures, warm golden-hour
sunset lighting with soft ambient shadows, cozy storybook mood,
front three-quarter view at eye level, entire building fully visible and
centered in frame, the signboard faces the viewer and is fully readable,
plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
```

공통 네거티브:

```
photorealistic, realistic, cluttered background, scenery, landscape, multiple
buildings, people, characters, cropped, cut off, top-down view, aerial view,
extreme perspective, fisheye, harsh shadows, neon cyberpunk, dark gloomy,
glass skyscraper, modern corporate, blurry, motion blur,
tiny sign, small text, illegible text, unreadable letters, blank signboard
```

#### A1. `project-sign-language.glb` — 수어지구 ✅ 입고 완료 (5차)

비율 둥근 돔 (2.0 / 1.8 / 2.0) · 포인트 색 하늘색

```
a soft rounded dome cottage with smooth curved white plaster walls, a stylized
open hand shape sculpted as a large decorative relief on the dome, gentle
circular windows, teal roof trim, a very large prominent rounded wooden
signboard spanning most of the front width above the door, reading "수어지구"
in big bold high-contrast Korean letters, the sign is a dominant feature of
the facade and clearly legible, light sky blue accents, calm welcoming shape
```

> 영문 대체: `reading "Sign Village"`

#### A2. `project-ajou-adventure.glb` — 아주분투 ✅ 입고 완료 (5차)

비율 아케이드형 (1.9 / 1.7 / 1.9) · 포인트 색 연두

```
a playful fantasy arcade hut with a rounded barrel roof, a big circular
porthole window, coin slot and joystick shaped decorations on the facade, a
striped awning, a very large prominent glowing marquee sign board spanning
the full front width above the entrance, reading "아주분투" in big bold
high-contrast Korean letters, the sign is a dominant feature of the facade
and clearly legible, bright lime green accents, cheerful chunky shape
```

> 영문 대체: `reading "AJOU RUN"`
> 이미 있는 그림에는 "아주대탐험" 이라고 쓰여 있다. 그대로 써도 상관없다 —
> 패널에 뜨는 이름은 간판이 아니라 `constants.ts` 가 정한다.

#### A3. `life-values.glb` — 가치관 비석 ✅ 입고 완료 (5차)

비율 작은 정육면체감 (1.3 / 1.3 / 1.3) · 포인트 색 앰버 · **건물 아님, 모뉴먼트**

```
a standing stone monument obelisk in a fairytale village, weathered carved
rock with a very large smooth engraved front plaque covering most of the
stone's face, reading "가치관" in big bold high-contrast Korean letters,
clearly legible, a small stone base with grass and flowers around it, a
lantern on a post beside it, warm amber accents, this is a monument NOT a
building, no roof, no windows, no door, compact standing stone
```

> 영문 대체: `reading "VALUES"`

#### A4. `life-invest.glb` — 투자 타워 ✅ 입고 완료 (5차)

비율 얇고 높음 (1.8 / **2.8** / 1.8) · 포인트 색 에메랄드

```
a tall slender fantasy treasury tower with stacked ledger and coin motifs, a
golden balance scale sculpture at the very top, small barred windows, ivy
climbing the base, a very large prominent engraved stone sign spanning the
full width above the door, reading "투자 타워" in big bold high-contrast
Korean letters, the sign is a dominant feature of the facade and clearly
legible, emerald green accents, clearly tall and narrow
```

> 영문 대체: `reading "INVEST"`

#### A5. `life-library.glb` — 도서관 ✅ 입고 완료 (5차)

비율 넓고 둥금 (2.2 / 1.8 / 2.2) · 포인트 색 샌드

```
a rounded fantasy library with a domed reading room, tall arched windows
glowing warm from inside, stacked book sculptures flanking the entrance, ivy
covered stone walls, a very large prominent classic carved sign spanning the
full width above the doors, reading "도서관" in big bold high-contrast Korean
letters, the sign is a dominant feature of the facade and clearly legible,
sandy beige accents, wide and rounded
```

> 영문 대체: `reading "LIBRARY"`

#### A6. `arch-skills.glb` — SKILLS 현판 아치 ✅ 입고 완료 (5차)

이미 받은 아치 4개와 **같은 형태·같은 두께**여야 한다. 색만 구역 색으로.

```
Stylized fantasy village district gateway archway, two thick stone-and-timber
posts supporting a wide curved wooden banner board spanning between them,
the banner reads "SKILLS" in large bold gold serif capital letters,
teal-painted banner with gold trim and iron rivets, small hanging lanterns and
narrow vertical pennant flags on each post, moss and ivy at the base,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
low poly game asset, under 8000 triangles, front-facing flat composition
```

> **뽑고 나서 텍스처를 눈으로 확인할 것.** 글자가 "SKILLS" 로 제대로 나왔는지.
> EXPERIENCE 가 두 번 나온 게 이걸 안 봐서 생긴 일이다.

#### A7 · A8. `house-d.glb` · `house-e.glb` — 채움 민가

받은 세 채와 **같은 2층·같은 눈높이.** 지붕 색과 평면 모양만 다르게.

```
Small two-storey fantasy village cottage, blue slate roof, white plaster walls
with dark timber trim, narrow tall footprint, warm glowing windows,
wooden front door, small chimney, flower box under one window,
standing alone on flat ground, warm sunset lighting,
Ghibli-like storybook game art, soft painterly textures,
low poly game asset, under 8000 triangles, front-facing
```

`house-e` 는 첫 줄만 바꾼다: `red clay tile roof, half-timbered walls, squarish footprint`.

> 여유가 되면 `house-f` 도. 지금 3종으로 26채를 돌려쓰는데 6종이면 거의 안 겹친다.
> `house-f` 첫 줄: `purple tile roof, grey stone walls, with one small attached tower`.

---

# B. 그림부터 그려야 하는 것 (6)

## B1. `study-codingtest.glb` — 알고리즘 도장 ✅ 입고 완료 (5차)

비율 세로로 높음 (1.9 / **2.4** / 1.9) · 포인트 색 스카이 · 위 공통 프리픽스를 앞에 붙인다

```
a tall fantasy martial arts dojo tower with a tiered pagoda roof and upturned
eaves, wooden training posts and a practice dummy at the entrance, paper
lanterns hanging along the roof edges, a very large prominent horizontal
wooden sign spanning the full width above the door, reading "알고리즘 도장" in
big bold high-contrast Korean letters, the sign is a dominant feature of the
facade and clearly legible, sky blue accents, taller than wide
```

> 영문 대체: `reading "ALGO DOJO"` · 세로 걸개는 글자가 뭉개져서 **가로 간판**으로 바꿨다.

## B2. `study-cs.glb` — 지식 서고 ← **★ 지금 필요한 건 이거 하나뿐**

비율 둥근 중형 (2.0 / 1.9 / 2.0) · 포인트 색 퍼플

> 이게 없어서 STUDY 구역의 한 채가 배경 민가로 대신 서 있다.
> 이미 들어온 `life-library`(돔 도서관)와 **다르게** 보여야 하니
> 돔보다 "책·두루마리가 꽂힌 서고" 쪽 인상을 강하게 주는 게 좋다.

```
a rounded fantasy archive vault with a domed roof, scroll racks and stacked
tomes visible through arched windows, a stone reading pedestal outside, carved
knowledge runes on the walls, a very large prominent engraved sign spanning
the full width over the entrance arch, reading "지식 서고" in big bold
high-contrast Korean letters, the sign is a dominant feature of the facade
and clearly legible, purple accents, rounded and solid
```

> 영문 대체: `reading "CS ARCHIVE"`

## B3. `life-timeline.glb` — 연혁 타임라인 ✅ 입고 완료 (5차)

비율 가장 얇고 높음 (1.6 / **3.0** / 1.6) · 포인트 색 하늘색

```
a very tall thin fantasy lighthouse clocktower with stacked ring bands marking
years along its height, a glowing lantern room at the very top, a spiral
staircase wrapping around the exterior, a very large prominent sign board
mounted across the full width near the base, reading "연혁 타임라인" in big
bold high-contrast Korean letters, the sign is a dominant feature and clearly
legible, light sky blue accents, extremely tall and narrow
```

> 영문 대체: `reading "TIMELINE"`

## B4. `post-office.glb` — 연락 우체국 ✅ 입고 완료 (5차)

비율 아담함 (2.1 / 1.5 / 1.9) · 포인트 색 오렌지

```
a charming fantasy village post office with a bright red tiled roof, a round
mailbox and letter slot beside the door, envelope and carrier-bird motifs on
the facade, a small chimney, a very large prominent painted sign spanning the
full width above the entrance, reading "연락 우체국" in big bold high-contrast
Korean letters, the sign is a dominant feature of the facade and clearly
legible, warm orange accents, cozy and welcoming
```

> 영문 대체: `reading "POST OFFICE"`

## B5. `arch-contact.glb` — CONTACT 현판 아치 ✅ 입고 완료 (5차)

A6 과 같은 프롬프트에서 두 곳만 바꾼다: `"SKILLS"` → `"CONTACT"`,
`teal-painted` → `deep green painted`.

## B6. `wall-low.glb` · `wall-low-corner.glb` — 가벼운 낮은 담장

> ⚠️ **받은 축대벽으로는 안 된다.** `Verdant_Rampart`(= `terrace-wall`)가 한 덩이
> **10,612 삼각형**이라 블록 하나 두르는 데 18개면 그것만 19만이다. 마을 전체에
> 130토막이 깔리는 물건이라 **1,500 이하가 절대 조건**이다. 지금은
> `scripts/make-low-wall.mjs` 가 24삼각형짜리를 구워 대신 쓰고 있다.

- 길 타일과 같은 **1.9 폭에 딱 맞는 한 토막.** 이어 붙이므로 좌우 끝면이 평평해야 한다
- 높이는 폭의 3분의 1 (허리 높이)

```
Single straight segment of a low stylized stone garden wall, waist height,
one module of a repeating fence line, flat square ends on both left and right
so segments tile seamlessly with no gap, pale grey cut stone blocks with a
flat capstone on top, patches of green moss, a few small wildflowers at the
base, warm sunset lighting, Ghibli-like storybook game art,
soft painterly textures, muted natural colors,
VERY LOW POLY, flat shaded, minimal geometric detail, no separate small props,
under 1500 triangles, front-facing
```

모서리용은 `Single straight segment` → `Single 90-degree corner piece`,
`flat square ends on both left and right` → `flat square ends on the two open sides`.

> 파일명을 `wall-low.glb` 로 하면 지금 코드가 굽는 임시본을 **그대로 덮어쓴다.**
> 배치 코드는 한 줄도 안 고쳐도 된다. 모서리 조각은 지금 코드가 안 쓰므로
> 들어오면 그때 배치 규칙을 붙이면 된다.

---

## B7. `terrace-bank.glb` · `terrace-bank-corner.glb` — 구역 단 옆면(축대) ← **★ 지금 필요**

### 왜 또 축대인가 — 이미 세 개를 받았는데

받은 세 개는 전부 **자기 땅을 들고 있는 지형 덩어리**라서, 우리처럼 사각형 단을
코드로 만드는 마을에는 못 붙인다. 굽어서 위·옆에서 본 그림으로 확인한 결론이다:

| 받은 것                                    | 실제 모양                                              | 왜 못 쓰나                                                                                                                                                  | 지금 쓰임                    |
| ------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `terrace-wall`<br>(Verdant Rampart)        | **ㄱ자 모서리** 벽 + 위에 잔디·나무 울타리             | 직선 구간에 늘어놓으면 ㄱ자만 되풀이된다. 모서리에 맞춰 놓으려면 원점이 단 **안쪽**으로 들어가는데, 그러면 `terrainHeightAt` 이 1.1 을 얹어 **통째로 뜬다** | 아치 옆 문기둥 11개          |
| `terrace-slab`<br>(Verdant Stone Terrace)  | **사방이 벽인 단 한 칸** (가운데 잔디, 두 변에 울타리) | 사방이 막혀 있어 이어 붙일 수가 없다. 단 가장자리에 놓으면 안쪽 벽이 포장을 뚫고 올라온다                                                                   | **없음**                     |
| `terrace-stair`<br>(Overgrown Stone Stair) | 양옆에 석주가 선 **돌계단**                            | — 이건 딱 맞는다                                                                                                                                            | **구역 대문 23곳 + 정문** ✅ |

그래서 직선 축대는 지금 `VillageScene.tsx` 의 `TerraceBanks` 가 코드로 그린다
(단면 세 마디 + `src/lib/terraceBank.ts` 의 런타임 돌쌓기 텍스처, 합계 288 삼각형).
**돌아는 가지만 손그림이 아니다** — 줄눈이 반듯한 격자라 판석·건물의 손맛과 다르다.

### 필요한 것

여섯 구역 둘레가 **280유닛(150토막)** 이다. 담장(B6)과 같은 이유로 **1,200 이하가
절대 조건**이다. 받은 `terrace-wall` 은 8,373 이라 150개면 그것만 126만이다.

- **잔디를 붙이지 말 것.** 벽면만. 윗면은 우리 판석이 덮는다
- **울타리도 붙이지 말 것.** 그건 이미 `wall-low` 가 단 위에 따로 선다
- 폭 1.9, 높이 1.1 (폭의 약 60%). 좌우 끝면이 평평해야 이어 붙는다
- 발치의 지대석과 꼭대기의 갓돌이 **좌우로 관통**해야 토막끼리 선이 이어진다

```
Single straight segment of a stylized stone retaining wall for a raised
garden terrace, one module of a long repeating wall, flat square ends on both
left and right so segments tile seamlessly with no gap, wall face only with
NO grass or soil on top and NO fence, pale warm grey cut stone blocks in
staggered courses, a projecting plinth course at the bottom and a flat
overhanging capstone running straight across the top, green moss and small
ivy at the base, wider than tall,
warm sunset lighting, Ghibli-like storybook game art,
soft painterly textures, muted natural colors,
VERY LOW POLY, flat shaded, minimal geometric detail, no separate small props,
under 1200 triangles, front-facing
```

모서리용(`terrace-bank-corner.glb`)은 `Single straight segment` →
`Single 90-degree outer corner piece`, `flat square ends on both left and right` →
`flat square ends on the two open sides`.

> 들어오면 `TerraceBanks` 의 코드 지오메트리를 이 조각 늘어놓기로 바꾼다.
> 단면 상수(`PLINTH_OUT` / `CAP_OUT`)와 `terraceBank.ts` 는 그때 지운다.
> **높이는 `TERRACE_STEP`(1.1)에 맞춰 코드가 다시 스케일하므로 신경 안 써도 된다.**

---

## B8. `bridge-arch.glb` — 광장 문 아치 돌다리 ← **★ 지금 필요**

### 왜

2026-08-14 에 **광장을 두르는 물 고리**(반지름 7.2~10.3)를 넣었다. 컨셉 아트에서
물은 광장에서 뻗는 바큇살이 아니라 광장을 **감싸고** 있고, 그래서 어느 구역에 가든
다리를 하나 건넌다 — 그 다리가 구역의 정문이다.

지금 마을에 다리가 16개인데 **전부 같은 `bridge-stone`** 이다:

| 어디                          | 개수  | 성격                              |
| ----------------------------- | ----- | --------------------------------- |
| 광장 물 고리 (동·서·남·북 문) | **4** | 마을의 정문. 사람이 반드시 지난다 |
| 구역 사이 골짜기 물길         | 10    | 들판을 건너는 시골 개울 다리      |
| 해자 남북 참배로              | 2     | 마을 밖으로 나가는 큰 다리        |

넷이 열여섯 중 하나로 보이면 문이 문으로 안 읽힌다.

### 필요한 것

- **폭이 길 타일과 같아야 한다 (1.9).** 이어 붙이지는 않으므로 끝면은 평평할 필요 없다
- **길이 3.5 이상.** 물 고리 폭이 1.24 인데 양 둔치를 물고 앉아야 한다
- **난간이 있어야 한다.** 지금 `bridge-stone` 은 난간이 낮아 부감에서 그냥 판석 조각이다
- 아치가 **아래로 뚫려** 있어야 한다 — 물이 밑으로 지나가는 게 보여야 다리다
- 길 축이 **+X** (지금 `bridge-stone` 과 같은 규칙. 코드가 물 진행 방향의 법선에 맞춰 돌린다)

```
Single stylized fantasy stone arch bridge spanning a small canal, one wide
semicircular arch opening underneath so water passes through and the opening
is clearly visible from the side, low stone parapet railings running along
both sides with small carved posts at the four corners, pale warm grey cut
stone with mossy joints, a hanging lantern on one corner post, gentle hump in
the deck, standing alone with no ground or water attached,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
muted natural colors, low poly game asset, under 6000 triangles, side view
```

> 파일명을 `bridge-arch.glb` 로 넣으면 `generate-decor-layout.mjs` 의 `KIT` 에
> 한 줄 추가하고 광장 고리 다리만 이걸로 바꾼다. 골짜기 개울은 `bridge-stone` 유지.

---

## B9. `water-bank.glb` — 물길 둔치 한 토막 ← **★ 지금 필요**

### 왜 — "물에 깊이감이 전혀 안 느껴진다"

정확한 지적이다. 지금 물은 **잔디 위에 얹은 평평한 리본 한 장**이다:

- 수면이 `y = 0.05` 한 장, 그 밑 땅도 `y ≈ 0` — **깊이가 5cm** 다
- `villageRelief` 가 물 밑을 **일부러 평평하게** 만든다. 굽이가 수면 위로 올라오면
  물이 통째로 사라지기 때문인데, 그 결과 파인 자리 자체가 없다
- 물가에 자갈도 둔덕도 없어서 잔디와 만나는 선이 **칼로 자른 듯 딱** 떨어진다

땅을 파는 건 코드로 할 일이지만(아래 「물에 깊이를 주려면」), **물가의 재료**는
에셋이라야 한다. 축대(`TerraceBanks`)와 똑같은 구조로 물길 양옆에 늘어놓는다.

### 필요한 것

여섯 물길 + 고리 둘레가 **약 320유닛(양옆 합쳐 340토막)** 이다. 담장·축대와 같은
이유로 **1,000 이하가 절대 조건**이다.

- 폭 1.9, 높이 0.5 (물길 깊이). 좌우 끝면이 평평해야 이어 붙는다
- **위쪽 절반은 잔디 둔덕, 아래쪽 절반은 젖은 자갈·돌**. 그 경계가 수면선이 된다
- **물을 붙이지 말 것.** 물은 우리 리본이 그린다
- **바닥(하상)도 붙이지 말 것.** 한 면만 — 물길 양옆에 마주보게 세운다

```
Single straight segment of a shallow stream bank, one module of a long
repeating riverbank edge, flat square ends on both left and right so segments
tile seamlessly with no gap, viewed from the water side: wet rounded pebbles
and small mossy rocks along the bottom half, a low grassy earth lip with a few
reeds along the top half, NO water and NO riverbed attached, only the bank
face, much wider than tall,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
muted natural colors, VERY LOW POLY, flat shaded, minimal geometric detail,
no separate small props, under 1000 triangles, front-facing
```

모서리는 필요 없다 — 물길이 굽이치므로 토막을 **각도로 돌려** 잇는다
(축대와 다른 점. 축대는 직각 사각형이라 모서리 조각이 필요했다).

---

# C. 있으면 더 좋은 것 (급하지 않음)

지금도 돌아간다. 마을이 안 비어 보이는 데 필요하진 않다.

### C1. 개울 타일 2종 — `props/raw/ground/stream-straight.glb` · `stream-curve.glb`

> 지금은 `VillageScene.tsx` 의 `Creek` 이 잔디 위에 물 리본을 얹어 놨다(삼각형 180개).
> 부감에서 개울로 보이지만 자갈·둔치가 없다.

`ground` 폴더가 맞다 — 여기 것만 강한 simplify 와 "그림자를 받기만 함" 규칙을 탄다.
네 변이 평평하고, 물줄기가 타일 가장자리 **한가운데**에서 끊겨야 이어 붙는다.

```
Top-down square tile of a shallow clear stream running straight through green
grass, the water crosses the tile from one edge to the exact opposite edge and
touches each edge at its exact midpoint so tiles connect seamlessly,
smooth pebbles under clear turquoise water, mossy grass banks on both sides,
completely flat thin slab, warm sunset lighting,
Ghibli-like storybook game art, soft painterly textures,
VERY LOW POLY, flat shaded, orthographic top view
```

곡선용은 `from one edge to the exact opposite edge` →
`from one edge to the adjacent edge in a smooth quarter turn`.

### C2. 노점 2종 — `props/raw/decor/stall-awning.glb` · `stall-fruit.glb`

컨셉 STUDY 구역 앞에 천막 노점이 줄지어 있다. 우리는 `market-stall` 하나뿐.

```
Small fantasy market stall with a striped red and cream fabric awning on four
wooden posts, wooden counter piled with goods, crates and a barrel beside it,
hanging lantern on one corner post, standing on flat paving,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
low poly game asset, under 4000 triangles, front-facing
```

### C3. 마무리 소품 10종

전부 `props/raw/decor/` (마지막 둘만 `props/raw/nature/`). **전부 1,500 삼각형 이하.**

| 파일명                 | 무엇                     | 프롬프트 앞부분                                                                                          |
| ---------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `easel.glb`            | 이젤                     | `Wooden artist easel holding a small painted canvas, a paint palette and brushes hanging from one leg`   |
| `anvil.glb`            | 모루                     | `Blacksmith anvil on a thick wooden stump, a hammer resting on top and tongs leaning against the side`   |
| `book-stack.glb`       | 책더미                   | `Stack of five worn leather-bound books with cloth bookmarks, one open book resting on top`              |
| `scroll-rack.glb`      | 두루마리 선반            | `Small wooden rack holding rolled parchment scrolls, one scroll unrolled and hanging over the front`     |
| `signpost-arrow.glb`   | 이정표                   | `Wooden signpost with three arrow-shaped direction boards pointing different ways, small lantern on top` |
| `brazier.glb`          | 화로                     | `Standing iron brazier bowl on three legs with glowing orange embers and small flames`                   |
| `bell-tower-small.glb` | 작은 종탑                | `Small open wooden bell tower with a tiled pyramid roof and a bronze bell hanging inside`                |
| `hedge-round.glb`      | 다듬은 관목              | `Neatly trimmed round topiary bush in a square stone planter`                                            |
| `tree-pine-tall.glb`   | 키 큰 침엽수 → `nature/` | `Very tall narrow dark green pine tree, single trunk, layered conical foliage`                           |
| `tree-willow.glb`      | 수양버들 → `nature/`     | `Weeping willow tree with long drooping pale green branches`                                             |

공통 꼬리말:

```
, standing alone on flat ground, warm sunset lighting,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
VERY LOW POLY, flat shaded, under 1500 triangles, front-facing
```

### C4. 물가 소품 5종 — 광장 물 고리가 생기면서 필요해졌다

물 고리(둘레 약 60유닛)와 물길 여섯 줄기의 물가가 **마을에서 사람이 제일 가까이
가는 물**인데, 지금 그 띠에 심는 게 일반 덤불·꽃뿐이다. 물가로 안 읽힌다.

| 파일명                 | 폴더      | 프롬프트 앞부분                                                                                            |
| ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `reed-clump.glb`       | `nature/` | `Clump of tall slender water reeds and cattails growing from wet mud, a few bent stems`                    |
| `lily-pads.glb`        | `nature/` | `Small cluster of flat round lily pads with two white water lilies, floating flat`                         |
| `stepping-stones.glb`  | `decor/`  | `Row of five flat weathered stepping stones of different sizes, wet mossy tops, arranged in a gentle line` |
| `water-mill-small.glb` | `decor/`  | `Small wooden water wheel on a stone footing, half of the wheel below the axle, mossy paddles`             |
| `dock-small.glb`       | `decor/`  | `Very small wooden jetty of weathered planks on short posts, a coil of rope and a lantern at the end`      |

`lily-pads` 만 꼬리말에서 `standing alone on flat ground` 를 빼고
`floating flat on water, no water attached` 로 바꾼다.

---

# X. 코드가 막혀 있는 것 — 에셋이 아니라 **원본 파일**이 필요하다

## X1. `wall-low` · `fence-rail` · `terrace-steps` 의 `raw/` 원본

2026-08-13 에 **디라이팅**(에셋마다 다른 구운 조명을 한 수준으로 맞추는 것)을 넣었다.
`scripts/optimize_textures.py` 가 `raw/` 에 있는 원본 텍스처를 읽어 저주파 밝기 편차를
줄인 뒤 다시 굽는 방식이라, **`raw/` 가 없는 것은 통째로 건너뛴다.**

이 셋이 그렇다:

| 파일                      | 왜 raw 가 없나                                              | 지금 상태                     |
| ------------------------- | ----------------------------------------------------------- | ----------------------------- |
| `decor/wall-low.glb`      | `scripts/make-low-wall.mjs` 가 **코드로 굽는다**            | 담장 218토막이 옛 조명 그대로 |
| `decor/fence-rail.glb`    | `scripts/make-fence-rail.mjs` 가 코드로 굽는다              | 울타리 11토막                 |
| `decor/terrace-steps.glb` | 〃 (지금은 받은 `terrace-stair` 를 쓰지만 폴백이 남아 있다) | —                             |

**두 갈래 중 하나면 된다:**

1. **B6·B7 을 받는다** — 진짜 손그림 GLB 가 들어오면 `raw/` 가 생기므로 저절로 풀린다.
   이쪽이 낫다. 어차피 코드로 구운 담장은 무늬가 단조롭다는 문제도 같이 있다.
2. 아니면 굽는 스크립트가 만드는 텍스처를 `raw/` 에도 같이 써 두게 고친다.
   무늬 문제는 안 풀리고 톤만 맞는다.

---

# 규격 (전부 공통)

| 항목     | 값                                                                              |
| -------- | ------------------------------------------------------------------------------- |
| 포맷     | GLB (텍스처 포함), Y-up                                                         |
| 원점     | **바닥 중심.** 물체가 원점 위에 서 있어야 한다                                  |
| 크기     | 신경 쓰지 말 것 — Meshy가 긴 변을 1.9로 정규화하고 코드가 다시 맞춘다           |
| **비율** | **지킬 것.** 바닥면 대각선으로 배율을 잡으므로, 납작하게 그리면 그만큼 낮아진다 |
| 앞면     | **+Z 방향**이 정면 (간판·문이 +Z를 보게)                                        |

Meshy Image-to-3D 설정: Art Style `Stylized` · Topology `Quad` · Polycount `Low ~ Medium` ·
Texture `On` (간판 글자가 텍스처로 구워져야 한다) · Symmetry `Auto` (비대칭이면 `Off`)

넣는 위치:

```bash
public/models/buildings/raw/<건물id>.glb        # 건물
public/models/props/raw/<카테고리>/<이름>.glb   # 장식물
npm run optimize
```

카테고리는 `decor` / `nature` / `signs` / `ground` 중 하나. **폴더가 최적화 강도와
그림자 규칙을 결정**하므로 아무 데나 넣으면 안 된다
(`scripts/optimize-glb.mjs` 의 `passesFor`, `InstancedProps.tsx` 의 `shadowRole`).

> ⚠️ 새 카테고리 폴더를 만들면 반드시 그 안에 `raw/` 도 만들 것. `raw/` 가 없으면
> optimize 가 조용히 건너뛰어 텍스처가 통째로 예산을 잡아먹는다.
> (`environment/statue.glb` 가 실제로 그래서 혼자 89MB를 먹고 있었다.)

## 삼각형 예산 — 프롬프트 꼬리에 반드시 넣을 말

계기판(F8) 경고선을 **180만 / 텍스처 340MB** 로 올렸다(`PerfHud.tsx`). 100만은 건물
18채뿐이던 시절의 값이라 의미가 없어졌다. 지금 실측 **약 123만**이고 fps 는 안 떨어졌다 —
전부 인스턴싱이라 draw call 이 안 늘기 때문이다. 진짜 지표는 fps 와 draw call 이다.

그래도 아껴야 한다. Meshy는 그냥 두면 돌덩이 하나를 1만 삼각형으로 뽑고, 벽돌·잎사귀처럼
UV 섬이 많으면 **simplify가 거의 안 먹는다** — 받은 축대벽을 오차 0.05까지 올려도
10,612 → 8,191 에서 멈췄다. 처음부터 가볍게 뽑는 수밖에 없다.

| 쓰임새                        | 목표           | 프롬프트 꼬리에 붙일 말                                                                               |
| ----------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| 수십 개 반복 (담장·깃대·소품) | **1,500 이하** | `VERY LOW POLY, flat shaded, minimal geometric detail, no separate small props, under 1500 triangles` |
| 열 개 안팎 (민가·아치·노점)   | 8,000 이하     | `low poly game asset, under 8000 triangles`                                                           |
| 한두 개 (건물·랜드마크)       | 자유           | —                                                                                                     |

## 공통 화풍 꼬리말 (장식물용)

건물이 아닌 것은 프롬프트 끝에 이걸 붙인다. 이게 있어야 이미 있는 70여 종과 톤이 맞는다.

```
, warm sunset lighting, Ghibli-like storybook game art,
soft painterly textures, muted natural colors, front-facing
```

---

# 코드로 해결한 것 — 에셋 안 받아도 됨

| 무엇                      | 어떻게                                                                                                                                                                                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 판석 포장                 | `scripts/make-paving-tile.mjs` — 받은 손그림(Mossy Cobblestone)에서 윗면을 오려 **삼각형 2개**짜리 평면에 입힌다. 원본 GLB는 8,476 삼각형이라 386장이면 327만이다. 오릴 때 가장자리를 이웃 화소와 섞어 이어붙게 만들고, 칸마다 90°씩 돌려 반복 주기를 네 배로 늘린다 |
| 길 갓길                   | `scripts/make_paved_road_tiles.py` — 길 타일의 **초록 잔디 갓길**을 판석 색으로 바꾼 변종. 포장 위를 지나는 길에만 쓴다. 안 바꿨을 땐 돌마당에 초록 격자가 떠올랐다                                                                                                  |
| 낮은 담장                 | `scripts/make-low-wall.mjs` — 상자 둘, **24 삼각형**. 130토막으로 여섯 블록을 두르고 길이 지나는 자리는 비워 구역 대문이 된다. B6 이 오면 교체                                                                                                                       |
| **구역 단차**             | `src/lib/villageTerrain.ts` + `VillageScene.tsx` 의 `TerraceBanks` — 여섯 구역을 두 계단(0 → 0.35 → 0.7) 올려 컨셉 아트의 계단식 마을을 만든다. 옆구리 축대가 **96 삼각형**. 아래 「구역 단차는 어떻게 도나」 참고                                                   |
| 길가 울타리               | `scripts/make-fence-rail.mjs` — 기둥 둘 + 가로대 둘, **36 삼각형**. 받은 `fence.glb` 는 1,473 이라 130토막을 못 깐다(19만). 컨셉에서 길이 "길"로 보이는 건 포장색이 아니라 양옆을 따라가는 이 선 두 줄이다                                                           |
| 마을을 두르는 해자        | `VillageScene.tsx` 의 `Waterways` — 타원 한 바퀴 리본. 북쪽 꼭짓점이 예전 개울 자리(z −20.7)에 정확히 와서 돌다리·참배로를 그대로 쓴다                                                                                                                               |
| **광장을 두르는 물 고리** | `generate-ground-layout.mjs` 가 구역 단 발치까지 남은 실거리를 재서 반지름을 정하고(7.2~10.3), `villageTerraces.json` 의 `plazaRing` 으로 내보낸다. 씬·장식물 생성기가 같은 값을 읽어 다리를 놓는다. **길 고리는 걷어냈다** — 같은 띠를 물과 다퉜다                  |
| 구름 하늘                 | `src/lib/skyClouds.ts` — 값 노이즈로 1024×512 캔버스 텍스처를 **런타임에** 굽는다. 색을 시간대 팔레트에서 받아야 해서 파일로 못 둔다                                                                                                                                 |
| 잔디 텍스처               | `scripts/make-grass-texture.mjs`                                                                                                                                                                                                                                     |
| 먼 숲                     | `scripts/bake-impostors.mjs` — 나무 한 그루를 4~6삼각형 빌보드로                                                                                                                                                                                                     |
| 하늘·해·물·절벽·먼 산     | `VillageScene.tsx` 에서 절차적으로                                                                                                                                                                                                                                   |
| 계절·시간대 파티클        | `SeasonAmbience.tsx`                                                                                                                                                                                                                                                 |

---

# 입고 완료

## 1차 (2026-08-08) — 장식물 28종

`lantern-post` `notice-board` `leaf-banner` `scroll-barrel` `sign-*`(6) `gate-arch`
`market-stall` `bunting` `mailbox` `campfire` `candle-tome` `orb-lantern` `lantern-archway`
`lantern-bearer` `lute-picnic` `fence` `stump-forge` `bench` `flower-pot` `fountain` `well`
`barrel-iron` `sign-theme-project`

## 2차 (2026-08-09) — 건물 18채 + 나무·바위 7종

건물 18채는 `MESHY_BUILDING_PROMPTS.md` 참고.
`tree-golden-canopy` `tree-emerald-crown` `tree-sakura` `tree-petal-parade`
`bush-emerald-berry` `rock-verdant-boulder` `rock-three-stones`

## 3차 (2026-08-10 새벽) — 아치·민가·석축

| 파일                        | 쓰이는 곳                                                    | 삼각형 |
| --------------------------- | ------------------------------------------------------------ | ------ |
| `decor/arch-projects.glb`   | PROJECTS 입구 현판                                           | 6,350  |
| `decor/arch-study.glb`      | STUDY 입구 현판                                              | 7,642  |
| `decor/arch-experience.glb` | EXPERIENCE 입구 현판                                         | 6,955  |
| `decor/arch-life.glb`       | LIFE 입구 현판                                               | 7,832  |
| `decor/house-a.glb`         | 채움 민가 (붉은 기와)                                        | 8,705  |
| `decor/house-b.glb`         | 채움 민가 (청회색 슬레이트)                                  | 11,856 |
| `decor/terrace-wall.glb`    | 아치 옆 문기둥 · 정문 석축                                   | 10,612 |
| `decor/terrace-stair.glb`   | 남쪽 정문 대계단                                             | 10,052 |
| `decor/terrace-slab.glb`    | **안 씀** — 한 장 1만 삼각형이라 포장으로 못 쓴다            | 10,174 |
| `decor/arch-alt.glb`        | **안 씀** — EXPERIENCE 글자 중복 (원래 SKILLS여야 했다 → A6) | 7,015  |

## 4차 (2026-08-10 오후) — 바닥·랜드마크

| 파일                            | 쓰이는 곳                                          | 삼각형 |
| ------------------------------- | -------------------------------------------------- | ------ |
| `ground-flat/paving-square.glb` | 구역 바닥 판석 386장 (손그림에서 구움)             | **2**  |
| `ground-flat/paved/*.glb`       | 포장 위를 지나는 길 6종 (갓길을 돌색으로)          | 2      |
| `decor/wall-low.glb`            | 블록 담장 130토막 (**코드 생성**, B6 이 오면 교체) | 24     |
| `decor/flagpole-banner.glb`     | 대로변·광장 깃대                                   | 3,483  |
| `decor/flowerbed-round.glb`     | 포장 위 원형 화단                                  | 9,898  |
| `decor/house-c.glb`             | 채움 민가 3종째 · 모델 없는 건물 폴백              | 8,010  |
| `decor/bridge-stone.glb`        | 북쪽 참배로가 개울 건너는 돌다리                   | 6,448  |
| `decor/island-north.glb`        | 북쪽 "AI Portfolio" 섬 (아래를 묻어 언덕으로)      | 12,325 |
| `decor/pagoda-portfolio.glb`    | 그 위 파고다 랜드마크                              | 7,617  |
| `decor/windmill.glb`            | 북동 언덕 풍차                                     | 8,768  |
| `decor/waterfall.glb`           | 섬 테두리 폭포 3곳                                 | 11,546 |

## 5차 (2026-08-10 저녁) — 건물 8채 + 아치 2개

이걸로 건물이 **26/27** 이 됐고 구역 아치가 **6/6** 이 됐다.

| 받은 파일                                   | 넣은 이름                                  | 쓰이는 곳                 |
| ------------------------------------------- | ------------------------------------------ | ------------------------- |
| `Meshy_AI_Palm_Welcome_House_0810064653`    | `buildings/raw/project-sign-language.glb`  | 수어지구                  |
| `Meshy_AI_Whimsical_Adventure_H_0810071057` | `buildings/raw/project-ajou-adventure.glb` | 아주분투                  |
| `Meshy_AI_Monument_of_Values_0810064219`    | `buildings/raw/life-values.glb`            | 가치관 비석               |
| `Meshy_AI_Tower_of_Investment_0810064212`   | `buildings/raw/life-invest.glb`            | 투자 타워                 |
| `Meshy_AI_Grand_Dome_Library_0810064207`    | `buildings/raw/life-library.glb`           | 도서관                    |
| `Meshy_AI_Timeline_Tower_0810064658`        | `buildings/raw/life-timeline.glb`          | 연혁 타임라인             |
| `Meshy_AI_Algorithmic_Pagoda_0810064707`    | `buildings/raw/study-codingtest.glb`       | 알고리즘 도장             |
| `Meshy_AI_Enchanted_Post_Office_0810064714` | `buildings/raw/post-office.glb`            | 연락 우체국               |
| `Meshy_AI_Skills_Archway_0810071103`        | `props/raw/decor/arch-skills.glb`          | SKILLS 입구 현판 (6,975)  |
| `Meshy_AI_Contact_Gate_0810071106`          | `props/raw/decor/arch-contact.glb`         | CONTACT 입구 현판 (6,984) |

> 같은 배치로 받은 `Blue_Slate_Cottage` · `Hearthside_Cottage` 는 이미 들어와 있는
> `house-a` · `house-b` 와 **바이트 단위로 동일**해서 안 넣었다. A7·A8 채움 민가를
> 늘리려면 그 둘과 다른 그림으로 다시 뽑아야 한다.

> `Mossy_Cobblestone_Tile` 원본 GLB 는 **안 쓴다** — 그림만 뽑아 평면에 입혔다.
> 원본 PNG 는 `public/models/props/raw/ground/paving-authored.png` 에 두었는데
> `raw/` 가 `.gitignore` 라 리포엔 안 들어간다. 구운 GLB만 커밋돼 있으므로
> 그림을 바꿀 게 아니면 다시 구울 일은 없다.

---

# 배치 코드는 어디에 있나

새 모델을 넣고 자리를 옮기거나 크기를 고칠 때 볼 곳.

- **건물** — 파일명이 id면 자동으로 붙는다. 좌표·크기는 `src/lib/constants.ts` 의 `villageBuildings`
- **장식물** — `scripts/generate-decor-layout.mjs`
  - `KIT` 표에 `h`(원본 GLB 높이 **실측**)와 `m`(실물 기준 미터)을 적는다.
    `h` 를 눈대중으로 넣으면 물건이 땅에 묻히거나 공중에 뜬다
  - 절 구성: ① 구역 입구 아치 · ②-b 채움 민가 · ②-c 남쪽 정문 · ②-d 블록 담장 ·
    ③-b 깃대 · ③-c 포장 위 나무·화단 · ③-d 마을 밖 랜드마크
- **바닥** — `scripts/generate-ground-layout.mjs` (길·포장·앞마당·구역 단차 사각형)
- **구역 단차** — 아래 절 참고
- 둘 다 고치고 나면:

```bash
node scripts/generate-ground-layout.mjs && node scripts/generate-decor-layout.mjs
```

---

# 구역 단차는 어떻게 도나

컨셉 아트의 마을은 평지가 아니라 계단식이다 — 광장이 제일 낮고 여섯 구역이
한 단씩 올라앉아 있어서, 이름표를 안 읽어도 부감에서 그림자로 덩어리가 갈린다.

**높이를 `propsLayout.json` 에 굽지 않았다.** 프롭 1,275개의 y 를 데이터에 써 넣으면
되돌릴 방법이 사실상 없다. 대신 좌표는 그대로 두고 **그릴 때** 함수 하나로 더한다.

```
scripts/generate-ground-layout.mjs
  → src/data/villageTerraces.json      구역 사각형 6개 (판석 깐 범위와 같다)
      → src/lib/villageTerrain.ts      terrainHeightAt(x, z) · TERRACE_STEP
          ├ InstancedProps.tsx         바닥 판석·담장·나무 등 프롭 전부
          ├ Building.tsx               건물 뿌리 group (이름표·빛기둥이 따라온다)
          ├ NPC.tsx                    settleGround() — 통통 뛰는 진폭에 더한다
          ├ CharacterController.tsx    걷기 모드 발 높이 + 3인칭 카메라
          ├ BuildingNetwork.tsx        건물끼리 잇는 호
          └ VillageScene.tsx           TerraceBanks (단의 옆면) · ActiveRoute
```

**되돌리기 스위치는 한 줄이다.** `villageTerrain.ts` 의

```ts
export const TERRACE_STEP: number = 1.1; // 0 이면 예전 평지 그대로
```

## 왜 매끄러운 경사가 아니라 뚝 끊는 한 단인가

바닥 판석은 두께 없는 평면 한 장이다. 경사로 만들면 타일마다 중심 높이만 달라져
이음매마다 틈이 벌어지고 그 사이로 아래가 비친다. 격자 한 칸(1.88)마다 정확히 한 단씩
끊으면 **모든 타일이 평평한 단 위에 딱 눕는다.** 캐릭터·NPC 만 그 값을 감쇠시켜
부드럽게 오른다.

처음엔 폭 한 칸짜리 중간 단을 끼워 0 → 0.35 → 0.7 로 올렸다. 그런데 구역을 떼어 놓고
보니 그 중간 단이 **구역 사이 골짜기를 통째로 덮어** 버렸다(골짜기가 2~3칸인데
중간 단이 양쪽에서 한 칸씩 먹는다). 지금은 0 → 1.1 한 단이다.

## 단 옆면(축대)은 코드가 그린다

`TerraceBanks` 가 사각형마다 **세 마디 단면**(지대석 / 벽면 / 갓돌)을 두르고,
`src/lib/terraceBank.ts` 가 만든 런타임 돌쌓기 텍스처를 씌운다. 합계 288 삼각형.

처음엔 정점 색만 얹은 **세로 띠 한 장**이었는데, 손그림 판석 옆에서 회색 콘크리트
턱으로 보였다. 층이 안 느껴진 게 아니라 층의 옆면이 **재료로 안 읽힌** 것이었다.
받은 GLB 로 두르지 못하는 이유는 B7 에 적었다.

## 사각형을 블록 상자 ±1칸으로 잡으면 안 된다

판석은 블록 상자 ±1칸에 깔리는데, 단차 사각형까지 ±1로 잡았더니 **여섯 구역이 서로
맞붙어 광장만 우물처럼 파인 도넛**이 됐다. 단차는 블록 상자 그대로 쓴다 — 그러면
단 위가 전부 포장이고, 단 둘레에도 지면 높이 판석이 한 줄 남아 잔디 위에 판이 뜨지 않는다.

## 담장은 단 위 테두리에 선다

예전엔 블록 상자에서 1.45 밀어낸 자리였는데, 그 선이 윗단·중간단·바닥을 가로질러서
담이 한 변 안에서 오르내리는 지그재그가 됐다(72/25/31토막이 서로 다른 단에 섰다).
지금은 `generate-decor-layout.mjs` 가 `villageTerraces.json` 을 읽어 윗단 테두리에
세운다 — 한 구역의 담이 전부 같은 높이에 서고, 두 단짜리 둔덕이 담 **바깥**에 드러나
밖에서 보면 축대 위 난간처럼 읽힌다.

## 구역 대문 계단 — 받은 `terrace-stair` 를 그대로 쓴다

길이 단을 넘는 자리 **23곳** + 남쪽 정문 1곳에 선다.

한동안 여기에 직접 구운 40삼각형짜리 회색 쐐기(`make-terrace-steps.mjs`)를 깔았다.
원본이 1만 삼각형이라 스무 곳에 못 놓는다고 판단한 건데, **틀린 판단이었다.**
담쟁이 UV 심 때문에 기본 오차(0.005)로 안 줄어들 뿐이고, 오차를 0.03 으로 올리면
8,236 이다(그 아래로는 안 내려간다 — 0.08 을 줘도 같다). 24개 × 8,236 = 20만이고
당시 예산에 46만이 남아 있었다. 지금은 `optimize-glb.mjs` 의 `TERRACE_SIMPLIFY` 가
이 셋만 따로 태운다.

배치할 때 걸린 것 넷 — 넷 다 **격자로 검산하고서야** 찾았다(렌더만 보면 못 알아챈다):

- **경계선 위에 놓으면 안 된다.** 그 점은 단 안쪽으로 판정돼 `terrainHeightAt` 이
  1.1 을 얹는다 — 계단이 단 위에 통째로 떴다. 안길이 절반만큼 밖으로 뺀다.
- **바깥 방향은 그 변의 법선이어야 한다.** 사각형 중심에서 밀어냈더니(방사 방향)
  긴 변의 끝 쪽 대문에서는 그게 거의 변을 따라가는 방향이라, 30개 중 8개가
  단 안에 그대로 남았다.
- **두 구역 단이 맞닿은 변에는 놓지 않는다.** 밖으로 나가 봐야 옆 구역 단이라
  오를 턱이 없다(예: SKILLS 남쪽 = LIFE 북쪽). 9곳이 평지 위에 선 계단이 됐었다.
- **높이는 bbox 로 맞추면 안 된다.** 모델 꼭대기는 양옆 석주고, 밟는 맨 윗 단은
  bbox 높이의 **66%** 지점이다. 전체를 1.1 에 맞췄더니 윗 단이 0.73 이라 다 오르고도
  0.37 짜리 턱을 한 번 더 밟아야 했다. m=3.85(배율 1.484)로 키워 윗 단을 1.02 에
  올렸고, 석주는 단 위로 0.44 솟아 난간 기둥이 된다.

그리고 **이 모델은 −Z 쪽으로 오른다.** 직접 구웠던 쐐기는 반대였다. 낮은 쪽(+Z)이
구역 바깥을 보도록 회전 부호를 뒤집었다.

---

# 컨셉 아트에 맞추려고 한 것 (2026-08-11)

컨셉 아트와 렌더를 나란히 놓고 다른 점을 일곱 개로 추렸고, 전부 손봤다.
**남은 차이는 에셋이 아니라 지형이다** — 아래 「아직 남은 차이」 참고.

| 무엇            | 어떻게                                                                                                                                                | 결과                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **빛**          | 노을 구간을 15~20시로 넓히고, **한낮도 따뜻하게 내렸다**(태양 고도 52°→32°, 지평선을 금빛 아지랑이로, 창문 발광 0.14→0.4). 노을은 고도 11°, 발광 1.05 | 정오에 들어와도 컨셉 톤이 유지된다                                                                                                     |
| **하늘**        | `skyClouds.ts` — 지평선 위에 낮게 깔린 구름 띠                                                                                                        | v 는 천정각이라 0.10~0.49 로 잡으면 고도 2°~72°(하늘 전부)다. 지금은 2°~50°                                                            |
| **길 모양**     | 광장 둘레 정사각 고리 두 겹 (`RINGS = [4, 8]`)                                                                                                        | 직선 64→90 · T 17→12 · **커브 6→15** · 교차 4→3                                                                                        |
| **물**          | 마을을 두르는 타원 해자 + 남북 돌다리 둘                                                                                                              | 남쪽 참배로를 `SOUTH_END = 12` 까지 늘려 다리까지 잇는다                                                                               |
| **울타리**      | 36삼각형짜리를 구워 길가에 **134토막**                                                                                                                | 예전엔 27개(1,473삼각형짜리)                                                                                                           |
| **소품**        | 구역당 6개를 흩던 것을 **건물 앞뜰마다 3~4개 뭉치기**로                                                                                               | 42개 / 19채                                                                                                                            |
| **중앙 기념비** | `Building.tsx` 의 `boost` 로 배율만 1.45배                                                                                                            | `size` 를 키웠더니 길 생성기가 그 상자를 피해 도로망이 무너졌다(T 20→6) — `size` 는 길·충돌·앞마당이 같이 읽는 값이라 건드리면 안 된다 |
| **건물 밀집도** | `SPREAD` 1.45 → 1.32 + 채움 민가 25→33채                                                                                                              | 상자 겹침 0, 길 안 닿는 건물 0                                                                                                         |

전체 858개 프롭 · **1,542k 삼각형** (상한 1,800k).

### 그 뒤로 (같은 날) 다시 손본 것

- **구역을 광장 바깥으로 밀었다** (`constants.ts` 의 `DISTRICT_PUSH = 4.6`).
  단을 0.7 로 올려 놓고도 "층이 하나도 안 느껴진다"는 말을 들었는데, 원인은 높이가
  아니라 **볼 수 있는 턱이 없다**는 것이었다 — 여섯 구역의 단이 서로 맞닿아 하나였다.
  떼어 놓으니 사이에 바닥 높이 골짜기가 생겼고, 그 안으로 물길 2줄기(돌다리 4개)를
  흘렸다. 단은 0 → 1.1 한 단으로 바꿨다.
- **축대 옆면과 계단을 다시 만들었다.** 위의 「단 옆면」·「구역 대문 계단」 참고.

### 그리고 바닥을 **잔디로 되돌렸다** (2026-08-11 오후)

컨셉 아트를 다시 세어 보고 뒤집은 결정이다. "마을이 지어진 동네로 보이는 건 바닥이
돌이기 때문"이라고 읽었는데 반대였다 — 컨셉의 바닥은 **풀밭이 기본**이고 돌은 큰길과
광장에만 깔린다. 블록 안까지 깔았더니 판석이 613장(2,167유닛²)으로 구역 단 넓이
(1,159유닛²)를 통째로 덮어, **마을 전체가 하나의 거대한 광장**으로 보였다.

|                   | 전                     | 후                       |
| ----------------- | ---------------------- | ------------------------ |
| 포장 타일         | 613장 (블록 안 + 광장) | **69장** (광장 앞치마만) |
| 울타리            | 길마다 양옆 133토막    | **참배로 16토막**        |
| 블록 안 길 비율   | 34%                    | **22%**                  |
| 구역 안 나무·화단 | 26그루 / 7개           | **39그루 / 12개**        |

세 가지가 딸려 왔다:

- **단 위(y=1.1)에 잔디 뚜껑이 필요하다.** `Ground` 의 잔디 원반은 y≈0 이고 지형을
  안 따라온다. 그동안 단 위를 판석이 덮고 있었을 뿐이라, 걷어내니 뻥 뚫렸다.
  `VillageScene` 의 `TerraceTops` 가 사각형마다 2삼각형으로 덮는다(합 12개).
- **나무·화단이 같이 사라졌다.** 그 배치가 "깔린 판석 칸에서 자리를 고르는" 규칙이라
  후보가 광장에만 남았다 — **잔디로 바꿨더니 초록이 줄어드는** 결과였다. 후보를
  "포장 칸"이 아니라 **광장 포장 + 구역 단 위 칸**(`plots`)으로 바꿔 해결했다.
- **골목 간격 규칙이 고리 도로를 몰랐다.** `lastLaid` 가 골목끼리만 봐서 고리(RINGS
  4·8) 바로 옆 줄에 골목이 깔렸고, 길 두 줄 사이에 아무것도 없는 잔디 띠가 남아
  **축사 우리**처럼 보였다. 이 블록을 지나는 간선까지 간격에 넣어 고쳤다.

## 아직 남은 차이

- **하늘을 가로지르는 가는 실선**(#1a2209, 1~2px)이 눈높이·부감 양쪽에서 보인다.
  프롭 좌표·배율 이상치, 인스턴스 행렬 NaN, `BuildingNetwork`/`Building` 의 Line
  (둘 다 파란색), `IslandCliff`·`DistantHills` 의 인덱스 감기 — 여기까지는 아니라고
  확인했다. 남은 유력 후보는 **`DistantHills` 바깥 능선**(최고 y 30.2, 반지름 130,
  눈높이에서 고도 12.3°)이 안개에 거의 지워지고 실루엣만 남는 것. 재현은
  hour=16 · 걷기 모드로 STUDY 쪽에서 북동쪽 하늘.
  **주의: 카메라를 고정하고 하늘이 프레임에 들어오게 한 다음** 큰 메시를 하나씩
  꺼 가며 찍어야 한다 — 그냥 찍으면 프레임이 매번 달라 이분 탐색이 무효가 된다(두 번 겪음).
- **축대가 손그림이 아니다.** 코드로 그린 돌쌓기라 줄눈이 반듯한 격자다 → **B7**.
- **길에 진짜 곡선이 없다.** 고리는 정사각형이고 모서리만 커브 타일이다. 진짜
  곡선은 타일을 버리고 스플라인 리본을 깔아야 하는데, `onRoad(x,z)` 가 격자 조회라
  소품·담장·건물 배치 로직을 전부 갈아야 한다.
- **물에 깊이가 없다 — 그리고 길 타일이 물을 잘라 먹는다.** (2026-08-14 실측)

  | 무엇                        | y         |                                             |
  | --------------------------- | --------- | ------------------------------------------- |
  | 길 타일 (`path-*`)          | **0.060** | 물보다 **1cm 위** → 물이 그 밑으로 사라진다 |
  | 물 수면 (`Waterways`)       | 0.050     |                                             |
  | 광장 판석 (`paving-square`) | 0.045     | 물보다 5mm 아래 → z-파이팅 직전             |

  물 고리 241마디 중 **29마디(12%)가 길 타일 밑**이다. 문 넷마다 2유닛씩 물이 뚝
  끊긴 것처럼 보이고, 그 위에 선 돌다리는 **마른 길 위에 놓인 다리**가 된다.
  물길 여섯 줄기도 합쳐 17마디가 같은 이유로 잘린다.

  깊이가 없는 것도 같은 뿌리다. `villageRelief.buildMask` 가 물 밑을 **일부러
  평평하게** 만든다(굽이가 수면 위로 올라오면 물이 사라지므로). 그래서 물은
  파인 곳에 고인 게 아니라 **잔디에 칠한 파란 띠**다. 물가 자갈·둔덕도 없다 → **B9**.

- **중앙 광장이 단이 아니다.** 컨셉 아트의 광장은 계단으로 한 단 올라선 돌마당이고,
  물은 그 **아래** 골에서 흐른다. 우리는 구역 여섯만 단(`TERRACE_RECTS`, +1.1)이고
  광장·물·잔디가 전부 y=0 한 평면이라, 옆에서 보면 층이 하나도 없다.
  고치려면 광장도 단으로 올리는 게 아니라 **물길을 파 내려가야** 한다 — 그래야
  다리가 "골을 건너는 것"이 되고, 구역 단과 광장이 같은 보행면으로 이어진다.
- **해자에 물이 드나드는 곳이 없다.** 닫힌 타원이라 절벽의 폭포 셋과 이어지지 않는다
  (셋 다 해자 바깥 1.3~1.55배 거리에 있다). 짧은 지류 리본 셋을 절벽까지 뻗으면
  "해자가 여기로 쏟아진다"가 되는데, 그만큼 숲을 더 비워야 한다.
- **이젤**(컨셉 범례의 테마 소품)만 에셋이 없다. 나머지 소품은 다 있다.
- 텍스처 예산이 330MB/340MB 라 **새 종류를 추가할 여유가 없다.** 이미 있는 것을
  더 많이 까는 건 인스턴싱이라 텍스처가 공짜다.
