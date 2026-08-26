# NPC 캐릭터 이미지 프롬프트 (38종)

**각 블록을 그대로 복사해서 붙이면 끝.** 조립할 것 없음, 앞에 뭘 더 붙일 것 없음.

전신 T포즈 · 정면 · 단색 배경으로 통일돼 있다. 최종 목적지가 **Meshy image-to-3D → 오토리깅**이라
프롬프트가 "예쁜 일러스트"가 아니라 **3D 변환과 리깅이 되는 이미지**를 뽑도록 짜여 있다.

---

## 뽑는 순서

**전부 한 번에 뽑지 말 것.** 먼저 이 5마리만:

> 여우 · 올빼미 · 비버 · 황소 · 토끼

뾰족귀 · 부리 · 둥근귀 · 뿔 · 긴귀 — 다섯 실루엣 패밀리의 대표다. 이 다섯이
**(a) 충분히 귀여운지 (b) 서로 확실히 구분되는지** 두 가지가 동시에 통과하면 나머지 33종도 통과한다.

한 대화창 안에서 연속으로 뽑고, 2장째부터는 맨 앞에 이 한 줄만 더 붙인다:

```
Same style, same lighting, same background, same proportions, same T-pose as the previous image.
```

## 이미지 단계에서 거를 것 7개

**Meshy 에 넘기기 전에 이미지에서 반드시 확인할 것.** 여기서 한 장 버리는 게 리깅을 다시 하는 것보다 훨씬 싸다.

1. **팔이 진짜 수평인가** — 조금이라도 내려와 몸통에 닿으면 **버리고 다시 뽑는다.**
   오토리깅은 "이 정점이 어느 뼈를 따라갈지"를 **거리로 추측**한다. 팔이 몸에 붙으면 팔 웨이트가
   몸통으로 번지고, 팔을 들 때 몸통이 통째로 딸려 온다 — **꿀렁거림의 정체가 이것이다**
2. **겨드랑이 밑이 뚫려 있는가** — 팔과 몸통 사이에 삼각형 막(webbing)이 생기면 3D에서 그대로 굳는다
3. **좌우가 대칭인가** — 기울거나 비틀려 있으면 오토리거가 뼈대를 삐뚤게 박는다
4. **다리 사이가 벌어져 있는가** — 붙어 있으면 두 다리가 한 덩어리로 리깅된다
5. **꼬리가 다리에 안 닿는가** — 닿으면 꼬리 웨이트가 다리로 샌다
   (다람쥐·라쿤·늑대·여우·고양이·수달·여우원숭이·캥거루·비버·카멜레온 주의)
6. **손이 비어 있는가** — 뭘 들고 있으면 리깅할 때 팔이 틀어진다
7. **머리 부속이 충분히 큰가** — 귀·뿔·볏·부리. 이게 뭉개지면 27종 구분이 무너진다

1~5번은 전부 **리깅** 문제고, 7번만 **디자인** 문제다. 앞의 다섯 개를 더 깐깐하게 볼 것.

## 왜 5등신인가 — 취향이 아니라 리깅 제약이다

처음엔 4등신으로 뽑았는데 애니메이션이 물렁하게 꿀렁거렸다. 원인 중 하나가 비율이었다:
**팔다리가 짧고 두꺼우면 오토리거가 관절 위치를 못 잡는다.** Meshy 리거는 대략 사람 비율을 기대한다.
지금 마을에서 멀쩡히 도는 `lumi.glb` · `warrior` 도 정상 비율 휴머노이드다.

그래서 5등신이 기본값이고, 프롬프트에 **어깨·팔꿈치·엉덩이·무릎이 눈에 보이게** 하라는 조항이 같이 들어갔다.
관절이 안 보이면 오토리거가 거기에 뼈를 안 박는다.

**귀여움은 이제 비율이 아니라 얼굴이 담당한다** — 큰 눈을 얼굴 아래쪽에 넓게, 주둥이는 짧게, 전부 둥글게.
그 조항은 그대로 남아 있다.

> `about 5 heads tall` 을 4나 3으로 내리면 더 귀여워지지만 **리깅이 다시 무너진다.**
> 귀여움이 부족하면 등신을 내리지 말고 **눈 크기와 머리 부속을 키울 것.**

