# 백엔드 결정 근거 조사 (2026-11-13)

`/resume` 에 "백엔드에서 내린 결정" 한 장을 넣기 전에, 네 주제(스키마·마이그레이션 / 동시성·트랜잭션 / 배포·환경 / 테스트·CI·관측)에 대해 **GitHub 저장소에 실제로 있는 것**만 모았다. 조사 대상은 `toadsam/FestFlow`(비공개, HEAD 11aebd6b), `toadsam/MyStock-Desk`(HEAD a5b5995), `toadsam/Ajou_MuscleUp`(HEAD 2026-10-20), `ajouchong-dev/ajouchong` 업스트림과 toadsam 포크 셋. gh 는 toadsam 로그인. 경로는 각 저장소 루트 기준이고 줄 번호는 조사일 HEAD 기준이다.

규칙: 여기 없는 것은 페이지에 쓰지 않는다. "없음" 도 사실이므로 같이 적었다. 빚은 빚이라고 쓴다.

## 1. 한눈에 보는 표

| 주제                | FestFlow (Spring, MySQL/PostgreSQL)                                                                                                                                         | MyWave (Spring, MySQL)                                                                                                                                                                                           | 득근득근 (Spring, PostgreSQL + Socket.IO)                                                                                                                                | 총학생회 (Spring, PostgreSQL)                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 스키마·마이그레이션 | prod `ddl-auto=validate`. 마이그레이션 도구 없음. 부팅 때 제약을 손보는 `init/*SchemaInitializer` 2개. 인덱스 3개, 유니크 다수                                              | prod `ddl-auto=update`. Flyway 없음을 README·주석에 빚으로 명시. `@Index` 0개, 유니크 4개                                                                                                                        | 수동 SQL 13개(`backend/sql/migration_*.sql`) + Flyway 데이터 마이그레이션 V1~V7(2026-10-11) + `@Index` 28개·복합 UNIQUE 24개 + 20만 행 EXPLAIN 벤치(결과 원문 커밋됨)    | `ddl-auto=update`, 엔티티 17개(본인 추가 5개), 마이그레이션 없음                                                                                 |
| 동시성·트랜잭션     | `@Transactional` 109곳, 비관적 락 5곳, 부스별 `ReentrantLock` + 15초 대기 + 503, 20초 내 중복 주문 병합, 상태 역행 409, `afterCommit` 뒤 SMS, OpenAI 호출을 트랜잭션 밖으로 | `@Transactional` 48곳(readOnly 1), 락 없음. 거래 수정 시 보유 전부 삭제 후 재생(`rebuildPortfolioFromTransactions`)                                                                                              | `@Transactional` 203곳, 비관적 락 2곳(일일 퀘스트 보너스·수집 상자), 출석 upsert 재시도 1회 후 409, 리프레시 토큰 회전 3단계 이력, Socket.IO 방별 변경분 송신            | `@Transactional` 28곳(본인 PR 에 readOnly 클래스 + 쓰기 메서드). 락·스케줄러 없음                                                                |
| 배포·환경           | 프로필 4종, 비밀·키 전부 환경변수, prod 는 시연 데이터·데모 로그인 off, Hikari 24(Railway PG 100 한도 주석), gzip. Docker·CI 없음. Railway + Vercel                         | compose(MySQL 헬스체크 → backend → nginx 하나만 노출), 비밀값 없으면 기동 거부, 멀티스테이지 Dockerfile + 비루트 + 힙 512MB, `ProductionGuard`(개발용 시크릿·H2 콘솔·show-sql 이면 부팅 거부), nginx 리졸버 10초 | Railway `nixpacks.toml`(`-x test`), Vercel, S3 스위치(`app.s3.enabled`), CORS 와일드카드면 기동 실패, 쿠키 httpOnly·Secure·SameSite 환경변수. Docker·CI 없음             | Dockerfile·compose·nginx 는 팀원 작성. 본인: `deploy/Dockerfile` 빌드 스테이지 제거(7a55321), `docker-compose.ec2.yml` 힙 384MB·restart(3a5ae24) |
| 테스트·CI·관측      | `@Test` 123개(23파일, Mockito 단위). CI 없음. 로컬 부하 시험 수치는 README 에만(스크립트 미커밋). SSE 하트비트 20초, 레이트리밋 27규칙, `AuditLog` 48곳, 운영 결산 문서     | `@Test` 98개(통합 50 + 단위 48, H2). GitHub Actions 3잡(테스트·린트/빌드·compose 검사). `/api/health`, 공개일 점검 기록(137→146/152). APM 없음                                                                   | `@Test` 130개(29개는 `@SpringBootTest`, 로컬 MySQL 필요). CI 없음. `AuditLog`(5일 보존)·`AnalyticsEvent`, `RateLimiter` 12곳, 글로벌 예외 핸들러. 실시간 부하 CSV 커밋됨 | `@Test` 1개(contextLoads). 업스트림 CI 는 이미지 빌드·ghcr push(팀원)                                                                            |

## 2. 주제별 근거

### 2-1. 스키마·마이그레이션

**득근득근 (가장 두껍다)**

- `backend/sql/migration_20251202.sql` ~ `migration_20260828_query_indexes.sql` 13개. MySQL 문법이고 운영은 PostgreSQL 이라는 것을 마지막 파일 머리 주석이 밝힌다.
- Flyway 데이터 마이그레이션 `src/main/resources/db/migration/{common,mysql,postgresql}/V1~V7`, `config/DataMigrationRunner.java` 가 Hibernate `ddl-auto` 뒤에 돌린다(`docs/fixes/2026-10-11-flyway-data-migrations.md`). 스키마는 여전히 `ddl-auto=update`(`application-prod.properties:8`).
- `@Index` 28개, `@UniqueConstraint` 24개(전체 목록은 조사 원문). 복합 UNIQUE 가 범위 조회 인덱스를 겸하는 예: `attendance_logs(user_id, workout_date)`.
- 벤치 `backend/sql/bench/{seed_200k,explain,cleanup}.sql` + `results/before.txt`, `results/after_vacuumed.txt`. `docs/BENCHMARKS.md`: PostgreSQL 17.4, 표당 20만 행, 7회 중앙값, 2026-09-02. 자랑방 60.21→0.084ms, 랭킹 58.56→0.045ms, count 는 57→57ms 그대로, 한 페이지 117.4→57.5ms(2.0배). VACUUM 없이 ANALYZE 만 하면 count 57→147ms 로 느려진 기록(Heap Fetches).
- 빚: 이 포트폴리오 `docs/projects/muscleup.md` 가 "실제 인덱스 생성은 DB 를 띄워야 확인된다"고 적었던 것은 `results/after_vacuumed.txt` 로 해소됐다(인덱스 4개 합 21MB 확인). 문장을 고쳐야 한다.

