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
```

Backend:

```bash
npm run backend:dev   # scripts/backend-dev.mjs: launches uvicorn from backend/.venv if present, else system python
# or manually:
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements-dev.txt   # adds pytest on top of requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000   # http://localhost:8000
pytest                                 # backend/tests/ — pure-logic unit tests (village_service, relations, relationship_service), in-memory SQLite, no .env needed
```

There is no lint script and no JS/TS test runner in this repo currently — don't assume `npm test` exists. Python has a small `pytest` suite under `backend/tests/` covering pure business logic only (village state derivation, NPC canon/relation mapping, relationship affinity); it doesn't cover FastAPI routes, OpenAI-calling code paths, or the frontend.

### Env vars

- Root (`.env.local`): `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000` in `src/lib/liveApi.ts` if unset).
- `backend/.env`: `DATABASE_URL` (defaults to local SQLite), `FRONTEND_ORIGIN`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_NPC_MODEL`, `GITHUB_TOKEN`, `GITHUB_USERNAME`, `LOCAL_TIMEZONE`. No `OPENAI_API_KEY` → NPCs use rule-based fallback replies, never fail. No `GITHUB_TOKEN` → GitHub sync is skipped gracefully.

## Architecture

### Frontend entry and data flow

`src/app/page.tsx` → `AIPortfolioVillage.tsx` (the whole app's state machine: `viewMode` = `village | interior | project-interior | resume`, plus intro, panel, NPC selection, sound, and the NPC-tick/encounter loops). `VillageScene.tsx` is `dynamic`-imported with `ssr: false` since Three.js needs a browser.

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

`src/App.js`, `src/index.js`, `src/containers/**`, and assorted root-level `.js`/`.jsx` files are the old Create React App portfolio, kept for reference only. The live entry point is `src/app/page.tsx`; these legacy files aren't part of the Next.js build target — don't "fix" them under the assumption they're dead code, but don't extend them either.
