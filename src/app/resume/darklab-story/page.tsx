/**
 * DarkLab 상세의 이야기 배치 시안 — `/resume/darklab-story`.
 * 본인 확인용 임시 주소다(검색 제외). 승인되면 data.ts 에 합치고 이 폴더를 지운다.
 */

import type {Metadata} from "next";
import {RICH_DATA} from "@/components/ui/project-viewers/richContent/data";
import {darklabStory} from "@/components/ui/project-viewers/richContent/darklabStory";
import type {RichProject} from "@/components/ui/project-viewers/richContent/shared";
import {ProjectDetailV4} from "@/components/resumeV2/detail/ProjectDetailV4";

export const metadata: Metadata = {
  title: "DarkLab 시안 — 정재훈 이력서",
  robots: {index: false, follow: false}
};

export default function DraftPage() {
  return (
    <ProjectDetailV4
      id="darklab"
      draft={darklabStory(RICH_DATA["darklab"] as RichProject)}
    />
  );
}
