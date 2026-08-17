# 11. 마을 입구 (랜딩) — 프롬프트 팩

> 사이트에 처음 들어왔을 때 뜨는 화면 · `IntroOverlay.tsx` (`AIPortfolioVillage` 의 `showIntro === true`)
> **비대상**: 마을 안 HUD(`VillageHud`) · 프로젝트 방(01~10) · 이력서 모드(`ResumeMode`)
>
> **사용법**: `## C` 의 코드블록 **하나**를 통째로 복사해서 Variant에 붙여넣으세요. 그게 전부입니다.
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.
>
> ⚠️ **01~10과 구조가 다릅니다.** 그쪽은 스크롤 11장짜리 문서라 `PAGE 00~10` 프롬프트가 11개지만,
> 여기는 **스크롤 없는 한 화면**이라 프롬프트도 하나입니다. 쪼개면 색·무드 설명만 11번 반복됩니다.

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 화면의 한 문장

**"문 앞에 랜턴이 걸려 있다. 그리고 마을은 이미 살아서 돌아가고 있다."**

## A-2. 왜 이 메타포인가

01~10은 각자 세계관을 가진 **방**이고, 이 화면은 그 방들로 가는 **입구**다.
입구가 할 일은 방을 흉내내는 게 아니라 **"여긴 들어가 볼 수 있는 곳"임을 알리는 것**이다.

지금까지의 첫 화면은 **부팅 터미널 + 관제 HUD**였다 (모노스페이스 대문자, 사이안 네온, 격자 배경).
그런데 그 뒤에서 돌아가는 건 **랜턴이 켜진 판타지 마을**이다. 첫인상과 실체가 정면으로 어긋났다.
게다가 그 마을을 **어두운 막으로 가리고** 커서 위치에만 구멍을 뚫어 보여줬다 —
**제일 좋은 자산을 제일 열심히 숨기고 있었다.**

이 문서는 그걸 뒤집는다. **막을 걷고, 마을을 주인공으로 올리고, UI를 그 마을에 걸린 물건으로 만든다.**

## A-3. ⭐ 가장 중요한 원칙 — 배경은 그림이 아니라 **지금 실행 중인 씬**이다

프로젝트 방의 배경은 CSS로 그린 무대지만, 이 화면의 배경은 **R3F로 실시간 렌더링되는 3D 마을**이다.
랜턴이 실제로 깜빡이고, 물이 출렁이고, NPC가 걸어다니고, 접속 시각에 따라 하늘이 바뀐다.
**가짜 마을 일러스트를 깔면 이 화면의 유일한 무기가 그 자리에서 사라진다.**

| 전달할 실체             | 그걸 실어나르는 것                                        |
| ----------------------- | --------------------------------------------------------- |
| 탐험하는 포트폴리오다   | 화면의 44%가 **조작 가능한 실시간 마을**                  |
| 녹화 영상이 아니다      | 랜턴·물결·NPC가 UI 뒤에서 계속 움직인다                   |
| 규모가 실측이다         | 하단 소식판 `PROJECTS 9 · NPC 32 · 건물 27` = 배열 length |
| 건물 하나 = 섹션 하나   | 마을 위 나무 팻말에 실제 건물 이름                        |
| 뭘 하면 되는지          | 안내 표지판 3장                                           |
| 시간 없는 사람의 탈출구 | "빠른 이력서 보기"가 입장 버튼과 **같은 크기·같은 위계**  |
| 조작은 마우스다         | 커서가 랜턴이 되어 마을을 비춘다                          |

## A-4. 마을의 설계 결정 ↔ 입구에서의 재현

| 3D 마을에서 내린 결정                 | 이 화면에서의 재현                                     |
| ------------------------------------- | ------------------------------------------------------ |
| 밤 조명을 랜턴 웅덩이로 깔았다        | UI 액센트가 **그 랜턴과 같은 `#ff9d38`**               |
| 건물마다 나무 간판을 세웠다           | 타이틀·버튼·카드가 전부 **나무 현판/명판**             |
| 사이안 네온을 마을에서 걷어냈다       | 입구에도 사이안 **0곳**                                |
| 밤엔 그림자를 끄고 AO로 형태를 살렸다 | 현판도 외곽선이 아니라 **깎인 면(bevel)** 으로 형태    |
| 마을은 걸어 다닐 수 있다              | 입장이 페이드아웃이 아니라 **문이 열리고 내려앉는 것** |

## A-5. 첫 8초

```
주목  ╭──────╮ 랜턴 점등 (t=1.2)
     ╱        ╰─╮ 현판 각인 (t=2.0~4.2)
  t=0            ╰──╮ 표지판 (t=4.6)
  암전               ╰──────── 정지 · 마을만 계속 움직임
정보  0 ─── 이름 ─── 한 문장 ─── 3단계 ─── 두 갈래 길
밝기  0% ─── 마을 40% ─── 마을 100% (막이 완전히 걷힘)
```

**로딩을 숨기지 않고 연출로 쓴다.** 30MB짜리 마을이 뜨는 동안 방문자는 랜턴이 하나씩 켜지는 걸 본다.
(용량·최적화 근거는 `docs/VILLAGE_OVERHAUL_REPORT.md`)

