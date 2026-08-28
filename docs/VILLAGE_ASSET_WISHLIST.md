# 마을에 아직 필요한 에셋

> **2026-08-26 전면 재작성.** 들어온 것·코드로 해결한 것은 전부 지웠다 —
> 이 문서에는 **아직 없는 것만** 있다. 지난 판(A/B/C/X 번호 · 1~5차 입고 이력 ·
> 컨셉 대조 기록)이 필요하면 `git log -p docs/VILLAGE_ASSET_WISHLIST.md`.
>
> `MESHY_NEXT_ASSETS.md` 의 4종도 여기로 합쳤다. 요청은 이 문서 하나만 보면 된다.
> 프롬프트 원본·규칙: 건물 [`MESHY_BUILDING_PROMPTS.md`](MESHY_BUILDING_PROMPTS.md) ·
> 장식물 [`MESHY_PROP_PROMPTS.md`](MESHY_PROP_PROMPTS.md) ·
> 캐릭터 [`NPC_CHARACTER_PROMPTS.md`](NPC_CHARACTER_PROMPTS.md)

---

## 오늘 마을 상태 (실측)

| 무엇        | 지금                   | 비고                                                        |
| ----------- | ---------------------- | ----------------------------------------------------------- |
| 건물        | **27 / 27** ✅         | 2026-08-27 `study-cs`(지식 서고) 입고 — 전 채 완성          |
| 캐릭터      | **34 / 38**            | 건물 NPC 4명(까치·수달·여우·나무늘보)만 아직 로봇이다       |
| 프롭        | 1,197개                | `src/data/propsLayout.json`                                 |
| 돌다리      | 14곳 · **2종 교대** ✅ | 2026-08-27 `bridge-arch` 입고 — 남북 대문 + 건널목 교대     |
| 채움 민가   | 32채 / **3종**         | `house-a` 11 · `house-b` 10 · `house-c` 11                  |
| 물가 소품   | **3종** ✅             | 2026-08-27 부들·수련·징검돌 입고 — 갈대 26·수련 12·징검돌 4 |
| 삼각형 예산 | 상한 1,800k            | 진짜 수치는 앱에서 **F8**(`PerfHud`). 여유가 많지 않다      |

검산: `npm run check:village` (정합성) · `src/data/propsLayout.json` (프롭 수)

---

## 한눈에 — 급한 순서

| 순위  | 무엇              | 파일                                                                                                             | 왜 지금                                                             |
| ----- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| ~~①~~ | ~~지식 서고~~     | ✅ 2026-08-27 입고                                                                                               | 폴백 민가 자동 해제, 27/27                                          |
| ~~②~~ | ~~물가 소품 3종~~ | ✅ 2026-08-27 입고                                                                                               | `generate-decor-layout.mjs` ⑭-c 절이 심는다(개수 상한 = 예산)       |
| ~~③~~ | ~~아치 돌다리~~   | ✅ 2026-08-27 입고                                                                                               | **원본 Z 를 0.55 로 눌러 구움** — 아래 「입고 후기」 참고           |
| ④     | 채움 민가 2종     | `props/raw/decor/house-d.glb` · `house-e.glb`                                                                    | 3종으로 32채. 한 블록에 같은 집이 두세 번 나온다                    |
| ⑤     | 구역 축대 토막    | `props/raw/decor/terrace-bank.glb`                                                                               | 코드로 그린 돌쌓기라 줄눈이 반듯하다. **급하지 않음**               |
| ~~⑥~~ | ~~공방 소품 6종~~ | ✅ 2026-08-27 입고                                                                                               | 6종 전부 배치 완료 — 합 3.6MB, `AtelierInterior` 폴백 구조          |
| ~~⑦~~ | ~~호수 5종~~      | ✅ 2026-08-28 입고 — `props/lake/` 5종                                                                           | 실제 구현은 계획과 다르다 — 아래 「⑦ 입고 후기」 참고               |

> 캐릭터 **4종**은 여기 안 적는다 — 프롬프트가 이미
> [`NPC_CHARACTER_PROMPTS.md`](NPC_CHARACTER_PROMPTS.md) 에 종별로 다 있다.
> 아래 「캐릭터 — 남은 4종」에 목록만 둔다.

---

## 넣는 법

```bash
public/models/buildings/raw/<건물id>.glb        # 건물 — 파일명 = 건물 id
public/models/props/raw/<카테고리>/<이름>.glb   # 장식물
npm run optimize
```

**파일명이 곧 연결이다.** 건물은 `optimize` 가 끝나면서
`src/data/buildingModels.json` 을 다시 써 자동으로 물려 준다. 장식물도 아래 이름
그대로면 배치 코드에 한 줄만 더하면 선다.

두 가지만 조심:

- **폴더가 최적화 강도와 그림자 규칙을 정한다** (`decor` / `nature` / `signs` / `ground`).
  아무 데나 넣으면 안 된다 — `scripts/optimize-glb.mjs` 의 `passesFor`,
  `InstancedProps.tsx` 의 `shadowRole`.
- **새 카테고리 폴더를 만들면 그 안에 `raw/` 도 만들 것.** `raw/` 가 없으면 optimize 가
  조용히 건너뛴다. (`environment/statue.glb` 가 그래서 혼자 89MB 를 먹고 있었다.)

