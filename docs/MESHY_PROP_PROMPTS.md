# 마을 데코·바닥·장식물 이미지 프롬프트 (Meshy Image-to-3D)

건물(`MESHY_BUILDING_PROMPTS.md`) · 캐릭터(`MESHY_CHARACTER_PROMPTS.md`)와 같은 세계관·같은 파이프라인을 쓰는 **배경 오브젝트** 문서입니다.

---

## 0. 왜 데코를 반드시 바꿔야 하는가

현재 마을의 배경 오브젝트는 전부 **코드로 그린 사이버펑크 네온**입니다.

| 요소 | 현재 구현 위치 | 지금 모습 |
| --- | --- | --- |
| 나무 | `src/components/village/Tree.tsx` | `metalness 0.85` + emissive `#00ff88`/`#aa44ff` 금속 네온 트리 |
| 바위 | `Decorations.tsx:35` `Rock` | 십이면체 + `pointLight #00aaff` 발광 크리스탈 |
| 울타리 | `Decorations.tsx:50` `Fence` | `meshBasicMaterial #00d4ff` — 에너지 배리어 |
| 길 | `Decorations.tsx:18` `PathSegment` | 검은 아스팔트 + 네온 센터라인 |
| 표지판 | `Decorations.tsx:73` `SignPost` | 홀로그램 패널 + 글로우 |
| 씬 조명 | `VillageScene.tsx:279-282` | `#00d4ff` `#aa44ff` `#00ff88` `#ff6600` 포인트라이트 4개 |

판타지 건물만 올리면 이 네온 배경 위에 건물만 동떨어져 보입니다. **건물 교체와 데코 교체는 한 세트입니다.**

---

## 1. 파이프라인

```
이 문서의 프롬프트  →  이미지 생성 AI  →  이미지
   →  Meshy [Image to 3D]  →  GLB 다운로드
   →  public/models/props/raw/<카테고리>/<파일명>.glb
   →  npm run optimize        (텍스처 축소 + Draco 압축 → public/models/props/<카테고리>/)
   →  npm run dev → 마을에서 [프롭 편집] → 트레이에서 드래그 배치
   →  src/data/propsLayout.json 에 자동 저장
```

**건물과 달리 코드 수정이 필요 없습니다.** `propsLayout.json`은 현재 `"props": []` 로 비어 있고, 배치는 전부 브라우저에서 마우스로 합니다. 폴더명이 그대로 편집 트레이의 카테고리 탭이 되므로 **아래 지정한 폴더명을 그대로 쓰세요.**

---

## 2. 데코가 건물·캐릭터와 다른 3가지 제약

### ① 하나를 수십 번 배치한다 → 폴리곤을 훨씬 낮게

건물은 27종이 각 1개씩이지만 나무는 **한 모델을 30~50번** 배치합니다. `InstancedProps.tsx`가 InstancedMesh로 묶어주므로 draw call은 1회로 유지되지만, **지오메트리 비용은 인스턴스 수만큼 곱해집니다.** 프롬프트에 `very low poly`, `simple silhouette`를 건물보다 강하게 넣은 이유입니다.

### ② 메시가 여러 개면 draw call이 그만큼 늘어난다

`InstancedProps.tsx:40` `extractParts()`가 GLB 안의 메시를 전부 뽑아 **파트마다 InstancedMesh를 하나씩** 만듭니다. 즉 GLB 하나에 메시가 5개면 draw call도 5배입니다. 프롬프트에서 `single connected object`를 강조해 파트가 쪼개지지 않게 유도합니다.

### ③ 텍스처 예산이 건물의 절반

`scripts/optimize_textures.py`의 `BUDGETS`:

```python
"buildings": {"baseColor": 1024, ...}
"props":     {"baseColor": 512,  "normal": 256, ...}   # ← 절반
```

512px로 줄여도 뭉개지지 않으려면 **잔무늬가 아니라 큰 색면**으로 디자인해야 합니다. `hand-painted matte`, `flat color blocks`가 그 장치입니다.

### ④ 조명 프롭에는 실제 광원이 안 들어간다

가로등·모닥불을 GLB로 뽑아도 **빛은 나오지 않습니다.** glTF 광원은 인스턴싱되지 않기 때문입니다. 발광부는 `glowing warm emissive` 재질로 만들고, 실제 `pointLight`는 배치 후 코드에서 얹습니다.

