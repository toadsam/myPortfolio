import type {ProjectData} from "@/types/portfolio";

interface ProjectCardProps {
  project: ProjectData;
  /** 구역 강조색(districtTone) — 액자 안 다른 카드와 같은 톤을 쓴다 */
  color: string;
  onOpen: (project: ProjectData) => void;
  /** 마을 안에서만 넘어온다 — 이 프로젝트 건물의 3D 전시실로 바로 입장. */
  onEnter3d?: (project: ProjectData) => void;
}

/**
 * 프로젝트 구역 패널의 목록 카드.
 *
 * 예전엔 크림색 종이 + 초록 글씨였다 — 남색·금테 액자 안에서 그 카드만 다른
 * 앱처럼 튀었다(사용자 지적, 2026-09-03). 액자 안의 다른 카드(`InfoPanel Card`,
 * 기술 스택 그룹)와 같은 `#081222` 바탕·구역 강조색 칩으로 맞춘다.
 *
 * 목록 카드는 **메뉴**다 — 제목·한 줄 설명·기술 칩·버튼까지만. 역할·핵심 기능·
 * 배운 점은 "자세히 보기"(ProjectDetail) 몫이라 여기서 다 펼치지 않는다.
 * 9장을 다 펼치면 스크롤이 길어져 목록으로 읽히지 않는다.
 */
export function ProjectCard({
  color,
  onEnter3d,
  onOpen,
  project
}: ProjectCardProps) {
  return (
    <article className="rounded-[26px] bg-white/[0.06] p-5 transition-[background-color,transform] duration-300 hover:-translate-y-[3px] hover:bg-white/[0.09]">
      <p className="text-[12.5px] font-extrabold" style={{color}}>
        Project Case
      </p>
      <h3 className="v-serif mt-0.5 text-[23px] leading-tight text-white">
        {project.title}
      </h3>
      <p className="mt-2 text-[15px] leading-[1.65] text-[#d3d7df]">
        {project.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tech.map(tech => (
          <span
            className="rounded-full bg-white/[0.09] px-3 py-1 text-[13px] font-bold text-[#e6e8ee]"
            key={tech}
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onEnter3d ? (
          <button
            className="flex h-11 items-center rounded-full bg-[#4f46e5] px-5 text-[14.5px] font-extrabold text-white shadow-[0_10px_26px_rgba(79,70,229,0.35)] hover:bg-[#4338ca]"
            onClick={() => onEnter3d(project)}
            type="button"
          >
            🏠 3D 전시실 들어가기
          </button>
        ) : null}
        <button
          className="flex h-11 items-center rounded-full bg-white/10 px-5 text-[14.5px] font-extrabold text-white hover:bg-white/[0.16]"
          onClick={() => onOpen(project)}
          type="button"
        >
          자세히 보기
        </button>
        {project.links.map(link => (
          <a
            className="text-[13.5px] font-extrabold text-[#c3c0f7] underline-offset-2 hover:text-white hover:underline"
            href={link.href}
            key={link.label}
            rel="noreferrer"
            target="_blank"
          >
            {link.label} ↗
          </a>
        ))}
      </div>
    </article>
  );
}