Meshy 설정 — 건물: Art Style `Stylized` · Topology `Quad` · Polycount `Low ~ Medium` ·
Texture `On`(간판 글자가 텍스처로 구워져야 한다) · Symmetry `Auto`.
장식물: `Image to 3D` · Topology `Triangle` · Polycount `Low (~5k)` · Rigging 안 씀.

공통 규격: GLB(텍스처 포함) · Y-up · **원점은 바닥 중심** · 정면이 **+Z** ·
크기는 신경 쓰지 말 것(Meshy 가 긴 변을 1.9 로 정규화하고 코드가 다시 맞춘다).
**비율은 지킬 것** — 바닥면 대각선으로 배율을 잡으므로 납작하게 그리면 그만큼 낮아진다.

---

## 프롬프트 조립 규칙 — 아래 블록들이 왜 그렇게 생겼나

아래 다섯 블록은 **그대로 복사해서 이미지 생성 AI 에 넣으면 되게** 조립해 뒀다.
직접 새 프롬프트를 쓸 때도 이 순서를 지킨다:

```
프리픽스(A 입체물 / B 평면물 / 건물용) + 본문 + 인물 대비 크기 + 화풍 앵커 + 삼각형 꼬리말
                                                            ↑ 네거티브는 따로 칸에 넣는다
```

- **인물 대비 크기를 반드시 넣는다** (`about waist height to a person` 꼴).
  Meshy 는 긴 변을 1.9 로 정규화하므로 **이미지 안의 비율감이 유일한 크기 정보**다.
  기존 44종 본문이 전부 이 말로 끝나는 게 그래서다. 기준표는
  [`MESHY_PROP_PROMPTS.md` §4](MESHY_PROP_PROMPTS.md) (캐릭터 키 = 1.0).
- **화풍 앵커**(`Ghibli-like storybook game art, soft painterly textures, muted natural colors`)를
  빼지 않는다. 지금 마을에 서 있는 다리·민가·아치가 전부 이 말로 뽑혔다 —
  새로 뽑는 게 **그 옆에 서야** 하므로 같은 말을 써야 톤이 맞는다.
- **네거티브는 아래 「네거티브」 칸**에서 골라 쓴다: 글자가 없는 것은 장식물용,
  간판 글자가 있는 건물은 건물용.

### 프리픽스를 일부러 바꾼 곳 둘 (그대로 쓸 것)

| 어디          | 무엇을                                       | 왜                                                                                                                              |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `bridge-arch` | `front three-quarter view` → **`side view`** | 아치가 아래로 뚫린 게 보여야 다리다. 3/4 뷰면 아치 구멍이 안 보인다                                                             |
| 평면물 2종    | 프리픽스 B 에서 `square tile shape` 만 뺌    | 수련·징검다리는 사각 타일이 아니다. **60° 부감**과 **가장자리 두께** 문구는 그대로 둔다 — 이 둘이 종잇장 폴리곤을 막는 핵심이다 |

---

## ①·②·③ 입고 후기 (2026-08-27) — 다음에 또 뽑을 때 알아야 할 것

여섯 파일이 한꺼번에 들어와 전부 배치됐다(지식 서고 · 부들갈대 · 수련 · 징검돌 ·
등불 아치다리 · 담쟁이 돌담). 프롬프트 원문은 `git log -p` 로 이 문서의 지난 판을
보면 된다. 실제로 겪은 함정 셋:

- **아치 다리는 판이 넓게 나왔다(X:Z = 1.9:1.5).** 균일 배율로는 길이를 맞추면
  폭 4유닛(물을 덮는 판때기), 폭을 맞추면 길이 2.5(물길도 못 건넌다). 결국
  **원본 GLB 의 Z 를 0.55 로 눌러 굽고**(정점 + 노멀 역전치) m 4.6 으로 잡았다 —
  길이 5.56 · 폭 2.42 · 상판 1.42 로 bridge-stone(5.12 · 1.27 · 1.59)과 나란히 선다.
  다리를 또 뽑는다면 프롬프트에서부터 **좁고 긴 판**을 강하게 요구할 것.
- **상판 높이가 곧 정렬이다.** 다리 배율은 길이가 아니라 **상판 꼭대기가 구역 단
  (1.1)을 넘는가**로 정해진다. bridge-stone 의 m=5.0 도 사실 그 역산값이었다.
- **담쟁이 돌담은 wall-low 를 대체하지 못했다.** 잎 UV 심 때문에 simplify 바닥이
  2,378(오차 0.1 에서도)이라 117토막 = +28만 삼각형. `wall-ivy` 라는 별도 종류로
  남북 대문 어귀 5토막만 세웠고, 나머지 담장은 여전히 코드가 굽는 24삼각형 상자다.
  손그림 담장으로 전면 교체하려면 **토막당 1천 삼각형 이하**가 나와야 한다.

물풀 배치는 `generate-decor-layout.mjs` ⑭-c 절: 갈대 16+해자 10 · 수련 12 ·
징검돌 4, 전부 상한이 박혀 있다(개당 1.9~2.4천 삼각형이라 상한이 곧 예산이다).
물풀은 `nearLandmark` 로 거르면 안 된다 — 물길 전체에 금지 원이 깔려 있어
전멸한다. 다리 좌표만 콕 집어 피한다(`nearBridgePt`).

