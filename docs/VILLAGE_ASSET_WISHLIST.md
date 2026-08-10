# 마을에 아직 필요한 에셋 — 전부

> 2026-08-10 전면 재작성 → **같은 날 저녁 갱신.**
> 여기 적혀 있던 14개 중 **13개가 들어왔다. 남은 건 `study-cs` 하나뿐이다.**
>
> 사용자 에셋 폴더 `바탕 화면/정재훈의 포트폴리오 모음집/3d 포트폴리오 마을에 대한 정보/`
> 하위를 GLB 72개·PNG 90여 장까지 전부 대조한 결과이고, 그 뒤로 받은 것까지 반영했다.
>
> 이 문서가 에셋 요청의 단일 출처다. `MESHY_VILLAGE_ASSETS.md` 는 대체됐다.
> 건물 프롬프트 원본은 `MESHY_BUILDING_PROMPTS.md` 에 있고, 여기에도 그대로 옮겨 적었다.

---

## 한눈에 — 남은 건 1개

| # | 무엇 | 컨셉 이미지 | 파일명 | 상태 |
|---|---|---|---|---|
| B2 | **지식 서고** | ✗ | `buildings/raw/study-cs.glb` | **아직 없음 — 유일하게 남은 것** |

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

| # | 올릴 이미지 |
|---|---|
| A1 | `건물 찐 모음집/ChatGPT Image 2026년 8월 9일 오후 06_31_25.png` (흰 돔 + 손 모양) |
| A2 | `포트폴리오건물모음집/아주대탐험.png` |
| A3 | `건물 찐 모음집/ChatGPT Image 2026년 8월 9일 오후 06_32_59.png` (가치관 비석) |
| A4 | `건물 찐 모음집/ChatGPT Image 2026년 8월 9일 오후 06_33_14.png` (INVEST 저울 탑) |
| A5 | `건물 찐 모음집/ChatGPT Image 2026년 8월 9일 오후 06_33_20.png` (LIBRARY 돔) |
| A6 | `장식물사진/ChatGPT Image 2026년 8월 10일 오전 08_37_36.png` (SKILLS 아치) |
| A7 | `장식물사진/장식물4/ChatGPT Image 2026년 8월 10일 오후 01_26_46.png` (파란 지붕 민가) |
| A8 | `장식물사진/장식물4/ChatGPT Image 2026년 8월 10일 오후 01_26_49.png` (붉은 지붕 민가) |

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

#### A1. `project-sign-language.glb` — 수어지구  ✅ 입고 완료 (5차)
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

#### A2. `project-ajou-adventure.glb` — 아주분투  ✅ 입고 완료 (5차)
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

#### A3. `life-values.glb` — 가치관 비석  ✅ 입고 완료 (5차)
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

#### A4. `life-invest.glb` — 투자 타워  ✅ 입고 완료 (5차)
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

#### A5. `life-library.glb` — 도서관  ✅ 입고 완료 (5차)
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

#### A6. `arch-skills.glb` — SKILLS 현판 아치  ✅ 입고 완료 (5차)
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

## B1. `study-codingtest.glb` — 알고리즘 도장  ✅ 입고 완료 (5차)
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

## B2. `study-cs.glb` — 지식 서고  ← **★ 지금 필요한 건 이거 하나뿐**
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

## B3. `life-timeline.glb` — 연혁 타임라인  ✅ 입고 완료 (5차)
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

## B4. `post-office.glb` — 연락 우체국  ✅ 입고 완료 (5차)
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

## B5. `arch-contact.glb` — CONTACT 현판 아치  ✅ 입고 완료 (5차)
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

| 파일명 | 무엇 | 프롬프트 앞부분 |
|---|---|---|
| `easel.glb` | 이젤 | `Wooden artist easel holding a small painted canvas, a paint palette and brushes hanging from one leg` |
| `anvil.glb` | 모루 | `Blacksmith anvil on a thick wooden stump, a hammer resting on top and tongs leaning against the side` |
| `book-stack.glb` | 책더미 | `Stack of five worn leather-bound books with cloth bookmarks, one open book resting on top` |
| `scroll-rack.glb` | 두루마리 선반 | `Small wooden rack holding rolled parchment scrolls, one scroll unrolled and hanging over the front` |
| `signpost-arrow.glb` | 이정표 | `Wooden signpost with three arrow-shaped direction boards pointing different ways, small lantern on top` |
| `brazier.glb` | 화로 | `Standing iron brazier bowl on three legs with glowing orange embers and small flames` |
| `bell-tower-small.glb` | 작은 종탑 | `Small open wooden bell tower with a tiled pyramid roof and a bronze bell hanging inside` |
| `hedge-round.glb` | 다듬은 관목 | `Neatly trimmed round topiary bush in a square stone planter` |
| `tree-pine-tall.glb` | 키 큰 침엽수 → `nature/` | `Very tall narrow dark green pine tree, single trunk, layered conical foliage` |
| `tree-willow.glb` | 수양버들 → `nature/` | `Weeping willow tree with long drooping pale green branches` |

