"use client";

// NPC 3D 캐릭터 렌더러. 모델은 data/characterModels.ts 레지스트리에서 골라 온다.
// (이전 NpcWarrior — 로봇 한 종류만 그리던 것을 모델별로 갈아끼울 수 있게 일반화)

import {useAnimations, useGLTF} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import {useEffect, useMemo, useRef} from "react";
import type {MutableRefObject} from "react";
import {Box3, Mesh, Vector3, type AnimationClip, type Group} from "three";
import {SkeletonUtils} from "three-stdlib";
import {characterModels, classifyClip, DEFAULT_NPC_MODEL, type CharacterState} from "@/data/characterModels";
import type {CharacterModelId} from "@/types/portfolio";

export type NpcMoveState = CharacterState;

// 카메라에서 이 거리 밖이면 렌더/애니 정지
const CULL_DISTANCE = 22;
// idle 클립이 여러 개일 때 갈아타는 간격(초). ±40% 흔들어 NPC끼리 안 겹치게 한다.
const IDLE_SWAP_SECONDS = 9;
// Meshy가 캐릭터를 내보내는 기준 높이 (three.js 실측: 로봇·전사·루미 모두 1.7000)
const MESHY_HEIGHT = 1.7;

// 프레임 루프 전용 스크래치. 측정에는 쓰지 않는다 — 측정은 useMemo 안에서 지역 객체로 한다.
const _tmp = new Vector3();

export function NpcCharacter({
  stateRef,
  modelId = DEFAULT_NPC_MODEL
}: {
  stateRef: MutableRefObject<NpcMoveState>;
  modelId?: CharacterModelId;
}) {
  const innerRef = useRef<Group>(null);
  const {camera} = useThree();
  const model = characterModels[modelId] ?? characterModels[DEFAULT_NPC_MODEL];
  const {scene, animations} = useGLTF(model.url);

  // 인스턴스마다 골격 복제 + 그림자 비활성화 (스킨드 그림자는 비용 2배)
  //
  // 크기 정규화를 여기서 같이 한다. 반드시 "복제 직후, 씬에 붙기 전에" 재야 한다.
  // Box3.setFromObject는 자식들의 matrixWorld를 쓰는데, 이미 부모 <group>에 붙은 뒤라면
  // 그 group의 scale이 측정값에 섞여 들어간다. 그러면 정규화가 자기 출력을 다시
  // 입력으로 먹으면서 스케일이 폭주한다(캐릭터가 거대해지는 원인).
  // 여기서는 copy.parent가 확실히 null이라 순수 원본 크기가 나온다.
  const {cloned, scale} = useMemo(() => {
    const copy = SkeletonUtils.clone(scene);
    copy.traverse((o) => {
      if (o instanceof Mesh) {
        o.castShadow = false;
        o.receiveShadow = false;
        o.frustumCulled = true;
      }
    });
    copy.updateWorldMatrix(false, true);
    const height = new Box3().setFromObject(copy).getSize(new Vector3()).y;

    // 측정이 어긋나도 거인/점이 되진 않게 막는다. Meshy는 1.7 유닛으로 나오므로
    // 정상 배율은 0.7 근처다. 범위를 벗어나면 측정을 버리고 기준 배율로 간다.
    let next = height > 0 ? model.height / height : model.height / MESHY_HEIGHT;
    if (!Number.isFinite(next) || next < 0.05 || next > 20) {
      console.warn(`[NpcCharacter] ${modelId}: 높이 측정 이상 (${height.toFixed(4)}) — 기준 배율로 대체`);
      next = model.height / MESHY_HEIGHT;
    }
    return {cloned: copy, scale: next};
  }, [scene, model.height, modelId]);

  // 클립을 상태별로 분류. 분류 안 되는 클립(어퍼컷 등)은 등록만 하고 재생은 안 한다.
  const {clips, byState} = useMemo(() => {
    const buckets: Record<CharacterState, string[]> = {idle: [], walk: [], run: []};
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

  const {actions} = useAnimations(clips, innerRef);
  const playingRef = useRef<string | null>(null);
  const idleSwapAtRef = useRef(0);
  const idleTurnRef = useRef(0);
  const visibleRef = useRef(true);

  useEffect(() => {
    // NPC들이 같은 위상으로 걷지 않게 시작 시점 분산
    for (const action of Object.values(actions)) {
      if (action) action.time = Math.random() * 1.2;
    }
    idleSwapAtRef.current = Math.random() * IDLE_SWAP_SECONDS;
    idleTurnRef.current = Math.floor(Math.random() * 4);
  }, [actions]);

  useFrame((state) => {
    if (!innerRef.current) return;

    // 거리 컬링 — 멀면 숨김(렌더/스키닝 비용 제거)
    innerRef.current.getWorldPosition(_tmp);
    const far = _tmp.distanceTo(camera.position) > CULL_DISTANCE;
    if (far !== !visibleRef.current) {
      visibleRef.current = !far;
      innerRef.current.visible = !far;
    }
    if (far) return;

    const now = state.clock.elapsedTime;
    const target = stateRef.current;
    const pool = byState[target];
    let want: string | null = null;

    if (pool.length > 0) {
      const holding = playingRef.current !== null && pool.includes(playingRef.current);
      // idle 클립이 둘 이상이면 주기적으로 갈아탄다 — 가만히 서 있어도 살아있어 보인다
      if (target === "idle" && pool.length > 1 && holding && now < idleSwapAtRef.current) {
        want = playingRef.current;
      } else if (target === "idle" && pool.length > 1) {
        if (!holding || now >= idleSwapAtRef.current) {
          idleTurnRef.current += 1;
          idleSwapAtRef.current = now + IDLE_SWAP_SECONDS * (0.8 + Math.random() * 0.4);
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
for (const entry of Object.values(characterModels)) useGLTF.preload(entry.url);
