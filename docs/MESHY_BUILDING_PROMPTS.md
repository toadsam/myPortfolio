# 건물 에셋 제작 프롬프트 (27개) — 이미지 생성 → Meshy Image-to-3D

3D 마을의 모든 건물을 **동화풍 판타지 미니어처** 톤으로 통일해 재제작하기 위한 프롬프트 모음.

## 워크플로우

```
① 이미지 생성 AI (Midjourney / GPT-4o / nano banana 등)
   → 아래 프롬프트로 건물 컨셉 이미지 1장 생성
② Meshy → Image to 3D 에 그 이미지 업로드
③ GLB 다운로드 → public/models/buildings/<파일명>
④ constants.ts 에 glbPath 연결
```

## 이미지 생성 공통 프리픽스 (모든 건물에 앞에 붙임)

```
3D rendered miniature fairytale village building, stylized low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures, warm golden-hour
sunset lighting with soft ambient shadows, cozy storybook mood,
front three-quarter view at eye level, entire building fully visible and
centered in frame, plain flat light grey studio background, isolated single
object, clean product shot, no ground plane, no cast shadow,
```

### 구도가 가장 중요합니다

Meshy Image-to-3D의 품질은 **이미지 구도**가 8할입니다. 위 프리픽스에 들어간 지시를 절대 빼지 마세요.

| 지시 | 이유 |
|---|---|
| `front three-quarter view` | 정면+측면이 동시에 보여야 Meshy가 깊이를 추정함. 완전 정면은 납작하게, 탑뷰는 실루엣이 뭉개짐 |
| `entire building fully visible, centered` | 잘리면 그 부분이 통째로 소실됨 |
| `plain flat light grey background` | 배경이 복잡하면 배경까지 메시로 만들어버림 |
| `isolated single object` | 여러 건물이 있으면 하나로 뭉침 |
| `no cast shadow` | 바닥 그림자를 지오메트리로 오해함 |

## 공통 네거티브 프롬프트

```
photorealistic, realistic, cluttered background, scenery, landscape, multiple
buildings, people, characters, cropped, cut off, top-down view, aerial view,
extreme perspective, fisheye, harsh shadows, neon cyberpunk, dark gloomy,
glass skyscraper, modern corporate, blurry, motion blur
```

## 간판 텍스트에 대해

각 건물 프롬프트에 간판 문구가 포함되어 있습니다. 다만 실무상 두 가지를 감안하세요.

- **한글 간판은 이미지 생성 단계에서 실패율이 높습니다.** Midjourney/DALL-E는 한글을 거의 못 씁니다. GPT-4o 이미지나 nano banana(Gemini)는 비교적 됩니다. 그래서 한글 간판 건물에는 **영문 대체 문구**를 같이 적어뒀습니다.
- **이미지가 잘 나와도 Meshy가 텍스처로 옮기면서 글자가 흐려질 수 있습니다.** 결과가 안 읽히면 그 건물만 코드에서 3D 텍스트를 덧씌우면 됩니다 (`constants.ts`의 `name` 값을 그대로 사용). 섞어 써도 무방합니다.

## Meshy Image-to-3D 설정

- Art Style: `Stylized`
- Topology: `Quad` / Polycount: `Low ~ Medium`
- Texture: `On` (간판 글자가 텍스처로 구워져야 함)
- Symmetry: `Auto` (비대칭 건물은 `Off`)

## 제작 규격

- 포맷 **.glb**, Y-up, **원점(0,0,0) = 건물 바닥 중심**
- 대략 **1×1×1 유닛** 기준 (코드가 `size[1] × 0.62`로 자동 스케일 — `src/components/village/Building.tsx:65`)
- `public/models/buildings/<파일명>` 저장 → `constants.ts`에 `glbPath: "/models/buildings/<파일명>"` 추가
- 용량 크면 `npm run optimize`

---

## 1) 프로젝트 구역 (9개) — 마을 서쪽

### 1. `mystock.glb` — MyStock-Desk · 금융/AI 대시보드
비율: 세로로 높음 (1.9 / **2.6** / 1.9) · 포인트 색: 청록

```
a tall narrow fantasy village bank tower with a round clock face and a glowing
teal crystal orb on top, stacked coin motifs and small arched windows, copper
roof with verdigris patina, a carved wooden signboard above the arched entrance
reading "MyStock" in clean bold letters, teal and aqua accents,
notably taller than it is wide
```

