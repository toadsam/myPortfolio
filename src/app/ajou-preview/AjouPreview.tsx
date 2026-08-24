"use client";

import {AjouRoom} from "@/components/ui/project-viewers/ajou/AjouRoom";
import {getProjectTheme} from "@/data/projectThemes";
import {projects} from "@/data/projects";

export function AjouPreview() {
  const project = projects.find(p => p.id === "ajou-adventure");
  if (!project) return <p>ajou-adventure 프로젝트를 찾을 수 없습니다.</p>;

  return (
    <AjouRoom
      project={project}
      theme={getProjectTheme("ajou-adventure")}
      onClose={() => window.location.reload()}
    />
  );
}
