# 3D 에셋 매니페스트

이 폴더의 모든 GLB 모델 정리. 새 에셋 추가/교체 시 이 표를 함께 업데이트할 것.

## 폴더 구조

```
public/models/
├── characters/     # 캐릭터 (플레이어·NPC)
├── environment/    # 환경 (바닥·석상 등)
├── buildings/      # 건물 (구역별 건물 모델)
└── dev/            # 개발/테스트 전용 (배포 무관)
```

## 에셋 목록

| 파일 | 분류 | 용량 | 출처 | 사용처 (코드) | 적용 설정 |
|---|---|---|---|---|---|
| `characters/lumi.glb` | 캐릭터 | 480K | Meshy AI (Greenleaf Scout biped) — 5개 파일 병합 | `npcRoster.ts` `guide-npc` → `NpcCharacter.tsx` | 클립 `idle_14`/`idle_15`/`walking`/`running`/`right_uppercut_from_guard` (어퍼컷은 미사용, 등록만) |
| `characters/warrior-walk.glb` | 캐릭터 | 282K | Meshy AI (Redshield Warrior biped, Walking) | `WarriorCharacter.tsx`, `NpcWarrior.tsx` | 플레이어 scale 1.1 / NPC scale 0.73, facing `Math.PI` |
| `characters/warrior-run.glb` | 캐릭터 | 277K | Meshy AI (Redshield Warrior biped, Running) | `WarriorCharacter.tsx` | 플레이어 달리기 (Shift+W) |
| `environment/ground.glb` | 환경 | 1.2M | Meshy AI | `VillageScene.tsx` (`Ground`) | position `[0,-0.6,2]`, scale 12, rot `[-π/2,0,0]` |
| `environment/statue.glb` | 환경 | 2.9M | Meshy AI (Redshield Warrior) | `VillageScene.tsx` (`Statue`) | position `[0,2.5,2]`, scale 3.5 |
| `buildings/frontend.glb` | 건물 | 1.9M | (출처 기록 필요) | `constants.ts` skill-frontend `glbPath` | `Building.tsx` GlbModel이 size에 맞춰 렌더 |
| `buildings/backend.glb` | 건물 | 1.6M | (출처 기록 필요) | `constants.ts` skill-backend `glbPath` | 〃 |
| `dev/test-model.glb` | 개발 | 1.6M | (테스트용) | `ModelTest.tsx` → `/test-model` 라우트 | 배포 화면과 무관한 점검용 |

## 압축 파이프라인

원본을 `<그룹>/raw/` 에 넣고 한 줄이면 끝납니다.

```bash
npm run optimize                # 전체
npm run optimize -- buildings   # 그룹만 (buildings/props/characters/environment)
npm run optimize -- --force     # 이미 최신인 것도 다시 굽기
```

`scripts/optimize-glb.mjs` → `scripts/optimize_textures.py` 가 하는 일:

1. **아무 일도 안 하는 맵 삭제** — Meshy는 발광 부위가 없어도 emissive를 붙여 내보냅니다.
   "보이는 밝기(24) 이상인 픽셀 비율"로 판정해 노이즈면 지우고 factor로 대체합니다.
   (실측: aclub −85MB VRAM. 창문이 실제로 빛나는 frontend는 유지됨)
2. **그룹별 예산 해상도로 축소** — 예산은 `optimize_textures.py`의 `BUDGETS`
3. **Draco 압축.** 단 `characters`는 `--simplify false --join false --flatten false`로 돈다.
   스킨드 메시는 이 패스들이 뼈 가중치와 노드 계층을 깨뜨린다.

> 이 환경의 sharp/libvips가 깨져 있어(`colourspace: parameter space not set`)
> gltf-transform의 텍스처 단계를 못 쓴다. 그래서 텍스처만 Pillow로 뺐다.

### 캐릭터 애니메이션 합치기

Meshy는 애니메이션 하나당 GLB 하나를 주는데, 파일마다 메시·텍스처가 통째로 중복된다.
5개를 그냥 다 로드하면 같은 텍스처가 VRAM에 5벌 올라간다.

```bash
node scripts/merge-character.mjs "<Meshy 폴더>" <이름>
npm run optimize -- characters
```

첫 파일을 본체로 삼고 나머지에서 클립만 뽑아 붙인다. 뼈는 인덱스가 아니라 **이름**으로 연결하므로
파일 순서가 달라도 안전하다. 클립 이름은 파일명의 `_Animation_` ~ `_withSkin` 사이에서 딴다.

## 메모

- `frontend.glb` / `backend.glb` 는 출처 미기록 — 알게 되면 위 표 채우기.
  raw/ 에 있는 건 Meshy 원본이 아니라 **기존 압축본을 소스로 재활용한 것**이라,
  진짜 원본을 찾으면 교체 후 `--force` 재실행하는 게 좋다.
- **Meshy 캐릭터는 전부 높이 1.7 유닛으로 나온다** (three.js 실측: 로봇·전사·루미 모두 정확히 1.7000, minY 0).
  그래서 크기 보정이 따로 필요 없다. `NpcCharacter`가 bbox를 재서 `NPC_HEIGHT`로 정규화하므로
  다른 출처의 모델을 꽂아도 알아서 맞는다.
  > `gltf-transform inspect`가 보여주는 bbox(0.017)는 믿으면 안 된다. 스킨드 메시는
  > 노드 변환이 아니라 **뼈**가 최종 크기를 정하는데 inspect는 그걸 반영하지 않는다.

## NPC별 모델 지정

`npcRoster.ts`의 NPC에 `model: "<id>"`를 주면 그 캐릭터로 렌더된다. 생략하면 `robot`.

| 파일 | 역할 |
|---|---|
| `types/portfolio.ts` `CharacterModelId` | 모델 id 유니온 — 여기에 추가해야 컴파일이 통과 |
| `data/characterModels.ts` | 경로·높이·클립 오버라이드 |
| `components/village/NpcCharacter.tsx` | 렌더 + 상태 머신 (idle/walk/run) |

클립 이름은 자동 분류된다 (`idle` → `run` → `walk` 순 부분일치). Meshy 내보내기마다 이름이
`walk` / `walking` / `Armature|walking_man|baselayer` 처럼 제각각이라 그렇다. 분류가 틀리면
`clipOverrides`로 잡아준다. 분류 안 된 클립(어퍼컷 등)은 등록만 되고 상태 머신이 안 건드린다.

idle 클립이 2개 이상이면 9초 간격(±40%)으로 번갈아 재생한다 — 서 있을 때 살아있어 보인다.
