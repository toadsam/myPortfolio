# 01. MyWave — 프롬프트 팩 · ⛔ 단독 방으로는 폐기 (02에 통합)

> # 🛑 이 문서를 그대로 쓰지 마세요 (2026-07-31)
>
> **MyWave에는 독립 저장소가 없습니다.** `toadsam/MyWave` 는 존재하지 않고,
> MyWave는 `toadsam/MyStock-Desk` 저장소 안의 화면입니다:
>
> - 프론트 `frontend/src/mywave/MyWaveApp.tsx` · `myWaveApi.ts` · `myWaveData.ts`
> - 백엔드 `backend/.../dashboard/MyWaveDashboardController.java` · `MyWaveDashboardService.java`
> - 게다가 현재 `frontend/src/App.tsx` 는 **`<MyWaveApp />` 만 렌더**합니다
>
> 방을 두 개로 두면 **두 방의 GitHub 링크가 같은 저장소로 갑니다.**
> 링크를 눌러본 면접관에게 바로 드러나므로, **02 MyStock 한 방으로 통합**했습니다.
>
> ### 코드 쪽은 반영 완료
>
> `constants.ts` 에서 `project-mywave` 건물 제거 · NPC 참조를 `project-mystock` 으로 이관 ·
> `projects.ts` / `resume.ts` 는 **"MyStock-Desk / MyWave"** 한 항목으로 병합.
> `richContent/mywave.tsx`(350줄)와 `mywaveBrief.ts` 는 **지우지 않고 남겨뒀습니다** —
> 02 방의 한 단계로 재배치할 때 그대로 씁니다.
>
> ### 이 문서를 어떻게 쓰나
>
> 폐기가 아니라 **부품 창고**로 쓰세요. 아래 페이지 중 **자산 흐름 화면에만 해당하는 연출**
> (물결/유체 표현, 12개월 타임라인, 목표 관리 화면)은 **02 MyStock 문서의 한 페이지로 옮겨서**
> "같은 서비스의 다른 화면"으로 소개하면 됩니다.
> `[FIX-04] 색 충돌`(01 ↔ 10이 둘 다 `#34d399`)도 **통합으로 자동 해소**됐습니다.
>
> ⚠️ 아래 본문에는 "독립 프로젝트" 전제의 서술이 그대로 남아 있습니다. 옮길 때 걷어내세요.

> 개인 자산 흐름을 한눈에 이해하도록 돕는 금융 관리 대시보드 (MyStock-Desk 저장소 내 화면) · React / TypeScript / Chart UI / Tailwind CSS
> **사용법**: `PAGE 00` ~ `PAGE 10` 의 코드블록을 **하나씩 통째로 복사해서 Variant에 붙여넣으세요.**
> 각 프롬프트는 **완전히 자립적**입니다 (색상·폰트·무드가 매번 반복 포함).
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.

> ⚠️ **이 프로젝트의 성격을 먼저 정직하게 잡고 갑니다.**
> MyWave는 **백엔드 연동 전의 프론트엔드 프로토타입**이고, 담당은 **기획 · 정보 구조 설계 · 컴포넌트 설계**입니다.
> 그래서 이 방은 "복잡한 실시간 시스템"인 척하지 않습니다. 대신 **정보 설계 결정을 눈으로 증명**합니다.
> 트러블슈팅도 서버 장애가 아니라 **"같은 데이터가 화면마다 다르게 보였다"** 는 프론트엔드 고유의 문제를 다룹니다.
> 없는 걸 부풀리는 순간 면접에서 제일 먼저 무너집니다.

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 방의 한 문장

**"돈은 잔액이 아니라 흐름이다. 그래서 이 화면은 물결이다."**

## A-2. 왜 이 메타포인가

MyWave가 풀려던 문제는 **"숫자가 많아질수록 사용자가 아무 결정도 못 한다"** 는 것이었다.
잔액 화면은 정보가 아니라 정지 화면이다. 지난달보다 나은지, 목표에 가까워졌는지를 말해주지 않는다.

그래서 이 프로젝트는 자산을 **점이 아니라 곡선**으로, **상태가 아니라 흐름**으로 보여준다.

그렇다면 이 프로젝트를 설명하는 페이지가 **정지된 문서면 그 자체로 모순**이다.
이 방에서는 **스크롤이 곧 시간축**이다. 내려갈수록 자산 곡선이 그려지고,
관람객은 자기 스크롤로 12개월을 통과한다.

## A-3. ⭐ 가장 중요한 원칙 — 연출은 개발 내용의 운반 수단이다

**모든 연출은 반드시 개발 실체를 하나 이상 전달해야 한다.** 멋있기만 한 연출은 넣지 않는다.

| 전달할 개발 실체                                  | 그걸 실어나르는 연출                                                                   | 페이지 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- | ------ |
| 왜 이걸 만들었나 (동기)                           | 잔액 숫자가 물결로 풀어지는 진입 시퀀스 + 첫 문장                                      | 00     |
| 데모 영상 · GitHub                                | **수면 아래에서 떠오르는 부표 3개**                                                    | 01     |
| **정보 설계가 이 프로젝트의 핵심이었다**          | **같은 데이터를 두 배치로 동시에 보여주고, 관람객이 직접 골라보게 함**                 | 02     |
| 자산 흐름 시각화 구현                             | **스크롤이 시간축** — 내려갈수록 곡선이 그려지고 옆에서 데이터 변환 코드가 따라감      | 03     |
| **트러블 01: 카드와 차트가 다른 숫자를 보여줬다** | **관람객이 "따로 계산" 토글을 켜면 눈앞에서 두 값이 어긋난다** → 단일 데이터 모델 도입 | 04     |
| 목표 관리와 요약의 분리                           | **"현재 상태" 화면과 "다음 행동" 화면을 물리적으로 분리해 나란히**                     | 05     |
| **트러블 02: 금액 표기가 화면마다 달랐다**        | 같은 금액이 4가지로 표기된 화면 → 포맷 규칙 통일 + 접근성 규칙                         | 06     |
| 컴포넌트 분리 방향                                | 하나의 대시보드가 컴포넌트 단위로 분해되었다가 재조립됨                                | 07     |
| 이 프로젝트의 범위와 한계                         | **"이건 프로토타입입니다"를 숨기지 않고 한 장 전체로**                                 | 08     |
| 결과물 · 화면 갤러리                              | 수면이 잔잔해지며 갤러리 공개                                                          | 09     |
| 회고 · 다음 단계                                  | 물결이 가라앉으며 퇴장                                                                 | 10     |

## A-4. 설계 결정 ↔ 웹 재현 대응

| 서비스에서 내린 결정             | 이 웹페이지에서의 재현                           |
| -------------------------------- | ------------------------------------------------ |
| 잔액이 아니라 흐름을 보여준다    | **스크롤이 시간축이 되어 곡선이 그려진다**       |
| 현재 상태와 다음 행동을 분리한다 | **두 화면을 물리적으로 떼어놓고 나란히 놓는다**  |
| 차트와 카드는 같은 데이터를 본다 | **일부러 어긋나게 해보고, 왜 그랬는지 보여준다** |
| 증감을 색으로만 말하지 않는다    | 이 페이지의 모든 증감에 **부호와 화살표 병기**   |

## A-5. 관람 곡선 (감정 + 정보 밀도)

```
이해  ╭──────────╮ P02~04 설계 논증 (밀도 최고)
     ╱            ╰──╮   ╭── P06 표기 통일
 P00                  ╰───╯   ╰────╮
 수면                                 ╰──── P08~10 범위 인정 · 마무리
정보  낮 ────╱▔▔▔▔▔▔▔▔▔▔▔▔╲──────
          P02~07 개발 밀도 최고조
수위  ▁ ── ▃ ── ▅ ── ▆ ── ▇ ── █
```

**핵심 장치**: 헤더에 **`3월 → 다음 달`** 형태의 월 표시가 있고,
**스크롤 진행도가 곧 12개월의 시간축**이다. 진행바 역할과 컨셉 전달을 동시에 한다.
페이지 배경 하단의 물결 수위도 스크롤에 따라 함께 올라간다.

## A-6. 명장면 2개

**① PAGE 02 — 같은 데이터, 두 배치** (설계 논증의 클라이맥스)
왼쪽은 숫자만 빽빽한 배치, 오른쪽은 흐름 중심 배치. **데이터는 완전히 같다.**
관람객에게 묻는다: _"이번 달에 뭘 하면 될지, 어느 쪽이 먼저 보이나요?"_
버튼을 누르면 자기 선택이 집계되지 않고 **그냥 옆에 설계 근거가 펼쳐진다.**
(여론조사가 아니라, 관람객이 스스로 답을 낸 뒤 근거를 읽게 하는 순서가 핵심)

**② PAGE 04 — 두 숫자가 어긋나는 순간** (기술의 클라이맥스)
"따로 계산" 토글을 켜면 **카드의 합계와 차트의 합계가 눈앞에서 다른 값이 된다.**
뜨는 문장: _"둘 다 제가 짠 코드입니다. 그리고 둘 다 자기 딴엔 맞았습니다."_

## A-7. 다른 9개 방과의 차별점

| 축          | MyWave                               | 나머지          |
| ----------- | ------------------------------------ | --------------- |
| 주제        | **정보 설계 자체**                   | 기능 구현       |
| 관람객 역할 | **설계 판단에 참여**                 | 관찰자 · 조작자 |
| 스크롤 의미 | **시간축 (12개월)**                  | 단순 진행       |
| 정직함      | **"프로토타입"을 한 장 통째로 인정** | 카드 단위 인정  |
| 색          | 청록 · 수면                          | 각자            |

## A-8. 절대 금지 (안전 규칙)

- **금융 조언으로 읽힐 문구 전면 금지.** 저축 권유·투자 제안·"이렇게 하면 부자" 류
- **실제 금액처럼 보이는 수치 금지.** 전부 예시임을 명시하고 라운드한 값 사용
- 백엔드/실데이터가 있는 것처럼 서술 금지 — **P08에서 범위를 명확히 선언**
- 증감을 **색으로만** 구분 금지 — 부호(+/−)와 화살표(▲/▼) 항상 병기
- 물결 애니메이션은 **`prefers-reduced-motion` 에서 완전 정지**, 뷰포트 밖에서도 정지
- 소리 없음 (이 방은 무음)

---

# B. 공통 디자인 토큰 (참고용 — 각 프롬프트에 이미 포함됨)

| 토큰              | 값                                                                    | 용도                                    |
| ----------------- | --------------------------------------------------------------------- | --------------------------------------- |
| `--bg`            | `#04110c` → `#061a13` (P09부터)                                       | 페이지 배경                             |
| `--panel`         | `#08201a`                                                             | 카드 · 패널                             |
| `--primary`       | `#34d399`                                                             | 청록 · 강조                             |
| `--accent`        | `#6ee7b7`                                                             | 보조 강조                               |
| `--up` / `--down` | `#34d399` / `#f87171`                                                 | 증가/감소 (**반드시 부호·화살표 병기**) |
| `--ok` / `--warn` | `#4ade80` / `#fbbf24`                                                 | 검증 / 주의                             |
| `--text`          | `rgba(255,255,255,0.88)`                                              | 본문                                    |
| `--muted`         | `rgba(255,255,255,0.46)`                                              | 캡션                                    |
| `--wave`          | `rgba(52,211,153,0.12)`                                               | 수면                                    |
| 코드 패널         | bg `#06170f`, border `rgba(52,211,153,0.18)`                          |                                         |
| 문법 색           | 주석 `#4a7a63` / 문자열 `#fcd34d` / 키워드 `#34d399` / 숫자 `#7dd3fc` |                                         |
| 이징              | `cubic-bezier(0.4,0,0.2,1)`, 0.4~0.9s                                 | 느리고 유연하게                         |
| 숫자              | 전부 `tabular-nums`                                                   |                                         |

---

# C. 페이지별 프롬프트

---

## PAGE 00 — 수면 아래 (진입 시퀀스)

**개발 실체**: 왜 이걸 만들었는가 (동기)
**연출 장치**: 잔액 숫자 하나가 물결로 풀어지며 흐름이 됨

