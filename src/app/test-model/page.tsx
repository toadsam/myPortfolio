"use client";

import dynamic from "next/dynamic";
import {notFound} from "next/navigation";

const ModelTest = dynamic(
  () => import("@/components/ModelTest").then(m => m.ModelTest),
  {ssr: false}
);

export default function TestModelPage() {
  // GLB 시험용 개발 전용 페이지 — preview 페이지들과 같은 관례로 프로덕션에서는 404.
  if (process.env.NODE_ENV !== "development") notFound();
  return <ModelTest />;
}
