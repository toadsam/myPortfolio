# NPC 사회 — 관계·기억·사건 시스템 (2026-08-22)

마을 NPC 들이 **서로 관계를 쌓고, 기억하고, 싸우고 화해하는** 시스템의 설명서.
같은 날 함께 바뀐 조작(hover 대화·바닥 클릭 이동)과 성능(포인터·AO) 항목도 끝에 적어 둔다.

## 0. 한 줄 요약

> **결과는 규칙이 정하고, AI 는 연기만 한다.**

예전엔 두 NPC 가 마주치면 LLM 에게 "대사를 쓰고, 둘 사이가 얼마나 바뀌었는지도 네가 정해라"고
시켰다. 모델은 소설가라 거의 언제나 훈훈하게 끝냈고, 친밀도는 올라가기만 해서 전원 절친으로
수렴했다. 싸움에 이유도 없었다. 이제 순서를 뒤집었다.

```
마주침(프런트: 1.7유닛 안)
  → relationship_rules.decide_outcome   ← 기분 궁합 + 오늘 활동 + 확률 사건  (순수 함수)
  → npc_brain_service.generate_npc_encounter   ← "이런 일이 있었다"를 받아 대사 4줄만 씀 (실패하면 폴백 대사)
  → relationship_service.apply_outcome  ← ±5 클램프, 마일스톤
  → memory_service.remember ×2 + gossip ← 각자의 기억, 50% 확률로 제3자 얘기 전파
  → VillageEvent                        ← 눈에 띄는 것만 "마을 소식"으로
```

## 1. 관계는 NPC **개인** 단위다

`NpcRelationship.npc_a / npc_b` 에 실제 `npc_id`(정렬) 가 들어간다. 그 전엔 대표 종류
(`relations.canon` — guide/project/developer…) 쌍이라 프로젝트 안내원 9명이 테오와 관계 한 줄을
공유했고, 같은 종류끼리는 관계가 없었다.

- 종류 쌍은 이제 **초기 씨앗**(`relationship_service.SEED_AFFINITY`)과 **기본 톤**
  (`relations._RELATIONS`)에만 쓴다. `npc-project-festflow ↔ developer-npc` 는 종류 쌍
  (developer, project) 의 씨앗 −3 을 물려받되 자기만의 행을 가진다.
- 같은 종류 다른 NPC(FestFlow 안내원 ↔ ACLUB 안내원)도 관계가 생긴다 — "같은 구역 동료" 톤.
- 자기 자신과의 관계만 없다(`/npc/encounter` 는 400).
- 옛 종류-키 행은 서버 시작 시 `purge_legacy_kind_rows` 가 지운다.
- **하루 감쇠**: 마지막 갱신 뒤 지난 날수만큼 친밀도가 0 쪽으로 1/일 돌아간다(`_apply_decay`).
  안 만나면 서서히 "그냥 아는 사이"로.
- vibe 라벨(앙숙/서먹/그냥 아는/친한/꽤 가까운/절친)은 **항상 친밀도 문턱에서** 나온다. 예전엔 LLM 문구를
  그대로 써서 수치와 라벨이 따로 놀았다.

## 2. 규칙 엔진 — `backend/app/services/relationship_rules.py`

순수 함수(`decide_outcome`). Session 도 모델 호출도 없다(`gate.py` 와 같은 결) → 단위 테스트로 잠근다.

| 재료 | 예 | delta |
|---|---|---|
| 기분 궁합 | busy+busy "둘 다 정신없어서 말이 날카로웠다" | −2 |
| | worried+calm "걱정을 털어놓고 위로받았다" | +2 |
| | excited+excited / proud+proud / curious+curious | +2 |
| | excited+sleepy, busy+sleepy, busy+worried … | −1 |
| 공통 화제(오늘 활동 × 직군) | 커밋 ≥5 → project↔developer "오늘 커밋 N개 얘기로 신났다" | +2 |
| | 공부 ≥90분 → coding↔cs | +2 |
| | 운동 완료 → guide/life 포함 쌍, 메모 있음 → archivist 포함 쌍 | +1 |
| 확률 사건(12%) | 간식 뺏어먹음 −3, 약속 깜빡 −2, 농담 과함 −2, 말 끊음 −2 | |
| | 작은 선물 +3, 일 도와줌 +3, 옛 얘기로 울컥 +2, 고민 들어줌 +2 | |

