"use client";

import {Html, useCursor, useGLTF} from "@react-three/drei";
import {memo, useMemo, useRef, useState} from "react";
import {useFrame, type ThreeEvent} from "@react-three/fiber";
import {
  AdditiveBlending,
  Box3,
  BoxGeometry,
  EdgesGeometry,
  type Group,
  type Mesh,
  type MeshStandardMaterial
} from "three";
import {lightIntensity} from "@/lib/liveState";
import {PooledLight} from "./LightPool";
import {lockSceneMaterials} from "@/lib/villageMaterial";
import {
  createThrottledCalculatePosition,
  LABEL_SYNC_STRIDE
} from "@/lib/htmlLabelThrottle";
import type {BuildingState} from "@/types/live";
import type {BuildingData} from "@/types/portfolio";
import buildingModelsJson from "@/data/buildingModels.json";
import {techIcons} from "@/data/techIcons";
import {VILLAGE_PALETTE} from "@/lib/villagePalette";
import {terrainHeightAt} from "@/lib/villageTerrain";
import {extendGltfLoader} from "@/lib/gltfLoaders";

// 생성된 JSON이라 키가 그때그때 달라진다 — 지금 있는 4채로 타입이 굳으면
// 다음 건물을 넣을 때마다 컴파일이 깨진다.
const buildingModels: Record<string, string> = buildingModelsJson;

// ─── 호버 연출: 빛기둥 + 회전 베이스 링 2겹 (Developer City 이식) ──────────────

