"use client";

import {Canvas} from "@react-three/fiber";
import {AdaptiveDpr, AdaptiveEvents, ContactShadows, Html, useGLTF, useTexture} from "@react-three/drei";
import {memo, Suspense, useEffect, useMemo} from "react";
import {RepeatWrapping, SRGBColorSpace} from "three";
import {npcBehaviorProfiles} from "@/data/npcBehaviors";
import {autonomousNpcs} from "@/data/npcRoster";
import {createThrottledCalculatePosition, LABEL_SYNC_STRIDE} from "@/lib/htmlLabelThrottle";
import {spread, villageBuildings} from "@/lib/constants";
import {buildBuildingStateMap, buildNpcStateMap} from "@/lib/liveState";
import type {NpcRuntimeState, VillageState} from "@/types/live";
import type {ExplorationMode, NPCData, SectionId, Vector3Tuple} from "@/types/portfolio";
import {Building} from "./Building";
import {BuildingNetwork} from "./BuildingNetwork";
import {CameraController} from "./CameraController";
import {CharacterController} from "./CharacterController";
import {NPC, type NpcCommand} from "./NPC";
import {PerfHudPanel, PerfProbe} from "./PerfHud";
import {SeasonAmbience} from "./SeasonAmbience";
import {PropsEditorTray, PropsLayer, usePropsEditor} from "./PropsEditor";

interface VillageSceneProps {
  activeSection: SectionId;
  activeNpcId?: string;
  explorationMode: ExplorationMode;
  isIntro?: boolean;
  onSelectSection: (sectionId: SectionId) => void;
  onSelectNpc: (npc: NPCData) => void;
  onRequestEnter: (buildingId: string) => void;
  npcRuntimeStates: Record<string, NpcRuntimeState>;
  onNpcPositionChange: (npcId: string, position: Vector3Tuple) => void;
  villageState: VillageState | null;
  guideScriptedTarget?: Vector3Tuple | null;
  onGuideArrive?: () => void;
  guideForceHold?: boolean;
  cinematic?: {position: [number, number, number]; lookAt: [number, number, number]} | null;
  npcCommand?: NpcCommand | null;
  npcCommandTargets?: Record<string, Vector3Tuple>;
  overseerTarget?: Vector3Tuple | null;
  onEditingChange?: (editing: boolean) => void;
  npcSocialTargets?: Record<string, Vector3Tuple>;
}

// 네트워크 펄스로 연결할 프로젝트 건물들 (한 번만 계산)
const projectNetworkBuildings = villageBuildings.filter((b) => b.district === "projects");

// walk 모드/편집 중엔 건물 클릭 입장을 비활성화 — 매 렌더 새 화살표 함수를 만들지 않도록 고정 참조 사용
const noopRequestEnter = () => {};

// 가이드 NPC 연출 시작 지점 — 매 렌더 새 배열을 만들지 않도록 모듈 상수로 고정
const GUIDE_SCRIPTED_START: [number, number, number] = [-4, 0, 1];

// 접속 시각에 따른 마을 분위기 — 새벽/낮/노을/밤. (낮은 기존과 동일)
function timePalette(hour: number) {
  if (hour >= 20 || hour < 5) {
    return {sky: "#0b1430", fog: "#0a1830", near: 24, far: 60, amb: 2.4, sun: "#5566a0", sunI: 1.6, fill: "#33457f", fillI: 1.2, hSky: "#16264a", hGround: "#0a1a2a", hI: 1.4, label: "밤"};
  }
  if (hour < 8) {
    return {sky: "#e6b896", fog: "#e8c6a4", near: 30, far: 66, amb: 3.4, sun: "#ffd6a6", sunI: 4.0, fill: "#ffc2d2", fillI: 1.9, hSky: "#f0c8a4", hGround: "#566a3a", hI: 2.4, label: "새벽"};
  }
  if (hour < 17) {
    // 낮은 예전 바닥(어두운 사이버펑크 원반)에 맞춰 amb 4.5 / sun 5.0 / hemi 3.0 이었다.
    // 잔디 바닥으로 바꾸고 나니 밝은 알베도가 통째로 하얗게 날아가 자갈길이 안 보였다.
    // 채워 넣는 빛(ambient·hemi)을 절반 가까이 줄여 태양이 형태를 만들게 한다.
    return {sky: "#a8c8e8", fog: "#b8d4ee", near: 35, far: 70, amb: 1.6, sun: "#fff8e8", sunI: 3.2, fill: "#d0e8ff", fillI: 1.1, hSky: "#87ceeb", hGround: "#4a7a3a", hI: 1.0, label: "낮"};
  }
  return {sky: "#e09a64", fog: "#e6ad7e", near: 28, far: 62, amb: 3.1, sun: "#ff945a", sunI: 3.8, fill: "#ffb184", fillI: 1.9, hSky: "#e8a070", hGround: "#5a5a2a", hI: 2.1, label: "노을"};
}

