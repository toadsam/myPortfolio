# 03. FestFlow — 프롬프트 팩

> 대학 축제 운영자를 위한 실시간 부스 관리 시스템 · React / Vite / Tailwind / PWA / Spring Boot / JWT / SSE / MySQL / React Leaflet
> **사용법**: `PAGE 00` ~ `PAGE 10` 의 코드블록을 **하나씩 통째로 복사해서 Variant에 붙여넣으세요.**
> 각 프롬프트는 **완전히 자립적**입니다 (색상·폰트·무드가 매번 반복 포함).
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.
>
> ⭐ **대표 프로젝트.** 기술 깊이(SSE 실시간)와 서사(축제 현장)가 둘 다 있는 유일한 프로젝트.
> 면접에서 가장 오래 붙잡히는 화면이 여기여야 한다.

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 방의 한 문장

**"축제 현장 관제 텐트. 지도는 살아 있고, 화면은 나 없이도 계속 바뀐다."**

## A-2. 왜 이 메타포인가

FestFlow의 본질은 **"내가 안 보고 있어도 상태가 바뀐다"** 이다.
축제 현장에서 부스 30개가 동시에 문을 열고 닫고 품절되는데, 운영자는 그걸 새로고침으로 알 수 없다.

그래서 이 프로젝트를 설명하는 페이지가 **가만히 있으면 그 자체로 모순**이다.
이 방은 **관람객이 아무것도 안 해도 지도가 계속 움직인다.** 그게 SSE의 정의다.

DarkLab이 "어둠"으로 설계 원칙을 옮겼다면, FestFlow는 **"살아 있음"** 으로 옮긴다.

## A-3. ⭐ 가장 중요한 원칙 — 연출은 개발 내용의 운반 수단이다

**모든 연출은 반드시 개발 실체를 하나 이상 전달해야 한다.** 멋있기만 한 연출은 넣지 않는다.

| 전달할 개발 실체 | 그걸 실어나르는 연출 | 페이지 |
|---|---|---|
| 왜 이걸 만들었나 (동기) | 관제 모니터 부팅 시퀀스의 마지막 문장 | 00 |
| 데모 영상 · GitHub | 관제 벽의 **모니터 6대 중 2대**가 영상/저장소 화면 | 01 |
| SSE로 상태 변경을 밀어준다 | **관람객이 안 만져도 지도 마커가 계속 바뀐다** → 이벤트 패킷이 선을 타고 도착 → 즉시 옆에 실제 SSE 코드 | 02 |
| **왜 폴링이 아니라 SSE인가** | **토글 하나로 두 방식이 같은 화면에서 동시 실행** → 요청 카운터가 갈린다 | 03 |
| 지도 위 좌표 배치 (React Leaflet) | 관람객이 마커를 **직접 드래그** → 좌표가 실시간으로 코드에 반영됨 | 04 |
| JWT 역할 분리 | **역할 스위처** — 같은 화면이 관리자/스태프/일반에서 실제로 달라짐 + 토큰 페이로드 디코딩 | 05 |
| **트러블 01: SSE 연결이 조용히 죽는다** | **페이지의 실시간 흐름이 실제로 멈춘다** → "지금 멈춘 걸 눈치채셨나요?" → 원인 추적 → 하트비트/재연결 코드 | 06 |
| **트러블 02: 축제장 네트워크가 안 터진다** | **관람객이 오프라인 토글을 누르면 페이지가 진짜로 오프라인 모드가 된다** → 캐시로 계속 작동 → Service Worker 코드 | 07 |
| 전체 아키텍처 · 내가 한 범위 | 데이터 흐름도가 한 층씩 그려지며 내 담당 구간만 점등 | 08 |
| 결과물 · 화면 갤러리 | 관제 화면 6대가 전부 정상 신호로 전환 | 09 |
| 회고 · 다음 단계 | 축제 종료 → 모니터 순차 소등 → 퇴장 | 10 |

## A-4. 서비스 설계 결정 ↔ 웹 재현 대응

| 서비스에서 내린 결정 | 이 웹페이지에서의 재현 |
|---|---|
| 서버가 클라이언트에 밀어준다 (SSE) | 관람객이 스크롤을 멈춰도 지도가 계속 바뀐다 |
| 역할마다 보이는 게 다르다 (JWT) | 역할 스위처로 같은 화면의 정보량이 실제로 줄고 늘어난다 |
| 네트워크가 끊겨도 화면은 살아야 한다 (PWA) | 오프라인 토글을 누르면 실제로 캐시 데이터로 전환된다 |
| **연결이 조용히 죽는 버그가 있었다** | **PAGE 06에서 실시간 흐름이 진짜로 멈춘다** |

**관람객은 "실시간이었습니다"라고 읽는 게 아니라, 실시간을 겪고 그게 끊기는 것도 겪는다.**

## A-5. 관람 곡선 (감정 + 정보 밀도)

```
긴장  준비 ──╮ P02~03 현장 개시 (가장 분주함)
             ╰──╮      ╭── P06 사고 발생 (흐름 정지)
   P00~01       ╰──────╯  ╰─╮ P07 복구
   부팅                       ╰────── P09~10 정리 · 철수
정보  낮 ──────────╱▔▔▔▔▔▔▔▔▔▔▔╲──────
                P03~08 개발 밀도 최고조
신호  ○○○○○○ → ●○○○○○ → ●●●○○○ → ●●●●●○ → ●●●●●●
```

**핵심 장치**: 헤더에 **`● LIVE  부스 12 · 이벤트 47`** 카운터가 실시간으로 돌아간다.
이 숫자는 페이지 전체에서 **한 번도 멈추지 않는다 — 단 PAGE 06에서만 멈춘다.**
그 정지가 트러블슈팅의 도입이다.

## A-6. 명장면 2개

**① PAGE 03 — 폴링 vs SSE 동시 실행** (기술의 클라이맥스)
같은 부스 데이터를 왼쪽은 3초 폴링, 오른쪽은 SSE로 받는다.
관람객이 상태를 바꾸면 오른쪽은 **즉시**, 왼쪽은 최대 3초 뒤에 바뀐다.
동시에 하단 요청 카운터가 `폴링 60회 / SSE 1회` 로 벌어진다. 말이 필요 없다.

**② PAGE 06 — 실시간이 멈추는 순간** (서사의 클라이맥스)
헤더의 `● LIVE` 가 `○ 끊김` 으로 바뀌고 이벤트 로그가 멎는다.
그런데 **에러는 없다.** 뜨는 문장: *"에러도 안 나고, 화면은 계속 LIVE였습니다."*

## A-7. 다른 9개 방과의 차별점

| 축 | FestFlow | 나머지 |
|---|---|---|
| 정지 상태 | **없음** — 페이지가 항상 스스로 변한다 | 스크롤해야 변한다 |
| 진행 표시 | LIVE 이벤트 카운터 | 스크롤바 또는 없음 |
| 관람객 개입 | 상태를 **직접 바꾸면 시스템이 반응** | 대체로 읽기 전용 |
| 색 | 앰버 · 현장 조명 | 각자 |
| 핵심 감각 | **동시성** | 각자 |

## A-8. 절대 금지 (안전 규칙)

- 자동 애니메이션은 **`prefers-reduced-motion` 에서 전부 정지**, 정적 스냅샷으로 대체
- 실시간 루프는 **뷰포트 밖이면 반드시 멈춘다** (배터리 · `IntersectionObserver`)
- PAGE 06 흐름 정지는 **세션당 1회 · 예고 · 건너뛰기 · Esc 즉시 복구**
- 지어낸 지표(방문자 수 · 부스 수 · 처리량) 금지 — 시연 데이터임을 명시
- 소리 없음 (이 방은 무음 · 사운드 토글 자체를 두지 않는다)

---

# B. 공통 디자인 토큰 (참고용 — 각 프롬프트에 이미 포함됨)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#140f04` → `#191204` (P09부터) | 페이지 배경 |
| `--panel` | `#1c1608` → `#221a08` | 관제 패널 |
| `--primary` | `#fbbf24` | 앰버 · 라이브 · 강조 |
| `--accent` | `#fcd34d` | 보조 강조 |
| `--live` / `--stale` / `--down` | `#4ade80` / `#fbbf24` / `#f87171` | 상태 3색 |
| `--offline` | `#6b7280` | P07 오프라인 전용 |
| `--text` | `rgba(255,255,255,0.86)` | 본문 |
| `--muted` | `rgba(255,255,255,0.45)` | 캡션 |
| `--grid` | `rgba(251,191,36,0.07)` | 관제 격자 배경 |
| 코드 패널 | bg `#0f0c04`, border `rgba(251,191,36,0.16)` | |
| 문법 색 | 주석 `#8a7c4e` / 문자열 `#a3e635` / 키워드 `#fbbf24` / 숫자 `#7dd3fc` | |
| 이징 | `cubic-bezier(0.16,1,0.3,1)`, 0.3~0.8s | 빠르고 기민하게 |
| 숫자 | 전부 `tabular-nums` | |

---

# C. 페이지별 프롬프트

---

## PAGE 00 — 부팅 시퀀스 (관제 시스템 기동)

**개발 실체**: 왜 이걸 만들었는가 (동기)
**연출 장치**: 관제 모니터가 순차 부팅되며 마지막에 동기 문장이 뜸

```text
Build a full-screen cinematic BOOT SEQUENCE for a real-time festival operations
system portfolio page. Stack: React + TypeScript + Tailwind CSS + framer-motion.
Single self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
Why this project was built. The final readable line of the boot sequence must state
the developer's motivation - not decoration, not a tagline.

=== MOOD ===
A field operations tent at a university festival, minutes before it opens.
Amber worklight, canvas, monitors warming up. Busy, competent, slightly rushed.
NOT a sci-fi hacker terminal. NOT neon cyberpunk. This is a folding table with
laptops on it.

=== DESIGN TOKENS (use exactly) ===
background #140f04 | panel #1c1608 | primary amber #fbbf24 | accent #fcd34d
live #4ade80 | stale #fbbf24 | down #f87171
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.45)
grid lines rgba(251,191,36,0.07)
fonts: headings font-black, body sans leading-8, ALL status/labels font-mono
easing cubic-bezier(0.16,1,0.3,1), durations 0.3s-0.8s | rounded-md
all numbers tabular-nums

=== LAYOUT ===
Full viewport, position fixed, above page content.
Background: solid #140f04 plus a faint 32px grid in rgba(251,191,36,0.07),
and a soft amber radial glow at 50% 40% (rgba(251,191,36,0.06), 60vw wide) that
grows in intensity as the boot progresses.
Content is a single centered column, max-width 620px, left-aligned text.

=== BOOT TIMELINE (follow exactly) ===
t=0.00s  Near-black empty screen. Only the grid, very faint.
t=0.20s  A boot log begins printing, font-mono 13px, color rgba(255,255,255,0.45),
         line-height 2.0, one line every 0.22s, each line typing in character by
         character at ~55 chars/sec with a 1px amber block cursor.
         Lines, VERBATIM in order:
           "FESTFLOW OPS  v1.0"
           "부스 데이터 로드 ................ OK"
           "지도 타일 준비 .................. OK"
           "SSE 채널 연결 ................... OK"
           "권한 토큰 검증 .................. OK"
         Each "OK" is color #4ade80 and pops in 0.12s after its line finishes,
         with the dots filling in left-to-right.
t=1.40s  A horizontal amber rule draws from left to right across the column
         (width 0% -> 100%, 0.5s).
t=1.70s  TITLE appears above the log (the log slides down to make room, 0.4s):
           Line 1, VERBATIM: "FestFlow"
             64px font-black, color #fbbf24, letter-spacing -0.02em
           Line 2, VERBATIM: "대학 축제 실시간 부스 관제 · React + Spring Boot"
             14px font-mono, rgba(255,255,255,0.45), letter-spacing 0.14em,
             margin-top 14px
t=2.30s  THE MOTIVATION LINE fades in below the rule. This is the substance of this
         page. 17px, leading-9, rgba(255,255,255,0.86), max-width 560px.
         Korean copy, VERBATIM:
         "축제 당일에 부스 30개의 상태가 동시에 바뀐다.
          운영진 단톡방이 「A동 3번 부스 품절이요」로 도배되는 걸 보고,
          이건 화면 하나로 끝나야 하는 일이라고 생각했다."
         Reveal word by word, stagger 0.035s, opacity 0->1 with y 6px -> 0.
t=3.40s  A live status chip appears at the top-right of the column:
         a 7px #4ade80 dot with a soft pulsing halo (1.6s cycle), followed by
         font-mono 12px text, VERBATIM: "● LIVE  부스 12 · 이벤트 0"
         The event count starts incrementing immediately (see below) and MUST keep
         running for the rest of the page.
t=3.90s  Scroll hint at the bottom, font-mono 12px, rgba(255,255,255,0.45),
         VERBATIM: "↓ 현장으로"
         with a small amber chevron bouncing 4px on a 1.8s cycle.

=== THE LIVE COUNTER (defines this whole page - implement carefully) ===
From t=3.40s onward, an event counter increments on a randomized interval between
900ms and 2600ms, by 1 each time. It is driven by a single setInterval/timeout loop
owned at the page root, NOT by React state re-renders of the whole tree - write the
value into a ref and update only the counter node's textContent, or isolate it in
its own tiny component.
This counter must be visible in the persistent header on EVERY subsequent section.
It never resets. It is the page's heartbeat.
PAUSE IT when the tab is hidden (document.visibilitychange) and when the header is
off-screen. Resume on return.

=== ESCAPE HATCHES (required) ===
Any click, scroll, keypress, or Escape skips to the t=3.90s end state instantly.
A skip control is visible from t=0.30s at the bottom-right, font-mono 11px,
rgba(255,255,255,0.35), VERBATIM: "[ 건너뛰기 ]"

=== ACCESSIBILITY ===
prefers-reduced-motion: render the final state immediately with no typing, no
printing, no pulsing; the live counter still updates but at a fixed 3s interval
with no animation.
The boot log must be real text in the DOM, not an image.

=== RESPONSIVE ===
< 768px: title 38px, subtitle 12px, motivation line 15px, boot log 12px,
column padding 24px.

=== DO NOT ===
No matrix rain, no glitch effects, no scanlines, no CRT curvature, no neon cyan.
Do not use green as a theme color - green is reserved for the LIVE state only.
Do not delay the motivation line past 2.6s.
```

