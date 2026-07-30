# 08. 아주대모험 — 프롬프트 팩

> 아주대학교 캠퍼스를 배경으로 한 Phaser 3 기반 2D 캐주얼 게임 · TypeScript / Phaser 3 / Vite
> **사용법**: `PAGE 00` ~ `PAGE 10` 의 코드블록을 **하나씩 통째로 복사해서 Variant에 붙여넣으세요.**
> 각 프롬프트는 **완전히 자립적**입니다 (색상·폰트·무드가 매번 반복 포함).
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 방의 한 문장

**"오락실 캐비닛 앞에 선다. 코인을 넣으면 진짜로 플레이된다."**

## A-2. 왜 이 메타포인가

이 프로젝트는 **웹 브라우저에서 바로 되는 게임**이다.
그 말은, 이 소개 페이지에서 **설명할 이유가 없다는 뜻**이다. 그냥 시키면 된다.

다른 9개 방은 "무엇을 만들었는지"를 보여줘야 한다.
이 방은 **관람객이 직접 플레이한다.** 데모 영상보다 강력한 증거는 플레이 그 자체다.

그리고 여기서부터가 이 방의 진짜 설계다: **관람객이 방금 플레이한 그 게임 루프의 코드가,
플레이하는 동안 옆에서 실시간 프레임 카운터와 함께 돌아간다.**
관람객은 자기가 만든 프레임 수를 코드 옆에서 본다.

## A-3. ⭐ 가장 중요한 원칙 — 연출은 개발 내용의 운반 수단이다

**모든 연출은 반드시 개발 실체를 하나 이상 전달해야 한다.** 멋있기만 한 연출은 넣지 않는다.

| 전달할 개발 실체 | 그걸 실어나르는 연출 | 페이지 |
|---|---|---|
| 왜 이걸 만들었나 (동기) | 캐비닛에 코인 투입 → 어트랙트 화면의 첫 문장 | 00 |
| 데모 · GitHub | 캐비닛 **옆면 스티커** 3장 — 하나가 저장소, 하나가 영상, 하나가 개발 메모 | 01 |
| **게임이 실제로 돌아간다** | **관람객이 직접 플레이하는 미니 러너** (실제 캔버스, 실제 조작) | 02 |
| 게임 루프 구현 (`update`) | **플레이하는 동안 옆 코드 패널의 `update()` 가 실시간 프레임 카운터와 함께 하이라이트됨** | 02 |
| 조작감은 튜닝의 결과다 | **점프 방식 A/B 토글** — 코요테 타임 있는 쪽/없는 쪽을 직접 플레이해 비교 | 03 |
| **트러블 01: 오브젝트를 안 지워서 느려진다** | **"제거 끄기" 토글** → 관람객 눈앞에서 활성 오브젝트 수가 폭증하고 FPS가 떨어짐 → 풀링 코드 | 04 |
| 자동 발판 생성 알고리즘 | 스크롤에 맞춰 발판이 규칙대로 생성되는 과정을 분해해서 보여줌 | 05 |
| 낮/밤 전환 = 진행감 장치 | **스크롤을 내리면 페이지 자체가 낮에서 밤으로 바뀐다** | 06 |
| localStorage 최고 점수 | **관람객이 방금 낸 점수가 실제로 저장되고, 다시 오면 남아 있다** → 코드 | 07 |
| **트러블 02: 모바일에서 안 됐다** | 화면 폭을 직접 줄여보게 하는 리사이즈 슬라이더 → 스케일링 코드 | 08 |
| 결과물 · 화면 갤러리 | 캐비닛 화면이 전체 화면으로 확장 | 09 |
| 회고 · 다음 단계 | GAME OVER 화면 → 크레딧 → 캐비닛 전원 종료 | 10 |

## A-4. 게임 설계 결정 ↔ 웹 재현 대응

| 게임에서 내린 결정 | 이 웹페이지에서의 재현 |
|---|---|
| 짧은 플레이 · 즉시 재시작 | 미니 게임도 30초 안에 끝나고 R키로 즉시 재시작 |
| 점프 하나로 다 되는 조작 | 미니 게임도 조작키가 **하나뿐** (Space 또는 탭) |
| 낮/밤으로 진행감을 준다 | **페이지 배경이 스크롤에 따라 낮→밤으로 바뀐다** |
| 최고 점수를 로컬에 저장한다 | **관람객 점수가 실제 localStorage에 저장된다** |

**관람객은 "캐주얼 게임을 만들었습니다"를 읽는 게 아니라, 그 게임을 한 판 하고 나온다.**

## A-5. 관람 곡선 (감정 + 정보 밀도)

```
재미  ╭─╮ P02 첫 플레이 (최고조)
     ╱   ╰─╮  ╭─╮ P03 A/B 비교 플레이
 P00     ╰──╯ ╰──╮        ╭─╮ P07 점수 저장
 어트랙트          ╰────────╯  ╰──── P09~10 정리
정보  낮 ────────╱▔▔▔▔▔▔▔▔▔▔▔╲──────
              P04~08 개발 밀도 최고조
시간  낮 ──── 오후 ──── 노을 ──── 밤 ──── 심야
```

**핵심 장치**: 스크롤을 내릴수록 **페이지가 낮에서 밤으로 바뀐다.**
게임 안의 낮/밤 전환 시스템을, 페이지 자체가 똑같이 수행한다.
헤더의 `☀ 14:20` 시계가 실시간으로 흘러 진행바 역할을 겸한다.

## A-6. 명장면 2개

**① PAGE 02 — 첫 플레이** (감정의 클라이맥스)
캐비닛 화면에 `PRESS SPACE` 가 깜빡인다. 누르면 진짜로 게임이 시작된다.
그리고 **왼쪽 코드 패널의 `update()` 함수 안, 지금 실행 중인 줄이 프레임마다 빛난다.**
점프하면 점프 처리 줄이 번쩍인다. 관람객은 자기 손가락과 코드를 동시에 본다.

**② PAGE 04 — 오브젝트를 안 지우면** (기술의 클라이맥스)
"제거 끄기" 토글을 누른 채 플레이하면 화면 밖 발판이 안 사라진다.
`활성 오브젝트 12 → 340` 으로 치솟고 FPS 그래프가 꺾인다.
그 상태로 10초만 버티면 관람객이 **직접 렉을 느낀다.** 그 다음에 풀링 코드가 나온다.

## A-7. 다른 9개 방과의 차별점

| 축 | 아주대모험 | 나머지 |
|---|---|---|
| 증거 방식 | **직접 플레이** | 영상 · 스크린샷 |
| 코드 표시 | **실행 중인 줄이 실시간으로 빛남** | 정적 하이라이트 |
| 배경 | **스크롤에 따라 낮→밤** | 고정 |
| 상태 저장 | **관람객 점수가 진짜로 저장됨** | 없음 |
| 색 | 라임 · CRT 형광 | 각자 |

## A-8. 절대 금지 (안전 규칙)

- **광과민성**: CRT 스캔라인은 정적, 깜빡임 금지. 초당 3회 이상 밝기 변화 금지
- 게임 캔버스는 **뷰포트 밖이면 반드시 일시정지** (배터리 · rAF 중단)
- 키보드 입력(Space/화살표)은 **캔버스에 포커스/호버 중일 때만** 캡처 — 페이지 스크롤을 뺏지 말 것
- 소리는 기본 OFF, 최대 볼륨 하드 제한 0.15
- 지어낸 지표(다운로드 수 · 플레이 수 · DAU) 금지
- `prefers-reduced-motion` 이면 자동 애니메이션 전부 정지, 게임은 여전히 플레이 가능

---

# B. 공통 디자인 토큰 (참고용 — 각 프롬프트에 이미 포함됨)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` (낮) | `#141a0a` | P00~P03 배경 |
| `--bg` (밤) | `#0a0f04` | P06 이후 배경 |
| `--panel` | `#151d09` | 캐비닛 · 패널 |
| `--primary` | `#a3e635` | 라임 · CRT 형광 |
| `--accent` | `#bef264` | 보조 강조 |
| `--ok` / `--bad` / `--warn` | `#4ade80` / `#f87171` / `#fbbf24` | 상태 3색 |
| `--text` | `rgba(255,255,255,0.88)` | 본문 |
| `--muted` | `rgba(255,255,255,0.46)` | 캡션 |
| `--crt` | `rgba(163,230,53,0.10)` | 화면 잔광 |
| 코드 패널 | bg `#0c1105`, border `rgba(163,230,53,0.18)` | |
| 문법 색 | 주석 `#6b8a3f` / 문자열 `#fcd34d` / 키워드 `#a3e635` / 숫자 `#7dd3fc` | |
| 픽셀 폰트 | 제목과 점수만 (본문은 일반 폰트) | |
| 이징 | `steps()` 계열 + `cubic-bezier(0.2,0.8,0.2,1)` | 게임스럽게 |
| 숫자 | 전부 `tabular-nums` | |

---

# C. 페이지별 프롬프트

---

## PAGE 00 — 어트랙트 모드 (코인 투입)

**개발 실체**: 왜 이걸 만들었는가 (동기)
**연출 장치**: 오락실 캐비닛 어트랙트 화면 → 코인 투입 → 첫 문장

```text
Build a full-screen ARCADE ATTRACT MODE intro for a Phaser 3 campus game portfolio
page. Stack: React + TypeScript + Tailwind CSS + framer-motion. Single
self-contained component. No game engine - draw everything in CSS/SVG.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
Why this game was built. The line that appears after the coin is inserted must
state the developer's motivation, and it must be readable within 4 seconds.

=== MOOD ===
A game-center cabinet nobody has played for a while, running its attract loop.
Warm CRT phosphor glow, lime green on near-black. Playful, nostalgic, a little
cheap in a charming way. NOT slick, NOT corporate, NOT neon cyberpunk.

=== DESIGN TOKENS (use exactly) ===
background #141a0a | panel #151d09 | primary lime #a3e635 | accent #bef264
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
crt glow rgba(163,230,53,0.10)
fonts: the TITLE and any SCORE use a pixel/bitmap-style font
       (font-family with a monospace fallback, letter-spacing 0.05em);
       ALL body copy uses a normal sans-serif at leading-8 - never pixel font for
       paragraphs, it is unreadable
easing: cubic-bezier(0.2,0.8,0.2,1) plus steps() for anything mechanical
all numbers tabular-nums

=== LAYOUT ===
Full viewport, position fixed, above page content.
Centered: a cabinet SCREEN BEZEL, max-width 720px, aspect-ratio 4/3,
background #0c1105, border 10px solid #1b2410, rounded-lg, with an inner
box-shadow inset 0 0 80px rgba(163,230,53,0.08) for phosphor bloom.
Below the bezel, a control panel strip 64px tall containing a coin slot.
Static (NON-ANIMATED) scanlines over the screen: repeating-linear-gradient,
1px rgba(0,0,0,0.22) every 3px, opacity 0.5. They must NOT move or flicker.

=== ATTRACT TIMELINE (follow exactly) ===
t=0.00s  The screen shows a looping attract demo: a tiny pixel character
         auto-running left to right across a simple platform silhouette, jumping
         over one obstacle, looping every 4s. Rendered in CSS with steps() timing
         so it looks like sprite animation, not smooth interpolation.
t=0.30s  The TITLE fades in over the demo, centered, pixel font:
           Line 1, VERBATIM: "아주대모험"
             48px, color #a3e635, text-shadow 0 0 22px rgba(163,230,53,0.45)
           Line 2, VERBATIM: "AJOU ADVENTURE"
             16px, color rgba(255,255,255,0.46), letter-spacing 0.28em,
             margin-top 10px
t=1.20s  Below the title, a blinking prompt, pixel font 15px, color #bef264,
         VERBATIM: "INSERT COIN"
         It blinks on a 1.0s cycle using steps(1) - a hard on/off, no fade.
         (1.0s = 1Hz. Never faster - photosensitivity.)
t=1.60s  In the control panel strip below the bezel, a coin slot appears with a
         small lime outline and a label, font-mono 11px rgba(255,255,255,0.46),
         VERBATIM: "▸ 아무 키나 누르거나 클릭하세요"
t=on input (any key / click / tap / scroll):
         t+0.00s  One short coin sound (volume cap 0.15, respects the sound toggle,
                  and DEFAULT IS OFF - play nothing unless the viewer enabled sound)
         t+0.05s  The screen flashes ONCE to rgba(163,230,53,0.14) for 0.12s
                  (a single soft flash - never repeated, never full white)
         t+0.20s  The attract demo clears with a horizontal wipe (0.3s)
         t+0.50s  THE MOTIVATION LINE types onto the black screen, left-aligned
                  inside the bezel with 48px padding, normal sans-serif 17px,
                  leading-9, color rgba(255,255,255,0.88), typing at ~45 chars/sec
                  with a lime block cursor.
                  Korean copy, VERBATIM:
                  "학교 다니면서 제일 많이 한 얘기가 「본관 언덕 진짜 힘들다」였다.
                   그 언덕을 발판으로 만들면 웃기겠다 싶어서 시작했다.
                   설치 없이 브라우저에서 바로 되는 게 조건이었다."
         t+3.60s  A scroll hint at the bottom of the bezel, pixel font 13px,
                  color #a3e635, VERBATIM: "↓ START"
                  bouncing 4px on a 1.6s cycle.

FALLBACK: if no input arrives within 6 seconds, auto-insert the coin and run the
same sequence.

=== ESCAPE HATCHES (required) ===
Escape or a second input skips to the end state instantly.
A skip control at the bottom-right from t=0.40s, font-mono 11px,
rgba(255,255,255,0.35), VERBATIM: "[ 건너뛰기 ]"

=== ACCESSIBILITY (photosensitivity is the priority here) ===
The "INSERT COIN" blink is exactly 1Hz and only affects a small text element -
never the whole screen.
The coin-insert flash happens ONCE and is a low-alpha lime tint, never white,
never full-screen strobe.
Scanlines are STATIC. No rolling, no flicker, no interlace shimmer.
prefers-reduced-motion: no attract demo animation, no blink (the prompt renders
solid), no typing (the motivation line appears whole), no flash.
Sound defaults to OFF. Provide a sound toggle in the header that persists.

=== RESPONSIVE ===
< 768px: bezel max-width 92vw, title 32px, motivation line 15px with 24px padding,
control strip 52px.

=== DO NOT ===
No rolling scanlines, no CRT flicker, no screen-shake, no chromatic aberration
that pulses. Do not blink anything faster than 1Hz.
Do not use the pixel font for the motivation paragraph.
Do not autoplay sound.
```

