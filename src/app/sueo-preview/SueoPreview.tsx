"use client";

import {SueoDistrictRoom} from "@/components/ui/project-viewers/sueo/SueoDistrictRoom";
import {getProjectTheme} from "@/data/projectThemes";
import {projects} from "@/data/projects";

export function SueoPreview() {
  const project = projects.find(p => p.id === "sign-language");
  if (!project) return <p>sign-language 프로젝트를 찾을 수 없습니다.</p>;

  return (
    <SueoDistrictRoom
      project={project}
      theme={getProjectTheme("sign-language")}
      onClose={() => window.location.reload()}
    />
  );
}