---

## PAGE 01 — 히어로 · 관제 벽 (모니터 6대)

**개발 실체**: 프로젝트 정체 + **데모 영상 · GitHub 저장소**
**연출 장치**: 링크가 버튼이 아니라 **관제 벽에 걸린 모니터 2대** — 나머지 4대는 실제 지표

```text
Build the HERO SECTION of a real-time festival operations portfolio page, built
around a wall of six operations monitors where two of the monitors ARE the demo
video and the GitHub repository.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained section.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the project is (identity + hard facts)
2. The demo video entry point
3. The GitHub repository link
Items 2 and 3 must read as two screens on an operations wall, never as a link row.

=== MOOD ===
A field operations tent. Amber worklight on canvas. Busy but controlled.
Not sci-fi, not neon. Practical hardware on a folding table.

=== DESIGN TOKENS (use exactly) ===
background #140f04 | panel #1c1608 | primary amber #fbbf24 | accent #fcd34d
live #4ade80 | stale #fbbf24 | down #f87171
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.45)
grid rgba(251,191,36,0.07) | panel border rgba(251,191,36,0.16)
fonts: headings font-black, body sans leading-8, labels/status font-mono uppercase
easing cubic-bezier(0.16,1,0.3,1) 0.3s-0.8s | rounded-md | numbers tabular-nums

=== PERSISTENT HEADER (fixed, present on every section of this page) ===
Height 54px, background rgba(20,15,4,0.82), backdrop-blur(10px),
bottom border 1px rgba(251,191,36,0.16).
  LEFT   "← 마을로"  13px font-mono rgba(255,255,255,0.45)
  CENTER "FestFlow"  14px font-black #fbbf24
  RIGHT  the live heartbeat, format VERBATIM: "● LIVE  부스 12 · 이벤트 47"
         13px font-mono, the dot 7px #4ade80 with a 1.6s pulsing halo, the number
         incrementing on a randomized 900-2600ms interval, tabular-nums.
         This counter continues across every section and NEVER resets.
         Pause it when the tab is hidden.

=== LAYOUT ===
min-height 100vh, centered column, max-width 1080px, padding-block 96px.
  Block A (top)    : kicker + headline + one-paragraph summary
  Block B (bottom) : THE OPS WALL - a 3-column x 2-row grid of six monitors,
                     gap 14px, each tile aspect-ratio 16/10.
                     Below 1024px -> 2 columns. Below 640px -> 1 column.

=== CONTENT (Korean copy - VERBATIM, never translate) ===

KICKER (font-mono 12px, letter-spacing 0.3em, uppercase, color #fbbf24):
  "REALTIME · 축제 부스 운영 관제"

HEADLINE (font-black, 42px desktop / 28px mobile, leading-tight,
          rgba(255,255,255,0.86)):
  Line 1, VERBATIM: "새로고침을 누르는 순간,"
  Line 2, color #fbbf24, margin-top 10px, VERBATIM:
    "그 화면은 이미 틀린 화면이다."

SUMMARY (16px, leading-9, rgba(255,255,255,0.86), max-width 700px, margin-top 24px):
  VERBATIM: "부스 상태가 바뀌는 즉시 모든 운영진 화면에 반영된다.
             서버가 밀어주고, 클라이언트는 기다리기만 한다."
  Emphasize "서버가 밀어주고" in #fcd34d, font-bold.

=== THE OPS WALL (the defining idea of this page) ===
Six monitor tiles. Each tile: background #1c1608, border 1px rgba(251,191,36,0.16),
rounded-md, overflow hidden, with a 22px header strip
(border-bottom 1px rgba(251,191,36,0.10)) containing a tiny label in font-mono 10px
uppercase letter-spacing 0.12em rgba(255,255,255,0.45) on the left, and a 6px status
dot on the right.
Hover any tile: border -> rgba(251,191,36,0.45), lift 3px, and a faint amber glow
box-shadow 0 6px 30px rgba(251,191,36,0.10). 0.3s.

TILE 1 (top-left) - LIVE BOOTH MAP  [status dot #4ade80]
  header label VERBATIM: "MAP · 실시간 배치"
  Body: a stylized top-down festival map drawn in pure CSS/SVG - an amber outline
  of a rectangular campus plaza with 12 small booth markers scattered across it.
  Each marker is a 9px rounded square. Marker colors: 8 x #4ade80 (open),
  3 x #fbbf24 (busy), 1 x #f87171 (closed).
  EVERY 2.4 SECONDS, one randomly chosen marker changes color with a 0.35s
  transition and emits a single expanding ring (0 -> 26px, opacity 0.5 -> 0, 0.7s).
  This animation runs on its own, with no user input. That is the point.

TILE 2 (top-center) - DEMO VIDEO  [status dot #fbbf24]
  header label VERBATIM: "REC · 데모 영상"
  Body: a dark 16/10 frame with a centered play triangle (28px, #fbbf24) inside a
  56px circle with a 1px rgba(251,191,36,0.45) border. Bottom-left overlay chip,
  font-mono 10px, background rgba(0,0,0,0.5), VERBATIM: "2분 08초"
  A thin red REC dot blinks in the top-right of the frame (1.2s cycle).
  Click -> opens a video lightbox: overlay rgba(10,7,2,0.93) backdrop-blur(8px),
  16/9 player centered, max-width 1040px, Esc or overlay click closes.
  If no video source is supplied, render a CSS placeholder with centered text
  VERBATIM "데모 영상 자리 · 16:9".
  [VIDEO-01] operator flow: booth status change -> map updates on a second device.

TILE 3 (top-right) - GITHUB  [status dot rgba(255,255,255,0.35)]
  header label VERBATIM: "REPO · 소스"
  Body: centered, a monospace "< >" glyph 30px rgba(255,255,255,0.72), below it
  font-mono 13px rgba(255,255,255,0.86) VERBATIM: "GitHub 저장소"
  and font-mono 10px rgba(255,255,255,0.45) VERBATIM: "React · Spring Boot · SSE"
  Click -> https://github.com/toadsam/FestFlow in a new tab
  (target _blank, rel noreferrer).
  Hover: the glyph shifts to #fbbf24 and a "↗" appears at the tile's top-right.

TILE 4 (bottom-left) - EVENT LOG  [status dot #4ade80]
  header label VERBATIM: "LOG · 이벤트 스트림"
  Body: a scrolling log, font-mono 10px, line-height 1.9, newest line entering at
  the BOTTOM and pushing older lines up (translateY animation, 0.3s), oldest fading
  out at 30% opacity before removal. Max 7 visible lines.
  A new line appears every 1.8-3.2s, randomized. Line format VERBATIM pattern:
    "14:22:07  A동 3번  판매중 → 품절"
  with the timestamp in rgba(255,255,255,0.35), the booth id in rgba(255,255,255,0.72),
  the old state in rgba(255,255,255,0.45), the arrow in #fbbf24, and the new state
  colored by kind: 판매중 #4ade80, 품절 #f87171, 준비중 #fbbf24.
  Rotate through booth ids A동 1~5번, B동 1~4번, C동 1~3번 and states
  판매중 / 품절 / 준비중.

TILE 5 (bottom-center) - THROUGHPUT  [status dot #4ade80]
  header label VERBATIM: "STREAM · 이벤트 수신"
  Body: a live sparkline (SVG polyline, stroke #fbbf24 1.5px, with a
  rgba(251,191,36,0.12) area fill) that appends a new data point every 1.2s and
  scrolls left, holding 40 points. Above it, a big number, font-mono 30px font-black
  #fbbf24, tabular-nums, which is the SAME event count shown in the header.
  Below it, font-mono 10px rgba(255,255,255,0.45), VERBATIM: "누적 이벤트"
  Bottom-right corner, font-mono 9px rgba(255,255,255,0.30),
  VERBATIM: "시연용 데이터"

TILE 6 (bottom-right) - STACK  [status dot rgba(255,255,255,0.35)]
  header label VERBATIM: "STACK · 기술"
  Body: nine small chips in a wrap layout, font-mono 10px, padding 4px 9px,
  rounded, border 1px rgba(251,191,36,0.20), color rgba(255,255,255,0.72).
  Labels VERBATIM: "React" "Vite" "Tailwind" "PWA" "Spring Boot" "JWT" "SSE"
  "MySQL" "React Leaflet"
  On section enter they appear one at a time, 0.05s apart.
  Hover a chip: background rgba(251,191,36,0.12), color #fcd34d.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Kicker fades up (y 10px -> 0, 0.5s)
0.15s  Headline line 1 word by word (stagger 0.035s)
0.60s  Headline line 2 (amber) word by word (stagger 0.045s)
1.10s  Summary paragraph reveals
1.50s  The six tiles fade up in a stagger, reading order, 0.08s apart,
       each y 16px -> 0 over 0.5s, and each tile's status dot lights up 0.2s after
       its tile lands
2.20s  All live animations (map, log, sparkline) begin simultaneously

=== PERFORMANCE (required) ===
Every self-running animation on this wall must PAUSE when the wall is outside the
viewport (IntersectionObserver) and when the tab is hidden. Use ONE shared timer
loop for all six tiles, not six independent intervals.
Do not re-render the whole section on every tick - isolate each ticking value.

=== RESPONSIVE ===
< 1024px: 2-column grid, order preserved.
< 640px: single column; TILE 5's sparkline holds 20 points; headline 28px.
Touch: tiles 2 and 3 remain fully tappable with a 44px minimum touch target.

=== ACCESSIBILITY ===
prefers-reduced-motion: all six tiles render a STATIC snapshot - the map shows fixed
marker colors, the log shows 7 fixed lines, the sparkline is a fixed shape, the
header counter updates every 3s with no animation. Nothing moves on its own.
Tiles 2 and 3 must be real focusable elements (button / anchor) with visible focus
rings (2px #fbbf24, offset 2px).
The event log region must NOT be an aria-live region - it would flood a screen
reader. Mark it aria-hidden and provide an adjacent visually-hidden text summary,
VERBATIM: "부스 상태 변경 이벤트가 실시간으로 표시되는 영역입니다."

=== DO NOT ===
Do not render the demo video and GitHub as a conventional button row anywhere.
Do not let the tiles animate in lockstep - randomize their intervals so the wall
feels alive rather than mechanical.
No neon, no glitch, no scanlines. No invented user/visitor/revenue metrics.
```

---

## PAGE 02 — SSE는 어떻게 동작하나 · 패킷이 도착한다

**개발 실체**: SSE 구독/수신 구현 + **실제 EventSource 코드와 Spring SseEmitter 코드**
**연출 장치**: 관람객이 부스 상태를 직접 바꾸면 **서버 → 패킷 → 지도** 경로가 눈앞에서 흐르고, 도착 순간 코드가 하이라이트됨

