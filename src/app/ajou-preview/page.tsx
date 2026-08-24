import {notFound} from "next/navigation";
import {AjouPreview} from "./AjouPreview";

// 아주대탐험 룸 확인용 개발 전용 페이지.
// 실제 진입 경로는 마을 → 아주대탐험 건물(ProjectViewer의 id 분기)이며,
// 이 라우트는 sueo-preview와 같은 관례로 프로덕션에서는 404를 낸다.
export default function AjouPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AjouPreview />;
}
