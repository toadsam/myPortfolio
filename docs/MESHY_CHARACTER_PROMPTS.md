# 캐릭터 에셋 제작 프롬프트 (14종) — 이미지 생성 → Meshy Image-to-3D → Auto-Rig

3D 마을의 플레이어/NPC 캐릭터를 **동화풍 판타지 미니어처** 톤으로 통일해 재제작하기 위한 프롬프트 모음.
건물 프롬프트는 `MESHY_BUILDING_PROMPTS.md` 참고 — **구도 규칙이 정반대이므로 섞어 쓰지 마세요.**

## 먼저: 왜 캐릭터는 건물보다 까다로운가

현재 코드가 요구하는 것:

| 파일 | 요구 사항 |
|---|---|
| `src/components/village/WarriorCharacter.tsx` | `warrior-walk.glb` + `warrior-run.glb`, 클립 이름에 `walk` / `run` 포함, idle 상태 포함 |
| `src/components/village/NpcWarrior.tsx` | `neon-robot-npc.glb` 하나를 **모든 NPC가 공유**, `SkeletonUtils.clone`으로 복제, 클립 이름을 `walk`/`run`으로 정규화 |

즉 캐릭터는 **스킨드 메시 + 본(bone) 리깅 + 애니메이션 클립**이 있어야 합니다. 정적인 조각상은 쓸 수 없습니다.

### Meshy 파이프라인

```
① 이미지 생성 → 정면 A-포즈 전신 캐릭터 1장
② Meshy → Image to 3D
③ Meshy → Rigging (Auto-Rig)          ← 휴머노이드만 가능
④ Meshy → Animation 라이브러리에서 idle / walk / run 선택
⑤ 애니메이션별로 GLB export
```

### 리깅 성공을 위한 절대 규칙

이미지 단계에서 이걸 어기면 ③에서 반드시 실패합니다.

| 규칙 | 이유 |
|---|---|
| **정면(front view) 고정** | 3/4 뷰·측면은 오토리깅이 골격을 못 잡음. 건물과 정반대 |
| **A-포즈** (팔을 아래로 45도 벌림) | 팔이 몸통에 붙으면 팔뼈와 몸통이 하나로 융합됨 |
| **양다리를 어깨 너비로 벌림** | 다리가 붙으면 하나의 기둥으로 인식 |
| **전신, 머리부터 발끝까지** | 잘리면 그 부위 뼈가 생성 안 됨 |
| **휴머노이드 형태 유지** | 팔다리 2개씩, 머리 1개. 동물·4족·무정형은 오토리깅 불가 |
| **긴 망토·롱드레스·큰 무기 금지** | 스키닝이 깨지고 걷기 애니메이션에서 뚫림 |
| **대칭 유지** | 비대칭 실루엣은 골격 추정 실패율이 높음 |

## 이미지 생성 공통 프리픽스 (모든 캐릭터에 앞에 붙임)

```
3D rendered stylized fairytale village character, cute chibi proportions with a
large rounded head and small compact body, soft low-poly game asset,
hand-painted matte textures, warm golden-hour lighting, cozy storybook mood,
standing upright in a symmetrical A-pose, both arms lowered at about 45 degrees
and clearly separated from the torso with visible gaps, both legs apart at
shoulder width, facing directly forward straight at the camera,
full body visible from head to feet, centered in frame, plain flat light grey
studio background, isolated single character, no cast shadow,
```

## 공통 네거티브 프롬프트

```
arms crossed, arms tight against body, hands in pockets, action pose, dynamic
pose, running pose, sitting, crouching, leaning, three-quarter view, side view,
back view, turned body, cropped, cut off, close-up, portrait, bust shot,
multiple characters, group, photorealistic, realistic human, long flowing cape,
long dress, trailing robe, large weapon, staff, cluttered background, scenery,
harsh shadows, motion blur
```

## Meshy 설정

- Image to 3D → Art Style `Stylized`, Topology `Quad`, Polycount `Low ~ Medium`, Texture `On`, Symmetry `On`
- Rigging → Character type `Humanoid`
- Animation → `Idle`, `Walk`, `Run` 3종 선택 후 각각 GLB export

## 제작 규격

- 포맷 **.glb**, Y-up, 원점 = 발밑 중심
- 애니메이션 클립 이름에 `walk` / `run` 문자열 포함 (코드가 소문자 매칭 — `NpcWarrior.tsx:45`)
- `public/models/characters/` 저장
- 캐릭터는 스킨드 메시라 비용이 큽니다. **폴리곤은 최대한 낮게**, 텍스처 1024px 이하 권장
- 용량 크면 `npm run optimize`