```text
Build a SECTION that visualizes a Server-Sent Events pipeline end to end, where the
viewer triggers a state change and watches the event packet physically travel from
server to client, with the corresponding real source code highlighting as it arrives.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That booth state changes are pushed by the server, not polled by the client
2. The real client-side EventSource subscription code
3. The real server-side Spring SseEmitter broadcast code
4. A deliberate forward hook: this connection can die silently (covered later)

=== MOOD ===
Operations tent, mid-shift. Amber, practical, kinetic. Everything is in motion but
nothing is chaotic.

=== DESIGN TOKENS (use exactly) ===
background #140f04 | panel #1c1608 | primary amber #fbbf24 | accent #fcd34d
live #4ade80 | stale #fbbf24 | down #f87171
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.45)
code bg #0f0c04, border rgba(251,191,36,0.16)
syntax: comments #8a7c4e, strings #a3e635, keywords #fbbf24, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.16,1,0.3,1) 0.3s-0.8s | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1080px, padding-block 120px.
  Block A : section label + heading + two paragraphs (max-width 760px)
  Block B : THE PIPELINE - full width, height 260px, a horizontal 3-stage diagram
  Block C : two code panels side by side, gap 18px (client left, server right)
            Below 1024px they stack, client first.

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.45)):
  "01 · 서버가 밀어준다"

HEADING (28px font-black, rgba(255,255,255,0.86)):
  VERBATIM: "클라이언트는 묻지 않는다. 그냥 열어두고 기다린다."

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "스태프가 부스 상태를 바꾸면, 서버가 연결된 모든 운영진에게 이벤트를 보낸다.
             각자의 화면은 아무것도 요청하지 않았는데 바뀐다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "축제 운영은 초 단위다. 3초 뒤에 아는 것과 지금 아는 것은 다른 정보다."
  Emphasize "지금 아는 것은 다른 정보다" in #fcd34d, font-bold.

=== BLOCK B: THE PIPELINE (the defining idea of this page) ===
A full-width panel, height 260px, background #1c1608, rounded-md,
border 1px rgba(251,191,36,0.16), padding 24px, position relative.
Three stages laid out horizontally, connected by two horizontal rails.

STAGE 1 (left, x ~10%) - THE STAFF DEVICE
  A 150x104px phone-ish frame, border 1px rgba(251,191,36,0.30), rounded-md,
  background #0f0c04. Label above it, font-mono 10px rgba(255,255,255,0.45),
  VERBATIM: "스태프 단말"
  Inside: a booth name, font-mono 11px rgba(255,255,255,0.72),
  VERBATIM: "A동 3번 부스"
  and THREE state buttons stacked, each font-mono 10px, padding 5px 10px, rounded,
  border 1px rgba(255,255,255,0.14):
    VERBATIM "판매중" (active color #4ade80)
    VERBATIM "품절"   (active color #f87171)
    VERBATIM "준비중" (active color #fbbf24)
  The currently selected one has a filled background at 14% of its color.
  THESE BUTTONS ARE REAL. Clicking one starts the whole sequence below.

STAGE 2 (center, x ~50%) - THE SERVER
  A 132x132px rounded square, border 1px rgba(251,191,36,0.30), background #0f0c04,
  containing a stacked "server rack" of three 10px bars.
  Label above, font-mono 10px, VERBATIM: "Spring Boot · SseEmitter"
  When an event passes through, the whole square pulses once: border ->
  rgba(251,191,36,0.75), a 0.4s glow box-shadow 0 0 30px rgba(251,191,36,0.22).

STAGE 3 (right, x ~86%) - THE OPERATOR MAP
  A 190x130px mini map frame, border 1px rgba(251,191,36,0.30), background #0f0c04,
  with 6 booth markers (9px rounded squares). One of them is labeled A3 and is the
  one that will change.
  Label above, font-mono 10px, VERBATIM: "운영진 화면"

THE RAILS
  Two 2px horizontal lines connecting stage 1 -> 2 and 2 -> 3,
  color rgba(251,191,36,0.18), with small tick marks every 20px.
  Above rail 1, font-mono 9px rgba(255,255,255,0.35), VERBATIM: "POST /booths/3/status"
  Above rail 2, font-mono 9px rgba(255,255,255,0.35), VERBATIM: "event: booth-updated"

THE PACKET ANIMATION (triggered by clicking a state button in Stage 1):
  t=0.00s  The clicked button flashes (background 30% of its color, 0.15s)
  t=0.05s  A packet - a 26x14px amber rounded rect with a 1px border and a tiny
           font-mono 8px label VERBATIM "PATCH" - departs Stage 1 and travels along
           rail 1 to Stage 2 over 0.45s, easing linear, leaving a fading amber
           trail (a gradient that dissipates over 0.3s).
  t=0.50s  Stage 2 pulses (see above). A brief font-mono 9px caption appears under
           it for 0.8s, VERBATIM: "구독자 3명에게 브로드캐스트"
  t=0.65s  THREE packets depart Stage 2 simultaneously along rail 2, but fanned
           vertically (-18px, 0, +18px), each 26x14px with label VERBATIM "SSE".
           They travel to Stage 3 over 0.4s. Two of them fade out just before
           arriving (they represent other operators); the middle one lands.
  t=1.05s  The A3 marker in Stage 3 changes to the new state's color over 0.3s and
           emits an expanding ring (0 -> 30px, opacity 0.6 -> 0, 0.7s).
           The header's global event counter increments by 1.
  t=1.15s  The code panels below highlight (see Block C).

AUTONOMOUS MODE: if the viewer does not click any button within 6 seconds of the
pipeline entering the viewport, run the sequence automatically with a randomly
chosen state, every 5 seconds, until the viewer interacts. Once the viewer clicks
once, autonomous mode stops permanently.
A hint sits at the bottom-left of the panel, font-mono 11px rgba(255,255,255,0.35),
fading out permanently after the first manual click,
VERBATIM: "왼쪽 단말에서 상태를 바꿔보세요"

=== BLOCK C: THE TWO CODE PANELS ===
Each panel: background #0f0c04, border 1px rgba(251,191,36,0.16), rounded-md.
Header bar 28px with three window dots (#ff5f56 #ffbd2e #27c93f, 8px) and a filename
in font-mono 11px rgba(255,255,255,0.45).
Body: font-mono 12px, leading-relaxed, line-number gutter rgba(255,255,255,0.22),
min-width 20px, right-aligned, user-select none.

LEFT PANEL - filename VERBATIM: "useBoothStream.ts"
  CONTENT: a React hook, roughly 20 lines, that opens an EventSource to the booth
  stream endpoint, registers a named event listener for booth updates, parses the
  JSON payload, merges it into local booth state, registers an error handler, and
  closes the connection in the cleanup return.
  HIGHLIGHT ROWS (background rgba(251,191,36,0.10)) when the packet arrives at
  Stage 3: the addEventListener line and the state-merge line. The highlight sweeps
  in from the left over 0.35s and fades out after 1.4s.
  Caption bar at the bottom, border-top 1px rgba(251,191,36,0.10), font-mono 11px
  rgba(255,255,255,0.45), prefixed "// ", VERBATIM:
    "연결은 한 번만 연다. 그 다음은 서버가 알아서 보낸다."

RIGHT PANEL - filename VERBATIM: "BoothEventPublisher.java"
  CONTENT: a Spring service, roughly 18 lines, holding a thread-safe collection of
  SseEmitter instances, a subscribe method that creates an emitter with a long
  timeout and registers onCompletion / onTimeout callbacks that remove it from the
  collection, and a broadcast method that iterates emitters and sends a named event
  with the booth payload, removing any emitter that throws on send.
  HIGHLIGHT ROWS when Stage 2 pulses: the broadcast loop's send line and the
  emitter-removal line.
  Caption bar, VERBATIM:
    "실패한 emitter를 즉시 걷어내지 않으면 컬렉션이 계속 자란다"

=== FORWARD HOOK (required - do not drop) ===
Below both code panels, one paragraph, 16px leading-9, max-width 760px,
rgba(255,255,255,0.86), margin-top 28px, VERBATIM:
  "이 구조에는 함정이 있다. 연결이 끊겨도 클라이언트는 에러를 못 받는 경우가 있다.
   화면은 멀쩡한데 데이터만 안 온다. 그 얘기는 뒤에서 하겠다."
Emphasize "화면은 멀쩡한데 데이터만 안 온다" in #f87171, font-bold.
This sets up the troubleshooting section - keep it exactly.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label fades in
0.15s  Heading word by word (stagger 0.03s)
0.65s  Paragraph 1, then paragraph 2 at 1.15s
1.60s  Pipeline panel fades up (y 20px -> 0, 0.6s); its three stages appear
       left to right 0.12s apart; the rails draw (width 0% -> 100%, 0.5s each,
       sequential)
2.60s  Both code panels fade up together (y 18px -> 0, 0.6s)
3.20s  The hint line appears; autonomous mode's 6s idle timer starts

=== PERFORMANCE ===
The autonomous loop and all packet animations must stop when the pipeline is out of
the viewport or the tab is hidden. Animate packets with transform only (never left/top).

=== RESPONSIVE ===
< 1024px: code panels stack (client first). Pipeline stays horizontal but stage
widths shrink to 118 / 104 / 150px and the rails shorten.
< 640px: the pipeline becomes VERTICAL - Stage 1 on top, Stage 2 middle, Stage 3
bottom, rails vertical, packets travel downward. Panel height auto (min 420px).
Code font 11px with internal horizontal scroll (the block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no packet travel and no autonomous mode. Clicking a state
button applies the change INSTANTLY at Stage 3 and highlights the code rows with no
sweep. Add a static caption under the pipeline, VERBATIM:
  "상태 변경이 서버를 거쳐 모든 운영진 화면에 전달됩니다."
The three state buttons must be real <button> elements with visible focus rings
(2px #fbbf24, offset 2px) and accessible names.
Code must be selectable, copyable text - never an image.

=== DO NOT ===
Do not use a syntax-highlighting library; hand-color tokens with spans.
Do not animate packets with left/top - transform only.
Do not omit the forward hook paragraph.
Do not claim any real-world throughput or user numbers.
```

---

## PAGE 03 — 왜 폴링이 아니라 SSE인가 · 나란히 돌려보기

**개발 실체**: 기술 선택의 근거 (폴링 · SSE · WebSocket 3안 비교) + **요청 수 차이**
**연출 장치**: 같은 데이터를 **두 방식이 동시에 실행** — 관람객이 지연과 요청 수를 눈으로 본다

```text
Build a TECHNICAL DECISION section that runs a polling client and an SSE client
SIDE BY SIDE on the same data at the same time, so the viewer can see the latency
and request-count difference themselves.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That three transports were considered: polling, SSE, WebSocket
2. WHY SSE won for this specific problem (server -> client only, HTTP-native,
   auto-reconnect built in), stated concretely
3. The honest cost of choosing SSE (what was given up)

=== MOOD ===
Operations tent, analytical moment. The developer stops narrating the festival and
starts explaining the engineering. Confident, precise, not salesy.

=== DESIGN TOKENS (use exactly) ===
background #140f04 | panel #1c1608 | primary amber #fbbf24 | accent #fcd34d
live #4ade80 | stale #fbbf24 | down #f87171
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.45)
code bg #0f0c04, border rgba(251,191,36,0.16)
fonts: headings font-black, body sans leading-8, ALL metrics/labels font-mono
easing cubic-bezier(0.16,1,0.3,1) 0.3s-0.8s | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE RACE - two panels side by side, equal width, gap 16px, height 320px
  Block C : the decision table, full width
  Block D : the honest-cost card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.45)):
  "02 · 왜 SSE였나"

HEADING (28px font-black):
  VERBATIM: "3초마다 물어보는 것과, 오면 받는 것"

PARAGRAPH (16px leading-9, margin-top 20px, max-width 720px):
  VERBATIM: "처음엔 3초 폴링으로 만들었다. 동작은 했다.
             문제는 부스가 하나도 안 바뀐 3초 동안에도 요청이 나간다는 거였다."

=== BLOCK B: THE RACE (the defining idea of this page) ===
Two panels, identical structure, side by side. Both are fed by the SAME simulated
booth-change events at the SAME moments.

Each panel: background #1c1608, rounded-md, height 320px, padding 18px,
LEFT panel border 1px rgba(255,255,255,0.14),
RIGHT panel border 1px rgba(251,191,36,0.35).

PANEL HEADER (each):
  LEFT  title font-mono 13px rgba(255,255,255,0.72), VERBATIM: "폴링 · 3초 간격"
  RIGHT title font-mono 13px #fbbf24,               VERBATIM: "SSE · 서버 푸시"

PANEL BODY (each), three stacked parts:

  PART 1 - THE BOOTH GRID (height 120px)
    Six booth cells in a 3x2 grid, each 1px border rgba(255,255,255,0.10),
    rounded, containing a font-mono 10px booth id (VERBATIM "A1" "A2" "A3"
    "B1" "B2" "B3") and a 8px status dot.
    When this panel receives an update, the affected cell's dot changes color and
    the cell flashes its border once.

  PART 2 - THE LATENCY READOUT (height 70px, centered)
    A large number, font-mono 34px font-black, tabular-nums, showing the delay in
    milliseconds between the source event and this panel's update.
    LEFT panel's number color is rgba(255,255,255,0.72); RIGHT panel's is #4ade80.
    Below it, font-mono 10px rgba(255,255,255,0.45), VERBATIM: "반영까지 걸린 시간"
    The number counts UP in real time while the panel is waiting (so the polling
    panel visibly climbs toward 3000 while the SSE panel snaps to a low value and
    stops).

  PART 3 - THE REQUEST COUNTER (height 60px)
    A horizontal bar that fills as requests accumulate, plus a font-mono 12px
    readout, format VERBATIM: "요청 0회"
    LEFT panel: increments EVERY 3 SECONDS regardless of whether anything changed.
    Its bar is rgba(255,255,255,0.30).
    RIGHT panel: increments ONCE at connection open and then NEVER AGAIN.
    Its bar is #fbbf24 and stays at a tiny width.
    Under the LEFT counter, once it exceeds 20, a small line fades in, font-mono
    10px #f87171, VERBATIM: "이 중 대부분은 바뀐 게 없는 응답"

THE SHARED EVENT SOURCE:
  A booth change fires every 4-9 seconds (randomized). The SSE panel reflects it
  within 40-120ms (simulate a small random network delay). The polling panel
  reflects it only at its next 3-second tick.
  Both panels must be driven by ONE timer loop at the section level.

CONTROL BAR (below both panels, centered, margin-top 16px):
  A button, font-mono 12px, padding 8px 18px, rounded, border 1px
  rgba(251,191,36,0.35), color #fbbf24, VERBATIM: "지금 상태 바꾸기"
  Clicking fires an immediate booth change into both panels, so the viewer can
  trigger the comparison on demand instead of waiting.
  Next to it, a reset link, font-mono 11px rgba(255,255,255,0.45),
  VERBATIM: "↻ 카운터 초기화"

=== BLOCK C: THE DECISION TABLE ===
Full width, margin-top 56px. A 4-column table, font-mono 12px,
header row rgba(255,255,255,0.45) uppercase letter-spacing 0.12em,
row separators 1px rgba(255,255,255,0.08), row padding 14px.
Column headers VERBATIM: "방식" | "장점" | "단점" | "판단"
Rows:
  Row 1  "폴링"       | "구현이 제일 단순"          | "변화 없어도 요청이 나간다" | "탈락"
  Row 2  "WebSocket"  | "양방향 · 지연 최소"        | "이 서비스는 양방향이 필요 없다. 프록시/인증 처리 비용만 늘어난다" | "탈락"
  Row 3  "SSE"        | "단방향 푸시 · HTTP 그대로 · 재연결 내장" | "서버→클라 한 방향만 된다" | "채택"
The 채택 row: background rgba(251,191,36,0.07), left border 2px #fbbf24, and its
판단 cell is #fbbf24 font-bold. The 탈락 cells are rgba(255,255,255,0.45).
Rows fade in 0.12s apart when the table enters the viewport; the 채택 row lands last
and its left border grows from height 0% to 100% over 0.5s.

Below the table, one line, 15px leading-8, VERBATIM:
  "부스 상태는 서버에서 클라이언트로만 흐른다. 그러면 SSE로 충분했다."
Put "서버에서 클라이언트로만" in #fcd34d, font-bold.

=== BLOCK D: THE HONEST COST CARD (required - do not remove) ===
Margin-top 40px, padding 22px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 11px letter-spacing 0.2em color #f87171,
  VERBATIM: "대신 감수한 것"
  Body 15px leading-8 margin-top 10px, VERBATIM:
  "SSE는 브라우저당 동시 연결 수 제한이 있고, 프록시 설정에 따라 응답이 버퍼링돼서
   이벤트가 뭉쳐서 도착하는 일이 있었다. 운영진 화면은 한 번에 한 탭만 쓴다는 전제를
   깔고 넘어갔다. 사용자가 늘면 이 전제부터 다시 봐야 한다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, then heading word by word at 0.15s
0.60s  Paragraph reveals
1.10s  Both race panels fade up together (y 18px -> 0, 0.6s)
1.70s  Booth grids populate cell by cell, 0.04s apart
2.00s  Both simulations START at exactly the same moment (this simultaneity is the
       whole point - never stagger their starts)
2.40s  Control bar fades in
Table and cost card animate on their own viewport entry.

=== PERFORMANCE ===
Both simulations pause when the race block leaves the viewport or the tab hides,
and RESUME WITHOUT RESETTING their counters.

=== RESPONSIVE ===
< 900px: the two race panels stack vertically (polling on top). Keep them visually
paired with a shared left border accent so the comparison still reads.
< 640px: booth grid becomes 2x3; latency number 26px; table becomes a stacked card
list where each row is a card with the four fields labeled.

=== ACCESSIBILITY ===
prefers-reduced-motion: no continuous simulation. Render a static final comparison
(polling 3000ms / 60 requests vs SSE ~90ms / 1 request) with a caption VERBATIM:
  "같은 조건에서 60초간 실행한 결과입니다. 시연용 시뮬레이션입니다."
The latency numbers must be tabular-nums so they don't jitter.
The "지금 상태 바꾸기" control must be a real <button> with a visible focus ring.

=== DO NOT ===
Do not present the simulated numbers as production measurements - a disclaimer must
be visible near the race panels at all times, font-mono 10px rgba(255,255,255,0.30),
VERBATIM: "시연용 시뮬레이션 · 실제 운영 수치 아님"
Do not remove the honest-cost card.
Do not make SSE win by an exaggerated margin - keep it realistic (40-120ms).
```

