# 02. MyStock-Desk — 프롬프트 팩

> 거래 기록 기반 포트폴리오 분석과 AI 체크리스트를 제공하는 투자 기록 서비스 · React / TypeScript / Spring Boot / Tailwind / Recharts / MySQL
> **사용법**: `PAGE 00` ~ `PAGE 10` 의 코드블록을 **하나씩 통째로 복사해서 Variant에 붙여넣으세요.**
> 각 프롬프트는 **완전히 자립적**입니다 (색상·폰트·무드가 매번 반복 포함).
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 방의 한 문장

**"새벽 트레이딩 데스크. 숫자는 정확해야 하고, AI는 조언하지 않는다."**

## A-2. 왜 이 메타포인가

MyStock의 핵심은 **"계산이 틀리면 아무 의미가 없다"** 는 것이다.
수익률이 0.3% 어긋나면 그 화면은 예쁜 게 아니라 위험하다.

그리고 이 프로젝트가 내린 가장 중요한 결정은 **"AI에게 매수·매도를 추천시키지 않는다"** 였다.
AI는 체크리스트만 한다. 리스크, 편중, 기록 누락을 점검한다.

그래서 이 방은 **정확함과 절제**를 연출한다.
화려한 애니메이션이 아니라, **관람객이 직접 거래를 입력해서 계산이 맞는지 확인하게** 만든다.
그리고 **AI에게 "종목 추천해줘"를 시켜보게 하고, 거절당하는 걸 보게 한다.**

## A-3. ⭐ 가장 중요한 원칙 — 연출은 개발 내용의 운반 수단이다

**모든 연출은 반드시 개발 실체를 하나 이상 전달해야 한다.** 멋있기만 한 연출은 넣지 않는다.

| 전달할 개발 실체 | 그걸 실어나르는 연출 | 페이지 |
|---|---|---|
| 왜 이걸 만들었나 (동기) | 장 시작 전 데스크가 켜지는 시퀀스의 첫 문장 | 00 |
| 데모 영상 · GitHub | **데스크 위의 물건 3개** — 보조 모니터, 노트, 메모지 | 01 |
| 포트폴리오 계산 로직 | **관람객이 거래를 직접 입력** → 평균단가·수익률이 계산되고, 옆에서 그 계산 코드가 단계별로 실행됨 | 02 |
| **왜 이동평균법인가** | 같은 거래 기록을 **이동평균 / 선입선출로 동시에 계산**해 결과가 갈리는 걸 보여줌 | 03 |
| **트러블 01: 평균단가가 틀렸다** | **관람객이 「전량 매도 후 재매수」 시나리오를 직접 실행** → 수익률이 이상해짐 → 원인 추적 → 수정 코드 | 04 |
| **AI는 추천하지 않는다** | **관람객이 "종목 추천해줘"를 직접 입력** → AI가 거절하고 체크리스트로 응답 | 05 |
| 뉴스 영향 분석 | 뉴스 카드와 보유 종목 사이에 연결선이 그어짐 (인과 아님을 명시) | 06 |
| **트러블 02: 외부 API가 죽으면 화면도 죽었다** | **"API 중단" 토글** → 페이지가 실제로 mock 데이터로 전환 | 07 |
| 백엔드 도메인 구조 | 거래 → 보유 → 평가의 계산 흐름을 계층으로 분해 | 08 |
| 결과물 · 화면 갤러리 | 데스크 전체 화면이 갤러리로 확장 | 09 |
| 회고 · 다음 단계 | 장 마감 → 화면 순차 종료 → 퇴장 | 10 |

## A-4. 서비스 설계 결정 ↔ 웹 재현 대응

| 서비스에서 내린 결정 | 이 웹페이지에서의 재현 |
|---|---|
| 숫자는 항상 검산 가능해야 한다 | **관람객이 직접 입력해서 계산 과정을 단계별로 본다** |
| AI는 추천을 하지 않는다 | **관람객이 추천을 요구하면 실제로 거절당한다** |
| API가 죽어도 화면은 살아야 한다 | **토글로 API를 죽여본다** |
| 상승/하락 색은 문화권마다 다르다 | 색만이 아니라 **부호와 화살표를 항상 함께** 표시 |

## A-5. 관람 곡선 (감정 + 정보 밀도)

```
집중  ╭────────────╮ P02~04 계산 검증 (최고 밀도)
     ╱              ╰──╮  ╭── P05 AI 거절 (전환점)
 P00                    ╰──╯  ╰───╮
 개장                                ╰──── P09~10 마감
정보  낮 ────╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲──────
          P02~08 개발 밀도 최고조
시간  08:50 ── 09:00 ── 11:20 ── 14:40 ── 15:30
```

**핵심 장치**: 헤더에 **`09:14  ● 장중`** 시계가 있고, 스크롤 진행도가 곧 장 시간이다.
마지막 섹션에서 `15:30 ○ 장 마감` 이 된다. 진행바 역할과 컨셉 전달을 동시에 한다.

## A-6. 명장면 2개

**① PAGE 04 — 수익률이 틀리는 순간** (기술의 클라이맥스)
관람객이 「전량 매도 후 재매수」 버튼을 누르면 **수익률 표시가 눈앞에서 말이 안 되는 값으로 바뀐다.**
뜨는 문장: *"방금 그 숫자, 실제로 화면에 그렇게 떴습니다."*
그리고 평균단가 계산의 어느 줄이 문제였는지 추적이 시작된다.

**② PAGE 05 — AI가 거절한다** (설계 철학의 클라이맥스)
입력창에 예시 버튼으로 **"지금 뭐 사야 돼?"** 를 넣을 수 있다.
AI는 답하지 않고 이렇게 응답한다:
*"매수·매도 판단은 드리지 않습니다. 대신 지금 포트폴리오에서 확인이 필요한 3가지를 알려드릴게요."*
그리고 그 거절을 **강제하는 시스템 프롬프트와 서버 측 검증 코드**가 바로 옆에 나온다.

## A-7. 다른 9개 방과의 차별점

| 축 | MyStock | 나머지 |
|---|---|---|
| 톤 | **가장 절제됨** — 애니메이션 최소 | 각자 |
| 관람객 역할 | **검산자** — 계산이 맞는지 확인 | 관찰자 |
| AI 서술 | **못 하는 것부터 말한다** | 대체로 할 수 있는 것 |
| 색 | 차가운 청색 · 새벽 | 각자 |
| 숫자 | 전부 검산 가능한 예시 데이터 | 각자 |

## A-8. 절대 금지 (안전 규칙)

- **투자 권유로 읽힐 여지가 있는 문구 전면 금지.** 종목 추천·목표가·수익 보장·"지금이 기회" 류
- **실존 종목명 사용 금지.** 전부 가상 종목 (`가나전자`, `한빛바이오` 등)
- 수익률 숫자는 전부 **검산 가능한 예시**여야 하고, 실제 성과로 오인될 표현 금지
- "이 서비스는 투자 자문이 아닙니다" 고지가 **P05와 P09에 반드시 상시 노출**
- 상승/하락을 **색으로만** 구분 금지 — 부호(+/−)와 화살표(▲/▼)를 항상 병기 (색각 접근성)
- 소리 없음 (이 방은 무음)

---

# B. 공통 디자인 토큰 (참고용 — 각 프롬프트에 이미 포함됨)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#040d18` → `#061421` (P09부터) | 페이지 배경 |
| `--panel` | `#0a1727` | 데스크 패널 |
| `--primary` | `#38bdf8` | 청색 · 강조 |
| `--accent` | `#7dd3fc` | 보조 강조 |
| `--up` / `--down` | `#f87171` / `#60a5fa` | 상승/하락 (**반드시 부호·화살표 병기**) |
| `--ok` / `--warn` | `#4ade80` / `#fbbf24` | 검증 통과 / 주의 |
| `--text` | `rgba(255,255,255,0.88)` | 본문 |
| `--muted` | `rgba(255,255,255,0.46)` | 캡션 |
| `--grid` | `rgba(56,189,248,0.06)` | 차트 격자 |
| 코드 패널 | bg `#061220`, border `rgba(56,189,248,0.18)` | |
| 문법 색 | 주석 `#4a6b83` / 문자열 `#a3e635` / 키워드 `#38bdf8` / 숫자 `#fbbf24` | |
| 이징 | `cubic-bezier(0.4,0,0.2,1)`, 0.25~0.6s | 짧고 정확하게 |
| 숫자 | **전부 `tabular-nums`** (이 방에서 특히 중요) | |

---

# C. 페이지별 프롬프트

---

## PAGE 00 — 개장 전 (진입 시퀀스)

**개발 실체**: 왜 이걸 만들었는가 (동기)
**연출 장치**: 장 시작 전 데스크의 화면들이 순차 점등

```text
Build a full-screen cinematic PRE-MARKET OPEN intro for an investment record
service portfolio page. Stack: React + TypeScript + Tailwind CSS + framer-motion.
Single self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
Why this project was built. The final readable line must state the developer's
motivation, within 4 seconds.

=== MOOD ===
A desk at 8:50 in the morning, before the market opens. Cold blue on near-black,
monitors warming up, everything quiet and precise. Restrained, professional,
slightly tense. NOT a hype trading-app aesthetic. NO rocket emoji energy, NO
"to the moon" tone. This is a person checking their own records.

=== COMPLIANCE (applies to every page in this project) ===
Never write anything that reads as investment advice, a stock recommendation, a
price target, or a promise of returns. All ticker names must be FICTIONAL.

=== DESIGN TOKENS (use exactly) ===
background #040d18 | panel #0a1727 | primary blue #38bdf8 | accent #7dd3fc
up #f87171 | down #60a5fa | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
grid rgba(56,189,248,0.06)
fonts: headings font-black, body sans leading-8, ALL numbers/labels font-mono
easing cubic-bezier(0.4,0,0.2,1), durations 0.25s-0.6s | rounded-md
ALL numbers tabular-nums (critical in this project - values must not jitter)

=== LAYOUT ===
Full viewport, position fixed, above page content.
Background: #040d18 plus a faint 40px grid in rgba(56,189,248,0.06) and a soft
blue radial glow at 50% 45% (rgba(56,189,248,0.05), 60vw) that strengthens as the
sequence proceeds.
Content: a centered column, max-width 640px, left-aligned.

=== TIMELINE (follow exactly) ===
t=0.00s  Near-black. Only the grid, very faint. A single clock readout at the
         top-right of the column, font-mono 13px rgba(255,255,255,0.46),
         tabular-nums, VERBATIM: "08:50"
t=0.30s  A boot checklist prints, one line every 0.24s, font-mono 13px
         rgba(255,255,255,0.46), line-height 2.0, each line typing at ~55 chars/sec
         with a 1px blue block cursor. Lines VERBATIM in order:
           "MYSTOCK DESK  v1.0"
           "거래 기록 로드 ............... OK"
           "보유 종목 계산 ............... OK"
           "시세 연결 ................... OK"
           "AI 체크리스트 준비 ........... OK"
         Each "OK" in #4ade80, popping 0.12s after its line completes.
t=1.60s  A horizontal blue rule draws left to right (0.45s).
t=1.90s  TITLE appears above the checklist (which slides down 0.35s to make room):
           Line 1, VERBATIM: "MyStock-Desk"
             58px font-black, #38bdf8, letter-spacing -0.02em
           Line 2, VERBATIM: "거래 기록 기반 포트폴리오 분석 · React + Spring Boot"
             14px font-mono, rgba(255,255,255,0.46), letter-spacing 0.13em,
             margin-top 14px
t=2.50s  THE MOTIVATION LINE fades in below the rule. This is the substance of this
         page. 17px, leading-9, rgba(255,255,255,0.88), max-width 570px.
         Korean copy, VERBATIM:
         "내 계좌 수익률이 얼마인지 알려면 앱 세 개를 켜야 했다.
          거래 기록은 메모장에, 비중은 머릿속에, 뉴스는 따로 있었다.
          그걸 한 화면에 모으면 판단이 달라질까 궁금했다."
         Reveal word by word, stagger 0.035s, y 6px -> 0.
t=3.60s  The clock ticks 08:50 -> 08:59 in fast increments over 0.6s (tabular-nums,
         no layout shift), then stops. A market-status chip appears beside it:
         a 7px dot and font-mono 12px text, VERBATIM: "○ 개장 전"
t=4.20s  Scroll hint at the bottom, font-mono 12px rgba(255,255,255,0.46),
         VERBATIM: "↓ 09:00 개장"
         with a blue chevron bouncing 4px on a 1.8s cycle.

=== THE PAGE CLOCK (persists after this sequence) ===
From here on, a clock in the fixed header advances with SCROLL PROGRESS, not with
real time: 09:00 at the top of the page, 15:30 at the bottom. Format VERBATIM
"09:14  ● 장중", switching to VERBATIM "15:30  ○ 장 마감" in the final section.
Bind scroll progress to a CSS custom property inside a requestAnimationFrame-
throttled listener. Do NOT store scroll position in React state.

=== ESCAPE HATCHES (required) ===
Any click, scroll, keypress, or Escape skips to the t=4.20s end state instantly.
A skip control from t=0.40s at the bottom-right, font-mono 11px,
rgba(255,255,255,0.35), VERBATIM: "[ 건너뛰기 ]"

=== ACCESSIBILITY ===
prefers-reduced-motion: render the end state immediately - no typing, no clock
ticking, no chevron bounce.
All text is real DOM text. The clock must be tabular-nums so it does not shift.

=== RESPONSIVE ===
< 768px: title 34px, subtitle 12px, motivation 15px, checklist 12px, padding 24px.

=== DO NOT ===
No candlestick charts flying, no green/red confetti, no "profit" imagery.
No real ticker symbols or company names.
Do not delay the motivation line past 3.0s.
```

---

## PAGE 01 — 히어로 · 데스크 위의 물건들

**개발 실체**: 프로젝트 정체 + **데모 영상 · GitHub · 개발 메모**
**연출 장치**: 링크가 버튼이 아니라 **데스크 위에 놓인 물건 3개**