---

## PAGE 01 — 히어로 · 캐비닛 옆면 스티커

**개발 실체**: 프로젝트 정체 + **GitHub · 데모 영상 · 개발 메모**
**연출 장치**: 링크가 버튼이 아니라 **캐비닛 옆면에 붙은 스티커 3장**

```text
Build the HERO SECTION of a Phaser 3 campus game portfolio page, where the GitHub
repository, the demo video, and a development note are three STICKERS slapped onto
the side panel of an arcade cabinet - not a button row.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained section.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the project is (identity + hard facts)
2. The GitHub repository link
3. The demo video entry point
4. A development-scope note
Items 2-4 must read as physical stickers on a cabinet, never as a link bar.

=== MOOD ===
A game-center cabinet seen from a three-quarter angle. Lime phosphor, worn plastic,
stickers layered over old stickers. Playful and physical.

=== DESIGN TOKENS (use exactly) ===
background #141a0a | panel #151d09 | primary lime #a3e635 | accent #bef264
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
cabinet body #1b2410 | crt glow rgba(163,230,53,0.10)
fonts: TITLE and SCORES in a pixel/bitmap-style font; ALL body copy in a normal
sans-serif at leading-8; labels font-mono uppercase
easing cubic-bezier(0.2,0.8,0.2,1) | rounded-md | numbers tabular-nums

=== PERSISTENT HEADER (fixed, present on every section of this page) ===
Height 54px, background rgba(20,26,10,0.85), backdrop-blur(10px),
bottom border 1px rgba(163,230,53,0.18).
  LEFT   "← 마을로"  13px font-mono rgba(255,255,255,0.46)
  CENTER "아주대모험"  14px pixel font #a3e635
  RIGHT  an in-game clock that advances with scroll progress, format VERBATIM:
         "☀ 14:20"
         13px font-mono, tabular-nums. The icon and time change as the viewer
         scrolls: ☀ during the first half, 🌇 around 60%, 🌙 after 75%.
         This doubles as the progress indicator. Then a sound toggle
         (DEFAULT OFF) and a "[ 처음부터 ]" ghost button.

=== LAYOUT ===
min-height 100vh, centered, max-width 1120px, padding-block 96px.
A two-column layout, gap 40px (stacks below 1024px, cabinet first):
  LEFT  (54%) : THE CABINET (see below), height 560px
  RIGHT (46%) : kicker + headline + summary + a 4-cell fact grid

=== THE CABINET (the defining object of this page) ===
Drawn entirely in CSS/SVG - no images required.
A cabinet body in #1b2410 with a 1px rgba(163,230,53,0.18) outline, rendered in a
slight three-quarter perspective (a subtle skewY/rotateY, no more than 6deg) so
that a SIDE PANEL is visible on the left edge.
Parts:
  - MARQUEE (top, 64px): a lit strip, background rgba(163,230,53,0.10),
    containing the title in pixel font 22px #a3e635, VERBATIM: "아주대모험"
  - SCREEN (center, aspect 4/3): background #0c1105, inset phosphor bloom,
    STATIC scanlines (1px rgba(0,0,0,0.22) every 3px). Inside it, a looping
    silhouette of the game: a pixel character auto-running past campus building
    shapes, using steps() timing. Loops every 4s.
    A small overlay chip at the screen's top-left, font-mono 10px #a3e635,
    VERBATIM: "ATTRACT MODE"
  - CONTROL PANEL (below the screen, 72px): one joystick circle and ONE button
    (a single lime circle, 34px). Beside it a label, font-mono 10px
    rgba(255,255,255,0.46), VERBATIM: "버튼 하나로 다 됩니다"
  - SIDE PANEL (the left face): the sticker surface.

THE THREE STICKERS (on the side panel):
Each is a small rotated card with a slight drop shadow, as if physically stuck on.
Hovering one straightens its rotation to 0deg, lifts it 4px, and brightens it.
They must be real focusable elements.

  STICKER A - GITHUB   (rotate -6deg, near the top of the side panel)
    Size 132x86px, background #0c1105, border 1px rgba(163,230,53,0.35),
    rounded-sm. Contents: a monospace "< >" glyph 22px #a3e635, below it
    font-mono 11px rgba(255,255,255,0.88), VERBATIM: "GitHub"
    and font-mono 9px rgba(255,255,255,0.46), VERBATIM: "TypeScript · Phaser 3"
    Click -> https://github.com/toadsam/Ajou_Mini_Game in a new tab
    (target _blank, rel noreferrer).

  STICKER B - DEMO VIDEO  (rotate 5deg, middle)
    Size 132x86px, background #0c1105, border 1px rgba(190,242,100,0.40).
    Contents: a play triangle 20px #bef264 inside a 40px circle, below it
    font-mono 11px, VERBATIM: "플레이 영상"
    and font-mono 9px rgba(255,255,255,0.46), VERBATIM: "1분 12초"
    Click -> video lightbox: overlay rgba(6,9,3,0.93) backdrop-blur(8px),
    16/9 player, max-width 960px, Esc / overlay click closes.
    If no source is supplied render a CSS placeholder with centered text
    VERBATIM "플레이 영상 자리 · 16:9".
    [VIDEO-01] one full run: start -> jump over obstacles -> item pickup ->
    day/night transition -> game over with score.

  STICKER C - DEV NOTE  (rotate -3deg, lower)
    Size 132x86px, background #14200a, border 1px rgba(255,255,255,0.16).
    Contents, handwriting-ish small text, font-mono 10px rgba(255,255,255,0.60),
    three lines VERBATIM:
      "기획부터 개발까지"
      "혼자 만들었습니다"
      "PC · 모바일 둘 다"
    Not a link - it is informational. Hovering still straightens it.

A tiny hint under the stickers, font-mono 10px rgba(255,255,255,0.35), fading out
permanently once any sticker has been hovered or focused,
VERBATIM: "옆면 스티커를 눌러보세요"

=== RIGHT COLUMN CONTENT (Korean copy - VERBATIM, never translate) ===

KICKER (font-mono 12px, letter-spacing 0.3em, uppercase, color #a3e635):
  "PHASER 3 · 캠퍼스 2D 캐주얼 게임"

HEADLINE (pixel font is TOO HEAVY here - use font-black sans, 40px desktop /
26px mobile, leading-tight, rgba(255,255,255,0.88)):
  Line 1, VERBATIM: "설치도, 로그인도 없이"
  Line 2, color #a3e635, margin-top 10px, VERBATIM: "주소만 열면 시작된다"

SUMMARY (16px leading-9, max-width 520px, margin-top 22px):
  VERBATIM: "캠퍼스 건물을 발판으로 바꾸고, 자동으로 스크롤되는 맵 위를 달린다.
             조작은 점프 하나. 한 판이 1분을 안 넘긴다."
  Emphasize "조작은 점프 하나" in #bef264, font-bold.

FACT GRID (4 cells, 2x2, margin-top 32px).
Each cell: border 1px rgba(163,230,53,0.20), rounded-md, padding 14px.
value pixel font 22px #a3e635 tabular-nums, label font-mono 10px
rgba(255,255,255,0.46) letter-spacing 0.1em below.
  Cell 1  value "3"      label "기술 스택"
  Cell 2  value "5"      label "핵심 기능"
  Cell 3  value "1인"     label "기획 · 개발"
  Cell 4  value "2D"     label "Phaser 3"

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The cabinet slides up (y 30px -> 0, 0.7s) and its marquee light turns on
       0.3s later with a single soft glow bloom
0.60s  The attract loop on the cabinet screen begins
0.80s  Kicker fades up
1.00s  Headline line 1 word by word (stagger 0.035s), line 2 at 1.45s
1.90s  Summary reveals
2.30s  Fact cells pop in one at a time, 0.08s apart, each with a small
       scale 0.9 -> 1 spring
2.80s  THE THREE STICKERS slap on one at a time, 0.14s apart - each arrives with
       scale 1.25 -> 1 and a tiny rotation overshoot (like being pressed on by
       hand), 0.3s each
3.40s  The hint line fades in

=== PERFORMANCE ===
The cabinet's attract loop must PAUSE when the cabinet is out of the viewport or
the tab is hidden.

=== RESPONSIVE ===
< 1024px: single column, cabinet first at height 460px, right column below.
< 640px: the cabinet's side panel is not visible in perspective, so move the three
stickers BELOW the cabinet as a horizontal row of three cards (still rotated,
still tactile). Headline 26px, fact grid stays 2x2.
Touch: stickers need a 44px minimum touch target.

=== ACCESSIBILITY ===
prefers-reduced-motion: no attract loop, no sticker slap-on (they appear in place,
already straight), no marquee bloom.
Stickers A and B must be real anchor/button elements reachable by Tab with visible
focus rings (2px #a3e635, offset 2px). Keyboard focus also straightens them.
Scanlines are STATIC - never animate them.
Sound defaults to OFF.

=== DO NOT ===
Do not render GitHub and the video as a conventional button row anywhere.
Do not use the pixel font for the headline or the summary paragraph.
No rolling scanlines, no flicker, no screen shake.
No invented download or play counts.
```

---

## PAGE 02 — 직접 해보세요 · 게임 루프가 지금 돌고 있다

**개발 실체**: Phaser 게임 루프 (`update`) 구현 + **실행 중인 코드 줄이 실시간으로 빛남**
**연출 장치**: **관람객이 실제로 플레이한다.** 그 동안 옆 코드 패널의 현재 실행 줄이 프레임마다 하이라이트됨

