# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Next.js portfolio that renders as an explorable 3D village (React Three Fiber). Buildings map to portfolio sections (projects/skills/experience/contact); each has an AI NPC visitors can chat with. A FastAPI backend turns an admin-entered "today's activity" log into live village state (building light levels, NPC moods) and generates NPC dialogue via OpenAI, with rule-based fallback when no API key / on failure. See `docs/PROJECT_DOCUMENTATION.md` for an exhaustive (Korean, beginner-oriented) walkthrough of nearly every file — read it before deep-diving into an unfamiliar subsystem instead of re-deriving architecture from scratch.

## Commands

Frontend (run from repo root):

```bash
npm run dev         # Next.js dev server, http://localhost:3000 (admin at /admin)
npm run build        # production build
npm run start         # run built output
npm run typecheck    # tsc --noEmit
npm run format        # prettier --write
npm run check-format  # prettier -c (CI-safe check)
npm run optimize      # scripts/optimize-glb.mjs — compress GLB models in public/models
npm run atelier       # 의뢰 공방 직군 에이전트 (no args = list commissions)
```

Backend:

```bash
npm run backend:dev   # scripts/backend-dev.mjs: launches uvicorn from backend/.venv if present, else system python
# or manually:
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements-dev.txt   # adds pytest on top of requirements.txt
pip install -r requirements-agent.txt # 의뢰 공방 3단계 에이전트를 돌릴 때만 (claude-agent-sdk)
copy .env.example .env
uvicorn app.main:app --reload --port 8000   # http://localhost:8000
pytest                                 # backend/tests/ — pure-logic unit tests (village_service, relations, relationship_service), in-memory SQLite, no .env needed
```

There is no lint script and no JS/TS test runner in this repo currently — don't assume `npm test` exists. Python has a small `pytest` suite under `backend/tests/` covering pure business logic only (village state derivation, NPC canon/relation mapping, relationship affinity); it doesn't cover FastAPI routes, OpenAI-calling code paths, or the frontend.

### Env vars

