# 05. ACLUB — 프롬프트 팩

> 동아리 탐색과 모집을 연결하는 캠퍼스 플랫폼 프론트엔드 · React / TypeScript / Vite / Tailwind CSS
> **사용법**: `PAGE 00` ~ `PAGE 10` 의 코드블록을 **하나씩 통째로 복사해서 Variant에 붙여넣으세요.**
> 각 프롬프트는 **완전히 자립적**입니다 (색상·폰트·무드가 매번 반복 포함).
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 방의 한 문장

**"동아리 박람회장 포스터 월 앞에 선다. 조건을 말하면 벽이 스스로 다시 붙는다."**

## A-2. 왜 이 메타포인가

ACLUB이 풀려던 문제는 **"흩어진 정보를 찾는 데 지쳐서 포기한다"** 는 것이었다.
동아리 정보는 에브리타임에, 인스타에, 학과 게시판에, 종이 포스터에 흩어져 있다.
학생이 원하는 건 검색이 아니라 **"내 조건에 맞는 것만 남겨줘"** 다.

그래서 이 프로젝트의 본질은 **필터링과 탐색 흐름**이다.
그렇다면 이 프로젝트를 설명하는 페이지가 **정적인 카드 그리드면 그 자체로 모순**이다.

이 방의 벽에는 포스터 24장이 붙어 있고, **관람객이 조건을 누르는 순간 벽 전체가 물리적으로 재배치된다.**
사라지는 포스터는 벽에서 떨어지고, 남는 포스터는 자리를 옮기고, 새로 걸릴 포스터는 위에서 내려온다.
그 재배치가 이 프로젝트가 만든 것 그 자체다.

## A-3. ⭐ 가장 중요한 원칙 — 연출은 개발 내용의 운반 수단이다

**모든 연출은 반드시 개발 실체를 하나 이상 전달해야 한다.** 멋있기만 한 연출은 넣지 않는다.

| 전달할 개발 실체                            | 그걸 실어나르는 연출                                                                                      | 페이지 |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------ |
| 왜 이걸 만들었나 (동기)                     | 흩어진 포스터 조각들이 한 벽으로 모이는 진입 시퀀스                                                       | 00     |
| 데모 영상 · GitHub                          | **벽에 붙은 포스터 3장** — 뜯어보면 링크                                                                  | 01     |
| **필터와 재배치 구현이 이 프로젝트의 핵심** | **관람객이 필터를 누르면 포스터 24장이 눈앞에서 떨어지고·이동하고·내려온다 (FLIP)** → 즉시 옆에 실제 코드 | 02     |
| **트러블 01: 뒤로가기와 공유가 깨졌다**     | **관람객에게 진짜 뒤로가기 버튼을 준다.** 누르면 필터가 다 날아감 → URL 동기화 코드                       | 03     |
| 라우팅 · 사용자 흐름 설계                   | **관람객이 직접 흐름을 따라간다** — 탐색→상세→지원까지 화면이 실제로 전환됨                               | 04     |
| **트러블 02: 목록으로 돌아오면 맨 위였다**  | 관람객이 상세를 열었다 닫으면 **실제로 스크롤이 튄다** → 복원 코드                                        | 05     |
| 일반/관리자 화면 분리                       | **역할 스위처** — 같은 동아리 카드가 관리자에게는 다른 물건이 됨                                          | 06     |
| 공통 컴포넌트 설계                          | **포스터 한 장이 공중에서 분해되었다가 재조립**                                                           | 07     |
| 이 프로젝트의 범위 (FE 단독)                | 벽의 절반이 **아직 안 붙은 빈 자리**로 남아 있음                                                          | 08     |
| 결과물 · 화면 갤러리                        | 벽 전체에 조명이 들어오며 갤러리 공개                                                                     | 09     |
| 회고 · 다음 단계                            | 박람회 종료 → 포스터가 한 장씩 떨어지며 퇴장                                                              | 10     |

## A-4. 설계 결정 ↔ 웹 재현 대응

| 서비스에서 내린 결정        | 이 웹페이지에서의 재현                          |
| --------------------------- | ----------------------------------------------- |
| 검색이 아니라 필터로 좁힌다 | **관람객이 조건을 누르면 벽이 즉시 재배치된다** |
| 필터 상태는 주소에 남는다   | **뒤로가기 버튼이 실제로 작동한다**             |
| 목록으로 돌아오면 보던 자리 | **상세를 닫으면 정확히 그 자리로 돌아온다**     |
| 역할마다 다른 화면          | **역할 스위처로 같은 카드가 다른 물건이 된다**  |

**관람객은 "필터를 만들었습니다"를 읽는 게 아니라, 그 필터를 쓰고 그게 깨지는 것까지 겪는다.**

## A-5. 관람 곡선 (감정 + 정보 밀도)

```
활기  ╭────╮ P02 벽이 재배치되는 순간 (최고조)
     ╱      ╰─╮   ╭─╮ P03 뒤로가기가 깨짐   ╭─╮ P05 스크롤이 튐
 P00           ╰───╯ ╰──────────────────────╯ ╰──╮
 입장                                              ╰──── P08~10 정리
정보  낮 ────╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲──────
          P02~07 개발 밀도 최고조
포스터 0 ── 24 ── 필터 8 ── 재배치 ── 전체 점등
```

**핵심 장치**: 헤더에 **`포스터 24 / 24  ·  필터 0`** 카운터가 있고,
관람객이 필터를 만질 때마다 **실시간으로 바뀐다.** 진행바가 아니라 **상태 표시기**다.
이 방은 시간축이 아니라 **필터 상태**가 관람객의 위치를 말해준다.

## A-6. 명장면 3개

**① PAGE 02 — 벽이 재배치되는 3초** (감정 + 기술의 클라이맥스)
관람객이 `예술·공연` 을 누르는 순간:
탈락한 포스터 16장이 **벽에서 떨어지며 아래로 사라지고**, 남은 8장이 **자기 자리로 미끄러져 이동**한다.
그동안 왼쪽 코드 패널에서 필터 함수가 한 줄씩 실행되며 빛난다.
카운터가 `24 → 8` 로 떨어진다. **말 없이 이해된다.**

**② PAGE 03 — 뒤로가기를 눌러보세요** (기술의 클라이맥스)
필터를 3개 걸어둔 상태에서, 화면에 진짜 브라우저 뒤로가기 버튼이 나타난다.
누르면 **필터가 전부 날아가고 벽이 24장으로 되돌아간다.**
뜨는 문장: _"방금 그게, 제 첫 버전에서 사용자가 겪던 일입니다."_

**③ PAGE 07 — 포스터가 분해된다**
포스터 한 장이 공중에서 층층이 분리되며 각 층에 컴포넌트 이름표가 붙는다.
`PosterCard` / `TagRow` / `RecruitBadge` / `DeadlineChip` — 그리고 다시 조립된다.

## A-7. 다른 9개 방과의 차별점

| 축          | ACLUB                               | 나머지         |
| ----------- | ----------------------------------- | -------------- |
| 주 인터랙션 | **레이아웃 자체가 움직인다 (FLIP)** | 값이 바뀐다    |
| 트러블 성격 | **브라우저 기본 동작을 되찾는 일**  | 계산·성능·연결 |
| 관람객 위치 | **서비스의 사용자로 편입**          | 관찰자         |
| 색          | 보라 · 축제 조명                    | 각자           |
| 밀도        | **화면에 카드 24장** — 가장 빽빽함  | 각자           |

## A-8. 절대 금지 (안전 규칙)

- **실존 동아리명·실존 학생 이름·실제 연락처 금지.** 전부 가상 (`빛그림 사진회` 등)
- 포스터 이미지는 **CSS/SVG로 생성**하거나 `[IMG]` 슬롯. 무단 이미지 사용 금지
- FLIP 재배치 시 **동시 애니메이션 24개 이하**, `transform`/`opacity` 만 사용
- 필터 조작은 **뷰포트 밖이면 애니메이션 생략** (즉시 반영)
- 제어권 박탈 없음 — P03 뒤로가기도 **관람객이 직접 누르는 것**
- 소리 없음 (이 방은 무음)

---

# B. 공통 디자인 토큰 (참고용 — 각 프롬프트에 이미 포함됨)

| 토큰                        | 값                                                                                 | 용도        |
| --------------------------- | ---------------------------------------------------------------------------------- | ----------- |
| `--bg`                      | `#0d0816` → `#120c1d` (P09부터)                                                    | 페이지 배경 |
| `--panel`                   | `#170f26`                                                                          | 벽 · 카드   |
| `--primary`                 | `#c084fc`                                                                          | 보라 · 강조 |
| `--accent`                  | `#d8b4fe`                                                                          | 보조 강조   |
| `--ok` / `--bad` / `--warn` | `#4ade80` / `#f87171` / `#fbbf24`                                                  | 상태 3색    |
| `--text`                    | `rgba(255,255,255,0.88)`                                                           | 본문        |
| `--muted`                   | `rgba(255,255,255,0.46)`                                                           | 캡션        |
| `--wall`                    | `rgba(192,132,252,0.06)`                                                           | 벽 텍스처   |
| 포스터 카테고리색           | 예술 `#f472b6` · 학술 `#38bdf8` · 운동 `#fbbf24` · 봉사 `#4ade80` · 취미 `#c084fc` |             |
| 코드 패널                   | bg `#0f0a1a`, border `rgba(192,132,252,0.18)`                                      |             |
| 문법 색                     | 주석 `#7a5f8a` / 문자열 `#fcd34d` / 키워드 `#c084fc` / 숫자 `#7dd3fc`              |             |
| 이징                        | `cubic-bezier(0.22,1,0.36,1)` (재배치) · `cubic-bezier(0.4,0,1,1)` (낙하)          |             |
| 숫자                        | 전부 `tabular-nums`                                                                |             |

---

# C. 페이지별 프롬프트

---

## PAGE 00 — 박람회장 입장 (진입 시퀀스)

**개발 실체**: 왜 이걸 만들었는가 (동기)
**연출 장치**: 사방에 흩어진 포스터 조각이 한 벽으로 날아와 붙는다

```text
Build a full-screen cinematic ENTRY SEQUENCE for a campus club-discovery platform
portfolio page, where scattered posters fly in from all directions and assemble
into a single wall.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Single self-contained
component. Draw the posters in CSS/SVG - no image assets required.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
Why this project was built. The final readable line must state the developer's
motivation, within 4 seconds.

=== MOOD ===
A campus club fair right before the doors open. Purple festival lighting on a dark
hall, paper posters, tape, energy. Busy but not chaotic.
NOT a corporate SaaS landing page. NOT neon cyberpunk. This is a school gym with
posters taped to the wall.

=== COMPLIANCE (applies to every page in this project) ===
All club names, member names and contact details are FICTIONAL.
Never use a real club, a real student's name, or a real contact.

=== DESIGN TOKENS (use exactly) ===
background #0d0816 | panel #170f26 | primary purple #c084fc | accent #d8b4fe
ok #4ade80 | bad #f87171 | warn #fbbf24
category colors: 예술 #f472b6, 학술 #38bdf8, 운동 #fbbf24, 봉사 #4ade80, 취미 #c084fc
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
wall texture rgba(192,132,252,0.06)
fonts: headings font-black, body sans leading-8, ALL labels/counters font-mono
easing cubic-bezier(0.22,1,0.36,1) for settling, cubic-bezier(0.4,0,1,1) for falling
durations 0.3s-0.9s | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Full viewport, position fixed, above page content.
Background: #0d0816 with a faint paper-grain texture (an SVG turbulence filter at
opacity 0.03) and two soft purple spotlights from above
(rgba(192,132,252,0.07), 40vw ellipses at 28% and 72% horizontally) that brighten
as the sequence proceeds.
Content: a centered wall area, max-width 900px, with the text column overlaid on it.

=== ENTRY TIMELINE (follow exactly) ===
t=0.00s  Empty dark hall. Only the two spotlights, at 20% intensity.
t=0.20s  SIX POSTER FRAGMENTS fly in from OFF-SCREEN, one from each edge and two
         from the corners. Each is a small tilted rectangle (72x96px), a solid
         category color at 22% alpha with a 1px border of that color at 45%.
         Each travels 0.6s with the settling easing, rotating from ±25deg to ±6deg,
         and lands at a slightly different position across the wall area,
         0.09s apart. On landing each emits ONE soft dust puff (a 24px radial
         gradient that expands to 44px and fades, 0.4s).
t=0.90s  EIGHTEEN MORE fragments fly in faster (0.4s each, 0.04s apart), filling
         the wall into a loose 6x4 arrangement of 24 posters. They are not perfectly
         aligned - each keeps a ±3deg tilt and ±4px offset, like real taped paper.
t=1.80s  The spotlights brighten to full over 0.5s. A subtle drop shadow appears
         under every poster.
t=2.00s  The wall DIMS to 30% opacity behind a text column that fades in on top.
         TITLE:
           Line 1, VERBATIM: "ACLUB"
             58px font-black, #c084fc, letter-spacing -0.02em
           Line 2, VERBATIM: "동아리 탐색·모집 플랫폼 · React + TypeScript"
             13px font-mono, rgba(255,255,255,0.46), letter-spacing 0.14em,
             margin-top 12px
t=2.50s  THE MOTIVATION LINE fades in below the title. This is the substance of this
         page. 17px, leading-9, rgba(255,255,255,0.88), max-width 560px, centered.
         Korean copy, VERBATIM:
         "동아리 하나 들어가겠다고 에브리타임, 인스타, 학과 게시판을 다 뒤졌다.
          정작 모집 마감은 지나 있었다.
          찾는 게 어려운 게 아니라, 흩어져 있는 게 문제였다."
         Reveal word by word, stagger 0.035s, y 6px -> 0.
t=3.60s  A counter chip appears at the top-right of the wall area, font-mono 12px
         rgba(255,255,255,0.46), tabular-nums, VERBATIM: "포스터 24 / 24  ·  필터 0"
         This counter persists into the fixed header for the rest of the page.
t=4.00s  Scroll hint at the bottom, font-mono 12px rgba(255,255,255,0.46),
         VERBATIM: "↓ 벽 앞으로"
         with a purple chevron bouncing 4px on a 1.8s cycle.

=== ESCAPE HATCHES (required) ===
Any click, scroll, keypress, or Escape skips to the t=4.00s end state instantly.
A skip control from t=0.40s at the bottom-right, font-mono 11px,
rgba(255,255,255,0.35), VERBATIM: "[ 건너뛰기 ]"

=== PERFORMANCE ===
All 24 fragments animate with transform and opacity ONLY. Never animate left/top/
width/height. Use a single staggered orchestration, not 24 independent timers.

=== ACCESSIBILITY ===
prefers-reduced-motion: no flying, no dust puffs, no spotlight ramp. Render the
assembled wall, the title, the motivation line and the counter immediately.
The motivation line must be real DOM text and must not be blocked from screen
readers during the animation.

=== RESPONSIVE ===
< 768px: the wall becomes 4x3 = 12 posters (fragments still fly in), title 36px,
motivation line 15px, poster size 58x78px.

=== DO NOT ===
No confetti, no balloons, no cartoon mascots.
Do not use real club names anywhere - the posters carry color and shape only at
this stage, no text.
Do not delay the motivation line past 3.0s.
```

---

## PAGE 01 — 히어로 · 포스터 월

**개발 실체**: 프로젝트 정체 + **데모 영상 · GitHub · 담당 범위**
**연출 장치**: 링크가 버튼이 아니라 **벽에 붙은 포스터 3장** — 한 장은 영상, 한 장은 저장소, 한 장은 손글씨 메모

