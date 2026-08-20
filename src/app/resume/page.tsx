"use client";

/**
 * 이력서 — 한 페이지 요약.
 *
 * ## 왜 별도 주소인가
 *
 * 두 가지다. 하나는 **무게** — `ResumeMode` 는 배경 장식(정이십면체 + 입자)
 * 때문에 `import * as THREE` 를 한다. 착륙장(`/`)에 인라인으로 붙이면 그 순간
 * 첫 화면이 three 를 받게 되고, 주소를 가른 이유가 사라진다.
 *
 * 다른 하나는 **링크** — 면접관에게 "이거 보세요" 하고 보낼 주소가 하나 생긴다.
 * 마을을 거치지 않고 바로 읽히는 게 이 화면의 목적이라, 주소가 있는 편이 맞다.
 *
 * 마을 안에서도 같은 화면을 볼 수 있다(`AIPortfolioVillage` 의 `viewMode`).
 * 컴포넌트는 하나이고 입구만 둘이다 — 갈라 복사하지 말 것.
 */

import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";

// three 를 끌고 오므로 `ssr:false` 로 클라이언트 청크에 가둔다.
const ResumeMode = dynamic(
  () => import("@/components/ui/ResumeMode").then(m => m.ResumeMode),
  {ssr: false}
);

export default function ResumePage() {
  const router = useRouter();
  return <ResumeMode onEnterVillage={() => router.push("/village")} />;
}
