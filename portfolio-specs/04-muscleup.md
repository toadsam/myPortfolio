# 04. 득근득근 (MuscleUp) — 프롬프트 팩

> 운동 기록을 게임화와 커뮤니티로 연결하는 풀스택 피트니스 플랫폼 · TypeScript / React / Spring Boot / JWT / OAuth / 실시간(**Socket.IO**)
> **사용법**: `PAGE 00` ~ `PAGE 10` 의 코드블록을 **하나씩 통째로 복사해서 Variant에 붙여넣으세요.**
> 각 프롬프트는 **완전히 자립적**입니다 (색상·폰트·무드가 매번 반복 포함).
> `## A` `## B` `## D` 는 **읽기용**이지 프롬프트가 아닙니다.

> ✅ **[FIX-01] 해소 (2026-07-31) — 실시간 스택은 `Socket.IO` 입니다.**
> 저장소 확인 결과: `Ajou_MuscleUp/realtime/src/server.ts` 가 `import { Server } from "socket.io"` 로
> **REST 백엔드와 분리된 별도 실시간 서버**(기본 포트 `4001`, `ORIGIN` allowlist + CORS 직접 처리)를 띄우고,
> 프론트는 `socket.io-client ^4.8.1` 로 붙습니다. `projects.ts` 의 SSE 문장 2곳은 **수정 완료**.
>
> ✅ `PAGE 05` 는 실제 기능인 **「실시간 라운지」** 로 **전면 재작성 완료**,
> `D-6` 코드 목록도 실제 파일(`realtime/src/server.ts` · `rooms.ts`)로 교체했습니다.
> 이 프로젝트의 강점은 "SSE로 단방향 푸시"가 아니라
> **"위치·채팅처럼 초당 여러 번 바뀌고 양방향인 상태라 실시간 서버를 REST와 물리적으로 분리했다"** 쪽입니다.
> (FestFlow(03)가 SSE이므로, **두 방이 서로 다른 실시간 방식을 고른 이유**를 대비시키면 좋은 재료가 됩니다.)

---

# A. 컨셉 브리프 (읽기용)

## A-1. 이 방의 한 문장

**"RPG 캐릭터 시트 앞에 앉는다. 스크롤을 내리면 내가 레벨업한다."**

## A-2. 왜 이 메타포인가

득근득근의 핵심 가설은 하나였다: **"기록이 즉시 보상으로 돌아오면 사람은 계속 한다."**
운동 앱은 많다. 대부분 기록을 저장만 한다. 저장은 보상이 아니다.

그래서 이 프로젝트는 운동 기록을 **경험치**로 바꿨다.
그렇다면 이 프로젝트를 설명하는 페이지가 **읽기만 하는 문서면 그 자체로 모순**이다.

이 방에서는 **관람객이 스크롤을 내리는 것 자체가 경험치를 쌓는 행위**다.
그리고 특정 지점에서 **진짜로 레벨업 연출이 터진다.**
관람객은 "게임화를 했습니다"를 읽는 게 아니라, 게임화를 당한다.

## A-3. ⭐ 가장 중요한 원칙 — 연출은 개발 내용의 운반 수단이다

**모든 연출은 반드시 개발 실체를 하나 이상 전달해야 한다.** 멋있기만 한 연출은 넣지 않는다.

| 전달할 개발 실체 | 그걸 실어나르는 연출 | 페이지 |
|---|---|---|
| 왜 이걸 만들었나 (동기) | 캐릭터 시트가 생성되며 뜨는 첫 문장 | 00 |
| 데모 영상 · GitHub | **캐릭터 시트의 장비 슬롯 3칸**에 끼워진 아이템 | 01 |
| 게임화 루프를 구현했다 | **관람객이 운동을 직접 기록** → EXP 게이지가 차고 퀘스트가 완료됨 → 즉시 옆에 보상 계산 코드 | 02 |
| **트러블 01: 보상 계산이 클라이언트에 있었다** | **관람객에게 "EXP 조작하기" 버튼을 준다.** 누르면 999999가 됨 → "이게 실제로 가능했습니다" → 서버 이동 코드 | 03 |
| JWT + Google OAuth 인증 흐름 | 로그인 시퀀스를 단계별로 분해해 토큰이 어디서 만들어지는지 추적 | 04 |
| **실시간 라운지 (Socket.IO)** | **관람객이 캐릭터를 직접 움직인다** → 옆 로그에 `player:move` 가 실제로 찍힘 · 다른 캐릭터는 알아서 움직임 | 05 |
| **트러블 02: 출석 보상이 두 번 지급됐다** | **"두 번 누르기" 버튼** → 실제로 중복 지급되는 걸 보여줌 → 멱등성 처리 코드 | 06 |
| AI 인바디 분석 연동 | 이미지 업로드 → 파싱 → 리포트 생성 파이프라인을 단계별로 | 07 |
| 전체 구조 · 내가 한 범위 | 시스템 다이어그램 (1인 풀스택이므로 전 구간 점등) | 08 |
| 결과물 · 화면 갤러리 | 캐릭터 시트가 완성되며 갤러리 공개 | 09 |
| 회고 · 다음 단계 | 스탯 정산 → 시트 접기 → 퇴장 | 10 |

## A-4. 서비스 설계 결정 ↔ 웹 재현 대응

| 서비스에서 내린 결정 | 이 웹페이지에서의 재현 |
|---|---|
| 기록하면 즉시 보상이 온다 | **스크롤할수록 헤더의 EXP 게이지가 찬다** |
| 레벨업은 눈에 띄어야 한다 | **P02에서 실제 레벨업 연출이 한 번 터진다** |
| 보상은 서버가 계산한다 | **P03에서 관람객이 직접 조작해보고, 그게 왜 막혔는지 본다** |
| 같은 요청이 두 번 와도 한 번만 준다 | **P06에서 관람객이 두 번 눌러본다** |

**관람객은 게임화의 효과를 설명으로 듣는 게 아니라, 그 루프 안에 들어갔다 나온다.**

## A-5. 관람 곡선 (감정 + 정보 밀도)

```
동기  ╭──╮ P02 레벨업 (감정 최고조)
     ╱    ╰─╮        ╭─╮ P06 중복 지급 (작은 충격)
 P00        ╰────────╯ ╰──╮
 시트 생성    P03~05 개발     ╰───── P09~10 정산 · 마무리
정보  낮 ──────╱▔▔▔▔▔▔▔▔▔▔▔▔╲──────
            P03~08 개발 밀도 최고조
레벨  Lv.1 ── Lv.2 ── Lv.3 ── Lv.5 ── Lv.7 ── Lv.9
```

**핵심 장치**: 헤더에 **`Lv.3  ▓▓▓▓▓░░░  64%`** EXP 게이지가 있고,
**스크롤 진행도가 그대로 경험치다.** 진행바 역할과 컨셉 전달을 동시에 한다.
페이지 끝에 도달하면 `Lv.9` 가 되고, 마지막 섹션에서 정산된다.

## A-6. 명장면 2개

**① PAGE 02 — 레벨업** (감정의 클라이맥스)
관람객이 운동 기록 폼에 아무거나 입력하고 "기록하기"를 누르면
EXP 바가 끝까지 차고 → 잠깐 정지 → **`LEVEL UP` 이 터진다.**
그리고 0.3초 뒤, **그 레벨업을 계산한 서버 코드가 바로 옆에 나타난다.**

**② PAGE 03 — 조작해보세요** (기술의 클라이맥스)
"EXP 조작하기" 버튼을 준다. 누르면 **진짜로 EXP가 999999가 된다.**
뜨는 문장: *"방금 하신 게, 제 첫 버전에서는 실제로 통했습니다."*
그 다음 클라이언트 계산 → 서버 계산으로 옮긴 Before/After 코드가 나온다.

## A-7. 다른 9개 방과의 차별점

| 축 | 득근득근 | 나머지 |
|---|---|---|
| 진행 표시 | **EXP 게이지 · 레벨** | 스크롤바 또는 없음 |
| 관람객 위치 | **시스템의 사용자로 편입됨** | 관찰자 |
| 보안 서사 | **직접 치트를 쳐보게 한다** | 설명만 |
| 색 | 핑크 · 네온 헬스장 | 각자 |
| 톤 | 활기참 · 약간 유머 | 각자 |

## A-8. 절대 금지 (안전 규칙)

- **신체 이미지 주의**: 근육질 몸매·체지방률 비교·"before/after 몸 사진" 금지.
  인바디 리포트는 **수치와 그래프로만** 표현
- 다이어트 조장 문구, 특정 체형을 목표로 제시하는 카피 금지
- 레벨업 연출은 **세션당 1회**, 전체 화면 플래시 금지, 파티클은 저채도·짧게
- 실시간 루프는 **뷰포트 밖이면 정지**
- 지어낸 지표(가입자 수 · DAU · 운동 기록 수) 금지
- 소리 기본 OFF, 레벨업 효과음도 볼륨 0.12 하드 제한

---

# B. 공통 디자인 토큰 (참고용 — 각 프롬프트에 이미 포함됨)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#140510` → `#1a0a16` (P09부터) | 페이지 배경 |
| `--panel` | `#1e0a1a` | 시트 · 카드 |
| `--primary` | `#f472b6` | 핑크 · EXP · 강조 |
| `--accent` | `#f9a8d4` | 보조 강조 |
| `--exp` | `#f472b6` → `#fbbf24` (레벨업 순간) | 게이지 |
| `--ok` / `--bad` / `--warn` | `#4ade80` / `#f87171` / `#fbbf24` | 상태 3색 |
| `--text` | `rgba(255,255,255,0.88)` | 본문 |
| `--muted` | `rgba(255,255,255,0.46)` | 캡션 |
| 코드 패널 | bg `#12060f`, border `rgba(244,114,182,0.18)` | |
| 문법 색 | 주석 `#8a5f7a` / 문자열 `#a3e635` / 키워드 `#f472b6` / 숫자 `#7dd3fc` | |
| 이징 | `cubic-bezier(0.34,1.56,0.64,1)` (스프링) · 0.3~0.7s | 통통 튀게 |
| 숫자 | 전부 `tabular-nums` | |

---

# C. 페이지별 프롬프트

---

## PAGE 00 — 캐릭터 생성 (진입 시퀀스)

**개발 실체**: 왜 이걸 만들었는가 (동기)
**연출 장치**: RPG 캐릭터 시트가 한 칸씩 채워지며 생성됨

```text
Build a full-screen cinematic CHARACTER CREATION intro for a gamified fitness
platform portfolio page. Stack: React + TypeScript + Tailwind CSS + framer-motion.
Single self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
Why this project was built. The final line of the sequence must state the
developer's motivation, readable within 4 seconds.

=== MOOD ===
An RPG character sheet being filled in. Neon pink on deep plum, like a late-night
gym's LED sign. Energetic but not aggressive. Playful, a little tongue-in-cheek.
NOT a fitness-influencer aesthetic. NO body photos, NO muscle imagery, NO
before/after physiques - this is a stat sheet, not a body.

=== DESIGN TOKENS (use exactly) ===
background #140510 | panel #1e0a1a | primary pink #f472b6 | accent #f9a8d4
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
fonts: headings font-black, body sans leading-8, ALL stats/labels font-mono
easing cubic-bezier(0.34,1.56,0.64,1) - a slight overshoot spring on everything
durations 0.3s-0.7s | rounded-md | all numbers tabular-nums

=== LAYOUT ===
Full viewport, position fixed, above page content.
Background: #140510 plus two soft radial glows - pink rgba(244,114,182,0.07) at
30% 25%, and a warmer rgba(249,168,212,0.05) at 70% 75%.
Content: a centered CHARACTER SHEET panel, max-width 560px,
background #1e0a1a, border 1px rgba(244,114,182,0.24), rounded-lg, padding 34px.

=== CREATION TIMELINE (follow exactly) ===
t=0.00s  Empty sheet. Only the panel outline draws itself (border stroke sweeping
         clockwise, 0.5s).
t=0.50s  A header row types in, font-mono 11px letter-spacing 0.22em
         rgba(255,255,255,0.46), VERBATIM: "CHARACTER SHEET"
t=0.75s  A horizontal pink rule draws left to right (0.4s).
t=1.00s  THE NAME FIELD fills in with a typing effect at ~50 chars/sec:
           Label font-mono 10px rgba(255,255,255,0.46), VERBATIM: "NAME"
           Value font-black 38px #f472b6, VERBATIM: "득근득근"
           Sub-value font-mono 13px rgba(255,255,255,0.46), margin-top 6px,
           VERBATIM: "MuscleUp · 운동 기록 게임화 플랫폼"
t=1.60s  THE STAT ROWS appear one at a time, 0.14s apart. Each row is a label on
         the left (font-mono 11px rgba(255,255,255,0.46)) and a value bar on the
         right: a 6px track in rgba(255,255,255,0.08) with a pink fill that
         animates from 0% to its value over 0.5s with the spring easing, plus a
         numeric readout in font-mono 11px #f9a8d4 tabular-nums.
         Rows, labels VERBATIM, with their fill percentages:
           "기술 스택"   6  -> 100%
           "핵심 기능"   7  -> 100%
           "담당 범위"   VERBATIM "풀스택"  -> 100%
           "개발 인원"   VERBATIM "1인"     -> 100%
         (Render the last two as text values with a full bar, not numbers.)
t=2.50s  A divider, then THE MOTIVATION LINE fades in. This is the substance of
         this page. 17px, leading-9, rgba(255,255,255,0.88), max-width 470px.
         Korean copy, VERBATIM:
         "헬스장 3개월 끊어놓고 2주 만에 안 간 적이 있다.
          기록 앱도 똑같았다. 저장 버튼을 눌러도 아무 일이 안 일어나니까.
          기록하면 뭐라도 일어나게 만들면 다를까 싶었다."
         Reveal word by word, stagger 0.035s, y 6px -> 0.
t=3.60s  An EXP bar appears at the bottom of the sheet - this is the page's
         permanent progress element and must persist into the header afterwards:
           a 8px track in rgba(255,255,255,0.08), rounded-full, with a pink fill
           animating 0% -> 4%, and a readout to its right, font-mono 11px,
           tabular-nums, format VERBATIM: "Lv.1  4%"
t=4.00s  A scroll hint below the sheet, font-mono 12px rgba(255,255,255,0.46),
         VERBATIM: "↓ 스크롤하면 경험치가 오릅니다"
         with a pink chevron bouncing 4px on a 1.8s cycle.
         This line is a promise the rest of the page must keep.

=== ESCAPE HATCHES (required) ===
Any click, scroll, keypress, or Escape skips to the t=4.00s end state instantly.
A skip control from t=0.40s at the bottom-right, font-mono 11px,
rgba(255,255,255,0.35), VERBATIM: "[ 건너뛰기 ]"

=== ACCESSIBILITY ===
prefers-reduced-motion: render the completed sheet immediately - no typing, no bar
fills, no spring overshoot, no chevron bounce.
All sheet content must be real text in the DOM.
The EXP bar needs role="progressbar" with aria-valuenow/min/max and an accessible
name, VERBATIM: "페이지 진행도"

=== RESPONSIVE ===
< 768px: sheet max-width 92vw, padding 22px, name 30px, motivation line 15px.

=== DO NOT ===
No body photographs, no muscle illustrations, no physique comparisons.
No diet or weight-loss framing anywhere in the copy.
No full-screen flashes. Do not delay the motivation line past 3.0s.
```

---

## PAGE 01 — 히어로 · 장비 슬롯

