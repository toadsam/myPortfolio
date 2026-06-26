import React, {useEffect, useRef} from "react";
import * as THREE from "three";
import {RoundedBoxGeometry} from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {getCameraView} from "./cameraConfig";
import {zones} from "./worldData";

const zoneIds = zones.map(function mapZone(zone) {
  return zone.id;
});

const zonePalette = {
  about: {primary: 0x38bdf8, secondary: 0xf8fafc},
  skills: {primary: 0x22d3ee, secondary: 0x2dd4bf},
  projects: {primary: 0x8b5cf6, secondary: 0x38bdf8},
  backend: {primary: 0x1e3a8a, secondary: 0x00b4d8},
  game: {primary: 0xa855f7, secondary: 0xec4899},
  growth: {primary: 0x34d399, secondary: 0x2dd4bf},
  contact: {primary: 0xe0f2fe, secondary: 0xfacc15}
};

function vectorFromArray(value) {
  return new THREE.Vector3(value[0], value[1], value[2]);
}

function seeded(index, salt) {
  const raw = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function colorForZone(zoneId, key) {
  const palette = zonePalette[zoneId] || zonePalette.about;
  return palette[key || "primary"];
}

function makeMat(options) {
  return new THREE.MeshStandardMaterial({
    color: options.color,
    emissive: options.emissive || 0x000000,
    emissiveIntensity: options.emissiveIntensity || 0,
    metalness: options.metalness == null ? 0.18 : options.metalness,
    roughness: options.roughness == null ? 0.5 : options.roughness,
    transparent: !!options.transparent,
    opacity: options.opacity == null ? 1 : options.opacity,
    side: options.side || THREE.FrontSide,
    depthWrite: options.depthWrite == null ? true : options.depthWrite
  });
}

function makeBasicMat(color, opacity) {
  return new THREE.MeshBasicMaterial({
    color: color,
    transparent: opacity < 1,
    opacity: opacity,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

function makeTube(points, radius, material, segments) {
  const curve = new THREE.CatmullRomCurve3(points.map(vectorFromArray));
  const geometry = new THREE.TubeGeometry(curve, segments || 72, radius, 12, false);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.curve = curve;
  return mesh;
}

function makeRoundedBox(width, height, depth, material, position, rotation, radius) {
  const geometry = new RoundedBoxGeometry(width, height, depth, 5, radius == null ? 0.035 : radius);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.fromArray(position);
  if (rotation) {
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  }
  return mesh;
}

function addEdges(target, color, opacity) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(target.geometry, 26),
    new THREE.LineBasicMaterial({color: color, transparent: true, opacity: opacity == null ? 0.28 : opacity})
  );
  target.add(edges);
  return edges;
}

function makeIrregularIslandGeometry(radiusX, radiusZ, height, segments, salt, lowerScale) {
  const vertices = [];
  const indices = [];
  vertices.push(0, 0.04, 0);
  vertices.push(0, -height, 0);

  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const n = 0.82 + seeded(i, salt) * 0.28 + Math.sin(i * 1.37 + salt) * 0.055;
    const topX = Math.cos(angle) * radiusX * n;
    const topZ = Math.sin(angle) * radiusZ * (0.88 + seeded(i, salt + 1) * 0.24);
    const topY = Math.sin(i * 0.83 + salt) * 0.025;
    const taper = lowerScale * (0.82 + seeded(i, salt + 2) * 0.28);
    const bottomY = -height - seeded(i, salt + 3) * 0.28;
    vertices.push(topX, topY, topZ);
    vertices.push(topX * taper, bottomY, topZ * taper);
  }

  for (let i = 0; i < segments; i += 1) {
    const topA = 2 + i * 2;
    const bottomA = topA + 1;
    const topB = 2 + ((i + 1) % segments) * 2;
    const bottomB = topB + 1;
    indices.push(0, topA, topB);
    indices.push(1, bottomB, bottomA);
    indices.push(topA, bottomA, bottomB);
    indices.push(topA, bottomB, topB);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function makeLabelSprite(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  roundedRect(ctx, 18, 28, 476, 72, 28);
  ctx.fillStyle = "rgba(8, 13, 28, 0.78)";
  ctx.fill();
  ctx.strokeStyle = "#" + color.toString(16).padStart(6, "0");
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = "700 32px Inter, Segoe UI, sans-serif";
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.96, 0.24, 1);
  return sprite;
}

function collectZoneMaterials(group) {
  const materials = [];
  group.traverse(function collect(node) {
    if (!node.material) {
      return;
    }
    const nodeMaterials = Array.isArray(node.material) ? node.material : [node.material];
    nodeMaterials.forEach(function addMaterial(material) {
      if (materials.indexOf(material) === -1 && material.isMeshStandardMaterial) {
        material.userData.baseEmissiveIntensity = material.emissiveIntensity || 0;
        materials.push(material);
      }
    });
  });
  return materials;
}

function registerZoneGroup(world, zoneId, group) {
  group.userData.baseY = group.position.y;
  group.userData.materials = collectZoneMaterials(group);
  world.animated.zoneGroups[zoneId] = group;
}

function addLayeredBase(group, materials, options) {
  const accent = options.accent;
  const base = makeRoundedBox(options.width, 0.1, options.depth, materials.platform, [0, 0.2, 0], null, 0.055);
  const rim = makeRoundedBox(options.width + 0.12, 0.035, options.depth + 0.12, accent, [0, 0.265, 0], null, 0.07);
  const shadow = makeRoundedBox(options.width + 0.22, 0.035, options.depth + 0.22, materials.platformDark, [0, 0.145, 0], null, 0.08);
  const aura = new THREE.Mesh(new THREE.TorusGeometry(Math.max(options.width, options.depth) * 0.48, 0.012, 8, 80), accent.clone());
  aura.position.y = 0.315;
  aura.rotation.x = Math.PI / 2;
  aura.material.transparent = true;
  aura.material.opacity = 0.34;
  aura.userData.baseOpacity = 0.34;
  group.add(shadow);
  group.add(base);
  group.add(rim);
  group.add(aura);
  group.userData.aura = aura;
}

function createShieldGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.28);
  shape.bezierCurveTo(0.22, 0.22, 0.28, 0.14, 0.26, -0.02);
  shape.bezierCurveTo(0.23, -0.18, 0.1, -0.31, 0, -0.38);
  shape.bezierCurveTo(-0.1, -0.31, -0.23, -0.18, -0.26, -0.02);
  shape.bezierCurveTo(-0.28, 0.14, -0.22, 0.22, 0, 0.28);
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.012,
    bevelThickness: 0.012
  });
}