```text
Build a full-screen cinematic ENTRY SEQUENCE for a personal finance dashboard
portfolio page, where a single static balance number dissolves into a flowing wave.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Single self-contained
component. Draw the wave in SVG - no libraries.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
Why this project was built. The final readable line must state the developer's
motivation, within 4 seconds.

=== MOOD ===
Deep still water at night, seen from just below the surface. Teal on near-black.
Calm, slow, contemplative. NOT a fintech growth-hacking aesthetic. NO upward
arrows shooting off screen, NO coin/money imagery, NO celebration.

=== COMPLIANCE (applies to every page in this project) ===
Never write anything that reads as financial advice or a savings/investment
recommendation. Every amount shown is an EXAMPLE and must be labeled as such
somewhere on the page.

=== DESIGN TOKENS (use exactly) ===
background #04110c | panel #08201a | primary teal #34d399 | accent #6ee7b7
up #34d399 | down #f87171 | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
wave fill rgba(52,211,153,0.12)
fonts: headings font-black, body sans leading-8, ALL numbers/labels font-mono
easing cubic-bezier(0.4,0,0.2,1), durations 0.4s-1.4s | rounded-md
ALL numbers tabular-nums

=== LAYOUT ===
Full viewport, position fixed, above page content.
Background: #04110c with a very soft teal radial glow at 50% 60%
(rgba(52,211,153,0.05), 70vw).
Content centered, max-width 620px.

=== TIMELINE (follow exactly) ===
t=0.00s  Near-black. Nothing.
t=0.40s  A single large number fades in at the center, font-mono 64px font-black,
         rgba(255,255,255,0.88), tabular-nums, VERBATIM: "4,820,000"
         with a small unit beneath it, font-mono 12px rgba(255,255,255,0.46),
         VERBATIM: "원 · 현재 잔액"
t=1.30s  A quiet line appears below it, 15px, rgba(255,255,255,0.46), VERBATIM:
         "이 숫자만 보고 이번 달에 뭘 하면 될지 아시겠어요?"
t=2.40s  THE DISSOLVE. The number's digits break apart:
           - each digit glyph animates independently, drifting downward 40-90px,
             rotating up to 8deg, fading to 0 over 0.9s, staggered 0.05s apart
           - as they fall, an SVG WAVE builds up from the bottom of the viewport:
             two overlapping sine paths, fill rgba(52,211,153,0.12) and
             rgba(52,211,153,0.07), rising from 0 to 38vh over 1.0s
           - the waves then drift horizontally at different speeds
             (14s and 22s per loop, transform translateX only) - slow, never busy
t=3.40s  THE MOTIVATION LINE fades in above the waterline. This is the substance of
         this page. 17px, leading-9, rgba(255,255,255,0.88), max-width 540px.
         Korean copy, VERBATIM:
         "가계부 앱을 몇 번 깔았다가 지웠다. 숫자는 다 있는데
          그래서 뭘 하라는 건지가 없었다.
          잔액 대신 흐름을 보여주면 다를까 싶어서 만들었다."
         Reveal word by word, stagger 0.035s, y 6px -> 0.
t=4.50s  TITLE settles above the motivation line:
           Line 1, VERBATIM: "MyWave"
             52px font-black, #34d399, letter-spacing -0.02em
           Line 2, VERBATIM: "개인 자산 흐름 대시보드 · React + TypeScript"
             13px font-mono, rgba(255,255,255,0.46), letter-spacing 0.14em,
             margin-top 12px
t=5.00s  Scroll hint at the bottom, over the wave, font-mono 12px
         rgba(255,255,255,0.46), VERBATIM: "↓ 12개월을 내려갑니다"
         with a teal chevron drifting 4px on a 2.2s cycle.

=== THE SCROLL-AS-TIME BINDING (persists after this sequence) ===
From here on, whole-page scroll progress represents a 12-month timeline.
A month readout lives in the fixed header, format VERBATIM: "3월"
running from VERBATIM "1월" at the top to VERBATIM "12월" at the bottom.
The background waterline also rises with scroll progress, from 12vh to 46vh.
Bind scroll progress to CSS custom properties inside a requestAnimationFrame-
throttled listener. Do NOT store scroll position in React state.

=== ESCAPE HATCHES (required) ===
Any click, scroll, keypress, or Escape skips to the t=5.00s end state instantly.
A skip control from t=0.50s at the bottom-right, font-mono 11px,
rgba(255,255,255,0.35), VERBATIM: "[ 건너뛰기 ]"

=== ACCESSIBILITY ===
prefers-reduced-motion: no dissolve, no wave motion at all. Render the title,
motivation line and a STATIC wave silhouette immediately.
The balance number must be real text; the dissolve must not remove it from the
accessibility tree before the motivation line is announced.

=== RESPONSIVE ===
< 768px: balance number 42px, title 34px, motivation 15px, waterline 34vh.

=== DO NOT ===
No coins, no cash, no upward-shooting arrows, no confetti, no growth-hacking tone.
Do not imply the shown balance is real - add a tiny note at the bottom-left from
t=4.50s, font-mono 9px rgba(255,255,255,0.30), VERBATIM: "예시 데이터입니다"
Do not delay the motivation line past 4.0s.
```

---

## PAGE 01 — 히어로 · 수면 위의 부표

**개발 실체**: 프로젝트 정체 + **데모 영상 · GitHub · 담당 범위**
**연출 장치**: 링크가 버튼이 아니라 **수면 위에 떠 있는 부표 3개**

```text
Build the HERO SECTION of a personal finance dashboard portfolio page, where the
demo video, the GitHub repository and a scope note are three BUOYS floating on a
water surface - never a link row.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained section.
Draw the water in SVG.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the project is (identity + hard facts), stated honestly as a
   frontend prototype
2. The demo video entry point
3. The GitHub repository link
4. The developer's actual role
Items 2-4 must read as floating objects, not as buttons.

=== MOOD ===
Still water at night, teal on near-black. Calm, slow, considered.
NO fintech hype, NO coins, NO celebration.

=== COMPLIANCE ===
No financial advice. Every amount is an EXAMPLE and labeled as such.

=== DESIGN TOKENS (use exactly) ===
background #04110c | panel #08201a | primary teal #34d399 | accent #6ee7b7
up #34d399 | down #f87171 | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
wave rgba(52,211,153,0.12) | panel border rgba(52,211,153,0.18)
fonts: headings font-black, body sans leading-8, numbers/labels font-mono
easing cubic-bezier(0.4,0,0.2,1) 0.4s-1.2s | rounded-md | ALL numbers tabular-nums

=== PERSISTENT HEADER (fixed, present on every section) ===
Height 54px, background rgba(4,17,12,0.85), backdrop-blur(10px),
bottom border 1px rgba(52,211,153,0.18).
  LEFT   "← 마을로"  13px font-mono rgba(255,255,255,0.46)
  CENTER "MyWave"  14px font-black #34d399
  RIGHT  the month readout driven by scroll progress (1월 at the top, 12월 at the
         bottom), format VERBATIM: "3월"
         13px font-mono tabular-nums, preceded by a 40px mini progress track whose
         teal fill matches scroll progress.
         Bind scroll to a CSS custom property in a rAF-throttled listener; never
         React state.

=== LAYOUT ===
min-height 100vh, centered, max-width 1100px, padding-block 96px.
A single centered column for the text, with the WATER SURFACE occupying the lower
portion of the viewport as a full-bleed layer behind and below it.
  y ~16%  Kicker
  y ~24%  Headline (2 lines)
  y ~42%  Summary paragraph
  y ~54%  Fact grid (4 cells)
  y ~72%+ THE WATER with the three buoys

=== THE WATER SURFACE ===
A full-bleed SVG at the bottom of the section, height 46vh:
  - Three overlapping sine paths at different amplitudes and speeds, fills
    rgba(52,211,153,0.14), rgba(52,211,153,0.08), rgba(52,211,153,0.05)
  - They drift horizontally on 14s / 19s / 26s loops using transform translateX
    only (never re-rendering path data per frame)
  - A thin surface line at the top edge, stroke rgba(110,231,183,0.30), 1px
  - Below the surface, a subtle vertical gradient to #04110c

=== THE THREE BUOYS (the defining objects of this page) ===
Each buoy floats ON the surface line and BOBS gently: a 3.2s ease-in-out vertical
cycle of ±6px, each with a different phase offset so they never move in unison.
Each is a rounded shape with a small reflection beneath it (a mirrored, blurred,
20%-opacity copy) so it reads as sitting on water.
Hovering (or focusing) a buoy stops its bobbing, lifts it 5px, and expands a ripple
ring outward from its base (0 -> 60px, opacity 0.4 -> 0, 0.8s).

  BUOY A - DEMO VIDEO   (x ~24% of the width)
    A 96px circle, border 1.5px rgba(110,231,183,0.45),
    background rgba(8,32,26,0.85), containing a play triangle 22px #6ee7b7.
    Label beneath (on the water), font-mono 11px #6ee7b7,
    VERBATIM: "▶ 데모 영상"
    Sub-label, font-mono 9px rgba(255,255,255,0.46), VERBATIM: "1분 48초"
    Click -> video lightbox: overlay rgba(2,10,7,0.94) backdrop-blur(8px),
    16/9 player, max-width 1000px, Esc / overlay click closes.
    If no source is supplied render a CSS placeholder with centered text
    VERBATIM "데모 영상 자리 · 16:9".
    [VIDEO-01] a walkthrough: asset flow chart -> goal screen -> summary cards.

  BUOY B - GITHUB       (x ~54%)
    An 84px rounded square, border 1.5px rgba(255,255,255,0.22),
    background rgba(8,32,26,0.85), containing a monospace "< >" glyph 22px
    rgba(255,255,255,0.78).
    Label beneath, font-mono 11px rgba(255,255,255,0.82), VERBATIM: "GitHub"
    Sub-label, font-mono 9px rgba(255,255,255,0.46),
    VERBATIM: "React · TypeScript"
    Click -> https://github.com/toadsam in a new tab (target _blank, rel noreferrer).

  BUOY C - ROLE NOTE    (x ~80%)
    A 92x64px rounded rect, background rgba(10,38,30,0.9),
    border 1px rgba(255,255,255,0.14), tilted -4deg.
    Three tiny lines, font-mono 9px rgba(255,255,255,0.62), VERBATIM:
      "서비스 기획"
      "UI 구조 설계"
      "컴포넌트 설계"
    Not a link. Hovering straightens it to 0deg and stops its bob.

A hint above the water, font-mono 10px rgba(255,255,255,0.35), fading out
permanently once any buoy has been hovered or focused,
VERBATIM: "수면 위 부표를 눌러보세요"

=== CONTENT (Korean copy - VERBATIM, never translate) ===

KICKER (font-mono 12px, letter-spacing 0.3em, uppercase, color #34d399):
  "DASHBOARD · 개인 자산 흐름"

HEADLINE (font-black, 42px desktop / 27px mobile, leading-tight,
          rgba(255,255,255,0.88), centered):
  Line 1, VERBATIM: "잔액은 상태고,"
  Line 2, color #34d399, margin-top 10px, VERBATIM: "흐름은 정보다"

SUMMARY (16px leading-9, max-width 620px, centered, margin-top 22px):
  VERBATIM: "같은 데이터를 어떻게 배치하느냐에 따라 사용자가 다음에 뭘 할지가 달라진다.
             이 프로젝트에서 제가 한 일은 대부분 그 배치를 정하는 일이었습니다."
  Emphasize "그 배치를 정하는 일" in #6ee7b7, font-bold.

FACT GRID (4 cells in a row; 2x2 below 768px), margin-top 30px, max-width 720px,
centered. Each cell: border 1px rgba(52,211,153,0.20), rounded-md, padding 14px.
value font-mono 22px font-black #34d399 tabular-nums, label font-mono 10px
rgba(255,255,255,0.46) letter-spacing 0.1em below.
  Cell 1  value "4"          label "기술 스택"
  Cell 2  value "4"          label "핵심 화면"
  Cell 3  value "기획·설계"   label "담당 범위"
  Cell 4  value "프로토타입"  label "현재 단계"
The fourth cell is deliberately honest. Give it a 1px rgba(251,191,36,0.30) border
and a tiny note beneath the grid, font-mono 10px rgba(255,255,255,0.35), VERBATIM:
  "백엔드 연동 전 단계입니다. 자세한 범위는 뒤에서 밝힙니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Kicker fades up (y 10px -> 0, 0.6s)
0.20s  Headline line 1 word by word (stagger 0.04s), line 2 at 0.75s
1.30s  Summary reveals
1.80s  Fact cells fade in 0.09s apart
2.20s  The water rises from 0 to its full height over 1.0s, waves beginning their
       drift
3.00s  The three buoys DROP onto the surface 0.16s apart - each falls 30px, makes a
       small splash (a single ripple ring), then settles into its bobbing cycle
3.60s  The hint fades in

=== PERFORMANCE (required) ===
Wave drift and buoy bobbing must PAUSE when the section is out of the viewport
(IntersectionObserver) and when the tab is hidden.
Animate with transform only. Never regenerate SVG path data per frame.

=== RESPONSIVE ===
< 768px: headline 27px, fact grid 2x2, water height 38vh, buoys repositioned to
A(x 20%) B(x 52%) C(x 82%) with sizes 76 / 68 / 78px.
Touch: buoys need a 44px minimum touch target.

=== ACCESSIBILITY ===
prefers-reduced-motion: no wave drift, no bobbing, no drop-in, no ripples. A static
wave silhouette and stationary buoys.
Buoys A and B must be real focusable elements (button / anchor) with visible focus
rings (2px #34d399, offset 2px). Keyboard focus produces the same lift and ripple
as hover (ripple only if motion is allowed).
All numbers tabular-nums.

=== DO NOT ===
Do not render the video and GitHub as a conventional button row anywhere.
Do not overstate the project - the "프로토타입" fact cell and its note must stay.
No coins, no money imagery, no growth-hacking copy.
```

---

## PAGE 02 — 같은 데이터, 두 가지 배치

**개발 실체**: 정보 설계 결정 — **이 프로젝트의 핵심 기여**
**연출 장치**: 완전히 같은 데이터를 두 배치로 나란히 놓고, **관람객이 먼저 판단하게 한 뒤** 근거를 편다