**FestFlow**

- prod `spring.jpa.hibernate.ddl-auto=validate`(`application-prod.properties:1`), 기본·local 은 `update`. `.sql`·Flyway 없음.
- `init/ReservationSchemaInitializer.java`(1c19e625, 2026-06-04): PostgreSQL 이면 `booth_reservations_status_check` 를 drop 후 `CANCELED/CANCELLED` 둘 다 허용하도록 재생성, 실패는 warn.
- `init/AiMatchSchemaInitializer.java`(8d37318d, 2026-05-19): 옛 열↔새 열 양방향 복사 후 옛 열 nullable. MySQL/MariaDB/PostgreSQL/H2 문법 분기.
- 인덱스: `AiMatchChatMessage(request_id,id)`, `BoothOrder(booth_id,createdAt)`, `BoothOrder(clientKey)`. 유니크: `AiMatchMeetupSlot(slot_at)`, `(request_id)` 등. 슬롯 동시 선점은 유니크 제약이 최종 방어(`AiMatchMeetupSlotServiceTest:205`).
- `build.gradle:43-44` mysql-connector-j 와 postgresql 둘 다 runtimeOnly. Hikari 24, connection-timeout 10초, "Railway Postgres 기본 최대 연결 100" 주석(`application.properties:14-16`).

**MyWave**

- `application-prod.yml:27` `ddl-auto: update`, 주석 "Flyway 들이면 validate 로". README `남은 과제` 4번도 같은 말. `@Index` 0개, `@Version` 0개. 유니크: `Member.email`, `Member.googleSubject`, `Stock.symbol`, `MarketIndex`.
- `global/persistence/YearMonthConverter.java`(70aaadb, 2026-10-12): 예산의 달이 직렬화된 바이트로 들어가던 것을 `"2026-10"` 문자열 컬럼(length 7)으로.
- 엔티티 25개(README 의 24는 `RevokedToken` 추가 전 수치).

**총학생회**

- PR #69(2026-04-05, +946/−8) 에서 `RentalItem`·`RentalRecord`·`PromotionPartner`, PR #70(2026-04-10, +644/−70) 에서 `ProceedingCategory`·`ProceedingDocument`·`Link`. 인덱스·마이그레이션 없음.

### 2-2. 동시성·트랜잭션

**FestFlow (가장 두껍다)**

- 비관적 락 5곳, 전부 `@Lock(PESSIMISTIC_WRITE)` + `...ForUpdate`:
  - `BoothRepository.findByIdForUpdate` → `OrderService.createOrder:131` 같은 부스 주문을 한 줄로 세워 주문번호·테이블 한도 충돌 방지.
  - `BoothReservationTableRepository.findByIdForUpdate` → `ReservationService.createReservation:183` 테이블 행 잠금 후 좌석 차감.
  - `BoothOrderRepository.findByIdAndBoothIdForUpdate` → `OrderService:441,465` 주방 여럿이 같은 주문의 다른 줄을 동시에 완료해도 마지막 줄을 놓치지 않음.
  - `AiMatchRequestRepository.findByIdForUpdate` → `AiMatchService:1376` 연락처 공유 동의 동시 클릭(75f67151, 2026-10-08).
  - `AiMatchPhoneUsageRepository.findByPhoneNumberForUpdate` 전화번호당 한도.
- `OrderController:35,56-80` 부스별 `ReentrantLock(true)` 를 `ConcurrentHashMap` 에 두고 `tryLock(15초)` 실패 시 503, `PessimisticLockingFailureException` 3회 재시도. 주석: 줄 서는 동안 DB 연결을 잡지 않는다(1c850bef, 2026-10-01).
- `OrderService:173-187` 20초 안 같은 테이블·입금자·메뉴 주문은 기존 주문 반환(중복 클릭). `:446-449,473-476` 주문 상태 역행 409.
- `AiMatchService` `TransactionTemplate` 직접 사용(OpenAI 호출을 트랜잭션 밖으로), `Semaphore` 동시 이미지 변환 12, `afterCommit` 뒤 SMS 발송(`:964,1012,1234,1248,1301`). `AiMatchService:1306` `@Transactional(noRollbackFor = ResponseStatusException)`: 임시 예약이 풀린 걸 발견하면 약속을 지운 채 409.
- `CrewService:60` `AtomicLong version`, 화면이 보던 버전과 다르면 409.
- `@Scheduled` 4곳(공연 목록 SSE 30초, 시뮬레이션 1초, 14일 지난 채팅 삭제 1시간, 약속 전 알림 1분). `@Async`·`@Version` 없음.
- 인증코드: `SecureRandom` 6자리, BCrypt 해시 저장, 3분 만료, 5회 실패 제한(`ReservationAuthService`). 체크인 토큰 발급 경로에는 행 잠금 없음.

**득근득근**

- 비관적 락 2곳: `DailyQuestRepository.findForUpdate(userId, date)`("보너스를 두 번 주지 않게"), `UserCollectionRepository.findForUpdate(userId)`("상자·조각을 바꾸기 전에").
- `AttendanceServiceImpl:110-125 upsertWithRetry`: `TransactionTemplate` 으로 실행, `DataIntegrityViolationException` 이면 한 번 더, 두 번째도 실패하면 409. 유니크 `(user_id, workout_date)` 가 받친다.
- 리프레시 토큰 회전 이력(이력서 문장의 근거):
  - `72b38fa`(2026-04-01 10:44): 사용자당 1행 삭제 제거(로그인마다 행 추가) + `rotate()` 를 같은 행 덮어쓰기로. **기기 컬럼은 없다.** 프론트 401 인터셉터에 refresh 요청 자체는 재시도 안 함.
  - `bacef85`(26분 뒤): `rotate()` 가 `return current.getToken()` 으로 **회전을 끔**. 주석 "Keep refresh token stable to prevent race-condition logouts when parallel requests trigger refresh at the same time."
  - `64e41f2`(2026-10-11): 진짜 회전. 토큰은 SHA-256 해시만 저장, `revokedAt`·`replacedBy`, 폐기 뒤 30초 유예 캐시(서버 메모리), 유예 지난 재사용은 탈취로 보고 전부 폐기 + 401. 한계는 `docs/fixes/2026-10-11-backend-security.md:170`(다중 인스턴스에서 유예 중 새 토큰 하나 더). `RefreshTokenServiceTest` 5개.