공통 꼬리말:

```
, standing alone on flat ground, warm sunset lighting,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
VERY LOW POLY, flat shaded, under 1500 triangles, front-facing
```

---

# 규격 (전부 공통)

| 항목 | 값 |
|---|---|
| 포맷 | GLB (텍스처 포함), Y-up |
| 원점 | **바닥 중심.** 물체가 원점 위에 서 있어야 한다 |
| 크기 | 신경 쓰지 말 것 — Meshy가 긴 변을 1.9로 정규화하고 코드가 다시 맞춘다 |
| **비율** | **지킬 것.** 바닥면 대각선으로 배율을 잡으므로, 납작하게 그리면 그만큼 낮아진다 |
| 앞면 | **+Z 방향**이 정면 (간판·문이 +Z를 보게) |

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

| 쓰임새 | 목표 | 프롬프트 꼬리에 붙일 말 |
|---|---|---|
| 수십 개 반복 (담장·깃대·소품) | **1,500 이하** | `VERY LOW POLY, flat shaded, minimal geometric detail, no separate small props, under 1500 triangles` |
| 열 개 안팎 (민가·아치·노점) | 8,000 이하 | `low poly game asset, under 8000 triangles` |
| 한두 개 (건물·랜드마크) | 자유 | — |

## 공통 화풍 꼬리말 (장식물용)

건물이 아닌 것은 프롬프트 끝에 이걸 붙인다. 이게 있어야 이미 있는 70여 종과 톤이 맞는다.

```
, warm sunset lighting, Ghibli-like storybook game art,
soft painterly textures, muted natural colors, front-facing
```

---

# 코드로 해결한 것 — 에셋 안 받아도 됨

| 무엇 | 어떻게 |
|---|---|
| 판석 포장 | `scripts/make-paving-tile.mjs` — 받은 손그림(Mossy Cobblestone)에서 윗면을 오려 **삼각형 2개**짜리 평면에 입힌다. 원본 GLB는 8,476 삼각형이라 386장이면 327만이다. 오릴 때 가장자리를 이웃 화소와 섞어 이어붙게 만들고, 칸마다 90°씩 돌려 반복 주기를 네 배로 늘린다 |
| 길 갓길 | `scripts/make_paved_road_tiles.py` — 길 타일의 **초록 잔디 갓길**을 판석 색으로 바꾼 변종. 포장 위를 지나는 길에만 쓴다. 안 바꿨을 땐 돌마당에 초록 격자가 떠올랐다 |
| 낮은 담장 | `scripts/make-low-wall.mjs` — 상자 둘, **24 삼각형**. 130토막으로 여섯 블록을 두르고 길이 지나는 자리는 비워 구역 대문이 된다. B6 이 오면 교체 |
| **구역 단차** | `src/lib/villageTerrain.ts` + `VillageScene.tsx` 의 `TerraceBanks` — 여섯 구역을 두 계단(0 → 0.35 → 0.7) 올려 컨셉 아트의 계단식 마을을 만든다. 옆구리 축대가 **96 삼각형**. 아래 「구역 단차는 어떻게 도나」 참고 |
| 북쪽 개울 | `VillageScene.tsx` 의 `Creek` — 잔디 위에 얹는 물 리본. 돌다리가 건널 물이 필요했다. C1 이 오면 교체 |
| 잔디 텍스처 | `scripts/make-grass-texture.mjs` |
| 먼 숲 | `scripts/bake-impostors.mjs` — 나무 한 그루를 4~6삼각형 빌보드로 |
| 하늘·해·물·절벽·먼 산 | `VillageScene.tsx` 에서 절차적으로 |
| 계절·시간대 파티클 | `SeasonAmbience.tsx` |

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

| 파일 | 쓰이는 곳 | 삼각형 |
|---|---|---|
| `decor/arch-projects.glb` | PROJECTS 입구 현판 | 6,350 |
| `decor/arch-study.glb` | STUDY 입구 현판 | 7,642 |
| `decor/arch-experience.glb` | EXPERIENCE 입구 현판 | 6,955 |
| `decor/arch-life.glb` | LIFE 입구 현판 | 7,832 |
| `decor/house-a.glb` | 채움 민가 (붉은 기와) | 8,705 |
| `decor/house-b.glb` | 채움 민가 (청회색 슬레이트) | 11,856 |
| `decor/terrace-wall.glb` | 아치 옆 문기둥 · 정문 석축 | 10,612 |
| `decor/terrace-stair.glb` | 남쪽 정문 대계단 | 10,052 |
| `decor/terrace-slab.glb` | **안 씀** — 한 장 1만 삼각형이라 포장으로 못 쓴다 | 10,174 |
| `decor/arch-alt.glb` | **안 씀** — EXPERIENCE 글자 중복 (원래 SKILLS여야 했다 → A6) | 7,015 |

