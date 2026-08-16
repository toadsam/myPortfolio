"use client";

// 개발 모드 전용 성능 계기판.
//
// 왜 두 조각(Probe/Panel)으로 나눴나:
// 계측은 Canvas 안(useFrame)에서만 할 수 있고, 화면 표시는 DOM이 편하다.
// 그런데 매 프레임 React state를 갱신하면 계기판이 스스로 렉을 만든다.
// 그래서 Probe는 모듈 스토어에 값만 쌓고, Panel은 2Hz로 그 값을 읽어간다.
// (React 리렌더는 초당 2회 = 계측 오버헤드 사실상 0)

import {useFrame, useThree} from "@react-three/fiber";
import {useEffect, useRef, useState} from "react";
import type {Material, Mesh, Texture, WebGLRenderer} from "three";

const isDev = process.env.NODE_ENV === "development";

export interface PerfSample {
  fps: number;
  /** 이번 프레임 draw call — 웹에서 200 넘으면 경고 */
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  /** 컴파일된 셰이더 프로그램 수 — 머티리얼 종류가 늘면 같이 는다 */
  programs: number;
  /** 텍스처 VRAM 추정치(byte). 밉맵 포함. 2초에 한 번만 재계산 */
  textureBytes: number;
  /** 씬 그래프의 렌더 가능한 오브젝트 수 */
  objects: number;
}

const EMPTY: PerfSample = {
  fps: 0,
  calls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  programs: 0,
  textureBytes: 0,
  objects: 0
};

// ─── 모듈 스토어 (Probe → Panel 단방향) ───────────────────────────────────────
let latest: PerfSample = EMPTY;
const listeners = new Set<(s: PerfSample) => void>();

function publish(sample: PerfSample) {
  latest = sample;
  for (const fn of listeners) fn(sample);
}

// ─── 텍스처 VRAM 추정 ────────────────────────────────────────────────────────
// three는 텍스처 "개수"만 알려주고 바이트를 안 알려준다. 실제 VRAM은
// 픽셀수 × 4byte(RGBA) × 1.333(밉맵 체인)으로 추정한다. 압축 텍스처(KTX2)를
// 쓰기 시작하면 이 추정은 과대평가가 되므로 그때 보정해야 한다.
function estimateTextureBytes(
  renderer: WebGLRenderer,
  scene: {traverse: (fn: (o: object) => void) => void}
) {
  const seen = new Set<Texture>();
  let bytes = 0;

  const addTexture = (tex: unknown) => {
    if (!tex || typeof tex !== "object") return;
    const t = tex as Texture;
    if (!t.isTexture || seen.has(t)) return;
    seen.add(t);
    const img = t.image as {width?: number; height?: number} | undefined;
    const w = img?.width ?? 0;
    const h = img?.height ?? 0;
    if (!w || !h) return;
    // generateMipmaps가 꺼져 있으면 밉맵 체인이 없다
    bytes += w * h * 4 * (t.generateMipmaps ? 1.333 : 1);
  };

  const addMaterial = (mat: Material) => {
    for (const value of Object.values(
      mat as unknown as Record<string, unknown>
    ))
      addTexture(value);
  };

  scene.traverse(obj => {
    const mesh = obj as Mesh;
    if (!mesh.material) return;
    if (Array.isArray(mesh.material)) mesh.material.forEach(addMaterial);
    else addMaterial(mesh.material);
  });

  // 씬 그래프에 안 달린 것(배경/환경맵 등)은 못 잡지만 대세엔 지장 없음
  void renderer;
  return bytes;
}

// ─── Canvas 안에서 도는 계측기 ───────────────────────────────────────────────
export function PerfProbe() {
  const {gl, scene, camera} = useThree();

  // 계기판은 합계만 알려준다. "그래서 어느 GLB가 draw call을 먹고 있나"를 캐려면
  // 씬 그래프를 직접 세어봐야 하는데, r3f 스토어는 밖에서 잡을 방법이 없다.
  // 개발 모드에서만 창에 걸어 둔다 — 콘솔에서 __village.scene.traverse(...) 로 센다.
  // camera 도 같이 건다: 마을 전경을 확인하려면 OrbitControls의 maxDistance(36)
  // 밖으로 카메라를 잠깐 빼야 하는데, CameraController가 매 프레임 되돌린다.
  useEffect(() => {
    if (!isDev) return;
    (window as unknown as {__village?: unknown}).__village = {
      gl,
      scene,
      camera
    };
  }, [gl, scene, camera]);

  const frames = useRef(0);
  const windowStart = useRef(performance.now());
  const lastTextureScan = useRef(0);
  const textureBytes = useRef(0);

  useFrame(() => {
    frames.current += 1;
    const now = performance.now();
    const elapsed = now - windowStart.current;
    if (elapsed < 500) return;

    // gl.info는 매 render() 시작 시 리셋되므로 여기서 읽는 값은 직전 프레임 기준이다.
    const info = gl.info;

    // 텍스처 스캔은 씬 전체 순회라 비싸다 — 2초에 한 번만.
    if (now - lastTextureScan.current > 2000) {
      textureBytes.current = estimateTextureBytes(gl, scene);
      lastTextureScan.current = now;
    }

    let objects = 0;
    scene.traverse(() => {
      objects += 1;
    });

    publish({
      fps: Math.round((frames.current * 1000) / elapsed),
      calls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs?.length ?? 0,
      textureBytes: textureBytes.current,
      objects
    });

    frames.current = 0;
    windowStart.current = now;
  });

  return null;
}

