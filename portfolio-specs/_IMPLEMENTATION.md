# 구현 가이드 — Variant HTML → 마을 방(Room) 코드

> **이 문서의 목적**: 새 세션에서 Variant가 뱉은 HTML을 저장소에 넣을 때,
> 아키텍처를 다시 탐색하지 않고 **이 파일 하나만 읽고 바로 작업**하기 위한 것.
> 프롬프트 팩 사용법은 `00-OVERVIEW.md`, 진행 상황은 `_STATUS.md`, 사실 검증은 `_AUDIT.md`.

**새 세션 시작 문구 (복붙용)**

```
portfolio-specs/_IMPLEMENTATION.md 읽고, 아래 HTML을 <프로젝트 id> 방으로 구현해줘.
(Variant HTML 붙여넣기)
```

---

## 1. 방이 이미 있는지부터 확인

| 프로젝트 id     | 방 폴더                    | 상태                                               |
| --------------- | -------------------------- | -------------------------------------------------- |
| `darklab`       | `project-viewers/darklab/` | ✅ 12섹션 (포맷 기준 코드)                         |
| `aclub`         | `project-viewers/aclub/`   | ✅                                                 |
| `sign-language` | `project-viewers/sueo/`    | ✅ 11섹션                                          |
| 그 외           | 없음                       | 카테고리별 뷰어(`PlatformProjectViewer` 등)로 렌더 |

방이 없으면 §2부터, 있으면 해당 폴더의 `sections/`에 파일만 추가하고 Room에 등록.

---

## 2. 새 방 만들기 — 파일 6개 + 한 줄 배선

```
src/components/ui/project-viewers/<room>/
├── <Room>Room.tsx     컨테이너: 헤더 · 공유 state · <main>에 섹션 나열 · 퇴장 연출
├── context.ts         섹션들이 쓰는 API (createContext + use<Room>() 훅)
├── fonts.ts           next/font — 전역 서체(Inter) 안 건드리게 CSS 변수로만
├── <room>.css         .<x>-root 스코프 토큰 + 키프레임
├── parts.tsx          이 방에서 반복되는 조각 (방마다 따로 둔다 — 공유 안 함)
├── useTimeline.ts     원안의 setTimeout 나열 → 훅 (sueo/에서 그대로 복사)
└── sections/*.tsx     페이지 하나 = 파일 하나
```

**배선은 `ProjectViewer.tsx:538` 부근 한 줄.** 카테고리 분기보다 **위**에 둔다.

```tsx
if (project.id === "darklab")
  return <DarkLabRoom key={project.id} {...shared} />;
if (project.id === "aclub") return <AClubRoom key={project.id} {...shared} />;
if (project.id === "sign-language")
  return <SueoDistrictRoom key={project.id} {...shared} />;
// ↑ 여기에 추가. shared = {project, theme, onClose}
```

이것만 하면 **마을 → 건물 진입 → 이 방**이 자동으로 연결되고,
헤더의 `← 마을로`는 `onClose`(= `ProjectInterior`의 `onBack`)에 그대로 물린다.
`ProjectIntro`·`SoundToggle`은 이 분기에서 **안 붙는다**(방이 자체 인트로를 갖는 전제).

---

## 3. 색 토큰 — 전역 Tailwind에 넣지 말 것 🔴

Variant HTML은 `tailwind.config = { colors: { primary, accent, ok, bad, warn ... } }`를 쓴다.
**그대로 옮기면 안 된다.** 이 저장소 `tailwind.config.ts`에는 이미
`accent: "#00f5ff"`(이력서 모드 터미널색)가 있어서 **덮어쓰면 이력서 모드가 깨진다.**

→ **`.<x>-root` 스코프 CSS 변수**로 옮기고, 클래스는 임의값으로 참조한다.

```css
.sd-root {
  --sd-primary: #7eb8ff;
  --sd-bad: #f87171;
  /* ... */
}
```

```tsx
className = "text-[var(--sd-primary)] border-[rgba(126,184,255,0.18)]";
```

`bg-primary` → `bg-[var(--sd-primary)]`, `text-ok` → `text-[var(--sd-ok)]` 식으로 1:1 치환.
`ProjectDetail.css`의 `.op-detail` 스코프와 같은 관례다.

**테마색은 `projectThemes.ts`에 이미 있다** — Variant 토큰과 대조해보면 대개 일치한다
(예: sign-language = `#7eb8ff` / `#060d18` / `#bfdbfe`, 디자인 토큰과 동일).

---

## 4. 서체

Variant는 Pretendard·JetBrains Mono를 CDN `@import`로 부른다.
Pretendard는 Google Fonts에 없으므로 **Noto Sans KR로 대체**하고 next/font를 쓴다.

