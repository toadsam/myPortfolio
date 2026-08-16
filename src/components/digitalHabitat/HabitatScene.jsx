import React, {useEffect, useRef} from "react";
import * as THREE from "three";
import {RoomEnvironment} from "three/examples/jsm/environments/RoomEnvironment.js";
import {RoundedBoxGeometry} from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {animationConfig} from "./animationConfig";
import {getCameraTarget} from "./cameraTargets";
import {
  layerOrder,
  layers,
  projects,
  systemNodes,
  simulations
} from "./habitatData";

function vectorFromArray(value) {
  return new THREE.Vector3(value[0], value[1], value[2]);
}

function colorNumber(value) {
  return Number.parseInt(value.replace("#", ""), 16);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function seeded(index, salt) {
  const raw = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function makeMat(options) {
  return new THREE.MeshStandardMaterial({
    color: options.color,
    emissive: options.emissive || 0x000000,
    emissiveIntensity: options.emissiveIntensity || 0,
    metalness: options.metalness == null ? 0.22 : options.metalness,
    roughness: options.roughness == null ? 0.42 : options.roughness,
    transparent: !!options.transparent,
    opacity: options.opacity == null ? 1 : options.opacity,
    side: options.side || THREE.FrontSide,
    depthWrite: options.depthWrite == null ? true : options.depthWrite
  });
}

function makeBasic(color, opacity) {
  return new THREE.MeshBasicMaterial({
    color: color,
    transparent: opacity < 1,
    opacity: opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });
}

function makeGlowSprite(color, size, opacity) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.92)");
  gradient.addColorStop(0.18, "#" + color.toString(16).padStart(6, "0"));
  gradient.addColorStop(0.48, "rgba(56, 189, 248, 0.22)");
  gradient.addColorStop(1, "rgba(56, 189, 248, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  sprite.scale.set(size, size, 1);
  sprite.userData.screenTexture = texture;
  return sprite;
}

function roundedBox(
  width,
  height,
  depth,
  material,
  position,
  rotation,
  radius
) {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(
      width,
      height,
      depth,
      5,
      radius == null ? 0.035 : radius
    ),
    material
  );
  mesh.position.fromArray(position);
  if (rotation) {
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  }
  return mesh;
}

function makeTube(points, radius, material, segments) {
  const curve = new THREE.CatmullRomCurve3(points.map(vectorFromArray));
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, segments || 80, radius, 10, false),
    material
  );
  mesh.userData.curve = curve;
  return mesh;
}

function makeIrregularIsland(radiusX, radiusZ, depth, material, salt) {
  const shape = new THREE.Shape();
  const points = [];
  const count = 16;

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const wobble =
      0.84 + seeded(i, salt) * 0.24 + Math.sin(i * 1.7 + salt) * 0.045;
    const x = Math.cos(angle) * radiusX * wobble;
    const z = Math.sin(angle) * radiusZ * (0.9 + seeded(i, salt + 6) * 0.18);
    points.push(new THREE.Vector3(x, 0, z));
  }

  points.forEach(function draw(point, index) {
    if (index === 0) {
      shape.moveTo(point.x, point.z);
      return;
    }
    shape.lineTo(point.x, point.z);
  });
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.08,
    bevelThickness: 0.08
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.edgePoints = points;
  return mesh;
}

function makeIslandEdge(points, y, material) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(function toPoint(point) {
      return new THREE.Vector3(point.x, y, point.z);
    }),
    true
  );
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 180, 0.012, 8, true),
    material
  );
}

function makeScreenTexture(title, lines, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 432;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(8, 13, 28, 0.98)");
  gradient.addColorStop(0.52, "rgba(12, 23, 49, 0.96)");
  gradient.addColorStop(1, "rgba(3, 9, 22, 0.98)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(148, 163, 184, 0.16)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.fillStyle = accent;
  ctx.font = "800 38px Inter, Segoe UI, sans-serif";
  ctx.fillText(title, 52, 76);
  ctx.fillStyle = "rgba(248, 250, 252, 0.88)";
  ctx.font = "600 24px Inter, Segoe UI, sans-serif";
  lines.forEach(function drawLine(line, index) {
    ctx.fillText(line, 52, 140 + index * 42);
  });
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(52, 352);
  ctx.bezierCurveTo(160, 292, 240, 384, 344, 318);
  ctx.bezierCurveTo(454, 250, 544, 354, 690, 270);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makeScreen(title, lines, accent, position, rotation, scale) {
  const texture = makeScreenTexture(title, lines, accent);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.8), material);
  mesh.position.fromArray(position);
  mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  mesh.scale.setScalar(scale || 1);
  mesh.userData.screenTexture = texture;
  mesh.userData.baseY = mesh.position.y;
  return mesh;
}

function makePlate(width, depth, material, accentMaterial) {
  const group = new THREE.Group();
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.05, 7),
    material
  );
  const edge = new THREE.Mesh(
    new THREE.TorusGeometry(0.98, 0.012, 6, 7),
    accentMaterial
  );
  plate.scale.set(width, 1, depth);
  plate.rotation.y = Math.PI / 7;
  edge.scale.set(width, depth, 1);
  edge.rotation.x = Math.PI / 2;
  edge.rotation.z = Math.PI / 7;
  edge.position.y = 0.04;
  edge.userData.baseOpacity =
    accentMaterial.opacity == null ? 0.44 : accentMaterial.opacity;
  group.add(plate);
  group.add(edge);
  group.userData.edge = edge;
  return group;
}

function makeLabelSprite(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 520;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.roundRect(18, 24, 484, 72, 28);
  ctx.fillStyle = "rgba(8, 13, 28, 0.78)";
  ctx.fill();
  ctx.strokeStyle = "#" + color.toString(16).padStart(6, "0");
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "700 30px Inter, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 260, 60);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.98, 0.23, 1);
  return sprite;
}

function rememberMaterials(group) {
  const materials = [];
  group.traverse(function collect(node) {
    if (!node.material) {
      return;
    }
    const list = Array.isArray(node.material) ? node.material : [node.material];
    list.forEach(function each(material) {
      if (
        material.isMeshStandardMaterial &&
        materials.indexOf(material) === -1
      ) {
        material.userData.baseEmissive = material.emissiveIntensity || 0;
        materials.push(material);
      }
    });
  });
  return materials;
}

function registerLayer(world, layerId, group) {
  group.userData.baseY = group.position.y;
  group.userData.materials = rememberMaterials(group);
  world.layerGroups[layerId] = group;
}

function addHotspot(world, layer) {
  const point = vectorFromArray(layer.position);
  const color = colorNumber(layer.colorPair[1]);
  const marker = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.065, 2),
    makeBasic(color, 0.88)
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.23, 0.01, 8, 64),
    makeBasic(color, 0.34)
  );
  const label = makeLabelSprite(layer.nav + " / " + layer.subtitle, color);
  const markerGroup = new THREE.Group();
  const hotspot = new THREE.Mesh(
    new THREE.SphereGeometry(layer.hotspotRadius || 0.55, 18, 12),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false
    })
  );
  markerGroup.position.copy(point);
  markerGroup.userData.baseY = point.y;
  markerGroup.userData.marker = marker;
  markerGroup.userData.ring = ring;
  markerGroup.userData.label = label;
  ring.rotation.x = Math.PI / 2;
  label.position.y = 0.42;
  markerGroup.add(marker);
  markerGroup.add(ring);
  markerGroup.add(label);
  hotspot.position.copy(point);
  hotspot.userData.layerId = layer.id;
  world.markers[layer.id] = markerGroup;
  world.root.add(markerGroup);
  world.root.add(hotspot);
  world.interactiveMeshes.push(hotspot);
}

