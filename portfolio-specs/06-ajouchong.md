# 06. 아주총학 — 프롬프트 팩

> 아주대학교 총학생회 공식 웹사이트 프론트엔드 · React / React Router / JavaScript / Docker / Nginx
> **사용법**: `PAGE 00` ~ `PAGE 10` 의 코드블록을 **하나씩 통째로 복사해서 Variant에 붙여넣으세요.**
> 각 프롬프트는 **완전히 자립적**입니다 (색상·폰트·무드가 매번 반복 포함).
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.

> ⭐ **10개 프로젝트 중 유일하게 「실제로 배포되어 학생들이 쓰는」 서비스입니다.**
> 이 방의 모든 연출은 그 사실 하나에서 나옵니다. 다른 방이 "만들었습니다"라면, 이 방은 **"돌아가고 있습니다"** 입니다.
> 그래서 배포·운영·장애 대응이 이 방의 주인공이고, 화면 기능은 조연입니다.

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 방의 한 문장

**"학생회관 1층 게시판. 지금도 누가 와서 읽고 간다."**

## A-2. 왜 이 메타포인가

아주총학은 **실제로 배포되어 운영 중인 유일한 프로젝트**다.
그 말은 이 프로젝트의 진짜 이야기가 "무슨 기능을 만들었나"가 아니라
**"만든 걸 세상에 내놓고 나서 무슨 일이 생겼나"** 라는 뜻이다.

로컬에서 잘 되던 게 배포하니 404가 났다.
고쳐서 다시 올렸는데 학생들 화면에는 옛날 게 그대로 보였다.
**이건 코드를 짜는 문제가 아니라 코드를 내보내는 문제였고, 그건 다른 종류의 일이었다.**

그래서 이 방은 게시판이다. 게시판은 **누가 붙이느냐**보다 **어떻게 붙어 있느냐**가 중요하다.
관람객은 이 방에서 공지를 읽고, 새로고침을 눌러 404를 만나고, 배포 파이프라인을 직접 돌린다.

## A-3. ⭐ 가장 중요한 원칙 — 연출은 개발 내용의 운반 수단이다

**모든 연출은 반드시 개발 실체를 하나 이상 전달해야 한다.** 멋있기만 한 연출은 넣지 않는다.

| 전달할 개발 실체                    | 그걸 실어나르는 연출                                                                             | 페이지 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ | ------ |
| 왜 이걸 만들었나 (동기)             | 불 꺼진 게시판에 형광등이 켜지고 공지가 붙는 진입 시퀀스                                         | 00     |
| **실제 배포 중** · 데모 · GitHub    | **게시판에 압정으로 꽂힌 종이 3장** + 헤더의 `● 서비스 운영 중` 배지                             | 01     |
| 흩어진 정보를 한곳으로 (정보 구조)  | **네 개의 채널 아이콘이 하나의 게시판으로 합쳐지고**, 관람객이 직접 탭을 눌러 이동               | 02     |
| **트러블 01: 새로고침하면 404**     | **관람객이 시뮬레이터에서 새로고침을 누르면 진짜 404 화면이 뜬다** → Nginx 설정으로 해결         | 03     |
| **Docker + Nginx 배포 파이프라인**  | **게시판이 뒤집히며 뒷면에 파이프라인이 드러나고, 관람객이 「배포」 버튼을 눌러 4단계를 돌린다** | 04     |
| AuthContext · 보호 라우트 · Q&A     | 관람객이 로그인 없이 Q&A 작성을 시도 → 막힘 → 로그인 → 원위치 복귀                               | 05     |
| **트러블 02: 배포했는데 옛날 화면** | **관람객이 「다시 배포」를 눌러도 화면이 안 바뀐다** → 캐시 전략 코드                            | 06     |
| 실서비스 운영에서 배운 것           | 학생들에게 실제로 받은 문의가 카드로 붙고, 각각 무슨 수정으로 이어졌는지                         | 07     |
| 전체 구조 · 내 범위                 | 요청 하나가 브라우저→Nginx→정적파일→API로 흐르는 경로를 따라감                                   | 08     |
| 결과물 · 화면 갤러리                | 게시판 전체에 조명이 들어오며 갤러리 공개                                                        | 09     |
| 회고 · 다음 단계                    | 게시판 소등 → 퇴장                                                                               | 10     |

## A-4. 설계·운영 결정 ↔ 웹 재현 대응

| 실제로 있었던 일            | 이 웹페이지에서의 재현                              |
| --------------------------- | --------------------------------------------------- |
| 배포 후 새로고침 404        | **관람객이 새로고침 버튼을 눌러 404를 직접 만난다** |
| 배포했는데 갱신이 안 됨     | **관람객이 배포 버튼을 눌러도 화면이 그대로다**     |
| 로그인해야 Q&A를 쓸 수 있음 | **관람객이 로그인 없이 시도하고 막힌다**            |
| 지금도 서비스가 살아 있음   | **헤더에 `● 서비스 운영 중` 배지가 상시 켜져 있다** |

## A-5. 관람 곡선 (감정 + 정보 밀도)

```
안정  ────╮        ╭─── P04 배포 성공 (해소)
          ╰─╮ P03 404 (첫 충격)   ╭─╮ P06 캐시 (두 번째)
 P00~02      ╰────────────────────╯ ╰──╮
 게시판 점등                              ╰──── P07~10 운영 · 정리
정보  낮 ────╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲──────
          P03~08 개발 밀도 최고조
조명  ○ ── ◔ ── ◑ ── ◕ ── ● ── ●
```

**핵심 장치**: 헤더에 **`● 서비스 운영 중`** 배지가 있다.
이건 진행바가 아니라 **이 프로젝트의 정체성 표시**다. 페이지 내내 켜져 있고,
**PAGE 03과 06에서만 잠깐 `○ 서비스 중단` 으로 바뀐다.** 그 두 번이 트러블슈팅의 도입이다.

## A-6. 명장면 3개

**① PAGE 03 — 새로고침을 눌러보세요** (첫 충격)
관람객이 공지 상세 화면에서 시뮬레이터의 새로고침 버튼을 누른다.
화면이 하얗게 깜빡이고 **`404 Not Found` 가 뜬다.** 헤더 배지가 `○ 서비스 중단` 으로 바뀐다.
뜨는 문장: _"배포 첫날, 학생들이 링크를 눌렀을 때 본 화면입니다."_

**② PAGE 04 — 게시판이 뒤집힌다** (기술의 클라이맥스)
게시판 전체가 Y축으로 회전하며 **뒷면에 배포 파이프라인이 드러난다.**
관람객이 `배포하기` 를 누르면 빌드 → 이미지 생성 → 컨테이너 교체 → 헬스체크가
실제로 4단계로 진행되고, 각 단계에서 해당 설정 파일 코드가 옆에서 켜진다.

**③ PAGE 06 — 배포했는데 안 바뀐다** (두 번째 충격)
관람객이 `다시 배포` 를 누른다. 파이프라인은 성공한다. **그런데 화면은 그대로다.**
뜨는 문장: _"배포는 성공했습니다. 학생들 화면만 안 바뀌었습니다."_

## A-7. 다른 9개 방과의 차별점

| 축          | 아주총학                         | 나머지                     |
| ----------- | -------------------------------- | -------------------------- |
| 상태        | **지금도 운영 중**               | 프로토타입 · 개인 프로젝트 |
| 주제        | **배포와 운영**                  | 기능 구현                  |
| 트러블 성격 | **인프라 설정** (코드 밖의 문제) | 코드 안의 문제             |
| 증거        | **실제 서비스 URL**              | 스크린샷 · 저장소          |
| 사용자      | **실제 학생들**                  | 없음                       |
| 색          | 로즈 · 형광등                    | 각자                       |

## A-8. 절대 금지 (안전 규칙)

- **실존 학생 이름·학번·연락처·실제 Q&A 내용 금지.** 전부 가상 (`학생 A`, 가상 문의)
- 실제 총학생회 로고·엠블럼 사용 금지. 화면 재현은 **레이아웃과 색만**
- 실제 운영 URL은 **P01 링크 한 곳에만** 노출하고, 접속자 수·트래픽 지표는 **없다고 명시**
- 404 재현은 **시뮬레이터 안에서만.** 실제 404를 만들거나 실제 URL을 호출하지 않는다
- 배포 시뮬레이션은 **아무 명령도 실행하지 않는다.** 순수 UI
- 소리 없음 (이 방은 무음)

---

# B. 공통 디자인 토큰 (참고용 — 각 프롬프트에 이미 포함됨)

| 토큰                | 값                                                                    | 용도           |
| ------------------- | --------------------------------------------------------------------- | -------------- |
| `--bg`              | `#160709` → `#1c0b0f` (P09부터)                                       | 페이지 배경    |
| `--panel`           | `#220e13`                                                             | 게시판 · 카드  |
| `--paper`           | `#2a1418`                                                             | 붙어 있는 종이 |
| `--primary`         | `#fb7185`                                                             | 로즈 · 강조    |
| `--accent`          | `#fda4af`                                                             | 보조 강조      |
| `--live` / `--down` | `#4ade80` / `#f87171`                                                 | 운영 중 / 중단 |
| `--warn`            | `#fbbf24`                                                             | 주의           |
| `--text`            | `rgba(255,255,255,0.88)`                                              | 본문           |
| `--muted`           | `rgba(255,255,255,0.46)`                                              | 캡션           |
| `--cork`            | `rgba(251,113,133,0.05)`                                              | 게시판 텍스처  |
| 코드 패널           | bg `#180a0d`, border `rgba(251,113,133,0.18)`                         |                |
| 문법 색             | 주석 `#8a5a63` / 문자열 `#a3e635` / 키워드 `#fb7185` / 숫자 `#7dd3fc` |                |
| 터미널              | bg `#0f0709`, 프롬프트 `#4ade80`, 출력 `rgba(255,255,255,0.72)`       |                |
| 이징                | `cubic-bezier(0.4,0,0.2,1)`, 0.3~0.8s                                 | 단정하게       |
| 숫자                | 전부 `tabular-nums`                                                   |                |

---

# C. 페이지별 프롬프트

---

## PAGE 00 — 게시판에 불이 켜진다 (진입 시퀀스)

**개발 실체**: 왜 이걸 만들었는가 (동기)
**연출 장치**: 어두운 학생회관 복도 → 형광등이 깜빡이며 켜짐 → 공지가 한 장씩 붙음

```text
Build a full-screen cinematic ENTRY SEQUENCE for a university student council
website portfolio page, where a dark notice board is lit by a flickering fluorescent
lamp and notices get pinned up one by one.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Single self-contained
component. Draw everything in CSS/SVG.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
Why this project was built. The final readable line must state the developer's
motivation, within 4 seconds.

=== MOOD ===
The ground-floor corridor of a student union building at night. A cork notice board,
a fluorescent tube warming up, paper and pushpins. Rose-tinted institutional light.
Quiet, ordinary, a little nostalgic. NOT a startup landing page. NOT neon.

=== COMPLIANCE (applies to every page in this project) ===
All student names, IDs, contacts and Q&A contents are FICTIONAL.
Never reproduce a real student council logo or emblem - layout and color only.

=== DESIGN TOKENS (use exactly) ===
background #160709 | panel #220e13 | paper #2a1418
primary rose #fb7185 | accent #fda4af
live #4ade80 | down #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
cork texture rgba(251,113,133,0.05)
fonts: headings font-black, body sans leading-8, ALL labels/status font-mono
easing cubic-bezier(0.4,0,0.2,1), durations 0.3s-0.8s | rounded-md
ALL numbers tabular-nums

=== LAYOUT ===
Full viewport, position fixed, above page content.
Background: #160709 with a faint cork texture (SVG turbulence at opacity 0.03).
A NOTICE BOARD occupies the center: max-width 880px, aspect 16/9, background #220e13,
with a 10px wooden-looking frame (a slightly lighter rose-brown, #35191d) and an
inner shadow.
Above the board, a FLUORESCENT TUBE: a 60% width, 8px tall rounded bar with a
rose-white glow.

=== ENTRY TIMELINE (follow exactly) ===
t=0.00s  Total darkness. The board is barely visible as a silhouette.
t=0.30s  THE LAMP FLICKERS ON. This is a controlled flicker, NOT a strobe:
         exactly THREE brightness steps over 0.9s - 18% for 0.12s, dark for 0.18s,
         52% for 0.10s, dark for 0.14s, then ramping to 100% over 0.36s.
         Never exceed 3 transitions and never cycle faster than that.
         Each lit step casts a rose glow (rgba(251,113,133,0.10), a wide ellipse)
         onto the board.
t=1.20s  The board is fully lit. Its cork texture and empty pushpin holes are
         visible.
t=1.40s  SIX NOTICES get pinned up, one at a time, 0.14s apart. Each is a small
         paper rectangle (background #2a1418, 1px border rgba(255,255,255,0.10),
         ±2.5deg tilt) that drops from 24px above with a 0.3s settle, and a red
         pushpin (a 7px circle with a tiny highlight) appears at its top with a
         0.1s scale-in. Each landing casts a small paper shadow.
         Notice labels, font-mono 9px rgba(255,255,255,0.55), VERBATIM in order:
           "공지사항" "Q&A" "총학생회 소개" "복지 정보" "자료실" "학사일정"
t=2.40s  The board DIMS to 30% behind a text column that fades in on top.
         TITLE:
           Line 1, VERBATIM: "아주총학"
             56px font-black, #fb7185, letter-spacing -0.02em
           Line 2, VERBATIM: "총학생회 공식 웹사이트 · React + Docker + Nginx"
             13px font-mono, rgba(255,255,255,0.46), letter-spacing 0.14em,
             margin-top 12px
t=2.90s  THE MOTIVATION LINE fades in. This is the substance of this page.
         17px, leading-9, rgba(255,255,255,0.88), max-width 560px, centered.
         Korean copy, VERBATIM:
         "공지는 인스타에, 신청 링크는 카톡에, 복지 정보는 아무도 모르는 곳에 있었다.
          학생회관 게시판이 하던 일을 아무도 대신하고 있지 않았다.
          그래서 한곳에 모으는 것부터 시작했다."
         Reveal word by word, stagger 0.035s, y 6px -> 0.
t=4.00s  A LIVE BADGE appears at the top-right of the board area: a 7px #4ade80 dot
         with a soft halo pulsing on a 2.2s cycle, followed by font-mono 12px
         rgba(255,255,255,0.72), VERBATIM: "● 서비스 운영 중"
         and beneath it, font-mono 9px rgba(255,255,255,0.40), VERBATIM:
         "실제로 배포되어 운영되고 있는 프로젝트입니다"
         THIS BADGE PERSISTS into the fixed header for the rest of the page.
         It is this project's identity marker, not a progress bar.
t=4.50s  Scroll hint at the bottom, font-mono 12px rgba(255,255,255,0.46),
         VERBATIM: "↓ 게시판 앞으로"
         with a rose chevron bouncing 4px on a 1.8s cycle.

=== ESCAPE HATCHES (required) ===
Any click, scroll, keypress, or Escape skips to the t=4.50s end state instantly.
A skip control from t=0.40s at the bottom-right, font-mono 11px,
rgba(255,255,255,0.35), VERBATIM: "[ 건너뛰기 ]"

=== ACCESSIBILITY (photosensitivity matters here) ===
The lamp flicker is EXACTLY three brightness steps within 0.9s and never repeats.
It must never look like a strobe. If in doubt, reduce to two steps.
prefers-reduced-motion: NO flicker at all - the lamp fades on smoothly over 0.5s,
notices appear in place with no drop, no pushpin animation.
All text is real DOM text.

=== RESPONSIVE ===
< 768px: board max-width 92vw, title 34px, motivation 15px, four notices instead of
six ("공지사항" "Q&A" "복지 정보" "자료실").

=== DO NOT ===
No strobing, no rapid flicker loops, no full-screen white flash.
Do not reproduce any real student council logo, emblem, or crest.
Do not delay the motivation line past 3.4s.
```

---

## PAGE 01 — 히어로 · 게시판 (지금 운영 중)

**개발 실체**: 프로젝트 정체 + **실제 서비스 링크 · 데모 영상 · GitHub**
**연출 장치**: 링크가 버튼이 아니라 **게시판에 압정으로 꽂힌 종이 3장** — 하나는 **실제 운영 중인 사이트**