---

## PAGE 04 — 지도 위에 부스를 놓는다 · React Leaflet

**개발 실체**: 지도 좌표 기반 부스 배치 구현 + **좌표 데이터 구조와 마커 렌더 코드**
**연출 장치**: 관람객이 **마커를 직접 드래그** → 아래 코드의 좌표 숫자가 실시간으로 바뀜

```text
Build a SECTION about placing festival booths on a real map, where the viewer can
DRAG a booth marker and watch the coordinate values change live inside the source
code shown directly beside it.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
Do NOT load Leaflet or any external map library - draw a stylized map in CSS/SVG.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. Why a real map was used instead of a list or a floor-plan image
2. The booth coordinate data structure
3. The marker rendering code, with values that update as the viewer drags

=== MOOD ===
Operations tent, planning table. A paper site map with pins in it, lit by amber
worklight. Tactile.

=== DESIGN TOKENS (use exactly) ===
background #140f04 | panel #1c1608 | primary amber #fbbf24 | accent #fcd34d
live #4ade80 | stale #fbbf24 | down #f87171
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.45)
map land #191305 | map path rgba(251,191,36,0.22)
code bg #0f0c04, border rgba(251,191,36,0.16)
syntax: comments #8a7c4e, strings #a3e635, keywords #fbbf24, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.16,1,0.3,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1080px, padding-block 120px.
  Block A : label + heading + two paragraphs (max-width 740px)
  Block B : a two-column split, gap 18px
              LEFT  (60%) : the interactive map, height 440px
              RIGHT (40%) : the coordinate code panel, height 440px
            Below 1024px stacks, map first.
  Block C : the PWA forward-hook chip

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "03 · 지도 위의 부스"

HEADING (28px font-black):
  VERBATIM: "「본관 앞 세 번째」는 좌표가 아니다"

PARAGRAPH 1 (16px leading-9):
  VERBATIM: "운영진끼리는 「도서관 옆」으로 통한다. 처음 온 스태프에게는 안 통한다.
             부스는 결국 지도 위 한 점이어야 했다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "그림 한 장을 깔고 좌표를 얹는 방법도 있었다.
             그런데 축제는 매년 배치가 바뀐다. 그림을 다시 그리는 대신
             실제 지도 좌표를 쓰기로 했다."
  Emphasize "매년 배치가 바뀐다" in #fcd34d, font-bold.

=== BLOCK B LEFT: THE INTERACTIVE MAP ===
Container: height 440px, rounded-md, border 1px rgba(251,191,36,0.16),
background #191305, overflow hidden, position relative.

Header strip (30px, border-bottom 1px rgba(251,191,36,0.10)):
  left  font-mono 10px rgba(255,255,255,0.45), VERBATIM: "MAP · 배치 편집"
  right font-mono 10px rgba(255,255,255,0.45), VERBATIM: "마커를 드래그해보세요"
        (fades out permanently after the first drag)

MAP RENDERING (pure CSS/SVG, no external library):
  - A subtle 1px grid in rgba(251,191,36,0.06), 26px spacing
  - Four rounded building blocks in #221a08 with a 1px rgba(251,191,36,0.14)
    border, each with a font-mono 9px label in rgba(255,255,255,0.35):
    VERBATIM "본관" "학생회관" "도서관" "체육관"
  - Two curving paths drawn as SVG strokes, rgba(251,191,36,0.22), 2px, dashed
  - A north indicator "N ↑" at the top-right, font-mono 9px rgba(255,255,255,0.30)
  - A scale bar at the bottom-left: a 60px line with font-mono 9px label
    VERBATIM "50m"

THE MARKERS (5 of them):
  Each marker is a 26px teardrop/pin shape (SVG) with a 8px colored core.
  Booth labels shown next to each pin, font-mono 10px rgba(255,255,255,0.72):
    VERBATIM "A동 1번" "A동 3번" "B동 2번" "C동 1번" "푸드트럭"
  Core colors: 3 x #4ade80, 1 x #fbbf24, 1 x #f87171.
  Hover a pin: it lifts 4px, scales 1.12, and shows a small tooltip card
  (background #0f0c04, border 1px rgba(251,191,36,0.30), padding 8px 10px,
  font-mono 10px) listing three lines VERBATIM:
    "A동 3번 부스"  /  "상태: 판매중"  /  "운영: 10:00 - 18:00"

DRAG BEHAVIOR (the key interaction):
  Every marker is draggable within the map bounds using pointer events.
  While dragging:
    - the pin scales to 1.2 and a soft amber shadow appears beneath it
    - a crosshair guide (1px dashed rgba(251,191,36,0.30)) extends horizontally
      and vertically from the pin to the container edges
    - a live coordinate chip follows the pin, font-mono 10px, background #0f0c04,
      border 1px rgba(251,191,36,0.30), padding 3px 7px, format VERBATIM:
      "37.2836, 127.0448"
      (derive plausible lat/lng from the pin's normalized x/y within a small
       bounding box; always render 4 decimal places, tabular-nums)
    - THE CODE PANEL ON THE RIGHT UPDATES IN REAL TIME (see below)
  On drop: the pin settles with a 0.25s spring, and a single expanding ring plays.
  A reset control at the bottom-right of the map, font-mono 11px,
  rgba(255,255,255,0.45), VERBATIM: "↻ 원래 배치로"

=== BLOCK B RIGHT: THE COORDINATE CODE PANEL ===
Height 440px, background #0f0c04, border 1px rgba(251,191,36,0.16), rounded-md.
Header bar 28px, three window dots, filename font-mono 11px rgba(255,255,255,0.45),
VERBATIM: "booths.ts"

Body: font-mono 12px, leading-relaxed, line-number gutter rgba(255,255,255,0.22).
CONTENT: a TypeScript booth array, roughly 22 lines, where each entry has an id,
a Korean name, a status union value, and a position object with lat and lng.
Show 5 entries matching the 5 markers on the map, plus a short type definition
above them.

THE LIVE BINDING (this is the point of the page):
  While a marker is dragged, the lat and lng NUMBERS for that specific booth entry
  update in the code, in real time, with:
    - the changing numeric tokens rendered in #7dd3fc
    - that entire code row getting a rgba(251,191,36,0.12) background
    - the row scrolling into view inside the panel if it is off-screen
      (scroll the PANEL, never the page)
  When the drag ends, the highlight fades over 0.8s but the new values REMAIN.
  Update the numbers by writing to the DOM node directly inside a
  requestAnimationFrame - do NOT re-render the entire code block on every
  pointermove.

Caption bar at the bottom, border-top 1px rgba(251,191,36,0.10), font-mono 11px
rgba(255,255,255,0.45), prefixed "// ", VERBATIM:
  "배치가 바뀌면 이 배열만 갈아끼운다. 지도 코드는 안 건드린다."

=== BLOCK C: THE PWA FORWARD HOOK ===
Margin-top 32px, a wide chip: padding 16px 20px, rounded-md,
border 1px rgba(251,191,36,0.20), background rgba(251,191,36,0.04).
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "현장 제약"
  Body 15px leading-8 margin-top 8px, VERBATIM:
  "지도 타일은 네트워크를 탄다. 축제장 한복판에서 그게 제일 안 터진다.
   그래서 이 화면은 PWA로 만들어서 타일과 부스 데이터를 캐시해뒀다.
   그 얘기는 조금 뒤에 하겠다."
This is a deliberate forward hook for the offline section - keep it.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading at 0.15s (word by word, stagger 0.03s)
0.60s  Paragraphs 1 and 2, 0.5s apart
1.40s  Map container fades up (y 18px -> 0, 0.6s)
1.70s  The map's buildings fade in 0.08s apart, then the paths draw
       (stroke-dashoffset animation, 0.7s)
2.30s  The five pins DROP IN from 24px above, 0.1s apart, each landing with a
       0.3s spring and one expanding ring
2.90s  Code panel fades up; the "드래그해보세요" hint appears
3.40s  One pin (A동 3번) performs a single 8px nudge left and back (0.6s) to
       advertise draggability, once only

=== RESPONSIVE ===
< 1024px: stacked; map height 380px, code panel height auto (max 400px, internal
scroll).
< 640px: map height 320px; pin labels hidden until hover/tap; the coordinate chip
docks to the map's bottom-center instead of following the pin;
code font 11px with internal horizontal scroll.
Touch: drag works with touch events; apply touch-action: none on the PINS only
(never on the container) so the page can still scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: pins appear in place with no drop animation, no nudge hint.
Dragging still works.
Each pin must ALSO be keyboard operable: focusable (tabindex 0, role="application"
with an accessible name), arrow keys move it by 1% of the container per press,
Shift+arrow by 5%. Announce the new coordinates in an aria-live="polite" region on
key-move ONLY (never on pointermove - that would flood the screen reader).
Provide a visually-hidden text list of all five booths with their names, statuses,
and coordinates.

=== DO NOT ===
Do not load Leaflet, Mapbox, Google Maps, or any tile service - this is a stylized
CSS/SVG map. Add a footnote, font-mono 9px rgba(255,255,255,0.30),
VERBATIM: "실제 서비스는 React Leaflet + OSM 타일을 사용합니다"
Do not re-render the code block on every pointermove.
Do not use real personal or campus coordinates that could identify a private address.
```

---

## PAGE 05 — 같은 화면, 다른 권한 · JWT 역할 분리

**개발 실체**: JWT 기반 역할 분리 구현 + **토큰 페이로드와 서버 인가 코드**
**연출 장치**: **역할 스위처** — 관리자/스태프/일반을 누르면 같은 화면의 정보가 실제로 사라지고 나타남