**개발 실체**: 프로젝트 정체 + **데모 영상 · GitHub · 개발 범위 메모**
**연출 장치**: 링크가 버튼이 아니라 **캐릭터 시트의 장비 슬롯 3칸**에 장착된 아이템

```text
Build the HERO SECTION of a gamified fitness platform portfolio page, where the
demo video, the GitHub repository, and a scope note are three ITEMS equipped into
an RPG character sheet's equipment slots - never a link row.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained section.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the project is (identity + hard facts)
2. The demo video entry point
3. The GitHub repository link
4. The development scope
Items 2-4 must read as equipment in slots, not as buttons.

=== MOOD ===
An RPG character sheet, neon pink on deep plum, like a late-night gym LED sign.
Playful, energetic, slightly tongue-in-cheek.
NO body photos, NO muscle imagery, NO physique comparisons.

=== DESIGN TOKENS (use exactly) ===
background #140510 | panel #1e0a1a | primary pink #f472b6 | accent #f9a8d4
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
panel border rgba(244,114,182,0.20)
fonts: headings font-black, body sans leading-8, stats/labels font-mono uppercase
easing cubic-bezier(0.34,1.56,0.64,1) | rounded-md | numbers tabular-nums

=== PERSISTENT HEADER (fixed, present on every section of this page) ===
Height 54px, background rgba(20,5,16,0.85), backdrop-blur(10px),
bottom border 1px rgba(244,114,182,0.18).
  LEFT   "← 마을로"  13px font-mono rgba(255,255,255,0.46)
  CENTER "득근득근"   14px font-black #f472b6
  RIGHT  THE EXP GAUGE - this is the page's progress indicator AND its concept.
         A 96px track, 6px tall, rgba(255,255,255,0.08), rounded-full, with a pink
         fill bound to whole-page scroll progress, plus a readout in font-mono 12px
         tabular-nums, format VERBATIM: "Lv.3  64%"
         The level number is derived from scroll progress in 9 steps: the viewer
         starts at Lv.1 and reaches Lv.9 at the bottom of the page.
         Each level change plays a small pink pulse on the gauge (0.4s), never a
         full-screen effect.
         Bind scroll progress to a CSS custom property inside a
         requestAnimationFrame-throttled listener - do NOT store scroll position in
         React state.

=== LAYOUT ===
min-height 100vh, centered, max-width 1120px, padding-block 96px.
Two columns, gap 40px (stacks below 1024px, sheet first):
  LEFT  (46%) : THE CHARACTER SHEET with equipment slots, height ~560px
  RIGHT (54%) : kicker + headline + summary + feature chips

=== THE CHARACTER SHEET (the defining object of this page) ===
Panel: background #1e0a1a, border 1px rgba(244,114,182,0.24), rounded-lg,
padding 26px.
  Header row: font-mono 11px letter-spacing 0.22em rgba(255,255,255,0.46),
  VERBATIM: "CHARACTER SHEET"
  Name block: font-black 30px #f472b6, VERBATIM: "득근득근"
  with a sub-line font-mono 12px rgba(255,255,255,0.46),
  VERBATIM: "MuscleUp · 풀스택 · 1인 개발"

  STAT ROWS (4 rows, each label + a 6px pink bar + a font-mono value):
    VERBATIM "기술 스택"  value "6"
    VERBATIM "핵심 기능"  value "7"
    VERBATIM "인증 방식"  value "2"
    VERBATIM "담당 범위"  value "전 구간"

  A divider, then THE EQUIPMENT SLOTS - three slots in a row, each a 96x96px
  square, border 1px dashed rgba(244,114,182,0.28), rounded-md,
  background rgba(244,114,182,0.03), with a slot label beneath in font-mono 9px
  rgba(255,255,255,0.40).

  SLOT 1 - DEMO VIDEO   slot label VERBATIM: "영상"
    Contents once equipped: a play triangle 22px #f472b6 inside a 44px circle with
    a 1px rgba(244,114,182,0.45) border, and beneath the slot a caption,
    font-mono 10px #f9a8d4, VERBATIM: "플레이 영상 · 2분 20초"
    Click -> video lightbox: overlay rgba(12,3,10,0.93) backdrop-blur(8px),
    16/9 player, max-width 1000px, Esc / overlay click closes.
    If no source is supplied render a CSS placeholder with centered text
    VERBATIM "데모 영상 자리 · 16:9".
    [VIDEO-01] a full loop: log a workout -> EXP gain -> quest complete -> level up
    -> challenge feed updates.
  SLOT 2 - GITHUB       slot label VERBATIM: "저장소"
    Contents: a monospace "< >" glyph 24px rgba(255,255,255,0.78), caption beneath
    font-mono 10px rgba(255,255,255,0.60), VERBATIM: "GitHub · React + Spring Boot"
    Click -> https://github.com/toadsam/Ajou_MuscleUp in a new tab
    (target _blank, rel noreferrer).
  SLOT 3 - SCOPE NOTE   slot label VERBATIM: "범위"
    Contents: three tiny stacked lines, font-mono 9px rgba(255,255,255,0.60),
    VERBATIM: "기획" / "프론트" / "백엔드"
    Not a link - informational. It still animates on hover.

  EQUIP ANIMATION (required): the three slots start EMPTY (dashed outline only).
  On section enter, items drop into them one at a time, 0.16s apart: each item
  falls from 20px above with the spring easing, the slot border switches from
  dashed to solid rgba(244,114,182,0.45), and a single soft pink ring expands from
  the slot (0 -> 34px, opacity 0.5 -> 0, 0.6s).
  Hover an equipped slot: it lifts 3px and its border brightens.

  A hint below the slots, font-mono 10px rgba(255,255,255,0.35), fading out
  permanently once any slot has been hovered or focused,
  VERBATIM: "슬롯을 눌러보세요"

=== RIGHT COLUMN CONTENT (Korean copy - VERBATIM, never translate) ===

KICKER (font-mono 12px, letter-spacing 0.3em, uppercase, color #f472b6):
  "풀스택 · 운동 기록 게임화 + 커뮤니티"

HEADLINE (font-black, 40px desktop / 26px mobile, leading-tight,
          rgba(255,255,255,0.88)):
  Line 1, VERBATIM: "저장 버튼을 눌렀는데"
  Line 2, color #f472b6, margin-top 10px, VERBATIM: "아무 일도 안 일어난다면"

SUMMARY (16px leading-9, max-width 560px, margin-top 22px):
  VERBATIM: "오늘의 운동 기록이 출석이 되고, 퀘스트가 되고, 캐릭터 경험치가 된다.
             그리고 그 결과가 커뮤니티에 바로 보인다."
  Emphasize "경험치가 된다" in #f9a8d4, font-bold.

FEATURE CHIPS (margin-top 30px, wrap layout, 7 chips):
  Each: font-mono 11px, padding 6px 12px, rounded-full,
  border 1px rgba(244,114,182,0.24), color rgba(255,255,255,0.75).
  Labels VERBATIM: "출석 체크" "캐릭터 성장" "운동 기록 루프" "실시간 라운지"
  "게시글/댓글" "AI 인바디 분석" "Google OAuth"
  They appear one at a time, 0.06s apart, each with a scale 0.9 -> 1 spring.
  Hover: background rgba(244,114,182,0.12), color #f9a8d4.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The character sheet slides up (y 26px -> 0, 0.6s) and its border draws
0.40s  Stat bars fill left to right, 0.1s apart
0.80s  Kicker fades up
1.00s  Headline line 1 word by word (stagger 0.035s), line 2 at 1.45s
1.90s  Summary reveals
2.30s  Feature chips pop in 0.06s apart
2.80s  THE THREE ITEMS DROP INTO THEIR SLOTS, 0.16s apart
3.40s  The slot hint fades in

=== RESPONSIVE ===
< 1024px: single column, sheet first at height auto, right column below.
< 640px: equipment slots become 3 across at 76px each; headline 26px; feature chips
at 10px.
Touch: slots need a 44px minimum touch target.

=== ACCESSIBILITY ===
prefers-reduced-motion: no drop-in equip animation (items are already in place, no
dashed-to-solid transition), no chip pop, no stat bar fill.
Slots 1 and 2 must be real focusable elements (button / anchor) with visible focus
rings (2px #f472b6, offset 2px). Keyboard focus also triggers the hover lift.
The EXP gauge in the header needs role="progressbar" with a proper accessible name.

=== DO NOT ===
Do not render the video and GitHub as a conventional button row anywhere.
No body photos, no muscle graphics, no physique or weight framing.
No invented user counts or workout-record totals.
```

---

## PAGE 02 — 기록하면 뭔가 일어난다 · 게임화 루프

**개발 실체**: 게임화 루프 (기록 → 출석 → 퀘스트 → EXP → 레벨업) + **보상 계산 서버 코드**
**연출 장치**: **관람객이 직접 운동을 기록하면 EXP가 차고 레벨업이 터진다** → 즉시 그 계산 코드가 옆에 등장
**⚠️ 레벨업 연출은 세션당 1회**

```text
Build a SECTION with a working gamification loop the viewer operates themselves:
they log a workout, watch EXP accumulate, quests complete, and a LEVEL UP fire -
and immediately afterwards the real server code that computed that reward appears
beside it.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The exact reward loop: workout record -> attendance -> quest progress -> EXP ->
   level
2. That rewards are computed on the SERVER, with the real code
3. A deliberate forward hook: the first version computed them on the client, and
   that was a mistake (covered next)

=== MOOD ===
Late-night gym, neon pink. Energetic, satisfying, a bit game-like.
NO body imagery of any kind. Stats and bars only.

=== SAFETY (the level-up moment) ===
1. The LEVEL UP sequence fires at most ONCE per session (sessionStorage flag).
2. NO full-screen flash. NO strobing. The brightest element is a pink glow at
   rgba(244,114,182,0.22) over a limited area.
3. Particles: at most 18, low saturation, gone within 1.0s, respecting
   prefers-reduced-motion (in which case: no particles at all).
4. Sound is OFF by default and hard-capped at 0.12 when enabled.

=== DESIGN TOKENS (use exactly) ===
background #140510 | panel #1e0a1a | primary pink #f472b6 | accent #f9a8d4
exp fill #f472b6, shifting to #fbbf24 during the level-up moment only
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #12060f, border rgba(244,114,182,0.18)
syntax: comments #8a5f7a, strings #a3e635, keywords #f472b6, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + stats font-mono 12px
easing cubic-bezier(0.34,1.56,0.64,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1120px, padding-block 120px.
  Block A : label + heading + two paragraphs (max-width 740px)
  Block B : a two-column split, gap 18px, tops aligned
              LEFT  (54%) : THE INTERACTIVE LOOP, height 460px
              RIGHT (46%) : THE REWARD CODE PANEL, height 460px
            Below 1024px stacks, loop first.
  Block C : the forward hook

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.46)):
  "01 · 게임화 루프"

HEADING (28px font-black):
  VERBATIM: "기록 하나가 네 가지를 동시에 건드린다"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "운동을 하나 기록하면 출석이 찍히고, 진행 중인 퀘스트가 올라가고,
             캐릭터 경험치가 붙고, 커뮤니티 피드에 올라간다.
             사용자는 버튼 하나만 눌렀다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "직접 해보세요. 왼쪽에서 아무 운동이나 기록하면 오른쪽 코드가
             그 보상을 어떻게 계산했는지 보여줍니다."
  Emphasize "직접 해보세요" in #f9a8d4, font-bold.

=== BLOCK B LEFT: THE INTERACTIVE LOOP (must actually work) ===
Container: height 460px, rounded-md, border 1px rgba(244,114,182,0.20),
background #1e0a1a, padding 20px, position relative, overflow hidden.

PART 1 - THE LOG FORM (top, ~120px)
  Label font-mono 10px rgba(255,255,255,0.46), VERBATIM: "오늘의 운동 기록"
  A row of three inputs:
    - a select of exercise names, font-mono 12px, options VERBATIM:
      "스쿼트" "벤치프레스" "데드리프트" "러닝" "플랭크"
    - a number input for sets, placeholder VERBATIM "세트"
    - a number input for minutes, placeholder VERBATIM "분"
  All three have background rgba(255,255,255,0.04),
  border 1px rgba(244,114,182,0.20), rounded, padding 8px 10px.
  A submit button: background #f472b6, color #140510, font-mono 12px font-black,
  padding 9px 20px, rounded-md, VERBATIM: "기록하기"
  Hover: scale 1.04. Active: scale 0.97.
  Inputs may be left empty - submitting with defaults must still work. Never block
  the viewer with validation errors; this is a demo.

PART 2 - THE FOUR REWARD TILES (middle, ~180px)
  A 2x2 grid, gap 10px. Each tile: padding 14px, rounded-md,
  border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02).
    TILE 1  label VERBATIM "출석"       value format VERBATIM: "3일 연속"
    TILE 2  label VERBATIM "퀘스트"     value format VERBATIM: "주 3회 운동  1/3"
    TILE 3  label VERBATIM "경험치"     value format VERBATIM: "+0 EXP"
    TILE 4  label VERBATIM "피드"       value format VERBATIM: "게시 대기"
  Labels font-mono 10px rgba(255,255,255,0.46); values font-mono 15px
  rgba(255,255,255,0.88) tabular-nums.

PART 3 - THE EXP BAR (bottom, ~80px)
  A 10px track, rgba(255,255,255,0.08), rounded-full, with a pink fill.
  Above it, a readout row: left font-mono 13px #f472b6 tabular-nums,
  format VERBATIM: "Lv.4"; right font-mono 12px rgba(255,255,255,0.46),
  format VERBATIM: "820 / 1000 EXP"

THE SUBMIT SEQUENCE (this is the payoff):
  t=0.00s  Button presses in (scale 0.97) and a small pink ripple expands from it
  t=0.15s  TILE 1 flips: value changes to VERBATIM "4일 연속", the tile border
           flashes #4ade80 for 0.4s, and a "+1" floats up and fades
  t=0.35s  TILE 2 flips: VERBATIM "주 3회 운동  2/3", same flash
  t=0.55s  TILE 3 counts up: VERBATIM "+120 EXP", number counting over 0.4s
  t=0.75s  TILE 4 flips: VERBATIM "피드 게시됨", flash
  t=0.95s  THE EXP BAR fills from its current value toward the new one over 0.6s
           with the spring easing
  t=1.55s  Readout updates to VERBATIM "940 / 1000 EXP"

THE LEVEL UP (fires on the SECOND submission, once per session):
  On the second press, the EXP bar overshoots past 100%:
  t=0.95s  Bar fills to 100% over 0.5s
  t=1.45s  EVERYTHING PAUSES for 0.35s. The bar holds full. Nothing moves.
           (This pause is the effect - do not skip it.)
  t=1.80s  The bar's fill color shifts #f472b6 -> #fbbf24 over 0.25s, and a pink
           glow (box-shadow 0 0 40px rgba(244,114,182,0.22)) blooms around the
           whole container - LOCAL only, never full-screen.
  t=1.90s  Text bursts in at the container's center, font-black 34px, color #fbbf24,
           VERBATIM: "LEVEL UP"
           entering with scale 0.7 -> 1.08 -> 1 (spring), plus at most 18 small
           low-saturation pink particles radiating outward and fading within 1.0s.
  t=2.10s  Below it, font-mono 14px #f9a8d4, VERBATIM: "Lv.4 → Lv.5"
  t=2.90s  Everything settles: the burst fades, the bar resets to 5% at the new
           level, the fill returns to #f472b6.
  On every subsequent submission in the same session, the EXP simply increments
  without the level-up burst, and a small line appears at the container's bottom,
  font-mono 10px rgba(255,255,255,0.35), VERBATIM: "레벨업 연출은 한 번만 재생됩니다"

A reset control at the container's bottom-right, font-mono 11px,
rgba(255,255,255,0.46), VERBATIM: "↻ 초기화"

=== BLOCK B RIGHT: THE REWARD CODE PANEL ===
Height 460px, background #12060f, border 1px rgba(244,114,182,0.18), rounded-md.
Header bar: three window dots (#ff5f56 #ffbd2e #27c93f, 8px) then the filename,
font-mono 11px rgba(255,255,255,0.45), VERBATIM: "WorkoutRewardService.java"
Body: font-mono 12px, leading-relaxed, line-number gutter rgba(255,255,255,0.22).

CONTENT: a Spring service method, roughly 24 lines, that takes a workout log
request and, in one transaction:
  (a) persists the workout record,
  (b) updates the attendance streak, returning whether today was newly counted,
  (c) advances any active quests whose condition this workout satisfies,
  (d) computes an EXP amount from the workout volume plus streak and quest bonuses,
  (e) applies the EXP to the character, detecting and returning a level-up,
  (f) publishes a feed event.
Structure (a)-(f) as six clearly contiguous blocks.

THE LIVE HIGHLIGHT (required): when the viewer submits the form on the left, the
six blocks highlight IN ORDER, 0.18s apart, each with a rgba(244,114,182,0.14) row
background that sweeps in from the left over 0.3s and fades after 1.2s.
Block (e) stays highlighted a second longer when a level-up occurred, and takes a
#fbbf24-tinted background instead.
IMPLEMENTATION CONSTRAINT: render the code once and toggle CSS classes on refs to
the six block elements - do NOT re-render the code panel per animation step.

Caption bar at the bottom, border-top 1px rgba(244,114,182,0.12), font-mono 11px
rgba(255,255,255,0.45), prefixed "// ", which changes as blocks highlight:
  idle      VERBATIM: "// 왼쪽에서 운동을 기록하면 이 순서대로 실행됩니다"
  during    VERBATIM: "// 하나의 트랜잭션 안에서 전부 처리한다"
  level up  VERBATIM: "// 레벨업 여부는 서버가 판단해서 응답에 실어준다"

=== BLOCK C: THE FORWARD HOOK (required - do not drop) ===
Margin-top 32px, one paragraph, 16px leading-9, max-width 760px,
rgba(255,255,255,0.88), VERBATIM:
  "그런데 첫 버전에서는 이 계산을 전부 브라우저에서 했다.
   서버는 결과만 받아 저장했다. 그게 무슨 뜻인지는 다음 장에서 직접 해보시면 됩니다."
Emphasize "전부 브라우저에서 했다" in #f87171, font-bold.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s (stagger 0.03s)
0.70s  Paragraph 1, paragraph 2 at 1.20s
1.70s  The loop container and the code panel fade up together (y 20px -> 0, 0.6s)
2.30s  The four reward tiles pop in 0.07s apart; the EXP bar fills to its starting
       value (820/1000) over 0.5s
2.90s  A one-time pulse on the "기록하기" button (a soft pink ring, 2 pulses,
       0.9s each), disappearing permanently once the viewer submits

=== RESPONSIVE ===
< 1024px: stacked, loop first (height 420px), code panel below (height auto,
max 460px, internal vertical scroll).
< 640px: the log form's three inputs stack; reward tiles become a single column of
four; "LEVEL UP" text 26px; code font 11px with internal horizontal scroll (the
block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no particles, no spring overshoot, no glow bloom. The
level-up is conveyed by an instant color change and the text appearing without
animation. The 0.35s pause still applies (it is timing, not motion).
The form controls must be real labeled inputs; the submit must be a real <button>.
Announce the result ONCE per submission via aria-live="polite", VERBATIM pattern:
  "경험치 120 획득. 출석 4일 연속. 퀘스트 2/3."
and on level-up append VERBATIM: "레벨 5가 되었습니다."
The EXP bar needs role="progressbar" with aria-valuenow/min/max.
Code must be selectable, copyable text - never an image.

=== DO NOT ===
No full-screen flash on level up. No strobing. No more than 18 particles.
Do not fire the level-up burst more than once per session.
Do not re-render the code panel per highlight step.
Do not omit the forward hook paragraph.
No body imagery, no weight or diet framing.
```