```text
Build the HERO SECTION of a campus club-discovery platform portfolio page, built
around a wall of taped posters where three of the posters ARE the demo video, the
GitHub repository, and a handwritten scope note.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained section.
Draw posters in CSS/SVG; image slots are optional enhancements.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the project is (identity + hard facts)
2. The demo video entry point
3. The GitHub repository link
4. The developer's role
Items 2-4 must read as posters taped to a wall, never as a link row.

=== MOOD ===
Campus club fair, purple festival lighting, taped paper, slight tilt on everything.
Energetic, tactile, a little handmade.

=== COMPLIANCE ===
All club names, member names and contacts are FICTIONAL.

=== DESIGN TOKENS (use exactly) ===
background #0d0816 | panel #170f26 | primary purple #c084fc | accent #d8b4fe
ok #4ade80 | bad #f87171 | warn #fbbf24
category colors: 예술 #f472b6, 학술 #38bdf8, 운동 #fbbf24, 봉사 #4ade80, 취미 #c084fc
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
wall texture rgba(192,132,252,0.06) | poster border rgba(192,132,252,0.20)
fonts: headings font-black, body sans leading-8, labels/counters font-mono
easing cubic-bezier(0.22,1,0.36,1) 0.3s-0.9s | rounded-md | ALL numbers tabular-nums

=== PERSISTENT HEADER (fixed, present on every section of this page) ===
Height 54px, background rgba(13,8,22,0.85), backdrop-blur(10px),
bottom border 1px rgba(192,132,252,0.18).
  LEFT   "← 마을로"  13px font-mono rgba(255,255,255,0.46)
  CENTER "ACLUB"  14px font-black #c084fc
  RIGHT  a LIVE STATE READOUT (not a progress bar - this page's indicator is state,
         not position), format VERBATIM: "포스터 24 / 24  ·  필터 0"
         13px font-mono tabular-nums. It updates in real time whenever the viewer
         changes a filter anywhere on the page, and the changed number briefly
         scales to 1.15 and back (0.3s).

=== LAYOUT ===
min-height 100vh, padding-block 88px.
A full-bleed POSTER WALL occupying the whole section as the background layer, with
a centered text column floating over it at max-width 720px.
The wall has a subtle vertical gradient (lighter at the top where the spotlights
are) and a 1px horizontal rail line at the top with small tape marks.

=== THE POSTER WALL ===
24 posters in a loose 6x4 arrangement (4x3 = 12 below 768px), each 132x176px
(aspect 3/4), background #170f26, border 1px rgba(192,132,252,0.20), rounded-sm,
each with:
  - a ±3deg random tilt and ±4px offset
  - two small "tape" strips at the top corners (10x22px, rgba(255,255,255,0.08),
    rotated 45deg / -45deg)
  - a category color bar along the top edge (4px)
  - a generated poster face: a bold 2-3 line FICTIONAL club name in font-black 13px,
    a category chip in font-mono 9px, and a simple CSS/SVG graphic motif
    (concentric circles, a wave, a grid, a triangle stack) tinted by category
  - a drop shadow that deepens on hover
FICTIONAL club names to distribute across the wall, VERBATIM:
  "빛그림 사진회" "한밤의 밴드" "달리는 사람들" "고전읽기 모임" "코드나무"
  "손끝공방" "새벽등산부" "무대 위 사람들" "종이비행기 봉사단" "수요 토론회"
  "바다탐사대" "느린 산책" "필름 아카이브" "매듭공예부" "야구공 던지기"
  "심야 상영회" "북쪽 별 관측회" "발효식품 연구회" "종이접기 학회" "달빛 합창단"
  "숲 가꾸기" "체스 한 판" "라디오 만들기" "한글 서예회"
Hover a poster: it lifts 6px, straightens to 0deg, scales 1.04, its shadow deepens,
and its category bar glows. 0.3s.
The wall sits at 55% opacity behind the text column, rising to 100% opacity in the
lower third of the section where the three special posters live.

=== THE THREE SPECIAL POSTERS (the defining objects of this page) ===
Three posters in the wall are LARGER (176x234px) and visually distinct - they sit in
the lower band of the wall, in the front layer, at full opacity, each with a
slightly stronger shadow so they read as pinned on top of the others.

  POSTER A - DEMO VIDEO  (left of the trio)
    Face: a dark 3/4 frame with a centered play triangle 26px #d8b4fe inside a 56px
    circle with a 1px rgba(216,180,254,0.45) border.
    Title on the poster, font-black 15px #d8b4fe, VERBATIM: "데모 영상"
    Bottom chip, font-mono 10px rgba(255,255,255,0.55), VERBATIM: "1분 54초"
    A small "REC" dot blinks in the corner at 1Hz (never faster).
    Click -> opens a video lightbox: overlay rgba(8,4,14,0.94) backdrop-blur(8px),
    16/9 player centered at max-width 1020px, Esc or overlay click closes.
    If no video source is supplied, render a CSS placeholder inside the player with
    centered text VERBATIM "데모 영상 자리 · 16:9".
    [VIDEO-01] one flow: apply filters -> list re-arranges -> open a club detail ->
    go back and confirm the list is preserved -> open the recruit posting.

  POSTER B - GITHUB  (center of the trio)
    Face: a monospace "< >" glyph 30px rgba(255,255,255,0.78) centered on a subtle
    grid motif.
    Title, font-black 15px rgba(255,255,255,0.88), VERBATIM: "GitHub 저장소"
    Bottom chip, font-mono 10px rgba(255,255,255,0.55),
    VERBATIM: "React · TypeScript · Vite"
    Click -> https://github.com/aClub2026/FE in a new tab
    (target _blank, rel noreferrer).
    Hover: a "↗" appears at the poster's top-right corner.

  POSTER C - SCOPE NOTE  (right of the trio)
    Face: a lined-paper look (repeating-linear-gradient horizontal lines at
    rgba(255,255,255,0.05) every 18px), tilted -4deg.
    Handwriting-style text, font-mono 11px rgba(255,255,255,0.62), four lines
    VERBATIM:
      "프론트엔드 단독"
      "탐색 · 필터 · 상세"
      "마이페이지 · 관리자"
      "백엔드 연동 전"
    Not a link. Hovering straightens it to 0deg and lifts it.

  A small hint below the trio, font-mono 10px rgba(255,255,255,0.35), fading out
  permanently once any of the three has been hovered or focused,
  VERBATIM: "포스터를 눌러보세요"

=== TEXT COLUMN CONTENT (Korean copy - VERBATIM, never translate) ===

KICKER (font-mono 12px, letter-spacing 0.3em, uppercase, color #c084fc):
  "PLATFORM · 동아리 탐색과 모집"

HEADLINE (font-black, 42px desktop / 27px mobile, leading-tight, centered,
          rgba(255,255,255,0.88)):
  Line 1, VERBATIM: "찾는 게 어려운 게 아니라"
  Line 2, color #c084fc, margin-top 10px, VERBATIM: "흩어져 있는 게 문제였다"

SUMMARY (16px leading-9, max-width 640px, centered, margin-top 22px):
  VERBATIM: "동아리 24개를 한 벽에 붙여놓고, 조건을 누르면 남는 것만 남게 했다.
             탐색부터 지원까지 한 서비스 안에서 끝나도록 화면 흐름을 설계했다."
  Emphasize "조건을 누르면 남는 것만 남게 했다" in #d8b4fe, font-bold.

FACT GRID (4 cells in a row; 2x2 below 768px), margin-top 30px, max-width 700px,
centered. Each cell: border 1px rgba(192,132,252,0.20), rounded-md, padding 14px,
background rgba(192,132,252,0.03).
value font-mono 22px font-black #c084fc tabular-nums, label font-mono 10px
rgba(255,255,255,0.46) letter-spacing 0.1em below.
  Cell 1  value "4"          label "기술 스택"
  Cell 2  value "6"          label "핵심 화면"
  Cell 3  value "프론트엔드"  label "담당 범위"
  Cell 4  value "미연동"      label "백엔드"
The fourth cell is deliberately honest. Give it a 1px rgba(251,191,36,0.30) border
and a note beneath the grid, font-mono 10px rgba(255,255,255,0.35), VERBATIM:
  "백엔드 연동 전 단계입니다. 범위는 뒤에서 그대로 밝힙니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The wall fades up at 55% opacity; posters settle into place with a small
       0.15s scale spring, 0.02s apart (very fast - it should feel like the wall
       was already there)
0.30s  Kicker fades up (y 10px -> 0, 0.5s)
0.50s  Headline line 1 word by word (stagger 0.04s), line 2 at 1.05s
1.50s  Summary reveals
1.95s  Fact cells fade in 0.09s apart
2.40s  THE THREE SPECIAL POSTERS get taped on: each drops from 30px above with a
       slight rotation overshoot, 0.18s apart, and its two tape strips appear 0.1s
       after it lands (scaling from 0 width). A dust puff on each landing.
3.10s  The hint fades in
Hover any wall poster at any time: lift + straighten as described.

=== PERFORMANCE ===
24+ posters must animate with transform and opacity only. Hover effects use
transform, not layout properties. Do not attach 24 independent observers - use one.

=== RESPONSIVE ===
< 1024px: wall becomes 5x4; the trio drops to a row below the text column.
< 768px: wall becomes 4x3 (12 posters); the trio becomes a horizontal row of three
at 132x176px beneath the fact grid; headline 27px.
Touch: the three special posters need a 44px minimum touch target and their hover
state also applies on focus.

=== ACCESSIBILITY ===
prefers-reduced-motion: no drop-in, no tape animation, no dust puffs, no settle
spring. Everything renders in place; hover still lifts but without rotation.
Posters A and B must be real focusable elements (button / anchor) with visible focus
rings (2px #c084fc, offset 2px).
The 21 decorative wall posters must NOT be in the tab order and should be
aria-hidden; provide a visually-hidden line instead, VERBATIM:
  "가상의 동아리 포스터 24장이 배경으로 배치되어 있습니다."
All numbers tabular-nums.

=== DO NOT ===
Do not render the video and GitHub as a conventional button row anywhere.
Do not use real club names, real student names, or real contact details.
Do not overstate scope - the "미연동" fact cell and its note must stay.
```

---

## PAGE 02 — 벽이 스스로 다시 붙는다 · 필터와 재배치

**개발 실체**: 필터링 구현 + FLIP 재배치 + **실제 필터/정렬 코드**
**연출 장치**: **관람객이 조건을 누르면 포스터 24장이 떨어지고·이동하고·내려온다** → 그동안 옆 코드가 단계별로 실행

