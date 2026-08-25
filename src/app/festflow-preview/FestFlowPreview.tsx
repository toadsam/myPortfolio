"use client";

import {FestFlowRoom} from "@/components/ui/project-viewers/festflow/FestFlowRoom";
import {getProjectTheme} from "@/data/projectThemes";
import {projects} from "@/data/projects";

export function FestFlowPreview() {
  const project = projects.find(p => p.id === "festflow");
  if (!project) return <p>festflow 프로젝트를 찾을 수 없습니다.</p>;

  return (
    <FestFlowRoom
      project={project}
      theme={getProjectTheme("festflow")}
      onClose={() => window.location.reload()}
    />
  );
}
