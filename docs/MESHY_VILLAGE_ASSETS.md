# 마을 완성용 추가 에셋 요청

두 번째 컨셉 아트(2026-08-10, 구역 이름표가 다 붙은 조감도)와 지금 마을의 차이를
메우는 데 **코드로는 못 만드는 것**만 모았다. 건물 27채 프롬프트는 별도 문서
(`MESHY_BUILDING_PROMPTS.md`)에 있고 이 문서와 겹치지 않는다.

받은 것은 맨 아래 "입고 완료"로 옮긴다. 지금까지 10종을 받았고 9종을 쓰고 있다.

---

## 규격 (전부 공통)

Meshy 기본 출력 그대로 받으면 된다. 파이프라인이 알아서 맞춘다.

| 항목 | 값 |
|---|---|
| 포맷 | GLB (텍스처 포함) |
| 원점 | **바닥 중심**. 물체가 원점 위에 서 있어야 한다 |
| 크기 | 신경 쓰지 말 것 — Meshy가 긴 변을 1.9로 정규화하고, 코드가 다시 맞춘다 |
| 앞면 | **+Z 방향**을 정면으로 (간판·문이 +Z를 보게) |
| 폴리곤 | 기본값. `npm run optimize`가 40~60% 깎는다 |

**넣는 법**

```bash
# 장식물이면
public/models/props/raw/<카테고리>/<이름>.glb
# 그리고
npm run optimize
```

카테고리는 `decor` / `nature` / `signs` / `ground-flat` 중 하나. 폴더 이름이
최적화 강도와 그림자 규칙을 결정하므로 아무 데나 넣으면 안 된다
(`scripts/optimize-glb.mjs`의 `passesFor`, `InstancedProps.tsx`의 `shadowRole`).

> ⚠️ 새 카테고리 폴더를 만들면 **반드시 그 안에 `raw/`도 만들 것.** `raw/`가 없으면
> optimize가 조용히 건너뛰어 텍스처가 통째로 예산을 잡아먹는다 (석상이 혼자 89MB를
> 먹은 적이 있다).

### 삼각형 예산 — 이게 지금 제일 빡빡하다

계기판(F8) 예산은 100만인데 지금 약 **109만**이다. 이미 넘겨 있다.

그래서 **"여러 개 깔 물건"은 반드시 단순하게** 뽑아야 한다. Meshy 돌덩이는
겉보기와 달리 1만 삼각형이 넘고, 잎사귀·벽돌처럼 UV 섬이 많은 모델은
simplify가 거의 안 먹는다 (축대벽을 오차 0.05까지 올려도 10,612 → 8,191).

| 쓰임새 | 목표 삼각형 | 프롬프트에 넣을 말 |
|---|---|---|
| 수십 개 반복 (울타리·포장·깃대) | **1,500 이하** | `low poly, flat shaded, minimal detail, no small props` |
| 열 개 안팎 (민가·아치) | 8,000 이하 | `low poly game asset` |
| 한두 개 (랜드마크) | 자유 | — |

---

## 1순위 — 이게 없으면 컨셉 아트처럼 안 보인다

### ① 구역 현판 아치 2종 (SKILLS · CONTACT)

받은 5개 중 **`Gateway_to_Experience`가 EXPERIENCE 중복**이라(둘 다 EXPERIENCE
글자) SKILLS 와 CONTACT 두 구역만 아직 작은 팻말을 쓰고 있다. 나란히 놓으면
그 두 곳만 초라해 보인다.

- 파일명: `arch-skills.glb`, `arch-contact.glb`
- 위치: `public/models/props/raw/decor/`
- 이미 받은 4개와 **같은 형태·같은 두께**여야 한다. 색만 구역 색으로 다르게:
  - SKILLS → 청록(teal) 바탕에 금색 글자
  - CONTACT → 진녹색 바탕에 금색 글자

```
Stylized fantasy village district gateway archway, two thick stone-and-timber
posts supporting a wide curved wooden banner board spanning between them,
the banner reads "SKILLS" in large bold gold serif capital letters,
teal-painted banner with gold trim and rivets, small hanging lanterns and
narrow vertical pennant flags on each post, moss and ivy at the base,
warm sunset lighting, Ghibli-like storybook game art, low poly game asset,
front-facing flat composition
```

CONTACT 는 위 문장에서 `"SKILLS"` → `"CONTACT"`, `teal-painted` → `deep green
painted` 로만 바꾼다.

> 글자는 Meshy가 자주 틀린다. 뽑고 나서 텍스처를 열어 확인할 것 —
> `node <스크래치>/inspect-glb.mjs <파일> --tex <폴더>` 로 baseColor 를 꺼낼 수 있다.

---

### ② 낮은 담장 / 블록 테두리 — **가장 중요**

컨셉 아트에서 구역이 "구역"으로 보이는 두 번째 이유가 이거다. 블록마다 낮은
돌담·나무 울타리가 둘러 있어서 안과 밖이 나뉜다. 지금 우리 블록은 잔디 위에
건물만 줄지어 서 있어 경계가 없다.