```text
Build a SECTION about role-based access control, built around a ROLE SWITCHER that
visibly rebuilds the same operations screen for three different roles, with the JWT
payload and the server-side authorization code shown alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That three roles exist and see genuinely different screens
2. What is actually inside the JWT payload
3. The server-side authorization code that enforces it
4. The point that hiding UI is not security - the server decides

=== MOOD ===
Operations tent, permissions desk. Amber, orderly. This page is about boundaries.

=== DESIGN TOKENS (use exactly) ===
background #140f04 | panel #1c1608 | primary amber #fbbf24 | accent #fcd34d
live #4ade80 | down #f87171
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.45)
code bg #0f0c04, border rgba(251,191,36,0.16)
syntax: comments #8a7c4e, strings #a3e635, keywords #fbbf24, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.16,1,0.3,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1080px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the role switcher (3 segmented buttons), centered
  Block C : THE MORPHING SCREEN - full width, height 420px
  Block D : two code panels side by side (JWT payload left, server guard right)
  Block E : the security note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "04 · 같은 화면, 다른 권한"

HEADING (28px font-black):
  VERBATIM: "스태프는 자기 부스만, 관리자는 전부"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "축제 운영진은 40명이 넘는다. 전원에게 매출 데이터를 보여줄 이유가 없고,
             일반 학생에게 부스 상태를 바꿀 권한을 줄 이유는 더 없다."

=== BLOCK B: THE ROLE SWITCHER ===
A segmented control, centered, margin-top 36px.
Container: inline-flex, background #0f0c04, border 1px rgba(251,191,36,0.20),
rounded-md, padding 4px.
Three buttons, each font-mono 12px, padding 9px 22px, rounded:
  VERBATIM "일반 사용자"  |  VERBATIM "스태프"  |  VERBATIM "관리자"
The active one has background rgba(251,191,36,0.14) and color #fbbf24.
An amber indicator bar (2px, #fbbf24) slides beneath the active button with a
0.35s spring - it must SLIDE between positions, never jump.
Default active: "스태프" (the middle one, so the viewer can move in both directions).

Below the switcher, a small line, font-mono 11px rgba(255,255,255,0.45),
which changes with the role, VERBATIM:
  일반 사용자 -> "부스 위치와 운영 시간만 볼 수 있습니다"
  스태프     -> "담당 부스의 상태를 변경할 수 있습니다"
  관리자     -> "전체 부스와 운영 지표에 접근할 수 있습니다"

=== BLOCK C: THE MORPHING SCREEN (the defining idea of this page) ===
A single operations screen mockup, height 420px, background #1c1608,
border 1px rgba(251,191,36,0.16), rounded-md, that REBUILDS ITSELF when the role
changes. Same container, different contents - never two separate screenshots.

Screen header strip (34px): a title font-mono 12px rgba(255,255,255,0.72),
VERBATIM: "FestFlow · 부스 현황"
and on the right, a role badge, font-mono 10px, padding 3px 9px, rounded,
whose label and color change with the role:
  일반 사용자 -> border rgba(255,255,255,0.20), color rgba(255,255,255,0.60),
                 VERBATIM "GUEST"
  스태프     -> border rgba(251,191,36,0.40), color #fbbf24, VERBATIM "STAFF"
  관리자     -> border rgba(74,222,128,0.40), color #4ade80, VERBATIM "ADMIN"

Screen body is a grid of MODULES. Each module is a bordered card. The set of
modules present depends on the role:

  MODULE "부스 목록"      - present for ALL roles
      A 6-row list of booth names and status dots.
      GUEST sees only name + status. STAFF and ADMIN also see an "운영 시간" column.
  MODULE "상태 변경"      - STAFF and ADMIN only
      Three state buttons (판매중 / 품절 / 준비중).
      For STAFF, only ONE booth row is actionable and the rest are dimmed to 35%
      with a tiny font-mono 9px note VERBATIM "담당 아님".
      For ADMIN, all rows are actionable.
  MODULE "운영 지표"      - ADMIN only
      Four small stat cells: labels VERBATIM "운영 부스" "품절" "준비중" "누적 이벤트"
      with tabular-nums values.
  MODULE "스태프 배정"    - ADMIN only
      A short 3-row list with placeholder names VERBATIM "스태프 A" "스태프 B"
      "스태프 C", each with an assigned booth chip.

THE TRANSITION (must feel like a rebuild, not a fade):
  On role change:
    t=0.00s  Modules that are LEAVING collapse: scale 0.96, opacity -> 0,
             height -> 0 over 0.28s, staggered 0.05s apart.
    t=0.20s  The role badge cross-fades and its border color animates.
    t=0.30s  Modules that are ARRIVING expand in: height 0 -> auto,
             opacity 0 -> 1, y 10px -> 0, over 0.35s, staggered 0.06s apart,
             each with a single 1px amber border flash on arrival.
    t=0.30s  Rows that merely CHANGE (like dimming for STAFF) animate their opacity
             over 0.3s in place - they must NOT unmount and remount.
  Use layout animations so the surviving modules physically SLIDE to their new
  positions rather than snapping.

A count chip in the screen's bottom-right, font-mono 10px rgba(255,255,255,0.45),
which updates with the role, format VERBATIM: "접근 가능 모듈 2 / 4"

=== BLOCK D: TWO CODE PANELS ===
Side by side, gap 18px, margin-top 44px. Stack below 1024px.
Each: background #0f0c04, border 1px rgba(251,191,36,0.16), rounded-md, header bar
with three window dots and a filename in font-mono 11px rgba(255,255,255,0.45).

LEFT PANEL - filename VERBATIM: "JWT payload (decoded)"
  Body: a JSON object, roughly 10 lines, showing a subject, a Korean display name,
  a role field, an array of assigned booth ids, an issued-at and an expiry.
  THE ROLE FIELD AND THE BOOTH ARRAY CHANGE LIVE with the role switcher:
    - the role string value re-types character by character (0.3s) on change
    - the booth id array grows or shrinks with a height animation
    - both changed rows get a rgba(251,191,36,0.12) background for 1.2s
  GUEST payload has role "GUEST" and an empty booth array.
  STAFF has role "STAFF" and exactly one booth id.
  ADMIN has role "ADMIN" and a wildcard entry.
  Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
    "이건 서명된 값이다. 클라이언트가 바꿀 수 없다."

RIGHT PANEL - filename VERBATIM: "BoothController.java"
  Body: a Spring controller method, roughly 16 lines, for updating a booth status:
  a method-level security annotation restricting it to STAFF and ADMIN, extraction
  of the authenticated principal, a check that a STAFF principal's assigned booth
  list contains the requested booth id (throwing a forbidden response otherwise),
  the status update call, and the event broadcast call.
  HIGHLIGHT ROWS: the security annotation and the assigned-booth check.
  When the viewer is on GUEST and clicks any disabled control in Block C, this
  panel's annotation row FLASHES red (rgba(248,113,113,0.16), 0.5s) and a toast
  appears at the screen's bottom-center, font-mono 11px, background #0f0c04,
  border 1px rgba(248,113,113,0.35), color #f87171, VERBATIM:
    "403 · 권한이 없습니다"
  Caption bar, VERBATIM:
    "UI에서 버튼을 숨기는 건 보안이 아니다. 막는 건 여기다."

=== BLOCK E: THE SECURITY NOTE ===
Margin-top 36px, padding 20px, rounded-md, border 1px rgba(251,191,36,0.22),
background rgba(251,191,36,0.04), border-left 3px #fbbf24.
  Label font-mono 11px letter-spacing 0.2em #fbbf24, VERBATIM: "배운 것"
  Body 15px leading-8 margin-top 10px, VERBATIM:
  "처음엔 프론트에서 역할에 따라 버튼만 감췄다. 개발자 도구로 요청을 그대로 보내니
   그냥 통과했다. 그 다음부터 권한 체크를 서버 쪽으로 전부 옮겼고,
   프론트의 분기는 「보안」이 아니라 「편의」라고 이름을 다시 붙였다."
  Emphasize "「보안」이 아니라 「편의」" in #fcd34d, font-bold.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading at 0.15s
0.60s  Paragraph reveals
1.10s  Role switcher fades up; the indicator bar draws from 0 width to the active
       button's width over 0.4s
1.50s  The morphing screen fades up, then its modules populate 0.07s apart
2.30s  Both code panels fade up together
2.90s  A single automatic demonstration: the switcher moves 스태프 -> 관리자 by
       itself, plays the full morph, then returns to 스태프. ONCE ONLY, and only
       if the viewer has not already clicked. Add a tiny caption during it,
       font-mono 10px rgba(255,255,255,0.35), VERBATIM: "자동 시연"

=== RESPONSIVE ===
< 1024px: code panels stack (JWT first). Morph screen height auto, min 460px.
< 640px: role switcher becomes full width with three equal buttons at 11px;
modules stack in a single column; the "운영 지표" module becomes a 2x2 grid.

=== ACCESSIBILITY ===
prefers-reduced-motion: no auto-demonstration, no sliding indicator (it jumps),
modules cross-fade in 0.15s instead of collapsing/expanding.
The role switcher must be a real radiogroup (role="radiogroup" with three
role="radio" buttons), arrow-key navigable, with visible focus rings
(2px #fbbf24, offset 2px).
Announce role changes once via aria-live="polite", using the sub-line copy.
Modules removed for a role must be REMOVED from the DOM, not merely hidden - that
matches the actual behavior being described.

=== DO NOT ===
Do not show a real JWT string or any real signature - the panel shows the DECODED
payload only, and must carry a footnote, font-mono 9px rgba(255,255,255,0.30),
VERBATIM: "예시 페이로드 · 실제 토큰 아님"
Do not use real names in the staff list.
Do not imply the frontend enforces security.
```

---

## PAGE 06 — 트러블슈팅 01 · 조용히 죽는 연결

**개발 실체**: SSE 연결 유실 버그의 **전체 추적 과정** (증상 → 재현 → 소거 → 실패한 시도 → 원인 → 해결 → 검증 → 한계)
**연출 장치**: **페이지의 실시간 흐름이 실제로 멈춘다.** 에러 없이. 그게 이 버그의 정의였다.
**⚠️ 세션당 1회 · 인라인 예고 · 건너뛰기 · Esc 즉시 복구**

```text
Build a TROUBLESHOOTING CASE FILE section that opens by actually FREEZING the
page's own live data stream - with no error, no spinner, no warning - to reproduce
the exact bug being described, then walks the full diagnosis.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete debugging process for a silent SSE disconnection bug:
symptom -> reproduction -> elimination of suspects -> a failed attempt ->
root cause -> the fix (before/after code) -> verification -> remaining limits.
Every one of these eight parts is required.

=== SAFETY RULES (implement first, non-negotiable) ===
1. The freeze fires at most ONCE per session (sessionStorage flag). Scrolling away
   and back must NOT re-trigger it.
2. An inline advance warning appears 240px ABOVE this section with a skip control.
   If skipped, the freeze never runs and the case file renders normally.
3. Never fires under prefers-reduced-motion.
4. The freeze lasts EXACTLY 4 seconds of stopped data and affects ONLY the live
   counters and the event log. It NEVER blocks scrolling, clicking, or keyboard input.
5. Escape ends it immediately and restores the stream.
6. On unmount, the stream MUST resume - clean up in the effect return.
7. A skip affordance is visible during the sequence, bottom-right, font-mono 11px,
   rgba(255,255,255,0.35), VERBATIM: "[ Esc · 복구 ]"

=== MOOD ===
Something is wrong and nobody noticed. The tent is still lit, people are still
working, and the data on the screen is 20 minutes old. Quiet dread, then methodical
investigation.

=== DESIGN TOKENS (use exactly) ===
background #140f04 | panel #1c1608 | primary amber #fbbf24 | accent #fcd34d
live #4ade80 | stale #fbbf24 | down #f87171
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.45)
code bg #0f0c04, border rgba(251,191,36,0.16)
syntax: comments #8a7c4e, strings #a3e635, keywords #fbbf24, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.16,1,0.3,1) | rounded-md | numbers tabular-nums

=== BLOCK 0: THE ADVANCE WARNING (240px above the section) ===
A slim card, max-width 760px, centered, padding 16px 20px, rounded-md,
border 1px rgba(251,191,36,0.28), background rgba(251,191,36,0.04).
  Label font-mono 10px letter-spacing 0.2em #fbbf24, VERBATIM: "▲ 다음 구간 안내"
  Body 14px leading-7, VERBATIM:
  "다음 구간에서 이 페이지의 실시간 표시가 약 4초간 멈춥니다.
   스크롤과 조작은 그대로 되고, 소리나 깜빡임은 없습니다."
  Button, font-mono 11px, border 1px rgba(255,255,255,0.20), rounded, padding
  6px 14px, margin-top 12px, VERBATIM: "[ 이 연출 건너뛰기 ]"
  On click the card collapses to a single line, VERBATIM: "건너뛰기로 설정되었습니다"

=== PART 1 - THE FREEZE (IntersectionObserver, threshold 0.5) ===

t=0.00s  The page's global live counter STOPS incrementing.
         The event log stops receiving new lines.
         The sparkline stops advancing.
         NOTHING ELSE CHANGES. No error, no spinner, no color change, no message.
         The header still says VERBATIM "● LIVE" with a green dot, still pulsing.
         THIS IS THE ENTIRE POINT - the UI keeps lying.

t=2.00s  The green header dot begins a very slow desaturation toward
         rgba(255,255,255,0.30) over 1.5s. Almost imperceptible. No text change yet.

t=3.50s  The header status finally flips: the dot becomes #f87171 and the text
         changes to VERBATIM "○ 끊김  마지막 수신 3초 전"
         with a 0.3s cross-fade. The "마지막 수신" seconds value counts up in real
         time from here.

t=4.00s  A message fades in, centered over the section, max-width 560px:
           Line 1, 19px, rgba(255,255,255,0.86), leading-9, VERBATIM:
             "방금 4초 동안 데이터가 안 왔습니다."
           Line 2, 19px, color #f87171, font-bold, margin-top 10px, VERBATIM:
             "에러도 안 났고, 화면은 계속 LIVE였습니다."
         Reveal line 1 word by word (stagger 0.045s), line 2 after 0.5s.

t=5.20s  The stream RESUMES. The counter resumes from where it stopped (it must
         NOT jump to catch up - the lost events are gone, and that is accurate).
         The header returns to VERBATIM "● LIVE" over 0.4s.
         The message fades out over 0.4s.
         A small line remains under the header for 3s, font-mono 10px #fbbf24,
         VERBATIM: "재연결됨 · 누락 이벤트 복구 안 됨"

REDUCED-MOTION / SKIPPED FALLBACK:
  Skip Part 1 and render a static card in the flow instead:
    padding 22px, rounded-md, border 1px rgba(251,191,36,0.28),
    background rgba(251,191,36,0.04)
    Label font-mono 11px #fbbf24, VERBATIM: "▲ 생략된 연출"
    Body 15px leading-8, VERBATIM:
    "이 지점에서 원래는 페이지의 실시간 표시가 4초간 멈춥니다.
     에러도 경고도 없이 데이터만 안 오는 상태를 그대로 재현한 연출입니다."
    Button font-mono 12px, VERBATIM: "[ 지금 재생하기 ]"
  Part 2 (the case file) ALWAYS renders regardless.

=== PART 2 - THE CASE FILE (always renders; this is the substance) ===
Centered column, max-width 860px, padding-block 96px.

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "05 · 트러블슈팅 01"

HEADING (30px font-black, rgba(255,255,255,0.86), margin-top 12px):
  VERBATIM: "제일 무서운 버그는 에러를 안 낸다"

--- 2-1. SYMPTOM ---
A card: padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "네트워크가 불안정한 환경에서 운영진 화면이 옛날 데이터를 그대로 띄우고 있었다.
   화면에는 아무 문제도 표시되지 않아서 보는 사람은 알 수가 없었다.
   새로고침하니 정상으로 돌아왔다."

--- 2-2. REPRODUCTION ---
Margin-top 28px. A two-column row (stacks below 720px):
  LEFT: a label font-mono 10px rgba(255,255,255,0.45), VERBATIM: "재현 조건"
        and a 3-item list, font-mono 12px, each with a "· " prefix, VERBATIM:
          "노트북 절전 모드 진입 후 복귀"
          "모바일에서 다른 앱으로 전환 후 5분 뒤 복귀"
          "프록시를 통과하는 네트워크"
  RIGHT: a big stat, font-mono 40px font-black #f87171, tabular-nums,
        VERBATIM: "8 / 10"
        and below it font-mono 11px rgba(255,255,255,0.45),
        VERBATIM: "절전 복귀 시 재현 횟수"
        The number counts up 0 -> 8 over 0.9s when it enters the viewport.
  Below the row, font-mono 10px rgba(255,255,255,0.30),
  VERBATIM: "직접 손으로 10회 시도한 결과. 자동화된 측정은 아님."

--- 2-3. ELIMINATION TABLE ---
Margin-top 36px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.45),
VERBATIM: "의심한 것들"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "의심" | "확인 방법" | "결과"
Rows (eliminated rows' 결과 cell is rgba(255,255,255,0.45) with a "✕ " prefix;
the confirmed row's cell is #f87171 with a "● " prefix):
  Row 1  "서버가 이벤트를 안 보냄"     | "서버 로그에서 broadcast 호출 확인" | "✕ 정상 호출됨"
  Row 2  "브라우저 탭이 스로틀됨"       | "포그라운드에서도 재현"             | "✕ 관련 없음"
  Row 3  "React 상태 업데이트가 씹힘"   | "onmessage에 콘솔 로그 추가"        | "✕ 로그 자체가 안 찍힘"
  Row 4  "연결이 이미 끊겨 있었다"      | "readyState 값을 화면에 노출"       | "● 여기였다"
Rows reveal 0.16s apart when the table enters the viewport, each sliding in from
x -10px. The confirmed row lands last and its left edge grows a 2px #f87171 bar
over 0.5s.

--- 2-4. THE FAILED ATTEMPT (required - do not remove) ---
Margin-top 32px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.45),
  VERBATIM: "먼저 시도했다가 실패한 것"
  Body 15px leading-8, VERBATIM:
  "onerror에서 재연결하도록 먼저 고쳤다. 그런데 이 케이스에서는 onerror 자체가
   안 불린다. 브라우저가 연결을 정리했는데 이벤트가 안 온 거라, 잡을 훅이 없었다."

--- 2-5. ROOT CAUSE ---
Margin-top 32px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인"
  Body 16px leading-8, VERBATIM:
  "EventSource는 연결이 죽어도 항상 onerror를 주지 않는다.
   절전이나 백그라운드 전환으로 소켓이 정리되면, 객체는 살아 있고 이벤트만 안 온다.
   즉 「끊김」을 이벤트로 알 수 없으면, 「안 온 지 얼마나 됐는지」로 판단해야 한다."
  Emphasize "「안 온 지 얼마나 됐는지」로 판단해야 한다" in #fcd34d, font-bold.

--- 2-6. THE FIX (before / after code) ---
Margin-top 36px. Two code panels, side by side above 1024px, stacked below, gap 16px.
Each: background #0f0c04, border 1px, rounded-md, header with three window dots
and a filename, body font-mono 12px with a line-number gutter.

  BEFORE panel - border 1px rgba(248,113,113,0.28),
    filename VERBATIM: "useBoothStream.ts (before)"
    CONTENT: ~12 lines. Opens an EventSource, registers a message listener and an
    onerror handler that attempts a reconnect, and closes on cleanup.
    HIGHLIGHT the onerror handler row with rgba(248,113,113,0.12) and put a small
    inline marker at its right edge, font-mono 10px #f87171,
    VERBATIM: "← 안 불린다"

  AFTER panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "useBoothStream.ts (after)"
    CONTENT: ~18 lines. Same setup, plus: a lastEventAt timestamp ref updated on
    every received message including a server heartbeat event; a watchdog interval
    comparing now - lastEventAt against a staleness threshold that, when exceeded,
    closes the current EventSource and reopens it with a backoff; a
    visibilitychange listener forcing an immediate staleness check on return to the
    foreground; and cleanup clearing both the interval and the listener.
    HIGHLIGHT the watchdog comparison row and the visibilitychange row with
    rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "이벤트를 기다리지 말고, 안 온 시간을 재라"

  Below both panels, a one-line server chip, font-mono 11px, background #0f0c04,
  border 1px rgba(251,191,36,0.20), rounded, padding 8px 12px, with the filename
  prefix in rgba(255,255,255,0.35), showing the server sending a periodic heartbeat
  comment on each emitter. Prefix VERBATIM: "BoothEventPublisher.java"

--- 2-7. VERIFICATION ---
Margin-top 36px. A row of three stat cells, gap 12px (stacks below 640px).
Each cell: padding 16px, rounded-md, border 1px rgba(74,222,128,0.22),
background rgba(74,222,128,0.04).
  Cell 1  value font-mono 28px font-black #4ade80 VERBATIM "10 / 10"
          label font-mono 10px rgba(255,255,255,0.45) VERBATIM "절전 복귀 후 자동 재연결"
  Cell 2  value VERBATIM "3회"    label VERBATIM "재현 시나리오 반복 검증"
  Cell 3  value VERBATIM "0건"    label VERBATIM "리허설 2일차 재발"
Values count up when the row enters the viewport.
Below the row, font-mono 10px rgba(255,255,255,0.30),
VERBATIM: "수동 테스트 결과입니다. 자동화된 회귀 테스트는 붙이지 못했습니다."

--- 2-8. REMAINING LIMITS (required - do not remove) ---
Margin-top 30px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.45),
  VERBATIM: "아직 남은 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "끊긴 사이에 발생한 이벤트는 복구하지 못한다. 재연결 후 전체 상태를 다시 받아온다."
    "감지 임계값을 몇 초로 둘지는 감으로 정했다. 근거가 될 데이터가 없었다."
    "동시 접속자가 늘었을 때 하트비트 비용이 얼마인지 재보지 않았다."

=== ANIMATION TIMELINE (Part 2, on viewport entry of each block) ===
Each block animates on its own entry: fade up y 16px -> 0 over 0.5s.
The elimination table's rows are the only staggered element (0.16s apart).
Do not animate the code panels' contents - they appear whole.

=== RESPONSIVE ===
< 1024px: before/after code panels stack (before on top).
< 720px: the reproduction row stacks; the verification cells stack;
code font 11px with internal horizontal scroll (the block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: Part 1 never runs; render the fallback card. All Part 2
reveals are instant.
During Part 1, announce the state change ONCE via aria-live="polite" using
VERBATIM: "실시간 데이터 수신이 중단되었습니다."
The freeze must never trap focus or block input.
Code panels are selectable, copyable text.

=== DO NOT ===
Do not show a spinner, error toast, or red banner during the first 3.5 seconds of
the freeze - the absence of feedback IS the bug being demonstrated.
Do not let the counter "catch up" after resuming.
Do not remove the failed-attempt card or the remaining-limits card.
Do not fire the freeze more than once per session under any circumstance.
```

