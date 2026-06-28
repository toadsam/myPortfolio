import type {ReactNode} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {RICH_DATA} from "./data";
import {FestFlowLiveDemo} from "./FestFlowLiveDemo";
import {MyWaveRichSection} from "./mywave";
import {RichSection} from "./shared";

type RenderArgs = {step: number; project: ProjectData; theme: ProjectTheme};
type Renderer = (args: RenderArgs) => ReactNode;

const dataDriven: Partial<Record<string, Renderer>> = Object.fromEntries(
  Object.keys(RICH_DATA).map((id) => [
    id,
    ({step, project, theme}: RenderArgs) => (
      <RichSection step={step} data={RICH_DATA[id]!} theme={theme} links={project.links} title={project.title} />
    ),
  ]),
);

// FestFlow는 개요(step 0) 상단에 직접 만져보는 라이브 데모를 얹는다.
const festflow: Renderer = ({step, project, theme}: RenderArgs) => (
  <div className="flex flex-col gap-6">
    {step === 0 ? <FestFlowLiveDemo theme={theme} /> : null}
    <RichSection step={step} data={RICH_DATA.festflow!} theme={theme} links={project.links} title={project.title} />
  </div>
);

export const RICH_RENDERERS: Partial<Record<string, Renderer>> = {
  mywave: ({step, project, theme}: RenderArgs) => MyWaveRichSection({step, project, theme}),
  ...dataDriven,
  festflow,
};