- Root (`.env.local`): `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000` in `src/lib/liveApi.ts` if unset).
- `backend/.env`: `DATABASE_URL` (defaults to local SQLite), `FRONTEND_ORIGIN`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_NPC_MODEL`, `GITHUB_TOKEN`, `GITHUB_USERNAME`, `LOCAL_TIMEZONE`. No `OPENAI_API_KEY` → NPCs use rule-based fallback replies, never fail. No `GITHUB_TOKEN` → GitHub sync is skipped gracefully.
- Commission atelier: `DISCORD_WEBHOOK_URL` (unset → intake notification silently skipped), `AGENT_WORKER_ENABLED` (**default false** — gates the in-process agent run route), `AGENT_MAX_TURNS`, `AGENT_TIMEOUT_SECONDS`, `AGENT_MODEL`, `ANTHROPIC_API_KEY` (unset → the SDK uses the Claude Code CLI's own login).

## Architecture

### Frontend entry and data flow

**Three top-level routes, split by weight.** `/` (`src/app/page.tsx`) is a landing screen — `LandingScreen.tsx` (the old `IntroOverlay`) plus three buttons: 마을 보기 / 이력서 보기 / 작업 의뢰하기. It imports **no three.js at all** (measured: 0 GLB, ~214 KB JS). `/village` (`src/app/village/page.tsx`) is the heavy one: `AIPortfolioVillage.tsx`, the app's state machine (`viewMode` = `village | interior | project-interior | resume | atelier`, plus panel, NPC selection, sound, and the NPC-tick/encounter loops), with `VillageScene.tsx` `dynamic`-imported (`ssr: false`) since Three.js needs a browser. `/resume` (`src/app/resume/page.tsx`) is `ResumeMode` alone, split out because it pulls raw `three` for a decorative background.

**That split is the only thing keeping the landing light — don't collapse it.** The intro used to be an overlay rendered on top of a live village, so every visitor downloaded 87 GLBs (20.7 MB) just to read the intro. Every workaround for that (arming the scene on hover, a static backdrop, a spacer div) existed to paper over the structure, and one of them broke the first screen outright — `AIPortfolioVillage`'s `<section>` has no height of its own, so removing `VillageScene` collapsed it to `pt-[65px]`. Landing weight is now a routing property, not a flag someone has to remember. `/` warms the village on hover via `router.prefetch` **plus** an explicit `import("@/components/village/VillageScene")` — the prefetch alone only fetches the route shell, not the nested dynamic scene chunk.

Buildings and NPCs are **generated, not hand-listed 1:1**: `src/lib/constants.ts` defines `villageBuildings` (position/size/color/kind per building), then `src/data/npcRoster.ts` auto-derives one dedicated NPC per building as `npc-${building.id}` — adding a building building automatically gets it a guide NPC. Coordinates in `constants.ts` are authored small and scaled up via `spread()` (`SPREAD` constant) at module load.

Client/server split: everything touching `useState`, Three.js, `window`, or click handlers needs `"use client"` — that's essentially all of `src/components/village/*` and `src/components/ui/*`.

### Data-district pattern (admin → village → NPC)

This is the flow to replicate when adding any new "activity feeds the village" feature (see the study district — coding-test dojo / CS archive — as the reference implementation):

```
backend/app/models.py            (table)
  → schemas.py                   (In/Out)
  → services/*_service.py        (CRUD + context helpers)
  → main.py                      (GET public / POST·DELETE admin endpoints)
  → village_service.derive_village_state  (building light score)
  → catalog.NPCS                 (dedicated NPC profile)
  → chat_service.build_context   (brief summary to all NPCs, detailed injection to the dedicated one)
    + _npc_profile_for_dynamic_id routing
```

Frontend mirror: `constants.ts` (sectionMeta + buildings + cameraTargets) → `types/portfolio.ts` (SectionId/District unions) → `npcRoster.ts` (district NPC type/color + dedicated NPC config) → `Header` (nav) → `InfoPanel` (per-section panel) → `AIPortfolioVillage.handleRequestEnter` (district routing) → `liveApi.ts`/`types/live.ts` (fetch/create/delete) → `admin/page.tsx` (input form).

**Critical convention**: auto NPC id is `npc-${building.id}`. The backend routes to a dedicated profile by matching a substring of that id (e.g. `study-codingtest` → matches `"codingtest"`), so name new building ids so the substring match stays unambiguous.

### Commission atelier (의뢰 공방) — the one public write path

A hidden underground workshop where visitors commission website work: an AI receptionist (도안) extracts
requirements and quotes a **reference** estimate, visitors submit, and the admin reviews in an inbox.
Four teammate NPCs (기획/디자인/프론트/백엔드) staff the room. Two docs cover it:
**`docs/ATELIER_GUIDE.md`** (what works today, how to run a commission end to end) and
**`docs/COMMISSION_ATELIER.md`** (design decisions and, more importantly, the traps already hit —
read this before touching any of it).

Three things make this unlike every other district:

- It is the **only endpoint outsiders write to** (`POST /commission/consult`, `POST /commission`). Honeypot,
  a dedicated rate limit separate from the AI one, consent, and a Discord notification are all load-bearing.
- **Estimates are clamped, not trusted.** `commission_service._clamp_estimate()` holds the model's number
  inside 0.6–1.8× of a rule-based baseline. Never surface a figure without `ESTIMATE_DISCLAIMER`.
- **Entry is deliberately split**: the always-visible button opens the 2D desk directly (real intake path,
  works on mobile); the village hatch and 포스트's hint lead to the 3D room. Don't collapse these into one.
- **Intake and elicitation happen at different times, on purpose.** Intake (1차) exists to get a quote and
  a low threshold — `ready_to_submit` needs only site*type + (pages or features). The information that
  actually decides \_how to build it* (who maintains the site → static/CMS/admin, who supplies photos and
  copy, what counts as success, what already exists) is collected **after** submission at
  `/commission/<access_token>`, because someone who already submitted has low exit cost. Those seven slots
  live in `commission_service._DEPTH_SLOTS` (single source) and are tracked by `depth_missing`, never by
  `missing` — merging them would turn the intake desk into an interrogation. `tests/test_commission_depth.py`
  locks that threshold. The link key is `access_token`, not `public_id` (8 hex is enumerable), and the
  track endpoint never returns contact details.
- **The planner's "확인 필요" list is a script, not a document.** 체리 writes a second file
  (`01-기획/손님-확인-질문.md`, one `- ` question per line) that `parse_question_lines()` turns into
  `pending_questions`; 도안 asks them in the depth chat after the fixed slots. Publishing questions is
  **not** progress — it never touches `gate.py`. Re-publishing preserves answers already collected
  (matched by question text), or the customer gets asked twice.
- **A mockup shared with the customer is bait, not a deliverable.** `CommissionArtifact.shared` (default
  false, only one at a time) puts the HTML mockup on the depth screen via `srcdoc` + `sandbox=""` — never
  a public URL per file, since that URL becomes the leak path.
- **Entry is device-split, and `/atelier` is not the village.** Desktop (`min-width:1024px` AND
  `pointer:fine`, decided only in `useImmersiveCapable()`) opens the standalone 3D room at `/atelier`;
  everything else opens the 2D desk. `AtelierInterior` uses zero GLBs, which is the only reason the room
  can stand alone — routing the landing button to `/village` instead would hand a commissioner 20.7 MB of
  village models and undo the whole point of the route split. The village hatch still opens the same room.

- **1차 접수는 NPC 릴레이 설문이다 (2026-08-23).** 도안→체리→먹지→리코→도안이 10문항을 나눠 묻고, 선택지마다 예시
  카드와 가격 꼬리표가 붙으며 누적 견적이 실시간으로 굴러간다. 대본은 `src/data/atelierIntakeScript.ts` **한 곳**,
  2D 데스크와 3D 공방(바닥 HUD + `CameraRig`)이 같은 `useIntakeFlow` 를 쓴다. 선택지 경로는 LLM 0회 — 서버는
  `GET /commission/pricing` 과 `POST /commission/estimate`(둘 다 순수 계산, 리밋 없음)만 받고, 자유 입력·말 걸기만
  `consult(speaker=…)` 로 그 식구 페르소나가 답한다. 제작 슬롯은 여전히 1차에서 묻지 않는다. 전체는
  `docs/ATELIER_INTAKE_SCRIPT.md`.

- **2층 심화 문답도 같은 릴레이다 (2026-08-24).** `/commission/<token>` 은 세 겹으로 묻는다: 공통 7슬롯 →
  **사이트 종류별 분기 문항**(쇼핑몰 6·예약 5·웹서비스 5·기업소개 4·포트폴리오 3·랜딩 3) → **AI 가 그 의뢰만
  보고 뽑은 맞춤 질문**(`generate_ai_questions`, 의뢰당 **1회 멱등**·최대 5개·중복 제거, 실패하면 조용히 0개).
  대본은 `src/data/atelierDepthScript.ts` 가 track 응답을 보고 **이미 답한 문항을 빼고** 조립하고, 엔진은 1층과
  같은 `useDialogueFlow` 다. 답은 문항마다 `POST /commission/track/{token}/answers` 로 즉시 저장(순수 저장이라
  리밋 없음, 토큰이 자물쇠). **`depth_done` 은 여전히 고정 필수 슬롯만 본다** — 분기 문항도 AI 질문도 완료
  조건이 아니다. 전체는 `docs/ATELIER_DEPTH_SCRIPT.md`.

- **공방 식구는 방을 걸어 다닌다 (2026-08-27).** GLB 캐릭터 5종(합 1.7MB, GLB-0 원칙은 "가볍게만"으로
  완화)이 자기 작업대 근처를 배회하고, 클릭하면 손님 앞까지 걸어온 뒤 대화창이 열리며(부모가
  `activeNpcId` 로 닫힘을 알려줘야 자리로 복귀), 릴레이 설문은 카메라가 접수대에 고정된 채 불린
  식구가 `RELAY_SPOT` 으로 걸어온다. 충돌은 방 전용(경계 사각형 + 가구 AABB,
  `AtelierInterior` "방 안 보행" 절) — 작업대 안쪽 모서리는 0.3 물러서 있다. 팀원 자리가 상판을
  0.15 겹치고 서서, 실측대로 막으면 스폰 지점이 가구 안이 되어 첫걸음부터 갇힌다.
  목표가 가구 반대편이면 축-슬라이드가 dx=0 지점에서 **제자리걸음**이 된다(체리가 접수대 뒤에
  갇혔던 원인) — `detourPoint` 가 막는 가구의 모서리(0.4 물림)를 경유지로 잡아 돌아간다.
  손님이 처음 말을 걸면 전원 작업대에 붙는 **근무 모드**(90초 무접촉이면 해제), 마을 NPC 는
  **벽 따라 걷기**(`NPC.tsx stepToward`)로 움직인다 — 목표 직진이 막혀 있는 동안은 튼 방향을
  계속 따라가고(시간제 고수는 "0.8초 멀어졌다 다시 벽으로"라는 더 큰 와리가리를 만들었다),
  직진이 뚫리는 순간 목표로 복귀한다. 배회 목적지는 pickTarget 이 **가는 길까지 뚫린 곳만**
  뽑고(clearWalk), 4초간 진행이 없으면 새로 뽑는다. 연출 이동의 "막히면 직진" 최후수단은
  래치가 아니라 **1.6초 버스트**(3초 정체 시)다 — 래치는 벽·문 관통의 주범이었다.
  수다는 두 단: **잡담**(`atelierSmallTalk.ts` 고정 대본, LLM 0회·관계 무변화, 8~18초 간격,
  배회 중엔 걸어가서·근무 중엔 자리에서) + **마주침**(E-4 백엔드, 관계·기억, 2분 상한 유지).
  설문·대화가 열려도 방 전체를 멈추지 않는다 — **손님을 상대 중인 식구(excludeRef)만 빼고**
  나머지가 계속 주고받는다. 전체 정지는 "정작 손님이 방을 보는 시간에 방이 죽는" 결과였다.

Two naming traps, both already guarded and locked by `tests/test_relations.py` — keep the atelier branch
**first** in both `relations.canon()` and `chat_service._npc_profile_for_dynamic_id()`, since the existing
`"backend"`/`"frontend"` substring checks would otherwise swallow `atelier-backend` into `developer`.

#### Stage 3 — the four NPCs actually produce files (`backend/app/agents/`)

Claude Agent SDK writes markdown + a single self-contained HTML mockup into
`workspace/commissions/<public_id>/`. Two invariants hold the whole thing up, both locked by
`tests/test_commission_gates.py`:

- **Progress authority is not the model's.** An agent run can only move a task to `review`; the sole
  function that advances anything is `gate.apply_gate()`, called only from `POST /admin/commissions/{id}/gate`.
  `gate.py` is pure (no `Session`) so the rules are testable in isolation — `commission_service` only persists
  its decisions. The team's `CommissionTask` rows don't exist until gate 2 passes.
- **`can_use_tool` is the only real sandbox, and it dies silently.** `permission_mode="default"` +
  `allowed_tools=()` + `setting_sources=[]` is **one set** — `acceptEdits`, or any tool name in
  `allowed_tools`, skips the callback entirely with no error. Reads are path-gated too (an absolute-path
  `Read` would otherwise leak this repo into the deliverables).

`requirements-agent.txt` is deliberately separate: the SDK pulls `mcp` → `starlette 1.x`, which breaks
`fastapi 0.115.6`, so it re-pins starlette. `AGENT_WORKER_ENABLED` defaults to false — the in-process
`/run` route is for local use, and a deployed server should run agents via `npm run atelier` instead.

### Texture/VRAM budget — measure before trading anything away

`PerfHud` reports texture VRAM, and the number that matters is **GPU-resident bytes, not file size**.
JPEG/WebP are transport formats: a 1024² albedo is ~300 KB on disk but **5.6 MB in VRAM**.

Two things are already true and easy to break:

- **`villageMaterial.ts` nulls `metalnessMap`/`roughnessMap`** so the whole village shares one roughness.
  Shipped GLBs therefore must not carry metallicRoughness images — `scripts/strip-metallic-roughness.mjs`
  removes them without touching Draco (`gltf-transform copy` would decode it and re-quantize).
  Re-run that script after any `npm run optimize`.
  props 예산에 하위 폴더 예외가 둘 있다(`optimize-glb.mjs textureGroupFor`): `raw/atelier/` 는
  실내 근접이라 1024, `raw/lake/` 는 물 위 소품이라 **반 칸 작은 256** — lake 를 기본 512 로
  넣었더니 전체 텍스처가 342/340MB 로 예산을 넘겼다.
- **Real `pointLight` count is capped at 4** (see `LampPools`); every extra light changes the shader
  permutation for _all_ materials. Fake additional light with additive ground discs.

`npm run optimize -- --ktx2` exists but is **off by default**. Measured on `central-plaza` baseColor 1024²:
WebP 312 KB/31.3 dB, ETC1S 251 KB/**26.4 dB (visible regression — never use)**, UASTC 1166 KB/35.7 dB.
UASTC improves quality and cuts VRAM 4×, but downloads grow ~2.5× and UASTC floors at ~1 byte/pixel,
so RDO barely helps. Turn it on only once VRAM is _confirmed_ to be the bottleneck.

### NPC relationship system (2026-08-22 2단계 — 자세한 설명은 `docs/NPC_SOCIETY.md`)

**결과는 규칙이 정하고 LLM은 대사만 쓴다.** `POST /npc/encounter` 순서: `relationship_rules.decide_outcome`
(순수 함수 — 기분 궁합 + 오늘 활동 공통 화제 + 12% 확률 사건, ±5 클램프, 기분까지 결정) →
`npc_brain_service.generate_npc_encounter`(그 사건이 드러나는 4줄, 실패 시 kind별 폴백 대사) →
`relationship_service.apply_outcome` → `memory_service.remember`×2 + `gossip` → `VillageEvent`(마을 소식).
모델이 돌려주는 `relationship`/`state_changes`는 **읽지 않는다**.

- 관계 키는 **실제 npc_id 쌍**(`NpcRelationship.npc_a/npc_b`). `relations.canon` 종류 쌍은 씨앗값(`SEED_AFFINITY`)과
  기본 톤에만 쓴다. 같은 종류 다른 NPC도 관계가 생기고, 자기 자신만 없다. 옛 종류-키 행은 startup `purge_legacy_kind_rows`.
  vibe 라벨은 항상 친밀도 문턱에서, 하루 1씩 0으로 감쇠(`_apply_decay`).
- 기억은 `NpcMemory`(NPC당 30, kind: encounter/incident/gossip/visitor). `build_context(memory_lines=…)`로 프롬프트에 들어간다.
- 보이는 결과: `GET /npc/news` → HUD "마을 소식" 피드, `RelationshipViewer`는 NPC 이름 단위, 디렉터는 친밀도 ≥16 찾아가고
  ≤−8은 피하거나 화해하러 간다(`AIPortfolioVillage` `SOUR_AFFINITY/CLOSE_AFFINITY` — 백엔드 상수와 같은 값).
- 수렴 방지 규칙(친할수록 음수 사건 2배)과 클램프·감쇠는 `tests/test_relationship_rules.py`·`test_relationship_service.py`가 잠근다.
  같은 종류 쌍에 관계가 "없어야 한다"는 옛 테스트는 의도적으로 뒤집혔다.
- **3단계(같은 날)**: 사건은 직군별(`Incident.actors`, 템플릿은 `{a:가}` 꼴 조사 자동), 뒷담화가 듣는 이↔제3자 친밀도를 ±1 움직이고(`NpcMemory.delta`,
  같은 얘기는 한 번만), 방문자가 대화창에서 "다른 NPC 이름 + 감정어"를 말하면 `relay_service`가 ±2(LLM 추가 호출 없음, 응답 `relay`),
  마일스톤은 `RelationshipMilestone`에 영구 보관(관계도 "싸움 n · 화해 n"), `GET /npc/memory/{id}`는 visitor 기억을 빼고 내보낸다.
- **4단계(2026-08-23, `docs/NPC_SOCIETY.md` §4-c)**: relay 부정문 무시, 라우트 스모크 테스트(`test_npc_routes.py`, conftest 는 `StaticPool`),
  마주침 뒤 💢/💕 이모트 + 싸우면 등 돌려 걷기(`stageEncounterAftermath`), 프롬프트에 "내 인간관계" 온도(`relationship_lines_for`),
  응답의 `news` 를 즉시 피드에(`pushNews`), 관계 연표(`timeline`), 익명 방문자 기억(`visitor_id`, localStorage uuid), 빈 DB 씨앗 소식,
  📰 하루 요약(`daily_digest_service`, `/npc/news` 첫 호출), 편 들기(`side_bias` ±1), NPC 의 부탁(`NpcFavor`, 이행 +4 🎁, `/npc/favors`),
  오늘 마일스톤이 건물 불빛 한 칸(`todays_light_shift`, override 뒤). 소식은 500개에서 정리. 공방 NPC 는 마을에 없어 공방 사건은 아직 잠잔다.
- **5단계(2026-08-24, `docs/NPC_SOCIETY.md` §4-d)**: visitor 기억 별도 캡(12), 부탁이 대사에 직접 섞임, 모델 응답이 JSON 이 되어
  같은 호출로 relay 감지(사전 규칙 우선, `resolve_mention` 으로 검증), 공방 방이 자체 마주침 루프로 atelier 사건을 깨움,
  절친/앙숙 정점 연출, 활동 한쪽 보정, `VisitorBond` 단골(하루 +2 상한·뱃지), 관계도 간선 💥/🤝 뱃지,
  관리자 "NPC 사회" 서랍(`/admin/npc/society/reset` · `PUT /admin/npc/relationships`). E2E 스모크는 `node scripts/e2e/society.mjs`.
  실 dev DB 는 **리포 루트** `portfolio_village.db`(상대경로) — backend/ 밑의 것은 옛 흔적.
- `npm run backend:dev`(`scripts/backend-dev.mjs`)는 `--reload` 를 쓰지 않고 직접 `backend/app/**/*.py` 를 감시해 `taskkill` 로 재시작한다 —
  예전엔 uvicorn 리로드가 Windows "일괄 작업을 끝내시겠습니까" 프롬프트에 걸려 죽었다. 로그에 `[backend-dev] restart: <file>` 가 찍힌다.
  (수동으로 `uvicorn --reload` 를 띄웠다면 그 문제는 그대로다.)

### Pointer picking, camera, and render budget (2026-08-22)

- **포인터 판정은 투명 히트박스만 한다.** NPC 캡슐(`NPC.tsx`)·건물 박스(`Building.tsx`)·바닥 클릭 원반(`GroundClickCatcher`).
  GLB 메시는 전부 `raycast = noop`(`NpcCharacter.tsx`, `Building.tsx GlbModel`). 보이지 않는 메시도 레이캐스트된다(three Raycaster는
  layers만 본다) — 그래서 되는 구조다. 새 상호작용 오브젝트를 달 때 GLB 자체에 핸들러를 붙이지 말 것.
- **`<AdaptiveEvents/>` 는 쓰지 않는다.** regress 중 포인터 이벤트를 통째로 꺼서 "입장 직후 클릭이 안 되는" 증상을 만들었다.
- NPC는 hover 0.45초면 대화가 열린다(연출 중 `hoverToTalk=false`). 바닥 클릭은 `CameraController.groundTarget`(현재 오프셋 유지).
  자유비행 WASD는 `FREE_FLY_ENABLED`(dev 전용).
- **N8AO의 `transparencyAware`는 반드시 false.** 래퍼가 prop으로 안 넘기므로 `VillageScene`이 ref로 직접 쓴다. 자동 감지가 켜지면
  매 프레임 씬을 두 번 더 렌더한다(CPU 20%).
- `VillageScene`의 정적 자식(지형·물·하늘·등불·프롭 인스턴싱)은 `memo`다 — `npcRuntimeStates`가 1~2초마다 바뀌어 부모가 재렌더된다.
- 렉 보고는 **prod 빌드로 재라**(`npm run build && npm run start -- -p 3100`, launch.json `prod`). dev는 StrictMode 이중 렌더로 롱태스크가 남는다.

### Project detail viewer routing

Each project has a `ProjectCategory` (`dashboard | realtime | platform | game`) set in `src/data/projectThemes.ts`, which `ProjectViewer.tsx` uses to dispatch to one of 4 category-specific viewer components. Games skip `ProjectIntro` (they have their own boot sequence) but every category gets `SoundToggle`. On top of the category viewer, `richContent/index.tsx`'s `SIGNATURE` map layers a bespoke interactive demo per project id (e.g. `festflow` → `FestFlowLiveDemo`) shown as step 0. `ProjectViewer` is reused verbatim by both the 3D `ProjectInterior` scene and the flat `ResumeMode` fallback — don't fork it per caller.

Ambient mood is separate from category: `atmosphere.ts` maps project id → `AmbientVariant` (horror/energy/data/arcade/calm) rendered by `AmbientBackground.tsx` for the 3 non-game viewers; games instead get full art direction (`HorrorLayer`/`ArcadeLayer`/`PlatformerLayer`) gated by theme `mood`. `sound.ts` is a WebAudio synth singleton (no audio files) driven by variant/mood.

`SeasonAmbience.tsx` overlays season/time-of-day particles (snow/petals/leaves/fireflies) computed purely from `Date` at render — no backend involvement.

### Backend service layout

`backend/app/main.py` is the only place routes are declared; each route delegates to a `services/*_service.py`. Key ones: `activity_service` (upsert today's `DailyActivity`), `village_service.derive_village_state` (turns activity counters into per-building light scores and per-NPC moods — read this before changing how any stat affects the village), `chat_service` (OpenAI-or-fallback NPC replies, dynamic-id NPC profile resolution), `npc_brain_service` (autonomous tick + encounter generation, both requesting structured JSON from the model via `response_format: json_object`), `github_service`, `admin_service`. `config.py` (pydantic-settings, reads `backend/.env`) and `database.py` (`get_db` session-per-request dependency, `init_db` creates tables + patches missing SQLite columns on startup) are the only cross-cutting infra files.

### Dev-only 3D prop editor

`src/components/village/PropsEditor.tsx` + `src/app/api/props/route.ts` + `src/data/propsLayout.json` let you drag-place props/building overrides in the browser during `npm run dev` only (`NODE_ENV === "development"` gate); the API route reads `public/models/props/*.glb` and writes layout edits straight back to the JSON file on disk.

### Legacy code, not the active app

`src/App.js`, `src/index.js`, `src/containers/**`, and assorted root-level `.js`/`.jsx` files are the old Create React App portfolio, kept for reference only. The live entry points are `src/app/page.tsx` (landing), `src/app/village/page.tsx`, and `src/app/resume/page.tsx`; these legacy files aren't part of the Next.js build target — don't "fix" them under the assumption they're dead code, but don't extend them either.