```text
Build a SECTION containing a REAL, PLAYABLE mini endless-runner rendered on a
canvas, with a live source-code panel beside it where the currently executing lines
of the game loop light up frame by frame as the viewer plays.
Stack: React + TypeScript + Tailwind CSS. Use a plain <canvas> and
requestAnimationFrame - do NOT load Phaser or any game engine.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That the game genuinely runs in a browser with no install
2. What a game loop actually is (input -> update -> render, every frame)
3. The real update() structure, made legible by highlighting whichever part is
   executing right now

=== MOOD ===
Arcade cabinet, coin already inserted. Lime phosphor, tight and responsive.
Fun first, explanation second - but both on the same screen.

=== DESIGN TOKENS (use exactly) ===
background #141a0a | panel #151d09 | primary lime #a3e635 | accent #bef264
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0c1105, border rgba(163,230,53,0.18)
syntax: comments #6b8a3f, strings #fcd34d, keywords #a3e635, numbers #7dd3fc
fonts: SCORES in pixel font; body sans leading-8; code + labels font-mono 12px
easing cubic-bezier(0.2,0.8,0.2,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1140px, padding-block 120px.
  Block A : label + heading + two paragraphs (max-width 740px)
  Block B : a two-column split, gap 18px, tops aligned
              LEFT  (56%) : THE PLAYABLE GAME, height 420px
              RIGHT (44%) : THE LIVE CODE PANEL, height 420px
            Below 1024px stacks, game first.
  Block C : the frame-budget note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "01 · 게임 루프"

HEADING (28px font-black sans):
  VERBATIM: "게임은 초당 60번 같은 일을 반복하는 프로그램이다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "입력을 읽고, 상태를 갱신하고, 그린다. 이걸 1초에 60번 한다.
             Phaser의 update()가 그 「한 번」이다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "글로 읽으면 안 와닿는다. 오른쪽 코드는 지금 실행 중인 줄이 빛난다.
             왼쪽에서 한 판 해보면 무슨 뜻인지 바로 보인다."
  Emphasize "지금 실행 중인 줄이 빛난다" in #a3e635, font-bold.

=== BLOCK B LEFT: THE PLAYABLE GAME (this must actually work) ===
Container: height 420px, rounded-md, border 1px rgba(163,230,53,0.18),
background #0c1105, overflow hidden, position relative.
STATIC scanlines overlay (1px rgba(0,0,0,0.20) every 3px, opacity 0.4, never moving).

Header strip (30px, border-bottom 1px rgba(163,230,53,0.12)):
  left  font-mono 10px rgba(255,255,255,0.46), VERBATIM: "▸ 직접 플레이"
  right two readouts, font-mono 11px tabular-nums:
        VERBATIM "SCORE 0"  (pixel font, #a3e635)
        VERBATIM "FPS 60"   (rgba(255,255,255,0.46))

THE GAME (canvas, sized to the container, devicePixelRatio-aware):
  A one-button endless runner.
  - A pixel-block player character on the ground line, always running right
    (the world scrolls left; the player stays at x ~22%).
  - Ground scrolls at a constant speed; the speed increases by a small step every
    10 seconds.
  - Obstacles (simple blocks styled as campus objects: a bench, a bollard, a stack
    of books) spawn at a randomized interval between 900ms and 1700ms.
  - Collectible items (small lime dots) spawn occasionally at jump height.
  - INPUT: Space, ArrowUp, click, or tap = jump. That is the ONLY control.
    Jump uses simple gravity: an upward impulse, gravity applied per frame,
    landing when the player reaches the ground line. No double jump here.
  - Colliding with an obstacle ends the run.
  - Score increases with distance; items add a bonus.
  - GAME OVER overlay: dim the canvas to 55%, show pixel-font 26px #a3e635 text
    VERBATIM "GAME OVER", the final score beneath it, and a prompt
    font-mono 12px, VERBATIM: "[ Space · 다시 하기 ]"
  - IDLE STATE (before first play): the character auto-runs and auto-jumps
    (a simple demo AI), and a blinking prompt in the center, pixel font 16px
    #bef264, blinking at 1Hz with steps(1), VERBATIM: "PRESS SPACE"

  Draw everything with canvas rect fills - no sprite assets needed.
  Palette: ground rgba(163,230,53,0.30), player #bef264, obstacles
  rgba(255,255,255,0.55), items #fcd34d, background transparent (the container
  color shows through).

  RESET control at the container's bottom-right, font-mono 11px,
  rgba(255,255,255,0.46), VERBATIM: "↻ 처음부터"

KEYBOARD SAFETY (critical): capture Space and ArrowUp ONLY while the pointer is
inside this container or the container has keyboard focus, and call preventDefault
only in that case. NEVER capture keys globally - it would break page scrolling.
Show a 1px #a3e635 focus ring when the container is active, plus a tiny label,
font-mono 9px rgba(255,255,255,0.35), VERBATIM: "조작 활성"

PERFORMANCE (required): the requestAnimationFrame loop must STOP entirely when the
container leaves the viewport (IntersectionObserver) or the tab is hidden, and
resume on return. Never leave a rAF loop running off-screen.

=== BLOCK B RIGHT: THE LIVE CODE PANEL (the key idea of this page) ===
Height 420px, background #0c1105, border 1px rgba(163,230,53,0.18), rounded-md.
Header bar: three window dots (#ff5f56 #ffbd2e #27c93f, 8px) then the filename,
font-mono 11px rgba(255,255,255,0.45), VERBATIM: "GameScene.ts"

Body: font-mono 12px, leading-relaxed, line-number gutter rgba(255,255,255,0.22),
min-width 20px, right-aligned, user-select none.
CONTENT: a Phaser scene class, roughly 26 lines, containing a create() that sets up
the player, ground, obstacle group and input, and an update(time, delta) that:
  (a) reads the jump input and applies an upward velocity when grounded,
  (b) advances the world scroll and the score by delta,
  (c) spawns a new obstacle when the spawn timer elapses,
  (d) destroys obstacles that have moved off the left edge,
  (e) checks overlap between the player and obstacles and ends the run on a hit.
Structure it so (a)-(e) are five clearly contiguous blocks.

THE LIVE HIGHLIGHT (the payoff - implement carefully):
As the game runs, the code panel highlights whichever block corresponds to what
just happened in the frame:
  - jump input registered  -> block (a) gets a rgba(163,230,53,0.16) row background
  - every frame            -> block (b) has a permanent faint pulse,
                              rgba(163,230,53,0.05) breathing on a 1s cycle,
                              indicating "this runs constantly"
  - an obstacle spawns     -> block (c) flashes rgba(252,211,77,0.14)
  - an obstacle is removed -> block (d) flashes rgba(255,255,255,0.10)
  - a collision            -> block (e) flashes rgba(248,113,113,0.18) and STAYS
                              highlighted until the run restarts
Each flash lasts 0.35s and fades out.
IMPLEMENTATION CONSTRAINT: do NOT re-render the code block on every frame. Render
the code once, keep refs to the five block elements, and toggle a CSS class on them
from inside the game loop. Throttle repeated triggers to at most one flash per
block per 150ms.

A live frame counter docked at the code panel's bottom-left, font-mono 10px
rgba(255,255,255,0.35), tabular-nums, format VERBATIM: "update() 호출 0회"
It increments every frame while playing and freezes on game over.

Caption bar at the bottom, border-top 1px rgba(163,230,53,0.12), font-mono 11px
rgba(255,255,255,0.45), prefixed "// ", VERBATIM:
  "delta를 곱하는 이유: 프레임이 밀려도 속도가 같아야 한다"

=== BLOCK C: THE FRAME BUDGET NOTE (forward hook) ===
Margin-top 32px, padding 16px 20px, rounded-md,
border 1px rgba(163,230,53,0.20), background rgba(163,230,53,0.04).
  Label font-mono 10px letter-spacing 0.18em #a3e635, VERBATIM: "프레임 예산"
  Body 15px leading-8 margin-top 8px, VERBATIM:
  "60fps면 한 프레임에 쓸 수 있는 시간이 16밀리초다.
   여기서 오브젝트를 안 지우면 그 16밀리초가 순식간에 모자라진다.
   그 얘기는 조금 뒤에 하겠다."
  Emphasize "16밀리초" in #bef264. This is a deliberate hook for the optimization
  troubleshooting section - keep it.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s (stagger 0.03s)
0.70s  Paragraph 1, paragraph 2 at 1.20s
1.70s  Game container and code panel fade up together (y 20px -> 0, 0.6s)
2.30s  The game's IDLE demo starts; "PRESS SPACE" begins blinking at 1Hz
2.60s  The code panel's block (b) begins its constant breathing pulse

=== RESPONSIVE ===
< 1024px: stacked, game first (height 340px), code panel below (height auto,
max 420px, internal vertical scroll).
< 768px: the game becomes TAP-controlled (the whole canvas is a jump button);
the header hint reads VERBATIM "▸ 화면을 탭하면 점프"; code font 11px with internal
horizontal scroll (the block scrolls, never the page).
Touch: apply touch-action: manipulation on the canvas so tapping does not
double-tap-zoom, but do NOT block page scrolling.

=== ACCESSIBILITY ===
prefers-reduced-motion: no idle auto-demo, no blinking prompt (it renders solid),
no breathing pulse on block (b). The game itself remains fully playable.
The game container must be keyboard focusable with an accessible name and a visible
focus ring. Provide a visually-hidden description, VERBATIM:
  "스페이스바로 점프하는 간단한 러너 게임입니다. 장애물에 닿으면 끝납니다."
Announce game over once via aria-live="polite" with the final score.
The code must be selectable, copyable text - never an image.
Scanlines are STATIC.

=== DO NOT ===
Do not load Phaser, Pixi, or any game library - plain canvas + rAF only.
Do not re-render the code panel per frame.
Do not capture keyboard input globally.
Do not leave the rAF loop running when the section is off-screen.
No screen shake, no flicker, no strobing on collision - a single 0.35s tint only.
```

---

## PAGE 03 — 조작감은 튜닝의 결과다 · A/B로 직접 비교

**개발 실체**: 점프 메커니즘 튜닝 (코요테 타임 · 점프 버퍼) + **두 버전의 실제 코드 차이**
**연출 장치**: **토글로 두 방식을 번갈아 플레이** — "왜 저쪽이 더 잘 되지?" 를 몸으로 느끼게

```text
Build a GAME FEEL COMPARISON section where the viewer plays the SAME mini jump
challenge under two different input implementations and can toggle between them,
with the code difference shown beside it.
Stack: React + TypeScript + Tailwind CSS. Plain <canvas> + requestAnimationFrame.
Do NOT load any game engine.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That "controls feel good" is an implementation decision, not luck
2. Two concrete techniques: coyote time and jump buffering - what each does
3. The actual code difference between the naive version and the tuned version
4. An honest note on how the values were chosen

=== MOOD ===
Arcade, but now the cabinet's back panel is open. Still lime and playful, but the
viewer is being shown the mechanism. Curious, hands-on.

=== DESIGN TOKENS (use exactly) ===
background #141a0a | panel #151d09 | primary lime #a3e635 | accent #bef264
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0c1105, border rgba(163,230,53,0.18)
syntax: comments #6b8a3f, strings #fcd34d, keywords #a3e635, numbers #7dd3fc
fonts: SCORES pixel font; body sans leading-8; code + labels font-mono 12px
easing cubic-bezier(0.2,0.8,0.2,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1060px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the A/B toggle, centered
  Block C : THE CHALLENGE - a playable canvas, full width, height 300px
  Block D : the failure counter comparison
  Block E : two code panels side by side
  Block F : the honesty note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "02 · 조작감"

HEADING (28px font-black):
  VERBATIM: "「점프가 안 먹었어」는 대부분 플레이어 잘못이 아니다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "발판 끝에서 한 프레임 늦게 점프를 누르면, 코드상으로는 이미 공중이라
             점프가 무시된다. 사람 손은 그렇게 정확하지 않다."

=== BLOCK B: THE A/B TOGGLE ===
A segmented control, centered, margin-top 32px.
Container: inline-flex, background #0c1105, border 1px rgba(163,230,53,0.22),
rounded-md, padding 4px.
Two buttons, font-mono 12px, padding 9px 20px, rounded:
  VERBATIM "A · 그냥 구현"   |   VERBATIM "B · 튜닝 후"
Active: background rgba(163,230,53,0.14), color #a3e635, with a 2px lime indicator
bar sliding beneath (0.3s spring - it must slide, never jump).
Default: A.
Below the toggle, a line that swaps, font-mono 11px rgba(255,255,255,0.46):
  A -> "지면에 붙어 있을 때만 점프가 됩니다"
  B -> "코요테 타임 0.1초 + 점프 버퍼 0.1초가 적용됩니다"

=== BLOCK C: THE CHALLENGE (playable, must actually work) ===
Container: height 300px, rounded-md, border 1px rgba(163,230,53,0.18),
background #0c1105, overflow hidden. STATIC scanlines overlay.

Header strip (28px): left font-mono 10px rgba(255,255,255,0.46),
VERBATIM: "▸ 발판 끝에서 점프해보세요"
right, two readouts, font-mono 11px tabular-nums:
  VERBATIM "성공 0"  (#4ade80)   VERBATIM "실패 0"  (#f87171)

THE CHALLENGE (canvas):
  A short repeating course: a series of floating platforms with GAPS between them.
  The player auto-runs right and must jump each gap. Platforms are deliberately
  short so the timing window at the edge matters.
  Only one control: Space / click / tap = jump.
  On a successful gap crossing, the success counter increments and a small lime
  "+1" floats up.
  On a fall, the failure counter increments, the screen tints
  rgba(248,113,113,0.10) for 0.25s (a single tint, never a strobe), and the player
  respawns at the last platform after 0.4s.

  MODE A behavior: a jump is only accepted when the player is exactly grounded.
  A press one frame after leaving the ledge is silently ignored, and a press one
  frame before landing is silently ignored.
  MODE B behavior: coyote time - a jump is still accepted for ~100ms after leaving
  a ledge; jump buffering - a press within ~100ms before landing is stored and
  fires the moment the player touches down.

  A REJECTED-INPUT INDICATOR (this is what makes the difference visible):
  whenever a jump press is ignored, draw a small grey "✕" at the player's position
  that fades over 0.4s, and flash a chip at the top-center, font-mono 10px
  rgba(255,255,255,0.45), VERBATIM: "입력 무시됨"
  In MODE B, the same press instead shows a lime "✓" chip, VERBATIM: "버퍼에 저장됨"
  or VERBATIM: "코요테 타임 적용" depending on which rule saved it.

  RESET control, bottom-right, font-mono 11px, VERBATIM: "↻ 카운터 초기화"

KEYBOARD SAFETY: capture Space ONLY while the pointer is inside the container or it
has focus. Never globally.
PERFORMANCE: stop the rAF loop when off-screen or the tab is hidden.

=== BLOCK D: THE FAILURE COMPARISON ===
Margin-top 24px. Two stat cards side by side, gap 12px.
Each: padding 16px, rounded-md, border 1px, background rgba(255,255,255,0.02).
  LEFT  border rgba(255,255,255,0.14)
        label font-mono 10px rgba(255,255,255,0.46), VERBATIM: "A · 그냥 구현"
        value font-mono 28px font-black tabular-nums, VERBATIM pattern: "실패 0회"
  RIGHT border rgba(163,230,53,0.30)
        label font-mono 10px #a3e635, VERBATIM: "B · 튜닝 후"
        value same format
Both cards accumulate the viewer's OWN counts across mode switches and persist
while the section is mounted, so the comparison is the viewer's own data.
Below them, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "이 숫자는 지금 당신이 플레이한 결과입니다"

=== BLOCK E: TWO CODE PANELS ===
Margin-top 40px. Side by side, gap 16px (stack below 1024px, A on top).
Each: background #0c1105, border 1px, rounded-md, header bar with three window dots
and a filename in font-mono 11px rgba(255,255,255,0.45), body font-mono 12px with a
line-number gutter.

  LEFT panel  - border 1px rgba(255,255,255,0.14)
    filename VERBATIM: "Player.ts (A)"
    CONTENT: ~10 lines. A jump handler that checks a grounded flag and applies an
    upward velocity only when it is true.
    HIGHLIGHT the grounded check row with rgba(255,255,255,0.08) and add an inline
    marker at its right edge, font-mono 10px rgba(255,255,255,0.45),
    VERBATIM: "← 한 프레임만 늦어도 끝"

  RIGHT panel - border 1px rgba(163,230,53,0.30)
    filename VERBATIM: "Player.ts (B)"
    CONTENT: ~18 lines. Same handler plus: a coyote timer that is reset to a small
    window when grounded and decremented by delta each frame; a jump-buffer timer
    set when the press arrives and decremented by delta; a jump firing when the
    buffer is active AND the coyote timer has not expired; and both timers clearing
    on a successful jump.
    HIGHLIGHT the coyote timer row and the buffer check row with
    rgba(163,230,53,0.14).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "두 줄 추가했을 뿐인데 「잘 되는 게임」이 됐다"

WHEN THE VIEWER TOGGLES A/B, the corresponding panel gets a lime border glow
(box-shadow 0 0 24px rgba(163,230,53,0.18)) and the other dims to 55% opacity.
0.3s transition. This binding is required - the toggle and the code must be
visibly the same thing.

=== BLOCK F: THE HONESTY NOTE (required) ===
Margin-top 32px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "정직하게 말하면"
  Body 15px leading-8, VERBATIM:
  "0.1초라는 값은 계산해서 나온 게 아니다. 직접 수십 번 뛰어보면서
   「이 정도면 억울하지 않다」 싶은 지점으로 맞춘 값이다.
   다른 사람에게 테스트해보지는 못했다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  Toggle fades up, indicator bar draws
1.50s  Challenge canvas fades up (y 18px -> 0, 0.6s) and its idle demo begins
2.10s  Stat cards fade in
2.50s  Both code panels fade up together; the active one takes its lime glow

=== RESPONSIVE ===
< 1024px: code panels stack (A on top).
< 640px: challenge height 240px, tap-controlled, header hint reads
VERBATIM "▸ 화면을 탭해서 점프"; stat cards stack; code font 11px with internal
horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no idle demo, no floating "+1", no screen tint on failure
(use a static border color change instead), no sliding indicator.
The A/B toggle must be a real radiogroup, arrow-key navigable, with visible focus
rings (2px #a3e635, offset 2px).
The canvas is focusable with an accessible name and a visually-hidden description,
VERBATIM: "발판 사이를 점프해서 건너는 연습 화면입니다."
Announce mode changes once via aria-live="polite" with the sub-line copy.

=== DO NOT ===
Do not load a game engine.
Do not make mode B trivially easy - the point is that it feels fair, not that it
removes the challenge.
Do not strobe on failure - one 0.25s tint only.
Do not remove the honesty note about how 0.1s was chosen.
```

