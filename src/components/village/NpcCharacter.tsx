"use client";

// NPC 3D 캐릭터 렌더러. 모델은 data/characterModels.ts 레지스트리에서 골라 온다.
// (이전 NpcWarrior — 로봇 한 종류만 그리던 것을 모델별로 갈아끼울 수 있게 일반화)

import {useAnimations, useGLTF} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import {memo, useEffect, useMemo, useRef} from "react";
import type {MutableRefObject} from "react";
import {Box3, Mesh, Vector3, type AnimationClip, type Group} from "three";
import {SkeletonUtils} from "three-stdlib";
import {
  characterModels,
  classifyClip,
  DEFAULT_NPC_MODEL,
  type CharacterState
} from "@/data/characterModels";
import {lockSceneMaterials} from "@/lib/villageMaterial";
import type {CharacterModelId} from "@/types/portfolio";
import {extendGltfLoader} from "@/lib/gltfLoaders";

const noopRaycast = () => {};

export type NpcMoveState = CharacterState;

// 카메라에서 이 거리 밖이면 렌더/애니 정지
const CULL_DISTANCE = 22;

/**
 * 이 거리 밖이면 **그림자만** 끈다(본체는 계속 보인다).
 *
 * 그림자 패스는 캐릭터를 한 번 더 스키닝해서 그린다 — 즉 보이는 NPC 마다
 * 삼각형 비용이 정확히 2배다. 의인화 동물 모델은 종당 약 19,500 삼각형으로
 * 예전 로봇(3,115)의 6배라 이 2배가 그냥 넘길 수치가 아니게 됐다.
 *
 * 실측(마을 반경 32.6, 건물 27채 격자 전수조사):
 *   반경 22 안 NPC — 최대 16명 · 평균 8.1명
 *   반경 12 안 NPC — 최대  9명 · 평균 3.0명
 *   NPC 삼각형 최악 624,000 → 487,500 · 평균 315,000 → 216,000
 *   마을 합계 최악 1,924,000 → 1,787,500 (PerfHud 경고선 1,800,000 아래로)
 *
 * 12 유닛 밖 캐릭터는 키가 0.8 유닛이라 화면에서 손톱만 하고, 그 그림자는
 * 몇 픽셀이다. 눈에 띄는 손해 없이 비용만 뺀다.
 */
const SHADOW_DISTANCE = 12;
// idle 클립이 여러 개일 때 갈아타는 간격(초). ±40% 흔들어 NPC끼리 안 겹치게 한다.
const IDLE_SWAP_SECONDS = 9;
// Meshy가 캐릭터를 내보내는 기준 높이 (three.js 실측: 로봇·전사·루미 모두 1.7000)
const MESHY_HEIGHT = 1.7;

// 프레임 루프 전용 스크래치. 측정에는 쓰지 않는다 — 측정은 useMemo 안에서 지역 객체로 한다.
const _tmp = new Vector3();

