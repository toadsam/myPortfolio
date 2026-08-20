"use client";

/**
 * 착륙장 — 이 사이트의 첫 화면.
 *
 * ## 이 파일의 존재 이유는 **무게**다
 *
 * 예전엔 `/` 가 마을 그 자체였고 인트로는 그 위에 얹힌 오버레이였다. 그래서
 * 이력서만 볼 사람도 인트로를 읽는 동안 뒤에서 GLB 87개(20.7 MB)를 받았다.
 * 그걸 막으려고 "들어갈 기색이 보이면 그때 씬을 올린다" 같은 장치를 여럿
 * 달았는데, 결국 씬을 떼자 섹션이 65px 로 접혀 첫 화면이 깨졌다 — 섹션의
 * 높이를 씬이 만들고 있었기 때문이다.
 *
 * 그래서 **주소로 가른다.** 마을은 `/village`, 이력서는 `/resume` 다. Next 는
 * 주소 단위로 코드를 쪼개므로 이 화면은 마을 청크를 **요청조차 하지 않는다.**
 * 장치가 아니라 구조라서, 같은 종류의 실수가 생길 자리가 없다.
 *
 * ## 여기에 three.js 를 들이지 마라
 *
 * `LandingScreen`(옛 IntroOverlay)과 `CommissionDesk` 는 three 를 안 쓴다 —
 * 랜턴·파티클·트레일은 전부 캔버스 2D 다. 반면 `ResumeMode` 는 배경 장식
 * 때문에 `import * as THREE` 를 한다. **이력서를 이 화면에 인라인으로 붙이면
 * 그 순간 착륙장이 three 를 받는다.** 별도 주소로 뺀 이유가 그것이다.
 *
 * 지켜지는지는 `npm run build` 의 라우트별 First Load JS 로 확인한다.
 */

import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";
import {useCallback, useState} from "react";
import {LandingScreen} from "@/components/ui/LandingScreen";

/**
 * 의뢰 접수 데스크. 세 사람 중 한 명만 누르는 화면이라 지연 로드한다.
 * (three 를 안 쓰므로 무게 때문은 아니고, 첫 페인트를 가볍게 하려는 것이다.)
 */
const CommissionDesk = dynamic(
  () => import("@/components/ui/CommissionDesk").then(m => m.CommissionDesk),
  {ssr: false}
);

export default function Home() {
  const router = useRouter();
  const [commissionOpen, setCommissionOpen] = useState(false);

  // 마을 버튼에 마우스가 올라오면 미리 받아 둔다. 예전엔 이걸 손으로
  // (`villageArmed` 상태 + 3.5초 체류 타이머) 했는데, 라우트를 가르고 나니
  // 대부분을 프레임워크가 대신해 준다.
  //
  // **두 줄인 이유가 있다.** `router.prefetch` 는 `/village` 라우트의 겉껍질만
  // 받는다(측정: JS 5개 · 약 300KB). 정작 무거운 three.js 는 그 안에서 다시
  // `dynamic` 으로 걸려 있어 딸려오지 않는다 — 그래서 씬 모듈을 직접 한 번 더
  // 건드린다. 콜백 안의 동적 import 라 **누르기 전에는 요청되지 않고**, 이 화면의
  // 초기 로드에는 three 가 한 바이트도 안 들어온다(그게 이 페이지의 존재 이유다).
  const prepareVillage = useCallback(() => {
    router.prefetch("/village");
    void import("@/components/village/VillageScene");
  }, [router]);

  return (
    <>
      <LandingScreen
        onEnterVillage={() => router.push("/village")}
        onOpenCommission={() => setCommissionOpen(true)}
        onOpenResume={() => router.push("/resume")}
        onPrepareVillage={prepareVillage}
      />
      {commissionOpen ? (
        <CommissionDesk onClose={() => setCommissionOpen(false)} />
      ) : null}
    </>
  );
}