- **수렴 방지**: 친밀도 ≥16 이면 음수 사건 가중 2배(친할수록 투닥), ≤−8 이면 양수 사건 2배(화해 기회).
- 합계는 ±5 로 자른다. `reason` 은 일어난 조각을 " · "로 잇는다(없으면 "별일 없이 안부만 주고받았다").
- **기분도 규칙이 정한다**: delta ≤ −2 → 둘 다 `worried`(사건이면 한쪽 `busy`), ≥ +3 → `excited`/`proud`.
  모델이 state_changes 를 보내도 무시한다 — 싸운 직후 모델이 "excited" 를 보낸 적이 있다.
- 이름이 필요한 사건 문장은 `memory_service.display_name` 으로 채운다("루미가 픽셀의 말을 끝까지 안 듣고 끊었다").

AI 가 꺼져 있으면 `_fallback_encounter` 가 `outcome.kind`(bond/clash/incident/neutral) 별 대사 풀에서
4줄을 뽑는다. 관계는 똑같이 움직인다.

## 3. 기억 — `backend/app/services/memory_service.py`, 테이블 `npc_memory`

NPC 당 30개. `kind` 는 encounter / incident / gossip / visitor.

- 마주침마다 양쪽에 `"{상대} 만남 — {reason}"` (about=상대).
- **뒷담화** `gossip(teller, listener)`: 50% 확률로 teller 의 최근 encounter/incident 기억 중 listener 가
  아닌 제3자 얘기 하나를 listener 에게 `"루미에게 들음: …"` 으로 심는다. listener 본인 얘기는 옮기지 않는다.
- 방문자 대화: `/npc/chat` 뒤 `"방문자가 '{메시지 40자}' 하고 물어봤다"`.
- 프롬프트: `memory_lines_for_prompt` → `build_context` 의 "내 최근 기억" 섹션 + (상대가 있으면) "X 에 대해 내가
  아는 것". 시스템 프롬프트에 "기억은 제공된 것만" 한 줄.

## 4. 보이는 결과

- **마을 소식**(`VillageEvent`, `GET /npc/news`): |delta| ≥ 2, 사건, 마일스톤만. HUD 의 "마을 소식" 패널
  상단 "NPC 들 사이에서" 5줄 + 상대 시각. 60초 갱신. `created_at` 은 UTC 'Z' 로 내보낸다(안 그러면 KST 에서 "9시간 전").
- **관계도**(`RelationshipViewer`): 관계에 등장하는 NPC 중 |친밀도| 합 상위 10명을 이름으로 고리에, 분신은 가운데.
- **디렉터**(`AIPortfolioVillage` `directorTick`): 전원이 캐스트. 친밀도 ≥16 인 친구가 있으면 찾아가고,
  ≤−8 인 상대가 있으면 반은 화해하러 가고 반은 **반대 방향 6유닛으로 피한다**.
- 앙숙 쌍(≤−8)은 마주침 쿨다운 2배.
- 마일스톤 배너(절친/앙숙/화해/틀어짐)는 그대로.

## 4-b. 3단계 (같은 날) — 성격·전파·개입·역사

| # | 무엇 | 어디 |
|---|---|---|
| 직군별 사건 | `Incident(delta, template, actors)` — 행위자의 `canon` 종류가 `actors`에 들어야 후보. 테오는 "기술 설명이 장황"/"버그를 잡아 줌", 체리는 "범위를 또 늘림", 하루는 "운동 같이"/"간식 몰래". 공통(선물·고민·약속·농담)은 `actors=None`. `Outcome.actor_id`로 누가 저질렀는지 남긴다. 템플릿은 `{a:가}` `{b:를}` 꼴로 받침 맞는 조사(`josa`, `Name.__format__`). | `relationship_rules.py` |
| 뒷담화 → 친밀도 | `NpcMemory.delta`(기존 DB는 `_ensure_npc_memory_columns`). `gossip`이 옮긴 기억의 부호대로 **듣는 이 ↔ 제3자** ±1(`apply_outcome(source="gossip")`), 🗣️ 소식. 같은 얘기는 한 번만 옮긴다. 실측: 픽셀이 루미에게 테오 얘기 → 루미↔테오 1 → −2, "사이가 틀어졌어요". | `memory_service.gossip`, `main.py /npc/encounter` |
| 방문자 개입 | `relay_service.detect_relay`: 메시지에 **다른 NPC 이름 + 감정어**(미안/고마/칭찬… vs 싫/욕/실망…) → 말 건 NPC ↔ 언급된 NPC ±2, 기억 `relay`, 💌 소식, 응답 `ChatMessageOut.relay` → 대화창에 "💌 픽셀에게 전해졌어요 (+2)" 칩. 이름만("픽셀 잘 지내?")이나 감정이 섞이면 무시. LLM 추가 호출 없음. | `relay_service.py`, `DialogueBox.tsx` |
| 관계 연표 | `RelationshipMilestone`(영구). `NpcRelationshipRow.fights/reconciliations/milestones` → 관계도 행에 "싸움 1 · 화해 2". | `relationship_service.milestone_counts` |
| 소식에 모델 한 줄 | `used_ai`면 `"{reason} — {model memory}"`. | `main.py` |
| 친할수록 천천히 식음 | `_decay_period_days`: \|aff\| ≥ 30 → 3일에 1, ≥ 16 → 2일에 1. | `relationship_service` |
| 노드 클릭 → 기억 | `GET /npc/memory/{id}`(visitor 제외 8개) → 관계도에서 노드 클릭 시 `NpcMemoryList`. | `VillageHud.tsx` |