---

## ④ `house-d.glb` · `house-e.glb` — 채움 민가 2종

받은 세 채와 **같은 2층·같은 눈높이.** 지붕 색과 평면 모양만 다르게.
(6종이 되면 한 블록 안에서 거의 안 겹친다.)

```
3D rendered miniature fairytale village prop, stylized low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures, warm golden-hour
sunset lighting with soft ambient shadows, cozy storybook mood,
front three-quarter view at eye level, entire building fully visible and
centered in frame, plain flat light grey studio background,
isolated single object, clean product shot, no ground plane, no cast shadow,
a small two-storey fantasy village cottage, blue slate roof, white plaster
walls with dark timber trim, narrow tall footprint, warm glowing windows,
wooden front door, small chimney, flower box under one window, about three
and a half times a person's height,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
low poly game asset, under 8000 triangles
```

- `house-e` 는 한 줄만 바꾼다: `red clay tile roof, half-timbered walls, squarish footprint`
- 여유가 되면 `house-f` 도: `purple tile roof, grey stone walls, with one small attached tower`

> ⚠️ **예전에 받은 `Blue_Slate_Cottage`·`Hearthside_Cottage` 는 못 쓴다** —
> 이미 들어와 있는 `house-a`·`house-b` 와 **바이트 단위로 같은 파일**이었다.
> 반드시 **다른 그림으로 새로** 뽑아야 한다.

---

## ⑤ `terrace-bank.glb` — 구역 축대 토막 (급하지 않음)

구역 단의 옆구리를 지금은 `VillageScene.tsx` 의 `TerraceBanks` 가 코드로 그린다
(세 마디 단면 + `src/lib/terraceBank.ts` 의 런타임 돌쌓기 텍스처). **돌아는 가지만
손그림이 아니다** — 줄눈이 반듯한 격자라 판석·건물의 손맛과 다르다.

**규격이 예전 요청과 달라졌다.** 구역 단이 사각형이 아니라 **원반 섬**이 되면서
축대가 원둘레를 0.9유닛 마디로 돈다. 그래서:

- **모서리 조각(`terrace-bank-corner`)은 이제 필요 없다.** 곡률은 각도로 잇는다
- 토막 폭은 **1.0 안팎**, 높이 1.1(`TERRACE_STEP`). 좌우 끝면이 평평해야 이어 붙는다
- 여섯 섬 둘레에 **200토막 넘게** 깔린다 → **1,200 삼각형 이하가 절대 조건**
- **잔디를 붙이지 말 것.** 벽면만. 윗면은 우리 판석이 덮는다
- **울타리도 붙이지 말 것.** 그건 `wall-low` 가 단 위에 따로 선다
- 발치 지대석과 꼭대기 갓돌이 **좌우로 관통**해야 토막끼리 선이 이어진다

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
hand-painted matte textures with flat color blocks, warm golden-hour sunset
lighting, cozy storybook mood, front view at eye level, entire object fully
visible and centered in frame, plain flat light grey studio background,
isolated single object, no ground plane, no cast shadow,
a single straight segment of a stylized stone retaining wall for a raised
garden terrace, one module of a long repeating wall, flat square ends on both
left and right so segments tile seamlessly with no gap, wall face only with
NO grass or soil on top and NO fence, pale warm grey cut stone blocks in
staggered courses, a projecting plinth course at the bottom and a flat
overhanging capstone running straight across the top, green moss and small
ivy at the base, the module slightly taller than it is wide and about one and
a half times a person's height,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
VERY LOW POLY, flat shaded, minimal geometric detail, no separate small props,
under 1200 triangles
```

> 들어오면 `TerraceBanks` 의 코드 지오메트리를 이 조각 늘어놓기로 바꾸고,
> 단면 상수(`PLINTH_OUT`/`CAP_OUT`)와 `terraceBank.ts` 를 지운다.
> 높이는 코드가 `TERRACE_STEP` 에 맞춰 다시 스케일하므로 신경 쓰지 않아도 된다.

---

## ⑥ 의뢰 공방 소품 6종 (2026-08-27) — ✅ 입고 완료

> 여섯 점 모두 받았고 `AtelierInterior` 에 폴백 구조로 배치됐다 (optimize 후
> 합 3.6MB, `atelier` 텍스처 예산 1024 신설). 아래 프롬프트는 재발주용 기록.

공방 캐릭터 5종이 진짜 GLB 몸으로 서면서(합 1.7MB) `AtelierInterior` 의
"GLB 0개" 원칙은 이미 "가볍게만"으로 완화됐다. 다음 차례는 가구다 —
접수대·작업대 4종·랜턴이 아직 상자·원기둥이라, 진짜 몸을 가진 식구들 옆에서
가구만 도형 티가 난다. **방 껍데기(바닥·벽·천장·계단)는 절차 유지** —
방 치수에 딱 맞춘 지오메트리라 GLB 로 바꾸면 이음새 관리만 는다.

| 파일명 (`props/raw/atelier/`) | 무엇                 | 실물 기준(방 축척 1유닛≈1.4m)     |
| ----------------------------- | -------------------- | --------------------------------- |
| `reception-desk.glb`          | 접수대               | 길이 4.8m · 높이 1.6m (가슴 높이) |
| `workbench-planner.glb`       | 기획 작업대+핀보드   | 책상 3.7m, 보드 상단 2.3m         |
| `workbench-designer.glb`      | 디자인 작업대        | 3.7m · 허리 높이                  |
| `workbench-frontend.glb`      | 프론트 작업대+모니터 | 3.7m · 화면이 가슴 높이           |
| `server-rack.glb`             | 백엔드 서버 캐비닛   | 높이 2.7m (사람 1.6배)            |
| `wall-lantern.glb`            | 벽걸이 랜턴 ×3       | 등롱 0.4m (한 손 크기)            |

**마을 소품과 다른 점 넷** (넣기 전에 알 것):

1. **새 카테고리 폴더 `atelier/` 를 만들고 그 안에 `raw/` 도 만들 것.** 없으면
   optimize 가 조용히 건너뛴다 (「넣는 법」의 함정 그대로).
2. **텍스처는 1024 를 유지해야 한다.** 실내는 카메라가 1~3유닛 거리라 props 기본
   예산(512)으로 줄이면 뭉개진다. `scripts/optimize_textures.py` BUDGETS 에
   `atelier: 1024` 를 추가하는 건 코드 쪽 몫 — 파일이 들어오면 같이 처리한다.
3. **발광부는 에셋에 넣지 않는다.** 모니터 화면(짙은 남색 무지), 서버 표시등(꺼진
   점), 랜턴 유리(emissive 재질만)로 뽑고, 실제 빛·화면 글로우는 지금처럼
   `AtelierInterior` 코드가 GLB 위에 겹쳐 얹는다 (마을 가로등과 같은 규칙).
4. **배치는 수동이다.** `generate-decor-layout.mjs` 를 안 탄다 — `AtelierInterior`
   의 `Workbench`/`Lantern`/접수대 절차 지오메트리를 GLB+폴백으로 바꾸는 코드
   작업이 따라온다 (캐릭터의 DollBody 폴백과 같은 구조).

프롬프트 6종은 조립 규칙(프리픽스 A + 본문 + 인물 대비 크기 + 화풍 앵커 +
삼각형 꼬리말) 그대로, **복붙용 완성본**이다. 네거티브는 장식물용 그대로.
방 팔레트에 맞춰 전부 `dark walnut wood + warm golden trim` 으로 통일했다
(마을의 honey-brown 보다 어둡다 — 지하 방의 WOOD `#4a3220`·GOLD `#e2c078`).