```text
Build a SECTION with a fully working filter over 24 club posters, where changing a
filter physically re-arranges the wall (items leaving fall away, surviving items
slide to new positions, returning items drop in) while the corresponding filter
code highlights step by step beside it.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That filtering + re-layout is the core of this product
2. The real filter pipeline code (predicate composition -> sort -> keyed render)
3. Why the re-layout is animated at all - a concrete UX reason, not decoration
4. A deliberate forward hook: this filter state was NOT in the URL at first

=== MOOD ===
Club fair, mid-afternoon, purple lights. Kinetic and satisfying. The wall should
feel physical - paper falling, paper sliding.

=== COMPLIANCE ===
All club names are FICTIONAL.

=== DESIGN TOKENS (use exactly) ===
background #0d0816 | panel #170f26 | primary purple #c084fc | accent #d8b4fe
ok #4ade80 | bad #f87171 | warn #fbbf24
category colors: 예술 #f472b6, 학술 #38bdf8, 운동 #fbbf24, 봉사 #4ade80, 취미 #c084fc
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0f0a1a, border rgba(192,132,252,0.18)
syntax: comments #7a5f8a, strings #fcd34d, keywords #c084fc, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing: re-layout cubic-bezier(0.22,1,0.36,1), falling cubic-bezier(0.4,0,1,1)
rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1180px, padding-block 120px.
  Block A : label + heading + two paragraphs (max-width 740px)
  Block B : the filter bar, full width
  Block C : a two-column split, gap 18px
              LEFT  (62%) : THE POSTER WALL, min-height 560px
              RIGHT (38%) : THE FILTER CODE PANEL, sticky within the block,
                            height 560px
            Below 1100px stacks, wall first, code panel below (not sticky).
  Block D : the "why animate" card + forward hook

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "01 · 필터와 재배치"

HEADING (28px font-black):
  VERBATIM: "검색창에 뭘 쳐야 할지 모르는 사람을 위한 화면"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "학생들은 「사진 동아리」를 검색하지 않는다.
             「이번 학기에 모집하고, 주말에 안 모이고, 신입생도 받는 곳」을 찾는다.
             그건 검색어로 표현할 수 있는 조건이 아니다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "그래서 검색 대신 조건을 눌러 좁히는 구조로 만들었다.
             아래 필터를 직접 눌러보세요. 오른쪽 코드에서 지금 어느 단계가 도는지 보입니다."
  Emphasize "직접 눌러보세요" in #d8b4fe, font-bold.

=== BLOCK B: THE FILTER BAR (must actually work) ===
A full-width bar, padding 18px 20px, rounded-md, background #170f26,
border 1px rgba(192,132,252,0.18), sticky at top offset 66px (below the page
header) while the wall is in view.

Row 1 - CATEGORY CHIPS, label on the left, font-mono 10px rgba(255,255,255,0.46),
VERBATIM: "분야"
  Six toggle chips, font-mono 12px, padding 7px 14px, rounded-full,
  border 1px rgba(255,255,255,0.14), color rgba(255,255,255,0.70).
  Labels VERBATIM: "전체" "예술" "학술" "운동" "봉사" "취미"
  When active, a chip takes its CATEGORY COLOR as border and a 14%-alpha background
  of that color, with the label in that color.
  "전체" is active by default and deselects the others when pressed.
  Multiple categories can be active at once (except with 전체).

Row 2 - TOGGLES, margin-top 12px, label VERBATIM: "조건"
  Three switch-style toggles, font-mono 12px, each a small track and a label:
    VERBATIM "모집중만"
    VERBATIM "신입생 환영"
    VERBATIM "주말 활동 없음"

Row 3 - SORT, margin-top 12px, label VERBATIM: "정렬"
  A segmented control with three options, font-mono 12px:
    VERBATIM "마감 임박순"  |  "가나다순"  |  "최근 등록순"
  Default: 마감 임박순.

Right side of the bar - the LIVE COUNT, font-mono 14px #c084fc, tabular-nums,
format VERBATIM: "8 / 24"
and beneath it a reset link, font-mono 11px rgba(255,255,255,0.46),
VERBATIM: "↻ 조건 초기화"
The count number animates by counting (not snapping) over 0.35s on each change.

=== BLOCK C LEFT: THE POSTER WALL (the defining idea) ===
A responsive grid of poster cards: 4 columns above 1100px within the split,
3 below 900px, 2 below 640px. Gap 14px.

Each poster card: aspect 3/4, background #170f26,
border 1px rgba(192,132,252,0.20), rounded-sm, padding 12px, position relative,
with:
  - a 4px category color bar along the top edge
  - the FICTIONAL club name, font-black 14px rgba(255,255,255,0.88), 2 lines max
  - a category chip, font-mono 9px, in the category color
  - two condition chips when applicable, font-mono 9px rgba(255,255,255,0.50):
    VERBATIM "신입생 환영" / "주말 활동 없음"
  - a recruit badge at the bottom-right: when recruiting, a pill in #4ade80 at 16%
    alpha with font-mono 9px #4ade80, VERBATIM: "모집중"; otherwise a grey pill
    VERBATIM: "모집 마감"
  - a deadline chip at the bottom-left, font-mono 9px, format VERBATIM: "D-6"
    (colored #f87171 when under D-7, #fbbf24 under D-14, otherwise muted)
  - [IMG-SLOT] an optional 3/2 image area at the top of the card, height 62px:
    if a poster image is supplied render it (object-fit cover, rounded-sm);
    otherwise render a generated CSS/SVG motif tinted by category.
    Provide this slot on EVERY card so real poster artwork can be dropped in later.

DATA: 24 FICTIONAL clubs distributed across the five categories with varied
conditions and deadlines, so that every filter combination yields a visibly
different, non-empty-looking result except one deliberate case (see EMPTY STATE).
Club names VERBATIM (assign categories sensibly):
  "빛그림 사진회" "한밤의 밴드" "달리는 사람들" "고전읽기 모임" "코드나무"
  "손끝공방" "새벽등산부" "무대 위 사람들" "종이비행기 봉사단" "수요 토론회"
  "바다탐사대" "느린 산책" "필름 아카이브" "매듭공예부" "야구공 던지기"
  "심야 상영회" "북쪽 별 관측회" "발효식품 연구회" "종이접기 학회" "달빛 합창단"
  "숲 가꾸기" "체스 한 판" "라디오 만들기" "한글 서예회"

THE RE-LAYOUT ANIMATION (this is the page's centerpiece - implement precisely):
Use a FLIP technique (measure First and Last positions, invert with transform, then
play) or an equivalent layout-animation primitive. On any filter change:
  t=0.00s  LEAVING cards detach: they rotate 6-14deg (randomized direction),
           translate downward 120px, and fade to 0 over 0.42s with the FALLING
           easing. They must fall at slightly different speeds (stagger 0.015s by
           grid index) so it reads as paper, not a synchronized block.
  t=0.10s  SURVIVING cards SLIDE from their old grid position to their new one over
           0.5s with the re-layout easing. They must never fade - the continuity of
           the same card moving is the whole point.
  t=0.30s  ENTERING cards drop in from 26px above with opacity 0 -> 1 and a 0.3s
           settle, staggered 0.03s apart, each with its two tape strips scaling in.
  t=0.85s  The count readout finishes its count animation.
Total under 0.9s. Never exceed 24 simultaneously animating elements.

EMPTY STATE: when a combination yields zero results (make at least one reachable,
e.g. 봉사 + 주말 활동 없음 + 신입생 환영), the wall shows a centered empty card:
  a dashed 1px rgba(255,255,255,0.16) rounded box, padding 32px, with
  font-mono 13px rgba(255,255,255,0.55), VERBATIM: "조건에 맞는 동아리가 없습니다"
  a sub-line, font-mono 11px rgba(255,255,255,0.40), VERBATIM:
    "조건을 하나 풀어보세요"
  and a button, font-mono 11px, border 1px rgba(192,132,252,0.35), color #c084fc,
  VERBATIM: "[ 마지막 조건 해제 ]"
  which removes the most recently applied filter. Designing a USEFUL empty state is
  part of the substance - do not just show "no results".

=== BLOCK C RIGHT: THE FILTER CODE PANEL ===
Height 560px, sticky within the split (top offset 88px), background #0f0a1a,
border 1px rgba(192,132,252,0.18), rounded-md.
Header bar: three window dots (#ff5f56 #ffbd2e #27c93f, 8px) then the filename,
font-mono 11px rgba(255,255,255,0.45), VERBATIM: "useClubFilter.ts"
Body: font-mono 12px, leading-relaxed, line-number gutter rgba(255,255,255,0.22).

CONTENT: a TypeScript hook, roughly 28 lines, with FOUR clearly contiguous blocks:
  (1) a Filters type and a ClubItem type,
  (2) building an array of predicate functions from the active filters - one
      predicate per active condition, skipping inactive ones entirely,
  (3) applying every predicate with a single pass and then sorting by the selected
      key, with a stable tiebreaker so equal items never reorder randomly,
  (4) memoizing the result on the filter object and the source list, and returning
      both the filtered list and its length.
Include a short comment on the stable-tiebreaker line explaining that without it
the wall would reshuffle on unrelated re-renders.

THE LIVE HIGHLIGHT (required): on every filter change the four blocks highlight IN
ORDER, 0.14s apart, each with a rgba(192,132,252,0.14) row background sweeping in
from the left over 0.28s and fading after 1.2s.
IMPLEMENTATION CONSTRAINT: render the code once and toggle CSS classes on refs to
the four block elements - do NOT re-render the code panel on every filter change.

Caption bar at the bottom, border-top 1px rgba(192,132,252,0.12), font-mono 11px
rgba(255,255,255,0.45), prefixed "// ", changing with the active block:
  idle VERBATIM: "// 위에서 조건을 바꾸면 이 순서대로 실행됩니다"
  (2)  VERBATIM: "// 안 켠 조건은 아예 함수로 만들지 않는다"
  (3)  VERBATIM: "// 정렬 기준이 같을 때 순서가 흔들리면 벽이 이유 없이 다시 섞인다"
  (4)  VERBATIM: "// 필터 객체가 그대로면 다시 계산하지 않는다"

=== BLOCK D: THE "WHY ANIMATE" CARD + FORWARD HOOK ===
Margin-top 40px. Two stacked pieces.

CARD, padding 22px, rounded-md, border 1px rgba(192,132,252,0.22),
background rgba(192,132,252,0.04), border-left 3px #c084fc.
  Label font-mono 10px letter-spacing 0.2em #c084fc, VERBATIM: "왜 애니메이션을 넣었나"
  Body 15px leading-8, VERBATIM:
  "그냥 다시 그리면 사용자는 화면이 「바뀌었다」는 것만 안다.
   어떤 게 빠지고 어떤 게 남았는지는 모른다.
   남는 카드가 자리를 옮기는 걸 보여주면, 자기가 뭘 걸러냈는지가 눈으로 확인된다.
   그래서 사라지는 것과 남는 것의 움직임을 일부러 다르게 만들었다."
  Emphasize "사라지는 것과 남는 것의 움직임을 일부러 다르게" in #d8b4fe, font-bold.

FORWARD HOOK, margin-top 24px, one paragraph, 16px leading-9, max-width 760px,
rgba(255,255,255,0.88), VERBATIM:
  "여기까지는 잘 됐다. 문제는 이 상태가 주소창에 하나도 안 남아 있었다는 것이다.
   조건을 다섯 개 걸어놓고 동아리 하나를 눌러본 다음, 뒤로가기를 누르면 어떻게 될까.
   다음 장에서 직접 눌러보시면 됩니다."
Emphasize "주소창에 하나도 안 남아 있었다" in #f87171, font-bold.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s (stagger 0.03s)
0.70s  Paragraph 1, paragraph 2 at 1.20s
1.70s  Filter bar fades up (y 14px -> 0, 0.5s); its chips appear 0.04s apart
2.20s  The wall's 24 cards drop in, 0.025s apart, each with a 0.3s settle
2.90s  Code panel fades up
3.30s  A one-time pulse on the "예술" category chip (a soft purple ring, 2 pulses,
       0.9s each) with a hint beside the filter bar, font-mono 10px
       rgba(255,255,255,0.35), VERBATIM: "조건을 눌러보세요"
       Both disappear permanently once any filter is used.

=== PERFORMANCE ===
Transform and opacity only - never animate width, height, top or left.
Batch DOM measurements before writes (measure all First positions, then all Last,
then apply transforms) so the FLIP does not thrash layout.
If the wall is out of the viewport, apply filter changes INSTANTLY with no animation.

=== RESPONSIVE ===
< 1100px: stacked; the code panel is no longer sticky and sits below the wall with
height auto (max 520px, internal vertical scroll).
< 640px: wall becomes 2 columns; the filter bar's chip rows scroll horizontally
inside their own container (never the page); sort becomes a select element;
code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no FLIP, no falling, no drop-in. Filter changes apply
instantly with a 0.12s cross-fade only. The count still animates? No - it snaps.
Filter chips must be real toggle buttons (aria-pressed), toggles real switches
(role="switch", aria-checked), and sort a real radiogroup - all keyboard operable
with visible focus rings (2px #c084fc, offset 2px).
Announce results ONCE per change via aria-live="polite", VERBATIM pattern:
  "조건에 맞는 동아리 8개."
and for the empty state VERBATIM: "조건에 맞는 동아리가 없습니다."
Do not announce on every intermediate animation frame.
The wall must be a list with proper semantics; each card's club name is its
accessible name.

=== DO NOT ===
Do not use real club names.
Do not fade surviving cards - they must slide, and that continuity is the point.
Do not animate more than 24 elements at once.
Do not omit the empty state or the forward hook.
```

---

## PAGE 03 — 트러블슈팅 01 · 뒤로가기를 눌러보세요

**개발 실체**: 필터 상태를 URL에 동기화하지 않아 생긴 문제의 **전체 추적 과정**
**연출 장치**: **관람객에게 진짜 뒤로가기 버튼을 준다.** 누르면 필터가 전부 날아간다.

```text
Build a TROUBLESHOOTING CASE FILE where the viewer applies filters, opens a detail
view, presses a real back button, and watches every filter vanish - reproducing the
bug - then follows the full diagnosis and the URL-synchronization fix.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
Simulate the address bar and history locally - do NOT touch the real browser history.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the lost-filter-state bug:
symptom -> reproduction (three separate broken behaviours) -> root cause ->
the fix (URL as the source of truth) -> verification -> remaining limits.
All six parts required.

=== MOOD ===
The particular frustration of losing work to a back button. Purple turning red at
the failure, then methodical and calm.

=== COMPLIANCE ===
All club names are FICTIONAL.

=== DESIGN TOKENS (use exactly) ===
background #0d0816 | panel #170f26 | primary purple #c084fc | accent #d8b4fe
ok #4ade80 | bad #f87171 | warn #fbbf24
category colors: 예술 #f472b6, 학술 #38bdf8, 운동 #fbbf24, 봉사 #4ade80, 취미 #c084fc
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0f0a1a, border rgba(192,132,252,0.18)
syntax: comments #7a5f8a, strings #fcd34d, keywords #c084fc, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.22,1,0.36,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1040px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE BROWSER SIMULATOR - full width, height ~500px
  Block C : the three broken behaviours
  Block D : root cause
  Block E : the fix (before/after code)
  Block F : verification + remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "02 · 트러블슈팅 01"

HEADING (30px font-black):
  VERBATIM: "조건을 다섯 개 걸어놓고 뒤로가기를 누르면"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "친구한테 「이 조건으로 보면 딱 좋아」 하면서 링크를 보냈는데, 그냥 첫 화면이 열렸다.
   나도 동아리 상세를 보고 뒤로 나오면 조건이 다 풀려 있었다.
   기능은 다 되는데 쓸 수가 없는 화면이었다."

=== BLOCK B: THE BROWSER SIMULATOR (the defining idea) ===
Margin-top 36px. A container styled as a browser window, rounded-lg,
border 1px rgba(192,132,252,0.20), background #0f0a1a, overflow hidden.

CHROME BAR (44px, background #170f26, border-bottom 1px rgba(192,132,252,0.14)):
  - Three window dots on the left (#ff5f56 #ffbd2e #27c93f, 9px)
  - A REAL BACK BUTTON: a 30px circular button with a "←" glyph, font-mono 15px,
    border 1px rgba(255,255,255,0.20), color rgba(255,255,255,0.75).
    It is enabled only when the simulated history has more than one entry.
  - A forward button, same style, "→", usually disabled.
  - A reload button, "↻".
  - THE ADDRESS BAR: flex-1, height 28px, background rgba(255,255,255,0.05),
    border 1px rgba(255,255,255,0.10), rounded-full, padding 0 14px,
    font-mono 11px rgba(255,255,255,0.70), showing the current simulated URL.
    THIS IS THE MOST IMPORTANT ELEMENT ON THE PAGE - it must be clearly readable
    and it must visibly change (or fail to change) as the viewer acts.
  - A share button on the right, font-mono 11px, border 1px rgba(255,255,255,0.16),
    rounded, padding 4px 12px, VERBATIM: "링크 복사"

A MODE TOGGLE sits just above the browser window, right-aligned, font-mono 11px,
two options: VERBATIM "수정 전"  |  VERBATIM "수정 후"
Default: 수정 전. Active gets background rgba(192,132,252,0.14), color #c084fc.

VIEWPORT (the browser's content area, height ~400px):
  A compact version of the club list from the previous section: a filter chip row
  at the top (four chips VERBATIM "예술" "학술" "모집중만" "신입생 환영") and a
  3-column grid of 12 poster cards beneath it. Cards are the same design as before,
  smaller (aspect 3/4, ~110px wide), each with the [IMG-SLOT] motif area.
  Clicking a card navigates INSIDE the simulator to a detail view: the grid slides
  left and out (0.35s), and a detail panel slides in from the right showing the
  club name, a category chip, a description paragraph, and a
  VERBATIM "[ 목록으로 ]" button. The simulated history gains an entry.

IN "수정 전" MODE (the bug):
  - Applying filters does NOT change the address bar. It stays at the bare list URL,
    VERBATIM: "aclub.app/clubs"
    Each time a filter is applied, the address bar briefly flashes a
    rgba(248,113,113,0.10) background and a tiny marker appears under it,
    font-mono 9px #f87171, VERBATIM: "주소는 그대로"
  - Opening a detail DOES change the address bar to
    VERBATIM: "aclub.app/clubs/12"
  - PRESSING BACK: the address returns to VERBATIM "aclub.app/clubs" and the list
    re-renders with EVERY FILTER CLEARED and the card count snapping back to 12/12.
    All four filter chips visibly deactivate one after another, 0.06s apart, and
    the grid re-populates with a fall-and-drop animation.
  - AT THAT MOMENT a message fades in over the viewport, max-width 460px,
    17px leading-9, centered:
      Line 1, rgba(255,255,255,0.88), VERBATIM:
        "방금 그게, 제 첫 버전에서 사용자가 겪던 일입니다."
      Line 2, #f87171, font-bold, margin-top 8px, VERBATIM:
        "조건은 화면 안에만 있었고, 주소에는 없었습니다."
    It fades after 4s or on the next interaction.
  - PRESSING "링크 복사": a toast appears at the viewport's bottom-center,
    font-mono 11px, background #0f0a1a, border 1px rgba(248,113,113,0.35),
    color #f87171, VERBATIM: "복사됨: aclub.app/clubs — 조건은 포함되지 않았습니다"

IN "수정 후" MODE (the fix):
  - Applying filters DOES update the address bar, live, to something like
    VERBATIM: "aclub.app/clubs?cat=art,acad&recruiting=1&fresh=1"
    Each change types the new query string in character by character over 0.25s and
    the address bar briefly glows #4ade80.
  - PRESSING BACK from a detail returns to the list WITH ALL FILTERS INTACT, and a
    green marker appears under the address bar, font-mono 9px #4ade80,
    VERBATIM: "조건 유지됨"
  - PRESSING BACK again steps through the FILTER history one change at a time
    (this is the subtle part - show it), with a small caption, font-mono 10px
    rgba(255,255,255,0.46), VERBATIM: "조건 변경도 히스토리에 남습니다"
  - PRESSING "링크 복사": toast VERBATIM: "복사됨: 조건이 포함된 주소"
    in #4ade80.

A HISTORY STACK VISUALIZER along the container's bottom edge (34px strip,
border-top 1px rgba(192,132,252,0.12)): a horizontal row of small chips
representing the simulated history entries, font-mono 9px, the current one
highlighted in #c084fc. In "수정 전" mode there are only ever 2 chips; in
"수정 후" mode the stack grows with each filter change. That visible difference is
the argument.

A note beneath the container, font-mono 9px rgba(255,255,255,0.32), VERBATIM:
  "재현용 시뮬레이터입니다. 실제 브라우저 히스토리를 조작하지 않습니다."

=== BLOCK C: THE THREE BROKEN BEHAVIOURS ===
Margin-top 44px. Three cards in a row, gap 14px (single column below 900px).
Each: padding 20px, rounded-md, background #170f26,
border 1px rgba(255,255,255,0.10), with a 3px top border #f87171.
Each has a font-mono 10px letter-spacing 0.18em #f87171 label, a problem paragraph
at 15px leading-8, and a fix line at font-mono 12px #4ade80 prefixed "→ ".

CARD 1  label VERBATIM: "01 · 공유"
  problem VERBATIM: "조건을 걸어둔 화면을 링크로 보낼 수 없었다.
                     받는 사람은 항상 아무 조건도 없는 첫 화면을 봤다."
  fix VERBATIM: "→ 조건을 쿼리스트링으로 옮겨서 주소만 보내면 같은 화면이 열리게"
CARD 2  label VERBATIM: "02 · 뒤로가기"
  problem VERBATIM: "상세를 보고 뒤로 나오면 조건이 전부 풀렸다.
                     사용자는 매번 다시 다섯 번을 눌러야 했다."
  fix VERBATIM: "→ 목록 화면이 조건을 기억하는 게 아니라, 주소가 기억하게"
CARD 3  label VERBATIM: "03 · 새로고침"
  problem VERBATIM: "새로고침하면 초기화됐다.
                     화면이 멈춘 것 같아서 새로고침했는데 오히려 잃어버렸다."
  fix VERBATIM: "→ 첫 렌더에서 주소를 읽어 조건을 복원"
Cards reveal 0.12s apart on entry, each sliding up 14px.

=== BLOCK D: ROOT CAUSE ===
Margin-top 40px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인"
  Body 16px leading-8, VERBATIM:
  "필터 상태를 컴포넌트 안의 상태로만 들고 있었다. 화면이 언마운트되면 같이 사라진다.
   그런데 사용자 입장에서 조건은 「화면의 일시적인 설정」이 아니라
   「내가 지금 보고 있는 곳」이다.
   지금 보고 있는 곳을 표현하는 자리는 원래부터 주소창이었다."
  Emphasize "지금 보고 있는 곳을 표현하는 자리는 원래부터 주소창이었다"
  in #fbbf24, font-bold.

=== BLOCK E: THE FIX (before / after code) ===
Margin-top 40px. Two code panels, side by side above 1024px, stacked below, gap 16px.
Each: background #0f0a1a, border 1px, rounded-md, header with three window dots and
a filename, body font-mono 12px with a line-number gutter.

  BEFORE panel - border 1px rgba(248,113,113,0.28),
    filename VERBATIM: "ClubListPage.tsx (before)"
    CONTENT: ~12 lines. Filter state held in local component state, initialized to
    an empty object, updated by chip handlers, and consumed by the filter hook.
    Nothing reads or writes the URL.
    HIGHLIGHT the state initialization line with rgba(248,113,113,0.12) and add an
    inline marker at its right edge, font-mono 10px #f87171,
    VERBATIM: "← 화면이 사라지면 같이 사라진다"

  AFTER panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "useFilterParams.ts (after)"
    CONTENT: ~20 lines. A hook that DERIVES the filter object from the current
    search params rather than holding it in state; a setter that serializes the
    filter object back into search params and navigates - using a REPLACE for rapid
    successive changes within a short window and a PUSH otherwise, so the history
    is not flooded by every chip tap; and a parser that validates unknown or
    malformed params and falls back to a safe default instead of throwing.
    HIGHLIGHT: the derive-from-params line, and the push-vs-replace decision line
    (background rgba(74,222,128,0.12)).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "상태를 주소에서 파생시키면, 뒤로가기와 공유는 공짜로 따라온다"

A short note beneath both panels, 15px leading-8, VERBATIM:
  "처음엔 조건을 바꿀 때마다 히스토리에 쌓았더니, 칩을 다섯 번 누르면
   뒤로가기를 다섯 번 눌러야 목록을 벗어났다. 그래서 짧은 시간 안의 연속 변경은
   히스토리를 덮어쓰도록 바꿨다."
Emphasize "짧은 시간 안의 연속 변경은 히스토리를 덮어쓰도록" in #d8b4fe, font-bold.
This second-order problem is required - it shows the fix itself had to be tuned.

--- MEDIA SLOT ---
Margin-top 28px. A wide media frame, aspect 21/9, rounded-md,
border 1px rgba(192,132,252,0.18), overflow hidden.
  [IMG-01] a real screen capture showing the browser address bar WITH the filter
  query string visible, alongside the filtered list.
  Caption bar beneath, padding 10px 14px, font-mono 11px rgba(255,255,255,0.48),
  VERBATIM: "실제 화면 · 주소창에 조건이 남아 있는 상태"
  If no image is supplied, render a CSS placeholder with a faint purple grid and
  centered text VERBATIM "[IMG-01] · 21:9 · 주소창이 보이는 캡처".
  This slot is important: an address bar screenshot is the cheapest possible proof
  of this whole section.

=== BLOCK F: VERIFICATION + REMAINING LIMITS ===
Margin-top 40px.
Three stat cells in a row, gap 12px (stacks below 640px). Each: padding 16px,
rounded-md, border 1px rgba(74,222,128,0.22), background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "3종"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "복구된 브라우저 동작"
  Cell 2  value VERBATIM "1회"   label VERBATIM "조건 5개 변경 시 뒤로가기 횟수"
  Cell 3  value VERBATIM "동일"  label VERBATIM "링크 공유 시 상대가 보는 화면"
Values fade in on entry.
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "브라우저에서 직접 눌러가며 확인했습니다. 자동화된 테스트는 없습니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "조건이 많아지면 주소가 길어진다. 짧은 코드로 압축하는 건 하지 않았다."
    "잘못된 파라미터는 기본값으로 되돌리기만 한다. 사용자에게 알려주지는 않는다."
    "스크롤 위치는 여전히 복원되지 않는다. 그건 다음 장에서 다룬다."
The third item is a deliberate bridge to the next section - keep it.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left (x -12px -> 0)
1.10s  The browser simulator fades up (y 18px -> 0, 0.6s); its chrome bar draws
       first, then the viewport contents populate 0.03s apart
2.00s  A one-time pulse on TWO elements at once: the filter chips (soft purple ring)
       and, 1.2s later, the back button (soft red ring), each 2 pulses of 0.9s,
       with a hint above the chrome bar, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "조건을 걸고, 동아리를 하나 열고, 뒤로가기를 눌러보세요"
       All of it disappears permanently once the back button is used.
All later blocks animate on their own viewport entry.

=== RESPONSIVE ===
< 1024px: code panels stack (before on top).
< 900px: the three behaviour cards stack.
< 640px: the simulator's grid becomes 2 columns; the address bar truncates with an
ellipsis in the middle (never hide the query string entirely - it is the point);
the history strip scrolls horizontally inside itself; code font 11px with internal
horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no typing animation in the address bar (it updates
instantly), no fall-and-drop on the grid, no button pulses.
The back / forward / reload / share buttons and the mode toggle must be real
controls with visible focus rings (2px #c084fc, offset 2px) and accessible names.
Announce the back-press outcome ONCE via aria-live="polite":
  수정 전 VERBATIM: "뒤로가기 후 모든 조건이 해제되었습니다."
  수정 후 VERBATIM: "뒤로가기 후 조건이 유지되었습니다."
The simulated address bar must be readable text, not an image.

=== DO NOT ===
Do not manipulate the real browser history or the real URL.
Do not remove the second-order problem note (history flooding) - it shows the fix
needed tuning.
Do not use real club names.
Do not remove the limits card or its bridge to the next section.
```

