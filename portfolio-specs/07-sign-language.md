# 07. 수어지구 — 프롬프트 팩

> 수어 아바타를 활용한 학습 및 표현 서비스 · Spring Boot / Firebase / React / TypeScript / 3D Avatar
> **사용법**: `PAGE 00` ~ `PAGE 10` 의 코드블록을 **하나씩 통째로 복사해서 Variant에 붙여넣으세요.**
> 각 프롬프트는 **완전히 자립적**입니다 (색상·폰트·무드가 매번 반복 포함).
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.

> 🔴 **이 방은 다른 9개와 윤리 기준이 다릅니다. 먼저 읽고 시작하세요.**
> 1. **담당은 백엔드입니다.** 3D 아바타는 팀원 작업입니다. P07에서 소유권을 명확히 밝힙니다.
> 2. **장애 체험(simulation) 연출을 하지 않습니다.** "소리를 뺏어서 청각장애를 느껴보게 하는" 방식은
>    당사자 커뮤니티에서 오래 비판받아온 접근입니다. 대신 **"이 서비스는 애초에 소리에 의존하지 않게 설계했다"**
>    는 **설계 사실**로 갑니다. 뺏는 게 아니라, 원래 없는 것입니다.
> 3. **수어는 언어입니다.** 한국수어(KSL)는 한국어의 손동작 번역이 아니라 독립된 문법을 가진 언어입니다.
>    이 문서 전체가 그 전제 위에 있고, P03이 그걸 정면으로 다룹니다.
> 4. **검증받지 않았습니다.** 농인 당사자나 수어 전문가에게 감수받은 적이 없습니다. P08에서 그대로 밝힙니다.

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 방의 한 문장

**"소리가 없는 갤러리. 처음부터 없었기 때문에, 아무것도 아쉽지 않다."**

## A-2. 왜 이 메타포인가

수어지구는 **정보가 소리를 거치지 않고 전달되는 서비스**다.
동작을 보고 뜻을 알고, 뜻을 입력하면 동작이 나온다. 그 사이에 소리가 낄 자리가 없다.

그래서 이 방은 **무음이다.** 사운드 토글 자체를 두지 않는다.
하지만 그건 관람객에게서 소리를 **뺏는** 연출이 아니다.
이 서비스가 원래 소리를 쓰지 않기 때문에, 이 방도 쓰지 않는 것이다.

대신 이 방은 **손을 본다.** 화면 어디에나 손 모양이 있고, 관람객이 재생 버튼을 누르면 손이 움직인다.
그리고 그 움직임이 **어떤 데이터 구조에서 나온 것인지**가 바로 옆에 있다.
백엔드 담당이 만든 것은 아바타가 아니라 **그 아바타를 움직이게 하는 데이터와 판정 로직**이었다.

## A-3. ⭐ 가장 중요한 원칙 — 연출은 개발 내용의 운반 수단이다

**모든 연출은 반드시 개발 실체를 하나 이상 전달해야 한다.** 멋있기만 한 연출은 넣지 않는다.

| 전달할 개발 실체 | 그걸 실어나르는 연출 | 페이지 |
|---|---|---|
| 왜 이걸 만들었나 (동기) | 어두운 갤러리에 조명이 들어오며 손 하나가 움직이는 진입 시퀀스 | 00 |
| 데모 영상 · GitHub | **갤러리 벽에 걸린 액자 3점** | 01 |
| **동작을 데이터로 어떻게 표현했나** | **관람객이 SVG 손 플레이어를 직접 재생·일시정지·프레임 이동** → 그 순간 재생 중인 키프레임이 JSON에서 빛남 | 02 |
| **수어는 한국어 어순이 아니다** | **같은 문장을 「한국어 순서」와 「수어 순서」로 나란히 재생** → 순서가 다르다는 게 눈에 보임 | 03 |
| **트러블 01: 「감사합니다」와 「고맙습니다」를 다르게 판정했다** | 관람객이 직접 정답을 입력해보고 **틀렸다고 나온다** → 동의어 판정 설계 | 04 |
| 반복 학습 루프 설계 | 관람객이 퀴즈 3문제를 실제로 풀고, **틀린 게 다시 나온다** | 05 |
| **트러블 02: 동작이 뚝뚝 끊겨 보였다** | 관람객이 「전환 프레임 없음」 토글을 켜면 **손이 실제로 끊겨 움직인다** → 응답 구조 수정 | 06 |
| 백엔드 구조 · **내 담당과 팀원 담당** | 요청 경로를 따라가며 아바타 렌더링 구간만 다른 색으로 표시 | 07 |
| **이 프로젝트의 윤리적 한계** | 갤러리 마지막 벽 한 면 전체를 **검증받지 못한 것**에 할애 | 08 |
| 결과물 · 화면 갤러리 | 갤러리 전체 조명 점등 | 09 |
| 회고 · 다음 단계 | 조명 소등 → 손이 마지막으로 인사하고 퇴장 | 10 |

## A-4. 설계 결정 ↔ 웹 재현 대응

| 서비스에서 내린 결정 | 이 웹페이지에서의 재현 |
|---|---|
| 정보를 소리로 전달하지 않는다 | **이 방은 무음이고, 사운드 토글 자체가 없다** |
| 동작은 연속된 키프레임이다 | **손 플레이어에 프레임 스크러버가 있다** |
| 수어 어순은 한국어 어순과 다르다 | **두 순서를 나란히 재생해 비교한다** |
| 같은 뜻의 여러 표현을 인정한다 | **관람객이 다른 표현을 입력해도 정답 처리된다 (수정 후)** |

## A-5. 관람 곡선 (감정 + 정보 밀도)

```
집중  ────╮ P02~03 언어 구조 (가장 밀도 높음)
          ╰──╮  ╭─╮ P04 오판정   ╭─╮ P06 끊김
 P00~01        ╰──╯ ╰────────────╯ ╰──╮
 갤러리 입장                              ╰──── P08~10 한계 · 정리
정보  낮 ────╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲──────
          P02~07 개발 밀도 최고조
조명  ◔ ── ◑ ── ◕ ── ● ── ● ── ○
```

**핵심 장치**: 헤더에 **`손동작 0 / 12`** 카운터가 있다.
관람객이 재생한 수어 동작의 수를 센다. 진행바가 아니라 **얼마나 봤는지**의 표시다.
12개를 다 보면 마지막 섹션에서 조용히 언급된다.

## A-6. 명장면 3개

**① PAGE 02 — 손이 데이터가 되는 순간**
관람객이 재생 버튼을 누르면 SVG 손이 움직인다. 일시정지하고 스크러버를 끌면
**오른쪽 JSON에서 그 프레임의 객체가 정확히 하이라이트된다.**
손을 특정 위치로 옮기면 그 위치값이 코드에서 파란색으로 바뀐다.

**② PAGE 03 — 어순이 다르다**
`"내일 학교에 갑니다"` 를 두 줄로 나란히 재생한다.
위쪽은 한국어 어순대로, 아래쪽은 수어 어순대로.
**두 손이 다른 순서로 움직인다.** 그리고 문장이 뜬다:
*"수어는 한국어를 손으로 옮긴 게 아닙니다. 문법이 다른 언어입니다."*

**③ PAGE 06 — 끊기는 손**
`전환 프레임 없음` 토글을 켜면 손이 **뚝뚝 끊겨 순간이동한다.**
뜨는 문장: *"동작 데이터는 맞았습니다. 사이를 안 채워 보낸 게 문제였습니다."*

## A-7. 다른 9개 방과의 차별점

| 축 | 수어지구 | 나머지 |
|---|---|---|
| 소리 | **사운드 토글 자체가 없음** | 있거나 무음 명시 |
| 주제 | **언어 데이터 구조** | 기능·성능·배포 |
| 담당 | **백엔드 (아바타는 팀원)** | 대체로 프론트 또는 풀스택 |
| 윤리 섹션 | **한 페이지 통째로 (P08)** | 카드 단위 |
| 색 | 차분한 하늘색 · 갤러리 조명 | 각자 |

## A-8. 절대 금지 (안전 규칙) — 이 방에서 가장 중요한 항목

- **장애 체험 연출 금지.** 소리를 뺏거나, 화면을 가리거나, "이게 그들의 세계입니다" 류의 연출 금지.
  이 방이 무음인 것은 **서비스가 소리를 안 쓰기 때문**이지 체험을 시키기 위해서가 아니다
- **수어를 장식·이펙트로 쓰지 않는다.** 손 모양이 배경 패턴이나 로딩 애니메이션으로 등장하지 않는다.
  모든 손동작은 **실제 뜻이 있는 동작**이고 그 뜻이 반드시 병기된다
- **"수어를 배우면 착한 사람" 류의 감동 서사 금지.** 시혜적 표현, "따뜻한 기술", "소외된 이웃" 금지
- **정확성 주장 금지.** 이 서비스의 수어 표현이 정확하다고 주장하지 않는다.
  **P08에서 감수받지 않았음을 명시**하고, 그게 이 방의 마무리다
- 실존 농인·수어 통역사·단체의 이름·이미지 사용 금지
- 손 그래픽은 **중립적인 실루엣**. 특정 인종·성별·연령을 나타내지 않는다
- **소리 없음. 사운드 토글 자체를 두지 않는다** (다른 방과 달리 토글도 없음)

---

# B. 공통 디자인 토큰 (참고용 — 각 프롬프트에 이미 포함됨)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#060d18` → `#0a1422` (P09부터) | 페이지 배경 |
| `--panel` | `#0d1a2b` | 액자 · 카드 |
| `--primary` | `#7eb8ff` | 하늘색 · 강조 |
| `--accent` | `#bfdbfe` | 보조 강조 |
| `--hand` | `#dbeafe` | 손 실루엣 (밝게, 항상 잘 보이게) |
| `--ok` / `--bad` / `--warn` | `#4ade80` / `#f87171` / `#fbbf24` | 정답 / 오답 / 주의 |
| `--text` | `rgba(255,255,255,0.88)` | 본문 |
| `--muted` | `rgba(255,255,255,0.46)` | 캡션 |
| `--frame` | `rgba(126,184,255,0.20)` | 액자 테두리 |
| 코드 패널 | bg `#081220`, border `rgba(126,184,255,0.18)` | |
| 문법 색 | 주석 `#4a6b8a` / 문자열 `#a3e635` / 키워드 `#7eb8ff` / 숫자 `#fbbf24` | |
| 이징 | `cubic-bezier(0.4,0,0.2,1)`, 0.3~0.8s | 부드럽고 조용하게 |
| 숫자 | 전부 `tabular-nums` | |

---

# C. 페이지별 프롬프트

---

## PAGE 00 — 갤러리에 불이 켜진다 (진입 시퀀스)

**개발 실체**: 왜 이걸 만들었는가 (동기)
**연출 장치**: 어두운 갤러리 → 조명 하나가 켜지고 그 아래 손이 한 동작을 한다

```text
Build a full-screen cinematic ENTRY SEQUENCE for a sign-language learning service
portfolio page, where a single gallery light comes on above a hand that performs one
sign. Stack: React + TypeScript + Tailwind CSS + framer-motion. Single
self-contained component. Draw the hand in SVG.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
Why this project was built. The final readable line must state the developer's
motivation, within 4 seconds.

=== MOOD ===
A quiet gallery before opening. Cool blue-grey walls, one warm-white spot lamp,
polished floor. Calm, respectful, unhurried. NOT sentimental. NOT inspirational.
NOT a charity campaign.

=== ETHICS (binding on every page of this project) ===
- Never simulate disability. This page is silent because the SERVICE does not use
  sound, not to make the viewer "experience" deafness. Do not say or imply otherwise.
- Sign language is a language with its own grammar, not a hand-translation of
  spoken Korean.
- Never use pity framing, "warm technology", "reaching out to the marginalized", or
  any inspirational disability narrative.
- Every hand pose shown must correspond to a real intended meaning, and that meaning
  must be labeled. Hands are never decoration, never a loading spinner, never a
  background pattern.
- The hand silhouette is neutral: no skin tone, no gender, no age markers.

=== DESIGN TOKENS (use exactly) ===
background #060d18 | panel #0d1a2b | primary #7eb8ff | accent #bfdbfe
hand #dbeafe | ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
frame rgba(126,184,255,0.20)
fonts: headings font-black, body sans leading-8, ALL labels/counters font-mono
easing cubic-bezier(0.4,0,0.2,1), durations 0.3s-0.9s | rounded-md
ALL numbers tabular-nums

=== LAYOUT ===
Full viewport, position fixed, above page content.
Background: #060d18. A faint floor line across the lower third
(1px rgba(126,184,255,0.08)) and a subtle wall gradient.
Centered: a spot-lit area, roughly 420x420px, where the hand appears.

=== ENTRY TIMELINE (follow exactly) ===
t=0.00s  Total darkness. Silence - and there is no sound control anywhere on this
         page, by design.
t=0.40s  A GALLERY SPOT LAMP fades on: a soft warm-white elliptical gradient
         (rgba(219,234,254,0.10), 420px wide) descending from above, ramping over
         0.7s. No flicker.
t=1.10s  A HAND appears within the light: an SVG silhouette in #dbeafe, viewed from
         the front, resting in a neutral position. Simple, geometric, with clearly
         articulated fingers - readable at small sizes, no realistic rendering, no
         skin texture.
t=1.50s  THE HAND PERFORMS ONE SIGN over 1.4s, moving through 5 keyframes with
         smooth interpolation. The sign is a greeting.
         A LABEL sits beneath the hand throughout, font-mono 13px #bfdbfe,
         VERBATIM: "안녕하세요"
         and below it, smaller, font-mono 10px rgba(255,255,255,0.46), VERBATIM:
         "지금 이 손이 하고 있는 말입니다"
         The label is mandatory - a hand without its meaning is decoration, and this
         project does not do that.
t=3.00s  The hand settles and dims to 55%. The lamp widens to light the text below.
t=3.10s  TITLE:
           Line 1, VERBATIM: "수어지구"
             54px font-black, #7eb8ff, letter-spacing -0.02em
           Line 2, VERBATIM: "수어 학습·표현 서비스 · Spring Boot 백엔드"
             13px font-mono, rgba(255,255,255,0.46), letter-spacing 0.14em,
             margin-top 12px
t=3.50s  THE MOTIVATION LINE fades in. This is the substance of this page.
         17px, leading-9, rgba(255,255,255,0.88), max-width 560px, centered.
         Korean copy, VERBATIM:
         "수어를 배워보려고 검색했더니, 단어 사진이 나열된 페이지가 대부분이었다.
          수어는 정지된 손 모양이 아니라 움직임인데,
          그 움직임을 보고 따라 할 수 있는 도구가 잘 없었다."
         Reveal word by word, stagger 0.035s, y 6px -> 0.
t=4.60s  A counter chip appears at the top-right, font-mono 12px
         rgba(255,255,255,0.46), tabular-nums, VERBATIM: "손동작 1 / 12"
         (it starts at 1 because the viewer just saw one)
         This counter persists into the fixed header for the rest of the page and
         counts how many signs the viewer has played.
t=5.00s  Scroll hint at the bottom, font-mono 12px rgba(255,255,255,0.46),
         VERBATIM: "↓ 갤러리로"
         with a soft blue chevron drifting 4px on a 2.2s cycle.

=== NO SOUND CONTROL (deliberate) ===
Unlike other pages in this portfolio, this page has NO sound toggle at all - not
even a muted one. Nothing on this page produces sound. Do not add an audio control,
and do not add a note explaining the absence in a way that frames silence as a
deprivation. It is simply not part of this service.

=== ESCAPE HATCHES (required) ===
Any click, scroll, keypress, or Escape skips to the t=5.00s end state instantly.
A skip control from t=0.50s at the bottom-right, font-mono 11px,
rgba(255,255,255,0.35), VERBATIM: "[ 건너뛰기 ]"

=== ACCESSIBILITY ===
prefers-reduced-motion: no lamp ramp, no hand animation. Render the hand in its
final pose with its label, plus the title and motivation line, immediately.
The hand animation must have a text equivalent available to screen readers:
a visually-hidden line, VERBATIM:
  "손이 「안녕하세요」에 해당하는 수어 동작을 수행합니다."
All text is real DOM text.

=== RESPONSIVE ===
< 768px: spot area 300x300px, title 34px, motivation line 15px.

=== DO NOT ===
Do not use the hand as a decorative motif, a loading indicator, or a background
pattern anywhere.
Do not show a hand pose without its meaning label.
Do not use pity, inspiration, or charity framing.
Do not add a sound control.
Do not delay the motivation line past 4.0s.
```