받은 축대벽(`terrace-wall`)으로는 못 두른다 — **한 덩이가 10,612 삼각형**이라
블록 하나를 두르는 데 18개면 그것만 19만이다. 지금은 아치 옆 문기둥으로만 9개
쓰고 있다.

- 파일명: `wall-low-straight.glb` (직선 구간), `wall-low-corner.glb` (90° 모서리)
- 위치: `public/models/props/raw/decor/`
- **정사각형 한 칸(길 타일과 같은 1.9 폭)에 딱 맞는 직선 한 토막.** 이어 붙여
  쓸 것이므로 좌우 끝면이 평평해야 한다
- 높이는 폭의 **3분의 1 정도** (허리 높이 담장)
- **1,500 삼각형 이하가 절대 조건** — 마을 전체에 60~80개를 깐다

```
Single straight segment of a low stylized stone garden wall, waist height,
one module of a repeating fence line, flat square ends on both left and right
so segments tile seamlessly, pale grey cut stone blocks with a flat capstone
on top, patches of green moss, a few small wildflowers at the base,
warm sunset lighting, Ghibli-like storybook game art,
VERY LOW POLY, flat shaded, minimal geometric detail, no separate small props,
under 1500 triangles, front-facing
```

모서리용은 `Single straight segment` → `Single 90-degree corner piece`,
`flat square ends on both left and right` → `flat square ends on the two open
sides` 로 바꾼다.

---

### ③ 넓은 석재 포장 타일

컨셉 아트의 구역 안쪽은 **잔디가 아니라 돌 포장**이다. 우리는 건물마다 작은
원반 하나뿐이라 건물 사이가 다 잔디고, 그래서 "지어진 동네"가 아니라
"풀밭에 놓인 건물들"로 보인다.

- 파일명: `plaza-square.glb`
- 위치: `public/models/props/raw/ground/` ← **`ground` 폴더가 맞다.** 여기 것만
  강한 simplify(오차 0.02)와 "그림자를 받기만 하고 드리우지 않는" 규칙을 탄다
- **정사각형 평판.** 옆으로 이어 붙여 넓은 광장을 만들 것이므로 네 변이 전부
  평평하고, 윗면 무늬가 가장자리에서 끊겨도 어색하지 않아야 한다
- 두께는 아주 얇게 (폭의 5% 이하)

```
Top-down square paving slab tile for a fantasy village plaza, seamless
tileable on all four edges, irregular grey-beige flagstones with thin
grass-filled joints, gently worn surface, a few tiny moss patches,
completely flat thin slab, warm sunset lighting,
Ghibli-like storybook game art, VERY LOW POLY, flat shaded,
no raised props, no border frame, orthographic top view
```

---

### ④ 채움 민가 4종 추가

지금 배경 민가는 받은 2종(`house-a`, `house-b`)을 12채로 돌려쓰고 있다.
같은 집이 여섯 번씩 나오면 위에서 볼 때 복제한 티가 난다. 4종이 더 있으면
16채를 거의 안 겹치게 깐다.

- 파일명: `house-c.glb` ~ `house-f.glb`
- 위치: `public/models/props/raw/decor/`
- 받은 두 채와 **같은 층수(2층)·같은 눈높이**. 지붕 색과 평면 모양만 다르게:
  - `house-c` 파란 슬레이트 지붕 + 흰 회벽, 폭이 좁고 세로로 긴 집
  - `house-d` 초록 기와 + 목조 뼈대(하프팀버), 정사각형에 가까운 집
  - `house-e` 갈색 초가 + 황토벽, 낮고 옆으로 퍼진 집
  - `house-f` 보라 기와 + 회색 석벽, 작은 탑이 하나 붙은 집

```
Small two-storey fantasy village cottage, blue slate roof, white plaster walls
with dark timber trim, narrow tall footprint, warm glowing windows,
wooden front door, small chimney, flower box under one window,
standing alone on flat ground, warm sunset lighting,
Ghibli-like storybook game art, low poly game asset, under 8000 triangles
```

나머지 셋은 첫 두 줄의 지붕/벽/평면 묘사만 위 목록대로 바꾼다.

---

## 2순위 — 있으면 "우와" 소리가 나는 것

### ⑤ 폭포 (섬 절벽에서 떨어지는 물)

컨셉 아트 좌·우·우하단에 폭포가 셋 있다. 우리 섬은 절벽과 물은 있는데
그 사이가 조용해서 섬이 죽어 있다. 마을에서 제일 큰 "움직이는 것"이 될 물건이다.

- 파일명: `waterfall.glb`
- 위치: `public/models/props/raw/decor/`
- **세로로 긴 판** 형태 (높이가 폭의 3배쯤). 절벽면(높이 9유닛)에 붙인다
- 물줄기 아래쪽이 흰 물보라로 흩어지게. 바위는 최소한만