function addStudioShell(world, materials) {
  const group = new THREE.Group();
  const island = makeIrregularIsland(3.75, 2.08, 0.38, materials.islandTop, 22);
  const lowerIsland = makeIrregularIsland(
    3.12,
    1.72,
    0.22,
    materials.islandUnder,
    34
  );
  island.position.y = -0.38;
  lowerIsland.position.set(0.12, -0.78, -0.05);
  lowerIsland.scale.set(0.92, 1, 0.9);

  const edge = makeIslandEdge(
    island.userData.edgePoints,
    0.02,
    materials.islandEdge
  );
  const lowerEdge = makeIslandEdge(
    lowerIsland.userData.edgePoints,
    -0.56,
    materials.islandUnderEdge
  );
  lowerEdge.position.set(0.12, 0, -0.05);
  lowerEdge.scale.set(0.92, 1, 0.9);
  group.add(island);
  group.add(lowerIsland);
  group.add(edge);
  group.add(lowerEdge);
  world.animated.studioRibbons.push(edge);

  const glassPanels = [
    {
      position: [-1.72, 0.52, -1.18],
      rotation: [-0.04, 0.52, 0.03],
      width: 1.28
    },
    {
      position: [1.46, 0.58, -1.28],
      rotation: [-0.02, -0.42, -0.02],
      width: 1.42
    },
    {position: [0.26, 0.68, -1.72], rotation: [-0.04, 0.04, 0], width: 1.5}
  ];
  glassPanels.forEach(function addGlass(panel, index) {
    const wall = roundedBox(
      panel.width,
      0.68,
      0.035,
      materials.studioGlass.clone(),
      panel.position,
      panel.rotation,
      0.045
    );
    const rail = roundedBox(
      panel.width * 0.86,
      0.024,
      0.045,
      index === 1 ? materials.violetStrip : materials.cyanStrip,
      [panel.position[0], panel.position[1] + 0.28, panel.position[2] + 0.02],
      panel.rotation,
      0.008
    );
    group.add(wall);
    group.add(rail);
    world.animated.studioPanels.push(wall);
  });

  const screens = [
    makeScreen(
      "INTERFACE LAB",
      ["React states", "Motion systems", "Accessible flows"],
      "#22D3EE",
      [-1.48, 0.8, -0.98],
      [-0.08, 0.58, 0.02],
      0.58
    ),
    makeScreen(
      "PROJECT SIGNALS",
      ["MuscleUp", "Campus Foodmap", "TSEROF"],
      "#8B5CF6",
      [1.45, 0.86, -1.04],
      [-0.08, -0.48, -0.02],
      0.56
    ),
    makeScreen(
      "SYSTEM FLOW",
      ["Auth", "API", "Database", "Deploy"],
      "#00B4D8",
      [0.04, 0.96, -1.46],
      [-0.06, 0.02, 0],
      0.54
    )
  ];
  screens.forEach(function addScreen(screen) {
    group.add(screen);
    world.animated.studioScreens.push(screen);
  });

  const energyPaths = [
    [
      [-3.0, 0.02, 0.72],
      [-1.56, 0.12, 0.4],
      [-0.42, 0.14, 0.16],
      [0, 0.58, 0]
    ],
    [
      [2.94, 0.03, 0.48],
      [1.82, 0.14, 0.16],
      [0.68, 0.18, 0.08],
      [0, 0.58, 0]
    ],
    [
      [-0.8, 0.02, -1.72],
      [-0.32, 0.16, -0.76],
      [0.14, 0.22, -0.2],
      [0, 0.58, 0]
    ],
    [
      [1.2, 0.02, -1.58],
      [0.72, 0.15, -0.82],
      [0.28, 0.18, -0.22],
      [0, 0.58, 0]
    ]
  ];
  energyPaths.forEach(function addPath(points, index) {
    const path = makeTube(
      points,
      index % 2 ? 0.011 : 0.009,
      index % 2 ? materials.violetCable.clone() : materials.cyanCable.clone(),
      90
    );
    path.userData.phase = index * 0.37;
    group.add(path);
    world.animated.studioRibbons.push(path);
  });

  const workbench = roundedBox(
    1.18,
    0.08,
    0.42,
    materials.workbench,
    [-1.35, 0.11, 0.62],
    [0, 0.26, 0],
    0.035
  );
  const beaconBase = roundedBox(
    0.54,
    0.08,
    0.54,
    materials.assetPedestal,
    [2.08, 0.1, 0.98],
    [0, -0.18, 0],
    0.05
  );
  group.add(workbench);
  group.add(beaconBase);

  world.root.add(group);
  world.animated.studioShell = group;
}

function addAmbientFireflies(world) {
  for (let i = 0; i < 18; i += 1) {
    const color = i % 5 === 0 ? 0xfacc15 : i % 3 === 0 ? 0x8b5cf6 : 0x38bdf8;
    const fly = new THREE.Group();
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 + seeded(i, 90) * 0.028, 16, 10),
      makeBasic(color, 0.82)
    );
    const halo = makeGlowSprite(color, 0.42 + seeded(i, 91) * 0.26, 0.38);
    const light = new THREE.PointLight(color, 0.24 + seeded(i, 92) * 0.32, 1.9);
    fly.add(halo);
    fly.add(glow);
    fly.add(light);
    fly.userData.seed = seeded(i, 93) * Math.PI * 2;
    fly.userData.radius = 1.72 + seeded(i, 94) * 2.25;
    fly.userData.height = 0.38 + seeded(i, 95) * 1.7;
    fly.userData.speed = 0.08 + seeded(i, 96) * 0.12;
    world.animated.fireflies.push(fly);
    world.root.add(fly);
  }
}

function normalizeLoadedAsset(asset, targetSize) {
  const wrapper = new THREE.Group();
  const box = new THREE.Box3().setFromObject(asset);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  asset.scale.multiplyScalar(targetSize / maxAxis);
  box.setFromObject(asset);
  box.getCenter(center);
  box.getSize(size);
  asset.position.sub(center);
  asset.position.y += size.y / 2;
  wrapper.add(asset);
  return wrapper;
}

function applyPremiumAssetMaterials(model) {
  model.traverse(function apply(node) {
    if (!node.isMesh) {
      return;
    }
    node.castShadow = true;
    node.receiveShadow = true;
    if (node.material) {
      const list = Array.isArray(node.material)
        ? node.material
        : [node.material];
      list.forEach(function tune(material) {
        if (
          material.isMeshStandardMaterial ||
          material.isMeshPhysicalMaterial
        ) {
          material.envMapIntensity = 1.35;
          material.roughness = Math.min(
            material.roughness == null ? 0.42 : material.roughness,
            0.5
          );
          material.metalness = Math.max(
            material.metalness == null ? 0.18 : material.metalness,
            0.18
          );
        }
      });
    }
  });
}

function addAssetFallback(world, spec) {
  const wrapper = new THREE.Group();
  const color = colorNumber(spec.color);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.1, 8),
    makeMat({
      color: 0x0f172a,
      emissive: color,
      emissiveIntensity: 0.12,
      roughness: 0.26,
      metalness: 0.58
    })
  );
  const artifact = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.2, 3),
    makeMat({
      color: color,
      emissive: color,
      emissiveIntensity: 0.46,
      roughness: 0.22,
      metalness: 0.44
    })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.27, 0.01, 8, 72),
    makeBasic(color, 0.42)
  );
  artifact.position.y = 0.26;
  ring.position.y = 0.26;
  ring.rotation.x = Math.PI / 2;
  wrapper.add(base);
  wrapper.add(artifact);
  wrapper.add(ring);
  wrapper.position.fromArray(spec.position);
  wrapper.rotation.set(spec.rotation[0], spec.rotation[1], spec.rotation[2]);
  wrapper.userData.baseY = wrapper.position.y;
  wrapper.userData.spin = spec.spin || 0.006;
  world.root.add(wrapper);
  world.animated.loadedAssets.push(wrapper);
}

