# 득근득근 (MuscleUp)

> **증명하는 것**: 한 번 만들고, 사용자에게 듣고, 성격을 바꿔 다시 만든 3-tier 풀스택.
> 이 이력서에서 기술 깊이를 책임지는 프로젝트다.

## ⚠️ 먼저 알아야 할 것 — 버전이 둘이다 (2026-08-28)

발표자료가 두 개다. 둘 다
`바탕 화면/2026-1/미디어프로젝트/` 에 있다.

|         | 문서                     | 성격                                                                                              |
| ------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| **1.0** | `MuscleUp.pdf` (28쪽)    | 정보 중심. AI 상담 · 자랑방 · 프로틴 · 프로그램 신청. 도메인 4개                                  |
| **2.0** | `득근득근2.0.pdf` (13쪽) | 실행 중심. 홈=로비 · 출석=성장데이터 · 관리자=운영콘솔. 캐릭터·랭킹·크루·실시간 라운지·이벤트 CMS |

**이 포트폴리오는 통째로 1.0 문서 기준으로 지어져 있었고, 코드는 2.0이다.**
오늘 찾은 불일치가 전부 여기서 나왔다 — Refresh 로테이션(1.0 p.20 에 명시,
2026-04-01 에 코드에서 걷어냄, 2.0 문서엔 언급 없음), MySQL 표기(운영은
PostgreSQL), 죽은 배포 링크. 문서가 코드를 못 따라간 게 아니라 **다른 버전의
문서**였다.

### 가장 값진 것 — 피드백 4개가 기능과 1:1로 맞물린다

1.0 p.24 「사용자 피드백 & 개선 로드맵」에 적힌 **사용자 말 원문**과 2.0 이 한 일:

| 1.0 에서 들은 말                              | 2.0 에서 한 것                                                     |
| --------------------------------------------- | ------------------------------------------------------------------ |
| "처음 사용할 때 어디서 뭘 해야 할지 몰랐어요" | 홈을 로비로 — 첫 화면 CTA 「오늘 출석 시작」 + 「지금 해야 할 일」 |
| "다른 사람들과 더 많이 소통하고 싶어요"       | 실시간 라운지(Socket.IO) + 크루 챌린지                             |
| "내 운동 데이터를 더 자세히 보고 싶어요"      | 캐릭터 레벨·티어·진화 + 공개 랭킹 + 인바디 OCR                     |
| "AI 답변 기다리는 게 길어요"                  | **아직 안 함**                                                     |

신입 포트폴리오에서 「피드백 반영」은 거의 다 말뿐인데, 여기는 **피드백 원문이
1.0 자료에, 반영 결과가 2.0 자료에** 있어 문서 두 개가 서로를 증명한다.
**넷 중 셋만 했다는 것도 그대로 쓴다** — 안 한 하나가 나머지 셋을 믿게 만든다.

### ✅ 반영 완료 (2026-08-28)

- **전용 전시실에 02 「1.0 → 2.0」 칸을 새로 넣었다**
  ([`P02Evolution.tsx`](../../src/components/ui/project-viewers/muscleup/sections/P02Evolution.tsx)).
  피드백 4개를 말풍선으로 놓고, 눌러야 고친 화면이 열린다. 방이 13칸 → **14칸**이
  되면서 02~12 가 03~13 으로 밀렸다(`Page index` 와 Kicker 라벨 둘 다).
- **2.0 화면 7장을 `public/projects/muscleup/v2/` 에 넣었다** — 2.0 자료에 실린
  실제 캡처를 webp 로 변환한 것이고 새로 찍은 것은 없다.
  ⚠️ **홈 화면 배너에 참여자 얼굴이 있어 그 구간(y 330~487)은 잘라냈다.**
  `home-lobby` / `home-todo` 가 그래서 두 조각이다.
- 이력서 카드: 빈칸이던 `problemShot` 에 1.0 문제 + 피드백 원문, 갤러리에
  라운지 · 캐릭터 · 관리자 콘솔 · 인바디 4장 추가.
- `P08Schema` 의 「테이블 14개」 → 「1.0 때 그린 핵심 14개 … 지금은 엔티티 31개 ·
  도메인 8개」로. PERFORMANCE 패널도 실제로 건 인덱스 이름으로 교체.

- 저장소 `toadsam/Ajou_MuscleUp` · 기간 2025.09 ~ 진행 중 · 개인 개발
- 시연 영상 `youtube.com/watch?v=y6pbAoxveQM`
- 배포 `muscle-up.click` — **현재 일시 중단** (그래서 링크는 안 걸어 둠)

---

## 저장소에서 확인한 사실

전부 파일 트리·소스에서 직접 센 값이다. 심사자도 같은 방법으로 검증할 수 있다.