- `push/PushService:172-174` `@Async` + `@TransactionalEventListener(fallbackExecution)` + `REQUIRES_NEW`.
- 스케줄러 9개(출석 리마인더 19:00, 주간 보스 정산 월 00:05, 감사로그 5일 삭제 04:00 등). `RateLimiter` 고정 창 12곳(로그인 IP 30회/5분, AI 분당·일당, 인증메일 10회/10분).
- 실시간 서버: `89bd39c`(2026-10-11) 이후 `MOVES_BROADCAST_MS = 100` 으로 **움직인 플레이어만 방별 송신**(`rooms.ts takeMovesByRoom`). 소켓별 토큰 버킷(move 40/25s⁻¹ 등), 분당 300회 초과 드롭이면 끊음. 부하 `bench/results/lounge-ramp.csv`: 100명 p95 85ms, 150명 443ms, 200명 1,115ms, 300명 붕괴(한 대·루프백·16초×3회 중앙값·2026-09-02). **이 포트폴리오의 `docs/projects/muscleup-realtime-load.md`(100명 p95 50ms) 는 60ms 틱 시절 측정이고, 저장소 README 와 BENCHMARKS 도 아직 60ms 로 적혀 있다.**

**MyWave**

- `TransactionService.create/update/delete/importCsv` 가 모두 `rebuildPortfolioFromTransactions(memberId)`(`:315-341`): 보유 전부 삭제 → 포트폴리오 0 으로 리셋(`RECORD_BASE_CASH = 0`, 59164b4 2026-11-02) → 거래를 `transactionDate, createdAt` 순으로 재생 → 각 거래의 `totalAmount`·`realizedProfitLoss` 다시 저장 → 스냅샷 갱신. 실현손익 `(체결가−평균단가)×수량−수수료−세금`. O(n) 비용과 "넘기면 스냅샷 뒤만 재생"을 README 가 다음 순서로 적음.
- `Holding.buy()` 가중 평균 HALF_UP 2자리, `sell()` 은 수량만 차감. **이 둘의 단위 테스트는 없다**(README 도 없다고 적음).
- 락·`@Version`·멱등키·재시도·서킷브레이커 없음. 외부 호출은 JDK `HttpClient` 직접, 타임아웃 connect 4~5초 / 요청 6~60초. 시세 실패 종목은 `continue` 로 건너뛰고 마지막 값 유지("폴백이 아니라 갱신 건너뛰기", `MarketDataRefreshService:60-86`).
- `synchronized` 1곳(구글 JWKS 캐시). 인메모리 상태 3곳(`LoginAttemptLimiter` 5회/10분, 캡처 분석 하루 20회, 뉴스 10분 캐시). 모두 "재시작하면 풀림, 여러 대면 Redis" 주석.

**총학생회**

- PR #69 `RentalService` 클래스 `@Transactional(readOnly=true)` + 쓰기 6개. `adjustCurrentQuantity` 가 delta 0·음수·총량 초과 거부. 락 없음.

### 2-3. 배포·환경

**MyWave (가장 두껍다)**

- `docker-compose.yml`: MySQL 8.4(utf8mb4, 헬스체크 10s/5s/12회) → backend(prod, `service_healthy` 뒤 기동, `expose` 만) → frontend nginx(`${WEB_PORT:-80}` 하나만 노출). `${MYSQL_PASSWORD:?…}` 식으로 비밀값 없으면 즉시 실패.
- `backend/Dockerfile`: 멀티스테이지(17-jdk → 17-jre), 의존성 레이어 분리, 비루트 `stockflow`, `-Xms128m -Xmx512m`(ad34887, "Railway 8GB 한도라 비율이면 과점유"), HEALTHCHECK `curl /api/health`.
- `frontend/nginx.conf.template`: `listen [::]:${PORT}`(Railway IPv6), `resolver … valid=10s` + 변수 proxy_pass(백엔드 IP 재배포 추종), `/index.html` no-cache, `/assets/` 1년 immutable, `location = /assets` 403 수정(299f543, 공개일 20:25).
- `global/config/ProductionGuard.java`(89365e1, 2026-11-02) `@Profile("prod")`: JWT 시크릿 32바이트 미만, 개발용 문자열 포함, H2 콘솔, mock-member, show-sql 중 하나라도 있으면 `IllegalStateException` 으로 부팅 거부. `application-prod.yml` 은 DB·시크릿 기본값 없음.
- CI 는 배포하지 않음(주석 "배포는 하지 않는다"). Railway 절차는 README "배포하기", 도메인 연결은 `docs/TROUBLESHOOTING.md:110-118`(Cloudflare, CNAME flattening, 프록시 끄기). `railway.json` 은 삭제됨(9398e72).

**FestFlow**

- 프로필 `application{,-local,-mysql,-prod}.properties`. prod: `APP_CORS_ALLOWED_ORIGINS` 필수, JWT 12h, 시연 데이터·간단 데모 자격·스태프 데모 로그인 전부 off. `JwtService:20-21` 시크릿 32바이트 미만이면 기동 실패. `APP_SMS_PROVIDER` none/solapi/aligo/twilio, `APP_STORAGE_TYPE` local/S3, `APP_RESERVATIONS_ENABLED` 기본 false("이번 축제는 워크인만").
- 응답 gzip, 멀티파트 20/25MB, `open-in-view=false`.
- Dockerfile·compose·nginx·CI·Procfile 없음. 서버 Railway, 프론트 Vercel(`frontend/vercel.json` SPA 라우팅만).
- 결산: 축제 중 배포 5회, 장애 0(`docs/festflow/축제-결산.md`).
- 주의: `application-local.properties:4` 에 로컬 MySQL 비밀번호 기본값이 커밋돼 있다.

**득근득근**