```text
Build the HERO SECTION of a university student council website portfolio page,
built around a cork notice board where three pinned papers ARE the live service
link, the demo video, and the GitHub repository - with the live service treated as
the most important of the three.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained section.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the project is - and that it is ACTUALLY DEPLOYED AND RUNNING
2. The live service link (the headline fact of this whole project)
3. The demo video entry point
4. The GitHub repository link
Items 2-4 must read as papers pinned to a board, never as a link row.

=== MOOD ===
Student union corridor, fluorescent light, cork board, pushpins, slightly curled
paper. Institutional but warm. Rose-tinted.

=== COMPLIANCE ===
All student names, IDs, contacts and Q&A contents are FICTIONAL.
Do not reproduce any real logo or emblem.

=== DESIGN TOKENS (use exactly) ===
background #160709 | panel #220e13 | paper #2a1418
primary rose #fb7185 | accent #fda4af
live #4ade80 | down #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
cork rgba(251,113,133,0.05) | paper border rgba(255,255,255,0.10)
fonts: headings font-black, body sans leading-8, labels/status font-mono
easing cubic-bezier(0.4,0,0.2,1) 0.3s-0.8s | rounded-md | ALL numbers tabular-nums

=== PERSISTENT HEADER (fixed, present on every section of this page) ===
Height 54px, background rgba(22,7,9,0.85), backdrop-blur(10px),
bottom border 1px rgba(251,113,133,0.18).
  LEFT   "← 마을로"  13px font-mono rgba(255,255,255,0.46)
  CENTER "아주총학"  14px font-black #fb7185
  RIGHT  THE LIVE BADGE - this project's identity marker:
         a 7px #4ade80 dot with a 2.2s pulsing halo, then font-mono 12px
         rgba(255,255,255,0.72), VERBATIM: "● 서비스 운영 중"
         It stays lit on every section EXCEPT during the two troubleshooting
         reproductions, where it turns #f87171 and reads VERBATIM "○ 서비스 중단".
         It returns to green when those reproductions end.

=== LAYOUT ===
min-height 100vh, padding-block 88px, centered, max-width 1120px.
A NOTICE BOARD fills the section: aspect 16/9 (min-height 520px), background #220e13,
10px frame in #35191d, inner shadow, cork texture.
A text column floats over the board's upper-left area at max-width 560px; the three
pinned papers occupy the right and lower area.

=== THE THREE PINNED PAPERS (the defining objects of this page) ===
Each paper: background #2a1418, 1px border rgba(255,255,255,0.10), a red pushpin at
the top center (a 9px circle with a 3px highlight and a small shadow), a ±3deg tilt,
and a paper shadow. Hovering straightens it to 0deg, lifts it 6px, and deepens the
shadow. 0.3s.

  PAPER A - THE LIVE SERVICE  (largest, 300x200px, front layer, right-center)
    This is the MOST IMPORTANT element on the page. Give it visual priority over
    everything else on the board.
    Contents:
      - A live chip at the top-left, font-mono 10px, a 7px #4ade80 dot with a
        pulsing halo, VERBATIM: "운영 중"
      - Title, font-black 19px #fda4af, VERBATIM: "실제 서비스 열기"
      - A URL line, font-mono 11px rgba(255,255,255,0.60), rendered in a small
        address-bar-looking pill (background rgba(255,255,255,0.05),
        border 1px rgba(255,255,255,0.10), rounded-full, padding 5px 12px)
        showing the real deployed address of the student council site.
      - A sub-line, font-mono 10px rgba(255,255,255,0.46), VERBATIM:
        "학생들이 실제로 쓰는 사이트입니다"
      - A "↗" glyph at the bottom-right, 16px, #fb7185
    Click -> opens the live site in a new tab (target _blank, rel noreferrer).
    A soft rose glow (box-shadow 0 0 40px rgba(251,113,133,0.14)) breathes around
    this paper on a 3.5s cycle - subtle, never distracting.

  PAPER B - DEMO VIDEO  (220x150px, left of A)
    A play triangle 22px #fda4af inside a 46px circle with a 1px
    rgba(253,164,175,0.45) border.
    Title, font-black 14px, VERBATIM: "화면 둘러보기"
    Chip, font-mono 10px rgba(255,255,255,0.55), VERBATIM: "1분 36초"
    Click -> video lightbox: overlay rgba(14,5,7,0.94) backdrop-blur(8px),
    16/9 player centered at max-width 1000px, Esc or overlay click closes.
    If no video source is supplied, render a CSS placeholder with centered text
    VERBATIM "화면 둘러보기 영상 자리 · 16:9".
    [VIDEO-01] one pass: 공지 목록 -> 공지 상세 -> 새로고침이 정상 동작 ->
    Q&A 작성 시도 -> 로그인 -> 작성 완료.

  PAPER C - GITHUB  (200x140px, below and right of B)
    A monospace "< >" glyph 24px rgba(255,255,255,0.78).
    Title, font-black 14px, VERBATIM: "GitHub 저장소"
    Chip, font-mono 10px rgba(255,255,255,0.55),
    VERBATIM: "React · Docker · Nginx"
    Click -> https://github.com/toadsam/ajouchong-web in a new tab
    (target _blank, rel noreferrer).

  A HANDWRITTEN STICKY NOTE (small, 128x88px, rotate -6deg, tucked at the board's
  bottom-left corner, background #35191d):
    Four lines, font-mono 9px rgba(255,255,255,0.60), VERBATIM:
      "React SPA 프론트엔드"
      "라우팅 · 상태 관리"
      "Docker + Nginx 배포"
      "실제 운영까지"
    Not a link. Hovering straightens it.

  A hint below the papers, font-mono 10px rgba(255,255,255,0.35), fading out
  permanently once any paper has been hovered or focused,
  VERBATIM: "종이를 눌러보세요"

=== TEXT COLUMN CONTENT (Korean copy - VERBATIM, never translate) ===

KICKER (font-mono 12px, letter-spacing 0.3em, uppercase, color #fb7185):
  "PLATFORM · 총학생회 공식 웹사이트"

HEADLINE (font-black, 40px desktop / 26px mobile, leading-tight,
          rgba(255,255,255,0.88)):
  Line 1, VERBATIM: "만드는 것과"
  Line 2, color #fb7185, margin-top 10px, VERBATIM: "내보내는 것은 다른 일이었다"

SUMMARY (16px leading-9, max-width 520px, margin-top 22px):
  VERBATIM: "공지, Q&A, 복지 정보를 한 사이트에 모았습니다.
             그리고 그걸 Docker와 Nginx로 실제 서버에 올려서, 지금도 돌아가고 있습니다."
  Emphasize "지금도 돌아가고 있습니다" in #4ade80, font-bold.

FACT GRID (4 cells in a row; 2x2 below 768px), margin-top 28px.
Each cell: border 1px rgba(251,113,133,0.20), rounded-md, padding 14px,
background rgba(251,113,133,0.03).
value font-mono 22px font-black #fb7185 tabular-nums, label font-mono 10px
rgba(255,255,255,0.46) letter-spacing 0.1em below.
  Cell 1  value "5"       label "기술 스택"
  Cell 2  value "5"       label "핵심 기능"
  Cell 3  value "배포됨"   label "서비스 상태"
  Cell 4  value "2건"     label "배포 후 겪은 장애"
Cell 3 gets a 1px rgba(74,222,128,0.35) border and its value in #4ade80 - it is the
project's headline fact. Cell 4 gets a 1px rgba(251,191,36,0.30) border - it is the
honest counterpart, and it is deliberately on the same row.
A note beneath the grid, font-mono 10px rgba(255,255,255,0.35), VERBATIM:
  "장애 2건은 뒤에서 그대로 재현해서 보여드립니다"

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The board fades up with its frame drawing (0.6s)
0.30s  Kicker fades up (y 10px -> 0, 0.5s)
0.50s  Headline line 1 word by word (stagger 0.04s), line 2 at 1.05s
1.50s  Summary reveals
1.90s  Fact cells fade in 0.09s apart; cell 3's "배포됨" arrives with a single soft
       green pulse
2.40s  PAPER A gets pinned first (it is the most important): it drops from 28px
       above with a slight rotation overshoot, its pushpin scales in 0.1s later,
       and its rose glow begins breathing
2.65s  PAPER B, then PAPER C, then the sticky note, 0.18s apart
3.40s  The hint fades in

=== RESPONSIVE ===
< 1024px: the board becomes taller (aspect auto, min-height 640px); the text column
sits above and the four papers arrange in a 2x2 grid beneath it.
< 640px: papers become full-width stacked cards (still with pushpins and tilt);
PAPER A stays first and largest; headline 26px.
Touch: every paper needs a 44px minimum touch target.

=== ACCESSIBILITY ===
prefers-reduced-motion: no drop-in, no pushpin scale, no breathing glow, no board
frame draw. Everything renders in place; hover still lifts without rotation.
Papers A, B and C must be real anchors/buttons with visible focus rings
(2px #fb7185, offset 2px). Keyboard focus produces the same straighten-and-lift.
PAPER A's link must announce that it opens in a new tab.
All numbers tabular-nums.

=== DO NOT ===
Do not render the links as a conventional button row anywhere.
Do not claim visitor counts, traffic, or user numbers - the live badge says the
service runs, nothing more.
Do not reproduce a real logo or emblem.
```

---

## PAGE 02 — 흩어진 것을 한곳으로 · 정보 구조와 라우팅

**개발 실체**: SPA 라우팅 구조 + 정보 구조 설계
**연출 장치**: **네 개의 채널 아이콘이 하나의 게시판으로 합쳐지고**, 관람객이 탭을 눌러 실제로 이동한다

```text
Build an INFORMATION ARCHITECTURE section where four scattered communication
channels visibly merge into a single site, and the viewer can then navigate that
site's sections inside a device frame while the route map lights up alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
Simulate navigation locally - do NOT change the real URL.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The problem: information scattered across four channels
2. The section structure that replaced it, and why those sections
3. The SPA route configuration behind it

=== MOOD ===
Student union corridor, mid-morning. Rose light, cork, orderly signage.
Calm and structural.

=== COMPLIANCE ===
All notice titles, Q&A contents and names are FICTIONAL.

=== DESIGN TOKENS (use exactly) ===
background #160709 | panel #220e13 | paper #2a1418
primary rose #fb7185 | accent #fda4af | live #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #180a0d, border rgba(251,113,133,0.18)
syntax: comments #8a5a63, strings #a3e635, keywords #fb7185, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1120px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : THE MERGE - full width, height ~340px
  Block C : a two-column split, gap 20px
              LEFT  (52%) : THE DEVICE, height 540px
              RIGHT (48%) : the route map (top) + the router code (bottom)
            Below 1024px stacks, device first.
  Block D : media slot

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "01 · 정보 구조"

HEADING (28px font-black):
  VERBATIM: "정보가 없는 게 아니라, 찾을 수가 없었다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "총학생회는 공지를 이미 열심히 올리고 있었다.
             다만 인스타 스토리에 올리면 24시간 뒤에 사라지고,
             카톡 공지는 방을 나가면 못 보고, 학사 정보는 학교 포털 깊은 곳에 있었다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "그래서 새 정보를 만든 게 아니라, 이미 있는 걸 한 주소에 모았다.
             그 주소가 사라지지 않는 게 이 서비스의 전부였다."
  Emphasize "그 주소가 사라지지 않는 게" in #fda4af, font-bold.

=== BLOCK B: THE MERGE (the defining animation of this page) ===
A container, height ~340px, background #220e13,
border 1px rgba(251,113,133,0.18), rounded-md, padding 24px, position relative.

INITIAL STATE: FOUR channel cards scattered across the container at different
positions and rotations (±8deg), each 132x92px, background #2a1418,
border 1px rgba(255,255,255,0.12), rounded-md, each containing a simple CSS/SVG
glyph and a label in font-mono 11px rgba(255,255,255,0.70).
Labels VERBATIM: "인스타 스토리" "카톡 공지방" "학교 포털" "종이 게시물"
Each carries a small problem chip beneath its label, font-mono 9px #f87171,
VERBATIM in order: "24시간 뒤 삭제" / "나가면 못 봄" / "찾기 어려움" / "지나가야 봄"

THE MERGE ANIMATION (triggered on viewport entry, and replayable by a control):
  t=0.00s  The four cards' problem chips pulse once
  t=0.30s  All four cards TRAVEL toward the container's center simultaneously,
           rotating to 0deg, scaling to 0.7, over 0.7s. Their trails leave a faint
           rose streak that dissipates.
  t=0.90s  At the center they COLLAPSE into a single site card (240x150px,
           background #2a1418, border 1px rgba(251,113,133,0.40)) with a 0.3s
           scale-up settle and one expanding rose ring.
  t=1.30s  The site card's contents type in: a title, font-black 15px #fda4af,
           VERBATIM: "아주총학 웹사이트"
           and a URL pill, font-mono 10px rgba(255,255,255,0.60), showing the
           deployed address.
  t=1.70s  FIVE section chips fan out from the card in an arc below it, 0.08s apart,
           each font-mono 10px, padding 5px 11px, rounded-full,
           border 1px rgba(251,113,133,0.30), color rgba(255,255,255,0.75).
           Labels VERBATIM: "공지사항" "Q&A" "총학생회 소개" "복지 정보" "자료실"
  t=2.30s  A caption fades in at the container's bottom, font-mono 11px
           rgba(255,255,255,0.46), VERBATIM:
           "네 곳에 흩어져 있던 것을 다섯 개 메뉴로 정리했습니다"
A replay control at the container's top-right, font-mono 11px
rgba(255,255,255,0.46), VERBATIM: "↻ 다시 보기"

=== BLOCK C LEFT: THE DEVICE (must actually navigate) ===
A device frame: width ~400px, height 540px, rounded-2xl, border 8px solid #2b1116,
background #180a0d, with a 14px notch bar.
Inside, a mini site with a 40px top navigation bar containing five tabs, font-mono
10px, VERBATIM: "공지" "Q&A" "소개" "복지" "자료"
The active tab has a 2px rose underline that SLIDES between tabs (0.3s) - never jumps.

FIVE SCREENS, each fully rendered with realistic content:

  SCREEN "공지" - a list of 6 notice rows, each with a date (font-mono 10px),
    a FICTIONAL title (font-black 13px), and a category chip. Titles VERBATIM:
      "2학기 등록금 분할납부 안내"
      "중앙운영위원회 회의록 공개"
      "학생회관 리모델링 일정 공지"
      "동아리 지원금 신청 안내"
      "겨울 계절학기 셔틀 운행 변경"
      "학생 상담센터 이용 안내"
    A "NEW" chip in #fb7185 on the top two. Tapping a row opens a detail screen with
    an [IMG-SLOT] header area (aspect 16/9, height 96px), the title, a date line,
    and three paragraphs of plausible notice copy, plus a back chevron.
  SCREEN "Q&A" - a list of 4 question rows, each with a FICTIONAL question title,
    an answered/unanswered chip (VERBATIM "답변 완료" / "답변 대기"), and a date.
    Question titles VERBATIM:
      "장학금 신청 기간이 언제인가요"
      "학생회관 스터디룸 예약 방법"
      "동아리방 사용 시간 문의"
      "복지물품 신청은 어디서 하나요"
    A floating write button at the bottom-right, VERBATIM: "질문하기"
    (Tapping it is handled in a later section - here it simply shows a small toast,
     font-mono 10px, VERBATIM: "로그인이 필요합니다")
  SCREEN "소개" - a simple org section: a heading, a paragraph, and a 3-row list of
    departments with FICTIONAL names (VERBATIM "기획국" "복지국" "홍보국").
  SCREEN "복지" - a 2x2 grid of welfare cards, each with an icon area, a title and
    a one-line description. Titles VERBATIM:
      "생리용품 비치" "우산 대여" "공학용 계산기 대여" "제휴 할인"
  SCREEN "자료" - a file list of 5 rows, each with a file-type chip and a size,
    FICTIONAL names VERBATIM:
      "2학기 예산안" "회칙 개정안" "총회 자료집" "감사 보고서" "사업계획서"

SCREEN TRANSITIONS: switching tabs cross-fades the content in 0.2s while the
underline slides. Opening a detail slides in from the right (0.3s); back mirrors it.

A step readout beneath the device, font-mono 11px rgba(255,255,255,0.46),
format VERBATIM: "공지사항 · /notice"

=== BLOCK C RIGHT TOP: THE ROUTE MAP ===
Height ~250px, background #220e13, border 1px rgba(251,113,133,0.18),
rounded-md, padding 20px. Drawn in SVG.
A root node at the top, VERBATIM "/" (120x38px), with five children below it in a
row, each 96x36px, font-mono 10px:
  VERBATIM "/notice" "/qna" "/about" "/welfare" "/archive"
and below /notice and /qna, one child each:
  VERBATIM "/notice/:id" and "/qna/:id"
Connectors are 1.5px rgba(251,113,133,0.30) lines.
A CURRENT-POSITION marker (a rose pill) slides between nodes whenever the device
navigates, 0.3s spring. Visited nodes stay 60% lit.

=== BLOCK C RIGHT BOTTOM: THE ROUTER CODE ===
Height ~250px, background #180a0d, border 1px rgba(251,113,133,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "App.jsx"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~20 lines. A React Router configuration with a shared layout route
providing the header and navigation, five section routes as children, two nested
detail routes with an id parameter, and a catch-all route rendering a
not-found page.
HIGHLIGHT ROWS: the layout route and the catch-all route
(background rgba(251,113,133,0.12)).
AS THE DEVICE NAVIGATES, the matching route line highlights with a
rgba(251,113,133,0.14) background sweeping in over 0.25s - one line at a time.
Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
  "맨 아래 catch-all이 나중에 아주 중요해진다. 그 얘기는 다음 장에서."
This forward hook to the 404 section is required - keep it exactly.

=== BLOCK D: MEDIA SLOT ===
Margin-top 36px. A 2-up media row, gap 14px (stacks below 720px).
Each frame: aspect 16/10, rounded-md, border 1px rgba(251,113,133,0.18),
overflow hidden, with a caption bar beneath (padding 10px 14px, font-mono 11px
rgba(255,255,255,0.48)).
  [IMG-01] the real notice list screen    caption VERBATIM: "실제 공지사항 목록"
  [IMG-02] the real notice detail screen  caption VERBATIM: "실제 공지 상세"
Placeholder if no image: a CSS placeholder with a faint rose grid and centered text,
e.g. VERBATIM "[IMG-01] · 16:10".

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraphs 1 and 2, 0.5s apart
1.50s  The merge container fades up; the merge animation runs automatically once
3.90s  Device fades up; the 공지 screen populates 0.05s apart
4.40s  Route map draws; the marker lands on /notice
4.80s  Router code panel fades up
5.20s  A one-time pulse on the "Q&A" tab (a soft rose ring, 2 pulses of 0.9s) with a
       hint beneath the device, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "탭을 눌러 이동해보세요"
       Both disappear permanently once the viewer navigates.

=== PERFORMANCE ===
The merge animation runs once on entry and only replays on the control. All motion
uses transform and opacity only.

=== RESPONSIVE ===
< 1024px: stacked; the device is centered, route map and code sit below it side by
side, stacking again below 720px.
< 640px: device width 92vw, height 500px; merge container height 420px with the four
channel cards in a 2x2 layout; code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: the merge renders in its final state (site card + five
chips) with no travel; screens cross-fade with no slide; the route marker jumps.
Tabs must be a real tablist with proper roles, arrow-key navigable, with visible
focus rings (2px #fb7185, offset 2px). Every tappable row is a real button.
Announce screen changes ONCE via aria-live="polite" using the step readout copy.
Provide a visually-hidden ordered text version of the route map.

=== DO NOT ===
Do not change the real URL or the real browser history.
Do not use real notice titles, real Q&A contents, or real names.
Do not omit the catch-all forward hook in the code caption.
```