| 항목                 | 값                                                   | 근거                                                          |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| 최상위 3-tier        | `frontend` 111 · `backend` 312 · `realtime` 569 파일 | 폴더 구조                                                     |
| Controller           | **28개**                                             | `*Controller.java`                                            |
| Service / Repository | 25 / 31개                                            | 〃                                                            |
| `@Entity` 클래스     | **31개** (enum 14개 별도)                            | `@Entity` 파싱                                                |
| users 유입 FK        | **28개**                                             | 관계 파싱                                                     |
| 도메인               | **8개**                                              | 인증·커뮤니티·크루·친구채팅·프로틴공유·기록AI·이벤트·운영로그 |
| 백엔드 포트          | `:8080`                                              | `application.properties` `server.port=${PORT:8080}`           |
| 실시간 포트          | `:4001`                                              | `realtime/src/server.ts` `PORT ?? 4001`                       |
| 프론트 포트          | `:5173`                                              | 같은 파일 `ORIGIN ?? "http://localhost:5173"`                 |
| 실시간 서버 소스     | **3개** (`server.ts` `rooms.ts` `types.ts`)          | 얇게 뺀 게 요점                                               |
| 환경 분리            | `application-local.example` / `-prod` / `-test`      | 프로파일 4종                                                  |
| 파일 저장 전환       | `app.s3.enabled`                                     | 로컬은 파일시스템, 배포는 S3                                  |
| 보안 설정            | `SecurityConfig.java` · `CorsConfig.java`            | 실재 확인                                                     |
| 토큰 저장            | `RefreshToken` **테이블 존재**                       | 저장은 사실. **"단일 저장·로테이션"은 아니다 → 아래 1-b**     |

파싱 원본: [`../muscleup-erd-source.json`](../muscleup-erd-source.json)

### 사이트에 안 나온 것들 — 넣을 가치가 있다

- **`FriendChatRoom`이 `userLow` / `userHigh` 로 되어 있다** — 정렬된 쌍으로
  중복 방을 막는 기법. 면접에서 "왜 이렇게 했나요"를 물으면 좋은 답이 나온다.
- **`AuditLog` · `AnalyticsEvent`** — 운영을 생각한 흔적인데 어디에도 언급이 없다.
- **프로틴 공유** (`Protein` · `ShareApplication` · `ShareMessage` · `Review`) —
  아무도 예상 못 할 기능인데 안 보인다.
- **`EmailVerification`** — SMTP 인증 플로우가 테이블로 남아 있다.
- **캐릭터 성장** (`CharacterProfile` · `CharacterEvolutionHistory`) — "게임처럼
  지속하게 만든다"는 컨셉의 실체.

---

## 지금 상태

| 슬롯                  | 상태                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------- |
| 대표 화면 (16:9)      | ✅ `muscleup.webp`                                                                          |
| 문제 상황             | ✅ **1.0 홈 + 피드백 원문** (2026-08-28)                                                    |
| 시스템 구성도 (21:9)  | ✅ **코드로 생성 완료**                                                                     |
| 데이터 도메인 지도    | ✅ **코드로 생성 완료**                                                                     |
| 개선 결과 화면 (21:9) | ✅ **API 도메인 지도** (2026-08-28)                                                         |
| 결과 갤러리           | ✅ 인증 시퀀스(전체폭) · 라운지 · 캐릭터 · 관리자 · 인바디 — **옛 ERD 는 뺐다**(2026-08-29) |
| 지표                  | ✅ 회원 약 50명 · 피드백 3/4 · 목록 3.2배 · AI 품질 8×5 (2026-08-29)                        |
| 링크                  | ✅ GitHub · 시연 영상                                                                       |

---

## 🤖 코드로 만들 것

### ✅ 1. 인증 흐름 시퀀스 — `public/projects/muscleup/auth-sequence.svg` (2026-08-28)

갤러리에 붙였다. 4개 축(브라우저 쿠키 · axios 인터셉터 · Spring · `refresh_tokens`)으로
로그인 → 15분 만료 → 재발급 → 로그아웃을 그렸다.

**단, 그리려던 흐름과 코드가 달랐다. 아래 1-b 를 먼저 읽을 것.**

### ⚠️ 1-b. Refresh 로테이션이 코드에 없다

이 문서와 PDF 8·13쪽, 전용 전시실 `P03Refresh`, 면접 예상 질문표가 모두
_"재발급 시 기존 토큰 즉시 폐기(로테이션)"_ 를 말하는데, `RefreshTokenService.rotate()`
는 지금 **기존 토큰을 그대로 돌려준다.**

```java
// Keep refresh token stable to prevent race-condition logouts when
// parallel requests trigger refresh at the same time.
return current.getToken();
```