```text
Build the HERO SECTION of an investment record service portfolio page, where the
demo video, the GitHub repository, and a scope note are three OBJECTS sitting on a
trading desk - never a link row.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained section.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the project is (identity + hard facts)
2. The demo video entry point
3. The GitHub repository link
4. The development scope
Items 2-4 must read as physical objects on a desk, not as buttons.

=== MOOD ===
A trading desk just after the market opened. Cold blue, precise, quiet.
Restrained. NO hype, NO rocket imagery, NO profit celebration.

=== COMPLIANCE ===
No investment advice, no recommendations, no price targets, no return promises.
All ticker names FICTIONAL.

=== DESIGN TOKENS (use exactly) ===
background #040d18 | panel #0a1727 | primary blue #38bdf8 | accent #7dd3fc
up #f87171 | down #60a5fa | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
grid rgba(56,189,248,0.06) | panel border rgba(56,189,248,0.18)
fonts: headings font-black, body sans leading-8, numbers/labels font-mono
easing cubic-bezier(0.4,0,0.2,1) 0.25s-0.6s | rounded-md
ALL numbers tabular-nums

=== PERSISTENT HEADER (fixed, present on every section) ===
Height 54px, background rgba(4,13,24,0.85), backdrop-blur(10px),
bottom border 1px rgba(56,189,248,0.18).
  LEFT   "← 마을로"  13px font-mono rgba(255,255,255,0.46)
  CENTER "MyStock-Desk"  14px font-black #38bdf8
  RIGHT  the market clock, driven by scroll progress (09:00 at top, 15:30 at
         bottom), format VERBATIM: "09:14  ● 장중"
         13px font-mono tabular-nums, the dot 7px #4ade80.
         Bind scroll to a CSS custom property in a rAF-throttled listener; never
         React state.

=== LAYOUT ===
min-height 100vh, centered, max-width 1140px, padding-block 96px.
Two columns, gap 40px (stacks below 1024px, desk first):
  LEFT  (54%) : THE DESK, height ~540px
  RIGHT (46%) : kicker + headline + summary + a 4-cell fact grid

=== THE DESK (the defining object of this page) ===
Drawn entirely in CSS/SVG. A dark desk surface (a subtle gradient from #0a1727 to
#071220) with a soft blue rim light along its top edge, seen slightly from above.
Objects on it:

  THE MAIN MONITOR (center-back, largest, ~62% width, aspect 16/10)
    A screen frame, border 1px rgba(56,189,248,0.24), background #061220,
    showing a MINIATURE PORTFOLIO DASHBOARD in pure CSS/SVG:
      - a small line chart (SVG polyline, stroke #38bdf8 1.5px, with a
        rgba(56,189,248,0.10) area fill) drawn over a faint grid
      - a 4-row holdings list, font-mono 9px, each row: a FICTIONAL ticker name,
        a quantity, and a return value shown as sign + arrow + number, e.g.
        VERBATIM "가나전자   12주   ▲ +4.20%"
        Names VERBATIM: "가나전자" "한빛바이오" "동해물산" "대륙케미칼"
        Two rows positive (#f87171, "▲ +"), two negative (#60a5fa, "▼ −").
      - a donut allocation chart at the right, 4 segments
    A small chip at the screen's top-left, font-mono 9px rgba(255,255,255,0.40),
    VERBATIM: "예시 데이터"

  OBJECT A - THE SIDE MONITOR (left, smaller, ~26% width, aspect 4/3) = DEMO VIDEO
    Frame border 1px rgba(125,211,252,0.40). Inside, centered: a play triangle 22px
    #7dd3fc in a 46px circle. Bottom-left chip, font-mono 9px,
    background rgba(0,0,0,0.5), VERBATIM: "2분 05초"
    A label on the desk beneath it, font-mono 10px #7dd3fc,
    VERBATIM: "▶ 데모 영상"
    Click -> video lightbox: overlay rgba(2,8,16,0.94) backdrop-blur(8px),
    16/9 player, max-width 1020px, Esc / overlay click closes.
    If no source is supplied render a CSS placeholder with centered text
    VERBATIM "데모 영상 자리 · 16:9".
    [VIDEO-01] a full flow: enter a trade -> holdings and return recalculate ->
    allocation chart updates -> AI checklist runs.

  OBJECT B - THE NOTEBOOK (front-right, a closed laptop or a bound notebook shape,
    ~22% width) = GITHUB
    A rounded rect, background #0a1727, border 1px rgba(255,255,255,0.20), with a
    monospace "< >" glyph 22px rgba(255,255,255,0.75) on its cover.
    Label beneath, font-mono 10px rgba(255,255,255,0.80), VERBATIM: "GitHub 저장소"
    Sub-label, font-mono 9px rgba(255,255,255,0.46),
    VERBATIM: "React · Spring Boot · MySQL"
    Click -> https://github.com/toadsam/MyStock-Desk in a new tab
    (target _blank, rel noreferrer).

  OBJECT C - THE STICKY NOTE (front-left, small, rotate -5deg) = SCOPE NOTE
    A 108x76px note, background #12202f, border 1px rgba(255,255,255,0.14).
    Three tiny lines, font-mono 9px rgba(255,255,255,0.60), VERBATIM:
      "프론트 + 백엔드"
      "포트폴리오 계산 로직"
      "AI 응답 구조 설계"
    Not a link. Hovering lifts it 3px and straightens the rotation to 0deg.

  A COFFEE RING stain on the desk surface (a faint ellipse outline,
  rgba(255,255,255,0.04)) - purely for texture, no meaning.

  ENTRANCE: the desk fades up first, then the main monitor's screen lights (its
  chart drawing left to right over 0.7s, the holdings list appearing row by row),
  then objects A, B, C fade/settle in 0.14s apart.
  Hover any of A/B/C: lift 3px, border brightens, 0.3s.
  A hint below the desk, font-mono 10px rgba(255,255,255,0.35), fading out
  permanently once any object has been hovered or focused,
  VERBATIM: "책상 위 물건들을 눌러보세요"

=== RIGHT COLUMN CONTENT (Korean copy - VERBATIM, never translate) ===

KICKER (font-mono 12px, letter-spacing 0.3em, uppercase, color #38bdf8):
  "DASHBOARD · 거래 기록 기반 포트폴리오 분석"

HEADLINE (font-black, 40px desktop / 26px mobile, leading-tight,
          rgba(255,255,255,0.88)):
  Line 1, VERBATIM: "수익률이 얼마인지 모르면"
  Line 2, color #38bdf8, margin-top 10px, VERBATIM: "판단할 수 있는 게 없다"

SUMMARY (16px leading-9, max-width 540px, margin-top 22px):
  VERBATIM: "사용자가 입력한 거래 기록만으로 보유 종목, 수익률, 자산 비중을 계산한다.
             AI는 매수·매도를 추천하지 않고, 놓친 것들을 점검한다."
  Emphasize "매수·매도를 추천하지 않고" in #7dd3fc, font-bold.

FACT GRID (4 cells, 2x2, margin-top 30px).
Each cell: border 1px rgba(56,189,248,0.20), rounded-md, padding 14px.
value font-mono 22px font-black #38bdf8 tabular-nums, label font-mono 10px
rgba(255,255,255,0.46) letter-spacing 0.1em below.
  Cell 1  value "6"        label "기술 스택"
  Cell 2  value "5"        label "핵심 기능"
  Cell 3  value "풀스택"    label "담당 범위"
  Cell 4  value "0"        label "종목 추천 기능"
The fourth cell is deliberate - its value 0 is a design statement. Give it a
1px rgba(125,211,252,0.35) border to set it apart, and a tiny note beneath the
grid, font-mono 10px rgba(255,255,255,0.35), VERBATIM:
  "마지막 칸은 오타가 아닙니다"

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Desk fades up (y 24px -> 0, 0.6s)
0.35s  Main monitor screen lights; its chart draws over 0.7s; holdings rows appear
       0.08s apart
1.20s  Objects A, B, C settle in 0.14s apart
0.80s  Kicker fades up (runs in parallel with the desk)
1.00s  Headline line 1 word by word (stagger 0.035s), line 2 at 1.45s
1.90s  Summary reveals
2.30s  Fact cells fade in 0.08s apart; the fourth cell's "0" counts down from 5
       to 0 over 0.5s (a small, dry joke - keep it subtle)
2.90s  The desk hint and the fact-grid note fade in

=== RESPONSIVE ===
< 1024px: single column, desk first at height 420px.
< 640px: the desk flattens - the main monitor becomes full width, and objects A/B/C
become a horizontal row of three cards beneath it (still tactile, still rotated for
C). Headline 26px, fact grid 2x2.
Touch: objects A and B need a 44px minimum touch target.

=== ACCESSIBILITY ===
prefers-reduced-motion: no chart draw, no settle-in, no count-down; everything
renders in final state.
Objects A and B must be real focusable elements (button / anchor) with visible
focus rings (2px #38bdf8, offset 2px). Keyboard focus also triggers the lift.
Every return value on the monitor must include a SIGN and an ARROW, never color
alone (color-blind accessibility) - this rule applies to the entire project.
Numbers are tabular-nums.

=== DO NOT ===
Do not render the video and GitHub as a conventional button row anywhere.
Do not use real company or ticker names.
Do not imply any actual investment performance.
No hype visuals, no rockets, no confetti.
```

---

## PAGE 02 — 거래 하나가 화면 전체를 바꾼다 · 계산 로직

**개발 실체**: 거래 기록 → 보유 종목 → 수익률 → 비중 계산 + **각 단계 코드**
**연출 장치**: **관람객이 거래를 직접 입력** → 계산이 단계별로 실행되며 옆 코드가 순서대로 하이라이트됨

```text
Build a SECTION with a working portfolio calculator the viewer operates themselves:
they enter a trade, and the holdings, average cost, return and allocation
recalculate step by step while the corresponding server code highlights in order.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The exact calculation chain: trade -> holdings -> average cost -> return ->
   allocation
2. The real code for that chain, with each step visibly executing
3. A deliberate forward hook: the average-cost step had a bug (covered later)

=== MOOD ===
Trading desk, mid-morning. Cold blue, precise, quiet. Every number must look
trustworthy. Minimal motion - this page earns attention through accuracy, not flair.

=== COMPLIANCE ===
No investment advice, no recommendations, no price targets. FICTIONAL tickers only.
Every value on this page must be checkable by hand - the viewer should be able to
verify the arithmetic.

=== DESIGN TOKENS (use exactly) ===
background #040d18 | panel #0a1727 | primary blue #38bdf8 | accent #7dd3fc
up #f87171 | down #60a5fa | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #061220, border rgba(56,189,248,0.18)
syntax: comments #4a6b83, strings #a3e635, keywords #38bdf8, numbers #fbbf24
fonts: headings font-black, body sans leading-8, code + ALL numbers font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1140px, padding-block 120px.
  Block A : label + heading + two paragraphs (max-width 740px)
  Block B : a two-column split, gap 18px, tops aligned
              LEFT  (54%) : THE CALCULATOR, height 480px
              RIGHT (46%) : THE CODE PANEL, height 480px
            Below 1024px stacks, calculator first.
  Block C : the forward hook

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "01 · 계산 로직"

HEADING (28px font-black):
  VERBATIM: "거래 한 줄이 네 가지 숫자를 다시 만든다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "매수 한 건을 입력하면 보유 수량이 바뀌고, 평균단가가 다시 계산되고,
             수익률이 갱신되고, 자산 비중이 재분배된다. 순서를 틀리면 전부 틀린다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "직접 입력해보세요. 오른쪽 코드에서 지금 어느 단계가 실행 중인지 보입니다.
             숫자는 전부 손으로 검산할 수 있는 값입니다."
  Emphasize "손으로 검산할 수 있는 값" in #7dd3fc, font-bold.

=== BLOCK B LEFT: THE CALCULATOR (must actually compute) ===
Container: height 480px, rounded-md, border 1px rgba(56,189,248,0.18),
background #0a1727, padding 20px.

PART 1 - THE TRADE FORM (top, ~110px)
  Label font-mono 10px rgba(255,255,255,0.46), VERBATIM: "거래 입력"
  A row of four controls, all background rgba(255,255,255,0.04),
  border 1px rgba(56,189,248,0.20), rounded, padding 8px 10px, font-mono 12px:
    - a buy/sell segmented pair, VERBATIM "매수" | "매도" (default 매수)
    - a ticker select, options VERBATIM: "가나전자" "한빛바이오" "동해물산"
      (FICTIONAL - never real companies)
    - a quantity number input, placeholder VERBATIM "수량"
    - a price number input, placeholder VERBATIM "단가"
  Prefill with sensible round values (e.g. 10 and 12000) so the arithmetic stays
  easy to verify. Submitting with the prefilled values must work.
  A submit button: background #38bdf8, color #040d18, font-mono 12px font-black,
  padding 9px 20px, rounded-md, VERBATIM: "기록하기"

PART 2 - THE FOUR RESULT PANELS (middle, ~250px)
  A 2x2 grid, gap 10px. Each panel: padding 14px, rounded-md,
  border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02), with a
  font-mono 10px rgba(255,255,255,0.46) label at top.

  PANEL 1  label VERBATIM "보유 종목"
    A 3-row table, font-mono 11px: ticker, quantity, average cost.
    The row affected by the submitted trade flashes a
    rgba(56,189,248,0.12) background for 0.8s.
  PANEL 2  label VERBATIM "평균단가"
    A big value, font-mono 24px font-black #7dd3fc, tabular-nums, with the unit,
    format VERBATIM: "11,840원"
    Beneath it, the arithmetic shown explicitly in font-mono 10px
    rgba(255,255,255,0.46), format VERBATIM:
      "(기존 12주 × 11,600) + (10주 × 12,000) ÷ 22주"
    THIS EXPRESSION MUST UPDATE WITH REAL NUMBERS and must actually equal the
    displayed result. Showing the work is the point of this panel.
  PANEL 3  label VERBATIM "수익률"
    A big value, font-mono 24px font-black, tabular-nums, ALWAYS rendered as
    ARROW + SIGN + NUMBER, format VERBATIM: "▲ +3.71%"
    color #f87171 when positive, #60a5fa when negative.
    Beneath it, font-mono 10px rgba(255,255,255,0.46), format VERBATIM:
      "(현재가 12,280 − 평단 11,840) ÷ 11,840"
  PANEL 4  label VERBATIM "자산 비중"
    A horizontal stacked bar (3 segments in blues) plus a 3-row legend,
    font-mono 10px, each row a ticker and its percentage, tabular-nums.
    Segments animate their widths over 0.4s when the allocation changes.

PART 3 - THE STEP INDICATOR (bottom, ~50px)
  Four small step chips in a row, font-mono 10px, each a number and a label:
    VERBATIM "1 보유 갱신" · "2 평단 계산" · "3 수익률" · "4 비중"
  As the calculation runs, each chip lights in order (border -> #38bdf8,
  background -> rgba(56,189,248,0.12)), 0.22s apart, and dims back after 1.5s.

THE SUBMIT SEQUENCE:
  t=0.00s  Button presses in (scale 0.98)
  t=0.10s  Step chip 1 lights; PANEL 1's affected row flashes and its quantity
           counts to the new value over 0.3s
  t=0.32s  Step chip 2 lights; PANEL 2's expression re-writes with the new operands
           (each changed number briefly in #fbbf24), then its result counts up
  t=0.54s  Step chip 3 lights; PANEL 3's expression and value update
  t=0.76s  Step chip 4 lights; PANEL 4's bar segments animate to their new widths
  Each step ALSO highlights its code block on the right, at the same instant.

A reset control at the container's bottom-right, font-mono 11px,
rgba(255,255,255,0.46), VERBATIM: "↻ 초기 상태로"
A note at the container's bottom-left, font-mono 9px rgba(255,255,255,0.32),
VERBATIM: "가상 종목 · 예시 데이터입니다"

=== BLOCK B RIGHT: THE CODE PANEL ===
Height 480px, background #061220, border 1px rgba(56,189,248,0.18), rounded-md.
Header bar: three window dots (#ff5f56 #ffbd2e #27c93f, 8px) then the filename,
font-mono 11px rgba(255,255,255,0.45), VERBATIM: "PortfolioCalculator.java"
Body: font-mono 12px, leading-relaxed, line-number gutter rgba(255,255,255,0.22).

CONTENT: a service class, roughly 28 lines, with four clearly contiguous blocks:
  (1) apply a trade to the holding: increase or decrease quantity, creating the
      holding if it does not exist and removing it when the quantity reaches zero,
  (2) recompute the average cost for a BUY as a weighted average of the existing
      position and the new lot, and leave it unchanged for a SELL,
  (3) compute the return as (current price - average cost) / average cost, guarding
      against a zero average cost,
  (4) recompute each holding's allocation share against the total evaluated value.
Use a decimal type for money throughout, not a floating-point double, and make that
visible in the code.

THE LIVE HIGHLIGHT (required): as each of the four calculator steps runs, the
matching code block gets a rgba(56,189,248,0.14) row background that sweeps in from
the left over 0.28s and fades after 1.4s.
IMPLEMENTATION CONSTRAINT: render the code once and toggle CSS classes on refs to
the four block elements - do NOT re-render the code panel per step.

Caption bar at the bottom, border-top 1px rgba(56,189,248,0.12), font-mono 11px
rgba(255,255,255,0.45), prefixed "// ", changing with the active step:
  idle  VERBATIM: "// 왼쪽에서 거래를 입력하면 이 순서대로 실행됩니다"
  step2 VERBATIM: "// 매도할 때는 평단을 건드리지 않는다. 여기서 한 번 크게 틀렸다."
  step3 VERBATIM: "// 평단이 0이면 나눗셈이 터진다. 방어가 먼저다."
  step4 VERBATIM: "// 비중은 마지막에. 앞의 값이 다 확정돼야 한다."

=== BLOCK C: THE FORWARD HOOK (required - do not drop) ===
Margin-top 32px, one paragraph, 16px leading-9, max-width 760px,
rgba(255,255,255,0.88), VERBATIM:
  "2번 단계가 문제였다. 전량 매도한 뒤에 같은 종목을 다시 사면
   평균단가가 말이 안 되는 값이 됐다. 그 얘기는 조금 뒤에 직접 재현해보겠다."
Emphasize "평균단가가 말이 안 되는 값이 됐다" in #f87171, font-bold.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s (stagger 0.03s)
0.70s  Paragraph 1, paragraph 2 at 1.20s
1.70s  Calculator and code panel fade up together (y 18px -> 0, 0.5s)
2.20s  The four result panels populate with their initial values, 0.07s apart
2.70s  A one-time subtle pulse on the "기록하기" button (a soft blue ring, 2 pulses,
       0.9s each), disappearing permanently after the first submit

=== RESPONSIVE ===
< 1024px: stacked, calculator first (height 520px), code panel below (height auto,
max 480px, internal vertical scroll).
< 640px: form controls stack two per row; result panels become a single column of
four; the arithmetic expressions wrap to two lines; code font 11px with internal
horizontal scroll (the block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no count-up, no code sweep (blocks highlight instantly), no
button pulse. The calculation still runs and all values still update.
Form controls must be real labeled inputs; submit must be a real <button>.
Announce the result ONCE per submission via aria-live="polite", VERBATIM pattern:
  "평균단가 11,840원. 수익률 플러스 3.71 퍼센트."
  (Spell the sign as a word so screen readers do not drop it.)
Every return value renders ARROW + SIGN + NUMBER - never color alone.
All numbers tabular-nums. Code must be selectable, copyable text.

=== DO NOT ===
Do not use real company or ticker names.
Do not show arithmetic that does not actually check out - the displayed expression
must equal the displayed result.
Do not use floating-point doubles for money in the shown code.
Do not re-render the code panel per step.
Do not omit the forward hook.
```

