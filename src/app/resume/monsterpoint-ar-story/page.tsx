/**
 * INTO MONSTER POINT (AR) 상세의 이야기 배치 시안 — `/resume/monsterpoint-ar-story`.
 * 본인 확인용 임시 주소다(검색 제외). 승인되면 data.ts 에 합치고 이 폴더를 지운다.
 */

import type {Metadata} from "next";
import {RICH_DATA} from "@/components/ui/project-viewers/richContent/data";
import {arStory} from "@/components/ui/project-viewers/richContent/arStory";
import type {RichProject} from "@/components/ui/project-viewers/richContent/shared";
import {ProjectDetailV4} from "@/components/resumeV2/detail/ProjectDetailV4";

export const metadata: Metadata = {
  title: "INTO MONSTER POINT (AR) 시안 — 정재훈 이력서",
  robots: {index: false, follow: false}
};

export default function DraftPage() {
  return (
    <ProjectDetailV4
      id="monsterpoint-ar"
      draft={arStory(RICH_DATA["monsterpoint-ar"] as RichProject)}
    />
  );
}
