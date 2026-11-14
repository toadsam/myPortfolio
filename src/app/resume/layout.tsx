/**
 * /resume 과 /resume/<id> 공통 틀.
 *
 * 경력 안내 캐릭터(두꺼비)를 여기에 둔다. 레이아웃은 이력서와 상세 사이를 오가도 다시
 * 마운트되지 않아서, 답 아래 근거 링크를 눌러 상세로 넘어가도 대화가 남는다.
 */

import type {ReactNode} from "react";
import {CareerGuide} from "@/components/resumeV2/CareerGuide";

export default function ResumeLayout({children}: {children: ReactNode}) {
  return (
    <>
      {children}
      <CareerGuide />
    </>
  );
}
