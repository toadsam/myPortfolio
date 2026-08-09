# 건물 에셋 제작 프롬프트 (27개) — 이미지 생성 → Meshy Image-to-3D

3D 마을의 모든 건물을 **동화풍 판타지 미니어처** 톤으로 통일해 재제작하기 위한 프롬프트 모음.

## 워크플로우

```
① 이미지 생성 AI (GPT-4o / nano banana(Gemini) / Midjourney 등)
   → 아래 프롬프트로 건물 컨셉 이미지 1장 생성
② Meshy → Image to 3D 에 그 이미지 업로드
③ GLB 다운로드 → public/models/buildings/raw/<파일명>   ← raw 에 넣습니다
④ npm run optimize                                    → public/models/buildings/<파일명>
⑤ 브라우저 새로고침 — 끝
```

**파일명이 곧 연결입니다.** 파일명을 건물 id와 똑같이 지으면
(`skill-3d.glb` → 건물 `skill-3d`) `npm run optimize` 끝에
`scripts/generate-building-manifest.mjs`가 자동으로 돌아
`src/data/buildingModels.json`에 물려 줍니다. 코드는 한 줄도 안 고쳐도 됩니다.
아래 프롬프트 제목의 파일명이 이미 그 id입니다 — 그대로 쓰세요.

id와 안 맞는 파일이 있으면 optimize 로그가 이렇게 알려줍니다:

```
! 건물 id와 이름이 안 맞아 안 붙은 파일 1개: 3d.glb
  파일명을 건물 id와 똑같이 바꾸세요 (예: 3d.glb → skill-3d.glb)
```

`raw/`는 원본 보관소이고, 마을이 실제로 읽는 건 최적화된 쪽입니다. 원본을 남겨두는 이유는
예산 규격이 바뀌었을 때 `npm run optimize -- --force`로 다시 구울 수 있어야 하기 때문입니다.
(`raw/`는 `.gitignore`에 있어 커밋되지 않습니다 — 장당 20~40MB라 리포가 감당 못 합니다.)

## 지금 상태 (2026-08-09 저녁)

27채 중 **17채 완료**. 남은 10채:

```
central-plaza            ← 가장 급함. 지금 파란 네온 홀로그램 탑이라 화면에서 혼자 튄다
post-office              연락 우체국
study-codingtest         알고리즘 도장
study-cs                 지식 서고
project-sign-language    수어지구
project-ajou-adventure   아주분투
life-values              가치관 비석
life-invest              투자 타워
life-library             도서관
life-timeline            연혁 타임라인
```

남은 10채는 아직 `Building.tsx`가 절차적 상자로 그립니다 — 마을에서 유일하게
사이버펑크 톤으로 남은 부분입니다(metalness 0.55~0.9 + 네온 띠).

### 17채를 넣으면서 배운 것

- **간판은 프롬프트대로 크게 나왔고 한글도 멀쩡합니다.** 아주총학·수어지구 다 읽힙니다.
  GPT-4o/nano banana를 쓰면 한글 실패는 사실상 없습니다.
- **텍스처 예산이 삼각형보다 먼저 터집니다.** 17채를 넣자 318MB(예산 250)가 됐는데,
  범인은 건물이 아니라 파이프라인을 한 번도 안 탄 `environment/statue.glb` 였습니다
  — 2048 텍스처 4장으로 혼자 89MB. `environment/raw/`를 만들어 태우니 242MB로 내려갔습니다.
  **새 그룹을 추가할 땐 `raw/` 폴더를 꼭 만드세요.** 없으면 optimize가 조용히 건너뜁니다.
- **건물도 simplify가 먹습니다** — 오차 0.012에서 평균 40%. 간판 글자는 그대로입니다.

---

## 간판 규칙 ★

이 마을의 건물은 **간판으로 자기가 뭔지 말해야** 합니다. 멀리서 봐도
"저기가 프론트엔드구나"가 읽혀야 하고, 그러려면 간판이 **커야** 합니다.

### 1) 간판은 크게

작게 그려진 간판은 Meshy가 텍스처로 구우면서 반드시 뭉갭니다. 건물 텍스처 예산이
`baseColor 1024`인데 그건 **건물 전체의 UV 아틀라스**라, 작은 간판에는 실제로
100~200px밖에 안 배정됩니다. 그래서 이미지 단계에서부터 크게 그려야 합니다.