git 로 추적한 경위 — **전부 2026-04-01 하루에 일어났다.**

| 커밋                           | 한 일                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------- |
| (그 전)                        | `issueFor` 가 유저당 1행 유지 · `rotate` 가 행 삭제 후 재발급 = 진짜 로테이션 |
| `72b38fa [ADD] 로그인풀림수정` | 유저당 1행 제약 제거(기기별 로그인) + 로테이션을 in-place 갱신으로            |
| `bacef85 "1"`                  | **로테이션 제거** — 기존 토큰 그대로 반환                                     |

즉 **"안 만든 것"이 아니라 "만들었다가 되돌린 것"** 이다. 병렬 요청이 동시에
`/refresh` 를 치면 서로의 토큰을 무효화해 로그아웃되는 경쟁 상태를 만났고,
같은 날 프론트(`frontend/src/lib/api.ts`)에 재발급 단일화(single-flight —
`refreshing` 플래그 + `waiters` 큐, 실패 시 대기자 전부 reject)를 강화했다.

**이건 약점이 아니라 더 좋은 이야기다.** 로테이션은 신입 포트폴리오에 흔한
"교과서에서 봤고 넣었다" 항목이지만, _"넣었더니 병렬 갱신에서 로그아웃이 터져서
클라이언트 단일화로 바꿨다"_ 는 **실제로 돌려 본 사람만 할 수 있는 말**이다.
면접에서 "그럼 탈취 대응은요?"로 이어지면 grace period / refresh token family 를
말하면 된다.

고칠 곳 셋. **어느 쪽이든 셋을 같이 고쳐야 한다** — 하나만 고치면 서로 모순된다.

1. PDF 8·13쪽
2. 전용 전시실 `P03Refresh` — 로테이션 데모가 이 방의 클라이맥스다
3. 이 문서 아래 「면접 예상 질문」 표의 로테이션 답변

부수 사실 둘: **"DB 단일 저장"도 지금은 아니다**(`issueFor` 가 행을 안 지워
기기마다 한 행). **refresh 수명이 프로파일마다 다르다** — local 14일 /
**prod 90일**. 문서의 "14d"는 로컬 값이다.

### ✅ 3. API 도메인 지도 — `public/projects/muscleup/api-map.svg` (2026-08-28)

`개선 결과 화면(21:9)` 슬롯에 붙였다. 컨트롤러 **28개 · 엔드포인트 136개**를
8개 도메인으로 묶었다(근거: `@RequestMapping` + `@*Mapping` 카운트).
`CrewController` 하나가 15개로 가장 크고, 자랑방은 글과 반응을 컨트롤러로 갈랐다.
**프로틴 공유(16개)·이벤트 CMS(15개)가 이 그림에서 처음 보인다.**

### 2. AWS 배포 구성도 — 아직. 근거가 반쪽이다

코드로 확인되는 건 **S3 뿐**이다(`app.s3.enabled/bucket/region/prefix/public-base-url`).
**CloudFront·Route53·ACM 은 소스에 근거가 없고**, GitHub Actions 워크플로도 없다
(= 수동 배포). PDF 11쪽 진술만 있는 부분이라, 그릴 때 근거 있는 것과 없는 것을
구분하거나 본인 확인이 필요하다.

### ❌ 4. 커밋 활동 그래프 — 만들지 않는 것을 권한다

실제로 세어 보니 「성실」의 증거가 되지 않는다.

- 전체 **186 커밋** (2025-09-03 ~ 2026-08-12), 저자 1명
- **2026-03 한 달에 111개 (60%)** — 주간으로는 W13:65 · W14:36 의 2주 폭발,
  나머지 달은 2~12개
- 커밋 메시지 **48개(26%)가 의미 없음** — `1` 이 29개, `2` 5개, `Update Foo.tsx` 류

그래프를 실으면 "왜 3월에 몰렸나 / 왜 커밋 이름이 `1` 인가"를 부르는 자료가 된다.
**차라리 W12~W14 3주를 「크루 기능 스프린트」로 좁혀** 그 안에서 무엇이 나갔는지
(크루 마이그레이션 · 이벤트 CMS · 관리자 페이지 개편 · PWA · 모바일 사진 최적화)
보여 주는 게 방어 가능하다. 지금은 보류.

---

## ✋ 직접 만들 것

### 1. 정식 ERD ⭐⭐⭐ — DBML 생성 완료, 남은 건 배치·내보내기

**툴**: dbdiagram.io · ERDCloud · DataGrip
코드로 만든 도메인 지도는 _"도메인을 나눠 설계했다"_ 를 증명한다. 정식 ERD는
_"데이터 모델링을 할 줄 안다"_ 를 증명한다. 필요한 것: 컬럼 타입·길이,
PK/FK/UNIQUE/NOT NULL, 크로우풋 카디널리티, **인덱스**.
대상은 **핵심 12~15개 테이블**. 31개를 다 그리면 안 읽힌다.

