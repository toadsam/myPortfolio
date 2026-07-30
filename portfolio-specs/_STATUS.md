# 작업 상태 · 이어서 하기용

> 이 폴더는 **마을 건물 안 메인 포트폴리오**(`viewMode === "project-interior"` → `ProjectViewer`) 를
> 전면 재설계하기 위한 **Variant(디자인 AI)용 프롬프트 팩**입니다. 이력서 모드(`ResumeMode`)와 무관.
> 새 세션에서 이어서 할 때 **이 파일 + `09-darklab.md` 하나만** 읽으면 포맷을 재현할 수 있습니다.

---

## 0. ▶ 다음에 여기부터 (2026-07-30 기준)

**문서 작업은 11개 전부 끝났습니다.** 이제부터는 **코드 작업**입니다.

1. **선행 작업 (§5)** — `shared.tsx` 의 비export 8개를 export로 승격
   → 이걸 안 하면 stage 폴더에서 아무것도 못 씁니다
2. **방 구현** — 권장 순서: `03 festflow` → `08 ajou-adventure` → `09 darklab` → 나머지
   (§8의 ⭐ 선행 자산을 **방마다 제일 먼저** 만들 것)
3. **미디어 촬영** — `00-OVERVIEW.md` §5-3 작업 묶음 단위로 몰아서
   → 시간 없으면 묶음 **C·E·F (총 8장, 전부 최상 우선도)** 부터

**결정이 필요한 것 (구현 전에)**: `00-OVERVIEW.md` §2 의 **01 MyWave ↔ 10 TSEROF 색 충돌**
(둘 다 `#34d399`). 색을 바꾸려면 문서의 `=== DESIGN TOKENS ===` 블록을 문서당 11번 일괄 치환해야
하므로 **화면을 짜기 전에** 정하세요.

---

## 1. 진행 현황

| 파일 | 상태 | 컨셉 | 페이지 |
|---|---|---|---|
| `00-OVERVIEW.md` | ✅ 재작성 완료 | 사용법 · 컨셉 대비표 · 관통 규칙 · 미디어 통합표 | — |
| `01-mywave.md` | ✅ 완료 | 돈의 흐름을 물결로 · 스크롤=12개월 시간축 | 00–10 |
| `02-mystock.md` | ✅ 완료 | 트레이딩 데스크 · 스크롤=장 시간 | 00–10 |
| `03-festflow.md` | ✅ 완료 | 축제 관제 텐트 · 페이지가 스스로 계속 변함 | 00–10 |
| `04-muscleup.md` | ✅ 완료 | 캐릭터 시트 · 스크롤=EXP/레벨 | 00–10 |
| `05-aclub.md` | ✅ 완료 | 동아리 박람회 포스터 월 · 필터=FLIP 재배치 | 00–10 |
| `06-ajouchong.md` | ✅ 완료 | 학생회관 게시판 · **유일한 실배포 서비스** | 00–10 |
| `07-sign-language.md` | ✅ 완료 | 소리 없는 갤러리 · **윤리 기준 별도** | 00–10 |
| `08-ajou-adventure.md` | ✅ 완료 | 오락실 캐비닛 · 실제 플레이 가능 | 00–10 |
| `09-darklab.md` | ✅ 완료 · **포맷 기준 문서** | 손전등으로 읽는 어둠 | 00–10 |
| `10-tserof.md` | ✅ 완료 | 스테이지 셀렉트 화면 · 스크롤=잠금 해제 | 00–10 |

**문서 11개 전부 완료.** 남은 일은 문서가 아니라 **코드 작업** — §0 참고.

---

## 2. 문서 포맷 (모든 파일 공통)

```
# NN. 프로젝트명 — 프롬프트 팩
> 한 줄 소개 + 스택
> 사용법: PAGE 00~10 코드블록을 하나씩 복사해 Variant에 붙여넣기

# A. 컨셉 브리프 (읽기용)
  A-1 이 방의 한 문장
  A-2 왜 이 메타포인가
  A-3 ⭐ 연출↔개발실체 매핑 표      ← 문서 전체를 지배하는 표. 제일 먼저 쓸 것
  A-4 서비스/게임 설계 결정 ↔ 웹 재현 대응
  A-5 관람 곡선 (감정 + 정보 밀도 + 진행 지표)
  A-6 명장면 2개 (감정 1 + 기술 1)
  A-7 다른 9개 방과의 차별점
  A-8 절대 금지 (안전 규칙)

# B. 공통 디자인 토큰 표

# C. 페이지별 프롬프트  PAGE 00 ~ PAGE 10
  각 페이지 = ```text 코드블록 1개 (완전 자립적, 토큰 매번 반복)