## 색은 코드에서 왔다

프롬프트에 박힌 hex 는 `src/data/npcRoster.ts` 의 `districtColor` 실제 값이다. 구역 정체성이라 임의로 바꾸지 말 것.

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
> 라서 라이프 6채가 광장과 똑같은 초록/노랑을 쓴다. 위 올리브/월넛을 추가하는 걸 전제로 썼다.
> 마을 알베도 색조 중앙값이 78°(황록)이라 셰이더 팔레트와 안 싸우고, 광장의 쨍한 초록과는 채도로 갈린다.

**예외** — 종 고유색이 압도적으로 유명한 경우(꿀벌 노랑·검정, 판다 흑백, 흰사슴 흰색)는 종 색을 지키고
구역색은 소품·옷에만 넣었다. 안 그러면 "청록색 꿀벌"이 나온다.

---

# 광장 (1)

### `npc-central-plaza` · 거북 · 중앙 광장

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: An old tortoise, the village elder. Wide round head, soft crinkled eyelids over big warm half-closed eyes, short blunt beak-like mouth curved into a faint smile, thick folded neck. Wearing a shell-patterned vest over a simple tunic, and a small round straw hat on the crown. Skin in soft moss green #7ECF68, shell and hat in warm ochre #F5D26B.
```

---

# 프로젝트 구역 (9)

### `npc-project-mystock` · 황소 · MyStock-Desk

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A round-cheeked young bull, more stubborn than scary. Short thick horns with blunt rounded tips curving outward, kept oversized so they read from far away. Broad soft muzzle with a big round nose, large earnest eyes, chubby cheeks, short plush fur. Wearing a rolled-sleeve dress shirt with a loose necktie, and a green trader visor pushed up on the forehead. Coat in warm amber #F3B35B, horns and necktie in slate blue #5F7BE8.
```

### `npc-project-festflow` · 앵무새 · FestFlow

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A macaw parrot, a loud festival announcer. Tall swept-back crest feathers kept oversized, large curved blunt beak, big round eyes with pale eye-rings, soft cheeks. Wearing a staff windbreaker with a lanyard, and a tiny headset microphone beside the beak. Feathers in warm amber #F3B35B, crest tips and windbreaker in cobalt #5F7BE8.
```

### `npc-project-sign-language` · 토끼 · 수어지구

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A rabbit, gentle and attentive. Very long upright ears, by far the tallest silhouette in the whole cast, soft round muzzle, big calm eyes, tiny triangular nose. Wearing a soft knit cardigan over a plain shirt. Fur in warm cream-amber #F3B35B, inner ears and cardigan in dusty blue #5F7BE8. Nothing on the head — keep the ears completely unobstructed.
```

### `npc-project-aclub` · 미어캣 · ACLUB

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A meerkat, an alert club organizer. Short pointed muzzle, small round low-set ears, big watchful eyes with dark patches around them, long upright neck. Wearing a club staff hoodie with an enamel pin on the chest. Fur in sandy amber #F3B35B, eye patches and hoodie in deep blue #5F7BE8.
```

### `npc-project-ajou-adventure` · 고슴도치 · 아주분투

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A hedgehog, a plucky little adventurer. Swept-back quills forming a big spiky fan across the whole head, kept oversized, small pointed snout, tiny round ears, big determined eyes. Wearing a short explorer jacket with many small pockets, and a goggle strap across the forehead. Quills in amber #F3B35B tipped with deep blue #5F7BE8, face fur pale cream.
```

### `npc-project-ajouchong` · 사자 · 아주총학

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A lion cub, a student council president trying to look official. Full rounded mane framing the face in chunky sculpted locks, kept oversized so it reads from far away, short soft muzzle, big warm eyes, round cheeks. Wearing a neat school blazer with a sash across the chest. Mane in rich amber #F3B35B, muzzle pale cream, blazer and sash in deep blue #5F7BE8.
```

### `npc-project-muscleup` · 고릴라 · 근근 MuscleUp

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A young gorilla, very proud of his training. Softly rounded brow, wide flat nose, small ears close to the head, big earnest eyes, chubby cheeks, short plush fur. Thick round shoulders and neck — bulk, not menace. Wearing a sleeveless training top and a sweatband across the forehead. Fur in dark warm brown with amber #F3B35B highlights, top and sweatband in deep blue #5F7BE8.
```

