"use client";

import {AjouchongRoom} from "@/components/ui/project-viewers/ajouchong/AjouchongRoom";
import {getProjectTheme} from "@/data/projectThemes";
import {projects} from "@/data/projects";

export function AjouchongPreview() {
  const project = projects.find(p => p.id === "ajouchong");
  if (!project) return <p>ajouchong 프로젝트를 찾을 수 없습니다.</p>;

  return (
    <AjouchongRoom
      project={project}
      theme={getProjectTheme("ajouchong")}
      onClose={() => window.location.reload()}
    />
  );
}