---

## PAGE 07 — 트러블슈팅 02 · 축제장에서 인터넷이 안 터진다

**개발 실체**: PWA 오프라인 대응 + **Service Worker 캐시 전략 코드**
**연출 장치**: 관람객이 **오프라인 토글**을 누르면 페이지가 진짜로 오프라인 모드가 되고, 캐시된 데이터로 계속 작동한다

```text
Build a SECTION about offline resilience where the viewer can flip the page itself
into an offline state and watch which parts survive on cached data and which parts
degrade, with the Service Worker caching code shown alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The real-world constraint: festival grounds have terrible connectivity
2. Which data must survive offline and which may not
3. The actual Service Worker caching strategy code, and why cache-first vs
   network-first was chosen per resource
4. An honest statement of what still breaks offline

=== MOOD ===
The tent, mid-afternoon, phone showing one bar. Practical problem-solving.
The amber stays; a cool grey creeps in when offline.

=== DESIGN TOKENS (use exactly) ===
background #140f04 | panel #1c1608 | primary amber #fbbf24 | accent #fcd34d
live #4ade80 | down #f87171 | offline grey #6b7280
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.45)
code bg #0f0c04, border rgba(251,191,36,0.16)
syntax: comments #8a7c4e, strings #a3e635, keywords #fbbf24, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.16,1,0.3,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE OFFLINE TOGGLE + the survival board
  Block C : the caching strategy table
  Block D : the Service Worker code panel
  Block E : the honest limits card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "06 · 트러블슈팅 02"

HEADING (30px font-black):
  VERBATIM: "축제장 한복판에서 제일 안 터지는 건 인터넷이다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "사람이 몰리면 기지국이 먼저 죽는다. 리허설 때는 잘 되던 화면이
             본 행사 때 안 열리는 게 제일 무서웠다."

=== BLOCK B: THE OFFLINE TOGGLE + SURVIVAL BOARD (the defining idea) ===

THE TOGGLE (centered, margin-top 32px):
  A switch control, width 220px, height 44px, background #0f0c04,
  border 1px rgba(251,191,36,0.20), rounded-md, padding 4px, with two halves:
    LEFT  label font-mono 12px, VERBATIM: "온라인"
    RIGHT label font-mono 12px, VERBATIM: "오프라인"
  A sliding indicator (0.35s spring) sits behind the active half:
    online  -> background rgba(251,191,36,0.14), label color #fbbf24
    offline -> background rgba(107,114,128,0.20), label color #6b7280

WHEN SWITCHED TO OFFLINE, the ENTIRE SECTION visibly changes:
  t=0.00s  The page's global live counter STOPS (header shows VERBATIM
           "○ 오프라인  캐시 데이터 표시 중", dot #6b7280).
  t=0.10s  A thin offline banner slides down from the top of this section,
           height 32px, background rgba(107,114,128,0.14),
           border-bottom 1px rgba(107,114,128,0.30), font-mono 11px #6b7280,
           centered, VERBATIM: "오프라인 · 마지막으로 받은 데이터를 보여주고 있습니다"
  t=0.20s  The section's amber accents DESATURATE toward #6b7280 over 0.5s
           (use a CSS filter: saturate() transition on ONE wrapper, not per element).
  t=0.30s  The survival board updates (below).
Switching back to 온라인 reverses everything over 0.5s and the live counter resumes.

THE SURVIVAL BOARD:
A 3-column x 2-row grid of six capability cards, gap 12px
(2 columns below 900px, 1 below 640px).
Each card: padding 18px, rounded-md, border 1px, background #1c1608, height 128px.
Each contains: a title (font-mono 13px), a one-line description (13px leading-7,
rgba(255,255,255,0.45)), and a status chip at the bottom (font-mono 10px,
padding 3px 9px, rounded).

Cards with their ONLINE and OFFLINE states:
  1. title VERBATIM "부스 목록"       desc VERBATIM "이름 · 위치 · 운영 시간"
     online "정상" #4ade80   offline "캐시 사용" #fbbf24
  2. title VERBATIM "지도 타일"       desc VERBATIM "캠퍼스 배경 이미지"
     online "정상" #4ade80   offline "캐시 사용" #fbbf24
  3. title VERBATIM "앱 셸"           desc VERBATIM "화면 구조 · 스타일 · 스크립트"
     online "정상" #4ade80   offline "캐시 사용" #fbbf24
  4. title VERBATIM "실시간 상태 변경" desc VERBATIM "SSE 이벤트 수신"
     online "정상" #4ade80   offline "중단" #f87171
  5. title VERBATIM "상태 변경 전송"   desc VERBATIM "스태프의 부스 상태 수정"
     online "정상" #4ade80   offline "불가" #f87171
  6. title VERBATIM "로그인"          desc VERBATIM "토큰 발급 · 갱신"
     online "정상" #4ade80   offline "불가" #f87171
Chip borders are the chip color at 30% alpha.

TRANSITION BEHAVIOR: when the toggle flips, each card's chip cross-fades to its new
state, staggered 0.06s apart in reading order. Cards that become 중단/불가 dim their
whole body to 55% opacity and take a 1px rgba(248,113,113,0.24) border.
Cards that go to 캐시 사용 keep full opacity and take an amber border - the point is
that MOST of the screen still works.

A summary line beneath the board, 15px leading-8, which swaps with the toggle:
  online  VERBATIM: "모든 기능이 정상 동작합니다."
  offline VERBATIM: "6개 중 3개는 캐시로 계속 동작합니다. 나머지 3개는 네트워크가 필요합니다."
  In the offline copy, emphasize "6개 중 3개는 캐시로 계속 동작합니다" in #fbbf24,
  font-bold.

=== BLOCK C: THE CACHING STRATEGY TABLE ===
Margin-top 48px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.45),
VERBATIM: "자원별 캐시 전략"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "자원" | "전략" | "이유"
Rows:
  "앱 셸 (HTML/JS/CSS)" | "Cache First"        | "버전이 바뀌기 전엔 안 바뀐다"
  "지도 타일"           | "Cache First + 만료"  | "용량이 크고 거의 안 바뀐다"
  "부스 목록"           | "Network First"       | "최신이 우선이되, 실패하면 캐시로"
  "SSE 스트림"          | "캐시 안 함"          | "실시간 연결은 캐시 대상이 아니다"
  "인증 요청"           | "캐시 안 함"          | "토큰은 절대 저장하지 않는다"
전략 cells are color-coded: Cache First #4ade80, Network First #fbbf24,
캐시 안 함 rgba(255,255,255,0.45). Rows reveal 0.1s apart on entry.

=== BLOCK D: THE SERVICE WORKER CODE PANEL ===
Margin-top 40px, full width. background #0f0c04,
border 1px rgba(251,191,36,0.16), rounded-md.
Header bar with three window dots and filename font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "sw.js"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: roughly 24 lines. A service worker that precaches the app shell on install;
on fetch, routes requests by destination - returning cached app-shell and map-tile
responses immediately with a background revalidation, attempting the network first
for the booth API and falling back to the cached response on failure, and passing
through (never caching) requests to the auth and stream endpoints; and cleans up old
cache versions on activate.
HIGHLIGHT ROWS: the network-first fallback line and the explicit pass-through
condition for the auth/stream endpoints (background rgba(251,191,36,0.10)).
Caption bar, border-top 1px, font-mono 11px, prefixed "// ", VERBATIM:
  "토큰과 스트림은 캐시에 넣지 않는다. 이건 성능이 아니라 보안 결정이다."

INTERACTIVE TOUCH (required): when the viewer flips the toggle to 오프라인, the
network-first fallback row in this code panel FLASHES with a rgba(251,191,36,0.16)
background for 0.8s. Connecting the toggle directly to the code line is the point.

=== BLOCK E: THE HONEST LIMITS CARD (required) ===
Margin-top 36px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.45),
  VERBATIM: "여전히 못 하는 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "오프라인에서 한 상태 변경을 큐에 쌓았다가 나중에 보내는 기능은 없다. 그냥 막았다."
    "캐시 만료 정책을 버전 갱신에만 의존한다. 시간 기반 만료는 지도 타일에만 있다."
    "실제 축제장 네트워크에서 측정하지 못했다. 브라우저 오프라인 모드로만 검증했다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading at 0.15s
0.65s  Paragraph
1.10s  Toggle fades up; its indicator draws
1.40s  Survival board cards fade up in reading order, 0.07s apart
2.20s  Strategy table rows
2.80s  Code panel fades up
3.40s  A single automatic demonstration: the toggle flips to 오프라인, holds 2.5s,
       and flips back. ONCE ONLY, and only if the viewer has not clicked it first.
       A tiny caption during it, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "자동 시연"

=== PERFORMANCE ===
The desaturation must be a single CSS filter transition on ONE wrapper element,
never a per-element color animation across dozens of nodes.

=== RESPONSIVE ===
< 900px: survival board 2 columns; strategy table becomes a stacked card list.
< 640px: board 1 column; toggle full width; code font 11px with internal
horizontal scroll (block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no auto-demonstration, no sliding indicator, no
desaturation transition (it applies instantly).
The toggle must be a real switch (role="switch", aria-checked) with a visible focus
ring (2px #fbbf24, offset 2px), operable by Space/Enter.
Announce the state change once via aria-live="polite" using the summary line copy.
The offline banner must be real text, not an image.

=== DO NOT ===
Do not actually register a Service Worker or call any network API - this section
simulates the offline state locally.
Do not claim measured field results; the "브라우저 오프라인 모드로만 검증" line stays.
Do not make every card survive offline - the three failures are the honest part.
```

