"use client";

import {MuscleUpRoom} from "@/components/ui/project-viewers/muscleup/MuscleUpRoom";
import {getProjectTheme} from "@/data/projectThemes";
import {projects} from "@/data/projects";

export function MuscleUpPreview() {
  const project = projects.find(p => p.id === "muscleup");
  if (!project) return <p>muscleup 프로젝트를 찾을 수 없습니다.</p>;

  return (
    <MuscleUpRoom
      project={project}
      theme={getProjectTheme("muscleup")}
      onClose={() => window.location.reload()}
    />
  );
}