### `npc-project-darklab` · 박쥐 · DarkLab

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly. The arms are normal humanoid arms, NOT wings — no wing membrane between arm and body.
CHARACTER: A bat, a shy little lab keeper. Enormous upright pointed ears wider than the head itself, short upturned snout, big round dark eyes, tiny nose leaf, soft cheeks. Wearing a slightly-too-big lab coat with the sleeves rolled up, and a small round dark lens over one eye. Fur in dusky desaturated amber-brown #F3B35B, lab coat pale, ear membranes and trim in deep blue #5F7BE8.
```

### `npc-project-tserof` · 흰사슴 · TSEROF

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A white deer, a gentle forest spirit. Tall branching antlers rising vertically with four points per side, kept oversized, short slender muzzle, big dark gentle eyes, soft cheeks. Wearing a simple draped forest robe. Fur near-white with warm amber #F3B35B in the shadows, antlers pale bone, robe in deep blue #5F7BE8 with moss tones.
```

---

# 기술 구역 (5)

### `npc-skill-frontend` · 공작 · Frontend

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly. The arms are normal humanoid arms, NOT wings.
CHARACTER: A peacock, the front-of-house showman. Crowned head with a fan of three thin crest quills kept oversized, long tapered blunt beak, big bright eyes. A single ornamental eye-feather rises behind the head. Wearing a fitted show jacket with a high collar. Feathers in teal #68C7CF, face plate, beak and jacket in dark navy #253342.
```

### `npc-skill-3d` · 카멜레온 · 3D / Motion

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A chameleon, a cheerful shape-shifter. Tall bony crest sweeping back from the head, kept oversized, two big independently swiveling turret eyes — one looking forward, one to the side — granular simplified skin, curled tail. Wearing a loose smock with paint-smudge patches. Skin in teal #68C7CF grading into navy #253342 along the crest.
```

### `npc-skill-backend` · 비버 · Backend

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A beaver, a patient builder. Broad blunt muzzle with two prominent square front teeth, small round ears, thick straight whiskers, big friendly eyes. Wide flat paddle tail behind. Wearing a canvas work apron with empty tool loops, and a carpenter pencil tucked behind one ear. Fur in teal-tinted brown #68C7CF with navy #253342 shadows, apron navy.
```

### `npc-skill-game` · 라쿤 · Game / XR

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A raccoon, a mischievous tinkerer. Dark bandit mask across the eyes, short pointed snout, big upright rounded ears, big playful eyes, thick ringed ruff at the neck, bushy ringed tail. Wearing a zip hoodie. Fur in cool teal-grey #68C7CF, mask, ear tips, tail rings and hoodie in navy #253342.
```

### `npc-skill-workflow` · 꿀벌 · Workflow

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly. Exactly two arms and two legs — no extra insect limbs.
CHARACTER: A bee, a tireless organizer. Big round compound eyes, two segmented antennae curving up and outward and kept oversized, short fuzzy collar ruff, tiny mandibles, small rounded wings folded flat on the back. Wearing a neat striped worker vest. Keep the classic bee colors — warm amber-yellow and near-black bands — and use teal #68C7CF only on a small collar tab. Antennae must stay unobstructed.
```

---

# 경험 기록관 (3)

### `npc-exp-unity-ui` · 까치 · 2025 Unity UI

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly. The arms are normal humanoid arms, NOT wings.
CHARACTER: A magpie, a meticulous assembler. Rounded head with a small fluffy nape, sturdy straight blunt-tipped beak kept large, big round eyes. Glossy plumage split cleanly into dark and pale panels, long sloping tail. Wearing a tidy button-up vest. Dark areas shifted toward lavender-black #C69AF0, pale areas warm off-white, beak and vest in walnut brown #8B5A35.
```

