"use client";

import {useAnimations, useGLTF} from "@react-three/drei";
import {useEffect, useMemo, useRef} from "react";
import {LoopOnce, LoopRepeat, type Group} from "three";
import {PLAYER_EMOTES} from "@/data/playerEmotes";
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

/** 도입부 클립의 액션 이름 — 본 동작 이름과 절대 안 겹치게 접미사를 붙인다 */
const INTRO_SUFFIX = "__intro";
function introOf(emoteId: string) {
  return emoteId + INTRO_SUFFIX;
}

export function WarriorCharacter({
  stateRef,
  emoteRef
}: {
  stateRef: React.MutableRefObject<MoveState>;
  /** 지금 부리는 동작 (playerEmotes 의 id). 서 있을 때만 나온다 */
  emoteRef?: React.MutableRefObject<string | null>;
}) {
  const innerRef = useRef<Group>(null);
  const {scene, animations} = useGLTF(PLAYER_URL, true, true, extendGltfLoader);

  // 조종 캐릭터도 NPC·건물과 같은 빛 반응을 탄다 (villageMaterial 참고 —
  // 이 GLB 들은 metalness 팩터가 1.0 이라 환경맵 없는 씬에서 검게 남는다)
  useMemo(() => lockSceneMaterials(scene), [scene]);

  // 파일 하나에 클립이 열 개 들어 있다. 상태로 쓰는 셋만 골라 이름을 바꾼다 —
  // 나머지(운동 동작 7종)는 지금 안 쓰지만 파일에 남겨 둔다.
  const clips = useMemo(() => {
    // useAnimations 는 **클립 이름으로** actions 를 묶는다. 그래서 이름이 곧
    // 재생 키다 — 원본 이름을 우리 식별자로 갈아 끼운다.
    const pick = (needle: string, as: string) => {
      const found = animations.find(a => a.name.toLowerCase().includes(needle));
      if (!found) return null;
      const c = found.clone();
      c.name = as;
      return c;
    };
    const out = [];
    for (const [state, needle] of Object.entries(CLIP_OF)) {
      const c = pick(needle, state);
      if (c) out.push(c);
    }
    for (const e of PLAYER_EMOTES) {
      const c = pick(e.clip, e.id);
      if (c) out.push(c);
      // 도입부는 둘 이상이 같은 클립을 공유한다(팔굽혀펴기·점프 푸시업 둘 다
      // idle_to_push_up). 같은 이름으로 두 번 넣으면 뒤엣것이 앞엣걸 덮으므로
      // **동작별로 따로 복제해 따로 이름 붙인다.**
      if (e.intro) {
        const i = pick(e.intro, introOf(e.id));
        if (i) out.push(i);
      }
    }
    return out;
  }, [animations]);

  const {actions} = useAnimations(clips, innerRef);
  // null 로 시작해야 **첫 프레임에 idle 이 실제로 재생된다**.
  // "idle" 로 두면 target 과 같아서 아무것도 안 틀고 T 포즈로 서 있는다.
  const currentRef = useRef<string | null>(null);
  /** 도입부가 끝나 본 동작으로 넘어갈 시각(초). 도입부를 안 타면 0 */
  const introEndRef = useRef(0);

  useEffect(() => {
    // 매 프레임 상태 변화를 감지해 크로스페이드
    let raf = 0;
    function tick(nowMs: number) {
      const now = nowMs / 1000;
      const move = stateRef.current;
      // 동작은 **서 있을 때만** 나온다. 걷기 시작하면 즉시 이동 클립이 이긴다 —
      // 조종하는 쪽에서도 끊지만(CharacterController), 프레임 순서에 기대지
      // 않도록 여기서도 한 번 더 막는다.
      const emote = move === "idle" ? emoteRef?.current ?? null : null;
      let target: string = emote ?? move;

      // ── 도입부 ──
      // 서 있다가 곧바로 팔굽혀펴기를 틀면 몸이 바닥으로 스며든다. 전환 클립이
      // 있는 동작은 그걸 한 번 재생하고 넘어간다.
      if (emote) {
        const intro = introOf(emote);
        if (actions[intro]) {
          if (currentRef.current === intro) {
            // 아직 도입부 재생 중 — 끝나면 아래 비교에서 본 동작으로 넘어간다
            if (now < introEndRef.current) target = intro;
          } else if (currentRef.current !== emote) {
            target = intro;
            introEndRef.current =
              now +
              Math.max(0.3, (actions[intro]!.getClip().duration ?? 1) - 0.15);
          }
        }
      }

      if (target !== currentRef.current) {
        const prev = currentRef.current;
        if (prev) actions[prev]?.fadeOut(0.18);
        // 전사에겐 정지 클립이 없어서 idle 이 "아무것도 안 틀기"였다.
        // 본인 캐릭터는 숨쉬기 클립이 있어 서 있을 때도 살아 있다.
        const act = actions[target];
        if (act) {
          const isIntro = target.endsWith(INTRO_SUFFIX);
          act.reset();
          // 도입부는 한 번만, 그리고 **마지막 자세로 얼린다** — 반복하면
          // 매 바퀴 벌떡 일어섰다 다시 엎드린다.
          act.setLoop(isIntro ? LoopOnce : LoopRepeat, Infinity);
          act.clampWhenFinished = isIntro;
          act
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
  }, [actions, stateRef, emoteRef]);

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
