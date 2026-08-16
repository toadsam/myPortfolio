# 09. DarkLab — 프롬프트 팩

> 1인칭 탐색 3D 공포 어드벤처 프로토타입 · Unity / C# / Cinemachine / DOTween / URP / Input System
> **사용법**: `PAGE 00` ~ `PAGE 10` 의 코드블록을 **하나씩 통째로 복사해서 Variant에 붙여넣으세요.**
> 각 프롬프트는 **완전히 자립적**입니다 (색상·폰트·무드가 매번 반복 포함).
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 방의 한 문장

**"불이 꺼져 있다. 마우스가 손전등이다."**

## A-2. 왜 이 메타포인가

DarkLab은 1인칭 공포 게임이다. 개발하면서 마주한 핵심 과제는 **"보여주지 않으면서 존재를 느끼게 하는 것"** 이었다.
시야 제한(손전등), 소리 우선, 카메라 통제 — 이 세 가지가 실제로 내린 설계 결정이다.

그렇다면 이 프로젝트를 소개하는 웹페이지가 **밝고 친절하면 그 자체로 모순**이다.
그래서 이 방은 게임의 설계 원칙을 웹으로 그대로 옮긴다.

## A-3. ⭐ 가장 중요한 원칙 — 연출은 개발 내용의 운반 수단이다

**이 문서 전체를 관통하는 규칙: 모든 연출은 반드시 개발 실체를 하나 이상 전달해야 한다.**
멋있기만 한 연출은 넣지 않는다. 코드·트러블슈팅·의사결정이 연출 _뒤에_ 따라오는 게 아니라, **연출이 곧 그것을 보여주는 방식**이어야 한다.

| 전달할 개발 실체                          | 그걸 실어나르는 연출                                                                    | 페이지 |
| ----------------------------------------- | --------------------------------------------------------------------------------------- | ------ |
| 왜 이걸 만들었나 (동기)                   | 진입 시 어둠 속 첫 문장                                                                 | 00     |
| 데모 영상 · GitHub                        | 손전등으로 어둠을 훑다가 **발견**하는 것                                                | 01     |
| 레이캐스트 상호작용을 구현했다            | 관람객이 직접 조준→[E]→문이 열림 → **즉시 옆에 실제 C# 코드가 빛 안에 드러남**          | 02     |
| 시야 제한이 설계의 핵심이었다             | 관람객이 지금 손전등으로 읽고 있음 → "당신이 겪은 게 이겁니다" 회수                     | 03     |
| 카메라 제어권을 뺏는 연출을 만들었다      | 3초간 빛이 커서를 안 따라옴 → **끝나는 즉시 그 연출의 Cinemachine 코드 등장**           | 04     |
| 직접 Lerp vs Cinemachine 차이             | 토글로 두 방식의 카메라 이동을 눈으로 비교                                              | 05     |
| **트러블 01: 제어권이 잠긴 채 남는 버그** | **페이지가 실제로 1.5초 스크롤을 잠근다** → "방금 그게 그 버그" → 원인 추적 → 해결 코드 | 06     |
| **트러블 02: 매 프레임 레이캐스트 부하**  | 눈앞에서 호출 카운터가 초당 60씩 상승 → 최적화 토글 → 숫자가 꺾임                       | 07     |
| ScriptableObject 리팩터링                 | Before→After 다이어그램이 실제로 분해되어 재조립됨                                      | 08     |
| 결과물 · 풀 데모 영상                     | 조명이 완전히 켜지며 갤러리 공개                                                        | 09     |
| 회고 · 다음 단계                          | 불 켜진 상태의 담담한 정리 → 손전등이 꺼지며 퇴장                                       | 10     |

## A-4. 게임 설계 결정 ↔ 웹 재현 대응

| 게임에서 내린 결정                            | 이 웹페이지에서의 재현                                   |
| --------------------------------------------- | -------------------------------------------------------- |
| 손전등으로 시야를 제한했다                    | 커서 주변 220px만 밝고, 나머지 텍스트는 안 읽힌다        |
| 보이기 전에 들리게 했다                       | 진입 시 아무것도 안 보이는 상태에서 삐걱임이 먼저 들린다 |
| 결정적 순간에 카메라를 뺏었다                 | PAGE 04에서 손전등이 커서를 따라오지 않는 3초가 있다     |
| **연출 중 입력이 잠긴 채 남는 버그가 있었다** | **PAGE 06에서 스크롤이 실제로 잠긴다**                   |

**관람객은 이 프로젝트가 무엇인지를 읽어서 아는 게 아니라, 겪어서 안다.**
그리고 각 체험 직후에 **"방금 그건 이 코드입니다"** 로 회수한다. 체험과 코드 사이에 거리를 두지 않는 것이 핵심.

## A-5. 관람 곡선 (감정 + 정보 밀도)

```
감정  불안 ──────╮
                ╰─╮ P04 클라이맥스 (암전 3초)
     P00~03      ╰──╮        ╭─╮ P06 (스크롤 잠김 · 작은 두 번째 충격)
     어둠·탐색       ╰────────╯ ╰───╮
                                    ╰──── P09~10 정리 · 여운
정보  낮 ───────────────╱▔▔▔▔▔▔▔▔▔▔▔╲──────
     밀도            P05~08 개발 밀도 최고조
조명  0% ──── 15% ──── 45% ──── 70% ──── 90% ──── 100%
```

**핵심 장치**: 스크롤을 내릴수록 화면이 밝아진다.
공포(게임 이야기) → 해설(개발 이야기)로 넘어가는 전환이 **조명이라는 물리량**으로 표현된다.
헤더의 `○ 조명 12%` 가 실시간 표시되어 진행바 역할까지 겸한다.

## A-6. 명장면 2개

**① PAGE 04 — 카메라를 뺏긴 3초** (감정의 클라이맥스)
손전등이 꺼지고, 소리가 끊기고, 0.6초의 완전한 정적. 다시 켜진 빛은 **커서가 아니라 화면 중앙**에 있다.
빛 안의 문장: _"지금 커서를 움직여도 빛이 따라오지 않습니다. 이게 「카메라를 뺏는다」입니다."_
→ **그리고 제어권이 돌아오는 즉시, 그 연출을 실제로 만든 Cinemachine 코드가 같은 자리에 나타난다.**

**② PAGE 06 — 스크롤이 잠기는 1.5초** (기술의 클라이맥스)
스크롤이 갑자기 안 먹는다. 1.5초 후 풀리며 뜨는 문장: _"방금 스크롤이 잠겼습니다. 게임에서 이것 때문에 3일을 썼습니다."_
→ 그대로 원인 추적 과정과 해결 코드로 이어진다. **트러블슈팅을 글이 아니라 사고로 전달한다.**

## A-7. 다른 9개 방과의 차별점

| 축            | DarkLab                                       | 나머지                    |
| ------------- | --------------------------------------------- | ------------------------- |
| 명도          | 이 포트폴리오에서 **가장 어두움** (`#070405`) | 대부분 콘텐츠가 즉시 보임 |
| 읽기 방식     | 마우스를 움직여야 읽힌다                      | 스크롤만 하면 읽힌다      |
| 진행 표시     | 조명 %                                        | 없거나 일반 스크롤바      |
| 색 사용       | 레드를 한 화면에 1~2곳만                      | 주색을 적극적으로 씀      |
| 관람객 제어권 | **2번 뺏긴다** (P04 시야, P06 스크롤)         | 뺏지 않음                 |

## A-8. 절대 금지 (안전 규칙)

- 제어권 박탈은 **총 2회**(P04, P06), 각각 **예고 + 건너뛰기 + 세션당 1회**
- 피·시체·얼굴·괴물 이미지 금지. **어둠과 정적만으로** 만든다
- 비명·큰 소리 금지. 최대 볼륨을 코드로 하드 제한 (0.15)
- 화면 전체 플래시·스트로브 금지 (광과민성)
- `[ 조명 켜기 ]` 탈출 버튼 **상시 노출** — 없으면 배포 금지

---

# B. 공통 디자인 토큰 (참고용 — 각 프롬프트에 이미 포함됨)

| 토큰                        | 값                                                                    | 용도                          |
| --------------------------- | --------------------------------------------------------------------- | ----------------------------- |
| `--bg`                      | `#070405` → `#0f0d0e` (P09부터)                                       | 페이지 배경                   |
| `--primary`                 | `#ef4444`                                                             | 강조. 한 화면에 1~2곳만       |
| `--accent`                  | `#ff5a4d`                                                             | 보조 강조                     |
| `--ok` / `--bad` / `--warn` | `#4ade80` / `#f87171` / `#fbbf24`                                     | 트러블슈팅·회고 전용          |
| `--text`                    | `rgba(255,255,255,0.82)`                                              | 본문                          |
| `--muted`                   | `rgba(255,255,255,0.42)`                                              | 캡션                          |
| `--torch`                   | `rgba(255,240,220,0.14)`                                              | 손전등 (백열등 색, 흰색 아님) |
| 손전등 반경                 | `220px` (터치 `320px`)                                                |                               |
| 코드 패널                   | bg `#0b0708`, border `rgba(255,255,255,0.10)`                         |                               |
| 문법 색                     | 주석 `#5e8c6a` / 문자열 `#d9a45b` / 키워드 `#ef4444` / 숫자 `#b58cf0` |                               |
| 필름 그레인                 | SVG feTurbulence, opacity `0.055` (P09부터 `0.035`)                   |                               |
| 이징                        | `cubic-bezier(0.4, 0, 0.2, 1)`, 0.5~1.4s                              | 느리고 무겁게                 |

---

# C. 페이지별 프롬프트

---

## PAGE 00 — 진입 시퀀스 (Cold Open)

**개발 실체**: 왜 이걸 만들었는가 (동기)
**연출 장치**: 완전한 어둠 → 마우스를 움직여야 손전등이 켜짐

```text
Build a full-screen cinematic ENTRY SEQUENCE for a Unity horror game portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Single self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The developer's motivation for building this project. The very first readable
sentence must be about WHY the game was made, not decoration.

=== MOOD ===
Pitch-black horror. Silent, slow, heavy. The viewer sees NOTHING at first.
Reference feeling: standing in an unlit room waiting for your eyes to adjust.
NO gore, NO blood, NO faces, NO monsters. Darkness and silence only.

=== DESIGN TOKENS (use exactly) ===
background #070405 | primary red #ef4444 (use at most twice) | accent #ff5a4d
text rgba(255,255,255,0.82) | muted rgba(255,255,255,0.42)
torch light rgba(255,240,220,0.14)  /* warm incandescent, NEVER white */
fonts: headings font-black, body sans-serif leading-8, labels font-mono
easing cubic-bezier(0.4,0,0.2,1), durations 0.4s-1.4s | rounded-md

=== LAYOUT ===
Full viewport, position fixed, above page content. Everything centered.
No header, no nav, no scrollbar during this sequence.
Layer stack bottom to top:
  1. Solid #070405 background
  2. Content layer (text, centered)
  3. Darkness layer: position fixed inset-0, background #070405, with
     mask-image: radial-gradient(circle 220px at var(--mx) var(--my),
                                 transparent 0%, black 70%)
     (and -webkit-mask-image identical). THIS IS THE FLASHLIGHT.
  4. Film grain: SVG feTurbulence noise, opacity 0.055, mix-blend-mode overlay,
     drifting very slowly

=== TIMELINE (follow exactly) ===
t=0.0s  Pure black. Nothing visible. No sound.
t=0.6s  A very low drone fades in, barely audible (hard volume cap 0.15)
t=0.9s  One faint creaking sound, single occurrence
t=1.2s  Small muted text fades in at center-bottom (y = 68vh).
        Korean copy, VERBATIM: "[ 마우스를 움직이세요 ]"
        font-mono 13px, rgba(255,255,255,0.42), letter-spacing 0.15em.
        Disappears instantly (0.2s fade) on first mouse movement.
t=1.5s  ON FIRST MOUSE MOVE the flashlight ignites at the cursor:
          - one soft click sound
          - radius animates 0px -> 220px over 0.4s, ease-out
t=2.2s  Inside the beam, the title becomes readable, centered:
          Line 1, VERBATIM: "DarkLab"
            72px font-black, rgba(255,255,255,0.82), letter-spacing -0.02em
          Line 2, VERBATIM: "1인칭 공포 어드벤처 · Unity"
            15px font-mono, rgba(255,255,255,0.42), letter-spacing 0.2em,
            margin-top 16px
t=3.0s  THE MOTIVATION LINE fades in below the title (this is the substance of
        this page - it must be the first real sentence the viewer reads).
        max-width 520px, centered, 17px, leading-9, rgba(255,255,255,0.82).
        Korean copy, VERBATIM:
        "공포 게임에서 제일 어려운 건 무서운 걸 만드는 게 아니라,
         아무것도 없는 방을 무섭게 만드는 일이었다. 그게 궁금해서 만들었다."
        Reveal it word by word, stagger 0.045s, each word opacity 0->1 with
        blur 4px->0. Slow. Let it land.
t=4.2s  Scroll hint at y = 88vh, VERBATIM: "↓ 아래로"
        13px font-mono, rgba(255,255,255,0.42), opacity pulsing 0.3<->0.7 on a
        2.4s cycle.

FALLBACK: if the mouse never moves, at t=3.0s auto-ignite the flashlight at screen
center and slowly orbit it in a 90px-radius circle, 6s per revolution.

=== FLASHLIGHT IMPLEMENTATION (critical) ===
Track mouse position and write it to CSS custom properties --mx and --my inside a
requestAnimationFrame loop. DO NOT store mouse coordinates in React state - that
re-renders on every mouse move and destroys performance.
Add a breathing wobble: radius 220px +/- 6px on a 1.2s sine cycle (unsteady hand).

=== ESCAPE HATCHES (required) ===
Top-right, always visible: a ghost button.
  Label VERBATIM: "[ 조명 켜기 ]"
  Helper line underneath, 11px, VERBATIM: "어두워서 읽기 힘들면 눌러주세요"
  Clicking fades the darkness layer to opacity 0 over 0.5s; label toggles to
  "[ 조명 끄기 ]".
Escape / click / scroll skips the sequence and jumps to the t=4.2s end state.

=== ACCESSIBILITY ===
prefers-reduced-motion: skip the flashlight entirely, render fully lit from the
start, and show a notice at top, VERBATIM:
  "이 페이지는 원래 손전등으로 탐색하는 화면입니다."  next to  "[ 체험하기 ]"
Text hidden by darkness must remain in the DOM and readable by screen readers -
dim it visually only. NEVER aria-hidden or display:none.
Audio hard-capped at 0.15. No sudden loud sounds.

=== RESPONSIVE ===
Touch devices: flashlight pinned to screen center with radius 320px, and follows
touch position on tap/drag. Title 44px, subtitle 13px, motivation line 16px.

=== DO NOT ===
No jump scares on this page. No full-screen flashes. No red flashing.
Do not use bright white for the torch. Do not delay the motivation line past 3.5s -
the viewer must learn WHY this project exists within the first 4 seconds.
```

