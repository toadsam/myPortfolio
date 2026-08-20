"use client";

/**
 * 떠 있는 마을 섬 — 이력서 맨 아래, 연락처 섹션의 3D 오브젝트.
 *
 * ## 이게 여기 있는 이유
 *
 * 이력서는 "밤 숲길을 걸어 내려가는" 흐름이고, **그 길 끝에 마을이 있다.**
 * 바로 위에 「3D 개발자 마을 탐험하기 →」 버튼이 있는데, 글자만으로는 그 너머에
 * 무엇이 있는지 알 수 없다. 이 섬이 그 예고편이다.
 *
 * 히어로의 기술 별자리(`TechConstellation`)와 역할이 겹치지 않는다.
 * 위쪽은 **데이터**(무엇을 조합해 쓰는가), 아래쪽은 **서사**(다음에 갈 곳).
 *
 * ## 진짜 마을 건물을 쓴다 — 도형으로 흉내 내지 않는다
 *
 * 처음엔 원뿔·상자로 마을을 흉내 냈다가 버렸다. 이 프로젝트의 다른 3D 는 전부
 * 공들여 만든 GLB 인데 여기만 코드로 찍어낸 도형이라 **수준이 눈에 띄게 안 맞았다.**
 *
 * 무게가 걱정돼서 그랬는데, 재 보니 근거가 없었다 — 건물 GLB 하나가 **459~533KB**다.
 * 이 페이지는 이미 프로젝트 스크린샷 PNG 로 수십 MB 를 받는다. 1.4MB 는 그 안에서
 * 반올림 오차다. **"예고편"이 되려면 진짜 마을에 있는 그 건물이어야 한다.**
 *
 * 대신 **화면에 들어올 때만 받는다**(IntersectionObserver). 끝까지 안 내려간
 * 방문자는 한 바이트도 안 받는다.
 *
 * ## 빛은 둘까지만
 *
 * 광원을 늘리면 모든 재질의 셰이더가 다시 컴파일된다. 환경광 + 방향광 하나로
 * 끝내고, "창문에 불이 켜졌다"는 마을과 **같은 수법**으로 낸다 — 텍스처를
 * 자기발광 맵으로 재사용하면 밝은 픽셀(창문·간판)만 세게 빛난다.
 */

import {useEffect, useRef} from "react";
import * as THREE from "three";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {lockSceneMaterials} from "@/lib/villageMaterial";

const LANTERN = 0xff9d38;
const ROCK = 0x1e2c40;
const GRASS = 0x24402e;

/** 마을과 같은 디코더 경로. `AIPortfolioVillage` 가 쓰는 것과 같은 CDN 이라 캐시를 공유한다. */
const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";

/**
 * 섬에 세울 건물. 마을 한복판(central-plaza)을 가운데 두고 둘을 곁들인다.
 * `[경로, x, z, 목표 높이, 회전]`
 */
const BUILDINGS: [string, number, number, number, number][] = [
  ["/models/buildings/central-plaza.glb", 0, -0.1, 1.15, 0.35],
  ["/models/buildings/life-library.glb", -1.05, 0.55, 0.8, -0.6],
  ["/models/buildings/post-office.glb", 1.0, 0.5, 0.78, 0.9]
];

/** 나무 위치 `[x, z, 높이]` — 건물 사이를 메워 마을처럼 보이게 한다. */
const TREES: [number, number, number][] = [
  [-1.35, -0.5, 0.62],
  [1.35, -0.45, 0.55],
  [-0.35, 1.15, 0.5],
  [0.6, 1.25, 0.44],
  [1.55, 0.05, 0.4]
];

