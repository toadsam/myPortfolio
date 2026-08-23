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

## 5. 테스트

`backend/tests/test_relationship_rules.py`(규칙 결정성·가중·클램프·직군 제약·조사), `test_memory_service.py`(캡·about·뒷담화·delta·중복 방지·공개 필터),
`test_relationship_service.py`(id 키·감쇠 주기·purge·영구 연표), `test_relay_service.py`(방문자 개입 감지·적용). 281개 전부 통과.

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
