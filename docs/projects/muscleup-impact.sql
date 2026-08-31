-- ════════════════════════════════════════════════════════════════════════════
--  득근득근 — "그래서 사람들이 다시 왔나" 를 재는 질의 모음
-- ════════════════════════════════════════════════════════════════════════════
--
--  왜 이게 필요한가
--  ─────────────────
--  포트폴리오 상세 페이지의 결론 문장은 이것이다:
--
--      "사람이 다시 오게 만드는 건 기능 개수가 아니라 첫 화면이 무엇을
--       시키느냐였다."
--
--  그런데 페이지 어디에도 **다시 왔다는 숫자가 없다.** Key Numbers 넷은
--  규모(약 50명) · 태도(3/4) · 합성 벤치(3.2배) · 활동량(8×5)이라,
--  "그래서 무슨 일이 벌어졌다" 를 말하는 게 하나도 없다.
--
--  페이지는 스스로 이렇게 적어 두기까지 했다 —
--      "analytics_events 를 쌓고는 있지만 그걸로 판단한 적은 없다"
--
--  데이터가 없어서 못 쓴 게 아니라 **안 본 것**이다. 아래 질의는 이미
--  저장소에 있는 표만 읽는다.
--
--  ⚠️ 숫자가 나쁘게 나와도 그대로 쓴다.
--     이 페이지는 이미 "넷 중 하나는 못 고쳤다" 를 쓰는 페이지이고,
--     신뢰는 거기서 나온다. 좋게 나온 것만 골라 실으면 나머지 전부가
--     같이 의심받는다.
--
--  대상 DB
--  ────────
--  운영 PostgreSQL (페이지 기준: 운영 PostgreSQL · 로컬 MySQL).
--  MySQL 에서 돌리려면 date_trunc / FILTER / interval 문법을 바꿔야 한다.
--
--  실행 (전부 SELECT 뿐 — 쓰기 없음)
--  ────────────────────────────────
--      psql "$DATABASE_URL" -f docs/projects/muscleup-impact.sql
--
--  문법 검증 (2026-08-31)
--  ──────────────────────
--  아래 스키마를 그대로 만든 일회용 PostgreSQL 17 클러스터에 합성 행을 넣고
--  8개 질의를 전부 돌려 오류 없음을 확인했다(클러스터는 확인 후 삭제).
--  **그때 나온 숫자는 난수라 아무 의미가 없다** — 문법만 본 것이다.
--  버전 의존은 FILTER(9.4+) · date_trunc · 윈도 함수뿐이라 16 에서도 돈다.
--
--  스키마 근거 (2026-08-31, toadsam/Ajou_MuscleUp 실물 확인)
--  ─────────────────────────────────────────────────────────
--      users             id · created_at(LocalDateTime, nullable)
--      attendance_logs   user_id · workout_date(DATE) · did_workout(BOOL)
--                        UNIQUE(user_id, workout_date) · created_at
--      lounge_visit_logs user_id · created_at        (BaseTimeEntity 상속)
--      analytics_events  user_id · page · action · created_at
--
--  ⚠️ users.created_at 은 nullable 이다. 컬럼이 나중에 추가됐다면 옛 회원은
--     NULL 일 수 있다. 그래서 코호트는 가입일이 아니라 **첫 출석 기록일**을
--     기준으로 잡는다(0번 질의로 먼저 확인할 것).
-- ════════════════════════════════════════════════════════════════════════════


-- ── 0. 먼저 확인: 표에 뭐가 얼마나 있나 ──────────────────────────────────────
--    여기가 비어 있으면 아래 질의는 전부 0 을 낸다. 그건 "효과가 없었다" 가
--    아니라 "로그가 안 쌓였다" 는 뜻이다. 둘을 헷갈리면 안 된다.
\echo '=== 0. 표 현황 ==='
SELECT 'users'             AS 표, count(*) AS 행,
       min(created_at)::date AS 처음, max(created_at)::date AS 마지막,
       count(*) FILTER (WHERE created_at IS NULL) AS 시각없음
  FROM users