function loadPremiumAssets(world) {
  const loader = new GLTFLoader();
  loader.setCrossOrigin("anonymous");
  const specs = [
    {
      name: "PBR Core Artifact",
      url: "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
      position: [-1.34, 0.2, 0.63],
      rotation: [0.1, 0.72, -0.08],
      size: 0.46,
      color: "#38BDF8",
      spin: 0.002
    },
    {
      name: "Studio Assistant",
      url: "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb",
      position: [0.74, 0.16, -2.34],
      rotation: [0, -0.25, 0],
      size: 0.56,
      color: "#FACC15",
      spin: 0.001
    }
  ];

  specs.forEach(function loadSpec(spec) {
    loader.load(
      spec.url,
      function onLoad(gltf) {
        if (world.disposed) {
          return;
        }
        applyPremiumAssetMaterials(gltf.scene);
        const wrapper = normalizeLoadedAsset(gltf.scene, spec.size);
        wrapper.name = spec.name;
        wrapper.position.fromArray(spec.position);
        wrapper.rotation.set(
          spec.rotation[0],
          spec.rotation[1],
          spec.rotation[2]
        );
        wrapper.userData.baseY = wrapper.position.y;
        wrapper.userData.spin = spec.spin;
        world.root.add(wrapper);
        world.animated.loadedAssets.push(wrapper);

        if (gltf.animations && gltf.animations.length) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          const preferred =
            gltf.animations.find(function findIdle(clip) {
              return /idle|wave|dance/i.test(clip.name);
            }) || gltf.animations[0];
          mixer.clipAction(preferred).play();
          world.animated.assetMixers.push(mixer);
        }
      },
      undefined,
      function onError() {
        if (!world.disposed) {
          addAssetFallback(world, spec);
        }
      }
    );
  });
}

function addLivingCore(world, materials) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.68, 0.1, 72),
    materials.coreBase
  );
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.25, 0.72, 48),
    materials.coreColumn
  );
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.28, 4),
    materials.core
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 40, 28),
    materials.coreHalo
  );
  const rings = [
    new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.012, 10, 110),
      materials.coreRing
    ),
    new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.01, 10, 110),
      materials.coreRingAlt
    ),
    new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.008, 10, 110),
      materials.coreRingGold
    )
  ];

  base.position.y = 0.2;
  column.position.y = 0.62;
  core.position.y = 1.1;
  halo.position.copy(core.position);
  rings[0].position.y = 1.1;
  rings[1].position.y = 1.1;
  rings[2].position.y = 0.82;
  rings[0].rotation.x = Math.PI / 2;
  rings[1].rotation.y = Math.PI / 2.7;
  rings[2].rotation.x = Math.PI / 2;
  rings[2].rotation.z = Math.PI / 7;

  group.add(base);
  group.add(column);
  group.add(halo);
  group.add(core);
  rings.forEach(function addRing(ring) {
    group.add(ring);
  });

  const particleMaterial = makeBasic(0xf8fafc, 0.58);
  for (let i = 0; i < 24; i += 1) {
    const particle = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.016 + seeded(i, 2) * 0.018, 1),
      particleMaterial.clone()
    );
    particle.userData.seed = seeded(i, 3) * Math.PI * 2;
    particle.userData.radius = 0.42 + seeded(i, 4) * 0.38;
    particle.userData.height = 0.82 + seeded(i, 5) * 0.58;
    world.animated.coreParticles.push(particle);
    group.add(particle);
  }

  group.position.fromArray(layers[0].position);
  group.userData.core = core;
  group.userData.halo = halo;
  group.userData.rings = rings;
  world.root.add(group);
  world.animated.core = group;
  registerLayer(world, "core", group);
}

function addInterfaceLayer(world, materials) {
  const layer = layers.find(function findLayer(item) {
    return item.id === "interface";
  });
  const group = new THREE.Group();
  const plate = makePlate(
    0.9,
    0.58,
    materials.glassPlate,
    materials.interfaceLine.clone()
  );
  group.add(plate);

  const labFrame = roundedBox(
    1.0,
    0.055,
    0.055,
    materials.cyanStrip.clone(),
    [0, 0.68, -0.18],
    [0.02, 0, 0],
    0.012
  );
  const labLeft = roundedBox(
    0.055,
    0.46,
    0.055,
    materials.studioGlass.clone(),
    [-0.48, 0.46, -0.18],
    [0.02, 0, 0],
    0.014
  );
  const labRight = roundedBox(
    0.055,
    0.46,
    0.055,
    materials.studioGlass.clone(),
    [0.48, 0.46, -0.18],
    [0.02, 0, 0],
    0.014
  );
  group.add(labFrame);
  group.add(labLeft);
  group.add(labRight);

  const panelPositions = [
    [-0.42, 0.32, 0.08],
    [0.04, 0.48, -0.04],
    [0.42, 0.34, 0.1],
    [-0.06, 0.22, 0.28]
  ];
  panelPositions.forEach(function createPanel(pos, index) {
    const panel = roundedBox(
      0.42,
      0.2,
      0.032,
      index % 2 ? materials.interfacePanelMint : materials.interfacePanel,
      pos,
      [0.08, -0.18 + index * 0.12, 0],
      0.022
    );
    const chip = roundedBox(
      0.1,
      0.035,
      0.018,
      materials.interfaceChip,
      [pos[0] - 0.12, pos[1] + 0.012, pos[2] + 0.03],
      [0.08, -0.18 + index * 0.12, 0],
      0.01
    );
    const line = roundedBox(
      0.22,
      0.018,
      0.018,
      materials.interfaceScan,
      [pos[0] + 0.07, pos[1] - 0.035, pos[2] + 0.032],
      [0.08, -0.18 + index * 0.12, 0],
      0.006
    );
    panel.userData.seed = index;
    panel.userData.baseY = panel.position.y;
    world.animated.interfacePanels.push(panel);
    group.add(panel);
    group.add(chip);
    group.add(line);
  });

  const scan = roundedBox(
    0.86,
    0.012,
    0.018,
    materials.interfaceScan,
    [0, 0.58, 0.32],
    null,
    0.005
  );
  group.add(scan);
  group.userData.scan = scan;
  group.position.fromArray(layer.position);
  group.rotation.y = 0.18;
  world.root.add(group);
  registerLayer(world, "interface", group);
}