```text
Build an INFORMATION DESIGN section that shows the SAME dataset arranged two
different ways side by side, asks the viewer which one answers a specific question
faster, and only then reveals the design reasoning.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That information architecture was the core contribution of this project
2. A concrete, checkable claim: the same numbers arranged differently change what
   the user notices first
3. The specific arrangement rules that were adopted, with reasons

=== MOOD ===
Still water, daylight starting to reach it. Teal on near-black, calm and analytical.
This page is a quiet argument, not a sales pitch.

=== COMPLIANCE ===
No financial advice. All amounts are EXAMPLES, labeled as such. Both layouts must
show IDENTICAL data - never let one have more information than the other.

=== DESIGN TOKENS (use exactly) ===
background #04110c | panel #08201a | primary teal #34d399 | accent #6ee7b7
up #34d399 | down #f87171 | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
fonts: headings font-black, body sans leading-8, ALL numbers/labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1120px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE QUESTION - a prominent single line
  Block C : THE TWO LAYOUTS side by side + the choice buttons
  Block D : the reasoning panel (hidden until the viewer chooses)
  Block E : the adopted rules table

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "01 · 정보 설계"

HEADING (28px font-black):
  VERBATIM: "데이터를 더 넣는 게 아니라, 순서를 바꾸는 일이었다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "아래 두 화면은 완전히 같은 데이터를 씁니다.
             항목 수도, 숫자도, 기간도 같습니다. 배치만 다릅니다."

=== BLOCK B: THE QUESTION ===
Margin-top 40px. A centered panel, max-width 640px, padding 20px 24px, rounded-md,
border 1px rgba(52,211,153,0.28), background rgba(52,211,153,0.05).
  Label font-mono 10px letter-spacing 0.2em #34d399, VERBATIM: "질문"
  Body 18px leading-8, font-bold, margin-top 8px, VERBATIM:
  "이번 달에 지출을 줄여야 할까요, 그대로 둬도 될까요?"
  Sub-line, 13px, rgba(255,255,255,0.46), margin-top 10px, VERBATIM:
  "두 화면을 보고, 어느 쪽에서 더 빨리 답이 나오는지 확인해보세요."

=== BLOCK C: THE TWO LAYOUTS (the defining idea) ===
Margin-top 36px. Two panels side by side, equal width, gap 18px
(stack below 900px, A on top).
Each: background #08201a, rounded-md, padding 20px, height ~440px,
border 1px rgba(255,255,255,0.12).
Each has a header label at the top, font-mono 11px rgba(255,255,255,0.60):
  LEFT  VERBATIM: "배치 A"     RIGHT VERBATIM: "배치 B"
Neither is labeled "before" or "worse" - the viewer must judge, not be told.

  LAYOUT A - VALUE-DENSE (the arrangement that was rejected)
    A 12-row table, font-mono 11px, row separators 1px rgba(255,255,255,0.06),
    row height 26px. Columns: category, this month, last month, difference.
    Categories VERBATIM: "식비" "교통" "주거" "통신" "의료" "문화" "교육" "의류"
    "구독" "경조사" "기타" "합계"
    All amounts round and example-like (e.g. VERBATIM "420,000").
    The difference column shows ARROW + SIGN + NUMBER, e.g. VERBATIM "▲ +38,000".
    Everything is the same size. Nothing is emphasized. No chart.
    This is honest density, not a strawman - it must look like a reasonable table
    someone would actually ship.

  LAYOUT B - FLOW-FIRST (the arrangement that was adopted)
    Top third: ONE headline sentence, 17px leading-8, rgba(255,255,255,0.88),
    VERBATIM: "이번 달 지출이 지난달보다 8% 많습니다"
    with the "8%" in #f87171 font-bold and preceded by an arrow, VERBATIM "▲".
    Beneath it a sub-line, font-mono 11px rgba(255,255,255,0.46), VERBATIM:
    "주로 식비와 문화 항목에서 늘었습니다"
    Middle third: a small SVG line chart of the last 6 months' total spending, with
    the current month's point emphasized (a 5px #34d399 dot with a halo) and the
    previous month's point marked with a thin dashed guide.
    Bottom third: only THREE category rows - the three that changed the most -
    each showing the category, its amount, and its change with ARROW + SIGN.
    Below them, a collapsed row, font-mono 11px rgba(255,255,255,0.46),
    VERBATIM: "나머지 9개 항목 보기 ▾"
    (It expands in place to reveal the remaining rows - the data is not hidden,
     just deprioritized. Making this expandable is required: both layouts must
     contain the same information.)

  A shared note beneath both panels, font-mono 9px rgba(255,255,255,0.32),
  centered, VERBATIM: "두 배치의 데이터는 완전히 동일합니다 · 예시 데이터"

THE CHOICE BUTTONS (centered, margin-top 20px):
  Two buttons side by side, font-mono 12px, padding 10px 22px, rounded-md,
  border 1px rgba(52,211,153,0.35), color #34d399, background transparent:
    VERBATIM "A가 빨랐다"   |   VERBATIM "B가 빨랐다"
  Clicking either one REVEALS BLOCK D. The choice itself is not scored, ranked, or
  counted - do not display any tally, percentage, or "most people chose" message.
  After choosing, the chosen button gets a filled background
  rgba(52,211,153,0.14) and the other dims to 45%.
  A third, quieter option beneath, font-mono 11px rgba(255,255,255,0.40),
  VERBATIM: "차이를 모르겠다 · 그냥 근거 보기"
  which also reveals Block D.

=== BLOCK D: THE REASONING PANEL (revealed after a choice) ===
Hidden initially (height 0, opacity 0). On reveal it expands over 0.6s with a
height + opacity animation and scrolls itself into view smoothly.
Margin-top 32px, padding 24px, rounded-md, border 1px rgba(52,211,153,0.24),
background rgba(52,211,153,0.04).
  Label font-mono 10px letter-spacing 0.2em #34d399, VERBATIM: "설계 근거"
  Body, three paragraphs at 16px leading-9, appearing 0.25s apart:
    P1 VERBATIM:
      "배치 A는 「얼마 썼는지」에 답합니다. 배치 B는 「그래서 어떤지」에 답합니다.
       질문이 후자였기 때문에 B를 골랐습니다."
    P2 VERBATIM:
      "A가 나쁜 배치는 아닙니다. 항목별로 정확한 금액을 확인해야 할 때는 A가 낫습니다.
       그래서 B에서도 나머지 항목을 접어뒀을 뿐 지우지는 않았습니다."
    P3 VERBATIM:
      "정보를 줄인 게 아니라 순서를 정한 겁니다.
       무엇을 먼저 읽게 할지를 정하는 게 이 프로젝트에서 제가 한 일의 대부분이었습니다."
      Emphasize "무엇을 먼저 읽게 할지를 정하는 게" in #6ee7b7, font-bold.

=== BLOCK E: THE ADOPTED RULES TABLE ===
Margin-top 48px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "화면 전체에 적용한 배치 규칙"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "규칙" | "이유" | "적용 화면"
Rows:
  "결론 문장을 맨 위에"     | "숫자보다 문장이 먼저 읽힌다"         | "요약 · 목표"
  "변화가 큰 3개만 먼저"    | "12개를 동시에 비교하지는 못한다"      | "지출 · 요약"
  "나머지는 접되 지우지 않음"| "정확한 값이 필요한 순간이 반드시 온다" | "전체"
  "증감은 부호와 화살표 병기"| "색만으로는 구분하지 못하는 사용자가 있다" | "전체"
  "기간은 항상 비교값과 함께"| "단일 값은 판단 근거가 되지 못한다"     | "전체"
Rows fade in 0.1s apart on entry.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s (stagger 0.03s)
0.70s  Paragraph
1.20s  The question panel fades up with a single soft teal glow pulse (0.9s)
1.80s  BOTH layout panels fade up TOGETHER (never staggered - simultaneity is the
       point), y 18px -> 0, 0.6s
2.40s  Layout A's rows appear 0.03s apart; Layout B's three sections appear 0.15s
       apart. Both finish within the same 0.6s window.
3.10s  The choice buttons fade in
Block E animates on its own viewport entry.

=== RESPONSIVE ===
< 900px: the two layouts stack (A on top) but keep a shared accent so the pairing
still reads. Add a small sticky-free label above each, VERBATIM "배치 A" / "배치 B".
< 640px: Layout A's table becomes horizontally scrollable inside its own panel
(never the page); Layout B's chart height 90px; choice buttons full width, stacked.

=== ACCESSIBILITY ===
prefers-reduced-motion: no glow pulse, no staggered rows, and Block D appears
instantly on choice.
The choice buttons must be real <button> elements with visible focus rings
(2px #34d399, offset 2px) and accessible names.
The "나머지 9개 항목 보기" control must be a real disclosure button with
aria-expanded, and the hidden rows must be in the DOM when expanded.
Every change value renders ARROW + SIGN + NUMBER - never color alone.
All numbers tabular-nums.

=== DO NOT ===
Do not make Layout A a strawman - it must look like a legitimate design choice.
Do not show any tally, vote count, or "most people chose B" message.
Do not let the two layouts contain different data.
Do not give financial advice in the headline sentence - it describes what happened,
never what the user should do.
```

---

## PAGE 03 — 스크롤이 시간축이다 · 자산 흐름 시각화

**개발 실체**: 자산 흐름 차트 구현 + **원시 데이터 → 차트 데이터 변환 코드**
**연출 장치**: **스크롤이 곧 시간축** — 내려갈수록 12개월 곡선이 그려지고, 옆 코드가 그 변환을 보여준다

```text
Build an ASSET FLOW VISUALIZATION section where whole-section scroll progress drives
a 12-month asset curve being drawn, with the data transformation code shown beside
it and its current stage highlighted.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Draw the chart in SVG -
no charting library.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. Why a flow curve was chosen over a balance number or a bar list
2. The raw-data -> chart-data transformation, as real TypeScript
3. The specific decisions inside that transform (missing months, smoothing, scale)

=== MOOD ===
Water surface being drawn by time. Teal on near-black. Slow, deliberate, satisfying.

=== COMPLIANCE ===
No financial advice. All amounts are EXAMPLES and labeled as such.

=== DESIGN TOKENS (use exactly) ===
background #04110c | panel #08201a | primary teal #34d399 | accent #6ee7b7
up #34d399 | down #f87171 | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #06170f, border rgba(52,211,153,0.18)
syntax: comments #4a7a63, strings #fcd34d, keywords #34d399, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + numbers font-mono 12px
easing linear for the scroll binding (it must track scroll exactly, not spring)
rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
This section is TALL on purpose: min-height 220vh, so the curve has room to draw.
A STICKY inner area, top 96px, height ~calc(100vh - 140px), containing:
  Block A (top, non-sticky, before the sticky area) : label + heading + paragraph
  Block B (sticky) : a two-column split, gap 18px
      LEFT  (58%) : THE CHART, height ~420px
      RIGHT (42%) : THE TRANSFORM CODE PANEL, height ~420px
  Block C (after the sticky area) : the transform decisions table
Below 1024px the sticky split stacks (chart on top) and the sticky height grows.

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "02 · 자산 흐름"

HEADING (28px font-black):
  VERBATIM: "점 하나로는 아무것도 알 수 없다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "이번 달 잔액이 480만 원이라는 사실만으로는 좋은 건지 나쁜 건지 모릅니다.
             지난 12개월과 같이 봐야 처음으로 판단할 수 있는 정보가 됩니다.
             아래는 스크롤을 내릴수록 그 12개월이 그려집니다."
  Emphasize "같이 봐야 처음으로 판단할 수 있는 정보가 됩니다" in #6ee7b7, font-bold.

=== BLOCK B LEFT: THE CHART (scroll-driven) ===
Container: height ~420px, rounded-md, border 1px rgba(52,211,153,0.18),
background #08201a, padding 22px.

Header strip: left font-mono 10px rgba(255,255,255,0.46),
VERBATIM: "총 자산 추이 · 12개월"
right, a live month readout, font-mono 11px #34d399, tabular-nums,
format VERBATIM: "3월"

THE SVG CHART:
  - A faint horizontal grid (4 lines, rgba(52,211,153,0.07)) with y-axis labels in
    font-mono 9px rgba(255,255,255,0.35), formatted in units of 만원, e.g.
    VERBATIM "500만"
  - An x-axis with 12 month ticks, font-mono 9px, VERBATIM "1월" through "12월",
    where months not yet reached are at 25% opacity
  - THE CURVE: a smooth path (Catmull-Rom or cardinal spline converted to a cubic
    path) through 12 example data points, stroke #34d399 2px, with an area fill
    beneath it in a gradient from rgba(52,211,153,0.18) to transparent.
  - THE DRAW BINDING: the curve's visible length is bound to SECTION scroll
    progress using stroke-dasharray / stroke-dashoffset, so scrolling forward draws
    it and scrolling back erases it. It must track scroll EXACTLY, with no easing
    or lag.
  - A LEADING DOT at the current end of the drawn path: a 6px #6ee7b7 circle with a
    soft halo, plus a vertical guide line down to the axis.
  - A VALUE TOOLTIP pinned above the leading dot, background #06170f,
    border 1px rgba(52,211,153,0.30), rounded, padding 6px 10px, font-mono 11px
    tabular-nums, showing the month and value, format VERBATIM:
      "3월  4,820,000원"
    and beneath it, the change from the previous month with ARROW + SIGN, e.g.
    VERBATIM "▲ +120,000"
  - ONE ANNOTATION: at the month with the largest drop, a small marker and a label
    in font-mono 9px rgba(255,255,255,0.55), VERBATIM: "이사 · 보증금 지출"
    It fades in only when the curve reaches that month.

  A note at the container's bottom-left, font-mono 9px rgba(255,255,255,0.32),
  VERBATIM: "예시 데이터입니다"

IMPLEMENTATION CONSTRAINT: bind scroll progress to a CSS custom property (e.g.
--p) on a wrapper inside a requestAnimationFrame-throttled scroll listener, and
drive stroke-dashoffset and the dot's transform from it. Do NOT store scroll
progress in React state, and do NOT recompute the path data on scroll - compute the
path once.

=== BLOCK B RIGHT: THE TRANSFORM CODE PANEL ===
Height ~420px, background #06170f, border 1px rgba(52,211,153,0.18), rounded-md.
Header bar: three window dots (#ff5f56 #ffbd2e #27c93f, 8px) then the filename,
font-mono 11px rgba(255,255,255,0.45), VERBATIM: "toChartSeries.ts"
Body: font-mono 12px, leading-relaxed, line-number gutter rgba(255,255,255,0.22).

CONTENT: a TypeScript module, roughly 26 lines, with FOUR clearly contiguous blocks:
  (1) a type definition for a raw monthly record and for a chart point,
  (2) sorting the raw records by month and FILLING GAPS - months with no record
      become an explicit null point rather than being skipped, so the x-axis stays
      evenly spaced,
  (3) computing each point's delta from the previous non-null point, and a flag for
      whether it increased,
  (4) deriving the y-axis domain from the data with padding, rounded to a clean
      unit so the axis labels are readable.

THE SCROLL-LINKED HIGHLIGHT (the key idea): as the curve is drawn, the code block
corresponding to the current phase gains a rgba(52,211,153,0.12) row background:
  - 0-20% of the section    -> block (1) highlighted
  - 20-50%                  -> block (2)
  - 50-80%                  -> block (3)
  - 80-100%                 -> block (4)
Transitions cross-fade over 0.3s. Only ONE block is highlighted at a time.
IMPLEMENTATION CONSTRAINT: toggle CSS classes on refs to the four block elements
from the same rAF loop - never re-render the code panel on scroll.

Caption bar at the bottom, border-top 1px rgba(52,211,153,0.12), font-mono 11px
rgba(255,255,255,0.45), prefixed "// ", changing with the active block:
  (1) VERBATIM: "// 차트가 볼 데이터의 모양을 먼저 정한다"
  (2) VERBATIM: "// 기록이 없는 달을 건너뛰면 시간 간격이 거짓말을 한다"
  (3) VERBATIM: "// 증감은 이 단계에서 확정한다. 화면에서 다시 계산하지 않는다."
  (4) VERBATIM: "// 축 범위를 데이터에서 뽑되, 읽기 좋은 단위로 자른다"

=== BLOCK C: THE TRANSFORM DECISIONS TABLE ===
After the sticky area ends. Margin-top 64px.
Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "변환 단계에서 내린 결정"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "상황" | "선택" | "이유"
Rows:
  "기록이 없는 달"       | "빈 점으로 남긴다"          | "건너뛰면 x축 간격이 왜곡된다"
  "값이 튀는 달"         | "그대로 그린다"             | "부드럽게 만들면 실제 사건이 사라진다"
  "y축 시작점"           | "0이 아니어도 된다"          | "단, 그럴 때는 축에 명시한다"
  "곡선 보간"            | "약한 스플라인만"           | "과하게 부드러우면 없던 추세가 생긴다"
Rows fade in 0.1s apart on entry.

Below the table, one paragraph, 15px leading-8, VERBATIM:
  "차트에서 제일 조심한 건 「보기 좋게 만들다가 사실을 바꾸는 것」이었습니다.
   y축을 0에서 시작하지 않으면 변화가 극적으로 보입니다. 그래서 그럴 때는
   축 라벨에 시작값을 반드시 적어뒀습니다."
Emphasize "보기 좋게 만들다가 사실을 바꾸는 것" in #fbbf24, font-bold.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  Chart container and code panel fade up together (y 18px -> 0, 0.6s); the
       chart's grid and axis draw, the curve at 0% drawn
1.80s  Block (1) of the code takes its highlight
Everything after that is scroll-driven, not time-driven.

=== PERFORMANCE ===
One rAF-throttled scroll listener for the whole section. CSS custom properties only.
No path recomputation on scroll. No layout-triggering properties.

=== RESPONSIVE ===
< 1024px: the sticky split stacks - chart on top (height 320px), code panel below
(height auto, max 360px, internal vertical scroll). Section min-height 260vh so
both still get scroll room.
< 640px: chart height 260px; x-axis shows every other month label; the tooltip
docks to the chart's top-right instead of following the dot; code font 11px with
internal horizontal scroll (the block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: NO scroll-driven drawing. Render the full curve immediately
and highlight code block (4). Add a caption above the chart, VERBATIM:
  "이 차트는 원래 스크롤에 따라 그려집니다."
Provide a visually-hidden data table of all 12 months with their values and
changes, so the chart is fully available to screen readers.
Change values render ARROW + SIGN + NUMBER, never color alone.
All numbers tabular-nums. Code is selectable, copyable text.

=== DO NOT ===
Do not use a charting library.
Do not store scroll progress in React state.
Do not smooth the curve enough to hide the drop month.
Do not start the y-axis at a non-zero value without labeling it.
```