### 2. `festflow.glb` — FestFlow · 대학 축제 운영
비율: 낮고 넓음 (2.2 / 1.5 / 2.2) · 포인트 색: 노랑

```
a wide low festival market stall pavilion with a striped red and cream canvas
canopy, colorful triangular bunting flags, hanging round paper lanterns and
warm string lights, wooden stall counters at the front, a hanging banner sign
across the top reading "FestFlow" in cheerful bold letters, golden yellow
accents, clearly wider than tall
```

### 3. `sign-language.glb` — 수어지구 · 수어 학습 앱
비율: 둥근 돔 (2.0 / 1.8 / 2.0) · 포인트 색: 하늘색

```
a soft rounded dome cottage with smooth curved white plaster walls, a stylized
open hand shape sculpted as a decorative relief on the dome, gentle circular
windows, teal roof trim, a rounded wooden signboard above the door reading
"수어지구", light sky blue accents, calm and welcoming shape
```
> 영문 대체: `reading "Sign Village"`

### 4. `aclub.glb` — ACLUB · 동아리 플랫폼
비율: 단정한 중형 (1.8 / 1.6 / 1.8) · 포인트 색: 보라

```
a neat two-story fantasy guild hall with clean simple walls, symmetrical
shuttered windows, a small balcony and a purple pennant flag on the roof,
tidy minimal ornamentation, a rectangular plaque sign above the entrance
reading "ACLUB" in crisp letters, soft lavender purple accents, orderly
compact shape
```

### 5. `ajou-adventure.glb` — 아주분투 · 2D 러닝 게임
비율: 아케이드형 (1.9 / 1.7 / 1.9) · 포인트 색: 연두

```
a playful fantasy arcade hut with a rounded barrel roof, a big circular
porthole window, coin slot and joystick shaped decorations on the facade, a
striped awning, a glowing marquee sign board above the entrance reading
"아주분투", bright lime green accents, cheerful chunky shape
```
> 영문 대체: `reading "AJOU RUN"`

### 6. `ajouchong.glb` — 아주총학 · 총학생회 웹사이트
비율: 작고 낮음 (1.8 / 1.4 / 1.8) · 포인트 색: 주홍

```
a small fantasy town hall with a triangular gabled roof, a tall flagpole
flying an orange banner, wide welcoming front steps and double doors, modest
civic building, a horizontal wooden sign above the doors reading "아주총학",
warm orange red accents, compact and low
```
> 영문 대체: `reading "AJOU COUNCIL"`

### 7. `muscleup.glb` — 근근 MuscleUp · 피트니스 플랫폼
비율: 세로로 높음 (1.8 / **2.2** / 1.8) · 포인트 색: 핑크

```
a tall fantasy training tower gymnasium with stacked stone floors, oversized
dumbbell and kettlebell sculptures decorating the facade, a rope climbing
frame on one side, a bold signboard mounted above the entrance reading
"MuscleUp", warm pink and coral accents, taller than wide
```

### 8. `darklab.glb` — DarkLab · 3D 공포 게임
비율: 중형 (1.9 / 1.8 / 1.9) · 포인트 색: 어두운 적갈

```
a slightly creepy abandoned alchemy laboratory in a fairytale village, a
crooked leaning chimney with faint smoke, moss and ivy creeping over dark
timber walls, softly glowing green bubbling flasks visible in the windows, a
boarded-up door, a weathered crooked hanging sign reading "DarkLab", dark rust
red accents, still cute and stylized, not scary or gory
```

### 9. `tserof.glb` — TSEROF · 3D 플랫포머
비율: 작고 둥금 (1.7 / 1.5 / 1.7) · 포인트 색: 숲 초록

```
a cozy forest treehouse cabin built around a thick tree trunk, mossy shingled
roof, a wooden ladder and small platform, leafy branches and mushrooms at the
base, a hand-carved plank sign nailed to the trunk reading "TSEROF", forest
green accents, small and rounded
```

---

## 2) 스킬 구역 (5개) — 마을 북쪽

> `frontend.glb` / `backend.glb`는 기존 파일이 있으나, 판타지 톤이 아니면 아래로 재제작.

### 10. `frontend.glb` — Frontend
비율: 넓고 낮음 (2.6 / 1.6 / 2.2) · 포인트 색: 시안