---

## PAGE 03 — 평단은 하나가 아니다 · 이동평균 vs 선입선출

**개발 실체**: 원가 계산 방식 선택 근거 + **두 방식의 결과 차이**
**연출 장치**: 같은 거래 기록을 **두 방식으로 동시에 계산**해 결과가 갈리는 걸 보여줌

```text
Build a TECHNICAL DECISION section that runs the SAME trade history through two
cost-basis methods side by side - moving average and FIFO - so the viewer sees the
results diverge, with the honest reason one was chosen.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That "average cost" is not one universal formula - it is a chosen method
2. How the two methods produce different numbers from identical input
3. Why moving average was chosen here, and what that choice gives up

=== MOOD ===
Trading desk, analytical. Cold blue, tabular, quiet. This is the most numeric page
in the room and it should feel like a worksheet.

=== COMPLIANCE ===
No investment or tax advice. FICTIONAL tickers only. If the copy touches taxes, it
must explicitly say this project does not handle tax calculation.

=== DESIGN TOKENS (use exactly) ===
background #040d18 | panel #0a1727 | primary blue #38bdf8 | accent #7dd3fc
up #f87171 | down #60a5fa | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #061220, border rgba(56,189,248,0.18)
fonts: headings font-black, body sans leading-8, ALL numbers/labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1040px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the shared trade history table
  Block C : THE TWO METHOD PANELS side by side + the step-through control
  Block D : the divergence readout
  Block E : the decision table + the honest-cost card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "02 · 원가 계산 방식"

HEADING (28px font-black):
  VERBATIM: "「내 평단」은 계산 방식에 따라 달라진다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "같은 거래 기록인데 계산 방식을 바꾸면 평균단가가 달라진다.
             둘 다 틀린 게 아니다. 뭘 쓸지 정하고, 그걸 화면에 명시해야 하는 문제다."

=== BLOCK B: THE SHARED TRADE HISTORY ===
Margin-top 32px. A table, full width, font-mono 12px, row separators 1px
rgba(255,255,255,0.08), row padding 12px.
Headers VERBATIM: "순서" | "구분" | "수량" | "단가" | "금액"
Five rows, all for one FICTIONAL ticker (VERBATIM "가나전자"), with round numbers
so the arithmetic is checkable by hand:
  "1" | "매수" | "10주" | "10,000원" | "100,000원"
  "2" | "매수" | "10주" | "14,000원" | "140,000원"
  "3" | "매도" | "10주" | "13,000원" | "130,000원"
  "4" | "매수" | "10주" | "12,000원" | "120,000원"
  "5" | "매도" | "5주"  | "15,000원" | "75,000원"
매수 rows have a #f87171 "매수" cell; 매도 rows a #60a5fa "매도" cell. Both also
carry a prefix character (▲ for 매수, ▼ for 매도) so the distinction is not
color-only.
A label above the table, font-mono 10px letter-spacing 0.18em
rgba(255,255,255,0.46), VERBATIM: "동일한 거래 기록"

=== BLOCK C: THE TWO METHOD PANELS (the defining idea) ===
Margin-top 32px. Two panels side by side, equal width, gap 16px (stack below 900px).
Each: background #0a1727, rounded-md, padding 20px, height ~360px.
  LEFT  border 1px rgba(56,189,248,0.35)      header font-mono 13px #38bdf8,
        VERBATIM: "이동평균법"
  RIGHT border 1px rgba(255,255,255,0.14)     header font-mono 13px
        rgba(255,255,255,0.72), VERBATIM: "선입선출 (FIFO)"

Each panel contains:
  - A LOT LEDGER: a small stacked visualization of the remaining position.
    For the moving-average panel, ONE merged bar labeled with a single average cost.
    For the FIFO panel, SEPARATE stacked lots, each labeled with its own purchase
    price and remaining quantity, so the difference in model is visible at a glance.
    Lots use different blue tints; the merged bar uses a solid #38bdf8 at 30%.
  - A RUNNING AVERAGE COST readout, font-mono 22px font-black tabular-nums,
    format VERBATIM: "12,000원"
  - A REALIZED RESULT readout for the sells so far, ALWAYS with sign and arrow,
    font-mono 16px tabular-nums, format VERBATIM: "▲ +55,000원"
  - A tiny worked expression beneath each readout, font-mono 10px
    rgba(255,255,255,0.46), showing how that number was reached.

THE STEP-THROUGH CONTROL (centered, between the table and the panels):
  A row of controls, font-mono 12px:
    a back button VERBATIM "◀ 이전", a step readout VERBATIM "3 / 5",
    a forward button VERBATIM "다음 ▶", and a reset VERBATIM "↻ 처음"
  Stepping forward applies ONE trade from the history to BOTH panels
  SIMULTANEOUSLY. Both panels animate their ledgers and readouts over 0.35s.
  The trade history row currently applied is highlighted with a
  rgba(56,189,248,0.10) background and a 2px blue left border.
  Auto-advance: if the viewer does not interact within 5 seconds of the block
  entering the viewport, auto-step once every 2.2 seconds until step 5, then stop.
  Any manual interaction cancels auto-advance permanently.

=== BLOCK D: THE DIVERGENCE READOUT ===
Margin-top 24px. A slim full-width strip, padding 16px 20px, rounded-md,
border 1px rgba(251,191,36,0.28), background rgba(251,191,36,0.05).
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "두 방식의 차이"
  A single line, font-mono 14px, tabular-nums, updating with each step, format
  VERBATIM: "평균단가 차이  1,333원   ·   실현손익 차이  13,330원"
  When the difference is zero (at step 1 and 2), the strip dims to 45% opacity and
  the line reads VERBATIM: "아직 차이 없음 · 매도가 나와야 갈라진다"
  This transition from "identical" to "divergent" IS the argument - make sure the
  first sell (step 3) produces a visible jump.

=== BLOCK E: THE DECISION TABLE + HONEST COST ===
Margin-top 48px. A 4-column table, font-mono 12px, row separators 1px
rgba(255,255,255,0.08), row padding 14px.
Headers VERBATIM: "방식" | "장점" | "단점" | "판단"
Rows:
  "이동평균법" | "화면에 보여줄 숫자가 하나뿐이라 단순" | "매도 시점별 손익을 따로 못 본다" | "채택"
  "선입선출"   | "실제 세금 계산 방식에 가깝다"        | "로트를 전부 들고 있어야 하고 화면도 복잡해진다" | "보류"
  "후입선출"   | "특정 상황에서 유리하게 보인다"        | "국내 개인 투자자 맥락과 안 맞는다"           | "탈락"
The 채택 row: background rgba(56,189,248,0.07), left border 2px #38bdf8, and its
판단 cell #38bdf8 font-bold.
Rows fade in 0.12s apart on entry.

Then the honest-cost card, margin-top 32px, padding 22px, rounded-md,
border 1px rgba(248,113,113,0.28), background rgba(248,113,113,0.05),
border-left 3px #f87171.
  Label font-mono 11px letter-spacing 0.2em #f87171, VERBATIM: "대신 감수한 것"
  Body 15px leading-8, margin-top 10px, VERBATIM:
  "이동평균법을 쓰면 「어느 매수분을 팔았는지」를 알 수 없다.
   그래서 이 서비스는 세금 계산을 아예 다루지 않는다.
   나중에 세금 기능을 붙이려면 로트 단위 기록부터 다시 설계해야 한다."
  Emphasize "세금 계산을 아예 다루지 않는다" in #fca5a5... use #f87171, font-bold.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Paragraph
1.10s  Trade history table rows fade in 0.08s apart
1.70s  Both method panels fade up TOGETHER (never staggered - the simultaneity is
       the point), y 16px -> 0, 0.5s
2.20s  Step control fades in; the 5-second auto-advance timer starts
2.50s  Divergence strip fades in at its dimmed state
Table and cost card animate on their own entry.

=== PERFORMANCE ===
Auto-advance stops when the block leaves the viewport or the tab is hidden.

=== RESPONSIVE ===
< 900px: the two method panels stack (moving average on top) but stay visually
paired with a shared accent border so the comparison still reads.
< 640px: the trade history table becomes a stacked card list; lot ledgers shrink to
horizontal bars; the decision table becomes a stacked card list.

=== ACCESSIBILITY ===
prefers-reduced-motion: no auto-advance, no ledger animation - stepping applies
changes instantly.
Step controls must be real <button> elements with visible focus rings
(2px #38bdf8, offset 2px) and accessible names.
Announce each step ONCE via aria-live="polite", VERBATIM pattern:
  "3단계 적용. 이동평균 평단 12,000원, 선입선출 평단 10,667원."
매수/매도 must be distinguished by the ▲/▼ prefix, not color alone.
All numbers tabular-nums.

=== DO NOT ===
Do not present either method as universally correct.
Do not give tax advice - the honest-cost card explicitly says tax is out of scope.
Do not use real tickers.
Do not stagger the two panels' entrance.
```

---

## PAGE 04 — 트러블슈팅 01 · 평단이 말이 안 되는 값이 됐다

**개발 실체**: 전량 매도 후 재매수 시 평균단가 오류의 **전체 추적 과정**
**연출 장치**: **관람객이 그 시나리오를 직접 실행** → 눈앞에서 수익률이 붕괴함