**2026-08-28 — [`../muscleup-erd.dbml`](../muscleup-erd.dbml) 생성됨.**
엔티티 소스에서 직접 뽑았다(생성기: [`../../scripts/muscleup-erd-dbml.mjs`](../../scripts/muscleup-erd-dbml.mjs),
`node scripts/muscleup-erd-dbml.mjs <entity-dir> docs/muscleup-erd.dbml core`).
담긴 것: 핵심 **17개 테이블**(전체 31개 중) + `brag_media` 컬렉션 테이블,
컬럼 타입·길이, PK/FK/NOT NULL/UNIQUE, 복합 UNIQUE, 명시적 인덱스,
**enum 8종의 실제 상수값**(`CharacterTier` 8단계 BRONZE→CHALLENGER 등),
FK 관계 24개.

남은 직접 작업은 셋뿐이다.

1. dbdiagram.io 에 붙여넣기
2. **배치 정리** — `users` 를 가운데 두고 도메인별로 뭉치게. 자동 배치는 안 읽힌다
3. PNG 내보내기 (최소 1600px)

#### draw.io 를 쓸 거면 — `../muscleup-erd.drawio` (2026-08-28)

**draw.io 는 DBML 을 못 읽는다.** SQL(`CREATE TABLE`) 임포트는 되지만 그 경로는
**FK 관계선을 안 그려 준다** — 24개를 손으로 이어야 한다. 그래서 같은 생성기가
박스·컬럼·관계선이 이미 놓인 `.drawio` 를 직접 뱉게 했다.

- 테이블 **18개**(핵심 17 + `brag_media`) · FK 관계선 **24개**(까마귀발이 FK 쪽)
- 행마다 `PK` / `FK` / `U`(단일 UNIQUE) / `NN` 표시, 맨 아래 회색 줄에
  `UQ`(복합 UNIQUE)·`IX`(인덱스)
- 도메인별 색 + 7열 배치(users 가 가운데). 자동 배치가 아니라 손으로 정한 열이다
- 여는 법: app.diagrams.net → File ▸ Open from ▸ Device. 내보내기는
  File ▸ Export as ▸ PNG (Zoom 200~300%, Transparent 끄기)

검증: XML 태그 균형·엣지 종점 24개 전부 실제 컬럼 id 로 해석됨 + draw.io 의
mxGraph 파서에 실제 스타일 문자열을 넣어 디코드 확인. **다만 눈으로 렌더된 그림을
본 것은 아니다** — 열었을 때 겹치는 박스가 있으면 끌어서 옮기면 된다.

⚠️ 이 파일을 만들다 파서 버그가 하나 드러났다. `@Table(indexes = {@Index(name=…)})`
의 **안쪽 `name` 을 테이블 이름으로 읽어** `brag_post` 가 통째로 빠졌었다.
위에서 인덱스를 추가하면서 처음 생긴 문제다 — 중첩 어노테이션을 걷어낸 뒤
이름을 찾도록 고쳤다(`muscleup-erd-dbml.mjs`).

### ✅ 1-c. 인덱스 추가 완료 (2026-08-28) — 아래 1-b 는 그 전 상태 기록

(A) 안으로 진행했다. 저장소(`Assets/Ajou_MuscleUp`)에 넣은 것:

| 엔티티               | 인덱스                                                           | 받치는 쿼리                                              |
| -------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| `BragPost`           | `idx_brag_post_created(created_at)`                              | `findAllByOrderByCreatedAtDesc` — 자랑방 최신순          |
| `CharacterProfile`   | `idx_character_public_rank(is_public, level, updated_at)`        | `findByIsPublicTrueOrderByLevelDescUpdatedAtDesc` — 랭킹 |
| `AttendanceLog`      | `idx_attendance_shared_report(shared, report_count, updated_at)` | `findBySharedTrueOrderByReportCountDesc…` — 신고 관리    |
| `ProgramApplication` | `idx_program_app_created(created_at)`                            | `findAllByOrderByCreatedAtDesc` — 신청 목록              |

- 필터 컬럼을 복합 인덱스 맨 앞에 뒀다. 정렬 두 컬럼이 같은 방향(DESC)이라
  오름차순 인덱스를 거꾸로 훑어 그대로 쓸 수 있다.
- `ddl-auto=update` 라 앱을 다시 띄우면 Hibernate 가 만든다. 기록용으로
  `backend/sql/migration_20260828_query_indexes.sql` 도 같이 남겼다.