function addZoneHotspot(world, zone, radius, interactiveMeshes) {
  const group = new THREE.Group();
  const point = vectorFromArray(zone.position);
  const zoneColor = colorForZone(zone.id, "secondary");
  const marker = new THREE.Mesh(new THREE.IcosahedronGeometry(0.066, 2), makeBasicMat(zoneColor, 0.88));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.28, 0.012, 8, 54), makeBasicMat(zoneColor, 0.38));
  const label = makeLabelSprite(zone.label, zoneColor);
  const hotspot = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 14),
    new THREE.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false})
  );

  marker.userData.zoneId = zone.id;
  ring.userData.zoneId = zone.id;
  hotspot.userData.zoneId = zone.id;
  hotspot.position.copy(point);
  ring.rotation.x = Math.PI / 2;
  label.position.y = 0.44;
  group.position.copy(point);
  group.add(marker);
  group.add(ring);
  group.add(label);
  group.userData.zoneId = zone.id;
  group.userData.baseY = point.y;
  group.userData.marker = marker;
  group.userData.ring = ring;
  group.userData.label = label;
  world.zoneMarkers[zone.id] = group;
  world.root.add(group);
  world.root.add(hotspot);
  interactiveMeshes.push(hotspot);
}

function addIsland(world, materials) {
  const island = new THREE.Group();
  const top = new THREE.Mesh(makeIrregularIslandGeometry(4.05, 2.72, 0.18, 58, 4, 0.92), materials.terrain);
  const cliff = new THREE.Mesh(makeIrregularIslandGeometry(4.0, 2.7, 1.42, 58, 12, 0.32), materials.cliff);
  const lowerCliff = new THREE.Mesh(makeIrregularIslandGeometry(2.65, 1.8, 0.78, 42, 18, 0.18), materials.cliffDark);
  const corePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.92, 0.06, 72), materials.platformDark);

  top.position.y = 0.02;
  cliff.position.y = -0.08;
  lowerCliff.position.y = -1.22;
  corePlate.position.y = 0.17;
  corePlate.scale.z = 0.74;

  island.add(cliff);
  island.add(lowerCliff);
  island.add(top);
  island.add(corePlate);

  for (let i = 0; i < 34; i += 1) {
    const angle = (i / 34) * Math.PI * 2;
    const rX = 3.15 + seeded(i, 2) * 0.78;
    const rZ = 2.0 + seeded(i, 3) * 0.62;
    const colorKey = i % 5 === 0 ? "violetCrystal" : i % 3 === 0 ? "mintCrystal" : "blueCrystal";
    const shard = new THREE.Mesh(
      new THREE.ConeGeometry(0.05 + seeded(i, 4) * 0.075, 0.25 + seeded(i, 5) * 0.42, 7),
      materials[colorKey]
    );
    shard.position.set(Math.cos(angle) * rX, -0.16 + seeded(i, 6) * 0.16, Math.sin(angle) * rZ);
    shard.rotation.set(seeded(i, 7) * 0.7, angle, seeded(i, 8) * 0.48);
    island.add(shard);
  }

  world.root.add(island);
  world.animated.island = island;
}

