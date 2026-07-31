# 10. TSEROF — 프롬프트 팩

> 3D 플랫포머 · Unity / C# / Unity 2022.3 · **5인 팀 프로젝트** · **Steam 출시**
> **사용법**: `PAGE 00` ~ `PAGE 10` 의 코드블록을 **하나씩 통째로 복사해서 Variant에 붙여넣으세요.**
> 각 프롬프트는 **완전히 자립적**입니다 (색상·폰트·무드가 매번 반복 포함).
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.

> ✅ **[FIX-02] [FIX-03] 해소 (2026-07-31) — 저장소 접근 확인됨.**
> `KimEoJin24/TSEROF` 는 비공개지만 **협업자 권한으로 열람 가능**합니다. 확정된 사실:
>
> | 항목 | 값 |
> |---|---|
> | 기간 | **2023.11 – 2024.02** |
> | 팀 | **5인** (문서 본문에서는 계속 "팀원 A/B/C" 로만 지칭할 것) |
> | 출시 | **Steam 스토어 출시 완료** |
> | 씬 | `Stage1Scene` · `Stage2Scene` · `Stage3Scene` · `StageSelect` · `StartScene` |
> | 실제 코드 근거 | `ForceReceiver.cs`(4방향 접지 레이) · `FileDataHandler.cs`(XOR 세이브) · `ObjectPoolJump.cs`(풀링) · `DataPersistenceManager.cs` |
>
> 🔵 **[FIX-05] P02·P04 재설계됨.** 이 방은 원래 **「코요테 타임 유무」** 를 축으로 삼았는데
> **저장소에 코요테 타임 코드가 없습니다.** 실제 해결은 **접지 레이 1개 → 발 4방향 확장**이고,
> 코요테 타임은 **넣었다가 뺀 「실패한 시도」** 입니다. 자세한 건 `PAGE 04` 상단 박스를 보세요.

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 방의 한 문장

**"이 페이지가 스테이지 셀렉트 화면이다. 읽어 내려갈수록 다음 스테이지가 잠금 해제된다."**

## A-2. 왜 이 메타포인가

TSEROF에서 내가 맡은 것은 두 가지였다. **조작감**(WASD·2단 점프)과 **진행 구조**(스테이지 선택·잠금 해제·저장).
이 둘은 서로 다른 축이지만 게임 안에서 만나는 지점이 딱 하나 있다 — **스테이지 셀렉트 화면**이다.
거기엔 내가 몇 개를 깼는지(진행 저장), 다음에 뭘 할 수 있는지(잠금 해제)가 전부 그려져 있다.

그래서 이 방은 **페이지 전체를 하나의 스테이지 셀렉트 보드로** 만든다.
헤더에 11칸짜리 보드가 상시 떠 있고, 스크롤이 내려갈 때마다 칸이 하나씩 열린다.
관람객은 진행바를 보는 게 아니라 **자기가 몇 스테이지까지 깼는지**를 본다.

이 방의 두 번째 정체성은 **팀 프로젝트**라는 것이다.
혼자 만든 DarkLab과 달리 여기서 진짜 아팠던 건 알고리즘이 아니라 **같은 씬 파일을 여러 명이 동시에 건드린 것**이었다.
그 이야기를 PAGE 06 통째로 쓴다. 10개 방 중 **협업의 고통을 정면으로 다루는 유일한 방**이다.

## A-3. ⭐ 가장 중요한 원칙 — 연출은 개발 내용의 운반 수단이다

**이 문서 전체를 관통하는 규칙: 모든 연출은 반드시 개발 실체를 하나 이상 전달해야 한다.**
멋있기만 한 연출은 넣지 않는다. 연출이 곧 개발 내용을 보여주는 방식이어야 한다.

| 전달할 개발 실체 | 그걸 실어나르는 연출 | 페이지 |
|---|---|---|
| 왜 이걸 만들었나 (동기) | 게임 부팅 화면 → `PRESS SPACE` → **관람객의 첫 입력이 점프다** | 00 |
| 데모 영상 · GitHub | 스테이지 보드의 **특별 슬롯 2칸** (버튼 아님) | 01 |
| 2단 점프 컨트롤러를 구현했다 | **관람객이 직접 스페이스로 조작** → 발판 끝 씹힘을 겪음 → 즉시 옆에 실제 C# | 02 |
| 저장 방식을 3안 비교해 골랐다 | 3안에 **같은 세이브 데이터를 동시에 먹여** 결과가 갈리는 걸 보여줌 + 포기한 것 카드 | 03 |
| **트러블 01: 발판 끝 점프가 씹힌다** | **P02에서 관람객이 이미 겪은 그 씹힘** → 8단계 추적 → 토글로 직접 재조작 | 04 |
| 스테이지 잠금 해제는 상태머신이다 | **헤더의 보드가 본문 한가운데로 확대되어 내려온다** → 직접 클리어시킴 | 05 |
| **트러블 02: Unity 씬 머지 충돌** | **여러 커밋이 같은 `.unity` 파일로 수렴 → CONFLICT** → 분리 후 다시 재생 | 06 |
| 진행 저장을 직렬화로 구현했다 | 세이브 JSON이 **눈앞에서 실시간 갱신** + 구버전 세이브 넣어보기 | 07 |
| 팀에서 내가 한 범위 | 씬/프리팹 분할 다이어그램에 **담당자 색이 칠해짐** | 08 |
| 결과물 · 풀 데모 영상 | **11칸이 전부 열리며** 갤러리 공개 | 09 |
| 회고 · 다음 단계 | KPT → 퇴장 시 **세이브 파일이 저장되고 `SAVED`** → 암전 | 10 |

## A-4. 게임 설계 결정 ↔ 웹 재현 대응

| 게임에서 내린 결정 | 이 웹페이지에서의 재현 |
|---|---|
| 스테이지를 전면 개방하지 않고 순차 잠금 해제했다 | **스크롤해야 다음 칸이 열린다.** 목차를 미리 다 보여주지 않는다 |
| 진행 상황을 저장해 이어하기를 만들었다 | 새로고침해도 **열어둔 칸이 유지된다** (sessionStorage) |
| 접지 판정을 발 4방향 레이로 넓혔다 | P02에서 관람객이 **레이 1개짜리 버전**을 먼저 조작한다 |
| 씬을 분리해 팀 작업을 나눴다 | P06 다이어그램이 **실제로 분리되며 충돌이 사라진다** |

**관람객은 이 프로젝트가 무엇인지를 읽어서 아는 게 아니라, 조작해서 안다.**
그리고 각 조작 직후에 **"방금 그건 이 코드입니다"** 로 회수한다.

## A-5. 관람 곡선 (감정 + 정보 밀도 + 진행 지표)

```
감정  가벼움 ─╮                      ╭──╮ P06 (팀 협업의 고통 · 유일한 무거운 구간)
             ╰──╮   ╭─╮ P04        ╱    ╲
     P00~03      ╰───╯  ╲(조작감    ╱      ╰──╮
     경쾌·조작            클라이맥스)           ╰─── P09~10 정리 · 성취
정보  낮 ───────────╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲──────
     밀도         P04~08 개발 밀도 최고조
보드  1/11 ── 3/11 ── 5/11 ── 7/11 ── 9/11 ── 11/11
```

**핵심 장치**: 스크롤을 내릴수록 스테이지 보드가 열린다.
DarkLab이 "조명 %"로 진행을 표현했다면 TSEROF는 **"잠금 해제 n/11"** 로 표현한다.
헤더의 `▮ 잠금 해제 3 / 11` 이 실시간 표시되어 진행바 역할까지 겸한다.

## A-6. 명장면 2개

**① PAGE 04 — 씹혔던 점프가 되는 순간** (감정의 클라이맥스)
관람객은 PAGE 02에서 이미 발판 끝 점프가 씹히는 걸 겪었다. 짜증까지는 아니어도 "어? 왜 안 되지"는 느꼈다.
PAGE 04에서 그걸 정면으로 꺼낸다: *"방금 발판 끝에서 점프가 씹혔죠. 저도 그랬습니다."*
→ 8단계 추적 후, **관람객이 직접 `레이 4개` 토글을 누른다.** 같은 조작이 이번엔 된다.
→ 그리고 그 차이를 만든 **C# 세 줄**이 옆에 뜬다. 체험 → 원인 → 코드가 한 화면 안에 있다.

**② PAGE 06 — 커밋들이 한 파일로 수렴하는 애니메이션** (기술의 클라이맥스)
팀원 아바타들이 각자 오브젝트를 만들고 커밋한다. 화살표가 전부 `Stage.unity` 하나로 빨려 들어간다.
파일이 붉게 물들고 `CONFLICT` 가 뜬다. 그리고 **한 명의 작업물이 조용히 사라진다.**
→ 토글로 `분리 후` 를 누르면 같은 애니메이션이 다시 재생되는데, 이번엔 화살표가 **서로 다른 파일로** 간다.
→ **10개 방 중 유일하게 "팀 협업"을 개발 실체로 다루는 장면.**

## A-7. 다른 9개 방과의 차별점

| 축 | TSEROF | 나머지 (특히 09 DarkLab) |
|---|---|---|
| 제어권 | **뺏지 않는다 (0회).** 오히려 **입력을 요구한다** (스페이스·방향키) | DarkLab은 2회 뺏음 |
| 리듬 | **탄력적·경쾌** (오버슛 이징 0.25~0.6s) | DarkLab은 무겁고 느림 (0.5~1.4s) |
| 진행 표시 | 스테이지 보드 `n/11` (목차 겸용) | 조명 % / 일반 스크롤바 |
| 같은 Unity지만 | **조작감 + 팀 협업** | DarkLab = 어둠 + 연출 |
| 협업 서사 | **PAGE 06 통째로 팀 이야기** | 10개 방 중 **유일** |
| 명도 | 어둡지만 **읽는 데 지장 없음** (`#04120d`) | DarkLab은 안 보이는 게 컨셉 |

> ⚠️ **DarkLab과 반드시 달라야 할 것**: 둘 다 Unity 게임이라 면접관이 "같은 얘기 두 번"으로 느끼면 실패다.
> DarkLab에서 이미 다룬 **Cinemachine / 시야 제한 / 공포 연출 / ScriptableObject** 는 이 방에서 **주제로 삼지 않는다.**
> TSEROF는 **입력 판정(프레임 단위 조작감)** 과 **팀 Git 워크플로** 두 축으로만 간다.

## A-8. 절대 금지 (안전 규칙)

- **제어권 박탈 0회.** 스크롤 잠금·시야 박탈·강제 대기 전부 금지. 이 방의 정체성은 "제어권을 준다"이다
- 스페이스/방향키 `preventDefault` 는 **해당 데모 컨테이너가 포커스/호버 상태일 때만.**
  전역 키 캡처는 페이지 스크롤을 죽인다 — **이걸 어기면 배포 금지**
- 플랫포머 데모의 물리 루프는 **뷰포트 밖 + 탭 숨김 시 반드시 정지** (배터리)
- 지어낸 수치·정황 0개. 플레이 시간·판정 ms 개선치 주장 금지.
  **확정된 사실은 써도 됩니다**: 팀 5인 · 2023.11–2024.02 · Steam 출시 · 스테이지 3종 + 스테이지 셀렉트.
  아직 모르는 것(시연 영상 길이, 팀원별 담당 범위)만 `[확인필요]` 로 표기
- 사운드 최대 볼륨 하드 제한 (0.15). 점프/착지음은 짧고 작게
- 화면 전체 플래시·스트로브 금지. 1Hz 초과 깜빡임 금지 (광과민성)
- **비공개 저장소 가능성 고지** — GitHub 링크는 팀원 소유이므로 접근 제한 문구를 반드시 병기

---

# B. 공통 디자인 토큰 (참고용 — 각 프롬프트에 이미 포함됨)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#04120d` → `#071a13` (P09부터) | 페이지 배경 |
| `--primary` | `#34d399` | 주색 · 잠금 해제 · 성공 |
| `--secondary` | `#059669` | 보조 (테두리·비활성) |
| `--accent` | `#6ee7b7` | 강조 텍스트 |
| `--locked` | `rgba(255,255,255,0.10)` | 잠긴 스테이지 슬롯 |
| `--text` / `--muted` | `rgba(255,255,255,0.86)` / `rgba(255,255,255,0.46)` | 본문 / 캡션 |
| `--bad` / `--warn` | `#f87171` / `#fbbf24` | 트러블슈팅 전용 |
| 패널 | bg `#061a12`, border `rgba(52,211,153,0.16)` | |
| 문법 색 | 주석 `#4b7c68` / 문자열 `#d9a45b` / 키워드 `#34d399` / 숫자 `#b58cf0` | |
| 그리드 오버레이 | 48px 셀, 선 `rgba(52,211,153,0.05)` | 그레이박스 레벨 느낌 |
| 이징 | `cubic-bezier(0.34, 1.56, 0.64, 1)` (오버슛), 0.25~0.6s | **빠르고 탄력적** |
| 숫자 | 전부 `tabular-nums` | 흔들림 금지 |

---

# C. 페이지별 프롬프트

---

## PAGE 00 — 진입 시퀀스 (부팅 화면)

**개발 실체**: 왜 이걸 만들었는가 (동기)
**연출 장치**: 게임 부팅 → `PRESS SPACE` → **관람객의 첫 입력이 점프다**

```text
Build a full-screen GAME BOOT SEQUENCE for a Unity 3D platformer portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Single self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The developer's motivation for building this project. The very first readable
sentence must be about WHY the game was made, not decoration.

=== MOOD ===
A game booting up. Clean, confident, snappy. Dark green-black void with a faint
wireframe grid, like a Unity greybox level before any art is applied.
NOT retro-pixel, NOT neon cyberpunk, NOT horror. Modern game UI.
The single most important feeling: THIS PAGE WANTS YOU TO PRESS SOMETHING.

=== DESIGN TOKENS (use exactly) ===
background #04120d | primary #34d399 | secondary #059669 | accent #6ee7b7
locked rgba(255,255,255,0.10) | text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.46)
panel bg #061a12, border rgba(52,211,153,0.16)
grid overlay: 48px cells, 1px lines rgba(52,211,153,0.05)
fonts: headings font-black, body sans-serif leading-8, ALL labels/numbers font-mono
       with font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) with a slight overshoot, durations 0.25s-0.6s
rounded-md

=== LAYOUT ===
Full viewport, position fixed, above page content. Everything centered.
No header, no nav, no scrollbar during this sequence.
Layer stack bottom to top:
  1. Solid #04120d background
  2. Wireframe grid: 48px CSS repeating-linear-gradient in rgba(52,211,153,0.05),
     with a perspective tilt (transform: perspective(800px) rotateX(58deg)) anchored
     to the bottom third of the screen so it reads as a GROUND PLANE
  3. Content layer (text, centered)

=== TIMELINE (follow exactly) ===
t=0.0s  Pure #04120d. Nothing visible.
t=0.3s  The ground grid draws itself in: lines sweep from the horizon toward the
        viewer over 0.7s, opacity 0 -> 1.
t=0.9s  A single square block (44x44px, background #34d399, rounded-sm) DROPS from
        above the viewport to the center of the screen, landing at y=44vh.
        It lands with squash-and-stretch: scaleY 1 -> 0.7 -> 1.08 -> 1 over 0.35s.
        One short soft thud sound (volume cap 0.15).
        A thin dust puff (two 2px dots flicking outward, 0.3s) on impact.
        THIS BLOCK IS THE PLAYER. It is the only art this page needs.
t=1.4s  The title appears, centered under the block:
          Line 1, VERBATIM: "TSEROF"
            72px font-black, rgba(255,255,255,0.86), letter-spacing 0.04em
          Line 2, VERBATIM: "3D 플랫포머 · Unity · 팀 프로젝트"
            14px font-mono, rgba(255,255,255,0.46), letter-spacing 0.22em,
            margin-top 16px
        Reveal: the title slides up 14px with the same overshoot easing.
t=2.0s  THE MOTIVATION LINE fades in below the title (this is the substance of this
        page - it must be the first real sentence the viewer reads).
        max-width 560px, centered, 17px, leading-9, rgba(255,255,255,0.86).
        Korean copy, VERBATIM:
        "3D 플랫포머에서 제일 먼저 망가지는 건 레벨이 아니라 점프였다.
         발판 끝에서 누른 점프가 씹히는 순간 플레이어는 게임을 끈다.
         그 0.1초를 어떻게 다루는지가 궁금해서 만들었다."
        Reveal it word by word, stagger 0.03s, each word opacity 0->1 with a 6px
        upward slide. Snappy, not solemn.
t=3.2s  The input prompt appears at y = 76vh, VERBATIM: "PRESS SPACE"
        16px font-mono, color #34d399, letter-spacing 0.3em,
        opacity pulsing 0.45 <-> 1.0 on a 1.4s cycle.
        Below it, 12px font-mono rgba(255,255,255,0.46), VERBATIM:
          "( 클릭 · 스크롤도 됩니다 )"

=== THE FIRST INPUT (the point of this page) ===
When the viewer presses Space (or clicks, or scrolls):
  1. The player block JUMPS: translateY -70px over 0.22s ease-out, then falls back
     and lands with the same squash-and-stretch. One short jump sound (cap 0.15).
  2. On landing, the whole boot layer fades out (0.45s) revealing the page below.
  3. Emit an onBoot callback so the parent can unlock scrolling.
This is deliberate: the viewer's very first interaction with this project is A JUMP.
Do not replace it with a generic "enter" fade.

FALLBACK: if nothing is pressed for 5 seconds, auto-advance with the same jump.

=== KEYBOARD SAFETY (critical) ===
The Space keydown listener is added ONLY while this boot overlay is mounted, and it
calls preventDefault ONLY while the overlay is visible. Remove the listener in the
effect cleanup. Never leave a global Space handler alive - it destroys page scrolling
for the rest of the page.

=== ACCESSIBILITY ===
prefers-reduced-motion: no grid draw-in, no jump, no squash. Render the final state
immediately with a real focusable <button> labeled VERBATIM: "[ 시작하기 ]"
The "PRESS SPACE" prompt must ALSO be a real focusable button so keyboard and screen
reader users have an actual control, not just a hint.
Audio hard-capped at 0.15 and gated by the global sound toggle.

=== RESPONSIVE ===
< 768px: title 44px, subtitle 12px, motivation line 16px, player block 36px.
Touch devices: the prompt reads VERBATIM "TAP TO START" and the whole screen is a
tap target.

=== DO NOT ===
No scanlines, no CRT curvature, no glitch, no chromatic aberration, no strobing.
Do not use pixel fonts. Do not delay the motivation line past 2.5s - the viewer must
learn WHY this project exists within the first 4 seconds.
Do not lock scrolling for longer than the boot sequence itself.
```