---

## PAGE 03 — 트러블슈팅 01 · 새로고침하면 404

**개발 실체**: SPA 배포 시 클라이언트 라우팅과 서버 라우팅의 충돌 → **Nginx 설정으로 해결하는 전 과정**
**연출 장치**: **관람객이 시뮬레이터의 새로고침 버튼을 누르면 진짜 404 화면이 뜬다.** 헤더 배지가 빨갛게 바뀐다.

```text
Build a TROUBLESHOOTING CASE FILE where the viewer navigates to a detail page inside
a simulated browser, presses reload, and lands on a 404 - reproducing the classic
SPA deployment bug - then follows the full diagnosis and the Nginx fix.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
Simulate the browser entirely - never touch the real URL, never make a real request.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the SPA-reload-404 bug:
symptom -> reproduction -> why it happens (client routing vs server routing) ->
the failed first attempt -> the Nginx fix -> verification -> the second-order
problem the fix creates. All seven parts required.

=== MOOD ===
The specific cold feeling of a service breaking the moment real people use it.
Rose turning red, then methodical.

=== COMPLIANCE ===
All notice titles are FICTIONAL. Never make a real network request or produce a real
404 on any real domain.

=== DESIGN TOKENS (use exactly) ===
background #160709 | panel #220e13 | paper #2a1418
primary rose #fb7185 | accent #fda4af
live #4ade80 | down #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #180a0d, border rgba(251,113,133,0.18)
terminal bg #0f0709, prompt #4ade80, output rgba(255,255,255,0.72)
syntax: comments #8a5a63, strings #a3e635, keywords #fb7185, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1040px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE BROWSER SIMULATOR - full width, height ~500px
  Block C : the request-path diagram (why it happens)
  Block D : the failed attempt
  Block E : the Nginx fix code
  Block F : verification + the second-order problem

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "02 · 트러블슈팅 01"

HEADING (30px font-black):
  VERBATIM: "배포 첫날, 공지 링크를 누른 학생은 404를 봤다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "사이트 안에서 눌러서 들어가면 잘 됐다. 그런데 그 상태에서 새로고침하면 404였다.
   공지 링크를 복사해서 카톡에 보내면 받은 사람도 404를 봤다.
   내 컴퓨터에서는 한 번도 안 났던 문제였다."

=== BLOCK B: THE BROWSER SIMULATOR (the defining idea) ===
Margin-top 36px. A container styled as a browser window, rounded-lg,
border 1px rgba(251,113,133,0.20), background #180a0d, overflow hidden.

CHROME BAR (44px, background #220e13,
border-bottom 1px rgba(251,113,133,0.14)):
  - Three window dots on the left
  - Back / forward buttons
  - A RELOAD BUTTON: a 30px circular button with a "↻" glyph, font-mono 15px.
    THIS IS THE MOST IMPORTANT CONTROL ON THE PAGE.
  - THE ADDRESS BAR: flex-1, height 28px, background rgba(255,255,255,0.05),
    border 1px rgba(255,255,255,0.10), rounded-full, padding 0 14px,
    font-mono 11px rgba(255,255,255,0.70), showing the simulated URL.
  - On the right, a SERVER STATE chip, font-mono 10px, showing which configuration
    is active, VERBATIM: "nginx · 기본 설정"

A MODE TOGGLE above the browser window, right-aligned, font-mono 11px, two options:
  VERBATIM "수정 전"  |  VERBATIM "수정 후"
Default: 수정 전.

VIEWPORT (height ~400px): the mini notice site from the previous section.
The viewer can tap a notice row to open its detail; the address bar updates to
VERBATIM "ajouchong.app/notice/12" and the detail screen renders.

PRESSING RELOAD, IN "수정 전" MODE (the bug):
  t=0.00s  The viewport goes blank white-ish (a 0.12s flash to
           rgba(255,255,255,0.06) - a page-load blink, NOT a full-screen white flash)
  t=0.15s  A raw server 404 page renders, deliberately UGLY and unstyled - white
           background, black serif text, left-aligned, exactly as a bare Nginx error
           page looks:
             a heading VERBATIM: "404 Not Found"
             a horizontal rule
             a small line VERBATIM: "nginx"
           This visual break from the site's design is the entire point. It must
           look like the app is gone, not like a designed error screen.
  t=0.30s  THE HEADER'S LIVE BADGE turns #f87171 and reads VERBATIM "○ 서비스 중단"
  t=0.60s  A red annotation appears over the address bar, font-mono 10px #f87171,
           VERBATIM: "이 주소를 서버는 모른다"
  t=0.90s  A message fades in below the browser, max-width 480px, 17px leading-9:
             Line 1, rgba(255,255,255,0.88), VERBATIM:
               "배포 첫날, 학생들이 링크를 눌렀을 때 본 화면입니다."
             Line 2, #f87171, font-bold, margin-top 8px, VERBATIM:
               "제 컴퓨터에서는 한 번도 안 나던 화면이었습니다."
  The badge returns to green after 6 seconds or when the viewer navigates again.

PRESSING RELOAD, IN "수정 후" MODE:
  The same blink, then the DETAIL PAGE renders correctly at the same address.
  A green annotation over the address bar, font-mono 10px #4ade80,
  VERBATIM: "서버가 index.html을 내려주고, 라우팅은 앱이 처리"
  The server state chip reads VERBATIM: "nginx · try_files 적용"
  The header badge never turns red.

A SHARE TEST inside the simulator: a button in the chrome bar, font-mono 11px,
VERBATIM: "링크 열어보기 (새 탭)"
  In 수정 전 it opens a second simulated tab that ALSO shows the 404 - proving the
  problem is not about client state but about the server.
  In 수정 후 it opens the correct page.

A note beneath the container, font-mono 9px rgba(255,255,255,0.32), VERBATIM:
  "재현용 시뮬레이터입니다. 실제 요청을 보내지 않습니다."

=== BLOCK C: THE REQUEST PATH DIAGRAM (why it happens) ===
Margin-top 44px, padding 24px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05).
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인 · 요청이 가는 길"
  A horizontal SVG diagram, height ~180px, with TWO parallel tracks:

  TRACK 1 - label VERBATIM: "사이트 안에서 클릭"
    Four nodes: VERBATIM "브라우저" -> "React Router" -> "화면 교체" -> "완료"
    All connectors in #4ade80 at 45%. A green check at the end.
    Annotation beneath, font-mono 9px rgba(255,255,255,0.46), VERBATIM:
      "서버에 아무것도 안 물어본다"

  TRACK 2 - label VERBATIM: "주소창에 직접 입력 · 새로고침"
    Four nodes: VERBATIM "브라우저" -> "서버(nginx)" -> "/notice/12 파일 찾기" -> "없음"
    Connectors in #f87171 at 50%. A red ✕ at the end.
    Annotation, font-mono 9px #f87171, VERBATIM:
      "그런 이름의 파일은 서버에 존재하지 않는다"

  Nodes draw left to right, 0.12s apart, track 1 first then track 2.
  Below the diagram, body 16px leading-8, VERBATIM:
  "SPA에서 주소는 파일 경로가 아니라 앱 내부의 상태다.
   그런데 브라우저가 새로고침을 하면 그 주소를 그대로 서버에 물어본다.
   서버 입장에서는 있지도 않은 파일을 달라는 요청이니 404가 맞다.
   서버가 틀린 게 아니라, 서버에게 「이건 전부 앱한테 넘겨라」라고 말해준 적이 없었다."
  Emphasize "서버가 틀린 게 아니라" in #fbbf24, font-bold.

=== BLOCK D: THE FAILED ATTEMPT (required - do not remove) ===
Margin-top 36px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "먼저 시도했다가 실패한 것"
  Body 15px leading-8, VERBATIM:
  "라우터를 해시 방식으로 바꾸면 된다는 글을 보고 그렇게 고쳤다.
   주소에 # 이 들어가니 서버가 그 뒤를 안 보게 돼서 404는 사라졌다.
   그런데 공지 주소가 지저분해졌고, 이미 배포된 링크들이 전부 깨졌다.
   증상은 없앴는데 원인은 그대로 둔 셈이라, 되돌리고 서버 설정을 고치기로 했다."
  Emphasize "증상은 없앴는데 원인은 그대로 둔 셈" in #fbbf24, font-bold.

=== BLOCK E: THE NGINX FIX CODE ===
Margin-top 40px. Two panels side by side, gap 16px (stack below 1024px).

  LEFT panel - border 1px rgba(248,113,113,0.28), background #180a0d, rounded-md,
    header three window dots + filename, font-mono 11px rgba(255,255,255,0.45),
    VERBATIM: "nginx.conf (before)"
    CONTENT: ~10 lines. A server block serving a root directory with a plain
    location that only serves matching files, and nothing else.
    HIGHLIGHT the bare location line with rgba(248,113,113,0.12) and an inline
    marker at its right edge, font-mono 10px #f87171,
    VERBATIM: "← 파일이 없으면 그냥 404"

  RIGHT panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "nginx.conf (after)"
    CONTENT: ~16 lines. The same server block, now with a location that attempts
    the requested URI, then the URI as a directory, and finally falls back to
    index.html so the SPA can handle the route; plus a separate location for the
    hashed static asset directory with a long cache lifetime, and an explicit rule
    that index.html itself must NOT be cached.
    HIGHLIGHT the fallback line and the no-cache-for-index line with
    rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "# ", VERBATIM:
      "# 없는 경로는 전부 앱에게 넘긴다. 대신 진짜 404는 앱이 그린다."

BELOW BOTH PANELS, a small terminal block: background #0f0709,
border 1px rgba(251,113,133,0.16), rounded-md, padding 14px, font-mono 11px,
showing three lines - a config test command with an OK response, a reload command,
and a curl-style check of the detail URL returning 200. Prompt characters in
#4ade80, output in rgba(255,255,255,0.72).
A caption beneath, font-mono 10px rgba(255,255,255,0.35), VERBATIM:
  "설정을 바꾼 뒤에는 문법 검사부터 하고 리로드했습니다"

--- MEDIA SLOT ---
Margin-top 28px. A wide media frame, aspect 21/9, rounded-md,
border 1px rgba(251,113,133,0.18), overflow hidden.
  [IMG-03] a real capture: the deployed notice detail page loaded directly from the
  address bar (so the URL is visible and the page renders correctly).
  Caption bar beneath, padding 10px 14px, font-mono 11px rgba(255,255,255,0.48),
  VERBATIM: "실제 화면 · 주소를 직접 입력해서 열었을 때"
  Placeholder if no image: VERBATIM "[IMG-03] · 21:9 · 주소창이 보이는 캡처"
  This capture is the cheapest possible proof of the whole section - prioritize it.

=== BLOCK F: VERIFICATION + THE SECOND-ORDER PROBLEM ===
Margin-top 40px.
Three stat cells in a row, gap 12px (stacks below 640px). Each: padding 16px,
rounded-md, border 1px rgba(74,222,128,0.22), background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "200"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "상세 주소 직접 접근"
  Cell 2  value VERBATIM "정상"  label VERBATIM "새로고침 · 링크 공유"
  Cell 3  value VERBATIM "유지"  label VERBATIM "기존에 공유된 링크"
Values fade in on entry.
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "배포 후 주요 경로를 직접 눌러 확인했습니다. 자동화된 점검은 없습니다."

Then the second-order problem card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(251,191,36,0.28), background rgba(251,191,36,0.05).
  Label font-mono 10px letter-spacing 0.18em #fbbf24,
  VERBATIM: "이 수정이 만든 새 문제"
  Body 15px leading-8, VERBATIM:
  "모든 경로를 index.html로 넘기니, 진짜로 없는 주소도 200을 반환하게 됐다.
   오타 난 주소로 들어와도 서버는 「정상」이라고 답한다.
   그래서 앱 쪽에 catch-all 라우트를 두고 앱이 직접 없는 페이지 화면을 그리도록 했다.
   상태 코드까지 정확히 맞추려면 서버가 앱의 경로 목록을 알아야 하는데,
   거기까지는 하지 않았다."
  Emphasize "진짜로 없는 주소도 200을 반환하게 됐다" in #fbbf24, font-bold.
  This is required - it shows the fix was understood, not copied.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left (x -12px -> 0)
1.10s  The browser simulator fades up; its chrome draws, then the notice list
       populates 0.04s apart
1.90s  A one-time sequence of hints: first a rose pulse on the first notice row with
       a hint above the chrome bar, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "공지를 하나 열어보세요"
       then, once a detail is open, the hint changes to
       VERBATIM: "이제 새로고침을 눌러보세요" and the reload button pulses in red.
       Hints disappear permanently after the reload is pressed.
All later blocks animate on their own viewport entry.

=== RESPONSIVE ===
< 1024px: nginx panels stack (before on top).
< 720px: the request-path diagram stacks its two tracks vertically.
< 640px: the address bar truncates in the middle (never hide the path segment);
code and terminal font 11px with internal horizontal scroll (blocks scroll, never
the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no page-load blink, no button pulses; the 404 appears
instantly.
The reload button, mode toggle, and every notice row must be real controls with
visible focus rings (2px #fb7185, offset 2px) and accessible names.
Announce the outcome ONCE via aria-live="polite":
  수정 전 VERBATIM: "새로고침 후 404 페이지가 표시되었습니다."
  수정 후 VERBATIM: "새로고침 후 공지 상세 화면이 정상적으로 표시되었습니다."
The simulated 404 page must be real text, not an image.
The header badge's state change must not rely on color alone - its text also changes.

=== DO NOT ===
Do not make any real network request or navigate the real browser.
Do not style the simulated 404 - its ugliness is the point.
Do not use a full-screen white flash; the load blink is a 0.12s low-alpha tint.
Do not remove the failed attempt or the second-order problem card.
```