---

## PAGE 01 — 히어로 · 갤러리 벽

**개발 실체**: 프로젝트 정체 + **데모 영상 · GitHub · 담당 범위**
**연출 장치**: 링크가 버튼이 아니라 **갤러리 벽에 걸린 액자 3점** — 각 액자에 조명이 따로 있다

```text
Build the HERO SECTION of a sign-language learning service portfolio page, built
around a gallery wall where three framed pieces ARE the demo video, the GitHub
repository, and a role note.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained section.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the project is, and that this developer's role was the BACKEND
2. The demo video entry point
3. The GitHub repository link
Items 2-3 must read as framed pieces on a gallery wall, never as a link row.

=== MOOD ===
A quiet gallery, opening hours. Cool blue-grey walls, individual picture lights,
generous spacing. Calm and respectful.

=== ETHICS (binding) ===
No disability simulation. No pity or inspiration framing. Sign language is a
language, not a translation of spoken Korean. Every hand pose is labeled with its
meaning. Hands are never decoration. The hand silhouette is neutral.

=== DESIGN TOKENS (use exactly) ===
background #060d18 | panel #0d1a2b | primary #7eb8ff | accent #bfdbfe
hand #dbeafe | ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
frame rgba(126,184,255,0.20)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.4,0,0.2,1) 0.3s-0.8s | rounded-md | ALL numbers tabular-nums

=== PERSISTENT HEADER (fixed, present on every section of this page) ===
Height 54px, background rgba(6,13,24,0.85), backdrop-blur(10px),
bottom border 1px rgba(126,184,255,0.18).
  LEFT   "← 마을로"  13px font-mono rgba(255,255,255,0.46)
  CENTER "수어지구"  14px font-black #7eb8ff
  RIGHT  a sign counter, format VERBATIM: "손동작 3 / 12"
         13px font-mono tabular-nums. It increments whenever the viewer plays a
         sign anywhere on the page. It is a "how much have you seen" indicator, not
         a scroll progress bar.
  There is NO sound control in this header, on purpose.

=== LAYOUT ===
min-height 100vh, padding-block 92px, centered, max-width 1140px.
A GALLERY WALL fills the section: a subtle vertical gradient from #0a1422 at the top
to #060d18 at the bottom, with a thin floor line across the lower area
(1px rgba(126,184,255,0.08)) and soft shadow pooling beneath each frame.
A text column sits at the upper-left (max-width 520px); the three framed pieces
occupy the right and lower area at generous spacing.

=== THE THREE FRAMED PIECES (the defining objects of this page) ===
Each piece hangs on the wall with:
  - a picture light above it (a small warm gradient, rgba(219,234,254,0.09))
  - a frame: 10px border in #14243a with an inner 1px rgba(126,184,255,0.20) line
  - a mat area (background #0d1a2b) and the content within
  - a museum LABEL PLATE mounted to the lower-left of the frame: a small rectangle,
    background #0d1a2b, border 1px rgba(126,184,255,0.16), padding 8px 12px,
    with a title line (font-mono 11px rgba(255,255,255,0.86)) and a detail line
    (font-mono 9px rgba(255,255,255,0.46))
Hovering a piece brightens its picture light and lifts the frame 4px. 0.35s.

  PIECE A - DEMO VIDEO  (largest, 320x220px, center-right)
    Content: a still frame suggestion - an SVG hand mid-sign inside the mat, with a
    play triangle 24px #bfdbfe in a 52px circle overlaid at the center.
    Beneath the hand, inside the mat, a meaning label, font-mono 10px #bfdbfe,
    VERBATIM: "「배우다」"
    (Even inside a video thumbnail, the pose is labeled.)
    Label plate: title VERBATIM "데모 영상"
                 detail VERBATIM "1분 28초 · 퀴즈 학습과 문장 변환"
    Click -> video lightbox: overlay rgba(4,9,16,0.94) backdrop-blur(8px),
    16/9 player centered at max-width 1000px, Esc or overlay click closes.
    The lightbox must include a captions note in its chrome, font-mono 10px
    rgba(255,255,255,0.55), VERBATIM: "자막 포함"
    If no video source is supplied, render a CSS placeholder with centered text
    VERBATIM "데모 영상 자리 · 16:9 · 자막 필수".
    [VIDEO-01] one pass: 단어 퀴즈 → 동작 재생 → 정답 입력 → 피드백 →
    문장 입력 → 아바타 변환. MUST ship with burned-in or track captions.

  PIECE B - GITHUB  (240x170px, left of A)
    Content: a monospace "< >" glyph 26px rgba(255,255,255,0.78) centered on the mat.
    Label plate: title VERBATIM "GitHub 저장소"
                 detail VERBATIM "Spring Boot · Firebase · React"
    Click -> https://github.com/toadsam/Sign-Language in a new tab
    (target _blank, rel noreferrer).

  PIECE C - ROLE NOTE  (220x160px, lower-right)
    Content: four short lines on the mat, font-mono 10px rgba(255,255,255,0.62),
    left-aligned, VERBATIM:
      "담당: 백엔드"
      "수어 데이터 API 설계"
      "정답 판정 로직"
      "3D 아바타는 팀원 작업"
    Label plate: title VERBATIM "작업 범위"
                 detail VERBATIM "팀 프로젝트"
    Not a link. The fourth line is deliberate and must not be removed - it is the
    honest boundary, stated up front rather than buried.

A small hint below the pieces, font-mono 10px rgba(255,255,255,0.35), fading out
permanently once any piece has been hovered or focused,
VERBATIM: "액자를 눌러보세요"

=== TEXT COLUMN CONTENT (Korean copy - VERBATIM, never translate) ===

KICKER (font-mono 12px, letter-spacing 0.3em, uppercase, color #7eb8ff):
  "PLATFORM · 수어 학습과 표현"

HEADLINE (font-black, 40px desktop / 26px mobile, leading-tight,
          rgba(255,255,255,0.88)):
  Line 1, VERBATIM: "수어는 손 모양이 아니라"
  Line 2, color #7eb8ff, margin-top 10px, VERBATIM: "움직임이다"

SUMMARY (16px leading-9, max-width 520px, margin-top 22px):
  VERBATIM: "아바타가 동작을 보여주고, 사용자가 뜻을 맞히고, 틀린 건 다시 나온다.
             반대로 문장을 입력하면 그 문장의 수어 동작을 이어서 보여준다.
             저는 그 동작 데이터와 판정 로직을 만드는 백엔드를 맡았습니다."
  Emphasize "동작 데이터와 판정 로직" in #bfdbfe, font-bold.

FACT GRID (4 cells in a row; 2x2 below 768px), margin-top 28px.
Each cell: border 1px rgba(126,184,255,0.20), rounded-md, padding 14px,
background rgba(126,184,255,0.03).
value font-mono 22px font-black #7eb8ff tabular-nums, label font-mono 10px
rgba(255,255,255,0.46) letter-spacing 0.1em below.
  Cell 1  value "5"      label "기술 스택"
  Cell 2  value "4"      label "핵심 기능"
  Cell 3  value "백엔드"  label "담당 범위"
  Cell 4  value "미감수"  label "수어 표현 검증"
Cell 4 is deliberate and gets a 1px rgba(251,191,36,0.30) border with its value in
#fbbf24. A note beneath the grid, font-mono 10px rgba(255,255,255,0.35), VERBATIM:
  "수어 표현의 정확성은 전문가 감수를 받지 못했습니다. 뒤에서 그대로 밝힙니다."
This admission appearing in the HERO, not buried at the end, is the point.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The wall fades up; the floor line draws left to right (0.7s)
0.30s  Kicker fades up (y 10px -> 0, 0.5s)
0.50s  Headline line 1 word by word (stagger 0.04s), line 2 at 1.05s
1.50s  Summary reveals
1.90s  Fact cells fade in 0.09s apart
2.40s  PIECE A's picture light turns on first (0.5s ramp), then the frame fades in
       beneath it, then its label plate slides in from the left (0.3s)
2.85s  PIECE B, then PIECE C, same pattern, 0.30s apart
3.80s  The hint fades in
No hand in this section animates on its own - hands only move when the viewer plays
them, except inside PIECE A's thumbnail which is a still.

=== RESPONSIVE ===
< 1024px: the text column sits above the wall; the three pieces arrange in a row
beneath it, then wrap to 2+1 below 860px.
< 640px: pieces become full-width stacked frames with their label plates beneath
them; headline 26px; fact grid 2x2.
Touch: each piece needs a 44px minimum touch target.

=== ACCESSIBILITY ===
prefers-reduced-motion: no picture-light ramp, no frame fade, no label plate slide.
Everything renders in place; hover still lifts.
Pieces A and B must be real anchors/buttons with visible focus rings
(2px #7eb8ff, offset 2px). Keyboard focus produces the same lift and light.
The demo video MUST have captions; state this in the lightbox chrome.
Every hand pose has a visible meaning label AND a visually-hidden description.
All numbers tabular-nums.

=== DO NOT ===
Do not render the links as a conventional button row anywhere.
Do not remove the "3D 아바타는 팀원 작업" line or the "미감수" fact cell.
Do not use hands as decoration.
Do not add a sound control.
```

---

## PAGE 02 — 동작을 데이터로 · 손 플레이어

**개발 실체**: 수어 동작의 데이터 스키마 설계 + **키프레임 구조와 API 응답**
**연출 장치**: **관람객이 손 플레이어를 직접 재생·정지·스크럽** → 그 프레임의 JSON 객체가 실시간으로 하이라이트됨