UNION ALL
SELECT 'attendance_logs', count(*), min(workout_date), max(workout_date), 0
  FROM attendance_logs
UNION ALL
SELECT 'lounge_visit_logs', count(*), min(created_at)::date, max(created_at)::date, 0
  FROM lounge_visit_logs
UNION ALL
SELECT 'analytics_events', count(*), min(created_at)::date, max(created_at)::date, 0
  FROM analytics_events;


-- ── 1. 주별 활성 — 가장 먼저 볼 것 ──────────────────────────────────────────
--    2.0 을 올린 주 앞뒤로 선이 꺾이는지 본다. 꺾이지 않으면 그것도 결과다.
--    (기록 건수보다 **사람 수**가 중요하다. 한 사람이 많이 쓴 것과
--     여러 사람이 온 것은 다른 얘기다.)
\echo '=== 1. 주별로 출석을 남긴 사람 수 ==='
SELECT date_trunc('week', workout_date)::date AS 주,
       count(DISTINCT user_id)                AS 기록한_사람,
       count(*)                               AS 기록_건수
  FROM attendance_logs
 WHERE did_workout
 GROUP BY 1
 ORDER BY 1;


-- ── 2. 재방문 — 페이지의 핵심 주장에 직접 답하는 숫자 ───────────────────────
--    첫 기록을 남긴 사람이 7일/30일 안에 **다시** 기록했는가.
--    첫 기록 월로 코호트를 나누므로, 2.0 이후 코호트가 이전보다 높으면
--    "홈을 로비로 바꾼 것" 의 효과를 말할 수 있다.
--
--    ⚠️ 코호트당 사람 수가 한 자릿수면 비율은 의미가 없다.
--       그때는 비율 대신 "n명 중 m명" 으로 쓸 것.
\echo '=== 2. 첫 기록 후 다시 기록한 비율 (첫 기록 월 코호트) ==='
WITH first_log AS (
    SELECT user_id, min(workout_date) AS d0
      FROM attendance_logs
     WHERE did_workout
     GROUP BY user_id
),
ret AS (
    SELECT f.user_id,
           date_trunc('month', f.d0)::date AS 코호트,
           max(CASE WHEN a.workout_date >  f.d0
                     AND a.workout_date <= f.d0 + 7  THEN 1 ELSE 0 END) AS d7,
           max(CASE WHEN a.workout_date >  f.d0
                     AND a.workout_date <= f.d0 + 30 THEN 1 ELSE 0 END) AS d30
      FROM first_log f
      JOIN attendance_logs a
        ON a.user_id = f.user_id
       AND a.did_workout
     GROUP BY 1, 2
)
SELECT 코호트,
       count(*)                                              AS 새로_시작한_사람,
       sum(d7)                                               AS "7일내_재기록",
       round(100.0 * sum(d7)  / nullif(count(*), 0), 1)      AS "7일_%",
       sum(d30)                                              AS "30일내_재기록",
       round(100.0 * sum(d30) / nullif(count(*), 0), 1)      AS "30일_%"
  FROM ret
 GROUP BY 1
 ORDER BY 1;


-- ── 3. 연속 출석(스트릭) — "게임처럼 지속하게" 의 직접 증거 ─────────────────
--    날짜에서 행번호를 빼면 연속 구간마다 같은 값이 나온다(gaps-and-islands).
\echo '=== 3. 연속 출석 구간 ==='
WITH d AS (
    SELECT DISTINCT user_id, workout_date
      FROM attendance_logs
     WHERE did_workout
),
g AS (
    SELECT user_id,
           workout_date,
           workout_date
             - (row_number() OVER (PARTITION BY user_id ORDER BY workout_date))::int
             AS grp
      FROM d
),
streak AS (
    SELECT user_id, grp, count(*) AS len
      FROM g
     GROUP BY user_id, grp
),
per_user AS (
    SELECT user_id, max(len) AS best FROM streak GROUP BY user_id
)
SELECT count(*)                                        AS 기록한_사람,
       max(best)                                       AS 최장_연속일,
       round(avg(best), 2)                             AS 평균_최장연속일,
       count(*) FILTER (WHERE best >= 3)               AS "3일이상_이어간_사람",
       count(*) FILTER (WHERE best >= 7)               AS "7일이상_이어간_사람"
  FROM per_user;


