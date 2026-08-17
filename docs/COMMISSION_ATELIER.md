# 의뢰 공방 (Commission Atelier) — 구현 기록

> **이 문서는 코드 수준의 구현 기록과 밟은 함정 모음이다.**
> "지금 무엇이 되고, 의뢰가 오면 뭘 하면 되는가"는 **[ATELIER_GUIDE.md](./ATELIER_GUIDE.md)** 를 볼 것.
> 두 문서가 겹치지 않게 나눠 뒀다 — 현황·운영은 저쪽, 왜 이렇게 짰나·어디서 넘어졌나는 여기.

마을 지하에 숨겨진 **홈페이지 제작 의뢰 창구**. 방문자는 AI 접수원과 대화하며 요구사항을
정리하고 참고 견적을 받아 의뢰를 넣고, 관리자는 접수함에서 그 건을 검토한다.

최종 그림은 세 겹이다.

| 단계 | 내용                               | 상태               |
| ---- | ---------------------------------- | ------------------ |
| 1    | 접수·상담·견적 + 관리자 접수함     | ✅ 2026-08-17 완료 |
| 2    | 지하 3D 공방 + 팀 NPC 5명          | ✅ 2026-08-17 완료 |
| 3    | 직군별 에이전트가 실제 산출물 제작 | ✅ 2026-08-17 완료 |

---

## 0. 이 기능의 성격 — 다른 구역과 무엇이 다른가

기존 데이터 구역(코딩테스트 도장·CS 서고 등)은 *내가 입력 → 마을에 반영*이다.
공방은 방향이 반대다: **외부인이 입력 → 내가 처리**.

그래서 마을에서 **처음으로 공개 쓰기 엔드포인트**가 생겼고, 다른 구역에 없는 제약이 따라온다.

- 스팸/봇 방어가 필수 (허니팟 + 전용 레이트리밋)
- 방문자 개인정보(이메일·연락처)를 저장하므로 동의와 최소 수집이 필요
- AI가 부른 금액은 분쟁 소지라 **확정 견적처럼 보이면 안 된다**
- 접수를 놓치면 안 되므로 알림이 필요 (디스코드 웹훅)

### 설계상 가장 중요한 긴장

**"숨겨진 공간"과 "실사용 창구"는 서로 반대 방향이다.** 진짜 의뢰를 받는데 아무도 못 찾으면
창구로서 실패한다. 그래서 진입을 둘로 갈랐다.

| 경로                              | 도착지               | 성격                            |
| --------------------------------- | -------------------- | ------------------------------- |
| 우하단 **🛠️ 제작 의뢰** 버튼      | 접수 데스크(2D) 직행 | **실사용.** 마찰 0, 모바일 포함 |
| 마을 광장 옆 **지하 해치**        | 3D 공방              | 발견의 재미                     |
| **포스트**(연락 NPC) 대화 속 입구 | 3D 공방              | 발견의 재미                     |
| 공방 안 **도안** 클릭             | 같은 접수 데스크     | 두 경로가 여기서 만난다         |

숨김은 *유일한 입구*가 아니라 *멋있는 두 번째 입구*다.

---

## 1. 데이터 흐름

```
방문자 ─▶ POST /commission/consult ─▶ commission_service.consult()
                                        ├ OpenAI (json_object) → draft 누적 + 견적
                                        └ 실패/키없음 → 규칙 기반 fallback
                                      ▼
                            CommissionDraft (프런트가 보관, 매 턴 되돌려줌)
                                      ▼
방문자 ─▶ POST /commission ─────────▶ create_commission()
                                        ├ 허니팟·동의·이메일 검증
                                        ├ 상담 로그를 접수 건에 귀속
                                        └ notify_discord()  ← 실패해도 접수는 성공
                                      ▼
관리자 ─▶ GET / PATCH / DELETE /admin/commissions/*
```

### 핵심 결정 셋