`relations.canon`에 `life` 종류가 생겼다(라이프 구역 NPC). 기존 `developer`/`project` 판정은 그대로.

## 4-c. 4단계 (2026-08-23) — 빚 갚기 · 체감 · 깊이

3단계 뒤 추천 목록 16개를 전부 처리했다. "VillageScene 정적 자식 memo"는 확인해 보니 **이미 돼 있었다**(`VillageScene.tsx` 끝의 22개 `memo`).

| 무엇 | 어디 |
|---|---|
| relay 부정문 오탐 — 감정어 뒤 8자/앞 3자에 부정어(않/아니/없/하진/안 …)면 그 감정어 무효. "픽셀이 싫다고 하진 않았어" → None | `relay_service._negated` |
| 라우트 스모크 — TestClient + 인메모리 DB(`StaticPool`, 다른 스레드에서도 같은 DB). 마주침·relay·뉴스·기억 4개 | `tests/test_npc_routes.py`, `conftest.py` |
| 백엔드 자동 재시작 — `--reload` 대신 스크립트가 `fs.watch` 로 `.py` 감시 → `taskkill /T /F` → 재스폰. CTRL_C 가 없어 Windows "일괄 작업을 끝내시겠습니까" 에 안 걸린다 | `scripts/backend-dev.mjs` |
| 소식 정리 — 500개 넘으면 오래된 것부터. 마일스톤·기억은 안 건드림 | `relationship_service.prune_events` |
| 디렉터 캐스트 — 라이프 NPC(`npc-life-*`)는 `autonomousNpcs` 자동 포함. **공방 NPC(`atelier-*`)는 마을에 없다** — 공방 방 안에 마주침을 붙이기 전까지 그 사건 템플릿은 잠자는 상태 | (코드 변경 없음) |
| 마주침 연출 — 대화 재생이 끝난 뒤 💢/💕(마일스톤이면 💞🤝💔) 이모트 1.4초. 싸우면(delta ≤ −2 또는 틀어짐/앙숙) 둘이 반대 방향 5유닛 걸어가고(`npcSocialTargets`), 가까워지면 1초 더 마주 본다. 분신은 순찰 경로가 있어 상대만 걷는다 | `AIPortfolioVillage.stageEncounterAftermath` |
| 대화에 관계 온도 — `relationship_lines_for` 가 "내 인간관계: 픽셀: 서먹한 사이(−12) · 최근: …" 를 프롬프트에 넣고 system prompt 가 온도에 맞춰 말하라고 한다. 실측(루미↔픽셀 −6): "조심스러워요", "서먹한 편" 이 묻어남 | `relationship_service`, `chat_service` |
| 소식 즉시 반영 — `NpcEncounterOut.news` / `RelayOut.news` 를 프런트가 `pushNews` 로 피드 맨 앞에(60초 폴링은 보정용) | `main.py`, `AIPortfolioVillage.pushNews` |
| 관계 연표 — `NpcRelationshipRow.timeline`(최근 6개) → 노드 클릭 시 "테오 8/22 🤝 화해 → 루미 8/23 💢 틀어짐" | `VillageHud.NpcTimeline` |
| 방문자 개인화 — `localStorage["wow-visitor"]` 무작위 uuid 를 `ChatMessageIn.visitor_id` 로. visitor 기억의 `about_npc_id="visitor:<id>"` → `visitor_history` 가 "[이 방문자] 나와는 3번째 대화, 지난번엔 …" 를 프롬프트에. 개인정보 없음, `public_recent` 는 visitor 를 이미 거른다 | `liveApi.visitorId`, `memory_service.visitor_history` |
| 씨앗 소식 — 관계 0행·소식 0개인 빈 DB 에만 `SEED_AFFINITY` 쌍(\|값\| ≥ 4)을 관계로 만들고 톤에 맞는 소식 1줄씩(1~5시간 전) | `relationship_service.seed_village_if_empty` (startup) |
| 하루 요약 📰 — `GET /npc/news` 첫 호출이 어제 소식으로 한 줄(가장 크게 움직인 쌍 + 사건 1 + 큰 사건 수) 을 만든다. 키 있으면 모델이 60자로 다듬고 실패하면 템플릿. 하루 1회. HUD 맨 위 고정 | `daily_digest_service` |
| 편 들기 — `side_bias`: A 의 절친 C(≥16)가 B 와 앙금(≤−8)이면 −1 "(C 편을 들어서)", C 가 B 와도 절친이면 +1. 공통 친구는 양쪽에서 보여 ±1 캡. `decide_outcome(affinities=…)` | `relationship_rules.side_bias` |
| NPC 의 부탁 — `NpcFavor`(NPC 당 미완료 1). 서먹한 상대가 있을 때 대화 중 20% 로 "픽셀한테 내가 미안해한다고 전해 줄래?"(앙숙이면 간접). 방문자가 *그 상대* 에게 *부탁한 NPC* 얘기를 긍정으로 전하면 이행 → +4, 🎁 소식, 칩 "🎁 부탁 완료". `GET /npc/favors` 로 HUD 줄(누르면 그 NPC 에게 감) | `favor_service`, `relay_service.apply_relay`, `DialogueBox`, `VillageHud` |
| 건물 불빛 ↔ 관계 — 오늘 마일스톤: 싸움이면 두 NPC 집 한 칸 어둡게, 화해면 한 칸 밝게. 관리자 override **뒤**에 적용. reason 에 "오늘 픽셀이 루미와 싸워서 조금 어둡다". NPC→집은 `NPC_HOME_BUILDING`(핵심) + `npc-<building>` | `relationship_service.todays_light_shift`, `village_service.apply_light_shift` |