---

## PAGE 01 — 히어로 · 스테이지 셀렉트 보드

**개발 실체**: 프로젝트 정체 + **데모 영상 · GitHub 저장소**
**연출 장치**: 링크가 버튼이 아니라 **스테이지 보드 위의 특별 슬롯 2칸**

```text
Build the HERO SECTION of a Unity 3D platformer portfolio page, built around a
STAGE SELECT BOARD that doubles as the page's table of contents and progress bar.
The demo video and GitHub repository are two special SLOTS on that board - never a
conventional link row.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained section.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the project is (identity + hard facts, including that it is a TEAM project)
2. The gameplay demo video entry point
3. The GitHub repository link, with an honest note that it may be access-restricted

=== MOOD ===
A game's stage select screen. Clean, confident, snappy, dark green-black.
Faint wireframe grid in the background. Modern game UI, not retro pixel art.

=== DESIGN TOKENS (use exactly) ===
background #04120d | primary #34d399 | secondary #059669 | accent #6ee7b7
locked rgba(255,255,255,0.10) | text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.46)
warn #fbbf24 | panel bg #061a12, border rgba(52,211,153,0.16)
grid overlay: 48px cells, 1px lines rgba(52,211,153,0.05)
fonts: headings font-black, body sans leading-8, ALL labels/numbers font-mono
       with font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) overshoot, 0.25s-0.6s | rounded-md

=== PERSISTENT HEADER (fixed, present on every section of this page) ===
Height 56px, background rgba(4,18,13,0.78), backdrop-blur(8px),
bottom border 1px rgba(52,211,153,0.14).
  LEFT   "← 마을로"  13px font-mono rgba(255,255,255,0.46)
  CENTER "TSEROF"   14px font-black rgba(255,255,255,0.86), letter-spacing 0.06em
  RIGHT  a live unlock readout, format VERBATIM: "▮ 잠금 해제 1 / 11"
         13px font-mono, color #34d399, tabular-nums, driven by scroll progress,
         updating in real time. Then a sound toggle icon.

  Next to the readout, render a MINI STAGE BOARD: 11 cells in a row, each 10x10px,
  rounded-sm, 3px gap.
    unlocked cell -> background #34d399
    current cell  -> background #6ee7b7 with a 1px outline and a soft 6px glow
    locked cell   -> background rgba(255,255,255,0.10)
  A cell flips from locked to unlocked with a 0.25s scale pop (0.6 -> 1.15 -> 1) when
  its section is reached. This mini board is the page's ONLY progress indicator - do
  not add a conventional scrollbar-style progress line anywhere.

  PERSISTENCE: store the highest unlocked index in sessionStorage and restore it on
  reload. This mirrors the game's own save/continue feature - keep it.

=== LAYOUT ===
Full-bleed, min-height 100vh, single centered column, max-width 900px.
  y ~16%  Kicker
  y ~24%  Headline (2 lines)
  y ~42%  A two-column row: [IMG-01] (44%) | meta grid (56%)
  y ~62%  THE STAGE SELECT BOARD - full column width, height 320px

=== CONTENT (Korean copy - VERBATIM, never translate) ===

KICKER (font-mono 12px, letter-spacing 0.3em, uppercase, color #34d399):
  "UNITY · 3D 플랫포머 · 팀 프로젝트"

HEADLINE (font-black, 40px desktop / 28px mobile, leading-tight):
  Line 1, rgba(255,255,255,0.86), VERBATIM:
    "플레이어가 게임을 끄는 건 어려워서가 아니다."
  Line 2, color #6ee7b7, margin-top 12px, VERBATIM:
    "내 조작이 안 먹혔다고 느낄 때다."

META GRID (2x2 cells; single column below 640px).
Each cell: value 24px font-mono font-black rgba(255,255,255,0.86) on top,
label 11px font-mono rgba(255,255,255,0.46) letter-spacing 0.1em below.
Border 1px rgba(52,211,153,0.16), rounded-md, padding 16px, background #061a12.
  Cell 1  value "2단"      label "점프 · 4방향 접지 판정"
  Cell 2  value "다단계"    label "스테이지 · 잠금 해제"
  Cell 3  value "팀"       label "협업 · Git 워크플로"
  Cell 4  value "Unity"    label "2022.3 / C#"

Cell values are deliberately non-numeric where the real number is unverified.
DO NOT replace them with invented counts (stage counts, playtime, team size).

=== [IMG-01] ===
A 16/9 image slot, rounded-md, border 1px rgba(52,211,153,0.16), overflow hidden.
Caption bar below it, font-mono 11px, rgba(255,255,255,0.46), padding 8px 12px,
VERBATIM: "타이틀 화면"
PLACEHOLDER BEHAVIOR (required): if the image source is missing, render a CSS
placeholder - a greybox scene (three stacked rectangles in #071f16 to #0a2a1d on a
grid), the caption repeated at 12px rgba(255,255,255,0.35), and a ratio hint,
VERBATIM: "16 : 9 · 이미지 자리". NEVER an empty gray box.

=== THE STAGE SELECT BOARD (the defining idea of this page) ===
A full-width panel, height 320px, background #061a12, rounded-md,
border 1px rgba(52,211,153,0.16), padding 24px, position relative.
Header strip inside, font-mono 11px rgba(255,255,255,0.46), letter-spacing 0.2em,
VERBATIM: "▸ STAGE SELECT"

Inside, 11 slots laid out along a connected path (not a plain grid): two rows of 6
and 5, joined by a 2px connector line in rgba(52,211,153,0.20) that zigzags between
consecutive slots, like a world map route.
Each slot: 76x76px, rounded-md.

SLOT STATES:
  UNLOCKED : border 1px #34d399, background rgba(52,211,153,0.07),
             number in font-mono 20px font-black color #34d399
  CURRENT  : same as unlocked plus a 1px #6ee7b7 outline, a soft 14px glow, and a
             slow 2.4s breathing scale (1 <-> 1.03)
  LOCKED   : border 1px rgba(255,255,255,0.10), background transparent,
             a padlock glyph 14px in rgba(255,255,255,0.22), number hidden

Slot numbers are VERBATIM "00" through "10".
Slot 00 starts UNLOCKED; slot 01 is CURRENT; 02-10 are LOCKED.
Under each unlocked slot, a 10px font-mono label rgba(255,255,255,0.46) with that
section's name, VERBATIM in order:
  "부팅"  "소개"  "점프"  "저장 설계"  "트러블 01"  "스테이지"
  "트러블 02"  "이어하기"  "구조"  "결과"  "회고"
Locked slots show VERBATIM "???" instead.

TWO SPECIAL SLOTS (this replaces any link bar):
Place two EXTRA slots off the main path, in the panel's right area, both already
unlocked and visually distinct (border 1px #6ee7b7, background rgba(110,231,183,0.08)):

  SLOT "▶"  - DEMO VIDEO   (right area, upper)
    Glyph: a play triangle, 22px, color #6ee7b7.
    Label below, font-mono 11px, color #6ee7b7, VERBATIM: "플레이 영상"
    Sub-label, font-mono 10px, rgba(255,255,255,0.46), VERBATIM: "[확인필요] 길이"
    Hover/focus: lifts 4px with overshoot, glow strengthens.
    Click -> opens a video lightbox: overlay rgba(2,10,7,0.92) with backdrop-blur(6px),
    a 16/9 player centered at max-width 1000px. If no video source is supplied, render
    a CSS placeholder inside the player: a greybox platform scene built from stacked
    rectangles plus centered text, VERBATIM "게임플레이 영상 자리 · 16:9".
    Esc or overlay click closes it.
    [VIDEO-01] gameplay footage: movement, a double jump, one stage clear.

  SLOT "< >" - GITHUB   (right area, lower)
    Glyph: a monospace "< >" at 20px, rgba(255,255,255,0.80).
    Label below, font-mono 11px, rgba(255,255,255,0.86), VERBATIM: "GitHub 저장소"
    Sub-label, font-mono 10px, color #fbbf24, VERBATIM: "팀원 소유 · 접근 제한 가능"
    Click -> opens https://github.com/KimEoJin24/TSEROF in a new tab
    (target _blank, rel noreferrer).
    The #fbbf24 sub-label is REQUIRED. Do not present a repository the viewer may not
    be able to open as if it were guaranteed public.

HINT (bottom-center of the panel, font-mono 11px, rgba(255,255,255,0.30), fading out
permanently once the viewer scrolls past this section):
  VERBATIM: "아래로 내려가면 스테이지가 하나씩 열립니다"

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Kicker fades up (y 10px -> 0, 0.35s)
0.15s  Headline line 1 reveals word by word (stagger 0.03s, y 8px -> 0)
0.55s  Headline line 2 reveals
0.95s  [IMG-01] and meta cells fade in left to right, 0.07s apart, with overshoot
1.40s  Board panel fades up (y 16px -> 0, 0.45s)
1.60s  The 11 slots pop in one at a time along the path, 0.06s apart
       (scale 0.6 -> 1.12 -> 1). The connector line draws itself with SVG
       stroke-dashoffset over 0.8s, in sync with the slots.
2.60s  The two special slots pop in with a brighter glow pulse
2.90s  Hint text fades in
Hover an unlocked slot: lifts 4px with overshoot. Hover a locked slot: it shakes
horizontally 2px for 0.2s and the padlock brightens briefly - clear "not yet" feedback.

=== RESPONSIVE ===
< 1024px: [IMG-01] moves above the meta grid, full width.
< 768px: headline 28px; meta grid single column; board slots shrink to 56x56px in
three rows; the two special slots move to their own row BELOW the path, side by side
at full width; board height auto.

=== ACCESSIBILITY ===
prefers-reduced-motion: no pop-in, no breathing, no shake - everything renders
immediately in final state; the connector line draws instantly.
The two special slots must be real focusable elements (button / anchor) reachable by
Tab, with visible focus rings (2px #34d399, offset 2px).
Locked slots must be rendered with aria-disabled and an accessible name containing
VERBATIM "잠김" - never silently unfocusable.
The mini board in the header needs a visually hidden text equivalent stating the
current unlock count. Do not put aria-live on it.

=== DO NOT ===
Do not render the demo video and GitHub as a conventional button row anywhere on this
page. Do not invent stage counts, playtime, or team size - use the non-numeric values
and [확인필요] labels exactly as written.
Do not omit the GitHub access-restriction sub-label.
No scanlines, no glitch, no CRT, no pixel fonts.
```

---

## PAGE 02 — 핵심 구현 #1 · 직접 점프해 보기

**개발 실체**: 2단 점프 컨트롤러 구현 + **실제 C# 코드**
**연출 장치**: 관람객이 직접 조작 → **발판 끝에서 점프가 씹히는 걸 겪는다** (P04 복선)

```text
Build a SECTION with a playable mini-platformer demo that reveals the real C# player
controller code as the viewer plays, for a Unity 3D platformer portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the gameplay actually is (movement + double jump + finding hidden items)
2. That the controller is a physics-driven state machine, not a tween
3. THE ACTUAL C# CODE for the jump, revealed as a consequence of the viewer's own
   input, not parked in a separate code section
4. A deliberately unresolved frustration: jumping at the very edge of a platform
   sometimes does nothing. This is the setup for the troubleshooting section later.

=== MOOD ===
A greybox test level. Functional, snappy, developer-facing. Dark green-black with a
wireframe grid. This should feel like a Unity scene view, not a finished game.

=== DESIGN TOKENS (use exactly) ===
background #04120d | primary #34d399 | secondary #059669 | accent #6ee7b7
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.46)
bad #f87171 | warn #fbbf24
panel bg #061a12, border rgba(52,211,153,0.16)
syntax: comments #4b7c68, strings #d9a45b, keywords #34d399, numbers #b58cf0
grid overlay: 48px cells, 1px lines rgba(52,211,153,0.05)
fonts: headings font-black, body sans leading-8, code + labels font-mono,
       ALL numbers font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) overshoot, 0.25s-0.6s | rounded-md

=== LAYOUT ===
Single centered column, max-width 1000px, padding-block 120px.
  Block A : label + two paragraphs (max-width 720px)
  Block B : a two-column split, gap 20px, aligned to the top
              LEFT  (58%) : the playable demo, height 400px
              RIGHT (42%) : the code reveal panel, height 400px
            Below 1024px this becomes a single stacked column (demo first).
  Block C : [IMG-02] + the hook line

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "STAGE 02 · 무엇을 만들었나"

PARAGRAPH 1 (17px, leading-9, rgba(255,255,255,0.86)):
  "잃어버린 아이템을 찾아 스테이지를 클리어하는 3D 플랫포머다.
   WASD로 움직이고, 스페이스로 뛰고, 공중에서 한 번 더 뛴다.
   내가 맡은 건 이 세 줄이 손에 붙게 만드는 일이었다."
  Emphasize "손에 붙게 만드는 일" in #6ee7b7, font-bold.

PARAGRAPH 2 (17px, leading-9, margin-top 24px):
  "플랫포머에서 점프는 애니메이션이 아니라 판정이다.
   지금 땅에 있는가, 공중 점프를 몇 번 썼는가, 그걸 언제 초기화하는가.
   이 세 가지만 정하면 나머지는 물리가 해준다."

=== BLOCK B LEFT: THE PLAYABLE DEMO (centerpiece) ===
Container: height 400px, rounded-md, border 1px rgba(52,211,153,0.16),
background #061a12, overflow hidden, position relative.
Header strip (34px, border-bottom 1px rgba(52,211,153,0.14)):
  left  font-mono 11px rgba(255,255,255,0.46) VERBATIM: "▸ 직접 조작해 보세요"
  right two live readouts, font-mono 11px, tabular-nums, 14px apart:
        VERBATIM format "점프 0 / 2"  and  VERBATIM format "아이템 0 / 3"

Inside, a 2D side-view greybox level (a 2D stand-in for a 3D game - the footer says so):
  - Ground plane at the bottom, 24px tall, background #0a2a1d,
    top border 2px rgba(52,211,153,0.30)
  - Three floating platforms at different heights, each 90x14px, same styling
  - The player: a 26x26px square, background #34d399, rounded-sm
  - Three collectible items: 12x12px diamonds (rotated squares), color #6ee7b7,
    bobbing +/- 4px on a 1.6s cycle, placed so reaching each requires a double jump

PHYSICS (implement as a real fixed-timestep loop, not CSS transitions):
  gravity, a horizontal move speed, a jump impulse, a grounded check, air control,
  and a capped terminal fall speed.
  Run the loop with requestAnimationFrame using an accumulator so the simulation step
  is a FIXED dt (e.g. 1/60) regardless of display refresh rate. Do NOT drive physics
  off raw frame deltas - a 144Hz monitor must behave identically to a 60Hz one.

CONTROLS:
  A / D or Left / Right  -> move
  Space                  -> jump; a second Space while airborne -> double jump
  The jump counter resets to 0 the moment the player becomes grounded.
On landing, squash-and-stretch (scaleY 1 -> 0.72 -> 1.06 -> 1 over 0.3s) plus a small
dust puff. Short quiet sounds for jump / land / pickup, volume cap 0.15.

THE DELIBERATE FLAW (do not fix it on this page):
The grounded check is strict: the instant the player's box leaves a platform's
horizontal span, grounded becomes false. So pressing Space one or two frames after
walking off an edge does NOTHING. Leave this in. It is the setup for a later section.
When a jump input is REJECTED, briefly flash a 10px font-mono label above the player,
color #f87171, VERBATIM: "입력 무시됨"  (0.5s, then fades).
Also increment a counter of rejected inputs; the page uses it below.

COMPLETION: when all three items are collected, a line fades in at the container's
bottom, font-mono 13px, color #34d399, VERBATIM: "아이템 3개 전부 찾았습니다"
plus a reset button at bottom-right, font-mono 11px, VERBATIM: "↻ 다시"

Footer strip (border-top 1px rgba(52,211,153,0.14), font-mono 11px,
rgba(255,255,255,0.46), padding 8px 14px), VERBATIM:
  "// 실제 게임은 3D입니다. 판정 로직만 그대로 옮긴 2D 재현입니다"
  This disclaimer is REQUIRED.

KEYBOARD SAFETY (critical, non-negotiable):
Attach the key listeners ONLY while the pointer is inside this container OR the
container has focus. Call preventDefault on Space and the arrow keys ONLY in that
state. Never attach a global key handler - Space and arrows are scroll keys and
capturing them globally breaks the entire page. Remove all listeners in the effect
cleanup. Show a 1px #34d399 focus ring when the container is active, plus a font-mono
10px corner hint, VERBATIM: "클릭하면 조작할 수 있습니다"

PERFORMANCE: pause the physics loop when the container leaves the viewport
(IntersectionObserver) and when document.hidden is true. Resume on return.

=== BLOCK B RIGHT: THE CODE REVEAL PANEL ===
Same height as the demo (400px), rounded-md, border 1px rgba(52,211,153,0.16),
background #061a12.
Header bar: three window dots (#f87171 #fbbf24 #34d399, 9px), then the filename in
font-mono 11px rgba(255,255,255,0.46), VERBATIM: "PlayerController.cs"

INITIAL STATE (before the viewer plays):
The code is present but almost invisible: every line at rgba(255,255,255,0.07), no
syntax colors. Centered over it, a muted line, font-mono 12px,
rgba(255,255,255,0.35), VERBATIM: "왼쪽에서 움직여 보면 여기에 코드가 드러납니다"

REVEAL BEHAVIOR (this is the payoff):
Each new action on the LEFT reveals a specific slice of the code on the RIGHT.
The reveal is a downward sweep: a linear-gradient highlight in rgba(52,211,153,0.10)
travels across the target lines over 0.35s, and as it passes those lines animate from
rgba(255,255,255,0.07) to full syntax coloring.
  first horizontal move -> reveals the movement lines (reading the input axis and
     applying horizontal velocity)
  first ground jump     -> reveals the grounded check and jump impulse lines, with a
     rgba(52,211,153,0.10) row background
  first double jump     -> reveals the air-jump branch and the jump-count reset lines
Reveals are permanent once triggered.

CODE CONTENT: Unity C#, roughly 24 lines. Show a character controller that, each fixed
step: reads a movement axis and applies horizontal velocity to a Rigidbody, performs a
grounded check against a ground layer, resets an air-jump counter when grounded, and
on a jump input either applies a ground jump impulse or, if an air jump remains,
applies an air jump and decrements the counter.
Keep the grounded check NAIVE here: a SINGLE downward ray cast from the character's
centre point only. That single-point check is the actual bug and it must stay broken
on this page - it is the setup for PAGE 04.
Line numbers in a left gutter, rgba(255,255,255,0.20), min-width 20px, right-aligned,
user-select none. Code font-mono 12px, leading-relaxed.

Caption bar at the bottom (border-top 1px rgba(52,211,153,0.14), font-mono 11px,
rgba(255,255,255,0.46), prefixed "// "), changing as slices reveal:
  before any reveal  VERBATIM: "// 아직 조작하지 않았습니다"
  after movement     VERBATIM: "// 입력을 속도로 바꾼다. 여기까지는 쉽다"
  after ground jump  VERBATIM: "// 땅에 있는지 판정하고 힘을 준다"
  after double jump  VERBATIM: "// 공중 점프는 횟수를 세서 막는다"

=== BLOCK C: IMAGE + THE HOOK ===
[IMG-02] a 16/9 image slot, full column width, rounded-md,
border 1px rgba(52,211,153,0.16), with a caption bar below (font-mono 11px,
rgba(255,255,255,0.46), padding 10px 14px), VERBATIM:
  "그레이박스 레벨 프로토타입 — 아트 이전의 판정 테스트용 씬"
Same CSS placeholder rule as elsewhere (greybox rectangles on a grid, caption repeated
at 12px, ratio hint VERBATIM "16 : 9 · 이미지 자리"). NEVER an empty gray box.

THE HOOK (under the image; if the rejected-input counter is greater than zero show
variant A, otherwise variant B), 16px leading-9, rgba(255,255,255,0.86),
max-width 760px:

  VARIANT A (rejected input happened), VERBATIM:
    "혹시 발판 끝에서 점프가 씹혔나요? 방금 그건 버그가 아니라 위 코드 그대로입니다.
     발판을 벗어난 순간 땅 판정이 꺼지기 때문입니다. 이 문제로 며칠을 썼고,
     그 얘기는 곧 하겠습니다."
  VARIANT B (no rejected input yet), VERBATIM:
    "발판 가장자리에서 걸어 나가면서 점프해 보세요. 가끔 씹힙니다.
     버그가 아니라 위 코드 그대로입니다. 이 문제로 며칠을 썼고,
     그 얘기는 곧 하겠습니다."

  Emphasize "버그가 아니라 위 코드 그대로입니다" in #fbbf24, font-bold.
  This is a deliberate setup for the troubleshooting section - keep it exactly.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Section label fades in
0.15s  Paragraph 1 reveals word by word (stagger 0.02s)
0.70s  Paragraph 2 reveals
1.20s  Demo container and code panel fade up together (y 18px -> 0, 0.45s, overshoot)
1.45s  Platforms slide in from the left 0.07s apart, then the three items pop in
1.80s  The player block drops in from above and lands with squash-and-stretch
2.10s  The code panel's hint line fades in
2.40s  [IMG-02] and the hook fade up

=== RESPONSIVE ===
< 1024px: single column, demo on top (height 340px), code panel below (height auto,
max-height 400px with internal vertical scroll).
< 768px: the demo switches to TOUCH controls - three on-screen buttons inside the
container (left / right / jump), each 56x56px, font-mono, border 1px
rgba(52,211,153,0.30); the keyboard hint becomes VERBATIM "버튼으로 조작하세요";
code font-size 11px with internal horizontal scroll (the block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no squash-and-stretch, no dust, no sweep animation (code
slices appear instantly). The demo remains playable.
The demo container must be a real focusable element with a visible focus ring and an
accessible description of the controls. The on-screen touch buttons must also be real
buttons usable by keyboard, so the demo is completable without pressing Space.
Provide a visually hidden summary of the counters updated on change - do NOT put
aria-live on the running numbers.
Code must be selectable, copyable text - never an image.

=== DO NOT ===
Do not widen the ground check on this page - the single centre ray is the setup for
PAGE 04 and must stay broken here.
Do not add coyote time anywhere in this room. It was tried during development and
removed (it let the player jump in mid-air); it appears only as a REJECTED attempt
on PAGE 04, never as the fix.
Do not show the full code colored from the start.
Do not use a syntax highlighting library; hand-color tokens with spans.
Do not run the physics loop off-screen. Do not capture keys globally.
```