#### ⑥-1 `reception-desk.glb` — 접수대

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
a grand fairytale workshop reception counter, one long straight wooden counter
with a panelled front and a slightly overhanging polished top, dark walnut wood
with a warm golden trim band running along the top edge, small carved rounded
details on the two corner posts, a rolled parchment and a small ink pot resting
on the top, about chest height to a person and long enough for three people to
stand behind,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
low poly game asset, under 8000 triangles
```

#### ⑥-2 `workbench-planner.glb` — 기획 작업대 (핀보드)

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
a fairytale planner's workbench, a sturdy wooden desk with a large framed cork
pin-board standing upright along its back edge, a few small blank sticky notes
in soft yellow and green pinned to the board, rolled paper plans and a small ink
pot on the desk, dark walnut wood with a warm golden trim line, the desk about
waist height and the board rising to head height of a person,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
low poly game asset, under 8000 triangles
```

#### ⑥-3 `workbench-designer.glb` — 디자인 작업대 (색 견본)

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
a fairytale designer's workbench, a sturdy wooden desk topped with a neat row of
fanned-out color swatch cards in soft purple orange green and cream, a tilted
drawing board leaning at the back edge holding a blank cream sketch sheet, a
small jar of round brushes, dark walnut wood with a warm golden trim line,
about waist height to a person,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
low poly game asset, under 8000 triangles
```

#### ⑥-4 `workbench-frontend.glb` — 프론트 작업대 (모니터 2대)

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
a fairytale tinkerer's workbench, a sturdy wooden desk with two chunky rounded
wooden-framed monitor screens standing side by side and angled slightly inward,
both screens plain dark navy blue and switched off, a small wooden keyboard
tray at the front, dark walnut wood with a warm golden trim line and small
brass corner fittings, the desk about waist height with the screens at chest
height of a person,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
low poly game asset, under 8000 triangles
```

#### ⑥-5 `server-rack.glb` — 백엔드 서버 캐비닛

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
a fairytale arcane server cabinet, one tall narrow wooden cabinet with four
stacked machine bays visible on its front face, each bay a dark navy panel with
a row of small round unlit indicator dots, small brass pipe fittings and rivets
along the sides, dark walnut wood frame with a warm golden trim line, standing
flat on the floor, slightly taller than a person,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
low poly game asset, under 8000 triangles
```

#### ⑥-6 `wall-lantern.glb` — 벽걸이 랜턴

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
a small fairytale hanging wall lantern, a four-sided amber glass lantern box
with warm glowing amber emissive glass panels, a tiny pointed dark wooden roof
cap on top, hanging from a short straight dark wooden ceiling rod by a small
ring, dark walnut wood and small brass details, the lantern box small enough to
be held in one hand,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
low poly game asset, under 8000 triangles
```

---

## ⑦ 호수를 채우는 것 — 5종

