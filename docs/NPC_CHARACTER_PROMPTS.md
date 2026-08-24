# NPC 캐릭터 이미지 프롬프트 (38종)

의인화 동물 NPC의 컨셉 이미지를 GPT 이미지 생성으로 뽑기 위한 프롬프트 모음.
최종 목적지는 **Meshy image-to-3D** 이므로, 프롬프트가 "예쁜 일러스트"가 아니라
**3D로 변환 가능한 단일 오브젝트 이미지**를 뽑도록 짜여 있다.

---

## 1. 쓰는 법

한 프롬프트 = **[공용 스타일 블록] + [개별 줄]** 을 그대로 이어붙인 것.

**공용 블록은 한 글자도 고치지 말 것.** 38장의 톤이 갈라지는 원인은 거의 전부
"이번 것만 살짝" 스타일 블록을 손본 것이다.

한 대화창 안에서 연속으로 뽑고, 2장째부터는 맨 앞에 이 한 줄을 더 붙인다:

```
Same style, same lighting, same background, same proportions, same rendering as the previous image.
```

### 블록 A vs 블록 B

| | 용도 | 언제 |
|---|---|---|
| **A. 머리 파츠** | 실제 제작물 (몸 1개 공용 + 머리 27개 구조) | 실루엣 승인 이후 전량 생산 |
| **B. 전신 컨셉** | 실루엣·아트디렉션 확인용 | **먼저** 5마리만 |

순서는 반드시 **B로 5마리(여우·올빼미·비버·황소·토끼) → 실루엣 확인 → A로 전량**.
저 다섯은 뾰족귀·부리·둥근귀·뿔·긴귀 다섯 실루엣 패밀리의 대표라, 이게 되면 나머지도 된다.

---

## 2. 공용 스타일 블록 A — 머리 파츠

```
Stylized 3D character head only, single object centered in frame, three-quarter front view at eye level.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte surfaces. No fur strands, no individual hairs, no micro-detail, no skin pores, no photorealism. Rounded cartoon proportions with a slightly oversized cranium.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even studio light from front-top, very soft shading, no rim light, no dramatic contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: the head fills about 70% of the frame, nothing cropped, the neck ends in a clean flat horizontal cut.
```

## 3. 공용 스타일 블록 B — 전신 컨셉

```
Stylized 3D anthropomorphic character, full body, single figure centered, straight front view, relaxed A-pose, arms slightly away from the body, feet flat and fully visible.
Proportions: human body with an animal head, about 5.5 heads tall, sturdy simplified build, slightly oversized head, simple hands.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fabric and fur. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black.
Lighting: soft even studio light from front-top, very soft shading, no rim light, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body from head to feet with margin, nothing cropped.
```

---

## 4. 색 규칙 (중요)

각 줄에 박힌 hex 는 `src/data/npcRoster.ts` 의 `districtColor` 실제 값이다. 구역 정체성이라 임의로 바꾸지 말 것.

| 구역 | body | accessory |
|---|---|---|
| 광장 plaza | `#7ECF68` | `#F5D26B` |
| 프로젝트 projects | `#F3B35B` | `#5F7BE8` |
| 기술 skills | `#68C7CF` | `#253342` |
| 경험 experience | `#C69AF0` | `#8B5A35` |
| 연락 contact | `#EF8F72` | `#E8F2FF` |
| 학습 study | `#5AA9E6` | `#1F2A44` |
| **라이프 life** | **`#A8B06A`** (신규) | **`#7A5C3E`** (신규) |

> **라이프 구역은 지금 색이 없다.** `npcRoster.ts:376` 이 `districtColor[district] ?? districtColor.plaza`
> 라서 라이프 6채가 광장과 똑같은 초록/노랑을 쓰고 있다. 위 올리브/월넛을 추가하는 걸 전제로 프롬프트를 썼다.
> 올리브(`#A8B06A`)를 고른 이유: 마을 알베도 색조 중앙값이 78°(황록)이라 셰이더 팔레트와 싸우지 않고,
> 광장의 쨍한 초록과는 채도·명도로 확실히 갈린다.