## A-6. 명장면 2개

**① t=0 → t=2.0 · 마을에 불이 켜진다**
완전한 암전 → 마을 실루엣이 희미하게 → 랜턴이 왼쪽에서 오른쪽으로 순차 점등 →
마지막 랜턴이 켜지는 순간 왼쪽 나무 현판에도 불이 들어오며 이름이 금박으로 각인된다.

**② 입장 · 문이 열린다**
버튼을 누르면 UI가 사라지는 게 아니라 현판과 표지판이 **양옆으로 밀려나고(문처럼)**,
동시에 왼쪽 숲 그늘이 걷히며 카메라가 마을 쪽으로 **한 뼘 내려앉는다.**
방문자는 "버튼을 눌렀다"가 아니라 **"들어갔다"** 고 느낀다.

## A-7. 절대 금지

- **제어권 박탈 0회.** 스크롤 잠금·커서 탈취·강제 대기 금지. 입구는 막으면 안 된다
- **건너뛰기 상시 가능.** 진입 연출 중 아무 키·아무 클릭이면 즉시 완료 상태
- **지어낸 수치 0개.** "VISITORS 128" 같은 건 읽을 실데이터가 없으면 **아예 넣지 않는다**
- **가짜 마을 일러스트로 배경 대체 금지**
- 전체 화면 플래시·스트로브 금지. 랜턴 깜빡임은 opacity 0.70~1.00 완만한 사인파
- 사운드 자동 재생 금지. 첫 상호작용 이후에만, 음소거 토글 상시 노출, 볼륨 상한 0.15
- 마우스 좌표를 **React state 에 저장 금지** → CSS 변수 + `requestAnimationFrame`

---

# B. 디자인 토큰 (참고용 — 프롬프트에 이미 포함됨)

실제 `src/app/globals.css` 의 `:root` 값과 일치해야 합니다.

| 토큰            | 값                                                               | 용도                               |
| --------------- | ---------------------------------------------------------------- | ---------------------------------- |
| `--v-night`     | `#0b1626`                                                        | 패널 바탕 · 그늘                   |
| `--v-lantern`   | `#ff9d38`                                                        | 주 액센트 (3D `LampPools` 와 동일) |
| `--v-gold`      | `#e2c078`                                                        | 간판 금박 · 제목 · 홈선            |
| `--v-wood`      | `#7a5a38`                                                        | 프레임 테두리                      |
| `--v-moon`      | `#a9bdd6`                                                        | 보조 텍스트 (사이안 대체)          |
| `--v-paper`     | `#f3e6c8`                                                        | 밝은 텍스트                        |
| 나무 결         | `#64432a → #422c1a → #291908` (168deg)                           | `.v-wood`                          |
| 금박 각인       | `#fff3d2 → #f6d68d → #d4a044 → #f8e4b4` + `background-clip:text` | `.v-emboss`                        |
| 리본 파랑       | `#33629b → #1f4270 → #16304f`                                    | 부제 배너                          |
| 리본 초·보      | `#4e7d46→#2d4c29` / `#6b4f96→#402e5e`                            | STEP 2 / 3                         |
| 디스플레이 서체 | **Gowun Batang** (`--font-display`, next/font)                   | 간판·제목 전용                     |
| 이징            | `cubic-bezier(0.22,1,0.36,1)`, 0.4~1.4s                          | 무겁고 부드럽게                    |

### 이미 있는 CSS 클래스 (재사용 · 새로 만들지 말 것)

`.v-wood` 나무결+베벨 · `.v-wood-inset` 안쪽 금색 홈선 · `.v-emboss` 금박 양각 ·
`.v-ribbon` 제비꼬리 clip-path · `.v-corner` 모서리 금속 13×13 · `.v-serif` 간판 서체만 ·
`.v-lantern-glow` 3.6s 깜빡임 · `.scene-label` 3D 위 건물 팻말

> 💡 색을 바꿔야 하는 자리엔 `.v-panel-title` 대신 **`.v-serif`** 를 쓰세요.
> `globals.css` 가 Tailwind 유틸리티보다 뒤에 로드돼 `text-*` 를 이깁니다.

---

# C. 프롬프트 (이것 하나만 복사)