- `./gradlew compileJava` 통과. **실제 인덱스 생성은 DB 를 띄워야 확인된다** —
  아직 검증 못 했다.

### 1-b. ⚠️ 인덱스가 거의 없었다 (2026-08-28 이전 기록)

PDF 10쪽에 _"조회 중심 테이블 인덱스 및 페이지네이션 고려"_ 라고 적혀 있는데,
엔티티 31개를 전부 훑은 결과 **명시적 `@Index` 는 2개 테이블뿐**이다.

| 있는 것               | 내용                                                        |
| --------------------- | ----------------------------------------------------------- |
| `audit_logs`          | `idx_audit_created(created_at)` · `idx_audit_user(user_id)` |
| `email_verifications` | `idx_verif_email_created(email, created_at)` — 복합         |
| 복합 UNIQUE **10개**  | 아래 참고 (UNIQUE 는 인덱스이기도 하다)                     |

복합 UNIQUE 10개: `attendance_logs(user_id, workout_date)` ·
`brag_like(brag_post_id, user_id)` · `character_profiles(user_id)` ·
`event_participants(user_id, event_id)` · `friend_chat_rooms(user_low_id, user_high_id)` ·
`friendships(user_low_id, user_high_id)` · `protein_share_applications(protein_id, user_id)` ·
`user_body_stats(user_id)` · `workout_crew_join_requests(crew_id, user_id)` ·
`workout_crew_members(crew_id, user_id)`.

**하나는 그 자체로 좋은 답변거리다.** `AttendanceLogRepository` 의
`findByUserIdAndDateRangeOrderByDateAsc` 는 `attendance_logs(user_id, workout_date)`
복합 UNIQUE 를 그대로 범위 스캔 인덱스로 쓴다 — _"중복 출석을 막으려고 건 UNIQUE 가
날짜 범위 조회 인덱스 역할까지 한다"_ 는 설명이 된다.

**반대로 인덱스가 없는데 정렬·필터하는 쿼리가 있다.** 리포지토리 31개에서 찾은 것:

| 쿼리                                                  | 지금                     |
| ----------------------------------------------------- | ------------------------ |
| `findAllByOrderByCreatedAtDesc` (3곳)                 | `created_at` 인덱스 없음 |
| `findBySharedTrueOrderByReportCountDescUpdatedAtDesc` | 인덱스 없음              |
| `findByIsPublicTrueOrderByLevelDescUpdatedAtDesc`     | 인덱스 없음              |

여기서 갈린다.

- **(A) 코드에 인덱스를 추가한다** — 위 3개에 `@Index` 를 걸고 ERD에 그린다.
  PDF 문장이 사실이 되고, "쿼리를 보고 인덱스를 설계했다"는 더 센 이야기가 된다.
- **(B) PDF 문장을 사실에 맞게 고친다** — _"복합 UNIQUE 로 중복을 막고, 그 인덱스를
  범위 조회에 재사용"_ 처럼. 지금 있는 것만으로 정확하게.

**(A) 를 권한다.** 근거가 리포지토리에 이미 있어서 지어내는 게 아니고, 면접에서
"왜 이 컬럼에 걸었나요"에 답할 재료가 같이 생긴다. 다만 저장소를 고치는 일이라
ERD를 먼저 그리고 나중에 해도 된다.

### 2. 앱 화면 — 시연 영상에서 뽑으면 5분 ⭐⭐⭐

**2026-08-28 확인 — 5장 중 1장은 이미 있다.** `public/projects/muscleup/` 를
전부 훑어 보니 `ai-analyze.webp`(체성 분석 입력 + AI Lab) 와
`ai-history.webp`(AI 상담 기록)가 이미 있고, `P07AiCoach` 에서 쓰이고 있다.
**AI 코치는 다시 찍을 필요가 없다.** 다만 전용 전시실에만 있고 이력서 카드
슬롯(`gallery`)에는 없으니, 원하면 옮겨 붙이면 된다.

영상(`y6pbAoxveQM`)을 멈추고 캡처할 것은 이제 넷:

- ~~**AI 코치 대화**~~ ✅ 이미 있음
- **자랑방** 글·댓글·좋아요
- **라운지** 실시간 위치/채팅 ← 실시간 서버의 존재 이유
- **캐릭터 성장** 화면
- **크루** 화면

#### ⚠️ `code-refresh.webp` 는 쓰지 말 것

이 폴더에서 유일하게 아무 데서도 안 쓰이는 파일이다. 그리고 **계속 안 쓰는 게
맞다** — 걷어낸 로테이션 코드(`deleteByUser_Id` · `delete(current)`)를 찍은
화면에 **"DB 기반 Refresh 토큰 관리·로테이션(재사용 차단)"** 이라는 설명이
이미지 안에 박혀 있다. 붙이는 순간 위 1-b 에서 정리한 것이 도로 무너진다.
3막에 「1차 구현」 자료로 쓰고 싶다면 저 문구부터 다시 찍어야 한다.