**예외 규칙 하나** — 종 고유색이 압도적으로 유명한 경우(꿀벌 노랑·검정, 판다 흑백, 흰사슴 흰색)는
**종 색을 지키고 구역색은 소품·귀 안쪽 같은 작은 면적으로만** 넣는다. 안 그러면 "청록색 꿀벌"이 나온다.

또 하나 — 마을 셰이더(`villageMaterial.ts`)가 채도 상한을 걸어 쨍한 색을 깎는다.
프롬프트에서 처음부터 채도를 낮게 뽑아야 3D로 넣었을 때 색이 안 변한다.

---

## 5. 개별 줄 — 마을 건물 27채

### 광장 (1)

**`npc-central-plaza` · 거북 · 마을 촌장**
```
An ancient tortoise head, the village elder. Wide low skull, heavy wrinkled eyelids half closed, short hooked beak-like mouth, thick folded neck skin. Skin in soft moss green #7ECF68, beak and brow ridges in warm ochre #F5D26B. Accessory: a small round straw hat resting on the crown.
```

### 프로젝트 구역 (9)

**`npc-project-mystock` · 황소 · MyStock-Desk**
```
A stern bull head. Short thick horns curving outward then slightly forward, broad flat muzzle with a wide nose, small deep-set eyes under a heavy brow, short cropped fur. Coat in warm amber #F3B35B, horns in muted slate blue #5F7BE8. Accessory: a green trader visor pushed up on the forehead.
```

**`npc-project-festflow` · 앵무새 · FestFlow**
```
A macaw-like parrot head, a loud festival announcer. Tall swept-back crest feathers, large curved beak, round bright eye with a pale eye-ring. Feathers in warm amber #F3B35B, crest tips in cobalt #5F7BE8. Accessory: a tiny headset microphone beside the beak.
```

**`npc-project-sign-language` · 토끼 · 수어지구**
```
A rabbit head, gentle and attentive. Very long upright ears, by far the tallest silhouette, soft rounded muzzle, large calm eyes, small triangular nose. Fur in warm cream-amber #F3B35B, inner ears in dusty blue #5F7BE8. No accessory — keep the ears completely unobstructed.
```

**`npc-project-aclub` · 미어캣 · ACLUB**
```
A meerkat head, an alert club organizer. Narrow pointed muzzle, small round low-set ears, wide watchful eyes with dark eye patches, long upright neck. Fur in sandy amber #F3B35B, eye patches and nose in deep blue #5F7BE8. Accessory: a small enamel club pin on a collar tab.
```

**`npc-project-ajou-adventure` · 고슴도치 · 아주분투**
```
A hedgehog head, a plucky adventurer. Swept-back quills forming a spiky fan across the whole skull, small pointed snout, tiny round ears, bright determined eyes. Quills in amber #F3B35B tipped with deep blue #5F7BE8, face fur pale cream. Accessory: a thin goggle strap across the forehead.
```

**`npc-project-ajouchong` · 사자 · 아주총학**
```
A lion head, a student council president. Full rounded mane framing the face in chunky sculpted locks, broad flat nose, calm confident eyes. Mane in rich amber #F3B35B, muzzle pale cream, a deep blue #5F7BE8 sash knot at the neck. No other accessory — the mane is the silhouette.
```

**`npc-project-muscleup` · 고릴라 · 근근 MuscleUp**
```
A gorilla head, gym-hardened. Heavy pronounced brow ridge, wide flat nose, small ears close to the skull, powerful square jaw, short dense fur. Fur in dark warm brown with amber #F3B35B highlights, a deep blue #5F7BE8 sweatband across the forehead. Make the neck and trapezius read as very thick.
```

**`npc-project-darklab` · 박쥐 · DarkLab**
```
A bat head, a secretive lab keeper. Enormous upright pointed ears wider than the skull itself, short upturned snout, tiny sharp eyes, small nose leaf. Fur in dusky desaturated amber-brown #F3B35B, ear membranes in translucent deep blue #5F7BE8. Accessory: a small round dark lens over one eye.
```

**`npc-project-tserof` · 흰사슴 · TSEROF**
```
A white deer head, a forest spirit. Tall branching antlers rising vertically with four points per side, long slender muzzle, large dark gentle eyes, short white fur. Fur near-white with warm amber #F3B35B in the shadows, antlers pale bone with deep blue #5F7BE8 moss in the crevices.
```

