/**
 * 프로젝트 상세 — `/resume/<id>`.
 *
 * RICH_DATA 에 있는 프로젝트마다 정적 페이지를 하나씩 만든다. 득근득근만 손으로 다듬은
 * 전용 페이지(MuscleupDetail)를 쓰고, 나머지는 같은 틀(ProjectDetailV4)로 그린다.
 * 서버 컴포넌트라 첫 HTML 에 본문이 다 들어간다.
 */

import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {RICH_DATA} from "@/components/ui/project-viewers/richContent/data";
import {MuscleupDetail} from "@/components/resumeV2/detail/MuscleupDetail";
import {ProjectDetailV4} from "@/components/resumeV2/detail/ProjectDetailV4";
import {projects} from "@/data/projects";

type Params = {id: string};

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return Object.keys(RICH_DATA).map(id => ({id}));
}

function projectTitle(id: string) {
  return projects.find(p => p.id === id)?.title ?? id;
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const {id} = await params;
  if (!RICH_DATA[id]) return {};
  const title = `${projectTitle(id)} — 정재훈 이력서`;
  const description =
    projects.find(p => p.id === id)?.description ?? RICH_DATA[id]!.tagline;
  return {
    title,
    description,
    openGraph: {title, description, type: "article", locale: "ko_KR"},
    twitter: {card: "summary_large_image", title, description}
  };
}

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<Params>;
}) {
  const {id} = await params;
  if (!RICH_DATA[id]) notFound();
  // 득근득근은 이야기 배치(story)로 그린다. 옛 배치는 story 를 빼면 그대로 나온다.
  if (id === "muscleup") return <MuscleupDetail story />;
  return <ProjectDetailV4 id={id} />;
}