---

## PAGE 03 — 기술 의사결정 · 진행 상황을 어디에 저장할 것인가

**개발 실체**: 저장 방식 3안 비교 + 선택 근거 + **대신 포기한 것**
**연출 장치**: 3안에 **같은 입력을 동시에 먹여** 결과가 눈앞에서 갈린다

```text
Build a TECHNICAL DECISION section where three candidate save implementations receive
the SAME input at the same time and visibly diverge, for a Unity 3D platformer
portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. Why saving was needed at all (stage unlocking is meaningless without it)
2. Three real candidates that were considered, with what each actually does
3. The choice and the concrete reason for it
4. An honest cost: what was GIVEN UP by choosing it

=== MOOD ===
An engineer laying three options on a table and running the same test through all of
them. Analytical, snappy, no drama. Dark green-black, wireframe grid, modern game UI.

=== DESIGN TOKENS (use exactly) ===
background #04120d | primary #34d399 | secondary #059669 | accent #6ee7b7
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.46)
bad #f87171 | warn #fbbf24
panel bg #061a12, border rgba(52,211,153,0.16)
syntax: comments #4b7c68, strings #d9a45b, keywords #34d399, numbers #b58cf0
grid overlay: 48px cells, 1px lines rgba(52,211,153,0.05)
fonts: headings font-black, body sans leading-8, code + labels font-mono,
       ALL numbers font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) overshoot, 0.25s-0.6s | rounded-md

=== LAYOUT ===
Single centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : the three-way live comparison (centerpiece), full width, ~460px tall
  Block C : decision table
  Block D : the honest-cost card
  Block E : [IMG-03]

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "STAGE 03 · 진행 상황을 어디에 저장할 것인가"

HEADING (28px font-black):
  "잠금 해제는 저장이 없으면 그냥 잠금이다"

PARAGRAPH 1 (17px, leading-9, margin-top 20px):
  "스테이지를 순서대로 열어주기로 한 순간, 어디까지 깼는지를 어딘가에 남겨야 했다.
   껐다 켜면 처음부터인 게임에서 잠금 해제는 아무 의미가 없다."

PARAGRAPH 2 (17px, leading-9, margin-top 24px):
  "후보는 셋이었다. 제일 쉬운 것, 제일 구조적인 것, 제일 Unity다운 것.
   셋 다 만들어보고 같은 상황을 먹여봤다."
  Emphasize "셋 다 만들어보고" in #6ee7b7, font-bold.

=== BLOCK B: THREE-WAY LIVE COMPARISON (centerpiece) ===
Container: full width, rounded-md, border 1px rgba(52,211,153,0.16),
background #061a12, padding 22px.
Header strip: font-mono 11px rgba(255,255,255,0.46), letter-spacing 0.2em,
VERBATIM: "▸ 같은 입력을 세 방식에 동시에 먹여보기"

A SHARED INPUT BAR at the top: three buttons in a row, font-mono 12px,
border 1px rgba(52,211,153,0.30), rounded-md, padding 8px 14px, VERBATIM:
  "스테이지 3 클리어"    "아이템 2개 획득"    "게임 재시작"
Pressing any button sends that same event to ALL THREE panels simultaneously.
The pressed button flashes #34d399 for 0.2s. A shared event log line below the bar,
font-mono 11px rgba(255,255,255,0.46), shows the last event sent.

BELOW IT, three panels side by side (stacking below 900px), gap 16px, each 300px tall,
rounded-md, border 1px rgba(255,255,255,0.10), background #04120d, padding 16px:

  PANEL 1 - header VERBATIM "PlayerPrefs"
    sub-header font-mono 10px rgba(255,255,255,0.46), VERBATIM: "가장 쉬운 것"
    Body renders a FLAT key-value list, font-mono 12px, one pair per line, e.g.
    keys for the unlocked stage index and a play count.
    On "스테이지 3 클리어": the unlocked value increments with a 0.2s highlight.
    On "아이템 2개 획득": the panel CANNOT represent a list. Render a line in #f87171,
      font-mono 12px, VERBATIM: "✗ 배열 저장 불가 — 키를 쪼개야 함"
      and show the ugly workaround it forces, font-mono 11px rgba(255,255,255,0.46),
      VERBATIM: "item_0=true  item_1=true  item_2=false ..."
    On "게임 재시작": values persist correctly.
    Footer verdict chip, font-mono 11px, color #f87171,
      background rgba(248,113,113,0.12), padding 4px 10px, rounded,
      VERBATIM: "구조가 없다"

  PANEL 2 - header VERBATIM "JSON 직렬화"
    sub-header VERBATIM: "가장 구조적인 것"
    Body renders an actual nested JSON document, syntax-colored (keys #6ee7b7,
    numbers #b58cf0, strings #d9a45b, punctuation rgba(255,255,255,0.46)),
    font-mono 12px, containing an unlocked stage index, a cleared-stage list, and an
    items array.
    On any event: the JSON REWRITES ITSELF - the changed lines animate with a
    rgba(52,211,153,0.14) row highlight for 0.4s, and a small line under the panel
    reads, font-mono 10px, color #34d399, VERBATIM: "save.json 에 기록됨"
    On "게임 재시작": the JSON is re-read and the same structure comes back intact.
    Footer verdict chip, color #34d399, background rgba(52,211,153,0.12),
      VERBATIM: "구조 그대로 남는다"

  PANEL 3 - header VERBATIM "ScriptableObject"
    sub-header VERBATIM: "가장 Unity다운 것"
    Body renders an inspector-like field list, font-mono 12px, with an
    "에디터에서 편집 가능" badge in rgba(52,211,153,0.12).
    On "스테이지 3 클리어": updates instantly and looks great.
    On "게임 재시작": the values RESET - animate them back to defaults over 0.4s with
      a #fbbf24 flash, and show a line in #fbbf24, font-mono 12px, VERBATIM:
      "△ 빌드에서는 값이 유지되지 않음 — 에디터 전용 편집 도구에 가깝다"
    Footer verdict chip, color #fbbf24, background rgba(251,191,36,0.12),
      VERBATIM: "런타임 저장이 아니다"

THE POINT: the "게임 재시작" button is what separates the three. Make sure pressing it
produces three visibly different outcomes at the same moment. That divergence IS this
page's argument.

Footer strip of the container (border-top 1px rgba(52,211,153,0.14), font-mono 11px,
rgba(255,255,255,0.46), padding 8px 12px), VERBATIM:
  "// 각 방식의 동작 차이를 보여주는 재현입니다. 실제 저장 파일이 아닙니다"
  This disclaimer is REQUIRED.

=== BLOCK C: DECISION TABLE ===
Section label, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.46),
VERBATIM: "▸ 그래서 무엇을 골랐나"

A real <table>, three rows. Columns: 방식 (24%) | 장점 (30%) | 문제 (30%) | 판정 (16%).
Header cells font-mono 10px uppercase rgba(255,255,255,0.35).
Rows 1px bottom border rgba(255,255,255,0.07), padding-block 14px, font-mono 13px.

  Row 1  방식 VERBATIM "PlayerPrefs"
         장점 VERBATIM "세 줄이면 끝난다"
         문제 VERBATIM "배열·중첩 구조를 못 담는다"
         판정 VERBATIM "탈락" (color #f87171)
  Row 2  방식 VERBATIM "JSON 직렬화"
         장점 VERBATIM "구조 그대로 저장·디버깅 시 눈으로 확인 가능"
         문제 VERBATIM "파일을 열어 고치면 그대로 반영된다"
         판정 VERBATIM "채택" (color #34d399, font-bold)
  Row 3  방식 VERBATIM "ScriptableObject"
         장점 VERBATIM "인스펙터에서 값을 바꿔가며 테스트하기 좋다"
         문제 VERBATIM "빌드 런타임 저장 용도가 아니다"
         판정 VERBATIM "설정용으로만 사용" (color #fbbf24)

Row 2 gets a persistent left border 2px #34d399 and a slightly brighter background
rgba(52,211,153,0.05).

Below the table, one line, 15px leading-8, VERBATIM:
  "이어하기가 목표였으니 '나중에 사람이 읽고 고칠 수 있는 파일'이 오히려 장점이었다.
   디버깅할 때 세이브를 손으로 열어보는 것만으로 재현이 됐다."

=== BLOCK D: THE HONEST COST CARD (do not remove) ===
Margin-top 40px, padding 22px, rounded-md,
border 1px rgba(251,191,36,0.28), background rgba(251,191,36,0.04).
  Label font-mono 11px letter-spacing 0.2em color #fbbf24,
  VERBATIM: "✗ 대신 포기한 것"
  Body 15px leading-8 margin-top 10px, VERBATIM:
  "평문 JSON이라 메모장으로 열어 숫자를 바꾸면 그대로 반영된다.
   해시 검증도, 암호화도 넣지 않았다. 싱글 플레이 프로토타입이라 감수한 것이지
   해결한 게 아니다. 순위나 기록을 다루는 게임이었다면 이 선택은 틀렸다."
  Emphasize "감수한 것이지 해결한 게 아니다" in #fbbf24, font-bold.

=== BLOCK E: [IMG-03] ===
A 16/9 image slot, full column width, margin-top 40px, rounded-md,
border 1px rgba(52,211,153,0.16), overflow hidden, with a caption bar below
(font-mono 11px, rgba(255,255,255,0.46), padding 10px 14px), VERBATIM:
  "난이도 선택 화면 — 저장되는 값 중 하나"
PLACEHOLDER BEHAVIOR (required): CSS placeholder of greybox rectangles on a grid, the
caption repeated at 12px rgba(255,255,255,0.35), ratio hint VERBATIM
"16 : 9 · 이미지 자리". NEVER an empty gray box.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label and heading fade up
0.30s  Paragraphs reveal word by word (stagger 0.02s)
1.00s  Comparison container fades up (y 18px -> 0, 0.45s)
1.20s  The three panels pop in left to right, 0.10s apart (scale 0.94 -> 1.02 -> 1)
1.70s  The shared input bar buttons pop in 0.06s apart
2.10s  Decision table header appears; rows stagger in 0.18s apart, 판정 tags landing
       0.15s behind each row with a small scale pop
2.90s  Honest-cost card slides in from the left (x -12px -> 0)
3.20s  [IMG-03] fades up

=== RESPONSIVE ===
< 900px: the three panels stack vertically (PlayerPrefs -> JSON -> ScriptableObject),
each 240px tall; the shared input bar becomes a 3-across button row that wraps.
< 768px: decision table becomes stacked cards (방식 as the card title, 장점/문제/판정
in a column); JSON panel font-size 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no pop-in, no row highlight sweeps - values change instantly.
The decision table must be a real <table> with proper headers.
The three input buttons are real <button>s; after each press, update a visually hidden
status line describing what changed in each panel (one update per press, not per frame).
Do not rely on color alone for 탈락 / 채택 / 설정용 - each 판정 cell must carry its
Korean word as text.
All JSON and code is selectable, copyable text - never an image.

=== DO NOT ===
Do not remove the "대신 포기한 것" card - a decision section without a cost is a
sales pitch.
Do not present the panels as real profiler or file-system output; the disclaimer stays.
Do not invent file sizes, save/load timings, or benchmark numbers.
```

---

## PAGE 04 — 트러블슈팅 01 · 발판 끝에서 씹힌 점프

**개발 실체**: 증상 → 재현 → 소거(**실패한 시도 = 코요테 타임**) → 원인 → Before/After → 검증 → **남은 한계**
**연출 장치**: **PAGE 02에서 관람객이 이미 겪은 그 씹힘**을 정면으로 회수 → `레이 1개 ↔ 4개` 토글로 직접 재조작

> 🔵 **2026-07-31 재설계됨.** 이전 버전은 이 페이지 전체(그리고 P02의 복선까지)를
> **「코요테 타임 유무」** 위에 세웠는데, **실제 저장소에 코요테 타임 코드가 없습니다.**
> 실제 해결은 `ForceReceiver.CheckIsGrounded()` 의 **접지 레이를 발 4방향으로 확장**한 것입니다:
> ```csharp
> Ray[] rays = new Ray[4] {
>   new Ray(transform.position + transform.forward * 0.25f + Vector3.up * 0.01f, Vector3.down),
>   new Ray(transform.position - transform.forward * 0.25f + Vector3.up * 0.01f, Vector3.down),
>   new Ray(transform.position + transform.right   * 0.25f + Vector3.up * 0.01f, Vector3.down),
>   new Ray(transform.position - transform.right   * 0.25f + Vector3.up * 0.01f, Vector3.down)
> };
> for (int i = 0; i < rays.Length; i++)
>   if (Physics.Raycast(rays[i], maxDistance, LayerMask.GetMask("Ground")))
>   { if (!isGrounded) EnterGround(); return; }
> ```
> 코요테 타임은 **시도했다가 뺐습니다** — 공중에서도 점프가 나가는 부작용이 있었습니다.
> 그래서 이 페이지에서 코요테 타임은 **「실패한 시도」 칸에만** 등장합니다.
> 이 편이 오히려 더 좋은 논증입니다: **시간으로 때우려다 공간 문제인 걸 알아낸 과정**이니까요.