각 프롬프트에 이 문구가 들어 있습니다 — **절대 줄이지 마세요**:

```
a very large prominent signboard spanning most of the building's front width,
reading "..." in big bold high-contrast letters, the sign is a dominant
feature of the facade and clearly legible
```

### 2) 글자는 이름 그대로 — 한글 이름은 한글로

간판 문구는 `constants.ts`의 건물 `name`과 같습니다. 한글 이름이면 한글로,
영문 이름이면 영문으로 씁니다.

> **한글은 이미지 생성 도구를 가려서 씁니다.** Midjourney와 DALL-E는 한글을 거의
> 못 씁니다. **GPT-4o 이미지 생성이나 nano banana(Gemini)를 쓰세요** — 한글이
> 제대로 나옵니다. 한글 간판 건물에는 만약을 위해 `영문 대체` 줄을 같이 적어 뒀습니다.

### 3) 글자가 뭉개져도 괜찮습니다 (보험이 있음)

건물 위에는 **코드로 그리는 나무 간판이 따로 떠 있습니다**
(`Building.tsx`의 `BuildingLabel`). 벡터라 절대 안 뭉개지고, 기술 로고 배지까지
붙습니다. 그러니 GLB 간판 글자는 "있으면 훨씬 좋은 것"이지 "실패하면 끝"이 아닙니다.
읽히는 수준으로만 나오면 충분합니다.

### 4) 기술 건물은 형태로도 말합니다

로고를 이미지 AI에 정확히 그리게 하는 건 도박입니다(React 원자 궤도, Unity 큐브의
세 면…). 그래서 **형태 자체가 그 기술을 연상시키도록** 지시합니다. 로고가 잘 나오면
보너스고, 안 나와도 건물 실루엣이 이미 말을 합니다. 로고 배지는 코드 간판이 책임집니다.

---

## 이미지 생성 공통 프리픽스 (모든 건물에 앞에 붙임)

```
3D rendered miniature fairytale village building, stylized low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures, warm golden-hour
sunset lighting with soft ambient shadows, cozy storybook mood,
front three-quarter view at eye level, entire building fully visible and
centered in frame, the signboard faces the viewer and is fully readable,
plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
```

### 구도가 가장 중요합니다

Meshy Image-to-3D의 품질은 **이미지 구도**가 8할입니다. 위 프리픽스에 들어간 지시를 절대 빼지 마세요.

| 지시 | 이유 |
|---|---|
| `front three-quarter view` | 정면+측면이 동시에 보여야 Meshy가 깊이를 추정함. 완전 정면은 납작하게, 탑뷰는 실루엣이 뭉개짐 |
| `signboard faces the viewer` | 간판이 비스듬하면 글자가 원근에 눌려 텍스처에서 읽히지 않음 |
| `entire building fully visible, centered` | 잘리면 그 부분이 통째로 소실됨 |
| `plain flat light grey background` | 배경이 복잡하면 배경까지 메시로 만들어버림 |
| `isolated single object` | 여러 건물이 있으면 하나로 뭉침 |
| `no cast shadow` | 바닥 그림자를 지오메트리로 오해함 |

## 공통 네거티브 프롬프트

```
photorealistic, realistic, cluttered background, scenery, landscape, multiple
buildings, people, characters, cropped, cut off, top-down view, aerial view,
extreme perspective, fisheye, harsh shadows, neon cyberpunk, dark gloomy,
glass skyscraper, modern corporate, blurry, motion blur,
tiny sign, small text, illegible text, unreadable letters, blank signboard
```

## Meshy Image-to-3D 설정

- Art Style: `Stylized`
- Topology: `Quad` / Polycount: `Low ~ Medium`
- Texture: `On` (간판 글자가 텍스처로 구워져야 함)
- Symmetry: `Auto` (비대칭 건물은 `Off`)

## 제작 규격

- 포맷 **.glb**, Y-up
- **크기와 원점은 안 맞춰도 됩니다.** `Building.tsx`의 `GlbModel`이 바운딩 박스를 실측해
  **앞마당 원반 안에 딱 맞도록** 배율을 잡고, 바닥(min.y)을 y=0으로 끌어올립니다.
  구체적으로는 바닥면 대각선을 원반 지름(`max(w,d) + 1.1`)에 맞추고,
  높이는 선언값의 1.25배로 묶습니다.