```text
Build a TROUBLESHOOTING CASE FILE where the viewer runs a specific trade scenario
themselves and watches the average cost and return produce a nonsensical value,
then follows the full diagnosis and fix.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the average-cost bug:
symptom -> reproduction -> elimination of suspects -> root cause -> the fix
(before/after code) -> verification (with a test table) -> remaining limits.
All seven parts are required.

=== MOOD ===
The moment a number on screen is obviously wrong and you cannot look away from it.
Cold blue turning red at the failure, then methodical.

=== COMPLIANCE ===
FICTIONAL tickers only. No investment advice. All figures are reproduction data.

=== DESIGN TOKENS (use exactly) ===
background #040d18 | panel #0a1727 | primary blue #38bdf8 | accent #7dd3fc
up #f87171 | down #60a5fa | ok #4ade80 | warn #fbbf24 | error #f87171
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #061220, border rgba(56,189,248,0.18)
syntax: comments #4a6b83, strings #a3e635, keywords #38bdf8, numbers #fbbf24
fonts: headings font-black, body sans leading-8, code + numbers font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE REPRODUCTION - full width, height ~380px
  Block C : elimination table
  Block D : root cause
  Block E : the fix (before/after code)
  Block F : verification test table
  Block G : remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "03 · 트러블슈팅 01"

HEADING (30px font-black):
  VERBATIM: "수익률 −99.9%가 화면에 떴다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "종목을 전부 팔았다가 며칠 뒤에 다시 산 기록을 넣으니 수익률이 −99.9%로 나왔다.
   실제로는 이익이 난 상태였다. 다른 종목은 전부 정상이었다."

=== BLOCK B: THE REPRODUCTION (the defining idea) ===
Margin-top 36px. Container, height ~380px, rounded-md,
border 1px rgba(56,189,248,0.18), background #0a1727, padding 22px.

Header strip: font-mono 10px rgba(255,255,255,0.46),
VERBATIM: "재현 · 전량 매도 후 재매수"

A MODE TOGGLE at the top-right, font-mono 11px, two options:
  VERBATIM "수정 전"  |  VERBATIM "수정 후"
Default: 수정 전.

LEFT SIDE (~48%) - THE SCENARIO STEPS
  Four step rows, each font-mono 12px, with a step number, a description, and a
  status mark that fills in as the scenario runs. Rows VERBATIM:
    "1  가나전자 10주 매수 @ 10,000"
    "2  가나전자 10주 전량 매도 @ 13,000"
    "3  가나전자 10주 재매수 @ 12,000"
    "4  현재가 12,500 기준 수익률 조회"
  A run button beneath, font-mono 12px font-black, padding 10px 22px, rounded-md,
  border 1px rgba(56,189,248,0.45), color #38bdf8,
  VERBATIM: "시나리오 실행"

RIGHT SIDE (~52%) - THE READOUT PANEL
  A panel, background #061220, border 1px rgba(56,189,248,0.16), rounded-md,
  padding 18px, showing three values, each with a label above and a large
  tabular-nums value:
    VERBATIM "보유 수량"    format VERBATIM: "10주"
    VERBATIM "평균단가"     format VERBATIM: "12,000원"
    VERBATIM "수익률"       format VERBATIM: "▲ +4.17%"
  All three start at their pre-run neutral state (dashes).

ON RUN, IN "수정 전" MODE:
  t=0.00s  Step 1 marks complete (#4ade80 "✓"); readouts update to
           10주 / 10,000원 / ▲ +25.00%
  t=0.60s  Step 2 marks complete; quantity drops to 0주, average cost stays at
           10,000원 - and a small marker appears beside it, font-mono 10px #fbbf24,
           VERBATIM: "← 0주인데 평단이 남아 있다"
  t=1.30s  Step 3 marks complete; THE AVERAGE COST COLLAPSES: the weighted average
           is computed against the STALE zero-quantity position, producing a tiny
           nonsense value. The average cost readout animates to
           VERBATIM "12원" with a red tint flash (rgba(248,113,113,0.14), 0.5s).
  t=1.90s  Step 4 marks complete; the return readout jumps to
           VERBATIM "▲ +104,066%" in #f87171 with a red border pulse.
           (Use whichever direction your chosen wrong-formula actually produces -
            but it must be visibly absurd and consistent with the shown arithmetic.)
  t=2.30s  A message fades in over the panel, max-width 440px, 17px leading-9:
             Line 1, rgba(255,255,255,0.88), VERBATIM:
               "방금 그 숫자, 실제로 화면에 그렇게 떴습니다."
             Line 2, #f87171, font-bold, margin-top 8px, VERBATIM:
               "수량이 0이 된 순간을 처리하지 않았습니다."
  Below the readout, the wrong arithmetic is spelled out, font-mono 10px #f87171,
  format VERBATIM:
    "(0주 × 10,000 + 10주 × 12,000) ÷ 10,000주  ← 분모가 틀렸다"

ON RUN, IN "수정 후" MODE:
  Same four steps, but at step 2 the position is CLOSED: quantity 0주 and average
  cost resets to VERBATIM "—" with a green marker, font-mono 10px #4ade80,
  VERBATIM: "← 포지션 종료 · 평단 초기화"
  At step 3 the average cost becomes exactly VERBATIM "12,000원" and at step 4 the
  return reads VERBATIM "▲ +4.17%" - a value the viewer can verify by hand.

A reset control at the container's bottom-right, font-mono 11px,
rgba(255,255,255,0.46), VERBATIM: "↻ 되돌리기"
A note at the bottom-left, font-mono 9px rgba(255,255,255,0.32),
VERBATIM: "가상 종목 · 재현용 데이터입니다"

=== BLOCK C: ELIMINATION TABLE ===
Margin-top 44px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "의심한 것들"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "의심" | "확인 방법" | "결과"
Rows (eliminated: 결과 cell rgba(255,255,255,0.46) with "✕ " prefix; confirmed:
#f87171 with "● " prefix):
  "부동소수점 오차"        | "BigDecimal로 바꿔서 재현"       | "✕ 그대로 재현됨"
  "거래 순서가 뒤집힌다"    | "정렬 기준을 체결 시각으로 고정"  | "✕ 순서는 정상"
  "매도 수량이 잘못 빠진다" | "수량 변화만 따로 로그"          | "✕ 수량은 정확"
  "수량 0 상태를 안 지운다" | "매도 직후 보유 레코드 조회"      | "● 평단이 남아 있었다"
Rows reveal 0.16s apart, sliding in from x -10px. The confirmed row lands last and
grows a 2px #f87171 left bar over 0.5s.

=== BLOCK D: ROOT CAUSE ===
Margin-top 40px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인"
  Body 16px leading-8, VERBATIM:
  "매도로 수량이 0이 되면 그 포지션은 끝난 것이다.
   그런데 코드는 수량만 0으로 만들고 평균단가는 그대로 뒀다.
   그 다음 매수가 들어오자, 존재하지 않는 포지션과 가중평균을 냈다.
   「수량이 0이다」와 「보유하지 않는다」를 같은 것으로 다루지 않은 게 원인이었다."
  Emphasize "「수량이 0이다」와 「보유하지 않는다」를 같은 것으로 다루지 않은 게"
  in #fbbf24, font-bold.

=== BLOCK E: THE FIX (before / after code) ===
Margin-top 40px. Two code panels, side by side above 1024px, stacked below, gap 16px.
Each: background #061220, border 1px, rounded-md, header with three window dots and
a filename, body font-mono 12px with a line-number gutter.

  BEFORE panel - border 1px rgba(248,113,113,0.28),
    filename VERBATIM: "PortfolioCalculator.java (before)"
    CONTENT: ~14 lines. Applies a sell by subtracting the quantity, then applies a
    buy by computing a weighted average using the stored quantity and average cost
    without checking whether the position is empty.
    HIGHLIGHT the sell branch (which never resets the average cost) with
    rgba(248,113,113,0.12), and add an inline marker at that row's right edge,
    font-mono 10px #f87171, VERBATIM: "← 평단을 안 건드린다"

  AFTER panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "PortfolioCalculator.java (after)"
    CONTENT: ~20 lines. The sell branch now closes the position when the resulting
    quantity is zero: it clears the average cost, records a realized result, and
    removes the holding row rather than leaving a zero-quantity ghost. The buy
    branch treats an absent or closed position as a fresh position rather than
    averaging into it. A guard rejects a sell larger than the held quantity.
    HIGHLIGHT the position-close branch and the fresh-position branch with
    rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "수량이 0이면 포지션을 지운다. 남겨두면 다음 계산이 그걸 참조한다."

A short note beneath both panels, 15px leading-8, VERBATIM:
  "고치면서 같이 넣은 게 하나 더 있다. 보유 수량보다 많이 매도하는 입력을 막았다.
   원래는 음수 수량이 그대로 저장됐다."
Emphasize "음수 수량이 그대로 저장됐다" in #f87171, font-bold.

=== BLOCK F: VERIFICATION TEST TABLE ===
Margin-top 40px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "검증 케이스"
A 4-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "케이스" | "기대 평단" | "결과" | "상태"
Rows (상태 cells are #4ade80 with a "✓ " prefix):
  "단순 매수 2회"           | "11,000원" | "11,000원" | "✓ 통과"
  "매수 후 일부 매도"        | "11,000원" | "11,000원" | "✓ 통과"
  "전량 매도 후 재매수"      | "12,000원" | "12,000원" | "✓ 통과"
  "전량 매도 후 조회"        | "—"       | "—"       | "✓ 통과"
  "보유량 초과 매도"         | "거부"     | "거부"     | "✓ 통과"
Rows reveal 0.1s apart.
Below the table, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "이 5개 케이스는 테스트 코드로 남겼습니다. 그 외 경로는 수동 확인입니다."

=== BLOCK G: REMAINING LIMITS (required) ===
Margin-top 30px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "실현손익을 별도로 누적하지 않는다. 포지션을 닫으면 그 기록이 화면에서 사라진다."
    "액면분할이나 무상증자 같은 이벤트는 처리하지 못한다."
    "거래 수수료와 세금을 반영하지 않는다. 실제 손익과는 차이가 난다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left (x -12px -> 0)
1.10s  Reproduction container fades up
1.70s  A one-time pulse on the run button (a soft blue ring, 2 pulses, 0.9s each),
       with a hint beside it, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "실행해보세요"
       Both disappear permanently once used.
All later blocks animate on their own viewport entry.

=== RESPONSIVE ===
< 1024px: code panels stack (before on top); the reproduction's two sides stack
(steps first).
< 640px: tables become stacked card lists; code font 11px with internal horizontal
scroll (the block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no red tint flash (use a static border change), no button
pulse; the scenario applies each step instantly with 0.3s gaps.
The run button and mode toggle must be real controls with visible focus rings
(2px #38bdf8, offset 2px); the toggle is a radiogroup.
Announce the outcome ONCE per run via aria-live="polite":
  수정 전 VERBATIM: "평균단가가 12원, 수익률이 비정상 값으로 계산되었습니다."
  수정 후 VERBATIM: "평균단가 12,000원, 수익률 플러스 4.17 퍼센트로 정상 계산되었습니다."
Return values render ARROW + SIGN + NUMBER, never color alone.
All numbers tabular-nums.

=== DO NOT ===
Do not use real tickers.
Do not show arithmetic that does not match the displayed values - even the WRONG
arithmetic must be internally consistent with the wrong result.
Do not remove the elimination table, the verification table, or the limits card.
```

---

## PAGE 05 — AI는 추천하지 않는다 · 직접 시켜보세요

**개발 실체**: AI 체크리스트 응답 구조 설계 + **시스템 프롬프트와 서버 측 검증 코드**
**연출 장치**: **관람객이 "종목 추천해줘"를 직접 입력** → AI가 거절하고 체크리스트로 응답