function Statue() {
  const {scene} = useGLTF("/models/environment/statue.glb");
  return (
    <primitive
      object={scene}
      position={[0, 2.5, 2]}
      scale={[3.5, 3.5, 3.5]}
      castShadow
    />
  );
}

useGLTF.preload("/models/environment/statue.glb");

// 마을 바닥.
//
// 예전엔 environment/ground.glb(사이버펑크 원반 + 청록 pointLight)를 깔았는데
// 두 가지가 걸렸다. ① 반지름이 x ±16.2 / z −14.2~18.2 라서, 구역을 바깥으로
// 밀어놓은 지금의 마을(x −19.8~21.3 / z −14.9~22.0)에선 가장자리 건물이 바닥
// 밖에 떠 있었다. ② 안쪽 바닥이 y = −0.3인데 건물은 y = 0에 서 있어 0.3만큼 떴다.
//
// 그래서 잔디 텍스처를 반복해 까는 평면 하나로 바꿨다. 삼각형 2개라 공짜에 가깝고,
// 크기를 마을보다 넉넉히 잡아 가장자리는 fog가 먹는다. 길·광장은 이 위에
// propsLayout.json의 ground 프롭(GLB 타일)이 얹힌다.
const GROUND_SIZE = 90;
/** 잔디 텍스처 1장이 덮는 월드 크기(유닛). 작을수록 잔디결이 촘촘해진다. */
// 512px 텍스처를 4유닛에 펴 바르면 카메라를 붙였을 때 결이 뭉개져 초록 죽처럼 보인다.
//
// 길 타일은 512px 텍스처가 1.88유닛(타일 한 칸)을 덮는다. 평면이 2.6유닛이면
// 같은 화면 안에서 평면만 결이 성겨 밉맵에 뭉개지고, 타일의 잔디 갓길만 또렷해서
// 길가에 밝은 사각형이 줄지어 보였다. 타일과 비슷한 밀도로 맞춘다.
// 정확히 1.88로 두면 타일 격자와 주기가 겹쳐 물결무늬가 생기므로 조금 어긋낸다.
const GRASS_TILE_WORLD = 2.0;
// 색 보정은 이제 텍스처에 구워져 있다.
//
// 예전엔 풀숲 슬래브에서 뽑은 그림을 쓰면서, 길 타일 갓길과 색을 맞추려고 선형
// 공간에서 역산한 tint(#e4ed9f)를 곱했다. 그런데 그 그림에는 둔덕 같은 큰 덩어리가
// 있어 2.6유닛마다 격자로 되풀이돼 이불 누빔처럼 보였다.
// 지금은 scripts/make-grass-texture.mjs 가 큰 구조 없는 잔디를 갓길 색 그대로
// 만들어 낸다 — 곱할 게 없으니 흰색이다. 색을 바꾸려면 그 스크립트를 고칠 것.
const GRASS_TINT = "#ffffff";

// 잔디 텍스처는 scripts/make-grass-texture.mjs 가 만든다. 색은 길 타일 갓길에서
// 실측한 값이라, 길이 지나가도 경계가 안 드러난다. 예전 grass.jpg는 연노랑 초록이라
// 길이 잔디 위에 얹힌 초록 리본처럼 떠 보였다.
function Ground() {
  const map = useTexture("/textures/grass-village.png");
  useEffect(() => {
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(GROUND_SIZE / GRASS_TILE_WORLD, GROUND_SIZE / GRASS_TILE_WORLD);
    map.anisotropy = 8;
    map.colorSpace = SRGBColorSpace;
    map.needsUpdate = true;
  }, [map]);

  // polygonOffset — 길 타일이 잔디에 파묻히는 걸 막는다.
  // 타일 윗면은 잔디보다 겨우 몇 cm 위인데, 90유닛짜리 이 거대한 평면과 깊이값이
  // 사실상 같아서 조금만 멀어지면 잔디가 이겨버려 길이 통째로 사라졌다.
  // 잔디만 깊이 방향으로 뒤로 밀어두면 여유가 얼마든 항상 타일이 이긴다.
  return (
    <mesh position={[0, 0, 3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      <meshStandardMaterial
        map={map}
        color={GRASS_TINT}
        roughness={0.95}
        metalness={0}
        polygonOffset
        polygonOffsetFactor={2}
        polygonOffsetUnits={4}
      />
    </mesh>
  );
}

function DistrictSign({label, position, color}: {label: string; position: [number, number, number]; color: string}) {
  const calculatePosition = useMemo(() => createThrottledCalculatePosition(LABEL_SYNC_STRIDE), []);
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 1.1, 8]} />
        <meshStandardMaterial color="#0a1a2e" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[1.8, 0.36, 0.06]} />
        <meshStandardMaterial color="#050d1a" emissive={color} emissiveIntensity={0.18} roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.22, 0.04]}>
        <boxGeometry args={[1.82, 0.38, 0.01]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={2.5} decay={2} position={[0, 1.2, 0.2]} />
      <Html center calculatePosition={calculatePosition} distanceFactor={14} position={[0, 1.25, 0.08]} zIndexRange={[5, 0]}>
        <span style={{
          fontFamily: "monospace",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color,
          textShadow: `0 0 10px ${color}`,
          userSelect: "none",
          pointerEvents: "none",
          whiteSpace: "nowrap"
        }}>
          {"</>"} {label}
        </span>
      </Html>
    </group>
  );
}