```text
Build a SECTION with a working SVG hand player where the viewer can play, pause and
scrub through a sign, while the corresponding keyframe object highlights live in the
JSON schema panel beside it.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Draw the hand in SVG - no
3D library, no external assets.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That a sign is a timed sequence, not a static hand shape
2. The actual data schema used to represent one sign
3. The specific design decisions inside that schema (what is stored, what is not)

=== MOOD ===
A gallery study room. Cool blue, one bright work light, a specimen under glass.
Analytical and quiet.

=== ETHICS (binding) ===
No disability simulation. No pity or inspiration framing. Sign language is a
language. Every pose shown is labeled with its meaning. Hands are never decoration.
The hand silhouette is neutral: no skin tone, gender, or age markers.

=== DESIGN TOKENS (use exactly) ===
background #060d18 | panel #0d1a2b | primary #7eb8ff | accent #bfdbfe
hand #dbeafe | ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #081220, border rgba(126,184,255,0.18)
syntax: comments #4a6b8a, strings #a3e635, keywords #7eb8ff, numbers #fbbf24
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1140px, padding-block 120px.
  Block A : label + heading + two paragraphs (max-width 740px)
  Block B : a two-column split, gap 20px, tops aligned
              LEFT  (52%) : THE HAND PLAYER, height 520px
              RIGHT (48%) : THE SCHEMA PANEL, height 520px
            Below 1024px stacks, player first.
  Block C : the schema decisions table

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "01 · 동작 데이터"

HEADING (28px font-black):
  VERBATIM: "사진 한 장으로는 수어를 담을 수 없다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "수어 사전들이 대부분 손 모양 사진을 보여준다.
             그런데 같은 손 모양이라도 어디서 시작해서 어디로 가는지에 따라 뜻이 달라진다.
             정지 이미지로는 그 차이를 표현할 방법이 없었다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "그래서 동작을 시간 순서가 있는 데이터로 저장하기로 했다.
             아래 손을 직접 재생하고 멈춰보세요. 지금 어느 프레임인지 오른쪽에서 보입니다."
  Emphasize "시간 순서가 있는 데이터" in #bfdbfe, font-bold.

=== BLOCK B LEFT: THE HAND PLAYER (must actually work) ===
Container: height 520px, rounded-md, border 1px rgba(126,184,255,0.18),
background #0d1a2b, padding 20px, position relative.

Header strip (32px): left font-mono 11px rgba(255,255,255,0.72),
VERBATIM: "동작 재생기"
right, a word selector - three small chips, font-mono 11px, padding 5px 12px,
rounded-full, border 1px rgba(126,184,255,0.24). Labels VERBATIM:
  "안녕하세요" "감사합니다" "학교"
The active chip has background rgba(126,184,255,0.14) and color #7eb8ff.

THE STAGE (the main area, ~340px tall):
  A soft spot-lit circle on a darker floor. Inside it, an SVG HAND rendered in
  #dbeafe: a front-facing geometric silhouette with five articulated fingers, a
  palm, and a wrist. It must be built from a small set of animatable parameters -
  finger flex values, wrist rotation, and an x/y position - so it can be driven from
  keyframe data rather than being a fixed drawing.
  A faint motion trail follows the palm center while playing: a 2px path in
  rgba(126,184,255,0.28) tracing the last ~0.8s of movement, fading at its tail.
  That trail is meaningful - movement path is part of a sign, so showing it is
  substance, not decoration.
  A MEANING LABEL is always visible beneath the stage, font-mono 13px #bfdbfe,
  showing the currently selected word, e.g. VERBATIM: "안녕하세요"
  and a sub-line, font-mono 10px rgba(255,255,255,0.46), VERBATIM:
  "한국수어 · 예시 표현"
  The sub-line's "예시 표현" wording is required - this project does not claim
  authoritative accuracy.

THE TRANSPORT (below the stage, ~90px):
  - A play/pause button, 40px circle, border 1px rgba(126,184,255,0.35),
    with a triangle or two bars in #7eb8ff.
  - A step-back and step-forward button (one keyframe at a time), 32px each,
    font-mono 14px, VERBATIM "◀" and "▶"
  - A SCRUBBER: a track 6px tall, rgba(255,255,255,0.08), rounded-full, with a
    14px #7eb8ff thumb. FIVE KEYFRAME TICKS are marked along it as 2px vertical
    lines in rgba(191,219,254,0.45), and dragging SNAPS softly toward them (a light
    magnetic pull within 3% of a tick, never a hard snap).
  - A readout to the right, font-mono 12px tabular-nums, format VERBATIM:
    "프레임 2 / 5 · 0.48s"
  - A speed control, three chips, font-mono 10px, VERBATIM: "0.5x" "1x" "2x"
    Default 1x. Slow playback is a real learning feature, so it belongs here.

BEHAVIOR:
  Playing runs the sign at the selected speed, interpolating between the five
  keyframes. Pausing freezes the hand exactly. Scrubbing moves the hand
  continuously, interpolating between neighbouring keyframes.
  Every time a sign finishes playing, the page header's sign counter increments.
  Selecting a different word loads a different five-keyframe sequence and resets the
  transport.

  IMPLEMENTATION CONSTRAINT: drive the hand from a requestAnimationFrame loop
  writing to CSS custom properties or direct SVG attribute updates via refs. Do NOT
  put the current frame time in React state - that re-renders on every frame.
  Stop the loop entirely when the container leaves the viewport or the tab is hidden.

=== BLOCK B RIGHT: THE SCHEMA PANEL ===
Height 520px, background #081220, border 1px rgba(126,184,255,0.18), rounded-md.
Header bar: three window dots (#ff5f56 #ffbd2e #27c93f, 8px) then the filename,
font-mono 11px rgba(255,255,255,0.45), VERBATIM: "GET /api/signs/hello"
Body: font-mono 12px, leading-relaxed, line-number gutter rgba(255,255,255,0.22),
internal vertical scroll.

CONTENT: a JSON response, roughly 34 lines, for one sign:
  - a word id and its Korean label
  - a duration in milliseconds
  - a "keyframes" array of FIVE objects, each with a time offset, a hand position
    (x, y), a wrist rotation, a finger-flex array of five values, and an optional
    "hold" flag
  - a "handedness" field (one-handed vs two-handed)
  - a "note" field carrying a short usage note
Format it so each keyframe object is a clearly delimited block.

THE LIVE HIGHLIGHT (the payoff - implement carefully):
As the player runs or the viewer scrubs, the keyframe object matching the CURRENT
frame gets a rgba(126,184,255,0.14) background across its lines, plus a 2px #7eb8ff
left border, and the panel auto-scrolls it into view (scroll the PANEL, never the
page). Between two keyframes, BOTH neighbouring objects are highlighted at half
intensity and a small floating chip appears between them, font-mono 10px #bfdbfe,
VERBATIM: "보간 중"
When the viewer drags the hand's position (see below), the x and y numeric tokens
in that keyframe update live and render in #fbbf24.
IMPLEMENTATION CONSTRAINT: render the JSON once and toggle classes / write text on
refs. Never re-render the panel per frame.

DRAG-TO-EDIT (a small but powerful touch): while PAUSED, the hand can be dragged
within the stage. Dragging updates that keyframe's x/y in the JSON live and moves
the hand. On release, a small chip appears above the transport, font-mono 10px
#fbbf24, VERBATIM: "이 프레임을 수정했습니다 · ↻ 되돌리기"
This makes the data-to-motion link undeniable.

Caption bar at the bottom, border-top 1px rgba(126,184,255,0.12), font-mono 11px
rgba(255,255,255,0.45), prefixed "// ", VERBATIM:
  "손 모양만 저장하면 「안녕하세요」와 「안녕히 가세요」를 구분할 수 없다"

=== BLOCK C: THE SCHEMA DECISIONS TABLE ===
Margin-top 48px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "스키마에서 내린 결정"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "항목" | "저장한다 / 안 한다" | "이유"
Rows:
  "손 위치 좌표"     | "저장"      | "같은 손 모양도 위치가 뜻을 바꾼다"
  "이동 경로"        | "저장"      | "직선인지 곡선인지가 다른 단어가 된다"
  "손가락 굽힘 정도"  | "저장"      | "지문자와 단어를 같은 구조로 다룰 수 있다"
  "표정"            | "안 함"     | "표정도 문법의 일부인데 이번 범위에서 뺐다"
  "속도"            | "안 함"     | "재생 속도는 학습자가 정하게 했다"
  "손의 외형"        | "안 함"     | "피부색·성별 같은 건 데이터에 넣지 않았다"
The "안 함" rows' second cells are rgba(255,255,255,0.55) with a "✕ " prefix.
The 표정 row gets a 1px rgba(251,191,36,0.28) left border - it is the significant
omission and should be visually flagged.
Rows fade in 0.1s apart on entry.

Below the table, one paragraph, 15px leading-8, VERBATIM:
  "표정을 뺀 건 기술적인 이유가 아니라 범위 때문이었다.
   한국수어에서 표정은 장식이 아니라 문법이다. 의문문인지 부정문인지가 표정에서 갈린다.
   그걸 빼고 만든 이상, 이 서비스는 「단어를 익히는 도구」까지이고
   「문장을 정확히 표현하는 도구」는 아니다."
Emphasize "표정은 장식이 아니라 문법이다" in #fbbf24, font-bold.
This paragraph is required - it is the most important honest statement on the page.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s (stagger 0.03s)
0.70s  Paragraph 1, paragraph 2 at 1.20s
1.70s  Player container and schema panel fade up together (y 18px -> 0, 0.5s)
2.20s  The hand fades in at its rest pose with its meaning label
2.60s  A one-time pulse on the play button (a soft blue ring, 2 pulses of 0.9s) with
       a hint beneath the transport, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "재생하고, 멈추고, 끌어보세요"
       Both disappear permanently once the player is used.

=== RESPONSIVE ===
< 1024px: stacked, player first (height 460px), schema panel below (height auto,
max 460px, internal scroll).
< 640px: stage height 240px; the transport wraps to two rows; the speed chips move
below the scrubber; code font 11px with internal horizontal scroll (the block
scrolls, never the page).
Touch: drag-to-edit uses touch events with touch-action: none on the HAND only,
never on the container.

=== ACCESSIBILITY ===
prefers-reduced-motion: no motion trail, no auto-play, no button pulse. The player
still works; scrubbing moves the hand without interpolation smoothing.
Transport controls must be real buttons; the scrubber a real slider
(role="slider", aria-valuenow/min/max, aria-valuetext including the frame number),
all keyboard operable with visible focus rings (2px #7eb8ff, offset 2px).
Arrow keys move one keyframe; Home/End jump to first/last.
Provide a visually-hidden textual description of each sign's movement, e.g.
VERBATIM: "손을 이마 옆에서 시작해 바깥쪽 아래로 내립니다."
Announce keyframe changes ONLY on keyboard interaction via aria-live="polite",
never on every animation frame.

=== DO NOT ===
Do not use a 3D library or external avatar assets - SVG only.
Do not put the frame time in React state or re-render the JSON panel per frame.
Do not show a hand without its meaning label.
Do not claim the表현 is authoritative - the "예시 표현" sub-label must stay.
Do not remove the paragraph about facial expressions.
```

---

## PAGE 03 — 수어는 한국어가 아니다 · 어순

**개발 실체**: 텍스트 → 수어 변환 API 설계 + **어순 재배열 로직**
**연출 장치**: 같은 문장을 **「한국어 순서」와 「수어 순서」로 나란히 재생** — 두 손이 다른 순서로 움직인다

```text
Build a SECTION that plays the SAME sentence twice, side by side - once in spoken
Korean word order and once in sign-language word order - so the viewer sees the two
hands move in different orders, with the reordering logic shown alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. SVG hands only.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That sign language has its own grammar, and word-for-word substitution fails
2. The actual text-to-sign conversion pipeline
3. The honest limitation of a rule-based reordering approach

=== MOOD ===
A gallery comparison wall - two pieces hung side by side for study.
Cool blue, analytical, respectful.

=== ETHICS (binding, and this page carries the most weight) ===
Sign language is a language with its own grammar. NEVER describe it as "translating
Korean into hand gestures" or "Korean expressed with hands". This page exists
specifically to correct that misconception.
No disability simulation. No pity or inspiration framing. Every pose is labeled.
Hands are never decoration. The hand silhouette is neutral.

=== DESIGN TOKENS (use exactly) ===
background #060d18 | panel #0d1a2b | primary #7eb8ff | accent #bfdbfe
hand #dbeafe | ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #081220, border rgba(126,184,255,0.18)
syntax: comments #4a6b8a, strings #a3e635, keywords #7eb8ff, numbers #fbbf24
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1080px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : the sentence input, centered
  Block C : THE TWO PLAYERS - stacked rows, full width, height ~440px total
  Block D : the conversion pipeline diagram
  Block E : the code panel + the honest limitation card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "02 · 문장 변환"

HEADING (28px font-black):
  VERBATIM: "단어를 하나씩 바꿔 넣으면 말이 안 된다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "처음엔 문장을 단어로 쪼개서 각 단어의 동작을 순서대로 이어 붙였다.
             문법적으로 틀린 문장이 나왔다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "한국수어는 한국어를 손으로 옮긴 게 아니라 문법이 다른 별개의 언어다.
             시간 표현이 앞에 오고, 조사가 없고, 어순이 다르다.
             아래에서 같은 문장을 두 가지 순서로 나란히 재생해보세요."
  Emphasize "문법이 다른 별개의 언어다" in #7eb8ff, font-bold.

=== BLOCK B: THE SENTENCE INPUT ===
Margin-top 36px, centered, max-width 640px.
A row: a text input (background rgba(255,255,255,0.04),
border 1px rgba(126,184,255,0.22), rounded-md, padding 11px 14px, font-mono 13px)
prefilled with VERBATIM "내일 학교에 갑니다"
and a button beside it, background #7eb8ff, color #060d18, font-mono 12px font-black,
padding 10px 20px, rounded-md, VERBATIM: "변환하기"

Beneath, three preset chips, font-mono 11px, padding 6px 13px, rounded-full,
border 1px rgba(126,184,255,0.24), VERBATIM:
  "내일 학교에 갑니다"  "저는 학생입니다"  "지금 몇 시예요?"
Selecting a chip fills the input and runs the conversion.

FREE INPUT HANDLING: the input accepts free text, but the vocabulary is limited.
If a word is not in the dictionary, the conversion still runs and that word is
rendered as a FINGERSPELLING placeholder in the sequence, marked with a chip,
font-mono 9px #fbbf24, VERBATIM: "지문자"
and a note appears beneath the players, font-mono 11px #fbbf24, VERBATIM:
  "사전에 없는 단어는 지문자로 처리합니다"
Never show an error state for unknown input - degrade gracefully.

=== BLOCK C: THE TWO PLAYERS (the defining idea) ===
Margin-top 36px. Two horizontal rows, stacked, each height ~200px, gap 14px.
Each row: background #0d1a2b, border 1px, rounded-md, padding 18px,
display flex - a label column on the left (~150px) and a sign strip on the right.

  ROW 1 - border 1px rgba(255,255,255,0.14)
    Label column: title font-mono 13px rgba(255,255,255,0.72),
    VERBATIM: "한국어 순서 그대로"
    sub-line font-mono 10px rgba(255,255,255,0.46), VERBATIM: "단어를 그대로 치환"
    A small ✕ marker, font-mono 12px #f87171, VERBATIM: "문법에 맞지 않음"

  ROW 2 - border 1px rgba(126,184,255,0.35)
    Label column: title font-mono 13px #7eb8ff, VERBATIM: "수어 순서"
    sub-line font-mono 10px rgba(255,255,255,0.46), VERBATIM: "시간 → 장소 → 동작"
    A small ✓ marker, font-mono 12px #4ade80, VERBATIM: "수어 어순"

  THE SIGN STRIP (in each row): a horizontal sequence of SIGN CELLS, each 96px wide,
  containing a small SVG hand (the same neutral silhouette, ~64px) and a meaning
  label beneath it, font-mono 10px #bfdbfe.
  For the sentence "내일 학교에 갑니다":
    ROW 1 cells in order VERBATIM: "내일" "학교" "에" "가다" "습니다"
      The cells for "에" and "습니다" are rendered DIMMED at 40% with a strike-like
      marker and a chip, font-mono 9px #f87171, VERBATIM: "수어에 없음"
    ROW 2 cells in order VERBATIM: "내일" "학교" "가다"
      Three cells only, with a small reorder arrow above the strip showing that
      "내일" moved to the front, font-mono 9px #7eb8ff, VERBATIM: "시간 표현이 앞으로"

  PLAYBACK: a single shared play button above both rows, font-mono 12px font-black,
  padding 9px 20px, rounded-md, border 1px rgba(126,184,255,0.45), color #7eb8ff,
  VERBATIM: "두 줄 같이 재생"
  Pressing it plays BOTH rows SIMULTANEOUSLY, cell by cell: the currently playing
  cell scales to 1.08, its hand animates through its keyframes, and a progress
  underline fills beneath it.
  Because row 1 has more cells, the two rows FINISH AT DIFFERENT TIMES - and that
  difference is left visible, with row 1 still going after row 2 has ended. Do not
  normalize their durations; the mismatch is informative.
  Each row also has its own small play button for playing just that row.
  A per-row duration readout, font-mono 10px tabular-nums, format VERBATIM: "2.4초"

  Every completed playback increments the page header's sign counter.

  A caption beneath both rows, 15px leading-8, appearing after the first playback,
  VERBATIM:
  "위쪽은 단어를 그대로 이어 붙인 것이고, 아래쪽이 실제 수어 어순입니다.
   조사는 아예 사라지고, 시간을 나타내는 말이 맨 앞으로 옵니다."

=== BLOCK D: THE CONVERSION PIPELINE DIAGRAM ===
Margin-top 48px, padding 24px, rounded-md, border 1px rgba(126,184,255,0.18),
background #0d1a2b.
  Label font-mono 10px letter-spacing 0.18em #7eb8ff, VERBATIM: "변환 단계"
  A horizontal SVG flow of five nodes (vertical below 900px), each 150x50px:
    VERBATIM "문장 입력" -> "형태소 분석" -> "불필요 요소 제거" -> "수어 어순 재배열"
    -> "동작 시퀀스 조립"
  Beneath each node, a one-line note, font-mono 9px rgba(255,255,255,0.46),
  VERBATIM in order:
    "원문 그대로" / "단어와 품사 분리" / "조사·어미 제거" / "시간·장소를 앞으로" /
    "각 단어의 키프레임을 이어 붙임"
  When the viewer runs a conversion, a blue dot travels the pipeline (0.3s per hop,
  pausing 0.2s at each node) and each node lights as it passes. The corresponding
  code block highlights at the same instant.

=== BLOCK E: THE CODE PANEL + HONEST LIMITATION ===
Margin-top 40px, full width. background #081220,
border 1px rgba(126,184,255,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "SignSentenceService.java"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~26 lines, in FOUR contiguous blocks matching the pipeline:
  (1) tokenizing the sentence into words with part-of-speech tags,
  (2) dropping tokens whose part of speech has no counterpart in sign (particles,
      certain endings), keeping a record of what was dropped so the UI can show it,
  (3) reordering by a rule set that moves time expressions to the front, then place,
      then the predicate, with a comment stating this is a simplified rule set,
  (4) mapping each remaining word to its sign entry, falling back to a fingerspelling
      sequence when the dictionary has no entry, and concatenating the keyframes with
      a short inter-sign transition.
HIGHLIGHT ROWS: the reordering rule line and the fingerspelling fallback line
(background rgba(126,184,255,0.12)).
As the pipeline dot passes each node, the matching block gets a
rgba(126,184,255,0.14) sweep highlight over 0.3s, fading after 1.2s.
Caption bar, border-top 1px, font-mono 11px, prefixed "// ", VERBATIM:
  "규칙 몇 개로 어순을 맞춘 것이지, 문법을 구현한 게 아니다"

THE HONEST LIMITATION CARD, margin-top 32px, padding 22px, rounded-md,
border 1px rgba(251,191,36,0.30), background rgba(251,191,36,0.05),
border-left 3px #fbbf24.
  Label font-mono 11px letter-spacing 0.2em #fbbf24, VERBATIM: "이 방식의 한계"
  A 4-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "어순 규칙이 세 개뿐이다. 실제 한국수어 문법은 이보다 훨씬 복잡하다."
    "표정과 비수지 신호를 다루지 않아서, 의문문과 평서문을 구분하지 못한다."
    "문맥에 따라 달라지는 표현을 처리하지 못한다. 단어 단위 사전만 본다."
    "이 변환 결과가 자연스러운 수어인지 확인해줄 사람이 없었다."
  The fourth item is the most important - it leads directly into the ethics page.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraphs 1 and 2, 0.5s apart
1.50s  The input row fades up; preset chips appear 0.06s apart
1.90s  BOTH player rows fade up TOGETHER (never staggered - simultaneity is the
       argument), y 16px -> 0, 0.5s. Their sign cells populate 0.05s apart.
2.60s  Pipeline diagram nodes draw left to right 0.1s apart
3.00s  Code panel fades up
3.40s  A one-time pulse on the "두 줄 같이 재생" button (a soft blue ring, 2 pulses
       of 0.9s) with a hint, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "두 줄을 같이 재생해보세요"
       Both disappear permanently once played.

=== PERFORMANCE ===
Both rows' hands are driven by ONE requestAnimationFrame loop, not one per hand.
Stop the loop when the section is out of the viewport or the tab is hidden.
Never put playback time in React state.

=== RESPONSIVE ===
< 900px: the pipeline becomes vertical; sign cells shrink to 78px and the strips
scroll horizontally inside their own rows (never the page).
< 640px: the two player rows keep their stacked layout (do not merge them - the
comparison is the point); label columns move above each strip; code font 11px with
internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no pipeline dot travel, no cell scaling; playback advances
cells with an instant highlight change instead of animated hands.
All controls are real buttons/inputs with visible focus rings
(2px #7eb8ff, offset 2px).
Provide a visually-hidden text version of both sequences, stating each word in order
and noting which were dropped and why.
Announce conversion completion ONCE via aria-live="polite", VERBATIM pattern:
  "수어 어순으로 3개 단어가 배열되었습니다. 조사 2개가 제외되었습니다."

=== DO NOT ===
Do not describe sign language as translated or converted Korean anywhere in the copy.
Do not normalize the two rows' durations - the mismatch is the point.
Do not show an error for unknown words - use the fingerspelling fallback.
Do not claim grammatical correctness. The limitation card must stay in full.
```

