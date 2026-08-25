"use client";

/**
 * `/resume` 의 클라이언트 껍데기.
 *
 * 페이지(`page.tsx`)를 **서버 컴포넌트로 되돌리기 위해** 존재한다. 서버
 * 컴포넌트만 `export const metadata` 를 낼 수 있는데, 예전 page.tsx 는
 * `useRouter` 때문에 `"use client"` 였고 그래서 `/resume` 이 마을용 제목
 * ("Developer's City — 3D 인터랙티브 포트폴리오")을 그대로 쓰고 있었다.
 *
 * 여기서 하는 일은 라우터 하나뿐이다. 본문은 `ResumeMode` 가 서버에서
 * 렌더된 뒤 하이드레이트된다.
 */

import {useRouter} from "next/navigation";
import {ForestWorld} from "@/components/ui/ForestWorld";
import {ResumeMode} from "@/components/ui/ResumeMode";

export function ResumeClient() {
  const router = useRouter();
  return (
    <>
      {/* 살아 있는 배경. 이력서 본문(z-50)보다 아래(z-0)에 깔리고
          `pointer-events: none` 이라 조작을 가로채지 않는다. */}
      <ForestWorld />
      <ResumeMode onEnterVillage={() => router.push("/village")} />
    </>
  );
}