---

## PAGE 04 — 트러블슈팅 01 · 카드와 차트가 다른 숫자를 말했다

**개발 실체**: 화면별 중복 계산으로 인한 값 불일치 → **단일 데이터 모델 도입 과정**
**연출 장치**: **"따로 계산" 토글** — 관람객이 켜면 눈앞에서 두 합계가 어긋난다

```text
Build a TROUBLESHOOTING section where the viewer can toggle "compute separately"
and watch a summary card and a chart display DIFFERENT totals for the same data,
then follows the full diagnosis and the single-source-of-truth fix.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the inconsistent-numbers bug:
symptom -> reproduction -> root cause (two independent computations) -> the fix
(one typed model, one derivation) -> verification -> remaining limits.
All six parts required.

=== MOOD ===
The specific dread of seeing two numbers on one screen that should be equal and
are not. Teal turning amber at the mismatch, then resolved.

=== COMPLIANCE ===
No financial advice. All amounts are EXAMPLES.

=== DESIGN TOKENS (use exactly) ===
background #04110c | panel #08201a | primary teal #34d399 | accent #6ee7b7
up #34d399 | down #f87171 | ok #4ade80 | warn #fbbf24 | mismatch #f87171
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #06170f, border rgba(52,211,153,0.18)
syntax: comments #4a7a63, strings #fcd34d, keywords #34d399, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + numbers font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1020px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE MISMATCH DEMO - full width, height ~400px
  Block C : root cause (a small diagram)
  Block D : the fix (before/after code)
  Block E : verification + remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "03 · 트러블슈팅 01"

HEADING (30px font-black):
  VERBATIM: "한 화면에서 같은 값이 두 개 나왔다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "요약 카드의 이번 달 지출 합계와, 바로 아래 차트의 마지막 막대 값이 달랐다.
   차이는 3,000원 정도라 처음엔 눈치도 못 챘다.
   사용자 입장에서는 어느 쪽을 믿어야 할지 알 수 없는 화면이었다."

=== BLOCK B: THE MISMATCH DEMO (the defining idea) ===
Margin-top 36px. Container, height ~400px, rounded-md,
border 1px rgba(52,211,153,0.18), background #08201a, padding 22px.

TOP BAR: a toggle on the left, font-mono 11px, width 200px, height 32px,
background rgba(255,255,255,0.04), border 1px rgba(52,211,153,0.22), rounded,
two halves:
  LEFT  VERBATIM "단일 모델"   (active color #4ade80)
  RIGHT VERBATIM "따로 계산"   (active color #f87171)
Default: 단일 모델.
On the right of the bar, a mismatch readout, font-mono 12px tabular-nums,
which reads VERBATIM "차이 0원" in #4ade80 when consistent, and switches to
VERBATIM "차이 3,200원" in #f87171 when not.

BELOW, TWO PANELS side by side (stack below 720px):

  LEFT PANEL - THE SUMMARY CARD (~44%)
    A realistic dashboard card: padding 18px, rounded-md,
    border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02).
    Label font-mono 10px rgba(255,255,255,0.46), VERBATIM: "이번 달 지출"
    A big value, font-mono 30px font-black tabular-nums, format VERBATIM:
      "1,284,000원"
    Beneath it, the change with ARROW + SIGN, font-mono 12px,
    VERBATIM: "▲ +38,000 (지난달 대비)"
    A tiny source note, font-mono 9px rgba(255,255,255,0.35),
    VERBATIM: "출처: 요약 API"

  RIGHT PANEL - THE CHART (~56%)
    A small SVG bar chart of the last 6 months' spending, bars in
    rgba(52,211,153,0.55), the last bar emphasized.
    A value label above the last bar, font-mono 12px tabular-nums,
    format VERBATIM: "1,284,000"
    A tiny source note, font-mono 9px rgba(255,255,255,0.35),
    VERBATIM: "출처: 거래 목록 집계"

WHEN THE TOGGLE MOVES TO "따로 계산":
  t=0.00s  The chart's last bar value animates from 1,284,000 to
           VERBATIM "1,280,800" over 0.5s (tabular-nums, no layout shift)
  t=0.30s  Both value elements gain a 1px #f87171 border and a
           rgba(248,113,113,0.08) background
  t=0.50s  A connector line is drawn between the two values (a 1px dashed
           #f87171 path across the gap) with a label at its midpoint,
           background #06170f, border 1px rgba(248,113,113,0.35), rounded,
           padding 4px 9px, font-mono 10px #f87171, VERBATIM: "같아야 하는 값"
  t=0.80s  The mismatch readout in the top bar flips to VERBATIM "차이 3,200원"
  t=1.10s  A message fades in beneath both panels, 17px leading-9, max-width 560px:
             Line 1, rgba(255,255,255,0.88), VERBATIM:
               "둘 다 제가 짠 코드입니다."
             Line 2, #f87171, font-bold, margin-top 8px, VERBATIM:
               "그리고 둘 다 자기 딴엔 맞았습니다."
  t=1.50s  Two small annotations appear, one under each panel, font-mono 10px
           rgba(255,255,255,0.55):
             under the card  VERBATIM: "취소된 거래를 제외함"
             under the chart VERBATIM: "취소된 거래를 포함함"
           These two lines are the actual explanation - keep them exact.

Switching back to "단일 모델" reverses everything over 0.5s and both values return
to the same number.

A note at the container's bottom, font-mono 9px rgba(255,255,255,0.32),
VERBATIM: "재현용 예시 데이터입니다"

=== BLOCK C: ROOT CAUSE (a small diagram) ===
Margin-top 44px, padding 24px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05).
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인"
  A small SVG diagram, height ~150px, showing:
    ONE box on the left, VERBATIM "거래 원본 데이터"
    TWO diverging arrows to TWO boxes on the right:
      VERBATIM "요약 카드용 집계"  and  VERBATIM "차트용 집계"
    Each right box has a small note beneath it, font-mono 9px #fbbf24:
      VERBATIM "필터 조건 A"  /  VERBATIM "필터 조건 B"
    A red "≠" symbol between the two right boxes.
  Boxes draw in left to right, 0.15s apart; the "≠" drops in last and pulses once.
  Below the diagram, body 16px leading-8, VERBATIM:
  "같은 원본에서 두 번 계산했다. 화면이 하나씩 늘어날 때마다
   그 화면에 맞는 집계 함수를 새로 만들었고, 필터 조건이 조금씩 달라졌다.
   문제는 그 차이를 아무도 기억하지 못한다는 것이었다."
  Emphasize "같은 원본에서 두 번 계산했다" in #fbbf24, font-bold.

=== BLOCK D: THE FIX (before / after code) ===
Margin-top 40px. Two code panels, side by side above 1024px, stacked below, gap 16px.
Each: background #06170f, border 1px, rounded-md, header with three window dots and
a filename, body font-mono 12px with a line-number gutter.

  BEFORE panel - border 1px rgba(248,113,113,0.28),
    filename VERBATIM: "SummaryCard.tsx · SpendChart.tsx (before)"
    CONTENT: ~14 lines, split by a comment divider into two halves. Each half is a
    component that receives the raw transaction array and computes its own total
    inline, with slightly different filter predicates.
    HIGHLIGHT the two filter predicate lines with rgba(248,113,113,0.12), and add
    an inline marker at each, font-mono 10px #f87171,
    VERBATIM: "← 조건이 다르다"

  AFTER panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "useMonthlySummary.ts (after)"
    CONTENT: ~20 lines. A single typed model and one derivation:
    a MonthlySummary type describing every value the screens need (total, delta,
    per-category breakdown, the applied filter description); one hook that takes
    the raw transactions and produces that object exactly once, memoized; and both
    components now consuming fields from it rather than computing anything.
    A comment notes that the filter rule now lives in ONE place and is described in
    the returned object so the UI can display it.
    HIGHLIGHT the type definition line and the single filter line with
    rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "화면은 계산하지 않는다. 계산된 걸 받아서 그리기만 한다."

A short note beneath, 15px leading-8, VERBATIM:
  "고치면서 하나 더 넣은 게 있습니다. 집계에 어떤 필터가 적용됐는지를
   반환값 안에 문자열로 같이 담았고, 화면 구석에 작게 표시했습니다.
   「취소 거래 제외」 같은 한 줄이 있으면 사용자가 값을 의심하지 않습니다."
Emphasize "반환값 안에 문자열로 같이 담았고" in #6ee7b7, font-bold.

=== BLOCK E: VERIFICATION + REMAINING LIMITS ===
Margin-top 36px.
Three stat cells in a row, gap 12px (stacks below 640px). Each: padding 16px,
rounded-md, border 1px rgba(74,222,128,0.22), background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "1곳"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "집계 로직 위치"
  Cell 2  value VERBATIM "4개"   label VERBATIM "같은 모델을 쓰는 화면"
  Cell 3  value VERBATIM "0원"   label VERBATIM "화면 간 값 차이"
Values fade in on entry.
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "네 화면을 직접 열어 값을 대조했습니다. 자동화된 테스트는 붙이지 못했습니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "타입은 하나로 모았지만, 새 화면을 만들 때 다시 따로 계산하는 걸 막을 장치는 없다."
    "값이 어긋났는지 검사하는 테스트가 없다. 눈으로 대조했을 뿐이다."
    "백엔드가 붙으면 집계를 서버로 옮길지 프론트에 둘지 다시 정해야 한다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left (x -12px -> 0)
1.10s  Demo container fades up; both panels populate with matching values
1.80s  A one-time pulse on the "따로 계산" half of the toggle (a soft red ring,
       2 pulses, 0.9s each) with a hint beside it, font-mono 10px
       rgba(255,255,255,0.35), VERBATIM: "켜보세요"
       Both disappear permanently once the toggle is used.
All later blocks animate on their own viewport entry.

=== RESPONSIVE ===
< 1024px: code panels stack (before on top).
< 720px: the demo's two panels stack (card first) and the connector line redraws
vertically between them; the root-cause diagram scrolls horizontally inside its own
container with a 520px minimum width.
< 640px: code font 11px with internal horizontal scroll (the block scrolls, never
the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no value count animation, no connector draw, no toggle
pulse - the mismatch appears instantly.
The toggle must be a real switch (role="switch", aria-checked) with a visible focus
ring (2px #34d399, offset 2px), operable by Space/Enter.
Announce the state change ONCE via aria-live="polite":
  따로 계산 VERBATIM: "요약 카드와 차트의 합계가 3,200원 차이 납니다."
  단일 모델 VERBATIM: "두 값이 일치합니다."
Change values render ARROW + SIGN + NUMBER. All numbers tabular-nums.

=== DO NOT ===
Do not make the mismatch huge - a small, easily-missed difference is the honest and
more unsettling version.
Do not remove the two source annotations ("취소된 거래를 제외함/포함함") - they are
the actual explanation.
Do not remove the limits card.
```

