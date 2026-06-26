export const cameraViews = {
  world: {
    position: [0.15, 3.35, 6.15],
    target: [0.25, 0.42, -0.08],
    zoom: 1.1
  },
  about: {
    position: [0.25, 2.1, 3.75],
    target: [0, 0.55, 0],
    zoom: 1.16
  },
  skills: {
    position: [-2.85, 1.62, 2.95],
    target: [-2.1, 0.55, 0.2],
    zoom: 1.2
  },
  projects: {
    position: [2.92, 1.68, 2.95],
    target: [2.05, 0.48, 0.15],
    zoom: 1.2
  },
  backend: {
    position: [2.45, 2.18, 1.12],
    target: [1.43, 0.62, -1.72],
    zoom: 1.22
  },
  game: {
    position: [-2.58, 1.62, 1.15],
    target: [-1.5, 0.48, -1.58],
    zoom: 1.22
  },
  growth: {
    position: [0, 1.55, 4.45],
    target: [0, 0.22, 2],
    zoom: 1.1
  },
  contact: {
    position: [0.28, 2.42, 1.82],
    target: [0.05, 0.9, -2.34],
    zoom: 1.26
  }
};

export function getCameraView(zoneId) {
  return cameraViews[zoneId] || cameraViews.world;
}