- **비율은 맞춰 주세요.** 바닥면 대각선으로 맞추므로, 원본이 가로로 퍼져 있으면
  그만큼 낮아집니다. 각 항목의 "비율" 줄을 지키면 의도한 높이로 나옵니다.
  (Meshy는 **가장 긴 변**을 1.9로 정규화해서 내보냅니다. 그래서 납작하게 그린 건물은
  높이 값이 작게 나오고, 예전에 높이로만 배율을 잡던 시절엔 그런 건물이 가로로
  터져서 헬스장이 앞마당의 187%가 됐습니다. 지금은 안 그렇지만, 비율을 지켜야
  의도한 크기가 나오는 건 여전합니다.)
- `public/models/buildings/raw/<건물id>.glb` 저장 → `npm run optimize` → 끝
- Meshy 원본을 그대로 쓰면 안 됩니다. 건물 하나가 텍스처만 **22~90MB VRAM**을 먹어서 27개면 GPU가 죽습니다

### `npm run optimize` 가 하는 일

```
npm run optimize              모든 그룹
npm run optimize -- buildings 건물만
npm run optimize -- --force   이미 최신인 것도 다시 굽기
```

1. **아무 일도 안 하는 맵 삭제** — Meshy는 발광 부위가 없어도 emissive 맵을 붙여서 내보냅니다.
   완전 검정이면 지우고 `emissiveFactor: 0`으로 대체합니다. 균일한 metallicRoughness도
   스칼라 값으로 바꿔 지웁니다. (실측: aclub은 이것만으로 85MB 절감)
2. **예산 해상도로 축소** — 건물은 baseColor 1024 / normal·roughness 512.
   장식물은 그 절반. 예산은 `scripts/optimize_textures.py`의 `BUDGETS`에 있습니다.
3. **Draco 지오메트리 압축** + 고아 리소스 정리

건물 하나가 **VRAM 8~10MB, 파일 0.5~0.8MB**로 나오면 정상입니다.
결과는 마을에서 **F8 계기판**으로 확인하세요.

---

## 1) 프로젝트 구역 (9개) — 마을 서쪽

### 1. `project-mystock.glb` — MyStock-Desk · 금융/AI 대시보드
비율: 세로로 높음 (1.9 / **2.6** / 1.9) · 포인트 색: 청록

```
a tall narrow fantasy village bank tower with a round clock face and a glowing
teal crystal orb on top, stacked coin motifs and small arched windows, copper
roof with verdigris patina, a very large prominent carved wooden signboard
spanning most of the building's front width above the arched entrance,
reading "MyStock-Desk" in big bold high-contrast letters, the sign is a dominant
feature of the facade and clearly legible, teal and aqua accents,
notably taller than it is wide
```

### 2. `project-festflow.glb` — FestFlow · 대학 축제 운영
비율: 낮고 넓음 (2.2 / 1.5 / 2.2) · 포인트 색: 노랑

```
a wide low festival market stall pavilion with a striped red and cream canvas
canopy, colorful triangular bunting flags, hanging round paper lanterns and
warm string lights, wooden stall counters at the front, a very large prominent
banner sign spanning the full width across the top, reading "FestFlow" in big
bold high-contrast cheerful letters, the sign is a dominant feature of the
facade and clearly legible, golden yellow accents, clearly wider than tall
```

### 3. `project-sign-language.glb` — 수어지구 · 수어 학습 앱
비율: 둥근 돔 (2.0 / 1.8 / 2.0) · 포인트 색: 하늘색

```
a soft rounded dome cottage with smooth curved white plaster walls, a stylized
open hand shape sculpted as a large decorative relief on the dome, gentle
circular windows, teal roof trim, a very large prominent rounded wooden
signboard spanning most of the front width above the door, reading "수어지구"
in big bold high-contrast Korean letters, the sign is a dominant feature of
the facade and clearly legible, light sky blue accents, calm welcoming shape
```
> 영문 대체: `reading "Sign Village"`

### 4. `project-aclub.glb` — ACLUB · 동아리 플랫폼
비율: 단정한 중형 (1.8 / 1.6 / 1.8) · 포인트 색: 보라

```
a neat two-story fantasy guild hall with clean simple walls, symmetrical
shuttered windows, a small balcony and a purple pennant flag on the roof,
tidy minimal ornamentation, a very large prominent rectangular plaque sign
spanning most of the front width above the entrance, reading "ACLUB" in big
bold high-contrast crisp letters, the sign is a dominant feature of the
facade and clearly legible, soft lavender purple accents, orderly compact shape
```

