import type {ProjectData} from "@/types/portfolio";
import type {ReactNode} from "react";

interface ProjectDetailProps {
  project: ProjectData;
  onBack: () => void;
}

export function ProjectDetail({onBack, project}: ProjectDetailProps) {
  // 2026-11-14: 크림색 종이 + 초록 글씨였다. 패널이 어두운 판으로 바뀐 뒤 이 화면만
  // 다른 앱처럼 밝게 남아 있어 목록 카드(ProjectCard)와 같은 톤으로 맞췄다.
  return (
    <article className="v-pop rounded-[26px] bg-white/[0.06] p-5">
      <button
        className="mb-4 flex h-10 items-center rounded-full bg-white/10 px-4 text-[13.5px] font-extrabold text-white hover:bg-white/[0.16]"
        onClick={onBack}
        type="button"
      >
        ← 프로젝트 목록으로
      </button>

      <p className="text-[12.5px] font-extrabold text-[#aeaaf3]">
        Project Detail
      </p>
      <h3 className="v-serif mt-0.5 text-[26px] leading-tight text-white">
        {project.title}
      </h3>
      <p className="mt-3 text-[15px] leading-7 text-[#d3d7df]">
        {project.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.tech.map(tech => (
          <span
            className="rounded-full bg-white/[0.09] px-3 py-1 text-[13px] font-bold text-[#e6e8ee]"
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
          <p className="mt-2 text-[#b4bac6]">{project.learning}</p>
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
                ? "flex h-11 items-center rounded-full px-5 text-[14.5px] font-extrabold text-white bg-[#4f46e5] hover:bg-[#4338ca]"
                : "flex h-11 items-center rounded-full px-5 text-[14.5px] font-extrabold text-white bg-white/10 hover:bg-white/[0.16]"
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
    <section className="rounded-[22px] bg-white/[0.06] p-4">
      <h4 className="text-[15px] font-black text-[#c3c0f7]">{title}</h4>
      <div className="mt-2 text-[15px] leading-7 text-[#e6e8ee]">
        {children}
      </div>
    </section>
  );
}

function BulletList({items}: {items: string[]}) {
  return (
    <ul className="grid gap-2">
      {items.map(item => (
        <li className="flex gap-2" key={item}>
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#aeaaf3]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