-- ── 4. 라운지 재방문 — "소통하고 싶다" 에 대한 답이 먹혔는가 ────────────────
--    같은 세션의 중복 기록을 세지 않으려고 1시간을 띄운다.
\echo '=== 4. 라운지: 처음 온 뒤 다시 왔는가 ==='
WITH v AS (
    SELECT user_id, min(created_at) AS d0
      FROM lounge_visit_logs
     GROUP BY user_id
),
r AS (
    SELECT v.user_id,
           max(CASE WHEN l.created_at > v.d0 + interval '1 hour'
                    THEN 1 ELSE 0 END) AS again
      FROM v
      JOIN lounge_visit_logs l ON l.user_id = v.user_id
     GROUP BY v.user_id
)
SELECT count(*)                                          AS 라운지_방문자,
       sum(again)                                        AS 다시_온_사람,
       round(100.0 * sum(again) / nullif(count(*), 0), 1) AS "재방문_%"
  FROM r;


-- ── 5. 가입하고 실제로 시작했는가 ───────────────────────────────────────────
--    "첫 화면이 무엇을 시키느냐" 주장의 가장 직접적인 검증이다.
--    가입만 하고 한 번도 기록하지 않았다면 로비는 아무것도 시키지 못한 것이다.
\echo '=== 5. 가입자 중 한 번이라도 기록한 사람 ==='
SELECT count(*) AS 가입자,
       count(*) FILTER (
           WHERE EXISTS (SELECT 1 FROM attendance_logs a
                          WHERE a.user_id = u.id AND a.did_workout)
       ) AS 한번이라도_기록,
       count(*) FILTER (
           WHERE EXISTS (SELECT 1 FROM attendance_logs a
                          WHERE a.user_id = u.id AND a.did_workout
                          GROUP BY a.user_id HAVING count(*) >= 2)
       ) AS 두번이상_기록
  FROM users u;


-- ── 6. 사람들이 실제로 어디를 눌렀나 ────────────────────────────────────────
--    페이지가 "analytics_events 를 쌓고는 있지만 판단한 적은 없다" 고 적은
--    바로 그 표다. 홈에서 어디로 갔는지가 여기 있다.
\echo '=== 6. 이벤트 상위 20 ==='
SELECT page,
       action,
       count(*)                AS 건수,
       count(DISTINCT user_id) AS 사람
  FROM analytics_events
 GROUP BY 1, 2
 ORDER BY 건수 DESC
 LIMIT 20;


-- ── 7. 홈을 본 사람이 그날 출석을 남겼는가 ──────────────────────────────────
--    6번에서 홈의 page 값이 무엇인지 확인한 뒤 아래 'home' 을 그 값으로 바꿀 것.
--    (page 값이 '/'· 'home' · '/home' 중 무엇인지는 프론트가 무엇을 보내는지에
--     달렸다 — 추측하지 말고 6번 결과를 보고 채울 것.)
\echo '=== 7. 홈을 본 그날 출석을 남긴 비율 (page 값 확인 후 실행) ==='
WITH home_view AS (
    SELECT DISTINCT user_id, created_at::date AS d
      FROM analytics_events
     WHERE page = 'home'          -- ← 6번 결과를 보고 채울 것
       AND user_id IS NOT NULL
)
SELECT count(*) AS 홈을_본_사람x날,
       count(*) FILTER (
           WHERE EXISTS (SELECT 1 FROM attendance_logs a
                          WHERE a.user_id = h.user_id
                            AND a.workout_date = h.d
                            AND a.did_workout)
       ) AS 그날_출석까지_한_경우
  FROM home_view h;