---

## PAGE 04 — 탐색에서 지원까지 · 사용자 흐름과 라우팅

**개발 실체**: 라우팅 구조 · 보호 라우트 · 화면 흐름 설계
**연출 장치**: **관람객이 흐름을 직접 걸어간다** — 화면이 실제로 전환되고, 지도 위 현재 위치가 따라 움직인다

```text
Build a USER FLOW section where the viewer walks the actual product flow
(browse -> detail -> recruit posting -> apply) inside a device frame, while a route
map beside it lights up the current position and the router configuration
highlights the matching entry.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
Simulate navigation locally - do NOT change the real URL.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The full user flow and why it was designed as separate routes rather than modals
2. The route structure including the protected routes
3. What happens when an unauthenticated user hits a protected route

=== MOOD ===
Club fair, walking the floor. Purple lighting, forward motion, clear signage.

=== COMPLIANCE ===
All club names, member names and contacts are FICTIONAL. The apply form must never
collect or display anything resembling real personal data.

=== DESIGN TOKENS (use exactly) ===
background #0d0816 | panel #170f26 | primary purple #c084fc | accent #d8b4fe
ok #4ade80 | bad #f87171 | warn #fbbf24
category colors: 예술 #f472b6, 학술 #38bdf8, 운동 #fbbf24, 봉사 #4ade80, 취미 #c084fc
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0f0a1a, border rgba(192,132,252,0.18)
syntax: comments #7a5f8a, strings #fcd34d, keywords #c084fc, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.22,1,0.36,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1140px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : a two-column split, gap 20px
              LEFT  (52%) : THE DEVICE - a phone-ish frame, height 560px
              RIGHT (48%) : THE ROUTE MAP (top, ~300px) + THE ROUTER CODE (bottom)
            Below 1024px stacks, device first.
  Block C : the modal-vs-route decision card
  Block D : media slot

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "03 · 사용자 흐름"

HEADING (28px font-black):
  VERBATIM: "동아리를 고르는 일은 한 화면에서 끝나지 않는다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "둘러보고, 마음에 드는 걸 열어보고, 모집 공고를 확인하고, 지원한다.
             네 단계 중 어디서든 나갔다가 다시 들어올 수 있어야 했다.
             아래에서 직접 걸어가 보세요."
  Emphasize "직접 걸어가 보세요" in #d8b4fe, font-bold.

=== BLOCK B LEFT: THE DEVICE (must actually navigate) ===
A device frame: width ~380px, height 560px, rounded-2xl,
border 8px solid #1c1329, background #0f0a1a, with a subtle inner shadow and a
14px notch bar at the top.
Inside, a mini app with a 34px top bar showing the current screen title and, when
applicable, a back chevron.

FOUR SCREENS, each fully rendered:

  SCREEN 1 - VERBATIM "동아리 둘러보기"
    A 2-column grid of 6 poster cards (same design language as elsewhere, with the
    [IMG-SLOT] motif area), and a compact filter chip row at the top.
    Tapping a card advances to Screen 2.

  SCREEN 2 - VERBATIM "동아리 상세"
    A hero band with the club name (FICTIONAL, VERBATIM "빛그림 사진회"), a category
    chip, and an [IMG-SLOT] cover area (aspect 16/9, height 110px).
    Below: a description paragraph (2-3 lines of plausible Korean club copy), a
    3-row info list (활동 요일 / 인원 / 회비) with placeholder values, and a
    primary button, VERBATIM: "모집 공고 보기"
    Tapping it advances to Screen 3.

  SCREEN 3 - VERBATIM "모집 공고"
    A posting layout: a deadline banner at the top in #fbbf24 at 14% alpha,
    font-mono 12px, format VERBATIM: "마감 D-6 · 3월 18일까지"
    then a requirements list and a schedule list, then a primary button,
    VERBATIM: "지원하기"
    Tapping it attempts to advance to Screen 4.

  SCREEN 4 - VERBATIM "지원하기"  (PROTECTED)
    If the simulated auth state is logged out, tapping "지원하기" does NOT show this
    screen. Instead:
      t=0.00s  A redirect occurs to a login screen, sliding in from the right
      t=0.10s  The login screen shows a title VERBATIM "로그인이 필요합니다",
               a sub-line font-mono 11px rgba(255,255,255,0.46), VERBATIM:
               "지원하려면 로그인해야 합니다"
               a disabled-looking email/password pair (presentational only, never
               collecting anything), and a button VERBATIM: "로그인"
      t=0.20s  A chip appears at the bottom, font-mono 10px #fbbf24, VERBATIM:
               "돌아갈 위치를 기억해뒀습니다"
      On tapping 로그인, the viewer is sent BACK to Screen 4 (not to the home
      screen) - and a green chip confirms it, font-mono 10px #4ade80, VERBATIM:
      "원래 가려던 화면으로 돌아왔습니다"
      This redirect-and-return behaviour IS the substance of the protected route.
    Screen 4 itself: a short application form with three presentational fields
    (지원 동기 / 활동 가능 요일 / 연락 방법) and a submit button VERBATIM: "제출".
    Submitting shows a success state with VERBATIM "지원이 접수되었습니다" and a
    note, font-mono 9px rgba(255,255,255,0.35),
    VERBATIM: "시연용 화면입니다 · 실제로 전송되지 않습니다"

AN AUTH TOGGLE sits above the device, font-mono 11px, two options:
  VERBATIM "로그아웃 상태"  |  VERBATIM "로그인 상태"
Default: 로그아웃 상태, so the protected-route behaviour is what the viewer meets
first.

SCREEN TRANSITIONS: forward navigation slides the outgoing screen left by 30% while
fading it to 0.4, and slides the incoming screen in from the right - 0.35s, with a
1px purple edge highlight travelling with the incoming screen. Back navigation
mirrors it. Never cross-fade; the directional continuity is what makes the flow
legible.

A step readout beneath the device, font-mono 11px rgba(255,255,255,0.46),
tabular-nums, format VERBATIM: "1 / 4 · 동아리 둘러보기"

=== BLOCK B RIGHT TOP: THE ROUTE MAP ===
Height ~300px, background #170f26, border 1px rgba(192,132,252,0.18),
rounded-md, padding 20px. Drawn in SVG.
A vertical flow of five nodes connected by lines, each node a 150x44px rounded rect
with a font-mono 11px path label:
  VERBATIM "/clubs"  ->  "/clubs/:id"  ->  "/clubs/:id/recruit"  ->
  "/clubs/:id/apply"  and, branching off the last one to the right,
  "/login"
The 지원 node has a small lock glyph and a label beside it, font-mono 9px #fbbf24,
VERBATIM: "보호 라우트"
The /login node sits on a branch with a dashed line, and a RETURN arrow curves from
/login back to /clubs/:id/apply with a label, font-mono 9px #4ade80,
VERBATIM: "원위치 복귀"

THE CURRENT-POSITION MARKER: a purple pill that MOVES between nodes whenever the
device navigates, sliding with a 0.35s spring along the connector lines. The active
node lights (border #c084fc, background rgba(192,132,252,0.12)) and previously
visited nodes stay at 60% lit, forming a visible trail.

=== BLOCK B RIGHT BOTTOM: THE ROUTER CODE ===
Height ~240px, background #0f0a1a, border 1px rgba(192,132,252,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "routes.tsx"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~20 lines. A route configuration with a layout route wrapping the club
routes, nested child routes for the detail and recruit views, the apply route
wrapped in a RequireAuth element, and a login route. Below the config, a compact
RequireAuth component that reads the auth state, and when logged out renders a
redirect to the login route while passing the ATTEMPTED LOCATION along, so the
login screen can send the user back.
HIGHLIGHT ROWS: the RequireAuth wrapper line and the line that carries the attempted
location (background rgba(192,132,252,0.12)).
AS THE DEVICE NAVIGATES, the matching route line highlights with a
rgba(192,132,252,0.14) background, sweeping in over 0.25s. Only one line at a time.
Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
  "어디로 가려 했는지를 같이 넘기지 않으면, 로그인 후에 홈으로 떨어진다"

=== BLOCK C: THE MODAL-VS-ROUTE DECISION CARD ===
Margin-top 44px, padding 22px, rounded-md, border 1px rgba(192,132,252,0.22),
background rgba(192,132,252,0.04), border-left 3px #c084fc.
  Label font-mono 10px letter-spacing 0.2em #c084fc, VERBATIM: "왜 모달이 아니라 라우트인가"
  Body 15px leading-8, VERBATIM:
  "처음엔 동아리 상세를 모달로 띄웠다. 구현이 훨씬 간단했다.
   그런데 모달은 주소가 없다. 링크로 보낼 수도 없고, 뒤로가기로 닫을 수도 없고,
   새로고침하면 사라진다.
   앞 장에서 겪은 문제가 여기서도 똑같이 나온다는 걸 알고 전부 라우트로 바꿨다."
  Emphasize "모달은 주소가 없다" in #d8b4fe, font-bold.
This callback to the previous section is deliberate - keep it.

=== BLOCK D: MEDIA SLOT ===
Margin-top 36px. A 2-up media row, gap 14px (stacks below 720px).
Each frame: aspect 9/16 for mobile captures, rounded-md,
border 1px rgba(192,132,252,0.18), overflow hidden, with a caption bar beneath
(padding 10px 14px, font-mono 11px rgba(255,255,255,0.48)).
  [IMG-02] the real club detail screen    caption VERBATIM: "실제 상세 화면"
  [IMG-03] the real recruit posting screen caption VERBATIM: "실제 모집 공고 화면"
If no image is supplied, render a CSS placeholder with a faint purple grid and
centered text, e.g. VERBATIM "[IMG-02] · 9:16".

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  Device frame fades up (y 20px -> 0, 0.6s); Screen 1 populates 0.04s apart
1.80s  Route map fades in; its nodes draw top to bottom 0.1s apart; the current
       marker lands on /clubs
2.40s  Router code panel fades up
2.90s  A one-time pulse on the first poster card inside the device (a soft purple
       ring, 2 pulses of 0.9s) with a hint beneath the device, font-mono 10px
       rgba(255,255,255,0.35), VERBATIM: "동아리를 하나 눌러보세요"
       Both disappear permanently once the viewer navigates.

=== RESPONSIVE ===
< 1024px: stacked; the device is centered and the route map + code sit below it
side by side, then stack again below 720px.
< 640px: device width 92vw with height 520px; route map node labels 10px;
code font 11px with internal horizontal scroll (the block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: screens cross-fade in 0.15s instead of sliding; the route
marker jumps instead of sliding; no card pulse.
Every tappable element inside the device must be a real button with an accessible
name and a visible focus ring (2px #c084fc, offset 2px). The device must be fully
keyboard navigable.
Announce screen changes ONCE via aria-live="polite" using the step readout copy.
The login screen's fields are presentational: mark them aria-hidden and add a
visually-hidden note, VERBATIM: "시연용 화면이며 입력을 받지 않습니다."
Provide a visually-hidden ordered text version of the route map.

=== DO NOT ===
Do not change the real URL or the real browser history.
Do not collect, store, or echo any input in the apply form.
Do not use real club names or real personal data.
Do not skip the redirect-and-return behaviour - it is the point of the protected
route.
```