```
a bright fantasy artisan workshop with large multi-pane display windows
showing colorful painted panels, a striped awning over the storefront, easel
and paint palette decorations beside the door, a painted shop sign above the
window reading "Frontend", cheerful cyan blue accents, wide and welcoming
```

### 11. `backend.glb` — Backend
비율: 세로로 높음 (1.8 / **2.6** / 1.8) · 포인트 색: 앰버

```
a sturdy fantasy stone engine house with copper pipes and cogwheels on the
exterior, a small waterwheel on one side, riveted metal plates, a cast iron
sign bolted above the heavy door reading "Backend", warm amber golden accents,
solid and tall
```

### 12. `3d.glb` — 3D / Motion
비율: 돔형 (2.3 / 2.2 / 2.3) · 포인트 색: 바이올렛

```
a fantasy astronomer observatory with a large rounded copper dome and an open
slit revealing a brass telescope, floating geometric crystal shapes orbiting
above it, a spiral outer staircase, an engraved arch sign over the entrance
reading "3D Lab", violet purple accents
```

### 13. `game.glb` — Game / XR
비율: 아케이드형 (2.1 / 1.9 / 2.1) · 포인트 색: 오렌지

```
a fantasy arcade game house with a rounded marquee canopy over the entrance,
oversized game controller and dice sculptures on the roof, round bulb lights
framing the facade, a big glowing marquee sign reading "GAME XR", bright
orange accents, chunky and fun
```

### 14. `workflow.glb` — Workflow
비율: 낮고 넓음 (1.8 / 1.4 / 1.6) · 포인트 색: 앰버

```
a low practical fantasy workshop shed built from stacked wooden crates and
timber-framed containers, toolboxes and gear-shaped decorations, a small
conveyor ramp at the side, a stenciled sign board on the front wall reading
"Workflow", warm amber accents, low and wide
```

---

## 3) 경력 구역 (3개) — 마을 남동쪽

### 15. `exp-unity-ui.glb` — 2025 Unity UI
비율: 작고 낮음 (1.7 / 1.3 / 1.5) · 포인트 색: 바이올렛

```
a small cozy fantasy townhouse workshop with framed picture panels and window
mockups displayed on the exterior wall, a drafting board on the porch, a neat
plaque above the door reading "Unity UI 2025", violet purple accents, small
and low
```

### 16. `exp-demo-platform.glb` — 2025 Demo Platform
비율: 중형 2층 (1.9 / 1.6 / 1.7) · 포인트 색: 시안

```
a medium fantasy townhouse with a small presentation stage balcony on the
front, a rolled banner and pointer stand, tidy shuttered windows, a horizontal
sign above the balcony reading "Demo Platform", cyan blue accents, modest
two-story shape
```

### 17. `exp-portfolio.glb` — 2026 AI Portfolio
비율: 중대형 (2.1 / 2.0 / 1.9) · 포인트 색: 민트

```
a charming fantasy house that carries a tiny miniature village diorama on its
open rooftop terrace, tiny model houses and trees on top, warmly glowing
windows, a carved sign above the entrance reading "AI Portfolio", mint green
accents, whimsical village-within-a-village concept
```

---

## 4) Life 구역 (6개) — 마을 동쪽

### 18. `life-values.glb` — 가치관 비석
비율: 작은 정육면체감 (1.3 / 1.3 / 1.3) · 포인트 색: 앰버
**건물 아님 — 모뉴먼트**

```
a standing stone monument obelisk in a fairytale village, weathered carved
rock with a smooth engraved front plaque reading "VALUES", a small stone base
with grass and flowers around it, a lantern on a post beside it, warm amber
accents, this is a monument NOT a building, no roof, no windows, no door,
compact standing stone
```

### 19. `life-gym.glb` — 헬스장
비율: 넓고 낮음 (2.2 / 1.5 / 2.2) · 포인트 색: 레드

```
a wide low fantasy training hall with a long rounded roof, an open arched
entrance, stone weights and coiled ropes outside, a sand training ground at
the front, a bold banner sign over the arch reading "GYM", warm red accents,
wide and short
```

### 20. `life-invest.glb` — 투자 타워
비율: 얇고 높음 (1.8 / **2.8** / 1.8) · 포인트 색: 에메랄드

```
a tall slender fantasy treasury tower with stacked ledger and coin motifs, a
golden balance scale sculpture at the very top, small barred windows, ivy
climbing the base, an engraved stone sign above the door reading "INVEST",
emerald green accents, clearly tall and narrow
```