- `backend/nixpacks.toml`(jdk17, `bootJar -x test`, prod 프로필), `frontend/vercel.json`(SPA rewrite, `/assets/*` 1년, `sw.js`·`index.html` no-cache). PostgreSQL 은 Railway `PG*` 변수.
- README 114행 "1.0 은 Route 53·ACM·CloudFront·S3 정적 배포에 RDS". **코드에 EC2·CloudFront·Route53 참조는 없다**(S3 SDK 와 URL 조립만). 이력서의 "HTTPS·Mixed Content·CORS credentials 수정" 은 커밋 메시지로 찾히지 않는다(CORS·쿠키 변경은 6350ba3 2025-11-22 와 64e41f2 2026-10-11 큰 커밋 안에 섞여 있고 "Mixed Content" 문자열은 리포에 없다).
- `CorsConfig`: 와일드카드면 기동 실패, `allowCredentials(true)`. 쿠키 `refreshToken`·`accessToken`·`rememberMe` 전부 httpOnly·Secure·SameSite 환경변수(prod 기본 Lax). `/refresh` 는 쿠키만 읽음. access 15분·refresh 90일.
- 주의: `application-test.properties` 에 로컬 MySQL root 비밀번호·메일 설정이 평문으로 추적 중.

**총학생회**

- Dockerfile(gradle 8.8-jdk21 → openjdk 21-slim), compose(postgres 14.12 + backend + nginx 1.21.5), nginx.conf 는 팀원(유수정) 작성. 업스트림 CI(이미지 빌드 → ghcr push)도 팀원.
- 본인: `deploy/Dockerfile` 빌드 스테이지 제거 후 미리 빌드한 jar 복사(7a55321, 2026-04-12), `docker-compose.ec2.yml` `restart: unless-stopped` + `-Xms128m -Xmx384m`(3a5ae24, 2026-06-30 "서버 용량 관리"), `show-sql` true→false(같은 커밋), PR #69 에서 `/api/admin/**` ADMIN 제한·compose 오타 수정·DATASOURCE_URL 고정.

### 2-4. 테스트·CI·관측

| 저장소   | 테스트                                                                                                                                                                                                                                                                           | CI                                                                                                                                                                | 관측                                                                                                                                                                                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FestFlow | `@Test` 123(23파일). Mockito 단위 중심: `OrderServiceTest` 10, `AiMatchMeetupSlotServiceTest` 15, `CrewServiceTest` 10, `ReservationServiceTest` 8, `RequestGuardsTest` 6. `@DataJpaTest`·DB 통합·동시성 테스트 없음                                                             | 없음                                                                                                                                                              | SSE `StreamService` 채널 8개, 하트비트 20초, 커밋 뒤 발행, 60초 중복 억제, 끊긴 emitter 제거. `PublicApiRateLimitFilter` 27규칙 + `Retry-After`. `AuditLog` 호출 48곳, `GpsLog`, `CrewLog`, `CrewSnapshot`. Solapi 예외 → 502(3f1c13d1, 2026-10-04). Actuator·APM·logback 설정 없음 |
| MyWave   | `@Test` 98(24파일): 통합 50(`@SpringBootTest`+MockMvc, H2) + 단위 48. 대표: `AccountSafetyIntegrationTest` 7, `FinancialCoachAiIntegrationTest` 7, `GoogleLoginIntegrationTest` 7, `InputLimitsIntegrationTest` 6, `CoachAnswerGuardTest` 8. `Holding.buy/sell` 단위 테스트 없음 | `.github/workflows/ci.yml`(7253002, 2026-11-02): 모든 브랜치 push + main PR, 잡 3개(백엔드 `gradlew test`·프론트 lint/build·compose 가 필수값 없이 통과하면 실패) | `GET /api/health`(DB `isValid(2)`), `GlobalExceptionHandler` 11개. 공개일 점검 `docs/TROUBLESHOOTING.md`: API 검사 152개 중 137→146, 테스트 29→41, 문제 5건(데모 계정 훼손·로그아웃 후 토큰 생존·VIP 셀프 승급·99조 지출·404→500). APM 없음                                         |
| 득근득근 | `@Test` 130(33파일). 29개 파일이 `@SpringBootTest` 인데 test 프로필이 **로컬 MySQL** 이라 CI 로 못 돌림. 전부 2026-10-11 이후 작성                                                                                                                                               | 없음(`nixpacks.toml` 이 `-x test`)                                                                                                                                | `AuditLogFilter`(쓰기 요청만, `@Async`, 5일 보존), `AnalyticsEvent`, `GlobalExceptionHandler`(DataIntegrity → 409), `RateLimiter`. logback 설정 없음                                                                                                                                |
| 총학생회 | `@Test` 1                                                                                                                                                                                                                                                                        | 팀원 CI                                                                                                                                                           | 없음                                                                                                                                                                                                                                                                                |

**운영 수치 문서(저장소 안)**

- FestFlow `README.md` "5월 운영 이후 바뀐 것": 5월엔 하트비트 없어 죽은 연결 쌓임 → 10월 20초 하트비트·커밋 후 발행·15~20초 재조회. 테스트 3→23파일. "운영 지표": 10월 방문자 7,078·첫날 주문 142·가입 322; 5/22 등록 169·신청 424·성사 36·문자 435통 시도 188 성공 244 실패(Solapi 로그).
- FestFlow `docs/festflow/축제-결산.md`: 주문 142건·매출 2,462,000원·입금 확인 중앙값 0.8분·서빙 중앙값 31분, 장애 0, 축제 중 배포 5회, 10-01 점검에서 고친 것(OpenAI 호출 트랜잭션 밖·동시 변환 12·SSE 하트비트+폴백·부스 목록 쿼리 99→3·IP 한도 상향). README 100행의 로컬 부하 시험(SSE 6,000 + 가상 방문자 600, 초당 1,104건, p95 443ms, 오류 0)은 **스크립트와 원자료가 저장소에 없다**(`.claude/audit/` 에 두고 안 올렸다고 결산이 적음).
- MyWave `docs/TROUBLESHOOTING.md`(2e39f99, 2026-11-10), `docs/API.md`(화면이 부르는 58개 + 나머지).
- 득근득근 `docs/BENCHMARKS.md`, `backend/sql/bench/results/*`, `realtime/bench/results/lounge-ramp.csv`, `docs/fixes/2026-10-11-*.md`.

## 3. 포트폴리오 문장과 어긋나는 것 (고쳐야 한다)