---

## PAGE 01 — 히어로 · 어둠 속에서 발견하는 것들

**개발 실체**: 프로젝트 정체 + **데모 영상 · GitHub 저장소**
**연출 장치**: 링크가 푸터 버튼이 아니라, **손전등으로 벽을 훑다가 발견되는 오브젝트**

```text
Build the HERO SECTION of a Unity horror game portfolio page, where the project's
demo video and GitHub repository are DISCOVERED by sweeping a flashlight across a
dark wall - not presented as ordinary buttons.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained section.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the project is (identity + hard facts)
2. The gameplay demo video entry point
3. The GitHub repository link
Items 2 and 3 must feel like objects found in a dark room, not like a link bar.

=== MOOD ===
An unlit laboratory. The viewer sweeps a flashlight to read. Slow, heavy, restrained.
Red is used almost nowhere - save it.

=== DESIGN TOKENS (use exactly) ===
background #070405 | primary red #ef4444 (MAX 2 uses on this screen) | accent #ff5a4d
text rgba(255,255,255,0.82) | muted rgba(255,255,255,0.42)
text outside the beam rgba(255,255,255,0.04) | torch rgba(255,240,220,0.14)
fonts: headings font-black, body sans leading-8, labels font-mono uppercase
easing cubic-bezier(0.4,0,0.2,1) 0.7s-1.4s | rounded-md
film grain SVG feTurbulence opacity 0.055, slow drift

=== PERSISTENT HEADER (fixed, present on every section of this page) ===
Height 56px, background rgba(7,4,5,0.72), backdrop-blur(8px),
bottom border 1px rgba(255,255,255,0.06).
  LEFT   "← 마을로"  13px font-mono rgba(255,255,255,0.42)
  CENTER "DarkLab"   14px font-black rgba(255,255,255,0.82)
  RIGHT  a live lighting readout, format VERBATIM: "○ 조명 0%"
         13px font-mono rgba(255,255,255,0.42), driven by scroll progress,
         updating in real time. Then a sound toggle icon, then the ghost button
         "[ 조명 켜기 ]".

=== LAYOUT ===
Full-bleed, min-height 100vh, single centered column, max-width 820px.
  y ~18%  Kicker
  y ~26%  Headline (2 lines)
  y ~46%  Meta grid (4 cells)
  y ~62%  THE DISCOVERY WALL (see below) - full column width, height 300px

=== CONTENT (Korean copy - VERBATIM, never translate) ===

KICKER (font-mono 12px, letter-spacing 0.3em, uppercase, color #ef4444
        - one of only two red elements on this screen):
  "UNITY · 1인칭 탐색 공포 어드벤처"

HEADLINE (font-black, 40px desktop / 28px mobile, leading-tight):
  Line 1, rgba(255,255,255,0.82), VERBATIM:
    "어두운 방에서 무서운 건 무언가가 있어서가 아니다."
  Line 2, color #ff5a4d (the second and final red element), margin-top 12px,
  VERBATIM:
    "있는지 없는지 모르기 때문이다."

META GRID (4 cells in a row; 2x2 below 768px).
Each cell: value 24px font-mono font-black rgba(255,255,255,0.82) on top,
label 11px font-mono rgba(255,255,255,0.42) letter-spacing 0.1em below.
Border 1px rgba(255,255,255,0.08), rounded-md, padding 16px.
  Cell 1  value "6"       label "기술 스택"
  Cell 2  value "5"       label "핵심 시스템"
  Cell 3  value "1인칭"    label "시점"
  Cell 4  value "Unity"   label "엔진 / URP"

=== THE DISCOVERY WALL (the defining idea of this page) ===
A full-width panel, height 300px, background #0a0708, rounded-md,
border 1px rgba(255,255,255,0.08), overflow hidden, position relative.
It looks like a dark laboratory wall. It appears EMPTY at first glance.

Three objects are placed on it. They are rendered at opacity 0.05 (essentially
invisible) UNTIL the flashlight beam passes over them. Compute the distance
between the cursor and each object's center; when the distance is under 190px,
raise that object's opacity toward 1 proportionally (a smooth falloff, not a
binary toggle), and add a warm glow behind it.

OBJECT A - DEMO VIDEO  (position: x 24%, y 42% of the panel)
  Appearance: a 132x132px circle, border 1px rgba(255,90,77,0.45), a play triangle
  in the center (color #ff5a4d, 22px). When fully revealed, a soft ring pulses
  outward from it every 1.8s.
  Label below it, font-mono 12px, color #ff5a4d, VERBATIM: "▶ 플레이 영상"
  Sub-label, font-mono 10px, rgba(255,255,255,0.42), VERBATIM: "1분 42초"
  Click -> opens a video lightbox: overlay rgba(2,2,3,0.92) with backdrop-blur(6px),
  a 16/9 player centered at max-width 1000px. If no video source is supplied, render
  a CSS placeholder inside the player: dark corridor suggestion + centered text
  VERBATIM "게임플레이 영상 자리 · 16:9". Esc or overlay click closes it.
  [VIDEO-01] gameplay footage: corridor exploration, flashlight, one interaction.

OBJECT B - GITHUB  (position: x 58%, y 66%)
  Appearance: a 108x108px rounded square, border 1px rgba(255,255,255,0.22),
  containing a monospace "< >" glyph at 26px, rgba(255,255,255,0.72).
  Label below, font-mono 12px, rgba(255,255,255,0.82), VERBATIM: "GitHub 저장소"
  Sub-label, font-mono 10px, rgba(255,255,255,0.42), VERBATIM: "C# · Unity 2022"
  Click -> opens https://github.com/toadsam/DarkLab in a new tab
  (target _blank, rel noreferrer).

OBJECT C - A NOTE  (position: x 82%, y 30%)
  Appearance: a small tilted rectangle 96x64px (rotate -4deg), background #14100e,
  border 1px rgba(255,255,255,0.14), looking like a scrap of paper pinned to a wall.
  When revealed, it shows tiny handwriting-style text, 10px font-mono,
  rgba(255,255,255,0.55), VERBATIM: "개발 4주 · 1인 프로토타입"
  Hovering it lifts it 3px and straightens the rotation to 0deg.

HINT (bottom-center of the panel, font-mono 11px, rgba(255,255,255,0.30),
      fading out permanently once the first object has been revealed):
  VERBATIM: "손전등으로 벽을 비춰보세요"

A discovery counter in the panel's top-right corner, font-mono 10px,
rgba(255,255,255,0.35), format VERBATIM: "발견 0 / 3"
It increments as each object is first revealed. When it reaches 3/3 it turns
#ff5a4d and stays.

=== FLASHLIGHT LAYER ===
Fixed full-viewport darkness layer ABOVE the content:
  position fixed; inset 0; background #070405;
  mask-image: radial-gradient(circle 220px at var(--mx) var(--my),
                              transparent 0%, black 70%)
Mouse position written to --mx/--my inside requestAnimationFrame.
NEVER store mouse coordinates in React state.
Breathing wobble: radius 220px +/- 6px on a 1.2s sine cycle.
The darkness layer's OPACITY is driven by whole-page scroll progress
(0% scroll -> 1.00, 100% scroll -> 0.00). On this hero section it stays at 1.00.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Kicker fades up (y 12px -> 0, 0.7s)
0.25s  Headline line 1 reveals word by word (stagger 0.04s, blur 4px -> 0)
0.90s  Headline line 2 (red) reveals, slower (stagger 0.06s)
1.60s  Meta cells fade in left to right, 0.09s apart
2.10s  Discovery wall panel fades up (y 20px -> 0, 0.9s); the hint text appears
       0.6s after that
Hover on a meta cell: border brightens to rgba(255,255,255,0.20), lifts 3px.

=== RESPONSIVE ===
< 768px: headline 28px, meta grid 2x2, discovery wall height 340px with objects
repositioned to A(x 26%, y 26%) B(x 68%, y 52%) C(x 34%, y 78%).
On touch devices the flashlight is pinned to center with radius 320px, so ALSO
make each object directly tappable regardless of beam proximity, and raise their
base opacity to 0.35 so they are discoverable without a cursor.

=== ACCESSIBILITY ===
prefers-reduced-motion: no flashlight, fully lit, all three objects visible at
opacity 1 immediately, entrance animations instant.
All three objects must be real focusable elements (button / anchor) reachable by
Tab, with visible focus rings (2px #ff5a4d, offset 2px). Keyboard focus also
reveals them. Text dimmed by darkness stays in the DOM for screen readers.

=== DO NOT ===
Do not render the demo video and GitHub as a conventional button row anywhere on
this page. Do not exceed 2 red elements outside the discovery wall.
No scanlines, glitch, CRT effects, or neon. No gore. No jump scare here.
```

---

## PAGE 02 — 무엇을 만들었나 · 레이캐스트 상호작용

**개발 실체**: 레이캐스트 기반 상호작용 구현 + **실제 C# 코드**
**연출 장치**: 관람객이 직접 조준→[E]→반응 → **그 즉시 옆 패널에 실제 코드가 빛과 함께 드러남**

```text
Build a SECTION with an interactive raycast demo that reveals the real C# source
code the moment the viewer interacts, for a Unity horror game portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the gameplay actually is (exploration, no chasing enemy)
2. That interaction is implemented with a center-screen raycast
3. THE ACTUAL C# CODE for that raycast - revealed as a direct consequence of the
   viewer's own action, not parked in a separate code section

=== MOOD ===
Unlit laboratory. The viewer explores with a flashlight. Slow, heavy, quiet.

=== DESIGN TOKENS (use exactly) ===
background #070405 | primary red #ef4444 | accent #ff5a4d
text rgba(255,255,255,0.82) | muted rgba(255,255,255,0.42)
torch rgba(255,240,220,0.14)
code panel bg #0b0708, border rgba(255,255,255,0.10)
syntax: comments #5e8c6a, strings #d9a45b, keywords #ef4444, numbers #b58cf0
fonts: headings font-black, body sans leading-8, code + labels font-mono
easing cubic-bezier(0.4,0,0.2,1) 0.5s-1.2s | rounded-md
film grain SVG noise opacity 0.055

=== LAYOUT ===
Single centered column, max-width 980px, padding-block 128px.
  Block A : label + two paragraphs (max-width 720px, centered)
  Block B : a two-column split, gap 20px, aligned to the top
              LEFT  (58%) : the interactive dark-room demo, height 420px
              RIGHT (42%) : the code reveal panel, height 420px
            Below 1024px this becomes a single stacked column (demo first).

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.42)):
  "01 · 무엇을 만들었나"

PARAGRAPH 1 (17px, leading-9, rgba(255,255,255,0.82)):
  "1인칭으로 어두운 연구실을 탐색한다. 문을 열고, 서랍을 뒤지고, 무언가를 발견한다.
   적이 쫓아오지 않는다. 탐색 그 자체가 게임이다."
  Emphasize "탐색 그 자체가 게임이다" in #ff5a4d, font-bold.

PARAGRAPH 2 (17px, leading-9, margin-top 24px):
  "그래서 상호작용이 전부였다. 플레이어가 무엇을 만질 수 있는지 즉시 알아야 하고,
   만질 수 없는 건 애초에 눈에 띄면 안 됐다."

=== BLOCK B LEFT: INTERACTIVE DARK ROOM ===
Container: height 420px, rounded-md, border 1px rgba(255,255,255,0.10),
background #0b0708, overflow hidden.
Header strip (34px, border-bottom 1px rgba(255,255,255,0.08)):
  left  font-mono 11px rgba(255,255,255,0.42) VERBATIM: "▸ 직접 해보세요"
  right a counter, format VERBATIM: "0 / 3"

Inside, a CSS-only dark room in perspective:
  floor: trapezoid #0e0a0b receding to a vanishing point; back wall #0b0708
  A fixed crosshair "⊕" at the exact center of the container, 12px,
  rgba(255,255,255,0.55), font-mono. This represents the screen-center raycast origin.
  Three interactable objects (percent of container):
    DOOR  x 22% y 46%  - tall rounded rect 60x110px, #16100f
    BOX   x 52% y 62%  - square 68x58px, #14100e
    KEY   x 78% y 54%  - small shape 34x34px, #1a1512

INTERACTION RULES:
1. As the mouse moves inside the container, determine the "hit" target: the object
   nearest the cursor within a 90px threshold.
2. A targeted object gets: 1px solid #ff5a4d outline, glow
   box-shadow 0 0 24px rgba(255,90,77,0.25), and a prompt 12px above it
   (font-mono 12px, #ff5a4d, fading in over 0.18s with a 4px upward slide):
     DOOR VERBATIM "[E] 열기"   BOX VERBATIM "[E] 조사"   KEY VERBATIM "[E] 줍기"
3. Pressing E (or clicking) triggers:
     DOOR -> rotates open on its left edge (rotateY -70deg, 0.8s), revealing a warm
             light strip behind it
     BOX  -> lid tilts up (rotateX -35deg, 0.5s), a small glowing dot floats out
     KEY  -> lifts 20px, scales 1.3, fades out (0.6s)
   Each plays a short quiet sound (creak / thud / clink), volume cap 0.15.
   Counter increments to "1 / 3", "2 / 3", "3 / 3".
4. At 3/3, a line fades in at the bottom of the container, font-mono 13px, #ff5a4d,
   VERBATIM: "모든 오브젝트를 찾았습니다"
   and a reset button at bottom-right, font-mono 11px, VERBATIM: "↻ 다시"

KEYBOARD SAFETY (critical): the E key is captured ONLY while the pointer is inside
this container or the container has focus. Never capture keys globally - that breaks
page scrolling. Show a 1px #ff5a4d focus ring when the container is active.

=== BLOCK B RIGHT: THE CODE REVEAL PANEL (the key idea of this page) ===
Same height as the demo (420px), rounded-md, border 1px rgba(255,255,255,0.10),
background #0b0708.
Header bar: three window dots (#ff5f56 #ffbd2e #27c93f, 9px), then the filename in
font-mono 11px rgba(255,255,255,0.45), VERBATIM: "Interactor.cs"

INITIAL STATE (before the viewer interacts):
The code is present but almost invisible: every line rendered at
rgba(255,255,255,0.06), no syntax colors. Centered over it, a muted line,
font-mono 12px, rgba(255,255,255,0.35), VERBATIM:
  "왼쪽에서 오브젝트를 조사하면 여기에 코드가 드러납니다"

REVEAL BEHAVIOR (this is the payoff - implement carefully):
Each successful interaction on the LEFT reveals a specific slice of the code on the
RIGHT. The reveal is a warm sweep, as if the flashlight passed over the page:
a linear-gradient highlight in rgba(255,240,220,0.10) travels top-to-bottom across
the target lines over 0.5s, and as it passes, those lines animate from
rgba(255,255,255,0.06) to full syntax coloring.
  1st interaction (any object) -> reveals the raycast lines (the Physics.Raycast
     call and its parameters) and highlights them with a rgba(239,68,68,0.10)
     row background
  2nd interaction -> reveals the target-detection lines (checking the hit object
     for an IInteractable component, storing the current target)
  3rd interaction -> reveals the input-handling lines (reading the interact action
     and calling Interact() on the current target)

CODE CONTENT: Unity C#, roughly 22 lines total, structured so the three slices are
contiguous blocks. Show a first-person interactor that, each frame, casts a ray from
the camera center forward up to a max distance, checks the hit collider for an
interactable component, tracks the current target, updates a prompt, and invokes
the interaction when the input action fires.
Line numbers in a left gutter, rgba(255,255,255,0.20), min-width 20px, right-aligned,
user-select none. Code font-mono 12px, leading-relaxed.

Caption bar at the bottom (border-top 1px rgba(255,255,255,0.08), font-mono 11px,
rgba(255,255,255,0.42), prefixed with "// "), which also changes as slices reveal:
  before any reveal  VERBATIM: "// 아직 아무것도 조사하지 않았습니다"
  after 1st          VERBATIM: "// 화면 중앙에서 레이를 쏘고 맞은 것을 가져온다"
  after 2nd          VERBATIM: "// 맞은 오브젝트가 상호작용 가능한지 확인한다"
  after 3rd          VERBATIM: "// 입력이 들어오면 현재 타겟에게 넘긴다"

FINAL NOTE (appears under the code panel only after 3/3), 13px, leading-8,
rgba(255,255,255,0.72), VERBATIM:
  "레이캐스트를 매 프레임 쏘는 이 구조가 나중에 성능 문제를 만들었다.
   그 얘기는 뒤에서 하겠다."
  Emphasize "성능 문제를 만들었다" in #ff5a4d. This is a deliberate hook for a
  later section - keep it.

=== FLASHLIGHT LAYER ===
Same fixed darkness layer with
mask-image: radial-gradient(circle 220px at var(--mx) var(--my), transparent 0%, black 70%),
--mx/--my updated inside requestAnimationFrame, never React state.
On this section the darkness opacity eases from 1.00 to 0.85 as the viewer scrolls.
IMPORTANT: give the code panel a local glow (box-shadow inset 0 0 60px
rgba(255,240,220,0.05)) so revealed code stays legible even outside the beam.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Section label fades in
0.20s  Paragraph 1 reveals word by word (stagger 0.022s, blur 3px -> 0)
0.90s  Paragraph 2 reveals
1.60s  Demo container and code panel fade up together (y 24px -> 0, 0.9s)
2.20s  The three room objects fade in 0.15s apart: DOOR -> BOX -> KEY
2.80s  The code panel's "조사하면 드러납니다" hint fades in

=== RESPONSIVE ===
< 1024px: single column, demo on top (height 340px), code panel below (height auto,
max-height 420px with internal vertical scroll).
< 768px: interaction becomes TAP-based (no E key); prompts read "터치 · 열기" etc.;
code font-size 11px with internal horizontal scroll (the block scrolls, never the page).
Touch devices: flashlight pinned to center, radius 320px.

=== ACCESSIBILITY ===
prefers-reduced-motion: fully lit, no flashlight, no sweep animation (code slices
appear instantly), interactions still work without rotation transitions.
The three objects must be real focusable buttons reachable by Tab with visible focus
rings. Code must be selectable, copyable text - never an image.

=== DO NOT ===
Do not show the full code colored from the start - the progressive reveal tied to
the viewer's own actions IS the point of this page.
Do not use a syntax highlighting library; hand-color tokens with spans.
No gore, no monsters, no jump scare on this page.
```

