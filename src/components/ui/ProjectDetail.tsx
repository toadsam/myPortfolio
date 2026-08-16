import type {ProjectData} from "@/types/portfolio";
import type {ReactNode} from "react";

interface ProjectDetailProps {
  project: ProjectData;
  onBack: () => void;
}

export function ProjectDetail({onBack, project}: ProjectDetailProps) {
  return (
    <article className="rounded-lg border border-[#d9c58a] bg-[#fffdf6] p-5 shadow-[0_10px_34px_rgba(79,72,49,0.08)]">
      <button
        className="mb-4 rounded-lg border border-[#d0bd81] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#68715e] hover:bg-[#f4e9c7]"
        onClick={onBack}
        type="button"
      >
        프로젝트 목록으로
      </button>

      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5e9b5b]">
        Project Detail
      </p>
      <h3 className="mt-2 text-2xl font-black text-[#1f2a24]">
        {project.title}
      </h3>
      <p className="mt-3 leading-7 text-[#465044]">{project.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.tech.map(tech => (
          <span
            className="rounded-full border border-[#c7dd9a] bg-[#eef8db] px-3 py-1.5 text-xs font-black text-[#3f6e35]"
            key={tech}
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        <DetailBlock title="문제 정의">
          <p>{project.problem}</p>
        </DetailBlock>

        <DetailBlock title="접근 방식">
          <BulletList items={project.approach} />
        </DetailBlock>

        <DetailBlock title="나의 기여">
          <BulletList items={project.contribution} />
        </DetailBlock>

        <DetailBlock title="결과와 배운 점">
          <p>{project.result}</p>
          <p className="mt-2 text-[#5f6a5b]">{project.learning}</p>
        </DetailBlock>

        <DetailBlock title="다음 보완">
          <p>{project.nextStep}</p>
        </DetailBlock>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.links.map(link => (
          <a
            className={
              link.label === "Demo"
                ? "rounded-lg border border-[#5f9f4f] bg-[#5f9f4f] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#4f8d42]"
                : "rounded-lg border border-[#cdbb81] bg-[#fff7df] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#3c473b] transition hover:border-[#6fac58] hover:bg-[#eef8db]"
            }
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

function DetailBlock({children, title}: {children: ReactNode; title: string}) {
  return (
    <section className="rounded-lg border border-[#eadfbf] bg-white/65 p-4">
      <h4 className="text-sm font-black text-[#356e43]">{title}</h4>
      <div className="mt-2 text-sm leading-7 text-[#374238]">{children}</div>
    </section>
  );
}

function BulletList({items}: {items: string[]}) {
  return (
    <ul className="grid gap-2">
      {items.map(item => (
        <li className="flex gap-2" key={item}>
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#79b95e]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