---

## 3. 공통 프롬프트 규칙

데코는 **입체물**과 **평면물** 두 종류로 구도가 갈립니다. 섞어 쓰면 안 됩니다.

### 프리픽스 A — 입체물용 (나무·벤치·가로등·표지판 등, 대부분)

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
```

### 프리픽스 B — 평면물용 (바닥 타일·길 세그먼트)

```
3D rendered miniature fairytale village ground tile, stylized very low-poly game
asset, hand-painted matte textures with flat color blocks, warm golden-hour
lighting, cozy storybook mood, a flat slab with slight visible thickness at the
edges, viewed from a high angle about 60 degrees above, square tile shape fully
visible and centered in frame, plain flat light grey studio background,
isolated single object, no cast shadow,
```

> **평면물을 3/4 뷰로 뽑으면 안 되는 이유**: Meshy가 원근 왜곡을 그대로 3D로 굳혀서 사다리꼴 타일이 나오거나, 두께를 인식하지 못해 종잇장 폴리곤을 만듭니다. `slight visible thickness at the edges`가 두께를 살리는 핵심 문구입니다.

### 공통 네거티브 (표지판 제외 전 항목)

```
photorealistic, realistic, cluttered background, scenery, landscape, multiple
objects, group of items, people, characters, cropped, cut off, extreme
perspective, fisheye, harsh shadows, neon, cyberpunk, glowing sci-fi, metallic,
chrome, dark gloomy, blurry, motion blur, text, letters, watermark
```

### 표지판 전용 네거티브 (`text, letters` 제외)

```
photorealistic, realistic, cluttered background, scenery, landscape, multiple
objects, people, characters, cropped, cut off, extreme perspective, fisheye,
harsh shadows, neon, cyberpunk, glowing sci-fi, metallic, chrome, dark gloomy,
blurry, misspelled text, garbled letters, watermark
```

---

## 4. 스케일 기준표

**캐릭터 키 = 1.0** 을 기준으로 삼습니다. 이미지 안에서 이 비율감이 느껴지게 프롬프트에 크기 서술을 넣었고, 배치할 때도 이 표대로 맞추면 마을 전체 축척이 흔들리지 않습니다.

| 항목 | 상대 높이 | 항목 | 상대 높이 |
| --- | --- | --- | --- |
| 침엽수 | 3.0 | 마을 입구 아치 | 3.2 |
| 참나무 | 2.5 | 깃대 | 3.5 |
| 꽃나무 | 2.2 | 동상 | 3.0 |
| 가로등 | 2.2 | 노점 | 2.4 |
| 이정표 | 2.0 | 분수 | 1.8 |
| 구역 표지판 | 1.8 | 게시판 | 1.5 |
| 우물 | 1.2 | 우편함 | 1.1 |
| 울타리 문 | 1.6 | 이젤 | 1.4 |
| 울타리 | 0.8 | 나무통 | 0.8 |
| 바위 | 0.7 | 벤치 | 0.6 |
| 상자 | 0.6 | 모닥불 | 0.6 |
| 덤불 | 0.5 | 그루터기 | 0.4 |
| 작은 돌무더기 | 0.3 | 꽃무리 | 0.2 |

---

## 5. Meshy 설정

| 항목 | 값 |
| --- | --- |
| 모드 | **Image to 3D** |
| Topology | Triangle |
| Polycount | **Low (~5k)** — 건물보다 한 단계 낮게 |
| Texture | On, PBR 끔 (매트 룩이라 필요 없음) |
| Symmetry | Auto (표지판·가로등은 On 권장) |
| Rigging | **사용 안 함** (데코는 정적) |

---

## 6. 카테고리별 프롬프트 (총 44종)

★ = 1차 필수 세트. 이것만 먼저 뽑아도 마을 톤이 바뀝니다.

각 프롬프트는 **프리픽스(A 또는 B) + 아래 본문 + 네거티브** 순으로 조합해서 넣으세요.

---

### `nature/` — 자연물 (7종) · 프리픽스 A

#### ★ 1. `tree-oak.glb` — 둥근 활엽수
```
a chubby fairytale oak tree with one big rounded puffy canopy made of a few
simple blobby leaf clusters, warm green foliage with soft yellow-green highlights,
a short sturdy brown trunk, tall and full, about two and a half times a person's
height
```

#### ★ 2. `tree-pine.glb` — 침엽수
```
a tall slim fairytale pine tree with three stacked rounded cone layers of deep
green foliage, a slender brown trunk, gently tapering to a soft rounded tip,
notably taller and narrower than a broadleaf tree, about three times a person's
height
```

#### 3. `tree-blossom.glb` — 꽃나무 (포인트)
```
a small fairytale blossom tree with a soft rounded canopy of pale pink and cream
flowers, a slender curved trunk, a few petals resting on the branches, warm and
cheerful, slightly shorter than an oak tree
```

#### ★ 4. `bush.glb` — 덤불
```
a small round fairytale bush, one compact dome of soft green leafy blobs sitting
directly on the ground, a few tiny berries, no trunk visible, about knee height
to a person
```

#### 5. `flower-patch.glb` — 꽃무리
```
a small cluster of chunky fairytale wildflowers growing together in one compact
tuft, simple round petals in warm yellow orange and soft pink, short green stems
and a few leaves, forming a single connected clump, very low to the ground
```

#### ★ 6. `rock.glb` — 바위
```
a single chunky fairytale boulder with a few large flat faceted surfaces, warm
grey stone with soft beige and mossy green patches on top, rounded weathered
edges, sitting solidly on its base, about waist height to a person
```

#### 7. `rock-small.glb` — 작은 돌무더기
```
a small pile of three rounded fairytale pebbles clustered together into one
connected group, warm grey stone with soft beige tones, smooth weathered
surfaces, very low to the ground, ankle height to a person
```

---

### `ground/` — 바닥·길 (6종) · **프리픽스 B**

> 이 6종만 프리픽스 B를 씁니다. 나머지 전부 A입니다.

#### ★ 8. `path-straight.glb` — 직선 돌길
```
a square fairytale village path tile made of warm sandy beige cobblestones with
rounded irregular shapes, a straight walking path running from one edge to the
opposite edge, soft green grass with tiny flowers filling the two side strips,
a flat slab with slight visible thickness at the edges
```

#### ★ 9. `path-curve.glb` — 곡선 돌길
```
a square fairytale village path tile made of warm sandy beige cobblestones,
a curved walking path entering from one edge and turning to exit through the
adjacent edge in a smooth quarter arc, soft green grass with tiny flowers filling
the remaining corners, a flat slab with slight visible thickness at the edges
```

#### 10. `path-cross.glb` — 교차로
```
a square fairytale village path tile made of warm sandy beige cobblestones,
two walking paths crossing at the center forming a plus shape reaching all four
edges, soft green grass with tiny flowers filling the four corner areas,
a flat slab with slight visible thickness at the edges
```

#### ★ 11. `path-t.glb` — T자 분기로
```
a square fairytale village path tile made of warm sandy beige cobblestones,
three walking paths meeting at the center forming a T shape reaching three
edges, soft green grass with tiny flowers filling the remaining edge and the
two adjoining corner areas, a flat slab with slight visible thickness at the
edges
```

#### ★ 12. `plaza-tile.glb` — 광장 원형 바닥
```
a round fairytale village plaza floor made of warm cream and terracotta paving
stones arranged in concentric rings, a simple decorative sunburst pattern at the
center, a low stone rim around the outer edge, a flat circular slab with slight
visible thickness at the edges
```

#### 13. `grass-patch.glb` — 잔디 패치
```
a square fairytale village grass tile, soft rounded green turf with gentle
mounded bumps, a few tiny white and yellow flowers and small leaf tufts scattered
across it, warm sunlit green, a flat slab with slight visible thickness at the
edges
```

---

### `fence/` — 경계·입구 (3종) · 프리픽스 A

#### ★ 14. `fence-wood.glb` — 나무 울타리
```
a short fairytale village wooden fence section, three chunky rounded vertical
posts connected by two horizontal rails, warm honey-brown painted wood with
visible soft grain, slightly worn rounded edges, about waist height to a person
```

#### 15. `fence-gate.glb` — 울타리 문
```
a small fairytale village wooden gate, two thicker posts with a simple swinging
door panel of vertical planks between them, a rounded arched top rail, warm
honey-brown painted wood with a small iron ring handle, about chest height to
a person
```

#### ★ 16. `village-arch.glb` — 마을 입구 아치
```
a fairytale village entrance archway, two chunky rounded stone pillars supporting
a curved wooden beam across the top, a small pointed shingle roof over the beam,
warm cream stone and honey-brown timber, two tiny hanging lanterns on the inner
sides, tall enough for several people to walk under
```

---

### `light/` — 조명 (3종) · 프리픽스 A

> 발광부는 재질만 밝게 나옵니다. 실제 빛은 배치 후 코드에서 `pointLight`로 추가합니다.

#### ★ 17. `lamp-post.glb` — 가로등
```
a fairytale village lamp post, a slender tapered wooden pole with a small
four-sided lantern box on top under a tiny pointed copper roof, warm glowing
amber emissive glass panels, a simple curved bracket, soft cream and brown paint,
about twice a person's height
```

#### 18. `lantern-hanging.glb` — 걸이 랜턴
```
a small fairytale hanging lantern, a rounded paper-lantern body with warm glowing
amber emissive light inside, a tiny domed cap and a short hanging ring on top,
soft cream and warm orange, small enough to be held in one hand
```

#### 19. `campfire.glb` — 모닥불
```
a small fairytale village campfire, a ring of rounded grey stones enclosing a few
stacked logs with simple stylized flame shapes above them, warm glowing orange
and yellow emissive fire, soft rounded chunky shapes, about knee height to
a person
```

---

### `sign/` — 표지판 (9종) · 프리픽스 A · **표지판 전용 네거티브 사용**

> 구역 표지판 7종의 문구는 `src/lib/constants.ts`의 `sectionMeta.label`과 **정확히 일치**시켰습니다. 현재 씬에는 4개만 있어 **Central Plaza / Study / Contact 3종이 신규**입니다.
>
> 한글은 이미지 AI가 자주 뭉개므로 전부 영문입니다. 글자가 깨지면 문구를 짧게 줄이거나(`Projects` 등) 재생성하세요.

#### ★ 20. `sign-plaza.glb`
```
a fairytale village signboard, a carved wooden plank hanging from a sturdy
rounded post by two small iron rings, the plank reading "Central Plaza" in clean
bold hand-painted letters, warm honey-brown wood with a soft cream painted
surface, a tiny pointed roof cap on the post, about shoulder height to a person
```

#### ★ 21. `sign-projects.glb`
```
a fairytale village signboard, a carved wooden plank hanging from a sturdy
rounded post by two small iron rings, the plank reading "Project District" in
clean bold hand-painted letters, warm honey-brown wood with a soft cream painted
surface and warm amber trim, a tiny pointed roof cap on the post, about shoulder
height to a person
```

#### ★ 22. `sign-skills.glb`
```
a fairytale village signboard, a carved wooden plank hanging from a sturdy
rounded post by two small iron rings, the plank reading "Skills District" in
clean bold hand-painted letters, warm honey-brown wood with a soft cream painted
surface and teal trim, a tiny pointed roof cap on the post, about shoulder height
to a person
```

#### ★ 23. `sign-experience.glb`
```
a fairytale village signboard, a carved wooden plank hanging from a sturdy
rounded post by two small iron rings, the plank reading "Experience Archive" in
clean bold hand-painted letters, warm honey-brown wood with a soft cream painted
surface and soft lavender trim, a tiny pointed roof cap on the post, about
shoulder height to a person
```

#### ★ 24. `sign-study.glb`
```
a fairytale village signboard, a carved wooden plank hanging from a sturdy
rounded post by two small iron rings, the plank reading "Study District" in clean
bold hand-painted letters, warm honey-brown wood with a soft cream painted
surface and deep blue trim, a tiny pointed roof cap on the post, about shoulder
height to a person
```

#### ★ 25. `sign-contact.glb`
```
a fairytale village signboard, a carved wooden plank hanging from a sturdy
rounded post by two small iron rings, the plank reading "Contact Post" in clean
bold hand-painted letters, warm honey-brown wood with a soft cream painted
surface and warm coral trim, a tiny pointed roof cap on the post, about shoulder
height to a person
```

#### ★ 26. `sign-life.glb`
```
a fairytale village signboard, a carved wooden plank hanging from a sturdy
rounded post by two small iron rings, the plank reading "Life District" in clean
bold hand-painted letters, warm honey-brown wood with a soft cream painted
surface and warm golden trim, a tiny pointed roof cap on the post, about shoulder
height to a person
```

#### 27. `signpost-arrow.glb` — 방향 이정표
```
a fairytale village direction signpost, a tall rounded wooden post with three
pointed arrow-shaped planks attached at different heights facing different
directions, the planks reading "Projects", "Skills" and "Life" in small clean
hand-painted letters, warm honey-brown wood with cream painted plank faces,
about a person's height
```

#### 28. `notice-board.glb` — 게시판
```
a fairytale village notice board, a wide wooden board on two sturdy legs under a
small pointed shingle roof, a few small blank paper notes pinned to the cork
surface, a carved header plank reading "Notice" in clean bold hand-painted
letters, warm honey-brown timber and soft cream paper, about chest height to
a person
```

---

### `plaza/` — 광장 중심물 (3종) · 프리픽스 A

#### ★ 29. `fountain.glb` — 분수
```
a small fairytale village fountain, a round tiered stone basin with a slender
center column and a smaller upper bowl, gentle stylized water arcs and a soft
pale blue pool inside, warm cream stone with soft teal water and a few rounded
decorative carvings, wide and low, slightly under a person's height
```

#### 30. `statue.glb` — 마을 동상
```
a small fairytale village monument statue, a chunky rounded stone figure of a
cloaked traveler holding a lantern, standing on a square tiered pedestal with a
simple carved border, warm cream and sandy beige stone with soft moss patches at
the base, about three times a person's height including the pedestal
```

#### 31. `banner-pole.glb` — 깃대
```
a tall fairytale village banner pole, a slender rounded wooden mast with a long
vertical fabric banner hanging from a short crossbar, the banner in warm amber
and cream with a simple geometric emblem, a small golden finial on top, gently
tapering, notably taller than a lamp post
```

---

### `furniture/` — 생활 소품 (6종) · 프리픽스 A

#### ★ 32. `bench.glb` — 벤치
```
a small fairytale village bench, a chunky rounded wooden seat plank on two thick
curved legs with a simple slatted backrest, warm honey-brown painted wood with
soft worn edges, low and wide, about knee height at the seat
```

#### ★ 33. `barrel.glb` — 나무통
```
a single fairytale village wooden barrel standing upright, a rounded bulging body
of vertical staves bound by two darker iron hoops, a flat lid on top, warm
honey-brown wood with soft worn edges, about waist height to a person
```

#### 34. `crate.glb` — 나무 상자
```
a single fairytale village wooden crate, a chunky cube box made of thick planks
with rounded corners and simple cross-braced side panels, warm honey-brown wood
with soft worn edges, about knee height to a person
```

#### ★ 35. `well.glb` — 우물
```
a small fairytale village stone well, a round low stone rim with two side posts
supporting a small pointed shingle roof, a tiny wooden bucket hanging from a rope
and a simple crank handle, warm cream stone and honey-brown timber, about chest
height to a person
```

#### 36. `market-stall.glb` — 노점
```
a small fairytale village market stall, a simple wooden counter table under a
striped fabric awning held up by four slender posts, the awning in warm cream and
soft coral stripes with a scalloped edge, a few rounded crates and fruit baskets
on the counter, taller than a person
```

#### 37. `flag-banner.glb` — 삼각 깃발 줄
```
a fairytale village bunting garland, a gently sagging rope strung with a row of
small triangular fabric flags in warm cream, amber and soft coral, each flag
softly rounded at the corners, forming one connected piece, wide and light
```

---

### `theme/` — 구역별 성격 소품 (5종) · 프리픽스 A

각 구역 앞에 놓아 구역 성격을 한눈에 드러내는 소품입니다.

#### 38. `theme-project-easel.glb` — 프로젝트 구역
```
a fairytale village display easel, a wooden tripod stand holding a framed board
showing a simple painted landscape, a small shelf with two paint pots at the
base, warm honey-brown wood with soft amber accents, about chest height to
a person
```

#### 39. `theme-skill-anvil.glb` — 스킬 구역
```
a fairytale village blacksmith anvil on a chunky round wooden stump, a rounded
hammer resting on top and a small pair of tongs leaning against the side, warm
dark grey iron with soft highlights and honey-brown wood, about waist height to
a person
```

#### 40. `theme-study-bookstack.glb` — 학습 구역
```
a small fairytale stack of four chunky closed books piled slightly askew, warm
cream and deep blue covers with soft golden trim on the spines, a short lit candle
in a tiny holder resting on top with a warm glowing emissive flame, about knee
height to a person
```

#### 41. `theme-experience-scroll.glb` — 경력 구역
```
a fairytale village scroll holder, a round wooden barrel-shaped container packed
with several rolled parchment scrolls fanning out from the top, a small brass
plate on the front, warm honey-brown wood and soft cream parchment, about waist
height to a person
```

#### 42. `theme-life-picnic.glb` — Life 구역
```
a small fairytale village picnic setup, a folded checkered blanket in warm cream
and soft coral spread on the ground with a rounded wicker basket and a simple
wooden lute resting on it, forming one connected group, very low to the ground
```

---

### `misc/` — 분위기 소품 (2종) · 프리픽스 A

#### 43. `mailbox.glb` — 우편함
```
a fairytale village mailbox, a small rounded box with a curved lid and a narrow
letter slot mounted on a short sturdy post, a tiny raised flag on the side and a
few letter corners peeking out, warm coral painted metal with cream trim, about
chest height to a person
```

#### 44. `potted-plant.glb` — 화분
```
a small fairytale village potted plant, a rounded terracotta pot with a slightly
flared rim holding a compact bushy plant with a few chunky rounded leaves and two
small warm-yellow flowers, warm orange-brown pot and soft green foliage, about
knee height to a person
```

---

## 7. 교체 대상 매핑

GLB가 들어오면 이 코드들이 정리 대상이 됩니다.

| 새 에셋 | 대체할 현재 코드 | 처리 |
| --- | --- | --- |
| `nature/tree-*.glb` | `Tree.tsx` 전체 | 컴포넌트 삭제, `VillageScene.tsx:351` `treePositions` 루프 제거 후 프롭 배치로 이관 |
| `nature/rock*.glb` | `Decorations.tsx:35` `Rock` | 삭제, `VillageScene.tsx:355` `rockPositions` 루프 제거 |
| `fence/fence-wood.glb` | `Decorations.tsx:50` `Fence` | 삭제 (에너지 배리어 + `pointLight` 동반 제거) |
| `ground/path-*.glb` | `Decorations.tsx:18` `PathSegment` | 삭제 |
| `sign/sign-*.glb` | `Decorations.tsx:73` `SignPost` + `VillageScene.tsx:288-291` `DistrictSign` | 삭제, 표지판 7개 전부 프롭으로 배치 |
| `plaza/statue.glb` | `public/models/environment/statue.glb` | 파일 교체 (`VillageScene.tsx:70` 경로 유지) |
| `plaza/fountain.glb` | — | 신규 |

**추가로 손봐야 할 톤 충돌**

- `VillageScene.tsx:279-282` — 네온 포인트라이트 4개 (`#00d4ff` `#aa44ff` `#00ff88` `#ff6600`) 제거 또는 따뜻한 색으로 교체
- `VillageScene.tsx:66` — 노을 프리셋을 기본값으로 고정
- `Decorations.tsx` 전체가 비면 파일 삭제
- `public/models/environment/바닥.glb` (7.7MB) — 현재 어디서도 로드되지 않음. 용도 확인 후 삭제 대상

---

## 8. 권장 순서

1. **`ground/path-straight.glb` 하나만 먼저** 이미지 → Meshy → `npm run optimize` → 배치까지 끝까지 돌려보세요. 평면물은 두께 인식 실패가 가장 흔한 실패 지점이라 여기서 프리픽스 B가 통하는지부터 검증해야 합니다.
2. 통과하면 **★ 1차 필수 세트 17종**을 뽑습니다. 나무 2 · 덤불 · 바위 · 길 4(직선·곡선·T자·광장 바닥) · 울타리 · 아치 · 가로등 · 표지판 7 중 주요 · 분수 · 벤치 · 나무통 · 우물.
3. 이 상태로 한번 배치해보고 빈 곳이 보이면 나머지를 추가합니다.

> 데코는 건물과 달리 **부분 교체가 가능합니다.** 나무만 바꿔도 즉시 톤이 달라지므로, 44종을 다 뽑고 나서 한꺼번에 넣을 필요가 없습니다.