---

## PAGE 04 — 게시판이 뒤집힌다 · Docker와 Nginx 배포

**개발 실체**: **Docker + Nginx 배포 파이프라인 전체** — 이 프로젝트의 최대 차별점
**연출 장치**: 게시판이 Y축으로 회전해 **뒷면의 파이프라인이 드러나고**, 관람객이 `배포하기` 를 눌러 4단계를 직접 돌린다

```text
Build a DEPLOYMENT PIPELINE section where the notice board flips over on its Y axis
to reveal the build-and-deploy pipeline on its back, and the viewer runs a simulated
four-stage deployment while the matching configuration file lights up at each stage.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
Nothing is actually executed - this is a pure UI simulation.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The complete path from source code to a page a student can open
2. What each stage does and why it exists
3. The actual Dockerfile and nginx configuration, in the context of the stage that
   uses them
4. Why a multi-stage build was chosen

=== MOOD ===
The back of the notice board - the part students never see. Rose light on metal
brackets and cables. Mechanical, satisfying, competent.

=== COMPLIANCE ===
Do not execute anything. Do not show real secrets, tokens, server addresses,
usernames, or ports beyond a generic example.

=== DESIGN TOKENS (use exactly) ===
background #160709 | panel #220e13 | paper #2a1418
primary rose #fb7185 | accent #fda4af
live #4ade80 | down #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #180a0d, border rgba(251,113,133,0.18)
terminal bg #0f0709, prompt #4ade80, output rgba(255,255,255,0.72)
syntax: comments #8a5a63, strings #a3e635, keywords #fb7185, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + terminal font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1140px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE FLIPPING BOARD - full width, height ~600px, perspective 1400px
  Block C : the multi-stage build decision card
  Block D : media slot

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "03 · 배포"

HEADING (28px font-black):
  VERBATIM: "내 노트북에서 도는 것과, 학생이 열 수 있는 것 사이"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "개발 서버에서는 명령어 하나면 됐다.
             그런데 그 화면을 누군가 주소로 열 수 있게 만드는 일은 완전히 다른 작업이었고,
             솔직히 이 프로젝트에서 제일 오래 붙잡은 부분이었다."
  Emphasize "완전히 다른 작업이었고" in #fda4af, font-bold.

=== BLOCK B: THE FLIPPING BOARD (the defining idea) ===
A container with perspective 1400px, height ~600px.
Inside it, a BOARD element with transform-style preserve-3d, containing a FRONT face
and a BACK face (backface-visibility hidden on both).

FRONT FACE: the notice board as seen elsewhere - cork texture, a few pinned notices,
the site's live badge. Centered on it, a call to action:
  a button, font-mono 13px font-black, padding 12px 26px, rounded-md,
  border 1px rgba(251,113,133,0.45), color #fb7185,
  background rgba(251,113,133,0.06),
  VERBATIM: "게시판 뒤를 보시겠습니까?"
  with a sub-line beneath, font-mono 10px rgba(255,255,255,0.40),
  VERBATIM: "이 화면이 어떻게 여기까지 왔는지"

THE FLIP: on pressing the button (or on scrolling 60% into the section, whichever
comes first), the board rotates on its Y axis from 0 to 180deg over 1.1s with the
standard easing, with a subtle shadow shift so it reads as a physical object turning.
Sound: none.

BACK FACE: the deployment pipeline. Background #1c0b0f with a faint metal-bracket
motif (thin rose lines forming a frame).

  A DEPLOY BUTTON at the top-center: font-mono 13px font-black, padding 11px 26px,
  rounded-md, background #fb7185, color #160709, VERBATIM: "배포하기"
  Beside it, a small state chip, font-mono 10px, VERBATIM: "대기 중"

  FOUR STAGE CARDS in a horizontal row (vertical below 900px), connected by rails.
  Each card: 220x150px, background #220e13, border 1px rgba(251,113,133,0.20),
  rounded-md, padding 16px, with a stage number in font-mono 10px
  rgba(255,255,255,0.35) at the top-left, a title in font-mono 12px
  rgba(255,255,255,0.86), a one-line description in 11px leading-6
  rgba(255,255,255,0.50), and a status dot at the top-right.
  Stages VERBATIM:
    1  title "빌드"        desc "React 소스를 정적 파일로 컴파일"
    2  title "이미지 생성"  desc "정적 파일 + nginx를 하나의 이미지로"
    3  title "컨테이너 교체" desc "기존 컨테이너를 내리고 새 것을 올림"
    4  title "확인"        desc "주요 경로가 200을 반환하는지 확인"

  THE RUN SEQUENCE (on pressing 배포하기):
    Each stage takes 1.1s. During a stage:
      - its card's border goes to #fbbf24 and its status dot pulses amber
      - a progress bar fills across the card's bottom edge over the stage duration
      - THE TERMINAL below prints that stage's lines, one every 0.18s, typing at
        ~60 chars/sec
      - THE CODE PANEL to the right switches to the file relevant to that stage and
        highlights the relevant lines
    On completion the card's border turns #4ade80, its dot goes solid green, and a
    check mark scales in.
    A packet dot travels along the rail to the next stage over 0.25s.
    After stage 4, the state chip reads VERBATIM: "배포 완료" in #4ade80, a total
    elapsed readout appears in font-mono 11px tabular-nums, format VERBATIM:
    "총 소요 1분 42초" and a line fades in beneath the stages, font-mono 11px
    rgba(255,255,255,0.55), VERBATIM: "이제 학생이 주소를 열면 이 화면이 나옵니다"
    A replay control appears, font-mono 11px, VERBATIM: "↻ 다시 배포"

  THE TERMINAL (bottom-left of the back face, ~48% width, height ~180px):
    background #0f0709, border 1px rgba(251,113,133,0.16), rounded-md, padding 14px,
    font-mono 11px, line-height 1.8, with internal scroll that auto-follows.
    Prompt characters in #4ade80, commands in rgba(255,255,255,0.86),
    output in rgba(255,255,255,0.72), success markers in #4ade80,
    warnings in #fbbf24.
    Content per stage (write realistic but GENERIC lines - no real hostnames,
    no credentials):
      Stage 1: an install step, a build step, a bundle summary with file sizes
      Stage 2: docker build steps by layer, an image tag line, an image size line
      Stage 3: stopping the old container, starting the new one, a container id
      Stage 4: three status checks against the root, a notice path and a nested
               detail path, all returning 200
    Include ONE amber warning line during stage 1 (a bundle-size note) so the log
    does not look artificially clean.

  THE CODE PANEL (bottom-right of the back face, ~48% width, height ~180px):
    background #180a0d, border 1px rgba(251,113,133,0.18), rounded-md.
    Header bar with three window dots and a filename that CHANGES with the stage,
    font-mono 11px rgba(255,255,255,0.45):
      stage 1-2 VERBATIM: "Dockerfile"
      stage 3   VERBATIM: "docker-compose.yml"
      stage 4   VERBATIM: "nginx.conf"
    Body: font-mono 12px with a line-number gutter, cross-fading between files over
    0.25s when the stage changes.
    Dockerfile CONTENT: a multi-stage build - a first stage on a node base image
    that installs dependencies and runs the production build, and a second stage on
    a lightweight nginx base image that copies only the built output from the first
    stage and the site configuration, then exposes the http port.
    HIGHLIGHT during stage 1: the install and build lines.
    HIGHLIGHT during stage 2: the copy-from-first-stage line and the final base
    image line.
    docker-compose CONTENT: a single service definition with the built image, a
    restart policy, a port mapping, and a mounted configuration file.
    HIGHLIGHT during stage 3: the restart policy and the port mapping.
    nginx.conf CONTENT: the same server block as the previous section, with the
    SPA fallback.
    HIGHLIGHT during stage 4: the fallback line.

  A note at the back face's bottom, font-mono 9px rgba(255,255,255,0.32), VERBATIM:
    "시연용 시뮬레이션입니다. 실제로 명령을 실행하지 않습니다."

A FLIP-BACK control at the back face's top-left, font-mono 11px
rgba(255,255,255,0.46), VERBATIM: "← 앞면으로"

=== BLOCK C: THE MULTI-STAGE BUILD DECISION CARD ===
Margin-top 48px, padding 24px, rounded-md, border 1px rgba(251,113,133,0.24),
background rgba(251,113,133,0.04), border-left 3px #fb7185.
  Label font-mono 11px letter-spacing 0.2em #fb7185, VERBATIM: "왜 멀티 스테이지인가"
  Body, two paragraphs at 16px leading-9:
    P1 VERBATIM:
      "처음엔 node 이미지 하나에 소스를 통째로 넣고 개발 서버를 띄웠다.
       동작은 했다. 이미지가 1GB 가까이 됐고, 소스 코드가 서버에 그대로 올라갔고,
       개발 서버는 원래 그렇게 쓰라고 만든 게 아니었다."
    P2 VERBATIM:
      "빌드하는 단계와 서비스하는 단계를 나누고 나니, 최종 이미지에는
       빌드 결과물과 nginx만 남았다. 이미지가 훨씬 작아졌고,
       서버에는 소스 코드가 아예 없다."
    Emphasize "서버에는 소스 코드가 아예 없다" in #4ade80, font-bold.
  A comparison strip beneath, two small cells side by side, font-mono 11px:
    LEFT  label VERBATIM "단일 스테이지"  value VERBATIM "node 이미지 · 소스 포함"
    RIGHT label VERBATIM "멀티 스테이지"  value VERBATIM "nginx 이미지 · 결과물만"
  A note, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
    "정확한 이미지 용량은 기록해두지 않았습니다. 체감상 크게 줄었다는 정도까지만 말씀드립니다."
  This refusal to invent a number is required.

=== BLOCK D: MEDIA SLOT ===
Margin-top 36px. A 2-up media row, gap 14px (stacks below 720px).
Each frame: aspect 16/10, rounded-md, border 1px rgba(251,113,133,0.18),
overflow hidden, with a caption bar beneath (padding 10px 14px, font-mono 11px
rgba(255,255,255,0.48)).
  [IMG-04] a real terminal capture of the build/deploy output
           caption VERBATIM: "실제 배포 로그"
  [IMG-05] a real capture of the running container list or the server state
           caption VERBATIM: "실행 중인 컨테이너"
Placeholder if no image: VERBATIM "[IMG-04] · 16:10 · 배포 로그 캡처"
  🔴 캡처 전 확인: 실제 서버 주소·사용자명·토큰이 화면에 없어야 합니다.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  The board fades up showing its FRONT face
1.80s  A one-time pulse on the "게시판 뒤를 보시겠습니까?" button (a soft rose ring,
       2 pulses of 0.9s). It disappears permanently once pressed or once the
       scroll-triggered flip fires.
After the flip: a one-time pulse on the 배포하기 button with a hint beneath,
font-mono 10px rgba(255,255,255,0.35), VERBATIM: "직접 배포해보세요"

=== PERFORMANCE ===
The flip and all stage animations use transform and opacity only. The terminal must
cap its retained lines (about 40) and reuse nodes rather than growing unbounded.
Stop all animation when the container is out of the viewport or the tab is hidden.

=== RESPONSIVE ===
< 900px: the four stage cards stack vertically with vertical rails; the terminal and
code panel stack beneath them; board height auto (min 900px).
< 640px: stage cards full width at 120px height; terminal height 150px;
code font 11px with internal horizontal scroll (blocks scroll, never the page).
On touch, the flip is triggered by the button only (not by scroll) to avoid
surprising the viewer mid-scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: NO 3D flip - the front face cross-fades to the back face in
0.2s. No stage progress animation; pressing 배포하기 completes all four stages
instantly with the full terminal log rendered at once.
The flip button, deploy button, and flip-back control must be real buttons with
visible focus rings (2px #fb7185, offset 2px).
Announce deployment completion ONCE via aria-live="polite", VERBATIM:
  "배포가 완료되었습니다. 네 단계 모두 성공했습니다."
Do NOT make the terminal an aria-live region - it would flood a screen reader.
Mark it aria-hidden and provide a visually-hidden per-stage summary instead.
Stage status must not rely on color alone - each card also shows a text state
(VERBATIM "대기" / "진행 중" / "완료").

=== DO NOT ===
Do not execute any command.
Do not show real hostnames, IPs, ports beyond a generic example, usernames, tokens,
or environment values.
Do not invent an exact image size or build time improvement - the note refusing to
do so must stay.
Do not omit the amber warning line in the stage 1 log.
```

---

## PAGE 05 — 로그인해야 쓸 수 있다 · AuthContext와 보호 라우트

**개발 실체**: Context 기반 로그인 상태 관리 + 보호 라우트 + Q&A 작성 흐름
**연출 장치**: **관람객이 로그인 없이 질문 작성을 시도 → 막힘 → 로그인 → 원래 자리로 복귀**