### 5. `project-ajou-adventure.glb` — 아주분투 · 2D 러닝 게임
비율: 아케이드형 (1.9 / 1.7 / 1.9) · 포인트 색: 연두

```
a playful fantasy arcade hut with a rounded barrel roof, a big circular
porthole window, coin slot and joystick shaped decorations on the facade, a
striped awning, a very large prominent glowing marquee sign board spanning
the full front width above the entrance, reading "아주분투" in big bold
high-contrast Korean letters, the sign is a dominant feature of the facade
and clearly legible, bright lime green accents, cheerful chunky shape
```
> 영문 대체: `reading "AJOU RUN"`

### 6. `project-ajouchong.glb` — 아주총학 · 총학생회 웹사이트
비율: 작고 낮음 (1.8 / 1.4 / 1.8) · 포인트 색: 주홍

```
a small fantasy town hall with a triangular gabled roof, a tall flagpole
flying an orange banner, wide welcoming front steps and double doors, modest
civic building, a very large prominent horizontal wooden sign spanning the
full width above the doors, reading "아주총학" in big bold high-contrast
Korean letters, the sign is a dominant feature of the facade and clearly
legible, warm orange red accents, compact and low
```
> 영문 대체: `reading "AJOU COUNCIL"`

### 7. `project-muscleup.glb` — 근근 MuscleUp · 피트니스 플랫폼
비율: 세로로 높음 (1.8 / **2.2** / 1.8) · 포인트 색: 핑크

```
a tall fantasy training tower gymnasium with stacked stone floors, oversized
dumbbell and kettlebell sculptures decorating the facade, a rope climbing
frame on one side, a very large prominent signboard spanning most of the front
width mounted above the entrance, reading "근근 MuscleUp" in big bold
high-contrast letters, the sign is a dominant feature of the facade and
clearly legible, warm pink and coral accents, taller than wide
```
> 영문 대체: `reading "MuscleUp"` (한글·영문 혼용이 깨지면 영문만)

### 8. `project-darklab.glb` — DarkLab · 3D 공포 게임
비율: 중형 (1.9 / 1.8 / 1.9) · 포인트 색: 어두운 적갈

```
a slightly creepy abandoned alchemy laboratory in a fairytale village, a
crooked leaning chimney with faint smoke, moss and ivy creeping over dark
timber walls, softly glowing green bubbling flasks visible in the windows, a
boarded-up door, a very large prominent weathered hanging sign spanning most
of the front width, reading "DarkLab" in big bold high-contrast letters,
the sign is a dominant feature of the facade and clearly legible, dark rust
red accents, still cute and stylized, not scary or gory
```

### 9. `project-tserof.glb` — TSEROF · 3D 플랫포머
비율: 작고 둥금 (1.7 / 1.5 / 1.7) · 포인트 색: 숲 초록

```
a cozy forest treehouse cabin built around a thick tree trunk, mossy shingled
roof, a wooden ladder and small platform, leafy branches and mushrooms at the
base, a very large prominent hand-carved plank sign nailed across the trunk,
reading "TSEROF" in big bold high-contrast letters, the sign is a dominant
feature of the facade and clearly legible, forest green accents,
small and rounded
```

---

## 2) 스킬 구역 (5개) — 마을 북쪽

> 여기 다섯 채는 **형태 자체가 기술을 말하게** 설계했습니다.
> 로고가 이미지에 예쁘게 나오면 보너스이고, 안 나와도 실루엣이 이미 구분됩니다.
> 코드 간판에는 React · Spring Boot · Three.js · Unity · GitHub 배지가 이미 붙습니다.

### 10. `skill-frontend.glb` — Frontend
비율: 넓고 낮음 (2.6 / 1.6 / 2.2) · 포인트 색: 시안
**형태 컨셉**: React 원자 — 궤도 고리가 지붕을 감싼다

```
a bright fantasy artisan workshop with large multi-pane display windows
showing colorful painted UI panels, a striped awning over the storefront,
three glowing thin elliptical rings tilted at different angles orbiting around
a small glowing sphere mounted above the roof like an atom, easel and paint
palette decorations beside the door, a very large prominent painted shop sign
spanning the full storefront width above the windows, reading "Frontend" in
big bold high-contrast letters, the sign is a dominant feature of the facade
and clearly legible, cheerful cyan blue accents, wide and welcoming
```