---

## PAGE 05 — 현재 상태와 다음 행동을 떼어놓는다

**개발 실체**: 요약 화면과 목표 화면의 분리 결정 + **화면 간 상태 전달 구조**
**연출 장치**: 두 화면을 **물리적으로 떼어 나란히** 놓고, 그 사이의 연결만 남긴다

```text
Build a SCREEN SEPARATION section that shows why the "current state" view and the
"next action" view were deliberately split into two screens instead of one, with
the shared data contract between them.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The design decision: state and action are different jobs and were separated
2. What each screen is responsible for
3. The typed contract that connects them, and why it is narrow on purpose

=== MOOD ===
Two calm surfaces side by side. Teal on near-black. Ordered, quiet, deliberate.

=== COMPLIANCE ===
No financial advice. The goal screen must NEVER tell the user what to do with
money - it only reflects goals the user set themselves. All amounts are EXAMPLES.

=== DESIGN TOKENS (use exactly) ===
background #04110c | panel #08201a | primary teal #34d399 | accent #6ee7b7
up #34d399 | down #f87171 | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #06170f, border rgba(52,211,153,0.18)
syntax: comments #4a7a63, strings #fcd34d, keywords #34d399, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + numbers font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1100px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : THE SPLIT - two screen mockups side by side with a connector
  Block C : the responsibility table
  Block D : the contract code panel

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "04 · 화면 분리"

HEADING (28px font-black):
  VERBATIM: "「지금 어떤가」와 「그래서 뭘 할까」는 다른 질문이다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "처음엔 한 화면에 다 넣었습니다. 요약도 있고 목표도 있고 차트도 있었습니다.
             화면은 꽉 찼는데, 정작 아무 결정도 안 하게 되더군요."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "상태를 확인하는 일과 목표를 조정하는 일은 마음가짐이 다릅니다.
             그래서 두 화면으로 나누고, 사이를 좁은 통로 하나로만 연결했습니다."
  Emphasize "좁은 통로 하나로만 연결했습니다" in #6ee7b7, font-bold.

=== BLOCK B: THE SPLIT (the defining idea) ===
Margin-top 44px. Two screen mockups side by side, gap 60px (a wide gap on purpose -
the separation must be felt), stacking below 900px with a vertical connector.
Each mockup: aspect-ratio 4/5, max-width 380px, background #08201a,
border 1px rgba(52,211,153,0.20), rounded-lg, padding 18px, with a 26px title strip
at the top (font-mono 11px rgba(255,255,255,0.60)).

  LEFT MOCKUP - title VERBATIM: "요약 · 지금 어떤가"
    Contents, top to bottom:
      - One sentence, 15px leading-7, rgba(255,255,255,0.88), VERBATIM:
        "이번 달은 지난달과 비슷한 흐름입니다"
      - A small line chart (SVG), stroke #34d399
      - Three compact stat rows, font-mono 11px tabular-nums, each a label, a value
        and a change with ARROW + SIGN. Labels VERBATIM:
        "총 자산" / "이번 달 지출" / "이번 달 저축"
      - A quiet footer line, font-mono 10px rgba(255,255,255,0.40),
        VERBATIM: "여기서는 아무것도 바꾸지 않습니다"
    A badge at the mockup's top-right, font-mono 9px, padding 3px 8px, rounded,
    border 1px rgba(52,211,153,0.35), color #34d399, VERBATIM: "읽기 전용"

  RIGHT MOCKUP - title VERBATIM: "목표 · 그래서 뭘 할까"
    Contents:
      - A goal card: a goal name (VERBATIM "여행 자금"), a progress bar (teal fill
        at ~62%), and a font-mono 11px tabular-nums readout,
        format VERBATIM: "620,000 / 1,000,000원"
      - A second goal card, name VERBATIM "비상금", progress ~35%
      - An editable-looking row with a slider affordance and a label,
        font-mono 11px, VERBATIM: "이번 달 목표 조정"
      - A primary-looking button, font-mono 11px, background #34d399,
        color #04110c, padding 8px 16px, rounded, VERBATIM: "목표 저장"
    A badge at the top-right, font-mono 9px, border 1px rgba(110,231,183,0.40),
    color #6ee7b7, VERBATIM: "편집 가능"
    A footer note, font-mono 10px rgba(255,255,255,0.40), VERBATIM:
      "목표는 사용자가 직접 정합니다"

  THE CONNECTOR (between them): a single horizontal line, 1.5px,
  rgba(52,211,153,0.35), with an arrow pointing right, and a label above it,
  background #06170f, border 1px rgba(52,211,153,0.30), rounded, padding 5px 11px,
  font-mono 10px #34d399, VERBATIM: "MonthlySummary 하나만 넘어갑니다"
  Beneath the line, a smaller note, font-mono 9px rgba(255,255,255,0.40),
  VERBATIM: "반대 방향으로는 아무것도 안 넘어옵니다"
  The connector draws in (width 0% -> 100%, 0.6s) after both mockups have landed.

  A shared note beneath, font-mono 9px rgba(255,255,255,0.32), centered,
  VERBATIM: "예시 데이터입니다"

=== BLOCK C: THE RESPONSIBILITY TABLE ===
Margin-top 52px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "화면별 책임"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "화면" | "하는 일" | "하지 않는 일"
Rows:
  "요약"  | "현재 상태 표시 · 지난 기간 비교"   | "값 수정 · 목표 변경"
  "목표"  | "사용자가 정한 목표 관리 · 진행률"  | "지출 원본 데이터 수정"
  "차트"  | "흐름 표현"                        | "자체 집계"
  "카드"  | "요약값 표시"                      | "자체 집계"
Rows fade in 0.1s apart on entry.

Below the table, one paragraph, 15px leading-8, VERBATIM:
  "「하지 않는 일」을 적어두는 게 「하는 일」을 적는 것보다 도움이 됐습니다.
   새 기능을 어디에 넣을지 헷갈릴 때 이 표를 보고 정했습니다."

=== BLOCK D: THE CONTRACT CODE PANEL ===
Margin-top 40px, full width. background #06170f,
border 1px rgba(52,211,153,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "types/summary.ts"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~20 lines of TypeScript. A MonthlySummary type carrying exactly what the
goal screen needs (the period, the total, the delta from the previous period, the
top few categories, and a human-readable description of the filter that was
applied) and NOTHING else - no raw transaction array, no mutation callbacks.
Below it, a Goal type owned by the goal screen, and a comment stating explicitly
that the summary screen never imports the Goal type - the dependency runs one way
only.
HIGHLIGHT ROWS (background rgba(52,211,153,0.10)): the filter-description field and
the one-way dependency comment.
Caption bar, border-top 1px, font-mono 11px, prefixed "// ", VERBATIM:
  "넘길 수 있는 걸 좁혀두면, 나중에 잘못 쓰는 것도 좁아진다"

A short note beneath the panel, 15px leading-8, VERBATIM:
  "처음에는 요약 화면이 거래 원본 배열을 통째로 넘겼습니다.
   그러니 목표 화면에서도 자기 마음대로 집계를 하기 시작했고,
   앞에서 본 값 불일치 문제가 여기서도 똑같이 생겼습니다."
Emphasize "여기서도 똑같이 생겼습니다" in #f87171, font-bold.
This callback to the previous section is deliberate - keep it.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraphs 1 and 2, 0.5s apart
1.50s  Both mockups fade up TOGETHER (never staggered), y 20px -> 0, 0.6s
2.10s  Each mockup's contents populate 0.08s apart
2.70s  The connector line draws left to right; its label fades in 0.3s later
Table and code panel animate on their own viewport entry.

=== RESPONSIVE ===
< 900px: the mockups stack with a VERTICAL connector between them (arrow pointing
down), keeping the same labels. Gap 40px.
< 640px: mockups full width, aspect-ratio auto; the responsibility table becomes a
stacked card list; code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no connector draw, no staggered population - everything
renders in place.
The mockups are presentational; do not put their fake controls in the tab order
(use aria-hidden on the mock button and slider, and provide a visually-hidden
description of each screen's purpose instead).
Change values render ARROW + SIGN + NUMBER. All numbers tabular-nums.

=== DO NOT ===
Do not let the goal screen suggest what the user should save or spend - it only
reflects goals the user set.
Do not make the mock controls actually interactive - they are illustrations.
Do not remove the callback sentence referencing the earlier mismatch problem.
```

---

## PAGE 06 — 트러블슈팅 02 · 같은 금액이 네 가지로 적혀 있었다

**개발 실체**: 금액·증감 표기 규칙 통일 + **포맷 유틸과 접근성 규칙**
**연출 장치**: 같은 금액이 4가지로 표기된 화면을 보여주고, 규칙을 적용해 하나로 수렴시킴