---

## PAGE 03 — 트러블슈팅 01 · 직접 치트를 쳐보세요

**개발 실체**: 보상 계산을 클라이언트→서버로 옮긴 **전체 과정** (증상 → 재현 → 원인 → 이동 → 검증 → 한계)
**연출 장치**: **관람객에게 "EXP 조작하기" 버튼을 준다.** 진짜로 999999가 된다.

```text
Build a SECURITY TROUBLESHOOTING section that hands the viewer a working CHEAT
BUTTON, lets them set their EXP to an absurd value, and then explains that this
actually worked in the first version - followed by the full fix.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the client-side reward calculation problem:
symptom -> how it was discovered -> why it happened -> the fix (moving computation
to the server) -> verification -> what is still not fully solved.
All six parts are required.

=== MOOD ===
The moment a developer realizes something obvious in hindsight. Slightly
embarrassed, entirely honest, then methodical. Pink shifts toward red during the
demonstration, then back.

=== DESIGN TOKENS (use exactly) ===
background #140510 | panel #1e0a1a | primary pink #f472b6 | accent #f9a8d4
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #12060f, border rgba(244,114,182,0.18)
syntax: comments #8a5f7a, strings #a3e635, keywords #f472b6, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + stats font-mono 12px
easing cubic-bezier(0.34,1.56,0.64,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE CHEAT DEMO - full width, height ~340px
  Block C : root cause
  Block D : the fix (before/after code)
  Block E : verification
  Block F : remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "02 · 트러블슈팅 01"

HEADING (30px font-black):
  VERBATIM: "브라우저가 보내준 숫자를 믿으면 안 된다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "발견 경위"
  Body 16px leading-8, VERBATIM:
  "친구한테 테스트를 부탁했더니 30분 만에 레벨 40이 되어 있었다.
   운동을 한 게 아니라, 개발자 도구로 요청을 고쳐 보낸 거였다.
   그리고 서버는 그걸 그대로 저장했다."

=== BLOCK B: THE CHEAT DEMO (the defining idea of this page) ===
Margin-top 36px. A container, height ~340px, rounded-md,
border 1px rgba(244,114,182,0.20), background #1e0a1a, padding 24px.

Header strip: font-mono 10px rgba(255,255,255,0.46),
VERBATIM: "재현 · 첫 버전의 동작"

LEFT SIDE (~55%): a mock character panel
  Level readout, font-black 30px #f472b6, tabular-nums, format VERBATIM: "Lv.5"
  An EXP bar (10px track, pink fill) at 42%, with a readout beneath, font-mono 12px
  tabular-nums, format VERBATIM: "420 / 1000 EXP"
  Below that, a small stat list, font-mono 11px rgba(255,255,255,0.60), three rows
  VERBATIM: "누적 운동 12회" / "연속 출석 4일" / "완료 퀘스트 3개"

RIGHT SIDE (~45%): a mock request inspector
  A small panel, background #12060f, border 1px rgba(244,114,182,0.16),
  rounded-md, padding 14px, showing a JSON request body in font-mono 11px with
  syntax coloring - the exact payload the client would send, including an
  exp field. Roughly 8 lines.
  THE EXP VALUE IN THIS JSON IS EDITABLE: render it as an inline editable number
  with a dashed underline in #fbbf24. Changing it updates the displayed payload.

THE CHEAT BUTTON (centered beneath both sides):
  font-mono 13px font-black, padding 11px 24px, rounded-md,
  background rgba(248,113,113,0.14), border 1px rgba(248,113,113,0.45),
  color #f87171, VERBATIM: "EXP 조작해서 보내기"
  Hover: background rgba(248,113,113,0.22). Active: scale 0.97.

ON CLICK (this must actually change the mock state):
  t=0.00s  The button presses in; the JSON payload panel flashes
           rgba(248,113,113,0.14) for 0.3s
  t=0.20s  A small packet element travels from the payload panel to the character
           panel over 0.4s (transform only)
  t=0.60s  The character panel updates FOR REAL: level jumps to VERBATIM "Lv.99",
           the EXP readout becomes VERBATIM "999999 / 1000 EXP", the bar overfills
           past its track (clipped, with a red tint), and the stat list stays
           unchanged - VERBATIM "누적 운동 12회" - which is the tell.
  t=0.80s  A red marker points at the unchanged stat row, font-mono 10px #f87171,
           VERBATIM: "← 운동은 12회 그대로"
  t=1.10s  A message fades in over the container, max-width 500px, centered:
             Line 1, 18px, rgba(255,255,255,0.88), leading-9, VERBATIM:
               "방금 하신 게, 제 첫 버전에서는 실제로 통했습니다."
             Line 2, 18px, color #f87171, font-bold, margin-top 10px, VERBATIM:
               "서버는 검증 없이 받은 값을 저장했습니다."
           Reveal line 1 word by word (stagger 0.045s), line 2 after 0.5s.
  The message stays until the viewer clicks a reset control at the container's
  bottom-right, font-mono 11px rgba(255,255,255,0.46), VERBATIM: "↻ 되돌리기"

A note under the container, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "이 화면은 재현용 시뮬레이션입니다. 실제 서버에 요청을 보내지 않습니다."

=== BLOCK C: ROOT CAUSE ===
Margin-top 40px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인"
  Body 16px leading-8, VERBATIM:
  "보상 계산을 프론트에 둔 이유는 단순했다. 화면에 바로 반영하고 싶었고,
   그러려면 클라이언트가 결과를 알아야 한다고 생각했다.
   그런데 「화면에 먼저 보여주는 것」과 「그 값을 신뢰하는 것」은 완전히 다른 문제였다."
  Emphasize "완전히 다른 문제였다" in #fcd34d... use #f9a8d4, font-bold.

=== BLOCK D: THE FIX (before / after code) ===
Margin-top 36px. Two code panels, side by side above 1024px, stacked below, gap 16px.
Each: background #12060f, border 1px, rounded-md, header with three window dots and
a filename, body font-mono 12px with a line-number gutter.

  BEFORE panel - border 1px rgba(248,113,113,0.28),
    filename VERBATIM: "useWorkoutSubmit.ts (before)"
    CONTENT: ~14 lines. A client hook that computes the EXP amount locally from the
    workout input, updates local character state optimistically, and POSTs a body
    containing BOTH the workout data AND the computed exp/level values.
    HIGHLIGHT the line that puts the computed exp into the request body with
    rgba(248,113,113,0.12), and add an inline marker at its right edge,
    font-mono 10px #f87171, VERBATIM: "← 이 값을 서버가 믿었다"

  AFTER panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "useWorkoutSubmit.ts (after) + WorkoutController.java"
    CONTENT: ~20 lines split into two labeled halves by a comment divider.
    The client half POSTs ONLY the raw workout facts (exercise, sets, minutes) and
    then applies whatever character state the server returns.
    The server half recomputes the reward from the persisted workout history, using
    the authenticated principal's id from the token rather than any id in the body,
    and returns the authoritative character state.
    HIGHLIGHT: the client's request body line (now free of exp) and the server's
    "derive user id from the token, not the request" line, both with
    rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "클라이언트는 「무엇을 했는지」만 보낸다. 「얼마를 받을지」는 서버가 정한다."

An additional short note below both panels, 15px leading-8, VERBATIM:
  "낙관적 업데이트 자체를 없앤 건 아니다. 화면에는 예상값을 먼저 그리되,
   서버 응답이 오면 그 값으로 덮어쓴다. 두 값이 다르면 서버가 이긴다."
Emphasize "서버가 이긴다" in #4ade80, font-bold.

=== BLOCK E: VERIFICATION ===
Margin-top 36px. Three stat cells in a row, gap 12px (stacks below 640px).
Each: padding 16px, rounded-md, border 1px rgba(74,222,128,0.22),
background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "거부"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "조작된 exp 값 전송 시"
  Cell 2  value VERBATIM "6곳"   label VERBATIM "서버로 옮긴 계산 지점"
  Cell 3  value VERBATIM "0건"   label VERBATIM "이후 비정상 레벨 발생"
Values fade/count in on entry.
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "직접 요청을 고쳐 보내는 방식으로 확인했습니다. 자동화된 보안 테스트는 없습니다."

=== BLOCK F: REMAINING LIMITS (required - do not remove) ===
Margin-top 30px, padding 20px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "운동을 실제로 했는지는 여전히 검증할 수 없다. 「스쿼트 100세트」를 막을 방법이 없다."
    "요청 빈도 제한을 걸지 않았다. 짧은 시간에 여러 번 기록하는 걸 막지 못한다."
    "이상 패턴 탐지 같은 건 아예 없다. 규모가 커지면 필요할 것이다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left (x -12px -> 0)
1.10s  Cheat demo container fades up (y 18px -> 0, 0.6s)
1.70s  A one-time pulse on the cheat button (a soft red ring, 2 pulses, 0.9s each),
       with a hint beside it, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "눌러보세요"
       Both disappear permanently once the button is used.
Root cause, code, verification and limits animate on their own viewport entry.

=== RESPONSIVE ===
< 1024px: code panels stack (before on top); the cheat demo's two sides stack
(character panel first).
< 640px: the JSON payload panel gets internal horizontal scroll; the message text
17px; code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no packet travel, no button pulse, no spring overshoot.
The cheat still applies instantly and the message appears without word-by-word
reveal.
The cheat button must be a real <button> with a visible focus ring
(2px #f87171, offset 2px) and an accessible name that makes its purpose clear.
The editable EXP value must be a real labeled input, not a contenteditable span.
Announce the cheat result ONCE via aria-live="polite", VERBATIM:
  "조작된 값이 그대로 반영되었습니다. 첫 버전의 취약점 재현입니다."

=== DO NOT ===
Do not send any real network request from this section.
Do not present this as a general hacking tutorial - it is a reproduction of one
specific bug in this project.
Do not remove the "재현용 시뮬레이션" disclaimer or the remaining-limits card.
No body imagery.
```

---

## PAGE 04 — 로그인은 두 갈래로 들어온다 · JWT + Google OAuth

**개발 실체**: JWT 자체 로그인 + Google OAuth 연동 + **토큰 발급/갱신 코드**
**연출 장치**: 두 경로를 나란히 그린 흐름도 — 관람객이 경로를 선택하면 그 갈래만 점등되고 코드가 따라옴