### 11. `skill-backend.glb` — Backend
비율: 세로로 높음 (1.8 / **2.6** / 1.8) · 포인트 색: 앰버
**형태 컨셉**: 서버랙 — 층층이 쌓인 기계실 탑

```
a sturdy tall fantasy stone engine house built like a stack of identical
machine floors piled up like a server rack, each floor lined with small
glowing indicator lights in rows, copper pipes and cogwheels running up the
exterior, a small waterwheel on one side, riveted metal plates, a very large
prominent cast iron sign bolted across the full width above the heavy door,
reading "Backend" in big bold high-contrast letters, the sign is a dominant
feature of the facade and clearly legible, warm amber golden accents,
solid and tall
```

### 12. `skill-3d.glb` — 3D / Motion
비율: 돔형 (2.3 / 2.2 / 2.3) · 포인트 색: 바이올렛
**형태 컨셉**: 와이어프레임 다면체가 지붕을 뚫고 솟음

```
a fantasy astronomer observatory with a large rounded copper dome and an open
slit revealing a brass telescope, a big glowing wireframe polyhedron made of
thin glowing edges and visible vertices floating and rotating above the dome,
smaller geometric crystal shapes orbiting around it, a spiral outer staircase,
a very large prominent engraved arch sign spanning the full width over the
entrance, reading "3D Motion" in big bold high-contrast letters, the sign is
a dominant feature of the facade and clearly legible, violet purple accents
```
> 이름은 `3D / Motion` 이지만 간판에서는 슬래시를 뺐습니다 — 이미지 생성 AI가
> 문장부호를 자주 엉뚱한 기호로 바꿉니다. 코드 간판에는 `3D / Motion` 그대로 뜹니다.

### 13. `skill-game.glb` — Game / XR
비율: 아케이드형 (2.1 / 1.9 / 2.1) · 포인트 색: 오렌지
**형태 컨셉**: 유니티 큐브 — 세 개의 각진 면이 맞물린 덩어리

```
a fantasy arcade game house whose main body is shaped like a chunky cube made
of three interlocking angular faces meeting at one corner, a rounded marquee
canopy over the entrance, oversized game controller and dice sculptures on the
roof, round bulb lights framing the facade, a very large prominent glowing
marquee sign spanning the full width, reading "Game XR" in big bold
high-contrast letters, the sign is a dominant feature of the facade and
clearly legible, bright orange accents, chunky and fun
```
> 이름은 `Game / XR` 이지만 간판에서는 슬래시를 뺐습니다 (위 3D 항목과 같은 이유).

### 14. `skill-workflow.glb` — Workflow
비율: 낮고 넓음 (1.8 / 1.4 / 1.6) · 포인트 색: 앰버
**형태 컨셉**: 나뭇가지처럼 갈라지는 브랜치 + 노트 블록

```
a low practical fantasy workshop shed built from stacked wooden crates and
timber-framed containers, a decorative branching tree diagram sculpted on the
side wall where a line splits into two and merges back like a git branch with
round nodes at each junction, a stack of clean white notebook blocks beside
the door, toolboxes and gear-shaped decorations, a very large prominent
stenciled sign board spanning the full front wall, reading "Workflow" in big
bold high-contrast letters, the sign is a dominant feature of the facade and
clearly legible, warm amber accents, low and wide
```

---

## 3) 경력 구역 (3개) — 마을 남동쪽

### 15. `exp-unity-ui.glb` — 2025 Unity UI
비율: 작고 낮음 (1.7 / 1.3 / 1.5) · 포인트 색: 바이올렛
**형태 컨셉**: 지붕 위에 각진 큐브 장식

```
a small cozy fantasy townhouse workshop with framed picture panels and window
mockups displayed on the exterior wall, a small chunky cube ornament made of
three interlocking angular faces sitting on the roof ridge, a drafting board
on the porch, a very large prominent plaque spanning the full width above the
door, reading "2025 Unity UI" in big bold high-contrast letters, the sign is
a dominant feature of the facade and clearly legible, violet purple accents,
small and low
```

### 16. `exp-demo-platform.glb` — 2025 Demo Platform
비율: 중형 2층 (1.9 / 1.6 / 1.7) · 포인트 색: 시안