---

## PAGE 04 — 트러블슈팅 01 · 맞는 답을 틀렸다고 했다

**개발 실체**: 퀴즈 정답 판정에서 동의 표현을 오답 처리한 문제 → **판정 로직 전체 재설계**
**연출 장치**: **관람객이 직접 정답을 입력해본다. 맞는 답인데 빨간 X가 뜬다.**

```text
Build a TROUBLESHOOTING CASE FILE where the viewer answers a sign quiz with a
correct-but-differently-worded answer and is marked wrong - reproducing the bug -
then follows the full diagnosis and the answer-matching redesign.
Stack: React + TypeScript + Tailwind CSS + framer-motion. SVG hands only.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the answer-judging bug:
symptom -> reproduction -> elimination of naive fixes -> root cause -> the redesign
(a synonym set per sign, plus normalization) -> verification -> remaining limits.
All seven parts required.

=== MOOD ===
The specific unfairness of being told you are wrong when you are right.
Cool blue turning red, then corrected and calm.

=== ETHICS (binding) ===
No disability simulation, no pity framing. Sign language is a language.
Every pose labeled. Hands never decorative. Neutral silhouette.

=== DESIGN TOKENS (use exactly) ===
background #060d18 | panel #0d1a2b | primary #7eb8ff | accent #bfdbfe
hand #dbeafe | ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #081220, border rgba(126,184,255,0.18)
syntax: comments #4a6b8a, strings #a3e635, keywords #7eb8ff, numbers #fbbf24
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1020px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE QUIZ REPRODUCTION - full width, height ~420px
  Block C : elimination table
  Block D : root cause
  Block E : the fix (before/after code + the synonym data)
  Block F : verification + remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "03 · 트러블슈팅 01"

HEADING (30px font-black):
  VERBATIM: "「고맙습니다」라고 썼더니 틀렸다고 나왔다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "테스트해준 친구가 계속 틀렸다고 했다. 로그를 보니 답을 맞게 쓰고 있었다.
   정답은 「감사합니다」로 저장돼 있었고, 친구는 「고맙습니다」라고 썼다.
   같은 동작을 보고 같은 뜻을 말했는데 오답이었다."

=== BLOCK B: THE QUIZ REPRODUCTION (the defining idea) ===
Margin-top 36px. Container, height ~420px, rounded-md,
border 1px rgba(126,184,255,0.18), background #0d1a2b, padding 22px.

A MODE TOGGLE at the top-right, font-mono 11px, two options:
  VERBATIM "수정 전"  |  VERBATIM "수정 후"
Default: 수정 전.

LEFT SIDE (~46%) - THE QUESTION
  A small stage with a spot-lit SVG hand that plays a sign on loop (with a play/
  replay button beneath, font-mono 11px, VERBATIM: "↻ 다시 보기").
  The sign shown is the one meaning "thank you".
  A question line above the stage, font-mono 12px rgba(255,255,255,0.72),
  VERBATIM: "이 동작의 뜻은 무엇일까요?"
  IMPORTANT: the meaning label is HIDDEN here (this is a quiz) but a
  visually-hidden description is still provided for screen readers, and the answer
  is revealed after submission - the "no unlabeled hand" rule is satisfied by the
  reveal plus the hidden description.

RIGHT SIDE (~54%) - THE ANSWER
  An input, background rgba(255,255,255,0.04),
  border 1px rgba(126,184,255,0.22), rounded-md, padding 11px 14px, font-mono 13px,
  placeholder VERBATIM: "뜻을 입력하세요"
  and a submit button, background #7eb8ff, color #060d18, font-mono 12px font-black,
  padding 10px 20px, rounded-md, VERBATIM: "제출"
  Below the input, four quick-answer chips, font-mono 11px, padding 6px 13px,
  rounded-full, border 1px rgba(126,184,255,0.24), VERBATIM:
    "감사합니다" "고맙습니다" "감사 합니다" "고마워요"
  These four are the whole experiment - they are all correct meanings of the same
  sign, and in 수정 전 mode only the first is accepted.

  ON SUBMIT IN "수정 전" MODE:
    If the answer is exactly VERBATIM "감사합니다" -> correct.
    Anything else -> WRONG:
      t=0.00s  The input's border flashes #f87171 and shakes horizontally
               (±5px, 3 oscillations, 0.35s total - a short shake, not a violent one)
      t=0.20s  A red result panel slides in: a ✕ mark, font-mono 22px #f87171, and
               a line, font-mono 13px, VERBATIM: "오답입니다"
               and beneath it, the stored answer, font-mono 11px
               rgba(255,255,255,0.60), format VERBATIM: "정답: 감사합니다"
      t=0.60s  A message appears, 16px leading-8, max-width 420px:
                 Line 1, rgba(255,255,255,0.88), VERBATIM:
                   "같은 뜻인데 오답 처리됐습니다."
                 Line 2, #f87171, font-bold, margin-top 8px, VERBATIM:
                   "저장된 정답과 글자가 달랐을 뿐입니다."
      A comparison strip appears beneath, showing the two strings character-aligned
      with the differing characters highlighted in #f87171, font-mono 12px.

  ON SUBMIT IN "수정 후" MODE:
    All four chips (and reasonable free-text variants) are accepted:
      A green result panel with a ✓, font-mono 13px #4ade80, VERBATIM: "정답입니다"
      and beneath it, an accepted-forms line, font-mono 11px
      rgba(255,255,255,0.60), VERBATIM:
        "인정된 표현: 감사합니다 · 고맙습니다 · 고마워요"
      plus a note, font-mono 10px #4ade80, VERBATIM: "띄어쓰기와 어미 차이는 무시합니다"
    The sign's meaning label is revealed on the stage after any submission.

A reset control at the container's bottom-right, font-mono 11px,
rgba(255,255,255,0.46), VERBATIM: "↻ 다시 풀기"
A note at the bottom-left, font-mono 9px rgba(255,255,255,0.32), VERBATIM:
  "재현용 예시입니다"

=== BLOCK C: ELIMINATION TABLE ===
Margin-top 44px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "먼저 떠올린 해결책들"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "방법" | "해봤더니" | "판단"
Rows (판단 cells: rejected in rgba(255,255,255,0.46) with "✕ ", adopted in #4ade80
with "● "):
  "공백만 제거"           | "「고맙습니다」는 여전히 오답"      | "✕ 부족"
  "부분 문자열 포함 검사"  | "「감사」만 써도 정답 처리됨"       | "✕ 너무 헐렁함"
  "편집 거리로 유사도 판정" | "「감사합니다」와 「감사했습니다」를 구분 못 함" | "✕ 뜻과 무관한 기준"
  "단어마다 인정 표현 목록" | "관리는 늘지만 판정이 명확해짐"     | "● 채택"
Rows reveal 0.16s apart, sliding in from x -10px. The adopted row lands last and
grows a 2px #4ade80 left bar over 0.5s.

Below the table, one line, 15px leading-8, VERBATIM:
  "문자열을 얼마나 비슷하게 볼지를 조정하는 문제가 아니었다.
   애초에 「무엇이 정답인가」를 하나로 정해둔 게 문제였다."
Emphasize "「무엇이 정답인가」를 하나로 정해둔 게 문제였다" in #fbbf24, font-bold.

=== BLOCK D: ROOT CAUSE ===
Margin-top 40px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인"
  Body 16px leading-8, VERBATIM:
  "수어 단어 하나에 한국어 단어 하나가 대응한다고 가정하고 데이터를 만들었다.
   그런데 실제로는 하나의 수어 표현이 여러 한국어 단어에 걸쳐 있다.
   「감사합니다」와 「고맙습니다」는 다른 단어지만 같은 수어다.
   데이터 구조가 언어의 실제 모습과 안 맞았던 것이다."
  Emphasize "데이터 구조가 언어의 실제 모습과 안 맞았던 것" in #fbbf24, font-bold.

=== BLOCK E: THE FIX ===
Margin-top 40px. Two panels side by side, gap 16px (stack below 1024px).
Each: background #081220, border 1px, rounded-md, header with three window dots and
a filename, body font-mono 12px with a line-number gutter.

  LEFT panel - border 1px rgba(248,113,113,0.28),
    filename VERBATIM: "QuizService.java (before)"
    CONTENT: ~10 lines. Compares the submitted answer to a single stored answer
    string with an exact equality check.
    HIGHLIGHT the equality line with rgba(248,113,113,0.12) and an inline marker,
    font-mono 10px #f87171, VERBATIM: "← 정답이 하나뿐"

  RIGHT panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "QuizService.java (after)"
    CONTENT: ~20 lines. Normalizes the submitted answer (trimming, collapsing
    whitespace, unifying a small set of polite endings) and then checks membership
    in the sign's ACCEPTED-MEANINGS set rather than against a single string; returns
    a result object carrying which accepted form matched, so the UI can show it;
    and logs any near-miss submission that was rejected, so unknown-but-plausible
    answers can be reviewed and added later.
    HIGHLIGHT: the set-membership line and the near-miss logging line with
    rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "오답으로 처리한 답도 남겨둔다. 사전에 빠진 표현일 수 있으니까."

BELOW BOTH PANELS, a small DATA panel showing the changed schema, background #081220,
border 1px rgba(126,184,255,0.18), rounded-md, header filename font-mono 11px,
VERBATIM: "signs 컬렉션 (Firebase)"
Body: ~12 lines of JSON for one sign entry showing an id, a primary label, and an
"acceptedMeanings" array containing several Korean expressions, plus a "reviewQueue"
note field.
HIGHLIGHT the acceptedMeanings array with rgba(126,184,255,0.12).
A caption beneath, font-mono 10px rgba(255,255,255,0.35), VERBATIM:
  "데이터를 고치는 게 코드를 고치는 것보다 오래 걸렸습니다. 단어마다 다시 채워야 했으니까요."

=== BLOCK F: VERIFICATION + REMAINING LIMITS ===
Margin-top 40px.
Three stat cells in a row, gap 12px (stacks below 640px). Each: padding 16px,
rounded-md, border 1px rgba(74,222,128,0.22), background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "12개"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "인정 표현을 채운 단어"
  Cell 2  value VERBATIM "2~4개"  label VERBATIM "단어당 인정 표현 수"
  Cell 3  value VERBATIM "0건"   label VERBATIM "이후 같은 유형 오답 신고"
Values fade in on entry.
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "테스트해준 사람 3명이 다시 풀어보는 방식으로 확인했습니다. 자동화된 테스트는 없습니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 4-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "인정 표현 목록은 제가 판단해서 넣었습니다. 수어 전문가가 검토한 게 아닙니다."
    "단어가 12개뿐입니다. 늘어나면 이 방식의 관리 비용도 같이 늘어납니다."
    "지역이나 세대에 따라 다른 표현은 전혀 반영하지 못했습니다."
    "오답으로 기록된 답을 실제로 검토해서 사전에 반영하는 절차는 아직 없습니다."
  The first item is essential - it points forward to the ethics page.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left
1.10s  The quiz container fades up; the hand plays its sign once automatically
1.90s  A one-time pulse on the "고맙습니다" chip (a soft blue ring, 2 pulses of 0.9s)
       with a hint, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "「고맙습니다」로 답해보세요"
       Both disappear permanently once a submission is made.
All later blocks animate on their own viewport entry.

=== RESPONSIVE ===
< 1024px: fix panels stack (before on top).
< 720px: the quiz's two sides stack (question first); the character-comparison strip
scrolls horizontally inside itself.
< 640px: code font 11px with internal horizontal scroll (blocks scroll, never the
page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no input shake (use a static border color change), no button
pulse, no result panel slide.
The input, submit, chips and mode toggle are real controls with visible focus rings
(2px #7eb8ff, offset 2px).
Announce the result ONCE via aria-live="polite":
  wrong VERBATIM: "오답으로 처리되었습니다. 정답은 감사합니다입니다."
  right VERBATIM: "정답입니다. 인정된 표현입니다."
The quiz hand needs a visually-hidden movement description even while its meaning
is hidden, describing the motion without naming the answer.

=== DO NOT ===
Do not shake the input violently - three small oscillations over 0.35s maximum.
Do not claim the accepted-meanings list is authoritative - the first limits item
must stay.
Do not remove the near-miss logging from the after code - it is the thoughtful part.
```

---

## PAGE 05 — 틀린 건 다시 나온다 · 반복 학습 루프

**개발 실체**: 반복 학습 설계 + **출제 알고리즘과 학습 상태 저장**
**연출 장치**: **관람객이 퀴즈 3문제를 실제로 푼다.** 틀린 문제가 실제로 다시 나온다.

