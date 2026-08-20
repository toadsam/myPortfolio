"use client";

/**
 * 기술 별자리 — 이력서 히어로의 3D 오브젝트.
 *
 * ## 왜 이걸로 바꿨나
 *
 * 원래 이 자리에는 시안색 와이어프레임 정이십면체가 떠 있었다. 예쁘긴 했지만
 * **아무 의미도 없었다** — 어느 포트폴리오에나 갖다 붙일 수 있는 도형이다.
 *
 * 그 자리에 **실제 데이터**를 세운다. 별 하나가 기술 하나이고, 별의 크기는
 * 그 기술을 쓴 프로젝트 수이며, **같은 프로젝트에서 함께 쓴 기술끼리 선으로
 * 이어진다.** 그래서 이 그림은 "무엇을 아는가"가 아니라 **"무엇을 조합해
 * 쓰는가"**를 보여준다. 목록으로 읽으면 한참 걸리는 정보다.
 *
 * 노린 것은 이중성이다 — **멀리서는 신비한 성운, 다가가면 기술 지도.**
 * 그래서 이름표는 평소에 숨기고 마우스를 올린 별에만 띄운다.
 *
 * ## 안개를 three 의 fog 로 걸지 않는다
 *
 * 별을 가산 합성(AdditiveBlending)으로 그리는데, 여기에 `scene.fog` 를 걸면
 * 먼 별이 **더 밝아진다** — 안개 색이 더해지기 때문이다(원하는 것의 정반대).
 * 그래서 깊이감은 프레임마다 각 별의 시야 z 로 **투명도를 직접 낮춰** 만든다.
 * 별이 29개뿐이라 비용은 무시할 수준이다.
 */

import {useEffect, useRef} from "react";
import * as THREE from "three";
import {projects} from "@/data/projects";

/** 이 수 이상의 프로젝트에 등장한 기술은 '주요 별'로 안쪽 궤도에 크게 놓는다. */
const MAJOR_MIN_PROJECTS = 2;

const COLOR_LANTERN = 0xff9d38; // 가장 많이 쓴 기술
const COLOR_GOLD = 0xe2c078; // 주요 기술
const COLOR_MOON = 0xa9bdd6; // 한 번만 쓴 기술

type Node = {
  name: string;
  /** 이 기술이 등장한 프로젝트 수 */
  weight: number;
  major: boolean;
  pos: THREE.Vector3;
};

/**
 * 프로젝트 목록에서 기술 그래프를 만든다.
 *
 * 노드 = 기술, 가중치 = 등장 프로젝트 수, 간선 = 같은 프로젝트에서 함께 쓴 횟수.
 * 정렬을 가중치 → 이름 순으로 **고정**해 두는 게 중요하다. 그래야 배치가
 * 매번 같아서, 새로고침할 때마다 별자리가 달라지지 않는다.
 */
function buildGraph() {
  const weight = new Map<string, number>();
  for (const project of projects) {
    for (const tech of new Set(project.tech)) {
      weight.set(tech, (weight.get(tech) ?? 0) + 1);
    }
  }

  const names = [...weight.keys()].sort(
    (a, b) => weight.get(b)! - weight.get(a)! || a.localeCompare(b)
  );
  const indexOf = new Map(names.map((name, i) => [name, i]));

  const pairs = new Map<string, number>();
  for (const project of projects) {
    const list = [...new Set(project.tech)];
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const a = indexOf.get(list[i])!;
        const b = indexOf.get(list[j])!;
        const key = a < b ? `${a}:${b}` : `${b}:${a}`;
        pairs.set(key, (pairs.get(key) ?? 0) + 1);
      }
    }
  }

  const majors = names.filter(n => weight.get(n)! >= MAJOR_MIN_PROJECTS);
  const minors = names.filter(n => weight.get(n)! < MAJOR_MIN_PROJECTS);

  const nodes: Node[] = names.map(name => ({
    name,
    weight: weight.get(name)!,
    major: weight.get(name)! >= MAJOR_MIN_PROJECTS,
    pos: new THREE.Vector3()
  }));

  // 두 겹의 구면에 고르게 흩는다 — 주요 별은 안쪽, 나머지는 바깥쪽.
  // 피보나치 배치라 뭉치지 않고, 순서가 고정이라 결과도 고정이다.
  placeOnShell(
    nodes.filter(n => n.major),
    1.75,
    majors.length
  );
  placeOnShell(
    nodes.filter(n => !n.major),
    2.85,
    minors.length
  );

  // 간선은 **한쪽이라도 주요 별인 것만** 남긴다. 전부 그리면 털뭉치가 된다.
  const edges: {a: number; b: number; w: number}[] = [];
  let maxW = 1;
  for (const [key, w] of pairs) {
    const [a, b] = key.split(":").map(Number);
    if (!nodes[a].major && !nodes[b].major) continue;
    edges.push({a, b, w});
    if (w > maxW) maxW = w;
  }

  return {nodes, edges, maxW};
}

