# 마을 에셋 전체 목록 — 컨셉 아트와의 차이 전부

두 번째 컨셉 아트(2026-08-10, 구역 이름표가 다 붙은 조감도)를 한 칸씩 훑어
**지금 마을에 없는 것을 빠짐없이** 적었다. 프롬프트는 그대로 복사해 Meshy에 넣으면 된다.

- 이 문서가 에셋 요청의 **단일 출처**다. `MESHY_VILLAGE_ASSETS.md` 는 이 문서로 대체됐다.
- 건물 27채 프롬프트는 `MESHY_BUILDING_PROMPTS.md` 에 따로 있다 (§0 참고).

---

## 0. 먼저 — 아직 상자로 서 있는 건물 9채

이게 목록 맨 위에 와야 한다. 나머지를 아무리 채워도 이 9채가 **색만 다른 똑같은
민가**로 서 있으면 그 구역은 미완성으로 보인다. 프롬프트는
`MESHY_BUILDING_PROMPTS.md` 에 이미 있다.

| 건물 id | 이름 | 구역 |
|---|---|---|
| `study-codingtest` | 알고리즘 도장 | STUDY |
| `study-cs` | 지식 서고 | STUDY |
| `project-sign-language` | 수어지교 | PROJECTS |
| `project-ajou-adventure` | 아주분투 | PROJECTS |
| `post-office` | 연락 우체국 | CONTACT |
| `life-values` | 가치관 비석 | LIFE |
| `life-invest` | 투자 타워 | LIFE |
| `life-library` | 도서관 | LIFE |
| `life-timeline` | 연혁 타임라인 | LIFE |

넣는 법: `public/models/buildings/raw/<위 id 그대로>.glb` → `npm run optimize`.
**파일명이 곧 건물 id다.** 이름만 맞으면 코드를 한 줄도 안 고쳐도 자동으로 붙는다.

---

## 규격 (전부 공통)

| 항목 | 값 |
|---|---|
| 포맷 | GLB (텍스처 포함) |
| 원점 | **바닥 중심.** 물체가 원점 위에 서 있어야 한다 |
| 크기 | 신경 쓰지 말 것 — Meshy가 긴 변을 1.9로 정규화하고 코드가 다시 맞춘다 |
| 앞면 | **+Z 방향**이 정면 (간판·문이 +Z를 보게) |

넣는 위치:

```bash
public/models/props/raw/<카테고리>/<이름>.glb   # 장식물
public/models/buildings/raw/<건물id>.glb        # 건물
npm run optimize
```

카테고리는 `decor` / `nature` / `signs` / `ground` 중 하나. **폴더가 최적화 강도와
그림자 규칙을 결정**하므로 아무 데나 넣으면 안 된다
(`scripts/optimize-glb.mjs` 의 `passesFor`, `InstancedProps.tsx` 의 `shadowRole`).

> ⚠️ 새 카테고리 폴더를 만들면 반드시 그 안에 `raw/` 도 만들 것. `raw/` 가 없으면
> optimize 가 조용히 건너뛰어 텍스처가 통째로 예산을 잡아먹는다.

### 삼각형 예산 — 프롬프트에 반드시 넣어야 하는 말

계기판(F8) 경고선을 **180만 / 텍스처 340MB** 로 올렸다(`PerfHud.tsx`). 100만은
건물 18채에 소품 몇 개뿐이던 시절의 보수적인 값이라, 폭포·풍차·북쪽 섬·담장·
민가 26채가 들어오면서 의미가 없어졌다. 지금 실측 **약 123만**이고 fps 는 안 떨어졌다 —
전부 인스턴싱이라 draw call 이 안 늘기 때문이다. 진짜 지표는 fps 와 draw call 이다.

그래도 아껴야 한다. 아래 목표치는 그대로 지킬 것.

Meshy는 그냥 두면 돌덩이 하나를 1만 삼각형으로 뽑는다. 그리고 벽돌·잎사귀처럼
UV 섬이 많으면 **simplify가 거의 안 먹는다** — 받은 축대벽을 오차 0.05까지
올려도 10,612 → 8,191 에서 멈췄다. 그래서 처음부터 가볍게 뽑아야 한다.

