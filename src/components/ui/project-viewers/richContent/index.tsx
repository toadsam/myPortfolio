import type {ReactNode} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {RICH_DATA} from "./data";
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

export const RICH_RENDERERS: Partial<Record<string, Renderer>> = {
  mywave: ({step, project, theme}: RenderArgs) => MyWaveRichSection({step, project, theme}),
  ...dataDriven,
};