function addWorksLayer(world, materials) {
  const layer = layers.find(function findLayer(item) {
    return item.id === "works";
  });
  const group = new THREE.Group();
  const plate = makePlate(
    1.08,
    0.66,
    materials.glassPlate,
    materials.worksLine.clone()
  );
  group.add(plate);

  const galleryBack = roundedBox(
    1.1,
    0.38,
    0.035,
    materials.studioGlass.clone(),
    [0.05, 0.56, -0.24],
    [0.02, 0, 0],
    0.04
  );
  const galleryRail = roundedBox(
    1.0,
    0.026,
    0.04,
    materials.violetStrip.clone(),
    [0.05, 0.75, -0.22],
    [0.02, 0, 0],
    0.008
  );
  group.add(galleryBack);
  group.add(galleryRail);

  const positions = [
    [-0.42, 0.34, 0.12],
    [-0.14, 0.42, -0.06],
    [0.18, 0.34, 0.1],
    [0.48, 0.42, -0.05]
  ];
  projects.forEach(function createProject(project, index) {
    const mat =
      index === 0
        ? materials.projectMint
        : index === 1
        ? materials.projectGold
        : index === 2
        ? materials.projectBlue
        : materials.projectPink;
    const module = roundedBox(
      0.22,
      0.18,
      0.18,
      mat,
      positions[index],
      [0.22, 0.4 + index * 0.32, 0.18],
      0.04
    );
    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.006, 8, 48),
      mat.clone()
    );
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 0.08, 6),
      materials.assetPedestal.clone()
    );
    const miniPanel = roundedBox(
      0.24,
      0.05,
      0.018,
      mat.clone(),
      [
        positions[index][0],
        positions[index][1] - 0.16,
        positions[index][2] + 0.02
      ],
      null,
      0.012
    );
    orbit.position.copy(module.position);
    orbit.rotation.y = Math.PI / 2;
    plinth.position.set(
      positions[index][0],
      positions[index][1] - 0.16,
      positions[index][2]
    );
    plinth.rotation.y = index * 0.4;
    module.userData.seed = index;
    module.userData.baseY = module.position.y;
    module.userData.projectId = project.id;
    world.animated.projectModules.push(module);
    group.add(plinth);
    group.add(module);
    group.add(orbit);
    group.add(miniPanel);
  });

  group.position.fromArray(layer.position);
  group.rotation.y = -0.24;
  world.root.add(group);
  registerLayer(world, "works", group);
}

function addSystemLayer(world, materials) {
  const layer = layers.find(function findLayer(item) {
    return item.id === "systems";
  });
  const group = new THREE.Group();
  const plate = makePlate(
    1.14,
    0.72,
    materials.deepSystemPlate,
    materials.systemLine.clone()
  );
  group.add(plate);

  const rack = roundedBox(
    0.34,
    0.66,
    0.22,
    materials.apiNode.clone(),
    [-0.58, 0.52, -0.12],
    [0, 0.08, 0],
    0.04
  );
  group.add(rack);
  for (let i = 0; i < 5; i += 1) {
    const serverLine = roundedBox(
      0.26,
      0.026,
      0.026,
      materials.systemLed.clone(),
      [-0.58, 0.3 + i * 0.085, 0.02],
      [0, 0.08, 0],
      0.006
    );
    serverLine.userData.seed = i + 20;
    world.animated.systemLeds.push(serverLine);
    group.add(serverLine);
  }

  const nodePositions = [
    [-0.5, 0.3, 0.12],
    [-0.18, 0.42, -0.08],
    [0.18, 0.3, 0.1],
    [0.48, 0.42, -0.1],
    [0.08, 0.55, 0.28]
  ];
  systemNodes.forEach(function createSystemNode(node, index) {
    const isDb = index === 2;
    const mesh = isDb
      ? new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.18, 32),
          materials.dbCore
        )
      : roundedBox(
          0.22,
          0.13,
          0.16,
          index === 0 ? materials.authGate : materials.apiNode,
          nodePositions[index],
          null,
          0.035
        );
    if (isDb) {
      mesh.position.fromArray(nodePositions[index]);
    }
    const led = roundedBox(
      0.05,
      0.018,
      0.018,
      materials.systemLed,
      [
        nodePositions[index][0],
        nodePositions[index][1] + 0.085,
        nodePositions[index][2] + 0.09
      ],
      null,
      0.006
    );
    led.userData.seed = index;
    mesh.userData.baseY = mesh.position.y;
    mesh.userData.seed = index;
    world.animated.systemNodes.push(mesh);
    world.animated.systemLeds.push(led);
    group.add(mesh);
    group.add(led);
  });

  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 0.22);
  shieldShape.bezierCurveTo(0.18, 0.18, 0.24, 0.08, 0.22, -0.04);
  shieldShape.bezierCurveTo(0.18, -0.22, 0.05, -0.32, 0, -0.36);
  shieldShape.bezierCurveTo(-0.05, -0.32, -0.18, -0.22, -0.22, -0.04);
  shieldShape.bezierCurveTo(-0.24, 0.08, -0.18, 0.18, 0, 0.22);
  const shield = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shieldShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.01,
      bevelThickness: 0.01
    }),
    materials.securityShield
  );
  shield.position.set(0.56, 0.62, 0.12);
  shield.rotation.y = -0.45;
  shield.scale.setScalar(0.62);
  group.add(shield);
  group.userData.shield = shield;

  group.position.fromArray(layer.position);
  group.rotation.y = -0.05;
  world.root.add(group);
  registerLayer(world, "systems", group);
}

function addSimulationLayer(world, materials) {
  const layer = layers.find(function findLayer(item) {
    return item.id === "simulation";
  });
  const group = new THREE.Group();
  const plate = makePlate(
    0.96,
    0.7,
    materials.simPlate,
    materials.simLine.clone()
  );
  group.add(plate);

  const room = roundedBox(
    0.62,
    0.46,
    0.46,
    materials.simChamber,
    [0, 0.52, 0],
    null,
    0.035
  );
  room.material.wireframe = true;
  const portalOuter = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.024, 10, 92),
    materials.simLine.clone()
  );
  const portalInner = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.011, 8, 92),
    materials.projectPink.clone()
  );
  const marker = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.27, 4),
    materials.arMarker
  );
  const target = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.11, 1),
    materials.targetPink
  );
  const headset = roundedBox(
    0.34,
    0.14,
    0.16,
    materials.xrHeadset,
    [0.44, 0.42, 0.12],
    [0, -0.22, 0],
    0.038
  );
  portalOuter.position.set(0, 0.54, -0.1);
  portalInner.position.copy(portalOuter.position);
  portalOuter.rotation.y = Math.PI / 2;
  portalInner.rotation.y = Math.PI / 2;
  marker.position.set(-0.36, 0.3, 0.16);
  marker.rotation.x = Math.PI / 2;
  target.position.set(-0.08, 0.6, -0.12);
  target.userData.baseY = target.position.y;
  world.animated.portalRings.push(portalOuter);
  world.animated.portalRings.push(portalInner);
  group.add(room);
  group.add(portalOuter);
  group.add(portalInner);
  group.add(marker);
  group.add(target);
  group.add(headset);
  group.userData.room = room;
  group.userData.target = target;

  simulations.forEach(function addSim(sim, index) {
    const node = roundedBox(
      0.16,
      0.05,
      0.05,
      index === 1 ? materials.projectPink : materials.projectBlue,
      [-0.32 + index * 0.28, 0.18, -0.32],
      null,
      0.015
    );
    group.add(node);
  });

  group.position.fromArray(layer.position);
  group.rotation.y = 0.28;
  world.root.add(group);
  registerLayer(world, "simulation", group);
}

function addEvolutionLayer(world, materials) {
  const layer = layers.find(function findLayer(item) {
    return item.id === "evolution";
  });
  const group = new THREE.Group();
  const stream = makeTube(
    [
      [-1.35, 0.18, 0],
      [-0.76, 0.28, 0.18],
      [-0.18, 0.2, -0.08],
      [0.48, 0.3, 0.12],
      [1.38, 0.22, -0.04]
    ],
    0.024,
    materials.evolutionStream,
    96
  );
  group.add(stream);

  for (let i = 0; i < 7; i += 1) {
    const x = -1.28 + i * 0.43;
    const node = roundedBox(
      0.08,
      0.13,
      0.08,
      i % 2 ? materials.evolutionMint : materials.evolutionLife,
      [x, 0.35 + Math.sin(i) * 0.04, Math.sin(i * 1.6) * 0.16],
      null,
      0.025
    );
    node.userData.seed = i;
    node.userData.baseY = node.position.y;
    world.animated.evolutionNodes.push(node);
    group.add(node);
  }
  group.position.fromArray(layer.position);
  world.root.add(group);
  registerLayer(world, "evolution", group);
}