1. **총학생회 "GA4/GSC 기반 개선"**: 웹·백엔드·관리자 리포 어디에도 GA4(gtag·GTM·react-ga) 없음. 있는 것은 GSC 검증 메타태그(팀원 커밋 a6e2f47)와 README 의 GSC 내보내기 수치(노출 2,290→5,392, 클릭 321→491, 2025 vs 2026 5~8월). `resume/jeong-jaehun-resume.md:53,119-121`, `src/data/resume.ts:322,366` 의 GA4 를 GSC 로 좁혀야 한다. aClub 쪽 GA4 는 이번 조사 범위 밖(별도 확인 필요).
2. **득근득근 토큰 레이스 문장**: `resume.ts:900` 의 "2026.04 에 회전을 멈췄다가 2026.10 에 유예·재사용 감지" 는 커밋과 맞는다. 다만 이 포트폴리오 `docs/projects/muscleup.md:135` 의 "유저당 1행 제약 제거(기기별 로그인)" 에서 "기기별" 은 코드에 기기 컬럼이 없으므로 "로그인마다 행 추가" 로 써야 한다.
3. **득근득근 실시간 60ms 틱 · p95 50ms**: 2026-10-11 이후 코드는 100ms 변경분 송신이고, 저장소 벤치는 100명 p95 85ms(2026-09-02 측정, 60ms 시절). 포트폴리오 상세와 `muscleup-realtime-load.md` 는 측정 시점(2026-08-31, 60ms 구조)을 명시하거나 저장소 CSV 로 바꿔야 한다.
4. **득근득근 인덱스 "아직 검증 못 했다"**(`docs/projects/muscleup.md:241-242`): 저장소 `results/after_vacuumed.txt` 와 `docs/BENCHMARKS.md`(2026-09-02) 로 검증됐다. 문장 삭제.
5. **득근득근 "HTTPS·Mixed Content·CORS credentials 수정"**(`resume.md:99`): 커밋·코드에서 문자열 근거를 못 찾았다. 본인 기억에 의존하는 문장이다. 남기려면 "1.0 AWS 배포 때" 로 한정하고 증빙이 없음을 알고 있어야 한다.
6. **MyWave 수치**: 테스트 29/41 → 현재 98, 엔드포인트 111 → 컨트롤러 매핑 115, 엔티티 24 → 25. 저장소 README 자체도 옛 수치다. 포트폴리오는 "공개일 29→41" 처럼 시점을 붙인 숫자만 쓴다.
7. **FestFlow 테스트**: 포트폴리오 어디에도 테스트 수가 없는데 저장소엔 123개가 있다(5월 3개 → 10월 23파일). 넣을 수 있다.

## 4. "백엔드 결정 한 장" 에 쓸 수 있는 후보 (근거 있는 것만)

| 결정                                                                                       | 어디서   | 근거 파일                                                          | 같이 적을 빚                                                   |
| ------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| 같은 부스 주문을 한 줄로 세운다: 행 잠금 + 부스별 ReentrantLock 15초 + 503, 20초 중복 병합 | FestFlow | `OrderController:35-80`, `OrderService:131,173-187`, 커밋 1c850bef | 단일 JVM 전제. 동시성 테스트 없음                              |
| SSE 는 커밋 뒤에 보내고 20초 하트비트, 실패 emitter 는 complete 없이 제거                  | FestFlow | `StreamService:157-166,262-282`                                    | 클라이언트 재연결은 EventSource 기본 + 15초 폴링               |
| 외부 호출(OpenAI·SMS)은 트랜잭션 밖·커밋 뒤                                                | FestFlow | `AiMatchService:125,158,964…`                                      | 재시도 없음                                                    |
| 운영은 `validate`, 스키마 보정은 부팅 가드                                                 | FestFlow | `application-prod.properties:1`, `init/*SchemaInitializer`         | 마이그레이션 도구 없음                                         |
| 쿼리를 보고 복합 인덱스 4개, 20만 행 EXPLAIN 으로 확인                                     | 득근득근 | `sql/bench/*`, `results/after_vacuumed.txt`, `docs/BENCHMARKS.md`  | count 는 그대로라 한 페이지는 2.0배. 실사용 규모에선 차이 없음 |
| 중복 출석은 UNIQUE + 재시도 1회 후 409                                                     | 득근득근 | `AttendanceServiceImpl:110-125`, `AttendanceLog:25`                |                                                                |
| 리프레시 토큰: 회전 껐다가(레이스) 해시 저장·30초 유예·재사용 감지로                       | 득근득근 | 72b38fa → bacef85 → 64e41f2, `RefreshTokenServiceTest`             | 유예 캐시가 서버 메모리                                        |
| 실시간 서버는 움직인 사람만 100ms 마다 방별로                                              | 득근득근 | `realtime/src/server.ts:34,182-186`, `rooms.ts:75-87`              | README 는 아직 60ms                                            |
| 거래를 고치면 보유를 처음부터 재생한다                                                     | MyWave   | `TransactionService:315-341`, README 설계 결정                     | O(n). `Holding` 단위 테스트 없음                               |
| 운영 부팅 가드: 개발용 시크릿·H2 콘솔이면 안 뜬다                                          | MyWave   | `ProductionGuard.java`(89365e1)                                    |                                                                |
| compose 한 번: 헬스체크 순서, 비밀값 없으면 실패, 포트 하나                                | MyWave   | `docker-compose.yml`, `backend/Dockerfile`, `nginx.conf.template`  | HTTPS 는 앞단 몫                                               |
| CI 3잡, 통합 테스트 50개가 H2 로 모든 push 에 돈다                                         | MyWave   | `.github/workflows/ci.yml`, `build.gradle:45-48`                   | Flyway 없음, 로그인 제한 메모리                                |
| 공개일 점검: 152개 검사 137→146, 문제 5건을 당일 고침                                      | MyWave   | `docs/TROUBLESHOOTING.md`                                          | 남은 6건은 상태 코드 관례                                      |

빠지는 것: 모니터링(APM·구조화 로그·알림)은 네 저장소 어디에도 없다. 있는 건 헬스체크 1개, 감사 로그 표 2개, 외부 지표(Solapi·Vercel Analytics·GSC). 한 장에는 "서버 모니터링은 없다" 를 그대로 적는다.

## 5. 검증 상태와 조사 원문

