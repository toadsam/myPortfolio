"use client";

import dynamic from "next/dynamic";
import type {SectionId} from "@/types/portfolio";

const LabInterior = dynamic(
  () => import("./LabInterior").then(m => m.LabInterior),
  {
    ssr: false,
    loading: () => (
      <InteriorLoadingScreen color="#040608" label="프로젝트 연구실" />
    )
  }
);

const WorkshopInterior = dynamic(
  () => import("./WorkshopInterior").then(m => m.WorkshopInterior),
  {
    ssr: false,
    loading: () => (
      <InteriorLoadingScreen
        color="#f5f0e8"
        label="GitHub 작업실"
        dark={false}
      />
    )
  }
);

const ArchiveInterior = dynamic(
  () => import("./ArchiveInterior").then(m => m.ArchiveInterior),
  {
    ssr: false,
    loading: () => <InteriorLoadingScreen color="#1e1408" label="기록관" />
  }
);

const PostInterior = dynamic(
  () => import("./PostInterior").then(m => m.PostInterior),
  {
    ssr: false,
    loading: () => (
      <InteriorLoadingScreen color="#f8f5f0" label="연락 우체국" dark={false} />
    )
  }
);

function InteriorLoadingScreen({
  color,
  label,
  dark = true
}: {
  color: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{backgroundColor: color}}
    >
      <div
        className={`text-center ${dark ? "text-white/60" : "text-black/40"}`}
      >
        <div className="mb-3 text-xs font-black uppercase tracking-[0.28em]">
          {label}
        </div>
        <div className="text-xs font-bold">Loading...</div>
      </div>
    </div>
  );
}

interface Props {
  sectionId: SectionId;
  onBack: () => void;
}

export function InteriorScene({sectionId, onBack}: Props) {
  if (sectionId === "projects") return <LabInterior onBack={onBack} />;
  if (sectionId === "github") return <WorkshopInterior onBack={onBack} />;
  if (sectionId === "experience") return <ArchiveInterior onBack={onBack} />;
  if (sectionId === "contact") return <PostInterior onBack={onBack} />;
  return null;
}