---

## PAGE 03 — 공포는 어디서 오는가 · 설계 원칙 3

**개발 실체**: 세 가지 설계 결정 + **각 원칙을 구현한 코드 한 조각씩**
**연출 장치**: 원칙을 읽고 1.2초 뒤 "↳ 지금 당신이 겪은 게 이겁니다" 회수 + 원칙 03은 다음 페이지 예고

```text
Build a SECTION presenting three engineering design principles, each one echoed
back to something the viewer has already physically experienced on this page, for
a Unity horror game portfolio.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. Three concrete design decisions made during development, each with its reason
2. A one-line code fragment showing how each was actually implemented in Unity
3. An advance warning for the interruption sequence on the next page

=== MOOD ===
Lights are slowly coming up. Still dark, but shapes outside the beam are becoming
perceptible. Tone shifts from "being scared" toward "understanding how the fear was
engineered." Analytical but still heavy.

=== DESIGN TOKENS (use exactly) ===
background #070405 | primary red #ef4444 | accent #ff5a4d
text rgba(255,255,255,0.82) | muted rgba(255,255,255,0.42)
torch rgba(255,240,220,0.14) | code bg #0b0708, border rgba(255,255,255,0.10)
syntax: comments #5e8c6a, strings #d9a45b, keywords #ef4444, numbers #b58cf0
fonts: headings font-black, body sans leading-8, numbers/labels/code font-mono
easing cubic-bezier(0.4,0,0.2,1) 0.7s-1.4s | rounded-md
film grain SVG noise opacity 0.055

=== LAYOUT ===
Single centered column, max-width 820px, padding-block 128px.
  Block A : label + two paragraphs
  Block B : three principle rows (the centerpiece)
  Block C : advance-warning card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.42)):
  "02 · 공포는 어디서 오는가"

PARAGRAPH 1 (17px, leading-9):
  "공포 게임을 만들면서 제일 먼저 안 건, 무서운 걸 보여주면 안 무섭다는 거였다.
   괴물을 화면에 띄우는 순간 플레이어는 그걸 분석하기 시작한다. 크기, 속도, 패턴."

PARAGRAPH 2 (17px, leading-9, margin-top 24px):
  "분석이 시작되면 공포는 끝난다. 그래서 무섭게 만들자는 막연한 목표를
   구현 가능한 세 가지 규칙으로 쪼갰다."
  Emphasize "분석이 시작되면 공포는 끝난다" in #ff5a4d, font-bold.

=== BLOCK B: THREE PRINCIPLE ROWS (centerpiece) ===
Three rows, each with a 1px bottom border rgba(255,255,255,0.08), padding-block 36px.

Row structure:
  LEFT (fixed 64px): the number, font-mono 32px font-black,
       color rgba(255,255,255,0.18) - large, ghostly, decorative
  RIGHT (flex-1):
       Title       22px font-black rgba(255,255,255,0.82)
       Description 15px leading-8 rgba(255,255,255,0.62), margin-top 8px
       CODE CHIP   a single-line inline code fragment, margin-top 14px:
                   font-mono 12px, background #0b0708, border 1px
                   rgba(255,255,255,0.10), rounded, padding 8px 12px,
                   with the filename prefixed in rgba(255,255,255,0.35)
       ECHO LINE   13px font-mono, color #ff5a4d, margin-top 12px, prefix "↳ "

ROW 1
  number "01"
  title VERBATIM:       "시야를 제한한다"
  description VERBATIM: "손전등 반경 밖은 알 수 없다. 무엇을 보여줄지보다
                         무엇을 못 보게 할지를 정하는 게 먼저였다."
  code chip: filename "PlayerLight.cs" then a single C# line setting a spotlight's
             range and angle to a deliberately narrow value
  echo VERBATIM:        "↳ 지금 이 페이지에서 마우스가 손전등인 이유"

ROW 2
  number "02"
  title VERBATIM:       "소리를 앞세운다"
  description VERBATIM: "보이기 전에 들린다. 소리가 먼저 오면 플레이어는 스스로
                         최악을 상상한다. 내가 만든 것보다 무섭게."
  code chip: filename "AmbientCue.cs" then a single C# line playing a positional
             audio cue at a trigger point before any visual is enabled
  echo VERBATIM:        "↳ 들어올 때 들린 삐걱임"

ROW 3
  number "03"
  title VERBATIM:       "카메라를 뺏는다"
  description VERBATIM: "결정적인 순간에는 플레이어가 시선을 못 돌린다.
                         문이 저절로 열리는 장면에서 딴 데를 보고 있으면
                         그 연출은 없던 게 된다."
  code chip: filename "CameraDirector.cs" then a single C# line raising a
             CinemachineVirtualCamera's Priority
  echo VERBATIM:        "↳ 잠시 후 한 번 경험하게 됩니다"
  Row 3's echo PULSES slowly (opacity 0.5 <-> 1.0, 2.4s cycle) and sits beside a
  ghost button, font-mono 11px, border 1px rgba(255,255,255,0.16), rounded,
  padding 4px 10px, VERBATIM: "[ 건너뛰기 ]"

THE ECHO DELAY (important):
Echo lines start at opacity 0. Reveal each one 1.2 SECONDS AFTER its own row enters
the viewport, fading in with a 6px left slide. The viewer must read the principle
first, then realize "wait - that just happened to me."
Do NOT reveal echoes at the same time as their rows. The delay is the entire effect.

=== BLOCK C: ADVANCE WARNING CARD ===
Full width, margin-top 56px, padding 24px, rounded-md,
border 1px rgba(239,68,68,0.30), background rgba(239,68,68,0.05).
  Label font-mono 11px letter-spacing 0.2em color #ef4444, VERBATIM: "▲ 다음 페이지 안내"
  Body 15px leading-8, margin-top 10px, VERBATIM:
  "다음 구간에서 화면이 약 3초간 어두워지고 손전등이 커서를 따라오지 않습니다.
   큰 소리나 갑작스러운 이미지는 없습니다. 원하지 않으시면 아래 버튼을 눌러 주세요."
  Button margin-top 16px, font-mono 12px, border 1px rgba(255,255,255,0.20),
  rounded, padding 8px 16px, VERBATIM: "[ 이 연출 건너뛰기 ]"
  Clicking sets a session flag disabling the next page's sequence; the card
  collapses to a confirmation line, VERBATIM: "건너뛰기로 설정되었습니다"

=== FLASHLIGHT LAYER ===
Same fixed darkness layer, mask-image radial-gradient(circle 220px at var(--mx)
var(--my), transparent 0%, black 70%), CSS variables updated in requestAnimationFrame,
never React state. On this section darkness opacity eases 0.85 -> 0.55.
Header readout shows values like "○ 조명 32%".
Give each code chip a local glow so it stays legible outside the beam.

=== ANIMATION TIMELINE ===
0.00s  Label fades in
0.20s  Paragraph 1 word-by-word (stagger 0.022s)
1.00s  Paragraph 2
1.60s  Row 01 slides up (y 18px -> 0, 0.7s); its ghost number rolls 00 -> 01
1.90s  Row 01 code chip fades in
+1.2s  Row 01 echo fades in
(rows 02 and 03 repeat the same pattern as they enter the viewport)
Last   Warning card fades up with a single soft red glow pulse (1.2s)
Hover a row: ghost number brightens rgba(255,255,255,0.18) -> rgba(255,90,77,0.55),
and a 2px #ef4444 bar grows on the row's left edge (0.3s).

=== RESPONSIVE ===
< 768px: ghost number shrinks to 24px and sits above the title; code chips get
internal horizontal scroll; echo lines wrap; warning card padding 18px.
Touch: flashlight pinned to center, radius 320px.

=== ACCESSIBILITY ===
prefers-reduced-motion: fully lit, no flashlight, all reveals instant, echoes
visible immediately, and the next page's sequence auto-disabled.
Code chips are selectable text. All text present in the DOM for screen readers.

=== DO NOT ===
Do not make the warning card look like a browser error or alert.
Do not reveal echo lines simultaneously with their rows.
No flashing red, no gore.
```

---

## PAGE 04 — THE MOMENT · 카메라를 뺏긴 3초 → 그 코드

**개발 실체**: 카메라 제어권 이양 연출을 어떻게 구현했는가 (**Cinemachine 코드**)
**연출 장치**: 관람객의 손전등 제어권을 3초 뺏음 → **돌아오는 즉시 그 자리에 코드가 나타남**
**⚠️ 세션당 1회 · PAGE 03에서 예고 · 건너뛰기 가능**