세 조사는 보조 에이전트가 각 저장소를 클론해 작성했고, 아래 항목은 조사 뒤 같은 클론에서 직접 다시 세어 맞춘 것이다(2026-11-13): FestFlow 비관적 락 5곳·ReentrantLock·하트비트 20초·20초 중복 창·`@Transactional` 109곳·`@Test` 123개·Dockerfile/CI 없음, MyWave `ProductionGuard` 존재·CI 잡 3개·`@Index` 0개·`@Test` 98개, 득근득근 락 2곳·마이그레이션 13개·벤치 결과 파일 존재·`@Index` 28개·`MOVES_BROADCAST_MS = 100`·`@Test` 130개·`bacef85` 주석, 총학생회 포크의 toadsam 커밋 1개. 나머지 줄 번호와 세부 수치는 보고서 값을 그대로 옮긴 것이다.

세 조사의 전체 보고와 클론은 세션 임시 폴더에 있다(`scratchpad/festflow-src`, `mystock-src`, `muscleup-src`, `ajouchong-src`). 이 문서는 그중 결정에 쓸 것만 추렸다. 숫자를 다시 확인할 땐 위 경로의 HEAD 가 바뀌었을 수 있으니 `gh` 로 다시 센다.

## 6. 계정 전체 훑기 (2026-11-13, 본인 계정 59개 + 조직 4곳)

조사 기준은 **GitHub 에 커밋으로 남아 있는 것**이다. 이미 본 네 저장소 밖에서 새로 찾은 것과, 저장소가 뒷받침하지 못하는 주장을 나눴다. Unity·C# 게임 저장소 19개는 존재만 확인했다.

### 6-0. 먼저 처리할 것 (공개 저장소의 비밀값)

- **`toadsam/pwd-week5` 의 `.env` 에 MongoDB Atlas 접속 문자열이 계정·비밀번호째 커밋돼 있다**(공개 저장소, `mongodb+srv://toadsam:…@ajou-campus-foodmap…`). 직접 열어 확인했다. Atlas 비밀번호를 바꾸고 파일을 지운 뒤에도 히스토리에 남으므로, 저장소를 비공개로 돌리거나 히스토리를 정리해야 한다. 그 전엔 Foodmap 카드에서 이 저장소를 링크하지 않는다(지금 사이드 프로젝트 "Ajou Campus Foodmap" 의 Client·Server 링크는 week6 라 직접 해당은 없지만 같은 계정이다).
- `toadsam/mse` `last-round-backend/bin/main/application*.yml`·`build/` 와 `toadsam/BlogProject` `board-back/src/main/resources/application.properties` 에 DB 비밀번호·JWT 시크릿이 평문으로 커밋돼 있다(공개). 로컬 값이라도 심사자가 보면 감점이다.
- `pwd-week4/5/6-server` 는 `node_modules` 수천 파일, `Sign-Language` 는 `.idea/`·`backend/build/`·mp4 90MB 가 커밋돼 있다. 위생 문제라 링크를 걸 저장소라면 정리가 먼저다.
- `Ajou_MuscleUp` `application-test.properties`(MySQL root 비밀번호·메일 설정), `FestFlow` `application-local.properties`(로컬 MySQL 비밀번호 기본값)도 같은 종류다. 득근득근은 공개 저장소다.

### 6-1. 새로 찾은 것 중 넣을 가치가 있는 것

| 저장소                     | 사실                                                                                                                                                                                           | 증거                                                                                                                      | 단서                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ai-interview-room (비공개) | 커밋 194 전부 본인(2026-10-24~11-11). vitest 테스트 파일 101개·블록 635개, API 라우트 46개, 커스텀 서버 한 포트에 ws 4개, Prisma + Railway(healthcheck·preDeploy)                              | `package.json`, `server.ts`, `src/app/api/**/route.ts`, `railway.json`                                                    | 공개 URL 없음. CI 없음. "배포 중" 이라 쓰지 않는다                                                                                                                  |
| ai-interview-room          | 응답 지연 실측표: 22초 답 전사 1.1초, 첫 토큰 gpt-4.1-mini 0.56초, 글 답 합계 약 2.1초·음성 약 2.9초. 비용 2턴+리포트 약 $0.003                                                                | `README.md` "반응 속도 (실측, 2026-10-25)", "비용"                                                                        | 헤드리스 크롬·로컬 서버 조건 명시                                                                                                                                   |
| ai-interview-room          | "결과는 규칙이 정하고 모델은 대사만"(순수 함수 `src/engine/`), 사용량 상한 `UsageLedger`, Vercel 불가 이유(디스크 쓰기·SSE 20~60초) 서술                                                       | `README.md` "설계 원칙", `src/server/usage.ts`                                                                            | 이 포트폴리오 마을의 NPC 원칙과 같은 문장                                                                                                                           |
| myPortfolio(final)         | FastAPI 라우트 69개, pytest 267개(게이트 36·의뢰 29·심화 22·관계 규칙 22 …), e2e 스크립트                                                                                                      | `backend/app/main.py`, `backend/tests/`, `scripts/e2e/society.mjs`                                                        | 리포 안 `docs/*_REPORT.md` 는 원격에 하나뿐(나머지 미푸시)                                                                                                          |
| Sign-Language              | 세 분석기(규칙·ETRI·OpenAI)를 다 돌려 사전 적중 수로 승자 선택, 실패를 `unknown`/`noVideoWords` 로 분리, 미스 캐시. 운영 실측 120단어 중 영상 17개, 왕복 중앙값 101ms(규칙 경로만)             | `README.md` "설계 결정"·"측정 결과", `TranslationService.java#L131-157`, `StorageVideoCache.java#L42-64`                  | **`backend/` 커밋 32 중 본인 8**(taewonjake 16, LakkeTree 8). 본인 커밋 무게는 `ml/` 32 중 28. "백엔드 주도" 라고 쓰면 틀린다. README 의 "커밋 70개" 는 115 로 낡음 |
| Sign-Language              | Cloud Run 2단계 Dockerfile + GitHub Pages 워크플로                                                                                                                                             | `backend/Dockerfile`, `.github/workflows/deploy-pages.yml`                                                                | 백엔드 CI 없음, 테스트 contextLoads 1개                                                                                                                             |
| aClub 2026 FE              | `main` 79 커밋 중 23(29%), 2026-01-18~03-05. 깨진 배포 워크플로(9회 연속 실패)를 02-01 세 커밋으로 성공으로: `permissions: contents: write`, secrets 대신 env 비교, verify `continue-on-error` | `.github/workflows/deploy.yml`, Actions runs                                                                              | CI 구축 자체는 rryunn(2025-11). 본인은 수리                                                                                                                         |
| aClub 2026 FE              | 필터 API 실패 시 전체 목록 받아 클라이언트에서 거르는 폴백, 상시/수시 축 분리, 중앙동아리/소학회 id 충돌을 종류별 엔드포인트로                                                                 | `src/Hooks/useClubs.ts` L15-28·L68-84(470135d8), `Chip_period.tsx` L46-49(7706ca42), `useClubDetails.ts` L32-47(960f12f7) | 출시일 3/3 수정 두 건의 시각 16:14·18:04 KST 가 커밋과 일치                                                                                                         |
| 할래말래 HM-BE             | 2025-02 이메일 인증 회원가입·로그인(`MemberController`·`EmailService`·`MemberService`, BCrypt), PR #10·#14(+719/−209) 팀원 머지, 초기 Spring 세팅 PR #1                                        | `AI-Solv/HM-BE` Develop 브랜치, PR 파일 목록                                                                              | 전체 35 커밋 중 7. OpenAI·도메인·Security·Swagger 는 EUNSEMIN. JWT/OAuth2 는 포크 `Setting_JJH` 에만 있고 미병합                                                    |
| 총학생회 API               | 대여사업(`RentalItem`·`RentalRecord`·`RentalService` 215줄)·제휴·회의록 도메인, 관리자 경로 ADMIN 제한, Dockerfile 빌드 스테이지 제거, EC2 compose 힙 384MB                                    | `ajouchong-dev/ajouchong` PR #69·#70, 7a553212, 3a5ae244                                                                  | develop 396 커밋 중 16. 테스트 없음, 셀프 머지                                                                                                                      |
| pwd-week6-server           | Express 5 + Mongoose + Passport(Local·Google·Naver) 세션 인증, jest+supertest+mongodb-memory-server 테스트 2개                                                                                 | `tests/*.test.js`, `src/config/passport.config.js`                                                                        | `node_modules` 커밋. 수업 과제                                                                                                                                      |
| agent-office (비공개)      | 외부 의존 0 의 Node SSE 모니터 1,322줄, Claude Code hooks 연동                                                                                                                                 | `server.js`, `package.json`                                                                                               | 로컬 도구. 보조 항목                                                                                                                                                |