function ActiveRoute({activeSection}: {activeSection: SectionId}) {
  const building = villageBuildings.find((b) => b.sectionId === activeSection && b.district !== "plaza");

  if (!building || activeSection === "intro") {
    return (
      <group>
        <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.55, 1.66, 64]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.65} />
        </mesh>
        <pointLight color="#00d4ff" intensity={1.2} distance={4} decay={2} position={[0, 0.4, 0]} />
      </group>
    );
  }

  const [x, , z] = building.position;
  const dist = Math.sqrt(x * x + z * z);
  const angle = Math.atan2(z, x);

  return (
    <group>
      {/* 길 타일 윗면이 y=0.02라, 예전 높이(0.014/0.015)에 그리면 길 밑에 깔려 안 보인다 */}
      <mesh position={[x / 2, 0.05, z / 2]} rotation={[-Math.PI / 2, 0, angle]}>
        <planeGeometry args={[dist, 0.07]} />
        <meshBasicMaterial color={building.accentColor} transparent opacity={0.8} />
      </mesh>
      <mesh position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.18, 1.3, 48]} />
        <meshBasicMaterial color={building.accentColor} transparent opacity={0.7} />
      </mesh>
      <pointLight color={building.accentColor} intensity={1.5} distance={4} decay={2} position={[x, 0.6, z]} />
    </group>
  );
}

function LiveDecorations({villageState}: {villageState: VillageState | null}) {
  if (!villageState) return null;

  const unlocked = new Set(villageState.unlocked_items);

  return (
    <group>
      {unlocked.has("training-statue") ? (
        <group position={[1.7, 0, 1.8]}>
          <mesh castShadow position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.35, 0.42, 0.36, 18]} />
            <meshStandardMaterial color="#26364a" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0, 0.72, 0]}>
            <boxGeometry args={[0.28, 0.72, 0.18]} />
            <meshStandardMaterial color="#7ed957" emissive="#7ed957" emissiveIntensity={0.18} />
          </mesh>
          <pointLight color="#7ed957" intensity={0.8} distance={3} decay={2} position={[0, 1.1, 0]} />
        </group>
      ) : null}

      {unlocked.has("lab-beacon") ? (
        <group position={[-4.2, 0, -3.4]}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1, 12]} />
            <meshStandardMaterial color="#0a1a2e" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.16, 18, 18]} />
            <meshBasicMaterial color="#00d4ff" />
          </mesh>
          <pointLight color="#00d4ff" intensity={1.5} distance={5} decay={2} position={[0, 1.2, 0]} />
        </group>
      ) : null}

      {unlocked.has("study-fountain") ? (
        <group position={[2.2, 0, -2.1]}>
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.48, 32]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.65} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