/** 피보나치 구면 배치 — 구 표면에 점을 균일하게 뿌리는 고전적인 방법. */
function placeOnShell(list: Node[], radius: number, count: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  list.forEach((node, i) => {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    // 살짝 찌그러뜨려 완벽한 구가 아니라 성운처럼 보이게 한다
    node.pos.set(
      Math.cos(theta) * r * radius * 1.12,
      y * radius * 0.86,
      Math.sin(theta) * r * radius
    );
  });
}

/** 별 하나의 발광 텍스처. 파일을 두지 않고 그 자리에서 그린다. */
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
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.18, "rgba(255,255,255,0.85)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.22)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function TechConstellation() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const label = labelRef.current;
    const hint = hintRef.current;
    if (!host || !canvas || !label) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const {nodes, edges, maxW} = buildGraph();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    camera.position.z = 7.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // 별과 선을 한 그룹에 담아 통째로 회전시킨다
    const group = new THREE.Group();
    scene.add(group);

    // ── 별 ──
    const glow = makeGlowTexture();
    const sprites: THREE.Sprite[] = nodes.map((node, i) => {
      const color =
        i < 3 ? COLOR_LANTERN : node.major ? COLOR_GOLD : COLOR_MOON;
      const material = new THREE.SpriteMaterial({
        map: glow,
        color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(node.pos);
      const base = node.major ? 0.42 + node.weight * 0.1 : 0.2;
      sprite.scale.setScalar(base);
      sprite.userData = {index: i, base};
      group.add(sprite);
      return sprite;
    });

    // ── 선 ──
    const positions = new Float32Array(edges.length * 6);
    const colors = new Float32Array(edges.length * 6);
    const tint = new THREE.Color();
    edges.forEach((edge, i) => {
      const a = nodes[edge.a].pos;
      const b = nodes[edge.b].pos;
      positions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
      // 함께 쓴 횟수가 많을수록 밝다
      tint.setHex(COLOR_GOLD).multiplyScalar(0.25 + (edge.w / maxW) * 0.75);
      colors.set([tint.r, tint.g, tint.b, tint.r, tint.g, tint.b], i * 6);
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.22,
        depthWrite: false
      })
    );
    group.add(lines);

    // ── 크기 ──
    function resize() {
      const w = host!.clientWidth || 460;
      const h = host!.clientHeight || 460;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    // ── 조작: 끌어서 돌리고, 놓으면 관성으로 계속 돈다 ──
    let rotX = 0.1;
    let rotY = 0;
    let velX = 0;
    let velY = 0.0016; // 가만히 두면 아주 느리게 자전
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    function onDown(event: PointerEvent) {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      host!.setPointerCapture(event.pointerId);
      host!.style.cursor = "grabbing";
      // 한 번 끌어 본 사람에게는 안내를 더 보여줄 이유가 없다
      if (hint) hint.style.opacity = "0";
    }
    function onUp(event: PointerEvent) {
      dragging = false;
      if (host!.hasPointerCapture(event.pointerId)) {
        host!.releasePointerCapture(event.pointerId);
      }
      host!.style.cursor = "grab";
    }

    const pointer = new THREE.Vector2(-10, -10);
    function onMove(event: PointerEvent) {
      const rect = host!.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      if (!dragging) return;
      velY = (event.clientX - lastX) * 0.0038;
      velX = (event.clientY - lastY) * 0.0032;
      lastX = event.clientX;
      lastY = event.clientY;
    }
    function onLeave() {
      pointer.set(-10, -10);
    }

    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    // ── 호버 ──
    const raycaster = new THREE.Raycaster();
    let hovered = -1;
    const viewPos = new THREE.Vector3();
    const screenPos = new THREE.Vector3();

    let raf = 0;
    function frame() {
      raf = requestAnimationFrame(frame);

      if (!reduced) {
        if (!dragging) {
          // 관성 감쇠. 다 죽으면 기본 자전 속도로 되돌아온다
          velX *= 0.94;
          velY = velY * 0.94 + 0.0016 * 0.06;
        }
        rotY += velY;
        rotX = Math.max(-0.85, Math.min(0.85, rotX + velX));
        group.rotation.y = rotY;
        group.rotation.x = rotX;
      }

      // 호버 판정
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(sprites, false);
      const next = hits.length ? (hits[0].object.userData.index as number) : -1;
      if (next !== hovered) {
        hovered = next;
        if (hovered >= 0) {
          const node = nodes[hovered];
          label!.textContent = `${node.name} · ${node.weight}개 프로젝트`;
          label!.style.opacity = "1";
        } else {
          label!.style.opacity = "0";
        }
      }

      // 깊이감 + 숨쉬기 + 호버 강조
      const now = performance.now();
      sprites.forEach((sprite, i) => {
        sprite.getWorldPosition(viewPos);
        viewPos.applyMatrix4(camera.matrixWorldInverse);
        // 뒤로 갈수록 흐려진다 — three 의 fog 대신 직접 계산한다(위 주석 참고)
        const depth = Math.min(1, Math.max(0, (viewPos.z + 4.4) / 6.6));
        const breathe = reduced
          ? 1
          : 0.86 + Math.sin(now * 0.0011 + i * 1.7) * 0.14;
        const isHot = i === hovered;
        const material = sprite.material as THREE.SpriteMaterial;
        material.opacity = (0.2 + depth * 0.8) * breathe * (isHot ? 1.6 : 1);
        const base = sprite.userData.base as number;
        sprite.scale.setScalar(base * (isHot ? 1.55 : 1) * (0.9 + depth * 0.2));
      });
      (lines.material as THREE.LineBasicMaterial).opacity = 0.22;

      // 이름표를 별 위치로 옮긴다
      if (hovered >= 0) {
        sprites[hovered].getWorldPosition(screenPos);
        screenPos.project(camera);
        const rect = host!.getBoundingClientRect();
        label!.style.left = `${((screenPos.x + 1) / 2) * rect.width}px`;
        label!.style.top = `${((-screenPos.y + 1) / 2) * rect.height - 38}px`;
      }

      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      sprites.forEach(s => (s.material as THREE.SpriteMaterial).dispose());
      lineGeo.dispose();
      (lines.material as THREE.LineBasicMaterial).dispose();
      glow.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="tech-constellation"
      style={{position: "relative", width: "100%", height: "100%"}}
    >
      <canvas id="mesh-canvas" ref={canvasRef} />
      {/* 이름표 — 평소엔 숨어 있다가 별에 마우스를 올렸을 때만 뜬다.
          이게 "멀리서는 성운, 다가가면 지도"의 장치다. */}
      <div className="constellation-label" ref={labelRef} />
      {/* 끌 수 있다는 안내.
          이 앱은 전역 커스텀 커서(`custom-cursor-active`)를 써서 네이티브 커서를
          통째로 숨긴다 — 그래서 `cursor: grab` 이 화면에 나타나지 않는다.
          조작 가능하다는 신호를 다른 데서 줘야 해서 이 줄을 둔다. 한 번 끌면 사라진다. */}
      <div className="constellation-hint" ref={hintRef}>
        끌어서 돌려보기 · 별에 올리면 기술 이름
      </div>
    </div>
  );
}
