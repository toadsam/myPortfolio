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
| `characters/warrior-walk.glb` | 캐릭터 | 282K | Meshy AI (Redshield Warrior biped, Walking) | `WarriorCharacter.tsx`, `NpcWarrior.tsx` | 플레이어 scale 1.1 / NPC scale 0.73, facing `Math.PI` |
| `characters/warrior-run.glb` | 캐릭터 | 277K | Meshy AI (Redshield Warrior biped, Running) | `WarriorCharacter.tsx` | 플레이어 달리기 (Shift+W) |
| `environment/ground.glb` | 환경 | 1.2M | Meshy AI | `VillageScene.tsx` (`Ground`) | position `[0,-0.6,2]`, scale 12, rot `[-π/2,0,0]` |
| `environment/statue.glb` | 환경 | 2.9M | Meshy AI (Redshield Warrior) | `VillageScene.tsx` (`Statue`) | position `[0,2.5,2]`, scale 3.5 |
| `buildings/frontend.glb` | 건물 | 1.9M | (출처 기록 필요) | `constants.ts` skill-frontend `glbPath` | `Building.tsx` GlbModel이 size에 맞춰 렌더 |
| `buildings/backend.glb` | 건물 | 1.6M | (출처 기록 필요) | `constants.ts` skill-backend `glbPath` | 〃 |
| `dev/test-model.glb` | 개발 | 1.6M | (테스트용) | `ModelTest.tsx` → `/test-model` 라우트 | 배포 화면과 무관한 점검용 |

## 압축 파이프라인

원본(Meshy AI 등)은 보통 7~14MB. 프로젝트에 넣기 전 반드시 압축:

```bash
# 지오메트리 + 텍스처(webp 1024) 압축 — 보통 95%+ 감소
npx @gltf-transform/cli optimize <원본>.glb <출력>.glb \
  --compress draco --texture-compress webp --texture-size 1024
```

- **스킨드(애니메이션) 캐릭터**: Draco만으론 거의 안 줄어듦 → 텍스처 webp 압축이 핵심
- Draco 로드를 위해 디코더 경로가 `AIPortfolioVillage.tsx`에서 전역 설정돼 있음

## 메모

- `frontend.glb` / `backend.glb` 는 출처 미기록 — 알게 되면 위 표 채우기.
- 원본 파일(압축 전)은 리포에 두지 않음. 재압축이 필요하면 원본을 다시 확보해야 함.
- 새 NPC/캐릭터 애니메이션은 같은 골격이면 클립만 추가해 `WarriorCharacter`/`NpcWarrior`에서 재생 가능.