```text
Build a FORMATTING CONSISTENCY troubleshooting section showing the same amount
rendered four different ways across one product, then converging them into a single
rule set - including the accessibility rule that changes must never be conveyed by
color alone.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the formatting inconsistency:
symptom (four renderings) -> why it happened -> the adopted rules -> the shared
formatter code -> the accessibility rule and how it was verified -> remaining limits.
All six parts required.

=== MOOD ===
Quiet, corrective, slightly obsessive in a good way. Teal on near-black.
This is a small problem treated seriously, which is the point.

=== COMPLIANCE ===
No financial advice. All amounts are EXAMPLES.

=== DESIGN TOKENS (use exactly) ===
background #04110c | panel #08201a | primary teal #34d399 | accent #6ee7b7
up #34d399 | down #f87171 | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #06170f, border rgba(52,211,153,0.18)
syntax: comments #4a7a63, strings #fcd34d, keywords #34d399, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + numbers font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE FOUR RENDERINGS + the converge control
  Block C : the rules table
  Block D : the formatter code panel
  Block E : the color-blind check + remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "05 · 트러블슈팅 02"

HEADING (30px font-black):
  VERBATIM: "같은 4,820,000원이 화면마다 다르게 적혀 있었다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "화면을 만들 때마다 그때그때 보기 좋은 형식으로 적었다.
   어떤 화면은 「482만원」, 어떤 화면은 「4,820,000」, 어떤 화면은 「4.82M」.
   기능 버그는 아니지만, 같은 서비스로 안 보이는 문제였다."

=== BLOCK B: THE FOUR RENDERINGS (the defining idea) ===
Margin-top 36px. Container, rounded-md, border 1px rgba(52,211,153,0.18),
background #08201a, padding 24px.

A CONVERGE CONTROL at the top-right: a toggle, font-mono 11px, two halves,
width 180px, height 30px:
  LEFT  VERBATIM "규칙 적용 전"   (active #f87171)
  RIGHT VERBATIM "규칙 적용 후"   (active #4ade80)
Default: 규칙 적용 전.

BELOW, FOUR MINI-SCREEN CARDS in a 2x2 grid, gap 14px (1 column below 640px).
Each: padding 16px, rounded-md, border 1px rgba(255,255,255,0.10),
background rgba(255,255,255,0.02), with a font-mono 10px rgba(255,255,255,0.46)
screen label at the top and a large value beneath, font-mono 26px font-black,
tabular-nums.

  IN "규칙 적용 전", the four cards show:
    Card 1  label VERBATIM "요약 화면"      value VERBATIM "482만원"
            change beneath, colored ONLY (no sign, no arrow) VERBATIM "3.2%" in green
    Card 2  label VERBATIM "차트 툴팁"      value VERBATIM "4,820,000"
            change VERBATIM "+3.2%" in green
    Card 3  label VERBATIM "목표 화면"      value VERBATIM "4.82M"
            change VERBATIM "▲3.2" in green
    Card 4  label VERBATIM "거래 목록"      value VERBATIM "4820000원"
            change VERBATIM "3.2 증가" in plain text
  Under the grid, a red summary line, font-mono 11px #f87171, VERBATIM:
    "같은 값 · 네 가지 표기 · 세 가지 증감 표현"

  IN "규칙 적용 후", all four cards CONVERGE:
    Every value becomes VERBATIM "4,820,000원"
    Every change becomes VERBATIM "▲ +3.2%" with the arrow and sign always present
    and the color #34d399 as a SECONDARY cue only.
    The convergence animates: each card's text cross-fades over 0.35s, staggered
    0.08s apart, and each card's border briefly flashes #4ade80.
    Under the grid, the summary line becomes green, font-mono 11px #4ade80,
    VERBATIM: "같은 값 · 하나의 표기 · 부호와 화살표 항상 병기"

A note at the container's bottom, font-mono 9px rgba(255,255,255,0.32),
VERBATIM: "예시 데이터입니다"

=== BLOCK C: THE RULES TABLE ===
Margin-top 44px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "정한 규칙"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "항목" | "규칙" | "이유"
Rows:
  "금액 단위"   | "원 단위 그대로 · 천 단위 콤마"  | "축약은 자릿수 감각을 없앤다"
  "축약 표기"   | "차트 축에서만 허용 (만/억)"     | "축은 공간이 없고, 비교만 하면 된다"
  "증감 부호"   | "화살표 + 부호 + 숫자 항상"      | "색만으로는 구분 못 하는 사용자가 있다"
  "소수점"      | "퍼센트는 소수 첫째 자리까지"    | "그 이상은 판단에 영향을 안 준다"
  "0원"        | "「0원」으로 표기 · 빈칸 금지"    | "빈칸은 「없음」과 「모름」이 구분 안 된다"
Rows fade in 0.1s apart on entry.

=== BLOCK D: THE FORMATTER CODE PANEL ===
Margin-top 40px, full width. background #06170f,
border 1px rgba(52,211,153,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "format.ts"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~22 lines of TypeScript. A small formatting module exposing:
  - a currency formatter using the platform's number formatting with an explicit
    locale and no fraction digits, always appending the unit,
  - a compact formatter used ONLY for chart axes, with a comment saying so,
  - a change formatter that returns BOTH a display string containing an arrow and
    a sign AND a separate semantic direction value, so that callers cannot render
    the change without the arrow,
  - a percent formatter fixed to one decimal place.
The change formatter's return type is the important part: make it a small object
where the display string ALREADY includes the arrow, so there is no code path that
produces a bare colored number.
HIGHLIGHT ROWS (background rgba(52,211,153,0.10)): the change formatter's return
type and the chart-axis-only comment.
Caption bar, border-top 1px, font-mono 11px, prefixed "// ", VERBATIM:
  "규칙을 문서로 적어두면 안 지켜진다. 안 지킬 수 없는 형태로 만들어야 지켜진다."

=== BLOCK E: THE COLOR-BLIND CHECK + REMAINING LIMITS ===
Margin-top 40px.
A demonstration panel, padding 22px, rounded-md, border 1px rgba(52,211,153,0.22),
background rgba(52,211,153,0.04).
  Label font-mono 10px letter-spacing 0.18em #34d399, VERBATIM: "색을 뺐을 때"
  Two rows side by side, gap 16px (stack below 640px), each showing the SAME two
  change values rendered twice:
    LEFT  header font-mono 10px rgba(255,255,255,0.46), VERBATIM: "규칙 적용 전"
          two values, both rendered WITHOUT color (all in rgba(255,255,255,0.75)):
          VERBATIM "3.2%"  and  VERBATIM "1.8%"
          with a red note beneath, font-mono 10px #f87171,
          VERBATIM: "어느 쪽이 증가인지 알 수 없음"
    RIGHT header VERBATIM: "규칙 적용 후"
          two values, also WITHOUT color:
          VERBATIM "▲ +3.2%"  and  VERBATIM "▼ −1.8%"
          with a green note, font-mono 10px #4ade80,
          VERBATIM: "색 없이도 구분됨"
  A caption beneath the panel, 15px leading-8, VERBATIM:
  "브라우저 개발자 도구의 색각 시뮬레이션으로 확인했습니다.
   적록색약 조건에서 초록과 빨강 퍼센트가 거의 같은 밝기로 보였습니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "다국어나 다른 통화는 고려하지 않았다. 원화 전용이다."
    "실제 색각 이상이 있는 사용자에게 확인받지는 못했다. 시뮬레이션까지만 했다."
    "차트 축의 축약 표기와 본문 표기가 나란히 놓이는 화면은 여전히 조금 어색하다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left
1.10s  The four-card container fades up; cards populate 0.07s apart in the
       "규칙 적용 전" state
1.80s  A one-time pulse on the "규칙 적용 후" half of the toggle (a soft teal ring,
       2 pulses, 0.9s each) with a hint, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "규칙을 적용해보세요"
       Both disappear permanently once the toggle is used.
All later blocks animate on their own viewport entry.

=== RESPONSIVE ===
< 640px: the four cards become a single column; the color-blind panel's two rows
stack; code font 11px with internal horizontal scroll (the block scrolls, never the
page); the rules table becomes a stacked card list.

=== ACCESSIBILITY ===
prefers-reduced-motion: no cross-fade convergence (values swap instantly), no
border flash, no toggle pulse.
The toggle must be a real switch (role="switch", aria-checked) with a visible focus
ring (2px #34d399, offset 2px).
Announce the convergence ONCE via aria-live="polite", VERBATIM:
  "네 화면의 표기가 하나의 규칙으로 통일되었습니다."
The color-blind demonstration panel must render its values WITHOUT color in both
columns - that is the demonstration and it must not be "fixed" by adding color back.
All numbers tabular-nums.

=== DO NOT ===
Do not add color to the color-blind check panel.
Do not present this as a solved accessibility problem - the limits card explicitly
says no real user testing happened.
Do not use real amounts or imply they are the user's actual finances.
```

---

## PAGE 07 — 하나의 화면이 컴포넌트로 나뉘는 과정

**개발 실체**: 컴포넌트 분리 방향 정의 + **분리 기준과 props 설계**
**연출 장치**: 완성된 대시보드가 컴포넌트 단위로 **분해되었다가 다시 조립**된다

```text
Build a COMPONENT DECOMPOSITION section where a finished dashboard visibly breaks
apart into its component boundaries and reassembles, with the splitting criteria
and the resulting props shape shown alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The criteria used to decide where one component ends and another begins
2. The resulting component tree
3. The props design that follows from those criteria - specifically that
   presentational components receive values, never raw data

=== MOOD ===
An exploded technical drawing, floating in still water. Teal on near-black.
Precise, calm, a little satisfying.

=== COMPLIANCE ===
No financial advice. All amounts are EXAMPLES.

=== DESIGN TOKENS (use exactly) ===
background #04110c | panel #08201a | primary teal #34d399 | accent #6ee7b7
ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #06170f, border rgba(52,211,153,0.18)
syntax: comments #4a7a63, strings #fcd34d, keywords #34d399, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1060px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE EXPLODED VIEW - full width, height ~460px
  Block C : the splitting criteria table
  Block D : the props code panel

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "06 · 컴포넌트 설계"

HEADING (28px font-black):
  VERBATIM: "어디서 자를지는 화면이 아니라 데이터가 정한다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "처음엔 보기에 덩어리로 보이는 대로 잘랐습니다.
             그러다 보니 한 컴포넌트가 데이터를 세 종류씩 받게 됐고,
             재사용하려고 하면 항상 뭔가가 안 맞았습니다."

=== BLOCK B: THE EXPLODED VIEW (the defining idea) ===
Margin-top 40px. Container, height ~460px, rounded-md,
border 1px rgba(52,211,153,0.18), background #08201a, padding 24px,
position relative, perspective 900px.

A CONTROL at the top-right: a segmented pair, font-mono 11px, width 180px,
height 30px:
  VERBATIM "조립"  |  VERBATIM "분해"
Default: 조립.

THE DASHBOARD MOCKUP (assembled state): a realistic dashboard laid out inside the
container, built from six visually distinct regions:
  1. A header strip with a period selector          -> component "PeriodHeader"
  2. A hero summary sentence + big value            -> component "SummaryHeadline"
  3. A line chart                                    -> component "FlowChart"
  4. A row of three stat cards                       -> component "StatCard" (x3)
  5. A goal progress list                            -> component "GoalList"
  6. A footer note with the filter description       -> component "FilterNote"
All six render as one continuous, believable screen when assembled.

THE EXPLODE ANIMATION (on switching to "분해"):
  t=0.00s  Each region gains a 1px dashed #34d399 outline
  t=0.20s  The regions SEPARATE in 3D: each translates outward from the center
           (different directions and distances, 40-110px), rotates slightly
           (rotateX up to 12deg, rotateY up to 10deg), and gains a drop shadow.
           Staggered 0.07s apart, 0.6s each, with a spring settle.
  t=0.80s  A label tag appears beside each separated region: background #06170f,
           border 1px rgba(52,211,153,0.30), rounded, padding 4px 9px,
           font-mono 10px #34d399, showing the component name, VERBATIM:
             "PeriodHeader" / "SummaryHeadline" / "FlowChart" / "StatCard" /
             "GoalList" / "FilterNote"
  t=1.10s  Thin connector lines are drawn from a small root node at the container's
           left edge (labeled VERBATIM "DashboardPage") to each separated region,
           forming a visible tree. Lines draw 0.08s apart.
  t=1.60s  A count chip appears at the container's bottom-right, font-mono 10px
           rgba(255,255,255,0.46), VERBATIM: "컴포넌트 6종 · 인스턴스 8개"
Switching back to "조립" reverses everything over 0.7s.

HOVER a separated region: it brightens, its label tag scales 1.06, and its
connector line goes to full opacity while the others dim to 40%. 0.25s.

AUTONOMOUS: if the viewer does not use the control within 5 seconds of the
container entering the viewport, run the explode once automatically, hold 2.5s, and
reassemble. ONCE ONLY. A caption during it, font-mono 10px rgba(255,255,255,0.35),
VERBATIM: "자동 시연"

A note at the container's bottom-left, font-mono 9px rgba(255,255,255,0.32),
VERBATIM: "예시 데이터입니다"

=== BLOCK C: THE SPLITTING CRITERIA TABLE ===
Margin-top 48px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "자르는 기준"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "기준" | "적용" | "예"
Rows:
  "데이터 한 종류"       | "한 컴포넌트는 한 종류의 값만 받는다" | "StatCard는 값과 증감만"
  "계산하지 않는다"      | "표시용 컴포넌트는 집계를 안 한다"    | "FlowChart는 완성된 시리즈만"
  "반복되면 분리"        | "두 번 나오면 컴포넌트로"            | "StatCard 3회 사용"
  "화면 이름을 안 붙인다" | "쓰이는 위치가 아니라 하는 일로 명명"  | "SummaryHeadline"
Rows fade in 0.1s apart on entry.

Below the table, one paragraph, 15px leading-8, VERBATIM:
  "네 번째 기준이 제일 늦게 깨달은 겁니다.
   「요약화면상단카드」 같은 이름을 붙이면 그 컴포넌트는 영원히 거기서만 쓰입니다.
   이름이 위치를 담고 있으면 옮길 수가 없습니다."
Emphasize "이름이 위치를 담고 있으면 옮길 수가 없습니다" in #6ee7b7, font-bold.

=== BLOCK D: THE PROPS CODE PANEL ===
Margin-top 40px, full width. background #06170f,
border 1px rgba(52,211,153,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "StatCard.tsx"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~20 lines of TypeScript React. A presentational StatCard whose props are:
a label, an already-formatted value string, an already-formatted change object
(display string plus a semantic direction), and an optional note string. There is
NO raw data prop, NO transaction array, NO formatting call inside the component,
and NO conditional business logic - it only chooses which arrow color to apply from
the semantic direction it was given.
Include a short comment stating that formatting happens in the parent so that every
screen renders the same string.
HIGHLIGHT ROWS (background rgba(52,211,153,0.10)): the props type definition and
the comment about formatting living in the parent.
Caption bar, border-top 1px, font-mono 11px, prefixed "// ", VERBATIM:
  "이 컴포넌트는 「원」이 뭔지도 모른다. 그래서 어디든 갈 수 있다."

A short note beneath, 15px leading-8, VERBATIM:
  "이렇게 하고 나서 좋았던 건, 앞에서 말한 표기 규칙을 바꿀 때
   컴포넌트를 하나도 안 고쳐도 됐다는 점입니다. 포맷 함수만 고치면 끝이었습니다."
This callback to the formatting section is deliberate - keep it.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  Exploded-view container fades up; the dashboard renders assembled
1.90s  The control fades in; the 5-second autonomous timer starts
Table and code panel animate on their own viewport entry.

=== PERFORMANCE ===
The autonomous demonstration and all 3D transforms must stop when the container is
out of the viewport or the tab is hidden. Use transform and opacity only - never
animate width, height, top or left.

=== RESPONSIVE ===
< 900px: container height 520px; explode distances reduced to 24-60px; rotations
halved so labels stay readable.
< 640px: the explode becomes a simple VERTICAL separation (regions slide apart on
the Y axis only, no 3D rotation), and the connector tree renders as a left-edge
vertical spine. Code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no autonomous demonstration, no 3D rotation. Switching to
"분해" simply adds the dashed outlines and the labels in place, with no movement.
The control must be a real radiogroup, arrow-key navigable, with visible focus
rings (2px #34d399, offset 2px).
Provide a visually-hidden component tree as a nested list, so the structure is
available without the visual.
The mockup's fake controls must be aria-hidden and out of the tab order.

=== DO NOT ===
Do not animate layout properties - transform and opacity only.
Do not let StatCard's shown props include raw data or a formatter call.
Do not remove the callback sentence referencing the formatting section.
```

---

## PAGE 08 — 이 프로젝트의 범위 (정직하게)

**개발 실체**: **프로젝트의 실제 범위와 한계를 한 장 통째로 선언**
**연출 장치**: 수면 위/아래로 "한 것 / 안 한 것"을 물리적으로 나눔

