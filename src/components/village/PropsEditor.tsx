"use client";

import {Html} from "@react-three/drei";
import {useThree, type ThreeEvent} from "@react-three/fiber";
import {useCallback, useEffect, useState} from "react";
import {Plane, Raycaster, Vector2, Vector3} from "three";
import {villageBuildings} from "@/lib/constants";
import savedLayout from "@/data/propsLayout.json";
import type {BuildingOverride, PropPlacement, PropsLayout} from "@/types/props";
import {terrainHeightAt} from "@/lib/villageTerrain";
import {InstancedProps} from "./InstancedProps";

const isDev = process.env.NODE_ENV === "development";

// "/models/props/buildings/tower.glb" → "buildings"
function groupAssets(assets: string[]): {category: string; files: string[]}[] {
  const map = new Map<string, string[]>();
  for (const a of assets) {
    const rel = a.replace("/models/props/", "");
    const parts = rel.split("/");
    const category = parts.length > 1 ? parts[0] : "기타";
    if (!map.has(category)) map.set(category, []);
    map.get(category)!.push(a);
  }
  return [...map.entries()]
    .sort((x, y) => x[0].localeCompare(y[0]))
    .map(([category, files]) => ({category, files}));
}

type Selection = {kind: "prop" | "building"; id: string} | null;
type Transform = {
  position: [number, number, number];
  rotationY: number;
  scale: number;
};

// ─── 통합 편집 상태 훅 ────────────────────────────────────────────────────────
export function usePropsEditor() {
  const initial = savedLayout as unknown as PropsLayout;
  const [editMode, setEditMode] = useState(false);
  const [assets, setAssets] = useState<string[]>([]);
  const [items, setItems] = useState<PropPlacement[]>(initial.props ?? []);
  const [buildingOverrides, setBuildingOverrides] = useState<
    Record<string, BuildingOverride>
  >(initial.buildings ?? {});
  const [selection, setSelection] = useState<Selection>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("");
  // 트레이 → 씬 드래그 드롭 요청 (스크린 좌표)
  const [pendingDrop, setPendingDrop] = useState<{
    glb: string;
    clientX: number;
    clientY: number;
  } | null>(null);

  useEffect(() => {
    if (!isDev) return;
    fetch("/api/props")
      .then(r => r.json())
      .then((d: {assets: string[]; layout: PropsLayout}) => {
        setAssets(d.assets ?? []);
        if (d.layout?.props) setItems(d.layout.props);
        if (d.layout?.buildings) setBuildingOverrides(d.layout.buildings);
      })
      .catch(() => {});
  }, []);

  // 선택된 대상의 현재 변형값
  const selTransform: Transform | null = (() => {
    if (selection?.kind === "prop") {
      const p = items.find(x => x.id === selection.id);
      return p
        ? {position: p.position, rotationY: p.rotationY, scale: p.scale}
        : null;
    }
    if (selection?.kind === "building") {
      const b = villageBuildings.find(x => x.id === selection.id);
      if (!b) return null;
      const ov = buildingOverrides[selection.id] ?? {};
      return {
        position: ov.position ?? b.position,
        rotationY: ov.rotationY ?? 0,
        scale: ov.scale ?? 1
      };
    }
    return null;
  })();

  function updateSelected(patch: Partial<Transform>) {
    if (selection?.kind === "prop") {
      setItems(prev =>
        prev.map(p => (p.id === selection.id ? {...p, ...patch} : p))
      );
    } else if (selection?.kind === "building") {
      setBuildingOverrides(prev => ({
        ...prev,
        [selection.id]: {...(prev[selection.id] ?? {}), ...patch}
      }));
    }
  }
  function moveSelected(x: number, z: number) {
    if (!selTransform) return;
    updateSelected({position: [x, selTransform.position[1], z]});
  }
  function addPropAt(glb: string, position: [number, number, number]) {
    const id = `prop_${Date.now().toString(36)}`;
    setItems(prev => [...prev, {id, glb, position, rotationY: 0, scale: 1}]);
    setSelection({kind: "prop", id});
    setStatus(`추가됨: ${glb.split("/").pop()}`);
  }
  function deleteSelected() {
    if (selection?.kind === "prop") {
      setItems(prev => prev.filter(p => p.id !== selection.id));
    } else if (selection?.kind === "building") {
      setBuildingOverrides(prev => {
        const next = {...prev};
        delete next[selection.id];
        return next;
      });
    }
    setSelection(null);
  }
  async function save() {
    setStatus("저장 중...");
    try {
      const res = await fetch("/api/props", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({props: items, buildings: buildingOverrides})
      });
      const d = await res.json();
      setStatus(
        res.ok
          ? `저장 완료 (prop ${d.props} · 건물 ${d.buildings})`
          : `저장 실패: ${d.error ?? res.status}`
      );
    } catch (err) {
      setStatus(`저장 실패: ${String(err)}`);
    }
  }

  return {
    enabled: isDev,
    editMode,
    setEditMode,
    assets,
    items,
    buildingOverrides,
    selection,
    selTransform,
    setSelection,
    dragging,
    setDragging,
    pendingDrop,
    setPendingDrop,
    status,
    updateSelected,
    moveSelected,
    addPropAt,
    deleteSelected,
    save
  };
}