---

## PAGE 05 — 트러블슈팅 02 · 목록으로 돌아오면 맨 위였다

**개발 실체**: 목록↔상세 왕복 시 스크롤 위치 소실 → **복원 구현 전 과정**
**연출 장치**: 관람객이 스크롤을 한참 내린 뒤 상세를 열었다 닫으면 **실제로 맨 위로 튄다**

```text
Build a TROUBLESHOOTING section where the viewer scrolls deep into a list inside a
simulated app, opens a detail, comes back, and lands at the top - reproducing the
scroll-restoration bug - then follows the full diagnosis and fix.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
All scrolling happens INSIDE the simulator container, never on the real page.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the lost-scroll-position bug:
symptom -> reproduction -> why the obvious fix failed -> root cause -> the working
fix -> verification -> remaining limits. All seven parts required.

=== MOOD ===
The small, constant annoyance that makes a product feel cheap. Purple, precise,
slightly exasperated, then satisfied.

=== COMPLIANCE ===
All club names are FICTIONAL.

=== DESIGN TOKENS (use exactly) ===
background #0d0816 | panel #170f26 | primary purple #c084fc | accent #d8b4fe
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0f0a1a, border rgba(192,132,252,0.18)
syntax: comments #7a5f8a, strings #fcd34d, keywords #c084fc, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.22,1,0.36,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1020px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE SCROLL SIMULATOR - full width, height ~520px
  Block C : the failed attempt
  Block D : root cause
  Block E : the fix code
  Block F : verification + remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "04 · 트러블슈팅 02"

HEADING (30px font-black):
  VERBATIM: "스무 번째 동아리를 보고 나오면 다시 첫 번째였다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "목록을 한참 내려서 마음에 드는 동아리를 열어봤다가, 아니다 싶어 뒤로 나오면
   목록 맨 위였다. 다시 스무 번을 스크롤해야 아까 그 자리였다.
   버그 리포트로는 안 올라오는데, 쓰다 보면 지치는 종류의 문제였다."

=== BLOCK B: THE SCROLL SIMULATOR (the defining idea) ===
Margin-top 36px. A container, height ~520px, rounded-lg,
border 1px rgba(192,132,252,0.20), background #0f0a1a, overflow hidden,
position relative.

A MODE TOGGLE at the top-right of the container, font-mono 11px, two options:
  VERBATIM "수정 전"  |  VERBATIM "수정 후"
Default: 수정 전.

TOP BAR (36px, border-bottom 1px rgba(192,132,252,0.14)):
  left  font-mono 11px rgba(255,255,255,0.72), VERBATIM: "동아리 목록"
  right a live scroll readout, font-mono 11px rgba(255,255,255,0.46), tabular-nums,
        format VERBATIM: "스크롤 0px · 1번째"
        showing the container's scrollTop and which list item is currently at the
        top of the viewport. It updates live as the viewer scrolls.

THE LIST (the container's scrollable area):
  24 list rows, each 84px tall, padding 14px 16px, border-bottom 1px
  rgba(255,255,255,0.06), containing:
    - a 56x56px [IMG-SLOT] thumbnail on the left (rounded-sm; a generated CSS motif
      tinted by category if no image is supplied)
    - the FICTIONAL club name in font-black 14px
    - a category chip and a deadline chip in font-mono 9px
    - a right chevron
  Each row also carries a large, faint index number at its right edge, font-mono
  22px rgba(255,255,255,0.10), tabular-nums, so the viewer can tell exactly how far
  down they are - this makes the bug unmistakable.
  Tapping a row opens the DETAIL VIEW.

THE DETAIL VIEW: slides in from the right over the list (0.35s), covering it fully.
It contains an [IMG-SLOT] cover (aspect 16/9, height 130px), the club name, two
paragraphs of plausible Korean club description, and a back button at the top-left,
font-mono 12px, VERBATIM: "← 목록으로"

THE BUG (in "수정 전" mode):
  Tapping "목록으로" slides the detail out, and the list re-mounts at scrollTop 0.
  t=0.00s  Detail slides right and out (0.3s)
  t=0.20s  The list appears - AT THE TOP. The scroll readout snaps to
           VERBATIM "스크롤 0px · 1번째" and briefly flashes #f87171
  t=0.40s  A red marker slides in at the top-right of the list, font-mono 10px
           #f87171, VERBATIM: "← 여기로 튐"
  t=0.70s  A message fades in at the container's center, max-width 420px,
           17px leading-9:
             Line 1, rgba(255,255,255,0.88), VERBATIM:
               "아까 20번째를 보고 계셨습니다."
             Line 2, #f87171, font-bold, margin-top 8px, VERBATIM:
               "돌아오니 1번째입니다."
           It fades after 3.5s or on the next interaction.
  A "위치 기억" ghost readout appears beneath the top bar showing what the position
  WAS, font-mono 10px rgba(255,255,255,0.40), format VERBATIM:
    "직전 위치: 1,640px · 20번째"
  so the viewer can see the information existed and was simply thrown away.

THE FIX (in "수정 후" mode):
  Tapping "목록으로" restores the exact previous scrollTop.
  t=0.20s  The list appears already at the saved offset - NOT animated scrolling.
           It must appear instantly at the right place; a smooth scroll-to would
           itself be a worse experience and shows a misunderstanding of the fix.
  t=0.35s  A green marker, font-mono 10px #4ade80, VERBATIM: "← 원래 자리"
           and the row the viewer had opened gets a brief 1.2s highlight
           (background rgba(192,132,252,0.10)) so they can find it again.
           That highlight is a deliberate extra touch - call it out in the caption.
  The scroll readout shows the restored value.

A hint above the container, font-mono 10px rgba(255,255,255,0.35), fading out
permanently after the first detail open, VERBATIM:
  "목록을 한참 내린 다음, 동아리를 하나 열었다가 돌아와 보세요"

A note beneath the container, font-mono 9px rgba(255,255,255,0.32), VERBATIM:
  "이 스크롤은 이 상자 안에서만 일어납니다 · 재현용 시뮬레이터"

=== BLOCK C: THE FAILED ATTEMPT (required - do not remove) ===
Margin-top 44px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "먼저 시도했다가 실패한 것"
  Body 15px leading-8, VERBATIM:
  "목록으로 돌아올 때 저장해둔 위치로 스크롤하도록 먼저 고쳤다.
   그런데 여전히 맨 위였다. 스크롤 명령이 리스트가 그려지기 전에 실행돼서,
   높이가 0인 요소를 1,640px 지점으로 스크롤하려 한 것이었다.
   그러고 나서 리스트가 그려지니 다시 0이 됐다."
  Emphasize "리스트가 그려지기 전에 실행돼서" in #fbbf24, font-bold.

=== BLOCK D: ROOT CAUSE ===
Margin-top 32px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인"
  Body 16px leading-8, VERBATIM:
  "문제는 두 겹이었다. 첫째, 위치를 저장하는 곳이 없었다.
   둘째, 저장해도 복원 시점이 틀렸다.
   스크롤은 「그릴 것이 다 그려진 다음」에만 의미가 있는데,
   컴포넌트가 마운트되는 시점은 아직 그려지기 전이다."
  Emphasize "복원 시점이 틀렸다" in #fbbf24, font-bold.

=== BLOCK E: THE FIX CODE ===
Margin-top 40px, full width. background #0f0a1a,
border 1px rgba(192,132,252,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "useScrollRestore.ts"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~22 lines. A hook that:
  - keys a saved scroll offset by the route key, in a module-level map that
    survives component unmount (not component state),
  - saves the container's scrollTop on every scroll, throttled to once per frame,
  - on mount, restores the saved offset only AFTER the list content has actually
    been laid out - using a layout-phase effect and a check that the container's
    scrollHeight is at least the target offset, retrying on the next frame if it is
    not yet tall enough, with a bounded number of retries,
  - clears the saved entry when the viewer leaves the list section entirely.
HIGHLIGHT ROWS (background rgba(192,132,252,0.12)): the module-level map
declaration and the scrollHeight readiness check.
Caption bar, border-top 1px, font-mono 11px, prefixed "// ", VERBATIM:
  "저장은 쉬웠다. 어려운 건 「언제 복원할지」였다."

A short note beneath, 15px leading-8, VERBATIM:
  "돌아왔을 때 아까 눌렀던 항목을 1.2초 동안 살짝 밝게 표시하는 것도 같이 넣었다.
   위치만 맞으면 되는 게 아니라, 「아까 그거 여기 있어요」까지 알려줘야
   사용자가 다시 헤매지 않는다."
Emphasize "「아까 그거 여기 있어요」까지" in #d8b4fe, font-bold.

--- MEDIA SLOT ---
Margin-top 28px. A single wide frame, aspect 21/9, rounded-md,
border 1px rgba(192,132,252,0.18), overflow hidden, with a caption bar beneath.
  [IMG-04] a real capture: the list at a deep scroll position, with the previously
  opened item highlighted after returning.
  caption VERBATIM: "실제 화면 · 목록으로 돌아온 직후 (직전에 본 항목이 강조됨)"
  Placeholder text if no image: VERBATIM "[IMG-04] · 21:9 · 복원 직후 목록 캡처"

=== BLOCK F: VERIFICATION + REMAINING LIMITS ===
Margin-top 40px.
Three stat cells in a row, gap 12px (stacks below 640px). Each: padding 16px,
rounded-md, border 1px rgba(74,222,128,0.22), background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "±0px"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "복원 후 위치 오차"
  Cell 2  value VERBATIM "24개"  label VERBATIM "테스트한 항목 수"
  Cell 3  value VERBATIM "3곳"   label VERBATIM "같은 훅을 적용한 목록 화면"
Values fade in on entry.
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "직접 스크롤해가며 확인했습니다. 자동화된 테스트는 없습니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "목록 항목 수가 바뀌면(조건을 바꾸고 돌아오면) 위치가 어긋난다. 그때는 맨 위로 보낸다."
    "이미지가 늦게 로드되면 높이가 밀린다. 썸네일에 고정 높이를 줘서 완화했을 뿐이다."
    "가상 스크롤을 쓰는 목록에는 이 방식이 그대로 통하지 않는다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left
1.10s  Simulator fades up; the list rows populate 0.02s apart
1.80s  The hint appears above the container
2.20s  A one-time attention nudge: the list auto-scrolls down 240px over 0.8s and
       back up over 0.5s, ONCE, to show that it is scrollable. Only if the viewer
       has not scrolled it yet.
All later blocks animate on their own viewport entry.

=== PERFORMANCE ===
Throttle the scroll-position readout to one update per animation frame. Never store
scrollTop in React state on every scroll event.

=== RESPONSIVE ===
< 720px: simulator height 460px; list rows 76px; the scroll readout moves below the
top bar; index numbers 18px.
< 640px: code font 11px with internal horizontal scroll (the block scrolls, never
the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no auto-scroll nudge, no slide transitions (detail
cross-fades in 0.15s), no row highlight pulse (it appears as a static border).
The mode toggle and every list row must be real controls with visible focus rings
(2px #c084fc, offset 2px).
Announce the outcome ONCE per return via aria-live="polite":
  수정 전 VERBATIM: "목록 맨 위로 이동했습니다."
  수정 후 VERBATIM: "이전에 보던 위치로 돌아왔습니다."
The simulator's internal scrolling must never hijack page scrolling - when the
inner list reaches its end, the page must scroll normally.

=== DO NOT ===
Do not scroll the real page.
Do not animate the restoration with a smooth scroll - it must appear instantly at
the right offset.
Do not remove the failed-attempt card or the limits card.
Do not use real club names.
```

---

## PAGE 06 — 같은 카드, 다른 사람 · 일반과 관리자

**개발 실체**: 일반/관리자 화면 분리 + **역할별 UI 구성과 프론트 분기의 한계**
**연출 장치**: **역할 스위처** — 같은 포스터 카드가 관리자에게는 편집 가능한 물건으로 변한다