```
a medium fantasy townhouse with a small presentation stage balcony on the
front, a rolled banner and pointer stand, tidy shuttered windows, a very large
prominent horizontal sign spanning the full width above the balcony, reading
"2025 Demo Platform" in big bold high-contrast letters, the sign is a dominant
feature of the facade and clearly legible, cyan blue accents,
modest two-story shape
```

### 17. `exp-portfolio.glb` — 2026 AI Portfolio
비율: 중대형 (2.1 / 2.0 / 1.9) · 포인트 색: 민트

```
a charming fantasy house that carries a tiny miniature village diorama on its
open rooftop terrace, tiny model houses and trees on top, warmly glowing
windows, a very large prominent carved sign spanning the full width above the
entrance, reading "2026 AI Portfolio" in big bold high-contrast letters, the
sign is a dominant feature of the facade and clearly legible, mint green
accents, whimsical village-within-a-village concept
```

---

## 4) Life 구역 (6개) — 마을 동쪽

### 18. `life-values.glb` — 가치관 비석
비율: 작은 정육면체감 (1.3 / 1.3 / 1.3) · 포인트 색: 앰버
**건물 아님 — 모뉴먼트**

```
a standing stone monument obelisk in a fairytale village, weathered carved
rock with a very large smooth engraved front plaque covering most of the
stone's face, reading "가치관" in big bold high-contrast Korean letters,
clearly legible, a small stone base with grass and flowers around it, a
lantern on a post beside it, warm amber accents, this is a monument NOT a
building, no roof, no windows, no door, compact standing stone
```
> 영문 대체: `reading "VALUES"`
> 이름은 `가치관 비석` 이지만 비석에 "비석"이라고 새기면 어색해서 `가치관` 만
> 새깁니다. 전체 이름은 코드 간판이 보여 줍니다.

### 19. `life-gym.glb` — 헬스장
비율: 넓고 낮음 (2.2 / 1.5 / 2.2) · 포인트 색: 레드

```
a wide low fantasy training hall with a long rounded roof, an open arched
entrance, stone weights and coiled ropes outside, a sand training ground at
the front, a very large prominent banner sign spanning the full width over the
arch, reading "헬스장" in big bold high-contrast Korean letters, the sign is a
dominant feature of the facade and clearly legible, warm red accents,
wide and short
```
> 영문 대체: `reading "GYM"`

### 20. `life-invest.glb` — 투자 타워
비율: 얇고 높음 (1.8 / **2.8** / 1.8) · 포인트 색: 에메랄드

```
a tall slender fantasy treasury tower with stacked ledger and coin motifs, a
golden balance scale sculpture at the very top, small barred windows, ivy
climbing the base, a very large prominent engraved stone sign spanning the
full width above the door, reading "투자 타워" in big bold high-contrast
Korean letters, the sign is a dominant feature of the facade and clearly
legible, emerald green accents, clearly tall and narrow
```
> 영문 대체: `reading "INVEST"`

### 21. `life-library.glb` — 도서관
비율: 넓고 둥금 (2.2 / 1.8 / 2.2) · 포인트 색: 샌드

```
a rounded fantasy library with a domed reading room, tall arched windows
glowing warm from inside, stacked book sculptures flanking the entrance, ivy
covered stone walls, a very large prominent classic carved sign spanning the
full width above the doors, reading "도서관" in big bold high-contrast Korean
letters, the sign is a dominant feature of the facade and clearly legible,
sandy beige accents, wide and rounded
```
> 영문 대체: `reading "LIBRARY"`

### 22. `life-music.glb` — 음악 스튜디오
비율: 돔형 (2.0 / 1.9 / 2.0) · 포인트 색: 라벤더

```
a rounded fantasy music pavilion with a smooth bell-shaped dome roof, horn and
harp sculptures on the exterior, floating musical note ornaments, a very large
prominent curved sign board spanning the full width above the entrance,
reading "음악 스튜디오" in big bold high-contrast Korean letters, the sign is a
dominant feature of the facade and clearly legible, soft lavender accents,
rounded and gentle
```
> 영문 대체: `reading "MUSIC"`

### 23. `life-timeline.glb` — 연혁 타임라인
비율: 가장 얇고 높음 (1.6 / **3.0** / 1.6) · 포인트 색: 하늘색