```text
Build a TROUBLESHOOTING CASE FILE for a Unity 3D platformer where the viewer replays
the exact edge-jump failure they already felt earlier on the page, then toggles the
ground check from ONE centre ray to FOUR foot rays and feels the same input work.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
The mini-platformer must be the SAME hook used earlier on this page, with the ray
count as its only changed option - otherwise the "same input" claim is not true.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
All eight stages, in order:
symptom -> reproduction -> elimination -> THE FAILED ATTEMPT (coyote time, and the
concrete reason it was removed) -> root cause -> before/after code -> verification
-> remaining limits.
The failed attempt is not optional. It is the most valuable part of this page.

=== MOOD ===
A greybox test level with the debug gizmos switched on. Dark green-black, wireframe,
developer-facing. Precise rather than dramatic - this is a geometry bug.

=== DESIGN TOKENS (use exactly) ===
background #04120d | primary #34d399 | secondary #059669 | accent #6ee7b7
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.46)
bad #f87171 | warn #fbbf24 | ray #7dd3fc
panel bg #061a12, border rgba(52,211,153,0.16)
syntax: comments #4b7c68, strings #d9a45b, keywords #34d399, numbers #b58cf0
grid overlay: 48px cells, 1px lines rgba(52,211,153,0.05)
fonts: headings font-black, body sans leading-8, code + labels font-mono,
       ALL numbers font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) overshoot, 0.25s-0.6s | rounded-md

=== LAYOUT ===
Centered column, max-width 1040px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE REPRODUCTION - playable strip + ray-count toggle + gizmo view
  Block C : elimination table (including the failed attempt row)
  Block D : THE FAILED ATTEMPT card (coyote time) - full width, its own emphasis
  Block E : root cause
  Block F : before/after code
  Block G : verification + remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "03 · 트러블슈팅 01"

HEADING (30px font-black):
  VERBATIM: "발이 발판에 걸쳐 있으면 땅이 아니었다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "발판 가장자리에서 점프하면 아무 일도 안 일어났다.
   화면에는 분명히 발판을 밟고 서 있었다.
   플레이 테스트에서 「점프가 씹힌다」는 말이 계속 나왔다."
  Add a callback line, margin-top 12px, 15px, #6ee7b7, font-bold, VERBATIM:
  "위에서 직접 겪으셨다면 그게 이 버그입니다."

=== BLOCK B: THE REPRODUCTION (the defining idea) ===
Margin-top 36px. Container, rounded-md, border 1px rgba(52,211,153,0.18),
background #061a12, padding 20px.

Header strip (32px): left font-mono 10px rgba(255,255,255,0.46),
VERBATIM: "재현 · 발판 끝에서 점프"
right a two-option toggle, font-mono 11px, VERBATIM: "레이 1개" | "레이 4개"
Default: 레이 1개.

PLAYABLE STRIP (height ~260px, canvas or DOM, fixed-timestep physics):
  A short greybox course: three platforms with clear gaps. The character is a simple
  capsule. Controls: Left/Right to move, Space or Up to jump.
  KEY CAPTURE RULE (binding for this whole room): capture Space and arrow keys ONLY
  while this container is focused or hovered. Never bind them globally - the page
  must scroll normally everywhere else. Show a focus ring (2px #34d399, offset 2px).

  THE GIZMO OVERLAY (always on in this section - this is a debug view):
    Draw the ground-check rays as short vertical lines beneath the capsule in #7dd3fc,
    each ending in a small dot.
      "레이 1개" mode : ONE ray from the capsule's centre.
      "레이 4개" mode : FOUR rays, offset forward / back / left / right.
    A ray that HITS ground turns #4ade80 and its dot fills.
    A ray that MISSES stays #7dd3fc at 40% opacity with a hollow dot.
    A grounded/not-grounded badge sits above the capsule, font-mono 10px:
      grounded     VERBATIM "접지" in #4ade80
      not grounded VERBATIM "공중" in rgba(255,255,255,0.46)

  THE WHOLE POINT: standing with the capsule's centre just past the platform edge,
  the single centre ray misses while the character is visibly still on the platform.
  The badge reads "공중", so the jump input is rejected. In "레이 4개" mode the rear
  ray still hits, the badge reads "접지", and the identical input jumps.

  A REJECTED-INPUT INDICATOR: when a jump input is ignored, flash the word
  VERBATIM "입력 무시" in #f87171, font-mono 10px, above the capsule for 0.5s.
  This makes the failure legible instead of feeling like lag.

  A hint beneath the strip, font-mono 10px rgba(255,255,255,0.35), VERBATIM:
    "발판 끝으로 걸어가서 점프해 보세요. 그 다음 토글을 바꿔서 같은 자리에서 다시."

  A note at the container's bottom-left, font-mono 9px rgba(255,255,255,0.32),
  VERBATIM: "재현용 예시입니다"

PERFORMANCE: fixed timestep accumulator so physics does not vary with frame rate.
The loop must stop when out of viewport or when document.hidden, and resume without
resetting the character's position.

=== BLOCK C: ELIMINATION TABLE ===
Margin-top 44px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "해본 것들"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "방법" | "해봤더니" | "판단"
Rows (판단 cells: rejected rgba(255,255,255,0.46) with "✕ ", adopted #4ade80 "● ",
the coyote row in #fbbf24 with "▲ "):
  "레이 길이를 늘린다"        | "발판 위 한참 떠 있어도 접지로 인식"      | "✕ 반대로 깨짐"
  "콜라이더를 키운다"         | "벽에 안 닿았는데 막힘"                  | "✕ 다른 판정이 깨짐"
  "코요테 타임을 준다"        | "가장자리는 해결 · 그런데 공중에서도 점프됨" | "▲ 넣었다가 뺌"
  "레이를 발 4방향으로 늘린다" | "가장자리에서만 정확히 접지로 바뀜"        | "● 채택"
Rows reveal 0.16s apart, sliding in from x -10px. The coyote row gets a 2px #fbbf24
left bar; the adopted row gets a 2px #4ade80 left bar over 0.5s and lands last.

=== BLOCK D: THE FAILED ATTEMPT (required, full width) ===
Margin-top 36px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "넣었다가 뺀 것 · 코요테 타임"
  Body 16px leading-8, VERBATIM:
  "땅에서 떨어진 뒤에도 짧은 시간 동안 점프를 허용하는 방식을 먼저 넣었다.
   가장자리 문제는 실제로 사라졌다.
   그런데 발판에서 뛰어내린 직후에도 그 시간이 살아 있어서,
   공중에서 한 번 더 점프가 나갔다. 2단 점프까지 있으니 3단이 된 셈이었다.
   시간으로 덮으려 했지만 원래 문제는 시간이 아니라 위치였다."
  Emphasize "원래 문제는 시간이 아니라 위치였다" in #fbbf24, font-bold.

  A small comparison strip beneath, two cells, gap 12px, font-mono 11px:
    Cell 1 border 1px rgba(251,191,36,0.22), padding 12px:
      title VERBATIM "시간으로 접근"  body VERBATIM "언제까지 땅으로 쳐줄까"
    Cell 2 border 1px rgba(74,222,128,0.22), padding 12px:
      title VERBATIM "위치로 접근"    body VERBATIM "어디를 땅인지 볼까"

=== BLOCK E: ROOT CAUSE ===
Margin-top 36px, padding 22px, rounded-md, border 1px rgba(52,211,153,0.28),
background rgba(52,211,153,0.05), border-left 3px #34d399.
  Label font-mono 10px letter-spacing 0.18em #34d399, VERBATIM: "원인"
  Body 16px leading-8, VERBATIM:
  "접지 판정을 캐릭터 중심에서 아래로 쏜 레이 하나로만 했다.
   캐릭터에는 폭이 있는데 판정에는 폭이 없었다.
   그래서 발이 절반쯤 걸쳐 있으면 중심은 이미 허공이었고, 코드는 정직하게 공중이라고 답했다."
  Emphasize "캐릭터에는 폭이 있는데 판정에는 폭이 없었다" in #6ee7b7, font-bold.

=== BLOCK F: BEFORE / AFTER CODE ===
Margin-top 40px. Two panels side by side, gap 16px (stack below 1024px).
Each: background #061a12, border 1px, rounded-md, header with three window dots and
a filename, body font-mono 12px with a line-number gutter.

  LEFT panel - border 1px rgba(248,113,113,0.28),
    filename VERBATIM: "before — 중심 레이 1개"
    CONTENT: ~6 lines casting a single downward ray from transform.position and
    setting isGrounded from that one result.
    HIGHLIGHT the single-ray line with rgba(248,113,113,0.12) and an inline marker,
    font-mono 10px #f87171, VERBATIM: "← 폭이 없음"

  RIGHT panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "ForceReceiver.cs (after)"
    CONTENT - use these EXACT lines (this is the real source, do not paraphrase):
      "Ray[] rays = new Ray[4]"
      "{"
      "  new Ray(transform.position + transform.forward * 0.25f + Vector3.up * 0.01f, Vector3.down),"
      "  new Ray(transform.position - transform.forward * 0.25f + Vector3.up * 0.01f, Vector3.down),"
      "  new Ray(transform.position + transform.right   * 0.25f + Vector3.up * 0.01f, Vector3.down),"
      "  new Ray(transform.position - transform.right   * 0.25f + Vector3.up * 0.01f, Vector3.down)"
      "};"
      ""
      "for (int i = 0; i < rays.Length; i++)"
      "{"
      "    if (Physics.Raycast(rays[i], maxDistance, LayerMask.GetMask(\"Ground\")))"
      "    {"
      "        if (!isGrounded) EnterGround();"
      "        return;"
      "    }"
      "}"
      "if (isGrounded) EnterAir();"
    HIGHLIGHT the four Ray constructor lines with rgba(125,211,252,0.12) and the
    LayerMask line with rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "네 방향 중 하나라도 닿으면 접지. 첫 히트에서 바로 빠져나온다."

  A note beneath both panels, font-mono 10px rgba(255,255,255,0.35), VERBATIM:
    "Ground 레이어만 검사하기 때문에 아이템이나 트리거는 접지로 세지 않습니다."

=== BLOCK G: VERIFICATION + REMAINING LIMITS ===
Margin-top 40px.
A verification strip, padding 16px, rounded-md, border 1px rgba(74,222,128,0.22),
background rgba(74,222,128,0.04).
  Label font-mono 10px letter-spacing 0.18em #4ade80, VERBATIM: "검증"
  A 3-row list, 15px leading-8, each prefixed "✓ ", VERBATIM:
    "발판 가장자리에서 점프 — 정상"
    "발판에서 뛰어내린 직후 — 3단 점프 안 나감 (코요테 때 났던 문제)"
    "스테이지 3종 전부에서 같은 조작으로 재확인"
Below the strip, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "에디터에서 기즈모를 켜두고 직접 반복해서 확인했습니다. 자동화된 테스트는 없습니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "남은 한계"
  A 4-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "레이 간격 0.25는 지금 캐릭터 크기에 맞춘 값입니다. 캐릭터가 바뀌면 다시 잡아야 합니다."
    "레이가 4개라 아주 얇은 발판 위에서는 여전히 전부 빗나갈 수 있습니다."
    "매 FixedUpdate마다 레이를 4번 쏩니다. 캐릭터가 많아지면 비용을 다시 봐야 합니다."
    "체감으로만 확인했고, 판정에 대한 자동 테스트는 끝내 만들지 못했습니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left, callback line at 1.00s
1.30s  The reproduction container fades up in "레이 1개" mode
2.10s  The character auto-walks to the platform edge ONCE and attempts a jump that is
       rejected ("입력 무시" flashes), then control hands over to the viewer with the
       hint line. This runs once per session only.
Blocks C through G animate on their own viewport entry.

=== PERFORMANCE ===
One fixed-timestep loop. Stop out of viewport and on document.hidden.
Draw gizmo rays in the same pass as the character - no separate loop.

=== RESPONSIVE ===
< 1024px: before/after panels stack (before on top).
< 720px: playable strip height 200px; replace keyboard control with two on-screen
buttons, VERBATIM "◀" "▶" and VERBATIM "점프"; the failed-attempt comparison cells
stack.
< 640px: code font 11px with internal horizontal scroll (blocks scroll, never the
page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no auto-walk demo, no row slide-in, no overshoot easing;
the "입력 무시" indicator appears without a flash.
The toggle is a real control with aria-pressed and a visible focus ring.
Announce the toggle change ONCE via aria-live="polite":
  VERBATIM "접지 판정 레이 1개" / VERBATIM "접지 판정 레이 4개"
Do NOT put aria-live on the grounded badge - it changes every frame.
Provide a visually-hidden description of the reproduction, VERBATIM:
  "캐릭터가 발판 가장자리에 서 있을 때 접지 판정이 어떻게 달라지는지 보여주는 시연입니다."
Ray hit/miss is never conveyed by color alone - the 접지/공중 text badge carries it.

=== DO NOT ===
Do NOT present coyote time as the fix. It was removed. It belongs only in Block C's
table row and Block D's failed-attempt card.
Do NOT paraphrase the after code - those lines are the real source.
Do NOT capture Space or arrow keys globally.
Do NOT invent frame timings, input-latency figures, or a count of playtest reports.
Do NOT let the viewer skip straight to "레이 4개" - the page must open in the broken
mode so the failure is felt first.
```

## PAGE 05 — 핵심 구현 #2 · 스테이지는 상태를 가진다

**개발 실체**: 스테이지 잠금 해제 상태머신 + 전이 조건 + **실제 C# 코드** + 설계 철학
**연출 장치**: **헤더의 스테이지 보드가 본문 한가운데로 확대되어 내려온다** → 관람객이 직접 클리어시킨다

```text
Build a SECTION about a stage-unlocking state machine, where the page's own persistent
progress board zooms out of the header into the body and becomes an interactive toy,
for a Unity 3D platformer portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That stage progression is a state machine with three states and explicit transitions
2. The real C# that owns those transitions
3. The design reason for sequential unlocking rather than opening everything
4. The connection to saving (a transition is meaningless unless it is persisted)

=== MOOD ===
A designer explaining a system they are fond of. Confident, playful, snappy.
Dark green-black, wireframe grid, modern game UI.

=== DESIGN TOKENS (use exactly) ===
background #04120d | primary #34d399 | secondary #059669 | accent #6ee7b7
locked rgba(255,255,255,0.10) | text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.46)
warn #fbbf24 | panel bg #061a12, border rgba(52,211,153,0.16)
syntax: comments #4b7c68, strings #d9a45b, keywords #34d399, numbers #b58cf0
grid overlay: 48px cells, 1px lines rgba(52,211,153,0.05)
fonts: headings font-black, body sans leading-8, code + labels font-mono,
       ALL numbers font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) overshoot, 0.25s-0.6s | rounded-md

=== LAYOUT ===
Single centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE ZOOMED BOARD + state diagram (centerpiece), full width, ~440px tall
  Block C : one code block
  Block D : the design-reason block + the meta callback
  Block E : [IMG-05]

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "STAGE 05 · 스테이지는 상태를 가진다"

HEADING (28px font-black):
  "잠김 · 열림 · 깸 — 세 개면 충분했다"

PARAGRAPH (17px, leading-9, margin-top 20px, max-width 760px), VERBATIM:
  "스테이지를 화면에 그리는 건 어렵지 않다. 어려운 건 각 칸이 지금 어떤 상태인지,
   그리고 언제 다음 상태로 넘어가는지를 한 곳에서 정하는 일이었다.
   이걸 여러 스크립트가 각자 판단하기 시작하면, 어디선가 반드시 어긋난다."
  Emphasize "한 곳에서 정하는 일" in #6ee7b7, font-bold.

=== BLOCK B: THE ZOOMED BOARD + STATE DIAGRAM (centerpiece) ===

THE ZOOM-IN ENTRANCE (the signature moment of this page):
This page's persistent header contains a mini stage board (11 small cells).
When this section scrolls into view, that mini board appears to FLY OUT of the header
and expand into the body: use a shared-layout / FLIP transition so the mini cells
visually travel from their header positions to their large positions here, over 0.7s
with the overshoot easing. The header's mini board fades to opacity 0.25 while the
large board is on screen, and returns to full opacity when it scrolls away.
If a shared-layout transition is not feasible, fall back to: the large board scales up
from 0.4 anchored at the top-right corner of the viewport (where the header board sits),
in the same 0.7s. Do not replace this with a plain fade - the board must read as the
SAME object.

Container: full width, rounded-md, border 1px rgba(52,211,153,0.16),
background #061a12, padding 24px.
Header strip: font-mono 11px rgba(255,255,255,0.46), letter-spacing 0.2em,
VERBATIM: "▸ 직접 클리어해 보세요"
Right side of the strip: a reset button, font-mono 11px, VERBATIM: "↻ 진행 초기화"

Two columns inside (stacking below 900px), gap 20px:

  LEFT (56%) - THE INTERACTIVE BOARD
    Six slots in two rows of three, each 84x84px, rounded-md, numbered VERBATIM
    "01" through "06". Slot 01 starts UNLOCKED, the rest LOCKED.
    STATE STYLES:
      LOCKED   : border 1px rgba(255,255,255,0.10), transparent background,
                 padlock glyph 16px rgba(255,255,255,0.22), number hidden
      UNLOCKED : border 1px #34d399, background rgba(52,211,153,0.07),
                 number font-mono 20px font-black #34d399,
                 plus a small font-mono 10px label under it, VERBATIM "도전 가능"
      CLEARED  : border 1px #6ee7b7, background rgba(110,231,183,0.12),
                 number in rgba(255,255,255,0.86), and a check glyph "✓" 16px #6ee7b7
                 in the top-right corner, plus a font-mono 10px label, VERBATIM "클리어"
    INTERACTION:
      Clicking an UNLOCKED slot -> it becomes CLEARED with a 0.3s scale pop
        (1 -> 1.12 -> 1) and a soft green glow; then 0.15s later the NEXT slot flips
        LOCKED -> UNLOCKED, its padlock rotating 25deg and fading out while the border
        lights up. One short soft unlock sound (volume cap 0.15).
      Clicking a LOCKED slot -> it shakes horizontally 3px for 0.2s, the padlock
        brightens briefly, and a font-mono 11px line appears under the board in #fbbf24
        for 1.2s, VERBATIM: "이전 스테이지를 먼저 깨야 합니다"
      Clicking a CLEARED slot -> nothing changes; show a font-mono 11px line in
        rgba(255,255,255,0.46) for 1.2s, VERBATIM: "이미 클리어한 스테이지입니다"
    A SAVE INDICATOR under the board, font-mono 11px, tabular-nums, showing the value
    that would be written, VERBATIM format: "저장됨 · unlocked = 1"
    It updates on every transition with a 0.3s rgba(52,211,153,0.14) flash.
    This is the explicit link to the save section - keep it.

  RIGHT (44%) - THE STATE DIAGRAM
    Three nodes stacked vertically, each a rounded-md box, 100% width, padding 12px,
    font-mono 13px, connected by SVG arrows drawn with stroke-dashoffset:
      Node 1 VERBATIM "LOCKED"    border 1px rgba(255,255,255,0.14)
      Node 2 VERBATIM "UNLOCKED"  border 1px rgba(52,211,153,0.40)
      Node 3 VERBATIM "CLEARED"   border 1px rgba(110,231,183,0.50)
    Arrow labels, font-mono 10px, rgba(255,255,255,0.46):
      LOCKED -> UNLOCKED  label VERBATIM "이전 스테이지 클리어"
      UNLOCKED -> CLEARED label VERBATIM "아이템 전부 획득 + 골 도달"
    A self-loop on CLEARED, label VERBATIM "재도전 가능 (상태 유지)"
    LIVE HIGHLIGHTING: whenever a transition fires on the left board, the matching
    arrow on the right lights up #34d399 and animates its dash offset once (0.45s),
    and the destination node pulses. This is what turns the toy into an explanation.

Footer strip of the container (border-top 1px rgba(52,211,153,0.14), font-mono 11px,
rgba(255,255,255,0.46), padding 8px 12px), VERBATIM:
  "// 상태 이름과 전이 조건은 실제 구현과 같습니다. 칸 수는 재현용입니다"

=== BLOCK C: CODE BLOCK ===
Standard styling (rounded-md, border 1px rgba(52,211,153,0.16), background #061a12,
three window dots, filename font-mono 11px rgba(255,255,255,0.46), line-number gutter
rgba(255,255,255,0.20), highlighted rows rgba(52,211,153,0.10), caption bar prefixed "// ").
  filename VERBATIM: "StageManager.cs"
  C#, roughly 18 lines. Show: a stage state enum with the three states, a method that
  resolves a stage's current state from the saved progress, and a clear handler that
  raises the highest unlocked index only when the new value is greater, then writes the
  progress out and raises a change event.
  HIGHLIGHT: the line that raises the unlocked index and the line that persists it.
  caption VERBATIM: "상태를 저장하지 않으면 잠금 해제는 그냥 화면 효과다"

A short caveat line under the code, 14px leading-8, rgba(255,255,255,0.62), VERBATIM:
  "지금 열린 최대 번호만 저장한다. 어떤 스테이지를 어떤 순서로 깼는지는 남지 않는다.
   선형 진행이라 문제가 없었을 뿐, 분기가 생기면 이 구조로는 부족하다."

=== BLOCK D: THE DESIGN REASON + META CALLBACK ===
Section label, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.46),
VERBATIM: "▸ 왜 다 열어두지 않았나"

Paragraph, 17px leading-9, margin-top 14px, VERBATIM:
  "처음엔 전부 열어두는 안도 있었다. 하고 싶은 데부터 하면 되니까.
   그런데 다 열어두면 플레이어가 아무 데나 가고, 아무 데나 가면 자기가 어디서
   막혔는지를 기억하지 못한다. 순서대로 열면 '다음 하나'가 항상 분명하다."
  Emphasize "'다음 하나'가 항상 분명하다" in #6ee7b7, font-bold.

THE META CALLBACK CARD, margin-top 28px, padding 22px, rounded-md,
border 1px rgba(52,211,153,0.28), background rgba(52,211,153,0.05), border-left 3px #34d399.
  Label font-mono 11px letter-spacing 0.2em color #34d399, VERBATIM: "↳ 지금도 그러고 있습니다"
  Body 16px leading-8 margin-top 10px, VERBATIM:
  "이 페이지 위쪽의 잠금 해제 표시도 같은 방식입니다. 내려온 만큼만 열리고,
   닫았다 다시 와도 열어둔 데까지는 남아 있습니다.
   지금 읽고 계신 방식이 이 게임의 진행 구조입니다."
  Do not weaken this into a joke - it is the section's payoff.

=== BLOCK E: [IMG-05] ===
A 16/9 image slot, margin-top 40px, full column width, rounded-md,
border 1px rgba(52,211,153,0.16), overflow hidden, with a caption bar below
(font-mono 11px, rgba(255,255,255,0.46), padding 10px 14px), VERBATIM:
  "실제 스테이지 선택 화면"
Same CSS placeholder rule (greybox rectangles on a grid, caption repeated at 12px,
ratio hint VERBATIM "16 : 9 · 이미지 자리"). NEVER an empty gray box.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label and heading fade up
0.25s  Paragraph reveals word by word (stagger 0.02s)
0.80s  THE ZOOM-IN: the header's mini board flies out and expands into the container
       (0.7s, overshoot). The header board dims to 0.25 opacity.
1.50s  The six slots settle; slot 01 lights up as UNLOCKED with a glow pulse
1.70s  The state diagram nodes fade in top to bottom 0.1s apart; the arrows draw
       themselves with stroke-dashoffset over 0.6s
2.40s  Code block fades up (y 16px -> 0)
2.90s  Caveat line fades in
3.10s  Design-reason paragraph reveals; the meta callback card slides in from the left
3.60s  [IMG-05] fades up

=== RESPONSIVE ===
< 900px: the board and the state diagram stack (board first); board slots 72x72px
in three rows of two.
< 768px: heading 22px; slots 64x64px; the state diagram nodes go full width;
code font-size 11px with internal horizontal scroll.
On touch, the zoom-in entrance still plays but is shortened to 0.45s.

=== ACCESSIBILITY ===
prefers-reduced-motion: no zoom-in (the board simply appears), no shake, no pop -
state changes are instant cross-fades. Arrows draw instantly.
Every slot must be a real <button> with an accessible name that includes its state in
Korean (VERBATIM "잠김" / "도전 가능" / "클리어") - never color or glyph alone.
Locked slots use aria-disabled but stay focusable so keyboard users get the same
"이전 스테이지를 먼저 깨야 합니다" feedback.
Announce state changes through a single polite status region that updates once per
transition (not per frame).
The reset button must be a real button and must also clear the stored value.
Code is selectable, copyable text - never an image.

=== DO NOT ===
Do not use a state-machine or diagram library - build it with divs and inline SVG.
Do not animate the arrows on a loop; they animate only on transitions.
Do not remove the caveat about only storing the highest index.
Do not let this board write to the same sessionStorage key the header uses - the toy
must not alter the page's real reading progress. Use a separate key.
```