```text
Build a ROLE SEPARATION section built around a role switcher that transforms the
SAME club card between a member-facing poster and an admin-facing management row,
with an explicit note that frontend branching is not access control.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That two distinct role experiences were designed over the same data
2. What each role can see and do
3. The honest boundary: with no backend, this is a UI separation only, and the
   developer knows the difference

=== MOOD ===
Backstage of the club fair. Same posters, but now someone is holding a clipboard.
Purple, orderly, a little administrative.

=== COMPLIANCE ===
All club names, member names and contacts are FICTIONAL. The admin view must never
show anything resembling real personal data - member rows use placeholders.

=== DESIGN TOKENS (use exactly) ===
background #0d0816 | panel #170f26 | primary purple #c084fc | accent #d8b4fe
ok #4ade80 | bad #f87171 | warn #fbbf24
category colors: 예술 #f472b6, 학술 #38bdf8, 운동 #fbbf24, 봉사 #4ade80, 취미 #c084fc
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0f0a1a, border rgba(192,132,252,0.18)
syntax: comments #7a5f8a, strings #fcd34d, keywords #c084fc, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.22,1,0.36,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1080px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the role switcher, centered
  Block C : THE MORPHING CARD - a single card that transforms, height ~360px
  Block D : the full screen comparison (two mockups side by side)
  Block E : the honest boundary card + media slot

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "05 · 역할 분리"

HEADING (28px font-black):
  VERBATIM: "학생에게는 포스터, 운영진에게는 서류"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "같은 동아리 데이터인데 보는 사람에 따라 필요한 게 완전히 다르다.
             학생은 「어떤 동아리인지」를 보고, 운영진은 「몇 명이 지원했는지」를 본다.
             두 화면을 억지로 하나로 합치지 않기로 했다."
  Emphasize "억지로 하나로 합치지 않기로 했다" in #d8b4fe, font-bold.

=== BLOCK B: THE ROLE SWITCHER ===
A segmented control, centered, margin-top 32px.
Container: inline-flex, background #0f0a1a, border 1px rgba(192,132,252,0.22),
rounded-md, padding 4px.
Two buttons, font-mono 12px, padding 9px 24px, rounded:
  VERBATIM "학생"  |  VERBATIM "운영진"
Active: background rgba(192,132,252,0.14), color #c084fc, with a 2px purple
indicator bar sliding beneath (0.35s spring - it must SLIDE, never jump).
Default: 학생.
Below the switcher, a line that swaps, font-mono 11px rgba(255,255,255,0.46):
  학생   VERBATIM: "동아리를 찾고 지원하는 화면입니다"
  운영진 VERBATIM: "모집을 관리하고 지원자를 확인하는 화면입니다"

=== BLOCK C: THE MORPHING CARD (the defining idea) ===
Margin-top 40px. A single container, height ~360px, background #170f26,
border 1px rgba(192,132,252,0.18), rounded-md, padding 28px,
displaying ONE club's data in two completely different forms. It must be visibly
the same card transforming - never two separate cards cross-fading.

IN "학생" MODE - THE POSTER FORM:
  A vertical poster, width ~260px, centered, aspect 3/4:
    - a 4px category color bar on top
    - an [IMG-SLOT] cover area (aspect 4/3, height ~120px) with a generated CSS
      motif fallback
    - the FICTIONAL club name, font-black 18px, VERBATIM: "빛그림 사진회"
    - a category chip, font-mono 10px #f472b6, VERBATIM: "예술"
    - two condition chips, font-mono 9px, VERBATIM "신입생 환영" "주말 활동 없음"
    - a description line, 12px leading-6, rgba(255,255,255,0.60), VERBATIM:
      "필름 카메라로 한 학기에 한 번 전시를 엽니다"
    - a recruit badge, font-mono 10px #4ade80, VERBATIM: "모집중 · D-6"
    - a primary button at the bottom, VERBATIM: "지원하기"

IN "운영진" MODE - THE MANAGEMENT FORM:
  The poster ROTATES on its Y axis (rotateY 0 -> 90deg over 0.3s, content swaps at
  the halfway point, then 90 -> 0 over 0.3s) and lands as a WIDE management row,
  width 100%, height ~220px, containing:
    - a compact header row: the same club name at font-black 15px, the same
      category chip, and a status select-looking control, font-mono 11px,
      VERBATIM: "모집중 ▾"
    - a 4-cell stat strip: each cell a font-mono 20px font-black tabular-nums value
      over a font-mono 9px label. Labels VERBATIM:
      "지원자" "미확인" "합격" "정원"
      Values are plausible small numbers.
    - an applicant list preview: 3 rows, each with a placeholder applicant label
      (font-mono 11px, VERBATIM "지원자 A" / "지원자 B" / "지원자 C"), a submitted
      date, and a status chip (VERBATIM "검토중" / "합격" / "보류")
    - an action row: three small buttons, font-mono 11px, VERBATIM
      "공고 수정" "지원자 전체보기" "모집 마감"
  A note under the applicant list, font-mono 9px rgba(255,255,255,0.35),
  VERBATIM: "지원자 정보는 예시 표시입니다"

THE TRANSFORM must use a 3D flip with perspective, and the container's height must
animate smoothly between the two forms (360px poster-centered vs the wider row) so
nothing jumps.

A count chip at the container's top-right, font-mono 10px rgba(255,255,255,0.46),
swapping with the role, VERBATIM:
  학생   "표시 항목 8"
  운영진 "표시 항목 17"

=== BLOCK D: THE FULL SCREEN COMPARISON ===
Margin-top 48px. Two screen mockups side by side, gap 18px (stack below 900px).
Each: aspect 16/10, background #170f26, border 1px rgba(192,132,252,0.18),
rounded-md, overflow hidden, with a 26px title strip.
  LEFT  title VERBATIM: "학생 화면"
    Contents: a filter bar sketch and a 3x2 grid of poster cards.
  RIGHT title VERBATIM: "운영진 화면"
    Contents: a sidebar sketch with four nav items (font-mono 9px, VERBATIM
    "대시보드" "모집 관리" "지원자" "동아리 정보"), a stat row of four small cells,
    and a data table sketch with five rows.
Both mockups DIM to 45% except the one matching the current role, which stays at
100% with a purple border glow. Switching the role animates the emphasis over 0.35s.
This makes the switcher's effect legible at the whole-screen level, not just the
card level.

Beneath the two mockups, a 3-column comparison table, font-mono 12px,
row separators 1px rgba(255,255,255,0.08), row padding 13px.
Headers VERBATIM: "항목" | "학생" | "운영진"
Rows (student column values in rgba(255,255,255,0.70), admin in #c084fc):
  "동아리 정보"   | "읽기"       | "읽기 · 수정"
  "모집 공고"     | "읽기"       | "작성 · 수정 · 마감"
  "지원자 목록"   | "본인 것만"  | "전체"
  "통계"         | "없음"       | "지원자 수 · 상태별 집계"
  "네비게이션"    | "상단 탭"    | "좌측 사이드바"

=== BLOCK E: THE HONEST BOUNDARY CARD + MEDIA SLOT ===
Margin-top 44px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 11px letter-spacing 0.2em #fbbf24, VERBATIM: "분명히 해둘 것"
  Body 15px leading-8, VERBATIM:
  "지금 이건 화면 분리이지 권한 제어가 아니다.
   백엔드가 없으니 프론트에서 역할에 따라 다른 화면을 그리는 데까지만 했다.
   실제로는 서버가 요청마다 권한을 확인해야 하고, 프론트의 분기는
   그걸 대신할 수 없다. 이 차이를 모르고 만든 게 아니라, 알면서 여기서 멈춘 것이다."
  Emphasize "화면 분리이지 권한 제어가 아니다" in #fbbf24, font-bold.

MEDIA SLOT, margin-top 32px. A 2-up media row, gap 14px (stacks below 720px).
Each frame: aspect 16/10, rounded-md, border 1px rgba(192,132,252,0.18),
overflow hidden, with a caption bar beneath (padding 10px 14px, font-mono 11px
rgba(255,255,255,0.48)).
  [IMG-05] the real student-facing list screen   caption VERBATIM: "실제 학생 화면"
  [IMG-06] the real admin screen                 caption VERBATIM: "실제 관리자 화면"
Placeholder text if no image: VERBATIM "[IMG-05] · 16:10".

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  Role switcher fades up; the indicator bar draws to the active button
1.50s  The morphing card fades up in poster form; its elements appear 0.06s apart
2.20s  The two screen mockups fade up together; the student one takes the emphasis
2.80s  The comparison table rows fade in 0.09s apart
3.30s  ONE automatic demonstration: the switcher moves to 운영진, the card flips,
       the mockup emphasis swaps, it holds 2.2s, then returns to 학생.
       ONCE ONLY, and only if the viewer has not clicked. A caption during it,
       font-mono 10px rgba(255,255,255,0.35), VERBATIM: "자동 시연"

=== RESPONSIVE ===
< 900px: the two mockups stack; the comparison table becomes a stacked card list.
< 640px: the morphing card's management form scrolls horizontally inside itself for
the stat strip; the switcher becomes full width with two equal buttons at 11px.

=== ACCESSIBILITY ===
prefers-reduced-motion: no 3D flip (the card cross-fades in 0.18s), no sliding
indicator, no automatic demonstration.
The role switcher must be a real radiogroup, arrow-key navigable, with visible focus
rings (2px #c084fc, offset 2px).
Announce role changes ONCE via aria-live="polite" using the sub-line copy.
Content that disappears for a role must be REMOVED from the DOM, not merely hidden -
matching the described behaviour.
The mock action buttons in the admin form are presentational: mark them aria-hidden
and add a visually-hidden note, VERBATIM: "시연용 화면입니다."

=== DO NOT ===
Do not use real club names, real applicant names, or any real personal data.
Do not claim access control - the honest boundary card must stay exactly.
Do not cross-fade two separate cards; the single card must visibly transform.
```

---

## PAGE 07 — 포스터 한 장이 분해된다 · 공통 컴포넌트

**개발 실체**: 공통 컴포넌트 설계 + **props 경계와 재사용 실적**
**연출 장치**: 포스터 한 장이 공중에서 **층층이 분해**되었다가 재조립되고, 각 층에 이름표가 붙는다

```text
Build a COMPONENT DECOMPOSITION section where a single club poster card explodes
into its component layers in 3D, each layer labeled with its component name, then
reassembles - with the props boundary and the reuse count shown alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The rule used to decide component boundaries
2. The resulting components and where each is reused
3. The props design that makes reuse possible

=== MOOD ===
An exploded technical drawing floating in purple light. Precise, calm, satisfying.

=== COMPLIANCE ===
All club names are FICTIONAL.

=== DESIGN TOKENS (use exactly) ===
background #0d0816 | panel #170f26 | primary purple #c084fc | accent #d8b4fe
ok #4ade80 | warn #fbbf24
category colors: 예술 #f472b6, 학술 #38bdf8, 운동 #fbbf24, 봉사 #4ade80, 취미 #c084fc
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #0f0a1a, border rgba(192,132,252,0.18)
syntax: comments #7a5f8a, strings #fcd34d, keywords #c084fc, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.22,1,0.36,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1080px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE EXPLODED POSTER - full width, height ~520px
  Block C : the reuse table
  Block D : the props code panel

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "06 · 공통 컴포넌트"

HEADING (28px font-black):
  VERBATIM: "같은 카드가 네 화면에서 조금씩 다르게 필요했다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "목록에서는 작게, 상세에서는 크게, 마이페이지에서는 상태 배지가 붙고,
             관리자 화면에서는 아예 가로로 눕는다.
             매번 새로 만들다가 네 번째쯤에 규칙을 정했다."

=== BLOCK B: THE EXPLODED POSTER (the defining idea) ===
Margin-top 40px. A container, height ~520px, rounded-md,
border 1px rgba(192,132,252,0.18), background #170f26, padding 28px,
position relative, perspective 1100px.

A CONTROL at the top-right: a segmented pair, font-mono 11px, width 180px,
height 30px: VERBATIM "조립"  |  VERBATIM "분해"
Default: 조립.

ASSEMBLED STATE: one club poster card, centered, width ~280px, aspect 3/4,
rendered exactly as it appears in the product:
  - a 4px category color bar on top                     -> layer 1
  - an [IMG-SLOT] cover area (aspect 4/3, ~130px)       -> layer 2
  - the club name + description block                   -> layer 3
  - a tag row (category chip + two condition chips)     -> layer 4
  - a bottom bar (recruit badge + deadline chip)        -> layer 5
Club name VERBATIM: "빛그림 사진회"

THE EXPLODE (on switching to "분해"):
  t=0.00s  The card tilts into a 3/4 view (rotateX 18deg, rotateY -14deg) over 0.4s
  t=0.30s  The five layers SEPARATE along the Z axis toward the viewer, spaced
           64px apart, staggered 0.09s, 0.5s each with the settling easing. Each
           layer gains a 1px dashed #c084fc outline and a soft shadow.
  t=0.90s  A NAME TAG flies in beside each layer from the right: background #0f0a1a,
           border 1px rgba(192,132,252,0.30), rounded, padding 5px 10px,
           font-mono 10px #c084fc. Tags VERBATIM, layer 1 to 5:
             "CategoryBar" / "CoverImage" / "ClubHeading" / "TagRow" / "StatusBar"
           Each tag is connected to its layer by a 1px leader line.
  t=1.40s  A reuse chip appears under each tag, font-mono 9px
           rgba(255,255,255,0.46), format VERBATIM: "4개 화면에서 사용"
           (vary the count per layer: 4 / 3 / 4 / 4 / 2)
  t=1.80s  A summary chip appears at the container's bottom-right, font-mono 10px
           rgba(255,255,255,0.46), VERBATIM: "컴포넌트 5종 · 사용처 17곳"
Switching back to "조립" reverses everything over 0.8s, layers snapping together
with a small 0.15s settle each.

HOVER a separated layer: it brightens, scales 1.04, its tag scales 1.06, and the
other layers dim to 40%. 0.25s.

A VARIANT STRIP along the container's bottom (height ~90px, border-top 1px
rgba(192,132,252,0.12), padding-top 14px): four small renderings of the SAME card in
its four real contexts, each ~92px wide, with a font-mono 9px label beneath:
  VERBATIM "목록" / "상세" / "마이페이지" / "관리자"
The 관리자 variant is horizontal. Hovering a variant highlights which layers it
uses by brightening those layers in the exploded view above (or, in assembled state,
outlining them). That linkage is required - it turns the decomposition into an
argument about reuse.

AUTONOMOUS: if the viewer does not use the control within 5 seconds of the container
entering the viewport, run the explode once automatically, hold 2.5s, and reassemble.
ONCE ONLY. Caption during it, font-mono 10px rgba(255,255,255,0.35),
VERBATIM: "자동 시연"

=== BLOCK C: THE REUSE TABLE ===
Margin-top 48px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "컴포넌트와 사용처"
A 4-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "컴포넌트" | "받는 것" | "안 받는 것" | "사용처"
Rows:
  "CategoryBar"  | "분야 값"          | "동아리 전체 객체"   | "목록 · 상세 · 마이 · 관리자"
  "CoverImage"   | "이미지 주소 · 대체 텍스트" | "로딩 상태"  | "목록 · 상세 · 마이"
  "ClubHeading"  | "이름 · 한 줄 소개 · 크기"  | "클릭 동작"  | "목록 · 상세 · 마이 · 관리자"
  "TagRow"       | "태그 배열"        | "필터 상태"          | "목록 · 상세 · 마이 · 관리자"
  "StatusBar"    | "모집 여부 · 마감일" | "지원 로직"        | "목록 · 상세"
The "안 받는 것" column is the important one - style its cells in
rgba(255,255,255,0.55) with a small "✕ " prefix.
Rows fade in 0.1s apart on entry.

Below the table, one paragraph, 15px leading-8, VERBATIM:
  "규칙은 하나였다. 컴포넌트는 자기가 그릴 값만 받고, 그 값이 어디서 왔는지는 모른다.
   StatusBar가 지원 로직을 알기 시작하면 관리자 화면에서는 못 쓴다."
Emphasize "그 값이 어디서 왔는지는 모른다" in #d8b4fe, font-bold.

=== BLOCK D: THE PROPS CODE PANEL ===
Margin-top 40px, full width. background #0f0a1a,
border 1px rgba(192,132,252,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "ClubCard.tsx"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~24 lines of TypeScript React. A ClubCard that:
  - takes a narrow view-model prop (already-formatted strings and a size variant),
    NOT a raw club entity,
  - takes an optional onSelect callback rather than importing a router,
  - takes a variant union ("list" | "detail" | "mypage" | "admin") that only
    controls layout and which sub-components render,
  - composes the five sub-components and passes each only the fields it needs.
Include a comment noting that keeping the router out of the card is what let the
admin screen reuse it.
HIGHLIGHT ROWS (background rgba(192,132,252,0.12)): the view-model prop type and
the variant union.
Caption bar, border-top 1px, font-mono 11px, prefixed "// ", VERBATIM:
  "카드가 라우터를 알기 시작하면, 라우터가 없는 화면에서는 못 쓴다"

A short note beneath, 15px leading-8, VERBATIM:
  "variant를 4개까지 늘린 건 사실 아슬아슬한 선택이었다.
   여기서 하나만 더 늘었으면 컴포넌트를 쪼개야 했을 것이다.
   지금 구조는 「4개까지는 괜찮다」는 판단이지, 무한히 늘려도 된다는 뜻은 아니다."
Emphasize "아슬아슬한 선택이었다" in #fbbf24, font-bold.
This self-critical note is required.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  Container fades up; the assembled card renders; the variant strip populates
       0.08s apart
1.90s  The control fades in; the 5-second autonomous timer starts
Table and code panel animate on their own viewport entry.

=== PERFORMANCE ===
The autonomous demonstration and all 3D transforms stop when the container is out
of the viewport or the tab is hidden. Transform and opacity only.

=== RESPONSIVE ===
< 900px: container height 580px; layer spacing reduced to 40px; rotations halved so
tags stay readable.
< 640px: the explode becomes a VERTICAL stack (layers slide apart on Y only, no 3D),
tags sit above each layer; the variant strip scrolls horizontally inside itself;
code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no autonomous demonstration, no 3D rotation. "분해" simply
adds the dashed outlines and the name tags in place with no movement.
The control must be a real radiogroup with visible focus rings
(2px #c084fc, offset 2px). Variant strip items must be focusable buttons and
keyboard focus must produce the same layer highlighting as hover.
Provide a visually-hidden nested list of the component tree and each component's
reuse locations.

=== DO NOT ===
Do not animate layout properties - transform and opacity only.
Do not let ClubCard's shown props include a raw entity or a router import.
Do not remove the self-critical note about the variant count.
```

---

## PAGE 08 — 이 프로젝트의 범위 (벽의 빈 자리)

**개발 실체**: **프론트엔드 단독 프로젝트의 범위와 한계를 한 장 통째로 선언**
**연출 장치**: 포스터 월의 **절반이 빈 자리로 남아 있다** — 붙일 수 있었는데 안 붙인 게 아니라, 아직 못 붙인 것