## 4-d. 5단계 (2026-08-24) — 결함 수정 · 공방 사건 · 방문자 단골 · 운영 도구

| 무엇 | 어디 |
|---|---|
| 방문자 기억 별도 캡 — visitor 기억은 12개짜리 자기 통(사회 기억 30개와 분리). 마주침이 1~2분마다 기억을 만들어 "다시 온 손님"이 하루도 못 버티던 결함 수정 | `memory_service._trim`, `MAX_VISITOR_PER_NPC` |
| 부탁이 대사에 섞임 — `maybe_issue` 를 답변 생성 **전**에 판정해 프롬프트에 넣고, 모델이 안 녹였으면(상대 이름이 답변에 없음) 서버가 "아, 그리고… {부탁}" 을 붙인다 | `main.py /npc/chat` |
| relay 감지 2겹 — 모델 응답이 JSON(`{reply, mention}`) 이 되어 같은 호출에서 언급을 감지("픽셀 좀 별로던데" 실측 −2). 사전 규칙(detect_relay)이 우선, 모델 mention 은 `resolve_mention` 으로 규칙 검증. 파싱 실패 시 원문=답변(예전 동작) | `chat_service._parse_chat_json`, `relay_service.resolve_mention` |
| 폴백 대사 kind 당 5세트 | `npc_brain_service._FALLBACK_LINES` |
| **공방 사건 가동** — `/atelier` 방이 90초 후부터 ~2분마다 팀원 둘을 `/npc/encounter` 로 마주치게 하고 말풍선·💢/💕 로 재생. 잠자던 atelier 사건 템플릿이 처음으로 발화(실측: 굴뚝↔체리 +3, 마을 소식 기록) | `AtelierInterior.useAtelierSocialLoop` |
| 마일스톤 정점 연출 — 절친: 3초 마주 봄 + 근처 NPC 둘 🎉 구경, 앙숙: 8유닛 등 돌림 + worried, 화해: 🤝 | `AIPortfolioVillage.stageEncounterAftermath` |
| 활동 한쪽 보정 — 공통 화제가 없어도 커밋 많은 날 developer/project +1, 운동 빼먹은 날 life −1, 공부 90분+ coding/cs +1 | `relationship_rules._shared_topic` |
| 방문자 단골 — `VisitorBond`(visitor_id×npc, 하루 +2 상한, 부탁 이행 +4). ≥8 "아는 손님", ≥20 "단골 손님" — 프롬프트 한 줄 + 대화창 이름 옆 뱃지(`ChatMessageOut.bond`) | `visitor_service`, `DialogueBox` |
| 관계도 간선 뱃지 — 사연 있는 쌍(싸움+화해>0)의 간선 중점에 💥/🤝+횟수 | `VillageHud.RelationshipViewer` |
| 관리자 도구 — `POST /admin/npc/society/reset`(사회만 백지 + 씨앗 재파종, 활동·의뢰는 보존), `PUT /admin/npc/relationships`(친밀도 직접 설정). admin 페이지 서랍 "NPC 사회"(±10 조정, 리셋 confirm) | `relationship_service.reset_society/admin_set_affinity`, `admin/page.tsx NpcSocietyAdmin` |