**① 견적은 AI에게 맡기되 규칙으로 가둔다.**
`_baseline_estimate()`가 유형별 기준선(랜딩 80~180만 / 쇼핑몰 400~1200만 …)과
기능 가산치(결제 +150~400만, 로그인 +60~150만 …)로 범위를 낸다.
`_clamp_estimate()`가 AI 금액을 **그 기준선의 0.6~1.8배 안으로 clamp** 한다.
→ 모델이 맥락을 반영해 조정하는 건 허용하되, 0원이나 1억이 나오는 사고는 구조적으로 막힌다.

**② 백엔드는 상담 상태를 들고 있지 않다.**
`CommissionDraft`를 프런트가 보관하고 매 턴 되돌려준다. 서버가 stateless다.
새로고침으로 프런트 히스토리가 비면 `recent_messages()`가 DB에서 복구한다.

**③ 접수 레이트리밋은 시도와 성공을 따로 센다.**
하나로 묶었더니 이메일 오타 두어 번에 멀쩡한 손님이 한 시간 잠기는 일이 E2E에서 실제로 났다.
검증에 걸려 400으로 되돌아간 요청은 받은편지함에 아무것도 남기지 않으므로 성공 할당량을 깎지 않는다.

- 시도: IP당 20회/시간 (봇 홍수 차단)
- 성공: IP당 3건/시간, 전체 40건/일

---

## 2. 파일 지도

### 백엔드

| 파일                                 | 역할                                                             |
| ------------------------------------ | ---------------------------------------------------------------- |
| `app/models.py`                      | `CommissionRequest`(접수 건) · `CommissionMessage`(상담 로그)    |
| `app/schemas.py`                     | `CommissionDraft` / In·Out / `ESTIMATE_DISCLAIMER`               |
| `app/services/commission_service.py` | **핵심.** 견적 기준선·clamp·상담(AI+fallback)·CRUD·디스코드 알림 |
| `app/security.py`                    | `commission_rate_limit` / `record_commission_success`            |
| `app/config.py`                      | `discord_webhook_url`, 접수 상한 3종                             |
| `app/catalog.py`                     | 공방 NPC 프로필 5개 (`atelier-*-npc`)                            |
| `app/main.py`                        | 라우트 6개                                                       |
| `tests/test_commission_service.py`   | 견적·clamp·검증 단위 테스트                                      |

라우트:

```
POST   /commission/consult          공개 (AI 리밋)
POST   /commission                  공개 (접수 리밋)
GET    /admin/commissions           관리자
GET    /admin/commissions/{id}      관리자 (상담 로그 포함)
PATCH  /admin/commissions/{id}      관리자 (상태·메모)
DELETE /admin/commissions/{id}      관리자
```

### 프론트엔드

| 파일                                          | 역할                                                  |
| --------------------------------------------- | ----------------------------------------------------- |
| `src/data/atelierRoster.ts`                   | 공방 NPC 5명 **단일 출처** (id·좌석·색·성격·추천질문) |
| `src/components/ui/CommissionDesk.tsx`        | 접수 데스크 — 상담창 + 견적 카드 + 접수 폼            |
| `src/components/interior/AtelierInterior.tsx` | 지하 3D 공방 씬                                       |
| `src/components/village/AtelierHatch.tsx`     | 마을 광장 옆 숨은 입구                                |
| `src/components/AIPortfolioVillage.tsx`       | `viewMode: "atelier"` · 진입/복귀 · NPC 라우팅        |
| `src/app/admin/page.tsx`                      | 의뢰 접수함 섹션                                      |
| `src/lib/liveApi.ts` · `src/types/live.ts`    | API·타입                                              |

---

## 3. 공방 식구들

| NPC      | 직군       | id                     | 색             |
| -------- | ---------- | ---------------------- | -------------- |
| **도안** | 접수원     | `atelier-intake-npc`   | 랜턴 `#ff9d38` |
| **체리** | 기획       | `atelier-planner-npc`  | `#7ecf68`      |
| **먹지** | 디자인     | `atelier-designer-npc` | `#c69af0`      |
| **리코** | 프론트엔드 | `atelier-frontend-npc` | `#68c7cf`      |
| **굴뚝** | 백엔드     | `atelier-backend-npc`  | `#5f7be8`      |