### `npc-exp-demo-platform` · 수달 · 2025 Demo Platform

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: An otter, a showman of demos. Broad flat head, wide whiskered muzzle, tiny round low-set ears, big playful eyes, sleek fur in chunky simplified clumps, thick tapering tail. Wearing a short presenter jacket. Fur in warm brown #8B5A35 with a lavender #C69AF0 sheen on the crown, jacket lavender.
```

### `npc-exp-portfolio` · 여우 · 2026 AI Portfolio

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A fox, the clever curator of this very village. Large triangular ears with dark inner tufts, short tapering muzzle, big bright eyes with a knowing tilt, fluffy cheek ruff, big bushy tail. Wearing thin half-moon spectacles and a curator's cardigan. Fur in lavender-tinted rust #C69AF0 over #8B5A35, muzzle and ruff cream.
```

---

# 연락 (1)

### `npc-post-office` · 두루미 · 연락 우체국

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly. The arms are normal humanoid arms, NOT wings.
CHARACTER: A crane, a long-distance courier. Long slender neck, narrow straight blunt beak, a small red crown patch, big calm eyes. Wearing a postal courier uniform with a shoulder-strapped message tube (strapped to the body, not held). Plumage in warm off-white #E8F2FF, crown patch, beak base and uniform in coral #EF8F72.
```

---

# 학습 구역 (2)

### `npc-study-codingtest` · 호랑이 · 알고리즘 도장 (알고)

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A tiger cub, a very serious little dojo master. Short rounded muzzle, big wide-set rounded ears, fluffy cheek ruff, big determined eyes, no visible fangs. Bold stripes in thick simplified bands. Wearing a training gi with a belt, and a cloth headband tied at the brow. Fur in cool blue-tinted amber with #5AA9E6 highlights, stripes, belt and headband in deep navy #1F2A44.
```

### `npc-study-cs` · 올빼미 · 지식 서고 (노바)

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly. The arms are normal humanoid arms, NOT wings.
CHARACTER: An owl, an archive librarian. Big flat round facial disc, small hooked blunt beak, tufted brows, enormous still eyes. Wearing a librarian's long vest and round reading glasses resting low on the beak. Plumage in soft blue-grey #5AA9E6, facial disc paler, beak, eye rings and vest in deep navy #1F2A44.
```

---

# 라이프 구역 (6)

### `npc-life-values` · 코끼리 · 가치관 비석

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: An elephant, unshakeable and long-remembering. Long trunk curving gently down and inward, wide fan-shaped ears kept oversized, big gentle eyes, short blunt tusks, soft rounded brow. Wearing a simple draped robe and a cloth band across the brow. Hide in olive-grey #A8B06A, tusks warm bone, robe and band in walnut #7A5C3E.
```

### `npc-life-gym` · 캥거루 · 헬스장

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A kangaroo, a cheerful boxer. Short narrow muzzle, tall upright oval ears rotated slightly outward and kept oversized, round jaw, big alert eyes. Thick tapering tail behind. Wearing a sleeveless training top, soft cloth hand wraps around the wrists, and a rolled towel over the neck. Fur in olive-tinted tan #A8B06A, muzzle, ear insides and top in walnut #7A5C3E.
```

### `npc-life-invest` · 다람쥐 · 투자 타워

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A squirrel, a careful saver. Rounded head with big tufted upright ears, short blunt muzzle, full cheek pouches slightly stuffed, big bright eyes. Huge bushy tail curling up behind, kept oversized. Wearing a small waistcoat, with a tiny acorn tucked behind one ear. Fur in olive-brown #A8B06A, ear tufts, nose and waistcoat in walnut #7A5C3E.
```

### `npc-life-library` · 판다 · 도서관

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A giant panda, a slow contented reader. Wide round head, black eye patches and big round black ears against off-white fur, short blunt muzzle, sleepy half-lidded eyes. Wearing a soft cardigan and a scarf, with a bookmark ribbon behind one ear. Keep the classic panda black-and-white, and use olive #A8B06A only on the scarf, with walnut #7A5C3E on the cardigan.
```

### `npc-life-music` · 늑대 · 음악 스튜디오

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A wolf, singing. Head facing straight forward, mouth rounded into a small O as if mid-note, eyes closed and content. Tall triangular ears swept back and kept oversized, short tapering snout, thick fluffy neck ruff, bushy tail. Wearing a loose band jacket, with headphones resting around the neck — not on the ears, not held. Fur in olive-grey #A8B06A with a paler throat, ear insides, nose and jacket in walnut #7A5C3E.
```