```text
Build an AUTHENTICATION section that draws two parallel login paths - a local
email/password flow and a Google OAuth flow - and lights up whichever path the
viewer selects, with the corresponding token-issuing code appearing alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. That two login paths converge on ONE internal token
2. Where the token is created, what is inside it, and how it is refreshed
3. The concrete reason OAuth was added rather than only local login

=== MOOD ===
The character sheet's "how do you enter this world" page. Neon pink, orderly,
diagrammatic. Calmer than the surrounding pages.

=== DESIGN TOKENS (use exactly) ===
background #140510 | panel #1e0a1a | primary pink #f472b6 | accent #f9a8d4
ok #4ade80 | bad #f87171 | warn #fbbf24 | google blue #7dd3fc
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #12060f, border rgba(244,114,182,0.18)
syntax: comments #8a5f7a, strings #a3e635, keywords #f472b6, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + diagram labels font-mono
easing cubic-bezier(0.34,1.56,0.64,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1040px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the path selector (2 buttons), centered
  Block C : THE FLOW DIAGRAM - full width, height 400px
  Block D : the token payload panel + the refresh code panel, side by side
  Block E : the "why OAuth" note

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "03 · 인증"

HEADING (28px font-black):
  VERBATIM: "들어오는 문은 두 개, 안에서 쓰는 열쇠는 하나"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "이메일로 가입한 사용자와 구글로 들어온 사용자가 있다.
             그런데 로그인 이후의 모든 요청은 똑같이 처리되어야 한다.
             그래서 두 경로가 만나는 지점을 하나로 만들었다."
  Emphasize "두 경로가 만나는 지점을 하나로" in #f9a8d4, font-bold.

=== BLOCK B: THE PATH SELECTOR ===
A segmented control, centered, margin-top 32px.
Container: inline-flex, background #12060f, border 1px rgba(244,114,182,0.22),
rounded-md, padding 4px.
Two buttons, font-mono 12px, padding 9px 22px, rounded:
  VERBATIM "이메일 로그인"  |  VERBATIM "Google 로그인"
Active: background rgba(244,114,182,0.14), color #f472b6, with a 2px pink indicator
bar sliding beneath (0.3s spring - it must slide, never jump).
Default: 이메일 로그인.

=== BLOCK C: THE FLOW DIAGRAM (the defining idea) ===
Container: height 400px, background #1e0a1a, border 1px rgba(244,114,182,0.20),
rounded-md, padding 26px. Draw in SVG so strokes can animate.

TWO PARALLEL LANES running left to right across the upper two thirds, then MERGING
into a single lane in the lower third.

  LANE A (top, y ~22%) - EMAIL PATH. Four nodes, each a 132x50px rounded rect:
    VERBATIM "브라우저"  ->  "POST /auth/login"  ->  "비밀번호 검증"  ->  "토큰 발급"
  LANE B (middle, y ~48%) - GOOGLE PATH. Five nodes, each 118x50px:
    VERBATIM "브라우저"  ->  "Google 동의 화면"  ->  "authorization code"
    ->  "구글에 코드 교환"  ->  "토큰 발급"
    The "Google 동의 화면" node is tinted #7dd3fc instead of pink.
  MERGE NODE (bottom, y ~80%, centered, 220x58px, border 2px #f472b6):
    VERBATIM "우리 서비스 JWT 발급"
    Both lanes' final nodes connect down into it with curved edges.
  Below the merge node, one more node (180x46px):
    VERBATIM "이후 모든 API 요청"

NODE STYLING: background rgba(244,114,182,0.05),
border 1px rgba(244,114,182,0.28), label font-mono 11px rgba(255,255,255,0.80).
Inactive lane (the one not selected) dims to 35% opacity with a
rgba(255,255,255,0.14) border.

THE ACTIVE-PATH ANIMATION (on selector change, and on first entry):
  t=0.00s  The inactive lane dims over 0.3s.
  t=0.10s  A pink token dot enters at the active lane's first node and travels
           node to node, 0.35s per hop, pausing 0.15s at each node - and each node
           it reaches lights up (border -> #f472b6, background ->
           rgba(244,114,182,0.12)) and stays lit.
  t=(end)  The dot drops into the MERGE NODE, which pulses once (0.5s glow,
           box-shadow 0 0 30px rgba(244,114,182,0.20)), then continues to the
           final node.
  Total: about 1.8s for lane A, 2.3s for lane B.
  Animate the dot with transform only.

Beside each node, a tiny annotation appears as the dot passes it, font-mono 9px
rgba(255,255,255,0.42), fading in and staying. Annotations VERBATIM:
  Lane A: "이메일 + 비밀번호" / "해시 비교" / "사용자 조회" / "액세스 + 리프레시"
  Lane B: "리다이렉트" / "사용자 동의" / "임시 코드 수신" / "구글에서 프로필 확인"
          / "우리 사용자와 매칭"

A caption below the diagram, 15px leading-8, VERBATIM:
  "구글은 「이 사람이 누구인지」까지만 알려준다.
   「우리 서비스에서 뭘 할 수 있는지」는 우리가 발급한 토큰이 정한다."

=== BLOCK D: TOKEN PAYLOAD + REFRESH CODE ===
Margin-top 44px. Two panels side by side, gap 16px (stack below 1024px).
Each: background #12060f, border 1px rgba(244,114,182,0.18), rounded-md, header bar
with three window dots and a filename in font-mono 11px rgba(255,255,255,0.45).

LEFT PANEL - filename VERBATIM: "JWT payload (decoded)"
  Body: a JSON object, ~10 lines, with a subject (user id), a display name, a
  provider field, a roles array, an issued-at and an expiry.
  THE PROVIDER FIELD CHANGES with the path selector: it re-types character by
  character (0.3s) between VERBATIM "LOCAL" and VERBATIM "GOOGLE", and its row
  takes a rgba(244,114,182,0.12) background for 1.2s.
  Everything ELSE in the payload stays identical between the two paths - that
  sameness is the point, so do not vary any other field.
  Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
    "provider 말고는 전부 같다. 그래서 이후 코드가 분기하지 않는다."
  A footnote at the very bottom, font-mono 9px rgba(255,255,255,0.30),
  VERBATIM: "예시 페이로드 · 실제 토큰 아님"

RIGHT PANEL - filename VERBATIM: "TokenService.java"
  Body: ~18 lines. A service that issues a short-lived access token and a
  longer-lived refresh token, stores the refresh token's identifier server-side so
  it can be revoked, validates an incoming refresh token against that store, and
  rotates it (issuing a new refresh token and invalidating the old one) on each
  refresh.
  HIGHLIGHT ROWS: the refresh-token rotation line and the revocation-check line
  (background rgba(244,114,182,0.10)).
  Caption bar, VERBATIM:
    "리프레시 토큰을 서버에 안 들고 있으면, 로그아웃이 의미가 없어진다"

=== BLOCK E: THE "WHY OAUTH" NOTE ===
Margin-top 36px, padding 20px, rounded-md, border 1px rgba(244,114,182,0.22),
background rgba(244,114,182,0.04), border-left 3px #f472b6.
  Label font-mono 10px letter-spacing 0.18em #f472b6, VERBATIM: "왜 구글 로그인을 넣었나"
  Body 15px leading-8, VERBATIM:
  "운동 기록 앱은 첫 진입 장벽이 낮아야 한다.
   가입 폼을 채우는 3분 동안 대부분 나간다는 걸 테스트에서 봤다.
   구글 로그인을 붙이고 나서는 「일단 들어와서 둘러보는」 경우가 늘었다.
   숫자로 재본 건 아니고, 테스트 참여자들의 반응이 그랬다."
  The last sentence's honesty is required - keep it.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Paragraph
1.10s  Path selector fades up; the indicator bar draws
1.40s  Diagram container fades up; all nodes draw their outlines 0.06s apart
       (stroke-dashoffset sweep, 0.4s each), edges draw after
2.60s  The active path's token dot begins traveling
Panels D and note E animate on their own viewport entry.

=== PERFORMANCE ===
The token dot animation stops when the diagram is out of the viewport or the tab is
hidden, and restarts from the beginning on return.

=== RESPONSIVE ===
< 1024px: panels stack (payload first). Diagram height 460px with lanes wrapping to
two rows each.
< 640px: the diagram becomes a VERTICAL flow - the active path renders as a single
top-to-bottom column of nodes, and the inactive path is replaced by a collapsed
summary chip, font-mono 10px, VERBATIM: "다른 경로 보기" that switches the selector.
Code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no traveling dot (the active path renders fully lit
immediately), no dimming transition, no sliding indicator.
The path selector is a real radiogroup, arrow-key navigable, with visible focus
rings (2px #f472b6, offset 2px).
Provide a visually-hidden ordered text description of BOTH paths and the merge
point, so the diagram is fully available to screen readers.
Announce path changes once via aria-live="polite".

=== DO NOT ===
Do not show a real JWT string or signature - decoded payload only, with the
"예시 페이로드" footnote.
Do not use real Google branding assets or logos - a tinted node labeled in text
only.
Do not claim conversion metrics; the honesty sentence in Block E must stay.
```

---

## PAGE 05 — 혼자 하는 운동이 아니게 만든 것 · 실시간 라운지

**개발 실체**: **REST와 분리된 Socket.IO 실시간 서버** — 라운지 접속자 위치 동기화 · 채팅 · 이모트 · 친구 DM
**연출 장치**: **관람객이 라운지 안의 캐릭터를 직접 움직인다.** 다른 캐릭터들도 알아서 움직이고 있다

> 🔵 **2026-07-31 전면 교체됨.** 이전 버전은 「실시간 챌린지 피드」 + `SSE` 기준이었는데,
> 실제 저장소의 실시간 기능은 **챌린지 피드가 아니라 「라운지」** 이고 **Socket.IO** 입니다.
> 근거 (`Ajou_MuscleUp/realtime/`):
> `ROOM_NAME = "lounge"` · `MAP_WIDTH 2000` / `MAP_HEIGHT 1200` ·
> 이벤트 `lounge:join` `lounge:welcome` `lounge:players` `player:move` `chat:send` `chat:typing`
> `social:emote` `social:sticker` `party:follow-request` `friend:send` 등 ·
> 별도 Node 서버(포트 `4001`) · 프론트 `socket.io-client ^4.8.1` (`Lounge.tsx` / `Friends.tsx`)

```text
Build a REAL-TIME LOUNGE section where the viewer moves their own character around a
shared 2D floor with arrow keys or drag, while other characters move, chat and emote
on their own, with the actual socket event names shown live in a log beside it.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
All peers are simulated locally - do NOT open a real network connection.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. Why this feature could not sit on the REST backend (it is bidirectional and
   changes many times per second), and why a SEPARATE realtime server was the answer
2. The actual socket event names and what each one carries
3. The scoping decision: one shared lounge room vs per-pair friend rooms

=== MOOD ===
A shared gym floor at 9pm. Other people are here and you can feel it.
Neon pink, communal, kinetic but not chaotic.
NO body imagery, NO muscle rendering, NO photos - characters are abstract capsule
silhouettes with an initial and a tier ring. Nothing anatomical.

=== DESIGN TOKENS (use exactly) ===
background #140510 | panel #1e0a1a | primary pink #f472b6 | accent #f9a8d4
ok #4ade80 | bad #f87171 | warn #fbbf24 | wire #7dd3fc
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #12060f, border rgba(244,114,182,0.18)
syntax: comments #8a5f7a, strings #a3e635, keywords #f472b6, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.34,1.56,0.64,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1080px, padding-block 120px.
  Block A : label + heading + two paragraphs
  Block B : a two-column split, gap 18px
              LEFT  (58%) : THE LOUNGE FLOOR, height 440px
              RIGHT (42%) : the live socket event log, height 440px
            Below 1024px stacks, floor first.
  Block C : the two-server architecture strip
  Block D : the room-scoping decision card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "04 · 실시간 라운지"

HEADING (28px font-black):
  VERBATIM: "옆에 누가 있다는 감각"

PARAGRAPH 1 (16px leading-9, margin-top 20px):
  VERBATIM: "혼자 하는 기록은 3일이면 지친다.
             같은 시간에 누가 접속해 있다는 걸 알면 얘기가 달라진다."

PARAGRAPH 2 (16px leading-9, margin-top 18px):
  VERBATIM: "그런데 이건 게시글처럼 「요청하면 준다」로는 안 됐다.
             위치는 초당 여러 번 바뀌고, 방향이 양쪽이다."
  Emphasize "위치는 초당 여러 번 바뀌고, 방향이 양쪽이다" in #f9a8d4, font-bold.

=== BLOCK B LEFT: THE LOUNGE FLOOR (the defining idea) ===
Container: height 440px, rounded-md, border 1px rgba(244,114,182,0.20),
background #1e0a1a, overflow hidden, position relative.

Header strip (34px, border-bottom 1px rgba(244,114,182,0.12)):
  left  font-mono 11px rgba(255,255,255,0.72), VERBATIM: "라운지 · 접속 5"
  right a live chip: a 7px #4ade80 dot with a 1.6s pulsing halo plus font-mono 11px
        rgba(255,255,255,0.46), VERBATIM: "연결됨"

THE FLOOR (fills the rest):
  A subtle grid in rgba(244,114,182,0.05), 40px spacing, to make movement readable.
  A coordinate label in the bottom-right corner, font-mono 9px
  rgba(255,255,255,0.30), showing the map bounds, VERBATIM: "2000 × 1200"
  (these are the real MAP_WIDTH / MAP_HEIGHT values - keep them exactly).

  FIVE CHARACTERS, each a 30px capsule silhouette (rounded rect, NOT a human figure):
    - a 2px ring whose color encodes tier, with a font-mono 8px tier label beneath
      Tier ring colors: BRONZE #a97142 · SILVER #c0c0c0 · GOLD #fbbf24 ·
      PLATINUM #7dd3fc · DIAMOND #bfdbfe · MASTER #c084fc ·
      GRANDMASTER #f472b6 · CHALLENGER #f87171
    - a single initial centered, font-mono 11px
    - a nickname beneath, font-mono 10px rgba(255,255,255,0.60)
  Names VERBATIM: "나" / "참가자 B" / "참가자 C" / "참가자 D" / "참가자 E"
  Tiers VERBATIM: "GOLD" / "SILVER" / "PLATINUM" / "BRONZE" / "DIAMOND"

  THE VIEWER CONTROLS "나":
    Arrow keys OR WASD OR dragging the capsule moves it.
    IMPORTANT: capture these keys ONLY while the floor container has focus or the
    pointer is inside it. Never bind arrow keys globally - the page must still
    scroll normally everywhere else.
    Movement is CLAMPED to the floor bounds (this mirrors the real clamp() in
    rooms.ts - when the viewer pushes against an edge, show a brief 0.2s pink edge
    glow on that side, and log a clamped coordinate).
    Position updates are THROTTLED to ~20/second, and each one emits a
    "player:move" line into the log panel.

  THE OTHER FOUR MOVE ON THEIR OWN: slow wandering with eased direction changes
  every 1.8-4.0s. Every 4-9s one of them does one of:
    - a chat bubble above the capsule, max 18 chars, fading after 3s
      Bubbles VERBATIM (cycle): "오늘 하체 끝" · "3세트 남음" · "같이 하실 분" · "굿"
    - a typing indicator (three bouncing dots) for 1.2s BEFORE a bubble
    - an emote: a small symbol popping up and floating 20px over 0.9s
      Emotes VERBATIM (cycle): "💪" · "🔥" · "👏"

AUTONOMOUS BY DESIGN: the other four move whether or not the viewer does anything.
Caption at the container's bottom-left, font-mono 10px rgba(255,255,255,0.32),
VERBATIM: "화살표 키로 움직여보세요 · 시연용 데이터"

PERFORMANCE (required): the movement loop must stop when the container is out of the
viewport and when the tab is hidden, and resume on return without resetting
positions. Use ONE requestAnimationFrame loop for all five characters and the log.
Move characters with transform only - never animate left/top.

=== BLOCK B RIGHT: THE LIVE SOCKET EVENT LOG ===
Container: height 440px, background #12060f, border 1px rgba(244,114,182,0.18),
rounded-md, header with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "socket events"

Body: a scrolling monospace log, font-mono 11px, newest at the BOTTOM, auto-scrolled,
max ~22 visible lines, oldest removed. Each line:
  a timestamp in rgba(255,255,255,0.30),
  the event name in #f472b6,
  and a compact payload in rgba(255,255,255,0.55).

USE THESE EXACT EVENT NAMES (they are the real ones - do not invent others):
  "lounge:join"       payload {nickname, level, tier}
  "lounge:welcome"    payload {mapSize}
  "lounge:players"    payload {players: 5}
  "player:move"       payload {x, y}          <- emitted as the viewer moves
  "chat:typing"       payload {isTyping}
  "chat:send"         payload {message}
  "chat:message"      payload {from, message}
  "social:emote"      payload {emote}

Lines caused by the VIEWER'S OWN movement get a 2px #f472b6 left bar so it is
obvious which events the viewer is generating. Incoming (peer) events get a 2px
#7dd3fc left bar.
A legend strip at the panel's bottom, font-mono 9px, VERBATIM:
  "분홍 = 내가 보냄 · 파랑 = 받음"

=== BLOCK C: THE TWO-SERVER ARCHITECTURE STRIP ===
Margin-top 36px. A horizontal diagram, height ~150px, drawn in SVG.

  LEFT box  (rounded rect 200x64): VERBATIM "브라우저"
  Two SEPARATE lines leave it and go to two SEPARATE right-hand boxes:
    UPPER line, solid, rgba(244,114,182,0.55), labeled font-mono 10px,
      VERBATIM: "HTTP · 기록/커뮤니티/인증"
      to a box VERBATIM: "Spring Boot" with a sub-line font-mono 9px
      rgba(255,255,255,0.40), VERBATIM: "REST · MySQL"
    LOWER line, animated dashed (dash offset scrolling both directions to show it is
      bidirectional), #7dd3fc, labeled font-mono 10px,
      VERBATIM: "WebSocket · 위치/채팅/이모트"
      to a box VERBATIM: "Node · Socket.IO" with a sub-line font-mono 9px
      rgba(255,255,255,0.40), VERBATIM: "포트 4001 · 인메모리 상태"

A caption beneath, 15px leading-8, max-width 780px, VERBATIM:
  "두 서버는 데이터베이스를 공유하지 않는다.
   라운지 상태는 서버가 꺼지면 사라져도 되는 정보라서, 아예 메모리에만 뒀다."
Emphasize "꺼지면 사라져도 되는 정보라서" in #f9a8d4, font-bold.

=== BLOCK D: THE ROOM-SCOPING DECISION CARD ===
Margin-top 32px, padding 22px, rounded-md, border 1px rgba(244,114,182,0.22),
background rgba(244,114,182,0.04), border-left 3px #f472b6.
  Label font-mono 10px letter-spacing 0.18em #f472b6, VERBATIM: "설계에서 나눈 것"
  Body 15px leading-8, VERBATIM:
  "라운지는 모두가 같은 방에 있어야 의미가 있어서 방을 하나만 뒀다.
   그런데 친구끼리 주고받는 메시지까지 그 방으로 보내면 전부에게 보인다.
   그래서 친구 대화는 두 사람의 아이디로 만든 별도의 방으로 분리했다.
   같은 서버 안에서 방을 나누는 기준이 곧 프라이버시 경계가 됐다."
  Emphasize "방을 나누는 기준이 곧 프라이버시 경계" in #f9a8d4, font-bold.

  Below the body, a two-cell comparison, gap 12px, font-mono 11px:
    Cell 1 border 1px rgba(244,114,182,0.20), padding 12px:
      title VERBATIM "lounge"      body VERBATIM "방 1개 · 전원 브로드캐스트"
    Cell 2 border 1px rgba(125,211,252,0.20), padding 12px:
      title VERBATIM "friend room"  body VERBATIM "두 아이디로 방 생성 · 당사자만"

=== LIMITS NOTE (required) ===
Margin-top 26px, font-mono 11px rgba(255,255,255,0.40), a 3-item list prefixed "· ",
VERBATIM:
  "라운지 상태를 메모리에만 두기 때문에 실시간 서버를 여러 대로 늘리면 지금 구조로는 안 됩니다."
  "동시 접속이 몇 명까지 버티는지는 재보지 않았습니다."
  "이동 좌표를 그대로 신뢰합니다. 속도 검증은 없습니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Paragraphs 1 and 2, 0.5s apart
1.40s  Floor container fades up (y 18px -> 0, 0.6s)
1.80s  The four peers fade in one by one, 0.10s apart, then start wandering
2.30s  "나" fades in last with a 2-pulse pink ring and a hint, font-mono 10px
       rgba(255,255,255,0.35), VERBATIM: "화살표 키로 움직여보세요"
       The hint disappears permanently on the first movement.
2.60s  The log panel starts filling from the join handshake
       ("lounge:join" -> "lounge:welcome" -> "lounge:players")
Block C and D animate on their own viewport entry.

=== RESPONSIVE ===
< 1024px: the split stacks, floor first; the log panel drops to height 260px.
< 720px: the floor drops to height 320px; replace keyboard control with DRAG on the
capsule and change the caption to VERBATIM: "캐릭터를 끌어보세요 · 시연용 데이터";
the architecture diagram stacks vertically.
< 640px: log font 10px, payloads truncated with an ellipsis, panel scrolls
internally (never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: peers hold still and only change position on a slow 3s
interval with no easing; no emote float; no dashed-line animation; no ring pulse.
The floor is a focusable region (tabindex 0) with a visible focus ring
(2px #f472b6, offset 2px) and an accessible name, VERBATIM: "라운지 시연 영역".
The event log is decorative motion - mark it aria-hidden and provide ONE
visually-hidden summary instead, VERBATIM:
  "소켓 이벤트 로그입니다. 내 캐릭터가 움직일 때 위치 이벤트가 전송됩니다."
Do NOT put aria-live on the log - it changes ~20 times per second.
Tier is never conveyed by ring color alone - the text label under each capsule
always states it.

=== DO NOT ===
Do NOT render bodies, muscles, body-fat levels, weight numbers, or anything
anatomical. Capsule silhouettes only. This rule outranks any visual ambition here.
Do NOT bind arrow keys or WASD globally - only while the floor is focused or hovered.
Do NOT invent socket event names - use only the eight listed above.
Do NOT claim a concurrent-user capacity - the limits note says it was never measured.
Do NOT animate left/top for movement - transform only.
```

