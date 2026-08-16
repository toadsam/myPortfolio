# 다음 에셋 프롬프트 — 원반 섬 마을에 지금 필요한 것들

`MESHY_PROP_PROMPTS.md`(장식물) · `MESHY_BUILDING_PROMPTS.md`(건물)와 같은
세계관·같은 파이프라인의 **추가분**입니다. 2026-08-14 원반 섬 개편 이후 실측으로
가장 아쉬운 순서로 골랐습니다.

## 왜 이것들인가 (실측)

| 에셋              | 지금 상태                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `bridge-arch.glb` | 돌다리(`bridge-stone`) **한 모델이 19곳** — 다리가 섬 마을의 주인공이 됐는데 전부 같은 모델이라 부감에서 복제 티가 가장 크게 나는 물건 |
| 물가 소품 3종     | 물가 표본 283곳을 가로등·벤치·바위로만 채우는 중 — "물가답게" 만드는 갈대·수련·징검다리가 0종                                          |
| `study-cs.glb`    | 27채 중 **유일하게 GLB 가 없는 건물** — CS ARCHIVE 자리가 기본 상자로 서 있다                                                          |

## 파이프라인 (기존과 동일)

```
프롬프트 → 이미지 생성 AI → Meshy [Image to 3D] → GLB
  → 장식물: public/models/props/raw/<카테고리>/<파일명>.glb → npm run optimize
  → 건물:   MESHY_BUILDING_PROMPTS.md 의 건물 파이프라인 (파일명 = 건물 id)
```

- 장식물 프리픽스/네거티브는 `MESHY_PROP_PROMPTS.md` §3 을 그대로 앞뒤에 붙일 것
  (입체물 = 프리픽스 A, 평면물 = 프리픽스 B).
- Meshy 는 높이 1.9 로 정규화해 내보낸다 — 아래 표의 실물 치수가 배치 스케일
  계산의 기준이다 (마을 자: 1유닛 ≈ 2.5m, 캐릭터 0.8유닛 = 1.7m).

---

## 1. `decor/bridge-arch.glb` — 아치 돌다리 (변주) · 프리픽스 A

**실물 기준**: 길이 7m(2.8유닛) · 폭 2.2m · 난간 높이 1m. 지금 `bridge-stone` 과
같은 자리에 서로 번갈아 서야 하므로 **치수는 같고 생김새만 달라야** 한다.
`bridge-stone` 은 난간 기둥이 각지고 아치가 낮다 — 이번 것은 아치를 높이고
난간을 둥글려 실루엣이 확실히 갈리게.

```
a small fairytale stone arch bridge with one tall rounded arch underneath,
smooth curved stone railings with round cap stones, weathered grey stone with
soft moss green patches at the base, gently humped walkway with shallow steps,
about four steps long, the arch tall enough for a small boat to pass under
```

배치 연결(코드 쪽 메모): `generate-decor-layout.mjs` 의 건널목 다리 절에서
`n % 2` 로 `bridge-stone` / `bridge-arch` 를 번갈아 놓으면 끝 — KIT 에
`"bridge-arch": {glb: "decor/bridge-arch.glb", h: <실측>, m: 7}` 한 줄 추가.

---

## 2. `nature/reed-clump.glb` — 갈대 무더기 · 프리픽스 A

**실물 기준**: 높이 1.2m(0.48유닛, scale ≈ 0.25). 물가에 반쯤 잠기게 놓는다
(`quay-rock` 처럼 `onWater` 배치 — 수면 0.03 에 밑동이 잠긴다).
잎사귀형이라 **simplify 가 안 먹는다** — 프롬프트에서부터 줄기 개수를 적게.

```
a small clump of fairytale water reeds, about seven thick simple stalks with
soft rounded tips, two or three flat blade leaves, warm tan and olive green
colors, slightly leaning as if in a gentle breeze, growing from a tiny mound
of mud
```

---

## 3. `nature/lily-pads.glb` — 수련 잎 무리 · **프리픽스 B (평면물)**

**실물 기준**: 무리 지름 1.5m(0.6유닛). 수면(0.03) 바로 위에 눕는 얇은 판 —
평면물 규칙(60° 부감, `slight visible thickness at the edges`)을 반드시 쓸 것.
3/4 뷰로 뽑으면 사다리꼴로 굳는다.

```
a cluster of five round fairytale lily pads floating flat, soft green pads with
a single notch cut in each, one small pink lotus flower with rounded petals in
the middle, the pads slightly different sizes, arranged loosely
```

---

## 4. `decor/stepping-stones.glb` — 징검다리 한 줄 · **프리픽스 B (평면물)**

**실물 기준**: 한 줄 길이 4m(1.6유닛) · 돌 5개. 얕은 물가(깊이 0.1~0.2 구간)에
놓아 "여기로 건너도 된다"는 그림을 만든다 — 걷기 판정은 이미 물에 들어가지므로
장식만으로 충분하다.

```
a straight row of five flat rounded stepping stones, smooth grey river stones
with soft beige tops, each stone slightly different in size and shape, evenly
spaced in a line, worn smooth on top
```

---

## 5. `study-cs.glb` — CS 아카이브 건물 · **건물 파이프라인**

`MESHY_BUILDING_PROMPTS.md` 의 공통 프리픽스·네거티브·설정을 그대로 쓰고,
완성 GLB 파일명을 **`study-cs.glb`** 로 (파일명 = 건물 id 자동 연결).
구역은 STUDY — 이웃이 알고리즘 도장(코딩테스트)이라, 그쪽이 "수련장"이면
이쪽은 "서고"다. 콘셉트 참고: `라이프구역.png` 옆 `스터디구역` 시트.

```
a tall fairytale archive library tower, three stacked stone floors with warm
wooden beams, a steep dark blue shingle roof with one round attic window,
tall arched windows glowing warm yellow, stone chimney, stacks of oversized
books visible through the ground floor window, a small hanging wooden sign
with a book symbol, ivy climbing one corner
```

---

## 넣은 뒤 할 일 체크리스트

1. `npm run optimize` (장식물) — simplify 는 기본값, 갈대만 결과 삼각형을 확인
   (1만 넘으면 프롬프트에서 줄기를 더 줄여 다시).
2. `bake-prop`(스크래치패드 `sheet.mjs`)로 **정면이 +Z 인지** 확인 — 다리는
   길이 축이 +X 여야 기존 회전 규약과 맞는다.
3. KIT 등록(`generate-decor-layout.mjs`) → 재생성 → `npm run check:village`.
4. 삼각형 예산 확인 — 지금 1,761k / 1,800k 라 **여유 39k 뿐**이다. 갈대·수련을
   많이 깔려면 먼저 뭘 빼든가 상한을 올리는 결정이 필요하다.