| 쓰임새 | 목표 | 프롬프트 꼬리에 붙일 말 |
|---|---|---|
| 수십 개 반복 (담장·깃대·포장) | **1,500 이하** | `VERY LOW POLY, flat shaded, minimal geometric detail, no separate small props, under 1500 triangles` |
| 열 개 안팎 (민가·아치) | 8,000 이하 | `low poly game asset, under 8000 triangles` |
| 한두 개 (랜드마크·폭포·섬) | 자유 | — |

### 공통 화풍 꼬리말

모든 프롬프트 끝에 붙인다. 이게 있어야 이미 있는 60여 종과 톤이 맞는다.

```
, warm sunset lighting, Ghibli-like storybook game art,
soft painterly textures, muted natural colors, front-facing
```

---

## 1순위 — 이게 없으면 컨셉 아트처럼 안 보인다

### ① 낮은 담장 (직선 + 모서리) — **지금은 코드로 임시 해결**

> 2026-08-10: 에셋이 없어 `scripts/make-low-wall.mjs` 가 상자 둘(24 삼각형)로
> 구워 쓰고 있다. 마을 여섯 블록에 129토막이 둘러 있고, 길이 지나는 자리는
> 비워 구역 대문이 된다. **손그림이 오면 `props/raw/decor/wall-low.glb` 로 넣고
> `npm run optimize` 만 돌리면 그대로 갈린다** — 배치 코드는 안 고쳐도 된다.
> 절차 생성이라 무늬가 단조로우니, 여유가 되면 아래 프롬프트로 진짜를 받는 게 낫다.

컨셉 아트에서 구역이 "구역"으로 보이는 가장 큰 이유. 블록마다 허리 높이 돌담이
둘러 있어서 안과 밖이 나뉜다.

받은 축대벽(`terrace-wall`)으로는 못 두른다 — 한 덩이가 10,612 삼각형이라
블록 하나 두르는 데 18개면 그것만 19만이다. 지금 아치 옆 문기둥으로만 쓰고 있다.

- `wall-low-straight.glb` · `wall-low-corner.glb` → `props/raw/decor/`
- **길 타일과 같은 1.9 폭에 딱 맞는 한 토막.** 이어 붙일 것이므로 좌우 끝면이 평평해야
- 높이는 폭의 3분의 1 (허리 높이)
- 마을 전체에 60~80개를 깐다 → **1,500 삼각형 이하가 절대 조건**

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

---

### ② 구역 현판 아치 2종 (SKILLS · CONTACT)

받은 5개 중 `Gateway_to_Experience` 가 **EXPERIENCE 글자 중복**이라(둘 다
EXPERIENCE) 이 두 구역만 아직 작은 팻말이다. 나란히 놓으면 거기만 초라하다.

- `arch-skills.glb` · `arch-contact.glb` → `props/raw/decor/`
- **이미 받은 4개와 같은 형태·같은 두께.** 색만 구역 색으로

```
Stylized fantasy village district gateway archway, two thick stone-and-timber
posts supporting a wide curved wooden banner board spanning between them,
the banner reads "SKILLS" in large bold gold serif capital letters,
teal-painted banner with gold trim and iron rivets, small hanging lanterns and
narrow vertical pennant flags on each post, moss and ivy at the base,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
low poly game asset, under 8000 triangles, front-facing flat composition
```

CONTACT 는 `"SKILLS"` → `"CONTACT"`, `teal-painted` → `deep green painted`.

> 글자는 Meshy가 자주 틀린다. 뽑고 나서 반드시 텍스처를 눈으로 확인할 것.

---

### ③ 민가 4종 추가

배경 민가를 2종으로 12채 돌려쓰고 있다. 위에서 보면 같은 집이 여섯 번씩 나온다.
4종이 더 있으면 16채를 거의 안 겹치게 깐다.

- ~~`house-c.glb`~~ **입고 완료** (Emerald Leaf Cottage). `house-d.glb` ~ `house-f.glb` → `props/raw/decor/`
- 지금 3종으로 26채를 돌려쓴다 — 한 블록 안에서 같은 집이 두 번씩 나온다
- 받은 두 채와 **같은 2층·같은 눈높이.** 지붕 색과 평면 모양만 다르게

