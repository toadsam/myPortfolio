# 의뢰 공방 (Commission Atelier)

마을 지하에 숨겨진 **홈페이지 제작 의뢰 창구**. 방문자는 AI 접수원과 대화하며 요구사항을
정리하고 참고 견적을 받아 의뢰를 넣고, 관리자는 접수함에서 그 건을 검토한다.

최종 그림은 세 겹이다.

| 단계 | 내용                               | 상태               |
| ---- | ---------------------------------- | ------------------ |
| 1    | 접수·상담·견적 + 관리자 접수함     | ✅ 2026-08-17 완료 |
| 2    | 지하 3D 공방 + 팀 NPC 5명          | ✅ 2026-08-17 완료 |
| 3    | 직군별 에이전트가 실제 산출물 제작 | ⬜ 미착수          |

> **이 문서는 1·2단계의 구현 기록이다.** 3단계 설계는 맨 아래 참조.

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

### 4-6. 마을의 실광원 예산은 4개다

`VillageScene.tsx`의 `LampPools` 주석에 명시돼 있다 — *"진짜 pointLight는 4개뿐"*이라
가로등 수십 개는 전부 바닥 가산 원반으로 흉내 낸다.
해치에 `pointLight`를 하나 얹었다가 이 예산을 깼다(전 재질 라이트 순열이 바뀌어 셰이더 재컴파일 + 픽셀 비용 증가).
→ 해치는 **가산 원반**으로 바꿨다. 공방도 NPC·서버랙 광원을 걷어 pointLight를 12개 → **4개**(랜턴 3 + 계단 1)로 줄였다.
광량은 개수 대신 세기와 환경광으로 채운다.

---

## 5. 실행과 검증

```bash
# 백엔드 단위 테스트 (80개)
cd backend && pytest

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

---

## 6. 배포 전 필수

- [ ] `ADMIN_PASSWORD` 설정 — **비어 있으면 `/admin` 인증이 꺼진다.**
      공방 이후로는 그게 새면 포트폴리오가 아니라 **방문자의 이름·이메일·전화번호**가 샌다.
- [ ] `ADMIN_SECRET`을 길고 무작위한 값으로 교체
- [ ] `DISCORD_WEBHOOK_URL` 설정 — 없으면 `/admin`을 열기 전까지 새 의뢰를 모른다
- [ ] SQLite 백업 또는 Postgres 전환 — 접수 데이터는 날아가면 안 된다

---

## 7. 3단계 (미착수)

**목표**: 관리자가 접수 건에 작업 지시를 내리면 직군별 에이전트가 **실제 산출물**을 만든다.

- 런타임: **Claude Agent SDK 워커**
- 테이블: `CommissionTask`(직군별 작업) · `CommissionArtifact`(산출물)
- 작업 공간: `workspace/commissions/<id>/` — **포트폴리오 리포는 건드리지 않는다**
- **"항상 상의한다"를 구조로 강제** — 게이트 3단:

```
접수 도착
  └ [게이트 1] 관리자 검토 → 승인/반려
      └ 기획 에이전트 → 요구사항 정리서
          └ [게이트 2] 브리프 검수 → 승인해야 진행
              └ 디자인 / 프론트 / 백엔드 병렬 실행
                  └ [게이트 3] 산출물 검수 → 반려 시 피드백과 함께 재실행
                      └ 관리자가 최종 전달
```

자동으로 최종 전달까지 가지 않는다. 각 게이트에서 반드시 멈춘다.