> ### ⑦ 입고 후기 (2026-08-28) — 계획과 달라진 것
>
> 5종 전부 입고됐지만 **경로도 배치 방식도 아래 계획과 다르다**:
>
> - 파일은 `props/raw/lake/` → `props/lake/` 5종: `lake-rowboat` · `lake-swan` ·
>   `lake-seaplane` · `lake-lantern-float`(부표 등불) · `lake-lantern-dock`(잔교+등불).
> - **`generate-decor-layout.mjs` 의 `onWater` 를 안 만들었다.** 배·백조·물등불은
>   정적 배치가 아니라 **물길을 따라 떠다녀야** 해서(사용자 요청) 전용 컴포넌트
>   `LakeProps.tsx` 가 맡는다 — 좌표를 데이터에 굽지 않고 모듈 로드 때
>   `isWater`/`shoreDistAt` 로 떠다니는 고리·정박지·물가 자리를 계산한다.
> - 텍스처는 `lake` 전용 반 칸 예산(baseColor 256) — 512 로 넣었더니 전체 VRAM 이
>   342/340MB 로 예산을 넘겼다 (`optimize_textures.py BUDGETS` · `textureGroupFor`).
> - 흘수선은 계획대로 배치(y)에서 맞췄다. Meshy 원점이 bbox **중앙**이라
>   `y = 수면 − 흘수 − min.y × scale`. 흘수는 **반드시 양수**(물결 골 −0.015 에서도
>   keel 이 물속에 남게) — 수면 위로 올리면 공중 부양으로 보인다.
> - **소품마다 겹치지 않는 전용 물을 배정한다** (같은 고리 공유 금지 — 추월 때
>   서로 관통했다): 배는 다리 사이 깊은 구간 왕복(`BRIDGE_CELLS` 반경 2.0 제외,
>   복귀는 머리 안 돌리고 뒤로 노 젓기), 백조는 배 구간을 뺀 자기 구간, 물등불은
>   각자 소용돌이, 수상기는 정박. 다리 교대 석재는 `shoreDistAt` 에 안 잡힌다 —
>   "배가 벽을 파고듦"의 벽이 그거였다.

### 왜 — 물가는 채워졌는데 **수면**이 비어 있다

②(부들·수련·징검돌)가 들어가면서 물**가**는 채워졌다. 그런데 물 자체는 그대로다.

| 확인한 것               | 수치                                         |
| ----------------------- | -------------------------------------------- |
| 석호 껍질               | r 28.2~37.0 (22각형)                         |
| 광장 섬 / 구역 섬 6개   | r 9.0 / r 7.6~11.6                           |
| 해자 타원               | a 42 · b 38 (리본 반폭 1.23)                 |
| 물가에 자라는 것        | 갈대 26 · 수련 12 · 징검돌 4 ✅ (2026-08-27) |
| **수면에 떠 있는 물건** | **0개** — 다리 14·폭포 3 말고는 없다         |
| **물 위 불빛(밤)**      | **0개**                                      |

마을에서 면적이 제일 넓은 게 물인데 그 위가 비어 있다. 이 다섯이 **수면**을 만든다.

### 톤 — 다섯 개 모두 지킬 것

- **맨 금속을 부르지 말 것.** 공통 네거티브에 `metallic, chrome` 이 들어 있다.
  놋쇠·알루미늄이라고 쓰면 프롬프트가 네거티브와 싸운다. 금속으로 보여야 하는 것은
  **칠한 쇠(painted iron)** 로 적는다
- 나무는 **풍화된 판자**(`weathered planks`) — 이웃인 `bridge-stone`·`market-stall`·
  `well` 이 전부 그 어휘로 뽑혔다
- 색은 컨셉 팔레트 그대로: 따뜻한 갈색 · 크림 · 이끼 초록 · 바랜 청록
  (`src/data/villageColors.json`, 배경 컨셉에서 뽑은 28색)
- **등불은 따뜻한 노랑 하나뿐.** 마을 조명이 전부 그 색이다

### 배치 — 다섯 개 공통

- 전부 `KIT` 에 한 줄 + **`onWater: true`** (물 판정을 빠져나가야 물 위에 선다).
  심는 절은 물가 소품과 같은 `generate-decor-layout.mjs` ⑭-c 다
- **물에 뜨는 것(나룻배·부표·백조·수상기)은 흘수선을 배치에서 맞춘다.**
  GLB 원점 규칙(바닥 중심)은 그대로 두고, 배치 코드에서 y 를 내려 선체 아래를
  수면에 잠근다 — 모델을 흘수선 기준으로 뽑으면 다른 규칙과 어긋난다
- **잔교만 물가 턱 예외**가 필요하다. `nearShore` 금지에 그대로 걸리면 조용히 하나도
  안 놓인다(섬 테두리 울타리 50토막이 이미 그렇게 사라진 적 있다).
  계단·난간과 같은 예외 목록에 넣는다
- **개수는 예산이 정한다.** ②에서 이미 겪었듯 상한은 미관이 아니라 삼각형·텍스처다.
  아래 개수는 목표치이고, 넣고 나서 F8 로 확인해 줄인다

---

### 7-a. `decor/rowboat-moored.glb` — 매인 나룻배 · 3~5척