export type PropsEditorApi = ReturnType<typeof usePropsEditor>;

// ─── 씬 안: prop 렌더 + 드래그 평면 + 트레이 드롭 처리 ─────────────────────────
// prop 본체는 InstancedProps가 GLB별로 묶어서 그린다 (draw call = GLB 종류 수).
// 여기서는 편집용 상호작용(선택/드래그/드롭)만 담당한다.
export function PropsLayer({api}: {api: PropsEditorApi}) {
  const {items, editMode, selection, dragging, setSelection, setDragging} = api;

  // InstancedProps에 넘기는 콜백 — 참조가 매번 바뀌면 인스턴스 메시가 재생성되므로 고정한다
  const onPropDown = useCallback(
    (e: ThreeEvent<PointerEvent>, id: string) => {
      e.stopPropagation();
      setSelection({kind: "prop", id});
      setDragging(true);
    },
    [setSelection, setDragging]
  );

  // 선택 표시는 인스턴싱 밖에서 하나만 그린다 (기존엔 prop마다 조건부 렌더였다)
  const selected =
    editMode && selection?.kind === "prop"
      ? items.find(p => p.id === selection.id)
      : undefined;

  return (
    <group>
      {/* 드래그 처리 — 메시 대신 수학 평면 레이캐스트라 다른 오브젝트에 안 가림 */}
      {editMode && dragging ? <DragController api={api} /> : null}

      <InstancedProps
        items={items}
        onPropDown={editMode ? onPropDown : undefined}
      />

      {selected ? (
        // 선택 링도 단차만큼 올려야 프롭 발밑에 붙는다 (InstancedProps 와 같은 규칙)
        <group
          position={[
            selected.position[0],
            selected.position[1] +
              terrainHeightAt(selected.position[0], selected.position[2]),
            selected.position[2]
          ]}
          rotation={[0, selected.rotationY, 0]}
        >
          <SelectionRing />
        </group>
      ) : null}

      {editMode ? <SelectionCoordLabel api={api} /> : null}
      <DropHandler api={api} />
    </group>
  );
}

// 선택된 대상 위에 실시간 X/Y/Z 좌표 칩 (유니티 기즈모 느낌)
function SelectionCoordLabel({api}: {api: PropsEditorApi}) {
  const {selection, selTransform} = api;
  if (!selection || !selTransform) return null;
  const [x, y, z] = selTransform.position;
  let labelY: number;
  if (selection.kind === "building") {
    const b = villageBuildings.find(v => v.id === selection.id);
    const h = (b ? b.size[1] : 1.5) * selTransform.scale;
    labelY = y + h + 0.9;
  } else {
    labelY = y + 1.4 * selTransform.scale + 0.5;
  }
  const cell = (label: string, v: number, color: string) => (
    <span style={{display: "inline-flex", gap: 3, alignItems: "baseline"}}>
      <span style={{color, fontWeight: 900}}>{label}</span>
      <span style={{color: "#eef2f9"}}>{v.toFixed(2)}</span>
    </span>
  );
  return (
    <Html
      position={[x, labelY, z]}
      center
      distanceFactor={9}
      zIndexRange={[40, 0]}
    >
      <div
        style={{
          pointerEvents: "none",
          display: "flex",
          gap: 10,
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          fontSize: 12,
          padding: "5px 11px",
          borderRadius: 8,
          border: "1px solid rgba(134,176,230,0.45)",
          background: "rgba(10,16,27,0.92)",
          boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)"
        }}
      >
        {cell("X", x, "#ff8a80")}
        {cell("Y", y, "#6fe0a8")}
        {cell("Z", z, "#86b0e6")}
      </div>
    </Html>
  );
}