### 기술 구역 (5)

**`npc-skill-frontend` · 공작 · Frontend**
```
A peacock head, the front-of-house showman. Slender crowned skull with a fan of three thin crest quills, long tapered beak, smooth face plate. Feathers in teal #68C7CF, face plate and beak in dark navy #253342. Accessory: a single ornamental eye-feather rising behind the head.
```

**`npc-skill-3d` · 카멜레온 · 3D / Motion**
```
A chameleon head, a shape-shifter. Tall bony crest sweeping back from the skull, two independently swiveling turret eyes — one looking forward, one to the side — granular simplified skin. Skin in teal #68C7CF grading into navy #253342 along the crest. No accessory — the eyes and crest carry it.
```

**`npc-skill-backend` · 비버 · Backend**
```
A beaver head, a patient builder. Broad blunt muzzle with two prominent square front teeth, small round ears, thick straight whiskers, dense flat-lying fur. Fur in teal-tinted brown #68C7CF over navy #253342 shadows. Accessory: a carpenter pencil tucked behind one ear.
```

**`npc-skill-game` · 라쿤 · Game / XR**
```
A raccoon head, a mischievous tinkerer. Dark bandit mask across the eyes, pointed snout, upright rounded ears, thick ringed ruff at the neck. Fur in cool teal-grey #68C7CF, mask and ear tips in navy #253342. No accessory.
```

**`npc-skill-workflow` · 꿀벌 · Workflow**
```
A bee head, a tireless organizer. Large compound eyes, two segmented antennae curving up and outward, short fuzzy collar ruff, small mandibles. Keep the classic bee colors — warm amber-yellow and near-black bands — and use teal #68C7CF only on a small collar tab. Antennae must stay unobstructed.
```

### 경험 기록관 (3)

**`npc-exp-unity-ui` · 까치 · 2025 Unity UI**
```
A magpie head, a meticulous assembler. Sleek streamlined skull, straight sharp beak, glossy plumage split cleanly into dark and pale panels across the face. Dark areas shifted toward lavender-black #C69AF0, pale areas warm off-white, beak in walnut brown #8B5A35.
```

**`npc-exp-demo-platform` · 수달 · 2025 Demo Platform**
```
An otter head, a showman of demos. Broad flat skull, wide whiskered muzzle, tiny round ears set low on the sides, bright playful eyes, sleek wet-looking fur in chunky simplified clumps. Fur in warm brown #8B5A35 with a lavender #C69AF0 sheen on the crown.
```

**`npc-exp-portfolio` · 여우 · 2026 AI Portfolio**
```
A fox head, the clever curator. Large triangular ears with dark inner tufts, narrow tapering muzzle, sharp intelligent eyes, a ruff of fur at the cheeks. Fur in lavender-tinted rust #C69AF0 over #8B5A35, muzzle and cheek ruff cream. Accessory: thin half-moon spectacles sitting low on the muzzle.
```

### 연락 (1)

**`npc-post-office` · 두루미 · 연락 우체국**
```
A crane head, a long-distance courier. Very long slender neck, narrow straight beak, a small red crown patch, calm narrow eye. Plumage in warm off-white #E8F2FF, crown patch and beak base in coral #EF8F72. Accessory: a small leather message tube strapped at the base of the neck.
```

### 학습 구역 (2)

**`npc-study-codingtest` · 호랑이 · 알고리즘 도장 (알고)**
```
A tiger head, a dojo master. Broad square muzzle, wide-set rounded ears, heavy cheek ruff, bold stripes in thick simplified bands, steady focused eyes. Fur in cool blue-tinted amber with #5AA9E6 highlights, stripes in deep navy #1F2A44. Accessory: a cloth training headband tied at the brow.
```

**`npc-study-cs` · 올빼미 · 지식 서고 (노바)**
```
An owl head, an archive librarian. Flat round facial disc, small hooked beak, tufted brows, enormous still eyes. Plumage in soft blue-grey #5AA9E6, facial disc paler, beak and eye rings in deep navy #1F2A44. Accessory: round reading glasses resting low.
```

### 라이프 구역 (6)