| 파일 | 지붕 | 벽 | 평면 |
|---|---|---|---|
| `house-c` | 파란 슬레이트 | 흰 회벽 | 좁고 세로로 긴 |
| `house-d` | 초록 기와 | 목조 뼈대(하프팀버) | 정사각형에 가까운 |
| `house-e` | 갈색 초가 | 황토벽 | 낮고 옆으로 퍼진 |
| `house-f` | 보라 기와 | 회색 석벽 | 작은 탑이 하나 붙은 |

```
Small two-storey fantasy village cottage, blue slate roof, white plaster walls
with dark timber trim, narrow tall footprint, warm glowing windows,
wooden front door, small chimney, flower box under one window,
standing alone on flat ground, warm sunset lighting,
Ghibli-like storybook game art, soft painterly textures,
low poly game asset, under 8000 triangles, front-facing
```

나머지 셋은 첫 줄의 지붕/벽/평면만 위 표대로 바꾼다.

---

### ④ 세로 깃발 깃대

> **입고 완료** (Blue Banner with Gold, 3,483 삼각형). 대로변·광장 둘레에 서 있다.

컨셉 아트에서 화면에 **가장 많이 찍혀 있는 물건**이 깃대다. 파랑·금색 문장기가
광장 둘레와 대로변에 줄줄이 서서, 위에서 봐도 길이 어디인지 읽힌다.
지금은 황금잎 깃대(`leaf-banner`)를 대신 쓰고 있는데 모양이 다르고 6개뿐이다.

- `flagpole-banner.glb` → `props/raw/decor/`
- 20~30개를 깐다 → **1,500 삼각형 이하**

```
Single tall thin wooden flagpole with a long narrow vertical banner hanging
from a short crossbar, deep blue fabric with a gold emblem in the middle and
gold fringe at the bottom, slight fabric curve as if in light wind,
small iron base ring, standing alone on flat ground,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
VERY LOW POLY, flat shaded, under 1500 triangles, front-facing
```

---

### ⑤ 원형 화단 테두리

> **입고 완료** (Circle of Blooms, 9,898 삼각형). 빈 포장 칸 12곳에 놓았다.

컨셉의 포장 위에는 돌로 두른 둥근 화단이 여기저기 있다. 돌바닥이 삭막해지는 걸
막는 물건이라, 포장을 깐 지금 특히 필요하다.

- `flowerbed-round.glb` → `props/raw/decor/`
- **1,500 삼각형 이하**

```
Small round raised flower bed, a low circular rim of rough grey stones filled
with dark soil and a dense mound of small pink, white and yellow flowers,
seen from a slightly high angle, standing on flat paving,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
VERY LOW POLY, flat shaded, under 1500 triangles
```

---

## 2순위 — 있으면 "우와" 소리가 나는 것

### ⑥ 폭포 3방향

> **입고 완료** (Craggy Cascade, 11,546 삼각형). 섬 테두리 세 곳(서·동·남동).

컨셉 좌·우·우하단에 폭포가 셋 있다. 우리 섬은 절벽과 물은 있는데 그 사이가
조용해서 섬이 죽어 있다. 마을에서 가장 큰 "움직이는 것"이 될 물건이다.

- `waterfall.glb` → `props/raw/decor/`
- **세로로 긴 판** (높이가 폭의 3배쯤). 절벽면(높이 9유닛)에 붙인다

```
Tall narrow stylized waterfall, a single vertical sheet of falling turquoise
water breaking into white foam and mist at the bottom, thin wet rock ledges at
the top edge only, seen straight from the front, strong vertical composition,
warm sunset light catching the spray,
Ghibli-like storybook game art, soft painterly textures,
low poly game asset, flat front-facing plane composition
```

### ⑦ 아치 돌다리

> **입고 완료** (Luminous Stone Arch, 6,448 삼각형). 북쪽 참배로가 개울을 건너는 자리.

북쪽 섬으로 건너가는 다리이자, 그 전에도 절벽 사이 장식으로 쓸 수 있다.

