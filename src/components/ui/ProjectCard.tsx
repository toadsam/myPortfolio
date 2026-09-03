import type {ProjectData} from "@/types/portfolio";

interface ProjectCardProps {
  project: ProjectData;
  onOpen: (project: ProjectData) => void;
  /** 마을 안에서만 넘어온다 — 이 프로젝트 건물의 3D 전시실로 바로 입장. */
  onEnter3d?: (project: ProjectData) => void;
}

export function ProjectCard({onEnter3d, onOpen, project}: ProjectCardProps) {
  return (
    <article className="rounded-lg border border-[#e0ce98] bg-[#fffdf6] p-4 shadow-[0_10px_34px_rgba(79,72,49,0.08)]">
      <div className="mb-4 border-b border-[#eadfbf] pb-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5e9b5b]">
          Project Case
        </p>
        <h3 className="mt-1 text-xl font-black text-[#1f2a24]">
          {project.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#63705f]">
          {project.description}
        </p>
      </div>

      <dl className="grid gap-4 text-sm">
        <div>
          <dt className="font-black text-[#356e43]">담당 역할</dt>
          <dd className="mt-1 leading-6 text-[#374238]">{project.role}</dd>
        </div>

        <div>
          <dt className="font-black text-[#356e43]">사용 기술</dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {project.tech.map(tech => (
              <span
                className="rounded-full border border-[#c7dd9a] bg-[#eef8db] px-2.5 py-1 text-xs font-black text-[#3f6e35]"
                key={tech}
              >
                {tech}
              </span>
            ))}
          </dd>
        </div>

        <div>
          <dt className="font-black text-[#356e43]">핵심 기능</dt>
          <dd className="mt-2">
            <ul className="grid gap-1.5 text-[#374238]">
              {project.features.map(feature => (
                <li className="flex gap-2" key={feature}>
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#79b95e]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </dd>
        </div>

        <div>
          <dt className="font-black text-[#356e43]">배운 점</dt>
          <dd className="mt-1 leading-6 text-[#374238]">{project.learning}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {onEnter3d ? (
          <button
            className="rounded-md border border-[#3d2a17] bg-[#3d2a17] px-3 py-2 text-xs font-black tracking-[0.06em] text-[#fdf3df] transition hover:bg-[#5a3f24]"
            onClick={() => onEnter3d(project)}
            type="button"
          >
            🏠 3D 전시실 들어가기
          </button>
        ) : null}
        <button
          className="rounded-md border border-[#6fac58] bg-[#6fac58] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#5f9b4d]"
          onClick={() => onOpen(project)}
          type="button"
        >
          자세히 보기
        </button>
        {project.links.map(link => (
          <a
            className="rounded-md border border-[#cdbb81] bg-[#fff7df] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#3c473b] transition hover:border-[#6fac58] hover:bg-[#eef8db]"
            href={link.href}
            key={link.label}
            rel="noreferrer"
            target="_blank"
          >
            {link.label}
          </a>
        ))}
      </div>
    </article>
  );
}