```text
Build a PROJECT SCOPE section that states plainly what this project is and is not -
a frontend-only build with no backend integration - using a poster wall where half
the slots are still empty as the visual argument.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An exact statement of what was built
2. An exact statement of what was NOT built, without euphemism
3. Why the scope was drawn there
This page's value comes entirely from its honesty. Do not soften it.

=== MOOD ===
The fair after most people have left. Half the wall is full, half is bare board with
tape marks waiting. Calm, direct, unembarrassed.

=== COMPLIANCE ===
All club names are FICTIONAL. Do not imply real users or a production deployment.

=== DESIGN TOKENS (use exactly) ===
background #0d0816 | panel #170f26 | primary purple #c084fc | accent #d8b4fe
ok #4ade80 | warn #fbbf24 | empty rgba(255,255,255,0.14)
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
fonts: headings font-black, body sans leading-8, labels font-mono 12px
easing cubic-bezier(0.22,1,0.36,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1040px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE HALF-EMPTY WALL - full width, height ~520px
  Block C : the "why here" card
  Block D : the role statement (two columns)

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "07 · 이 프로젝트의 범위"

HEADING (28px font-black):
  VERBATIM: "벽의 절반은 아직 비어 있습니다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "포트폴리오에서는 프로젝트를 크게 보이게 만들 방법이 많습니다.
             그런데 면접에서 한 번만 물어보면 다 드러납니다.
             그래서 여기에 범위를 그대로 적어두기로 했습니다."

=== BLOCK B: THE HALF-EMPTY WALL (the defining idea) ===
Margin-top 44px. A container, height ~520px, rounded-md,
border 1px rgba(192,132,252,0.18), background #170f26, padding 26px,
with a faint board texture (an SVG turbulence filter at opacity 0.025).

A 6x2 GRID of 12 slots, gap 16px. Each slot is 3/4 aspect.

  SLOTS 1-6 (top row) - FILLED. Each is a poster in the project's normal style:
  a 4px purple top bar, a small generated motif, and a label. Labels VERBATIM:
    "동아리 탐색 화면"
    "필터와 재배치"
    "상세 · 모집 공고"
    "지원 흐름 · 보호 라우트"
    "마이페이지"
    "관리자 화면"
  Each has a small green check chip at its bottom-right, font-mono 9px #4ade80,
  VERBATIM: "완료"
  These posters have a slight ±2deg tilt and a shadow - they are physically there.

  SLOTS 7-12 (bottom row) - EMPTY. Each is a dashed outline
  (1px dashed rgba(255,255,255,0.14)), transparent background, with FOUR small tape
  marks at the corners (rgba(255,255,255,0.05)) - as if a poster was meant to go
  there. Centered inside each, a label in font-mono 11px rgba(255,255,255,0.42),
  and beneath it a font-mono 9px rgba(255,255,255,0.30) reason.
  Slots VERBATIM (label / reason):
    "백엔드 API"        / "미구현"
    "로그인 · 인증"      / "화면만 있음"
    "데이터베이스"       / "미구현"
    "실제 배포"         / "안 함"
    "실사용자 테스트"    / "안 함"
    "이미지 업로드"      / "미구현"
  These slots do NOT tilt and have NO shadow. The flatness is the point.

  A DIVIDER between the rows: a horizontal line, 1px rgba(192,132,252,0.20), with a
  centered tag on it, background #170f26, border 1px rgba(251,191,36,0.35),
  rounded, padding 5px 12px, font-mono 10px #fbbf24,
  VERBATIM: "여기까지 만들었습니다"

  A count readout at the container's bottom-right, font-mono 10px
  rgba(255,255,255,0.46), tabular-nums, VERBATIM: "완료 6 · 미완 6"

  HOVER a filled poster: it lifts 4px and straightens.
  HOVER an empty slot: its dashed border brightens to rgba(255,255,255,0.28) and a
  tooltip appears, font-mono 10px, background #0f0a1a,
  border 1px rgba(255,255,255,0.16), padding 6px 10px, with a one-line note.
  Tooltips VERBATIM, in slot order:
    "화면은 mock data로 동작합니다"
    "역할 전환은 프론트에서만 이뤄집니다"
    "새로고침하면 상태가 초기화됩니다"
    "로컬에서만 실행해봤습니다"
    "팀 내부에서만 확인했습니다"
    "이미지는 고정 에셋을 씁니다"

=== BLOCK C: THE "WHY HERE" CARD ===
Margin-top 44px, padding 24px, rounded-md, border 1px rgba(192,132,252,0.24),
background rgba(192,132,252,0.04), border-left 3px #c084fc.
  Label font-mono 11px letter-spacing 0.2em #c084fc, VERBATIM: "왜 여기서 멈췄나"
  Body, two paragraphs at 16px leading-9:
    P1 VERBATIM:
      "이 프로젝트에서 제가 맡은 건 프론트엔드였고, 팀에서 백엔드는 별도로 진행 중이었습니다.
       API가 나오기를 기다리는 대신 mock data로 화면 흐름을 전부 완성해뒀습니다."
    P2 VERBATIM:
      "덕분에 탐색부터 지원까지의 흐름과 필터·라우팅 문제를 먼저 다 겪었습니다.
       API가 붙는 순간 데이터 출처만 바꾸면 되도록 만들어두는 것까지가 이번 범위였습니다."
    Emphasize "데이터 출처만 바꾸면 되도록" in #d8b4fe, font-bold.

=== BLOCK D: THE ROLE STATEMENT ===
Margin-top 36px. Two columns, gap 16px (stack below 720px).
  LEFT card:  padding 20px, rounded-md, border 1px rgba(192,132,252,0.22),
              background rgba(192,132,252,0.04)
              label font-mono 10px letter-spacing 0.18em #c084fc,
              VERBATIM: "제가 한 일"
              A 4-item list, 15px leading-8, each prefixed "· ", VERBATIM:
                "동아리 탐색, 필터, 상세 페이지 구현"
                "모집 공고 조회와 지원 화면 구현"
                "마이페이지와 관리자 화면 구조 설계"
                "공통 컴포넌트와 라우팅 구조 정리"
  RIGHT card: padding 20px, rounded-md, border 1px rgba(255,255,255,0.14),
              background rgba(255,255,255,0.02)
              label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
              VERBATIM: "이 프로젝트로 증명되는 것 / 안 되는 것"
              Four lines, 15px leading-8:
                "○ 긴 사용자 흐름을 화면 단위로 설계할 수 있다"   (prefix #4ade80)
                "○ 브라우저 기본 동작(주소·뒤로가기·스크롤)을 다룰 수 있다" (prefix #4ade80)
                "✕ 서버 구현과 실제 권한 처리는 이 프로젝트로 보여지지 않는다"
                                                              (prefix rgba(255,255,255,0.40))
                "✕ 실사용자 규모에서의 동작은 확인된 바 없다"     (prefix rgba(255,255,255,0.40))

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  The wall container fades up
1.60s  The SIX filled posters get taped on, 0.11s apart, each dropping from 22px
       above with a small rotation overshoot and a dust puff
2.40s  The divider line draws left to right (0.5s); its tag fades in
2.90s  The SIX empty slots fade in, 0.07s apart, WITHOUT any movement - they simply
       become visible. The contrast in how the two rows arrive is the argument.
3.40s  The count readout fades in
Blocks C and D animate on their own viewport entry.

=== RESPONSIVE ===
< 900px: the wall becomes 3 columns x 4 rows (filled first, then empty) with the
divider between rows 2 and 3.
< 640px: 2 columns x 6 rows; slot labels 10px; the two role cards stack.

=== ACCESSIBILITY ===
prefers-reduced-motion: no drop-in, no dust puffs, no divider draw - everything
renders in place.
Empty slots must NOT be aria-hidden. Their text contrast must meet 4.5:1 - raise the
label opacity if it does not.
Filled and empty slots must be distinguishable without color: filled have a solid
border and a "완료" chip, empty have a dashed border and a reason label.
Provide a visually-hidden summary listing both groups explicitly.
Tooltips must also appear on keyboard focus, not only hover.

=== DO NOT ===
Do not soften any item in the empty row or move an item to the filled row.
Do not imply real users, a deployment, or backend integration.
Do not use real club names.
```

---

## PAGE 09 — 결과 · 화면 갤러리

**개발 실체**: 완성된 화면들 + 실제 구현 결과
**연출 장치**: 벽 전체에 조명이 들어오며 갤러리로 확장

```text
Build a RESULTS SECTION presenting finished screens as a gallery, framed as the
poster wall's lights coming fully up, for a campus club platform portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What was actually built, in screens
2. The concrete outcome stated without invented metrics
3. A restatement that this is a frontend build on mock data

=== MOOD ===
The fair at its best moment - lights up, wall full, people looking. Warm purple,
satisfied, unhurried.

=== COMPLIANCE ===
All club names in screenshots are FICTIONAL. No real personal data in any capture.

=== DESIGN TOKENS (use exactly) ===
background #120c1d (lifted from earlier sections) | panel #1c1330
primary purple #c084fc | accent #d8b4fe | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.22,1,0.36,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1140px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the gallery (6 items, asymmetric grid)
  Block C : the outcome stats
  Block D : the scope note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "08 · 결과"

HEADING (32px font-black):
  VERBATIM: "탐색부터 지원까지 한 서비스에서 끝난다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "조건으로 좁히고, 상세를 보고, 모집 공고를 확인하고, 지원까지 이어진다.
             조건은 주소에 남아서 공유되고, 목록으로 돌아오면 보던 자리다.
             동아리 정보 탐색부터 모집 지원까지 하나의 서비스에서 처리할 수 있는
             플랫폼 프론트엔드를 완성했습니다."

=== BLOCK B: THE GALLERY ===
An asymmetric grid, margin-top 48px:
  Row 1: one large item (2 columns) + one small item
  Row 2: three equal items
  Row 3: one wide item (full width)
Gap 16px. Below 900px -> single column.

Each item: background #1c1330, border 1px rgba(192,132,252,0.18), rounded-md,
overflow hidden.
  A 30px header strip with a font-mono 10px uppercase label on the left
  (rgba(255,255,255,0.48)) and a small purple dot on the right.
  Below it, the image area (aspect noted per item).
  A caption bar at the bottom, padding 12px 14px,
  border-top 1px rgba(192,132,252,0.10), font-mono 11px rgba(255,255,255,0.48).

ITEM 1 (large, aspect 16/10)  header VERBATIM "01 · 동아리 탐색"
  [IMG-07] the main browse screen with filters applied
  caption VERBATIM: "조건을 누르면 목록이 재배치된다"
ITEM 2 (small, aspect 9/16)   header VERBATIM "02 · 모바일 목록"
  [IMG-08] the mobile list view
  caption VERBATIM: "모바일에서는 2열"
ITEM 3 (aspect 16/10)         header VERBATIM "03 · 동아리 상세"
  [IMG-09] the club detail screen
  caption VERBATIM: "모달이 아니라 독립된 주소를 가진 화면"
ITEM 4 (aspect 16/10)         header VERBATIM "04 · 모집 공고"
  [IMG-10] the recruit posting screen
  caption VERBATIM: "마감일이 가장 먼저 보이도록"
ITEM 5 (aspect 16/10)         header VERBATIM "05 · 마이페이지"
  [IMG-11] the my-page screen with application status
  caption VERBATIM: "내가 지원한 것만 모아서"
ITEM 6 (wide, aspect 21/9)    header VERBATIM "06 · 관리자 화면"
  [IMG-12] the admin dashboard
  caption VERBATIM: "같은 데이터, 완전히 다른 화면"

IMAGE PLACEHOLDER SPEC (if no image is supplied): a CSS placeholder inside the
aspect box - background #0d0816, a faint 24px purple grid, and centered text in
font-mono 12px rgba(255,255,255,0.35) reading the slot name and ratio, e.g.
VERBATIM "[IMG-07] · 16:10"

HOVER: the item lifts 4px, its border goes to rgba(192,132,252,0.45), and the image
scales 1.03 inside its clipped frame. 0.35s. Click opens a lightbox
(overlay rgba(8,4,14,0.94), backdrop-blur(8px), image max-width 1240px, the caption
below it, Esc / overlay click closes, arrow keys move between items).

=== BLOCK C: THE OUTCOME STATS ===
Margin-top 56px. Four stat cells in a row, gap 14px (2x2 below 768px).
Each: padding 22px, rounded-md, border 1px rgba(192,132,252,0.22),
background rgba(192,132,252,0.04).
  value font-mono 32px font-black #c084fc tabular-nums
  label font-mono 11px rgba(255,255,255,0.48), margin-top 6px
  Cell 1  value VERBATIM "6"     label VERBATIM "핵심 화면"
  Cell 2  value VERBATIM "5종"   label VERBATIM "공통 컴포넌트"
  Cell 3  value VERBATIM "17곳"  label VERBATIM "컴포넌트 재사용"
  Cell 4  value VERBATIM "3종"   label VERBATIM "복구한 브라우저 동작"
Values count up over 0.8s on entry.

=== BLOCK D: THE SCOPE NOTE (required) ===
Margin-top 28px. A strip: padding 16px 20px, rounded-md,
border 1px rgba(251,191,36,0.28), background rgba(251,191,36,0.05).
  font-mono 11px #fbbf24, VERBATIM:
  "이 프로젝트는 백엔드 연동 전의 프론트엔드 구현입니다.
   화면의 모든 동아리와 지원자는 가상이며, 실제 사용자 데이터는 없습니다."

Then, margin-top 14px, a slim numbers note: padding 14px 18px, rounded-md,
border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02).
  font-mono 11px rgba(255,255,255,0.45), VERBATIM:
  "위 숫자는 구현 범위를 센 것입니다. 이용자 수나 지원 건수 같은 지표는 없습니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The page background lifts #0d0816 -> #120c1d over 1.2s, and two soft purple
       spotlights brighten from 30% to 100% over the same window - the wall's lights
       coming up
0.10s  Label, heading word by word at 0.25s
0.80s  Paragraph
1.30s  Gallery items fade up 0.09s apart (y 20px -> 0, 0.6s)
2.30s  Stat cells fade up 0.09s apart, values counting
2.90s  Scope note, then the numbers note at 3.10s

=== RESPONSIVE ===
< 900px: single-column gallery; the 9/16 item is capped at 420px height and centered.
< 768px: stat cells 2x2; heading 24px.

=== ACCESSIBILITY ===
prefers-reduced-motion: no count-up, no hover scale, no background/spotlight
transition.
Every gallery item is a real <button> opening the lightbox with a visible focus ring
(2px #c084fc, offset 2px). Each image needs a descriptive Korean alt text derived
from its caption. The lightbox traps focus while open and returns focus to the
triggering item on close.
The scope note must be in normal document order.

=== DO NOT ===
Do not invent user counts, application counts, or engagement metrics.
Do not use real club names or real personal data in any capture.
Do not remove the scope note.
Do not add confetti.
```

---

## PAGE 10 — 회고 · 다음 단계 · 퇴장

**개발 실체**: KPT 회고 (PROBLEM 포함) + 다음 단계 + GitHub
**연출 장치**: 박람회 종료 → 포스터가 한 장씩 떨어지며 퇴장