**`npc-life-values` · 코끼리 · 가치관 비석**
```
An elephant head, unshakeable and long-remembering. Long trunk curving gently down and inward, wide fan-shaped ears, small wise eyes, short tusks. Hide in olive-grey #A8B06A, tusks warm bone, a walnut #7A5C3E cloth band across the brow.
```

**`npc-life-gym` · 캥거루 · 헬스장**
```
A kangaroo head, a boxer. Long narrow muzzle, tall upright oval ears rotated slightly outward, strong jaw, alert eyes. Fur in olive-tinted tan #A8B06A, muzzle and ear insides in walnut #7A5C3E. Accessory: a rolled towel over the neck.
```

**`npc-life-invest` · 다람쥐 · 투자 타워**
```
A squirrel head, a careful saver. Rounded skull with tufted upright ears, short blunt muzzle, full cheek pouches slightly stuffed, big bright eyes. Fur in olive-brown #A8B06A, ear tufts and nose in walnut #7A5C3E. Accessory: a tiny acorn tucked behind one ear.
```

**`npc-life-library` · 판다 · 도서관**
```
A giant panda head, a slow contented reader. Wide round skull, black eye patches and round black ears against off-white fur, short blunt muzzle, sleepy half-lidded eyes. Keep the classic panda black-and-white, and use olive #A8B06A only on a small scarf at the neck. Accessory: a bookmark ribbon tucked behind one ear.
```

**`npc-life-music` · 늑대 · 음악 스튜디오**
```
A wolf head mid-howl, muzzle tilted slightly up, mouth rounded into an O, eyes closed. Tall triangular ears swept back, long tapering snout, thick neck ruff. Fur in olive-grey #A8B06A with a paler throat, ear insides and nose in walnut #7A5C3E. Accessory: headphones resting around the neck, not on the ears.
```

**`npc-life-timeline` · 나무늘보 · 연혁 타임라인**
```
A sloth head, living on slow time. Flat wide face with a permanent faint smile, dark eye patches, small flat nose, shaggy fur radiating outward from the face in chunky simplified clumps, tiny hidden ears. Fur in olive-moss #A8B06A with walnut #7A5C3E patches, face pale cream.
```

---

## 6. 개별 줄 — 마을 대표 NPC 6

이 6명이 방문자가 실제로 가장 많이 대화하는 NPC다. 건물 27채보다 먼저 뽑아도 된다.

**`overseer-npc` · 정재훈 · 마을 총괄 (본인 분신)**

> **유일하게 사람.** 동물 마을에 인간이 딱 한 명 — 이게 "이 마을은 누구 것인가"를 대사 없이 말한다.
> 이 캐릭터만 블록 B(전신)로 뽑는 걸 권한다. 얼굴만으로는 이 장치가 안 살아난다.

```
A young Korean man in his mid-twenties, the owner of this village, warm and energetic. Short tidy black hair, friendly open expression. Wearing a simple work jacket in warm gold #F5C542 over a plain shirt, with a deep brown #6B4F1D satchel strap across the chest. He is the only human in a village of animal-headed characters, so keep him unmistakably human but rendered in exactly the same stylized game-asset style.
```

**`guide-npc` · 루미 · 안내원 → 보더콜리**
```
A border collie head, an eager guide. Semi-erect ears, one folded forward, narrow alert muzzle, bright focused eyes, a white blaze running down the center of the face. Fur in moss green-tinted black and white #7ECF68, blaze and ruff off-white, collar in warm ochre #F5D26B.
```

**`project-npc` · 픽셀 · 프로젝트 큐레이터 → 고양이**
```
A cat head, a discerning curator. Sharp triangular ears, short muzzle, long whiskers, narrow appraising eyes with slit pupils. Fur in warm amber #F3B35B tabby with simplified stripe bands, ear insides and collar in cobalt #5F7BE8.
```

**`developer-npc` · 테오 · 기술 멘토 → 염소**
```
A goat head, a dry and practical mentor. Backward-curving ridged horns, long rectangular muzzle, horizontal slit pupils, a short pointed chin beard. Fur in teal-grey #68C7CF, horns and beard in dark navy #253342.
```

**`archivist-npc` · 아카 · 기록 관리자 → 아르마딜로**
```
An armadillo head, a keeper of records. Segmented armored plates banding across the skull and down the neck like stacked drawers, long narrow snout, small round ears, calm patient eyes. Plates in lavender-grey #C69AF0, snout and underside in walnut #8B5A35.
```