```text
Build a ONE-TIME cinematic interruption that takes control away from the viewer for
three seconds, then immediately reveals the actual Unity code that produced the same
effect in the game. Stack: React + TypeScript + Tailwind CSS + framer-motion.
Self-contained overlay component plus an inline code reveal.

=== CONCEPT ===
The viewer has been reading this page with a mouse-driven flashlight. This sequence
takes that control away for exactly 3 seconds to physically demonstrate the game's
third design principle: taking the camera away from the player.
It is unsettling through SILENCE and LOSS OF CONTROL, never through loud noises or
shocking images. The moment control returns, the page shows the C# that implements
this exact technique in Unity - so the experience and its implementation sit in the
same place, seconds apart.

=== SAFETY RULES (implement these first, non-negotiable) ===
1. Fires at most ONCE per session. Persist a flag in sessionStorage. Scrolling up and
   back down must NOT re-trigger it.
2. Does not fire if the viewer clicked the skip button on the previous section.
3. Never fires when prefers-reduced-motion: reduce. Render the static fallback instead.
4. NO loud sounds. NO screaming. The effect comes from audio CUTTING OUT.
5. NO full-screen white or red flashes. NO strobing. Fades only.
6. NO blood, faces, monsters, or imagery of any kind. Text and darkness only.
7. Always-visible skip affordance during the sequence, bottom-right, font-mono 11px,
   rgba(255,255,255,0.35), VERBATIM: "[ Esc · 건너뛰기 ]"
   Esc ends it immediately and restores control.

=== DESIGN TOKENS (use exactly) ===
background #070405 | primary red #ef4444 | accent #ff5a4d
text rgba(255,255,255,0.82) | muted rgba(255,255,255,0.42)
torch rgba(255,240,220,0.14)
code bg #0b0708, border rgba(255,255,255,0.10)
syntax: comments #5e8c6a, strings #d9a45b, keywords #ef4444, numbers #b58cf0
fonts: message = sans-serif 20px leading-9; code + labels = font-mono
easing cubic-bezier(0.4,0,0.2,1)

=== TRIGGER ===
An anchor element placed between the principles section and the camera section.
IntersectionObserver, threshold 0.6. Lock body scroll for the duration, then release.

=== PART 1 - THE INTERRUPTION (timeline; the pacing IS the effect) ===

t=0.00s  The flashlight EXTINGUISHES.
         Torch radius 220px -> 0px over 0.25s ease-in. Darkness layer opacity snaps
         to 1.00 over the same 0.25s. ALL audio cuts to silence instantly - a hard
         cut, not a fade. The abruptness of the silence is the effect.

t=0.25s  TOTAL DARKNESS AND SILENCE. Nothing on screen. Nothing audible.

t=0.85s  Hold. Still nothing.
         (This 0.6-second void is the single most important beat on the page.
          Do not shorten it. Do not fill it.)

t=0.90s  The flashlight RE-IGNITES - but NOT at the cursor.
         It ignites at the exact CENTER of the viewport, radius 0px -> 260px over
         0.6s ease-out. It does NOT follow the mouse. Moving the mouse does nothing.
         A single very quiet low tone fades in (volume cap 0.10).

t=1.30s  A message fades in inside the beam, centered, max-width 500px, two lines:
           Line 1, 20px, rgba(255,255,255,0.82), leading-9, VERBATIM:
             "지금 커서를 움직여도 빛이 따라오지 않습니다."
           Line 2, 20px, color #ff5a4d, font-bold, margin-top 12px, VERBATIM:
             "이게 「카메라를 뺏는다」입니다."
         Reveal line 1 word by word (stagger 0.05s), then line 2 after 0.5s.

t=2.60s  CONTROL RETURNS.
         The torch center animates from viewport center to the current cursor
         position over 0.4s. The message fades out (0.35s). Torch radius eases back
         to 220px. Darkness opacity animates back to its scroll-driven value (~0.55)
         over 0.5s. Ambient audio fades back in over 0.8s. Body scroll unlocks.

t=3.00s  Normal state fully restored.

=== PART 2 - THE IMMEDIATE CODE REVEAL (the substance; do not separate it) ===

t=3.30s  In the normal page flow, exactly where the anchor was, a code panel fades
         up (y 20px -> 0, 0.8s). Full column width, max-width 820px, centered.

         Above it, a single line, font-mono 12px, color #ff5a4d, VERBATIM:
           "// 방금 그 3초를 게임에서 만든 코드"

         Code panel: rounded-md, border 1px rgba(255,255,255,0.10), background
         #0b0708. Header bar with three window dots (#ff5f56 #ffbd2e #27c93f, 9px)
         and the filename in font-mono 11px rgba(255,255,255,0.45),
         VERBATIM: "CameraDirector.cs"
         Body: font-mono 12px, leading-relaxed, line-number gutter
         (rgba(255,255,255,0.20), min-width 20px, right-aligned, user-select none).
         Highlighted rows get a rgba(239,68,68,0.10) full-width background.

         CODE CONTENT: Unity C#, roughly 18 lines. Show a camera director that
         holds references to a player virtual camera and a cutscene virtual camera,
         and a coroutine that: disables player input, raises the cutscene camera's
         Priority above the player camera's, waits for the blend duration, holds,
         then lowers it back and re-enables input.
         HIGHLIGHT: the two Priority assignment lines and the input re-enable line.

         Caption bar at the bottom (border-top 1px, font-mono 11px,
         rgba(255,255,255,0.42), prefixed "// "), VERBATIM:
           "Priority만 바꾸면 전환과 블렌딩은 Cinemachine이 처리한다"

t=4.20s  Below the code panel, one paragraph fades in, 16px leading-9,
         rgba(255,255,255,0.82), max-width 720px, VERBATIM:
         "제어권을 뺏는 코드는 다섯 줄이면 된다. 어려운 건 돌려주는 쪽이었다.
          연출 도중에 씬이 바뀌거나 플레이어가 죽으면 입력이 잠긴 채로 남았다.
          이 버그를 잡는 데 3일이 걸렸고, 그 얘기는 조금 뒤에 하겠다."
         Emphasize "어려운 건 돌려주는 쪽이었다" in #ff5a4d, font-bold.
         This is a deliberate hook for the troubleshooting section - keep it exactly.

=== REDUCED-MOTION / SKIPPED FALLBACK ===
Skip Part 1 entirely and render a static card in the normal flow, followed by the
same Part 2 code panel (Part 2 always renders regardless).
  Card: padding 24px, rounded-md, border 1px rgba(239,68,68,0.30),
  background rgba(239,68,68,0.05)
  Label font-mono 11px #ef4444, VERBATIM: "▲ 생략된 연출"
  Body 15px leading-8, VERBATIM:
  "이 지점에서 원래는 화면이 3초간 어두워지고 손전등이 커서를 따라오지 않습니다.
   플레이어에게서 카메라를 뺏는다는 설계 원칙을 그대로 옮긴 연출입니다."
  Button font-mono 12px, VERBATIM: "[ 지금 재생하기 ]"

=== RESPONSIVE ===
Touch devices: the flashlight is normally centered anyway, so demonstrate loss of
control by making the beam DRIFT slowly toward the upper-left during t=0.90s-2.60s
while ignoring all touch input. Message 17px, max-width 90vw.
< 768px: code font-size 11px with internal horizontal scroll (block scrolls, never
the page).

=== ACCESSIBILITY ===
Announce the message via an aria-live="polite" region. Body scroll lock MUST be
released even if the component unmounts mid-sequence (clean up in the effect return).
Audio hard-capped at 0.10. Code is selectable, copyable text - never an image.

=== DO NOT ===
Do not play any sound at the moment of blackout - the silence IS the effect.
Do not shorten the 0.6s void. Do not add particles, glitch, or visual noise.
Do not let Part 1 fire more than once per session under any circumstance.
Do not omit Part 2 - the experience without its code is just a gimmick.
```

---

## PAGE 05 — 왜 Cinemachine이었나 · 직접 구현과의 비교

**개발 실체**: 기술 선택 근거 + 실패한 첫 구현(직접 Lerp) + **DOTween 시퀀스 코드**
**연출 장치**: 두 방식의 카메라 이동을 토글로 즉시 비교 — 어색함과 부드러움을 눈으로

```text
Build a TECHNICAL COMPARISON section with an interactive camera-motion demo that
lets the viewer feel the difference between a hand-rolled Lerp implementation and
Cinemachine blending, for a Unity horror game portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That the first implementation was hand-written Lerp, and WHY it failed
2. What Cinemachine changed, in concrete terms (not "it was better")
3. Real DOTween sequence code and real input-lock code
4. An honest cost: what was given up by adopting Cinemachine

=== MOOD ===
Lights are noticeably up. The tone has shifted from horror experience to a developer
explaining engineering decisions. Still dark and cinematic, but readable and confident.
This is the most technical page so far.

=== DESIGN TOKENS (use exactly) ===
background #070405 | primary red #ef4444 | accent #ff5a4d
bad #f87171 | good #4ade80
text rgba(255,255,255,0.82) | muted rgba(255,255,255,0.42)
code bg #0b0708, border rgba(255,255,255,0.10)
syntax: comments #5e8c6a, strings #d9a45b, keywords #ef4444, numbers #b58cf0
fonts: headings font-black, body sans leading-8, ALL code font-mono 12px leading-relaxed
easing cubic-bezier(0.4,0,0.2,1) 0.5s-1.0s | rounded-md
film grain SVG noise opacity 0.055

=== LAYOUT ===
Single centered column, max-width 900px (wider - code needs room).
  Block A : label + heading + three paragraphs
  Block B : the interactive camera comparison demo, full width, 400px tall
  Block C : two code blocks stacked, 24px gap
  Block D : an honest-cost card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.42)):
  "03 · 왜 Cinemachine이었나"

HEADING (32px font-black):
  "처음엔 카메라를 직접 움직였다"

PARAGRAPH 1 (17px leading-9, margin-top 20px):
  "Lerp로 회전시키고, 다 되면 제어권을 돌려주는 식으로 짰다. 동작은 했다.
   문제는 전환이 어색했다는 것이다. 시작할 때 급하게 꺾이고, 끝날 때 툭 끊겼다."
  Emphasize "전환이 어색했다" in #ff5a4d, font-bold.

PARAGRAPH 2 (17px leading-9, margin-top 24px):
  "이징 곡선을 손으로 만지면서 며칠을 썼다. 한 연출이 자연스러워지면
   다른 연출이 어색해졌다. 연출마다 다른 곡선이 필요했고, 그걸 전부 코드로
   들고 있어야 했다."

PARAGRAPH 3 (17px leading-9, margin-top 24px):
  "Cinemachine의 가상 카메라로 바꾸고 나서는 어디를 보게 할지만 정하면
   블렌딩이 알아서 처리됐다. 연출 하나 만드는 시간이 절반 이하로 줄었다."

=== BLOCK B: CAMERA COMPARISON DEMO (centerpiece) ===
Container: full width, height 400px, rounded-md,
border 1px rgba(255,255,255,0.10), background #0b0708, overflow hidden.

Header strip (34px, border-bottom 1px rgba(255,255,255,0.08)):
  left   font-mono 11px rgba(255,255,255,0.42) VERBATIM: "▸ CAMERA HANDOFF"
  center a two-option toggle, font-mono 11px, options VERBATIM:
           "직접 Lerp 구현"  |  "Cinemachine 블렌드"
         Active: background rgba(255,90,77,0.14), color #ff5a4d.
         Inactive: rgba(255,255,255,0.42). rounded, padding 5px 12px.
  right  a play button, font-mono 11px, VERBATIM: "[ ▶ 재생 ]"

Main area: a CSS-rendered first-person view of a dark room in perspective.
  back wall #0e0a0b, floor trapezoid #0b0708,
  a DOOR shape on the left wall (tall rectangle #16100f),
  a faint warm light strip behind the door.
  The whole scene sits in a wrapper div whose transform (rotateY) represents the
  camera direction. Default rotateY(0deg).

Below the scene, a timeline track (height 44px, padding 0 20px) with three labeled
segments connected by lines, font-mono 10px, VERBATIM labels:
  "플레이어 제어"  ---- blend ---->  "연출 카메라"  ---- blend ---->  "플레이어 복귀"
A playhead dot travels along this track during playback.

PLAYBACK: pressing play animates the scene wrapper rotateY 0deg -> -28deg (looking
at the door), holds 0.8s, returns to 0deg.

  MODE A - "직접 Lerp 구현":
    transition-timing-function: linear, duration 0.45s each way.
    At the start and end of each move apply a visible 1-frame snap (an abrupt 3deg
    jump) so the motion stutters at the boundaries.
    The playhead moves in visible steps, not smoothly.
    Label under the timeline, font-mono 11px, color #f87171, VERBATIM:
      "시작과 끝이 툭 끊긴다"

  MODE B - "Cinemachine 블렌드":
    cubic-bezier(0.4, 0, 0.2, 1), 0.6s out / 0.4s back. No snapping.
    The playhead glides continuously.
    Label, font-mono 11px, color #4ade80, VERBATIM:
      "블렌딩이 자동으로 처리된다"

Switching modes mid-playback restarts in the new mode. Make switching instant and
the difference unmistakable. THIS COMPARISON IS THE ENTIRE VALUE OF THE DEMO -
the viewer is expected to toggle back and forth several times.

Footer strip (border-top 1px rgba(255,255,255,0.08), font-mono 11px,
rgba(255,255,255,0.42), padding 8px 14px), VERBATIM:
  "// 실제 게임에서는 Cinemachine 가상 카메라의 Priority를 바꿔 전환합니다"

=== BLOCK C: TWO CODE BLOCKS ===
Styling for each: rounded-md, border 1px rgba(255,255,255,0.10), background #0b0708,
header bar with three window dots and a filename (font-mono 11px
rgba(255,255,255,0.45)), line-number gutter (rgba(255,255,255,0.20), min-width 20px,
right-aligned, user-select none), highlighted rows with rgba(239,68,68,0.10)
full-width background, and a caption bar at the bottom prefixed with "// ".

CODE BLOCK 1
  filename VERBATIM: "DoorRevealSequence.cs"
  language C#, roughly 15 lines.
  Content: a DOTween Sequence - create the sequence, append a door rotation tween,
  join a light-intensity tween so they run together, append an interval, then append
  a callback that restores player control.
  HIGHLIGHT: the Join line and the AppendCallback line.
  caption VERBATIM: "여러 트윈의 타이밍을 Sequence 하나로 묶었다"

CODE BLOCK 2
  filename VERBATIM: "PlayerInputLock.cs"
  language C#, roughly 13 lines.
  Content: Unity Input System - a method that disables the player action map when a
  cutscene starts and re-enables it when it ends, wrapped so that the re-enable is
  guaranteed even if the cutscene throws or exits early.
  HIGHLIGHT: the re-enable line and the guarantee construct around it.
  caption VERBATIM: "이 보장 장치가 없어서 3일을 날렸다 — 다음 섹션에서 다룬다"
  The caption for block 2 uses color #ff5a4d instead of the usual muted color.

=== BLOCK D: HONEST COST CARD ===
Margin-top 48px, padding 24px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 11px letter-spacing 0.2em rgba(255,255,255,0.48),
  VERBATIM: "대신 포기한 것"
  Body 15px leading-8 margin-top 12px, VERBATIM:
  "Cinemachine을 쓰면 카메라가 왜 그렇게 움직였는지 추적하기가 어려워진다.
   블렌드가 꼬였을 때 내 코드가 아니라 컴포넌트 설정을 의심해야 했고,
   그걸 파악하는 데 처음엔 시간이 더 걸렸다.
   연출 개수가 다섯 개를 넘어가면서 그 비용보다 얻는 게 확실히 커졌다."

  This card is important: a decision section without a stated cost reads as
  marketing. Do not soften it or remove it.

=== FLASHLIGHT LAYER ===
Same fixed darkness layer, mask-image radial-gradient(circle 220px at var(--mx)
var(--my), transparent 0%, black 70%), CSS variables in requestAnimationFrame,
never React state. Darkness opacity eases 0.55 -> 0.30 across this section.
Header readout shows values like "○ 조명 58%".
Give code blocks a local glow (box-shadow inset 0 0 60px rgba(255,240,220,0.05))
so they stay readable outside the beam.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label fades in
0.15s  Heading reveals character by character with a 3px blur clearing (stagger 0.02s)
0.60s  Paragraphs reveal word by word sequentially (stagger 0.02s)
2.00s  Demo container fades up (y 24px -> 0, 0.8s); the room renders; the timeline
       track draws itself left to right (0.6s)
3.00s  Code blocks fade up 0.2s apart, each lifting 16px
3.60s  Cost card slides in from the left (x -14px -> 0, 0.8s)
Hover a code block: lifts 3px, border brightens to rgba(255,255,255,0.20),
box-shadow 0 12px 32px rgba(239,68,68,0.12)

=== RESPONSIVE ===
< 768px: demo height 320px; the mode toggle stacks above the play button;
code font-size 11px with internal horizontal scroll (block scrolls, never the page);
cost card padding 18px.
Touch: flashlight pinned to center, radius 320px.

=== ACCESSIBILITY ===
prefers-reduced-motion: fully lit, no flashlight, entrance animations instant;
the demo still plays on button press with shortened durations.
Code must be selectable, copyable text - never an image.
The mode toggle must be a real radio group, keyboard operable.

=== DO NOT ===
Do not use a syntax highlighting library - hand-color tokens with spans.
Do not make code dimmer than rgba(255,255,255,0.85).
Do not remove the honest-cost card. No gore, no jump scares - that part is over.
```

