import type {ReactNode} from "react";
import type {ProjectTheme} from "@/data/projectThemes";
import type {ProjectData} from "@/types/portfolio";
import {RICH_DATA} from "./data";
import {AClubDemo} from "./AClubDemo";
import {AjouAdventureDemo} from "./AjouAdventureDemo";
import {AjouchongDemo} from "./AjouchongDemo";
import {DarkLabReveal} from "./DarkLabReveal";
import {FestFlowLiveDemo} from "./FestFlowLiveDemo";
import {MuscleUpDemo} from "./MuscleUpDemo";
import {MyStockDemo} from "./MyStockDemo";
import {MyWaveRichSection} from "./mywave";
import {RichSection} from "./shared";
import {SignLanguageDemo} from "./SignLanguageDemo";
import {TserofDemo} from "./TserofDemo";

type RenderArgs = {step: number; project: ProjectData; theme: ProjectTheme};
type Renderer = (args: RenderArgs) => ReactNode;

// 프로젝트별 시그니처 인터랙티브 데모 — 각 프로젝트 컨셉에 맞춘 고유 인터랙션.
// 개요(step 0) 상단에 표시된다.
const SIGNATURE: Partial<Record<string, (theme: ProjectTheme) => ReactNode>> = {
  festflow: (theme) => <FestFlowLiveDemo theme={theme} />,
  mystock: (theme) => <MyStockDemo theme={theme} />,
  muscleup: (theme) => <MuscleUpDemo theme={theme} />,
  aclub: (theme) => <AClubDemo theme={theme} />,
  "sign-language": (theme) => <SignLanguageDemo theme={theme} />,
  ajouchong: (theme) => <AjouchongDemo theme={theme} />,
  darklab: (theme) => <DarkLabReveal theme={theme} />,
  "ajou-adventure": (theme) => <AjouAdventureDemo theme={theme} />,
  tserof: (theme) => <TserofDemo theme={theme} />,
};

const dataDriven: Partial<Record<string, Renderer>> = Object.fromEntries(
  Object.keys(RICH_DATA).map((id) => [
    id,
    ({step, project, theme}: RenderArgs) => {
      const signature = step === 0 ? SIGNATURE[id] : undefined;
      const base = <RichSection step={step} data={RICH_DATA[id]!} theme={theme} links={project.links} title={project.title} />;
      return signature ? (
        <div className="flex flex-col gap-6">
          {signature(theme)}
          {base}
        </div>
      ) : (
        base
      );
    },
  ]),
);

export const RICH_RENDERERS: Partial<Record<string, Renderer>> = {
  mywave: ({step, project, theme}: RenderArgs) => MyWaveRichSection({step, project, theme}),
  ...dataDriven,
};