---

## PAGE 04 — 트러블슈팅 01 · 안 지운 오브젝트가 쌓인다

**개발 실체**: 오브젝트 생성/제거 최적화의 **전체 과정** (증상 → 측정 → 원인 → 풀링 → 검증 → 한계)
**연출 장치**: **"제거 끄기" 토글** — 관람객이 직접 켜고 플레이하면 눈앞에서 오브젝트 수가 폭증하고 프레임이 무너진다

```text
Build a PERFORMANCE TROUBLESHOOTING section where the viewer can switch OFF object
cleanup in a live mini-game and watch the active-object count explode and the frame
rate collapse in front of them, then walks the full diagnosis and the fix.
Stack: React + TypeScript + Tailwind CSS. Plain <canvas> + requestAnimationFrame.
Do NOT load any game engine.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the object-lifecycle performance problem:
symptom -> measurement -> root cause -> the fix (object pooling / destroy on exit)
-> verification -> what was NOT measured. All six parts are required.

=== SAFETY ===
The degraded mode is opt-in (the viewer flips the toggle) and hard-capped: the
object count stops growing at 400 and the demo auto-recovers after 15 seconds with
a notice. It must never freeze the page.

=== MOOD ===
The cabinet's back panel is open and something is smoking. Lime turns to amber then
red as the numbers climb. Diagnostic, a bit alarming, ultimately reassuring.

=== DESIGN TOKENS (use exactly) ===
background #141a0a | panel #151d09 | primary lime #a3e635 | accent #bef264
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0c1105, border rgba(163,230,53,0.18)
syntax: comments #6b8a3f, strings #fcd34d, keywords #a3e635, numbers #7dd3fc
fonts: numbers in pixel font where large; body sans leading-8; code font-mono 12px
easing cubic-bezier(0.2,0.8,0.2,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1060px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE DEMO - canvas + live gauges + the cleanup toggle
  Block C : the measurement table
  Block D : the fix (before/after code)
  Block E : verification
  Block F : "what I could not measure" card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "03 · 트러블슈팅 01"

HEADING (30px font-black):
  VERBATIM: "화면 밖으로 나간 발판은 어디로 갔을까"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "1분쯤 플레이하면 점점 버벅였다. 처음 30초는 멀쩡하고, 그 뒤로 느려진다.
   폰에서는 더 심했다. 게임 로직은 아무것도 안 바뀌었는데."

=== BLOCK B: THE DEMO (the defining idea of this page) ===
Margin-top 36px. A container, height 420px, rounded-md,
border 1px rgba(163,230,53,0.18), background #0c1105, overflow hidden.
STATIC scanlines overlay.

TOP BAR (44px, border-bottom 1px rgba(163,230,53,0.12)), containing THE TOGGLE and
three live gauges:

  THE TOGGLE (left): a switch, font-mono 11px, width 168px, height 30px,
  background rgba(255,255,255,0.04), border 1px rgba(163,230,53,0.22), rounded,
  with two halves:
    LEFT  VERBATIM "제거 켬"   (active: color #4ade80)
    RIGHT VERBATIM "제거 끔"   (active: color #f87171)
  Default: 제거 켬.

  GAUGE 1 (center-left): font-mono 11px label VERBATIM "활성 오브젝트"
    and a big value in pixel font 24px, tabular-nums.
    Color rules: under 40 -> #4ade80; 40-120 -> #fbbf24; over 120 -> #f87171.
  GAUGE 2 (center-right): label VERBATIM "FPS", value pixel font 24px,
    same three-tier coloring reversed (over 50 -> #4ade80, 30-50 -> #fbbf24,
    under 30 -> #f87171).
  GAUGE 3 (right): a live FPS sparkline, 120x28px, SVG polyline holding 60 points,
    stroke color matching the current FPS tier, appended once per second.

THE GAME AREA (canvas, fills the remaining height):
  The same one-button runner as earlier: auto-scrolling ground, obstacles spawning
  every 900-1700ms, jump on Space / tap.
  IN "제거 켬" MODE: obstacles that scroll past the left edge are removed from the
  active array. The active-object count hovers around 8-14.
  IN "제거 끔" MODE: obstacles that scroll past the left edge are KEPT in the array
  and are still updated and collision-checked every frame (they are simply drawn
  off-screen). The count grows continuously.
  To make the frame cost real rather than faked, each retained object performs a
  small but genuine per-frame workload (position update + a collision distance
  check against the player). The FPS drop must be an ACTUAL measured drop from the
  rAF timestamps, not a scripted number.

  SAFETY CAP: the count stops growing at 400. At that point a chip appears at the
  top-center, font-mono 10px #f87171, VERBATIM: "상한 400개 · 안전을 위해 고정"
  AUTO-RECOVERY: 15 seconds after "제거 끔" is enabled, the demo automatically
  switches back to "제거 켬", purges the retained objects, and shows a line for 3s,
  font-mono 11px #4ade80, VERBATIM: "자동 복구됨 · 오브젝트 정리 완료"

  WHEN THE COUNT CROSSES 120, a message fades in over the canvas, max-width 420px,
  centered, 17px leading-9, rgba(255,255,255,0.88), VERBATIM:
    "지금 느껴지시나요? 게임 로직은 하나도 안 바뀌었습니다."
  It fades out when the count returns under 40.

KEYBOARD SAFETY: Space captured only when the container is hovered or focused.
PERFORMANCE: the rAF loop stops when the container is off-screen or the tab is
hidden, and any retained objects are purged on stop.

=== BLOCK C: THE MEASUREMENT TABLE ===
Margin-top 40px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "실제 게임에서 확인한 것"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "플레이 시간" | "활성 오브젝트" | "체감"
Rows:
  "30초"  | "약 12개"   | "정상"
  "1분"   | "약 90개"   | "가끔 끊김"
  "2분"   | "약 200개"  | "확실히 느려짐"
The 체감 cells are colored #4ade80 / #fbbf24 / #f87171 top to bottom.
Rows reveal 0.14s apart on entry.
Below the table, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "브라우저 개발자 도구로 오브젝트 수만 세어본 수치입니다.
   프로파일러로 프레임 시간을 정식 측정하지는 않았습니다."

=== BLOCK D: THE FIX (before / after code) ===
Margin-top 40px. Two code panels, side by side above 1024px, stacked below, gap 16px.
Each: background #0c1105, border 1px, rounded-md, header with three window dots and
a filename, body font-mono 12px with a line-number gutter.

  BEFORE panel - border 1px rgba(248,113,113,0.28),
    filename VERBATIM: "ObstacleSpawner.ts (before)"
    CONTENT: ~12 lines. A spawner that creates a new obstacle on a timer, pushes it
    into an array, and updates every element of that array each frame - with no
    removal path at all.
    HIGHLIGHT the push row with rgba(248,113,113,0.12) and add an inline marker at
    its right edge, font-mono 10px #f87171, VERBATIM: "← 넣기만 한다"

  AFTER panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "ObstacleSpawner.ts (after)"
    CONTENT: ~20 lines. A pooled spawner: a pool array of inactive obstacles;
    an acquire function that reuses an inactive object if one exists and only
    allocates when the pool is empty; a release path that deactivates an obstacle
    once it passes the left boundary and returns it to the pool; and an update loop
    that iterates only the ACTIVE list.
    HIGHLIGHT the boundary check + release row and the pool reuse row with
    rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "만들고 버리는 대신, 껐다 켠다. GC도 덜 돈다."

=== BLOCK E: VERIFICATION ===
Margin-top 36px. Three stat cells in a row, gap 12px (stacks below 640px).
Each: padding 16px, rounded-md, border 1px rgba(74,222,128,0.22),
background rgba(74,222,128,0.04).
  Cell 1  value pixel font 26px #4ade80 VERBATIM "12개"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "2분 플레이 후 활성 오브젝트"
  Cell 2  value VERBATIM "일정"   label VERBATIM "플레이 시간에 따른 증가"
  Cell 3  value VERBATIM "0회"   label VERBATIM "이후 체감 끊김 보고"
Values count up / fade in on entry.

=== BLOCK F: WHAT I COULD NOT MEASURE (required - do not remove) ===
Margin-top 30px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "재보지 못한 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "프레임 시간이 몇 밀리초에서 몇 밀리초로 줄었는지는 측정하지 않았다."
    "메모리 사용량 변화도 확인하지 않았다. 체감과 오브젝트 수만 봤다."
    "저사양 기기에서의 실제 개선 폭은 모른다. 내 폰 한 대에서만 확인했다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading at 0.15s
0.60s  Symptom card slides in from the left (x -12px -> 0)
1.10s  Demo container fades up; the game starts in "제거 켬" mode
1.80s  The gauges begin updating
2.40s  A one-time hint pulses on the toggle (a soft lime ring, 2 pulses, 0.9s each),
       font-mono 10px rgba(255,255,255,0.35) beside it,
       VERBATIM: "「제거 끔」으로 바꿔보세요"
       The hint disappears permanently once the toggle is used.
Table, code, verification and the limits card animate on their own entry.

=== RESPONSIVE ===
< 1024px: code panels stack (before on top).
< 640px: demo height 340px, gauges wrap to two rows, sparkline hidden;
game is tap-controlled; table becomes a stacked card list; code font 11px with
internal horizontal scroll (the block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: the demo still runs and is still playable, but the
over-canvas message appears without animation and the toggle hint does not pulse.
The toggle is a real switch (role="switch", aria-checked) with a visible focus ring
(2px #a3e635, offset 2px).
Announce crossing the 120-object threshold ONCE via aria-live="polite", VERBATIM:
  "활성 오브젝트가 급증해 프레임 속도가 떨어지고 있습니다."
Do not announce every gauge tick.
Numbers are tabular-nums so the gauges do not jitter.

=== DO NOT ===
Do not fake the FPS drop - measure real rAF frame deltas.
Do not let the object count grow without the 400 cap and the 15-second auto-recovery.
Do not claim millisecond improvements that were never measured - the
"재보지 못한 것" card must stay.
No strobing as the numbers turn red - color transitions only, 0.3s.
```

---

## PAGE 05 — 맵은 손으로 그리지 않았다 · 자동 생성 규칙

**개발 실체**: 자동 발판 생성 알고리즘 + **생성 규칙 코드**
**연출 장치**: 생성 규칙을 슬라이더로 직접 바꾸면 **눈앞에서 맵이 다시 만들어진다**