실물 길이 3.5m(1.65유닛) · 폭 1.2m. 물가에 밧줄로 묶어 둔다. **제일 싸고 효과가 크다** —
수면에 뜬 것이 하나만 생겨도 물이 "판"에서 "물"로 읽힌다.

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
a small fairytale wooden rowboat, weathered planks in warm brown with a faded
teal painted stripe along the hull, two simple oars resting inside across the
seats, a coil of rope at the bow, one folded canvas sack and a small wooden
crate in the bottom, gently rounded bow and stern, open on top with two plank
benches, about twice a person's height long and low enough to step into,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
low poly game asset, under 4000 triangles
```

> `KIT`: `"rowboat-moored": {glb: "decor/rowboat-moored.glb", h: <실측>, m: 3.5}`
> 뱃머리가 **+Z**. 물가에 대는 각도는 배치가 물가 법선에서 정한다.

---

### 7-b. `decor/dock-small.glb` — 나루터 잔교 · 4~6곳

실물 길이 4m(1.9유닛) · 폭 1.5m. 물가에서 물 쪽으로 뻗는다. 나룻배·수상기를
**매어 둘 자리**라, 이게 있어야 배가 "떠내려온 것"이 아니라 "여기 사는 것"이 된다.

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
a very small fairytale wooden jetty, a short walkway of weathered warm brown
planks resting on four stubby round posts, two taller mooring posts at the far
end with a coil of rope looped around one, a single hanging lantern with warm
yellow glass on the end post, green moss and a few pebbles where the planks
meet the shore, the deck about twice a person's height long and wide enough
for one person to walk, no water attached,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
low poly game asset, under 4000 triangles
```

> 길이 축이 **+Z** — 배치가 물가 법선에 맞춰 돌려 물 쪽으로 뻗게 한다.
> `KIT`: `"dock-small": {glb: "decor/dock-small.glb", h: <실측>, m: 4.0}`

---

### 7-c. `decor/buoy-lantern.glb` — 등불 부표 · 8~12개