도안을 클릭하면 접수 데스크가 열리고, 나머지 넷은 일반 대화창(`DialogueBox`)이 열린다.

`relations.py`의 `canon()`이 이들을 `intake / planner / designer / fe / be`로 정규화하고
`_RELATIONS`에 팀 관계 톤이 들어 있어, NPC끼리 마주치면 티격태격이 나온다
(예: fe↔be — _"그건 백엔드에서 주셔야죠" "그건 프론트에서 처리하면 되잖아요"_).

> **팀원은 아직 실제 제작을 하지 않는다.** 프로필 `scope`에 "준비 중"이라 적어 과대 약속을 막아 뒀다.
> 3단계에서 그 문구를 걷어야 한다.

---

## 4. 여기서 걸려 넘어진 것들 (다시 밟지 말 것)

실제로 돌려 보고서야 드러난 것들이다. 빌드·타입체크는 전부 통과한 상태였다.

### 4-1. `npc-*` id 부분 매칭이 공방 NPC를 삼킨다

`relations.canon()`과 `chat_service._npc_profile_for_dynamic_id()`는 npc_id에
`"backend"` / `"frontend"`가 있으면 무조건 `developer`로 잡는다. `atelier-backend`가 여기 먹힌다.
→ **두 함수 맨 앞에 atelier 가드**를 뒀다. 순서를 바꾸면 안 된다. `tests/test_relations.py`가 잠가 뒀다.

### 4-2. `MathUtils.lerp` 계수를 clamp하지 않으면 캐릭터가 사라진다

접수 패널이 캔버스를 덮는 동안 프레임루프가 쉬었다 재개되면 `delta`가 몇 초 단위로 커진다.
그때 `delta * 7 > 1`이 되어 lerp가 목표를 지나쳤고, **도안이 바닥 아래로 꺼졌다**
(라벨과 발밑 고리만 남아 원인을 좁힐 수 있었다).
→ `MathUtils.lerp(a, b, Math.min(1, delta * k))`. 프레임 의존 보간에는 항상 clamp.

### 4-3. 실내 카메라는 반드시 방 **안**에 둘 것

카메라를 `z=10.5`(벽은 `z=7`)에 뒀더니 앞 벽의 뒷면이 컬링돼 그대로 통과해 보였고,
벽 위로 배경이 드러나 방이 아니라 무대처럼 보였다.
→ 카메라를 방 안으로 넣고 `OrbitControls`의 `maxDistance`로 벽 밖으로 못 나가게 묶었다.
화면에 다 안 담기면 거리 대신 **fov**로 넓힌다.

### 4-4. `DialogueBox`(z-30)는 실내 씬(z-40) 밑에 깔린다

마을에서는 캔버스가 일반 흐름이라 안 드러나던 문제. 공방에서는 대화창이 통째로 안 보였다.
→ 공방의 `DialogueBox`는 `z-50` 래퍼로 감쌌다.

### 4-5. 백엔드 프리셋이 로스터 질문을 밀어낸다

`seed_admin_defaults`가 catalog의 **모든** NPC에 마을 기본 질문을 시드한다.
그게 remote로 먼저 들어와 `slice(0,3)`을 다 차지해, 백엔드 담당 굴뚝이
*"대표 프로젝트 추천해줘"*를 묻고 있었다.
→ 공방 NPC는 remote 프리셋을 쓰지 않는다(단일 출처는 `atelierRoster`).
`_default_questions_for_npc`에도 직군 분기를 넣어 관리자 페이지 기본값도 맞췄다.

### 4-A. `can_use_tool` 은 조용히 무력화된다 (3단계)

SDK 문서에는 "권한 판정이 물어보기까지 내려올 때만 호출된다"고만 적혀 있다. 실제로는:

- `permission_mode` 가 `acceptEdits`/`bypassPermissions` → **콜백이 아예 안 불린다**
- 그 도구가 `allowed_tools` 에 있으면 → 콜백 전에 자동 승인
  (SDK 가 `CanUseToolShadowedWarning` 으로 경고해 준다. 이걸 실제로 봤다)
- 설정 파일의 allow 규칙도 콜백을 가린다 → `setting_sources=[]`

→ `permission_mode="default"` + `allowed_tools=()` + `setting_sources=[]` 가 **한 세트**다.
편하자고 하나만 바꾸면 경로 검사가 **에러 하나 없이** 죽는다.
`test_runner_permission_mode_keeps_the_guard_alive` 가 이 상수들을 잠근다.

### 4-B. 스트리밍 입력 채널을 닫으면 모든 쓰기가 실패한다 (3단계)

`can_use_tool` 은 문자열 프롬프트를 거부한다(`requires streaming mode`).
그래서 `AsyncIterable` 로 바꿨는데, **한 번 yield 하고 끝나는 제너레이터**를 주니
SDK 가 stdin 을 닫아버렸다. 권한 승인 **응답이 그 채널로 되돌아가기** 때문에,
첫 `Write` 부터 `AbortError: Stream closed` 로 전부 실패했다.

증상이 고약하다 — 에이전트는 236초 동안 열심히 일하고 "이 세션에서 파일 쓰기가
안 되는 시스템 오류가 있습니다"라고 **성실하게 보고하며 빈손으로** 끝난다($0.72 날렸다).
→ `ClaudeSDKClient` 로 바꿨다. 컨텍스트가 끝날 때까지 채널을 열어 둔다.

### 4-C. `pip install claude-agent-sdk` 가 웹 서버를 깬다 (3단계)

`claude-agent-sdk` → `mcp` → `starlette 1.x` 로 올라가고, `fastapi 0.115.6` 은
`starlette<0.42` 를 요구한다. 같은 venv 에 넣으면 **서버가 죽는다.**
→ `requirements-agent.txt` 에서 starlette 를 다시 고정했다. SDK 는 mcp 의 서버 쪽
코드를 쓰지 않으므로 0.41 로 되돌려도 정상 동작한다(import·query 모두 확인).

### 4-D. CLI 의 작업 폴더는 리포 루트여야 한다 (3단계)

`DATABASE_URL` 기본값이 `sqlite:///./portfolio_village.db` — **cwd 기준 상대경로**다.
`backend-dev.mjs` 는 루트에서 uvicorn 을 띄우므로(`--app-dir backend`) DB 는 루트에 있다.
워커만 `cwd: backend` 로 띄웠더니 다른 DB 파일을 보고 "접수번호를 찾을 수 없습니다"가 났다.
→ `cwd: root` + `PYTHONPATH=backend`.

덤으로: `npm run atelier -- WO-XXX --role planner` 에서 **npm 이 `--role` 을 가로챈다.**
그래서 직군을 위치 인자로도 받는다(`npm run atelier -- WO-XXX planner`).

### 4-6. 마을의 실광원 예산은 4개다

`VillageScene.tsx`의 `LampPools` 주석에 명시돼 있다 — *"진짜 pointLight는 4개뿐"*이라
가로등 수십 개는 전부 바닥 가산 원반으로 흉내 낸다.
해치에 `pointLight`를 하나 얹었다가 이 예산을 깼다(전 재질 라이트 순열이 바뀌어 셰이더 재컴파일 + 픽셀 비용 증가).
→ 해치는 **가산 원반**으로 바꿨다. 공방도 NPC·서버랙 광원을 걷어 pointLight를 12개 → **4개**(랜턴 3 + 계단 1)로 줄였다.
광량은 개수 대신 세기와 환경광으로 채운다.

---

## 5. 실행과 검증

```bash
# 백엔드 단위 테스트 (140개)
cd backend && pytest

# 3단계 에이전트를 돌릴 컴퓨터에서만 추가로
pip install -r requirements-agent.txt   # claude-agent-sdk (Claude Code CLI 필요)

npm run typecheck
npm run check-format
npm run build

# 띄우기
npm run backend:dev   # :8000
npm run dev           # :3000
```