export function FloatingIsle() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(0, 1.6, 6.1);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    scene.add(new THREE.AmbientLight(0x2b3d58, 2.2));
    const key = new THREE.DirectionalLight(LANTERN, 1.5);
    key.position.set(2.8, 3.4, 2.2);
    scene.add(key);
    // 반대쪽에서 드는 약한 달빛. 이게 없으면 아래 바위가 통째로 검은 삼각형이 된다.
    const fill = new THREE.DirectionalLight(0x8fb0d8, 0.55);
    fill.position.set(-2.4, -0.6, -1.8);
    scene.add(fill);

    /** 섬 전체. 통째로 돌고 위아래로 떠다닌다. */
    const isle = new THREE.Group();
    scene.add(isle);

    const disposables: {dispose: () => void}[] = [];
    function track<T extends {dispose: () => void}>(item: T): T {
      disposables.push(item);
      return item;
    }

    // ── 땅: 잔디 원반 ──
    const top = new THREE.Mesh(
      track(new THREE.CylinderGeometry(2.1, 1.95, 0.24, 11)),
      track(new THREE.MeshLambertMaterial({color: GRASS, flatShading: true}))
    );
    isle.add(top);

    // ── 아래 바위: 원뿔 하나가 아니라 **세 덩이를 어긋나게 겹친다** ──
    // 원뿔 하나면 매끈한 삼각형이라 "도형"으로 읽힌다. 크기·각도가 다른 덩이를
    // 겹쳐야 깨진 암반처럼 보인다.
    const rockMat = track(
      new THREE.MeshLambertMaterial({color: ROCK, flatShading: true})
    );
    const chunks: [number, number, number, number, number, number][] = [
      // [반지름, 높이, y, x, z, 회전]
      [1.9, 2.0, -1.0, 0, 0, 0.3],
      [1.15, 1.7, -1.95, 0.28, -0.2, 1.1],
      [0.62, 1.5, -2.85, -0.15, 0.16, 2.2]
    ];
    for (const [r, h, y, x, z, rot] of chunks) {
      const chunk = new THREE.Mesh(
        track(new THREE.ConeGeometry(r, h, 7, 1)),
        rockMat
      );
      chunk.position.set(x, y, z);
      chunk.rotation.set(Math.PI, rot, 0.06);
      isle.add(chunk);
    }

    // ── 나무 ──
    const treeMat = track(
      new THREE.MeshLambertMaterial({color: 0x1d3324, flatShading: true})
    );
    for (const [x, z, h] of TREES) {
      const tree = new THREE.Mesh(
        track(new THREE.ConeGeometry(h * 0.32, h, 6)),
        treeMat
      );
      tree.position.set(x, 0.12 + h / 2, z);
      isle.add(tree);
    }

    // ── 등불 ──
    const glowTex = track(makeGlowTexture());
    const lampGlows: THREE.Sprite[] = [];
    for (const [x, z] of [
      [-1.7, 0.9],
      [1.75, -0.85],
      [0.1, 1.55]
    ] as [number, number][]) {
      const glow = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: glowTex,
            color: LANTERN,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
          })
        )
      );
      glow.position.set(x, 0.36, z);
      glow.scale.setScalar(0.8);
      isle.add(glow);
      lampGlows.push(glow);
    }

    // ── 섬 아래 안개 ──
    const mists: THREE.Sprite[] = [];
    for (let i = 0; i < 5; i += 1) {
      const mist = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: glowTex,
            color: 0x2a3d55,
            transparent: true,
            opacity: 0.22,
            depthWrite: false
          })
        )
      );
      mist.position.set((i - 2) * 0.8, -0.7 - i * 0.3, 0.3 - i * 0.18);
      mist.scale.set(3.8 - i * 0.35, 1.2, 1);
      scene.add(mist);
      mists.push(mist);
    }

    // ── 건물: 화면에 들어올 때만 받는다 ──
    let loader: GLTFLoader | null = null;
    let draco: DRACOLoader | null = null;
    let cancelled = false;

    function loadBuildings() {
      draco = new DRACOLoader();
      draco.setDecoderPath(DRACO_PATH);
      loader = new GLTFLoader();
      loader.setDRACOLoader(draco);

      for (const [path, x, z, targetH, rot] of BUILDINGS) {
        loader.load(path, gltf => {
          if (cancelled) return;
          const model = gltf.scene;

          // 마을과 같은 재질 규칙을 태운다 — 안 하면 Meshy 가 내보낸 제각각인
          // metalness/roughness 때문에 같은 세계 물건으로 안 보인다.
          lockSceneMaterials(model, path);

          // 창문 켜기: 텍스처를 자기발광 맵으로 재사용하면 밝은 픽셀만 빛난다.
          model.traverse(obj => {
            const mesh = obj as THREE.Mesh;
            if (!mesh.isMesh) return;
            const mats = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            for (const material of mats) {
              const std = material as THREE.MeshStandardMaterial;
              if (!std || !("emissiveIntensity" in std)) continue;
              std.emissive.set("#ffb968");
              std.emissiveIntensity = 1.15;
              if (std.map) std.emissiveMap = std.map;
              std.needsUpdate = true;
            }
          });

          // Meshy GLB 는 가장 긴 변이 1.9 로 정규화돼 나온다 — 높이로만 맞추면
          // 납작한 건물이 가로로 터진다. **세 축을 다 보고** 목표 상자에 맞춘다.
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          const scale = Math.min(
            targetH / Math.max(size.y, 1e-4),
            (targetH * 1.5) / Math.max(size.x, size.z, 1e-4)
          );
          model.scale.setScalar(scale);

          // 바닥을 잔디 위(y=0.12)에 올린다
          model.updateWorldMatrix(false, true);
          const scaled = new THREE.Box3().setFromObject(model);
          model.position.set(x, 0.12 - scaled.min.y, z);
          model.rotation.y = rot;
          isle.add(model);
        });
      }
    }

    // 끝까지 안 내려간 방문자에게 1.4MB 를 떠넘기지 않는다
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          io.disconnect();
          loadBuildings();
        }
      },
      {rootMargin: "200px"}
    );
    io.observe(host);

    function resize() {
      const w = host!.clientWidth || 420;
      const h = host!.clientHeight || 320;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // 커서가 근처에 오면 섬이 살짝 이쪽을 향한다 — 조작이 아니라 반응이다
    let aimX = 0;
    let aimY = 0;
    function onMove(event: PointerEvent) {
      const rect = host!.getBoundingClientRect();
      aimX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      aimY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    function onLeave() {
      aimX = 0;
      aimY = 0;
    }
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    let spin = 0.3;
    let tiltX = 0;
    let tiltY = 0;
    let raf = 0;

    function frame(now: number) {
      raf = requestAnimationFrame(frame);

      if (!reduced) {
        spin += 0.0013;
        isle.position.y = Math.sin(now * 0.0006) * 0.11;
        lampGlows.forEach((glow, i) => {
          const breathe = 0.7 + Math.sin(now * 0.0013 + i * 2.1) * 0.3;
          (glow.material as THREE.SpriteMaterial).opacity = breathe;
          glow.scale.setScalar(0.68 + breathe * 0.24);
        });
        mists.forEach((mist, i) => {
          mist.position.x += 0.0015 * (i % 2 === 0 ? 1 : -1);
          if (Math.abs(mist.position.x) > 2.8) mist.position.x *= -0.98;
        });
      }

      tiltY += (aimX * 0.2 - tiltY) * 0.05;
      tiltX += (aimY * 0.11 - tiltX) * 0.05;
      isle.rotation.y = spin + tiltY;
      isle.rotation.x = tiltX;

      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      draco?.dispose();
      disposables.forEach(d => d.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div className="floating-isle" ref={hostRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/** 부드러운 원형 발광 텍스처. 등불과 안개가 같이 쓴다. */
function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.28)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