## PAGE 06 — 트러블슈팅 02 · 출석이 두 번 찍혔다

**개발 실체**: 중복 요청으로 인한 보상 이중 지급 → **멱등성 처리 전체 과정**
**연출 장치**: **"두 번 빠르게 누르기" 버튼** — 관람객이 직접 중복 지급을 발생시킨다

```text
Build a TROUBLESHOOTING section about duplicate reward grants, where the viewer can
fire two rapid requests themselves and watch the reward be granted twice, then
follows the full diagnosis and the idempotency fix.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
All requests are simulated locally.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
The complete process for the double-grant bug:
symptom -> reproduction -> elimination of suspects -> root cause (race between two
concurrent requests) -> the fix (unique constraint + idempotency) -> verification
-> remaining limits. All seven parts required.

=== MOOD ===
Two things happening at the same instant that should not have. Precise, a bit
uneasy, then resolved. Pink with red accents during the demonstration.

=== DESIGN TOKENS (use exactly) ===
background #140510 | panel #1e0a1a | primary pink #f472b6 | accent #f9a8d4
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #12060f, border rgba(244,114,182,0.18)
syntax: comments #8a5f7a, strings #a3e635, keywords #f472b6, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + labels font-mono 12px
easing cubic-bezier(0.34,1.56,0.64,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1000px, padding-block 120px.
  Block A : label + heading + symptom card
  Block B : THE RACE DEMO - full width, height ~380px
  Block C : elimination table
  Block D : root cause (a timeline diagram)
  Block E : the fix (before/after code)
  Block F : verification + remaining limits

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL (font-mono 11px, letter-spacing 0.25em, color #f87171):
  "05 · 트러블슈팅 02"

HEADING (30px font-black):
  VERBATIM: "출석 버튼을 두 번 누르면 이틀이 찍혔다"

--- SYMPTOM CARD ---
Margin-top 24px, padding 20px, rounded-md, border 1px rgba(248,113,113,0.28),
background rgba(248,113,113,0.05), border-left 3px #f87171.
  Label font-mono 10px letter-spacing 0.18em #f87171, VERBATIM: "증상"
  Body 16px leading-8, VERBATIM:
  "출석 체크 버튼을 빠르게 두 번 누르면 연속 출석이 2 올라갔다.
   느리게 두 번 누르면 정상이었다. 그래서 한동안 재현이 안 돼서 못 잡았다."

=== BLOCK B: THE RACE DEMO (the defining idea) ===
Margin-top 36px. Container, height ~380px, rounded-md,
border 1px rgba(244,114,182,0.20), background #1e0a1a, padding 24px.

Header strip: font-mono 10px rgba(255,255,255,0.46),
VERBATIM: "재현 · 수정 전 동작"

A MODE TOGGLE at the top-right, font-mono 11px, two options:
  VERBATIM "수정 전"  |  VERBATIM "수정 후"
Default: 수정 전. Active gets background rgba(244,114,182,0.14), color #f472b6.

LEFT SIDE (~46%) - THE ATTENDANCE PANEL
  A big streak readout, font-black 40px #f472b6, tabular-nums,
  format VERBATIM: "4일"
  Label beneath, font-mono 11px rgba(255,255,255,0.46), VERBATIM: "연속 출석"
  Below it, a 7-day dot row (7 circles, 14px): filled #f472b6 for checked days,
  outlined rgba(255,255,255,0.14) for unchecked.
  Below that, an EXP readout, font-mono 12px tabular-nums,
  format VERBATIM: "누적 1240 EXP"

RIGHT SIDE (~54%) - THE REQUEST LOG
  A panel, background #12060f, border 1px rgba(244,114,182,0.16), rounded-md,
  padding 14px, showing a request log in font-mono 10px, line-height 1.9, max 6
  lines. Each line format VERBATIM pattern:
    "21:04:11.208  POST /attendance  →  200  streak 5"
  with the timestamp rgba(255,255,255,0.35), the method/path
  rgba(255,255,255,0.60), the status colored (#4ade80 for 200, #fbbf24 for 409),
  and the result in #f9a8d4.
  Millisecond precision is required - it is what makes the race visible.

THE BUTTON (centered beneath both sides):
  font-mono 13px font-black, padding 11px 26px, rounded-md,
  background rgba(244,114,182,0.14), border 1px rgba(244,114,182,0.45),
  color #f472b6, VERBATIM: "출석 체크 · 빠르게 두 번 보내기"

ON CLICK, IN "수정 전" MODE:
  t=0.00s  TWO request markers depart simultaneously from the button toward the
           log panel, fanned vertically (-10px, +10px), 0.35s travel, transform only
  t=0.35s  Two log lines appear at nearly identical timestamps (differing by ~8ms),
           BOTH with status 200, the first showing streak 5 and the second ALSO
           showing streak 5 - then correcting to 6 with a red flash
  t=0.60s  The streak readout jumps VERBATIM "4일" -> VERBATIM "6일" with a red
           tint flash (rgba(248,113,113,0.14), 0.4s), skipping 5
  t=0.70s  Two dots in the 7-day row fill at once, and a red marker points at them,
           font-mono 10px #f87171, VERBATIM: "← 하루에 이틀"
  t=0.90s  The EXP readout jumps by double the normal amount
  t=1.20s  A message fades in, 17px leading-9, max-width 460px, VERBATIM:
             "요청 두 개가 8밀리초 차이로 도착했습니다.
              둘 다 「오늘은 아직 출석 안 했음」을 읽고 통과했습니다."
           Emphasize "둘 다" in #f87171, font-bold.

ON CLICK, IN "수정 후" MODE:
  Same two markers depart. The first log line is 200 with streak 5.
  The SECOND log line is status 409 in #fbbf24, with result VERBATIM "중복 무시"
  and a small green marker beside the streak readout, font-mono 10px #4ade80,
  VERBATIM: "← 한 번만 반영"
  The streak goes 4일 -> 5일. One dot fills. EXP increases once.

A reset control at the container's bottom-right, font-mono 11px,
rgba(255,255,255,0.46), VERBATIM: "↻ 되돌리기"
A note under the container, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "재현용 시뮬레이션입니다. 실제 서버에 요청을 보내지 않습니다."

=== BLOCK C: ELIMINATION TABLE ===
Margin-top 44px. Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
VERBATIM: "의심한 것들"
A 3-column table, font-mono 12px, row separators 1px rgba(255,255,255,0.08),
row padding 13px. Headers VERBATIM: "의심" | "확인 방법" | "결과"
Rows (eliminated rows' 결과 cell rgba(255,255,255,0.46) with "✕ " prefix; the
confirmed row's cell #f87171 with "● " prefix):
  "버튼이 두 번 눌린다"      | "클릭 핸들러에 로그 추가"        | "✕ 한 번만 호출됨"
  "프론트에서 재시도한다"    | "네트워크 탭에서 요청 수 확인"    | "✕ 재시도 없음"
  "리액트가 두 번 렌더한다"  | "StrictMode 끄고 재현"           | "✕ 그대로 재현됨"
  "요청 두 개가 동시에 처리됨"| "서버 로그 타임스탬프 비교"      | "● 8ms 차이"
Rows reveal 0.16s apart on entry, sliding in from x -10px. The confirmed row lands
last and grows a 2px #f87171 left bar over 0.5s.

=== BLOCK D: ROOT CAUSE (a timeline diagram) ===
Margin-top 40px, padding 24px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05).
  Label font-mono 10px letter-spacing 0.18em #fbbf24, VERBATIM: "원인 · 두 요청의 시간표"
  A horizontal timeline, height ~150px, drawn in SVG, with TWO parallel tracks
  (요청 A on top, 요청 B below) and a shared millisecond axis (0ms to 40ms with
  ticks every 10ms, font-mono 9px rgba(255,255,255,0.35)).
  Each track has four labeled steps as small rounded blocks:
    VERBATIM "출석 여부 조회" -> "미출석 확인" -> "출석 기록 저장" -> "보상 지급"
  Track A's blocks start at 0ms; Track B's start at 8ms.
  A vertical dashed red line at ~14ms marks where BOTH tracks have already passed
  "미출석 확인", with a label, font-mono 10px #f87171, VERBATIM:
    "둘 다 「아직 안 함」으로 읽은 시점"
  Blocks appear left to right, 0.12s apart, then the red line drops in and pulses
  once.
  Below the diagram, body 16px leading-8, VERBATIM:
  "읽고 나서 쓰기까지의 사이가 문제였다. 그 틈에 두 번째 요청이 똑같은 값을 읽었다.
   애플리케이션 코드에서 아무리 잘 확인해도, 확인과 저장이 하나의 원자적 동작이
   아니면 이 틈은 계속 생긴다."
  Emphasize "확인과 저장이 하나의 원자적 동작이 아니면" in #fcd34d... use #fbbf24,
  font-bold.

=== BLOCK E: THE FIX (before / after code) ===
Margin-top 40px. Two code panels, side by side above 1024px, stacked below, gap 16px.
Each: background #12060f, border 1px, rounded-md, header with three window dots and
a filename, body font-mono 12px with a line-number gutter.

  BEFORE panel - border 1px rgba(248,113,113,0.28),
    filename VERBATIM: "AttendanceService.java (before)"
    CONTENT: ~12 lines. Reads today's attendance record, returns early if one
    exists, otherwise creates a record and grants the reward.
    HIGHLIGHT the "read then check" pair with rgba(248,113,113,0.12) and add an
    inline marker at the check row's right edge, font-mono 10px #f87171,
    VERBATIM: "← 여기와 저장 사이가 열려 있다"

  AFTER panel - border 1px rgba(74,222,128,0.28),
    filename VERBATIM: "AttendanceService.java (after)"
    CONTENT: ~18 lines. The same method, but: it INSERTS first, relying on a unique
    constraint on (user id, date) at the database level; it catches the duplicate-key
    exception and returns the already-recorded result instead of granting again; the
    reward grant happens in the same transaction as the insert; and a comment notes
    the accompanying migration that adds the unique index.
    HIGHLIGHT: the insert-first line and the duplicate-key catch line with
    rgba(74,222,128,0.12).
    Caption bar, font-mono 11px, prefixed "// ", VERBATIM:
      "먼저 확인하지 말고, 먼저 넣고 실패를 처리한다"

  Below both panels, a one-line migration chip, font-mono 11px, background #12060f,
  border 1px rgba(244,114,182,0.20), rounded, padding 8px 12px, with a prefix in
  rgba(255,255,255,0.35), showing the unique index on (user_id, attendance_date).
  Prefix VERBATIM: "V12__unique_attendance.sql"

  A short note beneath, 15px leading-8, VERBATIM:
  "애플리케이션에서 막는 것보다 DB 제약으로 막는 게 확실했다.
   코드는 실수할 수 있지만 유니크 인덱스는 안 봐준다."
  Emphasize "유니크 인덱스는 안 봐준다" in #4ade80, font-bold.

=== BLOCK F: VERIFICATION + REMAINING LIMITS ===
Margin-top 36px.
Three stat cells in a row, gap 12px (stacks below 640px). Each: padding 16px,
rounded-md, border 1px rgba(74,222,128,0.22), background rgba(74,222,128,0.04).
  Cell 1  value font-mono 26px font-black #4ade80 VERBATIM "20 / 20"
          label font-mono 10px rgba(255,255,255,0.46) VERBATIM "동시 요청 시 1회만 반영"
  Cell 2  value VERBATIM "3곳"   label VERBATIM "같은 패턴을 발견해 고친 다른 지점"
  Cell 3  value VERBATIM "0건"   label VERBATIM "이후 중복 지급"
Values count up on entry.
Below the row, font-mono 10px rgba(255,255,255,0.32), VERBATIM:
  "간단한 스크립트로 동시 요청 20쌍을 보내 확인했습니다."

Then the limits card, margin-top 28px, padding 20px, rounded-md,
border 1px rgba(255,255,255,0.12), background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "아직 남은 것"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "퀘스트 완료 보상에도 같은 구조가 있는데, 거기는 아직 유니크 제약이 없다."
    "요청 단위 멱등성 키는 도입하지 않았다. 날짜 기준 제약으로만 막고 있다."
    "동시성 회귀 테스트를 자동화하지 못했다. 매번 손으로 확인한다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Symptom card slides in from the left
1.10s  Race demo container fades up
1.70s  A one-time pulse on the send button (a soft pink ring, 2 pulses, 0.9s each),
       with a hint beside it, font-mono 10px rgba(255,255,255,0.35),
       VERBATIM: "눌러보세요"
       Both disappear permanently once used.
Table, timeline, code, verification and limits animate on their own entry.

=== RESPONSIVE ===
< 1024px: code panels stack (before on top); the race demo's two sides stack.
< 720px: the timeline diagram scrolls horizontally inside its own container (never
the page) with a minimum width of 560px; the elimination table becomes a stacked
card list.
< 640px: code font 11px with internal horizontal scroll.

=== ACCESSIBILITY ===
prefers-reduced-motion: no traveling request markers, no button pulse, no red tint
flash (use a static border color change), no timeline block stagger.
The send button and the mode toggle must be real controls with visible focus rings
(2px #f472b6, offset 2px); the toggle is a radiogroup.
Announce the outcome ONCE per press via aria-live="polite":
  수정 전 VERBATIM: "연속 출석이 2일 증가했습니다. 중복 지급이 발생했습니다."
  수정 후 VERBATIM: "연속 출석이 1일 증가했습니다. 두 번째 요청은 무시되었습니다."
Provide a visually-hidden text version of the timeline diagram.

=== DO NOT ===
Do not send any real network request.
Do not remove the elimination table, the failed-suspects rows, or the limits card.
Do not present the millisecond values as production measurements - they are the
reproduction's own numbers.
No body imagery.
```

