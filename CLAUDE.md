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
- **Real `pointLight` count is capped at 4** (see `LampPools`); every extra light changes the shader
  permutation for _all_ materials. Fake additional light with additive ground discs.

`npm run optimize -- --ktx2` exists but is **off by default**. Measured on `central-plaza` baseColor 1024²:
WebP 312 KB/31.3 dB, ETC1S 251 KB/**26.4 dB (visible regression — never use)**, UASTC 1166 KB/35.7 dB.
UASTC improves quality and cuts VRAM 4×, but downloads grow ~2.5× and UASTC floors at ~1 byte/pixel,
so RDO barely helps. Turn it on only once VRAM is _confirmed_ to be the bottleneck.

### NPC relationship system

`backend/app/relations.py` normalizes any npc*id (including dynamic per-building ids) into a canonical kind (`guide`/`developer`/`archivist`/`coding`/`cs`/`contact`/`project`/`overseer`) and defines a base relationship tone per canonical-kind pair. `backend/app/services/relationship_service.py` persists the \_actual* evolving relationship (`NpcRelationship` model: affinity −100..100, a vibe label, last few history events, meet count) keyed on the canonical pair — same-kind pairs (e.g. two `project` NPCs) never get a relationship row. `relationship_context()` builds the prompt fragment fed into encounter/chat generation; `apply_outcome()` nudges affinity by at most ±5 per interaction and flags milestones (화해했어요/절친이 됐어요/etc). When touching NPC-to-NPC dialogue (`npc_brain_service.py`'s encounter path), this is the layer that gives it continuity.

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