# D. 구현 메모 (프롬프트 아님)
  D-1 개발 실체 커버리지 점검표
  D-2 새로 만들 파일 트리 (+ ⭐ 먼저 만들 공용 훅/컴포넌트 명시)
  D-3 재사용 / 선행 작업
  D-4 버릴 것 [KILL]
  D-5 미디어 확보 목록 [IMG-nn] [VIDEO-nn]
  D-6 코드 스니펫 확보 목록
  D-7 안전장치 대조표
  D-8 최종 체크리스트
```

### PAGE 프롬프트 내부 고정 헤딩 (순서 고정)
```
=== SUBSTANCE THIS PAGE MUST DELIVER ===   ← 이 페이지가 전달할 개발 실체
=== MOOD ===
=== COMPLIANCE ===                          (필요한 프로젝트만)
=== DESIGN TOKENS (use exactly) ===         ← 매 페이지 전체 반복
=== PERSISTENT HEADER ===                   (PAGE 01에만)
=== LAYOUT ===
=== CONTENT (Korean copy - VERBATIM, never translate) ===
=== (페이지 고유 인터랙션 스펙) ===
=== ANIMATION TIMELINE ===                  ← 0.00s 단위
=== PERFORMANCE ===
=== RESPONSIVE ===
=== ACCESSIBILITY ===
=== DO NOT ===
```

### 언어 규칙
- 프롬프트 지시문 = **영어**
- 화면에 나올 한국어 카피 = **`VERBATIM:` 뒤에 그대로**, 번역 금지 명시

---

## 3. 페이지 11장의 고정 역할

| PAGE | 역할 | 반드시 담을 것 |
|---|---|---|
| 00 | 진입 시퀀스 | **왜 만들었나(동기)를 4초 안에** · 건너뛰기 |
| 01 | 히어로 | **데모영상·GitHub를 버튼이 아닌 오브젝트로** · 고정 헤더(진행지표) |
| 02 | 핵심 구현 #1 | 관람객 직접 조작 → **즉시 옆에 실제 코드** |
| 03 | 기술 의사결정 | 3안 비교 + **"대신 포기한 것" 카드** |
| 04 | 트러블슈팅 01 | 증상→재현→소거→실패한시도→원인→Before/After→검증→**남은 한계** |
| 05 | 핵심 구현 #2 / 철학 | 프로젝트 고유 |
| 06 | 트러블슈팅 02 | 위와 동일 8단계 |
| 07 | 핵심 구현 #3 | 프로젝트 고유 |
| 08 | 아키텍처 · 범위 | **내가 한 것 / 팀원이 한 것 / 못 한 것** |
| 09 | 결과 · 갤러리 | `[IMG]` 4~5장 + **"지표 미수집" 면책 문구** |
| 10 | 회고 · 퇴장 | KPT(**PROBLEM 3개 필수**) + 다음단계 + GitHub + 퇴장 트랜지션 |

> 프로젝트 성격에 따라 02~07의 내용은 바뀌지만 **00·01·04·06·08·09·10의 역할은 고정**.

---

## 4. 전 문서 관통 규칙 (절대 어기지 말 것)

1. **연출은 개발 내용의 운반 수단이다.** 멋있기만 한 연출 금지. 모든 페이지에 개발 실체 최소 1개.
2. **지어낸 수치 0개.** 사용자 수·DAU·다운로드·ms 개선치 주장 금지. 대신 "재보지 못한 것" 카드.
3. **한계 인정을 매 프로젝트 4곳 이상**에 배치 (P03 포기한 것 / P04·P06 남은 한계 / P09 면책 / P10 PROBLEM).
4. **제어권 박탈은 최대 2회**, 각각 예고 + 건너뛰기 + 세션당 1회 + Esc + 언마운트 정리 + reduced-motion 비활성.
5. **자동 애니메이션은 뷰포트 밖 + 탭 숨김 시 정지.**
6. **스크롤 위치를 React state로 관리 금지** → CSS 변수 + `requestAnimationFrame`.
7. **코드 패널을 프레임/단계마다 리렌더 금지** → ref + class 토글.
8. **숫자는 전부 `tabular-nums`.**
9. `prefers-reduced-motion` 대응을 모든 페이지에 명시.
10. **`aria-live` 남용 금지** (실시간 로그/피드는 `aria-hidden` + 숨김 요약문).

### 프로젝트별 추가 금지
| 프로젝트 | 추가 규칙 |
|---|---|
| 02 mystock | 실존 종목명 0개 · 투자 권유 문구 0개 · "투자 자문 아님" 상시 고지 |
| 01 mywave | 금융 조언 0개 · 모든 금액 "예시 데이터" 표기 |
| 04 muscleup | **신체 사진·근육 이미지·목표 체중·다이어트 문구 전면 금지** · "의학적 조언 아님" |
| 08 ajou-adventure | **광과민성**: 스캔라인 정적 · 1Hz 초과 깜빡임 금지 · 전체 화면 플래시 금지 |
| 09 darklab | 피·시체·괴물 금지 · 비명 금지 · `[조명 켜기]` 상시 노출 |
| 10 tserof | **제어권 박탈 0회** · Space/방향키 **전역 캡처 금지**(컨테이너 활성 시만) · 팀원 실명 금지 · GitHub 접근 제한 고지 병기 |

---

## 5. 코드베이스 선행 작업 (10개 프로젝트 공통, 아직 안 함)

> `src/components/ui/project-viewers/richContent/shared.tsx` 의 아래 8개가
> **모듈 내부 함수(비export)** 상태. stage 폴더에서 쓰려면 **export로 승격 필요**.

```
DecisionTable · ArchDiagram · CompareBars · ProcessTimeline
QuoteCard · TldrBanner · BeforeAfter · ChallengeCard
```

구조 방향: `shared.tsx` 는 **공용 프레젠테이션 키트로 강등**,
프로젝트별 순서/레이아웃은 `stages/<projectId>/index.tsx` 가 각자 정의.
(현재 `shared.tsx` 의 단일 `RichProject` 인터페이스가 10개를 동일한 5단계로 강제 → 이게 문제의 뿌리)

---

## 6. 미해결 데이터 이슈

- **[FIX-01] muscleup 실시간 스택 불일치** — `src/data/projects.ts` 의 muscleup:
  `tech` 배열은 `Socket.IO`, `approach[1]`·`contribution[2]` 문장은 `SSE`.
  현재 `04-muscleup.md` 는 **SSE 기준**으로 작성됨. 결론 내고 3곳(문서 P05 / D-6 / `projects.ts`) 동시 정정 필요.

- **[FIX-02] tserof 팀 정보 미확인** — `richContent/data.ts` 의 tserof `meta` 가
  기간·팀 인원 모두 `[확인필요]`. `10-tserof.md` 는 이를 **숫자로 채우지 않고 그대로 노출**하는
  방식(P08 「확인 필요」 카드 · P09 facts 셀)으로 작성됨. 실제 값 확인 후 문서 3곳
  (P01 영상 길이 / P08 확인 필요 카드 / P09 facts 셀) + `data.ts` 동시 정정 필요.

- **[FIX-03] tserof 코드 스니펫이 요약본** — `data.ts` 의 `PlayerController.cs`·`StageManager.cs`
  는 4~5줄 요약. `10-tserof.md` P02(24줄)·P04(10/14줄)·P05(18줄)는 **실제 저장소 원본**이 필요.
  저장소가 팀원 소유(`KimEoJin24/TSEROF`)라 접근 가능 여부 먼저 확인할 것.

- **[FIX-04] 01 MyWave ↔ 10 TSEROF 색 충돌** — `projectThemes.ts` 에서 둘 다 `primary: "#34d399"`,
  배경도 `#04110c` / `#04120d` 로 거의 같음. 질감(유체 vs 블록)은 완전히 다르지만 같은 팔레트로
  읽힐 위험. **권고: MyWave를 `#2dd4bf` 틸 쪽으로** (TSEROF를 시안으로 옮기면 02 MyStock과 붙음).
  → 바꾸려면 문서의 `=== DESIGN TOKENS ===` 블록을 **문서당 11번 일괄 치환**해야 하므로
  **화면 구현 전에** 결정할 것. 상세는 `00-OVERVIEW.md` §2.