---

## PAGE 07 — AI 인바디 분석 · 사진 한 장에서 리포트까지

**개발 실체**: AI 인바디 분석 연동 파이프라인 + **파싱/검증/폴백 코드**
**연출 장치**: 업로드 → 파싱 → 검증 → 리포트 4단계가 눈앞에서 순차 실행됨

```text
Build an AI ANALYSIS PIPELINE section showing how a body-composition report sheet
is turned into structured data and a personalized report, running the four
processing stages visibly in sequence, with the parsing and fallback code alongside.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.
All processing is simulated locally - no uploads, no API calls.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What the AI is actually used for, stated narrowly and honestly
2. The parsing/validation pipeline, including what happens when it fails
3. The explicit boundary: this does not give medical advice

=== MOOD ===
The character sheet's "stats analysis" page. Clinical but warm. Pink and data.
NO body photographs, NO physique imagery, NO before/after comparisons.
Numbers, bars and tables only.

=== SAFETY / ETHICS (non-negotiable for this page) ===
- Never render or imply a body photo. The uploaded artifact is a PRINTED REPORT
  SHEET (a document), depicted as a document icon and a table of numbers.
- No target weights, no ideal body-fat ranges, no diet prescriptions.
- A visible disclaimer stating this is not medical advice is REQUIRED and must not
  be removed or shrunk below 11px.

=== DESIGN TOKENS (use exactly) ===
background #140510 | panel #1e0a1a | primary pink #f472b6 | accent #f9a8d4
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
code bg #12060f, border rgba(244,114,182,0.18)
syntax: comments #8a5f7a, strings #a3e635, keywords #f472b6, numbers #7dd3fc
fonts: headings font-black, body sans leading-8, code + data font-mono 12px
easing cubic-bezier(0.34,1.56,0.64,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1060px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE PIPELINE - full width, height ~420px, four stages
  Block C : the code panel (parsing + fallback)
  Block D : the scope-and-safety card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "06 · AI 인바디 분석"

HEADING (28px font-black):
  VERBATIM: "종이 한 장을 읽어서 운동 계획으로 바꾸는 일"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "헬스장에서 인바디를 재면 숫자가 잔뜩 적힌 종이를 받는다.
             대부분 사진만 찍어두고 다시 안 본다.
             그 종이를 읽어서 「그래서 뭘 하면 되는지」까지 만들어주고 싶었다."

=== BLOCK B: THE PIPELINE (the defining idea) ===
Container: height ~420px, background #1e0a1a,
border 1px rgba(244,114,182,0.20), rounded-md, padding 24px.
Four stages laid out horizontally, connected by three rails (vertical stack below
900px). Each stage is a 200px-wide card, background #12060f,
border 1px rgba(244,114,182,0.20), rounded-md, padding 16px, with a stage number in
font-mono 10px rgba(255,255,255,0.35) at its top-left.

STAGE 1 - VERBATIM "업로드"
  Contents: a document icon (a rounded rect with three text lines drawn inside -
  clearly a PRINTED SHEET, never a photo), 56px, outline #f472b6.
  Caption font-mono 10px rgba(255,255,255,0.46), VERBATIM: "인바디 결과지 이미지"
  A note beneath, font-mono 9px rgba(255,255,255,0.32),
  VERBATIM: "신체 사진이 아니라 수치가 적힌 종이입니다"

STAGE 2 - VERBATIM "판독"
  Contents: the same document with scan lines sweeping down it once (0.8s), and
  four small extracted values popping out one at a time, 0.12s apart, each a chip
  in font-mono 10px #f9a8d4. Labels VERBATIM:
  "골격근량" "체지방량" "체수분" "기초대사량"
  (Show labels only, with placeholder dashes for values, e.g. VERBATIM "골격근량 —".
   Do NOT invent specific health numbers.)

STAGE 3 - VERBATIM "검증"
  Contents: a 4-row checklist, font-mono 10px, each row a label plus a status mark.
  Rows VERBATIM: "필수 항목 존재" / "숫자 형식" / "값 범위" / "측정 일자"
  Three rows resolve to a #4ade80 "✓" and ONE resolves to a #fbbf24 "!" with a
  note beside it, font-mono 9px #fbbf24, VERBATIM: "일부 항목 누락"
  This deliberate partial failure sets up the fallback in the code panel.

STAGE 4 - VERBATIM "리포트"
  Contents: a small report card with three lines of generated guidance, font-mono
  10px rgba(255,255,255,0.72), each prefixed "· ". Lines VERBATIM:
    "이번 주 근력 운동 비중을 조금 늘려보세요"
    "유산소는 현재 빈도를 유지해도 됩니다"
    "다음 측정은 2주 뒤를 권장합니다"
  Below them, in #fbbf24, font-mono 9px, VERBATIM: "일부 항목 누락 · 참고용"

THE RAILS: 2px lines between stages, rgba(244,114,182,0.20), with a small pink dot
traveling along each rail as the pipeline runs (0.5s per rail, transform only).

THE RUN CONTROL (centered beneath the stages):
  A button, font-mono 12px, padding 9px 22px, rounded-md,
  border 1px rgba(244,114,182,0.45), color #f472b6,
  VERBATIM: "파이프라인 실행"
  Clicking runs stages 1 -> 4 in sequence, each stage lighting up
  (border -> #f472b6, background -> rgba(244,114,182,0.08)) as the dot arrives.
  Total run time about 3.4s.
  AUTONOMOUS: if the viewer does not click within 5 seconds of the container
  entering the viewport, run it once automatically. It runs at most twice total
  without interaction.
  A reset control at the container's bottom-right, font-mono 11px, VERBATIM: "↻ 다시"

=== BLOCK C: THE CODE PANEL ===
Margin-top 40px, full width. background #12060f,
border 1px rgba(244,114,182,0.18), rounded-md.
Header bar with three window dots and a filename, font-mono 11px
rgba(255,255,255,0.45), VERBATIM: "InbodyAnalysisService.java"
Body: font-mono 12px, leading-relaxed, line-number gutter.
CONTENT: ~24 lines. A service that:
  (a) sends the uploaded sheet to the model with a strict output schema request,
  (b) parses the response, rejecting it if it does not match the expected shape,
  (c) validates each extracted metric against a plausible range and marks any
      missing or out-of-range field as unavailable rather than guessing,
  (d) if too many fields are unavailable, returns a RULE-BASED fallback report
      built only from the user's own workout history, with a flag indicating it is
      a fallback,
  (e) never throws to the caller - always returns a report object with a
      completeness flag.
HIGHLIGHT ROWS (background rgba(244,114,182,0.10)): the schema-mismatch rejection
line and the fallback branch.
WHEN THE PIPELINE RUNS in Block B, blocks (a)-(e) highlight in order, 0.2s apart,
and the fallback branch (d) takes a #fbbf24 tint because this run is a partial
failure.
Caption bar, border-top 1px, font-mono 11px, prefixed "// ", VERBATIM:
  "모델이 이상한 걸 뱉어도 화면은 항상 뭔가 보여줘야 한다"

A short note beneath the panel, 15px leading-8, VERBATIM:
  "처음엔 모델 응답을 그대로 믿고 화면에 뿌렸다. 값이 하나 비면 화면 전체가 깨졌다.
   지금은 어떤 항목이 없으면 그 항목만 「측정 안 됨」으로 두고 나머지로 리포트를 만든다."
Emphasize "그 항목만 「측정 안 됨」으로 두고" in #f9a8d4, font-bold.

=== BLOCK D: THE SCOPE AND SAFETY CARD (required - do not remove or shrink) ===
Margin-top 36px, padding 22px, rounded-md, border 1px rgba(251,191,36,0.30),
background rgba(251,191,36,0.05), border-left 3px #fbbf24.
  Label font-mono 11px letter-spacing 0.2em #fbbf24, VERBATIM: "이 기능의 범위"
  A 3-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "의학적 조언이 아닙니다. 운동 빈도와 종류에 대한 참고 제안만 제공합니다."
    "목표 체중이나 목표 체지방률을 제시하지 않습니다. 그건 이 서비스가 할 일이 아닙니다."
    "판독 정확도를 별도로 평가하지 않았습니다. 값이 이상하면 사용자가 직접 수정합니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  Label, heading word by word at 0.15s
0.60s  Paragraph
1.10s  Pipeline container fades up; the four stage cards appear left to right,
       0.1s apart; the rails draw (width 0% -> 100%, 0.4s each, sequential)
2.10s  Run control fades in; the 5-second autonomous timer starts
2.40s  Code panel fades up
Safety card animates on its own entry.

=== PERFORMANCE ===
The autonomous run and all dot animations stop when the container is out of the
viewport or the tab is hidden.

=== RESPONSIVE ===
< 900px: the pipeline becomes VERTICAL - four stacked stage cards with vertical
rails and downward-traveling dots. Container height auto (min 620px).
< 640px: stage cards full width; code font 11px with internal horizontal scroll
(the block scrolls, never the page).

=== ACCESSIBILITY ===
prefers-reduced-motion: no traveling dots, no scan-line sweep. Clicking the run
control advances all four stages instantly with no dot travel; the autonomous run
does not happen.
The run control is a real <button> with a visible focus ring
(2px #f472b6, offset 2px).
Announce completion ONCE via aria-live="polite", VERBATIM:
  "분석이 완료되었습니다. 일부 항목이 누락되어 참고용 리포트가 생성되었습니다."
The safety card's text must remain at 15px and must be reachable by screen readers
in normal document order (never visually hidden or collapsed).

=== DO NOT ===
Do not render any body photograph, silhouette, or physique illustration.
Do not display invented body-composition numbers - use labels with dashes.
Do not include target weights, body-fat goals, or diet advice.
Do not remove or shrink the safety card.
Do not call any real API.
```

---

## PAGE 08 — 전체 구조와 1인 풀스택의 실제

**개발 실체**: 시스템 아키텍처 + **1인 개발이라 내린 선택과 그 대가**
**연출 장치**: 다이어그램이 한 층씩 그려지고, 전 구간이 점등되지만 **"그래서 이걸 못 했다"가 같이 표시됨**