**`contact-npc` · 포스트 · 연락 담당 → 제비**
```
A swallow head, a swift messenger. Small streamlined skull, short pointed beak, glossy dark blue crown, a rust-colored throat patch, quick bright eyes. Crown in deep blue, throat in coral #EF8F72, cheeks in pale #E8F2FF. Accessory: a tiny letter tucked into a collar band.
```

---

## 7. 개별 줄 — 의뢰 공방 5

지하 공방이라 **마을보다 한 단계 어둡고 차갑게** 간다. 스타일 블록은 그대로 두고 색만 낮춘다.
각 줄 끝에 이 문장을 덧붙일 것:

```
Overall value one step darker and cooler than the village characters — this one works underground.
```

**`atelier-intake-npc` · 도안 · 접수 → 개미핥기**
```
An anteater head, patient at digging out what the customer actually wants. Very long tapering tubular snout, tiny eyes set far back, small rounded ears, narrow skull. Fur in muted desaturated orange #FF9D38, snout and ear rims in dull gold #E2C078. Accessory: a drafting pencil tucked behind one ear.
```

**`atelier-planner-npc` · 체리 · 기획 → 까마귀**
```
A crow head, sharp and calculating. Smooth rounded skull, heavy straight beak, glossy plumage in simplified panels, one eye narrowed as if measuring. Plumage in deep green-black with moss green #7ECF68 sheen, beak in warm ochre #F5D26B.
```

**`atelier-designer-npc` · 먹지 · 디자인 → 문어**
```
An octopus head, the designer whose name means carbon paper. Large smooth bulbous mantle, wide horizontal-pupil eyes, short simplified tentacle fringe framing the jaw like a beard. Skin in muted lavender #C69AF0 shifting to walnut #8B5A35 at the mantle tip, with faint ink-dark mottling. Keep the tentacles short and tidy, not sprawling.
```

**`atelier-frontend-npc` · 리코 · 프론트엔드 → 여우원숭이**
```
A ring-tailed lemur head, wide-eyed and quick. Very large round amber eyes with dark eye patches, short pointed muzzle, tall rounded ears, grey-and-white face banding. Fur in cool grey with a teal #68C7CF cast, muzzle and brow in off-white, eye patches in navy #253342.
```

**`atelier-backend-npc` · 굴뚝 · 백엔드 → 두더지**
```
A mole head, working underground where nobody sees it. Broad blunt cylindrical snout with a pink star-shaped nose tip, eyes almost hidden in the fur, no visible ears, dense velvety fur lying flat in every direction. Fur in dark slate brown with a faint teal #68C7CF sheen, nose in dull rose. Accessory: a small headlamp band across the brow.
```

---

## 8. Meshy 로 넘길 때

이 프롬프트들이 저렇게 생긴 건 대부분 Meshy image-to-3D 때문이다:

- **배경 `#F0ECE4` 단색·그림자 없음** — 배경에 그림자가 지면 Meshy가 그걸 지오메트리로 오해한다
- **단일 오브젝트·크롭 없음** — 프레임에 잘리면 잘린 면이 그대로 구멍이 된다
- **rim light / 강한 대비 금지** — 조명이 알베도에 구워져서 마을 조명과 이중으로 겹친다
- **머리 밑동은 평평하게 끊기** — 목 본에 붙일 접합면
- **털 가닥·미세 디테일 금지** — 어차피 `npm run optimize` 에서 텍스처가 줄고, 22유닛 거리에선 안 보인다

3D 변환 뒤 절차는 [characterModels.ts](../src/data/characterModels.ts) 상단 주석에 이미 적혀 있다
(`merge-character.mjs` → `npm run optimize -- characters` → `CharacterModelId` 유니온 → 레지스트리 → 로스터).

단, **머리 파츠 방식은 아직 코드가 없다.** `NpcCharacter.tsx` 에는 본을 만지는 부분이 한 줄도 없어서,
Head 본을 찾아 파츠를 attach 하는 로직을 새로 짜야 한다. 그 전에 공용 바디 리그에
Head 본이 이름으로 잡히는지부터 확인할 것.