---

## PAGE 06 — 트러블슈팅 02 · 같은 씬 파일을 여럿이 건드렸다

**개발 실체**: 팀 협업에서 실제로 겪은 Git/Unity 구조 문제 → **기술이 아니라 작업 규칙으로 해결**
**연출 장치**: **여러 커밋이 같은 `.unity` 파일로 수렴 → CONFLICT → 한 명의 작업이 사라진다**

```text
Build a TROUBLESHOOTING CASE FILE about Unity scene file merge conflicts in team
collaboration, with an animated diagram of commits converging on one file, for a Unity
3D platformer portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER (all eight stages, none may be dropped) ===
1. Symptom  2. Reproduction  3. Elimination of suspects  4. A failed attempt
5. Root cause  6. Before/After (a WORKING AGREEMENT, not only code)
7. Verification  8. Remaining limitations

=== CONCEPT ===
This is the only section in the entire portfolio about the cost of working with other
people. The bug is not in the game - it is in how a team shares one repository.
The centerpiece animation must make the failure legible in three seconds: several
people's commits all land on ONE file, and someone's work silently disappears.

=== MOOD ===
A case file, but heavier than the previous one. This is the section where the tone
gets serious. Still calm and evidence-first. Dark green-black, wireframe grid.
No blame, no drama - the problem is structural, not personal.

=== DESIGN TOKENS (use exactly) ===
background #04120d | primary #34d399 | secondary #059669 | accent #6ee7b7
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.46)
bad #f87171 | warn #fbbf24 | good #34d399
panel bg #061a12, border rgba(52,211,153,0.16)
syntax: comments #4b7c68, strings #d9a45b, keywords #34d399, numbers #b58cf0
grid overlay: 48px cells, 1px lines rgba(52,211,153,0.05)
fonts: headings font-black, body sans leading-8, code + labels font-mono,
       ALL numbers font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) overshoot, 0.25s-0.6s | rounded-md

=== LAYOUT ===
Single centered column, max-width 960px, padding-block 120px.
  Block A : case header (symptom + reproduction)
  Block B : THE CONVERGENCE ANIMATION (centerpiece), full width, ~440px tall
  Block C : elimination table
  Block D : failed attempt card
  Block E : root cause + the working agreement (Before/After)
  Block F : verification + remaining limitations
  Block G : [IMG-06]

=== CONTENT (Korean copy - VERBATIM, never translate) ===

CASE LABEL (font-mono 11px, letter-spacing 0.25em, color #fbbf24):
  "TROUBLE 02"

TITLE (26px font-black, margin-top 10px):
  "pull 했더니 팀원이 만든 게 사라져 있었다"

OPENING (17px leading-9, margin-top 20px), VERBATIM:
  "혼자 만들 때는 없던 문제였다. 각자 잘 만들고, 각자 잘 커밋했는데,
   합치고 나면 누군가의 오브젝트가 없어져 있었다.
   코드에는 아무 잘못이 없었다는 게 이 문제의 제일 이상한 점이었다."
  Emphasize "코드에는 아무 잘못이 없었다" in #fbbf24, font-bold.

CASE HEADER PANEL: full width, rounded-md, border 1px rgba(251,191,36,0.28),
background rgba(251,191,36,0.04), padding 22px.
  Top row: the case label on the left, a severity tag on the right, font-mono 10px,
  background rgba(248,113,113,0.14), color #f87171, padding 3px 10px, rounded,
  VERBATIM: "협업 · 작업 손실"
  Two labelled rows (label font-mono 10px uppercase rgba(255,255,255,0.35),
  body 15px leading-8):
    Label VERBATIM "증상"   body VERBATIM:
      "머지 후 씬을 열면 오브젝트 배치가 한 사람 것만 남아 있거나,
       씬 파일에 충돌 표시가 들어가 아예 열리지 않았다."
    Label VERBATIM "재현"   body VERBATIM:
      "두 사람이 같은 씬에 각자 오브젝트를 추가하고 각자 커밋한 뒤 머지한다.
       파일의 다른 줄을 고쳤어도 결과는 같았다."

=== BLOCK B: THE CONVERGENCE ANIMATION (centerpiece, the money shot) ===
Container: full width, height 440px, rounded-md, border 1px rgba(52,211,153,0.16),
background #061a12, overflow hidden, position relative.
Header strip (34px, border-bottom 1px rgba(52,211,153,0.14)):
  left  font-mono 11px rgba(255,255,255,0.46) VERBATIM: "▸ 커밋이 어디로 가는가"
  right a two-option toggle, font-mono 11px, VERBATIM: "분리 전" | "분리 후"
        Active "분리 전": background rgba(248,113,113,0.14), color #f87171
        Active "분리 후": background rgba(52,211,153,0.14), color #34d399
  Below the toggle, a replay button, font-mono 11px, VERBATIM: "↻ 다시 재생"

LAYOUT INSIDE: three columns of meaning, left to right.
  LEFT   : three contributor nodes stacked vertically, each a 96px-wide rounded-md box,
           border 1px rgba(255,255,255,0.14), padding 10px, font-mono 12px,
           labels VERBATIM "팀원 A", "팀원 B", "팀원 C".
           Under each label, a tiny work chip, font-mono 10px, VERBATIM in order:
             "발판 배치"   "적 배치"   "조명 설정"
           Each chip has a small colored square: A #6ee7b7, B #fbbf24, C #34d399.
  CENTER : the commit paths - SVG curves from each contributor to the right column.
  RIGHT  : the target file node(s).

"분리 전" SEQUENCE (auto-plays once when the container first enters the viewport):
  t=0.0s  One large file node appears on the right, 200x120px, rounded-md,
          border 1px rgba(255,255,255,0.20), background #04120d,
          font-mono 13px label VERBATIM: "Stage.unity"
          Under it, font-mono 10px rgba(255,255,255,0.46),
          VERBATIM: "씬 전체가 이 파일 하나에 들어 있다"
  t=0.4s  Three work chips detach from the contributors and travel along the SVG
          curves toward the file node, 0.25s apart, each 0.7s in flight.
          ALL THREE CURVES END AT THE SAME NODE. The convergence must be visually
          obvious - the three paths should bunch together as they arrive.
  t=1.8s  As the third chip lands, the file node border turns #f87171, its background
          shifts to rgba(248,113,113,0.06), and a badge pops in at its top-right,
          font-mono 11px, background rgba(248,113,113,0.18), color #f87171,
          padding 4px 10px, rounded, VERBATIM: "CONFLICT"
  t=2.3s  One of the landed chips (팀원 B, the #fbbf24 one) DESATURATES to
          rgba(255,255,255,0.18) and fades out over 0.6s, drifting down 12px.
          No sound, no shake. The quietness is the point.
  t=3.0s  A caption fades in under the diagram, font-mono 12px, color #f87171, VERBATIM:
          "자동 머지가 한쪽을 버렸다. 에러도, 경고도 없었다."

"분리 후" SEQUENCE (plays when the viewer switches the toggle):
  The right column now holds THREE separate nodes, each 168x84px, stacked with 12px gap,
  border 1px rgba(52,211,153,0.30), font-mono 12px, labels VERBATIM:
    "Stage01.unity"   "Stage02.unity"   "Props.prefab"
  The same three chips travel again, but each curve ends at a DIFFERENT node, and the
  curves no longer cross. Each node briefly pulses #34d399 on arrival.
  No CONFLICT badge. Nothing disappears.
  Caption, font-mono 12px, color #34d399, VERBATIM:
    "같은 파일을 동시에 만지지 않으면 충돌할 일이 없다."

Footer strip (border-top 1px, font-mono 11px, rgba(255,255,255,0.46), padding 8px 14px),
VERBATIM: "// 실제 커밋 그래프가 아니라 문제 구조를 보여주는 도식입니다"
  This disclaimer is REQUIRED.

PERFORMANCE: the animation must not loop. It auto-plays ONCE on first entry, then only
on toggle or the replay button. Pause and reset if the container leaves the viewport
mid-play, and never run while document.hidden.

=== BLOCK C: ELIMINATION TABLE ===
Section label, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.46),
VERBATIM: "▸ 의심한 것과 지운 것"

A real <table>, four rows. Columns: 의심 (38%) | 결과 (16%) | 근거 (46%).
Header cells font-mono 10px uppercase rgba(255,255,255,0.35).
Rows 1px bottom border rgba(255,255,255,0.07), padding-block 15px, font-mono 13px.
결과 chips: "아님" rgba(255,255,255,0.35) on rgba(255,255,255,0.06);
"원인" #f87171 on rgba(248,113,113,0.14).

  Row 1  의심 VERBATIM "Git 설정이 잘못됐다"
         결과 VERBATIM "아님"
         근거 VERBATIM "스크립트 파일들은 같은 저장소에서 정상적으로 머지됐다"
  Row 2  의심 VERBATIM "프리팹 때문이다"
         결과 VERBATIM "아님"
         근거 VERBATIM "프리팹만 수정한 커밋끼리는 충돌이 나지 않았다"
  Row 3  의심 VERBATIM "누가 강제로 덮어썼다"
         결과 VERBATIM "아님"
         근거 VERBATIM "히스토리를 확인해도 강제 푸시 흔적은 없었다"
  Row 4  의심 VERBATIM "씬 파일 하나에 씬 전체가 들어 있다"
         결과 VERBATIM "원인"
         근거 VERBATIM "같은 파일의 같은 영역이 동시에 바뀌면 한쪽이 조용히 버려졌다"

Row 4 gets a persistent left border 2px #f87171 and background rgba(248,113,113,0.05).

REVEAL ANIMATION: rows appear one at a time, 0.22s apart, sliding in from the left
(x -12px -> 0); the 결과 tag lands 0.18s behind its row with a scale pop.
Row 4's "원인" tag pops with a single red glow pulse. Never reveal all rows at once.

=== BLOCK D: THE FAILED ATTEMPT ===
A card, margin-top 40px, padding 22px, rounded-md,
border 1px rgba(251,191,36,0.28), background rgba(251,191,36,0.04).
  Label font-mono 11px letter-spacing 0.2em color #fbbf24, VERBATIM: "✗ 실패한 시도"
  Body 15px leading-8 margin-top 10px, VERBATIM:
  "충돌 난 씬 파일을 텍스트 편집기로 열어 직접 합쳐봤다. 눈으로 보면 합칠 수 있을 것
   같았다. 결과는 더 나빴다. 파일 안에서 오브젝트끼리 서로를 가리키는 식별자가 어긋나서,
   씬은 열리는데 스크립트 연결이 전부 비어 있었다.
   결국 한쪽 버전을 통째로 버리고 다시 만드는 편이 빨랐다."
  Emphasize "씬은 열리는데 스크립트 연결이 전부 비어 있었다" in #fbbf24, font-bold.

=== BLOCK E: ROOT CAUSE + THE WORKING AGREEMENT ===
Section label, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.46),
VERBATIM: "▸ 진짜 원인과 해결"

Cause paragraph, 17px leading-9, margin-top 14px, VERBATIM:
  "Git은 파일을 줄 단위로 합치는 도구다. 그런데 씬 파일은 줄 단위로 의미가 나뉘지 않는다.
   오브젝트 하나가 파일 여기저기에 흩어져 기록되고, 서로를 식별자로 가리킨다.
   그래서 이건 Git을 더 잘 쓰면 풀리는 문제가 아니었다."
  Emphasize "Git을 더 잘 쓰면 풀리는 문제가 아니었다" in #6ee7b7, font-bold.

Solution paragraph, 17px leading-9, margin-top 20px, VERBATIM:
  "그래서 도구가 아니라 작업 방식을 바꿨다.
   한 파일을 동시에 만지지 않도록 일을 나누는 것, 그게 해결책의 전부였다."

THE WORKING AGREEMENT (render as a numbered list of four cards, not a code block;
each card: padding 16px, rounded-md, border 1px rgba(52,211,153,0.24),
background rgba(52,211,153,0.04), with the number in font-mono 18px font-black #34d399
in a fixed 40px left column):
  1  title VERBATIM "스테이지마다 씬을 나눴다"
     body  VERBATIM "하나의 씬은 한 사람이 책임진다"
  2  title VERBATIM "공통 오브젝트는 프리팹으로 뺐다"
     body  VERBATIM "씬에는 배치만 남기고 내용은 프리팹에서 고친다"
  3  title VERBATIM "남의 씬은 열더라도 저장하지 않는다"
     body  VERBATIM "확인하려고 열었다가 저장 한 번이면 그대로 충돌이 된다"
  4  title VERBATIM "씬 파일은 자동 머지 대상에서 뺐다"
     body  VERBATIM "조용히 합쳐지는 것보다 충돌로 드러나는 편이 안전하다"
Card titles 15px font-black rgba(255,255,255,0.86); bodies 13px leading-7
rgba(255,255,255,0.62), margin-top 6px.

Then ONE small code block for item 4, standard styling (rounded-md, border 1px
rgba(52,211,153,0.16), background #061a12, three window dots, filename font-mono 11px,
caption bar prefixed "// "):
  filename VERBATIM: ".gitattributes"
  Content: roughly 3 lines marking Unity scene and prefab assets as not
  auto-mergeable, with a short comment line above them.
  caption VERBATIM: "자동으로 합쳐지지 않게 해서, 사람이 보고 정하게 만들었다"

=== BLOCK F: VERIFICATION + REMAINING LIMITATIONS ===
A verification bar, margin-top 40px, full width, rounded-md,
border 1px rgba(52,211,153,0.28), background rgba(52,211,153,0.04), padding 20px.
  Label font-mono 11px letter-spacing 0.2em color #34d399, VERBATIM: "✓ 검증"
  Body 15px leading-8 margin-top 10px, VERBATIM:
  "규칙을 정한 뒤로는 씬 충돌로 작업을 잃은 일이 다시 생기지 않았다.
   다만 이건 횟수를 세어 기록한 게 아니라 '다시 겪지 않았다'는 수준의 확인이다.
   숫자로 증명할 수 있는 종류의 해결이 아니었다."
  Emphasize "숫자로 증명할 수 있는 종류의 해결이 아니었다" in #34d399, font-bold.
  This honesty is REQUIRED. Do not replace it with an invented conflict count.

A remaining-limitation card below, margin-top 20px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 11px letter-spacing 0.2em rgba(255,255,255,0.48),
  VERBATIM: "아직 남은 것"
  Body as two bulleted items (4px dot in rgba(255,255,255,0.30)), 15px leading-8,
  VERBATIM:
    "메인 메뉴처럼 모두가 손대야 하는 공용 씬은 여전히 한 명만 만질 수 있었다.
     충돌은 없어졌지만 그 사람이 병목이 됐다."
    "Unity가 제공하는 씬 병합 도구를 설정해보려다 끝내 못 했다.
     규칙으로 피해간 것이지 도구로 푼 게 아니다."

=== BLOCK G: [IMG-06] ===
A 16/9 image slot, margin-top 40px, full column width, rounded-md,
border 1px rgba(52,211,153,0.16), overflow hidden, with a caption bar below
(font-mono 11px, rgba(255,255,255,0.46), padding 10px 14px), VERBATIM:
  "실제 충돌 화면 — 씬 파일이 머지되지 않은 상태"
Badge in its top-left corner, font-mono 10px, background rgba(52,211,153,0.16),
color #34d399, padding 3px 8px, rounded, VERBATIM: "실제 기록"
Same CSS placeholder rule (greybox rectangles on a grid, caption repeated at 12px,
ratio hint VERBATIM "16 : 9 · 이미지 자리"). NEVER an empty gray box.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Case label and title fade up
0.25s  Opening paragraph reveals word by word (stagger 0.02s)
0.90s  Case header panel fades up; the severity tag pops
1.30s  Convergence container fades up; the "분리 전" sequence auto-plays once
       (its own internal timeline runs 0.0s-3.0s from that point)
4.60s  Elimination table header appears; rows stagger in 0.22s apart
5.60s  Failed attempt card slides in from the left
6.00s  Cause and solution paragraphs reveal
6.60s  The four agreement cards pop in 0.10s apart (scale 0.95 -> 1.02 -> 1)
7.10s  .gitattributes code block fades up
7.50s  Verification bar fades in
7.80s  Remaining-limitation card fades in
8.10s  [IMG-06] fades up
If the viewer scrolls faster than this timeline, sections must render immediately on
entry rather than queueing - never make the viewer wait for an animation to catch up.

=== RESPONSIVE ===
< 900px: the convergence diagram switches to a vertical layout - contributors in a row
across the top, the file node(s) below, curves running downward. Height 480px.
< 768px: elimination table becomes stacked cards; agreement cards go full width with
the number above the title; code font-size 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: the convergence animation does not travel - render the END
STATE of the selected mode directly (converged + CONFLICT badge + the missing chip
already faded, or the separated state), with a text summary above it.
The elimination table must be a real <table> with proper headers.
The 분리 전/분리 후 toggle must be a real radio group with Korean text labels.
Provide a visually hidden description of what the animation shows, so the argument is
available without seeing it.
All code is selectable, copyable text - never an image.

=== DO NOT ===
Do not name or identify real teammates - use VERBATIM "팀원 A/B/C" only.
Do not lock scroll or take control away anywhere in this section.
Do not remove the failed attempt, the "숫자로 증명할 수 없다" line, or the remaining
limitations.
Do not invent a conflict count, a lost-hours figure, or a team size.
Do not turn the disappearing work into a joke or an explosion - it fades quietly.
```

