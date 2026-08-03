import {notFound} from "next/navigation";
import {SueoPreview} from "./SueoPreview";

// 수어지구 룸 확인용 개발 전용 페이지.
// 실제 진입 경로는 마을 → 수어지구 건물(ProjectViewer의 id 분기)이며,
// 이 라우트는 PropsEditor와 같은 관례로 프로덕션에서는 404를 낸다.
export default function SueoPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <SueoPreview />;
}