function addCore(world, materials) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.15, 64), materials.platform);
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.82, 48), materials.glassBlue);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 3), materials.core);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.34, 36, 24), materials.coreHalo);
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.014, 10, 96), materials.coreLine);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.01, 10, 96), materials.coreLine);

  base.position.y = 0.2;
  column.position.y = 0.68;
  core.position.y = 1.14;
  halo.position.copy(core.position);
  ringA.position.y = 1.14;
  ringB.position.y = 0.83;
  ringA.rotation.x = Math.PI / 2;
  ringB.rotation.x = Math.PI / 2;
  ringB.rotation.z = Math.PI / 6;

  group.add(base);
  group.add(column);
  group.add(halo);
  group.add(core);
  group.add(ringA);
  group.add(ringB);
  group.userData.core = core;
  group.userData.halo = halo;
  group.userData.rings = [ringA, ringB];
  world.root.add(group);
  world.animated.core = group;
}

function addWebLab(world, materials) {
  const group = new THREE.Group();
  const accent = materials.webAccent.clone();
  addLayeredBase(group, materials, {width: 1.12, depth: 0.82, accent: accent});

  const labBody = makeRoundedBox(0.86, 0.46, 0.62, materials.webGlass, [0, 0.55, 0], null, 0.075);
  const roof = makeRoundedBox(0.92, 0.05, 0.68, materials.webRoof, [0, 0.82, 0], null, 0.06);
  const monitor = makeRoundedBox(0.38, 0.25, 0.04, materials.screenAqua, [-0.18, 0.56, 0.34], [-0.08, 0, 0], 0.02);
  const terminal = makeRoundedBox(0.34, 0.22, 0.04, materials.screenMint, [0.21, 0.54, 0.34], [-0.08, 0, 0], 0.02);
  const scan = makeRoundedBox(0.77, 0.012, 0.018, materials.webScan, [0, 0.5, 0.355], null, 0.005);
  const codePanel = makeRoundedBox(0.42, 0.28, 0.025, materials.webHologram, [-0.48, 0.82, -0.08], [0.04, 0.44, 0], 0.02);

  addEdges(labBody, 0x22d3ee, 0.34);
  addEdges(codePanel, 0x2dd4bf, 0.46);
  group.add(labBody);
  group.add(roof);
  group.add(monitor);
  group.add(terminal);
  group.add(scan);
  group.add(codePanel);

  for (let i = 0; i < 4; i += 1) {
    const line = makeRoundedBox(0.28 - i * 0.03, 0.012, 0.012, materials.webLine, [-0.5, 0.88 - i * 0.055, -0.06], [0.04, 0.44, 0], 0.004);
    group.add(line);
  }

  group.position.set(-2.18, 0.02, 0.28);
  group.rotation.y = 0.2;
  group.userData.scan = scan;
  group.userData.hologram = codePanel;
  world.root.add(group);
  registerZoneGroup(world, "skills", group);
}

function addProjectGallery(world, materials) {
  const group = new THREE.Group();
  const accent = materials.projectAccent.clone();
  addLayeredBase(group, materials, {width: 1.28, depth: 0.88, accent: accent});

  const backWall = makeRoundedBox(1.1, 0.42, 0.05, materials.galleryGlass, [0, 0.56, -0.3], [0.05, 0, 0], 0.04);
  const canopy = makeRoundedBox(1.18, 0.055, 0.82, materials.galleryCanopy, [0, 0.86, -0.02], null, 0.06);
  addEdges(backWall, 0x8b5cf6, 0.38);
  group.add(backWall);
  group.add(canopy);

  for (let i = 0; i < 4; i += 1) {
    const x = -0.42 + i * 0.28;
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.2, 20), materials.galleryStand);
    const cube = makeRoundedBox(
      0.15,
      0.15,
      0.15,
      i % 2 ? materials.projectCubeBlue : materials.projectCubeViolet,
      [x, 0.52, 0.04],
      [0.25, 0.35 + i * 0.38, 0.2],
      0.025
    );
    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.007, 6, 36), i % 2 ? materials.projectLineBlue : materials.projectLineViolet);
    stand.position.set(x, 0.35, 0.04);
    frame.position.set(x, 0.52, 0.04);
    frame.rotation.y = Math.PI / 2;
    cube.userData.seed = i;
    cube.userData.baseY = cube.position.y;
    world.animated.projectCubes.push(cube);
    group.add(stand);
    group.add(frame);
    group.add(cube);
  }

  group.position.set(2.2, 0.02, 0.16);
  group.rotation.y = -0.25;
  world.root.add(group);
  registerZoneGroup(world, "projects", group);
}