실물 높이 0.8m(0.38유닛). **값에 비해 밤 화면을 가장 크게 바꾸는 물건이다** —
지금 해가 지면 물이 통째로 까맣게 죽는다.

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
a small fairytale floating lantern buoy, a squat rounded wooden float painted
cream and faded teal with a warm brown band, a short post rising from the
middle holding a single glowing lantern with warm yellow glass panes, the
lantern glass is brightly lit and clearly the brightest part of the object,
a small rope loop on the side, gentle wear and moss at the waterline,
about knee to waist height to a person,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
VERY LOW POLY, flat shaded, minimal geometric detail, no separate small props,
under 1500 triangles
```

> ⚠️ **등불이 진짜로 밝아야 살아남는다.** `optimize_textures.py` 는 "보이는 밝기 이상인
> 픽셀 비율"로 판정해 **의미 없는 emissive 를 통째로 지운다**(Meshy 가 발광부가 없어도
> emissive 를 붙여 내보내기 때문). 유리가 흐릿하게 나오면 그 맵이 노이즈로 판정돼
> 지워지고, 밤에 안 켜진다. `frontend` 건물 창문은 실제로 밝아서 유지됐다.
>
> **밤 불빛은 실광원으로 켜지 않는다.** `pointLight` 는 4개로 고정돼 있고
> 개수가 바뀌면 전 재질이 재컴파일된다(`LampPools`). 물 위 불빛은
> emissive + 가산 원반으로 낸다 — 마을 랜턴이 이미 그 방식이다.

---

### 7-d. `nature/swan-pair.glb` — 백조 한 쌍 · 4~6쌍

실물 몸길이 1.2m · 목까지 높이 0.9m. 움직이지 않아도 된다 — 수면에 흰 점 둘이
떠 있는 것만으로 물이 살아 있는 곳이 된다.

```
3D rendered miniature fairytale village prop, stylized very low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures with flat color blocks,
warm golden-hour sunset lighting with soft ambient shadows, cozy storybook mood,
single connected object with simple silhouette,
front three-quarter view at eye level, entire object fully visible and centered
in frame, plain flat light grey studio background, isolated single object,
clean product shot, no ground plane, no cast shadow,
two chubby fairytale swans floating side by side and slightly turned toward
each other, smooth cream white bodies with soft rounded backs, gently curved
necks, small warm orange beaks, wings folded flat against the body with a few
simple feather shapes, no legs visible below the body, the two birds forming
one connected group on a shared base, about knee height to a person,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
VERY LOW POLY, flat shaded, minimal geometric detail, no separate small props,
under 1500 triangles
```

> **다리를 그리지 말 것.** 몸통 아래는 수면에 잠긴다 — 다리가 있으면 물 위에 서 있는
> 새가 된다. 두 마리가 **한 덩어리**여야 인스턴싱 한 번으로 끝난다.
> 폴더는 `nature/` 지만 바람 흔들림은 안 걸린다(`tree-`·`bush-` 로 시작하는 것만).

---

### 7-e. `decor/floatplane.glb` — 수상비행기 · 1대

실물 날개폭 9m(4.3유닛) · 길이 7m. **호수가 비어 보이는 문제와 "큰 비행기 하나"를
한 물건으로 푼다.** 잔교(7-b) 옆에 매어 둔다.

**톤이 이 항목의 전부다.** 은색 알루미늄 여객기는 마을을 깬다 — 이건
**나무 뼈대에 천을 씌워 칠한 옛 비행기**여야 한다. 마을에서 제일 큰 단일 프롭이
되므로 실루엣이 단순해야 한다.

```
3D rendered miniature fairytale village prop, stylized low-poly game asset,
soft rounded chunky shapes, hand-painted matte textures, warm golden-hour
sunset lighting with soft ambient shadows, cozy storybook mood,
front three-quarter view at eye level, entire object fully visible and
centered in frame, plain flat light grey studio background,
isolated single object, clean product shot, no ground plane, no cast shadow,
a charming old fashioned fairytale seaplane resting on two long rounded
pontoon floats, a stubby rounded fuselage of painted wood and canvas in cream
with a faded teal stripe and warm brown trim, one straight high wing above the
cabin held by simple struts, a small two-blade wooden propeller on the round
nose, a single open cockpit with a curved windscreen, round porthole windows
along the side, a small painted number on the tail fin, worn paint and soft
weathering, no bare metal anywhere, the wings about five times a person's
height across, standing alone with no water attached,
Ghibli-like storybook game art, soft painterly textures, muted natural colors,
low poly game asset, under 12000 triangles
```

> 기수가 **+Z**, 날개가 좌우(X). `KIT`: `m` 은 **긴 변 = 날개폭 9.0**.
> 한 대뿐이라 프롭이 아니라 랜드마크로 다뤄도 된다(`island-north`·`windmill` 과 같은 급).
>
> ③ 아치 돌다리에서 겪은 것과 같은 문제가 날 수 있다 — **긴 변으로 정규화되므로
> 날개폭이 기준이 되고 동체·플로트가 납작해질 수 있다.** 구운 뒤 옆에서 한 번 보고,
> 필요하면 ③처럼 원본 축을 눌러 다시 굽는다(「입고 후기」 참고).

---

## 캐릭터 — 남은 4종

프롬프트는 종마다 [`NPC_CHARACTER_PROMPTS.md`](NPC_CHARACTER_PROMPTS.md) 에 있다.
파이프라인이 달라서(이미지 → Meshy → **오토리깅** → `merge-character.mjs`)
여기 옮기지 않는다.

| 어디           | 남은 것                 |
| -------------- | ----------------------- |
| 건물 NPC **4** | 까치·수달·여우·나무늘보 |

- 상시 역할 5종(보더콜리·고양이·염소·아르마딜로·제비)과 공방 5종(개미핥기·
  까마귀·문어·여우원숭이·두더지)은 **입고 완료**(2026-08-26~27). 공방 5종은
  `AtelierInterior` 에 실제로 서서 걸어 다닌다 — GLB-0 원칙은 "가볍게만"으로 완화.
- **숨쉬기 idle 전면 배치 완료**(2026-08-27): 동물 33종 전원에
  `Short Breathe and Look Around` 클립을 `scripts/add-character-clip.mjs` 로 병합.
  전원 idle ← 숨쉬기, 직업 동작은 special(가끔)로. **수달로 보이는 idle 파일이
  하나 먼저 도착했는데**(리포에 몸이 없어 보류) — 수달을 입고하려면 같은 모델의
  **walking / running** 클립까지 받아 폴더째 `merge-character.mjs` 로 병합해야 한다.
- 남은 건물 NPC 4명은 지금 **로봇(`neon-robot-npc`)** 으로 서 있다.
  `npcRoster.ts` 의 `buildingNpcModel` 에 키가 없으면 기본값이 로봇이다.
- `life-timeline` 에는 **거북**이 임시로 서 있다(원래 중앙 광장 몫).
  나무늘보가 들어오면 거북을 광장으로 옮긴다.

---

## 에셋으로는 못 푸는 것

### `wall-low` · `fence-rail` · `terrace-steps` 의 `raw/` 원본이 없다

`scripts/optimize_textures.py` 의 **디라이팅**(에셋마다 다른 구운 조명을 한 수준으로
맞추는 것)은 `raw/` 원본을 읽어 다시 굽는 방식이라, `raw/` 가 없으면 통째로 건너뛴다.
이 셋은 스크립트가 **코드로 굽는** 것이라 원본이 있을 수가 없다 —
담장 117토막·울타리 188토막이 옛 조명을 그대로 달고 있다.

**프롬프트로 풀리는 문제가 아니다.** 둘 중 하나다:

1. 손그림 담장 GLB(`wall-low.glb`)를 새로 받는다 → `raw/` 가 생기며 저절로 풀린다.
   무늬가 단조롭다는 문제도 같이 풀린다. (규격은 ⑤ 축대와 같다: 1,500 이하, 수십 토막)
2. 굽는 스크립트가 만든 텍스처를 `raw/` 에도 같이 써 두게 고친다. 톤만 맞는다.

### 길에 진짜 곡선이 없다

고리가 정사각형이고 모서리만 커브 타일이다. 진짜 곡선은 타일을 버리고 스플라인
리본을 깔아야 하는데, `onRoad(x,z)` 가 격자 조회라 소품·담장·건물 배치 로직을
전부 갈아야 한다. 에셋 문제가 아니다.

---

## 다시 뽑지 말 것 (같은 실수 반복 방지)

| 이미 있는 것                  | 왜 안 쓰나                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `decor/terrace-wall.glb`      | **ㄱ자 모서리** 조각이라 직선 구간에 늘어놓으면 ㄱ자만 되풀이된다. 10,612 삼각형. 지금은 문기둥 14개로만 쓴다 |
| `decor/terrace-slab.glb`      | **사방이 벽인 단 한 칸**이라 이어 붙일 수가 없다. **미사용**                                                  |
| `decor/arch-alt.glb`          | EXPERIENCE 를 두 번 뽑은 중복본. **미사용**                                                                   |
| `Mossy_Cobblestone_Tile` 원본 | GLB 는 안 쓴다 — 그림만 뽑아 삼각형 2개짜리 평면에 입혔다(`make-paving-tile.mjs`)                             |

**뽑고 나서 텍스처를 눈으로 확인할 것.** 글자가 있는 것은 특히.
아치 하나가 "EXPERIENCE" 로 두 번 나온 게 이걸 안 봐서 생긴 일이다.

---

## 삼각형 예산 — 프롬프트 꼬리에 반드시 넣을 말

Meshy 는 그냥 두면 돌덩이 하나를 1만 삼각형으로 뽑고, 벽돌·잎사귀처럼 UV 섬이 많으면
**simplify 가 거의 안 먹는다**(받은 축대벽은 오차를 0.05까지 올려도 10,612 → 8,191 에서
멈췄다). 처음부터 가볍게 뽑는 수밖에 없다.

| 쓰임새                                  | 목표           | 꼬리에 붙일 말                                                                                        |
| --------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| 수십~수백 개 반복 (축대·담장·물가 소품) | **1,500 이하** | `VERY LOW POLY, flat shaded, minimal geometric detail, no separate small props, under 1500 triangles` |
| 열 개 안팎 (민가·다리·아치)             | 8,000 이하     | `low poly game asset, under 8000 triangles`                                                           |
| 한두 개 (건물·랜드마크)                 | 자유           | —                                                                                                     |

텍스처도 예산이 빠듯하다(경고선 340MB). **이미 있는 것을 더 많이 까는 건 인스턴싱이라
텍스처가 공짜**지만, 새 종류는 그만큼 VRAM 을 새로 먹는다.

---

## 네거티브

**장식물·캐릭터용** (글자가 없는 것):

```
photorealistic, realistic, cluttered background, scenery, landscape, multiple
objects, group of items, people, characters, cropped, cut off, extreme
perspective, fisheye, harsh shadows, neon, cyberpunk, glowing sci-fi, metallic,
chrome, dark gloomy, blurry, motion blur, text, letters, watermark
```

**건물·간판용** (글자가 있어야 하므로 `text, letters` 를 뺀다):

```
photorealistic, realistic, cluttered background, scenery, landscape, multiple
buildings, people, characters, cropped, cut off, top-down view, aerial view,
extreme perspective, fisheye, harsh shadows, neon cyberpunk, dark gloomy,
glass skyscraper, modern corporate, blurry, motion blur,
tiny sign, small text, illegible text, unreadable letters, blank signboard
```

---

## 나중에 (있으면 더 좋은 것)

지금도 돌아간다. 급하지 않다. 전부 `props/raw/decor/` (나무 둘만 `nature/`),
**1,500 삼각형 이하**, 위 장식물 프리픽스 + 아래 한 줄 + 네거티브.

| 파일명                 | 무엇                 | 본문                                                                                                                          |
| ---------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `easel.glb`            | 이젤                 | `Wooden artist easel holding a small painted canvas, a paint palette and brushes hanging from one leg`                        |
| `water-mill-small.glb` | 작은 물레방아        | `Small wooden water wheel on a stone footing, half of the wheel below the axle, mossy paddles`                                |
| `stall-awning.glb`     | 천막 노점            | `Small fantasy market stall with a striped red and cream fabric awning on four wooden posts, wooden counter piled with goods` |
| `signpost-arrow.glb`   | 이정표               | `Wooden signpost with three arrow-shaped direction boards pointing different ways, small lantern on top`                      |
| `brazier.glb`          | 화로                 | `Standing iron brazier bowl on three legs with glowing orange embers and small flames`                                        |
| `hedge-round.glb`      | 다듬은 관목          | `Neatly trimmed round topiary bush in a square stone planter`                                                                 |
| `tree-pine-tall.glb`   | 침엽수 → `nature/`   | `Very tall narrow dark green pine tree, single trunk, layered conical foliage`                                                |
| `tree-willow.glb`      | 수양버들 → `nature/` | `Weeping willow tree with long drooping pale green branches`                                                                  |

`easel` 은 컨셉 범례의 테마 소품 중 **유일하게 없는 것**이다.

---

## 배치 코드는 어디에 있나

- **건물** — 파일명이 id 면 자동으로 붙는다. 좌표·크기는 `src/lib/constants.ts` 의 `villageBuildings`
- **장식물** — `scripts/generate-decor-layout.mjs` 의 `KIT` 에 `h`(구운 GLB 높이 **실측**)와
  `m`(실물 미터)을 적는다
- **바닥·길·구역 섬** — `scripts/generate-ground-layout.mjs`
- 고치고 나면:

```bash
node scripts/generate-ground-layout.mjs && node scripts/generate-decor-layout.mjs && npm run check:village
```