### `npc-life-timeline` · 나무늘보 · 연혁 타임라인

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A sloth, living on slow time. Flat wide face with a permanent faint smile, dark eye patches, small flat nose, shaggy fur radiating outward from the face in chunky simplified clumps, tiny hidden ears. Arms noticeably longer than the other characters, which suits the T-pose. Blunt rounded claws, not sharp. Wearing a loose knit sweater. Fur in olive-moss #A8B06A with walnut #7A5C3E patches, face pale cream.
```

---

# 마을 대표 NPC (6)

방문자가 실제로 가장 많이 대화하는 NPC다. 건물 27채보다 먼저 뽑아도 된다.

### `overseer-npc` · 정재훈 · 마을 총괄 (본인 분신)

> **유일하게 사람.** 동물 마을에 인간이 딱 한 명 — 이게 "이 마을은 누구 것인가"를 대사 없이 말한다.

```
Stylized 3D game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, soft simplified features, softly rounded cheeks, small simple smiling mouth.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fabric and hair. No individual hairs, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A young Korean man in his mid-twenties, the owner of this village, warm and energetic. He is rendered in exactly the same cute proportions as a cast of animal-headed characters, so he reads as one of them rather than a realistic human dropped into a cartoon. Short tidy black hair, open smiling face. Wearing a work jacket in warm gold #F5C542 over a plain shirt, with a deep brown #6B4F1D satchel strap across the chest.
```

### `guide-npc` · 루미 · 안내원 → 보더콜리

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A border collie, an eager guide. Semi-erect ears with one folded forward, short alert muzzle, big focused eyes, a white blaze down the center of the face, fluffy neck ruff, feathered tail. Wearing a guide's tabard over a plain shirt. Fur in moss green-tinted black and white #7ECF68, blaze and ruff off-white, tabard and collar in warm ochre #F5D26B.
```

### `project-npc` · 픽셀 · 프로젝트 큐레이터 → 고양이

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A cat, a discerning curator. Large triangular ears, short round muzzle, long whiskers, big round eyes with soft oval pupils and a slightly appraising tilt, plump cheeks, long curving tail. Wearing a curator's jacket with a small badge. Fur in warm amber #F3B35B tabby with simplified stripe bands, ear insides, badge and jacket in cobalt #5F7BE8.
```

### `developer-npc` · 테오 · 기술 멘토 → 염소

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A goat, a dry and practical mentor. Backward-curving ridged horns kept oversized with blunt tips, short blocky muzzle, big round eyes with soft horizontal pupils, a small tufted chin beard, floppy side ears. Wearing a technical vest over a rolled-sleeve shirt. Fur in teal-grey #68C7CF, horns, beard and vest in dark navy #253342.
```

### `archivist-npc` · 아카 · 기록 관리자 → 아르마딜로

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: An armadillo, a keeper of records. Segmented armored plates banding across the head and down the neck and back like stacked drawers, short narrow snout, small round ears, big patient eyes. Wearing an archivist's apron. Plates in lavender-grey #C69AF0, snout, underside and apron in walnut #8B5A35.
```

### `contact-npc` · 포스트 · 연락 담당 → 제비

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features — ears, horns, crest, beak, quills, trunk — stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly. The arms are normal humanoid arms, NOT wings.
CHARACTER: A swallow, a swift messenger. Small rounded head, short pointed blunt beak, glossy dark blue crown, a rust-colored throat patch, big quick eyes, forked tail. Wearing a postal courier jacket with a collar band. Crown deep blue, throat in coral #EF8F72, cheeks and jacket trim in pale #E8F2FF.
```

---

# 의뢰 공방 (5)

지하 공방이라 **마을보다 한 단계 어둡고 차갑게** 간다. 각 프롬프트 맨 끝에 그 문장이 이미 박혀 있다.