function addSignalLayer(world, materials) {
  const layer = layers.find(function findLayer(item) {
    return item.id === "signal";
  });
  const group = new THREE.Group();
  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.16, 3),
    materials.signalOrb
  );
  const satellite = roundedBox(
    0.26,
    0.08,
    0.16,
    materials.signalBody,
    [0.34, 0.08, 0.02],
    [0.1, -0.28, 0],
    0.025
  );
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.022, 0.62, 18),
    materials.signalMast
  );
  const waveA = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.006, 8, 72),
    materials.signalWave
  );
  const waveB = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.005, 8, 72),
    materials.signalWave
  );
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.052, 1.34, 24, 1, true),
    materials.signalWave.clone()
  );
  const dish = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.1, 40, 1, true),
    materials.studioGlass.clone()
  );
  orb.position.y = 0.38;
  mast.position.y = 0.05;
  beam.position.y = 0.9;
  beam.material.opacity = 0.22;
  dish.position.set(0.04, 0.34, 0);
  dish.rotation.x = Math.PI;
  waveA.position.copy(orb.position);
  waveB.position.copy(orb.position);
  waveA.rotation.x = Math.PI / 2;
  waveB.rotation.x = Math.PI / 2;
  group.add(mast);
  group.add(beam);
  group.add(dish);
  group.add(orb);
  group.add(satellite);
  group.add(waveA);
  group.add(waveB);
  group.userData.orb = orb;
  group.userData.waves = [waveA, waveB];
  group.position.fromArray(layer.position);
  world.root.add(group);
  registerLayer(world, "signal", group);
}

function addDataLines(world, materials) {
  layers.forEach(function createLine(layer) {
    if (layer.id === "core") {
      return;
    }
    const color = colorNumber(layer.colorPair[1]);
    const material = makeMat({
      color: color,
      emissive: color,
      emissiveIntensity: 0.62,
      transparent: true,
      opacity: 0.16,
      roughness: 0.24
    });
    const line = makeTube(
      [
        [0, 0.92, 0],
        [layer.position[0] * 0.34, 0.72, layer.position[2] * 0.32],
        [layer.position[0] * 0.72, 0.62, layer.position[2] * 0.72],
        [layer.position[0], layer.position[1] + 0.05, layer.position[2]]
      ],
      0.008,
      material,
      88
    );
    const pulse = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.032, 1),
      makeBasic(color, 0.54)
    );
    line.userData.layerId = layer.id;
    world.lines[layer.id] = line;
    world.animated.dataPulses.push({
      curve: line.userData.curve,
      mesh: pulse,
      layerId: layer.id,
      phase: seeded(layer.id.length, 30)
    });
    world.root.add(line);
    world.root.add(pulse);
  });
}

function createMaterials() {
  return {
    islandTop: makeMat({
      color: 0x050816,
      emissive: 0x0b2444,
      emissiveIntensity: 0.05,
      roughness: 0.66,
      metalness: 0.18
    }),
    islandUnder: makeMat({
      color: 0x020617,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.06,
      roughness: 0.72,
      metalness: 0.16
    }),
    islandEdge: makeMat({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.2
    }),
    islandUnderEdge: makeMat({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.48,
      transparent: true,
      opacity: 0.25,
      roughness: 0.2
    }),
    studioGlass: makeMat({
      color: 0x0b1020,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.23,
      roughness: 0.05,
      metalness: 0.42,
      side: THREE.DoubleSide
    }),
    workbench: makeMat({
      color: 0x101827,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.07,
      roughness: 0.28,
      metalness: 0.62
    }),
    assetPedestal: makeMat({
      color: 0x0f172a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.1,
      roughness: 0.24,
      metalness: 0.56
    }),
    cyanStrip: makeMat({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.64
    }),
    violetStrip: makeMat({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.58
    }),
    cyanCable: makeMat({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.72,
      transparent: true,
      opacity: 0.32
    }),
    violetCable: makeMat({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 0.68,
      transparent: true,
      opacity: 0.28
    }),
    glassPlate: makeMat({
      color: 0x0b1020,
      emissive: 0x111827,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.58,
      roughness: 0.18,
      metalness: 0.28
    }),
    deepSystemPlate: makeMat({
      color: 0x07112a,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.55,
      roughness: 0.22,
      metalness: 0.36
    }),
    simPlate: makeMat({
      color: 0x130b24,
      emissive: 0xa855f7,
      emissiveIntensity: 0.05,
      transparent: true,
      opacity: 0.5,
      roughness: 0.2,
      metalness: 0.28
    }),
    coreBase: makeMat({
      color: 0x111827,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.12,
      roughness: 0.34,
      metalness: 0.55
    }),
    coreColumn: makeMat({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.14,
      transparent: true,
      opacity: 0.16,
      roughness: 0.08
    }),
    core: makeMat({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.05,
      roughness: 0.16
    }),
    coreHalo: makeMat({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.48,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    }),
    coreRing: makeMat({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.72
    }),
    coreRingAlt: makeMat({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.95,
      transparent: true,
      opacity: 0.66
    }),
    coreRingGold: makeMat({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.5
    }),
    interfaceLine: makeMat({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.48
    }),
    interfacePanel: makeMat({
      color: 0x0f2740,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.26,
      transparent: true,
      opacity: 0.74,
      roughness: 0.16
    }),
    interfacePanelMint: makeMat({
      color: 0x0d2f35,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.24,
      transparent: true,
      opacity: 0.72,
      roughness: 0.16
    }),
    interfaceChip: makeMat({
      color: 0xf8fafc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.7
    }),
    interfaceScan: makeMat({
      color: 0x2dd4bf,
      emissive: 0x2dd4bf,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.8
    }),
    worksLine: makeMat({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.95,
      transparent: true,
      opacity: 0.5
    }),
    projectMint: makeMat({
      color: 0x22d3ee,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.32,
      transparent: true,
      opacity: 0.76
    }),
    projectGold: makeMat({
      color: 0x38bdf8,
      emissive: 0xfacc15,
      emissiveIntensity: 0.26,
      transparent: true,
      opacity: 0.74
    }),
    projectBlue: makeMat({
      color: 0x8b5cf6,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.76
    }),
    projectPink: makeMat({
      color: 0xa855f7,
      emissive: 0xec4899,
      emissiveIntensity: 0.32,
      transparent: true,
      opacity: 0.74
    }),
    systemLine: makeMat({
      color: 0x00b4d8,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.95,
      transparent: true,
      opacity: 0.5
    }),
    apiNode: makeMat({
      color: 0x1e3a8a,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.24,
      roughness: 0.32,
      metalness: 0.5
    }),
    authGate: makeMat({
      color: 0x0f2740,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.3,
      roughness: 0.28,
      metalness: 0.5
    }),
    dbCore: makeMat({
      color: 0x0f172a,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.42,
      roughness: 0.24,
      metalness: 0.48
    }),
    systemLed: makeMat({
      color: 0x7dd3fc,
      emissive: 0x00b4d8,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.8
    }),
    securityShield: makeMat({
      color: 0x00b4d8,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.42,
      transparent: true,
      opacity: 0.48
    }),
    simLine: makeMat({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.5
    }),
    simChamber: makeMat({
      color: 0x8b5cf6,
      emissive: 0xa855f7,
      emissiveIntensity: 0.42,
      transparent: true,
      opacity: 0.42
    }),
    arMarker: makeBasic(0x38bdf8, 0.52),
    targetPink: makeMat({
      color: 0xec4899,
      emissive: 0xec4899,
      emissiveIntensity: 0.82,
      transparent: true,
      opacity: 0.82
    }),
    xrHeadset: makeMat({
      color: 0x151225,
      emissive: 0xa855f7,
      emissiveIntensity: 0.16,
      roughness: 0.28,
      metalness: 0.5
    }),
    evolutionStream: makeMat({
      color: 0x34d399,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.72,
      transparent: true,
      opacity: 0.62
    }),
    evolutionMint: makeMat({
      color: 0x2dd4bf,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.5
    }),
    evolutionLife: makeMat({
      color: 0x34d399,
      emissive: 0x34d399,
      emissiveIntensity: 0.48
    }),
    signalOrb: makeMat({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.35,
      roughness: 0.16
    }),
    signalBody: makeMat({
      color: 0x111827,
      emissive: 0xfacc15,
      emissiveIntensity: 0.18,
      roughness: 0.3,
      metalness: 0.58
    }),
    signalMast: makeMat({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.26,
      roughness: 0.24,
      metalness: 0.6
    }),
    signalWave: makeMat({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0.65,
      transparent: true,
      opacity: 0.5
    })
  };
}