// 선택된 오브젝트에 빛나는 외곽선 (편집 중에만 렌더)
export function SelectionRing() {
  return (
    <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.55, 0.7, 40]} />
      <meshBasicMaterial color="#86b0e6" transparent opacity={0.9} />
    </mesh>
  );
}

// 드래그 중 커서를 바닥(y=0) 평면에 레이캐스트해 선택 대상을 이동
function DragController({api}: {api: PropsEditorApi}) {
  const {moveSelected, setDragging} = api;
  const {camera, gl} = useThree();
  useEffect(() => {
    const el = gl.domElement;
    const ray = new Raycaster();
    const plane = new Plane(new Vector3(0, 1, 0), 0);
    const ndc = new Vector2();
    const hit = new Vector3();
    function onMove(e: PointerEvent) {
      const rect = el.getBoundingClientRect();
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      );
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) moveSelected(hit.x, hit.z);
    }
    function onUp() {
      setDragging(false);
    }
    el.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [camera, gl, moveSelected, setDragging]);
  return null;
}

// 트레이에서 떨어뜨린 스크린 좌표를 바닥 월드 좌표로 변환해 prop 추가
function DropHandler({api}: {api: PropsEditorApi}) {
  const {pendingDrop, setPendingDrop, addPropAt} = api;
  const {camera, gl} = useThree();
  useEffect(() => {
    if (!pendingDrop) return;
    const rect = gl.domElement.getBoundingClientRect();
    const ndc = new Vector2(
      ((pendingDrop.clientX - rect.left) / rect.width) * 2 - 1,
      -(((pendingDrop.clientY - rect.top) / rect.height) * 2 - 1)
    );
    const ray = new Raycaster();
    ray.setFromCamera(ndc, camera);
    const hit = new Vector3();
    const ground = new Plane(new Vector3(0, 1, 0), 0);
    if (ray.ray.intersectPlane(ground, hit)) {
      addPropAt(pendingDrop.glb, [hit.x, 0, hit.z]);
    }
    setPendingDrop(null);
  }, [pendingDrop, camera, gl, addPropAt, setPendingDrop]);
  return null;
}