```text
Build a PROJECT SCOPE section that states plainly what this project is and is not -
a frontend prototype without a backend - using a water surface as the dividing line
between what was built and what was not.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An exact statement of what was built and by whom
2. An exact statement of what was NOT built, without euphemism
3. Why the scope was drawn there
This page's value comes entirely from its honesty. Do not soften it.

=== MOOD ===
Clear water, midday. Nothing hidden. Teal on near-black, calm and direct.
This should feel confident, not apologetic.

=== COMPLIANCE ===
No financial advice. Do not imply real users, real data, or production deployment.

=== DESIGN TOKENS (use exactly) ===
background #04110c | panel #08201a | primary teal #34d399 | accent #6ee7b7
ok #4ade80 | warn #fbbf24 | not-built rgba(255,255,255,0.30)
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
wave rgba(52,211,153,0.12)
fonts: headings font-black, body sans leading-8, labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE WATERLINE - a full-width panel, height ~520px, split by a surface
  Block C : the "why here" card
  Block D : the role statement

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "07 · 이 프로젝트의 범위"

HEADING (28px font-black):
  VERBATIM: "안 한 것을 먼저 말하는 게 맞다고 생각했습니다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "포트폴리오에서 프로젝트를 크게 보이게 만들 방법은 많습니다.
             그런데 면접에서 한 번만 물어보면 다 드러납니다.
             그래서 여기에 범위를 그대로 적어두기로 했습니다."

=== BLOCK B: THE WATERLINE (the defining idea) ===
Margin-top 44px. A container, height ~520px, rounded-md,
border 1px rgba(52,211,153,0.18), background #08201a, overflow hidden,
position relative.

A HORIZONTAL WATER SURFACE at exactly 50% height: an SVG sine path,
stroke rgba(110,231,183,0.35) 1.5px, with the area BELOW it filled by a gradient
from rgba(52,211,153,0.10) to rgba(52,211,153,0.02).
The wave drifts horizontally on a 20s loop (transform only) - slow enough to be
almost imperceptible.

  ABOVE THE SURFACE - "만든 것" (built)
    A label at the top-left, font-mono 10px letter-spacing 0.2em #34d399,
    VERBATIM: "수면 위 · 만든 것"
    Six item chips floating in the upper half, arranged loosely (not a grid), each:
    padding 10px 16px, rounded-full, border 1px rgba(52,211,153,0.35),
    background rgba(52,211,153,0.07), font-mono 12px rgba(255,255,255,0.86).
    Labels VERBATIM:
      "서비스 기획 · 사용자 흐름 정의"
      "정보 구조 설계"
      "자산 흐름 시각화 화면"
      "목표 관리 화면"
      "TypeScript 데이터 모델 정의"
      "컴포넌트 분리 구조"
    Each chip bobs gently (±4px, 3.4s cycle, staggered phases).

  BELOW THE SURFACE - "안 만든 것" (not built)
    A label at the bottom-left, font-mono 10px letter-spacing 0.2em
    rgba(255,255,255,0.46), VERBATIM: "수면 아래 · 안 만든 것"
    Six item chips in the lower half, each: padding 10px 16px, rounded-full,
    border 1px dashed rgba(255,255,255,0.20), background transparent,
    font-mono 12px rgba(255,255,255,0.42).
    They are rendered slightly BLURRED (a 1px blur) and at 70% opacity, as if seen
    through water - but they are fully legible.
    Labels VERBATIM:
      "백엔드 서버"
      "실제 금융 데이터 연동"
      "사용자 인증"
      "데이터 저장 (DB)"
      "배포"
      "실사용자 테스트"
    These chips do NOT bob - they sit still. The stillness is the point.

  A vertical connector at the right edge: a thin dashed line crossing the surface,
  with a small tag at the crossing point, background #06170f,
  border 1px rgba(251,191,36,0.35), rounded, padding 5px 11px, font-mono 10px
  #fbbf24, VERBATIM: "현재 여기까지"

  A count readout at the container's bottom-right, font-mono 10px
  rgba(255,255,255,0.46), tabular-nums, VERBATIM: "만든 것 6 · 안 만든 것 6"

=== BLOCK C: THE "WHY HERE" CARD ===
Margin-top 44px, padding 24px, rounded-md, border 1px rgba(52,211,153,0.24),
background rgba(52,211,153,0.04), border-left 3px #34d399.
  Label font-mono 11px letter-spacing 0.2em #34d399, VERBATIM: "왜 여기서 멈췄나"
  Body, two paragraphs at 16px leading-9:
    P1 VERBATIM:
      "이 프로젝트의 목표는 「정보를 어떻게 배치하면 사용자가 결정을 내리는가」였습니다.
       그 질문에 답하는 데는 실제 금융 데이터가 필요하지 않았습니다.
       필요한 건 현실적인 예시 데이터와 화면이었습니다."
    P2 VERBATIM:
      "서버를 붙이는 건 다음 단계지, 이 질문에 답하기 위한 단계는 아니었습니다.
       그래서 mock data로 화면을 끝까지 만들고 거기서 멈췄습니다."
    Emphasize "그 질문에 답하는 데는 실제 금융 데이터가 필요하지 않았습니다" in
    #6ee7b7, font-bold.

=== BLOCK D: THE ROLE STATEMENT ===
Margin-top 36px. Two columns, gap 16px (stack below 720px).
  LEFT card:  padding 20px, rounded-md, border 1px rgba(52,211,153,0.22),
              background rgba(52,211,153,0.04)
              label font-mono 10px letter-spacing 0.18em #34d399,
              VERBATIM: "제가 한 일"
              A 4-item list, 15px leading-8, each prefixed "· ", VERBATIM:
                "핵심 사용자 흐름 기획"
                "금융 데이터 카드와 차트 UI 구조 설계"
                "대시보드 컴포넌트 분리 방향 정의"
                "개인화 화면 정보 구조 설계"
  RIGHT card: padding 20px, rounded-md, border 1px rgba(255,255,255,0.14),
              background rgba(255,255,255,0.02)
              label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
              VERBATIM: "이 프로젝트로 증명되는 것 / 안 되는 것"
              Two short blocks, 15px leading-8:
                A line with a #4ade80 "○ " prefix, VERBATIM:
                  "○ 정보 구조를 정하고 근거를 설명할 수 있다"
                A line with a #4ade80 "○ " prefix, VERBATIM:
                  "○ 타입과 컴포넌트 경계를 설계할 수 있다"
                A line with a rgba(255,255,255,0.40) "✕ " prefix, VERBATIM:
                  "✕ 서버 구현 능력은 이 프로젝트로 보여지지 않는다"
                A line with a rgba(255,255,255,0.40) "✕ " prefix, VERBATIM:
                  "✕ 실사용자 반응에 대한 근거는 없다"

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  The waterline container fades up; the surface draws left to right (0.7s)
1.90s  The SIX "built" chips rise into place from the surface, 0.09s apart, each
       with a small ripple, then begin bobbing
2.60s  The SIX "not built" chips fade in below, 0.07s apart, WITHOUT movement
3.20s  The vertical connector and its "현재 여기까지" tag draw in
3.50s  The count readout fades in
Blocks C and D animate on their own viewport entry.

=== PERFORMANCE ===
Wave drift and chip bobbing pause when the container is out of the viewport or the
tab is hidden. Transform only.

=== RESPONSIVE ===
< 900px: container height 620px; chips wrap into tighter clusters.
< 640px: chips font 11px with reduced padding; the two role cards stack.

=== ACCESSIBILITY ===
prefers-reduced-motion: no wave drift, no bobbing, no rise-in - everything renders
in place.
The "not built" chips must NOT be aria-hidden and must not rely on blur to convey
meaning - their dashed border and their section label carry it. Ensure their text
contrast still meets 4.5:1 despite the 70% opacity; raise the opacity if it does not.
Provide a visually-hidden summary listing both groups explicitly.

=== DO NOT ===
Do not soften any item in the "안 만든 것" list or move an item across the surface
to look better.
Do not imply real users, real financial data, or a deployment.
Do not blur the lower chips so much that they become hard to read.
```

---

## PAGE 09 — 결과 · 화면 갤러리

**개발 실체**: 완성된 화면들 + 실제 설계 결과
**연출 장치**: 수면이 잔잔해지며 갤러리 공개

```text
Build a RESULTS SECTION presenting finished screen designs as a gallery, for a
personal finance dashboard portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What was actually designed and built, in screens
2. The concrete outcome stated without invented metrics
3. A restatement that this is a prototype

=== MOOD ===
Water settling. Teal softening. Calm, factual, unhurried.

=== COMPLIANCE ===
No financial advice. All amounts in screenshots are EXAMPLES and must be labeled.

=== DESIGN TOKENS (use exactly) ===
background #061a13 (lifted from earlier sections) | panel #0c261e
primary teal #34d399 | accent #6ee7b7 | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1120px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the gallery (4 items, asymmetric grid)
  Block C : the outcome stats
  Block D : the prototype note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "08 · 결과"

HEADING (32px font-black):
  VERBATIM: "숫자가 아니라 목표 중심으로 읽히는 화면이 됐다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "사용자가 자산 데이터를 단순 수치가 아니라 흐름과 목표 중심으로 읽을 수 있는
             금융 UX 프로토타입을 완성했습니다.
             정보 구조, 표기 규칙, 컴포넌트 경계까지 정리해 다음 단계로 넘길 수 있는
             상태로 만들었습니다."

=== BLOCK B: THE GALLERY ===
An asymmetric grid, margin-top 48px:
  Row 1: one large item (2 columns) + one small item
  Row 2: two equal items
Gap 16px. Below 900px -> single column.

Each item: background #0c261e, border 1px rgba(52,211,153,0.18), rounded-md,
overflow hidden.
  A 30px header strip with a font-mono 10px uppercase label on the left
  (rgba(255,255,255,0.48)) and a small teal dot on the right.
  Below it, the image area with aspect-ratio 16/10.
  A caption bar at the bottom, padding 12px 14px,
  border-top 1px rgba(52,211,153,0.10), font-mono 11px rgba(255,255,255,0.48).

ITEM 1 (large)  header VERBATIM "01 · 요약 대시보드"
  [IMG-01] the summary dashboard with the flow chart and stat cards
  caption VERBATIM: "결론 문장이 맨 위, 숫자는 그 다음"
ITEM 2 (small)  header VERBATIM "02 · 자산 흐름"
  [IMG-02] the asset flow chart view
  caption VERBATIM: "점이 아니라 12개월의 곡선으로"
ITEM 3          header VERBATIM "03 · 목표 관리"
  [IMG-03] the goal management screen
  caption VERBATIM: "상태 확인과 분리된 별도 화면"
ITEM 4          header VERBATIM "04 · 표기 규칙"
  [IMG-04] a style/format reference sheet showing the number and change rules
  caption VERBATIM: "증감은 항상 부호와 화살표를 함께"

IMAGE PLACEHOLDER SPEC (if no image is supplied): a CSS placeholder inside the
aspect box - background #04110c, a faint 24px teal grid, centered text in font-mono
12px rgba(255,255,255,0.35) reading the slot name, e.g. VERBATIM "[IMG-01] · 16:10"

HOVER: the item lifts 4px, border -> rgba(52,211,153,0.45), image scales 1.03
inside its clipped frame. 0.35s. Click opens a lightbox (overlay rgba(2,10,7,0.94),
backdrop-blur(8px), image max-width 1200px, caption below, Esc / overlay click
closes, arrow keys move between items).

=== BLOCK C: THE OUTCOME STATS ===
Margin-top 56px. Three stat cells, gap 14px (stacks below 640px).
Each: padding 22px, rounded-md, border 1px rgba(52,211,153,0.22),
background rgba(52,211,153,0.04).
  value font-mono 34px font-black #34d399 tabular-nums
  label font-mono 11px rgba(255,255,255,0.48), margin-top 6px
  Cell 1  value VERBATIM "4"    label VERBATIM "핵심 화면"
  Cell 2  value VERBATIM "5"    label VERBATIM "확정한 배치 규칙"
  Cell 3  value VERBATIM "6종"  label VERBATIM "분리한 컴포넌트"
Values count up over 0.8s on entry.

=== BLOCK D: THE PROTOTYPE NOTE (required) ===
Margin-top 28px, a strip: padding 16px 20px, rounded-md,
border 1px rgba(251,191,36,0.28), background rgba(251,191,36,0.05).
  font-mono 11px #fbbf24, VERBATIM:
  "이 프로젝트는 백엔드 연동 전의 프론트엔드 프로토타입입니다.
   화면의 모든 금액은 예시이며, 실제 사용자나 실제 금융 데이터는 없습니다."

Then, margin-top 14px, a slim numbers note: padding 14px 18px, rounded-md,
border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02).
  font-mono 11px rgba(255,255,255,0.45), VERBATIM:
  "위 숫자는 설계 산출물을 센 것입니다. 사용자 수나 사용성 테스트 결과는 없습니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The page background lifts #04110c -> #061a13 over 1.2s
0.10s  Label, heading word by word at 0.25s
0.80s  Paragraph
1.30s  Gallery items fade up 0.1s apart (y 20px -> 0, 0.6s)
2.20s  Stat cells fade up 0.1s apart, values counting
2.80s  Prototype note, then the numbers note at 3.00s

=== RESPONSIVE ===
< 900px: single-column gallery.
< 640px: stat cells stack; heading 24px.

=== ACCESSIBILITY ===
prefers-reduced-motion: no count-up, no hover scale, no background transition.
Every gallery item is a real <button> opening the lightbox with a visible focus
ring (2px #34d399, offset 2px). Each image needs a Korean alt text derived from its
caption. The lightbox traps focus while open and returns focus on close.
The prototype note must be in normal document order.

=== DO NOT ===
Do not invent user counts, usability test results, or engagement metrics.
Do not remove the prototype note.
Do not add confetti.
```

---

## PAGE 10 — 회고 · 다음 단계 · 퇴장

**개발 실체**: KPT 회고 (PROBLEM 포함) + 다음 단계 + GitHub
**연출 장치**: 물결이 가라앉으며 퇴장