> ⚠️ **[IMG-06] 캡처 전 필수 확인**: Git 로그·충돌 화면에는 **팀원 실명·이메일·저장소 경로**가
> 그대로 찍힙니다. 캡처 후 반드시 마스킹하거나, 로컬에서 익명 계정으로 재현한 화면을 쓰세요.

---

## PAGE 07 — 핵심 구현 #3 · 이어하기

**개발 실체**: 진행 저장 직렬화 구현 + **구버전 세이브 대응** + 실패 시 안전 폴백
**연출 장치**: 세이브 JSON이 **눈앞에서 실시간으로 다시 써진다** → 구버전 파일을 직접 넣어본다

```text
Build a SECTION about save/continue implementation, with a live save-file viewer that
rewrites itself as the viewer plays, and a loader that must survive an old or broken
file, for a Unity 3D platformer portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What is actually stored, in concrete field terms
2. When it is written (and why not every frame)
3. What happens when the file is from an older version, or is broken
4. The real C# for reading and writing it
5. What this implementation still does not protect against

=== MOOD ===
An engineer showing you the inside of a save file. Practical, transparent, snappy.
Dark green-black, wireframe grid, modern game UI.

=== DESIGN TOKENS (use exactly) ===
background #04120d | primary #34d399 | secondary #059669 | accent #6ee7b7
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.46)
bad #f87171 | warn #fbbf24
panel bg #061a12, border rgba(52,211,153,0.16)
syntax: comments #4b7c68, strings #d9a45b, keywords #34d399, numbers #b58cf0
JSON colors: keys #6ee7b7, strings #d9a45b, numbers #b58cf0, punctuation rgba(255,255,255,0.46)
grid overlay: 48px cells, 1px lines rgba(52,211,153,0.05)
fonts: headings font-black, body sans leading-8, code + labels font-mono,
       ALL numbers font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) overshoot, 0.25s-0.6s | rounded-md

=== LAYOUT ===
Single centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : two-column split - live save viewer (54%) | code panel (46%), 420px tall
  Block C : THE LOAD TEST (centerpiece of the substance), full width
  Block D : limitation card
  Block E : [IMG-07]

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "STAGE 07 · 이어하기"

HEADING (28px font-black):
  "저장은 쓰는 것보다 읽는 게 어렵다"

PARAGRAPH 1 (17px, leading-9, margin-top 20px), VERBATIM:
  "저장할 값은 많지 않았다. 어디까지 열렸는지, 어떤 스테이지를 깼는지,
   어떤 아이템을 찾았는지. 이걸 파일 하나로 쓰는 데는 오래 걸리지 않았다."

PARAGRAPH 2 (17px, leading-9, margin-top 24px), VERBATIM:
  "문제는 그 다음이었다. 개발 중에 필드를 하나 추가하는 순간,
   어제 만든 세이브 파일은 오늘 코드가 기대하는 모양이 아니게 된다.
   내 컴퓨터에 있던 예전 파일 때문에 이어하기가 깨진 걸 몇 번 겪고 나서야
   불러오는 쪽을 다시 짰다."
  Emphasize "불러오는 쪽을 다시 짰다" in #6ee7b7, font-bold.

=== BLOCK B LEFT: LIVE SAVE FILE VIEWER ===
Container: height 420px, rounded-md, border 1px rgba(52,211,153,0.16),
background #061a12, overflow hidden.
Header strip (34px, border-bottom 1px rgba(52,211,153,0.14)):
  left  font-mono 11px rgba(255,255,255,0.46) VERBATIM: "▸ save.json"
  right a write indicator, font-mono 10px, VERBATIM: "○ 대기"
        It flips to VERBATIM "● 기록됨" in #34d399 for 0.8s on each write, then back.

Body: a syntax-colored JSON document, font-mono 12px, leading-relaxed, with a
line-number gutter (rgba(255,255,255,0.20), min-width 20px, right-aligned,
user-select none). Fields, in this order and with these VERBATIM key names:
  a save format version number, the highest unlocked stage index, an array of cleared
  stage numbers, an array of found item ids, and a last-saved timestamp string.

An ACTION BAR at the bottom of the container (border-top 1px rgba(52,211,153,0.14),
padding 10px 12px): three buttons, font-mono 11px, border 1px rgba(52,211,153,0.30),
rounded, padding 6px 12px, VERBATIM:
  "스테이지 클리어"    "아이템 획득"    "게임 종료"
BEHAVIOR:
  "스테이지 클리어" -> the unlocked index increments and a number is appended to the
     cleared array. The CHANGED LINES ONLY get a rgba(52,211,153,0.14) row highlight
     for 0.5s and the changed value counts up. The write indicator flips.
  "아이템 획득"     -> a new id is appended to the item array; the array visibly grows,
     pushing later lines down with a 0.3s layout transition.
  "게임 종료"       -> the timestamp updates, the write indicator flips, and a
     font-mono 11px line appears under the action bar in rgba(255,255,255,0.46) for
     1.5s, VERBATIM: "종료 시점에 한 번 더 씁니다"
IMPORTANT: writes happen on these discrete events only. Add a small note in the header
strip area, font-mono 10px, rgba(255,255,255,0.35), VERBATIM:
  "매 프레임이 아니라 클리어·획득·종료 시점에만 씁니다"
Do not animate a continuous write - the point is that saving is event-driven.

=== BLOCK B RIGHT: CODE PANEL ===
Same height (420px), standard styling (rounded-md, border 1px rgba(52,211,153,0.16),
background #061a12, three window dots, filename font-mono 11px rgba(255,255,255,0.46),
line-number gutter, highlighted rows rgba(52,211,153,0.10), caption bar prefixed "// ").
  filename VERBATIM: "SaveSystem.cs"
  C#, roughly 22 lines. Show: a serializable progress class holding the same fields as
  the JSON, a write method that serializes it to a file under the platform's persistent
  data path, and a read method that returns a fresh default when no file exists,
  wraps the parse in a failure guard, and fills in missing fields when the stored
  format version is older than the current one.
  HIGHLIGHT: the failure guard around parsing, and the version-migration branch.
  caption VERBATIM: "읽기 쪽에 방어 코드가 몰려 있는 게 정상이다"

The two panels are linked: pressing an action button on the LEFT briefly highlights
the corresponding write line on the RIGHT with the same 0.5s row highlight.

=== BLOCK C: THE LOAD TEST (this is the section's real substance) ===
Section label, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.46),
VERBATIM: "▸ 이상한 파일을 넣어보기"

Container: full width, rounded-md, border 1px rgba(52,211,153,0.16),
background #061a12, padding 22px.
A file selector at the top: three radio-style options in a row, font-mono 12px,
each a card with padding 12px 16px, rounded-md, border 1px, VERBATIM:
  "현재 버전 파일"      (border rgba(52,211,153,0.30))
  "구버전 파일"         (border rgba(251,191,36,0.30))
  "손상된 파일"         (border rgba(248,113,113,0.30))
Below the selector, a small preview of the chosen file's raw content, font-mono 11px,
max 5 lines, rgba(255,255,255,0.62), in a box with background #04120d.
  현재 버전 -> a complete, well-formed document
  구버전    -> a document with an older version number and TWO fields missing
  손상된    -> a document cut off mid-line, obviously unparseable

A button below, font-mono 12px, background #34d399, color #04120d, font-black,
padding 10px 20px, rounded-md, VERBATIM: "불러오기 실행"

RESULT PANEL (appears under the button, animating in over 0.4s), showing a load log:
three to four lines, font-mono 12px, appearing 0.25s apart, each prefixed with a
status glyph.
  현재 버전 파일 -> VERBATIM lines, all in #34d399:
    "✓ 파일을 찾았습니다"
    "✓ 버전 일치 — 변환 없음"
    "✓ 스테이지 진행을 복원했습니다"
  구버전 파일 -> lines, first two in #fbbf24, last in #34d399, VERBATIM:
    "△ 저장 형식이 예전 버전입니다"
    "△ 없는 항목을 기본값으로 채웠습니다"
    "✓ 이어하기가 정상적으로 열렸습니다"
    Below the log, a note, 14px leading-8, rgba(255,255,255,0.72), VERBATIM:
      "예전에는 이 상황에서 그대로 예외가 났다. 필드가 없으면 읽다가 멈췄기 때문이다."
  손상된 파일 -> lines, first two in #f87171, last in #fbbf24, VERBATIM:
    "✗ 파일을 해석할 수 없습니다"
    "✗ 진행 상황을 복원하지 못했습니다"
    "△ 새 게임으로 시작합니다 — 기존 파일은 지우지 않았습니다"
    Below the log, a note, 14px leading-8, rgba(255,255,255,0.72), VERBATIM:
      "읽기에 실패했다고 기존 파일을 지우면 안 된다. 복구할 수 있는 유일한 단서다."
    Emphasize "기존 파일은 지우지 않았습니다" in #fbbf24, font-bold.

Footer strip of the container (border-top 1px rgba(52,211,153,0.14), font-mono 11px,
rgba(255,255,255,0.46), padding 8px 12px), VERBATIM:
  "// 실제 저장 파일이 아니라 불러오기 분기를 보여주는 재현입니다"
  This disclaimer is REQUIRED.

=== BLOCK D: LIMITATION CARD (do not remove) ===
Margin-top 40px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 11px letter-spacing 0.2em rgba(255,255,255,0.48),
  VERBATIM: "아직 못 막는 것"
  Body as two bulleted items (4px dot in rgba(255,255,255,0.30)), 15px leading-8,
  VERBATIM:
    "저장하는 도중에 게임이 강제로 종료되면 파일이 반쯤 쓰인 상태로 남을 수 있다.
     임시 파일에 먼저 쓰고 바꿔치우는 방식은 넣지 못했다."
    "평문이라 값을 손으로 고치면 그대로 반영된다.
     싱글 플레이 프로토타입이라 감수한 선택이고, 앞에서 이미 적어둔 대로다."

=== BLOCK E: [IMG-07] ===
A 4/3 image slot, margin-top 40px, max-width 640px, centered, rounded-md,
border 1px rgba(52,211,153,0.16), overflow hidden, with a caption bar below
(font-mono 11px, rgba(255,255,255,0.46), padding 10px 14px), VERBATIM:
  "실제 저장 파일 — 텍스트 편집기로 연 모습"
Same CSS placeholder rule, ratio hint VERBATIM "4 : 3 · 이미지 자리".
NEVER an empty gray box.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label and heading fade up
0.25s  Paragraphs reveal word by word (stagger 0.02s)
1.00s  Save viewer and code panel fade up together (y 18px -> 0, 0.45s)
1.40s  The JSON lines type in from top to bottom, 0.05s apart (a settling effect, not
       a typewriter on every character - reveal whole lines)
2.10s  The action bar buttons pop in 0.07s apart
2.50s  Load-test container fades up; the three file options pop in 0.08s apart
3.10s  Limitation card fades in
3.40s  [IMG-07] fades up

=== RESPONSIVE ===
< 1024px: the save viewer and code panel stack (viewer first), each height auto with
max-height 420px and internal vertical scroll.
< 768px: the three file options stack vertically; JSON and code font-size 11px with
internal horizontal scroll (the block scrolls, never the page); action bar buttons wrap.

=== ACCESSIBILITY ===
prefers-reduced-motion: no line-by-line typing, no row highlight sweeps, no layout
transitions - content appears in final form. The load test still works.
The three file options must be a real radio group with Korean text labels; do not rely
on border color alone.
The load log must not use aria-live per line; announce the final outcome once through a
single polite status region after the log finishes.
The write indicator must carry text ("대기" / "기록됨"), never color alone.
All JSON and code is selectable, copyable text - never an image.

=== DO NOT ===
Do not present the viewer as a real file system; the disclaimer stays.
Do not invent file sizes, save durations, or corruption rates.
Do not remove the "아직 못 막는 것" card.
Do not make a failed load delete or overwrite the existing file, even in the demo -
that behavior is the point of the third case.
```

---

## PAGE 08 — 구조 · 씬을 어떻게 나눴고, 내가 어디를 맡았나

**개발 실체**: 프로젝트 구조 + **내가 한 것 / 팀원이 한 것 / 아무도 못 한 것**
**연출 장치**: 단일 씬 덩어리가 **담당자 색으로 갈라지며** 재조립된다