```text
Build a LEARNING LOOP section where the viewer actually takes a short three-question
sign quiz, gets one wrong on purpose-friendly odds, and sees that wrong item return
later in the session - with the scheduling logic shown alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. SVG hands only.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. Why repetition scheduling exists (learning, not gamification)
2. The actual selection algorithm for the next question
3. What learning state is stored and where

=== MOOD ===
A quiet study desk in the gallery. Cool blue, focused, patient.
No score fanfare, no streak pressure, no celebration effects.

=== ETHICS (binding) ===
No disability simulation, no pity framing. Sign language is a language.
Every pose labeled (revealed after answering). Hands never decorative.
Neutral silhouette. No competitive or shame-based feedback.

=== DESIGN TOKENS (use exactly) ===
background #060d18 | panel #0d1a2b | primary #7eb8ff | accent #bfdbfe
hand #dbeafe | ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #081220, border rgba(126,184,255,0.18)
syntax: comments #4a6b8a, strings #a3e635, keywords #7eb8ff, numbers #fbbf24
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1120px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : a two-column split, gap 20px
              LEFT  (54%) : THE QUIZ SESSION, height 520px
              RIGHT (46%) : the queue visualizer (top) + the scheduling code (bottom)
            Below 1024px stacks, quiz first.
  Block C : the design decisions card
  Block D : media slot

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "04 · 반복 학습"

HEADING (28px font-black):
  VERBATIM: "한 번 맞혔다고 아는 게 아니다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "처음엔 문제를 무작위로 냈다. 그러니 이미 아는 단어가 계속 나오고,
             헷갈리는 단어는 어쩌다 한 번 나왔다.
             틀린 걸 다시 보여주는 게 학습이지, 문제를 많이 푸는 게 학습은 아니었다."
  Emphasize "틀린 걸 다시 보여주는 게 학습" in #bfdbfe, font-bold.

=== BLOCK B LEFT: THE QUIZ SESSION (must actually work) ===
Container: height 520px, rounded-md, border 1px rgba(126,184,255,0.18),
background #0d1a2b, padding 20px, display flex column.

HEADER STRIP (34px): left font-mono 11px rgba(255,255,255,0.72), showing progress,
format VERBATIM: "문제 2 / 5"
right, a small session state, font-mono 11px rgba(255,255,255,0.46),
format VERBATIM: "맞음 1 · 틀림 1 · 복습 대기 1"

THE QUESTION AREA (flex-1):
  A spot-lit SVG hand that plays the current sign automatically once on question
  load, with a replay button beneath, font-mono 11px, VERBATIM: "↻ 다시 보기"
  and a speed chip pair, font-mono 10px, VERBATIM: "0.5x" "1x"
  The meaning label is hidden until answered.
  Below the stage, FOUR multiple-choice options as buttons, in a 2x2 grid, each
  font-mono 12px, padding 10px 14px, rounded-md,
  border 1px rgba(126,184,255,0.22), background rgba(255,255,255,0.02).
  Options are Korean meanings; one is correct.

  ON ANSWER:
    correct -> the chosen button's border and text turn #4ade80, a small ✓ appears,
               and the meaning label reveals on the stage. No sound, no confetti,
               no streak counter. A quiet line appears, font-mono 11px #4ade80,
               VERBATIM: "맞았습니다"
    wrong   -> the chosen button turns #f87171 with a ✕; the correct option
               simultaneously turns #4ade80 so the viewer learns immediately rather
               than being punished; the meaning label reveals; and a line appears,
               font-mono 11px #fbbf24, VERBATIM: "복습 목록에 추가했습니다"
               AND the queue visualizer on the right visibly gains an item.
    After 1.4s, a next button appears, font-mono 12px, VERBATIM: "다음 문제 →"

  THE SESSION IS FIVE QUESTIONS drawn from a pool of 12 signs. The scheduler MUST
  re-insert any wrongly answered item so it reappears as question 4 or 5 - and when
  it does, a chip appears above the stage, font-mono 10px #fbbf24,
  VERBATIM: "아까 틀린 문제입니다"
  That moment is the entire point of the page.

  AT SESSION END: a quiet summary panel - no celebration. It lists each of the five
  questions with its result, and a single line, 15px leading-8, VERBATIM:
  "틀린 단어는 다음에 접속해도 먼저 나옵니다."
  plus a restart control, font-mono 11px, VERBATIM: "↻ 다시 풀기"

  Every sign played increments the page header's sign counter.

=== BLOCK B RIGHT TOP: THE QUEUE VISUALIZER ===
Height ~230px, background #0d1a2b, border 1px rgba(126,184,255,0.18),
rounded-md, padding 18px.
Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "출제 대기열"
A vertical list of upcoming question chips, each font-mono 11px, padding 7px 12px,
rounded, showing a word label and a small state tag:
  new      tag VERBATIM "처음"      color rgba(255,255,255,0.55)
  review   tag VERBATIM "복습"      color #fbbf24
  learned  tag VERBATIM "익힘"      color #4ade80
When the viewer answers wrongly, a NEW REVIEW CHIP is INSERTED into the queue with a
visible animation: the chip drops in at its scheduled position (0.4s), the chips
below shift down (layout animation), and a brief connector line traces from the quiz
area to the inserted chip. That physical insertion is what makes the scheduling
legible.
A small readout at the bottom, font-mono 10px rgba(255,255,255,0.46), tabular-nums,
format VERBATIM: "대기 3 · 복습 1"

=== BLOCK B RIGHT BOTTOM: THE SCHEDULING CODE ===
Height ~260px, background #081220, border 1px rgba(126,184,255,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "QuizScheduler.java"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~22 lines. A scheduler that, for a session:
  - loads the learner's per-sign state (times seen, times correct, last result),
  - partitions the pool into due-for-review items, unseen items, and learned items,
  - builds the session by taking review items first, then unseen ones, and only
    filling with learned items if the session is not yet full,
  - on a wrong answer, marks the sign for review and re-inserts it a fixed number of
    questions later in the SAME session rather than only in a future one,
  - marks a sign as learned only after it has been answered correctly a set number
    of times in separate sessions, not consecutively within one.
HIGHLIGHT ROWS: the same-session re-insertion line and the "separate sessions"
condition (background rgba(126,184,255,0.12)).
Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
  "같은 세션에서 연속으로 맞히는 건 외운 게 아니라 방금 본 것이다"

=== BLOCK C: THE DESIGN DECISIONS CARD ===
Margin-top 44px, padding 24px, rounded-md, border 1px rgba(126,184,255,0.24),
background rgba(126,184,255,0.04), border-left 3px #7eb8ff.
  Label font-mono 11px letter-spacing 0.2em #7eb8ff, VERBATIM: "일부러 넣지 않은 것"
  A 4-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "연속 정답 기록(스트릭)을 넣지 않았다. 하루 빠졌다고 압박을 주고 싶지 않았다."
    "점수 순위표를 넣지 않았다. 배우는 속도는 사람마다 다르다."
    "틀렸을 때 정답을 바로 보여준다. 다시 맞힐 기회를 주는 것보다 지금 알려주는 게 낫다."
    "정답 효과음을 넣지 않았다. 이 서비스는 소리로 정보를 주지 않는다."
  The fourth item connects the sound-free design to a concrete product decision -
  keep it.

=== BLOCK D: MEDIA SLOT ===
Margin-top 36px. A 2-up media row, gap 14px (stacks below 720px).
Each frame: aspect 9/16, rounded-md, border 1px rgba(126,184,255,0.18),
overflow hidden, with a caption bar beneath (padding 10px 14px, font-mono 11px
rgba(255,255,255,0.48)).
  [IMG-01] the real quiz screen with the avatar
           caption VERBATIM: "실제 퀴즈 화면"
  [IMG-02] the real feedback screen after a wrong answer
           caption VERBATIM: "오답 직후 화면 · 정답을 바로 보여준다"
Placeholder if no image: VERBATIM "[IMG-01] · 9:16".

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  Quiz container fades up; the first question's hand plays automatically once
1.80s  Queue visualizer fades in; its chips appear 0.07s apart
2.30s  Scheduling code panel fades up
2.70s  A one-time hint beneath the options, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "일부러 틀려보셔도 됩니다. 그게 이 페이지의 요점입니다."
       It disappears permanently after the first answer.
       This hint is important - it invites the interaction that proves the feature.

=== PERFORMANCE ===
One requestAnimationFrame loop drives the hand. Stop it when the container is out of
the viewport or the tab is hidden. Never put playback time in React state.

=== RESPONSIVE ===
< 1024px: stacked; quiz first (height 480px), then the queue and code side by side,
stacking again below 720px.
< 640px: options become a single column; stage height 200px; code font 11px with
internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no queue insertion animation (the chip appears in place),
no button state transitions beyond an instant color change.
Options must be real buttons with visible focus rings (2px #7eb8ff, offset 2px);
the whole quiz is keyboard operable, with number keys 1-4 also selecting options.
Announce results ONCE via aria-live="polite":
  correct VERBATIM: "정답입니다."
  wrong   VERBATIM: "오답입니다. 정답은 감사합니다입니다. 복습 목록에 추가되었습니다."
Every sign has a visually-hidden movement description available before answering
that does not reveal the answer.

=== DO NOT ===
Do not add streaks, leaderboards, score fanfare, confetti, or sound.
Do not withhold the correct answer after a wrong response.
Do not make the re-inserted review question optional - it must actually reappear.
```

---

## PAGE 06 — 트러블슈팅 02 · 손이 뚝뚝 끊겼다

**개발 실체**: 동작 간 전환 프레임 누락으로 아바타가 순간이동하던 문제 → **API 응답 구조 수정**
**연출 장치**: **관람객이 「전환 프레임 없음」 토글을 켜면 손이 실제로 끊겨 순간이동한다**

```text
Build a TROUBLESHOOTING section where the viewer toggles off inter-sign transition
frames and watches the hand teleport between poses - reproducing the bug - then
follows the full diagnosis and the API response fix.
Stack: React + TypeScript + Tailwind CSS + framer-motion. SVG hands only.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the discontinuous-motion bug:
symptom -> reproduction -> whose problem it was (a backend/frontend boundary
question) -> root cause -> the fix in the API response -> verification ->
remaining limits. All seven parts required.

=== MOOD ===
A study bench with two specimens under the same light - one smooth, one broken.
Cool blue, comparative, precise.

=== ETHICS (binding) ===
No disability simulation, no pity framing. Sign language is a language.
Every pose labeled. Hands never decorative. Neutral silhouette.
Discontinuous motion is presented as a TECHNICAL DEFECT, never as a joke about how
the hand looks.

=== DESIGN TOKENS (use exactly) ===
background #060d18 | panel #0d1a2b | primary #7eb8ff | accent #bfdbfe
hand #dbeafe | ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #081220, border rgba(126,184,255,0.18)
syntax: comments #4a6b8a, strings #a3e635, keywords #7eb8ff, numbers #fbbf24
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1040px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE SIDE-BY-SIDE PLAYERS - full width, height ~420px
  Block C : the boundary question card
  Block D : root cause (a timeline diagram)
  Block E : the fix (before/after response)
  Block F : verification + remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "05 · 트러블슈팅 02"

HEADING (30px font-black):
  VERBATIM: "단어는 맞는데 문장이 되면 이상해 보였다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "단어 하나씩 재생하면 자연스러웠다. 그런데 문장으로 이어 붙이면
   단어와 단어 사이에서 손이 순간이동하듯 튀었다.
   프론트 담당은 데이터가 이상하다고 했고, 나는 데이터가 맞다고 생각했다.
   둘 다 맞는 말이었다."

=== BLOCK B: THE SIDE-BY-SIDE PLAYERS (the defining idea) ===
Margin-top 36px. Container, height ~420px, rounded-md,
border 1px rgba(126,184,255,0.18), background #0d1a2b, padding 22px.

A TOGGLE at the top-center: font-mono 11px, width 220px, height 32px,
background rgba(255,255,255,0.04), border 1px rgba(126,184,255,0.22), rounded,
two halves:
  LEFT  VERBATIM "전환 프레임 있음"  (active #4ade80)
  RIGHT VERBATIM "전환 프레임 없음"  (active #f87171)
Default: 전환 프레임 있음.

BELOW, a single wide stage (not two - the SAME hand plays under both conditions so
the comparison is exact) containing:
  - A spot-lit SVG hand, large (~180px)
  - A sentence label above it, font-mono 12px rgba(255,255,255,0.72),
    VERBATIM: "내일 학교 가다"
  - A CURRENT-WORD label beneath the hand, font-mono 13px #bfdbfe, updating as the
    sequence plays, e.g. VERBATIM: "학교"
  - A MOTION TRAIL following the palm: a 2px path in rgba(126,184,255,0.28).
    In "전환 프레임 있음" the trail is CONTINUOUS. In "전환 프레임 없음" the trail
    BREAKS at each word boundary with a visible gap, and a small red marker appears
    at each break, font-mono 9px #f87171, VERBATIM: "끊김"
    The trail is the clearest possible evidence - make it prominent.
  - A play button beneath, font-mono 12px font-black, padding 9px 20px, rounded-md,
    border 1px rgba(126,184,255,0.45), color #7eb8ff, VERBATIM: "문장 재생"

  IN "전환 프레임 없음": at each word boundary the hand's position, rotation and
  finger values JUMP instantly to the next word's first keyframe - a true
  discontinuity, not a fast tween. Between words, a 0.15s freeze makes the jump
  unmistakable.
  IN "전환 프레임 있음": a short generated transition (about 0.2s) interpolates from
  the previous word's last pose to the next word's first pose.

  A FRAME TIMELINE runs along the container's bottom (height ~54px): a horizontal
  strip of small tick marks representing every frame in the sequence, colored by
  origin:
    word frames    #7eb8ff
    transition     #4ade80
    gap (missing)  #f87171 rendered as an empty notch
  Word boundaries are labeled beneath, font-mono 9px rgba(255,255,255,0.46).
  Toggling the mode visibly REMOVES or RESTORES the green transition ticks - the
  timeline is the data view of what the hand is doing.

  A message appears after the first playback in "전환 프레임 없음", 17px leading-9,
  max-width 460px:
    Line 1, rgba(255,255,255,0.88), VERBATIM:
      "동작 데이터는 맞았습니다."
    Line 2, #f87171, font-bold, margin-top 8px, VERBATIM:
      "사이를 안 채워서 보낸 게 문제였습니다."

A note at the container's bottom-left, font-mono 9px rgba(255,255,255,0.32),
VERBATIM: "재현용 예시입니다"

=== BLOCK C: THE BOUNDARY QUESTION CARD ===
Margin-top 44px, padding 22px, rounded-md, border 1px rgba(126,184,255,0.24),
background rgba(126,184,255,0.04), border-left 3px #7eb8ff.
  Label font-mono 11px letter-spacing 0.2em #7eb8ff, VERBATIM: "누가 채워야 하는가"
  Body, two paragraphs at 15px leading-8:
    P1 VERBATIM:
      "프론트에서 두 포즈 사이를 보간하면 될 일 아니냐는 얘기가 나왔다.
       실제로 그렇게 하면 화면은 부드러워진다."
    P2 VERBATIM:
      "그런데 수어에서 단어와 단어 사이의 이동은 아무렇게나 지나가도 되는 구간이 아니다.
       어디를 거쳐 가느냐가 의미에 영향을 줄 수 있다.
       그래서 「어떻게 이동할지」를 화면 쪽 판단에 맡기지 않고
       데이터를 만드는 쪽에서 정해서 내려보내기로 했다."
    Emphasize "데이터를 만드는 쪽에서 정해서 내려보내기로 했다" in #bfdbfe, font-bold.
  A small attribution line beneath, font-mono 10px rgba(255,255,255,0.40), VERBATIM:
    "이 판단은 팀에서 같이 정했고, 서버 쪽 구현을 제가 맡았습니다."

=== BLOCK D: ROOT CAUSE (a timeline diagram) ===
Margin-top 40px, padding 24px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05).
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인 · 응답에 무엇이 빠졌나"
  An SVG diagram, height ~170px, with two horizontal tracks:
    TRACK 1 label VERBATIM "수정 전": three word blocks placed adjacent with NO gap
      filler; between them, red vertical dashed lines labeled font-mono 9px #f87171,
      VERBATIM: "정의되지 않은 구간"
    TRACK 2 label VERBATIM "수정 후": the same three word blocks with short green
      transition blocks inserted between them, labeled font-mono 9px #4ade80,
      VERBATIM: "전환 구간"
  Blocks draw left to right, 0.12s apart, track 1 first.
  Below the diagram, body 16px leading-8, VERBATIM:
  "단어 하나짜리 응답은 완결된 동작이었다. 그래서 단어 API는 처음부터 문제가 없었다.
   문장 API가 그 단어들을 그냥 이어 붙여서 보냈고,
   이어 붙인 자리에 무엇이 있어야 하는지는 아무도 정의하지 않았다."
  Emphasize "이어 붙인 자리에 무엇이 있어야 하는지는 아무도 정의하지 않았다"
  in #fbbf24, font-bold.

=== BLOCK E: THE FIX ===
Margin-top 40px. Two panels side by side, gap 16px (stack below 1024px).
Each: background #081220, border 1px, rounded-md, header with three window dots and
a filename, body font-mono 12px with a line-number gutter, internal scroll.

  LEFT panel - border 1px rgba(248,113,113,0.28),
    filename VERBATIM: "GET /api/sentence (before)"
    CONTENT: ~14 lines of JSON. A response with a "signs" array where each element
    carries its own keyframes, and nothing between them.
    HIGHLIGHT the array boundary between two signs with rgba(248,113,113,0.12) and
    an inline marker, font-mono 10px #f87171, VERBATIM: "← 여기가 비어 있다"

  RIGHT panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "GET /api/sentence (after)"
    CONTENT: ~22 lines of JSON. The response now returns a single flattened
    "frames" timeline in which each frame carries a "source" field marking it as
    belonging to a word or to a generated transition, plus a "transitionMs" value
    and a "totalMs". Word boundaries are still recoverable from the source field, so
    the client can still label the current word.
    HIGHLIGHT the transition frames and the source field with
    rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "화면이 알아서 채우게 두지 않고, 서버가 채워서 보낸다"

BELOW BOTH PANELS, a code panel, background #081220,
border 1px rgba(126,184,255,0.18), rounded-md, header filename font-mono 11px,
VERBATIM: "SignSequenceAssembler.java"
Body: ~18 lines. The server-side assembler that concatenates per-word keyframes and
INSERTS a generated transition between consecutive words by interpolating from the
previous word's final pose to the next word's initial pose over a fixed duration,
tagging those frames with a transition source, and skipping the insertion when the
two poses are already close enough to a configurable threshold.
HIGHLIGHT the interpolation insertion and the closeness-threshold skip with
rgba(126,184,255,0.12).
A caption beneath, font-mono 10px rgba(255,255,255,0.35), VERBATIM:
  "이미 비슷한 위치면 전환을 넣지 않습니다. 넣으면 오히려 부자연스러워졌습니다."

=== BLOCK F: VERIFICATION + REMAINING LIMITS ===
Margin-top 40px.
Three stat cells in a row, gap 12px (stacks below 640px). Each: padding 16px,
rounded-md, border 1px rgba(74,222,128,0.22), background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "연속"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "문장 재생 시 손의 경로"
  Cell 2  value VERBATIM "0.2초"  label VERBATIM "단어 사이 전환 길이"
  Cell 3  value VERBATIM "8문장"  label VERBATIM "눈으로 확인한 문장 수"
Values fade in on entry.
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "직접 재생해서 눈으로 확인했습니다. 자연스러움을 정량적으로 측정하지는 않았습니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 4-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "전환 길이를 0.2초로 고정했습니다. 단어에 따라 달라야 하는데 그건 못 했습니다."
    "전환 경로를 직선 보간으로만 만듭니다. 실제 수어의 이동 경로는 그렇지 않을 수 있습니다."
    "전환 구간이 의미에 영향을 주는지 확인해줄 사람이 없었습니다."
    "응답 크기가 커졌습니다. 문장이 길어지면 프레임 수가 빠르게 늘어납니다."
  The third item points forward to the ethics page; the fourth is an honest
  engineering cost.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left
1.10s  The player container fades up; the frame timeline draws left to right (0.6s)
1.80s  A one-time playback runs automatically in "전환 프레임 있음" mode so the
       viewer sees the correct version FIRST
3.20s  A pulse on the "전환 프레임 없음" half of the toggle (a soft red ring,
       2 pulses of 0.9s) with a hint, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "이제 전환 프레임을 꺼보세요"
       Both disappear permanently once the toggle is used.
All later blocks animate on their own viewport entry.

=== PERFORMANCE ===
One requestAnimationFrame loop drives the hand and the timeline cursor together.
Stop it when the container is out of the viewport or the tab is hidden.
Never put playback time in React state.

=== RESPONSIVE ===
< 1024px: fix panels stack (before on top).
< 720px: the frame timeline scrolls horizontally inside its own container with a
560px minimum width.
< 640px: stage height 220px; code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: the auto-playback does not run; pressing play advances the
sequence with the hand snapping between keyframes in BOTH modes, and the difference
is conveyed by the frame timeline and the trail rendering instead of by motion.
The toggle is a real switch (role="switch", aria-checked) with a visible focus ring
(2px #7eb8ff, offset 2px).
Announce the mode change ONCE via aria-live="polite":
  없음 VERBATIM: "전환 프레임을 제거했습니다. 단어 사이에서 동작이 끊깁니다."
  있음 VERBATIM: "전환 프레임을 적용했습니다. 동작이 이어집니다."
Provide a visually-hidden description of the sentence's movement in both modes.

=== DO NOT ===
Do not frame the broken motion as funny or glitchy in a playful way - it is a defect
in a language-learning tool and the copy treats it seriously.
Do not fake the discontinuity with a fast tween - it must be a true instant jump.
Do not remove the boundary question card - the backend/frontend reasoning is the
most senior thinking on this page.
```