function HighlightFX({
  color,
  height,
  radius,
  active
}: {
  color: string;
  height: number;
  radius: number;
  active: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const beamRef = useRef<Mesh>(null);
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const intensity = useRef(0);

  useFrame((_, delta) => {
    // 부드러운 등장/퇴장 보간
    const target = active ? 1 : 0;
    intensity.current += (target - intensity.current) * Math.min(1, delta * 8);
    const k = intensity.current;

    // 꺼져 있을 때 통째로 숨긴다.
    // 예전엔 opacity만 0으로 낮췄는데, 투명해도 렌더러는 그린다 —
    // 건물 27채 × 메시 3개 = 상시 draw call 81회를 안 보이는 것에 쓰고 있었다.
    if (groupRef.current) {
      const on = k > 0.01;
      if (groupRef.current.visible !== on) groupRef.current.visible = on;
      if (!on) return;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.6;
      ring1Ref.current.scale.setScalar(0.9 + k * 0.2);
      (ring1Ref.current.material as {opacity: number}).opacity = k * 0.26;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.42;
      ring2Ref.current.scale.setScalar(1.05 + k * 0.25);
      (ring2Ref.current.material as {opacity: number}).opacity = k * 0.16;
    }
    if (beamRef.current) {
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.003);
      (beamRef.current.material as {opacity: number}).opacity =
        k * (0.12 + pulse * 0.1);
      beamRef.current.visible = k > 0.01;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* 빛기둥 — 지붕 위로 솟는 additive 컬럼.
          반지름을 건물 크기에 그대로 비례시켰더니 중앙 광장(폭 4.75)에서
          윗지름 4유닛짜리 원뿔이 돼, 노을 하늘 앞에서 숲을 하얗게 지우는
          **커다란 청록 쐐기**로 보였다. 큰 건물일수록 상한을 둔다. */}
      <mesh ref={beamRef} position={[0, height + 1.4, 0]}>
        <cylinderGeometry
          args={[
            Math.min(radius, 2.4) * 0.18,
            Math.min(radius, 2.4) * 0.42,
            3,
            12,
            1,
            true
          ]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          side={2}
        />
      </mesh>
      {/* 회전 베이스 링 2겹 */}
      <mesh
        ref={ring1Ref}
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[radius * 0.85, radius * 0.95, 48, 1, 0, Math.PI * 1.6]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          side={2}
        />
      </mesh>
      <mesh
        ref={ring2Ref}
        position={[0, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[radius * 1.05, radius * 1.12, 48, 1, 0, Math.PI * 1.2]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          side={2}
        />
      </mesh>
    </group>
  );
}

// ─── GLB 에셋 렌더러 ──────────────────────────────────────────────────────────

// 건물 GLB 메시는 포인터 판정에서 뺀다 — 수만 삼각형을 마우스 움직임마다 뒤지지
// 않게. 판정은 BuildingImpl 의 투명 박스 하나가 맡는다(NPC 히트박스와 같은 원리).
const noopRaycast = () => {};

function GlbModel({
  glbPath,
  size,
  boost = 1
}: {
  glbPath: string;
  size: [number, number, number];
  boost?: number;
}) {
  const {scene} = useGLTF(glbPath, true, true, extendGltfLoader);

  // <primitive castShadow /> 는 루트 Object3D 한 개에만 플래그를 세운다. GLB는
  // 안에 메시가 수십 개 들어 있는 계층이라, 루트만 켜면 그림자가 하나도 안 진다.
  // useGLTF는 같은 경로를 캐시해 돌려주므로 한 번만 훑으면 된다.
  //
  // ─── 저녁에 창문 켜기 ──────────────────────────────────────────────────────
  // 컨셉 아트가 해 진 뒤에도 따뜻해 보이는 건 건물마다 창문이 주황으로 빛나서다.
  // 우리 건물은 노을·밤에 그냥 검은 덩어리로 남았다.
  //
  // 창문만 골라내는 건 불가능하다 — Meshy 모델은 벽·창·지붕이 텍스처 한 장에
  // 다 그려진 아틀라스 하나다. 대신 그 텍스처를 **자기 발광 맵으로 재사용**한다.
  // 그러면 텍스처에서 밝은 픽셀(=창문·간판)이 어두운 픽셀(=벽)보다 훨씬 세게
  // 빛나서, 결과적으로 창문만 켜진 것처럼 보인다. 공짜에 가깝다.
  //
  // 건물 27채마다 pointLight 를 하나씩 두는 방법도 있었지만, three 는 광원마다
  // 셰이더 유니폼을 잡아서 27개면 컴파일이 터진다.
  useMemo(() => {
    // 빛 반응부터 통일한다 — Meshy 가 에셋마다 다르게 내보낸 metalness·roughness 를
    // 마을 공통값으로 잠근다. 색은 LUT 가, 반응은 여기가 묶는다.
    lockSceneMaterials(scene, glbPath);
    scene.traverse(obj => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.raycast = noopRaycast;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const material of mats) {
        const std = material as MeshStandardMaterial;
        if (!std || !("emissiveIntensity" in std)) continue;
        std.emissiveIntensity = VILLAGE_PALETTE.windowGlow;
        if (VILLAGE_PALETTE.windowGlow > 0) {
          std.emissive.set("#ffb968");
          if (std.map) std.emissiveMap = std.map;
        }
        std.needsUpdate = true;
      }
    });
  }, [scene]);
  // Meshy GLB는 원점 중심으로 나와서 그대로 놓으면 아래 절반이 지면에 묻힌다.
  // 바닥(min.y)을 y=0으로 끌어올린다. primitive가 scene에 직접 transform을 쓰므로
  // 측정할 때는 항등 변환으로 되돌렸다가 복원한다.
  const natural = useMemo(() => {
    const scale0 = scene.scale.clone();
    const pos0 = scene.position.clone();
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.updateWorldMatrix(false, true);
    const {min, max} = new Box3().setFromObject(scene);
    scene.scale.copy(scale0);
    scene.position.copy(pos0);
    scene.updateWorldMatrix(false, true);
    return {
      minY: min.y,
      width: Math.max(1e-4, max.x - min.x),
      height: Math.max(1e-4, max.y - min.y),
      depth: Math.max(1e-4, max.z - min.z)
    };
  }, [scene]);

  // 배율 잡기 — 두 번 틀리고 세 번째다. 기록을 남긴다.
  //
  // ① size[1] × 0.62 를 그냥 배율로: GLB마다 원본 높이가 1.13~1.91로 제각각이라
  //    같은 size[1]이 전혀 다른 크기를 만들었다.
  // ② 높이로만 나누기(size[1] / 모델높이): Meshy는 **가장 긴 변**을 1.9로 정규화하므로
  //    납작한 건물일수록 높이가 작고, 그러면 배율이 커져 가로가 터진다.
  //    실측으로 헬스장이 앞마당의 187%, ACLUB이 204%가 되어 길과 소품을 깔고 앉았다.
  // ③ 선언 상자(size)에 세 축 다 맞추기: 안 넘치긴 하는데 너무 작아졌다.
  //    나무(4.5~6.6m)보다 낮은 건물이 속출했다.
  //
  // 진짜 제약은 선언 상자가 아니라 **앞마당 원반**이다. 반지름이
  // max(w,d)/2 + 0.55 이므로(generate-ground-layout.mjs), 지름은 선언 폭 + 1.1 까지
  // 쓸 수 있다. 거기에 바닥을 맞춘다.
  // 원반은 원이고 건물은 사각이라, 폭·깊이를 지름에 맞추면 **모서리**가 삐져나온다
  // (실측: exp-portfolio 가 반지름의 132%). 대각선을 지름에 맞춰야 네 귀가 다 들어간다.
  //
  // 높이 상한은 1.25 → 1.6. 원래 목적은 홀쭉한 탑(backend)이 마천루가 되는 걸
  // 막는 것이었는데, 실측해 보니 18채 중 8채가 여기서 잘리고 있었다. 건물 높이
  // 중앙값이 2.14유닛 — 옆에 선 나무(4.5~5.0)의 절반도 안 돼서 마을이 모형처럼
  // 보이는 원인이었다. 1.6이면 원반이 유일한 제약이 되고(18채 중 17채), 상한은
  // 극단적인 비율만 잡아 주는 안전장치로 남는다.
  //
  // boost — 앞마당 원반 규칙에서 **일부러 벗어나는** 배율. 지금은 중앙 기념비
  // 하나만 쓴다. 컨셉 아트의 중심 첨탑은 마을에서 압도적으로 높은데, 원반에
  // 묶이면 연혁 타워와 키가 비슷해진다. size 를 키워 해결하려다 길 생성기가
  // 그 상자를 피하면서 광장 둘레 도로가 무너졌다 — size 는 길·충돌·앞마당이
  // 같이 읽는 값이라 건드리면 안 된다.
  const radius = Math.max(size[0], size[2]) / 2 + 0.55;
  const footprint = Math.hypot(natural.width, natural.depth);
  const scale =
    Math.min((radius * 2) / footprint, (size[1] * 1.6) / natural.height) *
    boost;
  return (
    <primitive
      object={scene}
      scale={scale}
      position={[0, -natural.minY * scale, 0]}
    />
  );
}

// ─── 공통 라벨 = 건물 간판 ────────────────────────────────────────────────────
//
// 예전엔 남색 배경에 시안 네온 테두리, 9~13px 모노스페이스, opacity 0.58 짜리
// "HUD 칩"이었다. 마을이 따뜻한 톤으로 바뀐 뒤에도 라벨만 사이버펑크로 남아
// 겉돌았고, 무엇보다 흐리고 작아서 "저기가 무슨 건물인지"가 안 읽혔다.
//
// 이제 나무 간판처럼 그린다. 3D로 안 만들고 DOM으로 두는 이유:
//   · draw call 0 — 계기판이 이미 예산(200)을 넘겨 있어 27개를 더 못 얹는다
//   · 자리 잡을 필요가 없다 — 건물 높이 위에 자동으로 뜬다. GLB 간판에 판을
//     맞추려면 건물 23채를 손으로 정렬해야 한다
//   · 텍스처가 아니라 벡터라 아무리 가까이 가도 안 뭉개진다
//
// 로고는 techStack 첫 항목에서 자동으로 찾는다 — 건물마다 아이콘을 따로
// 지정하지 않아도 된다. 브랜드 마크는 어두운 배지 위에 올린다: GitHub·Notion처럼
// 흰색이 본색인 로고가 나무판 위에서 사라지기 때문이다.

/** techStack 에서 아이콘이 있는 첫 기술을 찾는다 */
function leadIcon(techStack?: string[]) {
  if (!techStack) return null;
  for (const tech of techStack) {
    const icon = techIcons[tech];
    if (icon) return {tech, icon};
  }
  return null;
}

function BuildingLabel({
  building,
  buildingState,
  height,
  highlighted,
  onEnter
}: {
  building: BuildingData;
  height: number;
  highlighted: boolean;
  onEnter: () => void;
  buildingState?: BuildingState;
}) {
  const color = building.accentColor;
  const calculatePosition = useMemo(
    () => createThrottledCalculatePosition(LABEL_SYNC_STRIDE),
    []
  );
  const lead = useMemo(
    () => leadIcon(building.techStack),
    [building.techStack]
  );
  const live = buildingState && buildingState.light_level !== "dark";

  return (
    <Html
      center
      calculatePosition={calculatePosition}
      distanceFactor={11}
      position={[0, height + 1.15, 0]}
      wrapperClass="v-sign"
      zIndexRange={[10, 0]}
    >
      <button
        onClick={onEnter}
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          // 나무 테두리 + 크림색 판. 위아래로 살짝 어둡게 해 판이 두꺼워 보이게 한다.
          background: "linear-gradient(#fdf3df 0%, #f6e7c8 55%, #e8d3ac 100%)",
          border: `3px solid ${highlighted ? color : "#8a5a33"}`,
          borderRadius: 10,
          padding: "7px 13px 7px 8px",
          cursor: "pointer",
          boxShadow: highlighted
            ? `0 0 0 2px ${color}66, 0 6px 14px rgba(40,24,10,0.45)`
            : "0 4px 10px rgba(40,24,10,0.35)",
          transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
          textAlign: "left",
          opacity: 1,
          transform: highlighted ? "scale(1.08)" : "scale(1)"
        }}
      >
        {lead ? (
          // 로고 배지 — 어두운 원판이라 흰 로고도 컬러 로고도 같이 산다
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#2b2118",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
              flexShrink: 0
            }}
            title={lead.tech}
          >
            <svg viewBox="0 0 24 24" width={19} height={19} aria-hidden="true">
              <path
                d={lead.icon.d}
                {...(lead.icon.stroke
                  ? {
                      fill: "none",
                      stroke: lead.icon.color,
                      strokeWidth: 1.8,
                      strokeLinecap: "round" as const,
                      strokeLinejoin: "round" as const
                    }
                  : {fill: lead.icon.color})}
              />
            </svg>
          </span>
        ) : null}

        <span
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            minWidth: 0
          }}
        >
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#9a6a3c",
              whiteSpace: "nowrap"
            }}
          >
            {building.label}
          </span>
          <strong
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 17,
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#3d2a17",
              whiteSpace: "nowrap",
              // 크림색 판 위 갈색 글씨 — 얇은 밝은 그림자로 각인된 느낌을 준다
              textShadow: "0 1px 0 rgba(255,255,255,0.6)"
            }}
          >
            {building.name}
          </strong>
        </span>

        {live ? (
          // 오늘 활동이 있으면 켜지는 등불. 예전엔 "live bright" 글자였는데
          // 간판에 영어 상태값이 붙으면 다시 HUD로 보인다 — 점 하나로 줄였다.
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 7px ${color}`,
              flexShrink: 0,
              marginLeft: 1
            }}
            title={`오늘 활동 ${buildingState?.light_level}`}
          />
        ) : null}
      </button>
    </Html>
  );
}

// ─── 바닥 링 ──────────────────────────────────────────────────────────────────

// 평상시엔 안 그린다.
//
// 예전엔 꺼진 상태에서도 회청색(#224466) 링을 opacity 0.22로 깔았다. 사이버펑크
// 바닥에선 은은한 홀로그램이었는데, 잔디 위에서는 창백한 흰 고리로 보여서
// 마을 여기저기에 크롭 서클이 27개 떠 있는 꼴이 됐다. 건물이 클릭 가능하다는
// 표시는 앞마당 원반 타일과 커서 변화가 이미 하고 있고, 이제 그림자까지 있어
// 건물이 땅에 붙어 보이므로 이 링은 역할이 없다.
function GroundRing({
  color,
  highlighted,
  radius
}: {
  color: string;
  highlighted: boolean;
  radius: number;
}) {
  if (!highlighted) return null;
  return (
    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.7, radius * 0.76, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.75} />
    </mesh>
  );
}

// ─── 건물 형태들 ──────────────────────────────────────────────────────────────
//
// GLB가 아직 안 들어온 건물의 절차적 대역이다. 지금은 9채가 여기로 그려진다.
//
// ─── metalness 를 전부 0.1 로 내린 이유 ──────────────────────────────────────
// 이 셸들은 사이버펑크 시절 것이라 metalness 가 0.35~0.9 였다. 금속은 확산광을
// 거의 안 내고 **주변 환경을 비추는 것**으로 보이는데, 이 씬에는 환경맵이 없다.
// 반사할 게 없으니 metalness 가 높을수록 그냥 검게 렌더된다. 밝은 잔디 위에서
// 그건 "렌더링 버그처럼 보이는 검은 구멍"이었다 — 실제로 마을 동쪽에 검은
// 상자 네 개가 한 화면에 잡혔다. 만화 톤 마을에 금속 반사는 필요 없다.
// (색 자체도 #0d1a2e 같은 남색이라 constants.ts 쪽에서 회반죽 톤으로 같이 바꿨다.)

/** 타워 — Demotion (Spring Boot 느낌, 유리 고층빌딩) */
function TowerBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      {/* 본체 */}
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={b.color}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.12 : 0}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      {/* 수평 줄 (유리 패널 느낌) */}
      {[0.25, 0.5, 0.75].map(t => (
        <mesh key={t} position={[0, h * t, 0]}>
          <boxGeometry args={[w + 0.06, 0.05, d + 0.06]} />
          <meshBasicMaterial
            color={hl ? b.accentColor : "#0a3a6e"}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      {/* 안테나 */}
      <mesh castShadow position={[0, h + 0.5, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 1.0, 6]} />
        <meshStandardMaterial color="#5b6b7d" metalness={0.1} roughness={0.2} />
      </mesh>
      <mesh position={[0, h + 1.05, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color={b.accentColor} />
      </mesh>
      <PooledLight
        active={hl}
        color={b.accentColor}
        distance={4}
        intensity={1.2}
        position={[0, h * 0.5, 0]}
      />
    </group>
  );
}

/** 라운드 오피스 — MyWave (금융, 부드러운 곡선) */
function OfficeRoundedBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      {/* 메인 원통형 */}
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <cylinderGeometry args={[w * 0.5, w * 0.52, h, 20]} />
        <meshStandardMaterial
          color={b.color}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.1 : 0}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* 글래스 링 */}
      {[0.3, 0.65].map(t => (
        <mesh key={t} position={[0, h * t, 0]}>
          <torusGeometry args={[w * 0.51, 0.04, 8, 32]} />
          <meshBasicMaterial
            color={hl ? b.accentColor : "#004433"}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
      {/* 위쪽 돔 */}
      <mesh castShadow position={[0, h + 0.22, 0]}>
        <sphereGeometry
          args={[w * 0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]}
        />
        <meshStandardMaterial
          color={b.roofColor}
          roughness={0.4}
          metalness={0.1}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.08 : 0}
        />
      </mesh>
      <PooledLight
        active={hl}
        color={b.accentColor}
        distance={3.5}
        intensity={1.0}
        position={[0, h * 0.5, 0]}
      />
    </group>
  );
}

/** 컴팩트 스튜디오 — 일해라 농장주 (게임 스튜디오, 개성 있는 지붕) */
function CompactStudioBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={b.color}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.13 : 0}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* 피라미드 지붕 */}
      <mesh
        castShadow
        position={[0, h + 0.52, 0]}
        rotation={[0, Math.PI / 4, 0]}
      >
        <coneGeometry args={[Math.max(w, d) * 0.78, 1.06, 4]} />
        <meshStandardMaterial
          color={b.roofColor}
          roughness={0.55}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.08 : 0}
        />
      </mesh>
      {/* 간판 */}
      <mesh position={[0, h * 0.7, d / 2 + 0.06]}>
        <boxGeometry args={[w * 0.7, h * 0.22, 0.06]} />
        <meshStandardMaterial
          color="#6b4f35"
          emissive={b.accentColor}
          emissiveIntensity={hl ? 0.35 : 0.12}
          roughness={0.2}
        />
      </mesh>
      <PooledLight
        active={hl}
        color={b.accentColor}
        distance={3}
        intensity={0.9}
        position={[0, h * 0.6, d * 0.6]}
      />
    </group>
  );
}

/** 플랫 허브 — Frontend (가로로 넓은 테크 빌딩) */
function FlatHubBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={b.color}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.1 : 0}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* 유리 파사드 */}
      <mesh position={[0, h * 0.55, d / 2 + 0.03]}>
        <boxGeometry args={[w * 0.85, h * 0.6, 0.04]} />
        <meshStandardMaterial
          color={b.accentColor}
          emissive={b.accentColor}
          emissiveIntensity={hl ? 0.22 : 0.07}
          roughness={0.1}
          transparent
          opacity={0.45}
        />
      </mesh>
      {/* 평지붕 테두리 */}
      <mesh position={[0, h + 0.04, 0]}>
        <boxGeometry args={[w + 0.12, 0.08, d + 0.12]} />
        <meshBasicMaterial
          color={hl ? b.accentColor : "#0a3a6e"}
          transparent
          opacity={0.6}
        />
      </mesh>
      <PooledLight
        active={hl}
        color={b.accentColor}
        distance={4}
        intensity={1.1}
        position={[0, h, d * 0.5]}
      />
    </group>
  );
}

/** 돔 — 3D/Motion (구형 돔 랩) */
function DomeBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h] = b.size;
  const r = w * 0.52;
  return (
    <group>
      {/* 원형 기단 */}
      <mesh castShadow receiveShadow position={[0, h * 0.3, 0]}>
        <cylinderGeometry args={[r, r * 1.08, h * 0.6, 20]} />
        <meshStandardMaterial
          color={b.color}
          roughness={0.45}
          metalness={0.1}
        />
      </mesh>
      {/* 돔 */}
      <mesh castShadow position={[0, h * 0.6 + r * 0.5, 0]}>
        <sphereGeometry args={[r, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial
          color={b.roofColor}
          roughness={0.2}
          metalness={0.1}
          emissive={b.accentColor}
          emissiveIntensity={hl ? 0.18 : 0.05}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* 돔 내부 글로우 구체 */}
      <mesh position={[0, h * 0.6 + 0.1, 0]}>
        <sphereGeometry args={[r * 0.3, 12, 12]} />
        <meshBasicMaterial
          color={b.accentColor}
          transparent
          opacity={hl ? 0.7 : 0.25}
        />
      </mesh>
      <PooledLight
        active={hl}
        color={b.accentColor}
        distance={4.5}
        intensity={1.5}
        position={[0, h * 0.8, 0]}
      />
    </group>
  );
}

/** 서버 타워 — Backend (좁고 높은 서버 빌딩) */
function ServerTowerBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={b.color}
          roughness={0.3}
          metalness={0.1}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.08 : 0}
        />
      </mesh>
      {/* 서버 랙 줄 */}
      {[0.18, 0.36, 0.54, 0.72, 0.88].map(t => (
        <mesh key={t} position={[0, h * t, d / 2 + 0.03]}>
          <boxGeometry args={[w * 0.76, h * 0.06, 0.04]} />
          <meshBasicMaterial
            color={hl && t > 0.5 ? b.accentColor : "#003322"}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
      {/* 냉각 파이프 */}
      {[-w * 0.38, w * 0.38].map(x => (
        <mesh key={x} castShadow position={[x, h + 0.35, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.7, 8]} />
          <meshStandardMaterial
            color="#5b6b7d"
            metalness={0.1}
            roughness={0.2}
          />
        </mesh>
      ))}
      <PooledLight
        active={hl}
        color={b.accentColor}
        distance={3.5}
        intensity={1.0}
        position={[0, h * 0.7, d * 0.6]}
      />
    </group>
  );
}

/** 아케이드 — Game/XR (레트로 게임 센터) */
function ArcadeBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={b.color}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.1 : 0}
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>
      {/* 아치형 입구 */}
      <mesh position={[0, h * 0.35, d / 2 + 0.04]}>
        <cylinderGeometry
          args={[w * 0.28, w * 0.28, h * 0.55, 12, 1, false, 0, Math.PI]}
        />
        <meshStandardMaterial
          color={b.roofColor}
          roughness={0.4}
          emissive={b.accentColor}
          emissiveIntensity={hl ? 0.3 : 0.1}
        />
      </mesh>
      {/* 간판 박스 */}
      <mesh castShadow position={[0, h + 0.3, 0]}>
        <boxGeometry args={[w + 0.3, 0.55, d * 0.4]} />
        <meshStandardMaterial
          color="#7a4a2a"
          emissive={b.accentColor}
          emissiveIntensity={hl ? 0.45 : 0.15}
          roughness={0.2}
        />
      </mesh>
      <PooledLight
        active={hl}
        color={b.accentColor}
        distance={4}
        intensity={1.3}
        position={[0, h * 0.7, d * 0.6]}
      />
    </group>
  );
}

/** 미니멀 오피스 — Workflow (깔끔한 소형 건물) */
function MinimalOfficeBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={b.color}
          roughness={0.35}
          metalness={0.1}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.1 : 0}
        />
      </mesh>
      {/* 평지붕 + 파라펫 */}
      <mesh position={[0, h + 0.07, 0]}>
        <boxGeometry args={[w + 0.15, 0.14, d + 0.15]} />
        <meshStandardMaterial color="#8a8f96" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* 옥상 안테나 그룹 */}
      {[-0.3, 0.3].map(x => (
        <mesh key={x} castShadow position={[x * w, h + 0.45, 0]}>
          <cylinderGeometry args={[0.02, 0.025, 0.6, 6]} />
          <meshStandardMaterial
            color="#6f7a5e"
            metalness={0.1}
            roughness={0.1}
          />
        </mesh>
      ))}
      <PooledLight
        active={hl}
        color={b.accentColor}
        distance={3}
        intensity={0.8}
        position={[0, h, 0]}
      />
    </group>
  );
}

/** 타운하우스 — 경험 건물 (연도별로 크기 다름) */
function TownhouseBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={b.color}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.12 : 0}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>
      {/* 삼각 지붕 */}
      <mesh
        castShadow
        position={[0, h + 0.42, 0]}
        rotation={[0, Math.PI / 4, 0]}
      >
        <coneGeometry args={[Math.max(w, d) * 0.72, 0.85, 4]} />
        <meshStandardMaterial color={b.roofColor} roughness={0.6} />
      </mesh>
      {/* 문 */}
      <mesh position={[0, h * 0.28, d / 2 + 0.012]}>
        <boxGeometry args={[w * 0.3, h * 0.44, 0.04]} />
        <meshStandardMaterial
          color={hl ? "#eef7c6" : b.accentColor}
          roughness={0.55}
        />
      </mesh>
      {/* 창문 */}
      {[-0.28, 0.28].map(x => (
        <mesh key={x} position={[x * w, h * 0.62, d / 2 + 0.02]}>
          <boxGeometry args={[w * 0.2, h * 0.2, 0.04]} />
          <meshStandardMaterial
            color={b.accentColor}
            emissive={b.accentColor}
            emissiveIntensity={hl ? 0.3 : 0.08}
            roughness={0.3}
          />
        </mesh>
      ))}
      <PooledLight
        active={hl}
        color={b.accentColor}
        distance={3}
        intensity={0.8}
        position={[0, h * 0.5, 0]}
      />
    </group>
  );
}

/** 중앙 광장 */
function PlazaBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  return (
    <group>
      <mesh receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.45, 1.6, 0.16, 36]} />
        <meshStandardMaterial color={b.color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.56, 0.66, 0.22, 28]} />
        <meshStandardMaterial color="#7f8ea0" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.35, 24]} />
        <meshStandardMaterial color="#5f6d80" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.24, 18, 18]} />
        <meshStandardMaterial
          color={hl ? "#bdf6ff" : "#aaddee"}
          emissive="#00d4ff"
          emissiveIntensity={hl ? 0.5 : 0.18}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        color="#00d4ff"
        intensity={hl ? 2.0 : 1.0}
        distance={6}
        decay={2}
        position={[0, 1.2, 0]}
      />
    </group>
  );
}

/** 우체국 */
function PostBuilding({b, hl}: {b: BuildingData; hl: boolean}) {
  const [w, h, d] = b.size;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={b.color}
          emissive={hl ? b.accentColor : "#000"}
          emissiveIntensity={hl ? 0.12 : 0}
          roughness={0.6}
        />
      </mesh>
      <mesh
        castShadow
        position={[0, h + 0.44, 0]}
        rotation={[0, Math.PI / 4, 0]}
      >
        <coneGeometry args={[Math.max(w, d) * 0.72, 0.9, 4]} />
        <meshStandardMaterial color={b.roofColor} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[w * 0.44, h + 0.46, d * 0.2]}>
        <cylinderGeometry args={[0.035, 0.045, 0.82, 8]} />
        <meshStandardMaterial color="#8b5a35" roughness={0.66} />
      </mesh>
      <mesh position={[w * 0.58, h + 0.66, d * 0.2]}>
        <boxGeometry args={[0.44, 0.24, 0.035]} />
        <meshStandardMaterial color="#f4f0df" roughness={0.5} />
      </mesh>
      <PooledLight
        active={hl}
        color={b.accentColor}
        distance={3.5}
        intensity={0.9}
        position={[0, h * 0.6, 0]}
      />
    </group>
  );
}

// ─── 메인 Building 컴포넌트 ──────────────────────────────────────────────────

interface BuildingProps {
  building: BuildingData;
  buildingState?: BuildingState;
  isActive: boolean;
  onRequestEnter: (buildingId: string) => void;
  edit?: {
    editing: boolean;
    selected: boolean;
    rotationY: number;
    scale: number;
    onSelectDown: () => void;
  };
}

/**
 * 아직 전용 모델이 없는 건물이 빌려 쓸 민가. 장식물로 받은 세 채를 돌려 쓴다.
 * id 로 고르므로 새로고침해도 같은 건물엔 늘 같은 집이 선다 — 난수로 고르면
 * 들어갔다 나올 때마다 집이 바뀐다.
 */
const FALLBACK_HOUSES = [
  "/models/props/decor/house-a.glb",
  "/models/props/decor/house-b.glb",
  "/models/props/decor/house-c.glb"
];
function fallbackHouse(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return FALLBACK_HOUSES[Math.abs(h) % FALLBACK_HOUSES.length];
}

function BuildingGeometry({b, hl}: {b: BuildingData; hl: boolean}) {
  // 모델이 있으면 상자 대신 그걸 그린다. 경로는 scripts/generate-building-manifest.mjs 가
  // public/models/buildings/<건물id>.glb 를 훑어 만든다 — 건물을 하나 뽑아 넣을 때마다
  // constants.ts 를 손대지 않아도 되도록. glbPath 를 직접 적으면 그쪽이 이긴다.
  const glbPath = b.glbPath ?? buildingModels[b.id];
  if (glbPath)
    return (
      <GlbModel
        glbPath={glbPath}
        size={b.size}
        boost={b.id === "central-plaza" ? 1.45 : 1}
      />
    );

  if (b.kind === "plaza") return <PlazaBuilding b={b} hl={hl} />;

  // ─── 모델이 아직 없는 건물은 **진짜 민가 GLB**를 빌려 쓴다 ───────────────────
  // 처음엔 절차적 민가(상자 + 박공지붕 + 문 + 창)를 그렸다. 흩어져 있을 땐
  // 그럭저럭 넘어갔는데, 구역별로 모으고 주변을 Meshy 건물로 채우고 나니
  // **파스텔 상자 아홉 개**가 정교한 이웃들 사이에서 혼자 튀었다. 조감으로 보면
  // 딱 그 자리만 "안 지은 데"로 읽힌다.
  //
  // 장식용으로 받은 민가 두 채가 이미 있다. 이걸 폴백으로 돌려쓰면 같은 집이
  // 몇 번 나오긴 해도, 적어도 **마을에 속한 집**으로 보인다.
  // 실제 건물 GLB 가 들어오면 위 분기에서 갈라지므로 여기는 저절로 비게 된다.
  //
  // 이 분기 때문에 kind 별 셸(Tower/Dome/Arcade…)과 TownhouseBuilding 은 지금
  // 아무 데서도 안 불린다. 되살릴 계획이 있어서가 아니라 diff 를 키우지 않으려고
  // 남겨 뒀을 뿐이다 — 정리할 때 통째로 지워도 된다(git 에 남아 있다).
  return <GlbModel glbPath={fallbackHouse(b.id)} size={b.size} />;
}

function BuildingImpl({
  building,
  buildingState,
  isActive,
  onRequestEnter,
  edit
}: BuildingProps) {
  const [hovered, setHovered] = useState(false);
  const liveGlow = lightIntensity(buildingState?.light_level);
  const editing = edit?.editing ?? false;
  const isHighlighted = !editing && (hovered || isActive || liveGlow >= 0.65);
  // 예전엔 라벨·연출 높이를 `kind === "plaza" ? 1.0 : h` 로 잡았다. 광장이 원기둥 몇 개짜리
  // 작은 조형물이던 시절의 값인데, central-plaza.glb(4.35유닛 기념비)가 들어오면서
  // 간판이 기념비 안에 파묻혔다. 이제 광장도 다른 건물과 같은 규칙을 쓴다.
  const [, h] = building.size;

  useCursor(hovered || (editing && (edit?.selected ?? false)));

  function handlePointer(event: ThreeEvent<PointerEvent>, next: boolean) {
    event.stopPropagation();
    setHovered(next);
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onRequestEnter(building.id);
  }

  // 배치 회전(광장을 보게 돈 각) 위에 편집기의 임시 회전이 덮는다
  const rotY = edit?.rotationY ?? building.rotationY ?? 0;
  const extraScale = edit?.scale ?? 1;
  const scale = (isHighlighted ? 1.04 : 1) * extraScale;

  // 구역 단차 — 좌표는 constants.ts 그대로 두고 그릴 때만 올린다.
  // **뿌리 group 에서** 올려야 이름표·빛기둥·바닥 링이 통째로 따라온다.
  const [bx, by, bz] = building.position;
  const lift = terrainHeightAt(bx, bz);

  return (
    <group position={[bx, by + lift, bz]} rotation={[0, rotY, 0]}>
      <group
        onClick={editing ? undefined : handleClick}
        onPointerDown={
          editing
            ? e => {
                e.stopPropagation();
                edit?.onSelectDown();
              }
            : undefined
        }
        onPointerEnter={editing ? undefined : e => handlePointer(e, true)}
        onPointerLeave={editing ? undefined : e => handlePointer(e, false)}
        scale={[scale, scale, scale]}
      >
        {editing && edit?.selected ? (
          <>
            <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry
                args={[
                  Math.max(building.size[0], building.size[2]) * 0.9,
                  Math.max(building.size[0], building.size[2]) * 1.02,
                  44
                ]}
              />
              <meshBasicMaterial color="#86b0e6" transparent opacity={0.95} />
            </mesh>
            <SelectionBox size={building.size} />
          </>
        ) : null}
        {/* 포인터 히트박스 (투명). GLB 는 raycast 를 껐으므로 건물을 잡는 유일한
            판정면. GLB 는 앞마당 원반(max(w,d)+1.1)에 대각선을 맞춰 들어오고 높이는
            선언값의 최대 1.6배까지 커지므로 그만큼 넉넉하게 잡는다. */}
        <mesh position={[0, (h * 1.5) / 2, 0]} visible={false}>
          <boxGeometry
            args={[
              Math.max(building.size[0], building.size[2]) + 1.1,
              h * 1.5,
              Math.max(building.size[0], building.size[2]) + 1.1
            ]}
          />
        </mesh>
        <BuildingGeometry b={building} hl={isHighlighted} />
        <GroundRing
          color={building.accentColor}
          highlighted={isHighlighted}
          radius={Math.max(building.size[0], building.size[2])}
        />
        <HighlightFX
          active={isHighlighted}
          color={building.accentColor}
          height={h}
          radius={Math.max(building.size[0], building.size[2])}
        />
        <PooledLight
          active={liveGlow > 0}
          color={building.accentColor}
          distance={4 + liveGlow * 4}
          intensity={liveGlow * 1.8}
          position={[0, h + 0.6, 0]}
        />
      </group>

      <BuildingLabel
        building={building}
        buildingState={buildingState}
        height={h}
        highlighted={isHighlighted}
        onEnter={() => onRequestEnter(building.id)}
      />
    </group>
  );
}

// 무관한 부모(VillageScene) 리렌더에서 안 바뀐 건물의 함수 바디 재실행을 스킵.
export const Building = memo(BuildingImpl);

// 편집 모드 선택 표시 — 후처리 없이 와이어프레임 박스 아웃라인
function SelectionBox({size}: {size: [number, number, number]}) {
  const geo = useMemo(
    () =>
      new EdgesGeometry(
        new BoxGeometry(size[0] * 1.05, size[1] * 1.05, size[2] * 1.05)
      ),
    [size]
  );
  return (
    <lineSegments geometry={geo} position={[0, size[1] / 2, 0]}>
      <lineBasicMaterial color="#86b0e6" transparent opacity={0.9} />
    </lineSegments>
  );
}
