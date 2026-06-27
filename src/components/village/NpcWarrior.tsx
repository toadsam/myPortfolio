"use client";

import {useAnimations, useGLTF} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import {useEffect, useMemo, useRef} from "react";
import type {MutableRefObject} from "react";
import {Mesh, Vector3, type Group} from "three";
import {SkeletonUtils} from "three-stdlib";

export type NpcMoveState = "idle" | "walk" | "run";

const ROBOT_URL = "/models/characters/neon-robot-npc.glb";

// 플레이어(1.1)보다 1.5배 작게
const NPC_SCALE = 0.73;
const MODEL_FACING = 0;
// 카메라에서 이 거리 밖이면 렌더/애니 정지
const CULL_DISTANCE = 22;

const _tmp = new Vector3();

export function NpcWarrior({stateRef}: {stateRef: MutableRefObject<NpcMoveState>}) {
  const innerRef = useRef<Group>(null);
  const {camera} = useThree();
  const {scene, animations} = useGLTF(ROBOT_URL);

  // 인스턴스마다 골격 복제 + 그림자 비활성화 (스킨드 그림자는 비용 2배)
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.traverse((o) => {
      if (o instanceof Mesh) {
        o.castShadow = false;
        o.receiveShadow = false;
        o.frustumCulled = true;
      }
    });
    return c;
  }, [scene]);

  const clips = useMemo(() => {
    return animations
      .map((clip) => {
        const nextClip = clip.clone();
        const normalizedName = clip.name.toLowerCase();
        nextClip.name = normalizedName.includes("run") ? "run" : "walk";
        return nextClip;
      })
      .filter((clip, index, list) => list.findIndex((item) => item.name === clip.name) === index);
  }, [animations]);

  const {actions} = useAnimations(clips, innerRef);
  const currentRef = useRef<NpcMoveState>("idle");
  const visibleRef = useRef(true);

  useEffect(() => {
    // NPC들이 같은 위상으로 걷지 않게 시작 시점 분산
    for (const action of Object.values(actions)) {
      if (action) action.time = Math.random() * 1.2;
    }
  }, [actions]);

  useFrame(() => {
    if (!innerRef.current) return;

    // 거리 컬링 — 멀면 숨김(렌더/스키닝 비용 제거)
    innerRef.current.getWorldPosition(_tmp);
    const far = _tmp.distanceTo(camera.position) > CULL_DISTANCE;
    if (far !== !visibleRef.current) {
      visibleRef.current = !far;
      innerRef.current.visible = !far;
    }
    if (far) return;

    // 가까울 때만 애니메이션 상태 전환
    const target = stateRef.current;
    if (target !== currentRef.current) {
      if (currentRef.current !== "idle") actions[currentRef.current]?.fadeOut(0.2);
      if (target !== "idle") {
        actions[target]?.reset().setEffectiveTimeScale(target === "run" ? 1.08 : 1).fadeIn(0.2).play();
      }
      currentRef.current = target;
    }
  });

  return (
    <group ref={innerRef} scale={NPC_SCALE} rotation={[0, MODEL_FACING, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload(ROBOT_URL);