---

## 캐릭터 구성 (총 14종)

마을에는 NPC가 **32명**(코어 6 + 건물별 자동 생성 26) 있지만, 32개를 다 만들 필요는 없습니다.
**이름과 성격이 확실한 8명은 개별 제작**, 나머지 24명은 **구역별 아키타입 5종을 공유**합니다.

| 그룹 | 개수 | 비고 |
|---|---|---|
| 개별 캐릭터 | 8 | 코어 NPC 6 + 학습 구역 전담 2 |
| 구역 아키타입 | 5 | 건물 안내원 24명이 공유 |
| 플레이어 | 1 | 현재 `warrior-walk/run.glb` |

---

# A. 개별 캐릭터 (8종)

### 1. `npc-jaehoon.glb` — 정재훈 · 마을 총괄 관리자 (본인 AI 분신)
색: 금색 `#f5c542` / 갈색 `#6b4f1d` · 성격: 활기차고 친절, 마을을 돌며 모두를 챙김

```
a cheerful young man character with a warm friendly smile and bright eyes,
wearing a golden yellow hooded jacket over a simple shirt, brown trousers and
sturdy boots, a small brown satchel bag at his hip, a tiny village-keeper badge
pinned on his chest, tousled dark hair, golden yellow and warm brown color
scheme, approachable and energetic
```

### 2. `npc-lumi.glb` — 루미 · 마을 총괄 안내원
색: 초록 `#7ecf68` / 노랑 `#f5d26b` · 성격: 밝고 침착한 길잡이

```
a bright cheerful guide character wearing a fresh green tunic with a short
yellow shoulder cape, a small rolled map tucked under one arm, a yellow beret
style cap, short neat hair, a little compass hanging at the belt, leaf green
and soft yellow color scheme, welcoming and calm expression
```

### 3. `npc-pixel.glb` — 픽셀 · 프로젝트 큐레이터
색: 주황 `#f3b35b` / 파랑 `#5f7be8` · 성격: 활발하고 관찰력 좋음

```
a lively curator character wearing a warm orange work apron over a blue shirt,
rolled up sleeves, a small blue picture frame held in one hand, paint brushes
tucked in the apron pocket, round glasses, bouncy short hair, warm orange and
cornflower blue color scheme, curious and energetic expression
```

### 4. `npc-theo.glb` — 테오 · 기술 멘토
색: 청록 `#68c7cf` / 진남색 `#253342` · 성격: 분석적이고 현실적

```
an analytical engineer character wearing a teal vest over a dark navy shirt, a
tool belt with small wrenches and gears, brass goggles resting on the forehead,
fingerless gloves, neat short hair, calm focused expression, teal and deep navy
color scheme, thoughtful and reliable
```

### 5. `npc-aka.glb` — 아카 · 성장 기록 관리자
색: 보라 `#c69af0` / 갈색 `#8b5a35` · 성격: 차분하고 기억력 좋음

```
a calm archivist character wearing a short lavender purple robe over a brown
tunic, a small open notebook held against the chest, a quill pen behind the
ear, round spectacles, tidy hair tied back, soft lavender and warm brown color
scheme, gentle attentive expression, robe kept short above the knees
```

### 6. `npc-post.glb` — 포스트 · 연락 담당
색: 살구 `#ef8f72` / 흰색 `#e8f2ff` · 성격: 간결하고 프로페셔널

```
a tidy postal worker character wearing a coral orange mail carrier uniform with
white trim, a white shoulder mail bag full of letters, a round postal cap, a
single envelope held in one hand, short neat hair, coral orange and off-white
color scheme, brisk professional friendly expression
```

### 7. `npc-algo.glb` — 알고 · 알고리즘 도장 코치
색: 스카이 `#5aa9e6` / 진남색 `#1f2a44` · 성격: 담백한 코치

```
a disciplined dojo coach character wearing a light blue martial arts training
uniform with a dark navy belt, sleeves rolled to the elbow, a small wooden
training tally board at the waist, headband tied around the forehead, short
cropped hair, sky blue and deep navy color scheme, steady confident expression,
uniform kept short and fitted
```

### 8. `npc-nova.glb` — 노바 · 지식 서고 사서
색: 퍼플 `#a78bfa` / 진남색 `#1f2a44` · 성격: 차분한 사서

```
a serene librarian character wearing a short violet purple librarian vest over
a navy shirt, a thick closed book held in one arm, a small brass reading lamp
clipped at the belt, round glasses, hair neatly tied, violet and deep navy
color scheme, quiet knowledgeable expression, outfit kept short and simple
```