// ─── DOM 계기판 ──────────────────────────────────────────────────────────────

// 예산 — 초과하면 색으로 경고. 중급 노트북 60fps 기준.
//
// 삼각형 100만 / 텍스처 250MB 로 잡았던 건 마을에 건물 18채와 소품 몇 개뿐이던
// 시절의 보수적인 값이다. 그 뒤로 폭포·풍차·북쪽 섬·구역 담장까지 들어오면서
// 실측 130만 언저리가 됐는데, 정작 fps 는 안 떨어졌다 — 전부 인스턴싱이라
// draw call 이 안 늘고, 요즘 GPU 에서 130만 삼각형은 부담이 아니다.
// 경고선을 실제로 위험해지는 지점으로 올린다. fps 와 draw call 이 진짜 지표다.
const BUDGET = {
  calls: 200,
  triangles: 1_800_000,
  textureBytes: 340 * 1024 * 1024,
  fps: 55
};

function tone(ok: boolean, warn: boolean) {
  if (warn) return "#ff6b6b";
  return ok ? "#6fe0a8" : "#ffcc66";
}

function Row({
  label,
  value,
  color,
  hint
}: {
  label: string;
  value: string;
  color: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[9px] uppercase tracking-[0.14em] text-[#5a6678]">
        {label}
      </span>
      <span className="flex items-baseline gap-1">
        <span className="text-[12px] font-black tabular-nums" style={{color}}>
          {value}
        </span>
        {hint ? (
          <span className="text-[8px] text-[#3f4a5a]">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}

function formatMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(0)}MB`;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function PerfHudPanel() {
  const [sample, setSample] = useState<PerfSample>(latest);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!isDev) return;
    listeners.add(setSample);
    return () => {
      listeners.delete(setSample);
    };
  }, []);

  // F8로 접기/펴기 — 스크린샷 찍을 때 방해되지 않도록
  useEffect(() => {
    if (!isDev) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "F8") {
        setOpen(v => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!isDev) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 rounded-lg border border-[#5b8fd6]/35 bg-[#0a101b]/85 px-2.5 py-1.5 font-mono text-[10px] font-black text-[#5b8fd6]/80 backdrop-blur-md hover:border-[#86b0e6]"
      >
        📊 {sample.fps}fps
      </button>
    );
  }

  const callsWarn = sample.calls > BUDGET.calls;
  const triWarn = sample.triangles > BUDGET.triangles;
  const texWarn = sample.textureBytes > BUDGET.textureBytes;
  const fpsLow = sample.fps > 0 && sample.fps < BUDGET.fps;

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[186px] rounded-xl border border-[#5b8fd6]/30 bg-[#0a101b]/92 p-3 font-mono shadow-2xl backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#86b0e6]">
          📊 perf
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          title="F8로도 접힘"
          className="text-[9px] text-[#5a6678] hover:text-[#86b0e6]"
        >
          F8 ✕
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <Row
          label="fps"
          value={String(sample.fps)}
          color={tone(!fpsLow, sample.fps > 0 && sample.fps < 30)}
        />
        <Row
          label="draw calls"
          value={String(sample.calls)}
          color={tone(!callsWarn, callsWarn)}
          hint={`/${BUDGET.calls}`}
        />
        <Row
          label="triangles"
          value={formatCount(sample.triangles)}
          color={tone(!triWarn, triWarn)}
          hint={`/${formatCount(BUDGET.triangles)}`}
        />
        <Row
          label="texture"
          value={formatMB(sample.textureBytes)}
          color={tone(!texWarn, texWarn)}
          hint={`/${formatMB(BUDGET.textureBytes)}`}
        />
      </div>

      <div className="mt-2 flex flex-col gap-1 border-t border-[#5b8fd6]/15 pt-2">
        <Row
          label="geometries"
          value={String(sample.geometries)}
          color="#8fa3bd"
        />
        <Row label="textures" value={String(sample.textures)} color="#8fa3bd" />
        <Row label="shaders" value={String(sample.programs)} color="#8fa3bd" />
        <Row label="objects" value={String(sample.objects)} color="#8fa3bd" />
      </div>

      {callsWarn ? (
        <p className="mt-2 text-[9px] leading-[1.35] text-[#ff6b6b]">
          draw call 초과 — 같은 GLB를 인스턴싱으로 묶으세요
        </p>
      ) : null}
      {texWarn ? (
        <p className="mt-2 text-[9px] leading-[1.35] text-[#ff6b6b]">
          텍스처 초과 — 해상도를 낮추거나 빈 맵을 지우세요
        </p>
      ) : null}
    </div>
  );
}