```text
Build an AI DESIGN section where the viewer can type or select a prompt asking for
a stock recommendation, and watch the assistant REFUSE and return a portfolio
checklist instead - with the system prompt and the server-side guard code shown
alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
All responses are pre-authored locally - do NOT call any model API.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The explicit product decision: this AI does not give buy/sell advice
2. What it DOES do: risk, concentration, and missing-record checks
3. How the refusal is enforced - system prompt AND a server-side output guard, not
   just polite wording
4. The honest limitation of that guard

=== MOOD ===
Trading desk, afternoon. Cold blue, calm, deliberate. This is the page where the
project states its ethics. It should feel considered, not preachy.

=== COMPLIANCE (strictest page in the project) ===
NOTHING on this page may read as investment advice. The refusal copy and the
disclaimer are load-bearing and must be rendered exactly.
FICTIONAL tickers only.

=== DESIGN TOKENS (use exactly) ===
background #040d18 | panel #0a1727 | primary blue #38bdf8 | accent #7dd3fc
up #f87171 | down #60a5fa | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #061220, border rgba(56,189,248,0.18)
syntax: comments #4a6b83, strings #a3e635, keywords #38bdf8, numbers #fbbf24
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1080px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : THE CHAT DEMO - full width, height ~480px
  Block C : the boundary table (does / does not)
  Block D : two code panels (system prompt + server guard)
  Block E : the honest limitation card + the standing disclaimer

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "04 · AI 체크리스트"

HEADING (28px font-black):
  VERBATIM: "「뭐 사야 돼?」에는 대답하지 않기로 했다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "투자 앱에 AI를 붙이면 제일 먼저 요구받는 게 종목 추천이다.
             그런데 그건 맞히면 운이고 틀리면 책임인 영역이다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "그래서 이 AI는 판단을 대신하지 않고, 사용자가 놓쳤을 만한 것만 짚는다.
             비중이 한쪽으로 쏠렸는지, 기록이 빠졌는지, 최근에 안 본 종목이 있는지."
  Emphasize "판단을 대신하지 않고" in #7dd3fc, font-bold.

=== BLOCK B: THE CHAT DEMO (the defining idea) ===
Container: height ~480px, rounded-md, border 1px rgba(56,189,248,0.18),
background #0a1727, display flex column.

Header strip (34px, border-bottom 1px rgba(56,189,248,0.12)):
  left  font-mono 11px rgba(255,255,255,0.72), VERBATIM: "AI 체크리스트"
  right font-mono 10px rgba(255,255,255,0.46), VERBATIM: "포트폴리오 점검 전용"

MESSAGE AREA (flex-1, scrolls internally, padding 18px):
  Messages alternate. User messages: right-aligned, background
  rgba(56,189,248,0.10), border 1px rgba(56,189,248,0.20), rounded-md,
  padding 10px 14px, max-width 78%, 14px leading-7.
  Assistant messages: left-aligned, background rgba(255,255,255,0.03),
  border 1px rgba(255,255,255,0.10), same padding, max-width 86%.

  ON LOAD, one assistant message is already present, VERBATIM:
    "안녕하세요. 기록된 거래를 바탕으로 확인이 필요한 부분을 짚어드립니다.
     매수·매도 판단은 드리지 않습니다."

PROMPT CHIPS (a row above the input, horizontally scrollable on narrow screens):
  Four chips, font-mono 11px, padding 7px 13px, rounded-full,
  border 1px rgba(56,189,248,0.24), color rgba(255,255,255,0.75).
  Labels VERBATIM:
    "지금 뭐 사야 돼?"
    "가나전자 더 살까?"
    "내 포트폴리오 점검해줘"
    "기록에서 빠진 거 있어?"
  Clicking a chip inserts it as the user message and runs the response.
  The FIRST TWO are the refusal cases and must be listed first - the viewer should
  find it easy to try them.

INPUT ROW (bottom, 56px, border-top 1px rgba(56,189,248,0.12), padding 12px):
  A text input, background rgba(255,255,255,0.04),
  border 1px rgba(56,189,248,0.20), rounded, font-mono 12px, placeholder VERBATIM:
  "무엇이든 물어보세요"
  and a send button, background #38bdf8, color #040d18, font-mono 12px font-black,
  padding 8px 16px, rounded, VERBATIM: "보내기"
  Free text is accepted. Route it locally: if it contains any of a small set of
  recommendation-intent keywords (VERBATIM examples: "추천" "사야" "살까" "팔까"
  "오를까" "목표가"), respond with the REFUSAL. Otherwise respond with the CHECKLIST.

THE REFUSAL RESPONSE (this is the page's centerpiece - render it exactly):
  It streams in word by word, stagger 0.03s, over about 1.6s, with a small
  three-dot typing indicator shown for 0.5s first.
  Assistant message body, in three parts:
    Part 1, 14px leading-7, VERBATIM:
      "매수·매도 판단은 드리지 않습니다. 이 서비스는 투자 자문이 아닙니다."
      Rendered with a 2px left border in #fbbf24 and a #fbbf24 label above it,
      font-mono 10px letter-spacing 0.18em, VERBATIM: "답변 범위 밖"
    Part 2, margin-top 12px, 14px leading-7, VERBATIM:
      "대신 지금 기록 기준으로 확인이 필요한 3가지를 알려드릴게요."
    Part 3, margin-top 12px: THREE CHECKLIST CARDS, each a small bordered row,
    padding 10px 12px, rounded, border 1px rgba(255,255,255,0.10), with a
    font-mono 10px category label and a 13px body line. Cards VERBATIM:
      label "비중"     body "가나전자 한 종목이 평가금액의 절반을 넘습니다."
      label "기록"     body "3월 12일 매도 기록에 단가가 비어 있습니다."
      label "미확인"   body "한빛바이오는 42일째 조회하지 않으셨습니다."
    Each card enters 0.12s apart, sliding up 8px.
  A footer line under the message, font-mono 10px rgba(255,255,255,0.40), VERBATIM:
    "위 내용은 기록된 데이터에 대한 점검이며, 투자 권유가 아닙니다."

THE CHECKLIST RESPONSE (for non-refusal prompts): the same Part 2 + Part 3 +
footer, without Part 1.

A note at the container's bottom, font-mono 9px rgba(255,255,255,0.32), VERBATIM:
  "예시 응답입니다 · 가상 종목 · 실제 모델 호출 없음"

=== BLOCK C: THE BOUNDARY TABLE ===
Margin-top 44px. Two columns, gap 16px (stack below 720px).
  LEFT card:  padding 20px, rounded-md, border 1px rgba(74,222,128,0.26),
              background rgba(74,222,128,0.04)
              label font-mono 10px letter-spacing 0.18em #4ade80,
              VERBATIM: "하는 것"
              A 4-item list, 15px leading-8, each prefixed "· ", VERBATIM:
                "특정 종목 비중이 과도한지 확인"
                "거래 기록에 빠진 항목 찾기"
                "오래 확인하지 않은 보유 종목 알림"
                "매매 빈도가 평소보다 높아졌는지 짚기"
  RIGHT card: padding 20px, rounded-md, border 1px rgba(248,113,113,0.26),
              background rgba(248,113,113,0.04)
              label font-mono 10px letter-spacing 0.18em #f87171,
              VERBATIM: "하지 않는 것"
              A 4-item list, VERBATIM:
                "종목 추천"
                "매수·매도 시점 판단"
                "목표가나 수익률 예측"
                "시장 전망"

=== BLOCK D: TWO CODE PANELS ===
Margin-top 44px. Side by side, gap 16px (stack below 1024px).
Each: background #061220, border 1px rgba(56,189,248,0.18), rounded-md, header bar
with three window dots and a filename in font-mono 11px rgba(255,255,255,0.45),
body font-mono 12px with a line-number gutter.

LEFT PANEL - filename VERBATIM: "checklist.prompt.txt"
  CONTENT: ~16 lines. The system prompt, in Korean, stating: the assistant's role
  is to inspect the user's own recorded portfolio data; it must never recommend
  buying or selling, never predict prices, and never state a market outlook; when
  asked for such a thing it must decline in one sentence and then provide up to
  three checklist items derived only from the supplied data; every response must
  end with the non-advice notice.
  HIGHLIGHT the two prohibition lines with rgba(251,191,36,0.10).
  Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
    "프롬프트만으로는 부족하다. 아래가 진짜 방어선이다."

RIGHT PANEL - filename VERBATIM: "AiChecklistService.java"
  CONTENT: ~20 lines. A service that builds the request from ONLY the user's
  aggregated portfolio facts (never raw account identifiers), requests a structured
  JSON response with a fixed schema (a refusal flag plus up to three checklist
  items with a category and a message), VALIDATES the parsed response against that
  schema, DROPS any item whose category is not in the allowed set, and returns a
  rule-based checklist built from the same aggregates if validation fails.
  HIGHLIGHT the schema-validation line and the category-allowlist filter with
  rgba(56,189,248,0.12).
  Caption bar, VERBATIM:
    "모델이 추천을 뱉어도 스키마 밖 항목은 화면까지 못 온다"

=== BLOCK E: HONEST LIMITATION + STANDING DISCLAIMER ===
Margin-top 36px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "이 방어의 한계"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "카테고리는 통과하는데 문장 안에 판단이 섞여 나오는 경우까지는 막지 못한다."
    "거절 판정을 키워드 기반으로도 한 번 거르는데, 우회 표현은 놓친다."
    "응답 품질을 정량적으로 평가한 적은 없다. 눈으로 확인한 수준이다."

Then a STANDING DISCLAIMER STRIP, margin-top 24px, sticky-feeling but not
position:sticky - just a prominent full-width strip: padding 16px 20px, rounded-md,
border 1px rgba(251,191,36,0.30), background rgba(251,191,36,0.05).
  font-mono 12px #fbbf24, centered, VERBATIM:
  "이 서비스는 투자 자문이 아니며, 어떤 종목에 대한 매수·매도 권유도 제공하지 않습니다."
  This strip must NOT be removable, collapsible, or smaller than 12px.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Paragraphs 1 and 2, 0.5s apart
1.40s  Chat container fades up; the pre-loaded assistant message appears
1.90s  Prompt chips fade in 0.06s apart
2.30s  A one-time subtle pulse on the FIRST chip ("지금 뭐 사야 돼?"), a soft blue
       ring, 2 pulses 0.9s each, with a hint beneath, font-mono 10px
       rgba(255,255,255,0.35), VERBATIM: "추천을 요구해보세요"
       Both disappear permanently once any chip or the send button is used.
Blocks C, D, E animate on their own viewport entry.

=== RESPONSIVE ===
< 1024px: code panels stack (prompt first).
< 720px: the boundary cards stack; prompt chips scroll horizontally in their own
container (never the page); chat height 520px.
< 640px: code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no typing indicator, no word-by-word streaming (responses
appear whole), no chip pulse.
The input, send button and chips must be real form controls with visible focus
rings (2px #38bdf8, offset 2px).
The message area should be an aria-live="polite" region announcing only the FINAL
assistant message text, never intermediate streaming states.
The standing disclaimer must be in normal document order and reachable by screen
readers - never visually hidden or placed after the section's landmark.

=== DO NOT ===
Do not call any model API - all responses are pre-authored.
Do not let ANY response contain a recommendation, a price target, a prediction, or
a market outlook, even as an example of a bad response.
Do not remove, shrink, or collapse the standing disclaimer.
Do not use real tickers or real news items.
```

---

## PAGE 06 — 뉴스와 보유 종목을 잇는다 (조심스럽게)

**개발 실체**: 뉴스 영향 분석 기능 + **연관 매칭 로직과 인과 주장 회피 설계**
**연출 장치**: 뉴스 카드와 보유 종목 사이에 연결선이 그어지되, **"인과가 아니다"가 선 위에 붙는다**

```text
Build a NEWS RELEVANCE section that draws connections between news items and the
user's holdings, while explicitly refusing to claim causation, with the matching
logic shown alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
All news items are FICTIONAL and locally authored.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What this feature actually does: surface news mentioning tickers the user holds
2. The deliberate decision NOT to claim that news caused a price move
3. The matching logic and its false-positive problem

=== MOOD ===
Trading desk, mid-afternoon. Cold blue, careful, understated. This page is about
restraint - the design must not imply more than the data supports.

=== COMPLIANCE ===
No investment advice. No causal claims about price movements. All news headlines,
outlets and tickers are FICTIONAL and must be visibly labeled as examples.

=== DESIGN TOKENS (use exactly) ===
background #040d18 | panel #0a1727 | primary blue #38bdf8 | accent #7dd3fc
up #f87171 | down #60a5fa | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #061220, border rgba(56,189,248,0.18)
syntax: comments #4a6b83, strings #a3e635, keywords #38bdf8, numbers #fbbf24
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1060px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : THE CONNECTION BOARD - full width, height ~440px
  Block C : the false-positive card
  Block D : the matching code panel
  Block E : the causation boundary card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "05 · 뉴스 영향 분석"

HEADING (28px font-black):
  VERBATIM: "「이 뉴스 때문에 떨어졌다」고는 말하지 않는다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "보유 종목이 언급된 뉴스를 모아서 보여주는 기능이다.
             같은 날 주가가 어떻게 움직였는지도 함께 표시한다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "그런데 그 둘을 화살표로 이으면 인과처럼 읽힌다.
             데이터가 그걸 증명하지 않는데도 사용자는 그렇게 받아들인다.
             그래서 이 화면은 「같은 날 있었던 일」까지만 말한다."
  Emphasize "「같은 날 있었던 일」까지만 말한다" in #7dd3fc, font-bold.

=== BLOCK B: THE CONNECTION BOARD (the defining idea) ===
Container: height ~440px, background #0a1727,
border 1px rgba(56,189,248,0.18), rounded-md, padding 24px, position relative.
A chip at the top-right, font-mono 9px rgba(255,255,255,0.40),
VERBATIM: "예시 데이터 · 가상 종목 · 가상 매체"

TWO COLUMNS inside, with an SVG connection layer between them:

  LEFT COLUMN (~40%) - NEWS CARDS, label above, font-mono 10px
  rgba(255,255,255,0.46), VERBATIM: "최근 뉴스"
    Four cards, each padding 12px 14px, rounded-md,
    border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02),
    stacked 10px apart. Each contains a headline (13px leading-6,
    rgba(255,255,255,0.86)) and a meta line (font-mono 10px
    rgba(255,255,255,0.42)) with a fictional outlet and a date.
    Cards VERBATIM:
      headline "가나전자, 신규 생산라인 가동 발표"      meta "가상경제 · 3월 12일"
      headline "반도체 업황 회복 전망 엇갈려"           meta "가상데일리 · 3월 12일"
      headline "한빛바이오 임상 결과 발표 일정 공개"     meta "가상경제 · 3월 11일"
      headline "가나전자, 협력사와 공급 계약 연장"       meta "가상투데이 · 3월 9일"

  RIGHT COLUMN (~34%) - HOLDINGS, label VERBATIM: "보유 종목"
    Three rows, each padding 12px 14px, rounded-md,
    border 1px rgba(56,189,248,0.20), background rgba(56,189,248,0.04),
    containing a fictional ticker name (font-mono 13px) and that day's move,
    ALWAYS as ARROW + SIGN + NUMBER, font-mono 12px tabular-nums.
    Rows VERBATIM:
      "가나전자"    "▲ +2.40%"   (#f87171)
      "한빛바이오"  "▼ −1.10%"   (#60a5fa)
      "동해물산"    "▲ +0.30%"   (#f87171)

  THE CONNECTION LINES (SVG layer between the columns):
    Curved 1.5px paths from each news card to the holding it mentions.
    - 가나전자 news items 1 and 4 connect to 가나전자
    - 한빛바이오 news item 3 connects to 한빛바이오
    - News item 2 ("반도체 업황") connects to NOTHING at first, then draws a
      DASHED, dimmer line to 가나전자 with a small label, font-mono 9px #fbbf24,
      VERBATIM: "약한 매칭"
    Line color rgba(56,189,248,0.45) for direct name matches, dashed
    rgba(251,191,36,0.40) for the weak match.
    Lines draw in with a stroke-dashoffset animation, 0.5s each, 0.15s apart.

  THE CRITICAL LABEL ON THE LINES: at the midpoint of the connection bundle, a
  persistent small tag, background #061220, border 1px rgba(251,191,36,0.35),
  rounded, padding 5px 10px, font-mono 10px #fbbf24, VERBATIM:
    "언급 관계일 뿐 · 인과 아님"
  This tag must be present whenever any line is visible. It is not decorative.

  INTERACTION: hovering (or focusing) a news card highlights ONLY its lines and its
  target holding, and dims the rest to 35%. Hovering a holding does the reverse.
  0.3s transitions.

=== BLOCK C: THE FALSE POSITIVE CARD ===
Margin-top 36px, padding 20px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "잘못 걸리는 경우"
  Body 15px leading-8, VERBATIM:
  "종목명이 짧거나 일반 단어와 겹치면 관계없는 기사가 딸려온다.
   「동해물산」을 「동해」로 줄여 쓴 기사, 사람 이름과 겹치는 종목명 같은 것들이다.
   지금은 전체 이름 일치와 종목 코드 일치만 강한 매칭으로 보고,
   부분 일치는 「약한 매칭」으로 따로 표시한다."
  Emphasize "부분 일치는 「약한 매칭」으로 따로 표시한다" in #fbbf24, font-bold.

=== BLOCK D: THE MATCHING CODE PANEL ===
Margin-top 36px, full width. background #061220,
border 1px rgba(56,189,248,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "NewsRelevanceService.java"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~20 lines. A service that, for the user's holdings, scores each news item
by match strength: an exact ticker-code match or a full company-name match scores
as STRONG; a partial-name match scores as WEAK and is flagged rather than dropped;
items scoring below a threshold are excluded entirely. The returned DTO carries the
match strength per item and carries NO field expressing impact, sentiment, or
direction - and a comment says so explicitly.
HIGHLIGHT ROWS (background rgba(56,189,248,0.12)): the weak-match flagging line and
the comment noting the absence of any impact field.
Caption bar, border-top 1px, font-mono 11px, prefixed "// ", VERBATIM:
  "응답에 「영향도」 필드를 아예 만들지 않았다. 있으면 언젠가 쓰게 된다."

=== BLOCK E: THE CAUSATION BOUNDARY CARD ===
Margin-top 36px, padding 22px, rounded-md, border 1px rgba(56,189,248,0.22),
background rgba(56,189,248,0.04), border-left 3px #38bdf8.
  Label font-mono 11px letter-spacing 0.2em #38bdf8, VERBATIM: "설계에서 뺀 것"
  Body 15px leading-8, VERBATIM:
  "처음 기획에는 「이 뉴스가 주가에 미친 영향: 높음/보통/낮음」 배지가 있었다.
   근거가 될 데이터가 없었다. 같은 날 같이 일어났다는 사실뿐이었다.
   근거 없이 확신을 주는 UI가 제일 위험하다고 생각해서 그 배지를 통째로 뺐다."
  Emphasize "근거 없이 확신을 주는 UI가 제일 위험하다" in #7dd3fc, font-bold.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Paragraphs 1 and 2, 0.5s apart
1.40s  Board container fades up
1.70s  News cards fade in top to bottom, 0.09s apart
2.10s  Holding rows fade in, 0.09s apart
2.50s  Connection lines draw, 0.15s apart, strong matches first, the weak dashed
       one last
3.30s  The "인과 아님" tag fades in and stays

=== RESPONSIVE ===
< 900px: the board becomes a single column - news cards on top, holdings below, and
the connection lines redraw as short vertical curves between the two groups. Keep
the "인과 아님" tag anchored between them.
< 640px: news cards show headline only (meta on a second line at 9px); code font
11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: lines render fully drawn with no animation; no hover dimming
transition (it applies instantly).
News cards and holding rows must be focusable with visible focus rings
(2px #38bdf8, offset 2px), and keyboard focus must produce the same highlight as
hover.
Provide a visually-hidden text list stating, for each news item, which holding it
mentions and whether the match is strong or weak.
Price moves render ARROW + SIGN + NUMBER, never color alone.

=== DO NOT ===
Do not use real news headlines, real outlets, or real companies.
Do not draw a directional arrow from news to price - the lines are undirected
connections, and the "인과 아님" tag must always be visible alongside them.
Do not add sentiment badges, impact scores, or outlook indicators anywhere.
```