---

# B. 구역 아키타입 (5종) — 건물 안내원 24명 공유

각 구역의 건물 안내원 NPC가 공유하는 기본 캐릭터입니다. 코드에서 구역별 색상(`districtColor`)이
이미 정의되어 있으므로, 하나의 모델을 색만 바꿔 쓰거나 아래 프롬프트로 5종을 각각 뽑으면 됩니다.

### 9. `npc-arch-project.glb` — 프로젝트 구역 안내원 (9명 공유)
색: 주황 `#f3b35b` / 파랑 `#5f7be8`

```
a friendly assistant curator character wearing a simple warm orange apron over
a blue shirt, a small rolled scroll tucked at the belt, a plain cap, short
simple hair, minimal accessories, warm orange and blue color scheme, neutral
helpful expression, deliberately simple and generic design
```

### 10. `npc-arch-developer.glb` — 스킬 구역 안내원 (5명 공유)
색: 청록 `#68c7cf` / 진남색 `#253342`

```
a helpful junior engineer character wearing simple teal work overalls over a
dark navy undershirt, a small wrench in the chest pocket, a plain work cap,
short simple hair, minimal accessories, teal and deep navy color scheme,
neutral helpful expression, deliberately simple and generic design
```

### 11. `npc-arch-archivist.glb` — 경력 구역 안내원 (3명 공유)
색: 보라 `#c69af0` / 갈색 `#8b5a35`

```
a quiet assistant record keeper character wearing a short lavender vest over a
brown tunic, a small notepad in one hand, plain simple clothing, short tidy
hair, minimal accessories, lavender and warm brown color scheme, neutral calm
expression, deliberately simple and generic design
```

### 12. `npc-arch-guide.glb` — Life 구역 안내원 (6명 공유)
색: 초록 `#7ecf68` / 노랑 `#f5d26b`

```
a warm villager guide character wearing a simple leaf green tunic with a yellow
sash, a small lantern hanging from the belt, plain trousers, short simple hair,
minimal accessories, green and soft yellow color scheme, neutral friendly
expression, deliberately simple and generic design
```
> Life 구역은 `npcRoster.ts`의 `districtNpcType`에 항목이 없어 `guide` 타입으로 폴백됩니다.
> Life 전용 NPC 타입이 필요하면 별도 요청 주세요.

### 13. `npc-arch-contact.glb` — 우체국 안내원 (1명)
색: 살구 `#ef8f72` / 흰색 `#e8f2ff`

```
a simple postal assistant character wearing a plain coral orange uniform with
white trim, a small letter pouch at the side, a plain cap, short simple hair,
minimal accessories, coral and off-white color scheme, neutral helpful
expression, deliberately simple and generic design
```

---

# C. 플레이어 캐릭터 (1종)

### 14. `player-walk.glb` / `player-run.glb` — 방문자 아바타
색: 자유 (마을 톤에 맞는 중성적 배색) · 현재 파일: `warrior-walk.glb` / `warrior-run.glb`

```
a friendly young traveler character wearing a comfortable hooded travel cloak
kept short above the knees, a light backpack, sturdy walking boots, simple
belt, short tousled hair, warm earth tone color scheme with a soft teal accent,
neutral cheerful expression, adventurous but approachable, no weapons
```

> 플레이어는 뒤통수를 가장 오래 보게 되는 캐릭터입니다. **뒷모습 실루엣**(후드, 배낭)이
> 명확하게 읽히도록 만드는 게 중요합니다. 애니메이션은 `idle` / `walk` / `run` 3종 필수.

---

## 코드 측 후속 작업

캐릭터 모델이 입고되면 제가 처리할 항목:

- `NpcWarrior.tsx` — 현재 단일 `neon-robot-npc.glb` 하드코딩 → **NPC별 모델 경로 분기** 구조로 변경
  (`npcRoster.ts`에 `glbPath` 필드 추가 → 개별 8명은 전용 모델, 나머지는 아키타입 공유)
- 아키타입 모델 공유 시 `SkeletonUtils.clone` 캐싱 — 같은 GLB를 24번 로드하지 않도록 `useGLTF` 캐시 활용 (자동)
- `WarriorCharacter.tsx` — 플레이어 모델 경로 교체
- 애니메이션 클립 이름 정규화 확인 (`walk` / `run` 매칭 로직)
- 캐릭터 스케일·발높이 보정 (모델마다 원점 위치가 달라 개별 오프셋 필요)
- 기존 `districtColor` 값이 새 모델 텍스처와 겹치는지 정리