---

## PAGE 07 — 백엔드 구조와 팀 안에서의 내 자리

**개발 실체**: Spring Boot + Firebase 구조 + **내 담당과 팀원 담당의 명확한 구분**
**연출 장치**: 관람객이 `요청 보내기` 를 누르면 경로를 따라가고, **아바타 렌더링 구간에서 색이 바뀐다**

```text
Build an ARCHITECTURE section where the viewer sends a simulated request through the
system and watches it travel, with the segments this developer built lit in blue and
the teammate-built avatar rendering segment clearly marked in a different treatment.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The end-to-end structure of this service
2. An explicit, honest boundary: this developer built the backend, a teammate built
   the 3D avatar rendering
3. The scope of the backend work in concrete terms

=== MOOD ===
The gallery's back office with a wiring diagram on the wall.
Cool blue, structural, calm, unpossessive.

=== ETHICS (binding) ===
No disability simulation, no pity framing. Sign language is a language.
Do not overstate ownership of a teammate's work.

=== DESIGN TOKENS (use exactly) ===
background #060d18 | panel #0d1a2b | primary #7eb8ff | accent #bfdbfe
hand #dbeafe | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
mine #7eb8ff | teammate #c4b5fd | external rgba(255,255,255,0.22)
fonts: headings font-black, body sans leading-8, ALL diagram labels font-mono
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1040px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE REQUEST PATH - full width, height ~470px
  Block C : the scope cards (4)
  Block D : the team honesty note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "06 · 전체 구조"

HEADING (28px font-black):
  VERBATIM: "제가 만든 건 아바타가 아니라, 아바타가 읽는 데이터였습니다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "팀 프로젝트였고 저는 백엔드를 맡았습니다.
             화면에서 제일 눈에 띄는 3D 아바타는 팀원이 만들었습니다.
             아래에서 요청을 하나 보내보면, 어느 구간이 누구 몫이었는지 보입니다."

=== BLOCK B: THE REQUEST PATH (the defining idea) ===
A container, height ~470px, background #0d1a2b,
border 1px rgba(126,184,255,0.18), rounded-md, padding 26px. Drawn in SVG.

A SEND CONTROL at the top-center: a segmented pair choosing the request,
font-mono 11px:
  VERBATIM "단어 조회"  |  VERBATIM "문장 변환"
and a button beside it, font-mono 12px font-black, padding 9px 20px, rounded-md,
border 1px rgba(126,184,255,0.45), color #7eb8ff, VERBATIM: "요청 보내기"

THE PATH: seven nodes across two staggered rows, connected by rails.
  NODE 1  VERBATIM "React 화면"              ownership TEAM (frontend, shared)
  NODE 2  VERBATIM "Spring Boot API"          ownership MINE
  NODE 3  VERBATIM "형태소 분석 · 어순 재배열"  ownership MINE
  NODE 4  VERBATIM "수어 사전 (Firebase)"      ownership MINE
  NODE 5  VERBATIM "시퀀스 조립 · 전환 생성"    ownership MINE
  NODE 6  VERBATIM "3D 아바타 렌더링"          ownership TEAMMATE
  NODE 7  VERBATIM "화면 표시"                 ownership TEAM

NODE STYLING BY OWNERSHIP:
  MINE      : border 1px #7eb8ff, background rgba(126,184,255,0.08),
              label rgba(255,255,255,0.86), glow box-shadow 0 0 20px
              rgba(126,184,255,0.14)
  TEAMMATE  : border 1px #c4b5fd, background rgba(196,181,253,0.06),
              label rgba(255,255,255,0.80), and a small corner tag,
              font-mono 8px #c4b5fd, VERBATIM: "팀원"
  TEAM      : border 1px dashed rgba(255,255,255,0.24),
              background transparent, label rgba(255,255,255,0.55), corner tag
              font-mono 8px rgba(255,255,255,0.40), VERBATIM: "공동"

THE TRAVEL ANIMATION (on pressing 요청 보내기):
  A blue packet dot travels the rails, pausing 0.28s at each node while an
  annotation chip appears beside it, font-mono 9px, colored to match that node's
  ownership.
  FOR "단어 조회": 1 -> 2 -> 4 -> 2 -> 1 -> 6 -> 7.
    Annotations VERBATIM in order:
      "단어 id 요청" / "요청 수신" / "키프레임 조회" / "응답 조립" / "데이터 수신" /
      "아바타에 적용" / "재생"
  FOR "문장 변환": 1 -> 2 -> 3 -> 4 -> 5 -> 2 -> 1 -> 6 -> 7.
    Annotations VERBATIM:
      "문장 전송" / "요청 수신" / "어순 재배열" / "단어별 키프레임 조회" /
      "전환 프레임 삽입" / "타임라인 응답" / "데이터 수신" / "아바타에 적용" / "재생"
  When the dot reaches NODE 6, the rail and node switch to the TEAMMATE color and a
  brief caption appears beneath it, font-mono 10px #c4b5fd, VERBATIM:
    "여기부터는 팀원이 만든 부분입니다"
  That color change is the honesty made visible.
  Total about 3.2s (word) / 4.0s (sentence). Visited nodes stay lit.

A LEGEND at the bottom-right, font-mono 10px, three rows with 12px swatches:
  VERBATIM "내가 만든 부분" / "팀원이 만든 부분" / "공동 작업"

A note at the container's bottom-left, font-mono 9px rgba(255,255,255,0.30),
VERBATIM: "구간별 응답 시간은 측정하지 않았습니다"

=== BLOCK C: THE SCOPE CARDS ===
Margin-top 52px. Four cards in a 2x2 grid, gap 14px (1 column below 720px).
Each: padding 20px, rounded-md, border 1px rgba(126,184,255,0.20),
background rgba(126,184,255,0.04), with a font-mono 10px letter-spacing 0.18em
#7eb8ff label and a 3-item list at 14px leading-7 with "· " prefixes.

CARD 1  label VERBATIM: "API 설계"
  "Spring Boot 기반 백엔드 서버 구현"
  "단어 조회와 문장 변환 엔드포인트 설계"
  "응답에 전환 프레임을 포함하도록 구조 변경"
CARD 2  label VERBATIM: "데이터"
  "수어 데이터 입력 처리와 스키마 설계"
  "단어별 인정 표현 목록 구축"
  "Firebase 컬렉션 구조 정리"
CARD 3  label VERBATIM: "학습 로직"
  "퀴즈 정답 판정과 피드백 로직 구현"
  "오답 기반 재출제 스케줄링"
  "학습 상태 저장 구조 설계"
CARD 4  label VERBATIM: "문장 변환"
  "형태소 분석 연동"
  "수어 어순 재배열 규칙 구현"
  "사전에 없는 단어의 지문자 폴백"

=== BLOCK D: THE TEAM HONESTY NOTE ===
Margin-top 36px, padding 22px, rounded-md, border 1px rgba(196,181,253,0.28),
background rgba(196,181,253,0.04), border-left 3px #c4b5fd.
  Label font-mono 10px letter-spacing 0.18em #c4b5fd,
  VERBATIM: "제가 만들지 않은 것"
  Body 15px leading-8, VERBATIM:
  "3D 아바타 모델과 렌더링, 애니메이션 적용은 팀원이 만들었습니다.
   화면에서 제일 먼저 보이는 부분이라 오해되기 쉬운데, 그건 제 작업이 아닙니다.
   저는 그 아바타가 무엇을 언제 어떻게 움직여야 하는지를 정의한 데이터와,
   그 데이터를 만들어 내려보내는 서버를 맡았습니다.
   프론트엔드 화면도 팀에서 나눠서 작업했습니다."
  Emphasize "그건 제 작업이 아닙니다" in #c4b5fd, font-bold.
  This card must be at least as prominent as the scope cards above it.

=== RESPONSIVE ===
< 900px: the path becomes a VERTICAL flow (seven nodes stacked, the packet travels
downward and back); container height 640px.
< 640px: node labels 10px; scope cards single column.

=== ACCESSIBILITY ===
prefers-reduced-motion: no packet travel - pressing 요청 보내기 lights the whole
path instantly with all annotations visible.
The request selector is a real radiogroup and the send button a real button, both
with visible focus rings (2px #7eb8ff, offset 2px).
Ownership must NOT be conveyed by color alone - each non-mine node carries a text
corner tag, and a visually-hidden ordered description states each node's owner
explicitly.
Provide a visually-hidden text version of both request paths.

=== DO NOT ===
Do not use a diagramming library - hand-draw the SVG.
Do not overstate ownership. The teammate node's distinct color, its corner tag, the
legend, the mid-path caption, and the honesty note must ALL remain.
Do not invent per-segment latency numbers.
```

---

## PAGE 08 — 감수받지 못했습니다 · 이 프로젝트의 한계

**개발 실체**: **수어 서비스로서 검증받지 못한 부분 전체를 한 페이지로 선언**
**연출 장치**: 갤러리의 마지막 벽 — 액자는 걸려 있는데 **모두 「검증 대기」 라벨이 붙어 있다**