```
Tall narrow stylized waterfall, a single vertical sheet of falling turquoise
water breaking into white foam and mist at the bottom, thin wet rock ledges at
the top edge only, seen from the front, strong vertical composition,
warm sunset light catching the spray, Ghibli-like storybook game art,
low poly game asset, flat front-facing plane composition
```

### ⑥ 아치형 돌다리

북쪽 AI Portfolio 섬(⑧)으로 건너가는 다리이자, 그 전에도 절벽 사이를 잇는
장식으로 쓸 수 있다.

- 파일명: `bridge-stone.glb` / `public/models/props/raw/decor/`
- **길게 뻗은 아치 다리.** 길 두세 칸(3.8~5.6유닛)을 건너는 비율

```
Stylized stone arch bridge spanning a gap, single tall arch, pale cut stone
with moss in the joints, low carved railings on both sides, small lanterns on
the four corner posts, side-on composition, warm sunset lighting,
Ghibli-like storybook game art, low poly game asset
```

### ⑦ 세로 깃발 깃대 (전용)

지금은 `leaf-banner`(황금잎 깃대)를 대신 쓰고 있는데, 컨셉 아트의 깃대는
길고 좁은 파랑·금색 문장기다. 대로변에 20개쯤 깔 물건이라 **반드시 가볍게.**

- 파일명: `flagpole-banner.glb` / `public/models/props/raw/decor/`
- **1,500 삼각형 이하**

```
Single tall thin wooden flagpole with a long narrow vertical banner hanging
from a crossbar, deep blue fabric with a gold emblem and gold fringe at the
bottom, slight fabric curve as if in light wind, small iron base ring,
warm sunset lighting, Ghibli-like storybook game art,
VERY LOW POLY, flat shaded, under 1500 triangles
```

### ⑧ 북쪽 AI Portfolio 섬 한 벌

컨셉 아트 맨 위, 다리로 건너가는 별도의 작은 섬. 지금 우리 마을은 북쪽이
그냥 숲이라 조감도에서 위쪽이 비어 보인다. 세트로 받아야 의미가 있다.

- `island-north.glb` — 풀이 덮인 원뿔형 바위섬 (윗면이 평평해야 건물이 선다)
- `pagoda-portfolio.glb` — 그 위에 서는 탑 형태의 랜드마크 건물
- 위치: 둘 다 `public/models/props/raw/decor/`
  (섬은 크지만 하나뿐이라 삼각형을 써도 된다)

```
Small floating rocky island with a flat grassy top, steep mossy cliff sides,
a few pine trees around the rim, roots and vines hanging under the base,
seen from a slightly high angle, warm sunset lighting,
Ghibli-like storybook game art, low poly game asset
```

```
Tall slender fantasy pagoda tower of three tiered roofs, teal tiles with gold
ridge caps, glowing warm windows on every floor, a floating luminous crystal
above the top spire, stone base with short stairs,
warm sunset lighting, Ghibli-like storybook game art, low poly game asset
```

---

## 3순위 — 마무리 소품

컨셉 아트 하단 소품 띠에 있는데 우리한테 없는 것들. 전부 **1,500 삼각형 이하**로.

| 파일명 | 무엇 | 프롬프트 핵심어 |
|---|---|---|
| `easel.glb` | 이젤 (그림 그리는 삼각대) | `wooden artist easel with a small canvas, paint palette hanging` |
| `anvil.glb` | 모루 (대장간) | `blacksmith anvil on a wooden stump, hammer and tongs beside` |
| `book-stack.glb` | 책더미 | `stack of five worn leather books with bookmarks, one open on top` |
| `scroll-rack.glb` | 두루마리 선반 | `wooden rack holding rolled parchment scrolls, one unrolled` |
| `signpost-arrow.glb` | 화살표 이정표 | `wooden signpost with three arrow-shaped direction boards` |
| `hedge-round.glb` | 다듬은 관목 | `neatly trimmed round topiary bush in a stone pot` |
| `windmill.glb` | 풍차 (컨셉 우상단) | `small stone windmill with four wooden sails, thatched cap` |
| `tree-pine-tall.glb` | 키 큰 침엽수 | `very tall narrow pine tree, dark green` → `nature/` 폴더 |

공통 꼬리말:

```
, standing alone on flat ground, warm sunset lighting,
Ghibli-like storybook game art, VERY LOW POLY, flat shaded,
under 1500 triangles, front-facing
```

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
| `decor/terrace-slab.glb` | **아직 안 씀** — 한 장 1만 삼각형이라 포장용으로 못 쓴다. ③번으로 다시 요청 | 10,174 |
| `decor/arch-alt.glb` | **안 씀** — EXPERIENCE 글자 중복 | 7,015 |

배치를 담당하는 코드는 `scripts/generate-decor-layout.mjs`의 `KIT` 표와
①(구역 입구) · ②-b(채움 민가) · ②-c(남쪽 정문) 절이다. 새 모델을 넣을 때는
`KIT` 에 `h`(원본 GLB 높이 실측)와 `m`(실물 기준 미터)을 적어야 하고,
`h` 는 눈대중으로 넣으면 물건이 땅에 묻히거나 뜬다.