## 4차 (2026-08-10 오후) — 바닥·랜드마크

| 파일 | 쓰이는 곳 | 삼각형 |
|---|---|---|
| `ground-flat/paving-square.glb` | 구역 바닥 판석 386장 (손그림에서 구움) | **2** |
| `ground-flat/paved/*.glb` | 포장 위를 지나는 길 6종 (갓길을 돌색으로) | 2 |
| `decor/wall-low.glb` | 블록 담장 130토막 (**코드 생성**, B6 이 오면 교체) | 24 |
| `decor/flagpole-banner.glb` | 대로변·광장 깃대 | 3,483 |
| `decor/flowerbed-round.glb` | 포장 위 원형 화단 | 9,898 |
| `decor/house-c.glb` | 채움 민가 3종째 · 모델 없는 건물 폴백 | 8,010 |
| `decor/bridge-stone.glb` | 북쪽 참배로가 개울 건너는 돌다리 | 6,448 |
| `decor/island-north.glb` | 북쪽 "AI Portfolio" 섬 (아래를 묻어 언덕으로) | 12,325 |
| `decor/pagoda-portfolio.glb` | 그 위 파고다 랜드마크 | 7,617 |
| `decor/windmill.glb` | 북동 언덕 풍차 | 8,768 |
| `decor/waterfall.glb` | 섬 테두리 폭포 3곳 | 11,546 |

## 5차 (2026-08-10 저녁) — 건물 8채 + 아치 2개

이걸로 건물이 **26/27** 이 됐고 구역 아치가 **6/6** 이 됐다.

| 받은 파일 | 넣은 이름 | 쓰이는 곳 |
|---|---|---|
| `Meshy_AI_Palm_Welcome_House_0810064653` | `buildings/raw/project-sign-language.glb` | 수어지구 |
| `Meshy_AI_Whimsical_Adventure_H_0810071057` | `buildings/raw/project-ajou-adventure.glb` | 아주분투 |
| `Meshy_AI_Monument_of_Values_0810064219` | `buildings/raw/life-values.glb` | 가치관 비석 |
| `Meshy_AI_Tower_of_Investment_0810064212` | `buildings/raw/life-invest.glb` | 투자 타워 |
| `Meshy_AI_Grand_Dome_Library_0810064207` | `buildings/raw/life-library.glb` | 도서관 |
| `Meshy_AI_Timeline_Tower_0810064658` | `buildings/raw/life-timeline.glb` | 연혁 타임라인 |
| `Meshy_AI_Algorithmic_Pagoda_0810064707` | `buildings/raw/study-codingtest.glb` | 알고리즘 도장 |
| `Meshy_AI_Enchanted_Post_Office_0810064714` | `buildings/raw/post-office.glb` | 연락 우체국 |
| `Meshy_AI_Skills_Archway_0810071103` | `props/raw/decor/arch-skills.glb` | SKILLS 입구 현판 (6,975) |
| `Meshy_AI_Contact_Gate_0810071106` | `props/raw/decor/arch-contact.glb` | CONTACT 입구 현판 (6,984) |

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
export const TERRACE_STEP: number = 0.7;   // 0 이면 예전 평지 그대로
```

## 왜 매끄러운 경사가 아니라 두 단 계단인가

바닥 판석은 두께 없는 평면 한 장이다. 경사로 만들면 타일마다 중심 높이만 달라져
이음매마다 틈이 벌어지고 그 사이로 아래가 비친다. 격자 한 칸(1.88)마다 정확히 한 단씩
끊으면 **모든 타일이 평평한 단 위에 딱 눕는다.** 그래서 폭이 한 칸인 중간 단을 두고
0 → 0.35 → 0.7 로 오른다. 캐릭터·NPC 만 그 값을 감쇠시켜 부드럽게 오른다.

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

## 아직 안 한 것

길이 구역으로 들어가는 자리에 **계단이 없다.** 0.35짜리 턱 두 개를 그냥 오른다.
`decor/terrace-stair.glb`(10,052삼각형)를 47곳에 놓으면 47만 삼각형이라 못 쓴다 —
`make-low-wall.mjs` 처럼 쐐기를 코드로 구워야 한다.
