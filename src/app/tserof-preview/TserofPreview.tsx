"use client";

import {TserofRoom} from "@/components/ui/project-viewers/tserof/TserofRoom";
import {getProjectTheme} from "@/data/projectThemes";
import {projects} from "@/data/projects";

export function TserofPreview() {
  const project = projects.find(p => p.id === "tserof");
  if (!project) return <p>tserof 프로젝트를 찾을 수 없습니다.</p>;

  return (
    <TserofRoom
      project={project}
      theme={getProjectTheme("tserof")}
      onClose={() => window.location.reload()}
    />
  );
}