```text
Build an ARCHITECTURE AND SCOPE section where a single scene blob splits apart into
owner-colored pieces, for a Unity 3D platformer portfolio page made by a team.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. How the project was actually structured (scenes, prefabs, systems)
2. Which parts this developer personally built
3. Which parts teammates built - stated plainly, not blurred
4. What nobody got to - stated plainly

=== MOOD ===
A calm structural retrospective. No horror, no drama. Confident and specific.
Dark green-black, wireframe grid. Clarity is the priority.

=== DESIGN TOKENS (use exactly) ===
background #04120d | primary #34d399 | secondary #059669 | accent #6ee7b7
text rgba(255,255,255,0.86) | muted rgba(255,255,255,0.46)
mine #34d399 | teammate #6ee7b7 | nobody rgba(255,255,255,0.35) | warn #fbbf24
panel bg #061a12, border rgba(52,211,153,0.16)
grid overlay: 48px cells, 1px lines rgba(52,211,153,0.05)
fonts: headings font-black, body sans leading-8, diagram labels + code font-mono,
       ALL numbers font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) overshoot, 0.25s-0.6s | rounded-md

=== LAYOUT ===
Single centered column, max-width 960px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the splitting structure diagram (centerpiece), 420px tall
  Block C : the three-column scope table
  Block D : the unverified-facts note
  Block E : [IMG-08]

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "STAGE 08 · 구조와 역할"

HEADING (28px font-black):
  "한 덩어리였던 씬을 쪼갠 게 구조의 전부다"

PARAGRAPH (17px, leading-9, margin-top 20px, max-width 760px), VERBATIM:
  "거창한 아키텍처는 없었다. 앞에서 본 충돌 문제를 겪고 나서 씬을 나누고,
   반복되는 것을 프리팹으로 빼고, 시스템 스크립트를 씬 밖으로 꺼낸 것이 전부다.
   그런데 그것만으로 팀이 동시에 일할 수 있게 됐다."
  Emphasize "그것만으로 팀이 동시에 일할 수 있게 됐다" in #6ee7b7, font-bold.

=== BLOCK B: THE SPLITTING STRUCTURE DIAGRAM (centerpiece) ===
Container: full width, height 420px, rounded-md, border 1px rgba(52,211,153,0.16),
background #061a12, padding 26px.
Header strip: font-mono 11px rgba(255,255,255,0.46), letter-spacing 0.2em,
VERBATIM: "▸ PROJECT STRUCTURE"
Right side: a toggle, font-mono 11px, options VERBATIM "합쳐져 있을 때" | "나눈 뒤".
Active "합쳐져 있을 때" uses rgba(255,255,255,0.35); active "나눈 뒤" uses #34d399.

"합쳐져 있을 때" STATE:
  One large box, 240px wide, centered, border 1px rgba(255,255,255,0.20),
  background rgba(255,255,255,0.03), labeled VERBATIM "Main.unity".
  Inside, a vertical stack of 7 items, font-mono 12px, VERBATIM:
    "플레이어"  "스테이지 1"  "스테이지 2"  "UI"  "저장 시스템"  "조명"  "... 계속 늘어남"
  The last item is rgba(255,255,255,0.35) and italic.
  Caption under the diagram, font-mono 11px, rgba(255,255,255,0.46), VERBATIM:
    "한 파일 안에 전부 들어 있으니 두 사람이 동시에 열 수 없다"

"나눈 뒤" STATE:
  The items regroup into FOUR labeled containers laid out in a 2x2 grid, each 1px
  border, rounded-md, padding 14px, with a small font-mono 10px type tag at the top:
    Container 1  tag VERBATIM "SCENE"   title VERBATIM "Stage01 / Stage02 …"
                 items VERBATIM "스테이지별로 하나씩 · 담당자 1명"
    Container 2  tag VERBATIM "PREFAB"  title VERBATIM "Player / Item / Platform"
                 items VERBATIM "씬에는 배치만, 내용은 여기서 수정"
    Container 3  tag VERBATIM "SYSTEM"  title VERBATIM "StageManager / SaveSystem"
                 items VERBATIM "씬에 속하지 않는 로직"
    Container 4  tag VERBATIM "UI"      title VERBATIM "StageSelect / HUD"
                 items VERBATIM "별도 씬으로 분리"
  OWNER COLORING: give each container a 3px top border in its owner color -
    #34d399 for parts this developer owned (SYSTEM, and the stage-select UI),
    #6ee7b7 for parts teammates owned (level scenes, art-side prefabs).
  A small legend at the bottom-right of the diagram, font-mono 10px, VERBATIM:
    "■ 내가 맡은 것"  (color #34d399)   "■ 팀원이 맡은 것"  (color #6ee7b7)
  Caption, font-mono 11px, color #34d399, VERBATIM:
    "파일이 나뉘니 담당도 나뉘었다"

TRANSITION ANIMATION (this is the visual payoff):
  합쳐져 있을 때 -> 나눈 뒤:
    1. The 7 items detach from the big box and fly outward to their new containers
       (0.6s, staggered 0.07s, overshoot easing), each picking up its owner color
       as it lands
    2. The big box shrinks and fades out (0.4s)
    3. The four containers scale in from 0.92 with their top borders drawing left to
       right (0.5s)
    4. Captions cross-fade
  Toggling back reverses it.
  AUTO-PLAY: the first time the diagram enters the viewport it starts in
  "합쳐져 있을 때", waits 1.4s, then transitions once automatically. Manual after that.

=== BLOCK C: THE THREE-COLUMN SCOPE TABLE ===
Section label, font-mono 11px letter-spacing 0.25em rgba(255,255,255,0.46),
VERBATIM: "▸ 누가 무엇을 했나"

Three columns, gap 18px (single column below 768px). Each: rounded-md, padding 20px,
border 1px rgba(255,255,255,0.12), background #061a12, and a 2px top border in the
column's color.
Column header: font-mono 11px, letter-spacing 0.2em, margin-bottom 14px.
Items: 14px leading-7 rgba(255,255,255,0.72), each prefixed with a 4px dot in the
column color, 10px gap between items.

COLUMN 1 - header VERBATIM "내가 만든 것", color #34d399. Items VERBATIM:
  "이동 · 2단 점프 컨트롤러 (4방향 접지 판정)"
  "스테이지 선택 · 잠금 해제 시스템"
  "진행 상황 저장과 이어하기"
  "씬 분리 작업 규칙 정리"

COLUMN 2 - header VERBATIM "팀원이 만든 것", color #6ee7b7. Items VERBATIM:
  "스테이지 레벨 디자인과 배치"
  "모델 · 텍스처 등 아트 리소스"
  "사운드 적용"
  "[확인필요] 그 외 담당 범위"

COLUMN 3 - header VERBATIM "아무도 못 한 것", color rgba(255,255,255,0.35).
Items VERBATIM:
  "보스 패턴 · 후반 스테이지"
  "외부 플레이 테스트"
  "성능 프로파일링"
  "빌드 자동화"

Column 2's "[확인필요]" item renders in #fbbf24. Do NOT invent teammate contributions
to fill the column - leaving the marker visible is the honest option, and it is a
reminder to confirm before shipping.

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), top border
grows 2px -> 3px.

=== BLOCK D: THE UNVERIFIED-FACTS NOTE ===
Margin-top 32px, padding 18px, rounded-md, border 1px rgba(251,191,36,0.28),
background rgba(251,191,36,0.04).
  Label font-mono 11px letter-spacing 0.2em color #fbbf24, VERBATIM: "확인 필요"
  Body 14px leading-8 margin-top 8px, VERBATIM:
  "팀 인원수와 개발 기간은 아직 확인 중이라 이 페이지에 숫자로 적지 않았습니다.
   확인되기 전까지는 비워두는 편이 낫다고 봤습니다."
  This card exists because the underlying project data is marked unverified.
  Do not replace the missing numbers with plausible-looking guesses.

=== BLOCK E: [IMG-08] ===
A 4/3 image slot, margin-top 40px, max-width 680px, centered, rounded-md,
border 1px rgba(52,211,153,0.16), overflow hidden, with a caption bar below
(font-mono 11px, rgba(255,255,255,0.46), padding 10px 14px), VERBATIM:
  "Unity 프로젝트 — 씬과 프리팹 폴더 구조"
Badge in its top-left corner, font-mono 10px, background rgba(52,211,153,0.16),
color #34d399, padding 3px 8px, rounded, VERBATIM: "에디터 원본"
Same CSS placeholder rule, ratio hint VERBATIM "4 : 3 · 이미지 자리".
NEVER an empty gray box.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label fades in
0.15s  Heading reveals word by word (stagger 0.03s)
0.60s  Paragraph reveals
1.10s  Diagram container fades up; "합쳐져 있을 때" renders; the big box scales in
+1.40s Auto-transition to "나눈 뒤" plays once
2.90s  Scope columns fade up left to right, 0.12s apart, each lifting 16px; within each
       column items appear 0.06s apart
3.60s  Unverified-facts note slides in from the left
3.90s  [IMG-08] fades up

=== RESPONSIVE ===
< 768px: diagram height 520px, the four containers stack in a single column;
the toggle moves below the header strip; scope columns become a single column;
the legend moves under the diagram.

=== ACCESSIBILITY ===
prefers-reduced-motion: no flying items, no auto-play - the toggle produces instant
cross-fades.
The toggle must be a real radio group with Korean text labels.
Owner colors must never be the only signal - each container's owner is also stated in
its text, and the legend is real text.
Do not use an external diagram library - build it with divs and inline SVG.

=== DO NOT ===
Do not name real teammates. Do not inflate column 1 by moving teammates' work into it.
Do not delete column 3 - "아무도 못 한 것" is the column an interviewer trusts.
Do not fill in team size or duration with invented numbers; the 확인 필요 card stays
until the real values are confirmed.
```

---

## PAGE 09 — 결과 · 전 스테이지 잠금 해제

**개발 실체**: 완성된 화면 · **풀 데모 영상** · 확정 가능한 사실만
**연출 장치**: 헤더 보드의 **11칸이 차례로 전부 열리며** 갤러리가 공개된다

```text
Build a RESULTS GALLERY section for a Unity 3D platformer portfolio page, opening at
the exact moment every stage on the page's progress board unlocks.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The finished screens, including one Unity editor screenshot as proof of real work
2. The full gameplay demo video
3. Only countable, verifiable facts - no invented metrics

=== MOOD ===
Completion. The board is full, the work is done. Confident, clean, presentational.
The background lifts slightly and the grid recedes - the greybox is finished.
Still a dark theme.

=== DESIGN TOKENS (use exactly) ===
background: transitions from #04120d to #071a13 on this section
primary #34d399 | secondary #059669 | accent #6ee7b7
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.50)
panel bg #0a2018, border rgba(52,211,153,0.20)
grid overlay: 48px cells, lines fade from rgba(52,211,153,0.05) to rgba(52,211,153,0.02)
fonts: headings font-black, body sans leading-8, labels/captions font-mono
       with font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) overshoot, 0.25s-0.6s | rounded-md

=== THE ALL-CLEAR MOMENT (open the section with it) ===
As this section enters the viewport:
  1. The header's mini stage board fills in: remaining locked cells flip to unlocked
     one at a time, 0.07s apart, each with a 0.25s scale pop (0.6 -> 1.15 -> 1)
  2. The header readout counts up to VERBATIM "▮ 잠금 해제 11 / 11" and changes color
     from #34d399 to #6ee7b7
  3. The page background lifts #04120d -> #071a13 over 0.8s and the grid lines fade
  4. 0.4s after the board fills, one line fades in, centered, 20px, font-medium,
     color #6ee7b7, VERBATIM:
       "전부 열렸습니다. 여기부터는 결과입니다."
     It stays in the page permanently.
No confetti, no fanfare, no full-screen flash. One quiet ascending chime is allowed
(volume cap 0.15), gated by the sound toggle.

=== LAYOUT ===
Single centered column, max-width 1040px (the widest section on the page).
  Block A : all-clear line + section label
  Block B : full demo video panel, full width, 16/9
  Block C : image gallery, 2-column grid (1 column below 768px), gap 20px
  Block D : facts row, 3 cells
  Block E : the no-metrics disclaimer

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.50),
               margin-top 44px):
  "STAGE 09 · 결과"

=== BLOCK B: FULL DEMO VIDEO ===
A full-width panel, aspect-ratio 16/9, rounded-md,
border 1px rgba(52,211,153,0.28), background #0a2018, overflow hidden.
Above it a label, font-mono 11px, letter-spacing 0.2em, color #6ee7b7, VERBATIM:
  "▶ 플레이 영상 · 전체"
[VIDEO-01] full gameplay footage: movement and a double jump, one hidden item found,
one stage cleared, and the stage select screen unlocking the next stage.
If no video source is supplied, render a CSS placeholder inside: a greybox platform
scene built from stacked rectangles (#0a2418 to #10352a) on a receding grid, with a
small #34d399 player square resting on the lowest platform, a centered play button
(56px circle, #34d399, with a pulsing ring every 1.8s), and text below it, font-mono
12px, rgba(255,255,255,0.50), VERBATIM: "게임플레이 영상 자리 · 16:9"
NEVER render an empty gray box.
Caption bar below the video (border-top 1px rgba(52,211,153,0.16), font-mono 11px,
rgba(255,255,255,0.50), padding 10px 14px), VERBATIM:
  "이동 → 2단 점프 → 아이템 획득 → 클리어 → 다음 스테이지 잠금 해제까지 한 번에"

=== BLOCK C: IMAGE GALLERY ===
Four slots in a 2x2 grid. Each: aspect-ratio 16/9, rounded-md,
border 1px rgba(52,211,153,0.20), overflow hidden, background #0a2018,
with a caption bar below (font-mono 11px, rgba(255,255,255,0.50), padding 10px 14px,
border-top 1px rgba(52,211,153,0.16)).

  [IMG-09] caption VERBATIM: "플레이 화면 — 발판 구간"
  [IMG-10] caption VERBATIM: "클리어 직후 스테이지 잠금 해제"
  [IMG-11] caption VERBATIM: "유저 피드백을 반영한 화면"
  [IMG-12] caption VERBATIM: "Unity 에디터 — 씬 계층과 프리팹"

[IMG-12] is the most important: give it a 1px #34d399 border at 40% opacity and a
badge in its top-left corner, font-mono 10px, background rgba(52,211,153,0.16),
color #34d399, padding 3px 8px, rounded, VERBATIM: "에디터 원본"

PLACEHOLDER BEHAVIOR (required): if an image source is missing, render a CSS
placeholder - a greybox scene of stacked rectangles on a grid, the caption text
repeated at 12px rgba(255,255,255,0.35), and a ratio hint, VERBATIM format:
"16 : 9 · 이미지 자리". NEVER an empty gray box.

GALLERY INTERACTIONS:
- Hover: image scales to 1.04 (0.4s), border brightens to rgba(52,211,153,0.40),
  card lifts 4px with box-shadow 0 14px 36px rgba(0,0,0,0.5), and a label fades in at
  the image's top-right, font-mono 10px, background rgba(0,0,0,0.55), color #6ee7b7,
  VERBATIM: "⤢ 확대"
- Click opens a lightbox: overlay rgba(2,10,7,0.92) with backdrop-blur(4px), image
  contained at max-width 1100px, entering scale 0.92 -> 1 with a spring
  (stiffness 300, damping 24). Caption bar at the bottom shows the caption on the left
  and on the right, font-mono 12px rgba(255,255,255,0.40),
  VERBATIM: "ESC · 클릭으로 닫기"
  Esc or overlay click closes. Left/Right arrows move between the four images.

=== BLOCK D: FACTS ROW ===
Three cells in a row (1 column below 640px), gap 16px. Each: rounded-md,
border 1px rgba(52,211,153,0.20), padding 20px, background #0a2018.
  Value 30px font-mono font-black color #6ee7b7, tabular-nums (non-numeric values
        just fade in; numeric ones count up over 0.8s when scrolled into view).
  Label 12px rgba(255,255,255,0.50), margin-top 8px, leading-5.

  Cell 1  value VERBATIM "5인"         label VERBATIM "팀 프로젝트 · 2023.11–2024.02"
  Cell 2  value VERBATIM "이어하기"     label VERBATIM "진행 저장 · 잠금 해제 완성"
  Cell 3  value VERBATIM "프로토타입"   label VERBATIM "완성도 — 후반 스테이지 미완"

All three cells are intentionally non-numeric. Style them identically - do not
visually apologize for cell 3, and do not replace any of them with invented numbers.

=== BLOCK E: THE NO-METRICS DISCLAIMER ===
Below the facts row, one line, font-mono 12px, rgba(255,255,255,0.50), VERBATIM:
  "// 다운로드 수·플레이어 수·플레이 시간 같은 지표는 없습니다. 배포하지 않은 프로토타입입니다."
This line is REQUIRED and must not be softened or removed.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  All-clear sequence begins: header board cells flip 0.07s apart
0.80s  Background lift and grid fade complete
1.20s  The "전부 열렸습니다" line fades in (0.5s)
1.70s  Section label fades in
1.90s  Video panel fades up (y 18px -> 0, 0.5s)
2.50s  Gallery slots fade up one at a time, 0.10s apart, each lifting 16px
3.20s  Facts cells fade in left to right, 0.09s apart
3.60s  Disclaimer line fades in

=== RESPONSIVE ===
< 768px: gallery becomes 1 column; facts cells stack; lightbox image max-width 94vw.
The header board's cells shrink but must remain visible - the all-clear moment is the
section's opening beat on every device.

=== ACCESSIBILITY ===
prefers-reduced-motion: no cell-flip stagger (the board is simply full), no count-up,
no background lift animation, no hover scale. The lightbox still functions.
Every image needs descriptive alt text derived from its caption.
The lightbox must trap focus and restore focus to its trigger on close.
The video player must have real controls and must not autoplay with sound.
The all-clear line must be plain text in the DOM, not injected only via animation.

=== DO NOT ===
Do not render empty gray boxes for missing media - always use the CSS placeholder.
Do not add invented metrics such as player counts, downloads, ratings, or playtime.
Do not add confetti, fireworks, or a full-screen flash for the all-clear moment.
The team facts are CONFIRMED (5 people, 2023.11-2024.02, released on Steam) - do not
reintroduce a [확인필요] marker on the team cell.
```

> ⚠️ **[IMG-11] 캡처 전 확인**: 유저 피드백 화면에 **실명·학번·연락처**가 찍혀 있지 않은지
> 반드시 확인하고 마스킹하세요.

---

## PAGE 10 — 회고 · 다음 단계 · 퇴장

**개발 실체**: KPT 회고 (PROBLEM 3개 필수) · 다음 단계 · GitHub
**연출 장치**: 퇴장 시 **세이브 파일이 기록되고 `SAVED`** → 암전