---

## PAGE 06 — 트러블슈팅 01 · 제어권이 잠긴 채 남는다 ⭐

**개발 실체**: **가장 오래 걸린 버그의 전 과정** — 증상 / 재현 / 의심하고 소거한 것들 / 실패한 시도 / 진짜 원인 / 해결 코드 / 검증
**연출 장치**: **페이지가 실제로 1.5초 스크롤을 잠근다** → "방금 그게 그 버그입니다"
**⚠️ 세션당 1회 · 예고 · 건너뛰기 가능**

```text
Build a TROUBLESHOOTING section that reproduces the bug on the viewer before
explaining it, then walks through the full debugging process, for a Unity horror
game portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER (this is the most important page for engineers) ===
1. The symptom, precisely stated
2. The reproduction conditions
3. What was suspected and RULED OUT, with the reason each was eliminated
4. An attempted fix that FAILED, and why it failed
5. The actual root cause
6. The fix, with real code
7. Verification - how it was confirmed fixed
8. What still remains unsolved
A troubleshooting story with no failed attempts and no remaining limitation is not
believable. Keep all of them.

=== MOOD ===
Lights are mostly up. Clinical, investigative, honest. This reads like a case file,
not a horror scene. The only theatrical moment is the scroll lock at the start.

=== DESIGN TOKENS (use exactly) ===
background #070405 | primary red #ef4444 | accent #ff5a4d
bad #f87171 | good #4ade80 | warn #fbbf24
text rgba(255,255,255,0.82) | muted rgba(255,255,255,0.42)
panel bg #0b0708, border rgba(255,255,255,0.10)
syntax: comments #5e8c6a, strings #d9a45b, keywords #ef4444, numbers #b58cf0
fonts: headings font-black, body sans leading-8, ALL technical content font-mono
easing cubic-bezier(0.4,0,0.2,1) 0.4s-1.0s | rounded-md
film grain SVG noise opacity 0.045

=== LAYOUT ===
Single centered column, max-width 900px, padding-block 120px.
  Block A : the scroll-lock moment + reveal line
  Block B : case-file header (symptom / reproduction)
  Block C : the elimination table (suspects ruled out)
  Block D : the failed attempt card
  Block E : root cause + fix code
  Block F : verification bar + remaining limitation

=== BLOCK A: THE SCROLL LOCK (theatrical opening) ===

ADVANCE WARNING: 240px above this section, render a small inline notice,
font-mono 12px, color #fbbf24, VERBATIM:
  "▲ 아래에서 스크롤이 1.5초간 잠깁니다 · [ 건너뛰기 ]"
The skip button sets a session flag that disables the lock.

TRIGGER: IntersectionObserver on an anchor at the top of this section, threshold 0.7.
Fires at most ONCE per session (sessionStorage flag). Never fires under
prefers-reduced-motion or if skipped.

SEQUENCE:
t=0.00s  Body scroll locks. Wheel, touchmove, and keyboard scrolling are all blocked.
         The page does NOT move. No visual change at all yet - the viewer just finds
         that scrolling does nothing. This confusion is the point.
t=0.35s  A thin progress bar appears at the very top of the viewport, height 2px,
         color #f87171, width animating 0% -> 100% over the remaining 1.15s.
t=0.60s  A small line fades in at the center of the viewport, font-mono 13px,
         color #f87171, VERBATIM: "입력이 잠겼습니다"
t=1.50s  Scroll unlocks. The progress bar flashes once to #4ade80 then fades out.
         Body scroll is restored.
t=1.70s  THE REVEAL LINE fades up in the normal page flow, 22px, font-black,
         rgba(255,255,255,0.86), max-width 720px, VERBATIM:
         "방금 스크롤이 잠겼습니다. 게임에서는 이것 때문에 3일을 썼습니다."
         Emphasize "3일을 썼습니다" in #ff5a4d.
         Reveal word by word, stagger 0.05s.

SAFETY: the scroll lock MUST be released even if the component unmounts mid-sequence
(clean up in the effect return). Escape releases it immediately. Never lock for
longer than 1.5s under any circumstance. Never lock more than once per session.

FALLBACK (reduced-motion or skipped): render the reveal line immediately with a
preceding note, font-mono 12px rgba(255,255,255,0.42), VERBATIM:
  "// 원래 이 지점에서 스크롤이 1.5초간 잠깁니다"

=== BLOCK B: CASE FILE HEADER ===
A panel, full width, rounded-md, border 1px rgba(248,113,113,0.30),
background rgba(248,113,113,0.04), padding 24px, margin-top 48px.

  Top row: a case label, font-mono 11px letter-spacing 0.25em color #f87171,
  VERBATIM: "TROUBLE 01"
  and on the right, a severity tag, font-mono 10px, background rgba(248,113,113,0.16),
  color #f87171, padding 3px 10px, rounded, VERBATIM: "치명적 · 진행 불가"

  Title, 26px font-black, margin-top 10px, VERBATIM:
  "연출이 끝나도 플레이어가 움직이지 않는다"

  Two labeled rows below, each: label in a fixed 80px column (font-mono 11px,
  rgba(255,255,255,0.42), uppercase) and content on the right (15px leading-8).

  Label VERBATIM "증상" -> content VERBATIM:
    "컷신이 끝난 뒤에도 이동과 시점 조작이 먹지 않는다. 게임은 멈추지 않고
     오브젝트도 정상 동작하는데 플레이어만 조작 불가 상태로 남는다."

  Label VERBATIM "재현" -> content VERBATIM:
    "컷신 재생 중에 다른 트리거를 밟거나, 컷신 도중 씬을 다시 로드하면 100% 재현.
     정상적으로 컷신을 끝까지 보면 재현되지 않는다."

  Below these, a reproduction-rate chip, font-mono 11px,
  background rgba(248,113,113,0.14), color #f87171, padding 4px 10px, rounded,
  VERBATIM: "조건 충족 시 재현율 100%"

=== BLOCK C: THE ELIMINATION TABLE (what was suspected and ruled out) ===
Section label above, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.42),
VERBATIM: "▸ 의심한 것과 제외한 이유"

A table with three columns, header row separated by 1px rgba(255,255,255,0.10):
  col 1 (fixed 30%) "의심"      col 2 (fixed 18%) "결과"     col 3 (rest) "근거"
Header cells: font-mono 10px uppercase letter-spacing 0.15em rgba(255,255,255,0.35).
Body rows: 1px bottom border rgba(255,255,255,0.06), padding-block 14px, 14px text.
The "결과" cell holds a tag: "제외" in #4ade80 or "원인" in #f87171,
font-mono 11px, background at 14% opacity, padding 3px 10px, rounded.

Rows (Korean, VERBATIM):
  Row 1  의심 "Input System 액션맵이 비활성 상태"
         결과 "제외"
         근거 "로그를 찍어보니 액션맵은 enabled로 돌아와 있었다"
  Row 2  의심 "Cinemachine 카메라가 플레이어에게 안 돌아옴"
         결과 "제외"
         근거 "Priority는 정상 복귀. 시점은 플레이어 위치에 있었다"
  Row 3  의심 "Time.timeScale이 0으로 남음"
         결과 "제외"
         근거 "다른 오브젝트와 애니메이션은 정상 동작 중이었다"
  Row 4  의심 "컷신 완료 콜백이 아예 호출되지 않음"
         결과 "원인"
         근거 "DOTween Sequence가 중간에 Kill되면 OnComplete가 실행되지 않는다"

  Row 4 has a persistent left border 2px #f87171 and a slightly brighter background
  rgba(248,113,113,0.05).

REVEAL ANIMATION: rows appear one at a time as the section scrolls into view, 0.25s
apart, each sliding in from the left (x -12px -> 0). The "결과" tag on each row lands
0.2s after its row, with a small scale pop (0.9 -> 1). Row 4's "원인" tag pops with
a single red glow pulse.
This staggered reveal reproduces the feeling of narrowing down a bug. Do not reveal
all rows at once.

=== BLOCK D: THE FAILED ATTEMPT ===
A card, margin-top 40px, padding 22px, rounded-md,
border 1px rgba(251,191,36,0.28), background rgba(251,191,36,0.04).
  Label font-mono 11px letter-spacing 0.2em color #fbbf24,
  VERBATIM: "✗ 실패한 시도"
  Body 15px leading-8 margin-top 10px, VERBATIM:
  "처음엔 컷신이 끝날 때마다 입력을 다시 켜는 코드를 여기저기 추가했다.
   그랬더니 이번엔 컷신 도중에 입력이 잠깐씩 풀렸다.
   원인이 아니라 증상을 여러 군데서 덮은 것이라 새로운 버그만 늘었다."
  Emphasize "증상을 여러 군데서 덮은 것" in #fbbf24, font-bold.

=== BLOCK E: ROOT CAUSE + FIX ===
Section label, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.42),
VERBATIM: "▸ 진짜 원인과 해결"

Cause paragraph, 17px leading-9, margin-top 14px, VERBATIM:
  "입력을 되돌리는 책임이 연출 코드 안에 있었던 게 문제였다.
   연출이 끝까지 실행되는 걸 전제로 짜여 있었기 때문에, 연출이 중간에 죽으면
   되돌릴 사람이 아무도 없었다."
  Emphasize "연출이 끝까지 실행되는 걸 전제로" in #ff5a4d, font-bold.

Solution paragraph, 17px leading-9, margin-top 20px, VERBATIM:
  "그래서 입력 제어를 연출에서 떼어내 상태 쪽으로 옮겼다.
   컷신은 이제 '연출 중'이라는 상태를 켜고 끌 뿐이고, 입력을 켤지 말지는
   그 상태를 보고 한 곳에서 결정한다. 연출이 어떻게 끝나든 상태는 반드시 정리된다."

Then a BEFORE / AFTER code pair, side by side on desktop (gap 16px), stacked below
1024px. Both use the standard code panel styling (rounded-md, border 1px
rgba(255,255,255,0.10), background #0b0708, three window dots, filename in
font-mono 11px, line-number gutter, caption bar prefixed "// ").

  BEFORE panel: header dot color accent replaced with #f87171 border tint
    (border 1px rgba(248,113,113,0.28))
    filename VERBATIM: "CutsceneController.cs  (before)"
    C#, roughly 12 lines: a coroutine that disables input, plays a DOTween sequence,
    and re-enables input inside the sequence's OnComplete callback.
    HIGHLIGHT the OnComplete line.
    caption VERBATIM: "시퀀스가 죽으면 이 줄은 실행되지 않는다"
    caption color #f87171

  AFTER panel: border 1px rgba(74,222,128,0.28)
    filename VERBATIM: "PlayState.cs  (after)"
    C#, roughly 14 lines: a state object exposing a cutscene-active flag; a single
    place that decides whether input is enabled by observing that flag; and the
    cutscene controller merely setting and clearing the flag inside a construct that
    guarantees clearing on any exit path.
    HIGHLIGHT the guaranteed-clear construct and the single input decision point.
    caption VERBATIM: "연출이 어떻게 끝나든 상태는 정리된다"
    caption color #4ade80

=== BLOCK F: VERIFICATION + REMAINING LIMITATION ===
A verification bar, margin-top 40px, full width, rounded-md,
border 1px rgba(74,222,128,0.28), background rgba(74,222,128,0.04), padding 20px.
  Label font-mono 11px letter-spacing 0.2em color #4ade80, VERBATIM: "✓ 검증"
  Body 15px leading-8 margin-top 10px, VERBATIM:
  "재현 조건 세 가지를 각각 20회씩 반복해 확인했다.
   컷신 도중 트리거 진입, 컷신 도중 씬 재로드, 컷신 도중 플레이어 사망.
   세 경우 모두 입력이 정상 복구됐다."
  Below it, three small result chips in a row, font-mono 11px, color #4ade80,
  background rgba(74,222,128,0.12), padding 4px 10px, rounded, VERBATIM:
    "트리거 중복 20/20"   "씬 재로드 20/20"   "사망 20/20"

A remaining-limitation card below, margin-top 20px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 11px letter-spacing 0.2em rgba(255,255,255,0.48),
  VERBATIM: "아직 남은 것"
  Body 15px leading-8 margin-top 10px, VERBATIM:
  "연출 중 씬을 재로드하면 카메라가 한 프레임 정도 이전 위치에서 시작한다.
   플레이에는 지장이 없어서 프로토타입 단계에서는 남겨뒀다."

  Keep this card. A troubleshooting story that ends with everything perfect is not
  believable.

=== ANIMATION TIMELINE (after the scroll-lock moment) ===
0.00s  Case file header panel fades up (y 20px -> 0, 0.7s); the severity tag pops
0.60s  Symptom and reproduction rows reveal word by word
1.40s  Elimination table header appears; rows then stagger in 0.25s apart with their
       result tags landing 0.2s behind each row
3.00s  Failed attempt card slides in from the left
3.40s  Cause and solution paragraphs reveal
4.20s  Before/After code panels fade up together, After 0.2s behind Before
4.80s  Verification bar fades in; the three result chips pop in 0.1s apart
5.20s  Remaining limitation card fades in

=== RESPONSIVE ===
< 1024px: Before/After code panels stack vertically (Before first).
< 768px: elimination table becomes stacked cards (의심 / 결과 tag / 근거 in a column);
code font-size 11px with internal horizontal scroll; verification chips wrap.
Touch: flashlight pinned to center, radius 320px.

=== FLASHLIGHT LAYER ===
Same fixed darkness layer, driven by CSS variables in requestAnimationFrame.
Darkness opacity eases 0.30 -> 0.16 across this section.
Header readout shows values like "○ 조명 76%".
Give all panels a local glow so technical content stays legible.

=== ACCESSIBILITY ===
prefers-reduced-motion: no scroll lock at all, no staggered reveals - everything
renders immediately.
The scroll lock must be releasable with Escape and must never persist after unmount.
The elimination table must be a real <table> with proper headers for screen readers.
All code selectable and copyable.

=== DO NOT ===
Do not remove the failed attempt, the ruled-out suspects, or the remaining limitation.
Do not lock scroll for longer than 1.5s, more than once per session, or without the
advance warning.
Do not make this page look like a horror scene - it is a case file.
```