### 6-2. 저장소가 뒷받침하지 못하는 것 (쓰지 않는다 / 고친다)

- **aClub GA4 를 본인이 붙였다는 서술**: gtag 삽입은 2025-11 JIYOON·rryunn 커밋. `react-ga4` 초기화는 자리표시자. GA4 수치(활성 3.5천·조회 8.8만·세션 5,311)는 본인이 올린 스크린샷 `docs/screenshots/ga4-*.webp` 외에 원천이 없다. "GA4 화면에서 읽은 값" 이라는 단서 없이는 못 쓴다. 총학생회 GA4 는 아예 없다(3절 1번).
- **aClub BE(Java·Redis 캐시·JWT·S3·EC2) 관여**: 커밋·PR·이슈 0건. "백엔드 담당과 날짜를 맞췄다" 까지만.
- **aClub "현재 서비스 중"**: 2026-11-13 `aclub.co.kr`·`ajouclub.co.kr` 둘 다 무응답. "2026년 3월 모집 시즌에 운영" 까지만. 테스트는 FE·BE 모두 0.
- **DeMotion(데모션)**: 조직 멤버일 뿐 커밋·PR·리뷰·코멘트 0건. 저장소로는 참여를 증명할 수 없다.
- **할래말래 JWT/OAuth2 로그인 구현**: 포크에만 있고 조직에 미병합·미실행(HS256 키를 기동마다 새로 만드는 구조).
- **HM-BE---JJH·DB_Project_FE_JJH 를 기여 프로젝트로**: 각 1커밋. 2025년 aClub 전신은 `DBProject-24-2/DB_Project_FE`(rryunn 262 / toadsam 48)다.
- **2026-Autonomous-Driving-AI-Challenge**: 하루 2커밋, 환경 확인 단계.
- **Algorithm 을 코딩테스트 실력 근거로**: 275문제 중 Gold 1·Silver 43, 나머지 Bronze/lv1. 2025년 이후 19커밋.
- **myPortfolio 의 `Dockerfile`·`pages.yml`**: 상류 developerFolio 잔재.
- **Sign-Language ml 수치(문장 손 오차 37.3→28.1mm 등)**: 커밋 메시지와 인수인계 문서에만 있고 결과 파일이 없다. 쓴다면 "커밋 기록상".

### 6-3. 이번 훑기로 바뀐 판단

- 백엔드 결정 한 장의 재료는 **FestFlow·MyWave·득근득근 셋**으로 충분하고, 넷째 기둥으로 **ai-interview-room**(테스트 635블록·실측 지연표·규칙/모델 분리)을 세울 수 있다. 단 비공개 저장소라 심사자가 못 보므로, 공개로 돌리거나 README 발췌를 포트폴리오에 싣는 둘 중 하나가 필요하다.
- 이력서의 aClub·총학생회 서술은 "GA4/GSC 기반 개선" 을 "GSC 수치 확인·개편(총학)" 과 "GA4 화면 수치(aClub, 연동은 팀원)" 로 갈라 써야 한다.
- 수어지교는 백엔드가 아니라 **번역 규칙·ML 쪽 기여**로 써야 커밋과 맞는다.

## 7. 반영 기록 (2026-11-13 저녁)

3절의 어긋난 문장과 4절의 후보를 카드·상세에 반영했다. 커밋은 하지 않았다.

