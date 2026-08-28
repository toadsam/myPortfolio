"use client";

import {useAnimations, useGLTF} from "@react-three/drei";
import {useEffect, useMemo, useRef} from "react";
import type {Group} from "three";
import {MESHY_HEIGHT, NPC_HEIGHT} from "@/data/characterModels";
import {lockSceneMaterials} from "@/lib/villageMaterial";
import {extendGltfLoader} from "@/lib/gltfLoaders";

export type MoveState = "idle" | "walk" | "run";

// 2026-08-27 — 조종 캐릭터가 **정재훈 본인**이 됐다. 그전에는 Meshy 레드실드
// 전사 두 파일(`warrior-walk`/`warrior-run`)을 따로 읽었다 — 마을 주인이 남의
// 몸으로 자기 마을을 걸었다. 지금은 클립 10개(걷기·뛰기·숨쉬기 + 운동 7종)가
// 한 파일에 병합돼 있어 **하나만** 읽는다.
//
// 전사 GLB 는 지우지 않았다. 되돌릴 일이 있으면 이 상수만 되돌리면 된다.
// (컴포넌트 이름이 아직 WarriorCharacter 인 건 역사일 뿐이다 — 부르는 쪽
// 세 곳을 같이 고쳐야 해서 이름은 그대로 뒀다.)
const PLAYER_URL = "/models/characters/player-jaehoon.glb";

/**
 * 병합된 클립 이름 → 우리가 쓰는 상태. 이름의 **일부**만 맞으면 된다
 * (`characterModels.ts` 의 `clipOverrides` 와 같은 방식).
 */
const CLIP_OF: Record<MoveState, string> = {
  idle: "breathe",
  walk: "walking",
  run: "running"
};

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
  const {scene, animations} = useGLTF(
    PLAYER_URL,
    true,
    true,
    extendGltfLoader
  );

  // 조종 캐릭터도 NPC·건물과 같은 빛 반응을 탄다 (villageMaterial 참고 —
  // 이 GLB 들은 metalness 팩터가 1.0 이라 환경맵 없는 씬에서 검게 남는다)
  useMemo(() => lockSceneMaterials(scene), [scene]);

  // 파일 하나에 클립이 열 개 들어 있다. 상태로 쓰는 셋만 골라 이름을 바꾼다 —
  // 나머지(운동 동작 7종)는 지금 안 쓰지만 파일에 남겨 둔다.
  const clips = useMemo(() => {
    const out = [];
    for (const [state, needle] of Object.entries(CLIP_OF)) {
      const found = animations.find(a =>
        a.name.toLowerCase().includes(needle)
      );
      if (!found) continue;
      const c = found.clone();
      c.name = state;
      out.push(c);
    }
    return out;
  }, [animations]);

  const {actions} = useAnimations(clips, innerRef);
  // null 로 시작해야 **첫 프레임에 idle 이 실제로 재생된다**.
  // "idle" 로 두면 target 과 같아서 아무것도 안 틀고 T 포즈로 서 있는다.
  const currentRef = useRef<MoveState | null>(null);

  useEffect(() => {
    // 매 프레임 상태 변화를 감지해 크로스페이드
    let raf = 0;
    function tick() {
      const target = stateRef.current;
      if (target !== currentRef.current) {
        const prev = currentRef.current;
        if (prev) actions[prev]?.fadeOut(0.18);
        // 전사에겐 정지 클립이 없어서 idle 이 "아무것도 안 틀기"였다.
        // 본인 캐릭터는 숨쉬기 클립이 있어 서 있을 때도 살아 있다.
        const act = actions[target];
        if (act)
          act
            .reset()
            .setEffectiveTimeScale(target === "run" ? 1.1 : 1)
            .fadeIn(0.18)
            .play();
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
  useGLTF.preload(PLAYER_URL, true, true, extendGltfLoader);
}
