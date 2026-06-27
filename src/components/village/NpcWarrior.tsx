"use client";

import {useAnimations, useGLTF} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {useEffect, useMemo, useRef} from "react";
import type {Group} from "three";
import {SkeletonUtils} from "three-stdlib";

export type NpcMoveState = "idle" | "walk";

const WALK_URL = "/models/characters/warrior-walk.glb";

// 플레이어(1.1)보다 1.5배 작게
const NPC_SCALE = 0.73;
const MODEL_FACING = Math.PI;

export function NpcWarrior({stateRef}: {stateRef: React.MutableRefObject<NpcMoveState>}) {
  const innerRef = useRef<Group>(null);
  const {scene, animations} = useGLTF(WALK_URL);

  // 인스턴스마다 골격을 복제 (스킨드 메시 공유 방지)
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const clips = useMemo(() => {
    if (!animations[0]) return [];
    const w = animations[0].clone();
    w.name = "walk";
    return [w];
  }, [animations]);

  const {actions} = useAnimations(clips, innerRef);
  const currentRef = useRef<NpcMoveState>("idle");

  useEffect(() => {
    // 약간의 위상차로 NPC들이 동기화되어 걷지 않게
    const act = actions.walk;
    if (act) act.time = Math.random() * 1.2;
  }, [actions]);

  useFrame(() => {
    const target = stateRef.current;
    if (target !== currentRef.current) {
      if (target === "walk") actions.walk?.reset().fadeIn(0.2).play();
      else actions.walk?.fadeOut(0.25);
      currentRef.current = target;
    }
  });

  return (
    <group ref={innerRef} scale={NPC_SCALE} rotation={[0, MODEL_FACING, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload(WALK_URL);