### 3. 기존 ERD 이미지 교체 ⭐⭐

지금 `muscleup-erd.webp` 는 388px로 축소돼 글자가 안 읽히고 **손으로 그린 빨간
화살표와 "만드는 핵심 테이블" 메모**가 그대로 있다. 작업 중 캡처다.
정식 ERD로 교체하거나, 최소 1600px 재캡처.

### 4. 운영 중 겪은 사건 ⭐⭐

PDF 12쪽의 **ACM 리전 함정**(CloudFront는 us-east-1 인증서 필요)과 **캐시 무효화**.
그때의 에러 화면·CloudFront Invalidation 화면·로그가 남아 있으면 강력하다.
단, **계정 ID·ARN은 반드시 가릴 것.**

### 5. 실사용 근거 ⭐⭐

"약 50명"의 근거가 될 만한 것 — 가입자 목록 화면(개인정보 가리고), 크루 목록,
자랑방 글 수. 숫자 옆에 화면이 있으면 다르게 읽힌다.

---

## ⚠️ 확인·수정 필요

2026-08-28 로컬 작업본(`Assets/Ajou_MuscleUp`, remote `toadsam/Ajou_MuscleUp`)에서 다시 셈.

- 🔴🔴 **`application-test.properties` 에 자격증명이 리터럴로 커밋돼 있다.**
  공개 저장소이고(인증 없이 clone 됨), **2025-11-22 부터 9개월째**다.
  `spring.mail.username` / `spring.mail.password`(23자) / `spring.datasource.password` /
  `jwt.secret`(32자) 넷. **이 문서의 어떤 항목보다 급하다.**
  `application-prod.properties` 는 반대로 **전부 `${환경변수}` 로 잘 되어 있다** —
  test 파일만 빠졌다. `.gitignore` 에도 `application-local.properties` 와
  `application.properties` 만 있고 test 는 없었다.
  순서가 중요하다: **① 자격증명을 먼저 교체(메일 계정 비밀번호·jwt.secret) →
  ② 추적 제거.** 히스토리에는 그대로 남으므로 교체 없이 파일만 지우면 아무 소용이 없다.
- ✅ **`.gitignore` 보강 + 추적 제거 완료** — `node_modules/`(realtime 이 빠져 있었다) ·
  `realtime/dist/` · `uploads/` · `backend/uploads/` · `application-test.properties` 추가하고
  `git rm -r --cached` 로 **589개**를 인덱스에서 뺐다(디스크 파일은 그대로).
  커밋은 안 했다. `application-test.properties` 는 위 순서 때문에 **일부러 추적 제거를
  하지 않았다** — 교체가 먼저다.
- 업로드 사진 26장은 **본인 사진 + 공개 동의를 받은 사진**임을 확인했다(2026-08-28).
  히스토리 재작성·force push 는 하지 않는다.
- ~~RDS 엔드포인트가 공개돼 있다~~ — **오판이었다.** 그 주소는
  `application-local.properties` 에 있고 이 파일은 추적되지 않는다. 공개된 적 없다.

- 🔴 **실사용자가 올린 사진이 공개 저장소에 커밋돼 있다 — 이게 제일 급하다.**
  `git ls-files` 기준 업로드 이미지 **26장**이 추적 중이고, 그중 다수가
  `backend/uploads/attendance/2026/03/` 즉 **출석 인증 사진**이다. 피트니스 앱의
  인증 사진은 신체 사진일 수 있고, 올린 사람은 공개 저장소에 박제될 걸 몰랐다.
  `.gitignore` 에 `uploads/` 가 아예 없다. **심사자 눈에 띄는 문제가 아니라
  개인정보 문제다.** 지우려면 히스토리에서 빼야 하므로(`git rm --cached` 만으로는
  과거 커밋에 남는다) 되돌리기 어려운 작업 — 손대기 전에 방법을 정할 것.
- **`realtime/node_modules` 가 커밋돼 있다 — 파일 560개** (예전에 369개로 적었는데
  더 늘었다). `.gitignore` 는 `frontend/node_modules/` 만 막고 있고 `realtime/` 은
  빠져 있다.
- **`realtime/dist` 도 커밋돼 있다** (빌드 산출물 3개).
- **`muscle-up.click` 재가동 여부** — 살아 있으면 이력서에서 가장 강한 링크가 된다.
  2026-08-28 확인 결과 **연결 자체가 안 된다**(HTTP 000).
  ✅ 전용 전시실에 남아 있던 죽은 링크 3개를 뺐다 — `P01Hero` 배포 슬롯,
  `P11Result` 「서비스 열기」 버튼, `P12Retro` 나가는 문의 `muscle-up.click ↗`.
  `P11Result` 제목도 _"지금 켜져 있는 서비스입니다"_ → _"실제로 돌던 서비스입니다"_
  로 고쳤다. `resume.ts` 는 이미 링크를 빼 뒀는데 방만 남아 있었다.