function VillageSceneImpl({
  activeSection, activeNpcId, explorationMode, isIntro = false,
  onSelectNpc, onRequestEnter, npcRuntimeStates, onNpcPositionChange, villageState,
  guideScriptedTarget, onGuideArrive, guideForceHold, cinematic,
  npcCommand, npcCommandTargets, overseerTarget, onEditingChange, npcSocialTargets
}: VillageSceneProps) {
  const isWalkMode = explorationMode === "walk";
  const propsApi = usePropsEditor();
  const editing = propsApi.enabled && propsApi.editMode;
  const sky = useMemo(() => timePalette(new Date().getHours()), []);
  // 모바일 라이트 모드 — 해상도/안티앨리어싱을 낮춰 성능·배터리 확보
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
    []
  );
  // villageState는 30초 주기로만 바뀌므로, npcRuntimeStates가 바뀌는 2~3초마다
  // 매번 Array.find로 선형 탐색하지 않도록 Map을 villageState가 바뀔 때만 새로 만든다.
  const buildingStateMap = useMemo(() => buildBuildingStateMap(villageState), [villageState]);
  const npcStateMap = useMemo(() => buildNpcStateMap(villageState), [villageState]);

  // 편집 모드일 때 부모가 자동 갱신(순찰·잡담·폴링)을 멈추도록 알린다.
  // (편집 중 잦은 리렌더 + 후처리 아웃라인이 R3F 재조정 루프를 유발하는 문제 방지)
  useEffect(() => {
    onEditingChange?.(editing);
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative h-[48vh] min-h-[390px] overflow-hidden border-y border-[#00d4ff]/15 bg-[#050d1a] shadow-[inset_0_-30px_70px_rgba(0,100,255,0.1)] md:h-screen md:min-h-[720px] md:border-y-0 md:border-r"
      onDragOver={editing ? (e) => e.preventDefault() : undefined}
      onDrop={editing ? (e) => {
        const glb = e.dataTransfer.getData("application/x-prop-glb");
        if (glb) {
          e.preventDefault();
          propsApi.setPendingDrop({glb, clientX: e.clientX, clientY: e.clientY});
        }
      } : undefined}
    >
      <Canvas
        camera={{fov: 40, position: [4, 14, 16]}}
        dpr={isMobile ? [1, 1] : [1, 1.25]}
        performance={{min: isMobile ? 0.4 : 0.5}}
        gl={{antialias: !isMobile, powerPreference: "high-performance"}}
      >
        {/* 움직일 땐 해상도/이벤트 자동 저하 → 멈추면 선명하게 */}
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />
        {/* 개발 모드 계기판 — Suspense 밖이라 로딩 중에도 계측된다 */}
        <PerfProbe />
        <color args={[sky.sky]} attach="background" />
        <fog args={[sky.fog, sky.near, sky.far]} attach="fog" />
        <ambientLight color="#ffffff" intensity={sky.amb} />
        <directionalLight color={sky.sun} intensity={sky.sunI} position={[8, 20, 8]} />
        <directionalLight color={sky.fill} intensity={sky.fillI} position={[-6, 12, -4]} />
        <hemisphereLight args={[sky.hSky, sky.hGround, sky.hI]} />

        {/* 구역마다 살짝 다른 색감을 주는 보조광. 원래는 네온(청록/보라/연두/주황)이라
            잔디 위에서 색이 튀어서, 노을 톤 안에서 온도만 다른 따뜻한 색으로 낮췄다. */}
        <pointLight color="#ffd9a8" intensity={1.2} distance={22} decay={2} position={[-5, 5, 0]} />
        <pointLight color="#e8c4ff" intensity={0.9} distance={20} decay={2} position={[3, 5, -5]} />
        <pointLight color="#d8f0b0" intensity={0.9} distance={20} decay={2} position={[6, 5, 5]} />
        <pointLight color="#ffbe86" intensity={0.9} distance={16} decay={2} position={[0, 4, 9]} />

        <Suspense fallback={null}>
          <Ground />
          <Statue />

          <DistrictSign label="Project District" position={spread([-8.5, 0, -5.5])} color="#00d4ff" />
          <DistrictSign label="Skills District" position={spread([0, 0, -9.0])} color="#aa44ff" />
          <DistrictSign label="Experience District" position={spread([9.2, 0, 5])} color="#00ff88" />
          <DistrictSign label="Life District" position={spread([11, 0, 2.5])} color="#fbbf24" />

          {!isWalkMode && <ActiveRoute activeSection={activeSection} />}
          <BuildingNetwork buildings={projectNetworkBuildings} />
          <LiveDecorations villageState={villageState} />
          <PropsLayer api={propsApi} />

          {villageBuildings.map((building) => {
            const ov = propsApi.buildingOverrides[building.id];
            const merged = ov?.position ? {...building, position: ov.position} : building;
            return (
              <Building
                key={building.id}
                building={merged}
                buildingState={buildingStateMap.get(building.id)}
                isActive={activeSection === building.sectionId}
                onRequestEnter={isWalkMode || editing ? noopRequestEnter : onRequestEnter}
                edit={editing ? {
                  editing: true,
                  selected: propsApi.selection?.kind === "building" && propsApi.selection.id === building.id,
                  rotationY: ov?.rotationY ?? 0,
                  scale: ov?.scale ?? 1,
                  onSelectDown: () => {
                    propsApi.setSelection({kind: "building", id: building.id});
                    propsApi.setDragging(true);
                  },
                } : undefined}
              />
            );
          })}

          {autonomousNpcs.map((npc, index) => (
            <NPC
              behavior={npcBehaviorProfiles[npc.id]}
              bubbleText={visibleBubble(npcRuntimeStates[npc.id])}
              buildings={villageBuildings}
              isActive={activeNpcId === npc.id}
              key={npc.id}
              npc={npc}
              baseNpcState={npcStateMap.get(npc.id)}
              runtimeMood={npcRuntimeStates[npc.id]?.mood}
              runtimeMemory={npcRuntimeStates[npc.id]?.memory}
              currentAction={npcRuntimeStates[npc.id]?.currentAction}
              onPositionChange={onNpcPositionChange}
              onSelect={onSelectNpc}
              facePoint={npcRuntimeStates[npc.id]?.facePoint}
              holdUntil={npcRuntimeStates[npc.id]?.holdUntil}
              emote={visibleEmote(npcRuntimeStates[npc.id])}
              socialTarget={npcSocialTargets?.[npc.id]}
              scriptedTarget={npc.id === "guide-npc" ? guideScriptedTarget : npc.id === "overseer-npc" ? overseerTarget : undefined}
              scriptedStart={npc.id === "guide-npc" ? GUIDE_SCRIPTED_START : undefined}
              onScriptedArrive={npc.id === "guide-npc" ? onGuideArrive : undefined}
              forceHold={npc.id === "guide-npc" ? guideForceHold : undefined}
              command={npcCommand}
              commandTarget={npcCommandTargets?.[npc.id]}
              commandSlot={index}
              commandTotal={autonomousNpcs.length}
            />
          ))}

          {/* 나무·바위는 propsLayout.json 의 decor 프롭으로 옮겼다 (scripts/generate-decor-layout.mjs).
              예전엔 여기서 네온 콘과 검은 다면체를 절차적으로 그렸는데, 마을이 따뜻한
              스타일로 바뀌면서 혼자 사이버펑크로 남아 겉돌았다. 자리는 constants.ts 의
              treePositions / rockPositions 를 그대로 쓴다. */}

          {/* 길 타일 윗면(y=0.02)과 같은 높이면 z-파이팅이 나므로 살짝 위로 */}
          <ContactShadows blur={1.5} far={12} frames={1} opacity={0.15} position={[0, 0.035, 2]} scale={26} />

          <SeasonAmbience lite={isMobile} />

          {isWalkMode
            ? <CharacterController />
            : <CameraController activeSection={activeSection} isIntro={isIntro} lockRotate={editing} cinematic={cinematic} />
          }
        </Suspense>
      </Canvas>

      {isWalkMode ? (
        <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-xl border border-[#00d4ff]/30 bg-[#050d1a]/85 px-4 py-2.5 backdrop-blur-md">
          {[["W", "앞"], ["A", "왼쪽"], ["S", "뒤"], ["D", "오른쪽"]].map(([key, label]) => (
            <span className="flex flex-col items-center gap-0.5" key={key}>
              <kbd className="rounded border border-[#00d4ff]/50 bg-[#0a1a30] px-2 py-0.5 font-mono text-xs font-black text-[#00d4ff]">{key}</kbd>
              <span className="font-mono text-[10px] text-[#0066aa]">{label}</span>
            </span>
          ))}
        </div>
      ) : (
        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-[#00d4ff]/25 bg-[#050d1a]/85 px-3 py-1.5 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00d4ff]/70 backdrop-blur-md">
          {sky.label === "밤" ? "🌙" : sky.label === "새벽" ? "🌅" : sky.label === "노을" ? "🌇" : "☀️"} {sky.label}
        </div>
      )}

      <PropsEditorTray api={propsApi} />
      <PerfHudPanel />
    </div>
  );
}

// 무관한 부모(AIPortfolioVillage) 리렌더에서 자체 .map() 재구성(건물 28개 + NPC 전체)을 스킵.
// npcRuntimeStates/villageState 등 실제 입력이 바뀔 때는 평소처럼 다시 렌더된다.
export const VillageScene = memo(VillageSceneImpl);

function visibleBubble(runtime?: NpcRuntimeState) {
  if (!runtime?.bubbleText || !runtime.bubbleExpiresAt) return undefined;
  return runtime.bubbleExpiresAt > Date.now() ? runtime.bubbleText : undefined;
}

function visibleEmote(runtime?: NpcRuntimeState) {
  if (!runtime?.emote || !runtime.emoteExpiresAt) return undefined;
  return runtime.emoteExpiresAt > Date.now() ? runtime.emote : undefined;
}