---

## PAGE 07 — 트러블슈팅 02 · API가 죽으면 화면도 죽었다

**개발 실체**: 외부 시세 API 실패 시 fallback 구조 + **mock 전환 코드**
**연출 장치**: **"API 중단" 토글** — 관람객이 직접 죽여보면 페이지가 실제로 대체 데이터로 전환

```text
Build a RESILIENCE TROUBLESHOOTING section where the viewer can kill the external
price API themselves and watch the screen degrade gracefully to cached/mock data
instead of breaking, with the fallback code shown alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
All data is local - no real network calls.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the external-dependency failure:
symptom -> what specifically broke -> the fix (fallback layers) -> how staleness is
communicated to the user -> verification -> remaining limits. All six parts required.

=== MOOD ===
Trading desk when the data feed drops. Cold blue draining to grey. Tense, then
resolved and orderly.

=== COMPLIANCE ===
FICTIONAL tickers only. No investment advice. Stale data must be visibly labeled -
that labeling is itself part of the substance.

=== DESIGN TOKENS (use exactly) ===
background #040d18 | panel #0a1727 | primary blue #38bdf8 | accent #7dd3fc
up #f87171 | down #60a5fa | ok #4ade80 | warn #fbbf24 | stale grey #64748b
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #061220, border rgba(56,189,248,0.18)
syntax: comments #4a6b83, strings #a3e635, keywords #38bdf8, numbers #fbbf24
fonts: headings font-black, body sans leading-8, code + numbers font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1040px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE KILL SWITCH + the degrading dashboard
  Block C : the fallback layer diagram
  Block D : the code panel
  Block E : verification + remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "06 · 트러블슈팅 02"

HEADING (30px font-black):
  VERBATIM: "내가 안 만든 것 때문에 내 화면이 죽는다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "외부 시세 API가 잠깐 응답을 안 하자 대시보드 전체가 빈 화면이 됐다.
   보유 종목도, 거래 기록도 우리 DB에 다 있는데 아무것도 안 보였다.
   시세 하나 못 받았다고 나머지까지 못 보여줄 이유가 없었다."

=== BLOCK B: THE KILL SWITCH + DEGRADING DASHBOARD (the defining idea) ===
Margin-top 36px.

THE KILL SWITCH (above the dashboard, centered):
  A three-state segmented control, background #061220,
  border 1px rgba(56,189,248,0.22), rounded-md, padding 4px, font-mono 12px.
  Options VERBATIM: "정상"  |  "느림"  |  "중단"
  Active colors: 정상 -> #4ade80, 느림 -> #fbbf24, 중단 -> #f87171,
  each with a matching 14%-alpha background and a sliding indicator (0.3s).
  Default: 정상.
  Below it, a sub-line that swaps, font-mono 11px rgba(255,255,255,0.46):
    정상 VERBATIM: "시세 API가 정상 응답합니다"
    느림 VERBATIM: "응답이 3초 이상 지연됩니다"
    중단 VERBATIM: "시세 API가 응답하지 않습니다"

THE DASHBOARD (below, height ~420px, rounded-md,
border 1px rgba(56,189,248,0.18), background #0a1727, padding 20px):
  A 2x2 grid of four modules, gap 12px. Each: padding 14px, rounded-md,
  border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02), with a
  font-mono 10px label and a status chip at its top-right.

  MODULE 1  label VERBATIM "보유 종목"
    A 3-row list (fictional tickers, quantities, average costs) - all from OUR
    database, so it NEVER degrades.
    status chip in every mode: VERBATIM "정상" (#4ade80)
  MODULE 2  label VERBATIM "현재가"
    Three price values, tabular-nums.
    정상: live-looking values, chip VERBATIM "실시간" (#4ade80)
    느림: values unchanged but a small spinner-free "지연" indicator appears,
          chip VERBATIM "지연 3.2초" (#fbbf24)
    중단: values switch to the last cached ones, rendered in #64748b, chip
          VERBATIM "12분 전 값" (#64748b), and a tiny clock glyph appears
  MODULE 3  label VERBATIM "수익률"
    A big value, ARROW + SIGN + NUMBER, tabular-nums.
    정상: chip VERBATIM "실시간" (#4ade80)
    중단: the value is still shown but greyed to #64748b, and the chip reads
          VERBATIM "12분 전 기준" (#64748b). A small note beneath, font-mono 9px
          #64748b, VERBATIM: "마지막으로 받은 시세로 계산한 값입니다"
  MODULE 4  label VERBATIM "AI 체크리스트"
    In 정상 and 느림: three short checklist rows.
    In 중단: the module dims to 55% with a chip VERBATIM "이용 불가" (#f87171) and
    a line, font-mono 11px, VERBATIM: "시세 없이는 비중 점검을 할 수 없습니다"

  THE PAGE BANNER: when the switch moves to 중단, a strip slides down from the top
  of the dashboard, height 34px, background rgba(100,116,139,0.16),
  border-bottom 1px rgba(100,116,139,0.35), font-mono 11px #64748b, centered,
  VERBATIM: "시세 연결 끊김 · 마지막으로 받은 값을 표시하고 있습니다 (12분 전)"

  TRANSITION: when the mode changes, modules update their chips 0.07s apart in
  reading order; only the affected values recolor. Use one CSS filter/color
  transition per module, not per number.

  A note at the dashboard's bottom, font-mono 9px rgba(255,255,255,0.32), VERBATIM:
    "가상 종목 · 예시 데이터 · 실제 API를 호출하지 않습니다"

=== BLOCK C: THE FALLBACK LAYER DIAGRAM ===
Margin-top 44px. A horizontal 4-stage diagram, height ~130px, drawn in SVG,
inside a bordered container (padding 20px, rounded-md,
border 1px rgba(56,189,248,0.16)).
Four boxes left to right, connected by arrows, each 150x54px, font-mono 11px:
  VERBATIM "외부 시세 API"  ->  "짧은 캐시"  ->  "마지막 성공 값"  ->  "표시 불가 안내"
Beneath each box, a caption, font-mono 9px rgba(255,255,255,0.42), VERBATIM:
  "1순위 · 실시간" / "2순위 · 30초 이내" / "3순위 · 시각 표시 필수" / "4순위 · 숨기지 않고 알림"
As the kill switch changes mode, the box representing the CURRENTLY ACTIVE source
lights up (border #38bdf8, background rgba(56,189,248,0.10)) and the ones before it
dim with a small "✕" marker. This binding to the switch above is required.

=== BLOCK D: THE CODE PANEL ===
Margin-top 36px, full width. background #061220,
border 1px rgba(56,189,248,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "QuoteService.java"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~22 lines. A service that requests quotes from the external provider with
a short timeout, catches both timeout and error responses, falls back to a
short-lived cache, then to the last successfully stored quote (carrying its
timestamp), and finally returns an explicit "unavailable" result rather than null.
Every returned quote object carries a source enum and an asOf timestamp so the UI
can label staleness.
HIGHLIGHT ROWS (background rgba(56,189,248,0.12)): the timeout configuration line
and the line attaching the source/asOf metadata to the result.
Caption bar, border-top 1px, font-mono 11px, prefixed "// ", VERBATIM:
  "옛날 값을 보여주는 건 괜찮다. 옛날 값인 걸 안 알려주는 게 문제다."

A short note beneath, 15px leading-8, VERBATIM:
  "처음엔 API가 실패하면 예외를 그대로 위로 던졌다.
   컨트롤러에서 500이 나가고 화면 전체가 비었다.
   지금은 어떤 경우에도 응답 객체가 나가고, 그 안에 「언제 값인지」가 들어 있다."
Emphasize "그 안에 「언제 값인지」가 들어 있다" in #7dd3fc, font-bold.

=== BLOCK E: VERIFICATION + REMAINING LIMITS ===
Margin-top 36px.
Three stat cells in a row, gap 12px (stacks below 640px). Each: padding 16px,
rounded-md, border 1px rgba(74,222,128,0.22), background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "3단계"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "폴백 계층"
  Cell 2  value VERBATIM "0회"   label VERBATIM "시세 실패 시 빈 화면"
  Cell 3  value VERBATIM "전부"  label VERBATIM "시각이 표시되는 값"
Values fade in on entry.
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "API를 임의로 막아서 확인했습니다. 실제 장애 상황에서 검증한 것은 아닙니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "재시도 정책이 단순하다. 지수 백오프나 서킷 브레이커를 넣지 않았다."
    "캐시 유효 시간을 종목 종류와 무관하게 하나로 뒀다."
    "API 제공자를 이중화하지 않았다. 한 곳이 오래 죽으면 계속 옛날 값이다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left
1.10s  Kill switch fades up; its indicator draws
1.40s  Dashboard fades up; the four modules populate 0.07s apart
2.00s  Fallback diagram boxes draw left to right, 0.1s apart; the "정상" source
       lights
2.60s  A one-time pulse on the "중단" option (a soft red ring, 2 pulses, 0.9s each)
       with a hint beneath, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "API를 죽여보세요"
       Both disappear permanently once the switch is used.
Code and verification blocks animate on their own entry.

=== RESPONSIVE ===
< 900px: dashboard becomes a single column of four modules; the fallback diagram
becomes vertical.
< 640px: kill switch full width with three equal options at 11px; code font 11px
with internal horizontal scroll (the block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no sliding indicator, no banner slide-down (it appears
instantly), no switch pulse.
The kill switch must be a real radiogroup, arrow-key navigable, with visible focus
rings (2px #38bdf8, offset 2px).
Announce mode changes ONCE via aria-live="polite" using the sub-line copy.
Staleness must be conveyed by TEXT ("12분 전 값"), not by grey color alone.
Return values render ARROW + SIGN + NUMBER.

=== DO NOT ===
Do not make any real network call.
Do not hide stale values - showing them WITH a timestamp is the designed behavior.
Do not remove the limits card or the "실제 장애 상황에서 검증한 것은 아닙니다" note.
Do not use real tickers.
```

---

## PAGE 08 — 백엔드 구조 · 거래에서 평가까지

**개발 실체**: Spring Boot 도메인 구조 + **계산 책임의 계층 분리**
**연출 장치**: 거래 한 건이 계층을 통과하는 경로가 순서대로 그려짐