```text
Build a LIMITATIONS section that states plainly what this sign-language project was
never validated on, using a gallery wall where every frame carries a "pending
review" plate instead of a normal label.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That no Deaf person or sign-language expert reviewed this project
2. Exactly which claims the project therefore cannot make
3. What the developer would do before continuing
This page's value comes entirely from its honesty. Do not soften it, do not
apologize excessively, and do not turn it into a virtue signal.

=== MOOD ===
The last wall of the gallery, lit evenly. Nothing hidden, nothing dramatized.
Plain, direct, adult. Not apologetic, not defensive.

=== ETHICS (this page IS the ethics) ===
No disability simulation, no pity framing, no inspiration narrative.
Do not claim to speak for Deaf people. Do not present the developer as an ally or a
good person for acknowledging this. State facts.

=== DESIGN TOKENS (use exactly) ===
background #060d18 | panel #0d1a2b | primary #7eb8ff | accent #bfdbfe
ok #4ade80 | warn #fbbf24 | pending rgba(255,255,255,0.30)
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
frame rgba(126,184,255,0.20)
fonts: headings font-black, body sans leading-8, labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1020px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE PENDING-REVIEW WALL - full width, height ~480px
  Block C : the "what this project can and cannot claim" table
  Block D : the "what I would do first" card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "07 · 이 프로젝트의 한계"

HEADING (28px font-black):
  VERBATIM: "이 서비스의 수어 표현은 감수받지 않았습니다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "학교 프로젝트였고, 공개된 자료를 참고해서 데이터를 만들었습니다.
             농인 당사자나 수어 통역사에게 검토받은 적은 없습니다.
             그래서 이 서비스가 보여주는 동작이 정확한지, 자연스러운지를
             제가 보증할 수 없습니다. 이건 기술적인 한계가 아니라
             만드는 과정에서 빠뜨린 절차입니다."
  Emphasize "만드는 과정에서 빠뜨린 절차입니다" in #fbbf24, font-bold.

=== BLOCK B: THE PENDING-REVIEW WALL (the defining idea) ===
Margin-top 44px. A container, height ~480px, background #0d1a2b,
border 1px rgba(126,184,255,0.18), rounded-md, padding 28px, with an even wash of
light across it (no dramatic spotlights - this wall is lit plainly).

FIVE FRAMES in a row (wrapping to 3+2 below 900px, 2+2+1 below 640px), each
150x190px: a 8px frame in #14243a with an inner 1px rgba(126,184,255,0.16) line, and
a mat area containing a simple neutral icon or a short label.
Beneath each frame, a LABEL PLATE - but instead of a normal museum plate, each is
marked pending: background rgba(255,255,255,0.03),
border 1px dashed rgba(255,255,255,0.22), padding 8px 11px, with:
  - a title line, font-mono 11px rgba(255,255,255,0.72)
  - a status line, font-mono 9px rgba(255,255,255,0.42),
    VERBATIM on every plate: "검증 대기"

FRAMES (title / what the mat shows):
  1  title VERBATIM "동작의 정확성"
     mat: an SVG hand at rest, at 55% opacity
  2  title VERBATIM "문장 어순 규칙"
     mat: three small blocks in a row with a reorder arrow
  3  title VERBATIM "인정 표현 목록"
     mat: three stacked text chips
  4  title VERBATIM "표정·비수지 신호"
     mat: an EMPTY mat with a dashed outline and a centered line, font-mono 10px
     rgba(255,255,255,0.35), VERBATIM: "다루지 않음"
  5  title VERBATIM "지역·세대별 차이"
     mat: an empty mat, same treatment, VERBATIM: "다루지 않음"

Frames 4 and 5 are deliberately EMPTY - they represent things the project did not
address at all, as distinct from things it addressed but did not validate.
The distinction must be visible: frames 1-3 have content at reduced opacity;
frames 4-5 have nothing.

HOVER (or focus) a frame: its plate expands downward (height animation, 0.35s) to
reveal a detail line, 13px leading-7, rgba(255,255,255,0.72). Details VERBATIM:
  1  "공개 자료를 참고해 제가 키프레임을 만들었습니다. 원어민 검토는 없었습니다."
  2  "규칙 세 개로 재배열합니다. 실제 문법은 이보다 훨씬 복잡합니다."
  3  "같은 뜻으로 인정할 표현을 제가 판단해서 넣었습니다."
  4  "한국수어에서 표정은 문법입니다. 이 프로젝트는 그걸 아예 다루지 않았습니다."
  5  "표현은 지역과 세대에 따라 다릅니다. 하나의 표준만 담았습니다."

A summary line beneath the wall, font-mono 11px rgba(255,255,255,0.46),
tabular-nums, VERBATIM: "검증 대기 5 · 검증 완료 0"
The zero is the honest number and must be shown.

A note at the container's bottom, 15px leading-8, max-width 640px, VERBATIM:
  "이 벽을 채우려면 코드가 아니라 사람이 필요합니다."
This single line is the page's thesis. Give it visual weight (16px, centered,
rgba(255,255,255,0.86)) but no decoration.

=== BLOCK C: THE CLAIMS TABLE ===
Margin-top 52px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "이 프로젝트로 말할 수 있는 것과 없는 것"
A 2-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 14px. Headers VERBATIM: "말할 수 있는 것" | "말할 수 없는 것"
Rows (left cells prefixed "○ " in #4ade80, right cells prefixed "✕ " in
rgba(255,255,255,0.40)):
  "동작을 시계열 데이터로 설계했다"      | "그 동작이 정확한 한국수어인지"
  "정답 판정을 표현 집합으로 다시 짰다"  | "그 표현 집합이 충분한지"
  "어순 재배열 파이프라인을 만들었다"    | "그 결과가 자연스러운 문장인지"
  "전환 구간을 서버에서 생성했다"        | "그 전환이 의미를 해치지 않는지"
  "학습 반복 구조를 설계했다"           | "이 방식이 실제로 학습에 효과적인지"
Rows fade in 0.1s apart on entry.

Below the table, one paragraph, 15px leading-8, VERBATIM:
  "왼쪽은 제가 한 일이고 증명할 수 있습니다.
   오른쪽은 이 프로젝트가 답할 수 없는 질문들입니다.
   포트폴리오에서 오른쪽까지 했다고 말하고 싶은 유혹이 있었는데, 그러지 않기로 했습니다."
Emphasize "그러지 않기로 했습니다" in #bfdbfe, font-bold.

=== BLOCK D: THE "WHAT I WOULD DO FIRST" CARD ===
Margin-top 40px, padding 24px, rounded-md, border 1px rgba(126,184,255,0.24),
background rgba(126,184,255,0.04), border-left 3px #7eb8ff.
  Label font-mono 11px letter-spacing 0.2em #7eb8ff, VERBATIM: "다시 한다면 먼저 할 것"
  A 4-item numbered list, 15px leading-8, each prefixed with a font-mono number,
  VERBATIM:
    "1  데이터를 만들기 전에 검토해줄 사람을 먼저 구한다"
    "2  단어 수를 늘리는 것보다 있는 단어를 검증받는 것을 우선한다"
    "3  표정을 다룰 수 없다면, 다룰 수 없다는 걸 화면에 표시한다"
    "4  학습 효과는 주장하지 않고, 사용자에게 물어본 결과만 말한다"
  A closing line, 15px leading-8, margin-top 16px, VERBATIM:
  "지금은 「수어를 다루는 서비스를 만들어본 경험」까지입니다.
   그 이상을 말하려면 절차가 더 필요합니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.80s  Paragraph
1.40s  The wall container fades up with an even light wash (no spotlight sweep)
1.80s  The five frames fade in 0.09s apart - WITHOUT any drop, tilt, or bounce.
       This wall is deliberately still; the other walls in this room animate, this
       one does not.
2.40s  The pending plates fade in beneath them, 0.07s apart
2.90s  The summary line, then the thesis line at 3.20s
Blocks C and D animate on their own viewport entry.

=== RESPONSIVE ===
< 900px: frames wrap 3+2; container height auto.
< 640px: frames wrap 2+2+1 at 128x162px; the claims table becomes a stacked pair
list where each row shows the "말할 수 있는 것" line above the "말할 수 없는 것" line.

=== ACCESSIBILITY ===
prefers-reduced-motion: everything renders in place; plate expansion is instant.
Each frame must be focusable with a visible focus ring (2px #7eb8ff, offset 2px),
and keyboard focus must expand its plate exactly as hover does.
The plates must use a proper disclosure pattern (aria-expanded).
Empty frames 4 and 5 must NOT be aria-hidden - their emptiness is content, and their
"다루지 않음" text carries it.
Contrast: the pending plates use dashed borders and text, never opacity alone, to
convey their state.

=== DO NOT ===
Do not soften or remove any item on this page.
Do not present this acknowledgment as a virtue or use it to praise the developer.
Do not claim to speak on behalf of Deaf people or the Deaf community.
Do not animate this wall dramatically - its stillness is deliberate.
```

---

## PAGE 09 — 결과 · 화면 갤러리

**개발 실체**: 완성된 화면들 + 백엔드가 만든 것의 결과
**연출 장치**: 갤러리 전체 조명이 균일하게 켜지며 갤러리 공개

```text
Build a RESULTS SECTION presenting the finished service's screens as a gallery, for
a sign-language learning service portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What was actually built, in screens
2. The concrete outcome stated without invented metrics
3. A restatement of the validation limitation

=== MOOD ===
The gallery fully lit at closing hour. Cool blue, calm, factual.
No celebration.

=== ETHICS (binding) ===
No disability simulation, no pity or inspiration framing. Every hand pose in a
capture must have its meaning visible or captioned. No real Deaf individuals,
interpreters, or organizations in any image.

=== DESIGN TOKENS (use exactly) ===
background #0a1422 (lifted from earlier sections) | panel #101f33
primary #7eb8ff | accent #bfdbfe | hand #dbeafe
ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1140px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the gallery (5 items, asymmetric grid)
  Block C : the outcome stats
  Block D : the validation note + numbers note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "08 · 결과"

HEADING (32px font-black):
  VERBATIM: "동작을 보고 배우고, 문장을 입력해 확인할 수 있는 서비스"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "수어 단어를 학습하고, 텍스트를 수어 표현으로 확인할 수 있는
             서비스 프로토타입을 만들었습니다.
             제가 맡은 백엔드에서는 동작 데이터 구조, 문장 변환 파이프라인,
             정답 판정과 반복 학습 로직을 담당했습니다."

=== BLOCK B: THE GALLERY ===
An asymmetric grid, margin-top 48px:
  Row 1: one large item (2 columns) + one small item
  Row 2: three equal items
Gap 16px. Below 900px -> single column.

Each item: background #101f33, border 1px rgba(126,184,255,0.18), rounded-md,
overflow hidden.
  A 30px header strip with a font-mono 10px uppercase label on the left
  (rgba(255,255,255,0.48)) and a small blue dot on the right.
  Below it, the image area (aspect noted per item).
  A caption bar at the bottom, padding 12px 14px,
  border-top 1px rgba(126,184,255,0.10), font-mono 11px rgba(255,255,255,0.48).

ITEM 1 (large, aspect 16/10)  header VERBATIM "01 · 단어 학습"
  [IMG-03] the word learning screen with the avatar playing a sign
  caption VERBATIM: "동작을 보고 뜻을 맞히는 화면"
ITEM 2 (small, aspect 9/16)   header VERBATIM "02 · 퀴즈 · 모바일"
  [IMG-04] the quiz screen on a phone
  caption VERBATIM: "틀린 단어는 다시 나온다"
ITEM 3 (aspect 16/10)         header VERBATIM "03 · 문장 변환"
  [IMG-05] the sentence-to-sign screen
  caption VERBATIM: "입력한 문장이 수어 어순으로 재배열된다"
ITEM 4 (aspect 16/10)         header VERBATIM "04 · 데이터 구조"
  [IMG-06] a capture of the sign data schema (Firebase console or a JSON view)
  caption VERBATIM: "동작 하나가 저장되는 형태"
ITEM 5 (aspect 16/10)         header VERBATIM "05 · 학습 기록"
  [IMG-07] the learning progress screen
  caption VERBATIM: "무엇을 얼마나 봤는지"

IMAGE PLACEHOLDER SPEC (if no image is supplied): a CSS placeholder inside the
aspect box - background #060d18, a faint 24px blue grid, and centered text in
font-mono 12px rgba(255,255,255,0.35) reading the slot name and ratio, e.g.
VERBATIM "[IMG-03] · 16:10"

HOVER: the item lifts 4px, its border goes to rgba(126,184,255,0.45), and the image
scales 1.03 inside its clipped frame. 0.35s. Click opens a lightbox
(overlay rgba(4,9,16,0.94), backdrop-blur(8px), image max-width 1240px, the caption
below it, Esc / overlay click closes, arrow keys move between items).

=== BLOCK C: THE OUTCOME STATS ===
Margin-top 56px. Four stat cells in a row, gap 14px (2x2 below 768px).
Each: padding 22px, rounded-md, border 1px rgba(126,184,255,0.22),
background rgba(126,184,255,0.04).
  value font-mono 32px font-black #7eb8ff tabular-nums
  label font-mono 11px rgba(255,255,255,0.48), margin-top 6px
  Cell 1  value VERBATIM "12"   label VERBATIM "등록한 수어 단어"
  Cell 2  value VERBATIM "5"    label VERBATIM "단어당 키프레임"
  Cell 3  value VERBATIM "4"    label VERBATIM "변환 파이프라인 단계"
  Cell 4  value VERBATIM "0"    label VERBATIM "전문가 감수 횟수"
Cell 4's value is in #fbbf24 with a 1px rgba(251,191,36,0.30) border. It sits in the
same row as the achievements on purpose.
Values count up over 0.8s on entry.

=== BLOCK D: THE VALIDATION NOTE + NUMBERS NOTE ===
Margin-top 32px. First, the validation note:
  padding 16px 20px, rounded-md, border 1px rgba(251,191,36,0.28),
  background rgba(251,191,36,0.05), font-mono 11px #fbbf24, VERBATIM:
  "이 서비스의 수어 표현은 농인 당사자나 수어 전문가의 감수를 받지 않았습니다.
   학습용 프로토타입이며, 정확한 수어 학습 자료로 사용하기에는 검증이 부족합니다."

Then, margin-top 14px, a slim numbers note: padding 14px 18px, rounded-md,
border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02).
  font-mono 11px rgba(255,255,255,0.45), VERBATIM:
  "위 숫자는 구현 범위를 센 것입니다. 사용자 수나 학습 효과에 대한 데이터는 없습니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The page background lifts #060d18 -> #0a1422 over 1.2s with an even light
       wash (no sweeping spotlight)
0.10s  Label, heading word by word at 0.25s
0.80s  Paragraph
1.30s  Gallery items fade up 0.09s apart (y 18px -> 0, 0.55s)
2.20s  Stat cells fade up 0.09s apart, values counting
2.80s  Validation note, then the numbers note at 3.00s

=== RESPONSIVE ===
< 900px: single-column gallery; the 9/16 item is capped at 420px height and centered.
< 768px: stat cells 2x2; heading 24px.

=== ACCESSIBILITY ===
prefers-reduced-motion: no count-up, no hover scale, no background transition.
Every gallery item is a real <button> opening the lightbox with a visible focus ring
(2px #7eb8ff, offset 2px). Each image needs a descriptive Korean alt text derived
from its caption; captures containing a hand pose must name the sign's meaning in
the alt text.
The validation note must be in normal document order.

=== DO NOT ===
Do not invent user counts, learning outcomes, or accuracy percentages.
Do not include images of real Deaf individuals, interpreters, or organizations.
Do not remove the validation note or the "전문가 감수 0회" stat.
Do not add confetti.
```

---

## PAGE 10 — 회고 · 다음 단계 · 퇴장

**개발 실체**: KPT 회고 (PROBLEM 포함) + 다음 단계 + GitHub
**연출 장치**: 갤러리 조명 소등 → 마지막으로 손이 한 동작을 하고 퇴장