### `atelier-intake-npc` · 도안 · 접수 → 개미핥기

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: An anteater, patient at digging out what a customer actually wants. Very long tapering tubular snout kept oversized, tiny eyes set far back, small rounded ears, soft brow, long bushy tail. Wearing a receptionist's apron with a drafting pencil tucked behind one ear. Fur in muted desaturated orange #FF9D38, snout and ear rims in dull gold #E2C078.
Overall value one step darker and cooler than a bright village character — this one works underground.
```

### `atelier-planner-npc` · 체리 · 기획 → 까마귀

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly. The arms are normal humanoid arms, NOT wings.
CHARACTER: A crow, quietly calculating. Smooth rounded head, sturdy straight blunt beak kept large, big round eyes with one brow tilted as if measuring, glossy plumage in simplified panels. Wearing a planner's vest with a flat chest pocket. Plumage deep green-black with moss green #7ECF68 sheen, beak and vest trim in warm ochre #F5D26B.
Overall value one step darker and cooler than a bright village character — this one works underground.
```

### `atelier-designer-npc` · 먹지 · 디자인 → 문어

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, softly rounded forms, small simple mouth. Everything blunt and rounded, no menace. Calm, approachable, lightly smiling.
Silhouette: the head shape stays LARGE and clearly readable; exaggerate it and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte skin and fabric. No micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: An octopus-headed designer. IMPORTANT: the body is a normal humanoid body with exactly two arms and two legs in T-pose — only the head is an octopus. Large smooth bulbous mantle head, big wide horizontal-pupil eyes, a short simplified tentacle fringe framing the jaw like a soft beard, kept short and tidy rather than sprawling. Wearing a paint-smudged smock. Skin in muted lavender #C69AF0 shifting to walnut #8B5A35 at the mantle tip, with faint ink-dark mottling.
Overall value one step darker and cooler than a bright village character — this one works underground.
```

### `atelier-frontend-npc` · 리코 · 프론트엔드 → 여우원숭이

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big glossy eyes set low on the face and wide apart with large pupils and one soft highlight, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A ring-tailed lemur, wide-eyed and quick. Very large round amber eyes with dark patches, short pointed muzzle, tall rounded ears, grey-and-white face banding, long boldly ringed tail kept oversized. Wearing a zip hoodie. Fur in cool grey with a teal #68C7CF cast, muzzle and brow off-white, eye patches, tail rings and hoodie in navy #253342.
Overall value one step darker and cooler than a bright village character — this one works underground.
```

### `atelier-backend-npc` · 굴뚝 · 백엔드 → 두더지

```
Stylized 3D anthropomorphic game character, full body, single figure centered, a STRICT T-POSE — this is the single most important requirement: both arms fully extended straight out to the left and right, perfectly horizontal, forming a clean capital T with the body, elbows straight, palms facing down, with wide open space between each arm and the torso. Legs straight and parallel with a visible gap between them, feet flat and fully visible, toes pointing forward. Facing the camera straight on, head level, body perfectly symmetric and upright — no leaning, no twisting, no relaxed or idle pose.
Proportions: human body with an animal head, about 5 heads tall, cute but sturdy build, slightly oversized rounded head, normal-length limbs with clearly readable shoulder, elbow, hip and knee joints, small rounded hands and feet, no muscle definition.
Cuteness: baby-animal face — big soft eyes, short compressed muzzle, softly rounded cheeks, small simple mouth. Everything blunt and rounded: no bared fangs, no sharp claws, no scowl. Calm, approachable, lightly smiling.
Silhouette: the species-identifying head features stay LARGE and clearly readable; exaggerate those and soften everything else.
Art direction: hand-painted stylized game asset, chunky simplified forms, clean readable planes, low-poly friendly shapes, soft matte fur and fabric. No fur strands, no micro-detail, no photorealism.
Color: muted warm earthy palette, low saturation, no neon, no pure white, no pure black, no metallic sheen.
Lighting: soft even light from front-top, very soft shading, no rim light, no strong contrast, no cast shadow on the background.
Background: flat solid #F0ECE4, completely empty, no floor, no props, no text, no watermark, no logo, no border.
Framing: full body head to feet with even margin, nothing cropped, no perspective distortion. Keep a clear open gap under each armpit — the arms must not be webbed to the torso. Hands are empty, holding nothing. Any tail hangs clear behind the body and does not touch the legs. The left and right halves mirror each other exactly.
CHARACTER: A mole, working underground where nobody sees it. Broad blunt cylindrical snout with a pink star-shaped nose tip kept oversized, eyes almost hidden in the fur, no visible ears, dense velvety fur lying flat in every direction, wide rounded digging paws with blunt nails. Wearing coveralls and a small headlamp band across the brow. Fur in dark slate brown with a faint teal #68C7CF sheen, nose dull rose, coveralls navy #253342.
Overall value one step darker and cooler than a bright village character — this one works underground.
```