---

## 7. ~~남은 문서~~ — 전부 완료 (2026-07-30)

### `10-tserof.md` ✅
확정된 컨셉: **「스테이지 셀렉트 화면」** — 헤더 11칸 보드, 스크롤=`▮ 잠금 해제 n/11`
- 명장면 ① P04 씹혔던 점프가 되는 순간(P02에서 미리 겪게 함) ② P06 커밋 수렴 → CONFLICT
- 트러블 2건: P04 발판 끝 점프 씹힘(코요테 타임) / P06 Unity 씬 머지 충돌(작업 규칙으로 해결)
- 저장 데이터 버전 불일치는 트러블이 아니라 **P07 불러오기 분기**로 흡수
- **DarkLab 차별화**: 제어권 박탈 0회(오히려 입력을 요구) · 탄력적 오버슛 이징 ·
  Cinemachine/시야제한/공포연출/ScriptableObject를 주제로 삼지 않음

### `00-OVERVIEW.md` ✅ 재작성 완료
구버전의 `[CODE-nn]`/`[NUM-nn]` 태그 규약은 폐기하고 7개 절로 재구성:
프롬프트 팩 사용법 · 10개 방 컨셉/진행지표/명장면 대비표 · 전 문서 관통 규칙 ·
구현 순서 · **미디어 확보 통합표** · 개인정보 체크리스트 · 개별 문서 인덱스