---

## PAGE 07 — 트러블슈팅 02 · 매 프레임 레이캐스트

**개발 실체**: 성능 문제 발견 → 측정 → 최적화 → **수치로 검증**
**연출 장치**: 관람객 눈앞에서 **호출 카운터가 초당 60씩 상승** → 토글하면 그래프가 꺾임

```text
Build a PERFORMANCE TROUBLESHOOTING section with a live counter demo, for a Unity
horror game portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. How the performance problem was NOTICED (not assumed)
2. How it was MEASURED before optimizing
3. The optimization itself, with real code
4. The measured result after
5. Explicit acknowledgement of what was NOT measured, so the numbers are not overclaimed

=== MOOD ===
Lights are nearly up. Analytical, measured, calm. This is a profiling story.
The only drama is a number climbing relentlessly in front of the viewer.

=== DESIGN TOKENS (use exactly) ===
background #070405 | primary red #ef4444 | accent #ff5a4d
bad #f87171 | good #4ade80 | warn #fbbf24
text rgba(255,255,255,0.82) | muted rgba(255,255,255,0.42)
panel bg #0b0708, border rgba(255,255,255,0.10)
syntax: comments #5e8c6a, strings #d9a45b, keywords #ef4444, numbers #b58cf0
fonts: headings font-black, body sans leading-8, ALL numbers and code font-mono
       with font-variant-numeric: tabular-nums (numbers must not jitter)
easing cubic-bezier(0.4,0,0.2,1) 0.4s-1.0s | rounded-md
film grain SVG noise opacity 0.045

=== LAYOUT ===
Single centered column, max-width 900px, padding-block 120px.
  Block A : case header + how it was noticed
  Block B : the live counter demo (centerpiece), full width, 360px tall
  Block C : measurement table (before)
  Block D : the fix, with code
  Block E : measured result + what was not measured

=== CONTENT (Korean copy - VERBATIM, never translate) ===

CASE LABEL (font-mono 11px, letter-spacing 0.25em, color #fbbf24):
  "TROUBLE 02"

TITLE (26px font-black, margin-top 10px):
  "아무 일도 안 하는데 프레임이 떨어졌다"

HOW IT WAS NOTICED (17px leading-9, margin-top 20px), VERBATIM:
  "가만히 서 있기만 해도 프레임이 조금씩 흔들렸다. 처음엔 조명이나 포스트 프로세싱을
   의심했는데, 둘 다 꺼도 똑같았다. 프로파일러를 켜고 나서야 범인이 보였다.
   상호작용 판정용 레이캐스트가 매 프레임 돌고 있었다."
  Emphasize "프로파일러를 켜고 나서야" in #ff5a4d, font-bold.

SECOND PARAGRAPH (17px leading-9, margin-top 20px), VERBATIM:
  "앞에서 본 그 코드다. 플레이어가 무엇을 보고 있는지 알아야 하니까
   매 프레임 화면 중앙에서 레이를 쐈다. 동작에는 문제가 없었다.
   문제는 아무것도 볼 게 없는 순간에도 똑같이 쐈다는 것이다."
  (This explicitly calls back to the raycast code shown earlier on the page.)

=== BLOCK B: LIVE COUNTER DEMO (centerpiece) ===
Container: full width, height 360px, rounded-md, border 1px rgba(255,255,255,0.10),
background #0b0708, overflow hidden.

Header strip (34px, border-bottom 1px rgba(255,255,255,0.08)):
  left  font-mono 11px rgba(255,255,255,0.42) VERBATIM: "▸ RAYCAST 호출 수 · 실시간"
  right a two-option toggle, font-mono 11px, VERBATIM:
          "최적화 전"  |  "최적화 후"
        Active "최적화 전": background rgba(248,113,113,0.14), color #f87171
        Active "최적화 후": background rgba(74,222,128,0.14), color #4ade80

Main area, split into two parts:

  TOP (height 120px): a single huge counter, centered.
    font-mono, 56px, font-black, tabular-nums.
    "최적화 전" mode: the number increments by 60 every second (simulating 60 fps),
    color #f87171, and never stops climbing while visible.
    "최적화 후" mode: the number increments by roughly 8 per second, color #4ade80.
    Below it, a label, font-mono 12px, rgba(255,255,255,0.42), VERBATIM:
      "누적 Raycast 호출"
    Next to the number, a small rate chip, font-mono 11px, VERBATIM format:
      "최적화 전" -> "초당 60회"      "최적화 후" -> "초당 약 8회"

  BOTTOM (height ~170px): a live line chart, full width.
    X axis = time (a rolling 20-second window), Y axis = calls per second.
    The line is drawn as an SVG polyline that scrolls right to left.
    In "최적화 전" the line sits flat and high at 60.
    When the viewer switches to "최적화 후", the line VISIBLY DROPS and settles low
    around 8 - and the previous high segment stays on the chart so the drop is
    visible as a step down. THIS DROP IS THE MONEY SHOT OF THIS PAGE.
    Grid lines at 0 / 30 / 60, font-mono 9px labels in rgba(255,255,255,0.25).
    A horizontal reference line at 60 in rgba(248,113,113,0.30), dashed.

  A reset button at bottom-right, font-mono 11px, VERBATIM: "↻ 초기화"

Footer strip (border-top 1px, font-mono 11px, rgba(255,255,255,0.42), padding 8px 14px),
VERBATIM: "// 실제 게임 수치가 아니라 호출 빈도 차이를 보여주는 도식입니다"
  This disclaimer is REQUIRED. Do not present the demo as real profiler output.

PERFORMANCE: the counter and chart must PAUSE when the container leaves the viewport
(IntersectionObserver) and resume on re-entry. Never run this loop in the background.

=== BLOCK C: MEASUREMENT TABLE (before optimizing) ===
Section label, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.42),
VERBATIM: "▸ 먼저 재봤다"

A three-row table. Columns: 항목 (40%) | 측정값 (30%) | 비고 (30%).
Header cells font-mono 10px uppercase rgba(255,255,255,0.35).
Rows 1px bottom border rgba(255,255,255,0.06), padding-block 14px, font-mono 14px.

  Row 1  항목 VERBATIM "Raycast 호출 / 초"     측정값 VERBATIM "60"
         비고 VERBATIM "정지 상태에서도 동일"
  Row 2  항목 VERBATIM "상호작용 대상이 있는 프레임 비율"  측정값 VERBATIM "약 12%"
         비고 VERBATIM "나머지 88%는 헛일"
  Row 3  항목 VERBATIM "판정 최대 거리"        측정값 VERBATIM "3m"
         비고 VERBATIM "그 밖은 어차피 판정 대상 아님"

  Row 2's 측정값 cell is colored #f87171 and font-bold - it is the insight that
  drove the fix.

Below the table, one line, 15px leading-8, VERBATIM:
  "88퍼센트가 헛일이라는 걸 보고 나서야 어디를 고쳐야 할지가 정해졌다."

=== BLOCK D: THE FIX ===
Section label, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.42),
VERBATIM: "▸ 고친 방법"

Three short strategy chips in a row (stacking below 768px), each a card:
padding 16px, rounded-md, border 1px rgba(74,222,128,0.24),
background rgba(74,222,128,0.04).
  Chip 1 title VERBATIM "판정 주기를 낮췄다"
         body  VERBATIM "매 프레임이 아니라 0.12초 간격으로"
  Chip 2 title VERBATIM "레이어 마스크를 걸었다"
         body  VERBATIM "상호작용 레이어만 검사하도록 제한"
  Chip 3 title VERBATIM "결과를 캐싱했다"
         body  VERBATIM "같은 대상이면 프롬프트를 다시 만들지 않음"
Chip titles: 14px font-black rgba(255,255,255,0.86). Bodies: 13px leading-7
rgba(255,255,255,0.62), margin-top 6px.

Then one code block, standard styling (rounded-md, border 1px rgba(255,255,255,0.10),
background #0b0708, three window dots, filename font-mono 11px, line-number gutter,
highlighted rows rgba(74,222,128,0.10), caption bar prefixed "// ").
  filename VERBATIM: "Interactor.cs  (after)"
  C#, roughly 18 lines. Show: an accumulating timer that gates the raycast to a
  fixed interval, a LayerMask field passed into the raycast call, and an early return
  when the newly hit target is the same as the cached one.
  HIGHLIGHT: the interval gate line, the LayerMask argument, and the cache
  early-return line.
  caption VERBATIM: "0.12초 간격이면 조작감에 차이가 느껴지지 않았다"

A short honesty note under the code, 14px leading-8, rgba(255,255,255,0.62), VERBATIM:
  "0.12초는 여러 값을 넣어보고 정했다. 0.2초부터는 반응이 늦다고 느껴졌다."

=== BLOCK E: RESULT + WHAT WAS NOT MEASURED ===
A result bar, rounded-md, border 1px rgba(74,222,128,0.28),
background rgba(74,222,128,0.04), padding 20px.
  Label font-mono 11px letter-spacing 0.2em color #4ade80, VERBATIM: "✓ 결과"
  A two-cell comparison inside, side by side:
    Left  : label VERBATIM "이전"  value VERBATIM "초당 60회"  color #f87171
    Right : label VERBATIM "이후"  value VERBATIM "초당 약 8회" color #4ade80
    Values 30px font-mono font-black tabular-nums, counting up from 0 when the bar
    scrolls into view.
    Between them a large arrow "→" in rgba(255,255,255,0.35).
  Below, one line, 15px leading-8, VERBATIM:
    "정지 상태에서 프레임 흔들림이 사라졌고, 조작감은 그대로였다."

A limitation card below, margin-top 20px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 11px letter-spacing 0.2em rgba(255,255,255,0.48),
  VERBATIM: "재보지 못한 것"
  Body 15px leading-8 margin-top 10px, VERBATIM:
  "프레임 타임을 숫자로 기록해두지 않아서 몇 ms가 줄었는지는 말할 수 없다.
   호출 횟수와 체감 차이만 확인했다. 다음 프로젝트에서는 프로파일러 캡처를
   먼저 남기고 시작할 생각이다."

  This card is REQUIRED. Claiming unmeasured performance numbers is the fastest way
  to lose credibility in an interview. Do not replace it with invented milliseconds.

=== FLASHLIGHT LAYER ===
Same fixed darkness layer, CSS variables updated in requestAnimationFrame,
never React state. Darkness opacity eases 0.16 -> 0.06 across this section.
Header readout shows values like "○ 조명 88%".

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Case label and title fade up
0.30s  Paragraphs reveal word by word (stagger 0.02s)
1.40s  Demo container fades up (y 20px -> 0); the counter starts climbing immediately
       in "최적화 전" mode; the chart line begins scrolling
2.40s  Measurement table header appears; rows stagger in 0.2s apart
3.20s  Strategy chips pop in 0.12s apart (scale 0.94 -> 1)
3.70s  Code block fades up
4.20s  Result bar fades in; both values count up
4.60s  Limitation card fades in

=== RESPONSIVE ===
< 768px: counter font-size 40px; chart height 140px; strategy chips stack vertically;
measurement table becomes stacked rows (항목 above, 측정값 and 비고 side by side);
code font-size 11px with internal horizontal scroll.
Touch: flashlight pinned to center, radius 320px.

=== ACCESSIBILITY ===
prefers-reduced-motion: the counter shows static representative values instead of
animating, the chart renders as a completed static line with the step-down visible,
and all reveals are instant.
Numbers use tabular-nums so they never jitter. The measurement table is a real
<table> with headers. All code selectable and copyable.
The demo loop must pause off-screen (battery).

=== DO NOT ===
Do not present the demo counter as real profiler data - the disclaimer is required.
Do not invent millisecond improvements. Do not remove the "재보지 못한 것" card.
```

---

## PAGE 08 — 구조 · ScriptableObject 리팩터링

**개발 실체**: 아키텍처 문제 인식 → 리팩터링 → 얻은 것 + **실제 코드** + 작업 범위
**연출 장치**: Before 다이어그램이 **실제로 분해되어 After로 재조립**됨