수동 확인 순서:

1. 우하단 **🛠️ 제작 의뢰** → 접수 데스크가 3D를 안 거치고 바로 열리는지
2. 도안과 3~4턴 대화 → 견적 범위와 **면책 문구**가 보이는지 (`OPENAI_API_KEY` 없이도 규칙 fallback으로 동작해야 함)
3. 접수 폼 제출 → 접수번호(`WO-XXXXXXXX`)가 나오는지
4. `/admin` 접수함에 뜨고 **상담 로그가 함께** 보이는지, 상태 변경이 저장되는지
5. 광장 옆 해치 클릭 → 공방 도착 → 도안 클릭 → 같은 데스크
6. 팀원 4명이 **서로 다른 성격**으로 답하는지 (전부 도안 말투면 `chat_service` 분기 실패)
7. 허니팟: `POST /commission` 에 `website` 값을 넣으면 400

3단계:

8. `/admin` 상세 → **[게이트1] 승인** → `npm run atelier -- <접수번호> planner`
9. 기획 문서가 생기고 상태가 `brief_review` 에서 **멈추는지** (이게 설계의 핵심)
10. 브리프를 읽고 **반려 + 피드백** → 회차가 오르고, 재실행 때 피드백이 반영되는지
11. **[게이트2] 승인** → `npm run atelier -- <접수번호>` → 팀 3명 실행 → `artifact_review`
12. `03-프론트/시안.html` 이 관리자 페이지 iframe 에 렌더되고 **스크립트가 차단되는지**
13. **[게이트3] 전달 완료** → `delivered`
14. 3D 공방에서 굴뚝에게 말 걸어 자기 작업(접수번호·상태)을 언급하는지

---

## 6. 배포 전 필수

- [ ] `ADMIN_PASSWORD` 설정 — **비어 있으면 `/admin` 인증이 꺼진다.**
      공방 이후로는 그게 새면 포트폴리오가 아니라 **방문자의 이름·이메일·전화번호**가 샌다.
- [ ] `ADMIN_SECRET`을 길고 무작위한 값으로 교체
- [ ] `DISCORD_WEBHOOK_URL` 설정 — 없으면 `/admin`을 열기 전까지 새 의뢰를 모른다
- [ ] SQLite 백업 또는 Postgres 전환 — 접수 데이터는 날아가면 안 된다

---

## 7. 3단계 — 직군별 에이전트가 실제로 만든다

관리자가 승인한 접수 건에 대해 Claude Agent SDK 에이전트가 파일을 만든다.

### 7-1. 설계의 중심: 진행 권한을 모델에게 주지 않는다

"언제까지나 나랑 상의한다"는 프롬프트로 부탁할 일이 아니다. 언젠가는 안 지킨다.
그래서 **에이전트가 할 수 있는 일은 태스크를 `running` → `review` 로 옮기는 것까지**다.
`review` 에서 나가는 문은 `gate.apply_gate()` 하나뿐이고, 그 함수가 자동으로
불리는 경로는 코드 어디에도 없다.

```
received ─[게이트1]─▶ briefing ─▶ brief_review ─[게이트2]─▶ briefed
   │                  (체리)          │                        │
   └──▶ rejected                      └──반려(round+1)──┘      ▼
                                                         in_progress
                                                  (먹지·리코·굴뚝 병렬)
                                delivered ◀─[게이트3]─ artifact_review
                                                        └──반려(round+1)──┘
```

승인 규칙을 **행의 존재**로도 표현했다. 팀 3직군의 `CommissionTask` 는 게이트2를
통과할 때 비로소 만들어진다 — 승인 전에는 돌릴 작업 자체가 없다.

`tests/test_commission_gates.py` 가 이걸 잠근다. 특히
`test_no_run_outcome_ever_delivers` 는 팀 3직군의 모든 상태 조합(6³×4)에 대해
**에이전트 실행만으로는 `delivered` 에 도달할 수 없음**을 전수로 확인한다.