- `bridge-stone.glb` → `props/raw/decor/`
- 길 두세 칸(3.8~5.6유닛)을 건너는 **가로로 긴** 비율

```
Stylized stone arch bridge spanning a gap, a single tall arch, pale cut stone
with moss in the joints, low carved railings on both sides, small lanterns on
the four corner posts, seen from the side, horizontal composition,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
low poly game asset
```

### ⑧ 북쪽 AI Portfolio 섬 한 벌

> **입고 완료** (Verdant Floating Island + Azure Crystal Pagoda). 마을 북쪽 z −29.5 에 언덕으로 묻어 세웠다.

컨셉 맨 위, 다리로 건너가는 별도의 작은 섬. 지금 우리 북쪽은 그냥 숲이라
조감도에서 위쪽이 비어 보인다. **둘을 세트로 받아야 의미가 있다.**

- `island-north.glb` — 풀 덮인 원뿔 바위섬. **윗면이 평평해야** 건물이 선다
- `pagoda-portfolio.glb` — 그 위에 서는 탑 랜드마크

```
Small floating rocky island with a flat grassy top, steep mossy cliff sides,
a few pine trees around the rim, roots and vines hanging under the base,
seen from a slightly high angle, warm sunset lighting,
Ghibli-like storybook game art, soft painterly textures, low poly game asset
```

```
Tall slender fantasy pagoda tower with three tiered roofs, teal tiles with
gold ridge caps, glowing warm windows on every floor, a floating luminous
cyan crystal above the top spire, stone base with short stairs,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
low poly game asset
```

### ⑨ 풍차

> **입고 완료** (Windmill Cottage, 8,768 삼각형). 북동 언덕.

컨셉 우상단 언덕 위. 마을 바깥 실루엣에 큰 수직선을 하나 세워 준다.

- `windmill.glb` → `props/raw/decor/`

```
Small stone windmill on a low hill, four wooden lattice sails, thatched conical
cap, a wooden door and two small windows, low stone wall around the base,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
low poly game asset, under 8000 triangles
```

### ⑩ 개울 타일 (마을 안 물길)

> 2026-08-10: 다리가 건널 물이 없어서, 우선 `VillageScene.tsx` 의 `Creek` 이
> 잔디 위에 물 리본을 얹어 놨다(삼각형 180개). 굽이치는 얕은 개울로 보이지만
> 자갈·둔치 같은 디테일은 없다. 아래 타일을 받으면 그걸로 바꾸는 게 낫다.

컨셉 상단 중앙에 마을을 가로지르는 작은 물길이 있고, 그 위로 다리가 놓여 있다.
길 타일과 같은 격자에 깔 것이므로 **정사각 평판**이어야 한다.

- `stream-straight.glb` · `stream-curve.glb` → `props/raw/ground/`
  (`ground` 폴더가 맞다 — 여기 것만 강한 simplify 와 "그림자를 받기만 함" 규칙을 탄다)
- 네 변이 평평하고, 물줄기가 타일 가장자리 한가운데에서 끊겨야 이어 붙는다

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

### ⑪ 상점 노점 · 차양

컨셉 STUDY 구역 앞쪽에 천막 친 노점들이 줄지어 있다. 우리는 `market-stall` 하나뿐.

- `stall-awning.glb` · `stall-fruit.glb` → `props/raw/decor/`

```
Small fantasy market stall with a striped red and cream fabric awning on four
wooden posts, wooden counter piled with goods, crates and a barrel beside it,
hanging lantern on one corner post, standing on flat paving,
warm sunset lighting, Ghibli-like storybook game art, soft painterly textures,
low poly game asset, under 4000 triangles, front-facing
```

---

## 3순위 — 마무리 소품

컨셉 하단 소품 띠에 있는데 우리한테 없는 것. **전부 1,500 삼각형 이하**,
전부 `props/raw/decor/` (마지막 둘만 `props/raw/nature/`).

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

## 코드로 이미 해결한 것 (에셋 안 받아도 됨)