dev DB 는 2026-08-24 에 백업(`portfolio_village.backup-20260824.db`, 루트와 backend/ 두 개)으로 밀고 새로 시작 —
startup 씨앗이 소식 5개·관계 5행을 심는 걸 실측했다. `database_url` 이 상대경로라 **실 DB 는 리포 루트**에 생긴다(backend/ 것은 옛 수동 실행 흔적).

## 5. 테스트

`backend/tests/test_relationship_rules.py`(규칙 결정성·가중·클램프·직군 제약·조사), `test_memory_service.py`(캡·about·뒷담화·delta·중복 방지·공개 필터),
`test_relationship_service.py`(id 키·감쇠 주기·purge·영구 연표·정리·씨앗·관계 줄), `test_relay_service.py`(방문자 개입 감지·부정문·적용),
`test_npc_routes.py`(라우트 스모크 + 관리자 리셋/조정 + 폴백 부탁), `test_favor_and_digest.py`(부탁 발급·이행, 불빛 보정, 하루 요약),
`test_chat_parse.py`(모델 JSON 파싱·폴백 풀), `test_visitor_service.py`(단골 상한·등급). 333개 전부 통과.

**E2E 스모크**: dev(3000)+백엔드(8000) 띄운 뒤 `node scripts/e2e/society.mjs` — 마을 열기(건너뛰기·PERF 닫기·HUD 펼치기 순서가
`scripts/e2e/lib.mjs` 에 있다), 소식 피드·relay 칩·관계도 노드 클릭을 한 바퀴 돈다. `playwright-core` 필요(로컬 검증 전용이라
devDependency 아님). 루미는 대화창이 아니라 안내 패널을 여니 하네스에 넣지 말 것.

## 6. 같은 날 바뀐 조작·성능 (요약 — 자세한 근거는 메모리 `village-pointer-and-ao`)

- **NPC hover 0.45초 → 대화 자동 열기**, hover 중 NPC 정지, 닫은 뒤엔 벗어났다 다시 올려야 열림.
  연출(인트로·엿듣기) 중엔 꺼짐. 루미는 설계상 컨시어지 패널을 연다.
- **바닥 클릭 이동**: 섬(반지름 41) 투명 원반 한 장. 현재 시점 각도·거리 유지(6~24 클램프). 드래그 끝 클릭(>5px)은 무시.
- 자유비행 WASD/우클릭 마우스룩은 dev 전용(`FREE_FLY_ENABLED`).
- 사운드 기본 무음.
- **포인터 판정은 투명 히트박스만**: NPC 캡슐(r 0.8)·건물 박스. GLB 메시는 `raycast = noop`.
  `AdaptiveEvents` 제거(전환 중 클릭이 죽던 원인).
- **N8AO 투명 패스 끔**(`configuration.transparencyAware = false`, ref 로 직접) — CPU 20%.
- 정적 자식 컴포넌트 memo(VillageScene 20여 개, InstancedProps 체인, NpcCharacter).
- 석호 너울 골 1/5 압축 — 수면이 하상 밑으로 들어가 생기던 "물 위 검은 다각형".
- 실측: prod 빌드 정상 상태 롱태스크 0, 40~43 FPS. dev 는 StrictMode 이중 렌더로 더 무겁다 — 렉은 prod 로 재라.
