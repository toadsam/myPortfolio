"use client";

import {useEffect, useState} from "react";

/**
 * 이 기기에서 3D 공간을 열어도 되는가.
 *
 * ## 왜 화면 폭만으로 판단하지 않나
 *
 * 3D 공방은 `OrbitControls` 로 둘러보는 공간이다. 손가락으로는 드래그 = 회전이라
 * 스크롤과 부딪히고, 좁은 화면에서는 NPC 라벨(`<Html>`)이 서로 겹친다. 즉
 * **막히는 건 성능이 아니라 조작**이라, 폭과 포인터를 같이 본다.
 *
 * `(pointer: fine)` 은 마우스·트랙패드처럼 정확히 가리킬 수 있는 장치를 뜻한다.
 * 태블릿은 폭이 넓어도 여기서 걸러져 2D 접수 데스크로 간다 — 의도한 것이다.
 * 접수는 **끝까지 되는 것**이 제일 중요하고, 그 길은 2D 쪽이다.
 *
 * ## 첫 렌더에서는 `null` 이다
 *
 * 서버에는 화면이 없으므로 판단할 수 없다. 그 상태로 `false` 를 내보내면 수화
 * 직후 버튼의 동작이 바뀌는 깜빡임이 생긴다. 그래서 **모른다(null)** 를 따로 두고,
 * 부르는 쪽이 "아직 모르면 안전한 2D" 로 처리하게 한다. 실제로 사람이 버튼을
 * 누르는 시점에는 이미 값이 정해져 있다.
 */
export function useImmersiveCapable(): boolean | null {
  const [capable, setCapable] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const apply = () => setCapable(query.matches);

    apply();
    // 창 크기를 줄이거나 마우스를 뽑는 경우까지 따라간다.
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return capable;
}