```text
Build a BACKEND ARCHITECTURE section that traces a single trade request through the
layers of a Spring Boot domain model, drawing the path as it goes.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The layer structure and where each responsibility lives
2. The specific decision that calculation belongs in the domain layer, not the
   controller or the frontend
3. What the ownership boundary was (solo project - but be precise about scope)

=== MOOD ===
Trading desk after hours. Blueprint on the table. Cold blue, structural, calm.

=== DESIGN TOKENS (use exactly) ===
background #040d18 | panel #0a1727 | primary blue #38bdf8 | accent #7dd3fc
ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
fonts: headings font-black, body sans leading-8, ALL diagram labels font-mono
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1020px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE LAYER DIAGRAM - full width, height 480px
  Block C : the responsibility table
  Block D : the scope cards + honesty note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "07 · 백엔드 구조"

HEADING (28px font-black):
  VERBATIM: "계산을 어디에 둘지가 이 프로젝트의 전부였다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "처음엔 컨트롤러에서 다 계산했다. 화면이 하나 늘어날 때마다
             같은 계산을 복사했고, 어느 순간 두 화면의 수익률이 서로 달랐다."
  Emphasize "두 화면의 수익률이 서로 달랐다" in #f87171, font-bold.

=== BLOCK B: THE LAYER DIAGRAM ===
Container: height 480px, background #0a1727,
border 1px rgba(56,189,248,0.18), rounded-md, padding 28px.
Draw in SVG so strokes can animate.

FIVE HORIZONTAL LAYERS, top to bottom, each a labeled band with node boxes inside.
Band label at the far left of each, font-mono 10px rgba(255,255,255,0.35).

  LAYER 1  label VERBATIM "CLIENT"
    One box, 180x50px: VERBATIM "React 대시보드"
  LAYER 2  label VERBATIM "CONTROLLER"
    Two boxes, 150x48px: VERBATIM "TradeController" · "PortfolioController"
    A tiny annotation beside them, font-mono 9px rgba(255,255,255,0.42),
    VERBATIM: "요청 검증과 변환만"
  LAYER 3  label VERBATIM "SERVICE"
    Three boxes, 132x48px: VERBATIM "TradeService" · "PortfolioService" ·
    "AiChecklistService"
    Annotation VERBATIM: "트랜잭션 경계"
  LAYER 4  label VERBATIM "DOMAIN"
    Three boxes, 132x48px: VERBATIM "Holding" · "PortfolioCalculator" · "Quote"
    Annotation VERBATIM: "계산은 전부 여기"
    THESE THREE BOXES ARE VISUALLY EMPHASIZED: border 1.5px #38bdf8,
    background rgba(56,189,248,0.10), and a soft glow
    box-shadow 0 0 22px rgba(56,189,248,0.14).
  LAYER 5  label VERBATIM "INFRA"
    Three boxes, 132x48px: VERBATIM "MySQL" · "시세 API" · "AI API"
    The two API boxes use a dashed border rgba(255,255,255,0.28) and a corner
    label, font-mono 8px rgba(255,255,255,0.35), VERBATIM: "외부"

EDGES: 1.5px lines connecting each layer downward, rgba(56,189,248,0.30).
Return edges (dashed, rgba(56,189,248,0.16)) go back up from DOMAIN to CONTROLLER
along the right side.

THE TRACE ANIMATION (the defining idea):
  A "거래 등록" request travels the full path. Trigger it with a button below the
  diagram, font-mono 12px, padding 9px 20px, rounded-md,
  border 1px rgba(56,189,248,0.45), color #38bdf8, VERBATIM: "거래 한 건 따라가기"
  The trace:
    A blue dot enters at LAYER 1, moves down to TradeController (0.4s), pausing
    0.25s at each node while a small annotation chip appears beside it,
    font-mono 9px #7dd3fc, then continues:
      at TradeController  chip VERBATIM "요청 형식 검증"
      at TradeService     chip VERBATIM "트랜잭션 시작"
      at Holding          chip VERBATIM "수량 반영"
      at PortfolioCalculator chip VERBATIM "평단·수익률 계산"
      at MySQL            chip VERBATIM "저장"
    Then it travels the dashed RETURN path back up to PortfolioController with a
    final chip VERBATIM "계산된 상태 응답"
  Total about 3.4s. Each visited node stays lit after the dot passes.
  AUTONOMOUS: if the viewer does not press the button within 5 seconds of the
  diagram entering the viewport, run the trace once automatically. It runs at most
  twice without interaction.
  A reset at the container's bottom-right, font-mono 11px, VERBATIM: "↻ 다시"

=== BLOCK C: THE RESPONSIBILITY TABLE ===
Margin-top 44px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "계층별 책임"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "계층" | "하는 일" | "하지 않는 일"
Rows:
  "Controller" | "요청 형식 검증 · DTO 변환"       | "계산 · 트랜잭션 관리"
  "Service"    | "트랜잭션 경계 · 도메인 조합"      | "산술 계산 직접 수행"
  "Domain"     | "평단 · 수익률 · 비중 계산"        | "DB나 외부 API 직접 호출"
  "Infra"      | "저장 · 외부 호출 · 폴백"          | "비즈니스 규칙 판단"
The Domain row: background rgba(56,189,248,0.07), left border 2px #38bdf8.
Rows reveal 0.1s apart on entry.

Below the table, one paragraph, 15px leading-8, VERBATIM:
  "이렇게 나누고 나서 좋았던 건, 평단 계산 버그를 고칠 때 고칠 파일이 하나였다는 점이다.
   전에는 컨트롤러 세 군데를 다 찾아다녀야 했다."

=== BLOCK D: SCOPE CARDS + HONESTY NOTE ===
Margin-top 44px. Four cards in a 2x2 grid, gap 14px (1 column below 720px).
Each: padding 20px, rounded-md, border 1px rgba(56,189,248,0.20),
background rgba(56,189,248,0.04), with a font-mono 10px letter-spacing 0.18em
#38bdf8 label and a 3-item list at 14px leading-7 with "· " prefixes.

CARD 1  label VERBATIM: "계산 로직"
  "거래 기록 기반 포트폴리오 계산 로직 설계"
  "평단·수익률·비중 계산의 도메인 이전"
  "포지션 종료 처리와 검증 케이스 작성"
CARD 2  label VERBATIM: "화면"
  "수익률, 자산 비중, 보유 종목 화면 구현"
  "차트 데이터 변환 계층 정리"
  "숫자 표기 규칙(부호·화살표·자릿수) 통일"
CARD 3  label VERBATIM: "AI"
  "AI 체크리스트 응답 구조 설계"
  "스키마 검증과 카테고리 허용 목록"
  "규칙 기반 폴백 작성"
CARD 4  label VERBATIM: "백엔드"
  "Spring Boot 백엔드 도메인 구조 설계"
  "외부 시세 API 폴백 계층 구현"
  "MySQL 스키마 설계"

Then an honesty note, margin-top 32px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "구조에 대해 솔직히"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "계층은 나눴지만 도메인 객체가 여전히 JPA 엔티티와 같은 클래스다. 완전한 분리는 아니다."
    "테스트는 계산 로직에만 있다. 서비스와 컨트롤러는 수동 확인이다."
    "성능은 고려하지 않았다. 보유 종목이 수백 개가 되면 어떻게 될지 모른다."

=== RESPONSIVE ===
< 900px: diagram height 560px; each layer's boxes wrap; the return path redraws
along the right edge.
< 640px: the diagram becomes a VERTICAL list of layer groups, each a bordered group
containing its nodes as chips, with the trace animating as a highlight moving down
the list. Scope cards single column.

=== ACCESSIBILITY ===
prefers-reduced-motion: no traveling dot; pressing the button lights the whole path
instantly with all annotation chips visible; no autonomous run.
The trace button is a real <button> with a visible focus ring
(2px #38bdf8, offset 2px).
Provide a visually-hidden ordered text description of the trace path and each
layer's responsibilities.
Non-interactive nodes must not be in the tab order.

=== DO NOT ===
Do not use a diagramming library - hand-draw the SVG.
Do not overstate the architecture - the honesty note about JPA entities and missing
tests must stay.
Do not animate the trace when the diagram is off-screen.
```

---

## PAGE 09 — 결과 · 화면 갤러리

**개발 실체**: 완성된 화면들 + 실제 사용 맥락
**연출 장치**: 데스크 화면이 전체 화면으로 확장되며 갤러리로 전환

```text
Build a RESULTS SECTION presenting finished product screenshots as a gallery, for
an investment record service portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What was actually shipped, in screens
2. The concrete outcome stated without invented metrics
3. The standing non-advice disclaimer

=== MOOD ===
Market closing, desk tidy. Cold blue softening. Quiet, factual.

=== COMPLIANCE ===
FICTIONAL tickers only in every screenshot caption. The non-advice disclaimer is
REQUIRED on this page and must not be smaller than 11px.

=== DESIGN TOKENS (use exactly) ===
background #061421 (lifted from earlier sections) | panel #0d1e30
primary blue #38bdf8 | accent #7dd3fc | ok #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1120px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the gallery (5 items, asymmetric grid)
  Block C : the outcome stats
  Block D : the disclaimer strip + numbers note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "08 · 결과"

HEADING (32px font-black):
  VERBATIM: "입력한 기록만으로 상태가 다 보이는 화면이 됐다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "사용자가 거래를 입력하면 보유 종목, 수익률, 자산 비중이 계산되고,
             AI가 확인이 필요한 지점을 짚어준다.
             외부 시세가 끊겨도 화면은 마지막 값과 그 시각을 보여준다."

=== BLOCK B: THE GALLERY ===
An asymmetric grid, margin-top 48px:
  Row 1: one large item (2 columns) + one small item
  Row 2: three equal items
Gap 16px. Below 900px -> single column.

Each item: background #0d1e30, border 1px rgba(56,189,248,0.18), rounded-md,
overflow hidden.
  A 30px header strip with a font-mono 10px uppercase label on the left
  (rgba(255,255,255,0.48)) and a small blue dot on the right.
  Below it, the image area with aspect-ratio 16/10.
  A caption bar at the bottom, padding 12px 14px,
  border-top 1px rgba(56,189,248,0.10), font-mono 11px rgba(255,255,255,0.48).

ITEM 1 (large)  header VERBATIM "01 · 포트폴리오 대시보드"
  [IMG-01] the main dashboard with holdings, return and allocation
  caption VERBATIM: "거래 기록만으로 계산된 화면"
ITEM 2 (small)  header VERBATIM "02 · 거래 입력"
  [IMG-02] the trade entry screen
  caption VERBATIM: "입력 한 건이 네 값을 갱신한다"
ITEM 3          header VERBATIM "03 · 자산 비중"
  [IMG-03] the allocation chart view
  caption VERBATIM: "쏠림이 한눈에 보이도록"
ITEM 4          header VERBATIM "04 · AI 체크리스트"
  [IMG-04] the AI checklist panel
  caption VERBATIM: "추천이 아니라 점검"
ITEM 5          header VERBATIM "05 · 뉴스 연결"
  [IMG-05] the news relevance view
  caption VERBATIM: "언급 관계까지만 · 인과는 말하지 않는다"

IMAGE PLACEHOLDER SPEC (if no image is supplied): a CSS placeholder inside the
aspect box - background #040d18, a faint 24px blue grid, centered text in font-mono
12px rgba(255,255,255,0.35) reading the slot name, e.g. VERBATIM "[IMG-01] · 16:10"

HOVER: the item lifts 4px, border -> rgba(56,189,248,0.45), image scales 1.03
inside its clipped frame. 0.35s. Click opens a lightbox (overlay rgba(2,8,16,0.94),
backdrop-blur(8px), image max-width 1200px, caption below, Esc / overlay click
closes, arrow keys move between items).

=== BLOCK C: THE OUTCOME STATS ===
Margin-top 56px. Three stat cells, gap 14px (stacks below 640px).
Each: padding 22px, rounded-md, border 1px rgba(56,189,248,0.22),
background rgba(56,189,248,0.04).
  value font-mono 34px font-black #38bdf8 tabular-nums
  label font-mono 11px rgba(255,255,255,0.48), margin-top 6px
  Cell 1  value VERBATIM "6"     label VERBATIM "기술 스택"
  Cell 2  value VERBATIM "5"     label VERBATIM "핵심 기능"
  Cell 3  value VERBATIM "5건"   label VERBATIM "계산 검증 케이스"
Values count up over 0.8s on entry.

=== BLOCK D: THE DISCLAIMER STRIP + NUMBERS NOTE ===
Margin-top 32px. First, the required disclaimer:
  padding 16px 20px, rounded-md, border 1px rgba(251,191,36,0.30),
  background rgba(251,191,36,0.05), font-mono 12px #fbbf24, centered, VERBATIM:
  "이 서비스는 투자 자문이 아니며, 어떤 종목에 대한 매수·매도 권유도 제공하지 않습니다.
   화면의 모든 종목명과 수치는 예시입니다."

Then, margin-top 16px, a slim numbers note: padding 14px 18px, rounded-md,
border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02).
  font-mono 11px rgba(255,255,255,0.45), VERBATIM:
  "위 숫자는 구현 범위를 센 것입니다. 사용자 수, 등록된 거래 건수 같은 지표는
   수집하지 않았습니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The page background lifts #040d18 -> #061421 over 1.2s
0.10s  Label, heading word by word at 0.25s
0.80s  Paragraph
1.30s  Gallery items fade up 0.09s apart (y 20px -> 0, 0.6s)
2.20s  Stat cells fade up 0.1s apart, values counting
2.80s  Disclaimer strip, then the numbers note at 3.00s

=== RESPONSIVE ===
< 900px: single-column gallery.
< 640px: stat cells stack; heading 24px; disclaimer text 11px (never smaller).

=== ACCESSIBILITY ===
prefers-reduced-motion: no count-up, no hover scale, no background transition.
Every gallery item is a real <button> opening the lightbox with a visible focus
ring (2px #38bdf8, offset 2px). Each image needs a Korean alt text derived from its
caption. The lightbox traps focus while open and returns focus on close.
The disclaimer must be in normal document order, reachable by screen readers.

=== DO NOT ===
Do not invent user counts, trade volumes, or accuracy figures.
Do not use real tickers, real companies, or real news outlets in any caption.
Do not remove or shrink the disclaimer.
Do not add confetti.
```

---

## PAGE 10 — 회고 · 다음 단계 · 퇴장

**개발 실체**: KPT 회고 (PROBLEM 포함) + 다음 단계 + GitHub
**연출 장치**: 장 마감 → 화면 순차 종료 → 퇴장