```text
Build an AUTHENTICATION section where the viewer attempts to write a Q&A post
without being logged in, gets redirected, logs in, and is returned to exactly where
they were - with the AuthContext and protected-route code shown alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
Simulate everything locally - no real auth, no real requests, no data collection.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. Why login exists here at all (a narrow, concrete reason)
2. How login state is shared across the app without prop drilling
3. The protected-route behaviour including return-to-origin
4. The honest boundary: what the frontend can and cannot guarantee

=== MOOD ===
The Q&A corner of the notice board. Rose light, a pen on a string, a sign-in sheet.
Orderly and a little bureaucratic in a good way.

=== COMPLIANCE ===
All questions, answers and names are FICTIONAL. The login form is presentational
only and must never collect, store, or echo any input.

=== DESIGN TOKENS (use exactly) ===
background #160709 | panel #220e13 | paper #2a1418
primary rose #fb7185 | accent #fda4af
live #4ade80 | down #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #180a0d, border rgba(251,113,133,0.18)
syntax: comments #8a5a63, strings #a3e635, keywords #fb7185, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1120px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : a two-column split, gap 20px
              LEFT  (50%) : THE DEVICE, height 560px
              RIGHT (50%) : the state diagram (top) + two code panels (bottom)
            Below 1024px stacks, device first.
  Block C : the honest boundary card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "04 · 로그인과 보호 라우트"

HEADING (28px font-black):
  VERBATIM: "읽는 건 누구나, 쓰는 건 학생만"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "공지와 복지 정보는 로그인 없이 다 볼 수 있어야 했다.
             학교 정보를 보려고 가입부터 하라는 건 말이 안 되니까.
             대신 Q&A에 글을 쓰는 건 재학생만 가능해야 했다.
             그 경계 하나 때문에 로그인 상태를 앱 전체가 알아야 했다."
  Emphasize "그 경계 하나 때문에" in #fda4af, font-bold.

=== BLOCK B LEFT: THE DEVICE (must actually run the flow) ===
A device frame: width ~400px, height 560px, rounded-2xl, border 8px solid #2b1116,
background #180a0d, with a 14px notch bar.
A LOGIN STATE CHIP sits above the device, font-mono 11px, showing the simulated
auth state and letting the viewer reset it:
  logged out VERBATIM: "○ 로그아웃 상태"  (rgba(255,255,255,0.46))
  logged in  VERBATIM: "● 로그인 상태"     (#4ade80)
plus a reset link, font-mono 11px, VERBATIM: "↻ 로그아웃"

THE FLOW (five states inside the device):

  STATE 1 - Q&A LIST
    A top bar VERBATIM "Q&A", then 4 question rows (FICTIONAL), each with a title,
    an answered chip and a date. Titles VERBATIM:
      "장학금 신청 기간이 언제인가요"
      "학생회관 스터디룸 예약 방법"
      "동아리방 사용 시간 문의"
      "복지물품 신청은 어디서 하나요"
    A floating action button at the bottom-right, background #fb7185,
    color #160709, VERBATIM: "질문하기"

  STATE 2 - BLOCKED (when logged out and 질문하기 is pressed)
    t=0.00s  The FAB presses in; a rose ripple expands
    t=0.15s  The screen slides left and out; a login screen slides in from the right
    t=0.30s  The login screen shows:
               a title, font-black 16px, VERBATIM: "로그인이 필요합니다"
               a sub-line, font-mono 11px rgba(255,255,255,0.46), VERBATIM:
                 "질문 작성은 재학생만 가능합니다"
               a presentational id/password pair (NEVER collecting input) and a
               button VERBATIM: "로그인"
    t=0.50s  A chip appears at the bottom, font-mono 10px #fbbf24, VERBATIM:
               "돌아갈 곳: 질문 작성"
             This chip is the visible proof that the attempted destination was
             remembered - it must be present.

  STATE 3 - LOGGED IN, RETURNED
    Pressing 로그인 sets the simulated auth state, slides the login screen out, and
    lands DIRECTLY on the write screen (not the Q&A list, not the home screen).
    A green chip appears for 2.5s, font-mono 10px #4ade80, VERBATIM:
      "원래 가려던 화면으로 돌아왔습니다"

  STATE 4 - WRITE SCREEN
    A form with a title field, a body field and a submit button VERBATIM "등록".
    All fields are presentational: they show placeholder text and do not accept or
    retain input. A note beneath, font-mono 9px rgba(255,255,255,0.35), VERBATIM:
      "시연용 화면입니다 · 입력을 받지 않습니다"

  STATE 5 - SUBMITTED
    A success panel with a check mark, VERBATIM "질문이 등록되었습니다", and the new
    question appearing at the top of the Q&A list when going back, marked with a
    VERBATIM "답변 대기" chip.

IF THE VIEWER IS ALREADY LOGGED IN, pressing 질문하기 goes straight to STATE 4 -
show that too, so the contrast is visible. The state chip above the device makes it
easy to toggle and re-run.

A step readout beneath the device, font-mono 11px rgba(255,255,255,0.46),
which changes per state, e.g. VERBATIM: "1 / 5 · Q&A 목록"

=== BLOCK B RIGHT TOP: THE STATE DIAGRAM ===
Height ~220px, background #220e13, border 1px rgba(251,113,133,0.18),
rounded-md, padding 20px. Drawn in SVG.
Five nodes connected by labeled arrows:
  VERBATIM "Q&A 목록" -> "질문 작성 시도" -> "로그인" -> "질문 작성" -> "등록 완료"
with a BYPASS arrow curving from "질문 작성 시도" directly to "질문 작성", labeled
font-mono 9px #4ade80, VERBATIM: "이미 로그인한 경우"
and a RETURN arrow from "로그인" back up, labeled font-mono 9px #fbbf24,
VERBATIM: "가려던 곳 기억"
The node matching the device's current state lights up (border #fb7185,
background rgba(251,113,133,0.12)) and the marker slides between them, 0.3s.

=== BLOCK B RIGHT BOTTOM: TWO CODE PANELS ===
Stacked, gap 14px, each ~160px tall with internal scroll.
Each: background #180a0d, border 1px rgba(251,113,133,0.18), rounded-md, header with
three window dots and a filename, body font-mono 12px with a line-number gutter.

  TOP - filename VERBATIM: "AuthContext.jsx"
    CONTENT: ~18 lines. A context provider holding the current user (or null), a
    login function, a logout function, and a loading flag while the session is being
    restored on first mount; the value object memoized so consumers do not re-render
    on every provider render; and a small hook that throws a clear error when used
    outside the provider.
    HIGHLIGHT: the memoized value line and the loading flag.
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "초기 확인 중에 「로그아웃」으로 판단하면, 새로고침할 때마다 튕긴다"

  BOTTOM - filename VERBATIM: "RequireAuth.jsx"
    CONTENT: ~14 lines. A wrapper component that reads the auth context, renders a
    placeholder while the session is still loading, redirects to the login route
    while passing the current location along when there is no user, and otherwise
    renders its children.
    HIGHLIGHT: the loading branch and the line carrying the current location.
    Caption bar, VERBATIM:
      "어디로 가려 했는지를 같이 넘겨야 로그인 후 홈으로 안 떨어진다"

AS THE DEVICE MOVES THROUGH STATES, the relevant code panel's highlighted rows
flash (rgba(251,113,133,0.14), 0.3s sweep, fading after 1.2s):
  attempting to write while logged out -> RequireAuth's redirect line
  logging in                            -> AuthContext's login-related line
  returning                             -> RequireAuth's location line

=== BLOCK C: THE HONEST BOUNDARY CARD ===
Margin-top 44px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 11px letter-spacing 0.2em #fbbf24, VERBATIM: "분명히 해둘 것"
  Body 15px leading-8, VERBATIM:
  "프론트에서 막는 건 「실수로 들어가는 것」을 막는 것이지 보안이 아니다.
   개발자 도구로 상태를 바꾸면 작성 화면은 열린다.
   실제로 막히는 건 서버가 요청을 거절할 때이고, 그건 백엔드 담당이 처리했다.
   내가 한 건 그 경계에 맞춰 화면 흐름을 만든 부분까지다."
  Emphasize "프론트에서 막는 건 「실수로 들어가는 것」을 막는 것이지 보안이 아니다"
  in #fbbf24, font-bold.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  Device fades up; the Q&A list populates 0.06s apart
1.80s  State diagram draws its nodes left to right 0.1s apart; the marker lands on
       the first node
2.30s  Both code panels fade up
2.80s  A one-time pulse on the 질문하기 button (a soft rose ring, 2 pulses of 0.9s)
       with a hint beneath the device, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "로그아웃 상태로 질문을 써보세요"
       Both disappear permanently once the button is pressed.

=== RESPONSIVE ===
< 1024px: stacked; device centered, diagram and code panels below.
< 640px: device width 92vw, height 520px; the state diagram becomes a vertical list
of steps; code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: screens cross-fade in 0.15s instead of sliding; the diagram
marker jumps; no button pulse.
Every control inside the device is a real button with an accessible name and a
visible focus ring (2px #fb7185, offset 2px). The device is fully keyboard operable.
The presentational login and write fields must be aria-hidden with a visually-hidden
note, VERBATIM: "시연용 화면이며 입력을 받지 않습니다."
Announce state changes ONCE via aria-live="polite" using the step readout copy.

=== DO NOT ===
Do not implement real authentication or make any network request.
Do not collect, store, or echo any input in the login or write forms.
Do not claim the frontend enforces access control - the boundary card must stay.
Do not use real questions, answers, or names.
```

---

## PAGE 06 — 트러블슈팅 02 · 배포는 성공했는데 화면이 안 바뀐다

**개발 실체**: 정적 자산 캐시로 인한 갱신 실패 → **해시 파일명 + Cache-Control 전략**
**연출 장치**: **관람객이 `다시 배포` 를 눌러도 화면이 그대로다.** 파이프라인은 초록불인데.

```text
Build a TROUBLESHOOTING section where the viewer runs a deployment that succeeds
completely - every stage green - and yet the visitor-facing screen still shows the
old version, then follows the full diagnosis of the caching problem and its fix.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
Nothing is executed; everything is simulated locally.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the stale-cache-after-deploy bug:
symptom -> reproduction (the deploy succeeds but the screen does not change) ->
elimination of suspects -> root cause -> the fix (hashed asset filenames + a
differentiated cache policy) -> verification -> remaining limits.
All seven parts required.

=== MOOD ===
The uniquely maddening state where every indicator says success and the actual
result is wrong. Rose with amber warning, then resolved.

=== COMPLIANCE ===
Nothing is executed. No real hostnames, tokens, or credentials.

=== DESIGN TOKENS (use exactly) ===
background #160709 | panel #220e13 | paper #2a1418
primary rose #fb7185 | accent #fda4af
live #4ade80 | down #f87171 | warn #fbbf24 | stale #64748b
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #180a0d, border rgba(251,113,133,0.18)
terminal bg #0f0709, prompt #4ade80, output rgba(255,255,255,0.72)
syntax: comments #8a5a63, strings #a3e635, keywords #fb7185, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + terminal font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1060px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE PARADOX DEMO - full width, height ~460px
  Block C : elimination table
  Block D : root cause (a cache lifecycle diagram)
  Block E : the fix (asset naming + cache headers)
  Block F : verification + remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "05 · 트러블슈팅 02"

HEADING (30px font-black):
  VERBATIM: "배포는 성공했습니다. 학생들 화면만 안 바뀌었습니다."

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "공지 하나를 급하게 수정해서 배포했다. 배포는 전부 초록불이었다.
   내 브라우저에서 확인하니 잘 바뀌어 있었다.
   그런데 「저는 아직 옛날 거 보여요」라는 연락이 왔다.
   시크릿 모드로 열어보니 그제서야 새 화면이 나왔다."

=== BLOCK B: THE PARADOX DEMO (the defining idea) ===
Margin-top 36px. A container, height ~460px, rounded-md,
border 1px rgba(251,113,133,0.20), background #220e13, padding 22px.

A MODE TOGGLE at the top-right, font-mono 11px, two options:
  VERBATIM "수정 전"  |  VERBATIM "수정 후"
Default: 수정 전.

TWO PANELS side by side (stack below 900px):

  LEFT PANEL (~46%) - THE DEPLOY SIDE
    A compact version of the four-stage pipeline from the previous section:
    four small stage chips in a vertical list, each with a status dot.
    A deploy button at the top, font-mono 12px font-black, padding 10px 22px,
    rounded-md, background #fb7185, color #160709, VERBATIM: "다시 배포"
    Below the stages, a compact terminal (height ~130px) printing an abbreviated
    successful log.
    A result chip at the bottom, font-mono 12px, VERBATIM: "배포 성공" in #4ade80
    with a check mark.

  RIGHT PANEL (~54%) - THE VISITOR SIDE
    A small browser frame with an address bar showing the deployed site and a
    viewport rendering the notice detail page.
    At the top of the viewport, a VERSION MARKER band, font-mono 11px, showing which
    build the visitor is seeing, format VERBATIM: "표시 중인 버전: v12"
    Below it, the notice content, whose TITLE differs between versions:
      v12 title VERBATIM: "학생회관 리모델링 일정 공지"
      v13 title VERBATIM: "학생회관 리모델링 일정 공지 (일정 변경)"
    A small "새로고침" button in the frame's chrome.

  THE SEQUENCE IN "수정 전" MODE:
    t=0.00s  Deploy runs; all four stages go green over 2.0s; terminal prints
             success; result chip reads 배포 성공
    t=2.20s  The RIGHT panel does NOT change. It still reads
             VERBATIM "표시 중인 버전: v12" and the old title.
    t=2.60s  Pressing 새로고침 in the right panel STILL shows v12. The version
             marker briefly flashes #f87171.
    t=3.00s  A grey annotation appears beside the version marker, font-mono 10px
             #64748b, VERBATIM: "캐시에서 가져옴"
    t=3.40s  A message fades in at the container's bottom, max-width 480px,
             17px leading-9:
               Line 1, rgba(255,255,255,0.88), VERBATIM:
                 "왼쪽은 전부 초록불입니다."
               Line 2, #f87171, font-bold, margin-top 8px, VERBATIM:
                 "오른쪽은 아직 옛날 화면입니다."
    t=3.90s  The header's live badge turns #f87171 and reads VERBATIM "○ 서비스 중단"
             for 5 seconds - because from a student's perspective the update did not
             happen. Then it returns to green.
    A hard-reload control appears in the right panel's chrome, font-mono 10px,
    VERBATIM: "강력 새로고침"
    Pressing it DOES update to v13, and a note appears, font-mono 10px #fbbf24,
    VERBATIM: "사용자에게 이걸 시킬 수는 없다"
    That line is the crux of the section - keep it exactly.

  THE SEQUENCE IN "수정 후" MODE:
    The same deploy runs. At t=2.20s the RIGHT panel updates on its own to
    VERBATIM "표시 중인 버전: v13" with the new title, and a green annotation
    appears, font-mono 10px #4ade80, VERBATIM: "새 파일 이름이라 캐시가 안 걸림"
    A small file-name readout appears beneath the version marker, font-mono 9px
    rgba(255,255,255,0.46), showing an asset filename with a content hash before and
    after, e.g. VERBATIM: "main.a71f3c.js → main.9d2e08.js"
    The header badge never turns red.

A note beneath the container, font-mono 9px rgba(255,255,255,0.32), VERBATIM:
  "시연용 시뮬레이션입니다. 실제로 배포하거나 요청을 보내지 않습니다."

=== BLOCK C: ELIMINATION TABLE ===
Margin-top 44px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "의심한 것들"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "의심" | "확인 방법" | "결과"
Rows (eliminated: 결과 cell rgba(255,255,255,0.46) with "✕ " prefix; confirmed:
#f87171 with "● " prefix):
  "배포가 실제로 안 됐다"     | "서버에서 파일 수정 시각 확인"     | "✕ 새 파일이 올라가 있었다"
  "컨테이너가 안 바뀌었다"     | "컨테이너 생성 시각 확인"         | "✕ 방금 만들어진 것"
  "nginx가 옛 파일을 준다"     | "서버에서 직접 파일 내용 확인"     | "✕ 새 내용이었다"
  "브라우저가 옛 파일을 쥐고 있다" | "개발자 도구 네트워크 탭 확인"  | "● 디스크 캐시에서 로드됨"
Rows reveal 0.16s apart, sliding in from x -10px. The confirmed row lands last and
grows a 2px #f87171 left bar over 0.5s.
Below the table, one line, 15px leading-8, VERBATIM:
  "서버까지는 전부 정상이었다. 문제는 서버 바깥, 사용자 브라우저 안에 있었다."

=== BLOCK D: ROOT CAUSE (a cache lifecycle diagram) ===
Margin-top 40px, padding 24px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05).
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인 · 파일 이름이 그대로였다"
  An SVG diagram, height ~190px, with two rows:

  ROW 1 - VERBATIM "수정 전"
    A timeline of three moments: 첫 방문 / 배포 / 재방문.
    At 첫 방문, a browser box stores a file chip labeled VERBATIM "main.js".
    At 배포, a server box replaces its file - but the chip label is STILL
    VERBATIM "main.js".
    At 재방문, an arrow from the browser to its own stored chip (not to the server),
    labeled font-mono 9px #f87171, VERBATIM: "이름이 같으니 안 물어봄"

  ROW 2 - VERBATIM "수정 후"
    Same timeline. At 첫 방문 the chip is VERBATIM "main.a71f3c.js".
    After 배포 the server's file is VERBATIM "main.9d2e08.js", and the HTML that
    references it is not cached, so at 재방문 the browser fetches the new HTML,
    sees a new filename, and requests it - arrow to the server, labeled
    font-mono 9px #4ade80, VERBATIM: "모르는 이름이니 받아옴"

  Elements draw left to right, 0.12s apart, row 1 first.
  Below the diagram, body 16px leading-8, VERBATIM:
  "브라우저는 성능을 위해 한 번 받은 파일을 붙잡고 있는다. 그게 정상 동작이다.
   문제는 파일 이름이 그대로면 브라우저가 새 파일이 있다는 걸 알 방법이 없다는 것이다.
   그래서 내용이 바뀌면 이름도 바뀌게 만들고,
   그 이름을 알려주는 HTML만은 절대 캐시되지 않게 했다."
  Emphasize "내용이 바뀌면 이름도 바뀌게" in #fbbf24, font-bold.

=== BLOCK E: THE FIX ===
Margin-top 40px. Two panels side by side, gap 16px (stack below 1024px).
Each: background #180a0d, border 1px, rounded-md, header with three window dots and
a filename, body font-mono 12px with a line-number gutter.

  LEFT panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "빌드 결과물"
    CONTENT: ~12 lines, presented as a file tree listing showing the build output
    directory: index.html at the root, and an assets directory containing JS and CSS
    files whose names include a content hash. Add a short comment noting that the
    hash changes only when the file's content changes, so unchanged files keep their
    cache.
    HIGHLIGHT the hashed filenames with rgba(74,222,128,0.12).

  RIGHT panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "nginx.conf (캐시 정책)"
    CONTENT: ~16 lines. Two location blocks with DIFFERENT cache policies: the
    hashed asset directory gets a long max-age with an immutable directive, while
    index.html (and the SPA fallback) gets a no-cache policy so the browser always
    revalidates it. Include the SPA fallback from the earlier section so the two
    fixes are visibly part of one file.
    HIGHLIGHT both the long-cache line and the no-cache line with
    rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "# ", VERBATIM:
      "# 자산은 영원히 캐시, index.html은 절대 캐시 안 함. 이 두 줄이 짝이다."

A short note beneath both panels, 15px leading-8, VERBATIM:
  "한 줄만 고치면 안 된다는 게 핵심이었다.
   자산에 긴 캐시를 걸면서 index.html까지 캐시하면, 새 파일 이름을 알려줄 사람이 없어진다.
   반대로 둘 다 캐시를 끄면 매번 전부 다시 받는다."
Emphasize "이 두 줄이 짝이다" concept by putting "새 파일 이름을 알려줄 사람이 없어진다"
in #fbbf24, font-bold.

=== BLOCK F: VERIFICATION + REMAINING LIMITS ===
Margin-top 40px.
Three stat cells in a row, gap 12px (stacks below 640px). Each: padding 16px,
rounded-md, border 1px rgba(74,222,128,0.22), background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "즉시"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "배포 후 반영 시점"
  Cell 2  value VERBATIM "불필요"  label VERBATIM "사용자의 강력 새로고침"
  Cell 3  value VERBATIM "유지"    label VERBATIM "안 바뀐 파일의 캐시"
Values fade in on entry.
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "일반 새로고침과 재방문으로 직접 확인했습니다. 여러 기기에서의 검증은 못 했습니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "이미 열어둔 탭은 그대로다. 새 버전이 나왔다고 알려주는 장치는 없다."
    "CDN을 쓰지 않아서 CDN 캐시 무효화 문제는 겪지 않았다. 붙이면 다시 봐야 한다."
    "배포 후 자동으로 확인하는 절차가 없다. 매번 직접 열어본다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left
1.10s  The paradox demo fades up; both panels populate
1.80s  A one-time pulse on the 다시 배포 button (a soft rose ring, 2 pulses of 0.9s)
       with a hint above it, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "배포해보세요. 오른쪽을 보세요."
       Both disappear permanently once pressed.
All later blocks animate on their own viewport entry.

=== PERFORMANCE ===
The terminal caps its retained lines. All animation stops when the container is out
of the viewport or the tab is hidden.

=== RESPONSIVE ===
< 1024px: fix panels stack.
< 900px: the paradox demo's two panels stack (deploy side on top) - keep the version
marker prominent so the contrast still lands.
< 720px: the cache lifecycle diagram scrolls horizontally inside its own container
with a 620px minimum width.
< 640px: code and terminal font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no stage progress animation (the deploy completes instantly),
no button pulse, no flashing version marker (it changes color statically).
The deploy button, mode toggle, refresh and hard-refresh controls must be real
buttons with visible focus rings (2px #fb7185, offset 2px).
Announce the paradox ONCE via aria-live="polite":
  수정 전 VERBATIM: "배포는 성공했지만 표시되는 버전은 변경되지 않았습니다."
  수정 후 VERBATIM: "배포 후 표시 버전이 갱신되었습니다."
Do NOT make the terminal an aria-live region.
The version marker must convey state by TEXT, not by color alone.

=== DO NOT ===
Do not execute anything or make any request.
Do not remove the "사용자에게 이걸 시킬 수는 없다" line - it is the crux.
Do not present the two nginx cache rules separately as if either alone were the fix.
Do not invent cache-hit rates or performance numbers.
```