```text
Build a full-screen LANDING OVERLAY for a 3D village portfolio. One screen, no scroll.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== CRITICAL CONTEXT ===
A live React Three Fiber village renders BEHIND this overlay: warm lanterns, a fountain
plaza, water channels, wooden bridges, 27 buildings, 32 NPCs walking. Sky and lighting
follow the real clock (밤 / 새벽 / 노을 / 낮).
THE VILLAGE IS THE HERO. This overlay is a set of objects hanging in front of it.
Never replace it with a static illustration, never blur it, never cover it uniformly.

=== WHAT THIS SCREEN MUST DELIVER (in 4 seconds) ===
1. This portfolio is a place you enter, not a page you scroll.
2. The village is genuinely running right now - not a video, not a render.
3. Two clear ways forward: walk in, or read the one-page resume.

=== MOOD ===
Warm fantasy night at a village gate. Hand-carved wood, gold leaf, ivy, hanging
lanterns. Storybook and mysterious but WELCOMING - the door is open.
NO cyberpunk, NO HUD, NO dashboard, NO terminal, NO grid, NO scanlines, NO glitch.

=== DESIGN TOKENS (use exactly) ===
night #0b1626 | lantern #ff9d38 | gold #e2c078 | wood #7a5a38
moon #a9bdd6 | paper #f3e6c8 | body #d6cdb4 | caption #a99e84
WOOD FILL (every wooden object uses this):
  repeating-linear-gradient(97deg, rgba(0,0,0,.08) 0 3px, transparent 3px 9px,
                            rgba(255,226,180,.03) 9px 11px, transparent 11px 19px),
  radial-gradient(118% 100% at 50% 38%, rgba(0,0,0,0) 28%, rgba(0,0,0,.34) 100%),
  linear-gradient(168deg,#64432a 0%,#422c1a 48%,#291908 100%)
  border 1px rgba(18,11,4,.9), radius 14px
  shadow: inset 0 2px 0 rgba(255,214,150,.22), inset 0 -5px 12px rgba(0,0,0,.55),
          inset 7px 0 16px rgba(0,0,0,.26), inset -7px 0 16px rgba(0,0,0,.26),
          0 20px 46px rgba(0,0,0,.55)
GOLD ENGRAVE (for headings and button labels):
  background: linear-gradient(178deg,#fff3d2 0%,#f6d68d 34%,#d4a044 63%,#f8e4b4 100%)
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter: drop-shadow(0 1px 0 rgba(255,255,255,.22)) drop-shadow(0 3px 4px rgba(0,0,0,.62))
  ALSO set a solid fallback color #f2dfae on the same element so the text never
  renders invisible if the gradient is dropped.
SWALLOWTAIL RIBBON shape:
  clip-path: polygon(0 0,100% 0,calc(100% - 18px) 50%,100% 100%,0 100%,18px 50%)
  clip-path also clips box-shadow, so wrap each ribbon in a parent with
  filter: drop-shadow(...) to get its shadow back.
display font "Gowun Batang", serif | body font Inter, system sans-serif
easing cubic-bezier(0.22,1,0.36,1)

=== THE SHADE (most important layout rule) ===
Two non-interactive layers between the canvas and the content:
  A) linear-gradient(100deg, rgba(5,10,20,0.96) 0%, rgba(5,10,20,0.93) 30%,
       rgba(5,10,20,0.70) 47%, rgba(5,10,20,0.28) 62%, rgba(5,10,20,0.10) 78%,
       rgba(5,10,20,0.30) 100%)
     Reads as forest shadow on the left where the text lives.
  B) linear-gradient(180deg, rgba(4,9,18,0.80) 0%, transparent 15%,
       transparent 74%, rgba(4,9,18,0.88) 100%)
     Just enough to seat the top clock and the bottom strip.
NEVER a uniform scrim. NEVER a spotlight mask with a hole in it.
The right ~40% of the screen must stay plainly, continuously readable as a village.

=== LAYOUT (desktop >= 1024px) ===
Full viewport, position absolute inset-0, above the canvas.
A 65px site header sits at the top AND the page can scroll ~65px. Therefore:
  - the stage gets padding-top 65px and padding-bottom 48px
  - the bottom status strip must be position:FIXED, not absolute, or it lands below
    the fold and is invisible

LEFT COLUMN - width 56%, padding-left 80px, vertically centered, in this order:

(1) EMBLEM + RIBBON ROW
    Left: 44px compass-rose badge, inline SVG - rounded square fill #3d2a16 stroke
    #b8892f 1.6px, inner circle #1c2c44, 8-point star #e6c47c with the north point
    highlighted #fdf1cd, center dot #3d2a16.
    Right: wooden swallowtail ribbon, padding 6px 24px.
    VERBATIM: "DEVELOPER'S CITY · 2026"
    11px, font-black, letter-spacing 0.26em, color #e2c078.

(2) TITLE PLAQUE — the centerpiece
    Wooden panel, padding 20px 32px (24px 44px on desktop).
    Engraved inner groove: ::before, inset 8px, radius 8px,
      border 1px rgba(226,192,120,.32),
      box-shadow inset 0 1px 0 rgba(255,232,180,.14), 0 1px 0 rgba(0,0,0,.45)
    Four 13x13 metal corner fittings, inset 10px:
      linear-gradient(135deg,#f0d69a,#a97f36 55%,#6d4c1c), radius 3px,
      box-shadow 0 1px 2px rgba(0,0,0,.6)
    Heading <h1>, two lines, Gowun Batang, gold engrave, line-height 1.22:
      VERBATIM line 1: "정재훈의 3D"
      VERBATIM line 2: "포트폴리오 마을"
      font-size: clamp(1.72rem, min(3.1vw, 5vh), 2.95rem)
      The min(vw,vh) term is MANDATORY. With a fixed size, on a 1280x720 screen the
      column grows taller than the viewport and the plaque clips behind the header.
    DECORATION (inline SVG, absolutely positioned, pointer-events none, aria-hidden):
      * Ivy sprig top-left, ~112px wide, overlapping the corner: stem stroke #4b6634
        3px round-cap along "M6 8 C 34 14 58 32 74 56 C 84 70 98 76 116 78" in a
        120x84 viewBox; 5 leaves along it (leaf path
        "M0 0 C 7 -11 22 -13 27 -2 C 22 9 7 11 0 0 Z", fill gradient #83a857->#3c5a29,
        each rotated/scaled differently); 2 tiny pale-pink blossoms with warm centers.
      * Same sprig mirrored scaleX(-1) at bottom-right, ~96px wide.
      * Hanging lantern on the LEFT EDGE, ~74px tall, 34x76 viewBox: a warm glow
        circle r=15 fill #ff9d38 opacity .20 BEHIND everything, a 2px chain, a
        trapezoid cap #5b4526, body rect #3a2a16, inner glass rect #ffbe72, bottom
        trapezoid, small finial. Glow circle and glass both breathe on a 3.6s cycle:
        opacity 0.82 -> 1.0 (38%) -> 0.70 (64%) -> 0.82. Never below 0.7, never strobe.
        (The 80px left padding on the column exists so this lantern hangs inside the
        viewport instead of being cut off at the screen edge.)

(3) DISCIPLINE BANNER
    Swallowtail ribbon, padding 6px 32px, fill
    linear-gradient(180deg,#33629b 0%,#1f4270 58%,#16304f 100%),
    box-shadow inset 0 1px 0 rgba(255,255,255,.18).
    VERBATIM: "Fullstack / 3D / Game / XR"
    Gowun Batang, 15px (18px desktop), letter-spacing 0.12em, color #ecdfba.

(4) BODY COPY - max-width 512px, 13px, line-height 1.7, color #d6cdb4,
    text-shadow 0 2px 6px rgba(0,0,0,.8)
    VERBATIM: "먼저 건물을 클릭해 프로젝트 내부로 들어가거나, NPC에게 프로젝트와
    기술에 대해 질문해보세요. 오늘의 관리자 기록은 마을 조명과 NPC 상태에 반영됩니다."

(5) THREE WOODEN SIGNPOSTS - grid of 3, gap 10px, max-width 576px.
    Each: a colored swallowtail banner nailed across the top (padding 2px 16px,
    label 10px font-black letter-spacing 0.16em color #f0e6cd), then a Gowun Batang
    title 15px #f2dfae, then body 11px line-height 1.5 #bdb094, then a 32px line-art
    icon (stroke currentColor 1.6, round caps, no fill) in #e2c078 at 80%.
      Card 1  banner #3a6ea8->#24466f  "STEP 1"  title "건물 클릭"
              body "클릭하면 바로 프로젝트 전시실로 입장"
              icon: house outline with roof and door + a filled mouse-cursor arrow
                    overlapping its lower-right
      Card 2  banner #4e7d46->#2d4c29  "STEP 2"  title "NPC 질문"
              body "프로젝트·기술·연락처를 대화로 확인"
              icon: hooded figure (shoulders + hood curve + one filled dot for the
                    visible eye) with a speech bubble upper-right containing 2 lines
      Card 3  banner #6b4f96->#402e5e  "STEP 3"  title "Admin 기록"
              body "오늘 활동을 마을 상태로 반영"
              icon: open book with two curved pages and a spine, a quill laid
                    diagonally across the right page
    These are line drawings. NEVER use emoji for these icons.
    The three banner colors must differ - that difference is what makes them read as
    separate steps at a glance.
    Each card tilts toward the cursor: rotateX/rotateY up to 12deg,
    transform-perspective 600, spring stiffness 200 damping 16, plus a warm gloss
    radial-gradient(circle 120px at var(--gx)% var(--gy)%,
                    rgba(255,190,122,0.16), transparent 70%)
    following the cursor. Write --gx/--gy as CSS variables, NOT React state.
    Markup: an ordered list <ol> - the step order carries meaning.

(6) TWO ENTRY PLAQUES - flex row, gap 10px, max-width 672px, each flex-1.
    EQUAL VISUAL WEIGHT. The resume path is not secondary - for a hiring manager it
    is often the correct path, and hiding it costs more than it saves. Do NOT give it
    a ghost/outline-only treatment.
    Each: wooden panel with the inner gold groove, padding 16px 20px, flex row gap
    12px, a 36px line-art icon on the left, then a column with a gold-engraved label
    17px and a caption 11px #bdb094 below.
    Only TWO corner fittings (top-left, bottom-right) - four would make them look like
    the title plaque.
      LEFT   label VERBATIM: "마을로 입장하기 →"
             caption VERBATIM: "프로젝트·기술·경험을 둘러봅니다."
             icon: open folded map - 4 panels with fold lines, a filled location dot,
                   two short path strokes
      RIGHT  label VERBATIM: "빠른 이력서 보기 →"
             caption VERBATIM: "시간이 없다면 — 한 페이지 요약으로."
             icon: rolled scroll - curled top and bottom edges, 2 text lines across
    The arrow glyph slides 4px right on hover.
    Magnetic pull: while the cursor is inside, translate toward it by
    (cursorOffset * 0.35), spring stiffness 250 damping 18, back to 0 on leave.
    Hover: scale 1.02 plus an outer glow - left 0 0 34px rgba(255,157,56,0.28),
    right 0 0 34px rgba(226,192,120,0.22). Press: scale 0.97.
    Real <button type="button"> elements. aria-label WITHOUT the arrow:
    "마을로 입장하기" and "빠른 이력서 보기".

(7) CAPTION LINE - 11px, color #a99e84
    VERBATIM: "마을 안에서 WASD 직접 이동 모드로 전환할 수 있어요"
    with "WASD 직접 이동" in #e2c078.

RIGHT 44% - LEAVE COMPLETELY EMPTY. This is where the village shows through.
No decoration, no cards, no floating badges there.

TOP BAR - centered pill: border 1px rgba(226,192,120,.20), bg rgba(11,22,38,.60),
backdrop-blur, a small pulsing green dot, VERBATIM label "ONLINE", then live Seoul
time as "HH:MM:SS KST" in tabular-nums.
Top-right: 36px circle mute toggle, border 1px rgba(226,192,120,.30), speaker glyph,
aria-label reflecting the CURRENT action ("사운드 끄기" while unmuted).

BOTTOM STRIP - position FIXED, inset-x 0, bottom 0, padding 10px 24px (48px desktop),
gap 20px (32px desktop), border-top 1px rgba(226,192,120,.15), background
linear-gradient(90deg, rgba(8,15,26,.95) 0%, rgba(8,15,26,.80) 55%,
                rgba(8,15,26,.35) 100%)  /* fades out right so it never blocks the village */
pointer-events none. Three items, each a 16px line icon + a label + a value:
  [stacked plates icon]  "PROJECTS"  9
  [two figures icon]     "NPC"       32
  [two rooflines icon]   "건물"      27
label 10px font-black letter-spacing 0.18em #a99e84;
value Gowun Batang 14px #f2dfae, font-variant-numeric: tabular-nums.
⛔ EVERY NUMBER HERE COMES FROM THE RUNNING APP (array lengths). Do NOT add
"VISITORS", "VIEWS", "STARS", uptime, or any metric the app cannot actually read.
Three honest numbers beat five impressive ones. No count-up animation - that reads as
a dashboard. Numbers appear at their final value.

=== ENTRY TIMELINE (skippable at any point) ===
t=0.00  Shade layer at full opacity, village hidden. Silent.
t=0.35  Shade eases to its normal left-weighted gradient over 1.6s; the village fades
        up from black on the right. Slow. Let it arrive.
t=0.60  The hanging lantern ignites, warm #ff9d38, 0.4s bloom.
t=1.20  Emblem + ribbon fade in; the ribbon text types in at ~26ms per character.
t=2.00  The title plaque fades and rises 12px into place (0.7s), then its two lines
        are ENGRAVED one character at a time at ~70ms per character, with a thin warm
        caret trailing the last character.
t=4.20  The blue banner slides in, then types at ~22ms per character.
t=4.60  Everything below (body copy, signposts, entry plaques, caption, bottom strip)
        fades up together as ONE group, +12px travel, 0.7s. One calm arrival - do not
        stagger them individually.
t=5.20  Complete. Nothing further animates except the village, the cursor lantern and
        the fireflies.
TYPING: humanize each character delay by +/-35%, and 8% of the time insert a longer
pause (2.2x). The <h1> must contain the FULL text in the accessible tree at all times -
the animation must never shorten the accessible name.
SKIP: any keydown, click or touch before t=5.20 jumps immediately to the completed
state. During the first 2 seconds show a faint hint at the bottom of the column,
VERBATIM: "아무 키나 누르면 바로 넘어갑니다"
11px, rgba(169,189,214,0.55), fading out on first input.
NO progress bar, NO percentage, NO spinner, NO "Loading..." text.

=== CURSOR AND AMBIENT LAYER ===
(a) Lantern glow: a full-size non-interactive layer,
    radial-gradient(circle 300px at var(--x)% var(--y)%,
                    rgba(255,157,56,0.11), transparent 70%)
    following a SPRING-damped copy of the cursor (stiffness 120, damping 22) so the
    light lags behind the hand like a swinging lantern. Opacity never above 0.12 -
    it must not wash out the village. Plus a faint 220px guide ring at the same
    position, border 1px rgba(255,190,122,0.25), breathing scale 1->1.08->1 over 2.4s.
(b) Custom cursor (cursor: none on the stage): an outer 26px ring, border 1px
    rgba(255,190,122,0.70), on the SPRING position, breathing 1->1.12->1 over 1.8s;
    and an inner 5px dot #ffbe7a with box-shadow 0 0 8px #ffbe7a on the RAW position.
    The lag between the two is the whole effect.
(c) Fireflies: a canvas sized by ResizeObserver, 30 particles. Each has a home point,
    radius 0.8-3.0px, phase and speed. Per frame drift around home with sin/cos
    (amplitude 10px), then push away from the cursor: force = max(0, 1 - dist/150),
    displacement = direction * force * 42px, eased 0.12 per frame.
    Fill rgba(255,205,150, 0.12 + force*0.4), radius grows by force*1.4.
    Clear the canvas each frame - no trails.
PERFORMANCE (mandatory): write cursor position into CSS custom properties inside a
requestAnimationFrame loop. NEVER store cursor coordinates in React state - it
re-renders the whole overlay on every mousemove and destroys frame rate on a page
already running a 3D scene. Cancel the rAF loop and disconnect the ResizeObserver on
unmount. Pause the firefly loop when document.hidden is true.
On coarse pointers (touch), skip the custom cursor entirely and restore the native
cursor - a hidden cursor with no hover is a trap.

=== RESPONSIVE ===
Below 1024px: column width 100%, padding-left 24px, the hanging lantern moves from
-36px to -20px so it stays on screen, and the shade gradient rotates from 100deg to
180deg (top-dark instead of left-dark) so text stays readable when the village is
behind rather than beside it.
Below 640px: signposts stack to one column; entry plaques stack vertically at full
width, resume plaque still equal weight.
Short viewports (height <= 720px): this is the clipping failure case - the vh term in
the title clamp plus the 65px/48px stage padding must keep the column's
getBoundingClientRect().top at 65 or greater.

=== ACCESSIBILITY ===
prefers-reduced-motion: reduce ->
  OFF: the entire entry timeline (render the completed state with one 0.2s fade),
       character typing, the firefly canvas (return early from the effect - a CSS
       media query cannot stop a rAF loop, this must be checked in JS), cursor spring
       lag, all breathing/pulse animations, card tilt, magnetic pull.
  ON:  hover color and shadow changes (state feedback must survive), the lantern glow
       as a static soft light, and the live village itself (that is content).
Tab order: mute -> "마을로 입장하기" -> "빠른 이력서 보기".
Every interactive element shows :focus-visible - 2px solid rgba(255,157,56,0.85),
offset 2px. Never remove outlines without a replacement.
Decorative SVG (ivy, lantern, corner fittings, icons) -> aria-hidden="true".
The bottom strip is pointer-events:none and needs NO aria-live - its numbers do not
change during a session.
Verify contrast for body copy against the shade at its LIGHTEST point (62% across the
screen), not at its darkest.
Sound never autoplays; it may only start after a real user gesture. Hard volume cap
0.15 everywhere.
If the 3D scene fails to load, the overlay must still be a complete readable screen:
the shade falls back to flat #0b1626 and every plaque and button still works. Never
show a broken canvas rectangle or a WebGL error string.

=== FORBIDDEN ===
No cyan (#00d4ff / #00ff88) anywhere. No monospace uppercase headings with wide
letter-spacing. No grid lines, scanlines or glitch effects. No glassmorphism cards.
No neon glow borders. No emoji icons. No stock hero image of a village. No fabricated
statistics. No scroll lock, no cursor capture, no forced waiting. No full-screen flash.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-1. 파일 (대부분 이미 있음 — 새로 만들지 말 것)

이 문서는 **기존 `IntroOverlay.tsx` 를 다시 그리기 위한 것**이지 새 stage 폴더를 파기 위한 게 아닙니다.
01~10과 다른 점입니다.

```
src/components/ui/IntroOverlay.tsx      ← 화면 전체 (이미 존재)
  Typewriter                            ← 타이핑
  VineSprig / HangingLantern / CompassBadge          ← 현판 장식 SVG
  IconHouseClick / IconNpcAsk / IconBookQuill        ← 표지판 아이콘
  IconMap / IconScroll                               ← 명판 아이콘
  IconStack / IconPeople / IconVillage               ← 소식판 아이콘
  STEP_CARDS / VILLAGE_STATS            ← 표지판·소식판 데이터
  ParticleField / TrailCanvas           ← 반딧불·글로우
  Magnetic / TiltCard / ClockChip       ← 상호작용·시계