```ts
export const sueoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--sd-font-sans"
});
export const sueoMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--sd-font-mono"
});
```

```tsx
<div className={`sd-root ${sueoSans.variable} ${sueoMono.variable}`}>
```

```css
.sd-root {
  font-family: var(--sd-font-sans), ...;
}
.sd-root .font-mono {
  font-family: var(--sd-font-mono), ...;
}
```

---

## 5. 바닐라 JS → React 변환 대응표

| Variant HTML                   | React                                                             |
| ------------------------------ | ----------------------------------------------------------------- |
| `setTimeout` 타임라인 나열     | `useTimeline(STEPS, start, instant)` → `boolean[]`                |
| `IntersectionObserver`로 등장  | `useInView(ref)` → 타임라인의 `start` 인자로                      |
| `el.style.opacity = '1'`       | `style={rise(on, instant)}` / `fade(...)` (`parts.tsx`)           |
| `classList.add('active')`      | 조건부 className 또는 인라인 style                                |
| `document.getElementById(...)` | `useRef`                                                          |
| `requestAnimationFrame` 루프   | `useEffect` + ref로 DOM 직접 갱신 (**state 금지 — 60fps 리렌더**) |
| `<dialog>.showModal()`         | `useState` + 조건부 `fixed inset-0` div + Esc 핸들러              |
| `prefers-reduced-motion`       | `useSueo().reducedMotion` → `instant` 인자로 전파                 |
| 드래그 (`setPointerCapture`)   | `onPointerDown/Move/Up` + `svg.getScreenCTM().inverse()` 그대로   |

**핵심 원칙**: 매 프레임 바뀌는 값(재생 위치·좌표·카운터 표시)은 **state가 아니라 ref + DOM 직접 조작**.
코드 패널 하이라이트 같은 것도 `container.querySelectorAll('[data-kf]')`로 원안 방식 유지.

`useTimeline.ts` / `parts.tsx`(rise·fade·Kicker·WordHeading·CodePanel·NoteBox·StatCard·LimitList·Caveat)는
**`sueo/`에서 통째로 복사**해서 접두사만 바꾸면 된다.

---

## 6. 🔴 반드시 밟는 함정 4개 (실제로 다 겪음)

**① SVG `transform-origin`이 엉뚱한 곳에 잡힌다**
`.hand-part { transform-origin: bottom center }`는 SVG 기본 `transform-box: view-box` 때문에
**뷰박스 밑변** 기준이 된다. 손가락을 굽히면 손에서 떨어져 나간다. Variant HTML의 고질 버그.

```css
.sd-hand-part {
  transform-box: fill-box;
  transform-origin: bottom center;
}
```

**② JSX에서 `inline-block` 사이 공백이 사라진다**

```tsx
{
  WORDS.map(w => <span className="inline-block">{w} </span>);
} // ❌ "수어는손모양이"
{
  WORDS.map(w => <span className="mr-[0.25em] inline-block">{w}</span>);
} // ✅
```

HTML은 태그 사이 공백 텍스트 노드가 살지만 JSX `.map()`은 안 남는다.

**③ `overflow-x-auto`가 세로도 잘라낸다**
CSS 규칙상 `overflow-x: auto`면 `overflow-y`도 `auto`가 된다.
그 안의 `top-[-15px]` 같은 음수 오프셋 요소는 **클리핑돼 안 보인다** → 패딩 안쪽(`top-0`)으로 옮길 것.

**④ 타입 두 가지**

- `as const` 배열 → `setState<number[]>`에 못 넣음. `setLit([...path])`로 복사.
- `{type:"word", p0, p1}` / `{type:"trans"}` 섞인 배열은 `p0`가 optional로 잡힘.
  → 인터페이스를 나눠 선언하고 `const SEQ: (WordSeg|TransSeg)[] = [...]`.

---

## 7. 검증

```bash
npm run typecheck                                    # 필수
npx prettier --write "src/components/ui/project-viewers/<room>/**/*.{ts,tsx,css}"
```

> `npm run check-format`은 저장소 전체에 기존 경고 766건이 있으니 **새 파일만** 따로 검사할 것.
> lint 스크립트와 JS 테스트 러너는 **없다**.

**화면 확인용 개발 전용 라우트** — `src/app/sueo-preview/`가 참고 구현.
마을을 3D로 걸어 들어가지 않고 바로 방을 볼 수 있다. `NODE_ENV !== "development"`면 `notFound()`.

```tsx
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Preview />; // "use client" 컴포넌트에서 <XRoom project={...} theme={...} onClose={...} />
}
```