```text
Build a PROCEDURAL LEVEL GENERATION section where the viewer adjusts the generation
rules with sliders and watches the level rebuild itself in real time, with the
generator code updating alongside.
Stack: React + TypeScript + Tailwind CSS. Plain <canvas> or SVG - no game engine.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. Why the level is generated rather than hand-authored
2. The actual generation rules (gap range, height range, minimum reachability)
3. The constraint that every generated gap MUST be jumpable - and how that was
   enforced

=== MOOD ===
The cabinet's design table. Lime on dark, grid paper feeling. Systematic and calm.

=== DESIGN TOKENS (use exactly) ===
background #141a0a | panel #151d09 | primary lime #a3e635 | accent #bef264
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0c1105, border rgba(163,230,53,0.18)
syntax: comments #6b8a3f, strings #fcd34d, keywords #a3e635, numbers #7dd3fc
fonts: body sans leading-8; code + labels + slider values font-mono 12px
easing cubic-bezier(0.2,0.8,0.2,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1080px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : a two-column split, gap 18px
              LEFT  (60%) : the generated level preview, height 400px
              RIGHT (40%) : the sliders + the generator code, height 400px
            Below 1024px stacks, preview first.
  Block C : the reachability guarantee card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "04 · 맵 자동 생성"

HEADING (28px font-black):
  VERBATIM: "끝이 없는 맵을 손으로 그릴 수는 없다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "자동 스크롤 게임이라 맵에 끝이 없다.
             그래서 발판을 미리 배치하는 대신, 필요할 때마다 규칙에 따라 만들어낸다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "규칙이 잘못되면 못 넘는 구간이 생긴다. 그러면 플레이어는
             자기 실력 탓이 아니라 게임 탓으로 죽는다. 그건 최악이다."
  Emphasize "게임 탓으로 죽는다" in #f87171, font-bold.

=== BLOCK B LEFT: THE LEVEL PREVIEW ===
Container: height 400px, rounded-md, border 1px rgba(163,230,53,0.18),
background #0c1105, overflow hidden. STATIC scanlines overlay at low opacity.
A faint 24px grid in rgba(163,230,53,0.05) behind everything, like graph paper.

Header strip (28px): left font-mono 10px rgba(255,255,255,0.46),
VERBATIM: "GENERATED LEVEL · 미리보기"
right, font-mono 10px, VERBATIM: "seed 4821"  (tabular-nums; changes on reroll)

CONTENT: a side-view level, scrolling slowly and continuously right to left.
Platforms are lime-outlined rectangles of varying width and height, separated by
gaps. Campus-object silhouettes (a bench, a bollard, a book stack) sit on some
platforms as obstacles. A small pixel character auto-runs and auto-jumps across it
so the viewer can see whether the generated level is actually playable.

MEASUREMENT OVERLAYS (this is what makes the rules visible):
  - Each gap is annotated with a thin dashed lime line and its width in
    font-mono 9px #bef264 above it, format VERBATIM: "간격 148"
  - Each height change is annotated with a vertical dashed line and its delta,
    format VERBATIM: "높이 +32"
  - The MAXIMUM JUMPABLE DISTANCE is drawn as a translucent lime arc from the last
    platform edge, rgba(163,230,53,0.14) fill, so the viewer can see whether a gap
    fits under the arc.
  - If a generated gap EXCEEDS the arc, it is drawn in #f87171 with a marker,
    font-mono 9px, VERBATIM: "넘을 수 없음"
    (In the default settings this never happens - it only appears when the viewer
     drags the sliders into an impossible range. That is the whole point.)

A reroll control at the bottom-right, font-mono 11px rgba(255,255,255,0.46),
VERBATIM: "↻ 다시 생성"

=== BLOCK B RIGHT: THE SLIDERS + GENERATOR CODE ===
Two stacked parts inside a 400px column.

PART 1 - THE SLIDERS (height ~150px), three range inputs.
Each row: a label font-mono 11px rgba(255,255,255,0.46) on the left, the slider in
the middle (track rgba(255,255,255,0.10) 3px, thumb 14px #a3e635), and the current
value on the right in font-mono 12px #bef264 tabular-nums.
  Slider 1  label VERBATIM "발판 간격"   range 60-260, default 140, unit "px"
  Slider 2  label VERBATIM "높이 변화"   range 0-120,  default 40,  unit "px"
  Slider 3  label VERBATIM "장애물 확률" range 0-100,  default 35,  unit "%"
Dragging any slider regenerates the preview IMMEDIATELY and continuously
(throttled to at most one regeneration per animation frame).

A warning chip appears beside slider 1 when its value exceeds the jumpable
distance, font-mono 10px #f87171, VERBATIM: "점프로 못 넘는 구간이 생깁니다"

PART 2 - THE GENERATOR CODE (height ~230px)
background #0c1105, border 1px rgba(163,230,53,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "LevelGenerator.ts"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~18 lines. A generator that, given the previous platform, picks a gap
width and a height delta from configured ranges, CLAMPS the gap to the maximum
jumpable distance computed from the player's jump velocity and gravity, decides
whether to place an obstacle by probability, and returns the next platform
descriptor.
THE NUMERIC CONSTANTS FOR gap range, height range and obstacle probability UPDATE
LIVE as the sliders move - the changing numeric tokens render in #7dd3fc and their
rows take a rgba(163,230,53,0.12) background while being dragged.
IMPLEMENTATION CONSTRAINT: update those numbers by writing to the DOM nodes inside
requestAnimationFrame; do NOT re-render the whole code block per input event.
HIGHLIGHT PERMANENTLY (a rgba(163,230,53,0.08) row background): the clamp line.
Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
  "무작위로 뽑되, 넘을 수 있는 범위로 자른다"

=== BLOCK C: THE REACHABILITY GUARANTEE CARD ===
Margin-top 32px, padding 20px, rounded-md, border 1px rgba(163,230,53,0.22),
background rgba(163,230,53,0.04), border-left 3px #a3e635.
  Label font-mono 10px letter-spacing 0.18em #a3e635, VERBATIM: "설계 규칙"
  Body 15px leading-8, VERBATIM:
  "무작위 생성에서 제일 중요한 건 다양성이 아니라 보장이다.
   점프 속도와 중력으로 최대 도달 거리를 먼저 계산해두고,
   생성된 간격이 그걸 넘으면 무조건 잘라낸다.
   그래서 이 게임에는 「운 나빠서 못 넘는 구간」이 없다."
  Emphasize "다양성이 아니라 보장이다" in #bef264, font-bold.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading at 0.15s
0.60s  Paragraphs 1 and 2, 0.5s apart
1.40s  Preview container fades up; the level draws itself LEFT TO RIGHT, one
       platform at a time, 0.07s apart, each platform's outline sweeping in
2.30s  The measurement overlays fade in on top, 0.05s apart
2.70s  The auto-running character enters from the left and begins its run
3.00s  Sliders fade in, then the code panel at 3.20s
3.60s  ONE automatic demonstration: slider 1 animates from 140 to 220 and back
       over 1.6s, showing the level rebuild live. ONCE ONLY, and only if the viewer
       has not touched a slider. A caption during it, font-mono 10px
       rgba(255,255,255,0.35), VERBATIM: "자동 시연"

=== PERFORMANCE ===
The scrolling preview and the auto-runner must STOP when the section is off-screen
or the tab is hidden.

=== RESPONSIVE ===
< 1024px: stacked; preview height 320px; sliders full width; code panel height auto
(max 320px, internal scroll).
< 640px: measurement overlay labels shrink to 8px and only every other gap is
annotated to avoid clutter; code font 11px with internal horizontal scroll.
Touch: sliders need 44px touch targets.

=== ACCESSIBILITY ===
prefers-reduced-motion: no scrolling preview (render one static generated level),
no auto-runner, no automatic slider demonstration.
Sliders must be real <input type="range"> elements with accessible names,
aria-valuetext including the unit, and visible focus rings (2px #a3e635, offset 2px).
Announce the "점프로 못 넘는 구간이 생깁니다" warning via aria-live="polite" when it
first appears, not on every drag tick.

=== DO NOT ===
Do not load a game engine.
Do not re-render the code block on every slider input.
Do not remove the impossible-gap warning - being able to break it is what proves
the clamp matters.
```

---

## PAGE 06 — 낮과 밤 · 진행감을 시각으로 만든다

**개발 실체**: 낮/밤 전환 시스템 구현 + **시간 보간 코드**
**연출 장치**: **스크롤을 내리면 이 페이지 자체가 낮에서 밤으로 바뀐다**

```text
Build a DAY-NIGHT SYSTEM section where THE PAGE ITSELF transitions from day to
night as the viewer scrolls through it, demonstrating the game's progression
system, with the color interpolation code shown alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. Why a day/night cycle exists at all (it is a progress indicator, not decoration)
2. How the transition is implemented (interpolating between key colors over a
   progress value, not swapping two backgrounds)
3. The performance constraint that shaped the implementation

=== MOOD ===
Campus at golden hour turning to night. Warm lime shifting to deep blue-black.
This is the calmest, prettiest page in the room - and it earns that by being the
one place where beauty IS the feature being described.

=== DESIGN TOKENS ===
This section's background is NOT fixed - it interpolates with scroll progress:
  progress 0.00 -> #1e2a0e  (afternoon)
  progress 0.45 -> #2a1c0a  (sunset)
  progress 0.75 -> #10160a  (dusk)
  progress 1.00 -> #0a0f04  (night)
Interpolate in a perceptually reasonable space; the transition must be CONTINUOUS,
never a step.
primary lime #a3e635 | accent #bef264 | sunset amber #fbbf24 | night blue #7dd3fc
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg rgba(0,0,0,0.45), border rgba(163,230,53,0.18)
syntax: comments #6b8a3f, strings #fcd34d, keywords #a3e635, numbers #7dd3fc
fonts: body sans leading-8; code + labels font-mono 12px
easing linear for the scroll binding (it must track scroll exactly, not spring)
numbers tabular-nums

=== LAYOUT ===
This section is TALL on purpose: min-height 200vh, so the transition has room.
A sticky inner column, max-width 900px, top 96px, containing:
  Block A : label + heading + two paragraphs
  Block B : THE SKY STRIP - a full-width band, height 220px
  Block C : the key-color table
  Block D : the code panel
  Block E : the performance note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "05 · 낮과 밤"

HEADING (28px font-black):
  VERBATIM: "「얼마나 왔지?」에 답하는 가장 조용한 방법"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "점수만 올라가면 얼마나 왔는지 감이 안 온다.
             숫자는 읽어야 알지만, 하늘색은 안 읽어도 안다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "지금 이 화면도 스크롤을 내릴수록 저녁이 되고 있습니다.
             게임에서 하는 일이랑 정확히 같은 겁니다."
  Emphasize "지금 이 화면도" in #fbbf24, font-bold.

=== BLOCK B: THE SKY STRIP ===
A full-width band, height 220px, rounded-md, overflow hidden,
border 1px rgba(255,255,255,0.10).
Contents, all driven by the SAME scroll progress value as the page background:
  - A sky gradient filling the band, interpolating through the same four key
    colors, top lighter than bottom.
  - A SUN/MOON disc that travels along an arc from the left edge (y 70%) up over
    the top (y 20%) and down to the right edge (y 70%) as progress goes 0 -> 1.
    It is a warm #fcd34d disc at progress 0, shifts to #f87171-tinted at sunset,
    and becomes a pale #e2e8f0 crescent after progress 0.75.
  - A campus skyline silhouette along the bottom (simple building shapes in a
    color slightly darker than the sky), STATIC.
  - STARS: 40 small dots that are invisible below progress 0.65 and fade in
    between 0.65 and 1.00, each with its own tiny random opacity offset. They must
    NOT twinkle rapidly - if they animate at all, a 4s+ cycle at low amplitude.
  - A readout chip at the band's top-right, font-mono 11px rgba(255,255,255,0.60),
    tabular-nums, showing the interpolated in-game time, format VERBATIM: "14:20"
    running from VERBATIM "14:00" at progress 0 to VERBATIM "21:00" at progress 1.

IMPLEMENTATION CONSTRAINT (critical): bind the scroll progress to CSS custom
properties on a wrapper (e.g. --t) inside a requestAnimationFrame-throttled scroll
handler, and let CSS do the color interpolation. Do NOT store scroll position in
React state - that re-renders on every scroll event and will stutter.

=== BLOCK C: THE KEY-COLOR TABLE ===
Margin-top 40px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "키 컬러 4개"
A 4-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "구간" | "진행도" | "하늘색" | "역할"
Rows (each 하늘색 cell shows a 14px color swatch plus its hex):
  "오후"  | "0%"   | swatch #1e2a0e | "시작. 밝고 편안하다"
  "노을"  | "45%"  | swatch #2a1c0a | "중반. 뭔가 진행됐다는 신호"
  "해질녘"| "75%"  | swatch #10160a | "후반. 긴장이 올라간다"
  "밤"    | "100%" | swatch #0a0f04 | "끝. 오래 살아남았다는 표시"
The row matching the viewer's CURRENT scroll progress is highlighted with a
rgba(163,230,53,0.08) background and a 2px lime left border, and the highlight
MOVES between rows as the viewer scrolls. That live binding is required.

=== BLOCK D: THE CODE PANEL ===
Margin-top 36px, full width. background rgba(0,0,0,0.45), backdrop-blur(4px),
border 1px rgba(163,230,53,0.18), rounded-md.
(The translucent background is deliberate - the code panel must sit ON the sky, so
the viewer sees the page color changing behind the code that produces it.)
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "DayNightCycle.ts"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~16 lines. A cycle controller that holds an ordered array of key colors
with their progress stops, computes the current progress from the player's distance
travelled, finds the two surrounding stops, linearly interpolates between their RGB
values, and applies the result to the scene's background and to an ambient tint on
the sprites.
HIGHLIGHT ROWS: the two-stop lookup line and the interpolation line
(background rgba(163,230,53,0.10)).
Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
  "배경을 두 장 준비해서 바꾸는 게 아니라, 색 하나를 계속 계산한다"

=== BLOCK E: THE PERFORMANCE NOTE ===
Margin-top 32px, padding 20px, rounded-md, border 1px rgba(163,230,53,0.20),
background rgba(163,230,53,0.04).
  Label font-mono 10px letter-spacing 0.18em #a3e635, VERBATIM: "왜 이렇게 했나"
  Body 15px leading-8, VERBATIM:
  "처음엔 낮 배경 이미지와 밤 배경 이미지를 크로스페이드했다.
   이미지 두 장을 계속 들고 있어야 하고, 전환도 뚝뚝 끊겼다.
   색 네 개만 보간하니 이미지가 아예 필요 없어졌고, 용량도 줄었다."
  Emphasize "이미지가 아예 필요 없어졌고" in #bef264, font-bold.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading at 0.15s
0.60s  Paragraphs
1.20s  Sky strip fades up (y 18px -> 0, 0.7s); the sun disc appears at its
       progress-appropriate position (no animation - it must match scroll state
       immediately)
1.80s  Key-color table rows fade in 0.1s apart
2.30s  Code panel fades up
Everything after that is scroll-driven, not time-driven.

=== PERFORMANCE ===
One rAF-throttled scroll listener for the entire section. CSS custom properties
only. No per-element JS color assignment. No layout-triggering property animations
(no width/height/top - use transform and background-color only).

=== RESPONSIVE ===
< 1024px: section min-height 240vh (mobile scroll is faster, so give the transition
more room); sky strip height 180px.
< 640px: sky strip height 150px, stars reduced to 20, the key-color table becomes a
stacked card list (still with the live current-row highlight), code font 11px with
internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: NO scroll-driven color transition. Render the section at
the night palette from the start and show a static caption above the sky strip,
VERBATIM: "이 구간은 원래 스크롤에 따라 낮에서 밤으로 바뀝니다."
Stars do not twinkle at all in this mode.
Text contrast must remain at least 4.5:1 against the background at EVERY point of
the interpolation - verify the mid-transition sunset color, which is the risky one.
The time readout must be tabular-nums.

=== DO NOT ===
Do not store scroll position in React state.
Do not use two stacked background images with a crossfade - the point of this page
is that it is a single interpolated color.
Do not let stars flicker faster than a 4s cycle.
Do not let any text drop below 4.5:1 contrast mid-transition.
```