```text
Build an ARCHITECTURE REFACTORING section with a diagram that physically
disassembles and reassembles itself, for a Unity horror game portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The concrete pain the old structure caused in daily work
2. What ScriptableObject changed, in practical terms
3. Real C# for the state asset
4. An honest statement of the scope actually built by this developer

=== MOOD ===
Lights are almost fully up. A calm, confident engineering retrospective.
The horror atmosphere has receded; only the dark theme and faint grain remain.
Clarity is the priority.

=== DESIGN TOKENS (use exactly) ===
background #070405 | primary red #ef4444 | accent #ff5a4d
bad #f87171 | good #4ade80
text rgba(255,255,255,0.82) | muted rgba(255,255,255,0.42)
panel bg #0b0708, border rgba(255,255,255,0.10)
syntax: comments #5e8c6a, strings #d9a45b, keywords #ef4444, numbers #b58cf0
fonts: headings font-black, body sans leading-8, diagram labels + code font-mono
easing cubic-bezier(0.4,0,0.2,1) 0.5s-1.0s | rounded-md
film grain SVG noise opacity 0.045

=== LAYOUT ===
Single centered column, max-width 900px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : animated BEFORE -> AFTER diagram (centerpiece), 420px tall
  Block C : one code block
  Block D : work-scope table

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.42)):
  "04 · 구조 — ScriptableObject"

HEADING (32px font-black):
  "매니저 하나가 모든 걸 알고 있었다"

PARAGRAPH 1 (17px leading-9, margin-top 20px), VERBATIM:
  "캐릭터 상태(체력, 소지품, 이벤트 진행도)를 처음엔 매니저 스크립트 하나에 다 넣었다.
   씬을 넘나들 때마다 그 매니저를 찾는 코드가 늘었고,
   값을 하나 바꿔보려면 매번 코드를 열고 다시 빌드해야 했다."

PARAGRAPH 2 (17px leading-9, margin-top 24px), VERBATIM:
  "ScriptableObject로 데이터를 에셋으로 빼내고 나서 씬과 로직이 분리됐다.
   인스펙터에서 값을 바꿔가며 테스트할 수 있게 된 게 제일 컸다.
   밸런스를 만지는 데 빌드가 필요 없어졌다."
  Emphasize "씬과 로직이 분리됐다" in #ff5a4d, font-bold.

=== BLOCK B: ANIMATED ARCHITECTURE DIAGRAM (centerpiece) ===
Container: full width, height 420px, rounded-md,
border 1px rgba(255,255,255,0.10), background #0b0708, padding 28px.
Header strip: font-mono 11px rgba(255,255,255,0.42), VERBATIM: "▸ ARCHITECTURE"
Right side: a toggle, font-mono 11px, options VERBATIM "BEFORE" | "AFTER".
Active BEFORE uses #f87171; active AFTER uses #4ade80.

BEFORE STATE:
  One large box labeled VERBATIM "GameManager", 210px wide, centered,
  border 1px rgba(248,113,113,0.40), background rgba(248,113,113,0.05).
  Inside, a vertical stack of 6 items, font-mono 12px, Korean VERBATIM:
    "체력"  "소지품"  "이벤트 진행도"  "카메라 제어"  "사운드"  "... 계속 늘어남"
  The last item is color #f87171 and italic.
  Below, two scene boxes VERBATIM "Scene A" and "Scene B", each drawing a long
  curved arrow UP to the GameManager. The arrows must visibly CROSS each other.
  Caption under the diagram, font-mono 11px, color #f87171, VERBATIM:
    "씬이 늘어날 때마다 매니저를 찾는 코드가 늘었다"

AFTER STATE:
  A small asset box at the top labeled VERBATIM "PlayerState.asset", 190px wide,
  border 1px rgba(74,222,128,0.40), background rgba(74,222,128,0.05).
  Inside, only 3 items, font-mono 12px, VERBATIM: "체력"  "소지품"  "이벤트 진행도"
  Below it, the two scene boxes, each drawing a SHORT STRAIGHT arrow up to the asset.
  The arrows do not cross.
  To the side, a detached, de-emphasized box (opacity 0.5) labeled VERBATIM
  "GameManager" containing only VERBATIM "카메라 제어" and "사운드".
  Caption, font-mono 11px, color #4ade80, VERBATIM:
    "데이터가 에셋이 되니 씬은 참조만 하면 됐다"

TRANSITION ANIMATION (make this satisfying - it is the page's visual payoff):
  BEFORE -> AFTER:
    1. The first 3 items inside GameManager detach and float upward/outward toward
       the new asset box position (0.6s, staggered 0.08s)
    2. The tangled curved arrows fade out (0.3s) while straight arrows draw in
       using SVG stroke-dashoffset (0.5s)
    3. The GameManager box shrinks and fades to opacity 0.5 (0.5s)
    4. The asset box scales in from 0.9 with a single green glow pulse
    5. Captions cross-fade
  Toggling back reverses the whole animation.
  AUTO-PLAY: the first time the diagram enters the viewport it starts in BEFORE,
  waits 1.6s, then transitions to AFTER once automatically. Manual only after that.

=== BLOCK C: CODE BLOCK ===
Standard styling (rounded-md, border 1px rgba(255,255,255,0.10), background #0b0708,
three window dots, filename font-mono 11px rgba(255,255,255,0.45), line-number gutter
rgba(255,255,255,0.20), highlighted rows rgba(239,68,68,0.10), caption bar prefixed "// ").
  filename VERBATIM: "PlayerState.cs"
  C#, roughly 16 lines. Show: a [CreateAssetMenu] attribute, a class inheriting
  ScriptableObject, three serialized fields (health, an inventory list, an event
  progress value), and a reset method used when a new run starts.
  HIGHLIGHT: the [CreateAssetMenu] attribute line and the class declaration line.
  caption VERBATIM: "에셋으로 만들면 인스펙터에서 값을 바꿔가며 테스트할 수 있다"

A short caveat line under the code, 14px leading-8, rgba(255,255,255,0.62), VERBATIM:
  "대신 ScriptableObject는 플레이 모드에서 바꾼 값이 에디터에 그대로 남는다.
   테스트가 끝나면 초기화하는 걸 잊어서 몇 번 헷갈렸다."

=== BLOCK D: WORK SCOPE TABLE ===
Section label above, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.42),
VERBATIM: "▸ 내가 직접 만든 것"

Four rows. Each: category label in a fixed 92px column (font-mono 11px, uppercase,
letter-spacing 0.1em, color #ff5a4d), items on the right (14px, rgba(255,255,255,0.70),
separated by " · "). Row separators 1px rgba(255,255,255,0.08), padding-block 16px.
  Category VERBATIM "플레이어"  -> items VERBATIM
    "1인칭 이동 · Input System 연동 · 시야 제한"
  Category VERBATIM "상호작용"  -> items VERBATIM
    "레이캐스트 감지 · 프롬프트 UI · 오브젝트 반응"
  Category VERBATIM "연출"      -> items VERBATIM
    "Cinemachine 전환 · DOTween 시퀀스 · NPC 이벤트"
  Category VERBATIM "구조"      -> items VERBATIM
    "ScriptableObject 상태 설계 · 입력 제어 일원화"

=== FLASHLIGHT LAYER ===
Same fixed darkness layer, CSS variables in requestAnimationFrame, never React state.
Darkness opacity eases 0.06 -> 0.02 across this section (nearly fully lit).
Header readout shows values like "○ 조명 96%".

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label fades in
0.15s  Heading reveals word by word (stagger 0.03s)
0.70s  Paragraphs reveal sequentially
1.60s  Diagram container fades up; BEFORE renders; boxes scale in from 0.94
+1.60s Auto-transition to AFTER plays once
3.60s  Code block fades up (y 16px -> 0)
4.10s  Caveat line fades in
4.30s  Work scope rows slide in from the left, 0.08s apart

=== RESPONSIVE ===
< 768px: diagram height 480px, switching to a vertical stack (GameManager on top,
scenes below); the BEFORE/AFTER toggle moves below the header strip;
code font-size 11px with internal horizontal scroll;
work scope becomes a stacked list (category label above its items).
Touch: flashlight pinned to center, radius 320px.

=== ACCESSIBILITY ===
prefers-reduced-motion: fully lit, diagram transitions become instant cross-fades,
no auto-play. Code selectable and copyable. The toggle is a real radio group.

=== DO NOT ===
Do not use an external diagram library - build it with divs and inline SVG.
Do not animate the arrows on a loop; they animate only during the transition.
Do not remove the ScriptableObject caveat line.
No horror effects on this page - the atmosphere has resolved.
```

---

## PAGE 09 — 결과 · 불이 켜진다

**개발 실체**: 완성된 화면 · **풀 데모 영상** · 확정 수치
**연출 장치**: 조명이 100%로 차오르며 손전등이 소멸 → "여기부터는 불을 켜고 이야기하겠습니다"

```text
Build a RESULTS GALLERY section for a Unity horror game portfolio page, at the exact
moment the lights come fully up and the flashlight dissolves.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The finished screens, including one Unity editor screenshot as proof of real work
2. The full gameplay demo video
3. Only countable, verifiable numbers - no invented metrics

=== MOOD ===
The lights are ON. This is the tonal release after a long dark sequence. The page
background lifts, the flashlight is gone, and everything is finally fully readable.
Confident, clean, presentational - still a dark theme.

=== DESIGN TOKENS (use exactly) ===
background: transitions from #070405 to #0f0d0e on this section
primary red #ef4444 | accent #ff5a4d
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.48)
panel bg #131011, border rgba(255,255,255,0.12)
fonts: headings font-black, body sans leading-8, labels/captions font-mono
       numbers with font-variant-numeric: tabular-nums
easing cubic-bezier(0.4,0,0.2,1) 0.5s-1.0s | rounded-md
film grain SVG noise opacity 0.035 (reduced - the grain recedes too)

=== THE LIGHTS-UP MOMENT (open the section with it) ===
As this section enters the viewport:
  1. The page-wide darkness layer animates opacity to 0.00 over 0.9s
  2. The flashlight mask dissolves - animate its radius outward from 220px to 2000px
     over 0.9s so it FLOODS rather than snapping off
  3. The page background lifts #070405 -> #0f0d0e over 0.9s
  4. The header readout animates to its final value and changes state:
     from VERBATIM "○ 조명 100%" to VERBATIM "● 조명 100%" in color #ff5a4d
  5. 0.5s after the lights settle, a single line fades in, centered, 20px,
     font-medium, color #ff5a4d, VERBATIM:
       "여기부터는 불을 켜고 이야기하겠습니다."
     It stays in the page permanently.

=== LAYOUT ===
Single centered column, max-width 1020px (the widest section on the page).
  Block A : lights-up line + section label
  Block B : full demo video panel, full width, 16/9
  Block C : image gallery, 2-column grid (1 column below 768px), gap 20px
  Block D : metrics row, 3 cells

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.48),
               margin-top 48px):
  "05 · 결과"

=== BLOCK B: FULL DEMO VIDEO ===
A full-width panel, aspect-ratio 16/9, rounded-md,
border 1px rgba(255,90,77,0.28), background #131011, overflow hidden.
Above it a label, font-mono 11px, letter-spacing 0.2em, color #ff5a4d, VERBATIM:
  "▶ 플레이 영상 · 전체"
[VIDEO-01] full gameplay footage: corridor exploration with the flashlight, one
object interaction, and one Cinemachine cutscene.
If no video source is supplied, render a CSS placeholder inside: a dark corridor
suggestion built from stacked perspective rectangles (#0f0b0c to #16100f) with a
faint vertical light strip, a centered play button (56px circle, #ff5a4d, with a
pulsing ring every 1.8s), and text below it, font-mono 12px, rgba(255,255,255,0.48),
VERBATIM: "게임플레이 영상 자리 · 16:9 · 1분 42초"
NEVER render an empty gray box.
Caption bar below the video (border-top 1px rgba(255,255,255,0.08), font-mono 11px,
rgba(255,255,255,0.48), padding 10px 14px), VERBATIM:
  "탐색 → 상호작용 → 컷신 전환까지 한 번에 담은 플레이 영상"

=== BLOCK C: IMAGE GALLERY ===
Four slots in a 2x2 grid. Each: aspect-ratio 16/9, rounded-md,
border 1px rgba(255,255,255,0.12), overflow hidden, background #131011,
with a caption bar below (font-mono 11px, rgba(255,255,255,0.48), padding 10px 14px,
border-top 1px rgba(255,255,255,0.08)).

  [IMG-02] caption VERBATIM: "복도 탐색 — 손전등 시야 제한"
  [IMG-03] caption VERBATIM: "레이캐스트 상호작용 프롬프트"
  [IMG-04] caption VERBATIM: "Cinemachine 연출 — 문이 열리는 장면"
  [IMG-05] caption VERBATIM: "Unity 에디터 — 가상 카메라와 ScriptableObject 에셋"

[IMG-05] is the most important: give it a 1px #ff5a4d border at 35% opacity and a
badge in its top-left corner, font-mono 10px, background rgba(255,90,77,0.16),
color #ff5a4d, padding 3px 8px, rounded, VERBATIM: "에디터 원본"

PLACEHOLDER BEHAVIOR (required): if an image source is missing, render a CSS
placeholder - a diagonal hatch in rgba(255,90,77,0.05), a centered outline icon,
the caption text repeated at 12px rgba(255,255,255,0.35), and a ratio hint,
VERBATIM format: "16 : 9 · 이미지 자리". NEVER an empty gray box.

GALLERY INTERACTIONS:
- Hover: image scales to 1.04 (0.6s), border brightens to rgba(255,255,255,0.24),
  card lifts 4px with box-shadow 0 14px 36px rgba(0,0,0,0.55), and a label fades in
  at the image's top-right, font-mono 10px, background rgba(0,0,0,0.55),
  color #ff5a4d, VERBATIM: "⤢ 확대"
- Click opens a lightbox: overlay rgba(2,2,3,0.90) with backdrop-blur(4px), image
  contained at max-width 1100px, entering scale 0.92 -> 1 with a spring
  (stiffness 260, damping 26). Caption bar at the bottom shows the caption on the
  left and on the right, font-mono 12px rgba(255,255,255,0.35),
  VERBATIM: "ESC · 클릭으로 닫기"
  Esc or overlay click closes. Left/Right arrows move between the four images.

=== BLOCK D: METRICS ROW ===
Three cells in a row (1 column below 640px), gap 16px. Each: rounded-md,
border 1px rgba(255,255,255,0.12), padding 20px, background #131011.
  Value 30px font-mono font-black color #ff5a4d, tabular-nums, counting up from 0
        over 1.0s ease-out when scrolled into view (non-numeric values just fade in).
  Label 12px rgba(255,255,255,0.48), margin-top 8px, leading-5.

  Cell 1  value VERBATIM "6"          label VERBATIM "기술 스택"
  Cell 2  value VERBATIM "5"          label VERBATIM "핵심 시스템"
  Cell 3  value VERBATIM "프로토타입"  label VERBATIM "완성도 — 챕터 1 수준"

Cell 3 is intentionally honest. Style it identically to the others - do not visually
apologize for it, and do not replace it with an invented number.

Below the metrics, one line, font-mono 12px, rgba(255,255,255,0.48), VERBATIM:
  "// 다운로드 수나 플레이어 수 같은 지표는 없습니다. 배포하지 않은 프로토타입입니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Lights-up sequence begins (0.9s)
0.90s  Background lift completes
1.40s  The "여기부터는 불을 켜고..." line fades in (0.7s)
2.10s  Section label fades in
2.30s  Video panel fades up (y 20px -> 0, 0.9s)
3.00s  Gallery slots fade up one at a time, 0.12s apart, each lifting 20px
3.80s  Metrics cells fade in left to right, 0.10s apart; count-ups start on arrival

=== RESPONSIVE ===
< 768px: gallery becomes 1 column; metrics stack; lightbox image max-width 94vw.
No flashlight on this section on any device - the lights are up.

=== ACCESSIBILITY ===
prefers-reduced-motion: render fully lit immediately with no lights-up animation,
no count-up (show final values), no hover scale. The lightbox still functions.
Every image needs descriptive alt text derived from its caption.
The lightbox must trap focus and restore focus to its trigger on close.
The video player must have real controls and must not autoplay with sound.

=== DO NOT ===
Do not render empty gray boxes for missing media - always use the CSS placeholder.
Do not reintroduce darkness on this section.
Do not add invented metrics such as user counts, downloads, or ratings.
```

