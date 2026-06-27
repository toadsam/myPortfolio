"use client";

import {useAnimations, useGLTF} from "@react-three/drei";
import {useEffect, useMemo, useRef} from "react";
import type {Group} from "three";

export type MoveState = "idle" | "walk" | "run";

const WALK_URL = "/models/warrior/walk.glb";
const RUN_URL = "/models/warrior/run.glb";

// 모델 기본 자세 보정 — 필요 시 조정
const MODEL_SCALE = 1.1;
const MODEL_Y = 0;
const MODEL_FACING = Math.PI; // 모델이 +Z를 보면 180도 돌려 -Z(전방)로

export function WarriorCharacter({stateRef}: {stateRef: React.MutableRefObject<MoveState>}) {
  const innerRef = useRef<Group>(null);
  const {scene, animations: walkAnims} = useGLTF(WALK_URL);
  const {animations: runAnims} = useGLTF(RUN_URL);

  // 두 파일의 클립을 같은 골격에 합쳐 재생
  const clips = useMemo(() => {
    const out = [];
    if (walkAnims[0]) {
      const w = walkAnims[0].clone();
      w.name = "walk";
      out.push(w);
    }
    if (runAnims[0]) {
      const r = runAnims[0].clone();
      r.name = "run";
      out.push(r);
    }
    return out;
  }, [walkAnims, runAnims]);

  const {actions} = useAnimations(clips, innerRef);
  const currentRef = useRef<MoveState>("idle");

  useEffect(() => {
    // 매 프레임 상태 변화를 감지해 크로스페이드
    let raf = 0;
    function tick() {
      const target = stateRef.current;
      if (target !== currentRef.current) {
        const prev = currentRef.current;
        if (prev !== "idle") actions[prev]?.fadeOut(0.18);
        if (target !== "idle") {
          const act = actions[target];
          if (act) act.reset().setEffectiveTimeScale(target === "run" ? 1.1 : 1).fadeIn(0.18).play();
        }
        currentRef.current = target;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [actions, stateRef]);

  return (
    <group ref={innerRef} scale={MODEL_SCALE} position={[0, MODEL_Y, 0]} rotation={[0, MODEL_FACING, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(WALK_URL);
useGLTF.preload(RUN_URL);