function createHabitat(scene) {
  const world = {
    root: new THREE.Group(),
    disposed: false,
    interactiveMeshes: [],
    markers: {},
    lines: {},
    layerGroups: {},
    animated: {
      core: null,
      coreParticles: [],
      studioShell: null,
      studioPanels: [],
      studioScreens: [],
      studioRibbons: [],
      fireflies: [],
      loadedAssets: [],
      assetMixers: [],
      interfacePanels: [],
      projectModules: [],
      systemNodes: [],
      systemLeds: [],
      portalRings: [],
      evolutionNodes: [],
      dataPulses: [],
      particles: null
    }
  };
  const materials = createMaterials();
  const colorPairs = {
    core: ["#38BDF8", "#F8FAFC"],
    interface: ["#22D3EE", "#2DD4BF"],
    works: ["#8B5CF6", "#38BDF8"],
    systems: ["#1E3A8A", "#00B4D8"],
    simulation: ["#A855F7", "#EC4899"],
    evolution: ["#34D399", "#2DD4BF"],
    signal: ["#E0F2FE", "#FACC15"]
  };
  layers.forEach(function addColorPair(layer) {
    layer.colorPair = colorPairs[layer.id];
  });
  scene.add(world.root);
  addStudioShell(world, materials);
  addDataLines(world, materials);
  addLivingCore(world, materials);
  addInterfaceLayer(world, materials);
  addWorksLayer(world, materials);
  addSystemLayer(world, materials);
  addSimulationLayer(world, materials);
  addEvolutionLayer(world, materials);
  addSignalLayer(world, materials);
  addAmbientFireflies(world);

  layers.forEach(function prepareHotspot(layer) {
    layer.hotspotRadius =
      layer.id === "evolution" ? 0.88 : layer.id === "works" ? 0.72 : 0.62;
    addHotspot(world, layer);
  });

  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 230;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const angle = seeded(i, 80) * Math.PI * 2;
    const radius = 2.1 + seeded(i, 81) * 3.4;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = -0.4 + seeded(i, 82) * 3.35;
    positions[i * 3 + 2] = Math.sin(angle) * radius * 0.72;
  }
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  world.animated.particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.022,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    })
  );
  scene.add(world.animated.particles);

  world.root.traverse(function applyShadows(node) {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return world;
}

function HabitatScene(props) {
  const {activeLayer, hoveredLayer, onHoverLayer, onSelectLayer} = props;
  const mountRef = useRef(null);
  const activeRef = useRef(activeLayer);
  const hoverRef = useRef(hoveredLayer);
  const onHoverRef = useRef(onHoverLayer);
  const onSelectRef = useRef(onSelectLayer);

  useEffect(
    function syncActive() {
      activeRef.current = activeLayer;
    },
    [activeLayer]
  );

  useEffect(
    function syncHover() {
      hoverRef.current = hoveredLayer;
    },
    [hoveredLayer]
  );

  useEffect(
    function syncHandlers() {
      onHoverRef.current = onHoverLayer;
      onSelectRef.current = onSelectLayer;
    },
    [onHoverLayer, onSelectLayer]
  );

  useEffect(function mountScene() {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050816, 0.034);

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvironment = new RoomEnvironment();
    const environmentTexture = pmremGenerator.fromScene(
      roomEnvironment,
      0.04
    ).texture;
    scene.environment = environmentTexture;

    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 120);
    const defaultTarget = getCameraTarget("world");
    camera.position.fromArray(defaultTarget.position);
    camera.zoom = defaultTarget.zoom;
    camera.updateProjectionMatrix();

    const currentTarget = vectorFromArray(defaultTarget.target);
    const desiredPosition = vectorFromArray(defaultTarget.position);
    const desiredTarget = vectorFromArray(defaultTarget.target);
    const orbitPosition = new THREE.Vector3();
    const orbitOffset = new THREE.Vector3();
    const orbitSpherical = new THREE.Spherical();

    const ambient = new THREE.HemisphereLight(0x94a3b8, 0x050816, 0.54);
    const key = new THREE.DirectionalLight(0xe0f2fe, 1.75);
    const cyan = new THREE.PointLight(0x38bdf8, 1.65, 8);
    const violet = new THREE.PointLight(0x8b5cf6, 1.45, 7.5);
    const mint = new THREE.PointLight(0x2dd4bf, 0.95, 6);
    key.position.set(-3.8, 5.8, 4.8);
    key.castShadow = true;
    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    cyan.position.set(-2.4, 2.1, 2.4);
    violet.position.set(2.6, 1.7, 1.5);
    mint.position.set(0, 1.6, -2.2);
    scene.add(ambient);
    scene.add(key);
    scene.add(cyan);
    scene.add(violet);
    scene.add(mint);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      0.26,
      0.48,
      0.88
    );
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    const world = createHabitat(scene);
    loadPremiumAssets(world);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(10, 10);
    const tempScale = new THREE.Vector3();
    const orbitState = {
      yaw: 0,
      pitch: 0,
      zoom: 1,
      targetYaw: 0,
      targetPitch: 0,
      targetZoom: 1
    };
    const dragState = {
      isDown: false,
      isDragging: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0
    };
    let activeHover = "";
    let frame = 0;
    let previousElapsed = 0;

    function resize() {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      bloomPass.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function setHover(next) {
      if (next === activeHover) {
        return;
      }
      activeHover = next;
      hoverRef.current = next;
      mount.classList.toggle("is-hovering-layer", !!next);
      onHoverRef.current(next);
    }

    function updatePointerFromEvent(event) {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function updateHoverFromPointer() {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(world.interactiveMeshes, false);
      setHover(hits.length ? hits[0].object.userData.layerId : "");
    }

    function pointerMove(event) {
      updatePointerFromEvent(event);

      if (dragState.isDown) {
        const movementX = event.clientX - dragState.lastX;
        const movementY = event.clientY - dragState.lastY;
        const totalX = event.clientX - dragState.startX;
        const totalY = event.clientY - dragState.startY;
        const totalDistance = Math.sqrt(totalX * totalX + totalY * totalY);

        dragState.lastX = event.clientX;
        dragState.lastY = event.clientY;

        if (!dragState.isDragging && totalDistance > 4) {
          dragState.isDragging = true;
          mount.classList.add("is-dragging-world");
          setHover("");
        }

        if (dragState.isDragging) {
          orbitState.targetYaw -= movementX * 0.0042;
          orbitState.targetPitch = clamp(
            orbitState.targetPitch + movementY * 0.0032,
            -0.5,
            0.58
          );
          event.preventDefault();
          return;
        }
      }

      updateHoverFromPointer();
    }

    function pointerLeave() {
      if (!dragState.isDown) {
        pointer.set(10, 10);
        setHover("");
      }
    }

    function pointerDown(event) {
      if (event.button != null && event.button !== 0) {
        return;
      }
      dragState.isDown = true;
      dragState.isDragging = false;
      dragState.pointerId = event.pointerId;
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;
      dragState.lastX = event.clientX;
      dragState.lastY = event.clientY;
      updatePointerFromEvent(event);
      if (mount.setPointerCapture && event.pointerId != null) {
        mount.setPointerCapture(event.pointerId);
      }
    }

    function pointerUp(event) {
      if (!dragState.isDown) {
        return;
      }

      if (mount.releasePointerCapture && dragState.pointerId != null) {
        try {
          mount.releasePointerCapture(dragState.pointerId);
        } catch (error) {
          // Pointer capture may already be released by the browser.
        }
      }

      updatePointerFromEvent(event);
      if (!dragState.isDragging) {
        updateHoverFromPointer();
      }

      if (!dragState.isDragging && activeHover) {
        onSelectRef.current(activeHover);
      }
      dragState.isDown = false;
      dragState.isDragging = false;
      dragState.pointerId = null;
      mount.classList.remove("is-dragging-world");
    }

    function pointerCancel() {
      dragState.isDown = false;
      dragState.isDragging = false;
      dragState.pointerId = null;
      mount.classList.remove("is-dragging-world");
      pointer.set(10, 10);
      setHover("");
    }

    function wheel(event) {
      event.preventDefault();
      const zoomFactor = Math.exp(-event.deltaY * 0.0012);
      orbitState.targetZoom = clamp(
        orbitState.targetZoom * zoomFactor,
        0.58,
        1.9
      );
    }

    function updateMaterialGlow(group, amount) {
      if (!group.userData.materials) {
        return;
      }
      group.userData.materials.forEach(function update(material) {
        const base = material.userData.baseEmissive || 0;
        material.emissiveIntensity +=
          (base + amount - material.emissiveIntensity) * 0.12;
      });
    }

    function animate(time) {
      const elapsed = time * 0.001;
      const delta = Math.min(
        0.05,
        previousElapsed ? elapsed - previousElapsed : 0.016
      );
      previousElapsed = elapsed;
      const selected = activeRef.current;
      const cam = getCameraTarget(selected || "world");
      desiredPosition.fromArray(cam.position);
      desiredTarget.fromArray(cam.target);
      orbitState.yaw += (orbitState.targetYaw - orbitState.yaw) * 0.12;
      orbitState.pitch += (orbitState.targetPitch - orbitState.pitch) * 0.12;
      orbitState.zoom += (orbitState.targetZoom - orbitState.zoom) * 0.12;

      world.root.position.y =
        Math.sin(elapsed * animationConfig.ambientFloatSpeed) * 0.045;
      world.root.rotation.y = Math.sin(elapsed * 0.14) * 0.04;

      if (world.animated.studioShell) {
        world.animated.studioShell.rotation.y =
          Math.sin(elapsed * 0.11) * 0.018;
      }

      world.animated.studioPanels.forEach(function animateStudioPanel(
        panel,
        index
      ) {
        if (panel.userData.baseY == null) {
          panel.userData.baseY = panel.position.y;
        }
        panel.position.y =
          panel.userData.baseY + Math.sin(elapsed * 0.9 + index * 1.4) * 0.012;
        panel.material.opacity =
          0.18 + (Math.sin(elapsed * 1.1 + index) * 0.5 + 0.5) * 0.08;
      });

      world.animated.studioScreens.forEach(function animateScreen(
        screen,
        index
      ) {
        screen.position.y =
          screen.userData.baseY + Math.sin(elapsed * 0.85 + index) * 0.018;
        screen.material.opacity =
          0.78 + (Math.sin(elapsed * 1.25 + index) * 0.5 + 0.5) * 0.16;
      });

      world.animated.studioRibbons.forEach(function animateRibbon(
        ribbon,
        index
      ) {
        if (ribbon.material && ribbon.material.opacity != null) {
          ribbon.material.opacity =
            0.18 + (Math.sin(elapsed * 1.05 + index) * 0.5 + 0.5) * 0.36;
        }
      });

      world.animated.fireflies.forEach(function animateFirefly(fly, index) {
        const angle =
          fly.userData.seed +
          elapsed * fly.userData.speed +
          Math.sin(elapsed * 0.17 + index) * 0.3;
        const radius =
          fly.userData.radius + Math.sin(elapsed * 0.23 + index) * 0.24;
        fly.position.set(
          Math.cos(angle) * radius,
          fly.userData.height + Math.sin(elapsed * 0.75 + index) * 0.3,
          Math.sin(angle * 0.92) * radius * 0.58
        );
        const breathe = Math.sin(elapsed * 1.8 + index * 0.7) * 0.5 + 0.5;
        fly.scale.setScalar(0.72 + breathe * 0.62);
        fly.children.forEach(function updateChild(child) {
          if (child.isPointLight) {
            child.intensity = 0.16 + breathe * 0.42;
          }
        });
      });

      world.animated.assetMixers.forEach(function updateMixer(mixer) {
        mixer.update(delta);
      });

      world.animated.loadedAssets.forEach(function animateLoadedAsset(
        asset,
        index
      ) {
        asset.position.y =
          asset.userData.baseY + Math.sin(elapsed * 0.72 + index) * 0.025;
        asset.rotation.y += asset.userData.spin || 0.0015;
      });

      if (world.animated.core) {
        const core = world.animated.core.userData.core;
        const halo = world.animated.core.userData.halo;
        const rings = world.animated.core.userData.rings;
        const pulse =
          1 + Math.sin(elapsed * animationConfig.corePulseSpeed) * 0.085;
        core.scale.setScalar(pulse);
        halo.scale.setScalar(1.02 + Math.sin(elapsed * 2.05) * 0.075);
        halo.material.opacity =
          0.055 + (Math.sin(elapsed * 2.05) * 0.5 + 0.5) * 0.055;
        rings[0].rotation.z += 0.009;
        rings[1].rotation.x += 0.007;
        rings[2].rotation.z -= 0.005;
      }

      world.animated.coreParticles.forEach(function animateCoreParticle(
        particle,
        index
      ) {
        const angle = elapsed * (0.45 + index * 0.004) + particle.userData.seed;
        particle.position.set(
          Math.cos(angle) * particle.userData.radius,
          particle.userData.height + Math.sin(elapsed * 1.1 + index) * 0.035,
          Math.sin(angle) * particle.userData.radius * 0.72
        );
      });

      world.animated.interfacePanels.forEach(function animatePanel(
        panel,
        index
      ) {
        panel.position.y =
          panel.userData.baseY + Math.sin(elapsed * 1.25 + index) * 0.018;
        panel.rotation.z = Math.sin(elapsed * 0.8 + index) * 0.012;
      });

      if (
        world.layerGroups.interface &&
        world.layerGroups.interface.userData.scan
      ) {
        const scan = world.layerGroups.interface.userData.scan;
        scan.position.x = Math.sin(elapsed * 1.2) * 0.24;
      }

      world.animated.projectModules.forEach(function animateProject(
        module,
        index
      ) {
        module.position.y =
          module.userData.baseY + Math.sin(elapsed * 1.45 + index) * 0.038;
        module.rotation.y += 0.008 + index * 0.001;
      });

      world.animated.systemNodes.forEach(function animateSystemNode(
        node,
        index
      ) {
        node.position.y += Math.sin(elapsed * 1.7 + index) * 0.0006;
      });

      world.animated.systemLeds.forEach(function animateLed(led, index) {
        const blink =
          Math.sin(elapsed * (2.9 + index * 0.2) + led.userData.seed) * 0.5 +
          0.5;
        led.material.opacity = 0.36 + blink * 0.54;
        led.material.emissiveIntensity = 0.7 + blink * 1.0;
      });

      if (
        world.layerGroups.simulation &&
        world.layerGroups.simulation.userData.target
      ) {
        const target = world.layerGroups.simulation.userData.target;
        target.position.y =
          target.userData.baseY + Math.sin(elapsed * 1.8) * 0.055;
        target.rotation.y += 0.018;
        world.layerGroups.simulation.userData.room.rotation.y += 0.004;
      }

      world.animated.portalRings.forEach(function animatePortal(ring, index) {
        ring.rotation.z += index ? -0.014 : 0.018;
        ring.scale.setScalar(1 + Math.sin(elapsed * 1.7 + index) * 0.045);
        ring.material.opacity =
          0.42 + (Math.sin(elapsed * 1.5 + index) * 0.5 + 0.5) * 0.26;
      });

      world.animated.evolutionNodes.forEach(function animateEvolution(
        node,
        index
      ) {
        node.position.y =
          node.userData.baseY + Math.sin(elapsed * 1.35 + index) * 0.03;
        node.scale.setScalar(1 + Math.sin(elapsed * 1.8 + index) * 0.08);
      });

      if (world.layerGroups.signal) {
        const signal = world.layerGroups.signal;
        const orb = signal.userData.orb;
        const waves = signal.userData.waves;
        orb.scale.setScalar(1 + Math.sin(elapsed * 2.0) * 0.1);
        waves.forEach(function animateWave(wave, index) {
          wave.scale.setScalar(
            1 + (Math.sin(elapsed * 1.4 + index) * 0.5 + 0.5) * 0.18
          );
          wave.material.opacity =
            0.22 + (Math.sin(elapsed * 1.4 + index) * 0.5 + 0.5) * 0.32;
        });
      }

      world.animated.dataPulses.forEach(function animatePulse(item, index) {
        const isActive = selected === item.layerId;
        const isHover =
          activeHover === item.layerId || hoverRef.current === item.layerId;
        const t =
          (elapsed * (isActive ? 0.22 : 0.12) + item.phase + index * 0.03) % 1;
        item.mesh.position.copy(item.curve.getPointAt(t));
        item.mesh.material.opacity = isActive ? 0.96 : isHover ? 0.72 : 0.34;
        item.mesh.scale.setScalar(isActive ? 1.34 : isHover ? 1.12 : 0.84);
      });

      if (world.animated.particles) {
        world.animated.particles.rotation.y += 0.00075;
        world.animated.particles.rotation.x = Math.sin(elapsed * 0.16) * 0.07;
      }

      layerOrder.forEach(function updateLayer(layerId) {
        const marker = world.markers[layerId];
        const group = world.layerGroups[layerId];
        const isActive = selected === layerId;
        const isHover = activeHover === layerId || hoverRef.current === layerId;
        const scale = isActive
          ? animationConfig.activeScale
          : isHover
          ? animationConfig.hoverScale
          : 1;
        if (group) {
          const baseY = group.userData.baseY || 0;
          group.position.y =
            baseY +
            Math.sin(elapsed * 1.5 + layerId.length) *
              (isActive ? 0.065 : isHover ? 0.045 : 0.018);
          group.scale.lerp(tempScale.set(scale, scale, scale), 0.1);
          updateMaterialGlow(group, isActive ? 0.22 : isHover ? 0.13 : 0);
          if (
            group.children[0] &&
            group.children[0].userData &&
            group.children[0].userData.edge
          ) {
            const edge = group.children[0].userData.edge;
            edge.material.opacity +=
              ((isActive
                ? 0.85
                : isHover
                ? 0.64
                : edge.userData.baseOpacity || 0.42) -
                edge.material.opacity) *
              0.12;
            edge.rotation.z += isActive || isHover ? 0.01 : 0.003;
          }
        }
        if (marker) {
          marker.position.y =
            marker.userData.baseY +
            Math.sin(elapsed * 1.2 + layerId.length) * 0.025;
          marker.userData.ring.rotation.z +=
            isActive || isHover ? 0.018 : 0.006;
          marker.userData.marker.material.opacity +=
            ((isActive ? 1 : isHover ? 0.9 : 0.42) -
              marker.userData.marker.material.opacity) *
            0.12;
          marker.userData.ring.material.opacity +=
            ((isActive ? 0.86 : isHover ? 0.62 : 0.22) -
              marker.userData.ring.material.opacity) *
            0.12;
          marker.userData.label.material.opacity +=
            ((isActive || isHover ? 0.96 : 0) -
              marker.userData.label.material.opacity) *
            0.14;
          marker.scale.lerp(
            tempScale.set(
              isActive ? 1.7 : isHover ? 1.38 : 1,
              isActive ? 1.7 : isHover ? 1.38 : 1,
              isActive ? 1.7 : isHover ? 1.38 : 1
            ),
            0.12
          );
        }
        if (world.lines[layerId]) {
          world.lines[layerId].material.opacity +=
            ((isActive ? 0.74 : isHover ? 0.48 : 0.14) -
              world.lines[layerId].material.opacity) *
            0.12;
        }
      });

      orbitOffset.copy(desiredPosition).sub(desiredTarget);
      orbitSpherical.setFromVector3(orbitOffset);
      orbitSpherical.theta += orbitState.yaw;
      orbitSpherical.phi = clamp(
        orbitSpherical.phi + orbitState.pitch,
        0.34,
        1.5
      );
      orbitPosition.setFromSpherical(orbitSpherical).add(desiredTarget);

      camera.position.lerp(
        orbitPosition,
        selected
          ? animationConfig.cameraLerpActive
          : animationConfig.cameraLerpIdle
      );
      currentTarget.lerp(
        desiredTarget,
        selected
          ? animationConfig.targetLerpActive
          : animationConfig.targetLerpIdle
      );
      camera.zoom += (cam.zoom * orbitState.zoom - camera.zoom) * 0.08;
      camera.updateProjectionMatrix();
      camera.lookAt(currentTarget);
      composer.render();
      frame = window.requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    mount.addEventListener("pointermove", pointerMove);
    mount.addEventListener("pointerleave", pointerLeave);
    mount.addEventListener("pointerdown", pointerDown);
    mount.addEventListener("pointerup", pointerUp);
    mount.addEventListener("pointercancel", pointerCancel);
    mount.addEventListener("wheel", wheel, {passive: false});
    frame = window.requestAnimationFrame(animate);

    return function cleanup() {
      world.disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", pointerMove);
      mount.removeEventListener("pointerleave", pointerLeave);
      mount.removeEventListener("pointerdown", pointerDown);
      mount.removeEventListener("pointerup", pointerUp);
      mount.removeEventListener("pointercancel", pointerCancel);
      mount.removeEventListener("wheel", wheel);
      scene.traverse(function disposeNode(node) {
        if (node.geometry) {
          node.geometry.dispose();
        }
        if (node.material) {
          const list = Array.isArray(node.material)
            ? node.material
            : [node.material];
          list.forEach(function disposeMaterial(material) {
            if (material.map) {
              material.map.dispose();
            }
            material.dispose();
          });
        }
      });
      environmentTexture.dispose();
      roomEnvironment.clear();
      pmremGenerator.dispose();
      if (composer.dispose) {
        composer.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className="habitat-scene"
      ref={mountRef}
      aria-label="Interactive digital habitat scene"
    />
  );
}

export default HabitatScene;
