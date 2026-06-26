export const cameraTargets = {
  world: {
    position: [0.18, 3.1, 6.0],
    target: [0.1, 0.55, 0],
    zoom: 1.05
  },
  core: {
    position: [0.2, 2.2, 3.6],
    target: [0, 0.86, 0],
    zoom: 1.22
  },
  interface: {
    position: [-2.65, 1.75, 3.0],
    target: [-1.8, 0.65, 0.62],
    zoom: 1.2
  },
  works: {
    position: [2.85, 1.72, 2.95],
    target: [1.95, 0.62, 0.44],
    zoom: 1.2
  },
  systems: {
    position: [1.6, 1.45, 1.25],
    target: [0.82, 0.22, -1.55],
    zoom: 1.23
  },
  simulation: {
    position: [-2.65, 1.65, 1.38],
    target: [-1.72, 0.6, -1.18],
    zoom: 1.22
  },
  evolution: {
    position: [0, 1.38, 4.15],
    target: [0.05, 0.34, 1.9],
    zoom: 1.16
  },
  signal: {
    position: [0.28, 2.55, 1.75],
    target: [0.08, 1.24, -2.18],
    zoom: 1.26
  }
};

export function getCameraTarget(layerId) {
  return cameraTargets[layerId] || cameraTargets.world;
}