- ✅ **운영 DB 는 PostgreSQL 이다** — `application-prod.properties` 가
  `postgresql://` + `PostgreSQLDialect`. MySQL 은 로컬 프로파일이다.
  전시실이 전부 MySQL 이라고 적고 있어서 고쳤다(`P09Infra` 홉 이름·역할,
  `P01Hero` 스택 셀, ERD alt 두 곳). **PDF 11쪽의 「RDS(MySQL)」 은 아직 그대로다.**
- ✅ `P11Result` 의 「14 MySQL 테이블」 → 「14 핵심 테이블 (전체 31)」.
  14 는 PDF ERD 캡처에 그려진 수고, 실제 `@Entity` 는 31개다.
- ✅ **이력서 원페이지(/resume)의 숫자 모순을 잡았다 (2026-08-29).** 같은 페이지가
  도메인을 `8`(요약·ERD·API맵)과 `16`(RESULTS 지표)으로, 엔티티를 `31`(ERD)과
  `46`(아키텍처 그림)으로 동시에 말하고 있었다. 저장소 실측은 **@Entity 31 ·
  @RestController 28 · 8 도메인**(도메인은 본인이 묶은 값). `16` 의 출처는
  `process` 의 "16 prefix"(URL prefix 개수)가 어느 시점에 "API 도메인" 으로
  바뀐 것이었다. 아키텍처 그림의 DB 칸도 `MySQL / RDS` → `PostgreSQL(운영) ·
로컬은 MySQL`, `P01Hero` 스택 셀의 `RDS` 도 뺐다.
- ✅ **1.0 첫 화면은 캡처가 없다 — 코드에서 복원했다.** 1.0 발표자료 p.13~15 의
  "화면"은 전부 AI 목업이라 한글이 깨져 있다("목툐, 재형, 종증 투틴") — 실제
  화면인 척 실으면 확대하는 순간 주장이 무너진다. 대신
  `frontend/src/pages/Home.tsx @1093e53`(2025-12-03) 원문으로 Before 를 만들었다:
  버튼은 `AI 상담·루틴 받기` / `커뮤니티 둘러보기`, 통계 `180+ · 45 · 24` 는
  `const stats` **하드코딩**. 2.0 은 `오늘 출석 시작` 한 개 + `metrics?.` 서버값.
  180+ 와 이력서의 "약 50명" 이 어긋나 보이는 이유도 이것이다.
- ✅ RESULTS 지표 넷이 전부 "내가 만든 양" 이었다(aClub·총학생회는 이미 고쳐 둔
  기준). `약 50명 이용 회원 · 3/4 반영한 사용자 피드백 · 4→8 도메인 · 1인 풀스택`
  으로 바꾸고 `metricsNote` 로 출처를 붙였다. 리서치 인용도 자작 문장(README ·
  "설계 관점")에서 **1.0 p.24 사용자 피드백 원문 3개**로 교체했다 — 셋째는 아직
  못 고친 AI 응답 속도다.

### 인덱스 성능 실측 (2026-08-29) — 재현 방법 포함

**측정 이유**: 페이지 전체에 "만든 것의 개수"만 있고 **동작을 말하는 숫자가
하나도 없었다**(키워드 검색: 테스트·CI·쿼리·응답시간·에러율 전부 0회).

**환경**: 운영과 같은 **PostgreSQL 16.15** 를 Docker 컨테이너로 띄우고
(`127.0.0.1:5433` 바인딩, 측정 후 `docker rm -f`), 사용자의 로컬 MySQL80
서비스와 `muscleup` DB 는 **접속조차 하지 않았다**(측정 전후 `Stopped`/`Manual` 유지 확인).

**데이터**: 표마다 **20만 행**. 컬럼 정의는 `entity/*.java` 의 `@Column` 을 그대로
옮겼고, 분포는 `visibility` PUBLIC 95% · `is_public` 70% · `shared` 20% ·
`report_count` 0 이 97% 로 잡았다. 쿼리는 리포지토리 메서드가 만드는 SQL 그대로:

| 화면           | 리포지토리 메서드                                     |
| -------------- | ----------------------------------------------------- |
| 자랑방 목록    | `findAllByOrderByCreatedAtDesc(Pageable)`             |
| 캐릭터 랭킹    | `findByIsPublicTrueOrderByLevelDescUpdatedAtDesc`     |
| 공유 인증 관리 | `findBySharedTrueOrderByReportCountDescUpdatedAtDesc` |
| 프로그램 신청  | `findAllByOrderByCreatedAtDesc(Pageable)`             |