---

## PAGE 07 — 최고 점수는 남는다 · localStorage

**개발 실체**: 로컬 점수 저장 구현 + **저장/불러오기 코드와 실패 처리**
**연출 장치**: **관람객이 방금 낸 점수가 진짜로 저장된다.** 다시 오면 남아 있다

```text
Build a PERSISTENCE section where the viewer's own score from earlier on this page
is actually saved to localStorage and displayed as a high-score board, with the
save/load code and its error handling shown alongside.
Stack: React + TypeScript + Tailwind CSS. Use real localStorage.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. Why the score is stored locally rather than on a server
2. The actual save/load code, INCLUDING the failure path (private mode, quota,
   corrupted value)
3. The honest limitation: local storage means no real leaderboard

=== MOOD ===
Night has fallen (this section sits after the day-night transition).
Arcade high-score board: lime on black, ceremonial but small-scale.

=== DESIGN TOKENS (use exactly) ===
background #0a0f04 | panel #0f1607 | primary lime #a3e635 | accent #bef264
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0c1105, border rgba(163,230,53,0.18)
syntax: comments #6b8a3f, strings #fcd34d, keywords #a3e635, numbers #7dd3fc
fonts: SCORES in pixel font; body sans leading-8; code + labels font-mono 12px
easing cubic-bezier(0.2,0.8,0.2,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE HIGH SCORE BOARD - full width, height ~300px
  Block C : the decision table (local vs server)
  Block D : the code panel
  Block E : the honest limitation card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "06 · 점수 저장"

HEADING (28px font-black):
  VERBATIM: "다시 왔을 때 내 기록이 남아 있는 것"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "한 판이 1분도 안 되는 게임에서 다시 하게 만드는 건
             「아까보다 잘하고 싶다」는 마음 하나뿐이다.
             그 마음은 이전 기록이 남아 있어야 생긴다."

=== BLOCK B: THE HIGH SCORE BOARD (the defining idea of this page) ===
A panel, background #0f1607, border 1px rgba(163,230,53,0.22), rounded-md,
padding 26px, position relative. STATIC scanlines at low opacity.

Header, centered, pixel font 20px #a3e635, letter-spacing 0.12em,
VERBATIM: "HIGH SCORE"

Below it, a table of five rows. Each row: rank (pixel font 16px
rgba(255,255,255,0.46)), a dotted leader line in rgba(255,255,255,0.14), and the
score (pixel font 18px, tabular-nums).

BEHAVIOR (this must be real):
  - Read a stored high-score list from localStorage under a namespaced key.
  - If the viewer played the mini game earlier on this page, their best score from
    this session is merged into the list.
  - If the viewer's score makes the top five, THAT ROW IS HIGHLIGHTED: score color
    #bef264, a lime left border, and a label to its right, font-mono 10px #a3e635,
    VERBATIM: "← 방금 당신의 기록"
    The row arrives with a small scale 1.15 -> 1 pop and one soft lime glow pulse.
  - If there is no stored data and no session score, show five placeholder rows
    with score VERBATIM "- - - - -" and a centered line beneath, font-mono 12px
    rgba(255,255,255,0.46), VERBATIM: "아직 기록이 없습니다. 위에서 한 판 해보세요."
    with a text link, font-mono 12px #a3e635, VERBATIM: "↑ 게임으로 가기"
    that smooth-scrolls back to the playable section.

Below the table, a status line, font-mono 11px, that reflects the ACTUAL storage
state:
  saved OK        -> color #4ade80, VERBATIM: "이 브라우저에 저장되었습니다"
  storage blocked -> color #fbbf24, VERBATIM: "저장이 차단되어 이번 세션에만 유지됩니다"
  corrupted data  -> color #fbbf24, VERBATIM: "저장된 값을 읽을 수 없어 초기화했습니다"

A clear control at the bottom-right, font-mono 11px rgba(255,255,255,0.46),
VERBATIM: "기록 지우기"
Clicking it asks for inline confirmation (NOT a browser confirm dialog): the label
swaps to two small buttons, VERBATIM "정말 지울까요?" with VERBATIM "[ 지우기 ]" and
VERBATIM "[ 취소 ]". Only on confirm does it clear the key and reset the board.

=== BLOCK C: THE DECISION TABLE ===
Margin-top 44px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "서버에 안 둔 이유"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "방식" | "필요한 것" | "판단"
Rows:
  "서버 저장 + 로그인" | "계정 · DB · 인증 · 서버 운영" | "이 규모엔 과함"
  "서버 저장 (익명)"   | "서버 · 어뷰징 대응"           | "점수 조작 막을 방법이 없다"
  "localStorage"      | "없음"                        | "채택"
The 채택 row: background rgba(163,230,53,0.07), left border 2px #a3e635, and its
판단 cell in #a3e635 font-bold.
Rows reveal 0.12s apart on entry.

=== BLOCK D: THE CODE PANEL ===
Margin-top 36px, full width. background #0c1105,
border 1px rgba(163,230,53,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "scoreStore.ts"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~22 lines. A score store that:
  - reads the stored value inside a try/catch, since localStorage access itself can
    throw in private browsing modes,
  - validates the parsed value's shape and falls back to an empty list if it is not
    what was expected (a corrupted or hand-edited value must not crash the game),
  - inserts a new score, sorts descending, truncates to the top five,
  - writes back inside a try/catch and returns a status flag rather than throwing,
  - exposes a clear() that removes the key.
HIGHLIGHT ROWS (background rgba(163,230,53,0.10)): the try/catch around the READ,
and the shape-validation fallback line.
Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
  "localStorage는 접근만으로도 예외가 날 수 있다. 시크릿 모드에서 배웠다."

A small inline note under the code panel, 15px leading-8, VERBATIM:
  "처음엔 try/catch 없이 썼다가 시크릿 모드에서 게임이 아예 시작을 안 했다.
   저장 기능 하나 때문에 게임 전체가 죽는 건 말이 안 됐다."
Emphasize "게임 전체가 죽는 건" in #f87171, font-bold.

=== BLOCK E: THE HONEST LIMITATION CARD (required) ===
Margin-top 32px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "이 방식의 한계"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "다른 사람과 점수를 비교할 수 없다. 리더보드가 아니라 개인 기록이다."
    "브라우저를 바꾸거나 캐시를 지우면 기록이 사라진다."
    "개발자 도구로 값을 고칠 수 있다. 막을 방법은 없고, 막을 이유도 크지 않았다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading at 0.15s
0.60s  Paragraph
1.10s  The score board fades up (y 18px -> 0, 0.6s); its "HIGH SCORE" header
       appears with a single soft glow bloom
1.60s  The five rows type in one at a time, 0.12s apart, each score counting up
       from 0 to its value over 0.4s (pixel font, tabular-nums)
2.40s  If the viewer has a qualifying score, its row pops and glows LAST, after all
       other rows have settled - this ordering is required so the reveal lands
2.90s  Status line fades in
Table and code panel animate on their own entry.

=== RESPONSIVE ===
< 640px: board padding 18px, header 16px, score rows 15px; the decision table
becomes a stacked card list; code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: rows appear at once with no typing and no count-up; the
qualifying row is highlighted without a pop or glow.
The board must be a real table (or a list with proper semantics), and the viewer's
own row needs a visually-hidden label, VERBATIM: "이번 세션에서 기록한 점수".
The clear control and its inline confirmation must be real buttons with visible
focus rings (2px #a3e635, offset 2px), and focus must move to the confirm button
when the confirmation appears.
Never use window.confirm - it blocks the page.

=== DO NOT ===
Do not use a browser confirm/alert dialog.
Do not claim a global leaderboard or any player counts.
Do not silently swallow storage failures - the status line must reflect what
actually happened.
```

---

## PAGE 08 — 트러블슈팅 02 · 폰에서는 다른 게임이었다

**개발 실체**: 모바일 대응 (터치 입력 · 해상도 스케일링) + **스케일링 설정 코드**
**연출 장치**: **폭 조절 슬라이더** — 관람객이 화면 폭을 직접 줄이면 레이아웃이 실제로 깨졌다가 고쳐진다