---

## PAGE 08 — 전체 구조와 내가 한 범위

**개발 실체**: 시스템 아키텍처 + **내가 담당한 구간의 명확한 구분**
**연출 장치**: 데이터 흐름도가 한 층씩 그려지고, **내 담당 구간만 앰버로 점등**된다

```text
Build an ARCHITECTURE SECTION where a system data-flow diagram is drawn layer by
layer, and the parts the developer personally built light up in amber while the
rest stay outlined, for a real-time festival operations portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The end-to-end system structure (client -> API -> DB, plus the SSE channel)
2. An explicit, honest boundary of what this developer built versus what teammates
   built
3. The scope of the frontend work in concrete terms

=== MOOD ===
The tent after hours. The map is laid flat on the table and someone is drawing the
system on it. Calm, structural, precise.

=== DESIGN TOKENS (use exactly) ===
background #140f04 | panel #1c1608 | primary amber #fbbf24 | accent #fcd34d
live #4ade80 | text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.45)
outline (not mine) rgba(255,255,255,0.22) | mine #fbbf24
fonts: headings font-black, body sans leading-8, ALL diagram labels font-mono
easing cubic-bezier(0.16,1,0.3,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE DIAGRAM - full width, height 480px
  Block C : the scope list (what I built), 4 cards
  Block D : the team-honesty note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "07 · 전체 구조"

HEADING (28px font-black):
  VERBATIM: "어디까지가 내가 만든 부분인가"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "팀 프로젝트였다. 프론트엔드를 주로 맡았고, 실시간 흐름과 배포 설정까지
             걸쳐서 작업했다. 아래 그림에서 불이 들어온 쪽이 내가 만든 부분이다."

=== BLOCK B: THE DIAGRAM (the defining idea) ===
Container: height 480px, background #1c1608, border 1px rgba(251,191,36,0.16),
rounded-md, padding 28px, position relative.
Draw the whole thing in SVG so strokes can animate.

FOUR HORIZONTAL LAYERS, top to bottom, each a row of node boxes:

LAYER 1 - CLIENTS (y ~12%)   layer label at far left, font-mono 10px
  rgba(255,255,255,0.35), VERBATIM: "CLIENT"
  Three boxes, each 150x62px, gap 24px, centered:
    VERBATIM "운영진 웹" (MINE) · "스태프 모바일" (MINE) · "학생 조회" (MINE)

LAYER 2 - FRONTEND (y ~36%)   layer label VERBATIM: "FRONTEND"
  Four boxes, each 132x54px:
    VERBATIM "React + Vite" (MINE) · "SSE 구독 훅" (MINE) ·
    "React Leaflet" (MINE) · "PWA / SW" (MINE)

LAYER 3 - SERVER (y ~62%)     layer label VERBATIM: "SERVER"
  Four boxes, each 132x54px:
    VERBATIM "Spring Boot API" (SHARED) · "SseEmitter 허브" (MINE) ·
    "JWT 인증" (SHARED) · "부스 도메인" (NOT MINE)

LAYER 4 - DATA (y ~86%)       layer label VERBATIM: "DATA"
  One box, 180x54px, centered: VERBATIM "MySQL" (NOT MINE)

NODE STYLING BY OWNERSHIP:
  MINE      : border 1px #fbbf24, background rgba(251,191,36,0.08),
              label rgba(255,255,255,0.86), glow box-shadow 0 0 22px
              rgba(251,191,36,0.14)
  SHARED    : border 1px dashed rgba(251,191,36,0.45),
              background rgba(251,191,36,0.03), label rgba(255,255,255,0.72)
  NOT MINE  : border 1px rgba(255,255,255,0.22), background transparent,
              label rgba(255,255,255,0.45)

EDGES:
  Solid 1.5px lines connecting layers vertically. Edges that pass through a MINE
  node are #fbbf24 at 55% opacity; all others rgba(255,255,255,0.16).
  ONE SPECIAL EDGE: from "SseEmitter 허브" (Layer 3) back UP to "SSE 구독 훅"
  (Layer 2), drawn on the RIGHT side as a curved path, 2px #fbbf24, with a small
  dot traveling UPWARD along it every 2.2s (0.8s travel, 1.4s gap).
  Label beside it, font-mono 10px #fbbf24, VERBATIM: "이벤트 푸시"
  This is the only upward edge and must be visually distinct - it is the system's
  defining path.

LEGEND (bottom-right of the container, font-mono 10px):
  Three rows, each a 12px swatch plus a label, VERBATIM:
    "내가 만든 부분"  /  "함께 작업"  /  "팀원 담당"

DRAW-IN ANIMATION (on viewport entry):
  t=0.00s  Layer labels fade in (all four at once)
  t=0.20s  LAYER 1 boxes draw: each border animates with a stroke-dashoffset sweep
           (0.5s), then its label fades in. Boxes appear 0.1s apart.
  t=0.80s  Edges 1 -> 2 draw downward (stroke-dashoffset, 0.4s each, 0.06s apart)
  t=1.10s  LAYER 2 boxes draw, same pattern
  t=1.90s  Edges 2 -> 3, then LAYER 3 boxes at 2.20s
  t=3.00s  Edges 3 -> 4, then LAYER 4 box at 3.20s
  t=3.60s  THE UPWARD SSE EDGE draws last, bottom to top over 0.8s, and its
           traveling dot begins looping
  t=4.40s  All MINE nodes pulse their glow ONCE, simultaneously (0.6s), and the
           legend fades in

HOVER: hovering any node raises its border opacity, lifts it 3px, and highlights
every edge touching it to full color. Non-connected nodes dim to 50%. 0.3s.

=== BLOCK C: THE SCOPE LIST ===
Margin-top 52px. Four cards in a 2x2 grid, gap 14px (1 column below 720px).
Each: padding 20px, rounded-md, border 1px rgba(251,191,36,0.20),
background rgba(251,191,36,0.04), with a font-mono 10px letter-spacing 0.18em
#fbbf24 label and a 3-item list at 14px leading-7 with "· " prefixes.

CARD 1  label VERBATIM: "화면 구조"
  "프론트엔드 주요 화면 구조 설계 및 구현"
  "라우팅과 공통 레이아웃 정리"
  "관리자 대시보드 화면 구성"
CARD 2  label VERBATIM: "실시간"
  "SSE 기반 실시간 부스 상태 반영"
  "구독 훅과 재연결 로직 구현"
  "이벤트 페이로드 스키마 협의"
CARD 3  label VERBATIM: "지도"
  "지도 기반 부스 배치 화면 구현"
  "부스 좌표 데이터 구조 정의"
  "마커 상태 표현 규칙 정리"
CARD 4  label VERBATIM: "배포·오프라인"
  "PWA 설정과 오프라인 대응"
  "Service Worker 캐시 전략 결정"
  "빌드 산출물 배포 설정"

=== BLOCK D: THE TEAM HONESTY NOTE ===
Margin-top 36px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.45),
  VERBATIM: "명확히 해둘 것"
  Body 15px leading-8, VERBATIM:
  "부스 도메인 모델과 DB 스키마는 팀원이 설계했다.
   JWT 인증은 같이 붙였고, 최종 구현은 백엔드 담당이 마무리했다.
   내가 서버에서 직접 만든 건 SSE 브로드캐스트 쪽이다."

=== RESPONSIVE ===
< 900px: diagram height 560px; each layer's boxes wrap into two rows; the upward
SSE edge redraws along the right edge with a longer curve.
< 640px: the diagram becomes a VERTICAL stack of labeled groups instead of an SVG
flow - each layer is a bordered group containing its nodes as chips, with a single
downward arrow between groups and one upward amber arrow on the right spanning the
SERVER -> FRONTEND gap. Keep the ownership colors.

=== ACCESSIBILITY ===
prefers-reduced-motion: the diagram renders complete and static; no draw-in, no
traveling dot, no pulse.
Provide a visually-hidden structured text equivalent: the four layers, their nodes,
each node's ownership, and the upward SSE edge.
Non-interactive nodes must not be in the tab order.

=== DO NOT ===
Do not use a diagramming library - hand-draw the SVG.
Do not overstate ownership. The three-tier ownership coloring and the honesty note
must both stay.
Do not animate the traveling dot when the diagram is out of the viewport.
```

---

## PAGE 09 — 결과 · 화면 갤러리

**개발 실체**: 완성된 화면들 + 실제 사용 맥락
**연출 장치**: 관제 화면들이 전부 정상 신호로 전환되며 갤러리로 확장

```text
Build a RESULTS SECTION that presents finished product screenshots as a gallery of
operations monitors coming fully online, for a real-time festival portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What was actually shipped, in screens
2. The concrete outcome stated without invented metrics
3. What the numbers on this page do and do not mean

=== MOOD ===
Festival is running. Everything is green. Relief, not celebration.
Amber warms up slightly; the background lifts from #140f04 to #191204.

=== DESIGN TOKENS (use exactly) ===
background #191204 (lifted from earlier sections) | panel #221a08
primary amber #fbbf24 | accent #fcd34d | live #4ade80
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.16,1,0.3,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1120px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the screenshot gallery (4 items, asymmetric grid)
  Block C : the outcome stats
  Block D : the numbers-disclaimer strip

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "08 · 결과"

HEADING (32px font-black):
  VERBATIM: "운영진 화면 하나로 현장이 굴러갔다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "부스 상태 변경이 전 운영진 화면에 즉시 반영되고,
             역할별로 필요한 정보만 보이며, 네트워크가 끊겨도 화면이 유지된다.
             축제 운영 서비스로서 필요한 구조를 완성했다."

=== BLOCK B: THE GALLERY ===
An asymmetric grid, margin-top 48px:
  Row 1: one large item (spanning 2 columns) + one small item
  Row 2: two equal items
Gap 16px. Below 900px -> single column.

Each item: background #221a08, border 1px rgba(251,191,36,0.18), rounded-md,
overflow hidden.
  A 30px header strip with a font-mono 10px uppercase label on the left
  (rgba(255,255,255,0.48)) and a 6px #4ade80 status dot on the right.
  Below it, the image area with aspect-ratio 16/10.
  A caption bar at the bottom, padding 12px 14px,
  border-top 1px rgba(251,191,36,0.10), font-mono 11px rgba(255,255,255,0.48).

ITEM 1 (large)  header VERBATIM "01 · 운영진 대시보드"
  [IMG-01] the main operator dashboard with the live booth list and map
  caption VERBATIM: "부스 상태가 바뀌면 이 화면 전체가 새로고침 없이 갱신된다"
ITEM 2 (small)  header VERBATIM "02 · 스태프 모바일"
  [IMG-02] the mobile staff view for changing one booth's status
  caption VERBATIM: "담당 부스만 조작 가능"
ITEM 3          header VERBATIM "03 · 지도 배치"
  [IMG-03] the map view with booth markers
  caption VERBATIM: "좌표 기반 배치 · 매년 배열만 교체"
ITEM 4          header VERBATIM "04 · 관리자 지표"
  [IMG-04] the admin metrics view
  caption VERBATIM: "관리자에게만 보이는 화면"

IMAGE PLACEHOLDER SPEC (if no image is supplied): render a CSS placeholder inside
the aspect box - background #140f04, a faint 24px amber grid, and centered text in
font-mono 12px rgba(255,255,255,0.35) reading the slot name, e.g.
VERBATIM "[IMG-01] · 16:10"

HOVER: the item lifts 4px, its border goes to rgba(251,191,36,0.45), and the image
scales 1.03 inside its clipped frame. 0.35s. Click opens a lightbox
(overlay rgba(10,7,2,0.93), backdrop-blur(8px), image max-width 1200px, caption
below it, Esc / overlay click closes, arrow keys move between items).

=== BLOCK C: THE OUTCOME STATS ===
Margin-top 56px. Three stat cells in a row, gap 14px (stacks below 640px).
Each: padding 22px, rounded-md, border 1px rgba(251,191,36,0.22),
background rgba(251,191,36,0.04).
  value font-mono 34px font-black #fbbf24 tabular-nums
  label font-mono 11px rgba(255,255,255,0.48), margin-top 6px
  Cell 1  value VERBATIM "9"  label VERBATIM "기술 스택"
  Cell 2  value VERBATIM "3"  label VERBATIM "권한 역할"
  Cell 3  value VERBATIM "5"  label VERBATIM "핵심 기능"
Values count up over 0.8s on entry.

=== BLOCK D: THE NUMBERS DISCLAIMER (required) ===
Margin-top 28px, a slim strip: padding 14px 18px, rounded-md,
border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02).
  font-mono 11px rgba(255,255,255,0.45), VERBATIM:
  "위 숫자는 구현 범위를 센 것입니다. 실제 축제에서의 접속자 수, 처리량,
   응답 시간은 측정하지 않았습니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The page background lifts #140f04 -> #191204 over 1.2s
0.10s  Label, heading word by word at 0.25s
0.80s  Paragraph
1.30s  Gallery items fade up 0.1s apart (y 20px -> 0, 0.6s); each item's status dot
       lights up 0.25s after its item lands, with a single soft green pulse
2.20s  Stat cells fade up 0.1s apart and their numbers count
2.80s  Disclaimer strip fades in

=== RESPONSIVE ===
< 900px: single-column gallery, all items full width.
< 640px: stat cells stack; heading 24px.

=== ACCESSIBILITY ===
prefers-reduced-motion: no count-up (final values render directly), no hover scale,
no background transition.
Every gallery item is a real <button> opening the lightbox, with a visible focus
ring (2px #fbbf24, offset 2px). Each image needs a descriptive Korean alt text
derived from its caption.
The lightbox must trap focus while open and return focus to the triggering item on
close.

=== DO NOT ===
Do not invent visitor counts, real festival booth counts, uptime figures, or
response times. The disclaimer strip must remain visible.
Do not add confetti or celebration effects.
```