### 21. `life-library.glb` — 도서관
비율: 넓고 둥금 (2.2 / 1.8 / 2.2) · 포인트 색: 샌드

```
a rounded fantasy library with a domed reading room, tall arched windows
glowing warm from inside, stacked book sculptures flanking the entrance, ivy
covered stone walls, a classic carved sign above the doors reading "LIBRARY",
sandy beige accents, wide and rounded
```

### 22. `life-music.glb` — 음악 스튜디오
비율: 돔형 (2.0 / 1.9 / 2.0) · 포인트 색: 라벤더

```
a rounded fantasy music pavilion with a smooth bell-shaped dome roof, horn and
harp sculptures on the exterior, floating musical note ornaments, a curved
sign board above the entrance reading "MUSIC", soft lavender accents, rounded
and gentle
```

### 23. `life-timeline.glb` — 연혁 타임라인
비율: 가장 얇고 높음 (1.6 / **3.0** / 1.6) · 포인트 색: 하늘색

```
a very tall thin fantasy lighthouse clocktower with stacked ring bands marking
years along its height, a glowing lantern room at the very top, a spiral
staircase wrapping around the exterior, a vertical hanging sign near the base
reading "TIMELINE", light sky blue accents, extremely tall and narrow
```

---

## 5) 학습 구역 (2개) — 마을 남쪽

### 24. `study-codingtest.glb` — 알고리즘 도장
비율: 세로로 높음 (1.9 / **2.4** / 1.9) · 포인트 색: 스카이

```
a tall fantasy martial arts dojo tower with a tiered pagoda roof and upturned
eaves, wooden training posts and a practice dummy at the entrance, paper
lanterns hanging along the roof edges, a vertical hanging wooden sign beside
the door reading "알고리즘 도장", sky blue accents, taller than wide
```
> 영문 대체: `reading "ALGO DOJO"`

### 25. `study-cs.glb` — 지식 서고
비율: 둥근 중형 (2.0 / 1.9 / 2.0) · 포인트 색: 퍼플

```
a rounded fantasy archive vault with a domed roof, scroll racks and stacked
tomes visible through arched windows, a stone reading pedestal outside, carved
knowledge runes on the walls, an engraved arch sign over the entrance reading
"지식 서고", purple accents, rounded and solid
```
> 영문 대체: `reading "CS ARCHIVE"`

---

## 6) 단독 오브젝트 (2개)

### 26. `post-office.glb` — 연락 우체국
비율: 아담함 (2.1 / 1.5 / 1.9) · 포인트 색: 오렌지

```
a charming fantasy village post office with a bright red tiled roof, a round
mailbox and letter slot beside the door, envelope and carrier-bird motifs on
the facade, a small chimney, a painted sign above the entrance reading
"연락 우체국", warm orange accents, cozy and welcoming
```
> 영문 대체: `reading "POST OFFICE"`

### 27. `central-plaza.glb` — 중앙 광장
비율: 극단적으로 납작하고 넓음 (2.6 / **0.4** / 2.6) · 포인트 색: 청록
**건물 아님 — 바닥 플랫폼**

```
a circular fantasy village plaza ground platform, radial cobblestone paving,
a small central stone fountain, a wooden signpost with directional arrow
boards reading "START", flower beds and low benches around the rim, warm teal
accents, this is a flat ground piece NOT a building, no walls, no roof,
extremely flat and wide open
```

---

## 마을 톤 정합성 (코드 측 후속 작업)

건물이 판타지 톤으로 바뀌면 씬 자체도 같이 맞춰야 합니다. 모델 입고 후 제가 처리할 항목:

- `VillageScene.tsx`의 시간대 프리셋을 **"노을" 고정**으로 (sky `#e09a64`, sun `#ff945a` — 이미 존재)
- 씬에 박힌 네온 포인트 라이트(시안 `#00d4ff`, 퍼플 `#aa44ff`) 제거 또는 따뜻한 톤으로 교체
- `metalness: 0.9` 금속 재질 → 무광 페인트 재질로
- `constants.ts`의 다크 네온 베이스 컬러(`color`, `roofColor`) 정리 — GLB 사용 시 미사용이지만 폴백 경로에 남아 있음
- 건물별 간판 글자 오프셋 조정 (모델마다 간판 위치가 달라 개별 보정 필요)