```text
Build a CLOSING RETROSPECTIVE section plus an exit transition for a Unity 3D platformer
portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An honest retrospective including things that went wrong
2. Concrete next steps
3. The GitHub repository link, with its access caveat repeated
4. A clean exit back to a 3D village scene

=== MOOD ===
Calm, plain-spoken, satisfied but not self-congratulatory. The developer talking after
the work is done. The exit is a save-and-quit, because saving is what this project was
about.

=== DESIGN TOKENS (use exactly) ===
background #071a13 | primary #34d399 | secondary #059669 | accent #6ee7b7
keep #34d399 | problem #f87171 | try #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.50)
panel bg #0a2018, border rgba(52,211,153,0.20)
fonts: headings font-black, body sans leading-8, labels font-mono
       with font-variant-numeric: tabular-nums
easing cubic-bezier(0.34,1.56,0.64,1) overshoot, 0.25s-0.6s | rounded-md

=== LAYOUT ===
Single centered column, max-width 920px, padding-block 112px.
  Block A : label + heading + intro paragraph
  Block B : KPT retrospective, 3 columns (1 below 768px)
  Block C : next steps card
  Block D : GitHub link
  Block E : exit button (full width, tall)

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.50)):
  "STAGE 10 · 회고"

HEADING (30px font-black):
  "조작감은 세 줄에서 갈렸고, 협업은 규칙에서 갈렸다"

INTRO PARAGRAPH (17px leading-9, margin-top 20px, max-width 780px), VERBATIM:
  "이 프로젝트에서 제일 오래 붙잡은 두 가지는 둘 다 크지 않았다.
   하나는 접지 판정에 타이머를 하나 두는 일이었고,
   하나는 같은 파일을 동시에 만지지 말자고 정하는 일이었다.
   어려운 문제일수록 해결책이 커야 한다는 생각을 이때 버렸다."
  Emphasize "해결책이 커야 한다는 생각을 이때 버렸다" in #6ee7b7, font-bold.

=== BLOCK B: KPT RETROSPECTIVE ===
Three columns, gap 20px. Each: rounded-md, padding 22px,
border 1px rgba(255,255,255,0.12), background #0a2018, and a 2px top border in the
column's color.
Column header: font-mono 11px, letter-spacing 0.2em, uppercase, margin-bottom 14px.
Items: 14px leading-7 rgba(255,255,255,0.74), each prefixed with a 4px dot in the
column color, 10px gap between items.

COLUMN 1 - header VERBATIM "KEEP", color #34d399. Items VERBATIM:
  "판정 시점과 체감 시점이 다르다는 걸 이해하고 고친 것"
  "충돌을 도구로 못 풀자 작업 규칙으로 바꾼 것"
  "불러오기 쪽에 방어 코드를 몰아둔 것"

COLUMN 2 - header VERBATIM "PROBLEM", color #f87171. Items VERBATIM:
  "접지 레이의 간격(0.25)과 길이를 눈으로 맞췄다 — 캐릭터 크기가 바뀌면 다시 잡아야 한다"
  "스테이지 분량과 밸런싱을 끝내지 못했다"
  "성능을 한 번도 재보지 않았다 — 문제가 없었던 게 아니라 안 봤다"

COLUMN 3 - header VERBATIM "TRY", color #fbbf24. Items VERBATIM:
  "점프 버퍼까지 넣어 입력 관용도 마무리하기"
  "보스 패턴과 후반 스테이지 설계"
  "씬 병합 도구를 실제로 설정해보기"

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), and its top
border grows 2px -> 3px.

The PROBLEM column must keep all three items. Do not soften them into achievements.

=== BLOCK C: NEXT STEPS CARD ===
Margin-top 48px, padding 24px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(52,211,153,0.04), border-left 3px #34d399.
  Label font-mono 11px letter-spacing 0.2em color #34d399, VERBATIM: "다음 단계"
  Body 16px leading-8 margin-top 12px, VERBATIM:
  "추가 스테이지와 보스 패턴을 붙여 완성도를 높일 예정입니다.
   그 전에 점프 버퍼를 넣어 입력 관용도를 마무리하려고 합니다."

=== BLOCK D: GITHUB LINK ===
Margin-top 40px. A single primary link button:
  background #34d399, color #04120d, font-mono 14px font-black,
  padding 14px 28px, rounded-md.
  Label VERBATIM: "GitHub 저장소 ↗"
  Hover: scale 1.04, box-shadow 0 0 28px rgba(52,211,153,0.35).
  Active: scale 0.97.
  href https://github.com/KimEoJin24/TSEROF, target _blank, rel noreferrer.
Directly under it, a caveat line, font-mono 11px, color #fbbf24, VERBATIM:
  "팀원 소유 저장소입니다. 접근이 제한되어 있을 수 있습니다."
This caveat is REQUIRED here as well as on the hero section.

=== BLOCK E: EXIT BUTTON + SAVE-AND-QUIT TRANSITION ===
Margin-top 72px. A full-width button, height 88px, rounded-md,
border 1px rgba(52,211,153,0.20), background transparent.
  Label centered, font-mono 15px, letter-spacing 0.1em, rgba(255,255,255,0.65),
  VERBATIM: "← 저장하고 마을로 돌아가기"
  Hover: border becomes rgba(52,211,153,0.50), label color #34d399, and a faint green
  glow appears behind the label. 0.35s transition.

EXIT TRANSITION (on click of this button OR the header's "← 마을로"):
  t=0.00s  All content fades to opacity 0 (0.3s). The page background darkens
           #071a13 -> #04120d (0.3s).
  t=0.30s  A small save panel fades in at viewport center, 280x92px, rounded-md,
           border 1px rgba(52,211,153,0.30), background #061a12.
           Inside, font-mono 13px rgba(255,255,255,0.70), VERBATIM: "진행 상황 저장 중"
           and a 2px progress line beneath it filling left to right over 0.5s in #34d399.
  t=0.85s  The text swaps to VERBATIM "SAVED" in font-mono 16px font-black #34d399,
           with a single 0.2s scale pop. One short soft confirmation sound
           (volume cap 0.12), respecting the sound toggle.
  t=1.25s  The save panel fades out (0.3s) and the screen goes to solid #04120d.
  t=1.70s  Emit an onExit callback so the parent can restore the 3D village scene.
  Body scroll locks during the transition ONLY; the parent releases it.
  The lock must be released in the effect cleanup even if the component unmounts
  mid-transition.

This exit is the page's final callback to its own subject: the last thing it does is
save. Do not replace it with a generic fade.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label fades in
0.15s  Heading reveals word by word (stagger 0.03s)
0.65s  Intro paragraph reveals
1.20s  KPT columns fade up left to right, 0.12s apart, each lifting 16px; within each
       column items appear 0.06s apart
2.10s  Next steps card slides in from the left (x -12px -> 0)
2.45s  GitHub button and its caveat fade in
2.75s  Exit button fades in with its border drawing from the center outward
       (a pseudo-element width 0% -> 100%, 0.6s)

=== RESPONSIVE ===
< 768px: KPT becomes a single column (16px gap); heading 22px;
exit button height 72px with a 14px label; GitHub button full width;
the save panel in the exit transition becomes 88vw wide.

=== ACCESSIBILITY ===
prefers-reduced-motion: all reveals instant; the exit transition still shows the save
panel and "SAVED" (they carry meaning) but with no progress-line animation and no
scale pop - just a 0.4s cross-fade to black.
The exit button must be a real <button>, keyboard focusable, with a visible focus ring
(2px #34d399, offset 2px). Announce "SAVED" through a single polite status region.
Audio hard-capped at 0.12 and gated by the sound toggle.

=== DO NOT ===
Do not add confetti, celebration effects, or "읽어주셔서 감사합니다" flourishes.
Do not soften the PROBLEM column - the honesty is the point.
Do not omit the GitHub access caveat.
Do not leave body scroll locked if the component unmounts during the transition.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-1. 개발 실체 커버리지 점검

| 항목 | 어디에 | 형태 |
|---|---|---|
| **왜 만들었나** | P00 | 부팅 첫 문장 (4초 안에) |
| **데모 영상** | P01 (보드 특별 슬롯) · P09 (풀버전) | 버튼 아님 |
| **GitHub** | P01 (특별 슬롯) · P10 (버튼) | **양쪽 모두 접근 제한 고지 병기** |
| **코드** | P02(컨트롤러) · P03(3안 재현) · P04(Before/After) · P05(StageManager) · P06(.gitattributes) · P07(SaveSystem) | **총 7개 블록** |
| **트러블슈팅** | P04 (점프 씹힘) · P06 (씬 머지 충돌) | **8단계 전체 프로세스 2건** |
| **기술 의사결정 + 포기한 것** | P03 | 3안 동시 비교 + 정직한 비용 카드 |
| **구조 / 리팩터링** | P08 | 단일 씬 → 분할 다이어그램 |
| **작업 범위 (내가/팀원이/아무도)** | P08 | **3열** — 팀 프로젝트라 필수 |
| **회고** | P10 | KPT (PROBLEM 3개 포함) |
| **한계 인정** | P03 · P04 · P06 · P07 · P08 · P09 · P10 | **7곳** (§4 규칙은 4곳 이상) |

## D-2. 새로 만들 파일

```
src/components/ui/project-viewers/stages/tserof/
  index.tsx                 ← PAGE 00~10 순서, 스크롤→잠금 해제 매핑
  ⭐ useMiniPlatformer.ts    ← 고정 dt 물리 루프. P02·P04가 공유 (제일 먼저 만들 것)
       옵션: { groundRays: 1 | 4, rayOffset, onRejectedJump, onLand, paused, showGizmos }
  ⭐ StageBoard.tsx          ← 11칸 보드. 헤더(mini) + P01(large) + P05(interactive)
       세 곳이 같은 컴포넌트를 크기만 바꿔 쓴다. layoutId로 P05 줌인 연결
  useUnlockProgress.ts      ← 스크롤 → 잠금 해제 인덱스 + sessionStorage 복원
  BootSequence.tsx          ← P00 · PRESS SPACE + 점프 착지
  SaveThreeWay.tsx          ← P03 · 세 방식 동시 비교
  CoyoteCase.tsx            ← P04 · 재현 데모 + 케이스 파일
  MergeConvergence.tsx      ← P06 · 커밋 수렴 애니메이션 (SVG)
  SaveFileViewer.tsx        ← P07 · 실시간 JSON + 불러오기 분기
  StructureSplit.tsx        ← P08 · 단일 씬 → 담당자 색 분할
  SaveAndQuit.tsx           ← P10 · 퇴장 트랜지션
  copy.ts                   ← 모든 한국어 문구
  assets.ts                 ← [IMG-01~12] · [VIDEO-01]
```

> ⭐ **`useMiniPlatformer.ts` 를 안 만들고 P02부터 짜면 P04에서 전부 다시 짭니다.**
> P02는 `groundRays: 1`(기즈모 끔), P04는 토글로 `1 ↔ 4`(기즈모 켬).
> **접지 판정 방식 말고는 아무것도 다르지 않아야** "같은 조작인데 이번엔 된다"가 성립합니다.
> 코요테 타임 옵션은 두지 마세요 — 실제로 쓰지 않은 기능입니다.

## D-3. 기존 코드 재사용 / 선행 작업

재사용: `CodeBlock`, `ImageSlot`, `MockScreen`, `RevealText`, `CountUp` (`shared.tsx`)

> ⚠️ **선행 작업 (10개 프로젝트 공통 1건)**: `shared.tsx` 의 `DecisionTable`,
> `ArchDiagram`, `CompareBars`, `ProcessTimeline`, `QuoteCard`, `TldrBanner`,
> `BeforeAfter`, `ChallengeCard` 가 현재 **모듈 내부 함수(비export)** 입니다.
> stage 폴더에서 쓰려면 export로 승격해야 합니다.
> 이 방에서 특히 필요한 것: `DecisionTable`(P03) · `BeforeAfter`(P04·P06) · `ArchDiagram`(P08)

## D-4. 버릴 것

- `[KILL]` `richContent/TserofDemo.tsx` → `useMiniPlatformer` + `StageBoard` 체계로 전면 재작성
- `[KILL]` tserof의 `PlatformerLayer` 아트 디렉션 (그리드 오버레이 + 그레이박스로 대체)
- `[KILL]` `data.ts` 의 tserof `resultScreens` / `impact` (P09 facts row로 흡수)

## D-5. 미디어 확보 목록

| 슬롯 | 내용 | 비율 | 우선도 | 비고 |
|---|---|---|---|---|
| `[VIDEO-01]` | 플레이 영상 (이동→2단점프→아이템→클리어→잠금해제) | 16/9 | **최상** | 길이 `[확인필요]` |
| `[IMG-01]` | 타이틀 화면 | 16/9 | 높음 | 기존 `tserof.png` 재사용 가능 |
| `[IMG-02]` | 그레이박스 레벨 프로토타입 | 16/9 | 중간 | |
| `[IMG-03]` | 난이도 선택 화면 | 16/9 | 중간 | 기존 `tserof-difficulty.png` |
| `[IMG-04]` | **Unity 에디터 — 접지 판정 기즈모** | 16/9 | **최상** | 에디터 원본 배지 |
| `[IMG-05]` | 스테이지 선택 화면 | 16/9 | 높음 | 기존 `tserof-stage.png` |
| `[IMG-06]` | **Git 충돌 화면 / 로그** | 16/9 | **최상** | ⚠️ **실명·이메일 마스킹 필수** |
| `[IMG-07]` | 저장 파일 실물 (편집기로 연 모습) | 4/3 | 높음 | |
| `[IMG-08]` | **Unity 프로젝트 씬/프리팹 폴더 구조** | 4/3 | **최상** | 에디터 원본 배지 |
| `[IMG-09]` | 플레이 화면 — 발판 구간 | 16/9 | 중간 | |
| `[IMG-10]` | 클리어 직후 잠금 해제 | 16/9 | 중간 | |
| `[IMG-11]` | 유저 피드백 반영 화면 | 16/9 | 중간 | 기존 `tserof-feedback.png` · ⚠️ 개인정보 확인 |
| `[IMG-12]` | Unity 에디터 — 씬 계층과 프리팹 | 16/9 | **최상** | `[IMG-08]`과 다른 앵글 |

**총계**: 영상 1편 + 이미지 12장 (기존 자산 4장 재사용 가능 → **신규 촬영 8장**)

## D-6. 코드 스니펫 확보 목록 (전부 실제 저장소에서)

| 페이지 | 파일 | 줄 | 하이라이트 |
|---|---|---|---|
| P02 | `PlayerController.cs` | 24 | 이동 / 접지+점프 / 공중점프 3구간 |
| P03 | — | — | 3안 재현은 코드블록 아님 (동작 비교 UI) |
| P04 | `PlayerController.cs` (before) | 10 | 접지 직접 검사 줄 |
| P04 | `PlayerController.cs` (after) | 14 | 타이머 충전 · 감소 · 점프 조건 |
| P05 | `StageManager.cs` | 18 | 잠금 인덱스 갱신 + 저장 호출 |
| P06 | `.gitattributes` | 3 | 씬/프리팹 자동 머지 제외 |
| P07 | `SaveSystem.cs` | 22 | 파싱 실패 가드 + 버전 마이그레이션 분기 |

> ⚠️ `data.ts` 에 이미 있는 `PlayerController.cs` / `StageManager.cs` 스니펫은 **요약본**입니다.
> P02·P04·P05는 실제 저장소에서 원본을 다시 떠와야 합니다.

## D-7. 안전장치 대조표 — **제어권 박탈 0회, 대신 입력 캡처가 위험 지점**

DarkLab이 "제어권 박탈 2회"의 안전장치를 관리했다면, 이 방의 위험은 **키보드 캡처와 물리 루프**입니다.

| | P00 부팅 (Space) | P02 데모 (Space·방향키) | P04 재현 데모 | P05 보드 |
|---|---|---|---|---|
| 전역 리스너 | ❌ (오버레이 마운트 중만) | ❌ (포커스/호버 시만) | ❌ (동일) | 해당 없음 |
| `preventDefault` 조건 | 오버레이 표시 중 | 컨테이너 활성 시만 | 컨테이너 활성 시만 | — |
| 언마운트 정리 | 리스너 제거 + 스크롤 해제 | 리스너 제거 + 루프 정지 | 동일 | — |
| 뷰포트 밖 정지 | 해당 없음 | ✅ IntersectionObserver | ✅ | ✅ 애니메이션만 |
| 탭 숨김 정지 | 해당 없음 | ✅ `document.hidden` | ✅ | ✅ |
| 터치 대체 수단 | TAP TO START | 화면 버튼 3개 | 화면 버튼 3개 | 탭 |
| 키보드 전용 완주 | ✅ 실제 버튼 | ✅ 화면 버튼도 포커스 가능 | ✅ | ✅ |
| reduced-motion | 애니메이션만 생략, 조작 유지 | 동일 | 동일 | 줌인 생략 |

**스크롤 잠금은 P10 퇴장 트랜지션(1.7초) 단 한 곳뿐이며, 이것도 언마운트 시 반드시 해제.**

## D-8. 최종 체크리스트

- [ ] **Space·방향키 전역 캡처 0건** — 컨테이너 활성 시에만 `preventDefault` (**어기면 배포 금지**)
- [ ] 모든 물리/애니메이션 루프가 뷰포트 밖 + `document.hidden` 에서 정지하는지
- [ ] 물리 루프가 **고정 dt 누산기** 방식인지 (144Hz에서 점프 높이가 달라지면 실패)
- [ ] P02와 P04가 **같은 `useMiniPlatformer` 훅**을 쓰는지 (다른 구현이면 논증이 무너짐)
- [ ] 제어권 박탈 0회 — 스크롤 잠금은 P10 퇴장 1.7초뿐, 언마운트 시 해제
- [ ] 헤더 보드 진행이 `sessionStorage` 로 복원되는지 · **P05 보드는 별도 키**를 쓰는지
- [ ] GitHub 접근 제한 고지가 **P01·P10 양쪽에** 있는지
- [ ] `[확인필요]` 4곳(P01 영상 길이 · P08 팀 인원/기간 · P08 팀원 담당 · P09 팀 셀)이 **숫자로 대체되지 않았는지**
- [ ] 면책 문구 4개 누락 금지 — P02·P04 "2D 재현" / P03 "실제 저장 파일 아님" / P06 "실제 커밋 그래프 아님" / P07 "재현입니다"
- [ ] P09 "지표 없습니다" 문구 유지
- [ ] P03 "대신 포기한 것" · P04·P06 "아직 남은 것" · P07 "아직 못 막는 것" · P08 "아무도 못 한 것" · P10 PROBLEM 3개 — **전부 유지**
- [ ] P06 검증 문구가 "숫자로 증명할 수 있는 종류가 아니었다" 를 유지하는지
- [ ] `[IMG-06]` Git 화면 **실명·이메일 마스킹** · `[IMG-11]` 피드백 화면 **개인정보 확인**
- [ ] 팀원을 실명으로 부르지 않았는지 (P06 "팀원 A/B/C")
- [ ] 숫자는 전부 `tabular-nums`
- [ ] 사운드 최대 0.15 (P10 퇴장 0.12), 전역 토글 연동
- [ ] 화면 전체 플래시 0회, 스트로브 0회, 1Hz 초과 깜빡임 0회
- [ ] DarkLab과 주제 중복 0건 — Cinemachine·시야 제한·공포 연출·ScriptableObject를 주제로 삼지 않았는지
- [ ] 지어낸 수치 0개 — 스테이지 수·플레이 시간·팀 인원·충돌 횟수·ms 개선치 주장 금지