function addBackendTower(world, materials) {
  const group = new THREE.Group();
  const accent = materials.backendAccent.clone();
  addLayeredBase(group, materials, {width: 0.95, depth: 0.82, accent: accent});

  for (let i = 0; i < 6; i += 1) {
    const y = 0.36 + i * 0.145;
    const server = makeRoundedBox(0.54 - i * 0.018, 0.12, 0.42, i % 2 ? materials.serverAlt : materials.server, [0, y, 0], null, 0.035);
    const ledA = makeRoundedBox(0.035, 0.018, 0.018, materials.serverLed, [-0.19, y, 0.22], null, 0.006);
    const ledB = makeRoundedBox(0.13, 0.012, 0.018, materials.serverLedCold, [0.08, y, 0.22], null, 0.005);
    ledA.userData.seed = i;
    ledB.userData.seed = i + 10;
    world.animated.serverLeds.push(ledA, ledB);
    group.add(server);
    group.add(ledA);
    group.add(ledB);
  }

  const shield = new THREE.Mesh(createShieldGeometry(), materials.shield);
  shield.position.set(0.42, 0.82, 0.02);
  shield.rotation.set(0, -0.5, 0);
  shield.scale.setScalar(0.7);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.46, 18), materials.backendLine);
  antenna.position.y = 1.28;
  group.add(shield);
  group.add(antenna);

  for (let i = 0; i < 7; i += 1) {
    const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 1), i % 2 ? materials.dataNodeCyan : materials.dataNodeBlue);
    node.position.set(Math.cos(i * 1.25) * 0.58, 0.55 + i * 0.075, Math.sin(i * 1.25) * 0.38);
    node.userData.seed = i;
    world.animated.dataNodes.push(node);
    group.add(node);
  }

  group.position.set(1.48, 0.02, -1.74);
  world.root.add(group);
  registerZoneGroup(world, "backend", group);
}

function addGameZone(world, materials) {
  const group = new THREE.Group();
  const accent = materials.gameAccent.clone();
  addLayeredBase(group, materials, {width: 1.15, depth: 0.92, accent: accent});

  const portalOuter = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.035, 18, 104), materials.portalViolet);
  const portalInner = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.014, 14, 90), materials.portalPink);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(0.33, 64), materials.portalGlass);
  const headset = makeRoundedBox(0.36, 0.16, 0.18, materials.xrHeadset, [0.52, 0.44, 0.05], [0, -0.25, 0], 0.04);
  const lensA = makeRoundedBox(0.1, 0.08, 0.025, materials.portalPink, [0.45, 0.44, 0.15], [0, -0.25, 0], 0.018);
  const lensB = makeRoundedBox(0.1, 0.08, 0.025, materials.portalViolet, [0.58, 0.44, 0.12], [0, -0.25, 0], 0.018);
  const gameToken = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), materials.gameToken);

  portalOuter.position.y = 0.66;
  portalOuter.rotation.y = Math.PI / 2;
  portalInner.position.copy(portalOuter.position);
  portalInner.rotation.copy(portalOuter.rotation);
  inner.position.copy(portalOuter.position);
  inner.rotation.copy(portalOuter.rotation);
  gameToken.position.set(-0.42, 0.52, 0.14);
  gameToken.rotation.set(0.3, 0.5, 0.2);

  group.add(inner);
  group.add(portalOuter);
  group.add(portalInner);
  group.add(headset);
  group.add(lensA);
  group.add(lensB);
  group.add(gameToken);
  group.position.set(-1.56, 0.02, -1.64);
  group.userData.portalRings = [portalOuter, portalInner];
  group.userData.gameToken = gameToken;
  world.root.add(group);
  registerZoneGroup(world, "game", group);
}

function addGrowthRoad(world, materials) {
  const group = new THREE.Group();
  const road = makeTube(
    [
      [-1.52, 0.25, 0],
      [-0.92, 0.29, 0.2],
      [-0.32, 0.27, -0.05],
      [0.32, 0.3, 0.16],
      [1.42, 0.24, -0.1]
    ],
    0.03,
    materials.growthRoad,
    92
  );
  group.add(road);

  for (let i = 0; i < 7; i += 1) {
    const x = -1.42 + i * 0.47;
    const milestone = makeRoundedBox(0.08, 0.14, 0.08, i % 2 ? materials.growthMint : materials.growthSeed, [x, 0.36 + Math.sin(i) * 0.04, Math.sin(i * 1.7) * 0.16], null, 0.025);
    milestone.userData.seed = i;
    milestone.userData.baseY = milestone.position.y;
    group.add(milestone);
    world.animated.milestones.push(milestone);
  }

  group.position.set(0, 0.02, 2.02);
  world.root.add(group);
  registerZoneGroup(world, "growth", group);
}

function addContactBeacon(world, materials) {
  const group = new THREE.Group();
  const accent = materials.contactAccent.clone();
  addLayeredBase(group, materials, {width: 0.84, depth: 0.72, accent: accent});

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.04, 0.95, 24), materials.contactMast);
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 3), materials.contactOrb);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.72, 42, 1, true), materials.contactBeam);
  const ringGold = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.01, 8, 64), materials.goldLine);

  mast.position.y = 0.76;
  orb.position.y = 1.32;
  beam.position.y = 2.12;
  beam.rotation.x = Math.PI;
  ringGold.position.y = 1.08;
  ringGold.rotation.x = Math.PI / 2;

  group.add(mast);
  group.add(ringGold);
  group.add(orb);
  group.add(beam);
  group.position.set(0.08, 0.02, -2.42);
  group.userData.orb = orb;
  group.userData.beam = beam;
  group.userData.goldRing = ringGold;
  world.root.add(group);
  registerZoneGroup(world, "contact", group);
}