**방법**: `EXPLAIN (ANALYZE, FORMAT JSON)` 의 `Execution Time`, warmup 1회 뒤
**7회 측정 중앙값**. 인덱스 생성 전후 모두 `VACUUM ANALYZE` 후 측정.

**결과** (ms, 중앙값 · 1페이지 / 50페이지=`OFFSET 490`):

| 쿼리           | 인덱스 없음   | 인덱스 있음       |
| -------------- | ------------- | ----------------- |
| 자랑방 목록    | 22.79 / 23.21 | **0.052 / 0.478** |
| 캐릭터 랭킹    | 14.14 / 18.06 | **0.074 / 1.029** |
| 공유 인증 관리 | 11.56 / 15.42 | **0.072 / 0.936** |
| 프로그램 신청  | 15.70 / 17.84 | **0.079 / 1.104** |

실행 계획이 `Gather Merge`(테이블 전체 병렬 정렬) → `Index Scan Backward` 로 바뀐다.
마이그레이션 주석이 주장한 **"오름차순 인덱스를 거꾸로 훑어 DESC 정렬에 그대로
쓴다"** 가 계획 출력으로 확인됐다(`Index Cond: (is_public = true)` 포함).
인덱스 4개의 디스크 비용은 합쳐 **21MB**.

**⚠️ 여기서 멈추면 틀린 결론이다.** Spring Data 의 `Page` 는 목록과 함께 `count`
쿼리를 날리는데 **인덱스는 그걸 못 고친다**:

| count 쿼리                     | 시간    |
| ------------------------------ | ------- |
| `brag_post`                    | 10.03ms |
| `character_profiles is_public` | 15.10ms |
| `attendance_logs shared`       | 4.12ms  |
| `program_applications`         | 9.94ms  |

그래서 자랑방 한 페이지의 실제 시간은 **32.8ms → 10.1ms, 3.2배**다. 정렬만 보면
438배지만 사용자가 기다리는 건 3.2배다. **다음 병목은 정렬이 아니라 `count`** 이고,
커서 페이지네이션이나 근사 카운트로 접근할 문제다.

**포트폴리오 표기 원칙**: 현재 회원은 약 50명이라 **실사용에서는 이 차이가 나지
않는다.** 페이지에는 "합성 데이터 20만 행 기준"과 "현재 실사용 규모에서는 차이가
없다"를 `metricsNote` 에 함께 적었다. "우리 서비스가 438배 빨라졌다"는 **거짓말**이고,
"규모가 커지기 전에 재 두고 넣었다"가 사실이자 더 나은 이야기다.

재현 스크립트는 세션 스크래치패드(`bench-schema.sql` · `bench-seed.sql` ·
`bench-run.sh`)에 있고, 저장소에는 커밋하지 않았다.

---

## 면접 예상 질문과 재료

| 질문                            | 답할 재료                                                                                                                                                                                                                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 왜 실시간 서버를 따로 뺐나요?   | 위치·채팅은 초당 수십 번 바뀌는데 REST로 처리하면 서버가 못 버틴다. 실시간 서버는 소스 3개로 얇게, 상태를 메모리에 둔다                                                                                                                                                                       |
| Refresh 토큰 로테이션은 했나요? | **넣었다가 뺐다.** 병렬 요청이 동시에 `/refresh` 를 쳐 서로의 토큰을 무효화하는 경쟁 상태로 로그아웃이 났다(2026-04-01). 서버 회전 대신 프론트에서 재발급을 한 번만 보내는 single-flight 로 막았고, 폐기는 로그아웃 시점에 한다. 다시 넣는다면 grace period 나 token family 가 필요하다 → 1-b |
| 왜 HttpOnly 쿠키인가요?         | 로컬스토리지는 XSS에 취약. JS 접근을 원천 차단                                                                                                                                                                                                                                                |
| 테이블이 31개면 관리가 되나요?  | 8개 도메인으로 나눴다. users가 허브라 FK 28개가 모이고, 그래서 탈퇴·권한 변경이 전 도메인에 걸린다 (← 약점도 같이 말하면 신뢰가 올라간다)                                                                                                                                                     |
| S3는 왜 토글로 했나요?          | 로컬 개발에서 S3를 강제하면 개발이 불편하다. `app.s3.enabled` 로 환경별 전환                                                                                                                                                                                                                  |
| 혼자 만들었는데 협업 경험은?    | 다른 4개가 팀 프로젝트 — aClub 프로젝트장, TSEROF 부팀장                                                                                                                                                                                                                                      |