```text
Build the CLOSING SECTION of an investment record service portfolio page: a KPT
retrospective, next steps, a repository link, and an exit transition where the desk
monitors shut down at market close.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An honest retrospective including real problems, not just wins
2. Concrete next steps
3. The repository link
4. A clean exit back to the village

=== MOOD ===
15:30, market closed. Screens dimming, desk quiet. Tired, precise, honest.
No triumphalism.

=== DESIGN TOKENS (use exactly) ===
background #061421 | panel #0d1e30 | primary blue #38bdf8 | accent #7dd3fc
keep #4ade80 | problem #f87171 | try #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 960px, padding-block 120px.
  Block A : the market-close header
  Block B : label + heading + one paragraph
  Block C : KPT, three columns
  Block D : next steps card
  Block E : GitHub link
  Block F : exit button + exit transition

=== BLOCK A: THE MARKET CLOSE HEADER ===
Centered. A clock readout, font-mono 15px tabular-nums rgba(255,255,255,0.48),
with a status chip, VERBATIM: "15:30  ○ 장 마감"
The header clock elsewhere on the page reaches this same state when the viewer
arrives here - keep them consistent.
Below it, a thin horizontal rule that draws left to right (0.5s).

=== BLOCK B: LABEL + HEADING + PARAGRAPH ===
Margin-top 40px.
SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.48)):
  "09 · 회고"
HEADING (30px font-black, margin-top 12px):
  VERBATIM: "화면을 예쁘게 만드는 것보다 숫자가 맞는 게 먼저였다"
PARAGRAPH (16px leading-9, max-width 720px, margin-top 18px):
  VERBATIM: "차트를 하나 더 붙이는 것보다, 이미 있는 수익률이 맞는지 확인하는 데
             시간을 더 썼어야 했다. 평단 버그를 며칠 동안 모르고 있었다."

=== BLOCK C: KPT ===
Margin-top 48px. Three columns, gap 16px (single column below 768px).
Each column: padding 22px, rounded-md, background #0d1e30,
border 1px rgba(255,255,255,0.10), with a 3px top border in its own color.
Header: font-mono 11px letter-spacing 0.2em, uppercase.
Items: 15px leading-8, each prefixed "· ", 14px apart.

COLUMN 1 - header VERBATIM "KEEP", color #4ade80, top border #4ade80. Items VERBATIM:
  "AI에 추천 기능을 넣지 않기로 한 결정"
  "계산을 도메인 계층으로 모아둔 것"
  "옛날 값을 보여줄 때 시각을 같이 표시한 것"

COLUMN 2 - header VERBATIM "PROBLEM", color #f87171, top border #f87171. Items VERBATIM:
  "평단 계산 버그를 사용자 제보 전까지 몰랐다"
  "테스트가 계산 로직에만 있다"
  "실제 시세 API 장애 상황에서 검증하지 못했다"

COLUMN 3 - header VERBATIM "TRY", color #fbbf24, top border #fbbf24. Items VERBATIM:
  "실시간 시세 API와 자동 포트폴리오 업데이트 추가"
  "계산 경로 전체에 테스트 붙이기"
  "로트 단위 기록으로 바꿔 실현손익 이력 남기기"

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), top border
grows 3px -> 4px. 0.3s.

=== BLOCK D: NEXT STEPS CARD ===
Margin-top 48px, padding 22px, rounded-md, border 1px rgba(56,189,248,0.22),
background rgba(56,189,248,0.04), border-left 3px #38bdf8.
  Label font-mono 11px letter-spacing 0.2em #38bdf8, VERBATIM: "다음 단계"
  Body 16px leading-8, margin-top 12px, VERBATIM:
  "실시간 시세 API와 자동 포트폴리오 업데이트 기능을 추가할 예정입니다.
   그 전에 계산 경로 전체에 테스트를 먼저 붙이려고 합니다."

=== BLOCK E: GITHUB LINK ===
Margin-top 40px. A single primary link button:
  background #38bdf8, color #040d18, font-mono 14px font-black,
  padding 14px 28px, rounded-md.
  Label VERBATIM: "GitHub 저장소 ↗"
  Hover: scale 1.04, box-shadow 0 0 28px rgba(56,189,248,0.36). Active: scale 0.97.
  href https://github.com/toadsam/MyStock-Desk, target _blank, rel noreferrer.

=== BLOCK F: EXIT BUTTON + EXIT TRANSITION ===
Margin-top 72px. A full-width button, height 88px, rounded-md,
border 1px rgba(255,255,255,0.14), background transparent.
  Label centered, font-mono 15px, letter-spacing 0.1em, rgba(255,255,255,0.62),
  VERBATIM: "← 마을로 돌아가기"
  Hover: border -> rgba(56,189,248,0.45), label -> #38bdf8, and a faint cool glow
  appears behind it. 0.4s.

EXIT TRANSITION (on click of this button OR the header's "← 마을로"):
  t=0.00s  Content fades to opacity 0 over 0.3s
  t=0.30s  Three monitor rectangles appear in the desk layout, still faintly lit
  t=0.45s  They power down one at a time, 0.12s apart, each collapsing vertically
           to a 2px line then to nothing (0.25s each)
  t=1.00s  A final clock readout appears at the center for 0.4s, font-mono 13px
           rgba(255,255,255,0.35), VERBATIM: "15:30 · 마감"
  t=1.40s  It fades; the background settles to #040d18
  t=1.70s  Emit an onExit callback so the parent can restore the 3D village scene.
  Body scroll locks during the transition; the parent releases it.
  No flash at any point.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Market-close header fades in; the clock ticks from the viewer's current
       scroll-derived time to 15:30 over 0.6s (tabular-nums, no layout shift)
0.70s  The rule draws
1.00s  Section label, heading word by word at 1.15s
1.70s  Paragraph
2.20s  KPT columns fade up left to right 0.12s apart, items inside 0.06s apart
3.20s  Next steps card slides in from the left (x -12px -> 0)
3.60s  GitHub button fades in
3.90s  Exit button fades in with its border drawing from the center outward
       (0% -> 100% width, 0.7s)

=== RESPONSIVE ===
< 768px: KPT single column; heading 24px; exit button height 72px, label 14px;
GitHub button full width.

=== ACCESSIBILITY ===
prefers-reduced-motion: no clock ticking, all reveals instant; the exit transition
becomes a plain 0.3s fade with no monitor shutdown.
The exit button must be a real <button>, keyboard focusable, visible focus ring
(2px #38bdf8, offset 2px).
All numbers tabular-nums.

=== DO NOT ===
Do not soften the PROBLEM column - the honesty is the point.
Do not add confetti or celebration copy.
Do not flash the screen during the exit.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-1. 개발 실체 커버리지 점검

| 항목 | 어디에 | 형태 |
|---|---|---|
| **왜 만들었나** | P00 | 개장 전 시퀀스 첫 문장 (3초 안에) |
| **데모 영상** | P01 보조 모니터 | 데스크 위 물건 |
| **GitHub** | P01 노트북 · P10 버튼 | 물건 + 마무리 버튼 |
| **관람객 직접 조작** | **P02(거래 입력) · P03(단계 진행) · P04(시나리오 실행) · P05(AI 질문) · P07(API 죽이기)** | **5곳** |
| **코드** | P02(계산 4단계) · P04(Before/After) · P05(시스템 프롬프트·서버 가드) · P06(뉴스 매칭) · P07(폴백) | **총 7개** |
| **트러블슈팅** | P04 (평단 붕괴) · P07 (외부 API 장애) | **전체 프로세스 2건** |
| **기술 의사결정 + 포기한 것** | P03 (이동평균 vs FIFO, 세금 포기) | 3안 비교 + 정직한 비용 카드 |
| **제품 윤리 결정** | P05 (추천 금지) · P06 (인과 주장 금지) | 이 프로젝트의 **차별화 핵심** |
| **아키텍처** | P08 | 계층별 책임 + 계산 위치 결정 |
| **결과물** | P09 | 갤러리 5장 |
| **회고** | P10 | KPT (PROBLEM 3개) |
| **한계 인정** | P03 · P04 · P05 · P06 · P07 · P08 · P09 | 세금 미지원 / 수수료 미반영 / 가드 우회 가능 / 오탐 / 이중화 없음 / JPA 결합 / 지표 없음 |

## D-2. 새로 만들 파일
```
src/components/ui/project-viewers/stages/mystock/
  index.tsx                 ← PAGE 00~10 순서, 스크롤→장 시간 매핑 소유
  useMarketClock.ts         ← 스크롤 → CSS 변수 + 09:00~15:30 (React state 금지)
  usePortfolioMath.ts       ← ⭐ 공용 계산 엔진 (P02·P03·P04가 전부 재사용)
  PreMarketIntro.tsx        ← P00
  DeskHero.tsx              ← P01 · 데스크 + 물건 3개
  TradeCalculator.tsx       ← P02 · 입력 → 4단계 계산 + 코드 순차 하이라이트
  CostBasisCompare.tsx      ← P03 · 이동평균 vs FIFO 동시 실행
  AvgCostBugCase.tsx        ← P04 · 시나리오 재현 + Before/After
  AiRefusalChat.tsx         ← P05 · 거절 응답 + 스키마 가드
  NewsRelevanceBoard.tsx    ← P06 · 연결선 + 인과 아님 태그
  ApiKillSwitch.tsx         ← P07 · 3단 스위치 + 폴백 계층
  LayerTrace.tsx            ← P08 · 요청 경로 추적
  copy.ts                   ← 모든 한국어 문구
  assets.ts                 ← [IMG-01~05] · [VIDEO-01]
```

> ⭐ **`usePortfolioMath.ts` 를 먼저 만들 것.** P02·P03·P04가 같은 계산기를 옵션만 바꿔 씁니다
> (`method: movingAvg | fifo`, `closePositionOnZero: true | false`).
> P04의 "수정 전/수정 후"가 그 플래그 하나로 갈립니다 — **버그 재현이 진짜 코드로 재현되는 게 핵심.**

## D-3. 기존 코드 재사용 / 선행 작업
재사용: `CodeBlock`, `ImageSlot`, `MockScreen`, `CountUp`, `RevealText` (`shared.tsx`)

> ⚠️ **선행 작업 (10개 프로젝트 공통 1건)**: `shared.tsx` 의 `DecisionTable`,
> `ArchDiagram`, `CompareBars`, `ProcessTimeline`, `QuoteCard`, `TldrBanner`,
> `BeforeAfter`, `ChallengeCard` 가 현재 **모듈 내부 함수(비export)** 입니다.
> stage 폴더에서 쓰려면 export로 승격해야 합니다.
> `DecisionTable` 은 P03에서 그대로 쓸 수 있어 우선순위 높음.

## D-4. 버릴 것
- `[KILL]` `DashboardProjectViewer` 의 mystock 분기 → stage 폴더로 이전
- `[KILL]` mystock의 기존 `SIGNATURE` 데모 → P02 `TradeCalculator` 로 흡수

## D-5. 미디어 확보 목록
| 슬롯 | 내용 | 비율 | 우선도 |
|---|---|---|---|
| `[VIDEO-01]` | 거래 입력 → 4값 갱신 → AI 체크리스트 실행 (2분 05초) | 16/9 | 높음 |
| `[IMG-01]` | 포트폴리오 대시보드 | 16/10 | **최상** |
| `[IMG-02]` | 거래 입력 화면 | 16/10 | 높음 |
| `[IMG-03]` | 자산 비중 차트 | 16/10 | 중간 |
| `[IMG-04]` | AI 체크리스트 패널 | 16/10 | **최상** (차별화 포인트) |
| `[IMG-05]` | 뉴스 연결 화면 | 16/10 | 중간 |

> ⚠️ 스크린샷의 **종목명이 실존 종목이면 반드시 가상 종목으로 교체 후 캡처**할 것.
> 이 방 전체가 "실존 종목 0개" 원칙 위에 서 있습니다.

## D-6. 코드 스니펫 확보 목록 (전부 실제 저장소에서)
| 페이지 | 파일 | 줄 | 하이라이트 |
|---|---|---|---|
| P02 | `PortfolioCalculator.java` | 28 | (1)~(4) 4구간 · BigDecimal |
| P04 | `PortfolioCalculator.java (before)` | 14 | 매도 시 평단 미초기화 |
| P04 | `PortfolioCalculator.java (after)` | 20 | 포지션 종료 · 신규 포지션 분기 |
| P05 | `checklist.prompt.txt` | 16 | 금지 2줄 |
| P05 | `AiChecklistService.java` | 20 | 스키마 검증 · 카테고리 허용목록 |
| P06 | `NewsRelevanceService.java` | 20 | 약한 매칭 플래그 · 영향도 필드 부재 주석 |
| P07 | `QuoteService.java` | 22 | 타임아웃 설정 · source/asOf 메타 |

## D-7. 안전장치 대조표

이 방은 **제어권을 뺏지 않습니다.** 전부 관람객이 직접 누릅니다.

| 페이지 | 장치 | 안전장치 |
|---|---|---|
| P03 | 자동 진행 (5초 후) | 관람객이 조작하면 영구 중단 |
| P04 | 시나리오 실행 | 실제 요청 없음 · 되돌리기 상시 |
| P05 | AI 채팅 | **실제 모델 호출 없음** · 사전 작성 응답만 |
| P07 | API 죽이기 | 실제 요청 없음 · 언제든 복구 |
| P08 | 자동 추적 (5초 후) | 최대 2회 |

## D-8. 최종 체크리스트 (컴플라이언스 항목 최우선)
- [ ] **실존 종목명 · 실존 기업명 · 실존 매체명이 0개인지** (스크린샷 포함)
- [ ] **종목 추천 · 목표가 · 수익 보장 · 시장 전망 문구가 0개인지**
- [ ] P05 · P09 **"투자 자문이 아닙니다" 고지**가 12px 이상으로 남아 있는지
- [ ] P05가 **실제 모델 API를 호출하지 않는지** (사전 작성 응답만)
- [ ] P06 **"인과 아님" 태그**가 연결선과 항상 함께 보이는지
- [ ] P06 응답 DTO에 **영향도/센티먼트 필드를 만들지 않았는지**
- [ ] **상승/하락이 색만으로 구분되지 않는지** — ▲/▼ 와 +/− 항상 병기 (전 페이지)
- [ ] **모든 숫자가 `tabular-nums`** 인지 (이 방에서 특히 중요)
- [ ] P02 화면에 표시된 **산식이 실제로 표시된 결과와 일치하는지** (검산 가능)
- [ ] P04 **틀린 산식조차 내부적으로 일관**된지 (아무 숫자나 넣지 말 것)
- [ ] `usePortfolioMath.ts` 를 **먼저** 만들었는지 (P02·P03·P04 공용)
- [ ] P02 코드 패널을 **단계마다 리렌더하지 않는지** (ref + class 토글)
- [ ] 장 시간 시계가 **CSS 변수 + rAF** 로 스크롤에 바인딩됐는지
- [ ] P03 자동 진행 · P08 자동 추적이 **뷰포트 밖에서 정지**하는지
- [ ] P07 에서 **실제 네트워크 호출을 하지 않는지**
- [ ] P07 오래된 값이 **회색이 아니라 텍스트("12분 전 값")로도** 표시되는지
- [ ] P09 **"사용자 수·거래 건수 미수집"** 면책 문구 유지
- [ ] 이 방은 **무음** — 사운드 토글 자체를 두지 않았는지
- [ ] 지어낸 수치 0개 — 사용자 수·정확도·수익률 성과 주장 금지