function addEnergyLines(world, materials) {
  zones.forEach(function addLine(zone) {
    if (zone.id === "about") {
      return;
    }
    const zoneColor = colorForZone(zone.id, "secondary");
    const lineMaterial = makeMat({
      color: zoneColor,
      emissive: zoneColor,
      emissiveIntensity: 0.62,
      roughness: 0.22,
      transparent: true,
      opacity: 0.18
    });
    const line = makeTube(
      [
        [0, 0.26, 0],
        [zone.position[0] * 0.38, 0.34, zone.position[2] * 0.36],
        [zone.position[0] * 0.72, 0.31, zone.position[2] * 0.73],
        [zone.position[0], 0.28, zone.position[2]]
      ],
      0.008,
      lineMaterial,
      70
    );
    const pulse = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 1), makeBasicMat(zoneColor, 0.6));
    line.userData.zoneId = zone.id;
    line.material.opacity = 0.16;
    world.energyLines[zone.id] = line;
    world.animated.energyPulses.push({
      curve: line.userData.curve,
      mesh: pulse,
      phase: seeded(zone.id.length, 40),
      zoneId: zone.id
    });
    world.root.add(line);
    world.root.add(pulse);
  });
}

function createWorld(scene) {
  const world = {
    root: new THREE.Group(),
    interactiveMeshes: [],
    zoneMarkers: {},
    energyLines: {},
    animated: {
      core: null,
      island: null,
      projectCubes: [],
      dataNodes: [],
      serverLeds: [],
      milestones: [],
      energyPulses: [],
      particles: null,
      zoneGroups: {}
    }
  };

  const materials = {
    terrain: makeMat({color: 0x101a2d, emissive: 0x071426, emissiveIntensity: 0.08, roughness: 0.72, metalness: 0.04}),
    cliff: makeMat({color: 0x0b1020, roughness: 0.82, metalness: 0.08}),
    cliffDark: makeMat({color: 0x050816, roughness: 0.86, metalness: 0.06}),
    platform: makeMat({color: 0x172033, emissive: 0x0b1020, emissiveIntensity: 0.04, roughness: 0.42, metalness: 0.45}),
    platformDark: makeMat({color: 0x080d1c, roughness: 0.52, metalness: 0.5}),
    glassBlue: makeMat({color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.16, roughness: 0.08, metalness: 0.04, transparent: true, opacity: 0.26}),
    core: makeMat({color: 0xf8fafc, emissive: 0x38bdf8, emissiveIntensity: 2.1, roughness: 0.18}),
    coreHalo: makeMat({color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.85, transparent: true, opacity: 0.17, side: THREE.DoubleSide, depthWrite: false}),
    coreLine: makeMat({color: 0x7dd3fc, emissive: 0x38bdf8, emissiveIntensity: 1.2, transparent: true, opacity: 0.7}),
    metalCool: makeMat({color: 0x1f2a44, roughness: 0.35, metalness: 0.62}),
    webAccent: makeMat({color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.9, roughness: 0.2, transparent: true, opacity: 0.66}),
    webGlass: makeMat({color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.16, roughness: 0.08, metalness: 0.04, transparent: true, opacity: 0.28}),
    webRoof: makeMat({color: 0x164e63, emissive: 0x22d3ee, emissiveIntensity: 0.18, roughness: 0.24, metalness: 0.34}),
    screenAqua: makeMat({color: 0x071426, emissive: 0x22d3ee, emissiveIntensity: 0.5, roughness: 0.18}),
    screenMint: makeMat({color: 0x061b1b, emissive: 0x2dd4bf, emissiveIntensity: 0.46, roughness: 0.18}),
    webScan: makeMat({color: 0x2dd4bf, emissive: 0x2dd4bf, emissiveIntensity: 1.2, transparent: true, opacity: 0.82}),
    webHologram: makeMat({color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.48, roughness: 0.12, transparent: true, opacity: 0.34}),
    webLine: makeMat({color: 0x2dd4bf, emissive: 0x2dd4bf, emissiveIntensity: 0.95, transparent: true, opacity: 0.78}),
    projectAccent: makeMat({color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.9, roughness: 0.2, transparent: true, opacity: 0.64}),
    galleryGlass: makeMat({color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.12, transparent: true, opacity: 0.24, roughness: 0.1}),
    galleryCanopy: makeMat({color: 0x251640, emissive: 0x8b5cf6, emissiveIntensity: 0.2, roughness: 0.28, metalness: 0.42}),
    galleryStand: makeMat({color: 0x25314b, roughness: 0.34, metalness: 0.58}),
    projectCubeBlue: makeMat({color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.52, roughness: 0.22, metalness: 0.18, transparent: true, opacity: 0.78}),
    projectCubeViolet: makeMat({color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.58, roughness: 0.2, metalness: 0.18, transparent: true, opacity: 0.78}),
    projectLineBlue: makeMat({color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.0, transparent: true, opacity: 0.66}),
    projectLineViolet: makeMat({color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 1.0, transparent: true, opacity: 0.66}),
    backendAccent: makeMat({color: 0x00b4d8, emissive: 0x00b4d8, emissiveIntensity: 0.85, roughness: 0.18, transparent: true, opacity: 0.62}),
    server: makeMat({color: 0x14213d, emissive: 0x00b4d8, emissiveIntensity: 0.07, roughness: 0.38, metalness: 0.58}),
    serverAlt: makeMat({color: 0x1e3a8a, emissive: 0x00b4d8, emissiveIntensity: 0.12, roughness: 0.36, metalness: 0.56}),
    serverLed: makeMat({color: 0x00b4d8, emissive: 0x00b4d8, emissiveIntensity: 1.25, transparent: true, opacity: 0.82}),
    serverLedCold: makeMat({color: 0x7dd3fc, emissive: 0x7dd3fc, emissiveIntensity: 1.0, transparent: true, opacity: 0.65}),
    shield: makeMat({color: 0x00b4d8, emissive: 0x00b4d8, emissiveIntensity: 0.42, transparent: true, opacity: 0.52, roughness: 0.16}),
    backendLine: makeMat({color: 0x00b4d8, emissive: 0x00b4d8, emissiveIntensity: 1.0, transparent: true, opacity: 0.82}),
    dataNodeCyan: makeMat({color: 0x00b4d8, emissive: 0x00b4d8, emissiveIntensity: 0.72, transparent: true, opacity: 0.8}),
    dataNodeBlue: makeMat({color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.6, transparent: true, opacity: 0.74}),
    gameAccent: makeMat({color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 0.88, transparent: true, opacity: 0.62}),
    portalViolet: makeMat({color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.35, roughness: 0.16, metalness: 0.22}),
    portalPink: makeMat({color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 1.1, transparent: true, opacity: 0.78}),
    portalGlass: makeMat({color: 0x312e81, emissive: 0xa855f7, emissiveIntensity: 0.48, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false}),
    xrHeadset: makeMat({color: 0x171427, emissive: 0xa855f7, emissiveIntensity: 0.12, roughness: 0.28, metalness: 0.5}),
    gameToken: makeMat({color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.58, roughness: 0.18, metalness: 0.18}),
    growthRoad: makeMat({color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 0.78, transparent: true, opacity: 0.74}),
    growthMint: makeMat({color: 0x2dd4bf, emissive: 0x2dd4bf, emissiveIntensity: 0.6, roughness: 0.28}),
    growthSeed: makeMat({color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 0.52, roughness: 0.3}),
    contactAccent: makeMat({color: 0xe0f2fe, emissive: 0x38bdf8, emissiveIntensity: 0.75, transparent: true, opacity: 0.7}),
    contactMast: makeMat({color: 0xe0f2fe, emissive: 0x38bdf8, emissiveIntensity: 0.22, roughness: 0.26, metalness: 0.62}),
    contactOrb: makeMat({color: 0xf8fafc, emissive: 0x38bdf8, emissiveIntensity: 1.45, roughness: 0.15}),
    contactBeam: makeMat({color: 0xe0f2fe, emissive: 0x38bdf8, emissiveIntensity: 0.45, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false}),
    goldLine: makeMat({color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.8, transparent: true, opacity: 0.7}),
    blueCrystal: makeMat({color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.18, roughness: 0.2, transparent: true, opacity: 0.78}),
    violetCrystal: makeMat({color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.18, roughness: 0.2, transparent: true, opacity: 0.72}),
    mintCrystal: makeMat({color: 0x2dd4bf, emissive: 0x2dd4bf, emissiveIntensity: 0.14, roughness: 0.2, transparent: true, opacity: 0.7})
  };

  scene.add(world.root);
  addIsland(world, materials);
  addEnergyLines(world, materials);
  addCore(world, materials);
  addWebLab(world, materials);
  addProjectGallery(world, materials);
  addBackendTower(world, materials);
  addGameZone(world, materials);
  addGrowthRoad(world, materials);
  addContactBeacon(world, materials);

  const radii = {about: 0.54, skills: 0.7, projects: 0.72, backend: 0.72, game: 0.72, growth: 0.9, contact: 0.62};
  zones.forEach(function addZone(zone) {
    addZoneHotspot(world, zone, radii[zone.id], world.interactiveMeshes);
  });

  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 260;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const angle = seeded(i, 50) * Math.PI * 2;
    const radius = 2.15 + seeded(i, 51) * 3.8;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = -0.45 + seeded(i, 52) * 3.55;
    positions[i * 3 + 2] = Math.sin(angle) * radius * 0.82;
  }
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  world.animated.particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.024,
      transparent: true,
      opacity: 0.58,
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