```text
Build the CLOSING SECTION of a campus club platform portfolio page: a KPT
retrospective, next steps, a repository link, and an exit transition where the
posters fall off the wall one by one as the fair closes.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An honest retrospective including real problems, not just wins
2. Concrete next steps
3. The repository link
4. A clean exit back to the village

=== MOOD ===
End of the fair. Lights dimming, people packing up, tape peeling.
Tired, satisfied, honest. No triumphalism.

=== DESIGN TOKENS (use exactly) ===
background #120c1d | panel #1c1330 | primary purple #c084fc | accent #d8b4fe
keep #4ade80 | problem #f87171 | try #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.22,1,0.36,1) settling, cubic-bezier(0.4,0,1,1) falling
rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 960px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : KPT, three columns
  Block C : next steps card
  Block D : GitHub link
  Block E : exit button + exit transition

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "09 · 회고"

HEADING (30px font-black):
  VERBATIM: "기능을 만드는 것보다 브라우저를 되찾는 데 시간을 더 썼다"

PARAGRAPH (16px leading-9, max-width 720px, margin-top 20px):
  VERBATIM: "필터도 목록도 상세도 하루면 만들었습니다.
             그런데 뒤로가기, 공유, 스크롤 위치 같은 것들을 제대로 돌려놓는 데
             그보다 훨씬 오래 걸렸고, 배운 것도 그쪽이 훨씬 많았습니다."

=== BLOCK B: KPT ===
Margin-top 52px. Three columns, gap 16px (single column below 768px).
Each column: padding 22px, rounded-md, background #1c1330,
border 1px rgba(255,255,255,0.10), with a 3px top border in its own color.
Header: font-mono 11px letter-spacing 0.2em, uppercase.
Items: 15px leading-8, each prefixed "· ", 14px apart.

COLUMN 1 - header VERBATIM "KEEP", color #4ade80, top border #4ade80. Items VERBATIM:
  "필터 상태를 주소에서 파생시킨 것"
  "상세를 모달이 아니라 라우트로 만든 것"
  "컴포넌트가 라우터를 모르게 유지한 것"

COLUMN 2 - header VERBATIM "PROBLEM", color #f87171, top border #f87171. Items VERBATIM:
  "뒤로가기 문제를 사용자가 말해주기 전까지 몰랐다"
  "스크롤 복원을 처음엔 잘못된 시점에 넣어서 두 번 고쳤다"
  "테스트 코드가 하나도 없다"

COLUMN 3 - header VERBATIM "TRY", color #fbbf24, top border #fbbf24. Items VERBATIM:
  "백엔드 API 연동과 실제 배포"
  "핵심 흐름(탐색→지원)에 E2E 테스트 붙이기"
  "실제 학생 5명에게 조건 필터를 써보게 하기"

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), top border
grows 3px -> 4px. 0.3s.

=== BLOCK C: NEXT STEPS CARD ===
Margin-top 48px, padding 22px, rounded-md, border 1px rgba(192,132,252,0.22),
background rgba(192,132,252,0.04), border-left 3px #c084fc.
  Label font-mono 11px letter-spacing 0.2em #c084fc, VERBATIM: "다음 단계"
  Body 16px leading-8, margin-top 12px, VERBATIM:
  "백엔드 API 연동과 실제 배포를 진행할 예정입니다.
   붙이는 순간 데이터 출처만 바꾸면 되도록 mock 계층을 분리해뒀습니다."

=== BLOCK D: GITHUB LINK ===
Margin-top 40px. A single primary link button:
  background #c084fc, color #0d0816, font-mono 14px font-black,
  padding 14px 28px, rounded-md.
  Label VERBATIM: "GitHub 저장소 ↗"
  Hover: scale 1.04, box-shadow 0 0 28px rgba(192,132,252,0.36). Active: scale 0.97.
  href https://github.com/aClub2026/FE, target _blank, rel noreferrer.

=== BLOCK E: EXIT BUTTON + EXIT TRANSITION ===
Margin-top 72px. A full-width button, height 88px, rounded-md,
border 1px rgba(255,255,255,0.14), background transparent.
  Label centered, font-mono 15px, letter-spacing 0.1em, rgba(255,255,255,0.62),
  VERBATIM: "← 마을로 돌아가기"
  Hover: border -> rgba(192,132,252,0.45), label -> #c084fc, and a faint purple
  spotlight glow appears behind it. 0.4s.

EXIT TRANSITION (on click of this button OR the header's "← 마을로"):
  t=0.00s  Content fades to opacity 0 over 0.3s
  t=0.25s  A poster wall reappears across the viewport (a 6x4 arrangement of the
           same poster shapes), fully lit
  t=0.45s  The posters FALL OFF one at a time, 0.05s apart in a randomized order:
           each rotates 8-18deg, translates downward past the bottom edge over
           0.5s with the falling easing, and fades. Their tape strips peel first
           (scaling to 0 width over 0.1s) just before each poster drops.
  t=1.60s  Bare board remains for 0.25s - just tape marks on an empty wall
  t=1.85s  The spotlights fade out over 0.35s; the background settles to #0d0816
  t=2.30s  Emit an onExit callback so the parent can restore the 3D village scene.
  Body scroll locks during the transition; the parent releases it.
  Cap the simultaneous falling posters at 24 and use transform/opacity only.
  No flash at any point.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  KPT columns fade up left to right 0.12s apart, items inside 0.06s apart
2.20s  Next steps card slides in from the left (x -12px -> 0)
2.60s  GitHub button fades in
2.90s  Exit button fades in with its border drawing from the center outward
       (0% -> 100% width, 0.7s)

=== RESPONSIVE ===
< 768px: KPT single column; heading 24px; exit button height 72px, label 14px;
GitHub button full width; the exit transition's wall becomes 4x3.

=== ACCESSIBILITY ===
prefers-reduced-motion: all reveals instant; the exit transition becomes a plain
0.3s fade to black with no falling posters.
The exit button must be a real <button>, keyboard focusable, with a visible focus
ring (2px #c084fc, offset 2px).

=== DO NOT ===
Do not soften the PROBLEM column - the honesty is the point.
Do not add confetti or celebration copy.
Do not animate more than 24 posters at once during the exit.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-1. 개발 실체 커버리지 점검

| 항목                    | 어디에                                                                                                             | 형태                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| **왜 만들었나**         | P00                                                                                                                | 포스터 조립 직후 첫 문장 (4초 안에)        |
| **데모 영상**           | P01 포스터 A                                                                                                       | 벽에 붙은 포스터                           |
| **GitHub**              | P01 포스터 B · P10 버튼                                                                                            | 포스터 + 마무리 버튼                       |
| **관람객 직접 조작**    | **P02(필터·FLIP) · P03(뒤로가기·주소창) · P04(4화면 흐름) · P05(스크롤 복원) · P06(역할 전환) · P07(분해/조립)**   | **6곳 — 10개 방 중 최다**                  |
| **코드**                | P02(필터 파이프라인) · P03(Before/After URL) · P04(routes+RequireAuth) · P05(스크롤 복원 훅) · P07(ClubCard props) | **총 6개**                                 |
| **트러블슈팅**          | P03 (주소 미동기화) · P05 (스크롤 소실)                                                                            | **전체 프로세스 2건 + 각각 2차 문제 포함** |
| **설계 의사결정**       | P02(왜 애니메이션) · P04(모달 vs 라우트) · P07(컴포넌트 경계)                                                      | 근거 카드                                  |
| **역할 분리 + 그 한계** | P06                                                                                                                | "화면 분리이지 권한 제어가 아니다"         |
| **범위·한계**           | **P08 한 장 통째로**                                                                                               | 완료 6 · 미완 6                            |
| **결과물**              | P09                                                                                                                | 갤러리 **6장**                             |
| **회고**                | P10                                                                                                                | KPT (PROBLEM 3개)                          |

## D-2. 새로 만들 파일

```
src/components/ui/project-viewers/stages/aclub/
  index.tsx                 ← PAGE 00~10 순서, 전역 필터 카운터 소유
  clubs.ts                  ← ⭐ 가상 동아리 24개 데이터 (P00·P01·P02·P03·P05 공용)
  usePosterWall.ts          ← ⭐ FLIP 재배치 엔진 (P00·P01·P02·P08·P10 공용)
  PosterCard.tsx            ← ⭐ 카드 1종 + variant 4개 (P07이 이걸 분해해서 보여줌)
  FairEntrance.tsx          ← P00
  PosterWallHero.tsx        ← P01 · 포스터 3장 = 링크
  FilterWall.tsx            ← P02 · 필터 + FLIP + 코드 4단계 하이라이트
  BrowserSimulator.tsx      ← P03 · 가짜 주소창 + 히스토리 스택
  FlowDevice.tsx            ← P04 · 4화면 + 라우트맵 + 보호 라우트
  ScrollRestoreCase.tsx     ← P05 · 컨테이너 내부 스크롤 재현
  RoleMorphCard.tsx         ← P06 · 3D 플립 + 화면 비교
  ExplodedPoster.tsx        ← P07 · 5레이어 분해 + variant 연동
  ScopeWall.tsx             ← P08 · 절반 빈 벽
  copy.ts                   ← 모든 한국어 문구
  assets.ts                 ← [IMG-01~12] · [VIDEO-01]
```

> ⭐ **선행 3종을 먼저 만들 것.** > `clubs.ts`(가상 데이터 24개) → `PosterCard.tsx`(variant 4개) → `usePosterWall.ts`(FLIP).
> 이 셋이 없으면 P00·P01·P02·P03·P05·P07·P08·P10 **8개 페이지를 각각 다시 짜게 됩니다.**
> 특히 `PosterCard` 는 P07이 **자기 자신을 분해해서 설명하는 대상**이라 구조가 곧 콘텐츠입니다.

## D-3. 기존 코드 재사용 / 선행 작업

재사용: `CodeBlock`, `ImageSlot`, `MockScreen`, `CountUp`, `RevealText` (`shared.tsx`)

> ⚠️ **선행 작업 (10개 프로젝트 공통 1건)**: `shared.tsx` 의 `DecisionTable`,
> `ArchDiagram`, `CompareBars`, `ProcessTimeline`, `QuoteCard`, `TldrBanner`,
> `BeforeAfter`, `ChallengeCard` 가 현재 **모듈 내부 함수(비export)** 입니다.
> stage 폴더에서 쓰려면 export로 승격해야 합니다.
> ACLUB은 표가 많아 `DecisionTable` 승격 우선 (P03·P06·P07 전부 사용).

## D-4. 버릴 것

- `[KILL]` `PlatformProjectViewer` 의 aclub 분기 → stage 폴더로 이전
- `[KILL]` aclub의 기존 `SIGNATURE` 데모 → P02 `FilterWall` 로 흡수

## D-5. 미디어 확보 목록 (총 12슬롯 — 10개 방 중 최다)

| 슬롯         | 내용                                               | 비율  | 우선도   | 비고              |
| ------------ | -------------------------------------------------- | ----- | -------- | ----------------- |
| `[VIDEO-01]` | 필터→재배치→상세→뒤로가기 유지→모집공고 (1분 54초) | 16/9  | 높음     | P01               |
| `[IMG-01]`   | **주소창에 조건 쿼리가 보이는 캡처**               | 21/9  | **최상** | P03 · 트러블 증거 |
| `[IMG-02]`   | 동아리 상세 화면 (모바일)                          | 9/16  | 높음     | P04               |
| `[IMG-03]`   | 모집 공고 화면 (모바일)                            | 9/16  | 높음     | P04               |
| `[IMG-04]`   | **복원 직후 목록** (직전 항목 강조된 상태)         | 21/9  | **최상** | P05 · 트러블 증거 |
| `[IMG-05]`   | 학생 화면                                          | 16/10 | 중간     | P06               |
| `[IMG-06]`   | 관리자 화면                                        | 16/10 | 높음     | P06               |
| `[IMG-07]`   | 탐색 화면 (필터 적용 상태)                         | 16/10 | **최상** | P09               |
| `[IMG-08]`   | 모바일 목록                                        | 9/16  | 중간     | P09               |
| `[IMG-09]`   | 동아리 상세                                        | 16/10 | 높음     | P09               |
| `[IMG-10]`   | 모집 공고                                          | 16/10 | 중간     | P09               |
| `[IMG-11]`   | 마이페이지 (지원 현황)                             | 16/10 | 중간     | P09               |
| `[IMG-12]`   | 관리자 대시보드                                    | 21/9  | 높음     | P09               |

> 🔴 **캡처 시 필수 처리**: 실존 동아리명·학생 이름·연락처가 화면에 있으면
> **가상 데이터로 교체 후 재캡처**. 이 방 전체가 "실존 정보 0개" 원칙 위에 서 있습니다.
> `[IMG-01]` `[IMG-04]` 는 **주소창·스크롤 위치가 보여야** 증거로 기능합니다.
> 카드 내부 `[IMG-SLOT]` (포스터 커버)은 없으면 CSS 모티프로 폴백되므로 후순위.

## D-6. 코드 스니펫 확보 목록 (전부 실제 저장소에서)

| 페이지 | 파일                         | 줄  | 하이라이트                            |
| ------ | ---------------------------- | --- | ------------------------------------- |
| P02    | `useClubFilter.ts`           | 28  | (1)~(4) 4구간 · 안정 정렬 tiebreaker  |
| P03    | `ClubListPage.tsx (before)`  | 12  | 로컬 state 초기화                     |
| P03    | `useFilterParams.ts (after)` | 20  | 파라미터 파생 · push/replace 판단     |
| P04    | `routes.tsx`                 | 20  | RequireAuth · 시도한 위치 전달        |
| P05    | `useScrollRestore.ts`        | 22  | 모듈 레벨 맵 · scrollHeight 준비 검사 |
| P07    | `ClubCard.tsx`               | 24  | 뷰모델 props · variant 유니온         |

## D-7. 안전장치 대조표

이 방은 **제어권을 뺏지 않습니다.** 6개 인터랙션 전부 관람객이 직접 누릅니다.

| 페이지 | 장치                | 안전장치                                                 |
| ------ | ------------------- | -------------------------------------------------------- |
| P02    | 필터 + FLIP         | 뷰포트 밖이면 애니메이션 생략 · 동시 24개 상한           |
| P03    | 가짜 브라우저       | **실제 히스토리/URL 조작 없음** · 되돌리기 상시          |
| P04    | 4화면 흐름          | **실제 URL 변경 없음** · 지원 폼 입력 수집 안 함         |
| P05    | 스크롤 재현         | **컨테이너 내부 스크롤만** · 페이지 스크롤 하이재킹 금지 |
| P06    | 역할 전환 자동 시연 | 관람객 미조작 시 1회만                                   |
| P07    | 분해 자동 시연      | 관람객 미조작 시 1회만                                   |

## D-8. 최종 체크리스트

- [ ] **실존 동아리명 · 학생 이름 · 연락처가 0개인지** (스크린샷 포함)
- [ ] 선행 3종(`clubs.ts` → `PosterCard.tsx` → `usePosterWall.ts`)을 **먼저** 만들었는지
- [ ] P02 FLIP이 **`transform`/`opacity` 만** 쓰는지 (`left/top/width/height` 금지)
- [ ] P02 FLIP 측정이 **읽기 일괄 → 쓰기 일괄** 순서인지 (레이아웃 스래싱 방지)
- [ ] P02 **동시 애니메이션 24개 이하**인지
- [ ] P02 남는 카드가 **페이드가 아니라 이동**하는지 (연속성이 핵심)
- [ ] P02 **빈 상태(empty state)** 와 "마지막 조건 해제" 버튼이 있는지
- [ ] P03 **실제 브라우저 히스토리/URL을 건드리지 않는지**
- [ ] P03 **히스토리 폭주 2차 문제** 서술이 남아 있는지 (수정에도 튜닝이 필요했다는 증거)
- [ ] P04 지원 폼이 **아무 입력도 수집·저장·표시하지 않는지**
- [ ] P04 **로그인 후 원위치 복귀**가 구현됐는지 (보호 라우트의 핵심)
- [ ] P05 스크롤이 **컨테이너 내부에서만** 일어나는지 · 페이지 스크롤 하이재킹 없는지
- [ ] P05 복원이 **부드러운 스크롤이 아니라 즉시**인지
- [ ] P05 **실패한 시도 카드**가 남아 있는지
- [ ] P06 **"화면 분리이지 권한 제어가 아니다" 카드**가 남아 있는지 — 삭제 금지
- [ ] P06 역할별 제거 콘텐츠가 **DOM에서 실제로 제거**되는지 (숨김 아님)
- [ ] P07 **variant 4개가 아슬아슬하다는 자기비판 노트**가 남아 있는지
- [ ] **P08 "미완 6개"가 그대로 남아 있는지** — 이 방의 신뢰도가 여기 걸림
- [ ] P08 빈 슬롯이 `aria-hidden` 이 **아닌지**, 대비 4.5:1 을 넘는지
- [ ] P09 **"백엔드 연동 전" 고지**가 남아 있는지
- [ ] 모든 자동 시연이 **관람객 조작 시 영구 중단**되는지
- [ ] 숫자 전부 `tabular-nums`
- [ ] 이 방은 **무음** — 사운드 토글 자체를 두지 않았는지
- [ ] 지어낸 수치 0개 — 이용자 수·지원 건수 주장 금지