```text
Build a MOBILE ADAPTATION troubleshooting section with a viewport-width slider that
lets the viewer squeeze a live game preview down to phone width and see what broke,
then how the scaling configuration fixed it.
Stack: React + TypeScript + Tailwind CSS. Plain <canvas> or CSS - no game engine.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the mobile problem:
symptom -> what specifically broke (three distinct issues) -> the fix for each ->
verification -> what is still not good on mobile. All five parts required.

=== MOOD ===
Night, cabinet back panel still open, now with a phone propped against it.
Diagnostic and practical.

=== DESIGN TOKENS (use exactly) ===
background #0a0f04 | panel #0f1607 | primary lime #a3e635 | accent #bef264
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0c1105, border rgba(163,230,53,0.18)
syntax: comments #6b8a3f, strings #fcd34d, keywords #a3e635, numbers #7dd3fc
fonts: body sans leading-8; code + labels font-mono 12px
easing cubic-bezier(0.2,0.8,0.2,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1060px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE WIDTH SLIDER + the resizable preview
  Block C : the three broken things (before/after per item)
  Block D : the scaling config code panel
  Block E : verification + remaining mobile limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "07 · 트러블슈팅 02"

HEADING (30px font-black):
  VERBATIM: "PC에서 잘 되던 게임이 폰에서는 다른 게임이었다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "친구한테 링크를 보냈더니 「이거 어떻게 하는 거야」라는 답이 왔다.
   폰에서는 키보드가 없으니 점프할 방법이 없었다.
   그리고 화면이 잘려서 앞에 뭐가 오는지 안 보였다."

=== BLOCK B: THE WIDTH SLIDER + RESIZABLE PREVIEW ===
Margin-top 40px.

THE SLIDER (above the preview, full width):
  A range input, track rgba(255,255,255,0.10) 3px, thumb 16px #a3e635.
  Range 320 to 1200, default 1200, step 4.
  Left label font-mono 10px rgba(255,255,255,0.46), VERBATIM: "320px · 폰"
  Right label VERBATIM: "1200px · 데스크톱"
  Center readout, font-mono 13px #bef264, tabular-nums, format VERBATIM: "1200px"
  Three tick marks with labels beneath the track at 375, 768, 1024,
  font-mono 9px rgba(255,255,255,0.32), VERBATIM: "375" "768" "1024"

THE PREVIEW (below the slider):
  A container whose WIDTH is bound to the slider value (max 100% of the column),
  centered, height 380px, rounded-md, border 1px rgba(163,230,53,0.18),
  background #0c1105, overflow hidden. STATIC scanlines.
  Inside: the running game preview (auto-playing demo runner) plus the game HUD.

  A MODE TOGGLE at the container's top-right, font-mono 11px, two options:
    VERBATIM "수정 전"  |  VERBATIM "수정 후"
  Default: 수정 전.

  IN "수정 전" MODE, as the width drops below 768px, THREE THINGS VISIBLY BREAK:
    1. The camera view does not rescale - the game world stays at its desktop pixel
       size, so the visible area shrinks and upcoming obstacles are CUT OFF at the
       right edge. Draw a red dashed boundary at the clipped edge with a label,
       font-mono 9px #f87171, VERBATIM: "여기부터 안 보임"
    2. The HUD (score / FPS) overflows its bar and the text OVERLAPS.
       Outline the overlapping elements in #f87171.
    3. There is NO touch control affordance at all. Show a grey chip at the bottom,
       font-mono 10px rgba(255,255,255,0.40), VERBATIM: "입력 방법 없음"

  IN "수정 후" MODE at the same width:
    1. The game world scales to fit, keeping the aspect ratio, so the same amount
       of level is visible. The red boundary is gone; instead show a lime label,
       font-mono 9px #a3e635, VERBATIM: "같은 범위가 보임"
    2. The HUD reflows to a compact layout with no overlap.
    3. A touch button appears at the bottom-right of the preview, a 56px lime
       circle with a jump glyph, and a label, font-mono 10px #a3e635,
       VERBATIM: "탭해서 점프"

  Switching modes at a given width must produce an obvious, side-comparable
  difference. That contrast is the point of the page.

  A hint under the preview, font-mono 11px rgba(255,255,255,0.35), fading out
  permanently after the first slider drag,
  VERBATIM: "슬라이더를 왼쪽으로 끌어보세요"

=== BLOCK C: THE THREE BROKEN THINGS ===
Margin-top 44px. Three cards in a row, gap 14px (single column below 900px).
Each: padding 20px, rounded-md, background #0f1607,
border 1px rgba(255,255,255,0.10), with a 3px top border.

CARD 1 - top border #f87171
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "01 · 잘린 화면"
  Problem 15px leading-8, VERBATIM:
    "캔버스 크기를 픽셀로 고정해놨더니, 좁은 화면에서는 그만큼 덜 보였다.
     앞이 안 보이면 반응할 수가 없다."
  Fix line, margin-top 12px, font-mono 12px #4ade80, prefixed "→ ", VERBATIM:
    "→ 화면 폭에 맞춰 스케일하고 비율은 유지하도록 변경"

CARD 2 - top border #f87171
  Label VERBATIM: "02 · 겹친 HUD"
  Problem VERBATIM:
    "점수와 FPS를 절대 좌표로 배치했다. 폭이 줄자 서로 겹쳤다."
  Fix VERBATIM:
    "→ 화면 폭 기준 상대 배치 + 좁을 때 FPS 표시는 숨김"

CARD 3 - top border #f87171
  Label VERBATIM: "03 · 조작 불가"
  Problem VERBATIM:
    "키보드 입력만 받고 있었다. 폰에는 키보드가 없다.
     기능이 부족한 게 아니라 아예 플레이가 불가능했다."
  Fix VERBATIM:
    "→ 포인터 이벤트로 통일해서 클릭·탭·키보드를 한 경로로 처리"
Cards reveal 0.12s apart on entry, each sliding up 14px.

=== BLOCK D: THE SCALING CONFIG CODE PANEL ===
Margin-top 40px, full width. background #0c1105,
border 1px rgba(163,230,53,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "gameConfig.ts"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~20 lines. A Phaser game configuration object showing:
  - a scale block with a fit-style mode and centered auto-centering, plus a base
    width/height that defines the design resolution,
  - min and max width/height bounds,
  - an input block enabling both keyboard and touch/pointer,
  - and, below the config, a small unified jump handler that listens for a pointer
    event and a keyboard event and routes both into the SAME function.
HIGHLIGHT ROWS (background rgba(163,230,53,0.10)): the scale mode line and the
unified handler's shared call.
Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
  "입력 경로를 두 개 만들면 두 개를 다 관리해야 한다. 하나로 합쳤다."

=== BLOCK E: VERIFICATION + REMAINING LIMITS ===
Margin-top 36px.
A row of three stat cells, gap 12px (stacks below 640px). Each: padding 16px,
rounded-md, border 1px rgba(74,222,128,0.22), background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "375px"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "확인한 최소 폭"
  Cell 2  value VERBATIM "3종"   label VERBATIM "직접 테스트한 기기"
  Cell 3  value VERBATIM "동일"  label VERBATIM "PC/모바일 보이는 범위"
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "브라우저 반응형 도구와 실제 기기 3대로 확인했습니다. 기기별 성능 측정은 못 했습니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "모바일에서 여전히 아쉬운 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "가로 모드를 따로 대응하지 않았다. 세로로만 제대로 보인다."
    "저사양 기기에서의 프레임은 확인하지 못했다."
    "터치 버튼 위치가 오른손잡이 기준이다. 왼손 사용자는 불편할 수 있다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading at 0.15s
0.60s  Symptom card slides in from the left
1.10s  Slider fades in; the preview fades up at 1.30s and its demo begins
2.00s  The hint under the preview appears
2.40s  ONE automatic demonstration: the slider animates 1200 -> 375 over 1.4s,
       holds 1.2s (so the breakage is visible), then returns to 1200. ONCE ONLY,
       and only if the viewer has not touched the slider.
       Caption during it, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "자동 시연"
Cards, code, and verification animate on their own entry.

=== PERFORMANCE ===
Bind the preview width to the slider via a CSS custom property updated inside
requestAnimationFrame - do not put the slider value in React state and re-render
the preview tree on every input event.
The preview's game loop stops when off-screen or the tab is hidden.

=== RESPONSIVE ===
< 900px: the three broken-things cards stack.
< 640px: the slider's max is capped to the available column width and the readout
moves below the track; preview height 300px; code font 11px with internal
horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no automatic slider demonstration; the preview's demo
runner is static.
The slider is a real <input type="range"> with an accessible name and aria-valuetext
including "px", and a visible focus ring (2px #a3e635, offset 2px).
The mode toggle is a real radiogroup, arrow-key navigable.
Announce mode changes once via aria-live="polite", VERBATIM:
  "수정 전 화면입니다." / "수정 후 화면입니다."

=== DO NOT ===
Do not simulate the breakage with a static image - the preview must genuinely
reflow as the width changes.
Do not remove the remaining-limits card.
Do not claim device performance numbers that were not measured.
```

---

## PAGE 09 — 결과 · 화면 갤러리

**개발 실체**: 완성된 화면들 + 실제 플레이 맥락
**연출 장치**: 캐비닛 화면이 전체 화면으로 확장되며 갤러리로 전환

```text
Build a RESULTS SECTION presenting finished game screenshots as a gallery, framed
as the cabinet screen expanding to full size, for a Phaser 3 campus game portfolio
page. Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What was actually shipped, in screens
2. The concrete outcome stated without invented metrics
3. What the numbers on this page do and do not mean

=== MOOD ===
Night, the game running well. Quiet satisfaction, arcade-warm.

=== DESIGN TOKENS (use exactly) ===
background #0a0f04 | panel #0f1607 | primary lime #a3e635 | accent #bef264
ok #4ade80 | text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: SCORES/values in pixel font; body sans leading-8; labels font-mono
easing cubic-bezier(0.2,0.8,0.2,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1120px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the gallery (4 items, asymmetric grid)
  Block C : the outcome stats
  Block D : the numbers-disclaimer strip

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "08 · 결과"

HEADING (32px font-black):
  VERBATIM: "주소만 보내면 바로 되는 게임이 됐다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "PC와 모바일 브라우저에서 설치 없이 바로 플레이된다.
             자동 생성된 맵을 달리고, 낮이 밤으로 바뀌고, 기록이 남는다.
             캠퍼스 테마 캐주얼 게임으로 필요한 것들을 완성했다."

=== BLOCK B: THE GALLERY ===
An asymmetric grid, margin-top 48px:
  Row 1: one large item (2 columns) + one small item
  Row 2: two equal items
Gap 16px. Below 900px -> single column.

Each item: background #0f1607, border 1px rgba(163,230,53,0.18), rounded-md,
overflow hidden, with STATIC scanlines over the image area at opacity 0.25.
  A 30px header strip with a font-mono 10px uppercase label on the left
  (rgba(255,255,255,0.48)) and a small lime dot on the right.
  Below it, the image area with aspect-ratio 16/10.
  A caption bar at the bottom, padding 12px 14px,
  border-top 1px rgba(163,230,53,0.10), font-mono 11px rgba(255,255,255,0.48).

ITEM 1 (large)  header VERBATIM "01 · 플레이 화면"
  [IMG-01] the main gameplay view mid-run with campus platforms
  caption VERBATIM: "자동 생성된 발판 위를 달린다"
ITEM 2 (small)  header VERBATIM "02 · 낮/밤 전환"
  [IMG-02] the same level at sunset/night
  caption VERBATIM: "진행할수록 하늘색이 바뀐다"
ITEM 3          header VERBATIM "03 · 모바일"
  [IMG-03] the phone-width layout with the touch jump button
  caption VERBATIM: "탭 하나로 조작"
ITEM 4          header VERBATIM "04 · 결과 화면"
  [IMG-04] the game over screen with the score and high score
  caption VERBATIM: "최고 점수는 브라우저에 남는다"

IMAGE PLACEHOLDER SPEC (if no image is supplied): a CSS placeholder inside the
aspect box - background #0c1105, a faint 24px lime grid, centered text in font-mono
12px rgba(255,255,255,0.35) reading the slot name, e.g. VERBATIM "[IMG-01] · 16:10"

HOVER: the item lifts 4px, border -> rgba(163,230,53,0.45), image scales 1.03
inside its clipped frame. 0.35s. Click opens a lightbox (overlay rgba(4,7,2,0.94),
backdrop-blur(8px), image max-width 1200px, caption below, Esc / overlay click
closes, arrow keys move between items).

=== BLOCK C: THE OUTCOME STATS ===
Margin-top 56px. Three stat cells, gap 14px (stacks below 640px).
Each: padding 22px, rounded-md, border 1px rgba(163,230,53,0.22),
background rgba(163,230,53,0.04).
  value pixel font 32px #a3e635 tabular-nums
  label font-mono 11px rgba(255,255,255,0.48), margin-top 6px
  Cell 1  value VERBATIM "3"    label VERBATIM "기술 스택"
  Cell 2  value VERBATIM "5"    label VERBATIM "핵심 기능"
  Cell 3  value VERBATIM "2종"  label VERBATIM "지원 플랫폼 (PC · 모바일)"
Values count up over 0.8s on entry.

=== BLOCK D: THE NUMBERS DISCLAIMER (required) ===
Margin-top 28px, a slim strip: padding 14px 18px, rounded-md,
border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02).
  font-mono 11px rgba(255,255,255,0.45), VERBATIM:
  "위 숫자는 구현 범위를 센 것입니다. 플레이 횟수, 이용자 수 같은 지표는
   수집하지 않았습니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  Gallery items fade up 0.1s apart (y 20px -> 0, 0.6s)
2.10s  Stat cells fade up 0.1s apart, values counting
2.70s  Disclaimer strip fades in

=== RESPONSIVE ===
< 900px: single-column gallery.
< 640px: stat cells stack; heading 24px.

=== ACCESSIBILITY ===
prefers-reduced-motion: no count-up, no hover scale.
Every gallery item is a real <button> opening the lightbox with a visible focus
ring (2px #a3e635, offset 2px). Each image needs a Korean alt text derived from its
caption. The lightbox traps focus while open and returns focus on close.
Scanlines are STATIC.

=== DO NOT ===
Do not invent play counts, download counts, or user numbers.
Do not add confetti.
```

---

## PAGE 10 — 회고 · 다음 단계 · 퇴장

**개발 실체**: KPT 회고 (PROBLEM 포함) + 다음 단계 + GitHub
**연출 장치**: GAME OVER → 크레딧 롤 → 캐비닛 전원 종료