```text
Build an ARCHITECTURE SECTION for a solo-built full-stack fitness platform, where
the system diagram is drawn layer by layer and every layer is owned by the same
person - and the section is honest about what that cost.
Stack: React + TypeScript + Tailwind CSS + framer-motion. Self-contained component.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. The end-to-end system structure
2. That this was built solo, across every layer
3. The concrete trade-offs that came from being solo - what was skipped and why

=== MOOD ===
The character sheet's "build log" page. Neon pink, structural, calm.
Proud of the breadth without overclaiming the depth.

=== DESIGN TOKENS (use exactly) ===
background #140510 | panel #1e0a1a | primary pink #f472b6 | accent #f9a8d4
ok #4ade80 | bad #f87171 | warn #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.46)
fonts: headings font-black, body sans leading-8, ALL diagram labels font-mono
easing cubic-bezier(0.34,1.56,0.64,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1020px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : THE DIAGRAM - full width, height 460px
  Block C : the scope cards (4)
  Block D : the solo trade-off card

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "07 · 전체 구조"

HEADING (28px font-black):
  VERBATIM: "혼자 만들면 전부 내 책임이고, 전부 내 한계다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "기획부터 프론트, 백엔드, 배포까지 혼자 했다.
             덕분에 전체 흐름을 다 이해하게 됐고, 대신 어느 한 층도 깊게 파지 못했다."
  Emphasize "어느 한 층도 깊게 파지 못했다" in #f9a8d4, font-bold.

=== BLOCK B: THE DIAGRAM ===
Container: height 460px, background #1e0a1a,
border 1px rgba(244,114,182,0.20), rounded-md, padding 28px.
Draw in SVG so strokes can animate.

FOUR HORIZONTAL LAYERS, top to bottom, each a row of node boxes.
All nodes are OWNED (this was solo), so all use the same "mine" styling:
border 1px #f472b6, background rgba(244,114,182,0.08),
label rgba(255,255,255,0.86), glow box-shadow 0 0 20px rgba(244,114,182,0.12).

LAYER 1 - CLIENT (y ~12%), layer label at far left, font-mono 10px
  rgba(255,255,255,0.35), VERBATIM: "CLIENT"
  Two boxes, 160x58px: VERBATIM "React 웹" · "모바일 웹"

LAYER 2 - FRONTEND (y ~36%), label VERBATIM: "FRONTEND"
  Four boxes, 126x52px: VERBATIM "기록 화면" · "캐릭터/퀘스트" · "챌린지 구독" ·
  "커뮤니티"

LAYER 3 - SERVER (y ~62%), label VERBATIM: "SERVER"
  Five boxes, 112x52px: VERBATIM "인증 (JWT/OAuth)" · "보상 계산" · "챌린지 브로드캐스트"
  · "게시글/댓글" · "AI 분석 연동"

LAYER 4 - DATA & EXTERNAL (y ~86%), label VERBATIM: "DATA / EXTERNAL"
  Three boxes, 132x52px:
  VERBATIM "관계형 DB" (mine) · "Google OAuth" (external) · "AI 모델 API" (external)
  The two EXTERNAL boxes use a different style: border 1px dashed
  rgba(255,255,255,0.28), background transparent, label rgba(255,255,255,0.50),
  with a tiny corner label, font-mono 8px rgba(255,255,255,0.35),
  VERBATIM: "외부"

EDGES: 1.5px lines connecting layers vertically, #f472b6 at 45% opacity.
ONE SPECIAL EDGE: from "챌린지 브로드캐스트" (Layer 3) back UP to "챌린지 구독"
(Layer 2), drawn on the right as a curved path, 2px #f472b6, with a dot traveling
UPWARD every 2.4s (0.8s travel, 1.6s gap), labeled beside it, font-mono 10px
#f472b6, VERBATIM: "실시간 푸시"

A LEGEND at the bottom-right, font-mono 10px, two rows with 12px swatches,
VERBATIM: "내가 만든 부분" / "외부 서비스"

DRAW-IN ANIMATION (on viewport entry):
  t=0.00s  Layer labels fade in
  t=0.20s  LAYER 1 boxes draw (border stroke-dashoffset sweep, 0.5s each,
           0.1s apart), then their labels
  t=0.80s  Edges 1 -> 2 draw downward, then LAYER 2 at 1.10s
  t=1.90s  Edges 2 -> 3, then LAYER 3 at 2.20s
  t=3.10s  Edges 3 -> 4, then LAYER 4 at 3.30s
  t=3.80s  The upward push edge draws bottom to top over 0.8s; its dot begins
           looping
  t=4.50s  ALL nodes pulse their glow ONCE simultaneously (0.6s), and the legend
           fades in

HOVER: hovering a node lifts it 3px, brightens its border, and highlights every
edge touching it; unconnected nodes dim to 50%. 0.3s.

=== BLOCK C: THE SCOPE CARDS ===
Margin-top 52px. Four cards in a 2x2 grid, gap 14px (1 column below 720px).
Each: padding 20px, rounded-md, border 1px rgba(244,114,182,0.20),
background rgba(244,114,182,0.04), with a font-mono 10px letter-spacing 0.18em
#f472b6 label and a 3-item list at 14px leading-7 with "· " prefixes.

CARD 1  label VERBATIM: "게임화"
  "출석, 캐릭터 성장, 퀘스트 루프 설계 및 구현"
  "보상 계산을 서버로 이전"
  "레벨업 판정과 응답 구조 정의"
CARD 2  label VERBATIM: "인증"
  "JWT + Google OAuth 인증 시스템 구현"
  "리프레시 토큰 회전과 폐기 처리"
  "토큰 페이로드 스키마 정의"
CARD 3  label VERBATIM: "실시간·커뮤니티"
  "실시간 라운지 서버 분리 · 위치/채팅 동기화 구현"
  "챌린지 단위 구독 범위 분리"
  "게시글·댓글 기능 구현"
CARD 4  label VERBATIM: "AI 연동"
  "AI 인바디 분석 연동과 리포트 화면 구현"
  "응답 스키마 검증과 폴백 처리"
  "누락 항목 부분 표시 규칙 정의"

=== BLOCK D: THE SOLO TRADE-OFF CARD (required) ===
Margin-top 36px, padding 22px, rounded-md, border 1px rgba(255,255,255,0.12),
background rgba(255,255,255,0.02).
  Label font-mono 10px letter-spacing 0.18em rgba(255,255,255,0.46),
  VERBATIM: "혼자 해서 못 한 것"
  A 4-item list, 15px leading-8, each prefixed "· ", VERBATIM:
    "코드 리뷰를 받지 못했다. 보상 계산을 클라이언트에 뒀던 것도 그래서 늦게 발견했다."
    "테스트 코드가 거의 없다. 기능을 늘리는 데 시간을 다 썼다."
    "부하 테스트를 하지 않았다. 동시 사용자가 몇 명까지 되는지 모른다."
    "디자인은 참고 서비스들을 보고 흉내 낸 수준이다."

=== RESPONSIVE ===
< 900px: diagram height 540px; layers wrap into two rows each; the upward push edge
redraws along the right edge with a longer curve.
< 640px: the diagram becomes a VERTICAL stack of labeled groups - each layer is a
bordered group containing its nodes as chips, with a downward arrow between groups
and one upward pink arrow on the right spanning the SERVER -> FRONTEND gap.
Scope cards single column.

=== ACCESSIBILITY ===
prefers-reduced-motion: the diagram renders complete and static; no draw-in, no
traveling dot, no pulse.
Provide a visually-hidden structured text equivalent: the four layers, their nodes,
which nodes are external, and the upward push edge.
Non-interactive nodes must not be in the tab order.

=== DO NOT ===
Do not use a diagramming library - hand-draw the SVG.
Do not remove the solo trade-off card - the breadth claim is only credible next to
it.
Do not animate the traveling dot when the diagram is off-screen.
```

---

## PAGE 09 — 결과 · 화면 갤러리

**개발 실체**: 완성된 화면들 + 실제 사용 흐름
**연출 장치**: 캐릭터 시트가 완성되며 갤러리로 확장

```text
Build a RESULTS SECTION presenting finished product screenshots as a gallery, for a
gamified fitness platform portfolio page.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. What was actually shipped, in screens
2. The concrete outcome stated without invented metrics
3. What the numbers on this page do and do not mean

=== MOOD ===
The character sheet complete. Warm pink, satisfied, calm.
NO body imagery in any screenshot framing or caption.

=== DESIGN TOKENS (use exactly) ===
background #1a0a16 (lifted from earlier sections) | panel #241026
primary pink #f472b6 | accent #f9a8d4 | ok #4ade80
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, labels font-mono
easing cubic-bezier(0.34,1.56,0.64,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 1120px, padding-block 120px.
  Block A : label + heading + one paragraph
  Block B : the gallery (5 items, asymmetric grid)
  Block C : the outcome stats
  Block D : the numbers-disclaimer strip

=== CONTENT (Korean copy - VERBATIM, never translate) ===

SECTION LABEL: "08 · 결과"

HEADING (32px font-black):
  VERBATIM: "기록하면 뭔가 일어나는 앱이 됐다"

PARAGRAPH (16px leading-9, max-width 740px, margin-top 20px):
  VERBATIM: "운동 하나를 기록하면 출석, 퀘스트, 캐릭터, 커뮤니티가 동시에 반응한다.
             그 계산은 전부 서버가 하고, 챌린지 참가자들에게는 실시간으로 전달된다.
             운동 기록과 커뮤니티, AI 분석을 하나의 흐름으로 연결했다."

=== BLOCK B: THE GALLERY ===
An asymmetric grid, margin-top 48px:
  Row 1: one large item (2 columns) + one small item
  Row 2: three equal items
Gap 16px. Below 900px -> single column.

Each item: background #241026, border 1px rgba(244,114,182,0.18), rounded-md,
overflow hidden.
  A 30px header strip with a font-mono 10px uppercase label on the left
  (rgba(255,255,255,0.48)) and a small pink dot on the right.
  Below it, the image area with aspect-ratio 16/10.
  A caption bar at the bottom, padding 12px 14px,
  border-top 1px rgba(244,114,182,0.10), font-mono 11px rgba(255,255,255,0.48).

ITEM 1 (large)  header VERBATIM "01 · 홈 · 캐릭터"
  [IMG-01] the home screen with the character, EXP bar and today's quests
  caption VERBATIM: "기록 하나가 반영되는 지점이 한 화면에 모여 있다"
ITEM 2 (small)  header VERBATIM "02 · 운동 기록"
  [IMG-02] the workout logging screen
  caption VERBATIM: "입력은 최대한 짧게"
ITEM 3          header VERBATIM "03 · 실시간 라운지"
  [IMG-03] the challenge leaderboard with the live feed
  caption VERBATIM: "참가자 활동이 실시간으로 들어온다"
ITEM 4          header VERBATIM "04 · 커뮤니티"
  [IMG-04] the community feed with posts and comments
  caption VERBATIM: "기록이 그대로 게시글이 된다"
ITEM 5          header VERBATIM "05 · AI 리포트"
  [IMG-05] the analysis report screen (numbers and charts only)
  caption VERBATIM: "수치와 제안만 · 신체 사진은 다루지 않는다"

IMAGE PLACEHOLDER SPEC (if no image is supplied): a CSS placeholder inside the
aspect box - background #140510, a faint 24px pink grid, centered text in font-mono
12px rgba(255,255,255,0.35) reading the slot name, e.g. VERBATIM "[IMG-01] · 16:10"

HOVER: the item lifts 4px, border -> rgba(244,114,182,0.45), image scales 1.03
inside its clipped frame. 0.35s. Click opens a lightbox (overlay rgba(14,4,12,0.94),
backdrop-blur(8px), image max-width 1200px, caption below, Esc / overlay click
closes, arrow keys move between items).

=== BLOCK C: THE OUTCOME STATS ===
Margin-top 56px. Three stat cells, gap 14px (stacks below 640px).
Each: padding 22px, rounded-md, border 1px rgba(244,114,182,0.22),
background rgba(244,114,182,0.04).
  value font-mono 34px font-black #f472b6 tabular-nums
  label font-mono 11px rgba(255,255,255,0.48), margin-top 6px
  Cell 1  value VERBATIM "6"    label VERBATIM "기술 스택"
  Cell 2  value VERBATIM "7"    label VERBATIM "핵심 기능"
  Cell 3  value VERBATIM "2종"  label VERBATIM "인증 방식"
Values count up over 0.8s on entry.

=== BLOCK D: THE NUMBERS DISCLAIMER (required) ===
Margin-top 28px, a slim strip: padding 14px 18px, rounded-md,
border 1px rgba(255,255,255,0.10), background rgba(255,255,255,0.02).
  font-mono 11px rgba(255,255,255,0.45), VERBATIM:
  "위 숫자는 구현 범위를 센 것입니다. 가입자 수, 기록 건수, 유지율 같은 지표는
   수집하지 않았습니다."

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The page background lifts #140510 -> #1a0a16 over 1.2s
0.10s  Label, heading word by word at 0.25s
0.80s  Paragraph
1.30s  Gallery items fade up 0.09s apart (y 20px -> 0, 0.6s)
2.20s  Stat cells fade up 0.1s apart, values counting
2.80s  Disclaimer strip fades in

=== RESPONSIVE ===
< 900px: single-column gallery.
< 640px: stat cells stack; heading 24px.

=== ACCESSIBILITY ===
prefers-reduced-motion: no count-up, no hover scale, no background transition.
Every gallery item is a real <button> opening the lightbox with a visible focus
ring (2px #f472b6, offset 2px). Each image needs a Korean alt text derived from its
caption. The lightbox traps focus while open and returns focus on close.

=== DO NOT ===
Do not invent user counts, record totals, or retention figures.
Do not include body photographs in any slot - IMG-05 must be charts and numbers.
Do not add confetti.
```

---

## PAGE 10 — 회고 · 다음 단계 · 퇴장

**개발 실체**: KPT 회고 (PROBLEM 포함) + 다음 단계 + GitHub
**연출 장치**: 최종 스탯 정산 → 캐릭터 시트 접기 → 퇴장