**브라우저로 확인할 때 주의**: 자동화 탭이 백그라운드가 되면 CSS 전환이 얼어붙어
**섹션이 빈 화면으로 찍힌다.** 코드 버그가 아니다. 탭을 활성화한 뒤 다시 캡처할 것.

---

## 8. 방 공통 규칙 (Variant HTML이 매 페이지 반복하는 것들)

- **고정 헤더** `h-[54px]` (`← 마을로` / 프로젝트명 / 진행 카운터)
  → 페이지마다 그리지 말고 **Room이 한 번만** 그린다.
  첫 섹션(엔트리)에서는 숨긴다: 첫 `[data-x-section]`을 IntersectionObserver로 감시해 토글.
- **진행 카운터**(`손동작 n / 12`, `잠금 해제 n / 11` 등)는 Room state로 두고
  섹션이 `bump()` / `raise(n)`으로 올린다. 각 페이지 HTML의 하드코딩 숫자는 무시.
- **엔트리 시퀀스**는 원안이 별도 페이지라 `body{overflow:hidden}`을 쓴다.
  한 스크롤로 합칠 때는 `lockScroll(true)`로 잠그고, **아무 입력(wheel/click/key/touch)이 오면 즉시 해제 + 최종 상태로 점프**.
- **섹션 마킹**: 모든 섹션 루트에 `data-<x>-section` 속성.
- **접근성**: Room에 `aria-live` 영역 하나, `announce(msg)`를 context로 노출.

---

## 9. 🔴 구현 전 대조 — HTML이 낡았을 수 있다

Variant HTML에는 **어느 시점 프롬프트로 만들었는지 표시가 없다.**
스펙 문서는 2026-07-31에 사실 검증(`_AUDIT.md`)으로 여러 페이지가 교체됐으므로,
**받은 HTML이 교체 전 프롬프트로 만들어진 것일 수 있다.**

**구현 전 3분 체크**

1. 해당 `NN-*.md`의 `## PAGE NN` 제목을 HTML의 섹션 제목과 대조
2. 그 페이지 상단에 `> 🔴 ... 전면 교체됨` 박스가 있으면 **HTML을 버리고 스펙을 따른다**
3. `_STATUS.md` 하단의 교체 이력 표도 확인

### 실제로 걸린 사례 — 07 수어지교 PAGE 04 (해결됨)

|           | 내용                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------ |
| 받은 HTML | 「고맙습니다」라고 썼더니 틀렸다 — **주관식 입력 + 동의어 판정**                                 |
| 스펙 현행 | 「에러는 없는데 영상 자리만 비어 있었다」 — **Storage/Firestore 이원화 + `findUrlOrFallback()`** |
| 스펙 판정 | _"주관식 입력 자체가 없습니다. 퀴즈는 4지선다. 그 페이지는 **통째로 창작**이었습니다"_           |

→ 낡은 HTML로 한 번 구현했다가 **스펙 텍스트만 보고 다시 썼다**. Variant를 다시 돌릴 필요 없이
`## PAGE NN` 아래 ` ```text ` 블록의 VERBATIM 문구·토큰·레이아웃 지시만으로 구현이 된다.
프롬프트 블록은 **HTML 없이도 그대로 구현 명세로 쓸 수 있다**는 뜻이다.

### 스펙 PAGE ↔ 구현 파일 대응 (07 수어지교)

| 스펙                  | 구현 파일             | 상태                                             |
| --------------------- | --------------------- | ------------------------------------------------ |
| PAGE 00 진입          | `EntrySection`        | ✅                                               |
| PAGE 01 히어로·갤러리 | `GallerySection`      | ✅                                               |
| PAGE 02 동작 데이터   | `MotionDataSection`   | ✅                                               |
| PAGE 03 어순          | `SentenceSection`     | ✅                                               |
| PAGE 04 영상 누락     | `Trouble01Section`    | ✅ (낡은 HTML로 만들었다가 스펙 기준으로 재작성) |
| PAGE 05 반복 학습     | `ReviewLoopSection`   | ✅                                               |
| PAGE 06 손 끊김       | `Trouble02Section`    | ✅                                               |
| PAGE 07 백엔드 구조   | `ArchitectureSection` | ✅                                               |
| PAGE 08 한계          | `LimitsSection`       | ✅                                               |
| PAGE 09 결과          | `ResultSection`       | ✅                                               |
| PAGE 10 회고·퇴장     | `RetroSection`        | ✅                                               |

> 참고: HTML 안의 섹션 번호 라벨(`03 · 트러블슈팅 01`)은 스펙 PAGE 번호와 다르다. **제목으로 대조할 것.**