| 무엇 | 어떻게 |
|---|---|
| 판석 포장 | `scripts/make-paving-tile.mjs` — 받은 손그림(Mossy Cobblestone)에서 윗면을 오려 **삼각형 2개**짜리 평면에 입힌다. 원본 GLB 는 8,476 삼각형이라 386장이면 327만이다. 오릴 때 가장자리를 이웃 화소와 섞어 이어붙게 만들고, 칸마다 90°씩 돌려 반복 주기를 네 배로 늘린다 |
| 길 갓길 | `scripts/make_paved_road_tiles.py` — 길 타일의 **초록 잔디 갓길**을 판석 색으로 바꾼 변종. 포장 위를 지나는 길에만 쓴다. 안 바꿨을 땐 돌마당에 초록 격자가 떠올랐다 |
| 낮은 담장 | `scripts/make-low-wall.mjs` — 상자 둘, **24 삼각형**. 129토막으로 여섯 블록을 두른다. 손그림이 오면 교체(1순위 ①) |
| 북쪽 개울 | `VillageScene.tsx` 의 `Creek` — 잔디 위에 얹는 물 리본. 돌다리가 건널 물이 필요했다 |
| 잔디 텍스처 | `scripts/make-grass-texture.mjs` |
| 먼 숲 | `scripts/bake-impostors.mjs` — 나무 한 그루를 4~6삼각형 빌보드로 |
| 하늘·해·물·절벽·먼 산 | `VillageScene.tsx` 에서 절차적으로 |
| 계절·시간대 파티클 | `SeasonAmbience.tsx` |

> 포장 타일은 절차 생성이라 무늬가 단순하다. ①번 담장이 들어오고 나서도
> 바닥이 밋밋하면, 손으로 그린 정사각 포장 타일을 추가로 받는 게 낫다
> (규격은 ⑩번 개울 타일과 동일, `props/raw/ground/paving-authored.glb`).

---

## 입고 완료 (2026-08-10)

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
| `decor/arch-alt.glb` | **안 씀** — EXPERIENCE 글자 중복 | 7,015 |

## 입고 완료 (2026-08-10, 두 번째 묶음 — 장식물4)

| 파일 | 쓰이는 곳 | 삼각형 |
|---|---|---|
| `ground-flat/paving-square.glb` | 구역 바닥 판석 386장 (손그림에서 구움) | **2** |
| `ground-flat/paved/*.glb` | 포장 위를 지나는 길 6종 (갓길을 돌색으로) | 2 |
| `decor/flagpole-banner.glb` | 대로변·광장 깃대 | 3,483 |
| `decor/flowerbed-round.glb` | 포장 위 원형 화단 12개 | 9,898 |
| `decor/house-c.glb` | 채움 민가 3종째 · 모델 없는 건물 폴백 | 8,010 |
| `decor/bridge-stone.glb` | 북쪽 참배로가 개울 건너는 돌다리 | 6,448 |
| `decor/island-north.glb` | 북쪽 "AI Portfolio" 섬 (아래를 묻어 언덕으로) | 12,325 |
| `decor/pagoda-portfolio.glb` | 그 위 파고다 랜드마크 | 7,617 |
| `decor/windmill.glb` | 북동 언덕 풍차 | 8,768 |
| `decor/waterfall.glb` | 섬 테두리 폭포 3곳 | 11,546 |
| `decor/wall-low.glb` | 블록 담장 129토막 (**코드 생성**) | 24 |

> `Mossy_Cobblestone_Tile` 원본 GLB 는 **안 쓴다** — 그림만 뽑아 평면에 입혔다.
> 원본 PNG 는 `public/models/props/raw/ground/paving-authored.png` 에 있는데
> `raw/` 가 .gitignore 라 리포엔 안 들어간다. 구운 GLB 만 커밋돼 있으므로
> 그림을 바꿀 게 아니면 다시 구울 일은 없다.

배치 코드는 `scripts/generate-decor-layout.mjs` 의 `KIT` 표와
① 구역 입구 · ②-b 채움 민가 · ②-c 남쪽 정문 절이다. 새 모델을 넣을 때는
`KIT` 에 `h`(원본 GLB 높이 **실측**)와 `m`(실물 기준 미터)을 적어야 한다.
`h` 를 눈대중으로 넣으면 물건이 땅에 묻히거나 공중에 뜬다.