function WorldScene(props) {
  const {activeZone, hoveredZone, onHoverZone, onSelectZone} = props;
  const mountRef = useRef(null);
  const activeRef = useRef(activeZone);
  const hoveredRef = useRef(hoveredZone);
  const onHoverRef = useRef(onHoverZone);
  const onSelectRef = useRef(onSelectZone);

  useEffect(function updateRefs() {
    activeRef.current = activeZone;
  }, [activeZone]);

  useEffect(function updateHoverRef() {
    hoveredRef.current = hoveredZone;
  }, [hoveredZone]);

  useEffect(function updateHandlers() {
    onHoverRef.current = onHoverZone;
    onSelectRef.current = onSelectZone;
  }, [onHoverZone, onSelectZone]);

  useEffect(function mountScene() {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050816, 0.035);

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 120);
    const defaultView = getCameraView("world");
    camera.position.fromArray(defaultView.position);
    camera.zoom = defaultView.zoom;
    camera.updateProjectionMatrix();

    const currentTarget = vectorFromArray(defaultView.target);
    const desiredPosition = vectorFromArray(defaultView.position);
    const desiredTarget = vectorFromArray(defaultView.target);

    const ambient = new THREE.HemisphereLight(0x94a3b8, 0x050816, 0.82);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xe0f2fe, 3.0);
    key.position.set(-3.6, 6.2, 4.6);
    key.castShadow = true;
    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    scene.add(key);

    const spotlight = new THREE.SpotLight(0x38bdf8, 3.6, 9, Math.PI / 5, 0.48, 1.2);
    spotlight.position.set(-1.2, 4.2, 3.6);
    spotlight.target.position.set(0.4, 0.1, 0);
    spotlight.castShadow = true;
    scene.add(spotlight);
    scene.add(spotlight.target);

    const violet = new THREE.PointLight(0x8b5cf6, 2.2, 7.5);
    violet.position.set(2.1, 1.8, 1.3);
    scene.add(violet);

    const cyan = new THREE.PointLight(0x22d3ee, 2.4, 8);
    cyan.position.set(-2.4, 2.1, 1.8);
    scene.add(cyan);

    const world = createWorld(scene);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(10, 10);
    let activeHover = "";
    let frame = 0;
    const tempScale = new THREE.Vector3();

    function resize() {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function setHover(next) {
      if (next === activeHover) {
        return;
      }
      activeHover = next;
      hoveredRef.current = next;
      mount.classList.toggle("is-hovering-zone", !!next);
      onHoverRef.current(next);
    }

    function handlePointerMove(event) {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(world.interactiveMeshes, false);
      setHover(hits.length ? hits[0].object.userData.zoneId : "");
    }

    function handlePointerLeave() {
      pointer.set(10, 10);
      setHover("");
    }

    function handlePointerDown() {
      if (activeHover) {
        onSelectRef.current(activeHover);
      }
    }

    function updateZoneMaterials(zoneGroup, boost) {
      if (!zoneGroup.userData.materials) {
        return;
      }
      zoneGroup.userData.materials.forEach(function updateMaterial(material) {
        const base = material.userData.baseEmissiveIntensity || 0;
        material.emissiveIntensity += (base + boost - material.emissiveIntensity) * 0.12;
      });
    }

    function animate(time) {
      const elapsed = time * 0.001;
      const selected = activeRef.current;
      const view = getCameraView(selected || "world");
      desiredPosition.fromArray(view.position);
      desiredTarget.fromArray(view.target);

      world.root.position.y = Math.sin(elapsed * 0.68) * 0.055;
      world.root.rotation.y = Math.sin(elapsed * 0.18) * 0.052;

      if (world.animated.island) {
        world.animated.island.rotation.z = Math.sin(elapsed * 0.16) * 0.012;
      }

      if (world.animated.core) {
        const core = world.animated.core.userData.core;
        const halo = world.animated.core.userData.halo;
        const rings = world.animated.core.userData.rings;
        const pulse = 1 + Math.sin(elapsed * 2.5) * 0.09;
        core.scale.setScalar(pulse);
        halo.scale.setScalar(1.04 + Math.sin(elapsed * 2.1) * 0.08);
        halo.material.opacity = 0.13 + (Math.sin(elapsed * 2.1) * 0.5 + 0.5) * 0.08;
        rings[0].rotation.z += 0.009;
        rings[1].rotation.z -= 0.006;
      }

      world.animated.projectCubes.forEach(function animateProjectCube(mesh, index) {
        mesh.rotation.x += 0.005 + index * 0.0006;
        mesh.rotation.y += 0.008;
        mesh.position.y = mesh.userData.baseY + Math.sin(elapsed * 1.75 + index) * 0.045;
      });

      world.animated.serverLeds.forEach(function animateLed(mesh, index) {
        const blink = Math.sin(elapsed * (3.2 + index * 0.12) + mesh.userData.seed) * 0.5 + 0.5;
        mesh.material.opacity = 0.35 + blink * 0.55;
        mesh.material.emissiveIntensity = 0.65 + blink * 1.1;
      });

      world.animated.dataNodes.forEach(function animateNode(mesh, index) {
        mesh.position.y += Math.sin(elapsed * 1.9 + index) * 0.0007;
        mesh.scale.setScalar(1 + Math.sin(elapsed * 2.2 + index) * 0.14);
      });

      world.animated.milestones.forEach(function animateMilestone(mesh, index) {
        mesh.position.y = mesh.userData.baseY + Math.sin(elapsed * 1.4 + index) * 0.025;
        mesh.scale.setScalar(1 + Math.sin(elapsed * 2 + index * 0.6) * 0.12);
      });

      if (world.animated.zoneGroups.game && world.animated.zoneGroups.game.userData.portalRings) {
        const rings = world.animated.zoneGroups.game.userData.portalRings;
        rings[0].rotation.z += 0.013;
        rings[1].rotation.z -= 0.018;
        world.animated.zoneGroups.game.userData.gameToken.rotation.y += 0.012;
      }

      if (world.animated.zoneGroups.skills && world.animated.zoneGroups.skills.userData.scan) {
        const scan = world.animated.zoneGroups.skills.userData.scan;
        scan.position.y = 0.46 + (Math.sin(elapsed * 1.5) * 0.5 + 0.5) * 0.28;
        world.animated.zoneGroups.skills.userData.hologram.position.y = 0.82 + Math.sin(elapsed * 1.2) * 0.035;
      }

      if (world.animated.zoneGroups.contact) {
        const orb = world.animated.zoneGroups.contact.userData.orb;
        const beam = world.animated.zoneGroups.contact.userData.beam;
        const ring = world.animated.zoneGroups.contact.userData.goldRing;
        const pulse = 1 + Math.sin(elapsed * 2.8) * 0.12;
        orb.scale.setScalar(pulse);
        beam.material.opacity = 0.09 + (Math.sin(elapsed * 1.7) * 0.5 + 0.5) * 0.11;
        ring.rotation.z += 0.012;
      }

      world.animated.energyPulses.forEach(function animatePulse(item, index) {
        const t = (elapsed * 0.12 + item.phase + index * 0.07) % 1;
        const isActive = selected === item.zoneId;
        const isHover = activeHover === item.zoneId || hoveredRef.current === item.zoneId;
        item.mesh.position.copy(item.curve.getPointAt(t));
        item.mesh.material.opacity = isActive ? 0.95 : isHover ? 0.72 : 0.34;
        item.mesh.scale.setScalar(isActive ? 1.28 : isHover ? 1.08 : 0.86);
      });

      if (world.animated.particles) {
        world.animated.particles.rotation.y += 0.0009;
        world.animated.particles.rotation.x = Math.sin(elapsed * 0.18) * 0.08;
        world.animated.particles.material.opacity = 0.46 + (Math.sin(elapsed * 0.72) * 0.5 + 0.5) * 0.16;
      }

      zoneIds.forEach(function updateZoneVisual(zoneId) {
        const marker = world.zoneMarkers[zoneId];
        const isActive = selected === zoneId;
        const isHover = activeHover === zoneId || hoveredRef.current === zoneId;
        const scale = isActive ? 1.86 : isHover ? 1.48 : 1 + Math.sin(elapsed * 1.6 + zoneId.length) * 0.08;
        tempScale.set(scale, scale, scale);
        marker.scale.lerp(tempScale, 0.12);
        marker.position.y = marker.userData.baseY + Math.sin(elapsed * 1.25 + zoneId.length) * 0.025;
        marker.userData.ring.rotation.z += isActive || isHover ? 0.018 : 0.006;
        marker.userData.marker.material.opacity += ((isActive ? 1 : isHover ? 0.9 : 0.5) - marker.userData.marker.material.opacity) * 0.14;
        marker.userData.ring.material.opacity += ((isActive ? 0.86 : isHover ? 0.62 : 0.24) - marker.userData.ring.material.opacity) * 0.14;
        marker.userData.label.material.opacity += ((isActive || isHover ? 0.96 : 0) - marker.userData.label.material.opacity) * 0.16;

        if (world.energyLines[zoneId]) {
          world.energyLines[zoneId].material.opacity += ((isActive ? 0.72 : isHover ? 0.46 : 0.14) - world.energyLines[zoneId].material.opacity) * 0.12;
        }

        if (world.animated.zoneGroups[zoneId]) {
          const zoneGroup = world.animated.zoneGroups[zoneId];
          const baseY = zoneGroup.userData.baseY || 0;
          const lift = isActive ? 0.09 : isHover ? 0.055 : 0.018;
          zoneGroup.position.y = baseY + Math.sin(elapsed * 2.2 + zoneId.length) * lift;
          updateZoneMaterials(zoneGroup, isActive ? 0.38 : isHover ? 0.24 : 0);
          if (zoneGroup.userData.aura) {
            const aura = zoneGroup.userData.aura;
            aura.rotation.z += isActive || isHover ? 0.018 : 0.006;
            aura.material.opacity += ((isActive ? 0.78 : isHover ? 0.58 : aura.userData.baseOpacity) - aura.material.opacity) * 0.12;
            aura.scale.setScalar(isActive ? 1.12 : isHover ? 1.06 : 1);
          }
        }
      });

      camera.position.lerp(desiredPosition, selected ? 0.055 : 0.038);
      currentTarget.lerp(desiredTarget, selected ? 0.06 : 0.042);
      camera.zoom += (view.zoom - camera.zoom) * 0.048;
      camera.updateProjectionMatrix();
      camera.lookAt(currentTarget);
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerleave", handlePointerLeave);
    mount.addEventListener("pointerdown", handlePointerDown);
    frame = window.requestAnimationFrame(animate);

    return function cleanup() {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerleave", handlePointerLeave);
      mount.removeEventListener("pointerdown", handlePointerDown);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="portfolio-world-scene" ref={mountRef} aria-label="Interactive 3D portfolio world" />;
}

export default WorldScene;