src/app/globals.css                     ← .v-wood / .v-emboss / .v-ribbon /
                                          .v-corner / .v-serif / .scene-label
src/components/AIPortfolioVillage.tsx   ← 모바일 분기 · 상태 전환
src/components/village/VillageScene.tsx ← 건물 팻말 · 입장 시 카메라
```

재사용: `sfx` (`@/lib/sfx` — WebAudio 신디사이저 싱글턴, 음원 파일 없음) ·
`projects` / `autonomousNpcs` / `villageBuildings` · `.v-*` 클래스 일체 ·
Gowun Batang (`layout.tsx` next/font)

## D-2. 버릴 것

- `[KILL]` 상하 8vh 레터박스 바 → 전체 화면 스테이지
- `[KILL]` `revealMask` 스포트라이트(마을을 가리던 구멍 뚫린 막) → 좌측 그늘 그라디언트
- `[KILL]` 격자 배경 2겹(`gridMask` 포함) — 밤 들판에 기술 도면 격자는 안 맞음
- `[KILL]` 모노스페이스 대문자 + `tracking-[0.32em]` 제목 → 고운바탕 각인
- `[KILL]` `ScrambleUnused` — 실제로 안 쓰이는 죽은 컴포넌트

## D-3. 퇴장 트랜지션 (Variant 프롬프트 아님 — 코드로 짤 것)

정지 화면이 아니라 **동작**이라 위 프롬프트에 안 넣었습니다. 0.62초.

| t    | 무슨 일                                                                                                                                               |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.00 | 따뜻한 "문" 소리 1회 (볼륨 상한 0.15)                                                                                                                 |
| 0.00 | 현판·리본·표지판·명판이 **양옆으로 밀려남** — 위 그룹은 좌상단, 아래 그룹은 좌하단, 최대 3deg 회전, opacity 1→0, 0.42s, `cubic-bezier(0.76,0,0.24,1)` |
| 0.00 | 동시에 좌측 숲 그늘이 완전 투명으로 0.5s — 마을이 드러남                                                                                              |
| 0.12 | 하단 소식판·상단 시계가 아래로 빠짐 (translateY +16px, opacity 0, 0.3s)                                                                               |
| 0.42 | 오버레이 언마운트 → 마을 HUD 페이드인                                                                                                                 |
| 0.70 | 앰비언트 드론 시작 (마을로 이어짐)                                                                                                                    |

**3D 씬은 같은 0.62초 동안 카메라가 광장 쪽으로 조금 내려앉습니다.** 오버레이는 절대 같이
scale/zoom 하지 말 것 — 둘 다 움직이면 글리치로 읽힙니다. **오버레이는 문, 씬은 걸음.**

가드: 누른 즉시 `isExiting` 으로 버튼 비활성 (더블클릭하면 트랜지션이 두 번 시작되고
두 번째가 애니메이션 중인 컴포넌트를 언마운트함) · 타이머 전부 언마운트 시 정리 ·
끝나면 포커스를 마을 HUD로 이동 (사라진 버튼에 포커스를 남기지 말 것).
`prefers-reduced-motion` 이면 스윙 생략, 0.2s 크로스페이드.

## D-4. 모바일 분기 (이미 구현됨 — 유지할 것)

마을은 마우스 드래그·스크롤 줌·WASD 전제라 폰에서는 조작이 안 되고 데이터도 큽니다.
마운트 시 `pointer:coarse` **AND** `hover:none` **AND** `innerWidth < 900` 이면
인트로를 건너뛰고 곧장 이력서 모드로 갑니다. 캔버스가 viewMode 게이트라 **GLB 요청이 0건**입니다
(네트워크 로그로 검증). 이력서 화면에 "3D 마을 탐험" 버튼이 남아 있어 선택지를 뺏지는 않습니다.

> "데스크톱에서 보세요" 안내문 금지 — 막지 말고 쓸모 있는 곳으로 보낼 것.

## D-5. 🎨 에셋 발주서 (그림이 준비되면 여기부터)

지금은 전부 CSS/SVG 근사치입니다. 아래 규격으로 오면 **재질만 교체**하면 됩니다.

| 슬롯                  | 내용                                            | 권장 규격                          | 교체 방법                                                              | 우선도   |
| --------------------- | ----------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- | -------- |
| `[UI-01]` 타이틀 현판 | 각인된 나무 액자                                | 9-slice PNG, 여백 46px, 투명 배경  | `.v-wood` 의 `background` → `border-image: url() 46 fill / 46px round` | **최상** |
| `[UI-02]` 리본 띠     | 제비꼬리 천 배너                                | 9-slice PNG, 좌우 여백 24px        | `.v-ribbon` 의 `clip-path` 대체                                        | 높음     |
| `[UI-03]` 표지판      | 작은 나무 보드                                  | 9-slice PNG, 여백 20px             | `.v-wood` 변형 클래스 추가                                             | 높음     |
| `[UI-04]` 모서리 장식 | 금속 코너                                       | 26×26 PNG @2x                      | `.v-corner` 의 `background`                                            | 중간     |
| `[UI-05]` 매달린 랜턴 | 사슬 + 랜턴                                     | 68×152 PNG @2x, **2장(본체/불빛)** | `HangingLantern` SVG → `<img>` 2장                                     | 중간     |
| `[UI-06]` 담쟁이      | 덩굴 가지 2종 (상단용/하단용)                   | 240×168 PNG @2x                    | `VineSprig` SVG → `<img>`                                              | 중간     |
| `[UI-07]` 아이콘 8종  | 집·후드NPC·책+깃펜·지도·두루마리·더미·사람·마을 | 각 64×64 PNG @2x 또는 SVG          | `Icon*` 컴포넌트 내부 교체                                             | 낮음     |
| `[UI-08]` 나침반 문장 | 엠블럼 배지                                     | 88×88 PNG @2x                      | `CompassBadge` SVG → `<img>`                                           | 낮음     |

> 💡 **9-slice 로 주세요.** 현판·표지판·명판은 안에 들어가는 한국어 길이에 따라 폭이 변합니다.
> 통짜 PNG를 깔면 글자가 길어질 때 모서리 장식이 늘어나 뭉개집니다.
> `border-image ... round` 는 가운데만 반복하고 모서리를 보존합니다.
>
> 💡 **불빛은 반드시 레이어를 분리해서** 주세요. 랜턴 본체와 불빛이 한 장이면 깜빡임을
> 이미지 전체 opacity로 줘야 해서 나무까지 같이 흐려집니다.

## D-6. 실데이터 바인딩

| 화면 요소     | 출처                                   | 현재 값 | 주의                       |
| ------------- | -------------------------------------- | ------- | -------------------------- |
| PROJECTS      | `projects.length`                      | 9       | —                          |
| NPC           | `autonomousNpcs.length`                | 32      | —                          |
| 건물          | `villageBuildings.length`              | 27      | —                          |
| 시계          | `Intl` / `Asia/Seoul`                  | 실시간  | `tabular-nums`             |
| 시간대(밤/낮) | `villagePalette` (접속 시각)           | 실시간  | —                          |
| 방문자 수     | **읽을 API 없음**                      | —       | ⛔ 넣지 말 것 (`E-2` 참고) |
| 마을 상태     | FastAPI `/village` (꺼져 있을 수 있음) | 가변    | 실패 시 placeholder 금지   |

## D-7. 성능 예산 (배경이 3D라 특수)

**오버레이가 프레임을 잡아먹으면 뒤의 마을이 끊긴다.** 01~10과 근본적으로 다른 제약.

- 마우스 좌표 → **CSS 변수 + rAF만.** React state 저장 시 mousemove마다 오버레이 전체 리렌더
- 반딧불 캔버스 파티클 **30개 상한**, `document.hidden` 이면 정지, 언마운트 시 rAF 취소
- `backdrop-filter` 는 상단 시계 칩 **1곳만.** 건물 팻말에는 절대 금지 — 수십 개가 동시에 뜬다
- 팻말 활성 상태는 `background` 교체가 아니라 `filter` + `transform` (재투영 노드 리페인트 방지)
- `transition: all` 금지 — 속성 명시

## D-8. 최종 체크리스트

- [ ] 배경이 실행 중인 3D 씬인가 (일러스트로 대체하지 않았는가)
- [ ] 화면 오른쪽 40%가 비어 있고 마을이 계속 보이는가
- [ ] 사이안 **0곳** — PERF 패널(개발용)만 예외
- [ ] 제목이 `min(vw, vh)` clamp 인가 (720px 높이에서 헤더 뒤로 안 잘리는가)
- [ ] 하단 소식판이 `fixed` 인가 (`bottom === window.innerHeight` 확인)
- [ ] 콘텐츠 컬럼 `top >= 65` · 랜턴이 화면 왼쪽 밖으로 안 잘리는가
- [ ] 소식판 숫자가 전부 배열 length 인가 — **지어낸 수치 0개** · 전부 `tabular-nums`
- [ ] 진입 연출이 아무 키·아무 클릭으로 즉시 건너뛰어지는가
- [ ] 제어권 박탈 **0회** (스크롤 잠금·커서 탈취 없음)
- [ ] 마우스 좌표가 React state 에 없는가 (CSS 변수 + rAF)
- [ ] 반딧불이 `prefers-reduced-motion` 에서 **JS로** 꺼지는가 (CSS로는 rAF 못 막음)
- [ ] 터치 기기에서 커스텀 커서가 꺼지는가
- [ ] `<h1>` 이 타이핑 중에도 전체 텍스트를 갖고 있는가 · 장식 SVG 전부 `aria-hidden`
- [ ] 버튼 `aria-label` 에 화살표(→)가 안 들어갔는가 · 소식판에 `aria-live` 없는가
- [ ] 금박 각인 텍스트에 폴백 색(`#f2dfae`)이 있는가
- [ ] 사운드 자동 재생 없는가 · 볼륨 상한 0.15 · 음소거 토글 상시 노출
- [ ] 랜턴 깜빡임이 0.70~1.00 범위인가 (스트로브 아님)
- [ ] 입장 버튼 더블클릭 방어(`isExiting`) · 퇴장 후 포커스가 사라진 버튼에 안 남는가
- [ ] 폰에서 GLB 요청이 0건인가
- [ ] WebGL 실패 시에도 화면이 성립하고 이력서 경로가 살아 있는가

---

# E. 미결정 (형님 답 필요)

| #   | 항목             | 내용                                                                                               | 급  |
| --- | ---------------- | -------------------------------------------------------------------------------------------------- | --- |
| E-1 | 관리자 모드 버튼 | 레퍼런스 시안 우하단의 `관리자 모드` 진입 버튼을 **공개 랜딩에 노출할지**. `/admin` 은 실제로 존재 | 🟡  |
| E-2 | 방문자 수 표시   | 소식판에 넣으려면 **읽기 API 필요**. 현재 `trackVisitorEvent` 는 쓰기만 확인됨                     | 🟡  |
| E-3 | 첫 화면 시간대   | 밤 마을이 제일 예쁜데 낮에 접속하면 낮 마을이 뜸. **첫 화면만 밤 고정**할지 실제 시각을 따를지     | 🟡  |
| E-4 | 에셋 화풍        | `[UI-01]~[UI-08]` 을 레퍼런스 시안 화풍으로 그릴지, 3D 마을 GLB 톤에 맞출지                        | 🔴  |

> **E-4 는 에셋 발주 전에 정해야** 합니다. 나머지는 구현 중 아무 때나 바꿀 수 있습니다.