---

## PAGE 10 — 회고 · 다음 단계 · 퇴장

**개발 실체**: KPT 회고 (PROBLEM 포함) + 다음 단계 + GitHub
**연출 장치**: 축제 종료 → 관제 모니터가 한 대씩 꺼지며 퇴장

```text
Build the CLOSING SECTION of a real-time festival operations portfolio page: a KPT
retrospective, next steps, a repository link, and an exit transition where the
operations monitors shut down one by one.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An honest retrospective including real problems, not just wins
2. Concrete next steps
3. The repository link
4. A clean exit back to the village

=== MOOD ===
After the festival. Tent lights still on, tables being folded. Tired, satisfied,
honest. No triumphalism.

=== DESIGN TOKENS (use exactly) ===
background #191204 | panel #221a08 | primary amber #fbbf24 | accent #fcd34d
keep #4ade80 | problem #f87171 | try #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.16,1,0.3,1) | rounded-md

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
  VERBATIM: "실시간은 만드는 것보다 유지하는 게 어려웠다"

PARAGRAPH (16px leading-9, max-width 720px, margin-top 20px):
  VERBATIM: "연결을 여는 코드는 몇 줄이면 됐다.
             그 연결이 살아 있는지 계속 확인하는 코드가 훨씬 길어졌다."

=== BLOCK B: KPT ===
Margin-top 52px. Three columns, gap 16px (single column below 768px).
Each column: padding 22px, rounded-md, background #221a08,
border 1px rgba(255,255,255,0.10), with a 3px top border in its own color.
Header: font-mono 11px letter-spacing 0.2em, uppercase.
Items: 15px leading-8, each prefixed "· ", 14px apart.

COLUMN 1 - header VERBATIM "KEEP", color #4ade80, top border #4ade80. Items VERBATIM:
  "기술 선택 근거를 문서로 남긴 것"
  "권한 체크를 서버로 전부 옮긴 것"
  "현장 제약(네트워크)을 설계 초기에 반영한 것"

COLUMN 2 - header VERBATIM "PROBLEM", color #f87171, top border #f87171. Items VERBATIM:
  "SSE 연결 유실을 리허설 전날에야 발견했다"
  "실제 축제장 네트워크에서 테스트하지 못했다"
  "재연결 임계값을 근거 없이 감으로 정했다"

COLUMN 3 - header VERBATIM "TRY", color #fbbf24, top border #fbbf24. Items VERBATIM:
  "SMS 알림과 현장 QR 체크인 붙이기"
  "매출 집계 기능 추가"
  "오프라인 상태 변경을 큐에 쌓았다가 재전송하기"

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), top border
grows 3px -> 4px. 0.3s.

=== BLOCK C: NEXT STEPS CARD ===
Margin-top 48px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.22),
background rgba(251,191,36,0.04), border-left 3px #fbbf24.
  Label font-mono 11px letter-spacing 0.2em #fbbf24, VERBATIM: "다음 단계"
  Body 16px leading-8, margin-top 12px, VERBATIM:
  "SMS 알림, 매출 집계, 현장 QR 체크인 기능을 추가할 예정입니다.
   그 전에 실제 현장 네트워크에서 한 번 돌려보는 게 먼저입니다."

=== BLOCK D: GITHUB LINK ===
Margin-top 40px. A single primary link button:
  background #fbbf24, color #140f04, font-mono 14px font-black,
  padding 14px 28px, rounded-md.
  Label VERBATIM: "GitHub 저장소 ↗"
  Hover: scale 1.04, box-shadow 0 0 28px rgba(251,191,36,0.35). Active: scale 0.97.
  href https://github.com/toadsam/FestFlow, target _blank, rel noreferrer.

=== BLOCK E: EXIT BUTTON + EXIT TRANSITION ===
Margin-top 72px. A full-width button, height 88px, rounded-md,
border 1px rgba(255,255,255,0.14), background transparent.
  Label centered, font-mono 15px, letter-spacing 0.1em, rgba(255,255,255,0.62),
  VERBATIM: "← 마을로 돌아가기"
  Hover: border -> rgba(251,191,36,0.45), label -> #fbbf24, and a faint amber
  worklight glow appears behind it. 0.4s.

EXIT TRANSITION (on click of this button OR the header's "← 마을로"):
  t=0.00s  The header's live counter stops and its dot turns
           rgba(255,255,255,0.30); text changes to VERBATIM "○ 운영 종료"
  t=0.20s  Content fades to opacity 0 over 0.35s
  t=0.35s  Six small monitor rectangles appear across the viewport in the ops-wall
           layout, each still faintly amber-lit
  t=0.50s  They switch OFF one at a time, 0.09s apart, each collapsing vertically
           to a 2px line and then to nothing (0.25s each), like an old monitor
  t=1.20s  Full background #140f04, nothing on screen
  t=1.50s  Emit an onExit callback so the parent can restore the 3D village scene.
  Body scroll locks during the transition; the parent releases it.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.70s  Paragraph
1.20s  KPT columns fade up left to right 0.12s apart, each item inside appearing
       0.06s apart
2.20s  Next steps card slides in from the left (x -12px -> 0)
2.60s  GitHub button fades in
2.90s  Exit button fades in with its border drawing from the center outward
       (0% -> 100% width, 0.7s)

=== RESPONSIVE ===
< 768px: KPT single column; heading 24px; exit button height 72px, label 14px;
GitHub button full width.

=== ACCESSIBILITY ===
prefers-reduced-motion: all reveals instant; the exit transition becomes a plain
0.3s fade with no monitor shutdown animation.
The exit button must be a real <button>, keyboard focusable, visible focus ring
(2px #fbbf24, offset 2px).

=== DO NOT ===
Do not soften the PROBLEM column - the honesty is the point.
Do not add confetti, "thanks for reading", or celebration copy.
Do not restart the live counter after the exit transition begins.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-1. 개발 실체 커버리지 점검

| 항목 | 어디에 | 형태 |
|---|---|---|
| **왜 만들었나** | P00 | 부팅 마지막 문장 (3초 안에) |
| **데모 영상** | P01 TILE 2 | 관제 모니터로 위장 |
| **GitHub** | P01 TILE 3 · P10 버튼 | 모니터 + 마무리 버튼 |
| **코드** | P02(EventSource·SseEmitter) · P04(좌표 배열) · P05(JWT·Controller) · P06(Before/After·하트비트) · P07(sw.js) | **총 9개** |
| **트러블슈팅** | P06 (연결 유실) · P07 (오프라인) | **전체 프로세스 2건** |
| **기술 의사결정 + 포기한 것** | P03 | 3안 비교 테이블 + 정직한 비용 카드 |
| **아키텍처 + 내 범위** | P08 | 3단계 소유권 색 구분 |
| **결과물** | P09 | 갤러리 4장 |
| **회고** | P10 | KPT (PROBLEM 3개 포함) |
| **한계 인정** | P03 · P06 · P07 · P09 | 연결 수 제한 / 누락 이벤트 / 현장 미검증 / 지표 없음 |

## D-2. 새로 만들 파일
```
src/components/ui/project-viewers/stages/festflow/
  index.tsx                 ← PAGE 00~10 순서, 전역 LIVE 카운터 소유
  useLiveHeartbeat.ts       ← 이벤트 카운터 1개 루프 (탭 숨김/뷰포트 밖 정지)
  BootSequence.tsx          ← P00
  OpsWall.tsx               ← P01 · 모니터 6대
  SsePipeline.tsx           ← P02 · 패킷 애니메이션 + 코드 하이라이트
  TransportRace.tsx         ← P03 · 폴링 vs SSE 동시 실행
  BoothMapEditor.tsx        ← P04 · 드래그 → 코드 좌표 실시간 반영
  RoleSwitcher.tsx          ← P05 · 역할별 화면 재구성
  SilentDropCase.tsx        ← P06 · 흐름 정지 + 케이스 파일
  OfflineToggle.tsx         ← P07 · 오프라인 시뮬레이션 + 생존 보드
  FlowDiagram.tsx           ← P08 · SVG 레이어 그리기
  copy.ts                   ← 모든 한국어 문구
  assets.ts                 ← [IMG-01~04] · [VIDEO-01]
```

## D-3. 기존 코드 재사용 / 선행 작업
재사용: `CodeBlock`, `ImageSlot`, `MockScreen`, `CountUp`, `RevealText` (`shared.tsx`)

> ⚠️ **선행 작업 (10개 프로젝트 공통 1건)**: `shared.tsx` 의 `DecisionTable`,
> `ArchDiagram`, `CompareBars`, `ProcessTimeline`, `QuoteCard`, `TldrBanner`,
> `BeforeAfter`, `ChallengeCard` 가 현재 **모듈 내부 함수(비export)** 입니다.
> stage 폴더에서 쓰려면 export로 승격해야 합니다.

## D-4. 버릴 것
- `[KILL]` `RealtimeProjectViewer` 의 festflow 분기 → stage 폴더로 이전
- `[KILL]` `richContent/FestFlowLiveDemo.tsx` → P02 `SsePipeline` + P03 `TransportRace` 로 분해 흡수

## D-5. 미디어 확보 목록
| 슬롯 | 내용 | 비율 | 우선도 |
|---|---|---|---|
| `[VIDEO-01]` | 스태프가 상태 변경 → 다른 기기 지도 즉시 갱신 (2분 08초) | 16/9 | **최상** |
| `[IMG-01]` | 운영진 대시보드 (지도 + 부스 목록) | 16/10 | **최상** |
| `[IMG-02]` | 스태프 모바일 상태 변경 화면 | 16/10 | 높음 |
| `[IMG-03]` | 지도 배치 화면 | 16/10 | 높음 |
| `[IMG-04]` | 관리자 지표 화면 | 16/10 | 중간 |

## D-6. 코드 스니펫 확보 목록 (전부 실제 저장소에서)
| 페이지 | 파일 | 줄 | 하이라이트 |
|---|---|---|---|
| P02 | `useBoothStream.ts` | 20 | addEventListener · 상태 병합 |
| P02 | `BoothEventPublisher.java` | 18 | broadcast 루프 · emitter 제거 |
| P04 | `booths.ts` | 22 | 좌표 배열 (드래그로 실시간 변경) |
| P05 | JWT payload (decoded) | 10 | role · 담당 부스 배열 |
| P05 | `BoothController.java` | 16 | 권한 애노테이션 · 담당 부스 검사 |
| P06 | `useBoothStream.ts` (before) | 12 | onerror 줄 |
| P06 | `useBoothStream.ts` (after) | 18 | 워치독 · visibilitychange |
| P06 | `BoothEventPublisher.java` (하트비트) | 1줄 칩 | 주기적 heartbeat 전송 |
| P07 | `sw.js` | 24 | network-first 폴백 · auth/stream 패스스루 |

## D-7. 제어권 개입 1회 — 안전장치

| | P06 실시간 흐름 정지 |
|---|---|
| 길이 | 4.0초 (표시만 정지, 스크롤·입력은 정상) |
| 예고 | 섹션 240px 위 인라인 경고 카드 |
| 건너뛰기 | ✅ |
| 세션당 | 1회 |
| Esc 해제 | ✅ |
| reduced-motion | 발동 안 함 |
| 언마운트 시 정리 | 스트림 재개 보장 |

P07 오프라인 토글은 **관람객이 직접 누르는 것**이므로 제어권 박탈이 아님 (자동 시연 1회, 2.5초만 예외).

## D-8. 최종 체크리스트
- [ ] 전역 LIVE 카운터가 **타이머 1개**로 돌아가는지 (섹션마다 별도 인터벌 금지)
- [ ] 모든 자동 애니메이션이 **뷰포트 밖 + 탭 숨김 시 정지**하는지
- [ ] `prefers-reduced-motion` 이면 P01 관제 벽이 **정적 스냅샷**으로 렌더되는지
- [ ] P02 패킷이 `transform` 으로만 움직이는지 (`left/top` 금지)
- [ ] P04 드래그 중 코드 블록 전체를 리렌더하지 않는지 (rAF + DOM 직접 기록)
- [ ] P04 핀에만 `touch-action: none` (컨테이너에 걸면 페이지 스크롤 죽음)
- [ ] P05 JWT 패널에 **"예시 페이로드 · 실제 토큰 아님"** 각주가 있는지
- [ ] P05 역할별로 사라지는 모듈이 **DOM에서 실제로 제거**되는지 (숨김 아님)
- [ ] P06 정지가 세션당 1회 + 예고 + 건너뛰기 + Esc + 언마운트 정리
- [ ] P06 정지 중 **에러/스피너/빨간 배너 없음** (첫 3.5초)
- [ ] P06 재개 시 카운터가 **따라잡지 않는지**
- [ ] P07 실제 Service Worker를 등록하지 않는지 (시뮬레이션만)
- [ ] P07 생존 보드에 **실패 카드 3개**가 남아 있는지
- [ ] P09 **"실제 접속자·처리량 미측정"** 면책 문구 유지
- [ ] 이벤트 로그가 `aria-live` 가 **아닌지** (스크린리더 폭주 방지)
- [ ] 숫자 전부 `tabular-nums`
- [ ] 지어낸 수치 0개 — 방문자·매출·응답시간 주장 금지
- [ ] 이 방은 **무음** — 사운드 토글 자체를 두지 않았는지