```text
Build the CLOSING SECTION of a Phaser 3 campus game portfolio page: a KPT
retrospective styled as a results screen, next steps, a repository link, and an
exit transition where the arcade cabinet powers down.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An honest retrospective including real problems, not just wins
2. Concrete next steps
3. The repository link
4. A clean exit back to the village

=== MOOD ===
The arcade at closing time. Lime on black, credits rolling, someone reaching for
the power switch. Warm, tired, honest. No triumphalism.

=== DESIGN TOKENS (use exactly) ===
background #0a0f04 | panel #0f1607 | primary lime #a3e635 | accent #bef264
keep #4ade80 | problem #f87171 | try #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: the section heading may use pixel font; ALL body copy in sans leading-8;
labels font-mono
easing cubic-bezier(0.2,0.8,0.2,1) | rounded-md

=== LAYOUT ===
Centered column, max-width 960px, padding-block 120px.
  Block A : the GAME OVER header
  Block B : KPT, three columns (styled as a results screen)
  Block C : next steps card
  Block D : GitHub link
  Block E : exit button + exit transition

=== CONTENT (Korean copy - VERBATIM, never translate) ===

BLOCK A - THE GAME OVER HEADER
  Centered. Pixel font 34px #a3e635, letter-spacing 0.1em,
  VERBATIM: "GAME OVER"
  Below it, a section label, font-mono 11px letter-spacing 0.25em
  rgba(255,255,255,0.48), VERBATIM: "09 · 회고"
  Below that, a heading, font-black sans 28px, margin-top 20px,
  VERBATIM: "게임은 재미가 전부인데, 재미는 측정이 안 된다"
  Paragraph, 16px leading-9, max-width 720px, margin-top 18px, VERBATIM:
  "기능은 다 만들었는지 체크할 수 있다. 재미있는지는 체크할 수가 없다.
   결국 다른 사람에게 시켜보는 것 말고는 방법이 없었는데, 그걸 제일 늦게 했다."

=== BLOCK B: KPT ===
Margin-top 52px. Three columns, gap 16px (single column below 768px).
Each column: padding 22px, rounded-md, background #0f1607,
border 1px rgba(255,255,255,0.10), with a 3px top border in its own color.
Header: font-mono 11px letter-spacing 0.2em, uppercase.
Items: 15px leading-8, each prefixed "· ", 14px apart.

COLUMN 1 - header VERBATIM "KEEP", color #4ade80, top border #4ade80. Items VERBATIM:
  "조작을 버튼 하나로 끝까지 밀어붙인 것"
  "생성 규칙에 「반드시 넘을 수 있음」 보장을 넣은 것"
  "저장 기능 때문에 게임이 죽지 않게 만든 것"

COLUMN 2 - header VERBATIM "PROBLEM", color #f87171, top border #f87171. Items VERBATIM:
  "모바일 대응을 다 만들고 나서야 시작했다"
  "성능 문제를 오브젝트 수만 보고 감으로 잡았다"
  "다른 사람 플레이 테스트를 거의 안 했다"

COLUMN 3 - header VERBATIM "TRY", color #fbbf24, top border #fbbf24. Items VERBATIM:
  "리더보드와 공유 기능 붙이기"
  "프로파일러로 프레임 시간 기준선 잡기"
  "처음 하는 사람 5명에게 아무 설명 없이 시켜보기"

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), top border
grows 3px -> 4px. 0.3s.

=== BLOCK C: NEXT STEPS CARD ===
Margin-top 48px, padding 22px, rounded-md, border 1px rgba(163,230,53,0.22),
background rgba(163,230,53,0.04), border-left 3px #a3e635.
  Label font-mono 11px letter-spacing 0.2em #a3e635, VERBATIM: "다음 단계"
  Body 16px leading-8, margin-top 12px, VERBATIM:
  "리더보드와 공유 기능을 추가할 예정입니다.
   그 전에 처음 보는 사람이 설명 없이 한 판을 끝낼 수 있는지부터 확인하려고 합니다."

=== BLOCK D: GITHUB LINK ===
Margin-top 40px. A single primary link button:
  background #a3e635, color #0a0f04, font-mono 14px font-black,
  padding 14px 28px, rounded-md.
  Label VERBATIM: "GitHub 저장소 ↗"
  Hover: scale 1.04, box-shadow 0 0 28px rgba(163,230,53,0.38). Active: scale 0.97.
  href https://github.com/toadsam/Ajou_Mini_Game, target _blank, rel noreferrer.

=== BLOCK E: EXIT BUTTON + EXIT TRANSITION ===
Margin-top 72px. A full-width button, height 88px, rounded-md,
border 1px rgba(255,255,255,0.14), background transparent.
  Label centered, font-mono 15px, letter-spacing 0.1em, rgba(255,255,255,0.62),
  VERBATIM: "← 마을로 돌아가기"
  Hover: border -> rgba(163,230,53,0.45), label -> #a3e635, and a faint lime
  phosphor glow appears behind it. 0.4s.

EXIT TRANSITION (on click of this button OR the header's "← 마을로"):
  t=0.00s  Content fades to opacity 0 over 0.3s
  t=0.30s  A CRT power-down: the whole viewport's content collapses vertically
           toward the center into a 3px horizontal lime line over 0.35s
           (a scaleY animation on a wrapper, ease-in)
  t=0.65s  That line contracts horizontally to a single 4px dot at the center over
           0.25s, staying lime
  t=0.90s  The dot fades out over 0.25s. One quiet power-off click sound
           (volume cap 0.12, ONLY if the viewer enabled sound - default is off)
  t=1.20s  Full background #0a0f04, nothing on screen
  t=1.50s  Emit an onExit callback so the parent can restore the 3D village scene.
  Body scroll locks during the transition; the parent releases it.
  IMPORTANT: this is a smooth collapse, NOT a flash. Never brighten the screen
  before collapsing - photosensitivity.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  "GAME OVER" appears with a single soft glow bloom (no flash)
0.35s  Section label, heading word by word at 0.50s
1.10s  Paragraph
1.60s  KPT columns fade up left to right 0.12s apart, items inside 0.06s apart
2.60s  Next steps card slides in from the left (x -12px -> 0)
3.00s  GitHub button fades in
3.30s  Exit button fades in with its border drawing from the center outward
       (0% -> 100% width, 0.7s)

=== RESPONSIVE ===
< 768px: KPT single column; "GAME OVER" 26px; heading 22px; exit button height
72px, label 14px; GitHub button full width.

=== ACCESSIBILITY ===
prefers-reduced-motion: all reveals instant; the exit transition becomes a plain
0.3s fade to black with NO CRT collapse.
The exit button must be a real <button>, keyboard focusable, visible focus ring
(2px #a3e635, offset 2px).
Sound stays off unless the viewer explicitly enabled it earlier.

=== DO NOT ===
Do not soften the PROBLEM column - the honesty is the point.
Do not flash the screen bright before the CRT collapse.
Do not add confetti or "thanks for playing" celebration copy.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-1. 개발 실체 커버리지 점검

| 항목 | 어디에 | 형태 |
|---|---|---|
| **왜 만들었나** | P00 | 코인 투입 직후 첫 문장 (4초 안에) |
| **데모 영상** | P01 스티커 B | 캐비닛 옆면 스티커 |
| **GitHub** | P01 스티커 A · P10 버튼 | 스티커 + 마무리 버튼 |
| **실제 플레이** | **P02 · P03 · P04 · P05 · P08** | **관람객이 직접 조작하는 캔버스 5곳** |
| **코드** | P02(update 루프) · P03(점프 A/B) · P04(Before/After 풀링) · P05(생성기) · P06(보간) · P07(scoreStore) · P08(gameConfig) | **총 9개** |
| **트러블슈팅** | P04 (오브젝트 누적) · P08 (모바일) | **전체 프로세스 2건** |
| **기술 의사결정 + 포기한 것** | P03 (조작감 튜닝값 근거) · P07 (서버 저장 안 한 이유) | 3안 비교 + 정직한 카드 |
| **알고리즘 설계** | P05 | 도달 가능성 보장 규칙 |
| **결과물** | P09 | 갤러리 4장 |
| **회고** | P10 | KPT (PROBLEM 3개 포함) |
| **한계 인정** | P03 · P04 · P07 · P08 · P09 | 튜닝값 근거 없음 / ms 미측정 / 리더보드 없음 / 가로모드 미대응 / 지표 없음 |

## D-2. 새로 만들 파일
```
src/components/ui/project-viewers/stages/ajou-adventure/
  index.tsx                 ← PAGE 00~10 순서, 스크롤→시간(낮/밤) 매핑 소유
  useMiniRunner.ts          ← ⭐ 공용 미니 러너 엔진 (P02·P03·P04·P05·P08이 전부 재사용)
  useScrollTime.ts          ← 스크롤 → CSS 변수 --t (React state 금지)
  AttractMode.tsx           ← P00
  CabinetHero.tsx           ← P01 · 캐비닛 + 스티커 3장
  LiveLoopCode.tsx          ← P02 · 플레이 + 실행 줄 하이라이트
  JumpFeelAB.tsx            ← P03 · 코요테/버퍼 A/B
  ObjectLeakDemo.tsx        ← P04 · 제거 토글 + FPS 실측
  LevelGenLab.tsx           ← P05 · 슬라이더 → 맵 재생성
  DayNightStrip.tsx         ← P06 · 스크롤 보간
  HighScoreBoard.tsx        ← P07 · 실제 localStorage
  ViewportSlider.tsx        ← P08 · 폭 조절 + 수정 전/후
  Scanlines.tsx             ← 전 페이지 정적 스캔라인
  copy.ts                   ← 모든 한국어 문구
  assets.ts                 ← [IMG-01~04] · [VIDEO-01]
```

> ⭐ **`useMiniRunner.ts` 가 이 방의 핵심 자산**입니다. 5개 페이지가 같은 엔진을 옵션만 바꿔
> 재사용합니다 (`cleanup: on/off`, `jumpMode: naive/tuned`, `gapRange`, `scaleMode`).
> 이걸 먼저 만들지 않으면 페이지마다 게임을 5번 짜게 됩니다.

## D-3. 기존 코드 재사용 / 선행 작업
재사용: `CodeBlock`, `ImageSlot`, `CountUp`, `RevealText` (`shared.tsx`)

> ⚠️ **선행 작업 (10개 프로젝트 공통 1건)**: `shared.tsx` 의 `DecisionTable`,
> `ArchDiagram`, `CompareBars`, `ProcessTimeline`, `QuoteCard`, `TldrBanner`,
> `BeforeAfter`, `ChallengeCard` 가 현재 **모듈 내부 함수(비export)** 입니다.
> stage 폴더에서 쓰려면 export로 승격해야 합니다.

## D-4. 버릴 것
- `[KILL]` `GameProjectViewer` 의 ajou-adventure 분기 → stage 폴더로 이전
- `[KILL]` `ArcadeLayer.tsx` → `Scanlines.tsx` (정적) + 캐비닛 컴포넌트로 대체.
  기존 ArcadeLayer의 **움직이는 스캔라인·CRT 깜빡임은 광과민성 이슈로 폐기**

## D-5. 미디어 확보 목록
| 슬롯 | 내용 | 비율 | 우선도 |
|---|---|---|---|
| `[VIDEO-01]` | 한 판 풀 플레이 (시작→점프→아이템→낮밤 전환→게임오버) 1분 12초 | 16/9 | 높음 |
| `[IMG-01]` | 플레이 중 화면 (캠퍼스 발판) | 16/10 | **최상** |
| `[IMG-02]` | 밤 전환 후 같은 구간 | 16/10 | 높음 |
| `[IMG-03]` | 모바일 세로 화면 + 터치 버튼 | 16/10 | **최상** |
| `[IMG-04]` | 게임오버 + 최고점수 화면 | 16/10 | 중간 |

> 💡 이 방은 **실제 플레이가 데모**라서 영상 우선도가 다른 방보다 낮습니다.
> 대신 `[IMG-03]` 모바일 스크린샷이 P08 트러블슈팅의 증거라 중요합니다.

## D-6. 코드 스니펫 확보 목록 (전부 실제 저장소에서)
| 페이지 | 파일 | 줄 | 하이라이트 |
|---|---|---|---|
| P02 | `GameScene.ts` | 26 | update() 5구간 (입력/전진/생성/제거/충돌) |
| P03 | `Player.ts (A)` | 10 | grounded 체크 |
| P03 | `Player.ts (B)` | 18 | 코요테 타이머 · 점프 버퍼 |
| P04 | `ObstacleSpawner.ts (before)` | 12 | push만 하는 줄 |
| P04 | `ObstacleSpawner.ts (after)` | 20 | 경계 검사 + 풀 반환 |
| P05 | `LevelGenerator.ts` | 18 | 최대 도달 거리 clamp |
| P06 | `DayNightCycle.ts` | 16 | 2스톱 탐색 + 보간 |
| P07 | `scoreStore.ts` | 22 | 읽기 try/catch · 형태 검증 폴백 |
| P08 | `gameConfig.ts` | 20 | scale 모드 · 입력 경로 통합 |

## D-7. 제어권 개입 0회 — 대신 관람객이 능동적으로 여는 것

이 방은 **관람객에게서 제어권을 뺏지 않습니다.** 대신 관람객이 스스로 켭니다.

| 페이지 | 장치 | 안전장치 |
|---|---|---|
| P04 | "제거 끔" 토글 (성능 붕괴) | 오브젝트 **상한 400** + **15초 후 자동 복구** + 언제든 되돌리기 |
| P08 | 폭 슬라이더 (레이아웃 붕괴) | 언제든 되돌리기 · 페이지 레이아웃엔 영향 없음 |
| P02·P03·P05 | 자동 시연 1회 | 관람객이 먼저 조작하면 발동 안 함 |

## D-8. 최종 체크리스트 (광과민성 항목 최우선)
- [ ] **스캔라인이 정적인지** — 구르기·깜빡임·인터레이스 셔머 전부 금지
- [ ] **1Hz 초과로 깜빡이는 요소가 0개인지** (`PRESS SPACE` 는 정확히 1Hz)
- [ ] **전체 화면 플래시 0회** — P00 코인 플래시는 저알파 라임 1회, 흰색 금지
- [ ] P10 CRT 종료가 **밝아졌다가 꺼지지 않는지** (수축만)
- [ ] `useMiniRunner` 를 **먼저** 만들었는지 (5개 페이지 공용)
- [ ] 모든 캔버스의 rAF 루프가 **뷰포트 밖 + 탭 숨김 시 정지**하는지
- [ ] 키보드(Space/방향키) 캡처가 **캔버스 호버/포커스 시에만** 되는지 (페이지 스크롤 보존)
- [ ] P02 코드 패널을 **프레임마다 리렌더하지 않는지** (ref + class 토글, 150ms 스로틀)
- [ ] P04 FPS 하락이 **실측 rAF 델타**인지 (스크립트로 조작한 숫자 금지)
- [ ] P04 오브젝트 **상한 400 + 15초 자동 복구**가 있는지
- [ ] P05 슬라이더가 코드 블록 전체를 리렌더하지 않는지 (rAF + DOM 직접 기록)
- [ ] P06 스크롤 위치를 **React state로 관리하지 않는지** (CSS 변수 + rAF)
- [ ] P06 **노을 구간 중간에서도 본문 대비 4.5:1** 이 유지되는지
- [ ] P07 `window.confirm` 을 쓰지 않았는지 (인라인 확인만)
- [ ] P07 저장 실패(시크릿 모드)를 **상태 줄에 정직하게 표시**하는지
- [ ] P08 미리보기가 진짜로 리플로우되는지 (정지 이미지 금지)
- [ ] 사운드 **기본 OFF**, 최대 볼륨 0.15
- [ ] 픽셀 폰트를 **본문 문단에 쓰지 않았는지** (가독성)
- [ ] 숫자 전부 `tabular-nums`
- [ ] 지어낸 수치 0개 — 다운로드·플레이 수·ms 개선치 주장 금지
