"use client";

/**
 * 실광원 풀 — **개수를 고정해 셰이더 재컴파일을 없앤다.**
 *
 * ## 왜 필요한가 (실측)
 *
 * three 는 씬의 **광원 개수**가 바뀌면 그 씬의 전 재질 셰이더를 다시 컴파일한다.
 * 마을은 NPC 행동·건물 강조·활동 발광이 전부 `{조건 && <pointLight/>}` 였어서
 * 개수가 8↔11 로 쉬지 않고 흔들렸다. 실측한 대가:
 *
 *   - 광원이 하나 바뀔 때마다 셰이더 프로그램 **+19개**, 그 직후 **3~7초 멈춤**
 *   - 마을 입장 후 40초 동안 5.5 → 16.9 fps, 5초 구간마다 최악 프레임 5.5~7.3초
 *   - NPC 행동을 막아 개수를 고정하면 10초 만에 **44~50 fps, 최악 프레임 110~150ms**
 *
 * ## 왜 개수를 줄이지 않고 "고정" 하는가
 *
 * 상주 광원을 8 → 10 → 12 로 늘려 가며 정지 FPS 를 재 봤더니 추세가 없었다
 * (49.3 / 43.2 / 50.3, 같은 8개 재측정에서 38.1). **개수가 많은 것은 이 장면에서
 * 거의 공짜고, 개수가 바뀌는 것만 재앙이다.** 그래서 빛을 가짜(가산 sprite)로
 * 대체해 화질을 깎을 이유가 없다 — 미리 켜 두고 옮겨 쓰면 된다.
 *
 * 풀 크기 6 은 **동시 수요 실측치**다: 건물 강조 1 + NPC 행동 2 + 활동 발광 3.
 * 그래서 켜질 것은 전부 켜지고, 그림은 예전과 같다.
 *
 * ## 쓰는 법
 *
 * `{조건 && <pointLight ... />}` 를 `<PooledLight active={조건} ... />` 로 바꾼다.
 * 인자는 그대로다. 풀이 모자라면 **카메라에 가까운 것부터** 배정한다.
 *
 * 주의: 끌 때 `visible={false}` 를 쓰면 안 된다 — three 는 안 보이는 광원을
 * 개수에서 빼므로 결국 재컴파일이 난다. 반드시 `intensity = 0` 으로 끈다.
 */

import {useFrame} from "@react-three/fiber";
import {useEffect, useRef} from "react";
import {Object3D, Vector3, type PointLight} from "three";

type LightRequest = {
  active: boolean;
  color: string;
  intensity: number;
  distance: number;
};

type Entry = {
  anchor: {current: Object3D | null};
  req: {current: LightRequest};
};

// 모듈 전역 — 풀과 요청자는 트리 상 멀리 떨어져 있어(VillageScene ↔ Building/NPC)
// context 로 잇는 것보다 이쪽이 단순하다. 요청자는 마운트 동안만 등록된다.
const registry = new Set<Entry>();

/** 풀에 빛 한 자리를 요청한다. 자리를 못 받으면 그냥 안 켜진다. */
export function PooledLight({
  active = true,
  color,
  intensity,
  distance,
  position
}: {
  active?: boolean;
  color: string;
  intensity: number;
  distance: number;
  position: [number, number, number];
}) {
  const anchor = useRef<Object3D | null>(null);
  // 매 렌더 갱신한다. 요청 내용이 바뀌어도 재등록하지 않기 위해 ref 에 담는다.
  const req = useRef<LightRequest>({active, color, intensity, distance});
  req.current = {active, color, intensity, distance};

  useEffect(() => {
    const entry: Entry = {anchor, req};
    registry.add(entry);
    return () => {
      registry.delete(entry);
    };
  }, []);

  // 빛이 있어야 할 자리를 표시만 하는 빈 노드. 풀이 여기서 월드 좌표를 읽는다.
  return <object3D position={position} ref={anchor} />;
}

const _world = new Vector3();
// 프레임마다 새로 만들지 않기 위한 재사용 버퍼
const _slots: {pos: Vector3; req: LightRequest; dist: number}[] = [];
let _slotCount = 0;

function claimSlot() {
  if (_slotCount === _slots.length) {
    _slots.push({
      pos: new Vector3(),
      req: {active: false, color: "#fff", intensity: 0, distance: 0},
      dist: 0
    });
  }
  return _slots[_slotCount++];
}

/**
 * 상주 광원 묶음. **씬 루트 근처에 한 번만** 둔다.
 * (변형이 걸린 group 안에 넣어도 되도록 월드→로컬 변환을 태운다)
 */
export function LightPool({count = 6}: {count?: number}) {
  const lights = useRef<(PointLight | null)[]>([]);

  useFrame(({camera}) => {
    _slotCount = 0;
    registry.forEach(entry => {
      const node = entry.anchor.current;
      const r = entry.req.current;
      if (!node || !r.active || r.intensity <= 0) return;
      const slot = claimSlot();
      node.getWorldPosition(slot.pos);
      slot.req = r;
      slot.dist = slot.pos.distanceToSquared(camera.position);
    });
    // 자리가 모자라면 카메라에 가까운 것이 이긴다 — 화면에서 큰 빛부터 챙긴다.
    const live = _slots.slice(0, _slotCount).sort((a, b) => a.dist - b.dist);

    for (let i = 0; i < count; i++) {
      const light = lights.current[i];
      if (!light) continue;
      const slot = live[i];
      if (!slot) {
        // **끄는 것은 intensity 0 이지 visible=false 가 아니다** (위 주석 참고)
        light.intensity = 0;
        continue;
      }
      _world.copy(slot.pos);
      light.parent?.worldToLocal(_world);
      light.position.copy(_world);
      light.color.set(slot.req.color);
      light.intensity = slot.req.intensity;
      light.distance = slot.req.distance;
    }
  });

  return (
    <>
      {Array.from({length: count}, (_, i) => (
        <pointLight
          decay={2}
          distance={1}
          intensity={0}
          key={i}
          ref={el => {
            lights.current[i] = el;
          }}
        />
      ))}
    </>
  );
}