```text
Build the CLOSING SECTION of a personal finance dashboard portfolio page: a KPT
retrospective, next steps, a repository link, and an exit transition where the
water settles and drains.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An honest retrospective including real problems, not just wins
2. Concrete next steps
3. The repository link
4. A clean exit back to the village

=== MOOD ===
Water going still. Teal fading. Quiet, honest, unhurried. No triumphalism.

=== DESIGN TOKENS (use exactly) ===
background #061a13 | panel #0c261e | primary teal #34d399 | accent #6ee7b7
keep #4ade80 | problem #f87171 | try #fbbf24
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
  VERBATIM: "화면을 만드는 시간보다 배치를 고민한 시간이 길었다"

PARAGRAPH (16px leading-9, max-width 720px, margin-top 20px):
  VERBATIM: "코드를 짜는 건 며칠이면 됐습니다.
             어떤 순서로 보여줄지 정하는 데 훨씬 오래 걸렸고,
             그 결정들이 이 프로젝트에서 제일 남는 부분이었습니다."

=== BLOCK B: KPT ===
Margin-top 52px. Three columns, gap 16px (single column below 768px).
Each column: padding 22px, rounded-md, background #0c261e,
border 1px rgba(255,255,255,0.10), with a 3px top border in its own color.
Header: font-mono 11px letter-spacing 0.2em, uppercase.
Items: 15px leading-8, each prefixed "· ", 14px apart.

COLUMN 1 - header VERBATIM "KEEP", color #4ade80, top border #4ade80. Items VERBATIM:
  "배치 결정마다 이유를 적어둔 것"
  "집계를 한 곳으로 모은 것"
  "증감을 색만으로 표현하지 않기로 한 것"

COLUMN 2 - header VERBATIM "PROBLEM", color #f87171, top border #f87171. Items VERBATIM:
  "표기 규칙을 화면을 다 만든 뒤에야 정했다"
  "사용자에게 두 배치를 실제로 보여주고 물어보지 못했다"
  "테스트 코드가 하나도 없다"

COLUMN 3 - header VERBATIM "TRY", color #fbbf24, top border #fbbf24. Items VERBATIM:
  "실제 금융 데이터 연동과 대시보드 프로토타입 고도화"
  "규칙을 먼저 정하고 화면을 만드는 순서로 바꾸기"
  "두 배치를 실제 사용자 5명에게 보여주고 확인하기"

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), top border
grows 3px -> 4px. 0.3s.

=== BLOCK C: NEXT STEPS CARD ===
Margin-top 48px, padding 22px, rounded-md, border 1px rgba(52,211,153,0.22),
background rgba(52,211,153,0.04), border-left 3px #34d399.
  Label font-mono 11px letter-spacing 0.2em #34d399, VERBATIM: "다음 단계"
  Body 16px leading-8, margin-top 12px, VERBATIM:
  "실제 금융 데이터 연동과 mock data 기반 대시보드 프로토타입 고도화를 진행할 예정입니다.
   그 전에 두 배치를 실제 사용자에게 보여주고 확인하는 게 먼저입니다."

=== BLOCK D: GITHUB LINK ===
Margin-top 40px. A single primary link button:
  background #34d399, color #04110c, font-mono 14px font-black,
  padding 14px 28px, rounded-md.
  Label VERBATIM: "GitHub 저장소 ↗"
  Hover: scale 1.04, box-shadow 0 0 28px rgba(52,211,153,0.34). Active: scale 0.97.
  href https://github.com/toadsam, target _blank, rel noreferrer.

=== BLOCK E: EXIT BUTTON + EXIT TRANSITION ===
Margin-top 72px. A full-width button, height 88px, rounded-md,
border 1px rgba(255,255,255,0.14), background transparent.
  Label centered, font-mono 15px, letter-spacing 0.1em, rgba(255,255,255,0.62),
  VERBATIM: "← 마을로 돌아가기"
  Hover: border -> rgba(52,211,153,0.45), label -> #34d399, and a faint teal glow
  appears behind it. 0.4s.

EXIT TRANSITION (on click of this button OR the header's "← 마을로"):
  t=0.00s  Content fades to opacity 0 over 0.35s
  t=0.25s  A full-width water surface rises from the bottom to 60vh over 0.5s,
           its waves at their normal drift
  t=0.75s  The waves FLATTEN: their amplitude animates to 0 over 0.4s, becoming a
           perfectly straight line
  t=1.15s  The waterline drains downward off the bottom of the viewport over 0.4s
  t=1.55s  Full background #04110c, nothing on screen
  t=1.80s  Emit an onExit callback so the parent can restore the 3D village scene.
  Body scroll locks during the transition; the parent releases it.
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
GitHub button full width.

=== ACCESSIBILITY ===
prefers-reduced-motion: all reveals instant; the exit transition becomes a plain
0.3s fade with no water animation.
The exit button must be a real <button>, keyboard focusable, visible focus ring
(2px #34d399, offset 2px).

=== DO NOT ===
Do not soften the PROBLEM column - the honesty is the point.
Do not add confetti or celebration copy.
Do not flash the screen during the exit.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-1. 개발 실체 커버리지 점검

| 항목                 | 어디에                                                                                       | 형태                              |
| -------------------- | -------------------------------------------------------------------------------------------- | --------------------------------- |
| **왜 만들었나**      | P00                                                                                          | 잔액 해체 직후 첫 문장 (4초 안에) |
| **데모 영상**        | P01 부표 A                                                                                   | 수면 위 오브젝트                  |
| **GitHub**           | P01 부표 B · P10 버튼                                                                        | 부표 + 마무리 버튼                |
| **관람객 직접 조작** | **P02(배치 선택) · P03(스크롤=시간축) · P04(불일치 토글) · P06(규칙 토글) · P07(분해/조립)** | **5곳**                           |
| **코드**             | P03(차트 변환) · P04(Before/After) · P05(타입 계약) · P06(포맷 유틸) · P07(StatCard props)   | **총 6개**                        |
| **트러블슈팅**       | P04 (값 불일치) · P06 (표기 불일치)                                                          | **전체 프로세스 2건**             |
| **설계 의사결정**    | P02 (정보 배치) · P05 (화면 분리) · P07 (컴포넌트 경계)                                      | **이 프로젝트의 핵심 기여**       |
| **접근성 결정**      | P06                                                                                          | 색각 시뮬레이션 검증 포함         |
| **범위·한계**        | **P08 한 장 통째로**                                                                         | 만든 것 6 · 안 만든 것 6          |
| **결과물**           | P09                                                                                          | 갤러리 4장                        |
| **회고**             | P10                                                                                          | KPT (PROBLEM 3개)                 |

## D-2. 새로 만들 파일

```
src/components/ui/project-viewers/stages/mywave/
  index.tsx                 ← PAGE 00~10 순서, 스크롤→12개월 매핑 소유
  useScrollMonth.ts         ← 스크롤 → CSS 변수 + 1월~12월 (React state 금지)
  WaterSurface.tsx          ← ⭐ 공용 SVG 물결 (P00·P01·P08·P10 재사용)
  BalanceDissolve.tsx       ← P00 · 숫자 해체
  BuoyHero.tsx              ← P01 · 부표 3개
  LayoutCompare.tsx         ← P02 · 같은 데이터 두 배치 + 선택 후 근거 공개
  FlowChartScroll.tsx       ← P03 · 스크롤 = 곡선 그리기 + 코드 단계 하이라이트
  MismatchDemo.tsx          ← P04 · 따로 계산 토글
  ScreenSplit.tsx           ← P05 · 두 목업 + 계약선
  FormatConverge.tsx        ← P06 · 4표기 수렴 + 색각 패널
  ExplodedView.tsx          ← P07 · 3D 분해/조립
  ScopeWaterline.tsx        ← P08 · 수면 위/아래
  copy.ts                   ← 모든 한국어 문구
  assets.ts                 ← [IMG-01~04] · [VIDEO-01]
```

> ⭐ **`WaterSurface.tsx` 를 먼저 만들 것.** P00 진입, P01 히어로, P08 범위, P10 퇴장이
> 전부 같은 물결 컴포넌트를 다른 파라미터로 씁니다 (`height`, `amplitude`, `layers`, `speed`).
> **`amplitude: 0` 이 P10 퇴장 연출의 핵심**이므로 처음부터 애니메이션 가능한 prop으로 설계할 것.

## D-3. 기존 코드 재사용 / 선행 작업

재사용: `CodeBlock`, `ImageSlot`, `MockScreen`, `CountUp`, `RevealText` (`shared.tsx`)

> ⚠️ **선행 작업 (10개 프로젝트 공통 1건)**: `shared.tsx` 의 `DecisionTable`,
> `ArchDiagram`, `CompareBars`, `ProcessTimeline`, `QuoteCard`, `TldrBanner`,
> `BeforeAfter`, `ChallengeCard` 가 현재 **모듈 내부 함수(비export)** 입니다.
> stage 폴더에서 쓰려면 export로 승격해야 합니다.
> MyWave는 표가 많아 `DecisionTable` 승격이 특히 필요 (P02·P03·P05·P06·P07 전부 사용).

## D-4. 버릴 것

- `[KILL]` `DashboardProjectViewer` 의 mywave 분기 → stage 폴더로 이전
- `[KILL]` mywave의 기존 `SIGNATURE` 데모 → P02 `LayoutCompare` + P03 `FlowChartScroll` 로 분해 흡수

## D-5. 미디어 확보 목록

| 슬롯         | 내용                                            | 비율  | 우선도   |
| ------------ | ----------------------------------------------- | ----- | -------- |
| `[VIDEO-01]` | 요약 → 흐름 차트 → 목표 화면 이동 (1분 48초)    | 16/9  | 중간     |
| `[IMG-01]`   | 요약 대시보드                                   | 16/10 | **최상** |
| `[IMG-02]`   | 자산 흐름 차트 화면                             | 16/10 | **최상** |
| `[IMG-03]`   | 목표 관리 화면                                  | 16/10 | 높음     |
| `[IMG-04]`   | **표기 규칙 시트** (숫자/증감 규칙 정리 이미지) | 16/10 | 높음     |

> 💡 `[IMG-04]` 는 스크린샷이 아니라 **직접 만든 규칙 시트**여도 됩니다.
> 오히려 그게 "설계를 문서로 남겼다"는 증거가 되어 이 프로젝트에 더 잘 맞습니다.

## D-6. 코드 스니펫 확보 목록 (전부 실제 저장소에서)

| 페이지 | 파일                                        | 줄  | 하이라이트                             |
| ------ | ------------------------------------------- | --- | -------------------------------------- |
| P03    | `toChartSeries.ts`                          | 26  | (1)~(4) 4구간 · 빈 달 채우기 · 축 범위 |
| P04    | `SummaryCard.tsx · SpendChart.tsx (before)` | 14  | 서로 다른 필터 조건 2줄                |
| P04    | `useMonthlySummary.ts (after)`              | 20  | 타입 정의 · 단일 필터                  |
| P05    | `types/summary.ts`                          | 20  | 필터 설명 필드 · 단방향 의존 주석      |
| P06    | `format.ts`                                 | 22  | 증감 반환 타입 · 축 전용 주석          |
| P07    | `StatCard.tsx`                              | 20  | props 타입 · 포맷은 부모가             |

## D-7. 안전장치 대조표

이 방은 **제어권을 뺏지 않습니다.** 전부 관람객이 직접 누릅니다.

| 페이지 | 장치            | 안전장치                                                      |
| ------ | --------------- | ------------------------------------------------------------- |
| P02    | 배치 선택       | **집계·투표 표시 없음** · "차이를 모르겠다" 3번째 선택지 제공 |
| P03    | 스크롤 = 시간축 | reduced-motion 시 완성된 곡선 즉시 표시                       |
| P04    | 불일치 토글     | 언제든 복구 · 재현용 예시 데이터 명시                         |
| P06    | 규칙 토글       | 언제든 복구                                                   |
| P07    | 자동 분해 시연  | 관람객 미조작 시 1회만                                        |

## D-8. 최종 체크리스트

- [ ] **금융 조언 · 저축 권유 · 투자 제안 문구가 0개인지**
- [ ] **모든 금액에 "예시 데이터" 표기**가 있는지 (전 페이지)
- [ ] **P08 "안 만든 것" 6개가 그대로 남아 있는지** — 이 방의 신뢰도가 여기 걸림
- [ ] P09 **"프론트엔드 프로토타입" 고지**가 남아 있는지
- [ ] **증감이 색만으로 구분되지 않는지** — ▲/▼ 와 +/− 항상 병기 (전 페이지)
- [ ] P06 색각 검증 패널이 **양쪽 다 무채색**으로 렌더되는지 (색 넣지 말 것)
- [ ] `WaterSurface.tsx` 를 **먼저** 만들었는지 (`amplitude` 애니메이션 가능하게)
- [ ] P02 두 배치의 **데이터가 실제로 동일**한지 (B에서도 나머지 항목이 접혀만 있고 존재)
- [ ] P02 배치 A가 **허수아비가 아닌지** (실제로 납득 가능한 표여야 함)
- [ ] P02에 **투표 집계·"대부분 B를 골랐습니다" 표시가 없는지**
- [ ] P03 스크롤을 **React state로 관리하지 않는지** (CSS 변수 + rAF)
- [ ] P03 차트 path를 **스크롤마다 재계산하지 않는지** (1회 계산)
- [ ] P03 y축이 0에서 시작하지 않을 때 **축에 명시**되는지
- [ ] P04 불일치 금액이 **작게** 설정됐는지 (3,200원 — 놓치기 쉬운 게 핵심)
- [ ] P07 분해가 **transform/opacity만** 쓰는지 (layout 속성 금지)
- [ ] 물결 애니메이션이 **뷰포트 밖 + 탭 숨김 시 정지**하는지
- [ ] `prefers-reduced-motion` 에서 물결이 **완전 정지**하는지
- [ ] 숫자 전부 `tabular-nums`
- [ ] 이 방은 **무음** — 사운드 토글 자체를 두지 않았는지
- [ ] 지어낸 수치 0개 — 사용자 수·사용성 테스트 결과 주장 금지
