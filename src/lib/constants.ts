import type {BuildingData, SectionMeta, Vector3Tuple} from "@/types/portfolio";

export const sectionMeta: SectionMeta[] = [
  {
    id: "intro",
    label: "Plaza",
    navLabel: "Intro",
    title: "중앙 광장",
    description: "포트폴리오 마을의 입구입니다. 정체성과 전체 탐색 흐름을 안내합니다."
  },
  {
    id: "projects",
    label: "Lab",
    navLabel: "Projects",
    title: "프로젝트 연구소",
    description: "대표 프로젝트와 맡은 역할, 구현 기능, 배운 점을 확인합니다."
  },
  {
    id: "github",
    label: "Workshop",
    navLabel: "Skills",
    title: "GitHub 작업실",
    description: "기술 스택과 코드 기록, 개발 방식이 모여 있는 공간입니다."
  },
  {
    id: "experience",
    label: "Archive",
    navLabel: "Archive",
    title: "기록관",
    description: "활동 기록과 성장 과정을 시간 순서로 정리합니다."
  },
  {
    id: "contact",
    label: "Post",
    navLabel: "Contact",
    title: "우체국",
    description: "이메일, GitHub, 블로그 링크를 통해 다음 협업으로 연결됩니다."
  }
];

export const villageBuildings: BuildingData[] = [
  {
    id: "central-plaza",
    sectionId: "intro",
    kind: "plaza",
    name: "중앙 광장",
    label: "Intro",
    description: "AI Portfolio Village의 시작점",
    position: [0, 0, 0],
    size: [2.45, 0.38, 2.45],
    color: "#f3dc9d",
    roofColor: "#8fcf68",
    accentColor: "#73b960"
  },
  {
    id: "project-lab",
    sectionId: "projects",
    kind: "lab",
    name: "프로젝트 연구소",
    label: "Projects",
    description: "대표 프로젝트를 연구 노트처럼 확인하는 공간",
    position: [-4.35, 0, -2.05],
    size: [2.25, 1.72, 2.05],
    color: "#f7e2b4",
    roofColor: "#e39d43",
    accentColor: "#5f7be8"
  },
  {
    id: "github-workshop",
    sectionId: "github",
    kind: "workshop",
    name: "GitHub 작업실",
    label: "Skills",
    description: "기술 스택과 코드 기록을 보는 개발자 작업실",
    position: [4.35, 0, -2.05],
    size: [2.18, 1.56, 2.05],
    color: "#d7ead8",
    roofColor: "#5cae74",
    accentColor: "#253342"
  },
  {
    id: "archive-library",
    sectionId: "experience",
    kind: "archive",
    name: "기록관",
    label: "Archive",
    description: "경험과 성장 과정을 보관하는 기록관",
    position: [-4.0, 0, 3.2],
    size: [2.15, 1.48, 1.95],
    color: "#e9ddf5",
    roofColor: "#9e78c7",
    accentColor: "#8b5a35"
  },
  {
    id: "post-office",
    sectionId: "contact",
    kind: "post",
    name: "우체국",
    label: "Contact",
    description: "연락처와 링크가 모인 우체국",
    position: [4.0, 0, 3.2],
    size: [2.05, 1.38, 1.88],
    color: "#ffe0c8",
    roofColor: "#e07055",
    accentColor: "#e8f2ff"
  }
];

export const treePositions: Vector3Tuple[] = [
  [-6.2, 0, -4.3],
  [-5.7, 0, 0.8],
  [-2.1, 0, -4.85],
  [1.8, 0, -4.65],
  [5.8, 0, 0.9],
  [6.1, 0, -4.15],
  [-6.0, 0, 5.15],
  [-0.3, 0, 5.35],
  [6.15, 0, 5.15],
  [0.95, 0, 2.75]
];

export const rockPositions: Vector3Tuple[] = [
  [-2.9, 0, 1.4],
  [-1.2, 0, -2.7],
  [2.6, 0, 1.6],
  [5.5, 0, 3.1],
  [-5.5, 0, -2.8],
  [1.2, 0, 4.5]
];

export const cameraTargets: Record<string, {position: Vector3Tuple; lookAt: Vector3Tuple}> = {
  intro: {position: [6.4, 6.0, 7.2], lookAt: [0, 0.45, 0]},
  projects: {position: [-7.0, 4.9, 3.1], lookAt: [-4.35, 0.85, -2.05]},
  github: {position: [7.0, 4.9, 3.1], lookAt: [4.35, 0.8, -2.05]},
  experience: {position: [-6.5, 4.8, 7.2], lookAt: [-4.0, 0.75, 3.2]},
  contact: {position: [6.5, 4.8, 7.2], lookAt: [4.0, 0.72, 3.2]}
};