---

# 3D 로 넘길 때

프롬프트가 저렇게 생긴 이유는 대부분 Meshy image-to-3D 때문이다:

- **배경 `#F0ECE4` 단색 · 그림자 없음** — 배경에 그림자가 지면 Meshy가 그걸 지오메트리로 오해한다
- **크롭 없음 · 원근 왜곡 없음** — 프레임에 잘리면 잘린 면이 그대로 구멍이 된다
- **rim light · 강한 대비 금지** — 조명이 알베도에 구워져서 마을 조명과 이중으로 겹친다
- **손은 비어 있음** — T포즈에서 뭘 들면 리깅할 때 팔이 틀어진다
- **새·박쥐는 팔이 날개가 아님을 명시** — 안 그러면 팔이 몸통에 붙은 막으로 나와서 리깅이 안 된다
- **털 가닥 · 미세 디테일 금지** — `npm run optimize` 에서 어차피 날아가고, 22유닛 거리에선 안 보인다

## 리깅이 그래도 꿀렁거릴 때

이미지가 위 7개를 다 통과했는데도 움직임이 물렁하면, **어디가 문제인지부터 가른다.**
Meshy 뷰어에서 걷기를 재생하고 **팔만** 봐라:

| 증상 | 원인 | 대응 |
|---|---|---|
| 팔 올릴 때 몸통이 같이 딸려 옴 | 웨이트 번짐 | 포즈 문제. 이미지부터 다시 |
| 관절이 종잇장처럼 뭉개짐 | 토폴로지 | **리깅 전에 quad 리메시** |
| 딱딱해야 할 부위(등껍질·갑옷)가 출렁임 | 강체 웨이트 | 블렌더에서 그 부위만 척추에 100% 고정 |
| 전신이 미묘하게 다 흔들림 | 뼈대가 삐뚤게 박힘 | 리깅 단계에서 뼈 위치 조정 |

**quad 리메시는 리깅 전에.** Meshy 출력은 삼각형에 밀도가 제멋대로라 관절에 엣지루프가 없다.
그러면 굽힐 때 접히는 게 아니라 뭉개진다. 사각면으로 다시 짜면 변형이 확실히 낫다.

계속 실패하면 **Mixamo 오토리깅**이 대안이다. 무료고 휴머노이드 오토리거가 더 안정적이다. 역시 T포즈가 필요하다.

> **근본 해결은 머리 파츠 방식이다.** 몸 하나만 제대로 리깅하고 머리는 Head 본에 100% 고정하면
> 머리는 변형이 **0** 이라 꿀렁거릴 수가 없다. 38번 리깅 도박을 하지 않아도 된다. 문서 맨 아래 참고.

## 텍스처 상한 — 이건 꼭

38종을 통짜 모델로 가면 **텍스처를 512² 이하로 잡아야 한다.**
1024² 알베도 하나가 VRAM **5.6MB** 다. 38종이면 213MB — 마을이 통째로 죽는다.
512² 면 1.4MB × 38 ≈ 53MB 로 감당 가능하다. `scripts/optimize_textures.py` 에서 상한을 걸어 둘 것.

## 이후 절차

[characterModels.ts](../src/data/characterModels.ts) 상단 주석에 이미 적혀 있다:
`merge-character.mjs` → `npm run optimize -- characters` → `CharacterModelId` 유니온 → 레지스트리 표 → `npcRoster` 의 `model` 지정.

> **머리 파츠 방식으로 가려면** (몸 1개 공용 + 머리 38개 — VRAM 이 훨씬 싸다) 각 프롬프트의
> 첫 줄과 Framing 줄을 아래로 바꾸면 된다. 단 `NpcCharacter.tsx` 에 본을 만지는 코드가 한 줄도 없어서
> Head 본 attach 로직을 새로 짜야 한다.
>
> ```
> Stylized 3D character head only, single object centered, three-quarter front view at eye level.
> Framing: the head fills about 70% of the frame, nothing cropped, the neck ends in a clean flat horizontal cut.
> ```