---

## PAGE 07 — 배포하고 나서 배운 것 · 실서비스 운영

**개발 실체**: **실제 사용자가 있는 서비스를 운영하며 받은 피드백과 그로 인한 수정**
**연출 장치**: 학생들에게 받은 문의가 쪽지처럼 게시판에 붙고, 각 쪽지를 누르면 **그게 어떤 수정으로 이어졌는지**가 펼쳐진다

```text
Build an OPERATIONS section where feedback notes from real service usage are pinned
to the board, and clicking each note unfolds what change it led to - showing what
running a live service taught the developer.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That having real users changed what the developer worked on
2. Four concrete pieces of feedback and the concrete change each caused
3. An honest statement about what was NOT measured

=== MOOD ===
The board a few weeks after launch. Sticky notes have accumulated. Rose light,
lived-in, a little messy. Reflective rather than triumphant.

=== COMPLIANCE ===
All feedback quotes are PARAPHRASED and ANONYMIZED. Never attribute anything to a
named person. No student IDs, contacts, or real message screenshots.

=== DESIGN TOKENS (use exactly) ===
background #160709 | panel #220e13 | paper #2a1418 | sticky #35191d
primary rose #fb7185 | accent #fda4af
live #4ade80 | down #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #180a0d, border rgba(251,113,133,0.18)
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1060px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : THE FEEDBACK BOARD - full width, height ~520px
  Block C : the "what changed about how I work" card
  Block D : the not-measured card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "06 · 운영"

HEADING (28px font-black):
  VERBATIM: "쓰는 사람이 생기니까 고칠 것이 달라졌다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "혼자 만들 때는 기능을 늘리는 게 일이었다.
             배포하고 나니 문의가 오기 시작했고, 그 문의들은 대부분
             내가 「이건 나중에」라고 미뤄둔 것들이었다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "아래 네 장은 실제로 받은 문의를 다듬어서 옮긴 것입니다.
             각각 어떤 수정으로 이어졌는지 눌러서 확인해보세요."
  Emphasize "눌러서 확인해보세요" in #fda4af, font-bold.

=== BLOCK B: THE FEEDBACK BOARD (the defining idea) ===
A container, height ~520px (auto when a note is open), background #220e13,
border 1px rgba(251,113,133,0.18), rounded-md, padding 26px, cork texture.

FOUR STICKY NOTES arranged loosely (not a grid), each 200x150px, background #35191d,
1px border rgba(255,255,255,0.12), rounded-sm, ±5deg tilt, a pushpin at the top, and
a paper shadow.
Each note contains:
  - a small source chip at the top-left, font-mono 9px rgba(255,255,255,0.42),
    VERBATIM in order: "Q&A 문의" / "카톡 제보" / "직접 들은 말" / "Q&A 문의"
  - a paraphrased quote in 13px leading-7 rgba(255,255,255,0.82), in quotation marks
  - a small "눌러보기" affordance at the bottom-right, font-mono 9px #fb7185
Quotes VERBATIM:
  NOTE 1: "핸드폰으로 보면 표가 잘려요"
  NOTE 2: "공지 링크 보냈는데 안 열린대요"
  NOTE 3: "글씨가 너무 작아서 안 보여요"
  NOTE 4: "복지 정보 어디 있는지 못 찾겠어요"

CLICKING A NOTE (the payoff):
  t=0.00s  The other three notes dim to 35% and drift slightly outward
  t=0.10s  The clicked note straightens to 0deg, scales up, and MOVES to the
           container's left side (0.5s)
  t=0.40s  An UNFOLD PANEL expands to its right (width 0 -> ~58%, opacity 0 -> 1,
           0.5s), styled as a sheet of paper unfolding, containing:
             - a label, font-mono 10px letter-spacing 0.18em #fb7185,
               VERBATIM: "무엇을 고쳤나"
             - a diagnosis paragraph, 15px leading-8
             - a change list, 2-3 items at 14px leading-7, each prefixed "→ " in
               #4ade80
             - an optional [IMG-SLOT] before/after strip, aspect 21/9, height ~120px
             - a takeaway line, 14px leading-7, italic-feeling, in #fda4af
  A close control at the panel's top-right, font-mono 11px, VERBATIM: "닫기"
  Closing reverses everything over 0.4s and the notes return to their tilts.

UNFOLD CONTENT for each note (Korean copy - VERBATIM):

  NOTE 1 - "핸드폰으로 보면 표가 잘려요"
    diagnosis VERBATIM:
      "학사일정을 표로 만들었는데, 모바일 화면에서는 가로로 넘쳤다.
       나는 데스크톱에서만 확인했었다. 그런데 접속의 대부분은 휴대폰이었다."
    changes VERBATIM:
      "→ 표를 좁은 화면에서는 카드 목록으로 바꿈"
      "→ 가로 스크롤이 필요한 요소는 표 자체만 스크롤되도록 격리"
    [IMG-06] before/after of the schedule table on mobile
    caption VERBATIM: "모바일에서의 학사일정 · 수정 전후"
    takeaway VERBATIM: "내가 쓰는 화면과 사용자가 쓰는 화면이 다르다는 걸 계속 잊었다"

  NOTE 2 - "공지 링크 보냈는데 안 열린대요"
    diagnosis VERBATIM:
      "앞에서 다룬 404 문제다. 나는 사이트 안에서만 눌러봐서 몰랐고,
       링크를 밖에서 여는 경로를 한 번도 테스트하지 않았다."
    changes VERBATIM:
      "→ nginx에 SPA 폴백 설정 추가"
      "→ 배포 후 확인 목록에 「주소 직접 입력」 항목 추가"
    takeaway VERBATIM: "내가 안 해보는 경로가 사용자에게는 기본 경로일 수 있다"

  NOTE 3 - "글씨가 너무 작아서 안 보여요"
    diagnosis VERBATIM:
      "본문 글씨를 13px로 잡아뒀다. 디자인 시안에서는 예뻤는데
       실제로 야외에서 휴대폰으로 공지를 읽는 상황을 생각하지 않았다."
    changes VERBATIM:
      "→ 본문 기준 크기를 16px로 올리고 줄 간격도 넓힘"
      "→ 명도 대비를 확인해서 회색 텍스트 몇 군데를 밝게 조정"
    takeaway VERBATIM: "접근성은 기능이 아니라 기본값의 문제였다"

  NOTE 4 - "복지 정보 어디 있는지 못 찾겠어요"
    diagnosis VERBATIM:
      "메뉴에는 분명히 있었다. 그런데 학생들이 찾는 건 「복지」라는 카테고리가 아니라
       「우산 빌리는 곳」이었다. 분류 이름이 학생회 내부 기준이었던 것이다."
    changes VERBATIM:
      "→ 복지 항목을 카테고리가 아니라 개별 카드로 노출"
      "→ 메인 화면에 자주 찾는 항목 바로가기 추가"
    takeaway VERBATIM: "메뉴 이름을 만드는 사람과 찾는 사람의 언어가 달랐다"

A hint beneath the board, font-mono 10px rgba(255,255,255,0.35), fading out
permanently after the first note is opened, VERBATIM: "쪽지를 눌러보세요"

=== BLOCK C: THE "WHAT CHANGED" CARD ===
Margin-top 48px, padding 24px, rounded-md, border 1px rgba(251,113,133,0.24),
background rgba(251,113,133,0.04), border-left 3px #fb7185.
  Label font-mono 11px letter-spacing 0.2em #fb7185, VERBATIM: "일하는 방식이 바뀐 부분"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "배포 후 확인 목록을 만들어서 매번 같은 경로를 눌러보게 됐다."
    "새 화면을 만들 때 데스크톱보다 모바일 폭에서 먼저 확인하게 됐다."
    "「나중에 고치자」로 미룬 것들을 목록으로 적어두고, 문의가 오면 그 순서를 바꿨다."

=== BLOCK D: THE NOT-MEASURED CARD (required) ===
Margin-top 32px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "재보지 못한 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "방문자 수나 페이지뷰를 수집하지 않았다. 분석 도구를 붙이지 않았다."
    "그래서 「모바일 접속이 많다」는 것도 문의 내용과 주변 반응으로 판단한 것이지, 측정한 게 아니다."
    "수정 후에 문의가 실제로 줄었는지도 숫자로는 확인하지 못했다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraphs 1 and 2, 0.5s apart
1.50s  The board fades up
1.90s  The four sticky notes get pinned on, 0.16s apart, each dropping from 22px
       above with a rotation overshoot and a pushpin scaling in
2.70s  The hint fades in
3.20s  A one-time nudge: the first note wobbles ±2deg once over 0.6s to advertise
       that it is clickable. Only if no note has been opened.

=== RESPONSIVE ===
< 900px: notes arrange in a 2x2 grid; opening a note pushes the unfold panel BELOW
the notes rather than beside them (the notes shrink to a horizontal row of four).
< 640px: notes become a vertical stack; the unfold panel expands inline under the
opened note; before/after image height 90px.

=== ACCESSIBILITY ===
prefers-reduced-motion: no pinning drop, no wobble, no unfold animation - the panel
appears instantly.
Each note must be a real button with an accessible name (its quote) and a visible
focus ring (2px #fb7185, offset 2px). The unfold panel must receive focus when
opened and return focus to its note when closed.
The panel must use aria-expanded on the note and be a proper disclosure.
Do not rely on tilt or shadow alone to indicate interactivity - the "눌러보기"
affordance text carries it.

=== DO NOT ===
Do not attribute any quote to a named person or include any identifying detail.
Do not screenshot real messages - the notes are typed paraphrases.
Do not invent visitor numbers, page views, or "inquiries dropped by X%".
Do not remove the not-measured card.
```

---

## PAGE 08 — 요청 하나가 지나가는 길 · 전체 구조와 내 범위

**개발 실체**: 브라우저 → Nginx → 정적 파일 → API 전체 경로 + **내가 담당한 구간**
**연출 장치**: 관람객이 `요청 보내기` 를 누르면 패킷이 실제 경로를 따라가며, 내 담당 구간에서만 로즈색으로 빛난다