// ─── 하단 트레이 (DOM, draggable) ─────────────────────────────────────────────
export function PropsEditorTray({api}: {api: PropsEditorApi}) {
  const {
    enabled,
    editMode,
    setEditMode,
    assets,
    selection,
    selTransform,
    status,
    updateSelected,
    deleteSelected,
    save
  } = api;
  if (!enabled) return null;

  return (
    <>
      {/* 편집 모드 토글 */}
      <button
        type="button"
        onClick={() => setEditMode(!editMode)}
        className={`fixed left-4 top-20 z-40 rounded-lg border px-3 py-2 font-mono text-xs font-black backdrop-blur-md transition ${
          editMode
            ? "border-[#86b0e6] bg-[#5b8fd6]/20 text-[#86b0e6]"
            : "border-[#5b8fd6]/35 bg-[#0a101b]/85 text-[#5b8fd6]/80 hover:border-[#86b0e6]"
        }`}
      >
        {editMode ? "✦ 편집 모드 ON" : "✎ 배치 편집"}
      </button>

      {editMode ? (
        <>
          {/* 선택된 대상 변형 패널 (우측) */}
          {selTransform ? (
            <div className="fixed right-4 top-20 z-40 flex w-64 flex-col gap-2.5 rounded-xl border border-[#5b8fd6]/30 bg-[#0a101b]/92 p-3.5 font-mono text-[#cdd9ec] shadow-2xl backdrop-blur-md">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#86b0e6]">
                {selection?.kind === "building"
                  ? "🏢 건물 편집"
                  : "📦 prop 편집"}
              </div>
              {/* 좌표 직접 입력 (드래그 대신 정밀 배치) */}
              <div className="flex gap-1.5">
                {([0, 1, 2] as const).map(axis => (
                  <label
                    key={axis}
                    className="flex-1 text-[9px] uppercase tracking-[0.1em] text-[#5a6678]"
                  >
                    {["X", "Y", "Z"][axis]}
                    <input
                      type="number"
                      step={0.1}
                      value={Number(selTransform.position[axis].toFixed(2))}
                      onChange={e => {
                        const next = [...selTransform.position] as [
                          number,
                          number,
                          number
                        ];
                        next[axis] = Number(e.target.value);
                        updateSelected({position: next});
                      }}
                      className="mt-0.5 w-full rounded border border-[#5b8fd6]/25 bg-[#5b8fd6]/[0.06] px-1.5 py-1 text-[11px] text-[#eef2f9] outline-none focus:border-[#86b0e6]"
                    />
                  </label>
                ))}
              </div>
              <div className="text-[9px] text-[#5a6678]">
                씬에서 드래그 또는 위 칸에 직접 입력
              </div>
              <label className="text-[10px] uppercase tracking-[0.14em] text-[#5a6678]">
                높이 Y · {selTransform.position[1].toFixed(2)}
                <input
                  type="range"
                  min={-1}
                  max={4}
                  step={0.05}
                  value={selTransform.position[1]}
                  onChange={e =>
                    updateSelected({
                      position: [
                        selTransform.position[0],
                        Number(e.target.value),
                        selTransform.position[2]
                      ]
                    })
                  }
                  className="mt-1 w-full accent-[#86b0e6]"
                />
              </label>
              <label className="text-[10px] uppercase tracking-[0.14em] text-[#5a6678]">
                회전 · {((selTransform.rotationY * 180) / Math.PI).toFixed(0)}°
                <input
                  type="range"
                  min={0}
                  max={Math.PI * 2}
                  step={0.02}
                  value={selTransform.rotationY}
                  onChange={e =>
                    updateSelected({rotationY: Number(e.target.value)})
                  }
                  className="mt-1 w-full accent-[#86b0e6]"
                />
              </label>
              <label className="text-[10px] uppercase tracking-[0.14em] text-[#5a6678]">
                크기 · {selTransform.scale.toFixed(2)}x
                <input
                  type="range"
                  min={0.1}
                  max={6}
                  step={0.05}
                  value={selTransform.scale}
                  onChange={e =>
                    updateSelected({scale: Number(e.target.value)})
                  }
                  className="mt-1 w-full accent-[#86b0e6]"
                />
              </label>
              <button
                type="button"
                onClick={deleteSelected}
                className="rounded border border-[#ef4444]/40 bg-[#ef4444]/10 px-2 py-1.5 text-[11px] text-[#ff8a80] hover:bg-[#ef4444]/20"
              >
                {selection?.kind === "building"
                  ? "↺ 원위치로 (override 제거)"
                  : "🗑 삭제"}
              </button>
            </div>
          ) : null}

          {/* 하단 에셋 트레이 */}
          <div className="fixed bottom-4 left-1/2 z-40 flex max-h-[40vh] w-[min(92vw,920px)] -translate-x-1/2 flex-col gap-2 rounded-xl border border-[#5b8fd6]/30 bg-[#0a101b]/92 p-3 font-mono text-[#cdd9ec] shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#86b0e6]">
                에셋 트레이 · 씬으로 드래그
              </span>
              <button
                type="button"
                onClick={save}
                className="rounded-lg border border-[#6fe0a8]/40 bg-[#6fe0a8]/10 px-3 py-1.5 text-[11px] font-black text-[#6fe0a8] hover:bg-[#6fe0a8]/20"
              >
                💾 저장
              </button>
            </div>
            {assets.length === 0 ? (
              <p className="text-[11px] leading-5 text-[#5a6678]">
                props 폴더에 GLB가 없어요. Meshy GLB를{" "}
                <span className="text-[#86b0e6]">
                  public/models/props/raw/&lt;카테고리&gt;/
                </span>
                에 넣고 <span className="text-[#86b0e6]">npm run optimize</span>{" "}
                실행.
              </p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-1">
                {groupAssets(assets).map(({category, files}) => (
                  <div key={category} className="flex flex-col gap-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#86b0e6]/70">
                      📁 {category}
                    </div>
                    <div className="flex gap-1.5">
                      {files.map(a => (
                        <div
                          key={a}
                          draggable
                          onDragStart={e =>
                            e.dataTransfer.setData("application/x-prop-glb", a)
                          }
                          title={a.split("/").pop()}
                          className="flex h-16 w-20 cursor-grab items-end justify-center rounded border border-[#5b8fd6]/20 bg-[#5b8fd6]/[0.07] p-1 text-center text-[9px] leading-tight hover:border-[#86b0e6]/60 hover:bg-[#5b8fd6]/15 active:cursor-grabbing"
                        >
                          <span className="line-clamp-2 break-all">
                            {a.split("/").pop()?.replace(".glb", "")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {status ? (
              <div className="text-[10px] text-[#86b0e6]">{status}</div>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