| 프로젝트  | 카드 지표                                        | 상세에 넣은 것                                                                                                         | 뺀 것                                                                                 |
| --------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| MyWave    | 운영 중 · 137 → 146 · 테스트 98개와 CI 3잡       | 검사받는 AI 코치(`CoachAnswerGuard`), 운영 부팅 가드, 「push 에서 부팅까지」 장면, 테스트 수 꺾은선(29 → 41 → 87 → 98) | 「모델 호출은 한 곳」 서술, 화면 19 타일                                              |
| AjouFesta | 7,078명 · 장애 0건(배포 5회) · 테스트 3 → 23파일 | 타일 여덟 칸, 주문 직렬화, AI 변환의 DB 연결 문제, 「주문 한 건이 지나는 길」 장면, 핵심 코드 두 장 교체               | StreamController 7채널 · GPS 80m 코드, 부하 시험의 「연습 서버」 문구                 |
| 득근득근  | 3/4 · 2.0배(20만 행) · 55명                      | 타일 넷 추가, 「한 번만 일어나야 하는 일」, 테스트 130개와 그 한계                                                     | 카드의 「도메인 4 → 8」(상세 타일로 내림)                                             |
| 총학생회  | GSC 셋 그대로                                    | 타일 여덟 칸, 관리자 경로 규칙 수정, 배포 설정 손질                                                                    | 「새로고침 404(try_files)」 카드와 Docker·Nginx 를 본인 것처럼 읽히게 하던 KEEP 두 줄 |

이력서 원고와 `resume.ts` 의 「GA4/GSC」 는 「aClub 은 GA4, 총학생회는 Search Console」 로 갈랐다. 득근득근의 「HTTPS·Mixed Content·CORS credentials」 문장은 커밋 근거를 못 찾은 채 남아 있다(본인 기억 기준, 1.0 AWS 배포).

공용 틀 변경 하나: 트러블슈팅은 넷까지 보이고 다섯째부터 접는다(예전엔 다섯 장 이상이면 셋). 2열 격자에서 홀수로 자르면 마지막 카드 옆이 빈다.

## 8. aClub · 수어지교 정정 (2026-11-13 밤)

**aClub 은 전면 수정했다.** 상세가 본인 일로 적던 「2026 TypeScript 재작성 · 커스텀 훅 7개 · 보호 라우트 · GA4 기반 개선」은 팀원 커밋이다. 저장소 기록으로 확인되는 본인 몫만 남겼다.

| 항목                                                           | 근거                                     |
| -------------------------------------------------------------- | ---------------------------------------- |
| 2026 main 커밋 23 / 79 (코드 20 · 머지 3), 2026-01-18 ~ 03-05  | `aClub2026/FE` 커밋 작성자               |
| 배포 실패 9회 → 성공 8회, 전환점 31c4188(2026-02-01 13:09 KST) | GitHub Actions 실행 기록(`gh run list`)  |
| 출시 당일 필터 폴백 470135d(16:14) · 문구 수정 003e655(18:04)  | 커밋 diff, `useClubs.ts` L15-28 · L68-84 |
| 모집 종류 칩 7706ca4(8파일) · 상세 404 960f12f                 | 커밋 diff                                |
| 2025 저장소 커밋 48 / 310, 머지 PR 9건(연 것 19건)             | `DBProject-24-2/DB_Project_FE`           |
| 출시 · 홍보 · 문의 응대                                        | 에브리타임 게시글·댓글 캡처(커밋 없음)   |

**수어지교는 6-1 · 6-3 의 판단을 뒤집는다.** 「backend 커밋 32개 중 본인 8개라 백엔드 주도라고 쓰면 틀린다」고 적었는데, `git blame` 으로 보면 README 의 주장이 그대로 맞다(TranslationService 158/338 · StorageVideoCache 128/177 · 백엔드 자바 877/4,228줄 · Dockerfile 과 Pages 워크플로는 본인 커밋뿐). 커밋 수로 기여를 재면 안 된다는 것을 이 건으로 배웠다. 카드의 「백엔드 둘 중 하나」는 그대로 두고, 빠져 있던 2차 ML 작업(ml/ 커밋 28/32, 실험 5회)을 보탰다.

## 9. AjouFesta 사후 검증과 공개 사본 (2026-11-13 밤)

| 한 일               | 결과                                                                                                               | 근거                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 축제 주문 기록 세기 | 142건, 번호 0001~0142, 중복 0, 20초 안 중복 주문 0, 가장 몰린 1분 4건 · 같은 초 2건                                | 10월 7일 주문 내역 CSV(본인 PC, 가린 사본으로 셈)                                  |
| 동시 주문 테스트    | 잠금 있음 100건 → 번호 100개 / 잠금 뺀 대조군 → 17개(다른 실행 14개) / 한 테이블 20건 → 5건 / 같은 주문 10번 → 1건 | `toadsam/AjouFesta` `OrderConcurrencyTest.java`, `docs/festflow/동시-주문-시험.md` |
| 부하 재측정         | 1,018.5건/초 · p50 364ms · p95 937.8ms · p99 1,352.8ms · 오류 0/61,107 · SSE 6,000 유지                            | `scripts/load/run-split.mjs`, `scripts/load/results/2026-11-13-local-split6.json`  |
| 공개 사본           | 544파일 한 커밋, 테스트 127개 통과                                                                                 | https://github.com/toadsam/AjouFesta                                               |

적을 때 지킬 것. 테스트와 부하 재측정은 **축제 뒤**에 한 것이다. 축제 전에 검증했다고 읽히게 쓰지 않는다. 부하 수치는 로컬 · 조회만 · 서버와 부하가 같은 컴퓨터라는 조건을 같이 적는다. 10월의 1,104건 · p95 443ms 는 스크립트가 없어 재현하지 못했고 새 수치와 나란히 비교하지 않는다. 방문자를 프로세스 하나에 몬 첫 측정(661건/초)은 부하 도구가 밀린 값이라 쓰지 않는다.

원본 `toadsam/FestFlow` 는 이 문서를 쓰는 시점에 공개 상태이고 참가자 얼굴 사진 47장(`backend/uploads/`)과 DB 덤프 CSV 20개(`exports/current-db-csv/`)가 최신 트리에 있다. 같은 날 밤 본인이 다시 비공개로 돌렸고 익명 접근이 404 인 것을 확인했다. 다시 공개하지 않는다.

공개 사본에는 같은 날 밤 CI 를 붙였다(`.github/workflows/ci.yml`, 서버 테스트 127개 + 화면 빌드, 세 번째 실행부터 통과). 러너에서 잰 동시 주문 결과는 잠금 있음 100/100, 대조군 38종이다. 대조군 숫자는 기기마다 달라(로컬 14 · 17, 러너 38) 한 숫자로 못 박지 않는다.