```text
Build an ARCHITECTURE section where the viewer sends a simulated request and watches
it travel the full path from browser to nginx to static files to the API, with the
segments this developer personally built lit in rose and the rest outlined.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The end-to-end request path for this deployed service
2. An explicit, honest boundary of what this developer built versus the backend
3. The scope of the frontend and deployment work in concrete terms

=== MOOD ===
The board's back panel, after hours, with a wiring diagram taped to it.
Rose light, structural, calm.

=== COMPLIANCE ===
No real hostnames, IPs, ports beyond a generic example, or credentials.

=== DESIGN TOKENS (use exactly) ===
background #160709 | panel #220e13 | paper #2a1418
primary rose #fb7185 | accent #fda4af | live #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
outline (not mine) rgba(255,255,255,0.22) | mine #fb7185
fonts: headings font-black, body sans leading-8, ALL diagram labels font-mono
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1040px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE REQUEST PATH - full width, height ~480px
  Block C : the scope cards (4)
  Block D : the team honesty note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "07 · 전체 구조"

HEADING (28px font-black):
  VERBATIM: "학생이 주소를 누르고 화면이 뜨기까지"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "프론트엔드를 맡았고, 배포까지 같이 했습니다.
             API와 데이터베이스는 백엔드 담당이 따로 있었습니다.
             아래에서 요청을 하나 보내보면, 불이 들어오는 구간이 제가 만든 부분입니다."

=== BLOCK B: THE REQUEST PATH (the defining idea) ===
A container, height ~480px, background #220e13,
border 1px rgba(251,113,133,0.18), rounded-md, padding 26px. Drawn in SVG.

A SEND CONTROL at the top-center: a segmented pair choosing which request to send,
font-mono 11px:
  VERBATIM "화면 요청 (/notice/12)"  |  VERBATIM "데이터 요청 (/api/notices/12)"
and a button beside it, font-mono 12px font-black, padding 9px 20px, rounded-md,
border 1px rgba(251,113,133,0.45), color #fb7185, VERBATIM: "요청 보내기"

THE PATH: six nodes laid out left to right in two staggered rows so the path reads
as a journey, connected by rails.
  NODE 1  VERBATIM "브라우저"            ownership MINE (frontend app)
  NODE 2  VERBATIM "Nginx"               ownership MINE (I configured it)
  NODE 3  VERBATIM "정적 파일 (index.html · assets)"  ownership MINE
  NODE 4  VERBATIM "React 앱 실행"        ownership MINE
  NODE 5  VERBATIM "API 서버"             ownership NOT MINE
  NODE 6  VERBATIM "데이터베이스"          ownership NOT MINE

NODE STYLING BY OWNERSHIP:
  MINE     : border 1px #fb7185, background rgba(251,113,133,0.08),
             label rgba(255,255,255,0.86), glow box-shadow 0 0 20px
             rgba(251,113,133,0.14)
  NOT MINE : border 1px rgba(255,255,255,0.22), background transparent,
             label rgba(255,255,255,0.45)

THE TRAVEL ANIMATION (on pressing 요청 보내기):
  A rose packet dot enters at NODE 1 and travels the rails, pausing 0.3s at each
  node while a small annotation chip appears beside it, font-mono 9px #fda4af.
  FOR "화면 요청": the packet goes 1 -> 2 -> 3 -> back to 1, and then NODE 4 lights
  as the app boots. Annotations VERBATIM in order:
    at 브라우저   "주소 입력"
    at Nginx      "이 경로에 해당하는 파일 없음 → index.html 반환"
    at 정적 파일   "index.html + 해시 붙은 자산"
    at 브라우저   "앱이 라우팅을 이어받음"
    at React 앱   "화면 렌더"
  FOR "데이터 요청": the packet goes 1 -> 2 -> 5 -> 6 -> 5 -> 2 -> 1, and NODES 5
  and 6 light in their NOT-MINE style (a white-ish glow, clearly different).
  Annotations VERBATIM:
    at 브라우저   "앱이 데이터 요청"
    at Nginx      "/api 경로는 프록시"
    at API 서버   "요청 처리"
    at 데이터베이스 "조회"
    at 브라우저   "받은 데이터로 목록 갱신"
  Total about 3.0s. The path taken stays lit after the packet passes; switching the
  request type resets and re-lights.

A LEGEND at the bottom-right, font-mono 10px, two rows with 12px swatches:
  VERBATIM "내가 만든 부분" / "백엔드 담당"

A TIMING STRIP along the container's bottom, font-mono 10px
rgba(255,255,255,0.42), listing the segments the packet passed with a "—" instead of
a number, e.g. VERBATIM: "브라우저 → Nginx  —   Nginx → 정적파일  —"
with a note beneath, font-mono 9px rgba(255,255,255,0.30), VERBATIM:
  "구간별 응답 시간은 측정하지 않았습니다"
Refusing to invent latency numbers here is required.

=== BLOCK C: THE SCOPE CARDS ===
Margin-top 52px. Four cards in a 2x2 grid, gap 14px (1 column below 720px).
Each: padding 20px, rounded-md, border 1px rgba(251,113,133,0.20),
background rgba(251,113,133,0.04), with a font-mono 10px letter-spacing 0.18em
#fb7185 label and a 3-item list at 14px leading-7 with "· " prefixes.

CARD 1  label VERBATIM: "라우팅 구조"
  "React 기반 SPA 전체 라우팅 구조 설계"
  "공통 레이아웃과 네비게이션 정리"
  "없는 경로를 앱이 처리하도록 catch-all 구성"
CARD 2  label VERBATIM: "화면 구현"
  "공지사항, Q&A, 자료실 화면 구현"
  "복지 정보와 소개 화면 구현"
  "모바일 폭 대응"
CARD 3  label VERBATIM: "상태 관리"
  "AuthContext 기반 로그인 상태 관리"
  "보호 라우트와 원위치 복귀 처리"
  "초기 세션 확인 중 화면 처리"
CARD 4  label VERBATIM: "배포"
  "Docker + Nginx 배포 설정"
  "멀티 스테이지 빌드 구성"
  "SPA 폴백과 캐시 정책 설정"

=== BLOCK D: THE TEAM HONESTY NOTE ===
Margin-top 36px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "명확히 해둘 것"
  Body 15px leading-8, VERBATIM:
  "API와 데이터베이스는 백엔드 담당이 설계하고 구현했습니다.
   저는 그 API를 받아서 화면을 만들고, 그 결과물을 서버에 올리는 부분을 맡았습니다.
   서버 자체(인스턴스와 도메인)도 제가 준비한 게 아니라, 이미 있는 환경에 배포했습니다."

=== RESPONSIVE ===
< 900px: the path becomes a VERTICAL flow (six nodes stacked, packet travels
downward and back up); container height 620px.
< 640px: node labels 10px; scope cards single column.

=== ACCESSIBILITY ===
prefers-reduced-motion: no packet travel - pressing 요청 보내기 lights the entire
path instantly with all annotations visible.
The request-type selector must be a real radiogroup and the send button a real
button, both with visible focus rings (2px #fb7185, offset 2px).
Provide a visually-hidden ordered text description of both request paths, including
each node's ownership.
Ownership must not be conveyed by color alone - the legend plus each node's border
style (solid vs thin outline) carries it, and the visually-hidden description states
it explicitly.

=== DO NOT ===
Do not use a diagramming library - hand-draw the SVG.
Do not show real hostnames, IPs, or credentials.
Do not invent per-segment latency numbers - the "측정하지 않았습니다" note must stay.
Do not overstate ownership.
```

---

## PAGE 09 — 결과 · 화면 갤러리

**개발 실체**: 완성되어 **실제 운영 중인** 화면들
**연출 장치**: 게시판 전체에 조명이 들어오며 갤러리로 확장

```text
Build a RESULTS SECTION presenting the deployed service's screens as a gallery,
framed as the notice board's lights coming fully up, for a student council website
portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What was actually shipped and is running, in screens
2. The concrete outcome stated without invented metrics
3. A live link to the running service

=== MOOD ===
The board fully lit, notices up, service running. Warm rose, quietly proud,
unhurried.

=== COMPLIANCE ===
All notice titles, Q&A contents and names in captures must be FICTIONAL or
anonymized. No student IDs or contacts.

=== DESIGN TOKENS (use exactly) ===
background #1c0b0f (lifted from earlier sections) | panel #26121a
primary rose #fb7185 | accent #fda4af | live #4ade80 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1140px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the gallery (6 items, asymmetric grid)
  Block C : the outcome stats
  Block D : the live link band + the numbers note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "08 · 결과"

HEADING (32px font-black):
  VERBATIM: "만든 것이 아니라, 돌아가고 있는 것"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "공지, Q&A, 소개, 복지 정보, 자료실을 한 사이트에 모아 배포했습니다.
             주소를 직접 열어도, 링크를 공유해도, 새로고침해도 정상 동작합니다.
             학생들이 총학생회 정보를 한곳에서 확인하고 Q&A를 주고받을 수 있는
             웹 서비스를 실제로 배포했습니다."

=== BLOCK B: THE GALLERY ===
An asymmetric grid, margin-top 48px:
  Row 1: one large item (2 columns) + one small item
  Row 2: three equal items
  Row 3: one wide item (full width)
Gap 16px. Below 900px -> single column.

Each item: background #26121a, border 1px rgba(251,113,133,0.18), rounded-md,
overflow hidden.
  A 30px header strip with a font-mono 10px uppercase label on the left
  (rgba(255,255,255,0.48)) and a small #4ade80 dot on the right (these screens are
  live).
  Below it, the image area (aspect noted per item).
  A caption bar at the bottom, padding 12px 14px,
  border-top 1px rgba(251,113,133,0.10), font-mono 11px rgba(255,255,255,0.48).

ITEM 1 (large, aspect 16/10)  header VERBATIM "01 · 메인"
  [IMG-07] the deployed home screen
  caption VERBATIM: "자주 찾는 항목을 위로 올린 뒤의 메인"
ITEM 2 (small, aspect 9/16)   header VERBATIM "02 · 모바일 공지"
  [IMG-08] the notice list on a phone
  caption VERBATIM: "접속의 대부분은 휴대폰이었다"
ITEM 3 (aspect 16/10)         header VERBATIM "03 · 공지 상세"
  [IMG-09] the notice detail screen
  caption VERBATIM: "주소를 직접 열어도 정상 동작"
ITEM 4 (aspect 16/10)         header VERBATIM "04 · Q&A"
  [IMG-10] the Q&A list and write flow
  caption VERBATIM: "읽기는 누구나, 쓰기는 로그인 후"
ITEM 5 (aspect 16/10)         header VERBATIM "05 · 복지 정보"
  [IMG-11] the welfare information screen
  caption VERBATIM: "카테고리 대신 항목을 직접 노출"
ITEM 6 (wide, aspect 21/9)    header VERBATIM "06 · 배포 구성"
  [IMG-12] the Dockerfile / nginx.conf / container state, as a composed capture
  caption VERBATIM: "이 화면들을 서버에 올린 구성"

IMAGE PLACEHOLDER SPEC (if no image is supplied): a CSS placeholder inside the
aspect box - background #160709, a faint 24px rose grid, and centered text in
font-mono 12px rgba(255,255,255,0.35) reading the slot name and ratio, e.g.
VERBATIM "[IMG-07] · 16:10"

HOVER: the item lifts 4px, its border goes to rgba(251,113,133,0.45), and the image
scales 1.03 inside its clipped frame. 0.35s. Click opens a lightbox
(overlay rgba(14,5,7,0.94), backdrop-blur(8px), image max-width 1240px, the caption
below it, Esc / overlay click closes, arrow keys move between items).

=== BLOCK C: THE OUTCOME STATS ===
Margin-top 56px. Four stat cells in a row, gap 14px (2x2 below 768px).
Each: padding 22px, rounded-md, border 1px rgba(251,113,133,0.22),
background rgba(251,113,133,0.04).
  value font-mono 32px font-black #fb7185 tabular-nums
  label font-mono 11px rgba(255,255,255,0.48), margin-top 6px
  Cell 1  value VERBATIM "5"      label VERBATIM "핵심 섹션"
  Cell 2  value VERBATIM "5"      label VERBATIM "기술 스택"
  Cell 3  value VERBATIM "2건"    label VERBATIM "배포 후 해결한 장애"
  Cell 4  value VERBATIM "운영 중" label VERBATIM "서비스 상태"
Cell 4's value is in #4ade80 with a 1px rgba(74,222,128,0.35) border.
Values count up over 0.8s on entry (except cell 4, which fades in with a soft green
pulse).

=== BLOCK D: THE LIVE LINK BAND + NUMBERS NOTE ===
Margin-top 32px. A prominent band: padding 22px 26px, rounded-md,
border 1px rgba(74,222,128,0.30), background rgba(74,222,128,0.05),
display flex, aligning a text block on the left and a link button on the right
(stacks below 640px).
  LEFT: a live chip, font-mono 10px, a 7px #4ade80 dot with a pulsing halo,
        VERBATIM: "지금 접속 가능"
        and beneath it, 15px leading-7, VERBATIM:
        "이 프로젝트는 지금도 배포되어 있습니다. 직접 열어보실 수 있습니다."
  RIGHT: a link button, background #4ade80, color #160709, font-mono 13px
        font-black, padding 12px 24px, rounded-md, VERBATIM: "사이트 열기 ↗"
        pointing at the deployed student council site, target _blank,
        rel noreferrer.

Then, margin-top 16px, a slim numbers note: padding 14px 18px, rounded-md,
border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02).
  font-mono 11px rgba(255,255,255,0.45), VERBATIM:
  "위 숫자는 구현 범위를 센 것입니다. 방문자 수나 페이지뷰는 수집하지 않아
   말씀드릴 수 있는 지표가 없습니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The page background lifts #160709 -> #1c0b0f over 1.2s while a wide rose
       spotlight brightens from 30% to 100% - the board's lights coming up
0.10s  Label, heading word by word at 0.25s
0.80s  Paragraph
1.30s  Gallery items fade up 0.09s apart (y 20px -> 0, 0.6s); each item's green dot
       lights 0.2s after its item lands
2.30s  Stat cells fade up 0.09s apart, values counting
2.90s  The live link band slides up (y 14px -> 0) with a single soft green glow
3.20s  Numbers note fades in

=== RESPONSIVE ===
< 900px: single-column gallery; the 9/16 item is capped at 420px height and centered.
< 768px: stat cells 2x2; heading 24px.
< 640px: the live link band stacks its two halves; the button goes full width.

=== ACCESSIBILITY ===
prefers-reduced-motion: no count-up, no hover scale, no background/spotlight
transition, no glow pulse.
Every gallery item is a real <button> opening the lightbox with a visible focus ring
(2px #fb7185, offset 2px). Each image needs a descriptive Korean alt text derived
from its caption. The lightbox traps focus while open and returns focus on close.
The live link must announce that it opens in a new tab.

=== DO NOT ===
Do not invent visitor counts, page views, uptime percentages, or inquiry counts.
Do not include real student names, IDs, contacts, or real Q&A contents in any
capture - anonymize before capturing.
Do not remove the numbers note.
Do not add confetti.
```

---

## PAGE 10 — 회고 · 다음 단계 · 퇴장

**개발 실체**: KPT 회고 (PROBLEM 포함) + 다음 단계 + GitHub + 라이브 링크
**연출 장치**: 게시판 형광등이 꺼지며 퇴장 — 단, **`● 서비스 운영 중` 배지는 마지막까지 켜져 있다**

