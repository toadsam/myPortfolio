"use client";

import {useAnimations, useGLTF} from "@react-three/drei";
import {useEffect, useMemo, useRef} from "react";
import type {Group} from "three";
import {MESHY_HEIGHT, NPC_HEIGHT} from "@/data/characterModels";
import {lockSceneMaterials} from "@/lib/villageMaterial";
import {extendGltfLoader} from "@/lib/gltfLoaders";

export type MoveState = "idle" | "walk" | "run";

const WALK_URL = "/models/characters/warrior-walk.glb";
const RUN_URL = "/models/characters/warrior-run.glb";

// 모델 기본 자세 보정 — 필요 시 조정
//
// 예전엔 1.1 고정이라 조종 캐릭터 키가 1.87유닛이었다. 표준 건물(1.9)과 맞먹어
// 마을을 걸으면 사람이 집만 했다. NPC와 같은 키를 쓰도록 레지스트리에 묶는다.
const MODEL_SCALE = NPC_HEIGHT / MESHY_HEIGHT;
const MODEL_Y = 0;
const MODEL_FACING = Math.PI; // 모델이 +Z를 보면 180도 돌려 -Z(전방)로

export function WarriorCharacter({
  stateRef
}: {
  stateRef: React.MutableRefObject<MoveState>;
}) {
  const innerRef = useRef<Group>(null);
  const {scene, animations: walkAnims} = useGLTF(
    WALK_URL,
    true,
    true,
    extendGltfLoader
  );
  const {animations: runAnims} = useGLTF(RUN_URL, true, true, extendGltfLoader);

  // 조종 캐릭터도 NPC·건물과 같은 빛 반응을 탄다 (villageMaterial 참고 —
  // 이 GLB 들은 metalness 팩터가 1.0 이라 환경맵 없는 씬에서 검게 남는다)
  useMemo(() => lockSceneMaterials(scene), [scene]);

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
          if (act)
            act
              .reset()
              .setEffectiveTimeScale(target === "run" ? 1.1 : 1)
              .fadeIn(0.18)
              .play();
        }
        currentRef.current = target;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [actions, stateRef]);

  return (
    <group
      ref={innerRef}
      scale={MODEL_SCALE}
      position={[0, MODEL_Y, 0]}
      rotation={[0, MODEL_FACING, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

// **모듈 최상위에서 부르지 않는다.** 이 파일은 dynamic(VillageScene) 청크에 실려
// 있는데, Next 가 그 청크를 미리 로드하는 것만으로 최상위 코드가 실행된다.
// 그러면 인트로만 보고 갈 사람도 캐릭터 GLB 를 내려받게 된다(실측 1.4MB).
// 씬이 실제로 마운트될 때 한 번만 돌도록 아래 훅으로 옮겼다.
export function preloadWarriorModels(): void {
  useGLTF.preload(WALK_URL, true, true, extendGltfLoader);
  useGLTF.preload(RUN_URL, true, true, extendGltfLoader);
}