```text
Build the CLOSING SECTION of a gamified fitness platform portfolio page: a final
stat settlement, a KPT retrospective, next steps, a repository link, and an exit
transition where the character sheet folds away.
Stack: React + TypeScript + Tailwind CSS + framer-motion.

=== SUBSTANCE THIS PAGE MUST DELIVER ===
1. An honest retrospective including real problems, not just wins
2. Concrete next steps
3. The repository link
4. A clean exit back to the village

=== MOOD ===
End of a long session. Neon pink dimming, stats being tallied.
Tired, satisfied, honest. No triumphalism.

=== DESIGN TOKENS (use exactly) ===
background #1a0a16 | panel #241026 | primary pink #f472b6 | accent #f9a8d4
keep #4ade80 | problem #f87171 | try #fbbf24
text rgba(255,255,255,0.88) | muted rgba(255,255,255,0.48)
fonts: headings font-black, body sans leading-8, stats/labels font-mono
easing cubic-bezier(0.34,1.56,0.64,1) | rounded-md | numbers tabular-nums

=== LAYOUT ===
Centered column, max-width 960px, padding-block 120px.
  Block A : the final settlement panel
  Block B : label + heading + one paragraph
  Block C : KPT, three columns
  Block D : next steps card
  Block E : GitHub link
  Block F : exit button + exit transition

=== BLOCK A: THE FINAL SETTLEMENT (the payoff of the page-long EXP gauge) ===
A panel, max-width 520px, centered, background #241026,
border 1px rgba(244,114,182,0.24), rounded-lg, padding 26px.
  Header font-mono 11px letter-spacing 0.22em rgba(255,255,255,0.48),
  VERBATIM: "관람 완료"
  A big level readout, font-black 42px #f472b6, tabular-nums,
  VERBATIM: "Lv.9"
  Below it, an EXP bar filled to 100%, and a readout font-mono 12px,
  VERBATIM: "1000 / 1000 EXP"
  Then three settlement rows, font-mono 12px, each a label on the left and a value
  on the right, tabular-nums:
    VERBATIM "읽은 섹션"      value VERBATIM "11"
    VERBATIM "직접 해본 것"   value VERBATIM "4"
    VERBATIM "본 코드"        value VERBATIM "9"
  Each row's value counts up on entry, 0.12s apart.
  A closing line beneath, 15px leading-8, VERBATIM:
  "여기까지 내려오셨으면 이 프로젝트가 뭘 하려던 건지는 전해진 것 같습니다."
  The panel arrives with a scale 0.96 -> 1 spring and ONE soft pink glow pulse
  (box-shadow 0 0 40px rgba(244,114,182,0.16), 0.8s) - local only, never
  full-screen.

=== BLOCK B: LABEL + HEADING + PARAGRAPH ===
Margin-top 64px.
SECTION LABEL (font-mono 11px, letter-spacing 0.25em, rgba(255,255,255,0.48)):
  "09 · 회고"
HEADING (30px font-black, margin-top 12px):
  VERBATIM: "게임화는 붙이는 게 아니라 설계하는 것이었다"
PARAGRAPH (16px leading-9, max-width 720px, margin-top 18px):
  VERBATIM: "경험치와 레벨을 붙이는 건 하루면 된다.
             그게 실제로 다시 오게 만드는지는 다른 문제였고,
             그 부분은 아직 확인하지 못했다."

=== BLOCK C: KPT ===
Margin-top 48px. Three columns, gap 16px (single column below 768px).
Each column: padding 22px, rounded-md, background #241026,
border 1px rgba(255,255,255,0.10), with a 3px top border in its own color.
Header: font-mono 11px letter-spacing 0.2em, uppercase.
Items: 15px leading-8, each prefixed "· ", 14px apart.

COLUMN 1 - header VERBATIM "KEEP", color #4ade80, top border #4ade80. Items VERBATIM:
  "보상 계산을 전부 서버로 옮긴 것"
  "중복 지급을 DB 제약으로 막은 것"
  "AI 응답을 못 믿는다는 전제로 폴백을 만든 것"

COLUMN 2 - header VERBATIM "PROBLEM", color #f87171, top border #f87171. Items VERBATIM:
  "보상 계산을 클라이언트에 뒀다가 뒤늦게 고쳤다"
  "테스트 코드를 거의 안 썼다"
  "실제 사용자에게 2주 이상 써보게 하지 못했다"

COLUMN 3 - header VERBATIM "TRY", color #fbbf24, top border #fbbf24. Items VERBATIM:
  "실사용자 테스트와 웨어러블 기기 연동 검토"
  "퀘스트 보상에도 유니크 제약 적용"
  "핵심 보상 로직부터 테스트 코드 붙이기"

Hover a column: lifts 4px, border brightens to rgba(255,255,255,0.22), top border
grows 3px -> 4px. 0.3s.

=== BLOCK D: NEXT STEPS CARD ===
Margin-top 48px, padding 22px, rounded-md, border 1px rgba(244,114,182,0.22),
background rgba(244,114,182,0.04), border-left 3px #f472b6.
  Label font-mono 11px letter-spacing 0.2em #f472b6, VERBATIM: "다음 단계"
  Body 16px leading-8, margin-top 12px, VERBATIM:
  "실사용자 테스트와 웨어러블 기기 연동을 검토할 예정입니다.
   그 전에 「2주 뒤에도 쓰는 사람이 있는지」부터 확인하려고 합니다."

=== BLOCK E: GITHUB LINK ===
Margin-top 40px. A single primary link button:
  background #f472b6, color #140510, font-mono 14px font-black,
  padding 14px 28px, rounded-md.
  Label VERBATIM: "GitHub 저장소 ↗"
  Hover: scale 1.04, box-shadow 0 0 28px rgba(244,114,182,0.38). Active: scale 0.97.
  href https://github.com/toadsam/Ajou_MuscleUp, target _blank, rel noreferrer.

=== BLOCK F: EXIT BUTTON + EXIT TRANSITION ===
Margin-top 72px. A full-width button, height 88px, rounded-md,
border 1px rgba(255,255,255,0.14), background transparent.
  Label centered, font-mono 15px, letter-spacing 0.1em, rgba(255,255,255,0.62),
  VERBATIM: "← 마을로 돌아가기"
  Hover: border -> rgba(244,114,182,0.45), label -> #f472b6, and a faint pink glow
  appears behind it. 0.4s.

EXIT TRANSITION (on click of this button OR the header's "← 마을로"):
  t=0.00s  The header EXP gauge drains from 100% to 0% over 0.5s
  t=0.30s  Content fades to opacity 0 over 0.35s
  t=0.50s  A character-sheet outline appears at the viewport center, then FOLDS:
           it scales down along Y to a horizontal line over 0.35s, then that line
           contracts horizontally to nothing over 0.25s
  t=1.20s  Full background #140510, nothing on screen
  t=1.50s  Emit an onExit callback so the parent can restore the 3D village scene.
  Body scroll locks during the transition; the parent releases it.
  No flash at any point.

=== ANIMATION TIMELINE (on section enter) ===
0.00s  The settlement panel springs in with its single glow pulse; its rows count
       up 0.12s apart
1.20s  Section label, heading word by word at 1.35s
1.90s  Paragraph
2.40s  KPT columns fade up left to right 0.12s apart, items inside 0.06s apart
3.40s  Next steps card slides in from the left (x -12px -> 0)
3.80s  GitHub button fades in
4.10s  Exit button fades in with its border drawing from the center outward
       (0% -> 100% width, 0.7s)

=== RESPONSIVE ===
< 768px: settlement panel max-width 92vw, level 32px; KPT single column;
heading 24px; exit button height 72px, label 14px; GitHub button full width.

=== ACCESSIBILITY ===
prefers-reduced-motion: no count-up, no spring, no glow pulse; the exit transition
becomes a plain 0.3s fade with no fold animation.
The exit button must be a real <button>, keyboard focusable, visible focus ring
(2px #f472b6, offset 2px).
The settlement EXP bar needs role="progressbar" with aria-valuenow/min/max.

=== DO NOT ===
Do not soften the PROBLEM column - the honesty is the point.
Do not add confetti or celebration copy.
Do not flash the screen during the exit fold.
No body imagery, no weight or diet framing anywhere in this section.
```

---

# D. 구현 메모 (프롬프트 아님 — 내가 볼 것)

## D-0. ✅ [FIX-01] 해소 — 실시간 스택은 Socket.IO

저장소 확인 완료(2026-07-31). **`Socket.IO` 가 맞습니다.**

| 근거 | 내용 |
|---|---|
| `realtime/src/server.ts` | `import { Server } from "socket.io"` · `PORT = process.env.PORT ?? 4001` · `ALLOWED_ORIGINS` 직접 CORS 처리 |
| `realtime/src/rooms.ts` | `addPlayer` / `listPlayers` / `updatePlayerPosition` / `getRoomName` — **룸 기반 위치 동기화** |
| `frontend/package.json` | `"socket.io-client": "^4.8.1"` |
| `frontend/src/pages/Lounge.tsx`, `Friends.tsx` | 클라이언트 소비 지점 |
| `data.ts` muscleup `challenges[0]` | "실시간 상태만 담당하는 Socket.IO 서버(:4001)를 REST 백엔드와 분리" — **이미 정확함** |

`projects.ts` 의 SSE 문장 2곳은 **수정 완료**.
**완료**: `PAGE 05` 는 실제 기능(실시간 라운지)으로 **전면 재작성**, `D-6` 코드 목록도 실제 파일로 교체.

## D-1. 개발 실체 커버리지 점검

| 항목 | 어디에 | 형태 |
|---|---|---|
| **왜 만들었나** | P00 | 캐릭터 생성 마지막 문장 (4초 안에) |
| **데모 영상** | P01 슬롯 1 | 장비 슬롯 |
| **GitHub** | P01 슬롯 2 · P10 버튼 | 슬롯 + 마무리 버튼 |
| **관람객 직접 조작** | **P02(기록) · P03(치트) · P06(중복요청) · P07(파이프라인)** | **4곳** |
| **코드** | P02(보상 서비스) · P03(Before/After) · P04(JWT·TokenService) · P05(구독·브로드캐스트) · P06(Before/After·마이그레이션) · P07(AI 파싱·폴백) | **총 10개** |
| **트러블슈팅** | P03 (클라이언트 계산) · P06 (중복 지급) | **전체 프로세스 2건** |
| **기술 의사결정 + 포기한 것** | P04 (OAuth 도입 이유) · P05 (구독 범위 분리) | 정직한 카드 포함 |
| **아키텍처 + 1인 개발의 대가** | P08 | 전 구간 소유 + 못 한 것 4가지 |
| **윤리 경계** | P07 | 의학적 조언 아님 · 목표 체중 미제시 |
| **결과물** | P09 | 갤러리 5장 |
| **회고** | P10 | 정산 + KPT (PROBLEM 3개) |
| **한계 인정** | P03 · P05 · P06 · P07 · P08 · P09 | 운동 검증 불가 / 소음 문제 / 자동 테스트 없음 / 판독 정확도 미평가 / 부하 테스트 없음 / 지표 없음 |

## D-2. 새로 만들 파일
```
src/components/ui/project-viewers/stages/muscleup/
  index.tsx                 ← PAGE 00~10 순서, 스크롤→EXP/레벨 매핑 소유
  useExpProgress.ts         ← 스크롤 → CSS 변수 + Lv.1~9 (React state 금지)
  CharacterCreate.tsx       ← P00
  SheetHero.tsx             ← P01 · 캐릭터 시트 + 장비 슬롯 3칸
  RewardLoopDemo.tsx        ← P02 · 기록 → 4보상 → 레벨업 + 코드 순차 하이라이트
  CheatDemo.tsx             ← P03 · EXP 조작 버튼 + Before/After
  AuthFlowDiagram.tsx       ← P04 · 두 경로 + 토큰 dot
  ChallengeFeed.tsx         ← P05 · 자동 수신 리더보드 + 피드
  DoubleGrantCase.tsx       ← P06 · 동시 요청 + 타임라인 다이어그램
  InbodyPipeline.tsx        ← P07 · 4단계 + 폴백
  SoloArchDiagram.tsx       ← P08 · SVG 레이어
  Settlement.tsx            ← P10 · 최종 정산 패널
  copy.ts                   ← 모든 한국어 문구
  assets.ts                 ← [IMG-01~05] · [VIDEO-01]
```

## D-3. 기존 코드 재사용 / 선행 작업
재사용: `CodeBlock`, `ImageSlot`, `MockScreen`, `CountUp`, `RevealText` (`shared.tsx`)

> ⚠️ **선행 작업 (10개 프로젝트 공통 1건)**: `shared.tsx` 의 `DecisionTable`,
> `ArchDiagram`, `CompareBars`, `ProcessTimeline`, `QuoteCard`, `TldrBanner`,
> `BeforeAfter`, `ChallengeCard` 가 현재 **모듈 내부 함수(비export)** 입니다.
> stage 폴더에서 쓰려면 export로 승격해야 합니다.

## D-4. 버릴 것
- `[KILL]` `RealtimeProjectViewer` 의 muscleup 분기 → stage 폴더로 이전
- `[KILL]` muscleup의 기존 `SIGNATURE` 데모 → P02 `RewardLoopDemo` 로 흡수

## D-5. 미디어 확보 목록
| 슬롯 | 내용 | 비율 | 우선도 |
|---|---|---|---|
| `[VIDEO-01]` | 기록 → EXP → 퀘스트 → 레벨업 → 챌린지 반영 (2분 20초) | 16/9 | **최상** |
| `[IMG-01]` | 홈 · 캐릭터 + EXP + 퀘스트 | 16/10 | **최상** |
| `[IMG-02]` | 운동 기록 입력 화면 | 16/10 | 높음 |
| `[IMG-03]` | 실시간 라운지 (접속자 캐릭터 + 채팅) | 16/10 | 높음 |
| `[IMG-04]` | 커뮤니티 피드 | 16/10 | 중간 |
| `[IMG-05]` | AI 리포트 화면 — **수치/차트만, 신체 사진 금지** | 16/10 | 중간 |

## D-6. 코드 스니펫 확보 목록 (전부 실제 저장소에서)
| 페이지 | 파일 | 줄 | 하이라이트 |
|---|---|---|---|
| P02 | `WorkoutRewardService.java` | 24 | (a)~(f) 6구간 |
| P03 | `useWorkoutSubmit.ts (before)` | 14 | body에 exp 실어 보내는 줄 |
| P03 | `useWorkoutSubmit.ts + WorkoutController.java (after)` | 20 | 토큰에서 사용자 식별 |
| P04 | JWT payload (decoded) | 10 | provider 필드만 다름 |
| P04 | `TokenService.java` | 18 | 리프레시 회전 · 폐기 검사 |
| P05 | `realtime/src/server.ts` | ~20 | **실제 원본** · `socket.on("player:move")` · `io.to(roomName).emit` |
| P05 | `realtime/src/rooms.ts` | ~15 | **실제 원본** · `ROOM_NAME="lounge"` · `clamp()` 경계 처리 |
| P06 | `AttendanceService.java (before)` | 12 | 읽고-확인 쌍 |
| P06 | `AttendanceService.java (after)` | 18 | insert 먼저 · 중복키 catch |
| P06 | `V12__unique_attendance.sql` | 1줄 칩 | (user_id, date) 유니크 |
| P07 | `InbodyAnalysisService.java` | 24 | 스키마 불일치 거부 · 폴백 분기 |

## D-7. 안전장치 대조표

이 방은 **제어권을 뺏지 않습니다.** 대신 관람객이 스스로 켭니다.

| 페이지 | 장치 | 안전장치 |
|---|---|---|
| P02 | 레벨업 연출 | **세션당 1회** · 전체 화면 플래시 금지 · 파티클 18개 이하 · reduced-motion 시 무효과 |
| P03 | 치트 버튼 | 실제 네트워크 요청 없음 · 되돌리기 상시 · "재현용 시뮬레이션" 문구 |
| P06 | 동시 요청 버튼 | 실제 네트워크 요청 없음 · 되돌리기 상시 |
| P07 | 파이프라인 자동 실행 | 관람객 미조작 시 최대 2회만 |

## D-8. 최종 체크리스트 (윤리 항목 최우선)
- [ ] **신체 사진 · 근육 일러스트 · before/after 몸 비교가 0개인지** (전 페이지)
- [ ] **목표 체중 · 목표 체지방률 · 다이어트 조장 문구가 0개인지**
- [ ] P07 **"의학적 조언 아님" 카드**가 15px 이상으로 남아 있는지 (축소·삭제 금지)
- [ ] P07 인바디 수치를 **지어내지 않고 대시(—)로** 뒀는지
- [x] **[FIX-01]** 실시간 스택은 **Socket.IO** 로 확정 · 문서·`projects.ts` 정정 완료 (2026-07-31)
- [ ] EXP 게이지가 **CSS 변수 + rAF** 로 스크롤에 바인딩됐는지 (React state 금지)
- [ ] P02 레벨업이 **세션당 1회**, 전체 화면 플래시 0회, 파티클 18개 이하인지
- [ ] P02 코드 패널을 **하이라이트 단계마다 리렌더하지 않는지** (ref + class 토글)
- [ ] P03 · P06 이 **실제 네트워크 요청을 보내지 않는지**
- [ ] P03 · P06 에 **"재현용 시뮬레이션" 문구**가 있는지
- [ ] P04 JWT 패널에 **"예시 페이로드 · 실제 토큰 아님"** 각주가 있는지
- [ ] P04 에서 **구글 로고/브랜드 에셋을 쓰지 않았는지** (텍스트 라벨만)
- [ ] P05 피드가 `aria-live` 가 **아닌지** (스크린리더 폭주 방지)
- [ ] P05 실시간 루프가 **뷰포트 밖 + 탭 숨김 시 정지**하는지
- [ ] P08 **"혼자 해서 못 한 것" 카드 4개**가 남아 있는지
- [ ] P09 **"가입자·기록 수 미수집"** 면책 문구 유지
- [ ] 사운드 **기본 OFF**, 레벨업 효과음 0.12 하드 제한
- [ ] 숫자 전부 `tabular-nums`
- [ ] 지어낸 수치 0개 — 가입자·DAU·유지율 주장 금지