```text
Build the CLOSING SECTION of a sign-language learning service portfolio page: a KPT
retrospective, next steps, a repository link, and an exit transition where the
gallery lights go down and a hand performs one last sign.
Stack: React + TypeScript + Tailwind CSS + framer-motion. SVG hand only.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An honest retrospective including real problems, not just wins
2. Concrete next steps
3. The repository link
4. A clean exit back to the village

=== MOOD ===
The gallery at closing. Lights coming down, one last piece still lit.
Quiet, honest, unsentimental. No triumphalism, no emotional swell.

=== ETHICS (binding) ===
No disability simulation, no pity or inspiration framing. The closing sign is
labeled with its meaning, like every other hand on this page.

=== DESIGN TOKENS (use exactly) ===
background #0a1422 | panel #101f33 | primary #7eb8ff | accent #bfdbfe
hand #dbeafe | keep #4ade80 | problem #f87171 | try #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

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
  VERBATIM: "기술보다 먼저 확인했어야 할 게 있었다"

PARAGRAPH (16px leading-9, max-width 720px, margin-top 20px):
  VERBATIM: "데이터 구조를 잘 짜는 건 제가 할 수 있는 일이었습니다.
             그런데 그 데이터가 맞는지는 저 혼자서는 알 수 없는 일이었고,
             그걸 프로젝트가 끝날 때까지 미뤄뒀습니다.
             다음에 비슷한 주제를 다룬다면 순서를 바꿀 생각입니다."

=== BLOCK B: KPT ===
Margin-top 52px. Three columns, gap 16px (single column below 768px).
Each column: padding 22px, rounded-md, background #101f33,
border 1px rgba(255,255,255,0.10), with a 3px top border in its own color.
Header: font-mono 11px letter-spacing 0.2em, uppercase.
Items: 15px leading-8, each prefixed "· ", 14px apart.

COLUMN 1 - header VERBATIM "KEEP", color #4ade80, top border #4ade80. Items VERBATIM:
  "동작을 정지 이미지가 아니라 시계열로 설계한 것"
  "정답을 하나가 아니라 표현 집합으로 바꾼 것"
  "전환 구간을 화면이 아니라 서버에서 정한 것"

COLUMN 2 - header VERBATIM "PROBLEM", color #f87171, top border #f87171. Items VERBATIM:
  "수어 표현을 검증할 사람을 끝까지 구하지 않았다"
  "표정을 다루지 않으면서 그 사실을 화면에 표시하지 않았다"
  "단어 수를 늘리는 데 시간을 더 썼다"

COLUMN 3 - header VERBATIM "TRY", color #fbbf24, top border #fbbf24. Items VERBATIM:
  "학습 콘텐츠 확장과 실제 사용자 테스트 진행"
  "감수 절차를 개발 일정 안에 넣기"
  "다룰 수 없는 부분을 화면에 명시하기"

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), top border
grows 3px -> 4px. 0.3s.

=== BLOCK C: NEXT STEPS CARD ===
Margin-top 48px, padding 22px, rounded-md, border 1px rgba(126,184,255,0.22),
background rgba(126,184,255,0.04), border-left 3px #7eb8ff.
  Label font-mono 11px letter-spacing 0.2em #7eb8ff, VERBATIM: "다음 단계"
  Body 16px leading-8, margin-top 12px, VERBATIM:
  "학습 콘텐츠 확장과 실제 사용자 테스트를 진행할 예정입니다.
   다만 단어를 더 넣기 전에, 지금 있는 12개부터 검토받는 게 먼저라고 생각합니다."

=== BLOCK D: GITHUB LINK ===
Margin-top 40px. A single primary link button:
  background #7eb8ff, color #060d18, font-mono 14px font-black,
  padding 14px 28px, rounded-md.
  Label VERBATIM: "GitHub 저장소 ↗"
  Hover: scale 1.04, box-shadow 0 0 28px rgba(126,184,255,0.34). Active: scale 0.97.
  href https://github.com/toadsam/Sign-Language, target _blank, rel noreferrer.

=== BLOCK E: EXIT BUTTON + EXIT TRANSITION ===
Margin-top 72px. A full-width button, height 88px, rounded-md,
border 1px rgba(255,255,255,0.14), background transparent.
  Label centered, font-mono 15px, letter-spacing 0.1em, rgba(255,255,255,0.62),
  VERBATIM: "← 마을로 돌아가기"
  Hover: border -> rgba(126,184,255,0.45), label -> #7eb8ff, and a faint gallery
  light glow appears behind it. 0.4s.

EXIT TRANSITION (on click of this button OR the header's "← 마을로"):
  t=0.00s  Content fades to opacity 0 over 0.35s
  t=0.30s  All gallery lights dim to 20% over 0.5s, EXCEPT one spot at the viewport
           center which stays at full
  t=0.80s  An SVG HAND appears in that remaining spot and performs ONE sign over
           1.2s, with its meaning label beneath it, font-mono 12px #bfdbfe,
           VERBATIM: "수고하셨습니다"
           (Labeled, like every hand in this room.)
  t=2.00s  The hand settles and fades over 0.4s
  t=2.40s  The last spot fades out over 0.5s; the background settles to #060d18
  t=2.90s  Emit an onExit callback so the parent can restore the 3D village scene.
  Body scroll locks during the transition; the parent releases it.
  No sound at any point. No flash.

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
GitHub button full width; the closing hand renders at 140px.

=== ACCESSIBILITY ===
prefers-reduced-motion: all reveals instant; the exit transition dims the lights
over 0.3s and shows the hand in its FINAL pose (no animation) with its label for
1.0s before fading.
The exit button must be a real <button>, keyboard focusable, with a visible focus
ring (2px #7eb8ff, offset 2px).
The closing sign needs a visually-hidden movement description alongside its label.

=== DO NOT ===
Do not soften the PROBLEM column - the honesty is the point.
Do not add an emotional swell, a thank-you message beyond the labeled sign, or any
inspirational closing line.
Do not show the closing hand without its meaning label.
Do not add sound.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-1. 개발 실체 커버리지 점검

| 항목 | 어디에 | 형태 |
|---|---|---|
| **왜 만들었나** | P00 | 첫 수어 동작 직후 문장 (4초 안에) |
| **담당이 백엔드임** | **P01 액자 C · P07 전체 · P07 팀 노트** | **3곳에서 반복 명시** |
| **데모 영상** | P01 액자 A | 갤러리 액자 (**자막 필수**) |
| **GitHub** | P01 액자 B · P10 버튼 | 액자 + 마무리 버튼 |
| **관람객 직접 조작** | **P02(재생·스크럽·드래그) · P03(문장 변환·두 줄 재생) · P04(정답 입력) · P05(퀴즈 5문제) · P06(전환 토글) · P07(요청 보내기)** | **6곳** |
| **코드** | P02(스키마 JSON) · P03(SignSentenceService) · P04(QuizService before/after + Firebase 스키마) · P05(QuizScheduler) · P06(응답 before/after + Assembler) | **총 8개** |
| **트러블슈팅** | P04 (동의 표현 오판정) · P06 (전환 프레임 누락) | **전체 프로세스 2건** |
| **설계 의사결정** | P02(스키마에서 뺀 것) · P05(일부러 안 넣은 것) · P06(누가 채우는가) | 근거 카드 3개 |
| **윤리·검증 한계** | **P08 한 페이지 통째로** | 검증 대기 5 · 완료 0 |
| **결과물** | P09 | 갤러리 5장 |
| **회고** | P10 | KPT (PROBLEM 3개) |

## D-2. 새로 만들 파일
```
src/components/ui/project-viewers/stages/sign-language/
  index.tsx                 ← PAGE 00~10 순서, 손동작 카운터 소유
  useSignPlayer.ts          ← ⭐ 키프레임 재생 엔진 (P00·P02·P03·P04·P05·P06·P10 전부 사용)
  SvgHand.tsx               ← ⭐ 손 실루엣 1종 (파라미터: 위치·회전·손가락 굽힘 5)
  signData.ts               ← ⭐ 12단어 × 5키프레임 + 인정 표현 목록
  MotionTrail.tsx           ← 손바닥 경로 궤적 (P02·P06)
  GalleryEntrance.tsx       ← P00 · 조명 + 첫 동작
  FrameWall.tsx             ← P01 · 액자 3점
  HandPlayerLab.tsx         ← P02 · 재생기 + JSON 라이브 하이라이트 + 드래그 편집
  WordOrderCompare.tsx      ← P03 · 두 줄 동시 재생 + 파이프라인
  AnswerJudgeCase.tsx       ← P04 · 오판정 재현
  LearningLoop.tsx          ← P05 · 5문제 + 대기열 시각화
  TransitionGapCase.tsx     ← P06 · 전환 토글 + 프레임 타임라인
  OwnershipPath.tsx         ← P07 · 요청 경로 + 3색 소유권
  PendingWall.tsx           ← P08 · 검증 대기 벽
  copy.ts                   ← 모든 한국어 문구
  assets.ts                 ← [IMG-01~07] · [VIDEO-01]
```

> ⭐ **선행 3종을 먼저 만들 것.**
> `SvgHand.tsx` → `signData.ts`(12단어) → `useSignPlayer.ts`.
> **7개 페이지가 이 셋을 공유**합니다. 손을 페이지마다 다시 그리면 이 방은 못 만듭니다.
> `useSignPlayer` 는 처음부터 `speed`, `paused`, `frameIndex`, `transitions: on/off`
> 를 prop으로 받게 설계할 것 — P02 스크럽, P05 0.5x, P06 전환 토글이 전부 이걸로 갈립니다.

## D-3. 기존 코드 재사용 / 선행 작업
재사용: `CodeBlock`, `ImageSlot`, `CountUp`, `RevealText` (`shared.tsx`)

> ⚠️ **선행 작업 (10개 프로젝트 공통 1건)**: `shared.tsx` 의 `DecisionTable`,
> `ArchDiagram`, `CompareBars`, `ProcessTimeline`, `QuoteCard`, `TldrBanner`,
> `BeforeAfter`, `ChallengeCard` 가 현재 **모듈 내부 함수(비export)** 입니다.
> stage 폴더에서 쓰려면 export로 승격해야 합니다.
> 이 방은 표가 많아 `DecisionTable` 승격 필요 (P02·P04·P08).

## D-4. 버릴 것
- `[KILL]` `PlatformProjectViewer` 의 sign-language 분기 → stage 폴더로 이전
- `[KILL]` 기존 `SIGNATURE` 데모 → P02 `HandPlayerLab` 로 흡수

## D-5. 미디어 확보 목록

| 슬롯 | 내용 | 비율 | 우선도 | 비고 |
|---|---|---|---|---|
| `[VIDEO-01]` | 퀴즈 → 동작 재생 → 정답 → 문장 변환 (1분 28초) | 16/9 | 높음 | **자막 필수** |
| `[IMG-01]` | 실제 퀴즈 화면 | 9/16 | 높음 | P05 |
| `[IMG-02]` | 오답 직후 피드백 화면 | 9/16 | 중간 | P05 |
| `[IMG-03]` | 단어 학습 화면 (아바타 재생 중) | 16/10 | **최상** | P09 |
| `[IMG-04]` | 모바일 퀴즈 | 9/16 | 높음 | P09 |
| `[IMG-05]` | 문장 변환 화면 | 16/10 | **최상** | P09 |
| `[IMG-06]` | **수어 데이터 스키마 캡처** (Firebase 콘솔 또는 JSON) | 16/10 | **최상** | P09 · 백엔드 담당의 증거 |
| `[IMG-07]` | 학습 기록 화면 | 16/10 | 중간 | P09 |

> 🔴 **캡처 전 필수 확인**
> - 실존 농인·수어 통역사·단체의 **이름·사진·로고가 없어야** 합니다
> - Firebase 콘솔 캡처에 **프로젝트 ID·API 키·이메일**이 안 보이게
> - 아바타 캡처에는 **그 동작의 뜻이 화면에 함께** 보이는 프레임을 고를 것
>   (뜻 없는 손 이미지는 이 방의 원칙 위반)
> - `[IMG-06]` 이 이 방에서 제일 중요합니다 — **"아바타는 팀원, 데이터는 나"** 를
>   증명하는 유일한 이미지입니다

## D-6. 코드 스니펫 확보 목록 (전부 실제 저장소에서)
| 페이지 | 파일 | 줄 | 하이라이트 |
|---|---|---|---|
| P02 | `GET /api/signs/{id}` 응답 | 34 | keyframes 5개 · handedness |
| P03 | `SignSentenceService.java` | 26 | 어순 재배열 규칙 · 지문자 폴백 |
| P04 | `QuizService.java (before)` | 10 | 단일 문자열 비교 |
| P04 | `QuizService.java (after)` | 20 | 집합 판정 · 근접 오답 로깅 |
| P04 | `signs` 컬렉션 (Firebase) | 12 | acceptedMeanings 배열 |
| P05 | `QuizScheduler.java` | 22 | 같은 세션 재삽입 · 세션 분리 조건 |
| P06 | `GET /api/sentence (before)` | 14 | 단어 배열만 |
| P06 | `GET /api/sentence (after)` | 22 | 평탄화 frames · source 필드 |
| P06 | `SignSequenceAssembler.java` | 18 | 전환 보간 삽입 · 근접 시 생략 |

## D-7. 안전장치 대조표

이 방은 **제어권을 뺏지 않습니다.** 그리고 **장애 체험 연출을 하지 않습니다.**

| 페이지 | 장치 | 안전장치 |
|---|---|---|
| 전 페이지 | 무음 | **사운드 토글 자체를 두지 않음** — "뺏은 것"이 아니라 원래 없는 것 |
| P02 | 드래그 편집 | 되돌리기 상시 · 손에만 `touch-action: none` |
| P04 | 오판정 재현 | 입력 흔들림 3회 이내 · 재현용 명시 |
| P05 | 퀴즈 | **스트릭·순위표·효과음 없음** · 틀리면 정답 즉시 공개 |
| P06 | 끊김 재현 | 정상 버전을 **먼저** 자동 재생한 뒤에 토글 유도 |
| P08 | 검증 대기 벽 | **애니메이션 없음** — 이 벽만 일부러 정적 |

## D-8. 최종 체크리스트 (윤리 항목 최우선)

**윤리 (이 방의 존재 이유)**
- [ ] **장애 체험(simulation) 연출이 0개인지** — 소리 뺏기·시야 가리기·"그들의 세계" 류
- [ ] 무음이 **"서비스가 소리를 안 쓴다"** 로 설명되는지 (결핍으로 프레이밍 금지)
- [ ] **손 모양이 뜻 라벨 없이 등장하는 곳이 0개인지** (P04 퀴즈는 정답 공개 + 숨김 설명으로 충족)
- [ ] 손이 **장식·로딩·배경 패턴으로 쓰이지 않았는지**
- [ ] 손 실루엣에 **피부색·성별·연령 표지가 없는지**
- [ ] **"따뜻한 기술" "소외된 이웃" 류 시혜적 표현이 0개인지**
- [ ] **수어를 "한국어를 손으로 옮긴 것"으로 서술한 곳이 0개인지**
- [ ] **P08 「검증 완료 0」 이 그대로 남아 있는지** — 이 방의 신뢰도가 여기 걸림
- [ ] P08 이 **자기 미화로 읽히지 않는지** (인정한다고 칭찬받으려는 톤 금지)
- [ ] P09 **감수 미이행 고지**가 남아 있는지 · `전문가 감수 0회` 스탯이 있는지
- [ ] 실존 농인·통역사·단체의 이름·이미지가 0개인지

**소유권**
- [ ] **"3D 아바타는 팀원 작업"** 이 P01·P07·P07노트 **3곳**에 다 있는지
- [ ] P07 팀원 노드가 **색 + 코너 태그 + 범례 + 중간 캡션 + 노트** 5중으로 표시되는지

**구현**
- [ ] 선행 3종(`SvgHand` → `signData` → `useSignPlayer`)을 **먼저** 만들었는지
- [ ] 재생 시간을 **React state로 관리하지 않는지** (rAF + ref)
- [ ] JSON 패널을 **프레임마다 리렌더하지 않는지**
- [ ] 모든 rAF 루프가 **뷰포트 밖 + 탭 숨김 시 정지**하는지
- [ ] P02 드래그가 **손에만** `touch-action: none` (컨테이너에 걸면 스크롤 죽음)
- [ ] P03 두 줄의 **재생 길이를 억지로 맞추지 않았는지** (차이가 정보)
- [ ] P03 모르는 단어를 **에러가 아니라 지문자 폴백**으로 처리하는지
- [ ] P05 **스트릭·순위표·효과음·컨페티가 0개인지**
- [ ] P05 오답 시 **정답을 즉시 공개**하는지
- [ ] P06 끊김이 **진짜 순간 점프**인지 (빠른 트윈으로 흉내내지 말 것)
- [ ] P06 끊김을 **재미있는 글리치로 다루지 않았는지**
- [ ] P08 벽에 **드롭·기울기·바운스 애니메이션이 없는지** (정적이어야 함)
- [ ] 데모 영상에 **자막**이 있는지
- [ ] 숫자 전부 `tabular-nums`
- [ ] **사운드 토글이 어디에도 없는지** (다른 방과 달리 토글 자체가 없어야 함)
- [ ] 지어낸 수치 0개 — 사용자 수·학습 효과·정확도 주장 금지
