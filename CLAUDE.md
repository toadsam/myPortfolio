# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Next.js portfolio that renders as an explorable 3D village (React Three Fiber). Buildings map to portfolio sections (projects/skills/experience/contact); each has an AI NPC visitors can chat with. A FastAPI backend turns an admin-entered "today's activity" log into live village state (building light levels, NPC moods) and generates NPC dialogue via OpenAI, with rule-based fallback when no API key / on failure. See `docs/PROJECT_DOCUMENTATION.md` for an exhaustive (Korean, beginner-oriented) walkthrough of nearly every file — read it before deep-diving into an unfamiliar subsystem instead of re-deriving architecture from scratch.

## 작업을 끝낼 때마다: 기존 md 를 최신화한다 (항상)

코드 작업이 끝나면 **시키지 않아도** 그 내용을 기존 문서에 반영한다. 이 파일 한 곳만 고치고 끝내지 않는다.
이 리포의 md 는 실제로 읽힌다 — `README.md`(채용 심사자가 보는 결정·실측·아직 못 한 것), `docs/PORTFOLIO_INTERVIEW_STORIES.md`(면접 답변 원고),
`docs/*_REPORT.md`(수치 증명), `docs/PROJECT_DOCUMENTATION.md`(초보자용 해설, 존댓말). 문서가 옛 결론을 말하면 면접에서 틀린 말을 하게 된다.

- 그 서브시스템을 언급하는 md 를 `grep` 으로 전부 찾아 **해당 절을 고친다**(새 md 를 늘리지 않는다).
- 이번 작업이 옛 결론을 뒤집었으면 그 문장도 찾아 고친다 — 코드 주석 포함.
- `README.md` 의 `파일.tsx#L12-L34` 줄 번호 링크는 그 파일 위쪽에 줄을 넣으면 밀린다. 고친 파일을 가리키는 앵커를 확인한다.
- 수치는 실측만, 조건(빌드·기기·날짜)과 한계를 같이. 문구는 평서체, 본문 대시·격언·삼항 나열 금지.

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
npm run career:corpus # scripts/build-career-corpus.mjs — 경력 안내(쪽지) 말뭉치를 사이트 데이터에서 다시 만든다. `-- --embed` 는 임베딩도(바뀐 조각만, OPENAI_API_KEY 필요). 이력서·상세 페이지 문구를 고치면 다시 돌린다
npm run resume:pdf    # scripts/build-public-resume-pdf.mjs — src/data/resume.ts 에서 A4 PDF 를 찍는다(라벨 열 흑백 양식, 쪽수는 결과) (--private 는 전화번호 포함 사본도. 번호는 gitignore 된 resume/phone.local.txt 에서 읽고, 그 사본도 커밋하지 않는다)
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