---

## PAGE 10 — 회고 · 다음 단계 · 퇴장

**개발 실체**: KPT 회고 · 다음 단계 · GitHub
**연출 장치**: 불 켜진 상태의 담담한 정리 → 퇴장 시 손전등이 다시 켜졌다 수축하며 암전

```text
Build a CLOSING RETROSPECTIVE section plus an exit transition for a Unity horror
game portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An honest retrospective including things that went wrong
2. Concrete next steps
3. The GitHub repository link
4. A clean exit back to a 3D village scene

=== MOOD ===
Fully lit, calm, reflective. The horror is over; this is the developer speaking
plainly. Honest, not self-congratulatory. The exit fades back to black because the
viewer returns to a dark 3D village scene.

=== DESIGN TOKENS (use exactly) ===
background #0f0d0e | primary red #ef4444 | accent #ff5a4d
keep #4ade80 | problem #f87171 | try #fbbf24
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.48)
panel bg #131011, border rgba(255,255,255,0.12)
torch (exit only) rgba(255,240,220,0.14)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.4,0,0.2,1) 0.5s-1.0s | rounded-md
film grain SVG noise opacity 0.035

=== LAYOUT ===
Single centered column, max-width 900px, padding-block 112px.
  Block A : label + heading
  Block B : KPT retrospective, 3 columns (1 below 768px)
  Block C : next steps card
  Block D : GitHub link
  Block E : exit button (full width, tall)

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.48)):
  "06 · 회고"

HEADING (32px font-black):
  "무섭게 만드는 건 감각이 아니라 목록이었다"

INTRO PARAGRAPH (17px leading-9, margin-top 20px, max-width 760px), VERBATIM:
  "시작할 때는 무섭게 만들자는 목표 하나뿐이었다. 그건 아무것도 알려주지 않는 목표였다.
   시야 제한, 소리 순서, 카메라 제어 — 세 개의 구현 가능한 문제로 쪼개고 나서야
   첫 줄을 쓸 수 있었다."
  Emphasize "구현 가능한 문제로 쪼개고 나서야" in #ff5a4d, font-bold.

=== BLOCK B: KPT RETROSPECTIVE ===
Three columns, gap 20px. Each: rounded-md, padding 22px,
border 1px rgba(255,255,255,0.12), background #131011, and a 2px top border in the
column's color.
Column header: font-mono 11px, letter-spacing 0.2em, uppercase, margin-bottom 14px.
Items: 14px leading-7 rgba(255,255,255,0.72), each prefixed with a 4px dot in the
column color, 10px gap between items.

COLUMN 1 - header VERBATIM "KEEP", color #4ade80. Items VERBATIM:
  "공포를 시야·소리·카메라 세 축으로 쪼갠 것"
  "Cinemachine으로 연출 반복 시간을 줄인 것"
  "버그를 덮지 않고 책임 위치를 옮겨서 고친 것"

COLUMN 2 - header VERBATIM "PROBLEM", color #f87171. Items VERBATIM:
  "성능 문제를 프로파일러 없이 3주 동안 방치했다"
  "레벨 디자인이 감으로 만들어졌다"
  "플레이 테스트를 팀 내부에서만 했다"

COLUMN 3 - header VERBATIM "TRY", color #fbbf24. Items VERBATIM:
  "프로파일러 캡처를 먼저 남기고 최적화 시작하기"
  "퍼즐 요소와 엔딩 시퀀스 추가"
  "외부 플레이 테스트 5명 이상"

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), and its top
border grows 2px -> 3px.

=== BLOCK C: NEXT STEPS CARD ===
Margin-top 48px, padding 24px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,90,77,0.04), border-left 3px #ff5a4d.
  Label font-mono 11px letter-spacing 0.2em color #ff5a4d, VERBATIM: "다음 단계"
  Body 16px leading-8 margin-top 12px, VERBATIM:
  "퍼즐 요소와 엔딩 시퀀스를 추가해 챕터형 게임으로 확장할 예정입니다.
   그 전에 프로파일러 기준선부터 잡아둘 생각입니다."

=== BLOCK D: GITHUB LINK ===
Margin-top 40px. A single primary link button:
  background #ef4444, color #070405, font-mono 14px font-black,
  padding 14px 28px, rounded-md.
  Label VERBATIM: "GitHub 저장소 ↗"
  Hover: scale 1.04, box-shadow 0 0 28px rgba(239,68,68,0.40).
  Active: scale 0.97.
  href https://github.com/toadsam/DarkLab, target _blank, rel noreferrer.

=== BLOCK E: EXIT BUTTON + EXIT TRANSITION ===
Margin-top 72px. A full-width button, height 88px, rounded-md,
border 1px rgba(255,255,255,0.14), background transparent.
  Label centered, font-mono 15px, letter-spacing 0.1em, rgba(255,255,255,0.62),
  VERBATIM: "← 마을로 돌아가기"
  Hover: border becomes rgba(255,90,77,0.45), label color #ff5a4d, and a faint warm
  radial glow (rgba(255,240,220,0.06)) appears behind the label - as if a flashlight
  is being switched back on. 0.5s transition.

EXIT TRANSITION (on click of this button OR the header's "← 마을로"):
  t=0.00s  Page background darkens #0f0d0e -> #070405 (0.3s); all content fades to
           opacity 0 (0.3s)
  t=0.30s  A flashlight beam reappears at viewport center, radius 260px,
           warm rgba(255,240,220,0.14)
  t=0.40s  Beam radius shrinks 260px -> 0px over 0.35s, ease-in
  t=0.75s  Full black. One quiet door-closing sound (volume cap 0.12), respecting the
           sound toggle.
  t=1.20s  Emit an onExit callback so the parent can restore the 3D village scene.
  Body scroll locks during the transition; the parent releases it.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label fades in
0.15s  Heading reveals word by word (stagger 0.03s, blur 3px -> 0)
0.70s  Intro paragraph reveals
1.40s  KPT columns fade up left to right, 0.12s apart, each lifting 18px; within each
       column items appear 0.06s apart
2.40s  Next steps card slides in from the left (x -14px -> 0)
2.80s  GitHub button fades in
3.10s  Exit button fades in with its border drawing from the center outward
       (a pseudo-element width 0% -> 100%, 0.7s)

=== RESPONSIVE ===
< 768px: KPT becomes a single column (16px gap); heading 24px;
exit button height 72px with 14px label; GitHub button full width.

=== ACCESSIBILITY ===
prefers-reduced-motion: all reveals instant; the exit transition becomes a simple
0.3s fade to black with no beam animation.
The exit button must be a real <button>, keyboard focusable, with a visible focus
ring (2px #ff5a4d, offset 2px). Audio hard-capped and gated by the sound toggle.

=== DO NOT ===
Do not add confetti, celebration effects, or "thanks for reading" flourishes.
Do not soften the PROBLEM column - the honesty is the point.
Do not reintroduce the flashlight mechanic except in the exit transition.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-1. 개발 실체 커버리지 점검

| 항목                          | 어디에                                                                                                               | 형태                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **왜 만들었나**               | P00                                                                                                                  | 진입 첫 문장 (4초 안에)                                |
| **데모 영상**                 | P01 (발견) · P09 (풀버전)                                                                                            | 손전등으로 발견 → 나중에 전체 재생                     |
| **GitHub**                    | P01 (발견) · P10 (버튼)                                                                                              | 어둠 속 오브젝트 + 마무리 버튼                         |
| **코드**                      | P02(레이캐스트) · P03(3조각) · P04(Cinemachine) · P05(DOTween·InputLock) · P06(Before/After) · P07(최적화) · P08(SO) | **총 11개**                                            |
| **트러블슈팅**                | P06 (제어권 잠김) · P07 (성능)                                                                                       | **전체 프로세스 2건**                                  |
| **기술 의사결정 + 포기한 것** | P05                                                                                                                  | 비교 데모 + 정직한 비용 카드                           |
| **아키텍처 리팩터링**         | P08                                                                                                                  | 분해→재조립 다이어그램                                 |
| **작업 범위 (내가 한 것)**    | P08                                                                                                                  | 4개 카테고리                                           |
| **회고**                      | P10                                                                                                                  | KPT (PROBLEM 3개 포함)                                 |
| **한계 인정**                 | P06 · P07 · P09 · P10                                                                                                | 남은 버그 / 못 잰 수치 / 프로토타입 / 외부 테스트 없음 |

## D-2. 새로 만들 파일

```
src/components/ui/project-viewers/stages/darklab/
  index.tsx                 ← PAGE 00~10 순서, 스크롤→조명 매핑
  FlashlightLayer.tsx       ← P00~P08 공용 손전등
  useFlashlight.ts          ← 마우스 좌표 → CSS 변수 (React state 금지)
  DiscoveryWall.tsx         ← P01 · 손전등으로 발견하는 영상/GitHub/메모
  RaycastCodeReveal.tsx     ← P02 · 상호작용 → 코드 슬라이스 공개
  PrincipleRows.tsx         ← P03 · 원칙 3개 + 코드칩 + 지연 회수
  TheMoment.tsx             ← P04 · 제어권 박탈 + 즉시 코드
  CameraHandoffDemo.tsx     ← P05 · Lerp vs Cinemachine
  ScrollLockCase.tsx        ← P06 · 스크롤 잠금 + 케이스 파일
  RaycastPerfDemo.tsx       ← P07 · 실시간 카운터 + 그래프
  ArchToggleDiagram.tsx     ← P08 · 분해→재조립
  FilmGrain.tsx             ← 전 페이지 오버레이
  copy.ts                   ← 모든 한국어 문구
  assets.ts                 ← [IMG-01~05] · [VIDEO-01]
```

## D-3. 기존 코드 재사용 / 선행 작업

재사용: `CodeBlock`, `ImageSlot`, `MockScreen`, `RevealText`, `CountUp` (`shared.tsx`)

> ⚠️ **선행 작업 (10개 프로젝트 공통 1건)**: `shared.tsx` 의 `DecisionTable`,
> `ArchDiagram`, `CompareBars`, `ProcessTimeline`, `QuoteCard`, `TldrBanner`,
> `BeforeAfter`, `ChallengeCard` 가 현재 **모듈 내부 함수(비export)** 입니다.
> stage 폴더에서 쓰려면 export로 승격해야 합니다.

## D-4. 버릴 것

- `[KILL]` `richContent/DarkLabReveal.tsx` → `FlashlightLayer` 체계로 전면 재작성
- `[KILL]` darklab의 `GameProjectViewer` / `HorrorLayer` (FlashlightLayer + FilmGrain으로 흡수)

## D-5. 미디어 확보 목록

| 슬롯         | 내용                                      | 비율 | 우선도   |
| ------------ | ----------------------------------------- | ---- | -------- |
| `[VIDEO-01]` | 플레이 영상 (탐색→상호작용→컷신) 1분 42초 | 16/9 | **최상** |
| `[IMG-02]`   | 복도 탐색 (손전등 시야)                   | 16/9 | 높음     |
| `[IMG-03]`   | 상호작용 프롬프트                         | 16/9 | 중간     |
| `[IMG-04]`   | Cinemachine 연출 장면                     | 16/9 | 중간     |
| `[IMG-05]`   | **Unity 에디터 스크린샷**                 | 16/9 | **최상** |

## D-6. 코드 스니펫 확보 목록 (전부 실제 저장소에서)

| 페이지 | 파일                                                     | 줄     | 하이라이트                             |
| ------ | -------------------------------------------------------- | ------ | -------------------------------------- |
| P02    | `Interactor.cs`                                          | 22     | 레이캐스트 / 타겟판정 / 입력처리 3구간 |
| P03    | `PlayerLight.cs` · `AmbientCue.cs` · `CameraDirector.cs` | 각 1줄 | 코드칩                                 |
| P04    | `CameraDirector.cs`                                      | 18     | Priority 2줄 + 입력 복구               |
| P05    | `DoorRevealSequence.cs`                                  | 15     | Join · AppendCallback                  |
| P05    | `PlayerInputLock.cs`                                     | 13     | 재활성화 보장 구문                     |
| P06    | `CutsceneController.cs` (before)                         | 12     | OnComplete 줄                          |
| P06    | `PlayState.cs` (after)                                   | 14     | 보장 구문 + 단일 결정 지점             |
| P07    | `Interactor.cs` (after)                                  | 18     | 간격 게이트 · LayerMask · 캐시         |
| P08    | `PlayerState.cs`                                         | 16     | `[CreateAssetMenu]` + 클래스 선언      |

## D-7. 제어권 박탈 2회 — 안전장치 대조표

|                  | P04 시야 박탈    | P06 스크롤 잠금           |
| ---------------- | ---------------- | ------------------------- |
| 길이             | 3.0초            | 1.5초                     |
| 예고             | P03 경고 카드    | 섹션 240px 위 인라인 경고 |
| 건너뛰기         | ✅               | ✅                        |
| 세션당           | 1회              | 1회                       |
| Esc 해제         | ✅               | ✅                        |
| reduced-motion   | 발동 안 함       | 발동 안 함                |
| 언마운트 시 정리 | 스크롤 잠금 해제 | 스크롤 잠금 해제          |

## D-8. 최종 체크리스트

- [ ] `[ 조명 켜기 ]` 버튼 상시 노출 — **없으면 배포 금지**
- [ ] 마우스 좌표를 React state로 관리하지 않았는지 (CSS 변수 + rAF)
- [ ] P04 · P06 각각 세션당 1회 + 예고 + 건너뛰기 + Esc + 언마운트 정리
- [ ] `prefers-reduced-motion` 이면 손전등 자체를 끄고 시작, 제어권 박탈 2건 모두 비활성
- [ ] 사운드 최대 볼륨 하드 제한 (0.15), P04 저음 0.10
- [ ] 화면 전체 플래시 0회, 스트로브 0회
- [ ] 손전등 밖 텍스트가 DOM에 남아 스크린리더에 읽히는지 (`aria-hidden` 금지)
- [ ] P07 카운터/그래프가 뷰포트 밖에서 정지하는지 (배터리)
- [ ] P07 "실제 게임 수치 아님" 면책 문구 누락 금지
- [ ] P06 실패한 시도 · 소거된 의심 · 남은 한계 3개 전부 유지
- [ ] P05 "대신 포기한 것" 카드 삭제 금지
- [ ] 숫자는 전부 `tabular-nums`
- [ ] 코드블록이 어두운 구간에서도 읽히는지 (로컬 글로우)
- [ ] 지어낸 수치 0개 — 다운로드/사용자/ms 개선치 주장 금지