**확정된 미디어 총계** (10개 문서 D-5 실측 합산):
**영상 10편 (확정 길이 합계 16분 13초, tserof만 `[확인필요]`) + 이미지 69장 (그중 최상 우선도 26장)**
- 방별 이미지: 01(4) 02(5) 03(4) 04(5) 05(**12**) 06(**12**) 07(7) 08(4) 09(4) 10(**12**)
- 기존 자산 재사용 가능: tserof 12장 중 **4장 이미 확보**
- 작업 묶음 **C(Unity 에디터 4장) · E(터미널 3장) · F(콘솔 1장) = 8장이 전부 최상 우선도** → 여기부터

---

## 8. 각 방의 「⭐ 선행 자산」 총정리 (구현 시 제일 먼저 만들 것)

각 문서 `D-2` 에 적혀 있지만, 여기 모아둡니다. **이걸 안 만들고 페이지부터 짜면 전부 다시 짭니다.**

| 방 | 먼저 만들 것 | 몇 개 페이지가 공유 |
|---|---|---|
| 01 mywave | `WaterSurface.tsx` (`amplitude` 애니메이션 가능하게) | 4 |
| 02 mystock | `usePortfolioMath.ts` (`method`, `closePositionOnZero` 플래그) | 3 |
| 03 festflow | `useLiveHeartbeat.ts` (타이머 1개) | 전 페이지 |
| 04 muscleup | `useExpProgress.ts` (스크롤→Lv.1~9) | 전 페이지 |
| 05 aclub | `clubs.ts` → `PosterCard.tsx` → `usePosterWall.ts` (FLIP) | **8** |
| 06 ajouchong | `BoardSurface` · `PinnedPaper` · `BrowserSim` · `DeployPipeline` · `useLiveBadge` | 5종 |
| 07 sign-language | `SvgHand.tsx` → `signData.ts` → `useSignPlayer.ts` | **7** |
| 08 ajou-adventure | `useMiniRunner.ts` (`cleanup`, `jumpMode`, `gapRange`, `scaleMode`) | **5** |
| 09 darklab | `useFlashlight.ts` (마우스→CSS 변수) | 8 |
| 10 tserof | `useMiniPlatformer.ts` (고정 dt 물리 · `coyoteMs` 플래그) → `StageBoard.tsx` | 2 + **3** |

> 10 tserof 보충: `useMiniPlatformer` 는 P02(`coyoteMs: 0`)·P04(토글)가 **같은 훅**이어야 논증이 성립.
> `StageBoard` 는 헤더(mini)·P01(large)·P05(interactive) 세 곳이 크기만 바꿔 쓰는 하나의 컴포넌트.

**10개 공통 선행 1건**: `shared.tsx` 의 비export 8개 → export 승격 (§5 참고)

---

## 9. 다음 세션 시작 프롬프트 예시

**문서는 전부 끝났습니다. 이제 코드 작업입니다.**

1단계 (선행 작업):
```
portfolio-specs/_STATUS.md §5 선행 작업대로
shared.tsx 의 비export 8개를 export로 승격하고,
stages/ 폴더 구조를 만들어줘.
```

2단계 (첫 방 구현):
```
portfolio-specs/03-festflow.md 읽고
useLiveHeartbeat.ts 부터 만든 다음 PAGE 00~01을 구현해줘.
```

색 결정이 먼저 필요하면:
```
_STATUS.md §6 [FIX-04] 색 충돌 건, MyWave를 틸 계열로 바꾸는 쪽으로
projectThemes.ts 와 01-mywave.md 의 DESIGN TOKENS 블록 전부 일괄 수정해줘.
```