**Three top-level routes, split by weight.** `/` (`src/app/page.tsx`) is a landing screen — `CardLanding.tsx` (2026-11-12), the resume headline sentence over **three big floating objects that are the buttons** (house = 마을, document = 이력서, tools = 공방) on the same white/indigo tokens as `/resume`; the resume object alone is filled indigo. Phones fold the three into stacked rows with the resume row first. It was three rounded cards for a few hours the same day; the owner picked this from five mockups ("첫 문장이 없고 카드가 비어 메뉴처럼 보인다") (`TicketLanding.tsx`, the paper-ticket version, and `LandingScreen.tsx`, the old `IntroOverlay`, are no longer what `/` renders; `TicketLanding` stays in the tree as reference only). It imports **no three.js at all** (measured: 0 GLB, 215.6 KB JS; hovering the 마을 ticket is what pulls three, 215→920 KB). `/village` (`src/app/village/page.tsx`) is the heavy one: `AIPortfolioVillage.tsx`, the app's state machine (`viewMode` = `village | interior | project-interior | resume | atelier`, plus panel, NPC selection, sound, and the NPC-tick/encounter loops), with `VillageScene.tsx` `dynamic`-imported (`ssr: false`) since Three.js needs a browser. `/resume` (`src/app/resume/page.tsx`) renders `ResumeV2` (`src/components/resumeV2/`, 2026-11) — a server component with no three.js, built from the approved mockup `c-family-v6` (white page, big type, floating flat icons, pill nav, projects open as an in-place panel). `ResumeMode` is still what the village shows for its in-village resume; the two are not the same component. Per-project detail lives at `/resume/[id]` (`MuscleupDetail` for 득근득근, `ProjectDetailV4` for the rest); a tile with `direct: true` in `resumeV2Data.TILES` links straight to its detail instead of expanding. **The shared template now has hand-written slots (2026-11-13)**: `RichProject.detail` (`intro` with a bold key sentence and "더 읽기" lines, `highlights`, per-challenge `briefs`, fold `summaries`, `secondTocTitle`, `moreLabel`, `bench`), per-metric `source`/`sub`/`mini` (tiles with a source become `aria-expanded` buttons like 득근득근's), and `fieldDay.timeline` (a replayable clock-axis scene; open-ended spans are drawn hatched to the axis end because the end time is unknown, never guessed). Empty slots fall back to the old automatic sentence slicing, so the other five pages did not change. The owner's rule is **"내용이 틀리지 않게"**: fill the slots only from `RICH_DATA`, `docs/projects/<id>.md`, `resume/jeong-jaehun-resume.md`, the `*_REPORT.md` numbers and **the project's own GitHub repo** (`gh` is logged in as toadsam; private repos readable), leave a slot empty rather than guess, and build a scene only where a measured or repo-verifiable record exists. Scene kinds live in `detail.scenes[]` (`SceneSpec` in `shared.tsx`): `timeline` (clock or date axis, open-ended spans hatched), `bars`, `line` (`y: null` breaks the line instead of interpolating), `frames` (range-scrubbed crossfade), `steps` (flow with dashed `alt` branches for fallbacks), `puzzle` (playable 3×3 with a mandatory `caveat` when the pattern values are not the real ones); `beforeAfter` with two shots renders as a drag slider (`detail.compareTags`). Ten pages were filled on 2026-11-13 (FestFlow, ajouchong, aclub, mystock, darklab, tserof, sign-language, then otherside-vr, monsterpoint-ar, ajou-indigame); only `village-portfolio` and `ajou-adventure` still use the automatic fallback. The three game pages were corrected from their repos too: IMP_VR starts 2025-05-18 (not April) and his 25/161 commits are `Assets/JJH`, with "메인 기획" demoted to 기획 참여; IMP's AdjustmentSystem/Spawner were teammates' files, so its core code and challenges now use his `Assets/Scripts/JJH` weapon code (51/109 commits, work 2025-04-18~05-03, 4 weapons counted in `Final.unity`); Ajou_IndiGame is the same project as 아주대탐험 (124 commits, all his), and "시간 정지"/"보스 예고" were branch- or wording-dependent and were softened. The five `OTHERS` cards under the tiles are headed **대표 프로젝트** (the owner rejected "그 밖의 프로젝트": "여기가 훨씬 더 중요한 대표 프로젝트야") and link to details. The old ResumeMode 사이드 프로젝트 list (15 entries from `subProjects`) sits under them as **small always-open rows** (`.subs` > `.sub`: 44px thumbnail, title, two-line clamp, text links; three columns ≥1000px, one on phones; the four without an image get a first-letter tile). Same day it was a collapsed `<details>` (rejected: no fold) and then a five-column square-card grid (rejected: side projects must be much smaller than the 대표 cards). Two were **rewritten from the repo, not from the old copy**: MyStock (README 2026-11: live at mywave.day since 2026-11-10, 19 screens, 111 endpoints, release-day API audit 137→146/152, tests 29→41, "폴백" corrected to 갱신 건너뛰기; screenshots copied from the repo's `docs/screens` as `public/projects/mystock/repo-*.webp`) and DarkLab (commit authorship 126/317 with "(-재훈)" signatures; the old "Cinemachine priority blending" claim was a teammate's `CameraChange.cs` and is gone; his verified work is CameraRays 2-second gaze, GrandMaMove/BedEvent/PulsingLamp). TSEROF's four evidence URLs pointed at a teammate's private repo and were removed (note kept); its puzzle scene uses example patterns and says so. 수어지교 numbers come from its README 측정 결과 (120 words / 17 with video / 20 quiz items / 101 ms), not the old "30+". The reveal gating moved from the JS-added `.p4-js` class to `@media (scripting: enabled)` so the first paint no longer flashes. Three reading-cost rules from the owner's review (2026-11-13 evening): every `/resume` tile links straight to its detail (`direct` is no longer read; the in-place panel remains only for the 대표 프로젝트 cards' legacy data and chips); a "자세히" fold whose hidden rest is under 120 chars and one paragraph is rendered inline instead (`isShortRest` in `ProjectDetailV4`), while "원래 문장 보기"/"출처 더 보기" stay folded; PR/commit URLs never appear as hero pills (`addLink` drops them) and live instead on timeline event rows (`TimelineSpec.events[].href`) or evidence boxes; a tile's `source` is one line of at most ~60 chars (what · period · one limit), with the longer caveats in `metricsNote`. Portrait media never sits alone in the 1,216px column: a portrait before/after slider puts its notes beside the 420px box (`.p4-cmp-portrait`, ≥900px), and `problemShot` is skipped when it is the same file as a slider side. A gallery of exactly four portrait shots renders four across (`.p4-gal-4`, ≥1100px; two across at 760~1099px) so one phone capture is never 600px wide, and a `frames` scene whose source captures are small takes `maxWidth` (the AR weapon scene is 380px originals, capped at 560px) instead of filling the 1,216px column with upscaled pixels. **Backend evidence pass (2026-11-13 evening, `docs/BACKEND_EVIDENCE.md`)**: the four backend-heavy projects were re-read from their repos and the cards now carry one "people" number plus server numbers (MyWave: live · 137→146 · 98 tests + CI 3 jobs; AjouFesta: 7,078 · 0 incidents/5 deploys · tests 3→23 files; 득근득근: 2.0× on 200k rows instead of "4→8 domains"). A detail page may have **eight tiles** (two full rows of four: people on top, server below) and never six. Troubleshooting shows four cards before the fold (was three for 5+, which left a lone card beside empty space). Things the repos corrected: MyWave's coach now calls a model and `CoachAnswerGuard` drops answers with numbers not in the server-supplied context (so "only one screen calls a model" is gone); 총학생회's Docker/Nginx/CI were written by teammates, so the `try_files` 404 card is replaced by his own PR #69 admin-rule fix (`/api/admin` → `/api/admin/**`) and the EC2 compose commit; FestFlow's load test was run locally, not on a practice server; GA4 belongs to aClub only (총학생회 is Search Console). **Compact detail layout (`detail.compact`, AjouFesta only so far)**: when set, the first screen ends at intro + four chosen tiles + the three-line summary + one featured scene; the other tiles and the source note fold behind "수치 N개와 출처 더 보기", every formerly open section becomes a folded section with a one-line `summaries` entry, troubleshooting shows two cards, the hero can be swapped for a low landscape image (`compact.hero`), and `compact.hide` drops challenges/diagrams/decisions/process **on this page only** (the data stays because the village room reads it). The featured scene sits inside an `XFold` that CSS forces open at ≥760px and leaves collapsed on phones. Measured: 8,341px → 2,579px desktop. The owner wants this page finished before it is rolled out to the others. Later the same night three more slots were added for it: `compact.compareFirst` puts the `beforeAfter` drag slider (May screens ↔ October screens, same 21:9 composition) right under the tiles because a rebuilt project should show the change before it explains it; `detail.problems` draws the problem definition as three native cards instead of a pasted presentation slide; and the research stat box is skipped when those cards exist. **Text trim (2026-11-14)**: with every fold closed the page showed 2,789 visible characters; the same count after the trim is 2,137 (page height 3,166px at 1440). The cut was repetition, not content: the intro is one bold sentence (the May story moved into "더 읽기"), slider notes are one sentence each and lose their duplicate heading when compact, the scene source names files without line numbers, fold summaries are one short line (`compact.summaries.retro`, `compact.secondTitle` with the eyebrow "리뉴얼" instead of "Renewal · Second Run"). Tile sources were already hidden until the tile is pressed. **Story layout (`detail.story`, 2026-11-14, AjouFesta only)**: trimming sentences did not fix readability, because the page was a dashboard of folded headings with no reading order. The owner picked variant G out of seven mockups (kept at https://claude.ai/artifact/SAxBx12V6Tkzi6rcWFuuoj; the local copy is `public/draft/ajoufesta-v2.html`, not for deploy). With `story` set, the head (intro, tiles, May↔October slider) stays and everything below is six **open** sections read top to bottom: 문제 → 5월 첫 운영 → a six-row table of 문제였던 것 · 고친 것 · 확인 → 새로 만든 화면 → 검증 → 결과. The why/field/trouble/result sections are dropped from `body` after the fact (by key), the head no longer draws "기술적으로 한 일" or the featured scene, and the second-run fold keeps only the Claude Code part and 준비. The table (`.p4s-lg`) is the centerpiece: each row is three tinted blocks joined by arrows (see the 2026-11-14 night note further down; the sticky header row is gone), the three filter buttons are handled in `ProjectDetailV4Motion` (`data-lg-filter`), and a row can carry a scene (`scene` = a `detail.scenes` title) and a folded 자세한 설명과 코드 (`challenge` = index into `challenges`). Table cells are re-bundled from fieldDay/challenges/secondRun, so numbers there must match those sources. Body text in this layout is 16–18px dark; grey small text is for sources and captions only. Desktop height went 3,166px → 10,485px on purpose. Images in this layout sit on one light-grey stage (`.p4s-shot`): the navy composite boards with English labels baked in (`oct/festflow-oct-g-*.webp`) clashed with the white page, so the phone screens were cut out as transparent `oct/phone-*.webp` (the three composites share one phone box, 254,116–746,1108) and CSS draws the same frame on all five. The composites stay in `gallery` because the village room uses them. Each card shows the **whole** phone screen without a click (the owner rejected cropped stages that needed a tap to see the rest): the four 새로 만든 화면 cards are phone-left / text-right, the three 결과 cards are phone-top / text-below. The hero image and the May↔October slider still use navy boards; the owner asked to do the lower images first. The lightbox now fits an image inside 78vh instead of stretching a phone capture to the box width. **Full-page headless screenshots show the featured scene blank; viewport screenshots show it correctly** — do not chase that as a page bug. **득근득근 story layout (2026-11-14, approved and applied the same day)**: `MuscleupDetail` takes a `story` prop and `/resume/[id]/page.tsx` passes it, so `/resume/muscleup` is the story layout (the draft route `/resume/muscleup-story` was deleted; dropping the prop still renders the old layout). The head (hero, eight tiles) stays; below it are five open sections: 1.0 과 피드백 (four quote cards + hypothesis) → 첫 화면 (the existing 1.0↔2.0 slider, untouched, with the 1.0/2.0 scope table and 준비 folded under it) → a ten-row table (four feedback rows 「1.0 에서는 · 2.0 에서 한 일 · 결과」 + six challenge rows 「문제 · 한 일 · 결과」; only the three rows that have a scene are open and the other three sit behind 「3건 더 보기」; filter via `data-st-filter` in `MuscleupDetailMotion`) → 새로 만든 화면 → 결과와 남은 것 (the open list of what is left, then the 2.0 lobby capture as the last image). A second pass the same day cut repetition after the owner agreed to four changes: the separate 1.0 과 2.0 section was removed (its stat tiles repeated the head tiles), 기술적으로 한 일 moved from the head into the 만든 순서와 맡은 일 fold, and the navy API map moved into the 어떻게 짜여 있나 fold. Measured at 1440: 11,353px → 9,239px with nothing deleted. The owner's condition was that the existing scenes stay as they are: the token-rotation sequence, the index bars and the ramp graph are the same functions, placed under their table rows with evidence, 자세한 설명 and code beside them. The s-second fold is not drawn in story mode because all of its content moved into open sections, and the retro fold drops 「아직 남은 것」 for the same reason. Section titles in `MU4_DATA.story4` are sentences copied from the existing copy; body text is read from `rich`/`brief4`, never retyped. Styles are the `.st-*` block at the end of `muscleupDetail.css`. Two things learned: the slider's after image must stay `lobby-responsive.webp` (swapping in the same-composition `home-lobby.webp` left the right half empty at 반반, because its content sits on the left), and `.gal .im` has `max-height:300px`, which shrinks the box width through `aspect-ratio` and pushes the image to one side unless the cap is lifted. The step-5 overlap in the token scene was fixed for both layouts (the 「T1 재사용」 badge moved to the tab A lane, the X drawn right of the chip). When snapshotting a page into an artifact, fetch the stylesheet text; `cssRules[].cssText` serialises a shorthand that contains `var()` as empty longhands, so every `animation` disappeared. **aClub story layout (2026-11-14, approved and applied the same day)**: `richContent/aclubStory.ts` is an override layer like 총학생회's; `data.ts` ends with `RICH_DATA.aclub = aclubStory(RICH_DATA.aclub)`, so `/resume/aclub`, the village room and the one-pager read it (the draft route is deleted). The table is seven rows under 「상황 · 한 일 · 결과」: two for 2025 (login/API work, and the first-launch outreach) and five for 2026 as project lead. The 화면 section says outright that the 2026 screens were coded by two teammates and lists what he changed on each. Three corrections went straight into `data.ts` because they were wrong on the live page too: the cohort capture does show week 3 (3.2%), so the line scene no longer leaves it blank; the 「직접 알리고 섭외한 기록」 capture (스크랩 111) has comments dated 2025-03-04, so it belongs to the 2025 first launch, not 2026; and 「모집공고 최신순 정렬」 does have a commit (2026-01-25). The service is closed, so nothing can be re-captured: `public/projects/aclub/v2/` holds the first two phone screens cut from the 2026 composite, and the third screen (a poster with a face) is not used. `story.result.quote` was added for the club president's message. **TSEROF story layout (2026-11-14, approved and applied the same day)**: `richContent/tserofStory.ts` is an override layer; `data.ts` ends with `RICH_DATA.tserof = tserofStory(RICH_DATA.tserof)` (the draft route is deleted). Four sections (문제 → 내 몫 → six-row table → 결과와 남은 것); `story.built` became optional because there are no screens worth a section. **The puzzle is now the real one.** The old scene said the pattern values were examples because the repo is private, but a local clone exists (`문서/GitHub/TSEROF`, all branches, 1,204 commits) and the game differs from the old demo: cells have three values (0 빈칸 · 1 얼음 · 2 물), the player steps on six line buttons that advance a row or column by one (plus reset to all 0), five `int[9]` answers rotate every 25s and the board returns to all 물. `SceneSpec` puzzle got `lines: {states, start, solved}` and the scene uses the five real arrays from `PatternSign.cs`; every pattern is reachable from the start board (checked by solving). Other facts from the clone: his commits run 2023-10-25 ~ 12-13 (not from 10-23, which is a teammate's first commit), 28/144/44 by month; the 고드름 user-test fix is his commit of 2023-12-04 (`FallingObject.cs`, trigger while falling, off on the Ice tag) and is now a table row; the 「만들고 부수던」 before-code in `gimmick-icicle.webp` is not in the file's history (only the 12-07 WaitForSeconds caching is), so the caption says so; the 통나무 and 카메라 feedback items are not claimed. **마을 story layout (2026-11-14, approved and applied the same day)**: `richContent/villageStory.ts` is an override layer; `data.ts` ends with `RICH_DATA["village-portfolio"] = villageStory(...)`, so `/resume/village-portfolio`, the village room and the one-pager read it (the draft route is deleted). With this every detail page that has a story layout is applied: AjouFesta, 득근득근, 총학생회, aClub, TSEROF, 마을. Six sections; the table is eight rows, four on speed (route split, WebP textures, light pool, first-visit precompile) and four on rules that bound model output (agent sandbox, gate function, estimate clamp, NPC fallback); section 02 says outright that the code was written with Claude Code and that choosing, measuring and verifying were his. The entry in `data.ts` was three months stale, so counts were re-taken from this repo on 2026-11-14: 69 endpoints (was 63; README said 65 on 09-07), tests 267 functions / 342 collected cases (the old 258 was a `def test_` count, so both are shown), `CLAUDE.md` 389 lines, 27 buildings and 36 gate tests unchanged. The served GLB folder (excluding `raw/`) is now 185 files, 49.4MB: the old "54.0 → 30.3MB" is the August WebP before/after and assets were added since, so the page shows all three bars. The first-visit precompile numbers (17.6~22.5s → 6.1~7.3s, 66 → 47 programs, 2026-09-20) were not on the page at all and are now a row. README's route/test counts were updated the same way. Captures are `public/projects/village-portfolio/v3/*`, taken locally (dev + `backend-verify`) with a real GPU (`--use-angle=d3d11`); `/village` needs the title's 「눌러서 들어가기」 clicked first, and the dev-only PERF panel (F8), 「배치 편집」 button and Next badge were removed before shooting. The admin capture is from the empty verify DB. **AI-tone pass, priority 1 (2026-11-14, owner's request)**: the text of `/`, `/resume` and all thirteen detail pages (2,910 sentences) was dumped and scanned by pattern, and four kinds were rewritten across `data.ts`, the story layers, `muscleupDetail.data.ts`, `resume.ts` and `projects.ts`. (1) Figurative verbs: 테스트가 「잠급니다」 → 「확인합니다」, 「치웠습니다」 → 「고쳤습니다」, 「덧칠」 → 「덧붙여 만든」, 「헛돕니다」 → 「효과가 없습니다」, 「죽어도 … 사는」 → 「실패해도 … 나오는」, 「빨간불」 → 「실패」, 「살렸습니다」 → 「고쳤습니다」. (2) The 「A가 아니라 B」 frame when it is there for effect; sentences that separate two facts (「서버가 아니라 소스에 적힌 상수」) stay. (3) 「대가는 ~」 and 「빚」 → 「대신 ~」 / 「단점이 ~ 가지」 / 「아직 못 한 것」 (README's heading too). (4) Em dashes inside strings → 가운뎃점, or a full stop where it joined two clauses; date and time ranges keep their en dash. Do not reintroduce these when writing new copy. **Priority 2 was done the same day** (script kept only in the session scratchpad; about 100 replacements, re-scan of all fifteen pages afterwards). Rules to keep: (a) a limit is stated **once per page**, in 「남은 것」 or the one source line, never repeated per tile, tag and table cell (총학생회 said the same thing six times); every detail page still has at least one limit sentence. (b) **Never tell the reader how the page used to be wrong** (「예전 이 페이지는 … 제 것처럼 적고 있었습니다」): write only the corrected fact. (c) Commit hashes are gone from the remaining pages' body text too (인디게임, 아주대탐험, 수어지교); dates stay. (d) 「한 줄이 한 가지입니다. 왼쪽이 …」 table-reading leads are deleted (the column headers say it; an empty `ledger.lead` is simply not drawn), 「더 깊이 궁금한 분만 여세요」 is 「더 자세한 기록」. (e) 「~라고 봤습니다 / 판단했습니다」 stays only in the hypothesis slot. (f) 번역투: 「~하고자 했습니다」 → 「~하려고 했습니다」, 「간헐적으로」 → 「가끔」, 「제공하도록 설계」 → 「~할 수 있게 했습니다」, 「결합도」 wording → what actually does not need changing. (g) Arrow chains inside sentences are written out (DarkLab's four-step chain appeared four times); arrows stay in diagram labels, number before/after and the one-line 만든 순서 summaries. (h) 낫표 only for real UI text, commit messages and quotes. 「그림을 누르면 커집니다」 is gone as text: every zoomable image carries a magnifier badge instead (`::after` on `.pd4 .p4-zoom` and `.mu4 .gal .im`, bottom right, dark translucent so it reads on photos and on white phone screens; diagrams put it at the top right of the card, `.pd4 .p4-diag` / `.mu4 .diag`, because the drawing has labels in its corners). The badge is CSS at the end of `projectDetailV4.css` and `muscleupDetail.css`; do not write the sentence again. **The story table is three blocks joined by arrows (2026-11-14 night, variant R out of twenty-three mockups at https://claude.ai/artifact/32i3d3pGFao2TWUdPQ8cod)**: 문제였던 것 (red tint) → 고친 것 (indigo tint) → 확인 (green tint, big number in green), each its own rounded block with its column label inside, the row number to the left. When a row scrolls in the arrows draw left to right, the blocks take their colour in order and the result number pops; hovering lifts the three blocks. Without scripting the blocks are coloured from the start. The owner's rule that decided it: **the title and description of all three cells are visible without hover or click; only 「자세한 설명과 코드」 folds** (mockups that revealed text on hover were rejected as "개발적으로 중요한데 바로 한눈에 보여야지"). Motion is for entrance and hover emphasis, never for hiding content. The sticky three-column header row and its hover-dim rule are gone because each block carries its own label (`.p4s-col`); `ledger.cols` still names them per page. Same shape in both templates: `.p4s-row` in `projectDetailV4.css` and `.st-cells` in `muscleupDetail.css` (득근득근 keeps its row title above the three blocks). On phones the blocks stack and the arrows are not drawn. The TOC entry for this section is 「문제 · 해결 · 확인」 (default in `ProjectDetailV4`; aClub keeps 「상황 · 한 일 · 결과」 because its columns differ), and source lines no longer end with 「· 본인 서술」 (owner: not needed on screen). Variant S (dark left half / white right half / green band) was applied for a few minutes first because the owner typed S by mistake; it is not in the code. 「손잡이를 끌어 보세요」 stays. Left on purpose: the 수어지교 normalisation card (the fix-before state is not in the repo, so the card needs a content decision, not a wording one). Code excerpts and quoted commit messages were left as they are. **PR · commit · code-file links are switched off everywhere (2026-11-14, owner's call)**: `src/lib/codeLinks.ts` holds `SHOW_CODE_LINKS = false`. `stripCodeLinks()` deletes every `url`/`href` that points at a GitHub pull/commit/blob/tree/compare page, and it runs once where data is exported (`RICH_DATA`, `MU4_DATA`, `AJOUCHONG_DRAFT`), so the detail pages, the village room and the one-pager all lose them together; `projects.ts`, `resumeV2Data.LINKS` and `ResumeMode` filter their link lists with `withoutCodeLinks`/`codeLinkOk`. Repository home links (the GitHub pill), live-site and demo-video links stay. The addresses are still written in the data, so re-enabling is the one flag. Reason: some linked PRs have an empty body or a title like "Jjh rental", one commit is 11,771 lines, and a weak link sets the impression; they come back after the PR bodies are tidied. PR numbers, dates and line counts remain as text. The resume PDF scripts read `resume.ts` directly and were not changed. **No commit hashes in reader-facing text (2026-11-14, owner's call)**: on AjouFesta, 득근득근 and 총학생회 the body no longer prints hashes like `3b26e9f0`, and evidence notes that read like audit memos ("이전에 잘못 저장되던 구현을 만들어 넣지 않았습니다", "구현 확인 · 이전 문제 코드 미확인") were rewritten in reader language. PR numbers, dates and the links themselves stay (the hash lives only in the `url`/`href`), and sentences that state a limit (전후 수치 없음, 테스트 없음, 리뷰 없이 머지) stay. Evidence status labels are now 「코드로 확인」/「전후 코드로 확인」 across `data.ts`. The other pages' notes still carry hashes; apply the same rule when they are rewritten. A link button should not point at a commit whose message is noise: 득근득근's token-rotation button used to open the commit titled "1" and now opens the current `RefreshTokenService.java`. **총학생회 웹 rewrite (2026-11-14, approved and applied the same day)**: the live site was redesigned in 2026-09 (front PR #37, 87 files; link order PR #38 + backend `bf6f1d8a`) and the `data.ts` entry still told the story up to April with six captures of a design that no longer exists. The rewrite is an override layer, `richContent/ajouchong2026.ts`: `data.ts` ends with `RICH_DATA.ajouchong = ajouchong2026(RICH_DATA.ajouchong)`, so the detail page, the village room and the one-pager all read the new values, and keys the layer does not mention (perf, decisions, coreCode) come from the April entry. It was kept as a layer so the text the owner approved as a draft ships unchanged; when the copy is merged into one file, move the values into `data.ts` and delete the layer. The draft route is gone (`ProjectDetailV4` still accepts a `draft` prop for the next page). The resume card, `projects.ts`, `resumeV2Data` and `resume/jeong-jaehun-resume.md` were corrected too (링크 11개 → 9개, the "여섯 갈래" sentence replaced by the September redesign); the resume PDF was not regenerated. New captures are `public/projects/ajouchong/v3/*` (taken from the live site on 2026-11-14 with the first banner slide, the statue, because other slides show faces; admin screens need a login and were not captured). The story template was generalised for this: `story.toc` (section names), optional `story.field` with `field.scene`, `ledger.allLabel`/`cols`, `built.wide` (landscape captures: image on top, `.p4s-shots-wide`), optional `story.verify`. Facts the repo settled: `polish.css` (1,483 lines, 95 `!important`) was added by his own April PR #36 and unhooked in September, so the page says he rewrote his own overlay; the banner originals with web copies sum to 61.4MB, not the PR body's 71MB; the April "six shortcuts on the first mobile screen" is gone from the live site, so that sentence is not used; Search Console data ends 2026-08-30, so nothing is claimed about the September redesign's effect. AjouFesta's evidence links now point at the sanitized public copy `toadsam/AjouFesta` (one commit; photos, DB dumps, names, phone numbers and the bank account removed or masked), which also carries the post-festival `OrderConcurrencyTest` (100 concurrent orders: 100 distinct numbers with the row lock, 17 without) and the re-written load script. Those two were done **after** the festival and the page says so. **aClub was rewritten to commit authorship the same night**: the 2026 TypeScript frontend (hooks, route guards, GA4 tag) was written by two teammates in 2025-09~11, so the page no longer says he rewrote it or led the frontend. What remains is what the repo proves — the deploy workflow he fixed (9 failed runs → green at `31c4188`), the launch-day filter fallback (`470135d`), the recruitment-type chip, his 2025 login/API work (48/310 commits) — plus the launch/promotion work that leaves no commits (post screenshots). 수어지교 went the other way: commit counts (8/32 in `backend/`) understated him, `git blame` confirmed the README (158/338 lines of `TranslationService`), so the card stayed and the 2026.09~10 ML phase (`ml/experiments.md`, 28/32 commits) was added. **Do not judge contribution by commit count alone; blame the files.** FestFlow's evidence links point to a mailto (repo private since 2026-10; the GitHub commit URLs were 404), and `projects.ts` 's festflow `description`/`nextStep` were still the May wording ("실시간 부스 관리 시스템", "SMS 알림 예정") until this change. **Header tags (2026-11-13 night)**: the small uppercase English line under the title (`r.tagline`) is gone when a resume card exists; in its place `.p4-kinds` shows one kind tag (`CATEGORY_META[card.category].label`, filled indigo) and at most two trait tags (`FACET_META`, outlined; a trait the kind already says, like AI next to Data / AI, is dropped). The status pills stay on their own row below. Labels come only from `resume.ts`, so do not add a second label map. What the owner actually asked for was the same tags **on the `/resume` cards** (2026-11-14): `Kinds` in `ResumeV2.tsx` draws them above the title of the six tiles and the five 대표 프로젝트 cards (`.kinds` > `.kind`/`.facet`; tile id `village` maps to card `village-portfolio`). Side-project rows get none. On the six tiles the emphasis is flipped (kind = quiet outline, traits = filled indigo) because five of the six are Web Service and the kind tells nothing apart there; the five 대표 cards keep the filled kind since theirs differ. 총학생회 got `facets: ["data"]` (Search Console) and 수어지교 `["ai"]` (the ML phase), both confirmed by the owner. **Accent is indigo `#4f46e5`** (chosen 2026-11-12 over the mockup's Toss blue `#2f6bff`; the five shades live as `--accent*` tokens in `resumeV2.css`, and the icon SVGs read those variables, so change the color only there). The owner likes this layout as-is — color and motion are fair game, the structure is not.

**That split is the only thing keeping the landing light — don't collapse it.** The intro used to be an overlay rendered on top of a live village, so every visitor downloaded 87 GLBs (20.7 MB) just to read the intro. Every workaround for that (arming the scene on hover, a static backdrop, a spacer div) existed to paper over the structure, and one of them broke the first screen outright — `AIPortfolioVillage`'s `<section>` has no height of its own, so removing `VillageScene` collapsed it to `pt-[65px]`. Landing weight is now a routing property, not a flag someone has to remember. `/` warms the village on hover via `router.prefetch` **plus** an explicit `import("@/components/village/VillageScene")` — the prefetch alone only fetches the route shell, not the nested dynamic scene chunk.

**착륙장의 첫 독자는 대기업 채용 심사자다 (2026-09-02).** 그래서 가운데 물건은 이력서고
(`CardLanding` 의 `.cl-main`, 휴대폰에서는 `order:-1` 로 맨 위), 물건 위에는 이력서와 같은 첫 문장(`hero.headlineLines`)과 이름·직무·입사 가능
시점이 `data/hero.ts` 에서 그대로 나오며, 푸터에는 PDF 내려받기가 있다(서류 심사는 첨부 PDF 가
본체다). 함정 둘: **① 신원 머리글은 흐름이 아니라 절대 배치여야 한다** — `.cl-stage` 가 세로
가운데 정렬이라, 흐름에 넣으면 무대 높이를 아무리 줄여도 물건들이 머리글의 절반만큼 내려앉는다
(표 시절 360×700 실측 56px). 세로가 짧은 화면은 `max-height` 쿼리로 가능
시점 → 직무 순으로 줄을 접는다. 2026-11-12 표 → 카드로 바꿀 때 이 둘을 그대로 가져왔다. 한 번 밟은
것: `.cl-root button {background:none}` 리셋이 물건 판(`.cl-pic`)의 배경을 이겨서 판이 투명하게 떴다 —
리셋은 `:where(button)` 으로 특이도를 낮춰 둔다.
**물건을 누르면 "호로록" 넘어간다 (같은 날 저녁).** 누르면 그림이 0.14초 줄며 사라지고(누름 반응), 그 뒤
`pushWithTransition(router, href)` 가 `document.startViewTransition` 으로 라우터 이동을 감싼다. 누른
물건의 판(`.is-pressed .cl-pic`, 이름 `cl-cover`)은 옛 조각이 1초 동안 화면 전체로 커지다 녹고, 그 밑에서
새 화면이 아래서 떠오른다(모양은 `globals.css` 끝 `::view-transition-*`). 콜백은 `.cl-root` 가 DOM 에서
사라질 때까지 기다린다(상한 2초) — `router.push` 는 바로 돌아오고 교체는 RSC 응답 뒤라서. **주소가 안
바뀌는 동작(모바일 2D 의뢰 데스크)에는 쓰면 안 된다** — 화면이 2초 굳는다. 두 번 되돌린 것: 판이 덮인 채
머무는 단계(끊겨 보임)와 착륙장 문장 ↔ 이력서 h1 을 같은 `view-transition-name` 으로 잇던 것(줄바꿈이
달라 글자가 겹쳐 보임). 뒤로 가기는 브라우저 기본 이동이라 역재생은 아직 없다. **② 이름 한 줄 때문에 `@/data/resume` 를 import 하면 안 된다** —
한 덩어리 모듈이라 이력서 데이터가 통째로 첫 화면 번들에 들어온다(실측 216→221 KB). 그래서
`data/hero.ts` 로 분리했고 `resume.ts` 가 그것을 재수출한다.
**커서는 두 갈래다 (2026-11-13).** 루트 레이아웃의 `CustomCursor` 가 주소를 보고 고른다. `/`·`/resume*`·`/commission/*`(2026-11-14 추가) 는 인디고
점+고리(`DotRingCursor.tsx/.css`, 후보 일곱 중 본인이 고른 3번) — 점은 포인터에 붙고 고리가 rAF 로 한 박자 늦게
따라오며 링크·버튼 위에서 60px 로 커지고 누르면 24px 로 준다. 나머지 화면은 예전 금색 네온 링(PNG 로 구워
`cursor:url()` 로 다는 OS 커서)이다. 두 방식이 다른 건 일부러다: 마을은 GLB 파싱으로 프레임이 멎어도 커서가
안 밀려야 하고, 흰 화면은 "늦게 따라오는 고리"가 모양이면서 three 가 없어 멎을 일이 없다. 글 입력칸 위에선 점·고리를
숨기고 I 자로 돌아가며, `(pointer:fine)` 이 아니면 아무것도 안 그린다. 색은 CSS 에 값으로 적혀 있다(body 끝에 붙어
페이지 토큰이 안 닿는다) — 인디고를 바꾸면 `DotRingCursor.css` 도 같이.

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

Frontend mirror: `constants.ts` (sectionMeta + buildings + cameraTargets) → `types/portfolio.ts` (SectionId/District unions) → `npcRoster.ts` (district NPC type/color + dedicated NPC config) → `Header` (nav) → `InfoPanel` (per-section panel) → `AIPortfolioVillage.handleRequestEnter` (district routing) → `liveApi.ts`/`types/live.ts` (fetch/create/delete) → `admin/_drawers/*Admin.tsx` (input form, one drawer per district, listed in `admin/_tabs/DrawerTab.tsx`).

**Critical convention**: auto NPC id is `npc-${building.id}`. The backend routes to a dedicated profile by matching a substring of that id (e.g. `study-codingtest` → matches `"codingtest"`), so name new building ids so the substring match stays unambiguous.

### 관리자 배전반 2.0 (2026-10-17 → 10-18 한 화면, 화면별 설명은 `docs/copy-admin.md`)

`/admin` 은 휴대폰에서 매일 쓰는 앱이고 **한 화면**이다. 위에 붙은 지도+루미(`_shell/BoardHead`), 회로마다
바로 아래 그 회로의 지시서(`_components/CircuitBlock` + `OrderRow`), 맨 아래 **꾹 눌러 송전**(`_shell/SendDock`).
기록실·서랍장은 더보기 시트(`_shell/MoreSheet`)에서 전체 화면(`_screens/*`)으로 열린다. `page.tsx` 는 상태·서버
왕복만 든다. 10-17 의 탭 넷은 손잡이가 많고 지시서를 끝내도 게이지가 차는 게 안 보여 하루 만에 접었다.

- **게이지 하나가 유일한 손잡이다.** 0 에서 탭=목표치, 켜져 있으면 탭=+15, 끌기=그 위치, 600ms 길게=0. 레버·±버튼은
  없다. 축하(불꽃·지도 번쩍·화음)는 **손으로 목표선을 넘길 때만** — 지시서 완료는 `setMin` 을 거치지 않고 부모의
  함수형 갱신(`applyPlanMinutes`)으로 들어가므로 축하하지 않는다.
- **지시서 완료는 전기가 게이지에 닿은 뒤 더한다**(`fx.bolt` → `onOrderApplied`). 서버 PUT 은 밀자마자(낙관적).
  `bolt` 는 `onfinish` 만 믿지 않는다 — 숨은 탭·절전에서 안 와서 값이 영영 안 들어갔다. 650ms 상한으로 한 번만 끝낸다.
- **작업 지시서(`PlanItem`) 완료는 `upsert_activity` 를 쓰지 않는다.** `plan_service._apply` 가 그날 행의
  한 칸만 더하고 뺀다(운동은 `workout_done` 도 켬, 프로젝트는 dict 를 새로 대입). 완료된 지시서의 날짜·회로·분량
  변경은 409. `tests/test_plan_items.py` 가 잠근다.
- **kWh·등급은 저장하지 않는다**(`_lib/power.ts`). 기록에서 매번 다시 센다. 머리의 송전 대기 = 폼이 저장된 그날
  기록보다 더 켜진 만큼.
- **날짜는 로컬 기준**(`_lib/activity.ts ymd`). 예전 `toISOString().slice(0,10)` 은 UTC 라 한국에서 아침 9시 전
  "오늘"이 어제가 되고 `addDays` 가 하루씩 어긋나 연속 기록이 틀렸다.
- 서랍장은 처음 열 때 마운트하고 떠나도 유지한다(목록 재요청 방지). 마지막 화면은 기억하지 않는다 — 날마다 여는 건 보드다.
- 불꽃(`.ab-spark`·`.ab-bolt`·`.sw-burst`)은 body 에 붙으므로 `--sw-*` 변수가 안 닿는다. 색은 값으로 적는다.
- 포인터 캡처는 try/catch — 합성 이벤트나 끝난 포인터에서 `setPointerCapture` 가 던지면 탭 자체가 죽는다.
- 설치형 앱: `admin/layout.tsx` 가 `/admin` 에서만 `public/admin.webmanifest` 를 건다(서비스 워커 없음, 오프라인 불가).
  루트 layout 에 걸면 손님에게도 설치 버튼이 뜨니 옮기지 말 것. 옛 `public/manifest.json` 은 CRA 흔적이라 아무도 안 쓴다.
- 확인은 `.claude/launch.json` 의 `backend-verify`(인증 끔 + 임시 SQLite)로 한다. 실 dev DB 를 건드리지 않는다.
  8000/3000 이 "사용 중"이면 지난번 `backend-dev.mjs` 감시 프로세스가 남은 것 — 그것부터 죽인다(uvicorn 만 죽이면 되살린다).

### Commission atelier (의뢰 공방) — the one public write path

A hidden underground workshop where visitors commission website work: an AI receptionist (도안) extracts
requirements and tells them an expected build time (weeks), visitors submit, and the admin reviews in an inbox —
which is the only place the server's **reference** estimate in KRW appears (visitors see no money since 2026-10-18).
Four teammate NPCs (기획/디자인/프론트/백엔드) staff the room. Two docs cover it:
**`docs/ATELIER_GUIDE.md`** (what works today, how to run a commission end to end) and
**`docs/COMMISSION_ATELIER.md`** (design decisions and, more importantly, the traps already hit —
read this before touching any of it).

Three things make this unlike every other district:

- It is the **only endpoint outsiders write to** (`POST /commission/consult`, `POST /commission`). Honeypot,
  a dedicated rate limit separate from the AI one, consent, and a Discord notification are all load-bearing.
- **Estimates are clamped, not trusted — and not shown to visitors.** `commission_service._clamp_estimate()`
  holds the model's number inside 0.6–1.8× of a rule-based baseline; the figure travels with the submission to
  the admin inbox and the Discord notice only. Since 2026-10-18 every visitor surface (choice tags, the running
  ticker, Q9, the summary card, 도안's free-text replies in both the model prompt and the rule fallback) shows
  **weeks only** — a recruiter reading an "AI quote desk" sees a side business, not engineering. The resume and
  README still cite the clamp as the "don't trust model output" example; that stays true server-side. Don't put
  `estimate_min/max` or `estimate_reason` back on screen.
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

- **2D 데스크와 추적 화면은 `/resume` 과 같은 흰 바탕·인디고다 (2026-11-14).** 기능과 문구는 그대로 두고 톤만
  바꿨다(본인이 시안 A·B 중 A 「지금 구조 그대로 흰 판」을 골랐다. 시안: https://claude.ai/artifact/AG53D9eyuRMy5RsJqJn7Xb).
  스타일은 `src/components/ui/commission/commissionDesk.css` 의 `.cd-*` 한 곳이고, 색 값은 `resumeV2.css` 토큰과 같다.
  데스크는 모달이라 `.rv2` 변수가 닿지 않아 값을 한 번 더 적었으니 인디고를 바꾸면 이 파일도 같이 바꾼다.
  `IntakeDialogue` 와 `DurationTicker` 는 톤이 둘이다. `layout="panel"`/`tone="light"` 는 흰 데스크, `layout="hud"` 는
  어두운 3D 방 위라 마을 HUD 의 어두운 판(아래 「마을 HUD 톤」)에 식구별 색을 쓴다. 흰 데스크에서는 식구 색을 쓰지 않고 인디고 한 색이다.
  예시 카드(`ChoicePreview`)는 손대지 않았다. 달라진 배치는 셋이다: 문항 수 옆 진행 막대, 휴대폰에서 예상 기간이
  대화 위 한 줄(`cd-strip`), 휴대폰에서 접수 칸이 열리기 전 아래 패널 높이 22vh 묶음(글자가 커져 선택지가 가려졌다).
  마을·공방 위에 뜬 흰 판 안에서는 금색 네온 링이 안 보여 OS 기본 커서로 돌린다(같은 css 끝, 특이도로 이긴다).
  접수 완료 화면과 심화 문답 화면은 같은 클래스를 쓰지만 실제 접수가 필요해 화면으로 확인하지 못했다.

- **1차 접수는 NPC 릴레이 설문이다 (2026-08-23).** 도안→체리→먹지→리코→도안이 10문항을 나눠 묻고, 선택지마다 예시
  카드와 기간 꼬리표("+1주")가 붙으며 누적 예상 기간이 실시간으로 굴러간다(`DurationTicker`. 금액 꼬리표·금액
  카운터는 2026-10-18 에 뺐다). 대본은 `src/data/atelierIntakeScript.ts` **한 곳**,
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

### 경력 안내 「쪽지」 — /resume 의 질의응답 (2026-11-14, 수치는 `docs/CAREER_QA_REPORT.md`)

`/resume` 과 `/resume/<id>` 오른쪽 아래의 캐릭터(시안 A·B·C 중 본인이 A 쪽지를 골랐다)에게 경력을 물으면
`POST /career/ask` 가 이력서·프로젝트 글에서 근거를 찾아 답한다. 견적 클램프와 같은 원칙이다. 모델 출력은 믿지 않고 규칙으로 거른다.

- **말뭉치는 화면이 읽는 데이터에서 만든다.** `npm run career:corpus` 가 `resume.ts`·`RICH_DATA`·`MU4_DATA`·`resumeV2Data` 를
  절 단위(700자 이하)로 잘라 `backend/app/data/career_corpus.json` 에 쓴다. 임베딩은 `career_embeddings.json`
  (text-embedding-3-small 256차원, 본문 해시로 캐시). **문구를 고치면 다시 돌려야 답의 근거가 따라온다.**
  면접 원고와 `BACKEND_EVIDENCE.md` 는 공개하지 않은 문장이라 넣지 않는다.
- **`resume.ts` 의 `evidence` 문자열은 증빙 파일 경로·자격번호다.** 처음 만든 말뭉치에 그대로 들어갔다. 지금은 문자열
  `evidence` 를 건너뛰고(객체 `evidence` 는 상세 페이지의 근거 상자라 글이다), 스크립트 끝의 `LEAK` 정규식이 경로·번호·전화번호
  모양을 찾으면 파일을 쓰지 않고 실패한다. 새 비공개 칸을 `resume.ts` 에 넣으면 이 둘을 같이 본다.
- **순서**: 검색(BM25 + 임베딩, 역순위 합) → 근거 약하면 모델을 부르지 않고 `none` → 모델이 JSON 으로 답(`answerable`·`answer`·`used`·`points`)
  → `career_guard.unsupported_numbers` 가 답의 숫자를 근거 조각·질문과 대조 → 없는 숫자가 있으면 답을 버리고 조각만(`snippets`).
  키가 없거나 호출이 실패해도 `snippets` 로 끝난다. 검색은 순수 파이썬이고 벡터 DB·numpy 는 없다(조각 500개 안팎).
- 한글은 형태소 분석기 없이 두 글자씩 겹쳐 자른다(`tokenize`). 프로젝트 이름·별칭(`ALIASES`, 스크립트 안)이 질문에 있으면 그
  프로젝트 조각을 앞세우고, 없으면 사람에 대한 질문으로 보고 이력서(`profile`) 조각을 앞세운다. 이력서 조각 둘은 항상 끼운다(`PROFILE_K`).
- **넓은 질문(「백엔드 경험 요약」)은 조각 검색만으로 안 된다.** 잘게 자른 조각은 넓은 질문과 닮지 않아 한 프로젝트 이야기만 나왔다.
  프로젝트 이름이 없는 질문은 프로젝트당 두 조각 상한(`PER_PROJECT_CAP`)을 두고, 프로젝트마다 하나씩 있는 「이력서 카드」 조각을
  10장까지 따로 넣는다(`CARDS`, 이력서 순서대로). 「요약·경험」 같은 낱말로 넓은 질문을 가리는 판은 버렸다. 그 낱말이 없는
  「혼자서 끝까지 만든 프로젝트는?」을 놓쳤다. 그래서 `mainProjects` 카드의 `role`·`highlights`·`metrics` 가 넓은 질문 답의 재료다.
  카드 수치가 낡으면 답도 낡는다. 마을 카드가 9월 값(65 · 258)으로 남아 쪽지가 「테스트 258건」이라 답한 적이 있고,
  2026-11-14 에 카드(`resume.ts`·`resumeV2Data.ts`)·`projects.ts`·이력서 원고를 상세와 같은 70 · 375 로 맞췄다.
- **넓은 질문은 모델이 문장을 쓰지 않는다 (같은 날 세 번째 작업).** `_context` 가 근거 문장마다 `(3.2)` 꼴 번호를 붙이고, 모델은
  `points` 에 번호만 적는다. `resolve_points` 가 그 번호를 기록의 문장으로 바꿔 `points_answer` 가 「프로젝트: 문장」으로 붙인다.
  상한은 부탁하지 않고 코드로 건다: 한 프로젝트 두 문장(`POINTS_PER_PROJECT`), 끝맺은 문장과 이력서 카드 줄만(`_pickable`),
  겹친 문장 한 번, 프로젝트를 지목한 질문은 쓴 답 우선(`allow_points`). 68개 답을 읽었더니 채점은 통과했는데 기록과 다른 답이
  3개였고(남은 3.1초를 「개선」으로, 취득일을 유효기간으로, 설문을 검증 방식으로), 전부 모델이 조각을 엮어 쓴 문장이었다.
- **모델에게 답을 검사시키는 단계는 만들었다가 걷어냈다.** 문장마다 근거가 뒷받침하는지 묻고 근거 구절을 인용하게 했는데,
  맞는 문장을 빼고 3.1초 문장은 통과시켰다(gpt-4.1 로 올려도 같았다). 다시 넣지 말 것. 틀릴 자리를 없애는 쪽이 먹혔다:
  좁은 질문은 한두 문장으로 묶고(프롬프트), 표처럼 생긴 조각은 칸 이름을 붙인다(`labeled()` in `build-career-corpus.mjs`,
  「취득일: …」「구분: …」「인원 구성: …」).
- **점수보다 답을 읽어라.** 문자열 채점은 정답 낱말만 있으면 통과라 위 3개를 못 잡았다. 고친 뒤 채점 점수는 넓은 질문에서
  오히려 내려갔다(드는 프로젝트 수가 줄어서). `python -m eval.dump_career_review <out.json>` 이 68문항의 답과 읽은 조각을 쓴다.
- 문턱 `COS_MIN=0.36` 은 평가 문항으로 맞춘 값인데, 임베딩 유사도만으로는 "쿠버네티스 경험" 같은 질문을 못 거른다
  (0.46~0.51 로 답할 수 있는 질문과 겹친다). 그 구간은 모델의 `answerable=false` 가 거른다.
- 숫자 검사는 10 이하 정수를 보지 않는다(모델이 항목을 세며 쓰는 숫자와 구분이 안 된다). 문장의 뜻이 근거와 맞는지도 못 본다.
  그래서 평가 세트(`backend/eval/career_questions.json`, 팀원이 한 일을 본인 일로 답하는지 보는 함정 포함)를
  `python -m eval.run_career_eval` 로 돌린다. 모델을 실제로 부르므로 pytest 에는 넣지 않았다.
- 화면: `CareerGuide`(버튼·SVG 만, `src/app/resume/layout.tsx` 에 마운트해 상세로 넘어가도 대화가 남는다) +
  `CareerGuidePanel`(처음 누를 때 `dynamic` 으로 받는다). 스타일은 `careerGuide.css` 의 `.cg-*` 이고 `.rv2` 밖이라 색 값을
  한 번 더 적었다. z-index 35(알약 내비 30 위, 프로젝트 판 가림막 40 아래). 질문은 저장하지 않는다.
- Next 16 은 같은 폴더에서 `next dev` 를 둘 띄우지 못한다. 다른 세션의 dev 서버가 3000 에 있으면 그 주소로 확인한다.

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

### First-visit shader precompile (2026-09-20)

첫 방문(셰이더 캐시 없음) 렉의 정체는 **MeshStandard 변종 19개 × 0.6초의 동기 링크 대기**였다 — GLB 가
도착해 처음 그려지는 프레임마다 하나씩 직렬로. `VillageScene.tsx` 의 `SceneWarmup` 이 순서를 바꾼다:
세 묶음(`GroupProbe` props/buildings/npcs)이 다 올 때까지 `frameloop="never"` → `gl.compileAsync` 한 번
(전 변종 병렬, 실측 0.7초) → 숨은 워밍업 4프레임 → `markVillageReady`. prod 실측 타이틀까지
**데스크톱 18~22초 → 6~7초, 모바일 뷰 12.5초 → 6초**, 최장 멈춤 5.5~6초 → 1.2~1.4초.

사전 컴파일은 **렌더 때와 변종 키가 한 글자라도 다르면 조용히 헛돈다**(에러 없이 두 벌을 컴파일). 이미 밟은 셋:

- **렌더 타깃**: three 는 타깃이 있으면 outputColorSpace=Linear·톤매핑 없음, 없으면 sRGB·ACES 변종을 만든다.
  데스크톱은 EffectComposer 버퍼에 그리므로 더미 `WebGLRenderTarget` 을 묶고 컴파일, 모바일은 묶지 않는다.
  같은 이유로 **모바일에선 큐브 패스를 돌리지 않는다**(한 번 쓰고 버릴 변종 19개, 6.6초) — `gl.initTexture` 로 대신한다.
  drei `<Preload all/>` 은 이 두 가지를 다 틀려서 뺐다.
- **그림자 종류**: `shadows={true}` 는 r3f 가 PCFSoft 로 옮기고, three r183 은 그걸 **첫 그림자 패스에서야** PCF 로
  바꾼다 → 그 전에 컴파일하면 `SHADOWMAP_TYPE_BASIC` 변종. 그래서 `shadows="percentage"` 로 못박았다.
- **실광원 개수**: 컴파일 뒤에 바뀌면 전부 무효. `ActiveRoute`(걷기 모드에서 언마운트)와 `LiveDecorations`
  (`villageState` 가 입장 뒤에 도착)의 조건부 `pointLight` 를 `PooledLight` 로 옮겼다. 새로 달지 말 것.

어긋났는지는 화면으로 못 본다. `%LOCALAPPDATA%\Temp\claude\village-first-load-measure.mjs`(GL 훅)로
"총 링크 수"와 "입장 뒤 링크 0"을 본다 — 데스크톱 47 · 모바일 36 이 기준이고, 늘었으면 어딘가 두 벌이다.
포인트 광원 수(현재 10)는 FPS 엔 공짜지만 **컴파일 시간엔 비례한다**(10→1 실험에서 변종당 600→200ms).

### Pointer picking, camera, and render budget (2026-08-22)

- **포인터 판정은 투명 히트박스만 한다.** NPC 캡슐(`NPC.tsx`)·건물 박스(`Building.tsx`)·바닥 클릭 원반(`GroundClickCatcher`).
  GLB 메시는 전부 `raycast = noop`(`NpcCharacter.tsx`, `Building.tsx GlbModel`). 보이지 않는 메시도 레이캐스트된다(three Raycaster는
  layers만 본다) — 그래서 되는 구조다. 새 상호작용 오브젝트를 달 때 GLB 자체에 핸들러를 붙이지 말 것.
- **`<AdaptiveEvents/>` 는 쓰지 않는다.** regress 중 포인터 이벤트를 통째로 꺼서 "입장 직후 클릭이 안 되는" 증상을 만들었다.
- NPC는 hover 0.45초면 대화가 열린다(연출 중 `hoverToTalk=false`). 바닥 클릭은 `CameraController.groundTarget`(현재 오프셋 유지).
  **자유비행(WASD·방향키·QE + 우클릭 마우스룩, Shift 가속)은 2026-09-20 부터 배포본에도 켜져 있다**(`FREE_FLY_ENABLED` 상수는 없앴다).
  켜짐은 부모가 `flyEnabled` 로 정한다 — 입장 전·환영 연출(`running`)·NPC 대화·정보 패널·엿듣기 중에는 끈다(방향키는 패널 스크롤에
  쓰여야 한다). 첫 키 입력은 `onFreeFlyStart` → 환영 카드 닫기·HUD 풀기·투어 끝내기(`handleFreeFlyStart`)이고, **`travelCam` 은 건드리지
  않는다** — 시네마틱 목적지가 바뀌면 키를 떼는 순간 카메라가 끌려간다. 같은 이유로 `CameraController` 의 목적지 effect 는 나는 중엔
  전환을 걸지 않고, `flyEnabled` 가 꺼지며 내려올 때 대신 건다. 창이 포커스를 잃으면 keyup 이 안 오므로 `blur` 에서 키를 비운다.
  걷기 모드에는 CameraController 가 없어 WASD 가 캐릭터 이동으로 간다. 조작 힌트(`ControlsHint`)에 데스크톱 폭에서만 한 칸 적었다.
- **N8AO의 `transparencyAware`는 반드시 false.** 래퍼가 prop으로 안 넘기므로 `VillageScene`이 ref로 직접 쓴다. 자동 감지가 켜지면
  매 프레임 씬을 두 번 더 렌더한다(CPU 20%).
- `VillageScene`의 정적 자식(지형·물·하늘·등불·프롭 인스턴싱)은 `memo`다 — `npcRuntimeStates`가 1~2초마다 바뀌어 부모가 재렌더된다.
- 렉 보고는 **prod 빌드로 재라**(`npm run build && npm run start -- -p 3100`, launch.json `prod`). dev는 StrictMode 이중 렌더로 롱태스크가 남는다.

### 마을 HUD 톤 — 어두운 판 + 인디고 (2026-11-14)

8월에 맞춘 「마을 간판 언어」(금테 액자, 목재 테두리, 고운바탕 제목, 랜턴 주황)를 걷고 `/resume` 과 같은 말투로
바꿨다. 흰 판이 아니라 어두운 판인 이유는 HUD 가 밤 마을 위에 작은 조각으로 흩어져 있어서다(본인이 시안 A 흰 판·
B 어두운 판 중 B 를 골랐고, 패널만이 아니라 HUD 전체를 같이 바꾸자고 했다. 시안 캔버스의 「마을 화면 전체 (B톤)」 쪽).
3D 장면, 건물에 박힌 간판 글씨, 프로젝트 전시실 안, 마을 안 이력서(`ResumeTerminal.css` 는 자기 토큰을 따로 든다)는
바꾸지 않았다.

- **한 곳에서 바뀐다.** `globals.css` 의 `--v-*` 토큰과 `.v-panel`·`.v-frame*`·`.v-serif`·`.v-panel-title`·`.v-rule`.
  변수 이름은 그대로고 뜻만 바뀌었다(lantern = 밝은 인디고 `#8b85f0`, gold = 옅은 인디고 `#c3c0f7`, wood = 선).
  채운 버튼은 `#4f46e5`(`/resume` 의 `--accent` 와 같은 값). `.v-frame` 은 두께 0 이라 안쪽 판만 남고,
  `VillageFrame` 의 귀퉁이 장식은 `SHOW_CORNERS=false` 로 껐다. 금테로 되돌리려면 이 둘을 같이 되돌린다.
- **옛 색을 새로 적지 말 것.** HUD 파일들의 `#e2c078`·`#ff9d38`·`#a9bdd6`·`#f3e6c8`·`#7a5a38` 는 일괄로
  옮겼다(`VillageHud`·`InfoPanel`·`DialogueBox`·`ConciergePanel`·`TourCard`·`ProjectCard`·`Header`·`IntakeDialogue` hud 등).
  관리자(`/admin`)와 `AtelierInterior`·`VillageScene` 의 같은 색은 3D 재질이거나 다음 단계라 그대로다.
- **패널 안 강조는 구역색이 아니라 인디고 한 색이다**(`InfoPanel` 의 `PANEL_ACCENT`). 구역색은 건물 띠의 작은 점과
  3D 쪽에만 남았다. 가장 중요한 버튼 하나씩만 인디고로 채운다(채용 담당자예요, 3D 전시실 들어가기, 다음 정류장, 보내기).
- **모션.** 판 안의 버튼·링크는 올리면 뜨고 누르면 눌렸다 튕긴다(`globals.css` 「HUD 의 손맛」, transform 만 쓴다).
  헤더 메뉴와 건물 띠 탭은 고른 칸 뒤의 알약이 미끄러진다(framer `layoutId` `nav-pill`·`strip-pill`). 정보 패널은
  오른쪽에서 스프링으로 들어오고, 구역이 바뀌면 `key` 로 머리글과 카드가 다시 한 장씩 올라온다. 환영 카드 타일과
  건물 띠 칩은 한 장씩 튀어 오른다(`.v-pop` + `--i`). 투어 카드는 정류장이 바뀌면 글이 옆으로 밀려 넘어간다.
  `prefers-reduced-motion` 이면 CSS 쪽 모션은 끈다.
- **로딩·입장 화면(`VillageLoadingVeil.tsx`)도 같은 톤이다.** 토큰을 안 쓰고 값을 상수(`C`)로 드는 파일이라 첫 교체에서
  빠졌고, 본인이 캡처로 짚어서 같은 날 바꿨다. 금테 액자와 꺾쇠, 나눔명조·Space Mono(따로 받던 글꼴 두 벌)를 빼고
  둥근 어두운 판에 본문 글꼴을 쓴다. 건물이 켜질 때 튕기고, 숫자 위에 진행 막대가 생겼고, 「눌러서 들어가기」는
  숨쉬는 인디고 알약이다. 두 겹 구조와 「두둥」 박자는 그대로다. 가라앉은 제목의 투명도는 0.2 에서 0.4 로 올렸다
  (흰 글씨는 0.2 면 꺼진 화면처럼 보인다).
- **훑어서 더 찾은 세 곳(같은 날)**: ① 정보 패널의 프로젝트 「자세히 보기」(`ui/ProjectDetail.tsx`)는 크림색 종이에
  초록 글씨였다. 목록 카드와 같은 어두운 카드로 맞췄다(`ProjectDetail.css` 의 `.op-detail` 은 다른 화면이고 원래
  토큰을 따라간다). ② 광장의 「의뢰 공방 지하 ↓」 간판(`AtelierHatch.tsx`)은 건물 간판과 같은 어두운 판으로.
  ③ 마을 안 이력서(`ResumeMode`)는 `ResumeTerminal.css` 가 `.resume-terminal` 안에서 `--v-*` 를 따로 들고 있어
  그 여섯 값과 `--serif`(이제 고딕), 이름 글꼴을 바꿨다. 반딧불·등불(`ForestWorld`)과 기술 별자리
  (`TechConstellation` 의 `COLOR_*`)도 주황에서 인디고로 옮겼다. 이 화면의 각진 테두리와 모노 글꼴 배치는
  그대로다(색과 제목 서체만 맞췄다).
- **아직 안 열어 본 곳**: 일반 건물 안 화면, 관계도, 엿듣기 패널, NPC 독 펼침. `/admin` 은 손대지 않았다.
- **같이 고친 버그**: 휴대폰에서 `ControlsHint` 가 한 글자씩 세로로 꺾였다. `left-1/2` 때문에 쓸 수 있는 폭이
  화면 절반으로 잡힌 것이라 `w-max max-w-[92vw]` 와 줄바꿈으로 고쳤다.
- **확인하는 법**: 이 폴더에 다른 세션의 dev 서버가 떠 있으면 `globals.css` 변경을 다시 읽지 않는 일이 있었다
  (TSX 는 반영되는데 전역 CSS 만 옛것). 그럴 땐 `npm run build` 후 launch.json 의 `prod`(3100)로 본다.
- 이동 독을 펼친 모습, 관계도, 엿듣기 패널, 걷기 모드 표시는 같은 클래스를 쓰지만 화면으로 따로 확인하지 않았다.

### First-visit wayfinding (2026-09-03)

- **루미 카드의 선택은 도착 + 목록이다.** `arriveAndOpen(sectionId)` = `travelTo` 로 섬 위로 → 1.1초 뒤
  오른쪽 액자에 그 구역 목록. **`openSection` 을 여기 쓰면 안 된다** — 그 함수는 `setTravelCam(null)` 을
  해서 카메라가 섹션 기본 시점으로 되돌아간다. 예전 `focusDistrict` 는 activeSection 만 바꿔 "프로젝트
  보러"를 눌러도 광장 분수만 보였다.
- **하단 `DistrictStrip`(VillageHud)은 두 단 건물 바로가기다(2026-09-15)** — 윗줄 구역 탭(목록만 바꿈,
  카메라는 이동 독·지도 몫), 아랫줄 그 구역 건물 칩. **광장에서도 뜬다**(첫 화면이 광장이라 숨기면 아무도
  못 본다, 광장이면 프로젝트 탭). 칩 첫 클릭 = `pickBuilding` → `buildingShot` 카메라로 그 건물 앞 이동 +
  `pickedBuildingId` 강조, 같은 칩 재클릭 = `handleRequestEnter`. 호버(`focusBuildingId`)가 선택보다 우선
  (그 한 채만 강조 — 구역 전체가 이미 켜져 있어 더 켜는 건 안 보인다). 선택은 `travelTo`·바닥 클릭·
  `openSection`·입장·NPC 대화에서 풀린다. 걷기 모드엔 CameraController 가 없어 travelCam 이 안 먹으므로
  pick 이 클릭 모드로 돌린다. `buildingShot` 은 **섬 hub 쪽에서, 수평으로 hub 를 넘지 않고** 모자란 거리는
  높이로 번다 — 넘으면 섬 반대편 건물 사이에 선다(경험 구역은 건물 안). 이 함수가 `AIPortfolioVillage` 에
  있는 건 constants → villageTerrain → villageRelief → constants 순환 때문이다.
  3D 간판(`v-sign`)은 구역 카메라 거리에서 2~3px 라 읽히지 않아 2D 로 한 번 더 적는 것. 프로젝트 카드의
  "3D 전시실 들어가기"는 `enterProjectRoom` → `handleRequestEnter`(contentId ↔ project.id).
- **HUD 는 두 단계다.** `hudUnlocked=false` 로 시작해 첫 화면엔 헤더·환영 카드·이동·지도·제작 의뢰만
  두고, 첫 행동(건물 입장·NPC 대화·독/지도 이동·바닥 클릭·안내인 선택·투어 종료)에서 `unlockHud()` 가
  마을 소식·지휘·NPC 독·엿듣기·걷기 모드를 꺼낸다. 조작 힌트(`ControlsHint active`)는 환영 카드가
  **닫힌 뒤** 7초 — 마운트 기준이면 카드가 덮고 있는 동안 지나가 아무도 못 본다. 할 수 있는 것 세 가지
  (건물=내용·사람=대화·바닥=이동)는 환영 카드 바닥 한 줄에 고정.
- **"채용 담당자예요"는 마을 안 4정류장 투어다**(`TOUR_STOPS` 프로젝트→기술→경험→연락, 8초 자동 진행,
  마지막은 자동으로 안 넘김, `TourCard`). 이력서 화면으로 곧장 보내던 예전 동작은 카드의 "이력서로
  바로 가기" 링크로 남겼다. 투어는 다른 행동이 시작되면 `endTour()` 로 끝난다 — 카메라를 두 주인이
  끌면 화면이 튄다. 독·지도·모바일 메뉴의 이동은 `userTravel`(endTour+unlock+travelTo)이고 투어 자체는
  `travelTo` 를 직접 쓴다 — travelTo 안에서 투어를 끝내면 투어가 스스로를 죽인다.

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