```text
Build the CLOSING SECTION of a student council website portfolio page: a KPT
retrospective, next steps, the repository link, and an exit transition where the
notice board's fluorescent lamp shuts off - while the live-service badge stays lit
until the very end.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An honest retrospective including real problems, not just wins
2. Concrete next steps
3. The repository link
4. A clean exit back to the village

=== MOOD ===
The corridor at closing time. Lamp off, board still there, service still running
somewhere. Tired, satisfied, honest. No triumphalism.

=== DESIGN TOKENS (use exactly) ===
background #1c0b0f | panel #26121a | primary rose #fb7185 | accent #fda4af
keep #4ade80 | problem #f87171 | try #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.4,0,0.2,1) | rounded-md | ALL numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 960px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : KPT, three columns
  Block C : next steps card
  Block D : GitHub + live site links
  Block E : exit button + exit transition

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "09 · 회고"

HEADING (30px font-black):
  VERBATIM: "배포해보기 전에는 몰랐던 것들이 대부분이었다"

PARAGRAPH (16px leading-9, max-width 720px, margin-top 20px):
  VERBATIM: "기능은 로컬에서 다 만들었습니다.
             그런데 이 프로젝트에서 제일 많이 배운 건 전부 배포 이후에 나왔습니다.
             404, 캐시, 모바일, 글씨 크기 — 전부 사용자가 생기고 나서 알게 된 것들입니다."

=== BLOCK B: KPT ===
Margin-top 52px. Three columns, gap 16px (single column below 768px).
Each column: padding 22px, rounded-md, background #26121a,
border 1px rgba(255,255,255,0.10), with a 3px top border in its own color.
Header: font-mono 11px letter-spacing 0.2em, uppercase.
Items: 15px leading-8, each prefixed "· ", 14px apart.

COLUMN 1 - header VERBATIM "KEEP", color #4ade80, top border #4ade80. Items VERBATIM:
  "배포까지 직접 해본 것"
  "장애가 났을 때 증상이 아니라 원인을 찾아 고친 것"
  "받은 문의를 목록으로 남겨 우선순위를 바꾼 것"

COLUMN 2 - header VERBATIM "PROBLEM", color #f87171, top border #f87171. Items VERBATIM:
  "주소 직접 접근을 배포 전에 한 번도 테스트하지 않았다"
  "모바일 폭에서 확인하지 않고 데스크톱만 봤다"
  "분석 도구를 붙이지 않아 개선 효과를 숫자로 말할 수 없다"

COLUMN 3 - header VERBATIM "TRY", color #fbbf24, top border #fbbf24. Items VERBATIM:
  "알림 기능과 모바일 최적화 추가"
  "배포 후 자동 점검 스크립트 만들기"
  "최소한의 방문 통계라도 수집해서 판단 근거 만들기"

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), top border
grows 3px -> 4px. 0.3s.

=== BLOCK C: NEXT STEPS CARD ===
Margin-top 48px, padding 22px, rounded-md, border 1px rgba(251,113,133,0.22),
background rgba(251,113,133,0.04), border-left 3px #fb7185.
  Label font-mono 11px letter-spacing 0.2em #fb7185, VERBATIM: "다음 단계"
  Body 16px leading-8, margin-top 12px, VERBATIM:
  "알림 기능과 모바일 최적화를 추가할 예정입니다.
   그 전에 배포 후 주요 경로를 자동으로 확인하는 스크립트부터 만들려고 합니다.
   같은 장애를 두 번 겪지 않는 게 먼저라고 생각합니다."

=== BLOCK D: GITHUB + LIVE SITE LINKS ===
Margin-top 40px. Two link buttons side by side, gap 12px (stack below 640px).
  PRIMARY (live site): background #4ade80, color #160709, font-mono 14px font-black,
    padding 14px 28px, rounded-md, VERBATIM: "사이트 열기 ↗"
    with a small live dot before the label.
    Hover: scale 1.04, box-shadow 0 0 28px rgba(74,222,128,0.32). Active: scale 0.97.
    Points at the deployed student council site, target _blank, rel noreferrer.
  SECONDARY (repository): background transparent, border 1px rgba(251,113,133,0.45),
    color #fb7185, same size, VERBATIM: "GitHub 저장소 ↗"
    href https://github.com/toadsam/ajouchong-web, target _blank, rel noreferrer.
The live site button comes FIRST and is visually primary - for this project the
running service outranks the source.

=== BLOCK E: EXIT BUTTON + EXIT TRANSITION ===
Margin-top 72px. A full-width button, height 88px, rounded-md,
border 1px rgba(255,255,255,0.14), background transparent.
  Label centered, font-mono 15px, letter-spacing 0.1em, rgba(255,255,255,0.62),
  VERBATIM: "← 마을로 돌아가기"
  Hover: border -> rgba(251,113,133,0.45), label -> #fb7185, and a faint fluorescent
  glow appears behind it. 0.4s.

EXIT TRANSITION (on click of this button OR the header's "← 마을로"):
  t=0.00s  Content fades to opacity 0 over 0.3s
  t=0.25s  A notice board reappears at the viewport center, lit, with a few pinned
           notices
  t=0.45s  The notices fade out one at a time, 0.07s apart (they do not fall - the
           board stays tidy)
  t=0.90s  THE FLUORESCENT LAMP SHUTS OFF: brightness ramps 100% -> 0% over 0.45s
           with a brief lingering afterglow line across the tube (a 1px bright line
           that fades over 0.3s), exactly like a real fluorescent tube.
           NO flicker on shutdown - a single smooth ramp.
  t=1.40s  Everything is dark EXCEPT the live badge, which remains visible at the
           center for 0.9s: the green dot and the text VERBATIM "● 서비스 운영 중"
           This is the last thing the viewer sees, and it is the point of the whole
           room.
  t=2.30s  The badge fades over 0.4s; the background settles to #160709
  t=2.80s  Emit an onExit callback so the parent can restore the 3D village scene.
  Body scroll locks during the transition; the parent releases it.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  KPT columns fade up left to right 0.12s apart, items inside 0.06s apart
2.20s  Next steps card slides in from the left (x -12px -> 0)
2.60s  The two link buttons fade in 0.1s apart (live first)
3.00s  Exit button fades in with its border drawing from the center outward
       (0% -> 100% width, 0.7s)

=== RESPONSIVE ===
< 768px: KPT single column; heading 24px; exit button height 72px, label 14px;
link buttons stack full width (live first).

=== ACCESSIBILITY ===
prefers-reduced-motion: all reveals instant; the exit transition becomes a plain
0.35s fade to black, but the live badge still lingers for 0.9s before fading -
that beat is content, not decoration, so keep it.
The exit button must be a real <button>, keyboard focusable, with a visible focus
ring (2px #fb7185, offset 2px). Both links must announce that they open in a new tab.

=== DO NOT ===
Do not soften the PROBLEM column - the honesty is the point.
Do not flicker the lamp on shutdown - a single smooth ramp only.
Do not add confetti or celebration copy.
Do not remove the lingering live badge at the end.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-1. 개발 실체 커버리지 점검

| 항목                   | 어디에                                                                                                                                          | 형태                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **왜 만들었나**        | P00                                                                                                                                             | 게시판 점등 직후 첫 문장 (4초 안에)                                               |
| **실제 운영 중**       | **P01 종이 A · 헤더 배지 · P09 라이브 밴드 · P10 퇴장 마지막 프레임**                                                                           | **이 방의 정체성 · 4곳 반복**                                                     |
| **데모 영상**          | P01 종이 B                                                                                                                                      | 압정으로 꽂힌 종이                                                                |
| **GitHub**             | P01 종이 C · P10 버튼                                                                                                                           | 종이 + 마무리 버튼 (라이브 링크가 1순위)                                          |
| **관람객 직접 조작**   | **P02(5탭 이동) · P03(새로고침→404) · P04(게시판 뒤집기+배포 4단계) · P05(로그인 흐름) · P06(다시 배포) · P07(쪽지 펼치기) · P08(요청 보내기)** | **7곳 — 10개 방 중 최다**                                                         |
| **코드**               | P02(App.jsx) · P03(nginx before/after) · P04(Dockerfile·compose·nginx) · P05(AuthContext·RequireAuth) · P06(빌드결과물·캐시정책)                | **총 9개**                                                                        |
| **트러블슈팅**         | P03 (SPA 404) · P06 (캐시 갱신 실패)                                                                                                            | **전체 프로세스 2건 + 각각 2차 문제**                                             |
| **인프라 의사결정**    | P04 (멀티 스테이지 이유)                                                                                                                        | 단일 vs 멀티 비교                                                                 |
| **실서비스 운영 경험** | **P07**                                                                                                                                         | **10개 방 중 유일** — 문의 4건 → 수정 4건                                         |
| **아키텍처 + 내 범위** | P08                                                                                                                                             | 요청 경로 + 소유권 2단계                                                          |
| **결과물**             | P09                                                                                                                                             | 갤러리 6장 + 라이브 링크                                                          |
| **회고**               | P10                                                                                                                                             | KPT (PROBLEM 3개)                                                                 |
| **한계 인정**          | P03 · P04 · P06 · P07 · P08 · P09                                                                                                               | 200 반환 / 용량 미기록 / 열린 탭 / 지표 미수집 / 응답시간 미측정 / 방문자 수 없음 |

## D-2. 새로 만들 파일

```
src/components/ui/project-viewers/stages/ajouchong/
  index.tsx                 ← PAGE 00~10 순서, 라이브 배지 상태 소유
  useLiveBadge.ts           ← ⭐ 배지 상태 (P03·P06에서만 red로 전환)
  BoardSurface.tsx          ← ⭐ 공용 게시판 (P00·P01·P04앞면·P07·P10 재사용)
  PinnedPaper.tsx           ← ⭐ 압정 종이 1종 (P01·P07 재사용)
  BrowserSim.tsx            ← ⭐ 가짜 브라우저 (P03·P06 재사용)
  DeployPipeline.tsx        ← ⭐ 4단계 파이프라인 (P04 전체 · P06 축약판 재사용)
  BoardEntrance.tsx         ← P00 · 형광등 3스텝 점등
  BoardHero.tsx             ← P01 · 종이 3장 + 라이브 강조
  ChannelMerge.tsx          ← P02 · 4채널 합치기 + 5탭 디바이스
  Spa404Case.tsx            ← P03 · 새로고침 → 생 404
  FlipDeploy.tsx            ← P04 · 3D 플립 + 터미널 + 설정파일 3종
  AuthFlowDevice.tsx        ← P05 · 로그인 흐름 + 상태 다이어그램
  StaleCacheCase.tsx        ← P06 · 성공했는데 안 바뀜
  FeedbackNotes.tsx         ← P07 · 쪽지 4장 펼치기
  RequestPath.tsx           ← P08 · 요청 경로 + 소유권
  copy.ts                   ← 모든 한국어 문구
  assets.ts                 ← [IMG-01~12] · [VIDEO-01]
```

> ⭐ **공용 5종을 먼저 만들 것.** > `BoardSurface`(5곳) · `PinnedPaper`(2곳) · `BrowserSim`(2곳) · `DeployPipeline`(2곳) · `useLiveBadge`(전역).
> 특히 **`BrowserSim` 과 `DeployPipeline` 은 P03·P06이 각각 재사용**하므로,
> "모드 토글(수정 전/후)" 을 처음부터 prop으로 설계해야 합니다.

## D-3. 기존 코드 재사용 / 선행 작업

재사용: `CodeBlock`, `ImageSlot`, `MockScreen`, `CountUp`, `RevealText` (`shared.tsx`)

> ⚠️ **선행 작업 (10개 프로젝트 공통 1건)**: `shared.tsx` 의 `DecisionTable`,
> `ArchDiagram`, `CompareBars`, `ProcessTimeline`, `QuoteCard`, `TldrBanner`,
> `BeforeAfter`, `ChallengeCard` 가 현재 **모듈 내부 함수(비export)** 입니다.
> stage 폴더에서 쓰려면 export로 승격해야 합니다.
> 아주총학은 **터미널 블록**이 P04·P06에 나오므로 `CodeBlock` 에 터미널 variant 추가 필요.

## D-4. 버릴 것

- `[KILL]` `PlatformProjectViewer` 의 ajouchong 분기 → stage 폴더로 이전
- `[KILL]` ajouchong의 기존 `SIGNATURE` 데모 → P02 `ChannelMerge` + P04 `FlipDeploy` 로 분해 흡수

## D-5. 미디어 확보 목록 (총 12슬롯)

| 슬롯         | 내용                                                  | 비율  | 우선도   | 비고              |
| ------------ | ----------------------------------------------------- | ----- | -------- | ----------------- |
| `[VIDEO-01]` | 공지→상세→새로고침 정상→Q&A 로그인→작성 (1분 36초)    | 16/9  | 높음     | P01               |
| `[IMG-01]`   | 실제 공지사항 목록                                    | 16/10 | 높음     | P02               |
| `[IMG-02]`   | 실제 공지 상세                                        | 16/10 | 높음     | P02               |
| `[IMG-03]`   | **주소를 직접 입력해서 연 상세 페이지 (주소창 보임)** | 21/9  | **최상** | P03 · 트러블 증거 |
| `[IMG-04]`   | **실제 배포 로그 터미널**                             | 16/10 | **최상** | P04 · 최대 차별점 |
| `[IMG-05]`   | 실행 중인 컨테이너 목록                               | 16/10 | 높음     | P04               |
| `[IMG-06]`   | 모바일 학사일정 표 **수정 전/후**                     | 21/9  | 중간     | P07               |
| `[IMG-07]`   | 배포된 메인 화면                                      | 16/10 | **최상** | P09               |
| `[IMG-08]`   | 모바일 공지 목록                                      | 9/16  | 높음     | P09               |
| `[IMG-09]`   | 공지 상세                                             | 16/10 | 중간     | P09               |
| `[IMG-10]`   | Q&A 화면                                              | 16/10 | 높음     | P09               |
| `[IMG-11]`   | 복지 정보 화면                                        | 16/10 | 중간     | P09               |
| `[IMG-12]`   | Dockerfile / nginx.conf / 컨테이너 상태 합성 캡처     | 21/9  | 높음     | P09               |

> 🔴 **캡처 전 필수 확인 (이 방은 실서비스라 리스크가 실재합니다)**
>
> - 실제 학생 이름 · 학번 · 이메일 · 전화번호가 화면에 있으면 **반드시 가림/교체 후 재캡처**
> - 실제 Q&A 질문 내용은 **각색하거나 테스트 데이터로 교체**
> - `[IMG-04]` `[IMG-05]` `[IMG-12]` 는 **서버 주소 · 사용자명 · 토큰 · 포트**가 안 보이게
> - 총학생회 **로고·엠블럼**은 크롭하거나 흐리게

## D-6. 코드 스니펫 확보 목록 (전부 실제 저장소에서)

| 페이지 | 파일                     | 줄  | 하이라이트                          |
| ------ | ------------------------ | --- | ----------------------------------- |
| P02    | `App.jsx`                | 20  | 레이아웃 라우트 · catch-all         |
| P03    | `nginx.conf (before)`    | 10  | 파일만 서빙하는 location            |
| P03    | `nginx.conf (after)`     | 16  | try_files 폴백 · index no-cache     |
| P04    | `Dockerfile`             | 18  | 멀티 스테이지 · COPY --from         |
| P04    | `docker-compose.yml`     | 12  | restart 정책 · 포트 매핑            |
| P05    | `AuthContext.jsx`        | 18  | value 메모이제이션 · loading 플래그 |
| P05    | `RequireAuth.jsx`        | 14  | loading 분기 · location 전달        |
| P06    | 빌드 결과물 트리         | 12  | 해시 붙은 파일명                    |
| P06    | `nginx.conf (캐시 정책)` | 16  | 자산 immutable · index no-cache     |

## D-7. 안전장치 대조표

이 방은 **제어권을 뺏지 않습니다.** 7개 인터랙션 전부 관람객이 직접 누릅니다.

| 페이지 | 장치                 | 안전장치                                                     |
| ------ | -------------------- | ------------------------------------------------------------ |
| P00    | 형광등 점등          | **정확히 3스텝 · 0.9초 · 반복 없음** (광과민성)              |
| P03    | 새로고침 → 404       | **실제 요청·URL 변경 없음** · 배지 6초 후 자동 복구          |
| P04    | 게시판 뒤집기 + 배포 | **아무 명령도 실행 안 함** · 터치에서는 스크롤 트리거 비활성 |
| P05    | 로그인 흐름          | **입력 수집 0** · 실제 인증 없음                             |
| P06    | 다시 배포            | 실제 배포 없음 · 배지 5초 후 자동 복구                       |
| P07    | 쪽지 펼치기          | 순수 UI                                                      |
| P08    | 요청 보내기          | 실제 요청 없음                                               |

## D-8. 최종 체크리스트

- [ ] **실존 학생 이름 · 학번 · 연락처 · 실제 Q&A 내용이 0개인지** (스크린샷 포함)
- [ ] **총학생회 로고·엠블럼을 재현하지 않았는지**
- [ ] `[IMG-04]` `[IMG-05]` `[IMG-12]` 에 **서버 주소·사용자명·토큰·포트가 안 보이는지**
- [ ] 공용 5종(`BoardSurface`·`PinnedPaper`·`BrowserSim`·`DeployPipeline`·`useLiveBadge`)을 **먼저** 만들었는지
- [ ] **P00 형광등 점멸이 정확히 3스텝 · 0.9초 · 반복 없음**인지 (광과민성 — 이 방 최우선)
- [ ] P10 퇴장 시 **형광등이 깜빡이지 않고 단일 램프다운**인지
- [ ] **라이브 배지가 P03·P06에서만** 빨갛게 바뀌고 자동 복구되는지
- [ ] 배지 상태가 **색만이 아니라 텍스트로도** 구분되는지 (`● 운영 중` / `○ 중단`)
- [ ] P03 생 404 화면이 **일부러 안 꾸며졌는지** (흰 배경 + 검은 세리프)
- [ ] P03 **실제 요청/URL 변경이 없는지**
- [ ] P03 **"진짜 없는 주소도 200을 반환하게 됐다" 2차 문제**가 남아 있는지
- [ ] P03 **해시 라우터 실패담**이 남아 있는지
- [ ] P04 **아무 명령도 실행하지 않는지**
- [ ] P04 터미널에 **앰버 경고 1줄**이 있는지 (너무 깨끗하면 가짜 같음)
- [ ] P04 **"이미지 용량 기록 안 했다" 문구**가 남아 있는지 (수치 날조 금지)
- [ ] P04 터미널이 `aria-live` 가 **아닌지**, 줄 수 상한(40)이 있는지
- [ ] P05 로그인/작성 폼이 **입력을 전혀 수집하지 않는지**
- [ ] P05 **"프론트에서 막는 건 보안이 아니다" 카드**가 남아 있는지
- [ ] P06 **"사용자에게 강력 새로고침을 시킬 수는 없다"** 문장이 남아 있는지
- [ ] P06 캐시 정책 **두 줄이 짝**이라는 설명이 남아 있는지
- [ ] P07 인용문이 **전부 각색·익명화**됐는지 · 실제 메시지 캡처가 없는지
- [ ] P07 **"재보지 못한 것" 카드**가 남아 있는지
- [ ] P08 **구간별 응답 시간을 지어내지 않았는지**
- [ ] P09 **"방문자 수 미수집"** 면책 문구 유지
- [ ] 모든 자동 시연이 **관람객 조작 시 영구 중단**되는지
- [ ] 숫자 전부 `tabular-nums`
- [ ] 이 방은 **무음**
- [ ] 지어낸 수치 0개 — 방문자·PV·가동률·문의 감소율 주장 금지