### 7-2. 작업 공간 격리

산출물은 `workspace/commissions/<접수번호>/` 안에만 생긴다(`.gitignore` 에 `workspace/`).

```
workspace/commissions/WO-31960672/
├─ 01-기획/요구사항-정리서.md
├─ 02-디자인/디자인-가이드.md
├─ 03-프론트/시안.html          ← /admin 에서 샌드박스 iframe 미리보기
│           /화면-명세.md
└─ 04-백엔드/API-명세.md, DB-스키마.md
```

경계는 두 겹이다.

1. `cwd=root` — **방어가 아니라 편의다.** 절대경로 한 방이면 넘어간다.
2. `can_use_tool` 콜백에서 `workspace.resolve_inside()` — 이쪽이 진짜 방어선.
   정규화 후 판정하므로 `../` 조합·절대경로·접두사가 같은 이웃 폴더가 다 막힌다.

읽기(`Read`/`Glob`/`Grep`)까지 가둔다. cwd 를 옮겨도 절대경로로 리포를 읽을 수 있고,
읽은 내용은 산출물이나 요약을 타고 밖으로 나간다. 필요한 맥락은 전부 프롬프트에 있다.

### 7-3. 실행 경로 둘, 같은 함수

| 경로                             | 조건                                        |
| -------------------------------- | ------------------------------------------- |
| `/admin` 의 [실행] 버튼          | `AGENT_WORKER_ENABLED=true` (기본 **꺼짐**) |
| `npm run atelier -- WO-XXXXXXXX` | 항상                                        |

둘 다 `runner.run_task()` 를 부르고, 그 첫 줄이 `gate.assert_can_run()` 이다.
**터미널이라고 승인을 건너뛰는 뒷문은 없다.**

기본을 꺼 둔 이유: 공개 배포된 웹 서버 프로세스에서 파일 쓰는 에이전트가 돌면 안 된다.
배포본은 승인만 웹에서 하고 실행은 내 컴퓨터에서 CLI 로 한다.

### 7-4. 파일 지도 (3단계)

| 파일                                       | 역할                                      |
| ------------------------------------------ | ----------------------------------------- |
| `app/agents/gate.py`                       | **상태 기계.** 순수 함수만 (DB 를 모른다) |
| `app/agents/workspace.py`                  | 경로 격리 · 산출물 수집                   |
| `app/agents/prompts.py`                    | 4직군 프롬프트 (NPC 인격 그대로)          |
| `app/agents/runner.py`                     | SDK 호출 · 권한 콜백 · 상태 전이          |
| `app/agents/cli.py`                        | 터미널 경로                               |
| `services/commission_service.py`           | 게이트 결정 **저장** (판단은 안 한다)     |
| `components/admin/CommissionWorkboard.tsx` | 검수대 UI                                 |
| `requirements-agent.txt`                   | SDK (웹 서버에는 설치하지 않는다)         |

라우트 5개 추가: `/tasks` · `/gate` · `/tasks/{id}/run` · `/tasks/{id}/reject` · `/artifacts/{id}`

### 7-5. 실측 (WO-31960672, 동네 베이커리 소개 사이트)

| 직군         | 시간  | 비용  | 산출물                              |
| ------------ | ----- | ----- | ----------------------------------- |
| 체리(기획)   | 49초  | $0.13 | 요구사항-정리서.md                  |
| 먹지(디자인) | 68초  | $0.18 | 디자인-가이드.md (HEX·rem 수치까지) |
| 리코(프론트) | 176초 | $0.46 | 시안.html + 화면-명세.md            |
| 굴뚝(백엔드) | 138초 | $0.32 | API-명세.md + DB-스키마.md          |

**한 건 전체 약 $1.1 / 8분.** 프롬프트가 요구한 것들이 실제로 지켜졌다:
개인정보 미기재, 확인 필요 항목 명시, 시안 HTML 의 외부 요청 0건.
체리는 예산(150만원)과 참고 견적 하단(190만원)의 어긋남을 스스로 짚었다.
