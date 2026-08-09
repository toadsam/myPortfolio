# 마을 완성용 추가 에셋 요청

컨셉 아트(2026-08-09 제공, 노을빛 계단식 섬 마을)와 현재 마을의 차이를 메우는 데
**코드로는 못 만드는 것**만 모았다. 건물 27채 프롬프트는 별도 문서
(`MESHY_BUILDING_PROMPTS.md`)에 있고 이 문서와 겹치지 않는다.

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

---

## 1순위 — 이게 없으면 컨셉 아트처럼 안 보인다

### ① 구역 현판 아치 ×6  ★가장 중요

컨셉 아트에서 제일 눈에 띄는 물건. 지금은 작은 네온 판때기라 전혀 안 읽힌다.
큼직한 나무 아치에 리본 현판이 걸린 형태.

파일명 → `props/raw/signs/arch-projects.glb` 식으로 6개:

| 파일명 | 현판 글자 |
|---|---|
| `arch-projects.glb` | `PROJECTS` |
| `arch-skills.glb` | `SKILLS` |
| `arch-experience.glb` | `EXPERIENCE` |
| `arch-study.glb` | `STUDY` |
| `arch-life.glb` | `LIFE` |
| `arch-contact.glb` | `CONTACT` |

프롬프트 (글자만 바꿔 6번):

```
A large wooden banner archway for a stylized fantasy village district entrance,
two thick carved timber posts supporting a wide curved ribbon banner across the
top, the banner reading "PROJECTS" in very large bold golden serif letters that
span most of the banner width and are clearly legible, weathered oak with iron
brackets and rope, small hanging lanterns on each post, warm sunset palette,
Ghibli-like handpainted game asset, front-facing view, clean background
```

- 글자가 뭉개져도 코드 라벨이 보험이지만, **글자가 나오면 훨씬 낫다.**
- 한글로 하고 싶으면 GPT-4o / nano banana로 텍스처를 만들 것 (Midjourney·DALL-E는 한글 실패).

### ② 채움용 민가 ×6

컨셉 아트는 건물이 **다닥다닥 붙어** 있다. 우리는 27채가 각자 앞마당에 혼자 서 있어서
휑하다. 클릭 안 되는 배경 건물이 필요하다.

`props/raw/decor/house-a.glb` ~ `house-f.glb`

```
A small stylized fantasy village cottage, handpainted game asset, stone base
with timber frame walls and a steep clay-tile roof, warm glowing windows,
flower boxes and a chimney, no signage, sunset lighting, low-poly stylized,
single building, clean background
```

6개를 지붕 색만 바꿔서: ① 붉은 기와 ② 파란 슬레이트 ③ 초가 ④ 초록 기와
⑤ 나무 널지붕 ⑥ 보라 기와.

> 이게 들어오면 배치 스크립트(`generate-decor-layout.mjs`)에 "민가 무리" 레이어를
> 하나 넣어 구역 사이 빈 잔디를 채운다. 인스턴싱이라 6종 = draw call 6회다.

### ③ 축대·계단 세트 ×3

컨셉 아트가 웅장한 결정적 이유는 **고저차**다. 지금 마을은 완전 평면이다.
구역마다 한 단 올리려면 옹벽과 계단이 필요하다.

- `props/raw/decor/terrace-wall.glb` — 직선 석축 한 칸 (옆으로 이어붙일 수 있게 **양 끝이 평평**해야 함)
- `props/raw/decor/terrace-corner.glb` — 90° 코너
- `props/raw/decor/terrace-stairs.glb` — 축대를 오르는 돌계단

```
A stylized fantasy village retaining wall segment, stacked mossy stone blocks
with a flat coping stone on top, ivy and small grass tufts, handpainted game
asset, straight module with flat butt ends so copies tile seamlessly side by
side, sunset lighting, clean background
```

> 높이는 **1.0 유닛 기준**으로 만들어 주면 코드에서 맞추기 쉽다. 이게 들어오면
> 구역별 단 올리기를 배치 스크립트에 넣는다 (건물·소품·길 y를 구역 단위로 올림).

---

## 2순위 — 있으면 확 산다

### ④ 넓은 광장 바닥 타일 ×2

지금 길은 한 칸(1.88유닛)짜리 얇은 띠라 컨셉 아트의 넓은 석재 광장과 거리가 멀다.

- `props/raw/ground-flat/plaza-wide.glb` — 큰 정사각 석판 (문양 있는 것)
- `props/raw/ground-flat/path-wide.glb` — 2칸 폭 직선 길

```
A top-down square stone plaza floor tile for a stylized fantasy village,
large fitted flagstones in warm sand and terracotta with a subtle radial
pattern, grass creeping between the joints, completely flat slab seen from
above, seamless edges so copies tile edge to edge, handpainted game asset
```

**중요**: 완전히 납작해야 한다. 지금 타일들은 실측 두께가 0.09~0.12다.

### ⑤ 물가 소품 ×3

마을이 섬이 됐으므로 물가가 허전하다.

- `props/raw/decor/dock.glb` — 작은 나무 선착장
- `props/raw/decor/rowboat.glb` — 매어둔 나룻배
- `props/raw/nature/cliff-rock.glb` — 절벽에 얹을 큰 바위

### ⑥ 깃발·현수막 ×2

컨셉 아트에 세로 배너가 잔뜩 걸려 있다.

- `props/raw/decor/banner-tall.glb` — `</>` 문장이 들어간 세로 깃발
- `props/raw/decor/flag-pole.glb` — 깃대

---

## 3순위 — 여유 되면

- `props/raw/decor/bridge.glb` — 아치형 돌다리 (섬 안 개울을 만들 경우)
- `props/raw/decor/waterfall.glb` — 절벽에서 떨어지는 폭포 (컨셉 아트 좌우에 있음)
- `props/raw/decor/windmill.glb` — 풍차 (컨셉 아트 우상단 랜드마크)
- `props/raw/nature/tree-pine-tall.glb` — 키 큰 침엽수 (숲 띠 실루엣 다양화)

---

## 아직 안 온 건물 9채

`MESHY_BUILDING_PROMPTS.md` 참고. 지금은 절차적 상자로 대체돼 있다.

```
post-office · study-codingtest · study-cs
project-sign-language · project-ajou-adventure
life-values · life-invest · life-library · life-timeline
```

---

## 예산 현황 (2026-08-09 기준)

| | 현재 | 예산 |
|---|---|---|
| draw call | 69 | 200 |
| 삼각형 | 773K | 1M |
| 텍스처 | 241MB | 250MB |

**텍스처가 병목이다.** 1순위 에셋(현판 6 + 민가 6 + 축대 3 = 15종)을 넣으면
넘길 가능성이 크다. 넣고 나서 `optimize_textures.py`의 `BUDGETS`에서
`props` 해상도를 512로 한 단계 내리면 된다 — 간판 7장을 1024→512로 내렸을 때
37MB가 빠졌고 글자는 그대로였다.

삼각형·draw call은 여유가 많다. 인스턴싱이라 같은 GLB를 몇 개 심든 draw call은 1이다.