```
a very tall thin fantasy lighthouse clocktower with stacked ring bands marking
years along its height, a glowing lantern room at the very top, a spiral
staircase wrapping around the exterior, a very large prominent sign board
mounted across the full width near the base, reading "연혁 타임라인" in big
bold high-contrast Korean letters, the sign is a dominant feature and clearly
legible, light sky blue accents, extremely tall and narrow
```
> 영문 대체: `reading "TIMELINE"`
> 세로 간판은 글자가 뭉개지기 쉬워 **가로 간판**으로 바꿨습니다.

---

## 5) 학습 구역 (2개) — 마을 남쪽

### 24. `study-codingtest.glb` — 알고리즘 도장
비율: 세로로 높음 (1.9 / **2.4** / 1.9) · 포인트 색: 스카이

```
a tall fantasy martial arts dojo tower with a tiered pagoda roof and upturned
eaves, wooden training posts and a practice dummy at the entrance, paper
lanterns hanging along the roof edges, a very large prominent horizontal
wooden sign spanning the full width above the door, reading "알고리즘 도장" in
big bold high-contrast Korean letters, the sign is a dominant feature of the
facade and clearly legible, sky blue accents, taller than wide
```
> 영문 대체: `reading "ALGO DOJO"`
> 원래 세로 걸개였는데 글자가 뭉개져서 **가로 간판**으로 바꿨습니다.

### 25. `study-cs.glb` — 지식 서고
비율: 둥근 중형 (2.0 / 1.9 / 2.0) · 포인트 색: 퍼플

```
a rounded fantasy archive vault with a domed roof, scroll racks and stacked
tomes visible through arched windows, a stone reading pedestal outside, carved
knowledge runes on the walls, a very large prominent engraved sign spanning
the full width over the entrance arch, reading "지식 서고" in big bold
high-contrast Korean letters, the sign is a dominant feature of the facade
and clearly legible, purple accents, rounded and solid
```
> 영문 대체: `reading "CS ARCHIVE"`

---

## 6) 단독 오브젝트 (2개)

### 26. `post-office.glb` — 연락 우체국
비율: 아담함 (2.1 / 1.5 / 1.9) · 포인트 색: 오렌지

```
a charming fantasy village post office with a bright red tiled roof, a round
mailbox and letter slot beside the door, envelope and carrier-bird motifs on
the facade, a small chimney, a very large prominent painted sign spanning the
full width above the entrance, reading "연락 우체국" in big bold high-contrast
Korean letters, the sign is a dominant feature of the facade and clearly
legible, warm orange accents, cozy and welcoming
```
> 영문 대체: `reading "POST OFFICE"`

### 27. `central-plaza.glb` — 중앙 광장
비율: 극단적으로 납작하고 넓음 (2.6 / **0.4** / 2.6) · 포인트 색: 청록
**건물 아님 — 바닥 플랫폼**

```
a circular fantasy village plaza ground platform, radial cobblestone paving,
a small central stone fountain, a wooden signpost standing at the rim with a
very large directional arrow board, reading "중앙 광장" in big bold
high-contrast Korean letters, clearly legible, flower beds and low benches
around the rim, warm teal accents, this is a flat ground piece NOT a building,
no walls, no roof, extremely flat and wide open
```
> 영문 대체: `reading "CENTRAL PLAZA"`
> **가장 먼저 만드세요.** 지금 자리에 파란 네온 홀로그램 탑이 서 있는데,
> 화면 한복판에 가장 크게 잡혀서 이거 하나만 바꿔도 첫인상이 제일 크게 달라집니다.

---

## 마을 톤 정합성 (코드 측 후속 작업)

건물이 판타지 톤으로 바뀌면 씬 자체도 같이 맞춰야 합니다. 모델 입고 후 처리할 항목:

- `VillageScene.tsx`의 시간대 프리셋을 **"노을" 고정**으로 (sky `#e09a64`, sun `#ff945a` — 이미 존재)
- 씬에 박힌 네온 포인트 라이트(시안 `#00d4ff`, 퍼플 `#aa44ff`) 제거 또는 따뜻한 톤으로 교체
- `metalness: 0.9` 금속 재질 → 무광 페인트 재질로
- `constants.ts`의 다크 네온 베이스 컬러(`color`, `roofColor`) 정리 — GLB 사용 시 미사용이지만 폴백 경로에 남아 있음

> ~~건물별 간판 글자 오프셋 조정~~ — 필요 없어졌습니다. 간판 글자는 코드가 그리는
> `BuildingLabel`이 책임지고, 그건 건물 높이 위에 자동으로 뜹니다.