function NpcCharacterImpl({
  stateRef,
  modelId = DEFAULT_NPC_MODEL
}: {
  stateRef: MutableRefObject<NpcMoveState>;
  modelId?: CharacterModelId;
}) {
  const innerRef = useRef<Group>(null);
  const {camera} = useThree();
  const model = characterModels[modelId] ?? characterModels[DEFAULT_NPC_MODEL];
  const {scene, animations} = useGLTF(model.url, true, true, extendGltfLoader);

  // 인스턴스마다 골격 복제.
  //
  // castShadow는 예전엔 꺼 뒀다("스킨드 그림자는 비용 2배") — 그땐 Canvas에
  // shadows 자체가 없어서 어차피 무의미했고, 대신 발밑에 연두 링을 상시로 깔았다.
  // 이제 진짜 그림자가 있으니 링을 걷고 이쪽을 켠다. 27명이 그림자 패스에서
  // 27번 더 스키닝되지만, 링 27개를 상시로 그리던 것과 draw call은 같고
  // "땅에 서 있다"는 느낌은 비교가 안 된다. receiveShadow는 계속 끈다 —
  // 캐릭터가 자기 그림자를 받으면 저해상도 섀도맵에서 얼굴에 얼룩이 진다.
  //
  // 크기 정규화를 여기서 같이 한다. 반드시 "복제 직후, 씬에 붙기 전에" 재야 한다.
  // Box3.setFromObject는 자식들의 matrixWorld를 쓰는데, 이미 부모 <group>에 붙은 뒤라면
  // 그 group의 scale이 측정값에 섞여 들어간다. 그러면 정규화가 자기 출력을 다시
  // 입력으로 먹으면서 스케일이 폭주한다(캐릭터가 거대해지는 원인).
  // 여기서는 copy.parent가 확실히 null이라 순수 원본 크기가 나온다.
  const {cloned, scale, meshes} = useMemo(() => {
    const copy = SkeletonUtils.clone(scene);
    // 그림자를 거리별로 껐다 켜려면 메시 목록이 필요하다. 매 프레임 traverse
    // 하는 건 27명 × 60fps 라 낭비이므로 복제할 때 한 번만 모아 둔다.
    const list: Mesh[] = [];
    // 캐릭터야말로 이게 제일 급했다 — 실측하니 캐릭터 GLB 6개는 MR 텍스처도
    // 없이 metalness 팩터가 1.0 이었다. 환경맵이 없는 씬에서 순수 금속은
    // 확산광을 잃고 검게만 남는다.
    lockSceneMaterials(copy);
    copy.traverse(o => {
      if (o instanceof Mesh) {
        o.castShadow = true;
        o.receiveShadow = false;
        o.frustumCulled = true;
        // 포인터 판정은 NPC.tsx 의 투명 캡슐이 전담한다. SkinnedMesh.raycast 는
        // 삼각형마다 스키닝을 다시 계산하는 데다 바운딩 구는 바인드 포즈 기준이라
        // 애니메이션 중엔 판정이 어긋난다 — 27명이 마우스 움직임마다 이걸 돌리면
        // 느리고 부정확했다. 캐릭터 메시는 레이캐스트에서 아예 뺀다.
        o.raycast = noopRaycast;
        list.push(o);
      }
    });
    copy.updateWorldMatrix(false, true);
    const height = new Box3().setFromObject(copy).getSize(new Vector3()).y;

    // 측정이 어긋나도 거인/점이 되진 않게 막는다. Meshy는 1.7 유닛으로 나오므로
    // 정상 배율은 0.7 근처다. 범위를 벗어나면 측정을 버리고 기준 배율로 간다.
    let next = height > 0 ? model.height / height : model.height / MESHY_HEIGHT;
    if (!Number.isFinite(next) || next < 0.05 || next > 20) {
      console.warn(
        `[NpcCharacter] ${modelId}: 높이 측정 이상 (${height.toFixed(
          4
        )}) — 기준 배율로 대체`
      );
      next = model.height / MESHY_HEIGHT;
    }
    return {cloned: copy, scale: next, meshes: list};
  }, [scene, model.height, modelId]);

  // 클립을 상태별로 분류. 분류 안 되는 클립(어퍼컷 등)은 등록만 하고 재생은 안 한다.
  const {clips, byState} = useMemo(() => {
    const buckets: Record<CharacterState, string[]> = {
      idle: [],
      walk: [],
      run: []
    };
    const list: AnimationClip[] = [];
    const used = new Set<string>();

    for (const clip of animations) {
      // useAnimations는 이름으로 액션을 찾으므로 중복 이름은 하나만 남긴다
      if (used.has(clip.name)) continue;
      used.add(clip.name);
      list.push(clip);
      const state = classifyClip(clip.name, model.clipOverrides);
      if (state) buckets[state].push(clip.name);
    }
    return {clips: list, byState: buckets};
  }, [animations, model.clipOverrides]);

  const {actions, mixer} = useAnimations(clips, innerRef);
  const playingRef = useRef<string | null>(null);
  const idleSwapAtRef = useRef(0);
  const idleTurnRef = useRef(0);
  const visibleRef = useRef(true);
  const shadowRef = useRef(true);

  useEffect(() => {
    // NPC들이 같은 위상으로 걷지 않게 시작 시점 분산
    for (const action of Object.values(actions)) {
      if (action) action.time = Math.random() * 1.2;
    }
    idleSwapAtRef.current = Math.random() * IDLE_SWAP_SECONDS;
    idleTurnRef.current = Math.floor(Math.random() * 4);
  }, [actions]);

  useFrame(state => {
    if (!innerRef.current) return;

    // 거리 컬링 — 멀면 숨김(렌더/스키닝 비용 제거)
    innerRef.current.getWorldPosition(_tmp);
    const dist = _tmp.distanceTo(camera.position);
    const far = dist > CULL_DISTANCE;
    if (far !== !visibleRef.current) {
      visibleRef.current = !far;
      innerRef.current.visible = !far;
      // 안 보이는 동안은 스켈레톤 계산도 멈춘다.
      //
      // visible=false 면 three 가 렌더는 건너뛰지만, drei 의 useAnimations 가
      // 건 AnimationMixer 는 자기 useFrame 에서 계속 돈다 — 뼈 26개 × 트랙 3종을
      // 매 프레임 보간한다. 화면 밖 NPC 20여 명이 그 짓을 하고 있었다.
      // timeScale 0 이면 mixer.update 가 시간을 0 만큼 진행시켜 사실상 무동작이 된다.
      // (재개하면 멈춘 자세에서 그대로 이어져 티가 안 난다)
      mixer.timeScale = far ? 0 : 1;
    }
    if (far) return;

    // 그림자만 따로 끊는다 — 본체는 22 유닛까지 보이되 그림자는 12 유닛까지.
    // 밴드가 바뀌는 순간에만 건드린다(매 프레임 대입하면 27명분 낭비).
    const wantShadow = dist <= SHADOW_DISTANCE;
    if (wantShadow !== shadowRef.current) {
      shadowRef.current = wantShadow;
      for (const m of meshes) m.castShadow = wantShadow;
    }

    const now = state.clock.elapsedTime;
    const target = stateRef.current;
    const pool = byState[target];
    let want: string | null = null;

    if (pool.length > 0) {
      const holding =
        playingRef.current !== null && pool.includes(playingRef.current);
      // idle 클립이 둘 이상이면 주기적으로 갈아탄다 — 가만히 서 있어도 살아있어 보인다
      if (
        target === "idle" &&
        pool.length > 1 &&
        holding &&
        now < idleSwapAtRef.current
      ) {
        want = playingRef.current;
      } else if (target === "idle" && pool.length > 1) {
        if (!holding || now >= idleSwapAtRef.current) {
          idleTurnRef.current += 1;
          idleSwapAtRef.current =
            now + IDLE_SWAP_SECONDS * (0.8 + Math.random() * 0.4);
        }
        want = pool[idleTurnRef.current % pool.length];
      } else {
        want = holding ? playingRef.current : pool[0];
      }
    }

    if (want === playingRef.current) return;

    if (playingRef.current) actions[playingRef.current]?.fadeOut(0.25);
    if (want) {
      actions[want]
        ?.reset()
        .setEffectiveTimeScale(target === "run" ? 1.08 : 1)
        .fadeIn(0.25)
        .play();
    }
    playingRef.current = want;
  });

  return (
    <group ref={innerRef} scale={scale} rotation={[0, model.facing ?? 0, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

// 레지스트리에 등록된 모델은 미리 받아둔다 (NPC가 화면에 뜰 때 끊기지 않게)
//
// **모듈 최상위에서 부르지 않는다.** 이 파일은 dynamic(VillageScene) 청크에 실려
// 있는데, Next 가 그 청크를 미리 로드하는 것만으로 최상위 코드가 실행된다.
// 그러면 인트로만 보고 갈 사람도 캐릭터 GLB 를 내려받게 된다(실측 1.4MB).
// 씬이 실제로 마운트될 때 한 번만 돌도록 아래 훅으로 옮겼다.
export function preloadCharacterModels(): void {
  for (const entry of Object.values(characterModels))
    useGLTF.preload(entry.url, true, true, extendGltfLoader);
}

// NPC(부모)는 말풍선·기분이 바뀔 때마다 재렌더된다. 여기 props 는 ref 와 모델 id
// 뿐이라 memo 로 끊으면 캐릭터 트리는 그때 다시 안 만든다.
export const NpcCharacter = memo(NpcCharacterImpl);
